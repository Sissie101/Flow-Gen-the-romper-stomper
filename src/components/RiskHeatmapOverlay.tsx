import React, { useState, useMemo } from 'react';
import { Channel } from '../types';
import { Flame, Activity, ShieldAlert, Zap, Layers, RefreshCw } from 'lucide-react';

interface RiskHeatmapOverlayProps {
  channel: Channel;
  isRed: boolean;
}

export function RiskHeatmapOverlay({ channel, isRed }: RiskHeatmapOverlayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'mesh'>('grid');
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);

  // Compute overall bot concentration index (0-100)
  const botConcentration = Math.round(
    Math.max(
      channel.botProbability,
      (1 - channel.authorizedRatio) * 100,
      channel.urgencyScore * 0.7
    )
  );

  // Generate 20 spatial node sectors simulating proxy/datacenter node clusters
  const sectors = useMemo(() => {
    const sectorsList = [];
    const baseBot = channel.botProbability / 100;
    const isSpiked = channel.currentViewers > channel.verifiedHumans * 1.8;

    for (let i = 0; i < 20; i++) {
      // Create variance across sectors - hot spots are concentrated in certain node ranges
      const hotspotFactor = isSpiked && (i % 3 === 0 || i > 12) ? 1.6 : 0.7;
      const pseudoRandom = Math.sin(i * 12.9898 + channel.currentViewers * 0.01) * 0.15;
      const sectorDensity = Math.min(
        100,
        Math.max(5, Math.round((baseBot * hotspotFactor + pseudoRandom) * 100))
      );

      let sectorLevel: 'green' | 'yellow' | 'red' = 'green';
      if (sectorDensity >= 50) sectorLevel = 'red';
      else if (sectorDensity >= 25) sectorLevel = 'yellow';

      const volume = Math.round(
        (channel.currentViewers / 20) * (0.8 + (i % 5) * 0.1)
      );

      sectorsList.push({
        id: i + 1,
        code: `SEC-${String.fromCharCode(65 + (i % 5))}${Math.floor(i / 5) + 1}`,
        density: sectorDensity,
        level: sectorLevel,
        volume,
        botCount: Math.round(volume * (sectorDensity / 100)),
      });
    }

    return sectorsList;
  }, [channel.id, channel.botProbability, channel.currentViewers, channel.verifiedHumans]);

  const redSectorsCount = sectors.filter((s) => s.level === 'red').length;
  const yellowSectorsCount = sectors.filter((s) => s.level === 'yellow').length;
  const peakSector = [...sectors].sort((a, b) => b.density - a.density)[0];

  // Primary pulse color based on global concentration
  const primaryHeatColor =
    botConcentration >= 50
      ? 'rose'
      : botConcentration >= 25
      ? 'amber'
      : 'emerald';

  return (
    <div
      id="risk-intensity-heatmap-card"
      className="p-6 rounded-2xl border border-white/10 bg-black flex flex-col font-mono relative overflow-hidden transition-all"
    >
      {/* Background Pulsing Mesh Gradient Effect */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 opacity-20 ${
          primaryHeatColor === 'rose'
            ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-600/40 via-rose-950/20 to-transparent animate-pulse'
            : primaryHeatColor === 'amber'
            ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-amber-950/10 to-transparent'
            : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00FF00]/20 via-emerald-950/10 to-transparent'
        }`}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded border ${
              primaryHeatColor === 'rose'
                ? 'bg-rose-950 border-rose-500/50 text-rose-400 animate-bounce'
                : primaryHeatColor === 'amber'
                ? 'bg-amber-950 border-amber-500/50 text-amber-400'
                : 'bg-emerald-950 border-[#00FF00]/50 text-[#00FF00]'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase text-white tracking-widest">
                RISK INTENSITY HEATMAP
              </h3>
              <span
                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                  primaryHeatColor === 'rose'
                    ? 'bg-rose-950 text-rose-400 border-rose-500/40 animate-pulse'
                    : primaryHeatColor === 'amber'
                    ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                    : 'bg-emerald-950 text-[#00FF00] border-[#00FF00]/40'
                }`}
              >
                {botConcentration}% BOT DENSITY
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">
              Real-time bot-traffic concentration mapped across 20 spatial IP cluster sectors
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-950 p-1 rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider">
            <button
              id="heatmap-toggle-grid"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-black font-black'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Layers className="w-3 h-3" /> SECTOR GRID
            </button>
            <button
              id="heatmap-toggle-mesh"
              onClick={() => setViewMode('mesh')}
              className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'mesh'
                  ? 'bg-[#00FF00] text-black font-black shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'text-zinc-500 hover:text-[#00FF00]'
              }`}
            >
              <Activity className="w-3 h-3" /> INTENSITY MESH
            </button>
          </div>
        </div>
      </div>

      {/* Cluster Sector Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10">
        <div className="bg-zinc-950 p-2.5 rounded border border-white/5">
          <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider block">
            CONCENTRATION INDEX
          </span>
          <span
            className={`text-sm font-black font-mono ${
              botConcentration >= 50
                ? 'text-rose-400'
                : botConcentration >= 25
                ? 'text-amber-400'
                : 'text-[#00FF00]'
            }`}
          >
            {botConcentration}% INTENSITY
          </span>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded border border-rose-500/20">
          <span className="text-[9px] font-bold uppercase text-rose-400 tracking-wider block">
            CRITICAL SECTORS
          </span>
          <span className="text-sm font-black font-mono text-rose-400">
            {redSectorsCount} / 20 HOTSPOTS
          </span>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded border border-amber-500/20">
          <span className="text-[9px] font-bold uppercase text-amber-400 tracking-wider block">
            MODERATE SECTORS
          </span>
          <span className="text-sm font-black font-mono text-amber-400">
            {yellowSectorsCount} SECTORS
          </span>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded border border-white/5">
          <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider block">
            PEAK HOTSPOT SECTOR
          </span>
          <span className="text-xs font-black font-mono text-white truncate block">
            {peakSector.code} ({peakSector.density}% BOT)
          </span>
        </div>
      </div>

      {/* Main Heatmap Visualizer */}
      {viewMode === 'grid' ? (
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-4 sm:grid-cols-10 gap-2">
            {sectors.map((sec) => {
              const isHovered = hoveredSector === sec.id;

              let bgStyle = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400';
              let pulseClass = '';

              if (sec.level === 'red') {
                bgStyle = 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
                pulseClass = 'animate-pulse';
              } else if (sec.level === 'yellow') {
                bgStyle = 'bg-amber-950/60 border-amber-500/50 text-amber-300';
              }

              return (
                <div
                  key={sec.id}
                  onMouseEnter={() => setHoveredSector(sec.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`p-2 rounded border flex flex-col justify-between items-center h-16 transition-all cursor-pointer relative ${bgStyle} ${pulseClass} ${
                    isHovered ? 'scale-105 z-20 ring-2 ring-white' : ''
                  }`}
                >
                  <span className="text-[8px] font-black tracking-widest text-zinc-400">
                    {sec.code}
                  </span>
                  <span className="text-xs font-black font-mono">{sec.density}%</span>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${
                        sec.level === 'red'
                          ? 'bg-rose-500'
                          : sec.level === 'yellow'
                          ? 'bg-amber-400'
                          : 'bg-[#00FF00]'
                      }`}
                      style={{ width: `${sec.density}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sector Hover Detail Drawer */}
          {hoveredSector !== null && (
            <div className="p-3 bg-zinc-950 rounded border border-white/20 text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 animate-fadeIn">
              {(() => {
                const sec = sectors.find((s) => s.id === hoveredSector);
                if (!sec) return null;
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 font-extrabold text-white">
                        {sec.code}
                      </span>
                      <span className="text-zinc-300">
                        TRAFFIC VOLUME: <strong className="text-white">{sec.volume.toLocaleString()}</strong>
                      </span>
                      <span className="text-zinc-300">
                        ESTIMATED BOTS: <strong className="text-rose-400">{sec.botCount.toLocaleString()}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 uppercase">CLUSTER THREAT:</span>
                      <span
                        className={`font-black uppercase px-2 py-0.5 rounded ${
                          sec.level === 'red'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            : sec.level === 'yellow'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-950 text-[#00FF00] border border-[#00FF00]/40'
                        }`}
                      >
                        {sec.level === 'red' ? 'CRITICAL BOT CONCENTRATION' : sec.level === 'yellow' ? 'ELEVATED SPOOFING' : 'VERIFIED ORGANIC'}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* Intensity Mesh Pulse View */
        <div className="space-y-4 relative z-10">
          <div className="p-6 bg-zinc-950 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden min-h-[160px]">
            {/* Pulsing Concentric Heat Circles */}
            <div
              className={`absolute w-72 h-72 rounded-full opacity-30 transition-all ${
                primaryHeatColor === 'rose'
                  ? 'bg-rose-600 animate-ping'
                  : primaryHeatColor === 'amber'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-[#00FF00] opacity-10'
              }`}
            />
            <div
              className={`absolute w-48 h-48 rounded-full opacity-40 transition-all ${
                primaryHeatColor === 'rose'
                  ? 'bg-rose-500 animate-pulse'
                  : primaryHeatColor === 'amber'
                  ? 'bg-amber-400'
                  : 'bg-[#00FF00]/20'
              }`}
            />
            <div
              className={`absolute w-24 h-24 rounded-full flex items-center justify-center font-black text-lg font-mono border shadow-2xl z-10 ${
                primaryHeatColor === 'rose'
                  ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-rose-900/50 animate-bounce'
                  : primaryHeatColor === 'amber'
                  ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-amber-900/50'
                  : 'bg-emerald-950 text-[#00FF00] border-[#00FF00] shadow-emerald-900/50'
              }`}
            >
              {botConcentration}%
            </div>

            <div className="mt-28 z-10 text-center space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {primaryHeatColor === 'rose'
                  ? 'CRITICAL BOT TRAFFIC SPOOFING CONCENTRATION'
                  : primaryHeatColor === 'amber'
                  ? 'MODERATE BOT INFLATION DETECTED'
                  : 'ORGANIC CONCURRENT CONNECTION PATTERNS'}
              </span>
              <p className="text-[10px] text-zinc-400 font-sans">
                Concentration heat index dynamically calculated from unauthenticated socket clusters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Spectrum Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10 text-[9px] font-mono uppercase tracking-wider text-zinc-400 relative z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-[#00FF00]" />
            <span>0-24% (LOW / ORGANIC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
            <span>25-49% (MODERATE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-rose-500 animate-pulse" />
            <span>&ge;50% (CRITICAL BOT DENSITY)</span>
          </div>
        </div>

        <div className="text-[10px] text-zinc-500 font-sans font-medium">
          Hover over sectors to audit local proxy/datacenter node clusters
        </div>
      </div>
    </div>
  );
}
