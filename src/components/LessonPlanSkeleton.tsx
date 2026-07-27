import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Clock, FileText, Cpu, Layers } from 'lucide-react';
import { LanguageOption, PlanFormatOption } from '../types';

interface LessonPlanSkeletonProps {
  language: LanguageOption;
  format?: PlanFormatOption;
  subject?: string;
  topic?: string;
}

const GENERATION_STEPS = {
  English: [
    'Analyzing REB Competence-Based Curriculum requirements...',
    'Defining Bloom\'s Taxonomy instructional objectives...',
    'Structuring Teacher and Learner step-by-step activities...',
    'Integrating Generic Competencies & Cross-Cutting Issues...',
    'Finalizing official REB Lesson Plan document layout...'
  ],
  Kinyarwanda: [
    'Gusesengura ingengabihe ya REB n\'ubushobozi bw\'amasomo...',
    'Gutegura intego z\'isomo n\'imfashanyigisho ziboneye...',
    'Guhanga ibikorwa by\'umwarimu n\'abanyeshuri ku ntera zose...',
    'Gushyiramo ubumenyi bw\'ibanze n\'ingingo ndangagaciro...',
    'Gusoza inyandiko y\'isomo yujuje ibipimo bya REB...'
  ],
  French: [
    'Analyse du programme d\'études basé sur les compétences REB...',
    'Définition des objectifs pédagogiques et de la taxonomie...',
    'Développement des activités de l\'enseignant et des apprenants...',
    'Intégration des compétences transversales...',
    'Finalisation du document de fiche de leçon officiel REB...'
  ]
};

export const LessonPlanSkeleton: React.FC<LessonPlanSkeletonProps> = ({
  language,
  format = 'reb_grid',
  subject,
  topic
}) => {
  const steps = GENERATION_STEPS[language] || GENERATION_STEPS.English;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(12);

  useEffect(() => {
    // Step timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1600);

    // Smooth progress bar simulation
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* AI Processing Status Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        {/* Glowing Background Pulse */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl animate-pulse" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 animate-spin-slow">
                <Cpu className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                    AI Lesson Plan Generation in Progress
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase border border-amber-300/30">
                    {language}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                  {subject && topic ? `${subject} • ${topic}` : 'Generating Official REB Competence-Based Curriculum Plan'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/50">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Please wait... (~3-5 sec)</span>
            </div>
          </div>

          {/* Animated Step Tracker */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-bounce" />
            <span className="text-xs text-emerald-100 font-semibold truncate transition-all duration-300">
              {steps[currentStepIndex]}
            </span>
          </div>

          {/* Shimmering Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-emerald-300 font-bold">
              <span>Generating document structure...</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Paper Document Mockup */}
      <div className="bg-white rounded-2xl border-2 border-emerald-100 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle Ambient Shimmer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/40 to-transparent animate-pulse pointer-events-none" />

        {/* Document Header Skeleton */}
        <div className="border-b-2 border-emerald-600 pb-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              {/* School Name Placeholder */}
              <div className="h-6 bg-slate-200 rounded-md w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-md w-1/2 animate-pulse" />
            </div>

            {/* Ministry / School Seal Placeholder */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 animate-pulse">
              <BookOpen className="w-7 h-7 text-emerald-400" />
            </div>
          </div>

          {/* Lesson Plan Title Bar */}
          <div className="h-8 bg-emerald-600/10 rounded-lg w-full flex items-center px-4 animate-pulse">
            <div className="h-4 bg-emerald-600/30 rounded w-1/3" />
          </div>

          {/* Metadata Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 animate-pulse">
                <div className="h-2.5 bg-slate-300 rounded w-1/2" />
                <div className="h-3.5 bg-slate-300 rounded w-4/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Competences & Objectives Section Skeleton */}
        <div className="space-y-4">
          {/* Unit Title & No */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 animate-pulse">
            <div className="h-3 bg-emerald-300/60 rounded w-1/4" />
            <div className="h-5 bg-emerald-300/40 rounded w-2/3" />
          </div>

          {/* Key Unit Competence */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 animate-pulse">
            <div className="h-3 bg-slate-400/60 rounded w-1/3" />
            <div className="h-3.5 bg-slate-200 rounded w-full" />
            <div className="h-3.5 bg-slate-200 rounded w-5/6" />
          </div>

          {/* Instructional Objective */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 animate-pulse">
            <div className="h-3 bg-slate-400/60 rounded w-2/5" />
            <div className="h-3.5 bg-slate-200 rounded w-11/12" />
            <div className="h-3.5 bg-slate-200 rounded w-3/4" />
          </div>

          {/* Materials & References Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 animate-pulse">
              <div className="h-3 bg-slate-300 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-4/5" />
            </div>
            <div className="p-3.5 border border-slate-200 rounded-xl space-y-2 animate-pulse">
              <div className="h-3 bg-slate-300 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-4/5" />
            </div>
          </div>
        </div>

        {/* REB Competence Table Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Description of Teaching and Learning Activity (CBC Table Steps)</span>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            {/* Table Header */}
            <div className="bg-emerald-800 text-white p-3 grid grid-cols-12 gap-2 text-[11px] font-extrabold">
              <div className="col-span-2">Step & Duration</div>
              <div className="col-span-4">Teacher's Activity</div>
              <div className="col-span-4">Learner's Activity</div>
              <div className="col-span-2">Competencies</div>
            </div>

            {/* Table Rows Skeleton */}
            {[
              { step: 'Introduction (5 min)', height: 'h-16' },
              { step: 'Development (30 min)', height: 'h-28' },
              { step: 'Conclusion (5 min)', height: 'h-16' }
            ].map((row, idx) => (
              <div
                key={idx}
                className={`p-3 grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50/50 items-start ${row.height}`}
              >
                {/* Step */}
                <div className="col-span-2 space-y-1.5 animate-pulse">
                  <div className="h-3.5 bg-emerald-200 rounded w-4/5 font-bold" />
                  <div className="h-2.5 bg-slate-300 rounded w-1/2" />
                </div>

                {/* Teacher Activity */}
                <div className="col-span-4 space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-300 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-11/12" />
                  {idx === 1 && <div className="h-3 bg-slate-200 rounded w-3/4" />}
                </div>

                {/* Learner Activity */}
                <div className="col-span-4 space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-300 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-10/12" />
                  {idx === 1 && <div className="h-3 bg-slate-200 rounded w-4/5" />}
                </div>

                {/* Competencies */}
                <div className="col-span-2 space-y-1.5 animate-pulse">
                  <div className="h-2.5 bg-slate-300 rounded w-full" />
                  <div className="h-2.5 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment & Self-Evaluation Skeleton Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-pulse">
            <div className="h-3 bg-slate-400/70 rounded w-2/5" />
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-pulse">
            <div className="h-3 bg-slate-400/70 rounded w-2/5" />
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
