import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Eye,
  Trash2,
  Sparkles,
  FileText,
  Search,
  X,
  Tag,
  Plus,
  Filter,
  Check,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { LessonPlanData } from '../types';

interface HistoryTabProps {
  savedPlans: LessonPlanData[];
  onSelectPlan: (plan: LessonPlanData) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlanTags?: (planId: string, tags: string[]) => void;
  onNewPlanClick: () => void;
  onOpenSubscription?: () => void;
}

const DEFAULT_PRESET_TAGS = [
  'Exam Prep',
  'Remedial',
  'Group Work',
  'Revision',
  'STEM',
  'Assessment',
  'Homework',
  'Practical / Lab',
  'Competency-Based'
];

const CHART_COLORS = [
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#6366f1'  // Indigo
];

export const HistoryTab: React.FC<HistoryTabProps> = ({
  savedPlans,
  onSelectPlan,
  onDeletePlan,
  onUpdatePlanTags,
  onNewPlanClick,
  onOpenSubscription,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);
  const [editingTagPlanId, setEditingTagPlanId] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);

  // Collect all unique subjects currently present in saved plans
  const availableSubjects = useMemo(() => {
    return Array.from(
      new Set(savedPlans.map((plan) => (plan.header.subject || '').trim()).filter(Boolean))
    ).sort();
  }, [savedPlans]);

  // Collect all unique tags currently used across saved plans
  const existingTagsInPlans = useMemo(() => {
    return Array.from(new Set(savedPlans.flatMap((plan) => plan.tags || [])));
  }, [savedPlans]);

  // Combine default preset suggestions with any custom tags teachers added
  const availableFilterTags = useMemo(() => {
    return Array.from(
      new Set([...DEFAULT_PRESET_TAGS.slice(0, 5), ...existingTagsInPlans])
    );
  }, [existingTagsInPlans]);

  // Compute Analytics Data for Recharts
  const subjectDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    savedPlans.forEach((plan) => {
      const subject = (plan.header.subject || 'General / Unspecified').trim();
      counts[subject] = (counts[subject] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 subjects
  }, [savedPlans]);

  const productivityTimelineData = useMemo(() => {
    // Group plans by date string or created day
    const dateCounts: Record<string, { count: number; rawDate: number }> = {};

    savedPlans.forEach((plan) => {
      const dateObj = new Date(plan.createdAt || Date.now());
      const dateLabel = isNaN(dateObj.getTime())
        ? 'Unknown Date'
        : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (!dateCounts[dateLabel]) {
        dateCounts[dateLabel] = { count: 0, rawDate: dateObj.getTime() || 0 };
      }
      dateCounts[dateLabel].count += 1;
    });

    return Object.entries(dateCounts)
      .map(([date, val]) => ({
        date,
        plansCount: val.count,
        rawDate: val.rawDate
      }))
      .sort((a, b) => a.rawDate - b.rawDate);
  }, [savedPlans]);

  const tagBreakdownData = useMemo(() => {
    const counts: Record<string, number> = {};
    savedPlans.forEach((plan) => {
      (plan.tags || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [savedPlans]);

  const totalTeachingMinutes = useMemo(() => {
    return savedPlans.reduce((acc, plan) => {
      const duration = parseInt(plan.header.durationMinutes || '40', 10) || 40;
      return acc + duration;
    }, 0);
  }, [savedPlans]);

  const handleAddTag = (plan: LessonPlanData, tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    const currentTags = plan.tags || [];
    if (!currentTags.includes(trimmed)) {
      const updatedTags = [...currentTags, trimmed];
      if (onUpdatePlanTags) {
        onUpdatePlanTags(plan.id, updatedTags);
      }
    }
  };

  const handleRemoveTag = (plan: LessonPlanData, tagToRemove: string) => {
    const currentTags = plan.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    if (onUpdatePlanTags) {
      onUpdatePlanTags(plan.id, updatedTags);
    }
  };

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

  const filteredPlans = savedPlans.filter((plan) => {
    const planTags = plan.tags || [];

    // Filter by selected tag chip if active
    if (selectedTagFilter) {
      if (!planTags.includes(selectedTagFilter)) {
        return false;
      }
    }

    // Filter by selected subject if active
    if (selectedSubjectFilter) {
      if ((plan.header.subject || '').trim().toLowerCase() !== selectedSubjectFilter.trim().toLowerCase()) {
        return false;
      }
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const subject = (plan.header.subject || '').toLowerCase();
    const classGrade = (plan.header.classGrade || '').toLowerCase();
    const dateStr = (plan.header.date || '').toLowerCase();
    
    // Comprehensive date matching variations for custom/created dates
    const dateObj = new Date(plan.createdAt);
    const formattedCreatedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase()
      : '';
    const formattedShortDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase()
      : '';
    const formattedCreatedLocale = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString().toLowerCase()
      : '';

    const lessonTitle = (plan.header.lessonTitle || '').toLowerCase();
    const unitTitle = (plan.header.unitTitle || '').toLowerCase();
    const schoolName = (plan.header.schoolName || '').toLowerCase();
    const teacherName = (plan.header.teacherName || '').toLowerCase();
    const keyCompetence = (plan.header.keyUnitCompetence || '').toLowerCase();
    const matchesTags = planTags.some((t) => t.toLowerCase().includes(query));

    return (
      subject.includes(query) ||
      classGrade.includes(query) ||
      dateStr.includes(query) ||
      formattedCreatedDate.includes(query) ||
      formattedShortDate.includes(query) ||
      formattedCreatedLocale.includes(query) ||
      lessonTitle.includes(query) ||
      unitTitle.includes(query) ||
      schoolName.includes(query) ||
      teacherName.includes(query) ||
      keyCompetence.includes(query) ||
      matchesTags
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="flex items-center justify-between bg-purple-50 p-4 rounded-2xl border border-purple-200">
        <div>
          <h2 className="text-xl font-black text-purple-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            <span>My Lesson Plans &amp; Analytics</span>
          </h2>
          <p className="text-xs text-purple-800 font-medium">
            View, tag, print, and track teacher productivity trends across saved REB lesson plans
          </p>
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

      {/* SEARCH & TAG FILTER CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
            <input
              type="text"
              id="history-search-input"
              placeholder="Search saved plans by title, topic/subject, date, or tags (e.g., 'Forces', 'Physics', 'August 5', 'Exam Prep')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder-slate-400 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                title="Clear search text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Subject Filter Select Dropdown */}
          {availableSubjects.length > 0 && (
            <div className="relative shrink-0">
              <select
                id="history-subject-filter-select"
                value={selectedSubjectFilter || ''}
                onChange={(e) => setSelectedSubjectFilter(e.target.value ? e.target.value : null)}
                className="w-full md:w-auto px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
              >
                <option value="">All Subjects ({savedPlans.length})</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    📚 {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {(searchQuery || selectedTagFilter || selectedSubjectFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTagFilter(null);
                setSelectedSubjectFilter(null);
              }}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5 shrink-0"
              id="history-clear-all-filters-btn"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Active Filters Summary Badge */}
        {(searchQuery || selectedTagFilter || selectedSubjectFilter) && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80 text-emerald-950">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-[11px] flex items-center gap-1 text-emerald-800">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Filters:</span>
              </span>
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-white text-emerald-950 border border-emerald-300 rounded-lg text-[11px] font-bold shadow-2xs">
                  Title/Search: "{searchQuery}"
                </span>
              )}
              {selectedSubjectFilter && (
                <span className="px-2.5 py-0.5 bg-white text-emerald-950 border border-emerald-300 rounded-lg text-[11px] font-bold shadow-2xs">
                  Subject: {selectedSubjectFilter}
                </span>
              )}
              {selectedTagFilter && (
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-950 border border-purple-300 rounded-lg text-[11px] font-bold shadow-2xs">
                  Tag: #{selectedTagFilter}
                </span>
              )}
            </div>
            <span className="font-black text-[11px] bg-emerald-600 text-white px-3 py-1 rounded-full shadow-2xs shrink-0">
              {filteredPlans.length} {filteredPlans.length === 1 ? 'Plan Found' : 'Plans Found'}
            </span>
          </div>
        )}

        {/* TAG FILTER CHIPS BAR */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-emerald-600" />
            <span>Filter by Tag:</span>
          </span>

          <button
            onClick={() => setSelectedTagFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              selectedTagFilter === null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Plans ({savedPlans.length})
          </button>

          {availableFilterTags.map((tag) => {
            const count = savedPlans.filter((p) => (p.tags || []).includes(tag)).length;
            const isSelected = selectedTagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : count > 0
                    ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>#{tag}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VISUAL DASHBOARD: LESSON PLAN TRENDS & PRODUCTIVITY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Teacher Productivity &amp; Subject Trends Dashboard</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950">
                  Live Analytics
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualizing teaching metrics, top subjects, and lesson creation activity
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <span>{isAnalyticsExpanded ? 'Collapse' : 'Expand'}</span>
            {isAnalyticsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isAnalyticsExpanded && (
          <div className="p-5 space-y-6">
            {/* STAT CARDS ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold">
                  <span>Total Plans</span>
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-950">
                  {savedPlans.length}
                </div>
                <p className="text-[10px] font-medium text-emerald-700">REB AI Plans Generated</p>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-purple-800 text-[11px] font-bold">
                  <span>Top Subject</span>
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-black text-purple-950 truncate">
                  {subjectDistributionData[0]?.name || 'N/A'}
                </div>
                <p className="text-[10px] font-medium text-purple-700">
                  {subjectDistributionData[0]
                    ? `${subjectDistributionData[0].count} lesson plans`
                    : 'No subjects recorded'}
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-blue-800 text-[11px] font-bold">
                  <span>Active Tags</span>
                  <Tag className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-950">
                  {existingTagsInPlans.length}
                </div>
                <p className="text-[10px] font-medium text-blue-700">Custom Tags Applied</p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold">
                  <span>Teaching Time</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-950">
                  {Math.round(totalTeachingMinutes / 60)} hrs
                </div>
                <p className="text-[10px] font-medium text-amber-700">
                  {totalTeachingMinutes} minutes planned
                </p>
              </div>
            </div>

            {/* RECHARTS VISUALIZATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* SUBJECT FREQUENCY BAR CHART */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    <span>Most Taught Subjects (Frequency)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Subject Distribution
                  </span>
                </div>

                <div className="h-60 w-full pt-2">
                  {subjectDistributionData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No subject data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectDistributionData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                          itemStyle={{ color: '#34d399' }}
                        />
                        <Bar
                          dataKey="count"
                          name="Lesson Plans"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                        >
                          {subjectDistributionData.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* PRODUCTIVITY OVER TIME AREA CHART */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>Teacher Preparation Activity Over Time</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Productivity Timeline
                  </span>
                </div>

                <div className="h-60 w-full pt-2">
                  {productivityTimelineData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No activity history available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={productivityTimelineData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                      >
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                          itemStyle={{ color: '#c084fc' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="plansCount"
                          name="Plans Prepared"
                          stroke="#8b5cf6"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* TAG DISTRIBUTION PIE BREAKDOWN (If tags exist) */}
            {tagBreakdownData.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <PieChartIcon className="w-4 h-4 text-blue-600" />
                  <span>Top Applied Lesson Plan Tags</span>
                </h4>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="h-44 w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tagBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {tagBreakdownData.map((_entry, index) => (
                            <Cell
                              key={`tag-cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '11px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-1/2 grid grid-cols-2 gap-2">
                    {tagBreakdownData.map((item, idx) => (
                      <div
                        key={item.name}
                        className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <div className="truncate text-xs">
                          <p className="font-bold text-slate-800 truncate">#{item.name}</p>
                          <p className="text-[10px] text-slate-500">{item.value} plans</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PLANS GRID */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching lesson plans</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            We couldn't find any saved lesson plans matching your query or selected filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTagFilter(null);
              setSelectedSubjectFilter(null);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            Clear Search &amp; Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => {
            const planTags = plan.tags || [];
            const isEditingThisCard = editingTagPlanId === plan.id;
            const isExpired = (() => {
              if (!plan.createdAt) return false;
              const planDate = new Date(plan.createdAt);
              const now = new Date();
              return planDate.getFullYear() < now.getFullYear() || 
                     (planDate.getFullYear() === now.getFullYear() && planDate.getMonth() < now.getMonth());
            })();

            return (
              <div
                key={plan.id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-md ${
                  isExpired ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                        {plan.language}
                      </span>
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>Expired (End of Month)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                          <span>Active Plan</span>
                        </span>
                      )}
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

                  {/* CUSTOM TAGS SECTION ON CARD */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>Tags:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingThisCard) {
                            setEditingTagPlanId(null);
                          } else {
                            setEditingTagPlanId(plan.id);
                            setCustomTagInput('');
                          }
                        }}
                        className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1"
                        id={`add-tag-btn-${plan.id}`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Tag</span>
                      </button>
                    </div>

                    {/* Active Tags list */}
                    <div className="flex flex-wrap gap-1.5 min-h-[24px] items-center">
                      {planTags.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No tags added yet (e.g. Exam Prep, Remedial)</span>
                      ) : (
                        planTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(plan, tag)}
                              className="text-purple-400 hover:text-purple-900 hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                              title={`Remove tag ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Inline Tag Editor Form */}
                    {isEditingThisCard && (
                      <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            <span>Add Custom Tag</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingTagPlanId(null)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (customTagInput.trim()) {
                              handleAddTag(plan, customTagInput.trim());
                              setCustomTagInput('');
                            }
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <input
                            type="text"
                            placeholder="Type tag (e.g. 'Exam Prep', 'Remedial')..."
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!customTagInput.trim()}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </form>

                        {/* Quick Presets */}
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 mb-1">Quick Presets:</p>
                          <div className="flex flex-wrap gap-1">
                            {DEFAULT_PRESET_TAGS.map((preset) => {
                              const isAdded = planTags.includes(preset);
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  disabled={isAdded}
                                  onClick={() => handleAddTag(plan, preset)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-0.5 ${
                                    isAdded
                                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                      : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-2xs'
                                  }`}
                                >
                                  {isAdded ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : '+'} {preset}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectPlan(plan)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      id={`view-saved-plan-${plan.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View &amp; Print</span>
                    </button>

                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isExpired && onOpenSubscription && (
                    <button
                      onClick={onOpenSubscription}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md border border-orange-400 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>Renew Access</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
