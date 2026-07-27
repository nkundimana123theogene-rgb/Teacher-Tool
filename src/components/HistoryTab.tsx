import React from 'react';
import { BookOpen, Calendar, Globe, Printer, Eye, Trash2, Sparkles, FileText } from 'lucide-react';
import { LessonPlanData } from '../types';

interface HistoryTabProps {
  savedPlans: LessonPlanData[];
  onSelectPlan: (plan: LessonPlanData) => void;
  onDeletePlan: (id: string) => void;
  onNewPlanClick: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  savedPlans,
  onSelectPlan,
  onDeletePlan,
  onNewPlanClick,
}) => {
  if (savedPlans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No My Lesson Plans / History Yet</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          You haven't generated any lesson plans in this session. Create your first REB-standard AI lesson plan now!
        </p>
        <button
          onClick={onNewPlanClick}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
          id="empty-history-create-btn"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate Lesson Plan Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-purple-50 p-4 rounded-2xl border border-purple-200">
        <div>
          <h2 className="text-xl font-black text-purple-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            <span>My Lesson Plans (History)</span>
          </h2>
          <p className="text-xs text-purple-800 font-medium">View, print, or download your generated lesson plans (Download PDF cyangwa Word)</p>
        </div>

        <button
          onClick={onNewPlanClick}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          id="history-new-plan-btn"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>New Lesson Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {plan.language}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    (Automatically Saved)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {plan.header.date || new Date(plan.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                {plan.header.lessonTitle || 'Untitled Lesson'}
              </h3>

              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <p><span className="font-semibold text-slate-800">Subject:</span> {plan.header.subject} ({plan.header.classGrade})</p>
                <p><span className="font-semibold text-slate-800">Unit:</span> {plan.header.unitTitle}</p>
                <p className="line-clamp-1"><span className="font-semibold text-slate-800">School:</span> {plan.header.schoolName}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectPlan(plan)}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                id={`view-saved-plan-${plan.id}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View & Print</span>
              </button>

              <button
                onClick={() => onDeletePlan(plan.id)}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete saved plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
