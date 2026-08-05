import { Channel, ChatMessage, AuditLog, HistoryPoint } from './types';

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-1',
    name: 'MegaSave Flash Deals',
    host: 'Chaz & Brenda',
    category: 'shopping',
    currentViewers: 4800,
    verifiedHumans: 1350,
    authorizedRatio: 0.28,
    botProbability: 72,
    urgencyScore: 88,
    status: 'flagged_and_suppressed',
    discoverySuppressed: true,
    promotionalMuted: true,
    cashoutFrozen: true,
    marketplacePlatform: 'amazon_live',
    storeUrl: 'https://amazon.com/live/megasave',
  },
  {
    id: 'ch-2',
    name: 'DexGem Crypto Launchpad',
    host: 'CryptoChad',
    category: 'crypto',
    currentViewers: 9200,
    verifiedHumans: 1950,
    authorizedRatio: 0.21,
    botProbability: 79,
    urgencyScore: 65,
    status: 'frozen',
    discoverySuppressed: true,
    promotionalMuted: true,
    cashoutFrozen: true,
  },
  {
    id: 'ch-3',
    name: 'Astro Run: No-Hit Speedrun',
    host: 'Astro_Gamer',
    category: 'gaming',
    currentViewers: 1250,
    verifiedHumans: 1180,
    authorizedRatio: 0.94,
    botProbability: 6,
    urgencyScore: 10,
    status: 'safe',
    discoverySuppressed: false,
    promotionalMuted: false,
    cashoutFrozen: false,
  },
  {
    id: 'ch-4',
    name: 'The Daily Perspective',
    host: 'Marla Vox',
    category: 'alternative',
    currentViewers: 3400,
    verifiedHumans: 3150,
    authorizedRatio: 0.92,
    botProbability: 8,
    urgencyScore: 15,
    status: 'safe',
    discoverySuppressed: false,
    promotionalMuted: false,
    cashoutFrozen: false,
  },
  {
    id: 'ch-5',
    name: 'Aura Cosmetics Masterclass',
    host: 'Elena Bloom',
    category: 'shopping',
    currentViewers: 2100,
    verifiedHumans: 1980,
    authorizedRatio: 0.94,
    botProbability: 5,
    urgencyScore: 35,
    status: 'safe',
    discoverySuppressed: false,
    promotionalMuted: false,
    cashoutFrozen: false,
    marketplacePlatform: 'shopify_live',
    storeUrl: 'https://auracosmetics.com/live',
  },
  {
    id: 'ch-6',
    name: 'Whatnot Rare Sneaker Vault',
    host: 'KicksCollector_99',
    category: 'shopping',
    currentViewers: 6300,
    verifiedHumans: 2140,
    authorizedRatio: 0.34,
    botProbability: 66,
    urgencyScore: 82,
    status: 'flagged_and_suppressed',
    discoverySuppressed: true,
    promotionalMuted: true,
    cashoutFrozen: true,
    marketplacePlatform: 'whatnot',
    storeUrl: 'https://whatnot.com/live/rare-sneakers',
  },
  {
    id: 'ch-7',
    name: 'TikTok Shop Viral Gadgets',
    host: 'TechTrendz Live',
    category: 'shopping',
    currentViewers: 11400,
    verifiedHumans: 3990,
    authorizedRatio: 0.35,
    botProbability: 65,
    urgencyScore: 78,
    status: 'high_risk',
    discoverySuppressed: false,
    promotionalMuted: true,
    cashoutFrozen: false,
    marketplacePlatform: 'tiktok_shop',
    storeUrl: 'https://tiktok.com/@techtrendz/live',
  },
  {
    id: 'ch-8',
    name: 'eBay Refurbished Tech Drop',
    host: 'eBay Outlet Official',
    category: 'shopping',
    currentViewers: 3800,
    verifiedHumans: 3420,
    authorizedRatio: 0.90,
    botProbability: 10,
    urgencyScore: 24,
    status: 'safe',
    discoverySuppressed: false,
    promotionalMuted: false,
    cashoutFrozen: false,
    marketplacePlatform: 'ebay_live',
    storeUrl: 'https://ebay.com/live/outlet-drop',
  },
  {
    id: 'ch-9',
    name: 'Popshop Handmade Artisan Studio',
    host: 'CraftyClara',
    category: 'shopping',
    currentViewers: 1450,
    verifiedHumans: 1390,
    authorizedRatio: 0.95,
    botProbability: 4,
    urgencyScore: 12,
    status: 'safe',
    discoverySuppressed: false,
    promotionalMuted: false,
    cashoutFrozen: false,
    marketplacePlatform: 'popshop_live',
    storeUrl: 'https://popshop.live/stream/craftyclara',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // MegaSave Flash Deals (ch-1)
  {
    id: 'msg-1-1',
    channelId: 'ch-1',
    sender: 'user_x92',
    isVerified: false,
    content: 'OMG ONLY 5 LEFT AT THIS PRICE!!! BUY NOW OR CRY LATER!!! 🚨🚨',
    timestamp: '02:20:15',
    suspiciousnessScore: 0.95,
    flaggedReason: 'High-pressure Urgency Trigger',
  },
  {
    id: 'msg-1-2',
    channelId: 'ch-1',
    sender: 'shipping_fanatic',
    isVerified: true,
    content: 'Do you ship to Germany? Thanks!',
    timestamp: '02:20:30',
    suspiciousnessScore: 0.05,
    flaggedReason: null,
  },
  {
    id: 'msg-1-3',
    channelId: 'ch-1',
    sender: 'guest_8829',
    isVerified: false,
    content: 'BEST PRODUCT EVER I GOT 10 BOXES!!! 🚀🚀🚀',
    timestamp: '02:21:02',
    suspiciousnessScore: 0.90,
    flaggedReason: 'Artificial Engagement Spam',
  },
  {
    id: 'msg-1-4',
    channelId: 'ch-1',
    sender: 'clara_m',
    isVerified: true,
    content: 'Is this the genuine leather version or synthetic?',
    timestamp: '02:21:40',
    suspiciousnessScore: 0.02,
    flaggedReason: null,
  },
  {
    id: 'msg-1-5',
    channelId: 'ch-1',
    sender: 'guest_8829',
    isVerified: false,
    content: 'BEST PRODUCT EVER I GOT 10 BOXES!!! 🚀🚀🚀',
    timestamp: '02:21:55',
    suspiciousnessScore: 0.98,
    flaggedReason: 'Duplicate Message (Spam Loop)',
  },

  // DexGem Crypto Launchpad (ch-2)
  {
    id: 'msg-2-1',
    channelId: 'ch-2',
    sender: 'crypto_bobby',
    isVerified: false,
    content: 'TO THE MOON!!! JOIN TELEGRAM NOW FOR 100x!!! 🚀💰 👉 http://fake-dex.net',
    timestamp: '02:18:10',
    suspiciousnessScore: 0.99,
    flaggedReason: 'Phishing / Bot Promotional Spam',
  },
  {
    id: 'msg-2-2',
    channelId: 'ch-2',
    sender: 'hodl_lord',
    isVerified: true,
    content: 'What is the total token supply and vesting schedule?',
    timestamp: '02:18:45',
    suspiciousnessScore: 0.10,
    flaggedReason: null,
  },
  {
    id: 'msg-2-3',
    channelId: 'ch-2',
    sender: 'bot_shill_001',
    isVerified: false,
    content: 'Wow this project is backed by top VCs, so glad we are early!',
    timestamp: '02:19:00',
    suspiciousnessScore: 0.75,
    flaggedReason: 'Suspicious Sentiment Inflator',
  },
  {
    id: 'msg-2-4',
    channelId: 'ch-2',
    sender: 'bot_shill_002',
    isVerified: false,
    content: 'Wow this project is backed by top VCs, so glad we are early!',
    timestamp: '02:19:05',
    suspiciousnessScore: 0.96,
    flaggedReason: 'Identical Peer Copy (Cluster Attack)',
  },

  // Astro Run (ch-3)
  {
    id: 'msg-3-1',
    channelId: 'ch-3',
    sender: 'twitch_lurker',
    isVerified: true,
    content: 'That jump on level 4 was clean! GG',
    timestamp: '02:22:10',
    suspiciousnessScore: 0.05,
    flaggedReason: null,
  },
  {
    id: 'msg-3-2',
    channelId: 'ch-3',
    sender: 'speedy_boy',
    isVerified: true,
    content: 'Are you going for the WR today or just practice?',
    timestamp: '02:22:35',
    suspiciousnessScore: 0.02,
    flaggedReason: null,
  },

  // The Daily Perspective (ch-4)
  {
    id: 'msg-4-1',
    channelId: 'ch-4',
    sender: 'rational_mind',
    isVerified: true,
    content: 'Interesting point on the housing market metrics.',
    timestamp: '02:23:01',
    suspiciousnessScore: 0.08,
    flaggedReason: null,
  },
  {
    id: 'msg-4-2',
    channelId: 'ch-4',
    sender: 'listener_99',
    isVerified: true,
    content: 'I agree, the inflation numbers seem lagging.',
    timestamp: '02:23:24',
    suspiciousnessScore: 0.04,
    flaggedReason: null,
  },

  // Aura Cosmetics (ch-5)
  {
    id: 'msg-5-1',
    channelId: 'ch-5',
    sender: 'makeup_chic',
    isVerified: true,
    content: 'Which brush did you use for the blending?',
    timestamp: '02:24:12',
    suspiciousnessScore: 0.01,
    flaggedReason: null,
  },
  {
    id: 'msg-5-2',
    channelId: 'ch-5',
    sender: 'guest_4492',
    isVerified: false,
    content: 'BUY THE PALETTE BEFORE SELLING OUT!!! ONLY FEW MINUTES!!!',
    timestamp: '02:24:45',
    suspiciousnessScore: 0.65,
    flaggedReason: 'Mild Urgency Flag',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    channelId: 'ch-1',
    timestamp: '02:15:00',
    type: 'anomaly_detected',
    detail: 'Sudden spike of +3,200 connections from unauthenticated mobile web browsers within 30 seconds.',
    actionTaken: 'Flagged connection cluster for verification audit.',
    severity: 'high',
  },
  {
    id: 'log-2',
    channelId: 'ch-1',
    timestamp: '02:15:30',
    type: 'safeguard_triggered',
    detail: 'Authorized Viewer Ratio fell to 28% (Threshold: 50%). Bot probability calculated at 72%.',
    actionTaken: 'Triggered Discovery Supression, promotional push muted, and instant cashout features frozen.',
    severity: 'critical',
  },
  {
    id: 'log-3',
    channelId: 'ch-2',
    timestamp: '02:10:00',
    type: 'anomaly_detected',
    detail: 'High concentration of concurrent connections originating from a single VPN datacenter subnet.',
    actionTaken: 'Marked 4,500 active views as suspicious unverified sessions.',
    severity: 'high',
  },
  {
    id: 'log-4',
    channelId: 'ch-2',
    timestamp: '02:10:45',
    type: 'cashout_frozen',
    detail: 'Authorized Viewer Ratio crashed to 21%. Automated system locked the merchant cashout engine.',
    actionTaken: 'Cashout wallet frozen. Live verification log audit requested.',
    severity: 'critical',
  },
  {
    id: 'log-5',
    channelId: 'ch-3',
    timestamp: '02:00:00',
    type: 'status_restored',
    detail: 'Authorized Viewer Ratio stable at 94% with 98% human-logged active sessions.',
    actionTaken: 'Stream verified safe. Discovery rank remains normal.',
    severity: 'low',
  },
];

// Helper to generate realistic historical graphs
export function generateHistory(currentViewers: number, verifiedHumans: number): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const now = new Date();
  
  // Baseline viewers: for high-risk streams with bot spikes, organic baseline is around verified humans * 1.15.
  // For normal organic streams, baseline matches current viewer levels.
  const isSpiked = currentViewers > verifiedHumans * 1.8;
  const organicBaselineTotal = isSpiked ? Math.round(verifiedHumans * 1.18) : currentViewers;
  const organicBaselineHumans = Math.round(organicBaselineTotal * 0.88);

  for (let i = 9; i >= 0; i--) {
    const timePast = new Date(now.getTime() - i * 60 * 1000);
    const timeStr = timePast.toTimeString().split(' ')[0].substring(0, 5);
    
    // Add some noise to make graphs look natural
    const noiseFactor = 1 + (Math.random() * 0.1 - 0.05);
    const viewCount = Math.round(currentViewers * noiseFactor);
    const humanCount = Math.round(verifiedHumans * (noiseFactor + (Math.random() * 0.04 - 0.02)));
    
    const baseNoise = 1 + (Math.random() * 0.06 - 0.03);
    const baseTotal = Math.round(organicBaselineTotal * baseNoise);
    const baseHumans = Math.round(organicBaselineHumans * baseNoise);

    points.push({
      time: timeStr,
      viewers: Math.max(viewCount, humanCount),
      verifiedHumans: Math.min(humanCount, viewCount),
      baselineViewers: Math.max(baseTotal, baseHumans),
      baselineVerifiedHumans: Math.min(baseHumans, baseTotal),
    });
  }
  
  return points;
}

export const SAMPLE_CHAT_TEMPLATES_BOT = [
  "🚨 PRICE DROPPING FAST! CLlCK HERE TO SECURE YOURS!",
  "BUY 5 GET 2 FREE!!! GO GO GO!!!",
  "Unreal quality, almost gone!!!",
  "AMAZING OFFER GUYS I RECEIVED MINE IN 2 DAYS!",
  "FASTEST SHIPMENT EVER!!! DONT MISS OUT!",
  "WOW I can't believe this is so cheap!! buying 3 more",
  "Is anyone else seeing this deal?! Absolute steal!!",
  "Grabbed mine! Best stream discount today!"
];

export const SAMPLE_CHAT_TEMPLATES_HUMAN = [
  "Does it support USB-C charging?",
  "What is the warranty policy on this product?",
  "Looks nice, is it waterproof?",
  "Can you show the back of the device again?",
  "How long is the livestream today?",
  "Just joined, what are we looking at?",
  "The screen looks super crisp.",
  "Is there a coupon code we can apply?"
];
