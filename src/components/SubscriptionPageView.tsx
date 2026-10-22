import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Zap,
  Award,
  BookOpen,
  Presentation,
  FileSpreadsheet,
  Check,
  Receipt,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  AI_SUBSCRIPTION_PLANS,
  getAiCreditSubscriptionStatus,
  AiCreditSubscriptionData,
  getAiPaymentHistory,
  AiBillingRecord
} from '../utils/subscription';

interface SubscriptionPageViewProps {
  currentUser?: UserProfile | null;
  onOpenSubscriptionModal: (initialTab?: 'AI_SERVICES' | 'BILLING_HISTORY' | 'USAGE_LOGS') => void;
  onBackToDashboard: () => void;
}

export const SubscriptionPageView: React.FC<SubscriptionPageViewProps> = ({
  currentUser: _currentUser,
  onOpenSubscriptionModal,
  onBackToDashboard
}) => {
  const [subData, setSubData] = useState<AiCreditSubscriptionData>(getAiCreditSubscriptionStatus());
  const [invoices, setInvoices] = useState<AiBillingRecord[]>(getAiPaymentHistory());

  useEffect(() => {
    setSubData(getAiCreditSubscriptionStatus());
    setInvoices(getAiPaymentHistory());
  }, []);

  const usedPercentage = Math.min(100, Math.round((subData.creditsUsed / Math.max(1, subData.totalCredits)) * 100));
  const now = new Date();
  const expiryDate = new Date(subData.billingPeriodEnd);
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100 font-sans">
      
      {/* PAGE HEADER */}
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
              <Award className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  OFFICIAL SUBSCRIPTION & BILLING
                </span>
                <span className="text-emerald-400 text-xs font-bold">24/7 Mobile Money (MTN & Airtel) Activation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Subscription Status, Credits & Billing Management
              </h2>
            </div>
          </div>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        {/* ACTIVE STATUS CARD */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Active Plan:</span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                subData.status === 'ACTIVE' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {subData.status}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-emerald-400">
              {subData.planName}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Available Credits:</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {subData.creditsRemaining} Credits
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Billing Cycle Expiry:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {new Date(subData.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ({daysLeft} days)
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Next Renewal Date:</span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {new Date(subData.nextRenewalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">Credit Consumption</span>
                <span className="text-amber-300">{subData.creditsUsed} / {subData.totalCredits} Used ({usedPercentage}%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    usedPercentage >= 100 
                      ? 'bg-rose-500' 
                      : usedPercentage >= 80 
                        ? 'bg-amber-400' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 justify-center">
            <button
              onClick={() => onOpenSubscriptionModal('AI_SERVICES')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-emerald-950/60 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Upgrade Plan / Buy Credits</span>
            </button>

            <button
              onClick={() => onOpenSubscriptionModal('BILLING_HISTORY')}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>View Billing & Invoices ({invoices.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 AI SERVICES EXPLAINED */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Included AI Services & Credit Rules
        </h3>
        <p className="text-xs text-slate-400">
          Every teacher receives <strong>2 free credits per month</strong>. Exactly <strong>1 credit</strong> is consumed only after successful content generation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">1. Homework, Classwork & Quiz</h4>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">1 Credit per Generation</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generates rigorous, curriculum-aligned assessments, multiple choice, open-ended exercises, rubrics, and answer keys.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">2. AI Presentation Slides</h4>
              <p className="text-xs text-amber-400 font-bold mt-0.5">1 Credit per Slide Deck</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Produces visually structured classroom presentation slides with pedagogical talking points, summaries, and downloadable formats.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-teal-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">3. Printable Worksheet</h4>
              <p className="text-xs text-teal-400 font-bold mt-0.5">1 Credit per Worksheet</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Creates print-ready student practice sheets, fill-in-the-blanks, matching questions, and full teacher answer solutions.
            </p>
          </div>
        </div>
      </div>

      {/* MONTHLY SUBSCRIPTION PLANS SHOWCASE */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Monthly Subscription Plans (Rwandan Francs)
            </h3>
            <p className="text-xs text-slate-400">
              Upgrade instantly via MTN MoMo or Airtel Money to replenish credits for 30 days.
            </p>
          </div>
          <span className="text-xs bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1 rounded-full">
            Standard Plan is Most Popular
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AI_SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = subData.planId === plan.id;
            return (
              <div 
                key={plan.id}
                className={`relative p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                  isCurrent
                    ? 'bg-slate-900 border-2 border-emerald-400 shadow-xl shadow-emerald-950/40'
                    : plan.isPopular 
                      ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-amber-400 shadow-2xl shadow-amber-950/50 scale-[1.02]' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 right-4 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow ${
                    plan.isPopular 
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <h4 className="text-base font-black text-white">{plan.name}</h4>
                  <div>
                    <div className="text-2xl font-black text-emerald-400">{plan.formattedPrice}</div>
                    <span className="text-xs text-slate-400 font-bold">{plan.credits} Credits / Month</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{plan.description}</p>
                  
                  <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenSubscriptionModal('AI_SERVICES')}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    plan.isPopular 
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:scale-105 shadow' 
                      : plan.priceRwf === 0
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{plan.priceRwf > 0 ? `Select ${plan.name}` : 'Free Tier'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
