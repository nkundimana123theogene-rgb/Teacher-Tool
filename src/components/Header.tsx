import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen,
  Library,
  Globe,
  MoreVertical,
  User,
  Shield,
  Zap,
  LogOut,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Award,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Download,
  Clock,
  RefreshCw,
  XCircle,
  AlertCircle,
  X,
  CreditCard,
  Activity,
  Check,
  Bot
} from 'lucide-react';
import { UserProfile, LanguageOption, PlanFormatOption, PaymentSubmission } from '../types';
import { OWNER_INFO } from '../data/plans';
import { getLessonPlanLabels } from '../data/translations';
import { getTimeBasedGreeting } from '../utils/greeting';

interface HeaderProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  onOpenSignIn: () => void;
  onOpenSubscription: () => void;
  onOpenAdmin: () => void;
  onOpenPolicy?: () => void;
  onSignOut: () => void;
  activeTab: 'dashboard' | 'generator' | 'remedial' | 'nursery' | 'slides' | 'exercises' | 'worksheets' | 'library' | 'history' | 'subscription' | 'admin' | 'founder' | 'class-diary' | 'certificates';
  onTabChange: (tab: 'dashboard' | 'generator' | 'remedial' | 'nursery' | 'slides' | 'exercises' | 'worksheets' | 'library' | 'history' | 'subscription' | 'admin' | 'founder' | 'class-diary' | 'certificates') => void;
  onSelectFormat?: (format: PlanFormatOption) => void;
  apiStatus?: 'online' | 'offline' | 'checking';
  isNetworkOnline?: boolean;
  onSyncCloudData?: () => void;
  isSyncing?: boolean;
}

const COUNTRIES = [
  { code: 'Rwanda', flag: '🇷🇼', label: 'Rwanda (REB / CBC)' },
  { code: 'Uganda', flag: '🇺🇬', label: 'Uganda' },
  { code: 'Kenya', flag: '🇰🇪', label: 'Kenya' },
  { code: 'Tanzania', flag: '🇹🇿', label: 'Tanzania' },
  { code: 'Burundi', flag: '🇧🇮', label: 'Burundi' },
  { code: 'DRC', flag: '🇨🇩', label: 'DR Congo' },
  { code: 'Global', flag: '🌍', label: 'International / Global' },
];

const LANGUAGES: LanguageOption[] = ['Kinyarwanda', 'English', 'French', 'Swahili'];

export const Header: React.FC<HeaderProps> = ({
  user,
  selectedLanguage,
  onLanguageChange,
  selectedCountry,
  onCountryChange,
  onOpenSignIn,
  onOpenSubscription,
  onOpenAdmin,
  onOpenPolicy,
  onSignOut,
  activeTab,
  onTabChange,
  onSelectFormat,
  apiStatus = 'online',
  isNetworkOnline = true,
  onSyncCloudData,
  isSyncing = false,
}) => {
  const labels = getLessonPlanLabels(selectedLanguage);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Real-time Payment Status Polling state
  const [userPayments, setUserPayments] = useState<PaymentSubmission[]>([]);
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentToast, setPaymentToast] = useState<{
    type: 'approved' | 'rejected' | 'pending';
    title: string;
    message: string;
  } | null>(null);

  const prevStatusesRef = useRef<Record<string, string>>({});

  const checkPayments = useCallback(async () => {
    if (!user?.email) {
      setUserPayments([]);
      return;
    }

    setIsCheckingPayment(true);
    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch(`/api/user-payments/${encodeURIComponent(user.email)}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const payments: PaymentSubmission[] = await res.json().catch(() => []);
        setUserPayments(payments);

        const prevStatuses = prevStatusesRef.current;
        let hasApproval = false;

        payments.forEach((p) => {
          const oldStatus = prevStatuses[p.id];
          if (oldStatus === 'pending' && p.status === 'approved') {
            hasApproval = true;
            setPaymentToast({
              type: 'approved',
              title: '🎉 Kwishyura Kwemejwe! (Payment Approved)',
              message: `Payment for ${p.planLabel} (${p.amountFrw} RWF) has been confirmed! Your plan quota is updated.`
            });
          } else if (oldStatus === 'pending' && p.status === 'rejected') {
            setPaymentToast({
              type: 'rejected',
              title: '❌ Kwishyura Kwanzwe (Payment Notice)',
              message: `Payment for ${p.planLabel} could not be confirmed. Contact WhatsApp support (0781339530).`
            });
          }
          prevStatuses[p.id] = p.status;
        });

        if (Object.keys(prevStatuses).length === 0) {
          payments.forEach((p) => {
            prevStatuses[p.id] = p.status;
          });
        }

        if (hasApproval) {
          window.dispatchEvent(new CustomEvent('payment-approved'));
          window.dispatchEvent(new CustomEvent('refresh-user-profile'));
        }
      }
    } catch (err) {
      console.warn('Payment status polling issue:', err);
    } finally {
      setIsCheckingPayment(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    checkPayments();

    const pendingCount = userPayments.filter((p) => p.status === 'pending').length;
    // High-frequency 5s interval if pending payment exists, otherwise 25s
    const intervalMs = pendingCount > 0 ? 5000 : 25000;

    const timer = setInterval(() => {
      checkPayments();
    }, intervalMs);

    const handlePaymentSubmitted = () => {
      checkPayments();
    };

    const handleTriggerPaymentCheck = () => {
      checkPayments();
    };

    window.addEventListener('payment-submitted', handlePaymentSubmitted);
    window.addEventListener('trigger-payment-check', handleTriggerPaymentCheck);

    return () => {
      clearInterval(timer);
      window.removeEventListener('payment-submitted', handlePaymentSubmitted);
      window.removeEventListener('trigger-payment-check', handleTriggerPaymentCheck);
    };
  }, [user?.email, userPayments, checkPayments]);

  const pendingPayments = userPayments.filter((p) => p.status === 'pending');

  const isConnected = isNetworkOnline && apiStatus !== 'offline';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 group text-left focus:outline-hidden"
              id="header-logo-button"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-all ring-2 ring-emerald-400/40">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="font-black text-xl sm:text-2xl text-emerald-700 tracking-tight block leading-none drop-shadow-xs">
                  Teacher Tool
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span>AI Lesson Plans</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md border border-amber-500 shadow-xs">
                    <span>IT/Developer: Nkundimana Theogene</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-md border border-emerald-300 shadow-2xs" title="Internet active & system is in Online Mode">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Online Mode</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-800 text-[10px] font-black rounded-md border border-rose-300 shadow-2xs animate-pulse" title="No internet connection detected">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      <span>No Connection? Please! Connect Your Device</span>
                    </span>
                  )}
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-sm font-medium">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-black ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white border border-cyan-700 shadow-sm scale-105'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500 shadow-2xs'
              }`}
              id="nav-dashboard-btn"
            >
              <span className="font-black text-white">Dashboard</span>
            </button>
            <button
              onClick={() => {
                onSelectFormat?.('reb_grid');
                onTabChange('generator');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs ${
                activeTab === 'generator'
                  ? 'bg-emerald-600 text-white border border-emerald-700 shadow-xs'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300/80'
              }`}
              id="nav-lesson-plans-btn"
              title="Isomo Rusange ry'Icyumweru (Standard CBC Grid)"
            >
              <span className="font-black">{labels.navLessonPlans}</span>
            </button>
            <button
              onClick={() => {
                onTabChange('remedial');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1 ${
                activeTab === 'remedial'
                  ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-xs'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80'
              }`}
              id="nav-remedial-plans-btn"
              title="Isomo ryo Kungoza no Kuzahura (Remedial Learning Program)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-300 shrink-0" />
              <span className="font-black">{labels.navRemedialPlans}</span>
            </button>

            <button
              onClick={() => {
                onTabChange('nursery');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1 ${
                activeTab === 'nursery'
                  ? 'bg-orange-500 text-slate-950 border border-orange-600 shadow-xs'
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300/80'
              }`}
              id="nav-nursery-plans-btn"
              title="Create Nursery Lesson Plan"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-700 fill-orange-300 shrink-0" />
              <span className="font-black">{labels.navNurseryPlans}</span>
            </button>
            <button
              onClick={() => {
                onTabChange('slides');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1 ${
                activeTab === 'slides'
                  ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-xs'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80'
              }`}
              id="nav-slides-btn"
              title="Create Presentation Slides"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-300 shrink-0" />
              <span className="font-black">{labels.navSlides}</span>
            </button>
            <button
              onClick={() => {
                onTabChange('library');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1 ${
                activeTab === 'library'
                  ? 'bg-blue-600 text-white border border-blue-700 shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200'
              }`}
              id="nav-library-btn"
              title="Open Library & Schemes of Work"
            >
              <Library className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="font-black">{labels.navLibrary}</span>
            </button>
            <button
              onClick={() => onTabChange('exercises')}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1.5 ${
                activeTab === 'exercises'
                  ? 'bg-cyan-600 text-white border border-cyan-700 shadow-xs scale-105'
                  : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-950 border border-cyan-300/80'
              }`}
              id="nav-exercises-btn"
              title="Create Homework, Classwork, or Quizzes"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-700 fill-cyan-300 shrink-0" />
              <span className="font-black">{labels.navExercises}</span>
            </button>
            <button
              onClick={() => onTabChange('worksheets')}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1.5 ${
                activeTab === 'worksheets'
                  ? 'bg-emerald-600 text-white border border-emerald-700 shadow-xs scale-105'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300/80'
              }`}
              id="nav-worksheets-btn"
              title="Create Educational Worksheets"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 fill-emerald-300 shrink-0" />
              <span className="font-black">{labels.navWorksheets}</span>
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-black ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white border border-purple-700 shadow-xs'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300/80'
              }`}
              id="nav-history-btn"
            >
              <span className={`font-black ${activeTab === 'history' ? 'text-white' : 'text-purple-950'}`}>{labels.navSavedPlans}</span>
            </button>
            <button
              onClick={() => onTabChange('class-diary')}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1 ${
                activeTab === 'class-diary'
                  ? 'bg-teal-600 text-white border border-teal-700 shadow-xs scale-105'
                  : 'bg-teal-100 hover:bg-teal-200 text-teal-950 border border-teal-300/80'
              }`}
              id="nav-class-diary-btn"
              title="Class Diary (Cahier de Textes)"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="font-black">Cahier de Textes</span>
            </button>
            <button
              onClick={() => onTabChange('certificates')}
              className={`px-3 py-1.5 rounded-lg transition-all font-black text-xs flex items-center gap-1.5 shadow-sm ${
                activeTab === 'certificates'
                  ? 'bg-lime-400 text-slate-950 border-2 border-lime-500 ring-2 ring-lime-400/50 scale-105'
                  : 'bg-lime-300 hover:bg-lime-400 text-slate-950 border border-lime-500/80'
              }`}
              id="nav-certificates-btn"
              title="AI Certificate Generator (Ibyemezo)"
            >
              <Award className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[2.5]" />
              <span className="font-black text-slate-950">{labels.navCertificates || 'AI Certificate'}</span>
            </button>
            <button
              onClick={() => onTabChange('subscription')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'subscription'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50 font-medium'
              }`}
              id="nav-subscription-btn"
            >
              <Zap className="w-4 h-4 fill-amber-300 stroke-amber-800" />
              {labels.navSubscription}
            </button>

            <button
              onClick={() => onTabChange('founder')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'founder'
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 font-semibold border border-emerald-200/80'
              }`}
              id="nav-founder-btn"
            >
              <Award className="w-4 h-4 text-amber-500 fill-amber-300" />
              <span>{labels.navFounder}</span>
            </button>

            <button
              onClick={() => onOpenPolicy?.()}
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold text-xs border border-slate-300/60"
              title="Policy, Terms, Conditions & FAQ"
              id="header-policy-btn"
            >
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>Policy, Terms & FAQ</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-guide'))}
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-slate-950 font-black text-xs shadow-xs hover:scale-105 active:scale-95"
              title="Shyira Nkorera Education App kuri Phone yawe / Computer"
              id="header-install-app-btn"
            >
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
              <span>Install App 📱</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-robotics-assistant'))}
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95"
              title="Fungura Robotics & AI Assistant Chat"
              id="header-open-robotics-chat-btn"
            >
              <Bot className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Robotics AI Chat 🤖</span>
            </button>

            <a
              href={OWNER_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs border border-emerald-300/80"
              title="Robotics & AI WhatsApp Support"
              id="header-whatsapp-support-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp Group (0781339530)</span>
            </a>

            <button
              onClick={() => onTabChange('admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-purple-700 text-white font-bold shadow-xs'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold border border-purple-300/80'
              }`}
              id="nav-admin-btn"
              title="Analytics, Usage Statistics & Subscriber Payment Management"
            >
              <Shield className="w-4 h-4 text-purple-800" />
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Controls Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-Time Payment Status Indicator Badge */}
            {user && pendingPayments.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-yellow-500/10 border-2 border-amber-400 text-amber-900 font-black text-xs shadow-xs animate-pulse hover:scale-105 transition-all shrink-0"
                title="Pending Payment Detected - Click for Real-Time Status"
                id="header-payment-status-pending-btn"
              >
                <div className="relative flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                </div>
                <span className="hidden sm:inline font-black text-amber-950">
                  Payment Pending ({pendingPayments.length})
                </span>
                <span className="sm:hidden font-black text-amber-950">
                  Pending ({pendingPayments.length})
                </span>
                <RefreshCw className={`w-3 h-3 text-amber-700 shrink-0 ${isCheckingPayment ? 'animate-spin' : ''}`} />
              </button>
            )}

            {user && pendingPayments.length === 0 && userPayments.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 font-extrabold text-xs transition-all shrink-0"
                title="Payment Status Verified - Click to View History"
                id="header-payment-status-verified-btn"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Payment Status</span>
                {isCheckingPayment && <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin shrink-0" />}
              </button>
            )}

            {/* Install App Button with Phone, Tablet, Computer Icons */}
            <button
              type="button"
              onClick={() => {
                const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
                if (isInIframe) {
                  window.open(window.location.href, '_blank', 'noopener,noreferrer');
                } else {
                  window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-black bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-xl shadow-sm border border-lime-500 transition-all hover:scale-105 active:scale-95"
              title="Install App on Phone, Tablet & Computer for Instant Access"
              id="header-install-app-btn"
            >
              <div className="flex items-center gap-1 bg-slate-950/15 px-1.5 py-0.5 rounded-md">
                <Smartphone className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" title="Phone" />
                <Tablet className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" title="Tablet" />
                <Monitor className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" title="Computer" />
              </div>
              {typeof window !== 'undefined' && window.self !== window.top ? (
                <>
                  <span className="hidden sm:inline">Download App</span>
                  <span className="sm:hidden">Download</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Install App</span>
                  <span className="sm:hidden">Install</span>
                </>
              )}
            </button>

            {/* Sync Data App Button */}
            <button
              type="button"
              onClick={() => {
                if (onSyncCloudData) {
                  onSyncCloudData();
                } else {
                  window.dispatchEvent(new CustomEvent('trigger-pwa-sync'));
                }
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-600 text-white rounded-xl shadow-sm border border-emerald-800 transition-all hover:scale-105"
              title="Sync All System Data (Cloud Firestore & Cache Update)"
              id="header-sync-data-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-lime-300 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Data 🔄'}</span>
              <span className="md:hidden">{isSyncing ? 'Sync...' : 'Sync 🔄'}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowCountryMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/80 hover:bg-emerald-100/80 transition-colors"
                title="Select Language"
                id="language-selector-button"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                        selectedLanguage === lang ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang}</span>
                      {selectedLanguage === lang && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Three dots (⋮) Menu for Country selection */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCountryMenu(!showCountryMenu);
                  setShowLangMenu(false);
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                title="Country & Region Options"
                id="country-menu-three-dots"
              >
                <span className="text-sm">
                  {COUNTRIES.find((c) => c.code === selectedCountry)?.flag || '🇷🇼'}
                </span>
                <MoreVertical className="w-4 h-4 text-slate-600" />
              </button>

              {showCountryMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ➡️ Select your Country
                  </div>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        onCountryChange(country.code);
                        setShowCountryMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                        selectedCountry === country.code
                          ? 'font-bold text-emerald-800 bg-emerald-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.label}</span>
                      </span>
                      {selectedCountry === country.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  id="user-profile-button"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {user.isAdmin ? '👑 Owner' : `${user.remainingPlans} plans left`}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 bg-emerald-50/80 border-b border-emerald-100">
                      <p className="text-xs font-black text-emerald-900">
                        {getTimeBasedGreeting(user.name, selectedLanguage).title}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium leading-tight mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[10px] font-bold shadow-2xs">
                        <Zap className="w-3 h-3 text-amber-600 fill-amber-400" />
                        <span>{user.currentPlan}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenSubscription();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 font-medium"
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      ⚡ Upgrade Subscription
                    </button>

                    <button
                      onClick={() => {
                        if (onSyncCloudData) {
                          onSyncCloudData();
                        } else {
                          window.dispatchEvent(new CustomEvent('trigger-pwa-sync'));
                        }
                        setShowUserMenu(false);
                      }}
                      disabled={isSyncing}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 font-bold disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>🔄 {isSyncing ? 'Syncing System...' : 'Sync System Data (Vugurura)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowPaymentModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>💳 Payment Status & MoMo</span>
                      </div>
                      {pendingPayments.length > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full animate-pulse">
                          {pendingPayments.length} Pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          {userPayments.length} logged
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onOpenPolicy?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 font-medium"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      📜 Policy, Terms & Conditions
                    </button>

                    {user.isAdmin && (
                      <button
                        onClick={() => {
                          onOpenAdmin();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onSignOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all hover:shadow-emerald-600/20"
                id="sign-in-modal-open-btn"
              >
                <User className="w-4 h-4" />
                <span>🔐 Register / Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 text-xs font-semibold overflow-x-auto gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'dashboard'
                ? 'bg-cyan-600 text-white border border-cyan-700 shadow-sm'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-500 shadow-2xs'
            }`}
          >
            <span className="font-black text-white">Dashboard</span>
          </button>
          <button
            onClick={() => {
              onSelectFormat?.('reb_grid');
              onTabChange('generator');
            }}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'generator' ? 'bg-emerald-600 text-white border border-emerald-700' : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
            }`}
          >
            <span className="font-black">{labels.navLessonPlans}</span>
          </button>
          <button
            onClick={() => onTabChange('remedial')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black flex items-center gap-1 ${
              activeTab === 'remedial' ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-sm' : 'bg-amber-100 text-amber-950 border border-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-300 shrink-0" />
            <span className="font-black">{labels.navRemedialPlans}</span>
          </button>
          <button
            onClick={() => onTabChange('exercises')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'exercises' ? 'bg-cyan-600 text-white border border-cyan-700' : 'bg-cyan-100 text-cyan-950 border border-cyan-300'
            }`}
          >
            <span className="font-black">{labels.navExercises}</span>
          </button>
          <button
            onClick={() => onTabChange('worksheets')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'worksheets' ? 'bg-emerald-600 text-white border border-emerald-700' : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
            }`}
          >
            <span className="font-black">{labels.navWorksheets}</span>
          </button>

          <button
            onClick={() => onTabChange('nursery')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black flex items-center gap-1 ${
              activeTab === 'nursery' ? 'bg-orange-500 text-slate-950 border border-orange-600 shadow-sm' : 'bg-orange-100 text-orange-950 border border-orange-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-700 fill-orange-300 shrink-0" />
            <span className="font-black">{labels.navNurseryPlans}</span>
          </button>
          <button
            onClick={() => onTabChange('slides')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black flex items-center gap-1 ${
              activeTab === 'slides' ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-sm' : 'bg-amber-100 text-amber-950 border border-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-300 shrink-0" />
            <span className="font-black">{labels.navSlides}</span>
          </button>
          <button
            onClick={() => onTabChange('library')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black flex items-center gap-1 ${
              activeTab === 'library' ? 'bg-blue-600 text-white border border-blue-700 shadow-sm' : 'bg-blue-50 text-blue-950 border border-blue-200'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="font-black">{labels.navLibrary}</span>
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black ${
              activeTab === 'history' ? 'bg-purple-600 text-white border border-purple-700' : 'bg-purple-100 text-purple-950 border border-purple-300'
            }`}
          >
            <span className={`font-black ${activeTab === 'history' ? 'text-white' : 'text-purple-950'}`}>{labels.navSavedPlans}</span>
          </button>
          <button
            onClick={() => onTabChange('class-diary')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black flex items-center gap-1 ${
              activeTab === 'class-diary' ? 'bg-teal-600 text-white border border-teal-700' : 'bg-teal-100 text-teal-950 border border-teal-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="font-black">Class Diary</span>
          </button>
          <button
            onClick={() => onTabChange('certificates')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 font-black flex items-center gap-1 ${
              activeTab === 'certificates' ? 'bg-lime-400 text-slate-950 border border-lime-600 font-extrabold shadow-sm' : 'bg-lime-300 text-slate-950 border border-lime-500'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="font-black text-slate-950">AI Certificate</span>
          </button>
          <button
            onClick={() => onTabChange('subscription')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              activeTab === 'subscription' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-amber-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            {labels.navSubscription}
          </button>
          <button
            onClick={() => onTabChange('founder')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              activeTab === 'founder' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-800 bg-emerald-50 border border-emerald-200 font-semibold'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{labels.navFounder}</span>
          </button>
          <button
            onClick={() => onOpenPolicy?.()}
            className="px-2.5 py-1.5 rounded-lg shrink-0 text-slate-700 bg-slate-100 flex items-center gap-1 font-bold"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>Policy</span>
          </button>
          <button
            onClick={() => onTabChange('admin')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 font-bold ${
              activeTab === 'admin'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-100 text-purple-900 border border-purple-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME FLOATING TOAST ALERT */}
      {paymentToast && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-top-4 duration-300 ${
          paymentToast.type === 'approved'
            ? 'bg-slate-950/95 border-emerald-400 text-white'
            : 'bg-slate-950/95 border-rose-400 text-white'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                paymentToast.type === 'approved' ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'
              }`}>
                {paymentToast.type === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <XCircle className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
              <div>
                <h4 className="font-black text-sm">{paymentToast.title}</h4>
                <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                  {paymentToast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPaymentToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {paymentToast.type === 'approved' && (
            <div className="mt-3 pt-2 border-t border-emerald-800/60 flex items-center justify-between">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                ⚡ Real-Time Sync Active
              </span>
              <button
                onClick={() => {
                  setPaymentToast(null);
                  onOpenSubscription();
                }}
                className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-lg transition-all"
              >
                View Plans ⚡
              </button>
            </div>
          )}
        </div>
      )}

      {/* REAL-TIME PAYMENT TRACKER MODAL */}
      {showPaymentModal && user && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-400/60 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-400 text-slate-950 rounded-2xl font-black flex items-center justify-center shadow-lg shadow-emerald-400/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Payment Status Tracker</h3>
                  <p className="text-xs text-emerald-400 font-extrabold flex items-center gap-1.5 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Live Polling & Real-time Verification</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Polling Info Bar */}
            <div className="p-4 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 rounded-2xl border border-emerald-400/40 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black text-emerald-300">
                    {pendingPayments.length > 0 ? 'High-Frequency Polling (Every 5s)' : 'Real-time System Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Account: <strong className="text-white">{user.email}</strong>
                </p>
              </div>
              <button
                onClick={() => checkPayments()}
                disabled={isCheckingPayment}
                className="px-3 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isCheckingPayment ? 'animate-spin' : ''}`} />
                <span>{isCheckingPayment ? 'Checking...' : 'Refresh Status 🔄'}</span>
              </button>
            </div>

            {/* Payments List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Your Mobile Money Payments ({userPayments.length})
              </h4>

              {userPayments.length === 0 ? (
                <div className="p-6 text-center bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">Nta kwishyura kuka konti yawe kuko bitarakorwa (No payments logged)</p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      onOpenSubscription();
                    }}
                    className="mt-2 px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-300 transition-all inline-flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Buy Subscription / Upgrade Plan ⚡</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {userPayments.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        p.status === 'pending'
                          ? 'bg-amber-950/40 border-amber-400/80'
                          : p.status === 'approved'
                          ? 'bg-emerald-950/40 border-emerald-400/80'
                          : 'bg-rose-950/40 border-rose-400/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-white">
                              {p.planLabel || `${p.plansCount} Lesson Plans`}
                            </span>
                            <span className="text-xs font-black text-amber-300">
                              {p.amountFrw?.toLocaleString()} RWF
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                            MoMo Ref: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[10px]">{p.momoTxRef}</code> • Phone: {p.momoNumber || p.userPhone}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {p.timestamp ? new Date(p.timestamp).toLocaleString() : 'Recently submitted'}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {p.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-xl animate-pulse shadow-md">
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Pending Approval</span>
                            </span>
                          )}
                          {p.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-xl shadow-md">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved</span>
                            </span>
                          )}
                          {p.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black rounded-xl shadow-md">
                              <XCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {p.status === 'pending' && (
                        <p className="text-[11px] text-amber-200/90 font-semibold mt-2 pt-2 border-t border-amber-500/30 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Admin yiriwe asuzuma iyi transaction. System irahita ibyemeza automatic mu kanya nka ko!</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct WhatsApp Admin Link */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <p className="text-slate-300 font-semibold">
                Urashaka ko payment yawe yemezwa bwangu? Baza Founder/Admin kuri WhatsApp:
              </p>
              <a
                href="https://wa.me/250781339530?text=Hello%20Admin%2C%20natanze%20payment%20proof%20kuri%20Nkorera%20Education.%20Mwamfasha%20kuyemeza"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Chat Admin on WhatsApp (0781339530)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
