import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  subject: string;
  source: string;
  preparationTip: string;
}

const DEFAULT_MATERIALS: MaterialItem[] = [
  {
    id: 'm-1',
    name: 'Plastic Bottle Caps (Counters)',
    category: 'Improvised Counters',
    subject: 'Mathematics',
    source: 'Collected from clean soda/water bottles at home or school canteen',
    preparationTip: 'Wash thoroughly with soap and water, group in batches of 10 or 100 for place value.'
  },
  {
    id: 'm-2',
    name: 'Cardboard Fraction Circles / Strips',
    category: 'Visual Fractions',
    subject: 'Mathematics',
    source: 'Cardboard carton boxes or manila paper cut with scissors',
    preparationTip: 'Color code 1/2 (blue), 1/4 (red), 1/8 (yellow) for tactile fraction comparisons.'
  },
  {
    id: 'm-3',
    name: 'Plant Leaves & Seed Collections',
    category: 'Natural Specimens',
    subject: 'Science & SET',
    source: 'School garden or local community surroundings',
    preparationTip: 'Label leaf venation patterns (parallel vs network) or monocot/dicot seeds in clear bottles.'
  },
  {
    id: 'm-4',
    name: 'Vocabulary Flashcards on Carton Backs',
    category: 'Word Wall',
    subject: 'Languages (English/Kinyarwanda)',
    source: 'Cereal boxes or old calendar backs cut into 10x15cm cards',
    preparationTip: 'Write target vocabulary on front and definition/sentence prompt on back.'
  },
  {
    id: 'm-5',
    name: 'Clay & Plasticine Geographical Relief Models',
    category: '3D Topography',
    subject: 'Social Studies & Geography',
    source: 'Clean local clay soil mixed with water and dried in shade',
    preparationTip: 'Model Rwandan physical features: volcanic peaks, undulating hills, valleys, and lakes.'
  }
];

export const TeachingMaterialsStudio: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>(DEFAULT_MATERIALS);
  const [filterSubject, setFilterSubject] = useState<string>('All');
  
  // New item state
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [source, setSource] = useState<string>('');
  const [preparationTip, setPreparationTip] = useState<string>('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subjects = ['All', 'Mathematics', 'Science & SET', 'Languages', 'Social Studies & Geography', 'Creative Arts'];

  const filtered = materials.filter(m => filterSubject === 'All' || m.subject.includes(filterSubject));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: MaterialItem = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'Classroom Improvised',
      subject,
      source: source.trim() || 'Local environment / everyday items',
      preparationTip: preparationTip.trim() || 'Ready for learner hands-on inquiry.'
    };

    setMaterials([newItem, ...materials]);
    setName('');
    setCategory('');
    setSource('');
    setPreparationTip('');
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleCopy = (m: MaterialItem) => {
    const text = `Teaching Material: ${m.name}\nSubject: ${m.subject}\nCategory: ${m.category}\nSource: ${m.source}\nPreparation Tip: ${m.preparationTip}`;
    navigator.clipboard.writeText(text);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              LOW-COST & IMPROVISED AIDS
            </span>
            <span className="text-teal-300 font-bold text-xs">Hands-on CBC Learning</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            🧩 Teaching Materials & Low-Cost Improvisation Studio
          </h2>
          <p className="text-xs text-slate-300">
            Catalog and generate low-cost, locally improvised teaching aids and manipulatives from everyday materials in Rwanda.
          </p>
        </div>
      </div>

      {/* ADD NEW MATERIAL FORM */}
      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Low-Cost Teaching Aid</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">1. Material Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Cardboard Abacus" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">2. Subject</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Science & SET">Science & SET</option>
              <option value="Languages">Languages</option>
              <option value="Social Studies & Geography">Social Studies & Geography</option>
              <option value="Creative Arts">Creative Arts</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">3. Category</label>
            <input 
              type="text" 
              placeholder="e.g. Counters, 3D Models" 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">4. Everyday Source</label>
            <input 
              type="text" 
              placeholder="e.g. Empty egg crates, wires" 
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">5. Preparation & Classroom Usage Tip</label>
            <input 
              type="text" 
              placeholder="How to construct and use in lesson activities..." 
              value={preparationTip}
              onChange={e => setPreparationTip(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Add Material
          </button>
        </div>
      </form>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setFilterSubject(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterSubject === s
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* MATERIALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m, idx) => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 transition-all hover:shadow-xl group">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {m.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {m.category}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                  {idx + 1}. {m.name}
                </h4>
              </div>

              <button 
                onClick={() => handleDelete(m.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Delete Material"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
              <p className="text-slate-300">
                <strong className="text-amber-300">Source:</strong> {m.source}
              </p>
              <p className="text-slate-300">
                <strong className="text-teal-300">Classroom Tip:</strong> {m.preparationTip}
              </p>
            </div>

            <button
              onClick={() => handleCopy(m)}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-950 hover:bg-amber-950/60 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedId === m.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Details for Lesson Plan</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
