import React from 'react';
import { X, User, Phone, CheckCircle2, ExternalLink } from 'lucide-react';

interface DevProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevProfileModal: React.FC<DevProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                Developer Profile
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">VIP LEAD</span>
              </h2>
              <p className="text-xs text-slate-400">IT Specialist & Creator of Nkorera Education Portal.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* PROFILE HERO CARD */}
          <div className="bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 p-6 rounded-2xl border border-emerald-500/40 space-y-4 text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-xl">
              👨‍💻
            </div>

            <div>
              <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
                NKUNDIMANA Theogene
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </h3>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">Software Engineer & IT Education Specialist</p>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
              NKUNDIMANA Theogene is the creator and developer of Nkorera Education Portal in Rwanda, designed to support and accelerate teachers' work in creating Competence-Based Curriculum (CBC) Lesson Plans, exams, and teaching aids in English.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] font-bold">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                👑 System Admin
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-full">
                🇷🇼 Rwanda REB Educator Tech
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full">
                ✨ AI Integration
              </span>
            </div>
          </div>

          {/* CONTACT INFO GRID */}
          <div className="space-y-2">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-bold">Phone / WhatsApp:</span>
              </div>
              <a href="https://wa.me/250781339530" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-mono font-black flex items-center gap-1 hover:underline">
                0781339530 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] text-slate-400">
          <span>Nkorera Education Portal 2026 • Lead Developer Profile</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

      </div>
    </div>
  );
};
