import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isDesktopDevice = !isIOSDevice && !isAndroidDevice;

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsDesktop(isDesktopDevice);

    // Global listener for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar so our custom UI can trigger it
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanPrompt(true);
      (window as any).__pwaDeferredPrompt = promptEvent;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setCanPrompt(false);
      (window as any).__pwaDeferredPrompt = null;
    };

    // Check if there was an already stored prompt on window
    if ((window as any).__pwaDeferredPrompt) {
      setDeferredPrompt((window as any).__pwaDeferredPrompt);
      setCanPrompt(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPrompt || (window as any).__pwaDeferredPrompt;
    if (!prompt) {
      return false;
    }

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setCanPrompt(false);
        (window as any).__pwaDeferredPrompt = null;
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Prompt error or already handled:', err);
    }
    return false;
  }, [deferredPrompt]);

  // Utility to download a desktop Windows shortcut (.url)
  const downloadDesktopShortcut = useCallback(() => {
    const currentOrigin = window.location.origin || 'https://ais-dev-faufpsn55jfzxunwbpjnov-669037879274.europe-west2.run.app';
    const content = `[InternetShortcut]\nURL=${currentOrigin}/\nIconIndex=0\nIconFile=${currentOrigin}/favicon.ico\n`;
    const blob = new Blob([content], { type: 'application/internet-shortcut;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Nkorera Education App.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  return {
    deferredPrompt,
    isInstallable: canPrompt || !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isDesktop,
    install,
    downloadDesktopShortcut
  };
}
