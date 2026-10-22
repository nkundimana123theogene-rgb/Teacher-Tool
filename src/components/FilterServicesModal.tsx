import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Filter, 
  Search, 
  X, 
  ArrowRight, 
  Edit3, 
  Sparkles, 
  GraduationCap, 
  FileSpreadsheet, 
  Folder, 
  BookOpen, 
  Book, 
  Award, 
  Files, 
  User, 
  CheckSquare, 
  Download, 
  Layers, 
  Video, 
  Bot, 
  MessageCircle, 
  RefreshCw, 
  CreditCard, 
  HelpCircle, 
  Shield, 
  Bookmark,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown
} from 'lucide-react';
import { UserProfile } from '../types';
import { triggerManualSync } from '../utils/autoSync';

export interface FilterServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenCbcModal: (mode: 'create' | 'edit') => void;
  onOpenSchemeOfWork?: () => void;
  onOpenRemedialModal: () => void;
  onOpenNurseryModal?: () => void;
  onOpenLessonPlanningHub: () => void;
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
  onOpenChatbot?: () => void;
  onOpenSavetoAi?: () => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  onOpenPrintableWorksheet?: () => void;
  onOpenMergePdfs?: () => void;
  onOpenPresentation?: () => void;
  onOpenRobotModal?: () => void;
  onOpenStudentId?: () => void;
  onOpenCertificateCreator?: () => void;
}

export const FilterServicesModal: React.FC<FilterServicesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenCbcModal,
  onOpenSchemeOfWork,
  onOpenRemedialModal,
  onOpenNurseryModal,
  onOpenLessonPlanningHub,
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'a-z' | 'z-a'>('default');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectService = (action: () => void) => {
    onClose();
    action();
  };

  const allServices = [
    {
      id: 'cbc_lesson',
      name: '1. CBC Lesson Plan Generator',
      category: 'Planning',
      desc: 'Competence-Based Curriculum Rwandan lesson plan with SMART objectives & 7 standard pedagogical steps.',
      icon: <Edit3 className="w-4 h-4 text-emerald-400" />,
      action: () => handleSelectService(() => onOpenCbcModal('create')),
      keywords: ['cbc', 'lesson plan', 'generator', 'preparation', 'prepration', 'prep', 'iteganyabikorwa', 'igiteganyijwe', 'fiche de preparation', 'mwarimu', 'republika', 'curriculum', 'rwandan']
    },
    {
      id: 'remedial_lesson',
      name: '2. Remedial Lesson Plan Generator',
      category: 'Planning',
      desc: 'Inclusive pedagogical lesson plan targeting struggling learners and targeted classroom interventions.',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => handleSelectService(onOpenRemedialModal),
      keywords: ['remedial', 'lesson plan', 'remediation', 'struggling learners', 'intervention', 'abana', 'basigara inyuma', 'gufasha abana', 'gukosora', 'gusubiramo', 'ntege nke']
    },
    {
      id: 'nursery_lesson',
      name: '3. Nursery / ECE Lesson Plans',
      category: 'Planning',
      desc: 'Early Childhood Education plan designed for kindergarten, play-based learning & foundational numeracy.',
      icon: <GraduationCap className="w-4 h-4 text-pink-400" />,
      action: () => handleSelectService(onOpenNurseryModal || (() => {})),
      keywords: ['nursery', 'ece', 'kindergarten', 'play-based', 'preschool', 'abana bato', 'macye', 'gukina', 'pépinière', 'maternelle']
    },
    {
      id: 'scheme_hub',
      name: '4. Scheme of Work & Planning Hub',
      category: 'Planning',
      desc: 'Official Rwandan REB Term 1, 2, and 3 schemes of work and comprehensive curriculum planner.',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-400" />,
      action: () => handleSelectService(onOpenSchemeOfWork || onOpenLessonPlanningHub),
      keywords: ['scheme of work', 'scheme', 'planning hub', 'planner', 'term', 'reb', 'iteganyanyigisho', 'repartition', 'kalendari', 'curriculum', 'planning']
    },
    {
      id: 'my_plans',
      name: '5. Saved Lesson Plans & Library',
      category: 'Planning',
      desc: 'View, edit, search, export to PDF, print, and organize all previously generated lesson plans.',
      icon: <Folder className="w-4 h-4 text-teal-400" />,
      action: () => handleSelectService(onOpenMyPlans),
      keywords: ['saved plans', 'library', 'saved lesson plans', 'plans', 'pdf', 'izabitswe', 'urubuga rwanjye', 'ibitabo byanjye', 'archive', 'teaching files']
    },
    {
      id: 'reb_books',
      name: '6. REB Curriculum Books & Syllabi',
      category: 'Resources',
      desc: 'Primary & Secondary official REB textbook repository, teacher guides, syllabus PDFs, and schemes.',
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
      action: () => handleSelectService(onOpenRebBooks),
      keywords: ['reb books', 'curriculum books', 'syllabi', 'textbook', 'syllabus', 'ibitabo bya reb', 'ibitabo', 'guide', 'primary', 'secondary', 'minisiteri']
    },
    {
      id: 'teacher_book',
      name: "7. Teacher's Tool Book (English Edition)",
      category: 'Resources',
      desc: 'Comprehensive English pedagogy guide, classroom management tips, Bloom taxonomy & learning outcomes.',
      icon: <Book className="w-4 h-4 text-orange-400" />,
      action: () => handleSelectService(onOpenTeacherBook),
      keywords: ['tool book', 'teacher book', 'english edition', 'pedagogy', 'bloom', 'igiti', 'umwarimu', 'uburyo bwo kwigisha', 'manual', 'handbook']
    },
    {
      id: 'prof_book',
      name: '8. Professional Education Book Edition',
      category: 'Resources',
      desc: 'Modern teaching methods, Rwandan inclusive education policies, CBC methodologies & school leadership.',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      action: () => handleSelectService(onOpenProfessionalBook),
      keywords: ['professional education', 'professional book', 'methods', 'inclusive education', 'policies', 'school leadership', 'uburezi budakumira', 'uburezi']
    },
    {
      id: 'prompts_studio',
      name: '9. AI Lesson Plan Prompts Studio',
      category: 'Resources',
      desc: 'Pre-engineered CBC pedagogical prompts for STEM, Humanities, Languages, and assessment rubrics.',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      action: () => handleSelectService(() => onOpenTeacherResources('prompts')),
      keywords: ['prompts', 'studio', 'ai lesson plan', 'prompts studio', 'pedagogical', 'rubrics', 'amabwiriza', 'inyandiko fatiro']
    },
    {
      id: 'cahier_records',
      name: "10. Teacher's Cahier de Notes",
      category: 'Records',
      desc: 'Class diary, student continuous marks recording, evaluation scores, attendance & progress tracking.',
      icon: <Files className="w-4 h-4 text-emerald-400" />,
      action: () => handleSelectService(() => onOpenTeacherRecords('cahier')),
      keywords: ['cahier de notes', 'marks', 'attendance', 'evaluation', 'scores', 'progress', 'ikayi y\'amanota', 'amanota', 'attendance', 'presence', 'absences', 'diary']
    },
    {
      id: 'prof_records',
      name: '11. Professional Records & Documents',
      category: 'Records',
      desc: 'Administrative documents, timetable schedules, inspection portfolios, and lesson evaluation files.',
      icon: <Bookmark className="w-4 h-4 text-indigo-400" />,
      action: () => handleSelectService(() => onOpenTeacherRecords('professional')),
      keywords: ['professional records', 'documents', 'administrative', 'timetable', 'portfolios', 'inspection', 'ikayi y\'umwarimu', 'gahunda', 'amasaha', 'evaluation', 'raporo']
    },
    {
      id: 'student_id',
      name: '12. School Identification of Students (School Identification Form)',
      category: 'Records',
      desc: 'School identification cards, student registration badges, QR code validation, and batch PDF export.',
      icon: <User className="w-4 h-4 text-sky-400" />,
      action: () => handleSelectService(onOpenStudentId || (() => {})),
      keywords: ['school identification form', 'school identification of students', 'student identification', 'identification form', 'student id', 'registration', 'ikarita y\'ishuri', 'badges', 'badge', 'ifishi y\'umunyeshuri', 'fiche d\'identification', 'imaritera', 'school id', 'form', 'fiche', 'id card', 'id', 'cards']
    },
    {
      id: 'homework_quiz',
      name: '13. Homework, Classwork & Quiz Maker',
      category: 'AI Tools',
      desc: 'Generate interactive student exercises, homework sheets, and CBC quizzes with answer keys in seconds.',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      action: () => handleSelectService(() => onOpenHomeworkQuiz?.('homework')),
      keywords: ['homework', 'classwork', 'quiz', 'maker', 'exercises', 'quizzes', 'ikizamini', 'imyitozo', 'interrogation', 'devoir', 'tests', 'questions']
    },
    {
      id: 'printable_worksheet',
      name: '14. Printable Worksheets Generator',
      category: 'AI Tools',
      desc: 'Generate printable exam-ready student worksheets, matching questions, fill-in-the-blanks, and tests.',
      icon: <Download className="w-4 h-4 text-teal-400" />,
      action: () => handleSelectService(onOpenPrintableWorksheet || (() => {})),
      keywords: ['printable worksheets', 'worksheets', 'exercises', 'tests sheets', 'matching', 'impapuro z\'imyitozo', 'fiche d\'exercices', 'fill-in-the-blank']
    },
    {
      id: 'merge_pdfs',
      name: '15. Merge & Manage PDFs',
      category: 'AI Tools',
      desc: 'Combine multiple lesson plans, schemes of work, or worksheets into a single organized printable PDF book.',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      action: () => handleSelectService(onOpenMergePdfs || (() => {})),
      keywords: ['merge pdfs', 'merge', 'manage pdfs', 'combine pdf', 'guteranya pdf', 'gufatanya ibitabo', 'pdf compiler', 'join pdf']
    },
    {
      id: 'presentation_slides',
      name: '16. AI Presentation Slides Generator',
      category: 'AI Tools',
      desc: 'Create classroom PowerPoint (.pptx) slide decks automatically aligned with your lesson objectives.',
      icon: <Video className="w-4 h-4 text-rose-400" />,
      action: () => handleSelectService(onOpenPresentation || (() => {})),
      keywords: ['presentation slides', 'presentation', 'slides', 'powerpoint', 'pptx', 'slide deck', 'classroom', 'amafoto', 'imyerekano', 'generator']
    },
    {
      id: 'cert_creator',
      name: '17. AI Certificate Creator & Verification',
      category: 'AI Tools',
      desc: 'Design, issue, and verify official school achievement certificates, academic honors & completion awards.',
      icon: <Award className="w-4 h-4 text-yellow-400" />,
      action: () => handleSelectService(onOpenCertificateCreator || (() => {})),
      keywords: ['certificate creator', 'certificate', 'verification', 'achievement', 'awards', 'impamyabumenyi', 'gushimira', 'certificat']
    },
    {
      id: 'saveto_ai',
      name: '18. Saveto AI Teacher Copilot',
      category: 'AI Tools',
      desc: 'Intelligent AI assistant tailored for Rwandan educators for instant pedagogical research and lesson drafting.',
      icon: <Bot className="w-4 h-4 text-emerald-300" />,
      action: () => handleSelectService(onOpenSavetoAi || (() => {})),
      keywords: ['saveto ai', 'saveto', 'copilot', 'teacher copilot', 'pedagogical research', 'drafting', 'assistant', 'umufasha']
    },
    {
      id: 'ai_chatbot',
      name: '19. AI Teacher Assistant Chatbot',
      category: 'AI Tools',
      desc: 'Teacher Assistant: 24/7 AI teaching assistant answering all educational questions in English.',
      icon: <MessageCircle className="w-4 h-4 text-cyan-400" />,
      action: () => handleSelectService(onOpenChatbot || (() => {})),
      keywords: ['ai chatbot', 'chatbot', 'chat', 'assistant', 'umufasha w\'umwarimu', 'bilingual', 'kinyarwanda chat', 'english chat', 'ibibazo']
    },
    {
      id: 'robot_modal',
      name: '20. AI Robot Pedagogical Voice Assistant',
      category: 'AI Tools',
      desc: 'Interactive 3D animated robot companion providing spoken voice guidance and interactive support.',
      icon: <Bot className="w-4 h-4 text-lime-400" />,
      action: () => handleSelectService(onOpenRobotModal || (() => {})),
      keywords: ['ai robot', 'robot', 'pedagogical voice', 'voice assistant', 'animated robot', 'amajwi', 'robot y\'amajwi', 'assistant', '3d']
    },
    {
      id: 'auto_sync',
      name: '21. Automatic Cloud Data Sync',
      category: 'Support',
      desc: 'Ensure your offline drafts, generated lesson plans, and teacher records are backed up to Cloud Firestore.',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      action: () => handleSelectService(() => triggerManualSync()),
      keywords: ['automatic cloud sync', 'sync', 'cloud data sync', 'backup', 'kubika', 'guhuza', 'fire store', 'offline drafts']
    },
    {
      id: 'sub_plans',
      name: '22. Subscription Plans & Quota',
      category: 'Support',
      desc: 'Check active plan status, upgrade lesson plan limits, view payment methods (MoMo), and perks.',
      icon: <CreditCard className="w-4 h-4 text-yellow-400" />,
      action: () => handleSelectService(onOpenSubscription),
      keywords: ['subscription plans', 'subscription', 'quota', 'payment', 'momo', 'upgrade', 'kwishyura', 'premium', 'limits', 'perks']
    },
    {
      id: 'help_support',
      name: '23. Help Center & Support Desk',
      category: 'Support',
      desc: 'Access user documentation, step-by-step video tutorials, teacher helpline, and direct support.',
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
      action: () => handleSelectService(onOpenHelp),
      keywords: ['help center', 'help', 'support', 'video tutorials', 'helpline', 'whatsapp', 'kudufasha', 'ubufasha', 'contact']
    },
    {
      id: 'dev_profile',
      name: '24. Developer Profile & System Settings',
      category: 'Support',
      desc: 'Manage account credentials, interface preferences, security settings, and platform configuration.',
      icon: <User className="w-4 h-4 text-slate-300" />,
      action: () => handleSelectService(onOpenDevProfile),
      keywords: ['developer profile', 'profile', 'settings', 'credentials', 'security', 'umwirondoro', 'akajambo banga', 'password', 'configuration']
    },
    {
      id: 'pwa_install',
      name: '25. Download & Install App (PWA & Desktop)',
      category: 'Support',
      desc: 'Install Nkorera Education App directly to your Android phone, Windows PC, or Mac for instant offline launch.',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      action: () => handleSelectService(onOpenInstall),
      keywords: ['install app', 'install', 'offline use', 'desktop use', 'android phone', 'windows pc', 'mac', 'pwa', 'download app', 'gushyira kuri terefone']
    },
    ...(currentUser?.isAdmin || currentUser?.email === 'nkundimana123theogene@gmail.com' ? [{
      id: 'admin_panel',
      name: '26. Admin Management Portal',
      category: 'Support',
      desc: 'Master admin control panel, user database management, quota overrides, broadcast announcements & logs.',
      icon: <Shield className="w-4 h-4 text-amber-400" />,
      action: () => handleSelectService(onOpenAdmin),
      keywords: ['admin panel', 'admin', 'management', 'portal', 'master admin', 'user database', 'quota overrides', 'announcements', 'broadcast']
    }] : [])
  ];

  const filteredServices = allServices.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    return matchesCategory && (
      service.name.toLowerCase().includes(q) ||
      service.desc.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q) ||
      (service.keywords && service.keywords.some(kw => kw.toLowerCase().includes(q)))
    );
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortOrder === 'a-z') {
      const nameA = a.name.replace(/^\d+\.\s*/, '').toLowerCase();
      const nameB = b.name.replace(/^\d+\.\s*/, '').toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (sortOrder === 'z-a') {
      const nameA = a.name.replace(/^\d+\.\s*/, '').toLowerCase();
      const nameB = b.name.replace(/^\d+\.\s*/, '').toLowerCase();
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-hidden select-text animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_90px_-10px_rgba(16,185,129,0.4)] relative overflow-hidden ring-1 ring-emerald-400/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Filter className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Filter Any Services You Need
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
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
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/60 shadow-md"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH BAR & CATEGORY PILLS */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type service name here (e.g. CBC, Remedial, Nursery, Books, Quiz, Student ID, Cahier, PDF...)"
                className="w-full pl-10 pr-10 py-3 bg-slate-950 text-sm text-white placeholder:text-slate-500 rounded-2xl border-2 border-emerald-500/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 outline-none transition-all shadow-inner font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* SORT BUTTONS (A to Z, Z to A, Default) */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setSortOrder('default')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortOrder === 'default'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Default Order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Default</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOrder('a-z')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortOrder === 'a-z'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Sort A to Z"
              >
                <ArrowDownAZ className="w-4 h-4" />
                <span>A to Z</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOrder('z-a')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortOrder === 'z-a'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Sort Z to A"
              >
                <ArrowUpZA className="w-4 h-4" />
                <span>Z to A</span>
              </button>
            </div>
          </div>

          {/* POPULAR QUICK TAGS */}
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
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedCategory === cat.key ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {sortedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedServices.map(service => (
                <div
                  key={service.id}
                  onClick={service.action}
                  className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-950/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all mt-0.5 shadow-sm">
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
              <Filter className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <p className="text-sm font-semibold">
                No services found matching &ldquo;<strong className="text-emerald-300">{searchQuery}</strong>&rdquo;
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching: <button onClick={() => setSearchQuery('CBC')} className="text-emerald-400 hover:underline">CBC</button>, <button onClick={() => setSearchQuery('Remedial')} className="text-emerald-400 hover:underline">Remedial</button>, <button onClick={() => setSearchQuery('Books')} className="text-emerald-400 hover:underline">Books</button>, <button onClick={() => setSearchQuery('Quiz')} className="text-emerald-400 hover:underline">Quiz</button>, or <button onClick={() => setSearchQuery('ID')} className="text-emerald-400 hover:underline">ID</button>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                Reset search (Show All)
              </button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] sm:text-xs">Click any service to open it instantly</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close (ESC)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FilterServicesModal;
