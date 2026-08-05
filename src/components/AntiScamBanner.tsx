import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Search, ExternalLink, X, ShieldAlert } from 'lucide-react';

interface AntiScamBannerProps {
  onOpenVerifyModal?: () => void;
  compact?: boolean;
}

export function AntiScamBanner({ onOpenVerifyModal, compact = false }: AntiScamBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    searched: boolean;
    isOfficial: boolean;
    message: string;
  } | null>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toLowerCase();
    const isOfficial = 
      q.includes('0781339530') || 
      q.includes('nkundimana') || 
      q.includes('182*1*1*0781339530') || 
      q.includes('teacherlessonplans') ||
      q.includes('nkundimana123theogene@gmail.com');

    setVerificationResult({
      searched: true,
      isOfficial,
      message: isOfficial 
        ? '✅ OFFICIAL VERIFIED CHANNEL: This is the genuine Teacher Tool / Nkorera Education account.'
        : '⚠️ UNVERIFIED / FAKE ALERT: This number or code is NOT an official Teacher Tool channel. Do NOT send money to unverified accounts!'
    });
  };

  if (compact) {
    return (
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Anti-Scam Warning:</strong> Official MoMo Code is <strong>*182*1*1*0781339530# (NKUNDIMANA Theogene)</strong>. Never pay to unverified numbers.
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold shrink-0 transition-colors"
        >
          Verify Code 🔍
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-black text-[10px] rounded-full border border-amber-500/40 uppercase tracking-wider">
                  🛡️ System Anti-Scam Protection
                </span>
                <span className="text-xs text-slate-400 font-bold">• Official Channel Verification</span>
              </div>
              <h3 className="text-sm font-black text-white">
                Protect Yourself Against Scammers & Fake Agents
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Always ensure you pay ONLY via Mobile Money Code <strong className="text-amber-300 font-mono text-xs">*182*1*1*0781339530#</strong> (Account Holder: <strong className="text-white">NKUNDIMANA Theogene</strong>). Our system automatically blocks duplicate and fake transaction codes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Verify Official Channel 🔍</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Channel Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setShowModal(false);
                setVerificationResult(null);
                setQuery('');
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Official Channel Verifier</h3>
                <p className="text-xs text-slate-400">Check if a MoMo Code, phone number or name is official</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Enter MoMo Code, Phone Number or Name to Verify:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 0781339530, *182*1*1*0781339530#, Theogene"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </form>

            {verificationResult && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  verificationResult.isOfficial
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm">
                  {verificationResult.isOfficial ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{verificationResult.isOfficial ? 'VERIFIED OFFICIAL' : 'UNVERIFIED / POTENTIAL SCAM'}</span>
                </div>
                <p className="font-medium">{verificationResult.message}</p>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                Official Authentic Details
              </span>
              <div className="text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">MoMo Pay Code:</span>
                  <span className="font-mono font-bold text-amber-300">*182*1*1*0781339530#</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="font-bold text-white">NKUNDIMANA Theogene</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Support WhatsApp:</span>
                  <span className="font-mono font-bold text-emerald-400">0781339530</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Official Website:</span>
                  <span className="font-mono font-bold text-blue-400">teacherlessonplans.ai.studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
