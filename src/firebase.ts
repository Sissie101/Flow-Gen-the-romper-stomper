import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Security / Operation Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection to verify Firestore availability
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running offline or connecting...');
      return false;
    }
    // Any other response means server reached
    return true;
  }
}

// User Sign In with Google Popup
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Save or update user document in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(
        userRef,
        {
          userId: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Creator User',
          role: 'admin',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return result.user;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

// User Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Sync Channel to User's Firestore
export async function saveChannelToFirestore(userId: string, channel: any): Promise<void> {
  const path = `users/${userId}/channels/${channel.id}`;
  try {
    const channelRef = doc(db, 'users', userId, 'channels', channel.id);
    await setDoc(channelRef, {
      id: channel.id,
      ownerId: userId,
      title: channel.name || channel.title || 'Audited Channel',
      platform: channel.platform || 'whatnot',
      totalViews: Number(channel.viewers || channel.totalViews || 0),
      authenticatedViewers: Number(channel.authenticatedViewers || 0),
      hypeScore: Number(channel.hypeScore !== undefined ? (channel.hypeScore > 1 ? channel.hypeScore / 100 : channel.hypeScore) : 0.5),
      status: channel.status || 'normal',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save Solo Marketing Campaign
export async function saveCampaignToFirestore(
  userId: string,
  campaign: {
    id: string;
    campaignName: string;
    targetAudience?: string;
    generatedCopy: string;
    category: string;
  }
): Promise<void> {
  const path = `users/${userId}/campaigns/${campaign.id}`;
  try {
    const campaignRef = doc(db, 'users', userId, 'campaigns', campaign.id);
    await setDoc(campaignRef, {
      id: campaign.id,
      ownerId: userId,
      campaignName: campaign.campaignName,
      targetAudience: campaign.targetAudience || 'Buyers & Chatters',
      generatedCopy: campaign.generatedCopy,
      category: campaign.category,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
