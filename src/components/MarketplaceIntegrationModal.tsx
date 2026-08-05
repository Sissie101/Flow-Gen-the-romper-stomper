import React, { useState } from 'react';
import { Channel } from '../types';
import {
  Store,
  Check,
  Copy,
  Zap,
  Globe,
  Radio,
  Sliders,
  ShieldCheck,
  Code2,
  X,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  Tv,
} from 'lucide-react';

interface MarketplaceIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (newChannel: Channel) => void;
}

export interface MarketplacePreset {
  id: 'amazon_live' | 'whatnot' | 'tiktok_shop' | 'popshop_live' | 'ebay_live' | 'shopify_live' | 'mercado_libre' | 'shopee_live';
  name: string;
  tagline: string;
  badgeColor: string;
  defaultHost: string;
  defaultTitle: string;
  sampleStoreUrl: string;
  webhookPath: string;
  rtmpUrl: string;
  iconName: string;
}

export const MARKETPLACE_PRESETS: MarketplacePreset[] = [
  {
    id: 'amazon_live',
    name: 'Amazon Live',
    tagline: 'Amazon Creator & Brand Storefront Livestreams',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    defaultHost: 'BrandDeals_Official',
    defaultTitle: 'Amazon Prime Day Exclusive Tech Showcase',
    sampleStoreUrl: 'https://amazon.com/live/channel/prime-deals',
    webhookPath: 'https://api.flowgen.io/v1/ingress/amazon_live/wh_amz8921',
    rtmpUrl: 'rtmp://ingress.flowgen.io/live/amz_stream_key',
    iconName: 'Amazon',
  },
  {
    id: 'whatnot',
    name: 'Whatnot',
    tagline: 'Live Auctions & Rare Collectibles Marketplace',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    defaultHost: 'SlabKings_Vintage',
    defaultTitle: 'Grail Pokemon Cards & Vintage Apparel Auction',
    sampleStoreUrl: 'https://whatnot.com/live/slabkings',
    webhookPath: 'https://api.flowgen.io/v1/ingress/whatnot/wh_wn7721',
    rtmpUrl: 'rtmp://ingress.flowgen.io/live/wn_stream_key',
    iconName: 'Whatnot',
  },
  {
    id: 'tiktok_shop',
    name: 'TikTok Shop Live',
    tagline: 'Short-Form Viral Live Commerce Selling',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    defaultHost: 'BeautyGlam_Viral',
    defaultTitle: 'Flash Discount Skincare & Makeup Marathon',
    sampleStoreUrl: 'https://tiktok.com/@beautyglam/live',
    webhookPath: 'https://api.flowgen.io/v1/ingress/tiktok_shop/wh_tt9940',
    rtmpUrl: 'rtmp://ingress.flowgen.io/live/tiktok_stream_key',
    iconName: 'TikTok',
  },
  {
    id: 'shopify_live',
    name: 'Shopify Direct Live',
    tagline: 'Direct-to-Consumer Brand Storefront Streams',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    defaultHost: 'LuxeApparel_Store',
    defaultTitle: 'Autumn Runway Collection & Instant Checkout',
    sampleStoreUrl: 'https://luxeapparel.com/pages/live-shop',
    webhookPath: 'https://api.flowgen.io/v1/ingress/shopify/wh_shp3310',
    rtmpUrl: 'rtmp://ingress.flowgen.io/live/shopify_stream_key',
    iconName: 'Shopify',
  },
  {
    id: 'popshop_live',
    name: 'Popshop Live',
    tagline: 'Boutique Creators & Handmade Goods Commerce',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    defaultHost: 'CraftyArtisan_Studio',
    defaultTitle: 'Limited Edition Hand-Poured Candle Drop',
    sampleStoreUrl: 'https://popshop.live/stream/craftyartisan',
    webhookPath: 'https://api.flowgen.io/v1/ingress/popshop/wh_pop4412',
    rtmpUrl: 'rtmp://ingress.flowgen.io/live/popshop_stream_key',
    iconName: 'Popshop',
  },
  {
    id: 'ebay_live',
    name: 'eBay Live',
    tagline: 'Certified Refurbished & Sports Memorabilia',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    defaultHost: 'eBayRefurbished_Hub',
    defaultTitle: 'Certified Refurbished Laptops & Phone Drop',
    sampleStoreUrl: 'https://ebay.com/live/refurbished-hub',
    webhookPath: 'https://api.flowgen.io/v1/ingress/ebay_live/wh_ebay1190',
    rtmpUrl: 'rtmp://ingress.flowgen.io/live/ebay_stream_key',
    iconName: 'eBay',
  },
];

export function MarketplaceIntegrationModal({
  isOpen,
  onClose,
  onAddChannel,
}: MarketplaceIntegrationModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<MarketplacePreset>(MARKETPLACE_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'quick_connect' | 'webhook_docs' | 'rtmp_ingest'>('quick_connect');
  
  // Custom Form state
  const [streamName, setStreamName] = useState('');
  const [hostName, setHostName] = useState('');
  const [viewers, setViewers] = useState<number>(3500);
  const [botRatioPreset, setBotRatioPreset] = useState<'safe' | 'suspicious' | 'critical_attack'>('safe');
  
  // UI Copy States
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedRtmp, setCopiedRtmp] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(selectedPlatform.webhookPath);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyRtmp = () => {
    navigator.clipboard.writeText(selectedPlatform.rtmpUrl);
    setCopiedRtmp(true);
    setTimeout(() => setCopiedRtmp(false), 2000);
  };

  const handleTestPing = () => {
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const handleSubmitConnect = (e: React.FormEvent) => {
    e.preventDefault();

    const title = streamName.trim() || selectedPlatform.defaultTitle;
    const host = hostName.trim() || selectedPlatform.defaultHost;
    
    // Determine ratio & urgency based on selected preset
    let ratio = 0.92;
    let botProb = 8;
    let urgency = 15;
    let status: Channel['status'] = 'safe';
    let discovery = false;
    let promoMuted = false;
    let cashout = false;

    if (botRatioPreset === 'suspicious') {
      ratio = 0.42;
      botProb = 58;
      urgency = 65;
      status = 'high_risk';
      promoMuted = true;
    } else if (botRatioPreset === 'critical_attack') {
      ratio = 0.22;
      botProb = 78;
      urgency = 89;
      status = 'flagged_and_suppressed';
      discovery = true;
      promoMuted = true;
      cashout = true;
    }

    const currentViewersCount = viewers || 4200;
    const verifiedHumansCount = Math.round(currentViewersCount * ratio);

    const newChannel: Channel = {
      id: `mp-${selectedPlatform.id}-${Date.now().toString().slice(-4)}`,
      name: title,
      host,
      category: 'shopping',
      currentViewers: currentViewersCount,
      verifiedHumans: verifiedHumansCount,
      authorizedRatio: ratio,
      botProbability: botProb,
      urgencyScore: urgency,
      status,
      discoverySuppressed: discovery,
      promotionalMuted: promoMuted,
      cashoutFrozen: cashout,
      isCustomStream: true,
      marketplacePlatform: selectedPlatform.id,
      storeUrl: selectedPlatform.sampleStoreUrl,
    };

    onAddChannel(newChannel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-sans flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wider uppercase text-white font-mono">
                  E-COMMERCE & MARKETPLACE INTEGRATION HUB
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40 uppercase">
                  EASY PLUG & PLAY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Instantly connect Amazon Live, Whatnot, TikTok Shop, Shopify & eBay streams to FlowGen Discriminator.
              </p>
            </div>
          </div>

          <button
            id="btn-close-marketplace-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Marketplace Platform Selector Cards */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-3">
              SELECT MARKETPLACE CONNECTOR PRESET
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MARKETPLACE_PRESETS.map((preset) => {
                const isSelected = selectedPlatform.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(preset);
                      setStreamName('');
                      setHostName('');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.15)]'
                        : 'bg-zinc-950/60 border-white/10 hover:border-white/30 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white font-mono">{preset.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#00FF00]" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mb-2 font-sans">{preset.tagline}</p>
                    </div>
                    <span className={`self-start text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${preset.badgeColor}`}>
                      PRE-CONFIGURED
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Integration Mode Tabs */}
          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('quick_connect')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'quick_connect'
                      ? 'bg-[#00FF00] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-CLICK QUICK CONNECT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('webhook_docs')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'webhook_docs'
                      ? 'bg-[#00FF00] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>WEBHOOK INGEST API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rtmp_ingest')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'rtmp_ingest'
                      ? 'bg-[#00FF00] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>RTMP / HLS STREAM</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse"></span>
                <span>GATEWAY ACTIVE: 12ms LATENCY</span>
              </div>
            </div>

            {/* Tab 1: 1-Click Quick Connect Form */}
            {activeTab === 'quick_connect' && (
              <form onSubmit={handleSubmitConnect} className="space-y-4 bg-zinc-950/80 p-5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00FF00] uppercase">
                  <ShoppingBag className="w-4 h-4" />
                  <span>CONNECT LIVE {selectedPlatform.name.toUpperCase()} FEED TO DISCRIMINATOR</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                      STREAM / EVENT TITLE
                    </label>
                    <input
                      type="text"
                      placeholder={selectedPlatform.defaultTitle}
                      value={streamName}
                      onChange={(e) => setStreamName(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-[#00FF00]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                      MERCHANT / HOST NAME
                    </label>
                    <input
                      type="text"
                      placeholder={selectedPlatform.defaultHost}
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-[#00FF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                      INITIAL CONCURRENT VIEWERS ({viewers.toLocaleString()})
                    </label>
                    <input
                      type="range"
                      min={500}
                      max={25000}
                      step={250}
                      value={viewers}
                      onChange={(e) => setViewers(Number(e.target.value))}
                      className="w-full accent-[#00FF00] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                      INITIAL TRAFFIC INTEGRITY PROFILE
                    </label>
                    <select
                      value={botRatioPreset}
                      onChange={(e) => setBotRatioPreset(e.target.value as any)}
                      className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#00FF00]"
                    >
                      <option value="safe">NORMAL ORGANIC (92% Verified Humans)</option>
                      <option value="suspicious">SUSPICIOUS BOT SWARM (42% Verified Humans)</option>
                      <option value="critical_attack">CRITICAL ATTACK / LOCKDOWN (22% Verified Humans)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <div className="text-[10px] text-zinc-400 font-mono">
                    * Channel will be instantly added to active workspace with automatic Layer 04 Discriminator protection.
                  </div>
                  
                  <button
                    id="btn-confirm-add-marketplace-channel"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>SPAWN {selectedPlatform.name.toUpperCase()} STREAM</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Webhook Docs */}
            {activeTab === 'webhook_docs' && (
              <div className="space-y-4 bg-zinc-950/80 p-5 rounded-xl border border-white/10 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-bold uppercase">PRE-CONFIGURED WEBHOOK ENDPOINT</span>
                  <button
                    onClick={handleCopyWebhook}
                    className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/20 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold cursor-pointer transition-all"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#00FF00]" /> : <Copy className="w-3.5 h-3.5 text-[#00FF00]" />}
                    <span>{copiedWebhook ? 'COPIED URL' : 'COPY WEBHOOK URL'}</span>
                  </button>
                </div>

                <div className="p-3 bg-black rounded-lg border border-white/10 text-[#00FF00] break-all select-all font-mono text-xs">
                  {selectedPlatform.webhookPath}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">SAMPLE EVENT PAYLOAD (HTTP POST)</span>
                  <pre className="p-3 bg-black rounded-lg border border-white/10 text-zinc-300 text-[11px] overflow-x-auto leading-relaxed">
{`{
  "event": "marketplace.livestream.metrics",
  "platform": "${selectedPlatform.id}",
  "stream_id": "live_sp_88912",
  "store_url": "${selectedPlatform.sampleStoreUrl}",
  "merchant": "${selectedPlatform.defaultHost}",
  "metrics": {
    "concurrent_connections": 4200,
    "chat_velocity_per_sec": 48,
    "cashout_intents_per_min": 120
  }
}`}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-zinc-400">HMAC-SHA256 Signature Verification: Supported</span>
                  <button
                    onClick={handleTestPing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-white/20 text-[10px] font-bold cursor-pointer transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testSuccess ? 'text-[#00FF00] animate-spin' : 'text-zinc-400'}`} />
                    <span>{testSuccess ? 'PING RECEIVED 200 OK' : 'TEST SIMULATED PING'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: RTMP Ingest */}
            {activeTab === 'rtmp_ingest' && (
              <div className="space-y-4 bg-zinc-950/80 p-5 rounded-xl border border-white/10 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-bold uppercase">RTMP STREAM INGEST SERVER</span>
                  <button
                    onClick={handleCopyRtmp}
                    className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/20 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold cursor-pointer transition-all"
                  >
                    {copiedRtmp ? <Check className="w-3.5 h-3.5 text-[#00FF00]" /> : <Copy className="w-3.5 h-3.5 text-[#00FF00]" />}
                    <span>{copiedRtmp ? 'COPIED RTMP' : 'COPY RTMP SERVER'}</span>
                  </button>
                </div>

                <div className="p-3 bg-black rounded-lg border border-white/10 text-cyan-400 break-all select-all font-mono text-xs">
                  {selectedPlatform.rtmpUrl}
                </div>

                <div className="p-3 bg-black/50 rounded-lg border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Ingest Protocol:</span>
                    <span className="text-white font-bold">RTMP / SRT / WebRTC HLS</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Latency Target:</span>
                    <span className="text-[#00FF00] font-bold">Ultra-low (&lt; 200ms)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Auto-Discriminator Inspection:</span>
                    <span className="text-emerald-400 font-bold">Enabled (Layer 04 View Inspection)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF00]" />
            <span>FLOWGEN ZERO-TRUST DISCRIMINATOR ENGINE COMPATIBLE</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white font-bold transition-all cursor-pointer"
          >
            CLOSE WIZARD
          </button>
        </div>
      </div>
    </div>
  );
}
