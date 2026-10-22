import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
  X, 
  Sparkles,
  LogOut,
  LogIn,
  Menu,
  Bot,
  MessageSquare,
  LayoutGrid,
  Shield,
  Radio,
  Wifi,
  CheckCircle2,
  Sun,
  Moon,
  Bell
} from 'lucide-react';

// Modals
import { FilterServicesModal } from './components/FilterServicesModal';
import { LibraryModal } from './components/LibraryModal';
import { ClassDiaryModal } from './components/ClassDiaryModal';
import { StudentIdentificationModal } from './components/StudentIdentificationModal';
import { DevProfileModal } from './components/DevProfileModal';
import { TeacherBookModal } from './components/TeacherBookModal';
import { ProfessionalBookModal } from './components/ProfessionalBookModal';
import { RebBooksModal } from './components/RebBooksModal';
import { InstallModal } from './components/InstallModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { AiChatbotModal } from './components/AiChatbotModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { SavetoAiModal } from './components/SavetoAiModal';
import { FeatureDirectoryModal } from './components/FeatureDirectoryModal';
import { PolicyTermsModal, ModalTabType } from './components/PolicyTermsModal';
import { UserProfile, MainViewType, AppConfig, RemedialLessonPlanData } from './types';
import { subscribeToAppConfig, subscribeToTeacherQuota } from './utils/realtime';
import { syncUserProfileToFirestore, logSecurityEvent, fetchLessonPlanById, db, collection, query, orderBy, limit, onSnapshot, subscribeToStudentRoster } from './utils/firebase';
import { syncSingleTeacherToCloud } from './utils/autoSync';
import { CbcLessonPlanModal } from './components/CbcLessonPlanModal';
import { SubscriptionStatusModal } from './components/SubscriptionStatusModal';
import { PaymentHistoryModal } from './components/PaymentHistoryModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { fetchNotificationsApi, playPaymentChimeSound } from './utils/notifications';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { MyLessonPlansModal } from './components/MyLessonPlansModal';
import RemedialLessonPlanModal from './components/RemedialLessonPlanModal';
import { NurseryLessonPlanModal } from './components/NurseryLessonPlanModal';
import { SchemeOfWorkModal } from './components/SchemeOfWorkModal';
import { DashboardDrawer } from './components/DashboardDrawer';
import { HeaderNavRow } from './components/HeaderNavRow';
import { LessonPlanningHubModal } from './components/LessonPlanningHubModal';
import { TeacherResourcesModal, ResourceTab } from './components/TeacherResourcesModal';
import { TeacherRecordsModal, RecordsTab } from './components/TeacherRecordsModal';
import { HomeworkClassworkQuizModal } from './components/HomeworkClassworkQuizModal';
import { PrintableWorksheetModal } from './components/PrintableWorksheetModal';
import { MergePdfsModal } from './components/MergePdfsModal';
import { PresentationSlidesModal } from './components/PresentationSlidesModal';
import { AiCertificateCreatorModal } from './components/AiCertificateCreatorModal';
import { CertificateVerificationPage } from './components/CertificateVerificationPage';
import { OfflineRobotAssistantModal } from './components/OfflineRobotAssistantModal';
import { FloatingOfflineRobotTrigger } from './components/FloatingOfflineRobotTrigger';
import { speakRobotOfflineAlert, speakRobotOnlineSuccess } from './utils/robotVoice';

// Page Views
import { DashboardOverviewView } from './components/DashboardOverviewView';
import { LessonPlanningPageView } from './components/LessonPlanningPageView';
import { TeacherResourcesPageView } from './components/TeacherResourcesPageView';
import { TeacherRecordsPageView } from './components/TeacherRecordsPageView';
import { RebBooksPageView } from './components/RebBooksPageView';
import { SubscriptionPageView } from './components/SubscriptionPageView';
import { HelpSupportPageView } from './components/HelpSupportPageView';

// Auth and User sessions
import { getCurrentUser, logoutUser } from './utils/auth';


export default function App() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentGreeting, setCurrentGreeting] = useState<string>('Morning');
  
  // Dark Mode state management with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nkorera_theme');
      if (saved) return saved === 'dark';
    } catch {}
    return true; // Default to dark mode
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      try { localStorage.setItem('nkorera_theme', 'dark'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      try { localStorage.setItem('nkorera_theme', 'light'); } catch {}
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  // Active User session and Auth states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser());
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<MainViewType>('dashboard');

  useEffect(() => {
    const unsub = subscribeToAppConfig(setAppConfig);
    return () => unsub();
  }, []);

  // Real-time automatic quota & profile updates from Cloud
  useEffect(() => {
    if (!currentUser?.email || currentUser.id === 'guest') return;
    
    const unsubQuota = subscribeToTeacherQuota(currentUser.email, (updatedData) => {
      if (updatedData) {
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const merged = { ...prev, ...updatedData };
          try {
            localStorage.setItem('nkorera_current_user', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    return () => unsubQuota();
  }, [currentUser?.email]);

  // Background student roster synchronization across devices (phone & desktop)
  useEffect(() => {
    if (!currentUser?.email) return;
    const email = currentUser.email;
    const unsubRoster = subscribeToStudentRoster(email, (remoteData) => {
      if (remoteData && Array.isArray(remoteData.students)) {
        try {
          const safeKey = email.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
          localStorage.setItem('nkorera_student_roster', JSON.stringify(remoteData.students));
          localStorage.setItem(`nkorera_student_roster_${safeKey}`, JSON.stringify(remoteData.students));
          if (remoteData.schoolInfo) {
            localStorage.setItem('nkorera_school_info', JSON.stringify(remoteData.schoolInfo));
            localStorage.setItem(`nkorera_school_info_${safeKey}`, JSON.stringify(remoteData.schoolInfo));
          }
          if (remoteData.updatedAt) {
            localStorage.setItem('nkorera_student_roster_last_synced', remoteData.updatedAt);
          }
        } catch (e) {
          console.warn("App background roster sync write error:", e);
        }
      }
    });

    return () => unsubRoster();
  }, [currentUser?.email]);

  // Strong Immunity: Sync user profile and log session start for "Ubudahangarwa Bukomeye"
  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest') {
      syncUserProfileToFirestore(currentUser);
      syncSingleTeacherToCloud(currentUser);
      logSecurityEvent('SESSION_START', `User ${currentUser.email} started a new session.`, currentUser.email, currentUser.name);
    }
  }, [currentUser]);

  // Navigation & Modals state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isFilterServicesModalOpen, setIsFilterServicesModalOpen] = useState<boolean>(false);
  const [isLessonPlanningHubOpen, setIsLessonPlanningHubOpen] = useState<boolean>(false);
  const [isDevProfileOpen, setIsDevProfileOpen] = useState<boolean>(false);
  const [isTeacherBookOpen, setIsTeacherBookOpen] = useState<boolean>(false);
  const [isTeacherResourcesOpen, setIsTeacherResourcesOpen] = useState<boolean>(false);
  const [isCertificateCreatorOpen, setIsCertificateCreatorOpen] = useState<boolean>(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false);
  const [teacherResourcesTab, setTeacherResourcesTab] = useState<ResourceTab>('prompts');
  const [isProfessionalBookOpen, setIsProfessionalBookOpen] = useState<boolean>(false);
  const [isTeacherRecordsOpen, setIsTeacherRecordsOpen] = useState<boolean>(false);
  const [teacherRecordsTab, setTeacherRecordsTab] = useState<RecordsTab>('cahier');
  const [isRebBooksOpen, setIsRebBooksOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const {
    deferredPrompt,
    isInstallable,
    isInstalled,
    install: installPWA,
    downloadDesktopShortcut
  } = usePWAInstall();
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMyPlansOpen, setIsMyPlansOpen] = useState<boolean>(false);
  const [isClassDiaryOpen, setIsClassDiaryOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isStudentIdOpen, setIsStudentIdOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nkorera_student_id_open') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isStudentIdOpen) {
        localStorage.setItem('nkorera_student_id_open', 'true');
      } else {
        localStorage.removeItem('nkorera_student_id_open');
      }
    } catch {}
  }, [isStudentIdOpen]);

  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isSavetoAiOpen, setIsSavetoAiOpen] = useState<boolean>(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);
  const [policyInitialTab, setPolicyInitialTab] = useState<ModalTabType>('policy');

  const openInfoTab = (tab: ModalTabType) => {
    setPolicyInitialTab(tab);
    setIsPolicyOpen(true);
  };
  
  // Lesson Plan Modals
  const [isCbcModalOpen, setIsCbcModalOpen] = useState<boolean>(false);
  const [isNurseryModalOpen, setIsNurseryModalOpen] = useState<boolean>(false);
  const [isSchemeOfWorkOpen, setIsSchemeOfWorkOpen] = useState<boolean>(false);
  const [cbcModalMode, setCbcModalMode] = useState<'create' | 'edit'>('create');

  // Homework, Classwork, Quiz, Worksheets, Merge PDFs, Presentation Slides
  const [isHomeworkQuizOpen, setIsHomeworkQuizOpen] = useState<boolean>(false);
  const [homeworkQuizMode, setHomeworkQuizMode] = useState<'homework' | 'classwork' | 'quiz'>('homework');
  const [isPrintableWorksheetOpen, setIsPrintableWorksheetOpen] = useState<boolean>(false);
  const [isMergePdfsOpen, setIsMergePdfsOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);

  // Remedial Lesson Plan Modal
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState<boolean>(false);
  const [selectedRemedialPlan, setSelectedRemedialPlan] = useState<RemedialLessonPlanData | null>(null);

  // Dynamic Current Year for real-time automatic year updates
  const currentYear = new Date().getFullYear();

  // Subscription Status Modal
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [, setUnreadNotifCount] = useState<number>(0);
  const [livePaymentToast, setLivePaymentToast] = useState<{ title: string; message: string; amount?: number } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(!currentUser);
  const [subWarningMsg, setSubWarningMsg] = useState<string>('');

  // Real-time notification poller & event listener
  useEffect(() => {
    if (!currentUser?.email) return;

    const checkNotifs = async () => {
      const isAdmin = currentUser.email === 'nkundimana123theogene@gmail.com' || Boolean(currentUser.isAdmin);
      const data = await fetchNotificationsApi(
        currentUser.email, 
        currentUser.phone || currentUser.momoNumber, 
        isAdmin ? 'admin' : 'user'
      );
      setUnreadNotifCount(data.unreadCount);
    };

    checkNotifs();
    const interval = setInterval(checkNotifs, 10000);

    const handleNewNotification = (e: any) => {
      const detail = e.detail || {};
      setLivePaymentToast({
        title: detail.title || 'Payment Received!',
        message: detail.message || "Payment notification received successfully!",
        amount: detail.amount
      });
      setUnreadNotifCount(prev => prev + 1);
      playPaymentChimeSound();
    };

    const handleUserUpdated = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };

    window.addEventListener('nkorera_new_notification', handleNewNotification);
    window.addEventListener('nkorera_user_updated', handleUserUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('nkorera_new_notification', handleNewNotification);
      window.removeEventListener('nkorera_user_updated', handleUserUpdated);
    };
  }, [currentUser?.email]);

  // Auto dismiss live payment toast
  useEffect(() => {
    if (livePaymentToast) {
      const timer = setTimeout(() => {
        setLivePaymentToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [livePaymentToast]);

  // Robot Offline Assistant Modal & Network status
  const [isRobotModalOpen, setIsRobotModalOpen] = useState<boolean>(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);

  // Auto-detect network disconnection and reconnection
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const handleOffline = () => {
      setIsNetworkOnline(false);
      setShowOnlineToast(false);
      // If user is writing students in Student Identification Form, keep it quiet and don't pop up robot modal
      if (localStorage.getItem('nkorera_student_id_open') !== 'true') {
        setIsRobotModalOpen(true);
        speakRobotOfflineAlert("Now! You're Offline. No internet connection. Please search for internet connection.");
      }
    };

    const handleOnline = () => {
      setIsNetworkOnline(true);
      // Automatically dismiss any offline modal / robot warning!
      setIsRobotModalOpen(false);
      setShowOnlineToast(true);
      // Speak celebratory announcement: "Good Job! Now You're Online!"
      speakRobotOnlineSuccess("Good Job! Now You're Online!");

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 4500);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimeout(hideTimer);
    };
  }, []);

  // 🚀 REAL-TIME AUTOMATIC LOGIN LISTENER (FOR ADMIN / OWNER)
  // Real-time automatic login listener to notify Admin whenever any user logs in (Automatically Login)
  const [liveLoginAlert, setLiveLoginAlert] = useState<{
    id: string;
    userName: string;
    userEmail: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    const isUserAdmin = currentUser?.isAdmin || currentUser?.email?.toLowerCase() === 'nkundimana123theogene@gmail.com';
    if (!isUserAdmin) return;

    const seenEventIds = new Set<string>();
    let isInitialLoad = true;
    let alertTimer: NodeJS.Timeout;

    const triggerAdminAlert = (eventId: string, userName: string, userEmail: string, eventType: string, time?: string) => {
      const email = (userEmail || '').toLowerCase().trim();
      if (!email || email === currentUser?.email?.toLowerCase().trim()) return;
      if (seenEventIds.has(eventId)) return;
      seenEventIds.add(eventId);

      const isReg = eventType === 'REGISTRATION_SUCCESS';
      const name = userName || (email.includes('@') ? email.split('@')[0] : email) || 'Teacher';
      const eventTime = time || new Date().toISOString();

      setLiveLoginAlert({
        id: eventId,
        userName: name,
        userEmail: email,
        time: eventTime
      });

      // Play voice/speech announcement
      speakRobotOnlineSuccess(isReg ? `New teacher ${name} registered on Nkorera!` : `Teacher ${name} has just logged in!`);

      clearTimeout(alertTimer);
      alertTimer = setTimeout(() => {
        setLiveLoginAlert(null);
      }, 9000);
    };

    // 1. Native BroadcastChannel (0ms in-browser cross-tab)
    let authChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        authChannel = new BroadcastChannel('nkorera_auth_broadcast');
        authChannel.onmessage = (e) => {
          const data = e.data;
          if (data && (data.eventType === 'LOGIN_SUCCESS' || data.eventType === 'REGISTRATION_SUCCESS')) {
            const user = data.user;
            triggerAdminAlert(
              `bc_${Date.now()}`,
              user?.name || user?.email,
              user?.email,
              data.eventType,
              data.timestamp
            );
          }
        };
      } catch {}
    }

    // 2. Window Custom Event (0ms local window)
    const handleWindowAuthEvent = (e: any) => {
      const data = e?.detail;
      if (data && (data.eventType === 'LOGIN_SUCCESS' || data.eventType === 'REGISTRATION_SUCCESS')) {
        const user = data.user;
        triggerAdminAlert(
          `win_${Date.now()}`,
          user?.name || user?.email,
          user?.email,
          data.eventType,
          data.timestamp
        );
      }
    };
    window.addEventListener('nkorera_teacher_auth_event', handleWindowAuthEvent);

    // 3. Server-Sent Events (SSE) Live Stream (instant real-time from mobile or remote network)
    let sseSource: EventSource | null = null;
    try {
      sseSource = new EventSource('/api/admin/live-auth-stream');
      sseSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'AUTH_EVENT' && (payload.eventType === 'LOGIN_SUCCESS' || payload.eventType === 'REGISTRATION_SUCCESS')) {
            const user = payload.user || {};
            triggerAdminAlert(
              payload.log?.id || `sse_${Date.now()}`,
              user?.name || user?.email || payload.log?.userName,
              user?.email || payload.log?.userEmail,
              payload.eventType,
              payload.timestamp
            );
          }
        } catch {}
      };
    } catch {}

    // 4. Firestore real-time snapshot
    let unsubscribeFirestore: (() => void) | null = null;
    if (db) {
      try {
        const q = query(
          collection(db, 'security_logs'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          if (isInitialLoad) {
            snapshot.forEach(docSnap => seenEventIds.add(docSnap.id));
            isInitialLoad = false;
            return;
          }

          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const docId = change.doc.id;
              const data = change.doc.data();
              if (!data) return;

              const eventType = data.eventType || '';
              if (eventType === 'LOGIN_SUCCESS' || eventType === 'LOGIN' || eventType === 'REGISTRATION_SUCCESS') {
                triggerAdminAlert(
                  docId,
                  data.userName || data.userEmail,
                  data.userEmail,
                  eventType,
                  data.timestamp
                );
              }
            }
          });
        }, (err) => {
          console.warn('[Realtime Logins] Snapshot warning:', err);
        });
      } catch {}
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (authChannel) authChannel.close();
      if (sseSource) sseSource.close();
      window.removeEventListener('nkorera_teacher_auth_event', handleWindowAuthEvent);
      clearTimeout(alertTimer);
    };
  }, [currentUser?.email, currentUser?.isAdmin]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAuthOpen(true);
    alert("You're LoggedOut Now!");
  };

  // If user is not logged in, enforce AuthModal
  useEffect(() => {
    if (!currentUser) {
      setIsAuthOpen(true);
    }
  }, [currentUser]);

  // Synchronize state when modals close or change
  useEffect(() => {
    if (!isCbcModalOpen || !isSubscriptionOpen || !isAdminOpen) {
      setCurrentUser(getCurrentUser());
    }
  }, [isCbcModalOpen, isSubscriptionOpen, isAdminOpen]);

  // QR Code Deep Link URL Scanner: Detects ?planId=...&planType=... on load or scan
  useEffect(() => {
    const handleQrDeepLink = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('planId');
        const planType = (urlParams.get('planType') || 'cbc').toLowerCase();

        if (planId) {
          console.log(`Detected QR Scan Deep Link for plan: ${planId} (${planType})`);
          const result = await fetchLessonPlanById(planId, planType);
          if (result && result.plan) {
            if (result.type === 'remedial') {
              setSelectedRemedialPlan(result.plan);
              setIsRemedialModalOpen(true);
            } else if (result.type === 'nursery') {
              try {
                localStorage.setItem('nkorera_nursery_plan_saved', JSON.stringify(result.plan));
              } catch {}
              setIsNurseryModalOpen(true);
            } else {
              try {
                localStorage.setItem('nkorera_cbc_plan_saved', JSON.stringify(result.plan));
              } catch {}
              setCbcModalMode('create');
              setIsCbcModalOpen(true);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to process QR deep link:", err);
      }
    };

    handleQrDeepLink();
  }, []);

  // Real-time CAT Clock & Greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const catHour = now.getUTCHours() + 2; // GMT+2 (CAT)
      const adjustedHour = (catHour % 24 + 24) % 24;
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${adjustedHour.toString().padStart(2, '0')}:${minutes}`);

      if (adjustedHour >= 4 && adjustedHour < 12) {
        setCurrentGreeting('Morning');
      } else if (adjustedHour >= 12 && adjustedHour < 17) {
        setCurrentGreeting('Afternoon');
      } else {
        setCurrentGreeting('Evening');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Public Certificate Verification Deep Link Portal
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const verifyId = urlParams.get('id') || urlParams.get('verifyId');
  const ercipient = urlParams.get('ercipient') || urlParams.get('recipient') || '';

  if (verifyId) {
    return <CertificateVerificationPage verifyId={verifyId} ercipient={ercipient} />;
  }

  // Gate check: If user is not authenticated, render the high-end Auth Lock Gateway
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          isForced={true}
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* TOP HEADER & MAIN MENU CONTAINER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-emerald-500/30 shadow-2xl">
        
        {/* 📢 LIVE CLOUD BROADCAST BANNER (WHEN ACTIVE) */}
        {appConfig?.broadcastBannerActive && appConfig?.broadcastBanner && (
          <div className="bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 px-4 py-1.5 text-xs text-white font-extrabold flex items-center justify-between shadow-md overflow-hidden relative">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border border-white/20">
                <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
                Live Broadcast
              </span>
              <span className="truncate text-white font-bold drop-shadow-sm">
                {appConfig.broadcastBanner}
              </span>
            </div>
          </div>
        )}

        {/* ROW 1: PRIMARY NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* BRAND LOGO & TITLE ENCASED IN STYLISH CAPSULE */}
          <div className="relative p-[1.5px] rounded-full sm:rounded-2xl bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 via-amber-500/40 to-emerald-500/40 inline-flex shadow-xl shadow-emerald-950/40 shrink-0">
            <div className="relative z-10 bg-slate-950/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full sm:rounded-[14px] flex items-center gap-2.5 sm:gap-3 border border-slate-800/80">
              <button
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full p-[1.5px] bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                title="Main Menu"
                aria-label="Main Menu"
              >
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  {isMobileMenuOpen ? (
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  ) : (
                    <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  )}
                </div>
              </button>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase">
                    <span className="bg-gradient-to-r from-cyan-300 via-amber-300 via-rose-400 to-emerald-300 bg-clip-text text-transparent animate-gradient-flow-fast font-black">
                      Nkorera Education Portal
                    </span>
                  </h1>
                  <span className="hidden md:inline-flex bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-black px-1.5 py-0.2 rounded-full">
                    {currentYear}
                  </span>
                  <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-emerald-500/30 px-2 py-0.5 rounded-full" title="Security Active">
                    <Shield className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Hardened Security</span>
                  </div>
                </div>
                <p className="text-[9px] sm:text-[11px] font-extrabold tracking-wide">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 via-yellow-300 via-emerald-400 to-amber-400 bg-clip-text text-transparent animate-gradient-flow drop-shadow-sm">
                    Teacher's Lesson Plans
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                
                {/* LIVE QUOTA BADGES */}
                <div className="flex items-center gap-1.5 px-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Used Plans</span>
                    <span className="text-xs font-black text-amber-300">
                      {currentUser.stats?.lessonPlansCount || currentUser.totalGenerated || 0} Plans
                    </span>
                  </div>

                  <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1" />

                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Remaining</span>
                    {currentUser.email === 'nkundimana123theogene@gmail.com' ? (
                      <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        ∞ Unlimited
                      </span>
                    ) : (currentUser.remainingPlans || 0) > 0 ? (
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                        {currentUser.remainingPlans} Plans
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSubWarningMsg('No lesson plans remaining on your account! Please select a subscription package.');
                          setIsSubscriptionOpen(true);
                        }}
                        className="text-[10px] font-black text-rose-400 bg-rose-500/20 hover:bg-rose-500/30 px-2 py-0.5 rounded-lg border border-rose-500/40 animate-pulse flex items-center gap-1 cursor-pointer"
                        title="Click here to upgrade or purchase lesson plans"
                      >
                        <span>0 Remaining (Buy Plans)</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800 hidden sm:block" />

                {/* USER PROFILE INFO */}
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-2 py-1 text-[11px] hidden md:block text-left hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                  title="Click here to manage account or update password"
                >
                  <span className="text-slate-400 block text-[9px] font-black uppercase tracking-wider">Teacher</span>
                  <span className="text-emerald-300 font-bold max-w-[110px] truncate block leading-tight">{currentUser.name}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Create Account / Login</span>
              </button>
            )}

            {/* DARK MODE TOGGLE BUTTON */}
            <button
              onClick={toggleDarkMode}
              className="bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-black text-xs px-2.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="hidden sm:inline font-bold text-[11px] text-amber-200">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline font-bold text-[11px] text-amber-300">Light Mode</span>
                </>
              )}
            </button>

            <a
              href="https://teacherlessonplans.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-emerald-400/40 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Portal &rarr;</span>
              <span className="sm:hidden">Open</span>
            </a>
          </div>

        </div>

        {/* ROW 2: ALL NAVIGATION CATEGORIES ALIGNED ON A HORIZONTAL ROW (KUMURONGO KURI HEADER) */}
        <HeaderNavRow
          currentUser={currentUser}
          activeView={activeView}
          onSelectView={setActiveView}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenFilterServices={() => setIsFilterServicesModalOpen(true)}
          onOpenLessonPlanningHub={() => setIsLessonPlanningHubOpen(true)}
          onOpenCbcModal={(mode) => {
            setCbcModalMode(mode);
            setIsCbcModalOpen(true);
          }}
          onOpenRemedialModal={() => {
            setSelectedRemedialPlan(null);
            setIsRemedialModalOpen(true);
          }}
          onOpenNurseryModal={() => setIsNurseryModalOpen(true)}
          onOpenMyPlans={() => setIsMyPlansOpen(true)}
          onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
          onOpenTeacherResources={(tab) => {
            setTeacherResourcesTab(tab);
            setIsTeacherResourcesOpen(true);
          }}
          onOpenRebBooks={() => setIsRebBooksOpen(true)}
          onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
          onOpenTeacherRecords={(tab) => {
            setTeacherRecordsTab(tab);
            setIsTeacherRecordsOpen(true);
          }}
          onOpenSubscription={() => {
            setSubWarningMsg('');
            setIsSubscriptionOpen(true);
          }}
          onOpenPaymentHistory={() => setIsPaymentHistoryOpen(true)}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenDevProfile={() => setIsDevProfileOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenChatbot={() => setIsChatbotOpen(true)}
          onOpenSavetoAi={() => setIsSavetoAiOpen(true)}
          onOpenHomeworkQuiz={(mode) => {
            setHomeworkQuizMode(mode);
            setIsHomeworkQuizOpen(true);
          }}
          onOpenPrintableWorksheet={() => setIsPrintableWorksheetOpen(true)}
          onOpenMergePdfs={() => setIsMergePdfsOpen(true)}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          onOpenRobotModal={() => setIsRobotModalOpen(true)}
          onOpenStudentId={() => setIsStudentIdOpen(true)}
          onOpenCertificateCreator={() => setIsCertificateCreatorOpen(true)}
        />

        {/* ROW 3: DAZZLING ROTATING & SHIFTING COLOR GREETING & STATUS BANNER */}
        <div className="border-t border-slate-800/80 bg-slate-950/95 px-3 sm:px-6 py-2 relative overflow-hidden">
          
          {/* ROTATING AURORA AMBIENT GLOW */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-rose-500/10 via-amber-500/10 via-cyan-500/10 to-emerald-500/10 animate-gradient-flow pointer-events-none" />
          
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
            
            {/* MULTI-COLOR GREETING CAPSULE */}
            <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-amber-500/40 via-pink-500/40 via-cyan-500/40 to-emerald-500/40 inline-flex shadow-lg shadow-emerald-950/40">
              {/* INNER CIRCULAR CAPSULE CONTENT */}
              <div className="relative z-10 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-800/80">
                {/* SMALL CIRCLE ICON */}
                <div className="w-5 h-5 rounded-full p-[1px] bg-gradient-to-r from-amber-400 to-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                </div>

                {/* GREETING TEXT */}
                <h2 className="text-xs sm:text-sm font-black tracking-tight flex flex-wrap items-center gap-1.5 drop-shadow-md">
                  <span className="bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent font-black">
                    Good {currentGreeting},
                  </span>
                  <span className="bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent font-black">
                    Teacher!
                  </span>
                  <span className="text-slate-200 font-extrabold">
                    Welcome To
                  </span>
                  <span className="bg-gradient-to-r from-cyan-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent font-extrabold tracking-wide">
                    Nkorera Education Portal!
                  </span>
                </h2>
              </div>
            </div>

            {/* LIVE PORTAL TIME BADGE */}
            <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-emerald-500/40 to-cyan-500/40 inline-flex self-start sm:self-auto shrink-0 shadow-md">
              <div className="relative z-10 bg-slate-950/95 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300 border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{currentTime ? `CAT ${currentTime}` : 'LIVE PORTAL'}</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* NKORERA DASHBOARD DRAWER HIERARCHICAL NAVIGATION */}
      <DashboardDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenFilterServices={() => setIsFilterServicesModalOpen(true)}
        onOpenLessonPlanningHub={() => setIsLessonPlanningHubOpen(true)}
        onOpenCbcModal={(mode) => {
          setCbcModalMode(mode);
          setIsCbcModalOpen(true);
        }}
        onOpenRemedialModal={() => {
          setSelectedRemedialPlan(null);
          setIsRemedialModalOpen(true);
        }}
        onOpenMyPlans={() => setIsMyPlansOpen(true)}
        onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
        onOpenTeacherResources={(tab) => {
          setTeacherResourcesTab(tab);
          setIsTeacherResourcesOpen(true);
        }}
        onOpenRebBooks={() => setIsRebBooksOpen(true)}
        onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
        onOpenTeacherRecords={(tab) => {
          setTeacherRecordsTab(tab);
          setIsTeacherRecordsOpen(true);
        }}
        onOpenSubscription={() => {
          setSubWarningMsg('');
          setIsSubscriptionOpen(true);
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDevProfile={() => setIsDevProfileOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenSavetoAi={() => setIsSavetoAiOpen(true)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenHomeworkQuiz={(mode) => {
          setHomeworkQuizMode(mode);
          setIsHomeworkQuizOpen(true);
        }}
        onOpenPrintableWorksheet={() => setIsPrintableWorksheetOpen(true)}
        onOpenMergePdfs={() => setIsMergePdfsOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenClassDiary={() => setIsClassDiaryOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenStudentId={() => setIsStudentIdOpen(true)}
        onOpenRobotModal={() => setIsRobotModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* MAIN BODY CONTENT */}
      <main className="flex-1 w-full px-2 sm:px-4 pt-3 pb-8 flex flex-col justify-start items-center">
        {activeView === 'dashboard' && (
          <div className="w-full max-w-7xl mx-auto space-y-6">
            <DashboardOverviewView
              currentUser={currentUser}
              onSelectView={setActiveView}
              onOpenCbcModal={(mode) => {
                setCbcModalMode(mode);
                setIsCbcModalOpen(true);
              }}
              onOpenSchemeOfWork={() => setIsSchemeOfWorkOpen(true)}
              onOpenRemedialModal={() => {
                setSelectedRemedialPlan(null);
                setIsRemedialModalOpen(true);
              }}
              onOpenNurseryModal={() => setIsNurseryModalOpen(true)}
              onOpenMyPlans={() => setIsMyPlansOpen(true)}
              onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
              onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
              onOpenTeacherResources={(tab) => {
                if (tab) setTeacherResourcesTab(tab);
                setIsTeacherResourcesOpen(true);
              }}
              onOpenRebBooks={() => setIsRebBooksOpen(true)}
              onOpenTeacherRecords={(tab) => {
                if (tab) setTeacherRecordsTab(tab);
                setIsTeacherRecordsOpen(true);
              }}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
              onOpenHelp={() => setIsHelpOpen(true)}
              onOpenChatbot={() => setIsChatbotOpen(true)}
              onOpenSavetoAi={() => setIsSavetoAiOpen(true)}
              onOpenDirectory={() => setIsDirectoryOpen(true)}
              onOpenHomeworkQuiz={(mode) => {
                setHomeworkQuizMode(mode);
                setIsHomeworkQuizOpen(true);
              }}
              onOpenPrintableWorksheet={() => setIsPrintableWorksheetOpen(true)}
              onOpenMergePdfs={() => setIsMergePdfsOpen(true)}
              onOpenPresentation={() => setIsPresentationOpen(true)}
              onOpenCertificateCreator={() => setIsCertificateCreatorOpen(true)}
              onOpenStudentId={() => setIsStudentIdOpen(true)}
              isOnline={isNetworkOnline}
              onOpenRobotModal={() => setIsRobotModalOpen(true)}
            />

          </div>
        )}

        {activeView === 'lessonPlanning' && (
          <LessonPlanningPageView
            onOpenCbcModal={(mode) => {
              setCbcModalMode(mode);
              setIsCbcModalOpen(true);
            }}
            onOpenSchemeOfWork={() => setIsSchemeOfWorkOpen(true)}
            onOpenNurseryModal={() => setIsNurseryModalOpen(true)}
            onOpenRemedialModal={() => {
              setSelectedRemedialPlan(null);
              setIsRemedialModalOpen(true);
            }}
            onOpenMyPlans={() => setIsMyPlansOpen(true)}
            onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
            onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
            onOpenTeacherResources={(tab) => {
              setTeacherResourcesTab(tab);
              setIsTeacherResourcesOpen(true);
            }}
            onOpenHomeworkQuiz={(mode) => {
              setHomeworkQuizMode(mode);
              setIsHomeworkQuizOpen(true);
            }}
            onOpenPrintableWorksheet={() => setIsPrintableWorksheetOpen(true)}
            onOpenMergePdfs={() => setIsMergePdfsOpen(true)}
            onOpenPresentation={() => setIsPresentationOpen(true)}
            onOpenStudentId={() => setIsStudentIdOpen(true)}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'teacherResources' && (
          <TeacherResourcesPageView
            initialTab={teacherResourcesTab}
            onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
            onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
            onOpenMergePdfs={() => setIsMergePdfsOpen(true)}
            onOpenPresentation={() => setIsPresentationOpen(true)}
            onOpenCbcModal={(mode) => {
              setCbcModalMode(mode);
              setIsCbcModalOpen(true);
            }}
            onOpenHomeworkQuiz={(mode) => {
              setHomeworkQuizMode(mode);
              setIsHomeworkQuizOpen(true);
            }}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'rebBooks' && (
          <RebBooksPageView
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'myRecords' && (
          <TeacherRecordsPageView
            initialTab={teacherRecordsTab}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'subscription' && (
          <SubscriptionPageView
            currentUser={currentUser}
            onOpenSubscriptionModal={() => setIsSubscriptionOpen(true)}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'helpSupport' && (
          <HelpSupportPageView
            onOpenHelpModal={() => setIsHelpOpen(true)}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}
      </main>

      {/* PREMIUM MODERN FOOTER */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 pt-20 pb-10 px-6 mt-auto relative z-10 overflow-hidden">
        {/* SUBTLE BACKGROUND EFFECTS */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* BRANDING & IDENTITY */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight leading-none">NKORERA</h3>
                  <p className="text-[10px] font-black text-emerald-500 tracking-[0.25em] uppercase mt-1.5 opacity-80">Education Portal</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Empowering Rwandan teachers with next-generation CBC Lesson Planning tools, Remedial resources, and a comprehensive REB Digital Library.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                  <span className="text-[10px] font-black">FB</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                  <span className="text-[10px] font-black">TW</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer">
                  <span className="text-[10px] font-black">IG</span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & NAV */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] border-l-2 border-emerald-500 pl-4">System Access</h4>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setIsDirectoryOpen(true)}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all shadow-inner">
                    <LayoutGrid className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-300 block group-hover:text-white transition-colors">Feature Directory</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">All App Controls</span>
                  </div>
                </button>
                
                {currentUser?.email === 'nkundimana123theogene@gmail.com' && (
                  <button 
                    onClick={() => setIsAdminOpen(true)}
                    className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-all shadow-inner">
                      <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-slate-300 block group-hover:text-white transition-colors">Admin Portal</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">System Management</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* SUPPORT & CONTACT */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] border-l-2 border-emerald-500 pl-4">Help & Connect</h4>
              <div className="flex flex-col gap-4">
                <a 
                  href={`https://wa.me/${appConfig?.whatsappNumber || '250781339530'}?text=Mwaramutse%20Nkorera%20Education%20App`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/10">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest block mb-1">24/7 WhatsApp</span>
                    <span className="text-sm font-black text-white tracking-tight">{appConfig?.whatsappNumber || '0781339530'}</span>
                  </div>
                </a>

                <button 
                  onClick={() => setIsChatbotOpen(true)}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group text-left w-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all shadow-inner">
                    <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-300 block group-hover:text-white transition-colors">AI Assistant</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Instant Guidance</span>
                  </div>
                </button>
              </div>
            </div>

            {/* PLATFORM METRICS */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.25em] border-l-2 border-emerald-500 pl-4">Platform Info</h4>
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-40" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Systems Online</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Server Stability</span>
                    <span className="text-emerald-400">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-gradient-to-r from-emerald-600 to-teal-400" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Version {currentYear}.1</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">PRO</span>
                </div>
              </div>
            </div>
          </div>

          {/* MOVING TICKER / MARQUEE BANNER */}
          <div className="w-full overflow-hidden bg-slate-900/90 border border-slate-800/80 rounded-2xl py-3 px-4 shadow-inner relative my-4 group">
            <div className="animate-marquee-smooth flex whitespace-nowrap gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                © {currentYear} Nkorera Education Portal • Excellence in Pedagogy • Made for Rwandan Teachers
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                © {currentYear} Nkorera Education Portal • Excellence in Pedagogy • Made for Rwandan Teachers
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                © {currentYear} Nkorera Education Portal • Excellence in Pedagogy • Made for Rwandan Teachers
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                © {currentYear} Nkorera Education Portal • Excellence in Pedagogy • Made for Rwandan Teachers
              </span>
            </div>
          </div>

          {/* BOTTOM LEGAL BAR */}
          <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <button onClick={() => openInfoTab('policy')} className="text-[10px] text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest transition-all cursor-pointer">
                🛡️ Privacy & Policy
              </button>
              <button onClick={() => openInfoTab('about')} className="text-[10px] text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest transition-all cursor-pointer">
                ℹ️ About Us
              </button>
              <button onClick={() => openInfoTab('contact')} className="text-[10px] text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest transition-all cursor-pointer">
                📞 Contact Us
              </button>
              <button onClick={() => openInfoTab('settings')} className="text-[10px] text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest transition-all cursor-pointer">
                ⚙️ Settings
              </button>
              <button onClick={() => openInfoTab('faq')} className="text-[10px] text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest transition-all cursor-pointer">
                ❓ FAQ
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ALL MODAL DIALOGS */}
      <CbcLessonPlanModal
        isOpen={isCbcModalOpen}
        onClose={() => setIsCbcModalOpen(false)}
        initialMode={cbcModalMode}
        onRequireSubscription={(warningMsg) => {
          setSubWarningMsg(warningMsg);
          setIsSubscriptionOpen(true);
        }}
      />

      <ClassDiaryModal
        isOpen={isClassDiaryOpen}
        onClose={() => setIsClassDiaryOpen(false)}
      />

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <StudentIdentificationModal
        isOpen={isStudentIdOpen}
        onClose={() => setIsStudentIdOpen(false)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        currentUser={currentUser}
      />

      <NurseryLessonPlanModal
        isOpen={isNurseryModalOpen}
        onClose={() => setIsNurseryModalOpen(false)}
        onOpenSubscription={() => {
          setSubWarningMsg('');
          setIsSubscriptionOpen(true);
        }}
        onRequireSubscription={(warningMsg) => {
          setSubWarningMsg(warningMsg);
          setIsSubscriptionOpen(true);
        }}
      />

      <MyLessonPlansModal
        isOpen={isMyPlansOpen}
        onClose={() => setIsMyPlansOpen(false)}
        onSelectPlan={(selectedPlan) => {
          try {
            localStorage.setItem('nkorera_cbc_active_lesson_plan_v3', JSON.stringify(selectedPlan));
          } catch {
            // ignore
          }
          setCbcModalMode('edit');
          setIsCbcModalOpen(true);
          setIsMyPlansOpen(false);
        }}
        onSelectRemedialPlan={(selectedPlan) => {
          setSelectedRemedialPlan(selectedPlan);
          setIsRemedialModalOpen(true);
          setIsMyPlansOpen(false);
        }}
        onSelectNurseryPlan={(selectedPlan) => {
          try {
            localStorage.setItem('nkorera_active_nursery_plan', JSON.stringify(selectedPlan));
          } catch {
            // ignore
          }
          setIsNurseryModalOpen(true);
          setIsMyPlansOpen(false);
        }}
      />

      <RemedialLessonPlanModal onRequireSubscription={(warningMsg) => { setSubWarningMsg(warningMsg); setIsSubscriptionOpen(true); }}
        isOpen={isRemedialModalOpen}
        onClose={() => setIsRemedialModalOpen(false)}
        userEmail={currentUser?.email || ""}
        initialPlan={selectedRemedialPlan}
        onSaved={() => {}}
      />

      <SubscriptionStatusModal
        isOpen={isSubscriptionOpen}
        onClose={() => {
          setIsSubscriptionOpen(false);
          setSubWarningMsg('');
        }}
        userEmail={currentUser?.email || ""}
        userName={currentUser?.name || "Teacher"}
        warningMessage={subWarningMsg}
        onSubscriptionActivated={(category) => {
          const freshUser = getCurrentUser();
          if (freshUser) {
            setCurrentUser(freshUser);
          }
          if (category === 'CBC') {
            setIsCbcModalOpen(true);
          } else if (category === 'SCHEME') {
            setIsSchemeOfWorkOpen(true);
          } else if (category === 'NURSERY') {
            setIsNurseryModalOpen(true);
          } else if (category === 'REMEDIAL') {
            setIsRemedialModalOpen(true);
          } else if (category === 'AI') {
            setIsHomeworkQuizOpen(true);
          }
        }}
        onOpenPaymentHistory={() => setIsPaymentHistoryOpen(true)}
      />

      <PaymentHistoryModal
        isOpen={isPaymentHistoryOpen}
        onClose={() => setIsPaymentHistoryOpen(false)}
        userEmail={currentUser?.email || ""}
        userPhone={currentUser?.phone || currentUser?.momoNumber || ""}
        userName={currentUser?.name || "Teacher"}
        currentUser={currentUser}
        onOpenSubscription={() => {
          setIsPaymentHistoryOpen(false);
          setIsSubscriptionOpen(true);
        }}
      />

      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        currentUser={currentUser}
        onOpenPaymentHistory={() => {
          setIsNotificationCenterOpen(false);
          setIsPaymentHistoryOpen(true);
        }}
      />

      {/* LIVE PAYMENT INCOMING TOAST BANNER */}
      {livePaymentToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black">
                <Bell className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  {livePaymentToast.title}
                </h4>
                {livePaymentToast.amount && (
                  <div className="text-sm font-black text-white">
                    +{livePaymentToast.amount.toLocaleString()} RWF
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setLivePaymentToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-200 mt-2 font-medium leading-tight">
            {livePaymentToast.message}
          </p>
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-800 pt-2 text-[10px]">
            <span className="text-emerald-300 font-bold">🟢 Lesson Plans Unlocked Instantly!</span>
            <button
              onClick={() => {
                setLivePaymentToast(null);
                setIsNotificationCenterOpen(true);
              }}
              className="text-amber-400 hover:underline font-bold"
            >
              View Notification &rarr;
            </button>
          </div>
        </div>
      )}

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminEmail={currentUser?.email || ''}
      />

      <LessonPlanningHubModal
        isOpen={isLessonPlanningHubOpen}
        onClose={() => setIsLessonPlanningHubOpen(false)}
        onOpenCbcModal={(mode) => {
          setCbcModalMode(mode);
          setIsCbcModalOpen(true);
        }}
        onOpenSchemeOfWork={() => setIsSchemeOfWorkOpen(true)}
        onOpenRemedialModal={() => {
          setSelectedRemedialPlan(null);
          setIsRemedialModalOpen(true);
        }}
        onOpenNurseryModal={() => setIsNurseryModalOpen(true)}
        onOpenMyPlans={() => setIsMyPlansOpen(true)}
        onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
        onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
        onOpenTeacherResources={(tab) => {
          setTeacherResourcesTab(tab);
          setIsTeacherResourcesOpen(true);
        }}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenStudentId={() => setIsStudentIdOpen(true)}
      />

      <PresentationSlidesModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        currentUser={currentUser}
        onRequireSubscription={(warningMsg: string) => {
          setSubWarningMsg(warningMsg);
          setIsSubscriptionOpen(true);
        }}
      />

      <SchemeOfWorkModal
        isOpen={isSchemeOfWorkOpen}
        onClose={() => setIsSchemeOfWorkOpen(false)}
      />

      <HomeworkClassworkQuizModal
        isOpen={isHomeworkQuizOpen}
        onClose={() => setIsHomeworkQuizOpen(false)}
        currentUser={currentUser}
        initialMode={homeworkQuizMode}
        onRequireSubscription={(warningMsg: string) => {
          setSubWarningMsg(warningMsg);
          setIsSubscriptionOpen(true);
        }}
      />

      <PrintableWorksheetModal
        isOpen={isPrintableWorksheetOpen}
        onClose={() => setIsPrintableWorksheetOpen(false)}
        currentUser={currentUser}
        onRequireSubscription={(warningMsg: string) => {
          setSubWarningMsg(warningMsg);
          setIsSubscriptionOpen(true);
        }}
      />

      <MergePdfsModal
        isOpen={isMergePdfsOpen}
        onClose={() => setIsMergePdfsOpen(false)}
      />

      <TeacherBookModal 
        isOpen={isTeacherBookOpen} 
        onClose={() => setIsTeacherBookOpen(false)} 
        onOpenCertificateCreator={() => setIsCertificateCreatorOpen(true)}
      />

      <TeacherResourcesModal
        isOpen={isTeacherResourcesOpen}
        onClose={() => setIsTeacherResourcesOpen(false)}
        initialTab={teacherResourcesTab}
        onOpenCbcModal={(mode) => {
          setCbcModalMode(mode);
          setIsCbcModalOpen(true);
        }}
        onOpenHomeworkQuiz={(mode) => {
          setHomeworkQuizMode(mode);
          setIsHomeworkQuizOpen(true);
        }}
      />

      <TeacherRecordsModal
        isOpen={isTeacherRecordsOpen}
        onClose={() => setIsTeacherRecordsOpen(false)}
        initialTab={teacherRecordsTab}
      />

      <RebBooksModal 
        isOpen={isRebBooksOpen} 
        onClose={() => setIsRebBooksOpen(false)} 
      />

      <ProfessionalBookModal 
        isOpen={isProfessionalBookOpen} 
        onClose={() => setIsProfessionalBookOpen(false)} 
      />

      <AiCertificateCreatorModal
        isOpen={isCertificateCreatorOpen}
        onClose={() => setIsCertificateCreatorOpen(false)}
      />

      <DevProfileModal 
        isOpen={isDevProfileOpen} 
        onClose={() => setIsDevProfileOpen(false)} 
      />

      <InstallModal 
        isOpen={isInstallOpen} 
        onClose={() => setIsInstallOpen(false)} 
        deferredPrompt={deferredPrompt}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallDirect={installPWA}
        onDownloadShortcut={downloadDesktopShortcut}
      />

      <HelpCenterModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />

      <FeatureDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectAction={(action) => {
          action();
          setIsDirectoryOpen(false);
        }}
        onOpenCbcModal={(mode) => {
          setCbcModalMode(mode);
          setIsCbcModalOpen(true);
        }}
        onOpenSchemeOfWork={() => setIsSchemeOfWorkOpen(true)}
        onOpenRemedialModal={() => {
          setSelectedRemedialPlan(null);
          setIsRemedialModalOpen(true);
        }}
        onOpenNurseryModal={() => setIsNurseryModalOpen(true)}
        onOpenMyPlans={() => setIsMyPlansOpen(true)}
        onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
        onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
        onOpenTeacherResources={(tab) => {
          setTeacherResourcesTab(tab);
          setIsTeacherResourcesOpen(true);
        }}
        onOpenRebBooks={() => setIsRebBooksOpen(true)}
        onOpenTeacherRecords={(tab) => {
          setTeacherRecordsTab(tab);
          setIsTeacherRecordsOpen(true);
        }}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDevProfile={() => setIsDevProfileOpen(true)}
        onOpenSavetoAi={() => setIsSavetoAiOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenInfoTab={openInfoTab}
      />

      <AiChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />

      <SavetoAiModal
        isOpen={isSavetoAiOpen}
        onClose={() => setIsSavetoAiOpen(false)}
        onOpenCbcModal={(mode) => {
          setCbcModalMode(mode);
          setIsCbcModalOpen(true);
        }}
        onOpenHomeworkQuiz={(mode) => {
          setHomeworkQuizMode(mode);
          setIsHomeworkQuizOpen(true);
        }}
      />

      {/* 🔍 FILTER ANY SERVICES YOU NEED IN THIS WEBSITE MODAL */}
      <FilterServicesModal
        isOpen={isFilterServicesModalOpen}
        onClose={() => setIsFilterServicesModalOpen(false)}
        currentUser={currentUser}
        onOpenCbcModal={(mode) => {
          setCbcModalMode(mode);
          setIsCbcModalOpen(true);
        }}
        onOpenRemedialModal={() => {
          setSelectedRemedialPlan(null);
          setIsRemedialModalOpen(true);
        }}
        onOpenNurseryModal={() => setIsNurseryModalOpen(true)}
        onOpenLessonPlanningHub={() => setIsLessonPlanningHubOpen(true)}
        onOpenMyPlans={() => setIsMyPlansOpen(true)}
        onOpenTeacherBook={() => setIsTeacherBookOpen(true)}
        onOpenTeacherResources={(tab) => {
          setTeacherResourcesTab(tab);
          setIsTeacherResourcesOpen(true);
        }}
        onOpenRebBooks={() => setIsRebBooksOpen(true)}
        onOpenProfessionalBook={() => setIsProfessionalBookOpen(true)}
        onOpenTeacherRecords={(tab) => {
          setTeacherRecordsTab(tab);
          setIsTeacherRecordsOpen(true);
        }}
        onOpenSubscription={() => {
          setSubWarningMsg('');
          setIsSubscriptionOpen(true);
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDevProfile={() => setIsDevProfileOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenSavetoAi={() => setIsSavetoAiOpen(true)}
        onOpenHomeworkQuiz={(mode) => {
          setHomeworkQuizMode(mode);
          setIsHomeworkQuizOpen(true);
        }}
        onOpenPrintableWorksheet={() => setIsPrintableWorksheetOpen(true)}
        onOpenMergePdfs={() => setIsMergePdfsOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenRobotModal={() => setIsRobotModalOpen(true)}
        onOpenStudentId={() => setIsStudentIdOpen(true)}
        onOpenCertificateCreator={() => setIsCertificateCreatorOpen(true)}
      />

      <PolicyTermsModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        initialTab={policyInitialTab}
      />

      <AuthModal
        isOpen={isAuthOpen}
        isForced={!currentUser}
        onClose={() => {
          if (currentUser) {
            setIsAuthOpen(false);
          }
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* 🤖 OFFLINE ROBOT ASSISTANT MODAL (ROBOTIC VOICE & MOVEMENT) */}
      <OfflineRobotAssistantModal
        isOpen={isRobotModalOpen}
        onClose={() => setIsRobotModalOpen(false)}
        isOnline={isNetworkOnline}
        onRetryConnection={async () => {
          const online = typeof navigator !== 'undefined' ? navigator.onLine : false;
          setIsNetworkOnline(online);
          return online;
        }}
      />

      {/* 🤖 FLOATING INTERACTIVE ROBOT BUDDY TRIGGER (WHEN OFFLINE) */}
      <FloatingOfflineRobotTrigger
        isOnline={isNetworkOnline}
        onOpenRobotModal={() => setIsRobotModalOpen(true)}
      />

      {/* 🚀 AUTOMATIC ONLINE SUCCESS RESTORATION TOAST ("BYAKUNZE! YOU'RE ONLINE NOW!") */}
      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            key="app-online-toast"
            initial={{ opacity: 0, y: -70, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-400/80 rounded-2xl p-4 shadow-[0_0_40px_rgba(16,185,129,0.4)] backdrop-blur-xl flex items-center justify-between gap-3 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-inner">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    Connection Restored
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-emerald-100 leading-snug">
                  Good Job! Now You're Online!
                </h4>
                <p className="text-[11px] text-emerald-300/80 font-medium">
                  Internet connection successfully restored • All features are active.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOnlineToast(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 REAL-TIME AUTOMATIC LOGIN DETECTED TOAST (FOR ADMIN / OWNER) */}
      <AnimatePresence>
        {liveLoginAlert && (
          <motion.div
            key="app-live-login-alert-toast"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 right-4 sm:right-6 z-50 w-[92%] sm:w-96 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-400 rounded-2xl p-4 shadow-[0_10px_40px_rgba(16,185,129,0.35)] backdrop-blur-xl text-white"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                  <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      🟢 LIVE LOGIN DETECTED
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white leading-tight">
                    {liveLoginAlert.userName}
                  </h4>
                  <p className="text-[11px] text-emerald-200/90 font-mono break-all">
                    {liveLoginAlert.userEmail}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Just logged into the system &bull; {new Date(liveLoginAlert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiveLoginAlert(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/80 font-bold">
                Automatically Live Synced
              </span>
              <button
                onClick={() => {
                  setLiveLoginAlert(null);
                  setIsAdminOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow transition-transform active:scale-95"
              >
                <span>View in Admin Panel</span>
                &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING SIDE ACTION DOCK (SAVETO AI, CHATBOT & WHATSAPP - SEPARATED ON THE SIDE) */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3.5 pointer-events-none">
        
        {/* 1. SAVETO AI STUDIO (TEACHER RESOURCES AI CO-PILOT - ORANGE/AMBER THEME) */}
        <button
          onClick={() => setIsSavetoAiOpen(true)}
          className="pointer-events-auto group relative flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Saveto AI Studio - Teacher Resources"
        >
          {/* Tooltip Label */}
          <div className="absolute right-full mr-4 px-3.5 py-1.5 bg-slate-900/95 border border-orange-500/40 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.35)] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0 pointer-events-none whitespace-nowrap flex items-center gap-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <div>
              <span className="text-[11px] font-black bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent uppercase tracking-wider block">
                Saveto AI Studio
              </span>
              <span className="text-[9px] text-slate-300 font-semibold block">
                Teacher AI Resources & Scaffolding (EN • RW • FR • SW)
              </span>
            </div>
          </div>

          {/* Button Capsule */}
          <div className="relative w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 p-[2px] shadow-[0_0_25px_rgba(249,115,22,0.5)] group-hover:shadow-[0_0_40px_rgba(249,115,22,0.8)] transition-all duration-300 hover:scale-110 active:scale-95">
            <div className="absolute inset-0 rounded-full border border-white/40 border-dashed animate-[spin_10s_linear_infinite]" />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 flex items-center justify-center relative overflow-hidden shadow-inner border border-orange-400/40">
              <div className="absolute inset-0 bg-orange-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Sparkles className="w-6 h-6 text-amber-300 drop-shadow-md relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </button>

        {/* 2. NKORERA AI CHATBOT (TEACHER ASSISTANT - CYAN/EMERALD AI THEME) */}
        <button 
          onClick={() => setIsChatbotOpen(true)}
          className="pointer-events-auto group relative flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Nkorera AI Chatbot - Teacher Assistant"
        >
          {/* Tooltip Label */}
          <div className="absolute right-full mr-4 px-3.5 py-1.5 bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0 pointer-events-none whitespace-nowrap flex items-center gap-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-[11px] font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent uppercase tracking-wider block">
                Nkorera AI Chatbot
              </span>
              <span className="text-[9px] text-slate-300 font-semibold block">
                Teacher Assistant • Ask AI in English & More
              </span>
            </div>
          </div>

          {/* Button Capsule */}
          <div className="relative w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 via-cyan-400 to-emerald-500 p-[2px] shadow-[0_0_30px_rgba(16,185,129,0.6)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.9)] transition-all duration-300 hover:scale-110 active:scale-95">
            <div className="absolute inset-0 rounded-full border border-white/50 border-dashed animate-[spin_6s_linear_infinite]" />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center relative overflow-hidden shadow-inner border border-emerald-400/40">
              <div className="absolute inset-0 bg-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </button>

        {/* 3. WHATSAPP SUPPORT (DIRECT CUSTOMER SUPPORT - GREEN THEME) */}
        <a 
          href={`https://wa.me/${appConfig?.whatsappNumber || '250781339530'}?text=Hello%20Nkorera%20Education%20Team`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto group relative flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="WhatsApp Support"
        >
          {/* Tooltip Label */}
          <div className="absolute right-full mr-4 px-3.5 py-1.5 bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.35)] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0 pointer-events-none whitespace-nowrap flex items-center gap-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block">
                WhatsApp Support
              </span>
              <span className="text-[9px] text-slate-300 font-semibold block">
                {appConfig?.whatsappNumber || '0781339530'} • Online 24/7
              </span>
            </div>
          </div>
          
          {/* Button Capsule */}
          <div className="relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-300 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] transition-all duration-300 hover:scale-110 active:scale-95">
            <div className="absolute inset-0 rounded-full border border-white/40 border-dashed animate-[spin_8s_linear_infinite]" />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <MessageSquare className="w-6 h-6 text-white drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </a>

      </div>
    </div>
  );
}

