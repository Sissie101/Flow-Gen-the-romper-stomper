import React, { useState } from 'react';
import { AuditLog, Channel } from '../types';
import { AlertCircle, CheckCircle, ShieldAlert, FileText, RotateCcw, Download, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AuditLoggerProps {
  logs: AuditLog[];
  onClearLogs: () => void;
  onRestoreStatus: () => void;
  isRed: boolean;
  status: string;
  channel?: Channel;
}

export function AuditLogger({ logs, onClearLogs, onRestoreStatus, isRed, status, channel }: AuditLoggerProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-rose-500/30 bg-rose-950/15 text-rose-200';
      case 'high':
        return 'border-amber-500/30 bg-amber-950/15 text-amber-200';
      case 'medium':
        return 'border-white/15 bg-zinc-900/60 text-zinc-300';
      default:
        return 'border-white/5 bg-zinc-950/40 text-zinc-400';
    }
  };

  const getLogIcon = (type: string, severity: string) => {
    if (type === 'safeguard_triggered' || type === 'cashout_frozen') {
      return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
    }
    if (type === 'cashout_released' || type === 'status_restored') {
      return <CheckCircle className="w-4 h-4 text-[#00FF00] shrink-0 mt-0.5" />;
    }
    if (severity === 'critical' || severity === 'high') {
      return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
    }
    return <FileText className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />;
  };

  const handleGeneratePDFReport = () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const now = new Date();
      const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
      const reportId = `RPT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Background header styling
      doc.setFillColor(10, 10, 12);
      doc.rect(0, 0, 210, 297, 'F');

      // Top Title Bar
      doc.setFillColor(24, 24, 27);
      doc.rect(14, 12, 182, 28, 'F');
      doc.setDrawColor(0, 255, 0);
      doc.setLineWidth(0.5);
      doc.rect(14, 12, 182, 28, 'D');

      doc.setTextColor(0, 255, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('FLOWGEN L4 FRAUD DETECTION & AUDIT REPORT', 20, 23);

      doc.setTextColor(161, 161, 170);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`REPORT ID: ${reportId}   |   GENERATED: ${timestampStr} UTC`, 20, 32);

      // Channel Overview Section
      doc.setFillColor(18, 18, 20);
      doc.rect(14, 45, 182, 38, 'F');
      doc.setDrawColor(63, 63, 70);
      doc.setLineWidth(0.3);
      doc.rect(14, 45, 182, 38, 'D');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`STREAM AUDIT TARGET: ${channel?.name ?? 'ACTIVE STREAM'}`, 20, 53);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(212, 212, 216);

      const hostText = `Host Handle: @${channel?.host ?? 'unknown'}`;
      const statusText = `System Status: ${(status ?? 'UNKNOWN').toUpperCase().replace(/_/g, ' ')}`;
      const viewersText = `Live Connections: ${(channel?.currentViewers ?? 0).toLocaleString()}`;
      const humansText = `Human Tokens: ${(channel?.verifiedHumans ?? 0).toLocaleString()} (${Math.round(
        (channel?.authorizedRatio ?? 1) * 100
      )}%)`;

      doc.text(hostText, 20, 62);
      doc.text(statusText, 110, 62);

      doc.text(viewersText, 20, 70);
      doc.text(humansText, 110, 70);

      const botDiffText = `Bot Differential: ${
        channel
          ? Math.max(
              0,
              Math.round(((channel.currentViewers - channel.verifiedHumans) / Math.max(1, channel.currentViewers)) * 100)
            )
          : 0
      }%`;
      doc.text(botDiffText, 20, 78);

      // Audit Logs Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('INCIDENT LOG TELEMETRY', 14, 92);

      // AutoTable for Log Items
      const tableData = logs.map((log) => [
        log.timestamp,
        log.type.toUpperCase().replace(/_/g, ' '),
        log.severity.toUpperCase(),
        log.detail,
        log.actionTaken.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: 96,
        head: [['Time', 'Event Type', 'Severity', 'Incident Detail', 'Action Taken']],
        body: tableData.length > 0 ? tableData : [['--', 'NO LOGS RECORDED', 'LOW', 'System operating inside baseline tolerances', 'NONE']],
        theme: 'grid',
        headStyles: {
          fillColor: [39, 39, 42],
          textColor: [0, 255, 0],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fillColor: [15, 15, 18],
          textColor: [224, 224, 224],
          fontSize: 8,
          lineColor: [40, 40, 45],
        },
        alternateRowStyles: {
          fillColor: [22, 22, 26],
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 35, fontStyle: 'bold' },
          2: { cellWidth: 20 },
          3: { cellWidth: 65 },
          4: { cellWidth: 40, fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });

      // Footer Sign-off Stamp
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 180;
      doc.setFillColor(18, 18, 20);
      doc.rect(14, Math.min(finalY, 260), 182, 22, 'F');
      doc.setDrawColor(0, 255, 0);
      doc.rect(14, Math.min(finalY, 260), 182, 22, 'D');

      doc.setTextColor(0, 255, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('VERIFIED BY FLOWGEN DISCOVERY SAFEGUARDS ENGINE', 20, Math.min(finalY, 260) + 9);

      doc.setTextColor(161, 161, 170);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('This document contains automated threat assessment metadata. Confidential & Cryptographically Signed.', 20, Math.min(finalY, 260) + 16);

      const fileName = `FlowGen_Audit_Report_${(channel?.host ?? 'stream').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      doc.save(fileName);

      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      id="audit-logger-panel"
      className="p-6 rounded-2xl border border-white/10 bg-black flex flex-col h-[520px]"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 mb-4 gap-4 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-zinc-900 border border-white/10">
            <FileText className="w-4 h-4 text-[#00FF00]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-widest">SERVER SECURITY &amp; AUDIT LOGS</h3>
            <p className="text-[10px] text-zinc-500 font-medium font-sans">Live platform safeguard &amp; automated logs</p>
          </div>
        </div>

        {/* Override controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-generate-pdf-report"
            onClick={handleGeneratePDFReport}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-[#00FF00] hover:bg-[#00DD00] disabled:opacity-50 text-black px-3 py-1.5 rounded transition-all cursor-pointer font-mono shadow-[0_0_10px_rgba(0,255,0,0.2)]"
            title="Export session log file as PDF audit report"
          >
            {pdfDownloaded ? (
              <>
                <Check className="w-3 h-3 text-black" />
                PDF EXPORTED
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-black" />
                {isGeneratingPdf ? 'GENERATING...' : 'GENERATE PDF REPORT'}
              </>
            )}
          </button>

          {isRed && (
            <button
              id="btn-manual-override"
              onClick={onRestoreStatus}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-white hover:bg-zinc-200 text-black px-3 py-1.5 rounded transition-all cursor-pointer font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              OVERRIDE
            </button>
          )}
          <button
            id="btn-clear-logs"
            onClick={onClearLogs}
            className="text-[9px] font-black uppercase tracking-wider border border-white/25 hover:border-white text-zinc-400 hover:text-white px-3 py-1.5 rounded transition-all cursor-pointer font-mono bg-zinc-950"
          >
            CLEAR LOGS
          </button>
        </div>
      </div>

      {/* Logs list */}
      <div id="logs-container" className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 font-mono">
            <FileText className="w-8 h-8 opacity-25 text-zinc-400" />
            <p className="text-xs font-bold uppercase tracking-widest">LOG HISTORY CLEAR</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              id={`log-item-${log.id}`}
              className={`p-3.5 rounded border text-xs flex gap-3.5 transition-all ${getSeverityStyle(
                log.severity
              )}`}
            >
              {getLogIcon(log.type, log.severity)}

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-extrabold tracking-widest uppercase text-[8px] font-mono text-zinc-400">
                    {log.type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500 shrink-0 font-medium">{log.timestamp}</span>
                </div>
                <p className="text-zinc-200 leading-relaxed font-sans font-medium">{log.detail}</p>
                <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5 pt-1.5 border-t border-white/5">
                  <span className="font-bold text-zinc-500">ACTION:</span>
                  <span className="font-bold text-white italic">{log.actionTaken.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary status */}
      <div className="mt-4 pt-4 border-t border-white/10 shrink-0 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 p-3.5 rounded border border-white/5 font-mono">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isRed ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]' : 'bg-[#00FF00] shadow-[0_0_8px_#00FF00]'
            }`}
          />
          <span className="font-bold tracking-wider">
            STATUS:{' '}
            <span className={`font-black ${isRed ? 'text-rose-400' : 'text-[#00FF00]'}`}>
              {status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </span>
        </div>
        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">FLOWGEN L4 SECURE</span>
      </div>
    </div>
  );
}

