import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Trash2,
  User,
  Award
} from 'lucide-react';
import { CBC_LESSON_PLAN_TEMPLATES, LessonPlanTemplate } from '../data/lessonPlanTemplates';
import { loadLessonPlanTemplatesFromFirestore, deleteLessonPlanTemplateFromFirestore } from '../utils/firebase';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: LessonPlanTemplate) => void;
}

export default function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelectTemplate
}: TemplateSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<LessonPlanTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useState<LessonPlanTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'standard' | 'custom'>('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Fetch custom templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLessonPlanTemplatesFromFirestore()
        .then(res => {
          setCustomTemplates(res || []);
        })
        .catch(err => {
          console.warn("Failed to load custom templates:", err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Primary (P1-P3)',
    'Primary (P4-P6)',
    'Secondary O-Level (S1-S3)',
    'Secondary A-Level (S4-S6)',
    'Pre-Primary'
  ];

  // Combine standard and custom templates
  const allTemplates = [
    ...customTemplates.map(t => ({ ...t, isCustom: true })),
    ...CBC_LESSON_PLAN_TEMPLATES.map(t => ({ ...t, isCustom: false }))
  ];

  const filteredTemplates = allTemplates.filter(tpl => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'standard' && !tpl.isCustom) ||
      (activeTab === 'custom' && tpl.isCustom);

    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      tpl.title.toLowerCase().includes(query) ||
      tpl.subject.toLowerCase().includes(query) ||
      tpl.gradeLevel.toLowerCase().includes(query) ||
      tpl.description.toLowerCase().includes(query);
    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleDeleteCustomTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this template from your library?")) {
      setIsDeletingId(templateId);
      try {
        await deleteLessonPlanTemplateFromFirestore(templateId);
        setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
      } catch (err) {
        console.error("Failed to delete custom template:", err);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Templates Library
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-0.5">CBC Lesson Plan Templates Library</h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100/80 max-w-2xl mt-1">
            Choose a high-quality lesson plan template or your saved custom templates to populate all fields in seconds.
          </p>
        </div>

        {/* SEARCH AND FILTER BAR WITH TABS */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          
          {/* TAB SWITCHER */}
          <div className="flex border-b border-slate-200 -mx-4 px-4 pb-2 gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-1.5 text-xs font-bold transition-all relative ${
                activeTab === 'all' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Templates ({allTemplates.length})
              {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('standard')}
              className={`pb-1.5 text-xs font-bold transition-all relative ${
                activeTab === 'standard' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Standard REB Templates ({CBC_LESSON_PLAN_TEMPLATES.length})
              {activeTab === 'standard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-1.5 text-xs font-bold transition-all relative flex items-center gap-1 ${
                activeTab === 'custom' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3 h-3" />
              My Saved Templates ({customTemplates.length})
              {activeTab === 'custom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject, grade level, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Template Count Badge */}
            <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
              Templates found: <span className="text-emerald-600">{filteredTemplates.length}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATE GRID CONTENT */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No template matches your search criteria.</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms or changing the category filter.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setActiveTab('all'); }}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* BADGES */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tpl.subject}
                        </span>
                        {tpl.isCustom ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5" />
                            Custom
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5" />
                            REB Standard
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Level: {tpl.gradeLevel}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {tpl.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* DETAILS HIGHLIGHT */}
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                      <div className="text-slate-700 font-semibold truncate">
                        <span className="text-slate-400">Unit:</span> {tpl.data.unitTitle}
                      </div>
                      <div className="text-slate-600 truncate">
                        <span className="text-slate-400">Lesson:</span> {tpl.data.lessonTitle}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        Preview
                      </button>
                      {tpl.isCustom && (
                        <button
                          disabled={isDeletingId === tpl.id}
                          onClick={(e) => handleDeleteCustomTemplate(tpl.id, e)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                          title="Delete this template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        onSelectTemplate(tpl);
                        onClose();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-1.6 group-hover:scale-102"
                    >
                      <span>Use this Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs border-t border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            All template fields will be automatically filled 100% into your lesson plan.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>

      {/* DETAILED PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{previewTemplate.subject} • {previewTemplate.gradeLevel}</span>
                <h3 className="text-base font-bold">{previewTemplate.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <strong>Unit Competence:</strong> {previewTemplate.data.keyUnitCompetence}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                <strong>Instructional Objective:</strong> {previewTemplate.data.instructionalObjective}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Timing & Activities Preview</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p><strong>Introduction ({previewTemplate.data.timingIntro}):</strong> {previewTemplate.data.teacherActivityIntro}</p>
                  <p><strong>Development ({previewTemplate.data.timingDev}):</strong> {previewTemplate.data.teacherActivityDev}</p>
                  <p><strong>Conclusion ({previewTemplate.data.timingConcl}):</strong> {previewTemplate.data.teacherActivityConcl}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-300"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  onSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
