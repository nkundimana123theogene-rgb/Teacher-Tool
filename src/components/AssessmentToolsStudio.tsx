import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { sanitizeClonedDocForPdf } from '../utils/pdfSanitizer';
import { CheckSquare, Plus, Trash2, Copy, Check, Download, FileText } from 'lucide-react';

interface RubricCriterion {
  id: string;
  criterion: string;
  weight: string;
  excellent: string;
  satisfactory: string;
  needsSupport: string;
}

const DEFAULT_RUBRICS: RubricCriterion[] = [
  {
    id: 'r-1',
    criterion: 'Knowledge & Understanding (Concept Recall)',
    weight: '30%',
    excellent: 'Accurately defines concepts and solves all target problems without guidance.',
    satisfactory: 'Understands main principles with minor calculation errors.',
    needsSupport: 'Requires step-by-step teacher guidance and concrete visual manipulatives.'
  },
  {
    id: 'r-2',
    criterion: 'Practical Skill Execution (Procedure & Steps)',
    weight: '40%',
    excellent: 'Systematically follows proper algorithms, shows clear step-by-step working.',
    satisfactory: 'Follows procedure correctly but skips verification steps.',
    needsSupport: 'Struggles to order the operational steps sequentially.'
  },
  {
    id: 'r-3',
    criterion: 'Communication & Cooperative Presentation',
    weight: '20%',
    excellent: 'Clearly explains reasoning to peers using appropriate mathematical terminology.',
    satisfactory: 'Explains answer partially; understands procedure when prompted.',
    needsSupport: 'Hesitant to share thoughts; relies on peer assistance.'
  },
  {
    id: 'r-4',
    criterion: 'Attitudes, Values & Timeliness',
    weight: '10%',
    excellent: 'Actively engaged, completes work on time, encourages group members.',
    satisfactory: 'Participates well; finishes within the given time limit.',
    needsSupport: 'Needs encouragement to stay focused on the task.'
  }
];

export const AssessmentToolsStudio: React.FC = () => {
  const [rubricTitle, setRubricTitle] = useState<string>('Standard CBC Formative Assessment Rubric');
  const [assessmentType, setAssessmentType] = useState<string>('Formative');
  const [targetClass, setTargetClass] = useState<string>('Primary 5 (P5)');
  const [targetTopic, setTargetTopic] = useState<string>('Addition of Numbers with Carrying');
  const [criteria, setCriteria] = useState<RubricCriterion[]>(DEFAULT_RUBRICS);

  // New criterion state
  const [newCrit, setNewCrit] = useState<string>('');
  const [newWeight, setNewWeight] = useState<string>('20%');
  const [newExc, setNewExc] = useState<string>('');
  const [newSat, setNewSat] = useState<string>('');
  const [newNeed, setNewNeed] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrit.trim()) return;

    const item: RubricCriterion = {
      id: `crit-${Date.now()}`,
      criterion: newCrit.trim(),
      weight: newWeight.trim() || '20%',
      excellent: newExc.trim() || 'Mastery of target competence.',
      satisfactory: newSat.trim() || 'Acceptable progress with minor guidance.',
      needsSupport: newNeed.trim() || 'Needs remedial scaffolding.'
    };

    setCriteria([...criteria, item]);
    setNewCrit('');
    setNewExc('');
    setNewSat('');
    setNewNeed('');
  };

  const handleDelete = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleCopyFullRubric = () => {
    let text = `=====================================================\n`;
    text += `RWANDA CBC ASSESSMENT RUBRIC\n`;
    text += `Type: ${assessmentType} | Class: ${targetClass} | Topic: ${targetTopic}\n`;
    text += `Title: ${rubricTitle}\n`;
    text += `=====================================================\n\n`;

    criteria.forEach((c, idx) => {
      text += `${idx + 1}. CRITERION: ${c.criterion} (${c.weight})\n`;
      text += `   - Level 3 (Excellent / Exceeding): ${c.excellent}\n`;
      text += `   - Level 2 (Satisfactory / Meeting): ${c.satisfactory}\n`;
      text += `   - Level 1 (Needs Support / Remedial): ${c.needsSupport}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadRubric = () => {
    let text = `=====================================================\n`;
    text += `RWANDA CBC ASSESSMENT RUBRIC\n`;
    text += `Type: ${assessmentType} | Class: ${targetClass} | Topic: ${targetTopic}\n`;
    text += `Title: ${rubricTitle}\n`;
    text += `=====================================================\n\n`;

    criteria.forEach((c, idx) => {
      text += `${idx + 1}. CRITERION: ${c.criterion} (${c.weight})\n`;
      text += `   - Level 3 (Excellent / Exceeding): ${c.excellent}\n`;
      text += `   - Level 2 (Satisfactory / Meeting): ${c.satisfactory}\n`;
      text += `   - Level 1 (Needs Support / Remedial): ${c.needsSupport}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Assessment_Rubric_${targetClass.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRubricPdf = () => {
    const element = document.getElementById('rubric-export-container');
    if (!element) return;
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#111827';
    clone.style.padding = '20px';
    clone.style.fontFamily = 'sans-serif';

    const allEls = clone.querySelectorAll('*');
    allEls.forEach((el: any) => {
      try {
        if (el.removeAttribute) {
          el.removeAttribute('class');
        }
      } catch (e) {
        // ignore svg animated string read-only error
      }
      if (el.style) {
        el.style.backgroundColor = '#ffffff';
        el.style.color = '#111827';
        el.style.borderColor = '#cbd5e1';
      }
    });

    const opt = {
      margin: 10,
      filename: `Assessment_Rubric_${targetClass.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, onclone: (doc: Document) => sanitizeClonedDocForPdf(doc) },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    (html2pdf as any)().from(clone).set(opt).save();
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-emerald-950 p-5 rounded-2xl border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              ASSESSMENT & EVALUATION
            </span>
            <span className="text-emerald-300 font-bold text-xs">Competency-Based Evaluation</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            📊 Assessment Tools & Rubric Generator
          </h2>
          <p className="text-xs text-slate-300">
            Build and print diagnostic tests, formative observation rubrics, and 3-tier remedial grading sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadRubricPdf}
            className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>DOWNLOAD PDF</span>
          </button>
          <button
            onClick={handleDownloadRubric}
            className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer border border-slate-700 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>RUBRIC (.TXT)</span>
          </button>
          <button
            onClick={handleCopyFullRubric}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-rose-600 to-emerald-600 hover:from-rose-500 hover:to-emerald-500 text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'RUBRIC COPIED!' : 'COPY COMPLETE RUBRIC'}</span>
          </button>
        </div>
      </div>

      {/* METADATA FORM */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">1. Assessment Type</label>
          <select 
            value={assessmentType}
            onChange={e => setAssessmentType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-rose-400 focus:outline-none"
          >
            <option value="Formative (Continuous)">Formative (Continuous)</option>
            <option value="Diagnostic (Pre-Assessment)">Diagnostic (Pre-Assessment)</option>
            <option value="Summative (End of Unit)">Summative (End of Unit)</option>
            <option value="Peer / Self-Assessment">Peer / Self-Assessment</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">2. Target Class</label>
          <input 
            type="text" 
            value={targetClass}
            onChange={e => setTargetClass(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-rose-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">3. Lesson Topic</label>
          <input 
            type="text" 
            value={targetTopic}
            onChange={e => setTargetTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-rose-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">4. Rubric Title</label>
          <input 
            type="text" 
            value={rubricTitle}
            onChange={e => setRubricTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-rose-400 focus:outline-none"
          />
        </div>
      </div>

      {/* RUBRIC TABLE */}
      <div id="rubric-export-container" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-rose-400" />
            <span>Rubric Matrix ({criteria.length} Evaluation Criteria)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">REB Standard 3-Tier Proficiency</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="p-3 w-1/4">Criterion & Weight</th>
                <th className="p-3 w-1/4 text-emerald-400">Level 3: Exceeding / Excellent</th>
                <th className="p-3 w-1/4 text-amber-400">Level 2: Meeting / Satisfactory</th>
                <th className="p-3 w-1/4 text-rose-400">Level 1: Remedial / Needs Support</th>
                <th className="p-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {criteria.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-white align-top">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-rose-400 font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-bold">{c.criterion}</span>
                    </div>
                    <span className="inline-block bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      Weight: {c.weight}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 align-top leading-relaxed bg-emerald-950/10">
                    {c.excellent}
                  </td>
                  <td className="p-3 text-slate-300 align-top leading-relaxed bg-amber-950/10">
                    {c.satisfactory}
                  </td>
                  <td className="p-3 text-slate-300 align-top leading-relaxed bg-rose-950/10">
                    {c.needsSupport}
                  </td>
                  <td className="p-3 text-center align-top">
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete criterion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW CRITERION ROW */}
      <form onSubmit={handleAddCriterion} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Evaluation Criterion</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">1. Criterion Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Critical Thinking & Problem Solving"
              value={newCrit}
              onChange={e => setNewCrit(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-rose-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">2. Weight (%)</label>
            <input 
              type="text" 
              placeholder="e.g. 25%"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-rose-400 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Add Criterion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">3. Level 3 (Exceeding)</label>
            <textarea
              rows={2}
              placeholder="Performance descriptor for full mastery..."
              value={newExc}
              onChange={e => setNewExc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-amber-400 block mb-1">4. Level 2 (Meeting)</label>
            <textarea
              rows={2}
              placeholder="Performance descriptor for satisfactory..."
              value={newSat}
              onChange={e => setNewSat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-rose-400 block mb-1">5. Level 1 (Needs Support)</label>
            <textarea
              rows={2}
              placeholder="Performance descriptor for remedial..."
              value={newNeed}
              onChange={e => setNewNeed(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:border-rose-400 focus:outline-none"
            />
          </div>
        </div>
      </form>

    </div>
  );
};
