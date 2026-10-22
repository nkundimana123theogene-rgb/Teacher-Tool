import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Lock, 
  Unlock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  DollarSign, 
  QrCode, 
  X
} from 'lucide-react';
import { CertificateRecord } from '../types';
import { 
  subscribeToCertificatesRegistry, 
  fetchCertificatesRegistry, 
  toggleCertificateLockStatus, 
  deleteCertificateFromRegistry
} from '../utils/firebase';

interface AdminCertificateManagementViewProps {
  adminEmail: string;
}

export const AdminCertificateManagementView: React.FC<AdminCertificateManagementViewProps> = ({
  adminEmail
}) => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Manual Quick Unlock/Lock Form State
  const [manualVerificationNo, setManualVerificationNo] = useState<string>('');
  const [manualRecipientName, setManualRecipientName] = useState<string>('');
  const [manualSchool, setManualSchool] = useState<string>('');
  const [isProcessingManual, setIsProcessingManual] = useState<boolean>(false);

  // Subscribe to real-time updates from Firestore qr_scans & registry
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToCertificatesRegistry((certs) => {
      setCertificates(certs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setActionErrorMsg(null);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setActionErrorMsg(msg);
    setActionSuccessMsg(null);
    setTimeout(() => setActionErrorMsg(null), 4000);
  };

  // Toggle Lock/Unlock for a certificate
  const handleToggleLock = async (cert: CertificateRecord) => {
    const newUnlockedState = !cert.isUnlocked;
    setTogglingId(cert.verificationNo);
    try {
      await toggleCertificateLockStatus(
        cert.verificationNo,
        newUnlockedState,
        adminEmail || 'nkundimana123theogene@gmail.com',
        cert
      );
      
      // Update local state immediately for responsive feedback
      setCertificates(prev => prev.map(c => {
        if (c.verificationNo === cert.verificationNo) {
          return {
            ...c,
            isUnlocked: newUnlockedState,
            paymentStatus: newUnlockedState ? 'Unlocked' : 'Locked',
            unlockedBy: newUnlockedState ? (adminEmail || 'nkundimana123theogene@gmail.com') : '',
            unlockedAt: newUnlockedState ? new Date().toISOString() : ''
          };
        }
        return c;
      }));

      showSuccess(
        newUnlockedState 
          ? `Certificate ${cert.verificationNo} for ${cert.recipientName} has been UNLOCKED. The teacher can now download and print it!`
          : `Certificate ${cert.verificationNo} has been LOCKED. User will be prompted to complete payment.`
      );
    } catch (err) {
      console.error("Error toggling certificate lock status:", err);
      showError("Failed to update certificate lock status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Manual Quick Unlock / Lock by ID
  const handleManualAction = async (targetUnlockState: boolean) => {
    if (!manualVerificationNo.trim()) {
      showError("Please enter a valid Verification Number (e.g. SC-2026-8947 or NK-SC-2026-0812)");
      return;
    }

    const cleanNo = manualVerificationNo.trim();
    setIsProcessingManual(true);

    try {
      await toggleCertificateLockStatus(
        cleanNo,
        targetUnlockState,
        adminEmail || 'nkundimana123theogene@gmail.com',
        {
          verificationNo: cleanNo,
          recipientName: manualRecipientName.trim() || 'Verified Teacher',
          schoolName: manualSchool.trim() || 'Rwandan School',
          title: 'Special Coach Certificate'
        }
      );

      // Refresh list
      const updated = await fetchCertificatesRegistry();
      setCertificates(updated);

      showSuccess(
        targetUnlockState
          ? `Certificate ${cleanNo} successfully UNLOCKED and verified!`
          : `Certificate ${cleanNo} successfully LOCKED.`
      );

      setManualVerificationNo('');
      setManualRecipientName('');
      setManualSchool('');
    } catch (err) {
      console.error("Manual action error:", err);
      showError("Failed to process manual certificate override.");
    } finally {
      setIsProcessingManual(false);
    }
  };

  // Delete certificate from registry
  const handleDelete = async (verificationNo: string, recipientName: string) => {
    if (!window.confirm(`Are you sure you want to remove certificate ${verificationNo} (${recipientName}) from the registry?`)) {
      return;
    }

    try {
      await deleteCertificateFromRegistry(verificationNo);
      setCertificates(prev => prev.filter(c => c.verificationNo !== verificationNo));
      showSuccess(`Certificate ${verificationNo} removed from registry.`);
    } catch (err) {
      console.error("Delete cert error:", err);
      showError("Failed to delete certificate.");
    }
  };

  // Metrics Calculation
  const totalCertificates = certificates.length;
  const unlockedCertificates = certificates.filter(c => c.isUnlocked).length;
  const pendingCertificates = certificates.filter(c => !c.isUnlocked && c.paymentStatus === 'Pending').length;
  const lockedCertificates = certificates.filter(c => !c.isUnlocked && c.paymentStatus !== 'Pending').length;
  const totalEstimatedRevenue = unlockedCertificates * 2000;

  // Filtered List
  const filteredCertificates = certificates.filter(c => {
    const matchesSearch = 
      (c.verificationNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.recipientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.schoolName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'unlocked') return c.isUnlocked;
    if (filterStatus === 'locked') return !c.isUnlocked && c.paymentStatus !== 'Pending';
    if (filterStatus === 'pending') return !c.isUnlocked && c.paymentStatus === 'Pending';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-white">
      
      {/* NOTIFICATIONS */}
      {actionSuccessMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-2xl text-emerald-300 font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-pulse">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-2xl text-rose-300 font-bold text-xs flex items-center justify-between shadow-lg shadow-rose-950/40">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* CARD 1: TOTAL */}
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            filterStatus === 'all' 
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl' 
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-black tracking-wider">Total Certificates</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCertificates}</div>
          <p className="text-[10px] text-slate-400">All registered awards</p>
        </div>

        {/* CARD 2: UNLOCKED (PAID / VERIFIED) */}
        <div 
          onClick={() => setFilterStatus('unlocked')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            filterStatus === 'unlocked' 
              ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl' 
              : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-black tracking-wider text-emerald-400 font-bold">Unlocked (Paid)</span>
            <Unlock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{unlockedCertificates}</div>
          <p className="text-[10px] text-emerald-400/80 font-bold">Active Download & Print</p>
        </div>

        {/* CARD 3: PENDING APPROVAL */}
        <div 
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            filterStatus === 'pending' 
              ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/50 shadow-xl' 
              : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-black tracking-wider text-amber-400 font-bold">Pending Requests</span>
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin-slow" />
          </div>
          <div className="text-2xl font-black text-amber-300">{pendingCertificates}</div>
          <p className="text-[10px] text-amber-400/80 font-bold">Requires Admin Review</p>
        </div>

        {/* CARD 4: LOCKED (NO PAYMENT SUBMITTED) */}
        <div 
          onClick={() => setFilterStatus('locked')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            filterStatus === 'locked' 
              ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/50 shadow-xl' 
              : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-black tracking-wider text-rose-400 font-bold">Locked</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300">{lockedCertificates}</div>
          <p className="text-[10px] text-rose-400/80 font-bold">No payment proof yet</p>
        </div>

        {/* CARD 5: ESTIMATED REVENUE */}
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-black tracking-wider text-amber-300">Revenue (2k RWF)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{totalEstimatedRevenue.toLocaleString()} <span className="text-xs font-normal">RWF</span></div>
          <p className="text-[10px] text-slate-400">{unlockedCertificates} verified payments</p>
        </div>
      </div>

      {/* QUICK MANUAL OVERRIDE & UNLOCK TOOL */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wide">
                Quick Certificate Verification & Lock Override
              </h4>
              <p className="text-xs text-slate-400">
                Manually verify payment or toggle download access for any specific teacher certificate
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Admin: {adminEmail}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Verification Number / Certificate ID *
            </label>
            <input 
              type="text"
              placeholder="e.g. SC-2026-8947 or NK-SC-2026-0812"
              value={manualVerificationNo}
              onChange={(e) => setManualVerificationNo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Recipient Teacher Name (Optional)
            </label>
            <input 
              type="text"
              placeholder="e.g. Phyllis Schwaiger"
              value={manualRecipientName}
              onChange={(e) => setManualRecipientName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              School / Institution (Optional)
            </label>
            <input 
              type="text"
              placeholder="e.g. GS Mayange B"
              value={manualSchool}
              onChange={(e) => setManualSchool(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
          <button
            onClick={() => handleManualAction(false)}
            disabled={isProcessingManual || !manualVerificationNo.trim()}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-xl border border-rose-500/30 text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Set as LOCKED (Payment Required)</span>
          </button>
          
          <button
            onClick={() => handleManualAction(true)}
            disabled={isProcessingManual || !manualVerificationNo.trim()}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
          >
            {isProcessingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>UNLOCKED (Verify & Enable Download/Print)</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            id="admin-cert-search-input"
            placeholder="Search by recipient name, certificate ID, verification no, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/90 hover:border-emerald-500/60 rounded-xl pl-10 pr-20 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
          />
          {searchQuery && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[10px] bg-slate-800 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-slate-700">
                {filteredCertificates.length} found
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCertificates})
          </button>
          <button
            onClick={() => setFilterStatus('unlocked')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'unlocked'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Unlocked ({unlockedCertificates})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Pending ({pendingCertificates})
          </button>
          <button
            onClick={() => setFilterStatus('locked')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'locked'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Locked ({lockedCertificates})
          </button>
        </div>
      </div>

      {/* CERTIFICATES REGISTRY TABLE */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                <th className="p-3.5">Verification ID & QR</th>
                <th className="p-3.5">Recipient & Award Details</th>
                <th className="p-3.5">School / Center</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5 text-center">Payment Status</th>
                <th className="p-3.5 text-center">Admin Lock/Unlock Action</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span>Loading certificate registry from cloud Firestore...</span>
                  </td>
                </tr>
              ) : filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => {
                  const isUnlocked = !!cert.isUnlocked;
                  const isCurrentlyToggling = togglingId === cert.verificationNo;

                  return (
                    <tr 
                      key={cert.verificationNo || cert.id}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      {/* VERIFICATION ID & BADGE */}
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-white rounded border border-slate-300">
                            <QrCode className="w-4 h-4 text-slate-900" />
                          </div>
                          <div>
                            <span className="font-bold text-amber-300 block">{cert.verificationNo}</span>
                            <span className="text-[9px] text-slate-500 uppercase">{cert.status}</span>
                          </div>
                        </div>
                      </td>

                      {/* RECIPIENT & TITLE */}
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{cert.recipientName}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{cert.title || 'Special Coach Certificate'}</div>
                      </td>

                      {/* SCHOOL */}
                      <td className="p-3.5 text-slate-300">
                        {cert.schoolName || 'GS Mayange B'}
                      </td>

                      {/* ISSUE DATE */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {cert.issueDate || 'August 28, 2026'}
                      </td>

                      {/* PAYMENT & LOCK STATUS BADGE */}
                      <td className="p-3.5 text-center">
                        {isUnlocked ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <Unlock className="w-3 h-3 text-emerald-400" />
                              <span>UNLOCKED (PAID)</span>
                            </span>
                            <span className="text-[8px] text-slate-500">
                              {cert.unlockedBy ? `By ${cert.unlockedBy.split('@')[0]}` : 'Payment Verified'}
                            </span>
                          </div>
                        ) : cert.paymentStatus === 'Pending' ? (
                          <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-900 border border-amber-500/30 rounded-xl text-left max-w-[200px] mx-auto shadow-lg">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
                              <span>PENDING APPROVAL</span>
                            </span>
                            <div className="text-[9px] text-slate-300 space-y-0.5 font-sans leading-tight border-t border-slate-800/80 pt-1 w-full">
                              <div>MoMo: <span className="font-mono text-white font-bold">{cert.momoNumber || 'N/A'}</span></div>
                              <div className="truncate" title={cert.momoTxId}>Ref: <span className="font-mono text-amber-300 font-bold">{cert.momoTxId || 'N/A'}</span></div>
                              <div className="truncate" title={cert.momoSenderName}>Name: <span className="text-white font-medium">{cert.momoSenderName || 'N/A'}</span></div>
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <Lock className="w-3 h-3 text-rose-400" />
                              <span>LOCKED</span>
                            </span>
                            <span className="text-[8px] text-rose-400/80 font-bold">
                              2,000 RWF required
                            </span>
                          </div>
                        )}
                      </td>

                      {/* TOGGLE SWITCH / BUTTON */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleLock(cert)}
                          disabled={isCurrentlyToggling}
                          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-md ${
                            isUnlocked
                              ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40'
                              : cert.paymentStatus === 'Pending'
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 shadow-amber-950/40 animate-pulse'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 shadow-emerald-950/40'
                          }`}
                          title={isUnlocked ? "Click to Lock this Certificate" : cert.paymentStatus === 'Pending' ? "Approve MoMo Payment & Unlock" : "Click to Unlock and Verify Payment"}
                        >
                          {isCurrentlyToggling ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isUnlocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Lock Certificate</span>
                            </>
                          ) : cert.paymentStatus === 'Pending' ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Approve & Unlock</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Unlock & Verify</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={`https://teacherlessonplans.ai.studio/verify?id=${encodeURIComponent(cert.verificationNo)}&ercipient=${encodeURIComponent(cert.recipientName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Open Public QR Verification Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          
                          <button
                            onClick={() => handleDelete(cert.verificationNo, cert.recipientName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete certificate record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 space-y-3">
                    <div className="p-3 bg-slate-900 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border border-slate-800 text-slate-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">No matching certificates found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchQuery ? `No certificates match the keyword "${searchQuery}".` : "No certificates registered in this category."}
                      </p>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear Search</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
