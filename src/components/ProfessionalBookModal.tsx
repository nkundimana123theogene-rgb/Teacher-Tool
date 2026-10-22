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
  ExternalLink,
  ChevronRight
} from 'lucide-react';

import nkoreraLogo from '../assets/images/nkorera_logo_exact_1786655596298_1786656072173.jpg';
import { sanitizeClonedDocForPdf } from '../utils/pdfSanitizer';

interface ProfessionalBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfessionalBookModal: React.FC<ProfessionalBookModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Refs for jumping to pages
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
    const element = document.getElementById('professional-book-scroll-container');
    if (!element) {
      setIsDownloading(false);
      return;
    }

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       [10, 10, 10, 10] as [number, number, number, number],
        filename:     'Teacher_Tool_Book_English_Edition_2026.pdf',
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
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-400/30 shadow-md relative shrink-0">
              <img 
                src={nkoreraLogo} 
                alt="Nkorera Education Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  PROFESSIONAL EDITION | 2026
                </span>
                <span className="text-emerald-400 text-xs font-black">Professional English Edition</span>
              </div>
              <h2 className="text-sm md:text-base font-black tracking-wide text-white uppercase">
                TEACHER TOOL BOOK — TEACHER'S HANDBOOK
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
                className="bg-slate-800 text-white placeholder-slate-400 text-xs pl-8 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 w-44 md:w-56"
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
              <span>{isDownloading ? 'Generating PDF...' : 'DOWNLOAD PDF (FULL BOOK)'}</span>
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
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Table of Contents (Jump)</span>
            </h3>
            <div className="space-y-1 text-xs">
              {[
                { page: 1, title: 'Cover & Title' },
                { page: 2, title: 'Table of Contents' },
                { page: 3, title: 'How to use this book' },
                { page: 4, title: '1. Understanding Teacher Tool' },
                { page: 5, title: '2. CBC Lesson Planning' },
                { page: 6, title: '3. ECE Planning' },
                { page: 7, title: '4. Five-Step AI Workflow' },
                { page: 8, title: '5. Writing Better Prompts' },
                { page: 9, title: '6. Lesson Plan Structure' },
                { page: 10, title: '7. Classroom Activities' },
                { page: 11, title: '8. Assessment & Evidence' },
                { page: 12, title: '9. Differentiation & Inclusion' },
                { page: 13, title: '10. Beyond Lesson Plans' },
                { page: 14, title: '11. Responsible AI Use' },
                { page: 15, title: '12. Practical Prompt Library' },
                { page: 16, title: '13. Worked Example: Primary' },
                { page: 17, title: '14. Worked Example: ECE' },
                { page: 18, title: '15. Worked Example: Secondary' },
                { page: 19, title: '16. Lesson Reflection' },
                { page: 20, title: '17. School-Level Use' },
                { page: 21, title: '18. Quick Reference Checklists' },
                { page: 22, title: '19. 30-Day Practice Plan' },
                { page: 23, title: '20. Final Guidance' },
                { page: 24, title: 'Appendices: A & B' },
                { page: 25, title: 'Appendices: C & D' },
                { page: 26, title: 'E. Contact & Website' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => jumpToPage(item.page)}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-between border border-transparent hover:border-slate-700/50"
                >
                  <span className="truncate flex items-center gap-2">
                    <span className="bg-slate-800 text-[10px] w-5 h-5 flex items-center justify-center rounded-lg font-bold text-amber-400">{item.page}</span>
                    <span>{item.title}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTAINER: CONTINUOUS VERTICAL SCROLL OF ALL 26 PAGES */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 scroll-smooth" id="professional-book-scroll-container">
                     {/* INSTRUCTIONAL BANNER */}
            <div className="max-w-4xl mx-auto bg-slate-900 border border-amber-400/20 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-slate-300">
                  <span className="text-white font-black">Reading Mode (Continuous Scroll):</span> This handbook contains all 26 pages in comprehensive English. You can scroll continuously through every section!
                </p>
              </div>
              <button 
                onClick={() => jumpToPage(2)} 
                className="bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl shrink-0 hover:bg-amber-300 transition-all active:scale-95"
              >
                Read Contents
              </button>
            </div>

            {/* PAGE 1: COVER PAGE */}
            <div 
              ref={el => { pageRefs.current[1] = el; }}
              className="max-w-4xl mx-auto bg-slate-950 text-white rounded-3xl overflow-hidden border-4 border-amber-400/30 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              {/* TOP HEADER */}
              <div className="flex justify-between items-center border-b border-amber-400/30 pb-4">
                <span className="text-amber-400 font-black tracking-widest text-[11px] uppercase">
                  {highlight("PROFESSIONAL EDUCATION EDITION | 2026")}
                </span>
                <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-[10px] text-slate-400">
                  Page 1 / 26
                </span>
              </div>

              {/* CENTER CIRCLE DISPLAY */}
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-10">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-slate-950 flex items-center justify-center">
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
                    {highlight("TEACHER TOOL BOOK")}
                  </h1>
                  <p className="text-amber-400 text-xs md:text-sm font-extrabold tracking-widest uppercase">
                    {highlight("AI-Assisted Lesson Planning • CBC • ECE • Assessment")}
                  </p>
                  
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full my-6"></div>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-300">
                    {highlight("TEACHER'S HANDBOOK")}
                  </h2>
                  <p className="text-slate-400 text-xs">
                    {highlight("Professional English Edition")}
                  </p>
                </div>

                <div className="text-center max-w-xl bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-slate-300 text-xs">
                    {highlight("How teachers use every section to plan, teach and assess.")}
                  </p>
                  <p className="text-slate-400 text-[11px] italic">
                    {highlight("Professional English Edition for Educators.")}
                  </p>
                </div>
              </div>

              {/* FOOTER DETAILS */}
              <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
                <div className="text-center md:text-left">
                  <p className="font-extrabold text-amber-400">{highlight("NKUNDIMANA THEOGENE")}</p>
                  <p className="text-[10px]">{highlight("IT / DEVELOPER")}</p>
                </div>
                <div className="text-center md:text-right">
                  <p>{highlight("Prepared for Nkundimana Theogene")}</p>
                  <p>{highlight("Teacher Lesson Plans AI Studio")}</p>
                </div>
              </div>
            </div>


            {/* PAGE 2: TABLE OF CONTENTS */}
            <div 
              ref={el => { pageRefs.current[2] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 2 / 26
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                  {highlight("Table of Contents")}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black">
                        <th className="p-2 border border-slate-200 w-12 text-center">No.</th>
                        <th className="p-2 border border-slate-200">Section Title</th>
                        <th className="p-2 border border-slate-200">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      {[
                        { num: '1', title: 'Understanding the Teacher Tool', desc: 'How to leverage AI for CBC/ECE planning' },
                        { num: '2', title: 'CBC Lesson Planning', desc: 'Structuring competency-based lessons' },
                        { num: '3', title: 'ECE Planning', desc: 'Early Childhood Education strategies' },
                        { num: '4', title: 'The Five-Step AI Workflow', desc: 'Efficient lesson plan creation process' },
                        { num: '5', title: 'Writing Better Prompts', desc: 'Mastering AI instructions' },
                        { num: '6', title: 'Lesson Plan Structure', desc: 'Standardized components of a plan' },
                        { num: '7', title: 'Classroom Activities', desc: 'Active learning methodologies' },
                        { num: '8', title: 'Assessment and Evidence', desc: 'Measuring student progress' },
                        { num: '9', title: 'Differentiation and Inclusion', desc: 'Reaching every learner' },
                        { num: '10', title: 'Teacher Tools Beyond Lesson Plans', desc: 'Worksheets, quizzes, and more' },
                        { num: '11', title: 'Responsible AI Use', desc: 'Ethics and verification' },
                        { num: '12', title: 'Practical Prompt Library', desc: 'Ready-to-use templates' },
                        { num: '13', title: 'Worked Example — Primary', desc: 'Equivalent Fractions lesson' },
                        { num: '14', title: 'Worked Example — ECE', desc: 'Sorting Objects activity' },
                        { num: '15', title: 'Worked Example — Secondary', desc: 'Using Evidence in Social Studies' },
                        { num: '16', title: 'Lesson Reflection', desc: 'Post-teaching analysis' },
                        { num: '17', title: 'School-Level Use', desc: 'Collaboration and management' },
                        { num: '18', title: 'Quick Reference Checklists', desc: 'Fast quality checks' },
                        { num: '19', title: '30-Day Teacher AI Practice Plan', desc: 'Building expertise over time' },
                        { num: '20', title: 'Final Guidance', desc: 'Long-term success tips' },
                        { num: 'A-D', title: 'Appendices', desc: 'Templates, prompt builder, and resources' },
                        { num: 'E', title: 'Contact & Website Info', desc: 'Support and developer details' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 border border-slate-200 text-center font-bold text-slate-800">{row.num}</td>
                          <td className="p-2 border border-slate-200 text-slate-800 font-bold">{highlight(row.title)}</td>
                          <td className="p-2 border border-slate-200 italic">{highlight(row.desc)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>


            {/* PAGE 3: HOW TO USE */}
            <div 
              ref={el => { pageRefs.current[3] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 3 / 26
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                  {highlight("How to use this book")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 col-span-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-black">GUIDE</span>
                      <span>PROFESSIONAL GUIDANCE</span>
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-700 font-semibold">
                      {highlight("This book combines key theoretical concepts with practical classroom applications. Each section provides an in-depth explanation and specific steps for teachers to use in their lessons.")}
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                      <p className="font-bold text-slate-900 mb-1">{highlight("Practical Teacher Use:")}</p>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {highlight("Read the explanations provided, select the teaching strategy that best fits your specific lesson, and use the included checklists to review your plan before entering the classroom.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>


            {/* PAGE 4: 1. UNDERSTANDING THE TEACHER TOOL */}
            <div 
              ref={el => { pageRefs.current[4] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 4 / 26
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                  {highlight("1. Understanding the Teacher Tool")}
                </h2>

                <div className="grid grid-cols-1 gap-8 mt-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-r-xl">
                      <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest mb-2">Overview</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {highlight("Teacher Lesson Plans AI Studio is an AI-assisted starting point for CBC and ECE lesson planning. It reduces repetitive preparation work but does not replace the teacher. The teacher must check curriculum alignment, correct unsuitable content, and adapt the plan to the class, language, time, resources and learner needs.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-8 space-y-4">
                  <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>How the teacher uses it</span>
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 text-slate-600">
                    <p className="text-xs font-semibold leading-relaxed">
                      {highlight("Provide the lesson details, request a draft, review and adapt it, then decide what evidence will show that learners have learned. The teacher's professional judgment is the final step in the process.")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>

            {/* Render remaining pages sequentially (Pages 5 to 26) with beautiful clean semantic layouts */}
            {[
              {
                id: 5,
                title: "2. CBC Lesson Planning",
                sub: "Competence-Based Curriculum Framework",
                en: "In CBC, planning begins with what learners should be able to demonstrate, do, explain or solve. A plan should include the competency or outcome, success criteria, prior knowledge, resources, activities and assessment.",
                enUse: "First write, “What will learners be able to do after the lesson?” Then select activities and assessment that directly support that outcome."
              },
              {
                id: 6,
                title: "3. ECE Planning",
                sub: "Early Childhood Education Strategies",
                en: "ECE planning relies on play, stories, songs, movement, hands-on exploration and observation. Activities should be short, engaging, repeatable and based on locally available materials. Assessment is mainly carried out through observing children.",
                enUse: "Request sorting, building, singing or storytelling activities, and record whether each child can follow instructions and demonstrate learning."
              },
              {
                id: 7,
                title: "4. The Five-Step AI Workflow",
                sub: "Lesson Plan Creation Process",
                en: "The five steps are: 1) specify the class and topic; 2) state the competency or outcome; 3) add resources and learner needs; 4) request an AI-generated draft; 5) teach, assess, reflect and revise.",
                enUse: "Complete steps 1–4 before class and use step 5 after class to improve the next lesson."
              },
              {
                id: 8,
                title: "5. Writing Better Prompts",
                sub: "Mastering AI Instructions",
                en: "A strong prompt states the class, subject, topic, competency, duration, resources, language, learner needs and assessment format. The more specific the input, the more useful the draft is likely to be.",
                enUse: "Example: “Create a 40-minute Primary 5 Science lesson on clean water. Learners should explain three ways to keep drinking water safe. Use locally available materials, group work, an exit question and differentiation.”"
              },
              {
                id: 9,
                title: "6. Lesson Plan Structure",
                sub: "Standardized Framework Components",
                en: "A complete plan includes school and teacher, class, subject, date, duration, topic, competency, success criteria, prior knowledge, resources, introduction, main activities, practice, assessment, differentiation, conclusion and reflection.",
                enUse: "Use the template and protect enough time for learner practice and for collecting assessment evidence."
              }
            ].map((page) => (
              <div 
                key={page.id}
                ref={el => { pageRefs.current[page.id] = el; }}
                className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                    <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                      TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                    </span>
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page {page.id} / 26
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                    {highlight(page.title)}
                    <span className="block text-sm md:text-base text-slate-500 mt-1 uppercase font-extrabold">
                      {highlight(page.sub)}
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 gap-8 mt-6">
                    <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-r-xl">
                      <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest mb-2">Theoretical Concept</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {highlight(page.en)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-8 space-y-4">
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>How the teacher uses it</span>
                    </h3>
                    <div className="bg-white p-5 rounded-xl border border-emerald-100 space-y-4">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        {highlight(page.enUse)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                  Professional English Edition 2026
                </div>
              </div>
            ))}


            {/* PAGE 10: 7. CLASSROOM ACTIVITIES (TABLE DISPLAY) */}
            <div 
              ref={el => { pageRefs.current[10] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 10 / 26
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                  {highlight("7. Classroom Activities")}
                </h2>

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                    {highlight("Possible activities include think-pair-share, problem solving, demonstration, storytelling, group investigation, debate, role play, peer teaching, sorting and matching, and project work. AI suggests various options, but the teacher's professional judgment is required to select the most appropriate strategy for the specific learner group and lesson goals.")}
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                        <th className="p-2 border-r border-slate-200">Activity</th>
                        <th className="p-2">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {[
                        { act: 'Think–pair–share', purp: 'Collaborative thinking and peer discussions' },
                        { act: 'Problem solving', purp: 'Apply critical reasoning to real-world challenges' },
                        { act: 'Demonstration', purp: 'Show a practical process and model skills' },
                        { act: 'Storytelling', purp: 'Learn through engaging narrative and context' },
                        { act: 'Group investigation', purp: 'Collaborative research and hands-on inquiry' },
                        { act: 'Role play', purp: 'Applying knowledge through simulated scenarios' },
                        { act: 'Peer teaching', purp: 'Solidify understanding by explaining to peers' },
                        { act: 'Sorting/matching', purp: 'Logical categorization and pattern recognition' },
                        { act: 'Project work', purp: 'Creating a tangible product or investigative solution' },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-200 text-slate-900 font-black">{item.act}</td>
                          <td className="p-2 text-slate-600">{highlight(item.purp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>


            {/* PAGE 11 to 23 SEQUENTIALLY */}
            {[
              {
                id: 11,
                title: "8. Assessment and Evidence",
                sub: "Measuring Student Progress",
                en: "Assessment makes learning visible and helps the teacher decide what to do next. Useful methods include questioning, observation, practice tasks, exit tickets, rubrics, checklists, and group work. Decide in advance what evidence will demonstrate success, collect it during the lesson, and identify learners needing remediation or extension.",
                enUse: "First identify the indicator that will show the goal has been reached, collect it during the lesson, and distinguish those needing remediation from those ready for extension. A robust assessment plan allows the teacher to provide immediate feedback and adjust the pace."
              },
              {
                id: 12,
                title: "9. Differentiation and Inclusion",
                sub: "Reaching Every Learner",
                en: "Teachers can provide key vocabulary, worked examples, and simpler tasks for learners needing support. Learners ready for more challenge can receive deeper questions or a small project. The aim is access for all through appropriate pathways.",
                enUse: "Ask AI for three levels of tasks, while checking that all levels lead toward the same intended competency. Use various grouping strategies and provide scaffolded materials to support diverse learning needs."
              },
              {
                id: 13,
                title: "10. Teacher Tools Beyond Lesson Plans",
                sub: "Worksheets, Quizzes, and More",
                en: "The workflow can also support schemes of work, unit outlines, weekly plans, revision plans, worksheets, activity cards, flashcards, discussion prompts, homework, quizzes, rubrics, and observation checklists.",
                enUse: "Request one specific tool with the class, topic, language, and duration, then review and localize it before classroom use or distribution to students."
              },
              {
                id: 14,
                title: "11. Responsible AI Use",
                sub: "Ethics and Verification",
                en: "The teacher verifies facts, avoids unnecessary learner personal information, checks for bias and stereotypes, and remains responsible for the final classroom material taught to students. AI is a powerful assistant, but the teacher remains the pedagogical leader.",
                enUse: "Never teach an AI draft unchanged; compare it with the curriculum, localize it, and improve it based on your professional experience and knowledge of your students."
              },
              {
                id: 15,
                title: "12. Practical Prompt Library",
                sub: "Ready-to-use Templates",
                en: "Lesson-plan prompt: 'Create a CBC lesson plan for [class] in [subject] on [topic], including competency, activities, resources, assessment, differentiation and reflection.' Worksheet prompt: 'Create a three-level worksheet on [topic] with an answer guide.'",
                enUse: "Replace the bracketed fields with the details of the real lesson and add duration and resources to get the most relevant output from the tool."
              },
              {
                id: 16,
                title: "13. Worked Example — Primary: Equivalent Fractions",
                sub: "Identifying and Explaining Equivalent Fractions",
                en: "The outcome is to identify and explain equivalent fractions using visual representations. Activities include fraction cards, pair work, group explanations, and an exit task. Assessment checks whether learners can build at least two equivalent pairs.",
                enUse: "Adapt the numbers and materials to the learners' level and local classroom resources, ensuring that every student has hands-on materials to explore the concept."
              },
              {
                id: 17,
                title: "14. Worked Example — ECE: Sorting Objects",
                sub: "Foundational Logic and Classification",
                en: "The teacher uses a story, object exploration, a sorting game, a movement break, and a group recap. Observation checks whether a child can sort by color, size, or attributes. Early sorting skills are the foundation for future mathematical logic.",
                enUse: "Record a short observation for each child and provide targeted support where needed, using simple language to explain the sorting rules during the activity."
              },
              {
                id: 18,
                title: "15. Worked Example — Secondary: Using Evidence",
                sub: "Scientific Observation and Explanation",
                en: "Learners make a prediction, observe a demonstration, complete an observation table, write an explanation, and conduct peer review regarding scientific phenomena. The teacher assesses observation accuracy, use of evidence, and clarity of explanation.",
                enUse: "Align the demonstration with the syllabus topic and check that all materials are safe for classroom use. Ensure that students focus on the 'Why' and 'How' of the results."
              },
              {
                id: 19,
                title: "16. Lesson Reflection",
                sub: "Post-Teaching Analysis",
                en: "After class, ask: What did learners achieve? Who needs support? What worked well? What should change? Turn the answers into a concrete next step for the following lesson. Reflection is the bridge between one lesson and the next.",
                enUse: "Record a few practical actions, such as increasing practice time or revisiting key vocabulary, to ensure that no student is left behind in the curriculum progression."
              },
              {
                id: 20,
                title: "17. School-Level Use",
                sub: "Collaboration and Management",
                en: "School leaders can use the handbook for training, peer review, sharing plans, and quality assurance. Teacher teams can jointly design CBC-aligned activities and assessment to ensure consistency across grades.",
                enUse: "Adopt a common checklist for outcomes, activities, assessment, resources, differentiation, and local adaptation to maintain a high standard of professional preparation."
              },
              {
                id: 21,
                title: "18. Quick Reference Checklists",
                sub: "Fast Quality Checks",
                en: "Before class, check the outcome, activities, resources, assessment, and differentiation. During class, check participation, instructions, timing, and evidence. After class, record achievements.",
                enUse: "Use these checklists as a basis for peer observation and mentoring sessions, providing a clear and objective framework for discussing teaching quality and effectiveness."
              },
              {
                id: 22,
                title: "19. 30-Day Teacher AI Practice Plan",
                sub: "Building Expertise Over Time",
                en: "Week 1: one reviewed lesson plan per day. Week 2: activities, questions and differentiation. Week 3: assessment tools and remediation. Week 4: prompt library and sharing practice.",
                enUse: "Progress gradually, compare drafts with classroom results, and save useful prompts and materials that consistently produce high-quality results for your specific context."
              },
              {
                id: 23,
                title: "20. Final Guidance",
                sub: "Long-term Success Tips",
                en: "AI is a tool; teaching remains a professional craft. Never use an AI-generated plan without reading and adapting it. Use AI to reduce repetitive planning so you can focus on inspiring learners.",
                enUse: "Final rule: read, test, localize, teach, assess and improve. Your professional judgment and passion for teaching are what ultimately make the difference in your students' lives."
              }
            ].map((page) => (
              <div 
                key={page.id}
                ref={el => { pageRefs.current[page.id] = el; }}
                className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                    <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                      TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                    </span>
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                      Page {page.id} / 26
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                    {highlight(page.title)}
                    <span className="block text-sm md:text-base text-slate-500 mt-1 uppercase font-extrabold">
                      {highlight(page.sub)}
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 gap-8 mt-6">
                    <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-r-xl">
                      <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest mb-2">Theoretical Concept</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {highlight(page.en)}
                      </p>
                    </div>
                  </div>

                  {page.id === 14 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mt-4 text-xs font-bold text-slate-900">
                      {highlight("Four Core Responsibilities: Accuracy; Privacy; Fairness; Final Teacher Responsibility.")}
                    </div>
                  )}

                  {page.id === 15 && (
                    <div className="bg-slate-900 text-white p-5 rounded-xl mt-4 space-y-3 font-semibold text-xs">
                      <p className="text-amber-400 font-black uppercase tracking-wider">{highlight("Copyable Prompt Presets:")}</p>
                      <div className="space-y-2">
                        {[
                          "Create a CBC lesson plan for Primary 5 in Mathematics on Equivalent Fractions, including competency, activities, resources, assessment, differentiation and reflection.",
                          "Create a three-level worksheet on Sorting Objects with an answer guide.",
                          "Identify misconceptions on Secondary Biology Photosynthesis and design a 20-minute corrective activity."
                        ].map((prompt, pIdx) => (
                          <div key={pIdx} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 border border-slate-700">
                            <span className="truncate italic">"{prompt}"</span>
                            <button
                              onClick={() => handleCopyPrompt(prompt, `prompt-${pIdx}`)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg shrink-0 transition-all"
                            >
                              {copiedIndex === `prompt-${pIdx}` ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-8 space-y-4">
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>How the teacher uses it</span>
                    </h3>
                    <div className="bg-white p-5 rounded-xl border border-emerald-100 space-y-4">
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        {highlight(page.enUse)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                  Professional English Edition 2026
                </div>
              </div>
            ))}


            {/* PAGE 24: APPENDIX A & B */}
            <div 
              ref={el => { pageRefs.current[24] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 24 / 26
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                  {highlight("A. Master Lesson Plan Template")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold mb-8">
                  <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{highlight("Mandatory Fields")}</p>
                    <ul className="space-y-1.5 text-slate-700">
                      <li>• {highlight("School Name")}</li>
                      <li>• {highlight("Teacher Name")}</li>
                      <li>• {highlight("Class Level")}</li>
                      <li>• {highlight("Subject and Topic")}</li>
                      <li>• {highlight("Date and Duration")}</li>
                      <li>• {highlight("Key Competency")}</li>
                      <li>• {highlight("Success Criteria")}</li>
                      <li>• {highlight("Learners' Prior Knowledge")}</li>
                    </ul>
                  </div>

                  <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{highlight("Implementation Steps")}</p>
                    <ul className="space-y-1.5 text-slate-700">
                      <li>• {highlight("Teaching and Learning Resources")}</li>
                      <li>• {highlight("Lesson Introduction (Starter)")}</li>
                      <li>• {highlight("Main Teaching & Learning Activities")}</li>
                      <li>• {highlight("Assessment of Learning Evidence")}</li>
                      <li>• {highlight("Differentiation and Inclusion")}</li>
                      <li>• {highlight("Lesson Conclusion")}</li>
                      <li>• {highlight("Teacher Reflection and Next Steps")}</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-4 mt-8">
                  {highlight("B. Prompt Builder")}
                </h2>
                
                <div className="bg-slate-900 text-amber-300 p-6 rounded-2xl border-2 border-amber-400/20 font-black text-sm leading-relaxed shadow-xl relative group">
                  <p className="italic">
                    "{highlight("Create a [duration]-minute [subject] lesson for [class] on [topic]. The competency is [competency]. Use [resources]. Include learner-centred activities, assessment evidence, differentiation and reflection. Write it in [language].")}"
                  </p>
                  <button
                    onClick={() => handleCopyPrompt("Create a [duration]-minute [subject] lesson for [class] on [topic]. The competency is [competency]. Use [resources]. Include learner-centred activities, assessment evidence, differentiation and reflection. Write it in [language].", "builder-prompt")}
                    className="absolute right-4 bottom-4 bg-amber-400 text-slate-950 hover:bg-amber-300 p-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-xs"
                  >
                    {copiedIndex === "builder-prompt" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>


            {/* PAGE 25: APPENDIX C & D */}
            <div 
              ref={el => { pageRefs.current[25] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 25 / 26
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6">
                  {highlight("C. Quality-Control Checklist")}
                </h2>

                <div className="overflow-x-auto border border-slate-200 rounded-xl mb-8 text-xs font-semibold">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <th className="p-2 border-r border-slate-200">Quality Check Indicator</th>
                        <th className="p-2 w-20 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        "The topic matches the official curriculum and class level.",
                        "The intended competency is clear and observable.",
                        "Classroom activities directly support the intended outcome.",
                        "Assessment methods accurately measure learning progress.",
                        "Resources are realistic, safe, and locally available.",
                        "Differentiation strategies are included where needed.",
                        "Facts, examples, and calculations have been verified.",
                        "No unnecessary learner personal information is included.",
                        "The entire plan is adapted to the specific local context.",
                      ].map((chk, cIdx) => (
                        <tr key={cIdx}>
                          <td className="p-2 border-r border-slate-200">{highlight(chk)}</td>
                          <td className="p-2 text-center text-slate-400 font-bold">✓ / ✕</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-4">
                  {highlight("D. Source and Credits")}
                </h2>
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-xs font-semibold text-slate-700 leading-relaxed space-y-3">
                  <p>
                    {highlight("This edition is based on the Teacher Tool Book — AI-Assisted Lesson Planning • CBC • ECE • Assessment, prepared by Nkundimana Theogene, IT Specialist & Developer at Teacher Lesson Plans AI Studio, 2026.")}
                  </p>
                  <p className="italic text-slate-600">
                    {highlight("Comprehensive English explanations have been integrated to ensure every section is practical and accessible to professional teachers globally. This tool aims to enhance educational standards through responsible AI integration.")}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>


            {/* PAGE 26: APPENDIX E. CONTACT & SUPPORT */}
            <div 
              ref={el => { pageRefs.current[26] = el; }}
              className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-12 relative min-h-[1050px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                  <span className="text-emerald-700 font-extrabold tracking-wider text-xs">
                    TEACHER TOOL BOOK | NKUNDIMANA THEOGENE
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600">
                    Page 26 / 26
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6 uppercase tracking-tight">
                  {highlight("E. Contact and Website Support")}
                </h2>

                <div className="space-y-4 text-xs font-semibold text-slate-700 leading-relaxed mb-8">
                  <p>
                    {highlight("For more information about this book, Teacher Lesson Plans AI Studio, or additional lesson-planning resources, please use the contact details provided below.")}
                  </p>
                  <p className="italic text-slate-500">
                    {highlight("Our support team is available to assist you with technical integration, professional training, and custom educational software development.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-center">
                    <p className="text-slate-500 text-[10px] uppercase font-black">{highlight("Official Website")}</p>
                    <a href="https://teacherlessonplans.ai.studio" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1.5">
                      <span>https://teacherlessonplans.ai.studio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-center">
                    <p className="text-slate-500 text-[10px] uppercase font-black">{highlight("Support Email")}</p>
                    <a href="mailto:nkundimana123theogene@gmail.com" className="text-emerald-600 hover:underline flex items-center gap-1.5">
                      <span>nkundimana123theogene@gmail.com</span>
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-center">
                    <p className="text-slate-500 text-[10px] uppercase font-black">{highlight("Direct Phone")}</p>
                    <a href="tel:+250724038043" className="text-slate-700 hover:underline flex items-center gap-1.5">
                      <span>+250 724 038 043</span>
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-center">
                    <p className="text-slate-500 text-[10px] uppercase font-black">{highlight("WhatsApp Support")}</p>
                    <a href="https://wa.me/250781339530" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline flex items-center gap-1.5">
                      <span>+250 781 339 530</span>
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-xs font-semibold text-slate-800 space-y-3">
                  <p>
                    {highlight("You can use our website or WhatsApp support line to request technical assistance, additional information, and high-quality teacher-planning resources adapted to your specific needs.")}
                  </p>
                  <p className="italic text-slate-600">
                    {highlight("Ensuring that modern, AI-powered education reaches every classroom with excellence and professional integrity.")}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500 font-bold">
                Professional English Edition 2026
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 text-white rounded-b-3xl">
          <p className="text-xs text-slate-400 font-bold">
            Teacher's Book (26 Pages Full Edition) — By Nkundimana Theogene
          </p>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 transition-all active:scale-95 border border-rose-500/30"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

      </div>
    </div>
  );
};
