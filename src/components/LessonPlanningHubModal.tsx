import React from 'react';
import { 
  X, 
  Sparkles, 
  Edit3, 
  Clock, 
  FolderHeart, 
  Layers, 
  ArrowRight, 
  FileText,
  BookOpen,
  Wrench,
  CheckSquare,
  Bookmark,
  FileSpreadsheet,
  User
} from 'lucide-react';

interface LessonPlanningHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCbcModal: (mode: 'create' | 'edit') => void;
  onOpenSchemeOfWork: () => void;
  onOpenRemedialModal: () => void;
  onOpenNurseryModal: () => void;
  onOpenMyPlans: () => void;
  onOpenTeacherBook?: () => void;
  onOpenProfessionalBook?: () => void;
  onOpenTeacherResources: (tab: 'prompts' | 'cbc_tools' | 'materials' | 'assessment') => void;
  onOpenPresentation?: () => void;
  onOpenStudentId?: () => void;
}

export const LessonPlanningHubModal: React.FC<LessonPlanningHubModalProps> = ({
  isOpen,
  onClose,
  onOpenCbcModal,
  onOpenSchemeOfWork,
  onOpenRemedialModal,
  onOpenNurseryModal,
  onOpenMyPlans,
  onOpenTeacherBook,
  onOpenProfessionalBook,
  onOpenTeacherResources,
  onOpenPresentation,
  onOpenStudentId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-4 overflow-hidden animate-fade-in">
      <div className="bg-slate-900 w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col text-slate-100">
        
        {/* HEADER */}
        <div className="bg-slate-950 px-6 py-4 md:py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                  LESSON PLANNING HUB
                </span>
                <span className="text-emerald-400 text-xs font-bold">REB 2026 CBC Rwanda Standard</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Ibikubiye muri Lesson Planning (All Lesson Planning Modules)
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-950">
          
          {/* INTRO BANNER */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 md:p-5 rounded-2xl border border-emerald-500/30">
            <h3 className="text-sm md:text-base font-black text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Comprehensive Lesson Planning Tools in one place:</span>
            </h3>
            <p className="text-xs text-slate-300">
              Click any module to open immediately: CBC 7-Steps Lesson Plan, Nursery Plan, Remedial Plan, Saved Plans Library, and pedagogical tools.
            </p>
          </div>

          {/* PRIMARY MODULES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* CARD 0: SCHEME OF WORK */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group hover:bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    REB STANDARD
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    1. Scheme of Work (AI)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    Create complete REB CBC Schemes of Work with competency assessments and teaching methodologies.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenSchemeOfWork();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CREATE SCHEME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CARD 1: CBC LESSON PLAN */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group hover:bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    PRIMARY / SEC / TVET
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                    2. CBC Lesson Plan
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    Plan competency-based lessons (CBC 2026): SMART objectives, 7 lesson steps, and formative evaluation.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCbcModal('create');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CREATE CBC PLAN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CARD 2: NURSERY LESSON PLAN */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-400/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group hover:bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    ECE / NURSERY
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                    3. Nursery Lesson Plan
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    Plan Early Childhood / Nursery lessons: Educational play, Greeting circle, and foundational activities.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenNurseryModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CREATE NURSERY PLAN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CARD 3: REMEDIAL LESSON PLAN */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group hover:bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    SCAFFOLDING & AI
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    4. Remedial Lesson Plan
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    Design targeted remedial lessons with AI for slow and struggling learners.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenRemedialModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CREATE REMEDIAL PLAN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CARD 4: MY SAVED PLANS LIBRARY */}
            <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group hover:bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <FolderHeart className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                    MY REPOSITORY
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">
                    5. My Saved Plans Library
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    View, edit, export to PDF, or duplicate your saved lesson plans.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenMyPlans();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN SAVED PLANS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CARD 5: STUDENT IDENTIFICATION FORM */}
            <div className="bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group hover:bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                    REGISTRATION
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                    6. Student Identification Form
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    Student Identification Forms: Personal details, parent contact records, and study modes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenStudentId) onOpenStudentId();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN IDENTIFICATION FORM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* SECONDARY ROW: TEACHER BOOKS & PEDAGOGICAL AID STUDIOS */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Teacher Guides & Pedagogical Studios:</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
              
              {/* AI Presentation Slides */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenPresentation) onOpenPresentation();
                }}
                className="p-3 bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base group-hover:scale-110 transition-transform">📊</span>
                  <span className="font-bold text-white group-hover:text-purple-300">1. Presentation Studio</span>
                </div>
                <span className="text-[10px] text-slate-400">AI Slides & Projector Mode</span>
              </button>

              {/* Teacher Book */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenTeacherBook) onOpenTeacherBook();
                }}
                className="p-3 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white group-hover:text-emerald-300">2. Teacher Book (REB)</span>
                </div>
                <span className="text-[10px] text-slate-400">Teacher Guides & Textbooks</span>
              </button>

              {/* Professional Book */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenProfessionalBook) onOpenProfessionalBook();
                }}
                className="p-3 bg-slate-950 hover:bg-teal-950/60 border border-slate-800 hover:border-teal-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Bookmark className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white group-hover:text-teal-300">3. Professional Book</span>
                </div>
                <span className="text-[10px] text-slate-400">Handbook & Standards</span>
              </button>

              {/* Prompts Studio */}
              <button
                onClick={() => {
                  onClose();
                  onOpenTeacherResources('prompts');
                }}
                className="p-3 bg-slate-950 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white group-hover:text-blue-300">4. Prompts Studio</span>
                </div>
                <span className="text-[10px] text-slate-400">SMART Verbs & Hooks AI</span>
              </button>

              {/* CBC Tools Studio */}
              <button
                onClick={() => {
                  onClose();
                  onOpenTeacherResources('cbc_tools');
                }}
                className="p-3 bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Wrench className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white group-hover:text-cyan-300">5. CBC Tools & Matrix</span>
                </div>
                <span className="text-[10px] text-slate-400">Bloom's & Time Allocator</span>
              </button>

              {/* Teaching Materials */}
              <button
                onClick={() => {
                  onClose();
                  onOpenTeacherResources('materials');
                }}
                className="p-3 bg-slate-950 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white group-hover:text-amber-300">6. Teaching Materials</span>
                </div>
                <span className="text-[10px] text-slate-400">Improvised Local Materials</span>
              </button>

              {/* Assessment Tools */}
              <button
                onClick={() => {
                  onClose();
                  onOpenTeacherResources('assessment');
                }}
                className="p-3 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckSquare className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white group-hover:text-rose-300">7. Assessment Tools</span>
                </div>
                <span className="text-[10px] text-slate-400">3-Tier Grading Rubrics</span>
              </button>

            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 text-white rounded-b-3xl">
          <p className="text-xs text-slate-400 font-bold">
            Nkorera Education Portal • REB CBC Rwanda Complete Suite
          </p>
          <button
            onClick={onClose}
            className="px-6 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LessonPlanningHubModal;
