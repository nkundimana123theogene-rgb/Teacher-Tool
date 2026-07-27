import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Globe,
  LayoutGrid,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Lock,
  Zap,
  RotateCcw,
  Save,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import { LessonPlanRequest, LanguageOption, PlanFormatOption, UserProfile } from '../types';
import { OWNER_INFO } from '../data/plans';
import { LessonPlanSkeleton } from './LessonPlanSkeleton';

const DRAFT_KEY = 'teachers_tools_lesson_plan_draft';

interface LessonPlanDraft {
  format?: PlanFormatOption;
  schoolName?: string;
  teacherName?: string;
  term?: string;
  date?: string;
  subject?: string;
  classGrade?: string;
  unitNo?: string;
  lessonNo?: string;
  duration?: string;
  classSize?: string;
  specialNeeds?: string;
  unitTitle?: string;
  keyUnitCompetence?: string;
  lessonTitle?: string;
  instructionalObjective?: string;
  location?: string;
  learningMaterials?: string;
  references?: string;
  additionalNotes?: string;
  lastSavedAt?: string;
}

const getSavedDraft = (): LessonPlanDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore errors
  }
  return null;
};

interface LessonPlanFormProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  onSubmit: (request: LessonPlanRequest) => void;
  isGenerating: boolean;
  onOpenSubscription: () => void;
  onOpenSignIn: () => void;
}

// Primary and Secondary (Ordinary Level) Subject Lists
const PRIMARY_SUBJECTS = [
  'Mathematics',
  'Science and Elementary Technology',
  'Kinyarwanda',
  'English',
  'Social and Religious Studies',
  'Francais',
  'Creative Arts and Musics',
  'Physical Education and Sports',
];

const SECONDARY_O_LEVEL_SUBJECTS = [
  'Mathematics',
  'Entrepreneurship',
  'English',
  'Kinyarwanda',
  'History',
  'Geography',
  'Physics',
  'Francais',
  'Chemistry',
  'Biology',
  'Kiswahili',
  'MDD',
  'Information Communication and Technology( I.C.T)',
];

const SECONDARY_A_LEVEL_SUBJECTS = [
  'Mathematics',
  'Entrepreneurship',
  'Kinyarwanda',
  'English',
  'History',
  'Geography',
  'Physics',
  'Francais',
  'Chemistry',
  'Biology',
  'Kiswahili',
  'Musics',
  'Information Communication and Technology( I.C.T)',
];

export const LessonPlanForm: React.FC<LessonPlanFormProps> = ({
  user,
  selectedLanguage,
  onLanguageChange,
  onSubmit,
  isGenerating,
  onOpenSubscription,
  onOpenSignIn,
}) => {
  const savedDraft = getSavedDraft();

  const [format, setFormat] = useState<PlanFormatOption>(savedDraft?.format || 'reb_grid');
  const [schoolName, setSchoolName] = useState(savedDraft?.schoolName || '');
  const [teacherName, setTeacherName] = useState(savedDraft?.teacherName || user?.name || '');
  const [term, setTerm] = useState(savedDraft?.term || '');
  const [date, setDate] = useState(savedDraft?.date || new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState(savedDraft?.subject || '');
  const [classGrade, setClassGrade] = useState(savedDraft?.classGrade || '');
  const [unitNo, setUnitNo] = useState(savedDraft?.unitNo || '');
  const [lessonNo, setLessonNo] = useState(savedDraft?.lessonNo || '');
  const [duration, setDuration] = useState(savedDraft?.duration || '');
  const [classSize, setClassSize] = useState(savedDraft?.classSize || '');
  const [specialNeeds, setSpecialNeeds] = useState(savedDraft?.specialNeeds || '');
  const [unitTitle, setUnitTitle] = useState(savedDraft?.unitTitle || '');
  const [keyUnitCompetence, setKeyUnitCompetence] = useState(savedDraft?.keyUnitCompetence || '');
  const [lessonTitle, setLessonTitle] = useState(savedDraft?.lessonTitle || '');
  const [instructionalObjective, setInstructionalObjective] = useState(savedDraft?.instructionalObjective || '');
  const [location, setLocation] = useState(savedDraft?.location || 'In Classroom');
  const [learningMaterials, setLearningMaterials] = useState(savedDraft?.learningMaterials || '');
  const [references, setReferences] = useState(savedDraft?.references || '');
  const [additionalNotes, setAdditionalNotes] = useState(savedDraft?.additionalNotes || '');
  const [showQuotaPaymentModal, setShowQuotaPaymentModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(savedDraft?.lastSavedAt || null);
  const [isRestoredFromDraft, setIsRestoredFromDraft] = useState<boolean>(!!savedDraft);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved');
  const isInitialMount = useRef(true);

  // Auto-save form progress to localStorage draft whenever input fields change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');

    const timer = setTimeout(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const draftData: LessonPlanDraft = {
        format,
        schoolName,
        teacherName,
        term,
        date,
        subject,
        classGrade,
        unitNo,
        lessonNo,
        duration,
        classSize,
        specialNeeds,
        unitTitle,
        keyUnitCompetence,
        lessonTitle,
        instructionalObjective,
        location,
        learningMaterials,
        references,
        additionalNotes,
        lastSavedAt: timeString,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setLastSavedTime(timeString);
      } catch {
        // Ignore storage errors
      }
      setSaveStatus('saved');
    }, 350);

    return () => clearTimeout(timer);
  }, [
    format,
    schoolName,
    teacherName,
    term,
    date,
    subject,
    classGrade,
    unitNo,
    lessonNo,
    duration,
    classSize,
    specialNeeds,
    unitTitle,
    keyUnitCompetence,
    lessonTitle,
    instructionalObjective,
    location,
    learningMaterials,
    references,
    additionalNotes,
  ]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore
    }
    setFormat('reb_grid');
    setSchoolName('');
    setTeacherName(user?.name || '');
    setTerm('');
    setDate(new Date().toISOString().split('T')[0]);
    setSubject('');
    setClassGrade('');
    setUnitNo('');
    setLessonNo('');
    setDuration('');
    setClassSize('');
    setSpecialNeeds('');
    setUnitTitle('');
    setKeyUnitCompetence('');
    setLessonTitle('');
    setInstructionalObjective('');
    setLocation('In Classroom');
    setLearningMaterials('');
    setReferences('');
    setAdditionalNotes('');
    setLastSavedTime(null);
    setIsRestoredFromDraft(false);
  };

  // Sample templates for quick auto-fill across all subject areas
  const loadPresetSample = (
    sampleType:
      | 'chemistry'
      | 'biology'
      | 'physics'
      | 'entrepreneurship'
      | 'kinyarwanda'
      | 'francais'
      | 'geography'
      | 'math'
      | 'science'
      | 'english'
      | 'social'
  ) => {
    if (sampleType === 'chemistry') {
      setSubject('Chemistry');
      setClassGrade('S4 MCB');
      setUnitTitle('Chemical Bonding and Molecular Structure');
      setKeyUnitCompetence('Analyze ionic, covalent, and metallic bonding and relate bonding types to physical properties of substances.');
      setLessonTitle('Differentiating Covalent and Ionic Bonds through Solubility & Conductivity');
      setInstructionalObjective('By the end of the lesson, using salt and sugar solutions with a test circuit, learners will correctly classify 4 compound samples into ionic or covalent bonds.');
      setLearningMaterials('Distilled water, sodium chloride, glucose powder, beaker, battery circuit test kit');
      setReferences('REB Senior 4 Chemistry Curriculum Student Book Page 88-92');
    } else if (sampleType === 'biology') {
      setSubject('Biology');
      setClassGrade('S3 MCB');
      setUnitTitle('Photosynthesis and Plant Nutrition');
      setKeyUnitCompetence('Explain light-dependent and light-independent reactions of photosynthesis in green plants.');
      setLessonTitle('Testing for Starch in Green Leaves');
      setInstructionalObjective('By the end of the 40-minute practical session, learners will safely execute the iodine starch test on leaf samples and state 3 conditions required for photosynthesis.');
      setLearningMaterials('Iodine solution, ethanol, water bath, test tubes, green leaf samples');
      setReferences('REB Senior 3 Biology Student Textbook Page 110-115');
    } else if (sampleType === 'physics') {
      setSubject('Physics');
      setClassGrade('S5 PCM');
      setUnitTitle('Newtonian Mechanics and Momentum');
      setKeyUnitCompetence('Apply Newton\'s Laws of Motion to solve real-world force and momentum conservation problems.');
      setLessonTitle('Demonstrating Conservation of Linear Momentum in Elastic Collisions');
      setInstructionalObjective('Learners will calculate initial and final momentum in 3 collision experiments using dynamic trolleys with less than 5% error.');
      setLearningMaterials('Ticker-timer, dynamic trolleys, runways, stopwatch, slotted masses');
      setReferences('REB Senior 5 Physics Competence-Based Syllabus Page 64-70');
    } else if (sampleType === 'entrepreneurship') {
      setSubject('Entrepreneurship');
      setClassGrade('S2');
      setUnitTitle('Business Ideas and Opportunity Identification');
      setKeyUnitCompetence('Analyze local market gaps and generate viable business ideas for community development.');
      setLessonTitle('Conducting a SWOT Analysis for a Local Rwandan Micro-Business');
      setInstructionalObjective('Learners working in groups will formulate a SWOT matrix for a local cassava processing enterprise and present 2 viable market strategies.');
      setLearningMaterials('Business case study handouts, chart paper, markers');
      setReferences('REB Senior 2 Entrepreneurship Learner\'s Book Page 35-40');
    } else if (sampleType === 'kinyarwanda') {
      setSubject('Kinyarwanda');
      setClassGrade('S1');
      setUnitTitle('Imihanhangano n\'Ibisakuzo mu Muryango Nyarwanda');
      setKeyUnitCompetence('Gusesengura ibisobanuro n\'akamaro k\'ibisakuzo n\'imigani mu muco nyarwanda.');
      setLessonTitle('Ibisakuzo: Insobanuro, Amategeko no Kwedewesa mu Rurimi rw\'Ikinyarwanda');
      setInstructionalObjective('Umunyeshuri azabasha gusobanura n\'ubucukumbuzi ibisakuzo 8 no kugaragaza indangagaciro zikubiyemo.');
      setLearningMaterials('Ibitabo by\'ibisakuzo, amakarita y\'Ikinyarwanda, icyapa kigaragaza imigani');
      setReferences('Intecuranganwa y\'Ikinyarwanda REB Senior 1 Page 22-28');
    } else if (sampleType === 'francais') {
      setSubject('Français');
      setClassGrade('S2');
      setUnitTitle('Expression d\'opinions et Débat environnemental');
      setKeyUnitCompetence('Exprimer son point de vue et argumenter en français sur la protection de la nature.');
      setLessonTitle('Utilisation des expressions d\'opinion (À mon avis, Je pense que) dans un débat');
      setInstructionalObjective('À la fin de la leçon, l\'élève sera capable d\'écrire et de prononcer 4 phrases d\'opinion argumentées en français.');
      setLearningMaterials('Cartes de vocabulaire, fiches de dialogue guidé, tableau');
      setReferences('Guide Pédagogique REB Français Senior 2 Page 50-54');
    } else if (sampleType === 'geography') {
      setSubject('Geography');
      setClassGrade('S3');
      setUnitTitle('Physical Features and Climate of Rwanda');
      setKeyUnitCompetence('Evaluate the influence of relief and drainage networks on agricultural zoning in Rwanda.');
      setLessonTitle('Map Reading: Identifying Altitude Contours and Relief Systems in Rwanda');
      setInstructionalObjective('Learners will locate major mountain ranges and volcanic zones on the topographic map of Rwanda with 100% accuracy.');
      setLearningMaterials('Topographic map of Rwanda, compasses, wall elevation charts');
      setReferences('REB Senior 3 Geography Student Manual Page 78-83');
    } else if (sampleType === 'math') {
      setSubject('Mathematics');
      setClassGrade('P5');
      setUnitTitle('Fractions and Decimals');
      setKeyUnitCompetence('To add and subtract proper fractions with equal denominators in real-life problems.');
      setLessonTitle('Addition of Proper Fractions with Equal Denominators');
      setInstructionalObjective('By the end of the 40-minute lesson, learners will add 5 fraction equations correctly.');
      setLearningMaterials('Fraction cards, chalkboard, fraction strips');
      setReferences('REB Primary 5 Mathematics Curriculum Page 42-45');
    } else if (sampleType === 'science') {
      setSubject('SET (Science & Elementary Technology)');
      setClassGrade('P4');
      setUnitTitle('Water Cycle and Conservation');
      setKeyUnitCompetence('Understand the stages of evaporation, condensation, and precipitation in nature.');
      setLessonTitle('Demonstrating Evaporation and Condensation');
      setInstructionalObjective('Learners will explain the water cycle diagram and list 3 ways to harvest rainwater.');
      setLearningMaterials('Water kettle, glass beaker, mirror, wall chart');
      setReferences('REB Primary 4 SET Teacher Manual Page 30-34');
    } else if (sampleType === 'english') {
      setSubject('English Language');
      setClassGrade('S2');
      setUnitTitle('Environmental Protection & Climate Change');
      setKeyUnitCompetence('Use conditional sentences (If-clauses) to discuss environmental issues.');
      setLessonTitle('Using Type 1 Conditionals in Environmental Discussions');
      setInstructionalObjective('Learners will construct 5 correct conditional sentences regarding tree planting.');
      setLearningMaterials('Flashcards, reading passage hand-outs');
      setReferences('REB Senior 2 English Textbook Page 60-65');
    } else if (sampleType === 'social') {
      setSubject('Social Studies');
      setClassGrade('P6');
      setUnitTitle('Economy and Trade in Rwanda');
      setKeyUnitCompetence('Examine major economic activities in Rwanda and their role in national development.');
      setLessonTitle('Agriculture and Agriculture Products in Rwanda');
      setInstructionalObjective('Learners will identify cash crops and food crops grown in Rwanda with 100% accuracy.');
      setLearningMaterials('Map of Rwanda, crop samples (tea, coffee), pictures');
      setReferences('REB Primary 6 Social Studies Page 15-20');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenSignIn();
      return;
    }

    if (!user.isAdmin && user.remainingPlans <= 0) {
      setShowQuotaPaymentModal(true);
      return;
    }

    onSubmit({
      schoolName,
      teacherName: teacherName || user?.name || 'Teacher',
      term,
      date,
      subject,
      classGrade,
      unitNo,
      lessonNo,
      duration,
      classSize,
      specialNeeds,
      unitTitle,
      keyUnitCompetence,
      lessonTitle,
      instructionalObjective,
      location,
      learningMaterials,
      references,
      language: selectedLanguage,
      format,
      additionalNotes,
    });
  };

  // Scroll to top when generating starts so the user sees the skeleton screen immediately
  useEffect(() => {
    if (isGenerating) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isGenerating]);

  if (isGenerating) {
    return (
      <LessonPlanSkeleton
        language={selectedLanguage}
        format={format}
        subject={subject}
        topic={lessonTitle || unitTitle}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-black mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Teacher Tool AI Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Create Official REB Lesson Plan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate 1-page printable lesson plans instantly in any language.
          </p>
        </div>

        {/* Quota & User Badge */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Remaining Credits</div>
            <div className="text-sm font-black text-emerald-800">
              {user ? (user.isAdmin ? '👑 Unlimited' : `${user.remainingPlans} Plans Left`) : 'Sign in for 3 Free Plans'}
            </div>
          </div>
          {user ? (
            <button
              type="button"
              onClick={onOpenSubscription}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
              id="form-upgrade-access-btn"
            >
              <Zap className="w-3.5 h-3.5" />
              ⚡ Upgrade
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSignIn}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
              id="form-sign-in-btn"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Auto-Save Draft Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/90 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
          {saveStatus === 'saving' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              Saving...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
              Saved
            </span>
          )}
          <span className="text-slate-700">
            {isRestoredFromDraft
              ? '✨ Draft restored from browser storage'
              : '💾 Progress auto-saved locally'}
            {lastSavedTime ? ` (${lastSavedTime})` : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClearDraft}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors shrink-0"
          title="Reset form to default values and clear local draft"
          id="clear-draft-btn"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Draft</span>
        </button>
      </div>

      {/* Format Toggle & Quick Presets */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Format Selector */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            ✓ Select Lesson Plan Format:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('reb_grid')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                format === 'reb_grid'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
              id="format-reb-grid-btn"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>REB Grid Format</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('open_format')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                format === 'open_format'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
              id="format-open-format-btn"
            >
              <FileText className="w-4 h-4" />
              <span>Flexible Open Format</span>
            </button>
          </div>
        </div>

        {/* Quick Subject Selectors for Primary and Secondary O-Level */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 col-span-1 md:col-span-2 space-y-3">
          {/* Section 1: Primary Subjects */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <span>🎒 I. Lessons of Primary (Amashuri Abanza - 8):</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Primary 1 - Primary 6
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRIMARY_SUBJECTS.map((pSub) => (
                <button
                  key={`primary-${pSub}`}
                  type="button"
                  onClick={() => {
                    setSubject(pSub);
                    if (!classGrade.startsWith('P')) {
                      setClassGrade('P5');
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    subject === pSub
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-white text-slate-800 hover:text-emerald-900 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {pSub}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Secondary Ordinary Level Subjects */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <span>📚 II. Lessons of Secondary (Ordinary Level - O-Level - 13):</span>
              </label>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-full">
                Senior 1 - Senior 3
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SECONDARY_O_LEVEL_SUBJECTS.map((sSub) => (
                <button
                  key={`secondary-o-${sSub}`}
                  type="button"
                  onClick={() => {
                    setSubject(sSub);
                    if (!classGrade.startsWith('S')) {
                      setClassGrade('S2');
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    subject === sSub
                      ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-800 hover:text-blue-900 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {sSub}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Secondary Advanced Level Subjects */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                <span>🎓 III. Lessons of Secondary ( A-Level - 13):</span>
              </label>
              <span className="text-[10px] text-purple-700 font-semibold bg-purple-100/80 px-2 py-0.5 rounded-full">
                Senior 4 - Senior 6
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SECONDARY_A_LEVEL_SUBJECTS.map((aSub) => (
                <button
                  key={`secondary-a-${aSub}`}
                  type="button"
                  onClick={() => {
                    setSubject(aSub);
                    if (!classGrade.startsWith('S4') && !classGrade.startsWith('S5') && !classGrade.startsWith('S6')) {
                      setClassGrade('S5 MCB');
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    subject === aSub
                      ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                      : 'bg-white text-slate-800 hover:text-purple-900 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {aSub}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic School & Teacher Metadata */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            1. School & Class Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                School Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. G.S. Remera Catholic"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Teacher's Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g. Teacher Eric"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Subject (Isomo) <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                list="primary-secondary-subjects"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-slate-800 placeholder:text-slate-500 placeholder:font-normal"
              />
              <datalist id="primary-secondary-subjects">
                {/* Primary subjects */}
                {PRIMARY_SUBJECTS.map((sub) => (
                  <option key={`dl-p-${sub}`} value={sub}>
                    Primary: {sub}
                  </option>
                ))}
                {/* Secondary Ordinary Level subjects */}
                {SECONDARY_O_LEVEL_SUBJECTS.map((sub) => (
                  <option key={`dl-s-o-${sub}`} value={sub}>
                    Secondary O-Level: {sub}
                  </option>
                ))}
                {/* Secondary Advanced Level subjects */}
                {SECONDARY_A_LEVEL_SUBJECTS.map((sub) => (
                  <option key={`dl-s-a-${sub}`} value={sub}>
                    Secondary A-Level: {sub}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Class / Grade (Umwaka w'Ishoori) <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                list="primary-secondary-grades"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                placeholder="e.g. P5 or S3 MCB"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-slate-800 placeholder:text-slate-500 placeholder:font-normal"
              />
              <datalist id="primary-secondary-grades">
                <option value="P1">Primary 1 (P1)</option>
                <option value="P2">Primary 2 (P2)</option>
                <option value="P3">Primary 3 (P3)</option>
                <option value="P4">Primary 4 (P4)</option>
                <option value="P5">Primary 5 (P5)</option>
                <option value="P6">Primary 6 (P6)</option>
                <option value="S1">Senior 1 (S1)</option>
                <option value="S2">Senior 2 (S2)</option>
                <option value="S3">Senior 3 (S3)</option>
                <option value="S4 MCB">Senior 4 MCB</option>
                <option value="S4 PCM">Senior 4 PCM</option>
                <option value="S4 PCB">Senior 4 PCB</option>
                <option value="S4 MEG">Senior 4 MEG</option>
                <option value="S4 HEG">Senior 4 HEG</option>
                <option value="S5 MCB">Senior 5 MCB</option>
                <option value="S5 PCM">Senior 5 PCM</option>
                <option value="S5 PCB">Senior 5 PCB</option>
                <option value="S6 MCB">Senior 6 MCB</option>
                <option value="S6 PCM">Senior 6 PCM</option>
                <option value="TVET Level 3">TVET Level 3</option>
                <option value="TVET Level 4">TVET Level 4</option>
                <option value="TVET Level 5">TVET Level 5</option>
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Term <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Term 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Unit N° <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={unitNo}
                onChange={(e) => setUnitNo(e.target.value)}
                placeholder="e.g. Unit 3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lesson N° <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={lessonNo}
                onChange={(e) => setLessonNo(e.target.value)}
                placeholder="e.g. 1 of 2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Duration <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 40 minutes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Class Size <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={classSize}
                onChange={(e) => setClassSize(e.target.value)}
                placeholder="e.g. 45 learners"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Class Location <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="In Classroom">In Classroom</option>
                <option value="Outside / School Playground">Outside / School Playground</option>
                <option value="Science / Computer Laboratory">Science / Computer Laboratory</option>
                <option value="School Library">School Library</option>
              </select>
            </div>
          </div>
        </div>

        {/* Special Educational Needs */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Type of Special Educational Needs & number of learners <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={specialNeeds}
            onChange={(e) => setSpecialNeeds(e.target.value)}
            placeholder="e.g. 1 learner with low vision (or None)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
          />
        </div>

        {/* Unit & Lesson Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            2. Unit & Competence Objectives
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Unit Title <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="e.g. Fractions and Decimals"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium placeholder:text-slate-500 placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Title of the Lesson <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Addition of Proper Fractions"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-emerald-900 placeholder:text-slate-500 placeholder:font-normal"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Key Unit Competence <span className="text-red-500 font-bold">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={keyUnitCompetence}
              onChange={(e) => setKeyUnitCompetence(e.target.value)}
              placeholder="e.g. To add and subtract proper fractions correctly in real-life problems..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <label className="block text-[11px] font-bold text-slate-800">
                Instructional Objective (ABCD Model of Objectives) <span className="text-red-500 font-bold">*</span>
              </label>
              <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600 fill-amber-400" />
                <span>AI ABCD-Model Auto-Generated</span>
              </span>
            </div>
            <textarea
              rows={3}
              value={instructionalObjective}
              onChange={(e) => setInstructionalObjective(e.target.value)}
              placeholder="e.g. By the end of the lesson, given proper fraction cards and charts, learners will be able to add proper fractions with equal denominators accurately."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400 font-medium text-slate-800"
            />
            
            {/* ABCD Criteria Micro Guide */}
            <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-600 space-y-1">
              <div className="font-extrabold text-slate-800 flex items-center gap-1">
                <span>🎯 ABCD Model (Four Components of Instructional Objectives):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 text-[10px] text-slate-700 font-medium pt-0.5">
                <span className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200">A. Audience (Umwigishwa)</span>
                <span className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200">B. Behavior (Igikorwa/Inshinga)</span>
                <span className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200">C. Condition (Ibikoresho/Imitwarire)</span>
                <span className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200">D. Degree (Urugero/Ipimo)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Learning Materials <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={learningMaterials}
                onChange={(e) => setLearningMaterials(e.target.value)}
                placeholder="e.g. Fraction strips, wall charts, chalkboard"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                References <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="e.g. REB Primary 5 Mathematics Pupil's Book Page 42"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Quota Warning Callout if 0 remaining plans */}
        {user && !user.isAdmin && user.remainingPlans <= 0 && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                  ⚠️ Lesson Plans z'ukwezi / Izo waguze zarangiye (0 Plans Left)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Lesson plans z'ukwezi kwanyu cyangwa izo mwaguze zarangiye! Mwipfuza gukomeza igikorwa cyo gukora lesson plans, mwasabwa kugura izindi lesson plans zishya muri Subscription zo gukomeza igikorwa cyanyu neza.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSubscription}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-lg shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>⚡ Gura Izindi Lesson Plans</span>
            </button>
          </div>
        )}

        {/* Generate Action Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.005] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
            id="generate-lesson-plan-submit-btn"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating {selectedLanguage} Lesson Plan... Please wait</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>➡️ Generate Lesson Plan ({selectedLanguage})</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quota Payment Required Modal */}
      {showQuotaPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Lesson Plans z'Ukwezi Zarangiye (Plans Expired / Finished)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mwamaze gukoresha lesson plans zose z'ukwezi kwanyu / izo mwaguze (<strong className="text-amber-700">0 Lesson Plans Left</strong>). Kugira ngo mukomeze gukora no gukorera izindi lesson plans, banza ugure izindi lesson plans zishya mu ifatabuguzi (Subscription) ryo gukomeza igikorwa.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Uburyo bwo kwishyura bworoshye:</span>
              </div>
              <p>• Mobile Money (MTN / Airtel): <strong>{OWNER_INFO.momoCode}</strong></p>
              <p>• Izina rya Konti: <strong>NKUNDIMANA Theogene</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuotaPaymentModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Funga / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuotaPaymentModal(false);
                  onOpenSubscription();
                }}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Kwishyura Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
