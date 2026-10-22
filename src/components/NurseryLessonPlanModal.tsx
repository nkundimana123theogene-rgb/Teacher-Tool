import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Sparkles, 
  Edit3, 
  Eye, 
  RotateCcw, 
  FileText,
  CheckCircle,
  Cloud,
  Award,
  Zap,
  CreditCard,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { NurseryLessonPlanData } from '../types';
import { 
  NURSERY_SUBSCRIPTION_PLANS, 
  getNurserySubscriptionStatus, 
  checkCanCreateNurseryLessonPlan, 
  consumeNurseryLessonPlan, 
  activateNurserySubscriptionPlan,
  SubscriptionData
} from '../utils/subscription';
import { auth, saveNurseryPlanToFirestore } from '../utils/firebase';
import { getUIText } from '../utils/translations';
import { exportNurseryLessonPlanToPdf } from '../utils/jspdfExporter';

interface NurseryLessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'create' | 'edit';
  onOpenSubscription?: () => void;
  onRequireSubscription?: (warningMsg: string) => void;
}

const LOCAL_STORAGE_KEY = 'nkorera_active_nursery_plan';

export const NURSERY_SAMPLES: Record<string, Partial<NurseryLessonPlanData>> = {
  English: {
    language: 'English',
    subject: 'Numbers & Pre-Maths',
    lessonName: 'Learning to Count Objects (1 to 5)',
    competenceFocus: 'Counting concrete objects 1-5, identifying quantities, and recognizing corresponding numerals.',
    instructionalObjective: 'Given colorful counters and number cards, Nursery 1 children will be able to accurately count objects from 1 to 5 and match them with their corresponding number symbols.',
    learningMaterials: 'Number flashcards 1-5, colorful counting beads, bottle caps, animal toys, blackboard, nursery rhymes.',
    steps: {
      greetingCircle: {
        duration: '5 min',
        activities: 'Welcoming song "Good morning friends", weather check, feelings check-in, and counting fingers 1-5 together.'
      },
      guidedLearning: {
        duration: '15 min',
        activities: 'Teacher demonstrates counting real objects (bottle caps/beads) from 1 to 5. Children take turns picking a number card and placing the matching count of beads.'
      },
      creativePlay: {
        duration: '5 min',
        activities: 'Fun group game "Number Hop" and tracing numbers 1 to 5 in sand trays or with large crayons on paper.'
      },
      recapAndGoodbye: {
        duration: '5 min',
        activities: 'Singing the number song 1-5, quick joyful review of counted items, and farewell chant.'
      }
    },
    evaluationComments: ''
  },
  Kinyarwanda: {
    language: 'Kinyarwanda',
    subject: 'Kubara n\'Imibare',
    lessonName: 'Kwiga Kubara Ibintu kuva kuri 1 kugeza kuri 5',
    competenceFocus: 'Gushobora kubara ibintu bifatika 1-5, gutandukanya ingano yabyo, no kumenya ibimenyetso by\'imibare.',
    instructionalObjective: 'Hifashishijwe ibikoresho bibarika n\'amakarita y\'imibare, abana b\'incuke bazashobora kubara neza ibintu bitandukanye kuva kuri 1 kugeza kuri 5 no kubihuza n\'imibare yabyo.',
    learningMaterials: 'Amakarita y\'imibare 1-5, uduti, uducupa, utubuye duto dusukuye, amashusho y\'inyamaswa, indirimbo z\'abana.',
    steps: {
      greetingCircle: {
        duration: '5 min',
        activities: 'Indirimbo yo guha ikaze abana "Mwaramutse nshuti zanjye", kuraba uko ikirere cyifashe, no gusuhuza buri mwana mu izina rye.'
      },
      guidedLearning: {
        duration: '15 min',
        activities: 'Mwarimu yereka abana uko babara uducupa 1 kugeza kuri 5. Buri mwana ahabwa umwanya wo gutoranya ikarita y\'umubare maze agashyiraho umubare w\'ibintu bihwanye na wo.'
      },
      creativePlay: {
        duration: '5 min',
        activities: 'Umukino wo gusimbuka ku mibare yanditse hasi no gushushanya imibare mu mucanga cyangwa n\'amarangi.'
      },
      recapAndGoodbye: {
        duration: '5 min',
        activities: 'Gusubiramo indirimbo y\'imibare 1 kugeza kuri 5, gushimira abana bose kubera ubushake, no kubasezera neza.'
      }
    },
    evaluationComments: ''
  },
  French: {
    language: 'French',
    subject: 'Nombres et Pré-Mathématiques',
    lessonName: 'Apprendre à Compter les Objets de 1 à 5',
    competenceFocus: 'Compter des objets concrets de 1 à 5, associer les quantités aux symboles numériques correspondants.',
    instructionalObjective: 'À l\'aide de jetons colorés et de cartes de chiffres, les enfants de maternelle seront capables de compter correctement des objets de 1 à 5 et de les associer à leurs chiffres respectifs.',
    learningMaterials: 'Cartes numérotées 1-5, perles colorées, bouchons de bouteilles, figurines d\'animaux, tableau.',
    steps: {
      greetingCircle: {
        duration: '5 min',
        activities: 'Chanson d\'accueil "Bonjour les amis", observation de la météo du jour et échauffement avec comptine des doigts.'
      },
      guidedLearning: {
        duration: '15 min',
        activities: 'L\'enseignant montre comment compter 1 à 5 objets concrets. Les enfants choisissent à tour de rôle une carte de chiffre et placent le nombre exact de perles.'
      },
      creativePlay: {
        duration: '5 min',
        activities: 'Jeu de saut sur les chiffres tracés au sol et modelage des chiffres 1 à 5 avec de la pâte à modeler.'
      },
      recapAndGoodbye: {
        duration: '5 min',
        activities: 'Chant récapitulatif des nombres 1 à 5, félicitations aux enfants pour leur participation et au revoir.'
      }
    },
    evaluationComments: ''
  },
  Kiswahili: {
    language: 'Kiswahili',
    subject: 'Hesabu za Awali (Nambari)',
    lessonName: 'Kujifunza Kuhesabu Vitu kuanzia 1 hadi 5',
    competenceFocus: 'Kuweza kuhesabu vitu halisi 1-5, kutambua idadi na kuhusisha na alama za nambari.',
    instructionalObjective: 'Kwa kutumia kadi za nambari na vifaa vya kuhesabia, watoto wa chekechea wataweza kuhesabu vitu kuanzia 1 hadi 5 na kuvioanisha na nambari husika.',
    learningMaterials: 'Kadi za nambari 1-5, vifuniko vya chupa, shanga za rangi, vinyago vya wanyama, ubao.',
    steps: {
      greetingCircle: {
        duration: '5 min',
        activities: 'Wimbo wa makaribisho "Habari za asubuhi marafiki", kutazama hali ya hewa, na kuhesabu vidole 1 hadi 5 pamoja.'
      },
      guidedLearning: {
        duration: '15 min',
        activities: 'Mwalimu anaonyesha jinsi ya kuhesabu vitu halisi 1 hadi 5. Watoto wanashiriki kwa zamu kuchukua kadi ya nambari na kuweka idadi inayolingana ya shanga.'
      },
      creativePlay: {
        duration: '5 min',
        activities: 'Mchezo wa kuruka juu ya nambari na kuchora nambari kwenye mchanga au karatasi kwa rangi.'
      },
      recapAndGoodbye: {
        duration: '5 min',
        activities: 'Kuimba wimbo wa nambari 1-5, kurudia muhtasari wa somo, na kuagana kwa furaha.'
      }
    },
    evaluationComments: ''
  }
};

const SAMPLE_NURSERY_PLAN: NurseryLessonPlanData = {
  id: 'np_sample',
  schoolName: 'Nkorera Nursery School',
  teacherName: 'Teacher Name',
  term: 'Term 1',
  date: new Date().toISOString().split('T')[0],
  subject: 'Numbers & Pre-Maths',
  classLevel: 'Nursery 1',
  lessonName: 'Learning to Count Objects (1 to 5)',
  duration: '30',
  classSize: '20',
  language: 'English',
  competenceFocus: 'Counting concrete objects 1-5, identifying quantities, and recognizing corresponding numerals.',
  instructionalObjective: 'Given colorful counters and number cards, Nursery 1 children will be able to accurately count objects from 1 to 5 and match them with their corresponding number symbols.',
  learningMaterials: 'Number flashcards 1-5, colorful counting beads, bottle caps, animal toys, blackboard, nursery rhymes.',
  steps: {
    greetingCircle: {
      duration: '5 min',
      activities: 'Welcoming song "Good morning friends", weather check, feelings check-in, and counting fingers 1-5 together.'
    },
    guidedLearning: {
      duration: '15 min',
      activities: 'Teacher demonstrates counting real objects (bottle caps/beads) from 1 to 5. Children take turns picking a number card and placing the matching count of beads.'
    },
    creativePlay: {
      duration: '5 min',
      activities: 'Fun group game "Number Hop" and tracing numbers 1 to 5 in sand trays or with large crayons on paper.'
    },
    recapAndGoodbye: {
      duration: '5 min',
      activities: 'Singing the number song 1-5, quick joyful review of counted items, and farewell chant.'
    }
  },
  evaluationComments: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const NurseryLessonPlanModal: React.FC<NurseryLessonPlanModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'create',
  onOpenSubscription,
  onRequireSubscription
}) => {
  const [plan, setPlan] = useState<NurseryLessonPlanData>(SAMPLE_NURSERY_PLAN);
  const [activeTab, setActiveTab] = useState<'sheet' | 'form'>('form');
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Nursery Subscription Status State
  const [nurserySub, setNurserySub] = useState<SubscriptionData>(getNurserySubscriptionStatus());
  const [showSubscriptionPackages, setShowSubscriptionPackages] = useState<boolean>(false);

  const ui = getUIText(plan.language || 'English');

  const printSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNurserySub(getNurserySubscriptionStatus());
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setPlan(JSON.parse(saved));
      } else {
        setPlan({
          ...SAMPLE_NURSERY_PLAN,
          id: `np_${Math.random().toString(36).substring(2, 9)}`,
          date: new Date().toISOString().split('T')[0]
        });
      }

      setActiveTab('form');
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
    }
  }, [plan, isOpen]);

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'language') {
      handleLanguageSelect(value);
      return;
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPlan(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        },
        updatedAt: new Date().toISOString()
      }));
    } else {
      setPlan(prev => ({
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  const handleStepChange = (stepKey: keyof NurseryLessonPlanData['steps'], field: 'duration' | 'activities', value: string) => {
    setPlan(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepKey]: {
          ...prev.steps[stepKey],
          [field]: value
        }
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleGenerateAi = async () => {
    const subCheck = checkCanCreateNurseryLessonPlan();
    if (!subCheck.canCreate) {
      if (onRequireSubscription) {
        onRequireSubscription(subCheck.message || 'Your subscription has expired or you have run out of credits. Please choose a Nursery subscription package.');
      } else if (onOpenSubscription) {
        onOpenSubscription();
      } else {
        setShowSubscriptionPackages(true);
        alert(subCheck.message || 'Your subscription has expired or you have run out of lesson plan credits. Please choose a subscription package.');
      }
      return;
    }

    setIsGeneratingAi(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nursery-lesson-plan',
          email: auth.currentUser?.email || 'guest@nkorera.rw',
          params: {
            schoolName: plan.schoolName,
            teacherName: plan.teacherName,
            term: plan.term,
            date: plan.date,
            subject: plan.subject,
            classLevel: plan.classLevel,
            lessonName: plan.lessonName,
            duration: plan.duration,
            classSize: plan.classSize,
            language: plan.language
          }
        })
      });

      const data = await response.json();
      if (data && data.success && data.result) {
        setPlan(data.result);
        setActiveTab('sheet');
        const updatedNurserySub = consumeNurseryLessonPlan();
        setNurserySub(updatedNurserySub);
        const rem = Math.max(0, updatedNurserySub.totalPlansAllowed - updatedNurserySub.usedPlansCount);
        const remNotice = ` (Hasigaye: ${rem} plans)`;
        setSuccessMessage(`✨ Nursery Lesson Plan generated successfully with AI!${remNotice}`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.error(err);
      alert('AI Generation failed. Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleLanguageSelect = async (lang: string) => {
    const normalizedLang = (lang === 'French' || lang === 'Français') ? 'French' : lang;
    
    // 1. INSTANT 0ms UI Update: Immediately adapt the ENTIRE lesson plan into the selected language
    const nativeSample = NURSERY_SAMPLES[normalizedLang] || NURSERY_SAMPLES[lang] || NURSERY_SAMPLES.English;
    if (nativeSample) {
      setPlan(prev => ({
        ...prev,
        ...nativeSample,
        language: lang,
        schoolName: prev.schoolName || 'Nkorera Nursery School',
        teacherName: prev.teacherName || 'Teacher Name',
        term: prev.term || 'Term 1',
        date: prev.date || new Date().toISOString().split('T')[0],
        classLevel: prev.classLevel || 'Nursery 1',
        classSize: prev.classSize || '20',
        duration: prev.duration || '30',
        updatedAt: new Date().toISOString()
      }));
    }

    const msg = 
      lang === 'Kinyarwanda' ? '✨ Isomo ryose ryahinduwe mu Kinyarwanda neza!' :
      (lang === 'French' || lang === 'Français') ? '✨ Fiche de leçon traduite en Français avec succès !' :
      lang === 'Kiswahili' ? '✨ Somo lote limetafsiriwa kwa Kiswahili!' :
      `✨ Entire Lesson Plan translated into ${lang} successfully!`;
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4500);

    // 2. Call backend translation to translate any specific custom text
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/translate-nursery-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: {
            ...plan,
            language: lang
          },
          targetLanguage: lang
        })
      });

      const data = await response.json();
      if (data && data.success && data.translatedPlan) {
        setPlan(prev => ({
          ...prev,
          ...data.translatedPlan,
          schoolName: prev.schoolName || data.translatedPlan.schoolName,
          teacherName: prev.teacherName || data.translatedPlan.teacherName,
          language: lang,
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.warn('AI Nursery translation background sync:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveCloud = async () => {
    if (!auth.currentUser) {
      alert('Please sign in to save to cloud.');
      return;
    }

    setIsSavingCloud(true);
    try {
      await saveNurseryPlanToFirestore(plan);
      setSuccessMessage('☁️ Saved to Cloud!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save to cloud.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      await exportNurseryLessonPlanToPdf(plan, plan.language || 'English');
      setSuccessMessage('📥 PDF ya Nursery Lesson Plan yamanutse neza! (PDF Downloaded with jsPDF)');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error generating Nursery PDF with jsPDF, trying DOM fallback:', error);
      const element = printSheetRef.current || document.getElementById('nursery-lesson-plan-document');
      if (element) {
        try {
          const html2pdfModule = (await import('html2pdf.js')).default;
          const sanitizedSubject = (plan.subject || 'Nursery').replace(/[^a-zA-Z0-9_-]/g, '_');
          const sanitizedClass = (plan.classLevel || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
          const opt = {
            margin:       [6, 6, 6, 6] as [number, number, number, number],
            filename:     `REB_NURSERY_LESSON_PLAN_${sanitizedSubject}_${sanitizedClass}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
          };
          await html2pdfModule().set(opt).from(element).save();
        } catch (err2) {
          console.error('DOM PDF Fallback failed:', err2);
          window.print();
        }
      } else {
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-3 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-[98vw] 2xl:max-w-7xl h-[97vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-800/15">
        
        {/* Sleek Compact Header Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">Nursery Lesson Plan Studio</h2>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-500/30 text-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">REB ECE Standard</span>
              </div>
              <p className="text-emerald-200/90 text-xs hidden md:block">Prepare comprehensive early childhood education lesson plans quickly</p>
            </div>
          </div>
          
          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Tab switchers */}
            <div className="flex bg-black/25 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'form' 
                    ? 'bg-white text-emerald-900 shadow-md scale-100' 
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>✏️ Editor Form</span>
              </button>
              <button 
                onClick={() => setActiveTab('sheet')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'sheet' 
                    ? 'bg-white text-emerald-900 shadow-md scale-100' 
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>📄 1-Page Sheet</span>
              </button>
            </div>

            {/* AI Generate */}
            <button 
              onClick={handleGenerateAi}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl transition-all font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              title="Generate / auto-complete with AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Generating...' : '✨ AI Generate'}</span>
            </button>

            {/* Download PDF */}
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              title="Download 1-Page PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingPdf ? 'Processing...' : '📥 Download in PDF'}</span>
            </button>

            {/* Print */}
            <button 
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold border border-white/10"
              title="Print Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Cloud Backup */}
            <button 
              onClick={handleSaveCloud}
              disabled={isSavingCloud}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold border border-white/10"
              title="Save to Cloud"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSavingCloud ? 'animate-pulse' : ''}`} />
              <span>{isSavingCloud ? 'Saving...' : 'Cloud'}</span>
            </button>

            {/* Close */}
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 ml-1 text-white hover:text-red-300"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compact Language & Status Sub-bar */}
        <div className="px-4 sm:px-6 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <span>🌍 Lesson Language:</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {['English', 'Kinyarwanda', 'French', 'Kiswahili'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  disabled={isGeneratingAi}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                    plan.language === lang
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30 font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300'
                  }`}
                >
                  {isGeneratingAi && plan.language === lang ? 'Translating...' : (lang === 'French' ? 'Français' : lang)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-slate-600 font-semibold text-xs flex-wrap">
            {/* Quick Subscription Status Pill */}
            <button
              onClick={() => {
                if (onOpenSubscription) {
                  onOpenSubscription();
                } else {
                  setShowSubscriptionPackages(prev => !prev);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer shadow-sm ${
                nurserySub.status === 'ACTIVE' && (nurserySub.totalPlansAllowed - nurserySub.usedPlansCount) > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
              title="Click here to view subscription or buy more packages"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Subscription: <strong className="text-emerald-700">{Math.max(0, nurserySub.totalPlansAllowed - nurserySub.usedPlansCount)} Plans Left</strong>
              </span>
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded text-[10px] font-black uppercase">
                ⚡ Buy Package
              </span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                isEditing ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? '🔓 Mode: Editable' : '🔒 Mode: View Only'}</span>
            </button>
          </div>
        </div>

        {/* Success Notification Alert */}
        {successMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-900 font-bold text-sm animate-in slide-in-from-top duration-300 shadow-sm shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="flex-1">{successMessage}</p>
          </div>
        )}

        {/* Main Content Area - Maximized Spacious Workspace */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 custom-scrollbar bg-slate-100/70">
          {activeTab === 'form' ? (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6">
              
              {/* SPECIAL SECTION: NURSERY SUBSCRIPTION STATUS & 10 PACKAGES CARD */}
              <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-lg border-2 border-amber-500/40 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Nursery Subscription Status
                        </span>
                        {nurserySub.status === 'ACTIVE' && (nurserySub.totalPlansAllowed - nurserySub.usedPlansCount) > 0 ? (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                            ACTIVE 🟢
                          </span>
                        ) : (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                            DEPLETED / EXPIRED 🔴
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {nurserySub.planName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSubscriptionPackages(prev => !prev)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{showSubscriptionPackages ? 'Hide 10 Packages' : 'View 10 Subscription Packages'}</span>
                      {showSubscriptionPackages ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {onOpenSubscription && (
                      <button
                        onClick={onOpenSubscription}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        ⚡ Open Checkout Modal
                      </button>
                    )}
                  </div>
                </div>

                {/* Status KPI Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Remaining Plans:</span>
                    <span className={`font-black text-sm ${Math.max(0, nurserySub.totalPlansAllowed - nurserySub.usedPlansCount) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Math.max(0, nurserySub.totalPlansAllowed - nurserySub.usedPlansCount)} Plans Remaining
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Used Plans:</span>
                    <span className="text-amber-300 font-black text-sm">
                      {nurserySub.usedPlansCount} / {nurserySub.totalPlansAllowed} Plans
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Expiry Date:
                    </span>
                    <span className="text-slate-200 font-bold text-xs font-mono">
                      {new Date(nurserySub.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* THE EXACT 10 NURSERY SUBSCRIPTION PACKAGES GRID */}
                {showSubscriptionPackages && (
                  <div className="pt-3 space-y-3 border-t border-slate-800 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Choose from these 10 Nursery Subscription Packages:
                      </h4>
                      <span className="text-[11px] text-slate-400 italic">(Standard 30 Days)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {NURSERY_SUBSCRIPTION_PLANS.map((pkg, idx) => {
                        const isCurrentActive = nurserySub.planId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => {
                              if (pkg.priceFrw === 0) {
                                const updated = activateNurserySubscriptionPlan(pkg.id);
                                setNurserySub(updated);
                                setSuccessMessage(`✨ ${pkg.name} activated successfully!`);
                                setTimeout(() => setSuccessMessage(null), 4000);
                              } else if (onOpenSubscription) {
                                onOpenSubscription();
                              } else if (onRequireSubscription) {
                                onRequireSubscription(`Would you like to subscribe to: ${pkg.name}`);
                              } else {
                                const updated = activateNurserySubscriptionPlan(pkg.id);
                                setNurserySub(updated);
                                setSuccessMessage(`✨ ${pkg.name} confirmed successfully!`);
                                setTimeout(() => setSuccessMessage(null), 4000);
                              }
                            }}
                            className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 hover:scale-[1.02] ${
                              isCurrentActive
                                ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg'
                                : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800'
                            }`}
                          >
                            {pkg.badge && (
                              <span className="absolute -top-2 -right-1 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                                {pkg.badge}
                              </span>
                            )}
                            {pkg.isPopular && !pkg.badge && (
                              <span className="absolute -top-2 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                                Popular ⭐
                              </span>
                            )}

                            <div>
                              <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                              <h5 className="text-xs font-black text-white leading-snug mt-0.5">{pkg.name}</h5>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <span className="text-sm font-black text-emerald-400">
                                {pkg.priceFrw === 0 ? 'Free' : `${pkg.priceFrw.toLocaleString()} RWF`}
                              </span>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                Select &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* Card 1: Basic Information & Identity */}
              <section className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-6 bg-emerald-600 rounded-full" />
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">1. Basic Information & School Identity</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">REB Nursery Curriculum</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.schoolName}</label>
                    <input 
                      value={plan.schoolName}
                      onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="e.g. GS Rugando / Nkorera Nursery"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.teacherName}</label>
                    <input 
                      value={plan.teacherName}
                      onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="e.g. NKUNDIMANA Theogene"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.classLevel}</label>
                    <select
                      value={plan.classLevel}
                      onChange={(e) => handleFieldChange('classLevel', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                    >
                      <option value="Nursery 1">Nursery 1 (3-4 Years / Baby Class)</option>
                      <option value="Nursery 2">Nursery 2 (4-5 Years / Middle Class)</option>
                      <option value="Nursery 3">Nursery 3 (5-6 Years / Top Class)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.subject}</label>
                    <input 
                      value={plan.subject}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="e.g. Numbers / Mathematics"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.lessonName}</label>
                    <input 
                      value={plan.lessonName}
                      onChange={(e) => handleFieldChange('lessonName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="e.g. Counting Objects 1-5 & Number Matching"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.term}</label>
                    <select 
                      value={plan.term}
                      onChange={(e) => handleFieldChange('term', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.date}</label>
                    <input 
                      type="date"
                      value={plan.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.duration} (Minutes)</label>
                    <input 
                      type="number"
                      value={plan.duration}
                      onChange={(e) => handleFieldChange('duration', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{ui.classSize} (Pupils)</label>
                    <input 
                      type="number"
                      value={plan.classSize}
                      onChange={(e) => handleFieldChange('classSize', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="25"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Competence Focus</label>
                    <input 
                      value={plan.competenceFocus}
                      onChange={(e) => handleFieldChange('competenceFocus', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm"
                      placeholder="e.g. Recognizing symbols, motor skills, social interaction"
                    />
                  </div>
                </div>
              </section>

              {/* Card 2: Pedagogical Objectives & Materials (Spacious Wide Grid) */}
              <section className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-2.5 h-6 bg-blue-600 rounded-full" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">2. Pedagogical Objectives & Materials</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{ui.instructionalObjective}</label>
                    <textarea 
                      rows={4}
                      value={plan.instructionalObjective}
                      onChange={(e) => handleFieldChange('instructionalObjective', e.target.value)}
                      className="w-full px-4 py-3 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm resize-y leading-relaxed"
                      placeholder="e.g. Given colorful counters and number cards, Nursery 1 children will be able to accurately count objects from 1 to 5 and match them with their corresponding number symbols with 90% accuracy."
                    />
                    <p className="text-[11px] text-slate-600">Write a clear SMART objective describing what learners will be able to do by the end of the lesson.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{ui.learningMaterials}</label>
                    <textarea 
                      rows={4}
                      value={plan.learningMaterials}
                      onChange={(e) => handleFieldChange('learningMaterials', e.target.value)}
                      className="w-full px-4 py-3 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm resize-y leading-relaxed"
                      placeholder="e.g. Number cards 1-5, colorful beads, animal cut-outs, chalkboard, real counting objects, songs."
                    />
                    <p className="text-[11px] text-slate-600">Include concrete manipulative materials suitable for early childhood education.</p>
                  </div>
                </div>
              </section>

              {/* Card 3: Lesson Progression / Steps (2x2 Spacious Responsive Grid) */}
              <section className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-6 bg-amber-500 rounded-full" />
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">3. Structured Lesson Progression</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                    4 Core Steps
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.entries(plan.steps).map(([key, step]) => {
                    const stepTitles: Record<string, { title: string; desc: string; icon: string }> = {
                      greetingCircle: { title: '1. Greeting Circle & Warm-up', desc: 'Welcome song, feelings check, introduction', icon: '☀️' },
                      guidedLearning: { title: '2. Guided Learning & Demonstration', desc: 'Teacher modeling with concrete objects', icon: '🧠' },
                      creativePlay: { title: '3. Creative Play & Practice', desc: 'Hands-on games, drawing, peer activities', icon: '🎨' },
                      recapAndGoodbye: { title: '4. Recap & Goodbye', desc: 'Review song, reflection, farewell', icon: '👋' }
                    };
                    const meta = stepTitles[key] || { title: key.replace(/([A-Z])/g, ' $1'), desc: '', icon: '📌' };

                    return (
                      <div key={key} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-black text-slate-900 block">{meta.title}</span>
                            <span className="text-[11px] text-slate-600">{meta.desc}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-300 shadow-sm shrink-0">
                            <span className="text-[10px] font-black text-slate-600 uppercase">Duration:</span>
                            <input 
                              value={step.duration}
                              onChange={(e) => handleStepChange(key as any, 'duration', e.target.value)}
                              className="w-16 bg-transparent border-none text-xs font-black text-emerald-800 focus:ring-0 p-0 text-center"
                              placeholder="5 min"
                            />
                          </div>
                        </div>

                        <textarea 
                          rows={4}
                          value={step.activities}
                          onChange={(e) => handleStepChange(key as any, 'activities', e.target.value)}
                          className="w-full bg-white text-slate-950 font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-sm resize-y leading-relaxed shadow-sm"
                          placeholder="Write teacher and children's activities..."
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Card 4: Teacher Self-Evaluation & Comments */}
              <section className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-2.5 h-6 bg-slate-800 rounded-full" />
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">4. Teacher Self-Evaluation & Observations</h3>
                </div>

                <textarea 
                  rows={3}
                  value={plan.evaluationComments}
                  onChange={(e) => handleFieldChange('evaluationComments', e.target.value)}
                  className="w-full px-4 py-3 bg-white text-slate-950 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm text-sm resize-y leading-relaxed"
                  placeholder="e.g. Most children could count to 3 confidently. Need to focus more on numbers 4 and 5 next time."
                />
              </section>

              {/* Quick Action Helper Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Would you like AI to complete or enhance this entire lesson plan?</h4>
                    <p className="text-xs text-emerald-200">Click the button on the right to have AI prepare the complete lesson plan instantly.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={handleGenerateAi}
                    disabled={isGeneratingAi}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAi ? 'Generating...' : '✨ Generate / Enhance with AI'}</span>
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPdf}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 Download PDF</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Printable Exact 1-Page REB Document Sheet View */
            <div className="w-full flex justify-center py-2 print:py-0 pb-10">
              <div 
                ref={printSheetRef} 
                id="nursery-lesson-plan-document" 
                className="w-[794px] max-w-[794px] min-h-[1040px] max-h-[1118px] bg-white text-black p-5 sm:p-6 shadow-2xl border border-slate-400 print:border-none print:shadow-none print:p-0 font-sans text-[11px] leading-tight flex flex-col justify-between overflow-hidden"
                style={{
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                
                {/* Official MINEDUC / REB ECE Header */}
                <div className="border-b-2 border-black pb-2 mb-2 text-center">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-800 mb-0.5">
                    <span>REPUBLIC OF RWANDA</span>
                    <span>MINEDUC - REB</span>
                    <span>EARLY CHILDHOOD EDUCATION</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-black my-0.5">
                    NURSERY LESSON PLAN / ECE PREPARATION SHEET
                  </h1>
                  <p className="text-[10px] font-bold text-slate-700 italic">
                    Competence-Based Curriculum (CBC) Standard Nursery Template • Language: {plan.language}
                  </p>
                </div>

                {/* Table 1: Administrative Identification */}
                <table className="w-full border-collapse border border-black mb-2 text-[10px] sm:text-[10.5px]">
                  <tbody>
                    <tr className="bg-slate-50">
                      <td className="border border-black px-2 py-1 font-bold text-slate-900 w-28 shrink-0">School Name:</td>
                      <td className="border border-black px-2 py-1 font-bold text-black" colSpan={2}>
                        <input 
                          value={plan.schoolName}
                          onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                          placeholder="School name..."
                        />
                      </td>
                      <td className="border border-black px-2 py-1 font-bold text-slate-900 w-28 shrink-0">Teacher's Name:</td>
                      <td className="border border-black px-2 py-1 font-bold text-black" colSpan={2}>
                        <input 
                          value={plan.teacherName}
                          onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                          placeholder="Teacher's name..."
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Term:</td>
                      <td className="border border-black px-2 py-1 font-bold text-center">
                        <select 
                          value={plan.term}
                          onChange={(e) => handleFieldChange('term', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-center font-bold text-black focus:outline-none focus:bg-amber-50 cursor-pointer"
                        >
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Term 3">Term 3</option>
                        </select>
                      </td>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Date:</td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        <input 
                          type="date"
                          value={plan.date}
                          onChange={(e) => handleFieldChange('date', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-center font-bold text-black focus:outline-none focus:bg-amber-50 cursor-pointer"
                        />
                      </td>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Class Level:</td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        <select 
                          value={plan.classLevel}
                          onChange={(e) => handleFieldChange('classLevel', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-center font-bold text-black focus:outline-none focus:bg-amber-50 cursor-pointer"
                        >
                          <option value="Nursery 1">Nursery 1 (Baby)</option>
                          <option value="Nursery 2">Nursery 2 (Middle)</option>
                          <option value="Nursery 3">Nursery 3 (Top)</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Subject / Area:</td>
                      <td className="border border-black px-2 py-1 font-bold" colSpan={2}>
                        <input 
                          value={plan.subject}
                          onChange={(e) => handleFieldChange('subject', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                          placeholder="Subject..."
                        />
                      </td>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Lesson Topic:</td>
                      <td className="border border-black px-2 py-1 font-bold" colSpan={2}>
                        <input 
                          value={plan.lessonName}
                          onChange={(e) => handleFieldChange('lessonName', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                          placeholder="Lesson topic..."
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Duration:</td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        <input 
                          value={plan.duration}
                          onChange={(e) => handleFieldChange('duration', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-center font-bold text-black focus:outline-none focus:bg-amber-50"
                          placeholder="30 min"
                        />
                      </td>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Class Size:</td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        <input 
                          value={plan.classSize}
                          onChange={(e) => handleFieldChange('classSize', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-center font-bold text-black focus:outline-none focus:bg-amber-50"
                          placeholder="25"
                        />
                      </td>
                      <td className="border border-black px-2 py-1 font-bold bg-slate-50">Language:</td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        <select 
                          value={plan.language}
                          onChange={(e) => handleFieldChange('language', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-center font-bold text-black focus:outline-none focus:bg-amber-50 cursor-pointer"
                        >
                          <option value="English">English</option>
                          <option value="Kinyarwanda">Kinyarwanda</option>
                          <option value="French">Français</option>
                          <option value="Kiswahili">Kiswahili</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Table 2: Objectives, Competences & Learning Materials */}
                <table className="w-full border-collapse border border-black mb-2 text-[10.5px]">
                  <tbody>
                    <tr>
                      <td className="border border-black px-2.5 py-1.5 align-top" colSpan={2}>
                        <span className="font-black text-black block uppercase text-[10px] mb-1">
                          Instructional Objective:
                        </span>
                        <textarea 
                          rows={2}
                          value={plan.instructionalObjective}
                          onChange={(e) => handleFieldChange('instructionalObjective', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10.5px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                          placeholder="Instructional objective..."
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black px-2.5 py-1.5 align-top w-1/2">
                        <span className="font-black text-black block uppercase text-[10px] mb-1">
                          Competence Focus (Ubushobozi Bwibandwaho):
                        </span>
                        <textarea 
                          rows={2}
                          value={plan.competenceFocus}
                          onChange={(e) => handleFieldChange('competenceFocus', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                          placeholder="Competence focus..."
                        />
                      </td>
                      <td className="border border-black px-2.5 py-1.5 align-top w-1/2">
                        <span className="font-black text-black block uppercase text-[10px] mb-1">
                          Learning Materials & Manipulatives (Ibikoresho):
                        </span>
                        <textarea 
                          rows={2}
                          value={plan.learningMaterials}
                          onChange={(e) => handleFieldChange('learningMaterials', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                          placeholder="Learning materials..."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Table 3: Structured Lesson Steps (4 Phases of Nursery) */}
                <table className="w-full border-collapse border border-black mb-2 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 font-black text-black text-center text-[10px] uppercase">
                      <th className="border border-black px-2 py-1 w-20">Timing</th>
                      <th className="border border-black px-2 py-1 w-44">Phase / Step</th>
                      <th className="border border-black px-2 py-1">Teacher & Learner Pedagogical Activities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Step 1: Greeting Circle */}
                    <tr>
                      <td className="border border-black px-2 py-1.5 text-center font-bold align-top">
                        <input 
                          value={plan.steps.greetingCircle.duration}
                          onChange={(e) => handleStepChange('greetingCircle', 'duration', e.target.value)}
                          className="w-full text-center bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top font-bold bg-slate-50/70">
                        <div className="font-black text-black text-[10.5px]">1. Greeting Circle</div>
                        <div className="text-[9px] text-slate-600 font-medium">Warm-up & Introduction</div>
                      </td>
                      <td className="border border-black px-2.5 py-1.5 align-top">
                        <textarea 
                          rows={2}
                          value={plan.steps.greetingCircle.activities}
                          onChange={(e) => handleStepChange('greetingCircle', 'activities', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                    </tr>

                    {/* Step 2: Guided Learning */}
                    <tr>
                      <td className="border border-black px-2 py-1.5 text-center font-bold align-top">
                        <input 
                          value={plan.steps.guidedLearning.duration}
                          onChange={(e) => handleStepChange('guidedLearning', 'duration', e.target.value)}
                          className="w-full text-center bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top font-bold bg-slate-50/70">
                        <div className="font-black text-black text-[10.5px]">2. Guided Learning</div>
                        <div className="text-[9px] text-slate-600 font-medium">Demonstration & Discovery</div>
                      </td>
                      <td className="border border-black px-2.5 py-1.5 align-top">
                        <textarea 
                          rows={3}
                          value={plan.steps.guidedLearning.activities}
                          onChange={(e) => handleStepChange('guidedLearning', 'activities', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                    </tr>

                    {/* Step 3: Creative Play & Practice */}
                    <tr>
                      <td className="border border-black px-2 py-1.5 text-center font-bold align-top">
                        <input 
                          value={plan.steps.creativePlay.duration}
                          onChange={(e) => handleStepChange('creativePlay', 'duration', e.target.value)}
                          className="w-full text-center bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top font-bold bg-slate-50/70">
                        <div className="font-black text-black text-[10.5px]">3. Creative Play</div>
                        <div className="text-[9px] text-slate-600 font-medium">Hands-on Practice & Games</div>
                      </td>
                      <td className="border border-black px-2.5 py-1.5 align-top">
                        <textarea 
                          rows={2}
                          value={plan.steps.creativePlay.activities}
                          onChange={(e) => handleStepChange('creativePlay', 'activities', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                    </tr>

                    {/* Step 4: Recap & Goodbye */}
                    <tr>
                      <td className="border border-black px-2 py-1.5 text-center font-bold align-top">
                        <input 
                          value={plan.steps.recapAndGoodbye.duration}
                          onChange={(e) => handleStepChange('recapAndGoodbye', 'duration', e.target.value)}
                          className="w-full text-center bg-transparent border-none p-0 font-bold text-black focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                      <td className="border border-black px-2 py-1.5 align-top font-bold bg-slate-50/70">
                        <div className="font-black text-black text-[10.5px]">4. Recap & Assessment</div>
                        <div className="text-[9px] text-slate-600 font-medium">Review Song & Farewell</div>
                      </td>
                      <td className="border border-black px-2.5 py-1.5 align-top">
                        <textarea 
                          rows={2}
                          value={plan.steps.recapAndGoodbye.activities}
                          onChange={(e) => handleStepChange('recapAndGoodbye', 'activities', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Table 4: Teacher Self-Evaluation & Observations */}
                <table className="w-full border-collapse border border-black mb-2 text-[10.5px]">
                  <tbody>
                    <tr>
                      <td className="border border-black px-2.5 py-1.5 align-top">
                        <span className="font-black text-black block uppercase text-[10px] mb-0.5">
                          Teacher's Self-Evaluation & Observations:
                        </span>
                        <textarea 
                          rows={2}
                          value={plan.evaluationComments}
                          onChange={(e) => handleFieldChange('evaluationComments', e.target.value)}
                          className="w-full bg-transparent border-none p-0 font-medium text-black text-[10px] leading-snug resize-none focus:outline-none focus:bg-amber-50"
                          placeholder="Teacher observations..."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Table 5: Official Signatures Block */}
                <table className="w-full border-collapse border border-black text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-black px-4 py-2 w-1/2 align-top">
                        <div className="font-black uppercase text-slate-900 mb-6">Teacher's Signature & Date:</div>
                        <div className="border-t border-dotted border-black pt-1 flex justify-between items-center text-[10px] font-bold">
                          <span>Name: {plan.teacherName || '........................................'}</span>
                          <span>Date: {plan.date || '....../....../202...'}</span>
                        </div>
                      </td>
                      <td className="border border-black px-4 py-2 w-1/2 align-top">
                        <div className="font-black uppercase text-slate-900 mb-6">Head Teacher / DOS Signature & Stamp:</div>
                        <div className="border-t border-dotted border-black pt-1 flex justify-between items-center text-[10px] font-bold">
                          <span>Signature: .......................................</span>
                          <span>Stamp Area: [  ]</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button 
            onClick={() => setPlan(SAMPLE_NURSERY_PLAN)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-all font-bold text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Sample Plan</span>
          </button>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-all font-bold text-xs cursor-pointer"
            >
              Close
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all font-black shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
            >
              <Download className={`w-4 h-4 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingPdf ? 'Processing...' : '📥 DOWNLOAD IN PDF (1-PAGE)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
