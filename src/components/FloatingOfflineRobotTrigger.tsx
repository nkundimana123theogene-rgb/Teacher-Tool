import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Volume2 } from 'lucide-react';
import robotImage from '../assets/images/robot_offline_assistant_1788383530402.jpg';
import { subscribeToRobotSpeechState, speakRobotOfflineAlert } from '../utils/robotVoice';

interface FloatingOfflineRobotTriggerProps {
  isOnline: boolean;
  onOpenRobotModal: () => void;
}

export const FloatingOfflineRobotTrigger: React.FC<FloatingOfflineRobotTriggerProps> = ({
  isOnline,
  onOpenRobotModal,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRobotSpeechState(setIsSpeaking);
    return () => unsub();
  }, []);

  // When offline, show this interactive floating robot buddy
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2"
        >
          {/* SPEECH CHIP */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-2xl shadow-xl shadow-cyan-500/20 text-xs text-cyan-200 font-bold flex items-center gap-2 max-w-xs cursor-pointer hover:border-cyan-400 transition-all"
            onClick={() => {
              speakRobotOfflineAlert();
              onOpenRobotModal();
            }}
          >
            <WifiOff className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
            <span className="truncate">Now! You're Offline...</span>
            <Volume2 className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${isSpeaking ? 'animate-ping' : ''}`} />
          </motion.div>

          {/* FLOATING ROBOT AVATAR BUTTON */}
          <motion.button
            onClick={onOpenRobotModal}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-2xl shadow-cyan-500/40 bg-slate-900 cursor-pointer p-0.5 group"
            title="AI Robot Network Assistant - Click to open"
          >
            <img
              src={robotImage}
              alt="Offline Robot Assistant"
              className="w-full h-full object-cover object-top rounded-xl group-hover:scale-110 transition-transform duration-300"
            />

            {/* Offline badge */}
            <span className="absolute top-1 left-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />

            {/* Speaking audio wave */}
            {isSpeaking && (
              <span className="absolute inset-0 rounded-xl border-2 border-cyan-300 animate-ping opacity-75" />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
