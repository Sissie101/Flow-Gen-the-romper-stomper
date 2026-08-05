import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { ShieldCheck, ShieldAlert, Send, MessageSquare } from 'lucide-react';

interface ChatAuditorProps {
  messages: ChatMessage[];
  onAddCustomMessage: (content: string, sender: string) => void;
  urgencyThreshold?: number;
}

export function ChatAuditor({ messages, onAddCustomMessage, urgencyThreshold = 0.4 }: ChatAuditorProps) {
  const [filter, setFilter] = useState<'all' | 'suspicious' | 'verified'>('all');
  const [customText, setCustomText] = useState('');
  const [customSender, setCustomSender] = useState('moderator_test');

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'suspicious') return msg.suspiciousnessScore >= urgencyThreshold;
    if (filter === 'verified') return msg.isVerified;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onAddCustomMessage(customText, customSender.trim() || 'anonymous_tester');
    setCustomText('');
  };

  return (
    <div
      id="chat-auditor-panel"
      className="p-6 rounded-2xl border border-white/10 bg-black flex flex-col h-[520px]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/10 mb-4 gap-4 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-white/10">
            <MessageSquare className="w-4 h-4 text-[#00FF00]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-widest">ALGORITHMIC CHAT AUDITOR</h3>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">Real-time spam &amp; high-pressure urgency detection</p>
          </div>
        </div>

        {/* Filter controls styled as stark segmented tabs */}
        <div className="flex bg-zinc-950 p-1 rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono">
          <button
            id="filter-all"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded transition-all ${
              filter === 'all' ? 'bg-white text-black font-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ALL
          </button>
          <button
            id="filter-suspicious"
            onClick={() => setFilter('suspicious')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
              filter === 'suspicious' ? 'bg-rose-950 text-rose-400 font-black' : 'text-zinc-500 hover:text-rose-400'
            }`}
          >
            SUSPICIOUS ({messages.filter((m) => m.suspiciousnessScore >= urgencyThreshold).length})
          </button>
          <button
            id="filter-verified"
            onClick={() => setFilter('verified')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
              filter === 'verified' ? 'bg-[#00FF00]/10 text-[#00FF00] font-black' : 'text-zinc-500 hover:text-[#00FF00]'
            }`}
          >
            HUMAN ({messages.filter((m) => m.isVerified).length})
          </button>
        </div>
      </div>

      {/* Chat Feed */}
      <div id="chat-feed-scroll" className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 font-mono">
            <MessageSquare className="w-8 h-8 opacity-25 text-zinc-400" />
            <p className="text-xs font-bold uppercase tracking-widest">FEED IS EMPTY</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSuspicious = msg.suspiciousnessScore >= urgencyThreshold;
            const scorePct = Math.round(msg.suspiciousnessScore * 100);

            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`p-3.5 rounded border text-xs transition-all ${
                  isSuspicious
                    ? 'bg-rose-950/20 border-rose-500/35 shadow-sm'
                    : msg.isVerified
                    ? 'bg-zinc-950 border-white/10 text-zinc-300'
                    : 'bg-zinc-950/40 border-white/5 text-zinc-400'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-white font-mono truncate">{msg.sender.toUpperCase()}</span>
                    {msg.isVerified ? (
                      <span
                        className="flex items-center gap-0.5 text-[8px] font-bold font-mono uppercase text-[#00FF00] bg-[#00FF00]/10 px-1.5 py-0.2 rounded border border-[#00FF00]/10 shrink-0 tracking-widest"
                        title="Session validated via OAuth token"
                      >
                        <ShieldCheck className="w-2.5 h-2.5" /> HUMAN
                      </span>
                    ) : (
                      <span
                        className="text-[8px] font-bold font-mono uppercase text-zinc-500 bg-black px-1.5 py-0.2 rounded border border-white/10 shrink-0 tracking-widest"
                        title="Unauthenticated browser connection"
                      >
                        GUEST
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono shrink-0 font-medium">
                    <span>{msg.timestamp}</span>
                    {isSuspicious && (
                      <span className="text-rose-400 font-black bg-rose-500/10 px-1.5 py-0.2 rounded uppercase text-[8px] tracking-wider">
                        {scorePct}% BOT
                      </span>
                    )}
                  </div>
                </div>

                <p className={`text-zinc-300 break-words ${isSuspicious ? 'text-rose-100 font-bold' : 'font-medium'}`}>
                  {msg.content}
                </p>

                {msg.flaggedReason && (
                  <div className="mt-2 pt-2 border-t border-rose-500/10 text-[9px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>AUDIT FLAG: {msg.flaggedReason.toUpperCase()}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input / Classifier Test Form */}
      <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-white/10 shrink-0 space-y-2.5">
        <div className="flex gap-2">
          <input
            id="input-test-sender"
            type="text"
            placeholder="Username"
            value={customSender}
            onChange={(e) => setCustomSender(e.target.value)}
            className="w-1/3 bg-zinc-950 text-xs text-white border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-[#00FF00] font-mono font-bold"
            required
          />
          <div className="flex-1 text-[9px] text-zinc-500 font-medium leading-tight uppercase font-mono flex items-center">
            Audit engine: High-pressure statements (e.g. "BUY NOW", "ALERT") auto-trigger risk audits.
          </div>
        </div>

        <div className="flex gap-2">
          <input
            id="input-test-message"
            type="text"
            placeholder="Type a chat message to audit live..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="flex-1 bg-zinc-950 text-xs text-white border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-[#00FF00] font-medium"
            required
          />
          <button
            id="btn-send-message"
            type="submit"
            className="bg-[#00FF00] hover:bg-[#00e600] text-black font-black p-2.5 rounded transition-colors cursor-pointer flex items-center justify-center aspect-square"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
