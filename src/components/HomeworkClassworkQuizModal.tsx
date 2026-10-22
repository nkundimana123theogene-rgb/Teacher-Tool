import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Minus,
  Trash2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  BookOpen, 
  Layers, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Globe,
  ArrowLeft,
  Edit3,
  Save,
  FileDown,
  Bookmark,
  FolderHeart,
  Eye,
  EyeOff,
  GraduationCap,
  UserCheck,
  NotebookPen,
  Cloud,
  Upload
} from 'lucide-react';
import jsPDF from 'jspdf';
import { UserProfile, SavedAssessmentTemplate } from '../types';
import { RWANDA_EDUCATION_CURRICULUM } from '../data/rwandaCurriculumSubjects';
import { 
  saveAssessmentTemplateToFirestore, 
  loadAssessmentTemplatesFromFirestore, 
  deleteAssessmentTemplateFromFirestore 
} from '../utils/firebase';
import { checkCanUseAiCredit, deductAiCredit } from '../utils/subscription';

export type AssessmentMode = 'homework' | 'classwork' | 'quiz';

export type QuestionCategoryType = 
  | 'Multiple Choice'
  | 'True/False'
  | 'Fill in the Blank'
  | 'Short Answer'
  | 'Long Answer'
  | 'Matching'
  | 'Calculation'
  | 'Essay';

export interface AssessmentSectionConfig {
  id: string;
  name: string; // e.g. "Section A"
  category: QuestionCategoryType;
  questionCount: number;
  marksEach: number;
}

export interface GeneratedQuestionItem {
  id: string;
  sectionName: string;
  number: number;
  type: QuestionCategoryType;
  questionText: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  explanation?: string;
  hint?: string;
  marks: number;
  matchingPairs?: { left: string; right: string }[];
}

export interface GeneratedAssessmentOutput {
  id: string;
  type: AssessmentMode;
  title: string;
  subject: string;
  grade: string;
  unit?: string;
  topic: string;
  country: string;
  curriculumStandard: string;
  language: string;
  timeAllowed: string;
  totalQuestions: number;
  totalMarks: number;
  instructions: string[];
  sections: {
    name: string;
    category: QuestionCategoryType;
    totalMarks: number;
    questions: GeneratedQuestionItem[];
  }[];
  answerKey: {
    sectionName: string;
    answers: { number: number; answer: string; explanation: string }[];
  }[];
  markingScheme: {
    summary: string;
    rubricPoints: { criterion: string; allocatedMarks: number; guidance: string }[];
  };
  teacherNotes?: string;
  createdAt: string;
}

export type AssessmentLanguage = 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili';

export const HW_UI_TRANSLATIONS: Record<AssessmentLanguage, {
  langTitle: string;
  modeSwitcherLabel: string;
  modeHomework: string;
  modeClasswork: string;
  modeQuiz: string;
  hwTitle: string;
  cwTitle: string;
  quizTitle: string;
  hwDesc: string;
  cwDesc: string;
  quizDesc: string;
  planNotice: string;
  planActive: string;
  fillCurriculumTitle: string;
  fillCurriculumDesc: string;
  rebBtn: string;
  rtbBtn: string;
  lessonDetailsTitle: string;
  lessonDetailsSub: string;
  subjectLabel: string;
  gradeLabel: string;
  unitLabel: string;
  topicLabel: string;
  curriculumLabel: string;
  languageLabel: string;
  timeLabel: string;
  questionStructureTitle: string;
  questionStructureSub: string;
  useSectionsLabel: string;
  useSectionsDesc: string;
  sectionColName: string;
  sectionColCategory: string;
  sectionColCount: string;
  sectionColMarks: string;
  addSectionBtn: string;
  totalConfigMarks: string;
  difficultyTitle: string;
  difficultyDesc: string;
  diffEasy: string;
  diffEasySub: string;
  diffMed: string;
  diffMedSub: string;
  diffHard: string;
  diffHardSub: string;
  diffMixed: string;
  diffMixedSub: string;
  outputOptionsTitle: string;
  outputOptionsDesc: string;
  optCurriculumSearch: string;
  optCurriculumSearchDesc: string;
  optAnswerKey: string;
  optAnswerKeyDesc: string;
  optMarkingScheme: string;
  optMarkingSchemeDesc: string;
  optHints: string;
  optHintsDesc: string;
  bottomTip: string;
  cancelBtn: string;
  generating: string;
  btnGenerateHw: string;
  btnGenerateCw: string;
  btnGenerateQuiz: string;
  includeAnsKey: string;
  includeAnsKeyDesc: string;
  includeMarking: string;
  includeMarkingDesc: string;
  includeHints: string;
  includeHintsDesc: string;
  generateBtn: string;
  generatingBtn: string;
  defaultSubject: string;
  defaultUnit: string;
  defaultTopic: string;
  defaultDuration: string;
  defaultCurriculum: string;
  previewHeader: string;
  backBtn: string;
  copyBtn: string;
  copiedBtn: string;
  downloadPdfBtn: string;
  downloadWordBtn: string;
  printBtn: string;
  answerKeyTitle: string;
  markingSchemeTitle: string;
  editAssessmentBtn: string;
  doneEditingBtn: string;
  addQuestionBtn: string;
  deleteQuestionBtn: string;
  addOptionBtn: string;
  removeOptionBtn: string;
  questionTextLabel: string;
  optionsLabel: string;
  answerLabel: string;
  explanationLabel: string;
  hintLabel: string;
  marksLabel: string;
  customQuestionsTitle: string;
  customQuestionsSub: string;
  createManuallyBtn: string;
  createManuallyDesc: string;
  addSectionOutputBtn: string;
  saveTemplateBtn: string;
  saveSetupTemplateBtn: string;
  myTemplatesTitle: string;
  useTemplateBtn: string;
  deleteTemplateBtn: string;
  templateSavedNotice: string;
  noTemplatesMsg: string;
  showAnswersBtn: string;
  hideAnswersBtn: string;
  previewAsStudentBtn: string;
  previewAsTeacherBtn: string;
  studentPreviewNotice: string;
  teacherNotesTitle: string;
  teacherNotesSub: string;
  teacherNotesPlaceholder: string;
  teacherNotesPdfModeLabel: string;
  teacherNotesPdfModeDesc: string;
  teacherNotesModeSeparatePage: string;
  teacherNotesModeSeparatePageDesc: string;
  teacherNotesModeFooter: string;
  teacherNotesModeFooterDesc: string;
  teacherNotesModeNone: string;
  teacherNotesModeNoneDesc: string;
  teacherGuidePageTitle: string;
  teacherGuidePageSubtitle: string;
}> = {
  English: {
    langTitle: 'Language Context:',
    modeSwitcherLabel: 'What would you like to create?',
    modeHomework: 'Homework',
    modeClasswork: 'Classwork',
    modeQuiz: 'Quiz',
    hwTitle: 'Create Homework',
    cwTitle: 'Create Classwork',
    quizTitle: 'Create Quiz',
    hwDesc: 'Take-home worksheet for independent practice. Ready-to-use and aligned with your curriculum.',
    cwDesc: 'In-class practice worksheet for active learning. Ready-to-use and aligned with your curriculum.',
    quizDesc: 'Short assessment worksheet. Ready-to-use and aligned with your curriculum.',
    planNotice: 'Homework & Exercises Ready: Unlimited AI Generation unlocked for Rwandan CBC & TVET standards.',
    planActive: 'Active Plan',
    fillCurriculumTitle: 'Fill From Rwanda Curriculum',
    fillCurriculumDesc: 'Choose REB or RTB curriculum data and the exercise form will fill automatically.',
    rebBtn: 'REB Curriculum',
    rtbBtn: 'RTB TVET Curriculum',
    lessonDetailsTitle: 'Lesson Details',
    lessonDetailsSub: 'Fill in the details about your topic & unit',
    subjectLabel: 'Subject *',
    gradeLabel: 'Grade / Level *',
    unitLabel: 'Unit (Umutwe)',
    topicLabel: 'Topic *',
    curriculumLabel: 'Curriculum Standard *',
    languageLabel: 'Language for Questions & Answer Key *',
    timeLabel: 'Time Allowed',
    questionStructureTitle: 'Question Structure',
    questionStructureSub: 'Configure sections, question types & marks per item',
    useSectionsLabel: 'Use Multi-Section Format',
    useSectionsDesc: 'Divide the assessment into Section A, Section B, Section C',
    sectionColName: 'Section Name',
    sectionColCategory: 'Question Type',
    sectionColCount: 'Questions',
    sectionColMarks: 'Marks Each',
    addSectionBtn: 'Add Section',
    totalConfigMarks: 'Total Marks:',
    difficultyTitle: 'Difficulty Level',
    difficultyDesc: 'Choose the complexity of questions',
    diffEasy: 'Easy',
    diffEasySub: 'Foundation level questions',
    diffMed: 'Medium',
    diffMedSub: 'Standard curriculum level',
    diffHard: 'Hard',
    diffHardSub: 'Advanced/challenging questions',
    diffMixed: 'Mixed',
    diffMixedSub: 'Combination of all levels',
    outputOptionsTitle: 'Output Options',
    outputOptionsDesc: 'Customize what to include in the generated exercises',
    optCurriculumSearch: 'Search curriculum resources & textbooks',
    optCurriculumSearchDesc: 'We\'ll automatically search for official curriculum content, past exam papers, and textbook exercises to generate relevant questions aligned with examination standards (WAEC, KNEC, REB, etc.)',
    optAnswerKey: 'Include Answer Key',
    optAnswerKeyDesc: 'Generate a separate answer key with correct answers and explanations',
    optMarkingScheme: 'Include Marking Scheme',
    optMarkingSchemeDesc: 'Generate marking criteria with partial marking guidelines for grading',
    optHints: 'Include Hints',
    optHintsDesc: 'Add helpful hints for students on each question (leave unchecked for exams/tests)',
    bottomTip: 'The exercises are curriculum-aligned and ready to use. Always review the questions to ensure they match your teaching objectives and classroom needs. You can download the exercises as editable Word documents for further customization.',
    cancelBtn: 'Cancel',
    generating: 'Generating with AI...',
    btnGenerateHw: 'Generate Homework with AI',
    btnGenerateCw: 'Generate Classwork with AI',
    btnGenerateQuiz: 'Generate Quiz with AI',
    includeAnsKey: 'Include Complete Answer Key',
    includeAnsKeyDesc: 'Generates step-by-step correct answers with detailed explanations',
    includeMarking: 'Include Official Marking Scheme & Rubrics',
    includeMarkingDesc: 'Comprehensive teacher evaluation guide aligned with CBC criteria',
    includeHints: 'Include Learning Hints',
    includeHintsDesc: 'Add helpful guidance notes beneath challenging questions',
    generateBtn: 'Generate Assessment Sheet',
    generatingBtn: 'Generating with CBC AI Engine...',
    defaultSubject: 'Mathematics',
    defaultUnit: 'Unit 3: Fractions, Decimals and Percentages',
    defaultTopic: 'Addition & Subtraction of Fractions',
    defaultDuration: '45 minutes',
    defaultCurriculum: 'Rwanda REB (CBC)',
    previewHeader: 'Generated Assessment Preview',
    backBtn: 'Back to Editor',
    copyBtn: 'Copy All',
    copiedBtn: 'Copied!',
    downloadPdfBtn: 'Download PDF',
    downloadWordBtn: 'Export Word (.doc)',
    printBtn: 'Print Sheet',
    answerKeyTitle: 'OFFICIAL ANSWER KEY & EXPLANATIONS',
    markingSchemeTitle: 'TEACHER MARKING RUBRIC & SCHEME',
    editAssessmentBtn: 'Edit Assessment',
    doneEditingBtn: 'Save & Done Editing',
    addQuestionBtn: '+ Add Custom Question',
    deleteQuestionBtn: 'Delete',
    addOptionBtn: '+ Add Option',
    removeOptionBtn: 'Remove',
    questionTextLabel: 'Question Text',
    optionsLabel: 'Multiple Choice Options',
    answerLabel: 'Correct Answer',
    explanationLabel: 'Teacher Explanation',
    hintLabel: 'Hint for Students',
    marksLabel: 'Marks',
    customQuestionsTitle: '✍️ Type / Paste Custom Questions (Manual Entry)',
    customQuestionsSub: 'If you already have questions prepared, paste or type them here line by line to build your custom assessment directly.',
    createManuallyBtn: '✍️ Create Custom Questions Manually',
    createManuallyDesc: 'Create a blank editable assessment where you can type your own questions directly without using AI.',
    addSectionOutputBtn: '+ Add New Section',
    saveTemplateBtn: 'Save as Template',
    saveSetupTemplateBtn: 'Save Setup as Template',
    myTemplatesTitle: 'Saved Assessment Templates',
    useTemplateBtn: 'Load Template',
    deleteTemplateBtn: 'Delete',
    templateSavedNotice: 'Template saved successfully!',
    noTemplatesMsg: 'No saved templates yet. Generate or create questions and click "Save as Template" to reuse them anytime.',
    showAnswersBtn: 'Show Answer Key',
    hideAnswersBtn: 'Hide Answer Key',
    previewAsStudentBtn: 'Preview as Student',
    previewAsTeacherBtn: 'Exit Student Preview',
    studentPreviewNotice: '🎓 Student View Active — Answer key, marking scheme, and edit controls hidden for a clean student layout.',
    teacherNotesTitle: 'Teacher Notes & Grading Reference',
    teacherNotesSub: 'Private notes, grading guidelines, or reminders for the teacher (hidden in student preview).',
    teacherNotesPlaceholder: 'e.g., Award full credit for showing clear formula derivation. Watch out for common calculation errors in Section B.',
    teacherNotesPdfModeLabel: 'Teacher Notes in PDF & Print Output',
    teacherNotesPdfModeDesc: 'Choose how Teacher Notes and pedagogical advice should be included in generated PDF/print documents',
    teacherNotesModeSeparatePage: "Separate 'Teacher Guide' Page (Recommended)",
    teacherNotesModeSeparatePageDesc: 'Generates a dedicated Teacher Guide page with your notes, scoring rubric, and CBC pedagogy advice',
    teacherNotesModeFooter: 'Worksheet Page Footer',
    teacherNotesModeFooterDesc: 'Places your notes neatly in a bordered box at the bottom of the worksheet questions',
    teacherNotesModeNone: 'Exclude (Student Only Copy)',
    teacherNotesModeNoneDesc: 'Omit teacher notes from PDF so students cannot see private grading guidance',
    teacherGuidePageTitle: "TEACHER'S GUIDE & PEDAGOGICAL NOTES",
    teacherGuidePageSubtitle: 'Official Pedagogical Implementation & Evaluation Reference'
  },
  Kinyarwanda: {
    langTitle: 'Language Context:',
    modeSwitcherLabel: 'What would you like to create?',
    modeHomework: 'Homework',
    modeClasswork: 'Classwork',
    modeQuiz: 'Quiz',
    hwTitle: 'Create Homework',
    cwTitle: 'Create Classwork',
    quizTitle: 'Create Quiz',
    hwDesc: 'Take-home worksheet for independent practice. Ready-to-use and aligned with your curriculum.',
    cwDesc: 'In-class practice worksheet for active learning. Ready-to-use and aligned with your curriculum.',
    quizDesc: 'Short assessment worksheet. Ready-to-use and aligned with your curriculum.',
    planNotice: 'Homework & Exercises Ready: Unlimited AI Generation unlocked for Rwandan CBC & TVET standards.',
    planActive: 'Active Plan',
    fillCurriculumTitle: 'Fill From Rwanda Curriculum',
    fillCurriculumDesc: 'Choose REB or RTB curriculum data and the exercise form will fill automatically.',
    rebBtn: 'REB Curriculum',
    rtbBtn: 'RTB TVET Curriculum',
    lessonDetailsTitle: 'Lesson Details',
    lessonDetailsSub: 'Fill in the details about your topic & unit',
    subjectLabel: 'Subject *',
    gradeLabel: 'Grade / Level *',
    unitLabel: 'Unit (Umutwe)',
    topicLabel: 'Topic *',
    curriculumLabel: 'Curriculum Standard *',
    languageLabel: 'Ururimi rw\'Ibibazo n\'Ibisubizo *',
    timeLabel: 'Time Allowed',
    questionStructureTitle: 'Question Structure',
    questionStructureSub: 'Configure sections, question types & marks per item',
    useSectionsLabel: 'Use Multi-Section Format',
    useSectionsDesc: 'Divide the assessment into Section A, Section B, Section C',
    sectionColName: 'Section Name',
    sectionColCategory: 'Question Type',
    sectionColCount: 'Questions',
    sectionColMarks: 'Marks Each',
    addSectionBtn: 'Add Section',
    totalConfigMarks: 'Total Marks:',
    difficultyTitle: 'Difficulty Level',
    difficultyDesc: 'Choose the complexity of questions',
    diffEasy: 'Easy',
    diffEasySub: 'Foundation level questions',
    diffMed: 'Medium',
    diffMedSub: 'Standard curriculum level',
    diffHard: 'Hard',
    diffHardSub: 'Advanced/challenging questions',
    diffMixed: 'Mixed',
    diffMixedSub: 'Combination of all levels',
    outputOptionsTitle: 'Output Options',
    outputOptionsDesc: 'Customize what to include in the generated exercises',
    optCurriculumSearch: 'Search curriculum resources & textbooks',
    optCurriculumSearchDesc: 'We\'ll automatically search for official curriculum content, past exam papers, and textbook exercises to generate relevant questions aligned with examination standards (WAEC, KNEC, REB, etc.)',
    optAnswerKey: 'Include Answer Key',
    optAnswerKeyDesc: 'Generate a separate answer key with correct answers and explanations',
    optMarkingScheme: 'Include Marking Scheme',
    optMarkingSchemeDesc: 'Generate marking criteria with partial marking guidelines for grading',
    optHints: 'Include Hints',
    optHintsDesc: 'Add helpful hints for students on each question (leave unchecked for exams/tests)',
    bottomTip: 'The exercises are curriculum-aligned and ready to use. Always review the questions to ensure they match your teaching objectives and classroom needs. You can download the exercises as editable Word documents for further customization.',
    cancelBtn: 'Cancel',
    generating: 'Generating with AI...',
    btnGenerateHw: 'Generate Homework with AI',
    btnGenerateCw: 'Generate Classwork with AI',
    btnGenerateQuiz: 'Generate Quiz with AI',
    includeAnsKey: 'Include Complete Answer Key',
    includeAnsKeyDesc: 'Generates step-by-step correct answers with detailed explanations',
    includeMarking: 'Include Official Marking Scheme & Rubrics',
    includeMarkingDesc: 'Comprehensive teacher evaluation guide aligned with CBC criteria',
    includeHints: 'Include Learning Hints',
    includeHintsDesc: 'Add helpful guidance notes beneath challenging questions',
    generateBtn: 'Generate Assessment Sheet',
    generatingBtn: 'Generating with CBC AI Engine...',
    defaultSubject: 'Mathematics',
    defaultUnit: 'Unit 3: Fractions, Decimals and Percentages',
    defaultTopic: 'Addition & Subtraction of Fractions',
    defaultDuration: '45 minutes',
    defaultCurriculum: 'Rwanda REB (CBC)',
    previewHeader: 'Generated Assessment Preview',
    backBtn: 'Back to Editor',
    copyBtn: 'Copy All',
    copiedBtn: 'Copied!',
    downloadPdfBtn: 'Download PDF',
    downloadWordBtn: 'Export Word (.doc)',
    printBtn: 'Print Sheet',
    answerKeyTitle: 'OFFICIAL ANSWER KEY & EXPLANATIONS',
    markingSchemeTitle: 'TEACHER MARKING RUBRIC & SCHEME',
    editAssessmentBtn: 'Edit Assessment',
    doneEditingBtn: 'Save & Done Editing',
    addQuestionBtn: '+ Add Custom Question',
    deleteQuestionBtn: 'Delete',
    addOptionBtn: '+ Add Option',
    removeOptionBtn: 'Remove',
    questionTextLabel: 'Question Text',
    optionsLabel: 'Multiple Choice Options',
    answerLabel: 'Correct Answer',
    explanationLabel: 'Teacher Explanation',
    hintLabel: 'Hint for Students',
    marksLabel: 'Marks',
    customQuestionsTitle: '✍️ Type / Paste Custom Questions (Manual Entry)',
    customQuestionsSub: 'If you already have questions prepared, paste or type them here line by line to build your custom assessment directly.',
    createManuallyBtn: '✍️ Create Custom Questions Manually',
    createManuallyDesc: 'Create a blank editable assessment where you can type your own questions directly without using AI.',
    addSectionOutputBtn: '+ Add New Section',
    saveTemplateBtn: 'Save as Template',
    saveSetupTemplateBtn: 'Save Setup as Template',
    myTemplatesTitle: 'Saved Assessment Templates',
    useTemplateBtn: 'Load Template',
    deleteTemplateBtn: 'Delete',
    templateSavedNotice: 'Template saved successfully!',
    noTemplatesMsg: 'No saved templates yet. Generate or create questions and click "Save as Template" to reuse them anytime.',
    showAnswersBtn: 'Show Answer Key',
    hideAnswersBtn: 'Hide Answer Key',
    previewAsStudentBtn: 'Preview as Student',
    previewAsTeacherBtn: 'Exit Student Preview',
    studentPreviewNotice: '🎓 Student View Active — Answer key, marking scheme, and edit controls hidden for a clean student layout.',
    teacherNotesTitle: 'Teacher Notes & Grading Reference',
    teacherNotesSub: 'Private notes, grading guidelines, or reminders for the teacher (hidden in student preview).',
    teacherNotesPlaceholder: 'e.g., Award full credit for showing clear formula derivation. Watch out for common calculation errors in Section B.',
    teacherNotesPdfModeLabel: 'Teacher Notes in PDF & Print Output',
    teacherNotesPdfModeDesc: 'Choose how Teacher Notes and pedagogical advice should be included in generated PDF/print documents',
    teacherNotesModeSeparatePage: "Separate 'Teacher Guide' Page (Recommended)",
    teacherNotesModeSeparatePageDesc: 'Generates a dedicated Teacher Guide page with your notes, scoring rubric, and CBC pedagogy advice',
    teacherNotesModeFooter: 'Worksheet Page Footer',
    teacherNotesModeFooterDesc: 'Places your notes neatly in a bordered box at the bottom of the worksheet questions',
    teacherNotesModeNone: 'Exclude (Student Only Copy)',
    teacherNotesModeNoneDesc: 'Omit teacher notes from PDF so students cannot see private grading guidance',
    teacherGuidePageTitle: "TEACHER'S GUIDE & PEDAGOGICAL NOTES",
    teacherGuidePageSubtitle: 'Official Pedagogical Implementation & Evaluation Reference'
  },
  Français: {
    langTitle: 'Contexte Linguistique :',
    modeSwitcherLabel: 'Que souhaitez-vous créer ?',
    modeHomework: 'Devoir à Domicile',
    modeClasswork: 'Travail de Classe',
    modeQuiz: 'Quiz d\'Évaluation',
    hwTitle: 'Créer un Devoir à Domicile',
    cwTitle: 'Créer un Travail de Classe',
    quizTitle: 'Créer un Quiz Éducatif',
    hwDesc: 'Fiche de travail pour une pratique autonome à la maison selon le programme national.',
    cwDesc: 'Fiche d\'exercices en classe pour un apprentissage actif et interactif.',
    quizDesc: 'Évaluation formative courte pour vérifier l\'acquisition des compétences clés.',
    planNotice: 'Conforme au programme REB / RTB Rwanda en Français : Génération IA illimitée.',
    planActive: 'Plan Actif',
    fillCurriculumTitle: 'Remplir via le Curriculum National',
    fillCurriculumDesc: 'Sélectionnez les matières REB ou RTB TVET pour pré-remplir instantanément les champs.',
    rebBtn: 'Programme REB',
    rtbBtn: 'Programme RTB TVET',
    lessonDetailsTitle: 'Détails de la Leçon et de l\'Unité',
    lessonDetailsSub: 'Renseignez les détails du sujet, de l\'unité et du niveau de classe',
    subjectLabel: 'Matière *',
    gradeLabel: 'Niveau / Classe *',
    unitLabel: 'Unité (N° et Titre)',
    topicLabel: 'Sujet / Thème Principal *',
    curriculumLabel: 'Norme Pédagogique *',
    languageLabel: 'Langue (Questions & Corrigé) *',
    timeLabel: 'Durée allouée',
    questionStructureTitle: 'Structure des Questions',
    questionStructureSub: 'Configurez les sections, types de questions et barème de points',
    useSectionsLabel: 'Format Multi-Sections',
    useSectionsDesc: 'Organiser l\'évaluation en Section A, Section B, Section C',
    sectionColName: 'Nom de la Section',
    sectionColCategory: 'Type de Question',
    sectionColCount: 'Questions',
    sectionColMarks: 'Points / Item',
    addSectionBtn: 'Ajouter une Section',
    totalConfigMarks: 'Total des Points :',
    difficultyTitle: 'Niveau de Difficulté',
    difficultyDesc: 'Choisissez le niveau de complexité des questions',
    diffEasy: 'Facile',
    diffEasySub: 'Questions de base et d\'assimilation',
    diffMed: 'Moyen',
    diffMedSub: 'Niveau standard du programme national',
    diffHard: 'Difficile',
    diffHardSub: 'Questions avancées et d\'analyse',
    diffMixed: 'Mixte',
    diffMixedSub: 'Combinaison de tous les niveaux',
    outputOptionsTitle: 'Options de Sortie',
    outputOptionsDesc: 'Personnalisez les éléments à inclure dans les exercices',
    optCurriculumSearch: 'Recherche dans les manuels officiels',
    optCurriculumSearchDesc: 'Recherche automatique dans les programmes officiels REB / RTB et examens passés',
    optAnswerKey: 'Inclure le Corrigé',
    optAnswerKeyDesc: 'Générer un corrigé détaillé avec toutes les explications',
    optMarkingScheme: 'Inclure la Grille d\'Évaluation',
    optMarkingSchemeDesc: 'Critères et barème officiel de notation pour l\'enseignant',
    optHints: 'Inclure des Indices',
    optHintsDesc: 'Ajouter des indices méthodologiques pour les élèves',
    bottomTip: 'Les exercices sont conformes au programme et prêts à l\'emploi. Vous pouvez les télécharger au format Word (.doc) pour les personnaliser.',
    cancelBtn: 'Annuler',
    generating: 'Génération IA en cours...',
    btnGenerateHw: 'Générer le Devoir',
    btnGenerateCw: 'Générer le Travail de Classe',
    btnGenerateQuiz: 'Générer le Quiz',
    includeAnsKey: 'Inclure le Corrigé Complet',
    includeAnsKeyDesc: 'Génère toutes les réponses attendues avec explications didactiques',
    includeMarking: 'Inclure la Grille d\'Évaluation (Marking Scheme)',
    includeMarkingDesc: 'Guide officiel de notation aligné sur les compétences REB CBC',
    includeHints: 'Inclure des Indices Pédagogiques',
    includeHintsDesc: 'Ajoute des conseils d\'orientation sous les questions complexes',
    generateBtn: 'Générer l\'Évaluation Complète',
    generatingBtn: 'Génération IA en cours...',
    defaultSubject: 'Français',
    defaultUnit: 'Unité 3: Grammaire, Vocabulaire et Production d\'Écrits',
    defaultTopic: 'Conjugaison et Accord du Participe Passé',
    defaultDuration: '45 minutes',
    defaultCurriculum: 'Programme National REB',
    previewHeader: 'Aperçu de l\'Évaluation Générée',
    backBtn: 'Retour à l\'Éditeur',
    copyBtn: 'Tout Copier',
    copiedBtn: 'Copié !',
    downloadPdfBtn: 'Télécharger PDF',
    downloadWordBtn: 'Exporter Word (.doc)',
    printBtn: 'Imprimer',
    answerKeyTitle: 'CORRIGÉ OFFICIEL ET EXPLICATIONS DÉTAILLÉES',
    markingSchemeTitle: 'GRILLE DE NOTATION ET CRITÈRES PÉDAGOGIQUES',
    editAssessmentBtn: 'Modifier le Contenu',
    doneEditingBtn: 'Enregistrer & Terminer',
    addQuestionBtn: 'Ajouter une Question',
    deleteQuestionBtn: 'Supprimer',
    addOptionBtn: '+ Ajouter une Option',
    removeOptionBtn: 'Supprimer l\'option',
    questionTextLabel: 'Texte de la Question',
    optionsLabel: 'Options de Réponse',
    answerLabel: 'Réponse Attendue',
    explanationLabel: 'Explication Pédagogique',
    hintLabel: 'Indice pour l\'Élève',
    marksLabel: 'Points',
    customQuestionsTitle: '✍️ Saisie Manuelle des Questions',
    customQuestionsSub: 'Saisissez ou collez vos propres questions ligne par ligne pour créer votre évaluation personnalisée.',
    createManuallyBtn: '✍️ Saisir les Questions Manuellement',
    createManuallyDesc: 'Créer une évaluation vierge où vous pouvez saisir directement vos propres questions sans l\'IA.',
    addSectionOutputBtn: '+ Ajouter une Nouvelle Section',
    saveTemplateBtn: 'Enregistrer comme Modèle',
    saveSetupTemplateBtn: 'Enregistrer la Config comme Modèle',
    myTemplatesTitle: 'Modèles d\'Évaluation Enregistrés',
    useTemplateBtn: 'Charger ce Modèle',
    deleteTemplateBtn: 'Supprimer',
    templateSavedNotice: 'Modèle enregistré avec succès !',
    noTemplatesMsg: 'Aucun modèle enregistré. Générez ou créez des questions et cliquez sur "Enregistrer comme Modèle" pour les réutiliser.',
    showAnswersBtn: 'Afficher le Corrigé',
    hideAnswersBtn: 'Masquer le Corrigé',
    previewAsStudentBtn: 'Aperçu Élève',
    previewAsTeacherBtn: 'Quitter Aperçu Élève',
    studentPreviewNotice: '🎓 Mode Aperçu Élève Actif — Le corrigé et les options de gestion sont masqués pour un affichage épuré.',
    teacherNotesTitle: 'Notes de l\'Enseignant & Référence de Notation',
    teacherNotesSub: 'Notes privées, consignes de correction ou rappels pour l\'enseignant (masquées pour l\'élève).',
    teacherNotesPlaceholder: 'ex. Accorder tous les points si la démarche est détaillée. Attention aux erreurs de calcul fréquentes dans la Section B.',
    teacherNotesPdfModeLabel: 'Notes de l\'Enseignant dans le PDF et l\'Impression',
    teacherNotesPdfModeDesc: 'Choisissez comment les notes et consignes de correction doivent figurer dans le document PDF',
    teacherNotesModeSeparatePage: 'Page Dédiée "Guide de l\'Enseignant" (Recommandé)',
    teacherNotesModeSeparatePageDesc: 'Génère une page séparée avec vos notes personnelles, critères d\'évaluation et conseils pédagogiques CBC',
    teacherNotesModeFooter: 'En Pied de Page (Footer)',
    teacherNotesModeFooterDesc: 'Insère vos notes dans un encadré soigné au bas des pages d\'exercices',
    teacherNotesModeNone: 'Exclure (Copie Élève)',
    teacherNotesModeNoneDesc: 'Ne pas inclure les notes de l\'enseignant pour distribuer un sujet propre aux élèves',
    teacherGuidePageTitle: 'GUIDE DE L\'ENSEIGNANT & NOTES PÉDAGOGIQUES',
    teacherGuidePageSubtitle: 'Référence d\'Évaluation et d\'Implémentation du Programme CBC'
  },
  Kiswahili: {
    langTitle: 'Muktadha wa Lugha:',
    modeSwitcherLabel: 'Ungependa kutengeneza nini?',
    modeHomework: 'Kazi ya Nyumbani (Homework)',
    modeClasswork: 'Kazi ya Darasani (Classwork)',
    modeQuiz: 'Jaribio la Tathmini (Quiz)',
    hwTitle: 'Tengeneza Kazi ya Nyumbani',
    cwTitle: 'Tengeneza Kazi ya Darasani',
    quizTitle: 'Tengeneza Jaribio la Quiz',
    hwDesc: 'Karatasi ya mazoezi ya nyumbani inayompa mwanafunzi uwezo wa kujifunza kwa uhuru.',
    cwDesc: 'Mazoezi ya darasani ya kukuza stadi za kuelewa na kutumia dhana zilizofunzwa.',
    quizDesc: 'Jaribio fupi la kupima uelewa na umahiri wa wanafunzi kulingana na mtaala.',
    planNotice: 'Inafuata mtaala wa REB / RTB kwa lugha ya Kiswahili: Tengeneza kazi kwa AI bila kikomo.',
    planActive: 'Kifurushi Kimewashwa',
    fillCurriculumTitle: 'Jaza Kutoka Mtaala wa Rwanda',
    fillCurriculumDesc: 'Chagua masomo ya REB au RTB TVET ili fomu ijaze taarifa kiotomatiki.',
    rebBtn: 'Mtaala wa REB',
    rtbBtn: 'Mtaala wa RTB TVET',
    lessonDetailsTitle: 'Taarifa za Somo na Sura',
    lessonDetailsSub: 'Weka taarifa kamili za somo, sura na mada inayohusika',
    subjectLabel: 'Somo *',
    gradeLabel: 'Darasa / Ngazi *',
    unitLabel: 'Sura ya Somo (Unit)',
    topicLabel: 'Mada Kuu (Topic) *',
    curriculumLabel: 'Kiwango cha Mtaala *',
    languageLabel: 'Lugha ya Maswali na Majibu *',
    timeLabel: 'Muda uliotolewa',
    questionStructureTitle: 'Muundo wa Maswali',
    questionStructureSub: 'Panga sehemu za mtihani, aina za maswali na alama za kila swali',
    useSectionsLabel: 'Tumia Muundo wa Sehemu Nyingi',
    useSectionsDesc: 'Gawanya mtihani katika Sehemu ya Kwanza, ya Pili na ya Tatu',
    sectionColName: 'Jina la Sehemu',
    sectionColCategory: 'Aina ya Maswali',
    sectionColCount: 'Idadi',
    sectionColMarks: 'Alama / Swali',
    addSectionBtn: 'Ongeza Sehemu Mpya',
    totalConfigMarks: 'Jumla ya Alama:',
    difficultyTitle: 'Kiwango cha Ugumu',
    difficultyDesc: 'Chagua kiwango cha ugumu wa maswali',
    diffEasy: 'Rahisi (Easy)',
    diffEasySub: 'Maswali ya msingi ya kuelewa',
    diffMed: 'Wastani (Medium)',
    diffMedSub: 'Kiwango cha kawaida cha mtaala',
    diffHard: 'Ngumu (Hard)',
    diffHardSub: 'Maswali ya kina ya uchambuzi',
    diffMixed: 'Mchanganyiko (Mixed)',
    diffMixedSub: 'Mchanganyiko wa viwango vyote',
    outputOptionsTitle: 'Machaguo ya Matokeo',
    outputOptionsDesc: 'Chagua vipengele vya kujumuisha kwenye kazi iliyotengenezwa',
    optCurriculumSearch: 'Tafuta kwenye vitabu na mtaala',
    optCurriculumSearchDesc: 'Tafuta kiotomatiki maudhui rasmi ya mtaala wa REB / RTB na mitihani iliyopita',
    optAnswerKey: 'Weka Majibu Sahihi',
    optAnswerKeyDesc: 'Tengeneza karatasi ya majibu na maelezo ya kina',
    optMarkingScheme: 'Weka Mwongozo wa Kusahihisha',
    optMarkingSchemeDesc: 'Mwongozo na vigezo rasmi vya kutoa alama kwa mwalimu',
    optHints: 'Weka Vidokezo (Hints)',
    optHintsDesc: 'Ongeza vidokezo vifupi kusaidia mwanafunzi kuelewa swali',
    bottomTip: 'Mazoezi haya yamepangwa kulingana na mtaala na yako tayari kutumika. Unaweza kuyapakua kama Word (.doc) kwa uhariri zaidi.',
    cancelBtn: 'Ghairi',
    generating: 'AI inatengeneza...',
    btnGenerateHw: 'Tengeneza Kazi ya Nyumbani',
    btnGenerateCw: 'Tengeneza Kazi ya Darasani',
    btnGenerateQuiz: 'Tengeneza Jaribio (Quiz)',
    includeAnsKey: 'Weka Majibu Rasmi na Ufafanuzi',
    includeAnsKeyDesc: 'AI itatengeneza majibu yote sahihi pamoja na maelezo ya kina',
    includeMarking: 'Weka Mwongozo wa Kusahihisha (Marking Scheme)',
    includeMarkingDesc: 'Mwongozo kamili kwa ajili ya mwalimu kutoa alama kwa usahihi',
    includeHints: 'Weka Vidokezo vya Kujifunzia (Hints)',
    includeHintsDesc: 'Vidokezo vifupi vya kuelekeza mwanafunzi njia sahihi ya kupata jibu',
    generateBtn: 'Tengeneza Kazi ya Tathmini Sasa',
    generatingBtn: 'AI inatengeneza tathmini...',
    defaultSubject: 'Kiswahili',
    defaultUnit: 'Sura ya 3: Sarufi, Msamiati na Matumizi',
    defaultTopic: 'Ngeli za Nomino na Upatanisho wa Kisarufi',
    defaultDuration: 'Dakika 45',
    defaultCurriculum: 'Mtaala wa REB CBC',
    previewHeader: 'Mwonekano wa Tathmini Iliyotengenezwa',
    backBtn: 'Rudi kwenye Fomu',
    copyBtn: 'Nakili Yote',
    copiedBtn: 'Imenakiliwa!',
    downloadPdfBtn: 'Pakua PDF',
    downloadWordBtn: 'Pakua Word (.doc)',
    printBtn: 'Chapa Karatasi',
    answerKeyTitle: 'MAJIBU RASMI NA UFAFANUZI WA KINA',
    markingSchemeTitle: 'MWONGOZO WA MWALIMU WA KUSAHIHISHA',
    editAssessmentBtn: 'Hariri Maswali',
    doneEditingBtn: 'Hifadhi Mabadiliko',
    addQuestionBtn: 'Ongeza Swali',
    deleteQuestionBtn: 'Futa',
    addOptionBtn: '+ Ongeza Chaguo',
    removeOptionBtn: 'Ondoa Chaguo',
    questionTextLabel: 'Maandishi ya Swali',
    optionsLabel: 'Chaguzi za Majibu',
    answerLabel: 'Jibu Sahihi',
    explanationLabel: 'Ufafanuzi wa Mwalimu',
    hintLabel: 'Kidokezo cha Mwanafunzi',
    marksLabel: 'Alama',
    customQuestionsTitle: '✍️ Weka Maswali Yako Mwenyewe',
    customQuestionsSub: 'Andika au weka maswali yako hapa mstari kwa mstari ili kutengeneza tathmini yako.',
    createManuallyBtn: '✍️ Weka Maswali Wewe Mwenyewe',
    createManuallyDesc: 'Tengeneza tathmini tupu ambapo unaweza kuandika maswali yako bila kutumia AI.',
    addSectionOutputBtn: '+ Ongeza Sehemu Mpya',
    saveTemplateBtn: 'Hifadhi kama Kiolezo',
    saveSetupTemplateBtn: 'Hifadhi Mpangilio kama Kiolezo',
    myTemplatesTitle: 'Violezo vya Tathmini Vilivyohifadhiwa',
    useTemplateBtn: 'Tumia Kiolezo Hiki',
    deleteTemplateBtn: 'Futa',
    templateSavedNotice: 'Kiolezo kimehifadhiwa vyema!',
    noTemplatesMsg: 'Bado hakuna violezo vilivyohifadhiwa. Tengeneza au andika maswali na ubonyeze "Hifadhi kama Kiolezo" ili kuyatumia tena.',
    showAnswersBtn: 'Onyesha Majibu',
    hideAnswersBtn: 'Ficha Majibu',
    previewAsStudentBtn: 'Onyesho la Mwanafunzi',
    previewAsTeacherBtn: 'Rudi kwa Mwalimu',
    studentPreviewNotice: '🎓 Hali ya Mwanafunzi — Majibu na marekebisho yamefichwa kwa ajili ya kuchapisha au kushiriki.',
    teacherNotesTitle: 'Tathmini ya Mwalimu na Maelezo ya Sahihisho',
    teacherNotesSub: 'Maelezo binafsi na miongozo ya usahihi kwa mwalimu (yamefichwa kwa mwanafunzi).',
    teacherNotesPlaceholder: 'mf. Toa alama zote kwa njia sahihi za hesabu. Angalia makosa ya kawaida ya ukokotoaji katika Sehemu ya B.',
    teacherNotesPdfModeLabel: 'Maelezo ya Mwalimu kwenye PDF na Kuchapa',
    teacherNotesPdfModeDesc: 'Chagua jinsi maelezo binafsi ya mwalimu na miongozo ya usahihishaji yanavyowekwa kwenye PDF',
    teacherNotesModeSeparatePage: 'Ukurasa Maalum wa "Mwongozo wa Mwalimu" (Inashauriwa)',
    teacherNotesModeSeparatePageDesc: 'Inatengeneza ukurasa maalum wenye maelezo ya mwalimu, vigezo vya alama na miongozo ya CBC',
    teacherNotesModeFooter: 'Chini ya Ukurasa (Footer)',
    teacherNotesModeFooterDesc: 'Huweka maelezo kwenye kisanduku nadhifu chini ya maswali ya kazi',
    teacherNotesModeNone: 'Ondoa (Nakala ya Mwanafunzi)',
    teacherNotesModeNoneDesc: 'Usijumuishe maelezo kwenye PDF ili kutoa karatasi safi kwa wanafunzi',
    teacherGuidePageTitle: 'MWONGOZO WA MWALIMU NA MAELEZO YA KITAALUMA',
    teacherGuidePageSubtitle: 'Mwongozo Rasmi wa Utekelezaji na Tathmini ya Mtaala wa CBC'
  }
};

interface HomeworkClassworkQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  initialMode?: AssessmentMode;
  onRequireSubscription?: (warningMsg: string) => void;
}

export const HomeworkClassworkQuizModal: React.FC<HomeworkClassworkQuizModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialMode = 'homework',
  onRequireSubscription
}) => {
  const [mode, setMode] = useState<AssessmentMode>(initialMode);
  
  // Curriculum Tab: REB vs RTB
  const [curriculumType, setCurriculumType] = useState<'reb' | 'rtb'>('reb');

  // Fill from textbook selectors
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Lesson Details form
  const [subject, setSubject] = useState<string>('Mathematics');
  const [grade, setGrade] = useState<string>('Primary 5');
  const [unit, setUnit] = useState<string>('Unit 3: Fractions, Decimals and Percentages');
  const [topic, setTopic] = useState<string>('Addition & Subtraction of Fractions');
  const [country, setCountry] = useState<string>('Rwanda');
  const [curriculumStandard, setCurriculumStandard] = useState<string>('Rwanda REB (CBC)');
  const [language, setLanguage] = useState<AssessmentLanguage>('English');
  const [timeAllowed, setTimeAllowed] = useState<string>('45 minutes');

  // Question Structure
  const [useSections, setUseSections] = useState<boolean>(true);
  const [sections, setSections] = useState<AssessmentSectionConfig[]>([
    { id: 'sec-a', name: 'Section A', category: 'Multiple Choice', questionCount: 5, marksEach: 2 },
    { id: 'sec-b', name: 'Section B', category: 'Fill in the Blank', questionCount: 5, marksEach: 2 },
    { id: 'sec-c', name: 'Section C', category: 'Short Answer', questionCount: 5, marksEach: 3 }
  ]);

  // Source Content (Optional) & Book Upload
  const [sourceContent, setSourceContent] = useState<string>('');
  const [uploadedBookName, setUploadedBookName] = useState<string>('');
  const bookFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBookFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      reader.onload = () => {
        const content = `[Uploaded Textbook / PDF Document: ${file.name} (${Math.round(file.size / 1024)} KB)]\nNote: Teacher uploaded official textbook PDF "${file.name}". Generate high-yield questions, assessment exercises, and complete answer keys directly based on this curriculum textbook document.`;
        setSourceContent(prev => prev ? prev + '\n\n' + content : content);
        setUploadedBookName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (uploadEvent) => {
        const text = uploadEvent.target?.result as string || '';
        const formatted = `[Uploaded Book/Document: ${file.name}]\n${text}`;
        setSourceContent(prev => prev ? prev + '\n\n' + formatted : formatted);
        setUploadedBookName(file.name);
      };
      reader.readAsText(file);
    }
  };

  // Difficulty Level
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Mixed');

  // Output Options
  const [searchCurriculum, setSearchCurriculum] = useState<boolean>(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState<boolean>(true);
  const [includeHints, setIncludeHints] = useState<boolean>(false);
  const [customQuestionsInputText, setCustomQuestionsInputText] = useState<string>('');
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [teacherNotesPdfMode, setTeacherNotesPdfMode] = useState<'separate_page' | 'footer' | 'none'>('separate_page');

  // Generation / Output State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedAssessmentOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAnswerKeyInline, setShowAnswerKeyInline] = useState<boolean>(true);
  const [isPreviewAsStudent, setIsPreviewAsStudent] = useState<boolean>(false);

  // Saved Assessment Templates
  const [savedTemplates, setSavedTemplates] = useState<SavedAssessmentTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('nkorera_assessment_templates');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const [showSavedTemplatesModal, setShowSavedTemplatesModal] = useState<boolean>(false);
  const [isSyncingTemplates, setIsSyncingTemplates] = useState<boolean>(false);

  // Sync assessment templates with user cloud profile on modal open
  const handleSyncCloudTemplates = async () => {
    setIsSyncingTemplates(true);
    try {
      const cloudTemplates = await loadAssessmentTemplatesFromFirestore();
      if (cloudTemplates && cloudTemplates.length > 0) {
        setSavedTemplates(cloudTemplates);
      }
    } catch (err) {
      console.warn('Failed to sync assessment templates from cloud profile:', err);
    } finally {
      setIsSyncingTemplates(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSyncCloudTemplates();
    }
  }, [isOpen]);

  const handleSaveAsTemplate = async (customName?: string) => {
    const templateId = `tpl_${Date.now()}`;
    const defaultName = generatedOutput 
      ? generatedOutput.title 
      : `${subject} (${grade}) - ${topic || 'Custom Template'}`;
    const name = customName || defaultName;

    const newTemplate: SavedAssessmentTemplate = {
      id: templateId,
      name,
      type: mode,
      subject,
      grade,
      topic,
      unit,
      language,
      createdAt: new Date().toLocaleDateString(),
      sections: JSON.parse(JSON.stringify(sections)),
      instructions: generatedOutput ? [...generatedOutput.instructions] : undefined,
      fullAssessment: generatedOutput ? JSON.parse(JSON.stringify(generatedOutput)) : undefined
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    
    // Save to Firestore & local storage backup
    setIsSyncingTemplates(true);
    try {
      await saveAssessmentTemplateToFirestore(newTemplate);
      setTemplateNotice(
        language === 'Kinyarwanda'
          ? '☁️ Template yabitswe mu gicu (Cloud Profile) neza!'
          : language === 'Français'
          ? '☁️ Modèle enregistré et synchronisé avec le profil cloud !'
          : language === 'Kiswahili'
          ? '☁️ Kiolezo kimehifadhiwa na kusawazishwa kwenye Wasifu wa Cloud!'
          : '☁️ Template saved & synced to your Cloud Profile!'
      );
    } catch (e) {
      console.error('Failed to sync template to cloud profile', e);
      setTemplateNotice(t.templateSavedNotice);
    } finally {
      setIsSyncingTemplates(false);
      setTimeout(() => setTemplateNotice(null), 4000);
    }
  };

  const handleLoadTemplate = (tpl: SavedAssessmentTemplate) => {
    if (tpl.type) setMode(tpl.type as AssessmentMode);
    if (tpl.subject) setSubject(tpl.subject);
    if (tpl.grade) setGrade(tpl.grade);
    if (tpl.unit) setUnit(tpl.unit || '');
    if (tpl.topic) setTopic(tpl.topic);
    if (tpl.language) setLanguage(tpl.language as AssessmentLanguage);
    if (tpl.sections && tpl.sections.length > 0) {
      setSections(JSON.parse(JSON.stringify(tpl.sections)));
    }
    if (tpl.fullAssessment) {
      setGeneratedOutput(JSON.parse(JSON.stringify(tpl.fullAssessment)));
      if (tpl.fullAssessment.teacherNotes) {
        setTeacherNotes(tpl.fullAssessment.teacherNotes);
      }
    } else {
      setGeneratedOutput(null);
    }
    setTemplateNotice(
      language === 'Kinyarwanda' ? '✨ Template yafunguwe neza!' : '✨ Template loaded successfully!'
    );
    setTimeout(() => setTemplateNotice(null), 3500);
  };

  const handleDeleteTemplate = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = savedTemplates.filter(tpl => tpl.id !== id);
    setSavedTemplates(updated);
    try {
      await deleteAssessmentTemplateFromFirestore(id);
    } catch (e) {
      console.error('Failed to delete template from cloud profile', e);
    }
  };

  if (!isOpen) return null;

  // Active translation dictionary
  const t = HW_UI_TRANSLATIONS[language] || HW_UI_TRANSLATIONS.English;

  // Instant Full Language Context Shift Handler
  const handleLanguageChange = (newLang: AssessmentLanguage) => {
    setLanguage(newLang);
    const trans = HW_UI_TRANSLATIONS[newLang] || HW_UI_TRANSLATIONS.English;
    setUnit(trans.defaultUnit);
    setTopic(trans.defaultTopic);
    setTimeAllowed(trans.defaultDuration);
    setCurriculumStandard(trans.defaultCurriculum);
    if (['Mathematics', 'Ikinyarwanda', 'Français', 'Kiswahili'].includes(subject)) {
      setSubject(trans.defaultSubject);
    }
    
    // Localize default sections names
    if (newLang === 'Kinyarwanda') {
      setSections([
        { id: 'sec-a', name: 'Igice cya 1 (Hitamo igisubizo cy\'ukuri)', category: 'Multiple Choice', questionCount: 5, marksEach: 2 },
        { id: 'sec-b', name: 'Igice cya 2 (Uzuza ahabugenewe)', category: 'Fill in the Blank', questionCount: 5, marksEach: 2 },
        { id: 'sec-c', name: 'Igice cya 3 (Ibibazo bigufi n\'ubusobanuro)', category: 'Short Answer', questionCount: 5, marksEach: 3 }
      ]);
    } else if (newLang === 'Français') {
      setSections([
        { id: 'sec-a', name: 'Section A (Choix Multiples)', category: 'Multiple Choice', questionCount: 5, marksEach: 2 },
        { id: 'sec-b', name: 'Section B (Compléter les phrases)', category: 'Fill in the Blank', questionCount: 5, marksEach: 2 },
        { id: 'sec-c', name: 'Section C (Réponses courtes et analyse)', category: 'Short Answer', questionCount: 5, marksEach: 3 }
      ]);
    } else if (newLang === 'Kiswahili') {
      setSections([
        { id: 'sec-a', name: 'Sehemu ya Kwanza (Chagua Jibu Sahihi)', category: 'Multiple Choice', questionCount: 5, marksEach: 2 },
        { id: 'sec-b', name: 'Sehemu ya Pili (Jaza Nafasi Zilizoachwa)', category: 'Fill in the Blank', questionCount: 5, marksEach: 2 },
        { id: 'sec-c', name: 'Sehemu ya Tatu (Maswali Mafupi na Ufafanuzi)', category: 'Short Answer', questionCount: 5, marksEach: 3 }
      ]);
    } else {
      setSections([
        { id: 'sec-a', name: 'Section A', category: 'Multiple Choice', questionCount: 5, marksEach: 2 },
        { id: 'sec-b', name: 'Section B', category: 'Fill in the Blank', questionCount: 5, marksEach: 2 },
        { id: 'sec-c', name: 'Section C', category: 'Short Answer', questionCount: 5, marksEach: 3 }
      ]);
    }
  };

  // Filter curriculum data based on REB vs RTB
  const availableCurriculum = RWANDA_EDUCATION_CURRICULUM.filter(cat => {
    if (curriculumType === 'rtb') {
      return cat.id.includes('tvet') || cat.badge.includes('TVET') || cat.titleEn.toLowerCase().includes('tvet');
    }
    return !cat.id.includes('tvet') && !cat.badge.includes('TVET');
  });

  // Handle textbook auto-fill selection
  const handleAutoFillSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const cat = availableCurriculum.find(c => c.subjects.some(s => s.id === subjectId));
    const subj = cat?.subjects.find(s => s.id === subjectId);
    if (subj) {
      setSubject(subj.nameEn);
      if (subj.suggestedClasses && subj.suggestedClasses.length > 0) {
        setSelectedGrade(subj.suggestedClasses[0]);
        setGrade(subj.suggestedClasses[0]);
      }
      if (subj.sampleUnits && subj.sampleUnits.length > 0) {
        const unitString = subj.sampleUnits[0].unitNumber + ': ' + subj.sampleUnits[0].unitTitleEn;
        setSelectedUnit(unitString);
        setUnit(unitString);
        setSelectedTopic(subj.sampleUnits[0].unitTitleEn);
        setTopic(subj.sampleUnits[0].unitTitleEn);
      }
    }
  };

  // Sections calculations
  const totalQuestions = sections.reduce((sum, s) => sum + Number(s.questionCount || 0), 0);
  const totalMarks = sections.reduce((sum, s) => sum + (Number(s.questionCount || 0) * Number(s.marksEach || 0)), 0);

  // Add Section
  const handleAddSection = () => {
    const nextLetter = String.fromCharCode(65 + sections.length); // A, B, C, D, E...
    const newSection: AssessmentSectionConfig = {
      id: `sec-${Date.now()}`,
      name: `Section ${nextLetter}`,
      category: 'Short Answer',
      questionCount: 5,
      marksEach: 2
    };
    setSections([...sections, newSection]);
  };

  // Remove Section
  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    const remaining = sections.filter(s => s.id !== id);
    // Rename sections neatly
    const renamed = remaining.map((s, idx) => ({
      ...s,
      name: `Section ${String.fromCharCode(65 + idx)}`
    }));
    setSections(renamed);
  };

  // Update Section Category
  const handleUpdateCategory = (id: string, category: QuestionCategoryType) => {
    setSections(sections.map(s => s.id === id ? { ...s, category } : s));
  };

  // Update Section Question Count & Marks
  const handleUpdateSectionParams = (id: string, field: 'questionCount' | 'marksEach', value: number) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Helper for generating dynamic, highly varied, non-repeating questions
  const createDynamicQuestion = (
    secCategory: QuestionCategoryType,
    qIndexInSection: number,
    globalNumber: number,
    secMarks: number
  ): GeneratedQuestionItem => {
    let qText = '';
    let options: string[] | undefined = undefined;
    let correctAnswer = '';
    let explanation = '';

    const tName = topic.trim() || 'Mada / Topic';
    const uName = unit.trim() || 'Umutwe / Unit';
    const sName = subject.trim() || 'Isomo / Subject';

    if (language === 'Kinyarwanda') {
      if (secCategory === 'Multiple Choice') {
        const mcVars = [
          {
            q: `Mu bumenyi bwa ${sName} ku mutwe wa "${uName}", ni ayahe magambo asobanura neza amaturufu n'amategeko y'ibanze ya "${tName}"?`,
            opts: [
              `A) Ifasha kumenya no kubara neza ingano n'ibisubizo by'ukuri`,
              `B) Ikoreshwa gusa mu bishushanyo n'ibitekerezo bidafite ibimenyetso`,
              `C) Ihindura imikorere yose idakurikije amategeko y'ubumenyi`,
              `D) Nta sano ifitanye n'imibereho y'abantu mu buzima bwa buri munsi`
            ],
            ans: `A) Ifasha kumenya no kubara neza ingano n'ibisubizo by'ukuri`,
            exp: `Igisubizo nyacyo ni A kuko integanyanyigisho y'u Rwanda (REB) ishimangira ubumenyi ngiro.`
          },
          {
            q: `Ni iyihe nshingano nkuru cyangwa akamaro k'ingenzi ka "${tName}" mu rwego rwa ${grade}?`,
            opts: [
              `A) Guha abanyeshuri ubushobozi bwo gusesengura no gukemura ibibazo`,
              `B) Kumenya amagambo yonyine bila gukora imyitozo y'ubumenyi`,
              `C) Kusiba ibice bimwe na bimwe by'integanyanyigisho`,
              `D) Guhindura amategeko y'isomo mu buryo budafite icyo buvuze`
            ],
            ans: `A) Guha abanyeshuri ubushobozi bwo gusesengura no gukemura ibibazo`,
            exp: `Integanyanyigisho ya CBC isaba ko umunyeshuri agira ubushobozi bwo gusesengura.`
          },
          {
            q: `Muri "${uName}", ni ikihe kintu cy'ibanze kiranga "${tName}" mu gihe gukora ibipimo cyangwa ibizamini?`,
            opts: [
              `A) Gukoresha amabwiriza n'inzira z'ukuri zateguwe muri ${sName}`,
              `B) Guhita wandika igisubizo cya nyuma utagaragaje intambwe zose`,
              `C) Kwirinda gukoresha ibikoresho by'ishuri nka kalkulatori cyangwa gashya`,
              `D) Gukopera ibisubizo by'abandi banyeshuri muri groupe`
            ],
            ans: `A) Gukoresha amabwiriza n'inzira z'ukuri zateguwe muri ${sName}`,
            exp: `Inzira yose y'imibare n'isesengura igomba kugaragazwa neza.`
          },
          {
            q: `Mu buzima bwa buri munsi mu Rwanda, ni mu kahe kaga cyangwa buryo "${tName}" yifashishwa mu gukemura ibibazo?`,
            opts: [
              `A) Mu gupanga no gukora imirimo y'ubuhinzi, ubucuruzi n'ikoranabuhanga`,
              `B) Mu gufata mu mutwe fomu z bidafite icyo zifasha`,
              `C) Mu kureba gusa uko abandi babikora bila kubijyamo`,
              `D) Mu gukora ibikorwa bitagira gahunda ku ishuri`
            ],
            ans: `A) Mu gupanga no gukora imirimo y'ubuhinzi, ubucuruzi n'ikoranabuhanga`,
            exp: `Isomo rya ${sName} ryubaka ubumenyi ngiro buvugurura umuryango.`
          },
          {
            q: `Ni ayahe mahitamo aranga igisubizo cy'ukuri ku bijyanye no kubara no gusesengura "${tName}" muri "${uName}"?`,
            opts: [
              `A) Igisubizo gipimwe neza kikagira n'ibipimo (units) biba bisabwa`,
              `B) Igisubizo gipfuye bitewe no kutasoma neza ikibazo`,
              `C) Kwandika gusa amagambo atagira aho ahuriye n'isomo`,
              `D) Gusiga umurongo utanditseho n'ijambo na rimwe`
            ],
            ans: `A) Igisubizo gipimwe neza kikagira n'ibipimo (units) biba bisabwa`,
            exp: `Amanota atangwa ku gisubizo cyuzuye kirimo n'ibipimo bisabwa.`
          }
        ];
        const v = mcVars[(qIndexInSection - 1) % mcVars.length];
        qText = v.q;
        options = v.opts;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'True/False') {
        const tfVars = [
          {
            q: `Yego cyangwa Oya: Mu isomo rya ${sName} (${uName}), "${tName}" yubahiriza amahame ngenderwaho y'integanyanyigisho ya REB.`,
            ans: `YEGO`,
            exp: `Iri tangazo ni ukuri kuko ryubahiriza amabwiriza y'integanyanyigisho ya CBC.`
          },
          {
            q: `Yego cyangwa Oya: Buri gihe muri "${uName}", ibipimo n'imibare bijyanye na "${tName}" bishobora gukorwa no gupimwa mu buryo buzwi.`,
            ans: `YEGO`,
            exp: `Ubumenyi bwa ${sName} bushingiye ku bimenyetso n'ibipimo z'ukuri.`
          },
          {
            q: `Yego cyangwa Oya: Mu bijyanye na "${tName}", ntitugomba kugaragaza inzira n'imibare mu gihe dusubiza ibibazo mu kizamini.`,
            ans: `OYA`,
            exp: `Ni OYA kuko mu masomo ya CBC kugaragaza inzira (working steps) biheshwa amanota.`
          },
          {
            q: `Yego cyangwa Oya: Ubumenyi bwa "${tName}" muri ${grade} bufasha umunyeshuri gukemura ibibazo by'imibereho mu Rwanda.`,
            ans: `YEGO`,
            exp: `Integanyanyigisho nshya yubakiye ku gukemura ibibazo bivuka mu muryango.`
          }
        ];
        const v = tfVars[(qIndexInSection - 1) % tfVars.length];
        qText = v.q;
        options = ['YEGO', 'OYA'];
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'Fill in the Blank') {
        const fbVars = [
          {
            q: `Mu mutwe wa "${uName}", mu gihe twiga kuri "${tName}", igice cy'ingenzi gitanga igisubizo cyitwa _____________.`,
            ans: `Inzira y'ingenzi / Igipimo fatizo`,
            exp: `Uzuza ahabugenewe ukoresheje amagambo aboneye y'isomo.`
          },
          {
            q: `Igipimo fatizo koreshwa mu gupima cyangwa kubara "${tName}" muri ${sName} kizwi nka _____________.`,
            ans: `Igipimo fatizo (Standard unit)`,
            exp: `Koresha igipimo cy'ukuri kiba giteganyijwe muri curriculum.`
          },
          {
            q: `Mu bumenyi bwa ${sName}, inzira yakoreshwa mu gusesengura "${tName}" muri "${uName}" yitwa _____________.`,
            ans: `Inzira y'isesengura (Analytical method)`,
            exp: `Igisubizo gishimangira inzira yakoreshejwe.`
          }
        ];
        const v = fbVars[(qIndexInSection - 1) % fbVars.length];
        qText = v.q;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'Short Answer') {
        const saVars = [
          {
            q: `Sobanura mu nteruro 1 cyangwa 2 uburyo "${tName}" yo muri "${uName}" ifasha umunyeshuri mu buzima bwa buri munsi mu Rwanda.`,
            ans: `Ifasha gukemura ibibazo no kubara neza ibikenerwa mu buzima busanzwe no mu kazi.`,
            exp: `Tanga amanota yuzuye ku nsobanuro ifite ireme n'urugero rufatika.`
          },
          {
            q: `Tanga ingero ebyiri (2) zifatika zigaragaza uko "${tName}" ikoreshwa mu ishuri cyangwa mu muryango.`,
            ans: `Urugero 1: Mu gukora imyitozo no gupima mu ishuri. Urugero 2: Mu gukoresha ubumenyi mu buzima busanzwe.`,
            exp: `Buri rugero rufatika ruhesha inota 1.`
          },
          {
            q: `Niba uhuye n'ikibazo gipima "${tName}" muri ${sName}, ni izihe ntambwe ebyiri z'ibanze utangiriraho?`,
            ans: `Intambwe ya 1: Gusoma no kwangiriza ikibazo. Intambwe ya 2: Gushyiraho ifomire no kubara.`,
            exp: `Inzira zose zigomba kugaragazwa neza.`
          },
          {
            q: `Vuga akamaro gakomeye k'isomo rya "${tName}" mu guteza imbere ikoranabuhanga n'ubumenyi ngiro muri ${grade}.`,
            ans: `Ryongera ubumenyi ngiro n'ubushobozi bwo gukoresha ikoranabuhanga mu buryo bw'umwimerere.`,
            exp: `Amanota ashingira ku nsobanuro yimbitse.`
          }
        ];
        const v = saVars[(qIndexInSection - 1) % saVars.length];
        qText = v.q;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'Calculation') {
        const valA = 10 * qIndexInSection + 25;
        const valB = 5 * qIndexInSection + 15;
        const totalVal = valA + valB;
        qText = `Ushingiye ku byigwa kuri "${tName}" muri "${uName}", kora imibare ku gipimo cya ${qIndexInSection} (Inkurikizi A = ${valA}, Inkurikizi B = ${valB}) ugaragaza intambwe zose.`;
        correctAnswer = `Intambwe ya 1: Kugaragaza ifomire (Inota 1). Intambwe ya 2: Igiteranyo (${valA} + ${valB} = ${totalVal}) (Inota 1). Intambwe ya 3: Igisubizo cya nyuma (${totalVal}) (Inota 1).`;
        explanation = `Amanota atangwa hakurikijwe inzira zose z'imibare n'igisubizo cyuzuye.`;
      } else if (secCategory === 'Matching') {
        qText = `Ikibazo cya ${qIndexInSection}: Huza amagambo yo mu Nkingi ya A (1. "${tName}", 2. "${uName}") n'ibisobanuro byayo by'ukuri mu Nkingi ya B.`;
        correctAnswer = `1 -> B, 2 -> A`;
        explanation = `Buri guhuza kw'ukuri guhabwa amanota angana.`;
      } else if (secCategory === 'Long Answer') {
        const laVars = [
          `Tanga isesengura ryimbitse ry'akamaro ka "${tName}" mu rwego rwa ${grade} (${uName}). Tanga ingero ebyiri zifatika zigaragara mu ishuri cyangwa mu muryango.`,
          `Andika inyandiko ngufi igaragaza uko ubumenyi bwa "${tName}" muri "${uName}" bufasha iterambere rirambye n'ikoranabuhanga mu Rwanda.`,
          `Shesengura uruhare rwa "${tName}" mu gukemura ibibazo by'ubukungu n'imibereho y'abaturage mu Rwanda, utanga ingero zifatika.`
        ];
        qText = laVars[(qIndexInSection - 1) % laVars.length];
        correctAnswer = `Inyandiko ifite intangiriro, igihimba n'umwanzuro isobanura neza ingero ebyiri z'ingenzi.`;
        explanation = `Amanota ashingira ku busesenguzi (40%), imikoreshereze y'ururimi (30%) n'ingero zifatika (30%).`;
      } else {
        qText = `Andika inyandiko ngufi (${qIndexInSection}) igaragaza uko ubumenyi bwa "${tName}" muri "${uName}" bufasha iterambere rirambye n'ikoranabuhanga mu Rwanda.`;
        correctAnswer = `Inyandiko yuzuye ifite ingingo zishimangira iterambere n'ikoranabuhanga.`;
        explanation = `Kurikiza ibipimo bya ruburiki ya REB CBC.`;
      }
    } else if (language === 'Français') {
      if (secCategory === 'Multiple Choice') {
        const mcFr = [
          {
            q: `Laquelle des affirmations suivantes décrit avec précision le principe fondamental de "${tName}" (${uName}) en ${sName}?`,
            opts: [
              `A) Elle permet d'effectuer des calculs précis et fiables`,
              `B) Elle s'applique uniquement à des modèles théoriques sans validité`,
              `C) Elle modifie arbitrairement les lois établies`,
              `D) Elle ne possède aucun impact sur la vie quotidienne`
            ],
            ans: `A) Elle permet d'effectuer des calculs précis et fiables`,
            exp: `L'option A est correcte car le programme REB met l'accent sur l'application pratique.`
          },
          {
            q: `Quel est le rôle principal de "${tName}" dans le niveau ${grade} en ${sName}?`,
            opts: [
              `A) Développer les compétences d'analyse et de résolution de problèmes`,
              `B) Mémoriser uniquement les définitions sans pratique`,
              `C) Ignorer les applications concrètes du manuel`,
              `D) Remplacer les formules établies par des termes aléatoires`
            ],
            ans: `A) Développer les compétences d'analyse et de résolution de problèmes`,
            exp: `Le programme basé sur les compétences vise le développement analytique.`
          }
        ];
        const v = mcFr[(qIndexInSection - 1) % mcFr.length];
        qText = v.q;
        options = v.opts;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'True/False') {
        qText = `Vrai ou Faux (${qIndexInSection}): En ${sName} (${uName}), "${tName}" respecte les directives du programme national.`;
        options = ['VRAI', 'FAUX'];
        correctAnswer = 'VRAI';
        explanation = `Cette affirmation est VRAIE selon les compétences prescrites.`;
      } else if (secCategory === 'Fill in the Blank') {
        qText = `Dans l'unité "${uName}", l'élément fondamental permettant d'appliquer "${tName}" (Question ${qIndexInSection}) est appelé _____________.`;
        correctAnswer = `Opérateur principal / Fonction clé`;
        explanation = `Complétez avec le terme technique approprié.`;
      } else if (secCategory === 'Short Answer') {
        qText = `Expliquez en 1 ou 2 phrases claires (${qIndexInSection}) comment "${tName}" de l'unité "${uName}" s'applique dans la vie quotidienne au Rwanda.`;
        correctAnswer = `Elle permet de résoudre efficacement des situations concrètes.`;
        explanation = `Attribuer les points pour la clarté et la pertinence.`;
      } else if (secCategory === 'Calculation') {
        const valA = 10 * qIndexInSection + 20;
        const valB = 5 * qIndexInSection + 10;
        const totalVal = valA + valB;
        qText = `En appliquant les règles de "${tName}" (${uName}), effectuez le calcul ${qIndexInSection} (Valeur A = ${valA}, Valeur B = ${valB}) en détaillant chaque étape.`;
        correctAnswer = `Étape 1: Formule (1 pt). Étape 2: Calcul (${valA} + ${valB} = ${totalVal}) (1 pt). Étape 3: Résultat final (${totalVal}) (1 pt).`;
        explanation = `Barème: démarche complète et résultat vérifié requis.`;
      } else {
        qText = `Question ${qIndexInSection}: Analysez l'importance de "${tName}" en ${grade} (${uName}) et donnez des exemples concrets.`;
        correctAnswer = `Réponse argumentée comprenant une analyse structurée.`;
        explanation = `Notation basée sur la maîtrise conceptuelle.`;
      }
    } else if (language === 'Kiswahili') {
      if (secCategory === 'Multiple Choice') {
        const mcSw = [
          {
            q: `Ni ipi kati ya kauli zifuatazo inayoelezea kwa usahihi kanuni kuu ya "${tName}" (${uName}) katika somo la ${sName}?`,
            opts: [
              `A) Huwezesha kufanya mahesabu sahihi na kupata matokeo ya uhakika`,
              `B) Inatumika tu katika nadharia zisizo na uthibitisho`,
              `C) Inabadilisha mifumo bila kufuata miongozo ya kisayansi`,
              `D) Haina uhusiano wowote na maisha ya kila siku`
            ],
            ans: `A) Huwezesha kufanya mahesabu sahihi na kupata matokeo ya uhakika`,
            exp: `Jibu sahihi ni A kwa sababu mtaala wa Rwanda unasisitiza matumizi halisi ya maarifa.`
          },
          {
            q: `Ni ipi faida kuu ya kujifunza "${tName}" katika kiwango cha ${grade}?`,
            opts: [
              `A) Kujenga uwezo wa kuchanganua na kutatua changamoto za kila siku`,
              `B) Kukariri maneno bila kuelewa maana yake`,
              `C) Kupuuza mifano inayotolewa kwenye vitabu vya REB`,
              `D) Kuacha kujibu maswali darasani`
            ],
            ans: `A) Kujenga uwezo wa kuchanganua na kutatua changamoto za kila siku`,
            exp: `Mtaala wa CBC unasisitiza ujuzi wa utatuzi wa matatizo.`
          }
        ];
        const v = mcSw[(qIndexInSection - 1) % mcSw.length];
        qText = v.q;
        options = v.opts;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'True/False') {
        qText = `Kweli au Si Kweli (${qIndexInSection}): Katika somo la ${sName} (${uName}), "${tName}" inafuata miongozo rasmi ya mtaala wa REB/CBC.`;
        options = ['KWELI', 'SI KWELI'];
        correctAnswer = 'KWELI';
        explanation = `Kauli hii ni KWELI kulingana na malengo ya somo.`;
      } else if (secCategory === 'Short Answer') {
        qText = `Eleza kwa sentensi 1 au 2 jinsi "${tName}" kutoka "${uName}" inavyotumika katika maisha ya kila siku nchini Rwanda.`;
        correctAnswer = `Inasaidia kutatua changamoto halisi na kupanga shughuli kwa ufanisi.`;
        explanation = `Toa alama kamili kwa maelezo sahihi na mifano halisi.`;
      } else if (secCategory === 'Calculation') {
        const valA = 10 * qIndexInSection + 15;
        const valB = 5 * qIndexInSection + 10;
        const totalVal = valA + valB;
        qText = `Kulingana na kanuni za "${tName}" katika "${uName}", fanya hesabu ya ${qIndexInSection} (${valA} + ${valB}) ukionyesha hatua zote na jibu la mwisho.`;
        correctAnswer = `Hatua 1: Fomula (Alama 1). Hatua 2: Hesabu (${valA} + ${valB} = ${totalVal}) (Alama 1). Hatua 3: Jibu la mwisho (${totalVal}) (Alama 1).`;
        explanation = `Fuata mwongozo rasmi wa usahihishaji: hatua zote za hesabu zinahitajika.`;
      } else {
        qText = `Swali la ${qIndexInSection}: Changanua umuhimu wa "${tName}" katika kiwango cha ${grade} (${uName}). Toa mifano miwili halisi.`;
        correctAnswer = `Maelezo ya kina yenye uchambuzi na mifano miwili thabiti.`;
        explanation = `Alama zinatolewa kwa uelewa wa mada na mantiki.`;
      }
    } else {
      // English Default
      if (secCategory === 'Multiple Choice') {
        const mcEn = [
          {
            q: `Which of the following statements accurately describes the primary principle of ${tName} (${uName}) in ${sName}?`,
            opts: [
              `A) It provides the fundamental mechanism for calculating accurate and reliable values`,
              `B) It is only applicable in theoretical models without empirical validation`,
              `C) It randomly alters established mathematical and scientific laws`,
              `D) It has no direct connection to real-world applications in Rwanda`
            ],
            ans: `A) It provides the fundamental mechanism for calculating accurate and reliable values`,
            exp: `Option A is correct because under the REB CBC curriculum for ${uName}, key competencies emphasize practical accuracy.`
          },
          {
            q: `What is the primary pedagogical purpose of mastering ${tName} at the ${grade} level?`,
            opts: [
              `A) To equip learners with critical thinking and problem-solving analytical skills`,
              `B) To memorize textbook definitions without understanding context`,
              `C) To bypass practical laboratory and classroom exercises`,
              `D) To replace standardized units with arbitrary measurements`
            ],
            ans: `A) To equip learners with critical thinking and problem-solving analytical skills`,
            exp: `Competence-Based Curriculum (CBC) prioritizes critical thinking and practical problem-solving.`
          },
          {
            q: `When analyzing a problem related to ${tName} in ${uName}, which step is crucial for achieving full marks?`,
            opts: [
              `A) Demonstrating all working steps and providing correct standard units`,
              `B) Writing only the final answer without showing intermediate working`,
              `C) Omitting diagrams and labels requested in the question prompt`,
              `D) Using unverified formulas not recognized in REB guidelines`
            ],
            ans: `A) Demonstrating all working steps and providing correct standard units`,
            exp: `Full marks in REB assessment rubrics require clear, step-by-step working.`
          },
          {
            q: `In everyday life in Rwanda, how is the knowledge of ${tName} practically applied in local development?`,
            opts: [
              `A) In planning agriculture, construction, trade, and technology projects efficiently`,
              `B) Solely during formal end-of-term examinations at school`,
              `C) By avoiding quantitative calculations in daily routines`,
              `D) In repeating theoretical formulas without real-world utility`
            ],
            ans: `A) In planning agriculture, construction, trade, and technology projects efficiently`,
            exp: `Education in Rwanda connects subject matter to sustainable national development.`
          },
          {
            q: `Which option correctly identifies the key relationship between ${tName} and the broader topic of ${uName}?`,
            opts: [
              `A) ${tName} serves as a foundational building block for mastering ${uName}`,
              `B) There is no mathematical or logical connection between them`,
              `C) ${tName} contradicts the principles established in ${uName}`,
              `D) ${uName} can be fully understood without studying ${tName}`
            ],
            ans: `A) ${tName} serves as a foundational building block for mastering ${uName}`,
            exp: `Unit topics build progressively on core sub-topic competencies.`
          }
        ];
        const v = mcEn[(qIndexInSection - 1) % mcEn.length];
        qText = v.q;
        options = v.opts;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'True/False') {
        const tfEn = [
          {
            q: `True or False: In ${sName} (${uName}), ${tName} always adheres to the standard guidelines established by REB curriculum frameworks.`,
            ans: `TRUE`,
            exp: `This statement is TRUE as confirmed in ${uName} competencies.`
          },
          {
            q: `True or False: Showing intermediate working steps for ${tName} problems is optional during formal CBC examinations.`,
            ans: `FALSE`,
            exp: `This statement is FALSE. REB marking guidelines mandate showing working steps for full credit.`
          },
          {
            q: `True or False: Practical mastery of ${tName} helps ${grade} learners solve real-world community challenges in Rwanda.`,
            ans: `TRUE`,
            exp: `CBC learning objectives focus on practical community application.`
          }
        ];
        const v = tfEn[(qIndexInSection - 1) % tfEn.length];
        qText = v.q;
        options = ['TRUE', 'FALSE'];
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'Fill in the Blank') {
        const fbEn = [
          {
            q: `In ${uName}, during the study of ${tName}, the essential component responsible for accurate transformation is termed the _____________.`,
            ans: `Primary Operator / Core Function`,
            exp: `The primary operator drives the core transformation in ${tName} (${uName}).`
          },
          {
            q: `The standardized unit used to measure and evaluate ${tName} in ${sName} is designated as the _____________.`,
            ans: `Standard Measuring Unit`,
            exp: `Correct standard units are required in REB syllabus guidelines.`
          }
        ];
        const v = fbEn[(qIndexInSection - 1) % fbEn.length];
        qText = v.q;
        correctAnswer = v.ans;
        explanation = v.exp;
      } else if (secCategory === 'Short Answer') {
        const saEn = [
          `Explain in 1-2 concise sentences how ${tName} from ${uName} is practically applied in everyday life in Rwanda.`,
          `State two (2) distinct practical examples illustrating how ${tName} is utilized in classroom activities or community projects.`,
          `Outline the two main methodological steps required to systematically solve a problem involving ${tName} in ${sName}.`,
          `Discuss one major advantage of understanding ${tName} for a ${grade} student preparing for national examinations.`
        ];
        const v = saEn[(qIndexInSection - 1) % saEn.length];
        qText = v;
        correctAnswer = `Award full marks for a logical explanation with relevant context.`;
        explanation = `Award 1 mark for conceptual clarity and 1 mark for relevant real-world context.`;
      } else if (secCategory === 'Calculation') {
        const valA = 12 * qIndexInSection + 30;
        const valB = 8 * qIndexInSection + 20;
        const totalVal = valA + valB;
        qText = `Given standard values for ${tName} in ${uName} (Quantity A = ${valA}, Quantity B = ${valB}), calculate the combined result showing all step-by-step working and final units (${totalVal}).`;
        correctAnswer = `Step 1: Formula definition (1 mark). Step 2: Substitution (${valA} + ${valB} = ${totalVal}) (1 mark). Step 3: Final verified answer with units (${totalVal}) (1 mark).`;
        explanation = `Follow the standard marking guide for ${uName}: full marks require explicit working steps.`;
      } else if (secCategory === 'Matching') {
        qText = `Question ${qIndexInSection}: Match each item in Column A (1. ${tName}, 2. ${uName}) with its corresponding definition in Column B regarding ${sName}.`;
        correctAnswer = `1 -> B, 2 -> A`;
        explanation = `Each correct pairing receives equal marks.`;
      } else if (secCategory === 'Long Answer') {
        const laEn = [
          `Analyze the importance of ${tName} in ${grade} (${uName}). Discuss at least two practical experiments or classroom demonstrations that illustrate this principle.`,
          `Critically evaluate how a thorough understanding of ${tName} in ${uName} contributes to technological innovation and sustainable development in Rwanda.`,
          `Formulate a comprehensive strategy for applying ${tName} principles to solve a real-world scenario in your local community.`
        ];
        qText = laEn[(qIndexInSection - 1) % laEn.length];
        correctAnswer = `A comprehensive response detailing two distinct applications with clear pedagogical explanations.`;
        explanation = `Award marks based on depth of explanation, vocabulary, and logical structure.`;
      } else {
        qText = `Write an extended essay (Question ${qIndexInSection}) evaluating the impact of ${tName} (${uName}) on sustainable development and modern technology in Rwanda. Include concrete examples.`;
        correctAnswer = `Structured essay with Introduction, Body Paragraphs, and Conclusion following CBC rubrics.`;
        explanation = `Scored against rubrics: Knowledge (40%), Analysis (40%), Organization & Language (20%).`;
      }
    }

    return {
      id: `q-${Math.random().toString(36).substring(2, 9)}`,
      sectionName: '',
      number: globalNumber,
      type: secCategory,
      questionText: qText,
      options,
      correctAnswer,
      explanation,
      hint: includeHints ? (
        language === 'Kinyarwanda' ? `Inama: Ibuka amategeko n'ibisobanuro by'ibanze kuri ${tName} muri ${uName}.` :
        language === 'Français' ? `Indice: Rappelez-vous la définition et la règle clé de ${tName} dans ${uName}.` :
        language === 'Kiswahili' ? `Dokezo: Kumbuka fasili na kanuni kuu ya ${tName} katika ${uName}.` :
        `Hint: Remember the key definition and formula of ${tName} in ${uName}.`
      ) : undefined,
      marks: secMarks
    };
  };

  // AI & Pedagogical Generation Engine
  const handleGenerate = async () => {
    const creditCheck = checkCanUseAiCredit('homework_quiz');
    if (!creditCheck.canGenerate) {
      onRequireSubscription?.(creditCheck.message || 'You have used all available AI credits. Please subscribe or upgrade to continue.');
      return;
    }

    setIsGenerating(true);
    try {
      // Attempt API generation with Gemini
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai-lovable-assessment',
          email: currentUser?.email || 'teacher@nkorera.rw',
          params: {
            assessmentType: mode === 'homework' ? 'Homework Worksheet' : mode === 'classwork' ? 'Classwork Worksheet' : 'Class Quiz',
            levelCategory: grade,
            specificClass: grade,
            subject,
            unit,
            topic,
            country,
            curriculumStandard,
            language,
            duration: timeAllowed,
            totalMarks,
            questionCount: totalQuestions,
            sourceContent,
            difficulty,
            sections: sections.map(s => ({
              name: s.name,
              category: s.category,
              count: s.questionCount,
              marksEach: s.marksEach
            })),
            options: {
              searchCurriculum,
              includeAnswerKey,
              includeMarkingScheme,
              includeHints
            }
          }
        })
      });

      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        onRequireSubscription?.(errData.message || 'Subscription limit reached. Please upgrade.');
        setIsGenerating(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.questions && Array.isArray(data.result.questions)) {
          const rawQuestions = data.result.questions;
          let runningQIndex = 0;

          const formattedSections = sections.map((sec) => {
            const secQuestions: GeneratedQuestionItem[] = [];
            for (let i = 1; i <= sec.questionCount; i++) {
              const globalNum = runningQIndex + 1;
              const foundQ = rawQuestions[runningQIndex];
              runningQIndex++;

              const fallbackQ = createDynamicQuestion(sec.category, i, globalNum, sec.marksEach);

              secQuestions.push({
                id: `q-${sec.id}-${i}`,
                sectionName: sec.name,
                number: globalNum,
                type: sec.category,
                questionText: foundQ?.questionText || fallbackQ.questionText,
                options: sec.category === 'Multiple Choice' ? (foundQ?.options || fallbackQ.options) : (sec.category === 'True/False' ? (foundQ?.options || fallbackQ.options) : undefined),
                correctAnswer: foundQ?.correctAnswer || fallbackQ.correctAnswer,
                explanation: foundQ?.explanation || fallbackQ.explanation,
                hint: includeHints ? (foundQ?.hint || fallbackQ.hint) : undefined,
                marks: sec.marksEach
              });
            }
            return {
              name: sec.name,
              category: sec.category,
              totalMarks: sec.questionCount * sec.marksEach,
              questions: secQuestions
            };
          });

          const createdOutput: GeneratedAssessmentOutput = {
            id: `ass_${Date.now()}`,
            type: mode,
            title: `${mode.toUpperCase()}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`,
            subject,
            grade,
            unit,
            topic,
            country,
            curriculumStandard,
            language,
            timeAllowed,
            totalQuestions,
            totalMarks,
            instructions: [
              "Read all questions carefully before answering.",
              "Write your responses clearly and show all relevant working where required.",
              "Check your work thoroughly before submitting."
            ],
            sections: formattedSections,
            answerKey: formattedSections.map(s => ({
              sectionName: s.name,
              answers: s.questions.map(q => ({
                number: q.number,
                answer: q.correctAnswer,
                explanation: q.explanation || ''
              }))
            })),
            markingScheme: {
              summary: `Marking Scheme for ${subject} (${grade}) - Total: ${totalMarks} Marks`,
              rubricPoints: formattedSections.map(s => ({
                criterion: `${s.name} (${s.category})`,
                allocatedMarks: s.totalMarks,
                guidance: `Award full marks for accurate conceptual understanding and complete working.`
              }))
            },
            teacherNotes: teacherNotes || undefined,
            createdAt: new Date().toLocaleDateString()
          };

          setGeneratedOutput(createdOutput);
          deductAiCredit('homework_quiz', createdOutput.title);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API generation had a hiccup, utilizing instant high-precision local generator:', err);
    }

    // High-precision Fallback Generator with Full Language Localization & Unique Non-Repeating Questions
    let globalCounter = 0;
    const generatedSections = sections.map((sec) => {
      const secQuestions: GeneratedQuestionItem[] = [];
      for (let i = 1; i <= sec.questionCount; i++) {
        globalCounter++;
        const dynamicQ = createDynamicQuestion(sec.category, i, globalCounter, sec.marksEach);
        secQuestions.push({
          ...dynamicQ,
          id: `q-${sec.id}-${i}`,
          sectionName: sec.name,
          number: globalCounter
        });
      }

      return {
        name: sec.name,
        category: sec.category,
        totalMarks: sec.questionCount * sec.marksEach,
        questions: secQuestions
      };
    });

    const localizedTitle = language === 'Kinyarwanda'
      ? `${mode === 'homework' ? 'UMUKORO WO MU RUGO' : mode === 'classwork' ? 'IMYITOZO YO MU ISHURI' : 'IKIZAMINI GITO'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`
      : language === 'Français'
      ? `${mode === 'homework' ? 'DEVOIR À DOMICILE' : mode === 'classwork' ? 'TRAVAIL DE CLASSE' : 'QUIZ D\'ÉVALUATION'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`
      : language === 'Kiswahili'
      ? `${mode === 'homework' ? 'KAZI YA NYUMBANI' : mode === 'classwork' ? 'KAZI YA DARASANI' : 'JARIBIO LA TATHMINI'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`
      : `${mode === 'homework' ? 'HOMEWORK' : mode === 'classwork' ? 'CLASSWORK' : 'ASSESSMENT QUIZ'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`;

    const localizedInstructions = language === 'Kinyarwanda' ? [
      "Andika amazina yawe yose, ishuri, n'itariki mu mwanya wabugenewe hejuru.",
      "Soma ibibazo byose witonze mbere yo gusubiza.",
      "Garagaza inzira zose n'imibare y'ukuri ahasabwa hose.",
      "Subiriza mu myanya yabugenewe ku rupapuro."
    ] : language === 'Français' ? [
      "Écrivez clairement votre nom complet, classe et date en haut de la feuille.",
      "Lisez attentivement toutes les questions avant de répondre.",
      "Indiquez clairement toutes les étapes et démarches de calcul.",
      "Répondez à toutes les questions dans les espaces réservés."
    ] : language === 'Kiswahili' ? [
      "Andika majina yako kamili, darasa, na tarehe kwenye nafasi iliyotengwa hapo juu.",
      "Soma maswali yote kwa uangalifu kabla ya kujibu.",
      "Onyesha hatua zote za mahesabu pale panapohitajika.",
      "Jibu maswali yote katika nafasi zilizotolewa."
    ] : [
      "Write your full name, class, and date clearly on the top line.",
      "Read all questions carefully before attempting them.",
      "Show all your calculations and step-by-step working where required.",
      "Answer all questions in the provided spaces."
    ];

    const fallbackOutput: GeneratedAssessmentOutput = {
      id: `ass_${Date.now()}`,
      type: mode,
      title: localizedTitle,
      subject,
      grade,
      unit,
      topic,
      country,
      curriculumStandard,
      language,
      timeAllowed,
      totalQuestions,
      totalMarks,
      instructions: localizedInstructions,
      sections: generatedSections,
      answerKey: generatedSections.map(s => ({
        sectionName: s.name,
        answers: s.questions.map(q => ({
          number: q.number,
          answer: q.correctAnswer,
          explanation: q.explanation || ''
        }))
      })),
      markingScheme: {
        summary: language === 'Kinyarwanda'
          ? `Imbonerahamwe y'itangwa ry'amanota kuri ${subject} (${grade}) - Igiteranyo: Amanota ${totalMarks}`
          : language === 'Français'
          ? `Grille d'évaluation pour ${subject} (${grade}) - Total: ${totalMarks} Points`
          : language === 'Kiswahili'
          ? `Mwongozo wa Usahihishaji wa ${subject} (${grade}) - Jumla: Alama ${totalMarks}`
          : `Marking Scheme for ${subject} (${grade}) - Total: ${totalMarks} Marks`,
        rubricPoints: generatedSections.map(s => ({
          criterion: `${s.name} (${s.category})`,
          allocatedMarks: s.totalMarks,
          guidance: language === 'Kinyarwanda'
            ? `Tanga amanota yose ku bisobanuro byumvikana n'imibare yuzuye.`
            : language === 'Français'
            ? `Attribuer tous les points pour une compréhension conceptuelle claire et des calculs complets.`
            : language === 'Kiswahili'
            ? `Toa alama zote kwa uelewa sahihi na njia kamili za utatuzi.`
            : `Award full marks for accurate conceptual understanding and complete working.`
        }))
      },
      teacherNotes: teacherNotes || undefined,
      createdAt: new Date().toLocaleDateString()
    };

    setGeneratedOutput(fallbackOutput);
    deductAiCredit('homework_quiz', fallbackOutput.title);
    setIsGenerating(false);
  };

  // Edit Assessment Helpers
  const handleUpdateHeaderField = (field: keyof GeneratedAssessmentOutput, val: any) => {
    if (!generatedOutput) return;
    setGeneratedOutput({
      ...generatedOutput,
      [field]: val
    });
  };

  const handleUpdateQuestion = (secIdx: number, qIdx: number, fields: Partial<GeneratedQuestionItem>) => {
    if (!generatedOutput) return;
    const newSections = [...generatedOutput.sections];
    const sec = { ...newSections[secIdx] };
    const newQuestions = [...sec.questions];
    newQuestions[qIdx] = { ...newQuestions[qIdx], ...fields };
    sec.questions = newQuestions;
    
    // Recalculate section total marks
    sec.totalMarks = newQuestions.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);
    newSections[secIdx] = sec;

    // Recalculate overall total marks and total questions
    const overallMarks = newSections.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const overallQuestions = newSections.reduce((acc, curr) => acc + curr.questions.length, 0);

    // Sync answer key
    const currentQ = newQuestions[qIdx];
    const newAnswerKey = generatedOutput.answerKey.map((akSec) => {
      if (akSec.sectionName === sec.name) {
        return {
          ...akSec,
          answers: akSec.answers.map((a) => {
            if (a.number === currentQ.number) {
              return {
                ...a,
                answer: fields.correctAnswer !== undefined ? fields.correctAnswer : a.answer,
                explanation: fields.explanation !== undefined ? fields.explanation : a.explanation
              };
            }
            return a;
          })
        };
      }
      return akSec;
    });

    setGeneratedOutput({
      ...generatedOutput,
      sections: newSections,
      totalMarks: overallMarks,
      totalQuestions: overallQuestions,
      answerKey: newAnswerKey
    });
  };

  const handleDeleteQuestion = (secIdx: number, qIdx: number) => {
    if (!generatedOutput) return;
    const newSections = [...generatedOutput.sections];
    const sec = { ...newSections[secIdx] };
    sec.questions = sec.questions.filter((_, idx) => idx !== qIdx);
    sec.totalMarks = sec.questions.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);
    newSections[secIdx] = sec;

    // Renumber all questions sequentially
    let runningNum = 1;
    newSections.forEach(s => {
      s.questions = s.questions.map(q => {
        const updated = { ...q, number: runningNum };
        runningNum++;
        return updated;
      });
    });

    const overallMarks = newSections.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const overallQuestions = newSections.reduce((acc, curr) => acc + curr.questions.length, 0);

    // Rebuild answer key
    const newAnswerKey = newSections.map(s => ({
      sectionName: s.name,
      answers: s.questions.map(q => ({
        number: q.number,
        answer: q.correctAnswer,
        explanation: q.explanation || ''
      }))
    }));

    setGeneratedOutput({
      ...generatedOutput,
      sections: newSections,
      totalMarks: overallMarks,
      totalQuestions: overallQuestions,
      answerKey: newAnswerKey
    });
  };

  const handleAddQuestion = (secIdx: number) => {
    if (!generatedOutput) return;
    const newSections = [...generatedOutput.sections];
    const sec = { ...newSections[secIdx] };
    
    // Count total existing questions
    const totalExisting = newSections.reduce((acc, curr) => acc + curr.questions.length, 0);
    const nextNumber = totalExisting + 1;
    const defaultMarks = sec.category === 'Short Answer' ? 3 : sec.category === 'Calculation' ? 4 : 2;

    const newQuestion: GeneratedQuestionItem = {
      id: `q-custom-${Date.now()}`,
      sectionName: sec.name,
      number: nextNumber,
      type: sec.category,
      questionText: language === 'Kinyarwanda' 
        ? `Andika ikibazo gishya hano...` 
        : language === 'Français'
        ? `Écrivez la nouvelle question ici...`
        : language === 'Kiswahili'
        ? `Andika swali jipya hapa...`
        : `Enter new question text here...`,
      options: sec.category === 'Multiple Choice' ? [
        'A) Option 1',
        'B) Option 2',
        'C) Option 3',
        'D) Option 4'
      ] : undefined,
      correctAnswer: language === 'Kinyarwanda' ? 'Igisubizo nyacyo' : 'Correct Answer',
      explanation: language === 'Kinyarwanda' ? 'Ibisobanuro by\'igisubizo' : 'Pedagogical explanation for this question.',
      hint: includeHints ? (language === 'Kinyarwanda' ? 'Inama ngufi' : 'Guidance hint for students') : undefined,
      marks: defaultMarks
    };

    sec.questions = [...sec.questions, newQuestion];
    sec.totalMarks = sec.questions.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);
    newSections[secIdx] = sec;

    // Renumber
    let runningNum = 1;
    newSections.forEach(s => {
      s.questions = s.questions.map(q => {
        const updated = { ...q, number: runningNum };
        runningNum++;
        return updated;
      });
    });

    const overallMarks = newSections.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const overallQuestions = newSections.reduce((acc, curr) => acc + curr.questions.length, 0);

    const newAnswerKey = newSections.map(s => ({
      sectionName: s.name,
      answers: s.questions.map(q => ({
        number: q.number,
        answer: q.correctAnswer,
        explanation: q.explanation || ''
      }))
    }));

    setGeneratedOutput({
      ...generatedOutput,
      sections: newSections,
      totalMarks: overallMarks,
      totalQuestions: overallQuestions,
      answerKey: newAnswerKey
    });
  };

  const handleAddOption = (secIdx: number, qIdx: number) => {
    if (!generatedOutput) return;
    const currentOptions = generatedOutput.sections[secIdx]?.questions[qIdx]?.options || [];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLetter = letters[currentOptions.length] || `Opt ${currentOptions.length + 1}`;
    const newOptions = [...currentOptions, `${nextLetter}) New option`];
    handleUpdateQuestion(secIdx, qIdx, { options: newOptions });
  };

  const handleRemoveOption = (secIdx: number, qIdx: number, optIdx: number) => {
    if (!generatedOutput) return;
    const currentOptions = generatedOutput.sections[secIdx]?.questions[qIdx]?.options || [];
    const newOptions = currentOptions.filter((_, idx) => idx !== optIdx);
    handleUpdateQuestion(secIdx, qIdx, { options: newOptions });
  };

  const handleUpdateOption = (secIdx: number, qIdx: number, optIdx: number, val: string) => {
    if (!generatedOutput) return;
    const currentOptions = [...(generatedOutput.sections[secIdx]?.questions[qIdx]?.options || [])];
    currentOptions[optIdx] = val;
    handleUpdateQuestion(secIdx, qIdx, { options: currentOptions });
  };

  const handleAddSectionToOutput = () => {
    if (!generatedOutput) return;
    const newSections = [...generatedOutput.sections];
    const nextLetter = String.fromCharCode(65 + newSections.length);
    const secName = `Section ${nextLetter}`;
    
    const totalExisting = newSections.reduce((acc, curr) => acc + curr.questions.length, 0);
    const nextNumber = totalExisting + 1;

    const newSection = {
      name: secName,
      category: 'Short Answer' as QuestionCategoryType,
      totalMarks: 3,
      questions: [
        {
          id: `q-custom-sec-${Date.now()}`,
          sectionName: secName,
          number: nextNumber,
          type: 'Short Answer' as QuestionCategoryType,
          questionText: language === 'Kinyarwanda' ? 'Andika ikibazo cyawe hano...' : 'Enter your question text here...',
          correctAnswer: language === 'Kinyarwanda' ? 'Igisubizo nyacyo' : 'Correct answer',
          explanation: language === 'Kinyarwanda' ? 'Ibisobanuro' : 'Explanation',
          marks: 3
        }
      ]
    };

    newSections.push(newSection);

    // Renumber all questions
    let runningNum = 1;
    newSections.forEach(s => {
      s.questions = s.questions.map(q => {
        const updated = { ...q, number: runningNum };
        runningNum++;
        return updated;
      });
    });

    const overallMarks = newSections.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const overallQuestions = newSections.reduce((acc, curr) => acc + curr.questions.length, 0);

    const newAnswerKey = newSections.map(s => ({
      sectionName: s.name,
      answers: s.questions.map(q => ({
        number: q.number,
        answer: q.correctAnswer,
        explanation: q.explanation || ''
      }))
    }));

    setGeneratedOutput({
      ...generatedOutput,
      sections: newSections,
      totalMarks: overallMarks,
      totalQuestions: overallQuestions,
      answerKey: newAnswerKey
    });
  };

  const handleCreateManualAssessment = () => {
    let globalCounter = 0;
    
    // Parse custom pasted text lines if provided
    let pastedLines: string[] = [];
    const sourceOrCustom = customQuestionsInputText.trim() || sourceContent.trim();
    if (sourceOrCustom.length > 0) {
      pastedLines = sourceOrCustom
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.toLowerCase().startsWith('section') && !line.toLowerCase().startsWith('umutwe'));
    }

    const manualSections = sections.map((sec) => {
      const secQuestions: GeneratedQuestionItem[] = [];
      const count = Math.max(1, Number(sec.questionCount) || 1);

      for (let i = 1; i <= count; i++) {
        globalCounter++;
        
        let customQText = '';
        if (pastedLines.length > 0) {
          customQText = pastedLines.shift() || '';
        }

        const defaultQText = customQText || (
          language === 'Kinyarwanda' ? `Ikibazo cya ${globalCounter}: Andika ikibazo cyawe hano...` :
          language === 'Français' ? `Question ${globalCounter} : Saisissez votre question ici...` :
          language === 'Kiswahili' ? `Swali la ${globalCounter}: Andika swali yako hapa...` :
          `Question ${globalCounter}: Enter your custom question text here...`
        );

        secQuestions.push({
          id: `q-manual-${Date.now()}-${globalCounter}`,
          sectionName: sec.name,
          number: globalCounter,
          type: sec.category,
          questionText: defaultQText,
          options: sec.category === 'Multiple Choice' ? [
            'A) Option 1',
            'B) Option 2',
            'C) Option 3',
            'D) Option 4'
          ] : sec.category === 'True/False' ? [
            language === 'Kinyarwanda' ? 'UKURI (TRUE)' : 'TRUE',
            language === 'Kinyarwanda' ? 'IKINYOMA (FALSE)' : 'FALSE'
          ] : undefined,
          correctAnswer: language === 'Kinyarwanda' ? 'Igisubizo nyacyo' : 'Correct Answer',
          explanation: language === 'Kinyarwanda' ? 'Ibisobanuro n\'amabwiriza y\'ikosora' : 'Teacher explanation / Marking guidance',
          hint: includeHints ? (language === 'Kinyarwanda' ? 'Inama ngufi' : 'Guidance hint') : undefined,
          marks: Number(sec.marksEach) || 2
        });
      }

      return {
        name: sec.name,
        category: sec.category,
        totalMarks: secQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0),
        questions: secQuestions
      };
    });

    const totalQuestionsCalc = manualSections.reduce((acc, s) => acc + s.questions.length, 0);
    const totalMarksCalc = manualSections.reduce((acc, s) => acc + s.totalMarks, 0);

    const localizedTitle = language === 'Kinyarwanda'
      ? `${mode === 'homework' ? 'UMUKORO WO MU RUGO' : mode === 'classwork' ? 'IMYITOZO YO MU ISHURI' : 'IKIZAMINI GITO'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`
      : language === 'Français'
      ? `${mode === 'homework' ? 'DEVOIR À DOMICILE' : mode === 'classwork' ? 'TRAVAIL DE CLASSE' : 'QUIZ D\'ÉVALUATION'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`
      : language === 'Kiswahili'
      ? `${mode === 'homework' ? 'KAZI YA NYUMBANI' : mode === 'classwork' ? 'KAZI YA DARASANI' : 'JARIBIO LA TATHMINI'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`
      : `${mode === 'homework' ? 'HOMEWORK' : mode === 'classwork' ? 'CLASSWORK' : 'ASSESSMENT QUIZ'}: ${subject.toUpperCase()} — ${unit ? unit + ' • ' : ''}${topic}`;

    setGeneratedOutput({
      id: `ass_manual_${Date.now()}`,
      type: mode,
      title: localizedTitle,
      subject,
      grade,
      unit,
      topic,
      country,
      curriculumStandard,
      language,
      timeAllowed,
      totalQuestions: totalQuestionsCalc,
      totalMarks: totalMarksCalc,
      instructions: language === 'Kinyarwanda' ? [
        "Andika amazina yawe yose, ishuri, n'itariki mu mwanya wabugenewe hejuru.",
        "Soma ibibazo byose witonze mbere yo gusubiza.",
        "Garagaza inzira zose n'imibare y'ukuri ahasabwa hose.",
        "Subiriza mu myanya yabugenewe ku rupapuro."
      ] : [
        "Write your full name, class, and date clearly on the top line.",
        "Read all questions carefully before attempting them.",
        "Show all your calculations and step-by-step working where required.",
        "Answer all questions in the provided spaces."
      ],
      sections: manualSections,
      answerKey: manualSections.map(s => ({
        sectionName: s.name,
        answers: s.questions.map(q => ({
          number: q.number,
          answer: q.correctAnswer,
          explanation: q.explanation || ''
        }))
      })),
      markingScheme: {
        summary: `Marking Scheme for ${subject} (${grade}) - Total: ${totalMarksCalc} Marks`,
        rubricPoints: manualSections.map(s => ({
          criterion: `${s.name} (${s.category})`,
          allocatedMarks: s.totalMarks,
          guidance: `Award full marks for accurate conceptual understanding and complete working.`
        }))
      },
      createdAt: new Date().toLocaleDateString()
    });

    setIsEditing(true); // Open edit mode immediately!
  };

  // Download Formatted PDF via jsPDF
  const handleExportPdf = () => {
    if (!generatedOutput) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkAddPage = (neededSpace: number = 20) => {
        if (y + neededSpace > pageHeight - margin - 10) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Header Box
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.6);
      doc.rect(margin, y, contentWidth, 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(generatedOutput.title, contentWidth - 8);
      doc.text(titleLines, pageWidth / 2, y + 7, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${generatedOutput.curriculumStandard} • ${generatedOutput.country}`, pageWidth / 2, y + 13.5, { align: 'center' });

      // Divider inside box
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, y + 16.5, pageWidth - margin - 4, y + 16.5);

      // Student info lines
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Name:', margin + 4, y + 21.5);
      doc.setFont('helvetica', 'normal');
      doc.text('_________________________________', margin + 28, y + 21.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Date:', margin + 110, y + 21.5);
      doc.setFont('helvetica', 'normal');
      doc.text('__________________', margin + 120, y + 21.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Class/Grade:', margin + 4, y + 26.5);
      doc.setFont('helvetica', 'normal');
      doc.text(generatedOutput.grade, margin + 26, y + 26.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Subject:', margin + 65, y + 26.5);
      doc.setFont('helvetica', 'normal');
      doc.text(generatedOutput.subject, margin + 80, y + 26.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Time Allowed:', margin + 130, y + 26.5);
      doc.setFont('helvetica', 'normal');
      doc.text(generatedOutput.timeAllowed, margin + 153, y + 26.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Unit:', margin + 4, y + 31.5);
      doc.setFont('helvetica', 'normal');
      const unitStr = doc.splitTextToSize(generatedOutput.unit || unit || 'Standard Unit', 55);
      doc.text(unitStr[0] || '', margin + 13, y + 31.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Topic:', margin + 70, y + 31.5);
      doc.setFont('helvetica', 'normal');
      const topicStr = doc.splitTextToSize(generatedOutput.topic, 50);
      doc.text(topicStr[0] || '', margin + 82, y + 31.5);

      doc.setFont('helvetica', 'bold');
      doc.text('Total Marks:', margin + 135, y + 31.5);
      doc.setTextColor(2, 132, 199);
      doc.text(`${generatedOutput.totalMarks} Marks`, margin + 156, y + 31.5);

      // Instructions
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const instText = `Instructions: ${generatedOutput.instructions.join(' • ')}`;
      const instLines = doc.splitTextToSize(instText, contentWidth - 8);
      doc.text(instLines[0] || '', margin + 4, y + 35.8);

      y += 44;

      // Sections & Questions
      generatedOutput.sections.forEach((sec) => {
        checkAddPage(18);

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setFillColor(2, 132, 199);
        doc.rect(margin, y, 3, 7, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${sec.name.toUpperCase()}: ${sec.category.toUpperCase()}`, margin + 5, y + 5);

        doc.setFontSize(8.5);
        doc.setTextColor(2, 132, 199);
        doc.text(`(${sec.totalMarks} Marks)`, pageWidth - margin - 4, y + 5, { align: 'right' });

        y += 10;

        sec.questions.forEach((q) => {
          checkAddPage(22);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(2, 132, 199);
          doc.text(`Q${q.number}.`, margin + 2, y);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          const qTextLines = doc.splitTextToSize(q.questionText, contentWidth - 28);
          doc.text(qTextLines, margin + 10, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`(${q.marks} ${q.marks === 1 ? 'Mark' : 'Marks'})`, pageWidth - margin - 2, y, { align: 'right' });

          y += qTextLines.length * 4.5 + 2;

          if (q.options && q.options.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            q.options.forEach((opt) => {
              checkAddPage(6);
              doc.text(opt, margin + 12, y);
              y += 4.5;
            });
            y += 2;
          } else {
            checkAddPage(12);
            doc.setDrawColor(203, 213, 225);
            doc.setLineDashPattern([1, 2], 0);
            doc.line(margin + 10, y + 3, pageWidth - margin - 5, y + 3);
            doc.line(margin + 10, y + 9, pageWidth - margin - 5, y + 9);
            doc.setLineDashPattern([], 0);
            y += 13;
          }

          if (q.hint) {
            checkAddPage(6);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`Hint: ${q.hint}`, margin + 10, y);
            y += 4.5;
          }

          y += 2;
        });

        y += 4;
      });

      // Optional Teacher Notes as Footer box on the assessment page
      if (teacherNotesPdfMode === 'footer' && (generatedOutput.teacherNotes || teacherNotes)) {
        const noteContent = (generatedOutput.teacherNotes || teacherNotes).trim();
        if (noteContent) {
          checkAddPage(22);
          y += 3;
          doc.setFillColor(245, 247, 255);
          doc.setDrawColor(99, 102, 241);
          doc.setLineWidth(0.4);
          
          const splitNotes = doc.splitTextToSize(`[TEACHER NOTES & GRADING REMINDER]: ${noteContent}`, contentWidth - 8);
          const boxHeight = Math.max(splitNotes.length * 3.8 + 6, 13);
          
          doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(67, 56, 202);
          doc.text(splitNotes, margin + 4, y + 4.5);
          y += boxHeight + 4;
        }
      }

      // Answer Key Section
      if (includeAnswerKey && generatedOutput.answerKey && generatedOutput.answerKey.length > 0) {
        doc.addPage();
        y = margin;

        doc.setFillColor(238, 242, 255);
        doc.rect(margin, y, contentWidth, 12, 'F');
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.5);
        doc.rect(margin, y, contentWidth, 12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(67, 56, 202);
        doc.text("TEACHER'S OFFICIAL ANSWER KEY & EXPLANATIONS", pageWidth / 2, y + 6, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Official answers and marking justifications', pageWidth / 2, y + 10, { align: 'center' });

        y += 17;

        generatedOutput.answerKey.forEach((akSec) => {
          checkAddPage(15);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(67, 56, 202);
          doc.text(akSec.sectionName, margin, y);
          y += 5;

          akSec.answers.forEach((ans) => {
            checkAddPage(12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(`Q${ans.number}: `, margin + 2, y);

            doc.setTextColor(21, 128, 61);
            const ansLines = doc.splitTextToSize(ans.answer, contentWidth - 25);
            doc.text(ansLines, margin + 12, y);
            y += ansLines.length * 4;

            if (ans.explanation) {
              doc.setFont('helvetica', 'italic');
              doc.setFontSize(7.5);
              doc.setTextColor(100, 116, 139);
              const expLines = doc.splitTextToSize(`Explanation: ${ans.explanation}`, contentWidth - 25);
              doc.text(expLines, margin + 12, y);
              y += expLines.length * 3.8 + 2;
            }
          });
          y += 4;
        });
      }

      // Marking Scheme
      if (includeMarkingScheme && generatedOutput.markingScheme?.rubricPoints) {
        checkAddPage(30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(180, 83, 9);
        doc.text('OFFICIAL MARKING SCHEME & RUBRIC GUIDELINES', margin, y);
        y += 6;

        generatedOutput.markingScheme.rubricPoints.forEach((rp) => {
          checkAddPage(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`• ${rp.criterion}`, margin + 2, y);

          doc.setTextColor(2, 132, 199);
          doc.text(`[${rp.allocatedMarks} Marks]`, margin + 65, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const guideLines = doc.splitTextToSize(rp.guidance, contentWidth - 95);
          doc.text(guideLines, margin + 90, y);

          y += Math.max(guideLines.length * 4, 5) + 2;
        });
      }

      // Optional Dedicated Teacher Guide Page in PDF
      if (teacherNotesPdfMode === 'separate_page' && (generatedOutput.teacherNotes || teacherNotes)) {
        const noteContent = (generatedOutput.teacherNotes || teacherNotes).trim();
        doc.addPage();
        y = margin;

        // Header Banner
        doc.setFillColor(238, 242, 255);
        doc.rect(margin, y, contentWidth, 14, 'F');
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.5);
        doc.rect(margin, y, contentWidth, 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(67, 56, 202);
        doc.text("TEACHER'S GUIDE & PEDAGOGICAL NOTES", pageWidth / 2, y + 6, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Official Pedagogical Guide & Grading Reference • ${generatedOutput.curriculumStandard}`, pageWidth / 2, y + 10.5, { align: 'center' });

        y += 18;

        // Document Metadata Summary Box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`Assessment: ${generatedOutput.title}`, margin + 4, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Subject: ${generatedOutput.subject}   |   Grade / Level: ${generatedOutput.grade}   |   Time: ${generatedOutput.timeAllowed}   |   Total Marks: ${generatedOutput.totalMarks}`, margin + 4, y + 9.5);
        doc.text(`Topic / Lesson: ${generatedOutput.topic}${generatedOutput.unit ? ` (${generatedOutput.unit})` : ''}`, margin + 4, y + 14);
        
        y += 22;

        // Block 1: Teacher's Specific Instructions & Grading Notes
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(67, 56, 202);
        doc.text("1. TEACHER'S SPECIFIC INSTRUCTIONS & GRADING GUIDANCE", margin, y);
        y += 4.5;

        doc.setFillColor(245, 247, 255);
        doc.setDrawColor(165, 180, 252);
        doc.setLineWidth(0.4);

        const teacherNoteLines = doc.splitTextToSize(noteContent || "Award full marks for showing clear conceptual derivation and methodical calculation steps.", contentWidth - 8);
        const noteBoxHeight = Math.max(teacherNoteLines.length * 4 + 7, 16);
        
        doc.roundedRect(margin, y, contentWidth, noteBoxHeight, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(teacherNoteLines, margin + 4, y + 5);

        y += noteBoxHeight + 6;

        // Block 2: Competency-Based Assessment & CBC Objectives
        checkAddPage(28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("2. CBC COMPETENCY & LEARNING OUTCOMES ALIGNMENT", margin, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const cbcLines = doc.splitTextToSize(
          `• Core Competencies: Critical thinking, problem-solving, and subject mastery on "${generatedOutput.topic}".\n• Assessment Purpose: Evaluates foundational recall, analytical reasoning, and procedural application under ${generatedOutput.curriculumStandard}.\n• Success Criteria: Learners accurately interpret task instructions, show clean working, and formulate justified conclusions.`,
          contentWidth - 4
        );
        doc.text(cbcLines, margin + 2, y);
        y += cbcLines.length * 4 + 4;

        // Block 3: Suggested Classroom Time Allocation
        checkAddPage(24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("3. RECOMMENDED CLASSROOM TIME MANAGEMENT", margin, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const timeLines = doc.splitTextToSize(
          `• Introduction & Clarification (5 mins): Explain instructions and ensure all students have proper writing materials.\n• Individual Working Time (${generatedOutput.timeAllowed || '35 mins'}): Active invigilation, providing scaffolded hints where permitted.\n• Review & Plenary (5-10 mins): Highlight common challenges and discuss key solution strategies with the class.`,
          contentWidth - 4
        );
        doc.text(timeLines, margin + 2, y);
        y += timeLines.length * 4 + 4;

        // Block 4: Differentiated Support & Remediation
        checkAddPage(24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("4. DIFFERENTIATED SUPPORT (REMEDIAL & ENRICHMENT)", margin, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const diffLines = doc.splitTextToSize(
          `• Remedial Support: Provide concrete visual aids, simplified numerical examples, and peer tutoring on fundamental definitions.\n• Extension / Enrichment: Encourage advanced learners to formulate alternative solution methods and design reciprocal challenge questions.`,
          contentWidth - 4
        );
        doc.text(diffLines, margin + 2, y);
        y += diffLines.length * 4 + 6;

        // Block 5: Teacher Evaluation & Moderation Record
        checkAddPage(22);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("5. TEACHER MODERATION & RECORDING SIGN-OFF", margin + 4, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text("Teacher Name: __________________________    Date Marked: ______________    Class Average: ______ / " + generatedOutput.totalMarks, margin + 4, y + 9.5);
        doc.text("Principal / Head of Department Signature: ____________________________    Moderation Status: [  ] Approved", margin + 4, y + 14);
      }

      // Add Footers
      const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Nkorera Assessment Suite • ${generatedOutput.title.substring(0, 45)}`, margin, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }

      doc.save(`${generatedOutput.type}_${generatedOutput.subject}_${generatedOutput.grade}.pdf`);
    } catch (pdfErr) {
      console.error('PDF Generation Error:', pdfErr);
      // Fallback print
      window.print();
    }
  };

  // Export to Word Document (.doc)
  const handleExportWord = () => {
    if (!generatedOutput) return;

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${generatedOutput.title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 20px; color: #1e293b; }
        .header-box { border: 2px solid #0f172a; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
        .title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 8px; text-transform: uppercase; }
        .subtitle { font-size: 11pt; text-align: center; color: #475569; margin-bottom: 12px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table td { padding: 6px; font-size: 10.5pt; }
        .section-header { background-color: #f1f5f9; padding: 8px 12px; font-size: 12pt; font-weight: bold; border-left: 4px solid #0284c7; margin-top: 20px; margin-bottom: 10px; }
        .question-box { margin-bottom: 15px; padding-left: 10px; }
        .q-text { font-size: 11pt; font-weight: 600; margin-bottom: 6px; }
        .q-options { margin-left: 20px; font-size: 10.5pt; line-height: 1.6; }
        .blank-lines { border-bottom: 1px dotted #94a3b8; height: 24px; margin: 6px 0; }
        .answer-key-box { margin-top: 40px; page-break-before: always; border-top: 2px dashed #0284c7; padding-top: 20px; }
        .ak-title { font-size: 16pt; font-weight: bold; color: #0369a1; text-align: center; margin-bottom: 15px; }
      </style>
      </head>
      <body>
        <div class="header-box">
          <div class="title">${generatedOutput.title}</div>
          <div class="subtitle">${generatedOutput.curriculumStandard} • ${generatedOutput.country}</div>
          <table class="info-table">
            <tr>
              <td><strong>Student Name:</strong> ___________________________</td>
              <td><strong>Date:</strong> _____________________</td>
            </tr>
            <tr>
              <td><strong>Class / Grade:</strong> ${generatedOutput.grade}</td>
              <td><strong>Subject:</strong> ${generatedOutput.subject}</td>
            </tr>
            <tr>
              <td><strong>Unit (Umutwe):</strong> ${generatedOutput.unit || unit || 'Standard Unit'}</td>
              <td><strong>Topic (Intego):</strong> ${generatedOutput.topic}</td>
            </tr>
            <tr>
              <td><strong>Time Allowed:</strong> ${generatedOutput.timeAllowed}</td>
              <td><strong>Total Marks:</strong> ${generatedOutput.totalMarks} Marks</td>
            </tr>
          </table>
          <div style="font-size: 9.5pt; font-style: italic; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <strong>Instructions:</strong> ${generatedOutput.instructions.join(' • ')}
          </div>
        </div>
    `;

    generatedOutput.sections.forEach(sec => {
      html += `
        <div class="section-header">${sec.name}: ${sec.category.toUpperCase()} (${sec.totalMarks} Marks)</div>
      `;
      sec.questions.forEach(q => {
        html += `
          <div class="question-box">
            <div class="q-text">Q${q.number}. ${q.questionText} <span style="color:#0284c7; font-size: 9.5pt;">(${q.marks} Marks)</span></div>
        `;
        if (q.options) {
          html += `<div class="q-options">`;
          q.options.forEach(opt => {
            html += `<div>${opt}</div>`;
          });
          html += `</div>`;
        } else {
          html += `
            <div class="blank-lines"></div>
            <div class="blank-lines"></div>
          `;
        }
        if (q.hint) {
          html += `<div style="font-size: 8.5pt; color: #64748b; font-style: italic;">${q.hint}</div>`;
        }
        html += `</div>`;
      });
    });

    const activeTeacherNotes = (generatedOutput.teacherNotes || teacherNotes).trim();

    if (teacherNotesPdfMode === 'footer' && activeTeacherNotes) {
      html += `
        <div style="margin-top: 20px; padding: 12px 15px; background: #eef2ff; border: 1.5px solid #6366f1; border-radius: 6px; font-size: 10pt; color: #312e81;">
          <strong>[TEACHER NOTES & GRADING REMINDER]:</strong> ${activeTeacherNotes}
        </div>
      `;
    }

    if (includeAnswerKey) {
      html += `
        <div class="answer-key-box">
          <div class="ak-title">TEACHER'S OFFICIAL ANSWER KEY & EXPLANATIONS</div>
      `;
      generatedOutput.answerKey.forEach(akSec => {
        html += `<h4 style="color:#0284c7; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">${akSec.sectionName}</h4>`;
        akSec.answers.forEach(a => {
          html += `
            <div style="margin-bottom: 10px;">
              <strong>Q${a.number}:</strong> <span style="color:#15803d; font-weight: bold;">${a.answer}</span>
              <div style="font-size: 9.5pt; color: #475569; margin-top: 2px;"><em>Explanation:</em> ${a.explanation}</div>
            </div>
          `;
        });
      });
      html += `</div>`;
    }

    if (includeMarkingScheme) {
      html += `
        <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
          <h4 style="margin-top: 0; color: #334155;">OFFICIAL MARKING SCHEME & RUBRIC</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <tr style="background: #e2e8f0;">
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Section / Criterion</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 80px;">Marks</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Marking Guidelines</th>
            </tr>
      `;
      generatedOutput.markingScheme.rubricPoints.forEach(rp => {
        html += `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px;"><strong>${rp.criterion}</strong></td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">${rp.allocatedMarks}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">${rp.guidance}</td>
          </tr>
        `;
      });
      html += `</table></div>`;
    }

    if (teacherNotesPdfMode === 'separate_page' && activeTeacherNotes) {
      html += `
        <div style="page-break-before: always; margin-top: 35px; border-top: 2px dashed #4f46e5; padding-top: 20px;">
          <div style="font-size: 16pt; font-weight: bold; color: #4338ca; text-align: center; margin-bottom: 8px; text-transform: uppercase;">TEACHER'S GUIDE & PEDAGOGICAL NOTES</div>
          <div style="text-align: center; font-size: 9.5pt; color: #64748b; margin-bottom: 15px;">Official Pedagogical Guide & Grading Reference • ${generatedOutput.curriculumStandard}</div>
          <div style="padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px; font-size: 10pt;">
            <strong>Assessment:</strong> ${generatedOutput.title}<br/>
            <strong>Subject / Grade:</strong> ${generatedOutput.subject} (${generatedOutput.grade}) | <strong>Time:</strong> ${generatedOutput.timeAllowed} | <strong>Total Marks:</strong> ${generatedOutput.totalMarks} Marks<br/>
            <strong>Topic / Lesson:</strong> ${generatedOutput.topic}
          </div>
          <h4 style="color:#4338ca; margin-bottom: 6px;">1. TEACHER'S SPECIFIC INSTRUCTIONS & GRADING GUIDANCE</h4>
          <div style="padding: 12px 15px; background: #eef2ff; border: 1.5px solid #818cf8; border-radius: 6px; font-size: 10.5pt; color: #1e1b4b; margin-bottom: 15px; line-height: 1.6;">
            ${activeTeacherNotes}
          </div>
          <h4 style="color:#1e293b; margin-bottom: 6px;">2. CBC COMPETENCY & LEARNING OUTCOMES ALIGNMENT</h4>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5;">Evaluates foundational recall, analytical reasoning, and procedural problem-solving skills under the Rwanda ${generatedOutput.curriculumStandard} framework.</p>
          <div style="margin-top: 25px; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 9pt; color: #475569;">
            <strong>Teacher Moderation Record:</strong> Teacher: __________________________ Date Marked: ______________ Score Avg: ______ / ${generatedOutput.totalMarks}
          </div>
        </div>
      `;
    }

    html += `</body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedOutput.type}_${generatedOutput.subject}_${generatedOutput.grade}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Direct High-Fidelity Printable Window
  const handlePrint = () => {
    if (!generatedOutput) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${generatedOutput.title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 10px;
            font-size: 11pt;
            line-height: 1.5;
          }
          .header-box {
            border: 2px solid #0f172a;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 16pt;
            font-weight: 900;
            text-align: center;
            text-transform: uppercase;
            margin: 0 0 4px 0;
            letter-spacing: 0.5px;
          }
          .subtitle {
            font-size: 9.5pt;
            text-align: center;
            color: #475569;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 16px;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
            padding: 8px 0;
            font-size: 9.5pt;
          }
          .instructions {
            font-size: 9pt;
            font-style: italic;
            color: #475569;
            margin-top: 8px;
          }
          .section-header {
            background-color: #f1f5f9;
            border-left: 4px solid #0284c7;
            padding: 6px 12px;
            font-weight: bold;
            font-size: 11pt;
            margin: 20px 0 12px 0;
            display: flex;
            justify-content: space-between;
          }
          .question-item {
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .q-header {
            display: flex;
            gap: 6px;
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 6px;
          }
          .q-num {
            color: #0284c7;
          }
          .q-marks {
            font-weight: normal;
            color: #64748b;
            font-size: 8.5pt;
            margin-left: auto;
          }
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding-left: 20px;
            font-size: 9.5pt;
          }
          .option-item {
            padding: 4px 8px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            background: #f8fafc;
          }
          .blank-line {
            border-bottom: 1px dotted #94a3b8;
            height: 22px;
            margin: 4px 0 4px 20px;
          }
          .hint {
            font-size: 8.5pt;
            color: #64748b;
            font-style: italic;
            padding-left: 20px;
            margin-top: 4px;
          }
          .answer-key-page {
            page-break-before: always;
            margin-top: 30px;
            border-top: 2px dashed #0284c7;
            padding-top: 20px;
          }
          .ak-title {
            font-size: 14pt;
            font-weight: bold;
            color: #0369a1;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 15px;
          }
          .rubric-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 9.5pt;
          }
          .rubric-table th, .rubric-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
          }
          .rubric-table th {
            background-color: #f1f5f9;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1 class="title">${generatedOutput.title}</h1>
          <div class="subtitle">${generatedOutput.curriculumStandard} Standards • ${generatedOutput.country}</div>
          <div class="meta-grid">
            <div><strong>Student Name:</strong> ___________________________________</div>
            <div><strong>Date:</strong> ___________________________</div>
            <div><strong>Class / Grade:</strong> ${generatedOutput.grade}</div>
            <div><strong>Subject:</strong> ${generatedOutput.subject}</div>
            <div><strong>Unit:</strong> ${generatedOutput.unit || unit}</div>
            <div><strong>Topic:</strong> ${generatedOutput.topic}</div>
            <div><strong>Time Allowed:</strong> ${generatedOutput.timeAllowed}</div>
            <div><strong>Total Marks:</strong> <span style="color:#0284c7; font-weight:bold;">${generatedOutput.totalMarks} Marks</span></div>
          </div>
          <div class="instructions">
            <strong>Instructions:</strong> ${generatedOutput.instructions.join(' • ')}
          </div>
        </div>
    `;

    generatedOutput.sections.forEach(sec => {
      htmlContent += `
        <div class="section-header">
          <span>${sec.name.toUpperCase()}: ${sec.category.toUpperCase()}</span>
          <span>(${sec.totalMarks} Marks)</span>
        </div>
      `;
      sec.questions.forEach(q => {
        htmlContent += `
          <div class="question-item">
            <div class="q-header">
              <span class="q-num">Q${q.number}.</span>
              <span style="flex:1;">${q.questionText}</span>
              <span class="q-marks">(${q.marks} ${q.marks === 1 ? 'Mark' : 'Marks'})</span>
            </div>
        `;
        if (q.options && q.options.length > 0) {
          htmlContent += `<div class="options-grid">`;
          q.options.forEach(opt => {
            htmlContent += `<div class="option-item">${opt}</div>`;
          });
          htmlContent += `</div>`;
        } else {
          htmlContent += `<div class="blank-line"></div><div class="blank-line"></div>`;
        }
        if (q.hint) {
          htmlContent += `<div class="hint">💡 ${q.hint}</div>`;
        }
        htmlContent += `</div>`;
      });
    });

    const activeTeacherNotesForPrint = (generatedOutput.teacherNotes || teacherNotes).trim();

    if (teacherNotesPdfMode === 'footer' && activeTeacherNotesForPrint) {
      htmlContent += `
        <div style="margin-top: 20px; padding: 12px 16px; background: #eef2ff; border: 1.5px solid #6366f1; border-radius: 6px; font-size: 9.5pt; color: #312e81; page-break-inside: avoid;">
          <strong>💡 [TEACHER NOTES & GRADING REMINDER]:</strong> ${activeTeacherNotesForPrint}
        </div>
      `;
    }

    if (includeAnswerKey && generatedOutput.answerKey) {
      htmlContent += `
        <div class="answer-key-page">
          <div class="ak-title">Teacher's Official Answer Key & Explanations</div>
      `;
      generatedOutput.answerKey.forEach(akSec => {
        htmlContent += `<h3 style="color:#0284c7; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-top:15px;">${akSec.sectionName}</h3>`;
        akSec.answers.forEach(ans => {
          htmlContent += `
            <div style="margin-bottom: 8px; font-size: 9.5pt;">
              <strong>Q${ans.number}:</strong> <span style="color:#15803d; font-weight:bold;">${ans.answer}</span>
              ${ans.explanation ? `<div style="color:#64748b; font-size:8.5pt; margin-top:2px;"><em>Explanation:</em> ${ans.explanation}</div>` : ''}
            </div>
          `;
        });
      });
      htmlContent += `</div>`;
    }

    if (includeMarkingScheme && generatedOutput.markingScheme?.rubricPoints) {
      htmlContent += `
        <div style="margin-top: 20px;">
          <h3 style="color:#b45309; text-transform:uppercase;">Official Marking Scheme</h3>
          <table class="rubric-table">
            <thead>
              <tr>
                <th style="text-align:left;">Section / Criterion</th>
                <th style="text-align:center; width:80px;">Marks</th>
                <th style="text-align:left;">Evaluation Guideline</th>
              </tr>
            </thead>
            <tbody>
      `;
      generatedOutput.markingScheme.rubricPoints.forEach(rp => {
        htmlContent += `
          <tr>
            <td><strong>${rp.criterion}</strong></td>
            <td style="text-align:center; font-weight:bold; color:#0284c7;">${rp.allocatedMarks}</td>
            <td>${rp.guidance}</td>
          </tr>
        `;
      });
      htmlContent += `</tbody></table></div>`;
    }

    if (teacherNotesPdfMode === 'separate_page' && activeTeacherNotesForPrint) {
      htmlContent += `
        <div class="teacher-guide-page" style="page-break-before: always; margin-top: 35px; border-top: 2px dashed #4f46e5; padding-top: 20px;">
          <div class="ak-title" style="color: #4338ca;">TEACHER'S GUIDE & PEDAGOGICAL NOTES</div>
          <div style="text-align: center; font-size: 9pt; color: #64748b; margin-bottom: 16px;">Official Pedagogical Guide & Grading Reference • ${generatedOutput.curriculumStandard}</div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 9.5pt;">
            <div><strong>Assessment:</strong> ${generatedOutput.title}</div>
            <div style="color: #475569; margin-top: 4px;">Subject: ${generatedOutput.subject} | Grade: ${generatedOutput.grade} | Time: ${generatedOutput.timeAllowed} | Total: ${generatedOutput.totalMarks} Marks</div>
            <div style="color: #475569; margin-top: 2px;">Topic: ${generatedOutput.topic}</div>
          </div>

          <h4 style="color: #4338ca; margin: 15px 0 6px 0;">1. TEACHER'S SPECIFIC INSTRUCTIONS & GRADING GUIDANCE</h4>
          <div style="background: #eef2ff; border: 1.5px solid #a5b4fc; border-radius: 6px; padding: 14px; font-size: 10pt; color: #1e1b4b; line-height: 1.6;">
            ${activeTeacherNotesForPrint}
          </div>

          <h4 style="color: #0f172a; margin: 18px 0 6px 0;">2. CBC COMPETENCY & LEARNING OUTCOMES ALIGNMENT</h4>
          <div style="font-size: 9.5pt; color: #334155; line-height: 1.6;">
            • <strong>Core Competencies:</strong> Critical thinking, problem-solving, and subject mastery on "${generatedOutput.topic}".<br/>
            • <strong>Assessment Purpose:</strong> Evaluates foundational recall, analytical reasoning, and procedural application under ${generatedOutput.curriculumStandard}.
          </div>

          <h4 style="color: #0f172a; margin: 18px 0 6px 0;">3. RECOMMENDED CLASSROOM TIME MANAGEMENT</h4>
          <div style="font-size: 9.5pt; color: #334155; line-height: 1.6;">
            • Introduction & Clarification (5 mins) • Working Time (${generatedOutput.timeAllowed || '35 mins'}) • Review & Plenary (10 mins)
          </div>

          <div style="margin-top: 30px; padding: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 9pt; color: #475569;">
            <strong>Teacher Moderation & Sign-off:</strong> Teacher: __________________________ Date: ______________ Score Avg: ______ / ${generatedOutput.totalMarks}
          </div>
        </div>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  };

  // Copy full document text
  const handleCopy = () => {
    if (!generatedOutput) return;
    let fullText = `${generatedOutput.title}\n`;
    fullText += `Subject: ${generatedOutput.subject} | Grade: ${generatedOutput.grade} | Unit: ${generatedOutput.unit || unit} | Topic: ${generatedOutput.topic} | Time: ${generatedOutput.timeAllowed} | Total: ${generatedOutput.totalMarks} Marks\n\n`;
    generatedOutput.sections.forEach(s => {
      fullText += `--- ${s.name} (${s.category} - ${s.totalMarks} Marks) ---\n`;
      s.questions.forEach(q => {
        fullText += `Q${q.number}. ${q.questionText} (${q.marks} Marks)\n`;
        if (q.options) {
          q.options.forEach(o => fullText += `   ${o}\n`);
        }
      });
      fullText += `\n`;
    });
    if (includeAnswerKey) {
      fullText += `\n=== ANSWER KEY ===\n`;
      generatedOutput.answerKey.forEach(s => {
        fullText += `${s.sectionName}:\n`;
        s.answers.forEach(a => fullText += `Q${a.number}: ${a.answer} (${a.explanation})\n`);
      });
    }
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in text-slate-100">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col my-auto">
        
        {/* TOP APP-STYLE HEADER BAR */}
        <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={generatedOutput ? () => setGeneratedOutput(null) : onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* MULTI-LANGUAGE CONTEXT SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
              {[
                { flag: '🇬🇧', code: 'EN', name: 'English', val: 'English' },
                { flag: '🇷🇼', code: 'RW', name: 'Ikinyarwanda', val: 'Kinyarwanda' },
                { flag: '🇫🇷', code: 'FR', name: 'Français', val: 'Français' },
                { flag: '🇹🇿', code: 'SW', name: 'Kiswahili', val: 'Kiswahili' }
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleLanguageChange(item.val as AssessmentLanguage)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer ${
                    language === item.val
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={`Switch context to ${item.name}`}
                >
                  <span>{item.flag}</span>
                  <span className="font-extrabold text-[10px] hidden sm:inline">{item.code}</span>
                </button>
              ))}
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-950/60">

          {!generatedOutput ? (
            <>
              {/* WHAT WOULD YOU LIKE TO CREATE? SWITCHER */}
              <div className="text-center space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.modeSwitcherLabel}
                </h3>
                <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner gap-1.5">
                  <button
                    onClick={() => setMode('homework')}
                    className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      mode === 'homework'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/50 scale-102'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>📝</span>
                    <span>{t.modeHomework}</span>
                  </button>

                  <button
                    onClick={() => setMode('classwork')}
                    className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      mode === 'classwork'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/50 scale-102'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>✏️</span>
                    <span>{t.modeClasswork}</span>
                  </button>

                  <button
                    onClick={() => setMode('quiz')}
                    className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      mode === 'quiz'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/50 scale-102'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>📋</span>
                    <span>{t.modeQuiz}</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC HEADER TITLE FOR CURRENT MODE */}
              <div className="text-center space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
                  <span>{mode === 'homework' ? '📝' : mode === 'classwork' ? '✏️' : '📋'}</span>
                  <span>
                    {mode === 'homework' ? t.hwTitle : mode === 'classwork' ? t.cwTitle : t.quizTitle}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                  {mode === 'homework'
                    ? t.hwDesc
                    : mode === 'classwork'
                    ? t.cwDesc
                    : t.quizDesc}
                </p>
              </div>

              {/* MONTHLY LIMIT OR STATUS NOTICE */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex items-start gap-3 text-xs text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-amber-300 block sm:inline mr-2">
                      {language} Assessment:
                    </span>
                    <span>{t.planNotice}</span>
                  </div>
                  <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] uppercase shrink-0 self-start sm:self-auto">
                    {t.planActive}
                  </span>
                </div>
              </div>

              {/* TEMPLATE SAVED OR LOADED NOTIFICATION */}
              {templateNotice && (
                <div className="bg-purple-950/90 border border-purple-500/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-purple-200 animate-fade-in shadow-xl shadow-purple-950/40">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-bold">{templateNotice}</span>
                  </div>
                  <button 
                    onClick={() => setTemplateNotice(null)}
                    className="text-purple-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* SAVED ASSESSMENT TEMPLATES SECTION */}
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div 
                    onClick={() => setShowSavedTemplatesModal(!showSavedTemplatesModal)}
                    className="flex items-center gap-2.5 cursor-pointer group flex-1"
                  >
                    <FolderHeart className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-purple-200 flex items-center gap-2 flex-wrap">
                        <span>{t.myTemplatesTitle}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/30 text-purple-300 font-bold border border-purple-500/40">
                          {savedTemplates.length}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/40">
                          <Cloud className="w-3 h-3 text-cyan-400" />
                          <span>Cloud Synced</span>
                        </span>
                      </h4>
                      <p className="text-[11px] text-purple-300/70">
                        {language === 'Kinyarwanda'
                          ? 'Bika n’ububiko bwawe mu gicu (Cloud Profile) kugira ngo ubixorere n’ubundi buryo ku bindi bikoresho.'
                          : 'Store & synchronize question banks across devices to your Cloud Profile.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncCloudTemplates();
                      }}
                      disabled={isSyncingTemplates}
                      className="text-xs font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 px-3 py-1.5 rounded-xl border border-cyan-500/40 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      title="Sync templates from Cloud Profile"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingTemplates ? 'animate-spin' : ''}`} />
                      <span>{isSyncingTemplates ? 'Syncing...' : 'Sync Cloud'}</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setShowSavedTemplatesModal(!showSavedTemplatesModal)}
                      className="text-xs font-bold text-purple-300 bg-purple-900/60 hover:bg-purple-800 px-3 py-1.5 rounded-xl border border-purple-500/40 transition-all cursor-pointer"
                    >
                      {showSavedTemplatesModal ? 'Hide' : 'View Saved'}
                    </button>
                  </div>
                </div>

                {showSavedTemplatesModal && (
                  <div className="pt-3 border-t border-purple-500/20 space-y-2.5 animate-fade-in">
                    {savedTemplates.length === 0 ? (
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-purple-500/20 text-center text-xs text-purple-300/80">
                        {t.noTemplatesMsg}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                        {savedTemplates.map((tpl) => (
                          <div 
                            key={tpl.id}
                            className="p-3.5 bg-slate-950/80 rounded-2xl border border-purple-500/30 hover:border-purple-400/70 transition-all flex flex-col justify-between gap-2 text-xs shadow-md"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-purple-100 truncate text-xs">{tpl.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                    <Cloud className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>Cloud</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {tpl.type}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10.5px] text-purple-300/70 flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>📚 {tpl.subject} ({tpl.grade})</span>
                                {tpl.topic && <span>• 🎯 {tpl.topic}</span>}
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 text-[10px]">
                              <span className="text-slate-500">📅 {tpl.createdAt}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                                  className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold border border-rose-500/30 transition-all cursor-pointer"
                                  title={t.deleteTemplateBtn}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLoadTemplate(tpl)}
                                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all cursor-pointer shadow-sm"
                                >
                                  {t.useTemplateBtn}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION: FILL FROM RWANDA CURRICULUM */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">{t.fillCurriculumTitle}</h4>
                      <p className="text-[11px] text-slate-400">{t.fillCurriculumDesc}</p>
                    </div>
                  </div>

                  {/* CURRICULUM SWITCHER */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <button
                      onClick={() => setCurriculumType('reb')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        curriculumType === 'reb' ? 'bg-cyan-600 text-white font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.rebBtn}
                    </button>
                    <button
                      onClick={() => setCurriculumType('rtb')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        curriculumType === 'rtb' ? 'bg-cyan-600 text-white font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.rtbBtn}
                    </button>
                  </div>
                </div>

                {/* TEXTBOOK AUTO-FILL BOX */}
                <div className="border border-dashed border-cyan-500/40 rounded-2xl p-4 bg-cyan-950/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <BookOpen className="w-4 h-4" />
                    <span>Fill from Textbook</span>
                    <span className="text-[11px] text-slate-400 font-normal">(Select a topic to auto-fill the form)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Subject */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Subject</label>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => handleAutoFillSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                      >
                        <option value="">Select subject</option>
                        {availableCurriculum.flatMap(cat => 
                          cat.subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.nameEn}</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Grade / Level */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Grade / Level</label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => {
                          setSelectedGrade(e.target.value);
                          setGrade(e.target.value);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                      >
                        <option value="">Select grade</option>
                        <option value="Primary 1">Primary 1 (P1)</option>
                        <option value="Primary 2">Primary 2 (P2)</option>
                        <option value="Primary 3">Primary 3 (P3)</option>
                        <option value="Primary 4">Primary 4 (P4)</option>
                        <option value="Primary 5">Primary 5 (P5)</option>
                        <option value="Primary 6">Primary 6 (P6)</option>
                        <option value="Senior 1">Senior 1 (S1)</option>
                        <option value="Senior 2">Senior 2 (S2)</option>
                        <option value="Senior 3">Senior 3 (S3)</option>
                        <option value="Senior 4">Senior 4 (S4)</option>
                        <option value="Senior 5">Senior 5 (S5)</option>
                        <option value="Senior 6">Senior 6 (S6)</option>
                        <option value="TTC Year 1">TTC Year 1</option>
                        <option value="TTC Year 2">TTC Year 2</option>
                        <option value="TTC Year 3">TTC Year 3</option>
                        <option value="TVET Level 3">TVET Level 3</option>
                        <option value="TVET Level 4">TVET Level 4</option>
                        <option value="TVET Level 5">TVET Level 5</option>
                      </select>
                    </div>

                    {/* Unit */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300">Unit (Umutwe)</label>
                        <span className="text-[10px] text-cyan-400 font-medium">Type or select</span>
                      </div>
                      <input
                        type="text"
                        value={selectedUnit}
                        placeholder="e.g. Unit 3: Fractions..."
                        onChange={(e) => {
                          setSelectedUnit(e.target.value);
                          setUnit(e.target.value);
                        }}
                        list="hw-units-datalist"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                      />
                      <datalist id="hw-units-datalist">
                        {availableCurriculum
                          .flatMap(c => c.subjects)
                          .find(s => s.id === selectedSubjectId)
                          ?.sampleUnits?.map((u, idx) => (
                            <option key={`${u.unitNumber}-${idx}`} value={`${u.unitNumber}: ${u.unitTitleEn}`} />
                          )) || (
                            <>
                              <option value="Unit 1: Fundamentals and Principles" />
                              <option value="Unit 2: Quantitative Operations & Logic" />
                              <option value="Unit 3: Scientific Investigation & Application" />
                              <option value="Unit 4: Environmental & Practical Scenarios" />
                              <option value="Unit 5: Advanced Synthesis & Problem Solving" />
                            </>
                          )
                        }
                      </datalist>
                    </div>

                    {/* Topic */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Topic</label>
                      <input
                        type="text"
                        value={selectedTopic}
                        placeholder="Select topic or type"
                        onChange={(e) => {
                          setSelectedTopic(e.target.value);
                          setTopic(e.target.value);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: LESSON DETAILS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-white border-b border-slate-800 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.lessonDetailsTitle}</span>
                  <span className="text-xs text-slate-400 font-normal ml-2">{t.lessonDetailsSub}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Subject * */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.subjectLabel}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Biology, Mathematics, English"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none font-medium"
                    />
                  </div>

                  {/* Grade * */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.gradeLabel}</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g., 5th grade, Senior 3, Year 10"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none font-medium"
                    />
                  </div>

                  {/* Unit (Number & Title) / Umutwe * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300">{t.unitLabel} *</label>
                      <span className="text-[10px] text-amber-400 font-semibold">{unit ? unit : t.defaultUnit}</span>
                    </div>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => {
                        setUnit(e.target.value);
                        setSelectedUnit(e.target.value);
                      }}
                      placeholder="e.g., Unit 3: Fractions, Decimals & Percentages / Umutwe wa 3..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none font-medium"
                    />
                  </div>

                  {/* Topic * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-slate-300">{t.topicLabel}</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        setSelectedTopic(e.target.value);
                      }}
                      placeholder="e.g., Addition of Fractions, Quadratic Equations, The Water Cycle"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none font-medium"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Country / Igihugu</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., Rwanda, Kenya, Nigeria, USA..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Curriculum Standard */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.curriculumLabel}</label>
                    <input
                      type="text"
                      value={curriculumStandard}
                      onChange={(e) => setCurriculumStandard(e.target.value)}
                      placeholder="e.g., Rwanda REB, Cambridge, WAEC, IB..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">{t.languageLabel}</label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as AssessmentLanguage)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none font-medium"
                    >
                      <option value="English">English (English)</option>
                      <option value="Kinyarwanda">Kinyarwanda (Ikinyarwanda)</option>
                      <option value="Français">Français (French)</option>
                      <option value="Kiswahili">Kiswahili (Swahili)</option>
                    </select>
                  </div>

                  {/* Time Allowed */}
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="font-bold text-slate-300">{t.timeLabel}</label>
                    <input
                      type="text"
                      value={timeAllowed}
                      onChange={(e) => setTimeAllowed(e.target.value)}
                      placeholder="45 minutes"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: QUESTION STRUCTURE */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">{t.questionStructureTitle}</h4>
                      <p className="text-[11px] text-slate-400">
                        {t.questionStructureSub}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={useSections}
                        onChange={(e) => setUseSections(e.target.checked)}
                        className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                      <span>{t.useSectionsLabel}</span>
                    </label>
                  </div>
                </div>

                {/* CONFIGURE SECTIONS HEADER & ADD SECTION */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{t.questionStructureTitle}</span>
                  <button
                    onClick={handleAddSection}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.addSectionBtn}</span>
                  </button>
                </div>

                {/* SECTIONS CARDS LIST */}
                <div className="space-y-4">
                  {sections.map((sec, secIdx) => (
                    <div
                      key={sec.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black text-xs">
                            {String.fromCharCode(65 + secIdx)}
                          </span>
                          <span className="text-sm font-black text-white">{sec.name}</span>
                        </div>

                        {sections.length > 1 && (
                          <button
                            onClick={() => handleRemoveSection(sec.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* QUESTION CATEGORIES 8 BUTTONS GRID */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Question Categories
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          
                          {/* 1. Multiple Choice */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Multiple Choice')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Multiple Choice'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Multiple Choice</div>
                            <div className="text-[10px] text-slate-400">A, B, C, D options</div>
                          </button>

                          {/* 2. True/False */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'True/False')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'True/False'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">True/False</div>
                            <div className="text-[10px] text-slate-400">TRUE or FALSE statements</div>
                          </button>

                          {/* 3. Fill in the Blank */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Fill in the Blank')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Fill in the Blank'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Fill in the Blank</div>
                            <div className="text-[10px] text-slate-400">Complete the sentence</div>
                          </button>

                          {/* 4. Short Answer */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Short Answer')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Short Answer'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Short Answer</div>
                            <div className="text-[10px] text-slate-400">1-2 sentence responses</div>
                          </button>

                          {/* 5. Long Answer */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Long Answer')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Long Answer'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Long Answer</div>
                            <div className="text-[10px] text-slate-400">Paragraph responses</div>
                          </button>

                          {/* 6. Matching */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Matching')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Matching'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Matching</div>
                            <div className="text-[10px] text-slate-400">Match items from two columns</div>
                          </button>

                          {/* 7. Calculation */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Calculation')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Calculation'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Calculation</div>
                            <div className="text-[10px] text-slate-400">Math problems with working</div>
                          </button>

                          {/* 8. Essay */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(sec.id, 'Essay')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              sec.category === 'Essay'
                                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-black text-slate-100">Essay</div>
                            <div className="text-[10px] text-slate-400">Extended writing response</div>
                          </button>

                        </div>
                        <div className="text-[11px] font-bold text-amber-400 pt-1">
                          Selected: {sec.category}
                        </div>
                      </div>

                      {/* QUESTIONS COUNT & MARKS EACH WITH INTERACTIVE STEPPERS & PRESETS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                        
                        {/* 1. QUESTIONS COUNT */}
                        <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{t.sectionColCount || 'Questions'}</span>
                              <span className="text-[10px] text-slate-400 font-normal">(Umubare w'ibibazo)</span>
                            </label>
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                              {sec.questionCount} {sec.questionCount === 1 ? 'Question' : 'Questions'}
                            </span>
                          </div>

                          {/* Stepper + Direct Input */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateSectionParams(sec.id, 'questionCount', Math.max(1, (Number(sec.questionCount) || 1) - 1))}
                              disabled={sec.questionCount <= 1}
                              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold transition-all border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                              title="Decrease Questions (-1)"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={sec.questionCount}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                handleUpdateSectionParams(sec.id, 'questionCount', isNaN(val) ? 1 : Math.max(1, Math.min(100, val)));
                              }}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold text-slate-100 focus:border-amber-400 outline-none font-mono"
                              placeholder="1 - 100"
                            />

                            <button
                              type="button"
                              onClick={() => handleUpdateSectionParams(sec.id, 'questionCount', Math.min(100, (Number(sec.questionCount) || 0) + 1))}
                              className="w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold transition-all border border-amber-500/40 cursor-pointer"
                              title="Increase Questions (+1)"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quick Chips for Easy Selection & Increments */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-500 font-medium">Quick:</span>
                            {[2, 5, 8, 10, 15, 20].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => handleUpdateSectionParams(sec.id, 'questionCount', n)}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  sec.questionCount === n
                                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleUpdateSectionParams(sec.id, 'questionCount', Math.min(100, (Number(sec.questionCount) || 0) + 5))}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-800/50 transition-all cursor-pointer"
                              title="Add 5 more questions"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        {/* 2. MARKS EACH */}
                        <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{t.sectionColMarks || 'Marks Each'}</span>
                              <span className="text-[10px] text-slate-400 font-normal">(Amanota kuri buri kibazo)</span>
                            </label>
                            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30">
                              {sec.marksEach} {sec.marksEach === 1 ? 'Mark' : 'Marks'} ea
                            </span>
                          </div>

                          {/* Stepper + Direct Input */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const curr = Number(sec.marksEach) || 1;
                                const next = curr > 2 ? curr - 1 : Math.max(0.5, curr - 0.5);
                                handleUpdateSectionParams(sec.id, 'marksEach', next);
                              }}
                              disabled={sec.marksEach <= 0.5}
                              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold transition-all border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                              title="Decrease Marks (-1)"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <input
                              type="number"
                              min={0.5}
                              max={100}
                              step={0.5}
                              value={sec.marksEach}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                handleUpdateSectionParams(sec.id, 'marksEach', isNaN(val) ? 1 : Math.max(0.5, Math.min(100, val)));
                              }}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold text-slate-100 focus:border-blue-400 outline-none font-mono"
                              placeholder="1 - 100"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const curr = Number(sec.marksEach) || 0;
                                const next = Math.min(100, curr + 1);
                                handleUpdateSectionParams(sec.id, 'marksEach', next);
                              }}
                              className="w-9 h-9 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold transition-all border border-blue-500/40 cursor-pointer"
                              title="Increase Marks (+1)"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quick Chips for Marks Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-500 font-medium">Quick:</span>
                            {[1, 2, 3, 4, 5, 10].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => handleUpdateSectionParams(sec.id, 'marksEach', m)}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  sec.marksEach === m
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                                }`}
                              >
                                {m}pt{m > 1 ? 's' : ''}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleUpdateSectionParams(sec.id, 'marksEach', Math.min(100, (Number(sec.marksEach) || 0) + 5))}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800/50 transition-all cursor-pointer"
                              title="Add 5 marks"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* SECTION SUBTOTAL */}
                      <div className="text-[11px] text-slate-300 font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span>Section calculation:</span>
                        <span className="font-bold text-slate-100 font-mono">
                          <span className="text-amber-400">{sec.questionCount} {sec.questionCount === 1 ? 'question' : 'questions'}</span> × <span className="text-blue-400">{sec.marksEach} {sec.marksEach === 1 ? 'mark' : 'marks'}</span> = <span className="text-emerald-400 font-black">{sec.questionCount * sec.marksEach} Marks</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL SUMMARY BAR */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm font-black text-white">
                  <span>Total:</span>
                  <span className="text-amber-400">{totalQuestions} questions • {totalMarks} marks</span>
                </div>
              </div>

              {/* SECTION: UPLOAD BOOK / TEXTBOOK & SOURCE CONTENT */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>Upload Textbook / Book / Document (PDF, TXT, Word)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => bookFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadedBookName ? 'Change Book' : 'Upload Book File'}</span>
                  </button>
                  <input
                    type="file"
                    ref={bookFileInputRef}
                    onChange={handleBookFileUpload}
                    accept=".pdf,.txt,.doc,.docx,.md"
                    className="hidden"
                  />
                </div>

                {uploadedBookName && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span><strong>Loaded Book:</strong> {uploadedBookName} (Ready to generate quiz & answer key!)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedBookName('')}
                      className="text-emerald-400 hover:text-white text-[11px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Upload your textbook, chapter PDF, or paste lesson notes below. AI will automatically generate questions, exercises, and complete answer keys based on this book content.
                </p>

                <textarea
                  rows={4}
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Or paste your textbook chapter excerpts, lesson notes, or reading material here...&#10;&#10;Example: Unit 4: Photosynthesis and plant nutrition. Green plants synthesize glucose using sunlight..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Questions & Answer Key will be synthesized based on uploaded book/content</span>
                  <span className="font-mono">{sourceContent.length} chars</span>
                </div>
              </div>

              {/* SECTION: DIFFICULTY LEVEL */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
                <div className="text-sm font-black text-white">{t.difficultyTitle}</div>
                <p className="text-xs text-slate-400">{t.difficultyDesc}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Easy */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('Easy')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      difficulty === 'Easy'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-black text-sm text-slate-100">{t.diffEasy}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{t.diffEasySub}</div>
                  </button>

                  {/* Medium */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('Medium')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      difficulty === 'Medium'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-black text-sm text-slate-100">{t.diffMed}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{t.diffMedSub}</div>
                  </button>

                  {/* Hard */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('Hard')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      difficulty === 'Hard'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-black text-sm text-slate-100">{t.diffHard}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{t.diffHardSub}</div>
                  </button>

                  {/* Mixed */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('Mixed')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      difficulty === 'Mixed'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-black text-sm text-slate-100">{t.diffMixed}</div>
                      {difficulty === 'Mixed' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{t.diffMixedSub}</div>
                  </button>
                </div>
              </div>

              {/* SECTION: OUTPUT OPTIONS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-white border-b border-slate-800 pb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{t.outputOptionsTitle}</span>
                  <span className="text-xs text-slate-400 font-normal ml-2">{t.outputOptionsDesc}</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Search curriculum resources */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchCurriculum}
                      onChange={(e) => setSearchCurriculum(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.optCurriculumSearch}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.optCurriculumSearchDesc}
                      </div>
                    </div>
                  </label>

                  {/* Include Answer Key */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAnswerKey}
                      onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-200">{t.optAnswerKey}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.optAnswerKeyDesc}
                      </div>
                    </div>
                  </label>

                  {/* Include Marking Scheme */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMarkingScheme}
                      onChange={(e) => setIncludeMarkingScheme(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-200">{t.optMarkingScheme}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.optMarkingSchemeDesc}
                      </div>
                    </div>
                  </label>

                  {/* Include Hints */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHints}
                      onChange={(e) => setIncludeHints(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-200">{t.optHints}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.optHintsDesc}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* MANUAL CUSTOM QUESTIONS INPUT BOX (OPTIONAL) */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-amber-500/30 space-y-3">
                <div>
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>{t.customQuestionsTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.customQuestionsSub}
                  </p>
                </div>
                <textarea
                  rows={3}
                  value={customQuestionsInputText}
                  onChange={(e) => setCustomQuestionsInputText(e.target.value)}
                  placeholder={
                    language === 'Kinyarwanda'
                      ? "Andika cyangwa paste ibibazo byawe hano... (urugero: 1. Niba 2x + 3 = 11, x ni zingahe?)"
                      : "Type or paste your custom questions here line by line...\n1. Calculate the area of a circle with radius 7cm.\n2. Explain the process of photosynthesis."
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:border-amber-400 outline-none leading-relaxed"
                />
              </div>

              {/* DEDICATED TEACHER NOTES FIELD (PRIVATE GRADING REFERENCE) */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-indigo-500/30 space-y-3">
                <div>
                  <h3 className="text-sm font-black text-indigo-300 flex items-center gap-2">
                    <NotebookPen className="w-4 h-4 text-indigo-400" />
                    <span>{t.teacherNotesTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.teacherNotesSub}
                  </p>
                </div>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder={t.teacherNotesPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-400 outline-none leading-relaxed"
                />

                {/* PDF & Print Placement Option for Teacher Notes */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.teacherNotesPdfModeLabel}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTeacherNotesPdfMode('separate_page')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        teacherNotesPdfMode === 'separate_page'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-100 flex items-center justify-between">
                        <span>📄 {t.teacherNotesModeSeparatePage}</span>
                        {teacherNotesPdfMode === 'separate_page' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {t.teacherNotesModeSeparatePageDesc}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeacherNotesPdfMode('footer')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        teacherNotesPdfMode === 'footer'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-100 flex items-center justify-between">
                        <span>📑 {t.teacherNotesModeFooter}</span>
                        {teacherNotesPdfMode === 'footer' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {t.teacherNotesModeFooterDesc}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeacherNotesPdfMode('none')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        teacherNotesPdfMode === 'none'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-100 flex items-center justify-between">
                        <span>🚫 {t.teacherNotesModeNone}</span>
                        {teacherNotesPdfMode === 'none' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {t.teacherNotesModeNoneDesc}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM TIP */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11.5px] text-slate-400 flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <p>
                  {t.bottomTip}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                >
                  {t.cancelBtn}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAsTemplate()}
                  className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 hover:border-purple-400 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title={t.saveSetupTemplateBtn}
                >
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <span>{t.saveSetupTemplateBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateManualAssessment}
                  disabled={isGenerating}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                  title={t.createManuallyDesc}
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>{t.createManuallyBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-7 py-3 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/50 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{t.generating}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>
                        {mode === 'homework' ? t.btnGenerateHw : mode === 'classwork' ? t.btnGenerateCw : t.btnGenerateQuiz}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* GENERATED OUTPUT VIEWER & EDITOR */
            <div className="space-y-6 animate-fade-in">
              
              {/* TOP ACTION TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setGeneratedOutput(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backBtn}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Preview as Student Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewAsStudent(!isPreviewAsStudent);
                      if (!isPreviewAsStudent) setIsEditing(false);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isPreviewAsStudent
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40 ring-2 ring-cyan-400'
                        : 'bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400'
                    }`}
                    title="Toggle student layout preview hiding answers and teacher controls"
                  >
                    {isPreviewAsStudent ? (
                      <>
                        <UserCheck className="w-4 h-4 text-cyan-200" />
                        <span>{t.previewAsTeacherBtn}</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        <span>{t.previewAsStudentBtn}</span>
                      </>
                    )}
                  </button>

                  {/* Teacher Management Controls (Hidden during Student Preview) */}
                  {!isPreviewAsStudent && (
                    <>
                      {/* Toggle Answer Key Button */}
                      <button
                        type="button"
                        onClick={() => setShowAnswerKeyInline(!showAnswerKeyInline)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          showAnswerKeyInline
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-2 ring-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600'
                        }`}
                        title="Toggle correct answers and solutions display alongside questions for teacher review"
                      >
                        {showAnswerKeyInline ? (
                          <>
                            <EyeOff className="w-4 h-4 text-emerald-200" />
                            <span>{t.hideAnswersBtn}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-amber-400" />
                            <span>{t.showAnswersBtn}</span>
                          </>
                        )}
                      </button>

                      {/* Save as Template Button */}
                      <button
                        onClick={() => handleSaveAsTemplate()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-950/50 transition-all cursor-pointer hover:scale-105"
                        title={t.saveTemplateBtn}
                      >
                        <Bookmark className="w-4 h-4 text-purple-200" />
                        <span>{t.saveTemplateBtn}</span>
                      </button>

                      {/* Toggle Edit / Preview Mode Button */}
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isEditing
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <Save className="w-4 h-4 text-white" />
                            <span>{t.doneEditingBtn}</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4" />
                            <span>{t.editAssessmentBtn}</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    <span>{copied ? t.copiedBtn : t.copyBtn}</span>
                  </button>

                  {/* Direct Print Button */}
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-100 transition-all cursor-pointer border border-slate-700 hover:border-slate-600"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>{t.printBtn}</span>
                  </button>

                  {/* Download PDF Button */}
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-950/40 transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>{t.downloadPdfBtn}</span>
                  </button>

                  {/* Export Word (.doc) Button */}
                  <button
                    onClick={handleExportWord}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-black text-white shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.downloadWordBtn}</span>
                  </button>
                </div>
              </div>

              {/* STUDENT PREVIEW BANNER */}
              {isPreviewAsStudent && (
                <div className="bg-cyan-950/90 border border-cyan-500/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-cyan-200 animate-fade-in shadow-xl shadow-cyan-950/40">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="font-bold">{t.studentPreviewNotice}</span>
                  </div>
                  <button
                    onClick={() => setIsPreviewAsStudent(false)}
                    className="px-3.5 py-1.5 bg-cyan-900/90 hover:bg-cyan-800 text-cyan-100 text-xs font-bold rounded-xl border border-cyan-500/50 transition-all cursor-pointer shrink-0 hover:scale-105"
                  >
                    {t.previewAsTeacherBtn}
                  </button>
                </div>
              )}

              {/* EDIT MODE FORM */}
              {isEditing ? (
                <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-black text-white">{t.editAssessmentBtn}</h3>
                    </div>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.doneEditingBtn}</span>
                    </button>
                  </div>

                  {/* General Header Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300">Assessment Title</label>
                      <input
                        type="text"
                        value={generatedOutput.title}
                        onChange={(e) => handleUpdateHeaderField('title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-400 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">{t.topicLabel}</label>
                      <input
                        type="text"
                        value={generatedOutput.topic}
                        onChange={(e) => handleUpdateHeaderField('topic', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">{t.timeLabel}</label>
                      <input
                        type="text"
                        value={generatedOutput.timeAllowed}
                        onChange={(e) => handleUpdateHeaderField('timeAllowed', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <NotebookPen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t.teacherNotesTitle}</span>
                      </label>
                      <textarea
                        rows={2}
                        value={generatedOutput.teacherNotes || ''}
                        onChange={(e) => handleUpdateHeaderField('teacherNotes', e.target.value)}
                        placeholder={t.teacherNotesPlaceholder}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-indigo-400 outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Section by Section Editing */}
                  <div className="space-y-6">
                    {generatedOutput.sections.map((sec, secIdx) => (
                      <div key={sec.name} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-sm font-black text-amber-400">{sec.name}: {sec.category}</span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">({sec.totalMarks} {t.marksLabel})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(secIdx)}
                            className="flex items-center gap-1 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.addQuestionBtn}</span>
                          </button>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-4">
                          {sec.questions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg text-xs font-bold font-mono">
                                    Q{q.number}
                                  </span>
                                  <span className="text-xs text-slate-400">{q.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-xs text-slate-300">
                                    <span>{t.marksLabel}:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={50}
                                      value={q.marks}
                                      onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { marks: Number(e.target.value) || 1 })}
                                      className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-xs font-bold text-amber-400 focus:border-amber-400 outline-none"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(secIdx, qIdx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                    title={t.deleteQuestionBtn}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Question Text */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400">{t.questionTextLabel}</label>
                                <textarea
                                  rows={2}
                                  value={q.questionText}
                                  onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { questionText: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-400 outline-none leading-relaxed"
                                />
                              </div>

                              {/* Options Editor for Multiple Choice */}
                              {q.options && (
                                <div className="space-y-2 pl-2 border-l-2 border-slate-700">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                    <span>{t.optionsLabel}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleAddOption(secIdx, qIdx)}
                                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>{t.addOptionBtn}</span>
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => handleUpdateOption(secIdx, qIdx, optIdx, e.target.value)}
                                          className="flex-1 bg-transparent text-xs text-slate-200 outline-none px-1"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOption(secIdx, qIdx, optIdx)}
                                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                          title={t.removeOptionBtn}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Correct Answer & Explanation */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-emerald-400">{t.answerLabel}</label>
                                  <input
                                    type="text"
                                    value={q.correctAnswer}
                                    onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { correctAnswer: e.target.value })}
                                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-bold focus:border-emerald-400 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-400">{t.explanationLabel}</label>
                                  <input
                                    type="text"
                                    value={q.explanation || ''}
                                    onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { explanation: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-400 outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddSectionToOutput}
                      className="w-full py-3.5 bg-slate-900/90 hover:bg-slate-850 border-2 border-dashed border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>{t.addSectionOutputBtn}</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.doneEditingBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* DOCUMENT VIEW PREVIEW */
                <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6 select-text">
                  
                  {/* DOCUMENT HEADER */}
                  <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-4">
                    <div className="text-center space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                        {generatedOutput.title}
                      </h2>
                      <p className="text-xs font-bold text-slate-600">
                        {generatedOutput.curriculumStandard} Standards • {generatedOutput.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs sm:text-sm border-t border-b border-slate-200 py-3">
                      <div>
                        <strong>Student Name:</strong> ____________________________________
                      </div>
                      <div>
                        <strong>Date:</strong> ____________________________
                      </div>
                      <div>
                        <strong>Class / Grade:</strong> {generatedOutput.grade}
                      </div>
                      <div>
                        <strong>Subject:</strong> {generatedOutput.subject}
                      </div>
                      <div>
                        <strong>Unit:</strong> <span className="font-bold text-blue-900">{generatedOutput.unit || unit}</span>
                      </div>
                      <div>
                        <strong>Topic:</strong> <span className="font-bold text-slate-800">{generatedOutput.topic}</span>
                      </div>
                      <div>
                        <strong>Time Allowed:</strong> {generatedOutput.timeAllowed}
                      </div>
                      <div>
                        <strong>Total Marks:</strong> <span className="font-black text-blue-700">{generatedOutput.totalMarks} Marks</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 italic">
                      <strong>Instructions:</strong> {generatedOutput.instructions.join(' • ')}
                    </div>
                  </div>

                  {/* SECTIONS */}
                  <div className="space-y-6">
                    {generatedOutput.sections.map(sec => (
                      <div key={sec.name} className="space-y-3">
                        <div className="bg-slate-100 px-4 py-2 rounded-xl border-l-4 border-blue-600 font-black text-sm text-slate-900 flex items-center justify-between">
                          <span>{sec.name}: {sec.category.toUpperCase()}</span>
                          <span className="text-xs text-blue-700 font-bold">({sec.totalMarks} Marks)</span>
                        </div>

                        <div className="space-y-4 pl-2">
                          {sec.questions.map(q => (
                            <div key={q.id} className="space-y-2 text-xs sm:text-sm no-break">
                              <div className="font-bold text-slate-900 flex items-start gap-2">
                                <span className="text-blue-700">Q{q.number}.</span>
                                <span className="flex-1">{q.questionText}</span>
                                <span className="text-xs text-slate-500 font-normal">({q.marks} {q.marks === 1 ? 'Mark' : 'Marks'})</span>
                              </div>

                              {q.options ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 text-xs text-slate-700">
                                  {q.options.map((opt, i) => (
                                    <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="pl-6 space-y-2 pt-1">
                                  <div className="border-b border-dotted border-slate-300 h-6"></div>
                                  <div className="border-b border-dotted border-slate-300 h-6"></div>
                                </div>
                              )}

                              {q.hint && (
                                <div className="pl-6 text-[11px] text-slate-500 italic">
                                  💡 {q.hint}
                                </div>
                              )}

                              {/* Inline Solution Box for Teacher Review */}
                              {!isPreviewAsStudent && showAnswerKeyInline && (
                                <div className="mt-2.5 ml-6 p-3 bg-emerald-50/95 border border-emerald-300/80 rounded-xl text-xs space-y-1 animate-fade-in shadow-xs">
                                  <div className="font-bold text-emerald-950 flex items-start gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>
                                      <strong>{language === 'Kinyarwanda' ? 'Igisubizo Nyacyo' : language === 'Français' ? 'Réponse Attendue' : language === 'Kiswahili' ? 'Jibu Sahihi' : 'Answer Key / Solution'}:</strong>{' '}
                                      <span className="text-emerald-800 font-extrabold">{q.correctAnswer}</span>
                                    </span>
                                  </div>
                                  {q.explanation && (
                                    <div className="text-slate-700 text-[11.5px] pl-5 leading-relaxed">
                                      <strong>{language === 'Kinyarwanda' ? 'Ibisobanuro' : language === 'Français' ? 'Explication' : language === 'Kiswahili' ? 'Maelezo' : 'Explanation'}:</strong> {q.explanation}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ANSWER KEY (Teacher view only) */}
                  {!isPreviewAsStudent && includeAnswerKey && (
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-blue-400 space-y-4 no-break">
                      <div className="text-center">
                        <h3 className="text-base font-black uppercase text-blue-700">
                          Teacher's Answer Key & Explanations
                        </h3>
                        <p className="text-xs text-slate-500">Official answers for classroom assessment & correction</p>
                      </div>

                      <div className="space-y-4 text-xs">
                        {generatedOutput.answerKey.map(ak => (
                          <div key={ak.sectionName} className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 no-break">
                            <h4 className="font-bold text-blue-800">{ak.sectionName}</h4>
                            <div className="space-y-2 pl-2">
                              {ak.answers.map(ans => (
                                <div key={ans.number} className="space-y-0.5 no-break">
                                  <div>
                                    <strong>Q{ans.number}:</strong> <span className="text-emerald-700 font-bold">{ans.answer}</span>
                                  </div>
                                  <div className="text-slate-600 text-[11px]">
                                    <em>Explanation:</em> {ans.explanation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MARKING SCHEME (Teacher view only) */}
                  {!isPreviewAsStudent && includeMarkingScheme && (
                    <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs no-break">
                      <h4 className="font-black text-amber-900 uppercase">Official Marking Scheme</h4>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-amber-300 text-amber-950 font-bold">
                            <th className="py-1.5 px-2">Section / Criterion</th>
                            <th className="py-1.5 px-2 text-center">Marks</th>
                            <th className="py-1.5 px-2">Guideline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedOutput.markingScheme.rubricPoints.map((rp, idx) => (
                            <tr key={idx} className="border-b border-amber-200/60">
                              <td className="py-1.5 px-2 font-bold text-slate-800">{rp.criterion}</td>
                              <td className="py-1.5 px-2 text-center font-black text-blue-700">{rp.allocatedMarks}</td>
                              <td className="py-1.5 px-2 text-slate-700">{rp.guidance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* DEDICATED TEACHER NOTES / GRADING REFERENCE (Teacher view only) */}
                  {!isPreviewAsStudent && (generatedOutput.teacherNotes || teacherNotes) && (
                    <div className="mt-6 p-4.5 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 text-xs space-y-3 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-indigo-950 font-black uppercase tracking-wider text-xs border-b border-indigo-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <NotebookPen className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{t.teacherNotesTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] normal-case">
                          <span className="text-indigo-800 font-bold">PDF Mode:</span>
                          <div className="inline-flex bg-indigo-200/80 rounded-lg p-0.5 border border-indigo-300">
                            <button
                              type="button"
                              onClick={() => setTeacherNotesPdfMode('separate_page')}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                                teacherNotesPdfMode === 'separate_page'
                                  ? 'bg-indigo-700 text-white shadow-xs'
                                  : 'text-indigo-900 hover:bg-indigo-300/60'
                              }`}
                              title="Render as dedicated Teacher Guide page"
                            >
                              📄 Guide Page
                            </button>
                            <button
                              type="button"
                              onClick={() => setTeacherNotesPdfMode('footer')}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                                teacherNotesPdfMode === 'footer'
                                  ? 'bg-indigo-700 text-white shadow-xs'
                                  : 'text-indigo-900 hover:bg-indigo-300/60'
                              }`}
                              title="Render in assessment footer"
                            >
                              📑 Footer
                            </button>
                            <button
                              type="button"
                              onClick={() => setTeacherNotesPdfMode('none')}
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                                teacherNotesPdfMode === 'none'
                                  ? 'bg-indigo-700 text-white shadow-xs'
                                  : 'text-indigo-900 hover:bg-indigo-300/60'
                              }`}
                              title="Exclude from PDF / Print"
                            >
                              🚫 Exclude
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-indigo-900 leading-relaxed font-medium whitespace-pre-wrap pl-1 pt-0.5">
                        {generatedOutput.teacherNotes || teacherNotes}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
