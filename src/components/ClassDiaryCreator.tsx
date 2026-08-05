import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  BookOpen,
  Clock,
  Users,
  FileText,
  Check,
  Plus,
  Trash2,
  Edit,
  Printer,
  Share2,
  Download,
  Search,
  AlertCircle,
  ArrowLeft,
  Save,
  Globe,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ClassDiaryData, ClassDiaryRequest, UserProfile, LanguageOption } from '../types';

interface ClassDiaryCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSignIn?: () => void;
  onBackToDashboard?: () => void;
  onOpenSubscription?: () => void;
}

export const ClassDiaryCreator: React.FC<ClassDiaryCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSignIn,
  onBackToDashboard,
  onOpenSubscription
}) => {
  // Locale state
  const [lang, setLang] = useState<LanguageOption>(selectedLanguage || 'English');

  // List of saved diaries (synced with both localStorage and Firestore)
  const [savedDiaries, setSavedDiaries] = useState<ClassDiaryData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('1st & 2nd Period (08:20 - 09:40)');
  const [lessonTitle, setLessonTitle] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Loaded saved lesson plans to let the user auto-fill the form
  const [savedLessonPlans, setSavedLessonPlans] = useState<any[]>([]);

  // Generated/edited diary states
  const [currentDiary, setCurrentDiary] = useState<ClassDiaryData | null>(null);
  const [workCoveredSummary, setWorkCoveredSummary] = useState('');
  const [skillsCompetencesTargeted, setSkillsCompetencesTargeted] = useState('');
  const [homeworkAssigned, setHomeworkAssigned] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [remarksObservations, setRemarksObservations] = useState('');

  // UI status states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeDiaryView, setActiveDiaryView] = useState<'create' | 'history' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [generationStep, setGenerationStep] = useState(0);

  const progressMessages = [
    "Analyzing lesson content and subject standards...",
    "Drafting pedagogical class coverage summary...",
    "Aligning with national generic competences...",
    "Formulating targeted homework questions...",
    "Crafting realistic teacher observations...",
    "Finalizing Cahier de Textes record entry..."
  ];

  // Load initial data
  useEffect(() => {
    // 1. Load saved lesson plans for auto-fill helper
    try {
      const storedPlans = localStorage.getItem('tegura_saved_plans') || localStorage.getItem('nkorera_saved_plans');
      if (storedPlans) {
        setSavedLessonPlans(JSON.parse(storedPlans));
      }
    } catch (e) {
      console.warn("Failed to read saved lesson plans:", e);
    }

    // 2. Load diaries from offline cache first
    try {
      const storedDiaries = localStorage.getItem('tegura_saved_diaries') || localStorage.getItem('nkorera_saved_diaries');
      if (storedDiaries) {
        setSavedDiaries(JSON.parse(storedDiaries));
      }
    } catch (e) {
      console.warn("Failed to read cached class diaries:", e);
    }

    // 3. Fetch latest diaries from Firestore database
    if (user?.email) {
      fetchDiariesFromBackend(user.email);
    }
  }, [user]);

  // Loading indicator for progress step
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const fetchDiariesFromBackend = async (email: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/class-diary/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        const data = await response.json();
        setSavedDiaries(data);
        localStorage.setItem('tegura_saved_diaries', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to load class diaries from Firestore:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Helper to pre-populate form from a saved lesson plan
  const handleSelectLessonPlan = (plan: any) => {
    if (!plan || !plan.header) return;
    setSubject(plan.header.subject || '');
    setClassGrade(plan.header.classGrade || '');
    setLessonTitle(plan.header.lessonTitle || '');
    if (plan.header.date) setDate(plan.header.date);
    setStatusMsg({
      type: 'success',
      text: lang === 'Kinyarwanda' 
        ? `Isomo rya "${plan.header.lessonTitle}" ryashyizwe mu ifishi neza!`
        : `Lesson "${plan.header.lessonTitle}" loaded into form successfully!`
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Generate class diary with Gemini
  const handleGenerateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !classGrade.trim() || !lessonTitle.trim()) {
      setStatusMsg({
        type: 'error',
        text: lang === 'Kinyarwanda' 
          ? 'Ugomba kwandika Isomo, Umwaka, n\'Umutwe w\'isomo kugira ngo ukomeze.'
          : 'Subject, Class, and Lesson Topic are required.'
      });
      return;
    }

    if (!user) {
      if (onOpenSignIn) onOpenSignIn();
      return;
    }

    setIsGenerating(true);
    setStatusMsg(null);

    const requestPayload: ClassDiaryRequest = {
      subject,
      classGrade,
      date,
      period,
      lessonTitle,
      language: lang,
      additionalInfo
    };

    try {
      const response = await fetch('/api/class-diary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: requestPayload,
          userEmail: user.email,
          sessionToken: user.sessionToken
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errData = await response.json().catch(() => ({}));
          if (errData.code === 'PREMIUM_LIMIT_EXCEEDED') {
            setStatusMsg({
              type: 'error',
              text: errData.error || "Ntabwo wemerewe gukora Class Diary (Cahier de Textes) zirenga 5 ku kwezi z'ubuntu. Koresha izo wakoze cyangwa ugure ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf muri Subscription page!"
            });
            setIsGenerating(false);
            return;
          }
        }
        throw new Error('Server error generating diary entry');
      }

      const data = await response.json();

      // Populate draft editor fields
      setWorkCoveredSummary(data.workCoveredSummary || '');
      setSkillsCompetencesTargeted(data.skillsCompetencesTargeted || '');
      setHomeworkAssigned(data.homeworkAssigned || '');
      setAttendanceNotes(lang === 'Kinyarwanda' ? 'Abanyeshuri bose bahari / Ntawasibye.' : 'All learners present.');
      setRemarksObservations(data.remarksObservations || '');

      // Create temporary diary container
      const newDraft: ClassDiaryData = {
        id: 'cd_' + Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString(),
        userEmail: user.email,
        subject,
        classGrade,
        date,
        period,
        lessonTitle,
        workCoveredSummary: data.workCoveredSummary || '',
        skillsCompetencesTargeted: data.skillsCompetencesTargeted || '',
        homeworkAssigned: data.homeworkAssigned || '',
        attendanceNotes: lang === 'Kinyarwanda' ? 'Abanyeshuri bose bahari / Ntawasibye.' : 'All learners present.',
        remarksObservations: data.remarksObservations || '',
        language: lang
      };

      setCurrentDiary(newDraft);
      setActiveDiaryView('edit');
      setStatusMsg({
        type: 'success',
        text: lang === 'Kinyarwanda'
          ? 'Cahier de Textes yakozwe neza! Ushobora kuyihindura no kuyibika.'
          : 'Class Diary generated successfully! You can now adjust fields below.'
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: lang === 'Kinyarwanda'
          ? 'Guhura n\'ikibazo mu gukora ifishi. Ongera ugerageze.'
          : 'Failed to generate class diary. Please check your connection and retry.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Manually draft diary
  const handleWriteManually = () => {
    if (!subject.trim() || !classGrade.trim() || !lessonTitle.trim()) {
      setStatusMsg({
        type: 'error',
        text: lang === 'Kinyarwanda' 
          ? 'Ugomba kwandika Isomo, Umwaka, n\'Umutwe w\'isomo kugira ngo ufungure manual editor.'
          : 'Please input Subject, Class, and Lesson Topic to open the manual draft editor.'
      });
      return;
    }

    const manualDraft: ClassDiaryData = {
      id: 'cd_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      userEmail: user?.email || 'offline_teacher@nkorera.edu',
      subject,
      classGrade,
      date,
      period,
      lessonTitle,
      workCoveredSummary: '',
      skillsCompetencesTargeted: '',
      homeworkAssigned: '',
      attendanceNotes: '',
      remarksObservations: '',
      language: lang
    };

    // Initialize state
    setWorkCoveredSummary('');
    setSkillsCompetencesTargeted('');
    setHomeworkAssigned('');
    setAttendanceNotes('');
    setRemarksObservations('');

    setCurrentDiary(manualDraft);
    setActiveDiaryView('edit');
  };

  // Save/Update class diary record
  const handleSaveDiary = async () => {
    if (!currentDiary) return;
    setIsSaving(true);
    setStatusMsg(null);

    const updatedDiary: ClassDiaryData = {
      ...currentDiary,
      workCoveredSummary,
      skillsCompetencesTargeted,
      homeworkAssigned,
      attendanceNotes,
      remarksObservations,
      language: lang
    };

    // Save to local storage list
    const existingIdx = savedDiaries.findIndex(d => d.id === updatedDiary.id);
    let updatedList = [...savedDiaries];
    if (existingIdx > -1) {
      updatedList[existingIdx] = updatedDiary;
    } else {
      updatedList.unshift(updatedDiary);
    }
    setSavedDiaries(updatedList);
    localStorage.setItem('tegura_saved_diaries', JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('class-diary-saved'));

    // Save to Firestore backend
    if (user?.email) {
      try {
        const response = await fetch('/api/class-diary/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diary: updatedDiary })
        });
        if (response.ok) {
          setStatusMsg({
            type: 'success',
            text: lang === 'Kinyarwanda' 
              ? 'Igitabo cy\'Ibyakozwe kibitswe neza muri Cloud!'
              : 'Class Diary entry saved successfully!'
          });
        } else {
          throw new Error();
        }
      } catch (err) {
        setStatusMsg({
          type: 'success',
          text: lang === 'Kinyarwanda'
            ? 'Ibyakozwe bibitswe by\'agateganyo kuri telephone/computer yawe (Offline Mode).'
            : 'Saved locally. It will sync automatically when you are back online.'
        });
      }
    } else {
      setStatusMsg({
        type: 'success',
        text: lang === 'Kinyarwanda'
          ? 'Bibitswe mu gukoresha local browser cache! Winjire kugira ngo bibikwe ku mutekano.'
          : 'Saved offline on your local browser cache. Sign in to sync with Cloud.'
      });
    }

    setCurrentDiary(updatedDiary);
    setIsSaving(false);
  };

  // Delete diary record
  const handleDeleteDiary = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      lang === 'Kinyarwanda'
        ? 'Ushaka gusiba iyi fishi burundu?'
        : 'Are you sure you want to permanently delete this Cahier de Textes record?'
    );
    if (!confirmed) return;

    const filtered = savedDiaries.filter(d => d.id !== id);
    setSavedDiaries(filtered);
    localStorage.setItem('tegura_saved_diaries', JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('class-diary-saved'));

    try {
      await fetch('/api/class-diary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.warn("Could not delete from backend database, offline cache deleted:", err);
    }

    if (currentDiary?.id === id) {
      setCurrentDiary(null);
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Web Share API
  const handleShare = async () => {
    if (!currentDiary) return;

    const shareTitle = `${currentDiary.subject} - ${currentDiary.classGrade} Diary (${currentDiary.date})`;
    const shareText = `
*NKORERA EDUCATION - CAHIER DE TEXTES / JOURNAL DE CLASSE*
---------------------------------------
• ${lang === 'Kinyarwanda' ? 'Isomo' : 'Subject'}: ${currentDiary.subject}
• ${lang === 'Kinyarwanda' ? 'Umwaka' : 'Class/Grade'}: ${currentDiary.classGrade}
• ${lang === 'Kinyarwanda' ? 'Itariki n\'Igihe' : 'Date & Period'}: ${currentDiary.date} (${currentDiary.period})
• ${lang === 'Kinyarwanda' ? 'Isomo Nyirizina' : 'Lesson Topic'}: ${currentDiary.lessonTitle}

*1. ${lang === 'Kinyarwanda' ? 'Ibyakozwe (Summary of Covered Work)' : 'Summary of Work Covered'}:*
${workCoveredSummary}

*2. ${lang === 'Kinyarwanda' ? 'Ubushobozi / Generic Competences' : 'Targeted Skills & Competences'}:*
${skillsCompetencesTargeted}

*3. ${lang === 'Kinyarwanda' ? 'Umukoro watanzwe (Homework Assigned)' : 'Homework / Assignment'}:*
${homeworkAssigned}

*4. ${lang === 'Kinyarwanda' ? 'Abasibye (Attendance Notes)' : 'Attendance & Absent Learners'}:*
${attendanceNotes}

*5. ${lang === 'Kinyarwanda' ? 'Ibyagaragaye / Remarks & Observations' : 'Pedagogical Remarks'}:*
${remarksObservations}

---------------------------------------
Generated via Nkorera Education / Teacher Tool
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText
        });
      } catch (err) {
        console.warn("Share canceled or failed:", err);
      }
    } else {
      // Fallback copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert(
          lang === 'Kinyarwanda'
            ? 'Inyandiko ya Cahier de Textes yakopishijwe mu mutwe (Clipboard)! Ushobora kuyoherereza uwo ushaka kuri WhatsApp cyangwa Email.'
            : 'Cahier de Textes content copied to clipboard! You can paste and send it via WhatsApp or Email.'
        );
      } catch (copyErr) {
        console.error("Clipboard write failed:", copyErr);
      }
    }
  };

  // Filtering for History
  const filteredDiaries = savedDiaries.filter(d => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      d.subject.toLowerCase().includes(query) ||
      d.classGrade.toLowerCase().includes(query) ||
      d.date.toLowerCase().includes(query) ||
      d.lessonTitle.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 antialiased">
      {/* Tab Navigation/Header bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            {lang === 'Kinyarwanda' ? 'Cahier de Textes (Journal de Classe)' : 'Class Diary / Cahier de Textes'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'Kinyarwanda' 
              ? 'Tegura igitabo cy\'ibyakozwe mu ishuri ukoresheje AI cyangwa Intoki, ubibike kuri cloud kandi ubyexportinge.'
              : 'Keep accurate pedagogical diary records of work covered, target competences, homework, and observations.'}
          </p>
        </div>

        {/* Top controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveDiaryView('create');
              setCurrentDiary(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-1 ${
              activeDiaryView === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            {lang === 'Kinyarwanda' ? 'Kora Ifishi' : 'Draft New Entry'}
          </button>

          <button
            onClick={() => setActiveDiaryView('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2 ${
              activeDiaryView === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            {lang === 'Kinyarwanda' ? `Amadosiye Yabitswe (${savedDiaries.length})` : `My History (${savedDiaries.length})`}
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-200 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === 'Kinyarwanda' ? 'Subira Inyuma' : 'Dashboard'}
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm transition-all duration-300 print:hidden ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${statusMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`} />
          <div className="text-sm font-medium">{statusMsg.text}</div>
        </div>
      )}

      {/* VIEW: CREATE ENTRY FORM */}
      {activeDiaryView === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns - Create form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              {lang === 'Kinyarwanda' ? 'Ibisobanuro by\'Ishuri n\'Isomo' : 'Enter Session Details'}
            </h2>

            {/* Unlimited Premium Access Banner */}
            {!user?.isAdmin && !user?.hasPremiumToolsSub && (user?.monthlyDiaryCount || 0) >= 5 && (
              <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border-2 border-dashed border-orange-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5 fill-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950">Wamaze gukoresha imfashanyigisho 5 z'ubuntu kuri uku kwezi!</h4>
                    <p className="text-xs text-slate-600 font-bold mt-1">
                      Gura ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf/mo gusa kugira ngo ukore Class Diary / Cahier de Textes zitemewe umubare (Unlimited)!
                    </p>
                  </div>
                </div>
                {onOpenSubscription && (
                  <button
                    type="button"
                    onClick={onOpenSubscription}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-orange-600 shrink-0 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950 fill-amber-200" />
                    <span>GURA IFATABUGUZI (2,500 Rwf)</span>
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleGenerateDiary} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === 'Kinyarwanda' ? 'Isomo (Subject)' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Physics, Kinyarwanda"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === 'Kinyarwanda' ? 'Umwaka / Icyiciro (Class)' : 'Class / Grade'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary 5, Senior 3, S4 MCE"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === 'Kinyarwanda' ? 'Itariki (Date)' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === 'Kinyarwanda' ? 'Amasaha y\'Isomo (Period / Hours)' : 'Period / Hour'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st & 2nd Period (08:20 - 09:40)"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {lang === 'Kinyarwanda' ? 'Umutwe w\'isomo cyangwa Topic (Lesson Topic)' : 'Lesson Title / Topic'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solving Linear Equations, Cellular Respiration"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {lang === 'Kinyarwanda' ? 'Umutwe Runaka cyangwa Inyongera (Optional Notes)' : 'Additional Context or Custom Instructions'}
                  </label>
                  <span className="text-gray-400 text-[10px]">{lang === 'Kinyarwanda' ? 'Bihitamo' : 'Optional'}</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="e.g. Emphasis on active group work, or list specific textbook pages covered..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  {lang === 'Kinyarwanda' ? 'Ururimi (Language)' : 'Diary Language'}:
                </label>
                <div className="flex gap-1.5">
                  {(['English', 'Kinyarwanda', 'French', 'Swahili'] as LanguageOption[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        lang === l
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {!user?.isAdmin && !user?.hasPremiumToolsSub && (user?.monthlyDiaryCount || 0) >= 5 ? (
                  onOpenSubscription && (
                    <button
                      type="button"
                      onClick={onOpenSubscription}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl shadow-md border border-orange-600 animate-pulse transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-5 w-5 text-slate-950 fill-amber-200" />
                      <span>{lang === 'Kinyarwanda' ? 'Get Unlimited Access (2,500 Rwf)' : 'Get Unlimited Access (2,500 Rwf)'}</span>
                    </button>
                  )
                ) : (
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{lang === 'Kinyarwanda' ? 'AI iri kubyaza...' : 'Generating Class Diary...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>{lang === 'Kinyarwanda' ? 'Genera ifishi na AI' : 'Generate with Gemini AI'}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleWriteManually}
                  disabled={isGenerating}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <Edit className="h-4 w-4" />
                  <span>{lang === 'Kinyarwanda' ? 'Andika n’Intoki' : 'Draft Manually'}</span>
                </button>
              </div>
            </form>

            {/* PROGRESS LOADING BAR */}
            {isGenerating && (
              <div className="mt-6 border-t border-gray-100 pt-5 animate-pulse">
                <div className="flex justify-between text-xs font-semibold text-emerald-700 mb-1">
                  <span>{progressMessages[generationStep]}</span>
                  <span>{Math.round(((generationStep + 1) / progressMessages.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((generationStep + 1) / progressMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Columns - Auto-fill from lesson plan history helper */}
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 flex flex-col h-[520px]">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-gray-500" />
              {lang === 'Kinyarwanda' ? 'Gufatira ku Masomo Yabitswe' : 'Auto-Fill from Lesson Plans'}
            </h2>
            <p className="text-gray-500 text-xs mb-4">
              {lang === 'Kinyarwanda'
                ? 'Kanda kuri rimwe mu masomo wigeze gutegura hano munsi kugira ngo uhite wuzuza ifishi ya Cahier de Textes ako kanya!'
                : 'Speed up diary drafting! Select a previously generated lesson plan below to automatically fill out this diary request.'}
            </p>

            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
              {savedLessonPlans.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-xl border border-gray-100">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    {lang === 'Kinyarwanda' ? 'Nta masomo yageneratingwe arimo.' : 'No saved lesson plans found.'}
                  </p>
                </div>
              ) : (
                savedLessonPlans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectLessonPlan(p)}
                    className="p-3 bg-white hover:bg-emerald-50/30 rounded-xl border border-gray-100 hover:border-emerald-200 transition duration-200 cursor-pointer flex flex-col gap-1 text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-gray-800 line-clamp-1">{p.header.lessonTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0 uppercase tracking-wider">
                        {p.header.classGrade}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                      <span>{p.header.subject}</span>
                      <span>{p.header.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: EDIT / ADJUST GENERATED DIARY ENTRY */}
      {activeDiaryView === 'edit' && currentDiary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Editing column (Left/Large) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 print:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                <Edit className="h-4.5 w-4.5 text-emerald-600" />
                {lang === 'Kinyarwanda' ? 'Kosora Igitabo cy’Ibyakozwe' : 'Edit Diary Record'}
              </h2>
              <button
                onClick={() => setActiveDiaryView('create')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {lang === 'Kinyarwanda' ? 'Hingura Ifishi nshya' : 'Create page'}
              </button>
            </div>

            <div className="space-y-4">
              {/* Field 1 */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  1. {lang === 'Kinyarwanda' ? 'Ibyakozwe mu ruziga (Summary of Covered Work)' : 'Work Covered Summary'}
                </label>
                <textarea
                  rows={4}
                  value={workCoveredSummary}
                  onChange={(e) => setWorkCoveredSummary(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="What concepts and activities were delivered to learners during the session?"
                />
              </div>

              {/* Field 2 */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  2. {lang === 'Kinyarwanda' ? 'Ubushobozi bwifuzwa (Targeted Competences)' : 'Skills & Competences Targeted'}
                </label>
                <textarea
                  rows={3}
                  value={skillsCompetencesTargeted}
                  onChange={(e) => setSkillsCompetencesTargeted(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Which generic competences or curriculum outcomes were targeted?"
                />
              </div>

              {/* Field 3 */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  3. {lang === 'Kinyarwanda' ? 'Umukoro watanzwe (Homework Assigned)' : 'Homework / Assignment Given'}
                </label>
                <textarea
                  rows={3}
                  value={homeworkAssigned}
                  onChange={(e) => setHomeworkAssigned(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Details of assignments or exercises assigned to the class..."
                />
              </div>

              {/* Field 4 */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    4. {lang === 'Kinyarwanda' ? 'Abasibye / Attendance (Absent Students)' : 'Attendance & Absence Logs'}
                  </label>
                  <input
                    type="text"
                    value={attendanceNotes}
                    onChange={(e) => setAttendanceNotes(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="e.g. All present, or: Ntwari James and Mukamana Ange absent"
                  />
                </div>
              </div>

              {/* Field 5 */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  5. {lang === 'Kinyarwanda' ? 'Ibyagaragaye / Isuzuma (Remarks & Observations)' : 'Remarks & Observations'}
                </label>
                <textarea
                  rows={3}
                  value={remarksObservations}
                  onChange={(e) => setRemarksObservations(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Pedagogical observations about learning progress, difficulties, etc."
                />
              </div>

              {/* ACTION: SAVE WORK */}
              <button
                type="button"
                onClick={handleSaveDiary}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{lang === 'Kinyarwanda' ? 'Biri kubikwa...' : 'Saving entry...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    <span>{lang === 'Kinyarwanda' ? 'Bika Ibyakozwe' : 'Save Diary Entry'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Printable Layout Preview column (Right/Huge) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between print:hidden border-b border-gray-100 pb-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                {lang === 'Kinyarwanda' ? 'Ifishi y\'Ibisohoka (Print Preview)' : 'Printable Cahier de Textes Slip'}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition duration-150 flex items-center gap-1"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{lang === 'Kinyarwanda' ? 'Share / Kohereza' : 'Share'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition duration-150 flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  <span>{lang === 'Kinyarwanda' ? 'Print / Gushushanya' : 'Print'}</span>
                </button>
              </div>
            </div>

            {/* THE ACTUAL CAHIER DE TEXTES PAPER LAYOUT (Rendered on screen & optimized for A4 portrait printing) */}
            <div className="border border-gray-300 p-8 rounded-lg bg-white relative text-gray-800 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] font-sans mx-auto max-w-[210mm] print:border-0 print:p-0">
              {/* Header Branding */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                <h3 className="text-base font-extrabold text-gray-900 tracking-wide uppercase">
                  {lang === 'Kinyarwanda' 
                    ? 'REPUBLIKA Y’U RWANDA - MINISITERI Y’UBUREZI' 
                    : 'REPUBLIC OF RWANDA - MINISTRY OF EDUCATION'}
                </h3>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-0.5">
                  {lang === 'Kinyarwanda' ? 'IGITABO CY’IBYAKOZWE (CAHIER DE TEXTES / CLASS DIARY)' : 'CLASS DIARY RECORD / CAHIER DE TEXTES'}
                </h4>
                <div className="text-[10px] text-gray-400 mt-1">
                  Nkorera Education Platform • {new Date().getFullYear()}
                </div>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 gap-y-2 border-b border-gray-200 pb-4 mb-4">
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500">
                    {lang === 'Kinyarwanda' ? 'Isomo (Subject)' : 'Subject'}:
                  </span>{' '}
                  <span className="font-semibold text-gray-800 text-sm ml-1 uppercase">{currentDiary.subject}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500">
                    {lang === 'Kinyarwanda' ? 'Umwaka (Class)' : 'Class / Grade'}:
                  </span>{' '}
                  <span className="font-semibold text-gray-800 text-sm ml-1 uppercase">{currentDiary.classGrade}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500">
                    {lang === 'Kinyarwanda' ? 'Itariki (Date)' : 'Date'}:
                  </span>{' '}
                  <span className="font-medium text-gray-800 ml-1">{currentDiary.date}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500">
                    {lang === 'Kinyarwanda' ? 'Igihe (Period)' : 'Period / Hour'}:
                  </span>{' '}
                  <span className="font-medium text-gray-800 ml-1">{currentDiary.period}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold uppercase text-[10px] text-gray-500">
                    {lang === 'Kinyarwanda' ? 'Isomo Nyirizina (Lesson Topic)' : 'Lesson Topic'}:
                  </span>{' '}
                  <span className="font-bold text-emerald-900 text-xs ml-1 uppercase">{currentDiary.lessonTitle}</span>
                </div>
              </div>

              {/* CORE METRIC SECTIONS IN GRID OR ROWS */}
              <div className="space-y-4">
                {/* 1. Summary of Work Covered */}
                <div className="border border-gray-200 rounded-lg p-3.5">
                  <h5 className="font-extrabold uppercase text-[10px] text-emerald-800 mb-1.5 tracking-wider border-b border-gray-100 pb-1">
                    1. {lang === 'Kinyarwanda' ? 'IBYAKOZWE MU RUZIGA (SUMMARY OF WORK COVERED)' : 'SUMMARY OF WORK COVERED'}
                  </h5>
                  <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap">
                    {workCoveredSummary || '...'}
                  </p>
                </div>

                {/* 2. Skills and Competences */}
                <div className="border border-gray-200 rounded-lg p-3.5">
                  <h5 className="font-extrabold uppercase text-[10px] text-emerald-800 mb-1.5 tracking-wider border-b border-gray-100 pb-1">
                    2. {lang === 'Kinyarwanda' ? 'UBUSHOBOZI BWIFUZWA (TARGETED COMPETENCES)' : 'SKILLS & COMPETENCES TARGETED'}
                  </h5>
                  <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap">
                    {skillsCompetencesTargeted || '...'}
                  </p>
                </div>

                {/* 3. Homework */}
                <div className="border border-gray-200 rounded-lg p-3.5">
                  <h5 className="font-extrabold uppercase text-[10px] text-emerald-800 mb-1.5 tracking-wider border-b border-gray-100 pb-1">
                    3. {lang === 'Kinyarwanda' ? 'UMUKORO WATANZWE (HOMEWORK / ASSIGNMENT)' : 'HOMEWORK / ASSIGNMENT'}
                  </h5>
                  <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap">
                    {homeworkAssigned || '...'}
                  </p>
                </div>

                {/* 4. Attendance & Observations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Attendance */}
                  <div className="border border-gray-200 rounded-lg p-3.5">
                    <h5 className="font-extrabold uppercase text-[10px] text-emerald-800 mb-1.5 tracking-wider border-b border-gray-100 pb-1">
                      4. {lang === 'Kinyarwanda' ? 'ABASIBYE (ABSENT LEARNERS / ATTENDANCE)' : 'ABSENT LEARNERS / ATTENDANCE'}
                    </h5>
                    <p className="text-gray-700 leading-relaxed text-xs">
                      {attendanceNotes || '...'}
                    </p>
                  </div>

                  {/* Observations */}
                  <div className="border border-gray-200 rounded-lg p-3.5">
                    <h5 className="font-extrabold uppercase text-[10px] text-emerald-800 mb-1.5 tracking-wider border-b border-gray-100 pb-1">
                      5. {lang === 'Kinyarwanda' ? 'IBYAGARAGAYE / REMARKS & OBSERVATIONS' : 'PEDAGOGICAL OBSERVATIONS & REMARKS'}
                    </h5>
                    <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap">
                      {remarksObservations || '...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Signatures Blocks */}
              <div className="mt-10 pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 text-[11px]">
                <div className="text-left space-y-4">
                  <div>
                    <span className="font-bold block uppercase text-[9px] text-gray-500">
                      {lang === 'Kinyarwanda' ? 'Izina n’Umukono w’Umwarimu' : 'Teacher’s Name & Signature'}
                    </span>
                    <div className="border-b border-dashed border-gray-400 w-44 h-8 flex items-end pb-1 font-semibold text-gray-800">
                      {user?.name || 'Teacher'}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold block uppercase text-[9px] text-gray-500">Itariki (Date)</span>
                    <div className="border-b border-dashed border-gray-400 w-44 h-6 flex items-end pb-1 text-gray-600">
                      {currentDiary.date}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-4 flex flex-col items-end">
                  <div className="w-44 text-left">
                    <span className="font-bold block uppercase text-[9px] text-gray-500">
                      {lang === 'Kinyarwanda' ? 'Umuyobozi w’Ishuri (Headteacher Stamp)' : "Headteacher's Visa & Stamp"}
                    </span>
                    <div className="border-b border-dashed border-gray-400 w-full h-8 flex items-end pb-1 text-gray-300 text-center justify-center">
                      Visa & Stamp
                    </div>
                  </div>
                  <div className="w-44 text-left">
                    <span className="font-bold block uppercase text-[9px] text-gray-500">Itariki (Date)</span>
                    <div className="border-b border-dashed border-gray-400 w-full h-6 flex items-end pb-1 text-gray-300">
                      ______ / ______ / 2026
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ARCHIVE HISTORY (Saved Diary Entries with Search and Filters) */}
      {activeDiaryView === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {lang === 'Kinyarwanda' ? 'Ibitabo Byose Byabitswe' : 'My Class Diaries Archive'}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'Kinyarwanda'
                  ? 'Kanda kuri dosiye ufungure amakuru yayo mu buryo bwa printable, cyangwa uyisibe.'
                  : 'Search and open any previously completed Cahier de Textes records.'}
              </p>
            </div>

            {/* Real-time search bar */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder={lang === 'Kinyarwanda' ? 'Shaka ku isomo, umwaka, cyangwa itariki...' : 'Filter by subject, grade, topic, date...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                {lang === 'Kinyarwanda' ? 'Ibisobanuro biri gushakwa...' : 'Loading diaries from database...'}
              </p>
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="py-20 text-center max-w-sm mx-auto">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                {lang === 'Kinyarwanda' ? 'Nta fishi za Cahier de Textes zabonetse' : 'No Class Diaries Found'}
              </h3>
              <p className="text-xs text-gray-400">
                {searchQuery 
                  ? (lang === 'Kinyarwanda' ? 'Nta fishi ihura n’ibyo washatse.' : 'No items matched your current search filters.')
                  : (lang === 'Kinyarwanda' ? 'Urabanza utegure ifishi yawe ya mbere!' : 'Get started by creating your very first pedagogical diary entry!')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">{lang === 'Kinyarwanda' ? 'Itariki' : 'Date'}</th>
                    <th className="py-3 px-4">{lang === 'Kinyarwanda' ? 'Umwaka / Isomo' : 'Class & Subject'}</th>
                    <th className="py-3 px-4">{lang === 'Kinyarwanda' ? 'Isomo Nyirizina' : 'Lesson Topic'}</th>
                    <th className="py-3 px-4">{lang === 'Kinyarwanda' ? 'Abasibye' : 'Attendance'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'Kinyarwanda' ? 'Gukora' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredDiaries.map((diary) => (
                    <tr
                      key={diary.id}
                      onClick={() => {
                        setCurrentDiary(diary);
                        setWorkCoveredSummary(diary.workCoveredSummary || '');
                        setSkillsCompetencesTargeted(diary.skillsCompetencesTargeted || '');
                        setHomeworkAssigned(diary.homeworkAssigned || '');
                        setAttendanceNotes(diary.attendanceNotes || '');
                        setRemarksObservations(diary.remarksObservations || '');
                        setActiveDiaryView('edit');
                      }}
                      className="hover:bg-gray-50/50 cursor-pointer transition duration-150 group"
                    >
                      <td className="py-4 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {diary.date}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">{diary.subject}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">{diary.classGrade}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate font-medium text-gray-700">
                        {diary.lessonTitle}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 max-w-xxs truncate">
                        {diary.attendanceNotes || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setCurrentDiary(diary);
                              setWorkCoveredSummary(diary.workCoveredSummary || '');
                              setSkillsCompetencesTargeted(diary.skillsCompetencesTargeted || '');
                              setHomeworkAssigned(diary.homeworkAssigned || '');
                              setAttendanceNotes(diary.attendanceNotes || '');
                              setRemarksObservations(diary.remarksObservations || '');
                              setActiveDiaryView('edit');
                            }}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition duration-150"
                            title={lang === 'Kinyarwanda' ? 'Fungura cyangwa Kosora' : 'Open & Edit'}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteDiary(diary.id, e)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition duration-150"
                            title={lang === 'Kinyarwanda' ? 'Siba' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
