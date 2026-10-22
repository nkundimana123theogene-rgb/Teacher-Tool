import React, { useState } from 'react';
import { Plus, Trash2, Award, BookOpen, ShieldCheck } from 'lucide-react';

interface CpdEntry {
  id: string;
  date: string;
  activityTitle: string;
  facilitator: string;
  hours: number;
  outcomes: string;
  status: 'Verified' | 'Pending';
}

const DEFAULT_CPD: CpdEntry[] = [
  {
    id: 'cpd-1',
    date: '12/07/2026',
    activityTitle: 'School-Based Mentorship: Remedial Teaching Strategies for CBC Mathematics',
    facilitator: 'Dean of Studies / SBM Coordinator',
    hours: 4,
    outcomes: 'Mastered 3-tier scaffolding and grouping methods for underperforming learners.',
    status: 'Verified'
  },
  {
    id: 'cpd-2',
    date: '28/07/2026',
    activityTitle: 'REB ICT in Education: Integrating Digital Tools and AI for Lesson Planning',
    facilitator: 'REB Sector ICT Trainer',
    hours: 6,
    outcomes: 'Learned prompt engineering for lesson objectives and assessment rubrics.',
    status: 'Verified'
  },
  {
    id: 'cpd-3',
    date: '05/08/2026',
    activityTitle: 'Special Needs Education (SNE) & Inclusive Classroom Practices',
    facilitator: 'District Education Officer (DEO)',
    hours: 3,
    outcomes: 'Enhanced methods for adapting visual and auditory aids for diverse learners.',
    status: 'Verified'
  }
];

export const ProfessionalRecordsStudio: React.FC = () => {
  const [cpdList, setCpdList] = useState<CpdEntry[]>(DEFAULT_CPD);
  const [activeTab, setActiveTab] = useState<'cpd' | 'observation' | 'ethics'>('cpd');

  // Form state
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('18/08/2026');
  const [facilitator, setFacilitator] = useState<string>('School-Based Mentor');
  const [hours, setHours] = useState<number>(3);
  const [outcomes, setOutcomes] = useState<string>('');

  const totalCpdHours = cpdList.reduce((sum, item) => sum + item.hours, 0);

  const handleAddCpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: CpdEntry = {
      id: `cpd-${Date.now()}`,
      date,
      activityTitle: title.trim(),
      facilitator: facilitator.trim() || 'Internal School Trainer',
      hours,
      outcomes: outcomes.trim() || 'Enhanced professional knowledge and teaching skills.',
      status: 'Verified'
    };

    setCpdList([newItem, ...cpdList]);
    setTitle('');
    setOutcomes('');
  };

  const handleDelete = (id: string) => {
    setCpdList(cpdList.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 p-5 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-cyan-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              TEACHER PORTFOLIO & CPD
            </span>
            <span className="text-cyan-300 font-bold text-xs">Professional Standards</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            📁 Professional Records & Continuous Development (CPD)
          </h2>
          <p className="text-xs text-slate-300">
            Track teacher professional growth, School-Based Mentorship hours, peer observations, and ethical codes.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 text-center shrink-0">
          <span className="text-[10px] uppercase text-slate-400 font-bold block">Total CPD Logged</span>
          <span className="text-xl font-black text-cyan-300 font-mono">{totalCpdHours} Hours</span>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cpd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cpd'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          🎓 Continuous Professional Development (CPD Log)
        </button>
        <button
          onClick={() => setActiveTab('observation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'observation'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          👁️ Classroom Observation & Evaluation Form
        </button>
        <button
          onClick={() => setActiveTab('ethics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ethics'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          ⚖️ Rwanda Teacher Code of Conduct & Ethics
        </button>
      </div>

      {/* TAB 1: CPD LOG */}
      {activeTab === 'cpd' && (
        <div className="space-y-5">
          {/* CPD TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>CPD Activity Logbook ({cpdList.length} Sessions)</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-bold">REB Accreditation Ready</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="p-3 w-28">Date</th>
                    <th className="p-3 w-1/3">Activity Title</th>
                    <th className="p-3 w-1/4">Facilitator / Organization</th>
                    <th className="p-3 w-20 text-center">Hours</th>
                    <th className="p-3 w-1/4">Key Learning Outcomes</th>
                    <th className="p-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {cpdList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-300 align-top">
                        {item.date}
                      </td>
                      <td className="p-3 font-bold text-white align-top">
                        {item.activityTitle}
                      </td>
                      <td className="p-3 text-slate-300 align-top">
                        {item.facilitator}
                      </td>
                      <td className="p-3 text-center align-top font-mono font-bold text-cyan-300">
                        {item.hours}h
                      </td>
                      <td className="p-3 text-slate-300 align-top leading-relaxed text-[11px]">
                        {item.outcomes}
                      </td>
                      <td className="p-3 text-center align-top">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete CPD"
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

          {/* ADD CPD FORM */}
          <form onSubmit={handleAddCpd} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Log New CPD / Mentorship Activity</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date</label>
                <input 
                  type="text" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hours Spent</label>
                <input 
                  type="number" 
                  value={hours}
                  onChange={e => setHours(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Facilitator / Trainer</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sector Education Inspector (SEI) / SBM"
                  value={facilitator}
                  onChange={e => setFacilitator(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Activity Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Workshop on Competence-Based Assessment"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Key Outcomes & Application</label>
                <input 
                  type="text" 
                  placeholder="How will this improve classroom teaching..."
                  value={outcomes}
                  onChange={e => setOutcomes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Save CPD Activity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: OBSERVATION */}
      {activeTab === 'observation' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 text-xs">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Classroom Observation & Pedagogical Evaluation Criteria (REB)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-cyan-300 uppercase text-[11px]">1. Lesson Preparation & Documentation (25%)</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                <li>Detailed CBC Lesson Plan available with SMART objectives.</li>
                <li>Clear alignment with REB 2026 syllabus and scheme of work.</li>
                <li>Availability of low-cost teaching aids & learner manipulatives.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-emerald-300 uppercase text-[11px]">2. Learner-Centered Delivery (35%)</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                <li>Active student participation in inquiry, pair work, or groups.</li>
                <li>Teacher acts as facilitator, guiding and probing with open questions.</li>
                <li>Inclusive attention to struggling (remedial) and gifted learners.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-amber-300 uppercase text-[11px]">3. Classroom Management & Time (20%)</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                <li>Strict adherence to the 40/80 minute lesson timing breakdown.</li>
                <li>Positive discipline, encouraging praise, and orderly transitions.</li>
                <li>Safe, clean, and organized learning environment.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-amber-300 uppercase text-[11px]">4. Formative Assessment & Evaluation (20%)</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                <li>Continuous checking of understanding and exit-ticket feedback.</li>
                <li>Instant constructive corrections without discouraging learners.</li>
                <li>Thorough post-lesson teacher self-evaluation noted in lesson plan.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ETHICS */}
      {activeTab === 'ethics' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 text-xs leading-relaxed">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Rwanda Teacher Professional Code of Conduct & Values</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-emerald-400 uppercase text-[11px]">Punctuality & Integrity</h4>
              <p className="text-slate-300 text-[11px]">
                Arriving promptly for every scheduled period, completing lesson preparations in advance, and upholding honesty in student grading and examination records.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-blue-400 uppercase text-[11px]">Child Protection & Equality</h4>
              <p className="text-slate-300 text-[11px]">
                Zero tolerance for physical or psychological abuse. Providing equal dignity, respect, and learning encouragement to boys, girls, and learners with special needs.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-amber-400 uppercase text-[11px]">Lifelong Professionalism</h4>
              <p className="text-slate-300 text-[11px]">
                Active participation in School-Based Mentorship, continuous digital upskilling, and collaborating respectfully with parents, school leadership, and local communities.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
