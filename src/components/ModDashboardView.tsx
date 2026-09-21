import React, { useMemo } from 'react';
import { Channel, ChatMessage, AuditLog, ThresholdSettings, ThemeMode } from '../types';
import {
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Flame,
  EyeOff,
  BellOff,
  Wallet,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  FileText,
  Ban,
  ZapOff,
  Users,
  Radio,
} from 'lucide-react';

interface ModDashboardViewProps {
  channels: Channel[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLog[];
  thresholdSettings: ThresholdSettings;
  theme: ThemeMode;
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onSwitchToConsole: () => void;
}

export function ModDashboardView({
  channels,
  chatMessages,
  auditLogs,
  thresholdSettings,
  theme,
  selectedChannelId,
  onSelectChannel,
  onSwitchToConsole,
}: ModDashboardViewProps) {
  const isLight = theme === 'light';

  // --- AGGREGATE ALL MOD DATA ---
  const stats = useMemo(() => {
    const totalChannels = channels.length;
    const totalViewers = channels.reduce((acc, c) => acc + c.currentViewers, 0);
    const totalVerified = channels.reduce((acc, c) => acc + c.verifiedHumans, 0);
    const globalRatio = totalViewers > 0 ? (totalVerified / totalViewers) * 100 : 0;
    const avgBotProb = totalChannels > 0 ? channels.reduce((acc, c) => acc + c.botProbability, 0) / totalChannels : 0;
    const avgUrgency = totalChannels > 0 ? channels.reduce((acc, c) => acc + c.urgencyScore, 0) / totalChannels : 0;

    const redChannels = channels.filter(
      (c) => c.authorizedRatio < thresholdSettings.authorizedRatioThreshold || c.urgencyScore / 100 > thresholdSettings.urgencyThreshold
    );
    const safeChannels = channels.filter((c) => !redChannels.includes(c));

    const suppressedCount = channels.filter((c) => c.discoverySuppressed).length;
    const mutedCount = channels.filter((c) => c.promotionalMuted).length;
    const frozenCount = channels.filter((c) => c.cashoutFrozen).length;

    const flaggedMessages = chatMessages.filter((m) => m.suspiciousnessScore > 0.5);
    const criticalLogs = auditLogs.filter((l) => l.severity === 'critical' || l.severity === 'high');

    return {
      totalChannels,
      totalViewers,
      totalVerified,
      globalRatio,
      avgBotProb,
      avgUrgency,
      redCount: redChannels.length,
      safeCount: safeChannels.length,
      suppressedCount,
      mutedCount,
      frozenCount,
      flaggedMsgCount: flaggedMessages.length,
      criticalLogCount: criticalLogs.length,
    };
  }, [channels, chatMessages, auditLogs, thresholdSettings]);

  const recentLogs = useMemo(() => {
    return [...auditLogs]
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 12);
  }, [auditLogs]);

  const channelRows = useMemo(() => {
    return [...channels].sort((a, b) => a.authorizedRatio - b.authorizedRatio);
  }, [channels]);

  // --- THEME HELPERS ---
  const cardClass = isLight
    ? 'bg-white border-zinc-200 shadow-sm'
    : 'bg-black border-white/10';

  const labelClass = isLight ? 'text-zinc-500' : 'text-zinc-500';
  const valueClass = isLight ? 'text-zinc-900' : 'text-white';
  const subTextClass = isLight ? 'text-zinc-600' : 'text-zinc-400';

  const getRiskBadge = (ch: Channel) => {
    const isRed = ch.authorizedRatio < thresholdSettings.authorizedRatioThreshold || ch.urgencyScore / 100 > thresholdSettings.urgencyThreshold;
    if (ch.status === 'frozen') {
      return (
        <span className={`flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
          isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950/80 text-rose-400 border-rose-500/35'
        }`}>
          <Ban className="w-2.5 h-2.5" /> FROZEN
        </span>
      );
    }
    if (ch.status === 'flagged_and_suppressed') {
      return (
        <span className={`flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
          isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-400 border-amber-500/35'
        }`}>
          <ZapOff className="w-2.5 h-2.5" /> SUPPRESSED
        </span>
      );
    }
    if (ch.status === 'high_risk' || isRed) {
      return (
        <span className={`flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
          isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950/80 text-rose-400 border-rose-500/35'
        }`}>
          <ShieldAlert className="w-2.5 h-2.5" /> HIGH RISK
        </span>
      );
    }
    return (
      <span className={`flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase font-mono border ${
        isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-zinc-900 text-[#00FF00] border-[#00FF00]/30'
      }`}>
        <ShieldCheck className={`w-2.5 h-2.5 ${isLight ? 'text-emerald-700' : 'text-[#00FF00]'}`} /> SAFE
      </span>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return isLight ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-rose-500/30 bg-rose-950/15 text-rose-200';
      case 'high':
        return isLight ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-amber-500/30 bg-amber-950/15 text-amber-200';
      case 'medium':
        return isLight ? 'border-zinc-300 bg-zinc-50 text-zinc-700' : 'border-white/15 bg-zinc-900/60 text-zinc-300';
      default:
        return isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-500' : 'border-white/5 bg-zinc-950/40 text-zinc-400';
    }
  };

  const getLogIcon = (type: string, severity: string) => {
    if (type === 'safeguard_triggered' || type === 'cashout_frozen') return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
    if (type === 'cashout_released' || type === 'status_restored') return <CheckCircle className="w-3.5 h-3.5 text-[#00FF00] shrink-0 mt-0.5" />;
    if (severity === 'critical' || severity === 'high') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
    return <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />;
  };

  const channelNameById = useMemo(() => {
    const map: Record<string, string> = {};
    channels.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [channels]);

  // KPI Card component
  const KpiCard = ({ icon, label, value, sublabel, accent }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel?: string;
    accent: 'green' | 'red' | 'amber' | 'cyan' | 'purple' | 'zinc';
  }) => {
    const accentMap = {
      green: isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/20',
      red: isLight ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      amber: isLight ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      cyan: isLight ? 'text-cyan-700 bg-cyan-50 border-cyan-200' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      purple: isLight ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      zinc: isLight ? 'text-zinc-700 bg-zinc-100 border-zinc-200' : 'text-zinc-400 bg-zinc-800/30 border-white/10',
    };
    return (
      <div className={`p-4 rounded-xl border ${cardClass} flex flex-col gap-2`}>
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${labelClass}`}>{label}</span>
          <div className={`p-1.5 rounded-lg border ${accentMap[accent]}`}>{icon}</div>
        </div>
        <span className={`text-2xl font-black font-mono tracking-tight ${valueClass}`}>{value}</span>
        {sublabel && <span className={`text-[10px] font-medium ${subTextClass}`}>{sublabel}</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${cardClass}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
            <Radio className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          </div>
          <div>
            <h2 className={`text-sm font-black uppercase tracking-widest ${valueClass}`}>MOD COMMAND DASHBOARD</h2>
            <p className={`text-[10px] font-medium ${subTextClass}`}>All moderation data at a glance — {stats.totalChannels} streams monitored</p>
          </div>
        </div>
        <button
          id="btn-switch-to-console"
          onClick={onSwitchToConsole}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            isLight
              ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
              : 'bg-white text-black border-white hover:bg-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          OPEN STREAM CONSOLE
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          label="STREAMS"
          value={String(stats.totalChannels)}
          sublabel={`${stats.safeCount} safe / ${stats.redCount} at risk`}
          accent="cyan"
        />
        <KpiCard
          icon={<Users className="w-4 h-4" />}
          label="TOTAL VIEWERS"
          value={stats.totalViewers.toLocaleString()}
          sublabel={`${stats.totalVerified.toLocaleString()} verified humans`}
          accent="zinc"
        />
        <KpiCard
          icon={<Shield className="w-4 h-4" />}
          label="GLOBAL RATIO"
          value={`${stats.globalRatio.toFixed(1)}%`}
          sublabel={stats.globalRatio >= 50 ? 'Above threshold' : 'Below threshold'}
          accent={stats.globalRatio >= 50 ? 'green' : 'red'}
        />
        <KpiCard
          icon={<Bot className="w-4 h-4" />}
          label="AVG BOT PROB"
          value={`${stats.avgBotProb.toFixed(0)}%`}
          sublabel={stats.avgBotProb > 40 ? 'Elevated risk' : 'Within normal range'}
          accent={stats.avgBotProb > 40 ? 'red' : 'green'}
        />
        <KpiCard
          icon={<Flame className="w-4 h-4" />}
          label="AVG URGENCY"
          value={`${stats.avgUrgency.toFixed(0)}/100`}
          sublabel={stats.avgUrgency > 60 ? 'High pressure detected' : 'Normal tactics'}
          accent={stats.avgUrgency > 60 ? 'amber' : 'zinc'}
        />
        <KpiCard
          icon={<AlertOctagon className="w-4 h-4" />}
          label="LOCKDOWNS"
          value={String(stats.redCount)}
          sublabel={`${stats.frozenCount} cashout frozen`}
          accent={stats.redCount > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Safeguards Strip */}
      <div className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border ${cardClass}`}>
        <span className={`text-[10px] font-black uppercase tracking-widest ${labelClass}`}>ACTIVE SAFEGUARDS</span>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-mono ${
          stats.suppressedCount > 0
            ? isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
            : isLight ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-zinc-950 text-zinc-600 border-white/10'
        }`}>
          <EyeOff className="w-3.5 h-3.5" /> DISCOVERY SUPPRESSED: {stats.suppressedCount}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-mono ${
          stats.mutedCount > 0
            ? isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
            : isLight ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-zinc-950 text-zinc-600 border-white/10'
        }`}>
          <BellOff className="w-3.5 h-3.5" /> PROMO MUTED: {stats.mutedCount}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-mono ${
          stats.frozenCount > 0
            ? isLight ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
            : isLight ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-zinc-950 text-zinc-600 border-white/10'
        }`}>
          <Wallet className="w-3.5 h-3.5" /> CASHOUT FROZEN: {stats.frozenCount}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-mono ${
          stats.flaggedMsgCount > 0
            ? isLight ? 'bg-purple-50 text-purple-800 border-purple-300' : 'bg-purple-950/60 text-purple-400 border-purple-500/30'
            : isLight ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-zinc-950 text-zinc-600 border-white/10'
        }`}>
          <MessageSquare className="w-3.5 h-3.5" /> FLAGGED CHATS: {stats.flaggedMsgCount}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-mono ${
          stats.criticalLogCount > 0
            ? isLight ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
            : isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-zinc-950 text-emerald-400 border-emerald-500/20'
        }`}>
          <FileText className="w-3.5 h-3.5" /> CRITICAL/HIGH LOGS: {stats.criticalLogCount}
        </div>
      </div>

      {/* Main Content: Channel Table + Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Channel Overview Table */}
        <div className={`lg:col-span-7 rounded-2xl border ${cardClass} p-5 flex flex-col`}>
          <div className="flex items-center justify-between pb-3 border-b ${isLight ? 'border-zinc-200' : 'border-white/10'}">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <h3 className={`text-xs font-black uppercase tracking-widest ${valueClass}`}>ALL STREAMS — RISK RANKED</h3>
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${subTextClass}`}>
              Sorted by lowest auth ratio
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[9px] font-bold uppercase tracking-wider font-mono ${subTextClass} border-b ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
                  <th className="pb-2 pr-2">STREAM</th>
                  <th className="pb-2 px-2 text-right">VIEWERS</th>
                  <th className="pb-2 px-2 text-right">RATIO</th>
                  <th className="pb-2 px-2 text-right">BOT%</th>
                  <th className="pb-2 px-2 text-right">URGENCY</th>
                  <th className="pb-2 pl-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {channelRows.map((ch) => {
                  const isRed = ch.authorizedRatio < thresholdSettings.authorizedRatioThreshold || ch.urgencyScore / 100 > thresholdSettings.urgencyThreshold;
                  const ratioPct = Math.round(ch.authorizedRatio * 100);
                  return (
                    <tr
                      key={ch.id}
                      onClick={() => { onSelectChannel(ch.id); onSwitchToConsole(); }}
                      className={`cursor-pointer transition-all border-b ${isLight ? 'border-zinc-100 hover:bg-zinc-50' : 'border-white/5 hover:bg-zinc-950'} ${
                        ch.id === selectedChannelId ? (isLight ? 'bg-emerald-50' : 'bg-zinc-900') : ''
                      }`}
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-8 rounded-full ${isRed ? 'bg-rose-500' : 'bg-[#00FF00]'}`} />
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${valueClass}`}>{ch.name}</p>
                            <p className={`text-[9px] font-mono ${subTextClass}`}>@{ch.host}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`py-2.5 px-2 text-right text-xs font-mono font-bold ${valueClass}`}>
                        {ch.currentViewers.toLocaleString()}
                      </td>
                      <td className={`py-2.5 px-2 text-right text-xs font-mono font-black ${isRed ? (isLight ? 'text-rose-700' : 'text-rose-400') : (isLight ? 'text-emerald-700' : 'text-[#00FF00]')}`}>
                        {ratioPct}%
                      </td>
                      <td className={`py-2.5 px-2 text-right text-xs font-mono font-bold ${
                        ch.botProbability > 50 ? (isLight ? 'text-rose-700' : 'text-rose-400') : ch.botProbability > 25 ? (isLight ? 'text-amber-700' : 'text-amber-400') : (isLight ? 'text-emerald-700' : 'text-[#00FF00]')
                      }`}>
                        {ch.botProbability}%
                      </td>
                      <td className={`py-2.5 px-2 text-right text-xs font-mono font-bold ${
                        ch.urgencyScore > 60 ? (isLight ? 'text-amber-700' : 'text-amber-400') : subTextClass
                      }`}>
                        {ch.urgencyScore}
                      </td>
                      <td className="py-2.5 pl-2">{getRiskBadge(ch)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Logs Across All Channels */}
        <div className={`lg:col-span-5 rounded-2xl border ${cardClass} p-5 flex flex-col`}>
          <div className="flex items-center justify-between pb-3 border-b ${isLight ? 'border-zinc-200' : 'border-white/10'}">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <h3 className={`text-xs font-black uppercase tracking-widest ${valueClass}`}>RECENT AUDIT LOGS — ALL STREAMS</h3>
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${subTextClass}`}>
              Last {recentLogs.length} events
            </span>
          </div>
          <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[500px]">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-zinc-600 gap-2 font-mono">
                <FileText className="w-6 h-6 opacity-25" />
                <p className="text-[10px] font-bold uppercase tracking-widest">NO LOGS RECORDED</p>
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-lg border text-[10px] flex gap-2.5 ${getSeverityColor(log.severity)}`}
                >
                  {getLogIcon(log.type, log.severity)}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="font-extrabold tracking-wider uppercase text-[8px] font-mono opacity-80">
                        {log.type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[8px] opacity-60 shrink-0">{log.timestamp}</span>
                    </div>
                    <p className="leading-snug font-medium truncate">{log.detail}</p>
                    <p className="text-[8px] uppercase tracking-wider font-mono opacity-60">
                      {channelNameById[log.channelId] || log.channelId}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
