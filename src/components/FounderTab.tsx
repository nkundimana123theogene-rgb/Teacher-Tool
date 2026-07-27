import React from 'react';
import { OWNER_INFO } from '../data/plans';
import { LanguageOption } from '../types';
import { 
  UserCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Award, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Globe2, 
  CheckCircle2, 
  ArrowRight,
  HeartHandshake,
  Code,
  Database,
  Cpu,
  Layers
} from 'lucide-react';

interface FounderTabProps {
  selectedLanguage: LanguageOption;
  onNavigate: (tab: 'generator' | 'subscription' | 'history') => void;
}

export const FounderTab: React.FC<FounderTabProps> = ({
  selectedLanguage,
  onNavigate
}) => {
  const lang = selectedLanguage.toLowerCase();
  const isKinya = lang.includes('kinya') || lang.includes('rwanda');
  const isFrench = lang.includes('french');
  const isSwahili = lang.includes('swahili');

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Founder Avatar / Badge */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-300 p-1 shadow-2xl">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex flex-col items-center justify-center text-emerald-300 font-black relative overflow-hidden">
                <UserCheck className="w-14 h-14 text-emerald-400 stroke-[1.75]" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300 mt-1">FOUNDER</span>
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl shadow-lg border-2 border-slate-900" title="Verified Creator & Developer">
              <Award className="w-4 h-4 fill-slate-950" />
            </span>
          </div>

          {/* Profile Bio details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black border border-amber-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>IT/Developer: Nkundimana Theogene</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-xs">
              IT/Developer: {OWNER_INFO.name}
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-medium">
              {isKinya ? (
                <>
                  Umushingasi n'Umuhanga mu gukora Ikoranabuhanga rya <strong>Teacher Tool</strong>. Yashizeho iyi platform mu ntego yo korohereza abarimu bo mu Rwanda n'Akarere gutegura Lesson Plans zujuje ibipimo bya REB Competence-Based Curriculum (CBC) mu amasegonda macye.
                </>
              ) : isFrench ? (
                <>
                  Fondateur et Développeur Principal de <strong>Teacher Tool</strong>. Créateur de cette plateforme intelligente conçue pour aider les enseignants à générer des fiches de préparation (Lesson Plans) conformes au programme REB / CBC en quelques secondes.
                </>
              ) : isSwahili ? (
                <>
                  Mwanzilishi na Mwanateknolojia wa <strong>Teacher Tool</strong>. Alibuni jukwaa hili ili kurahisisha na kuharakisha utayarishaji wa maandalio ya masomo (Lesson Plans) kulingana na mcuruzo wa REB / CBC kwa sekunde chache.
                </>
              ) : (
                <>
                  Founder, CEO & Lead Educational AI Developer of <strong>Teacher Tool</strong>. Dedicated to empowering educators with REB Competence-Based Curriculum (CBC) AI automation for instant, high-quality lesson plan generation.
                </>
              )}
            </p>

            {/* Quick Contact Badges */}
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2 text-xs font-bold">
              <a 
                href={OWNER_INFO.whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 shadow-md transition-all border border-emerald-400/40"
              >
                <MessageSquare className="w-4 h-4 fill-emerald-100" />
                <span>WhatsApp: {OWNER_INFO.whatsapp}</span>
              </a>

              <a 
                href={`mailto:${OWNER_INFO.email}`}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-200 rounded-xl flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[200px]">{OWNER_INFO.email}</span>
              </a>

              <div className="px-3.5 py-2 bg-amber-500/20 text-amber-200 rounded-xl flex items-center gap-2 border border-amber-400/30">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>MoMo Code: {OWNER_INFO.momoCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Technology Stack Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
            <Layers className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              💻 Ikoranabuhanga Ryakoreshejwe / Technology Stack
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Abarimu & System Architecture • Standard Web & AI Technologies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Frontend */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">1. Frontend</h3>
            <p className="text-xs text-slate-700 font-bold">HTML, CSS, JavaScript / React</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tailwind CSS styling, Lucide React icons, Responsive single-page UI & dynamic live lesson views.
            </p>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">2. Backend</h3>
            <p className="text-xs text-slate-700 font-bold">Node.js (Express Server API)</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Secure REST API services, payload proxying, authentication token verification & Word/PDF generation.
            </p>
          </div>

          {/* Database */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">3. Database</h3>
            <p className="text-xs text-slate-700 font-bold">MySQL / PostgreSQL Storage</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Durable user accounts, subscription histories, lesson plan archives & cloud database synchronization.
            </p>
          </div>

          {/* AI Engine */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">4. AI Engine</h3>
            <p className="text-xs text-slate-700 font-bold">OpenAI API & Gemini AI</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              High-precision educational prompts adhering to REB/CBC syllabus, ABCD objectives & lesson timing.
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {isKinya ? "1. REB/CBC Pedagogy Compliance" : "1. REB/CBC Curriculum Standards"}
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            {isKinya 
              ? "NKUNDIMANA Theogene yateguye iyi system mu buryo bwitondewe cyane kugira ngo yuzuze ibisabwa 5 n'amabwiriza yose y'Ikigo cy'Igihugu gishinzwe Uburezi mu Rwanda (REB)."
              : "Carefully designed by NKUNDIMANA Theogene to align strictly with the 5 pedagogical criteria of Rwanda Basic Education Board (REB) Competence-Based Curriculum."
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {isKinya ? "2. Kwihuta mu Amasegonda" : "2. Instant AI Generation"}
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            {isKinya
              ? "Urubuga rukoresha AI y'ubwenge buhanitse ihabwa amatageko arambuye yo gutanga Lesson Plan yose mu amasegonda macye aho gutakaza amasaha menshi."
              : "Generates full structured lesson plans with active learning activities, generic competences, and timing in seconds."
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <Globe2 className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {isKinya ? "3. Service Active 24/7/365" : "3. 24/7 Always Active Service"}
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            {isKinya
              ? "Ikora amasaha 24/24 n'iminsi 7/7 mu mwaka wose (Ibihe byose). Mwarimu arashobora gutegura isomo rye igihe cyose aboneye umwanya."
              : "Guaranteed 24/7 availability for teachers to prepare and download lesson plans whenever needed, day or night."
            }
          </p>
        </div>
      </div>

      {/* Founder Message & Direct Contact Details */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-lg space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <HeartHandshake className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-lg font-black text-white">
              {isKinya ? "Ubutumwa bwa NKUNDIMANA Theogene ku Barimu" : "A Message from Founder NKUNDIMANA Theogene"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Teachers Quickly Tools • Empowering Educators Every Day
            </p>
          </div>
        </div>

        <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 italic">
          <p>
            "{isKinya 
              ? "Ubwedu n'intego yacu ni uko buri mwarimu abona umwanya uhagije wo kwitegura neza no kwigisha abana mu ishuri, aho kumarana amasaha menshi ashakisha uburyo bwo kwandika amapaji y'amapaji ya Lesson Plans. Teachers Quickly Tools yaje kubikemura mu buryo bw'ikoranabuhanga rigezweho kandi rizewe. Niba ufite igitekerezo, ikibazo cyangwa ubufasha ubwo ari bwo bwose, ntutuyange kumbaza directly kuri WhatsApp."
              : "Our target and vision is to ensure every teacher has enough time to teach and engage learners effectively, without being overwhelmed by hours of manual paperwork. Teachers Quickly Tools solves this with modern, trusted educational AI. Should you need any support or have feedback, feel free to contact me directly."
            }"
          </p>
          <div className="not-italic text-right font-bold text-amber-300 text-xs pt-1">
            — NKUNDIMANA Theogene (Founder)
          </div>
        </div>

        {/* Support & Payment Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-500/30 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wide">Direct WhatsApp & Phone</h4>
              <p className="text-sm font-extrabold text-white mt-0.5">{OWNER_INFO.whatsapp}</p>
              <p className="text-[11px] text-emerald-300/80 mt-1">Gufashwa ku kibazo icyo ari cyo cyose muri System.</p>
            </div>
          </div>

          <div className="bg-amber-950/80 p-4 rounded-2xl border border-amber-500/30 flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">MTN MoMo Payment Code</h4>
              <p className="text-sm font-extrabold text-amber-300 mt-0.5">{OWNER_INFO.momoCode}</p>
              <p className="text-[11px] text-amber-200/80 mt-1">Izina rizazamo: NKUNDIMANA Theogene</p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <button
            onClick={() => onNavigate('generator')}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{isKinya ? "Tegura Lesson Plan Ubu" : "Create Lesson Plan Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('subscription')}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>{isKinya ? "Reba Ifatabuguzi (Subscriptions)" : "View Subscription Plans"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
