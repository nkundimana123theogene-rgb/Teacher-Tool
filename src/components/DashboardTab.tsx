import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Library,
  PlusCircle,
  FolderKanban,
  Zap,
  MessageCircle,
  Shield,
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  Award,
  Globe2,
  Code,
  Database,
  Cpu,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Download,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  Play,
  Volume2,
  Music,
  CheckCircle,
  GraduationCap,
  RefreshCw,
  Trash2,
  Target,
  Plus,
  Globe,
  ExternalLink
} from 'lucide-react';
import { UserProfile, LessonPlanData, LanguageOption, ClassDiaryData } from '../types';
import { OWNER_INFO } from '../data/plans';
import { getLessonPlanLabels } from '../data/translations';
import { getTimeBasedGreeting } from '../utils/greeting';

interface DashboardTabProps {
  user: UserProfile | null;
  selectedLanguage: LanguageOption;
  selectedCountry: string;
  savedPlans: LessonPlanData[];
  onNavigate: (tab: 'generator' | 'remedial' | 'nursery' | 'slides' | 'exercises' | 'worksheets' | 'library' | 'history' | 'subscription' | 'admin' | 'founder' | 'class-diary' | 'certificates') => void;
  onSelectPlan: (plan: LessonPlanData) => void;
  onOpenSignIn: () => void;
  onSelectFormat?: (format: 'reb_grid' | 'remedial_grid' | 'open_format') => void;
  onSyncCloudData?: () => void;
  isSyncing?: boolean;
}

const PROGRESS_I18N: Record<LanguageOption, {
  title: string;
  generatedToday: string;
  noPlansToday: string;
  resumeLast: string;
  noRecentPlans: string;
  createNew: string;
  progressTitle: string;
}> = {
  English: {
    title: "Today's Lesson Progress",
    generatedToday: "plans generated today",
    noPlansToday: "No plans generated today yet.",
    resumeLast: "Resume last edited lesson",
    noRecentPlans: "No recent lesson plans found.",
    createNew: "Start a new lesson plan",
    progressTitle: "Daily Activity Tracker"
  },
  Kinyarwanda: {
    title: "Incamake y'Isomo ry'Uyu Munsi",
    generatedToday: "amasomo yakozwe uyu munsi",
    noPlansToday: "Nta masomo arategurwa uyu munsi.",
    resumeLast: "Komeza isomo ryaherukaga",
    noRecentPlans: "Nta masomo aheruka kuboneka.",
    createNew: "Tegura isomo rishya",
    progressTitle: "Gukurikirana Ibikorwa by'Uyu Munsi"
  },
  French: {
    title: "Progrès des Leçons d'Aujourd'hui",
    generatedToday: "plans générés aujourd'hui",
    noPlansToday: "Aucun plan généré aujourd'hui pour le moment.",
    resumeLast: "Reprendre la dernière leçon modifiée",
    noRecentPlans: "Aucun plan de leçon récent trouvé.",
    createNew: "Commencer un nouveau plan de leçon",
    progressTitle: "Suivi d'Activité Quotidien"
  },
  Swahili: {
    title: "Maendeleo ya Masomo ya Leo",
    generatedToday: "mipango ya somo iliyotengenezwa leo",
    noPlansToday: "Hakuna mipango ya somo iliyotengenezwa leo bado.",
    resumeLast: "Endelea na somo la mwisho kuhaririwa",
    noRecentPlans: "Hakuna mipango ya somo ya hivi karibuni iliyopatikana.",
    createNew: "Anza mpango mpya wa somo",
    progressTitle: "Ufuatiliaji wa Shughuli za Kila Siku"
  }
};

const PROGRESS_DASHBOARD_I18N: Record<LanguageOption, {
  dailyProgressTitle: string;
  dailyProgressSub: string;
  overallCompletion: string;
  lessonGoals: string;
  diaryGoals: string;
  customTasksTitle: string;
  addTaskPlaceholder: string;
  addTaskBtn: string;
  plansCountLabel: string;
  diariesCountLabel: string;
  targetLabel: string;
  completedLabel: string;
  achievementMessage: string;
  motivationalMessage: string;
  autoCheckedLabel: string;
  completedTasks: string;
  lessonPlanTaskDesc: string;
  diaryTaskDesc: string;
}> = {
  English: {
    dailyProgressTitle: "Daily Progress & Teaching Goals",
    dailyProgressSub: "Track and achieve your daily teaching preparation milestones",
    overallCompletion: "Overall Day Completion",
    lessonGoals: "Daily Lesson Plan Goal",
    diaryGoals: "Class Diary Records Goal",
    customTasksTitle: "Personal Teacher Tasks",
    addTaskPlaceholder: "Add a custom task for today...",
    addTaskBtn: "Add Goal",
    plansCountLabel: "Lesson Plans Created Today",
    diariesCountLabel: "Diaries Recorded Today",
    targetLabel: "Target",
    completedLabel: "Completed",
    achievementMessage: "Fantastic job! You've crushed your teaching targets for today! 🏆🎉",
    motivationalMessage: "Keep it up! Each plan and diary brings order and clarity to your classroom. 💪",
    autoCheckedLabel: "(Auto-checked from actual records)",
    completedTasks: "completed goals",
    lessonPlanTaskDesc: "Create at least {goal} lesson plans today",
    diaryTaskDesc: "Record at least {goal} class diary entries today"
  },
  Kinyarwanda: {
    dailyProgressTitle: "Incamake y'Ibyagezweho n'Intego z'Umunsi",
    dailyProgressSub: "Kurikirana unagerereze ku ntego zawe zo gutegura amasomo no kwandika ibyakozwe",
    overallCompletion: "Ibyagezweho Muri Rusange",
    lessonGoals: "Intego yo Gutegura Amasomo",
    diaryGoals: "Intego yo Kwandika Ibyakozwe (Cahier de Textes)",
    customTasksTitle: "Ibikorwa Binyuranye By'umwarimu",
    addTaskPlaceholder: "Ongeramo indi ntego y'uyu munsi...",
    addTaskBtn: "Ongeramo",
    plansCountLabel: "Amasomo Yateguwe Uyu Munsi",
    diariesCountLabel: "Diary Zanditswe Uyu Munsi",
    targetLabel: "Intego",
    completedLabel: "Ibyakozwe",
    achievementMessage: "Akazi keza cyane! Wageze ku ntego zawe zose zo gutegura no kwandika z'uyu munsi! 🏆🎉",
    motivationalMessage: "Komeza gutya! Buri somo rishya uteguye ryorohereza abanyeshuri kuryumva neza. 💪",
    autoCheckedLabel: "(Bihita byizihizwa bishingiye ku bikorwa byawe)",
    completedTasks: "Intego zagezweho",
    lessonPlanTaskDesc: "Tegura nibura lesson plans {goal} uyu munsi",
    diaryTaskDesc: "Andika nibura records {goal} muri Cahier de Textes"
  },
  French: {
    dailyProgressTitle: "Tableau de Bord du Progrès Journalier",
    dailyProgressSub: "Suivez et atteignez vos objectifs de préparation pédagogique quotidiens",
    overallCompletion: "Complétion Globale de la Journée",
    lessonGoals: "Objectif de Plans de Leçon",
    diaryGoals: "Objectif de Cahier de Textes",
    customTasksTitle: "Tâches Personnelles de l'Enseignant",
    addTaskPlaceholder: "Ajouter une tâche personnalisée pour aujourd'hui...",
    addTaskBtn: "Ajouter",
    plansCountLabel: "Plans de Leçon Créés Aujourd'hui",
    diariesCountLabel: "Cahiers de Texte Remplis Aujourd'hui",
    targetLabel: "Cible",
    completedLabel: "Complété",
    achievementMessage: "Excellent travail! Vous avez atteint tous vos objectifs pédagogiques d'aujourd'hui! 🏆🎉",
    motivationalMessage: "Continuez ainsi! Chaque préparation apporte de l'ordre et du succès dans votre classe. 💪",
    autoCheckedLabel: "(Vérifié automatiquement d'après vos activités)",
    completedTasks: "objectifs atteints",
    lessonPlanTaskDesc: "Créer au moins {goal} plans de leçon aujourd'hui",
    diaryTaskDesc: "Remplir au moins {goal} cahiers de texte aujourd'hui"
  },
  Swahili: {
    dailyProgressTitle: "Maendeleo na Malengo ya Kila Siku",
    dailyProgressSub: "Fuatilia na utimize malengo yako ya maandalizi ya kufundisha leo",
    overallCompletion: "Kiwango cha Jumla cha Utayari",
    lessonGoals: "Lengo la Maandalizi ya Somo",
    diaryGoals: "Lengo la Kumbukumbu za Diary",
    customTasksTitle: "Kazi za Kibinafsi za Mwalimu",
    addTaskPlaceholder: "Ongeza kazi maalum ya leo...",
    addTaskBtn: "Ongeza",
    plansCountLabel: "Mipango ya Somo Iliyoundwa Leo",
    diariesCountLabel: "Kumbukumbu za Diary Leo",
    targetLabel: "Lengo",
    completedLabel: "Imekamilika",
    achievementMessage: "Kazi nzuri sana! Umetimiza malengo yako yote ya leo! 🏆🎉",
    motivationalMessage: "Endelea hivi! Kila somo jipya linarahisisha ufundishaji wako. 💪",
    autoCheckedLabel: "(Inakaguliwa moja kwa moja kutoka kwenye rekodi)",
    completedTasks: "malengo yaliyotimizwa",
    lessonPlanTaskDesc: "Tengeneza angalau mipango ya somo {goal} leo",
    diaryTaskDesc: "Andika angalau rekodi {goal} kwenye diary ya darasa leo"
  }
};

const CAROUSEL_I18N = {
  English: {
    sectionTitle: "Interactive Guide & Feature Showcase",
    sectionSub: "Learn how to use Nkorera's key AI tools in seconds",
    tryNow: "Try Feature Now",
    next: "Next",
    prev: "Previous",
    gotIt: "Got It",
    stepOf: "Slide {current} of {total}",
    tabs: {
      overview: "Overview 🚀",
      nursery: "Nursery 👶",
      certificates: "Certificates 🎓",
      exams: "Exams & Exercises 📝",
      diary: "Diary & PWA 📱"
    },
    slides: [
      {
        title: "Welcome to Nkorera Education AI! 🚀",
        badge: "GETTING STARTED",
        desc: "A powerful, offline-ready AI assistant tailored for teachers, schools, and educational administrators. We make classroom preparation fast, simple, and effective.",
        bullets: [
          "CBC & REB Curriculum aligned lesson planners.",
          "Automatic printable worksheets and test paper generators.",
          "Professional certificate builder and secure QR verifier."
        ],
        targetTab: "generator"
      },
      {
        title: "ECE & Nursery Lesson Plan Creator 👶",
        badge: "NURSERY CREATOR",
        desc: "Specially designed for early childhood nursery teachers to build engaging, play-based, and highly tactile lessons.",
        bullets: [
          "Generate custom child songs, story circles, and active games.",
          "Interactive clap patterns, hand gestures, and dance instructions.",
          "Focus on ECE milestones (physical, cognitive, social development)."
        ],
        targetTab: "nursery"
      },
      {
        title: "AI Certificate Builder & QR Verification 🎓",
        badge: "CERTIFICATE GENERATOR",
        desc: "Harness AI to generate elegant academic certificates of appreciation or excellence with high-security features.",
        bullets: [
          "Premium custom border frames (Lime, Ruby, Emerald Luxury).",
          "AI gender-detector: Automatically selects customized girl/boy graduate illustrations.",
          "Cryptographic QR Codes: Live verification portal to guarantee authenticity of credentials."
        ],
        targetTab: "certificates"
      },
      {
        title: "Exercises, Homework & Exam Architect 📝",
        badge: "EXAM CREATOR",
        desc: "Create comprehensive questions, end-of-term exams, and class quizzes in minutes.",
        bullets: [
          "Automatic marking schemes and teacher's answer keys.",
          "Aligned with selected curriculums (CBC/REB and more).",
          "Support for both multiple choice and open-ended questions."
        ],
        targetTab: "exercises"
      },
      {
        title: "Class Diary & Progressive Web App 📱",
        badge: "OFFLINE CAPABLE",
        desc: "Stay organized and run Nkorera completely offline like a native app on your phone or laptop.",
        bullets: [
          "Cahier de Textes: Automatically log and print your daily class progress.",
          "Install as PWA: Access core utilities even without internet connectivity.",
          "Responsive layouts optimized for phone, tablet, and PC screens."
        ],
        targetTab: "class-diary"
      }
    ]
  },
  Kinyarwanda: {
    sectionTitle: "Uburyo bwo Gutangira & Ibisobanuro by'Ibikoresho",
    sectionSub: "Yiga uko wakoresha ibikoresho by'ingenzi bya Nkorera mu masegonda make",
    tryNow: "Koresha ubu buryo ubu",
    next: "Ibikurikira",
    prev: "Ibyabanje",
    gotIt: "Ntabyutse",
    stepOf: "Slide {current} kuri {total}",
    tabs: {
      overview: "Incamake 🚀",
      nursery: "Inshuke 👶",
      certificates: "Certificates 🎓",
      exams: "Ibizami & Imyitozo 📝",
      diary: "Diary & PWA 📱"
    },
    slides: [
      {
        title: "Murakaza neza kuri Nkorera Education AI! 🚀",
        badge: "ITANGIRA CENTE",
        desc: "Ikoranabuhanga rikomeye, rikoreshwa n'abarimu, ibigo by'amashuri n'abayobozi b'uburezi. Rituma gutegura isomo ryoroha, ryamamara kandi ryihuta.",
        bullets: [
          "Gutegura amasomo ahuye na gahunda nshya ya CBC & REB.",
          "Kurema impapuro z'imyitozo (worksheets) n'ibizami bicapika.",
          "Kurema Certificates z'icyubahiro zifite QR code zo kuzigenzura."
        ],
        targetTab: "generator"
      },
      {
        title: "Gutegura Amasomo y'Inshuke (ECE) 👶",
        badge: "IBY'INSHUKE",
        desc: "Iki gikoresho cyateguriwe abarimu b'inshuke kugira ngo babashe gukora amasomo ashingiye ku mikino n'indirimbo zishimisha abana.",
        bullets: [
          "AI ikora indirimbo z'abana, amashyi n'imikino ijyanye n'isomo.",
          "Amashyi y'uburyo bwihariye, ibimenyetso n'imbyino z'abana.",
          "Kwibanda ku nkingi z'imikurire y'umwana (umubiri, ubwonko, mibanire)."
        ],
        targetTab: "nursery"
      },
      {
        title: "Kurema Certificates & Kuzigenzura mu buryo bwa QR 🎓",
        badge: "CERTIFICATE CREATOR",
        desc: "Koresha AI urema Certificates z'icyubahiro z'abanyeshuri cyangwa abarimu zifite umutekano mwinshi.",
        bullets: [
          "Ikarita z'icyubahiro zifite pambizo z'or, ruby, na emerald.",
          "Kumenya ubwoko (Gender) ku buryo bwikora bikazana ishusho y'umuhungu/umukobwa wambaye ikanzu n'ingofero.",
          "QR Codes: Isanduku ihuza n'urubuga rugenzura niba certificate ari umwimerere."
        ],
        targetTab: "certificates"
      },
      {
        title: "Kurema Imyitozo, Homework & Ibizami 📝",
        badge: "IBIZAMI NA MOCK",
        desc: "Kora ibibazo n'ibizami by'igihembwe mu masegonda make cyane byanditse neza.",
        bullets: [
          "Bikora na marking scheme n'ibisubizo byose ku mwarimu.",
          "Bihuye neza na gahunda y'imyigishirize igezweho.",
          "Gushyiramo ibibazo by'amahitamo (MCQs) n'ibisubizwa muli rusange."
        ],
        targetTab: "exercises"
      },
      {
        title: "Cahier de Textes & Porogaramu yo kuri Telefone 📱",
        badge: "IKORESHA OFFLINE",
        desc: "Gira gahunda nziza mu kazi kawe kandi ukoreshe Nkorera no mu gihe nta internet ufite.",
        bullets: [
          "Cahier de Textes: AI ikora umubandimwe w'ibyakozwe mu ishuri ugacapa.",
          "Yinjize kuri Telefone (PWA): Koresha ibintu by'ingenzi offline.",
          "Imyubakire yizihira amaso yaba kuri telefone, tablet, cyangwa computer."
        ],
        targetTab: "class-diary"
      }
    ]
  },
  French: {
    sectionTitle: "Guide de Démarrage & Démonstration",
    sectionSub: "Apprenez à utiliser les outils d'IA de Nkorera en quelques secondes",
    tryNow: "Essayer cette fonctionnalité",
    next: "Suivant",
    prev: "Précédent",
    gotIt: "Compris",
    stepOf: "Diapositive {current} sur {total}",
    tabs: {
      overview: "Aperçu 🚀",
      nursery: "Maternelle 👶",
      certificates: "Certificats 🎓",
      exams: "Examens 📝",
      diary: "Cahier & PWA 📱"
    },
    slides: [
      {
        title: "Bienvenue sur Nkorera Education AI! 🚀",
        badge: "DÉMARRAGE",
        desc: "Un assistant d'IA puissant et utilisable hors ligne, conçu pour les enseignants, les écoles et les administrateurs scolaires.",
        bullets: [
          "Planificateurs de leçons conformes aux programmes CBC & REB.",
          "Générateurs automatiques de fiches d'exercices et d'examens imprimables.",
          "Créateur de certificats professionnels avec vérificateur QR sécurisé."
        ],
        targetTab: "generator"
      },
      {
        title: "Créateur de Plans de Leçons Maternelle 👶",
        badge: "CRÉATEUR MATERNELLE",
        desc: "Spécialement conçu pour les enseignants du préscolaire afin de créer des leçons interactives, ludiques et basées sur le jeu.",
        bullets: [
          "Générez des chansons pour enfants, des cercles d'histoires et des jeux actifs.",
          "Modèles de applaudissements interactifs, gestes de la main et rythmes.",
          "Mise au point sur le développement physique, cognitif et social de l'enfant."
        ],
        targetTab: "nursery"
      },
      {
        title: "Certificats d'IA & Vérification QR Sécurisée 🎓",
        badge: "CERTIFICATS",
        desc: "Utilisez l'IA pour générer de superbes certificats académiques d'excellence avec des fonctionnalités de haute sécurité.",
        bullets: [
          "Bordures et cadres luxueux (Or & Vert, Rubis Académique, Émeraude).",
          "Détecteur de genre par IA: Sélectionne automatiquement l'illustration d'une diplômée ou d'un diplômé.",
          "Codes QR de sécurité: Un portail de vérification en direct pour certifier l'authenticité des diplômes."
        ],
        targetTab: "certificates"
      },
      {
        title: "Créateur de Devoirs, Quiz & Examens Scolaires 📝",
        badge: "EXAMENS ET QUIZ",
        desc: "Générez des examens trimestriels complets et des quiz de classe en quelques instants.",
        bullets: [
          "Grilles de correction automatiques et corrigés pour l'enseignant.",
          "Parfaitement aligné avec les programmes académiques sélectionnés.",
          "Options de questions à choix multiples ou de questions ouvertes."
        ],
        targetTab: "exercises"
      },
      {
        title: "Cahier de Textes & Application Web Progressive 📱",
        badge: "MODE OFFLINE",
        desc: "Restez organisé et utilisez Nkorera comme une application native directement sur votre téléphone ou PC.",
        bullets: [
          "Cahier de Textes: Enregistrez et imprimez l'historique de vos cours.",
          "Installer l'application (PWA): Accédez aux outils clés même sans connexion Internet.",
          "Interface moderne et réactive, optimisée pour tous les types d'écrans."
        ],
        targetTab: "class-diary"
      }
    ]
  },
  Swahili: {
    sectionTitle: "Mwongozo wa Kuanza Haraka & Maelezo",
    sectionSub: "Jifunze jinsi ya kutumia zana kuu za AI za Nkorera kwa sekunde chache",
    tryNow: "Jaribu Kipengele Hiki Sasa",
    next: "Inayofuata",
    prev: "Iliyotangulia",
    gotIt: "Nimeelewa",
    stepOf: "Slide {current} kati ya {total}",
    tabs: {
      overview: "Maelezo 🚀",
      nursery: "Chekechea 👶",
      certificates: "Vyeti 🎓",
      exams: "Mitihani 📝",
      diary: "Kumbukumbu 📱"
    },
    slides: [
      {
        title: "Karibu kwenye Nkorera Education AI! 🚀",
        badge: "MWONGOZO WA KUANZA",
        desc: "Msaidizi dhabiti wa AI anayefanya kazi nje ya mtandao, aliyebuniwa kwa ajili ya walimu, shule, na wasimamizi wa elimu.",
        bullets: [
          "Upangaji wa masomo unaoendana na mitaala ya CBC & REB.",
          "Tengeneza karatasi za mazoezi na mitihani inayoweza kupigwa chapa.",
          "Zana ya kuunda vyeti vya kitaaluma yenye mfumo salama wa kuhakiki kwa QR."
        ],
        targetTab: "generator"
      },
      {
        title: "Zana ya Kuunda Somo la Chekechea / ECE 👶",
        badge: "ZANA YA CHEKECHEA",
        desc: "Iliyoundwa mahususi kwa walimu wa chekechea ili kuunda masomo ya kusisimua yaliyojaa michezo na nyimbo.",
        bullets: [
          "Tengeneza nyimbo za watoto, michezo ya vikundi na michezo ya kushirikisha.",
          "Miondoko ya makofi ya kuvutia, ishara za mikono na maelekezo ya kucheza.",
          "Kuzingatia malengo ya makuzi ya mtoto (kimwili, kiakili, na kijamii)."
        ],
        targetTab: "nursery"
      },
      {
        title: "Muundaji wa Vyeti vya AI & Uhakiki wa QR 🎓",
        badge: "MUUNDAJI WA VYETI",
        desc: "Tumia nguvu ya AI kuunda vyeti maridadi vya pongezi au vyeti vya kitaaluma vyenye usalama wa hali ya juu.",
        bullets: [
          "Muundo wa pambizo za kifahari (Dhahabu, Kijani kibichi, Rubis).",
          "AI hugundua jinsia kutoka kwa jina na kuleta picha ya mhitimu msichana/mvulana.",
          "Nambari ya QR: Tovuti rasmi ya kuhakiki ukweli na umakini wa cheti kilichotolewa."
        ],
        targetTab: "certificates"
      },
      {
        title: "Zana ya Kuunda Mazoezi, Kazi za Nyumbani & Mitihani 📝",
        badge: "ZANA YA MITIHANI",
        desc: "Tengeneza maswali ya mitihani na miongozo ya kusahihisha kwa sekunde chache.",
        bullets: [
          "Miongzo ya kusahihisha na funguo za majibu kwa ajili ya mwalimu.",
          "Inaendana kikamilifu na mtaala uliochaguliwa.",
          "Inasaidia maswali ya kuchagua (MCQs) na maswali ya wazi."
        ],
        targetTab: "exercises"
      },
      {
        title: "Kumbukumbu ya Darasa (Diary) & PWA ya Nje ya Mtandao 📱",
        badge: "INAFANYA KAZI OFFLINE",
        desc: "Panga shughuli zako vizuri na utumie Nkorera bila kuhitaji mtandao kama programu ya kawaida kwenye simu au kompyuta yako.",
        bullets: [
          "Cahier de Textes: Weka kumbukumbu za masomo na uzichapishe.",
          "Sakinisha kama PWA: Pata huduma zote muhimu hata bila mtandao.",
          "Muundo rahisi na maridadi ulioboreshwa kwa skrini ya aina yoyote."
        ],
        targetTab: "class-diary"
      }
    ]
  }
};

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  selectedLanguage,
  selectedCountry,
  savedPlans,
  onNavigate,
  onSelectPlan,
  onOpenSignIn,
  onSelectFormat,
  onSyncCloudData,
  isSyncing = false,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [nurseryPlayMode, setNurseryPlayMode] = useState<'clap' | 'song' | 'game' | null>(null);
  const [examSelectedAnswer, setExamSelectedAnswer] = useState<string | null>(null);
  const [certVerifiedSim, setCertVerifiedSim] = useState(false);
  const [pwaInstallSim, setPwaInstallSim] = useState(false);

  const labels = getLessonPlanLabels('English');
  const recentPlans = savedPlans.slice(0, 3);
  const timeGreeting = getTimeBasedGreeting(user?.name, 'English', selectedCountry);

  const guideLang = CAROUSEL_I18N.English;
  const currentSlide = guideLang.slides[carouselIndex];

  // Today's progress calculation
  const today = new Date();
  const todayPlans = savedPlans.filter((plan) => {
    if (!plan.createdAt) return false;
    const planDate = new Date(plan.createdAt);
    return (
      planDate.getDate() === today.getDate() &&
      planDate.getMonth() === today.getMonth() &&
      planDate.getFullYear() === today.getFullYear()
    );
  });

  const lastEditedPlan = savedPlans.reduce((latest: LessonPlanData | null, current: LessonPlanData): LessonPlanData | null => {
    if (!latest) return current;
    if (!current.createdAt) return latest;
    if (!latest.createdAt) return current;
    return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
  }, null as LessonPlanData | null);

  const progressText = PROGRESS_I18N[selectedLanguage] || PROGRESS_I18N.English;
  const progressDashboardText = PROGRESS_DASHBOARD_I18N[selectedLanguage] || PROGRESS_DASHBOARD_I18N.English;

  // Class Diaries state and Configurable Goals
  const [savedDiaries, setSavedDiaries] = useState<ClassDiaryData[]>([]);
  const [lessonGoal, setLessonGoal] = useState<number>(() => {
    const saved = localStorage.getItem('nkorera_daily_lesson_goal');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [diaryGoal, setDiaryGoal] = useState<number>(() => {
    const saved = localStorage.getItem('nkorera_daily_diary_goal');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [customTasks, setCustomTasks] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('nkorera_daily_custom_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 'custom-1', text: selectedLanguage === 'Kinyarwanda' ? 'Tegura imyitozo n\'ibizamini (Exercises & Exams) 📝' : 'Prepare classroom exercises & exams 📝', completed: false },
      { id: 'custom-2', text: selectedLanguage === 'Kinyarwanda' ? 'Kugenzura ibikoresho by\'ishuri (Review materials) 📚' : 'Review today\'s learning aids & books 📚', completed: false }
    ];
  });
  const [newTaskText, setNewTaskText] = useState('');

  // Sync goals and tasks to localStorage
  useEffect(() => {
    localStorage.setItem('nkorera_daily_lesson_goal', lessonGoal.toString());
  }, [lessonGoal]);

  useEffect(() => {
    localStorage.setItem('nkorera_daily_diary_goal', diaryGoal.toString());
  }, [diaryGoal]);

  useEffect(() => {
    localStorage.setItem('nkorera_daily_custom_tasks', JSON.stringify(customTasks));
  }, [customTasks]);

  // Load and subscribe to class diaries in localStorage
  useEffect(() => {
    const loadDiaries = () => {
      try {
        const storedDiaries = localStorage.getItem('tegura_saved_diaries') || localStorage.getItem('nkorera_saved_diaries');
        if (storedDiaries) {
          setSavedDiaries(JSON.parse(storedDiaries));
        }
      } catch (e) {
        console.warn("Failed to load class diaries in Dashboard:", e);
      }
    };
    loadDiaries();

    window.addEventListener('storage', loadDiaries);
    // Listen for custom events dispatched when a diary is saved
    window.addEventListener('class-diary-saved', loadDiaries);
    return () => {
      window.removeEventListener('storage', loadDiaries);
      window.removeEventListener('class-diary-saved', loadDiaries);
    };
  }, []);

  const todayDiaries = savedDiaries.filter((diary) => {
    if (!diary.createdAt) return false;
    const diaryDate = new Date(diary.createdAt);
    return (
      diaryDate.getDate() === today.getDate() &&
      diaryDate.getMonth() === today.getMonth() &&
      diaryDate.getFullYear() === today.getFullYear()
    );
  });

  // Calculate percentages
  const lessonProgressPercent = Math.min(100, Math.round((todayPlans.length / Math.max(1, lessonGoal)) * 100));
  const diaryProgressPercent = Math.min(100, Math.round((todayDiaries.length / Math.max(1, diaryGoal)) * 100));

  // Count overall targets
  const totalTasksCount = 2 + customTasks.length;
  const completedTasksCount = 
    (todayPlans.length >= lessonGoal ? 1 : 0) + 
    (todayDiaries.length >= diaryGoal ? 1 : 0) + 
    customTasks.filter(t => t.completed).length;
  const overallProgressPercent = Math.round((completedTasksCount / totalTasksCount) * 100);

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: `custom-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false
    };
    setCustomTasks([...customTasks, newTask]);
    setNewTaskText('');
  };

  const handleToggleTask = (id: string) => {
    setCustomTasks(customTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setCustomTasks(customTasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Summary Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-md border border-emerald-400/30 flex-wrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="font-bold text-amber-200">{timeGreeting.aiBadge || '🤖 AI Welcome Assistant'}</span>
              <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                24/7 Service Active (Ibihe Byose)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              {timeGreeting.title}
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed font-medium">
              {timeGreeting.subtext}
            </p>
          </div>

          {/* Quick User Actions / Status */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {user ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-xs space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-medium">Subscription Status:</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-300" />
                    {user.currentPlan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-medium">Amasomo asigaye:</span>
                  <span className={`font-extrabold px-2 py-0.5 rounded-md ${user.remainingPlans <= 0 && !user.isAdmin ? 'text-amber-200 bg-rose-600/80 animate-pulse' : 'text-white bg-emerald-600/60'}`}>
                    {user.isAdmin ? 'Unlimited ♾️' : `${user.remainingPlans} Plans`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200 font-medium">Igihugu:</span>
                  <span className="font-semibold text-emerald-100 flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5" />
                    {selectedCountry}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 mt-1">
                  <span className="text-emerald-200 font-medium">Cloud Data:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSyncCloudData) {
                        onSyncCloudData();
                      } else {
                        window.dispatchEvent(new CustomEvent('trigger-pwa-sync'));
                      }
                    }}
                    disabled={isSyncing}
                    className="px-2.5 py-1 bg-lime-400 hover:bg-lime-300 disabled:bg-slate-700 text-slate-950 font-black rounded-lg text-[10px] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Re-fetch user plans, profile, and subscription status from Cloud Firestore"
                    id="user-card-sync-btn"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Cloud 🔄'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>🔐 Yinjiye Muri Konti Yawe</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expired Monthly Plans Callout Banner */}
      {user && !user.isAdmin && user.remainingPlans <= 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                ⚠️ Lesson Plans z'Ukwezi / Izo waguze Zarangiye (0 Remaining)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Lesson plans z'ukwezi kwanyu cyangwa izo mwaguze zarangiye! Mwipfuza gukomeza gukora lesson plans, mwasabwa kugura izindi lesson plans zishya muri Subscription zo gukomeza igikorwa cyanyu.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('subscription')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Gura Izindi Lesson Plans</span>
          </button>
        </div>
      )}



      {/* Dedicated Download / Install App Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl border-2 border-lime-400/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-lime-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 rounded-2xl font-black shrink-0 shadow-lg shadow-lime-400/30">
              <div className="flex items-center gap-1">
                <Smartphone className="w-5 h-5 stroke-[2.5]" title="Phone" />
                <Laptop className="w-5 h-5 stroke-[2.5]" title="Laptop" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-lime-400 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-spin" />
                  <span>Kurura App Muri Phone cyangwa Mudasobwa / Download App</span>
                </span>
                <span className="px-2.5 py-0.5 bg-lime-400/20 text-lime-300 text-[10px] font-black rounded-full border border-lime-400/40 uppercase">
                  PWA Fast Install
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Shyira Nkorera Education App muri Phone (Android/iPhone) cyangwa Mudasobwa (PC/Mac)
              </h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl">
                Manura no gushyira iyi App kuri screen ya telephone cyangwa mudasobwa yawe kugira ngo ujye uyifungura vuba cyane nka App isanzwe, no mu gihe internet iri kwanga ikore neza.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
              }}
              className="px-5 py-3 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-lime-400/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              id="dashboard-download-app-btn"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download & Install App (.APK & PWA) 📱💻</span>
            </button>

            <a
              href="/api/download-app"
              download="Nkorera_Education_App_v5.apk"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-lime-300 font-black text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 shrink-0"
              id="dashboard-direct-apk-btn"
              title="Download Direct Android APK File"
            >
              <Download className="w-4 h-4 text-lime-400" />
              <span>Direct .APK 📥</span>
            </a>
          </div>
        </div>
      </div>

      {/* Official Chrome & Web Search Link Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl border-2 border-cyan-400/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-2xl font-black shrink-0 border border-cyan-400/40 shadow-lg">
              <Globe className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
                  <span>Link y'Urubuga kuri Chrome & Browsers zose 🌐</span>
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full uppercase">
                  Direct System & Account Link
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Sacinga cyangwa ufungure urubuga rwa Nkorera Education
              </h3>
              <p className="text-xs text-slate-200 font-bold leading-relaxed max-w-2xl">
                Koresha iyi link idasanzwe yo gusacinga muri Google Chrome, Safari, cyangwa ukoreshe browser yose y'ifone cyangwa computer ikuguishe kuri account yawe ya Nkorera Education vuba na bwangu:
              </p>
              <div className="pt-1">
                <a
                  href="https://teacherlessonplans.ai.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-950/90 text-cyan-300 font-mono font-bold text-xs rounded-xl border border-cyan-500/40 hover:border-cyan-400 transition-all hover:bg-slate-900"
                >
                  <span>https://teacherlessonplans.ai.studio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              </div>
            </div>
          </div>

          <a
            href="https://teacherlessonplans.ai.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-400/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
            id="dashboard-open-chromelink-btn"
          >
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            <span>Open App in Browser 🚀</span>
          </a>
        </div>
      </div>

      {/* Dedicated System Tutorial & Help Center Website Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 p-5 sm:p-6 rounded-3xl border-2 border-amber-300 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-slate-950 text-amber-400 rounded-2xl font-black shrink-0 shadow-lg">
              <HelpCircle className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-950 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                  <span>System Tutorials & Help Center 🎥📄💬</span>
                </span>
                <span className="px-2.5 py-0.5 bg-slate-950 text-amber-300 text-[10px] font-black rounded-full uppercase">
                  System Architecture & Video Guides
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-950">
                Explore System Tutorials & Architecture Guides
              </h3>
              <p className="text-xs text-slate-900 font-bold leading-relaxed max-w-2xl">
                Access video scripts, downloadable PDF guides, system architecture documentation, and our interactive AI Support Assistant!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-help-center'));
            }}
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 border border-amber-400/40"
            id="dashboard-open-system-tutorials-btn"
          >
            <HelpCircle className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>Fungura System Tutorials 🎥📄💬</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{savedPlans.length}</p>
            <p className="text-xs text-slate-500 font-medium">Amasomo Yabitswe</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-800">
              {user?.isAdmin ? '♾️' : user?.remainingPlans ?? 3}
            </p>
            <p className="text-xs text-slate-500 font-medium">Amasomo Asigaye</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[130px]">
              {selectedLanguage}
            </p>
            <p className="text-xs text-slate-500 font-medium">Ururimi Rukoreshwa</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{selectedCountry}</p>
            <p className="text-xs text-slate-500 font-medium">Inyigisho watoranyije</p>
          </div>
        </div>
      </div>

      {/* Monthly Usage Statistics (5 Free Uses for Slides, Exercises, Worksheets, Diary) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden" id="monthly-usage-statistics">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-950">
                <Zap className="w-5 h-5 stroke-[2.2] text-emerald-600 fill-emerald-100" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {selectedLanguage === 'Kinyarwanda' ? "Imikoreshereze y'Imfashanyigisho (Ukwezi)" : 
                 selectedLanguage === 'French' ? "Statistiques d'Utilisation Mensuelle" :
                 selectedLanguage === 'Swahili' ? "Takwimu za Matumizi ya Kila Mwezi" : "Monthly Usage Statistics"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {selectedLanguage === 'Kinyarwanda' ? "Kurikirana umubare w'ibyo wemerewe gukora ku buntu (bigeze kuri 5 kuri buri gikoresho)." : 
               selectedLanguage === 'French' ? "Suivez votre consommation mensuelle des 5 utilisations gratuites pour chaque service." :
               selectedLanguage === 'Swahili' ? "Fuatilia matumizi yako ya sasa ya matumizi 5 ya bure kwa kila huduma." : "Track your current monthly consumption of the 5 free uses allowed for each service."}
            </p>
          </div>

          {user && !(user.isAdmin || user.hasPremiumToolsSub) && (
            <button
              onClick={() => onNavigate('subscription')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl shrink-0 shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>{selectedLanguage === 'Kinyarwanda' ? "Gura Premium ntiyihagarare" : 
                    selectedLanguage === 'French' ? "Passer à l'Abonnement Illimité" :
                    selectedLanguage === 'Swahili' ? "Pata Premium ya Bila Kikomo" : "Upgrade to Unlimited Premium"}</span>
            </button>
          )}
        </div>

        {/* Usage Progress Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              id: 'slides',
              name: selectedLanguage === 'Kinyarwanda' ? "Presentation Slides" : 
                    selectedLanguage === 'French' ? "Présentations de Diapositives" :
                    selectedLanguage === 'Swahili' ? "Slaidi za Wasilisho" : "Presentation Slides",
              count: user ? (user.monthlySlidesCount || 0) : 0,
              icon: <Monitor className="w-4 h-4 text-indigo-600" />,
              bgIcon: "bg-indigo-50",
              color: "bg-indigo-600"
            },
            {
              id: 'exercises',
              name: selectedLanguage === 'Kinyarwanda' ? "Exercises & Exams (Ibizami)" : 
                    selectedLanguage === 'French' ? "Exercices & Examens" :
                    selectedLanguage === 'Swahili' ? "Mazoezi na Mitihani" : "Exercises & Exams",
              count: user ? (user.monthlyExercisesCount || 0) : 0,
              icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
              bgIcon: "bg-emerald-50",
              color: "bg-emerald-600"
            },
            {
              id: 'worksheets',
              name: selectedLanguage === 'Kinyarwanda' ? "Worksheets (Impapuro z'Imyitozo)" : 
                    selectedLanguage === 'French' ? "Feuilles d'Exercices" :
                    selectedLanguage === 'Swahili' ? "Karatasi za Kazi" : "Worksheets",
              count: user ? (user.monthlyWorksheetsCount || 0) : 0,
              icon: <FileText className="w-4 h-4 text-cyan-600" />,
              bgIcon: "bg-cyan-50",
              color: "bg-cyan-600"
            },
            {
              id: 'diary',
              name: selectedLanguage === 'Kinyarwanda' ? "Class Diary (Cahier de Textes)" : 
                    selectedLanguage === 'French' ? "Cahier de Textes de Classe" :
                    selectedLanguage === 'Swahili' ? "Kumbukumbu za Darasa (Diary)" : "Class Diary",
              count: user ? (user.monthlyDiaryCount || 0) : 0,
              icon: <Clock className="w-4 h-4 text-amber-600" />,
              bgIcon: "bg-amber-50",
              color: "bg-amber-600"
            }
          ].map((service) => {
            const limit = 5;
            const hasPremium = user?.isAdmin || user?.hasPremiumToolsSub;
            const percent = hasPremium ? 100 : Math.min(100, (service.count / limit) * 100);
            const remaining = Math.max(0, limit - service.count);
            const isNearingLimit = !hasPremium && service.count >= 4;
            const isExceeded = !hasPremium && service.count >= 5;

            return (
              <div key={service.id} className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl ${service.bgIcon}`}>
                      {service.icon}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {service.name}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    {hasPremium ? (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 rounded-md uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{selectedLanguage === 'Kinyarwanda' ? "Ntarengwa" : 
                              selectedLanguage === 'French' ? "Illimité" :
                              selectedLanguage === 'Swahili' ? "Bila Kikomo" : "Unlimited"}</span>
                      </span>
                    ) : (
                      <span className={`text-xs font-black ${isExceeded ? 'text-rose-600' : isNearingLimit ? 'text-amber-600' : 'text-slate-600'}`}>
                        {service.count} / {limit} {selectedLanguage === 'Kinyarwanda' ? "Zikoreshejwe" : 
                                                 selectedLanguage === 'French' ? "utilisés" :
                                                 selectedLanguage === 'Swahili' ? "imetumika" : "used"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      hasPremium 
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-500' 
                        : isExceeded 
                        ? 'bg-rose-500' 
                        : isNearingLimit 
                        ? 'bg-amber-500' 
                        : service.color
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Subtext info */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-0.5">
                  {!hasPremium ? (
                    <>
                      <span>
                        {remaining} {selectedLanguage === 'Kinyarwanda' ? "Zisigaye" : 
                                     selectedLanguage === 'French' ? "restants" :
                                     selectedLanguage === 'Swahili' ? "imesalia" : "remaining"}
                      </span>
                      {isExceeded && (
                        <span className="text-rose-600 font-black animate-pulse flex items-center gap-0.5">
                          ⚠️ {selectedLanguage === 'Kinyarwanda' ? "Emeza ifatabuguzi ry'igikoresho" : 
                              selectedLanguage === 'French' ? "Quota gratuit épuisé" :
                              selectedLanguage === 'Swahili' ? "Kikomo kimefikiwa" : "Quota Exceeded"}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{selectedLanguage === 'Kinyarwanda' ? "Gukoresha Premium Birakora" : 
                            selectedLanguage === 'French' ? "Usage Premium Activé" :
                            selectedLanguage === 'Swahili' ? "Matumizi ya Premium Yanafunguliwa" : "Premium usage unlocked"} ({service.count} total)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note or Login Prompt */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {selectedLanguage === 'Kinyarwanda' ? "Ibi bipimo bikorwa mu rwego rwo kugabanya imikoreshereze idakenewe. Bihindurwa ku buntu buri kwezi." : 
               selectedLanguage === 'French' ? "Ces compteurs sont remis à zéro gratuitement le premier jour de chaque mois." :
               selectedLanguage === 'Swahili' ? "Vipimo hivi huwekwa upya bila malipo siku ya kwanza ya kila mwezi." : "These free counters automatically reset at the start of each month."}
            </span>
          </div>
          
          {!user && (
            <button
              onClick={onOpenSignIn}
              className="text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1 underline transition-colors"
            >
              🔐 {selectedLanguage === 'Kinyarwanda' ? "Yinjire muri konti ngo ubibone neza" : 
                  selectedLanguage === 'French' ? "Connectez-vous pour suivre votre consommation" :
                  selectedLanguage === 'Swahili' ? "Ingia ili kufuatilia matumizi yako" : "Sign in to track your usage history"}
            </button>
          )}
        </div>
      </div>

      {/* Daily Progress Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8 relative overflow-hidden" id="daily-progress-dashboard">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header with overall completion status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-lime-100 text-lime-900">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {progressDashboardText.dailyProgressTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {progressDashboardText.dailyProgressSub}
            </p>
          </div>

          {/* Overall progress visual ring / metric card */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              {/* Circular progress bar */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-lime-500 transition-all duration-500 ease-out"
                  strokeDasharray={`${overallProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900">{overallProgressPercent}%</span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{progressDashboardText.overallCompletion}</p>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                {completedTasksCount} / {totalTasksCount} {progressDashboardText.completedTasks}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Bars & Goal Configurator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target 1: Lesson Plans */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {progressDashboardText.plansCountLabel}
                </span>
                <span className="text-xs font-black text-lime-700 bg-lime-50 px-2.5 py-0.5 rounded-full border border-lime-200">
                  {todayPlans.length} / {lessonGoal} {progressDashboardText.completedLabel}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800">Lesson Plans</span>
                  <span className="font-black text-slate-950">{lessonProgressPercent}%</span>
                </div>
                {/* Progress track */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${lessonProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">{progressDashboardText.targetLabel}:</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  <button 
                    onClick={() => setLessonGoal(Math.max(1, lessonGoal - 1))}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-black text-slate-900">{lessonGoal}</span>
                  <button 
                    onClick={() => setLessonGoal(lessonGoal + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {lastEditedPlan && (
                  <button
                    onClick={() => onSelectPlan(lastEditedPlan)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-[9px] rounded-xl flex items-center gap-1 transition-all active:scale-95"
                    title={lastEditedPlan.header.lessonTitle}
                  >
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    <span>Resume 📝</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onSelectFormat?.('reb_grid');
                    onNavigate('generator');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>{progressText.createNew}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Target 2: Class Diaries */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {progressDashboardText.diariesCountLabel}
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {todayDiaries.length} / {diaryGoal} {progressDashboardText.completedLabel}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800">Cahier de Textes</span>
                  <span className="font-black text-slate-950">{diaryProgressPercent}%</span>
                </div>
                {/* Progress track */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${diaryProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">{progressDashboardText.targetLabel}:</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  <button 
                    onClick={() => setDiaryGoal(Math.max(1, diaryGoal - 1))}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-black text-slate-900">{diaryGoal}</span>
                  <button 
                    onClick={() => setDiaryGoal(diaryGoal + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => onNavigate('class-diary')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Diary Record 📱</span>
              </button>
            </div>
          </div>

        </div>

        {/* Motivational Feedback Banner */}
        <div className="relative overflow-hidden">
          {overallProgressPercent >= 100 ? (
            <div className="p-4 bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 text-emerald-950 shadow-xs animate-bounce">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-black text-emerald-900">
                {progressDashboardText.achievementMessage}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-950 shadow-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-amber-900">
                {progressDashboardText.motivationalMessage}
              </p>
            </div>
          )}
        </div>

        {/* Checklist & Task Builder Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h3 className="text-sm font-black text-slate-900">
              {progressDashboardText.customTasksTitle}
            </h3>
          </div>

          <div className="space-y-3">
            {/* Automatic Task 1: Lesson plans target */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 group">
              <div className="flex items-center gap-3">
                <span className={`p-1 rounded-lg ${todayPlans.length >= lessonGoal ? 'bg-lime-100 text-lime-700' : 'bg-slate-200 text-slate-400'}`}>
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                </span>
                <div className="flex flex-col">
                  <span className={`text-xs font-extrabold ${todayPlans.length >= lessonGoal ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                    {progressDashboardText.lessonPlanTaskDesc.replace('{goal}', lessonGoal.toString())}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    {progressDashboardText.autoCheckedLabel}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                {todayPlans.length} / {lessonGoal}
              </span>
            </div>

            {/* Automatic Task 2: Class diaries target */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 group">
              <div className="flex items-center gap-3">
                <span className={`p-1 rounded-lg ${todayDiaries.length >= diaryGoal ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                </span>
                <div className="flex flex-col">
                  <span className={`text-xs font-extrabold ${todayDiaries.length >= diaryGoal ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                    {progressDashboardText.diaryTaskDesc.replace('{goal}', diaryGoal.toString())}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    {progressDashboardText.autoCheckedLabel}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                {todayDiaries.length} / {diaryGoal}
              </span>
            </div>

            {/* Personal Custom Goals */}
            {customTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors group">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <span className={`p-1 rounded-lg ${task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    <CheckCircle className={`w-4 h-4 stroke-[2.5] ${task.completed ? '' : 'opacity-0 hover:opacity-100 transition-opacity'}`} />
                  </span>
                  <span className={`text-xs font-extrabold ${task.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700'}`}>
                    {task.text}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                  title="Remove task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom task form */}
          <form onSubmit={handleAddCustomTask} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={progressDashboardText.addTaskPlaceholder}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{progressDashboardText.addTaskBtn}</span>
            </button>
          </form>
        </div>

      </div>

      {/* GETTING STARTED INTERACTIVE FEATURE SHOWCASE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden" id="getting-started-showcase">
        {/* Soft elegant background decor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <HelpCircle className="w-5 h-5 stroke-[2.2]" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {guideLang.sectionTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {guideLang.sectionSub}
            </p>
          </div>

          {/* Interactive tabs at the top for quick leaping */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(guideLang.tabs) as Array<keyof typeof guideLang.tabs>).map((tabKey, idx) => (
              <button
                key={tabKey}
                onClick={() => {
                  setCarouselIndex(idx);
                }}
                className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  carouselIndex === idx
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {guideLang.tabs[tabKey]}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Content & Simulator Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch relative z-10">
          {/* Slide Description Details (Column 1) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIndex}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-extrabold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                  <span>{currentSlide.badge}</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {currentSlide.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {currentSlide.desc}
                </p>

                {/* Key value bullet points */}
                <ul className="space-y-2 pt-2">
                  {currentSlide.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Carousel navigation & CTA Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCarouselIndex((prev) => (prev === 0 ? guideLang.slides.length - 1 : prev - 1));
                  }}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Slide Tracker Dot Indicator */}
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-extrabold text-slate-500 bg-slate-50 border border-slate-100 py-1 rounded-lg">
                  <span>{carouselIndex + 1} / {guideLang.slides.length}</span>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCarouselIndex((prev) => (prev === guideLang.slides.length - 1 ? 0 : prev + 1));
                  }}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Try Feature Grand CTA Button */}
              <button
                onClick={() => {
                  onNavigate(currentSlide.targetTab as any);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-800 hover:scale-102 hover:shadow-md text-white font-black text-xs rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{guideLang.tryNow}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-amber-300" />
              </button>
            </div>
          </div>

          {/* Interactive Simulator / Interactive Tooltip Live Mockup Screen (Column 2) */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative min-h-[280px]">
            {/* Live Indicator Lamp */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/5 px-2 py-0.5 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">LIVE DEMO</span>
            </div>

            {/* Slide 0 Mockup: General Overview */}
            {carouselIndex === 0 && (
              <div className="space-y-4 my-auto">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      SYSTEM STATUS
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">24/7 ACTIVE</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800">Nkorera AI Central Workspace</h4>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">SECURED</span>
                      <span className="font-extrabold text-slate-800">100% Secure</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">LANGUAGES</span>
                      <span className="font-extrabold text-emerald-700">Multi (4)</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-900 text-white rounded-xl text-[10px] font-medium flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                  <span>Choose any tool from the tabs above or the quick menu below to begin immediately.</span>
                </div>
              </div>
            )}

            {/* Slide 1 Mockup: Nursery Creator */}
            {carouselIndex === 1 && (
              <div className="space-y-3 my-auto">
                <span className="text-[8px] font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                  👶 Play-Based Lesson Station
                </span>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setNurseryPlayMode('clap')}
                    className={`p-1.5 text-[9px] font-black rounded-lg border transition-all ${
                      nurseryPlayMode === 'clap'
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    👏 Clap Beat
                  </button>
                  <button
                    onClick={() => setNurseryPlayMode('song')}
                    className={`p-1.5 text-[9px] font-black rounded-lg border transition-all ${
                      nurseryPlayMode === 'song'
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🎵 ECE Song
                  </button>
                  <button
                    onClick={() => setNurseryPlayMode('game')}
                    className={`p-1.5 text-[9px] font-black rounded-lg border transition-all ${
                      nurseryPlayMode === 'game'
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🧸 Active Game
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 min-h-[100px] flex flex-col justify-center text-center">
                  {nurseryPlayMode === null && (
                    <p className="text-[10px] text-slate-400 italic">
                      Click any play activity button above to simulate a lesson plan ECE segment.
                    </p>
                  )}
                  {nurseryPlayMode === 'clap' && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-orange-700">👏 Rhythm &amp; Clap Pattern</p>
                      <p className="text-[10px] text-slate-600">"Clap-Clap-Snap! [👏 👏 🫰]"</p>
                      <span className="text-[8px] font-bold text-slate-400 block">Encourages bilateral coordination and active listening.</span>
                    </div>
                  )}
                  {nurseryPlayMode === 'song' && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-orange-700">🎵 Classroom Gathering Song</p>
                      <p className="text-[10px] text-slate-600">"Twishimiye kuza kwiga, twese hamwe mureke dutere intambwe!"</p>
                      <span className="text-[8px] font-bold text-slate-400 block">Combines simple hand gestures with auditory learning.</span>
                    </div>
                  )}
                  {nurseryPlayMode === 'game' && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-orange-700">🧸 Sensory-Motor Tag Game</p>
                      <p className="text-[10px] text-slate-600">"Lion &amp; Bell (Intare n'Inzogera)"</p>
                      <span className="text-[8px] font-bold text-slate-400 block">Children walk quietly to identify where the hidden bell is ringing.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slide 2 Mockup: Certificate Generator */}
            {carouselIndex === 2 && (
              <div className="space-y-3 my-auto">
                <span className="text-[8px] font-extrabold text-lime-600 uppercase tracking-widest block mb-1">
                  🎓 Certificate Preview Frame
                </span>

                <div className="bg-white p-3 rounded-xl border-2 border-amber-400/80 shadow-2xs relative text-center space-y-1.5 overflow-hidden">
                  {/* Luxury Certificate Background Frame Lines */}
                  <div className="absolute inset-1 border border-amber-300 pointer-events-none" />

                  <div className="flex justify-center">
                    <GraduationCap className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-[8px] font-black tracking-widest text-slate-800 uppercase">CERTIFICATE OF EXCELLENCE</h5>
                    <p className="text-[7px] text-slate-400 italic">Presented proudly to</p>
                    <p className="text-xs font-black text-slate-900">David Ganza</p>
                    <p className="text-[6px] text-slate-500 leading-relaxed">For outstanding academic performance in Elementary Mathematics.</p>
                  </div>

                  {/* Cryptographic Verification QR Badge */}
                  <div className="flex items-center justify-between pt-1 relative z-10">
                    <div className="text-[5px] text-slate-400 text-left">
                      <span>Serial: NK-824C</span>
                    </div>

                    <button
                      onClick={() => setCertVerifiedSim(true)}
                      className="p-1 bg-slate-950 text-white rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-[5px] font-black tracking-widest uppercase">SCAN QR</span>
                    </button>
                  </div>

                  {/* Verification alert banner simulation */}
                  {certVerifiedSim && (
                    <div className="absolute inset-0 bg-emerald-950/95 text-white flex flex-col items-center justify-center p-2.5 text-center space-y-1 animate-in fade-in duration-200">
                      <span className="text-[7px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        ✓ SECURE DATA VERIFICATION
                      </span>
                      <p className="text-[8px] font-extrabold">Verified by Nkundimana Theogene</p>
                      <p className="text-[6px] text-slate-300">This credential is certified &amp; permanently registered in Nkorera system.</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCertVerifiedSim(false);
                        }}
                        className="px-2 py-0.5 bg-emerald-600 text-[6px] font-black rounded hover:bg-emerald-500"
                      >
                        CLOSE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slide 3 Mockup: Exams Creator */}
            {carouselIndex === 3 && (
              <div className="space-y-3 my-auto">
                <span className="text-[8px] font-extrabold text-cyan-600 uppercase tracking-widest block mb-1">
                  📝 Bloom's Taxonomy Quiz
                </span>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <p className="text-[10px] font-black text-slate-800">
                    Q: Which cognitive level of Bloom's Taxonomy encourages students to produce new or original work?
                  </p>

                  <div className="space-y-1 text-[9px]">
                    <button
                      onClick={() => setExamSelectedAnswer('A')}
                      className={`w-full text-left p-1.5 rounded-lg border transition-all ${
                        examSelectedAnswer === 'A'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      A) Remembering / Recall (Kwirahura)
                    </button>
                    <button
                      onClick={() => setExamSelectedAnswer('B')}
                      className={`w-full text-left p-1.5 rounded-lg border transition-all ${
                        examSelectedAnswer === 'B'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      B) Synthesis &amp; Create (Kurema)
                    </button>
                    <button
                      onClick={() => setExamSelectedAnswer('C')}
                      className={`w-full text-left p-1.5 rounded-lg border transition-all ${
                        examSelectedAnswer === 'C'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      C) Analysis &amp; Divide (Gusesengura)
                    </button>
                  </div>

                  {examSelectedAnswer === 'B' && (
                    <div className="p-1.5 bg-emerald-50 text-emerald-800 text-[8px] rounded border border-emerald-200 font-extrabold animate-in slide-in-from-top-1">
                      ✓ Correct! Synthesis/Creating sits at the pinnacle of Bloom's Taxonomy, inspiring real student innovation!
                    </div>
                  )}
                  {(examSelectedAnswer === 'A' || examSelectedAnswer === 'C') && (
                    <div className="p-1.5 bg-rose-50 text-rose-800 text-[8px] rounded border border-rose-200 font-medium animate-in slide-in-from-top-1">
                      ✗ Not quite. Try option B! Kurema (Creating/Synthesis) is the highest cognitive skill.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slide 4 Mockup: Class Diary & PWA */}
            {carouselIndex === 4 && (
              <div className="space-y-3 my-auto">
                <span className="text-[8px] font-extrabold text-purple-600 uppercase tracking-widest block mb-1">
                  📱 Progressive Offline App
                </span>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="font-bold text-slate-500">Cahier de Textes Registry</span>
                    <span className="text-emerald-600 font-black flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Saved Offline
                    </span>
                  </div>

                  <div className="space-y-1 text-[8px] font-mono text-slate-600">
                    <p className="border-b border-slate-100 pb-1 flex justify-between">
                      <span>• Lesson 1: Arithmetic</span>
                      <span className="text-emerald-600 font-bold">Approved ✓</span>
                    </p>
                    <p className="flex justify-between">
                      <span>• Lesson 2: ECE Storytelling</span>
                      <span className="text-emerald-600 font-bold">Approved ✓</span>
                    </p>
                  </div>

                  {/* Simulator button */}
                  <button
                    onClick={() => {
                      setPwaInstallSim(true);
                      setTimeout(() => setPwaInstallSim(false), 3000);
                      window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
                    }}
                    className={`w-full py-1.5 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 transition-all ${
                      pwaInstallSim 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {pwaInstallSim ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>INSTALLING OFFLINE ENGINE...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>TEST PWA INSTALLATION</span>
                      </>
                    )}
                  </button>

                  {pwaInstallSim && (
                    <span className="text-[7px] text-purple-500 font-extrabold text-center block tracking-wide">
                      Simulating offline workspace installation on device...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick mini-instructions footer of simulator */}
            <div className="pt-2 border-t border-slate-100 text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center">
              Click elements inside the simulator to interact
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED APP INSTALLATION SECTION / APP INSTALLATION CENTER */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 border-2 border-lime-400 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 flex items-center gap-2 shrink-0 shadow-xl shadow-lime-500/20">
              <Smartphone className="w-5 h-5 stroke-[2.5]" title="Phone" />
              <Tablet className="w-5 h-5 stroke-[2.5]" title="Tablet" />
              <Monitor className="w-5 h-5 stroke-[2.5]" title="Computer" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Uburyo bwo gushyira App kuri Phone / PC
                </span>
                <span className="text-xs text-lime-300 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-lime-400" />
                  <span>Koresha Offline (Nta Internet)</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                📥 Manura Nkorera Education App (Download / Install App)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-2xl leading-relaxed">
                Shyira iyi App kuri Home Screen ya Telefon, Tablet cyangwa Computer yawe mu masegonda 3 gusa! Ikora neza cyane kandi yihuta cyane niyo waba udafite internet (full offline mode).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
                if (isInIframe) {
                  window.open(window.location.href, '_blank', 'noopener,noreferrer');
                } else {
                  window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
                }
              }}
              className="px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-lime-500/20 transition-all transform hover:scale-[1.03] flex items-center justify-center gap-2 w-full sm:w-auto"
              id="dashboard-install-app-btn"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              {typeof window !== 'undefined' && window.self !== window.top ? (
                <span>FUNGURA HANZE NGO U-DOWNLOADE 🌐</span>
              ) : (
                <span>GUTANGIRA DOWNLOAD (KANDA HANO) 📥</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (onSyncCloudData) {
                  onSyncCloudData();
                } else {
                  window.dispatchEvent(new CustomEvent('trigger-pwa-sync'));
                }
              }}
              disabled={isSyncing}
              className="px-5 py-3.5 bg-slate-850 hover:bg-slate-800 text-lime-400 font-black text-xs rounded-2xl border border-lime-400/40 shadow-lg transition-all hover:scale-[1.03] flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
              title="Sync App data and features"
              id="dashboard-sync-app-btn"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isSyncing ? 'animate-spin text-lime-300' : ''}`} />
              <span>{isSyncing ? 'Syncing System...' : 'SYNC APP SYSTEM NOW 🔄'}</span>
            </button>

            {user?.isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="px-5 py-3.5 bg-purple-900 hover:bg-purple-800 text-white font-black text-xs rounded-2xl border border-purple-400 shadow-lg transition-all hover:scale-[1.03] flex items-center justify-center gap-2 w-full sm:w-auto"
                title="System Admin Panel"
                id="dashboard-admin-panel-btn"
              >
                <Shield className="w-4 h-4 text-purple-200" />
                <span>SYSTEM ADMIN PANEL 🛡️</span>
              </button>
            )}
          </div>
        </div>

        {/* DEVICE SUPPORT & INSTRUCTION CARDS IN KINYARWANDA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Android Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-lime-400/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-black text-xs text-lime-400 uppercase tracking-wide">
                <span>🤖 1. Android Phone / Tablet</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-lime-400/10 text-lime-400 text-[9px] uppercase font-black border border-lime-400/20">
                Play Store Free
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-200 font-bold">
                On Chrome or Edge browser:
              </p>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Click the three dots menu icon <span className="text-lime-400">(⋮)</span> in top right, then select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
            </div>
          </div>

          {/* iOS Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-amber-400/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-black text-xs text-amber-400 uppercase tracking-wide">
                <span>🍎 2. iPhone &amp; iPad</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[9px] uppercase font-black border border-amber-400/20">
                Safari Browser
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-200 font-bold">
                On Safari Browser for iPhone:
              </p>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Tap the <strong className="text-white">"Share"</strong> icon (square with arrow), scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
            </div>
          </div>

          {/* PC Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-emerald-400/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-black text-xs text-emerald-400 uppercase tracking-wide">
                <span>💻 3. Computer &amp; Laptop</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 text-[9px] uppercase font-black border border-emerald-400/20">
                Mac / Windows
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-200 font-bold">
                On Chrome or Edge for PC:
              </p>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Click the install icon or computer icon in the address bar at the top, or click <strong className="text-white">"Install App"</strong> in the top header menu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Options Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-600" />
            <span>Ihitamo ry'Ibikorwa / Quick Menu Navigation</span>
          </h2>
          <span className="text-xs text-slate-500 italic">Hitamo icyo ushaka gukora</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Standard REB / CBC Lesson Plan */}
          <button
            onClick={() => {
              onSelectFormat?.('reb_grid');
              onNavigate('generator');
            }}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-emerald-300 hover:border-emerald-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:bg-emerald-700 transition-colors shadow-xs">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs">
                REB / CBC Grid
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-emerald-800 transition-colors">
                1. Isomo Rusange (Standard REB Plan)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Kora isomo ry'icyumweru rusange ukurikije gahunda y'uburezi ya REB / CBC muri Kinyarwanda, English cyangwa French.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-emerald-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-emerald-100">
              <span>Rema Isomo Rusange</span>
              <ArrowRight className="w-4 h-4 text-emerald-900" />
            </div>
          </button>

          {/* Card 2: Remedial Learning Program (RLP) Lesson Plan */}
          <button
            onClick={() => {
              onNavigate('remedial');
            }}
            className="group text-left bg-gradient-to-br from-amber-50/40 to-yellow-50/40 p-6 rounded-2xl border-2 border-amber-300 hover:border-amber-500 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-xs">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                REB RLP / RLP Format
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-amber-800 transition-colors">
                2. Isomo ryo Kungoza (Remedial RLP Plan)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Tegura isomo ryihariye ryo kungoza no kuzahura abanyeshuri ukurikije gahunda ya RLP / REB muri Kinyarwanda, English cyangwa French.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-amber-100">
              <span>Tegura Isomo ryo Kungoza</span>
              <ArrowRight className="w-4 h-4 text-amber-900" />
            </div>
          </button>

          {/* Card: Homework & Exams Creator */}
          <button
            onClick={() => onNavigate('exercises')}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-cyan-300 hover:border-cyan-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center group-hover:bg-cyan-700 transition-colors shadow-xs">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-950 border border-cyan-300 shadow-2xs">
                Homework & Exams
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-cyan-800 transition-colors">
                2. Imyitozo n'Ibizami (Exercises Creator)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Generate custom curriculum-based exercises, homework, quizzes, and school exams in minutes with detailed rubrics.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-cyan-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-cyan-100">
              <span>Rema Imyitozo</span>
              <ArrowRight className="w-4 h-4 text-cyan-900" />
            </div>
          </button>

          {/* Card: Printable Worksheets */}
          <button
            onClick={() => onNavigate('worksheets')}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-emerald-300 hover:border-emerald-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:bg-emerald-700 transition-colors shadow-xs">
                <Layers className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs">
                Printable Worksheet
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-emerald-800 transition-colors">
                3. Kora Worksheets (Worksheets Creator)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Create beautifully formatted printable educational worksheets with automatic answer keys and solution guides.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-emerald-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-emerald-100">
              <span>Kora Worksheet Nshya</span>
              <ArrowRight className="w-4 h-4 text-emerald-900" />
            </div>
          </button>

          {/* Card: Class Diary / Cahier de Textes */}
          <button
            onClick={() => onNavigate('class-diary')}
            className="group text-left bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-2xl border-2 border-teal-300 hover:border-teal-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center group-hover:bg-teal-700 transition-colors shadow-xs">
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-teal-100 text-teal-950 border border-teal-300 shadow-2xs">
                Cahier de Textes
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-teal-800 transition-colors">
                Class Diary (Cahier de Textes)
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                Tegura igitabo cy'ibyakozwe mu ishuri (Cahier de Textes/Journal) ubyaze na AI cyangwa andika manually, bika, kandi usubire inyuma uyiprinte.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-teal-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-teal-200">
              <span>Fungura Cahier de Textes</span>
              <ArrowRight className="w-4 h-4 text-teal-900" />
            </div>
          </button>

          {/* Card: AI Certificate Generator (Lime Special Edition) */}
          <button
            onClick={() => onNavigate('certificates')}
            className="group text-left bg-gradient-to-br from-lime-50 to-emerald-50 p-6 rounded-2xl border-2 border-lime-400 hover:border-lime-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center group-hover:bg-lime-300 transition-colors shadow-xs">
                <Award className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-lime-200 text-slate-950 border border-lime-400 shadow-2xs">
                Lime AI Certificates
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-lime-900 transition-colors">
                AI Certificate Generator
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                Hanga no gucapa ibyemezo by'icyubahiro (Certificates) by'abanyeshuri n'abarimu. AI ikora inyandiko z'incamugongo na formal frames.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-lime-950 group-hover:translate-x-1 transition-transform pt-2 border-t border-lime-200">
              <span>Gukora Certificate</span>
              <ArrowRight className="w-4 h-4 text-lime-950" />
            </div>
          </button>



          {/* Card 2.5: Nursery Lesson Plan */}
          <button
            onClick={() => {
              onNavigate('nursery');
            }}
            className="group text-left bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-300 hover:border-orange-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center group-hover:bg-orange-600 transition-colors shadow-xs">
                <Sparkles className="w-6 h-6 stroke-[2.5] text-slate-950 fill-orange-200" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-200 text-orange-950 border border-orange-400 shadow-2xs">
                Nursery Plan
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-orange-900 transition-colors">
                5. Tegura Isomo ry'Inshuke (Nursery Lesson Plan)
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                Tegura isomo ry'abana b'inshuke rishingiye ku mikino, indirimbo, n'ibikorwa bifatika by'amashyi (Early Childhood ECE).
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-orange-950 group-hover:translate-x-1 transition-transform pt-2 border-t border-orange-200">
              <span>Tegura Isomo ry'Inshuke</span>
              <ArrowRight className="w-4 h-4 text-orange-950" />
            </div>
          </button>

          {/* Card 2.6: Presentation Slides */}
          <button
            onClick={() => {
              onNavigate('slides');
            }}
            className="group text-left bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-amber-300 hover:border-amber-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-xs">
                <Sparkles className="w-6 h-6 stroke-[2.5] text-slate-950 fill-amber-200" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 border border-amber-400 shadow-2xs">
                Slides Creator
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-amber-900 transition-colors">
                6. Rema Amasirafe y'Ibyigishwa (Presentation Slides)
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                Cura kandi utunganye amasirafe (Slides) y'Ibyigishwa, meza cyane, ahuye neza n'isomo, agufasha kwigisha mu buryo bwa kizere.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-950 group-hover:translate-x-1 transition-transform pt-2 border-t border-amber-200">
              <span>Rema Amasirafe meza</span>
              <ArrowRight className="w-4 h-4 text-amber-950" />
            </div>
          </button>

          {/* Card 2.7: Library & Schemes of Work */}
          <button
            onClick={() => {
              onNavigate('library');
            }}
            className="group text-left bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-300 hover:border-blue-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:bg-blue-700 transition-colors shadow-xs">
                <Library className="w-6 h-6 stroke-[2.5] text-white" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-blue-200 text-blue-950 border border-blue-400 shadow-2xs">
                Library Tools
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 group-hover:text-blue-900 transition-colors">
                7. Isomero ry'Isomo (Open Library Tools)
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                Shaka kandi utunganye ibikoresho by'integanyanyigisho (RTB/TVET & REB Scheme of Work) bigufasha gutegura igihembwe neza.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-blue-950 group-hover:translate-x-1 transition-transform pt-2 border-t border-blue-200">
              <span>Fungura Isomero rya REB & RTB</span>
              <ArrowRight className="w-4 h-4 text-blue-950" />
            </div>
          </button>

          {/* Card 3: Saved Plans */}
          <button
            onClick={() => onNavigate('history')}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-purple-300 hover:border-purple-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:bg-purple-700 transition-colors shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-950 border border-purple-300 shadow-2xs">
                {savedPlans.length} My Lesson Plans
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950 group-hover:text-purple-700 transition-colors">
                5. My Lesson Plans (History)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Reba, hindura cyangwa utapisha (Print / PDF) amasomo yose wagiye ukora ukoresheje seriveri yacu.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-purple-900 group-hover:translate-x-1 transition-transform pt-2 border-t border-purple-100">
              <span>Fungura My Lesson Plans (History)</span>
              <ArrowRight className="w-4 h-4 text-purple-900" />
            </div>
          </button>

          {/* Card 3: Upgrade Subscription */}
          {!user?.isAdmin && (
            <button
              onClick={() => onNavigate('subscription')}
              className="group text-left bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 hover:border-amber-400 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Zap className="w-6 h-6 fill-amber-200" />
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900">
                  MoMo Pay
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                  6. Subscription Status (Kwiyandikisha)
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Gura ifatabuguzi ryo gukora amasomo menshi adafite umupaka ukoresheje Mobile Money (0781339530).
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform pt-2 border-t border-amber-200/60">
                <span>Reba Subscription Status hano</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Card 4: WhatsApp Support Group */}
          <a
            href={OWNER_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group text-left bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                0781339530
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                7. WhatsApp Support Community
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Join other teachers in our WhatsApp group for instant guidance, updates, and direct support.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform pt-2 border-t border-slate-100">
              <span>Join Community Group</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </a>

          {/* Card 5: Robotics & AI Assistant */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-robotics-assistant'))}
            className="group text-left bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer"
            id="dashboard-open-robotics-card"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-600 text-purple-800 group-hover:text-white flex items-center justify-center shadow-xs transition-colors">
                <Bot className="w-6 h-6 animate-bounce" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Open Assistant
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                8. AI & Robotics Assistant 🤖
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Open the AI Assistant widget for immediate guidance, automated lesson planning help, and instant answer queries!
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-700 group-hover:translate-x-1 transition-transform pt-2 border-t border-slate-100">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Launch AI Assistant ⚡</span>
            </div>
          </button>

          {/* Card 6: 24/7 Uptime & Always Available Guarantee */}
          <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-xs">
                <Globe2 className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
                24/7/365 ONLINE
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                9. 24/7 Cloud Service Uptime
              </h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Teacher Tool operates 24/7/365 with high availability. Generate, customize, and print your pedagogical materials whenever you need them.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 pt-2 border-t border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automatically Saved & 100% Cloud Uptime</span>
            </div>
          </div>

          {/* Card 7: Founder & Developer Profile Card */}
          <button
            onClick={() => onNavigate('founder')}
            className="group text-left bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-6 rounded-2xl border-2 border-emerald-500/40 hover:border-amber-400 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-black">
                <Award className="w-6 h-6 fill-slate-950" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                IT / DEVELOPER
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                <span>10. IT/Developer: Nkundimana Theogene</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Learn more about the developer, mission, and system architecture of Teacher Tool built by Nkundimana Theogene.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 pt-2 border-t border-emerald-800/80">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>IT/Developer: Nkundimana Theogene • WhatsApp: 0781339530</span>
            </div>
          </button>

          {/* Card 8: Analytics & Subscriber Management */}
          {user?.isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="group text-left bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border-2 border-purple-500/40 hover:border-purple-400 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Shield className="w-6 h-6 text-purple-200" />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-500 text-white shadow-xs">
                  ADMIN PANEL
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                  <span>11. Admin Panel</span>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                  Reba imibare y'imikoreshwa y'urubuga (Usage Analytics), abakiriya baguze ifatabuguzi (Subscriptions), hamwe n'ibarura ry'amasomo arimo gukorwa mu Kinyarwanda, English, French & Swahili.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-purple-300 pt-2 border-t border-purple-800">
                <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Fungura System Control & Admin Panel</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Technology Stack Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border border-slate-700 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                💻 System Technology Architecture / Ikoranabuhanga Ryakoreshejwe
              </h3>
              <p className="text-[11px] text-slate-400">Standard Modern Web Stack & Educational AI Engine</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('founder')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>Developer Info</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 block flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> Frontend
            </span>
            <p className="font-extrabold text-slate-100">HTML, CSS, JS / React</p>
            <p className="text-[10px] text-slate-400">Tailwind CSS & Lucide Icons</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Backend
            </span>
            <p className="font-extrabold text-slate-100">Node.js (Express API)</p>
            <p className="text-[10px] text-slate-400">REST Proxy & Word/PDF Engine</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400 block flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Database
            </span>
            <p className="font-extrabold text-slate-100">MySQL / PostgreSQL</p>
            <p className="text-[10px] text-slate-400">Cloud Data & Saved Plans</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Engine
            </span>
            <p className="font-extrabold text-slate-100">OpenAI API & Gemini AI</p>
            <p className="text-[10px] text-slate-400">REB/CBC Objective Generator</p>
          </div>
        </div>
      </div>

      {/* Recent Lesson Plans Section */}
      {recentPlans.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Amasomo Yaherukaga Gukorwa / Recent Lesson Plans</span>
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Amasomo yose ({savedPlans.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                    <span>{plan.header.subject}</span>
                    <span className="bg-white px-2 py-0.5 rounded-md border text-slate-700">
                      {plan.header.classGrade}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {plan.header.lessonTitle}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {plan.header.unitTitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Hari hafi'}
                  </span>
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Fungura
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
