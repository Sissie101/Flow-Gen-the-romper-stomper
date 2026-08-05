import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Channel, ThresholdSettings } from '../types';
import { TrendAlertData } from './TrendAlertToast';
import {
  Radar,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Crosshair,
  HelpCircle,
  Activity,
  Layers,
  Cpu,
  Zap,
  Bell,
} from 'lucide-react';

interface GlobalThreatDistributionProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  thresholdSettings?: ThresholdSettings;
  onTriggerTrendAlert?: (alert: TrendAlertData) => void;
}

interface KMeansCluster {
  clusterId: number;
  rank: number;
  name: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  color: string;
  fill: string;
  borderColor: string;
  textColor: string;
  avgBot: number;
  avgVol: number;
  avgViewers: number;
  channels: Channel[];
}

export function GlobalThreatDistribution({
  channels,
  selectedChannelId,
  onSelectChannel,
  thresholdSettings,
  onTriggerTrendAlert,
}: GlobalThreatDistributionProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [xAxisMode, setXAxisMode] = useState<'viewers' | 'volatility'>('viewers');
  const [kCount, setKCount] = useState<number>(3);
  const [showClusterAreas, setShowClusterAreas] = useState<boolean>(true);
  const [showThresholdLines, setShowThresholdLines] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const authThresholdPct = thresholdSettings
    ? Math.round((1 - thresholdSettings.authorizedRatioThreshold) * 100)
    : 50;

  // Filter channels based on quick category filter
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'high_risk') {
        const isRed =
          ch.authorizedRatio < (thresholdSettings?.authorizedRatioThreshold ?? 0.5) ||
          ch.urgencyScore / 100 > (thresholdSettings?.urgencyThreshold ?? 0.4);
        return isRed;
      }
      return ch.category === categoryFilter;
    });
  }, [channels, categoryFilter, thresholdSettings]);

  // Execute K-Means Clustering on Bot Probability vs Viewer Volatility
  const { clusterAssignments, clusters } = useMemo(() => {
    if (filteredChannels.length === 0) {
      return { clusterAssignments: new Map<string, number>(), clusters: [] };
    }

    // 1. Prepare feature matrix [Bot Probability (0-100), Viewer Volatility (0-100), Viewers]
    const dataPoints = filteredChannels.map((ch) => {
      const volatility = Math.min(
        100,
        Math.round(
          (Math.abs(ch.currentViewers - ch.verifiedHumans) / Math.max(1, ch.verifiedHumans)) * 70 +
            ch.urgencyScore * 0.3
        )
      );
      return {
        id: ch.id,
        channel: ch,
        botProb: ch.botProbability,
        volatility,
        viewers: ch.currentViewers,
        // Normalized 0-1 for balanced Euclidean distance calculation
        nBot: ch.botProbability / 100,
        nVol: volatility / 100,
        nViewers: Math.min(1, ch.currentViewers / 15000),
      };
    });

    const k = Math.min(kCount, dataPoints.length);

    // Initial centroids pick spread seeds across threat spectrum
    const sorted = [...dataPoints].sort(
      (a, b) => a.nBot * 0.6 + a.nVol * 0.4 - (b.nBot * 0.6 + b.nVol * 0.4)
    );

    let centroids = [];
    for (let i = 0; i < k; i++) {
      const idx = Math.floor((i / (k - 1 || 1)) * (sorted.length - 1));
      centroids.push({
        nBot: sorted[idx]?.nBot ?? 0,
        nVol: sorted[idx]?.nVol ?? 0,
        nViewers: sorted[idx]?.nViewers ?? 0,
      });
    }

    let assignments = new Array(dataPoints.length).fill(0);
    let iterations = 0;
    let changed = true;

    // Iterative convergence
    while (changed && iterations < 20) {
      changed = false;
      iterations++;

      // Assign to nearest centroid
      dataPoints.forEach((pt, pIdx) => {
        let minDist = Infinity;
        let closest = 0;

        centroids.forEach((c, cIdx) => {
          // Weighted distance
          const dist = Math.hypot(
            (pt.nBot - c.nBot) * 1.5,
            (pt.nVol - c.nVol) * 1.2,
            (pt.nViewers - c.nViewers) * 0.4
          );
          if (dist < minDist) {
            minDist = dist;
            closest = cIdx;
          }
        });

        if (assignments[pIdx] !== closest) {
          assignments[pIdx] = closest;
          changed = true;
        }
      });

      // Recalculate centroids
      for (let cIdx = 0; cIdx < k; cIdx++) {
        const memberPts = dataPoints.filter((_, idx) => assignments[idx] === cIdx);
        if (memberPts.length > 0) {
          centroids[cIdx] = {
            nBot: memberPts.reduce((s, p) => s + p.nBot, 0) / memberPts.length,
            nVol: memberPts.reduce((s, p) => s + p.nVol, 0) / memberPts.length,
            nViewers: memberPts.reduce((s, p) => s + p.nViewers, 0) / memberPts.length,
          };
        }
      }
    }

    // Map cluster statistics
    const clusterMap = new Map<string, number>();
    dataPoints.forEach((pt, idx) => {
      clusterMap.set(pt.id, assignments[idx]);
    });

    const rawClusters = centroids.map((c, cIdx) => {
      const clusterChannels = dataPoints
        .filter((_, idx) => assignments[idx] === cIdx)
        .map((p) => p.channel);

      const avgBot =
        clusterChannels.length > 0
          ? Math.round(clusterChannels.reduce((sum, ch) => sum + ch.botProbability, 0) / clusterChannels.length)
          : Math.round(c.nBot * 100);

      const avgVol =
        clusterChannels.length > 0
          ? Math.round(
              clusterChannels.reduce((sum, ch) => {
                const vol = Math.min(
                  100,
                  (Math.abs(ch.currentViewers - ch.verifiedHumans) / Math.max(1, ch.verifiedHumans)) * 70 +
                    ch.urgencyScore * 0.3
                );
                return sum + vol;
              }, 0) / clusterChannels.length
            )
          : Math.round(c.nVol * 100);

      const avgViewers =
        clusterChannels.length > 0
          ? Math.round(clusterChannels.reduce((sum, ch) => sum + ch.currentViewers, 0) / clusterChannels.length)
          : Math.round(c.nViewers * 15000);

      return {
        cIdx,
        riskScore: avgBot * 0.6 + avgVol * 0.4,
        avgBot,
        avgVol,
        avgViewers,
        channels: clusterChannels,
      };
    });

    // Rank clusters by risk level ascending
    rawClusters.sort((a, b) => a.riskScore - b.riskScore);

    const palette = [
      {
        name: 'Verified Organic Cluster',
        riskLevel: 'LOW' as const,
        color: '#00FF00',
        fill: 'rgba(0, 255, 0, 0.12)',
        borderColor: 'rgba(0, 255, 0, 0.7)',
        textColor: 'text-[#00FF00]',
      },
      {
        name: 'Volatile Spike Cluster',
        riskLevel: 'MODERATE' as const,
        color: '#f59e0b',
        fill: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.8)',
        textColor: 'text-amber-400',
      },
      {
        name: 'Critical Bot Farm Cluster',
        riskLevel: 'CRITICAL' as const,
        color: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.18)',
        borderColor: 'rgba(239, 68, 68, 0.9)',
        textColor: 'text-rose-400',
      },
      {
        name: 'Anomalous Spoof Cluster',
        riskLevel: 'HIGH' as const,
        color: '#06b6d4',
        fill: 'rgba(6, 182, 212, 0.16)',
        borderColor: 'rgba(6, 182, 212, 0.8)',
        textColor: 'text-cyan-400',
      },
    ];

    const finalClusters: KMeansCluster[] = rawClusters.map((rc, rank) => {
      const p = palette[Math.min(rank, palette.length - 1)];
      return {
        clusterId: rc.cIdx,
        rank,
        name: p.name,
        riskLevel: p.riskLevel,
        color: p.color,
        fill: p.fill,
        borderColor: p.borderColor,
        textColor: p.textColor,
        avgBot: rc.avgBot,
        avgVol: rc.avgVol,
        avgViewers: rc.avgViewers,
        channels: rc.channels,
      };
    });

    return { clusterAssignments: clusterMap, clusters: finalClusters };
  }, [filteredChannels, kCount]);

  const handleEmitTrendAlert = () => {
    if (!onTriggerTrendAlert || clusters.length === 0) return;

    // Find highest risk cluster with member channels
    const criticalCluster = [...clusters].reverse().find((c) => c.channels.length > 0) || clusters[clusters.length - 1];
    if (!criticalCluster || criticalCluster.channels.length === 0) return;

    // Target channel with highest bot probability or viewers in this cluster
    const targetChannel = [...criticalCluster.channels].sort((a, b) => b.botProbability - a.botProbability)[0];

    onTriggerTrendAlert({
      id: `ALERT-${Date.now()}`,
      clusterName: criticalCluster.name,
      riskLevel: criticalCluster.riskLevel,
      targetChannel,
      timestamp: new Date().toLocaleTimeString(),
      description: `K-Means Cluster shift detected in Scatter Plot: ${criticalCluster.channels.length} stream(s) clustered into ${criticalCluster.name} at ${criticalCluster.avgBot}% average bot traffic.`,
    });
  };

  // Overall metrics
  const totalChannelsCount = channels.length;
  const highRiskClusterCount = channels.filter(
    (ch) =>
      ch.authorizedRatio < (thresholdSettings?.authorizedRatioThreshold ?? 0.5) ||
      ch.urgencyScore / 100 > (thresholdSettings?.urgencyThreshold ?? 0.4)
  ).length;

  // Chart Canvas Dimensions
  const svgWidth = 720;
  const svgHeight = 280;
  const margin = { top: 25, right: 35, bottom: 35, left: 45 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // D3 Scales for Chart
  const maxXValue = useMemo(() => {
    if (xAxisMode === 'volatility') return 100;
    const maxV = Math.max(...filteredChannels.map((c) => c.currentViewers), 5000);
    return Math.ceil(maxV / 1000) * 1000;
  }, [filteredChannels, xAxisMode]);

  const xScale = useMemo(() => {
    return d3.scaleLinear().domain([0, maxXValue]).range([margin.left, svgWidth - margin.right]);
  }, [maxXValue, margin.left, margin.right, svgWidth]);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([0, 100]).range([svgHeight - margin.bottom, margin.top]);
  }, [margin.top, margin.bottom, svgHeight]);

  // Compute node coordinates for all channels
  const nodeCoords = useMemo(() => {
    return filteredChannels.map((ch) => {
      const volatility = Math.min(
        100,
        Math.round(
          (Math.abs(ch.currentViewers - ch.verifiedHumans) / Math.max(1, ch.verifiedHumans)) * 70 +
            ch.urgencyScore * 0.3
        )
      );

      const xVal = xAxisMode === 'volatility' ? volatility : ch.currentViewers;
      const yVal = Math.round(ch.botProbability);

      const px = xScale(xVal);
      const py = yScale(yVal);

      const clusterId = clusterAssignments.get(ch.id) ?? 0;
      const clusterObj = clusters.find((c) => c.clusterId === clusterId);

      return {
        channel: ch,
        id: ch.id,
        name: ch.name,
        host: ch.host,
        category: ch.category,
        viewers: ch.currentViewers,
        volatility,
        botProbability: yVal,
        verifiedHumans: ch.verifiedHumans,
        authorizedRatioPct: Math.round(ch.authorizedRatio * 100),
        status: ch.status,
        px,
        py,
        clusterObj,
        isSelected: ch.id === selectedChannelId,
        isHovered: ch.id === hoveredNodeId,
      };
    });
  }, [filteredChannels, xAxisMode, xScale, yScale, clusterAssignments, clusters, selectedChannelId, hoveredNodeId]);

  // Generate D3 Convex Hull paths for each K-Means cluster
  const clusterHulls = useMemo(() => {
    if (!showClusterAreas) return [];

    return clusters
      .map((cluster) => {
        const members = nodeCoords.filter((nc) => nc.clusterObj?.clusterId === cluster.clusterId);
        if (members.length === 0) return null;

        const points: [number, number][] = members.map((m) => [m.px, m.py]);
        const cx = points.reduce((acc, p) => acc + p[0], 0) / points.length;
        const cy = points.reduce((acc, p) => acc + p[1], 0) / points.length;

        let hullPoints: [number, number][] | null = null;
        if (points.length >= 3) {
          hullPoints = d3.polygonHull(points);
        }

        const padding = 32;

        if (!hullPoints) {
          // If fewer than 3 points or collinear, generate a surrounding circle ring
          const baseRadius = Math.max(
            35,
            ...points.map((p) => Math.hypot(p[0] - cx, p[1] - cy) + 22)
          );
          hullPoints = [];
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            hullPoints.push([
              cx + Math.cos(angle) * baseRadius,
              cy + Math.sin(angle) * baseRadius,
            ]);
          }
        } else {
          // Expand hull vertices outward from centroid
          hullPoints = hullPoints.map(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.hypot(dx, dy) || 1;
            return [x + (dx / dist) * padding, y + (dy / dist) * padding];
          });
        }

        const lineGen = d3
          .line<[number, number]>()
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(d3.curveCatmullRomClosed.alpha(0.5));

        const pathString = lineGen(hullPoints) || '';

        return {
          cluster,
          cx,
          cy,
          pathString,
          memberCount: members.length,
        };
      })
      .filter(Boolean);
  }, [clusters, nodeCoords, showClusterAreas]);

  // Hovered node object
  const activeNode = nodeCoords.find((n) => n.id === hoveredNodeId) || nodeCoords.find((n) => n.isSelected);

  return (
    <div
      id="global-threat-distribution-card"
      className="p-6 rounded-2xl border border-white/10 bg-black flex flex-col font-mono relative overflow-hidden"
    >
      {/* Widget Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-4 border-b border-white/10 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-white/10">
            <Radar className="w-4 h-4 text-[#00FF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase text-white tracking-widest">
                GLOBAL THREAT DISTRIBUTION
              </h3>
              <span className="text-[8px] font-black uppercase bg-zinc-900 text-[#00FF00] border border-[#00FF00]/30 px-2 py-0.5 rounded tracking-widest flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" /> K-MEANS CLUSTERING
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">
              Algorithmic pattern mapping: Bot Activity vs Viewer Volatility across K={kCount} threat clusters
            </p>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Axis Mode Toggle */}
          <div className="flex bg-zinc-950 p-1 rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono">
            <button
              id="axis-toggle-viewers"
              onClick={() => setXAxisMode('viewers')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                xAxisMode === 'viewers'
                  ? 'bg-white text-black font-black'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              VIEWER COUNT
            </button>
            <button
              id="axis-toggle-volatility"
              onClick={() => setXAxisMode('volatility')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                xAxisMode === 'volatility'
                  ? 'bg-[#00FF00] text-black font-black'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              VOLATILITY INDEX
            </button>
          </div>

          {/* K Count Selector */}
          <div className="flex bg-zinc-950 p-1 rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono items-center gap-1">
            <span className="text-zinc-500 px-1 text-[8px]">K=</span>
            <button
              id="k-count-3"
              onClick={() => setKCount(3)}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                kCount === 3 ? 'bg-zinc-800 text-white font-extrabold' : 'text-zinc-500'
              }`}
            >
              3
            </button>
            <button
              id="k-count-4"
              onClick={() => setKCount(4)}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                kCount === 4 ? 'bg-zinc-800 text-white font-extrabold' : 'text-zinc-500'
              }`}
            >
              4
            </button>
          </div>

          {/* Cluster Hull Toggle */}
          <button
            id="btn-toggle-cluster-areas"
            onClick={() => setShowClusterAreas(!showClusterAreas)}
            className={`px-2.5 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              showClusterAreas
                ? 'bg-zinc-900 border-[#00FF00]/40 text-[#00FF00]'
                : 'bg-zinc-950 border-white/10 text-zinc-500'
            }`}
            title="Toggle K-Means Cluster Area Polygons"
          >
            <Layers className="w-3 h-3" />
            AREAS
          </button>

          {/* Threshold Lines Toggle */}
          <button
            id="btn-toggle-threshold-lines"
            onClick={() => setShowThresholdLines(!showThresholdLines)}
            className={`px-2.5 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              showThresholdLines
                ? 'bg-zinc-900 border-white/20 text-white'
                : 'bg-zinc-950 border-white/10 text-zinc-500'
            }`}
            title="Toggle Alert Threshold Boundary Lines"
          >
            <Crosshair className="w-3 h-3 text-rose-500" />
            THRESHOLDS
          </button>

          {/* Trend Scan Toast Trigger Button */}
          <button
            id="btn-scan-trend-alert"
            onClick={handleEmitTrendAlert}
            className="px-2.5 py-1.5 rounded border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            title="Scan K-Means plot and emit Trend Alert toast for the most affected stream"
          >
            <Bell className="w-3 h-3 text-rose-400 animate-pulse" />
            TREND SCAN
          </button>
        </div>
      </div>

      {/* K-Means Computed Clusters Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 my-4">
        {clusters.map((cl) => (
          <div
            key={cl.clusterId}
            className="bg-zinc-950 p-2.5 rounded-xl border flex flex-col justify-between transition-all hover:border-white/20"
            style={{ borderColor: cl.borderColor }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className={`text-[9px] font-black uppercase tracking-wider ${cl.textColor}`}>
                {cl.name}
              </span>
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase"
                style={{
                  color: cl.color,
                  borderColor: cl.borderColor,
                  backgroundColor: cl.fill,
                }}
              >
                {cl.riskLevel}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>MEMBERS:</span>
                <span className="font-extrabold text-white">{cl.channels.length} STREAMS</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>AVG BOT PROB:</span>
                <span className={`font-black ${cl.textColor}`}>{cl.avgBot}%</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>AVG VOLATILITY:</span>
                <span className="font-extrabold text-white">{cl.avgVol}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main D3 Interactive SVG Chart Canvas */}
      <div className="w-full relative bg-zinc-950/60 rounded-xl border border-white/10 p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[320px] select-none"
        >
          {/* Grid lines */}
          <g className="grid-lines" opacity={0.15}>
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={`grid-y-${y}`}
                x1={margin.left}
                y1={yScale(y)}
                x2={svgWidth - margin.right}
                y2={yScale(y)}
                stroke="#ffffff"
                strokeDasharray="2 2"
              />
            ))}
          </g>

          {/* D3 K-Means Cluster Convex Hull Polygon Areas */}
          {showClusterAreas &&
            clusterHulls.map((hull) => {
              if (!hull) return null;
              const { cluster, cx, cy, pathString } = hull;
              return (
                <g key={`hull-${cluster.clusterId}`} className="cluster-area">
                  {/* Shaded Area Polygon */}
                  <path
                    d={pathString}
                    fill={cluster.fill}
                    stroke={cluster.borderColor}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    className="transition-all duration-700 hover:opacity-90"
                  />

                  {/* Centroid Crosshair Marker */}
                  <g transform={`translate(${cx}, ${cy})`}>
                    <circle r={14} fill={cluster.fill} stroke={cluster.color} strokeWidth={1} />
                    <line x1={-8} y1={0} x2={8} y2={0} stroke={cluster.color} strokeWidth={1.5} />
                    <line x1={0} y1={-8} x2={0} y2={8} stroke={cluster.color} strokeWidth={1.5} />
                    <text
                      y={-18}
                      textAnchor="middle"
                      fill={cluster.color}
                      fontSize={8}
                      fontWeight="900"
                      className="uppercase tracking-widest font-mono"
                    >
                      {cluster.name.split(' ')[0]} CENTROID
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Threshold Boundary Reference Line */}
          {showThresholdLines && (
            <g className="threshold-boundary">
              <line
                x1={margin.left}
                y1={yScale(authThresholdPct)}
                x2={svgWidth - margin.right}
                y2={yScale(authThresholdPct)}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - margin.right - 5}
                y={yScale(authThresholdPct) - 5}
                textAnchor="end"
                fill="#ef4444"
                fontSize={8}
                fontWeight="800"
              >
                THRESHOLD BOUNDARY ({authThresholdPct}% BOT PROB)
              </text>
            </g>
          )}

          {/* Scatter Data Nodes */}
          <g className="data-nodes">
            {nodeCoords.map((node) => {
              const clusterColor = node.clusterObj?.color ?? '#00FF00';
              const radius = node.isSelected ? 9 : node.isHovered ? 8 : 6;

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.px}, ${node.py})`}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => onSelectChannel(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Outer pulse aura for selected or high threat node */}
                  {(node.isSelected || node.botProbability >= 50) && (
                    <circle
                      r={radius + 4}
                      fill="none"
                      stroke={clusterColor}
                      strokeWidth={1.5}
                      opacity={0.6}
                      className="animate-ping"
                    />
                  )}

                  {/* Core Data Circle */}
                  <circle
                    r={radius}
                    fill={clusterColor}
                    stroke={node.isSelected ? '#ffffff' : '#000000'}
                    strokeWidth={node.isSelected ? 2.5 : 1}
                  />

                  {/* Label tag for selected or hovered node */}
                  {(node.isSelected || node.isHovered) && (
                    <text
                      y={-14}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={9}
                      fontWeight="800"
                      className="font-mono shadow-xl"
                    >
                      @{node.host}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* X & Y Axis Labels */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 8}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={9}
            fontWeight="700"
          >
            {xAxisMode === 'volatility'
              ? 'VIEWER VOLATILITY INDEX (%)'
              : 'ACTIVE CONCURRENT VIEWERS (CONNECTIONS)'}
          </text>

          <text
            x={-svgHeight / 2}
            y={12}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize={9}
            fontWeight="700"
          >
            BOT PROBABILITY (%)
          </text>
        </svg>

        {/* Hover / Active Node Detail Banner */}
        {activeNode && (
          <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/95 border border-white/20 rounded-xl text-xs font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 backdrop-blur-md z-30 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: activeNode.clusterObj?.color }}
              />
              <div>
                <span className="text-[9px] font-black uppercase text-[#00FF00]">
                  @{activeNode.host} ({activeNode.category.toUpperCase()})
                </span>
                <p className="font-extrabold text-white text-xs truncate max-w-[200px]">
                  {activeNode.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-zinc-300">
                VIEWERS: <strong className="text-white">{activeNode.viewers.toLocaleString()}</strong>
              </span>
              <span className="text-zinc-300">
                BOT PROB:{' '}
                <strong
                  className={
                    activeNode.botProbability >= 50 ? 'text-rose-400' : 'text-[#00FF00]'
                  }
                >
                  {activeNode.botProbability}%
                </strong>
              </span>
              <span className="text-zinc-300">
                VOLATILITY: <strong className="text-amber-400">{activeNode.volatility}%</strong>
              </span>
              <span
                className="px-2 py-0.5 rounded border text-[9px] font-black uppercase"
                style={{
                  color: activeNode.clusterObj?.color,
                  borderColor: activeNode.clusterObj?.borderColor,
                  backgroundColor: activeNode.clusterObj?.fill,
                }}
              >
                {activeNode.clusterObj?.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
        <div className="flex items-center gap-4 flex-wrap">
          {clusters.map((cl) => (
            <div key={cl.clusterId} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: cl.fill, borderColor: cl.borderColor }}
              />
              <span className="text-zinc-300 font-bold">{cl.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 text-zinc-500 font-sans text-[10px]">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>K-Means partitions channels by minimizing distance across bot & volatility metrics</span>
        </div>
      </div>
    </div>
  );
}
