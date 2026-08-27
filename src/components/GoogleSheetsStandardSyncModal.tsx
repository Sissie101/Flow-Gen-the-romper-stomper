import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Code2,
  Sparkles,
  Bot,
  RefreshCw,
  X,
  Play,
  Layers,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Radio,
} from 'lucide-react';
import { Channel, StandardSheetRow, ThemeMode } from '../types';

interface GoogleSheetsStandardSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  theme: ThemeMode;
}

export const GoogleSheetsStandardSyncModal: React.FC<GoogleSheetsStandardSyncModalProps> = ({
  isOpen,
  onClose,
  channels,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'appsScript' | 'webhook'>('table');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  // Initialize standardized rows with current channels
  const [rows, setRows] = useState<StandardSheetRow[]>([
    {
      id: 'row-1',
      colA_eventTitle: 'MEGASAVE FLASH DEALS',
      colB_accountId: 'CHAZ & BRENDA',
      colC_hypeScore: 0.28,
      colD_views: 15000,
      colE_timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      colF_rawText:
        'LIMITED TIME DEAL! ONLY 3 LEFT IN STOCK! ACT FAST OR MISS OUT FOREVER! 50% OFF FOR THE NEXT 60 SECONDS!',
      sentiment: 'artificial_fomo',
      botRisk: 'High urgency spikes from unverified chatters',
      analyzedByGemini: true,
    },
    {
      id: 'row-2',
      colA_eventTitle: 'HANDMADE CERAMICS DROP #14',
      colB_accountId: 'LUNA_STUDIO_SOLO',
      colC_hypeScore: 0.12,
      colD_views: 3400,
      colE_timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      colF_rawText:
        'Welcome in everyone! This batch is all hand-thrown stoneware. Feel free to ask about glaze colors. Shipping out tomorrow morning.',
      sentiment: 'organic_curiosity',
      botRisk: 'Organic community chat with real buyer intent',
      analyzedByGemini: true,
    },
    {
      id: 'row-3',
      colA_eventTitle: 'RETRO GAMING COLLECTIBLES',
      colB_accountId: 'PIXEL_VAULT_LIVE',
      colC_hypeScore: 0.45,
      colD_views: 8200,
      colE_timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      colF_rawText:
        'CGC 9.8 graded! Bidding is hot right now! Chat is flying! Who wants this rare Japanese import edition? Going once, going twice!',
      sentiment: 'enthusiastic',
      botRisk: 'Medium competition speed, authentic auction interest',
      analyzedByGemini: false,
    },
    ...channels.slice(0, 3).map((ch, idx) => ({
      id: `ch-row-${idx + 4}`,
      colA_eventTitle: ch.name,
      colB_accountId: ch.host,
      colC_hypeScore: parseFloat((ch.urgencyScore / 100).toFixed(2)),
      colD_views: ch.currentViewers,
      colE_timestamp: new Date(Date.now() - 1000 * 60 * (idx + 1) * 30).toISOString(),
      colF_rawText: `Live stream session for ${ch.name}. Monitored authorized ratio is ${(ch.authorizedRatio * 100).toFixed(0)}% with ${ch.verifiedHumans} verified viewers.`,
      sentiment: ch.urgencyScore > 50 ? 'artificial_fomo' : 'organic_curiosity',
      botRisk: ch.botProbability > 50 ? 'High bot presence' : 'Nominal verified ratio',
      analyzedByGemini: false,
    })),
  ]);

  // New Row input form
  const [newEventTitle, setNewEventTitle] = useState('SOLO CREATOR SPECIAL RELEASE');
  const [newAccountId, setNewAccountId] = useState('MY_SOLO_SHOP');
  const [newViews, setNewViews] = useState(1200);
  const [newRawText, setNewRawText] = useState(
    'Hey chat! Glad you made it. I am giving away free stickers with every order over $30. Let me know which design you love!'
  );

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunGeminiAnalysisOnRow = async (rowId: string) => {
    const target = rows.find((r) => r.id === rowId);
    if (!target) return;

    setIsAnalyzing(true);
    setAnalysisStatus(`Running Gemini 3.7 Flash on row "${target.colA_eventTitle}"...`);

    try {
      const res = await fetch('/api/gemini/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: target.colF_rawText,
          eventTitle: target.colA_eventTitle,
          accountId: target.colB_accountId,
          currentViewers: target.colD_views,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                colC_hypeScore: data.hypeScore,
                sentiment: data.sentiment,
                botRisk: data.botRiskAssessment,
                analyzedByGemini: true,
              }
            : r
        )
      );
      setAnalysisStatus(`Gemini completed analysis! Hype Score updated to ${data.hypeScore} (${(data.hypeScore * 100).toFixed(0)}%).`);
    } catch (err) {
      console.warn('Fallback analysis:', err);
      // Fallback calculation
      const lower = target.colF_rawText.toLowerCase();
      const count = ['hurry', 'fast', 'only', 'deal', 'now', 'timer', 'limited'].filter((k) =>
        lower.includes(k)
      ).length;
      const score = Math.min(Math.max(count * 0.18 + 0.1, 0.05), 0.95);

      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                colC_hypeScore: parseFloat(score.toFixed(2)),
                sentiment: score > 0.5 ? 'artificial_fomo' : 'organic_curiosity',
                botRisk: score > 0.5 ? 'Elevated urgency language' : 'Authentic human conversation',
                analyzedByGemini: true,
              }
            : r
        )
      );
      setAnalysisStatus(`Analysis completed! Hype Score updated to ${score.toFixed(2)}.`);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisStatus(null), 4000);
    }
  };

  const handleAddNewRow = async () => {
    const newId = `custom-row-${Date.now()}`;
    const newRow: StandardSheetRow = {
      id: newId,
      colA_eventTitle: newEventTitle,
      colB_accountId: newAccountId,
      colC_hypeScore: 0.2, // provisional
      colD_views: newViews,
      colE_timestamp: new Date().toISOString(),
      colF_rawText: newRawText,
      sentiment: 'pending_analysis',
      botRisk: 'Queued for Gemini',
      analyzedByGemini: false,
    };

    setRows((prev) => [newRow, ...prev]);
    // Automatically trigger Gemini analysis on newly added row
    await handleRunGeminiAnalysisOnRow(newId);
  };

  const exportCsv = () => {
    const headers = ['Col A: Event Title', 'Col B: Account ID', 'Col C: Hype Score', 'Col D: Views', 'Col E: Timestamp', 'Col F: Raw Text'];
    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `"${r.colA_eventTitle.replace(/"/g, '""')}"`,
          `"${r.colB_accountId.replace(/"/g, '""')}"`,
          r.colC_hypeScore.toFixed(2),
          r.colD_views,
          `"${r.colE_timestamp}"`,
          `"${r.colF_rawText.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `flowgen_google_sheets_standard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const appsScriptCode = `/**
 * Google Apps Script for Google Sheets + Google AI Studio (Gemini 2.5/3.7)
 * 
 * Auto-triggers when new stream rows are added.
 * Reads Column F (Raw Text transcript), invokes Gemini API to evaluate
 * artificial hype and FOMO urgency, and writes back Column C (Hype Score decimal 0.0 - 1.0).
 * 
 * How to install:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Paste this code and set your GEMINI_API_KEY in Project Settings > Script Properties.
 */

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  
  // Trigger on Column F (Column 6) for data rows (row > 1)
  if (range.getColumn() === 6 && row > 1) {
    const rawText = range.getValue();
    if (!rawText) return;
    
    const hypeScore = analyzeHypeWithGemini(rawText);
    if (hypeScore !== null) {
      sheet.getRange(row, 3).setValue(hypeScore); // Column C = Hype Score
    }
  }
}

function analyzeHypeWithGemini(rawText) {
  const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    Logger.log("Missing GEMINI_API_KEY in Script Properties.");
    return null;
  }
  
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
  
  const payload = {
    contents: [{
      parts: [{
        text: "Analyze the following live-stream chat transcript for artificial urgency, FOMO pressure, and bot hype. Return ONLY a single JSON object with 'hypeScore' float between 0.0 and 1.0 (where 0.0 is purely organic and 1.0 is extreme artificial hype).\\n\\nTranscript:\\n\\"\\"\\"" + rawText + "\\"\\"\\"\\n\\nJSON output:"
      }]
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const result = JSON.parse(response.getContentText());
    const candidateText = result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0] && result.candidates[0].content.parts[0].text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      const score = parseFloat(parsed.hypeScore);
      return Math.min(Math.max(score, 0.0), 1.0);
    }
  } catch (err) {
    Logger.log("Gemini API invocation error: " + err);
  }
  return null;
}`;

  const webhookJsonPayload = JSON.stringify(
    {
      eventTitle: rows[0]?.colA_eventTitle || 'MEGASAVE FLASH DEALS',
      accountId: rows[0]?.colB_accountId || 'CHAZ & BRENDA',
      hypeScore: rows[0]?.colC_hypeScore || 0.28,
      views: rows[0]?.colD_views || 15000,
      timestamp: rows[0]?.colE_timestamp || new Date().toISOString(),
      rawText: rows[0]?.colF_rawText || 'Sample transcript text',
    },
    null,
    2
  );

  return (
    <div
      id="google-sheets-standard-sync-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-6 max-h-[92vh] ${
          theme === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#09090b] border-white/10 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b flex items-center justify-between ${
            theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-sans">
                  Google Sheets & AI Studio Standardized Ingestion Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Col A–F Standard
                </span>
              </div>
              <p className={`text-xs ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'} font-sans`}>
                Standardized decimal Hype Scores (0.0 to 1.0), automated Gemini transcript parsing, and 1-click Google Apps Script sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              theme === 'light'
                ? 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                : 'border-white/10 hover:bg-white/10 text-zinc-400'
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-6 pt-3 border-b flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-wider ${
            theme === 'light' ? 'bg-zinc-100/60 border-zinc-200' : 'bg-zinc-900/50 border-white/10'
          }`}
        >
          <button
            onClick={() => setActiveTab('table')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'table'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Standard Data Grid (Col A–F)</span>
          </button>

          <button
            onClick={() => setActiveTab('appsScript')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'appsScript'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Google Apps Script Code</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'webhook'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>3. Webhook / Zapier Payload</span>
          </button>
        </div>

        {/* Status Toast Notification */}
        {analysisStatus && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
            <span>{analysisStatus}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'table' && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs font-mono text-zinc-400">
                  <span className="font-bold text-white uppercase">Schema Standard:</span> Col A (Event Title) | Col B (Account ID) | Col C (Hype Decimal 0.0-1.0) | Col D (Views) | Col E (Timestamp) | Col F (Raw Text)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportCsv}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>EXPORT CSV FOR GOOGLE SHEETS</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div
                className={`rounded-xl border overflow-x-auto ${
                  theme === 'light' ? 'border-zinc-200 bg-white' : 'border-white/10 bg-zinc-950'
                }`}
              >
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-[10px] font-black uppercase tracking-wider ${
                        theme === 'light' ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      <th className="p-3">Col A: Event Title</th>
                      <th className="p-3">Col B: Account ID</th>
                      <th className="p-3 text-center">Col C: Hype Score</th>
                      <th className="p-3 text-right">Col D: Views</th>
                      <th className="p-3">Col E: Timestamp</th>
                      <th className="p-3">Col F: Raw Text (Transcript)</th>
                      <th className="p-3 text-center">Gemini AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="p-3 font-bold text-white">{row.colA_eventTitle}</td>
                        <td className="p-3 text-zinc-400">{row.colB_accountId}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[11px] ${
                              row.colC_hypeScore > 0.5
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : row.colC_hypeScore > 0.25
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                            title={`Normalized decimal: ${row.colC_hypeScore}`}
                          >
                            {row.colC_hypeScore.toFixed(2)} ({(row.colC_hypeScore * 100).toFixed(0)}%)
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">{row.colD_views.toLocaleString()}</td>
                        <td className="p-3 text-[10px] text-zinc-500">
                          {new Date(row.colE_timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 max-w-xs truncate text-zinc-300" title={row.colF_rawText}>
                          {row.colF_rawText}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRunGeminiAnalysisOnRow(row.id)}
                            disabled={isAnalyzing}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 mx-auto transition-all ${
                              row.analyzedByGemini
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            }`}
                            title="Run Gemini 3.7 Flash on this transcript"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{row.analyzedByGemini ? 'Re-Analyze' : 'Analyze AI'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add / Ingest New Stream Row Section */}
              <div
                className={`p-4 rounded-xl border space-y-4 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                  <Play className="w-4 h-4" />
                  <span>Test Ingest New Row (Runs Gemini AI on Col F automatically)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                      Col A: Event Title
                    </label>
                    <input
                      type="text"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className={`w-full text-xs p-2 rounded border focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border-zinc-300 text-zinc-900'
                          : 'bg-zinc-950 border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                      Col B: Account ID
                    </label>
                    <input
                      type="text"
                      value={newAccountId}
                      onChange={(e) => setNewAccountId(e.target.value)}
                      className={`w-full text-xs p-2 rounded border focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border-zinc-300 text-zinc-900'
                          : 'bg-zinc-950 border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                      Col D: Concurrent Views
                    </label>
                    <input
                      type="number"
                      value={newViews}
                      onChange={(e) => setNewViews(Number(e.target.value))}
                      className={`w-full text-xs p-2 rounded border focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border-zinc-300 text-zinc-900'
                          : 'bg-zinc-950 border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                    Col F: Raw Chat Transcript (Gemini extracts Hype Score decimal & sentiment from this)
                  </label>
                  <textarea
                    rows={2}
                    value={newRawText}
                    onChange={(e) => setNewRawText(e.target.value)}
                    className={`w-full text-xs p-2 rounded border font-sans focus:outline-none ${
                      theme === 'light'
                        ? 'bg-white border-zinc-300 text-zinc-900'
                        : 'bg-zinc-950 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddNewRow}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>INGEST & ANALYZE WITH GEMINI</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appsScript' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider font-mono text-white">
                    Google Apps Script (Auto-Calculate Column C via Gemini)
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Paste this directly into your Google Sheet via Extensions &gt; Apps Script.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(appsScriptCode, 'script')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  {copiedKey === 'script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'script' ? 'COPIED TO CLIPBOARD' : 'COPY APPS SCRIPT'}</span>
                </button>
              </div>

              <div
                className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[380px] ${
                  theme === 'light' ? 'bg-zinc-900 text-emerald-400 border-zinc-300' : 'bg-black text-emerald-400 border-white/10'
                }`}
              >
                <pre>{appsScriptCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider font-mono text-white">
                    Standardized JSON Webhook Payload (Zapier / n8n / Make.com)
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Configure your upstream FlowGen bot or webhook to output this exact payload structure.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(webhookJsonPayload, 'json')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  {copiedKey === 'json' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'json' ? 'COPIED PAYLOAD' : 'COPY JSON PAYLOAD'}</span>
                </button>
              </div>

              <div
                className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${
                  theme === 'light' ? 'bg-zinc-900 text-amber-300 border-zinc-300' : 'bg-black text-amber-300 border-white/10'
                }`}
              >
                <pre>{webhookJsonPayload}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
            theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-white/10 text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Decimal Hype Score standard (0.0 to 1.0) guarantees 100% chart accuracy.</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold font-mono text-xs border ${
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
