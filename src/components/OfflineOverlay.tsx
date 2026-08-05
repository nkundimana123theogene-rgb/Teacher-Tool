import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { LanguageOption } from '../types';

interface OfflineOverlayProps {
  isNetworkOnline: boolean;
  selectedLanguage: LanguageOption;
  onRetry: () => void;
}

export const OfflineOverlay: React.FC<OfflineOverlayProps> = ({
  isNetworkOnline,
  selectedLanguage,
  onRetry,
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const isKiny = selectedLanguage === 'Kinyarwanda';

  // Only show the full screen overlay if we are genuinely offline
  useEffect(() => {
    if (!isNetworkOnline) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [isNetworkOnline]);

  if (!showOverlay) return null;

  const handleManualCheck = async () => {
    setIsChecking(true);
    // Simulate active check / ping server
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('/api/health', { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        onRetry();
      }
    } catch (e) {
      console.log('Still offline', e);
    }
    setTimeout(() => {
      setIsChecking(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300 print:hidden">
      <div className="bg-slate-900 border-2 border-rose-500 max-w-lg w-full text-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden my-auto">
        
        {/* Close Button to allow viewing offline cached data */}
        <button
          onClick={() => setShowOverlay(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full border border-slate-700/50 hover:bg-slate-700 transition-all active:scale-95"
          title={isKiny ? 'Funga urebe ibyabitswe' : 'Dismiss to view cached plans'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* HIGH-FIDELITY VIDEO / VECTOR ANIMATION */}
        <div className="relative w-full h-56 flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
          {/* Real Video Element Player (with SVG fallback if video not uploaded/loaded) */}
          <video 
            src="/offline-video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-10"
            onError={(e) => {
              (e.currentTarget as HTMLVideoElement).style.display = 'none';
            }}
          />
          
          {/* Animated Background Rays / Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

          <svg viewBox="0 0 400 240" className="w-full h-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
            {/* DEFINITIONS FOR GRADIENTS AND ANIMATIONS */}
            <defs>
              <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#854d0e" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="poleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              
              {/* Scratching Head Animation */}
              <style>
                {`
                  @keyframes scratch {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    50% { transform: rotate(5deg); }
                    75% { transform: rotate(-5deg); }
                  }
                  @keyframes signal {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                  }
                  @keyframes exclamationPulse {
                    0%, 100% { transform: scale(1); fill: #ef4444; }
                    50% { transform: scale(1.15); fill: #f43f5e; }
                  }
                  @keyframes floatSign {
                    0%, 100% { transform: translateY(0px) rotate(-1deg); }
                    50% { transform: translateY(-4px) rotate(1deg); }
                  }
                  @keyframes characterFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                  }
                  .scratch-arm {
                    animation: scratch 2s infinite ease-in-out;
                    transform-origin: 228px 125px;
                  }
                  .wifi-wave-1 {
                    animation: signal 1.5s infinite 0.2s;
                  }
                  .wifi-wave-2 {
                    animation: signal 1.5s infinite 0.5s;
                  }
                  .wifi-wave-3 {
                    animation: signal 1.5s infinite 0.8s;
                  }
                  .exclamation-mark {
                    animation: exclamationPulse 1s infinite ease-in-out;
                    transform-origin: 280px 48px;
                  }
                  .signpost-group {
                    animation: floatSign 4s infinite ease-in-out;
                  }
                  .character-group {
                    animation: characterFloat 3.5s infinite ease-in-out;
                  }
                `}
              </style>
            </defs>

            {/* BASE FLOOR GRID OR STAND */}
            <ellipse cx="200" cy="210" rx="140" ry="12" fill="#1e293b" opacity="0.6" />

            {/* SIGNPOST ("NO INTERNET AVAILABLE") */}
            <g className="signpost-group">
              {/* Vertical wood pole */}
              <rect x="85" y="60" width="10" height="150" fill="url(#poleGrad)" rx="2" />
              
              {/* Top Board "NO" */}
              <g transform="translate(45, 75) rotate(-3)">
                <rect x="0" y="0" width="90" height="26" fill="url(#woodGrad)" rx="4" stroke="#451a03" strokeWidth="2" />
                <rect x="3" y="3" width="84" height="20" fill="none" stroke="#a16207" strokeWidth="1" strokeDasharray="3,1" opacity="0.6" />
                <text x="45" y="18" fill="#fef08a" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">NO</text>
              </g>

              {/* Middle Board "INTERNET" */}
              <g transform="translate(35, 105) rotate(2)">
                <rect x="0" y="0" width="110" height="28" fill="url(#woodGrad)" rx="4" stroke="#451a03" strokeWidth="2" />
                <rect x="3" y="3" width="104" height="22" fill="none" stroke="#a16207" strokeWidth="1" strokeDasharray="3,1" opacity="0.6" />
                <text x="55" y="19" fill="#fef08a" fontSize="12" fontWeight="950" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">INTERNET</text>
              </g>

              {/* Bottom Board "Available" */}
              <g transform="translate(40, 137) rotate(-2)">
                <rect x="0" y="0" width="100" height="26" fill="url(#woodGrad)" rx="4" stroke="#451a03" strokeWidth="2" />
                <rect x="3" y="3" width="94" height="20" fill="none" stroke="#a16207" strokeWidth="1" strokeDasharray="3,1" opacity="0.6" />
                <text x="50" y="17" fill="#fef08a" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">Available</text>
              </g>

              {/* Little nails on boards */}
              <circle cx="90" cy="88" r="1.5" fill="#475569" />
              <circle cx="90" cy="119" r="1.5" fill="#475569" />
              <circle cx="90" cy="150" r="1.5" fill="#475569" />
            </g>

            {/* CHARACTER (The worried teacher looking at device) */}
            <g className="character-group">
              {/* Legs */}
              <rect x="198" y="170" width="8" height="40" fill="#0f172a" rx="2" />
              <rect x="214" y="170" width="8" height="40" fill="#0f172a" rx="2" />
              
              {/* Shoes */}
              <ellipse cx="202" cy="210" rx="7" ry="4" fill="#334155" />
              <ellipse cx="218" cy="210" rx="7" ry="4" fill="#334155" />

              {/* Torso/Shirt */}
              <path d="M 188,170 C 188,135 232,135 232,170 Z" fill="url(#shirtGrad)" />

              {/* Head & Face */}
              <circle cx="210" cy="115" r="18" fill="#ffedd5" />
              
              {/* Hair (Black, neatly styled) */}
              <path d="M 192,112 C 192,95 228,95 228,112 C 224,103 216,100 210,103 C 204,100 196,103 192,112 Z" fill="#020617" />
              <rect x="192" y="110" width="5" height="10" fill="#020617" rx="1" />
              <rect x="223" y="110" width="5" height="10" fill="#020617" rx="1" />

              {/* Eyes & Mouth (Worried expression) */}
              {/* Worried eyebrows */}
              <path d="M 198,110 Q 203,107 205,111" stroke="#020617" strokeWidth="1.5" fill="none" />
              <path d="M 222,110 Q 217,107 215,111" stroke="#020617" strokeWidth="1.5" fill="none" />
              {/* Eyes */}
              <circle cx="202" cy="115" r="1.5" fill="#020617" />
              <circle cx="218" cy="115" r="1.5" fill="#020617" />
              {/* Mouth - squiggly or worried curve */}
              <path d="M 206,126 Q 210,123 214,126" stroke="#020617" strokeWidth="1.5" fill="none" />

              {/* Left Arm holding the Tablet */}
              <path d="M 190,142 Q 172,150 182,160" stroke="#ffedd5" strokeWidth="7" strokeLinecap="round" fill="none" />
              {/* Tablet/Device */}
              <rect x="168" y="145" width="22" height="15" fill="#475569" rx="2" stroke="#94a3b8" strokeWidth="1" transform="rotate(-15, 179, 152)" />
              <rect x="170" y="147" width="18" height="11" fill="#0f172a" transform="rotate(-15, 179, 152)" />
              {/* Tiny device glow */}
              <ellipse cx="178" cy="151" rx="4" ry="2" fill="#38bdf8" opacity="0.3" transform="rotate(-15, 179, 152)" />

              {/* Right Arm Scratching Head (Animated) */}
              <g className="scratch-arm">
                <path d="M 230,142 Q 248,118 226,105" stroke="#ffedd5" strokeWidth="6.5" strokeLinecap="round" fill="none" />
              </g>
            </g>

            {/* WI-FI EXCLAMATION SPEECH BUBBLE */}
            <g transform="translate(250, 20)">
              {/* Speech bubble background */}
              <path d="M 15,35 L 5,45 L 20,43 C 50,43 50,10 25,10 C 5,10 5,35 15,35" fill="url(#bubbleGrad)" stroke="#475569" strokeWidth="1.5" />
              
              {/* Wi-Fi Icon (Strokes/Waves) */}
              <g transform="translate(18, 14) scale(0.65)">
                {/* Dot */}
                <circle cx="15" cy="22" r="2" fill="#475569" />
                {/* Wave 1 */}
                <path d="M 11,18 A 6,6 0 0,1 19,18" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" className="wifi-wave-1" />
                {/* Wave 2 */}
                <path d="M 7,14 A 12,12 0 0,1 23,14" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" className="wifi-wave-2" />
                {/* Wave 3 */}
                <path d="M 3,10 A 18,18 0 0,1 27,10" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" className="wifi-wave-3" />
              </g>

              {/* Flashing Exclamation Badge on top-right of Wi-Fi Bubble */}
              <g className="exclamation-mark" transform="translate(35, 8)">
                <circle cx="0" cy="0" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 0,-5 L 0,1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="0" cy="4" r="1" fill="#ffffff" />
              </g>
            </g>
          </svg>
        </div>

        {/* MESSAGES & ERROR INFORMATION */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>{isKiny ? 'Guhuza Kwasandaye' : 'Connection Interrupted'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {isKiny ? 'Banza Ushake Internet!' : 'Active Connection Required!'}
          </h2>

          <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
            {isKiny 
              ? 'Porogaramu yabuze interineti. Banza ufungure Wi-Fi cyangwa data (Mégabytes) kugira ngo ushobore gukoresha AI n\'ibindi bintu byose neza cyane.'
              : 'Our system detected you are offline. Please enable Wi-Fi or cellular data to unlock full CBC planning, exercises generation, and AI features.'}
          </p>
        </div>

        {/* BUTTON ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Retry Button */}
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-red-950/40 border border-red-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>
              {isChecking 
                ? (isKiny ? 'Gusuzuma muyoboro...' : 'Checking connection...') 
                : (isKiny ? 'Ongera Ugerageze' : 'Try Reconnecting')}
            </span>
          </button>

          {/* Read Cached Offline Button */}
          <button
            onClick={() => setShowOverlay(false)}
            className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isKiny ? 'Soma Ibyabitswe' : 'Read Offline Plans'}
          </button>
        </div>

        {/* Footer info verification */}
        <div className="pt-4 border-t border-slate-800/60 text-center text-[10px] text-slate-400 font-semibold">
          {isKiny 
            ? 'Ushobora gusoma no gukoresha amateguro wabitse muri memory yawe ukanze ku "Soma Ibyabitswe"' 
            : 'You can continue to browse and edit all locally saved and cached lesson plans without internet.'}
        </div>
      </div>
    </div>
  );
};
