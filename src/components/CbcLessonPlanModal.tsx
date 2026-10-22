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
  BookOpen,
  Languages,
  RefreshCw,
  CheckCircle,
  Cloud,
  ChevronDown,
  Plus,
  Minus,
  Save,
  QrCode,
  Maximize2,
  Search
} from 'lucide-react';
import { CbcLessonPlanData } from '../types';
import { checkCanCreateLessonPlan, consumeLessonPlan } from '../utils/subscription';
import { saveLessonPlanToFirestore, saveLessonPlanTemplateToFirestore } from '../utils/firebase';
import { exportCbcLessonPlanToPdf } from '../utils/jspdfExporter';
import { RWANDA_EDUCATION_CURRICULUM } from '../data/rwandaCurriculumSubjects';
import { 
  findRebCurriculumUnits, 
  findRebCurriculumBook, 
  searchRebCurriculum,
  RebCurriculumSubjectBook,
  RebCurriculumUnit,
  RebCurriculumLesson
} from '../data/rebCurriculum2026_2027';
import TemplateSelectorModal from './TemplateSelectorModal';
import SaveTemplateModal from './SaveTemplateModal';
import { LessonPlanTemplate } from '../data/lessonPlanTemplates';
import { PrintableLessonPlanQrModal } from './PrintableLessonPlanQrModal';
import { CBC_SHEET_LABELS, CbcLanguage } from '../data/cbcSheetLabels';
import { getAccurateRevisedReference, ensureRevisedReference } from '../utils/curriculumReferences';

export type { CbcLanguage };

export type EducationCategoryId = 'nursery_pre_primary' | 'primary_school' | 'secondary_o_level' | 'secondary_a_level' | 'ttc_colleges' | 'tvet_trades' | string;

export interface CategoryData {
  id: EducationCategoryId;
  title: string;
  titleEn: string;
  titleRw: string;
  titleFr: string;
  titleSw: string;
  badge: string;
  levels: string[];
  subjects: string[];
  subjectsByLang: {
    English: string[];
    Kinyarwanda: string[];
    Français: string[];
    Kiswahili: string[];
  };
}

export const EDUCATION_CATEGORIES: CategoryData[] = RWANDA_EDUCATION_CURRICULUM.map(cat => ({
  id: cat.id as any,
  title: cat.titleEn,
  titleEn: cat.titleEn,
  titleRw: cat.titleRw,
  titleFr: cat.titleFr,
  titleSw: cat.titleSw,
  badge: cat.badge,
  levels: cat.levels,
  subjects: cat.subjects.map(s => s.nameEn),
  subjectsByLang: {
    English: cat.subjects.map(s => s.nameEn),
    Kinyarwanda: cat.subjects.map(s => s.nameRw || s.nameEn),
    Français: cat.subjects.map(s => s.nameFr || s.nameEn),
    Kiswahili: cat.subjects.map(s => s.nameSw || s.nameEn)
  }
}));

export const getCategoryTitle = (cat: CategoryData, lang: CbcLanguage = 'English'): string => {
  if (!cat) return '';
  if (lang === 'Kinyarwanda') return cat.titleRw || cat.titleEn;
  if (lang === 'Français') return cat.titleFr || cat.titleEn;
  if (lang === 'Kiswahili') return cat.titleSw || cat.titleEn;
  return cat.titleEn;
};

export const getCategorySubjects = (cat: CategoryData, lang: CbcLanguage = 'English'): string[] => {
  if (!cat) return [];
  return cat.subjectsByLang?.[lang] || cat.subjects;
};

export const getCategoryFromClass = (cls: string): EducationCategoryId => {
  if (!cls) return 'primary_school';
  const upper = cls.trim().toUpperCase();
  if (upper.includes('NURSERY') || upper.includes('BABY') || upper.includes('MIDDLE') || upper.includes('TOP')) {
    return 'nursery_pre_primary';
  }
  if (upper.startsWith('P1') || upper.startsWith('P2') || upper.startsWith('P3') || upper.startsWith('P4') || upper.startsWith('P5') || upper.startsWith('P6') || upper.startsWith('PRIMARY') || upper.startsWith('P.')) {
    return 'primary_school';
  }
  if (upper.includes('Y1') || upper.includes('Y2') || upper.includes('Y3') || upper.includes('YEAR') || upper.includes('TTC')) {
    return 'ttc_colleges';
  }
  if (upper.includes('L1') || upper.includes('L2') || upper.includes('L3') || upper.includes('L4') || upper.includes('L5') || upper.includes('LEVEL') || upper.includes('TVET')) {
    return 'tvet_trades';
  }
  if (upper.startsWith('S4') || upper.startsWith('S5') || upper.startsWith('S6')) {
    return 'secondary_a_level';
  }
  if (upper.startsWith('S1') || upper.startsWith('S2') || upper.startsWith('S3')) {
    return 'secondary_o_level';
  }
  return 'primary_school';
};

interface CbcLessonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'create' | 'edit';
  onRequireSubscription?: (warningMsg: string) => void;
}

// UI Section & Button Labels for each language
const UI_TEXT: Record<CbcLanguage, {
  langLabel: string;
  sheetTab: string;
  formTab: string;
  aiAutoFill: string;
  generateFullPlan: string;
  editPlan: string;
  finishEditPlan: string;
  generatingFullPlan: string;
  editingNotice: string;
  downloadPdf: string;
  categoryLabel: string;
  categorySubtitle: string;
  customSubjectPrompt: string;
  adminSectionTitle: string;
  unitSectionTitle: string;
  specialSectionTitle: string;
  schoolName: string;
  teacherName: string;
  subject: string;
  classLevel: string;
  term: string;
  date: string;
  duration: string;
  classSize: string;
  unitNumberAndTitle: string;
  lessonNumberAndTitle: string;
  keyUnitCompetence: string;
  instructionalObjective: string;
  learningMaterials: string;
  references: string;
  specialNeeds: string;
  location: string;
  teacherSelfEval: string;
  previewDownload: string;
  sheetSubtitle: string;
  writingAi: string;
  adaptingPlan: string;
}> = {
  Kinyarwanda: {
    langLabel: "Ururimi rw'Isomo:",
    sheetTab: "Ifishi y'Urupapuro 1",
    formTab: "Kuzuza Ifishi (Form Editor)",
    aiAutoFill: "Ubwenge bw'Ubukorano (AI Auto-Fill)",
    generateFullPlan: "Kora Integanyanyigisho Yose (AI)",
    editPlan: "Hindura / Kosora Ifishi",
    finishEditPlan: "Soza no Kubika Ifishi",
    generatingFullPlan: "AI iri gutegura integanyanyigisho yose ihwanye n'amabwiriza ya REB...",
    editingNotice: "✏️ Urimo gukosora integanyanyigisho y'isomo. Nurangiza kanda 'Soza no Kubika Ifishi' kugira ngo ibikwe.",
    downloadPdf: "Kuramo PDF (Urupapuro 1)",
    categoryLabel: "Icyiciro cy'Uburezi n'Amashuri *",
    categorySubtitle: "(I. Inshuke | II. Abanza | III. Icyiciro Rusange | IV. Icyiciro Gisumbuye | V. Nderabarezi | VI. Imyuga)",
    customSubjectPrompt: "✍️ Nyandikira isomo ryanjye ryihariye...",
    adminSectionTitle: "1. Umwirondoro w'Ishuri n'Icyiciro *",
    unitSectionTitle: "2. Umutwe w'Isomo n'Intego y'Uburezi",
    specialSectionTitle: "3. Ubumuga n'Ibibazo Byihariye n'Aho Kwigishiriza",
    schoolName: "1. Izina ry'Ishuri *",
    teacherName: "2. Izina ry'Umwarimu *",
    classLevel: "3. Umwaka w'Amashuri *",
    subject: "4. Isomo *",
    term: "5. Igihembwe *",
    date: "6. Itariki *",
    duration: "7. Igihe (Iminota) *",
    classSize: "8. Umubare w'Abanyeshuri *",
    unitNumberAndTitle: "1. Umutwe N° n'Umutwe w'Icyigwa *",
    lessonNumberAndTitle: "2. Isomo N° n'Umutwe w'Isomo *",
    keyUnitCompetence: "3. Ubumenyi n'Ubushobozi bw'Umutwe *",
    instructionalObjective: "4. Intego y'Isomo",
    learningMaterials: "5. Imfashanyigisho (z'abanyeshuri bose)",
    references: "6. Ibitabo n'Integanyanyigisho (REB)",
    specialNeeds: "1. Ubumuga n'Ibibazo Byihariye *",
    location: "2. Aho Kwigishiriza *",
    teacherSelfEval: "3. Isuzuma ry'Umwarimu",
    previewDownload: "Reba no Gukuramo PDF y'Urupapuro 1 →",
    sheetSubtitle: "Hitamo ururimi cyangwa ukande ku ifishi uyandikemo ako kanya! (* = Ibyangombwa ku mwarimu)",
    writingAi: "AI iri kwandika...",
    adaptingPlan: "AI iri guhindura integanyanyigisho mu Kinyarwanda..."
  },
  English: {
    langLabel: "Lesson Language:",
    sheetTab: "1-Page Sheet",
    formTab: "Form Editor",
    aiAutoFill: "AI Auto-Fill (3 Fields)",
    generateFullPlan: "Generate Lesson Plan (AI)",
    editPlan: "Edit Lesson Plan",
    finishEditPlan: "Finish Edit Lesson Plan",
    generatingFullPlan: "AI is generating full Lesson Plan based on your inputs...",
    editingNotice: "✏️ You are currently editing the Lesson Plan. When finished, click 'Finish Edit Lesson Plan' to save your changes.",
    downloadPdf: "Download 1-Page PDF",
    categoryLabel: "Education Level Category *",
    categorySubtitle: "(I. Pre-Primary | II. Primary | III. O-Level | IV. A-Level | V. TTC | VI. TVET)",
    customSubjectPrompt: "✍️ Custom subject / Type your own...",
    adminSectionTitle: "1. Administrative & Class Details *",
    unitSectionTitle: "2. Unit, Lesson & AI Generated Core Fields",
    specialSectionTitle: "3. Special Educational Needs & Location",
    schoolName: "1. School Name *",
    teacherName: "2. Teacher's Name *",
    classLevel: "3. Class Level *",
    subject: "4. Subject *",
    term: "5. Term *",
    date: "6. Date *",
    duration: "7. Duration *",
    classSize: "8. Class Size *",
    unitNumberAndTitle: "1. Unit Number & Title *",
    lessonNumberAndTitle: "2. Lesson Number & Title *",
    keyUnitCompetence: "3. Key Unit Competence *",
    instructionalObjective: "4. Instructional Objective",
    learningMaterials: "5. Learning Materials (for all learners)",
    references: "6. References (REB Syllabus & Textbooks)",
    specialNeeds: "1. Special Educational Needs *",
    location: "2. Location for this class *",
    teacherSelfEval: "3. Teacher Self-Evaluation",
    previewDownload: "Preview & Download 1-Page PDF →",
    sheetSubtitle: "Select a language or click anywhere on the sheet to edit directly! (* = Teacher Mandatory Fill)",
    writingAi: "Writing...",
    adaptingPlan: "AI is adapting Lesson Plan to English..."
  },
  Français: {
    langLabel: "Langue de la leçon:",
    sheetTab: "Fiche 1-Page",
    formTab: "Éditeur de Formulaire",
    aiAutoFill: "Auto-Remplissage AI (3 Champs)",
    generateFullPlan: "Générer la Fiche (IA)",
    editPlan: "Modifier la Fiche",
    finishEditPlan: "Terminer la Modification",
    generatingFullPlan: "IA génère la fiche de leçon selon vos informations...",
    editingNotice: "✏️ Vous modifiez actuellement la fiche. Une fois terminé, cliquez sur 'Terminer la Modification' pour enregistrer.",
    downloadPdf: "Télécharger PDF (1-Page)",
    categoryLabel: "Catégorie du Niveau d'Études *",
    categorySubtitle: "(I. Maternelle | II. Primaire | III. Tronçon Commun | IV. Secondaire Supérieur | V. TTC | VI. TVET)",
    customSubjectPrompt: "✍️ Matière personnalisée...",
    adminSectionTitle: "1. Informations Administratives et de la Classe *",
    unitSectionTitle: "2. Unité, Leçon et Champs Générés par IA",
    specialSectionTitle: "3. Besoins Particuliers et Emplacement",
    schoolName: "1. Nom de l'École *",
    teacherName: "2. Nom de l'Enseignant *",
    classLevel: "3. Niveau de Classe *",
    subject: "4. Matière *",
    term: "5. Trimestre *",
    date: "6. Date *",
    duration: "7. Durée *",
    classSize: "8. Effectif de la Classe *",
    unitNumberAndTitle: "1. Unité N° & Titre *",
    lessonNumberAndTitle: "2. Leçon N° & Titre *",
    keyUnitCompetence: "3. Compétence Clé de l'Unité *",
    instructionalObjective: "4. Objectif Pédagogique (Instructional Objective)",
    learningMaterials: "5. Matériels Didactiques (pour tous les élèves)",
    references: "6. Références Bibliographiques",
    specialNeeds: "1. Besoins Éducatifs Particuliers *",
    location: "2. Lieu du Cours *",
    teacherSelfEval: "3. Auto-Évaluation de l'Enseignant",
    previewDownload: "Aperçu et Téléchargement PDF →",
    sheetSubtitle: "Choisissez une langue ou modifiez directement sur la fiche! (* = Remplissage obligatoire par l'enseignant)",
    writingAi: "Rédaction en cours...",
    adaptingPlan: "IA adapte la fiche de leçon en Français..."
  },
  Kiswahili: {
    langLabel: "Lugha ya Somo:",
    sheetTab: "Karatasi ya Ukurasa 1",
    formTab: "Mhariri wa Fomu",
    aiAutoFill: "Kujaza na AI (Vipengele 3)",
    generateFullPlan: "Tengeneza Mpango (AI)",
    editPlan: "Hariri Mpango",
    finishEditPlan: "Maliza Kuhariri Mpango",
    generatingFullPlan: "AI inatengeneza mpango wa somo kulingana na maelezo yako...",
    editingNotice: "✏️ Unahariri mpango wa somo. Ukimaliza, bofya 'Maliza Kuhariri Mpango' kuhifadhi mabadiliko.",
    downloadPdf: "Pakua PDF (Ukurasa 1)",
    categoryLabel: "Ngazi ya Elimu na Madarasa *",
    categorySubtitle: "(I. Chekechea | II. Msingi | III. Sekondari ya Chini | IV. Sekondari ya Juu | V. TTC | VI. TVET)",
    customSubjectPrompt: "✍️ Somo maalum / Andika lako...",
    adminSectionTitle: "1. Taarifa za Utawala na Darasa *",
    unitSectionTitle: "2. Sura, Somo na Sehemu za AI",
    specialSectionTitle: "3. Mahitaji Maalumu na Eneo la Somo",
    schoolName: "1. Jina la Shule *",
    teacherName: "2. Jina la Mwalimu *",
    classLevel: "3. Ngazi ya Darasa *",
    subject: "4. Somo *",
    term: "5. Muhula *",
    date: "6. Tarehe *",
    duration: "7. Muda *",
    classSize: "8. Idadi ya Wanafunzi *",
    unitNumberAndTitle: "1. Sura N° & Kichwa cha Sura *",
    lessonNumberAndTitle: "2. Somo N° & Kichwa cha Somo *",
    keyUnitCompetence: "3. Umahiri Mkuu wa Sura *",
    instructionalObjective: "4. Lengo la Somo (Instructional Objective)",
    learningMaterials: "5. Vifaa vya Kufundishia",
    references: "6. Marejeleo ya Vitabu na Mtaala",
    specialNeeds: "1. Mahitaji Maalumu ya Kujifunzia *",
    location: "2. Mahali pa Somo *",
    teacherSelfEval: "3. Tathmini ya Mwalimu",
    previewDownload: "Hakiki na Pakua PDF →",
    sheetSubtitle: "Chagua lugha au hariri moja kwa moja kwenye karatasi! (* = Kujaza kwa Lazima na Mwalimu)",
    writingAi: "Inaandika...",
    adaptingPlan: "AI inabadilisha Mpango wa Somo kwa Kiswahili..."
  }
};

// Table labels rendered on the 1-Page Printable Sheet (Bilingual REB standard)
const SHEET_LABELS = CBC_SHEET_LABELS;

const CBC_SAMPLES: Record<CbcLanguage, CbcLessonPlanData> = {
  English: {
    id: 'cbc_lp_sample_en',
    schoolName: 'G.S MAYANGE B',
    teacherName: 'NKUNDIMANA Theogene',
    term: 'I',
    date: new Date().toISOString().split('T')[0],
    subject: 'Mathematics',
    className: 'P5',
    unitNumber: 'Unit 2',
    lessonNumber: '1 of 6',
    duration: '40 min',
    classSize: '45',
    specialNeeds: '2 learners with low vision (seated in front row), 1 learner with mild hearing impairment.',
    unitTitle: 'Operations on Whole Numbers',
    keyUnitCompetence: 'Perform addition, subtraction, multiplication, and division of whole numbers up to 100,000 in real-life contexts.',
    lessonTitle: 'Multiplication of whole numbers by fractions',
    instructionalObjective: 'By using fraction cards and chalkboard examples, Primary 6 (P6) learners will be able to multiply a whole number by a fraction correctly within 40 minutes.',
    classLocation: 'Inside the classroom',
    learningMaterials: "REB Approved Mathematics Pupil's Book P5, Teacher's Guide, place value charts, abacus, flashcards, concrete counters, and chalkboard illustrations.",
    references: "Rwanda Basic Education Board (REB/NESA) Revised CBC Syllabus (Updated 2024-2026) for P5 Mathematics; REB Approved Pupil's Book (Revised Edition), Unit 2: Operations on Whole Numbers, Pages 28–34; Teacher's Guide (Revised Edition) Unit 2, Pages 42–48.",
    
    timingIntro: '10 min',
    teacherActivityIntro: '• To present an engaging mental math game on adding tens and hundreds.\n• To guide learners to recall place value rules using place value flashcards.\n• To introduce the SMART instructional objective clearly on the board.',
    learnerActivityIntro: '• To engage actively in the mental math game in pairs.\n• To observe flashcards and compute place values on slates.\n• To record the lesson title and objective in notebooks.',
    genericCompetencesIntro: '• Critical Thinking: Fast mental calculation, number pattern analysis, and logical deduction.\n\n• Gender Equality: Equal opportunity for both boys and girls to actively respond to starter questions on slates.\n\n• Communication Skills: Expressing mathematical reasoning clearly in pair discussions.',

    timingDev: '20 min',
    teacherActivityDev: '• To demonstrate vertical column addition step-by-step on chalkboard.\n• To facilitate collaborative group work with concrete counters and slates.\n• To scaffold learning for special needs pupils with front-row assistance.',
    learnerActivityDev: '• To work in small groups to arrange numbers in place value columns.\n• To perform step-by-step column addition on slates.\n• To present group solutions on chalkboard and conduct peer review.',
    genericCompetencesDev: '• Cooperation & Teamwork: Sharing manipulatives and explaining calculation steps to peers.\n\n• Problem Solving: Systematically organizing whole numbers into place value columns.\n\n• Inclusive Education: Actively supporting learners with special educational needs in group roles.\n\n• Gender Balance: Shared leadership roles between male and female group reporters.',

    timingConcl: '10 min',
    teacherActivityConcl: '• To administer a 2-question diagnostic slate exit ticket.\n• To synthesize key takeaways and clarify common misconceptions.\n• To assign homework exercises from Pupil\'s Book Page 44.',
    learnerActivityConcl: '• To solve the exit ticket diagnostic questions individually on slates.\n• To summarize key learning points with peers.\n• To write down homework exercises accurately in notebooks.',
    genericCompetencesConcl: '• Lifelong Learning: Applying addition accuracy to personal allowance and daily budgeting.\n\n• Peace & Values: Respecting peers\' contributions during final reflection and exit checks.',
    teacherSelfEvaluation: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  Kinyarwanda: {
    id: 'cbc_lp_sample_rw',
    schoolName: 'G.S MAYANGE B',
    teacherName: 'NKUNDIMANA Theogene',
    term: 'I',
    date: new Date().toISOString().split('T')[0],
    subject: 'Ikinyarwanda',
    className: 'P5',
    unitNumber: 'Umutwe wa 2',
    lessonNumber: 'Isomo rya 1 kuri 6',
    duration: 'Iminota 40',
    classSize: '45',
    specialNeeds: 'Abanyeshuri 2 bafite ubumuga bw\'uburyo babona (bicaye ku ntebe z\'imbere), umunyeshuri 1 ufite ikibazo cyo kutumva neza.',
    unitTitle: 'Kubungabunga ibidukikije no kwirinda isuri',
    keyUnitCompetence: 'Gusoma, gusesengura no kwandika imyandiko ivuga ku kubungabunga ibidukikije no kwirinda isuri hifashishijwe ingero zifatika.',
    lessonTitle: 'Gusoma no kumva umwandiko: Kubungabunga amashyamba n\'ubutaka',
    instructionalObjective: 'Hifashishijwe amakarita y\'amagambo mashya n\'ingero ziri ku kibaho, abanyeshuri bo mu mwaka wa P5 bazaba bashobora gusoma no gusubiza ibibazo byo kumva umwandiko mu buryo bw\'ukuri mu gihe cy\'iminota 40.',
    classLocation: "Mu cyumba cy'ishuri",
    learningMaterials: "Igitabo cy'Umunyeshuri cy'Ikinyarwanda P5 cyemewe na REB, Umuyoboro w'Umwarimu, amakarita y'amagambo mashya, ifoto igaragaza gutera ibiti no kurwanya isuri, n'amakaye y'abanyeshuri.",
    references: "Integanyanyigisho ya REB yavuguruwe muri Ikinyarwanda P5; Igitabo cy'Umunyeshuri cyavuguruwe cya REB, Umutwe wa 2: Kubungabunga ibidukikije no kwirinda isuri, Impapuro 28–34; Umuyoboro w'Umwarimu wavuguruwe, Impapuro 42–48.",
    
    timingIntro: 'Iminota 10',
    teacherActivityIntro: '• Gukoresha umukino wo kwibuka amagambo mashya yerekeye ibidukikije.\n• Kubaza ibibazo bikangura ubwenge ku kamaro k\'ibiti mu gace batuyemo.\n• Kumenyesha abanyeshuri intego y\'isomo n\'ingingo z\'ingenzi zizigwa.',
    learnerActivityIntro: '• Gukora mu matsinda basubiza ibibazo ku kubungabunga ibidukikije.\n• Wandika amagambo y\'ingenzi kuri parutagazo/mu makaye yabo.\n• Gukurikira n\'amatsiko no kumenya intego y\'isomo rya noherezo.',
    genericCompetencesIntro: '• Gushungura n\'ubushishozi: Kwibuka no gusesengura amagambo n\'ibitekerezo mu magambo yabo bwite.\n\n• Uburinganire: Abahungu n\'abakobwa bafatanya mu matsinda ku rugero rungana kandi bafatanya kuyobora.\n\n• Itumanaho: Gusobanura neza ibyo bumvise ku myandiko y\'ibidukikije.',

    timingDev: 'Iminota 20',
    teacherActivityDev: '• Gusomera abanyeshuri umwandiko mu ijwi riranguruye yubahiriza utumenyetso.\n• Guyobora abanyeshuri mu matsinda yo gusoma no gusobanura amagambo mashya.\n• Gufasha no kuzamura abanyeshuri bafite ibibazo by\'ubumuga mu matsinda.\n• Gusesengura ubutumwa buri mu mwandiko n\'ingero zifatika z\'ibidukikije.',
    learnerActivityDev: '• Gusomera mu matsinda mu ijwi rito no mu ijwi riranguruye.\n• Gusobanura amagambo mashya hifashishijwe inyizamvugo.\n• Gusubiza ibibazo byo kumva umwandiko ku mbaho zabo/mu makaye.\n• Kumvikanisha no kwerekana imyanzuro y\'amatsinda imbere y\'abandi.',
    genericCompetencesDev: '• Gufatanya n\'itumanaho: Kungurana ibitekerezo mu matsinda no kumvikana ku bisubizo.\n\n• Gukemura ibibazo: Gusesengura imyitozo no gushaka uburyo bunoze bwo kuyikemura.\n\n• Uburezi budakumira: Gufasha abanyeshuri bafite intege nke mu matsinda.\n\n• Kubungabunga ibidukikije: Gusobanukirwa n\'akamaro ko gutera ibiti no kurwanya isuri.',

    timingConcl: 'Iminota 10',
    teacherActivityConcl: '• Gutanga ibibazo 2 byo gusuzuma ibyigishijwe kuri parutagazo (Exit ticket).\n• Gusubiramo muri make ingingo z\'ingenzi z\'isomo no gukosora amakosa.\n• Gutanga umukoro wo mu rugo ugaragara mu gitabo cy\'umunyeshuri ku mpapuro 31.',
    learnerActivityConcl: '• Gusubiza ibibazo by\'isuzuma ku giti cyabo kuri parutagazo.\n• Gukosorana n\'abandi no gukora umwanzuro w\'isomo.\n• Kwandika umukoro wo mu rugo neza mu makaye yabo.',
    genericCompetencesConcl: '• Kwiga ubuzima bwose: Gukoresha ubumenyi bahawe mu kubungabunga ibidukikije mu ngo zabo.\n\n• Umuco w\'amahoro: Kwakira no kubaha ibitekerezo bya bagenzi babo mu kubaza no gukosorana.',

    teacherSelfEvaluation: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  Français: {
    id: 'cbc_lp_sample_fr',
    schoolName: 'G.S MAYANGE B',
    teacherName: 'NKUNDIMANA Theogene',
    term: 'I',
    date: new Date().toISOString().split('T')[0],
    subject: 'Français',
    className: 'P5',
    unitNumber: 'Unité 2',
    lessonNumber: '1 sur 6',
    duration: '40 min',
    classSize: '45',
    specialNeeds: '2 apprenants avec basse vision (au premier rang), 1 apprenant avec déficit auditif léger.',
    unitTitle: 'L\'environnement et la protection de la nature',
    keyUnitCompetence: 'Lire, comprendre et produire des textes variés décrivant l\'environnement et les gestes écoresponsables.',
    lessonTitle: 'Compréhension du texte: La protection des forêts et du sol',
    instructionalObjective: 'En utilisant des cartes de vocabulaire et des exemples au tableau, les apprenants de P5 seront capables de lire et de répondre aux questions de compréhension correctement en 40 minutes.',
    classLocation: 'En classe',
    learningMaterials: "Livre de l'élève Français P5 agréé par REB, Guide de l'enseignant, cartes de vocabulaire, affiches illustrées sur l'écologie, cahiers d'élèves.",
    references: "Programme révisé REB CBC (Édition révisée 2024-2026) pour Français P5; Manuel de l'élève agréé par REB (Édition révisée), Unité 2: L'environnement et la protection de la nature, Pages 28–34; Guide de l'enseignant (Édition révisée), Pages 42–48.",
    
    timingIntro: '10 min',
    teacherActivityIntro: '• Animer une activité d\'échauffement sur le vocabulaire de la nature.\n• Poser des questions déclencheuses pour stimuler la réflexion préalable.\n• Présenter l\'objectif d\'apprentissage SMART clairement au tableau.',
    learnerActivityIntro: '• Participer activement au jeu de vocabulaire en binômes.\n• Répondre aux questions déclencheuses sur leurs ardoises.\n• Noter le titre de la leçon et l\'objectif dans leurs cahiers.',
    genericCompetencesIntro: 'Pensée critique: Analyse rapide et association de termes écologiques.',

    timingDev: '20 min',
    teacherActivityDev: '• Effectuer une lecture magistrale expressive du texte au tableau.\n• Organiser les apprenants en petits groupes de lecture guidée.\n• Guider l\'explication des mots-clés et accompagner les élèves à besoins spécifiques.\n• Modéliser les réponses structurées aux questions de compréhension.',
    learnerActivityDev: '• Lire à haute voix et à voix basse au sein des petits groupes.\n• Dégager les idées principales du texte et expliquer les mots nouveaux.\n• Rédiger les réponses aux questions de compréhension sur leurs ardoises.\n• Présenter la synthèse du groupe devant la classe pour révision par les pairs.',
    genericCompetencesDev: 'Coopération et communication: Échange d\'idées en groupe et respect de l\'équité des genres.',

    timingConcl: '10 min',
    teacherActivityConcl: '• Administrer un billet de sortie de 2 questions de synthèse.\n• Synthétiser les points clés de la leçon et corriger les idées reçues.\n• Assigner le travail à domicile basé sur la page 33 du manuel.',
    learnerActivityConcl: '• Répondre individuellement aux questions de synthèse sur ardoise.\n• Résumer les apprentissages essentiels avec leurs pairs.\n• Noter soigneusement le devoir à domicile dans leurs cahiers.',
    genericCompetencesConcl: 'Apprentissage tout au long de la vie et citoyenneté environnementale.',

    teacherSelfEvaluation: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  Kiswahili: {
    id: 'cbc_lp_sample_sw',
    schoolName: 'G.S MAYANGE B',
    teacherName: 'NKUNDIMANA Theogene',
    term: 'I',
    date: new Date().toISOString().split('T')[0],
    subject: 'Kiswahili',
    className: 'P5',
    unitNumber: 'Sura ya 2',
    lessonNumber: '1 ya 6',
    duration: 'Dakika 40',
    classSize: '45',
    specialNeeds: 'Wanafunzi 2 wenye uoni hafifu (mbele), mwanafunzi 1 mwenye tatizo dogo la usikivu.',
    unitTitle: 'Mazingira na Uhifadhi wa Misitu',
    keyUnitCompetence: 'Kusoma, kuelewa na kueleza umuhimu wa kuhifadhi mazingira na kuzuia mmomonyoko wa udongo.',
    lessonTitle: 'Kusoma na Kuelewa: Umuhimu wa Miti na Utunzaji wa Mazingira',
    instructionalObjective: 'Kwa kutumia kadi za msamiati na mifano ubaoni, wanafunzi wa P5 wataweza kusoma na kujibu maswali ya ufahamu kwa usahihi ndani ya dakika 40.',
    classLocation: 'Ndani ya darasa',
    learningMaterials: "Kitabu cha Mwanafunzi cha Kiswahili P5 kilichoidhinishwa na REB, Mwongozo wa Mwalimu, kadi za msamiati, mabango ya mazingira na madaftari.",
    references: "Mtaala wa REB Ulioboreshwa (Toleo Lililorekebishwa 2024-2026) la Kiswahili P5; Kitabu cha Mwanafunzi cha REB Toleo Lililorekebishwa, Sura ya 2: Mazingira na Uhifadhi wa Misitu, Kurasa 28–34; Mwongozo wa Mwalimu Toleo Lililorekebishwa, Kurasa 42–48.",
    
    timingIntro: 'Dakika 10',
    teacherActivityIntro: '• Kuongoza mchezo wa maneno ya mazingira na msamiati mpya.\n• Kuuliza maswali ya uchochezi kuhusu umuhimu wa miti katika jamii.\n• Kueleza lengo kuu la somo na kuliandika ubaoni.',
    learnerActivityIntro: '• Kushiriki kikamilifu katika mchezo wa msamiati kwa jozi.\n• Kujibu maswali ya mwalimu kwenye vibao vyao.\n• Kuandika anwani ya somo na lengo kwenye madaftari yao.',
    genericCompetencesIntro: 'Fikra Tunduizi: Uchanganuzi wa haraka wa maneno na maana zake.',

    timingDev: 'Dakika 20',
    teacherActivityDev: '• Kusoma kifungu kwa sauti na ufasaha huku wanafunzi wakifuatilia.\n• Kugawanya wanafunzi katika vikundi vya kusoma na kujadili msamiati.\n• Kusaidia wanafunzi wenye mahitaji maalumu wakati wa kazi za vikundi.\n• Kuongoza uchanganuzi wa maswali ya ufahamu ubaoni.',
    learnerActivityDev: '• Kusoma kwa sauti na kwa kimya katika vikundi vidogo.\n• Kuelezana maana ya maneno magumu kwa kutumia kamusi.\n• Kuandika majibu ya maswali kwenye vibao/madaftari yao.\n• Kuwasilisha matokeo ya kikundi darasani na kupokea maoni.',
    genericCompetencesDev: 'Ushirikiano na Mawasiliano: Kazi za pamoja na usawa wa kijinsia katika kuwasilisha matokeo.',

    timingConcl: 'Dakika 10',
    teacherActivityConcl: '• Kutoa maswali mafupi 2 ya tathmini ya mwisho ubaoni.\n• Kutoa muhtasari wa somo na kusahihisha makosa ya kawaida.\n• Kutoa kazi ya nyumbani kutoka ukurasa wa 28 wa kitabu.',
    learnerActivityConcl: '• Kujibu maswali ya tathmini binafsi kwenye vibao vyao.\n• Kufanya muhtasari wa mambo makuu waliyojifunza na wenzao.\n• Kuandika kazi ya nyumbani kwa usahihi kwenye madaftari.',
    genericCompetencesConcl: 'Kujifunza Maishani: Kutumia ujuzi wa uhifadhi wa mazingira nyumbani na shuleni.',
    teacherSelfEvaluation: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

const LOCAL_STORAGE_KEY = 'nkorera_cbc_active_lesson_plan_v3';
const LOCAL_LANG_KEY = 'nkorera_cbc_active_language_v3';

const renderRedStarLabel = (label: string) => {
  if (!label) return null;
  const clean = label.replace(/⭐/g, '').replace(/\*/g, '').trim();
  return <span>{clean}</span>;
};

const formatBulletSpacing = (text: string) => {
  if (!text) return '';
  let str = text.trim();
  str = str.replace(/([^\n\r])\s*([•●*]|\b\d+\.)\s*/g, '$1\n\n• ');
  str = str.replace(/\r?\n\s*([•●*]|-)\s*/g, '\n\n• ');
  str = str.replace(/\r?\n\s*(\d+\.)\s*/g, '\n\n$1 ');
  str = str.replace(/;\s*([A-Z][a-zA-Za-z\s]+:)/g, '\n\n• $1');
  str = str.replace(/\n{3,}/g, '\n\n');
  if (!str.startsWith('•') && !/^\d+\./.test(str)) {
    str = `• ${str}`;
  }
  return str.trim();
};

const formatGenericCompetenceSpacing = (text: string) => {
  if (!text) return '';
  let str = text.trim();
  str = str.replace(/([^\n\r])\s*([•●*]|\b\d+\.)\s*/g, '$1\n\n\n\n• ');
  str = str.replace(/\r?\n\s*([•●*]|-)\s*/g, '\n\n\n\n• ');
  str = str.replace(/\r?\n\s*(\d+\.)\s*/g, '\n\n\n\n$1 ');
  str = str.replace(/;\s*([A-Z][a-zA-Za-z\s]+:)/g, '\n\n\n\n• $1');
  str = str.replace(/\n{5,}/g, '\n\n\n\n');
  if (!str.startsWith('•') && !/^\d+\./.test(str)) {
    str = `• ${str}`;
  }
  return str.trim();
};

const formatLocationForDisplay = (loc: string | undefined, lang: CbcLanguage): string => {
  if (!loc) return '';
  const clean = loc.replace(/\s*\([^)]*\)/g, '').trim();
  if (lang === 'Kinyarwanda') {
    if (clean.includes('Inside the classroom') || clean.includes('Mu cyumba') || clean.includes('In classroom')) return "Mu cyumba cy'ishuri";
    if (clean.includes('Library') || clean.includes('isomero')) return "Mu isomero";
    if (clean.includes('ICT') || clean.includes('mudasobwa')) return "Muri salle ya mudasobwa";
    if (clean.includes('Laborat')) return "Muri Laboratwari";
    if (clean.includes('Outside') || clean.includes('Hanze')) return "Hanze y'icyumba cy'ishuri";
  } else if (lang === 'Français') {
    if (clean.includes('Inside the classroom') || clean.includes('En classe') || clean.includes('Mu cyumba')) return "En classe";
    if (clean.includes('Library') || clean.includes('bibliothèque') || clean.includes('isomero')) return "Dans la bibliothèque";
    if (clean.includes('ICT') || clean.includes('informatique')) return "En salle informatique";
    if (clean.includes('Laborat')) return "En laboratoire";
    if (clean.includes('Outside') || clean.includes('Hors')) return "Hors de la classe";
  } else if (lang === 'Kiswahili') {
    if (clean.includes('Inside the classroom') || clean.includes('Ndani ya darasa') || clean.includes('Mu cyumba')) return "Ndani ya darasa";
    if (clean.includes('Library') || clean.includes('Maktabani') || clean.includes('isomero')) return "Maktabani";
    if (clean.includes('ICT') || clean.includes('TEHAMA')) return "Chumba cha TEHAMA";
    if (clean.includes('Laborat') || clean.includes('Maabara')) return "Maabara";
    if (clean.includes('Outside') || clean.includes('Nje')) return "Nje ya darasa";
  }
  return clean;
};

const sanitizePlanForLanguage = (p: CbcLessonPlanData, lang: CbcLanguage): CbcLessonPlanData => {
  const isRw = lang === 'Kinyarwanda';
  const isFr = lang === 'Français';
  const isSw = lang === 'Kiswahili';

  const cleanText = (str: string | undefined): string => {
    if (!str) return '';
    let s = str;
    if (isRw) {
      s = s.replace(/\s*\((Generic\s*competence|Cross-cutting|Inclusive\s*Education|Gender\s*Education|Peace\s*and\s*Values|Financial\s*Education|Critical\s*Thinking|Problem\s*Solving|Cooperation|Communication|Lifelong\s*Learning|Self-Management|Inside\s*the\s*classroom|Outside\s*classroom|Revised\s*Edition|Teacher's\s*Guide|Pupil's\s*Book|Updated\s*2024-2026|Condition|Who|Action|Content|Criterion|Standards?)[^)]*\)/gi, '');
      s = s.replace(/\s*\([A-Za-z\s&',/-]{3,}\)/g, (match) => {
        const inner = match.replace(/[()]/g, '').trim().toLowerCase();
        if (inner.includes('mu cyumba') || inner.includes('hanze') || inner.includes('inyuguti') || inner.includes('ikinyarwanda')) return match;
        if (/^(unit|lesson|teacher|learner|introduction|development|conclusion|step|page|term|revised|pupil|inclusive|gender|critical|problem|peace|financial|lifelong|cooperation|communication)/i.test(inner)) return '';
        return match;
      });
    } else if (isFr || isSw) {
      s = s.replace(/\s*\((Generic\s*competence|Cross-cutting|Inclusive\s*Education|Gender\s*Education|Peace\s*and\s*Values|Financial\s*Education|Critical\s*Thinking|Problem\s*Solving|Cooperation|Communication|Lifelong\s*Learning|Self-Management|Inside\s*the\s*classroom|Outside\s*classroom|Revised\s*Edition|Teacher's\s*Guide|Pupil's\s*Book)[^)]*\)/gi, '');
    }
    return s.trim();
  };

  const cleanObjective = (str: string | undefined): string => {
    if (!str) return '';
    let s = cleanText(str);
    s = s.replace(/\b(By\s+the\s+end\s+of\s+(this|the)\s+lesson|At\s+the\s+end\s+of\s+(this|the)\s+lesson)\b,?\s*/gi, '');
    s = s.replace(/\b(Mu\s+mpera\s+z'(iri\s+somo|isomo)|Isomo\s+rirangiye|Mu\s+gihe\s+isomo\s+rirangiye)\b,?\s*/gi, '');
    s = s.replace(/\b(À\s+la\s+fin\s+de\s+(cette|la)\s+leçon)\b,?\s*/gi, '');
    s = s.replace(/\b(Kufikia\s+mwisho\s+wa\s+(somo\s+hili|somo))\b,?\s*/gi, '');
    s = s.replace(/^[\s,;:-]+/, '').trim();
    if (s.length > 0) {
      s = s.charAt(0).toUpperCase() + s.slice(1);
    }
    return s;
  };

  return {
    ...p,
    classLocation: formatLocationForDisplay(p.classLocation, lang),
    genericCompetences: cleanText(p.genericCompetences),
    crossCuttingIssues: cleanText(p.crossCuttingIssues),
    genericCompetencesIntro: cleanText(p.genericCompetencesIntro),
    genericCompetencesDev: cleanText(p.genericCompetencesDev),
    genericCompetencesConcl: cleanText(p.genericCompetencesConcl),
    instructionalObjective: cleanObjective(p.instructionalObjective),
    references: cleanText(p.references)
  };
};

export const CbcLessonPlanModal: React.FC<CbcLessonPlanModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'create',
  onRequireSubscription
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<CbcLanguage>(() => {
    try {
      const savedLang = localStorage.getItem(LOCAL_LANG_KEY) as CbcLanguage;
      if (savedLang && CBC_SAMPLES[savedLang]) {
        return savedLang;
      }
    } catch {
      // fallback
    }
    return 'English';
  });

  const [plan, setPlan] = useState<CbcLessonPlanData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.teacherSelfEvaluation && (
          parsed.teacherSelfEvaluation.includes('41') ||
          parsed.teacherSelfEvaluation.includes('remedial') ||
          parsed.teacherSelfEvaluation.includes('Isomo ryagenze neza')
        )) {
          parsed.teacherSelfEvaluation = '';
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          } catch {}
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return CBC_SAMPLES.English;
  });

  // Strict purge of unwanted canned evaluation phrases if present
  useEffect(() => {
    if (plan.teacherSelfEvaluation && (
      plan.teacherSelfEvaluation.includes('41') ||
      plan.teacherSelfEvaluation.includes('remedial') ||
      plan.teacherSelfEvaluation.includes('Isomo ryagenze neza')
    )) {
      setPlan(prev => ({ ...prev, teacherSelfEvaluation: '' }));
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.teacherSelfEvaluation = '';
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch {}
    }
  }, [plan.teacherSelfEvaluation]);

  const [activeTab, setActiveTab] = useState<'sheet' | 'form'>('sheet');
  const [pageOrientation] = useState<'landscape' | 'portrait'>('portrait');
  const [isEditing, setIsEditing] = useState<boolean>(initialMode === 'edit');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isTranslatingPlan, setIsTranslatingPlan] = useState<boolean>(false);
  const [isExpandingActivities, setIsExpandingActivities] = useState<boolean>(false);
  const [isExplainingCompetences, setIsExplainingCompetences] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState<boolean>(false);

  const handleSelectTemplate = (tpl: LessonPlanTemplate) => {
    setPlan(prev => ({
      ...tpl.data,
      teacherSelfEvaluation: '',
      id: prev.id || `plan_tpl_${Date.now()}`,
      schoolName: prev.schoolName || tpl.data.schoolName,
      teacherName: prev.teacherName || tpl.data.teacherName,
      createdAt: prev.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // Automatically detect and update education category based on class level
    const detectedCat = getCategoryFromClass(tpl.data.className);
    setSelectedCategory(detectedCat);
    
    setAiSuccessMessage(`🎉 Template "${tpl.title}" loaded successfully! All REB standard fields populated.`);
    setTimeout(() => setAiSuccessMessage(null), 5000);
  };

  const handleSaveCustomTemplate = async (template: LessonPlanTemplate) => {
    try {
      await saveLessonPlanTemplateToFirestore(template);
      setAiSuccessMessage(`🎉 Template "${template.title}" yabitswe neza mu bubiko bwawe!`);
      setTimeout(() => setAiSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to save custom template:", err);
    }
  };

  // Auto-Save 5-Second Interval State & References
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const planRef = useRef<CbcLessonPlanData>(plan);
  const languageRef = useRef<CbcLanguage>(selectedLanguage);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    languageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Periodic Auto-Save every 5 seconds to localStorage to protect long typing sessions
  useEffect(() => {
    if (!isOpen) return;

    const autoSaveToLocalStorage = () => {
      try {
        setIsAutoSaving(true);
        const currentPlan = planRef.current;
        const currentLang = languageRef.current;

        // Persist active plan and draft metadata
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentPlan));
        localStorage.setItem(LOCAL_LANG_KEY, currentLang);
        localStorage.setItem('nkorera_cbc_draft_autosave', JSON.stringify({
          plan: currentPlan,
          language: currentLang,
          timestamp: new Date().toISOString()
        }));

        const now = new Date();
        const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastAutoSavedTime(formatted);

        // Flash visual indicator for feedback
        setTimeout(() => {
          setIsAutoSaving(false);
        }, 500);
      } catch (err) {
        console.warn("Auto-save to localStorage failed:", err);
        setIsAutoSaving(false);
      }
    };

    // Run every 5000ms (5 seconds)
    const intervalId = setInterval(autoSaveToLocalStorage, 5000);

    // Also register beforeunload to save immediately when window or tab closes
    const handleBeforeUnload = () => {
      autoSaveToLocalStorage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Run final flush on unmount
      autoSaveToLocalStorage();
    };
  }, [isOpen]);

  const handleSaveToCloud = async () => {
    setIsSavingCloud(true);
    setAiSuccessMessage(null);
    try {
      await saveLessonPlanToFirestore(plan);
      const msg = '☁️ Lesson Plan successfully backed up to your secure Cloud!';
      setAiSuccessMessage(msg);
      setTimeout(() => setAiSuccessMessage(null), 4500);
    } catch (err: any) {
      console.error(err);
      alert("Cloud saving failed. Please check your internet connection and verify that you are logged in.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<EducationCategoryId>(() => {
    return getCategoryFromClass(plan.className);
  });

  // Keep category in sync with plan.className
  useEffect(() => {
    const cat = getCategoryFromClass(plan.className);
    setSelectedCategory(cat);
  }, [plan.className]);

  const handleSelectCategory = (catId: EducationCategoryId) => {
    setSelectedCategory(catId);
    const catObj = EDUCATION_CATEGORIES.find(c => c.id === catId);
    if (!catObj) return;

    const isClassInCat = catObj.levels.includes(plan.className);
    const newClass = isClassInCat ? plan.className : (catObj.levels[3] || catObj.levels[0]);

    const isSubjectInCat = catObj.subjects.includes(plan.subject);
    const newSubject = isSubjectInCat ? plan.subject : catObj.subjects[0];

    setPlan(prev => ({
      ...prev,
      className: newClass,
      subject: newSubject,
      updatedAt: new Date().toISOString()
    }));
  };

  // REB Curriculum 2026-2027 Dynamic Unit & Lesson States
  const [selectedCurriculumUnitIndex, setSelectedCurriculumUnitIndex] = useState<number>(-1);
  const [selectedCurriculumLessonIndex, setSelectedCurriculumLessonIndex] = useState<number>(-1);
  const [curriculumSearchQuery, setCurriculumSearchQuery] = useState<string>('');
  const [isCurriculumSearchOpen, setIsCurriculumSearchOpen] = useState<boolean>(false);

  // Compute matched curriculum units for active Category, Class, and Subject
  const currentCurriculumUnits = React.useMemo(() => {
    return findRebCurriculumUnits(selectedCategory, plan.className, plan.subject);
  }, [selectedCategory, plan.className, plan.subject]);

  const currentCurriculumBook = React.useMemo(() => {
    return findRebCurriculumBook(selectedCategory, plan.subject);
  }, [selectedCategory, plan.subject]);

  const curriculumSearchResults = React.useMemo(() => {
    if (!curriculumSearchQuery.trim()) return [];
    return searchRebCurriculum(curriculumSearchQuery);
  }, [curriculumSearchQuery]);

  // Reset curriculum selections when category or subject changes
  useEffect(() => {
    setSelectedCurriculumUnitIndex(-1);
    setSelectedCurriculumLessonIndex(-1);
  }, [selectedCategory, plan.subject, plan.className]);

  const handleApplyCurriculumUnit = (unitIdx: number) => {
    if (unitIdx < 0 || !currentCurriculumUnits[unitIdx]) {
      setSelectedCurriculumUnitIndex(-1);
      setSelectedCurriculumLessonIndex(-1);
      return;
    }
    const unit = currentCurriculumUnits[unitIdx];
    setSelectedCurriculumUnitIndex(unitIdx);
    setSelectedCurriculumLessonIndex(-1);

    const title = selectedLanguage === 'Kinyarwanda' ? (unit.unitTitleRw || unit.unitTitleEn) : unit.unitTitleEn;
    const comp = selectedLanguage === 'Kinyarwanda' ? (unit.keyCompetenceRw || unit.keyCompetenceEn) : unit.keyCompetenceEn;

    handleFieldChange('unitNumber', unit.unitNumber);
    handleFieldChange('unitTitle', title);
    handleFieldChange('keyUnitCompetence', comp);

    if (unit.textbookReferenceEn) {
      const ref = selectedLanguage === 'Kinyarwanda' ? (unit.textbookReferenceRw || unit.textbookReferenceEn) : unit.textbookReferenceEn;
      handleFieldChange('references', ref);
    }

    setAiSuccessMessage(
      selectedLanguage === 'Kinyarwanda'
        ? `📚 Umutwe "${unit.unitNumber}: ${title}" wuzuyemo neza!`
        : `📚 "${unit.unitNumber}: ${title}" auto-filled from 2026-2027 REB curriculum!`
    );
    setTimeout(() => setAiSuccessMessage(null), 4000);
  };

  const handleApplyCurriculumLesson = (lessonIdx: number) => {
    if (selectedCurriculumUnitIndex < 0 || !currentCurriculumUnits[selectedCurriculumUnitIndex]) return;
    const unit = currentCurriculumUnits[selectedCurriculumUnitIndex];
    if (lessonIdx < 0 || !unit.lessons[lessonIdx]) {
      setSelectedCurriculumLessonIndex(-1);
      return;
    }
    const lesson = unit.lessons[lessonIdx];
    setSelectedCurriculumLessonIndex(lessonIdx);

    const lTitle = selectedLanguage === 'Kinyarwanda' ? (lesson.lessonTitleRw || lesson.lessonTitleEn) : lesson.lessonTitleEn;
    const obj = selectedLanguage === 'Kinyarwanda' ? (lesson.suggestedObjectiveRw || lesson.suggestedObjectiveEn) : lesson.suggestedObjectiveEn;
    const mat = selectedLanguage === 'Kinyarwanda' ? (lesson.suggestedMaterialsRw || lesson.suggestedMaterialsEn) : lesson.suggestedMaterialsEn;

    handleFieldChange('lessonNumber', lesson.lessonNumber);
    handleFieldChange('lessonTitle', lTitle);
    if (obj) handleFieldChange('instructionalObjective', obj);
    if (mat) handleFieldChange('learningMaterials', mat);

    setAiSuccessMessage(
      selectedLanguage === 'Kinyarwanda'
        ? `✨ Isomo "${lesson.lessonNumber}: ${lTitle}" ryuzuyemo neza!`
        : `✨ Lesson "${lesson.lessonNumber}: ${lTitle}" auto-filled from 2026-2027 REB curriculum!`
    );
    setTimeout(() => setAiSuccessMessage(null), 4000);
  };

  const handleApplySearchResult = (item: { book: RebCurriculumSubjectBook; unit: RebCurriculumUnit; lesson?: RebCurriculumLesson }) => {
    const { book, unit, lesson } = item;
    setSelectedCategory(book.category);
    const unitTitle = selectedLanguage === 'Kinyarwanda' ? (unit.unitTitleRw || unit.unitTitleEn) : unit.unitTitleEn;
    const keyComp = selectedLanguage === 'Kinyarwanda' ? (unit.keyCompetenceRw || unit.keyCompetenceEn) : unit.keyCompetenceEn;

    const matchedUnitIdx = book.units.findIndex(u => u.unitNumber === unit.unitNumber);
    if (matchedUnitIdx >= 0) {
      setSelectedCurriculumUnitIndex(matchedUnitIdx);
    }
    if (lesson) {
      const matchedLessonIdx = unit.lessons.findIndex(l => l.lessonNumber === lesson.lessonNumber);
      if (matchedLessonIdx >= 0) {
        setSelectedCurriculumLessonIndex(matchedLessonIdx);
      }
    }

    setPlan(prev => ({
      ...prev,
      subject: selectedLanguage === 'Kinyarwanda' ? book.subjectNameRw : book.subjectNameEn,
      className: book.gradeLevels[0] || prev.className,
      unitNumber: unit.unitNumber,
      unitTitle: unitTitle,
      keyUnitCompetence: keyComp,
      ...(lesson ? {
        lessonNumber: lesson.lessonNumber,
        lessonTitle: selectedLanguage === 'Kinyarwanda' ? (lesson.lessonTitleRw || lesson.lessonTitleEn) : lesson.lessonTitleEn,
        instructionalObjective: selectedLanguage === 'Kinyarwanda' ? (lesson.suggestedObjectiveRw || lesson.suggestedObjectiveEn || prev.instructionalObjective) : (lesson.suggestedObjectiveEn || prev.instructionalObjective),
        learningMaterials: selectedLanguage === 'Kinyarwanda' ? (lesson.suggestedMaterialsRw || lesson.suggestedMaterialsEn || prev.learningMaterials) : (lesson.suggestedMaterialsEn || prev.learningMaterials)
      } : {}),
      references: unit.textbookReferenceEn ? (
        selectedLanguage === 'Kinyarwanda' ? (unit.textbookReferenceRw || unit.textbookReferenceEn) : unit.textbookReferenceEn
      ) : prev.references,
      updatedAt: new Date().toISOString()
    }));

    setCurriculumSearchQuery('');
    setIsCurriculumSearchOpen(false);
    setAiSuccessMessage(
      selectedLanguage === 'Kinyarwanda'
        ? `📚 Byose byuzuyemo neza bivuye mu gitabo cya REB 2026-2027: ${book.edition}!`
        : `📚 Successfully loaded unit & lesson from official 2026-2027 curriculum!`
    );
    setTimeout(() => setAiSuccessMessage(null), 5000);
  };

  const printSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setPlan(JSON.parse(saved));
        }
      } catch {
        // ignore
      }

      if (initialMode === 'edit') {
        setActiveTab('form');
        setIsEditing(true);
      } else {
        setActiveTab('sheet');
        setIsEditing(false);
      }
    }
  }, [isOpen, initialMode]);

  // Persist plan changes & language
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
      localStorage.setItem(LOCAL_LANG_KEY, selectedLanguage);
    } catch {
      // ignore
    }
  }, [plan, selectedLanguage]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof CbcLessonPlanData, value: string) => {
    setPlan(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  // Generate Complete Lesson Plan based on Teacher Mandated Fill Inputs
  const handleGenerateFullPlan = async () => {
    // Check subscription plan status first
    const subCheck = checkCanCreateLessonPlan();
    if (!subCheck.canCreate) {
      if (onRequireSubscription) {
        onRequireSubscription(subCheck.message || 'Subscription period has expired or all lesson plan credits have been used.');
      }
      return;
    }

    setIsGeneratingAi(true);
    setAiSuccessMessage(null);

    try {
      const response = await fetch('/api/generate-full-cbc-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: plan.schoolName,
          teacherName: plan.teacherName,
          term: plan.term,
          date: plan.date,
          subject: plan.subject,
          className: plan.className,
          unitNumber: plan.unitNumber,
          unitTitle: plan.unitTitle,
          lessonNumber: plan.lessonNumber,
          lessonTitle: plan.lessonTitle,
          keyUnitCompetence: plan.keyUnitCompetence,
          specialNeeds: plan.specialNeeds,
          classLocation: plan.classLocation,
          duration: plan.duration,
          classSize: plan.classSize,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      if (data && data.plan) {
        const receivedPlan = { ...data.plan };
        // Teacher's self-evaluation must ALWAYS remain completely blank when planning
        receivedPlan.teacherSelfEvaluation = '';
        receivedPlan.references = ensureRevisedReference(receivedPlan.references, {
          subject: plan.subject,
          className: plan.className,
          unitNumber: plan.unitNumber,
          unitTitle: plan.unitTitle,
          lessonNumber: plan.lessonNumber,
          lessonTitle: plan.lessonTitle,
          language: selectedLanguage
        });
        setPlan(sanitizePlanForLanguage(receivedPlan, selectedLanguage));
        setActiveTab('sheet');
        setIsEditing(false);
        
        // Consume one lesson plan count
        const sub = consumeLessonPlan();
        const remaining = Math.max(0, sub.totalPlansAllowed - sub.usedPlansCount);
        const remainingNotice = ` (Remaining: ${remaining} lesson plans)`;

        // Auto backup to cloud
        saveLessonPlanToFirestore(data.plan).catch(err => console.warn("Silent cloud save failed:", err));

        let msg = `✨ Complete Lesson Plan generated by AI based on your inputs in ${selectedLanguage}!${remainingNotice}`;
        if (data.source === 'fallback') {
          msg = selectedLanguage === 'Kinyarwanda'
            ? `⚠️ AI Quota yageze ku mupaka (Gukoresha isomo ryiteguye)${remainingNotice}. Urashobora gukoresha urufunguzo rwawe (Gemini API Key) muri Settings kugira ngo ugire AI idahagarara.`
            : `⚠️ AI Quota Reached (Using fallback draft)${remainingNotice}. You can add your own Gemini API Key in Settings for unlimited AI.`;
        }
        setAiSuccessMessage(msg);
        setTimeout(() => setAiSuccessMessage(null), 5000);
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (err) {
      console.warn('Full generation fallback:', err);
      setActiveTab('sheet');
      setIsEditing(false);

      // Consume one lesson plan count
      const sub = consumeLessonPlan();
      const remaining = Math.max(0, sub.totalPlansAllowed - sub.usedPlansCount);
      const remainingNotice = ` (Remaining: ${remaining} lesson plans)`;

      // Auto backup to cloud
      saveLessonPlanToFirestore(plan).catch(err => console.warn("Silent cloud save failed:", err));

      setAiSuccessMessage(`✨ Lesson Plan saved and prepared!${remainingNotice}`);
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Toggle Edit Mode / Finish Edit
  const handleToggleEditMode = () => {
    if (isEditing) {
      // Teacher clicks "Finish Edit Lesson Plan"
      setIsEditing(false);
      setActiveTab('sheet');
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
      } catch {
        // ignore
      }

      // Auto backup to cloud
      saveLessonPlanToFirestore(plan).catch(err => console.warn("Silent cloud save failed:", err));

      const msg = '✓ Lesson Plan edits finished and saved successfully!';
      setAiSuccessMessage(msg);
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } else {
      // Teacher clicks "Edit Lesson Plan" - enables in-place editing on the sheet
      setIsEditing(true);
    }
  };

  // Switch or Translate Language with Instant Full Context Transformation
  const handleLanguageChange = async (newLang: CbcLanguage) => {
    setSelectedLanguage(newLang);
    try {
      localStorage.setItem(LOCAL_LANG_KEY, newLang);
    } catch (e) {
      console.warn('Could not save language to storage', e);
    }
    
    const currentPlan = planRef.current || plan;

    // Check if the current plan is a default/sample draft
    const isSamplePlan = 
      !currentPlan.unitTitle ||
      currentPlan.id?.startsWith('cbc_lp_sample') ||
      currentPlan.unitTitle === 'Operations on Whole Numbers' ||
      currentPlan.unitTitle === 'Kubungabunga ibidukikije no kwirinda isuri' ||
      currentPlan.unitTitle === "L'environnement et la protection de la nature" ||
      currentPlan.unitTitle === 'Mazingira na Uhifadhi wa Misitu';

    if (isSamplePlan) {
      // 0ms instant full native CBC official sample in the target language
      const nativeSample = CBC_SAMPLES[newLang] || CBC_SAMPLES.English;
      const instantPlan: CbcLessonPlanData = {
        ...nativeSample,
        id: currentPlan.id || nativeSample.id,
        schoolName: currentPlan.schoolName || nativeSample.schoolName,
        teacherName: currentPlan.teacherName || nativeSample.teacherName,
        date: currentPlan.date || nativeSample.date,
        className: currentPlan.className || nativeSample.className,
        classSize: currentPlan.classSize || nativeSample.classSize,
        teacherSelfEvaluation: currentPlan.teacherSelfEvaluation || '',
        updatedAt: new Date().toISOString()
      };
      setPlan(instantPlan);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(instantPlan));
      } catch {}

      const msg = 
        newLang === 'Kinyarwanda' ? '✨ Isomo ryose ryahinduwe mu Kinyarwanda neza!' :
        newLang === 'Français' ? '✨ Tout le contexte de la leçon a été adapté en Français!' :
        newLang === 'Kiswahili' ? '✨ Somo lote limetafsiriwa kikamilifu kwa Kiswahili!' :
        `✨ Full lesson plan context adapted into ${newLang}!`;
      setAiSuccessMessage(msg);
      setTimeout(() => setAiSuccessMessage(null), 3500);
      return;
    }

    // Custom user plan: Perform immediate metadata translation for 0ms visual feedback
    let subject = currentPlan.subject;
    let unitNum = currentPlan.unitNumber || 'Unit 2';
    let lessonNum = currentPlan.lessonNumber || '1 of 6';
    let duration = currentPlan.duration || '40 min';
    let location = currentPlan.classLocation || 'Inside the classroom';
    let timingIntro = currentPlan.timingIntro || '10 min';
    let timingDev = currentPlan.timingDev || '20 min';
    let timingConcl = currentPlan.timingConcl || '10 min';

    const formatKinyarwandaTime = (val: string) => {
      if (!val) return 'Iminota 40';
      const numMatch = val.match(/\d+/);
      if (numMatch) {
        const num = numMatch[0];
        if (/double/i.test(val)) return `Iminota ${num} (Isomo ry'ibiri)`;
        return `Iminota ${num}`;
      }
      return val.replace(/\bmin(s|utes?)?\b/gi, 'iminota').replace(/\bMin(s|utes?)?\b/gi, 'Iminota');
    };

    if (newLang === 'Kinyarwanda') {
      if (subject === 'Mathematics') subject = 'Imibare';
      else if (subject === 'English') subject = 'Icyongereza';
      else if (subject.includes('Science') || subject.includes('SET')) subject = "Ikinyabuzima n'Ikoranabuhanga (SET)";
      else if (subject.includes('Social')) subject = "Ubumenyi bw'Imbaga n'Iyobokamana";
      
      unitNum = unitNum.replace(/Unit/i, 'Umutwe').replace(/Unité/i, 'Umutwe').replace(/Sura/i, 'Umutwe');
      lessonNum = lessonNum.replace(/Lesson/i, 'Isomo').replace(/of/i, 'kuri').replace(/Leçon/i, 'Isomo').replace(/sur/i, 'kuri').replace(/Somo/i, 'Isomo').replace(/kati ya/i, 'kuri');
      duration = formatKinyarwandaTime(duration);
      location = "Mu cyumba cy'ishuri";
      timingIntro = formatKinyarwandaTime(timingIntro);
      timingDev = formatKinyarwandaTime(timingDev);
      timingConcl = formatKinyarwandaTime(timingConcl);
    } else if (newLang === 'Français') {
      if (subject === 'Mathematics' || subject === 'Imibare') subject = 'Mathématiques';
      else if (subject === 'English' || subject === 'Icyongereza') subject = 'Anglais';
      
      unitNum = unitNum.replace(/Unit/i, 'Unité').replace(/Umutwe/i, 'Unité').replace(/Sura/i, 'Unité');
      lessonNum = lessonNum.replace(/Lesson/i, 'Leçon').replace(/of/i, 'sur').replace(/Isomo/i, 'Leçon').replace(/sur/i, 'sur');
      duration = duration.replace(/Iminota/i, 'Min').replace(/min/i, 'Min');
      location = "En classe";
      timingIntro = timingIntro.replace(/Iminota/i, 'Min').replace(/min/i, 'Min');
      timingDev = timingDev.replace(/Iminota/i, 'Min').replace(/min/i, 'Min');
      timingConcl = timingConcl.replace(/Iminota/i, 'Min').replace(/min/i, 'Min');
    } else if (newLang === 'Kiswahili') {
      if (subject === 'Mathematics' || subject === 'Imibare') subject = 'Hisabati';
      else if (subject === 'English' || subject === 'Icyongereza') subject = 'Kiingereza';
      
      unitNum = unitNum.replace(/Unit/i, 'Sura ya').replace(/Umutwe/i, 'Sura ya').replace(/Unité/i, 'Sura ya');
      lessonNum = lessonNum.replace(/Lesson/i, 'Somo la').replace(/of/i, 'kati ya').replace(/Isomo/i, 'Somo la').replace(/kuri/i, 'kati ya');
      duration = duration.replace(/Iminota/i, 'Dakika').replace(/min/i, 'Dakika');
      location = "Ndani ya darasa";
      timingIntro = timingIntro.replace(/Iminota/i, 'Dakika').replace(/min/i, 'Dakika');
      timingDev = timingDev.replace(/Iminota/i, 'Dakika').replace(/min/i, 'Dakika');
      timingConcl = timingConcl.replace(/Iminota/i, 'Dakika').replace(/min/i, 'Dakika');
    } else {
      if (subject === 'Imibare' || subject === 'Mathématiques' || subject === 'Hisabati') subject = 'Mathematics';
      else if (subject === 'Icyongereza' || subject === 'Anglais' || subject === 'Kiingereza') subject = 'English';
      
      unitNum = unitNum.replace(/Umutwe(\s+wa)?/i, 'Unit').replace(/Unité/i, 'Unit').replace(/Sura(\s+ya)?/i, 'Unit');
      lessonNum = lessonNum.replace(/Isomo(\s+rya)?/i, 'Lesson').replace(/kuri/i, 'of').replace(/Leçon/i, 'Lesson').replace(/sur/i, 'of').replace(/Somo(\s+la)?/i, 'Lesson').replace(/kati ya/i, 'of');
      duration = duration.replace(/Iminota/i, 'min').replace(/Dakika/i, 'min').replace(/Min/i, 'min');
      location = "Inside the classroom";
      timingIntro = timingIntro.replace(/Iminota/i, 'min').replace(/Dakika/i, 'min');
      timingDev = timingDev.replace(/Iminota/i, 'min').replace(/Dakika/i, 'min');
      timingConcl = timingConcl.replace(/Iminota/i, 'min').replace(/Dakika/i, 'min');
    }

    const instantPlan: CbcLessonPlanData = {
      ...currentPlan,
      subject,
      unitNumber: unitNum,
      lessonNumber: lessonNum,
      duration,
      classLocation: location,
      timingIntro,
      timingDev,
      timingConcl,
      updatedAt: new Date().toISOString()
    };

    setPlan(instantPlan);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(instantPlan));
    } catch {}

    const translatingMsg = 
      newLang === 'Kinyarwanda' ? '⏳ AI iriguhindura isomo ryose mu Kinyarwanda...' :
      newLang === 'Français' ? '⏳ AI traduit toute la leçon en Français...' :
      newLang === 'Kiswahili' ? '⏳ AI inatafsiri somo lote kwa Kiswahili...' :
      `⏳ AI is translating full lesson plan into ${newLang}...`;
    setAiSuccessMessage(translatingMsg);

    // 2. Trigger AI deep context translation for full lesson content
    setIsTranslatingPlan(true);
    try {
      const response = await fetch('/api/translate-cbc-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: currentPlan,
          targetLanguage: newLang
        })
      });

      const data = await response.json();
      if (data && data.success && data.translatedPlan) {
        setPlan(data.translatedPlan);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.translatedPlan));
        } catch {}
        const msg = 
          newLang === 'Kinyarwanda' ? '✨ Isomo ryose ryahinduwe mu Kinyarwanda neza!' :
          newLang === 'Français' ? '✨ Tout le contexte de la leçon a été traduit en Français avec succès!' :
          newLang === 'Kiswahili' ? '✨ Muktadha wote wa somo umetafsiriwa kikamilifu kwa Kiswahili!' :
          `✨ Full lesson plan context translated into ${newLang} successfully!`;
        setAiSuccessMessage(msg);
        setTimeout(() => setAiSuccessMessage(null), 4500);
      }
    } catch (err) {
      console.warn('Translation background fetch fallback:', err);
    } finally {
      setIsTranslatingPlan(false);
    }
  };

  // AI Auto-Fill for All Fields & Activities (Instructional Objective, Materials, References & Teacher/Learner Activities)
  const handleAiAutoFill = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMessage(null);

    try {
      const response = await fetch('/api/generate-full-cbc-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: plan.schoolName,
          teacherName: plan.teacherName,
          term: plan.term,
          date: plan.date,
          subject: plan.subject,
          className: plan.className,
          unitNumber: plan.unitNumber,
          unitTitle: plan.unitTitle,
          lessonNumber: plan.lessonNumber,
          lessonTitle: plan.lessonTitle,
          keyUnitCompetence: plan.keyUnitCompetence,
          specialNeeds: plan.specialNeeds,
          classLocation: plan.classLocation,
          duration: plan.duration,
          classSize: plan.classSize,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      if (data && data.plan) {
        const generated = data.plan;
        setPlan(prev => sanitizePlanForLanguage({
          ...prev,
          subject: generated.subject || prev.subject,
          unitNumber: generated.unitNumber || prev.unitNumber,
          unitTitle: generated.unitTitle || prev.unitTitle,
          keyUnitCompetence: generated.keyUnitCompetence || prev.keyUnitCompetence,
          lessonNumber: generated.lessonNumber || prev.lessonNumber,
          lessonTitle: generated.lessonTitle || prev.lessonTitle,
          instructionalObjective: generated.instructionalObjective || prev.instructionalObjective,
          classLocation: generated.classLocation || prev.classLocation,
          duration: generated.duration || prev.duration,
          learningMaterials: generated.learningMaterials || prev.learningMaterials,
          references: ensureRevisedReference(generated.references || prev.references, {
            subject: plan.subject,
            className: plan.className,
            unitNumber: plan.unitNumber,
            unitTitle: plan.unitTitle,
            lessonNumber: plan.lessonNumber,
            lessonTitle: plan.lessonTitle,
            language: selectedLanguage
          }),
          specialNeeds: generated.specialNeeds || prev.specialNeeds,
          genericCompetences: generated.genericCompetences || prev.genericCompetences,
          crossCuttingIssues: generated.crossCuttingIssues || prev.crossCuttingIssues,
          descActivities: generated.descActivities || prev.descActivities,
          teacherActivityIntro: generated.teacherActivityIntro || prev.teacherActivityIntro,
          learnerActivityIntro: generated.learnerActivityIntro || prev.learnerActivityIntro,
          genericCompetencesIntro: generated.genericCompetencesIntro || prev.genericCompetencesIntro,
          teacherActivityDev: generated.teacherActivityDev || prev.teacherActivityDev,
          learnerActivityDev: generated.learnerActivityDev || prev.learnerActivityDev,
          genericCompetencesDev: generated.genericCompetencesDev || prev.genericCompetencesDev,
          teacherActivityConcl: generated.teacherActivityConcl || prev.teacherActivityConcl,
          learnerActivityConcl: generated.learnerActivityConcl || prev.learnerActivityConcl,
          genericCompetencesConcl: generated.genericCompetencesConcl || prev.genericCompetencesConcl,
          teacherSelfEvaluation: '',
          updatedAt: new Date().toISOString()
        }, selectedLanguage));
        let successMsg = selectedLanguage === 'Kinyarwanda' 
          ? '✨ AI yazalije neza ibikorwa byose by\'isomo (Teacher & Learner Activities) n\'ibindi bice!'
          : `✨ AI generated fresh activities and fields in ${selectedLanguage}!`;
        if (data.source === 'fallback') {
          successMsg = selectedLanguage === 'Kinyarwanda'
            ? '⚠️ AI Quota yageze ku mupaka (Gukoresha ibyiteguye). Urashobora gukoresha urufunguzo rwawe (Gemini API Key) muri Settings kugira ngo ugire AI idahagarara.'
            : '⚠️ AI Quota Reached (Using fallback draft). You can use your own Gemini API Key in Settings for unlimited AI.';
        }
        setAiSuccessMessage(successMsg);
        setTimeout(() => setAiSuccessMessage(null), 5000);
      } else {
        throw new Error('No result returned');
      }
    } catch (err) {
      console.warn('Fallback for auto-fill:', err);
      const sample = CBC_SAMPLES[selectedLanguage] || CBC_SAMPLES.English;
      setPlan(prev => ({
        ...prev,
        instructionalObjective: sample.instructionalObjective,
        learningMaterials: sample.learningMaterials,
        references: sample.references,
        genericCompetences: sample.genericCompetences || '',
        crossCuttingIssues: sample.crossCuttingIssues || '',
        teacherActivityIntro: sample.teacherActivityIntro,
        learnerActivityIntro: sample.learnerActivityIntro,
        genericCompetencesIntro: sample.genericCompetencesIntro,
        teacherActivityDev: sample.teacherActivityDev,
        learnerActivityDev: sample.learnerActivityDev,
        genericCompetencesDev: sample.genericCompetencesDev,
        teacherActivityConcl: sample.teacherActivityConcl,
        learnerActivityConcl: sample.learnerActivityConcl,
        genericCompetencesConcl: sample.genericCompetencesConcl,
        teacherSelfEvaluation: '',
        updatedAt: new Date().toISOString()
      }));
      setAiSuccessMessage(`✨ Generated activities and fields in ${selectedLanguage}!`);
      setTimeout(() => setAiSuccessMessage(null), 4500);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Regenerate SMART Instructional Objective strictly conforming to REB standard (By using [materials]... without 'By the end of this lesson')
  const handleAiRegenerateObjective = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMessage(null);

    try {
      const response = await fetch('/api/generate-cbc-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: plan.subject,
          className: plan.className,
          unitNumber: plan.unitNumber,
          unitTitle: plan.unitTitle,
          lessonNumber: plan.lessonNumber,
          lessonTitle: plan.lessonTitle,
          keyUnitCompetence: plan.keyUnitCompetence,
          duration: plan.duration,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      if (data && data.result && data.result.instructionalObjective) {
        let obj = data.result.instructionalObjective;
        obj = obj.replace(/\b(By\s+the\s+end\s+of\s+(this|the)\s+lesson|At\s+the\s+end\s+of\s+(this|the)\s+lesson)\b,?\s*/gi, '');
        obj = obj.replace(/\b(Mu\s+mpera\s+z'(iri\s+somo|isomo)|Isomo\s+rirangiye|Mu\s+gihe\s+isomo\s+rirangiye)\b,?\s*/gi, '');
        obj = obj.replace(/\b(À\s+la\s+fin\s+de\s+(cette|la)\s+leçon)\b,?\s*/gi, '');
        obj = obj.replace(/\b(Kufikia\s+mwisho\s+wa\s+(somo\s+hili|somo))\b,?\s*/gi, '');
        obj = obj.replace(/^[\s,;:-]+/, '').trim();
        if (obj.length > 0) {
          obj = obj.charAt(0).toUpperCase() + obj.slice(1);
        }

        setPlan(prev => {
          const updated = {
            ...prev,
            instructionalObjective: obj,
            updatedAt: new Date().toISOString()
          };
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });

        const successMsg = selectedLanguage === 'Kinyarwanda'
          ? "✨ Intego y'isomo (Instructional Objective) yavuguruwe neza mu buryo bwa REB!"
          : "✨ Instructional Objective regenerated successfully adhering to REB standard (without 'By the end of this lesson')!";
        setAiSuccessMessage(successMsg);
        setTimeout(() => setAiSuccessMessage(null), 4500);
      } else {
        throw new Error('Failed to regenerate objective');
      }
    } catch (err) {
      console.warn('Error regenerating objective:', err);
      const errMsg = selectedLanguage === 'Kinyarwanda'
        ? "⚠️ Ntibyakunze kuvugurura intego y'isomo, ongera ugerageze gato."
        : "⚠️ Failed to regenerate instructional objective, please try again.";
      setAiSuccessMessage(errMsg);
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Expand Content for Activities (Teacher & Student Activities) to be extremely detailed, pedagogical, and long
  const handleExpandContent = async () => {
    setIsExpandingActivities(true);
    setAiSuccessMessage(null);

    try {
      const response = await fetch('/api/expand-cbc-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: {
            introduction: {
              teacherActivity: plan.teacherActivityIntro,
              learnerActivity: plan.learnerActivityIntro
            },
            development: {
              teacherActivity: plan.teacherActivityDev,
              learnerActivity: plan.learnerActivityDev
            },
            conclusion: {
              teacherActivity: plan.teacherActivityConcl,
              learnerActivity: plan.learnerActivityConcl
            }
          },
          language: selectedLanguage,
          subject: plan.subject,
          lessonTitle: plan.lessonTitle,
          className: plan.className
        })
      });

      const data = await response.json();
      if (data && data.steps) {
        const expanded = data.steps;
        setPlan(prev => ({
          ...prev,
          teacherActivityIntro: expanded.introduction?.teacherActivity || prev.teacherActivityIntro,
          learnerActivityIntro: expanded.introduction?.learnerActivity || prev.learnerActivityIntro,
          teacherActivityDev: expanded.development?.teacherActivity || prev.teacherActivityDev,
          learnerActivityDev: expanded.development?.learnerActivity || prev.learnerActivityDev,
          teacherActivityConcl: expanded.conclusion?.teacherActivity || prev.teacherActivityConcl,
          learnerActivityConcl: expanded.conclusion?.learnerActivity || prev.learnerActivityConcl,
          updatedAt: new Date().toISOString()
        }));

        let successMsg = selectedLanguage === 'Kinyarwanda'
          ? '✨ AI yongereye amagambo n\'uburyo bwo kwigisha (Pedagogical Breakdown) mu bikorwa byose!'
          : '✨ AI successfully expanded and detailed both Teacher and Student activities!';
        if (data.source === 'fallback') {
          successMsg = selectedLanguage === 'Kinyarwanda'
            ? '⚠️ AI Quota yageze ku mupaka. Urashobora gukoresha urufunguzo rwawe (Gemini API Key) muri Settings kugira ngo ugire AI idahagarara.'
            : '⚠️ AI Quota Reached (Using fallback). You can use your own Gemini API Key in Settings for unlimited AI.';
        }
        setAiSuccessMessage(successMsg);
        setTimeout(() => setAiSuccessMessage(null), 5000);
      } else {
        throw new Error('Failed to expand activities');
      }
    } catch (err) {
      console.warn('Expand content error:', err);
      const errMsg = selectedLanguage === 'Kinyarwanda'
        ? '⚠️ Ntibyakunze kwagura amagambo, gerageza gato cyangwa unyure muri Settings.'
        : '⚠️ Failed to expand activities, please try again or configure API key.';
      setAiSuccessMessage(errMsg);
      setTimeout(() => setAiSuccessMessage(null), 4500);
    } finally {
      setIsExpandingActivities(false);
    }
  };

  // AI Generate or Enrich Generic Competences & Cross-Cutting Issues with Detailed Explanations
  const handleAiExplainCompetences = async () => {
    setIsExplainingCompetences(true);
    setAiSuccessMessage(null);

    try {
      const response = await fetch('/api/generate-cbc-competences-explanations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: plan.subject,
          className: plan.className,
          unitTitle: plan.unitTitle,
          lessonTitle: plan.lessonTitle,
          keyUnitCompetence: plan.keyUnitCompetence,
          specialNeeds: plan.specialNeeds,
          teacherActivityIntro: plan.teacherActivityIntro,
          learnerActivityIntro: plan.learnerActivityIntro,
          teacherActivityDev: plan.teacherActivityDev,
          learnerActivityDev: plan.learnerActivityDev,
          teacherActivityConcl: plan.teacherActivityConcl,
          learnerActivityConcl: plan.learnerActivityConcl,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      if (data && data.competences) {
        const comp = data.competences;
        setPlan(prev => {
          const updated = {
            ...prev,
            genericCompetencesIntro: comp.genericCompetencesIntro || prev.genericCompetencesIntro,
            genericCompetencesDev: comp.genericCompetencesDev || prev.genericCompetencesDev,
            genericCompetencesConcl: comp.genericCompetencesConcl || prev.genericCompetencesConcl,
            genericCompetences: comp.genericCompetences || prev.genericCompetences,
            crossCuttingIssues: comp.crossCuttingIssues || prev.crossCuttingIssues,
            updatedAt: new Date().toISOString()
          };
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });

        const successMsg = selectedLanguage === 'Kinyarwanda'
          ? "✨ AI yasobanuye neza Ubumenyi ngiro n'Ibibazo byambukiranya (Generic Competences & Cross-Cutting Issues) mu ntambwe zose z'isomo!"
          : "✨ AI successfully formulated rich pedagogical explanations for Generic Competences & Cross-Cutting Issues in all lesson stages!";
        setAiSuccessMessage(successMsg);
        setTimeout(() => setAiSuccessMessage(null), 5000);
      } else {
        throw new Error('Failed to generate explanations');
      }
    } catch (err) {
      console.warn('Competences explanation error:', err);
      const errMsg = selectedLanguage === 'Kinyarwanda'
        ? "⚠️ Ntibyakunze gusobanura ubumenyi ngiro, ongera ugerageze gato cyangwa unyure muri Settings."
        : "⚠️ Failed to generate competences explanations, please try again or configure API key in Settings.";
      setAiSuccessMessage(errMsg);
      setTimeout(() => setAiSuccessMessage(null), 4500);
    } finally {
      setIsExplainingCompetences(false);
    }
  };

  // Download 1-Page PDF matching the exact official REB / NESA template
  const handleDownload1PagePDF = async () => {
    setIsDownloadingPdf(true);
    try {
      // Primary: Use high-quality vector jsPDF generator (fast, crisp, no html2canvas/oklch issues)
      await exportCbcLessonPlanToPdf(plan, selectedLanguage, pageOrientation);
      setAiSuccessMessage(`📥 PDF ya Lesson Plan (1 Page) yamanutse neza!`);
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } catch (error) {
      console.error('Vector PDF export error, trying DOM fallback with html2pdf:', error);
      try {
        if (activeTab !== 'sheet') {
          setActiveTab('sheet');
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        const element = document.getElementById('cbc-one-page-document');
        if (element) {
          const html2pdfModule = (await import('html2pdf.js')).default;
          const opt = {
            margin:       [4, 4, 4, 4] as [number, number, number, number],
            filename:     `CBC_Lesson_Plan_${selectedLanguage}_${(plan.subject || 'Subject').replace(/\s+/g, '_')}_${(plan.className || 'Class')}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { 
              scale: 2, 
              useCORS: true, 
              logging: false,
              onclone: (clonedDoc: Document) => {
                // Remove oklch color functions that html2canvas cannot parse
                const styleElements = clonedDoc.querySelectorAll('style');
                styleElements.forEach((styleTag) => {
                  if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
                    styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/g, '#334155');
                  }
                });
              }
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: pageOrientation }
          };
          await html2pdfModule().set(opt).from(element).save();
          setAiSuccessMessage(`📥 1-Page Lesson Plan PDF downloaded successfully!`);
          setTimeout(() => setAiSuccessMessage(null), 4000);
        } else {
          window.print();
        }
      } catch (domErr) {
        console.error('DOM PDF capture failed:', domErr);
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    if (activeTab !== 'sheet') {
      setActiveTab('sheet');
      setTimeout(() => window.print(), 100);
    } else {
      window.print();
    }
  };

  const handleResetSample = () => {
    if (confirm(`Do you want to reset to default CBC Lesson Plan sample in ${selectedLanguage}?`)) {
      setPlan(CBC_SAMPLES[selectedLanguage] || CBC_SAMPLES.English);
    }
  };

  // Language display labels & flags
  const languagesConfig: { code: CbcLanguage; name: string; flag: string; nativeName: string }[] = [
    { code: 'English', name: 'English', flag: '🇬🇧', nativeName: 'English (REB)' },
    { code: 'Kinyarwanda', name: 'Ikinyarwanda', flag: '🇷🇼', nativeName: 'Ikinyarwanda' },
    { code: 'Français', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'Kiswahili', name: 'Kiswahili', flag: '🇹🇿', nativeName: 'Kiswahili' },
  ];

  const isPortrait = pageOrientation === 'portrait';
  const labelColW = pageOrientation === 'landscape' ? 'w-[20%]' : 'w-[28.4%]';
  const valueColW = pageOrientation === 'landscape' ? 'w-[80%]' : 'w-[71.6%]';
  const cellPy = isPortrait ? 'py-1.5 sm:py-2' : 'py-0.5 sm:py-1';
  const cellPx = isPortrait ? 'px-2' : 'px-1 sm:px-1.5';
  const cellPadding = `${cellPy} ${cellPx}`;

  return (
    <div className="appearance-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1 sm:p-3 md:p-5 overflow-hidden">
      <div className="appearance-none bg-slate-900 w-full max-w-7xl h-[98vh] sm:h-[95vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 flex flex-col text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="appearance-none bg-slate-950 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 shrink-0 gap-3">
          
          <div className="appearance-none flex items-center gap-3">
            <div className="appearance-none w-10 h-10 rounded-2xl p-[1px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg">
              <div className="appearance-none w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <FileText className="appearance-none w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="appearance-none flex items-center gap-2">
                <h2 className="appearance-none text-sm sm:text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                  <span>Create & Edit Lesson Plan</span>
                  <span className="appearance-none bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                    CBC OFFICIAL
                  </span>
                </h2>
              </div>
              <p className="appearance-none text-[10px] sm:text-xs text-slate-400 font-medium">
                Rwanda Education Board (REB) Competence-Based Curriculum Standard • Single Page PDF
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="appearance-none flex flex-wrap items-center gap-2">

            {/* AUTO-SAVE 5s STATUS BADGE */}
            <div 
              className="appearance-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 transition-all shadow-inner"
              title="Automatically saves all inputs to localStorage every 5 seconds to prevent data loss during long typing sessions"
            >
              <span className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <Save className={`w-3.5 h-3.5 ${isAutoSaving ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">
                {isAutoSaving ? 'Auto-saving...' : lastAutoSavedTime ? `Auto-saved (${lastAutoSavedTime})` : 'Auto-save (5s)'}
              </span>
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="appearance-none bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('sheet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'sheet'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Live 1-Page Document View"
              >
                <Eye className="appearance-none w-3.5 h-3.5" />
                <span>{UI_TEXT[selectedLanguage].sheetTab}</span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Form Editor"
              >
                <Edit3 className="appearance-none w-3.5 h-3.5" />
                <span>{UI_TEXT[selectedLanguage].formTab}</span>
              </button>
            </div>

            {/* QUICK LANGUAGE SELECTOR IN HEADER */}
            <div className="appearance-none bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-emerald-400 ml-1 mr-0.5 hidden sm:inline" />
              {languagesConfig.map(lang => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-300'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={`Switch language and content to ${lang.name}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="hidden md:inline text-[11px]">{lang.name}</span>
                  </button>
                );
              })}
            </div>

            {/* LOAD TEMPLATE BUTTON */}
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="appearance-none bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Select from pre-defined REB standard lesson plan templates"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Load Template</span>
            </button>

            {/* SAVE AS TEMPLATE BUTTON */}
            <button
              onClick={() => setIsSaveTemplateModalOpen(true)}
              className="appearance-none bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Save this custom lesson plan structure as a reusable template"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save as Template</span>
            </button>

            {/* MAIN GENERATE LESSON PLAN (AI) BUTTON */}
            <button
              onClick={handleGenerateFullPlan}
              disabled={isGeneratingAi || isTranslatingPlan}
              className="appearance-none bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-emerald-300/40 cursor-pointer disabled:opacity-50"
              title="Teacher fills in required details then generates full lesson plan with AI"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${isGeneratingAi ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{isGeneratingAi ? UI_TEXT[selectedLanguage].writingAi : UI_TEXT[selectedLanguage].generateFullPlan}</span>
            </button>

            {/* EDIT LESSON PLAN / FINISH EDIT LESSON PLAN TOGGLE BUTTON */}
            <button
              onClick={handleToggleEditMode}
              className={`text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                isEditing
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300/60 shadow-emerald-950/50'
                  : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-300/40 shadow-amber-950/40'
              }`}
              title={isEditing ? "Click to finish editing and save changes" : "Click to edit lesson plan"}
            >
              {isEditing ? (
                <>
                  <CheckCircle className="appearance-none w-3.5 h-3.5 text-emerald-200" />
                  <span>{UI_TEXT[selectedLanguage].finishEditPlan}</span>
                </>
              ) : (
                <>
                  <Edit3 className="appearance-none w-3.5 h-3.5 text-amber-200" />
                  <span>{UI_TEXT[selectedLanguage].editPlan}</span>
                </>
              )}
            </button>

            {/* SAVE TO CLOUD BUTTON */}
            <button
              onClick={handleSaveToCloud}
              disabled={isSavingCloud}
              className="appearance-none bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-blue-950/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-blue-400/40 disabled:opacity-50 cursor-pointer animate-pulse"
              title="Save this Lesson Plan permanently to Cloud Firestore"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSavingCloud ? 'animate-bounce' : ''}`} />
              <span>{isSavingCloud ? 'Saving...' : 'Save to Cloud'}</span>
            </button>

            {/* DOWNLOAD 1-PAGE PDF BUTTON */}
            <button
              onClick={handleDownload1PagePDF}
              disabled={isDownloadingPdf}
              className="appearance-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-emerald-400/40 disabled:opacity-50 cursor-pointer"
              title="Download 1-Page PDF matching REB template"
            >
              <Download className="appearance-none w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'Creating PDF...' : UI_TEXT[selectedLanguage].downloadPdf}</span>
            </button>

            {/* PRINTABLE QR CODE BUTTON */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="appearance-none bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Generate & Print QR Code for instant mobile access & inspection"
            >
              <QrCode className="appearance-none w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Print QR Code</span>
            </button>

            {/* PRINT BUTTON */}
            <button
              onClick={handlePrint}
              className="appearance-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 hover:text-white transition-all cursor-pointer"
              title="Direct Print or Save as PDF"
            >
              <Printer className="appearance-none w-3.5 h-3.5 text-slate-400" />
              <span className="appearance-none hidden sm:inline">Print</span>
            </button>

            {/* RESET BUTTON */}
            <button
              onClick={handleResetSample}
              className="appearance-none p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
              title={`Reset Sample for ${selectedLanguage}`}
            >
              <RotateCcw className="appearance-none w-3.5 h-3.5" />
            </button>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="appearance-none p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-all ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="appearance-none w-4 h-4" />
            </button>
          </div>

        </div>

        {/* AI NOTIFICATION OR TRANSLATING BANNER */}
        {(aiSuccessMessage || isTranslatingPlan) && (
          <div className="no-print print:hidden appearance-none bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 font-bold animate-fade-in shrink-0">
            <div className="appearance-none flex items-center gap-2">
              {isTranslatingPlan ? (
                <>
                  <RefreshCw className="appearance-none w-4 h-4 text-amber-300 animate-spin" />
                  <span>AI is adapting Lesson Plan to {selectedLanguage}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="appearance-none w-4 h-4 text-amber-300 animate-spin-slow" />
                  <span>{aiSuccessMessage}</span>
                </>
              )}
            </div>
            {aiSuccessMessage && (
              <button 
                onClick={() => setAiSuccessMessage(null)}
                className="appearance-none text-emerald-400 hover:text-white"
              >
                <X className="appearance-none w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* MODAL BODY */}
        <div className="appearance-none flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-slate-950 flex flex-col items-center">
          
          {/* 📚 REB & NESA 2026-2027 CURRICULUM SELECTOR (LEVEL, CLASS, SUBJECT, UNIT & LESSON SELECT) */}
          <div className="no-print print:hidden w-full max-w-5xl mb-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-3.5 sm:p-5 shadow-2xl space-y-3.5">
            
            {/* HEADER TITLE & BADGE */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 font-black">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
                      {selectedLanguage === 'Kinyarwanda' 
                        ? '📚 Ibitabo bya REB & NESA 2026-2027 (Hitamo gusa ntakwandika)' 
                        : '📚 REB & NESA 2026-2027 Updated Curriculum (Select & Auto-fill)'}
                    </h2>
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      CBC 2026-2027
                    </span>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      All Levels (Nursery - TVET)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {selectedLanguage === 'Kinyarwanda' 
                      ? 'Kanda ku cyiciro (Level), uhitemo Umwaka, Isomo, Umutwe n\'Isomo ry\'uyu munsi muri Select byose byuzure ako kanya!'
                      : 'Click your education level, then select Subject, Unit, and Lesson from dropdowns. Everything auto-fills without manual typing!'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCurriculumSearchOpen(true)}
                className="text-xs font-bold bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedLanguage === 'Kinyarwanda' ? 'Shakisha mu bitabo byose' : 'Search All Books'}</span>
              </button>
            </div>

            {/* 1. LEVEL / CATEGORY BUTTONS */}
            <div>
              <div className="text-[10.5px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>1. {selectedLanguage === 'Kinyarwanda' ? 'Kanda ku Cyiciro (Click Education Level):' : 'Click Education Level:'}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">{UI_TEXT[selectedLanguage].categorySubtitle}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {EDUCATION_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const displayTitle = getCategoryTitle(cat, selectedLanguage);
                  const mainTitle = displayTitle.split('(')[0].trim();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400/40 scale-[1.02]'
                          : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-black text-white truncate">{mainTitle}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                          isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cat.badge}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-400 truncate">
                        {cat.levels[0]} - {cat.levels[cat.levels.length - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. THE 4 INTERACTIVE SELECTS (CLASS, SUBJECT, UNIT, LESSON) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              
              {/* SELECT 1: CLASS / LEVEL */}
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <label className="block text-[10.5px] text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>2. {selectedLanguage === 'Kinyarwanda' ? 'Umwaka (Class / Level)' : 'Class / Level'}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">{plan.className}</span>
                </label>
                <div className="relative">
                  <select
                    value={plan.className}
                    onChange={(e) => handleFieldChange('className', e.target.value)}
                    className="appearance-none w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer pr-7 shadow-inner"
                  >
                    {EDUCATION_CATEGORIES.find(c => c.id === selectedCategory)?.levels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SELECT 2: SUBJECT / ISOMO */}
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <label className="block text-[10.5px] text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>3. {selectedLanguage === 'Kinyarwanda' ? 'Isomo (Subject)' : 'Subject'}</span>
                  <span className="text-[9px] text-emerald-400 font-mono truncate max-w-[100px]">{plan.subject}</span>
                </label>
                <div className="relative">
                  <select
                    value={plan.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    className="appearance-none w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer pr-7 shadow-inner truncate"
                  >
                    {EDUCATION_CATEGORIES.find(c => c.id === selectedCategory)?.subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SELECT 3: UNIT NUMBER & UNIT TITLE */}
              <div className="bg-slate-950/80 p-2.5 rounded-xl border-2 border-emerald-500/70 shadow-lg shadow-emerald-950/40">
                <label className="block text-[10.5px] text-emerald-300 font-bold mb-1 flex items-center justify-between">
                  <span>4. {selectedLanguage === 'Kinyarwanda' ? '👉 Hitamo Umutwe (Select Unit)' : '👉 Select Unit'}</span>
                  <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950 px-1 rounded">
                    {currentCurriculumUnits.length} Units
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCurriculumUnitIndex >= 0 ? selectedCurriculumUnitIndex : (
                      currentCurriculumUnits.findIndex(u => u.unitNumber === plan.unitNumber || u.unitTitleEn === plan.unitTitle || u.unitTitleRw === plan.unitTitle)
                    )}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM' || val === '' || val === '-1') {
                        setSelectedCurriculumUnitIndex(-1);
                        setSelectedCurriculumLessonIndex(-1);
                      } else {
                        const idx = parseInt(val, 10);
                        handleApplyCurriculumUnit(idx);
                      }
                    }}
                    className="appearance-none w-full bg-slate-900 border border-emerald-400 rounded-lg px-2.5 py-2 text-xs font-black text-white focus:border-emerald-300 focus:outline-none cursor-pointer pr-7 shadow-inner"
                  >
                    <option value="">
                      {selectedLanguage === 'Kinyarwanda' ? '👉 Hitamo Umutwe muri Select...' : '👉 Select Unit from dropdown...'}
                    </option>
                    {currentCurriculumUnits.map((u, idx) => (
                      <option key={u.unitNumber + idx} value={idx}>
                        {u.unitNumber}: {selectedLanguage === 'Kinyarwanda' ? (u.unitTitleRw || u.unitTitleEn) : u.unitTitleEn}
                      </option>
                    ))}
                    <option value="CUSTOM">✏️ {selectedLanguage === 'Kinyarwanda' ? 'Andika undi mutwe (Custom)...' : 'Custom Unit (Type manually)...'}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SELECT 4: LESSON NUMBER & LESSON TITLE */}
              <div className="bg-slate-950/80 p-2.5 rounded-xl border-2 border-amber-500/70 shadow-lg shadow-amber-950/40">
                <label className="block text-[10.5px] text-amber-300 font-bold mb-1 flex items-center justify-between">
                  <span>5. {selectedLanguage === 'Kinyarwanda' ? '👉 Hitamo Isomo (Select Lesson)' : '👉 Select Lesson'}</span>
                  <span className="text-[9px] text-amber-300 font-bold bg-amber-950 px-1 rounded">
                    {selectedCurriculumUnitIndex >= 0 && currentCurriculumUnits[selectedCurriculumUnitIndex] ? `${currentCurriculumUnits[selectedCurriculumUnitIndex].lessons.length} Lessons` : 'Select'}
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCurriculumLessonIndex >= 0 ? selectedCurriculumLessonIndex : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM' || val === '' || val === '-1') {
                        setSelectedCurriculumLessonIndex(-1);
                      } else {
                        const idx = parseInt(val, 10);
                        handleApplyCurriculumLesson(idx);
                      }
                    }}
                    disabled={selectedCurriculumUnitIndex < 0 || !currentCurriculumUnits[selectedCurriculumUnitIndex]}
                    className="appearance-none w-full bg-slate-900 border border-amber-400 rounded-lg px-2.5 py-2 text-xs font-black text-white focus:border-amber-300 focus:outline-none cursor-pointer pr-7 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedCurriculumUnitIndex < 0
                        ? (selectedLanguage === 'Kinyarwanda' ? '👉 Banza uhitemo Umutwe ibumoso...' : '👉 Select Unit first...')
                        : (selectedLanguage === 'Kinyarwanda' ? '👉 Hitamo Isomo muri Select...' : '👉 Select Lesson from dropdown...')}
                    </option>
                    {selectedCurriculumUnitIndex >= 0 && currentCurriculumUnits[selectedCurriculumUnitIndex]?.lessons.map((les, lIdx) => (
                      <option key={les.lessonNumber + lIdx} value={lIdx}>
                        {les.lessonNumber}: {selectedLanguage === 'Kinyarwanda' ? (les.lessonTitleRw || les.lessonTitleEn) : les.lessonTitleEn}
                      </option>
                    ))}
                    <option value="CUSTOM">✏️ {selectedLanguage === 'Kinyarwanda' ? 'Andika irindi somo (Custom)...' : 'Custom Lesson (Type manually)...'}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* FEEDBACK STATUS BAR */}
            {(plan.unitTitle || plan.lessonTitle) && (
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{plan.unitNumber}: {plan.unitTitle}</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="font-bold text-amber-300">
                    {plan.lessonNumber}: {plan.lessonTitle}
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-400 italic">
                  {selectedLanguage === 'Kinyarwanda' ? 'Byahiswemo muri REB 2026-2027 byuzura muri Lesson Plan yose!' : 'Auto-populated from 2026-2027 curriculum!'}
                </div>
              </div>
            )}

          </div>
          
          {/* TAB 1: EXACT 1-PAGE OFFICIAL REB DOCUMENT VIEW */}
          {activeTab === 'sheet' && (
            <div className={`appearance-none w-full flex flex-col items-center transition-all ${pageOrientation === 'landscape' ? 'max-w-[1140px]' : 'max-w-[850px]'}`}>
              
              {/* HELPER HINT & LANGUAGE QUICK BAR */}
              <div className="no-print print:hidden appearance-none w-full mb-3 flex flex-wrap items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-300 gap-2.5 shadow-lg">
                <div className="appearance-none flex flex-wrap items-center gap-2">
                  <div className="appearance-none flex items-center gap-1.5 font-bold text-slate-200">
                    <Languages className="w-4 h-4 text-emerald-400" />
                    <span>Lesson Language:</span>
                  </div>
                  <div className="appearance-none flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {languagesConfig.map(lang => {
                      const isSelected = selectedLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-300 scale-105'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                          title={`Switch language and content to ${lang.name}`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="appearance-none flex flex-wrap items-center gap-2">
                  <span className="appearance-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1-Page Guaranteed</span>
                  </span>
                  <button
                    onClick={handleAiAutoFill}
                    disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities}
                    className="appearance-none text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] underline cursor-pointer ml-1"
                  >
                    <Sparkles className="appearance-none w-3 h-3" />
                    <span>AI Fresh Wording (3 Fields)</span>
                  </button>
                  <button
                    onClick={handleExpandContent}
                    disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities || isExplainingCompetences}
                    className="appearance-none text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px] underline cursor-pointer ml-2"
                    title="Expand Teacher and Student Activities into very detailed pedagogical descriptions"
                  >
                    <Maximize2 className={`appearance-none w-3 h-3 ${isExpandingActivities ? 'animate-pulse' : ''}`} />
                    <span>{isExpandingActivities ? 'Expanding...' : (selectedLanguage === 'Kinyarwanda' ? 'Kwagura Amagambo (AI Expand)' : 'AI Expand Content')}</span>
                  </button>
                  <button
                    onClick={handleAiExplainCompetences}
                    disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities || isExplainingCompetences}
                    className="appearance-none text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-[11px] underline cursor-pointer ml-2"
                    title={selectedLanguage === 'Kinyarwanda' ? "Koresha AI isobanure neza Ubushobozi rusange n'Ibibazo byambukiranya" : "Generate pedagogical explanations for Generic Competences & Cross-Cutting Issues"}
                  >
                    <Sparkles className={`appearance-none w-3 h-3 ${isExplainingCompetences ? 'animate-spin' : ''}`} />
                    <span>{isExplainingCompetences ? '...' : (selectedLanguage === 'Kinyarwanda' ? 'AI Sobanura Ubumenyi' : 'AI Explain Competences')}</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC PRINT MEDIA STYLES */}
              <style>{`
                @media print {
                  @page {
                    size: A4 ${pageOrientation} !important;
                    margin: ${pageOrientation === 'landscape' ? '4mm 6mm' : '5mm 6mm'} !important;
                  }
                  html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    height: 100% !important;
                    overflow: hidden !important;
                  }
                  #cbc-one-page-document {
                    width: 100% !important;
                    max-width: 100% !important;
                    height: 100% !important;
                    min-height: ${pageOrientation === 'landscape' ? '192mm' : '280mm'} !important;
                    max-height: ${pageOrientation === 'landscape' ? '196mm' : '285mm'} !important;
                    box-shadow: none !important;
                    border: 1px solid #000 !important;
                    padding: ${pageOrientation === 'landscape' ? '3mm 5mm' : '4mm 6mm'} !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    page-break-before: avoid !important;
                    page-break-after: avoid !important;
                    overflow: hidden !important;
                  }
                  table {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    page-break-after: avoid !important;
                  }
                  tr, td, th, tbody, thead {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                  }
                }
              `}</style>

              {/* 1-PAGE OFFICIAL REB PRINTABLE SHEET (MATCHES LP TEMPLATE.JPG EXACTLY) */}
              <div 
                id="cbc-one-page-document"
                ref={printSheetRef}
                className={`appearance-none w-full bg-white text-black shadow-2xl rounded-sm border border-slate-400 font-sans select-text ${
                  isPortrait 
                    ? 'max-w-[850px] mx-auto min-h-[1050px] p-5 sm:p-7 text-[10.5px] sm:text-[11px] leading-normal flex flex-col justify-between' 
                    : 'p-3 sm:p-5 text-[9.5px] sm:text-[10px] leading-tight'
                }`}
                style={{
                  boxSizing: 'border-box',
                  color: '#000000',
                  backgroundColor: '#ffffff'
                }}
              >
                
                {/* OFFICIAL GRAY -25% ACCENT HEADER BANNER */}
                <div className="appearance-none text-center bg-gray-200 print:bg-gray-200 text-black py-1 px-3 border border-black rounded-sm mb-2.5 shadow-sm font-bold uppercase tracking-wider text-xs sm:text-sm">
                  {SHEET_LABELS[selectedLanguage].docHeaderTitle || 'LESSON PLAN'}
                </div>

                {/* TOP HEADER: SCHOOL NAME (LEFT ARM) & TEACHER'S NAME (RIGHT ARM) */}
                <div className="appearance-none flex flex-row items-center justify-between mb-2.5 gap-3 text-xs font-semibold w-full">
                  <div className="appearance-none flex items-baseline gap-1.5 flex-1 min-w-0 text-left justify-start">
                    <span className="appearance-none font-bold whitespace-nowrap text-black">
                      {renderRedStarLabel(SHEET_LABELS[selectedLanguage].schoolName)}
                    </span>
                    <input 
                      type="text" 
                      value={plan.schoolName} 
                      onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                      placeholder="School name..."
                      className="print:hidden border-b border-dotted border-black px-1.5 py-0.5 text-xs font-bold text-black w-full focus:outline-none focus:bg-amber-50 focus:border-solid text-left"
                    />
                    <span className="hidden print:inline-block font-bold text-black border-b border-black text-left flex-1">
                      {plan.schoolName || '................................'}
                    </span>
                  </div>
                  <div className="appearance-none flex items-baseline gap-1.5 flex-1 min-w-0 text-right justify-end">
                    <span className="appearance-none font-bold whitespace-nowrap text-black">
                      {renderRedStarLabel(SHEET_LABELS[selectedLanguage].teacherName)}
                    </span>
                    <input 
                      type="text" 
                      value={plan.teacherName} 
                      onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                      placeholder="Teacher's name..."
                      className="print:hidden border-b border-dotted border-black px-1.5 py-0.5 text-xs font-bold text-black w-full focus:outline-none focus:bg-amber-50 focus:border-solid text-right"
                    />
                    <span className="hidden print:inline-block font-bold text-black border-b border-black text-right flex-1">
                      {plan.teacherName || '................................'}
                    </span>
                  </div>
                </div>

                {/* TABLE 1: HEADER ATTRIBUTES */}
                <table className="table-fixed appearance-none w-full border-collapse border border-black mb-0 text-[10px] sm:text-[10.5px]">
                  <thead>
                    <tr className="appearance-none bg-gray-200 print:bg-gray-200 text-black text-center font-bold">
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[6%]' : 'w-[8%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].term)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[10%]' : 'w-[13%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].date)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[20%]' : 'w-[19%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].subject)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[10%]' : 'w-[12%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].classLevel)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[10%]' : 'w-[11%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].unitNo)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[11%]' : 'w-[11%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].lessonNo)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[15%]' : 'w-[13%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].duration)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[18%]' : 'w-[13%]'} bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].classSize)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="appearance-none text-center font-medium">
                      <td className={`border border-black ${cellPadding} relative group`}>
                        <div className="hidden print:block font-bold text-center">{plan.term}</div>
                        <div className="print:hidden">
                          <select  
                            value={plan.term} 
                            onChange={(e) => handleFieldChange('term', e.target.value)}
                            className="appearance-none w-full text-center focus:outline-none focus:bg-amber-50 text-[10.5px] font-bold bg-transparent border-0 cursor-pointer" 
                          >
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} relative group`}>
                        <div className="hidden print:block font-medium text-center">{plan.date}</div>
                        <div className="print:hidden">
                          <input 
                            type="date" 
                            value={plan.date} 
                            onChange={(e) => handleFieldChange('date', e.target.value)}
                            onClick={(e) => {
                              try { (e.target as any).showPicker?.(); } catch (err) {}
                            }}
                            className="appearance-none w-full text-center focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent font-medium cursor-pointer" 
                          />
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} font-bold relative group`}>
                        <div className="hidden print:block font-bold text-center truncate">{plan.subject}</div>
                        <div className="print:hidden">
                          <select  
                            value={plan.subject} 
                            onChange={(e) => handleFieldChange('subject', e.target.value)}
                            className="appearance-none w-full text-center font-bold focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent border-0 cursor-pointer" 
                          >
                            {EDUCATION_CATEGORIES.map(cat => (
                              <optgroup key={cat.id} label={getCategoryTitle(cat, selectedLanguage)}>
                                {getCategorySubjects(cat, selectedLanguage).map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </optgroup>
                            ))}
                            {!EDUCATION_CATEGORIES.some(c => c.subjects.includes(plan.subject) || getCategorySubjects(c, selectedLanguage).includes(plan.subject)) && (
                              <option value={plan.subject}>{plan.subject}</option>
                            )}
                          </select>
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} font-bold relative group`}>
                        <div className="hidden print:block font-bold text-center">{plan.className}</div>
                        <div className="print:hidden">
                          <select  
                            value={plan.className} 
                            onChange={(e) => {
                              const newClass = e.target.value;
                              handleFieldChange('className', newClass);
                              setSelectedCategory(getCategoryFromClass(newClass));
                            }}
                            className="appearance-none w-full text-center font-bold focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent border-0 cursor-pointer" 
                          >
                            {EDUCATION_CATEGORIES.map(cat => (
                              <optgroup key={cat.id} label={getCategoryTitle(cat, selectedLanguage)}>
                                {cat.levels.map(lvl => (
                                  <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} relative group`}>
                        <div className="hidden print:block font-medium text-center">{plan.unitNumber}</div>
                        <div className="print:hidden">
                          {currentCurriculumUnits.length > 0 ? (
                            <select
                              value={plan.unitNumber || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'CUSTOM') {
                                  setIsEditing(true);
                                } else {
                                  const uIdx = currentCurriculumUnits.findIndex(u => u.unitNumber === val);
                                  if (uIdx >= 0) {
                                    handleApplyCurriculumUnit(uIdx);
                                  } else {
                                    handleFieldChange('unitNumber', val);
                                  }
                                }
                              }}
                              className="appearance-none w-full text-center font-bold focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent border-0 cursor-pointer"
                              title="Hitamo Umutwe (Select Unit)"
                            >
                              <option value="">Select...</option>
                              {currentCurriculumUnits.map((u, idx) => (
                                <option key={u.unitNumber + idx} value={u.unitNumber}>
                                  {u.unitNumber}
                                </option>
                              ))}
                              <option value="CUSTOM">✏️ Andika...</option>
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={plan.unitNumber} 
                              onChange={(e) => handleFieldChange('unitNumber', e.target.value)}
                              className="print:hidden appearance-none w-full text-center focus:outline-none focus:bg-amber-50 text-[10.5px]" 
                            />
                          )}
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} relative group`}>
                        <div className="hidden print:block font-medium text-center">{plan.lessonNumber}</div>
                        <div className="print:hidden">
                          {((selectedCurriculumUnitIndex >= 0 ? currentCurriculumUnits[selectedCurriculumUnitIndex]?.lessons : currentCurriculumUnits[0]?.lessons) || []).length > 0 ? (
                            <select
                              value={plan.lessonNumber || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'CUSTOM') {
                                  setIsEditing(true);
                                } else {
                                  const activeUnit = selectedCurriculumUnitIndex >= 0 ? currentCurriculumUnits[selectedCurriculumUnitIndex] : currentCurriculumUnits[0];
                                  const lIdx = activeUnit?.lessons.findIndex(l => l.lessonNumber === val);
                                  if (lIdx !== undefined && lIdx >= 0) {
                                    handleApplyCurriculumLesson(lIdx);
                                  } else {
                                    handleFieldChange('lessonNumber', val);
                                  }
                                }
                              }}
                              className="appearance-none w-full text-center font-bold focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent border-0 cursor-pointer"
                              title="Hitamo Isomo (Select Lesson)"
                            >
                              <option value="">Select...</option>
                              {((selectedCurriculumUnitIndex >= 0 ? currentCurriculumUnits[selectedCurriculumUnitIndex]?.lessons : currentCurriculumUnits[0]?.lessons) || []).map((les, idx) => (
                                <option key={les.lessonNumber + idx} value={les.lessonNumber}>
                                  {les.lessonNumber}
                                </option>
                              ))}
                              <option value="CUSTOM">✏️ Andika...</option>
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={plan.lessonNumber} 
                              onChange={(e) => handleFieldChange('lessonNumber', e.target.value)}
                              className="print:hidden appearance-none w-full text-center focus:outline-none focus:bg-amber-50 text-[10.5px]" 
                            />
                          )}
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} relative group`}>
                        <div className="hidden print:block font-medium text-center">{plan.duration}</div>
                        <div className="print:hidden flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = plan.duration || '40 min';
                              const match = currentVal.match(/\d+/);
                              const num = match ? parseInt(match[0], 10) : 40;
                              const newNum = Math.max(5, num - 5);
                              const updated = currentVal.replace(/\d+/, newNum.toString());
                              handleFieldChange('duration', match ? updated : `${newNum} min`);
                            }}
                            className="no-print opacity-0 group-hover:opacity-100 text-slate-500 hover:text-black font-bold px-1 transition-opacity text-xs"
                            title="Gabanya (-5 min)"
                          >
                            -
                          </button>
                          <input 
                            type="text" 
                            value={plan.duration} 
                            onChange={(e) => handleFieldChange('duration', e.target.value)}
                            className="appearance-none w-full text-center focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent border-0" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = plan.duration || '40 min';
                              const match = currentVal.match(/\d+/);
                              const num = match ? parseInt(match[0], 10) : 40;
                              const newNum = num + 5;
                              const updated = currentVal.replace(/\d+/, newNum.toString());
                              handleFieldChange('duration', match ? updated : `${newNum} min`);
                            }}
                            className="no-print opacity-0 group-hover:opacity-100 text-slate-500 hover:text-black font-bold px-1 transition-opacity text-xs"
                            title="Ongera (+5 min)"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} font-semibold relative group`}>
                        <div className="hidden print:block font-semibold text-center">{plan.classSize}</div>
                        <div className="print:hidden flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = parseInt(plan.classSize, 10) || 0;
                              if (currentVal > 1) {
                                handleFieldChange('classSize', (currentVal - 1).toString());
                              }
                            }}
                            className="no-print opacity-0 group-hover:opacity-100 text-slate-500 hover:text-black font-bold px-1 transition-opacity text-xs"
                            title="Gabanya (-)"
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            min={1}
                            value={plan.classSize} 
                            onChange={(e) => handleFieldChange('classSize', e.target.value)}
                            className="appearance-none w-full text-center font-semibold focus:outline-none focus:bg-amber-50 text-[10.5px] bg-transparent border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = parseInt(plan.classSize, 10) || 0;
                              handleFieldChange('classSize', (currentVal + 1).toString());
                            }}
                            className="no-print opacity-0 group-hover:opacity-100 text-slate-500 hover:text-black font-bold px-1 transition-opacity text-xs"
                            title="Ongera (+)"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* TABLE 2: CORE LESSON DETAILS (SPECIAL NEEDS TO REFERENCES) */}
                <table className="table-fixed appearance-none w-full border-collapse border-l border-r border-b border-black mb-0 text-[10px] sm:text-[10.5px]">
                  <tbody>
                    
                    {/* SPECIAL EDUCATIONAL NEEDS */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].specialNeeds)}
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.specialNeeds || (selectedLanguage === 'Kinyarwanda' ? 'Nta bibazo byihariye byagaragaye' : 'None identified')}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(2, (plan.specialNeeds || '').split('\n').length)}
                            value={plan.specialNeeds}
                            onChange={(e) => handleFieldChange('specialNeeds', e.target.value)}
                            placeholder="Special needs details..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* UNIT TITLE */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].unitTitle)}
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        {currentCurriculumUnits.length > 0 && (
                          <div className="print:hidden mb-1">
                            <select
                              value={currentCurriculumUnits.findIndex(u => u.unitTitleEn === plan.unitTitle || u.unitTitleRw === plan.unitTitle)}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'CUSTOM') {
                                  setIsEditing(true);
                                } else {
                                  const idx = parseInt(val, 10);
                                  if (!isNaN(idx) && idx >= 0) handleApplyCurriculumUnit(idx);
                                }
                              }}
                              className="appearance-none text-[10px] w-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 rounded px-2 py-0.5 cursor-pointer font-bold focus:outline-none"
                              title="Hitamo Umutwe (Select Unit)"
                            >
                              <option value="-1">👉 Hitamo Umutwe muri Select...</option>
                              {currentCurriculumUnits.map((u, idx) => (
                                <option key={u.unitNumber + idx} value={idx}>
                                  {u.unitNumber}: {selectedLanguage === 'Kinyarwanda' ? (u.unitTitleRw || u.unitTitleEn) : u.unitTitleEn}
                                </option>
                              ))}
                              <option value="CUSTOM">✏️ Andika undi mutwe (Custom)...</option>
                            </select>
                          </div>
                        )}
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words font-semibold leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.unitTitle}
                        </div>
                        {isEditing && (
                          <input
                            type="text"
                            value={plan.unitTitle}
                            onChange={(e) => handleFieldChange('unitTitle', e.target.value)}
                            placeholder="Unit title..."
                            className="appearance-none w-full focus:outline-none focus:bg-amber-50 font-semibold text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* KEY UNIT COMPETENCE */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].keyUnitCompetence)}
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.keyUnitCompetence}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(2, (plan.keyUnitCompetence || '').split('\n').length)}
                            value={plan.keyUnitCompetence}
                            onChange={(e) => handleFieldChange('keyUnitCompetence', e.target.value)}
                            placeholder="Key unit competence..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* TITLE OF THE LESSON */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].lessonTitle)}
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        {((selectedCurriculumUnitIndex >= 0 ? currentCurriculumUnits[selectedCurriculumUnitIndex]?.lessons : currentCurriculumUnits[0]?.lessons) || []).length > 0 && (
                          <div className="print:hidden mb-1">
                            <select
                              value={selectedCurriculumLessonIndex >= 0 ? selectedCurriculumLessonIndex : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'CUSTOM') {
                                  setIsEditing(true);
                                } else {
                                  const idx = parseInt(val, 10);
                                  if (!isNaN(idx) && idx >= 0) handleApplyCurriculumLesson(idx);
                                }
                              }}
                              className="appearance-none text-[10px] w-full bg-amber-950/80 text-amber-300 border border-amber-500/60 rounded px-2 py-0.5 cursor-pointer font-bold focus:outline-none"
                              title="Hitamo Isomo (Select Lesson)"
                            >
                              <option value="">👉 Hitamo Isomo muri Select...</option>
                              {((selectedCurriculumUnitIndex >= 0 ? currentCurriculumUnits[selectedCurriculumUnitIndex]?.lessons : currentCurriculumUnits[0]?.lessons) || []).map((l, idx) => (
                                <option key={l.lessonNumber + idx} value={idx}>
                                  {l.lessonNumber}: {selectedLanguage === 'Kinyarwanda' ? (l.lessonTitleRw || l.lessonTitleEn) : l.lessonTitleEn}
                                </option>
                              ))}
                              <option value="CUSTOM">✏️ Andika irindi somo (Custom)...</option>
                            </select>
                          </div>
                        )}
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words font-bold leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.lessonTitle}
                        </div>
                        {isEditing && (
                          <input
                            type="text"
                            value={plan.lessonTitle}
                            onChange={(e) => handleFieldChange('lessonTitle', e.target.value)}
                            placeholder="Title of lesson..."
                            className="appearance-none w-full focus:outline-none focus:bg-amber-50 font-bold text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* INSTRUCTIONAL OBJECTIVE (AI GENERATED / EDITABLE) */}
                    <tr className="appearance-none bg-amber-50/10 print:bg-transparent">
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        <div className="appearance-none flex items-center justify-between">
                          <span>
                            {renderRedStarLabel(SHEET_LABELS[selectedLanguage].instructionalObjective)}
                          </span>
                          <button
                            type="button"
                            onClick={handleAiRegenerateObjective}
                            disabled={isGeneratingAi || isTranslatingPlan}
                            className="print:hidden no-print text-[9px] font-bold bg-amber-500 hover:bg-amber-400 text-black px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm ml-1"
                            title={selectedLanguage === 'Kinyarwanda' ? "Vugurura Intego y'isomo mu buryo bwa REB (nta 'By the end of this lesson')" : "Regenerate SMART Objective adhering to REB standard (without 'By the end of this lesson')"}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI</span>
                          </button>
                        </div>
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words font-medium leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.instructionalObjective}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(3, (plan.instructionalObjective || '').split('\n').length)}
                            value={plan.instructionalObjective}
                            onChange={(e) => handleFieldChange('instructionalObjective', e.target.value)}
                            placeholder={
                              selectedLanguage === 'Kinyarwanda'
                                ? "Hifashishijwe amakarita y'imibare n'ingero ziri ku kibaho, abanyeshuri bo mu mwaka wa P6 bazaba bashobora gukora imibare mu buryo bw'ukuri mu gihe cy'iminota 40."
                                : "By using fraction cards and chalkboard examples, Primary 6 (P6) learners will be able to multiply a whole number by a fraction correctly within 40 minutes."
                            }
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-100/50 leading-tight font-medium text-[10.5px] p-0.5"
                          />
                        )}
                        <div className="print:hidden block text-[8px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-bold leading-normal">
                          {selectedLanguage === 'Kinyarwanda'
                            ? "Uburyo bwa REB: Hifashishijwe [imfashanyigisho n'ingero ku kibaho], abanyeshuri bo mu mwaka wa [P6] bazaba bashobora [igikorwa] mu buryo bw'ukuri mu gihe cy'iminota [40]. (Ntabwo hakoreshwa 'By the end of this lesson')"
                            : "REB Standard: By using [learning materials] and chalkboard examples, [Class] learners will be able to [action verb & content] correctly within [time]. (Without 'By the end of this lesson')"}
                        </div>
                      </td>
                    </tr>

                    {/* PLAN FOR THIS CLASS (LOCATION: IN / OUTSIDE) */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].planForClass)} <span className="font-normal text-[9px] text-slate-600">{SHEET_LABELS[selectedLanguage].locationSub}</span>
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} relative group align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} font-medium text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {formatLocationForDisplay(plan.classLocation, selectedLanguage)}
                        </div>
                        {isEditing && (
                          <div className="print:hidden">
                            <select 
                              value={plan.classLocation}
                              onChange={(e) => handleFieldChange('classLocation', e.target.value)}
                              className="appearance-none w-full focus:outline-none focus:bg-amber-50 bg-transparent border-0 font-medium text-[10.5px] cursor-pointer p-0.5"
                            >
                              <option value="Inside the classroom">{selectedLanguage === 'Kinyarwanda' ? "Mu cyumba cy'ishuri" : selectedLanguage === 'Français' ? "En classe" : selectedLanguage === 'Kiswahili' ? "Ndani ya darasa" : "Inside the classroom"}</option>
                              <option value="Inside the Library room">{selectedLanguage === 'Kinyarwanda' ? "Mu isomero" : selectedLanguage === 'Français' ? "Dans la bibliothèque" : selectedLanguage === 'Kiswahili' ? "Maktabani" : "Inside the Library room"}</option>
                              <option value="Inside the ICT room">{selectedLanguage === 'Kinyarwanda' ? "Muri salle ya mudasobwa" : selectedLanguage === 'Français' ? "En salle informatique" : selectedLanguage === 'Kiswahili' ? "Chumba cha TEHAMA" : "Inside the ICT room"}</option>
                              <option value="Inside the Laboratory room">{selectedLanguage === 'Kinyarwanda' ? "Muri Laboratwari" : selectedLanguage === 'Français' ? "En laboratoire" : selectedLanguage === 'Kiswahili' ? "Maabara" : "Inside the Laboratory room"}</option>
                              <option value="Outside the classroom">{selectedLanguage === 'Kinyarwanda' ? "Hanze y'icyumba cy'ishuri" : selectedLanguage === 'Français' ? "Hors de la classe" : selectedLanguage === 'Kiswahili' ? "Nje ya darasa" : "Outside the classroom"}</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* LEARNING MATERIALS (FOR ALL LEARNERS) */}
                    <tr className="appearance-none bg-amber-50/10 print:bg-transparent">
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].learningMaterials)} <span className="font-normal text-[9px] text-slate-600">{SHEET_LABELS[selectedLanguage].materialsSub}</span>
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.learningMaterials}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(2, (plan.learningMaterials || '').split('\n').length)}
                            value={plan.learningMaterials}
                            onChange={(e) => handleFieldChange('learningMaterials', e.target.value)}
                            placeholder="Concrete manipulatives, textbooks, charts..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-100/50 leading-tight text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* REFERENCES */}
                    <tr className="appearance-none bg-amber-50/10 print:bg-transparent">
                      <td className={`border border-black ${cellPadding} font-bold ${labelColW} align-top bg-gray-200 print:bg-gray-200 text-black`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].references)}
                      </td>
                      <td className={`border border-black ${cellPadding} ${valueColW} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words font-medium leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.references}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(2, (plan.references || '').split('\n').length)}
                            value={plan.references}
                            onChange={(e) => handleFieldChange('references', e.target.value)}
                            placeholder="REB Revised Syllabus (2024-2026), Textbook titles, units & matching page numbers..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-100/50 leading-tight font-medium text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                  </tbody>
                </table>

                 {/* TABLE 3: DESCRIPTION OF TEACHING/LEARNING ACTIVITIES */}
                <table className="table-fixed appearance-none w-full border-collapse border-l border-r border-b border-black mb-0 text-[10px] sm:text-[10.5px]">
                  <thead>
                    <tr className="appearance-none bg-gray-200 print:bg-gray-200 text-black text-center font-bold">
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[10%]' : 'w-[11%]'} align-middle bg-gray-200 text-black`} rowSpan={3}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].timing)}
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[68%]' : 'w-[61%]'} bg-gray-200 text-black`} colSpan={2}>
                        <div className="flex items-center justify-between px-1">
                          <span>{renderRedStarLabel(SHEET_LABELS[selectedLanguage].descActivities)}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleAiAutoFill}
                              disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities}
                              className="print:hidden no-print text-[9px] font-bold bg-amber-500 hover:bg-amber-400 text-black px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              title="Auto-fill all pedagogical activities using advanced AI"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>{isGeneratingAi ? '...' : (selectedLanguage === 'Kinyarwanda' ? 'Uzuza Ibikorwa' : 'AI Fill')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleExpandContent}
                              disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities}
                              className="print:hidden no-print text-[9px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              title="Expand activities into extremely detailed breakdowns"
                            >
                              <Maximize2 className={`w-2.5 h-2.5 ${isExpandingActivities ? 'animate-pulse' : ''}`} />
                              <span>{isExpandingActivities ? '...' : (selectedLanguage === 'Kinyarwanda' ? 'Wagura Amagambo' : 'AI Expand')}</span>
                            </button>
                          </div>
                        </div>
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[22%]' : 'w-[28%]'} align-middle bg-gray-200 text-black`} rowSpan={3}>
                        <div className="flex flex-col items-center justify-center gap-1 px-1 py-0.5">
                          <span className="leading-tight text-center">{SHEET_LABELS[selectedLanguage].competencesAndCrossCutting}</span>
                          <button
                            type="button"
                            onClick={handleAiExplainCompetences}
                            disabled={isExplainingCompetences || isGeneratingAi || isTranslatingPlan || isExpandingActivities}
                            className="print:hidden no-print text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-sm mt-0.5"
                            title={selectedLanguage === 'Kinyarwanda' ? "Koresha AI isobanure neza Ubushobozi rusange n'Ibibazo byambukiranya mu ntambwe zose z'isomo" : "Generate rich pedagogical explanations for Generic Competences & Cross-Cutting Issues"}
                          >
                            <Sparkles className={`w-2.5 h-2.5 ${isExplainingCompetences ? 'animate-spin' : ''}`} />
                            <span>{isExplainingCompetences ? '...' : (selectedLanguage === 'Kinyarwanda' ? 'AI Sobanura' : 'AI Explain')}</span>
                          </button>
                        </div>
                      </th>
                    </tr>
                    <tr className="appearance-none bg-white print:bg-white text-left font-normal">
                      <th colSpan={2} className={`border border-black ${cellPadding} align-top bg-white print:bg-white`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words min-h-[16px] leading-tight text-[10px] sm:text-[10.5px] font-normal cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors bg-white print:bg-white`}
                        >
                          {plan.descActivities || (
                            selectedLanguage === 'Kinyarwanda' 
                              ? "Ibikorwa bibandanda ku munyeshuri bizwiho gukoresha imfashanyigisho zifatika, gukorera mu matsinda, kwandika ku mbaho, no gukora isuzuma risoza isomo."
                              : selectedLanguage === 'Français'
                              ? "Activités interactives centrées sur l'apprenant combinant supports concrets, travail en équipe, exercices sur ardoises et évaluation formative."
                              : selectedLanguage === 'Kiswahili'
                              ? "Shughuli shirikishi zinazomlenga mwanafunzi zikitumia vifaa halisi, kazi za vikundi, mazoezi ya vibao na tathmini ya kuelewa somo."
                              : "Interactive learner-centered activities using concrete manipulatives, pair work, slate practice, group problem solving, and diagnostic exit tickets."
                          )}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(2, (plan.descActivities || '').split('\n').length)}
                            value={plan.descActivities || ''}
                            onChange={(e) => handleFieldChange('descActivities', e.target.value)}
                            placeholder={
                              selectedLanguage === 'Kinyarwanda' 
                                ? "Ibikorwa bibandanda ku munyeshuri bizwiho gukoresha imfashanyigisho zifatika, gukorera mu matsinda..."
                                : "Interactive learner-centered activities using concrete manipulatives..."
                            }
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] sm:text-[10.5px] font-normal p-0.5"
                          />
                        )}
                      </th>
                    </tr>
                    <tr className="appearance-none bg-white text-center font-bold">
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[34%]' : 'w-[30.5%]'}`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].teacherActivities)}
                        <div className="text-[8px] font-normal text-slate-500 mt-0.5 leading-normal">
                          {selectedLanguage === 'Kinyarwanda' ? "Ibikorwa mwarimu azaba akorera abanyeshuri" : "Actions/Activities the teacher does for the learners"}
                        </div>
                      </th>
                      <th className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[34%]' : 'w-[30.5%]'}`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].learnerActivities)}
                        <div className="text-[8px] font-normal text-slate-500 mt-0.5 leading-normal">
                          {selectedLanguage === 'Kinyarwanda' ? "Ibikorwa abanyeshuri bakora mu isomo" : "Activities/Actions performed by learners in the lesson"}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* STEP 1: INTRODUCTION */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold text-center align-top bg-gray-200`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].intro)}<br />
                        <div className="font-bold text-center mt-1 border-t border-dotted border-black pt-0.5 text-[9.5px]">
                          {plan.timingIntro}
                        </div>
                        {isEditing && (
                          <input
                            type="text"
                            value={plan.timingIntro}
                            onChange={(e) => handleFieldChange('timingIntro', e.target.value)}
                            placeholder="10 min"
                            className="appearance-none w-full text-center text-[10px] font-bold mt-1 border-t border-dotted border-black focus:outline-none focus:bg-amber-50"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[35px]' : ''}`}
                        >
                          {formatBulletSpacing(plan.teacherActivityIntro)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(4, (plan.teacherActivityIntro || '').split('\n').length)}
                            value={plan.teacherActivityIntro}
                            onChange={(e) => handleFieldChange('teacherActivityIntro', e.target.value)}
                            placeholder="Teacher's introductory hook and setup..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[35px]' : ''}`}
                        >
                          {formatBulletSpacing(plan.learnerActivityIntro)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(4, (plan.learnerActivityIntro || '').split('\n').length)}
                            value={plan.learnerActivityIntro}
                            onChange={(e) => handleFieldChange('learnerActivityIntro', e.target.value)}
                            placeholder="Learners' response and setup..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[35px]' : ''}`}
                        >
                          {formatGenericCompetenceSpacing(plan.genericCompetencesIntro)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(3, (plan.genericCompetencesIntro || '').split('\n').length)}
                            value={plan.genericCompetencesIntro}
                            onChange={(e) => handleFieldChange('genericCompetencesIntro', e.target.value)}
                            placeholder={
                              selectedLanguage === 'Kinyarwanda' 
                                ? "• Gushungura no gutekereza cyane: Birazamurwa mu gihe abanyeshuri bakora imyitozo yo kubara mu mutwe...\n• Uburinganire: Mwarimu aha amahirwe angana abahungu n'abakobwa..."
                                : "• Critical Thinking: Developed when learners calculate mental math on slates...\n• Gender Education: Promoted by ensuring balanced participation..."
                            }
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* STEP 2: DEVELOPMENT */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold text-center align-top bg-gray-200`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].dev)}<br />
                        <div className="font-bold text-center mt-1 border-t border-dotted border-black pt-0.5 text-[9.5px]">
                          {plan.timingDev}
                        </div>
                        {isEditing && (
                          <input
                            type="text"
                            value={plan.timingDev}
                            onChange={(e) => handleFieldChange('timingDev', e.target.value)}
                            placeholder="20 min"
                            className="appearance-none w-full text-center text-[10px] font-bold mt-1 border-t border-dotted border-black focus:outline-none focus:bg-amber-50"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[65px]' : ''}`}
                        >
                          {formatBulletSpacing(plan.teacherActivityDev)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(5, (plan.teacherActivityDev || '').split('\n').length)}
                            value={plan.teacherActivityDev}
                            onChange={(e) => handleFieldChange('teacherActivityDev', e.target.value)}
                            placeholder="Core concept scaffolding, guiding collaborative group tasks..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[65px]' : ''}`}
                        >
                          {formatBulletSpacing(plan.learnerActivityDev)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(5, (plan.learnerActivityDev || '').split('\n').length)}
                            value={plan.learnerActivityDev}
                            onChange={(e) => handleFieldChange('learnerActivityDev', e.target.value)}
                            placeholder="Active group exploration, calculation, problem solving..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[65px]' : ''}`}
                        >
                          {formatGenericCompetenceSpacing(plan.genericCompetencesDev)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(3, (plan.genericCompetencesDev || '').split('\n').length)}
                            value={plan.genericCompetencesDev}
                            onChange={(e) => handleFieldChange('genericCompetencesDev', e.target.value)}
                            placeholder={
                              selectedLanguage === 'Kinyarwanda' 
                                ? "• Ubufatanye n'itumanaho: Abanyeshuri bafatanya mu matsinda y'ubushobozi buvanze...\n• Uburezi budahezaza: Abanyeshuri bafite ubumuga bicazwa imbere..."
                                : "• Cooperation & Communication: Fostered as learners collaborate in small groups...\n• Inclusive Education: Addressed by pairing SEN pupils with supportive peers..."
                            }
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                    {/* STEP 3: CONCLUSION */}
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold text-center align-top bg-gray-200`}>
                        {renderRedStarLabel(SHEET_LABELS[selectedLanguage].concl)}<br />
                        <div className="font-bold text-center mt-1 border-t border-dotted border-black pt-0.5 text-[9.5px]">
                          {plan.timingConcl}
                        </div>
                        {isEditing && (
                          <input
                            type="text"
                            value={plan.timingConcl}
                            onChange={(e) => handleFieldChange('timingConcl', e.target.value)}
                            placeholder="10 min"
                            className="appearance-none w-full text-center text-[10px] font-bold mt-1 border-t border-dotted border-black focus:outline-none focus:bg-amber-50"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[35px]' : ''}`}
                        >
                          {formatBulletSpacing(plan.teacherActivityConcl)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(3, (plan.teacherActivityConcl || '').split('\n').length)}
                            value={plan.teacherActivityConcl}
                            onChange={(e) => handleFieldChange('teacherActivityConcl', e.target.value)}
                            placeholder="Diagnostic exit ticket check, summary, homework assignment..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[35px]' : ''}`}
                        >
                          {formatBulletSpacing(plan.learnerActivityConcl)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(3, (plan.learnerActivityConcl || '').split('\n').length)}
                            value={plan.learnerActivityConcl}
                            onChange={(e) => handleFieldChange('learnerActivityConcl', e.target.value)}
                            placeholder="Exit ticket self-check, homework recording..."
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                      <td className={`border border-black ${cellPadding} align-top`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-tight text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors ${isPortrait ? 'min-h-[35px]' : ''}`}
                        >
                          {formatGenericCompetenceSpacing(plan.genericCompetencesConcl)}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(3, (plan.genericCompetencesConcl || '').split('\n').length)}
                            value={plan.genericCompetencesConcl}
                            onChange={(e) => handleFieldChange('genericCompetencesConcl', e.target.value)}
                            placeholder={
                              selectedLanguage === 'Kinyarwanda' 
                                ? "• Kwiga ubuzima bwose: Abanyeshuri bashishikarizwa guhuza ubumenyi bahawe n'imikoreshereze yabwo mu rugo...\n• Kwicungira umwanya: Abanyeshuri basoza isuzuma ku gihe..."
                                : "• Lifelong Learning: Cultivated by guiding learners to reflect on daily real-world connections...\n• Peace & Values: Nurtured through respectful active listening..."
                            }
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-tight text-[10px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>

                  </tbody>
                </table>

                {/* TABLE 4: TEACHER SELF-EVALUATION */}
                <table className="table-fixed appearance-none w-full border-collapse border-l border-r border-b border-black text-[10px] sm:text-[10.5px]">
                  <tbody>
                    <tr>
                      <td className={`border border-black ${cellPadding} font-bold ${pageOrientation === 'landscape' ? 'w-[20%]' : 'w-[28.4%]'} align-middle bg-gray-200`}>
                        <div>{renderRedStarLabel(SHEET_LABELS[selectedLanguage].teacherSelfEval)}</div>
                      </td>
                      <td className={`border border-black ${cellPadding} ${pageOrientation === 'landscape' ? 'w-[80%]' : 'w-[71.6%]'} align-middle bg-gray-200`}>
                        <div 
                          onClick={() => setIsEditing(true)}
                          title="Click to edit"
                          className={`${isEditing ? 'hidden' : 'block'} whitespace-pre-wrap break-words leading-normal min-h-[16px] text-[10px] sm:text-[10.5px] cursor-pointer hover:bg-amber-50/50 p-0.5 rounded transition-colors`}
                        >
                          {plan.teacherSelfEvaluation && plan.teacherSelfEvaluation.trim() ? (
                            plan.teacherSelfEvaluation
                          ) : (
                            <span className="text-slate-400 italic print:hidden text-[9px]">(Siga ubusa mbere yo kwigisha / Leave blank before lesson)</span>
                          )}
                        </div>
                        {isEditing && (
                          <textarea
                            rows={Math.max(2, (plan.teacherSelfEvaluation || '').split('\n').length)}
                            value={plan.teacherSelfEvaluation}
                            onChange={(e) => handleFieldChange('teacherSelfEvaluation', e.target.value)}
                            placeholder=""
                            className="appearance-none w-full resize-y focus:outline-none focus:bg-amber-50 leading-normal min-h-[22px] text-[10px] sm:text-[10.5px] p-0.5"
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>

            </div>
          )}

          {/* TAB 2: STRUCTURED FORM EDITOR */}
          {activeTab === 'form' && (
            <div className="appearance-none w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
              
              {/* TOP WORKFLOW CONTROL CARD */}
              <div className="appearance-none bg-gradient-to-r from-slate-950 via-emerald-950/60 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="appearance-none text-xs sm:text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                    <Sparkles className="appearance-none w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Teacher Step-by-Step Workflow</span>
                  </h3>
                  <p className="appearance-none text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 leading-snug">
                    1. Fill in required details below <br />
                    2. Click <strong className="appearance-none text-emerald-300">Generate Lesson Plan (AI)</strong> to auto-generate the full plan, or edit manually and click <strong className="appearance-none text-emerald-300">Finish Edit Lesson Plan</strong>.
                  </p>
                </div>
                <div className="appearance-none flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleGenerateFullPlan}
                    disabled={isGeneratingAi || isTranslatingPlan}
                    className="appearance-none bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-300/40 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 text-amber-200 ${isGeneratingAi ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isGeneratingAi ? UI_TEXT[selectedLanguage].writingAi : UI_TEXT[selectedLanguage].generateFullPlan}</span>
                  </button>

                  <button
                    onClick={handleToggleEditMode}
                    className="appearance-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-400/40 cursor-pointer"
                  >
                    <CheckCircle className="appearance-none w-4 h-4 text-emerald-200" />
                    <span>{UI_TEXT[selectedLanguage].finishEditPlan}</span>
                  </button>
                </div>
              </div>

              {/* SECTION A: BASIC ADMINISTRATIVE INFO */}
              <div>
                <div className="appearance-none flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="appearance-none text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="appearance-none w-4 h-4" />
                    <span>{renderRedStarLabel(UI_TEXT[selectedLanguage].adminSectionTitle)}</span>
                  </h3>
                  
                  {/* LANGUAGE PICKER IN FORM */}
                  <div className="appearance-none flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <div className="appearance-none flex items-center gap-1">
                      <Languages className="appearance-none w-3.5 h-3.5 text-emerald-400" />
                      <span className="appearance-none text-[11px] text-slate-400 font-bold">{UI_TEXT[selectedLanguage].langLabel}:</span>
                    </div>
                    <div className="appearance-none flex items-center gap-1">
                      {languagesConfig.map(lang => {
                        const isSelected = selectedLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-300'
                                : 'text-slate-300 hover:text-white hover:bg-slate-900'
                            }`}
                            title={`Click here to switch language to ${lang.name}`}
                          >
                            <span>{lang.flag}</span>
                            <span className="text-[10.5px]">{lang.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CATEGORY PICKER CARDS */}
                <div className="appearance-none mb-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <label className="appearance-none block text-xs font-black text-slate-200 mb-2 flex flex-wrap items-center justify-between gap-1">
                    <span>{renderRedStarLabel(UI_TEXT[selectedLanguage].categoryLabel)}</span>
                    <span className="appearance-none text-[10px] text-emerald-400 font-semibold">{UI_TEXT[selectedLanguage].categorySubtitle}</span>
                  </label>
                  <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {EDUCATION_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const displayTitle = getCategoryTitle(cat, selectedLanguage);
                      const mainTitle = displayTitle.split('(')[0].trim();
                      const subTitle = displayTitle.includes('(') ? `(${displayTitle.split('(')[1]}` : '';

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-emerald-400 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/40'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="appearance-none flex items-center justify-between gap-1 mb-1">
                            <span className="appearance-none text-xs font-black text-white">{mainTitle}</span>
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                              isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {cat.badge}
                            </span>
                          </div>
                          <span className="appearance-none text-[10.5px] text-slate-400 font-medium">
                            {subTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].schoolName)}</label>
                    <input 
                      type="text" 
                      value={plan.schoolName}
                      onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                      className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].teacherName)}</label>
                    <input 
                      type="text" 
                      value={plan.teacherName}
                      onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                      className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].classLevel)}</label>
                    <div className="relative">
                      <select 
                        value={plan.className}
                        onChange={(e) => handleFieldChange('className', e.target.value)}
                        className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer pr-8"
                      >
                        {EDUCATION_CATEGORIES.find(c => c.id === selectedCategory)?.levels.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].subject)}</label>
                    <div className="relative">
                    <select 
                      value={EDUCATION_CATEGORIES.some(c => c.subjects.includes(plan.subject) || getCategorySubjects(c, selectedLanguage).includes(plan.subject)) ? plan.subject : 'CUSTOM'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'CUSTOM') {
                          handleFieldChange('subject', val);
                          for (const cat of EDUCATION_CATEGORIES) {
                            const catSubs = getCategorySubjects(cat, selectedLanguage);
                            if (catSubs.includes(val) || cat.subjects.includes(val)) {
                              setSelectedCategory(cat.id);
                              // Sync class level if current class isn't in new category
                              if (!cat.levels.includes(plan.className)) {
                                handleFieldChange('className', cat.levels[3] || cat.levels[0]);
                              }
                              break;
                            }
                          }
                        }
                      }}
                      className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer pr-8"
                    >
                      {EDUCATION_CATEGORIES.map(cat => (
                        <optgroup key={cat.id} label={getCategoryTitle(cat, selectedLanguage)}>
                          {getCategorySubjects(cat, selectedLanguage).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="CUSTOM">{UI_TEXT[selectedLanguage].customSubjectPrompt}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                    {/* CUSTOM INPUT IF SUBJECT NOT IN CATEGORY LIST */}
                    {(!EDUCATION_CATEGORIES.some(c => c.subjects.includes(plan.subject) || getCategorySubjects(c, selectedLanguage).includes(plan.subject))) && (
                      <input 
                        type="text" 
                        placeholder="Enter custom subject name..."
                        value={plan.subject}
                        onChange={(e) => handleFieldChange('subject', e.target.value)}
                        className="appearance-none w-full mt-1.5 bg-slate-950 border border-emerald-500/60 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-300 focus:outline-none"
                      />
                    )}
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].term)}</label>
                    <div className="relative">
                      <select  
                        value={plan.term} 
                        onChange={(e) => handleFieldChange('term', e.target.value)}
                        className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer pr-8"
                      >
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].date)}</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={plan.date} 
                        onChange={(e) => handleFieldChange('date', e.target.value)}
                        onClick={(e) => {
                          try { (e.target as any).showPicker?.(); } catch (err) {}
                        }}
                        className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].duration)}</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = plan.duration || '40 min';
                          const match = currentVal.match(/\d+/);
                          const num = match ? parseInt(match[0], 10) : 40;
                          const newNum = Math.max(5, num - 5);
                          const updated = currentVal.replace(/\d+/, newNum.toString());
                          handleFieldChange('duration', match ? updated : `${newNum} min`);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-emerald-400 p-2.5 rounded-l-xl border border-r-0 border-slate-800 focus:outline-none cursor-pointer transition-colors"
                        title="Gabanya (-5 min)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="text" 
                        value={plan.duration} 
                        onChange={(e) => handleFieldChange('duration', e.target.value)}
                        className="appearance-none w-full bg-slate-950 border border-slate-800 py-2 text-xs font-bold text-white text-center focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = plan.duration || '40 min';
                          const match = currentVal.match(/\d+/);
                          const num = match ? parseInt(match[0], 10) : 40;
                          const newNum = num + 5;
                          const updated = currentVal.replace(/\d+/, newNum.toString());
                          handleFieldChange('duration', match ? updated : `${newNum} min`);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-emerald-400 p-2.5 rounded-r-xl border border-l-0 border-slate-800 focus:outline-none cursor-pointer transition-colors"
                        title="Ongera (+5 min)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].classSize)}</label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = parseInt(plan.classSize, 10) || 0;
                          if (currentVal > 1) {
                            handleFieldChange('classSize', (currentVal - 1).toString());
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-emerald-400 p-2.5 rounded-l-xl border border-r-0 border-slate-800 focus:outline-none cursor-pointer transition-colors"
                        title="Decrementation (-)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="number" 
                        min={1}
                        value={plan.classSize} 
                        onChange={(e) => handleFieldChange('classSize', e.target.value)}
                        className="appearance-none w-full bg-slate-950 border border-slate-800 py-2 text-xs font-bold text-white text-center focus:border-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = parseInt(plan.classSize, 10) || 0;
                          handleFieldChange('classSize', (currentVal + 1).toString());
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-emerald-400 p-2.5 rounded-r-xl border border-l-0 border-slate-800 focus:outline-none cursor-pointer transition-colors"
                        title="Incrementation (+)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: LESSON & UNIT DETAILS */}
              <div className="border-t border-slate-800 pt-4">
                <div className="appearance-none flex items-center justify-between mb-3">
                  <h3 className="appearance-none text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="appearance-none w-4 h-4 text-amber-400" />
                    <span>{renderRedStarLabel(UI_TEXT[selectedLanguage].unitSectionTitle)}</span>
                  </h3>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities}
                      className="appearance-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingAi ? UI_TEXT[selectedLanguage].writingAi : UI_TEXT[selectedLanguage].aiAutoFill}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExpandContent}
                      disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities || isExplainingCompetences}
                      className="appearance-none bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Maximize2 className={`w-3 h-3 ${isExpandingActivities ? 'animate-pulse' : ''}`} />
                      <span>{isExpandingActivities ? 'Expanding...' : (selectedLanguage === 'Kinyarwanda' ? 'Wagura Amagambo' : 'AI Expand')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAiExplainCompetences}
                      disabled={isGeneratingAi || isTranslatingPlan || isExpandingActivities || isExplainingCompetences}
                      className="appearance-none bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title={selectedLanguage === 'Kinyarwanda' ? "Koresha AI isobanure neza Ubushobozi rusange n'Ibibazo byambukiranya" : "Generate pedagogical explanations for Generic Competences & Cross-Cutting Issues"}
                    >
                      <Sparkles className={`w-3 h-3 ${isExplainingCompetences ? 'animate-spin' : ''}`} />
                      <span>{isExplainingCompetences ? '...' : (selectedLanguage === 'Kinyarwanda' ? 'AI Sobanura Ubumenyi' : 'AI Explain')}</span>
                    </button>
                  </div>
                </div>

                {/* 📚 REB 2026-2027 CURRICULUM SELECTOR BANNER */}
                <div className="mb-3 p-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          {selectedLanguage === 'Kinyarwanda' ? 'Ibitabo bishya bya REB 2026-2027' : 'Updated REB 2026-2027 Curriculum'}
                        </span>
                        <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                          CBC Standard
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {currentCurriculumBook ? `${currentCurriculumBook.edition}` : 'Hitamo Umutwe n\'Isomo mu kumenya muri Select iri munsi'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCurriculumSearchOpen(true)}
                    className="text-[11px] font-bold bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedLanguage === 'Kinyarwanda' ? 'Shakisha mu Bitabo Byose' : 'Search All Books'}</span>
                  </button>
                </div>

                <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* 1. UNIT NUMBER & TITLE WITH SELECT */}
                  <div className="p-3 bg-slate-950/70 border border-emerald-500/40 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="appearance-none block text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{renderRedStarLabel(UI_TEXT[selectedLanguage].unitNumberAndTitle)}</span>
                      </label>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {currentCurriculumUnits.length > 0 ? `${currentCurriculumUnits.length} Units` : 'Select'}
                      </span>
                    </div>

                    {/* SELECT DROPDOWN FOR UNIT */}
                    <div className="relative mb-2">
                      <select 
                        value={selectedCurriculumUnitIndex >= 0 ? selectedCurriculumUnitIndex : (
                          currentCurriculumUnits.findIndex(u => u.unitNumber === plan.unitNumber || u.unitTitleEn === plan.unitTitle || u.unitTitleRw === plan.unitTitle)
                        )}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'CUSTOM' || val === '') {
                            setSelectedCurriculumUnitIndex(-1);
                            setSelectedCurriculumLessonIndex(-1);
                          } else {
                            const idx = parseInt(val, 10);
                            handleApplyCurriculumUnit(idx);
                          }
                        }}
                        className="appearance-none w-full bg-slate-900 border border-emerald-500/70 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none cursor-pointer pr-8 shadow-inner"
                      >
                        <option value="">
                          {selectedLanguage === 'Kinyarwanda' 
                            ? `👉 Hitamo Umutwe (Select Unit) muri ${plan.subject || 'CBC'}...` 
                            : `👉 Select Unit from ${plan.subject || 'Curriculum'}...`}
                        </option>
                        {currentCurriculumUnits.map((u, idx) => (
                          <option key={u.unitNumber + idx} value={idx}>
                            {u.unitNumber}: {selectedLanguage === 'Kinyarwanda' ? (u.unitTitleRw || u.unitTitleEn) : u.unitTitleEn}
                          </option>
                        ))}
                        <option value="CUSTOM">✏️ {selectedLanguage === 'Kinyarwanda' ? 'Andika undi mutwe (Custom)...' : 'Custom Unit (Type manually)...'}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* MANUAL EDIT INPUTS FOR UNIT NUMBER & TITLE */}
                    <div className="appearance-none flex gap-2">
                      <input 
                        type="text" 
                        value={plan.unitNumber}
                        onChange={(e) => handleFieldChange('unitNumber', e.target.value)}
                        placeholder="Unit 2"
                        className="appearance-none w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={plan.unitTitle}
                        onChange={(e) => handleFieldChange('unitTitle', e.target.value)}
                        placeholder="Unit Title..."
                        className="appearance-none flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* 2. LESSON NUMBER & TITLE WITH SELECT */}
                  <div className="p-3 bg-slate-950/70 border border-emerald-500/40 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="appearance-none block text-[11px] text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{renderRedStarLabel(UI_TEXT[selectedLanguage].lessonNumberAndTitle)}</span>
                      </label>
                      {selectedCurriculumUnitIndex >= 0 && currentCurriculumUnits[selectedCurriculumUnitIndex] && (
                        <span className="text-[9px] text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                          {currentCurriculumUnits[selectedCurriculumUnitIndex].lessons.length} Amasomo
                        </span>
                      )}
                    </div>

                    {/* SELECT DROPDOWN FOR LESSON */}
                    <div className="relative mb-2">
                      <select 
                        value={selectedCurriculumLessonIndex >= 0 ? selectedCurriculumLessonIndex : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'CUSTOM' || val === '') {
                            setSelectedCurriculumLessonIndex(-1);
                          } else {
                            const idx = parseInt(val, 10);
                            handleApplyCurriculumLesson(idx);
                          }
                        }}
                        disabled={selectedCurriculumUnitIndex < 0 || !currentCurriculumUnits[selectedCurriculumUnitIndex]}
                        className="appearance-none w-full bg-slate-900 border border-emerald-500/70 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none cursor-pointer pr-8 shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {selectedCurriculumUnitIndex < 0
                            ? (selectedLanguage === 'Kinyarwanda' ? '👉 Banza uhitemo Umutwe ibumoso...' : '👉 Select a Unit first on the left...')
                            : (selectedLanguage === 'Kinyarwanda' ? '👉 Hitamo Isomo ry\'uyu Mutwe...' : '👉 Select Lesson from this Unit...')}
                        </option>
                        {selectedCurriculumUnitIndex >= 0 && currentCurriculumUnits[selectedCurriculumUnitIndex]?.lessons.map((les, lIdx) => (
                          <option key={les.lessonNumber + lIdx} value={lIdx}>
                            {les.lessonNumber}: {selectedLanguage === 'Kinyarwanda' ? (les.lessonTitleRw || les.lessonTitleEn) : les.lessonTitleEn}
                          </option>
                        ))}
                        <option value="CUSTOM">✏️ {selectedLanguage === 'Kinyarwanda' ? 'Andika irindi somo (Custom)...' : 'Custom Lesson (Type manually)...'}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* MANUAL EDIT INPUTS FOR LESSON NUMBER & TITLE */}
                    <div className="appearance-none flex gap-2">
                      <input 
                        type="text" 
                        value={plan.lessonNumber}
                        onChange={(e) => handleFieldChange('lessonNumber', e.target.value)}
                        placeholder="1 of 6"
                        className="appearance-none w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-300 focus:border-emerald-500 focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={plan.lessonTitle}
                        onChange={(e) => handleFieldChange('lessonTitle', e.target.value)}
                        placeholder="Lesson Title..."
                        className="appearance-none flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* KEY UNIT COMPETENCE */}
                <div className="appearance-none mb-3">
                  <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].keyUnitCompetence)}</label>
                  <textarea
                    rows={2}
                    value={plan.keyUnitCompetence}
                    onChange={(e) => handleFieldChange('keyUnitCompetence', e.target.value)}
                    className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* INSTRUCTIONAL OBJECTIVE (AI ASSISTED) */}
                <div className="appearance-none mb-3 p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                  <div className="appearance-none flex items-center justify-between mb-1">
                    <label className="appearance-none text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="appearance-none w-3.5 h-3.5 text-amber-400" />
                      <span>{renderRedStarLabel(UI_TEXT[selectedLanguage].instructionalObjective)}</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAiRegenerateObjective}
                      disabled={isGeneratingAi || isTranslatingPlan}
                      className="appearance-none text-[9px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      title="AI Regenerate (By using [materials]... without 'By the end of this lesson')"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{selectedLanguage === 'Kinyarwanda' ? "AI Intego y'isomo" : "AI Generate"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={plan.instructionalObjective}
                    onChange={(e) => handleFieldChange('instructionalObjective', e.target.value)}
                    placeholder={
                      selectedLanguage === 'Kinyarwanda'
                        ? "Hifashishijwe amakarita y'imibare n'ingero ziri ku kibaho, abanyeshuri bo mu mwaka wa P6 bazaba bashobora gukora imibare mu buryo bw'ukuri mu gihe cy'iminota 40."
                        : "By using fraction cards and chalkboard examples, Primary 6 (P6) learners will be able to multiply a whole number by a fraction correctly within 40 minutes."
                    }
                    className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-medium"
                  />
                  <div className="mt-1.5 text-[9.5px] text-emerald-400 font-medium">
                    {selectedLanguage === 'Kinyarwanda'
                      ? "REB: Hifashishijwe [imfashanyigisho n'ingero ku kibaho], abanyeshuri bazaba bashobora... (nta 'By the end of this lesson')"
                      : "REB: By using [learning materials] and chalkboard examples, learners will be able to... within 40 minutes. (Without 'By the end of this lesson')"}
                  </div>
                </div>

                {/* LEARNING MATERIALS & REFERENCES */}
                <div className="appearance-none grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="appearance-none p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                    <label className="appearance-none block text-[11px] text-amber-300 font-bold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].learningMaterials)}</label>
                    <textarea
                      rows={3}
                      value={plan.learningMaterials}
                      onChange={(e) => handleFieldChange('learningMaterials', e.target.value)}
                      className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="appearance-none p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <label className="appearance-none block text-[11px] text-cyan-300 font-bold">{renderRedStarLabel(UI_TEXT[selectedLanguage].references)}</label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoRef = getAccurateRevisedReference({
                            subject: plan.subject,
                            className: plan.className,
                            unitNumber: plan.unitNumber,
                            unitTitle: plan.unitTitle,
                            lessonNumber: plan.lessonNumber,
                            lessonTitle: plan.lessonTitle,
                            language: selectedLanguage
                          });
                          handleFieldChange('references', autoRef);
                        }}
                        className="text-[10px] sm:text-[10.5px] px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 flex items-center gap-1.5 transition-colors font-medium cursor-pointer shadow-sm"
                        title={selectedLanguage === 'Kinyarwanda' ? "Koresha reference z'ibitabo bishya bya REB byavuguruwe (Revised 2026 Editions) n'impapuro nyazo" : "Generate official REB Revised Edition (2024-2026) textbook reference"}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{selectedLanguage === 'Kinyarwanda' ? "Huza n'Igitabo Gishya cya REB (Revised 2026)" : "Sync REB Revised Book (2026)"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={plan.references}
                      onChange={(e) => handleFieldChange('references', e.target.value)}
                      className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* DESCRIPTION OF TEACHING AND LEARNING ACTIVITY */}
                <div className="appearance-none p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl mt-3">
                  <label className="appearance-none block text-[11px] text-indigo-300 font-bold mb-1">
                    {renderRedStarLabel(SHEET_LABELS[selectedLanguage].descActivities)}
                  </label>
                  <textarea
                    rows={2}
                    value={plan.descActivities || ''}
                    onChange={(e) => handleFieldChange('descActivities', e.target.value)}
                    placeholder={
                      selectedLanguage === 'Kinyarwanda' 
                        ? "Ibikorwa bibandanda ku munyeshuri bizwiho gukoresha imfashanyigisho zifatika, gukorera mu matsinda..."
                        : "Interactive learner-centered activities using concrete manipulatives..."
                    }
                    className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* SECTION C: SPECIAL NEEDS & LOCATION */}
              <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].specialNeeds)}</label>
                  <textarea
                    rows={2}
                    value={plan.specialNeeds}
                    onChange={(e) => handleFieldChange('specialNeeds', e.target.value)}
                    className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="appearance-none block text-[11px] text-slate-400 font-semibold mb-1">{renderRedStarLabel(UI_TEXT[selectedLanguage].location)}</label>
                  <div className="relative">
                    <select  
                      value={plan.classLocation}
                      onChange={(e) => handleFieldChange('classLocation', e.target.value)}
                      className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none cursor-pointer pr-8"
                    >
                    <option value="Inside the classroom">Inside the classroom</option>
                    <option value="Inside the Library room">Inside the Library room</option>
                    <option value="Inside the ICT room">Inside the ICT room</option>
                    <option value="Inside the Laboratory room">Inside the Laboratory room</option>
                    <option value="Outside the classroom">Outside the classroom</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                  <div className="appearance-none mt-2.5">
                    <div className="appearance-none flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <label className="appearance-none text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                        <span>{renderRedStarLabel(SHEET_LABELS[selectedLanguage].teacherSelfEval)}</span>
                      </label>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-2xl">
                      <textarea 
                        rows={2}
                        value={plan.teacherSelfEvaluation}
                        onChange={(e) => handleFieldChange('teacherSelfEvaluation', e.target.value)}
                        placeholder={
                          selectedLanguage === 'Kinyarwanda' 
                            ? "Siga ubusa mbere yo kwigisha, cyangwa wandikemo uko isomo ryagenze..."
                            : selectedLanguage === 'Français'
                            ? "Laissez vide avant le cours ou saisissez votre auto-évaluation..."
                            : selectedLanguage === 'Kiswahili'
                            ? "Acha wazi kabla ya kufundisha au andika tathmini yako..."
                            : "Leave blank before teaching or enter your evaluation remarks..."
                        }
                        className="appearance-none w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFieldChange('teacherSelfEvaluation', '')}
                          className={`text-[10.5px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            !plan.teacherSelfEvaluation
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          ✍️ {selectedLanguage === 'Kinyarwanda' ? 'Siga Ubusa' : selectedLanguage === 'Français' ? 'Laissez vide' : selectedLanguage === 'Kiswahili' ? 'Acha wazi' : 'Leave Blank'}
                        </button>
                        {Boolean(plan.teacherSelfEvaluation) && (
                          <button
                            type="button"
                            onClick={() => handleFieldChange('teacherSelfEvaluation', '')}
                            className="text-[10.5px] px-2 py-1 rounded-lg bg-red-950/40 text-red-300 border border-red-800/60 hover:bg-red-900/60 transition-colors cursor-pointer"
                          >
                            🗑️ {selectedLanguage === 'Kinyarwanda' ? 'Gusiba' : selectedLanguage === 'Français' ? 'Effacer' : selectedLanguage === 'Kiswahili' ? 'Futa' : 'Clear'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTION BAR */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setActiveTab('sheet')}
                  className="appearance-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="appearance-none w-4 h-4 text-emerald-400" />
                  <span>{UI_TEXT[selectedLanguage].previewDownload}</span>
                </button>

                <div className="appearance-none flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleGenerateFullPlan}
                    disabled={isGeneratingAi || isTranslatingPlan}
                    className="appearance-none bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-300/40 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 text-amber-200 ${isGeneratingAi ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isGeneratingAi ? UI_TEXT[selectedLanguage].writingAi : UI_TEXT[selectedLanguage].generateFullPlan}</span>
                  </button>

                  <button
                    onClick={handleToggleEditMode}
                    className="appearance-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-400/40 cursor-pointer"
                  >
                    <CheckCircle className="appearance-none w-4 h-4 text-emerald-200" />
                    <span>{UI_TEXT[selectedLanguage].finishEditPlan}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* TEMPLATE SELECTOR MODAL */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* SAVE CUSTOM TEMPLATE MODAL */}
      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        currentPlanData={plan}
        onSave={handleSaveCustomTemplate}
      />

      {/* PRINTABLE QR CODE MODAL */}
      <PrintableLessonPlanQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        plan={{
          id: plan.id,
          title: plan.lessonTitle,
          subject: plan.subject,
          className: plan.className,
          type: 'cbc',
          schoolName: plan.schoolName,
          teacherName: plan.teacherName,
          date: plan.date,
          term: plan.term,
          unitTitle: plan.unitTitle,
          duration: plan.duration
        }}
      />

      {/* REB 2026-2027 CURRICULUM TEXTBOOK SEARCH MODAL */}
      {isCurriculumSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {selectedLanguage === 'Kinyarwanda' ? 'Shakisha mu Bitabo bishya bya REB 2026-2027' : 'Search 2026-2027 REB & NESA Curriculum Textbooks'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedLanguage === 'Kinyarwanda' 
                      ? 'Nursery, Primary, O-Level, A-Level, TTCs (Y1-Y3), TVET (L1-L5)' 
                      : 'All Education Levels: Nursery, Primary, O-Level, A-Level, TTCs, TVET'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCurriculumSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={curriculumSearchQuery}
                  onChange={(e) => setCurriculumSearchQuery(e.target.value)}
                  placeholder={
                    selectedLanguage === 'Kinyarwanda' 
                      ? "Andika ijambo ushaka (urugero: fractions, cell, photosynthesis, atom, python, urufatiro, umuryango)..." 
                      : "Type keywords (e.g. fractions, cell, set theory, differentiation, masonry, pedagogy)..."
                  }
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {curriculumSearchQuery.trim().length < 2 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p>{selectedLanguage === 'Kinyarwanda' ? 'Andika nibura inyuguti 2 kugira ngo ushakishe mu bitabo bya REB 2026-2027.' : 'Enter at least 2 characters to search across all REB 2026-2027 textbooks.'}</p>
                </div>
              ) : curriculumSearchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>{selectedLanguage === 'Kinyarwanda' ? 'Nta mutwe cyangwa isomo bibonetse bihuye n\'ibyo ushakishije.' : 'No matching curriculum units or lessons found.'}</p>
                </div>
              ) : (
                curriculumSearchResults.map((res, rIdx) => (
                  <div
                    key={rIdx}
                    onClick={() => handleApplySearchResult(res)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-xl cursor-pointer transition-all flex flex-col gap-1 group"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-400 group-hover:text-emerald-300">
                        {res.book.subjectNameEn} ({res.book.gradeLevels.join(', ')})
                      </span>
                      <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded text-[9px] border border-slate-800">
                        {res.book.edition}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white group-hover:text-emerald-300">
                      {res.unit.unitNumber}: {selectedLanguage === 'Kinyarwanda' ? (res.unit.unitTitleRw || res.unit.unitTitleEn) : res.unit.unitTitleEn}
                    </div>
                    {res.lesson && (
                      <div className="text-[11px] text-amber-300 font-medium">
                        👉 {(res.lesson as any).lessonNumber}: {selectedLanguage === 'Kinyarwanda' ? ((res.lesson as any).lessonTitleRw || (res.lesson as any).lessonTitleEn) : (res.lesson as any).lessonTitleEn}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {selectedLanguage === 'Kinyarwanda' ? (res.unit.keyCompetenceRw || res.unit.keyCompetenceEn) : res.unit.keyCompetenceEn}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
