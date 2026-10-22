import React, { useState } from 'react';
import { Download, ExternalLink, Search } from 'lucide-react';

interface OfficialDoc {
  id: string;
  title: string;
  category: string;
  fileFormat: string;
  size: string;
  description: string;
  downloadUrl?: string;
  externalUrl?: string;
  badge: string;
}

const OFFICIAL_DOCS: OfficialDoc[] = [
  {
    id: 'doc-1',
    title: 'Competence-Based Curriculum (CBC) Policy Framework 2026',
    category: 'National Curriculum Policy',
    fileFormat: 'PDF',
    size: '3.4 MB',
    description: 'The official national curriculum guidance document from MINEDUC/REB establishing learning outcomes and generic competencies.',
    externalUrl: 'https://elearning.reb.rw',
    badge: 'MINEDUC / REB'
  },
  {
    id: 'doc-2',
    title: 'Standard Primary (P1 - P6) Lesson Plan Official Template',
    category: 'Templates & Schemes',
    fileFormat: 'DOCX / PDF',
    size: '1.2 MB',
    description: 'Official 7-step CBC lesson plan template with Bloom verbs, scaffolded remedial grouping, and teacher reflection.',
    externalUrl: 'https://elearning.reb.rw',
    badge: 'REB Standard'
  },
  {
    id: 'doc-3',
    title: 'Teacher Code of Professional Ethics & Conduct 2026',
    category: 'Professional Ethics',
    fileFormat: 'PDF',
    size: '1.8 MB',
    description: 'Comprehensive guidelines on teacher integrity, child safeguarding, equality, and professional standards in Rwanda.',
    externalUrl: 'https://elearning.reb.rw',
    badge: 'Official Ethics'
  },
  {
    id: 'doc-4',
    title: 'School-Based Mentorship (SBM) Implementation Guidelines',
    category: 'Teacher Development',
    fileFormat: 'PDF',
    size: '2.6 MB',
    description: 'Operational handbook for School-Based Mentors, peer learning circles, and teacher continuous professional development (CPD).',
    externalUrl: 'https://elearning.reb.rw',
    badge: 'SBM Toolkit'
  },
  {
    id: 'doc-5',
    title: 'ICT in Education & Blended Learning Guidelines',
    category: 'Digital Pedagogy',
    fileFormat: 'PDF',
    size: '4.1 MB',
    description: 'Framework for integrating computers, tablets, projector simulations, and smart AI tools into daily Rwandan classrooms.',
    externalUrl: 'https://elearning.reb.rw',
    badge: 'REB ICT'
  }
];

export const TeacherDocumentsStudio: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'National Curriculum Policy', 'Templates & Schemes', 'Professional Ethics', 'Teacher Development', 'Digital Pedagogy'];

  const filtered = OFFICIAL_DOCS.filter(d => {
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = !search.trim() || 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              OFFICIAL ARCHIVE & GUIDELINES
            </span>
            <span className="text-blue-300 font-bold text-xs">MINEDUC / REB Directives</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            📄 Teacher Documents & Policy Archive
          </h2>
          <p className="text-xs text-slate-300">
            Access official Rwanda Education Board directives, lesson plan templates, SBM guidelines, and curriculum policies.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-950 text-white placeholder-slate-500 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:border-blue-400 focus:outline-none w-full md:w-56"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(doc => (
          <div 
            key={doc.id}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {doc.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {doc.fileFormat} • {doc.size}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {doc.description}
              </p>
            </div>

            <a
              href={doc.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-blue-600 border border-slate-700/60 hover:border-blue-500 text-slate-200 hover:text-white flex items-center justify-center gap-2 text-xs font-black transition-all shadow-md group/btn cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
              <span>ACCESS & DOWNLOAD VIA REB PORTAL</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white" />
            </a>
          </div>
        ))}
      </div>

    </div>
  );
};
