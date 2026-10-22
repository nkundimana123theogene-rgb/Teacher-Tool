import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Settings2, 
  Edit3, 
  Flame, 
  Award,
  Check,
  PartyPopper,
  Zap
} from 'lucide-react';
import { UserProfile, CbcLessonPlanData } from '../types';
import { 
  getDailyPlansCount, 
  setUserDailyTarget, 
  adjustManualDailyPlanCount, 
  DailyGoalData 
} from '../utils/dailyGoal';
import { saveLessonPlanToFirestore } from '../utils/firebase';

interface DailyLessonPlanGoalCardProps {
  currentUser: UserProfile | null;
  onOpenPlanLesson?: () => void;
  className?: string;
}

export const DailyLessonPlanGoalCard: React.FC<DailyLessonPlanGoalCardProps> = ({
  currentUser,
  onOpenPlanLesson,
  className = ''
}) => {
  const userKey = currentUser?.email || currentUser?.id || 'guest';
  const [goalData, setGoalData] = useState<DailyGoalData>(() => getDailyPlansCount(userKey));
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<string>('');
  const [isAutoGenerating, setIsAutoGenerating] = useState<boolean>(false);

  const handleAutoGeneratePlans = async () => {
    setIsAutoGenerating(true);
    try {
      const remainingCount = Math.max(1, goalData.remaining);
      const subjects = ['Mathematics', 'English', 'Integrated Science', 'Kinyarwanda', 'Social & Religious Studies', 'ICT & Digital Literacy', 'Creative Arts', 'Physical Education'];
      const currentTimestamp = new Date().toISOString();
      
      for (let i = 0; i < remainingCount; i++) {
        const subject = subjects[(goalData.generatedToday + i) % subjects.length];
        const planId = 'auto_plan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const autoPlan: CbcLessonPlanData = {
          id: planId,
          schoolName: 'GS Mayange / Nkorera School',
          teacherName: currentUser?.name || 'Teacher',
          term: 'Term 1',
          date: new Date().toISOString().split('T')[0],
          subject: subject,
          className: 'Primary 6',
          unitNumber: `Unit ${Math.floor(Math.random() * 5) + 1}`,
          lessonNumber: `Lesson ${goalData.generatedToday + i + 1}`,
          duration: '40 min',
          classSize: '42',
          specialNeeds: 'None identified',
          unitTitle: `${subject} Foundations and Core Principles`,
          keyUnitCompetence: `Ability to apply ${subject} concepts to solve everyday problems effectively.`,
          lessonTitle: `${subject} - Practice and Application`,
          instructionalObjective: `Students will be able to demonstrate mastery of ${subject} concepts through active problem solving.`,
          classLocation: 'Inside the classroom',
          learningMaterials: 'Chalkboard, textbooks, exercise books, counting materials',
          references: 'RWB CBC Syllabus & Mathematics Teacher Guide P6',
          timingIntro: '10 min',
          teacherActivityIntro: 'Facilitates collaborative group discussions and introduces key concepts with real-world examples.',
          learnerActivityIntro: 'Actively participates in brainstorming and listens attentively to introductory problem statements.',
          timingDev: '20 min',
          teacherActivityDev: 'Guides students through step-by-step problem-solving exercises and supervises group work.',
          learnerActivityDev: 'Solves practice exercises in groups and presents findings on the chalkboard.',
          timingConcl: '10 min',
          teacherActivityConcl: 'Summarizes key takeaways, addresses learning gaps, and assigns formative practice work.',
          learnerActivityConcl: 'Asks clarifying questions, takes summary notes, and submits practice work.',
          genericCompetencesIntro: '• Critical thinking and problem solving through analytical questioning.\n• Communication skills through structured peer explanations.',
          genericCompetencesDev: '• Cooperation and interpersonal management in group tasks.\n• Research and problem solving in practical assignments.',
          genericCompetencesConcl: '• Lifelong learning through self-reflection and summarization.',
          teacherSelfEvaluation: 'Lesson successfully executed with 100% active student participation and mastery of objectives.',
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp
        };

        await saveLessonPlanToFirestore(autoPlan);
      }

      refreshGoal();
      window.dispatchEvent(new CustomEvent('nkorera_daily_goal_updated'));
    } catch (err) {
      console.error("Error auto-generating plans:", err);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const refreshGoal = useCallback(() => {
    setGoalData(getDailyPlansCount(userKey));
  }, [userKey]);

  useEffect(() => {
    refreshGoal();
    
    // Listen for custom goal updates or storage events
    window.addEventListener('nkorera_daily_goal_updated', refreshGoal);
    window.addEventListener('storage', refreshGoal);

    return () => {
      window.removeEventListener('nkorera_daily_goal_updated', refreshGoal);
      window.removeEventListener('storage', refreshGoal);
    };
  }, [refreshGoal]);

  const handleSetTarget = (newTarget: number) => {
    setUserDailyTarget(newTarget, userKey);
    setIsEditingTarget(false);
    refreshGoal();
  };

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(targetInput, 10);
    if (!isNaN(val) && val > 0) {
      handleSetTarget(val);
    } else {
      setIsEditingTarget(false);
    }
  };

  const handleIncrementManual = () => {
    adjustManualDailyPlanCount(1, userKey);
    refreshGoal();
  };

  const handleDecrementManual = () => {
    if (goalData.breakdown.manualLogged > 0) {
      adjustManualDailyPlanCount(-1, userKey);
      refreshGoal();
    }
  };

  const progressPercent = Math.min(100, Math.max(0, goalData.percentage));

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all relative overflow-hidden group ${className}`}>
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
        goalData.isGoalReached ? 'bg-emerald-500/20' : 'bg-teal-500/10'
      }`} />

      <div className="relative z-10 space-y-4">
        
        {/* TOP ROW: ICON, TITLE, BADGES, AND TARGET SETTING */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <motion.div 
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                goalData.isGoalReached
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
              animate={goalData.isGoalReached ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              {goalData.isGoalReached ? (
                <Award className="w-6 h-6" />
              ) : (
                <Target className="w-6 h-6" />
              )}
            </motion.div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Daily Lesson Plan Goal
                </h3>
                <AnimatePresence mode="wait">
                  {goalData.isGoalReached ? (
                    <motion.span
                      key="goal-achieved"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Goal Hit!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="in-progress"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      <Flame className="w-3 h-3 text-amber-400" />
                      In Progress
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-slate-400">
                Daily lesson planning goal and your current progress
              </p>
            </div>
          </div>

          {/* TARGET EDITING TOGGLE */}
          <div className="flex items-center gap-2">
            {!isEditingTarget ? (
              <button
                type="button"
                onClick={() => {
                  setTargetInput(goalData.dailyTarget.toString());
                  setIsEditingTarget(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 transition-all cursor-pointer"
                title="Change your daily target"
              >
                <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target: <strong className="text-emerald-300">{goalData.dailyTarget}/day</strong></span>
              </button>
            ) : (
              <form onSubmit={handleCustomTargetSubmit} className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-emerald-500/50 shadow-inner">
                <span className="text-[11px] text-slate-400 pl-1.5 font-bold">Target:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-12 bg-slate-800 text-white font-black text-center text-xs py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                  title="Save Target"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </form>
            )}
          </div>

        </div>

        {/* METRICS & STATUS TEXT */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {goalData.generatedToday}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-400">
              / {goalData.dailyTarget} Plans
            </span>
            <motion.span 
              key={goalData.percentage}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`text-xs font-black px-2.5 py-0.5 rounded-lg ml-1 ${
                goalData.isGoalReached 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {goalData.percentage}% Completed
            </motion.span>
          </div>

          <div className="text-xs text-slate-300 font-medium">
            {goalData.isGoalReached ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Congratulations! You achieved today's target!
              </span>
            ) : (
              <span>
                <strong>{goalData.remaining}</strong> more {goalData.remaining === 1 ? 'plan' : 'plans'} needed to hit your daily goal
              </span>
            )}
          </div>
        </div>

        {/* ENHANCED FRAMER MOTION PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            {/* ANIMATED MOTION FILL */}
            <motion.div 
              className={`h-full rounded-full relative overflow-hidden ${
                goalData.isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/50'
                  : goalData.percentage >= 50
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ 
                type: 'spring', 
                stiffness: 85, 
                damping: 18, 
                mass: 0.6 
              }}
            >
              {/* SHINE ACCENT */}
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </motion.div>
          </div>

          {/* TARGET MILESTONES */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-0.5">
            <span>0 plans</span>
            <span>Halfway ({Math.round(goalData.dailyTarget / 2)})</span>
            <span className="text-emerald-400 font-black">{goalData.dailyTarget} Plans (100%)</span>
          </div>
        </div>

        {/* CELEBRATORY VISUAL FEEDBACK BANNER WHEN GOAL IS REACHED */}
        <AnimatePresence>
          {goalData.isGoalReached && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <PartyPopper className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-300">
                      Daily Goal Successfully Achieved! 🎉
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      You have prepared all the lesson plans you set for today. Keep up the great work!
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 shrink-0">
                  <Award className="w-3.5 h-3.5" />
                  <span>100%+ Done</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM ROW: QUICK PRESETS, BREAKDOWN & ACTION BUTTONS */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* QUICK TARGET SELECTORS */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-bold">Quick Target:</span>
            {[1, 2, 3, 5, 8].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSetTarget(preset)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  goalData.dailyTarget === preset
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}

            {/* BREAKDOWN PILLS */}
            {(goalData.breakdown.cbc > 0 || goalData.breakdown.remedial > 0 || goalData.breakdown.nursery > 0) && (
              <div className="hidden lg:flex items-center gap-1.5 ml-2 text-[10px] text-slate-400">
                <span className="text-slate-600">|</span>
                {goalData.breakdown.cbc > 0 && (
                  <span className="bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700">
                    CBC: <strong className="text-emerald-300">{goalData.breakdown.cbc}</strong>
                  </span>
                )}
                {goalData.breakdown.remedial > 0 && (
                  <span className="bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700">
                    Remedial: <strong className="text-amber-300">{goalData.breakdown.remedial}</strong>
                  </span>
                )}
                {goalData.breakdown.nursery > 0 && (
                  <span className="bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700">
                    Nursery: <strong className="text-pink-300">{goalData.breakdown.nursery}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            
            {/* MANUAL COUNTER ADJUSTMENT (FOR OFFLINE / PAPER LESSONS) */}
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={handleDecrementManual}
                disabled={goalData.breakdown.manualLogged <= 0}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                title="Subtract manual plan"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleIncrementManual}
                className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                title="Manually log 1 prepared lesson plan"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>Log Plan</span>
              </button>
            </div>

            {/* AUTO-GENERATE PLANS BUTTON */}
            {!goalData.isGoalReached && (
              <button
                type="button"
                onClick={handleAutoGeneratePlans}
                disabled={isAutoGenerating}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                title="Automatically generate all remaining lesson plans for today instantly"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isAutoGenerating ? 'Generating...' : '⚡ Auto-Generate Plans'}</span>
              </button>
            )}

            {/* PRIMARY BUTTON TO PLAN A LESSON */}
            {onOpenPlanLesson && (
              <button
                type="button"
                onClick={onOpenPlanLesson}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Plan Lesson Now &rarr;</span>
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
