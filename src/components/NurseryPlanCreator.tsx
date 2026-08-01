import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  Clock,
  Layers,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  LessonPlanRequest,
  LessonPlanData,
  UserProfile,
  LanguageOption
} from '../types';

interface NurseryPlanCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSubscription?: () => void;
  onOpenSignIn?: () => void;
  onSavePlan?: (plan: LessonPlanData) => void;
  onBackToDashboard?: () => void;
}

export const NurseryPlanCreator: React.FC<NurseryPlanCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSubscription,
  onOpenSignIn,
  onSavePlan,
  onBackToDashboard
}) => {
  // Form states matching Nursery Lesson Plan requirements
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('tegura_saved_school') || '');
  const [teacherName, setTeacherName] = useState(() => user?.name || localStorage.getItem('tegura_saved_teacher') || '');
  const [term, setTerm] = useState('Term 1');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [classSize, setClassSize] = useState('20');
  const [language, setLanguage] = useState<LanguageOption>(selectedLanguage || 'English');

  // Generation UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generationProgressStep, setGenerationProgressStep] = useState(0);

  const progressMessages = [
    "Analyzing nursery curriculum requirements...",
    "Designing interactive welcome and circle time routine...",
    "Creating play-based sensorimotor learning stations...",
    "Fleshing out hands-on group discovery games...",
    "Structuring clean-up & farewell songs...",
    "Compiling full Nursery ECE Lesson Plan..."
  ];

  React.useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationProgressStep(0);
      interval = setInterval(() => {
        setGenerationProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !classGrade.trim() || !lessonTitle.trim()) {
      setErrorMsg('Subject, Class Level, and Lesson Name are required.');
      return;
    }

    if (!user) {
      if (onOpenSignIn) onOpenSignIn();
      return;
    }

    // Save school name and teacher name to localstorage for convenience
    if (schoolName) localStorage.setItem('tegura_saved_school', schoolName);
    if (teacherName) localStorage.setItem('tegura_saved_teacher', teacherName);

    setIsGenerating(true);
    setErrorMsg(null);

    // Build the request matching the backend LessonPlanRequest properties
    const requestPayload: LessonPlanRequest = {
      schoolName,
      teacherName: teacherName || 'Teacher',
      term,
      date,
      subject,
      classGrade,
      unitNo: '1',
      lessonNo: '1',
      duration: `${duration} minutes`,
      classSize: `${classSize} children`,
      specialNeeds: 'None / Interactive visual supports provided',
      unitTitle: subject,
      keyUnitCompetence: `Develop basic motor, cognitive, and social development related to ${lessonTitle} through interactive play and sensory activities.`,
      lessonTitle,
      instructionalObjective: `By the end of the lesson, nursery school children will be able to identify, explore, and participate in active play-based learning about ${lessonTitle} with joy and high interaction.`,
      location: 'In Classroom',
      learningMaterials: 'Toys, picture cards, crayons, modeling clay, safety blocks, puppets, songs',
      references: 'REB Early Childhood Education Curriculum Standards',
      language,
      format: 'nursery_grid'
    };

    try {
      const token = localStorage.getItem('tegura_session_token') || localStorage.getItem('nkorera_session_token');
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ request: requestPayload, userEmail: user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to generate. Please check quota or network and try again.');
      }

      const responseData = await response.json();
      const finalPlan: LessonPlanData = responseData.lessonPlan || responseData;

      if (onSavePlan) {
        onSavePlan(finalPlan);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to generate nursery lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6 print:hidden flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lesson Plans</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 fill-amber-200 text-slate-950" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-950">
              Create Nursery Lesson Plan
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Fill in the details below to generate a nursery lesson plan with AI assistance
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start gap-3">
            <div className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">!</div>
            <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Loading overlay / state */}
        {isGenerating ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-orange-600 animate-spin"></div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">Generating Your Nursery Plan...</h3>
              <p className="text-xs text-slate-500 font-bold mt-2 animate-pulse text-orange-600">
                {progressMessages[generationProgressStep]}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGeneratePlan} className="p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider pb-1 border-b border-slate-100">
                Basic Information
              </h2>

              {/* School Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  School Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g., Nursery Primary School"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                  />
                </div>
              </div>

              {/* Teacher Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Teacher Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Teacher Name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                  />
                </div>
              </div>

              {/* Grid 1: Term & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    Term
                  </label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="e.g., Term 1, Term 2"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Numbers, Colors, Shapes"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                />
              </div>

              {/* Class Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Class Level
                </label>
                <input
                  type="text"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  placeholder="e.g., Nursery 1, Nursery 2"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                />
              </div>

              {/* Lesson Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Lesson Name
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g., Learning to Count 1-10"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                />
              </div>

              {/* Grid 2: Total Duration & Class Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    Total Duration (minutes)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Clock className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="30"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    Class Size (number of children)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      value={classSize}
                      onChange={(e) => setClassSize(e.target.value)}
                      placeholder="20"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all text-sm font-bold text-slate-950 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Kinyarwanda">Kinyarwanda</option>
                  <option value="French">French</option>
                  <option value="Swahili">Swahili</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-6 py-2.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-black transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 hover:text-slate-950 rounded-xl text-sm font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-orange-600"
              >
                <Sparkles className="w-4 h-4 fill-amber-200 text-slate-950" />
                <span>Generate Lesson Plan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
