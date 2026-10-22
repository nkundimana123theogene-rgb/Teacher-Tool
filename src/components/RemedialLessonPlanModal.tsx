import { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  Printer, 
  Edit3, 
  Save, 
  AlertCircle, 
  FileText, 
  BookOpen, 
  Languages, 
  RefreshCw, 
  Lightbulb,
  CheckCircle2,
  Users,
  Target,
  Layers,
  Wand2
} from 'lucide-react';
import { RemedialLessonPlanData } from '../types';
import { saveRemedialPlanToFirestore } from '../utils/firebase';
import { exportRemedialLessonPlanToPdf } from '../utils/jspdfExporter';

import { EDUCATION_CATEGORIES, EducationCategoryId, getCategoryTitle } from './CbcLessonPlanModal';
import { checkCanCreateRemedialLessonPlan, consumeRemedialLessonPlan } from '../utils/subscription';

interface RemedialLessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  initialPlan?: RemedialLessonPlanData | null;
  onSaved: () => void;
  onRequireSubscription?: (warningMsg: string) => void;
}

export type CbcLanguage = 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili';

const languagesConfig = [
  { code: 'English' as const, flag: '🇺🇸', nativeName: 'English' },
  { code: 'Kinyarwanda' as const, flag: '🇷🇼', nativeName: 'Kinyarwanda' },
  { code: 'Français' as const, flag: '🇫🇷', nativeName: 'Français' },
  { code: 'Kiswahili' as const, flag: '🇹🇿', nativeName: 'Kiswahili' }
];

const REMEDIAL_TRANSLATIONS: Record<CbcLanguage, Record<string, string>> = {
  English: {
    remedialTitle: "REMEDIAL LESSON PLAN",
    subTitle: "Competence-Based Curriculum (CBC) Scaffolding for Struggling Learners",
    generalInfo: "A. GENERAL INFORMATION",
    schoolLabel: "School Name:",
    classLabel: "Class / Grade:",
    lessonLabel: "Lesson Topic / Content:",
    periodLabel: "Period / Duration:",
    dateLabel: "Date:",
    subjectLabel: "Subject:",
    teacherLabel: "Teacher Name:",
    unitLabel: "Unit Details:",
    groupCounts: "Group Distribution:",
    g1CountLabel: "Group 1 (Remedial):",
    g2CountLabel: "Group 2 (Consolidation):",
    g3CountLabel: "Group 3 (Extended):",
    g1Remedial: "G1 (Remedial):",
    g2Consolidation: "G2 (Consolidation):",
    g3Extended: "G3 (Extended):",
    learners: "learners",
    introLabel: "Intro / Hook / Prior Knowledge:",
    strugglingHeader: "B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS",
    colIssues: "Categories of learners who need remedial activities & issues identified",
    colObjectives: "Objectives per categories identified (SMART)",
    g1Label: "Group 1 (Slowest / High Scaffolding):",
    g2Label: "Group 2 (Struggling / Moderate Scaffolding):",
    g3Label: "Group 3 (Developing / Concept Reinforcement):",
    g1Objective: "G1 SMART Objective:",
    g2Objective: "G2 SMART Objective:",
    g3Objective: "G3 SMART Objective:",
    remedialHeader: "C. REMEDIAL ACTIVITIES",
    colProblem: "Problem Identified / Specific Task",
    colActivities: "Step-by-step Remedial Activities",
    colMethodology: "Methodology Used",
    colAids: "Learning Aids & Manipulatives",
    consolidationHeader: "D. CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS",
    colCatExplanation: "Category of Learners & Short Explanations",
    colConsolActivities: "Consolidation / Extended Activities",
    g3Consolidated: "Group 3 (Consolidated):",
    g4Extended: "Group 4 (Extended / Fast-trackers):",
    selfEvalHeader: "E. TEACHER'S SELF-EVALUATION",
    selfEvalSub: "",
    selfEvalPlaceholder: "Describe student mastery, engagement, effectiveness of learning aids, and next steps...",
    savingText: "Saving to database...",
    downloadingText: "Generating PDF...",
    writingAi: "AI Generating...",
    generateFull: "Generate Remedial Lesson Plan",
    smartObj: "SMART Objectives Only",
    remedialActions: "Remedial Activities Only",
    metadataForm: "1. AI Generator & Input Form",
    previewTab: "2. Official 1-Page REB Sheet",
    editorTab: "3. Direct Cell Editor",
    aiMenu: "AI Actions:",
    bika: "Save Plan",
    downloadPdf: "Download 1-Page PDF",
    printBtn: "Print Sheet",
    closeText: "Close",
    metadataTitle: "Remedial Lesson Parameters",
    diagnosticChallengeLabel: "Identified Learning Challenge / Diagnostic Barrier:",
    materialsLabel: "Concrete Learning Aids & Manipulatives:",
    customNotesLabel: "Special Pedagogical Instructions for AI:",
    starterPresetsTitle: "Curriculum Presets (Ingero z'Imitegurire):"
  },
  Kinyarwanda: {
    remedialTitle: "REMEDIAL LESSON PLAN",
    subTitle: "Competence-Based Curriculum (CBC) scaffolding for struggling learners",
    generalInfo: "A. GENERAL INFORMATION",
    schoolLabel: "School Name:",
    classLabel: "Class / Grade Level:",
    lessonLabel: "Lesson Topic / Title:",
    periodLabel: "Period Duration:",
    dateLabel: "Date:",
    subjectLabel: "Subject:",
    teacherLabel: "Teacher Name:",
    unitLabel: "Unit Details:",
    groupCounts: "Group Distribution:",
    g1CountLabel: "Group 1 (Remedial):",
    g2CountLabel: "Group 2 (Consolidation):",
    g3CountLabel: "Group 3 (Extended):",
    g1Remedial: "G1 (Remedial):",
    g2Consolidation: "G2 (Consolidation):",
    g3Extended: "G3 (Extended):",
    learners: "learners",
    introLabel: "Intro / Hook / Prior Knowledge:",
    strugglingHeader: "B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS",
    colIssues: "Categories of learners who need remedial activities & issues identified",
    colObjectives: "Objectives per categories identified (SMART)",
    g1Label: "Group 1 (Slowest / High Scaffolding):",
    g2Label: "Group 2 (Struggling / Moderate Scaffolding):",
    g3Label: "Group 3 (Developing / Concept Reinforcement):",
    g1Objective: "G1 SMART Objective:",
    g2Objective: "G2 SMART Objective:",
    g3Objective: "G3 SMART Objective:",
    remedialHeader: "C. REMEDIAL ACTIVITIES",
    colProblem: "Problem Identified / Specific Task",
    colActivities: "Step-by-step Remedial Activities",
    colMethodology: "Methodology Used",
    colAids: "Learning Aids & Manipulatives",
    consolidationHeader: "D. CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS",
    colCatExplanation: "Category of Learners & Short Explanations",
    colConsolActivities: "Consolidation / Extended Activities",
    g3Consolidated: "Group 3 (Consolidated):",
    g4Extended: "Group 4 (Extended / Fast-trackers):",
    selfEvalHeader: "E. TEACHER'S SELF-EVALUATION",
    selfEvalSub: "",
    selfEvalPlaceholder: "Describe student mastery, engagement, effectiveness of learning aids, and next steps...",
    savingText: "Saving to database...",
    downloadingText: "Generating PDF...",
    writingAi: "AI Generating...",
    generateFull: "Generate Remedial Lesson Plan",
    smartObj: "SMART Objectives Only",
    remedialActions: "Remedial Activities Only",
    metadataForm: "1. AI Generator & Input Form",
    previewTab: "2. Official 1-Page REB Sheet",
    editorTab: "3. Direct Cell Editor",
    aiMenu: "AI Actions:",
    bika: "Save Plan",
    downloadPdf: "Download 1-Page PDF",
    printBtn: "Print Sheet",
    closeText: "Close",
    metadataTitle: "Remedial Lesson Parameters",
    diagnosticChallengeLabel: "Identified Learning Challenge / Diagnostic Barrier:",
    materialsLabel: "Concrete Learning Aids & Manipulatives:",
    customNotesLabel: "Special Pedagogical Instructions for AI:",
    starterPresetsTitle: "Curriculum Presets:"
  },
  Français: {
    remedialTitle: "FICHE DE COURS DE REMÉDIATION",
    subTitle: "Échafaudage du curriculum basé sur les compétences (CBC) pour les apprenants en difficulté",
    generalInfo: "A. INFORMATIONS GÉNÉRALES",
    schoolLabel: "Nom de l'école:",
    classLabel: "Classe / Niveau:",
    lessonLabel: "Sujet / Titre de la leçon:",
    periodLabel: "Durée de la période:",
    dateLabel: "Date:",
    subjectLabel: "Matière:",
    teacherLabel: "Nom de l'enseignant:",
    unitLabel: "Détails de l'unité:",
    groupCounts: "Répartition des groupes:",
    g1CountLabel: "Groupe 1 (Remédiation):",
    g2CountLabel: "Groupe 2 (Consolidation):",
    g3CountLabel: "Groupe 3 (Extension):",
    g1Remedial: "G1 (Remédiation):",
    g2Consolidation: "G2 (Consolidation):",
    g3Extended: "G3 (Extension):",
    learners: "apprenants",
    introLabel: "Introduction / Accroche:",
    strugglingHeader: "B. GROUPES D'APPRENANTS EN DIFFICULTÉ IDENTIFIÉS",
    colIssues: "Catégories d'apprenants nécessitant des activités de remédiation et difficultés identifiées",
    colObjectives: "Objectifs par catégories identifiées (SMART)",
    g1Label: "Groupe 1 (Plus lents):",
    g2Label: "Groupe 2 (En difficulté):",
    g3Label: "Groupe 3 (En progression):",
    g1Objective: "Objectif SMART G1:",
    g2Objective: "Objectif SMART G2:",
    g3Objective: "Objectif SMART G3:",
    remedialHeader: "C. ACTIVITÉS DE REMÉDIATION",
    colProblem: "Problème identifié / Tâche spécifique",
    colActivities: "Activités de remédiation étape par étape",
    colMethodology: "Méthodologie utilisée",
    colAids: "Supports didactiques et matériels",
    consolidationHeader: "D. ACTIVITÉS DE CONSOLIDATION ET D'EXTENSION POUR LES AUTRES APPRENANTS",
    colCatExplanation: "Catégorie d'apprenants et brèves explications",
    colConsolActivities: "Activités de consolidation / extension",
    g3Consolidated: "Groupe 3 (Consolidation):",
    g4Extended: "Groupe 4 (Extension / Avancés):",
    selfEvalHeader: "E. AUTO-ÉVALUATION DE L'ENSEIGNANT",
    selfEvalSub: "Rempli par l'enseignant après avoir dispensé le cours",
    selfEvalPlaceholder: "Décrire le déroulement de la leçon, l'assimilation des élèves et les prochaines étapes...",
    savingText: "Enregistrement...",
    downloadingText: "Génération PDF...",
    writingAi: "Génération IA...",
    generateFull: "Générer le plan de remédiation",
    smartObj: "Objectifs SMART seuls",
    remedialActions: "Activités de remédiation",
    metadataForm: "1. Générateur IA & Formulaire",
    previewTab: "2. Fiche Officielle REB",
    editorTab: "3. Éditeur de Cellules",
    aiMenu: "Actions IA:",
    bika: "Enregistrer",
    downloadPdf: "Télécharger PDF (1-Page)",
    printBtn: "Imprimer",
    closeText: "Fermer",
    metadataTitle: "Paramètres de la leçon de remédiation",
    diagnosticChallengeLabel: "Défi pédagogique diagnostiqué / Problème identifié:",
    materialsLabel: "Supports matériels concrets (Bâtonnets, cartes, etc.):",
    customNotesLabel: "Instructions spécifiques pour l'IA:",
    starterPresetsTitle: "Exemples rapides prédéfinis:"
  },
  Kiswahili: {
    remedialTitle: "MPANGO WA SOMO LA KUREKEBISHA",
    subTitle: "Kusaidia mtaala wa umilisi (CBC) kwa wanafunzi wenye changamoto",
    generalInfo: "A. TAARIFA ZA JUMLA YA SOMO",
    schoolLabel: "Jina la Shule:",
    classLabel: "Darasa:",
    lessonLabel: "Kichwa cha Somo:",
    periodLabel: "Muda wa Somo:",
    dateLabel: "Tarehe:",
    subjectLabel: "Somo:",
    teacherLabel: "Jina la Mwalimu:",
    unitLabel: "Maelezo ya Mada Kuu:",
    groupCounts: "Mgawanyo wa Vikundi:",
    g1CountLabel: "Kundi la 1 (Kurekebisha):",
    g2CountLabel: "Kundi la 2 (Kuimarisha):",
    g3CountLabel: "Kundi la 3 (Walioendelea):",
    g1Remedial: "G1 (Kurekebisha):",
    g2Consolidation: "G2 (Kuimarisha):",
    g3Extended: "G3 (Walioendelea):",
    learners: "wanafunzi",
    introLabel: "Utangulizi / Vivutio vya Somo:",
    strugglingHeader: "B. MAKUNDI YA WANAFUNZI WENYE CHANGAMOTO YALIYOBAINISHWA",
    colIssues: "Makundi ya wanafunzi wanaohitaji shughuli za kurekebisha na changamoto zilizobainishwa",
    colObjectives: "Malengo kwa kila kundi lililobainishwa (SMART)",
    g1Label: "Kundi la 1 (Wepesi zaidi):",
    g2Label: "Kundi la 2 (Wenye changamoto):",
    g3Label: "Kundi la 3 (Wanaokua):",
    g1Objective: "Lengo la SMART G1:",
    g2Objective: "Lengo la SMART G2:",
    g3Objective: "Lengo la SMART G3:",
    remedialHeader: "C. SHUGHULI ZA KUREKEBISHA",
    colProblem: "Changamoto Iliyobainishwa / Kazi Maalum",
    colActivities: "Shughuli za kurekebisha hatua kwa hatua",
    colMethodology: "Mbinu Iliyotumika",
    colAids: "Vifaa vya Kufundishia",
    consolidationHeader: "D. SHUGHULI ZA KUIMARISHA NA ZILIZOPANULIWA KWA WANAFUNZI WENGINE",
    colCatExplanation: "Kundi la Wanafunzi na Maelezo Mafupi",
    colConsolActivities: "Shughuli za Kuimarisha / Zilizopanuliwa",
    g3Consolidated: "Kundi la 3 (Kuimarisha):",
    g4Extended: "Kundi la 4 (Walioendelea / Kazi za Ziada):",
    selfEvalHeader: "E. TATHMINI BINAFSI YA MWALIMU",
    selfEvalSub: "Inajazwa na mwalimu baada ya kufundisha somo",
    selfEvalPlaceholder: "Eleza jinsi somo lilivyokwenda, uelewa wa wanafunzi, na hatua zinazofuata...",
    savingText: "Inahifadhi...",
    downloadingText: "Inapakua PDF...",
    writingAi: "AI inaunda mpango...",
    generateFull: "Tengeneza Mpango wa Kurekebisha",
    smartObj: "Malengo ya SMART Pekee",
    remedialActions: "Shughuli za Kurekebisha Pekee",
    metadataForm: "1. Jenereta ya AI na Fomu",
    previewTab: "2. Hakiki Karatasi ya REB",
    editorTab: "3. Hariri Maandishi",
    aiMenu: "Vitendo vya AI:",
    bika: "Hifadhi Mpango",
    downloadPdf: "Pakua PDF (Ukurasa 1)",
    printBtn: "Chapa (Print)",
    closeText: "Funga",
    metadataTitle: "Vigezo vya Somo la Kurekebisha",
    diagnosticChallengeLabel: "Changamoto ya Kujifunza Iliyobainishwa:",
    materialsLabel: "Vifaa Halisi vya Kufundishia (Vijiti, chati, n.k.):",
    customNotesLabel: "Maelekezo Maalum kwa AI:",
    starterPresetsTitle: "Mifano ya Haraka ya Mtaala:"
  }
};

// Curriculum Presets for Quick Testing & One-Click Prefill
const STARTER_PRESETS = [
  {
    title: 'Primary 5 Math: Carrying in Addition (Guteranya Guterura)',
    category: 'primary' as EducationCategoryId,
    className: 'P5',
    subject: 'Mathematics',
    unitNumber: '2',
    unitName: 'Addition and Subtraction of Whole Numbers up to 1,000,000',
    lessonName: 'Addition with Carrying (Regrouping)',
    challenge: 'Abanyeshuri bananirwa guteranya baterura bava ku mwanya w\'ubumwe bajya ku binyacumi (Learners fail to regroup ones into tens when adding).',
    materials: 'Bundles of 10 straws (uduti), place-value charts, flashcards, counters.',
    group1Count: '4',
    group2Count: '5',
    group3Count: '3'
  },
  {
    title: 'Primary 4 Science (SET): Photosynthesis & Plant Needs',
    category: 'primary' as EducationCategoryId,
    className: 'P4',
    subject: 'Science & Elementary Technology (SET)',
    unitNumber: '3',
    unitName: 'Plants and their Environment',
    lessonName: 'Requirements of Photosynthesis (Ibitunga Ibimera)',
    challenge: 'Learners confuse water absorption by roots with carbon dioxide intake via leaves.',
    materials: 'Potted plants, clear plastic bags, sunlight illustration chart, iodine test strip samples.',
    group1Count: '3',
    group2Count: '6',
    group3Count: '4'
  },
  {
    title: 'Primary 3 Kinyarwanda: Ikeshamvugo n\'Imyandikire',
    category: 'primary' as EducationCategoryId,
    className: 'P3',
    subject: 'Kinyarwanda',
    unitNumber: '4',
    unitName: 'Imyandikire n\'Ikibonezamvugo',
    lessonName: 'Gukoresha Ikeshamvugo ry\'Inshinga mu Nteruro',
    challenge: 'Abanyeshuri bakunda kuvanga inyuguti zifatanije (nka ny-, mp-, mb-) no kubura ikeshamvugo rinoze.',
    materials: 'Amakarita y\'inyuguti, ibitabo by\'ururimi bya REB P3, ifishi y\'imyitozo.',
    group1Count: '5',
    group2Count: '4',
    group3Count: '2'
  },
  {
    title: 'Pre-Primary Top Class: Numeracy (Kubara 1-10)',
    category: 'pre_primary' as EducationCategoryId,
    className: 'Top Class (Nursery)',
    subject: 'Numeracy & Mathematical Activities (Kubara)',
    unitNumber: '1',
    unitName: 'Numbers and Counting 1-10',
    lessonName: 'Matching Numerals with Real Quantities (1 to 10)',
    challenge: 'Learners can recite numbers verbally but struggle to associate the digit symbol with concrete countable objects.',
    materials: 'Bottle caps, wooden counting blocks, number cards 1-10, colorful counting beads.',
    group1Count: '4',
    group2Count: '5',
    group3Count: '3'
  },
  {
    title: 'Secondary 2 Physics: Electrical Circuits & Ohm\'s Law',
    category: 'secondary_o_level' as EducationCategoryId,
    className: 'S2',
    subject: 'Physics',
    unitNumber: '6',
    unitName: 'Current Electricity and Simple Circuits',
    lessonName: 'Relationship between Voltage, Current, and Resistance (V=IR)',
    challenge: 'Learners struggle to rearrange Ohm\'s Law equation (V=IR) to solve for current (I) or resistance (R) accurately.',
    materials: 'Connecting wires, 1.5V dry cells, miniature bulbs, ammeters, formula triangle cards.',
    group1Count: '5',
    group2Count: '6',
    group3Count: '3'
  }
];

export function RemedialLessonPlanModal({
  isOpen,
  onClose,
  userEmail,
  initialPlan,
  onSaved,
  onRequireSubscription
}: RemedialLessonPlanModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'sheet' | 'editor'>('form');
  const [selectedCategory, setSelectedCategory] = useState<EducationCategoryId>('primary');
  const [schoolName, setSchoolName] = useState('Nkorera Education School');
  const [unitNumber, setUnitNumber] = useState('2');
  const [unitName, setUnitName] = useState('Operations on Whole Numbers');
  const [identifiedChallenge, setIdentifiedChallenge] = useState('Abanyeshuri bananirwa guteranya baterura bava ku mwanya w\'ubumwe bajya ku binyacumi (Learners struggle with carrying/regrouping from ones to tens column).');
  const [learningMaterials, setLearningMaterials] = useState('Straw bundles (uduti), place-value charts, flashcards, counters, squared chalkboard grids');
  const [customNotes, setCustomNotes] = useState('Emphasize active hands-on manipulatives, scaffolding with peer pairs, and real-life shopping problems.');

  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Remedial plan master data state
  const [plan, setPlan] = useState<RemedialLessonPlanData>(() => {
    if (initialPlan) {
      return {
        ...initialPlan,
        language: initialPlan.language || 'English'
      };
    }
    return {
      id: `rp_${Date.now()}`,
      teacherName: 'NKUNDIMANA Theogene',
      className: 'P5',
      subject: 'Mathematics',
      lessonName: 'Addition with Carrying (Regrouping)',
      period: '40',
      date: new Date().toISOString().split('T')[0],
      language: 'English',
      group1Count: '4',
      group2Count: '5',
      group3Count: '3',
      introduction: 'Review previous knowledge on place values and simple single-digit addition to motivate struggling learners.',
      strugglingLearners: {
        group1: {
          categoriesAndIssues: 'Group 1: Slow learners who fail to carry numbers from ones to tens place.',
          objectives: 'To solve addition of two-digit numbers with carrying using place value counters.'
        },
        group2: {
          categoriesAndIssues: 'Group 2: Learners struggling with alignment of columns in multi-digit addition.',
          objectives: 'To write and compute 3-digit addition problems by aligning digits vertically.'
        },
        group3: {
          categoriesAndIssues: 'Group 3: Learners who confuse decimal place values during addition.',
          objectives: 'To align and add simple decimal numbers up to 1 decimal place correctly.'
        }
      },
      remedialActivities: {
        group1: {
          problem: 'Struggling with regrouping/carrying from unit column to tens column.',
          activities: 'Guide learners to bundle 10 straws as one ten, showing regrouping of ones.',
          methodology: 'Hands-on learning, small group pairing (scaffolding).',
          learningAids: 'Straw bundles, rubber bands, local place-value charts.'
        },
        group2: {
          problem: 'Incorrect column alignment for numbers with different digits.',
          activities: 'Draw vertical grids where each digit must sit in its exact column (H, T, O).',
          methodology: 'Guided grid exercise, peer review.',
          learningAids: 'Squared grids, multicolored chalks.'
        }
      },
      consolidationActivities: {
        group3: {
          categoryAndExplanation: 'Group 3: Learners who completed core activities but need structured exercises to consolidate concepts.',
          activities: 'Solve word problems involving addition of whole numbers from real-world shopping list scenarios.',
          methodology: 'Collaborative task cards, problem-solving.',
          learningAids: 'Sample shopping flyers, worksheets.'
        },
        group4: {
          categoryAndExplanation: 'Group 4: Fast-trackers/high-achievers who finished early and require advanced extended challenges.',
          activities: 'Create a family budget sheet where they add multiple columns and solve multi-step financial challenges.',
          methodology: 'Self-directed research, peer evaluation.',
          learningAids: 'Reference books, advanced math worksheets.'
        }
      },
      selfEvaluation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  useEffect(() => {
    if (initialPlan) {
      setPlan({
        ...initialPlan,
        language: initialPlan.language || 'English'
      });
      setActiveTab('sheet');
    }
  }, [initialPlan]);

  // Current category data
  const currentCategoryData = EDUCATION_CATEGORIES.find(c => c.id === selectedCategory) || EDUCATION_CATEGORIES[1];

  // Apply a preset
  const applyPreset = (preset: typeof STARTER_PRESETS[0]) => {
    setSelectedCategory(preset.category);
    setUnitNumber(preset.unitNumber);
    setUnitName(preset.unitName);
    setIdentifiedChallenge(preset.challenge);
    setLearningMaterials(preset.materials);
    setPlan(prev => ({
      ...prev,
      className: preset.className,
      subject: preset.subject,
      lessonName: preset.lessonName,
      group1Count: preset.group1Count,
      group2Count: preset.group2Count,
      group3Count: preset.group3Count
    }));
    setAiSuccessMessage(`✨ Applied preset: ${preset.title}`);
    setTimeout(() => setAiSuccessMessage(null), 3000);
  };

  // Language translation handler
  const handleLanguageChange = async (newLang: CbcLanguage) => {
    if (newLang === plan.language) return;

    setIsTranslating(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/translate-remedial-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          targetLanguage: newLang
        })
      });

      const data = await response.json();
      if (data.success && data.translatedPlan) {
        setPlan({
          ...data.translatedPlan,
          language: newLang
        });
        setAiSuccessMessage(`🌐 Translated into ${newLang} successfully!`);
      } else {
        setPlan(prev => ({ ...prev, language: newLang }));
      }
    } catch (err: any) {
      console.warn('Language switch fallback:', err);
      setPlan(prev => ({ ...prev, language: newLang }));
    } finally {
      setIsTranslating(false);
      setTimeout(() => setAiSuccessMessage(null), 3000);
    }
  };

  // Save the remedial lesson plan to Firestore and local records
  const handleSavePlan = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updatedPlan = {
        ...plan,
        updatedAt: new Date().toISOString()
      };
      await saveRemedialPlanToFirestore(updatedPlan);
      setPlan(updatedPlan);
      setAiSuccessMessage('💾 Remedial Lesson Plan has been saved to your Records!');
      setTimeout(() => setAiSuccessMessage(null), 3500);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage('Failed to save Remedial Lesson Plan. Please check connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to extract only pedagogical content for AI
  const getPedagogicalContentParams = (fullParams: any) => {
    return {
      className: fullParams.className,
      subject: fullParams.subject,
      unitNumber: fullParams.unitNumber,
      unitName: fullParams.unitName,
      lessonName: fullParams.lessonName,
      identifiedChallenge: fullParams.identifiedChallenge,
      group1Count: fullParams.group1Count,
      group2Count: fullParams.group2Count,
      group3Count: fullParams.group3Count,
      learningMaterials: fullParams.learningMaterials,
      customNotes: fullParams.customNotes,
      language: fullParams.language
    };
  };

  // AI Generation function
  const handleAiGenerate = async (focus: 'full' | 'objectives' | 'activities' = 'full') => {
    if (!plan.lessonName || !plan.subject) {
      setErrorMessage('Please provide at least a Lesson Name/Topic and Subject before generating.');
      return;
    }

    const subCheck = checkCanCreateRemedialLessonPlan();
    if (!subCheck.canCreate) {
      if (onRequireSubscription) {
        onRequireSubscription(subCheck.message || 'Subscription period has expired or all lesson plan credits have been used.');
      } else {
        setErrorMessage(subCheck.message || 'Subscription period has expired or all lesson plan credits have been used.');
      }
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setAiSuccessMessage(null);
    setGeneratingStep('Analyzing diagnostic learning challenge and group distribution...');

    const timer1 = setTimeout(() => {
      setGeneratingStep('Formulating REB SMART objectives for slow, struggling, and developing learners...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setGeneratingStep('Generating concrete scaffolding activities, methodologies, and learning aids...');
    }, 2800);

    try {
      const allParams = {
          teacherName: plan.teacherName,
          schoolName: schoolName,
          className: plan.className,
          subject: plan.subject,
          unitNumber: unitNumber,
          unitName: unitName,
          lessonName: plan.lessonName,
          period: plan.period,
          date: plan.date,
          language: plan.language || 'English',
          identifiedChallenge: identifiedChallenge,
          group1Count: plan.group1Count,
          group2Count: plan.group2Count,
          group3Count: plan.group3Count,
          learningMaterials: learningMaterials,
          customNotes: customNotes
      };

      const pedagogicalParams = getPedagogicalContentParams(allParams);

      const payload = {
        type: 'remedial-lesson-plan',
        email: userEmail,
        params: allParams
      };

      // Try specialized full endpoint first
      let response: Response;
      try {
        response = await fetch('/api/generate-full-remedial-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedagogicalParams)
        });
      } catch {
        // Fallback to /api/generate
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        // Retry with /api/generate
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const generatedData = await response.json();
      
      if (generatedData) {
        let resultPlan: any = generatedData.plan || generatedData;
        if (resultPlan.result) {
          try {
            resultPlan = typeof resultPlan.result === 'string' ? JSON.parse(resultPlan.result) : resultPlan.result;
          } catch {
            // Keep as is
          }
        }

        if (focus === 'full') {
          setPlan(prev => ({
            ...prev,
            ...resultPlan,
            id: prev.id || `rp_${Date.now()}`,
            teacherName: prev.teacherName || resultPlan.teacherName || 'NKUNDIMANA Theogene',
            className: prev.className || resultPlan.className,
            subject: prev.subject || resultPlan.subject,
            lessonName: prev.lessonName || resultPlan.lessonName,
            period: prev.period || resultPlan.period || '40',
            date: prev.date || resultPlan.date,
            language: prev.language || resultPlan.language || 'English',
            group1Count: prev.group1Count || resultPlan.group1Count || '4',
            group2Count: prev.group2Count || resultPlan.group2Count || '5',
            group3Count: prev.group3Count || resultPlan.group3Count || '3',
            createdAt: prev.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          const remSub = consumeRemedialLessonPlan();
          const rem = Math.max(0, remSub.totalPlansAllowed - remSub.usedPlansCount);
          const remNotice = ` (Hasigaye: ${rem} plans)`;
          setActiveTab('sheet');
          setIsEditing(false);
          setAiSuccessMessage(`✨ Masterpiece Remedial Lesson Plan generated with AI!${remNotice}`);
        } else if (focus === 'objectives') {
          setPlan(prev => ({
            ...prev,
            strugglingLearners: resultPlan.strugglingLearners || prev.strugglingLearners,
            updatedAt: new Date().toISOString()
          }));
          setAiSuccessMessage('🎯 Tailored SMART objectives formulated successfully!');
        } else if (focus === 'activities') {
          setPlan(prev => ({
            ...prev,
            remedialActivities: resultPlan.remedialActivities || prev.remedialActivities,
            consolidationActivities: resultPlan.consolidationActivities || prev.consolidationActivities,
            updatedAt: new Date().toISOString()
          }));
          setAiSuccessMessage('⚡ Remedial & Consolidation activities generated successfully!');
        }
        
        setTimeout(() => setAiSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.warn('AI generation error:', err);
      setErrorMessage(err.message || 'AI service is temporarily busy. Please try again.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGeneratingStep('');
    }
  };

  // Download 1-Page PDF using jsPDF
  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      await exportRemedialLessonPlanToPdf(plan, (plan.language as CbcLanguage) || 'English');
      setAiSuccessMessage('📥 PDF ya Remedial Lesson Plan yamanutse neza! (PDF Downloaded with jsPDF)');
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } catch (err) {
      console.error('PDF creation error with jsPDF, trying DOM fallback:', err);
      const element = document.getElementById('remedial-print-document');
      if (element) {
        try {
          const html2pdfModule = (await import('html2pdf.js')).default;
          const opt = {
            margin:       [6, 6, 6, 6] as [number, number, number, number],
            filename:     `REB_Remedial_Plan_${(plan.subject || 'Subject').replace(/\s+/g, '_')}_${plan.className}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
          };
          await html2pdfModule().from(element).set(opt).save();
        } catch (err2) {
          console.error('DOM fallback failed:', err2);
          setErrorMessage('Failed to generate PDF. Please use the Print Sheet button for browser print.');
        }
      } else {
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const currentLang = (plan.language as CbcLanguage) || 'English';
  const t = REMEDIAL_TRANSLATIONS[currentLang] || REMEDIAL_TRANSLATIONS.English;

  if (!isOpen) return null;

  return (
    <div className="appearance-none fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="appearance-none bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header Bar */}
        <div className="appearance-none px-5 sm:px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white">
          <div className="appearance-none flex items-center gap-3">
            <div className="appearance-none bg-teal-600/80 p-2 rounded-xl border border-teal-400/30 shadow-inner">
              <Sparkles className="appearance-none w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="appearance-none flex items-center gap-2">
                <h2 className="appearance-none text-base sm:text-lg font-bold tracking-tight text-white">
                  {t.remedialTitle}
                </h2>
                <span className="appearance-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  REB CBC Scaffolding
                </span>
              </div>
              <p className="appearance-none text-xs text-slate-300 hidden sm:block">
                Modern pedagogical tool to prepare remedial lessons for struggling learners and targeted intervention
              </p>
            </div>
          </div>
          
          <div className="appearance-none flex items-center gap-2">
            {/* Language Selection Pill */}
            <div className="appearance-none flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 py-1.5 rounded-lg">
              <Languages className="appearance-none w-4 h-4 text-slate-400" />
              <select
                value={plan.language || 'English'}
                onChange={(e) => handleLanguageChange(e.target.value as CbcLanguage)}
                disabled={isTranslating || isGenerating}
                className="appearance-none bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer"
                id="remedial-header-language-select"
              >
                {languagesConfig.map(lang => (
                  <option key={lang.code} value={lang.code} className="appearance-none bg-slate-900 text-white">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={onClose}
              className="appearance-none text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
              id="remedial-close-modal-btn"
              title="Close modal"
            >
              <X className="appearance-none w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning / Success Alerts */}
        {errorMessage && (
          <div className="appearance-none bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="appearance-none w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="appearance-none font-medium">{errorMessage}</span>
          </div>
        )}
        {aiSuccessMessage && (
          <div className="appearance-none bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="appearance-none w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{aiSuccessMessage}</span>
          </div>
        )}
        {isTranslating && (
          <div className="appearance-none bg-teal-50 border-b border-teal-200 px-6 py-2.5 flex items-center gap-2 text-teal-800 text-xs sm:text-sm font-medium animate-pulse">
            <RefreshCw className="appearance-none w-4 h-4 flex-shrink-0 text-teal-600 animate-spin" />
            <span>🌐 AI is translating and localizing remedial lesson context into selected language...</span>
          </div>
        )}

        {/* Tabs & Main Actions Bar */}
        <div className="appearance-none px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between bg-slate-50">
          <div className="appearance-none flex bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => { setActiveTab('form'); setIsEditing(true); }}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'form' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="remedial-tab-form-btn"
            >
              <Wand2 className="appearance-none w-3.5 h-3.5" />
              {t.metadataForm}
            </button>
            <button
              onClick={() => { setActiveTab('sheet'); setIsEditing(false); }}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'sheet' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="remedial-tab-sheet-btn"
            >
              <FileText className="appearance-none w-3.5 h-3.5" />
              {t.previewTab}
            </button>
            <button
              onClick={() => { setActiveTab('editor'); setIsEditing(true); }}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'editor' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="remedial-tab-editor-btn"
            >
              <Edit3 className="appearance-none w-3.5 h-3.5" />
              {t.editorTab}
            </button>
          </div>

          <div className="appearance-none flex flex-wrap gap-2 items-center">
            {/* Quick Trigger for Full AI Plan */}
            <button
              onClick={() => handleAiGenerate('full')}
              disabled={isGenerating || isTranslating}
              className="appearance-none bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-60 text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-lg font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              id="remedial-quick-generate-btn"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="appearance-none w-3.5 h-3.5 animate-spin" />
                  <span>{t.writingAi}</span>
                </>
              ) : (
                <>
                  <Sparkles className="appearance-none w-3.5 h-3.5 text-amber-300" />
                  <span>{t.generateFull}</span>
                </>
              )}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="appearance-none bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all"
              id="remedial-save-top-btn"
            >
              <Save className="appearance-none w-3.5 h-3.5" />
              <span>{isSaving ? t.savingText : t.bika}</span>
            </button>
            
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="appearance-none bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm"
              id="remedial-download-pdf-top-btn"
            >
              <Download className="appearance-none w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? t.downloadingText : t.downloadPdf}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="appearance-none flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          
          {/* ========================================================================= */}
          {/* TAB 1: AI GENERATOR & INPUT FORM                                          */}
          {/* ========================================================================= */}
          {activeTab === 'form' && (
            <div className="appearance-none max-w-4xl mx-auto space-y-6">
              
              {/* Presets / Starter Ingero Bar */}
              <div className="appearance-none bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
                <div className="appearance-none flex items-center gap-2 mb-2">
                  <Lightbulb className="appearance-none w-4 h-4 text-amber-600" />
                  <span className="appearance-none text-xs font-bold text-amber-900 uppercase tracking-wide">
                    {t.starterPresetsTitle}
                  </span>
                  <span className="appearance-none text-[11px] text-amber-700 ml-auto hidden sm:inline">
                    Click on any preset below to auto-fill the form
                  </span>
                </div>
                <div className="appearance-none flex flex-wrap gap-2">
                  {STARTER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPreset(preset)}
                      className="appearance-none bg-white hover:bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs text-left"
                      id={`remedial-preset-${idx}`}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Container */}
              <div className="appearance-none bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-6">
                
                {/* Language Selection & Full Context Adaptation Banner */}
                <div className="appearance-none bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-teal-500/30">
                  <div className="appearance-none flex items-center gap-3">
                    <div className="appearance-none w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center shrink-0">
                      <Languages className="appearance-none w-5 h-5 text-teal-300" />
                    </div>
                    <div>
                      <h4 className="appearance-none text-xs sm:text-sm font-black text-teal-200 uppercase tracking-wider">
                        Lesson Language & Context Adaptation
                      </h4>
                      <p className="appearance-none text-[11px] text-slate-300">
                        Select your preferred language; AI instantly translates and adapts the entire lesson context and activities.
                      </p>
                    </div>
                  </div>
                  <select
                    value={plan.language || 'English'}
                    onChange={(e) => handleLanguageChange(e.target.value as CbcLanguage)}
                    disabled={isTranslating || isGenerating}
                    className="appearance-none bg-teal-900/90 text-white font-bold text-xs sm:text-sm rounded-xl px-3 py-2 border border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer w-full sm:w-auto"
                    id="remedial-form-language-select"
                  >
                    {languagesConfig.map(lang => (
                      <option key={lang.code} value={lang.code} className="appearance-none bg-slate-950 text-white py-1">
                        {lang.flag} {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 1: Education Level Categories */}
                <div>
                  <div className="appearance-none flex items-center justify-between mb-2">
                    <label className="appearance-none text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="appearance-none w-4 h-4 text-teal-600" />
                      1. Select Education Level Category:
                    </label>
                  </div>
                  <div className="appearance-none grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {EDUCATION_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          if (cat.levels.length > 0) {
                            setPlan(prev => ({ ...prev, className: cat.levels[0] }));
                          }
                          if (cat.subjects.length > 0) {
                            setPlan(prev => ({ ...prev, subject: cat.subjects[0] }));
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-2 ring-teal-500/20'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        id={`remedial-cat-${cat.id}`}
                      >
                        <span className="appearance-none text-[10px] font-extrabold uppercase tracking-wide text-teal-600">
                          {cat.badge}
                        </span>
                        <span className="appearance-none text-xs font-bold truncate mt-0.5">
                          {getCategoryTitle(cat, (plan.language as any) || 'English').replace(/^[IVX]+\.\s*/, '')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Teacher & Lesson Information */}
                <div className="border-t border-slate-150 pt-5">
                  <h4 className="appearance-none text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BookOpen className="appearance-none w-4 h-4 text-teal-600" />
                    2. General Lesson & Teacher Details:
                  </h4>

                  <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Teacher Name */}
                    <div>
                      <div className="appearance-none mb-1">
                        <label className="appearance-none text-xs font-semibold text-slate-600">{t.teacherLabel} <span className="appearance-none text-red-500">*</span></label>
                      </div>
                      <input
                        required
                        type="text"
                        value={plan.teacherName || ''}
                        onChange={e => {
                          const val = e.target.value;
                          console.log('Teacher Name Input:', val);
                          setPlan(prev => ({ ...prev, teacherName: val }));
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="E.g. NKUNDIMANA Theogene"
                        id="remedial-input-teacher"
                      />
                    </div>

                    {/* School Name */}
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">{t.schoolLabel} <span className="appearance-none text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        value={schoolName || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setSchoolName(val);
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="E.g. Nkorera Education School"
                        id="remedial-input-school"
                      />
                    </div>

                    {/* Class Selection */}
                    <div className="appearance-none relative">
                      <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">{t.classLabel} <span className="appearance-none text-red-500">*</span></label>
                      <select
                        value={plan.className || ''}
                        onChange={e => setPlan(prev => ({ ...prev, className: e.target.value }))}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none"
                        id="remedial-input-class"
                      >
                        {currentCategoryData.levels.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">{t.subjectLabel} <span className="appearance-none text-red-500">*</span></label>
                      <select
                        required
                        value={plan.subject || ''}
                        onChange={e => {
                          const val = e.target.value;
                          console.log('Subject Selection:', val);
                          setPlan(prev => ({ ...prev, subject: val }));
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        id="remedial-input-subject"
                      >
                        <option value="">Select a subject...</option>
                        {currentCategoryData.subjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    {/* Period Duration */}
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">{t.periodLabel} <span className="appearance-none text-red-500">*</span></label>
                      <div className="appearance-none flex gap-2">
                        <input
                          type="text"
                          value={plan.period || ''}
                          onChange={e => {
                            const val = e.target.value;
                            console.log('Period Input:', val);
                            setPlan(prev => ({ ...prev, period: val }));
                          }}
                          className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="40"
                          id="remedial-input-period"
                        />
                        <button
                          type="button"
                          onClick={() => setPlan(prev => ({ ...prev, period: '40' }))}
                          className={`px-2 py-1 text-xs rounded-lg font-bold border ${plan.period === '40' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                        >
                          40m
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlan(prev => ({ ...prev, period: '80' }))}
                          className={`px-2 py-1 text-xs rounded-lg font-bold border ${plan.period === '80' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                        >
                          80m
                        </button>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">{t.dateLabel} <span className="appearance-none text-red-500">*</span></label>
                      <input
                        type="date"
                        value={plan.date || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setPlan(prev => ({ ...prev, date: val }));
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                        id="remedial-input-date"
                      />
                    </div>

                    {/* Unit Number & Title */}
                    <div className="appearance-none sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">Unit Number <span className="appearance-none text-red-500">*</span>:</label>
                      <input
                        type="text"
                        value={unitNumber || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setUnitNumber(val);
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="E.g. Unit 2"
                      />
                      </div>
                      <div className="appearance-none sm:col-span-2">
                        <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">Unit Title / Topic <span className="appearance-none text-red-500">*</span>:</label>
                        <input
                          required
                          type="text"
                          value={unitName || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setUnitName(val);
                          }}
                          className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="E.g. Operations on Whole Numbers up to 100,000"
                        />
                      </div>
                    </div>

                    {/* Lesson Name / Topic */}
                    <div className="appearance-none sm:col-span-2 lg:col-span-3">
                      <div className="appearance-none mb-1">
                        <label className="appearance-none text-xs font-semibold text-slate-700 font-bold flex items-center gap-1">
                          <Target className="appearance-none w-3.5 h-3.5 text-teal-600" />
                          {t.lessonLabel} <span className="appearance-none text-red-500">*</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={plan.lessonName || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setPlan(prev => ({ ...prev, lessonName: val }));
                        }}
                        className="appearance-none w-full border-2 border-teal-200 text-slate-900 bg-white focus:border-teal-500 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/30"
                        placeholder="E.g. Addition of whole numbers with carrying / Guteranya guterura"
                        id="remedial-input-lesson-name"
                      />
                    </div>

                  </div>
                </div>

                {/* Step 3: Diagnostic Learning Challenge / Problem Identified */}
                <div className="border-t border-slate-150 pt-5">
                  <div className="appearance-none mb-2">
                    <label className="appearance-none text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="appearance-none w-4 h-4 text-amber-600" />
                      3. {t.diagnosticChallengeLabel} <span className="appearance-none text-red-500">*</span>
                    </label>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={identifiedChallenge || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setIdentifiedChallenge(val);
                    }}
                    className="appearance-none w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="E.g. Abanyeshuri bananirwa guteranya baterura bava ku bumwe bajya ku binyacumi (Learners struggle to regroup ones into tens when adding)..."
                    id="remedial-input-challenge"
                  />
                  <p className="appearance-none text-[11px] text-slate-500 mt-1">
                    Describe the diagnostic learning barriers or challenges faced by students so AI can tailor scaffolding activities.
                  </p>
                </div>

                {/* Step 4: Group Distribution & Learning Materials */}
                <div className="border-t border-slate-150 pt-5">
                  <h4 className="appearance-none text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="appearance-none w-4 h-4 text-teal-600" />
                    4. {t.groupCounts}
                  </h4>

                  <div className="appearance-none grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="appearance-none bg-rose-50/70 border border-rose-200 rounded-xl p-3">
                      <label className="appearance-none block text-xs font-bold text-rose-900 mb-1">{t.g1CountLabel} <span className="appearance-none text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={plan.group1Count || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setPlan(prev => ({ ...prev, group1Count: val }));
                        }}
                        className="appearance-none w-full border border-rose-300 rounded-lg px-3 py-1.5 text-sm bg-white font-bold text-rose-950"
                        id="remedial-input-g1-count"
                      />
                      <span className="appearance-none text-[10px] text-rose-700">Slow Learners (Need Targeted Support)</span>
                    </div>

                    <div className="appearance-none bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                      <label className="appearance-none block text-xs font-bold text-amber-900 mb-1">{t.g2CountLabel} <span className="appearance-none text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={plan.group2Count || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setPlan(prev => ({ ...prev, group2Count: val }));
                        }}
                        className="appearance-none w-full border border-amber-300 rounded-lg px-3 py-1.5 text-sm bg-white font-bold text-amber-950"
                        id="remedial-input-g2-count"
                      />
                      <span className="appearance-none text-[10px] text-amber-700">Consolidation Group (Need Practice)</span>
                    </div>

                    <div className="appearance-none bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                      <label className="appearance-none block text-xs font-bold text-emerald-900 mb-1">{t.g3CountLabel} <span className="appearance-none text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={plan.group3Count || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setPlan(prev => ({ ...prev, group3Count: val }));
                        }}
                        className="appearance-none w-full border border-emerald-300 rounded-lg px-3 py-1.5 text-sm bg-white font-bold text-emerald-950"
                        id="remedial-input-g3-count"
                      />
                      <span className="appearance-none text-[10px] text-emerald-700">Fast Trackers (Extension Activities)</span>
                    </div>
                  </div>

                  {/* Concrete Materials */}
                  <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-slate-700 mb-1">{t.materialsLabel} <span className="appearance-none text-red-500">*</span></label>
                      <input
                        required
                        type="text"
                        value={learningMaterials || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setLearningMaterials(val);
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="E.g. Straw bundles (uduti), place-value charts, counters"
                      />
                    </div>
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-slate-700 mb-1">{t.customNotesLabel} <span className="appearance-none text-red-500">*</span></label>
                      <textarea
                        required
                        value={customNotes || ''}
                        onChange={e => {
                          const val = e.target.value;
                          console.log('Custom Notes Input:', val);
                          setCustomNotes(val);
                        }}
                        className="appearance-none w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="E.g. Focus on peer scaffolding & local shopping contexts"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* PRIMARY AI GENERATION ACTION CENTER                                       */}
                {/* ========================================================================= */}
                <div className="border-t-2 border-teal-100 pt-6 bg-gradient-to-b from-teal-50/50 to-teal-100/40 -mx-5 -mb-5 p-6 rounded-b-2xl">
                  <div className="appearance-none max-w-2xl mx-auto text-center space-y-4">
                    <div>
                      <h3 className="appearance-none text-base sm:text-lg font-extrabold text-teal-950 flex items-center justify-center gap-2">
                        <Sparkles className="appearance-none w-5 h-5 text-amber-500" />
                        Generate Remedial Lesson Plan with AI
                      </h3>
                      <p className="appearance-none text-xs text-teal-800/80 mt-0.5">
                        Use AI to generate a complete remedial lesson plan aligned with REB standards in seconds
                      </p>
                    </div>

                    {isGenerating && (
                      <div className="appearance-none bg-white border border-teal-200 rounded-2xl p-4 shadow-sm text-left animate-fadeIn">
                        <div className="appearance-none flex items-center gap-3">
                          <RefreshCw className="appearance-none w-5 h-5 text-teal-600 animate-spin flex-shrink-0" />
                          <div className="appearance-none flex-1">
                            <span className="appearance-none text-xs font-bold text-teal-950 block">
                              AI is generating the Remedial Lesson Plan...
                            </span>
                            <span className="appearance-none text-[11px] text-slate-600">
                              {generatingStep || 'Please wait...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Master Primary AI Button */}
                    <div className="appearance-none flex flex-col sm:flex-row gap-2 justify-center items-center">
                      <button
                        onClick={() => handleAiGenerate('full')}
                        disabled={isGenerating || isTranslating}
                        className="appearance-none w-full sm:w-auto bg-gradient-to-r from-teal-600 via-teal-700 to-amber-700 hover:from-teal-700 hover:to-amber-800 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
                        id="remedial-big-generate-btn"
                      >
                        <Sparkles className="appearance-none w-5 h-5 text-amber-300 animate-pulse" />
                        <span>{isGenerating ? t.writingAi : t.generateFull}</span>
                      </button>

                      <button
                        onClick={() => handleAiGenerate('objectives')}
                        disabled={isGenerating || isTranslating}
                        className="appearance-none w-full sm:w-auto bg-white hover:bg-teal-50 border border-teal-300 text-teal-900 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                        id="remedial-sub-objectives-btn"
                      >
                        <Target className="appearance-none w-4 h-4 text-teal-600" />
                        <span>{t.smartObj}</span>
                      </button>

                      <button
                        onClick={() => handleAiGenerate('activities')}
                        disabled={isGenerating || isTranslating}
                        className="appearance-none w-full sm:w-auto bg-white hover:bg-teal-50 border border-teal-300 text-teal-900 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                        id="remedial-sub-activities-btn"
                      >
                        <Layers className="appearance-none w-4 h-4 text-teal-600" />
                        <span>{t.remedialActions}</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: OFFICIAL 1-PAGE REB SHEET PREVIEW                                   */}
          {/* ========================================================================= */}
          {activeTab === 'sheet' && (
            <div className="appearance-none max-w-4xl mx-auto space-y-4">
              
              {/* Sheet Utility Controls */}
              <div className="appearance-none bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 justify-between items-center shadow-xs">
                <div className="appearance-none flex items-center gap-2">
                  <span className="appearance-none text-xs font-bold text-slate-700 uppercase tracking-wide">
                    REB 1-Page Format
                  </span>
                  <span className="appearance-none bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {plan.language || 'English'}
                  </span>
                </div>

                <div className="appearance-none flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                      isEditing 
                        ? 'bg-amber-500 text-white border-amber-600' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    id="remedial-toggle-edit-mode-btn"
                  >
                    <Edit3 className="appearance-none w-3.5 h-3.5" />
                    <span>{isEditing ? 'Finish Editing' : 'Edit Sheet'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 transition-all flex items-center gap-1"
                    id="remedial-print-sheet-btn"
                  >
                    <Printer className="appearance-none w-3.5 h-3.5" />
                    <span>{t.printBtn}</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPdf}
                    className="appearance-none bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs"
                    id="remedial-download-pdf-sheet-btn"
                  >
                    <Download className="appearance-none w-3.5 h-3.5" />
                    <span>{isDownloadingPdf ? t.downloadingText : t.downloadPdf}</span>
                  </button>
                </div>
              </div>

              {/* Printable REB 1-Page Document Container */}
              <div 
                id="remedial-print-document"
                className="appearance-none bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-md text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
                style={{ fontFamily: "'Liberation Sans', Arial, sans-serif" }}
              >
                {/* Official Title Header */}
                <div className="appearance-none text-center pb-3 mb-3 border-b-2 border-slate-800">
                  <h1 className="appearance-none text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
                    {t.remedialTitle}
                  </h1>
                  <p className="appearance-none text-[11px] font-semibold text-slate-700 mt-0.5">
                    {t.subTitle}
                  </p>
                </div>

                {/* Section A: GENERAL INFORMATION */}
                <div className="appearance-none mb-3">
                  <div className="appearance-none bg-slate-100 border border-slate-800 px-2 py-1 font-bold text-[11px] uppercase">
                    A. GENERAL INFORMATION
                  </div>
                  
                  <table className="appearance-none w-full border-collapse border border-slate-800 text-[11px] mt-0.5">
                    <tbody>
                      <tr>
                        <td className="border border-slate-800 p-1.5 w-1/2">
                          <strong>Class:</strong> {plan.className}
                        </td>
                        <td className="border border-slate-800 p-1.5 w-1/2">
                          <strong>Lesson:</strong> {plan.lessonName}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 p-1.5">
                          <strong>Period:</strong> {plan.period} Min
                        </td>
                        <td className="border border-slate-800 p-1.5">
                          <strong>Date:</strong> {plan.date}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 p-1.5">
                          <strong>Teachername:</strong> {plan.teacherName || 'NKUNDIMANA Theogene'}
                        </td>
                        <td className="border border-slate-800 p-1.5 text-[11px]">
                          <div className="space-y-0.5">
                            <div><strong>Group 1:</strong> Number of learners who need remedial activities: {plan.group1Count}</div>
                            <div><strong>Group 2:</strong> Number of learners who need consolidation activities: {plan.group2Count}</div>
                            <div><strong>Group 3:</strong> Number of learners who need extended activities: {plan.group3Count}</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 p-1.5" colSpan={2}>
                          <strong>Introduction: Brief review or warm-up activity that connects to the learning objectives.</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.introduction} 
                              onChange={e => setPlan(prev => ({ ...prev, introduction: e.target.value }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[11px] mt-1" 
                            />
                          ) : (
                            <span className="appearance-none italic block mt-1">{plan.introduction}</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section B: IDENTIFIED GROUPS OF STRUGGLING LEARNERS */}
                <div className="appearance-none mb-3">
                  <div className="appearance-none bg-slate-100 border border-slate-800 px-2 py-1 font-bold text-[11px] uppercase">
                    B. IDENTIFIED GROUPS OF STRUGGLING LEARNERS
                  </div>
                  
                  <table className="appearance-none w-full border-collapse border border-slate-800 text-[10.5px] mt-0.5">
                    <thead>
                      <tr className="appearance-none bg-slate-50">
                        <th className="border border-slate-800 p-1.5 font-bold w-[50%] text-left">
                          Categories of learners who need the remedial activities and issues identified
                        </th>
                        <th className="border border-slate-800 p-1.5 font-bold w-[50%] text-left">
                          Objectives per categories identified
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group 1 */}
                      <tr>
                        <td className="border border-slate-800 p-1.5 align-top">
                          <strong className="appearance-none text-slate-950">Group 1:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.strugglingLearners.group1.categoriesAndIssues} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                strugglingLearners: {
                                  ...prev.strugglingLearners,
                                  group1: { ...prev.strugglingLearners.group1, categoriesAndIssues: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.strugglingLearners.group1.categoriesAndIssues}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1.5 align-top">
                          <strong className="appearance-none text-slate-950">Group 1:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.strugglingLearners.group1.objectives} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                strugglingLearners: {
                                  ...prev.strugglingLearners,
                                  group1: { ...prev.strugglingLearners.group1, objectives: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.strugglingLearners.group1.objectives}</span>
                          )}
                        </td>
                      </tr>

                      {/* Group 2 */}
                      <tr>
                        <td className="border border-slate-800 p-1.5 align-top">
                          <strong className="appearance-none text-slate-950">Group 2:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.strugglingLearners.group2.categoriesAndIssues} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                strugglingLearners: {
                                  ...prev.strugglingLearners,
                                  group2: { ...prev.strugglingLearners.group2, categoriesAndIssues: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.strugglingLearners.group2.categoriesAndIssues}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1.5 align-top">
                          <strong className="appearance-none text-slate-950">Group 2:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.strugglingLearners.group2.objectives} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                strugglingLearners: {
                                  ...prev.strugglingLearners,
                                  group2: { ...prev.strugglingLearners.group2, objectives: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.strugglingLearners.group2.objectives}</span>
                          )}
                        </td>
                      </tr>

                      {/* Group 3 */}
                      <tr>
                        <td className="border border-slate-800 p-1.5 align-top">
                          <strong className="appearance-none text-slate-950">Group 3:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.strugglingLearners.group3.categoriesAndIssues} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                strugglingLearners: {
                                  ...prev.strugglingLearners,
                                  group3: { ...prev.strugglingLearners.group3, categoriesAndIssues: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.strugglingLearners.group3.categoriesAndIssues}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1.5 align-top">
                          <strong className="appearance-none text-slate-950">Group 3:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.strugglingLearners.group3.objectives} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                strugglingLearners: {
                                  ...prev.strugglingLearners,
                                  group3: { ...prev.strugglingLearners.group3, objectives: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.strugglingLearners.group3.objectives}</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section C: IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS */}
                <div className="appearance-none mb-3">
                  <div className="appearance-none bg-slate-100 border border-slate-800 px-2 py-1 font-bold text-[11px] uppercase">
                    C. IDENTIFIED PROBLEMS, REMEDIAL ACTIVITIES AND LEARNING AIDS
                  </div>
                  
                  <table className="appearance-none w-full border-collapse border border-slate-800 text-[10px] mt-0.5">
                    <thead>
                      <tr className="appearance-none bg-slate-50">
                        <th className="border border-slate-800 p-1 w-[22%] font-bold text-left">Identified problem</th>
                        <th className="border border-slate-800 p-1 w-[38%] font-bold text-left">Remedial activities</th>
                        <th className="border border-slate-800 p-1 w-[20%] font-bold text-left">Methodology used</th>
                        <th className="border border-slate-800 p-1 w-[20%] font-bold text-left">Teaching and learning aids</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group 1 */}
                      <tr>
                        <td className="border border-slate-800 p-1 align-top">
                          <strong className="appearance-none text-slate-950">Group 1:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group1.problem} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group1: { ...prev.remedialActivities.group1, problem: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.remedialActivities.group1.problem}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group1.activities} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group1: { ...prev.remedialActivities.group1, activities: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.remedialActivities.group1.activities}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group1.methodology} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group1: { ...prev.remedialActivities.group1, methodology: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.remedialActivities.group1.methodology}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group1.learningAids} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group1: { ...prev.remedialActivities.group1, learningAids: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.remedialActivities.group1.learningAids}
                        </td>
                      </tr>

                      {/* Group 2 */}
                      <tr>
                        <td className="border border-slate-800 p-1 align-top">
                          <strong className="appearance-none text-slate-950">Group 2:</strong><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group2.problem} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group2: { ...prev.remedialActivities.group2, problem: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1">{plan.remedialActivities.group2.problem}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group2.activities} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group2: { ...prev.remedialActivities.group2, activities: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.remedialActivities.group2.activities}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group2.methodology} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group2: { ...prev.remedialActivities.group2, methodology: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.remedialActivities.group2.methodology}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.remedialActivities.group2.learningAids} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                remedialActivities: {
                                  ...prev.remedialActivities,
                                  group2: { ...prev.remedialActivities.group2, learningAids: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.remedialActivities.group2.learningAids}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section D: CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS */}
                <div className="appearance-none mb-3">
                  <div className="appearance-none bg-slate-100 border border-slate-800 px-2 py-1 font-bold text-[11px] uppercase">
                    D. CONSOLIDATION AND EXTENDED ACTIVITIES FOR OTHER LEARNERS
                  </div>
                  
                  <table className="appearance-none w-full border-collapse border border-slate-800 text-[10px] mt-0.5">
                    <thead>
                      <tr className="appearance-none bg-slate-50">
                        <th className="border border-slate-800 p-1 w-[22%] font-bold text-left">Category of learners & Short explanations</th>
                        <th className="border border-slate-800 p-1 w-[38%] font-bold text-left">Consolidation/Extended activities</th>
                        <th className="border border-slate-800 p-1 w-[20%] font-bold text-left">Methodology used</th>
                        <th className="border border-slate-800 p-1 w-[20%] font-bold text-left">Learning aids</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group 3 Consolidated */}
                      <tr>
                        <td className="border border-slate-800 p-1 align-top">
                          <strong className="appearance-none text-slate-950">Group 3:</strong><br />
                          <span className="text-[9.5px] font-semibold text-slate-800">Learners who need consolidated activities</span><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group3.categoryAndExplanation} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group3: { ...prev.consolidationActivities.group3, categoryAndExplanation: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1 text-slate-700">{plan.consolidationActivities.group3.categoryAndExplanation}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group3.activities} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group3: { ...prev.consolidationActivities.group3, activities: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.consolidationActivities.group3.activities}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group3.methodology} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group3: { ...prev.consolidationActivities.group3, methodology: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.consolidationActivities.group3.methodology}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group3.learningAids} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group3: { ...prev.consolidationActivities.group3, learningAids: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.consolidationActivities.group3.learningAids}
                        </td>
                      </tr>

                      {/* Group 4 Extended */}
                      <tr>
                        <td className="border border-slate-800 p-1 align-top">
                          <strong className="appearance-none text-slate-950">Group 4:</strong><br />
                          <span className="text-[9.5px] font-semibold text-slate-800">Learners who need extended activities</span><br />
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group4.categoryAndExplanation} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group4: { ...prev.consolidationActivities.group4, categoryAndExplanation: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px] mt-1" 
                            />
                          ) : (
                            <span className="block mt-1 text-slate-700">{plan.consolidationActivities.group4.categoryAndExplanation}</span>
                          )}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group4.activities} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group4: { ...prev.consolidationActivities.group4, activities: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.consolidationActivities.group4.activities}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group4.methodology} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group4: { ...prev.consolidationActivities.group4, methodology: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.consolidationActivities.group4.methodology}
                        </td>
                        <td className="border border-slate-800 p-1 align-top">
                          {isEditing ? (
                            <textarea 
                              rows={2}
                              value={plan.consolidationActivities.group4.learningAids} 
                              onChange={e => setPlan(prev => ({
                                ...prev,
                                consolidationActivities: {
                                  ...prev.consolidationActivities,
                                  group4: { ...prev.consolidationActivities.group4, learningAids: e.target.value }
                                }
                              }))}
                              className="appearance-none w-full border focus:outline-none p-1 rounded text-[9.5px]" 
                            />
                          ) : plan.consolidationActivities.group4.learningAids}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section E: TEACHER'S SELF-EVALUATION */}
                <div>
                  <div className="appearance-none bg-slate-100 border border-slate-800 px-2 py-1 font-bold text-[11px] uppercase">
                    Teacher’s Self - Evaluation
                  </div>
                  <div className="border border-slate-800 p-2 min-h-[60px] mt-0.5 text-[10.5px]">
                    {isEditing ? (
                      <textarea 
                        rows={2}
                        value={plan.selfEvaluation} 
                        onChange={e => setPlan(prev => ({ ...prev, selfEvaluation: e.target.value }))}
                        className="appearance-none w-full border focus:outline-none p-1 rounded text-[10px]" 
                        placeholder={t.selfEvalPlaceholder}
                      />
                    ) : (
                      <div className="appearance-none min-h-[50px]">
                        {plan.selfEvaluation ? (
                          <p className="appearance-none text-slate-800 whitespace-pre-wrap">
                            {plan.selfEvaluation}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DIRECT SECTION-BY-SECTION EDITOR                                   */}
          {/* ========================================================================= */}
          {activeTab === 'editor' && (
            <div className="appearance-none max-w-4xl mx-auto space-y-6">
              <div className="appearance-none bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="appearance-none flex items-center justify-between border-b pb-3">
                  <h3 className="appearance-none text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Edit3 className="appearance-none w-4 h-4 text-teal-600" />
                    Direct Section-by-Section Editor
                  </h3>
                  <button
                    onClick={handleSavePlan}
                    disabled={isSaving}
                    className="appearance-none bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Save className="appearance-none w-3.5 h-3.5" />
                    <span>{isSaving ? t.savingText : t.bika}</span>
                  </button>
                </div>

                {/* Section A Editor */}
                <div className="appearance-none space-y-3">
                  <h4 className="appearance-none text-xs font-bold text-teal-900 uppercase">Section A: General Info</h4>
                  <div>
                    <label className="appearance-none block text-xs font-semibold text-slate-600 mb-1">{t.introLabel}</label>
                    <textarea
                      rows={2}
                      value={plan.introduction}
                      onChange={e => setPlan(prev => ({ ...prev, introduction: e.target.value }))}
                      className="appearance-none w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Section B Editor */}
                <div className="appearance-none space-y-3 border-t pt-4">
                  <h4 className="appearance-none text-xs font-bold text-teal-900 uppercase">Section B: Groups & Objectives</h4>
                  <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-rose-900 mb-1">{t.g1Label} Problem</label>
                      <textarea
                        rows={2}
                        value={plan.strugglingLearners.group1.categoriesAndIssues}
                        onChange={e => setPlan(prev => ({
                          ...prev,
                          strugglingLearners: {
                            ...prev.strugglingLearners,
                            group1: { ...prev.strugglingLearners.group1, categoriesAndIssues: e.target.value }
                          }
                        }))}
                        className="appearance-none w-full border rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="appearance-none block text-xs font-semibold text-rose-900 mb-1">{t.g1Objective}</label>
                      <textarea
                        rows={2}
                        value={plan.strugglingLearners.group1.objectives}
                        onChange={e => setPlan(prev => ({
                          ...prev,
                          strugglingLearners: {
                            ...prev.strugglingLearners,
                            group1: { ...prev.strugglingLearners.group1, objectives: e.target.value }
                          }
                        }))}
                        className="appearance-none w-full border rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C & D Editor */}
                <div className="appearance-none space-y-3 border-t pt-4">
                  <h4 className="appearance-none text-xs font-bold text-teal-900 uppercase">Section C: Remedial Activities</h4>
                  <div>
                    <label className="appearance-none block text-xs font-semibold text-slate-700 mb-1">Group 1 Scaffolding Step-by-Step:</label>
                    <textarea
                      rows={3}
                      value={plan.remedialActivities.group1.activities}
                      onChange={e => setPlan(prev => ({
                        ...prev,
                        remedialActivities: {
                          ...prev.remedialActivities,
                          group1: { ...prev.remedialActivities.group1, activities: e.target.value }
                        }
                      }))}
                      className="appearance-none w-full border rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>

                {/* Section E Editor */}
                <div className="appearance-none space-y-3 border-t pt-4">
                  <h4 className="appearance-none text-xs font-bold text-teal-900 uppercase">{t.selfEvalHeader}</h4>
                  <textarea
                    rows={3}
                    value={plan.selfEvaluation}
                    onChange={e => setPlan(prev => ({ ...prev, selfEvaluation: e.target.value }))}
                    className="appearance-none w-full border rounded-xl p-2.5 text-xs"
                    placeholder={t.selfEvalPlaceholder}
                  />
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="appearance-none px-6 py-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div className="appearance-none flex items-center gap-2">
            <span className="appearance-none font-semibold text-slate-700">Rwandan CBC Education Assistant © 2026</span>
            <span className="appearance-none text-slate-300">•</span>
            <span className="appearance-none hidden sm:inline text-slate-500">Aligned with REB Struggling Learners Guidelines</span>
          </div>
          <button
            onClick={onClose}
            className="appearance-none px-4 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold transition-all border border-slate-200"
            id="remedial-footer-close-btn"
          >
            {t.closeText}
          </button>
        </div>

      </div>
    </div>
  );
}

export default RemedialLessonPlanModal;
