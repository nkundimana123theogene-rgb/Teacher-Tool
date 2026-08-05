import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  Printer,
  Copy,
  Download,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Search,
  CheckCircle,
  Clock,
  Briefcase,
  HelpCircle,
  Edit2,
  Save,
  RotateCcw,
  ChevronDown,
  Layers,
  GraduationCap
} from 'lucide-react';
import { 
  ExerciseType, 
  QuestionCategory, 
  ExerciseSectionConfig, 
  ExerciseFormRequest, 
  ExerciseQuestion, 
  ExerciseOutputData, 
  UserProfile, 
  LanguageOption 
} from '../types';
import { REB_CURRICULUM_DATA, RTB_CURRICULUM_DATA, CurriculumTopicItem } from '../data/rwandaCurriculum';

interface ExercisesCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSubscription?: () => void;
  onOpenSignIn?: () => void;
}

export const ExercisesCreator: React.FC<ExercisesCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSubscription,
  onOpenSignIn
}) => {
  // Current active view: 'form' | 'output' | 'history'
  const [view, setView] = useState<'form' | 'output' | 'history'>('form');

  // Load saved exercises from local storage
  const [savedExercises, setSavedExercises] = useState<ExerciseOutputData[]>(() => {
    try {
      const stored = localStorage.getItem('tegura_saved_exercises');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to local storage whenever savedExercises changes
  useEffect(() => {
    try {
      localStorage.setItem('tegura_saved_exercises', JSON.stringify(savedExercises));
    } catch (err) {
      console.error('Error saving exercises to localStorage:', err);
    }
  }, [savedExercises]);

  // Form State
  const [creationType, setCreationType] = useState<ExerciseType>('homework');
  const [curriculumType, setCurriculumType] = useState<'REB' | 'RTB'>('REB');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCurriculumDropdown, setShowCurriculumDropdown] = useState(false);
  const [selectedCurriculumItem, setSelectedCurriculumItem] = useState<CurriculumTopicItem | null>(null);

  // Auto-filled or manually typed fields
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [unit, setUnit] = useState('');
  const [topic, setTopic] = useState('');
  const [schoolName, setSchoolName] = useState('NKORERA EDUCATION SECONDARY SCHOOL');

  // Settings
  const [timeAllowed, setTimeAllowed] = useState('40 Minutes');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Medium');
  const [language, setLanguage] = useState<LanguageOption>(selectedLanguage || 'English');
  const [sourceContent, setSourceContent] = useState('');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);
  const [includeHints, setIncludeHints] = useState(false);

  // Sections State
  const [useSections, setUseSections] = useState(true);
  const [sections, setSections] = useState<ExerciseSectionConfig[]>([
    { id: '1', title: 'Section A: Multiple Choice Questions', category: 'multiple_choice', questionCount: 5, marksPerQuestion: 2 },
    { id: '2', title: 'Section B: Short Answer & Explanations', category: 'short_answer', questionCount: 3, marksPerQuestion: 5 }
  ]);

  // Simple question config (when not using sections)
  const [simpleCategory, setSimpleCategory] = useState<QuestionCategory>('multiple_choice');
  const [simpleQuestionCount, setSimpleQuestionCount] = useState(10);
  const [simpleMarksPerQuestion, setSimpleMarksPerQuestion] = useState(2);

  // Generation UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<ExerciseOutputData | null>(null);

  // Display edit options
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOutput, setEditedOutput] = useState<ExerciseOutputData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'test' | 'answers' | 'marking' | 'hints'>('test');

  const printRef = useRef<HTMLDivElement>(null);

  // Filters curriculum list based on search query
  const filteredCurriculum = (curriculumType === 'REB' ? REB_CURRICULUM_DATA : RTB_CURRICULUM_DATA).filter(
    item => 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurriculumItem = (item: CurriculumTopicItem) => {
    setSelectedCurriculumItem(item);
    setSubject(item.subject);
    setGrade(item.grade);
    setUnit(item.unit);
    setTopic(item.topic);
    setSearchQuery(`${item.subject} (${item.grade}) - ${item.topic}`);
    setShowCurriculumDropdown(false);
  };

  const handleAddSection = () => {
    const nextId = (sections.length + 1).toString();
    const categories: QuestionCategory[] = ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'long_answer', 'calculation', 'matching', 'essay'];
    const randomCategory = categories[sections.length % categories.length];
    
    let defaultTitle = `Section ${String.fromCharCode(65 + sections.length)}: Questions`;
    if (randomCategory === 'multiple_choice') defaultTitle = `Section ${String.fromCharCode(65 + sections.length)}: Multiple Choice`;
    if (randomCategory === 'calculation') defaultTitle = `Section ${String.fromCharCode(65 + sections.length)}: Calculations`;
    if (randomCategory === 'true_false') defaultTitle = `Section ${String.fromCharCode(65 + sections.length)}: True or False`;

    setSections([
      ...sections,
      {
        id: nextId,
        title: defaultTitle,
        category: randomCategory,
        questionCount: 3,
        marksPerQuestion: 4
      }
    ]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    const updated = sections.filter(sec => sec.id !== id);
    // Recalculate titles / letters
    const finalized = updated.map((sec, idx) => ({
      ...sec,
      title: sec.title.startsWith('Section') 
        ? `Section ${String.fromCharCode(65 + idx)}: ${sec.title.split(': ')[1] || 'Questions'}` 
        : sec.title
    }));
    setSections(finalized);
  };

  const handleSectionChange = (id: string, field: keyof ExerciseSectionConfig, value: any) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === id) {
        return { ...sec, [field]: value };
      }
      return sec;
    }));
  };

  const handleGenerate = async () => {
    if (!subject || !grade || !topic) {
      setErrorMsg(language === 'Kinyarwanda' ? 'Ubuza gushyiramo Isomo, Umwaka, ndetse n’Umutwe w’isomo!' : 'Please fill in the Subject, Grade, and Topic!');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const requestData: ExerciseFormRequest = {
      creationType,
      curriculumType,
      subject,
      grade,
      topic,
      unit,
      country: 'Rwanda',
      curriculumStandard: curriculumType === 'REB' ? 'REB Competence-Based' : 'RTB TVET Standards',
      language,
      timeAllowed,
      useSections,
      sections: useSections ? sections : [{
        id: '1',
        title: 'Questions',
        category: simpleCategory,
        questionCount: simpleQuestionCount,
        marksPerQuestion: simpleMarksPerQuestion
      }],
      sourceContent: sourceContent.trim() ? sourceContent : undefined,
      difficulty,
      includeAnswerKey,
      includeMarkingScheme,
      includeHints,
      searchCurriculum: !!selectedCurriculumItem
    };

    try {
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          userEmail: user?.email,
          sessionToken: user?.sessionToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403 && errorData.code === 'PREMIUM_LIMIT_EXCEEDED') {
          setErrorMsg(errorData.error || "Ntabwo wemerewe gukora Exercises & Quizzes zirenga 5 ku kwezi z'ubuntu. Koresha izo wakoze cyangwa ugure ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf muri Subscription page!");
          setIsGenerating(false);
          return;
        }
        throw new Error(errorData.error || 'Server returned error during exercise generation');
      }

      const result: ExerciseOutputData = await response.json();
      setGeneratedData(result);
      setEditedOutput(result);
      setView('output');

      // Add to saved history list
      setSavedExercises(prev => [result, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while generating exercises. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    if (!editedOutput) return;
    
    let text = `==================================================\n`;
    text += `               ${schoolName.toUpperCase()}\n`;
    text += `   ${editedOutput.creationType.toUpperCase()}: ${editedOutput.title.toUpperCase()}\n`;
    text += `==================================================\n`;
    text += `Subject: ${editedOutput.subject} | Grade/Level: ${editedOutput.grade}\n`;
    text += `Topic: ${editedOutput.topic}\n`;
    text += `Time Allowed: ${editedOutput.timeAllowed}\n`;
    text += `Total Marks: ${editedOutput.totalMarks} Marks\n`;
    text += `--------------------------------------------------\n\n`;
    text += `INSTRUCTIONS:\n`;
    editedOutput.instructions.forEach((ins, i) => {
      text += `${i + 1}. ${ins}\n`;
    });
    text += `\n`;

    editedOutput.sections.forEach((sec, idx) => {
      text += `\n--- ${sec.title.toUpperCase()} ---\n`;
      if (sec.instructions) text += `Instructions: ${sec.instructions}\n`;
      text += `--------------------------------------------------\n`;
      sec.questions.forEach((q) => {
        text += `${q.number}. ${q.questionText} (${q.marks} Marks)\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            text += `   ${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
        text += `\n`;
      });
    });

    if (includeAnswerKey && editedOutput.answerKey) {
      text += `\n\n==================================================\n`;
      text += `                  ANSWER KEY\n`;
      text += `==================================================\n`;
      editedOutput.answerKey.forEach((ans) => {
        text += `Question ${ans.questionNumber}: ${ans.answer}\n`;
        if (ans.explanation) text += `   Explanation: ${ans.explanation}\n`;
        text += `\n`;
      });
    }

    if (includeMarkingScheme && editedOutput.markingScheme) {
      text += `\n\n==================================================\n`;
      text += `                MARKING SCHEME\n`;
      text += `==================================================\n`;
      editedOutput.markingScheme.forEach((criteria) => {
        text += `Question ${criteria.questionNumber} Criteria:\n`;
        text += `   - ${criteria.criteria} (Max: ${criteria.maxMarks} Marks)\n\n`;
      });
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEditQuestionText = (sectionIdx: number, questionIdx: number, newText: string) => {
    if (!editedOutput) return;
    const copy = JSON.parse(JSON.stringify(editedOutput)) as ExerciseOutputData;
    copy.sections[sectionIdx].questions[questionIdx].questionText = newText;
    setEditedOutput(copy);
  };

  const handleEditAnswerText = (questionNumber: number, newText: string) => {
    if (!editedOutput || !editedOutput.answerKey) return;
    const copy = JSON.parse(JSON.stringify(editedOutput)) as ExerciseOutputData;
    copy.answerKey = copy.answerKey.map(ans => {
      if (ans.questionNumber === questionNumber) {
        return { ...ans, answer: newText };
      }
      return ans;
    });
    setEditedOutput(copy);
  };

  const handleDeleteSavedExercise = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Ese urashaka gusiba uyu mwitozo koko?')) {
      setSavedExercises(prev => prev.filter(ex => ex.id !== id));
    }
  };

  // Helper labels based on selected language
  const getLabel = (en: string, rw: string) => {
    return language === 'Kinyarwanda' ? rw : en;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" id="exercises-creator-container">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-cyan-600" />
            <span>{getLabel('Assessments & Homework Creator', 'Imyitozo, Ama-Quizzes n’Ibizami')}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
            {getLabel(
              'REB & RTB TVET curriculum-aligned questions, homework sets, and diagnostic quizzes.',
              'Gura imyitozo, ama-quizzes ndetse n’ibizamini bihuye neza na gahunda y’uburezi y’u Rwanda.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              view === 'form' 
                ? 'bg-cyan-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {getLabel('Generator Form', 'Ifishi yo Kurema')}
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              view === 'history' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-purple-50 text-purple-950 hover:bg-purple-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{getLabel('History & Saved', 'Ibyatunganyijwe')}</span>
            {savedExercises.length > 0 && (
              <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-purple-300">
                {savedExercises.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Unlimited Premium Access Banner */}
      {!user?.isAdmin && !user?.hasPremiumToolsSub && (user?.monthlyExercisesCount || 0) >= 5 && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border-2 border-dashed border-orange-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-950">Wamaze gukoresha imfashanyigisho 5 z'ubuntu kuri uku kwezi!</h4>
              <p className="text-xs text-slate-600 font-bold mt-1">
                Gura ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf/mo gusa kugira ngo ukore Exercises & Quizzes zitemewe umubare (Unlimited)!
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

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:underline">
            {getLabel('Dismiss', 'Komeza')}
          </button>
        </div>
      )}

      {/* VIEW: MAIN FORM CONTAINER */}
      {view === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls Panel (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. What to create & Curriculum */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm">1</div>
                <h2 className="font-extrabold text-slate-800 text-base">{getLabel('Basic Structure', 'Imiterere y’ibanze')}</h2>
              </div>

              {/* Assessment Type */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-2">
                  {getLabel('Assessment Type', 'Ubwoko bw’isuzuma')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['homework', 'classwork', 'quiz'] as ExerciseType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCreationType(type)}
                      className={`py-3 px-2 rounded-xl border text-center transition-all ${
                        creationType === type
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-extrabold ring-1 ring-cyan-500 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-xs'
                      }`}
                    >
                      <span className="block text-sm capitalize">{type}</span>
                      <span className="text-[10px] opacity-75 mt-0.5 block">
                        {type === 'homework' && getLabel('Imyitozo yo mu rugo', 'Imyitozo yo mu rugo')}
                        {type === 'classwork' && getLabel('Imyitozo yo mu ishuri', 'Imyitozo yo mu ishuri')}
                        {type === 'quiz' && getLabel('Ikizamini kigufi', 'Ikizamini kigufi')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Curriculum Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-2">
                  {getLabel('Curriculum Framework', 'Inzego za Curriculum')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setCurriculumType('REB'); setSelectedCurriculumItem(null); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      curriculumType === 'REB'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-bold">REB (General Education)</span>
                    <span className="text-[10px] opacity-80 block mt-1">{getLabel('Senior 1 to Senior 6 Secondary', 'Kuva mu wa 1 kugeza mu wa 6')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurriculumType('RTB'); setSelectedCurriculumItem(null); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      curriculumType === 'RTB'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-black ring-1 ring-purple-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-bold">RTB (TVET Education)</span>
                    <span className="text-[10px] opacity-80 block mt-1">{getLabel('Level 3 to Level 5 Technical', 'Ubumenyingiro n’Imyuga')}</span>
                  </button>
                </div>
              </div>

              {/* CURRICULUM SEARCH AUTO-FILL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{getLabel('Search Rwanda Curriculum & Auto-Fill (Recommended)', 'Shakisha muri Curriculum y’u Rwanda kugira ngo byuzure byoze')}</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowCurriculumDropdown(true);
                      }}
                      onFocus={() => setShowCurriculumDropdown(true)}
                      placeholder={getLabel('Search e.g. Biology Cell, Mathematics Polynomial...', 'Shakisha isomo urugero: Ubuzima, Imibare, Mudasobwa...')}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-8 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => { setSearchQuery(''); setSelectedCurriculumItem(null); }}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCurriculumDropdown(!showCurriculumDropdown)}
                    className="px-3 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Dropdown list */}
                {showCurriculumDropdown && filteredCurriculum.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {filteredCurriculum.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectCurriculumItem(item)}
                        className="w-full text-left p-3 text-xs hover:bg-cyan-50/55 flex flex-col gap-1 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.subject}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">{item.grade}</span>
                        </div>
                        <p className="text-slate-500 font-medium text-[11px]">{item.unit}</p>
                        <p className="text-cyan-700 font-extrabold text-[11px] mt-0.5">Topic: {item.topic}</p>
                      </button>
                    ))}
                  </div>
                )}
                {showCurriculumDropdown && filteredCurriculum.length === 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-400 z-50">
                    {getLabel('No curriculum topic found. You can type details manually below.', 'Nta gice cyasubitswe cyabonetse. Shira ibyo ushaka munsi aha.')}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Manual Topic Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm">2</div>
                <h2 className="font-extrabold text-slate-800 text-base">{getLabel('Manual Topic Details', 'Ibisobanuro birambuye by’Isomo')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wide mb-1">
                    {getLabel('Subject / Trade Name', 'Isomo / Umwuga')}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Biology, Software Development"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wide mb-1">
                    {getLabel('Grade / Level', 'Umwaka / Urwego')}
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Senior 3, Level 4 TVET"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wide mb-1">
                    {getLabel('Unit Title (Optional)', 'Umutwe w’Isomo (Ntabwo ari ngombwa)')}
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Unit 2: Classification of Organisms"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wide mb-1">
                    {getLabel('Topic Title', 'Isomo Nyirizina / Igice')}
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Cell Division, SQL Database Queries"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 3. Question Structuring & Sections */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm">3</div>
                  <h2 className="font-extrabold text-slate-800 text-base">{getLabel('Question Structure & Sections', 'Imiterere y’Ibibazo')}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">{getLabel('Multi-Section Mode', 'Uburyo bwinshi')}</span>
                  <button
                    type="button"
                    onClick={() => setUseSections(!useSections)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      useSections ? 'bg-cyan-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        useSections ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {useSections ? (
                /* Multi section builder view */
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-bold">
                    {getLabel(
                      'Build customized exam sections. You can assign different question types and marks per section.',
                      'Kora imiterere y’ibizami ugabanye mu bice bitandukanye. Buri gice kigira amanota n’ubwoko bw’ibibazo byacyo.'
                    )}
                  </p>

                  <div className="space-y-3.5">
                    {sections.map((sec, idx) => (
                      <div key={sec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3.5 relative">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => handleSectionChange(sec.id, 'title', e.target.value)}
                            placeholder={`e.g. Section ${String.fromCharCode(65 + idx)}: Multiple Choice`}
                            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-black text-slate-800 w-full max-w-sm focus:ring-1 focus:ring-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            disabled={sections.length <= 1}
                            className="p-1 text-rose-500 hover:text-rose-700 disabled:opacity-40 transition-colors"
                            title="Remove section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Question category */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              {getLabel('Question Type', 'Ubwoko bw’Ibibazo')}
                            </label>
                            <select
                              value={sec.category}
                              onChange={(e) => handleSectionChange(sec.id, 'category', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-cyan-500"
                            >
                              <option value="multiple_choice">Multiple Choice (A, B, C, D)</option>
                              <option value="true_false">True / False</option>
                              <option value="fill_blank">Fill in the Blanks</option>
                              <option value="short_answer">Short Answer (1-3 sentences)</option>
                              <option value="long_answer">Long Answer / Explanations</option>
                              <option value="matching">Matching Questions</option>
                              <option value="calculation">Calculations & Equations</option>
                              <option value="essay">Essay Question</option>
                            </select>
                          </div>

                          {/* Question Count */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              {getLabel('No. of Questions', 'Umubare w’Ibibazo')}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={sec.questionCount}
                              onChange={(e) => handleSectionChange(sec.id, 'questionCount', parseInt(e.target.value) || 1)}
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>

                          {/* Marks per question */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              {getLabel('Marks Per Question', 'Amanota kuri buri kibazo')}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={sec.marksPerQuestion}
                              onChange={(e) => handleSectionChange(sec.id, 'marksPerQuestion', parseInt(e.target.value) || 1)}
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{getLabel('Add Section Block', 'Ongeraho Igice Gishyashya')}</span>
                  </button>
                </div>
              ) : (
                /* Simple view (single general type) */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {getLabel('Question Type', 'Ubwoko bw’Ibibazo')}
                    </label>
                    <select
                      value={simpleCategory}
                      onChange={(e) => setSimpleCategory(e.target.value as QuestionCategory)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                    >
                      <option value="multiple_choice">Multiple Choice (A, B, C, D)</option>
                      <option value="true_false">True / False</option>
                      <option value="fill_blank">Fill in the Blanks</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="long_answer">Long Answer / Explanations</option>
                      <option value="matching">Matching Questions</option>
                      <option value="calculation">Calculations & Equations</option>
                      <option value="essay">Essay Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {getLabel('Total Questions', 'Umubare w’Ibibazo Byose')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={simpleQuestionCount}
                      onChange={(e) => setSimpleQuestionCount(parseInt(e.target.value) || 5)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {getLabel('Marks per Question', 'Amanota kuri buri Kibazo')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={simpleMarksPerQuestion}
                      onChange={(e) => setSimpleMarksPerQuestion(parseInt(e.target.value) || 2)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Optional Textbook Context (Source Content) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm">4</div>
                <h2 className="font-extrabold text-slate-800 text-base">{getLabel('Source Text & Custom Context (Optional)', 'Inyandiko mfatakibazo (Ntabwo ari ngombwa)')}</h2>
              </div>
              
              <p className="text-xs text-slate-500 font-bold">
                {getLabel(
                  'Paste textbook paragraphs, reading comprehensions, formulas, or notes to instruct the AI to generate questions strictly based on that source text.',
                  'Shyiramo igice cy’igitabo, umwandiko, cyangwa inyandiko zizwi kugira ngo imyitozo ishingire kuri icyo gice gusa.'
                )}
              </p>

              <textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                rows={4}
                placeholder={getLabel(
                  'e.g. Paste a reading passage here or specific formulas/rules you want students to practice...',
                  'Ugerageza gushyiramo umwandiko basoma, amagambo, cyangwa andi mabwiriza ashobora kuguha ibibazo bihuye...'
                )}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>

          </div>

          {/* Right sidebar configurations */}
          <div className="space-y-6">
            
            {/* Quick settings card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                {getLabel('Assessment Config', 'Igenamiterere')}
              </h3>

              {/* Time Allowed */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide">
                  {getLabel('Time Allowed', 'Igihe cyo Gukora')}
                </label>
                <input
                  type="text"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(e.target.value)}
                  placeholder="e.g. 40 Minutes, 1 Hour, 2 Hours"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide">
                  {getLabel('School Name', 'Izina ry’Ishuri')}
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide">
                  {getLabel('Output Language', 'Ururimi ry’ibibazo')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                >
                  <option value="English">English</option>
                  <option value="Kinyarwanda">Kinyarwanda</option>
                  <option value="French">Français</option>
                  <option value="Swahili">Kiswahili</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide">
                  {getLabel('Difficulty', 'Ubukomere')}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                >
                  <option value="Easy">Easy (Kworoshye)</option>
                  <option value="Medium">Medium (Kugereranya)</option>
                  <option value="Hard">Hard (Gukomera)</option>
                  <option value="Mixed">Mixed Standards (Mvange)</option>
                </select>
              </div>
            </div>

            {/* Inclusions Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                {getLabel('Output Inclusions', 'Ibisubizo bizaho')}
              </h3>

              <div className="space-y-3 font-semibold text-xs text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{getLabel('Include Answer Key', 'Gushyiramo urufunguzo rw’ibisubizo')}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMarkingScheme}
                    onChange={(e) => setIncludeMarkingScheme(e.target.checked)}
                    className="rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{getLabel('Include Marking Scheme & Criteria', 'Ongeraho amabwiriza yo gukosora')}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHints}
                    onChange={(e) => setIncludeHints(e.target.checked)}
                    className="rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{getLabel('Include Helpful Hints for Students', 'Ongeraho inama zifasha abanyeshuri')}</span>
                </label>
              </div>
            </div>

            {/* BIG ACTION SUBMIT BUTTON */}
            {!user?.isAdmin && !user?.hasPremiumToolsSub && (user?.monthlyExercisesCount || 0) >= 5 ? (
              onOpenSubscription && (
                <button
                  type="button"
                  onClick={onOpenSubscription}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-4 rounded-2xl shadow-lg hover:shadow-orange-550/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm border border-orange-600 animate-pulse"
                >
                  <Sparkles className="w-5 h-5 text-slate-950 fill-amber-200" />
                  <span>{getLabel('Get Unlimited Access (2,500 Rwf)', 'Gura Ifatabuguzi (Umutekano n’uburenganzira bwose)')}</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>{getLabel('Generating Assessment...', 'Iri kurema Ibibazo... Please wait')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{getLabel('Create Assessment Now', 'REMA IMYITOZO / IKIZAMINI')}</span>
                  </>
                )}
              </button>
            )}

            <p className="text-[10px] text-center text-slate-400 font-bold leading-tight">
              ⚡ Powered by Gemini 3.6 Flash. Aligned directly with the Rwanda Education Board (REB) & RTB TVET standards.
            </p>

          </div>

        </div>
      )}

      {/* VIEW: GENERATED EXERCISE VIEW (PRINT / PREVIEW) */}
      {view === 'output' && editedOutput && (
        <div className="space-y-6">
          
          {/* Output view action header bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <button
              onClick={() => setView('form')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-all text-xs font-black flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{getLabel('Back to Creator', 'Subira ku Ifishi')}</span>
            </button>

            {/* Tabs for different output sheets */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveViewTab('test')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeViewTab === 'test' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                📝 {getLabel('Question Paper', 'Ibibazo Nyirizina')}
              </button>
              {includeAnswerKey && (
                <button
                  onClick={() => setActiveViewTab('answers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    activeViewTab === 'answers' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔑 {getLabel('Answer Key', 'Ibisubizo byose')}
                </button>
              )}
              {includeMarkingScheme && (
                <button
                  onClick={() => setActiveViewTab('marking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    activeViewTab === 'marking' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📋 {getLabel('Marking Guide', 'Amabwiriza')}
                </button>
              )}
              {includeHints && (
                <button
                  onClick={() => setActiveViewTab('hints')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    activeViewTab === 'hints' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  💡 {getLabel('Hints', 'Inama zifasha')}
                </button>
              )}
            </div>

            {/* Print, Copy, Edit Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                  isEditMode 
                    ? 'bg-amber-100 border-amber-300 text-amber-900' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Edit Questions & Answers directly"
              >
                {isEditMode ? getLabel('💾 Save Edits', 'Guhagarika no Kubika') : getLabel('✍️ Edit Text', 'Guhamya no Guhindura')}
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black flex items-center gap-1"
                title="Copy text representation to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm"
                title="Print assessment or save as PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Print / PDF</span>
              </button>
            </div>

          </div>

          {/* Printable Page Frame (Standard School Exam Look) */}
          <div 
            ref={printRef}
            className="bg-white p-8 md:p-12 border border-slate-200 rounded-2xl shadow-sm max-w-4xl mx-auto space-y-8 printable-document"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {/* Header info */}
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
              <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase text-slate-900">
                {schoolName}
              </h1>
              <h2 className="text-sm md:text-base font-semibold uppercase text-slate-800 underline">
                {creationType === 'homework' && getLabel('HOMEWORK EXERCISE ASSESSMENT', 'UMWITOZO WO MU RUGO (HOMEWORK)')}
                {creationType === 'classwork' && getLabel('CLASSWORK EXERCISE', 'UMWITOZO WO MU ISHURI (CLASSWORK)')}
                {creationType === 'quiz' && getLabel('DIAGNOSTIC TEST / QUIZ', 'IKIZAMINI KIGUFI (QUIZ / TEST)')}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left text-xs text-slate-800 pt-4" style={{ fontFamily: 'sans-serif' }}>
                <div className="border border-slate-400 p-2 font-bold">
                  {getLabel('Subject:', 'Isomo:')} <span className="font-normal">{editedOutput.subject}</span>
                </div>
                <div className="border border-slate-400 p-2 font-bold">
                  {getLabel('Class/Level:', 'Umwaka:')} <span className="font-normal">{editedOutput.grade}</span>
                </div>
                <div className="border border-slate-400 p-2 font-bold">
                  {getLabel('Time Allowed:', 'Igihe cyo Gukora:')} <span className="font-normal">{editedOutput.timeAllowed}</span>
                </div>
                <div className="border border-slate-400 p-2 font-bold">
                  {getLabel('Total Marks:', 'Amanota yose:')} <span className="font-normal">{editedOutput.totalMarks} Marks</span>
                </div>
              </div>

              {/* Student identification table (Empty lines for students to write their names when printed) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left text-xs font-bold pt-3" style={{ fontFamily: 'sans-serif' }}>
                <div className="border border-slate-400 p-2">
                  {getLabel('Student Name (Izina):', 'Izina ry’Umunyeshuri:')} <span className="font-normal">____________________</span>
                </div>
                <div className="border border-slate-400 p-2">
                  {getLabel('Date:', 'Itariki:')} <span className="font-normal">____ / ____ / 2026</span>
                </div>
                <div className="border border-slate-400 p-2 bg-slate-50 flex justify-between items-center">
                  <span>{getLabel('Marks Secured (Amanota):', 'Amanota Secured:')}</span>
                  <span className="font-bold border-l border-slate-400 pl-2">______ / {editedOutput.totalMarks}</span>
                </div>
              </div>
            </div>

            {/* General Instructions Block */}
            <div className="space-y-2 border-b border-slate-200 pb-4 text-xs font-medium" style={{ fontFamily: 'sans-serif' }}>
              <p className="font-black text-slate-900 uppercase tracking-wider">{getLabel('GENERAL INSTRUCTIONS:', 'AMABWIRIZA RUSANGE:')}</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {editedOutput.instructions.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
                <li>{getLabel('Write all your answers clearly in the spaces provided.', 'Andika ibisubizo byawe neza ahabugenewe.')}</li>
                <li>{getLabel('Read each question carefully before attempting.', 'Soma buri kibazo neza mbere yo kugerageza.')}</li>
              </ul>
            </div>

            {/* Context/Source Content Notice (If using textbook) */}
            {editedOutput.unit && (
              <div className="text-center font-bold text-slate-800 text-xs py-1 border border-dotted border-slate-300" style={{ fontFamily: 'sans-serif' }}>
                {editedOutput.unit} - Topic: {editedOutput.topic}
              </div>
            )}

            {/* VIEW TAB: QUESTION PAPER */}
            {activeViewTab === 'test' && (
              <div className="space-y-8">
                {editedOutput.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-4">
                    <div className="border-b-2 border-slate-800 pb-1 flex items-center justify-between">
                      <h3 className="font-bold text-sm md:text-base text-slate-900 uppercase">
                        {section.title}
                      </h3>
                      {section.instructions && (
                        <span className="text-xs text-slate-600 font-bold italic" style={{ fontFamily: 'sans-serif' }}>
                          ({section.instructions})
                        </span>
                      )}
                    </div>

                    <div className="space-y-6">
                      {section.questions.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-2 text-xs md:text-sm text-slate-900 leading-relaxed">
                          {/* Question Text */}
                          <div className="flex items-start justify-between gap-4 font-semibold">
                            <div className="flex-1">
                              {isEditMode ? (
                                <div className="flex gap-2 w-full">
                                  <span className="font-bold shrink-0">{q.number}.</span>
                                  <input
                                    type="text"
                                    value={q.questionText}
                                    onChange={(e) => handleEditQuestionText(sIdx, qIdx, e.target.value)}
                                    className="bg-amber-50 border border-amber-300 rounded px-2 py-0.5 font-sans text-xs w-full focus:outline-amber-500"
                                  />
                                </div>
                              ) : (
                                <p className="leading-relaxed">
                                  <span className="font-bold mr-1.5">{q.number}.</span>
                                  {q.questionText}
                                </p>
                              )}
                            </div>
                            <span className="font-bold text-slate-800 shrink-0 font-mono">
                              [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                            </span>
                          </div>

                          {/* Options if Multiple Choice */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6 pt-1 font-sans text-xs text-slate-800">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Matching space */}
                          {q.type === 'matching' && (
                            <div className="pl-6 pt-2 font-mono text-[11px] text-slate-600 space-y-1">
                              <div>{getLabel('[.....] Match option column A with B', '[.....] Ganisha amashusho/imvugo Column A kuri B')}</div>
                            </div>
                          )}

                          {/* Extra empty space or lines for answers on paper */}
                          {(q.type === 'short_answer' || q.type === 'calculation') && (
                            <div className="pl-6 pt-2 space-y-1.5">
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                            </div>
                          )}

                          {q.type === 'long_answer' && (
                            <div className="pl-6 pt-2 space-y-2">
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                              <div className="h-0.5 border-b border-slate-300 border-dashed w-full opacity-60"></div>
                            </div>
                          )}

                          {q.type === 'essay' && (
                            <div className="pl-6 pt-2 space-y-2">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-0.5 border-b border-slate-200 border-dashed w-full opacity-40"></div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW TAB: ANSWER KEY */}
            {activeViewTab === 'answers' && editedOutput.answerKey && (
              <div className="space-y-6">
                <div className="border-b-2 border-emerald-600 pb-1 text-emerald-950">
                  <h3 className="font-bold text-sm md:text-base uppercase flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>{getLabel('ANSWER KEY & EXPLANATIONS', 'URUFUNGUZO RW’IBISUBIZO N’IBISOBANURO')}</span>
                  </h3>
                </div>

                <div className="space-y-5 divide-y divide-slate-100 font-sans text-xs md:text-sm text-slate-800">
                  {editedOutput.answerKey.map((ans, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-start justify-between">
                        <span>Question {ans.questionNumber}:</span>
                      </div>
                      
                      {isEditMode ? (
                        <textarea
                          rows={2}
                          value={ans.answer}
                          onChange={(e) => handleEditAnswerText(ans.questionNumber, e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-2 text-xs focus:outline-amber-500"
                        />
                      ) : (
                        <p className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-emerald-950 font-medium">
                          {ans.answer}
                        </p>
                      )}

                      {ans.explanation && (
                        <p className="text-xs text-slate-500 italic pl-2.5 border-l-2 border-slate-300">
                          <strong className="text-slate-600">Explanation:</strong> {ans.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW TAB: MARKING SCHEME */}
            {activeViewTab === 'marking' && editedOutput.markingScheme && (
              <div className="space-y-6">
                <div className="border-b-2 border-purple-600 pb-1 text-purple-950">
                  <h3 className="font-bold text-sm md:text-base uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>{getLabel('MARKING SCHEME & GRADING CRITERIA', 'UBURYO BWO GUKOSORA N’AMABWIRIZA')}</span>
                  </h3>
                </div>

                <div className="space-y-4 divide-y divide-slate-100 font-sans text-xs md:text-sm text-slate-800">
                  {editedOutput.markingScheme.map((scheme, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>Question {scheme.questionNumber} Criteria:</span>
                        <span className="text-purple-700 font-mono">Max: {scheme.maxMarks} Marks</span>
                      </div>
                      <p className="bg-purple-50/40 p-2.5 rounded-lg border border-purple-100 text-purple-950 font-medium whitespace-pre-line">
                        {scheme.criteria}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW TAB: STUDENT HINTS */}
            {activeViewTab === 'hints' && (
              <div className="space-y-6">
                <div className="border-b-2 border-amber-500 pb-1 text-amber-950">
                  <h3 className="font-bold text-sm md:text-base uppercase flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                    <span>{getLabel('HELPFUL HINTS FOR STUDENTS', 'INAMA Z’UBUFASHA KURI ABANYESHURI')}</span>
                  </h3>
                </div>

                <div className="space-y-4 font-sans text-xs md:text-sm text-slate-800">
                  <p className="text-slate-500 italic">
                    {getLabel(
                      'These hints are intended to help scaffolding struggling students without giving away the direct answers.',
                      'Izi nama zifasha abanyeshuri badafite ubumenyi buhagije gukora neza badahawe ibisubizo ako kanya.'
                    )}
                  </p>

                  <div className="space-y-3">
                    {editedOutput.sections.flatMap(s => s.questions).map((q, idx) => q.hint && (
                      <div key={idx} className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 space-y-1">
                        <span className="font-black text-amber-900">Question {q.number} Hint:</span>
                        <p className="text-amber-950">{q.hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer stamp (Signature Area) */}
            <div className="pt-10 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500 text-center" style={{ fontFamily: 'sans-serif' }}>
              <div>
                <p className="font-bold text-slate-700">PREPARED BY (Teacher):</p>
                <div className="h-10 mt-2 border-b border-slate-400 max-w-xs mx-auto"></div>
                <p className="mt-1">Teacher</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">APPROVED BY (Head Teacher / DOS):</p>
                <div className="h-10 mt-2 border-b border-slate-400 max-w-xs mx-auto"></div>
                <p className="mt-1">{getLabel('Dean of Studies / Head Teacher', 'Ushinzwe Amasomo / Umuyobozi')}</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW: HISTORY OF SAVED EXERCISES */}
      {view === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              {getLabel('Saved Assessments History', 'Urutonde rw’imyitozo yabitswe')}
            </h2>
            {savedExercises.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(getLabel('Are you sure you want to clear all history?', 'Ese urashaka gusiba imyitozo yose mu mateka?'))) {
                    setSavedExercises([]);
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold"
              >
                {getLabel('Clear All History', 'Siba Amateka Yose')}
              </button>
            )}
          </div>

          {savedExercises.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <p className="font-extrabold text-slate-700 text-sm">
                  {getLabel('No Assessments Saved Yet', 'Nta myitozo irasubitswa aha')}
                </p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {getLabel(
                    'When you create exercises, homework, or quizzes, they will be saved here automatically for quick recovery, printing, or copying.',
                    'Iyo ukoze umwitozo, homework, cyangwa ikizamini birabikwa hano mu buryo bwikora kugira ngo wongere ubisome cyangwa ubyandike igihe cyose.'
                  )}
                </p>
              </div>
              <button
                onClick={() => setView('form')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-black transition-all shadow-xs"
              >
                {getLabel('Create Your First Assessment', 'Kora Umwitozo wa Mbere')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => {
                    setGeneratedData(exercise);
                    setEditedOutput(exercise);
                    setView('output');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-500/50 hover:shadow-md cursor-pointer transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                        exercise.creationType === 'quiz'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : exercise.creationType === 'homework'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                      }`}>
                        {exercise.creationType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                        {new Date(exercise.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                      {exercise.title}
                    </h3>

                    <div className="text-[11px] text-slate-500 font-semibold space-y-1">
                      <p>Subject: <span className="text-slate-800">{exercise.subject}</span> | Grade: <span className="text-slate-800">{exercise.grade}</span></p>
                      {exercise.unit && <p className="truncate">Unit: <span className="text-slate-800">{exercise.unit}</span></p>}
                      <p>Topic: <span className="text-slate-800">{exercise.topic}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                    <span className="font-mono text-cyan-700">
                      {exercise.totalQuestions} Questions | {exercise.totalMarks} Marks
                    </span>
                    <button
                      onClick={(e) => handleDeleteSavedExercise(exercise.id, e)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors"
                      title="Siba umwitozo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
