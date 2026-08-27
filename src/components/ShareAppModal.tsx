import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Globe,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [copiedTextMsg, setCopiedTextMsg] = useState(false);
  const [qrColorMode, setQrColorMode] = useState<'brand' | 'classic'>('brand');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-taobwajdvkqedzn2nylqmc-270895439927.us-east5.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const emailShareText = `Check out our live stream & store auditor app:\n\n${currentUrl}\n\nHere you can see live stream metrics, genuine viewer intent, real-time hype scoring, and solo creator marketing tools!`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailShareText).then(() => {
      setCopiedEmailText(true);
      setTimeout(() => setCopiedEmailText(false), 2500);
    }).catch(() => {
      setCopiedEmailText(true);
      setTimeout(() => setCopiedEmailText(false), 2500);
    });
  };

  const smsShareText = `Hey! Here is the live link to check out our dashboard: ${currentUrl}`;

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsShareText).then(() => {
      setCopiedTextMsg(true);
      setTimeout(() => setCopiedTextMsg(false), 2500);
    }).catch(() => {
      setCopiedTextMsg(true);
      setTimeout(() => setCopiedTextMsg(false), 2500);
    });
  };

  const handleOpenNewTab = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="share-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="share-app-modal-content"
        className={`relative w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          theme === 'light' ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-zinc-950 border-white/20 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'light' ? 'bg-zinc-100/90 border-zinc-200' : 'bg-zinc-900/90 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black uppercase tracking-wider flex items-center gap-2">
                SHARE LIVE APP WITH OTHERS
              </h2>
              <p className={`text-[11px] font-mono ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Give this link or QR code to your buyers, team, or subscribers
              </p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Main Link Box with 1-Click Copy */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00FF00]" />
                Direct Public App URL
              </span>
              <span className="text-[10px] text-emerald-400 font-normal">Ready to share</span>
            </label>
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border ${
                theme === 'light' ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-900 border-white/15'
              }`}
            >
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs font-mono px-2 py-1 outline-none select-all text-zinc-300"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                id="btn-copy-main-share-url"
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm ${
                  copiedLink
                    ? 'bg-emerald-400 text-black font-black'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button
                onClick={handleOpenNewTab}
                className={`p-2 rounded-lg border text-zinc-400 hover:text-white transition-colors ${
                  theme === 'light' ? 'border-zinc-300 hover:bg-zinc-200' : 'border-white/10 hover:bg-white/10'
                }`}
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QR Code & Mobile Scan Section */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-6 ${
              theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
            }`}
          >
            <div className="p-3 bg-white rounded-xl shadow-lg border border-zinc-200 shrink-0">
              <QRCodeSVG
                value={currentUrl}
                size={140}
                level="H"
                includeMargin={true}
                fgColor={qrColorMode === 'brand' ? '#10b981' : '#000000'}
                bgColor="#ffffff"
              />
            </div>
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                  <Smartphone className="w-4 h-4" />
                  <span>Instant Mobile Scan & Join</span>
                </div>
                <p className={`text-xs ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  People can point any smartphone camera at this QR code to open the app on iPhone or Android immediately without installing anything.
                </p>
              </div>

              {/* QR Style Selector */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono">
                <span className="text-[10px] text-zinc-500">QR Color:</span>
                <button
                  onClick={() => setQrColorMode('brand')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    qrColorMode === 'brand'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Emerald Cyber
                </button>
                <button
                  onClick={() => setQrColorMode('classic')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    qrColorMode === 'classic'
                      ? 'bg-zinc-700 text-white border-zinc-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Classic Black
                </button>
              </div>
            </div>
          </div>

          {/* Quick Pre-Crafted Share Messages */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pre-Made Messages For Sending</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email / Newsletter template */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    For Email / Newsletter
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedEmailText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmailText ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className={`text-[11px] line-clamp-3 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                  "Check out our live stream & store auditor app... Here you can see live stream metrics, genuine viewer intent, real-time hype scoring..."
                </p>
              </div>

              {/* Text Message / DM template */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    For SMS / DM / Chat
                  </span>
                  <button
                    onClick={handleCopySMS}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedTextMsg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTextMsg ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className={`text-[11px] line-clamp-3 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                  "Hey! Here is the live link to check out our dashboard: [Link]"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
            theme === 'light' ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-white/10 text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Accessible by anyone with this link via Google Cloud Run preview</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold font-mono text-xs border cursor-pointer ${
              theme === 'light'
                ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border-zinc-300'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/10'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
