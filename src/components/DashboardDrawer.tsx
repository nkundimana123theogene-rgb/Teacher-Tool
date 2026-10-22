import React, { useState } from 'react';
import { 
  X,
  FileText,
  Sparkles,
  FolderHeart,
  Edit3,
  Clock,
  BookOpen,
  Wrench,
  Layers,
  CheckSquare,
  Book,
  Search,
  Bookmark,
  History,
  Folder,
  FileSpreadsheet,
  GraduationCap,
  Files,
  CreditCard,
  Award,
  DollarSign,
  HelpCircle,
  MessageSquare,
  Settings,
  User,
  ShieldCheck,
  Shield,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Filter,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types';

interface DashboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenLessonPlanningHub: () => void;
  onOpenCbcModal: (mode: 'create' | 'edit') => void;
  onOpenRemedialModal: () => void;
  onOpenMyPlans: () => void;
  onOpenTeacherBook: () => void;
  onOpenTeacherResources: (tab: 'prompts' | 'cbc_tools' | 'materials' | 'assessment') => void;
  onOpenRebBooks: () => void;
  onOpenProfessionalBook: () => void;
  onOpenTeacherRecords: (tab: 'cahier' | 'professional' | 'teaching' | 'documents') => void;
  onOpenSubscription: () => void;
  onOpenHelp: () => void;
  onOpenDevProfile: () => void;
  onOpenInstall: () => void;
  onOpenAdmin: () => void;
  onOpenDirectory: () => void;
  onOpenChatbot?: () => void;
  onOpenSavetoAi?: () => void;
  onLogout: () => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  onOpenPrintableWorksheet?: () => void;
  onOpenMergePdfs?: () => void;
  onOpenPresentation?: () => void;
  onOpenClassDiary?: () => void;
  onOpenLibrary?: () => void;
  onOpenStudentId?: () => void;
  onOpenRobotModal?: () => void;
  onOpenFilterServices?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const DashboardDrawer: React.FC<DashboardDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenLessonPlanningHub,
  onOpenCbcModal,
  onOpenRemedialModal,
  onOpenMyPlans,
  onOpenTeacherBook,
  onOpenTeacherResources,
  onOpenRebBooks,
  onOpenProfessionalBook,
  onOpenTeacherRecords,
  onOpenSubscription,
  onOpenHelp,
  onOpenDevProfile,
  onOpenInstall,
  onOpenAdmin,
  onOpenDirectory,
  onOpenChatbot,
  onOpenSavetoAi,
  onLogout,
  onOpenHomeworkQuiz,
  onOpenPrintableWorksheet,
  onOpenMergePdfs,
  onOpenPresentation,
  onOpenClassDiary,
  onOpenLibrary,
  onOpenStudentId,
  onOpenRobotModal,
  onOpenFilterServices,
  isDarkMode = true,
  onToggleDarkMode,
}) => {
  // Accordion state for expandable categories (all open by default as requested in tree view)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lessonPlanning: true,
    teacherResources: true,
    rebBooks: true,
    myRecords: true,
    subscription: true,
    helpSupport: true,
    settings: true,
    administration: true
  });

  const currentYear = new Date().getFullYear();

  if (!isOpen) return null;

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in bg-slate-950/80 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* SIDEBAR DRAWER PANEL */}
      <aside 
        className="relative z-10 w-full max-w-xs sm:max-w-sm bg-slate-900 border-r border-slate-800 text-slate-200 h-full flex flex-col shadow-2xl overflow-hidden animate-slide-in-left"
        id="nkorera-dashboard-sidebar"
      >
        {/* HEADER BRANDING */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-wider uppercase leading-none">
                NKORERA
              </h1>
              <p className="text-[11px] font-bold text-emerald-400 tracking-wide mt-0.5">
                Education Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
            title="Close Navigation"
            aria-label="Close Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE TREE NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-sans text-xs select-none custom-scrollbar">

          {/* 🏠 DASHBOARD */}
          <button
            onClick={() => handleAction(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); })}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-black text-slate-100 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all text-left group cursor-pointer shadow-sm"
          >
            <span className="text-base">🏠</span>
            <span className="text-xs font-black tracking-wide text-emerald-300 group-hover:text-white">
              Dashboard
            </span>
          </button>

          {/* 🔍 FILTER ANY SERVICES YOU NEED IN THIS WEBSITE */}
          {onOpenFilterServices && (
            <button
              onClick={() => handleAction(onOpenFilterServices)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black text-white bg-slate-950 border-2 border-emerald-500/60 hover:border-emerald-400 transition-all text-left group cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Filter className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white group-hover:text-emerald-300 block truncate">
                    Filter Services (25+)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block truncate">
                    Filter any services you need
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-950 bg-emerald-400 px-2 py-0.5 rounded-md shrink-0">
                Filter
              </span>
            </button>
          )}

          {/* 🤖 SAVETO AI (TEACHER AI COPILOT) */}
          {onOpenSavetoAi && (
            <button
              onClick={() => handleAction(onOpenSavetoAi)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 border border-emerald-400/60 transition-all text-left group cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🤖</span>
                <div>
                  <span className="text-xs font-black tracking-wide block uppercase">
                    Saveto AI Studio
                  </span>
                  <span className="text-[10px] text-slate-900 font-bold block">
                    Teacher AI Copilot (CBC)
                  </span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => handleAction(onOpenDirectory)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-black text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-all text-left group cursor-pointer shadow-sm"
          >
            <LayoutGrid className="w-5 h-5 text-emerald-400 group-hover:rotate-90 transition-transform" />
            <span className="text-xs font-black tracking-wide text-emerald-300 group-hover:text-white">
              Explore All Features
            </span>
          </button>

          <div className="h-px bg-slate-800 my-2" />

          {/* 📝 LESSON PLANNING ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('lessonPlanning')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📝</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Lesson Planning</span>
              </div>
              {expandedSections.lessonPlanning ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.lessonPlanning && (
              <div className="pl-3.5 space-y-0.5 border-l border-emerald-500/20 ml-3.5 my-1 text-[11px]">
                {/* ✨ OPEN ALL */}
                <button
                  onClick={() => handleAction(onOpenLessonPlanningHub)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md mb-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>✨ OPEN ALL LESSON TOOLS</span>
                  </span>
                  <span className="text-[9px] bg-slate-950/40 px-1.5 py-0.5 rounded">HUB</span>
                </button>

                {/* ├─ Create CBC Lesson Plan */}
                <button
                  onClick={() => handleAction(() => onOpenCbcModal('create'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">├─</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">1. Create CBC Lesson Plan</span>
                </button>

                {/* ├─ Create Homework */}
                <button
                  onClick={() => handleAction(() => onOpenHomeworkQuiz?.('homework'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <span className="text-xs">📝</span>
                  <span className="font-semibold group-hover:text-amber-200">2. Create Homework & Exercises (AI)</span>
                </button>

                {/* ├─ Create Classwork */}
                <button
                  onClick={() => handleAction(() => onOpenHomeworkQuiz?.('classwork'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <span className="text-xs">✏️</span>
                  <span className="font-semibold group-hover:text-amber-200">3. Create Classwork & Practice (AI)</span>
                </button>

                {/* ├─ Create Quiz */}
                <button
                  onClick={() => handleAction(() => onOpenHomeworkQuiz?.('quiz'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <span className="text-xs">📋</span>
                  <span className="font-semibold group-hover:text-amber-200">4. Create Quiz & Assessment (AI)</span>
                </button>

                {/* ├─ Printable Worksheet */}
                <button
                  onClick={() => handleAction(() => onOpenPrintableWorksheet?.())}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <span className="text-xs">📄</span>
                  <span className="font-semibold group-hover:text-teal-200">5. Printable Worksheet Generator</span>
                </button>

                {/* ├─ AI Presentation Slides */}
                <button
                  onClick={() => handleAction(() => onOpenPresentation?.())}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-purple-300 hover:bg-purple-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-purple-400 font-mono">├─</span>
                  <span className="text-xs">📊</span>
                  <span className="font-semibold group-hover:text-purple-200">6. AI Presentation & Slides Studio</span>
                </button>

                {/* ├─ Create Remedial Plan */}
                <button
                  onClick={() => handleAction(onOpenRemedialModal)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">7. Create Remedial Plan</span>
                </button>

                {/* ├─ My Lesson Plans */}
                <button
                  onClick={() => handleAction(onOpenMyPlans)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-cyan-400 font-mono">├─</span>
                  <FolderHeart className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold group-hover:text-cyan-200">8. My Lesson Plans</span>
                </button>

                {/* ├─ Drafts */}
                <button
                  onClick={() => handleAction(() => onOpenCbcModal('edit'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <Edit3 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">9. Drafts</span>
                </button>

                {/* ├─ Student Identification Form */}
                <button
                  onClick={() => handleAction(onOpenStudentId || (() => {}))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-rose-400 font-mono">├─</span>
                  <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-semibold group-hover:text-rose-200">10. School Identification of Students</span>
                </button>

                {/* └─ Recently Used */}
                <button
                  onClick={() => handleAction(onOpenMyPlans)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">└─</span>
                  <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">11. Recently Used</span>
                </button>
              </div>
            )}
          </div>

          {/* 📚 TEACHER RESOURCES ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('teacherResources')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📚</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Teacher Resources</span>
              </div>
              {expandedSections.teacherResources ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.teacherResources && (
              <div className="pl-3.5 space-y-0.5 border-l border-blue-500/20 ml-3.5 my-1 text-[11px]">
                {/* ✨ OPEN ALL */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherResources('prompts'))}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white font-black text-xs shadow-md mb-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>✨ OPEN ALL RESOURCES</span>
                  </span>
                  <span className="text-[9px] bg-slate-950/40 px-1.5 py-0.5 rounded">HUB</span>
                </button>

                {/* ├─ Teacher Book */}
                <button
                  onClick={() => handleAction(onOpenTeacherBook)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">├─</span>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">1. Teacher Book</span>
                </button>

                {/* ├─ Professional Book */}
                <button
                  onClick={() => handleAction(onOpenProfessionalBook)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">2. Professional Book (Handbook)</span>
                </button>

                {/* ├─ Lesson Plan Prompts */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherResources('prompts'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-blue-300 hover:bg-blue-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-blue-400 font-mono">├─</span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold group-hover:text-blue-200">3. Lesson Plan Prompts</span>
                </button>

                {/* ├─ CBC Tools */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherResources('cbc_tools'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-cyan-400 font-mono">├─</span>
                  <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold group-hover:text-cyan-200">4. CBC Tools</span>
                </button>

                {/* ├─ Teaching Materials */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherResources('materials'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">5. Teaching Materials</span>
                </button>

                {/* ├─ Assessment Tools */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherResources('assessment'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">├─</span>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">6. Assessment Tools</span>
                </button>

                {/* └─ Merge PDFs Tool */}
                <button
                  onClick={() => handleAction(() => onOpenMergePdfs?.())}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">└─</span>
                  <Files className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">7. Merge PDFs (Combine Files)</span>
                </button>
              </div>
            )}
          </div>

          {/* 📖 REB BOOKS {currentYear} ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('rebBooks')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📖</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">REB Books {currentYear}</span>
              </div>
              {expandedSections.rebBooks ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.rebBooks && (
              <div className="pl-3.5 space-y-0.5 border-l border-amber-500/20 ml-3.5 my-1 text-[11px]">
                {/* ✨ OPEN ALL */}
                <button
                  onClick={() => handleAction(onOpenRebBooks)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs shadow-md mb-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>✨ OPEN ALL BOOKS</span>
                  </span>
                  <span className="text-[9px] bg-slate-950/40 px-1.5 py-0.5 rounded">LIBRARY</span>
                </button>

                {/* ├─ Primary Books */}
                <button
                  onClick={() => handleAction(onOpenRebBooks)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <Book className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">1. Primary Books</span>
                </button>

                {/* ├─ Secondary Books */}
                <button
                  onClick={() => handleAction(onOpenRebBooks)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-blue-300 hover:bg-blue-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-blue-400 font-mono">├─</span>
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold group-hover:text-blue-200">2. Secondary Books</span>
                </button>

                {/* ├─ Search Books */}
                <button
                  onClick={() => handleAction(onOpenRebBooks)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <Search className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">3. Search Books</span>
                </button>

                {/* ├─ My Bookmarks */}
                <button
                  onClick={() => handleAction(onOpenRebBooks)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-rose-400 font-mono">├─</span>
                  <Bookmark className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-semibold group-hover:text-rose-200">4. My Bookmarks</span>
                </button>

                {/* └─ Recently Opened */}
                <button
                  onClick={() => handleAction(onOpenRebBooks)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">└─</span>
                  <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">5. Recently Opened</span>
                </button>
              </div>
            )}
          </div>

          {/* 📂 MY RECORDS ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('myRecords')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📂</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">My Records</span>
              </div>
              {expandedSections.myRecords ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.myRecords && (
              <div className="pl-3.5 space-y-0.5 border-l border-amber-500/20 ml-3.5 my-1 text-[11px]">
                {/* ✨ OPEN ALL */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherRecords('cahier'))}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-teal-600 text-white font-black text-xs shadow-md mb-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>✨ OPEN ALL RECORDS</span>
                  </span>
                  <span className="text-[9px] bg-slate-950/40 px-1.5 py-0.5 rounded">HUB</span>
                </button>

                {/* ├─ Cahier des Charges */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherRecords('cahier'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">1. Cahier des Charges</span>
                </button>

                {/* ├─ Professional Records */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherRecords('professional'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-cyan-400 font-mono">├─</span>
                  <Folder className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold group-hover:text-cyan-200">2. Professional Records</span>
                </button>

                {/* ├─ Teaching Records */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherRecords('teaching'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">├─</span>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">3. Teaching Records</span>
                </button>

                {/* └─ Documents */}
                <button
                  onClick={() => handleAction(() => onOpenTeacherRecords('documents'))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <Files className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">4. Documents</span>
                </button>

                {/* └─ Class Diary */}
                <button
                  onClick={() => handleAction(onOpenClassDiary || (() => {}))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">└─</span>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">5. Class Diary</span>
                </button>

                {/* └─ Library */}
                <button
                  onClick={() => handleAction(onOpenLibrary || (() => {}))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-sky-300 hover:bg-sky-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-sky-400 font-mono">├─</span>
                  <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-semibold group-hover:text-sky-200">6. Library</span>
                </button>

                {/* └─ Student ID Form */}
                <button
                  onClick={() => handleAction(onOpenStudentId || (() => {}))}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-rose-400 font-mono">└─</span>
                  <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-semibold group-hover:text-rose-200">7. Student ID Form</span>
                </button>
              </div>
            )}
          </div>

          {/* 💳 SUBSCRIPTION ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('subscription')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">💳</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Subscription</span>
              </div>
              {expandedSections.subscription ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.subscription && (
              <div className="pl-3.5 space-y-0.5 border-l border-amber-500/20 ml-3.5 my-1 text-[11px]">
                {/* ├─ My Subscription */}
                <button
                  onClick={() => handleAction(onOpenSubscription)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">1. My Subscription</span>
                </button>

                {/* ├─ Remaining Quota */}
                <button
                  onClick={() => handleAction(onOpenSubscription)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">├─</span>
                  <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">2. Remaining Quota ({currentUser?.remainingPlans ?? 0})</span>
                </button>

                {/* ├─ Available Plans */}
                <button
                  onClick={() => handleAction(onOpenSubscription)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-cyan-400 font-mono">├─</span>
                  <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold group-hover:text-cyan-200">3. Available Plans (16 Tiers)</span>
                </button>

                {/* └─ Billing / Payments */}
                <button
                  onClick={() => handleAction(onOpenSubscription)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">└─</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">4. Billing / Payments (MoMo / Airtel)</span>
                </button>
              </div>
            )}
          </div>

          {/* ❓ HELP & SUPPORT ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('helpSupport')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">❓</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Help & Support</span>
              </div>
              {expandedSections.helpSupport ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.helpSupport && (
              <div className="pl-3.5 space-y-0.5 border-l border-rose-500/20 ml-3.5 my-1 text-[11px]">
                {/* ├─ Nkorera AI Chatbot */}
                {onOpenChatbot && (
                  <button
                    onClick={() => handleAction(onOpenChatbot)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50 border border-emerald-500/30 transition-colors text-left group cursor-pointer font-bold mb-1"
                  >
                    <span className="text-emerald-500 font-mono">├─</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                    <span className="font-bold">1. Nkorera AI Chatbot (Assistant)</span>
                  </button>
                )}

                {/* ├─ Help Center */}
                <button
                  onClick={() => handleAction(onOpenHelp)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-rose-400 font-mono">├─</span>
                  <HelpCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-semibold group-hover:text-rose-200">2. Help Center</span>
                </button>

                {/* ├─ FAQs */}
                <button
                  onClick={() => handleAction(onOpenHelp)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-amber-400 font-mono">├─</span>
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold group-hover:text-amber-200">3. FAQs</span>
                </button>

                {/* ├─ User Guide */}
                <button
                  onClick={() => handleAction(onOpenHelp)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-blue-300 hover:bg-blue-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-blue-400 font-mono">├─</span>
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold group-hover:text-blue-200">4. User Guide</span>
                </button>

                {/* └─ Contact Support */}
                <button
                  onClick={() => handleAction(onOpenHelp)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">└─</span>
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">5. Contact Support (WhatsApp / Call)</span>
                </button>
              </div>
            )}
          </div>

          {/* ⚙️ SETTINGS ▾ */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 font-bold transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Settings</span>
              </div>
              {expandedSections.settings ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedSections.settings && (
              <div className="pl-3.5 space-y-0.5 border-l border-slate-700 ml-3.5 my-1 text-[11px]">
                {/* ├─ My Profile */}
                <button
                  onClick={() => handleAction(onOpenDevProfile)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">1. My Profile</span>
                </button>

                {/* ├─ Account Settings */}
                <button
                  onClick={() => handleAction(onOpenDevProfile)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-teal-400 font-mono">├─</span>
                  <Settings className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-semibold group-hover:text-teal-200">2. Account Settings</span>
                </button>

                {/* └─ Security */}
                <button
                  onClick={() => handleAction(onOpenDevProfile)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors text-left group cursor-pointer"
                >
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono">└─</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold group-hover:text-emerald-200">3. Security & Cloud Access</span>
                </button>
              </div>
            )}
          </div>

          {/* 🤖 ROBOT NETWORK ASSISTANT (ONLY WHEN OFFLINE) */}
          {onOpenRobotModal && typeof navigator !== 'undefined' && !navigator.onLine && (
            <button
              onClick={() => handleAction(onOpenRobotModal)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-300 hover:text-white bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 hover:border-red-400 transition-all text-left group cursor-pointer"
            >
              <span className="text-sm">🤖</span>
              <span className="font-bold text-red-200 group-hover:text-white">
                AI Robot Offline Alert
              </span>
            </button>
          )}

          {/* 📱 DOWNLOAD / INSTALL APP */}
          <button
            onClick={() => handleAction(onOpenInstall)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">📱</span>
              <span className="font-bold text-slate-200 group-hover:text-emerald-200">
                Download & Install App
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">PWA</span>
          </button>

          <div className="h-px bg-slate-800 my-2" />

          {/* 🛡️ ADMINISTRATION (ADMIN PANEL) */}
          {currentUser?.email === 'nkundimana123theogene@gmail.com' && (
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('administration')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-amber-950/40 text-amber-300 font-bold transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛡️</span>
                  <span className="font-black text-amber-300 uppercase tracking-wider text-[11px]">ADMINISTRATION</span>
                </div>
                {expandedSections.administration ? (
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>

              {expandedSections.administration && (
                <div className="pl-3.5 space-y-0.5 border-l border-amber-500/30 ml-3.5 my-1 text-[11px]">
                  {/* └─ Admin Panel */}
                  <button
                    onClick={() => handleAction(onOpenAdmin)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900/40 transition-colors text-left group cursor-pointer"
                  >
                    <span className="text-amber-400 font-mono">└─</span>
                    <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold group-hover:text-white">Admin Panel</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🌙/☀️ DARK MODE TOGGLE */}
          {onToggleDarkMode && (
            <button
              onClick={() => handleAction(onToggleDarkMode)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 transition-all text-left group cursor-pointer shadow-sm mt-2"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform shrink-0" />
                )}
                <span className="font-bold text-xs">
                  {isDarkMode ? "Dark Mode (Ikijuju)" : "Light Mode (Umucyo)"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                isDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {isDarkMode ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* 🚪 LOGOUT */}
          <button
            onClick={() => handleAction(onLogout)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-500/30 transition-all text-left group cursor-pointer mt-2 shadow-sm"
          >
            <span className="text-sm">🚪</span>
            <span className="font-bold text-rose-300 group-hover:text-rose-100">
              Logout Session ({currentUser?.name || 'Teacher'})
            </span>
          </button>

        </div>

        {/* FOOTER USER STATUS */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="truncate">
            <span className="block font-bold text-emerald-400 truncate">{currentUser?.name || 'NKUNDIMANA Theogene'}</span>
            <span className="block text-[10px] text-slate-500 truncate">{currentUser?.email}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[9px] border border-emerald-500/30 shrink-0">
            {currentUser?.remainingPlans ?? 0} Plans
          </span>
        </div>
      </aside>
    </div>
  );
};
