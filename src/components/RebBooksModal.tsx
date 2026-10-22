import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  GraduationCap, 
  Search,
  BookMarked,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Filter
} from 'lucide-react';

interface RebBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const REB_BOOK_CATEGORIES = [
  {
    id: 'nursery',
    title: 'Pre-Primary / Nursery Books',
    subtitle: 'Early Childhood Education (ECE / Nursery)',
    url: 'https://elearning.reb.rw/course/index.php?categoryid=15',
    categoryCode: 'REB-ECE-2026',
    icon: '🧸',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Teacher guidebooks, activity books, picture stories, and foundational numeracy/literacy resources for Baby, Middle, and Pre-Primary classes.',
    popularSubjects: ['Language & Communication', 'Mathematics & Discovery', 'Social Skills', 'Creative Arts']
  },
  {
    id: 'primary',
    title: 'Primary Books (P1 - P6)',
    subtitle: 'Primary Education Resources (P1 to P6)',
    url: 'https://elearning.reb.rw/course/index.php?categoryid=19',
    categoryCode: 'REB-PRI-2026',
    icon: '📚',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Official 2026 REB CBC textbooks and teacher guides for all primary subjects including Mathematics, English, SET, Social Studies, French, and ICT.',
    popularSubjects: ['Mathematics', 'English', 'Science & Technology (SET)', 'Social Studies']
  },
  {
    id: 'olevel',
    title: 'Secondary Books (O\'Level)',
    subtitle: 'Ordinary Level Secondary Resources (S1, S2, S3)',
    url: 'https://elearning.reb.rw/course/index.php?categoryid=13',
    categoryCode: 'REB-OLEV-2026',
    icon: '🎓',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Updated 2026 O-Level REB textbooks, syllabus guides, revision workbooks, and practical laboratory manuals for S1, S2, and S3 students and teachers.',
    popularSubjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'ICT', 'Entrepreneurship']
  },
  {
    id: 'alevel',
    title: 'Secondary Advanced Books (A\'Level)',
    subtitle: 'Advanced Level Secondary Resources (S4, S5, S6 Combinations)',
    url: 'https://elearning.reb.rw/course/index.php?categoryid=32',
    categoryCode: 'REB-ALEV-2026',
    icon: '🔬',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Advanced Level REB textbooks for all combinations (MPC, PCB, BCG, MEG, MCE, HEG, LFK, etc.), advanced teacher manuals, and national exam revision guides.',
    popularSubjects: ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Literature in English', 'Computer Science & Web Development (HTML & CSS)']
  }
];

export const RebBooksModal: React.FC<RebBooksModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [closedCategories, setClosedCategories] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    REB_BOOK_CATEGORIES.forEach(c => { map[c.id] = true; });
    return map;
  });
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setClosedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const closeAllCategories = () => {
    const map: Record<string, boolean> = {};
    REB_BOOK_CATEGORIES.forEach(c => { map[c.id] = true; });
    setClosedCategories(map);
  };

  const openAllCategories = () => {
    setClosedCategories({});
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleCopyAll = () => {
    const textToCopy = `*ABAKENEYE REB ALL BOOKS UPDATED IN 2026.*\n\n*Links for using to access REB ALL BOOKS*\n\n*REB ALL BOOKS Updated in 2026.*\n\n* Pre-Primary/Nursery Books\nhttps://elearning.reb.rw/course/index.php?categoryid=15\n\n* Primary Books\nhttps://elearning.reb.rw/course/index.php?categoryid=19\n\n* Secondary Books (O'L)\nhttps://elearning.reb.rw/course/index.php?categoryid=13\n\n* Secondary Advanced (A'L)\nhttps://elearning.reb.rw/course/index.php?categoryid=32\n\nUploaded by IT/Developer: Nkundimana Theogene`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const filteredCategories = REB_BOOK_CATEGORIES.filter(cat => {
    const matchesSubject = selectedSubjectFilter === 'all' || cat.popularSubjects.some(s => s.toLowerCase().includes(selectedSubjectFilter.toLowerCase()));
    if (!matchesSubject) return false;
    if (!searchQuery) return true;
    return (
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.popularSubjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-500/30 flex flex-col max-h-[95vh] text-slate-800 animate-fade-in">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 text-white px-6 py-5 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> OFFICIAL REB PORTAL
                </span>
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md">
                  UPDATED 2026 EDITION
                </span>
              </div>
              <h2 className="text-lg md:text-2xl font-black tracking-wide text-white mt-1">
                REB ALL BOOKS UPDATED IN 2026
              </h2>
              <p className="text-xs text-emerald-300/90 font-medium">
                Direct links to Rwanda Education Board e-Learning Digital Library textbooks & teacher guides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'All Links Copied!' : 'Copy All Links'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              id="close-reb-books-modal-btn"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* DEVELOPER CREDIT BANNER */}
        <div className="bg-emerald-900/10 border-b border-emerald-200/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-emerald-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Click on the book or category you want and immediately download REB books for free!</span>
          </div>
          <div className="text-[11px] font-bold bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300">
            Uploaded by IT/Developer: <span className="font-extrabold text-emerald-800">Nkundimana Theogene</span>
          </div>
        </div>

        {/* SEARCH & CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* CONTROLS HEADER: SEARCH, FILTER, AND BATCH OPEN/CLOSE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search REB books by subject, level (e.g. Math, Physics, SET, Nursery)..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-medium focus:border-emerald-500 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={selectedSubjectFilter}
                onChange={e => setSelectedSubjectFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science & SET</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Social Studies">Social and Religious Education (SRE)</option>
                <option value="Creative Arts">Creative Arts</option>
                <option value="Music, Dance and Drama">Music, Dance and Drama (M.D.D)</option>
                <option value="Economics">Economics</option>
                <option value="Computer">Computer Science & ICT (HTML & CSS Web Development)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={closeAllCategories}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Close all book categories"
              >
                <FolderClosed className="w-3.5 h-3.5 text-amber-600" />
                <span>Close All</span>
              </button>

              <button
                onClick={openAllCategories}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="Open all book categories"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open All</span>
              </button>
            </div>
          </div>

          {/* GRID OF BOOK CATEGORIES WITH ACCORDION CLOSE PER SUBJECT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((cat) => {
              const isClosed = closedCategories[cat.id] === true;

              return (
                <div 
                  key={cat.id} 
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm ${
                    isClosed ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  {/* CATEGORY HEADER (CLICK TO TOGGLE) */}
                  <div 
                    onClick={() => toggleCategory(cat.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 bg-white rounded-xl shadow-xs">{cat.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded border ${cat.badgeColor}`}>
                            {cat.categoryCode}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">
                          {cat.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(cat.id);
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1 text-[11px] font-bold"
                    >
                      <span>{isClosed ? 'Open' : 'Close'}</span>
                      {isClosed ? <ChevronRight className="w-3.5 h-3.5 text-amber-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>

                  {/* EXPANDED CONTENT */}
                  {!isClosed ? (
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between animate-fade-in">
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 font-medium">
                          {cat.subtitle}
                        </p>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {cat.description}
                        </p>

                        {/* POPULAR SUBJECT TAGS */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Popular Subjects Included:</span>
                          <div className="flex flex-wrap gap-1">
                            {cat.popularSubjects.map(sub => (
                              <span key={sub} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <a
                          href={cat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>Open & Download Books</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopy(cat.url)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                          title="Copy direct portal link"
                        >
                          {copiedUrl === cat.url ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="hidden sm:inline">{copiedUrl === cat.url ? 'Copied' : 'Copy Link'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400 px-4">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {cat.popularSubjects.length} subjects &bull; Click Open to view and download
                      </span>
                      <a
                        href={cat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                      >
                        Direct Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ALL DIRECT LINKS SUMMARY CARD */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black uppercase text-amber-300">
                  REB e-Learning Direct Category Links
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                Official REB Server 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {REB_BOOK_CATEGORIES.map(cat => (
                <a
                  key={`link_${cat.id}`}
                  href={cat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2 text-slate-300 hover:text-white transition-all group"
                >
                  <span className="truncate font-sans font-bold text-slate-200 text-xs">{cat.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-800">
              Teacher Lesson Plans & Examination Generator — Powered by Rwanda Education Board (REB) standard curriculum 2026.
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600 font-medium shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>REB E-LEARNING DIGITAL LIBRARY (2026)</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
