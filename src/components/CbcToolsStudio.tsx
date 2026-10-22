import React, { useState } from 'react';
import { Check, Clock, Layers, Sparkles } from 'lucide-react';

interface BloomLevel {
  level: string;
  description: string;
  verbs: string[];
  color: string;
}

const BLOOM_LEVELS: BloomLevel[] = [
  {
    level: '1. Remembering',
    description: 'Recalling relevant knowledge from long-term memory.',
    verbs: ['Define', 'Describe', 'Identify', 'Label', 'List', 'Match', 'Name', 'Recall', 'State'],
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-300'
  },
  {
    level: '2. Understanding',
    description: 'Constructing meaning from instructional messages (interpreting, classifying, explaining).',
    verbs: ['Classify', 'Compare', 'Explain', 'Illustrate', 'Interpret', 'Paraphrase', 'Summarize', 'Translate'],
    color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40 text-cyan-300'
  },
  {
    level: '3. Applying',
    description: 'Carrying out or using a procedure in a given situation.',
    verbs: ['Apply', 'Calculate', 'Demonstrate', 'Examine', 'Implement', 'Modify', 'Solve', 'Use'],
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300'
  },
  {
    level: '4. Analyzing',
    description: 'Breaking material into constituent parts and determining how parts relate.',
    verbs: ['Analyze', 'Categorize', 'Differentiate', 'Discriminate', 'Distinguish', 'Organize', 'Deconstruct'],
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300'
  },
  {
    level: '5. Evaluating',
    description: 'Making judgments based on criteria and standards (critiquing, assessing).',
    verbs: ['Appraise', 'Argue', 'Assess', 'Critique', 'Defend', 'Evaluate', 'Judge', 'Justify', 'Select'],
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300'
  },
  {
    level: '6. Creating',
    description: 'Putting elements together to form a novel, coherent whole or original product.',
    verbs: ['Construct', 'Create', 'Design', 'Develop', 'Formulate', 'Generate', 'Plan', 'Produce'],
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300'
  }
];

const REB_CORE_COMPETENCIES = [
  { name: 'Critical Thinking', desc: 'Reasoning logically, evaluating evidence, and solving complex problems.', icon: '🧠' },
  { name: 'Creativity & Innovation', desc: 'Generating novel ideas and crafting original solutions.', icon: '💡' },
  { name: 'Research & Problem Solving', desc: 'Investigating phenomena, gathering data, and resolving inquiries.', icon: '🔍' },
  { name: 'Communication', desc: 'Expressing ideas clearly in official languages (English, Kinyarwanda, French).', icon: '🗣️' },
  { name: 'Cooperation & Interpersonal', desc: 'Working effectively in diverse teams and peer groups.', icon: '🤝' },
  { name: 'Lifelong Learning', desc: 'Cultivating curiosity, self-study, and continuous growth.', icon: '📚' }
];

export const CbcToolsStudio: React.FC = () => {
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number>(40);

  const introPercent = 15;
  const devPercent = 65;
  const conclPercent = 20;

  const introMin = Math.round((totalMinutes * introPercent) / 100);
  const devMin = Math.round((totalMinutes * devPercent) / 100);
  const conclMin = totalMinutes - introMin - devMin;

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 2000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 p-5 rounded-2xl border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              CBC PEDAGOGY TOOLKIT
            </span>
            <span className="text-cyan-300 font-bold text-xs">REB Rwandan Standards</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            🛠️ CBC Competence & Taxonomy Matrix
          </h2>
          <p className="text-xs text-slate-300">
            Interactive Bloom's taxonomy action verbs, Core Competencies matrix, and Lesson Timing Allocator.
          </p>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE LESSON TIMING CALCULATOR */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">1. Interactive Lesson Timing Allocator</h3>
          </div>
          <div className="flex items-center gap-2">
            {[40, 80, 50, 100].map(m => (
              <button
                key={m}
                onClick={() => setTotalMinutes(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  totalMinutes === m
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {m} Min {m === 80 ? '(Double Period)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase text-teal-400">Step 1: Introduction ({introPercent}%)</span>
            <h4 className="text-xl font-black text-white">{introMin} Minutes</h4>
            <p className="text-slate-400 text-[11px]">Hook, activating prior knowledge, diagnostic check.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-400">Step 2: Lesson Development ({devPercent}%)</span>
            <h4 className="text-xl font-black text-white">{devMin} Minutes</h4>
            <p className="text-slate-400 text-[11px]">Learner inquiry, group activity, scaffolding, demonstration.</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-400">Step 3: Conclusion & Evaluation ({conclPercent}%)</span>
            <h4 className="text-xl font-black text-white">{conclMin} Minutes</h4>
            <p className="text-slate-400 text-[11px]">Summary synthesis, exit tickets, teacher self-evaluation.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: BLOOM'S TAXONOMY ACTION VERBS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>2. Bloom's Revised Taxonomy Action Verbs (Click any verb to copy)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOOM_LEVELS.map(item => (
            <div 
              key={item.level}
              className={`bg-slate-900 border rounded-2xl p-4 space-y-3 bg-gradient-to-br ${item.color}`}
            >
              <div>
                <h4 className="font-black text-sm text-white">{item.level}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{item.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.verbs.map(verb => (
                  <button
                    key={verb}
                    onClick={() => handleCopyVerb(verb)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      copiedVerb === verb
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    {copiedVerb === verb ? <Check className="w-3 h-3" /> : null}
                    <span>{verb}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: REB CORE COMPETENCIES */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>3. Rwanda Education Board (REB) Core Competencies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {REB_CORE_COMPETENCIES.map((comp, compIdx) => (
            <div key={comp.name} className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center gap-2">
                <span className="text-lg">{comp.icon}</span>
                <h4 className="font-extrabold text-white">{compIdx + 1}. {comp.name}</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{comp.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
