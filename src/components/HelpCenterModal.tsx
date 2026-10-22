import React, { useState } from 'react';
import { X, HelpCircle, Mail, MessageSquare, ExternalLink, UserCheck, Globe, Play, Sparkles } from 'lucide-react';
import { AiVideoTutorialModal } from './AiVideoTutorialModal';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPromptsStudio?: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose, onOpenPromptsStudio }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
              <HelpCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                Help Center & Teacher Support
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">24/7 SUPPORT</span>
              </h2>
              <p className="text-xs text-slate-400">Welcome to the help center and teacher support in Rwanda.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* FEATURED VIDEO TUTORIAL CARD */}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  VIDEO TUTORIAL
                </span>
                <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  How to Use AI Prompts
                </span>
              </div>
              <h3 className="font-black text-white text-sm sm:text-base">
                🎥 Video AI Prompts: Guide on Using AI Prompts
              </h3>
              <p className="text-slate-300 text-xs max-w-md">
                Watch tutorial videos demonstrating how to prepare high-quality AI Prompts to generate Lesson Plans and export PDF.
              </p>
            </div>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Video Tutorial</span>
            </button>
          </div>

          {/* DIRECT SUPPORT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* WHATSAPP SUPPORT */}
            <a
              href="https://wa.me/250781339530"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">WhatsApp Direct Chat</h4>
                  <p className="text-[10px] text-slate-400">Speak with the IT Manager</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-emerald-400 font-bold font-mono text-xs">
                <span>+250 781 339 530</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            {/* EMAIL SUPPORT */}
            <a
              href="mailto:nkundimana123theogene@gmail.com"
              className="bg-slate-950 p-5 rounded-2xl border border-blue-500/40 hover:border-blue-400 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">Email Support</h4>
                  <p className="text-[10px] text-slate-400">Send an e-mail message</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-blue-400 font-bold font-mono text-[11px] truncate">
                <span className="truncate">nkundimana123theogene@gmail.com</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </div>
            </a>

          </div>

          {/* OFFICIAL TEACHER WEBSITES ECOSYSTEM */}
          <div className="bg-slate-950/90 p-5 rounded-2xl border border-amber-500/40 space-y-3">
            <h3 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> Official Teacher Web Apps Ecosystem
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-black uppercase">
                Primary & Secondary
              </span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              Official web ecosystem recommended for teachers to prepare CBC Lesson Plans and generate Student Marks & Report Cards (Primary & Secondary):
            </p>
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {/* Portal 1 */}
              <a
                href="https://teacherlessonplans.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                      Teacher Lesson Plans AI Studio
                    </h4>
                    <p className="text-[10px] text-slate-400">Standardized CBC Lesson Plans & REB Pedagogical AI Prompts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-500/30">
                  <span className="font-mono text-[11px]">teacherlessonplans.ai.studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

              {/* Portal 2 */}
              <a
                href="https://teacher-tool-nine.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                      Teacher Tool 9 Suite (Vercel)
                    </h4>
                    <p className="text-[10px] text-slate-400">All-in-One REB CBC Teaching Tools & Digital Resources</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  <span className="font-mono text-[11px]">teacher-tool-nine.vercel.app</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

              {/* Portal 3 */}
              <a
                href="https://specialcoach.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 hover:bg-slate-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                      Special Coach Report Cards
                    </h4>
                    <p className="text-[10px] text-slate-400">Student Marks Processing, Grading & Report Cards (Primary & Secondary)</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-500/30">
                  <span className="font-mono text-[11px]">specialcoach.ai.studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            </div>
          </div>

          {/* QUICK GUIDE SECTION */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-extrabold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Direct Developer Contact
            </h3>
            <div className="space-y-1.5 text-slate-300">
              <p><strong>IT Specialist & Platform Developer:</strong> Nkundimana Theogene</p>
              <p><strong>Phone / Mobile:</strong> 0781339530 / +250 781 339 530</p>
              <p><strong>Official Email:</strong> nkundimana123theogene@gmail.com</p>
              <p><strong>System Status:</strong> <span className="text-emerald-400 font-mono font-bold">● ACTIVE & SECURE 2026</span></p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] text-slate-400">
          <span>Nkorera Education Portal 2026 • Teacher Support Desk</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

      </div>

      {/* VIDEO AI PROMPTS TUTORIAL MODAL */}
      <AiVideoTutorialModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onOpenPromptsStudio={onOpenPromptsStudio}
      />

    </div>
  );
};
