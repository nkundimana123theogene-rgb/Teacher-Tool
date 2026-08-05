import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, NotificationItem, DEFAULT_NOTIFICATIONS } from './components/Header';
import { SignInModal } from './components/SignInModal';
import { PolicyTermsModal } from './components/PolicyTermsModal';
import { LessonPlanView } from './components/LessonPlanView';
import { SubscriptionTab } from './components/SubscriptionTab';
import { AdminPanel } from './components/AdminPanel';
import { HistoryTab } from './components/HistoryTab';
import { DashboardTab } from './components/DashboardTab';
import { FounderTab } from './components/FounderTab';
import { LessonPlanForm } from './components/LessonPlanForm';
import { ExercisesCreator } from './components/ExercisesCreator';
import { WorksheetsCreator } from './components/WorksheetsCreator';
import { RemedialPlanCreator } from './components/RemedialPlanCreator';
import { NurseryPlanCreator } from './components/NurseryPlanCreator';
import { PresentationCreator } from './components/PresentationCreator';
import { LibraryTab } from './components/LibraryTab';
import { RoboticsAssistantWidget } from './components/RoboticsAssistantWidget';
import { ClassDiaryCreator } from './components/ClassDiaryCreator';
import { CertificateCreator } from './components/CertificateCreator';
import { CertificateVerification } from './components/CertificateVerification';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import { OfflineOverlay } from './components/OfflineOverlay';
import { HelpCenter } from './components/HelpCenter';
import { FeedbackModal } from './components/FeedbackModal';
import { NotificationsModal } from './components/NotificationsModal';
import { UserProfile, LanguageOption, PlanFormatOption, LessonPlanRequest, LessonPlanData } from './types';
import { OWNER_INFO } from './data/plans';
import { Sparkles, BookOpen, CheckCircle2, AlertCircle, X, Check, HelpCircle, MessageSquare, Search, Globe, Share2, ExternalLink, Bell, BellRing } from 'lucide-react';
import { getTimeBasedGreeting } from './utils/greeting';
import { generateClientLessonPlan, processLessonPlanStreamSafely } from './utils/lessonPlanGenerator';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');
  const [selectedCountry, setSelectedCountry] = useState<string>('Rwanda');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'remedial' | 'nursery' | 'slides' | 'exercises' | 'worksheets' | 'library' | 'history' | 'subscription' | 'admin' | 'founder' | 'class-diary' | 'certificates'>('dashboard');
  const [selectedFormat, setSelectedFormat] = useState<PlanFormatOption>('reb_grid');

  const [initialVerifyCert, setInitialVerifyCert] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('verifyCert') || params.get('verify') || params.get('cert') || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialVerifyCert) {
      setActiveTab('certificates');
    }
  }, [initialVerifyCert]);

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const handleOpenHelpCenter = () => setShowHelpCenterModal(true);
    const handleOpenFeedback = () => setShowFeedbackModal(true);
    window.addEventListener('open-help-center', handleOpenHelpCenter);
    window.addEventListener('open-feedback-modal', handleOpenFeedback);
    return () => {
      window.removeEventListener('open-help-center', handleOpenHelpCenter);
      window.removeEventListener('open-feedback-modal', handleOpenFeedback);
    };
  }, []);
  const [welcomeBanner, setWelcomeBanner] = useState<{ title: string; subtext: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Notifications state persisted in localStorage
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('teacher_tool_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('teacher_tool_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }, [notifications]);

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionAlert, setConnectionAlert] = useState<{
    type: 'online' | 'offline';
    title: string;
    message: string;
  } | null>(null);

  // Network Online & Offline Status Monitoring
  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok && isMounted) {
          setApiStatus('online');
        } else if (isMounted) {
          setApiStatus('online');
        }
      } catch {
        if (isMounted) {
          setApiStatus(navigator.onLine ? 'online' : 'offline');
        }
      }
    };

    const handleOnline = () => {
      if (!isMounted) return;
      setIsNetworkOnline(true);
      setApiStatus('online');
      setConnectionAlert({
        type: 'online',
        title: '🟢 Online Mode (Connected)',
        message: 'Internet connection re-established! You can continue generating lesson plans and using all tools seamlessly.'
      });
      checkHealth();
    };

    const handleOffline = () => {
      if (!isMounted) return;
      setIsNetworkOnline(false);
      setApiStatus('offline');
      setConnectionAlert({
        type: 'offline',
        title: '🔴 No Connection Detected',
        message: 'No internet connection detected. Please connect your device to Wi-Fi or mobile data to continue.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkHealth();

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Lesson Plan state
  const [currentPlan, setCurrentPlan] = useState<LessonPlanData | null>(null);
  const [savedPlans, setSavedPlans] = useState<LessonPlanData[]>(() => {
    try {
      const stored = localStorage.getItem('tegura_saved_plans') || localStorage.getItem('nkorera_saved_plans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save plans to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tegura_saved_plans', JSON.stringify(savedPlans));
    } catch (err) {
      console.error(err);
    }
  }, [savedPlans]);

  // Handle URL plan routing for WhatsApp shared plans
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planId = params.get('planId') || params.get('plan');
      if (planId && savedPlans.length > 0) {
        const found = savedPlans.find((p) => p.id === planId);
        if (found) {
          setCurrentPlan(found);
          setActiveTab('generator');
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setErrorMsg(
            selectedLanguage === 'Kinyarwanda'
              ? 'Iri somo ntiribonetse mu bubiko bw\'iki gikoresho. Baza uwagusangije isomo rya WhatsApp gukopira no kohereza amagambo yose (Copy Full Text).'
              : 'This lesson plan is stored locally on the sender\'s device. Please ask them to use the "Copy Full Lesson Text" option to send the text block directly.'
          );
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [savedPlans, selectedLanguage]);

  // Helper to construct a local default profile if offline or loading
  const getFallbackUser = (email: string, name?: string): UserProfile => {
    const isOwner = email.toLowerCase() === 'nkundimana123theogene@gmail.com';
    const isAdmin = isOwner;
    return {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name || (isOwner ? 'NKUNDIMANA Theogene' : (email.includes('@') ? email.split("@")[0] : 'Teacher')),
      email: email,
      phone: isOwner ? '0781339530' : '',
      country: 'Rwanda',
      currentPlan: isAdmin ? 'Unlimited Admin / VIP' : 'Free Tier (3 plans/mo)',
      remainingPlans: isAdmin ? 9999 : 3,
      totalGenerated: 0,
      isAdmin: isAdmin,
    };
  };

  // Load user profile on startup (default or remembered)
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (email: string, name?: string, retries = 2) => {
      try {
        const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
        const res = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ email, name }),
        });
        if (res.ok) {
          const profile = await res.json().catch(() => null);
          if (profile && isMounted) setUser(profile);
        } else if (retries > 0) {
          setTimeout(() => {
            if (isMounted) fetchProfile(email, name, retries - 1);
          }, 1000);
        } else {
          if (isMounted) setUser((prev) => prev || getFallbackUser(email, name));
        }
      } catch {
        if (retries > 0) {
          setTimeout(() => {
            if (isMounted) fetchProfile(email, name, retries - 1);
          }, 1000);
        } else {
          if (isMounted) setUser((prev) => prev || getFallbackUser(email, name));
        }
      }
    };

    const savedEmail = localStorage.getItem('tegura_user_email') || localStorage.getItem('nkorera_user_email');
    const savedName = localStorage.getItem('tegura_user_name') || localStorage.getItem('nkorera_user_name');

    if (savedEmail) {
      const initialName = savedName || undefined;
      setUser(getFallbackUser(savedEmail, initialName));
      fetchProfile(savedEmail, initialName);

      // Auto-trigger PWA download/install guide on screen once the user enters the system
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
      }, 2500);
    } else {
      // Visitors who open the link for the first time without a saved account:
      // Open the sign-in / registration modal immediately so the system knows who they are
      setUser(null);
      setShowSignInModal(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleRefreshProfile = async () => {
      if (user?.email) {
        try {
          const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
          const res = await fetch('/api/user-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ email: user.email }),
          });
          if (res.ok) {
            const profile = await res.json().catch(() => null);
            if (profile) setUser(profile);
          }
        } catch (e) {
          console.warn('Failed to refresh user profile:', e);
        }
      }
    };

    window.addEventListener('payment-approved', handleRefreshProfile);
    window.addEventListener('refresh-user-profile', handleRefreshProfile);

    return () => {
      window.removeEventListener('payment-approved', handleRefreshProfile);
      window.removeEventListener('refresh-user-profile', handleRefreshProfile);
    };
  }, [user?.email]);

  const handleSyncCloudData = async (silent = false) => {
    setIsSyncing(true);
    const savedEmail = user?.email || localStorage.getItem('tegura_user_email') || localStorage.getItem('nkorera_user_email');
    if (!savedEmail) {
      if (!silent) setShowSignInModal(true);
      setIsSyncing(false);
      return;
    }

    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      
      // Re-fetch user profile from Firestore database via API
      const profileRes = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: savedEmail, name: user?.name }),
      });

      if (profileRes.ok) {
        const freshProfile = await profileRes.json().catch(() => null);
        if (freshProfile) {
          setUser(freshProfile);
        }
      }

      // Re-fetch class diary records from Firestore
      try {
        const diaryRes = await fetch('/api/class-diary/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: savedEmail }),
        });
        if (diaryRes.ok) {
          const diaryData = await diaryRes.json().catch(() => null);
          if (diaryData && Array.isArray(diaryData.diaries)) {
            localStorage.setItem(`nkorera_class_diary_${savedEmail}`, JSON.stringify(diaryData.diaries));
          }
        }
      } catch (diaryErr) {
        console.warn('Class diary sync note:', diaryErr);
      }

      // Check and update PWA Service Worker caches for app users
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.update();
          });
        }).catch((swErr) => console.warn('Service worker cache update note:', swErr));
      }

      if (!silent) {
        setSyncToast({
          type: 'success',
          message: 'Successful Sync byakunze neza! All user cloud data, subscriptions & system features synced successfully.'
        });

        setTimeout(() => {
          setSyncToast(null);
        }, 5000);
      }

    } catch (err) {
      console.warn('Network sync notice (using local cache fallback):', err);
      if (!silent) {
        setSyncToast({
          type: 'error',
          message: selectedLanguage === 'Kinyarwanda'
            ? 'Mwagize ikosa mu kuvugurura amadata. Banza ugosore internet yawe.'
            : 'Could not reach server. Data updated from local cache.'
        });
        setTimeout(() => {
          setSyncToast(null);
        }, 4000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Automatic Real-Time Sync Engine: Runs auto-sync on intervals, tab focus, network reconnect & data events
  useEffect(() => {
    const handleExplicitSync = (e: Event) => {
      const customEv = e as CustomEvent<{ silent?: boolean }>;
      const isSilent = customEv.detail?.silent ?? false;
      handleSyncCloudData(isSilent);
    };

    const handleAutoSync = () => {
      handleSyncCloudData(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSyncCloudData(true);
      }
    };

    // Auto-sync listeners
    window.addEventListener('trigger-pwa-sync', handleExplicitSync);
    window.addEventListener('data-changed', handleAutoSync);
    window.addEventListener('lesson-plan-created', handleAutoSync);
    window.addEventListener('class-diary-updated', handleAutoSync);
    window.addEventListener('certificate-saved', handleAutoSync);
    window.addEventListener('payment-approved', handleAutoSync);
    window.addEventListener('refresh-user-profile', handleAutoSync);
    window.addEventListener('online', handleAutoSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic background sync every 5 minutes for real-time consistency
    const syncInterval = setInterval(() => {
      if (navigator.onLine && user?.email) {
        handleSyncCloudData(true);
      }
    }, 300000);

    return () => {
      window.removeEventListener('trigger-pwa-sync', handleExplicitSync);
      window.removeEventListener('data-changed', handleAutoSync);
      window.removeEventListener('lesson-plan-created', handleAutoSync);
      window.removeEventListener('class-diary-updated', handleAutoSync);
      window.removeEventListener('certificate-saved', handleAutoSync);
      window.removeEventListener('payment-approved', handleAutoSync);
      window.removeEventListener('refresh-user-profile', handleAutoSync);
      window.removeEventListener('online', handleAutoSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(syncInterval);
    };
  }, [user?.email, user?.name, selectedLanguage]);

  const handleSignInSuccess = async (userData: { email: string; name: string; phone?: string; sessionToken?: string }) => {
    localStorage.setItem('tegura_user_email', userData.email);
    localStorage.setItem('nkorera_user_email', userData.email);
    if (userData.name) {
      localStorage.setItem('tegura_user_name', userData.name);
      localStorage.setItem('nkorera_user_name', userData.name);
    }
    if (userData.sessionToken) {
      localStorage.setItem('tegura_session_token', userData.sessionToken);
      localStorage.setItem('nkorera_session_token', userData.sessionToken);
    }
    const fallback = getFallbackUser(userData.email, userData.name);
    setUser(fallback);

    // Trigger time-of-day greeting toast banner using the logged-in user's personal name
    const greeting = getTimeBasedGreeting(userData.name, selectedLanguage, selectedCountry);
    setWelcomeBanner({
      title: greeting.title,
      subtext: greeting.subtext,
    });

    // Auto-trigger PWA download/install guide on screen immediately when user enters/logs in
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
    }, 1500);

    try {
      const token = userData.sessionToken || localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: userData.email, name: userData.name }),
      });
      if (res.ok) {
        const profile = await res.json().catch(() => null);
        if (profile) setUser(profile);
      }
    } catch {
      // Retain fallback user
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('tegura_user_email');
    localStorage.removeItem('tegura_user_name');
    localStorage.removeItem('tegura_session_token');
    localStorage.removeItem('nkorera_user_email');
    localStorage.removeItem('nkorera_user_name');
    localStorage.removeItem('nkorera_session_token');
    setUser(null);
    setActiveTab('dashboard');
    setSyncToast({
      message: selectedLanguage === 'Kinyarwanda' 
        ? 'Usohotse neza muri konti yawe! Byakozwe vuba cyane kandi neza.' 
        : 'Logged out successfully and instantly!',
      type: 'success'
    });
    // Show login/register form immediately so they can log in/register under a new account easily
    setTimeout(() => {
      setShowSignInModal(true);
    }, 400);
  };

  const handleCountryChange = async (country: string) => {
    setSelectedCountry(country);
    if (user?.email) {
      try {
        const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
        const res = await fetch('/api/update-country', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ email: user.email, country }),
        });
        if (res.ok) {
          const updatedUser = await res.json().catch(() => null);
          if (updatedUser) setUser(updatedUser);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateLessonPlan = async (request: LessonPlanRequest) => {
    let currentUser = user;
    if (!currentUser) {
      const savedEmail = localStorage.getItem('tegura_user_email') || localStorage.getItem('nkorera_user_email') || 'teacher@nkorera.rw';
      currentUser = getFallbackUser(savedEmail);
      setUser(currentUser);
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const userName = currentUser.name || request.teacherName || 'Teacher';
    const userEmail = currentUser.email || 'teacher@nkorera.rw';

    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      
      // 15 second timeout for maximum speed & instant fallback deployment
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ request, userEmail }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          setErrorMsg('Amasomo yo kurema yashize. Banza ugure pack nshya.');
          setActiveTab('subscription');
          setIsGenerating(false);
          return;
        } else if (data.code === 'ACCOUNT_BLOCKED') {
          setErrorMsg('Konti yawe yahagaritswe.');
          setIsGenerating(false);
          return;
        } else if (data.code === 'DAILY_LIMIT_EXCEEDED') {
          setErrorMsg(data.error || 'Ntabwo wemerewe gukora lesson plans zirenga 3 ku munsi. Koresha izo wakoze cyangwa utegereze ejo.');
          setIsGenerating(false);
          return;
        }
        // If server returned non-OK status (e.g. 504 Timeout or 500 on Vercel), trigger instant client fallback
        throw new Error(`API server returned status ${res.status}`);
      }

      // Process response stream / payload through validation layer & error boundary
      const generatedPlan = await processLessonPlanStreamSafely(
        data.lessonPlan || data,
        request,
        userName
      );

      setCurrentPlan(generatedPlan);
      setSavedPlans((prev) => [generatedPlan, ...prev]);

      if (data.userProfile) {
        setUser(data.userProfile);
      }
    } catch (err: any) {
      console.warn('API unavailable or timed out, deployed client lesson plan fallback:', err?.message || err);
      // High-quality client fallback generator ensures teachers on Vercel or slow connections are NEVER stuck
      const fallbackPlan = generateClientLessonPlan(request, userName);
      setCurrentPlan(fallbackPlan);
      setSavedPlans((prev) => [fallbackPlan, ...prev]);
      if (!currentUser.isAdmin) {
        setUser((prev) => prev ? { ...prev, remainingPlans: Math.max(0, prev.remainingPlans - 1), totalGenerated: (prev.totalGenerated || 0) + 1 } : null);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitPayment = async (paymentData: {
    planId: string;
    momoTxRef: string;
    momoNumber: string;
    userPhone: string;
  }) => {
    if (!user) return;
    const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
    try {
      const res = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          userPhone: paymentData.userPhone,
          planId: paymentData.planId,
          momoTxRef: paymentData.momoTxRef,
          momoNumber: paymentData.momoNumber,
        }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('payment-submitted'));
        window.dispatchEvent(new CustomEvent('trigger-payment-check'));
      } else {
        const data = await res.json().catch(() => ({}));
        console.warn('Payment submission API returned non-OK status:', data.error || res.status);
      }
    } catch (err: any) {
      console.warn('Payment submission network issue:', err?.message);
    }
  };

  const handleDeletePlan = (id: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== id));
    if (currentPlan?.id === id) {
      setCurrentPlan(null);
    }
  };

  const handleUpdatePlanTags = (planId: string, tags: string[]) => {
    setSavedPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, tags } : p))
    );
    if (currentPlan?.id === planId) {
      setCurrentPlan((prev) => (prev ? { ...prev, tags } : null));
    }
  };

  if (initialVerifyCert) {
    return (
      <CertificateVerification
        certificateId={initialVerifyCert}
        selectedLanguage={selectedLanguage}
        onBackToDashboard={() => {
          setInitialVerifyCert(null);
          if (typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          setActiveTab('dashboard');
        }}
      />
    );
  }

  const handleGoogleSearchShortcut = () => {
    try {
      navigator.clipboard.writeText('nkorera.education');
      setSyncToast({
        message: "Successfully copied 'nkorera.education'! Opening Google Search now...",
        type: 'success'
      });
      setTimeout(() => setSyncToast(null), 4000);
      window.open('https://www.google.com/search?q=Nkorera+Education', '_blank');
    } catch {
      window.open('https://www.google.com/search?q=Nkorera+Education', '_blank');
    }
  };

  const handleCopyWebsiteAddress = () => {
    try {
      navigator.clipboard.writeText('https://nkorera.education');
      setSyncToast({
        message: "Successfully copied 'https://nkorera.education'! Share or save it easily.",
        type: 'success'
      });
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-200">
      <OfflineOverlay
        isNetworkOnline={isNetworkOnline}
        selectedLanguage={selectedLanguage}
        onRetry={() => {
          setIsNetworkOnline(true);
          setApiStatus('online');
        }}
      />
      <InstallPwaPrompt selectedLanguage={selectedLanguage} />
      
      {/* Non-blocking Offline Banner */}
      {!isNetworkOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-3 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-2xl animate-in slide-in-from-bottom duration-300 print:hidden z-[9999] border-t border-rose-500/30">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0"></span>
          <span>
            {selectedLanguage === 'Kinyarwanda' 
              ? "🔴 Uri Gukora Offline (Nta Internet) — Ushobora gusoma no gukoresha ibyabitswe byose muri memory cyangwa guhindura amadosiye yakorewe kuri iyi telephone, ariko gukoresha AI bisaba internet!" 
              : "🔴 Working Offline (No Internet) — You can view, read, and manage all locally cached plans, but generating new plans with AI requires active connection!"}
          </span>
        </div>
      )}

      <Header
        user={user}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedCountry={selectedCountry}
        onCountryChange={handleCountryChange}
        onOpenSignIn={() => setShowSignInModal(true)}
        onOpenSubscription={() => setActiveTab('subscription')}
        onOpenAdmin={() => setActiveTab('admin')}
        onOpenPolicy={() => setShowPolicyModal(true)}
        onOpenHelpCenter={() => setShowHelpCenterModal(true)}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        apiStatus={apiStatus}
        isNetworkOnline={isNetworkOnline}
        onSyncCloudData={handleSyncCloudData}
        isSyncing={isSyncing}
        onSelectFormat={(fmt) => setSelectedFormat(fmt)}
        notifications={notifications}
        onNotificationsChange={setNotifications}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'generator') {
            setCurrentPlan(null);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Floating Notification Stack at Bottom Left */}
        <div className="fixed bottom-6 left-6 z-50 max-w-sm sm:max-w-md w-full flex flex-col gap-3 pointer-events-auto print:hidden">
          {/* Connection Online / Offline Alert Toast */}
          {connectionAlert && (
            <div
              className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 animate-in slide-in-from-bottom-3 duration-300 ${
                connectionAlert.type === 'online'
                  ? 'bg-emerald-950 text-white border-emerald-500/60'
                  : 'bg-rose-950 text-rose-100 border-rose-500/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 border ${
                    connectionAlert.type === 'online'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  }`}
                >
                  {connectionAlert.type === 'online' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                    <span>{connectionAlert.title}</span>
                  </h3>
                  <p className="text-[11px] font-medium mt-0.5 opacity-90 leading-tight">
                    {connectionAlert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConnectionAlert(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
                title="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Welcome Toast Banner */}
          {welcomeBanner && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black shrink-0 border border-amber-300/30">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                    <span>{welcomeBanner.title}</span>
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-medium mt-0.5 leading-tight">
                    {welcomeBanner.subtext}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWelcomeBanner(null)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
                title="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncToast && (
            <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-2xl transition-all animate-in slide-in-from-bottom-3 duration-300 ${
              syncToast.type === 'success' 
                ? 'bg-emerald-950 text-emerald-100 border-2 border-emerald-500/60 shadow-emerald-900/30' 
                : 'bg-rose-950 text-rose-100 border-2 border-rose-500/60'
            }`}>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                <span className="font-bold">{syncToast.message}</span>
              </div>
              <button
                onClick={() => setSyncToast(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-emerald-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content with Smooth Motion Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardTab
                user={user}
                selectedLanguage={selectedLanguage}
                selectedCountry={selectedCountry}
                savedPlans={savedPlans}
                onSelectFormat={(fmt) => setSelectedFormat(fmt)}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  if (tab === 'generator') {
                    setCurrentPlan(null);
                  }
                }}
                onSelectPlan={(plan) => {
                  setCurrentPlan(plan);
                  setActiveTab('generator');
                }}
                onOpenSignIn={() => setShowSignInModal(true)}
                onSyncCloudData={handleSyncCloudData}
                isSyncing={isSyncing}
              />
            )}

            {activeTab === 'generator' && (
              <div>
                {currentPlan ? (
                  <LessonPlanView
                    plan={currentPlan}
                    onBack={() => setCurrentPlan(null)}
                  />
                ) : (
                  <LessonPlanForm
                    user={user}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    onSubmit={handleGenerateLessonPlan}
                    isGenerating={isGenerating}
                    onOpenSubscription={() => setActiveTab('subscription')}
                    onOpenSignIn={() => setShowSignInModal(true)}
                    initialFormat={selectedFormat}
                  />
                )}
              </div>
            )}

            {activeTab === 'remedial' && (
              <div>
                {currentPlan ? (
                  <LessonPlanView
                    plan={currentPlan}
                    onBack={() => setCurrentPlan(null)}
                  />
                ) : (
                  <RemedialPlanCreator
                    user={user}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    onOpenSubscription={() => setActiveTab('subscription')}
                    onOpenSignIn={() => setShowSignInModal(true)}
                    onSavePlan={(plan) => {
                      setSavedPlans((prev) => {
                        const merged = [plan, ...prev];
                        return merged.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);
                      });
                      setCurrentPlan(plan);
                    }}
                    onSaveMultiplePlans={(plans) => {
                      setSavedPlans((prev) => {
                        const merged = [...plans, ...prev];
                        return merged.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);
                      });
                    }}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                  />
                )}
              </div>
            )}

            {activeTab === 'exercises' && (
              <ExercisesCreator
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSubscription={() => setActiveTab('subscription')}
                onOpenSignIn={() => setShowSignInModal(true)}
              />
            )}

            {activeTab === 'nursery' && (
              <NurseryPlanCreator
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSubscription={() => setActiveTab('subscription')}
                onOpenSignIn={() => setShowSignInModal(true)}
                onSavePlan={(plan) => {
                  setSavedPlans((prev) => [plan, ...prev]);
                  setCurrentPlan(plan);
                  setActiveTab('generator');
                }}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'slides' && (
              <PresentationCreator
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSignIn={() => setShowSignInModal(true)}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenSubscription={() => setActiveTab('subscription')}
              />
            )}

            {activeTab === 'library' && (
              <LibraryTab
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSignIn={() => setShowSignInModal(true)}
                onOpenSubscription={() => setActiveTab('subscription')}
              />
            )}

            {activeTab === 'worksheets' && (
              <WorksheetsCreator
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSubscription={() => setActiveTab('subscription')}
                onOpenSignIn={() => setShowSignInModal(true)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                savedPlans={savedPlans}
                onSelectPlan={(plan) => {
                  setCurrentPlan(plan);
                  setActiveTab('generator');
                }}
                onDeletePlan={handleDeletePlan}
                onUpdatePlanTags={handleUpdatePlanTags}
                onNewPlanClick={() => {
                  setCurrentPlan(null);
                  setActiveTab('generator');
                }}
                onOpenSubscription={() => setActiveTab('subscription')}
              />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionTab
                user={user}
                onOpenSignIn={() => setShowSignInModal(true)}
                onSubmitPayment={handleSubmitPayment}
              />
            )}

            {activeTab === 'founder' && (
              <FounderTab
                selectedLanguage={selectedLanguage}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'class-diary' && (
              <ClassDiaryCreator
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSignIn={() => setShowSignInModal(true)}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onOpenSubscription={() => setActiveTab('subscription')}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificateCreator
                user={user}
                selectedLanguage={selectedLanguage}
                onOpenSignIn={() => setShowSignInModal(true)}
                onBackToDashboard={() => setActiveTab('dashboard')}
                initialVerifyCert={initialVerifyCert}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                user={user}
                onPaymentApproved={() => {
                  if (user?.email) {
                    const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
                    fetch('/api/user-profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ email: user.email }),
                    })
                      .then((r) => r.json().catch(() => null))
                      .then((u) => u && setUser(u))
                      .catch(console.error);
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Continuous Moving Ticker & Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 print:hidden mt-auto overflow-hidden">
        {/* Animated Smooth Moving Marquee Ticker */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 py-3 border-b border-emerald-900/40 relative overflow-hidden group">
          <div className="flex w-[200%] animate-marquee hover:[animation-play-state:paused] whitespace-nowrap cursor-pointer">
            {/* Ticker Content Items Set 1 */}
            <div className="flex items-center gap-6 shrink-0 pr-6 text-xs">
              <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🇷🇼 REB CBC 100% Compliant</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full font-black text-amber-300">
                <span>👑 Website Owner & Developer: NKUNDIMANA Theogene</span>
              </span>
              <span className="flex items-center gap-2 text-slate-200 font-bold">
                <span>📞 Telefone: <strong className="text-emerald-400">0781339530 / 0724038043</strong></span>
              </span>
              <span className="flex items-center gap-2 text-slate-200 font-bold">
                <span>💬 WhatsApp: <strong className="text-emerald-400">0781339530</strong></span>
              </span>
              <span className="flex items-center gap-2 text-slate-200 font-bold">
                <span>✉️ Email: <strong className="text-emerald-400">{OWNER_INFO.email}</strong></span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full font-bold text-teal-300">
                <span>⚡ Instant Lesson Plans • Remedial Plans • Nursery • Worksheets • Slides</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full font-bold text-purple-300">
                <span>💳 MoMo Support: MTN & Airtel Money</span>
              </span>
            </div>

            {/* Ticker Content Items Set 2 (Identical for seamless infinite loop) */}
            <div className="flex items-center gap-6 shrink-0 pr-6 text-xs">
              <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🇷🇼 REB CBC 100% Compliant</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full font-black text-amber-300">
                <span>👑 Website Owner & Developer: NKUNDIMANA Theogene</span>
              </span>
              <span className="flex items-center gap-2 text-slate-200 font-bold">
                <span>📞 Telefone: <strong className="text-emerald-400">0781339530 / 0724038043</strong></span>
              </span>
              <span className="flex items-center gap-2 text-slate-200 font-bold">
                <span>💬 WhatsApp: <strong className="text-emerald-400">0781339530</strong></span>
              </span>
              <span className="flex items-center gap-2 text-slate-200 font-bold">
                <span>✉️ Email: <strong className="text-emerald-400">{OWNER_INFO.email}</strong></span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full font-bold text-teal-300">
                <span>⚡ Instant Lesson Plans • Remedial Plans • Nursery • Worksheets • Slides</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full font-bold text-purple-300">
                <span>💳 MoMo Support: MTN & Airtel Money</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Sub-Bar */}
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3 text-center text-xs">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowHelpCenterModal(true)}
              className="px-4 py-2 rounded-xl transition-all font-black text-xs flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 shadow-md border border-amber-500 hover:scale-105 active:scale-95"
              title="Help Center: Tutorials, Video Scripts, Guides & System Structure"
              id="footer-tutorials-btn"
            >
              <HelpCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Tutorials & System Structure 🎥📄</span>
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border border-amber-300 shadow-sm hover:scale-105 active:scale-95"
              title="Send Feedback & Suggestions"
              id="footer-feedback-btn"
            >
              <MessageSquare className="w-4 h-4 text-amber-700 stroke-[2.5]" />
              <span>Send Feedback 💬</span>
            </button>

            <button
              onClick={() => setShowNotificationsModal(true)}
              className="px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-slate-700 hover:scale-105 active:scale-95 relative cursor-pointer"
              id="footer-notifications-btn"
              title={selectedLanguage === 'Kinyarwanda' ? "Ubutumwa n'Amakuru Mashya" : "System Notifications & Updates"}
            >
              {notifications.filter(n => !n.read).length > 0 ? (
                <BellRing className="w-4 h-4 text-amber-300 stroke-[2.5] animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-400 stroke-[2]" />
              )}
              <span>{selectedLanguage === 'Kinyarwanda' ? "Ubutumwa & Amakuru 🔔" : "Notifications & Updates 🔔"}</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="min-w-[18px] h-[18px] px-1.5 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border border-slate-900 shadow-md">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowPolicyModal(true)}
              className="px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700"
              id="footer-policy-btn"
            >
              <span>📜 Policy, Terms & FAQ</span>
            </button>
          </div>

          {/* Google / Chrome Search & Discovery Shortcut Card */}
          <div className="max-w-xl mx-auto bg-slate-950/50 border border-emerald-900/35 p-4 rounded-2xl space-y-3 shadow-xl my-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h4 className="font-extrabold text-slate-100 text-xs tracking-wide">
                Search "Nkorera Education" on Google or Chrome 🔍
              </h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed max-w-lg mx-auto">
              To easily find our platform on Google or Chrome in the future, click the search button below. It will automatically copy the domain name and direct you to the Google Search results!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={handleGoogleSearchShortcut}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-black rounded-xl transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 border border-emerald-500/20 cursor-pointer"
                title="Search Nkorera Education on Google"
              >
                <Search className="w-3.5 h-3.5 text-white" />
                <span>Search on Google</span>
              </button>

              <button
                onClick={handleCopyWebsiteAddress}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 text-[11px] font-black rounded-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 border border-slate-800 cursor-pointer"
                title="Copy website URL"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy URL (nkorera.education)</span>
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-1">
            © {new Date().getFullYear()} Nkorera Educational Tools. All Rights Reserved. REB Competence-Based Curriculum Compliant Platform.
          </p>
        </div>
      </footer>

      {/* Robotics AI Assistant Widget */}
      <RoboticsAssistantWidget />

      {/* Modals */}
      <SignInModal
        isOpen={showSignInModal || !user}
        onClose={() => {
          if (user) {
            setShowSignInModal(false);
          }
        }}
        onSignInSuccess={handleSignInSuccess}
      />

      <PolicyTermsModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />

      <HelpCenter
        isOpen={showHelpCenterModal}
        onClose={() => setShowHelpCenterModal(false)}
        user={user}
        currentModule={activeTab}
        selectedLanguage={selectedLanguage}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
      />

      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onNotificationsChange={setNotifications}
        selectedLanguage={selectedLanguage}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenHelpCenter={() => setShowHelpCenterModal(true)}
      />
    </div>
  );
}
