import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Printer,
  Copy,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  ChevronDown,
  Layers,
  Calendar,
  User,
  GraduationCap,
  Check,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  LessonPlanRequest,
  LessonPlanData,
  UserProfile,
  LanguageOption
} from '../types';

interface RemedialPlanCreatorProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  onOpenSubscription?: () => void;
  onOpenSignIn?: () => void;
  onSavePlan?: (plan: LessonPlanData) => void;
  onSaveMultiplePlans?: (plans: LessonPlanData[]) => void;
  onBackToDashboard?: () => void;
}

export const RemedialPlanCreator: React.FC<RemedialPlanCreatorProps> = ({
  user,
  selectedLanguage,
  onOpenSubscription,
  onOpenSignIn,
  onSavePlan,
  onSaveMultiplePlans,
  onBackToDashboard
}) => {
  // Navigation tabs: 'single' | 'bulk'
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Form states matching Section A: General Information
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('tegura_saved_school') || '');
  const [district, setDistrict] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [period, setPeriod] = useState('60'); // Minutes
  const [lessonTitle, setLessonTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teacherName, setTeacherName] = useState(() => user?.name || localStorage.getItem('tegura_saved_teacher') || '');
  const [language, setLanguage] = useState<LanguageOption>(selectedLanguage || 'English');

  // Student Counts
  const [remedialCount, setRemedialCount] = useState('0');
  const [consolidationCount, setConsolidationCount] = useState('0');
  const [extensionCount, setExtensionCount] = useState('0');

  // Form states matching Section B: Learning Context & Challenges
  const [subject, setSubject] = useState('');
  const [mainProblemCategory, setMainProblemCategory] = useState('');
  const [specificChallenges, setSpecificChallenges] = useState('');
  const [teachingLearningAids, setTeachingLearningAids] = useState('');
  const [selfEvaluation, setSelfEvaluation] = useState('');

  // Generation UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanData | null>(null);
  const [generationProgressStep, setGenerationProgressStep] = useState(0);

  const progressMessages = [
    "Analyzing diagnostic review guidelines...",
    "Creating personalized remedial scaffolding...",
    "Drafting average-level consolidation tasks...",
    "Fleshing out high-order extension activities...",
    "Compiling full Remedial Learning Program (RLP) plan..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationProgressStep(0);
      interval = setInterval(() => {
        setGenerationProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Bulk generation states & handlers
  interface BulkItem {
    id: string;
    lessonTitle: string;
    status: 'idle' | 'generating' | 'completed' | 'failed';
    plan?: LessonPlanData;
    error?: string;
  }

  const [bulkItems, setBulkItems] = useState<BulkItem[]>([
    { id: '1', lessonTitle: 'Addition of Fractions', status: 'idle' },
    { id: '2', lessonTitle: 'Subtraction of Fractions', status: 'idle' },
    { id: '3', lessonTitle: 'Multiplication of Fractions', status: 'idle' },
  ]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgressPercent, setBulkProgressPercent] = useState(0);
  const [bulkLog, setBulkLog] = useState<string>('');
  const [bulkFinished, setBulkFinished] = useState(false);

  const handleAddBulkTopic = () => {
    if (bulkItems.length < 5) {
      setBulkItems(prev => [
        ...prev,
        { id: Math.random().toString(), lessonTitle: '', status: 'idle' }
      ]);
    }
  };

  const handleRemoveBulkTopic = (index: number) => {
    if (bulkItems.length > 1) {
      setBulkItems(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleBulkTopicChange = (index: number, val: string) => {
    setBulkItems(prev => prev.map((item, idx) => idx === index ? { ...item, lessonTitle: val } : item));
  };

  const handleDownloadWordBulk = (plan: LessonPlanData) => {
    const filename = `${plan.header.subject}_${plan.header.classGrade}_${(plan.header.lessonTitle || 'LessonPlan').replace(/[^a-zA-Z0-9]/g, '_')}_TeacherTool.doc`;
    
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${plan.header.lessonTitle || 'Lesson Plan'}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; }
          h1 { color: #0d9488; font-size: 20pt; text-align: center; margin-bottom: 5pt; }
          h2 { color: #0f766e; font-size: 14pt; margin-top: 15pt; border-bottom: 2px solid #0f766e; padding-bottom: 3pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 15pt; }
          th, td { border: 1px solid #94a3b8; padding: 6pt; text-align: left; font-size: 10pt; vertical-align: top; }
          th { background-color: #f1f5f9; color: #0f766e; font-weight: bold; }
          .header-label { font-weight: bold; color: #334155; }
          .footer-note { text-align: center; font-size: 8pt; color: #64748b; margin-top: 20pt; border-top: 1px solid #cbd5e1; padding-top: 10pt; }
        </style>
      </head>
      <body>
        <h1>REMEDIAL LEARNING SYSTEM (RLS) FOR REMEDIAL INITIATIVE</h1>
        <p style='text-align: center; font-size: 10pt; color: #0f766e; font-weight: bold;'>REB Competence-Based Curriculum (CBC) Remedial Program Compliant</p>
        
        <h2>A. General Information / Amakuru Rusange</h2>
        <table>
          <tr>
            <td width="25%"><span class="header-label">School / Ikigo:</span></td>
            <td width="25%">${plan.header.schoolName || 'N/A'}</td>
            <td width="25%"><span class="header-label">District / Akarere:</span></td>
            <td width="25%">${plan.header.district || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Class / Grade:</span></td>
            <td>${plan.header.classGrade || 'N/A'}</td>
            <td><span class="header-label">Period (minutes) / Duration:</span></td>
            <td>${plan.header.duration || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Teacher Name / Umwarimu:</span></td>
            <td>${plan.header.teacherName || 'N/A'}</td>
            <td><span class="header-label">Date / Itariki:</span></td>
            <td>${plan.header.date || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Lesson Topic / Inyito y'Isomo:</span></td>
            <td colspan="3">${plan.header.lessonTitle || 'N/A'}</td>
          </tr>
        </table>

        <h3>Student Differentiation Metrics / Imibare y'abanyeshuri (By'iciro)</h3>
        <table>
          <tr style="background-color: #f1f5f9;">
            <th width="33%">Group 1: Remediation / Abakeneye inyunganira</th>
            <th width="33%">Group 2: Consolidation / Abakomeza ubumenyi</th>
            <th width="34%">Group 3: Extension / Abihuta cyane</th>
          </tr>
          <tr>
            <td align="center"><b>${plan.header.remedialCount || '0'} Learners</b></td>
            <td align="center"><b>${plan.header.consolidationCount || '0'} Learners</b></td>
            <td align="center"><b>${plan.header.extensionCount || '0'} Learners</b></td>
          </tr>
          <tr>
            <td>${plan.header.remedialGroup1Category || 'Abakeneye inyunganira yihariye no gufashwa ku ntego z\'isomo'}</td>
            <td>${plan.header.remedialGroup2Category || 'Abageze ku ntego bakeneye imyitozo yo gukomeza ubumenyi'}</td>
            <td>${plan.header.remedialGroup3Category || 'Abihuta bakeneye ibibazo bitoroshye no gukaza ubumenyi'}</td>
          </tr>
        </table>

        <h2>B. Learning Context & Challenges / Imiterere y'ikibazo</h2>
        <table>
          <tr>
            <td width="30%"><span class="header-label">Subject / Isomo:</span></td>
            <td>${plan.header.subject || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Main Problem Category:</span></td>
            <td>${plan.header.mainProblemCategory || 'N/A'}</td>
          </tr>
          <tr>
            <td><span class="header-label">Specific Challenges:</span></td>
            <td>${(plan.header.specificChallenges || 'N/A').replace(/\n/g, '<br/>')}</td>
          </tr>
          <tr>
            <td><span class="header-label">Teaching & Learning Aids:</span></td>
            <td>${(plan.header.teachingLearningAids || 'N/A').replace(/\n/g, '<br/>')}</td>
          </tr>
        </table>

        <h2>C. Remedial Instruction Steps / Inyigisho n'Imyitozo</h2>
        <table>
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th width="15%">Step & Timing</th>
              <th width="35%">Teacher's Activities / Ibyo Umwarimu Akora</th>
              <th width="35%">Learner's Activities / Ibyo Umunyeshuri Akora</th>
              <th width="15%">Competences & Cross-Cutting / Ubushobozi n'Ibyambukiranya Amasomo</th>
            </tr>
          </thead>
          <tbody>
            ${plan.steps.map((step: any, idx: number) => `
              <tr>
                <td><strong>Step ${idx + 1}: ${step.stepName}</strong><br/><span style='color: #64748b;'>(${step.timing})</span></td>
                <td>${(step.teacherActivities || '').replace(/\n/g, '<br/>')}</td>
                <td>${(step.learnerActivities || '').replace(/\n/g, '<br/>')}</td>
                <td>${(step.competencesAndCrossCutting || '').replace(/\n/g, '<br/>')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>D. SELF-EVALUATION / ISUZUMA-BUMENYI</h2>
        <table style='width: 100%; border: 1px solid #cbd5e1;'>
          <tr>
            <td style='padding: 10pt;'>
              ${(plan.selfEvaluation || 'Teacher self-evaluation not completed yet.').replace(/\n/g, '<br/>')}
            </td>
          </tr>
        </table>

        <div class="footer-note">
          <p>Generated via <strong>Teacher Tool Platform</strong> • Developer & Support: Nkundimana Theogene (0781339530)</p>
          <p>&copy; ${new Date().getFullYear()} All Rights Reserved.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateBulkPlans = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = bulkItems.filter(item => item.lessonTitle.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Andika nibura inyito y\'isomo rimwe (Please enter at least one lesson topic).');
      return;
    }
    if (!subject.trim() || !classGrade.trim()) {
      setErrorMsg('Subject and Class are required.');
      return;
    }
    if (!user) {
      if (onOpenSignIn) onOpenSignIn();
      return;
    }

    if (!user.isAdmin && user.remainingPlans < validItems.length) {
      setErrorMsg(`Ufite gusa plans ${user.remainingPlans} zisigaye, ariko urashaka gukora plans ${validItems.length} rimwe. Banza ugure izindi plans cyangwa ugabanye umubare w'izisomwa.`);
      return;
    }

    setIsBulkGenerating(true);
    setBulkFinished(false);
    setErrorMsg(null);
    setBulkProgressPercent(0);

    // Save school/teacher name for convenience
    if (schoolName) localStorage.setItem('tegura_saved_school', schoolName);
    if (teacherName) localStorage.setItem('tegura_saved_teacher', teacherName);

    // Initialize/clean statuses
    const activeItems = validItems.map(item => ({
      ...item,
      status: 'idle' as const,
      error: undefined,
      plan: undefined
    }));
    setBulkItems(activeItems);

    const completedPlans: LessonPlanData[] = [];

    for (let i = 0; i < activeItems.length; i++) {
      const activeItem = activeItems[i];
      
      // Set to generating
      setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'generating' } : it));
      setBulkLog(`Generating plan ${i + 1} of ${activeItems.length}: "${activeItem.lessonTitle}"...`);

      const requestPayload: LessonPlanRequest = {
        schoolName,
        teacherName: teacherName || 'Teacher',
        term: 'Term 1',
        date,
        subject,
        classGrade,
        unitNo: `${i + 1}`,
        lessonNo: 'Remedial Session',
        duration: `${period} minutes`,
        classSize: `${parseInt(remedialCount || '0') + parseInt(consolidationCount || '0') + parseInt(extensionCount || '0')} learners`,
        specialNeeds: 'None',
        unitTitle: activeItem.lessonTitle,
        keyUnitCompetence: `Apply remedial strategies on ${activeItem.lessonTitle} to consolidate concepts and close learning gaps.`,
        lessonTitle: activeItem.lessonTitle,
        instructionalObjective: `By the end of the lesson, learners will master the concepts of ${activeItem.lessonTitle} via targeted RLP remediation, consolidation, and extension activities.`,
        location: 'In Classroom',
        learningMaterials: teachingLearningAids || 'Differentiated activity worksheets, chalkboard',
        references: 'REB National Competence-Based Curriculum Framework',
        language,
        format: 'remedial_grid',
        remedialCount: `${remedialCount} learners`,
        consolidationCount: `${consolidationCount} learners`,
        extensionCount: `${extensionCount} learners`,
        remedialGroup1Category: "Group 1: Remediation (Abakeneye inyunganira yihariye)",
        remedialGroup2Category: "Group 2: Consolidation (Abakomeza ubumenyi)",
        remedialGroup3Category: "Group 3: Extension (Abihuta / Extension)",
        remedialGroup4Category: "Peer tutoring support",
        district,
        mainProblemCategory,
        specificChallenges,
        teachingLearningAids
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
          throw new Error('Failed to generate this plan.');
        }

        const responseData = await response.json();
        const finalPlan: LessonPlanData = responseData.lessonPlan || responseData;

        completedPlans.push(finalPlan);
        
        // Update item with completed status and its plan
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'completed', plan: finalPlan } : it));
      } catch (err: any) {
        console.error(err);
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'failed', error: err?.message || 'Error occurred' } : it));
      }

      setBulkProgressPercent(Math.round(((i + 1) / activeItems.length) * 100));
    }

    setIsBulkGenerating(false);
    setBulkFinished(true);
    setBulkLog('Done! All bulk remedial plans have been processed.');

    // Save all to parent state
    if (completedPlans.length > 0) {
      if (onSaveMultiplePlans) {
        onSaveMultiplePlans(completedPlans);
      } else {
        try {
          const stored = localStorage.getItem('tegura_saved_plans') || localStorage.getItem('nkorera_saved_plans');
          const currentSaved: LessonPlanData[] = stored ? JSON.parse(stored) : [];
          const merged = [...completedPlans, ...currentSaved];
          const unique = merged.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);
          localStorage.setItem('tegura_saved_plans', JSON.stringify(unique));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !classGrade.trim() || !lessonTitle.trim()) {
      setErrorMsg('Subject, Class, and Lesson Topic are required.');
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
      term: 'Term 1',
      date,
      subject,
      classGrade,
      unitNo: '1',
      lessonNo: 'Remedial Session',
      duration: `${period} minutes`,
      classSize: `${parseInt(remedialCount || '0') + parseInt(consolidationCount || '0') + parseInt(extensionCount || '0')} learners`,
      specialNeeds: 'None',
      unitTitle: lessonTitle,
      keyUnitCompetence: `Apply remedial strategies on ${lessonTitle} to consolidate concepts and close learning gaps.`,
      lessonTitle,
      instructionalObjective: `By the end of the lesson, learners will master the concepts of ${lessonTitle} via targeted RLP remediation, consolidation, and extension activities.`,
      location: 'In Classroom',
      learningMaterials: teachingLearningAids || 'Differentiated activity worksheets, chalkboard',
      references: 'REB National Competence-Based Curriculum Framework',
      language,
      format: 'remedial_grid',
      remedialCount: `${remedialCount} learners`,
      consolidationCount: `${consolidationCount} learners`,
      extensionCount: `${extensionCount} learners`,
      remedialGroup1Category: "Group 1: Remediation (Abakeneye inyunganira yihariye)",
      remedialGroup2Category: "Group 2: Consolidation (Abakomeza ubumenyi)",
      remedialGroup3Category: "Group 3: Extension (Abihuta / Extension)",
      remedialGroup4Category: "Peer tutoring support",
      district,
      mainProblemCategory,
      specificChallenges,
      teachingLearningAids,
      additionalNotes: selfEvaluation
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
        throw new Error('Failed to generate. Please check quota or network and try again.');
      }

      const responseData = await response.json();
      
      // The API returns { lessonPlan: ... } or the raw data
      const finalPlan: LessonPlanData = responseData.lessonPlan || responseData;
      if (selfEvaluation) {
        finalPlan.selfEvaluation = selfEvaluation;
      }

      if (onSavePlan) {
        onSavePlan(finalPlan);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to generate remedial lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Dashboard Button */}
      <div className="mb-6 print:hidden">
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back to Dashboard</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs (Single vs Bulk) */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 print:hidden">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-4 text-center font-black text-sm transition-all border-b-2 ${
              activeTab === 'single'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Single Lesson Plan
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-4 text-center font-black text-sm transition-all border-b-2 ${
              activeTab === 'bulk'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Bulk Generate
          </button>
        </div>

        {activeTab === 'single' ? (
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">Generate Your Remedial Learning Lesson Plan</h2>
              <div className="h-0.5 bg-amber-500 w-full mt-2" />
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-8">
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SECTION A: GENERAL INFORMATION */}
              <div className="space-y-6">
                <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                  <span>A. General Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* School Name */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      School Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., GS Kigali"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      District
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Kicukiro"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Class */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Class
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., S3ABC"
                      value={classGrade}
                      onChange={(e) => setClassGrade(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Period (minutes) */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Period (minutes)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="60"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Lesson Topic */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-slate-800 text-sm font-bold">
                      Lesson Topic
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Determining the equation of lines given two points"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm cursor-pointer"
                    />
                  </div>

                  {/* Teacher Name */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-slate-800 text-sm font-bold">
                      Language
                    </label>
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Kinyarwanda">Kinyarwanda</option>
                        <option value="French">French</option>
                        <option value="Swahili">Swahili</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Student Differentiation Metrics */}
                <div className="mt-6 pt-4 space-y-4">
                  {/* Learners Needing Remediation */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Students needing remediation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 35"
                      value={remedialCount}
                      onChange={(e) => setRemedialCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                    />
                  </div>

                  {/* Students Needing Consolidation */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Students needing consolidation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 25"
                      value={consolidationCount}
                      onChange={(e) => setConsolidationCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                    />
                  </div>

                  {/* Students Needing Extended Activities */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Students needing extended activities
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 13"
                      value={extensionCount}
                      onChange={(e) => setExtensionCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: LEARNING CONTEXT & CHALLENGES */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                  <span>B. Learning Context & Challenges</span>
                </h3>

                <div className="space-y-6">
                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mathematics, Physics, Chemistry, Biology, English, etc."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Main Problem Type or Category */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Main Problem Type or Category
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Conceptual understanding, Procedural skills, Processing speed, Visual"
                      value={mainProblemCategory}
                      onChange={(e) => setMainProblemCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-400 text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Conceptual understanding', 'Procedural skills', 'Processing speed', 'Visual/Spatial'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMainProblemCategory(cat)}
                          className="px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-100 transition-all cursor-pointer select-none"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Challenges */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 text-sm font-bold">
                      Specific Challenges (Describe the problems students are facing)
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="e.g., Difficulty in understanding the concept of gradient, Struggles with applying the formula for the equation of a line, Slow processing speed in solving mathematical problems, Inability to visualize and graph lines"
                      value={specificChallenges}
                      onChange={(e) => setSpecificChallenges(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Teaching and Learning Aids Available */}
                  <div className="space-y-1.5">
                    <label className="block text-[#1e293b] text-sm font-bold">
                      Teaching and Learning Aids Available
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g., Graph paper, Whiteboard and markers, Step-by-step worksheets, Visual aids (charts showing slope and line equations), Interactive geometry software (if available), Calculators"
                      value={teachingLearningAids}
                      onChange={(e) => setTeachingLearningAids(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                    />
                  </div>

                  {/* Teacher's Self-Evaluation */}
                  <div className="space-y-1.5">
                    <label className="block text-[#1e293b] text-sm font-bold flex items-center justify-between">
                      <span>Teacher's Self-Evaluation (Isuzuma-Bumenyi Bwa Mwarimu)</span>
                      <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Note initial diagnostic observations, post-lesson evaluation guidelines, or expected outcome reflections..."
                      value={selfEvaluation}
                      onChange={(e) => setSelfEvaluation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1.5 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating Intelligent Lesson Plan...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Generate Intelligent Lesson Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* SKELETON LOADER STATE */}
            {isGenerating && (
              <div className="mt-8 p-8 border border-emerald-100 rounded-2xl bg-emerald-50/20 text-center space-y-4 animate-pulse">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <p className="text-slate-800 font-black text-lg">
                    {progressMessages[generationProgressStep]}
                  </p>
                  <p className="text-slate-400 text-xs font-semibold">
                    This takes roughly 15-30 seconds. Do not reload or close this page.
                  </p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-1000 rounded-full"
                    style={{ width: `${((generationProgressStep + 1) / progressMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BULK GENERATE TAB */
          <div className="p-6 md:p-8">
            {!user ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <User className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-black text-slate-800 text-lg">Banza Winjire / Sign In Required</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Banza winjire cyangwa wiyandikishe kugira ngo ubashe gukora lesson plans z'inyunganira nyinshi icyarimwe (bulk generate).
                  </p>
                </div>
                {onOpenSignIn && (
                  <button
                    onClick={onOpenSignIn}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Injira Muri Konti (Sign In)
                  </button>
                )}
              </div>
            ) : !user.isAdmin && user.remainingPlans <= 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-black text-slate-800 text-lg">Bulk Remedial Generator</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Ufite plans 0 zisigaye. Gukoresha bulk generate bisaba kuba ufite plans zisigaye kuri konti yawe cyangwa waguze ifatabuguzi rya Premium.
                  </p>
                </div>
                {onOpenSubscription && (
                  <button
                    onClick={onOpenSubscription}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Gura plans / Upgrade to Premium
                  </button>
                )}
              </div>
            ) : isBulkGenerating || bulkFinished ? (
              /* BULK GENERATION PROGRESS & RESULTS */
              <div className="space-y-6">
                {/* Header */}
                <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-950 text-base">
                        {bulkFinished ? 'Bulk Generation Completed!' : 'Generating Bulk Remedial Plans...'}
                      </h3>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">
                        {bulkLog}
                      </p>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 font-black text-sm px-3 py-1 rounded-full shrink-0">
                      {bulkProgressPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-500"
                      style={{ width: `${bulkProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Bulk Items Grid */}
                <div className="space-y-3">
                  {bulkItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 border border-slate-200/80 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                          <h4 className="font-black text-slate-900 text-sm">{item.lessonTitle || 'Untitled Topic'}</h4>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold">
                          {subject} • {classGrade}
                        </p>
                      </div>

                      {/* Item Status and Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                        {item.status === 'idle' && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/60 text-slate-600 rounded-full text-xs font-black">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Queued</span>
                          </div>
                        )}
                        {item.status === 'generating' && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-full text-xs font-black">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating...</span>
                          </div>
                        )}
                        {item.status === 'failed' && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-black">
                            <X className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </div>
                        )}
                        {item.status === 'completed' && item.plan && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-black">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Done</span>
                            </div>
                            
                            <button
                              onClick={() => onSavePlan && onSavePlan(item.plan!)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              View Plan
                            </button>

                            <button
                              onClick={() => handleDownloadWordBulk(item.plan!)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                              title="Download Word Document"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Finish actions */}
                {bulkFinished && (
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setBulkFinished(false);
                        setIsBulkGenerating(false);
                      }}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Kora Izindi (Generate More)</span>
                    </button>
                    <button
                      onClick={onBackToDashboard}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Meza / Go to Dashboard
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* BULK FORM INPUTS */
              <form onSubmit={handleGenerateBulkPlans} className="space-y-8 animate-in fade-in duration-200">
                {errorMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-bold flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Section A: General Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-emerald-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">A</span>
                    <span>General Information / Amakuru Rusange</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* School */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">School / Ikigo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Izina ry'ikigo"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                    </div>

                    {/* District */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">District / Akarere *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter school district / Akarere ikigo giherereyemo"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                    </div>

                    {/* Class */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">Class / Umwaka *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., S3 ABC"
                        value={classGrade}
                        onChange={(e) => setClassGrade(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                    </div>

                    {/* Period (minutes) */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">Period (minutes) / Igihe cy'isomo *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 60"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                    </div>

                    {/* Teacher Name */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">Teacher Name / Izina ry'Umwarimu</label>
                      <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">Date / Itariki</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm cursor-pointer"
                      />
                    </div>

                    {/* Language */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-slate-800 text-sm font-black">Language / Ururimi</label>
                      <div className="relative">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="English">English</option>
                          <option value="Kinyarwanda">Kinyarwanda</option>
                          <option value="French">French</option>
                          <option value="Swahili">Swahili</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Sub-section: Student Differentiation Metrics */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">
                      Students Differentiation Metrics / Imibare y'abanyeshuri (By'iciro)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Learners Needing Remediation */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-800 text-sm font-black">
                          Needing Remediation / Abakeneye inyunganira *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={remedialCount}
                          onChange={(e) => setRemedialCount(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                        />
                      </div>

                      {/* Students Needing Consolidation */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-800 text-sm font-black">
                          Needing Consolidation / Abakomeza ubumenyi *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={consolidationCount}
                          onChange={(e) => setConsolidationCount(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                        />
                      </div>

                      {/* Students Needing Extended Activities */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-800 text-sm font-black">
                          Needing Extension / Abihuta cyane *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={extensionCount}
                          onChange={(e) => setExtensionCount(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-bold text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Learning Context & Challenges */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-black text-emerald-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">B</span>
                    <span>Learning Context & Challenges / Imiterere y'ikibazo</span>
                  </h3>

                  <div className="space-y-6">
                    {/* Subject / Isomo */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">
                        Subject / Isomo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Mathematics"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                    </div>

                    {/* Main Problem Type or Category */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">
                        Main Problem Type or Category *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Conceptual understanding, Procedural skills, Processing speed, Visual"
                        value={mainProblemCategory}
                        onChange={(e) => setMainProblemCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Conceptual understanding', 'Procedural skills', 'Processing speed', 'Visual/Spatial difficulties'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setMainProblemCategory(cat)}
                            className="px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-100 transition-all cursor-pointer select-none"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Specific Challenges */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">
                        Specific Challenges / Ikibazo cyihariye bafite *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe the problems students are facing"
                        value={specificChallenges}
                        onChange={(e) => setSpecificChallenges(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                      />
                    </div>

                    {/* Teaching and Learning Aids Available */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 text-sm font-black">
                        Teaching and Learning Aids Available / Imfashanyigisho zihari *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g., Graph paper, worksheets, slope charts"
                        value={teachingLearningAids}
                        onChange={(e) => setTeachingLearningAids(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder-slate-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Bulk Topics list */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-emerald-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">C</span>
                      <span>Lesson Topics to Generate (Inyito z'Amasomo)</span>
                    </h3>

                    <button
                      type="button"
                      onClick={handleAddBulkTopic}
                      disabled={bulkItems.length >= 5}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+ Add Lesson</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bulkItems.map((item, index) => (
                      <div key={item.id} className="flex gap-3 items-center animate-in fade-in-20 duration-150">
                        <span className="text-sm font-black text-slate-400 shrink-0 w-6">#{index + 1}</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            value={item.lessonTitle}
                            onChange={(e) => handleBulkTopicChange(index, e.target.value)}
                            placeholder={`e.g., Lesson topic ${index + 1}`}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-semibold text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkTopic(index)}
                          disabled={bulkItems.length <= 1}
                          className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all text-slate-400 disabled:opacity-40"
                          title="Remove topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit row */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onBackToDashboard}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Bulk Generate Plans ({bulkItems.length})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
