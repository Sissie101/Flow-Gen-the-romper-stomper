import React from 'react';
import { Channel } from '../types';
import { Shield, ShieldAlert, Ban, ZapOff } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
  theme?: 'dark' | 'light';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, isSelected, onSelect, theme = 'dark' }) => {
  const isRed = channel.authorizedRatio < 0.5;
  const isLight = theme === 'light';

  const getMarketplaceBadge = () => {
    if (!channel.marketplacePlatform) return null;
    const labels: Record<string, { label: string; darkColor: string; lightColor: string }> = {
      amazon_live: { label: 'AMAZON LIVE', darkColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30', lightColor: 'bg-amber-100 text-amber-900 border-amber-300' },
      whatnot: { label: 'WHATNOT', darkColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30', lightColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      tiktok_shop: { label: 'TIKTOK SHOP', darkColor: 'bg-rose-950/60 text-rose-300 border-rose-500/30', lightColor: 'bg-rose-100 text-rose-900 border-rose-300' },
      shopify_live: { label: 'SHOPIFY LIVE', darkColor: 'bg-purple-950/60 text-purple-300 border-purple-500/30', lightColor: 'bg-purple-100 text-purple-900 border-purple-300' },
      popshop_live: { label: 'POPSHOP', darkColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30', lightColor: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
      ebay_live: { label: 'EBAY LIVE', darkColor: 'bg-blue-950/60 text-blue-300 border-blue-500/30', lightColor: 'bg-blue-100 text-blue-900 border-blue-300' },
    };
    const info = labels[channel.marketplacePlatform] || { 
      label: channel.marketplacePlatform.toUpperCase(), 
      darkColor: 'bg-zinc-900 text-zinc-300 border-white/20',
      lightColor: 'bg-zinc-100 text-zinc-800 border-zinc-300'
    };
    return (
      <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border tracking-widest ${isLight ? info.lightColor : info.darkColor}`}>
        {info.label}
      </span>
    );
  };

  const getStatusBadge = () => {
    if (channel.status === 'frozen') {
      return (
        <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
          isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950/80 text-rose-400 border-rose-500/35'
        }`}>
          <Ban className="w-2.5 h-2.5" /> WALLET FROZEN
        </span>
      );
    }
    if (channel.status === 'flagged_and_suppressed') {
      return (
        <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
          isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-400 border-amber-500/35'
        }`}>
          <ZapOff className="w-2.5 h-2.5" /> SUPPRESSED
        </span>
      );
    }
    return isRed ? (
      <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
        isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950/80 text-rose-400 border-rose-500/35'
      }`}>
        <ShieldAlert className="w-2.5 h-2.5" /> HIGH RISK
      </span>
    ) : (
      <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
        isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-zinc-900 text-[#00FF00] border-[#00FF00]/30'
      }`}>
        <Shield className={`w-2.5 h-2.5 ${isLight ? 'text-emerald-700' : 'text-[#00FF00]'}`} /> SAFE
      </span>
    );
  };

  const getCategoryColor = () => {
    switch (channel.category) {
      case 'shopping':
        return isLight ? 'text-pink-700 bg-pink-100 border-pink-300' : 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'crypto':
        return isLight ? 'text-amber-800 bg-amber-100 border-amber-300' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'gaming':
        return isLight ? 'text-purple-800 bg-purple-100 border-purple-300' : 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return isLight ? 'text-sky-800 bg-sky-100 border-sky-300' : 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }
  };

  const rawRatio = Number.isFinite(channel.authorizedRatio) ? channel.authorizedRatio : 1;
  const ratioPct = Math.min(100, Math.max(0, Math.round(rawRatio * 100)));

  return (
    <div
      id={`channel-card-${channel.id}`}
      onClick={onSelect}
      className={`group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? isLight
            ? 'bg-white border-emerald-600 shadow-[0_0_15px_rgba(22,163,74,0.25)] ring-2 ring-emerald-500/20'
            : 'bg-zinc-900/90 border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.1)] ring-1 ring-[#00FF00]/20'
          : isLight
          ? 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-md'
          : 'bg-black border-white/10 hover:border-white/30 hover:bg-zinc-950'
      }`}
    >
      {/* Decorative pulse for active live stream */}
      {!isRed && (
        <div className="absolute top-5 right-5 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLight ? 'bg-emerald-500' : 'bg-[#00FF00]'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isLight ? 'bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.6)]' : 'bg-[#00FF00] shadow-[0_0_8px_#00FF00]'}`}></span>
          </span>
        </div>
      )}

      {isRed && (
        <div className="absolute top-5 right-5 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-widest font-mono ${getCategoryColor()}`}>
            {channel.category}
          </span>
          {getMarketplaceBadge()}
          {getStatusBadge()}
        </div>

        <div>
          <h3 className={`text-base font-black tracking-tight uppercase transition-colors ${
            isLight ? 'text-zinc-900 group-hover:text-emerald-700' : 'text-white group-hover:text-[#00FF00]'
          }`}>
            {channel.name}
          </h3>
          <p className={`text-xs font-mono font-medium mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>
            HOST: {channel.host.toUpperCase()}
          </p>
        </div>

        {/* Auth Viewer Ratio Gauge */}
        <div className="mt-1">
          <div className="flex justify-between text-[11px] mb-1.5 font-mono">
            <span className={`uppercase font-bold tracking-wider text-[10px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>AUTH RATIO</span>
            <span className={`font-black ${isRed ? (isLight ? 'text-rose-700' : 'text-rose-400') : (isLight ? 'text-emerald-700' : 'text-[#00FF00]')}`}>
              {ratioPct}%
            </span>
          </div>
          <div className={`w-full h-1.5 rounded overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
            <div
              className={`h-full rounded transition-all duration-500 ${
                isRed ? 'bg-rose-500' : isLight ? 'bg-emerald-600' : 'bg-[#00FF00]'
              }`}
              style={{ width: `${ratioPct}%` }}
            />
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className={`grid grid-cols-2 gap-2 mt-2 pt-3 border-t text-[10px] font-mono ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
          <div>
            <span className={`uppercase block tracking-wider font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>TOTAL VIEWERS</span>
            <span className={`font-bold ${isLight ? 'text-zinc-900 font-semibold' : 'text-zinc-200'}`}>
              {channel.currentViewers.toLocaleString()}
            </span>
          </div>
          <div>
            <span className={`uppercase block tracking-wider font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>VERIFIED HUMANS</span>
            <span className={`font-bold ${isLight ? 'text-zinc-900 font-semibold' : 'text-zinc-200'}`}>
              {channel.verifiedHumans.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Safeguards Summary */}
        {(channel.discoverySuppressed || channel.promotionalMuted || channel.cashoutFrozen) && (
          <div className={`flex items-center gap-1.5 mt-2 text-[9px] p-2 rounded border font-mono ${
            isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-950 border-white/5 text-zinc-400'
          }`}>
            <span className={`font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>SAFEGUARDS:</span>
            <div className="flex gap-1">
              {channel.discoverySuppressed && (
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase border ${
                  isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-400 border-amber-900/20'
                }`} title="Discovery Feed Suppressed">
                  FEED
                </span>
              )}
              {channel.promotionalMuted && (
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase border ${
                  isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-400 border-amber-900/20'
                }`} title="Promotional Push Notifications Blocked">
                  PUSH
                </span>
              )}
              {channel.cashoutFrozen && (
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase border ${
                  isLight ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-950/60 text-rose-400 border-rose-900/20'
                }`} title="Cashout Feature Frozen">
                  CASH
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
