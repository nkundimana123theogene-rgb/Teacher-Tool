import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SignInModal } from './components/SignInModal';
import { PolicyTermsModal } from './components/PolicyTermsModal';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanView } from './components/LessonPlanView';
import { SubscriptionTab } from './components/SubscriptionTab';
import { AdminPanel } from './components/AdminPanel';
import { HistoryTab } from './components/HistoryTab';
import { DashboardTab } from './components/DashboardTab';
import { FounderTab } from './components/FounderTab';
import { RoboticsAssistantWidget } from './components/RoboticsAssistantWidget';
import { UserProfile, LanguageOption, LessonPlanRequest, LessonPlanData } from './types';
import { OWNER_INFO } from './data/plans';
import { Sparkles, BookOpen, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';
import { getTimeBasedGreeting } from './utils/greeting';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');
  const [selectedCountry, setSelectedCountry] = useState<string>('Rwanda');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'history' | 'subscription' | 'admin' | 'founder'>('dashboard');

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [welcomeBanner, setWelcomeBanner] = useState<{ title: string; subtext: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Helper to construct a local default profile if offline or loading
  const getFallbackUser = (email: string, name?: string): UserProfile => {
    const isOwner = email.toLowerCase() === 'nkundimana123theogene@gmail.com';
    const hasToken = !!(localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token'));
    const isAdmin = isOwner && hasToken;
    return {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name || (isOwner ? 'NKUNDIMANA Theogene' : email.split("@")[0]),
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
          const profile = await res.json();
          if (isMounted) setUser(profile);
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
    const initialEmail = savedEmail || 'nkundimana123theogene@gmail.com';
    const initialName = savedEmail ? undefined : 'NKUNDIMANA Theogene';

    // Synchronously set fallback user so application components never render null
    setUser(getFallbackUser(initialEmail, initialName));
    fetchProfile(initialEmail, initialName);

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignInSuccess = async (userData: { email: string; name: string; phone?: string; sessionToken?: string }) => {
    localStorage.setItem('tegura_user_email', userData.email);
    if (userData.sessionToken) {
      localStorage.setItem('tegura_session_token', userData.sessionToken);
    }
    const fallback = getFallbackUser(userData.email, userData.name);
    setUser(fallback);

    // Trigger time-of-day greeting toast banner
    const greeting = getTimeBasedGreeting(userData.name, selectedLanguage);
    setWelcomeBanner({
      title: greeting.title,
      subtext: greeting.subtext,
    });

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
        const profile = await res.json();
        setUser(profile);
      }
    } catch {
      // Retain fallback user
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('tegura_user_email');
    localStorage.removeItem('tegura_session_token');
    localStorage.removeItem('nkorera_user_email');
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
          const updatedUser = await res.json();
          setUser(updatedUser);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateLessonPlan = async (request: LessonPlanRequest) => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('nkorera_session_token');
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ request, userEmail: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          setErrorMsg(data.error);
          setActiveTab('subscription');
        } else {
          setErrorMsg(data.error || 'Failed to generate lesson plan');
        }
        return;
      }

      const generatedPlan: LessonPlanData = data.lessonPlan;
      setCurrentPlan(generatedPlan);
      setSavedPlans((prev) => [generatedPlan, ...prev]);

      if (data.userProfile) {
        setUser(data.userProfile);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.name === 'TypeError' || err?.message?.includes('fetch')) {
        setErrorMsg('Ikibazo cyo guhuza na seriveri (Server connection error). Mwongere mugezeho mukanya.');
      } else {
        setErrorMsg(err?.message || 'An unexpected error occurred');
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
    const token = localStorage.getItem('nkorera_session_token');
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
    if (!res.ok) {
      throw new Error('Payment submission failed');
    }
  };

  const handleDeletePlan = (id: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== id));
    if (currentPlan?.id === id) {
      setCurrentPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-200">
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
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'generator') {
            setCurrentPlan(null);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            user={user}
            selectedLanguage={selectedLanguage}
            selectedCountry={selectedCountry}
            savedPlans={savedPlans}
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
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryTab
            savedPlans={savedPlans}
            onSelectPlan={(plan) => {
              setCurrentPlan(plan);
              setActiveTab('generator');
            }}
            onDeletePlan={handleDeletePlan}
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

        {activeTab === 'admin' && (
          <AdminPanel
            user={user}
            onPaymentApproved={() => {
              if (user?.email) {
                const token = localStorage.getItem('nkorera_session_token');
                fetch('/api/user-profile', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({ email: user.email }),
                })
                  .then((r) => r.json())
                  .then((u) => setUser(u))
                  .catch(console.error);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-2.5">
          <div className="flex items-center justify-center gap-2 flex-wrap text-slate-800 font-extrabold text-xs sm:text-sm">
            <span>Teachers Quickly Tools Platform</span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-lg border border-amber-500 shadow-xs font-black text-xs">
              IT/Developer: Nkundimana Theogene
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Contacts: <span className="font-semibold text-emerald-800">0781339530 / 0724038043</span> • WhatsApp: <span className="font-semibold text-emerald-800">0781339530</span> • Email: <span className="font-semibold text-emerald-800">{OWNER_INFO.email}</span>
          </p>

          <div className="pt-1 flex items-center justify-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 font-bold"
            >
              📜 Policy, Terms & Conditions (Amabwiriza n'Amategeko)
            </button>
          </div>

          <p className="text-[10px] text-slate-400 pt-1">
            © {new Date().getFullYear()} Teacher Tool. REB Competence-Based Curriculum Compliant AI Generator.
          </p>
        </div>
      </footer>

      {/* Robotics AI Assistant Widget */}
      <RoboticsAssistantWidget />

      {/* Modals */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInSuccess={handleSignInSuccess}
      />

      <PolicyTermsModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />
    </div>
  );
}
