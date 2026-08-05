import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Zap,
  Users,
  Bot,
  EyeOff,
  Wallet,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  X,
  Store,
  MessageSquare,
  Activity,
  Sparkles,
  Layers,
  BellOff,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

interface SystemOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMarketplace?: () => void;
}

export function SystemOverviewModal({
  isOpen,
  onClose,
  onOpenMarketplace,
}: SystemOverviewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bouncer' | 'autolock' | 'marketplaces'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-4xl bg-[#090a0f] border border-white/20 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wider uppercase text-white font-mono">
                  HOW FLOWGEN WORKS (IN PLAIN ENGLISH)
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40 uppercase">
                  BEGINNER GUIDE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                A simple guide to understanding FlowGen's anti-bot defense and live-stream protection systems.
              </p>
            </div>
          </div>

          <button
            id="btn-close-systems-guide-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-zinc-950/60 overflow-x-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. THE BIG PICTURE</span>
          </button>

          <button
            onClick={() => setActiveTab('bouncer')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bouncer'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>2. THE DIGITAL BOUNCER</span>
          </button>

          <button
            onClick={() => setActiveTab('autolock')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'autolock'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>3. AUTOMATIC BRAKES & LOCKS</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplaces')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'marketplaces'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>4. MARKETPLACE CONNECTORS</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: THE BIG PICTURE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Problem statement vs Solution banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    <span>THE PROBLEM: FAKE BOT TRAFFIC</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Bad actors send thousands of automated fake viewers (bots) to live streams to fake popularity, steal promotional rewards, or trick advertisers and buyers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#00FF00]/10 border border-[#00FF00]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#00FF00] font-mono font-bold text-xs uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>FLOWGEN SOLUTION: ZERO-TRUST DISCRIMINATOR</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    FlowGen sits in front of live streams like an intelligent security radar. It verifies real humans in milliseconds and freezes fraud automatically before money is lost.
                  </p>
                </div>
              </div>

              {/* 4 Core Pillars Grid */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  CORE DEFENSE SYSTEMS AT A GLANCE
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-[#00FF00]">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono text-white">1. Real-Human Discriminator</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Calculates the exact ratio of real people vs. automated bots watching a stream.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono text-white">2. Automatic Security Lock</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Instantly locks cashouts and hides compromised streams when bot attacks cross risk limits.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono text-white">3. Chat Spam Auditor</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Inspects chat messages in real-time to catch copy-pasted bot spam and malicious links.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Store className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono text-white">4. E-Commerce Connectors</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Plug-and-play connections for Amazon Live, Whatnot, TikTok Shop, Shopify, and eBay.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-zinc-300 font-sans">
                  Want to connect your Amazon Live, Whatnot, or TikTok Shop stream?
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenMarketplace) onOpenMarketplace();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-mono font-bold text-xs uppercase cursor-pointer transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,0,0.2)]"
                >
                  <Store className="w-4 h-4" />
                  <span>OPEN MARKETPLACE CONNECTOR HUB</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: THE DIGITAL BOUNCER */}
          {activeTab === 'bouncer' && (
            <div className="space-y-5">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-[#00FF00] font-mono font-bold text-xs">
                  <Bot className="w-5 h-5" />
                  <span>HOW THE DISCRIMINATOR SEPARATES HUMANS FROM BOTS</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Think of FlowGen like a bouncer at a stadium entrance checking every ticket holder. As viewers tune into a stream, FlowGen inspects:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-black rounded-lg border border-white/10 text-xs space-y-1">
                    <span className="text-[#00FF00] font-mono font-bold block">1. Interaction Speed</span>
                    <p className="text-zinc-400 text-[11px]">Bots comment every 0.2 seconds in identical cadence. Real humans pause and type naturally.</p>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-white/10 text-xs space-y-1">
                    <span className="text-[#00FF00] font-mono font-bold block">2. Device & Network ID</span>
                    <p className="text-zinc-400 text-[11px]">Bots often arrive from thousands of identical cloud IPs. Humans connect from real phones & browsers.</p>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-white/10 text-xs space-y-1">
                    <span className="text-[#00FF00] font-mono font-bold block">3. Purchase Intent</span>
                    <p className="text-zinc-400 text-[11px]">Real humans add items to cart and click products. Fake bots just lurk to pad viewer counts.</p>
                  </div>
                </div>
              </div>

              {/* Status color guide */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                  UNDERSTANDING STATUS COLOURS
                </h4>

                <div className="space-y-2">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#00FF00]"></span>
                      <span className="text-xs font-bold text-white font-mono">GREEN: VERIFIED SECURE</span>
                    </div>
                    <span className="text-xs text-zinc-300 font-mono">&gt; 50% Verified Humans (Normal Traffic)</span>
                  </div>

                  <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-white font-mono">RED: HIGH RISK FRAUD</span>
                    </div>
                    <span className="text-xs text-rose-300 font-mono">&lt; 50% Verified Humans (Bot Swarm Attack)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOMATIC BRAKES & LOCKS */}
          {activeTab === 'autolock' && (
            <div className="space-y-5">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs">
                  <Lock className="w-5 h-5 text-rose-400" />
                  <span>THE THREE AUTOMATIC SECURITY BRAKES</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  When a stream crosses critical threat thresholds, FlowGen turns on three automatic safeguards to protect creators, brands, and platforms:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-black rounded-xl border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                      <EyeOff className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white font-mono uppercase">1. DISCOVERY SUPPRESSION</h5>
                      <p className="text-xs text-zinc-400">
                        Automatically removes the stream from main homepage search feeds so bots cannot artificially rank the stream #1.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-black rounded-xl border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <BellOff className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white font-mono uppercase">2. PROMOTIONAL MUTING</h5>
                      <p className="text-xs text-zinc-400">
                        Stops push notifications and automated coupon giveaways from sending out to fake bot accounts.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-black rounded-xl border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white font-mono uppercase">3. CASHOUT FREEZE (SECURITY LOCK)</h5>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold uppercase">
                          VISUAL LOCK ICON
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Puts payout withdrawals on temporary security lock. When locked, a prominent glowing Lock Icon appears on the stream banner until human traffic recovers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MARKETPLACE CONNECTORS */}
          {activeTab === 'marketplaces' && (
            <div className="space-y-5">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                  <Store className="w-5 h-5" />
                  <span>PLUG & PLAY E-COMMERCE INTEGRATION</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  FlowGen is built to work seamlessly with live shopping and marketplace platforms. You don't need complex engineering—just copy a webhook URL or select a pre-configured channel:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-black rounded-lg border border-amber-500/30 text-xs">
                    <span className="text-amber-400 font-mono font-bold block mb-1">Amazon Live</span>
                    <span className="text-[10px] text-zinc-400">Prime Deals & Brand Storefronts</span>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-emerald-500/30 text-xs">
                    <span className="text-emerald-400 font-mono font-bold block mb-1">Whatnot</span>
                    <span className="text-[10px] text-zinc-400">Live Auctions & Collectibles</span>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-rose-500/30 text-xs">
                    <span className="text-rose-400 font-mono font-bold block mb-1">TikTok Shop</span>
                    <span className="text-[10px] text-zinc-400">Viral Short-Form Live Commerce</span>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-purple-500/30 text-xs">
                    <span className="text-purple-400 font-mono font-bold block mb-1">Shopify Live</span>
                    <span className="text-[10px] text-zinc-400">Direct-to-Consumer Brands</span>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-blue-500/30 text-xs">
                    <span className="text-blue-400 font-mono font-bold block mb-1">eBay Live</span>
                    <span className="text-[10px] text-zinc-400">Certified Refurbished & Tech</span>
                  </div>

                  <div className="p-3 bg-black rounded-lg border border-cyan-500/30 text-xs">
                    <span className="text-cyan-400 font-mono font-bold block mb-1">Popshop Live</span>
                    <span className="text-[10px] text-zinc-400">Handmade & Boutique Creators</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-center">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenMarketplace) onOpenMarketplace();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-mono font-extrabold text-xs uppercase cursor-pointer shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all flex items-center gap-2"
                  >
                    <Store className="w-4 h-4" />
                    <span>LAUNCH MARKETPLACE CONNECTOR WIZARD</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF00]" />
            <span>FLOWGEN DISCRIMINATOR ENGINE V4.8 ACTIVE</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white font-bold transition-all cursor-pointer"
          >
            GOT IT, CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
}
