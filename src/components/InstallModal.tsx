import React, { useState } from 'react';
import { X, Check, Copy, Laptop, Smartphone, HelpCircle, Download, Sparkles, Monitor, ArrowDownToLine } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onInstallDirect?: () => Promise<boolean | void> | void;
  onDownloadShortcut?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ 
  isOpen, 
  onClose,
  deferredPrompt,
  isInstallable = false,
  isInstalled = false,
  onInstallDirect,
  onDownloadShortcut
}) => {
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const appUrl = window.location.origin || 'https://ais-dev-faufpsn55jfzxunwbpjnov-669037879274.europe-west2.run.app';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectInstall = async () => {
    if (onInstallDirect) {
      const res = await onInstallDirect();
      if (res === true) {
        setInstallSuccess(true);
      }
    }
  };

  const handleDownloadShortcut = () => {
    if (onDownloadShortcut) {
      onDownloadShortcut();
    } else {
      const content = `[InternetShortcut]\nURL=${appUrl}/\nIconIndex=0\nIconFile=${appUrl}/favicon.ico\n`;
      const blob = new Blob([content], { type: 'application/internet-shortcut;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Nkorera Education App.url';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-5 relative text-white shadow-2xl my-auto">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL HEADER */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/20">
            📲
          </div>
          <h2 className="font-black text-slate-100 text-lg sm:text-xl uppercase tracking-wide">
            Download & Install Nkorera App
          </h2>
          <p className="text-xs text-emerald-400 font-semibold">
            Gushyira App kuri Telefone cyangwa Mudasobwa yawe (PWA Install)
          </p>
          <p className="text-[11px] text-slate-300 max-w-md mx-auto">
            Bikora nk'uko ubona kuri WhatsApp Web: ushyiraho Nkorera ikajya ikora mu buryo bwa App nyayo, vuba kandi idasaba kongera kwandika aderesi!
          </p>
        </div>

        {/* ALREADY INSTALLED OR JUST INSTALLED BADGE */}
        {(isInstalled || installSuccess) && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-400 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold animate-pulse">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Nkorera Education App is installed on this device! (Iyi App yashyizweho neza)</span>
          </div>
        )}

        {/* 1-CLICK DIRECT INSTALL BUTTON */}
        {(deferredPrompt || isInstallable) && !isInstalled && (
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-900/80 to-slate-900 border-2 border-emerald-400 rounded-2xl text-center space-y-2 shadow-xl shadow-emerald-500/10 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Igikoresho cyawe cyiteguye gushyiraho App Ako Kanya!</span>
            </div>
            <button
              onClick={handleDirectInstall}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>KANDA HANO USHYIREHO APP (INSTALL NOW)</span>
            </button>
            <p className="text-[10px] text-emerald-200/80">
              Kanda iyi buto kugira ngo Chrome cyangwa Edge iguhe popup yo kwemeza "Install"
            </p>
          </div>
        )}

        {/* VISUAL GUIDE FOR DESKTOP CHROME / EDGE (LIKE WHATSAPP WEB) */}
        <div className="bg-slate-950/90 border border-emerald-500/40 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-400">
              <Monitor className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Uburyo bwa Mudasobwa (Desktop Chrome / Edge — Nk'uko biri kuri WhatsApp Web)
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">1-Click</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Muri <strong>Google Chrome</strong> cyangwa <strong>Microsoft Edge</strong> kuri Mudasobwa, reba mu gatsiko k'aho wandika aderesi (URL bar) hejuru iburyo:
          </p>

          {/* MOCK BROWSER URL BAR */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400 text-xs">🔒</span>
              <span className="text-xs text-slate-200 font-mono truncate">{appUrl}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400 text-emerald-300 rounded-lg text-xs font-extrabold shadow animate-bounce">
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>Install app 💻</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300">
            👉 Kanda kuri ako kashushanyo k'akuma / mudasobwa (<strong>Install app</strong>), hanyuma ukande <strong>"Install"</strong>. Nkorera izahita yiyongera ku biro byawe (Desktop)!
          </p>

          {/* DIRECT SHORTCUT DOWNLOAD BUTTON */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">Cyangwa kura hano Shortcut ya Mudasobwa:</span>
            <button
              onClick={handleDownloadShortcut}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Desktop Shortcut (.url)</span>
            </button>
          </div>
        </div>

        {/* MOBILE GUIDES (ANDROID & IPHONE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* ANDROID */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Smartphone className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">Muri Telefone ya Android</h4>
            </div>
            <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside pl-0.5 leading-relaxed">
              <li>Fungura Chrome kuri telefone yawe.</li>
              <li>Kanda ku dutonyanga dutatu (<span className="font-bold text-amber-300">⋮</span>) hejuru iburyo.</li>
              <li>Hitamo <strong>"Install app"</strong> cyangwa <strong>"Add to Home screen"</strong>.</li>
              <li>Emeza <strong>Install</strong> — Nkorera izaza kuri Ecran nk'izindi Apps zose!</li>
            </ol>
          </div>

          {/* IPHONE / IPAD */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-sky-400">
              <Laptop className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">Muri iPhone / iPad (Safari)</h4>
            </div>
            <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside pl-0.5 leading-relaxed">
              <li>Fungura Nkorera muri browser ya Safari.</li>
              <li>Kanda ku kimenyetso cyo gusangiza (<span className="font-bold text-sky-300">Share ↗</span>) hasi.</li>
              <li>Manuka gato ukande <strong>"Add to Home Screen"</strong>.</li>
              <li>Kanda <strong>"Add"</strong> hejuru iburyo.</li>
            </ol>
          </div>

        </div>

        {/* APP ADDRESS & COPY LINK */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wider">
              Link ya Nkorera App (Web Address)
            </label>
            <span className="text-xs text-emerald-400 font-mono select-all truncate block">{appUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-300">Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* WHY INSTALL BANNER */}
        <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Ibyiza byo Gushyiraho Nkorera App:</h5>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Iraremerewe cyane, ikora nta URL bar ibangamiye, ifunguka vuba cyane ku kanda kamwe gusa, igufasha gukora no gucapa Lesson plans za CBC / ECE no mu gihe internet iri hasi!
            </p>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>Nkorera PWA v1.0 • Progressive Web App</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Funga (Close)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
