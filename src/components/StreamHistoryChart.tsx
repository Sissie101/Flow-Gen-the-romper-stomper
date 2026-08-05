import React, { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HistoryPoint } from '../types';
import { AreaChart as ChartIcon, Layers, Activity } from 'lucide-react';

interface StreamHistoryChartProps {
  data: HistoryPoint[];
}

export function StreamHistoryChart({ data }: StreamHistoryChartProps) {
  const [showBaseline, setShowBaseline] = useState<boolean>(false);

  // Ensure every data point has baseline metrics computed if not present
  const enrichedData = data.map((pt) => {
    const isSpiked = pt.viewers > pt.verifiedHumans * 1.8;
    const fallbackBaseTotal = isSpiked ? Math.round(pt.verifiedHumans * 1.18) : pt.viewers;
    const fallbackBaseHumans = Math.round(fallbackBaseTotal * 0.88);

    return {
      ...pt,
      baselineViewers: pt.baselineViewers ?? fallbackBaseTotal,
      baselineVerifiedHumans: pt.baselineVerifiedHumans ?? fallbackBaseHumans,
    };
  });

  // Custom styled Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentViewers = payload.find((p: any) => p.dataKey === 'viewers')?.value ?? 0;
      const currentHumans = payload.find((p: any) => p.dataKey === 'verifiedHumans')?.value ?? 0;
      const baseViewers = payload.find((p: any) => p.dataKey === 'baselineViewers')?.value;
      const baseHumans = payload.find((p: any) => p.dataKey === 'baselineVerifiedHumans')?.value;

      const viewerVariance = baseViewers && baseViewers > 0
        ? Math.round(((currentViewers - baseViewers) / baseViewers) * 100)
        : 0;

      return (
        <div className="bg-black border border-white/20 p-4 shadow-2xl rounded-xl text-xs font-mono max-w-xs">
          <p className="text-zinc-500 mb-2 font-sans font-bold uppercase tracking-wider text-[10px]">
            TIMESTAMP: {label}
          </p>

          <div className="space-y-1.5 pb-2 border-b border-white/10">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">
              REAL-TIME METRICS
            </span>
            <p className="text-rose-500 font-bold uppercase text-[10px] flex justify-between gap-4">
              <span>TOTAL CONNS:</span>
              <span className="font-extrabold text-white text-xs">{currentViewers.toLocaleString()}</span>
            </p>
            <p className="text-[#00FF00] font-bold uppercase text-[10px] flex justify-between gap-4">
              <span>HUMAN TOKENS:</span>
              <span className="font-extrabold text-white text-xs">{currentHumans.toLocaleString()}</span>
            </p>
          </div>

          {showBaseline && baseViewers !== undefined && baseHumans !== undefined && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block">
                24H HISTORICAL BASELINE
              </span>
              <p className="text-sky-400 font-bold uppercase text-[10px] flex justify-between gap-4">
                <span>BASE TOTAL:</span>
                <span className="font-extrabold text-white text-xs">{baseViewers.toLocaleString()}</span>
              </p>
              <p className="text-emerald-300 font-bold uppercase text-[10px] flex justify-between gap-4">
                <span>BASE HUMANS:</span>
                <span className="font-extrabold text-white text-xs">{baseHumans.toLocaleString()}</span>
              </p>

              <div className="mt-2 pt-2 border-t border-white/10 text-[10px] font-sans">
                <p className="text-zinc-400 font-medium">
                  CONNS VS 24H BASELINE:{' '}
                  <span
                    className={`font-black font-mono ${
                      viewerVariance > 40 ? 'text-rose-400' : 'text-[#00FF00]'
                    }`}
                  >
                    {viewerVariance > 0 ? `+${viewerVariance}%` : `${viewerVariance}%`}
                  </span>
                </p>
              </div>
            </div>
          )}

          {!showBaseline && currentViewers > currentHumans && (
            <p className="text-amber-400 text-[10px] mt-2 pt-2 border-t border-white/10 font-sans font-medium">
              BOT DIFFERENTIAL:{' '}
              <span className="font-black font-mono">
                {Math.round(((currentViewers - currentHumans) / currentViewers) * 100)}%
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="stream-history-chart-card"
      className="p-6 rounded-2xl border border-white/10 bg-black flex flex-col min-h-[380px]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/10 mb-4 gap-4 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-white/10">
            <ChartIcon className="w-4 h-4 text-[#00FF00]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-widest">
              TRAFFIC DIFFERENTIAL ANALYSIS
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">
              Real-time discrepancy vs channel's 24-hour baseline performance
            </p>
          </div>
        </div>

        {/* View mode toggle controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-zinc-950 p-1 rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono">
            <button
              id="btn-mode-current"
              onClick={() => setShowBaseline(false)}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                !showBaseline
                  ? 'bg-white text-black font-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Activity className="w-3 h-3" />
              CURRENT STREAM
            </button>
            <button
              id="btn-mode-baseline"
              onClick={() => setShowBaseline(true)}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                showBaseline
                  ? 'bg-[#00FF00] text-black font-black shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'text-zinc-500 hover:text-[#00FF00]'
              }`}
            >
              <Layers className="w-3 h-3" />
              24H BASELINE OVERLAY
            </button>
          </div>
        </div>
      </div>

      {/* Chart Legend Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono font-bold tracking-wider uppercase mb-3 px-1 text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
            <span>REAL-TIME CONNS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#00FF00] rounded-xs" />
            <span>REAL-TIME HUMANS</span>
          </div>

          {showBaseline && (
            <>
              <div className="flex items-center gap-1.5 text-sky-400">
                <div className="w-3 h-0.5 border-t-2 border-dashed border-sky-400" />
                <span>24H BASE TOTAL</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <div className="w-3 h-0.5 border-t-2 border-dashed border-emerald-300" />
                <span>24H BASE HUMANS</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[10px] text-zinc-500 font-sans font-medium">
          {showBaseline ? 'Comparing live traffic against 24h baseline rolling average' : 'Showing active stream telemetry'}
        </div>
      </div>

      {/* Recharts canvas */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHumans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF00" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00FF00" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
            <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />

            {/* Current Stream Area Charts */}
            <Area
              type="monotone"
              dataKey="viewers"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViewers)"
              name="Total Connections"
            />
            <Area
              type="monotone"
              dataKey="verifiedHumans"
              stroke="#00FF00"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHumans)"
              name="Verified Humans"
            />

            {/* 24-Hour Baseline Overlay Lines (Rendered when toggled) */}
            {showBaseline && (
              <>
                <Line
                  type="monotone"
                  dataKey="baselineViewers"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#38bdf8' }}
                  activeDot={{ r: 4 }}
                  name="24H Baseline Connections"
                />
                <Line
                  type="monotone"
                  dataKey="baselineVerifiedHumans"
                  stroke="#6ee7b7"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 2, fill: '#6ee7b7' }}
                  activeDot={{ r: 4 }}
                  name="24H Baseline Humans"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
