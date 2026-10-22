import { useState, useEffect } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { LessonPlanTemplate } from '../data/lessonPlanTemplates';
import { CbcLessonPlanData } from '../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanData: CbcLessonPlanData;
  onSave: (template: LessonPlanTemplate) => void;
}

export default function SaveTemplateModal({
  isOpen,
  onClose,
  currentPlanData,
  onSave
}: SaveTemplateModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Primary (P1-P3)' | 'Primary (P4-P6)' | 'Secondary O-Level (S1-S3)' | 'Secondary A-Level (S4-S6)' | 'Pre-Primary'>('Primary (P1-P3)');
  const [gradeLevel, setGradeLevel] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && currentPlanData) {
      setSubject(currentPlanData.subject || '');
      setGradeLevel(currentPlanData.className || '');
      setTitle(`${currentPlanData.className || 'My Class'} ${currentPlanData.subject || 'Subject'} Structure`);
      setDescription(`Preferred teaching structure for ${currentPlanData.lessonTitle || 'lessons'} in ${currentPlanData.className || 'class'}.`);
      
      // Auto-detect category based on class level
      const cls = (currentPlanData.className || '').toUpperCase();
      if (cls.includes('P1') || cls.includes('P2') || cls.includes('P3')) {
        setCategory('Primary (P1-P3)');
      } else if (cls.includes('P4') || cls.includes('P5') || cls.includes('P6')) {
        setCategory('Primary (P4-P6)');
      } else if (cls.includes('S1') || cls.includes('S2') || cls.includes('S3')) {
        setCategory('Secondary O-Level (S1-S3)');
      } else if (cls.includes('S4') || cls.includes('S5') || cls.includes('S6')) {
        setCategory('Secondary A-Level (S4-S6)');
      } else if (cls.includes('NURSERY') || cls.includes('BABY') || cls.includes('MIDDLE') || cls.includes('TOP') || cls.includes('PRE')) {
        setCategory('Pre-Primary');
      } else {
        setCategory('Primary (P1-P3)');
      }
    }
  }, [isOpen, currentPlanData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !gradeLevel.trim()) return;

    // Clean data to be stored in the template (remove ID/dates so it acts as structure)
    const { id, createdAt, updatedAt, ...cleanData } = currentPlanData as any;

    const newTemplate: LessonPlanTemplate = {
      id: `custom_tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      subject: subject.trim(),
      category,
      gradeLevel: gradeLevel.trim(),
      description: description.trim() || 'Custom teacher preferred lesson structure.',
      data: cleanData
    };

    onSave(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Save as Template</h3>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">Save this lesson plan structure to quickly reuse it for future lessons.</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-medium text-slate-700">
          
          {/* TITLE */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1. Template Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. S1 Physics: Kinematics Lesson Structure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 placeholder-slate-400 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* SUBJECT */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">2. Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 shadow-sm"
              />
            </div>

            {/* CLASS/GRADE LEVEL */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3. Grade / Class *</label>
              <input
                type="text"
                required
                placeholder="e.g. S1"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 shadow-sm"
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">4. Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 shadow-sm"
            >
              <option value="Pre-Primary">Pre-Primary</option>
              <option value="Primary (P1-P3)">Primary (P1-P3)</option>
              <option value="Primary (P4-P6)">Primary (P4-P6)</option>
              <option value="Secondary O-Level (S1-S3)">Secondary O-Level (S1-S3)</option>
              <option value="Secondary A-Level (S4-S6)">Secondary A-Level (S4-S6)</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">5. Description</label>
            <textarea
              placeholder="e.g. This template helps quickly structure physics lessons with practical activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 placeholder-slate-400 shadow-sm resize-none"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
