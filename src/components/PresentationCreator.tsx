import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  Clock,
  Layers,
  CheckCircle,
  HelpCircle,
  Play,
  Presentation,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Edit2,
  Check,
  RotateCcw,
  BookOpen,
  Trash2,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  UserProfile,
  LanguageOption
} from '../types';

interface PresentationCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSignIn?: () => void;
  onBackToDashboard?: () => void;
}

interface Slide {
  slideTitle: string;
  bullets: string[];
  illustrationPrompt: string;
  teacherNotes: string;
  timing?: string;
}

interface PresentationData {
  id: string;
  createdAt: string;
  subject: string;
  grade: string;
  topic: string;
  lessonDuration: string;
  language: string;
  country: string;
  curriculumStandard: string;
  additionalDetails: string;
  pasteNotes: string;
  includeTimings: boolean;
  simplifiedMode: boolean;
  theme: string;
  notesStyle: string;
  bulletStyle: string;
  title: string;
  subtitle: string;
  slides: Slide[];
}

const THEME_OPTIONS = [
  { id: 'Classic Chalk', name: 'Classic Chalk', bg: 'bg-slate-900', text: 'text-slate-100', accent: 'text-yellow-300', desc: 'Chalkboard style, warm classroom look' },
  { id: 'Dark Mode', name: 'Dark Mode', bg: 'bg-zinc-950', text: 'text-zinc-100', accent: 'text-cyan-400', desc: 'Sleek dark mode with neon accents' },
  { id: 'Midnight Learning', name: 'Midnight Learning', bg: 'bg-indigo-950', text: 'text-slate-100', accent: 'text-amber-400', desc: 'Deep cosmic indigo with golden sparks' },
  { id: 'Deep Knowledge', name: 'Deep Knowledge', bg: 'bg-violet-950', text: 'text-purple-100', accent: 'text-fuchsia-400', desc: 'Vibrant neon purple tech theme' },
  { id: 'Soft Sky', name: 'Soft Sky', bg: 'bg-gradient-to-br from-sky-50 to-indigo-50', text: 'text-slate-900', accent: 'text-sky-600', desc: 'Light gradient, friendly and calm' },
  { id: 'Growing Ideas', name: 'Growing Ideas', bg: 'bg-emerald-50', text: 'text-emerald-950', accent: 'text-emerald-700', desc: 'Organic green, soft and eco-focused' },
  { id: 'Gentle Nature', name: 'Gentle Nature', bg: 'bg-stone-50', text: 'text-stone-900', accent: 'text-amber-800', desc: 'Warm cream, olive-wood aesthetic' },
  { id: 'Playful Learning', name: 'Playful Learning', bg: 'bg-amber-50/50', text: 'text-slate-900', accent: 'text-purple-700', desc: 'High visual energy, rounded elements' },
  { id: 'Science Park', name: 'Science Park', bg: 'bg-slate-50', text: 'text-slate-900', accent: 'text-teal-600', desc: 'Crisp teal & gray modern research layout' },
  { id: 'Notebook Lines', name: 'Notebook Lines', bg: 'bg-amber-50/20', text: 'text-slate-900', accent: 'text-indigo-700', desc: 'Lined paper with pink margins' },
  { id: 'Creative Grid', name: 'Creative Grid', bg: 'bg-slate-50', text: 'text-slate-900', accent: 'text-violet-600', desc: 'Technical grid paper design' },
  { id: 'Soft Bloom', name: 'Soft Bloom', bg: 'bg-rose-50/70', text: 'text-rose-950', accent: 'text-rose-700', desc: 'Feminine, soft pastel floral tones' },
  { id: 'Teachy Clean', name: 'Teachy Clean', bg: 'bg-white', text: 'text-black', accent: 'text-indigo-600', desc: 'Thick black borders, Swiss high-contrast' }
];

export const PresentationCreator: React.FC<PresentationCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSignIn,
  onBackToDashboard
}) => {
  const [view, setView] = useState<'form' | 'slideshow' | 'history'>('form');

  // Load saved presentations from local storage
  const [savedPresentations, setSavedPresentations] = useState<PresentationData[]>(() => {
    try {
      const stored = localStorage.getItem('tegura_saved_presentations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tegura_saved_presentations', JSON.stringify(savedPresentations));
    } catch (err) {
      console.error(err);
    }
  }, [savedPresentations]);

  // Form states
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [lessonDuration, setLessonDuration] = useState('40 minutes');
  const [language, setLanguage] = useState<LanguageOption>(selectedLanguage || 'English');
  const [country, setCountry] = useState(() => localStorage.getItem('tegura_saved_country') || 'Rwanda');
  const [curriculumStandard, setCurriculumStandard] = useState(() => localStorage.getItem('tegura_saved_curriculum') || 'Rwanda REB Standards');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [pasteNotes, setPasteNotes] = useState('');
  
  // Settings
  const [searchCurriculum, setSearchCurriculum] = useState(true);
  const [generateImages, setGenerateImages] = useState(true);
  const [notesStyle, setNotesStyle] = useState('Detailed (100+ words per slide)');
  const [bulletStyle, setBulletStyle] = useState('Concise (5-10 words each)');
  const [slideCount, setSlideCount] = useState('Auto (based on duration)');
  const [includeTimings, setIncludeTimings] = useState(false);
  const [simplifiedMode, setSimplifiedMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('Classic Chalk');

  // Generation UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generationProgressStep, setGenerationProgressStep] = useState(0);

  const progressMessages = [
    "Analyzing lesson details & educational goals...",
    "Retrieving curriculum references & topic guides...",
    "Structuring presentation outlines & sequence...",
    "Creating concise, high-impact slide text & bullet points...",
    "Writing comprehensive, detailed teacher lecturing notes...",
    "Applying chosen theme styling and layout formats...",
    "Reviewing visual assets & finishing final touchups..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationProgressStep(0);
      interval = setInterval(() => {
        setGenerationProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Slideshow viewing states
  const [activePresentation, setActivePresentation] = useState<PresentationData | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Editing slide values
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBullets, setEditedBullets] = useState<string[]>([]);
  const [editedNotes, setEditedNotes] = useState('');

  // Update edit values when active slide changes
  useEffect(() => {
    if (activePresentation && activePresentation.slides[activeSlideIndex]) {
      const slide = activePresentation.slides[activeSlideIndex];
      setEditedTitle(slide.slideTitle);
      setEditedBullets([...slide.bullets]);
      setEditedNotes(slide.teacherNotes);
    }
  }, [activePresentation, activeSlideIndex]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !grade.trim() || !topic.trim()) {
      setErrorMsg('Subject, Grade, and Topic are required fields.');
      return;
    }

    if (!user) {
      if (onOpenSignIn) onOpenSignIn();
      return;
    }

    // Save persistables
    if (country) localStorage.setItem('tegura_saved_country', country);
    if (curriculumStandard) localStorage.setItem('tegura_saved_curriculum', curriculumStandard);

    setIsGenerating(true);
    setErrorMsg(null);

    const payload = {
      subject,
      grade,
      topic,
      lessonDuration,
      language,
      country,
      curriculumStandard,
      additionalDetails,
      pasteNotes,
      searchCurriculum,
      generateImages,
      notesStyle,
      bulletStyle,
      slideCount,
      includeTimings,
      simplifiedMode,
      theme: selectedTheme
    };

    try {
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate slides. Please check network and try again.');
      }

      const data: PresentationData = await response.json();
      setActivePresentation(data);
      setActiveSlideIndex(0);
      setView('slideshow');

      // Save to saved list
      setSavedPresentations((prev) => [data, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to generate presentation slides. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSlideEdits = () => {
    if (!activePresentation) return;
    
    const updatedSlides = [...activePresentation.slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      slideTitle: editedTitle,
      bullets: editedBullets.filter(b => b.trim() !== ''),
      teacherNotes: editedNotes
    };

    const updatedPres = {
      ...activePresentation,
      slides: updatedSlides
    };

    setActivePresentation(updatedPres);
    setSavedPresentations((prev) => prev.map(p => p.id === activePresentation.id ? updatedPres : p));
    setIsEditMode(false);
  };

  const handleDeletePresentation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this presentation?')) {
      setSavedPresentations(prev => prev.filter(p => p.id !== id));
      if (activePresentation?.id === id) {
        setActivePresentation(null);
        setView('form');
      }
    }
  };

  // Get current active theme details
  const getThemeClass = (themeId: string) => {
    const t = THEME_OPTIONS.find(o => o.id === themeId);
    return t || THEME_OPTIONS[0];
  };

  // Render a slide style based on the theme chosen
  const renderSlideContent = (slide: Slide, themeId: string) => {
    const theme = getThemeClass(themeId);

    if (themeId === 'Notebook Lines') {
      return (
        <div className="relative w-full h-full bg-amber-50/15 border-2 border-amber-200/60 rounded-xl overflow-hidden p-8 shadow-xs flex flex-col justify-between" style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '100% 2.2rem', lineHeight: '2.2rem' }}>
          {/* Vertical Pink Margin line */}
          <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-red-300 opacity-50"></div>
          
          <div className="pl-10 space-y-4">
            <h3 className="text-xl md:text-2xl font-bold text-indigo-900 border-b-2 border-indigo-100 pb-2 flex items-center justify-between">
              <span>{slide.slideTitle}</span>
              {slide.timing && <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-950">{slide.timing}</span>}
            </h3>
            <ul className="space-y-4 pt-2">
              {slide.bullets.map((b, i) => (
                <li key={i} className="text-sm md:text-base text-slate-800 font-medium list-disc ml-5 hover:text-slate-950 transition-colors">
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-10 text-right text-[11px] font-black text-slate-400">
            {activeSlideIndex + 1} / {activePresentation?.slides.length}
          </div>
        </div>
      );
    }

    if (themeId === 'Classic Chalk') {
      return (
        <div className="w-full h-full bg-slate-900 border-4 border-slate-700 rounded-xl p-8 shadow-inner flex flex-col justify-between text-slate-100" style={{ fontFamily: 'monospace' }}>
          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-black text-yellow-300 border-b border-dashed border-slate-600 pb-2 flex items-center justify-between">
              <span>{slide.slideTitle}</span>
              {slide.timing && <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-yellow-300 border border-yellow-300/40">{slide.timing}</span>}
            </h3>
            <ul className="space-y-4 pt-2 list-none">
              {slide.bullets.map((b, i) => (
                <li key={i} className="text-sm md:text-base text-slate-200 flex items-start gap-2.5">
                  <span className="text-yellow-400 select-none font-bold">✎</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right text-xs font-bold text-slate-400">
            PAGE {activeSlideIndex + 1}
          </div>
        </div>
      );
    }

    if (themeId === 'Teachy Clean') {
      return (
        <div className="w-full h-full bg-white border-4 border-black rounded-none p-8 flex flex-col justify-between text-black">
          <div className="space-y-6">
            <h3 className="text-xl md:text-3xl font-black text-black border-b-4 border-black pb-3 flex items-center justify-between tracking-tight">
              <span>{slide.slideTitle.toUpperCase()}</span>
              {slide.timing && <span className="text-xs font-black px-3 py-1 bg-black text-white">{slide.timing}</span>}
            </h3>
            <ul className="space-y-4 pt-2">
              {slide.bullets.map((b, i) => (
                <li key={i} className="text-sm md:text-base font-black flex items-start gap-3">
                  <span className="text-black select-none">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right text-sm font-black border-t-2 border-black pt-2">
            SLIDE {activeSlideIndex + 1}
          </div>
        </div>
      );
    }

    // Default or other themes
    return (
      <div className={`w-full h-full ${theme.bg} border border-slate-200/80 rounded-2xl p-8 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300`}>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`text-xl md:text-2xl font-black ${theme.text} flex-1`}>
              {slide.slideTitle}
            </h3>
            {slide.timing && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${theme.id.includes('Dark') || theme.id.includes('Midnight') || theme.id.includes('Deep') ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {slide.timing}
              </span>
            )}
          </div>
          <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
          <ul className="space-y-4 pt-2">
            {slide.bullets.map((b, i) => (
              <li key={i} className={`text-sm md:text-base font-medium flex items-start gap-3 ${theme.id.includes('Dark') || theme.id.includes('Midnight') || theme.id.includes('Deep') ? 'text-slate-200' : 'text-slate-700'}`}>
                <span className={`text-orange-500 text-lg leading-none select-none shrink-0`}>★</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`text-right text-xs font-black ${theme.id.includes('Dark') || theme.id.includes('Midnight') || theme.id.includes('Deep') ? 'text-slate-400' : 'text-slate-500'}`}>
          {activeSlideIndex + 1} / {activePresentation?.slides.length}
        </div>
      </div>
    );
  };

  // PDF Export using jsPDF
  const handleExportPdf = () => {
    if (!activePresentation) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const slides = activePresentation.slides;

    slides.forEach((slide, idx) => {
      if (idx > 0) {
        doc.addPage();
      }

      // Draw background color (A4 landscape is 297mm x 210mm)
      const themeId = activePresentation.theme;
      
      if (themeId === 'Classic Chalk') {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 297, 210, 'F');
        doc.setDrawColor(71, 85, 105); // slate-600
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 287, 200, 'D');

        // Text settings
        doc.setTextColor(253, 224, 71); // yellow-300
        doc.setFont('courier', 'bold');
        doc.setFontSize(22);
        doc.text(slide.slideTitle, 15, 25);

        doc.setFillColor(71, 85, 105);
        doc.rect(15, 30, 267, 1, 'F');

        doc.setTextColor(241, 245, 249); // slate-100
        doc.setFont('courier', 'normal');
        doc.setFontSize(14);

        let startY = 45;
        slide.bullets.forEach((bullet) => {
          const lines = doc.splitTextToSize(`* ${bullet}`, 250);
          lines.forEach((line: string) => {
            doc.text(line, 20, startY);
            startY += 10;
          });
          startY += 4;
        });

        // Slide counter
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(11);
        doc.text(`PAGE ${idx + 1} OF ${slides.length}`, 260, 200);

      } else if (themeId === 'Teachy Clean') {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 297, 210, 'F');
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(2);
        doc.rect(5, 5, 287, 200, 'D');

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text(slide.slideTitle.toUpperCase(), 15, 28);

        doc.setFillColor(0, 0, 0);
        doc.rect(15, 33, 267, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);

        let startY = 50;
        slide.bullets.forEach((bullet) => {
          const lines = doc.splitTextToSize(`-  ${bullet}`, 250);
          lines.forEach((line: string) => {
            doc.text(line, 20, startY);
            startY += 12;
          });
          startY += 4;
        });

        // Slide counter
        doc.setFontSize(12);
        doc.text(`SLIDE ${idx + 1} / ${slides.length}`, 245, 195);

      } else {
        // Light / Default Elegant Theme
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, 0, 297, 210, 'F');
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.rect(8, 8, 281, 194, 'D');

        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(slide.slideTitle, 20, 30);

        // Underline accent
        doc.setFillColor(249, 115, 22); // orange-500
        doc.rect(20, 35, 15, 2, 'F');

        doc.setTextColor(51, 65, 85); // slate-700
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);

        let startY = 55;
        slide.bullets.forEach((bullet) => {
          const lines = doc.splitTextToSize(`• ${bullet}`, 240);
          lines.forEach((line: string) => {
            doc.text(line, 25, startY);
            startY += 11;
          });
          startY += 4;
        });

        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFontSize(11);
        doc.text(`SLIDE ${idx + 1} OF ${slides.length}`, 250, 195);
      }
    });

    doc.save(`${activePresentation.topic.toLowerCase().replace(/\s+/g, '_')}_presentation.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* View: Form Creator */}
      {view === 'form' && (
        <div className="space-y-8">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            {savedPresentations.length > 0 && (
              <button
                onClick={() => setView('history')}
                className="px-4 py-2 border-2 border-orange-200 hover:bg-orange-50 text-orange-950 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <Presentation className="w-4 h-4" />
                <span>My Saved Presentations ({savedPresentations.length})</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header banner */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                  <Presentation className="w-5 h-5 text-slate-950" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-950">
                  Create Presentation Slides
                </h1>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Create beautiful presentation slides aligned with your topic, ready to present in class
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">!</div>
                <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {isGenerating ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-orange-600 animate-spin"></div>
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base font-black text-slate-950">Designing Your Slide Deck...</h3>
                  <p className="text-xs text-orange-600 font-bold animate-pulse">
                    {progressMessages[generationProgressStep]}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="p-6 md:p-8 space-y-8">
                {/* 1. Lesson Details Section */}
                <div className="space-y-4">
                  <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-orange-500 fill-orange-200" />
                    <span>Lesson Details</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., Biology, Mathematics, English"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Grade *
                      </label>
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="e.g., 5th grade, Senior 3"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">
                      Topic *
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Plant life cycle, Water's big journey, Introduction to Algebra"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Lesson Duration
                      </label>
                      <select
                        value={lessonDuration}
                        onChange={(e) => setLessonDuration(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950 bg-white"
                      >
                        <option value="20 minutes">20 minutes</option>
                        <option value="30 minutes">30 minutes</option>
                        <option value="40 minutes">40 minutes</option>
                        <option value="50 minutes">50 minutes</option>
                        <option value="60 minutes">60 minutes</option>
                        <option value="90 minutes">90 minutes</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950 bg-white"
                      >
                        <option value="English">English</option>
                        <option value="Kinyarwanda">Kinyarwanda</option>
                        <option value="French">French</option>
                        <option value="Swahili">Swahili</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., Rwanda, Kenya, Nigeria..."
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">
                      Curriculum Standard
                    </label>
                    <input
                      type="text"
                      value={curriculumStandard}
                      onChange={(e) => setCurriculumStandard(e.target.value)}
                      placeholder="e.g., Rwanda REB, Cambridge, WAEC, IB..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>
                </div>

                {/* 2. Optional details and seed notes */}
                <div className="space-y-4">
                  <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest pb-1 border-b border-slate-100">
                    Additional Details & Notes (Optional)
                  </h2>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={2}
                      placeholder="e.g., Introduce the concept and include questions for in-class discussion"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">
                      Paste Your Notes (Optional)
                    </label>
                    <textarea
                      value={pasteNotes}
                      onChange={(e) => setPasteNotes(e.target.value)}
                      rows={3}
                      placeholder="Have your own notes? Paste them here and we'll structure them into slides..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>
                </div>

                {/* 3. Settings & Styles */}
                <div className="space-y-4">
                  <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest pb-1 border-b border-slate-100">
                    Teacher Preferences & Style Settings
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Teacher Notes Style
                      </label>
                      <select
                        value={notesStyle}
                        onChange={(e) => setNotesStyle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950 bg-white"
                      >
                        <option value="Detailed (100+ words per slide)">Detailed (100+ words per slide)</option>
                        <option value="Quick (brief bullet points)">Quick (brief bullet points)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Bullet Point Style
                      </label>
                      <select
                        value={bulletStyle}
                        onChange={(e) => setBulletStyle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950 bg-white"
                      >
                        <option value="Concise (5-10 words each)">Concise (5-10 words each)</option>
                        <option value="Detailed explanations">Detailed explanations</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Number of Slides
                      </label>
                      <select
                        value={slideCount}
                        onChange={(e) => setSlideCount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950 bg-white"
                      >
                        <option value="Auto (based on duration)">Auto (based on duration)</option>
                        <option value="5">5 slides</option>
                        <option value="8">8 slides</option>
                        <option value="10">10 slides</option>
                        <option value="12">12 slides</option>
                        <option value="15">15 slides</option>
                      </select>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="includeTimings"
                        checked={includeTimings}
                        onChange={(e) => setIncludeTimings(e.target.checked)}
                        className="w-4.5 h-4.5 text-orange-600 border-2 border-slate-300 rounded-sm focus:ring-orange-500"
                      />
                      <label htmlFor="includeTimings" className="text-xs font-black text-slate-700 cursor-pointer">
                        Include slide timings
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="simplifiedMode"
                        checked={simplifiedMode}
                        onChange={(e) => setSimplifiedMode(e.target.checked)}
                        className="w-4.5 h-4.5 text-orange-600 border-2 border-slate-300 rounded-sm focus:ring-orange-500"
                      />
                      <label htmlFor="simplifiedMode" className="text-xs font-black text-slate-700 cursor-pointer">
                        Simplified mode (no jargon)
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. Themes Selection */}
                <div className="space-y-4">
                  <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest pb-1 border-b border-slate-100">
                    Choose Visual Theme
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${
                          selectedTheme === theme.id
                            ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-2 ring-orange-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        {selectedTheme === theme.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                        <h4 className="text-xs font-black text-slate-950 mb-1 flex items-center gap-1">
                          <span className={`w-2.5 h-2.5 rounded-sm ${theme.bg} border border-slate-300 inline-block`}></span>
                          <span>{theme.name}</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                          {theme.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onBackToDashboard}
                    className="px-6 py-2.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-black transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-orange-600"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950 fill-amber-200" />
                    <span>Generate Presentation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* View: Slideshow Presenter */}
      {view === 'slideshow' && activePresentation && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
            <button
              onClick={() => {
                setView('form');
                setIsEditMode(false);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Editor</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer border ${
                  isEditMode
                    ? 'bg-orange-500 text-slate-950 border-orange-600'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditMode ? 'Finish Editing' : 'Edit Slides'}</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center Column: Slideshow stage (takes 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-2xl group border border-slate-800">
                {activePresentation.slides[activeSlideIndex] && (
                  <div className="absolute inset-0 p-1 select-none">
                    {renderSlideContent(activePresentation.slides[activeSlideIndex], activePresentation.theme)}
                  </div>
                )}

                {/* Left/Right floating remote arrows */}
                <button
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex(p => Math.max(0, p - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  disabled={activeSlideIndex === activePresentation.slides.length - 1}
                  onClick={() => setActiveSlideIndex(p => Math.min(activePresentation.slides.length - 1, p + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Carousel / Nav bar */}
              <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  <button
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex(0)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                    title="First Slide"
                  >
                    ⏮
                  </button>
                  <button
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex(p => Math.max(0, p - 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                    title="Prev Slide"
                  >
                    ◀
                  </button>
                  <span className="text-xs font-black text-slate-700 px-3">
                    Slide {activeSlideIndex + 1} of {activePresentation.slides.length}
                  </span>
                  <button
                    disabled={activeSlideIndex === activePresentation.slides.length - 1}
                    onClick={() => setActiveSlideIndex(p => Math.min(activePresentation.slides.length - 1, p + 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                    title="Next Slide"
                  >
                    ▶
                  </button>
                  <button
                    disabled={activeSlideIndex === activePresentation.slides.length - 1}
                    onClick={() => setActiveSlideIndex(activePresentation.slides.length - 1)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                    title="Last Slide"
                  >
                    ⏭
                  </button>
                </div>

                {/* Dot markers */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs md:max-w-md py-1">
                  {activePresentation.slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all cursor-pointer ${
                        activeSlideIndex === idx
                          ? 'bg-orange-500 scale-125'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Presenter Script / Editor (takes 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {isEditMode ? (
                <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4 text-orange-500" />
                      <span>Edit Active Slide</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-600 block">Slide Title</label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-xs font-bold text-slate-950"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-600 block">Bullet Points (One per line)</label>
                      <textarea
                        value={editedBullets.join('\n')}
                        onChange={(e) => setEditedBullets(e.target.value.split('\n'))}
                        rows={4}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-xs font-bold text-slate-950 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-600 block">Teacher Presenting Script</label>
                      <textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-xs font-medium text-slate-950 leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-3.5 py-2 text-xs font-black border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveSlideEdits}
                      className="px-4 py-2 text-xs font-black bg-orange-500 hover:bg-orange-600 border border-orange-600 text-slate-950 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Slide</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-orange-500" />
                      <span>Teacher Presenting Script</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">
                        Speaking Prompts / Guiding Script
                      </span>
                      <p className="text-xs text-slate-800 mt-1.5 font-medium leading-relaxed whitespace-pre-line">
                        {activePresentation.slides[activeSlideIndex]?.teacherNotes || 'No notes provided.'}
                      </p>
                    </div>

                    {activePresentation.slides[activeSlideIndex]?.illustrationPrompt && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                          Recommended Slide Visual / Prop
                        </span>
                        <p className="text-xs text-slate-600 mt-1.5 font-bold leading-relaxed">
                          {activePresentation.slides[activeSlideIndex]?.illustrationPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View: Presentations History List */}
      {view === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('form')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Creator</span>
            </button>
            <h1 className="text-lg font-black text-slate-950">My Saved Presentation Slides</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPresentations.map((pres) => (
              <div
                key={pres.id}
                onClick={() => {
                  setActivePresentation(pres);
                  setActiveSlideIndex(0);
                  setView('slideshow');
                }}
                className="bg-white border-2 border-slate-200 hover:border-orange-500 hover:shadow-lg rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-200">
                      {pres.theme}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(pres.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-950 mt-2 line-clamp-1">
                    {pres.topic}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {pres.subject} — {pres.grade}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 font-medium">
                    {pres.slides[0]?.bullets.join(', ') || 'Slideshow deck.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-bold">
                    {pres.slides.length} slides
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeletePresentation(pres.id, e)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete presentation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 text-xs font-black text-orange-950">
                      <span>View</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
