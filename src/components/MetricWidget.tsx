import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Users, HeartHandshake } from 'lucide-react';

interface MetricWidgetProps {
  label: string;
  value: number; // For percentage e.g. 78 or absolute numbers
  suffix?: string;
  type: 'ratio' | 'bot' | 'urgency' | 'viewers' | 'verified';
  description?: string;
}

export function MetricWidget({ label, value, suffix = '', type, description }: MetricWidgetProps) {
  const getColors = () => {
    switch (type) {
      case 'ratio':
        return value >= 50
          ? {
              text: 'text-[#00FF00]',
              bg: 'bg-[#00FF00]/10',
              border: 'border-[#00FF00]/20',
              progress: 'bg-[#00FF00]',
            }
          : {
              text: 'text-rose-500',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/20',
              progress: 'bg-rose-500',
            };
      case 'bot':
        return value > 40
          ? {
              text: 'text-rose-500',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/20',
              progress: 'bg-rose-500',
            }
          : value > 15
          ? {
              text: 'text-amber-500',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
              progress: 'bg-amber-500',
            }
          : {
              text: 'text-[#00FF00]',
              bg: 'bg-[#00FF00]/10',
              border: 'border-[#00FF00]/20',
              progress: 'bg-[#00FF00]',
            };
      case 'urgency':
        return value > 60
          ? {
              text: 'text-amber-500',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
              progress: 'bg-amber-500',
            }
          : {
              text: 'text-zinc-400',
              bg: 'bg-zinc-800/30',
              border: 'border-white/10',
              progress: 'bg-zinc-500',
            };
      default:
        return {
          text: 'text-sky-400',
          bg: 'bg-sky-500/10',
          border: 'border-white/10',
          progress: 'bg-sky-400',
        };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    switch (type) {
      case 'ratio':
        return value >= 50 ? (
          <ShieldCheck className="w-5 h-5 text-[#00FF00]" id="icon-ratio-safe" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-rose-400" id="icon-ratio-danger" />
        );
      case 'bot':
        return value > 40 ? (
          <AlertTriangle className="w-5 h-5 text-rose-400" id="icon-bot-danger" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-[#00FF00]" id="icon-bot-safe" />
        );
      case 'urgency':
        return <HeartHandshake className="w-5 h-5 text-amber-400" id="icon-urgency" />;
      default:
        return <Users className="w-5 h-5 text-sky-400" id="icon-users" />;
    }
  };

  return (
    <div
      id={`metric-${type}`}
      className={`p-6 rounded-2xl border border-white/10 bg-zinc-950/60 transition-all duration-300 hover:border-white/20`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500">{label}</span>
        <div className={`p-1.5 rounded-lg ${colors.bg}`}>{getIcon()}</div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-black font-mono tracking-tight ${colors.text}`}>
          {value.toLocaleString()}
          {suffix && <span className="text-xl font-medium tracking-normal text-white ml-0.5">{suffix}</span>}
        </span>
      </div>

      {/* Progress Bar for ratio, bot, urgency */}
      {(type === 'ratio' || type === 'bot' || type === 'urgency') && (
        <div className="mt-4 w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${colors.progress}`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
      )}

      {description && <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed font-medium">{description}</p>}
    </div>
  );
}
