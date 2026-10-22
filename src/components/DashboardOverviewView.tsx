import React, { useState } from 'react';
import { 
  Sparkles, 
  Edit3, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Award, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Star,
  FileText,
  Printer,
  Layers,
  Bot,
  Laptop,
  WifiOff,
  Volume2,
  Hand,
  GraduationCap,
  Baby,
  User
} from 'lucide-react';
import { UserProfile, MainViewType, Announcement } from '../types';
import { subscribeToAnnouncements } from '../utils/realtime';
import { speakRobotOfflineAlert } from '../utils/robotVoice';
import { ResourceTab } from './TeacherResourcesModal';
import { RecordsTab } from './TeacherRecordsModal';
import { DailyLessonPlanGoalCard } from './DailyLessonPlanGoalCard';
import { SubscriptionExpiryBanner } from './SubscriptionExpiryBanner';
import gsMayangeClassroom from '../assets/images/gs_mayange_clear_students_uniforms_1788415804184.jpg';
import robotAvatar from '../assets/images/robot_offline_assistant_1788383530402.jpg';

interface DashboardOverviewViewProps {
  currentUser: UserProfile | null;
  onSelectView?: (view: MainViewType) => void;
  onOpenCbcModal?: (mode: 'create' | 'edit') => void;
  onOpenSchemeOfWork?: () => void;
  onOpenRemedialModal?: () => void;
  onOpenNurseryModal?: () => void;
  onOpenMyPlans?: () => void;
  onOpenTeacherBook?: () => void;
  onOpenProfessionalBook?: () => void;
  onOpenTeacherResources?: (tab: ResourceTab) => void;
  onOpenRebBooks?: () => void;
  onOpenTeacherRecords?: (tab: RecordsTab) => void;
  onOpenSubscription?: () => void;
  onOpenHelp?: () => void;
  onOpenChatbot?: () => void;
  onOpenSavetoAi?: () => void;
  onOpenDirectory?: () => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  onOpenPrintableWorksheet?: () => void;
  onOpenMergePdfs?: () => void;
  onOpenPresentation?: () => void;
  onOpenCertificateCreator?: () => void;
  onOpenStudentId?: () => void;
  isOnline?: boolean;
  onOpenRobotModal?: () => void;
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  currentUser,
  onOpenCbcModal,
  onOpenRemedialModal,
  onOpenNurseryModal,
  onOpenSchemeOfWork,
  onOpenTeacherResources,
  onOpenRebBooks,
  onOpenTeacherRecords,
  onOpenPrintableWorksheet,
  onOpenCertificateCreator,
  onOpenStudentId,
  onOpenSubscription,
  isOnline = true,
  onOpenRobotModal,
}) => {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    const unsubAnnouncements = subscribeToAnnouncements(setAnnouncements);
    return () => {
      unsubAnnouncements();
    };
  }, []);

  const handlePlayRobotVoice = () => {
    setIsPlayingVoice(true);
    speakRobotOfflineAlert("Now! You're Offline. No internet connection. Please search for internet connection.");
    setTimeout(() => {
      setIsPlayingVoice(false);
    }, 4500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100 pb-12">
      
      {/* ⚠️ PROACTIVE SUBSCRIPTION EXPIRY BANNER (APPEARS WHEN EXPIRING WITHIN 7 DAYS) */}
      <SubscriptionExpiryBanner onOpenSubscription={onOpenSubscription || (() => {})} />
      
      {/* 🤖 UPFRONT AI ROBOT COMPUTER GESTURE & VOICE ALERT (ONLY APPEARS WHEN OFFLINE) */}
      {!isOnline && (
        <div className="rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/80 border-red-500/60 shadow-red-500/25 animate-bounce-short">
          {/* Radar wave effect in background */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            
            {/* LEFT: ROBOT AVATAR & MOVEMENT ANIMATION POINTING TO COMPUTER */}
            <div className="flex items-center gap-4 sm:gap-5 shrink-0">
              <div className="relative group cursor-pointer" onClick={onOpenRobotModal || handlePlayRobotVoice}>
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 border-red-400 shadow-lg shadow-red-500/40 bg-slate-950 relative transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src={robotAvatar} 
                    alt="AI Robot Network Assistant pointing gesture at computer" 
                    className="w-full h-full object-cover object-top animate-[pulse_3s_infinite]"
                  />
                  {/* Finger pulse glow gesturing towards computer */}
                  <span className="absolute top-[32%] left-[32%] w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
                  {/* Chest LED */}
                  <span className="absolute top-[50%] left-[64%] w-2 h-3 rounded-full bg-cyan-300 blur-[1px] animate-pulse" />
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                  Robot Offline
                </span>
              </div>

              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/40">
                    <WifiOff className="w-3 h-3 text-red-400 animate-bounce" />
                    Computer Network Alert
                  </span>
                  <span className="text-[11px] text-cyan-400 font-bold hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Voice & Gesture Alert
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  <span className="text-red-300">"Now! You're Offline. No internet connection. Please search for internet connection."</span>
                </h3>
                
                <p className="text-xs text-slate-300 italic">
                  AI Robot announces "Now! You're Offline" with pointing gesture towards your computer indicating internet connection is required.
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <button
                    onClick={handlePlayRobotVoice}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                    title="Click to hear Robot speech and see gesture animation"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingVoice ? 'animate-bounce' : ''}`} />
                    <span>{isPlayingVoice ? 'Speaking...' : 'Listen to Robot'}</span>
                  </button>

                  {onOpenRobotModal && (
                    <button
                      onClick={onOpenRobotModal}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-extrabold text-xs flex items-center gap-1.5 border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Open Robot Assistant</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: 💻 COMPUTER GESTURE TARGET CARD (ONLY COMPUTER) */}
            <div className="w-full lg:w-auto bg-slate-950/90 border border-red-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center gap-2 shrink-0 shadow-lg relative">
              <div className="flex items-center justify-between w-full gap-4">
                <span className="text-[11px] font-black uppercase text-red-300 tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  Active Device (Computer)
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                  Needs Internet
                </span>
              </div>

              {/* Laptop illustration receiving pointing gesture */}
              <div className="relative w-28 h-20 flex flex-col items-center justify-center my-1">
                {/* Hand gesture icon indicator */}
                <div className="absolute -left-6 top-2 text-cyan-300 animate-bounce">
                  <Hand className="w-5 h-5 -rotate-90" />
                </div>

                <div className="w-24 h-14 bg-slate-950 border-2 border-red-500/60 rounded-t-md flex flex-col items-center justify-center relative overflow-hidden shadow-md">
                  <Laptop className="w-7 h-7 text-slate-500" />
                  <span className="absolute inset-0 bg-red-950/85 flex flex-col items-center justify-center">
                    <WifiOff className="w-4 h-4 text-red-400 animate-bounce" />
                    <span className="text-[7px] font-black text-red-300">DISCONNECTED</span>
                  </span>
                </div>
                <div className="w-28 h-2.5 bg-slate-800 border-x-2 border-b-2 border-slate-600 rounded-b-md relative">
                  <div className="w-6 h-0.5 bg-slate-600 rounded-full mx-auto mt-0.5" />
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-xs font-black text-white">Computer / Laptop</h4>
                <p className="text-[10px] text-red-300 font-bold">No internet connection on this computer</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REAL-TIME NEWS TICKER / ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div className="bg-slate-900/50 border-y border-emerald-500/20 py-2 overflow-hidden relative group">
          <div className="flex items-center gap-2 whitespace-nowrap animate-marquee">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30 shrink-0">
              <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              Live News ({currentYear})
            </span>
            {announcements.map((ann, idx) => (
              <span key={ann.id || idx} className="text-xs text-slate-300 flex items-center gap-2 mr-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                <strong className="text-emerald-300 font-semibold">{ann.title}:</strong> {ann.content}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nkorera AI Educator • Academic Year {currentYear}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{currentUser?.name || 'Teacher'}</span>! 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Welcome to <strong className="text-slate-200">Nkorera Education Platform</strong>. Effortlessly prepare lesson plans (CBC & CBC 2026), create teaching materials, track students, and manage grades quickly.
            </p>
          </div>

          {/* QUICK CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => onOpenCbcModal?.('create')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Plan Lesson Instantly</span>
            </button>
            <button
              onClick={() => onOpenTeacherResources?.('materials')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>REB Curriculum & Books</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY LESSON PLAN GOAL CARD */}
      <DailyLessonPlanGoalCard 
        currentUser={currentUser} 
        onOpenPlanLesson={() => onOpenCbcModal?.('create')} 
      />

      {/* QUICK METRICS & ACTIVITY SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prepared Lessons</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">28</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> CBC Standards Active
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">142</div>
            <div className="text-xs text-teal-400 flex items-center gap-1 mt-1 font-medium">
              <ShieldCheck className="w-3 h-3" /> 3 Different Classes
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grades & Assessments</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
            <div className="text-xs text-cyan-400 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle className="w-3 h-3" /> Term 1 Progress
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Status</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">Premium</div>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Unlimited AI Tools
            </div>
          </div>
        </div>
      </div>

      {/* CORE FUNCTIONALITY CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Teacher Core Hub (Key Operations)
          </h2>
          <span className="text-xs text-slate-400">Click any feature to get started</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* 1. LESSON PLANNING & CBC AI */}
          <div 
            onClick={() => onOpenCbcModal?.('create')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                1. AI Lesson Planning (CBC & REB)
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Generate CBC & CBC 2026 compliant lesson plans in seconds from Nursery to S6 according to REB curriculum.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span>Start Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. REMEDIAL LESSON PLAN */}
          <div 
            onClick={onOpenRemedialModal}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                2. Remedial Lesson Plan (Imyigire Yihariye)
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Prepare Remedial & Consolidation lesson plans for G1/G2 (Remedial) and G3/G4 (Consolidation) learners.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-400">
              <span>Open Remedial</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. NURSERY LESSON PLAN */}
          <div 
            onClick={onOpenNurseryModal}
            className="bg-slate-900/90 border border-slate-800 hover:border-pink-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-pink-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-slate-950 transition-all">
                <Baby className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors">
                3. Nursery & Early Childhood Plan
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Prepare play-based, activity-centered Nursery & Kindergarten lesson plans following REB early years guide.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-pink-400">
              <span>Open Nursery</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. SCHEME OF WORK */}
          <div 
            onClick={onOpenSchemeOfWork}
            className="bg-slate-900/90 border border-slate-800 hover:border-teal-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-teal-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                4. Scheme of Work (Term Planning)
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Prepare complete Schemes of Work for Term 1, 2, and 3 with Key Competences, Units, and Evaluation Methods.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-400">
              <span>Open Scheme</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. REB BOOKS & CURRICULUM */}
          <div 
            onClick={onOpenRebBooks}
            className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                5. REB Textbooks (Official Curriculum)
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Official Primary, O-Level & A-Level textbooks from REB and NESA ready to read and explore.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cyan-400">
              <span>Read Books</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. MARKS ENTRY & REPORT CARDS */}
          <div 
            onClick={() => onOpenTeacherRecords?.('teaching')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                6. Marks Entry & Report Cards
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Record Quiz, Mid-term, and End-term marks, generate grading sheets and student report cards instantly.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-400">
              <span>Enter Marks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 7. STUDENT ATTENDANCE & ROLL CALL */}
          <div 
            onClick={() => onOpenTeacherRecords?.('cahier')}
            className="bg-slate-900/90 border border-slate-800 hover:border-blue-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                7. Student Attendance & Roll Call
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Track daily student attendance, monitor absences with reasons, and keep yearly records effortlessly.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-400">
              <span>Take Roll Call</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 8. PRINTABLE WORKSHEETS & EXAMS */}
          <div 
            onClick={onOpenPrintableWorksheet}
            className="bg-slate-900/90 border border-slate-800 hover:border-purple-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                8. Printable Worksheets & Exams
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Generate printable exam papers, exercises, and worksheets (PDF & Print Ready) with marking guides.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-400">
              <span>Create Worksheets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 9. AI CERTIFICATE CREATOR & STUDIO */}
          <div 
            onClick={onOpenCertificateCreator}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-400 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                9. AI Certificate Studio
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Create official student & teacher certificates with custom signatures, QR verification code, and PDF download.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span>Create Certificate</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 10. SCHOOL IDENTIFICATION OF STUDENTS */}
          <div 
            onClick={onOpenStudentId}
            className="bg-slate-900/90 border border-slate-800 hover:border-rose-500 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                10. School Identification of Students
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                Official Student Identification Forms: Personal details, parent contact records, registration numbers, and batch PDF printing.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-400">
              <span>Open Student Identification</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* PURE HIGH-DEFINITION PHOTO SHOWCASE (NO TEXT, NO LABELS, NO BUTTONS) */}
      <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/60 overflow-hidden shadow-2xl p-2 sm:p-4">
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-950 flex items-center justify-center">
          <img 
            src={gsMayangeClassroom} 
            alt="Classroom"
            loading="eager"
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[640px] rounded-xl object-contain object-center shadow-lg block"
          />
        </div>
      </div>

    </div>
  );
};
