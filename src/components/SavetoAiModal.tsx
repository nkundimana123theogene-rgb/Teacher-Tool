import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ExternalLink 
} from 'lucide-react';
import { AppConfig } from '../types';
import { subscribeToAppConfig } from '../utils/realtime';
import { SavetoAiStudio } from './SavetoAiStudio';

interface SavetoAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCbcModal?: (mode: 'create' | 'edit') => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
}

export const SavetoAiModal: React.FC<SavetoAiModalProps> = ({
  isOpen,
  onClose,
  onOpenCbcModal,
  onOpenHomeworkQuiz
}) => {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const unsub = subscribeToAppConfig((cfg) => {
      setAppConfig(cfg);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-3 overflow-hidden animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full h-full max-w-[1550px] max-h-[96vh] bg-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80"
      >
        {/* TOP MODAL HEADER */}
        <header className="h-16 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 border border-orange-400">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Saveto AI</span>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                  Teacher Resources • English
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                AI Study, Flashcards, Summarizers, Quiz, Solvers & Presentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={`https://wa.me/${appConfig?.whatsappNumber || '250781339530'}?text=${encodeURIComponent('Hello Saveto AI Support! I need assistance with Nkorera Education App.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
            >
              <span>WhatsApp Support</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Saveto AI"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* WORKSPACE EMBED */}
        <div className="flex-1 overflow-y-auto">
          <SavetoAiStudio 
            onOpenCbcModal={onOpenCbcModal}
            onOpenHomeworkQuiz={onOpenHomeworkQuiz}
            embeddedMode={false}
          />
        </div>
      </motion.div>
    </div>
  );
};
