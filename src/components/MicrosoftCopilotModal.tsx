import React, { useState } from 'react';
import {
  MicrosoftTask,
  CopilotAgentConfig,
  CopilotChatMessage,
  Channel,
  AuditLog,
  UserRole,
} from '../types';
import {
  Bot,
  CheckSquare,
  Sparkles,
  Send,
  RefreshCw,
  Plus,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Zap,
  Sliders,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Building2,
  Terminal,
  LogOut,
  ChevronRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface MicrosoftCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CopilotAgentConfig;
  onUpdateConfig: (newConfig: Partial<CopilotAgentConfig>) => void;
  tasks: MicrosoftTask[];
  onAddTask: (task: Omit<MicrosoftTask, 'id' | 'createdTimestamp' | 'syncedToMicrosoft'>) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  channels: Channel[];
  auditLogs: AuditLog[];
  userRole: UserRole;
}

export function MicrosoftCopilotModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  tasks,
  onAddTask,
  onToggleTaskStatus,
  onDeleteTask,
  channels,
  auditLogs,
  userRole,
}: MicrosoftCopilotModalProps) {
  const [activeTab, setActiveTab] = useState<'copilot_agent' | 'tasks_board' | 'microsoft_auth' | 'automation_rules'>('copilot_agent');

  // Copilot Agent Chat State
  const [chatInput, setChatInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'copilot',
      text: 'Hello! I am your Microsoft Copilot Security Agent integrated with Microsoft Graph. I can automatically analyze FlowGen live stream threats and dispatch actionable tasks directly to your organization\'s Microsoft To Do, Microsoft Planner, or Azure DevOps workspace.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Form state for creating task manually
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskAssignedRole, setNewTaskAssignedRole] = useState('SOC Compliance Lead');
  const [newTaskChannelId, setNewTaskChannelId] = useState<string>('');

  // OAuth Simulation State
  const [isConnectingMs, setIsConnectingMs] = useState(false);
  const [syncStatusToast, setSyncStatusToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const redChannels = channels.filter((c) => c.authorizedRatio < 0.5);

  const handleConnectMicrosoft = () => {
    setIsConnectingMs(true);
    setTimeout(() => {
      setIsConnectingMs(false);
      onUpdateConfig({
        isConnected: true,
        connectedAccountEmail: 'security.lead@contoso.onmicrosoft.com',
        tenantId: 'contoso-tenant-9941a-ms365',
      });
      setSyncStatusToast('Successfully connected to Microsoft 365 Entra ID & Copilot Studio!');
      setTimeout(() => setSyncStatusToast(null), 3500);
    }, 1200);
  };

  const handleDisconnectMicrosoft = () => {
    onUpdateConfig({ isConnected: false });
    setSyncStatusToast('Microsoft 365 Copilot Agent disconnected.');
    setTimeout(() => setSyncStatusToast(null), 3000);
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg: CopilotChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsCopilotThinking(true);

    setTimeout(() => {
      setIsCopilotThinking(false);

      let responseText = '';
      let suggestedTask: Partial<MicrosoftTask> | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('scan') || lower.includes('threat') || lower.includes('high-risk') || lower.includes('high risk')) {
        if (redChannels.length > 0) {
          const targetChan = redChannels[0];
          responseText = `Copilot Agent Analysis: Detected ${redChannels.length} high-risk streams requiring immediate SOC mitigation. Channel "${targetChan.name}" has an Authorized Ratio of ${Math.round(targetChan.authorizedRatio * 100)}% with ${Math.round(targetChan.botProbability)}% bot probability. I have drafted a Microsoft To Do task below.`;
          suggestedTask = {
            title: `[SOC-CRITICAL] Investigate Bot Surge on ${targetChan.name}`,
            description: `Channel ID: ${targetChan.id}. Authorized ratio dropped to ${Math.round(targetChan.authorizedRatio * 100)}%. Review cashout freeze and discovery suppression settings.`,
            priority: 'high',
            assignedRole: 'Security Operations / Fraud Desk',
            channelId: targetChan.id,
            channelName: targetChan.name,
            sourceTrigger: 'copilot_agent',
          };
        } else {
          responseText = `Copilot Agent Analysis: All ${channels.length} live streams currently pass safety thresholds. No critical threats detected. Would you like me to schedule a routine Microsoft Planner audit item for tomorrow?`;
        }
      } else if (lower.includes('cashout') || lower.includes('freeze') || lower.includes('finance')) {
        responseText = `Copilot Agent Analysis: Cashout freeze overrides require dual authorization under enterprise RBAC policy. I can dispatch an expedited review task directly to your Finance Operations board in Microsoft Planner.`;
        suggestedTask = {
          title: `[FINANCE-AUDIT] Review Cashout Freeze Override Request`,
          description: `Verify merchant identity and dispute logs before releasing frozen escrow funds on marketplace streams.`,
          priority: 'high',
          assignedRole: 'Finance Operations Lead',
          sourceTrigger: 'copilot_agent',
        };
      } else if (lower.includes('webhook') || lower.includes('status') || lower.includes('sync')) {
        responseText = `Microsoft Graph Webhook Endpoint: Active (${config.msGraphWebhookEndpoint}). Real-time bidirectional task sync is active with ${config.targetList}.`;
      } else {
        responseText = `Copilot Agent: I have processed your request ("${text}"). I am continuously monitoring FlowGen Layer 04 view discrimination metrics and can convert any anomalous event into a tracked task in ${config.targetList}.`;
        suggestedTask = {
          title: `[MS-TASKS] ${text.slice(0, 45)}...`,
          description: `Generated via Microsoft Copilot Agent in response to user instruction: "${text}"`,
          priority: 'medium',
          assignedRole: 'Security Lead',
          sourceTrigger: 'copilot_agent',
        };
      }

      const copilotMsg: CopilotChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedTask,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    }, 1000);
  };

  const handleCreateTaskFromSuggestion = (st: Partial<MicrosoftTask>) => {
    onAddTask({
      title: st.title || 'Untitled Microsoft Task',
      description: st.description || 'Generated by Microsoft Copilot Agent',
      priority: st.priority || 'high',
      status: 'notStarted',
      assignedRole: st.assignedRole || 'SOC Compliance Lead',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      channelId: st.channelId,
      channelName: st.channelName,
      sourceTrigger: 'copilot_agent',
    });
    setSyncStatusToast(`Task "${st.title}" pushed to ${config.targetList}!`);
    setTimeout(() => setSyncStatusToast(null), 3000);
  };

  const handleManualTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const selectedCh = channels.find((c) => c.id === newTaskChannelId);

    onAddTask({
      title: newTaskTitle,
      description: newTaskDesc || 'Manual task entered from FlowGen security console.',
      priority: newTaskPriority,
      status: 'notStarted',
      assignedRole: newTaskAssignedRole,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      channelId: newTaskChannelId || undefined,
      channelName: selectedCh?.name,
      sourceTrigger: 'manual',
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowTaskForm(false);
    setSyncStatusToast(`Task created and synced with ${config.targetList}!`);
    setTimeout(() => setSyncStatusToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl bg-[#08090d] border border-blue-500/30 rounded-2xl shadow-[0_0_80px_rgba(0,120,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0078D4]/15 border border-[#0078D4]/40 text-[#0078D4] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#0078D4] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wider uppercase text-white font-mono flex items-center gap-2">
                  MICROSOFT COPILOT AGENT & TASKS HOOKUP
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0078D4]/20 text-cyan-300 border border-[#0078D4]/40 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" /> MS GRAPH READY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connect FlowGen security threat triggers directly to Microsoft To Do, Planner & Azure DevOps for enterprise business task dispatch.
              </p>
            </div>
          </div>

          <button
            id="btn-close-copilot-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Toast Banner */}
        {syncStatusToast && (
          <div className="bg-[#0078D4] text-white px-6 py-2 text-xs font-mono font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              {syncStatusToast}
            </span>
            <span className="text-[10px] opacity-80">MICROSOFT GRAPH API 200 OK</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-zinc-950/80 overflow-x-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('copilot_agent')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'copilot_agent'
                ? 'border-[#0078D4] text-[#0078D4] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>1. COPILOT AGENT ASSISTANT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks_board')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tasks_board'
                ? 'border-[#0078D4] text-[#0078D4] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>2. DISPATCHED MS TASKS ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('microsoft_auth')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'microsoft_auth'
                ? 'border-[#0078D4] text-[#0078D4] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3. MS 365 ENTRA ID & GRAPH</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('automation_rules')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'automation_rules'
                ? 'border-[#0078D4] text-[#0078D4] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>4. AUTOMATION & WEBHOOKS</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: COPILOT AGENT ASSISTANT */}
          {activeTab === 'copilot_agent' && (
            <div className="space-y-4 flex flex-col h-[520px]">
              
              {/* Top Banner Context */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0078D4] animate-ping"></span>
                  <span className="text-zinc-300">COPILOT AGENT MODE:</span>
                  <strong className="text-cyan-300 uppercase">{config.copilotMode}</strong>
                </div>

                <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                  <span>SYNC TARGET: <strong className="text-white">{config.targetList}</strong></span>
                  <span className="text-[#00FF00]">✓ CONNECTED ({config.connectedAccountEmail})</span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 bg-black rounded-xl border border-white/10 space-y-4 font-sans text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mb-1">
                      {msg.sender === 'copilot' ? (
                        <>
                          <Bot className="w-3 h-3 text-[#0078D4]" />
                          <span className="text-[#0078D4] font-bold">Microsoft Copilot Agent</span>
                        </>
                      ) : (
                        <span className="text-zinc-400 font-bold">You ({userRole.toUpperCase()})</span>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-2xl p-3.5 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0078D4] text-white rounded-tr-none font-medium'
                          : 'bg-zinc-950 border border-white/15 text-zinc-200 rounded-tl-none font-sans'
                      }`}
                    >
                      {msg.text}

                      {/* Interactive Suggested Task Card inside Copilot Response */}
                      {msg.suggestedTask && (
                        <div className="mt-3 p-3 bg-black/90 rounded-lg border border-[#0078D4]/40 font-mono text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#0078D4] font-bold uppercase tracking-wider flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5" /> SUGGESTED MS TASK ITEM
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-rose-500/20 text-rose-300 font-bold uppercase">
                              {msg.suggestedTask.priority} PRIORITY
                            </span>
                          </div>

                          <div className="text-white font-bold">{msg.suggestedTask.title}</div>
                          <div className="text-zinc-400 text-[11px] font-sans">{msg.suggestedTask.description}</div>

                          <div className="pt-2 flex items-center justify-between border-t border-white/10">
                            <span className="text-[10px] text-zinc-500">ASSIGNEE: {msg.suggestedTask.assignedRole}</span>
                            <button
                              onClick={() => handleCreateTaskFromSuggestion(msg.suggestedTask!)}
                              className="px-3 py-1.5 rounded-lg bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-mono font-bold text-[10px] uppercase cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>DISPATCH TO {config.targetList.toUpperCase()}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isCopilotThinking && (
                  <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs p-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0078D4]" />
                    <span>Copilot Agent querying Microsoft Graph API & threat metrics...</span>
                  </div>
                )}
              </div>

              {/* Suggested Quick Prompts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono">
                <span className="text-zinc-500 font-bold shrink-0">QUICK PROMPTS:</span>
                <button
                  onClick={() => handleSendChatMessage('Scan active streams for high-risk threats and draft Microsoft To Do tasks')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 whitespace-nowrap cursor-pointer"
                >
                  🤖 Scan threats & draft MS tasks
                </button>
                <button
                  onClick={() => handleSendChatMessage('Draft Cashout Freeze Investigation task for Finance in Microsoft Planner')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 whitespace-nowrap cursor-pointer"
                >
                  📋 Cashout freeze task for Finance
                </button>
                <button
                  onClick={() => handleSendChatMessage('Check Microsoft Graph API connection and list sync status')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 whitespace-nowrap cursor-pointer"
                >
                  ⚡ Check MS Graph status
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-white/15">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask Microsoft Copilot Agent to analyze stream threats, draft tasks, or manage MS Planner..."
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none font-sans"
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  className="px-4 py-2 rounded-lg bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-mono font-bold text-xs uppercase cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ASK COPILOT</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DISPATCHED MICROSOFT TASKS BOARD */}
          {activeTab === 'tasks_board' && (
            <div className="space-y-6">
              
              {/* Header Action Bar */}
              <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/10 font-mono text-xs">
                <div>
                  <h4 className="text-white font-bold uppercase flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#0078D4]" />
                    MICROSOFT GRAPH SYNCED TASKS LIST
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Target List: <strong className="text-white">{config.targetList}</strong> | Total Tasks: <strong>{tasks.length}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="px-4 py-2 rounded-lg bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-mono font-bold text-xs uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>NEW MS TASK ITEM</span>
                </button>
              </div>

              {/* Form to create task manually */}
              {showTaskForm && (
                <form onSubmit={handleManualTaskSubmit} className="p-4 bg-zinc-950 rounded-xl border border-[#0078D4]/40 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-white font-bold uppercase flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#0078D4]" /> DISPATCH NEW TASK TO {config.targetList.toUpperCase()}
                    </span>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="text-zinc-400 hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase">TASK TITLE</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g., Audit TikTok Shop Bot Surge Anomaly"
                        required
                        className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#0078D4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase">ASSOCIATED LIVE STREAM CHANNEL</label>
                      <select
                        value={newTaskChannelId}
                        onChange={(e) => setNewTaskChannelId(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#0078D4]"
                      >
                        <option value="">None (General Security Task)</option>
                        {channels.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({Math.round(c.authorizedRatio * 100)}% Auth)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase">PRIORITY TIER</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#0078D4]"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase">ASSIGNEE ROLE</label>
                      <input
                        type="text"
                        value={newTaskAssignedRole}
                        onChange={(e) => setNewTaskAssignedRole(e.target.value)}
                        placeholder="e.g. SOC Lead / Finance Desk"
                        className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#0078D4]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase">TASK DESCRIPTION & REMEDIATION STEPS</label>
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Enter detailed action items for the compliance team..."
                      rows={2}
                      className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-bold uppercase"
                    >
                      DISPATCH & SYNC TO MICROSOFT
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List Items */}
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950 rounded-xl border border-white/10 text-zinc-400 font-mono text-xs">
                    No Microsoft tasks dispatched yet. Click "NEW MS TASK ITEM" or use Microsoft Copilot Agent to generate tasks.
                  </div>
                ) : (
                  tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-4 bg-zinc-950 rounded-xl border transition-all ${
                        t.status === 'completed'
                          ? 'border-white/10 opacity-60'
                          : t.priority === 'high'
                          ? 'border-rose-500/40 bg-zinc-950/90'
                          : 'border-white/15'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onToggleTaskStatus(t.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                                t.status === 'completed'
                                  ? 'bg-[#00FF00] border-[#00FF00] text-black'
                                  : 'border-white/30 hover:border-[#0078D4]'
                              }`}
                              title="Toggle completion status in Microsoft To Do / Planner"
                            >
                              {t.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <span
                              className={`font-mono text-xs font-bold ${
                                t.status === 'completed' ? 'line-through text-zinc-400' : 'text-white'
                              }`}
                            >
                              {t.title}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                                t.priority === 'high'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : t.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              {t.priority}
                            </span>

                            {t.channelName && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                                CHANNEL: {t.channelName}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 font-sans leading-relaxed">{t.description}</p>

                          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 pt-1">
                            <span>ASSIGNEE: <strong className="text-zinc-300">{t.assignedRole}</strong></span>
                            <span>TRIGGER: <strong className="text-zinc-300">{t.sourceTrigger.toUpperCase()}</strong></span>
                            <span>DUE: <strong className="text-zinc-300">{t.dueDate}</strong></span>
                          </div>
                        </div>

                        {/* Status & Sync Actions */}
                        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 font-mono text-xs">
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-[#0078D4] font-bold uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> MS GRAPH SYNCED
                            </span>
                            <span className="text-[9px] text-zinc-500">ID: {t.msGraphTaskId || `ms_task_${t.id.slice(0, 8)}`}</span>
                          </div>

                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                            title="Delete task item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MICROSOFT 365 ENTRA ID & GRAPH SETTINGS */}
          {activeTab === 'microsoft_auth' && (
            <div className="space-y-6">
              
              {/* Account Connection Card */}
              <div className="p-5 bg-zinc-950 rounded-xl border border-white/10 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold uppercase">
                    <Building2 className="w-5 h-5 text-[#0078D4]" />
                    MICROSOFT 365 ENTERPRISE ACCOUNT STATUS
                  </div>

                  {config.isConnected ? (
                    <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-[#00FF00] border border-[#00FF00]/40 uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF00]" /> AUTHORIZED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                      NOT CONNECTED
                    </span>
                  )}
                </div>

                {config.isConnected ? (
                  <div className="p-4 bg-black rounded-lg border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Connected Account Email:</span>
                      <strong className="text-white">{config.connectedAccountEmail}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Entra ID Tenant ID:</span>
                      <span className="text-zinc-300">{config.tenantId}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Microsoft Graph OAuth Scopes:</span>
                      <span className="text-cyan-300">Tasks.ReadWrite, Planner.ReadWrite, User.Read</span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleDisconnectMicrosoft}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>DISCONNECT MS ACCOUNT</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-black rounded-lg border border-white/10 space-y-3 text-center">
                    <p className="text-zinc-300 font-sans text-xs">
                      Sign in with your Microsoft 365 Business, Work, or School account to enable automated task creation and Copilot agent sync.
                    </p>

                    <button
                      onClick={handleConnectMicrosoft}
                      disabled={isConnectingMs}
                      className="px-6 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-extrabold uppercase transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-[0_0_20px_rgba(0,120,212,0.4)] text-xs"
                    >
                      <RefreshCw className={`w-4 h-4 ${isConnectingMs ? 'animate-spin' : ''}`} />
                      <span>{isConnectingMs ? 'AUTHENTICATING ENTRA ID...' : 'CONNECT MICROSOFT 365 BUSINESS'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Target List Destination Config */}
              <div className="p-5 bg-zinc-950 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
                <span className="text-zinc-300 font-bold uppercase block">SELECT MICROSOFT TASK DESTINATION</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'Microsoft To Do', label: 'Microsoft To Do', desc: 'Personal & team action item lists.' },
                    { id: 'Microsoft Planner', label: 'Microsoft Planner', desc: 'Kanban board buckets for business ops.' },
                    { id: 'Azure DevOps Work Items', label: 'Azure DevOps Work Items', desc: 'Engineering & SOC incident tickets.' },
                    { id: 'Microsoft Teams Tasks', label: 'Microsoft Teams Tasks', desc: 'Shared channel task queues.' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateConfig({ targetList: item.id as any })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        config.targetList === item.id
                          ? 'bg-zinc-900 border-[#0078D4] shadow-[0_0_15px_rgba(0,120,212,0.2)]'
                          : 'bg-black border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold">{item.label}</span>
                        {config.targetList === item.id && <Check className="w-4 h-4 text-[#0078D4]" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTOMATION & WEBHOOKS */}
          {activeTab === 'automation_rules' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="p-5 bg-zinc-950 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#0078D4]" />
                    COPILOT AUTOMATED TASK DISPATCH RULES
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-black rounded-lg border border-white/10">
                    <div>
                      <div className="text-white font-bold">Auto-Dispatch Task on Stream Lockdown</div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Automatically create an Urgent task in {config.targetList} whenever a stream's Authorized Ratio drops below 50%.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.autoSyncAnomalies}
                      onChange={(e) => onUpdateConfig({ autoSyncAnomalies: e.target.checked })}
                      className="w-4 h-4 accent-[#0078D4] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-black rounded-lg border border-white/10">
                    <div>
                      <div className="text-white font-bold">Auto-Assign High Severity Cashout Freezes</div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Assign cashout escrow audit tasks directly to Finance Operations in Microsoft Planner upon manual/auto cashout freeze.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.autoAssignHighSeverity}
                      onChange={(e) => onUpdateConfig({ autoAssignHighSeverity: e.target.checked })}
                      className="w-4 h-4 accent-[#0078D4] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Endpoint Payload Info */}
              <div className="p-5 bg-zinc-950 rounded-xl border border-white/10 space-y-2">
                <span className="text-zinc-300 font-bold uppercase block">MICROSOFT GRAPH WEBHOOK SUBSCRIPTION</span>
                <pre className="p-3 bg-black rounded-lg border border-white/10 text-emerald-400 text-[11px] overflow-x-auto">
{`{
  "subscriptionId": "sub_ms_graph_8f99a1",
  "clientState": "flowgen_secret_state_2026",
  "notificationUrl": "${config.msGraphWebhookEndpoint}",
  "resource": "me/todo/lists/delta",
  "status": "ACTIVE_LISTENING"
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#0078D4]" />
            <span>CONNECTED TO: <strong className="text-white">{config.targetList.toUpperCase()}</strong> | COPILOT AGENT v2.4</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white font-bold transition-all cursor-pointer"
          >
            CLOSE COPILOT HUB
          </button>
        </div>
      </div>
    </div>
  );
}
