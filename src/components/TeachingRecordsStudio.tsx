import React, { useState } from 'react';
import { Plus, Trash2, Printer, Copy, Check, Calculator } from 'lucide-react';

interface StudentMark {
  id: string;
  name: string;
  gender: 'M' | 'F';
  test1: number; // /20
  test2: number; // /20
  exam: number;  // /60
}

const DEFAULT_STUDENTS: StudentMark[] = [
  { id: 'st-1', name: 'UWIMANA Divine', gender: 'F', test1: 18, test2: 19, exam: 54 },
  { id: 'st-2', name: 'MUGISHA Eric', gender: 'M', test1: 15, test2: 17, exam: 48 },
  { id: 'st-3', name: 'ISHIMWE Kevin', gender: 'M', test1: 12, test2: 14, exam: 38 },
  { id: 'st-4', name: 'INGABIRE Sandrine', gender: 'F', test1: 19, test2: 20, exam: 58 },
  { id: 'st-5', name: 'MUTANGANA Jean', gender: 'M', test1: 9, test2: 11, exam: 26 },
  { id: 'st-6', name: 'KEZA Ange', gender: 'F', test1: 14, test2: 15, exam: 44 }
];

export const TeachingRecordsStudio: React.FC = () => {
  const [students, setStudents] = useState<StudentMark[]>(DEFAULT_STUDENTS);
  const [subject, setSubject] = useState<string>('Mathematics');
  const [className, setClassName] = useState<string>('Primary 5 (P5)');
  const [term, setTerm] = useState<string>('Term 1 - 2026');

  // Form state
  const [newName, setNewName] = useState<string>('');
  const [newGender, setNewGender] = useState<'M' | 'F'>('F');
  const [newT1, setNewT1] = useState<number>(15);
  const [newT2, setNewT2] = useState<number>(15);
  const [newExam, setNewExam] = useState<number>(45);

  const [copied, setCopied] = useState<boolean>(false);

  // Calculate totals and grades
  const calculatedList = students.map(s => {
    const total = s.test1 + s.test2 + s.exam; // /100
    let grade = 'F';
    let remarks = 'Needs Remedial';

    if (total >= 80) { grade = 'A'; remarks = 'Distinction / Exceeding'; }
    else if (total >= 70) { grade = 'B'; remarks = 'Very Good'; }
    else if (total >= 60) { grade = 'C'; remarks = 'Good / Meeting Standard'; }
    else if (total >= 50) { grade = 'D'; remarks = 'Pass / Needs Consolidation'; }
    else { grade = 'F'; remarks = 'Remedial Group Required'; }

    return { ...s, total, grade, remarks };
  }).sort((a, b) => b.total - a.total);

  // Add rank
  const rankedList = calculatedList.map((item, idx) => ({ ...item, rank: idx + 1 }));

  const classAverage = (rankedList.reduce((sum, item) => sum + item.total, 0) / (rankedList.length || 1)).toFixed(1);
  const passCount = rankedList.filter(s => s.total >= 50).length;
  const passRate = ((passCount / (rankedList.length || 1)) * 100).toFixed(0);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: StudentMark = {
      id: `st-${Date.now()}`,
      name: newName.trim(),
      gender: newGender,
      test1: Math.min(20, Math.max(0, newT1)),
      test2: Math.min(20, Math.max(0, newT2)),
      exam: Math.min(60, Math.max(0, newExam))
    };

    setStudents([...students, newStudent]);
    setNewName('');
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleCopy = () => {
    let text = `=====================================================\n`;
    text += `STUDENT MARKS & ASSESSMENT REGISTER\n`;
    text += `Class: ${className} | Subject: ${subject} | ${term}\n`;
    text += `Class Average: ${classAverage}% | Pass Rate: ${passRate}%\n`;
    text += `=====================================================\n\n`;

    rankedList.forEach(s => {
      text += `Rank #${s.rank} | ${s.name} (${s.gender}) - Total: ${s.total}/100 [Grade: ${s.grade}] (${s.remarks})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              GRADEBOOK & MARKS ENTRY
            </span>
            <span className="text-emerald-300 font-bold text-xs">Automated REB Grading</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white">
            🎓 Teaching Records & Student Marks Register
          </h2>
          <p className="text-xs text-slate-300">
            Enter test and exam marks, calculate totals, auto-grade (A to F), calculate student rankings, and identify remedial learners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs">
            <input 
              type="text"
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder="Class (e.g. P5)"
              className="bg-transparent text-white font-bold w-28 px-1 text-center border-b border-emerald-500/50 focus:outline-none"
            />
            <input 
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              className="bg-transparent text-emerald-300 font-bold w-28 px-1 text-center border-b border-emerald-500/50 focus:outline-none"
            />
            <input 
              type="text"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Term"
              className="bg-transparent text-slate-400 font-bold w-28 px-1 text-center border-b border-slate-700 focus:outline-none"
            />
          </div>

          <button
            onClick={handleCopy}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY MARKS'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT REGISTER</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
          <h4 className="text-xl font-black text-white font-mono">{rankedList.length} Learners</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Class Average</span>
          <h4 className="text-xl font-black text-emerald-300 font-mono">{classAverage}%</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-400">Pass Rate (≥50%)</span>
          <h4 className="text-xl font-black text-cyan-300 font-mono">{passRate}% ({passCount}/{rankedList.length})</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400">Remedial Group Target</span>
          <h4 className="text-xl font-black text-amber-300 font-mono">
            {rankedList.filter(s => s.total < 50).length} Learners
          </h4>
        </div>
      </div>

      {/* MARKS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-sm text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Class Marks Register ({className} — {subject})</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Sorted by Rank (Highest to Lowest)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3 w-1/3">Student Name</th>
                <th className="p-3 w-16 text-center">Sex</th>
                <th className="p-3 w-24 text-center">Test 1 (/20)</th>
                <th className="p-3 w-24 text-center">Test 2 (/20)</th>
                <th className="p-3 w-24 text-center">Exam (/60)</th>
                <th className="p-3 w-28 text-center text-emerald-400">Total (/100)</th>
                <th className="p-3 w-16 text-center">Grade</th>
                <th className="p-3 w-1/4">CBC Evaluation Remarks</th>
                <th className="p-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rankedList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-center align-middle">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-mono font-bold ${
                      s.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : s.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : s.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {s.rank}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white align-middle">
                    {s.name}
                  </td>
                  <td className="p-3 text-center align-middle font-mono font-bold text-slate-400">
                    {s.gender}
                  </td>
                  <td className="p-3 text-center align-middle font-mono text-slate-300">
                    {s.test1}
                  </td>
                  <td className="p-3 text-center align-middle font-mono text-slate-300">
                    {s.test2}
                  </td>
                  <td className="p-3 text-center align-middle font-mono text-slate-300">
                    {s.exam}
                  </td>
                  <td className="p-3 text-center align-middle font-mono font-black text-sm text-emerald-400 bg-emerald-950/20">
                    {s.total}%
                  </td>
                  <td className="p-3 text-center align-middle">
                    <span className={`px-2 py-0.5 rounded font-black font-mono text-xs ${
                      s.grade === 'A' || s.grade === 'B'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : s.grade === 'C' || s.grade === 'D'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    }`}>
                      {s.grade}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 align-middle text-[11px]">
                    {s.remarks}
                  </td>
                  <td className="p-3 text-center align-middle">
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete student mark"
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

      {/* ADD STUDENT FORM */}
      <form onSubmit={handleAddStudent} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Student Marks to Register</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Student Full Name *</label>
            <input 
              type="text" 
              placeholder="e.g. MUGABO Patrick"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sex</label>
            <select
              value={newGender}
              onChange={e => setNewGender(e.target.value as 'M' | 'F')}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="F">Female (F)</option>
              <option value="M">Male (M)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Test 1 (Max 20)</label>
            <input 
              type="number" 
              min={0}
              max={20}
              value={newT1}
              onChange={e => setNewT1(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Test 2 (Max 20)</label>
            <input 
              type="number" 
              min={0}
              max={20}
              value={newT2}
              onChange={e => setNewT2(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Exam (Max 60)</label>
            <input 
              type="number" 
              min={0}
              max={60}
              value={newExam}
              onChange={e => setNewExam(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Save Marks & Auto-Calculate
          </button>
        </div>
      </form>

    </div>
  );
};
