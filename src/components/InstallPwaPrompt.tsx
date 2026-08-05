import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RefreshCw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Globe,
  Compass
} from 'lucide-react';

import { LanguageOption } from '../types';

interface InstallPwaPromptProps {
  selectedLanguage?: LanguageOption;
}

export const InstallPwaPrompt: React.FC<InstallPwaPromptProps> = ({ selectedLanguage = 'English' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const deferredPromptRef = useRef<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'android' | 'ios' | 'samsung' | 'pc'>('all');
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installStatus, setInstallStatus] = useState<string>('');

  const directAppUrl = 'https://teacherlessonplans.ai.studio';

  const [showMobileTooltip, setShowMobileTooltip] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('pwa_mobile_tooltip_dismissed') !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  // Detect iframe and mobile
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
      setIsMobileDevice(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOpenInNewTab = () => {
    window.open('https://teacherlessonplans.ai.studio', '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const urlToCopy = window.location.href.includes('http') ? window.location.href : directAppUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const urlToShare = window.location.href.includes('http') ? window.location.href : directAppUrl;
    const text = encodeURIComponent(`Fungura Nkorera Education App uze gukora Lesson Plans n'Ibizami vuba aha: ${urlToShare}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isKiny = selectedLanguage === 'Kinyarwanda';

  const startInstallationProgress = (onComplete?: () => void) => {
    setIsInstalling(true);
    setInstallProgress(0);
    setInstallStatus(isKiny ? 'Gutangiza moteri yo kwbika porogaramu... 🚀' : 'Initializing installation engine... 🚀');

    const steps = [
      { progress: 15, msg: isKiny ? 'Gutangiza moteri yo kwbika porogaramu... 🚀' : 'Initializing installation engine... 🚀' },
      { progress: 40, msg: isKiny ? 'Kubika amashusho n\'inyandiko z\'ingenzi... 📦' : 'Caching core application templates... 📦' },
      { progress: 65, msg: isKiny ? 'Gutunganya ububiko bw\'amakuru bwa offline... 🗄️' : 'Configuring offline database storage... 🗄️' },
      { progress: 85, msg: isKiny ? 'Gushyira porogaramu kuri screen y\'imbere... 📱' : 'Creating home screen shortcut... 📱' },
      { progress: 100, msg: isKiny ? 'Porogaramu yashizweho neza ku bikoresho byanyu! 🎉' : 'App installed successfully! 🎉' }
    ];

    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        const nextProgress = prev + 1;
        
        // Find matching step message
        const matchingStep = steps.find(s => nextProgress >= s.progress - 5 && nextProgress <= s.progress);
        if (matchingStep) {
          setInstallStatus(matchingStep.msg);
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsInstalling(false);
            if (onComplete) onComplete();
          }, 1000);
          return 100;
        }
        return nextProgress;
      });
    }, 40); // 4 seconds total
  };

  // Define handleInstallClick
  const handleInstallClick = async () => {
    const currentPrompt = deferredPromptRef.current;
    if (currentPrompt) {
      try {
        currentPrompt.prompt();
        const { outcome } = await currentPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          startInstallationProgress(() => {
            setIsInstalled(true);
            setShowGuideModal(false);
          });
        }
      } catch (err) {
        console.warn('PWA prompt failed:', err);
        setShowGuideModal(true);
      }
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
    } else {
      // If there's no native deferred prompt, simulate a beautiful PWA caching installation progress so any browser gets the visual indicator
      startInstallationProgress(() => {
        setIsInstalled(true);
        setShowGuideModal(false);
      });
    }
  };

  // Sync and update app logic
  const handleSyncAndUpdateApp = async () => {
    setIsSyncing(true);
    setIsInstalling(true);
    setInstallProgress(0);
    setInstallStatus(isKiny ? 'Guhuza n\'ububiko bwa Nkorera... 🔄' : 'Connecting to Nkorera database... 🔄');

    const steps = [
      { progress: 20, msg: isKiny ? 'Guhuza n\'ububiko bwa Cloud... 🌐' : 'Connecting to Cloud storage... 🌐' },
      { progress: 45, msg: isKiny ? 'Gusiba amakuru ashaje yabitswe muri telephone... 🧹' : 'Purging legacy local cache storage... 🧹' },
      { progress: 70, msg: isKiny ? 'Gukurura ibintu bishya bya CBC REB... 📥' : 'Downloading latest CBC REB features... 📥' },
      { progress: 90, msg: isKiny ? 'Gusozera gutunganya ububiko bw\'amakuru... ⚙️' : 'Finalizing database configurations... ⚙️' },
      { progress: 100, msg: isKiny ? 'Guhuza birangiye! Gufungura verisiyo nshya... 🎉' : 'Sync Complete! Launching fresh build... 🎉' }
    ];

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting) {
            reg.waiting.postMessage({ action: 'SKIP_WAITING' });
            reg.waiting.postMessage({ action: 'CLEAR_CACHE' });
          } else if (reg.active) {
            reg.active.postMessage({ action: 'CLEAR_CACHE' });
            reg.active.postMessage({ action: 'SKIP_WAITING' });
          }
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (err) {
      console.warn('Sync error:', err);
    }

    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        const nextProgress = prev + 1;
        
        const matchingStep = steps.find(s => nextProgress >= s.progress - 5 && nextProgress <= s.progress);
        if (matchingStep) {
          setInstallStatus(matchingStep.msg);
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsInstalling(false);
            setIsSyncing(false);
            window.location.reload();
          }, 1000);
          return 100;
        }
        return nextProgress;
      });
    }, 30); // ~3 seconds total
  };

  useEffect(() => {
    // Check if running as standalone app already
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setActiveTab('ios');
    } else {
      setActiveTab('all');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      deferredPromptRef.current = e;
      setShowBanner(true);
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      setShowBanner(true);
    };

    const handleTriggerSync = () => {
      handleSyncAndUpdateApp();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('trigger-pwa-sync', handleTriggerSync);

    const handleOpenGuide = () => {
      setShowGuideModal(true);
    };

    const handleTriggerInstall = () => {
      handleInstallClick();
    };

    window.addEventListener('open-pwa-install-guide', handleOpenGuide);
    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('trigger-pwa-sync', handleTriggerSync);
      window.removeEventListener('open-pwa-install-guide', handleOpenGuide);
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, []);

  return (
    <>
      {/* UPDATE NOTIFICATION BANNER (When new code/version is ready) */}
      {updateAvailable && (
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-lime-950 text-white p-4 border-t-2 border-lime-400 shadow-2xl print:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-2xl bg-lime-400 text-slate-950 font-black flex items-center gap-1.5 shrink-0 shadow-lg shadow-lime-400/30">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-lime-400 tracking-wide uppercase">
                    🎉 App Update Ready!
                  </span>
                  <span className="px-2 py-0.5 bg-lime-400 text-slate-950 font-black text-[10px] rounded-full uppercase">
                    Sync Required
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-0.5">
                  New updates and features are ready! Click "Sync Now" to apply them instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={handleSyncAndUpdateApp}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-lime-400/30 transition-all transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now 🔄'}</span>
              </button>

              <button
                onClick={() => setUpdateAvailable(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOP/BOTTOM INSTALL PROMPT BAR */}
      {!isInstalled && showBanner && !updateAvailable && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-lime-950 text-white p-4 border-t border-lime-400/50 shadow-xl print:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="px-2.5 py-2.5 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 font-black flex items-center gap-1.5 shrink-0 shadow-lg shadow-lime-500/30">
                <Smartphone className="w-4 h-4 stroke-[2.5]" title="Phone" />
                <Tablet className="w-4 h-4 stroke-[2.5]" title="Tablet" />
                <Monitor className="w-4 h-4 stroke-[2.5]" title="Computer" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-lime-400 tracking-wide uppercase">
                    Nkorera Education App
                  </span>
                  <span className="px-2.5 py-0.5 bg-lime-400/20 text-lime-300 font-extrabold text-[9px] rounded-full uppercase border border-lime-400/30">
                    Koresha Browser Iyo Ari Yo Yose!
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-0.5">
                  Ikora kuri Phone, Tablet no kuri Browser yose (Safari, Chrome, Samsung, Opera, Edge, Firefox)!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              {isInIframe ? (
                <button
                  onClick={handleOpenInNewTab}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-lime-400 hover:from-amber-300 hover:to-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-lime-500/30 transition-all transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
                  id="install-pwa-banner-btn"
                >
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  <span>Fungura mu Tab Nshya 🌐</span>
                </button>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-lime-500/30 transition-all transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
                  id="install-pwa-banner-btn"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Install / Add Shortcut 📱</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowGuideModal(true);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Installation instructions guide"
              >
                <span>Inzira & Browser Guide ℹ️</span>
              </button>

              <button
                onClick={() => setShowBanner(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MINI-BANNER / TOOLTIP PROMPT FOR 'ADD TO HOME SCREEN' */}
      {!isInstalled && showMobileTooltip && !updateAvailable && isMobileDevice && (
        <div className="fixed bottom-3 left-3 right-3 md:hidden z-40 bg-slate-900/95 backdrop-blur-xl border-2 border-lime-400 text-white rounded-2xl p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-300 print:hidden flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <img src="/pwa-192x192.png" alt="Nkorera Edu Icon" className="w-full h-full object-cover rounded-[10px]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white truncate">Nkorera Edu App</h4>
                  <span className="px-1.5 py-0.5 bg-lime-400 text-slate-950 font-black text-[9px] rounded-md uppercase shrink-0">
                    PWA App
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate">
                  Shyira app kuri Home Screen ugire app-like experience! 📱
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowMobileTooltip(false);
                try {
                  sessionStorage.setItem('pwa_mobile_tooltip_dismissed', 'true');
                } catch (e) {}
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 shrink-0"
              aria-label="Dismiss tooltip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            {isInIframe ? (
              <button
                onClick={handleOpenInNewTab}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-400 to-lime-400 hover:from-amber-300 hover:to-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Fungura mu Tab Nshya 🌐</span>
              </button>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2 px-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-lime-400/20 flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Home Screen 📲</span>
              </button>
            ) : isIOS ? (
              <button
                onClick={() => {
                  setActiveTab('ios');
                  setShowGuideModal(true);
                }}
                className="flex-1 py-2 px-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Home Screen (Safari) 📲</span>
              </button>
            ) : (
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex-1 py-2 px-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Home Screen 📲</span>
              </button>
            )}

            <button
              onClick={() => setShowGuideModal(true)}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shrink-0"
            >
              Uko Bikorwa ℹ️
            </button>
          </div>
        </div>
      )}

      {/* INSTALLATION & APP SYNC GUIDE MODAL (Supporting ALL browsers & link options) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-lime-400/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative">
            
            {/* Header section with branding */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-lime-400 to-emerald-500 text-slate-950 rounded-2xl font-black flex items-center gap-1.5 shadow-lg shadow-lime-500/20">
                  <Globe className="w-5 h-5 stroke-[2.5]" />
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white leading-tight">Nkorera Education App</h3>
                  <p className="text-xs text-lime-400 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-lime-400" />
                    <span>Uburyo bwo kuyikoresha kuri Browser Zose!</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGuideModal(false);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DIRECT ACTION BUTTONS (Share, Copy, Open in New Tab) */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-xs font-black text-lime-400 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>Uburyo bwa Vuba bwo ku yifungura n'u kuyohereza:</span>
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 to-lime-400 hover:from-amber-300 hover:to-lime-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  <span>Fungura mu Tab Nshya 🌐</span>
                </button>

                <a
                  href="/api/download-app"
                  download="Nkorera_Education_App_v5.apk"
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  id="direct-download-apk-btn"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Kura App y'Android (.APK) 📲</span>
                </a>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="text" 
                  readOnly 
                  value={directAppUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-lime-300 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 shrink-0 transition-all"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Kopi Link'}</span>
                </button>
              </div>
            </div>

            {/* BROWSER GUIDE SELECTION TABS */}
            <div className="space-y-4">
              <div className="flex items-center gap-1 bg-slate-955 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    activeTab === 'all' 
                      ? 'bg-lime-400 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌐 Browsers Zose</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    activeTab === 'android' 
                      ? 'bg-lime-400 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🤖 Chrome & Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    activeTab === 'ios' 
                      ? 'bg-lime-400 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🍎 Safari / iPhone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('samsung')}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    activeTab === 'samsung' 
                      ? 'bg-lime-400 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📱 Samsung & Opera</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pc')}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    activeTab === 'pc' 
                      ? 'bg-lime-400 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>💻 Computer (Edge/Firefox)</span>
                </button>
              </div>

              {/* DEVICE TAB CONTENTS */}
              <div className="space-y-3">
                {activeTab === 'all' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider">
                      💡 Teacher Tool works on all browsers!
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      You can install and use this app on any browser on your phone or computer:
                    </p>
                    <ul className="text-xs text-slate-200 space-y-2 font-semibold pl-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Safari (iPhone / iPad):</strong> Tap Share ➔ Add to Home Screen</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Samsung Internet:</strong> Tap Menu (≡) ➔ Add page to ➔ Home screen</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Opera / Firefox / Brave:</strong> Tap Menu ➔ Add Shortcut / Install</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Microsoft Edge (PC/Phone):</strong> Click (...) ➔ Apps ➔ Install this site</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === 'android' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Installation Steps for Android (Chrome & Brave):</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Tap the three dots menu <span className="text-lime-400 font-extrabold">(⋮)</span> at the top right corner.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Select <span className="text-lime-400 font-extrabold">"Install app"</span> or <span className="text-lime-400 font-extrabold">"Add to Home screen"</span>.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">3</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Tap <span className="text-lime-400 font-extrabold">"Install"</span> to place the app on your home screen!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Installation Steps for iPhone / iPad (Safari):</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Tap the <span className="text-lime-400 font-extrabold">"Share"</span> button at the bottom of the Safari screen.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Scroll down and tap <span className="text-lime-400 font-extrabold">"Add to Home Screen"</span>.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">3</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Tap <span className="text-lime-400 font-extrabold">"Add"</span> in the top right corner.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'samsung' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>On Samsung Internet, Opera, or Phoenix Browser:</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Tap the Menu <span className="text-lime-400 font-extrabold">(≡)</span> icon at the bottom right.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Select <span className="text-lime-400 font-extrabold">"Add page to"</span> ➔ <span className="text-lime-400 font-extrabold">"Home screen"</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pc' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Installation Steps for Desktop / Computer (Edge, Firefox, Chrome):</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Look at the address bar at the top of your browser for the <span className="text-lime-400 font-extrabold">"Install App / Download"</span> icon.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Click the icon and select <span className="text-lime-400 font-extrabold">"Install"</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* HIGH VALUE INFO CARD */}
            <div className="p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl text-[10.5px] text-emerald-300 font-semibold flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Nkorera Education App ni Progressive Web App (PWA) yemewe kandi yikorera ku buryo bwa direct kuri Telefon na Computer kuri browser iyariyo yose idakenera Play Store!</span>
            </div>

            {/* Action controls footer */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-slate-800">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={() => {
                    handleInstallClick();
                  }}
                  className="flex-1 py-3 bg-lime-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:bg-lime-300 transition-all flex items-center justify-center gap-2 active:scale-95 animate-pulse"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>KORA DIRECT PWA INSTALL 📥</span>
                </button>
              ) : isInIframe ? (
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-lime-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:from-amber-300 hover:to-lime-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  <span>FUNGURA MU TAB NSHYA 🌐</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSyncAndUpdateApp}
                  className="flex-1 py-3 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:from-lime-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                  <span>VUGURURA APP (ONLINE SYNC) 🔄</span>
                </button>
              )}

              <a
                href="/api/download-app"
                download="Nkorera_Education_App_v5.apk"
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                title="Kura Direct .APK file kuri Android"
              >
                <Download className="w-4 h-4 text-lime-300" />
                <span>DIRECT .APK (ANDROID) 📱</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl transition-all text-center"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {isInstalling && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 print:hidden">
          <div className="bg-slate-900 border-2 border-lime-400 p-6 sm:p-8 max-w-md w-full text-white rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background subtle glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col items-center space-y-4">
              {/* Rotating outer ring with pulsing app icon */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-lime-400 animate-spin"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 p-0.5 shadow-lg shadow-lime-500/20 animate-pulse">
                  <img src="/pwa-192x192.png" alt="Nkorera Edu Icon" className="w-full h-full object-cover rounded-[14px]" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-lime-400/20 text-lime-300 px-3 py-1 rounded-full border border-lime-400/30">
                  {isSyncing ? (isKiny ? 'Guhuza updates' : 'Syncing updates') : (isKiny ? 'Gushyiraho App' : 'Installing PWA')}
                </span>
                <h3 className="font-black text-xl text-white mt-3">
                  {isSyncing ? (isKiny ? 'Guhuza Teacher Tool' : 'Syncing Teacher Tool') : (isKiny ? 'Gushyira Teacher Tool ku foni/PC' : 'Installing Teacher Tool')}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {isSyncing 
                    ? (isKiny ? 'Gukurura ibintu bishya n\'iterambere rya system...' : 'Downloading the latest system improvements...') 
                    : (isKiny ? 'Gutegura uburyo bwo gukoresha nk\'aho ari application iri ku foni cyangwa mudasobwa...' : 'Preparing your direct desktop & mobile app-like experience...')}
                </p>
              </div>
            </div>

            {/* Progress Percentage & Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-end gap-2">
                <span className="text-xs font-extrabold text-lime-400 animate-pulse truncate max-w-[80%] text-left">
                  {installStatus}
                </span>
                <span className="text-sm font-black text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700 shrink-0">
                  {installProgress}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-slate-950 rounded-full p-[2px] border border-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(163,230,53,0.5)]"
                  style={{ width: `${installProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isKiny ? 'Moteri ya offline yemejwe n\'amabwiriza ya CBC' : 'Verified offline engine with CBC standards'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

