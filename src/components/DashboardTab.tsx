import React from 'react';
import {
  BookOpen,
  PlusCircle,
  FolderKanban,
  Zap,
  MessageCircle,
  Shield,
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  Award,
  Globe2,
  Code,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { UserProfile, LessonPlanData, LanguageOption } from '../types';
import { OWNER_INFO } from '../data/plans';
import { getLessonPlanLabels } from '../data/translations';
import { getTimeBasedGreeting } from '../utils/greeting';

interface DashboardTabProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  selectedCountry: string;
  savedPlans: LessonPlanData[];
  onNavigate: (tab: 'generator' | 'history' | 'subscription' | 'admin' | 'founder') => void;
  onSelectPlan: (plan: LessonPlanData) => void;
  onOpenSignIn: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  selectedLanguage,
  selectedCountry,
  savedPlans,
  onNavigate,
  onSelectPlan,
  onOpenSignIn,
}) => {
  const labels = getLessonPlanLabels(selectedLanguage);
  const recentPlans = savedPlans.slice(0, 3);
  const timeGreeting = getTimeBasedGreeting(user?.name, selectedLanguage, selectedCountry);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Summary Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-md border border-emerald-400/30 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="font-bold text-amber-200">{timeGreeting.aiBadge || '🤖 AI Welcome Assistant'}</span>
              <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                24/7 Service Active (Ibihe Byose)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              {timeGreeting.title}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed font-medium">
              {timeGreeting.subtext}
            </p>
          </div>

          {/* Quick User Actions / Status */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {user ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-xs space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-medium">Subscription Status:</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-300" />
                    {user.currentPlan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-medium">Amasomo asigaye:</span>
                  <span className={`font-extrabold px-2 py-0.5 rounded-md ${user.remainingPlans <= 0 && !user.isAdmin ? 'text-amber-200 bg-rose-600/80 animate-pulse' : 'text-white bg-emerald-600/60'}`}>
                    {user.isAdmin ? 'Unlimited ♾️' : `${user.remainingPlans} Plans`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-medium">Igihugu:</span>
                  <span className="font-semibold text-emerald-100 flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5" />
                    {selectedCountry}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>🔐 Yinjiye Muri Konti Yawe</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expired Monthly Plans Callout Banner */}
      {user && !user.isAdmin && user.remainingPlans <= 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                ⚠️ Lesson Plans z'Ukwezi / Izo waguze Zarangiye (0 Remaining)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Lesson plans z'ukwezi kwanyu cyangwa izo mwaguze zarangiye! Mwipfuza gukomeza gukora lesson plans, mwasabwa kugura izindi lesson plans zishya muri Subscription zo gukomeza igikorwa cyanyu.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('subscription')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Gura Izindi Lesson Plans</span>
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{savedPlans.length}</p>
            <p className="text-xs text-slate-500 font-medium">Amasomo Yabitswe</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-800">
              {user?.isAdmin ? '♾️' : user?.remainingPlans ?? 3}
            </p>
            <p className="text-xs text-slate-500 font-medium">Amasomo Asigaye</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[130px]">
              {selectedLanguage}
            </p>
            <p className="text-xs text-slate-500 font-medium">Ururimi Rukoreshwa</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{selectedCountry}</p>
            <p className="text-xs text-slate-500 font-medium">Inyigisho watoranyije</p>
          </div>
        </div>
      </div>

      {/* Main Menu Options Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-600" />
            <span>Ihitamo ry'Ibikorwa / Quick Menu Navigation</span>
          </h2>
          <span className="text-xs text-slate-500 italic">Hitamo icyo ushaka gukora</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Create Lesson Plan */}
          <button
            onClick={() => onNavigate('generator')}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-amber-300 hover:border-amber-500 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center group-hover:bg-amber-500 transition-colors shadow-xs">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 border border-amber-500 shadow-2xs">
                Create Lesson Plan
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-black transition-colors">
                1. Kurema Isomo (Create Lesson Plan)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Kora isomo mu buryo bw'ubwenge buhanitse (AI) ukurikije gahunda ya REB / CBC muri Kinyarwanda, English, French cyangwa Swahili.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-slate-950 group-hover:translate-x-1 transition-transform pt-2 border-t border-slate-100">
              <span>Rema Isomo Ubu (Create Lesson Plan)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </div>
          </button>

          {/* Card 2: Saved Plans */}
          <button
            onClick={() => onNavigate('history')}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-purple-300 hover:border-purple-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:bg-purple-700 transition-colors shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-950 border border-purple-300 shadow-2xs">
                {savedPlans.length} My Lesson Plans
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950 group-hover:text-purple-700 transition-colors">
                2. My Lesson Plans (History)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Reba, hindura cyangwa utapisha (Print / PDF) amasomo yose wagiye ukora ukoresheje seriveri yacu.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-purple-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-purple-100">
              <span>Fungura My Lesson Plans (History)</span>
              <ArrowRight className="w-4 h-4 text-purple-900" />
            </div>
          </button>

          {/* Card 3: Upgrade Subscription */}
          <button
            onClick={() => onNavigate('subscription')}
            className="group text-left bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 hover:border-amber-400 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Zap className="w-6 h-6 fill-amber-200" />
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900">
                MoMo Pay
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                3. Subscription Status (Kwiyandikisha)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Gura ifatabuguzi ryo gukora amasomo menshi adafite umupaka ukoresheje Mobile Money (0781339530).
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform pt-2 border-t border-amber-200/60">
              <span>Reba Subscription Status hano</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 4: WhatsApp Support Group */}
          <a
            href={OWNER_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group text-left bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                0781339530
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                4. Itsinda rya WhatsApp (Community Support)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sanganira abandi mwarimu mu tsinda rya WhatsApp rya Robotics & AI ugishe inama n'ubufasha direct.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform pt-2 border-t border-slate-100">
              <span>Kinjira mu Tsinda</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </a>

          {/* Card 5: Robotics & AI Assistant */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                AI Helper Widget
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                5. Umufasha wa AI na Robotics
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kanda ku gakoresho k'agashya karerekeza hansi ibyo buryo bw'iburyo bukurikira ku mfuruka y'isoko uze kuvugana na AI.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-purple-700 pt-2 border-t border-slate-100">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Available via bottom right widget</span>
            </div>
          </div>

          {/* Card 6: 24/7 Uptime & Always Available Guarantee */}
          <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-xs">
                <Globe2 className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
                24/7/365 ONLINE
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                6. Service Iboneka Ibihe Byose (24/7 Availability)
              </h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Urubuga rwa Teachers Quickly Tools Lesson Plans rukora amasaha 24/24 n'iminsi 7/7 mu mwaka wose (24/7/365). Tegura no kubika lesson plans zawe igihe cyose ubikoreye: Amanywa, Nimugoroba, cyangwa N'ijoro.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 pt-2 border-t border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automatically Saved & 100% Cloud Uptime</span>
            </div>
          </div>

          {/* Card 7: Founder & Developer Profile Card */}
          <button
            onClick={() => onNavigate('founder')}
            className="group text-left bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-6 rounded-2xl border-2 border-emerald-500/40 hover:border-amber-400 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-black">
                <Award className="w-6 h-6 fill-slate-950" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                IT / DEVELOPER
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                <span>7. IT/Developer: Nkundimana Theogene</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Kanda hano umenye amateka, intego n'amabwiriza ya IT/Developer: Nkundimana Theogene wakoze Teachers Quickly Tools system.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 pt-2 border-t border-emerald-800/80">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>IT/Developer: Nkundimana Theogene • WhatsApp: 0781339530</span>
            </div>
          </button>

          {/* Card 8: Analytics & Subscriber Management */}
          <button
            onClick={() => onNavigate('admin')}
            className="group text-left bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border-2 border-purple-500/40 hover:border-purple-400 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-purple-200" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-500 text-white shadow-xs">
                ADMIN PANEL
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                <span>8. Admin Panel</span>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                Reba imibare y'imikoreshwa y'urubuga (Usage Analytics), abakiriya baguze ifatabuguzi (Subscriptions), hamwe n'ibarura ry'amasomo arimo gukorwa mu Kinyarwanda, English, French & Swahili.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 pt-2 border-t border-purple-800">
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Fungura System Control & Admin Panel</span>
            </div>
          </button>
        </div>
      </div>

      {/* Technology Stack Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border border-slate-700 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                💻 System Technology Architecture / Ikoranabuhanga Ryakoreshejwe
              </h3>
              <p className="text-[11px] text-slate-400">Standard Modern Web Stack & Educational AI Engine</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('founder')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>Developer Info</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 block flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> Frontend
            </span>
            <p className="font-extrabold text-slate-100">HTML, CSS, JS / React</p>
            <p className="text-[10px] text-slate-400">Tailwind CSS & Lucide Icons</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Backend
            </span>
            <p className="font-extrabold text-slate-100">Node.js (Express API)</p>
            <p className="text-[10px] text-slate-400">REST Proxy & Word/PDF Engine</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400 block flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Database
            </span>
            <p className="font-extrabold text-slate-100">MySQL / PostgreSQL</p>
            <p className="text-[10px] text-slate-400">Cloud Data & Saved Plans</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Engine
            </span>
            <p className="font-extrabold text-slate-100">OpenAI API & Gemini AI</p>
            <p className="text-[10px] text-slate-400">REB/CBC Objective Generator</p>
          </div>
        </div>
      </div>

      {/* Recent Lesson Plans Section */}
      {recentPlans.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Amasomo Yaherukaga Gukorwa / Recent Lesson Plans</span>
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Amasomo yose ({savedPlans.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                    <span>{plan.header.subject}</span>
                    <span className="bg-white px-2 py-0.5 rounded-md border text-slate-700">
                      {plan.header.classGrade}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {plan.header.lessonTitle}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {plan.header.unitTitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Hari hafi'}
                  </span>
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Fungura
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
