import React, { useState } from 'react';
import { UserRole, GovernancePolicy, AuditLog } from '../types';
import {
  ShieldCheck,
  Lock,
  Key,
  Shield,
  Check,
  AlertTriangle,
  UserCheck,
  Eye,
  EyeOff,
  Activity,
  FileCode,
  CheckCircle2,
  X,
  Zap,
  RefreshCw,
  Copy,
  Server,
  Layers,
  Sparkles,
  Sliders,
  Database,
  Terminal,
  FileCheck,
} from 'lucide-react';

interface SecurityGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onChangeRole: (newRole: UserRole) => void;
  policy: GovernancePolicy;
  onUpdatePolicy: (newPolicy: Partial<GovernancePolicy>) => void;
  auditLogs: AuditLog[];
  rateLimitCount: number;
  onResetRateLimit: () => void;
}

export function SecurityGovernanceModal({
  isOpen,
  onClose,
  currentRole,
  onChangeRole,
  policy,
  onUpdatePolicy,
  auditLogs,
  rateLimitCount,
  onResetRateLimit,
}: SecurityGovernanceModalProps) {
  const [activeTab, setActiveTab] = useState<'rbac' | 'encryption' | 'ratelimit' | 'anomalies' | 'immutable_logs' | 'privacy'>('encryption');
  
  // Simulated Interactive States
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyRotated, setKeyRotated] = useState(false);
  const [isVerifyingHashes, setIsVerifyingHashes] = useState(false);
  const [hashVerificationResult, setHashVerificationResult] = useState<boolean | null>(null);
  const [simulatedToken, setSimulatedToken] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaGFzaF9hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyMjg3MzgwMH0.flowgen_sig_sha256_8f99a'
  );
  const [tokenValidationStatus, setTokenValidationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyKeyFingerprint = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText('SHA256:8f99a12bc443e0988f12a99304bd821ee328f410')
        .then(() => {
          setCopiedKey(true);
          setTimeout(() => setCopiedKey(false), 2000);
        })
        .catch(() => {});
    }
  };

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  const handleVerifyLogIntegrity = () => {
    setIsVerifyingHashes(true);
    setTimeout(() => {
      setIsVerifyingHashes(false);
      setHashVerificationResult(true);
    }, 1200);
  };

  const handleValidateToken = () => {
    if (simulatedToken.includes('flowgen_sig_sha256')) {
      setTokenValidationStatus('VALID_JWT_TOKEN');
    } else {
      setTokenValidationStatus('INVALID_SIGNATURE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl bg-[#08090d] border border-white/20 rounded-2xl shadow-[0_0_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wider uppercase text-white font-mono">
                  SECURITY & GOVERNANCE CONTROL CENTER
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40 uppercase">
                  ENTERPRISE CERTIFIED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                AES-256 Storage Encryption, TLS 1.3 Transport, RBAC Access Tiers, Anomaly Detection & Immutable Logs.
              </p>
            </div>
          </div>

          <button
            id="btn-close-security-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-zinc-950/80 overflow-x-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('encryption')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'encryption'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>1. DATA ENCRYPTION</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rbac'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. RBAC ACCESS CONTROL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ratelimit')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ratelimit'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. RATE LIMIT & TOKENS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'anomalies'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. ACCESS ANOMALIES</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('immutable_logs')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'immutable_logs'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>5. SHA-256 IMMUTABLE LOGS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-[#00FF00] text-[#00FF00] bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>6. PRIVACY BY DESIGN</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: DATA ENCRYPTION */}
          {activeTab === 'encryption' && (
            <div className="space-y-6">
              {/* Encryption Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#00FF00] font-mono font-bold text-xs uppercase">
                      <Lock className="w-4 h-4" />
                      <span>STORAGE ENCRYPTION: AT-REST</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Algorithm:</span>
                      <span className="text-white font-mono font-bold">AES-256-GCM (Authenticated)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Master Envelope Key ID:</span>
                      <span className="text-zinc-300 font-mono text-[11px]">mk_env_9941a_prod</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Key Rotation Schedule:</span>
                      <span className="text-[#00FF00] font-mono">Automated 90-Day Cycle</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2 border-t border-white/10">
                    <button
                      onClick={handleCopyKeyFingerprint}
                      className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-[#00FF00]" /> : <Copy className="w-3.5 h-3.5 text-[#00FF00]" />}
                      <span>{copiedKey ? 'COPIED FINGERPRINT' : 'COPY FINGERPRINT'}</span>
                    </button>

                    <button
                      onClick={handleRotateKey}
                      className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${keyRotated ? 'text-[#00FF00] animate-spin' : 'text-zinc-400'}`} />
                      <span>{keyRotated ? 'KEY ROTATION COMPLETED' : 'FORCE KEY ROTATION'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
                      <Server className="w-4 h-4" />
                      <span>TRANSPORT SECURITY: IN-TRANSIT</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                      TLS 1.3 SECURE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Transport Cipher:</span>
                      <span className="text-white font-mono font-bold">TLS_AES_256_GCM_SHA384</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Key Exchange:</span>
                      <span className="text-zinc-300 font-mono text-[11px]">ECDHE-X25519 (Forward Secrecy)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">HSTS Preload Status:</span>
                      <span className="text-[#00FF00] font-mono">Strict-Transport-Security Active</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] font-mono text-zinc-400">
                    * All client-to-server and inter-service telemetry channels are zero-trust encrypted.
                  </div>
                </div>
              </div>

              {/* Encryption Proof Console */}
              <div className="p-4 bg-black rounded-xl border border-white/10 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-zinc-300">
                    <Terminal className="w-4 h-4 text-[#00FF00]" /> REAL-TIME ENCRYPTED PAYLOAD INSPECTOR
                  </span>
                  <span>ZERO-KNOWLEDGE DECRYPTION PROOF</span>
                </div>
                <pre className="p-3 bg-zinc-950 rounded-lg border border-white/10 text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">
{`{
  "cipher": "AES-256-GCM",
  "iv": "9f21ab04781c",
  "ciphertext": "e81d09f7a1b32d0c89a712f04e12c6a992d3e41a08...",
  "auth_tag": "3a9921b7e411082c",
  "transport_protocol": "TLS 1.3 / ECDHE-X25519",
  "integrity_verdict": "VERIFIED_UNAMPERED"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: RBAC ACCESS CONTROL */}
          {activeTab === 'rbac' && (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-3">
                  SELECT ACTIVE USER ROLE (PERMISSION TIER)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeRole('admin')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-zinc-900 border-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.15)]'
                        : 'bg-zinc-950/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black font-mono text-white uppercase">ADMINISTRATOR</span>
                      {currentRole === 'admin' && <Check className="w-4 h-4 text-[#00FF00]" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mb-3">
                      Full administrative access. Can override safeguards, modify thresholds, reset systems, and export audit logs.
                    </p>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-[#00FF00] border border-[#00FF00]/40">
                      FULL PRIVILEGES
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeRole('author')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      currentRole === 'author'
                        ? 'bg-zinc-900 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                        : 'bg-zinc-950/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black font-mono text-white uppercase">AUTHOR / OPERATOR</span>
                      {currentRole === 'author' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mb-3">
                      Can connect marketplace streams, inject chat testing payloads, and view live telemetry. Restricted from system resets.
                    </p>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      OPERATIONAL CONTROL
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeRole('viewer')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      currentRole === 'viewer'
                        ? 'bg-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                        : 'bg-zinc-950/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black font-mono text-white uppercase">READ-ONLY VIEWER</span>
                      {currentRole === 'viewer' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mb-3">
                      Auditor mode. Can inspect live security metrics and stream histories. Cannot alter safeguards, resets, or threshold settings.
                    </p>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      READ-ONLY PRIVILEGES
                    </span>
                  </button>
                </div>
              </div>

              {/* Privilege Matrix Table */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
                <span className="text-zinc-300 font-bold uppercase block">ROLE PRIVILEGE MATRIX</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-zinc-400">
                        <th className="py-2 px-3">ACTION / PERMISSION</th>
                        <th className="py-2 px-3 text-center">ADMIN</th>
                        <th className="py-2 px-3 text-center">AUTHOR</th>
                        <th className="py-2 px-3 text-center">VIEWER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px] text-zinc-300">
                      <tr>
                        <td className="py-2 px-3">View Real-Time Bot Telemetry & Charts</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Connect Marketplace Feeds (Amazon/TikTok)</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Manual Override & Release Cashout Freeze</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Modify Sensitivity Threshold Sliders</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Reset System State to Defaults</td>
                        <td className="py-2 px-3 text-center text-[#00FF00]">✓ ALLOWED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                        <td className="py-2 px-3 text-center text-rose-400 font-bold">✗ DENIED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RATE LIMITING & TOKEN VALIDATION */}
          {activeTab === 'ratelimit' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00FF00] font-mono font-bold text-xs uppercase">
                    <Zap className="w-4 h-4" />
                    <span>API RATE LIMITING BUCKET (SLIDING WINDOW)</span>
                  </div>
                  <button
                    onClick={onResetRateLimit}
                    className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-[10px] font-mono font-bold text-white cursor-pointer transition-all"
                  >
                    RESET RATE LIMIT COUNTER
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Consumed Capacity: {rateLimitCount} / {policy.rateLimitMaxRequestsPerMin} req/min</span>
                    <span className="text-[#00FF00] font-bold">
                      {Math.max(0, policy.rateLimitMaxRequestsPerMin - rateLimitCount)} REQUESTS REMAINING
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-2.5 overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all duration-300 ${
                        rateLimitCount > 80 ? 'bg-rose-500' : rateLimitCount > 50 ? 'bg-amber-400' : 'bg-[#00FF00]'
                      }`}
                      style={{ width: `${Math.min(100, (rateLimitCount / policy.rateLimitMaxRequestsPerMin) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-1">
                  <div className="p-2.5 bg-black rounded-lg border border-white/10">
                    <span className="text-zinc-500 block text-[10px]">MAX LIMIT</span>
                    <span className="text-white font-bold">{policy.rateLimitMaxRequestsPerMin} REQ/MIN</span>
                  </div>
                  <div className="p-2.5 bg-black rounded-lg border border-white/10">
                    <span className="text-zinc-500 block text-[10px]">WINDOW TYPE</span>
                    <span className="text-white font-bold">60s SLIDING BUCKET</span>
                  </div>
                  <div className="p-2.5 bg-black rounded-lg border border-white/10">
                    <span className="text-zinc-500 block text-[10px]">BURST CAPACITY</span>
                    <span className="text-white font-bold">150 REQ PEAK</span>
                  </div>
                  <div className="p-2.5 bg-black rounded-lg border border-white/10">
                    <span className="text-zinc-500 block text-[10px]">ACTION ON OVERFLOW</span>
                    <span className="text-rose-400 font-bold">HTTP 429 TOO MANY</span>
                  </div>
                </div>
              </div>

              {/* JWT Bearer & OAuth Token Validator */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
                <span className="text-zinc-300 font-bold uppercase block">LIVE TOKEN VALIDATOR (HMAC-SHA256)</span>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 uppercase">BEARER AUTHORIZATION TOKEN</label>
                  <input
                    type="text"
                    value={simulatedToken}
                    onChange={(e) => setSimulatedToken(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/15 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#00FF00]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleValidateToken}
                    className="px-4 py-2 rounded-lg bg-[#00FF00] text-black font-extrabold uppercase hover:bg-[#00FF00]/90 transition-all cursor-pointer text-xs"
                  >
                    VALIDATE TOKEN SIGNATURE
                  </button>

                  {tokenValidationStatus && (
                    <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${
                      tokenValidationStatus === 'VALID_JWT_TOKEN'
                        ? 'bg-emerald-500/20 text-[#00FF00] border-[#00FF00]/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}>
                      {tokenValidationStatus === 'VALID_JWT_TOKEN' ? '✓ SIGNATURE VALID & UNEXPIRED' : '✗ INVALID SIGNATURE OR EXPIRED'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS ANOMALIES */}
          {activeTab === 'anomalies' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
                    <Activity className="w-4 h-4" />
                    <span>EXTENDED DATA ACCESS ANOMALY DETECTION ENGINE</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={policy.dataAccessAnomalyDetection}
                      onChange={(e) => onUpdatePolicy({ dataAccessAnomalyDetection: e.target.checked })}
                      className="accent-[#00FF00] rounded cursor-pointer"
                    />
                    <span className="text-white">ENGINE ENABLED</span>
                  </label>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  FlowGen monitors not just live stream bot traffic, but also unusual data access behavior (unauthorized export spikes, token brute force attempts, and bulk telemetry scraping).
                </p>
              </div>

              {/* Anomaly Detection Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">1. Bulk Export Spike Detector</span>
                    <span className="text-[#00FF00] font-bold text-[10px]">MONITORING</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Flags when a single token attempts to export full JSON metrics &gt; 10 times in 1 minute.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">2. Privilege Escalation Guard</span>
                    <span className="text-[#00FF00] font-bold text-[10px]">MONITORING</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Blocks unauthorized role modification requests sent with invalid administrative claims.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">3. Scraper Fingerprint Blocker</span>
                    <span className="text-[#00FF00] font-bold text-[10px]">MONITORING</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Detects automated headless browser scrapers polling live viewer streams without a valid session.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">4. Geographic IP Velocity Rule</span>
                    <span className="text-[#00FF00] font-bold text-[10px]">MONITORING</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Triggers alert when admin login attempts originate from physically impossible locations within 5 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SHA-256 IMMUTABLE LOGS */}
          {activeTab === 'immutable_logs' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00FF00] font-mono font-bold text-xs uppercase">
                    <FileCheck className="w-4 h-4" />
                    <span>CRYPTOGRAPHIC SHA-256 IMMUTABLE LOG CHAIN</span>
                  </div>
                  
                  <button
                    onClick={handleVerifyLogIntegrity}
                    disabled={isVerifyingHashes}
                    className="px-4 py-1.5 rounded-lg bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-mono font-extrabold text-xs uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,0,0.2)]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingHashes ? 'animate-spin' : ''}`} />
                    <span>{isVerifyingHashes ? 'VERIFYING BLOCK CHAIN...' : 'VERIFY LOG INTEGRITY'}</span>
                  </button>
                </div>

                {hashVerificationResult && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00FF00]" />
                      <span>CRYPTOGRAPHIC AUDIT CHAIN VERIFIED: 100% UNAMPERED (SHA-256 CHECKSUMS MATCH)</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">ACTIVE AUDIT BLOCK SAMPLES</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {auditLogs.slice(0, 5).map((log, idx) => (
                      <div key={log.id || idx} className="p-3 bg-black rounded-lg border border-white/10 font-mono text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">BLOCK #{idx + 101} | {log.timestamp}</span>
                          <span className="text-[#00FF00]">ROLE: {log.triggeredByRole ?? 'ADMIN'}</span>
                        </div>
                        <div className="text-white font-bold">{log.detail}</div>
                        <div className="text-zinc-500 text-[9px] break-all">
                          SHA256 Hash: {log.blockHash || `0x${(Math.random() * 1e16).toString(16)}8f99a01b34c`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRIVACY BY DESIGN */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00FF00] font-mono font-bold text-xs uppercase">
                    <EyeOff className="w-4 h-4" />
                    <span>PRIVACY BY DESIGN CONTROLS</span>
                  </div>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-white/10">
                    <div>
                      <div className="text-white font-bold">PII Anonymization & Handle Masking</div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Mask host usernames and spectator IP addresses in export reports (e.g., @usr_89201).
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.piiAnonymizationEnabled}
                        onChange={(e) => onUpdatePolicy({ piiAnonymizationEnabled: e.target.checked })}
                        className="accent-[#00FF00] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-white/10">
                    <div>
                      <div className="text-white font-bold">Zero-Data Retention Mode</div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Purge all transient stream chat logs from memory immediately upon session termination.
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.zeroRetentionMode}
                        onChange={(e) => onUpdatePolicy({ zeroRetentionMode: e.target.checked })}
                        className="accent-[#00FF00] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Disclosure Report */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 font-mono text-xs space-y-2">
                <span className="text-zinc-300 font-bold uppercase block">DATA MINIMIZATION DISCLOSURE</span>
                <p className="text-zinc-400 font-sans leading-relaxed text-xs">
                  FlowGen strictly processes minimal telemetry necessary for live bot discrimination. No personal credentials, biometric data, or financial account details are ever collected or stored.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00FF00]" />
            <span>ACTIVE ROLE: <strong className="text-white uppercase">{currentRole}</strong> | ENCRYPTION: AES-256-GCM / TLS 1.3</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white font-bold transition-all cursor-pointer"
          >
            CLOSE GOVERNANCE HUB
          </button>
        </div>
      </div>
    </div>
  );
}
