import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Edit3, 
  FolderHeart, 
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
  HelpCircle, 
  MessageSquare, 
  FileText, 
  User, 
  Settings, 
  Shield, 
  ShieldCheck,
  Globe,
  ExternalLink,
  LayoutGrid,
  Bot
} from 'lucide-react';

interface FeatureDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: () => void) => void;
  onOpenCbcModal: (mode: 'create' | 'edit') => void;
  onOpenSchemeOfWork?: () => void;
  onOpenRemedialModal: () => void;
  onOpenNurseryModal: () => void;
  onOpenMyPlans: () => void;
  onOpenTeacherBook: () => void;
  onOpenProfessionalBook: () => void;
  onOpenTeacherResources: (tab: 'prompts' | 'cbc_tools' | 'materials' | 'assessment') => void;
  onOpenRebBooks: () => void;
  onOpenTeacherRecords: (tab: 'cahier' | 'professional' | 'teaching' | 'documents') => void;
  onOpenSubscription: () => void;
  onOpenHelp: () => void;
  onOpenDevProfile: () => void;
  onOpenSavetoAi?: () => void;
  onOpenPresentation?: () => void;
  onOpenInfoTab?: (tab: 'policy' | 'about' | 'contact' | 'settings' | 'faq') => void;
}

export const FeatureDirectoryModal: React.FC<FeatureDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  onOpenCbcModal,
  onOpenSchemeOfWork,
  onOpenRemedialModal,
  onOpenNurseryModal,
  onOpenMyPlans,
  onOpenTeacherBook,
  onOpenProfessionalBook,
  onOpenTeacherResources,
  onOpenRebBooks,
  onOpenTeacherRecords,
  onOpenSubscription,
  onOpenHelp,
  onOpenDevProfile,
  onOpenSavetoAi,
  onOpenPresentation,
  onOpenInfoTab
}) => {
  const currentYear = new Date().getFullYear();
  if (!isOpen) return null;

  const sections = [
    {
      title: "🤖 Saveto AI (Teacher Co-Pilot)",
      icon: <Bot className="w-5 h-5" />,
      color: "emerald",
      items: [
        { label: "1. Ask Saveto AI (CBC Co-Pilot)", icon: <Bot className="w-4 h-4 text-emerald-400" />, action: onOpenSavetoAi || (() => {}) },
        { label: "2. SMART Objectives Generator", icon: <Sparkles className="w-4 h-4 text-amber-400" />, action: onOpenSavetoAi || (() => {}) },
        { label: "3. 5-Min Lesson Starters & Warm-ups", icon: <Sparkles className="w-4 h-4 text-teal-400" />, action: onOpenSavetoAi || (() => {}) },
        { label: "4. Remedial & Inclusion Strategies", icon: <Sparkles className="w-4 h-4 text-rose-400" />, action: onOpenSavetoAi || (() => {}) },
      ]
    },
    {
      title: "1. Lesson Planning",
      icon: <Edit3 className="w-5 h-5" />,
      color: "emerald",
      items: [
        { label: "1. Scheme of Work (REB CBC)", icon: <FileSpreadsheet className="w-4 h-4" />, action: onOpenSchemeOfWork || (() => {}) },
        { label: "2. Create CBC Lesson Plan", icon: <Sparkles className="w-4 h-4" />, action: () => onOpenCbcModal('create') },
        { label: "3. AI Presentation & Slides Studio", icon: <span className="text-sm">📊</span>, action: onOpenPresentation || (() => {}) },
        { label: "4. Create Nursery Plan", icon: <BookOpen className="w-4 h-4" />, action: onOpenNurseryModal },
        { label: "5. Create Remedial Plan", icon: <Sparkles className="w-4 h-4" />, action: onOpenRemedialModal },
        { label: "6. My Lesson Plans Library", icon: <FolderHeart className="w-4 h-4" />, action: onOpenMyPlans },
        { label: "7. Recently Used / Drafts", icon: <Clock className="w-4 h-4" />, action: () => onOpenCbcModal('edit') },
      ]
    },
    {
      title: "2. Teacher Resources",
      icon: <BookOpen className="w-5 h-5" />,
      color: "blue",
      items: [
        { label: "1. Teacher Book (REB)", icon: <BookOpen className="w-4 h-4" />, action: onOpenTeacherBook },
        { label: "2. Professional Handbook", icon: <BookOpen className="w-4 h-4" />, action: onOpenProfessionalBook },
        { label: "3. Lesson Plan Prompts", icon: <Sparkles className="w-4 h-4" />, action: () => onOpenTeacherResources('prompts') },
        { label: "4. CBC Tools & Matrix", icon: <Wrench className="w-4 h-4" />, action: () => onOpenTeacherResources('cbc_tools') },
        { label: "5. Teaching Materials", icon: <Layers className="w-4 h-4" />, action: () => onOpenTeacherResources('materials') },
        { label: "6. Assessment Tools", icon: <CheckSquare className="w-4 h-4" />, action: () => onOpenTeacherResources('assessment') },
        { label: "7. AI Presentation Slides Studio", icon: <span className="text-sm">📊</span>, action: onOpenPresentation || (() => {}) },
      ]
    },
    {
      title: `3. REB Books ${currentYear}`,
      icon: <Book className="w-5 h-5" />,
      color: "amber",
      items: [
        { label: "1. Primary Books (P1-P6)", icon: <Book className="w-4 h-4" />, action: onOpenRebBooks },
        { label: "2. Secondary Books (S1-S6)", icon: <BookOpen className="w-4 h-4" />, action: onOpenRebBooks },
        { label: "3. Search Textbooks", icon: <Search className="w-4 h-4" />, action: onOpenRebBooks },
        { label: "4. My Bookmarks", icon: <Bookmark className="w-4 h-4" />, action: onOpenRebBooks },
        { label: "5. Recently Opened", icon: <History className="w-4 h-4" />, action: onOpenRebBooks },
      ]
    },
    {
      title: "4. My Records",
      icon: <Folder className="w-5 h-5" />,
      color: "purple",
      items: [
        { label: "1. Cahier des Charges", icon: <FileSpreadsheet className="w-4 h-4" />, action: () => onOpenTeacherRecords('cahier') },
        { label: "2. Professional Records", icon: <Folder className="w-4 h-4" />, action: () => onOpenTeacherRecords('professional') },
        { label: "3. Teaching Records", icon: <GraduationCap className="w-4 h-4" />, action: () => onOpenTeacherRecords('teaching') },
        { label: "4. Other Documents", icon: <Files className="w-4 h-4" />, action: () => onOpenTeacherRecords('documents') },
      ]
    },
    {
      title: "5. Subscription",
      icon: <CreditCard className="w-5 h-5" />,
      color: "amber",
      items: [
        { label: "1. My Subscription Status", icon: <Award className="w-4 h-4" />, action: onOpenSubscription },
        { label: "2. Upgrade Plan / MoMo", icon: <CreditCard className="w-4 h-4" />, action: onOpenSubscription },
      ]
    },
    {
      title: "6. Help & Support",
      icon: <HelpCircle className="w-5 h-5" />,
      color: "emerald",
      items: [
        { label: "1. Help Center Hub", icon: <HelpCircle className="w-4 h-4" />, action: onOpenHelp },
        { label: "2. User Guide & FAQs", icon: <FileText className="w-4 h-4" />, action: () => onOpenInfoTab?.('faq') },
        { label: "3. Contact Us & Support", icon: <MessageSquare className="w-4 h-4" />, action: () => onOpenInfoTab?.('contact') },
        { label: "4. Privacy & REB Policy", icon: <ShieldCheck className="w-4 h-4" />, action: () => onOpenInfoTab?.('policy') },
      ]
    },
    {
      title: "7. User Settings & Info",
      icon: <Settings className="w-5 h-5" />,
      color: "slate",
      items: [
        { label: "1. System Settings", icon: <Settings className="w-4 h-4" />, action: () => onOpenInfoTab?.('settings') },
        { label: "2. About Us", icon: <User className="w-4 h-4" />, action: () => onOpenInfoTab?.('about') },
        { label: "3. My Developer Profile", icon: <User className="w-4 h-4" />, action: onOpenDevProfile },
        { label: "4. Cloud Security & Privacy", icon: <Shield className="w-4 h-4" />, action: onOpenDevProfile },
      ]
    },
    {
      title: "8. Official Web Portals",
      icon: <Globe className="w-5 h-5" />,
      color: "amber",
      items: [
        { label: "1. Lesson Plans AI Studio", icon: <ExternalLink className="w-4 h-4" />, action: () => window.open('https://teacherlessonplans.ai.studio', '_blank') },
        { label: "2. Teacher Tool 9 Suite", icon: <ExternalLink className="w-4 h-4" />, action: () => window.open('https://teacher-tool-nine.vercel.app', '_blank') },
        { label: "3. Report Cards (Pri & Sec)", icon: <ExternalLink className="w-4 h-4" />, action: () => window.open('https://specialcoach.ai.studio', '_blank') },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border-2 border-emerald-500/30 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[0_0_100px_-20px_rgba(16,185,129,0.3)] relative overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Feature Directory</h2>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase opacity-80">Access every tool in Nkorera Education Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/60 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="space-y-4"
              >
                <div className={`flex items-center gap-3 p-3 rounded-2xl bg-${section.color}-500/10 border border-${section.color}-500/20 shadow-sm`}>
                  <div className={`text-${section.color}-400`}>{section.icon}</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{section.title}</h3>
                </div>
                
                <div className="space-y-2 pl-2">
                  {section.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => onSelectAction(item.action)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-left text-xs font-bold border border-transparent hover:border-slate-700 group cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                        {item.icon}
                      </div>
                      <span className="flex-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              Secure System 2026
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
            Nkorera Education Portal - Powered by Advanced AI
          </p>
        </div>
      </motion.div>
    </div>
  );
};
