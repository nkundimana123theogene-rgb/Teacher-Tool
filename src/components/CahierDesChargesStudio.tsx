import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Trash2, Printer, Copy, Check } from 'lucide-react';

interface SchemeEntry {
  id: string;
  week: number;
  dates: string;
  unitTopic: string;
  periods: number;
  competence: string;
  learningActivities: string;
  resources: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

const DEFAULT_SCHEME: SchemeEntry[] = [
  {
    id: 's-1',
    week: 1,
    dates: '18/08/2026 - 22/08/2026',
    unitTopic: 'Unit 1: Addition of numbers up to 100,000 with carrying',
    periods: 5,
    competence: 'Solve real-life mathematical calculations involving carrying in place values.',
    learningActivities: 'Group work using bottle cap counters, vertical column addition practice, pair problem solving.',
    resources: 'REB P5 Mathematics Pupil Book, counters, place value charts.',
    status: 'In Progress'
  },
  {
    id: 's-2',
    week: 2,
    dates: '25/08/2026 - 29/08/2026',
    unitTopic: 'Unit 1: Subtraction of numbers up to 100,000 with borrowing',
    periods: 5,
    competence: 'Accurately subtract multidigit numbers with borrowing across zeros.',
    learningActivities: 'Step-by-step regrouping exercises, peer verification, word problem solving.',
    resources: 'Abacus, number cards, chalkboard grid.',
    status: 'Upcoming'
  },
  {
    id: 's-3',
    week: 3,
    dates: '01/09/2026 - 05/09/2026',
    unitTopic: 'Unit 2: Multiplication by 2-digit and 3-digit numbers',
    periods: 5,
    competence: 'Apply lattice and standard vertical algorithms to multiply whole numbers.',
    learningActivities: 'Times table speed drills, lattice multiplication grids, market trade simulation.',
    resources: 'Multiplication charts, play money.',
    status: 'Upcoming'
  }
];

export const CahierDesChargesStudio: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>('2026');
  const [term, setTerm] = useState<string>('Term 1');
  const [schoolName, setSchoolName] = useState<string>('G.S. MAYANGE B');
  const [teacherName, setTeacherName] = useState<string>('NKUNDIMANA Theogene');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [gradeLevel, setGradeLevel] = useState<string>('Primary 5 (P5)');
  
  const [entries, setEntries] = useState<SchemeEntry[]>(DEFAULT_SCHEME);
  const [copied, setCopied] = useState<boolean>(false);

  // New entry form state
  const [week, setWeek] = useState<number>(4);
  const [dates, setDates] = useState<string>('08/09/2026 - 12/09/2026');
  const [unitTopic, setUnitTopic] = useState<string>('');
  const [periods, setPeriods] = useState<number>(5);
  const [competence, setCompetence] = useState<string>('');
  const [learningActivities, setLearningActivities] = useState<string>('');
  const [resources, setResources] = useState<string>('REB Textbook, Manila charts');

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitTopic.trim()) return;

    const newEntry: SchemeEntry = {
      id: `s-${Date.now()}`,
      week,
      dates,
      unitTopic,
      periods,
      competence: competence.trim() || 'Attain target CBC learning objectives.',
      learningActivities: learningActivities.trim() || 'Interactive learner-centered classroom tasks.',
      resources: resources.trim() || 'REB Pupil Books and local teaching aids.',
      status: 'Upcoming'
    };

    setEntries([...entries, newEntry]);
    setWeek(week + 1);
    setUnitTopic('');
    setCompetence('');
    setLearningActivities('');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyScheme = () => {
    let text = `=====================================================\n`;
    text += `REPUBLIC OF RWANDA - MINISTRY OF EDUCATION\n`;
    text += `OFFICIAL CAHIER DES CHARGES / SCHEME OF WORK\n`;
    text += `School: ${schoolName} | Year: ${academicYear} | ${term}\n`;
    text += `Teacher: ${teacherName} | Subject: ${subject} | Class: ${gradeLevel}\n`;
    text += `=====================================================\n\n`;

    entries.forEach(e => {
      text += `WEEK ${e.week} (${e.dates}) [${e.periods} Periods] - Status: ${e.status}\n`;
      text += `Topic: ${e.unitTopic}\n`;
      text += `Competence: ${e.competence}\n`;
      text += `Activities: ${e.learningActivities}\n`;
      text += `Resources: ${e.resources}\n`;
      text += `-----------------------------------------------------\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              OFFICIAL TEACHER RECORD
            </span>
            <span className="text-amber-300 font-bold text-xs">REB 2026 Academic Year</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            📋 Cahier des Charges & Scheme of Work Studio
          </h2>
          <p className="text-xs text-slate-300">
            Official term schemes of work, weekly periods breakdown, learning activities, and lesson delivery logbook.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyScheme}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY SCHEME'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF</span>
          </button>
        </div>
      </div>

      {/* METADATA BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">School</label>
          <input 
            type="text" 
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teacher</label>
          <input 
            type="text" 
            value={teacherName}
            onChange={e => setTeacherName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject</label>
          <input 
            type="text" 
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Class</label>
          <input 
            type="text" 
            value={gradeLevel}
            onChange={e => setGradeLevel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Academic Year</label>
          <input 
            type="text" 
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Term</label>
          <select
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-white focus:border-amber-400 focus:outline-none"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
      </div>

      {/* SCHEME TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Scheme of Work Table ({entries.length} Weeks Planned)</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono font-bold">
            Total Periods: {entries.reduce((sum, e) => sum + e.periods, 0)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="p-3 w-16">Week</th>
                <th className="p-3 w-28">Dates</th>
                <th className="p-3 w-1/4">Unit & Topic</th>
                <th className="p-3 w-1/4">Key Competence</th>
                <th className="p-3 w-1/4">Activities & Resources</th>
                <th className="p-3 w-20">Status</th>
                <th className="p-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-amber-400 align-top text-center">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-xs font-mono">
                      {e.week}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300 align-top">
                    {e.dates}
                  </td>
                  <td className="p-3 font-semibold text-white align-top">
                    <div className="font-bold">{e.unitTopic}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{e.periods} Periods</span>
                  </td>
                  <td className="p-3 text-slate-300 align-top leading-relaxed">
                    {e.competence}
                  </td>
                  <td className="p-3 text-slate-300 align-top space-y-1">
                    <p><strong className="text-slate-400 text-[10px]">Act:</strong> {e.learningActivities}</p>
                    <p><strong className="text-amber-400 text-[10px]">Res:</strong> {e.resources}</p>
                  </td>
                  <td className="p-3 align-top">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : e.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3 text-center align-top">
                    <button 
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete entry"
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

      {/* ADD ENTRY FORM */}
      <form onSubmit={handleAddEntry} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Weekly Scheme of Work Entry</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Week Number *</label>
            <input 
              type="number" 
              value={week}
              onChange={e => setWeek(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Periods *</label>
            <input 
              type="number" 
              min={1}
              max={20}
              value={periods}
              onChange={e => setPeriods(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date Range</label>
            <input 
              type="text" 
              placeholder="e.g. 08/09/2026 - 12/09/2026"
              value={dates}
              onChange={e => setDates(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Unit & Topic Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Unit 3: Fractions and Decimals"
              value={unitTopic}
              onChange={e => setUnitTopic(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Key Competence</label>
            <textarea
              rows={2}
              placeholder="Target competence learners should demonstrate..."
              value={competence}
              onChange={e => setCompetence(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Learning Activities</label>
            <textarea
              rows={2}
              placeholder="Inquiry activities, group tasks, practice..."
              value={learningActivities}
              onChange={e => setLearningActivities(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Learning Resources</label>
            <textarea
              rows={2}
              placeholder="REB books, charts, concrete manipulatives..."
              value={resources}
              onChange={e => setResources(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Save to Scheme of Work
          </button>
        </div>
      </form>

    </div>
  );
};
