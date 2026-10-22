import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, FileText, Calendar, Edit3, ClipboardList } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const resources = [
  { title: 'RTB/TVET Scheme of Work', description: 'Browse RTB/TVET modules, competencies and term schemes for Rwanda.', icon: BookOpen },
  { title: 'REB Scheme of Work', description: 'Build and browse complete term-long schemes of work.', icon: Calendar },
  { title: 'Lesson Notes', description: 'Bullet-point notes for every unit, taken from the official books.', icon: FileText },
  { title: 'Exercises', description: 'The books\' own end-of-unit questions, with the answers worked out.', icon: Edit3 },
  { title: 'Homework', description: 'Homework for each unit, with answers, ready to give out.', icon: ClipboardList },
];

export const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose }) => {
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
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Library</h2>
                <p className="text-sm text-slate-400">Curriculum materials and planning resources for Rwanda.</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res, i) => (
                <div key={i} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-900 rounded-lg text-emerald-400">
                            <res.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-white">{res.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{res.description}</p>
                  </div>
                  <button className="text-emerald-400 text-sm font-bold hover:text-emerald-300 w-fit">Open resource →</button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
