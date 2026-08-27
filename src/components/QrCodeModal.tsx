import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Copy, Check, ExternalLink, ShieldCheck, AlertTriangle, Smartphone, Share2, Download } from 'lucide-react';
import { Channel } from '../types';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  isRed: boolean;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  channel,
  isRed,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrColorMode, setQrColorMode] = useState<'cyber' | 'classic'>('cyber');

  if (!isOpen || !channel) return null;

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://flowgen.io';
  const auditReportUrl = `${baseUrl}?channel=${encodeURIComponent(channel.id)}&report=true`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(auditReportUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {});
    }
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('audit-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    const sanitizedHost = channel.host.replace(/[^a-zA-Z0-9_-]/g, '_');

    downloadLink.href = svgUrl;
    downloadLink.download = `FlowGen_QR_${sanitizedHost}_${channel.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div
      id="qr-code-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="qr-code-modal-content"
        className="relative w-full max-w-lg bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/80 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black uppercase text-white tracking-wider flex items-center gap-2">
                MOBILE COLLABORATION QR CODE
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Instant Zero-Trust Audit Sync for Mobile Devices
              </p>
            </div>
          </div>
          <button
            id="btn-close-qr-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Stream Information Card */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">{channel.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                  @{channel.host}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                <span>ID: {channel.id}</span>
                <span>•</span>
                <span>Category: {channel.category.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                isRed
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {isRed ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {isRed ? 'RED: HIGH RISK' : 'VERIFIED SECURE'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {channel.currentViewers.toLocaleString()} Viewers ({Math.round(channel.authorizedRatio * 100)}% Auth)
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative p-5 bg-black rounded-2xl border-2 border-purple-500/40 shadow-xl shadow-purple-500/10 flex flex-col items-center justify-center">
              <QRCodeSVG
                id="audit-qr-svg"
                value={auditReportUrl}
                size={210}
                bgColor={qrColorMode === 'cyber' ? '#09090b' : '#ffffff'}
                fgColor={qrColorMode === 'cyber' ? '#00FF00' : '#000000'}
                level="H"
                includeMargin={true}
              />
              <div className="mt-3 text-center">
                <p className="text-[10px] font-mono text-zinc-400 tracking-wider">
                  SCAN WITH SMARTPHONE CAMERA OR TABLET
                </p>
              </div>
            </div>

            {/* QR Styling Selector */}
            <div className="flex items-center gap-2 bg-zinc-900/90 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setQrColorMode('cyber')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  qrColorMode === 'cyber'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Cyber Matrix Green
              </button>
              <button
                type="button"
                onClick={() => setQrColorMode('classic')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  qrColorMode === 'classic'
                    ? 'bg-zinc-100 text-zinc-900 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                High Contrast Black & White
              </button>
            </div>
          </div>

          {/* Deep Link URL Input Box */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center justify-between">
              <span>Mobile Collaboration Deep Link URL</span>
              <span className="text-purple-400 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Live Mobile Target
              </span>
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-white/10 rounded-xl">
              <input
                type="text"
                readOnly
                value={auditReportUrl}
                className="w-full bg-transparent px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none select-all"
              />
              <button
                id="btn-qr-modal-copy-link"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-[#00FF00] text-black border-[#00FF00]'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/10 hover:border-white/30'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Collaboration Usage Instructions */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] font-mono text-purple-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-300 uppercase tracking-wide">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Mobile Collaboration Instructions</span>
            </div>
            <p className="leading-relaxed">
              Scan this QR code with any mobile device camera, tablet, or secondary monitor. Team members in SOC command centers or live field operations can instantly join the stream audit session, view telemetry alerts, and review threat classifications in real time.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/90 border-t border-white/10">
          <button
            id="btn-qr-modal-download-svg"
            onClick={handleDownloadSVG}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>DOWNLOAD QR VECTOR (SVG)</span>
          </button>
          <button
            id="btn-qr-modal-close-footer"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
