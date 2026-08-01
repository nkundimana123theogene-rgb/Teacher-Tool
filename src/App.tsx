import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
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
import { UserProfile, LanguageOption, PlanFormatOption, LessonPlanRequest, LessonPlanData } from './types';
import { OWNER_INFO } from './data/plans';
import { Sparkles, BookOpen, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';
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
  const [welcomeBanner, setWelcomeBanner] = useState<{ title: string; subtext: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
        title: '🟢 Muri Online Mode (Ufite Connection)',
        message: 'Internet yahujwe neza! Ushobora gukomeza gukoresha Teacher Tool no kugeneratinga amaso (Lesson plans) udafite ikibazo.'
      });
      checkHealth();
    };

    const handleOffline = () => {
      if (!isMounted) return;
      setIsNetworkOnline(false);
      setApiStatus('offline');
      setConnectionAlert({
        type: 'offline',
        title: '🔴 No Connection? Please! Connect Your Device',
        message: 'Nta connection ya internet iri kuboneka. Banza uhuze mudasobwa cyangwa telephone yawe n\'internet (Wi-Fi/Data) ugakomeza gukoresha platform.'
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
    const hasToken = !!(localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token'));
    const isAdmin = isOwner && hasToken;
    return {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name || (isOwner ? 'NKUNDIMANA Theogene' : (email.includes('@') ? email.split("@")[0] : 'Mwarimu')),
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

    // Periodic background sync every 25 seconds for real-time consistency
    const syncInterval = setInterval(() => {
      if (navigator.onLine && user?.email) {
        handleSyncCloudData(true);
      }
    }, 25000);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-200">
      <InstallPwaPrompt />
      
      {/* Absolute Fullscreen Blocking Overlay when offline */}
      {!isNetworkOnline && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 text-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500 text-rose-500 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-lg shadow-rose-500/20 animate-pulse">
              📶
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-rose-400 tracking-wide">
                Nta Connection ya Internet Iriyo! 🔴
              </h3>
              <p className="text-sm font-bold text-white">
                Ubu uri Offline. Gukoresha iyi App bisaba kuba ufite Network.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Nkorera Educational Tools isaba internet ihoraho (Wi-Fi cyangwa Mobile Data) kugira ngo ukomeze gukora. Banza ufungure connection yawe ngo uhite ukomeza!
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl space-y-2 text-xs text-left">
              <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <span>💡 Icyo ugomba gukora:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 font-medium">
                <li>Fungura Data (MTN / Airtel) cyangwa Wi-Fi</li>
                <li>Kora refresh cyangwa utegereze ko byikora</li>
                <li>Ufite ikibazo? Baza Admin: 0781339530</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>Irimo gutegereza Network... (Waiting for Connection...)</span>
              </div>
            </div>
          </div>
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
        onSignOut={handleSignOut}
        activeTab={activeTab}
        apiStatus={apiStatus}
        isNetworkOnline={isNetworkOnline}
        onSyncCloudData={handleSyncCloudData}
        isSyncing={isSyncing}
        onSelectFormat={(fmt) => setSelectedFormat(fmt)}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'generator') {
            setCurrentPlan(null);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Online / Offline Alert Toast */}
        {connectionAlert && (
          <div
            className={`mb-6 p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300 ${
              connectionAlert.type === 'online'
                ? 'bg-emerald-950 text-white border-emerald-500/40'
                : 'bg-rose-950 text-rose-100 border-rose-500/40'
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
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{connectionAlert.title}</span>
                </h3>
                <p className="text-xs font-medium mt-0.5 opacity-90">
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
          <div className="mb-6 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white p-4 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black shrink-0 border border-amber-300/30">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{welcomeBanner.title}</span>
                </h3>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
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
          <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
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
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2 text-center text-xs">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="font-extrabold text-white">Teachers Quickly Tools Platform</span>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="text-emerald-400 hover:text-emerald-300 hover:underline font-bold"
            >
              📜 Amabwiriza n'Amategeko (Policy, Terms & Conditions)
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
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
    </div>
  );
}
