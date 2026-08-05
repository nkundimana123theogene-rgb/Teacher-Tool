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
  HelpCircle,
  Edit2,
  Save,
  RotateCcw,
  ChevronDown,
  Layers,
  Globe,
  Settings,
  ListFilter
} from 'lucide-react';
import { 
  WorksheetRequest, 
  WorksheetQuestion, 
  WorksheetData, 
  UserProfile, 
  LanguageOption 
} from '../types';

interface WorksheetsCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSubscription?: () => void;
  onOpenSignIn?: () => void;
}

export const WorksheetsCreator: React.FC<WorksheetsCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSubscription,
  onOpenSignIn
}) => {
  // Current active view: 'form' | 'output' | 'history'
  const [view, setView] = useState<'form' | 'output' | 'history'>('form');

  // Load saved worksheets from local storage
  const [savedWorksheets, setSavedWorksheets] = useState<WorksheetData[]>(() => {
    try {
      const stored = localStorage.getItem('tegura_saved_worksheets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to local storage whenever savedWorksheets changes
  useEffect(() => {
    try {
      localStorage.setItem('tegura_saved_worksheets', JSON.stringify(savedWorksheets));
    } catch (err) {
      console.error('Error saving worksheets to localStorage:', err);
    }
  }, [savedWorksheets]);

  // Form State
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [worksheetType, setWorksheetType] = useState('short_answer');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [language, setLanguage] = useState<string>('English (English)');
  const [curriculum, setCurriculum] = useState('');
  const [country, setCountry] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  // Computed Values
  const totalQuestionsText = `${questionCount} questions`;
  const totalMarksText = `${questionCount * marksPerQuestion} marks`;

  // Generation UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<WorksheetData | null>(null);
  const [generationProgressStep, setGenerationProgressStep] = useState(0);

  // Output View State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOutput, setEditedOutput] = useState<WorksheetData | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'worksheet' | 'answerKey'>('worksheet');

  const printRef = useRef<HTMLDivElement>(null);

  // Dynamic loading messages
  const progressMessages = [
    "Analyzing worksheet requirements...",
    "Retrieving standard curriculum benchmarks...",
    "Drafting high-quality educational questions...",
    "Generating detailed solutions & explanations...",
    "Formatting and compiling final printable worksheet..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationProgressStep(0);
      interval = setInterval(() => {
        setGenerationProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Submits the Worksheet Request to the server
  const handleGenerateWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !gradeLevel.trim() || !topic.trim()) {
      setErrorMsg('Subject, Grade Level, and Topic are required.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const requestBody: WorksheetRequest = {
      subject,
      gradeLevel,
      topic,
      worksheetType,
      difficulty,
      questionCount,
      marksPerQuestion,
      language,
      curriculum: curriculum || undefined,
      country: country || undefined,
      customInstructions: customInstructions || undefined,
      additionalDetails: additionalDetails || undefined,
      webSearch,
      includeAnswerKey
    };

    try {
      const response = await fetch('/api/generate-worksheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          userEmail: user?.email,
          sessionToken: user?.sessionToken
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errData = await response.json().catch(() => ({}));
          if (errData.code === 'PREMIUM_LIMIT_EXCEEDED') {
            setErrorMsg(errData.error || "Ntabwo wemerewe gukora Worksheets zirenga 5 ku kwezi z'ubuntu. Koresha izo wakoze cyangwa ugure ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf muri Subscription page!");
            setIsGenerating(false);
            return;
          }
        }
        throw new Error('Server returned an error. Please try again.');
      }

      const data: WorksheetData = await response.json();
      setGeneratedData(data);
      setEditedOutput(data);
      setView('output');

      // Auto save to history
      setSavedWorksheets(prev => {
        const exists = prev.some(item => item.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handles copying text to clipboard
  const handleCopyToClipboard = () => {
    if (!editedOutput) return;

    let text = `==================================================\n`;
    text += `${editedOutput.title || 'WORKSHEET'}\n`;
    text += `Subject: ${editedOutput.subject} | Grade: ${editedOutput.gradeLevel}\n`;
    text += `Topic: ${editedOutput.topic}\n`;
    text += `Total Marks: ${editedOutput.totalMarks} Marks\n`;
    text += `==================================================\n\n`;
    
    text += `INSTRUCTIONS:\n`;
    editedOutput.instructions?.forEach((inst, index) => {
      text += `${index + 1}. ${inst}\n`;
    });
    text += `\n--------------------------------------------------\n\n`;

    text += `QUESTIONS:\n\n`;
    editedOutput.questions?.forEach((q) => {
      text += `Question ${q.number} [${q.marks} Mark${q.marks > 1 ? 's' : ''}]:\n`;
      text += `${q.questionText}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt) => text += `   ${opt}\n`);
      }
      text += `\n`;
    });

    if (includeAnswerKey && editedOutput.answerKey && editedOutput.answerKey.length > 0) {
      text += `\n==================================================\n`;
      text += `ANSWER KEY & EXPLANATIONS\n`;
      text += `==================================================\n\n`;
      editedOutput.answerKey.forEach((ans) => {
        text += `Question ${ans.questionNumber} Answer:\n`;
        text += `Answer: ${ans.answer}\n`;
        if (ans.explanation) {
          text += `Explanation: ${ans.explanation}\n`;
        }
        text += `\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Triggers print of worksheet
  const handlePrint = () => {
    window.print();
  };

  // Re-opens a saved worksheet from history
  const handleOpenSaved = (worksheet: WorksheetData) => {
    setGeneratedData(worksheet);
    setEditedOutput(JSON.parse(JSON.stringify(worksheet))); // deep copy
    setView('output');
    setActiveOutputTab('worksheet');
  };

  // Deletes a worksheet from history
  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this worksheet?')) {
      setSavedWorksheets(prev => prev.filter(w => w.id !== id));
      if (generatedData?.id === id) {
        setGeneratedData(null);
        setEditedOutput(null);
        setView('form');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* View Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Worksheets Module</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Create beautiful, printable educational worksheets with automatic answer keys.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('form')}
            className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${
              view === 'form'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Create Worksheet
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 text-sm font-black rounded-lg transition-all flex items-center gap-2 ${
              view === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Saved Worksheets</span>
            <span className="bg-slate-200 text-slate-800 text-xs px-1.5 py-0.5 rounded-full font-black">
              {savedWorksheets.length}
            </span>
          </button>
        </div>
      </div>

      {/* FORM VIEW */}
      {view === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs print:hidden">
          {/* Header Title inside form */}
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Create Printable Worksheet</h2>
              <p className="text-slate-500 text-xs font-semibold">
                Generate AI-powered worksheets with automatic answer keys
              </p>
            </div>
          </div>

          {/* Unlimited Premium Access Banner */}
          {!user?.isAdmin && !user?.hasPremiumToolsSub && (user?.monthlyWorksheetsCount || 0) >= 5 && (
            <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border-2 border-dashed border-orange-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 fill-amber-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-950">Wamaze gukoresha imfashanyigisho 5 z'ubuntu kuri uku kwezi!</h4>
                  <p className="text-xs text-slate-600 font-bold mt-1">
                    Gura ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf/mo gusa kugira ngo ukore Worksheets zitemewe umubare (Unlimited)!
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

          <form onSubmit={handleGenerateWorksheet} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mathematics, Science, English"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                />
              </div>

              {/* Grade Level */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Grade Level *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grade 5, Primary 3, Year 7"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <label className="block text-slate-800 text-sm font-black">
                Topic *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Photosynthesis, Fractions, World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Worksheet Type */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Worksheet Type
                </label>
                <div className="relative">
                  <select
                    value={worksheetType}
                    onChange={(e) => setWorksheetType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                  >
                    <option value="short_answer">Short Answer (Brief written responses)</option>
                    <option value="multiple_choice">Multiple Choice (Plausible choices)</option>
                    <option value="true_false">True/False Statements</option>
                    <option value="fill_blank">Fill in the Blank Cloze</option>
                    <option value="matching">Matching Pairs (Terms and definitions)</option>
                    <option value="mixed">Mixed Styles (A balanced combination)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Difficulty (Optional)
                </label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                    <option value="mixed">mixed</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Questions */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                />
              </div>

              {/* Marks per Question */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Marks per Question
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {/* Total Questions Read-only */}
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-black uppercase tracking-wider block">
                  Total Questions
                </span>
                <input
                  type="text"
                  readOnly
                  value={totalQuestionsText}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-emerald-700 font-black text-sm select-none"
                />
              </div>

              {/* Total Marks Read-only */}
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-black uppercase tracking-wider block">
                  Total Marks
                </span>
                <input
                  type="text"
                  readOnly
                  value={totalMarksText}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-emerald-700 font-black text-sm select-none"
                />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="block text-slate-800 text-sm font-black">
                Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="English">English (English)</option>
                  <option value="Kinyarwanda">Kinyarwanda (Kinyarwanda)</option>
                  <option value="French">French (Français)</option>
                  <option value="Swahili">Swahili (Kiswahili)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Curriculum Optional */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Curriculum (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., CBC, IB, Cambridge"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                />
              </div>

              {/* Country Optional */}
              <div className="space-y-1.5">
                <label className="block text-slate-800 text-sm font-black">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kenya, Rwanda, Ghana"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            {/* Custom Instructions Optional */}
            <div className="space-y-1.5">
              <label className="block text-slate-800 text-sm font-black">
                Custom Instructions (Optional)
              </label>
              <textarea
                placeholder="Any specific instructions for the worksheet (e.g., 'Focus on vocabulary', 'Include diagrams')"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm resize-none"
              />
            </div>

            {/* Additional Details Optional */}
            <div className="space-y-1.5">
              <label className="block text-slate-800 text-sm font-black">
                Additional Details (Optional)
              </label>
              <textarea
                placeholder="Any additional context or requirements"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Web Search */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                  className="mt-1 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-slate-800 text-sm font-black block group-hover:text-emerald-700 transition-colors">
                    Web Search
                  </span>
                  <span className="text-slate-400 text-xs font-semibold block">
                    Use curriculum resources
                  </span>
                </div>
              </label>

              {/* Include Answer Key */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  className="mt-1 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-slate-800 text-sm font-black block group-hover:text-emerald-700 transition-colors">
                    Include Answer Key
                  </span>
                  <span className="text-slate-400 text-xs font-semibold block">
                    Generate answer key with explanations
                  </span>
                </div>
              </label>
            </div>

            {/* Generate Button */}
            <div className="pt-4 flex justify-center">
              {!user?.isAdmin && !user?.hasPremiumToolsSub && (user?.monthlyWorksheetsCount || 0) >= 5 ? (
                onOpenSubscription && (
                  <button
                    type="button"
                    onClick={onOpenSubscription}
                    className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all shrink-0 flex items-center justify-center gap-2.5 border border-orange-600 animate-pulse"
                  >
                    <Sparkles className="w-5 h-5 text-slate-950 fill-amber-200" />
                    <span>Get Unlimited Access (2,500 Rwf)</span>
                  </button>
                )
              ) : (
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-2.5"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Worksheet...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                      <span>Generate Worksheet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* SKELETON LOADER STATE */}
          {isGenerating && (
            <div className="mt-8 p-8 border border-emerald-100 rounded-2xl bg-emerald-50/20 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="text-slate-800 font-black text-lg animate-pulse">
                  {progressMessages[generationProgressStep]}
                </p>
                <p className="text-slate-400 text-xs font-semibold">
                  This takes roughly 15-30 seconds. Do not reload or close this page.
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-1000 rounded-full" 
                  style={{ width: `${((generationProgressStep + 1) / progressMessages.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* OUTPUT VIEW */}
      {view === 'output' && editedOutput && (
        <div className="space-y-6">
          {/* Action Toolbar for generated output */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 print:hidden">
            <button
              onClick={() => setView('form')}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Form</span>
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>

          {/* Worksheet and Answer Key Tabs */}
          <div className="flex border-b border-slate-200 gap-1.5 print:hidden">
            <button
              onClick={() => setActiveOutputTab('worksheet')}
              className={`px-5 py-2.5 text-sm font-black border-b-2 transition-all ${
                activeOutputTab === 'worksheet'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Printable Worksheet
            </button>
            {includeAnswerKey && editedOutput.answerKey && (
              <button
                onClick={() => setActiveOutputTab('answerKey')}
                className={`px-5 py-2.5 text-sm font-black border-b-2 transition-all ${
                  activeOutputTab === 'answerKey'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Answer Key
              </button>
            )}
          </div>

          {/* PRINTABLE CONTAINER */}
          <div 
            ref={printRef}
            className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 shadow-xs space-y-8 print:border-none print:p-0 print:shadow-none"
            id="worksheet-printable-area"
          >
            {/* Header / School Layout */}
            <div className="text-center space-y-2 border-b border-double border-slate-300 pb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {editedOutput.title || `${editedOutput.subject} Worksheet`}
              </h1>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-bold">
                <span>Subject: <strong className="text-slate-800">{editedOutput.subject}</strong></span>
                <span>•</span>
                <span>Grade Level: <strong className="text-slate-800">{editedOutput.gradeLevel}</strong></span>
                <span>•</span>
                {editedOutput.curriculum && (
                  <>
                    <span>Curriculum: <strong className="text-slate-800">{editedOutput.curriculum}</strong></span>
                    <span>•</span>
                  </>
                )}
                <span>Total Marks: <strong className="text-emerald-700">{editedOutput.totalMarks} Marks</strong></span>
              </div>
            </div>

            {/* Student metadata fields (Only shown in worksheet tab) */}
            {activeOutputTab === 'worksheet' && (
              <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50 text-xs text-slate-700 font-bold">
                <div className="space-y-4">
                  <div>Student Name: _____________________________________</div>
                  <div>Class / Grade: ____________________________________</div>
                </div>
                <div className="space-y-4">
                  <div>Date: ________________________</div>
                  <div>Score: ________ / {editedOutput.totalMarks}</div>
                </div>
              </div>
            )}

            {/* WORKSHEET QUESTIONS TAB */}
            {activeOutputTab === 'worksheet' && (
              <div className="space-y-6">
                {/* Instructions */}
                {editedOutput.instructions && editedOutput.instructions.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Instructions:</h3>
                    <ul className="list-decimal list-inside text-sm text-slate-600 font-medium space-y-1 pl-1">
                      {editedOutput.instructions.map((inst, index) => (
                        <li key={index}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Question List */}
                <div className="space-y-8 pt-4 border-t border-slate-100">
                  {editedOutput.questions?.map((q) => (
                    <div key={q.number} className="space-y-3.5 avoid-break">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-sm font-black text-slate-900 flex gap-2">
                          <span>Q{q.number}.</span>
                          <span className="font-bold leading-relaxed">{q.questionText}</span>
                        </h4>
                        <span className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-md shrink-0">
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Multiple choice options rendering */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-6">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="text-sm text-slate-700 font-medium border border-slate-200/60 hover:bg-slate-50 p-2.5 rounded-lg flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-black text-xs flex items-center justify-center">
                                {String.fromCharCode(65 + oIndex)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty space for answers if short answer or fill blank */}
                      {(worksheetType === 'short_answer' || worksheetType === 'fill_blank' || worksheetType === 'mixed') && !q.options && (
                        <div className="pt-2 pl-6 space-y-1.5">
                          <div className="border-b border-dashed border-slate-300 w-full h-5"></div>
                          {q.marks > 2 && <div className="border-b border-dashed border-slate-300 w-full h-5"></div>}
                          {q.marks > 4 && <div className="border-b border-dashed border-slate-300 w-full h-5"></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANSWER KEY TAB */}
            {activeOutputTab === 'answerKey' && editedOutput.answerKey && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-800">Answer Key & Teacher Explanations</h3>
                </div>

                <div className="space-y-6">
                  {editedOutput.answerKey.map((ans) => {
                    const matchedQuestion = editedOutput.questions?.find(q => q.number === ans.questionNumber);
                    return (
                      <div key={ans.questionNumber} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 avoid-break">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-sm font-black text-slate-900">
                            Question {ans.questionNumber}
                          </h4>
                          {matchedQuestion && (
                            <span className="text-xs font-semibold text-slate-500">
                              ({matchedQuestion.marks} Mark{matchedQuestion.marks > 1 ? 's' : ''})
                            </span>
                          )}
                        </div>

                        {matchedQuestion && (
                          <p className="text-xs text-slate-600 font-medium italic mb-2">
                            {matchedQuestion.questionText}
                          </p>
                        )}

                        <div className="text-sm text-slate-800 font-medium pl-2 border-l-2 border-emerald-500 bg-white p-3 rounded-r-lg shadow-2xs">
                          <strong className="text-emerald-700 block text-xs uppercase tracking-wider mb-0.5">Correct Answer:</strong>
                          <span>{ans.answer}</span>
                        </div>

                        {ans.explanation && (
                          <div className="text-xs text-slate-500 font-medium pt-1 pl-2">
                            <strong>Explanation:</strong> {ans.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAVED HISTORY VIEW */}
      {view === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Saved Worksheets Archive</h2>
            <span className="text-slate-500 text-xs font-semibold">{savedWorksheets.length} worksheets found</span>
          </div>

          {savedWorksheets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="text-slate-800 font-bold text-base">No worksheets saved yet</p>
                <p className="text-slate-500 text-xs font-semibold">
                  Generate worksheets first, and they will automatically appear here for easy print, download, or edit anytime!
                </p>
              </div>
              <button
                onClick={() => setView('form')}
                className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-xs"
              >
                Create First Worksheet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedWorksheets.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleOpenSaved(w)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400/80 cursor-pointer shadow-2xs transition-all relative group space-y-3"
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0">
                      {w.worksheetType?.replace('_', ' ')}
                    </span>

                    <button
                      onClick={(e) => handleDeleteSaved(w.id, e)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete worksheet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors text-sm line-clamp-2 leading-snug">
                      {w.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <span>{w.subject}</span>
                      <span>•</span>
                      <span>{w.gradeLevel}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="text-emerald-700 font-black">
                      {w.questionCount} Questions ({w.totalMarks} Marks)
                    </span>
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
