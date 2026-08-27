import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  User as UserIcon,
  RefreshCw,
  ExternalLink,
  Shield,
  HelpCircle,
  FolderOpen,
  DollarSign,
  Copy,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  testConnection,
  saveChannelToFirestore,
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Channel, ThemeMode } from '../types';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  theme?: ThemeMode;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  channels,
  theme = 'dark',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedDbId, setCopiedDbId] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    testConnection().then((ok) => setIsConnected(ok));

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleSyncToFirestore = async () => {
    if (!currentUser) {
      alert('Please sign in with Google first to sync your data to your private Firestore collection.');
      return;
    }
    setIsSyncing(true);
    setSyncSuccess(null);
    try {
      for (const ch of channels) {
        await saveChannelToFirestore(currentUser.uid, ch);
      }
      setSyncSuccess(`Successfully synced ${channels.length} channels to Cloud Firestore!`);
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncSuccess('Error syncing to Firestore. Check security rules or quota.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(firebaseConfig.projectId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  const handleCopyDbId = () => {
    navigator.clipboard.writeText(firebaseConfig.firestoreDatabaseId).then(() => {
      setCopiedDbId(true);
      setTimeout(() => setCopiedDbId(false), 2000);
    });
  };

  return (
    <div
      id="firebase-sync-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="firebase-sync-modal-content"
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          theme === 'light' ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-white/20 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'light' ? 'bg-zinc-100/90 border-zinc-200' : 'bg-zinc-900/90 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black uppercase tracking-wider flex items-center gap-2">
                FIREBASE FIRESTORE & AUTH INTEGRATION
              </h2>
              <p className={`text-[11px] font-mono ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Cloud persistence, Google Auth, and Google Cloud Project details
              </p>
            </div>
          </div>
          <button
            id="btn-close-firebase-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Status & Connection Card */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              theme === 'light' ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-black uppercase text-amber-400">
                  Firebase Cloud Provisioned & Active
                </span>
              </div>
              <p className={`text-xs ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Connected to project <strong className="font-mono text-amber-300">{firebaseConfig.projectId}</strong> in region <strong className="font-mono">us-west2</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-bold">{currentUser.displayName || 'Signed In'}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Publishing & Billing Setup Guide Box */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>How to Find this App for Billing & Publishing</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                Help & Instructions
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'}`}>
              If you are linking a <strong>Google Cloud Billing Account</strong> or upgrading in Firebase/Google Cloud Console, the app appears under its <strong>Google Cloud Project ID</strong>:
            </p>

            <div className="space-y-2">
              {/* Project ID Box */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs ${
                  theme === 'light' ? 'bg-white border-zinc-300' : 'bg-zinc-950 border-white/15'
                }`}
              >
                <div>
                  <span className="text-zinc-500 text-[10px] block uppercase">Google Cloud Project ID (Search this in Billing list)</span>
                  <span className="font-bold text-amber-400 select-all">{firebaseConfig.projectId}</span>
                </div>
                <button
                  onClick={handleCopyProjectId}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              {/* Firestore Database ID */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs ${
                  theme === 'light' ? 'bg-white border-zinc-300' : 'bg-zinc-950 border-white/15'
                }`}
              >
                <div>
                  <span className="text-zinc-500 text-[10px] block uppercase">Firestore Database ID</span>
                  <span className="font-bold text-emerald-400 select-all">{firebaseConfig.firestoreDatabaseId}</span>
                </div>
                <button
                  onClick={handleCopyDbId}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedDbId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDbId ? 'Copied' : 'Copy DB ID'}</span>
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-lg text-xs space-y-1.5 ${theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-950/80 text-zinc-400'}`}>
              <p className="font-bold text-zinc-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Step-by-step to link billing:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Go to <strong>Google Cloud Console &gt; Billing &gt; Link a Project</strong>.</li>
                <li>In the Project dropdown, paste <code>{firebaseConfig.projectId}</code> into the search box.</li>
                <li>Select your billing account and confirm. Your app and Firestore quotas will instantly become unrestricted.</li>
              </ol>
            </div>
          </div>

          {/* Sync Action Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync Local Streams & Data to Firestore</span>
            </h3>

            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
              }`}
            >
              <div>
                <p className="text-xs font-bold">Cloud Sync Channel Audits</p>
                <p className={`text-[11px] ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Sync your {channels.length} active channels and metric thresholds to Firestore under your private UID.
                </p>
                {syncSuccess && (
                  <p className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {syncSuccess}
                  </p>
                )}
              </div>
              <button
                onClick={handleSyncToFirestore}
                disabled={isSyncing || !currentUser}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  !currentUser
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : isSyncing
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
            theme === 'light' ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-white/10 text-zinc-400'
          }`}
        >
          <span className="text-[11px] text-zinc-500">
            Rules deployed & secure via Attribute-Based Access Control (ABAC).
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold font-mono text-xs border cursor-pointer ${
              theme === 'light'
                ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border-zinc-300'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/10'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
