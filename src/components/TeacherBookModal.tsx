import React, { useState, useRef } from 'react';
import { 
  Download, 
  X, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  Sparkles,
  Search,
  BookOpen,
  ChevronRight
} from 'lucide-react';

import nkoreraLogo from '../assets/images/nkorera_logo_exact_1786655596298_1786656072173.jpg';
import { sanitizeClonedDocForPdf } from '../utils/pdfSanitizer';

interface TeacherBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCertificateCreator?: () => void;
}

export const TeacherBookModal: React.FC<TeacherBookModalProps> = ({ isOpen, onClose, onOpenCertificateCreator }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Refs for smooth jumping to pages
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  if (!isOpen) return null;

  const handleCopyPrompt = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const jumpToPage = (pageNum: number) => {
    const el = pageRefs.current[pageNum];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('teacher-book-scroll-container');
    if (!element) {
      setIsDownloading(false);
      return;
    }

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       [10, 10, 10, 10] as [number, number, number, number],
        filename:     'Teacher_Quickly_Tool_12_Pages_Handbook.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          windowWidth: 800,
          onclone: (clonedDoc: Document) => sanitizeClonedDocForPdf(clonedDoc)
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper for highlighting search queries
  const highlight = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase()
            ? <mark key={i} className="bg-amber-300 text-slate-950 px-0.5 rounded font-bold">{part}</mark>
            : part
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-4 overflow-hidden">
      <div className="bg-slate-900 w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col text-slate-100">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/30 shadow-md relative shrink-0">
              <img 
                src={nkoreraLogo} 
                alt="Nkorera Education Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  QUICKLY EDITION | 12 PAGES
                </span>
                <span className="text-emerald-400 text-xs font-black">Original Classroom Reference Guide</span>
              </div>
              <h2 className="text-sm md:text-base font-black tracking-wide text-white uppercase">
                TEACHER QUICKLY TOOL — TEACHER'S BOOK
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search within book */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search in book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 text-white placeholder-slate-400 text-xs pl-8 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 w-44 md:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating PDF...' : 'DOWNLOAD PDF (QUICKLY TOOL)'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT: SIDEBAR + SCROLLABLE PAGES */}
        <div className="flex-1 flex overflow-hidden bg-slate-950">
          
          {/* LEFT SIDEBAR: QUICK NAVIGATION */}
          <div className="hidden lg:flex w-72 flex-col border-r border-slate-800 bg-slate-900/40 p-4 shrink-0 overflow-y-auto">
            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Contents (Jump)</span>
            </h3>
            <div className="space-y-1 text-xs">
              {[
                { page: 1, title: 'Cover & Title' },
                { page: 2, title: 'Table of Contents' },
                { page: 3, title: '1. Introduction & Overview' },
                { page: 4, title: '2. Website Modules (1 - 4)' },
                { page: 5, title: '2. Website Modules (5 - 8)' },
                { page: 6, title: '3. Mastering AI Prompting' },
                { page: 7, title: '4. Templates (1 - 3)' },
                { page: 8, title: '4. Templates (4 - 6)' },
                { page: 9, title: '5. Smart ICT Integration' },
                { page: 10, title: '6. Troubleshooting & Security' },
                { page: 11, title: '7. Author & Goals' },
                { page: 12, title: '8. Contacts & Support' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => jumpToPage(item.page)}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-between border border-transparent hover:border-slate-700/50"
                >
                  <span className="truncate flex items-center gap-2">
                    <span className="bg-slate-800 text-[10px] w-5 h-5 flex items-center justify-center rounded-lg font-bold text-emerald-400">{item.page}</span>
                    <span>{item.title}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTAINER: CONTINUOUS VERTICAL SCROLL OF ALL 12 PAGES */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 scroll-smooth" id="teacher-book-scroll-container">
            
            {/* INSTRUCTIONAL BANNER */}
            <div className="max-w-4xl mx-auto bg-slate-900 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-300">
                  <span className="text-white font-black">Reading Mode (Continuous Scroll):</span> This 12-page book can be scrolled entirely at once to the bottom! Use the menu on the right or left to quickly reach your destination.
                </p>
              </div>
              <button 
                onClick={() => jumpToPage(2)} 
                className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl shrink-0 hover:bg-emerald-400 transition-all active:scale-95"
              >
                Read Contents
              </button>
            </div>

            {/* PAGE 1: COVER PAGE */}
            <div 
              ref={el => { pageRefs.current[1] = el; }}
              className="max-w-4xl mx-auto bg-slate-950 text-white rounded-3xl overflow-hidden border-4 border-emerald-500/30 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              {/* TOP HEADER */}
              <div className="flex justify-between items-center border-b border-emerald-500/30 pb-4">
                <span className="text-emerald-400 font-black tracking-widest text-[11px] uppercase">
                  {highlight("NKORERA EDUCATION SERVICES LTD")}
                </span>
                <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-[10px] text-slate-400">
                  Page 1 / 12
                </span>
              </div>

              {/* CENTER DISPLAY */}
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-10">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden border-2 border-emerald-400/30 shadow-2xl bg-slate-950 flex items-center justify-center">
                    <img 
                      src={nkoreraLogo} 
                      alt="Nkorera Education Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="text-center space-y-4 max-w-2xl">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
                    {highlight("TEACHER QUICKLY TOOL")}
                  </h1>
                  <p className="text-emerald-400 text-xs md:text-sm font-extrabold tracking-widest uppercase">
                    {highlight("OFFICIAL COMPANION & AI HANDBOOK — PREMIUM GOLD EDITION")}
                  </p>
                  
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-full my-6"></div>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-300">
                    {highlight("TEACHER'S BOOK")}
                  </h2>
                  <p className="text-slate-400 text-xs uppercase font-semibold">
                    {highlight("TEACHER QUICK ASSISTANT & AI PROMPTING HANDBOOK")}
                  </p>
                </div>

                <div className="text-center max-w-xl bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-300 text-xs leading-relaxed italic">
                    {highlight('"A solid book that combines Technology, the Use of all tools on the Nkorera Education Website, and the Method of creating AI Prompts for the professional teacher and the REB CBC Curriculum."')}
                  </p>
                </div>
              </div>

              {/* FOOTER DETAILS */}
              <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">WRITTEN AND DEVELOPED BY:</p>
                  <p className="text-slate-200 font-bold text-xs">{highlight("IT Specialist: Nkundimana Theogene")}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="font-bold text-emerald-400">MoMo Support: 0781339530 / 0724038043</p>
                  <p className="text-[10px]">Kigali, Rwanda</p>
                </div>
              </div>
            </div>

            {/* PAGE 2: TABLE OF CONTENTS */}
            <div 
              ref={el => { pageRefs.current[2] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("TEACHER QUICKLY TOOL — TABLE OF CONTENTS")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 2 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-black text-slate-900 uppercase">{highlight("TABLE OF CONTENTS")}</h2>
                  <p className="text-xs text-slate-500">{highlight("Overview of sections and titles in this book")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
                  {[
                    { title: "Title Cover Page", page: 1 },
                    { title: "Table of Contents", page: 2 },
                    { title: "Chapter 1: Introduction & Teacher Quickly Tools Overview", page: 3 },
                    { title: "Chapter 2: Website Analysis (Modules 1 - 4)", page: 4 },
                    { title: "Chapter 2: Website Analysis (Modules 5 - 8)", page: 5 },
                    { title: "Chapter 3: Mastering AI Prompting", page: 6 },
                    { title: "Chapter 4: Useful Examples (Templates 1 - 3)", page: 7 },
                    { title: "Chapter 4: Useful Examples (Templates 4 - 6)", page: 8 },
                    { title: "Chapter 5: Integrating ICT in Teaching Aids", page: 9 },
                    { title: "Chapter 6: Troubleshooting & Security", page: 10 },
                    { title: "Chapter 7: Author Information & Goals", page: 11 },
                    { title: "Chapter 8: Contacts & Support", page: 12 }
                  ].map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => jumpToPage(item.page)}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-left transition-all group"
                    >
                      <span className="text-slate-700 group-hover:text-emerald-900 font-semibold">{highlight(item.title)}</span>
                      <span className="font-black text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-2.5 py-1 rounded-lg">Page {item.page}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl text-xs text-center font-medium leading-relaxed">
                  {highlight("This book aims to help every teacher work efficiently and using technology through the teacherlessonplans.ai.studio system with the help of AI prompts.")}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 3: CHAPTER 1 */}
            <div 
              ref={el => { pageRefs.current[3] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("1. INTRODUCTION — OVERVIEW")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 3 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("1. INTRODUCTION")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 1: INTRODUCTION & OVERVIEW OF TEACHER'S QUICKLY TOOLS")}
                  </h2>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 font-medium">
                  {highlight("Welcome to the comprehensive handbook of Teacher Tool! This book aims to bridge professional teachers with modern AI (Artificial Intelligence) technology so they can finish their work in seconds instead of losing hours putting effort and hands into writing what is needed.")}
                </p>

                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2">
                  <h3 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    {highlight("GOAL OF NKORERA EDUCATION SERVICES LTD")}
                  </h3>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {highlight("Our goal and commitment is that every teacher finds enough time to prepare well and teach children in school in a practical way (Active Learning Methodologies), instead of spending hours searching for how to write pages upon pages of Lesson Plans or making exercises. Teacher's Quickly Tools has come to solve it through modern and reliable technology.")}
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                    {highlight("PEDAGOGICAL ALIGNMENT & REB COMPETENCE-BASED CURRICULUM (CBC)")}
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {highlight("The Rwandan curriculum encourages teachers to teach with the student at the forefront (Learner-Centered Approach). This requires teachers to prepare materials that make students think critically (Critical Thinking), work together in groups (Collaboration & Communication), and solve problems (Problem Solving). This book shows you how to leverage your computer to reach these goals very easily.")}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 4: CHAPTER 2 (MODULES 1-4) */}
            <div 
              ref={el => { pageRefs.current[4] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("2. WEBSITE MODULES (PART 1)")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 4 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("2. WEBSITE ANALYSIS (PART 1)")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 2: ANALYSIS OF WEBSITE CONTENT (MODULES 1 - 4)")}
                  </h2>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {highlight("Nkorera Education is built with 8 powerful modules designed to support teachers fully in their daily work. Here are the first 4 modules:")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-emerald-900 text-sm">1. Lesson Plan Generator</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Creates a full Lesson Plan based on the REB Competence-Based Curriculum (CBC) in English with Competences, Teaching Aids, and Implementation (Steps 1, 2, 3) in detail.")}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-emerald-900 text-sm">2. AI Certificate Creator</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Allows you to create professional certificates for students. It has options for signing by Headteacher & Teacher, has a unique verification code, and different beautiful color themes.")}
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCertificateCreator?.();
                      }}
                      className="mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <span>🚀 Launch Certificate Creator</span>
                    </button>
                  </div>

                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-emerald-900 text-sm">3. Class Diary / Cahier de Textes</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Write or use AI to prepare your Journal of what you taught in the day (Subject, Topic, Competence, Evaluation, Observations) in a professional way that reduces paperwork.")}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-emerald-900 text-sm">4. Student Assessments System</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Store student marks, calculate averages, write AI-based feedback for each child or the whole year to know those with problems to be given remedial plans.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 5: CHAPTER 2 (MODULES 5-8) */}
            <div 
              ref={el => { pageRefs.current[5] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("2. WEBSITE MODULES (PART 2)")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 5 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("2. WEBSITE ANALYSIS (PART 2)")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 2: ANALYSIS OF WEBSITE CONTENT (MODULES 5 - 8)")}
                  </h2>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {highlight("Here are another 4 practical tools contained on the Nkorera Education platform that help simplify teaching in nursery schools, revision for left-behind children, and preparation of exam papers:")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-amber-900 text-sm">5. Nursery Lesson Planner</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("A section dedicated to preparing nursery play-based planning and games, making songs and fingerplays for children in English to eradicate child fatigue.")}
                    </p>
                  </div>

                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-amber-900 text-sm">6. Remedial Action Plan Creator</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Works with AI in preparing teaching aids for those left behind (Remedial Plans) to help students who don't have quick understanding, determines diagnostic assessment, Instructional pacing, and evaluation plans.")}
                    </p>
                  </div>

                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-amber-900 text-sm">7. Interactive Worksheets Creator</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Create question sheets for teachers to give students to do in class or at home (Home Work Worksheets), multiple choice questions, and matching tests with an answer key.")}
                    </p>
                  </div>

                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2 shadow-xs">
                    <h3 className="font-black text-amber-900 text-sm">8. Presentation Slides Creator</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {highlight("Create lesson summaries (Presentation Slides) to show on Projector or computer in a very modern way, making students follow the lesson with curiosity and enjoyment.")}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl text-xs space-y-2 border border-slate-800 shadow-md">
                  <strong className="text-amber-400 block font-black uppercase tracking-wide">{highlight("SECURITY AND DATA STORAGE")}</strong>
                  <p className="leading-relaxed font-normal text-slate-300">
                    {highlight("All information you entered (marks, diaries, lesson plans) is stored in a very secure way (Encrypted Security Database), and the teacher can export it using the Download PDF button or send it to their email easily.")}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 6: CHAPTER 3 (AI PROMPTING) */}
            <div 
              ref={el => { pageRefs.current[6] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("3. AI PROMPTING theory")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 6 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("3. AI PROMPTING THEORY")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 3: MASTERING AI PROMPTING")}
                  </h2>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {highlight("A master of using AI is not just someone who writes words, but a teacher who knows how to represent a very clear structure in their instructions (Prompts). Here we have prepared a clear table of the 5 Pillars a teacher leverages:")}
                </p>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-inner bg-slate-50">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-950 text-amber-300 font-black">
                        <th className="p-3 border-r border-emerald-900">Pillar</th>
                        <th className="p-3 border-r border-emerald-900">Description</th>
                        <th className="p-3">Practical Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      <tr>
                        <td className="p-3 bg-slate-100 font-bold border-r">1. Persona</td>
                        <td className="p-3 border-r">Tell AI what it should be to think well.</td>
                        <td className="p-3 text-emerald-800 font-semibold italic">"Act as a Mathematics Teacher..."</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-slate-100 font-bold border-r">2. Context</td>
                        <td className="p-3 border-r">Explain who you teach, the year, and the language.</td>
                        <td className="p-3 text-emerald-800 font-semibold italic">"For P5 students in Rwanda on CBC..."</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-slate-100 font-bold border-r">3. Task</td>
                        <td className="p-3 border-r">The specific action you want finished.</td>
                        <td className="p-3 text-emerald-800 font-semibold italic">"Prepare 5 exercises to measure understanding..."</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-slate-100 font-bold border-r">4. Format</td>
                        <td className="p-3 border-r">Define the format like a table or list.</td>
                        <td className="p-3 text-emerald-800 font-semibold italic">"Put it in a table format with answers..."</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-slate-100 font-bold border-r">5. Constraint</td>
                        <td className="p-3 border-r">Instructions of what to avoid or follow.</td>
                        <td className="p-3 text-emerald-800 font-semibold italic">"Use very easy English without difficult words."</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl text-xs space-y-2">
                  <strong className="text-amber-900 block font-black uppercase">{highlight("CHAIN OF THOUGHT (COT):")}</strong>
                  <p className="text-amber-950 leading-relaxed font-medium">
                    {highlight('Tell AI: "Think step-by-step before giving me a solid answer." This instruction prevents the computer from rushing and instead explains how it reached the answer for the teacher to check for errors.')}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 7: CHAPTER 4 (TEMPLATES 1-3) */}
            <div 
              ref={el => { pageRefs.current[7] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("4. PROMPT TEMPLATES (PART 1)")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 7 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("4. PROMPT TEMPLATES (PART 1)")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 4: USEFUL EXAMPLES & PRACTICAL STRATEGIES (TEMPLATES 1 - 3)")}
                  </h2>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {highlight("Copy these practical examples (Templates) into AI so it does solid work aligned perfectly with your school in Rwanda. Click the copy button to get it:")}
                </p>

                <div className="space-y-4">
                  {[
                    {
                      num: "1",
                      title: "TEMPLATE 1 — MULTI-LEVEL ASSESSMENT (MATH P4-P6)",
                      text: "As a Primary 5 Mathematics Teacher in Rwanda on CBC, prepare 10 additional questions for the 'Fractions' part. Questions 1 to 4 should be very easy to help students who are slow to understand, while questions 8 to 10 should be difficult questions requiring Higher Order Thinking Skills (HOTS) for students who are already high achievers. Provide detailed answers and explanations."
                    },
                    {
                      num: "2",
                      title: "TEMPLATE 2 — LAB-FREE SCIENCE REMEDIAL PLAN (CHEMISTRY FOCUS)",
                      text: "Prepare a remedial lesson guide for 5 students in S2 Chemistry who failed to understand the 'Elements and Compounds' lesson. Guide me on practical group activities (hands-on activities) that don't require expensive laboratory materials, but instead based on materials they can find at home (like salt, sugar, charcoal), then give me a quick assessment sheet to know they understood."
                    },
                    {
                      num: "3",
                      title: "TEMPLATE 3 — PLAY-BASED NURSERY PLANNING (PRE-PRIMARY ECD)",
                      text: "As a nursery teacher in Baby Class (3 Years Old), give me 3 very exciting games that help children learn to count numbers from 1 to 5 using fun songs and different materials like sticks, colored stones, and tree seeds. Write the lyrics of a song they will all repeat while dancing."
                    }
                  ].map((tmpl) => (
                    <div key={tmpl.num} className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                          {tmpl.title}
                        </span>
                        <button
                          onClick={() => handleCopyPrompt(tmpl.text, tmpl.num)}
                          className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px]"
                        >
                          {copiedIndex === tmpl.num ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        "{highlight(tmpl.text)}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 8: CHAPTER 4 (TEMPLATES 4-6) */}
            <div 
              ref={el => { pageRefs.current[8] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("4. PROMPT TEMPLATES (PART 2)")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 8 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("4. PROMPT TEMPLATES (PART 2)")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 4: USEFUL EXAMPLES (TEMPLATES 4 - 6)")}
                  </h2>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {highlight("Here are another practical examples of Prompts well prepared to help teach languages and other topics in a very modern way:")}
                </p>

                <div className="space-y-4">
                  {[
                    {
                      num: "4",
                      title: "TEMPLATE 4 — READING COMPREHENSION & VALUES (ENGLISH P1-P3)",
                      text: "As an English teacher in P3, write a short and very interesting story using about 150 words. This story should be based on Rwandan culture and values like 'Love' or 'Cooperation'. After the story, put 5 questions to answer in written form, along with a list of 5 new words and their meanings."
                    },
                    {
                      num: "5",
                      title: "TEMPLATE 5 — HISTORICAL ROLEPLAY SCENARIOS (SOCIAL STUDIES P4-S3)",
                      text: "Prepare a roleplay activity for P6 students studying 'Social Studies' regarding Gacaca System (Justice and Reconciliation). Give me a script for what each character will say (characters: elder, lawyer, citizens), how to divide children into groups, and 3 questions based on the conclusion of the game."
                    },
                    {
                      num: "6",
                      title: "TEMPLATE 6 — CLIMATE CHANGE TERRACE STUDY (GEOGRAPHY S1-S3)",
                      text: "As a Geography teacher in S2, prepare a one-hour lesson explaining the effects of Climate Change on high-mountain agriculture in Rwanda, and the importance of making terraces. Give practical examples of Gicumbi or Rutsiro districts, write a list of 4 debate topics, along with the answer key for the final assessment."
                    }
                  ].map((tmpl) => (
                    <div key={tmpl.num} className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                          {tmpl.title}
                        </span>
                        <button
                          onClick={() => handleCopyPrompt(tmpl.text, tmpl.num)}
                          className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px]"
                        >
                          {copiedIndex === tmpl.num ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        "{highlight(tmpl.text)}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 9: CHAPTER 5 (SMART ICT INTEGRATION) */}
            <div 
              ref={el => { pageRefs.current[9] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("5. SMART ICT INTEGRATION")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 9 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("5. SMART ICT INTEGRATION")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 5: INTEGRATING ICT IN TEACHING AIDS")}
                  </h2>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {highlight("The Ministry of Education (MINEDUC) through REB highly encourages ICT integration in all teaching practices. Here are practical tips to leverage even minimal resources:")}
                </p>

                <div className="space-y-4 text-xs">
                  <div className="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-2xl shadow-xs space-y-1">
                    <h3 className="font-black text-emerald-950 text-xs uppercase">{highlight("1. TEACHING WITH ONE LAPTOP OR ONE PROJECTOR")}</h3>
                    <p className="text-[11px] text-slate-800 leading-relaxed">
                      {highlight("If your school has only one projector or teacher laptop, do not waste time writing long notes on the board. Use Presentation Slides prepared by AI, and let students read together and discuss in groups.")}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-2xl shadow-xs space-y-1">
                    <h3 className="font-black text-emerald-950 text-xs uppercase">{highlight("2. INTERACTIVE ACTIVE CHALKBOARD FEEDBACK LOOPS")}</h3>
                    <p className="text-[11px] text-slate-800 leading-relaxed">
                      {highlight("Export questions generated on the Nkorera Education platform using Interactive Worksheets. Use class time to show these questions, ask students, and let them write answers on the board with excitement.")}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-2xl shadow-xs space-y-1">
                    <h3 className="font-black text-emerald-950 text-xs uppercase">{highlight("3. DIGITAL SHARING AND SMART REVISION")}</h3>
                    <p className="text-[11px] text-slate-800 leading-relaxed">
                      {highlight("All lesson summaries, exercises, and revision sheets saved as PDF can be sent to parents' email or WhatsApp groups (Parent-Teacher Forums) to help students revise at home.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 10: CHAPTER 6 (TROUBLESHOOTING & SECURITY) */}
            <div 
              ref={el => { pageRefs.current[10] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("6. TROUBLESHOOTING & SECURITY")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 10 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("6. TROUBLESHOOTING & DIGITAL SECURITY")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 6: TROUBLESHOOTING & SYSTEM SECURITY")}
                  </h2>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {highlight("Using technology platforms can encounter various problems like internet loss or incorrect data entry. In this section, we explain how to solve them professionally:")}
                </p>

                <div className="space-y-4 text-xs">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-1.5 shadow-md">
                    <h3 className="font-black text-amber-400 text-xs uppercase">{highlight("1. NO INTERNET? (HANDLING OFFLINE MODE)")}</h3>
                    <p className="text-slate-200 leading-normal text-[11px] font-normal">
                      {highlight("If you are using prompts in an area that doesn't usually have stable internet, you can do this: First, write or copy your prompts and save them in a Word document (Draft Document) when you have internet.")}
                    </p>
                  </div>

                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-1.5 shadow-md">
                    <h3 className="font-black text-amber-400 text-xs uppercase">{highlight("2. ARCHIVING LESSON PLANS & EXERCISES (PDF ARCHIVING)")}</h3>
                    <p className="text-slate-200 leading-normal text-[11px] font-normal">
                      {highlight("Storing documents only digitally is not enough. Teachers should use the Download PDF button to export their lesson plans and exercise sheets, then put them in well-labeled folders, or upload them to their Google Drive.")}
                    </p>
                  </div>

                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-1.5 shadow-md">
                    <h3 className="font-black text-amber-400 text-xs uppercase">{highlight("3. STUDENT DATA SECURITY (GRADEBOOK PRIVACY)")}</h3>
                    <p className="text-slate-200 leading-normal text-[11px] font-normal">
                      {highlight("Student marks and assessments are very private information. The Nkorera Education platform uses fully secure documents and teaching aids (Encrypted Databases). Teachers are also requested to avoid sharing their passwords with anyone else.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 11: CHAPTER 7 (BIOGRAPHY) */}
            <div 
              ref={el => { pageRefs.current[11] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("7. BIOGRAPHY & OBJECTIVES")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 11 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("7. BIOGRAPHY & CONTACTS")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 7: AUTHOR INFORMATION & NKORERA EDUCATION GOALS")}
                  </h2>
                </div>

                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-emerald-500/40 flex flex-col md:flex-row items-center gap-6 shadow-xl">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-amber-300 font-black text-2xl flex items-center justify-center border-2 border-amber-400 shadow-lg shrink-0">
                    IT
                  </div>
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-2xl font-black text-white">NKUNDIMANA THEOGENE</h3>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Founder, Lead Systems Developer & Tech Educator
                    </p>
                    <p className="text-xs text-emerald-200 font-medium">
                      Nkorera Education Services Ltd. • Kigali, Rwanda
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <strong>Nkundimana Theogene</strong> {highlight("is a specialist in computer technology implementation (IT Specialist & Full-Stack Developer) who uses his skills to transform the delivery and communication of education in Rwanda by creating tools for teachers that help them work with transparency, high security, and extreme ease.")}
                </p>

                <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl space-y-2">
                  <h3 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    {highlight("Nkorera Education Project Goals:")}
                  </h3>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {highlight("Collaborating with the Ministry of Education, REB, and all partners to support teachers through practical and accessible technology, reducing preparation time and increasing time for teaching and caring for children to give them a proper upbringing and make them high-achieving students.")}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

            {/* PAGE 12: CONTACTS & SUPPORT */}
            <div 
              ref={el => { pageRefs.current[12] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  {highlight("8. CONTACTS & SUPPORT")}
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500">
                  Page 12 / 12
                </span>
              </div>

              <div className="flex-1 my-8 space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{highlight("8. DEVELOPER CONTACTS & SUPPORT")}</span>
                  <h2 className="text-xl font-black text-slate-900">
                    {highlight("CHAPTER 8: OFFICIAL DEVELOPER CONTACTS / SUPPORT")}
                  </h2>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {highlight("Need system support, tech advice, custom certificates, or specific prompts for certain lessons:")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  <a 
                    href="https://wa.me/250781339530" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-emerald-950 text-emerald-100 p-4 rounded-xl border border-emerald-800 flex items-center gap-3 hover:scale-105 transition-all shadow-md"
                  >
                    <div className="bg-emerald-600 p-2.5 rounded-lg text-white">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-300 uppercase block font-black">WhatsApp / MoMo Support</span>
                      <span className="text-sm font-black">0781339530</span>
                    </div>
                  </a>

                  <a 
                    href="tel:0724038043" 
                    className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center gap-3 hover:scale-105 transition-all shadow-md"
                  >
                    <div className="bg-blue-600 p-2.5 rounded-lg text-white">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-300 uppercase block font-black">Direct Call</span>
                      <span className="text-sm font-black">0724038043</span>
                    </div>
                  </a>
                </div>

                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-3">
                  <div className="bg-slate-800 p-2.5 rounded-lg text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-black">Official Email</span>
                    <span className="text-slate-900 font-black">nkundimana123theogene@gmail.com</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-amber-50 border-2 border-amber-500/40 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800">1. ONLINE BOOK PORTAL</span>
                    <h4 className="font-black text-amber-950 text-sm">teacherlessonplans.ai.studio</h4>
                    <p className="text-slate-600 font-medium">
                      {highlight("Use this link to visit the contents of this book interactively online.")}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border-2 border-emerald-500/40 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-800">2. PORTAL WEBSITE</span>
                    <h4 className="font-black text-emerald-950 text-sm">teacherlessonplans.ai.studio</h4>
                    <p className="text-slate-600 font-medium">
                      {highlight("Buy more teaching aids and books or find teacher support on our platform.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400">
                <span>🇷🇼 Kigali, Rwanda</span>
                <span>MoMo Support: 0781339530</span>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 text-white rounded-b-3xl">
          <p className="text-xs text-slate-400 font-bold">
            Teacher's Book (12 Pages Gold Edition) — By Nkundimana Theogene
          </p>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 transition-all active:scale-95 border border-rose-500/30"
          >
            <X className="w-4 h-4" />
            <span>CLOSE</span>
          </button>
        </div>

      </div>
    </div>
  );
};
