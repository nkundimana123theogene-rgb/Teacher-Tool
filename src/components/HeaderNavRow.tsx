import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles,
  BookOpen,
  Folder,
  CreditCard,
  HelpCircle,
  Shield,
  Download,
  ChevronDown,
  Book,
  Search,
  Bookmark,
  History,
  FileSpreadsheet,
  GraduationCap,
  Files,
  Award,
  Layers,
  DollarSign,
  MessageCircle,
  PhoneCall,
  Video,
  User,
  Wrench,
  CheckSquare,
  FolderHeart,
  Edit3,
  Clock,
  Bot,
  Radio,
  RefreshCw,
  Filter,
  X,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAutoSyncState, subscribeToAutoSyncState, triggerManualSync, AutoSyncState } from '../utils/autoSync';

export type MainViewType = 'dashboard' | 'lessonPlanning' | 'teacherResources' | 'rebBooks' | 'myRecords' | 'subscription' | 'helpSupport';

interface HeaderNavRowProps {
  currentUser: UserProfile | null;
  activeView: MainViewType;
  onSelectView: (view: MainViewType) => void;
  onOpenLessonPlanningHub: () => void;
  onOpenCbcModal: (mode: 'create' | 'edit') => void;
  onOpenSchemeOfWork?: () => void;
  onOpenRemedialModal: () => void;
  onOpenNurseryModal?: () => void;
  onOpenMyPlans: () => void;
  onOpenTeacherBook: () => void;
  onOpenTeacherResources: (tab: 'prompts' | 'cbc_tools' | 'materials' | 'assessment') => void;
  onOpenRebBooks: () => void;
  onOpenProfessionalBook: () => void;
  onOpenTeacherRecords: (tab: 'cahier' | 'professional' | 'teaching' | 'documents') => void;
  onOpenSubscription: () => void;
  onOpenPaymentHistory?: () => void;
  onOpenNotifications?: () => void;
  onOpenHelp: () => void;
  onOpenDevProfile: () => void;
  onOpenInstall: () => void;
  onOpenAdmin: () => void;
  onOpenChatbot?: () => void;
  onOpenSavetoAi?: () => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  onOpenPrintableWorksheet?: () => void;
  onOpenMergePdfs?: () => void;
  onOpenPresentation?: () => void;
  onOpenRobotModal?: () => void;
  onOpenStudentId?: () => void;
  onOpenCertificateCreator?: () => void;
  onOpenFilterServices?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

type DropdownKey = 'lessonPlanning' | 'teacherResources' | 'rebBooks' | 'myRecords' | 'subscription' | 'helpSupport' | null;

export const HeaderNavRow: React.FC<HeaderNavRowProps> = ({
  currentUser,
  activeView,
  onSelectView,
  onOpenLessonPlanningHub,
  onOpenCbcModal,
  onOpenSchemeOfWork,
  onOpenRemedialModal,
  onOpenNurseryModal,
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
  onOpenChatbot,
  onOpenSavetoAi,
  onOpenHomeworkQuiz,
  onOpenPrintableWorksheet,
  onOpenMergePdfs,
  onOpenPresentation,
  onOpenRobotModal,
  onOpenStudentId,
  onOpenCertificateCreator,
  onOpenFilterServices,
  isDarkMode = true,
  onToggleDarkMode,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [syncState, setSyncState] = useState<AutoSyncState>(getAutoSyncState());
  const [isTriggeringSync, setIsTriggeringSync] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  // Subscribe to live sync state
  useEffect(() => {
    const unsub = subscribeToAutoSyncState(setSyncState);
    return () => unsub();
  }, []);

  const handleManualSyncClick = async () => {
    setIsTriggeringSync(true);
    try {
      await triggerManualSync();
    } finally {
      setTimeout(() => setIsTriggeringSync(false), 800);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (callback: () => void) => {
    setActiveDropdown(null);
    setIsFilterModalOpen(false);
    callback();
  };

  // 🔍 Filter any services you need in this website
  const [serviceFilterQuery, setServiceFilterQuery] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterModalOpen]);

  const allServices = [
    {
      id: 'cbc_lesson',
      name: '1. CBC Lesson Plan Generator',
      category: 'Planning',
      desc: 'Competence-Based Curriculum standard Rwandan lesson plan with SMART objectives & 7 lesson steps.',
      icon: <Edit3 className="w-4 h-4 text-emerald-400" />,
      action: () => handleAction(() => onOpenCbcModal('create'))
    },
    {
      id: 'remedial_lesson',
      name: '2. Remedial Lesson Plan Generator',
      category: 'Planning',
      desc: 'Inclusive pedagogical lesson plan targeting struggling learners and personalized interventions.',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => handleAction(onOpenRemedialModal)
    },
    {
      id: 'nursery_lesson',
      name: '3. Nursery / ECE Lesson Plans',
      category: 'Planning',
      desc: 'Early Childhood Education lesson plan designed for kindergarten, play-based learning & numeracy.',
      icon: <GraduationCap className="w-4 h-4 text-pink-400" />,
      action: () => handleAction(onOpenNurseryModal || (() => {}))
    },
    {
      id: 'scheme_hub',
      name: '4. Scheme of Work & Planning Hub',
      category: 'Planning',
      desc: 'Official Rwandan REB Term 1, 2, and 3 schemes of work and comprehensive curriculum planner.',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-400" />,
      action: () => handleAction(onOpenSchemeOfWork || onOpenLessonPlanningHub)
    },
    {
      id: 'my_plans',
      name: '5. Saved Lesson Plans & Library',
      category: 'Planning',
      desc: 'View, edit, search, filter, print, and export all your saved lesson plans.',
      icon: <Folder className="w-4 h-4 text-cyan-400" />,
      action: () => handleAction(onOpenMyPlans)
    },
    {
      id: 'reb_books',
      name: '6. REB Curriculum Books & Syllabi',
      category: 'Resources',
      desc: 'Complete digital library of official Rwandan Education Board textbooks for Primary and Secondary.',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      action: () => handleAction(onOpenRebBooks)
    },
    {
      id: 'teacher_book',
      name: '7. Teacher\'s Tool Book (English Edition)',
      category: 'Resources',
      desc: 'Comprehensive pedagogical companion handbook with teaching strategies and lesson templates.',
      icon: <Book className="w-4 h-4 text-amber-400" />,
      action: () => handleAction(onOpenTeacherBook)
    },
    {
      id: 'prof_book',
      name: '8. Professional Education Book Edition',
      category: 'Resources',
      desc: 'Certified professional edition focusing on classroom management and learner assessment.',
      icon: <Award className="w-4 h-4 text-rose-400" />,
      action: () => handleAction(onOpenProfessionalBook)
    },
    {
      id: 'prompts_studio',
      name: '9. AI Lesson Plan Prompts Studio',
      category: 'AI Tools',
      desc: 'Tested and structured AI prompt engineering templates for crafting lesson plans.',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      action: () => handleAction(() => onOpenTeacherResources('prompts'))
    },
    {
      id: 'cahier_records',
      name: '10. Teacher\'s Cahier de Notes',
      category: 'Records',
      desc: 'Official notebook of student marks, continuous assessment, and term-end evaluations.',
      icon: <FileSpreadsheet className="w-4 h-4 text-teal-400" />,
      action: () => handleAction(() => onOpenTeacherRecords('cahier'))
    },
    {
      id: 'prof_records',
      name: '11. Professional Records & Documents',
      category: 'Records',
      desc: 'Official teaching portfolio, timetables, schemes, and administrative documentation.',
      icon: <Files className="w-4 h-4 text-emerald-400" />,
      action: () => handleAction(() => onOpenTeacherRecords('professional'))
    },
    {
      id: 'student_id',
      name: '12. School Identification of Students',
      category: 'Records',
      desc: 'Student official identification forms, parent contacts, emergency info, and batch PDF rosters.',
      icon: <User className="w-4 h-4 text-rose-400" />,
      action: () => handleAction(onOpenStudentId || (() => {}))
    },
    {
      id: 'homework_quiz',
      name: '13. Homework, Classwork & Quiz Maker',
      category: 'Planning',
      desc: 'Generate printable classroom quizzes, homework assignments, and exams with answer keys.',
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      action: () => handleAction(() => onOpenHomeworkQuiz?.('homework'))
    },
    {
      id: 'printable_worksheet',
      name: '14. Printable Worksheets Generator',
      category: 'Resources',
      desc: 'Generate ready-to-print student exercises, coloring sheets, and practice activities.',
      icon: <Download className="w-4 h-4 text-blue-400" />,
      action: () => handleAction(onOpenPrintableWorksheet || (() => {}))
    },
    {
      id: 'merge_pdfs',
      name: '15. Merge & Manage PDFs',
      category: 'Resources',
      desc: 'Combine lesson plans, schemes, worksheets, and books into single organized PDF documents.',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      action: () => handleAction(onOpenMergePdfs || (() => {}))
    },
    {
      id: 'presentation_slides',
      name: '16. AI Presentation Slides Generator',
      category: 'AI Tools',
      desc: 'Generate engaging classroom presentation slides and visual aids for any lesson topic.',
      icon: <Video className="w-4 h-4 text-amber-400" />,
      action: () => handleAction(onOpenPresentation || (() => {}))
    },
    {
      id: 'cert_creator',
      name: '17. AI Certificate Creator & Verification',
      category: 'Records',
      desc: 'Create official student merit certificates and verify digital certificate authenticity.',
      icon: <Award className="w-4 h-4 text-emerald-400" />,
      action: () => handleAction(onOpenCertificateCreator || (() => {}))
    },
    {
      id: 'saveto_ai',
      name: '18. Saveto AI Teacher Copilot',
      category: 'AI Tools',
      desc: 'Your pedagogical artificial intelligence companion for advice, planning, and pedagogy.',
      icon: <Bot className="w-4 h-4 text-amber-300" />,
      action: () => handleAction(onOpenSavetoAi || (() => {}))
    },
    {
      id: 'ai_chatbot',
      name: '19. AI Teacher Assistant Chatbot',
      category: 'AI Tools',
      desc: 'Instant interactive chatbot for teachers to answer questions on CBC curriculum and pedagogy.',
      icon: <MessageCircle className="w-4 h-4 text-cyan-400" />,
      action: () => handleAction(onOpenChatbot || (() => {}))
    },
    {
      id: 'auto_sync',
      name: '20. Automatic Cloud Data Sync',
      category: 'Support',
      desc: 'Synchronize your lesson plans, offline drafts, and records directly with cloud storage.',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      action: () => handleAction(handleManualSyncClick)
    },
    {
      id: 'sub_plans',
      name: '21. Subscription Plans & Quota',
      category: 'Support',
      desc: 'Check your active plan, upgrade plan quotas, view payment methods, and account perks.',
      icon: <CreditCard className="w-4 h-4 text-yellow-400" />,
      action: () => handleAction(onOpenSubscription)
    },
    {
      id: 'help_support',
      name: '22. Help Center & Support Desk',
      category: 'Support',
      desc: 'Access user documentation, video tutorials, teacher helpline, and system guidance.',
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
      action: () => handleAction(onOpenHelp)
    },
    {
      id: 'dev_profile',
      name: '23. Developer Profile & System Settings',
      category: 'Support',
      desc: 'Manage account credentials, interface preferences, security settings, and system version.',
      icon: <User className="w-4 h-4 text-slate-300" />,
      action: () => handleAction(onOpenDevProfile)
    },
    {
      id: 'robot_modal',
      name: '24. AI Robot Pedagogical Voice Assistant',
      category: 'AI Tools',
      desc: 'Interactive animated robotic teaching companion and smart Rwandan curriculum assistant.',
      icon: <Bot className="w-4 h-4 text-emerald-300" />,
      action: () => handleAction(onOpenRobotModal || (() => {}))
    },
    {
      id: 'pwa_install',
      name: '25. Download & Install App (PWA & Desktop)',
      category: 'Support',
      desc: 'Install Nkorera Education App directly to your Android, Windows, or Mac desktop for quick launch.',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      action: () => handleAction(onOpenInstall)
    }
  ];

  const filteredServices = allServices.filter(service => {
    const matchesCategory = selectedFilterCategory === 'All' || service.category === selectedFilterCategory;
    const q = serviceFilterQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesQuery = service.name.toLowerCase().includes(q) ||
      service.desc.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div ref={containerRef} className="w-full bg-slate-950/98 border-t border-b border-emerald-500/30 px-2 sm:px-4 pt-2 pb-2.5 overflow-x-auto custom-scrollbar-nav shadow-xl select-none relative z-40">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-2.5 min-w-max text-xs">

        {/* 🏠 DASHBOARD */}
        <button
          onClick={() => {
            setActiveDropdown(null);
            onSelectView('dashboard');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
            activeView === 'dashboard'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-105'
              : 'text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 hover:scale-105'
          }`}
          title="Open Dashboard and all features"
        >
          <span>🏠</span>
          <span className="font-extrabold tracking-wide">1. Dashboard</span>
        </button>

        {/* 🔍 FILTER ANY SERVICES YOU NEED IN THIS WEBSITE (PROMINENT HIGHLIGHT) */}
        <button
          onClick={() => {
            setActiveDropdown(null);
            if (onOpenFilterServices) {
              onOpenFilterServices();
            } else {
              setIsFilterModalOpen(true);
            }
          }}
          className="px-3.5 py-1.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 border border-emerald-400/60 shadow-md shadow-emerald-950/50 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          title="Filter any services you need in Nkorera Education Portal"
        >
          <Filter className="w-4 h-4 text-slate-950" />
          <span className="font-black tracking-wide text-xs uppercase">2. Filter Services (25+)</span>
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
        </button>

        {/* 📝 LESSON PLANNING ▾ */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveDropdown(null);
                onSelectView('lessonPlanning');
              }}
              className={`px-3 py-1.5 rounded-l-xl font-black border-y border-l transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeView === 'lessonPlanning'
                  ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-emerald-500/60 hover:text-emerald-300 hover:bg-slate-800'
              }`}
              title="Open all Lesson Planning features"
            >
              <span>📝</span>
              <span className="font-extrabold tracking-wide">3. Lesson Planning</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'lessonPlanning' ? null : 'lessonPlanning');
              }}
              className={`px-2 py-1.5 rounded-r-xl border-y border-r border-l border-slate-700/60 transition-all flex items-center cursor-pointer ${
                activeView === 'lessonPlanning'
                  ? 'bg-emerald-700 text-white border-emerald-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border-slate-700/80'
              }`}
              title="Lesson Planning Menu"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'lessonPlanning' ? 'rotate-180 text-white' : ''}`} />
            </button>
          </div>

          {activeDropdown === 'lessonPlanning' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900/98 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              <button
                onClick={() => {
                  onSelectView('lessonPlanning');
                  handleAction(onOpenLessonPlanningHub);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
                  <span>✨ OPEN ALL LESSON TOOLS</span>
                </div>
                <span className="text-[10px] bg-slate-950/50 text-emerald-200 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  Hub
                </span>
              </button>

              <div className="px-2 py-1 text-[10px] font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
                <span>📝</span>
                <span>Select Module:</span>
              </div>
              <button
                onClick={() => handleAction(() => onOpenCbcModal('create'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">Create CBC Lesson Plan</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenHomeworkQuiz?.('homework'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <span className="text-sm">📝</span>
                <span className="font-semibold text-xs group-hover:text-amber-200">Create Homework & Exercises (AI)</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenHomeworkQuiz?.('classwork'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <span className="text-sm">✏️</span>
                <span className="font-semibold text-xs group-hover:text-amber-200">Create Classwork & Practice (AI)</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenHomeworkQuiz?.('quiz'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <span className="text-sm">📋</span>
                <span className="font-semibold text-xs group-hover:text-amber-200">Create Quiz & Assessment (AI)</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenPrintableWorksheet?.())}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">├─</span>
                <span className="text-sm">📄</span>
                <span className="font-semibold text-xs group-hover:text-teal-200">Printable Worksheet Generator</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenPresentation?.())}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-purple-300 hover:bg-purple-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-purple-400 font-mono text-xs">├─</span>
                <span className="text-sm">📊</span>
                <span className="font-semibold text-xs group-hover:text-purple-200">AI Presentation & Slides Studio</span>
              </button>
              <button
                onClick={() => handleAction(onOpenRemedialModal)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Create Remedial Plan</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenNurseryModal?.())}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">Create Nursery Plan (ECE)</span>
              </button>
              <button
                onClick={() => handleAction(onOpenMyPlans)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-cyan-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-cyan-400 font-mono text-xs">├─</span>
                <FolderHeart className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-cyan-200">My Lesson Plans Library</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenCbcModal('edit'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">├─</span>
                <Edit3 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-teal-200">Drafts</span>
              </button>
              <button
                onClick={() => handleAction(onOpenMyPlans)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">└─</span>
                <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-teal-200">Recently Used</span>
              </button>
            </div>
          )}
        </div>

        {/* 📚 TEACHER RESOURCES ▾ */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveDropdown(null);
                onSelectView('teacherResources');
              }}
              className={`px-3 py-1.5 rounded-l-xl font-black border-y border-l transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeView === 'teacherResources'
                  ? 'bg-blue-600 text-white border-blue-400 font-black shadow-lg shadow-blue-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-blue-500/60 hover:text-blue-300 hover:bg-slate-800'
              }`}
              title="Open all Teacher Resources"
            >
              <span>📚</span>
              <span className="font-extrabold tracking-wide">4. Teacher Resources</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'teacherResources' ? null : 'teacherResources');
              }}
              className={`px-2 py-1.5 rounded-r-xl border-y border-r border-l border-slate-700/60 transition-all flex items-center cursor-pointer ${
                activeView === 'teacherResources'
                  ? 'bg-blue-700 text-white border-blue-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-blue-300 hover:bg-slate-800 border-slate-700/80'
              }`}
              title="Teacher Resources Menu"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'teacherResources' ? 'rotate-180 text-white' : ''}`} />
            </button>
          </div>

          {activeDropdown === 'teacherResources' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900/98 backdrop-blur-2xl border border-blue-500/40 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              <button
                onClick={() => {
                  onSelectView('teacherResources');
                  handleAction(() => onOpenTeacherResources('prompts'));
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
                  <span>✨ OPEN ALL RESOURCES</span>
                </div>
                <span className="text-[10px] bg-slate-950/50 text-blue-200 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  Hub
                </span>
              </button>

              <div className="px-2 py-1 text-[10px] font-black text-blue-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
                <span>📚</span>
                <span>Pedagogical Tools:</span>
              </div>
              <button
                onClick={() => handleAction(onOpenTeacherBook)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">Teacher Book</span>
              </button>
              <button
                onClick={() => handleAction(onOpenProfessionalBook)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">├─</span>
                <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-teal-200">Professional Book (Handbook)</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherResources('prompts'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-blue-300 hover:bg-blue-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-blue-400 font-mono text-xs">├─</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-blue-200">Lesson Plan Prompts Studio</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherResources('cbc_tools'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-cyan-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-cyan-400 font-mono text-xs">├─</span>
                <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-cyan-200">CBC Tools & Matrix Studio</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherResources('materials'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Teaching Materials Studio</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherResources('assessment'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">Assessment Tools Studio</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenPresentation?.())}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-purple-300 hover:bg-purple-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-purple-400 font-mono text-xs">├─</span>
                <span className="text-sm">📊</span>
                <span className="font-semibold text-xs group-hover:text-purple-200">AI Presentation & Slides Studio</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenMergePdfs?.())}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">└─</span>
                <Files className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Merge PDFs (Combine Files)</span>
              </button>
            </div>
          )}
        </div>

        {/* 📖 REB BOOKS 2026 ▾ */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveDropdown(null);
                onSelectView('rebBooks');
              }}
              className={`px-3 py-1.5 rounded-l-xl font-black border-y border-l transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeView === 'rebBooks'
                  ? 'bg-amber-600 text-white border-amber-400 font-black shadow-lg shadow-amber-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-amber-500/60 hover:text-amber-300 hover:bg-slate-800'
              }`}
              title="Open all REB Curriculum Books"
            >
              <span>📖</span>
              <span className="font-extrabold tracking-wide">5. REB Books {currentYear}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'rebBooks' ? null : 'rebBooks');
              }}
              className={`px-2 py-1.5 rounded-r-xl border-y border-r border-l border-slate-700/60 transition-all flex items-center cursor-pointer ${
                activeView === 'rebBooks'
                  ? 'bg-amber-700 text-white border-amber-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border-slate-700/80'
              }`}
              title="REB Books Menu"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'rebBooks' ? 'rotate-180 text-white' : ''}`} />
            </button>
          </div>

          {activeDropdown === 'rebBooks' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              <button
                onClick={() => {
                  onSelectView('rebBooks');
                  handleAction(onOpenRebBooks);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                  <span>✨ OPEN ALL BOOKS</span>
                </div>
                <span className="text-[10px] bg-slate-950/50 text-amber-200 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  Library
                </span>
              </button>

              <div className="px-2 py-1 text-[10px] font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
                <span>📖</span>
                <span>Select Level:</span>
              </div>
              <button
                onClick={() => handleAction(onOpenRebBooks)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <Book className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Primary Books & Curricula</span>
              </button>
              <button
                onClick={() => handleAction(onOpenRebBooks)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-blue-300 hover:bg-blue-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-blue-400 font-mono text-xs">├─</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-blue-200">Secondary Books & Curricula</span>
              </button>
              <button
                onClick={() => handleAction(onOpenRebBooks)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">├─</span>
                <Search className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-teal-200">Search Books</span>
              </button>
              <button
                onClick={() => handleAction(onOpenRebBooks)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-rose-300 hover:bg-rose-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-rose-400 font-mono text-xs">├─</span>
                <Bookmark className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-rose-200">My Bookmarks</span>
              </button>
              <button
                onClick={() => handleAction(onOpenRebBooks)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">└─</span>
                <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Recently Opened</span>
              </button>
            </div>
          )}
        </div>

        {/* 📂 MY RECORDS ▾ */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveDropdown(null);
                onSelectView('myRecords');
              }}
              className={`px-3 py-1.5 rounded-l-xl font-black border-y border-l transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeView === 'myRecords'
                  ? 'bg-amber-600 text-white border-amber-400 font-black shadow-lg shadow-amber-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-amber-500/60 hover:text-amber-300 hover:bg-slate-800'
              }`}
              title="Open all Teacher Records"
            >
              <span>📂</span>
              <span className="font-extrabold tracking-wide">6. My Records</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'myRecords' ? null : 'myRecords');
              }}
              className={`px-2 py-1.5 rounded-r-xl border-y border-r border-l border-slate-700/60 transition-all flex items-center cursor-pointer ${
                activeView === 'myRecords'
                  ? 'bg-amber-700 text-white border-amber-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border-slate-700/80'
              }`}
              title="Teacher Records Menu"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'myRecords' ? 'rotate-180 text-white' : ''}`} />
            </button>
          </div>

          {activeDropdown === 'myRecords' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              <button
                onClick={() => {
                  onSelectView('myRecords');
                  handleAction(() => onOpenTeacherRecords('cahier'));
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                  <span>✨ OPEN ALL RECORDS</span>
                </div>
                <span className="text-[10px] bg-slate-950/50 text-amber-200 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  Hub
                </span>
              </button>

              <div className="px-2 py-1 text-[10px] font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
                <span>📂</span>
                <span>Official Teacher Records:</span>
              </div>
              <button
                onClick={() => handleAction(() => onOpenTeacherRecords('cahier'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Cahier des Charges Studio</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherRecords('professional'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-cyan-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-cyan-400 font-mono text-xs">├─</span>
                <Folder className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-cyan-200">Professional Records & CPD</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherRecords('teaching'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">Teaching Records & Marks</span>
              </button>
              <button
                onClick={() => handleAction(() => onOpenTeacherRecords('documents'))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">└─</span>
                <Files className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-teal-200">Documents & Policies</span>
              </button>
            </div>
          )}
        </div>

        {/* 💳 SUBSCRIPTION ▾ */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveDropdown(null);
                onSelectView('subscription');
              }}
              className={`px-3 py-1.5 rounded-l-xl font-black border-y border-l transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeView === 'subscription'
                  ? 'bg-amber-600 text-white border-amber-400 font-black shadow-lg shadow-amber-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-amber-500/60 hover:text-amber-300 hover:bg-slate-800'
              }`}
              title="Open Subscription & Plans"
            >
              <span>💳</span>
              <span className="font-extrabold tracking-wide">7. Subscription</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
                {currentUser?.remainingPlans ?? 0}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'subscription' ? null : 'subscription');
              }}
              className={`px-2 py-1.5 rounded-r-xl border-y border-r border-l border-slate-700/60 transition-all flex items-center cursor-pointer ${
                activeView === 'subscription'
                  ? 'bg-amber-700 text-white border-amber-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border-slate-700/80'
              }`}
              title="Subscription Menu"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'subscription' ? 'rotate-180 text-white' : ''}`} />
            </button>
          </div>

          {activeDropdown === 'subscription' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              <button
                onClick={() => {
                  onSelectView('subscription');
                  handleAction(onOpenSubscription);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                  <span>✨ OPEN ALL PLANS</span>
                </div>
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  Packs
                </span>
              </button>

              <div className="px-2 py-1 text-[10px] font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
                <span>💳</span>
                <span>Packs & Payment:</span>
              </div>
              <button
                onClick={() => handleAction(onOpenSubscription)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Current Plan Status</span>
              </button>
              <button
                onClick={() => handleAction(onOpenSubscription)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">Upgrade Plan (Term/Year)</span>
              </button>
              <button
                onClick={() => handleAction(onOpenSubscription)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-teal-300 hover:bg-teal-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-teal-400 font-mono text-xs">├─</span>
                <DollarSign className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-teal-200">MoMo / Airtel Money Pay</span>
              </button>
              <button
                onClick={() => handleAction(onOpenSubscription)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-cyan-300 hover:bg-cyan-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-cyan-400 font-mono text-xs">├─</span>
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-cyan-200">School Multi-Teacher Pack</span>
              </button>
            </div>
          )}
        </div>

        {/* ❓ HELP & SUPPORT ▾ */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveDropdown(null);
                onSelectView('helpSupport');
              }}
              className={`px-3 py-1.5 rounded-l-xl font-black border-y border-l transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeView === 'helpSupport'
                  ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/80 hover:border-emerald-500/60 hover:text-emerald-300 hover:bg-slate-800'
              }`}
              title="Open Help & Support Center"
            >
              <span>❓</span>
              <span className="font-extrabold tracking-wide">8. Help & Support</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'helpSupport' ? null : 'helpSupport');
              }}
              className={`px-2 py-1.5 rounded-r-xl border-y border-r border-l border-slate-700/60 transition-all flex items-center cursor-pointer ${
                activeView === 'helpSupport'
                  ? 'bg-emerald-700 text-white border-emerald-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border-slate-700/80'
              }`}
              title="Help & Support Menu"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'helpSupport' ? 'rotate-180 text-white' : ''}`} />
            </button>
          </div>

          {activeDropdown === 'helpSupport' && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900/98 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
              <button
                onClick={() => {
                  onSelectView('helpSupport');
                  handleAction(onOpenHelp);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
                  <span>✨ OPEN ALL HELP TOOLS</span>
                </div>
                <span className="text-[10px] bg-slate-950/50 text-emerald-200 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  Help
                </span>
              </button>

              <div className="px-2 py-1 text-[10px] font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1">
                <span>❓</span>
                <span>Support Channels:</span>
              </div>
              {onOpenChatbot && (
                <button
                  onClick={() => handleAction(onOpenChatbot)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/70 border border-emerald-500/30 transition-all text-left group cursor-pointer"
                >
                  <span className="text-emerald-500 font-mono text-xs">├─</span>
                  <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-xs group-hover:text-emerald-200">Nkorera AI Chatbot (Teacher Assistant)</span>
                </button>
              )}
              <button
                onClick={() => handleAction(onOpenHelp)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-emerald-400 font-mono text-xs">├─</span>
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-emerald-200">How to use Nkorera App</span>
              </button>
              <button
                onClick={() => handleAction(onOpenHelp)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-green-300 hover:bg-green-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-green-400 font-mono text-xs">├─</span>
                <MessageCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-green-200">WhatsApp Direct Support</span>
              </button>
              <button
                onClick={() => handleAction(onOpenHelp)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-blue-300 hover:bg-blue-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-blue-400 font-mono text-xs">├─</span>
                <PhoneCall className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-blue-200">Call Support Line</span>
              </button>
              <button
                onClick={() => handleAction(onOpenHelp)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-amber-950/60 transition-all text-left group cursor-pointer"
              >
                <span className="text-slate-500 group-hover:text-amber-400 font-mono text-xs">├─</span>
                <Video className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-xs group-hover:text-amber-200">Video Tutorials</span>
              </button>

              <div className="px-2 pt-2 pb-1 text-[10px] font-black text-amber-400 uppercase tracking-wider border-t border-slate-800 flex items-center gap-1">
                <span>🌐</span>
                <span>Official Teacher Web Portals:</span>
              </div>
              <a
                href="https://teacherlessonplans.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-amber-300 hover:bg-slate-800 transition-all text-left group cursor-pointer"
              >
                <span className="text-amber-500 font-mono text-xs">●</span>
                <span className="font-semibold text-[11px] group-hover:text-amber-200 truncate">teacherlessonplans.ai.studio</span>
              </a>
              <a
                href="https://teacher-tool-nine.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-emerald-300 hover:bg-slate-800 transition-all text-left group cursor-pointer"
              >
                <span className="text-emerald-500 font-mono text-xs">●</span>
                <span className="font-semibold text-[11px] group-hover:text-emerald-200 truncate">teacher-tool-nine.vercel.app</span>
              </a>
              <a
                href="https://specialcoach.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-purple-300 hover:bg-slate-800 transition-all text-left group cursor-pointer"
              >
                <span className="text-purple-500 font-mono text-xs">●</span>
                <span className="font-semibold text-[11px] group-hover:text-purple-200 truncate">specialcoach.ai.studio</span>
              </a>
            </div>
          )}
        </div>

        {/* 🤖 SAVETO AI (TEACHER AI COPILOT) */}
        {onOpenSavetoAi && (
          <button
            onClick={() => handleAction(onOpenSavetoAi)}
            className="px-3 py-1.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 border border-emerald-400/50 shadow-md shadow-emerald-950/50 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            title="Saveto AI • Teacher AI Copilot"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            <span className="font-black tracking-wide text-xs uppercase">9. Saveto AI</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          </button>
        )}

        {/* ⚙️ SETTINGS */}
        <button
          onClick={() => handleAction(onOpenDevProfile)}
          className="px-3 py-1.5 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          title="Developer Profile & System Settings"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-extrabold tracking-wide">10. Settings</span>
        </button>

        {/* 🌙/☀️ DARK MODE TOGGLE */}
        {onToggleDarkMode && (
          <button
            onClick={() => handleAction(onToggleDarkMode)}
            className="px-3 py-1.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="font-extrabold tracking-wide text-xs">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="font-extrabold tracking-wide text-xs">Light Mode</span>
              </>
            )}
          </button>
        )}

        {/* 🔄 AUTOMATIC DATA SYNC (LIVE CLOUD) */}
        <button
          onClick={handleManualSyncClick}
          disabled={isTriggeringSync || syncState.isSyncing}
          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 border ${
            syncState.isOnline
              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
          }`}
          title={`Auto Sync Data • ${syncState.statusMessage} (Last sync: ${syncState.lastSyncTime})`}
        >
          <Radio className={`w-3.5 h-3.5 text-emerald-400 ${syncState.isOnline ? 'animate-pulse' : ''}`} />
          <span className="font-extrabold tracking-wide uppercase">Auto-Sync</span>
          <RefreshCw className={`w-3 h-3 text-emerald-300 ${isTriggeringSync || syncState.isSyncing ? 'animate-spin' : ''}`} />
        </button>

        {/* 🤖 ROBOT NETWORK ASSISTANT (ONLY SHOWN WHEN OFFLINE) */}
        {onOpenRobotModal && !syncState.isOnline && (
          <button
            onClick={() => handleAction(onOpenRobotModal)}
            className="px-3 py-1.5 rounded-xl font-extrabold text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 hover:border-red-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 animate-pulse"
            title="AI Robot Network Assistant - You are offline"
          >
            <Bot className="w-3.5 h-3.5 text-red-400" />
            <span className="font-extrabold tracking-wide uppercase">Robot Offline Alert</span>
          </button>
        )}

        {/* 📲 DOWNLOAD & INSTALL PWA APP */}
        <button
          onClick={() => handleAction(onOpenInstall)}
          className="px-3.5 py-1.5 rounded-xl font-black text-emerald-300 hover:text-white bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/50 hover:border-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 shrink-0 group active:scale-95"
          title="Download & Install Nkorera App (PWA) on Phone or PC"
        >
          <Download className="w-4 h-4 text-emerald-400 group-hover:animate-bounce shrink-0" />
          <span className="font-extrabold tracking-wide">11. Download / Install App</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-400/20 text-emerald-300 font-mono font-bold">PWA</span>
        </button>

        {/* 👑 ADMIN PANEL */}
        {(currentUser?.isAdmin || currentUser?.email === 'nkundimana123theogene@gmail.com') && (
          <button
            onClick={() => handleAction(onOpenAdmin)}
            className="px-3 py-1.5 rounded-xl font-black text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
            title="Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-extrabold tracking-wide uppercase">12. Admin Panel</span>
          </button>
        )}

      </div>

      {/* 🔍 FILTER ANY SERVICES MODAL (PORTAL) */}
      {typeof document !== 'undefined' && isFilterModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-hidden select-text animate-in fade-in duration-150"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_80px_-15px_rgba(16,185,129,0.35)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Filter Any Services You Need
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium line-clamp-1">
                    Select or search any service you want to use on Nkorera Education Portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/60 shadow-md"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEARCH BAR & CATEGORY CHIPS */}
            <div className="p-4 bg-slate-950/50 border-b border-slate-800 shrink-0 space-y-3">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={serviceFilterQuery}
                  onChange={(e) => setServiceFilterQuery(e.target.value)}
                  placeholder="Type service name here (e.g. CBC, Remedial, Nursery, Books, Quiz, Student ID, Cahier, PDF...)"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 text-sm text-white placeholder:text-slate-500 rounded-xl border border-emerald-500/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 outline-none transition-all shadow-inner font-medium"
                />
                {serviceFilterQuery && (
                  <button
                    type="button"
                    onClick={() => setServiceFilterQuery('')}
                    className="absolute right-3 p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CATEGORY CHIPS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { key: 'All', label: 'All Services', count: allServices.length },
                  { key: 'Planning', label: 'Lesson Planning', count: allServices.filter(s => s.category === 'Planning').length },
                  { key: 'Resources', label: 'Resources & Books', count: allServices.filter(s => s.category === 'Resources').length },
                  { key: 'Records', label: 'Teacher Records', count: allServices.filter(s => s.category === 'Records').length },
                  { key: 'AI Tools', label: 'AI Tools & Copilot', count: allServices.filter(s => s.category === 'AI Tools').length },
                  { key: 'Support', label: 'Support & Settings', count: allServices.filter(s => s.category === 'Support').length },
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedFilterCategory(cat.key)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedFilterCategory === cat.key
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      selectedFilterCategory === cat.key ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS LIST */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredServices.map(service => (
                    <div
                      key={service.id}
                      onClick={() => {
                        service.action();
                        setIsFilterModalOpen(false);
                      }}
                      className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-emerald-950/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all mt-0.5">
                          {service.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors truncate">
                              {service.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50 shrink-0">
                              {service.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed line-clamp-2">
                            {service.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-400/80 transition-colors">
                          Click here to open
                        </span>
                        <span className="text-xs font-black text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <Filter className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold">
                    No services found matching &ldquo;<strong className="text-emerald-300">{serviceFilterQuery}</strong>&rdquo;
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching words like: <button onClick={() => setServiceFilterQuery('CBC')} className="text-emerald-400 hover:underline">CBC</button>, <button onClick={() => setServiceFilterQuery('Remedial')} className="text-emerald-400 hover:underline">Remedial</button>, <button onClick={() => setServiceFilterQuery('Books')} className="text-emerald-400 hover:underline">Books</button>, <button onClick={() => setServiceFilterQuery('Quiz')} className="text-emerald-400 hover:underline">Quiz</button>, or <button onClick={() => setServiceFilterQuery('ID')} className="text-emerald-400 hover:underline">ID</button>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceFilterQuery('');
                      setSelectedFilterCategory('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Reset search (Show All)
                  </button>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px] sm:text-xs">Click any service to open it instantly</span>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HeaderNavRow;
