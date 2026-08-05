import React from 'react';
import { Channel } from '../types';
import { Radar, ArrowRight, X } from 'lucide-react';

export interface TrendAlertData {
  id: string;
  clusterName: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  targetChannel: Channel;
  timestamp: string;
  description: string;
}

interface TrendAlertToastProps {
  alert: TrendAlertData | null;
  onNavigate: (channelId: string) => void;
  onDismiss: () => void;
}

export function TrendAlertToast({ alert, onNavigate, onDismiss }: TrendAlertToastProps) {
  if (!alert) return null;

  const isCritical = alert.riskLevel === 'CRITICAL' || alert.riskLevel === 'HIGH';

  return (
    <div
      id="trend-alert-toast"
      className={`fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl border shadow-2xl font-mono backdrop-blur-xl transition-all duration-300 animate-bounce ${
        isCritical
          ? 'bg-black/95 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.35)] text-white'
          : 'bg-black/95 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded ${
              isCritical ? 'bg-rose-950 text-rose-400 animate-pulse' : 'bg-amber-950 text-amber-400'
            }`}
          >
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-white block">
              TREND ALERT // CLUSTER SHIFT DETECTED
            </span>
            <span className="text-[8px] text-zinc-400 font-sans">{alert.timestamp}</span>
          </div>
        </div>

        <button
          id="btn-dismiss-trend-toast"
          onClick={onDismiss}
          className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/10 transition-all cursor-pointer"
          title="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
              isCritical
                ? 'bg-rose-950 text-rose-400 border-rose-500/50'
                : 'bg-amber-950 text-amber-400 border-amber-500/50'
            }`}
          >
            {alert.clusterName} ({alert.riskLevel})
          </span>
        </div>

        <p className="text-xs font-sans text-zinc-200 font-medium leading-snug">
          {alert.description}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
        <button
          id="btn-navigate-affected-channel"
          onClick={() => onNavigate(alert.targetChannel.id)}
          className={`w-full py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCritical
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
              : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold'
          }`}
        >
          <span>NAVIGATE TO AFFECTED STREAM (@{alert.targetChannel.host})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
