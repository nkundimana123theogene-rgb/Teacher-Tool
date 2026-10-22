import React, { useState, useEffect } from 'react';
import { X, Sparkles, Layers, Wrench, CheckSquare, Bot } from 'lucide-react';
import { LessonPlanPromptsStudio } from './LessonPlanPromptsStudio';
import { CbcToolsStudio } from './CbcToolsStudio';
import { TeachingMaterialsStudio } from './TeachingMaterialsStudio';
import { AssessmentToolsStudio } from './AssessmentToolsStudio';
import { SavetoAiStudio } from './SavetoAiStudio';

export type ResourceTab = 'saveto_ai' | 'prompts' | 'cbc_tools' | 'materials' | 'assessment';

interface TeacherResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ResourceTab;
  onOpenCbcModal?: (mode: 'create' | 'edit') => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
}

export const TeacherResourcesModal: React.FC<TeacherResourcesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'saveto_ai',
  onOpenCbcModal,
  onOpenHomeworkQuiz
}) => {
  const [activeTab, setActiveTab] = useState<ResourceTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-4 overflow-hidden animate-fade-in">
      <div className="bg-slate-900 w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col text-slate-100">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-500/40 rounded-2xl">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                  TEACHER TOOLKIT
                </span>
                <span className="text-blue-400 text-xs font-bold">REB Rwandan Curriculum & Pedagogical Aids</span>
              </div>
              <h2 className="text-base md:text-lg font-black text-white">
                Teacher Resources & Pedagogical Aids
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          
          <button
            onClick={() => setActiveTab('saveto_ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'saveto_ai'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg font-black shadow-orange-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-orange-500/30'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-orange-400" />
            <span>✨ 1. Saveto AI Studio (English)</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'bg-blue-600 text-white shadow-lg font-black shadow-blue-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>💡 2. Lesson Plan Prompts</span>
          </button>

          <button
            onClick={() => setActiveTab('cbc_tools')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cbc_tools'
                ? 'bg-teal-600 text-white shadow-lg font-black shadow-teal-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>🛠️ 3. CBC Tools & Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'materials'
                ? 'bg-purple-600 text-white shadow-lg font-black shadow-purple-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🧩 4. Teaching Materials (Low-Cost)</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'assessment'
                ? 'bg-rose-600 text-white shadow-lg font-black shadow-rose-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>📊 5. Assessment Tools & Rubrics</span>
          </button>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'saveto_ai' && (
              <SavetoAiStudio 
                onOpenCbcModal={onOpenCbcModal} 
                onOpenHomeworkQuiz={onOpenHomeworkQuiz}
                embeddedMode={true} 
              />
            )}
            {activeTab === 'prompts' && <LessonPlanPromptsStudio />}
            {activeTab === 'cbc_tools' && <CbcToolsStudio />}
            {activeTab === 'materials' && <TeachingMaterialsStudio />}
            {activeTab === 'assessment' && <AssessmentToolsStudio />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 text-white rounded-b-3xl">
          <p className="text-xs text-slate-400 font-bold">
            Rwanda CBC Educational Resources & Scaffolding Studio
          </p>
          <button
            onClick={onClose}
            className="px-6 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
