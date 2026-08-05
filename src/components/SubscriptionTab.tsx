import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  Send,
  User,
  X
} from 'lucide-react';
import { SubscriptionPlan, UserProfile } from '../types';
import { SUBSCRIPTION_PLANS, OWNER_INFO } from '../data/plans';
import { AntiScamBanner } from './AntiScamBanner';

interface SubscriptionTabProps {
  user: UserProfile | null;
  onOpenSignIn: () => void;
  onSubmitPayment: (paymentData: {
    planId: string;
    momoTxRef: string;
    momoNumber: string;
    userPhone: string;
  }) => Promise<void>;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  user,
  onOpenSignIn,
  onSubmitPayment,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    SUBSCRIPTION_PLANS.find((p) => p.id === 'plan_25') || SUBSCRIPTION_PLANS[3]
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [momoTxRef, setMomoTxRef] = useState('');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '0788000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSelectUpgrade = (plan: SubscriptionPlan) => {
    if (!user) {
      onOpenSignIn();
      return;
    }
    if (plan.isFree) return;
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setSubmittedSuccess(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !momoTxRef) return;
    setIsSubmitting(true);
    try {
      await onSubmitPayment({
        planId: selectedPlan.id,
        momoTxRef,
        momoNumber,
        userPhone: momoNumber,
      });
      setSubmittedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp formatted proof link
  const getWhatsAppPaymentUrl = () => {
    if (!selectedPlan) return '#';
    const message = `Hello NKUNDIMANA Theogene,\nI have paid for ${selectedPlan.label} (${selectedPlan.priceFrw} Frw).\n\nMy Details:\nName: ${user?.name || 'Teacher'}\nEmail: ${user?.email || 'N/A'}\nMoMo Phone: ${momoNumber}\nMoMo TxRef / Code: ${momoTxRef || 'Pending'}\n\nPlease approve my Teacher Pedagogy plan access. Thank you!`;
    return `https://wa.me/250781339530?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* System Anti-Scam Protection Banner */}
      <AntiScamBanner />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-black">
            <Zap className="w-3.5 h-3.5 fill-slate-900" />
            <span>Teacher Tool • AI Lesson Plans</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Select the Best Plan for Your Teaching Needs
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Instant lesson plan generation for teachers and schools. Choose your plan and pay directly using Mobile Money (MTN / Airtel Code <strong className="text-amber-300 font-mono">{OWNER_INFO.momoCode}</strong>).
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-mono font-black shadow-sm">
              <Phone className="w-4 h-4 text-slate-900" />
              <span>MoMo Code: {OWNER_INFO.momoCode}</span>
            </div>
            <a
              href={OWNER_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span>🤖 WhatsApp & AI Robotics Support (0781339530)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Imikoreshereze n'Ifatabuguzi (User Usage & Subscription Status Section) */}
      {user && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300" />
                <span>Imiterere n'Imikoreshereze ya Konti (Account & Usage Status)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kurikirana umubare w'imfashanyigisho wemerewe gukora kuri uku kwezi (Track your monthly generation quotas)
              </p>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Plan:</span>
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-lg border border-amber-500 shadow-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>{user.currentPlan || 'Free Plan'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Lesson Plans Quota Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Lesson Plans</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                  Active
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between text-xs font-black">
                  <span className="text-slate-600">Izisigaye (Remaining):</span>
                  <span className="text-emerald-700 font-mono text-base">{user.isAdmin ? 'Unlimited' : user.remainingPlans}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all" 
                    style={{ width: user.isAdmin ? '100%' : `${Math.min(100, Math.max(10, (user.remainingPlans / 10) * 100))}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                * Lesson plans zihita zigabanuka iyo ugize isomo rishya utegura na AI.
              </p>
            </div>

            {/* 2. Presentation Slides Quota Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Presentation Slides</span>
                {user.isAdmin || user.hasPremiumToolsSub ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Premium</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded-md">
                    Free (Limit: 5)
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between text-xs font-black">
                  <span className="text-slate-600">Izakozwe (Created):</span>
                  <span className="text-slate-900 font-mono text-base">
                    {user.isAdmin || user.hasPremiumToolsSub ? `${user.monthlySlidesCount || 0} / ∞` : `${user.monthlySlidesCount || 0} / 5`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${user.hasPremiumToolsSub ? 'bg-amber-500' : 'bg-orange-500'}`}
                    style={{ width: user.isAdmin || user.hasPremiumToolsSub ? '100%' : `${Math.min(100, ((user.monthlySlidesCount || 0) / 5) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {user.hasPremiumToolsSub ? '✓ Unlimited access active for slides!' : "* Ushobora gukora slides 5 z'ubuntu buri kwezi."}
              </p>
            </div>

            {/* 3. Exercises & Quizzes Quota Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Exercises & Exams</span>
                {user.isAdmin || user.hasPremiumToolsSub ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Premium</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded-md">
                    Free (Limit: 5)
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between text-xs font-black">
                  <span className="text-slate-600">Izakozwe (Created):</span>
                  <span className="text-slate-900 font-mono text-base">
                    {user.isAdmin || user.hasPremiumToolsSub ? `${user.monthlyExercisesCount || 0} / ∞` : `${user.monthlyExercisesCount || 0} / 5`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${user.hasPremiumToolsSub ? 'bg-amber-500' : 'bg-cyan-600'}`}
                    style={{ width: user.isAdmin || user.hasPremiumToolsSub ? '100%' : `${Math.min(100, ((user.monthlyExercisesCount || 0) / 5) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {user.hasPremiumToolsSub ? '✓ Unlimited access active for assessments!' : "* Ushobora gukora assessments 5 z'ubuntu buri kwezi."}
              </p>
            </div>

            {/* 4. Worksheets Quota Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Worksheets</span>
                {user.isAdmin || user.hasPremiumToolsSub ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Premium</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded-md">
                    Free (Limit: 5)
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between text-xs font-black">
                  <span className="text-slate-600">Izakozwe (Created):</span>
                  <span className="text-slate-900 font-mono text-base">
                    {user.isAdmin || user.hasPremiumToolsSub ? `${user.monthlyWorksheetsCount || 0} / ∞` : `${user.monthlyWorksheetsCount || 0} / 5`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${user.hasPremiumToolsSub ? 'bg-amber-500' : 'bg-emerald-600'}`}
                    style={{ width: user.isAdmin || user.hasPremiumToolsSub ? '100%' : `${Math.min(100, ((user.monthlyWorksheetsCount || 0) / 5) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {user.hasPremiumToolsSub ? '✓ Unlimited access active for worksheets!' : "* Ushobora gukora worksheets 5 z'ubuntu buri kwezi."}
              </p>
            </div>

            {/* 5. Class Diary (Cahier de Textes) Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Cahier de Textes</span>
                {user.isAdmin || user.hasPremiumToolsSub ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Premium</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded-md">
                    Free (Limit: 5)
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between text-xs font-black">
                  <span className="text-slate-600">Izakozwe (Created):</span>
                  <span className="text-slate-900 font-mono text-base">
                    {user.isAdmin || user.hasPremiumToolsSub ? `${user.monthlyDiaryCount || 0} / ∞` : `${user.monthlyDiaryCount || 0} / 5`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${user.hasPremiumToolsSub ? 'bg-amber-500' : 'bg-teal-600'}`}
                    style={{ width: user.isAdmin || user.hasPremiumToolsSub ? '100%' : `${Math.min(100, ((user.monthlyDiaryCount || 0) / 5) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {user.hasPremiumToolsSub ? '✓ Unlimited access active for class diary!' : "* Ushobora gukora diaries 5 z'ubuntu buri kwezi."}
              </p>
            </div>

            {/* Premium Tools Sub Info Banner */}
            {!user.isAdmin && !user.hasPremiumToolsSub && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-dashed border-orange-300 flex flex-col justify-between space-y-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500 fill-amber-300 animate-pulse" />
                    <span>Ukeneye izitemewe umubare (Unlimited)?</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Gura Premium Tools Sub rya <strong>2,500 Frw/kwezi</strong> kugira ngo ukureho imipaka yose kuri Slides, Worksheets, Imyitozo, na Class Diary!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const plan = SUBSCRIPTION_PLANS.find(p => p.id === 'plan_25') || SUBSCRIPTION_PLANS[3];
                    handleSelectUpgrade(plan);
                  }}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs border border-orange-600 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-amber-200" />
                  <span>GURA IFATABUGUZI (2,500 RWF)</span>
                </button>
              </div>
            )}

            {user.hasPremiumToolsSub && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 flex flex-col justify-center items-center text-center p-5 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-emerald-950">Premium Tools Active 👑</h4>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Imfashanyigisho zose za Slides, Worksheets, Assessments, na Class Diary zitemewe umubare (Unlimited) kugeza ku:
                </p>
                <div className="text-xs font-black font-mono text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  {user.premiumToolsExpiryDate ? new Date(user.premiumToolsExpiryDate).toLocaleDateString() : 'Active'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3 Free Plans Policy & Monthly Expiration Policy Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 3 Free Plans */}
        <div className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="inline-block bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md mb-1">
              🎁 3 FREE LESSON PLANS BURI KWEZI
            </div>
            <h3 className="text-sm font-black text-emerald-950">
              Lesson Plans 3 z'UBUNTU Buri Kwezi (3 Free Plans/Month)
            </h3>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Buri mukiriya ahabwa Lesson Plans 3 z'ubuntu buri ntangiriro z'ukwezi zo gukora n'isesengura ry'amasomo (AI).
            </p>
          </div>
        </div>

        {/* Card 2: 1 Month Plan Expiration */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md mt-0.5">
            <ShieldCheck className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <div className="inline-block bg-amber-700 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md mb-1">
              📅 1 MONTH VALIDITY & RENEWAL
            </div>
            <h3 className="text-sm font-black text-amber-950">
              Ifatabuguzi Rirangirana n'Ukwezi (Monthly Plan Expiry)
            </h3>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              Lesson plans z'ibiciro zirangirana n'ukwezi (1 Month Validity). Hashira ukundi kwezi umukiriya akongera akagura izindi plan gukomeza gukora amasomo.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Igiciro kuri buri lesson plan (Price Plans)</h2>
            <p className="text-xs text-slate-500">Choose the number of lesson plans you need each month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = user?.currentPlan === plan.label;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative bg-white hover:shadow-md ${
                  plan.popular
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-4 bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {plan.isFree ? 'Free Trial' : 'Monthly Plan'}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{plan.label}</h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-800">
                      {plan.priceFrw === 0 ? 'FREE' : `${plan.priceFrw.toLocaleString()} Frw`}
                    </span>
                    {!plan.isFree && <span className="text-xs text-slate-500">/ month</span>}
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600">
                    {plan.id === 'plan_premium_tools' ? (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                          <span className="font-extrabold text-amber-700">UNLIMITED Premium Tools</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Presentation Slides Creator</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Exercises & Quizzes Creator</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Printable Worksheets Generator</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Schemes of Work (SOW) Generator</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold">Class Diary (Cahier de Textes)</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{plan.plansCount} AI Generated Lesson Plans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>1-Page REB & CBC Grid Format</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>All Languages (Kinyarwanda, English, etc.)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Instant PDF Export & Printing</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {plan.isFree ? (
                    <div className="text-center text-xs font-bold text-slate-500 py-2">
                      Included Default Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectUpgrade(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                        plan.popular
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      id={`upgrade-btn-${plan.id}`}
                    >
                      <span>SELECT UPGRADE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kwishyura / Mobile Money Instructions Box */}
      <div className="bg-gradient-to-br from-amber-50 via-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-slate-800 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
          <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>UBURYO BWO KWISHYURA (PAYMENT METHODS)</span>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-2xs">
              ✓ Instant Account Activation
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-extrabold shadow-2xs">
              ✓ Paid Plans (Automatically Saved)
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          Hitamo plan ukoresheje Mobile Money / Airtel Money, hanyuma wohereze gihamya yo kwishyura kuri WhatsApp cyangwa kuri platform wihuse:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          {/* Step 1 */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-800 font-black rounded-full flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Send Payment via MoMo</h4>
            <p className="text-slate-600 text-[11px] leading-snug">
              Dial <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono font-bold">*182*1*1#</code> or use MoMo Code:
            </p>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <div className="text-sm font-black text-emerald-900">0781339530 / 0724038043</div>
              <div className="text-[11px] text-slate-600 font-semibold">Account Holder: {OWNER_INFO.accountHolder}</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="w-7 h-7 bg-amber-100 text-amber-800 font-black rounded-full flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Submit SMS Transaction Code</h4>
            <p className="text-slate-600 text-[11px] leading-snug">
              Click <span className="font-bold text-emerald-700">SELECT UPGRADE</span> on your desired plan, then enter your phone number and SMS Transaction ID.
            </p>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] font-semibold text-amber-900">
              ⚡ Your quota plan will update automatically!
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="w-7 h-7 bg-purple-100 text-purple-800 font-black rounded-full flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Or Contact Direct Support</h4>
            <p className="text-slate-600 text-[11px] leading-snug">
              You can also send your payment receipt via WhatsApp for instant manual activation:
            </p>
            <a
              href={`https://wa.me/250781339530?text=${encodeURIComponent(`Hello NKUNDIMANA Theogene, I made a payment on Teacher Tool. Please assist with my account activation.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Support (0781339530)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold">Submit Payment for {selectedPlan.label}</h3>
              <p className="text-xs text-amber-100 mt-0.5">Amount: {selectedPlan.priceFrw.toLocaleString()} Frw / month</p>
            </div>

            <div className="p-6 space-y-4">
              {submittedSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Payment Proof Submitted & (Automatically Saved)!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Your payment details have been recorded and <strong className="text-emerald-700">(Automatically Saved)</strong> in the system for <span className="font-bold">{OWNER_INFO.name}</span>. You can also confirm immediately via WhatsApp for instant approval.
                  </p>

                  <div className="pt-3 flex flex-col gap-2">
                    <a
                      href={getWhatsAppPaymentUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Confirm & Send Proof on WhatsApp ({OWNER_INFO.whatsapp})</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">Kwishyura Step 1:</span> Send <strong>{selectedPlan.priceFrw} Frw</strong> to Mobile Money <strong>{OWNER_INFO.momoNumbers[0]}</strong> ({OWNER_INFO.name}).
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Phone Number used for MoMo Payment
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0781339530"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      MoMo Transaction Reference / SMS Code / Phone
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0781339530 or SMS Code"
                      value={momoTxRef}
                      onChange={(e) => setMomoTxRef(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                      id="submit-momo-payment-btn"
                    >
                      {isSubmitting ? 'Submitting Payment...' : 'Submit MoMo Payment Proof'}
                    </button>

                    <a
                      href={getWhatsAppPaymentUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Or Pay & Confirm directly via WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
