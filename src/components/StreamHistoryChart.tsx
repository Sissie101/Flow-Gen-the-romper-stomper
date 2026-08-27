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
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { HistoryPoint, AttackEvent } from '../types';
import {
  AreaChart as ChartIcon,
  Layers,
  Activity,
  ShieldAlert,
  Bot,
  Zap,
  AlertTriangle,
  Info,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface StreamHistoryChartProps {
  data: HistoryPoint[];
  theme?: 'dark' | 'light';
}

export function StreamHistoryChart({ data, theme = 'dark' }: StreamHistoryChartProps) {
  const [showBaseline, setShowBaseline] = useState<boolean>(false);
  const [showAttackEvents, setShowAttackEvents] = useState<boolean>(true);
  const [selectedAttackEvent, setSelectedAttackEvent] = useState<AttackEvent | null>(null);

  const isLight = theme === 'light';

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

  // Extract all historical attack events in current window
  const attackEventsList: { point: HistoryPoint; event: AttackEvent }[] = [];
  enrichedData.forEach((pt) => {
    if (pt.attackEvent) {
      attackEventsList.push({ point: pt, event: pt.attackEvent });
    }
  });

  // Custom Dot renderer for Attack Event highlights on the curve
  const renderAttackEventDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!showAttackEvents || !payload || !payload.attackEvent) {
      return null;
    }

    const event = payload.attackEvent as AttackEvent;
    const isCritical = event.severity === 'critical';
    const isSelected = selectedAttackEvent?.id === event.id;

    return (
      <g
        key={`attack-dot-${payload.time}-${event.id}`}
        className="cursor-pointer group"
        onClick={() => setSelectedAttackEvent(event)}
      >
        {/* Pulsing Outer Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 16 : 12}
          fill={isCritical ? '#ef4444' : '#f59e0b'}
          opacity={0.3}
          className="animate-ping origin-center"
        />
        {/* Outer Glow Halo */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 10 : 8}
          fill={isCritical ? '#ef4444' : '#f59e0b'}
          opacity={0.8}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
        {/* Inner Center Dot */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 5 : 4}
          fill="#ffffff"
        />
      </g>
    );
  };

  // Custom X-Axis Tick with Attack Overlay Marker icons
  const renderCustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const timeValue = payload.value;
    const point = enrichedData.find((p) => p.time === timeValue);
    const hasAttack = showAttackEvents && point?.attackEvent;
    const isSelected = hasAttack && selectedAttackEvent?.id === point.attackEvent?.id;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={14}
          textAnchor="middle"
          fill={hasAttack ? (isLight ? '#dc2626' : '#f87171') : (isLight ? '#71717a' : '#71717a')}
          fontSize={10}
          fontFamily="monospace"
          fontWeight={hasAttack ? 800 : 500}
        >
          {timeValue}
        </text>

        {/* Attack Event Marker Badge on the Time Axis */}
        {hasAttack && point.attackEvent && (
          <g
            className="cursor-pointer"
            onClick={() => setSelectedAttackEvent(point.attackEvent!)}
            transform="translate(-10, 18)"
          >
            {/* Background pill */}
            <rect
              x={-1}
              y={0}
              width={22}
              height={14}
              rx={3}
              fill={point.attackEvent.severity === 'critical' ? (isLight ? '#fee2e2' : '#450a0a') : (isLight ? '#fef3c7' : '#451a03')}
              stroke={point.attackEvent.severity === 'critical' ? '#ef4444' : '#f59e0b'}
              strokeWidth={isSelected ? 1.5 : 1}
            />
            {/* Mini Threat Icon Representation */}
            <text
              x={10}
              y={10}
              textAnchor="middle"
              fontSize={8}
              fontWeight={900}
              fill={point.attackEvent.severity === 'critical' ? '#ef4444' : '#f59e0b'}
              fontFamily="monospace"
            >
              {point.attackEvent.type === 'bot_spike' ? '⚡' : '🔥'}
            </text>
          </g>
        )}
      </g>
    );
  };

  // Custom styled Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentViewers = payload.find((p: any) => p.dataKey === 'viewers')?.value ?? 0;
      const currentHumans = payload.find((p: any) => p.dataKey === 'verifiedHumans')?.value ?? 0;
      const baseViewers = payload.find((p: any) => p.dataKey === 'baselineViewers')?.value;
      const baseHumans = payload.find((p: any) => p.dataKey === 'baselineVerifiedHumans')?.value;
      const attackEvent = payload[0]?.payload?.attackEvent as AttackEvent | undefined;

      const viewerVariance =
        baseViewers && baseViewers > 0
          ? Math.round(((currentViewers - baseViewers) / baseViewers) * 100)
          : 0;

      return (
        <div
          className={`p-4 shadow-2xl rounded-xl text-xs font-mono max-w-xs border transition-all ${
            isLight
              ? 'bg-white border-zinc-300 text-zinc-900 shadow-zinc-300/50'
              : 'bg-black border-white/20 text-white'
          }`}
        >
          <p className="text-zinc-500 mb-2 font-sans font-bold uppercase tracking-wider text-[10px]">
            TIMESTAMP: {label}
          </p>

          {/* Historical Attack Event Alert Banner in Tooltip */}
          {attackEvent && showAttackEvents && (
            <div
              className={`mb-3 p-2.5 rounded-lg border flex flex-col gap-1 ${
                attackEvent.severity === 'critical'
                  ? isLight
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                  : isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-black text-[10px] tracking-wider uppercase">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {attackEvent.title}
                </span>
                <span
                  className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                    attackEvent.severity === 'critical'
                      ? 'bg-rose-500 text-white border-rose-600'
                      : 'bg-amber-500 text-black border-amber-600'
                  }`}
                >
                  {attackEvent.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] font-sans font-medium text-zinc-400">
                {attackEvent.detail}
              </p>
              {attackEvent.magnitude && (
                <p className="text-[10px] font-mono font-bold text-rose-400 mt-0.5">
                  SURGE INTENSITY: <strong className="text-white">{attackEvent.magnitude}</strong>
                </p>
              )}
            </div>
          )}

          <div className={`space-y-1.5 pb-2 border-b ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
            <span className={`text-[9px] font-black uppercase tracking-wider block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              REAL-TIME METRICS
            </span>
            <p className="text-rose-500 font-bold uppercase text-[10px] flex justify-between gap-4">
              <span>TOTAL CONNS:</span>
              <span className={`font-extrabold text-xs ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {currentViewers.toLocaleString()}
              </span>
            </p>
            <p className={`font-bold uppercase text-[10px] flex justify-between gap-4 ${isLight ? 'text-emerald-700' : 'text-[#00FF00]'}`}>
              <span>HUMAN TOKENS:</span>
              <span className={`font-extrabold text-xs ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {currentHumans.toLocaleString()}
              </span>
            </p>
          </div>

          {showBaseline && baseViewers !== undefined && baseHumans !== undefined && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block">
                24H HISTORICAL BASELINE
              </span>
              <p className="text-sky-400 font-bold uppercase text-[10px] flex justify-between gap-4">
                <span>BASE TOTAL:</span>
                <span className={`font-extrabold text-xs ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {baseViewers.toLocaleString()}
                </span>
              </p>
              <p className="text-emerald-400 font-bold uppercase text-[10px] flex justify-between gap-4">
                <span>BASE HUMANS:</span>
                <span className={`font-extrabold text-xs ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {baseHumans.toLocaleString()}
                </span>
              </p>

              <div className={`mt-2 pt-2 border-t text-[10px] font-sans ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
                <p className="text-zinc-400 font-medium">
                  CONNS VS 24H BASELINE:{' '}
                  <span
                    className={`font-black font-mono ${
                      viewerVariance > 40 ? 'text-rose-500' : isLight ? 'text-emerald-700' : 'text-[#00FF00]'
                    }`}
                  >
                    {viewerVariance > 0 ? `+${viewerVariance}%` : `${viewerVariance}%`}
                  </span>
                </p>
              </div>
            </div>
          )}

          {!showBaseline && currentViewers > currentHumans && (
            <p className={`text-amber-500 text-[10px] mt-2 pt-2 border-t font-sans font-medium ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
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
      className={`p-6 rounded-2xl border flex flex-col min-h-[410px] transition-all shadow-sm ${
        isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-black border-white/10 text-white'
      }`}
    >
      {/* Header with Title and Control Toggles */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b mb-4 gap-4 shrink-0 font-mono ${
        isLight ? 'border-zinc-200' : 'border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded border ${isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900 border-white/10'}`}>
            <ChartIcon className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#00FF00]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                TRAFFIC DIFFERENTIAL &amp; ATTACK EVENT ANALYSIS
              </h3>
              {attackEventsList.length > 0 && (
                <span className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-black uppercase flex items-center gap-1 border ${
                  isLight
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-rose-950/80 text-rose-400 border-rose-500/40 animate-pulse'
                }`}>
                  <ShieldAlert className="w-2.5 h-2.5 text-rose-500" />
                  {attackEventsList.length} {attackEventsList.length === 1 ? 'ATTACK EVENT' : 'ATTACK EVENTS'}
                </span>
              )}
            </div>
            <p className={`text-[10px] font-medium font-sans ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Real-time discrepancy vs channel's 24-hour baseline with visual threat event markers
            </p>
          </div>
        </div>

        {/* View mode toggle controls */}
        <div className="flex items-center gap-2.5 flex-wrap font-mono">
          {/* Attack Markers Toggle */}
          <button
            id="btn-toggle-attack-markers"
            onClick={() => setShowAttackEvents(!showAttackEvents)}
            className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
              showAttackEvents
                ? isLight
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-500 hover:text-zinc-900'
                : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-white'
            }`}
            title="Toggle visual markers for bot deployment surges and attack events on the time axis"
          >
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span>ATTACK MARKERS: {showAttackEvents ? 'ON' : 'OFF'}</span>
          </button>

          {/* Baseline vs Current Stream Toggle Pill */}
          <div className={`flex p-1 rounded border text-[9px] font-bold uppercase tracking-wider ${
            isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-950 border-white/10'
          }`}>
            <button
              id="btn-mode-current"
              onClick={() => setShowBaseline(false)}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                !showBaseline
                  ? isLight
                    ? 'bg-white text-zinc-900 font-black shadow-sm'
                    : 'bg-white text-black font-black shadow-sm'
                  : isLight
                  ? 'text-zinc-500 hover:text-zinc-900'
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
                  ? isLight
                    ? 'bg-emerald-600 text-white font-black shadow-sm'
                    : 'bg-[#00FF00] text-black font-black shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : isLight
                  ? 'text-zinc-500 hover:text-emerald-700'
                  : 'text-zinc-500 hover:text-[#00FF00]'
              }`}
            >
              <Layers className="w-3 h-3" />
              24H BASELINE
            </button>
          </div>
        </div>
      </div>

      {/* Chart Legend Badges & Attack Vector Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono font-bold tracking-wider uppercase mb-3 px-1 text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
            <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>REAL-TIME CONNS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-xs ${isLight ? 'bg-emerald-600' : 'bg-[#00FF00]'}`} />
            <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>REAL-TIME HUMANS</span>
          </div>

          {showBaseline && (
            <>
              <div className="flex items-center gap-1.5 text-sky-400">
                <div className="w-3 h-0.5 border-t-2 border-dashed border-sky-400" />
                <span>24H BASE TOTAL</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400" />
                <span>24H BASE HUMANS</span>
              </div>
            </>
          )}

          {showAttackEvents && (
            <div className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span className="font-bold">ATTACK EVENT SPIKE MARKER</span>
            </div>
          )}
        </div>

        <div className={`text-[10px] font-sans font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
          {showBaseline ? 'Comparing live traffic against 24h baseline rolling average' : 'Showing active stream telemetry'}
        </div>
      </div>

      {/* Recharts canvas */}
      <div className="flex-1 w-full min-h-[240px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={enrichedData}
            margin={{ top: 15, right: 15, left: -20, bottom: 25 }}
          >
            <defs>
              <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHumans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isLight ? '#16a34a' : '#00FF00'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isLight ? '#16a34a' : '#00FF00'} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isLight ? '#e4e4e7' : '#27272a'}
              opacity={0.6}
            />
            <XAxis
              dataKey="time"
              stroke={isLight ? '#71717a' : '#71717a'}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={renderCustomXAxisTick}
              interval={0}
            />
            <YAxis
              stroke={isLight ? '#71717a' : '#71717a'}
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Vertical Reference Lines for Attack Events */}
            {showAttackEvents &&
              attackEventsList.map(({ event, point }) => (
                <ReferenceLine
                  key={`ref-line-${event.id}`}
                  x={point.time}
                  stroke={event.severity === 'critical' ? '#ef4444' : '#f59e0b'}
                  strokeDasharray="3 3"
                  strokeWidth={selectedAttackEvent?.id === event.id ? 2 : 1}
                  opacity={0.8}
                />
              ))}

            {/* Current Stream Area Charts */}
            <Area
              type="monotone"
              dataKey="viewers"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViewers)"
              name="Total Connections"
              dot={renderAttackEventDot}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="verifiedHumans"
              stroke={isLight ? '#16a34a' : '#00FF00'}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHumans)"
              name="Verified Humans"
              activeDot={{ r: 4 }}
            />

            {/* 24-Hour Baseline Overlay Lines */}
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
                  stroke="#34d399"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 2, fill: '#34d399' }}
                  activeDot={{ r: 4 }}
                  name="24H Baseline Humans"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Historical Attack Events Timeline Strip */}
      {showAttackEvents && attackEventsList.length > 0 && (
        <div
          id="attack-events-timeline-strip"
          className={`mt-4 pt-3 border-t font-mono ${isLight ? 'border-zinc-200' : 'border-white/10'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-zinc-700' : 'text-zinc-300'
            }`}>
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              DETECTED ATTACK EVENT TIMELINE ({attackEventsList.length})
            </span>
            <span className="text-[9px] text-zinc-500 font-sans">
              Click any event below to inspect anomaly signature
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {attackEventsList.map(({ event, point }) => {
              const isSelected = selectedAttackEvent?.id === event.id;
              const isCritical = event.severity === 'critical';

              return (
                <button
                  key={`strip-event-${event.id}`}
                  onClick={() => setSelectedAttackEvent(isSelected ? null : event)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono transition-all cursor-pointer ${
                    isSelected
                      ? isCritical
                        ? isLight
                          ? 'bg-rose-100 border-rose-500 text-rose-950 font-black ring-2 ring-rose-300'
                          : 'bg-rose-950 border-rose-400 text-white font-black shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                        : isLight
                        ? 'bg-amber-100 border-amber-500 text-amber-950 font-black ring-2 ring-amber-300'
                        : 'bg-amber-950 border-amber-400 text-white font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : isLight
                      ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-300 text-zinc-800'
                      : 'bg-zinc-950 hover:bg-zinc-900 border-white/10 text-zinc-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCritical ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-extrabold">[{point.time}]</span>
                  <span>{event.title}</span>
                  {event.magnitude && (
                    <span className="font-bold text-rose-400">({event.magnitude})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expanded Selected Attack Event Detailed Card */}
          {selectedAttackEvent && (
            <div
              id="selected-attack-event-inspector"
              className={`mt-3 p-3.5 rounded-xl border text-xs font-mono transition-all animate-fadeIn ${
                selectedAttackEvent.severity === 'critical'
                  ? isLight
                    ? 'bg-rose-50/80 border-rose-300 text-zinc-900'
                    : 'bg-rose-950/40 border-rose-500/30 text-zinc-200'
                  : isLight
                  ? 'bg-amber-50/80 border-amber-300 text-zinc-900'
                  : 'bg-amber-950/40 border-amber-500/30 text-zinc-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-rose-500" />
                  <strong className="text-xs uppercase tracking-wider">{selectedAttackEvent.title}</strong>
                  <span className="text-[10px] text-zinc-500">[{selectedAttackEvent.timestamp}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      selectedAttackEvent.severity === 'critical'
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-amber-500 text-black border-amber-600'
                    }`}
                  >
                    {selectedAttackEvent.severity.toUpperCase()} SEVERITY
                  </span>
                  <button
                    onClick={() => setSelectedAttackEvent(null)}
                    className="text-[10px] text-zinc-400 hover:text-white px-1 font-bold"
                  >
                    ✕ CLOSE
                  </button>
                </div>
              </div>

              <p className="text-[11px] font-sans font-medium text-zinc-300 mb-2">
                {selectedAttackEvent.detail}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[10px]">
                <div>
                  <span className="text-zinc-500 block uppercase">VECTOR CLASSIFICATION</span>
                  <strong className="text-white">{selectedAttackEvent.type.toUpperCase().replace('_', ' ')}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase">SURGE INTENSITY</span>
                  <strong className="text-rose-400">{selectedAttackEvent.magnitude || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase">AUTOMATED SAFEGUARD</span>
                  <strong className="text-emerald-400">DISCOVERY SUPPRESSION ARMED</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
