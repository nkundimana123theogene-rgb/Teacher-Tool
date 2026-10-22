import React from 'react';
import { 
  Sparkles, 
  Edit3, 
  FolderHeart, 
  FileText,
  BookOpen,
  Wrench,
  Bookmark,
  FileSpreadsheet,
  User
} from 'lucide-react';

interface LessonPlanningPageViewProps {
  onOpenCbcModal: (mode: 'create' | 'edit') => void;
  onOpenSchemeOfWork: () => void;
  onOpenRemedialModal: () => void;
  onOpenNurseryModal: () => void;
  onOpenMyPlans: () => void;
  onOpenTeacherBook?: () => void;
  onOpenProfessionalBook?: () => void;
  onOpenTeacherResources: (tab: 'prompts' | 'cbc_tools' | 'materials' | 'assessment') => void;
  onBackToDashboard: () => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  onOpenPrintableWorksheet?: () => void;
  onOpenMergePdfs?: () => void;
  onOpenPresentation?: () => void;
  onOpenStudentId?: () => void;
}

export const LessonPlanningPageView: React.FC<LessonPlanningPageViewProps> = ({
  onOpenCbcModal,
  onOpenSchemeOfWork,
  onOpenRemedialModal,
  onOpenNurseryModal,
  onOpenMyPlans,
  onOpenTeacherBook,
  onOpenProfessionalBook,
  onOpenTeacherResources,
  onBackToDashboard,
  onOpenHomeworkQuiz,
  onOpenPrintableWorksheet,
  onOpenMergePdfs,
  onOpenPresentation,
  onOpenStudentId
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* HEADER & BANNER */}
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl">
              <FileText className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  LESSON PLANNING HUB
                </span>
                <span className="text-emerald-400 text-xs font-bold">REB 2026 CBC Rwanda Standard</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Lesson Planning Modules & Curriculum Tools
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

        <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed max-w-3xl">
          Prepare original lesson plans compliant with Rwanda CBC 2026 standards. Select from 7-Step CBC plans, Early Childhood (ECE) plans, AI Remedial plans for struggling learners, or open your saved lesson archives.
        </p>
      </div>

      {/* PRIMARY LESSON PLANNING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        
        {/* CARD 0: SCHEME OF WORK (REB STANDARD 2026) */}
        <div className="bg-slate-900 border-2 border-amber-500/50 hover:border-amber-400 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-amber-950/40 group">
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
              <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                1. Scheme of Work (AI)
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Generate termly or weekly Scheme of Work following REB CBC guidelines: Structured tables with key competences, units, and lesson allocations.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSchemeOfWork}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>📋 Scheme of Work &rarr;</span>
          </button>
        </div>

        {/* CARD 2: CBC 7-STEPS PLAN */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-emerald-950/40 group">
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
              <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                2. CBC Lesson Plan (7-Steps)
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Competency-Based Curriculum (CBC 2026): SMART objectives, 7-step pedagogical flow, and rigorous assessment rubrics.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenCbcModal('create')}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>➕ CBC Plan &rarr;</span>
          </button>
        </div>

        {/* CARD 3: NURSERY LESSON PLAN */}
        <div className="bg-slate-900 border-2 border-emerald-400 hover:border-emerald-300 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-emerald-900/40 group">
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
              <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                3. Nursery Lesson Plan
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Early Childhood Education (ECE): Play-based learning, greeting circle activities, and developmental exercises (1-Page PDF).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNurseryModal}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>👶 Nursery Plan &rarr;</span>
          </button>
        </div>

        {/* CARD 4: REMEDIAL LESSON PLAN */}
        <div className="bg-slate-900 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-amber-950/40 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                AI SMART REMEDIAL
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                4. Remedial Lesson Plan (AI)
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Targeted remedial plans to support struggling learners and close learning gaps effectively.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRemedialModal}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>🤖 Remedial Plan &rarr;</span>
          </button>
        </div>

        {/* CARD 5: MY LESSON PLANS */}
        <div className="bg-slate-900 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-cyan-950/40 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <FolderHeart className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                SAVED ARCHIVES
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                5. My Library
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Your centralized vault of saved lesson plans: View previous plans, edit, read, and export directly to PDF.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenMyPlans}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <FolderHeart className="w-4 h-4 text-cyan-200" />
            <span>📂 Plans Library &rarr;</span>
          </button>
        </div>

        {/* CARD 6: HOMEWORK / CLASSWORK / QUIZ GENERATOR */}
        <div className="bg-slate-900 border-2 border-amber-400 hover:border-amber-300 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-amber-950/40 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                AI ASSESSMENT
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                6. Homework & Quiz (AI)
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Create Homework, Classwork, or Quizzes with comprehensive Answer Keys and Marking Schemes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onOpenHomeworkQuiz?.('homework')}
                className="py-1.5 px-1 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold transition-all text-center"
              >
                Homework
              </button>
              <button
                onClick={() => onOpenHomeworkQuiz?.('classwork')}
                className="py-1.5 px-1 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold transition-all text-center"
              >
                Classwork
              </button>
              <button
                onClick={() => onOpenHomeworkQuiz?.('quiz')}
                className="py-1.5 px-1 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold transition-all text-center"
              >
                Quiz
              </button>
            </div>

            <button
              onClick={() => onOpenHomeworkQuiz?.('homework')}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/50 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Assessment &rarr;</span>
            </button>
          </div>
        </div>

        {/* CARD 7: PRINTABLE WORKSHEET GENERATOR */}
        <div className="bg-slate-900 border-2 border-teal-400 hover:border-teal-300 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-teal-950/40 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                PRINT-READY PDF
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition-colors">
                7. Printable Worksheets
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Generate ready-to-print Worksheets featuring Multiple Choice, Matching, True/False, and Answer Keys.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenPrintableWorksheet?.()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>📄 Create Worksheet &rarr;</span>
          </button>
        </div>

        {/* CARD 8: AI PRESENTATION & SLIDES STUDIO */}
        <div className="bg-slate-900/90 border-2 border-purple-500/40 hover:border-purple-400 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-purple-950/40 group relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                AI SLIDES & PROJECTOR
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                8. AI Presentation & Slides Studio
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Create interactive presentation slides using AI for classroom projector display or export to PDF.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenPresentation?.()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="text-sm">📊</span>
            <span>Open Presentation Studio &rarr;</span>
          </button>
        </div>

        {/* CARD 9: SCHOOL IDENTIFICATION OF STUDENTS */}
        <div className="bg-slate-900/90 border-2 border-rose-500/40 hover:border-rose-400 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl hover:shadow-rose-950/40 group relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
                500 RWF / YEAR
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                9. Student Identification Form
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                Student Identification Forms: Personal details, parent contact records, and study modes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenStudentId?.()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer hover:scale-105 active:scale-95"
          >
            <User className="w-4 h-4" />
            <span>Open Student Identification &rarr;</span>
          </button>
        </div>

      </div>

      {/* SECONDARY PEDAGOGY LINKS & TOOLS */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span>Pedagogical Companion Tools for Lesson Planning:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <button
            onClick={() => onOpenPresentation?.()}
            className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/40 transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <span className="text-base">📊</span>
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-purple-300">Presentation Studio</h4>
            <p className="text-[11px] text-slate-400">Presentation slides and projector mode.</p>
          </button>
          <button
            onClick={onOpenTeacherBook}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-emerald-300">Teacher Book</h4>
            <p className="text-[11px] text-slate-400">Official teacher guides and support materials for lessons.</p>
          </button>

          <button
            onClick={onOpenProfessionalBook}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-teal-300">Professional Book</h4>
            <p className="text-[11px] text-slate-400">Professional standards and pedagogical rules for teachers.</p>
          </button>

          <button
            onClick={() => onOpenTeacherResources('prompts')}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-blue-300">Prompts Studio</h4>
            <p className="text-[11px] text-slate-400">AI Prompt engineering studio for CBC curriculum preparation.</p>
          </button>

          <button
            onClick={() => onOpenTeacherResources('cbc_tools')}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-teal-300">CBC Tools & Matrix</h4>
            <p className="text-[11px] text-slate-400">Competency matrix and curriculum implementation strategies.</p>
          </button>

          <button
            onClick={() => onOpenMergePdfs?.()}
            className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/80 transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white group-hover:text-amber-300">Merge PDFs</h4>
            <p className="text-[11px] text-slate-400">Combine multiple PDF documents into a single file.</p>
          </button>
        </div>
      </div>

    </div>
  );
};
