import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Receipt,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  Printer,
  ChevronRight,
  Zap,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { AiBillingRecord, UserProfile } from '../types';
import { loadPaymentHistoryFromFirestore } from '../utils/firebase';

export interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  currentUser?: UserProfile | null;
  onOpenSubscription?: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  userPhone = '',
  userName = '',
  currentUser,
  onOpenSubscription
}) => {
  const [transactions, setTransactions] = useState<AiBillingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'mtn' | 'airtel'>('all');

  // Selected Transaction for Detailed Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<AiBillingRecord | null>(null);
  const [copiedTxRef, setCopiedTxRef] = useState<string | null>(null);
  const [copiedReceiptText, setCopiedReceiptText] = useState<boolean>(false);

  const effectiveEmail = (userEmail || currentUser?.email || '').toLowerCase().trim();
  const effectivePhone = (userPhone || currentUser?.phone || currentUser?.momoNumber || '').trim();
  const effectiveName = userName || currentUser?.name || 'Teacher';

  // Fetch transactions from server and Firestore database
  const fetchTransactions = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const recordsMap = new Map<string, AiBillingRecord>();

      // 1. Fetch from server persistent database API
      try {
        const queryParams = new URLSearchParams();
        if (effectiveEmail) queryParams.set('email', effectiveEmail);
        if (effectivePhone) queryParams.set('phone', effectivePhone);

        const res = await fetch(`/api/payments/history?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.payments)) {
            json.payments.forEach((p: any) => {
              const record: AiBillingRecord = {
                id: p.id || `tx_${p.transactionRef || Math.random()}`,
                transactionRef: p.transactionRef || p.txRef || p.id,
                date: p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : 'Today'),
                planId: p.planId || 'plan_default',
                planName: p.planName || 'CBC Lesson Plans Package',
                amountRwf: Number(p.amountRwf || p.amount) || 0,
                credits: Number(p.credits || p.plansGranted || p.plansPurchased) || 0,
                paymentMethod: p.paymentMethod || 'MTN Mobile Money',
                phoneNumber: p.phoneNumber || p.phone || effectivePhone || '0786332660',
                status: p.status || 'Paid',
                createdAt: p.createdAt || new Date().toISOString(),
                userEmail: p.userEmail || p.teacherEmail || effectiveEmail,
                userName: p.userName || p.teacherName || effectiveName,
                expiresAt: p.expiresAt
              };
              recordsMap.set(record.transactionRef || record.id, record);
            });
          }
        }
      } catch (apiErr) {
        console.warn('Server payments history fetch warning:', apiErr);
      }

      // 2. Fetch from Firestore / Local Payment History via firebase.ts
      try {
        const firestoreRecords = await loadPaymentHistoryFromFirestore(effectiveEmail);
        if (Array.isArray(firestoreRecords)) {
          firestoreRecords.forEach(r => {
            const key = r.transactionRef || r.id;
            if (key && !recordsMap.has(key)) {
              recordsMap.set(key, r);
            }
          });
        }
      } catch (fsErr) {
        console.warn('Firestore payment history warning:', fsErr);
      }

      // 3. Convert to sorted array (latest first)
      const sorted = Array.from(recordsMap.values()).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setTransactions(sorted);
    } catch (err: any) {
      console.error('Failed to load transaction history:', err);
      setError('Unable to retrieve payment records from the database. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, effectiveEmail, effectivePhone]);

  // Copy transaction reference helper
  const handleCopyTxRef = (txRef: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(txRef);
    setCopiedTxRef(txRef);
    setTimeout(() => setCopiedTxRef(null), 2000);
  };

  // Copy full receipt text
  const handleCopyReceiptText = (receipt: AiBillingRecord) => {
    const text = `================================================
NKORERA EDUCATION - OFFICIAL PAYMENT RECEIPT
================================================
Transaction Ref (TxRef): ${receipt.transactionRef}
Date & Time: ${formatDateTime(receipt.createdAt || receipt.date)}
Status: ${receipt.status.toUpperCase()}
User / Teacher: ${receipt.userName || effectiveName}
Phone Number: ${receipt.phoneNumber || effectivePhone}
Payment Channel: ${receipt.paymentMethod}
Subscription Plan: ${receipt.planName}
Quota Unlocked: ${receipt.credits || 0} Lesson Plans
Amount Paid: ${(receipt.amountRwf || receipt.amount || 0).toLocaleString()} RWF
Receiver: NKUNDIMANA THEOGENE (0781339530 / 0724038043)
================================================
Thank you for using Nkorera Education Platform!
================================================`;
    navigator.clipboard.writeText(text);
    setCopiedReceiptText(true);
    setTimeout(() => setCopiedReceiptText(false), 2500);
  };

  // Helper date formatting
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search filter
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = !search ||
        (t.transactionRef && t.transactionRef.toLowerCase().includes(search)) ||
        (t.phoneNumber && t.phoneNumber.includes(search)) ||
        (t.planName && t.planName.toLowerCase().includes(search)) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(search)) ||
        (t.amountRwf && t.amountRwf.toString().includes(search));

      // Status filter
      const statusLower = String(t.status || '').toLowerCase();
      let matchStatus = true;
      if (statusFilter === 'paid') {
        matchStatus = ['paid', 'completed', 'active', 'successful'].includes(statusLower);
      } else if (statusFilter === 'pending') {
        matchStatus = ['pending', 'transacting', 'processing'].includes(statusLower);
      }

      // Network filter
      let matchNetwork = true;
      const methodLower = String(t.paymentMethod || '').toLowerCase();
      if (networkFilter === 'mtn') {
        matchNetwork = methodLower.includes('mtn');
      } else if (networkFilter === 'airtel') {
        matchNetwork = methodLower.includes('airtel');
      }

      return matchSearch && matchStatus && matchNetwork;
    });
  }, [transactions, searchTerm, statusFilter, networkFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalSpent = 0;
    let totalPlans = 0;
    let successfulCount = 0;

    transactions.forEach(t => {
      const isSuccess = ['paid', 'completed', 'active', 'successful'].includes(String(t.status || '').toLowerCase());
      if (isSuccess) {
        totalSpent += Number(t.amountRwf || t.amount) || 0;
        totalPlans += Number(t.credits || t.plansGranted || t.plansPurchased) || 0;
        successfulCount++;
      }
    });

    return {
      totalSpent,
      totalPlans,
      successfulCount,
      totalTransactions: transactions.length,
      latestTx: transactions[0] || null
    };
  }, [transactions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-slate-900 border-2 border-emerald-500/40 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Amateka y'Ubwishyu bwa MoMo
                </h3>
                <span className="text-[10px] font-mono font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  Database Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Urutonde rw'ubwishyu bwa MTN Mobile Money & Airtel Money n'inyemezabwishyu zawe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTransactions(true)}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border border-slate-700"
              title="Vugurura (Refresh transactions from database)"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Vugurura</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* USER PROFILE INFO BANNER */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400 font-medium">Teacher:</span>
              <strong className="text-white font-bold">{effectiveName}</strong>
            </div>
            {effectivePhone && (
              <div className="flex items-center gap-1 text-emerald-400 font-mono">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{effectivePhone}</span>
              </div>
            )}
            {effectiveEmail && (
              <span className="hidden md:inline text-slate-400 font-mono">
                ({effectiveEmail})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.isPaid || currentUser?.verifiedPayment ? (
              <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>PREMIUM ACCOUNT</span>
              </span>
            ) : null}
            <span className="text-[10px] text-slate-400">
              Plans zisigaye: <strong className="text-amber-300">{currentUser?.remainingPlans || 0}</strong>
            </span>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="p-4 sm:p-5 pb-2 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Total Spent */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3 text-left space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[10.5px] font-bold">
                <span>Amafaranga Yose</span>
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-emerald-400 font-black text-base sm:text-lg tracking-tight font-mono">
                {stats.totalSpent.toLocaleString()} <span className="text-xs font-bold text-emerald-300">RWF</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Yishyuwe kuri MoMo
              </div>
            </div>

            {/* 2. Total Transactions */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-left space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[10.5px] font-bold">
                <span>Inshuro Wishyuye</span>
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-white font-black text-base sm:text-lg tracking-tight font-mono">
                {stats.successfulCount} <span className="text-xs font-bold text-slate-400">/ {stats.totalTransactions}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Transactions zemerewe
              </div>
            </div>

            {/* 3. Total Plans Granted */}
            <div className="bg-slate-950/90 border border-teal-500/30 rounded-2xl p-3 text-left space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[10.5px] font-bold">
                <span>Plans Zose Wahawe</span>
                <Layers className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-teal-300 font-black text-base sm:text-lg tracking-tight font-mono">
                {stats.totalPlans} <span className="text-xs font-bold text-teal-400">Plans</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Lesson plans zose waguze
              </div>
            </div>

            {/* 4. Latest Payment */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-left space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-[10.5px] font-bold">
                <span>Ubwishyu bwa Hafi</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-amber-300 font-black text-xs sm:text-sm truncate">
                {stats.latestTx ? `${(stats.latestTx.amountRwf || stats.latestTx.amount || 0).toLocaleString()} RWF` : 'Nta bwari bwakorwa'}
              </div>
              <div className="text-[9.5px] text-slate-400 truncate font-mono">
                {stats.latestTx ? formatDateTime(stats.latestTx.createdAt || stats.latestTx.date) : 'Free Tier'}
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="px-4 sm:px-5 py-2 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search TxRef, phone, plan, amount..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'paid' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paid ({stats.successfulCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending
              </button>
            </div>

            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setNetworkFilter('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  networkFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All SIMs
              </button>
              <button
                type="button"
                onClick={() => setNetworkFilter('mtn')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  networkFilter === 'mtn' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                MTN MoMo
              </button>
              <button
                type="button"
                onClick={() => setNetworkFilter('airtel')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  networkFilter === 'airtel' ? 'bg-rose-500 text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Airtel Money
              </button>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS LIST CONTAINER */}
        <div className="p-4 sm:p-5 pt-1 overflow-y-auto flex-1 space-y-2.5 custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-center justify-between text-xs text-rose-300">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => fetchTransactions(true)}
                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 rounded-lg text-[10px] font-bold"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-bold">
                Loading payment history from database...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-950/60 border border-slate-800 rounded-3xl space-y-3 my-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Receipt className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">No payments found for this account</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {searchTerm 
                    ? `No transactions match your search "${searchTerm}". Try clearing the search query.`
                    : `No Mobile Money payments have been recorded for this account yet. You can upgrade anytime with MTN or Airtel Money.`}
                </p>
              </div>

              {onOpenSubscription && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSubscription();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Make Your First Payment (Buy Plans) &rarr;</span>
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isPaid = ['paid', 'completed', 'active', 'successful'].includes(String(tx.status || '').toLowerCase());
              const isPending = ['pending', 'transacting', 'processing'].includes(String(tx.status || '').toLowerCase());
              const isAirtel = String(tx.paymentMethod || '').toLowerCase().includes('airtel') || String(tx.phoneNumber || '').startsWith('072') || String(tx.phoneNumber || '').startsWith('073');

              return (
                <div
                  key={tx.id || tx.transactionRef}
                  onClick={() => setSelectedReceipt(tx)}
                  className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left relative overflow-hidden"
                >
                  {/* Left Accent Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPaid ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'}`} />

                  {/* Transaction Details */}
                  <div className="flex items-start gap-3 pl-1 sm:pl-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 ${
                      isAirtel 
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    }`}>
                      <Smartphone className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                          {tx.planName || 'CBC Lesson Plans Package'}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isPaid 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                            : isPending 
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : isPending ? <Clock className="w-3 h-3 text-amber-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          <span>{tx.status || 'Paid'}</span>
                        </span>

                        {/* Network Badge */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          isAirtel ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isAirtel ? 'Airtel Money' : 'MTN MoMo'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDateTime(tx.createdAt || tx.date)}</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-slate-500" />
                          <span className="font-mono text-slate-300">{tx.phoneNumber || effectivePhone || 'N/A'}</span>
                        </span>

                        {tx.transactionRef && (
                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-400">Ref:</span>
                            <span className="text-[10px] font-mono font-bold text-amber-300">{tx.transactionRef}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyTxRef(tx.transactionRef, e)}
                              className="text-slate-400 hover:text-white ml-0.5"
                              title="Kopiya Ref"
                            >
                              {copiedTxRef === tx.transactionRef ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-1 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                        {(tx.amountRwf || tx.amount || 0).toLocaleString()} <span className="text-[10px] font-bold text-emerald-300">RWF</span>
                      </div>
                      <div className="text-[10px] font-bold text-teal-300">
                        +{tx.credits || tx.plansGranted || 30} Plans zahawe
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceipt(tx);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Inyemezabwishyu</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Need payment assistance? Call: <strong className="text-amber-300 font-mono">0781339530</strong> (Theogene)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenSubscription && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSubscription();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>Make New Payment (Upgrade) &rarr;</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED RECEIPT MODAL (POP-UP) */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in"
          onClick={() => setSelectedReceipt(null)}
        >
          <div 
            className="bg-white text-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Zig-zag pattern simulation */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wide uppercase text-slate-900">
                    Nkorera Education
                  </h4>
                  <p className="text-[10px] text-slate-500">Official Mobile Money Receipt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-black p-1"
              >
                &times;
              </button>
            </div>

            {/* RECEIPT STATUS & AMOUNT */}
            <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>PAYMENT {selectedReceipt.status.toUpperCase()}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {(selectedReceipt.amountRwf || selectedReceipt.amount || 0).toLocaleString()} <span className="text-xs font-bold text-slate-600">RWF</span>
              </div>
              <div className="text-[11px] font-bold text-slate-600">
                {selectedReceipt.planName}
              </div>
            </div>

            {/* RECEIPT LINE ITEMS */}
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.transactionRef}</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">Date & Time:</span>
                <span className="font-mono font-medium text-slate-800">{formatDateTime(selectedReceipt.createdAt || selectedReceipt.date)}</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">User / Teacher:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.userName || effectiveName}</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">Mobile Money Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.phoneNumber || effectivePhone}</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">Payment Channel:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">Plans Allocated:</span>
                <span className="font-black text-emerald-700">+{selectedReceipt.credits || 30} Lesson Plans</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">Recipient:</span>
                <span className="font-bold text-slate-800">NKUNDIMANA THEOGENE</span>
              </div>

              <div className="flex justify-between pt-1.5">
                <span className="text-slate-500 font-medium">Recipient Account:</span>
                <span className="font-mono text-slate-800">0781339530 / 0724038043</span>
              </div>
            </div>

            {/* RECEIPT ACTIONS */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyReceiptText(selectedReceipt)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {copiedReceiptText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceiptText ? 'Copied!' : 'Copy Receipt Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-300"
                title="Print Receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
