import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface ClassroomGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  gsMayangeClassroom: string;
}

export const ClassroomGalleryModal: React.FC<ClassroomGalleryModalProps> = ({
  isOpen,
  onClose,
  userName,
  gsMayangeClassroom,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white border-2 border-emerald-500/60 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl text-slate-800 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl uppercase">
              G.S MAYANGE B
            </span>
            <div>
              <h2 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                Smart Mathematics Classroom
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.5 rounded-md">P6 CBC</span>
              </h2>
              <p className="text-[10px] text-slate-400">Modern Schooling Portal with Advanced Educational Technology</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* WELCOME BANNER ABOVE THE IMAGE (CIRCULAR ROTATING EMBLEM WITH EYE-FRIENDLY GRADIENT) */}
          <div className="flex flex-col items-center justify-center py-2 mb-2">
            {/* Rotating Circle Badge */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center rounded-full p-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 animate-spin-slow shadow-lg shadow-emerald-500/10">
              {/* Outer glow aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 opacity-20 blur-md animate-pulse" />
              
              {/* Inner container spinning in reverse to keep text upright */}
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-center p-3 z-10 border border-slate-200 animate-spin-slow-reverse">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]" />
                
                <div className="relative space-y-1 sm:space-y-1.5 animate-float">
                  <div className="mx-auto w-6.5 h-6.5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  
                  <h2 className="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-wider uppercase leading-tight max-w-[110px] sm:max-w-[130px]">
                    Welcome, {userName}
                  </h2>
                  
                  <div className="h-[2px] w-6 bg-emerald-500/30 mx-auto rounded-full" />
                  
                  <span className="text-[8px] sm:text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest block">
                    G.S MAYANGE B
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PHOTO VIEW CONTAINER */}
          <div className="bg-slate-950 rounded-2xl border-2 border-emerald-500/30 overflow-hidden relative group shadow-xl">
            <img 
              src={gsMayangeClassroom} 
              alt="G.S Mayange B Smart Mathematics Classroom" 
              className="w-full h-auto object-cover max-h-[500px]"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium shrink-0">
          <span>G.S MAYANGE B Mathematics Smart Class Showcase</span>
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
