import React from 'react';
import { Channel } from '../types';
import { Shield, ShieldAlert, Ban, ZapOff } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, isSelected, onSelect }) => {
  const isRed = channel.authorizedRatio < 0.5;

  const getMarketplaceBadge = () => {
    if (!channel.marketplacePlatform) return null;
    const labels: Record<string, { label: string; color: string }> = {
      amazon_live: { label: 'AMAZON LIVE', color: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
      whatnot: { label: 'WHATNOT', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
      tiktok_shop: { label: 'TIKTOK SHOP', color: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
      shopify_live: { label: 'SHOPIFY LIVE', color: 'bg-purple-950/60 text-purple-300 border-purple-500/30' },
      popshop_live: { label: 'POPSHOP', color: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' },
      ebay_live: { label: 'EBAY LIVE', color: 'bg-blue-950/60 text-blue-300 border-blue-500/30' },
    };
    const info = labels[channel.marketplacePlatform] || { label: channel.marketplacePlatform.toUpperCase(), color: 'bg-zinc-900 text-zinc-300 border-white/20' };
    return (
      <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border tracking-widest ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const getStatusBadge = () => {
    if (channel.status === 'frozen') {
      return (
        <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black bg-rose-950/80 text-rose-400 border border-rose-500/35 tracking-wider uppercase font-mono">
          <Ban className="w-2.5 h-2.5" /> WALLET FROZEN
        </span>
      );
    }
    if (channel.status === 'flagged_and_suppressed') {
      return (
        <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black bg-amber-950/80 text-amber-400 border border-amber-500/35 tracking-wider uppercase font-mono">
          <ZapOff className="w-2.5 h-2.5" /> SUPPRESSED
        </span>
      );
    }
    return isRed ? (
      <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black bg-rose-950/80 text-rose-400 border border-rose-500/35 tracking-wider uppercase font-mono">
        <ShieldAlert className="w-2.5 h-2.5" /> HIGH RISK
      </span>
    ) : (
      <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-black bg-zinc-900 text-[#00FF00] border border-[#00FF00]/30 tracking-wider uppercase font-mono">
        <Shield className="w-2.5 h-2.5 text-[#00FF00]" /> SAFE
      </span>
    );
  };

  const getCategoryColor = () => {
    switch (channel.category) {
      case 'shopping':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'crypto':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'gaming':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }
  };

  const ratioPct = Math.round(channel.authorizedRatio * 100);

  return (
    <div
      id={`channel-card-${channel.id}`}
      onClick={onSelect}
      className={`group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-zinc-900/90 border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.1)]'
          : 'bg-black border-white/10 hover:border-white/30 hover:bg-zinc-950'
      }`}
    >
      {/* Decorative pulse for active live stream */}
      {!isRed && (
        <div className="absolute top-5 right-5 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF00] shadow-[0_0_8px_#00FF00]"></span>
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
          <h3 className="text-base font-black text-white tracking-tight uppercase group-hover:text-[#00FF00] transition-colors">
            {channel.name}
          </h3>
          <p className="text-xs text-zinc-500 font-mono font-medium mt-0.5">HOST: {channel.host.toUpperCase()}</p>
        </div>

        {/* Auth Viewer Ratio Gauge */}
        <div className="mt-1">
          <div className="flex justify-between text-[11px] mb-1.5 font-mono">
            <span className="text-zinc-400 uppercase font-bold tracking-wider text-[10px]">AUTH RATIO</span>
            <span className={`font-black ${isRed ? 'text-rose-400' : 'text-[#00FF00]'}`}>
              {ratioPct}%
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
            <div
              className={`h-full rounded transition-all duration-500 ${
                isRed ? 'bg-rose-500' : 'bg-[#00FF00]'
              }`}
              style={{ width: `${ratioPct}%` }}
            />
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/10 text-[10px] font-mono">
          <div>
            <span className="text-zinc-500 uppercase block tracking-wider font-bold">TOTAL VIEWERS</span>
            <span className="font-bold text-zinc-200">
              {channel.currentViewers.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase block tracking-wider font-bold">VERIFIED HUMANS</span>
            <span className="font-bold text-zinc-200">
              {channel.verifiedHumans.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Safeguards Summary */}
        {(channel.discoverySuppressed || channel.promotionalMuted || channel.cashoutFrozen) && (
          <div className="flex items-center gap-1.5 mt-2 text-[9px] text-zinc-400 bg-zinc-950 p-2 rounded border border-white/5 font-mono">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">SAFEGUARDS:</span>
            <div className="flex gap-1">
              {channel.discoverySuppressed && (
                <span className="px-1.5 py-0.2 bg-amber-950/60 text-amber-400 border border-amber-900/20 rounded font-bold uppercase" title="Discovery Feed Suppressed">
                  FEED
                </span>
              )}
              {channel.promotionalMuted && (
                <span className="px-1.5 py-0.2 bg-amber-950/60 text-amber-400 border border-amber-900/20 rounded font-bold uppercase" title="Promotional Push Notifications Blocked">
                  PUSH
                </span>
              )}
              {channel.cashoutFrozen && (
                <span className="px-1.5 py-0.2 bg-rose-950/60 text-rose-400 border border-rose-900/20 rounded font-bold uppercase" title="Cashout Feature Frozen">
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
