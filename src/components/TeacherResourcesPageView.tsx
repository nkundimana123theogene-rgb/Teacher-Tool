import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Wrench, 
  CheckSquare, 
  BookOpen, 
  Bookmark,
  Files,
  Bot
} from 'lucide-react';
import { LessonPlanPromptsStudio } from './LessonPlanPromptsStudio';
import { CbcToolsStudio } from './CbcToolsStudio';
import { TeachingMaterialsStudio } from './TeachingMaterialsStudio';
import { AssessmentToolsStudio } from './AssessmentToolsStudio';
import { SavetoAiStudio } from './SavetoAiStudio';
import { ResourceTab } from './TeacherResourcesModal';

interface TeacherResourcesPageViewProps {
  initialTab?: ResourceTab;
  onOpenTeacherBook: () => void;
  onOpenProfessionalBook: () => void;
  onOpenMergePdfs?: () => void;
  onOpenPresentation?: () => void;
  onOpenCbcModal?: (mode: 'create' | 'edit') => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  onBackToDashboard: () => void;
}

export const TeacherResourcesPageView: React.FC<TeacherResourcesPageViewProps> = ({
  initialTab = 'saveto_ai',
  onOpenTeacherBook,
  onOpenProfessionalBook,
  onOpenMergePdfs,
  onOpenPresentation,
  onOpenCbcModal,
  onOpenHomeworkQuiz,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<ResourceTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* HEADER & TABS */}
      <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-2xl">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  TEACHER TOOLKIT
                </span>
                <span className="text-blue-400 text-xs font-bold">REB Rwandan Curriculum Standards & AI Studio</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Teacher Resources & Pedagogical Aids
              </h2>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenTeacherBook}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher Book</span>
            </button>
            <button
              onClick={onOpenProfessionalBook}
              className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Professional Book</span>
            </button>
            {onOpenPresentation && (
              <button
                onClick={onOpenPresentation}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📊</span>
                <span>Presentation Studio</span>
              </button>
            )}
            {onOpenMergePdfs && (
              <button
                onClick={onOpenMergePdfs}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Files className="w-3.5 h-3.5" />
                <span>Merge PDFs</span>
              </button>
            )}
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              &larr; Dashboard
            </button>
          </div>
        </div>

        {/* RESOURCE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-nav pt-1 pb-2">
          <button
            onClick={() => setActiveTab('saveto_ai')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'saveto_ai'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/50 scale-105 border border-orange-400'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-orange-500/40 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-orange-400" />
            <span>✨ 1. Saveto AI Studio (English)</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'prompts'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 scale-105 border border-blue-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>2. Lesson Plan Prompts</span>
          </button>

          <button
            onClick={() => setActiveTab('cbc_tools')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'cbc_tools'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 scale-105 border border-blue-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>3. CBC Tools & Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 scale-105 border border-blue-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>4. Teaching Materials</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 scale-105 border border-blue-400'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>5. Assessment Tools</span>
          </button>
        </div>
      </div>

      {/* ACTIVE STUDIO CONTENT */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
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
  );
};
