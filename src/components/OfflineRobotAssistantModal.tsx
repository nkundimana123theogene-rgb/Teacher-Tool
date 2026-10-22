import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Laptop,
  Hand,
  Network
} from 'lucide-react';
import robotImage from '../assets/images/robot_offline_assistant_1788383530402.jpg';
import { 
  speakRobotOfflineAlert, 
  speakRobotOnlineSuccess, 
  stopRobotSpeech, 
  subscribeToRobotSpeechState 
} from '../utils/robotVoice';

interface OfflineRobotAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onRetryConnection?: () => Promise<boolean> | void;
}

export const OfflineRobotAssistantModal: React.FC<OfflineRobotAssistantModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onRetryConnection,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'success' | 'failed' | null>(null);

  // Subscribe to robot speech status for live gestures
  useEffect(() => {
    const unsub = subscribeToRobotSpeechState(setIsSpeaking);
    return () => unsub();
  }, []);

  // When modal opens while offline, speak automatically with gesture towards computer
  useEffect(() => {
    if (isOpen && !isOnline && !isMuted) {
      const timer = setTimeout(() => {
        speakRobotOfflineAlert();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isOnline, isMuted]);

  // When connection becomes online while modal is open, automatically celebrate, announce and close
  useEffect(() => {
    if (isOpen && isOnline) {
      setCheckResult('success');
      if (!isMuted) {
        speakRobotOnlineSuccess("Good Job! Now You're Online!");
      }
      const closeTimer = setTimeout(() => {
        onClose();
      }, 1800);
      return () => clearTimeout(closeTimer);
    }
  }, [isOpen, isOnline, isMuted, onClose]);

  const handleSpeakClick = () => {
    if (isSpeaking) {
      stopRobotSpeech();
    } else {
      speakRobotOfflineAlert();
    }
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      stopRobotSpeech();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      speakRobotOfflineAlert();
    }
  };

  const handleCheckConnection = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      if (onRetryConnection) {
        await onRetryConnection();
      } else {
        await new Promise((res) => setTimeout(res, 1200));
      }
      
      const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : false;
      if (onlineNow) {
        setCheckResult('success');
        if (!isMuted) {
          speakRobotOnlineSuccess("Good Job! Now You're Online!");
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setCheckResult('failed');
        speakRobotOfflineAlert("Now! You're Offline. No internet connection on this computer. Please search for internet connection.");
      }
    } catch {
      setCheckResult('failed');
      speakRobotOfflineAlert("Now! You're Offline. No internet connection. Please search for internet connection.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          {/* Backdrop animated glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-radial from-red-950/40 via-slate-950/90 to-black/95"
          />

          {/* MAIN ROBOT MODAL CONTAINER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-500/25 overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]"
          >
            {/* TOP HEADER BAR */}
            <div className="px-5 py-3.5 bg-slate-950/95 border-b border-red-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-red-400 block animate-ping absolute inset-0 opacity-75" />
                  <span className="w-3 h-3 rounded-full bg-red-500 block relative border border-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-red-300 tracking-wide uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    AI Robot Computer Gestures • Network Alert
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isOnline ? 'Computer is Online' : 'No Internet Connection Detected on Computer'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* MUTE TOGGLE */}
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl border transition-all ${
                    isMuted
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : 'bg-slate-800/80 border-slate-700 text-cyan-300 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute Robot Voice' : 'Mute Robot Voice'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => {
                    stopRobotSpeech();
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-all cursor-pointer"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
              
              {/* ROBOT & COMPUTER GESTURE INTERACTIVE STAGE */}
              <div className="relative w-full bg-slate-950 flex flex-col items-center justify-center p-4 rounded-2xl overflow-hidden border border-red-500/30">
                {/* Background radar waves */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-72 h-72 rounded-full border border-red-500/30 animate-ping duration-1000" />
                  <div className="w-96 h-96 rounded-full border border-cyan-400/20 animate-pulse duration-700 absolute" />
                </div>

                {/* SIDE-BY-SIDE INTERACTION: ROBOT POINTING GESTURE DIRECTLY AT THE COMPUTER */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full relative z-10">
                  
                  {/* ROBOT CHARACTER WITH POINTING GESTURE */}
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      rotate: [0, 0.5, -0.5, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/80 shadow-xl shadow-cyan-500/40 w-44 sm:w-52 aspect-[9/13] bg-slate-900 shrink-0"
                  >
                    <img
                      src={robotImage}
                      alt="Futuristic Robot pointing gesture at computer"
                      className="w-full h-full object-cover object-top filter contrast-105"
                    />

                    {/* FINGER GESTURE POINTING LIGHT BEAM TO COMPUTER */}
                    <div className="absolute top-[32%] left-[32%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="absolute inset-0 w-8 h-8 rounded-full bg-cyan-400 opacity-80 animate-ping" />
                      <span className="absolute inset-1 w-6 h-6 rounded-full bg-cyan-300 blur-[2px]" />
                    </div>

                    {/* ROBOT CHEST CORE PULSING WITH SPEECH */}
                    <motion.div
                      animate={{
                        opacity: isSpeaking ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
                        scale: isSpeaking ? [1, 1.25, 1] : [1, 1.05, 1],
                      }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute top-[49%] left-[64%] w-4 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 blur-[3px] pointer-events-none"
                    />

                    {/* OFFLINE STATUS BADGE */}
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg border border-red-400/50">
                      <WifiOff className="w-3 h-3 animate-bounce" />
                      <span>OFFLINE</span>
                    </div>

                    {/* SPEAKING BADGE */}
                    {isSpeaking && (
                      <div className="absolute top-2 right-2 bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg animate-pulse">
                        <Radio className="w-3 h-3 animate-spin" />
                        <span>SPEAKING</span>
                      </div>
                    )}
                  </motion.div>

                  {/* ➡️ GESTURE ARROW & BEAM (ROBOT -> COMPUTER) */}
                  <div className="hidden sm:flex flex-col items-center justify-center gap-1 text-cyan-400 animate-pulse">
                    <Hand className="w-6 h-6 text-cyan-300 animate-bounce" />
                    <motion.div
                      animate={{ x: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-xs font-black text-cyan-200 uppercase tracking-wider"
                    >
                      Gesture ➔
                    </motion.div>
                  </div>

                  {/* 💻 COMPUTER SCREEN (ONLY TARGET OF GESTURE) */}
                  <motion.div
                    animate={{
                      scale: isSpeaking ? [1, 1.03, 1] : 1,
                      borderColor: isSpeaking ? ['rgba(239, 68, 68, 0.6)', 'rgba(6, 182, 212, 0.8)', 'rgba(239, 68, 68, 0.6)'] : 'rgba(239, 68, 68, 0.6)',
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-500/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-xl shadow-red-500/20 w-full max-w-[240px]"
                  >
                    {/* Gesture pointing target beacon */}
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white p-1 rounded-full animate-bounce shadow-md">
                      <WifiOff className="w-4 h-4" />
                    </div>

                    {/* Realistic Laptop Illustration */}
                    <div className="relative w-28 h-24 flex flex-col items-center justify-center mb-2">
                      {/* Laptop Screen Bezel */}
                      <div className="w-24 h-16 bg-slate-950 border-2 border-slate-700 rounded-t-lg p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                        {/* Screen Header Notch */}
                        <div className="w-2 h-1 bg-slate-800 rounded-full mb-1" />
                        {/* Screen Content: Computer with Wi-Fi disconnected pulse */}
                        <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center relative">
                          <Laptop className="w-8 h-8 text-cyan-400" />
                          <span className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center gap-0.5">
                            <WifiOff className="w-5 h-5 text-red-400 animate-bounce" />
                            <span className="text-[8px] font-black text-red-300">NO INTERNET</span>
                          </span>
                        </div>
                      </div>
                      {/* Laptop Keyboard Base & Trackpad */}
                      <div className="w-28 h-3.5 bg-slate-800 border-x-2 border-b-2 border-slate-600 rounded-b-lg relative shadow-lg">
                        <div className="w-8 h-1 bg-slate-700 rounded-full mx-auto mt-0.5" />
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-cyan-400" />
                      Computer / Laptop
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Your computer has no internet connection
                    </p>

                    <div className="mt-2 w-full py-1 px-2 rounded-lg bg-red-500/20 border border-red-500/40 text-[10px] font-extrabold text-red-300 flex items-center justify-center gap-1">
                      <Network className="w-3 h-3 text-red-400 animate-spin" />
                      <span>Search Computer Connection</span>
                    </div>
                  </motion.div>

                </div>
              </div>

              {/* SPEECH BUBBLE & AUDIO CONTROLS */}
              <div className="relative bg-gradient-to-r from-slate-800 to-slate-850 border border-red-500/30 rounded-2xl p-4 shadow-inner">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-red-300" />
                        Robot Voice & Gesture Alert
                      </span>
                      {isSpeaking && (
                        <span className="flex items-center gap-0.5">
                          <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" />
                          <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        </span>
                      )}
                    </div>
                    <p className="text-white font-black text-base sm:text-lg leading-snug drop-shadow-sm">
                      "Now! You're Offline. No internet connection. Please search for internet connection."
                    </p>
                    <p className="text-cyan-200/80 text-xs mt-1 font-medium">
                      ⚠️ No active internet network detected on this computer. Please connect via Wi-Fi, Ethernet cable, or cellular hotspot.
                    </p>
                  </div>

                  {/* VOICE REPLAY BUTTON */}
                  <button
                    onClick={handleSpeakClick}
                    className={`p-3 rounded-2xl border font-black text-xs transition-all flex flex-col items-center justify-center shrink-0 cursor-pointer shadow-lg ${
                      isSpeaking
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/40 animate-pulse'
                        : 'bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border-cyan-400/40'
                    }`}
                    title={isSpeaking ? 'Stop Voice' : 'Replay Robot Alert Voice'}
                  >
                    <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                    <span className="text-[9px] mt-1 font-extrabold uppercase">
                      {isSpeaking ? 'Playing' : 'Replay'}
                    </span>
                  </button>
                </div>
              </div>

              {/* CONNECTION CHECK RESULT BANNER */}
              {checkResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                    checkResult === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/20 border-red-500/40 text-red-300'
                  }`}
                >
                  {checkResult === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                      <span className="font-extrabold text-emerald-300">Success! Now! You're Online! • Internet connection restored successfully.</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
                      <span>No internet detected on this computer. Please enable Wi-Fi or plug in an Ethernet / Modem cable.</span>
                    </>
                  )}
                </motion.div>
              )}

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* SEARCH / RETRY CONNECTION */}
                <button
                  onClick={handleCheckConnection}
                  disabled={isChecking}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer border border-red-400/40 disabled:opacity-50"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Searching for Internet...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-white" />
                      <span>Search Computer Connection</span>
                    </>
                  )}
                </button>

                {/* CONTINUE IN OFFLINE MODE */}
                <button
                  onClick={() => {
                    stopRobotSpeech();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <span>Continue in Offline Mode</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* OFFLINE CAPABILITY BADGE */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  Nkorera PWA securely caches your lesson plans on this computer
                </span>
                <span className="font-bold text-cyan-300">Offline Safe</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
