import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClassDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassDiaryModal: React.FC<ClassDiaryModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'week' | 'list'>('week');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Class Diary</h2>
                <p className="text-sm text-slate-400">Record your daily lessons and generate reports</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-5 flex items-center justify-between border-b border-slate-800 gap-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold">REB</button>
                <button className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-700">RTB</button>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-700 rounded-xl text-sm font-bold text-slate-300">Weekly PDF</button>
                <button className="px-4 py-2 border border-slate-700 rounded-xl text-sm font-bold text-slate-300">Custom PDF</button>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold">New Entry</button>
              </div>
            </div>

            {/* Content Table Placeholder */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-800 rounded"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-bold">31 Aug 2026 – 4 Sep 2026</span>
                    <button className="p-1 hover:bg-slate-800 rounded"><ChevronRight className="w-5 h-5"/></button>
                </div>
                <div className="flex border border-slate-700 rounded-xl">
                    <button onClick={() => setView('week')} className={`px-4 py-2 text-sm font-bold ${view === 'week' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Week</button>
                    <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-bold ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>List</button>
                </div>
              </div>
              
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                    <div key={day} className={`flex items-center justify-between p-4 ${i !== 4 ? 'border-b border-slate-800' : ''}`}>
                        <div className="flex items-center gap-4">
                            <span className="font-bold w-24">{day}</span>
                            <span className="text-slate-500 text-sm">31 Aug 2026</span>
                            <span className="text-amber-500 text-sm font-bold">Not filled yet</span>
                        </div>
                        <button className="text-emerald-400 text-sm font-bold flex items-center gap-1 hover:text-emerald-300">
                            + Fill this day
                        </button>
                    </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
