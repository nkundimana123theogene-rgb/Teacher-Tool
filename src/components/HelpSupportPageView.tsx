import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  PhoneCall, 
  Video, 
  FileText,
  Sparkles,
  Play
} from 'lucide-react';
import { AiVideoTutorialModal } from './AiVideoTutorialModal';

interface HelpSupportPageViewProps {
  onBackToDashboard: () => void;
  onOpenHelpModal: () => void;
  onOpenPromptsStudio?: () => void;
}

export const HelpSupportPageView: React.FC<HelpSupportPageViewProps> = ({
  onBackToDashboard,
  onOpenHelpModal,
  onOpenPromptsStudio
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
              <HelpCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  HELP & SUPPORT CENTER
                </span>
                <span className="text-emerald-400 text-xs font-bold">24/7 Teacher Assistance & WhatsApp</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Ikigo cy'Ubufasha n'Inyigisho (Help & Support Center)
              </h2>
            </div>
          </div>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Nkorera Education Portal helps you prepare comprehensive lesson plans easily and rapidly. If you have any questions or need assistance with platform features, contact us directly or watch our video tutorials.
        </p>
      </div>

      {/* SUPPORT CHANNELS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CHANNEL 1: WHATSAPP */}
        <div className="bg-slate-900 border-2 border-green-500/40 hover:border-green-400 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">1. WhatsApp Direct Support</h3>
              <p className="text-xs text-slate-300 mt-1">Contact us directly on WhatsApp for instant assistance with subscriptions or lesson preparation.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <p className="font-mono text-green-400 font-bold">+250 788 000 000</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Response within minutes (24/7)</p>
            </div>
          </div>
          <a
            href="https://wa.me/250788000000?text=Hello%20Nkorera%20Support%2C%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-950/50 hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp Support</span>
          </a>
        </div>

        {/* CHANNEL 2: PHONE CALL */}
        <div className="bg-slate-900 border-2 border-blue-500/40 hover:border-blue-400 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">2. Direct Phone Support</h3>
              <p className="text-xs text-slate-300 mt-1">Call directly to speak with an educational support representative.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <p className="font-mono text-blue-400 font-bold">+250 788 000 000 / 0720 000 000</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Available Monday to Sunday</p>
            </div>
          </div>
          <a
            href="tel:+250788000000"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Now</span>
          </a>
        </div>

        {/* CHANNEL 3: VIDEO TUTORIALS */}
        <div className="bg-slate-900 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">3. Video Tutorials</h3>
              <p className="text-xs text-slate-300 mt-1">Watch step-by-step video tutorials on using AI Prompts and preparing effective lessons.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <p className="text-amber-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Video AI Prompts Guide (35 Min)</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">How to Use AI Prompts • Full English Guide</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch AI Prompts Tutorials</span>
            </button>
            <button
              onClick={onOpenHelpModal}
              className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Help Desk</span>
            </button>
          </div>
        </div>

      </div>

      {/* FAQ SECTION */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Frequently Asked Questions (FAQ):</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-black text-emerald-300">Can I print my prepared lesson plans?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Yes absolutely! You can export any prepared lesson plan as Word (DOCX) or PDF, and send it to your printer. It matches the official REB format specifications.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-black text-emerald-300">How does the Remedial Lesson Plan work?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When you click Remedial Lesson Plan, enter the subject and student weak areas, and our AI will instantly generate an appropriate learning plan with support strategies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-black text-emerald-300">What happens when my subscription expires?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              All your previously saved lesson plans remain accessible in your library forever. To prepare new plans, you can extend your package under subscription settings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-black text-emerald-300">Can I use the application on my mobile phone?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Yes, Nkorera Education Portal is fully responsive on Smartphones, Tablets, and PCs. You can also click "Install App" to add it as a PWA home-screen app.
            </p>
          </div>
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
