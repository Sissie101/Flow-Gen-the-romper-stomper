import React, { useState } from 'react';
import { Shield, Activity, AlertTriangle, Volume2, VolumeX, FileJson, Store, HelpCircle, Lock, ShieldCheck, Bot } from 'lucide-react';
import { Channel, AuditLog, ThresholdSettings, UserRole } from '../types';
import { setAudioMuted, getAudioMuted, playCriticalStatusSound } from '../utils/sound';

interface HeaderProps {
  channels: Channel[];
  auditLogs?: AuditLog[];
  thresholdSettings?: ThresholdSettings;
  onOpenMarketplaceModal?: () => void;
  onOpenSystemsGuide?: () => void;
  onOpenSecurityGovernance?: () => void;
  onOpenMicrosoftCopilot?: () => void;
  userRole?: UserRole;
}

export function Header({
  channels,
  auditLogs,
  thresholdSettings,
  onOpenMarketplaceModal,
  onOpenSystemsGuide,
  onOpenSecurityGovernance,
  onOpenMicrosoftCopilot,
  userRole = 'admin',
}: HeaderProps) {
  const [isMuted, setIsMuted] = useState<boolean>(getAudioMuted());
  const [isExported, setIsExported] = useState<boolean>(false);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setAudioMuted(nextMuted);
    if (!nextMuted) {
      playCriticalStatusSound(); // Play test chime when unmuted
    }
  };

  const handleExportAuditData = () => {
    const totalConnections = channels.reduce((acc, c) => acc + c.currentViewers, 0);
    const totalVerified = channels.reduce((acc, c) => acc + c.verifiedHumans, 0);
    const globalRatio = totalConnections > 0 ? (totalVerified / totalConnections) * 100 : 0;
    const redCount = channels.filter((c) => c.authorizedRatio < 0.5).length;

    const exportData = {
      metadata: {
        system: "FlowGen Layer 04 View Discriminator",
        node: "US-EAST-1",
        exportedAt: new Date().toISOString(),
        version: "4.2.0-PROD"
      },
      globalSummary: {
        totalChannels: channels.length,
        totalConnections,
        totalVerified,
        globalHumanRatioPct: parseFloat(globalRatio.toFixed(2)),
        lockdownStreamsCount: redCount
      },
      thresholdSettings: thresholdSettings ?? {
        authorizedRatioThreshold: 0.50,
        urgencyThreshold: 0.40
      },
      channels: channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        host: ch.host,
        category: ch.category,
        currentViewers: ch.currentViewers,
        verifiedHumans: ch.verifiedHumans,
        authorizedRatio: ch.authorizedRatio,
        botProbabilityPct: ch.botProbability,
        urgencyScore: ch.urgencyScore,
        status: ch.status,
        discoverySuppressed: ch.discoverySuppressed,
        promotionalMuted: ch.promotionalMuted,
        cashoutFrozen: ch.cashoutFrozen
      })),
      auditLogs: auditLogs ?? []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlowGen_Audit_Data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  // Aggregate stats from the actual channels list
  const totalConnections = channels.reduce((acc, c) => acc + c.currentViewers, 0);
  const totalVerified = channels.reduce((acc, c) => acc + c.verifiedHumans, 0);
  const globalRatio = totalConnections > 0 ? (totalVerified / totalConnections) * 100 : 0;

  const redCount = channels.filter((c) => c.authorizedRatio < 0.5).length;

  return (
    <header
      id="app-header"
      className="border-b border-white/10 bg-[#050505] px-6 py-6 md:px-10 md:py-8 shrink-0"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Title and Branding in pure Bold Typography style */}
        <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tighter uppercase text-white font-sans">
              FlowGen
            </span>
            <span className="text-xs font-mono text-zinc-500 tracking-[0.2em] font-semibold">
              LAYER 04 // VIEW DISCRIMINATOR
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shadow-[0_0_12px_#00FF00]"></div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-300">SYSTEM ACTIVE</span>
            </div>
            <div className="px-2.5 py-0.5 border border-white/20 text-[9px] font-bold tracking-widest uppercase text-zinc-400 font-mono">
              NODE: US-EAST-1
            </div>

            {/* Easy Systems Guide Modal Trigger */}
            <button
              id="btn-header-systems-guide"
              onClick={onOpenSystemsGuide}
              className="flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 shadow-sm"
              title="Open beginner-friendly guide explaining how FlowGen's systems work in plain English"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>HOW IT WORKS</span>
            </button>

            {/* Security & Governance Modal Trigger */}
            <button
              id="btn-header-security-governance"
              onClick={onOpenSecurityGovernance}
              className="flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 shadow-sm"
              title="Open Enterprise Security Hub (AES-256 Encryption, TLS 1.3, RBAC, Rate Limiting & Anomaly Detection)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF00]" />
              <span>SECURITY & RBAC ({userRole.toUpperCase()})</span>
            </button>

            {/* Easy Marketplace Integration Modal Trigger */}
            <button
              id="btn-header-marketplace-hub"
              onClick={onOpenMarketplaceModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/40 hover:border-[#00FF00] shadow-sm"
              title="Open Easy Marketplace Integration Hub for Amazon Live, Whatnot, TikTok Shop, Shopify & eBay"
            >
              <Store className="w-3.5 h-3.5 text-[#00FF00]" />
              <span>CONNECT MARKETPLACE</span>
            </button>

            {/* Microsoft Copilot Agent & Tasks Hookup Modal Trigger */}
            <button
              id="btn-header-microsoft-copilot"
              onClick={onOpenMicrosoftCopilot}
              className="flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer bg-[#0078D4]/15 hover:bg-[#0078D4]/30 text-cyan-300 border-[#0078D4]/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,120,212,0.25)]"
              title="Open Microsoft Copilot Agent & Microsoft To Do / Planner Tasks Hookup"
            >
              <Bot className="w-3.5 h-3.5 text-[#0078D4] animate-pulse" />
              <span>MS COPILOT AGENT</span>
            </button>

            {/* Global Export Audit Data JSON Button */}
            <button
              id="btn-export-audit-json"
              onClick={handleExportAuditData}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                isExported
                  ? 'bg-[#00FF00] text-black border-[#00FF00] font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-[#00FF00]'
              }`}
              title="Download all channel performance metrics & audit logs as structured JSON"
            >
              <FileJson className={`w-3.5 h-3.5 ${isExported ? 'text-black' : 'text-[#00FF00]'}`} />
              <span>{isExported ? 'EXPORTED JSON' : 'EXPORT AUDIT DATA'}</span>
            </button>

            {/* Audio Alert Toggle */}
            <button
              id="btn-toggle-audio-alerts"
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                !isMuted
                  ? 'bg-emerald-950/60 border-[#00FF00]/40 text-[#00FF00] hover:border-[#00FF00]'
                  : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Web Audio alert chimes' : 'Mute Web Audio alert chimes'}
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span>AUDIO ALERTS ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  <span>AUDIO MUTED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Real-Time Stats themed in stark dark styling */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 p-3 rounded-xl border border-white/10 w-full lg:w-auto">
          {/* Stat 1 */}
          <div className="px-3 py-1" id="global-stat-connections">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">
              AUDITED CONNS
            </span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-sm font-black font-mono text-white tracking-tight">
                {totalConnections.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="px-3 py-1 border-l border-white/10" id="global-stat-verified">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">
              HUMAN TOKENS
            </span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00FF00] shrink-0" />
              <span className="text-sm font-black font-mono text-white tracking-tight">
                {totalVerified.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="px-3 py-1 border-l border-white/10" id="global-stat-ratio">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">
              GLOBAL RATIO
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-black font-mono tracking-tight ${
                  globalRatio >= 50 ? 'text-[#00FF00]' : 'text-rose-500'
                }`}
              >
                {globalRatio.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="px-3 py-1 border-l border-white/10" id="global-stat-safeguards">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">
              LOCKDOWNS
            </span>
            <div className="flex items-center gap-1.5">
              <AlertTriangle
                className={`w-3.5 h-3.5 shrink-0 ${redCount > 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`}
              />
              <span
                className={`text-sm font-black font-mono tracking-tight ${redCount > 0 ? 'text-rose-500' : 'text-zinc-300'}`}
              >
                {redCount} STREAMS
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
