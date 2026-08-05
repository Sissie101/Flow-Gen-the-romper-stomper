import React from 'react';
import { ShieldAlert, Users, Trash2, Zap, HelpCircle } from 'lucide-react';

interface InteractiveSimulatorProps {
  channelName: string;
  isRed: boolean;
  onDeployBots: () => void;
  onDeployHype: () => void;
  onCleanTraffic: () => void;
  onAddHumans: () => void;
}

export function InteractiveSimulator({
  channelName,
  isRed,
  onDeployBots,
  onDeployHype,
  onCleanTraffic,
  onAddHumans,
}: InteractiveSimulatorProps) {
  return (
    <div
      id="interactive-simulator"
      className="p-6 rounded-2xl border border-white/10 bg-black relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3 font-mono">
        <span className="flex h-2.5 w-2.5 rounded-full bg-[#00FF00] shadow-[0_0_10px_#00FF00] animate-pulse" />
        <h3 className="text-xs font-black text-white tracking-widest uppercase">
          LIVE THREAT &amp; TRAFFIC SIMULATOR
        </h3>
      </div>

      <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-medium">
        Test the real-time server-side tracking script of FlowGen Layer 4 on{' '}
        <span className="text-white font-bold">{channelName.toUpperCase()}</span>. Trigger a simulated coordinated bot cluster or purge fake traffic to verify automated safeguard rules.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Attack Controls */}
        <div className="space-y-3 font-mono">
          <span className="text-[10px] font-bold tracking-[0.2em] text-rose-500 uppercase block">
            SIMULATE ADVERSARIAL VECTORS
          </span>

          <button
            id="btn-deploy-bots"
            onClick={onDeployBots}
            className="w-full flex items-center justify-between px-4 py-3 rounded border border-rose-950 bg-rose-950/20 hover:bg-rose-950/40 hover:border-rose-500 text-rose-300 hover:text-rose-100 transition-all duration-300 text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              COORDINATED VIEWBOT SPIKE
            </span>
            <span className="font-mono text-[9px] bg-rose-500/15 px-2 py-0.5 rounded text-rose-400 font-black">
              +4.5K BOTS
            </span>
          </button>

          <button
            id="btn-deploy-hype"
            onClick={onDeployHype}
            className="w-full flex items-center justify-between px-4 py-3 rounded border border-amber-950 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500 text-amber-300 hover:text-amber-100 transition-all duration-300 text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              URGENCY HYPE SPAM
            </span>
            <span className="font-mono text-[9px] bg-amber-500/15 px-2 py-0.5 rounded text-amber-400 font-black">
              CHAT SPAM
            </span>
          </button>
        </div>

        {/* Defense Controls */}
        <div className="space-y-3 font-mono">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#00FF00] uppercase block">
            VERIFICATION &amp; MITIGATION
          </span>

          <button
            id="btn-purge-bots"
            onClick={onCleanTraffic}
            className="w-full flex items-center justify-between px-4 py-3 rounded border border-[#00FF00]/25 bg-[#00FF00]/5 hover:bg-[#00FF00]/10 hover:border-[#00FF00] text-[#00FF00] transition-all duration-300 text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#00FF00]" />
              PURGE BOT TRAFFIC
            </span>
            <span className="font-mono text-[9px] bg-[#00FF00]/15 px-2 py-0.5 rounded text-[#00FF00] font-black">
              PURGE
            </span>
          </button>

          <button
            id="btn-add-humans"
            onClick={onAddHumans}
            className="w-full flex items-center justify-between px-4 py-3 rounded border border-white/10 bg-zinc-900 hover:bg-zinc-950 hover:border-white/30 text-white transition-all duration-300 text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              INJECT HUMAN TOKENS
            </span>
            <span className="font-mono text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-black">
              +500 TOKENS
            </span>
          </button>
        </div>
      </div>

      {/* Threshold indicator helper */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
        <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="leading-relaxed">
          RISK THRESHOLD: AN <span className="font-bold text-zinc-400">AUTHORIZED VIEWER RATIO</span> BELOW{' '}
          <span className="text-rose-500 font-black">50%</span> TRIGGER-LOCKS THE DISCOVERY FEED AND STREAMS.
        </span>
      </div>
    </div>
  );
}
