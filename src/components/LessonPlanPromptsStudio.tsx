import React, { useState } from 'react';
import { Copy, Check, Search, Play } from 'lucide-react';
import { AiVideoTutorialModal } from './AiVideoTutorialModal';

interface PromptItem {
  id: string;
  category: string;
  title: string;
  description: string;
  promptText: string;
  tags: string[];
}

export const PROMPTS_DATA: PromptItem[] = [
  {
    id: 'p-obj-1',
    category: 'Objectives & Bloom',
    title: 'SMART Instructional Objectives (CBC)',
    description: 'Generates specific, measurable, achievable, relevant, and time-bound learning outcomes aligned with Bloom’s Revised Taxonomy.',
    promptText: 'Act as an expert Rwandan CBC Curriculum Developer. Formulate 3 SMART instructional objectives (Knowledge & Understanding, Skills, Attitudes & Values) for a [Class, e.g., Primary 5] lesson on [Topic, e.g., Calculating Area of Rectangles and Triangles in 40 minutes]. Ensure the verbs match Bloom\'s Taxonomy (e.g., Identify, Calculate, Appreciate) and are directly measurable through formative assessment.',
    tags: ['SMART', 'Bloom Verbs', 'Objectives']
  },
  {
    id: 'p-comp-1',
    category: 'Competencies',
    title: 'Core & Generic Competencies Scaffolding',
    description: 'Bridges lesson activities directly with Critical Thinking, Creativity, Research, Problem Solving, and Communication.',
    promptText: 'Design 3 learner-centered classroom learning activities for [Subject & Topic] that explicitly build: 1. Critical Thinking & Problem Solving (through guided inquiry puzzles), 2. Communication & Cooperation (through think-pair-share group tasks), and 3. ICT / Lifelong Learning. Detail the exact teacher instructions and expected student actions.',
    tags: ['Core Competence', 'Critical Thinking', 'Cooperation']
  },
  {
    id: 'p-intro-1',
    category: 'Lesson Steps',
    title: 'Differentiated Introductory Activity',
    description: 'A 5-minute engaging hook that connects prior knowledge with real-world Rwandan context.',
    promptText: 'Create a captivating 5-minute Introductory Activity for [Topic] in Rwandan primary/secondary school. Include a relatable local scenario (e.g., shopping at a local market, measuring a school farm plot, or observing weather in Rwanda). Add 2 guiding diagnostic questions to activate prior knowledge.',
    tags: ['Intro Hook', 'Prior Knowledge', '5 Min']
  },
  {
    id: 'p-scaff-1',
    category: 'Scaffolding & Remediation',
    title: '3-Tier Differentiated Scaffolding (Remedial, Consolidation, Extended)',
    description: 'Step-by-step tiered activities tailored for struggling, average, and fast learners.',
    promptText: 'Develop a 3-tier differentiated learning task for [Topic]:\n- Group 1 (Remedial / 4 learners): Concrete visual aids, step-by-step numbered instructions, teacher-guided prompts.\n- Group 2 (Consolidation / 5 learners): Standard practice problems with peer cross-checking.\n- Group 3 (Extended / 3 learners): Challenging word problem applying the concept to a real-life community problem.',
    tags: ['Remedial', 'Consolidation', 'Extended']
  },
  {
    id: 'p-eval-1',
    category: 'Assessment & Evaluation',
    title: 'Formative Assessment & Self-Evaluation Rubric',
    description: 'Exit tickets, check-for-understanding questions, and post-lesson self-evaluation criteria.',
    promptText: 'Generate a 5-minute lesson conclusion and exit-ticket assessment for [Topic]. Include 3 short questions (Low, Medium, High difficulty) to check individual student mastery. Also provide a structured Teacher Self-Evaluation framework with 3 reflection questions on student engagement, time management, and remedial progress.',
    tags: ['Exit Ticket', 'Formative Check', 'Self-Evaluation']
  },
  {
    id: 'p-cross-1',
    category: 'Cross-Cutting Issues',
    title: 'Cross-Cutting Issues Integration (Environment, Gender, Financial Ed)',
    description: 'Integrates REB cross-cutting themes naturally into the subject matter.',
    promptText: 'Show how to seamlessly integrate 2 REB Cross-Cutting Issues (such as Environmental Protection, Gender Equality, Financial Education, or Peace Values) into a lesson about [Topic]. Provide concrete classroom speaking prompts for the teacher.',
    tags: ['Environment', 'Gender', 'Financial Ed', 'Peace']
  }
];

export const LessonPlanPromptsStudio: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Custom prompt sandbox state
  const [customTopic, setCustomTopic] = useState<string>('Addition of Numbers with Carrying');
  const [customGrade, setCustomGrade] = useState<string>('Primary 5');
  const [customSubject, setCustomSubject] = useState<string>('Mathematics');

  const categories = ['All', 'Objectives & Bloom', 'Competencies', 'Lesson Steps', 'Scaffolding & Remediation', 'Assessment & Evaluation', 'Cross-Cutting Issues'];

  const filteredPrompts = PROMPTS_DATA.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    // Replace placeholders with custom values
    const populated = text
      .replace(/\[Topic.*?\]/g, customTopic)
      .replace(/\[Class.*?\]/g, customGrade)
      .replace(/\[Subject & Topic\]/g, `${customSubject} - ${customTopic}`);
    
    navigator.clipboard.writeText(populated);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 p-5 rounded-2xl border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              PROMPT ENGINEERING STUDIO
            </span>
            <span className="text-emerald-400 font-bold text-xs">REB 2026 CBC Ready</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            💡 Lesson Plan Prompts Workshop
          </h2>
          <p className="text-xs text-slate-300">
            Copy-ready, highly engineered pedagogical prompts to craft CBC lesson plans, Bloom's objectives, scaffolding, and rubrics.
          </p>
        </div>

        {/* TUTORIAL VIDEO TRIGGER & QUICK CUSTOMIZATION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>🎥 Video Tutorial: How to Use AI Prompts</span>
          </button>

          {/* QUICK CUSTOMIZATION INPUTS */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-wrap gap-2 text-xs">
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">1. Subject</label>
              <input 
                type="text" 
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs w-28 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">2. Class</label>
              <input 
                type="text" 
                value={customGrade}
                onChange={e => setCustomGrade(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs w-24 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">3. Lesson Topic</label>
              <input 
                type="text" 
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs w-44 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
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
            placeholder="Search prompts or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-slate-950 text-white placeholder-slate-500 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:border-blue-400 focus:outline-none w-full md:w-56"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* PROMPTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((prompt, promptIdx) => (
          <div 
            key={prompt.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-xl group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {prompt.category}
                </span>
                <div className="flex gap-1">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                {promptIdx + 1}. {prompt.title}
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                {prompt.description}
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto leading-normal">
                {prompt.promptText}
              </div>
            </div>

            <button
              onClick={() => handleCopy(prompt.promptText, prompt.id)}
              className={`w-full py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                copiedId === prompt.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white hover:scale-[1.01] active:scale-95'
              }`}
            >
              {copiedId === prompt.id ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>COPIED WITH CUSTOM PARAMS!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY PROMPT TO CLIPBOARD</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* VIDEO AI PROMPTS TUTORIAL MODAL */}
      <AiVideoTutorialModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

    </div>
  );
};
