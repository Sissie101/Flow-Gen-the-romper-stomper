import React, { useState, useEffect } from 'react';
import { Channel, ChatMessage, AuditLog, HistoryPoint, ThresholdSettings, UserRole, GovernancePolicy, ThemeMode } from './types';
import {
  INITIAL_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_AUDIT_LOGS,
  generateHistory,
  SAMPLE_CHAT_TEMPLATES_BOT,
  SAMPLE_CHAT_TEMPLATES_HUMAN,
} from './data';
import { Header } from './components/Header';
import { ChannelCard } from './components/ChannelCard';
import { MetricWidget } from './components/MetricWidget';
import { StreamHistoryChart } from './components/StreamHistoryChart';
import { InteractiveSimulator } from './components/InteractiveSimulator';
import { ChatAuditor } from './components/ChatAuditor';
import { AuditLogger } from './components/AuditLogger';
import { SensitivityConfigPanel } from './components/SensitivityConfigPanel';
import { GlobalThreatDistribution } from './components/GlobalThreatDistribution';
import { RiskHeatmapOverlay } from './components/RiskHeatmapOverlay';
import { TrendAlertToast, TrendAlertData } from './components/TrendAlertToast';
import {
  playCriticalStatusSound,
  playSafeguardTriggeredSound,
  playRestoredSound,
} from './utils/sound';
import { MarketplaceIntegrationModal } from './components/MarketplaceIntegrationModal';
import { SystemOverviewModal } from './components/SystemOverviewModal';
import { SecurityGovernanceModal } from './components/SecurityGovernanceModal';
import { MicrosoftCopilotModal } from './components/MicrosoftCopilotModal';
import { QrCodeModal } from './components/QrCodeModal';
import { SoloMarketingHubModal } from './components/SoloMarketingHubModal';
import { GoogleSheetsStandardSyncModal } from './components/GoogleSheetsStandardSyncModal';
import { ShareAppModal } from './components/ShareAppModal';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';
import { ProjectTemplatesModal } from './components/ProjectTemplatesModal';
import { testConnection } from './firebase';
import { MicrosoftTask, CopilotAgentConfig, CopilotRule } from './types';
import {
  Search,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Filter,
  EyeOff,
  BellOff,
  Wallet,
  CheckCircle,
  AlertOctagon,
  Info,
  Share2,
  Check,
  Mail,
  Smartphone,
  MessageSquare,
  Copy,
  Store,
  Lock,
  HelpCircle,
  FileText,
  Download,
  Code,
  QrCode,
  LineChart,
  Activity,
  Bot,
  Flame,
  CheckSquare,
  Zap,
  Plus,
  X,
  HeartHandshake,
  FileSpreadsheet,
  LayoutTemplate,
} from 'lucide-react';

const INITIAL_COPILOT_RULES: CopilotRule[] = [
  {
    id: 'rule-1',
    name: 'Bot Probability > 90% Auto-Freeze & SOC Alert',
    conditionType: 'bot_prob_gt',
    thresholdValue: 90,
    autoFreezeStream: true,
    dispatchMsTask: true,
    alertSocChannel: true,
    suppressDiscovery: true,
    enabled: true,
    assignedRole: 'SOC Security Lead',
  },
  {
    id: 'rule-2',
    name: 'Low Authorized Viewer Ratio (< 40%) Task Dispatch',
    conditionType: 'authorized_ratio_lt',
    thresholdValue: 40,
    autoFreezeStream: false,
    dispatchMsTask: true,
    alertSocChannel: true,
    suppressDiscovery: true,
    enabled: true,
    assignedRole: 'Fraud Operations Desk',
  },
  {
    id: 'rule-3',
    name: 'Unauthorized Viewer Spike (> 5,000 Bots)',
    conditionType: 'unauthorized_viewers_gt',
    thresholdValue: 5000,
    autoFreezeStream: true,
    dispatchMsTask: true,
    alertSocChannel: false,
    suppressDiscovery: false,
    enabled: false,
    assignedRole: 'Compliance Officer',
  },
];

const INITIAL_MS_TASKS: MicrosoftTask[] = [
  {
    id: 'ms-task-1',
    title: '[SOC-CRITICAL] Audit TikTok Shop Bot Surge Anomaly',
    description: 'Investigate 88% bot probability spike detected on TikTok Shop #104. Verify cashout freeze and review buyer chat velocity.',
    priority: 'high',
    status: 'inProgress',
    channelId: 'ch-3',
    channelName: 'TikTok Shop #104 (Beauty Deals)',
    assignedRole: 'SOC Security Desk',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    syncedToMicrosoft: true,
    msGraphTaskId: 'graph_task_9918a',
    createdTimestamp: '10:14 AM',
    sourceTrigger: 'copilot_agent',
  },
  {
    id: 'ms-task-2',
    title: '[FINANCE-AUDIT] Review Cashout Freeze Override for Whatnot #202',
    description: 'Verify seller merchant dispute history before approving escrow funds release on suppressed stream.',
    priority: 'high',
    status: 'notStarted',
    channelId: 'ch-2',
    channelName: 'Whatnot #202 (Retro Games)',
    assignedRole: 'Finance Operations Lead',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    syncedToMicrosoft: true,
    msGraphTaskId: 'graph_task_8820b',
    createdTimestamp: '11:05 AM',
    sourceTrigger: 'autofreeze_rule',
  },
];

export default function App() {
  // --- STATE ---
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chParam = params.get('channel');
      if (chParam && INITIAL_CHANNELS.some((c) => c.id === chParam)) {
        return chParam;
      }
    }
    return 'ch-1';
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [trendAlert, setTrendAlert] = useState<TrendAlertData | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flowgen_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
      }
      try {
        localStorage.setItem('flowgen_theme', theme);
      } catch {
        // Storage access handled gracefully
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [streamIdCopied, setStreamIdCopied] = useState<boolean>(false);
  const [summaryCopied, setSummaryCopied] = useState<boolean>(false);
  const [metadataJsonCopied, setMetadataJsonCopied] = useState<boolean>(false);
  const [showMiniGraph, setShowMiniGraph] = useState<boolean>(false);
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState<boolean>(false);
  const [isSystemsGuideOpen, setIsSystemsGuideOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isSoloMarketingOpen, setIsSoloMarketingOpen] = useState<boolean>(false);
  const [isGoogleSheetsStandardOpen, setIsGoogleSheetsStandardOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [msTasks, setMsTasks] = useState<MicrosoftTask[]>(INITIAL_MS_TASKS);
  const [taskDispatchedToast, setTaskDispatchedToast] = useState<string | null>(null);
  const [copilotConfig, setCopilotConfig] = useState<CopilotAgentConfig>({
    isConnected: true,
    tenantId: 'contoso-tenant-9941a-ms365',
    clientId: '00000000-0000-0000-0000-000000000000',
    targetList: 'Microsoft To Do',
    connectedAccountEmail: 'sec.lead@contoso.onmicrosoft.com',
    autoSyncAnomalies: true,
    autoAssignHighSeverity: true,
    copilotMode: 'autonomous',
    msGraphWebhookEndpoint: 'https://ais-dev-taobwajdvkqedzn2nylqmc-270895439927.us-east5.run.app/api/webhooks/ms-graph',
  });

  const handleAddMsTask = (newTaskData: Omit<MicrosoftTask, 'id' | 'createdTimestamp' | 'syncedToMicrosoft'>) => {
    const newTask: MicrosoftTask = {
      ...newTaskData,
      id: `ms-task-${Date.now()}`,
      createdTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      syncedToMicrosoft: true,
      msGraphTaskId: `graph_task_${Math.random().toString(16).slice(2, 8)}`,
    };
    setMsTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleMsTaskStatus = (taskId: string) => {
    setMsTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'inProgress' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteMsTask = (taskId: string) => {
    setMsTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleDispatchCurrentStreamTask = () => {
    if (!checkRbacPermission('author', 'Dispatch Microsoft Task')) return;
    if (!selectedChannel) return;

    handleAddMsTask({
      title: `[SOC-DISPATCH] Audit ${selectedChannel.name}`,
      description: `Dispatched from FlowGen Console. Current Viewers: ${selectedChannel.currentViewers}, Verified Humans: ${selectedChannel.verifiedHumans} (${Math.round(selectedChannel.authorizedRatio * 100)}%), Bot Prob: ${Math.round(selectedChannel.botProbability)}%.`,
      priority: selectedChannel.authorizedRatio < 0.5 ? 'high' : 'medium',
      status: 'notStarted',
      assignedRole: 'Security Operations Lead',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      channelId: selectedChannel.id,
      channelName: selectedChannel.name,
      sourceTrigger: 'manual',
    });

    setTaskDispatchedToast(`Task pushed to ${copilotConfig.targetList}!`);
    setTimeout(() => setTaskDispatchedToast(null), 3500);
  };

  const [copilotRules, setCopilotRules] = useState<CopilotRule[]>(INITIAL_COPILOT_RULES);
  const [isCopilotRulesOpen, setIsCopilotRulesOpen] = useState<boolean>(false);

  const handleToggleRuleEnabled = (ruleId: string) => {
    setCopilotRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setCopilotRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleTestRunRule = (rule: CopilotRule) => {
    if (!selectedChannel) return;

    if (rule.dispatchMsTask) {
      handleAddMsTask({
        title: `[COPILOT-RULE] ${rule.name} Triggered`,
        description: `Triggered on ${selectedChannel.name}. Auto-Freeze: ${rule.autoFreezeStream ? 'YES' : 'NO'}, Alert SOC: ${rule.alertSocChannel ? 'YES' : 'NO'}.`,
        priority: 'high',
        status: 'notStarted',
        assignedRole: rule.assignedRole,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        channelId: selectedChannel.id,
        channelName: selectedChannel.name,
        sourceTrigger: 'copilot_agent',
      });
    }

    if (rule.autoFreezeStream) {
      setChannels((prevChannels) =>
        prevChannels.map((ch) =>
          ch.id === selectedChannel.id
            ? {
                ...ch,
                cashoutFrozen: true,
                discoverySuppressed: rule.suppressDiscovery ? true : ch.discoverySuppressed,
                status: 'flagged_and_suppressed',
              }
            : ch
        )
      );
    }

    setTaskDispatchedToast(`Copilot Rule "${rule.name}" test executed on ${selectedChannel.name}!`);
    setTimeout(() => setTaskDispatchedToast(null), 3500);
  };

  const handleAddNewRulePrompt = () => {
    const newRule: CopilotRule = {
      id: `rule-${Date.now()}`,
      name: 'Custom High Urgency Threat Trigger',
      conditionType: 'bot_prob_gt',
      thresholdValue: 85,
      autoFreezeStream: true,
      dispatchMsTask: true,
      alertSocChannel: true,
      suppressDiscovery: true,
      enabled: true,
      assignedRole: 'Security Operations Desk',
    };
    setCopilotRules((prev) => [newRule, ...prev]);
    setTaskDispatchedToast('New Copilot Rule added to active stream automation matrix!');
    setTimeout(() => setTaskDispatchedToast(null), 3000);
  };

  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [rbacAccessWarning, setRbacAccessWarning] = useState<string | null>(null);
  const [rateLimitCount, setRateLimitCount] = useState<number>(14);
  const [policy, setPolicy] = useState<GovernancePolicy>({
    role: 'admin',
    encryptionStandard: 'AES-256-GCM',
    transportSecurity: 'TLS 1.3 / ECDHE',
    rateLimitMaxRequestsPerMin: 100,
    dataAccessAnomalyDetection: true,
    piiAnonymizationEnabled: true,
    zeroRetentionMode: false,
    immutableLoggingEnabled: true,
  });

  const checkRbacPermission = (requiredRole: UserRole, actionName: string): boolean => {
    // Increment API request counter for rate limiting tracking
    setRateLimitCount((prev) => Math.min(100, prev + 1));

    if (userRole === 'viewer') {
      setRbacAccessWarning(`RBAC RESTRICTION: Viewer role has read-only privileges. Cannot perform "${actionName}". Switch to Admin role in Security Hub.`);
      setTimeout(() => setRbacAccessWarning(null), 4500);
      return false;
    }
    if (requiredRole === 'admin' && userRole === 'author') {
      setRbacAccessWarning(`RBAC RESTRICTION: Author role cannot perform "${actionName}". Requires Admin privilege.`);
      setTimeout(() => setRbacAccessWarning(null), 4500);
      return false;
    }
    return true;
  };

  // Customizable Sensitivity Threshold Settings
  const [thresholdSettings, setThresholdSettings] = useState<ThresholdSettings>({
    authorizedRatioThreshold: 0.50,
    urgencyThreshold: 0.40,
  });
  
  // Historical charts map: { [channelId]: HistoryPoint[] }
  const [histories, setHistories] = useState<Record<string, HistoryPoint[]>>(() => {
    const initialHistories: Record<string, HistoryPoint[]> = {};
    INITIAL_CHANNELS.forEach((ch) => {
      initialHistories[ch.id] = generateHistory(ch.currentViewers, ch.verifiedHumans);
    });
    return initialHistories;
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'shopping' | 'crypto' | 'gaming' | 'alternative' | 'high_risk'>('all');

  const selectedChannel = channels.find((ch) => ch.id === selectedChannelId) || channels[0];

  // Helper evaluator for risk status using current threshold settings
  const isRedChannel = (ch: Channel) =>
    ch.authorizedRatio < thresholdSettings.authorizedRatioThreshold ||
    ch.urgencyScore / 100 > thresholdSettings.urgencyThreshold;

  // --- DYNAMIC HEARTBEAT EFFECTS ---
  // Fluctuate connection numbers every 4 seconds to simulate active streaming metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update channel viewer metrics
      setChannels((prevChannels) =>
        prevChannels.map((ch) => {
          // Slight natural random fluctuation (-2% to +2%)
          const viewerFluctuation = 1 + (Math.random() * 0.04 - 0.02);
          const humanFluctuation = 1 + (Math.random() * 0.02 - 0.01);
          
          let nextViewers = Math.round(ch.currentViewers * viewerFluctuation);
          let nextHumans = Math.round(ch.verifiedHumans * humanFluctuation);
          
          // Constrain sanity
          if (nextHumans > nextViewers) nextHumans = nextViewers;
          if (nextViewers < 100) nextViewers = 100;
          if (nextHumans < 50) nextHumans = 50;

          const nextRatio = nextHumans / nextViewers;
          
          // Re-calculate safety metrics if not manually overridden
          let nextStatus = ch.status;
          let nextDiscovery = ch.discoverySuppressed;
          let nextPush = ch.promotionalMuted;
          let nextCashout = ch.cashoutFrozen;

          // If ratio dips below current sensitivity threshold dynamically, trigger automatic safeguards
          const isBelowThreshold = nextRatio < thresholdSettings.authorizedRatioThreshold;
          if (isBelowThreshold) {
            if (ch.status === 'safe') {
              nextStatus = 'flagged_and_suppressed';
              nextDiscovery = true;
              nextPush = true;
              nextCashout = true;
              
              playSafeguardTriggeredSound();
              playCriticalStatusSound();

              // Push log
              triggerSystemLog(
                ch.id,
                'safeguard_triggered',
                `Ratio dipped to ${Math.round(nextRatio * 100)}% (Threshold: ${Math.round(thresholdSettings.authorizedRatioThreshold * 100)}%). System triggered lockdown rules.`,
                'Automated discovery suppression & asset freeze activated.',
                'critical'
              );
            }
          } else {
            // If it recovers, let's keep it safe (except if it was frozen manually)
            if (ch.status === 'flagged_and_suppressed') {
              nextStatus = 'safe';
              nextDiscovery = false;
              nextPush = false;
              nextCashout = false;

              playRestoredSound();

              triggerSystemLog(
                ch.id,
                'status_restored',
                `Ratio recovered to ${Math.round(nextRatio * 100)}% (Threshold: ${Math.round(thresholdSettings.authorizedRatioThreshold * 100)}%). All signals verified safe.`,
                'Lifted suppression blocks and cashout freeze.',
                'low'
              );
            }
          }

          return {
            ...ch,
            currentViewers: nextViewers,
            verifiedHumans: nextHumans,
            authorizedRatio: nextRatio,
            status: nextStatus,
            discoverySuppressed: nextDiscovery,
            promotionalMuted: nextPush,
            cashoutFrozen: nextCashout,
          };
        })
      );

      // 2. Append new history points to charts
      setHistories((prevHistories) => {
        const nextHistories = { ...prevHistories };
        channels.forEach((ch) => {
          const channelHistory = nextHistories[ch.id] || [];
          const nowStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
          
          // Slide array window to maintain last 10 points
          const slicedHistory = channelHistory.length >= 10 ? channelHistory.slice(1) : channelHistory;
          
          nextHistories[ch.id] = [
            ...slicedHistory,
            {
              time: nowStr,
              viewers: ch.currentViewers,
              verifiedHumans: ch.verifiedHumans,
            },
          ];
        });
        return nextHistories;
      });

      // 3. Occasionally inject background chats (either bot spam or organic user questions)
      if (Math.random() > 0.4 && selectedChannel) {
        const isSelectedHighRisk = selectedChannel.authorizedRatio < thresholdSettings.authorizedRatioThreshold;
        const useBotTemplate = isSelectedHighRisk ? Math.random() > 0.3 : Math.random() > 0.9;
        
        const templates = useBotTemplate ? SAMPLE_CHAT_TEMPLATES_BOT : SAMPLE_CHAT_TEMPLATES_HUMAN;
        const randomText = templates[Math.floor(Math.random() * templates.length)];
        const randomSender = useBotTemplate
          ? `bot_${Math.floor(1000 + Math.random() * 9000)}`
          : `user_${Math.floor(100 + Math.random() * 900)}`;

        injectChatMessage(selectedChannel.id, randomText, randomSender, !useBotTemplate);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [channels, selectedChannelId, thresholdSettings.authorizedRatioThreshold]);

  // --- HELPER WRITERS ---
  const triggerSystemLog = (
    channelId: string,
    type: AuditLog['type'],
    detail: string,
    actionTaken: string,
    severity: AuditLog['severity']
  ) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const prevLog = auditLogs[0];
    const prevHash = prevLog?.blockHash || '0x00000000000000000000000000000000';
    const rawSeed = `${channelId}:${type}:${detail}:${timeStr}:${prevHash}`;
    let hashVal = 0;
    for (let i = 0; i < rawSeed.length; i++) {
      hashVal = (hashVal << 5) - hashVal + rawSeed.charCodeAt(i);
      hashVal |= 0;
    }
    const blockHash = `0x${Math.abs(hashVal).toString(16)}8f99a01b`;

    const newLog: AuditLog = {
      id: `log-dynamic-${Date.now()}-${Math.random()}`,
      channelId,
      timestamp: timeStr,
      type,
      detail,
      actionTaken,
      severity,
      blockHash,
      prevHash,
      triggeredByRole: userRole,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const injectChatMessage = (
    channelId: string,
    content: string,
    sender: string,
    isHuman: boolean
  ) => {
    // Basic heuristics filter to compute suspiciousness
    const containsCaps = content === content.toUpperCase() && content.length > 8;
    const containsUrgency = /(BUY NOW|ONLY|🚨|🚀|FAST|DISCOUNT|MOON|JOIN|STEAL|OFFER|MESS|CRY|LIMITED|SELLING OUT)/gi.test(content);
    
    let suspiciousnessScore = isHuman ? 0.02 : 0.45;
    let flaggedReason: string | null = null;

    if (containsUrgency && containsCaps) {
      suspiciousnessScore = 0.98;
      flaggedReason = 'Aggressive Urgency Spam & Formatting';
    } else if (containsUrgency) {
      suspiciousnessScore = 0.78;
      flaggedReason = 'High-pressure Scarcity Keywords';
    } else if (containsCaps) {
      suspiciousnessScore = 0.60;
      flaggedReason = 'Capitalized Chat Outburst';
    }

    const newMessage: ChatMessage = {
      id: `msg-dynamic-${Date.now()}-${Math.random()}`,
      channelId,
      sender,
      isVerified: isHuman,
      content,
      timestamp: new Date().toTimeString().split(' ')[0],
      suspiciousnessScore,
      flaggedReason,
    };

    setChatMessages((prev) => [...prev, newMessage]);

    // If highly suspicious message, trigger log
    if (suspiciousnessScore > 0.7) {
      setChannels((prevChannels) =>
        prevChannels.map((ch) => {
          if (ch.id === channelId) {
            const nextUrgency = Math.min(100, ch.urgencyScore + 8);
            return { ...ch, urgencyScore: nextUrgency };
          }
          return ch;
        })
      );
    }
  };

  // --- INTERACTIVE SIMULATOR HANDLERS ---
  const handleDeployBots = () => {
    if (!selectedChannel) return;

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === selectedChannelId) {
          const nextViewers = ch.currentViewers + 4500;
          const nextRatio = ch.verifiedHumans / nextViewers;
          
          return {
            ...ch,
            currentViewers: nextViewers,
            authorizedRatio: nextRatio,
            botProbability: 86,
            urgencyScore: Math.min(100, ch.urgencyScore + 15),
            status: 'flagged_and_suppressed',
            discoverySuppressed: true,
            promotionalMuted: true,
            cashoutFrozen: true,
          };
        }
        return ch;
      })
    );

    // Logs
    playSafeguardTriggeredSound();
    playCriticalStatusSound();

    const nowStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Record attack event in stream historical chart points
    setHistories((prev) => {
      const currentList = prev[selectedChannelId] || [];
      if (currentList.length === 0) return prev;
      const updatedList = [...currentList];
      const lastIndex = updatedList.length - 1;
      updatedList[lastIndex] = {
        ...updatedList[lastIndex],
        attackEvent: {
          id: `sim-bot-${Date.now()}`,
          type: 'bot_spike',
          title: 'BOT DEPLOYMENT SPIKE',
          detail: 'Simulator Trigger: +4,500 unauthenticated viewbots launched simultaneously.',
          magnitude: '+4,500 Bots',
          severity: 'critical',
          timestamp: nowStr,
        },
      };
      return {
        ...prev,
        [selectedChannelId]: updatedList,
      };
    });

    triggerSystemLog(
      selectedChannelId,
      'anomaly_detected',
      'Deploying Viewbot Attack: +4,500 simultaneous unauthenticated guest connections initiated.',
      'Marked connections as bot clusters.',
      'high'
    );
    triggerSystemLog(
      selectedChannelId,
      'safeguard_triggered',
      'Authorized Viewer Ratio crashed below 50%. Coordinated bot cluster pattern confirmed.',
      'Enforced Discovery Suppression, Muted promotional notifications, Frozen merchant instant-cashout.',
      'critical'
    );

    // Inject hot spam messages
    setTimeout(() => {
      injectChatMessage(selectedChannelId, "ALERT!!! ONLY 3 LEFT IN STOCK! ORDER NOW!", "bot_attacker_9", false);
      injectChatMessage(selectedChannelId, "BUY NOW OR CRY LATER!! CHEAPEST DEAL", "bot_attacker_2", false);
      injectChatMessage(selectedChannelId, "GET 5 FOR THE PRICE OF 1!!! CLICK TO BUY NOW!!!", "bot_attacker_7", false);
    }, 400);
  };

  const handleDeployHype = () => {
    if (!selectedChannel) return;

    playCriticalStatusSound();

    const nowStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Record attack event in stream historical chart points
    setHistories((prev) => {
      const currentList = prev[selectedChannelId] || [];
      if (currentList.length === 0) return prev;
      const updatedList = [...currentList];
      const lastIndex = updatedList.length - 1;
      updatedList[lastIndex] = {
        ...updatedList[lastIndex],
        attackEvent: {
          id: `sim-hype-${Date.now()}`,
          type: 'fomo_hype',
          title: 'HYPE FOMO SPIKE',
          detail: 'Simulator Trigger: Extreme sales pressure & artificial scarcity injection.',
          magnitude: '95% Urgency',
          severity: 'high',
          timestamp: nowStr,
        },
      };
      return {
        ...prev,
        [selectedChannelId]: updatedList,
      };
    });

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === selectedChannelId) {
          return {
            ...ch,
            urgencyScore: 95,
            botProbability: Math.min(100, ch.botProbability + 10),
          };
        }
        return ch;
      })
    );

    triggerSystemLog(
      selectedChannelId,
      'anomaly_detected',
      'Interactive Simulator: High-pressure marketing urgency event triggered.',
      'Monitored chat feed for extreme scarcity loops.',
      'medium'
    );

    // Spam intense sales copy
    injectChatMessage(selectedChannelId, "🚨 OMG RUNNING OUT FAST! ORDER TO PREVENT DISAPPOINTMENT!", "host_shill", false);
    injectChatMessage(selectedChannelId, "LIMITED STOCK GO GO GO!!!", "shill_bot_99", false);
    injectChatMessage(selectedChannelId, "Got mine, almost sold out guys hurry!!", "guest_shill_00", false);
  };

  const handleCleanTraffic = () => {
    if (!selectedChannel) return;

    playRestoredSound();

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === selectedChannelId) {
          const nextViewers = Math.round(ch.verifiedHumans * 1.1); // return to normal organic
          const nextRatio = ch.verifiedHumans / nextViewers;

          return {
            ...ch,
            currentViewers: nextViewers,
            authorizedRatio: nextRatio,
            botProbability: 4,
            urgencyScore: 12,
            status: 'safe',
            discoverySuppressed: false,
            promotionalMuted: false,
            cashoutFrozen: false,
          };
        }
        return ch;
      })
    );

    triggerSystemLog(
      selectedChannelId,
      'status_restored',
      'Traffic Purge: Cleared unauthenticated guest IP pool and closed inactive viewer sockets.',
      'Restored discoverability status to normal and unblocked payments.',
      'low'
    );
  };

  const handleCopySummary = () => {
    if (!selectedChannel) return;
    const isRed = isRedChannel(selectedChannel);
    const securityStatus = isRed ? 'RED: HIGH RISK FRAUD' : 'GREEN: VERIFIED SECURE';
    const marketplaceInfo = selectedChannel.marketplacePlatform
      ? `\n• Marketplace Connector: ${selectedChannel.marketplacePlatform.toUpperCase()}`
      : '';
    const storeInfo = selectedChannel.storeUrl
      ? `\n• Store URL: ${selectedChannel.storeUrl}`
      : '';

    const summaryText =
      `==================================================\n` +
      ` FLOWGEN LAYER 04 DISCRIMINATOR - AUDIT SUMMARY\n` +
      `==================================================\n` +
      `• Stream Title: ${selectedChannel.name}\n` +
      `• Stream Host: @${selectedChannel.host}\n` +
      `• Stream ID: ${selectedChannel.id}\n` +
      `• Category: ${selectedChannel.category.toUpperCase()}${marketplaceInfo}${storeInfo}\n\n` +
      `[SECURITY & TRAFFIC METRICS]\n` +
      `• Security Status: ${securityStatus}\n` +
      `• Human Ratio: ${Math.round(selectedChannel.authorizedRatio * 100)}%\n` +
      `• Verified Humans: ${selectedChannel.verifiedHumans.toLocaleString()}\n` +
      `• Concurrent Connections: ${selectedChannel.currentViewers.toLocaleString()}\n` +
      `• Bot Probability: ${selectedChannel.botProbability}%\n` +
      `• Urgency Risk Score: ${selectedChannel.urgencyScore}/100\n\n` +
      `[SAFEGUARDS ACTIVE]\n` +
      `• Discovery Suppressed: ${selectedChannel.discoverySuppressed ? 'YES' : 'NO'}\n` +
      `• Promotional Muted: ${selectedChannel.promotionalMuted ? 'YES' : 'NO'}\n` +
      `• Cashout Frozen: ${selectedChannel.cashoutFrozen ? 'YES' : 'NO'}\n` +
      `==================================================\n` +
      `Generated by FlowGen Zero-Trust Discriminator Engine`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText).then(() => {
        setSummaryCopied(true);
        setTimeout(() => setSummaryCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const handleDownloadCSVReport = () => {
    if (!selectedChannel) return;

    const channelHistory = histories[selectedChannel.id] || [];
    const channelLogs = auditLogs.filter((log) => log.channelId === selectedChannel.id);

    const escapeCsv = (val: string | number | boolean | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val);
      // Protect against CSV Formula Injection (CWE-1236)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const timestamp = new Date().toISOString();
    const isRed = isRedChannel(selectedChannel);

    let csvContent = `FLOWGEN AUDIT REPORT & METRICS EXPORT\n`;
    csvContent += `Generated At,${escapeCsv(timestamp)}\n\n`;

    // Section 1: Stream Metadata
    csvContent += `STREAM AUDIT METADATA\n`;
    csvContent += `Field,Value\n`;
    csvContent += `Stream ID,${escapeCsv(selectedChannel.id)}\n`;
    csvContent += `Stream Title,${escapeCsv(selectedChannel.name)}\n`;
    csvContent += `Host,${escapeCsv(`@${selectedChannel.host}`)}\n`;
    csvContent += `Category,${escapeCsv(selectedChannel.category.toUpperCase())}\n`;
    csvContent += `Marketplace Platform,${escapeCsv(selectedChannel.marketplacePlatform || 'N/A')}\n`;
    csvContent += `Store URL,${escapeCsv(selectedChannel.storeUrl || 'N/A')}\n`;
    csvContent += `Security Risk Status,${escapeCsv(isRed ? 'RED: HIGH RISK FRAUD' : 'GREEN: VERIFIED SECURE')}\n`;
    csvContent += `Current Viewers,${escapeCsv(selectedChannel.currentViewers)}\n`;
    csvContent += `Verified Humans,${escapeCsv(selectedChannel.verifiedHumans)}\n`;
    csvContent += `Authorized Viewer Ratio,${escapeCsv(`${Math.round(selectedChannel.authorizedRatio * 100)}%`)}\n`;
    csvContent += `Bot Probability,${escapeCsv(`${selectedChannel.botProbability}%`)}\n`;
    csvContent += `Urgency Risk Score,${escapeCsv(`${selectedChannel.urgencyScore}/100`)}\n`;
    csvContent += `Discovery Suppressed,${escapeCsv(selectedChannel.discoverySuppressed ? 'YES' : 'NO')}\n`;
    csvContent += `Promotional Muted,${escapeCsv(selectedChannel.promotionalMuted ? 'YES' : 'NO')}\n`;
    csvContent += `Cashout Frozen,${escapeCsv(selectedChannel.cashoutFrozen ? 'YES' : 'NO')}\n\n`;

    // Section 2: Stream History Points
    csvContent += `STREAM TRAFFIC HISTORY POINTS\n`;
    csvContent += `Time,Total Viewers,Verified Humans,Authorized Ratio %,Baseline Viewers,Baseline Verified Humans\n`;
    if (channelHistory.length > 0) {
      channelHistory.forEach((pt) => {
        const ratio = pt.viewers > 0 ? `${Math.round((pt.verifiedHumans / pt.viewers) * 100)}%` : '0%';
        csvContent += `${escapeCsv(pt.time)},${escapeCsv(pt.viewers)},${escapeCsv(pt.verifiedHumans)},${escapeCsv(ratio)},${escapeCsv(pt.baselineViewers ?? 'N/A')},${escapeCsv(pt.baselineVerifiedHumans ?? 'N/A')}\n`;
      });
    } else {
      csvContent += `No history points recorded.\n`;
    }
    csvContent += `\n`;

    // Section 3: Stream Audit Event Logs
    csvContent += `STREAM AUDIT EVENT LOGS\n`;
    csvContent += `Log ID,Timestamp,Event Type,Severity,Detail,Action Taken\n`;
    if (channelLogs.length > 0) {
      channelLogs.forEach((log) => {
        csvContent += `${escapeCsv(log.id)},${escapeCsv(log.timestamp)},${escapeCsv(log.type)},${escapeCsv(log.severity.toUpperCase())},${escapeCsv(log.detail)},${escapeCsv(log.actionTaken)}\n`;
      });
    } else {
      csvContent += `No audit logs recorded.\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const sanitizedHost = selectedChannel.host.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `FlowGen_Audit_Report_${sanitizedHost}_${selectedChannel.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyMetadataJson = () => {
    if (!selectedChannel) return;

    const channelHistory = histories[selectedChannel.id] || [];
    const channelLogs = auditLogs.filter((log) => log.channelId === selectedChannel.id);
    const channelChats = chatMessages.filter((msg) => msg.channelId === selectedChannel.id);

    const auditData = {
      exportedAt: new Date().toISOString(),
      engine: 'FlowGen Layer 04 Zero-Trust Discriminator',
      stream: {
        id: selectedChannel.id,
        title: selectedChannel.name,
        host: selectedChannel.host,
        category: selectedChannel.category,
        marketplacePlatform: selectedChannel.marketplacePlatform || null,
        storeUrl: selectedChannel.storeUrl || null,
        securityRiskStatus: isRedChannel(selectedChannel) ? 'RED_HIGH_RISK_FRAUD' : 'GREEN_VERIFIED_SECURE',
        currentViewers: selectedChannel.currentViewers,
        verifiedHumans: selectedChannel.verifiedHumans,
        authorizedRatio: selectedChannel.authorizedRatio,
        authorizedRatioPercentage: `${Math.round(selectedChannel.authorizedRatio * 100)}%`,
        botProbability: selectedChannel.botProbability,
        urgencyScore: selectedChannel.urgencyScore,
        safeguards: {
          discoverySuppressed: selectedChannel.discoverySuppressed,
          promotionalMuted: selectedChannel.promotionalMuted,
          cashoutFrozen: selectedChannel.cashoutFrozen,
        },
      },
      trafficHistory: channelHistory,
      auditLogs: channelLogs,
      recentChatMessagesSample: channelChats.slice(-10),
    };

    const jsonString = JSON.stringify(auditData, null, 2);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString).then(() => {
        setMetadataJsonCopied(true);
        setTimeout(() => setMetadataJsonCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const handleCopyStreamId = () => {
    if (!selectedChannel) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedChannel.id).then(() => {
        setStreamIdCopied(true);
        setTimeout(() => setStreamIdCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const handleShareReport = () => {
    if (!selectedChannel) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?channel=${selectedChannel.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }).catch(() => {});
    }
  };

  const handleEmailReport = () => {
    if (!selectedChannel) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?channel=${selectedChannel.id}`;
    const subject = encodeURIComponent(`FlowGen Audit Report - @${selectedChannel.host} (${selectedChannel.name})`);
    const body = encodeURIComponent(
      `FlowGen Layer 04 View Discriminator Audit Report for @${selectedChannel.host}:\n\n` +
      `• Stream Name: ${selectedChannel.name}\n` +
      `• Category: ${selectedChannel.category.toUpperCase()}\n` +
      `• Concurrent Connections: ${selectedChannel.currentViewers.toLocaleString()}\n` +
      `• Verified Human Viewers: ${selectedChannel.verifiedHumans.toLocaleString()}\n` +
      `• Human Ratio: ${Math.round(selectedChannel.authorizedRatio * 100)}%\n` +
      `• Bot Probability: ${selectedChannel.botProbability}%\n` +
      `• Urgency Risk Score: ${selectedChannel.urgencyScore}/100\n\n` +
      `Access Live Deep Link Audit Report:\n${shareUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSmsReport = () => {
    if (!selectedChannel) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?channel=${selectedChannel.id}`;
    const smsText = `FlowGen Audit Report: @${selectedChannel.host} (${selectedChannel.name}) | Viewers: ${selectedChannel.currentViewers.toLocaleString()} | Verified Humans: ${selectedChannel.verifiedHumans.toLocaleString()} (${Math.round(selectedChannel.authorizedRatio * 100)}%) | Bot Prob: ${selectedChannel.botProbability}% | Risk: ${selectedChannel.urgencyScore}/100. Deep Link: ${shareUrl}`;
    
    // Cross-platform mobile SMS protocol link (?&body= supports iOS & Android)
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS
      ? `sms:&body=${encodeURIComponent(smsText)}`
      : `sms:?body=${encodeURIComponent(smsText)}`;
    
    window.location.href = smsUrl;
  };

  const handleAddHumans = () => {
    if (!selectedChannel) return;

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === selectedChannelId) {
          const nextHumans = ch.verifiedHumans + 500;
          const nextViewers = ch.currentViewers + 500;
          const nextRatio = nextHumans / nextViewers;

          return {
            ...ch,
            verifiedHumans: nextHumans,
            currentViewers: nextViewers,
            authorizedRatio: nextRatio,
            botProbability: Math.max(0, ch.botProbability - 12),
          };
        }
        return ch;
      })
    );

    triggerSystemLog(
      selectedChannelId,
      'manual_audit',
      'Injected 500 Verified human connection tokens (validated via device fingerprinting).',
      'Improved the overall stream Authorized Viewer Ratio.',
      'low'
    );

    // Add some nice human messages
    setTimeout(() => {
      injectChatMessage(selectedChannelId, "Which sizes are left in the denim shirt?", "clara_shopping", true);
      injectChatMessage(selectedChannelId, "Does it ship with a standard warranty?", "dan_v", true);
    }, 400);
  };

  const handleRestoreStatusManual = () => {
    if (!checkRbacPermission('admin', 'Manual Restore & Override')) return;
    if (!selectedChannel) return;

    playRestoredSound();

    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === selectedChannelId) {
          return {
            ...ch,
            status: 'safe',
            discoverySuppressed: false,
            promotionalMuted: false,
            cashoutFrozen: false,
          };
        }
        return ch;
      })
    );

    triggerSystemLog(
      selectedChannelId,
      'cashout_released',
      'Manual Override: Auditor verified stream authenticity and logs.',
      'Manually bypassed and cleared all Discovery and Wallet freeze safeguards.',
      'critical'
    );
  };

  const handleToggleSafeguard = (type: 'discovery' | 'promo' | 'cashout') => {
    if (!checkRbacPermission('admin', 'Safeguard Toggle')) return;
    setChannels((prevChannels) =>
      prevChannels.map((ch) => {
        if (ch.id === selectedChannelId) {
          const nextDiscovery = type === 'discovery' ? !ch.discoverySuppressed : ch.discoverySuppressed;
          const nextPromo = type === 'promo' ? !ch.promotionalMuted : ch.promotionalMuted;
          const nextCashout = type === 'cashout' ? !ch.cashoutFrozen : ch.cashoutFrozen;

          let nextStatus: Channel['status'] = 'safe';
          if (nextCashout) {
            nextStatus = 'frozen';
          } else if (nextDiscovery || nextPromo) {
            nextStatus = 'flagged_and_suppressed';
          }

          const actionLabel = type === 'discovery' ? 'Discovery Feed Suppression' : type === 'promo' ? 'Promo Push Notification' : 'Merchant Wallet Freeze';
          const stateLabel = (type === 'discovery' ? nextDiscovery : type === 'promo' ? nextPromo : nextCashout) ? 'ENGAGED' : 'DISENGAGED';

          triggerSystemLog(
            selectedChannelId,
            'manual_audit',
            `Auditor manually toggled safeguard: ${actionLabel} has been ${stateLabel}.`,
            'Updated active mitigation parameters.',
            'medium'
          );

          return {
            ...ch,
            discoverySuppressed: nextDiscovery,
            promotionalMuted: nextPromo,
            cashoutFrozen: nextCashout,
            status: nextStatus,
          };
        }
        return ch;
      })
    );
  };

  const handleClearLogs = () => {
    if (!checkRbacPermission('author', 'Clear Audit Logs')) return;
    setAuditLogs((prev) => prev.filter((log) => log.channelId !== selectedChannelId));
  };

  const handleAddCustomChatMessage = (content: string, sender: string) => {
    if (!checkRbacPermission('author', 'Inject Chat Message')) return;
    injectChatMessage(selectedChannelId, content, sender, sender !== 'bot_test');
  };

  const handleAddMarketplaceChannel = (newChannel: Channel) => {
    if (!checkRbacPermission('author', 'Connect Marketplace Stream')) return;
    setChannels((prev) => [newChannel, ...prev]);
    setSelectedChannelId(newChannel.id);
    
    setHistories((prev) => ({
      ...prev,
      [newChannel.id]: generateHistory(newChannel.currentViewers, newChannel.verifiedHumans),
    }));

    triggerSystemLog(
      newChannel.id,
      'manual_audit',
      `Marketplace Integration Hub: Connected live feed for @${newChannel.host} (${newChannel.marketplacePlatform?.toUpperCase() || 'MARKETPLACE'}).`,
      'Stream ingested into Layer 04 View Discriminator protection queue.',
      'low'
    );
  };

  const handleResetToDefaults = () => {
    if (!checkRbacPermission('admin', 'System Reset')) return;
    setChannels(INITIAL_CHANNELS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setThresholdSettings({
      authorizedRatioThreshold: 0.50,
      urgencyThreshold: 0.40,
    });
    
    const initialHistories: Record<string, HistoryPoint[]> = {};
    INITIAL_CHANNELS.forEach((ch) => {
      initialHistories[ch.id] = generateHistory(ch.currentViewers, ch.verifiedHumans);
    });
    setHistories(initialHistories);
  };

  // --- FILTERS ---
  const filteredChannels = channels.filter((ch) => {
    const matchesSearch =
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.marketplacePlatform && ch.marketplacePlatform.toLowerCase().includes(searchQuery.toLowerCase()));

    const isRed = isRedChannel(ch);

    if (categoryFilter === 'high_risk') return matchesSearch && isRed;
    if (categoryFilter !== 'all') return matchesSearch && ch.category === categoryFilter;
    return matchesSearch;
  });

  const isSelectedRed = selectedChannel ? isRedChannel(selectedChannel) : false;
  const isBelowAuthThreshold = selectedChannel ? selectedChannel.authorizedRatio < thresholdSettings.authorizedRatioThreshold : false;
  const isSelectedCritical = selectedChannel ? (
    (selectedChannel.urgencyScore / 100) > thresholdSettings.urgencyThreshold ||
    selectedChannel.botProbability > 75 ||
    selectedChannel.status === 'flagged_and_suppressed' ||
    selectedChannel.status === 'frozen' ||
    selectedChannel.cashoutFrozen
  ) : false;
  const affectedChannelsCount = channels.filter((c) => isRedChannel(c)).length;

  // Mini-Graph Sparkline Calculations (Turquoise Green)
  const selectedChannelHistory = selectedChannel ? (histories[selectedChannel.id] || []) : [];
  const miniGraphPoints = selectedChannelHistory.slice(-10).map((pt) => {
    const ratio = pt.viewers > 0 ? Math.round((pt.verifiedHumans / pt.viewers) * 100) : 0;
    return {
      time: pt.time,
      ratio,
    };
  });
  const miniGraphRatios = miniGraphPoints.map((p) => p.ratio);
  const miniGraphMin = miniGraphRatios.length > 0 ? Math.min(...miniGraphRatios) : 0;
  const miniGraphMax = miniGraphRatios.length > 0 ? Math.max(...miniGraphRatios) : 100;
  const miniGraphFirst = miniGraphRatios.length > 0 ? miniGraphRatios[0] : Math.round((selectedChannel?.authorizedRatio || 0) * 100);
  const miniGraphLast = miniGraphRatios.length > 0 ? miniGraphRatios[miniGraphRatios.length - 1] : Math.round((selectedChannel?.authorizedRatio || 0) * 100);
  const miniGraphTrend = miniGraphLast - miniGraphFirst;

  const mgWidth = 280;
  const mgHeight = 40;
  const mgRange = miniGraphMax - miniGraphMin || 1;

  const sparklineData = miniGraphPoints.map((pt, i) => {
    const x = miniGraphPoints.length > 1 ? (i / (miniGraphPoints.length - 1)) * mgWidth : mgWidth / 2;
    const y = mgHeight - 4 - ((pt.ratio - miniGraphMin) / mgRange) * (mgHeight - 8);
    return { ...pt, x, y };
  });

  const sparklinePolyline = sparklineData.map((d) => `${d.x},${d.y}`).join(' ');
  const sparklineFirstX = sparklineData[0]?.x ?? 0;
  const sparklineLastX = sparklineData[sparklineData.length - 1]?.x ?? mgWidth;
  const sparklinePolygon = `${sparklineFirstX},${mgHeight} ${sparklinePolyline} ${sparklineLastX},${mgHeight}`;

  // Recent Incident Indicator Calculations (Last 1 Hour) for Active Stream Banner
  const selectedChannelLogs = selectedChannel ? auditLogs.filter((l) => l.channelId === selectedChannel.id) : [];
  const historyAttackEvents = selectedChannelHistory.filter((pt) => pt.attackEvent).map((pt) => pt.attackEvent!);

  // Bot Attacks (from history attack points + anomaly detection logs)
  const botAttacksFromHistory = historyAttackEvents.filter(
    (e) => e.type === 'bot_spike' || e.type === 'sybil_cluster' || e.type === 'credential_stuffing' || e.type === 'traffic_surge'
  ).length;
  const botAttacksFromLogs = selectedChannelLogs.filter(
    (l) => l.type === 'anomaly_detected' || (l.detail && l.detail.toLowerCase().includes('bot'))
  ).length;
  const recentBotAttacksCount = Math.max(botAttacksFromHistory, botAttacksFromLogs);

  // Hype Events (from history attack points + FOMO urgency logs + urgency score > 60)
  const hypeEventsFromHistory = historyAttackEvents.filter((e) => e.type === 'fomo_hype').length;
  const hypeEventsFromLogs = selectedChannelLogs.filter(
    (l) => l.type === 'safeguard_triggered' || (l.detail && (l.detail.toLowerCase().includes('urgency') || l.detail.toLowerCase().includes('fomo') || l.detail.toLowerCase().includes('pressure')))
  ).length;
  const recentHypeEventsCount = Math.max(
    hypeEventsFromHistory,
    selectedChannel && (selectedChannel.urgencyScore > 60 || selectedChannel.fomoScore > 60) ? 1 : hypeEventsFromLogs > 0 ? 1 : 0
  );

  const totalRecentIncidents = recentBotAttacksCount + recentHypeEventsCount;

  // Most recent incident
  const latestIncident = historyAttackEvents.length > 0
    ? historyAttackEvents[historyAttackEvents.length - 1]
    : selectedChannelLogs.length > 0
    ? {
        id: selectedChannelLogs[0].id,
        type: selectedChannelLogs[0].type,
        title: selectedChannelLogs[0].type.replace(/_/g, ' ').toUpperCase(),
        detail: selectedChannelLogs[0].detail,
        timestamp: selectedChannelLogs[0].timestamp,
        severity: selectedChannelLogs[0].severity,
        magnitude: selectedChannelLogs[0].severity === 'critical' ? 'High Impact' : undefined,
      }
    : null;

  return (
    <div id="flowgen-app" className="min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none">
      {/* Platform Header */}
      <Header
        channels={channels}
        auditLogs={auditLogs}
        thresholdSettings={thresholdSettings}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenMarketplaceModal={() => setIsMarketplaceModalOpen(true)}
        onOpenSystemsGuide={() => setIsSystemsGuideOpen(true)}
        onOpenSecurityGovernance={() => setIsSecurityModalOpen(true)}
        onOpenMicrosoftCopilot={() => setIsCopilotModalOpen(true)}
        onOpenSoloMarketing={() => setIsSoloMarketingOpen(true)}
        onOpenGoogleSheetsStandard={() => setIsGoogleSheetsStandardOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        userRole={userRole}
      />

      {/* Floating RBAC Access Restriction Toast */}
      {rbacAccessWarning && (
        <div
          id="toast-rbac-warning"
          className="fixed top-20 right-6 z-50 max-w-md bg-rose-950/95 border border-rose-500/80 text-rose-200 px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-bounce font-mono text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-semibold leading-snug">{rbacAccessWarning}</span>
          </div>
          <button
            onClick={() => setRbacAccessWarning(null)}
            className="text-rose-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: Channels Directory (span 4) */}
        <section id="directory-panel" className={`lg:col-span-4 flex flex-col gap-4 rounded-2xl border p-5 h-[calc(100vh-140px)] min-h-[500px] transition-colors ${
          theme === 'light' ? 'bg-white border-zinc-200 shadow-sm' : 'bg-black border-white/10'
        }`}>
          <div className="flex justify-between items-center shrink-0 font-mono">
            <div>
              <h2 className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>LIVE STREAM AUDIT DIRECTORY</h2>
              <p className={`text-[10px] font-sans font-medium ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-500'}`}>Select a channel to analyze</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                id="btn-open-templates-modal-directory"
                onClick={() => setIsTemplatesModalOpen(true)}
                className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-sm border ${
                  theme === 'light'
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-500'
                    : 'text-indigo-400 hover:text-white border-indigo-400/40 hover:border-indigo-400 bg-indigo-500/10'
                }`}
                title="Start a new stream from a pre-built template"
              >
                <LayoutTemplate className={`w-3 h-3 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} /> TEMPLATES
              </button>

              <button
                id="btn-open-marketplace-modal-directory"
                onClick={() => setIsMarketplaceModalOpen(true)}
                className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-sm border ${
                  theme === 'light'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-500'
                    : 'text-[#00FF00] hover:text-white border-[#00FF00]/40 hover:border-[#00FF00] bg-[#00FF00]/10'
                }`}
                title="Connect Amazon Live, Whatnot, TikTok Shop, Shopify or eBay stream"
              >
                <Store className={`w-3 h-3 ${theme === 'light' ? 'text-emerald-600' : 'text-[#00FF00]'}`} /> + MARKETPLACE
              </button>

              <button
                id="btn-reset-system"
                onClick={handleResetToDefaults}
                className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer border ${
                  theme === 'light'
                    ? 'text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300'
                    : 'text-zinc-300 hover:text-white border-white/15 hover:border-white bg-zinc-950'
                }`}
                title="Reset all channels to default demo state"
              >
                <RotateCcw className="w-3 h-3" /> RESET
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative shrink-0" id="search-container">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`} />
            <input
              id="search-input"
              type="text"
              placeholder="SEARCH STREAM OR HOST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded font-mono font-bold text-xs pl-9 pr-4 py-2 focus:outline-none transition-all ${
                theme === 'light'
                  ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-emerald-500 placeholder-zinc-400 focus:bg-white'
                  : 'bg-zinc-950 border-white/10 text-white focus:border-[#00FF00] placeholder-zinc-600'
              }`}
            />
          </div>

          {/* Directory Filter Tabs */}
          <div className="flex flex-wrap gap-1 shrink-0 font-mono uppercase text-[9px] font-bold tracking-wider" id="filter-tabs">
            <button
              id="tab-all"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1.5 rounded border transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? theme === 'light'
                    ? 'bg-zinc-900 border-zinc-900 text-white font-black shadow-sm'
                    : 'bg-white border-white text-black font-black'
                  : theme === 'light'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400'
                  : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
              }`}
            >
              ALL
            </button>
            <button
              id="tab-high-risk"
              onClick={() => setCategoryFilter('high_risk')}
              className={`px-2.5 py-1.5 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'high_risk'
                  ? 'bg-rose-500 border-rose-500 text-white font-black shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                  : theme === 'light'
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300'
                  : 'bg-rose-950/20 border-rose-950/40 text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertOctagon className="w-3 h-3 text-rose-500" /> RED ALERT ({affectedChannelsCount})
            </button>
            <button
              id="tab-shopping"
              onClick={() => setCategoryFilter('shopping')}
              className={`px-2.5 py-1.5 rounded border transition-all cursor-pointer ${
                categoryFilter === 'shopping'
                  ? theme === 'light'
                    ? 'bg-zinc-900 border-zinc-900 text-white font-black shadow-sm'
                    : 'bg-white border-white text-black font-black'
                  : theme === 'light'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400'
                  : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
              }`}
            >
              SHOPPING
            </button>
            <button
              id="tab-crypto"
              onClick={() => setCategoryFilter('crypto')}
              className={`px-2.5 py-1.5 rounded border transition-all cursor-pointer ${
                categoryFilter === 'crypto'
                  ? theme === 'light'
                    ? 'bg-zinc-900 border-zinc-900 text-white font-black shadow-sm'
                    : 'bg-white border-white text-black font-black'
                  : theme === 'light'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-900'
                  : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              CRYPTO
            </button>
            <button
              id="tab-gaming"
              onClick={() => setCategoryFilter('gaming')}
              className={`px-2.5 py-1.5 rounded border transition-all cursor-pointer ${
                categoryFilter === 'gaming'
                  ? theme === 'light'
                    ? 'bg-zinc-900 border-zinc-900 text-white font-black shadow-sm'
                    : 'bg-white border-white text-black font-black'
                  : theme === 'light'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-900'
                  : 'bg-zinc-950 border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              GAMING
            </button>
          </div>

          {/* Stream list container */}
          <div id="channels-list" className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 font-mono">
                <Search className="w-8 h-8 opacity-25 text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-widest">NO ACTIVE STREAMS</p>
              </div>
            ) : (
              filteredChannels.map((ch) => (
                <ChannelCard
                   key={ch.id}
                   channel={ch}
                   isSelected={ch.id === selectedChannelId}
                   onSelect={() => setSelectedChannelId(ch.id)}
                   theme={theme}
                />
              ))
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Stream Auditor Workspace (span 8) */}
        <section id="workspace-panel" className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-140px)] pr-1 scrollbar-thin">
          {/* Global Alert Sensitivity Configuration Panel */}
          <SensitivityConfigPanel
            settings={thresholdSettings}
            onUpdateSettings={setThresholdSettings}
            affectedChannelsCount={affectedChannelsCount}
            totalChannelsCount={channels.length}
            onReset={() =>
              setThresholdSettings({
                authorizedRatioThreshold: 0.50,
                urgencyThreshold: 0.40,
              })
            }
          />

          {/* Global Threat Distribution Widget (Bot Probability vs Viewer Count) */}
          <GlobalThreatDistribution
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
            thresholdSettings={thresholdSettings}
            onTriggerTrendAlert={(alert) => {
              setTrendAlert(alert);
              playCriticalStatusSound();
            }}
          />

          {selectedChannel ? (
            <div className="space-y-6 shrink-0">
              {/* Active Stream Metadata Banner */}
              <div
                id="active-stream-banner"
                className={`p-6 rounded-2xl border transition-all duration-300 ease-out bg-black flex flex-col gap-4 relative shrink-0 group ${
                  isBelowAuthThreshold
                    ? 'animate-hot-pink-pulse border-[#FF1493]/80 shadow-[0_0_35px_rgba(255,20,147,0.7)] hover:border-[#FF1493] hover:shadow-[0_0_50px_rgba(255,20,147,0.9)]'
                    : isSelectedRed
                    ? 'border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-pulse hover:border-rose-500/70 hover:shadow-[0_0_45px_rgba(244,63,94,0.55)]'
                    : 'border-white/10 hover:border-[#00FF00]/40 hover:shadow-[0_0_35px_rgba(0,255,0,0.15)]'
                }`}
              >
                {/* Soft ambient background glow on hover */}
                <div
                  className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none -z-10 ${
                    isBelowAuthThreshold
                      ? 'bg-[#FF1493]/20'
                      : isSelectedRed
                      ? 'bg-rose-500/10'
                      : 'bg-[#00FF00]/10'
                  }`}
                />

                {/* Visual side accent */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2 ${
                    isSelectedRed ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-[#00FF00] shadow-[0_0_10px_#00FF00]'
                  }`}
                />

                {/* Top Row: Stream Information & Action Controls */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight font-sans">{selectedChannel.name}</h2>
                    <span className="text-[9px] bg-zinc-900 text-zinc-400 font-extrabold font-mono px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                      {selectedChannel.category}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono font-medium flex items-center gap-2.5 flex-wrap">
                    <span>STREAM HOST: <span className="text-white font-bold">{selectedChannel.host.toUpperCase()}</span></span>
                    <span className="text-zinc-700">•</span>
                    <div className="group/id-container flex items-center gap-1.5 bg-zinc-950/80 px-2 py-0.5 rounded border border-white/10 hover:border-white/20 transition-all duration-300">
                      <span className="text-[10px] text-zinc-500">ID:</span>
                      <code className="text-[10px] text-zinc-300 font-semibold">{selectedChannel.id}</code>
                      <button
                        id="btn-copy-stream-id"
                        onClick={handleCopyStreamId}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-mono font-black uppercase tracking-wider cursor-pointer transition-all duration-300 ease-out ${
                          streamIdCopied
                            ? 'bg-[#00FF00] text-black border-[#00FF00] shadow-[0_0_12px_rgba(0,255,0,0.6)]'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10 group-hover/id-container:border-[#00FF00]/50 group-hover/id-container:shadow-[0_0_10px_rgba(0,255,0,0.3)] hover:!border-[#00FF00] hover:!shadow-[0_0_15px_rgba(0,255,0,0.5)]'
                        }`}
                        title="Copy Channel UUID to clipboard for technical debugging"
                      >
                        {streamIdCopied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-[#00FF00]" />}
                        <span>{streamIdCopied ? 'COPIED' : 'COPY ID'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Risk Status Indicator Box & Share Button */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Visual Lock Icon Badge - Appears ONLY when stream reaches Critical Status */}
                  {isSelectedCritical && (
                    <div
                      id="critical-security-lock-badge"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-500/70 bg-rose-950/90 text-rose-400 font-mono text-[10px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                      title="Critical Security Lock Active: Cashout Frozen & Discovery Suppressed due to critical threat"
                    >
                      <Lock className="w-4 h-4 text-rose-400 animate-bounce" />
                      <div className="flex flex-col text-left">
                        <span className="leading-none text-white font-extrabold text-[10px] tracking-wider">SECURITY LOCK ACTIVE</span>
                        <span className="text-[8px] text-rose-300 font-semibold leading-tight mt-0.5">CASHOUT & PROMO FROZEN</span>
                      </div>
                    </div>
                  )}

                  {/* Copy Summary Text Button */}
                  <button
                    id="btn-copy-summary"
                    onClick={handleCopySummary}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      summaryCopied
                        ? 'bg-[#00FF00] text-black border-[#00FF00]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-amber-400'
                    }`}
                    title="Copy formatted security summary text to clipboard"
                  >
                    {summaryCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>SUMMARY COPIED</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>COPY SUMMARY</span>
                      </>
                    )}
                  </button>

                  {/* Generate QR Code Button */}
                  <button
                    id="btn-generate-qr-code"
                    onClick={() => setIsQrModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-purple-400"
                    title="Display scannable QR code linking to stream audit report for mobile collaboration"
                  >
                    <QrCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>GENERATE QR CODE</span>
                  </button>

                  {/* Download CSV Report Button */}
                  <button
                    id="btn-download-csv-report"
                    onClick={handleDownloadCSVReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-cyan-400"
                    title="Export stream audit metadata and history points as formatted CSV file"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DOWNLOAD CSV REPORT</span>
                  </button>

                  {/* Copy Metadata JSON Button */}
                  <button
                    id="btn-copy-metadata-json"
                    onClick={handleCopyMetadataJson}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      metadataJsonCopied
                        ? 'bg-[#00FF00] text-black border-[#00FF00]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-purple-400'
                    }`}
                    title="Copy raw current stream audit object as formatted JSON string to clipboard"
                  >
                    {metadataJsonCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>JSON COPIED</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5 text-purple-400" />
                        <span>COPY METADATA JSON</span>
                      </>
                    )}
                  </button>

                  {/* Share Deep Link Button */}
                  <button
                    id="btn-share-audit-report"
                    onClick={handleShareReport}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      shareCopied
                        ? 'bg-[#00FF00] text-black border-[#00FF00]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-[#00FF00]'
                    }`}
                    title="Generate deep link to current stream's audit report"
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>LINK COPIED</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#00FF00]" />
                        <span>SHARE REPORT</span>
                      </>
                    )}
                  </button>

                  {/* Solo Creator Marketing Copilot Quick Trigger */}
                  <button
                    id="btn-banner-solo-marketing"
                    onClick={() => setIsSoloMarketingOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border-amber-500/40 hover:border-amber-400"
                    title="Launch Solo Creator Marketing & Buyer Connection Assistant for this stream"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                    <span>SOLO MARKETING COPILOT</span>
                  </button>

                  {/* Google Sheets Standard Hub Quick Trigger */}
                  <button
                    id="btn-banner-google-sheets"
                    onClick={() => setIsGoogleSheetsStandardOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"
                    title="Open Google Sheets & AI Studio Standard Schema (Col A-F) & Apps Script"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SHEETS & AI STUDIO</span>
                  </button>

                  {/* Email Audit Report Button */}
                  <button
                    id="btn-email-audit-report"
                    onClick={handleEmailReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-cyan-400"
                    title="Open mail client with pre-formatted audit report"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>EMAIL REPORT</span>
                  </button>

                  {/* SMS Mobile Deep Link Report Button */}
                  <button
                    id="btn-sms-audit-report"
                    onClick={handleSmsReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white border-white/20 hover:border-emerald-400"
                    title="Initiate SMS protocol with pre-formatted mobile deep link report"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SMS REPORT</span>
                  </button>

                  {/* Push to MS Tasks Button */}
                  <button
                    id="btn-push-ms-task"
                    onClick={handleDispatchCurrentStreamTask}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm bg-[#0078D4]/15 hover:bg-[#0078D4]/30 text-cyan-200 border-[#0078D4]/50 hover:border-cyan-400"
                    title="Dispatch immediate SOC audit task to Microsoft To Do / Planner"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#0078D4]" />
                    <span>PUSH TO MS TASKS</span>
                  </button>

                  {/* Configure Copilot Rules Button */}
                  <button
                    id="btn-configure-copilot-rules"
                    onClick={() => setIsCopilotRulesOpen(!isCopilotRulesOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      isCopilotRulesOpen
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-extrabold'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/40 hover:border-amber-400'
                    }`}
                    title="Open sub-menu to define automated Copilot tasks and security rules"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isCopilotRulesOpen ? 'CLOSE COPILOT RULES' : 'CONFIGURE COPILOT RULES'}</span>
                  </button>

                  {/* View Mini-Graph Toggle Button (Turquoise Green Theme) */}
                  <button
                    id="btn-toggle-mini-graph"
                    onClick={() => setShowMiniGraph(!showMiniGraph)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      showMiniGraph
                        ? 'bg-[#00f5d4] text-black border-[#00f5d4] shadow-[0_0_15px_rgba(0,245,212,0.4)] font-extrabold'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-[#00f5d4] border-[#00f5d4]/40 hover:border-[#00f5d4]'
                    }`}
                    title="Toggle 5-minute Authorized Viewer Ratio inline sparkline trend graph"
                  >
                    <LineChart className="w-3.5 h-3.5 shrink-0" />
                    <span>{showMiniGraph ? 'HIDE MINI-GRAPH' : 'VIEW MINI-GRAPH'}</span>
                  </button>

                  <div className="text-right relative group/security-tooltip">
                    <div className="flex items-center justify-end gap-1 mb-0.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                        SECURITY STATUS
                      </span>
                      {/* Info Icon with Risk Factors Tooltip */}
                      <button
                        type="button"
                        id="security-status-info-trigger"
                        className="p-0.5 rounded text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer inline-flex items-center"
                        aria-label="View risk score contributing factors"
                        title="Hover to inspect the 3 primary risk drivers for this stream"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {/* Compact Styled Risk Factors Tooltip */}
                      <div
                        id="security-risk-factors-tooltip"
                        className="absolute right-0 top-full mt-2 z-50 w-80 p-4 bg-zinc-950/95 border border-white/20 rounded-xl shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover/security-tooltip:opacity-100 group-hover/security-tooltip:pointer-events-auto transition-all duration-200 text-left font-mono"
                      >
                        {/* Tooltip Header */}
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                              RISK SCORE DRIVERS
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase border ${
                              isSelectedRed
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {isSelectedRed ? 'HIGH RISK' : 'SECURE'}
                          </span>
                        </div>

                        <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed font-sans">
                          Current risk classification is calculated in real time across three core telemetry indicators:
                        </p>

                        {/* Factor 1: Authorized Human Traffic Ratio */}
                        <div className="space-y-2 text-[10px]">
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                1. Human Auth Ratio
                              </span>
                              <span
                                className={`font-bold ${
                                  selectedChannel.authorizedRatio < thresholdSettings.authorizedRatioThreshold
                                    ? 'text-rose-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {Math.round(selectedChannel.authorizedRatio * 100)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-zinc-400">
                              <span>Threshold: &gt;={Math.round(thresholdSettings.authorizedRatioThreshold * 100)}%</span>
                              <span className="text-zinc-400 font-bold">
                                {selectedChannel.authorizedRatio < thresholdSettings.authorizedRatioThreshold
                                  ? '⚠️ Below Threshold'
                                  : '✓ Verified Safe'}
                              </span>
                            </div>
                          </div>

                          {/* Factor 2: Bot Network Probability */}
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                2. Bot Probability
                              </span>
                              <span
                                className={`font-bold ${
                                  selectedChannel.botProbability > 50
                                    ? 'text-rose-400'
                                    : selectedChannel.botProbability > 25
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {selectedChannel.botProbability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-zinc-400">
                              <span>Synthetic Cluster Risk</span>
                              <span className="text-zinc-400 font-bold">
                                {selectedChannel.botProbability > 50
                                  ? '⚠️ High Bot Density'
                                  : selectedChannel.botProbability > 25
                                  ? '⚡ Moderate Traffic'
                                  : '✓ Low Bot Risk'}
                              </span>
                            </div>
                          </div>

                          {/* Factor 3: Urgency Risk Score */}
                          <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                3. Urgency Risk Index
                              </span>
                              <span
                                className={`font-bold ${
                                  selectedChannel.urgencyScore / 100 > thresholdSettings.urgencyThreshold
                                    ? 'text-rose-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {selectedChannel.urgencyScore}/100
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-zinc-400">
                              <span>Threshold: &lt;={Math.round(thresholdSettings.urgencyThreshold * 100)}</span>
                              <span className="text-zinc-400 font-bold">
                                {selectedChannel.urgencyScore / 100 > thresholdSettings.urgencyThreshold
                                  ? '⚠️ High Pressure'
                                  : '✓ Normal Tactics'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tooltip Footer */}
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-zinc-500">
                          <span>Layer 04 Telemetry Engine</span>
                          <span className="text-cyan-400 font-bold">LIVE METRICS</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black uppercase font-mono tracking-wider ${
                        isSelectedRed ? 'text-rose-400' : 'text-[#00FF00]'
                      }`}
                    >
                      {isSelectedRed ? 'RED: HIGH RISK FRAUD' : 'GREEN: VERIFIED SECURE'}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded border ${
                      isSelectedRed
                        ? 'bg-rose-950/20 border-rose-500/25 text-rose-400 animate-pulse'
                        : 'bg-zinc-900 border-[#00FF00]/25 text-[#00FF00]'
                    }`}
                  >
                    {isSelectedRed ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                </div>
              </div>

                {/* Specialized Copilot Automated Rules Sub-Menu Panel */}
                {isCopilotRulesOpen && (
                  <div
                    id="copilot-rules-submenu"
                    className="w-full mt-3 pt-4 border-t border-amber-500/30 bg-zinc-950/90 rounded-xl p-4 space-y-4 font-mono text-xs animate-fadeIn shadow-[0_0_25px_rgba(245,158,11,0.15)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Zap className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            COPILOT AUTOMATED THREAT RESPONSE RULES
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-sans">
                            Define automated actions (e.g. "If Bot Probability &gt; 90%, auto-freeze stream and alert SOC") synced directly to Microsoft Tasks.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddNewRulePrompt}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ADD CUSTOM RULE</span>
                      </button>
                    </div>

                    {/* Rules List */}
                    <div className="grid grid-cols-1 gap-3">
                      {copilotRules.map((rule) => {
                        const isTriggeredOnCurrent =
                          (rule.conditionType === 'bot_prob_gt' && selectedChannel.botProbability > rule.thresholdValue) ||
                          (rule.conditionType === 'authorized_ratio_lt' && selectedChannel.authorizedRatio * 100 < rule.thresholdValue) ||
                          (rule.conditionType === 'unauthorized_viewers_gt' && selectedChannel.currentViewers - selectedChannel.verifiedHumans > rule.thresholdValue);

                        return (
                          <div
                            key={rule.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              rule.enabled
                                ? isTriggeredOnCurrent
                                  ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-black/90 border-white/15'
                                : 'bg-zinc-950 border-white/5 opacity-50'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <input
                                    type="checkbox"
                                    checked={rule.enabled}
                                    onChange={() => handleToggleRuleEnabled(rule.id)}
                                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                                    title="Enable or disable rule"
                                  />
                                  <span className="text-white font-bold">{rule.name}</span>

                                  {isTriggeredOnCurrent && rule.enabled && (
                                    <span className="px-2 py-0.5 rounded text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase animate-pulse">
                                      ⚡ CONDITION MET ON THIS STREAM
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-sans flex-wrap">
                                  <span className="font-mono text-amber-400 font-bold">IF</span>
                                  <span className="bg-zinc-900 px-2 py-0.5 rounded border border-white/10 font-mono text-[10px] text-amber-200">
                                    {rule.conditionType === 'bot_prob_gt' && `Bot Probability > ${rule.thresholdValue}%`}
                                    {rule.conditionType === 'authorized_ratio_lt' && `Authorized Ratio < ${rule.thresholdValue}%`}
                                    {rule.conditionType === 'unauthorized_viewers_gt' && `Unauthorized Viewers > ${rule.thresholdValue.toLocaleString()}`}
                                    {rule.conditionType === 'urgency_gt' && `Urgency Score > ${rule.thresholdValue}%`}
                                  </span>
                                  <span className="font-mono text-amber-400 font-bold">THEN</span>
                                  <div className="flex items-center gap-1 flex-wrap font-mono text-[9px]">
                                    {rule.autoFreezeStream && (
                                      <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-bold">
                                        AUTO-FREEZE STREAM
                                      </span>
                                    )}
                                    {rule.dispatchMsTask && (
                                      <span className="px-1.5 py-0.5 rounded bg-[#0078D4]/20 text-cyan-300 border border-[#0078D4]/40 font-bold">
                                        DISPATCH MS TASK
                                      </span>
                                    )}
                                    {rule.alertSocChannel && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                                        ALERT SOC
                                      </span>
                                    )}
                                    {rule.suppressDiscovery && (
                                      <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                                        SUPPRESS DISCOVERY
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleTestRunRule(rule)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-200 hover:text-white text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Zap className="w-3 h-3 text-amber-400" />
                                  <span>TEST RUN</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                                  title="Delete rule"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Turquoise Green Sparkline Mini-Graph Section */}
                {showMiniGraph && (
                  <div
                    id="active-stream-mini-graph"
                    className="w-full mt-2 pt-4 border-t border-[#00f5d4]/20 bg-zinc-950/80 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-4 font-mono animate-fadeIn"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/30 text-[#00f5d4] shrink-0">
                        <Activity className="w-5 h-5 animate-pulse text-[#00f5d4]" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-[#00f5d4] uppercase tracking-widest">
                            AUTHORIZED VIEWER RATIO (LAST 5 MINS)
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#00f5d4]/15 text-[#00f5d4] border border-[#00f5d4]/30 font-bold uppercase tracking-wider">
                            TURQUOISE HEALTH TREND
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-xl font-black text-white font-mono">
                            {Math.round(selectedChannel.authorizedRatio * 100)}%
                          </span>
                          <span className={`text-[11px] font-extrabold flex items-center ${miniGraphTrend >= 0 ? 'text-[#00f5d4]' : 'text-rose-400'}`}>
                            {miniGraphTrend >= 0 ? '▲ +' : '▼ '}{miniGraphTrend}% in last 5m
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium">
                            Range: {miniGraphMin}% - {miniGraphMax}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Turquoise Sparkline Chart SVG */}
                    <div className="w-full md:w-80 h-11 relative flex items-center bg-black/80 px-3 py-1.5 rounded-xl border border-[#00f5d4]/30 shadow-inner">
                      <svg className="w-full h-8 overflow-visible" viewBox="0 0 280 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="turquoiseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon points={sparklinePolygon} fill="url(#turquoiseGrad)" />
                        <polyline
                          fill="none"
                          stroke="#00f5d4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={sparklinePolyline}
                        />
                        {sparklineData.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={idx === sparklineData.length - 1 ? '3.5' : '1.8'}
                            fill={idx === sparklineData.length - 1 ? '#00f5d4' : '#050505'}
                            stroke="#00f5d4"
                            strokeWidth="1.5"
                          >
                            <title>{`${pt.time}: ${pt.ratio}% Authorized`}</title>
                          </circle>
                        ))}
                      </svg>
                    </div>
                  </div>
                )}

                {/* Horizontal 'Recent Incident' Indicator Strip */}
                <div
                  id="banner-recent-incidents-strip"
                  className={`w-full pt-3 mt-1 border-t flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono transition-all duration-300 ${
                    theme === 'light'
                      ? 'border-zinc-200 bg-zinc-50/80 p-3 rounded-xl'
                      : 'border-white/10 bg-zinc-950/60 p-3 rounded-xl'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            totalRecentIncidents > 0
                              ? 'bg-rose-500'
                              : theme === 'light'
                              ? 'bg-emerald-500'
                              : 'bg-[#00FF00]'
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            totalRecentIncidents > 0
                              ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                              : theme === 'light'
                              ? 'bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.6)]'
                              : 'bg-[#00FF00] shadow-[0_0_8px_#00FF00]'
                          }`}
                        />
                      </span>
                      <span
                        id="recent-incidents-label"
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'
                        }`}
                      >
                        RECENT INCIDENTS (1H):
                      </span>
                    </div>

                    {/* Bot Attacks Pill */}
                    <div
                      id="incident-indicator-bot-attacks"
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all shadow-sm ${
                        recentBotAttacksCount > 0
                          ? theme === 'light'
                            ? 'bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-200'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                          : theme === 'light'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-zinc-900/90 text-emerald-400 border-emerald-500/30'
                      }`}
                      title={`${recentBotAttacksCount} unauthenticated viewbot or sybil socket spike incidents detected in the last hour`}
                    >
                      <Bot className={`w-3.5 h-3.5 ${recentBotAttacksCount > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
                      <span>{recentBotAttacksCount} BOT {recentBotAttacksCount === 1 ? 'ATTACK' : 'ATTACKS'}</span>
                    </div>

                    {/* Hype Events Pill */}
                    <div
                      id="incident-indicator-hype-events"
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all shadow-sm ${
                        recentHypeEventsCount > 0
                          ? theme === 'light'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-200'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                          : theme === 'light'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-zinc-900/90 text-emerald-400 border-emerald-500/30'
                      }`}
                      title={`${recentHypeEventsCount} high-pressure artificial scarcity FOMO surges detected in the last hour`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${recentHypeEventsCount > 0 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
                      <span>{recentHypeEventsCount} HYPE {recentHypeEventsCount === 1 ? 'EVENT' : 'EVENTS'}</span>
                    </div>

                    {/* Aggregated Threat Velocity Indicator */}
                    <div
                      id="incident-indicator-threat-velocity"
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-widest border ${
                        totalRecentIncidents > 0
                          ? theme === 'light'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                          : theme === 'light'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30'
                      }`}
                    >
                      {totalRecentIncidents > 0 ? (
                        <>
                          <AlertOctagon className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>VELOCITY: ELEVATED ({totalRecentIncidents} TOTAL)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>VELOCITY: NOMINAL (0 IN 1H)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Ticker / Latest Incident Context */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 shrink-0 font-mono">
                    {latestIncident && totalRecentIncidents > 0 ? (
                      <div
                        id="incident-indicator-latest-detail"
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border max-w-md truncate ${
                          theme === 'light'
                            ? 'bg-white border-zinc-300 text-zinc-800'
                            : 'bg-zinc-900 border-white/10 text-zinc-300'
                        }`}
                        title={`Latest incident: ${latestIncident.title} - ${latestIncident.detail || ''}`}
                      >
                        <span className="text-[9px] font-black uppercase text-rose-500">LATEST:</span>
                        <span className={`font-bold truncate ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>
                          [{latestIncident.timestamp || 'RECENT'}] {latestIncident.title}
                        </span>
                        {latestIncident.magnitude && (
                          <span className="text-rose-400 font-extrabold shrink-0">({latestIncident.magnitude})</span>
                        )}
                      </div>
                    ) : (
                      <div
                        id="incident-indicator-latest-detail"
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                          theme === 'light'
                            ? 'bg-white border-emerald-200 text-emerald-800'
                            : 'bg-zinc-900 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="font-bold">ZERO THREAT ANOMALIES IN 60M</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Intensity Heatmap Overlay */}
              <RiskHeatmapOverlay channel={selectedChannel} isRed={isSelectedRed} />

              {/* Dynamic Key Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="metrics-dashboard">
                <MetricWidget
                  label="Authorized Viewer Ratio"
                  value={Math.round(selectedChannel.authorizedRatio * 100)}
                  suffix="%"
                  type="ratio"
                  description="Concurrent verified human tokens vs total stream socket connections."
                />
                <MetricWidget
                  label="Viewbot Probability"
                  value={selectedChannel.botProbability}
                  suffix="%"
                  type="bot"
                  description="Weighted signal assessing IP rotation rates and unauthenticated session clusters."
                />
                <MetricWidget
                  label="Hype &amp; Urgency Index"
                  value={selectedChannel.urgencyScore}
                  suffix="%"
                  type="urgency"
                  description="Chat language analysis tracking high-pressure buyer FOMO push patterns."
                />
              </div>

              {/* Live Area Chart Differential */}
              <StreamHistoryChart data={histories[selectedChannel.id] || []} theme={theme} />

              {/* Interactive Threat & Traffic Simulator */}
              <InteractiveSimulator
                channelName={selectedChannel.name}
                isRed={isSelectedRed}
                onDeployBots={handleDeployBots}
                onDeployHype={handleDeployHype}
                onCleanTraffic={handleCleanTraffic}
                onAddHumans={handleAddHumans}
              />

              {/* Safeguards Mitigation Parameters controls */}
              <div
                id="mitigation-controls"
                className="p-6 rounded-2xl border border-white/10 bg-black"
              >
                <div className="flex items-center gap-2 mb-4 font-mono">
                  <Sliders className="w-4 h-4 text-[#00FF00]" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">
                    FLOWGEN AUTOMATION OVERRIDE CONSOLE
                  </h3>
                </div>

                <p className="text-xs text-zinc-500 mb-6 leading-relaxed font-medium">
                  These safeguards fire dynamically under {Math.round(thresholdSettings.authorizedRatioThreshold * 100)}% Authorized Viewer Ratio or {Math.round(thresholdSettings.urgencyThreshold * 100)}% Urgency Threshold. As an Auditor, you can manually trigger, clear, or bypass these rules.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  {/* Rule 1 */}
                  <div
                    onClick={() => handleToggleSafeguard('discovery')}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      selectedChannel.discoverySuppressed
                        ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Discovery Rank</span>
                      <EyeOff className={`w-4 h-4 ${selectedChannel.discoverySuppressed ? 'text-amber-400' : 'text-zinc-600'}`} />
                    </div>
                    <span className="text-xs font-black block mb-1">
                      {selectedChannel.discoverySuppressed ? 'SUPPRESSED' : 'NORMAL'}
                    </span>
                    <p className="text-[10px] text-zinc-500 leading-normal font-sans font-medium">
                      Hides stream from main exploration feed. Suppresses viral distribution.
                    </p>
                  </div>

                  {/* Rule 2 */}
                  <div
                    onClick={() => handleToggleSafeguard('promo')}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      selectedChannel.promotionalMuted
                        ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Promotional Push</span>
                      <IconPromo className={`w-4 h-4 ${selectedChannel.promotionalMuted ? 'text-amber-400' : 'text-zinc-600'}`} />
                    </div>
                    <span className="text-xs font-black block mb-1">
                      {selectedChannel.promotionalMuted ? 'MUTED' : 'ENABLED'}
                    </span>
                    <p className="text-[10px] text-zinc-500 leading-normal font-sans font-medium">
                      Blocks high-frequency push notification alerts sent to nearby shoppers.
                    </p>
                  </div>

                  {/* Rule 3 */}
                  <div
                    onClick={() => handleToggleSafeguard('cashout')}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      selectedChannel.cashoutFrozen
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200 font-bold'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Instant Cashout</span>
                      <Wallet className={`w-4 h-4 ${selectedChannel.cashoutFrozen ? 'text-rose-400' : 'text-zinc-600'}`} />
                    </div>
                    <span className="text-xs font-black block mb-1">
                      {selectedChannel.cashoutFrozen ? 'FROZEN LOCK' : 'AVAILABLE'}
                    </span>
                    <p className="text-[10px] text-zinc-500 leading-normal font-sans font-medium">
                      Protects buyers from checkout scams by locking withdrawals until audits pass.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Auditor and Audit Logs side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChatAuditor
                  messages={chatMessages.filter((msg) => msg.channelId === selectedChannel.id)}
                  onAddCustomMessage={handleAddCustomChatMessage}
                  urgencyThreshold={thresholdSettings.urgencyThreshold}
                />
                
                <AuditLogger
                  logs={auditLogs.filter((log) => log.channelId === selectedChannel.id)}
                  onClearLogs={handleClearLogs}
                  onRestoreStatus={handleRestoreStatusManual}
                  isRed={isSelectedRed}
                  status={selectedChannel.status}
                  channel={selectedChannel}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 bg-black border border-white/10 rounded-2xl p-6 font-mono">
              <Search className="w-12 h-12 opacity-25 mb-4 text-[#00FF00]" />
              <p className="text-xs font-bold uppercase tracking-widest">SELECT STREAM TO OPEN CONSOLE</p>
            </div>
          )}
        </section>
      </main>

      {/* Floating Trend Alert Toast Notification */}
      <TrendAlertToast
        alert={trendAlert}
        onNavigate={(chId) => {
          setSelectedChannelId(chId);
          setTrendAlert(null);
          const banner = document.getElementById('active-stream-banner') || document.getElementById('metrics-dashboard');
          banner?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDismiss={() => setTrendAlert(null)}
      />

      {/* Easy E-Commerce & Marketplace Integration Modal */}
      <MarketplaceIntegrationModal
        isOpen={isMarketplaceModalOpen}
        onClose={() => setIsMarketplaceModalOpen(false)}
        onAddChannel={handleAddMarketplaceChannel}
      />

      {/* Easy Beginner-Friendly Systems Guide Modal */}
      <SystemOverviewModal
        isOpen={isSystemsGuideOpen}
        onClose={() => setIsSystemsGuideOpen(false)}
        onOpenMarketplace={() => setIsMarketplaceModalOpen(true)}
      />

      {/* Enterprise Security & Governance Hub Modal */}
      <SecurityGovernanceModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentRole={userRole}
        onChangeRole={(newRole) => {
          setUserRole(newRole);
          setPolicy((prev) => ({ ...prev, role: newRole }));
          triggerSystemLog(
            selectedChannelId,
            'security_event',
            `User modified active permission tier to [${newRole.toUpperCase()}].`,
            'Updated RBAC session context.',
            'medium'
          );
        }}
        policy={policy}
        onUpdatePolicy={(newPolicy) => setPolicy((prev) => ({ ...prev, ...newPolicy }))}
        auditLogs={auditLogs}
        rateLimitCount={rateLimitCount}
        onResetRateLimit={() => setRateLimitCount(0)}
      />

      {/* Microsoft Copilot Agent & Tasks Hookup Modal */}
      <MicrosoftCopilotModal
        isOpen={isCopilotModalOpen}
        onClose={() => setIsCopilotModalOpen(false)}
        config={copilotConfig}
        onUpdateConfig={(newCfg) => setCopilotConfig((prev) => ({ ...prev, ...newCfg }))}
        tasks={msTasks}
        onAddTask={handleAddMsTask}
        onToggleTaskStatus={handleToggleMsTaskStatus}
        onDeleteTask={handleDeleteMsTask}
        channels={channels}
        auditLogs={auditLogs}
        userRole={userRole}
      />

      {/* Mobile Collaboration QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        channel={selectedChannel}
        isRed={selectedChannel ? isRedChannel(selectedChannel) : false}
      />

      {/* Solo Creator Marketing & Buyer Connection Copilot Modal */}
      <SoloMarketingHubModal
        isOpen={isSoloMarketingOpen}
        onClose={() => setIsSoloMarketingOpen(false)}
        selectedChannel={selectedChannel}
        channels={channels}
        theme={theme}
      />

      {/* Google Sheets & AI Studio Standardized Data Ingestion Hub Modal */}
      <GoogleSheetsStandardSyncModal
        isOpen={isGoogleSheetsStandardOpen}
        onClose={() => setIsGoogleSheetsStandardOpen(false)}
        channels={channels}
        theme={theme}
      />

      {/* Direct Share App & QR Code Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        theme={theme}
      />

      {/* Firebase Firestore & Auth Cloud Hub Modal */}
      <FirebaseSyncModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        channels={channels}
        theme={theme}
      />

      {/* Project Templates Modal */}
      <ProjectTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSpawnTemplate={handleAddMarketplaceChannel}
        theme={theme}
      />

      {/* Floating Task Dispatched Toast Banner */}
      {taskDispatchedToast && (
        <div
          id="toast-task-dispatched"
          className="fixed bottom-6 right-6 z-50 bg-[#0078D4] text-white px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(0,120,212,0.5)] font-mono text-xs flex items-center gap-3 animate-bounce"
        >
          <CheckSquare className="w-5 h-5 text-white shrink-0" />
          <div>
            <span className="font-bold block">{taskDispatchedToast}</span>
            <span className="text-[10px] text-cyan-100">Synced to {copilotConfig.targetList} via MS Graph API</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper for notifications
function IconPromo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <BellOff className="w-4 h-4" />
    </div>
  );
}
