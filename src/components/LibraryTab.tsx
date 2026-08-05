import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Library,
  Calendar,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Clock,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Printer,
  Download,
  Copy,
  Save,
  FileDown,
  Search,
  Briefcase,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, LanguageOption } from '../types';

interface SOWWeek {
  weekNumber: number;
  topicOrModule: string;
  subTopicOrLO: string;
  keyCompetencyOrLOCompetence: string;
  teacherActivities: string;
  learnerActivities: string;
  resources: string;
  assessment: string;
}

interface SOWData {
  id: string;
  createdAt: string;
  title: string;
  subtitle: string;
  metadata: {
    curriculum: string;
    level: string;
    subject: string;
    term: string;
    language: string;
  };
  weeks: SOWWeek[];
}

interface LibraryTabProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSignIn?: () => void;
  onOpenSubscription?: () => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  user,
  selectedLanguage,
  onOpenSignIn,
  onOpenSubscription
}) => {
  const [activeTool, setActiveTool] = useState<'home' | 'reb' | 'rtb'>('home');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgressStep, setGenerationProgressStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Saved Schemes history list
  const [savedSchemes, setSavedSchemes] = useState<SOWData[]>([]);
  const [selectedSavedSchemeId, setSelectedSavedSchemeId] = useState<string | null>(null);
  const [activeScheme, setActiveScheme] = useState<SOWData | null>(null);

  // Cell editing states
  const [editingCell, setEditingCell] = useState<{ weekIdx: number; field: keyof SOWWeek } | null>(null);
  const [editValue, setEditValue] = useState('');

  // SOW Builder form states
  const [rebGrade, setRebGrade] = useState('Senior 1');
  const [rebSubject, setRebSubject] = useState('Mathematics');
  const [rebTerm, setRebTerm] = useState('Term 1');
  const [rebWeeks, setRebWeeks] = useState('10');
  const [rebNotes, setRebNotes] = useState('');

  const [rtbLevel, setRtbLevel] = useState('Level 3');
  const [rtbTrade, setRtbTrade] = useState('Software Development');
  const [rtbModuleTitle, setRtbModuleTitle] = useState('');
  const [rtbTerm, setRtbTerm] = useState('Term 1');
  const [rtbWeeks, setRtbWeeks] = useState('10');
  const [rtbNotes, setRtbNotes] = useState('');

  const progressMessages = [
    "Analyzing curriculum standards & syllabus guidelines for Rwanda...",
    "Structuring terms, learning modules and specific benchmarks...",
    "Fleshing out hands-on pedagogical activities & trainers instructions...",
    "Embedding instructional resources, textbooks, and workshop tools...",
    "Mapping formative and summative competency assessment strategies...",
    "Compiling and generating a comprehensive, print-ready Scheme of Work..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationProgressStep(0);
      interval = setInterval(() => {
        setGenerationProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Load saved schemes from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tegura_saved_sow');
      if (saved) {
        setSavedSchemes(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading saved SOW:", e);
    }
  }, []);

  const saveToLocalStorage = (schemes: SOWData[]) => {
    try {
      localStorage.setItem('tegura_saved_sow', JSON.stringify(schemes));
      setSavedSchemes(schemes);
    } catch (e) {
      console.error("Error saving SOW:", e);
    }
  };

  const handleGenerate = async (type: 'reb' | 'rtb') => {
    if (!user) {
      if (onOpenSignIn) onOpenSignIn();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setActiveScheme(null);

    const payload = {
      type,
      level: type === 'reb' ? rebGrade : rtbLevel,
      tradeOrSubject: type === 'reb' ? rebSubject : rtbTrade,
      moduleTitle: type === 'rtb' ? rtbModuleTitle : undefined,
      term: type === 'reb' ? rebTerm : rtbTerm,
      numberOfWeeks: type === 'reb' ? rebWeeks : rtbWeeks,
      language: selectedLanguage,
      additionalInfo: type === 'reb' ? rebNotes : rtbNotes,
      userEmail: user?.email,
      sessionToken: user?.sessionToken
    };

    try {
      const response = await fetch('/api/generate-scheme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errData = await response.json().catch(() => ({}));
          if (errData.code === 'PREMIUM_LIMIT_EXCEEDED') {
            setErrorMsg(errData.error || "Ntabwo wemerewe gukora Schemes of Work zirenga 5 ku kwezi z'ubuntu. Koresha izo wakoze cyangwa ugure ifatabuguzi (Premium Tools Sub) rya 2,500 Rwf muri Subscription page!");
            setIsGenerating(false);
            return;
          }
        }
        throw new Error('Failed to communicate with Scheme generator api.');
      }

      const data = await response.json();
      setActiveScheme(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Something went wrong while generating the scheme of work.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveScheme = () => {
    if (!activeScheme) return;
    const exists = savedSchemes.some((s) => s.id === activeScheme.id);
    let updated: SOWData[];
    if (exists) {
      updated = savedSchemes.map((s) => s.id === activeScheme.id ? activeScheme : s);
    } else {
      updated = [activeScheme, ...savedSchemes];
    }
    saveToLocalStorage(updated);
    alert(selectedLanguage === 'Kinyarwanda' ? 'Amateganyanyigisho yabitswe neza!' : 'Scheme of Work saved successfully!');
  };

  const handleDeleteScheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(selectedLanguage === 'Kinyarwanda' ? 'Urasezerana ko ushaka gusiba aya mateganyanyigisho?' : 'Are you sure you want to delete this Scheme of Work?')) {
      const updated = savedSchemes.filter((s) => s.id !== id);
      saveToLocalStorage(updated);
      if (activeScheme?.id === id) {
        setActiveScheme(null);
      }
    }
  };

  const handleCellEdit = (weekIdx: number, field: keyof SOWWeek, value: string) => {
    if (!activeScheme) return;
    const updatedWeeks = [...activeScheme.weeks];
    updatedWeeks[weekIdx] = {
      ...updatedWeeks[weekIdx],
      [field]: value
    };
    setActiveScheme({
      ...activeScheme,
      weeks: updatedWeeks
    });
  };

  const copyToClipboard = () => {
    if (!activeScheme) return;
    // Format as Tab-separated values for direct pasting to Excel/Sheets
    const headers = [
      "Week",
      activeScheme.metadata.curriculum === 'REB CBC' ? "Topic / Unit" : "Module",
      activeScheme.metadata.curriculum === 'REB CBC' ? "Sub-topic / Lesson" : "Learning Outcome (LO)",
      "Competency / Objective",
      "Teacher Activities",
      "Learner/Trainee Activities",
      "Instructional Resources",
      "Assessment Method"
    ];

    const rows = activeScheme.weeks.map((w) => [
      `Week ${w.weekNumber}`,
      w.topicOrModule,
      w.subTopicOrLO,
      w.keyCompetencyOrLOCompetence,
      w.teacherActivities,
      w.learnerActivities,
      w.resources,
      w.assessment
    ]);

    const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(content);
    alert(selectedLanguage === 'Kinyarwanda' ? 'Byakopijwe muri clipboard! Urashobora kubishyira muri Excel cyangwa Word.' : 'Copied to clipboard in tabular format! You can paste directly into Excel, Google Sheets, or Microsoft Word.');
  };

  const downloadWordDoc = () => {
    if (!activeScheme) return;
    const filename = `${activeScheme.metadata.subject.replace(/[^a-zA-Z0-9]/g, '_')}_Scheme_Of_Work.doc`;
    
    // Create simple HTML template for MS Word download
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Scheme of Work</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 11pt; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header-title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 5px; }
          .header-subtitle { font-size: 12pt; text-align: center; color: #444; margin-bottom: 20px; }
          .meta-info { font-size: 11pt; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="header-title">${activeScheme.title}</div>
        <div class="header-subtitle">${activeScheme.subtitle}</div>
        
        <div class="meta-info">
          <strong>Curriculum:</strong> ${activeScheme.metadata.curriculum}<br/>
          <strong>Level:</strong> ${activeScheme.metadata.level}<br/>
          <strong>Subject/Trade:</strong> ${activeScheme.metadata.subject}<br/>
          <strong>Term:</strong> ${activeScheme.metadata.term}<br/>
          <strong>Language:</strong> ${activeScheme.metadata.language}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%">Week</th>
              <th style="width: 15%">${activeScheme.metadata.curriculum === 'REB CBC' ? "Topic / Unit" : "Module"}</th>
              <th style="width: 15%">${activeScheme.metadata.curriculum === 'REB CBC' ? "Sub-Topic" : "Learning Outcome"}</th>
              <th style="width: 15%">Competency / Objective</th>
              <th style="width: 15%">Teacher Activities</th>
              <th style="width: 15%">Learner Activities</th>
              <th style="width: 10%">Resources</th>
              <th style="width: 10%">Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${activeScheme.weeks.map(w => `
              <tr>
                <td><strong>Week ${w.weekNumber}</strong></td>
                <td>${w.topicOrModule}</td>
                <td>${w.subTopicOrLO}</td>
                <td>${w.keyCompetencyOrLOCompetence}</td>
                <td>${w.teacherActivities}</td>
                <td>${w.learnerActivities}</td>
                <td>${w.resources}</td>
                <td>${w.assessment}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getLabel = (en: string, rw: string) => {
    return selectedLanguage === 'Kinyarwanda' ? rw : en;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" id="library-tab-container">
      {/* Printable Area overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #library-tab-container {
            padding: 0;
          }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Library className="w-8 h-8 text-blue-600" />
            <span>{getLabel("Curriculum Library", "Isomero ry'Integanyanyigisho")}</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            {getLabel("Generate and browse professional, complete term-long schemes of work for Rwandan schools.", "Tegura kandi ubone amateganyanyigisho yuzuye y'igihembwe cyose ku bigo by'amashuri mu Rwanda.")}
          </p>
        </div>

        {activeTool !== 'home' && (
          <button
            onClick={() => {
              setActiveTool('home');
              setActiveScheme(null);
            }}
            className="px-4 py-2 text-sm font-black text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{getLabel("Back to Library Portal", "Subira mu Isomero")}</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: PORTAL HOME SCREEN */}
        {activeTool === 'home' && (
          <motion.div
            key="home-portal"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* HERO CARD MATCHING SCREENSHOT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xs">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-3xl font-black shrink-0 border border-slate-200">
                RW
              </div>
              <div className="space-y-2 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                  <Library className="w-3.5 h-3.5" />
                  <span>LIBRARY</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {getLabel("Open your library tools", "Fungura ibikoresho by'isomero")}
                </h2>
                <p className="text-slate-600 text-sm font-medium">
                  {getLabel("Curriculum materials and planning resources for Rwanda.", "Ibikoresho by'integanyanyigisho n'amateganyanyigisho bigenewe u Rwanda.")}
                </p>
              </div>
            </div>

            {/* TWO MAIN OPTIONS MATCHING SCREENSHOT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: RTB/TVET Scheme of Work */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 block">RW LIBRARY</span>
                    <h3 className="text-xl font-black text-slate-900">
                      {getLabel("RTB/TVET Scheme of Work", "Amateganyanyigisho ya RTB / TVET")}
                    </h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      {getLabel("Browse RTB/TVET modules, competencies and term schemes for Rwanda.", "Shaka kandi utegure amamojire ya RTB/TVET, ubushobozi, n'amateganyanyigisho y'igihembwe.")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTool('rtb')}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-blue-600 hover:text-blue-800 transition-colors pt-2 self-start"
                >
                  <span>{getLabel("Open resource", "Fungura igikoresho")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: REB Scheme of Work */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Calendar className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 block">RW LIBRARY</span>
                    <h3 className="text-xl font-black text-slate-900">
                      {getLabel("REB Scheme of Work", "Amateganyanyigisho ya REB (CBC)")}
                    </h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      {getLabel("Build and browse complete term-long schemes of work.", "Tegura kandi ubone amateganyanyigisho arambuye y'igihembwe cyose.")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTool('reb')}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-blue-600 hover:text-blue-800 transition-colors pt-2 self-start"
                >
                  <span>{getLabel("Open resource", "Fungura igikoresho")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SAVED SCHEMES SECTION */}
            {savedSchemes.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                  <Library className="w-5 h-5 text-blue-600" />
                  <span>{getLabel("Your Saved Schemes of Work", "Amateganyanyigisho Wabitse")}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      onClick={() => {
                        setActiveScheme(scheme);
                        setActiveTool(scheme.metadata.curriculum === 'REB CBC' ? 'reb' : 'rtb');
                      }}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-black bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            {scheme.metadata.curriculum}
                          </span>
                          <button
                            onClick={(e) => handleDeleteScheme(scheme.id, e)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                          {scheme.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {scheme.metadata.level} • {scheme.metadata.term}
                        </p>
                      </div>
                      <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 pt-2 border-t border-slate-100">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(scheme.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: FORM BUILDER VIEW */}
        {activeTool !== 'home' && !isGenerating && !activeScheme && (
          <motion.div
            key="tool-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                {activeTool === 'reb' ? <Calendar className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {activeTool === 'reb' 
                    ? getLabel("REB Scheme of Work Builder", "Tegura amateganyanyigisho ya REB (CBC)") 
                    : getLabel("RTB/TVET Scheme of Work Builder", "Tegura amateganyanyigisho ya RTB / TVET")
                  }
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {getLabel("Provide class details to generate term-long plans with AI.", "Tanga ibisobanuro by'ishuri kugira ngo umusemburo wa AI ugutegurire amateganyanyigisho.")}
                </p>
              </div>
            </div>

            {/* FORM BODY */}
            {activeTool === 'reb' ? (
              // REB FORM FIELDS
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Class / Grade Level", "Umwaka w'ishuri")}</label>
                    <select
                      value={rebGrade}
                      onChange={(e) => setRebGrade(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    >
                      <option value="Primary 1">Primary 1</option>
                      <option value="Primary 2">Primary 2</option>
                      <option value="Primary 3">Primary 3</option>
                      <option value="Primary 4">Primary 4</option>
                      <option value="Primary 5">Primary 5</option>
                      <option value="Primary 6">Primary 6</option>
                      <option value="Senior 1">Senior 1</option>
                      <option value="Senior 2">Senior 2</option>
                      <option value="Senior 3">Senior 3</option>
                      <option value="Senior 4">Senior 4 (General Education)</option>
                      <option value="Senior 5">Senior 5 (General Education)</option>
                      <option value="Senior 6">Senior 6 (General Education)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Subject Name", "Isomo")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics, English, Biology"
                      value={rebSubject}
                      onChange={(e) => setRebSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Term", "Igihembwe")}</label>
                    <select
                      value={rebTerm}
                      onChange={(e) => setRebTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    >
                      <option value="Term 1">Term 1 (Igihembwe cya 1)</option>
                      <option value="Term 2">Term 2 (Igihembwe cya 2)</option>
                      <option value="Term 3">Term 3 (Igihembwe cya 3)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Total Academic Weeks", "Umubare w'Ibyumweru")}</label>
                    <select
                      value={rebWeeks}
                      onChange={(e) => setRebWeeks(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    >
                      <option value="8">8 Weeks</option>
                      <option value="9">9 Weeks</option>
                      <option value="10">10 Weeks</option>
                      <option value="11">11 Weeks</option>
                      <option value="12">12 Weeks</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Additional Guidelines / Reference Material (Optional)", "Andi mabwiriza / Ibitabo by'icyifuzo (Ku bushake)")}</label>
                  <textarea
                    rows={3}
                    placeholder={getLabel("Provide textbook name, unit focus, chapter pages, or specific notes you want AI to include...", "Tanga izina ry'igitabo, umutwe ushaka kwibandaho cyangwa andi mabwiriza wifuza ko AI yakoresha...")}
                    value={rebNotes}
                    onChange={(e) => setRebNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium resize-none"
                  />
                </div>

                <button
                  onClick={() => handleGenerate('reb')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-blue-200 fill-blue-300 animate-pulse" />
                  <span>{getLabel("Generate REB Scheme of Work (AI)", "Kora Amateganyanyigisho ya REB (AI)")}</span>
                </button>
              </div>
            ) : (
              // RTB / TVET FORM FIELDS
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("TVET Level", "Icyiciro cya TVET")}</label>
                    <select
                      value={rtbLevel}
                      onChange={(e) => setRtbLevel(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    >
                      <option value="Level 3">TVET Level 3 (RTB)</option>
                      <option value="Level 4">TVET Level 4 (RTB)</option>
                      <option value="Level 5">TVET Level 5 (RTB)</option>
                      <option value="Diploma">TVET Advanced Diploma / Level 6</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Trade / Department", "Umutwe w'imyuga (Trade)")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Development, Culinary Arts, Masonry"
                      value={rtbTrade}
                      onChange={(e) => setRtbTrade(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Module Code & Title (Optional)", "Izina n'Inyito ya Mojire (Module)")}</label>
                    <input
                      type="text"
                      placeholder="e.g. SODW301: Web Development Basics"
                      value={rtbModuleTitle}
                      onChange={(e) => setRtbModuleTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Term", "Igihembwe")}</label>
                    <select
                      value={rtbTerm}
                      onChange={(e) => setRtbTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    >
                      <option value="Term 1">Term 1 (Igihembwe cya 1)</option>
                      <option value="Term 2">Term 2 (Igihembwe cya 2)</option>
                      <option value="Term 3">Term 3 (Igihembwe cya 3)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Total Academic Weeks", "Umubare w'Ibyumweru")}</label>
                    <select
                      value={rtbWeeks}
                      onChange={(e) => setRtbWeeks(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    >
                      <option value="8">8 Weeks</option>
                      <option value="9">9 Weeks</option>
                      <option value="10">10 Weeks</option>
                      <option value="11">11 Weeks</option>
                      <option value="12">12 Weeks</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Reference Standards / Core Competencies (Optional)", "Ubundi bushobozi bunoze (Ku bushake)")}</label>
                    <input
                      type="text"
                      placeholder="e.g. RTB SOD Curriculum Version 2024"
                      value={rtbNotes}
                      onChange={(e) => setRtbNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleGenerate('rtb')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-blue-200 fill-blue-300 animate-pulse" />
                  <span>{getLabel("Generate RTB Scheme of Work (AI)", "Kora Amateganyanyigisho ya RTB (AI)")}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 3: LOADING SCREEN */}
        {isGenerating && (
          <motion.div
            key="tool-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-xl mx-auto text-center space-y-6"
          >
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <Sparkles className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {getLabel("Creating Your Scheme of Work...", "AI iri gukora amateganyanyigisho...")}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {getLabel("This takes roughly 15-20 seconds. Please wait.", "Ibi bitwara amasegonda 15-20. Tegereza gato.")}
              </p>
            </div>

            {/* PROGRESS STEP */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-blue-700 uppercase tracking-wider">
                <span>PROGRESS STEP</span>
                <span>{generationProgressStep + 1} / {progressMessages.length}</span>
              </div>
              <p className="text-xs text-slate-700 font-bold">
                {progressMessages[generationProgressStep]}
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((generationProgressStep + 1) / progressMessages.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: INTERACTIVE SOW WORKSPACE */}
        {activeScheme && !isGenerating && (
          <motion.div
            key="tool-workspace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* WORKSPACE OPERATIONS HEADER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                  <Library className="w-3.5 h-3.5" />
                  <span>{activeScheme.metadata.curriculum} ACTIVE SCHEME</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{activeScheme.title}</h2>
                <p className="text-xs text-slate-500 font-bold">
                  {activeScheme.subtitle} • Double-click cells to customize content
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
                  title="Copy SOW for pasting to Excel or Google Sheets"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>{getLabel("Copy for Excel", "Koporera Excel")}</span>
                </button>

                <button
                  onClick={downloadWordDoc}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
                  title="Download as Word Document"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>{getLabel("Word Doc", "Gukuramo (.doc)")}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
                  title="Print scheme of work or save as PDF"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>{getLabel("Print / Save PDF", "Gukuba / Kuri PDF")}</span>
                </button>

                <button
                  onClick={handleSaveScheme}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                  title="Save Scheme of Work locally"
                >
                  <Save className="w-4 h-4 text-blue-200 fill-blue-300" />
                  <span>{getLabel("Save locally", "Bika mu Isomero")}</span>
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE IF ANY */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold print:hidden">
                {errorMsg}
              </div>
            )}

            {/* SOW GRID CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden" id="print-section">
              {/* PRINT ONLY EXTRA META HEADER */}
              <div className="hidden print:block p-6 border-b border-slate-300 text-center space-y-1">
                <h1 className="text-2xl font-black text-slate-900 uppercase">{activeScheme.title}</h1>
                <p className="text-sm text-slate-700 font-bold">{activeScheme.subtitle}</p>
                <div className="grid grid-cols-5 gap-2 text-[10px] text-slate-600 font-medium pt-3 text-left">
                  <div><strong>Curriculum:</strong> {activeScheme.metadata.curriculum}</div>
                  <div><strong>Level:</strong> {activeScheme.metadata.level}</div>
                  <div><strong>Subject/Trade:</strong> {activeScheme.metadata.subject}</div>
                  <div><strong>Term:</strong> {activeScheme.metadata.term}</div>
                  <div><strong>Language:</strong> {activeScheme.metadata.language}</div>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="w-16 p-3 text-xs font-black text-slate-700 uppercase tracking-wider text-center">{getLabel("Week", "Icyumw.")}</th>
                      <th className="w-64 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">
                        {activeScheme.metadata.curriculum === 'REB CBC' ? getLabel("Main Topic / Unit", "Umutwe") : getLabel("Module Title", "Mojire")}
                      </th>
                      <th className="w-64 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">
                        {activeScheme.metadata.curriculum === 'REB CBC' ? getLabel("Sub-Topic / Lesson", "Ingingo") : getLabel("Learning Outcome (LO)", "LO")}
                      </th>
                      <th className="w-64 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Competency / Key Objective", "Ubushobozi / Intego")}</th>
                      <th className="w-72 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Teacher / Trainer Activities", "Ibikorwa by'Umwarimu")}</th>
                      <th className="w-72 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Learner / Trainee Activities", "Ibikorwa by'Umunyeshuri")}</th>
                      <th className="w-52 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Resources / Materials", "Ibikoresho")}</th>
                      <th className="w-52 p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{getLabel("Assessment Methods", "Isuzuma")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {activeScheme.weeks.map((week, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        {/* Week Column */}
                        <td className="p-3 text-center align-top">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-800 text-sm font-black border border-slate-200">
                            W{week.weekNumber}
                          </span>
                        </td>

                        {/* Editable Topic / Module */}
                        <td className="p-3 text-xs align-top font-bold text-slate-900 group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'topicOrModule' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'topicOrModule', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={3}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'topicOrModule' });
                                setEditValue(week.topicOrModule);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.topicOrModule}
                            </div>
                          )}
                        </td>

                        {/* Editable SubTopic / LO */}
                        <td className="p-3 text-xs align-top text-slate-700 font-medium group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'subTopicOrLO' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'subTopicOrLO', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={3}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'subTopicOrLO' });
                                setEditValue(week.subTopicOrLO);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.subTopicOrLO}
                            </div>
                          )}
                        </td>

                        {/* Editable Competency / LOCompetence */}
                        <td className="p-3 text-xs align-top text-slate-700 leading-relaxed font-medium group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'keyCompetencyOrLOCompetence' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'keyCompetencyOrLOCompetence', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={4}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'keyCompetencyOrLOCompetence' });
                                setEditValue(week.keyCompetencyOrLOCompetence);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.keyCompetencyOrLOCompetence}
                            </div>
                          )}
                        </td>

                        {/* Editable Teacher Activities */}
                        <td className="p-3 text-xs align-top text-slate-700 leading-relaxed font-medium group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'teacherActivities' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'teacherActivities', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={5}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'teacherActivities' });
                                setEditValue(week.teacherActivities);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.teacherActivities}
                            </div>
                          )}
                        </td>

                        {/* Editable Learner Activities */}
                        <td className="p-3 text-xs align-top text-slate-700 leading-relaxed font-medium group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'learnerActivities' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'learnerActivities', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={5}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'learnerActivities' });
                                setEditValue(week.learnerActivities);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.learnerActivities}
                            </div>
                          )}
                        </td>

                        {/* Editable Resources */}
                        <td className="p-3 text-xs align-top text-slate-700 leading-relaxed font-medium group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'resources' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'resources', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={4}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'resources' });
                                setEditValue(week.resources);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.resources}
                            </div>
                          )}
                        </td>

                        {/* Editable Assessment */}
                        <td className="p-3 text-xs align-top text-slate-700 leading-relaxed font-medium group relative">
                          {editingCell?.weekIdx === idx && editingCell?.field === 'assessment' ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                handleCellEdit(idx, 'assessment', editValue);
                                setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full p-2 border border-blue-500 rounded-md focus:ring-1 focus:ring-blue-400 bg-white"
                              rows={4}
                            />
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setEditingCell({ weekIdx: idx, field: 'assessment' });
                                setEditValue(week.assessment);
                              }}
                              className="cursor-pointer min-h-12 hover:bg-blue-50/30 p-1 rounded transition-all"
                              title="Double click to edit cell"
                            >
                              {week.assessment}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
