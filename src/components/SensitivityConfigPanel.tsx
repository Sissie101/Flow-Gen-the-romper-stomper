import React, { useState } from 'react';
import { ThresholdSettings } from '../types';
import { Sliders, ShieldAlert, Zap, RotateCcw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SensitivityConfigPanelProps {
  settings: ThresholdSettings;
  onUpdateSettings: (newSettings: ThresholdSettings) => void;
  affectedChannelsCount: number;
  totalChannelsCount: number;
  onReset: () => void;
}

export function SensitivityConfigPanel({
  settings,
  onUpdateSettings,
  affectedChannelsCount,
  totalChannelsCount,
  onReset,
}: SensitivityConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const ratioPct = Math.round(settings.authorizedRatioThreshold * 100);
  const urgencyPct = Math.round(settings.urgencyThreshold * 100);

  const isCustom = ratioPct !== 50 || urgencyPct !== 40;

  const handleRatioChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      authorizedRatioThreshold: val / 100,
    });
  };

  const handleUrgencyChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      urgencyThreshold: val / 100,
    });
  };

  const applyPreset = (preset: 'strict' | 'balanced' | 'lenient') => {
    if (preset === 'strict') {
      onUpdateSettings({ authorizedRatioThreshold: 0.65, urgencyThreshold: 0.30 });
    } else if (preset === 'balanced') {
      onUpdateSettings({ authorizedRatioThreshold: 0.50, urgencyThreshold: 0.50 });
    } else if (preset === 'lenient') {
      onUpdateSettings({ authorizedRatioThreshold: 0.30, urgencyThreshold: 0.70 });
    }
  };

  return (
    <div
      id="sensitivity-config-panel"
      className="p-6 rounded-2xl border border-white/10 bg-black flex flex-col transition-all font-mono"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-white/10">
            <Sliders className="w-4 h-4 text-[#00FF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase text-white tracking-widest">
                ALERT SENSITIVITY CONFIGURATION
              </h3>
              {isCustom ? (
                <span className="text-[8px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded tracking-widest">
                  CUSTOM ENGINE ACTIVE
                </span>
              ) : (
                <span className="text-[8px] font-black uppercase bg-zinc-900 text-zinc-400 border border-white/10 px-2 py-0.5 rounded tracking-widest">
                  STANDARD BASELINE
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">
              Tune dynamic thresholds for Authorized Viewer Ratio and Chat Urgency alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCustom && (
            <button
              id="btn-reset-sensitivity"
              onClick={onReset}
              className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1 border border-white/10 hover:border-white/30 bg-zinc-950 px-2.5 py-1.5 rounded transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> RESET DEFAULTS
            </button>
          )}

          <button
            id="btn-toggle-config-panel"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1 border border-white/10 hover:border-white/30 bg-zinc-950 px-2.5 py-1.5 rounded transition-all cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>COLLAPSE</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>EXPAND CONFIG</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Controls Section */}
      {isExpanded && (
        <div className="mt-5 space-y-6">
          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block">
              QUICK AUDIT PRESETS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                id="preset-strict"
                onClick={() => applyPreset('strict')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  ratioPct === 65 && urgencyPct === 30
                    ? 'bg-rose-950/30 border-rose-500 text-rose-300 font-bold'
                    : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-[10px] font-black uppercase flex items-center gap-1.5 mb-0.5">
                  <ShieldAlert className="w-3 h-3 text-rose-400" /> STRICT MODE
                </div>
                <div className="text-[9px] text-zinc-500 font-sans font-medium">
                  65% Ratio / 30% Urgency (High Security)
                </div>
              </button>

              <button
                id="preset-balanced"
                onClick={() => applyPreset('balanced')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  ratioPct === 50 && urgencyPct === 50
                    ? 'bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00] font-bold'
                    : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-[10px] font-black uppercase flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3 h-3 text-[#00FF00]" /> BALANCED
                </div>
                <div className="text-[9px] text-zinc-500 font-sans font-medium">
                  50% Ratio / 50% Urgency (Standard)
                </div>
              </button>

              <button
                id="preset-lenient"
                onClick={() => applyPreset('lenient')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  ratioPct === 30 && urgencyPct === 70
                    ? 'bg-sky-950/30 border-sky-400 text-sky-300 font-bold'
                    : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-[10px] font-black uppercase flex items-center gap-1.5 mb-0.5">
                  <Zap className="w-3 h-3 text-sky-400" /> HIGH TOLERANCE
                </div>
                <div className="text-[9px] text-zinc-500 font-sans font-medium">
                  30% Ratio / 70% Urgency (Viral Events)
                </div>
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/10">
            {/* Slider 1: Authorized Viewer Ratio Threshold */}
            <div className="space-y-3 bg-zinc-950 p-4 rounded border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-white tracking-wider block">
                    AUTHORIZED VIEWER RATIO THRESHOLD
                  </span>
                  <p className="text-[9px] text-zinc-500 font-sans font-medium mt-0.5">
                    Trigger RED status &amp; safeguards when human ratio dips below this.
                  </p>
                </div>
                <span
                  className={`text-sm font-black font-mono px-2 py-0.5 rounded border ${
                    ratioPct > 50
                      ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                      : 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30'
                  }`}
                >
                  {ratioPct}%
                </span>
              </div>

              <input
                id="slider-authorized-ratio"
                type="range"
                min="10"
                max="90"
                step="1"
                value={ratioPct}
                onChange={(e) => handleRatioChange(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00FF00]"
              />

              <div className="flex justify-between text-[8px] text-zinc-600 font-mono font-bold uppercase">
                <span>10% (Lenient)</span>
                <span>50% (Default)</span>
                <span>90% (Ultra Strict)</span>
              </div>
            </div>

            {/* Slider 2: Hype & Urgency Alert Threshold */}
            <div className="space-y-3 bg-zinc-950 p-4 rounded border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-white tracking-wider block">
                    HYPE &amp; URGENCY ALERT THRESHOLD
                  </span>
                  <p className="text-[9px] text-zinc-500 font-sans font-medium mt-0.5">
                    Flag chat messages &amp; buyers when aggressiveness score crosses this.
                  </p>
                </div>
                <span
                  className={`text-sm font-black font-mono px-2 py-0.5 rounded border ${
                    urgencyPct < 40
                      ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                      : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {urgencyPct}%
                </span>
              </div>

              <input
                id="slider-urgency-threshold"
                type="range"
                min="10"
                max="90"
                step="1"
                value={urgencyPct}
                onChange={(e) => handleUrgencyChange(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00FF00]"
              />

              <div className="flex justify-between text-[8px] text-zinc-600 font-mono font-bold uppercase">
                <span>10% (Sensitive)</span>
                <span>40% (Default)</span>
                <span>90% (High Tolerance)</span>
              </div>
            </div>
          </div>

          {/* Real-time Impact Assessment Banner */}
          <div className="p-3.5 bg-zinc-950 rounded border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <AlertCircle className={`w-4 h-4 shrink-0 ${affectedChannelsCount > 0 ? 'text-rose-400' : 'text-[#00FF00]'}`} />
              <span className="text-zinc-300 font-medium">
                IMPACT PREVIEW:{' '}
                <span className="font-bold text-white">
                  {affectedChannelsCount} of {totalChannelsCount} active streams
                </span>{' '}
                currently satisfy RED alert criteria under these parameters.
              </span>
            </div>

            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider shrink-0">
              {affectedChannelsCount > 0 ? 'SAFEGUARDS ACTIVE' : 'ALL STREAMS CLEAR'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
