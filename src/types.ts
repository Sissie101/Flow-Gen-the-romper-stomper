export interface Channel {
  id: string;
  name: string;
  host: string;
  category: 'shopping' | 'gaming' | 'crypto' | 'alternative';
  currentViewers: number;
  verifiedHumans: number;
  authorizedRatio: number; // calculated as verifiedHumans / currentViewers (0 to 1)
  botProbability: number; // 0 to 100%
  urgencyScore: number; // 0 to 100% (high pressure buyer tactics)
  status: 'safe' | 'high_risk' | 'flagged_and_suppressed' | 'frozen';
  discoverySuppressed: boolean;
  promotionalMuted: boolean;
  cashoutFrozen: boolean;
  isCustomStream?: boolean;
  marketplacePlatform?: 'amazon_live' | 'whatnot' | 'tiktok_shop' | 'popshop_live' | 'ebay_live' | 'shopify_live' | 'mercado_libre' | 'shopee_live' | 'custom_webhook';
  storeUrl?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: string;
  isVerified: boolean;
  content: string;
  timestamp: string;
  suspiciousnessScore: number; // 0 to 1
  flaggedReason: string | null;
}

export interface AuditLog {
  id: string;
  channelId: string;
  timestamp: string;
  type: 'anomaly_detected' | 'safeguard_triggered' | 'manual_audit' | 'cashout_frozen' | 'cashout_released' | 'status_restored' | 'custom_attack' | 'security_event' | 'access_anomaly';
  detail: string;
  actionTaken: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blockHash?: string;
  prevHash?: string;
  triggeredByRole?: UserRole;
  encryptedSignature?: string;
}

export type UserRole = 'admin' | 'author' | 'viewer';

export interface GovernancePolicy {
  role: UserRole;
  encryptionStandard: 'AES-256-GCM';
  transportSecurity: 'TLS 1.3 / ECDHE';
  rateLimitMaxRequestsPerMin: number;
  dataAccessAnomalyDetection: boolean;
  piiAnonymizationEnabled: boolean;
  zeroRetentionMode: boolean;
  immutableLoggingEnabled: boolean;
}

export interface HistoryPoint {
  time: string;
  viewers: number;
  verifiedHumans: number;
  baselineViewers?: number;
  baselineVerifiedHumans?: number;
}

export interface ThresholdSettings {
  authorizedRatioThreshold: number; // e.g. 0.50 (50%)
  urgencyThreshold: number; // e.g. 0.40 (40%)
}

export interface MicrosoftTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'notStarted' | 'inProgress' | 'completed';
  channelId?: string;
  channelName?: string;
  assignedRole: string;
  dueDate: string;
  syncedToMicrosoft: boolean;
  msGraphTaskId?: string;
  createdTimestamp: string;
  sourceTrigger: 'manual' | 'copilot_agent' | 'autofreeze_rule' | 'anomaly_detection';
}

export interface CopilotAgentConfig {
  isConnected: boolean;
  tenantId: string;
  clientId: string;
  targetList: 'Microsoft To Do' | 'Microsoft Planner' | 'Azure DevOps Work Items' | 'Microsoft Teams Tasks';
  connectedAccountEmail: string;
  autoSyncAnomalies: boolean;
  autoAssignHighSeverity: boolean;
  copilotMode: 'autonomous' | 'supervised' | 'manual';
  msGraphWebhookEndpoint: string;
}

export interface CopilotChatMessage {
  id: string;
  sender: 'user' | 'copilot' | 'system';
  text: string;
  timestamp: string;
  suggestedTask?: Partial<MicrosoftTask>;
  actionExecuted?: string;
}

export interface CopilotRule {
  id: string;
  name: string;
  conditionType: 'bot_prob_gt' | 'authorized_ratio_lt' | 'unauthorized_viewers_gt' | 'urgency_gt';
  thresholdValue: number;
  autoFreezeStream: boolean;
  dispatchMsTask: boolean;
  alertSocChannel: boolean;
  suppressDiscovery: boolean;
  enabled: boolean;
  assignedRole: string;
}

