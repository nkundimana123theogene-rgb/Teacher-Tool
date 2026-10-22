import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  FolderClosed, 
  FolderOpen
} from 'lucide-react';
import { REB_BOOK_CATEGORIES } from './RebBooksModal';

interface RebBooksPageViewProps {
  onBackToDashboard: () => void;
}

export const RebBooksPageView: React.FC<RebBooksPageViewProps> = ({ onBackToDashboard }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [closedCategories, setClosedCategories] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    REB_BOOK_CATEGORIES.forEach(c => { map[c.id] = true; });
    return map;
  });
  const [selectedSubjectFilter] = useState<string>('all');

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
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopyAll = () => {
    const text = REB_BOOK_CATEGORIES.map(c => `${c.title} (${c.subtitle}):\nLink: ${c.url}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Filter categories by search query and subject
  const filteredCategories = REB_BOOK_CATEGORIES.filter(category => {
    const matchesSearch = 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.popularSubjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = 
      selectedSubjectFilter === 'all' || 
      category.popularSubjects.some(s => s.toLowerCase().includes(selectedSubjectFilter.toLowerCase()));

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* HEADER & SEARCH BAR */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
              <BookOpen className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  REB 2026 DIGITAL LIBRARY
                </span>
                <span className="text-amber-400 text-xs font-bold">Official REB E-Learning Books & Syllabi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                REB Curriculum Books & Syllabi (2026 CBC)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All Links</span>
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              &larr; Dashboard
            </button>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search book, subject (Mathematics, English, Physics, SET...), or education level..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAllCategories}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Open All</span>
            </button>
            <button
              onClick={closeAllCategories}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <FolderClosed className="w-3.5 h-3.5 text-slate-400" />
              <span>Close All</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORIES LIST */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const isClosed = closedCategories[category.id];
          return (
            <div 
              key={category.id}
              className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-4"
            >
              <div 
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {category.title}
                      </h3>
                      <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {category.categoryCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{category.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white">
                    {isClosed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {!isClosed && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-fade-in">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {category.description}
                  </p>

                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      Available Subjects & Curriculum Books:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.popularSubjects.map((subj, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          📖 {subj}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={category.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                      <span>Open REB Official Portal &rarr;</span>
                    </a>

                    <button
                      onClick={() => handleCopy(category.url)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedUrl === category.url ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
