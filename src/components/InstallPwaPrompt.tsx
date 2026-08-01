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

export const InstallPwaPrompt: React.FC = () => {
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

  const directAppUrl = 'https://teacherlessonplans.ai.studio';

  // Detect iframe
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  const handleOpenInNewTab = () => {
    window.open(window.location.href || directAppUrl, '_blank', 'noopener,noreferrer');
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

  // Define handleInstallClick
  const handleInstallClick = async () => {
    const currentPrompt = deferredPromptRef.current;
    if (currentPrompt) {
      try {
        currentPrompt.prompt();
        const { outcome } = await currentPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsInstalled(true);
          setShowGuideModal(false);
        }
      } catch (err) {
        console.warn('PWA prompt failed:', err);
        setShowGuideModal(true);
      }
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
    } else {
      // Show guide modal with device instructions
      setShowGuideModal(true);
    }
  };

  // Sync and update app logic
  const handleSyncAndUpdateApp = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Syncing updates and caching offline engine... 🔄');

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

    setTimeout(() => {
      setSyncStatusMsg('✨ App updated successfully! (Yavuguruwe neza!)');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }, 1000);
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
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-lime-950 text-white p-4 border-y-2 border-lime-400 shadow-2xl print:hidden sticky top-16 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-2xl bg-lime-400 text-slate-950 font-black flex items-center gap-1.5 shrink-0 shadow-lg shadow-lime-400/30">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-lime-400 tracking-wide uppercase">
                    🎉 Ihinduka Rishya Ryabonetse / App Update Ready!
                  </span>
                  <span className="px-2 py-0.5 bg-lime-400 text-slate-950 font-black text-[10px] rounded-full uppercase">
                    Sync Required
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-0.5">
                  Hari ibintu bishya byongejwe muri App! Kanda "Vugurura App / Sync Now" kugira ngo bijyemo ubu.
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
                <span>{isSyncing ? 'Irimo ku Vugurura...' : 'Vugurura App / Sync Now'}</span>
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
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-lime-950 text-white p-4 border-b border-lime-400/50 shadow-xl print:hidden sticky top-16 z-30 animate-in slide-in-from-top-2">
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

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Ohereza kuri WhatsApp 💬</span>
                </button>
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
                      💡 Nkorera Education ntabwo isaba Chrome gusa!
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Iyi App wayikoresha kuri browser iyariyo yose ukoresha kuri phone cyangwa computer:
                    </p>
                    <ul className="text-xs text-slate-200 space-y-2 font-semibold pl-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Safari (iPhone / iPad):</strong> Kanda Share ➔ Add to Home Screen</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Samsung Internet:</strong> Kanda Menu (≡) ➔ Add page to ➔ Home screen</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Opera / Firefox / Brave:</strong> Kanda Menu ➔ Add Shortcut / Install</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                        <span><strong>Microsoft Edge (PC/Phone):</strong> Kanda (...) ➔ Apps ➔ Install this site</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === 'android' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Inzira yo ku yishyira kuri Android (Google Chrome & Brave):</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Kanda ku dushami dutatu <span className="text-lime-400 font-extrabold">(⋮)</span> twerekanwa mu nguni y'iburyo hejuru.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Hitamo ahanditse <span className="text-lime-400 font-extrabold">"Install app"</span> cyangwa <span className="text-lime-400 font-extrabold">"Add to Home screen"</span>.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">3</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Kanda <span className="text-lime-400 font-extrabold">"Install"</span> kugira ngo ihite yizana kuri phone yawe nka App isanzwe!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Inzira yo ku yishyira kuri iPhone / iPad (Safari Browser):</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Kanda kuri bouton ya <span className="text-lime-400 font-extrabold">"Share"</span> (Uruziga rufite akambi kareba hejuru) munsi ya screen ya Safari.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Shorera munsi hanyuma uhitemo ahanditse <span className="text-lime-400 font-extrabold">"Add to Home Screen"</span>.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">3</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Kanda <span className="text-lime-400 font-extrabold">"Add"</span> mu mfuruka y'iburyo hejuru kugira ngo yizane kuri screen yawe.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'samsung' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Kuri Samsung Internet, Opera cyangwa Phoenix Browser:</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Kanda kuri Menu <span className="text-lime-400 font-extrabold">(≡)</span> iri mu mfuruka y'iburyo yo hansi.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Hitamo <span className="text-lime-400 font-extrabold">"Add page to"</span> ➔ <span className="text-lime-400 font-extrabold">"Home screen"</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pc' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <p className="font-extrabold text-lime-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>Inzira yo ku yishyira kuri Computer (Edge, Firefox, Chrome):</span>
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">1</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Reba mu mfuruka ya browser yawe hejuru ahanditse Link (address bar), urahasanga akamenyetso k'akambi cyangwa monitor <span className="text-lime-400 font-extrabold">"Install App / Download"</span>.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 bg-slate-800 text-slate-200 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0">2</div>
                        <p className="text-slate-200 font-semibold pt-0.5">
                          Kanda kuri ako kamenyetso hanyuma wemeze ukanze <span className="text-lime-400 font-extrabold">"Install"</span>.
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
                  <span>KORA DIRECT INSTALL (DOWNLOAD) 📥</span>
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

              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
                }}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl transition-all text-center"
              >
                Komeza ukoreshe Web / Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

