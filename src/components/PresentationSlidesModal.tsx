import React, { useState, useEffect } from 'react';
import { 
  X, 
  Presentation, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  BookOpen, 
  Sliders, 
  Palette, 
  AlertTriangle, 
  Download, 
  Copy, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Plus,
  Edit3,
  FolderHeart, 
  RefreshCw,
  FileText,
  Eye,
  Check,
  Printer,
  ChevronDown,
  LayoutGrid,
  Languages,
  GraduationCap,
  Briefcase,
  Search,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { UserProfile, PresentationSlideDeck } from '../types';
import { saveSlideDeckToFirestore, loadSlideDecksFromFirestore, deleteSlideDeckFromFirestore } from '../utils/firebase';
import { checkCanUseAiCredit, deductAiCredit } from '../utils/subscription';

export type SlideLanguage = 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili';

export const SLIDES_UI_TRANSLATIONS: Record<SlideLanguage, {
  langTitle: string;
  modalTitle: string;
  modalBadge: string;
  modalSubtitle: string;
  savedDecksBtn: string;
  backBtn: string;
  newDeckBtn: string;
  lessonDetailsTitle: string;
  lessonDetailsSub: string;
  subjectLabel: string;
  gradeLabel: string;
  topicLabel: string;
  durationLabel: string;
  languageLabel: string;
  countryLabel: string;
  curriculumLabel: string;
  additionalDetailsLabel: string;
  additionalDetailsPlaceholder: string;
  pasteNotesTitle: string;
  pasteNotesSub: string;
  pasteNotesPlaceholder: string;
  pasteNotesExampleTitle: string;
  enhancementTitle: string;
  searchResourcesLabel: string;
  searchResourcesDesc: string;
  generateImagesLabel: string;
  generateImagesDesc: string;
  teacherPrefTitle: string;
  teacherPrefSub: string;
  teacherNotesStyleLabel: string;
  bulletPointStyleLabel: string;
  numberOfSlidesLabel: string;
  includeTimingsLabel: string;
  simplifiedModeLabel: string;
  chooseThemeTitle: string;
  chooseThemeSub: string;
  allThemesTab: string;
  educationalTab: string;
  professionalTab: string;
  creativeTab: string;
  themeFilterSubtitle: string;
  previewSlideBtn: string;
  searchThemesPlaceholder: string;
  switchThemeTooltip: string;
  generateBtn: string;
  generatingBtn: string;
  presentFullscreenBtn: string;
  pdfBtn: string;
  handoutBtn: string;
  pptBtn: string;
  copyBtn: string;
  copiedBtn: string;
  slideOf: string;
  teacherGuidanceTitle: string;
  prevSlide: string;
  nextSlide: string;
  allSlidesOverview: string;
  exitPresent: string;
  presenterNotesToggle: string;
  addSlideBtn: string;
  deleteSlideBtn: string;
  editSlideBtn: string;
  saveChangesBtn: string;
  cancelBtn: string;
  defaultSubject: string;
  defaultGrade: string;
  defaultTopic: string;
  defaultDuration: string;
  defaultCurriculum: string;
  defaultCountry: string;
  defaultNotesPlaceholder: string;
}> = {
  English: {
    langTitle: 'Language Context:',
    modalTitle: 'Create Presentation Slides',
    modalBadge: 'AI SLIDES',
    modalSubtitle: 'Create beautiful presentation slides aligned with your topic, ready to present in class',
    savedDecksBtn: 'Saved Decks',
    backBtn: 'Back',
    newDeckBtn: 'New Deck',
    lessonDetailsTitle: 'Lesson Details & Curriculum',
    lessonDetailsSub: 'Fill in the details about your lesson',
    subjectLabel: 'Subject *',
    gradeLabel: 'Grade / Level *',
    topicLabel: 'Topic *',
    durationLabel: 'Lesson Duration *',
    languageLabel: 'Language',
    countryLabel: 'Country',
    curriculumLabel: 'Curriculum Standard',
    additionalDetailsLabel: 'Additional Details (Optional)',
    additionalDetailsPlaceholder: 'e.g., Introduce the concept and include questions for in-class discussion',
    pasteNotesTitle: 'Paste Your Notes (Optional)',
    pasteNotesSub: "Have your own notes? Paste them here and we'll structure them into slides - using YOUR content, not generating new material.",
    pasteNotesPlaceholder: 'Paste your lesson notes here...',
    pasteNotesExampleTitle: 'Example:',
    enhancementTitle: 'Enhancement Options',
    searchResourcesLabel: 'Search curriculum & educational resources',
    searchResourcesDesc: "We'll automatically search for official curriculum content, course materials, textbooks, and educational resources relevant to your topic.",
    generateImagesLabel: 'Generate visual prompts & diagrams for slides',
    generateImagesDesc: 'We will generate relevant educational diagrams, illustrations, and visual prompts for each slide.',
    teacherPrefTitle: 'Teacher Preferences',
    teacherPrefSub: 'Customize how your slides are generated & delivered',
    teacherNotesStyleLabel: 'Teacher Notes Style',
    bulletPointStyleLabel: 'Bullet Point Style',
    numberOfSlidesLabel: 'Number of Slides',
    includeTimingsLabel: 'Include slide timings',
    simplifiedModeLabel: 'Simplified mode (no heavy academic jargon)',
    chooseThemeTitle: 'Choose Visual Theme',
    chooseThemeSub: 'Select from educational, professional, or creative visual styles for your slides',
    allThemesTab: 'All Themes',
    educationalTab: '🎓 Educational',
    professionalTab: '💼 Professional',
    creativeTab: '🎨 Creative',
    themeFilterSubtitle: 'Filter by category to find the ideal presentation aesthetic for your class',
    previewSlideBtn: 'Preview Slide',
    searchThemesPlaceholder: 'Search themes by name or tag...',
    switchThemeTooltip: 'Change Theme',
    generateBtn: 'Generate Presentation Slides (AI)',
    generatingBtn: 'Creating Presentation Slides with AI...',
    presentFullscreenBtn: 'Present (Full Screen)',
    pdfBtn: 'PDF',
    handoutBtn: 'Handout PDF',
    pptBtn: 'PPT',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    slideOf: 'Slide #{current} of {total}',
    teacherGuidanceTitle: 'Teacher Guidance & Speaker Notes:',
    prevSlide: 'Previous Slide',
    nextSlide: 'Next Slide',
    allSlidesOverview: 'All Slides Overview',
    exitPresent: 'Exit Fullscreen',
    presenterNotesToggle: 'Presenter Notes',
    addSlideBtn: '+ Add Slide',
    deleteSlideBtn: 'Delete Slide',
    editSlideBtn: 'Edit Slide',
    saveChangesBtn: 'Save Changes',
    cancelBtn: 'Cancel',
    defaultSubject: 'Biology',
    defaultGrade: '5th grade (P5)',
    defaultTopic: 'Plant life cycle and photosynthesis',
    defaultDuration: '40 minutes',
    defaultCurriculum: 'Rwanda REB CBC',
    defaultCountry: 'Rwanda',
    defaultNotesPlaceholder: 'Paste your lesson notes here...'
  },
  Kinyarwanda: {
    langTitle: 'Language Setting:',
    modalTitle: 'Teaching Presentation Slides Studio',
    modalBadge: 'AI SLIDE STUDIO',
    modalSubtitle: 'Generate beautiful, professional teaching slides tailored to the CBC curriculum standards',
    savedDecksBtn: 'Saved Slide Decks',
    backBtn: 'Go Back',
    newDeckBtn: 'New Slide Deck',
    lessonDetailsTitle: 'Lesson Details & Curriculum',
    lessonDetailsSub: 'Enter details about your lesson and topic',
    subjectLabel: 'Subject *',
    gradeLabel: 'Grade / Class Level *',
    topicLabel: 'Lesson Topic *',
    durationLabel: 'Lesson Duration *',
    languageLabel: 'Language',
    countryLabel: 'Country',
    curriculumLabel: 'Curriculum Standard',
    additionalDetailsLabel: 'Additional Instructions (Optional)',
    additionalDetailsPlaceholder: 'Example: Focus on key concepts and include classroom discussion questions',
    pasteNotesTitle: 'Paste Your Notes (Optional)',
    pasteNotesSub: 'Have existing notes? Paste them here and AI will structure them into slides.',
    pasteNotesPlaceholder: 'Paste your lesson notes here...',
    pasteNotesExampleTitle: 'Example:',
    enhancementTitle: 'Pedagogical Enhancements & Aids',
    searchResourcesLabel: 'Search official REB textbooks & curriculum',
    searchResourcesDesc: 'AI will search official curriculum standards and textbooks relevant to this topic.',
    generateImagesLabel: 'Generate visual prompts & diagrams for slides',
    generateImagesDesc: 'We will generate relevant educational diagrams, illustrations, and visual prompts for each slide.',
    teacherPrefTitle: 'Teacher Preferences',
    teacherPrefSub: 'Customize how your slides are generated & delivered',
    teacherNotesStyleLabel: 'Teacher Notes Style',
    bulletPointStyleLabel: 'Bullet Point Style',
    numberOfSlidesLabel: 'Number of Slides',
    includeTimingsLabel: 'Include timings on each slide',
    simplifiedModeLabel: 'Use simplified clear language',
    chooseThemeTitle: 'Choose Design Theme & Colors',
    chooseThemeSub: 'Select from educational, professional, or creative design styles',
    allThemesTab: 'All Slide Themes',
    educationalTab: '🎓 Educational & Learning',
    professionalTab: '💼 Professional & Clean',
    creativeTab: '🎨 Creative & Artistic',
    themeFilterSubtitle: 'Filter categories to find the best theme for your classroom',
    previewSlideBtn: 'Preview Layout',
    searchThemesPlaceholder: 'Search themes...',
    switchThemeTooltip: 'Change Theme',
    generateBtn: 'Generate Teaching Slides (AI)',
    generatingBtn: 'AI is preparing all your slides...',
    presentFullscreenBtn: 'Present in Fullscreen',
    pdfBtn: 'Download PDF',
    handoutBtn: 'Student Handout (PDF)',
    pptBtn: 'PowerPoint (PPTX)',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    slideOf: 'Slide #{current} of {total}',
    teacherGuidanceTitle: 'Teacher Guidance & Speaker Notes:',
    prevSlide: 'Previous Slide',
    nextSlide: 'Next Slide',
    allSlidesOverview: 'All Slides Overview',
    exitPresent: 'Exit Fullscreen',
    presenterNotesToggle: 'Presenter Notes',
    addSlideBtn: '+ Add Slide',
    deleteSlideBtn: 'Delete Slide',
    editSlideBtn: 'Edit Slide',
    saveChangesBtn: 'Save Changes',
    cancelBtn: 'Cancel',
    defaultSubject: 'Biology',
    defaultGrade: '5th grade (P5)',
    defaultTopic: 'Plant life cycle and photosynthesis',
    defaultDuration: '40 minutes',
    defaultCurriculum: 'Rwanda REB CBC',
    defaultCountry: 'Rwanda',
    defaultNotesPlaceholder: 'Paste your lesson notes here...'
  },
  Français: {
    langTitle: 'Contexte Linguistique :',
    modalTitle: 'Studio de Diapositives Pédagogiques',
    modalBadge: 'DIAPOSITIVES IA',
    modalSubtitle: 'Créez de superbes diapositives de présentation alignées sur votre programme, prêtes pour la classe',
    savedDecksBtn: 'Diaporamas Enregistrés',
    backBtn: 'Retour',
    newDeckBtn: 'Nouveau Diaporama',
    lessonDetailsTitle: 'Détails de la Leçon & Programme',
    lessonDetailsSub: 'Remplissez les détails pédagogiques de votre leçon',
    subjectLabel: 'Matière *',
    gradeLabel: 'Niveau / Classe *',
    topicLabel: 'Sujet / Thème *',
    durationLabel: 'Durée de la Leçon *',
    languageLabel: 'Langue',
    countryLabel: 'Pays',
    curriculumLabel: 'Norme Pédagogique (Curriculum)',
    additionalDetailsLabel: 'Détails Supplémentaires (Optionnel)',
    additionalDetailsPlaceholder: 'Ex. : Introduire le concept et inclure des questions de discussion en classe',
    pasteNotesTitle: 'Coller Vos Notes (Optionnel)',
    pasteNotesSub: 'Vous avez vos propres notes de cours ? Collez-les ici et l\'IA les structurera en diapositives professionnelles.',
    pasteNotesPlaceholder: 'Collez vos notes de cours ici...',
    pasteNotesExampleTitle: 'Exemple :',
    enhancementTitle: 'Options d\'Enrichissement Pédagogique',
    searchResourcesLabel: 'Rechercher les ressources et manuels officiels',
    searchResourcesDesc: 'L\'IA intègre automatiquement le contenu conforme aux manuels et programmes officiels.',
    generateImagesLabel: 'Générer des schémas visuels et illustrations',
    generateImagesDesc: 'Crée des propositions visuelles et schémas conceptuels adaptés pour chaque diapositive.',
    teacherPrefTitle: 'Préférences de l\'Enseignant',
    teacherPrefSub: 'Personnalisez la structure et la densité de vos diapositives',
    teacherNotesStyleLabel: 'Style des Notes de l\'Enseignant',
    bulletPointStyleLabel: 'Style des Puces de Texte',
    numberOfSlidesLabel: 'Nombre de Diapositives',
    includeTimingsLabel: 'Inclure le minutage par diapositive',
    simplifiedModeLabel: 'Mode simplifié (termes accessibles)',
    chooseThemeTitle: 'Choisir le Thème Visuel',
    chooseThemeSub: 'Sélectionnez un style visuel éducatif, professionnel ou créatif',
    allThemesTab: 'Tous les Thèmes',
    educationalTab: '🎓 Éducatif',
    professionalTab: '💼 Professionnel',
    creativeTab: '🎨 Créatif',
    themeFilterSubtitle: 'Filtrez par catégorie pour trouver le style visuel parfait pour vos cours',
    previewSlideBtn: 'Aperçu Diapo',
    searchThemesPlaceholder: 'Rechercher un thème...',
    switchThemeTooltip: 'Changer de Thème',
    generateBtn: 'Générer les Diapositives (IA)',
    generatingBtn: 'Création des diapositives en cours...',
    presentFullscreenBtn: 'Présenter (Plein Écran)',
    pdfBtn: 'PDF',
    handoutBtn: 'Document Élève (Handout)',
    pptBtn: 'PPT',
    copyBtn: 'Copier',
    copiedBtn: 'Copié !',
    slideOf: 'Diapositive #{current} sur {total}',
    teacherGuidanceTitle: 'Guide Pédagogique & Notes de l\'Enseignant :',
    prevSlide: 'Diapositive Précédente',
    nextSlide: 'Diapositive Suivante',
    allSlidesOverview: 'Aperçu de Toutes les Diapositives',
    exitPresent: 'Quitter Plein Écran',
    presenterNotesToggle: 'Notes du Présentateur',
    addSlideBtn: '+ Ajouter Diapo',
    deleteSlideBtn: 'Supprimer Diapo',
    editSlideBtn: 'Modifier Diapo',
    saveChangesBtn: 'Enregistrer',
    cancelBtn: 'Annuler',
    defaultSubject: 'Sciences et Technologies',
    defaultGrade: '5ème Année Primaire (P5)',
    defaultTopic: 'Le cycle de vie des plantes et la photosynthèse',
    defaultDuration: '40 minutes',
    defaultCurriculum: 'REB / Programme CBC',
    defaultCountry: 'Rwanda',
    defaultNotesPlaceholder: 'Collez vos notes ici...'
  },
  Kiswahili: {
    langTitle: 'Muktadha wa Lugha:',
    modalTitle: 'Studio ya Slaidi za Kufundishia',
    modalBadge: 'SLAIDI ZA AI',
    modalSubtitle: 'Tengeneza slaidi maridadi za ufundishaji darasani zinazozingatia mtaala na mada yako',
    savedDecksBtn: 'Slaidi Zilizohifadhiwa',
    backBtn: 'Rudi Nyuma',
    newDeckBtn: 'Slaidi Mpya',
    lessonDetailsTitle: 'Maelezo ya Somo na Mtaala',
    lessonDetailsSub: 'Jaza maelezo kuhusu somo na mada yako ya darasani',
    subjectLabel: 'Somo (Subject) *',
    gradeLabel: 'Darasa / Ngazi (Grade) *',
    topicLabel: 'Mada ya Somo (Topic) *',
    durationLabel: 'Muda wa Kipindi *',
    languageLabel: 'Lugha',
    countryLabel: 'Nchi',
    curriculumLabel: 'Mtaala (Curriculum Standard)',
    additionalDetailsLabel: 'Maelezo ya Ziada (Hiari)',
    additionalDetailsPlaceholder: 'Mfano: Anza na mifano halisi na uweke maswali ya majadiliano ya darasani',
    pasteNotesTitle: 'Weka Maelezo Yako (Hiari)',
    pasteNotesSub: 'Je, una maelezo yako binafsi ya somo? Yaweke hapa AI iyabadilishe kuwa slaidi rasmi za ufundishaji.',
    pasteNotesPlaceholder: 'Bandika maelezo ya somo lako hapa...',
    pasteNotesExampleTitle: 'Mfano:',
    enhancementTitle: 'Chaguzi za Kuboresha',
    searchResourcesLabel: 'Tafuta vitabu na miongozo ya mtaala wa REB',
    searchResourcesDesc: 'AI itatafuta maudhui sahihi kutoka kwenye mtaala rasmi na vitabu vya kiada.',
    generateImagesLabel: 'Tengeneza maelezo ya michoro na picha',
    generateImagesDesc: 'Huandaa michoro na mifano ya picha inayofaa kufundishia kwa kila slaidi.',
    teacherPrefTitle: 'Mapendeleo ya Mwalimu',
    teacherPrefSub: 'Boresha muundo na mtindo wa slaidi zako za ufundishaji',
    teacherNotesStyleLabel: 'Mtindo wa Maelezo ya Mwalimu',
    bulletPointStyleLabel: 'Mtindo wa Vituo vya Maneno (Bullet Points)',
    numberOfSlidesLabel: 'Idadi ya Slaidi',
    includeTimingsLabel: 'Weka makadirio ya muda kwa kila slaidi',
    simplifiedModeLabel: 'Mtindo rahisi (bila maneno magumu ya kitaaluma)',
    chooseThemeTitle: 'Chagua Muonekano (Theme)',
    chooseThemeSub: 'Chagua mtindo wa kielimu, kitaalamu au wa ubunifu kwa ajili ya slaidi zako',
    allThemesTab: 'Mandhari Yote',
    educationalTab: '🎓 Elimu & Darasani',
    professionalTab: '💼 Kitaalamu',
    creativeTab: '🎨 Ubunifu',
    themeFilterSubtitle: 'Chuja kulingana na kundi ili kupata muonekano sahihi kwa wanafunzi wako',
    previewSlideBtn: 'Hakiki Slaidi',
    searchThemesPlaceholder: 'Tafuta mandhari...',
    switchThemeTooltip: 'Badili Mandhari',
    generateBtn: 'Tengeneza Slaidi za Kufundishia (AI)',
    generatingBtn: 'AI inaandaa slaidi zako...',
    presentFullscreenBtn: 'Onyesha (Skrini Kamili)',
    pdfBtn: 'Pakua PDF',
    handoutBtn: 'PDF ya Wanafunzi (Handout)',
    pptBtn: 'PPT ya PowerPoint',
    copyBtn: 'Nakili',
    copiedBtn: 'Imenakiliwa!',
    slideOf: 'Slaidi ya #{current} kati ya {total}',
    teacherGuidanceTitle: 'Mwongozo na Maelezo ya Mwalimu (Speaker Notes):',
    prevSlide: 'Slaidi Iliyopita',
    nextSlide: 'Slaidi Inayofuata',
    allSlidesOverview: 'Muhtasari wa Slaidi Zote',
    exitPresent: 'Toka Skrini Kamili',
    presenterNotesToggle: 'Maelezo ya Mwalimu',
    addSlideBtn: '+ Ongeza Slaidi',
    deleteSlideBtn: 'Futa Slaidi',
    editSlideBtn: 'Hariri Slaidi',
    saveChangesBtn: 'Hifadhi',
    cancelBtn: 'Ghairi',
    defaultSubject: 'Sayansi na Teknolojia',
    defaultGrade: 'Darasa la 5 (P5)',
    defaultTopic: 'Mzunguko wa uhai wa mimea na usanisinuru',
    defaultDuration: 'Dakika 40',
    defaultCurriculum: 'Mtaala wa REB CBC',
    defaultCountry: 'Rwanda',
    defaultNotesPlaceholder: 'Weka maelezo ya somo lako hapa...'
  }
};

interface PresentationSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onRequireSubscription?: (warningMsg: string) => void;
}

export type ThemeCategory = 'all' | 'educational' | 'professional' | 'creative';

export type ThemeType = 
  // Educational
  | 'Classic Chalk'
  | 'Notebook Lines'
  | 'Science Park'
  | 'Growing Ideas'
  | 'Gentle Nature'
  | 'Teachy Clean'
  // Professional
  | 'Corporate Executive'
  | 'Dark Mode'
  | 'Midnight Learning'
  | 'Deep Knowledge'
  | 'Modern Minimal'
  // Creative
  | 'Playful Learning'
  | 'Creative Grid'
  | 'Soft Bloom'
  | 'Soft Sky'
  | 'Sunset Warmth';

export type PptxThemeType = 'Modern Minimalist' | 'Professional Academic' | 'Bold Educational';

export interface PptxThemeConfig {
  id: PptxThemeType;
  name: string;
  description: string;
  bg: string;       // hex without #
  primary: string;  // hex without #
  accent: string;   // hex without #
  text: string;     // hex without #
}

export const PPTX_THEMES: Record<PptxThemeType, PptxThemeConfig> = {
  'Modern Minimalist': {
    id: 'Modern Minimalist',
    name: 'Modern Minimalist',
    description: 'Clean off-white backgrounds, slate headers, and a subtle teal accent. Perfect for clean, distracting-free slide decks.',
    bg: 'F8F9FA',
    primary: '1E293B',
    accent: '0F766E',
    text: '334155'
  },
  'Professional Academic': {
    id: 'Professional Academic',
    name: 'Professional Academic',
    description: 'Warm ivory background with classic Oxford blue headings and rich gold highlights. Ideal for formal academic lectures.',
    bg: 'FCFBF7',
    primary: '1B365D',
    accent: 'B38F00',
    text: '2D2D2D'
  },
  'Bold Educational': {
    id: 'Bold Educational',
    name: 'Bold Educational',
    description: 'High-contrast soft sky background, vibrant indigo titles, and bright orange cues. Great for active primary & secondary teaching.',
    bg: 'F0F9FF',
    primary: '1D4ED8',
    accent: 'EA580C',
    text: '1E1B4B'
  }
};

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  category: 'educational' | 'professional' | 'creative';
  categoryLabel: string;
  badge: string;
  description: string;
  bgClass: string;
  cardClass: string;
  textTitleClass: string;
  textSubtitleClass: string;
  bodyTextClass: string;
  accentBorderClass: string;
  tagClass: string;
  bulletDotClass: string;
  previewColors: [string, string, string, string]; // [bg, primary, accent, text]
}

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  // === EDUCATIONAL THEMES ===
  'Classic Chalk': {
    id: 'Classic Chalk',
    name: 'Classic Chalk',
    category: 'educational',
    categoryLabel: 'Educational',
    badge: 'Classroom Favorite',
    description: 'Chalkboard texture with emerald chalk tones, ideal for traditional classroom teaching.',
    bgClass: 'bg-[#182b20]',
    cardClass: 'bg-[#1e382a] border-[#2e5740]',
    textTitleClass: 'text-emerald-200 font-mono font-bold',
    textSubtitleClass: 'text-emerald-400/80 font-mono',
    bodyTextClass: 'text-emerald-100/90 font-mono',
    accentBorderClass: 'border-emerald-500/50',
    tagClass: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',
    bulletDotClass: 'bg-emerald-400',
    previewColors: ['#182b20', '#10b981', '#34d399', '#ecfdf5']
  },
  'Notebook Lines': {
    id: 'Notebook Lines',
    name: 'Notebook Lines',
    category: 'educational',
    categoryLabel: 'Educational',
    badge: 'Lined Notebook',
    description: 'Warm parchment paper aesthetic with vintage serif typography for notes & literacy.',
    bgClass: 'bg-stone-900',
    cardClass: 'bg-stone-950 border-amber-800/40',
    textTitleClass: 'text-amber-200 font-serif font-bold',
    textSubtitleClass: 'text-stone-400 font-serif',
    bodyTextClass: 'text-stone-200 font-serif',
    accentBorderClass: 'border-amber-600/40',
    tagClass: 'bg-amber-950 text-amber-300 border-amber-600/40',
    bulletDotClass: 'bg-amber-500',
    previewColors: ['#1c1917', '#d97706', '#f59e0b', '#fef3c7']
  },
  'Science Park': {
    id: 'Science Park',
    name: 'Science Park',
    category: 'educational',
    categoryLabel: 'Educational',
    badge: 'STEM & Lab',
    description: 'Vibrant lab cyan glow with clean data hierarchy for mathematics, physics & chemistry.',
    bgClass: 'bg-cyan-950',
    cardClass: 'bg-cyan-900/50 border-cyan-800/60',
    textTitleClass: 'text-cyan-300 font-black',
    textSubtitleClass: 'text-cyan-200/80',
    bodyTextClass: 'text-cyan-100',
    accentBorderClass: 'border-cyan-500/50',
    tagClass: 'bg-cyan-900 text-cyan-200 border-cyan-400/40',
    bulletDotClass: 'bg-cyan-400',
    previewColors: ['#082f49', '#06b6d4', '#22d3ee', '#ecfeff']
  },
  'Growing Ideas': {
    id: 'Growing Ideas',
    name: 'Growing Ideas',
    category: 'educational',
    categoryLabel: 'Educational',
    badge: 'Biology & Growth',
    description: 'Botanical deep emerald and fresh lime accents for nature, agriculture and biology.',
    bgClass: 'bg-emerald-950',
    cardClass: 'bg-emerald-900/60 border-emerald-800/60',
    textTitleClass: 'text-emerald-300 font-black',
    textSubtitleClass: 'text-emerald-400/80',
    bodyTextClass: 'text-emerald-100',
    accentBorderClass: 'border-emerald-500/50',
    tagClass: 'bg-emerald-900 text-emerald-200 border-emerald-400/40',
    bulletDotClass: 'bg-lime-400',
    previewColors: ['#064e3b', '#059669', '#84cc16', '#f7fee7']
  },
  'Gentle Nature': {
    id: 'Gentle Nature',
    name: 'Gentle Nature',
    category: 'educational',
    categoryLabel: 'Educational',
    badge: 'Geography & Earth',
    description: 'Soothing sage and forest tones tailored for geography, environment, and social studies.',
    bgClass: 'bg-teal-950',
    cardClass: 'bg-teal-900/50 border-teal-800/60',
    textTitleClass: 'text-teal-200 font-bold',
    textSubtitleClass: 'text-teal-300/70',
    bodyTextClass: 'text-emerald-100',
    accentBorderClass: 'border-teal-500/50',
    tagClass: 'bg-teal-900 text-teal-200 border-teal-400/40',
    bulletDotClass: 'bg-teal-400',
    previewColors: ['#134e4a', '#0d9488', '#2dd4bf', '#ccfbf1']
  },
  'Teachy Clean': {
    id: 'Teachy Clean',
    name: 'Teachy Clean',
    category: 'educational',
    categoryLabel: 'Educational',
    badge: 'Universal Pedagogy',
    description: 'Clean slate navy with maximum contrast and clarity for all grade levels and subjects.',
    bgClass: 'bg-slate-800',
    cardClass: 'bg-slate-900 border-slate-700',
    textTitleClass: 'text-white font-extrabold',
    textSubtitleClass: 'text-slate-300',
    bodyTextClass: 'text-slate-100',
    accentBorderClass: 'border-slate-500/50',
    tagClass: 'bg-slate-800 text-slate-200 border-slate-600',
    bulletDotClass: 'bg-teal-400',
    previewColors: ['#1e293b', '#3b82f6', '#38bdf8', '#ffffff']
  },

  // === PROFESSIONAL THEMES ===
  'Corporate Executive': {
    id: 'Corporate Executive',
    name: 'Corporate Executive',
    category: 'professional',
    categoryLabel: 'Professional',
    badge: 'Executive Presentation',
    description: 'Deep midnight navy with refined warm gold and ice blue accents for leadership and administration.',
    bgClass: 'bg-[#0b132b]',
    cardClass: 'bg-[#1c2541] border-[#3a506b]',
    textTitleClass: 'text-amber-300 font-bold tracking-tight',
    textSubtitleClass: 'text-sky-200/80',
    bodyTextClass: 'text-slate-100',
    accentBorderClass: 'border-amber-400/40',
    tagClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    bulletDotClass: 'bg-amber-400',
    previewColors: ['#0b132b', '#1c2541', '#f59e0b', '#e2e8f0']
  },
  'Dark Mode': {
    id: 'Dark Mode',
    name: 'Dark Mode',
    category: 'professional',
    categoryLabel: 'Professional',
    badge: 'High-Tech Sleek',
    description: 'Obsidian black with luminous teal glow, perfect for computing, ICT, and technical courses.',
    bgClass: 'bg-slate-950',
    cardClass: 'bg-slate-900 border-slate-800',
    textTitleClass: 'text-teal-300 font-black',
    textSubtitleClass: 'text-slate-400',
    bodyTextClass: 'text-slate-200',
    accentBorderClass: 'border-teal-500/50',
    tagClass: 'bg-teal-950 text-teal-300 border-teal-500/40',
    bulletDotClass: 'bg-teal-400',
    previewColors: ['#020617', '#0f172a', '#14b8a6', '#f8fafc']
  },
  'Midnight Learning': {
    id: 'Midnight Learning',
    name: 'Midnight Learning',
    category: 'professional',
    categoryLabel: 'Professional',
    badge: 'Deep Sapphire',
    description: 'Deep sapphire indigo with silver and sky blue typography for secondary & higher education.',
    bgClass: 'bg-slate-900',
    cardClass: 'bg-indigo-950/80 border-indigo-800/50',
    textTitleClass: 'text-indigo-200 font-extrabold',
    textSubtitleClass: 'text-indigo-300/70',
    bodyTextClass: 'text-sky-100',
    accentBorderClass: 'border-indigo-500/50',
    tagClass: 'bg-indigo-900 text-indigo-200 border-indigo-400/40',
    bulletDotClass: 'bg-indigo-400',
    previewColors: ['#0f172a', '#1e1b4b', '#6366f1', '#e0e7ff']
  },
  'Deep Knowledge': {
    id: 'Deep Knowledge',
    name: 'Deep Knowledge',
    category: 'professional',
    categoryLabel: 'Professional',
    badge: 'Scholarly Amethyst',
    description: 'Regal amethyst and deep purple slate for literature, humanities, and research topics.',
    bgClass: 'bg-purple-950',
    cardClass: 'bg-purple-900/50 border-purple-800/60',
    textTitleClass: 'text-purple-200 font-black',
    textSubtitleClass: 'text-purple-300/80',
    bodyTextClass: 'text-purple-100',
    accentBorderClass: 'border-purple-500/50',
    tagClass: 'bg-purple-900 text-purple-200 border-purple-400/40',
    bulletDotClass: 'bg-purple-400',
    previewColors: ['#3b0764', '#581c87', '#a855f7', '#f3e8ff']
  },
  'Modern Minimal': {
    id: 'Modern Minimal',
    name: 'Modern Minimal',
    category: 'professional',
    categoryLabel: 'Professional',
    badge: 'Swiss Clean',
    description: 'Precision monochrome platinum and charcoal layout with crisp, uncluttered Swiss typography.',
    bgClass: 'bg-neutral-950',
    cardClass: 'bg-neutral-900 border-neutral-800',
    textTitleClass: 'text-white font-black tracking-tight',
    textSubtitleClass: 'text-neutral-400 font-medium',
    bodyTextClass: 'text-neutral-200',
    accentBorderClass: 'border-neutral-600',
    tagClass: 'bg-neutral-800 text-neutral-200 border-neutral-700',
    bulletDotClass: 'bg-neutral-200',
    previewColors: ['#0a0a0a', '#262626', '#737373', '#ffffff']
  },

  // === CREATIVE THEMES ===
  'Playful Learning': {
    id: 'Playful Learning',
    name: 'Playful Learning',
    category: 'creative',
    categoryLabel: 'Creative',
    badge: 'Primary & Fun',
    description: 'Warm honey and amber tones with vibrant badges for primary school, gamified lessons & storytelling.',
    bgClass: 'bg-amber-950',
    cardClass: 'bg-amber-900/50 border-amber-800/60',
    textTitleClass: 'text-amber-300 font-black',
    textSubtitleClass: 'text-amber-200/80',
    bodyTextClass: 'text-amber-100',
    accentBorderClass: 'border-amber-500/50',
    tagClass: 'bg-amber-900 text-amber-200 border-amber-400/40',
    bulletDotClass: 'bg-amber-400',
    previewColors: ['#451a03', '#78350f', '#f59e0b', '#fffbeb']
  },
  'Creative Grid': {
    id: 'Creative Grid',
    name: 'Creative Grid',
    category: 'creative',
    categoryLabel: 'Creative',
    badge: 'Blueprint & Design',
    description: 'Geometric architectural blueprint style with cyber cyan lines for design, art & technical drawing.',
    bgClass: 'bg-slate-900',
    cardClass: 'bg-slate-950 border-cyan-500/30',
    textTitleClass: 'text-cyan-400 font-black uppercase tracking-wider',
    textSubtitleClass: 'text-slate-400',
    bodyTextClass: 'text-slate-200',
    accentBorderClass: 'border-cyan-400/50',
    tagClass: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    bulletDotClass: 'bg-cyan-400',
    previewColors: ['#0f172a', '#0284c7', '#38bdf8', '#e0f2fe']
  },
  'Soft Bloom': {
    id: 'Soft Bloom',
    name: 'Soft Bloom',
    category: 'creative',
    categoryLabel: 'Creative',
    badge: 'Botanical Rose',
    description: 'Gentle terracotta and blush rose botanical elegance for arts, music, literature & storytelling.',
    bgClass: 'bg-rose-950',
    cardClass: 'bg-rose-900/50 border-rose-800/60',
    textTitleClass: 'text-rose-200 font-bold',
    textSubtitleClass: 'text-rose-300/80',
    bodyTextClass: 'text-rose-100',
    accentBorderClass: 'border-rose-500/50',
    tagClass: 'bg-rose-900 text-rose-200 border-rose-400/40',
    bulletDotClass: 'bg-rose-400',
    previewColors: ['#4c0519', '#881337', '#fb7185', '#ffe4e6']
  },
  'Soft Sky': {
    id: 'Soft Sky',
    name: 'Soft Sky',
    category: 'creative',
    categoryLabel: 'Creative',
    badge: 'Workshop & Cloud',
    description: 'Dreamy cerulean and cloud azure with spacious, calming flow for collaborative workshops.',
    bgClass: 'bg-sky-900',
    cardClass: 'bg-sky-950/80 border-sky-800/60',
    textTitleClass: 'text-sky-200 font-bold',
    textSubtitleClass: 'text-sky-300/80',
    bodyTextClass: 'text-slate-100',
    accentBorderClass: 'border-sky-400/50',
    tagClass: 'bg-sky-900 text-sky-200 border-sky-400/40',
    bulletDotClass: 'bg-sky-400',
    previewColors: ['#0c4a6e', '#0284c7', '#38bdf8', '#f0f9ff']
  },
  'Sunset Warmth': {
    id: 'Sunset Warmth',
    name: 'Sunset Warmth',
    category: 'creative',
    categoryLabel: 'Creative',
    badge: 'African Sunset',
    description: 'Rich ochre and terracotta sunset hues celebrating Rwandan cultural heritage and storytelling.',
    bgClass: 'bg-[#2b110a]',
    cardClass: 'bg-[#3d1a10] border-amber-700/50',
    textTitleClass: 'text-amber-300 font-extrabold tracking-tight',
    textSubtitleClass: 'text-orange-200/80',
    bodyTextClass: 'text-orange-100',
    accentBorderClass: 'border-orange-500/50',
    tagClass: 'bg-[#522115] text-amber-200 border-amber-600/40',
    bulletDotClass: 'bg-orange-400',
    previewColors: ['#2b110a', '#c2410c', '#f59e0b', '#fff7ed']
  }
};

export const PresentationSlidesModal: React.FC<PresentationSlidesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRequireSubscription
}) => {
  // Selected Language Context State
  const [selectedLanguage, setSelectedLanguage] = useState<SlideLanguage>('English');
  const t = SLIDES_UI_TRANSLATIONS[selectedLanguage] || SLIDES_UI_TRANSLATIONS['English'];

  // Form State
  const [subject, setSubject] = useState('Biology');
  const [grade, setGrade] = useState('5th grade');
  const [topic, setTopic] = useState('Plant life cycle');
  const [duration, setDuration] = useState('40 minutes');
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('Rwanda');
  const [curriculum, setCurriculum] = useState('Rwanda REB');
  const [additionalDetails, setAdditionalDetails] = useState('');
  
  // Notes
  const [notes, setNotes] = useState('');

  // Enhancement options
  const [searchResources, setSearchResources] = useState(false);
  const [generateImages, setGenerateImages] = useState(true);

  // Teacher preferences
  const [teacherNotesStyle, setTeacherNotesStyle] = useState('Detailed (100+ words per slide)');
  const [bulletPointStyle, setBulletPointStyle] = useState('Concise (5-10 words each)');
  const [numberOfSlides, setNumberOfSlides] = useState('Auto (based on duration)');
  const [customSlidesCount, setCustomSlidesCount] = useState('15');
  const [includeTimings, setIncludeTimings] = useState(true);
  const [simplifiedMode, setSimplifiedMode] = useState(false);

  // Theme selection
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('Classic Chalk');
  const [themeCategory, setThemeCategory] = useState<ThemeCategory>('all');
  const [themeSearch, setThemeSearch] = useState('');

  // Handle language switch
  const handleLanguageChange = (newLang: SlideLanguage) => {
    setSelectedLanguage(newLang);
    const trans = SLIDES_UI_TRANSLATIONS[newLang];
    if (trans) {
      setLanguage(newLang);
      setSubject(trans.defaultSubject);
      setGrade(trans.defaultGrade);
      setTopic(trans.defaultTopic);
      setDuration(trans.defaultDuration);
      setCurriculum(trans.defaultCurriculum);
      setCountry(trans.defaultCountry);
    }
  };

  // Generation & Deck state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedDeck, setGeneratedDeck] = useState<PresentationSlideDeck | null>(null);
  
  // Viewer Mode state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);
  const [showHandoutMenu, setShowHandoutMenu] = useState(false);
  const [pptxTheme, setPptxTheme] = useState<PptxThemeType>('Modern Minimalist');
  const [showPptxThemeMenu, setShowPptxThemeMenu] = useState(false);

  // Saved Decks Modal
  const [savedDecks, setSavedDecks] = useState<PresentationSlideDeck[]>([]);
  const [showSavedDecksModal, setShowSavedDecksModal] = useState(false);
  const [isSyncingDecks, setIsSyncingDecks] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Slide Editing & Management State
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubtitle, setEditedSubtitle] = useState("");
  const [editedBulletText, setEditedBulletText] = useState("");
  const [editedTeacherNote, setEditedTeacherNote] = useState("");
  const [editedTiming, setEditedTiming] = useState("");

  // Remaining limit check
  const remainingPlans = currentUser?.remainingPlans ?? 10;
  const isLimitReached = !currentUser?.isAdmin && remainingPlans <= 0;

  // Sync / load saved slide decks
  useEffect(() => {
    if (isOpen) {
      loadSavedDecks();
    }
  }, [isOpen]);

  // Reset editing mode when active slide changes
  useEffect(() => {
    setIsEditingSlide(false);
  }, [activeSlideIndex]);

  // Keyboard navigation during presentation mode
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode || !generatedDeck) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setActiveSlideIndex(prev => Math.min(generatedDeck.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPresentationMode, generatedDeck]);

  const loadSavedDecks = async () => {
    setIsSyncingDecks(true);
    try {
      const decks = await loadSlideDecksFromFirestore();
      setSavedDecks(decks);
    } catch (err) {
      console.warn("Error loading saved decks:", err);
    } finally {
      setIsSyncingDecks(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg("Please enter a Topic name for your presentation.");
      return;
    }

    const creditCheck = checkCanUseAiCredit('presentation_slides');
    if (!creditCheck.canGenerate) {
      if (onRequireSubscription) {
        onRequireSubscription(creditCheck.message || "You have reached your presentation credit limit for this month. Upgrade your plan to create more presentations.");
      } else {
        setErrorMsg(creditCheck.message || "You have reached your presentation credit limit for this month.");
      }
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const userEmail = currentUser?.email || 'nkundimana123theogene@gmail.com';
    const cleanLanguage = language.replace(/\s*\(.*\)/, '').trim();

    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'presentation-slides',
          email: userEmail,
          params: {
            subject,
            grade,
            topic,
            duration,
            language: cleanLanguage,
            country,
            curriculum,
            additionalDetails,
            notes,
            searchResources,
            generateImages,
            teacherNotesStyle,
            bulletPointStyle,
            numberOfSlides: numberOfSlides === 'Custom' ? `${customSlidesCount} slides` : numberOfSlides,
            includeTimings,
            simplifiedMode,
            theme: selectedTheme
          }
        })
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        if (resp.status === 403 && onRequireSubscription) {
          onRequireSubscription(data.error || "Presentation limit reached.");
          setIsGenerating(false);
          return;
        }
        throw new Error(data.error || "Failed to generate presentation slides.");
      }

      const result = data.result;
      
      // Formulate deck object
      const deck: PresentationSlideDeck = {
        id: result.id || `deck_${Math.random().toString(36).substring(2, 9)}`,
        title: result.title || topic,
        subtitle: `${grade} • ${subject}`,
        subject,
        grade,
        topic,
        duration,
        language: cleanLanguage,
        country,
        curriculum,
        theme: selectedTheme,
        totalSlides: Array.isArray(result.slides) ? result.slides.length : 5,
        slides: Array.isArray(result.slides) ? result.slides.map((s: any, idx: number) => ({
          slideNumber: s.slideNumber || idx + 1,
          title: s.title || `Slide ${idx + 1}`,
          subtitle: s.subtitle || '',
          bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [s.content || 'Key concept breakdown'],
          timing: s.timing || `${Math.max(3, Math.floor(40 / (result.slides?.length || 5)))} mins`,
          teacherNote: s.teacherNote || s.note || 'Teacher Note: Guide students through discussion points.',
          imagePrompt: s.imagePrompt || `Visual diagram of ${topic}`
        })) : [
          {
            slideNumber: 1,
            title: `Introduction to ${topic}`,
            subtitle: `Overview & Competence Goals`,
            bulletPoints: [
              `Understanding key concepts in ${subject} for ${grade}.`,
              `Core principles, definitions, and real-world applications in ${country}.`,
              `Competence objectives aligned with ${curriculum} standards.`
            ],
            timing: '5 mins',
            teacherNote: 'Teacher Note: Hook students with real-world questions before presenting core concepts.',
            imagePrompt: `Diagram illustrating ${topic}`
          }
        ],
        createdAt: new Date().toISOString()
      };

      setGeneratedDeck(deck);
      setActiveSlideIndex(0);

      // Deduct credit only on successful generation
      deductAiCredit('presentation_slides', deck.title);

      // Save to Cloud & Local Storage
      await saveSlideDeckToFirestore(deck);
      await loadSavedDecks();

    } catch (err: any) {
      console.error("Presentation slides generation error:", err);
      setErrorMsg(err.message || "An error occurred while creating presentation slides.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to update deck state & persist to cloud and local storage
  const updateDeckInStorage = async (updatedDeck: PresentationSlideDeck) => {
    setGeneratedDeck(updatedDeck);
    try {
      await saveSlideDeckToFirestore(updatedDeck);
      await loadSavedDecks();
    } catch (err) {
      console.error("Failed to update slide deck:", err);
    }
  };

  // Start editing the active slide
  const startEditingSlide = () => {
    if (!generatedDeck) return;
    const currentSlide = generatedDeck.slides[activeSlideIndex];
    if (!currentSlide) return;
    setEditedTitle(currentSlide.title);
    setEditedSubtitle(currentSlide.subtitle || "");
    setEditedBulletText(currentSlide.bulletPoints.join("\n"));
    setEditedTeacherNote(currentSlide.teacherNote || "");
    setEditedTiming(currentSlide.timing || "5 mins");
    setIsEditingSlide(true);
  };

  // Save the slide edits back to the deck
  const saveSlideChanges = async () => {
    if (!generatedDeck) return;
    const updatedSlides = [...generatedDeck.slides];
    const currentSlide = updatedSlides[activeSlideIndex];
    if (!currentSlide) return;

    updatedSlides[activeSlideIndex] = {
      ...currentSlide,
      title: editedTitle,
      subtitle: editedSubtitle || undefined,
      bulletPoints: editedBulletText.split("\n").map(b => b.trim()).filter(b => b.length > 0),
      teacherNote: editedTeacherNote || undefined,
      timing: editedTiming || "5 mins"
    };

    const updatedDeck: PresentationSlideDeck = {
      ...generatedDeck,
      slides: updatedSlides,
      totalSlides: updatedSlides.length
    };

    await updateDeckInStorage(updatedDeck);
    setIsEditingSlide(false);
  };

  // Add a new slide after the current one
  const handleAddSlide = async () => {
    if (!generatedDeck) return;

    const newSlide = {
      slideNumber: generatedDeck.slides.length + 1,
      title: "New Slide",
      subtitle: "Slide Subtitle",
      bulletPoints: ["First key takeaway", "Second key point"],
      timing: "5 mins",
      teacherNote: "Teacher speaker notes here..."
    };

    const updatedSlides = [...generatedDeck.slides];
    const insertIndex = activeSlideIndex + 1;
    updatedSlides.splice(insertIndex, 0, newSlide);

    // Re-index all slide numbers
    const reindexedSlides = updatedSlides.map((slide, idx) => ({
      ...slide,
      slideNumber: idx + 1
    }));

    const updatedDeck: PresentationSlideDeck = {
      ...generatedDeck,
      slides: reindexedSlides,
      totalSlides: reindexedSlides.length
    };

    await updateDeckInStorage(updatedDeck);
    setActiveSlideIndex(insertIndex);

    // Auto start editing the newly added slide
    setEditedTitle(newSlide.title);
    setEditedSubtitle(newSlide.subtitle);
    setEditedBulletText(newSlide.bulletPoints.join("\n"));
    setEditedTeacherNote(newSlide.teacherNote);
    setEditedTiming(newSlide.timing);
    setIsEditingSlide(true);
  };

  // Delete the current slide
  const handleDeleteSlide = async () => {
    if (!generatedDeck) return;
    if (generatedDeck.slides.length <= 1) {
      alert("A presentation must have at least one slide.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this slide?");
    if (!confirmed) return;

    const updatedSlides = generatedDeck.slides.filter((_, idx) => idx !== activeSlideIndex);

    // Re-index all slide numbers
    const reindexedSlides = updatedSlides.map((slide, idx) => ({
      ...slide,
      slideNumber: idx + 1
    }));

    const updatedDeck: PresentationSlideDeck = {
      ...generatedDeck,
      slides: reindexedSlides,
      totalSlides: reindexedSlides.length
    };

    await updateDeckInStorage(updatedDeck);
    setActiveSlideIndex(prev => Math.max(0, prev - 1));
    setIsEditingSlide(false);
  };

  // Export to PDF using jsPDF
  const handleExportPdf = () => {
    if (!generatedDeck) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [297, 210] // A4 Landscape
    });

    generatedDeck.slides.forEach((slide, idx) => {
      if (idx > 0) doc.addPage();

      // Dark background fill
      doc.setFillColor(20, 30, 45);
      doc.rect(0, 0, 297, 210, 'F');

      // Decorative top border
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 297, 8, 'F');

      // Slide Header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(slide.title, 20, 28);

      if (slide.subtitle) {
        doc.setTextColor(150, 200, 220);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'normal');
        doc.text(slide.subtitle, 20, 37);
      }

      // Timing tag
      if (slide.timing) {
        doc.setFillColor(30, 50, 75);
        doc.roundedRect(230, 18, 45, 12, 3, 3, 'F');
        doc.setTextColor(52, 211, 153);
        doc.setFontSize(10);
        doc.text(`Timing: ${slide.timing}`, 235, 26);
      }

      // Divider line
      doc.setDrawColor(50, 70, 95);
      doc.setLineWidth(0.5);
      doc.line(20, 43, 277, 43);

      // Bullet points
      let startY = 58;
      doc.setFontSize(14);
      doc.setTextColor(230, 240, 255);

      slide.bulletPoints.forEach((pt) => {
        // Bullet symbol
        doc.setFillColor(16, 185, 129);
        doc.circle(23, startY - 2, 1.5, 'F');

        // Multi-line text wrapping
        const lines = doc.splitTextToSize(pt, 240);
        doc.text(lines, 30, startY);
        startY += (lines.length * 9) + 6;
      });

      // Teacher Note box at bottom
      if (slide.teacherNote) {
        doc.setFillColor(15, 23, 42);
        doc.setDrawColor(245, 158, 11);
        doc.roundedRect(20, 155, 257, 35, 4, 4, 'FD');

        doc.setTextColor(245, 158, 11);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TEACHER NOTES & GUIDANCE:', 26, 164);

        doc.setTextColor(220, 225, 235);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const noteLines = doc.splitTextToSize(slide.teacherNote, 245);
        doc.text(noteLines, 26, 172);
      }

      // Footer
      doc.setTextColor(100, 120, 145);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${generatedDeck.title} • ${generatedDeck.subject} (${generatedDeck.grade})`, 20, 202);
      doc.text(`Slide ${slide.slideNumber} of ${generatedDeck.slides.length}`, 245, 202);
    });

    doc.save(`${generatedDeck.title.replace(/\s+/g, '_')}_Presentation_Slides.pdf`);
  };

  // Export Handout PDF (3 Slides per page + lined note space OR 6 Slides Grid)
  const handleExportHandoutPdf = (mode: '3-slides-notes' | '6-slides-grid' = '3-slides-notes') => {
    if (!generatedDeck) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4' // 210mm x 297mm
    });

    const totalSlides = generatedDeck.slides.length;

    if (mode === '3-slides-notes') {
      const slidesPerPage = 3;
      const totalPages = Math.ceil(totalSlides / slidesPerPage);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage();

        // Top Header Banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 24, 'F');

        doc.setFillColor(16, 185, 129); // emerald accent
        doc.rect(0, 24, 210, 1.5, 'F');

        // Deck Title & Subtitle
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(generatedDeck.title, 14, 11);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${generatedDeck.subject} • ${generatedDeck.grade} | Student Handout & Notes`, 14, 18);

        // Name & Date Field
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(203, 213, 225);
        doc.text(`Name: _______________________  Date: ____________`, 112, 14);

        // 3 Slide Rows
        const startIndex = page * slidesPerPage;
        const pageSlides = generatedDeck.slides.slice(startIndex, startIndex + slidesPerPage);

        pageSlides.forEach((slide, idx) => {
          const rowY = 32 + (idx * 81); // Y positions: 32, 113, 194

          // --- LEFT BOX: SLIDE CARD ---
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.4);
          doc.roundedRect(14, rowY, 88, 73, 3, 3, 'FD');

          // Header Bar of Slide Card
          doc.setFillColor(30, 41, 59);
          doc.roundedRect(14, rowY, 88, 11, 3, 3, 'F');
          doc.rect(14, rowY + 7, 88, 4, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          const titleText = `Slide ${slide.slideNumber}: ${slide.title}`;
          doc.text(titleText.length > 32 ? titleText.substring(0, 30) + '...' : titleText, 18, rowY + 7.5);

          // Subtitle if available
          let bulletY = rowY + 17;
          if (slide.subtitle) {
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139);
            doc.text(slide.subtitle.length > 40 ? slide.subtitle.substring(0, 38) + '...' : slide.subtitle, 18, bulletY);
            bulletY += 5;
          }

          // Bullet points inside Slide Card
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);

          slide.bulletPoints.slice(0, 4).forEach((pt) => {
            if (bulletY < rowY + 70) {
              doc.setFillColor(16, 185, 129);
              doc.circle(18, bulletY - 1, 0.7, 'F');

              const lines = doc.splitTextToSize(pt, 76);
              lines.slice(0, 2).forEach((line: string) => {
                if (bulletY < rowY + 70) {
                  doc.text(line, 21, bulletY);
                  bulletY += 4.2;
                }
              });
              bulletY += 1;
            }
          });

          // --- RIGHT BOX: LINED NOTE-TAKING AREA ---
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(108, rowY, 88, 73, 3, 3, 'FD');

          // "NOTES" Header
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text('NOTES / MEMO:', 113, rowY + 8);

          // Horizontal Ruling Lines
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          for (let lineIdx = 0; lineIdx < 7; lineIdx++) {
            const lineY = rowY + 16 + (lineIdx * 8);
            doc.line(113, lineY, 191, lineY);
          }
        });

        // Page Footer
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 282, 196, 282);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${generatedDeck.title} • Student Handout`, 14, 288);
        doc.text(`Page ${page + 1} of ${totalPages}`, 172, 288);
      }
    } else {
      // 6-slides-grid mode
      const slidesPerPage = 6;
      const totalPages = Math.ceil(totalSlides / slidesPerPage);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage();

        // Top Header Banner
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 24, 'F');

        doc.setFillColor(16, 185, 129);
        doc.rect(0, 24, 210, 1.5, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(generatedDeck.title, 14, 11);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${generatedDeck.subject} • ${generatedDeck.grade} | 6-Slide Grid Handout`, 14, 18);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(203, 213, 225);
        doc.text(`Name: _______________________  Date: ____________`, 112, 14);

        // 2 cols x 3 rows grid
        const startIndex = page * slidesPerPage;
        const pageSlides = generatedDeck.slides.slice(startIndex, startIndex + slidesPerPage);

        pageSlides.forEach((slide, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);

          const posX = 14 + (col * 93);
          const posY = 32 + (row * 81);

          // Card Box
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.4);
          doc.roundedRect(posX, posY, 88, 73, 3, 3, 'FD');

          // Card Header Bar
          doc.setFillColor(30, 41, 59);
          doc.roundedRect(posX, posY, 88, 11, 3, 3, 'F');
          doc.rect(posX, posY + 7, 88, 4, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          const titleText = `Slide ${slide.slideNumber}: ${slide.title}`;
          doc.text(titleText.length > 32 ? titleText.substring(0, 30) + '...' : titleText, posX + 4, posY + 7.5);

          // Bullet points
          let bulletY = posY + 17;
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);

          slide.bulletPoints.forEach((pt) => {
            if (bulletY < posY + 70) {
              doc.setFillColor(16, 185, 129);
              doc.circle(posX + 4, bulletY - 1, 0.7, 'F');

              const lines = doc.splitTextToSize(pt, 78);
              lines.forEach((line: string) => {
                if (bulletY < posY + 70) {
                  doc.text(line, posX + 7, bulletY);
                  bulletY += 4.2;
                }
              });
              bulletY += 1;
            }
          });
        });

        // Page Footer
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 282, 196, 282);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${generatedDeck.title} • Grid Handout`, 14, 288);
        doc.text(`Page ${page + 1} of ${totalPages}`, 172, 288);
      }
    }

    setShowHandoutMenu(false);
    const filename = `${generatedDeck.title.replace(/\s+/g, '_')}_Handout_${mode}.pdf`;
    doc.save(filename);
  };

  // Export to native Microsoft PowerPoint (.pptx) format using pptxgenjs
  const handleExportPptx = () => {
    if (!generatedDeck) return;

    try {
      const pptx = new pptxgen();
      
      // Set aspect ratio to widescreen (16:9)
      pptx.layout = 'LAYOUT_16x9';

      // Set standard PowerPoint document properties for guaranteed compatibility and seamless opening without security prompts
      pptx.title = generatedDeck.title || 'Lesson Presentation';
      pptx.author = 'Nkorera Education AI Assistant';
      pptx.subject = generatedDeck.topic || 'Education Lesson';
      pptx.company = 'Nkorera Education';

      const selectedPptxThemeConfig = PPTX_THEMES[pptxTheme] || PPTX_THEMES['Modern Minimalist'];
      const cleanBg = selectedPptxThemeConfig.bg;
      const cleanPrimary = selectedPptxThemeConfig.primary;
      const cleanAccent = selectedPptxThemeConfig.accent;
      const cleanText = selectedPptxThemeConfig.text;

      // Create slides
      generatedDeck.slides.forEach((slide, idx) => {
        const pptxSlide = pptx.addSlide();
        
        // Background Color
        pptxSlide.background = { fill: cleanBg };

        const isTitleSlide = idx === 0;

        if (isTitleSlide) {
          // Centered cover slide layout for PowerPoint
          // Full top bar decoration
          pptxSlide.addShape('rect', {
            x: 0,
            y: 0,
            w: 13.33,
            h: 0.3,
            fill: { color: cleanAccent }
          });

          // Secondary lower accent bar
          pptxSlide.addShape('rect', {
            x: 4.66,
            y: 2.1,
            w: 4.0,
            h: 0.05,
            fill: { color: cleanAccent }
          });

          // Subject & Grade Header
          pptxSlide.addText(`${generatedDeck.subject} • Grade ${generatedDeck.grade}`, {
            x: 1.0,
            y: 1.5,
            w: 11.33,
            h: 0.5,
            fontSize: 16,
            color: cleanAccent,
            bold: true,
            fontFace: 'Arial',
            align: 'center'
          });

          // Main Presentation Title
          pptxSlide.addText(generatedDeck.title, {
            x: 1.0,
            y: 2.4,
            w: 11.33,
            h: 1.6,
            fontSize: 42,
            color: cleanPrimary,
            bold: true,
            fontFace: 'Arial',
            align: 'center'
          });

          // Subtitle / Topic
          if (slide.subtitle || generatedDeck.topic) {
            pptxSlide.addText(slide.subtitle || generatedDeck.topic, {
              x: 1.0,
              y: 4.0,
              w: 11.33,
              h: 0.6,
              fontSize: 18,
              color: cleanText,
              italic: true,
              fontFace: 'Arial',
              align: 'center'
            });
          }

          // Horizontal list of initial bullet points at bottom as introductory goals
          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            const shortGoals = slide.bulletPoints.slice(0, 3).join('   |   ');
            pptxSlide.addText(shortGoals, {
              x: 1.0,
              y: 4.8,
              w: 11.33,
              h: 0.5,
              fontSize: 12,
              color: cleanAccent,
              align: 'center',
              fontFace: 'Arial',
              bold: true
            });
          }
        } else {
          // Professional intermediate slide layout
          // Top Badge / Header info (Subject & Grade)
          pptxSlide.addText(`${generatedDeck.subject} • Grade ${generatedDeck.grade}`, {
            x: 0.6,
            y: 0.4,
            w: 11.0,
            h: 0.35,
            fontSize: 12,
            color: cleanAccent,
            bold: true,
            fontFace: 'Arial'
          });

          // Slide Title
          pptxSlide.addText(slide.title, {
            x: 0.6,
            y: 0.75,
            w: 11.0,
            h: 0.8,
            fontSize: 28,
            color: cleanPrimary,
            bold: true,
            fontFace: 'Arial'
          });

          // Underline accent divider
          pptxSlide.addShape('rect', {
            x: 0.6,
            y: 1.45,
            w: 11.5,
            h: 0.04,
            fill: { color: cleanAccent }
          });

          // Subtitle (if any)
          let bulletY = 1.65;
          if (slide.subtitle) {
            pptxSlide.addText(slide.subtitle, {
              x: 0.6,
              y: 1.6,
              w: 11.0,
              h: 0.35,
              fontSize: 14,
              color: cleanText,
              italic: true,
              fontFace: 'Arial'
            });
            bulletY = 2.05;
          }

          // Bullet Points Content block
          const bulletsList = slide.bulletPoints.map(pt => {
            return {
              text: pt,
              options: {
                bullet: true,
                fontSize: 14,
                color: cleanText,
                fontFace: 'Arial'
              }
            };
          });

          if (bulletsList.length > 0) {
            pptxSlide.addText(bulletsList, {
              x: 0.6,
              y: bulletY,
              w: 11.5,
              h: 3.0,
              valign: 'top',
              lineSpacing: 24
            });
          }
        }

        // Timing indicator in bottom right
        pptxSlide.addText(`⏱️ ${slide.timing || '5 mins'}`, {
          x: 10.5,
          y: 5.15,
          w: 2.0,
          h: 0.3,
          fontSize: 11,
          color: cleanAccent,
          align: 'right',
          fontFace: 'Arial',
          bold: true
        });

        // Slide counter in bottom left
        pptxSlide.addText(`Slide ${slide.slideNumber || (idx + 1)}`, {
          x: 0.6,
          y: 5.15,
          w: 2.0,
          h: 0.3,
          fontSize: 11,
          color: cleanAccent,
          align: 'left',
          fontFace: 'Arial'
        });

        // Speaker notes
        if (slide.teacherNote) {
          pptxSlide.addNotes(slide.teacherNote);
        }
      });

      // Save PowerPoint Presentation via specialized Blob utility
      const safeTitle = generatedDeck.title
        .replace(/[^a-zA-Z0-9_\u00C0-\u017F\s-]/g, '')
        .replace(/\s+/g, '_');
      const filename = `${safeTitle || 'Lesson'}_Presentation.pptx`;
      
      // We use pptx.write with outputType: 'blob' to correctly map to a Blob as requested.
      pptx.write({ outputType: 'blob' })
        .then((blobData: any) => {
          const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          console.log('PowerPoint presentation (.pptx) downloaded successfully via Blob mapping.');
        })
        .catch(err => {
          console.error('Blob export failed, falling back to writeFile:', err);
          pptx.writeFile({ fileName: filename })
            .then(() => {
              console.log('PowerPoint presentation (.pptx) downloaded successfully via writeFile fallback.');
            })
            .catch(err2 => {
              console.error('Failed to download presentation via writeFile:', err2);
            });
        });

    } catch (error) {
      console.error('Error generating pptx:', error);
      
      // Fallback: If pptxgen fails, export HTML as PPT (old method but keep it safe)
      let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint'>
        <head>
          <meta charset='utf-8'>
          <title>${generatedDeck.title}</title>
          <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: #ffffff; padding: 40px; }
            .slide { page-break-after: always; border: 2px solid #06b6d4; border-radius: 16px; padding: 30px; margin-bottom: 40px; background: #1e293b; }
            h1 { color: #38bdf8; font-size: 28px; margin-bottom: 5px; }
            h3 { color: #94a3b8; font-size: 18px; margin-top: 0; }
            ul { font-size: 20px; line-height: 1.8; color: #f1f5f9; }
            .notes { background: #334155; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 30px; font-style: italic; font-size: 14px; color: #fbbf24; }
          </style>
        </head>
        <body>
      `;

      generatedDeck.slides.forEach(slide => {
        htmlContent += `
          <div class="slide">
            <h1>${slide.title}</h1>
            ${slide.subtitle ? `<h3>${slide.subtitle}</h3>` : ''}
            <hr style="border-color: #334155; margin: 20px 0;"/>
            <ul>
              ${slide.bulletPoints.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
            ${slide.teacherNote ? `<div class="notes"><strong>Teacher Note:</strong> ${slide.teacherNote}</div>` : ''}
          </div>
        `;
      });

      htmlContent += `</body></html>`;

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDeck.title.replace(/\s+/g, '_')}_Slides.ppt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Copy slide contents
  const handleCopySlides = () => {
    if (!generatedDeck) return;
    let text = `=== ${generatedDeck.title.toUpperCase()} ===\n${generatedDeck.subject} • ${generatedDeck.grade}\n\n`;

    generatedDeck.slides.forEach(slide => {
      text += `SLIDE ${slide.slideNumber}: ${slide.title}\n`;
      if (slide.subtitle) text += `(${slide.subtitle})\n`;
      slide.bulletPoints.forEach(pt => text += `• ${pt}\n`);
      if (slide.teacherNote) text += `Teacher Note: ${slide.teacherNote}\n`;
      text += `\n-----------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (generatedDeck) {
                  setGeneratedDeck(null);
                } else {
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-bold border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backBtn}</span>
            </button>

            <div className="p-2.5 bg-teal-500/20 border border-teal-500/40 rounded-2xl">
              <Presentation className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>{t.modalTitle}</span>
                <span className="bg-teal-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                  {t.modalBadge}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedDecksModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <FolderHeart className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">{t.savedDecksBtn} ({savedDecks.length})</span>
            </button>

            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT AREA */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-slate-950">

          {/* TOP MULTILINGUAL CONTEXT SWITCHER BAR */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 p-3.5 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xs block">{t.langTitle}</span>
                <span className="text-[10px] text-slate-400">Switching language automatically localizes all fields & generated presentation</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {(['English', 'Kinyarwanda', 'Français', 'Kiswahili'] as SlideLanguage[]).map(langKey => {
                const isSelected = selectedLanguage === langKey;
                const flags: Record<SlideLanguage, string> = {
                  English: '🇬🇧 EN',
                  Kinyarwanda: '🇷🇼 RW',
                  Français: '🇫🇷 FR',
                  Kiswahili: '🇹🇿 SW'
                };

                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => handleLanguageChange(langKey)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/40 scale-105'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800'
                    }`}
                  >
                    <span>{flags[langKey]}</span>
                    <span>{langKey}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIMIT REACHED BANNER IF APPLICABLE */}
          {isLimitReached && (
            <div className="bg-rose-950/60 border border-rose-500/50 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-rose-200 text-xs sm:text-sm">Presentation Limit Reached</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  You have used all 3 presentations for this month.{' '}
                  <button 
                    type="button" 
                    onClick={() => {
                      if (onRequireSubscription) onRequireSubscription("Upgrade plan to create more presentation slides.");
                    }}
                    className="underline text-rose-300 font-bold hover:text-white cursor-pointer"
                  >
                    Upgrade your plan
                  </button>{' '}
                  to create more presentations.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-500 p-4 rounded-2xl text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MAIN FORM WHEN NO DECK IS GENERATED YET */}
          {!generatedDeck && (
            <div className="space-y-6">

              {/* SECTION 1: LESSON DETAILS */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{t.lessonDetailsTitle}</h3>
                    <p className="text-[11px] text-slate-400">{t.lessonDetailsSub}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.subjectLabel}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g., Biology, Mathematics, English"
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.gradeLabel}</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      placeholder="e.g., 5th grade, Senior 3"
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.topicLabel}</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g., Plant life cycle, Water's big journey, Introduction to Algebra"
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.durationLabel}</label>
                    <select
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="40 minutes">40 minutes (40 min)</option>
                      <option value="60 minutes">60 minutes (1h)</option>
                      <option value="80 minutes">80 minutes (Double period)</option>
                      <option value="120 minutes">120 minutes (2h Workshop)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.languageLabel}</label>
                    <select
                      value={language}
                      onChange={e => {
                        const val = e.target.value;
                        setLanguage(val);
                        if (val === 'English' || val === 'Kinyarwanda' || val === 'Français' || val === 'Kiswahili') {
                          handleLanguageChange(val as SlideLanguage);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors font-bold text-teal-400"
                    >
                      <option value="English">🇬🇧 English</option>
                      <option value="Kinyarwanda">🇷🇼 Ikinyarwanda</option>
                      <option value="Français">🇫🇷 Français</option>
                      <option value="Kiswahili">🇹🇿 Kiswahili</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.countryLabel}</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="e.g., Rwanda, Kenya, Nigeria, USA..."
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.curriculumLabel}</label>
                    <input
                      type="text"
                      value={curriculum}
                      onChange={e => setCurriculum(e.target.value)}
                      placeholder="e.g., Rwanda REB CBC, Cambridge, WAEC, IB..."
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.additionalDetailsLabel}</label>
                    <textarea
                      value={additionalDetails}
                      onChange={e => setAdditionalDetails(e.target.value)}
                      placeholder={t.additionalDetailsPlaceholder}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PASTE YOUR NOTES (OPTIONAL) */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{t.pasteNotesTitle}</h3>
                    <p className="text-[11px] text-slate-400">
                      {t.pasteNotesSub}
                    </p>
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t.pasteNotesPlaceholder}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                />

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1">{t.pasteNotesExampleTitle}</span>
                  <p>- Passive voice: subject receives the action</p>
                  <p>- Formation: be + past participle</p>
                  <p>- Example: The cake was eaten by John</p>
                </div>
              </div>

              {/* SECTION 3: ENHANCEMENT OPTIONS */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>{t.enhancementTitle}</span>
                </h3>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={searchResources}
                      onChange={e => setSearchResources(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-teal-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white block">{t.searchResourcesLabel}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.searchResourcesDesc}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={generateImages}
                      onChange={e => setGenerateImages(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-teal-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white block">{t.generateImagesLabel}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.generateImagesDesc}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SECTION 4: TEACHER PREFERENCES */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{t.teacherPrefTitle}</h3>
                    <p className="text-[11px] text-slate-400">{t.teacherPrefSub}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.teacherNotesStyleLabel}</label>
                    <select
                      value={teacherNotesStyle}
                      onChange={e => setTeacherNotesStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="Detailed (100+ words per slide)">Detailed (100+ words per slide)</option>
                      <option value="Concise (30-50 words per slide)">Concise (30-50 words per slide)</option>
                      <option value="Brief reminders">Brief reminders</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.bulletPointStyleLabel}</label>
                    <select
                      value={bulletPointStyle}
                      onChange={e => setBulletPointStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="Concise (5-10 words each)">Concise (5-10 words each)</option>
                      <option value="Detailed (15-20 words each)">Detailed (15-20 words each)</option>
                      <option value="Full sentences">Full sentences</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{t.numberOfSlidesLabel}</label>
                    <div className="flex gap-2">
                      <select
                        value={numberOfSlides}
                        onChange={e => setNumberOfSlides(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white outline-none focus:border-teal-500 transition-colors"
                      >
                        <option value="Auto (based on duration)">Auto (based on duration)</option>
                        <option value="5 slides">5 slides</option>
                        <option value="8 slides">8 slides</option>
                        <option value="10 slides">10 slides</option>
                        <option value="12 slides">12 slides</option>
                        <option value="15 slides">15 slides</option>
                        <option value="20 slides">20 slides (Highly Detailed)</option>
                        <option value="25 slides">25 slides (Highly Detailed)</option>
                        <option value="30 slides">30 slides (In-depth Deck)</option>
                        <option value="40 slides">40 slides (Full Unit Deck)</option>
                        <option value="50 slides">50 slides (Ultimate Academic Deck)</option>
                        <option value="60 slides">60 slides (Extended Deck)</option>
                        <option value="80 slides">80 slides (Full Unit)</option>
                        <option value="100 slides">100 slides (Ultimate Master Deck)</option>
                        <option value="Custom">Custom Number / Enter manually...</option>
                      </select>
                      {numberOfSlides === 'Custom' && (
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={customSlidesCount}
                          onChange={e => setCustomSlidesCount(e.target.value)}
                          className="w-24 bg-slate-950 border border-teal-500 p-2.5 rounded-xl text-white outline-none text-center font-bold"
                          placeholder="e.g. 15"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTimings}
                      onChange={e => setIncludeTimings(e.target.checked)}
                      className="w-4 h-4 accent-teal-500 cursor-pointer"
                    />
                    <span className="text-slate-300 font-bold">{t.includeTimingsLabel}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simplifiedMode}
                      onChange={e => setSimplifiedMode(e.target.checked)}
                      className="w-4 h-4 accent-teal-500 cursor-pointer"
                    />
                    <span className="text-slate-300 font-bold">{t.simplifiedModeLabel}</span>
                  </label>
                </div>
              </div>

              {/* SECTION 5: CHOOSE THEME (PROFESSIONAL, EDUCATIONAL, CREATIVE SELECTOR) */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base">{t.chooseThemeTitle}</h3>
                      <p className="text-xs text-slate-400">{t.chooseThemeSub}</p>
                    </div>
                  </div>

                  {/* Search / Filter input */}
                  <div className="relative min-w-[200px] sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={themeSearch}
                      onChange={(e) => setThemeSearch(e.target.value)}
                      placeholder={t.searchThemesPlaceholder}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    {themeSearch && (
                      <button
                        onClick={() => setThemeSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* CATEGORY TABS (All, Educational, Professional, Creative) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: t.allThemesTab, icon: SlidersHorizontal },
                    { id: 'educational', label: t.educationalTab, icon: GraduationCap },
                    { id: 'professional', label: t.professionalTab, icon: Briefcase },
                    { id: 'creative', label: t.creativeTab, icon: Sparkles }
                  ].map((tab) => {
                    const isActive = themeCategory === tab.id;
                    const count = tab.id === 'all' 
                      ? Object.keys(THEME_CONFIGS).length 
                      : Object.values(THEME_CONFIGS).filter(cfg => cfg.category === tab.id).length;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setThemeCategory(tab.id as ThemeCategory)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                          isActive
                            ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* THEMES GRID WITH SMART CATEGORIZATION & RICH PREVIEWS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  {(Object.keys(THEME_CONFIGS) as ThemeType[])
                    .filter(themeKey => {
                      const cfg = THEME_CONFIGS[themeKey];
                      if (themeCategory !== 'all' && cfg.category !== themeCategory) {
                        return false;
                      }
                      if (themeSearch.trim()) {
                        const q = themeSearch.toLowerCase();
                        return (
                          cfg.name.toLowerCase().includes(q) ||
                          cfg.description.toLowerCase().includes(q) ||
                          cfg.badge.toLowerCase().includes(q) ||
                          cfg.categoryLabel.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map(themeKey => {
                      const cfg = THEME_CONFIGS[themeKey];
                      const isSelected = selectedTheme === themeKey;

                      return (
                        <div
                          key={themeKey}
                          onClick={() => setSelectedTheme(themeKey)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between group ${
                            cfg.cardClass
                          } ${
                            isSelected 
                              ? 'border-teal-400 ring-4 ring-teal-400/25 shadow-xl shadow-teal-500/10 scale-[1.02]' 
                              : 'hover:border-slate-500/80 opacity-90 hover:opacity-100 hover:scale-[1.01]'
                          }`}
                        >
                          {/* Top Row: Category Badge & Selection Check */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.tagClass}`}>
                              {cfg.badge}
                            </span>

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected ? 'bg-teal-400 text-slate-950 shadow-md' : 'border border-slate-600 bg-slate-800 group-hover:border-slate-400'
                            }`}>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-slate-500/50" />
                              )}
                            </div>
                          </div>

                          {/* Preview Slide Card simulation */}
                          <div className="space-y-1.5 py-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${cfg.bulletDotClass}`} />
                              <h4 className={`text-base leading-snug line-clamp-1 ${cfg.textTitleClass}`}>
                                {cfg.name}
                              </h4>
                            </div>
                            <p className={`text-xs line-clamp-1 ${cfg.textSubtitleClass}`}>
                              Sample subtitle preview text
                            </p>
                            <p className={`text-[11px] leading-relaxed line-clamp-2 opacity-80 mt-1.5 ${cfg.bodyTextClass}`}>
                              {cfg.description}
                            </p>
                          </div>

                          {/* Bottom Row: Color Swatches Palette & Actions */}
                          <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                            {/* Color Palette Swatches */}
                            <div className="flex items-center gap-1">
                              {cfg.previewColors.map((color, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                  style={{ backgroundColor: color }}
                                  title={`Color ${cIdx + 1}`}
                                />
                              ))}
                              <span className="text-[10px] font-medium text-slate-400 ml-1.5 capitalize">
                                {cfg.categoryLabel}
                              </span>
                            </div>

                            {isSelected ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-400 text-slate-950 shadow">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                Select →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || isLimitReached}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500 hover:from-teal-400 hover:to-amber-400 text-slate-950 font-black flex items-center gap-2 shadow-lg hover:shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? t.generatingBtn : t.generateBtn}</span>
                  </button>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-amber-300/90 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    The slides are ready to use but may need review. You are the expert teacher! Always review and adjust the content to match your teaching style and classroom needs.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* GENERATED PRESENTATION DECK VIEW & PRESENTER MODE */}
          {generatedDeck && (
            <div className="space-y-6">

              {/* ACTION BAR */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <span>{generatedDeck.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-500/40">
                      {generatedDeck.theme}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {generatedDeck.subject} • {generatedDeck.grade} • {generatedDeck.slides.length} Slides ({generatedDeck.duration})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsPresentationMode(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>{t.presentFullscreenBtn}</span>
                  </button>

                  <button
                    onClick={handleExportPdf}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    title="Export full presentation slides as landscape PDF"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{t.pdfBtn}</span>
                  </button>

                  {/* HANDOUT PDF DROPDOWN BUTTON */}
                  <div className="relative">
                    <button
                      onClick={() => setShowHandoutMenu(!showHandoutMenu)}
                      className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-purple-400" />
                      <span>{t.handoutBtn}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                    </button>

                    {showHandoutMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-black uppercase text-purple-300 tracking-wider border-b border-slate-800 mb-1">
                          Select Handout Format
                        </div>

                        <button
                          onClick={() => handleExportHandoutPdf('3-slides-notes')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-start gap-2.5 transition-all text-xs"
                        >
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">3 Slides + Lined Notes</span>
                            <span className="text-[10px] text-slate-400 block">3 slide cards per page with horizontal lines for student note-taking</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleExportHandoutPdf('6-slides-grid')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-start gap-2.5 transition-all text-xs"
                        >
                          <LayoutGrid className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">6 Slides Grid Layout</span>
                            <span className="text-[10px] text-slate-400 block">2×3 thumbnail grid per page for quick printing & review</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PPTX EXPORT DROPDOWN WITH THEMES */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPptxThemeMenu(!showPptxThemeMenu)}
                      className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Select theme preset and export as PowerPoint file"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>{t.pptBtn} ({pptxTheme})</span>
                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    {showPptxThemeMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in space-y-2">
                        <div className="px-1 py-1 text-[10px] font-black uppercase text-amber-400 tracking-wider border-b border-slate-800 mb-1 flex items-center justify-between">
                          <span>PowerPoint PPTX Theme</span>
                          <span className="text-[9px] bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200 font-normal">Select Preset</span>
                        </div>

                        <div className="space-y-1.5">
                          {(Object.keys(PPTX_THEMES) as PptxThemeType[]).map((themeKey) => {
                            const config = PPTX_THEMES[themeKey];
                            const isSelected = pptxTheme === themeKey;
                            return (
                              <button
                                key={themeKey}
                                onClick={() => setPptxTheme(themeKey)}
                                className={`w-full text-left p-2 rounded-xl transition-all border text-xs ${
                                  isSelected 
                                    ? 'bg-amber-950/40 border-amber-500/50 text-white' 
                                    : 'hover:bg-slate-800 border-transparent text-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs">{config.name}</span>
                                  {/* Color Preview Dots */}
                                  <div className="flex gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full border border-slate-700" style={{ backgroundColor: `#${config.bg}` }} />
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `#${config.primary}` }} />
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `#${config.accent}` }} />
                                  </div>
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">{config.description}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => {
                            handleExportPptx();
                            setShowPptxThemeMenu(false);
                          }}
                          className="w-full py-2 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Generate & Save PPTX</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCopySlides}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>{copiedNotification ? t.copiedBtn : t.copyBtn}</span>
                  </button>

                  <button
                    onClick={() => setGeneratedDeck(null)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    {t.newDeckBtn}
                  </button>
                </div>
              </div>

              {/* ACTIVE SLIDE DISPLAY CARD */}
              {generatedDeck.slides[activeSlideIndex] && (() => {
                const currentSlide = generatedDeck.slides[activeSlideIndex];
                const themeCfg = THEME_CONFIGS[generatedDeck.theme as ThemeType] || THEME_CONFIGS['Classic Chalk'];

                if (isEditingSlide) {
                  return (
                    <div className="space-y-4">
                      {/* EDIT MODE CONTAINER */}
                      <div className="p-6 sm:p-10 rounded-3xl border-2 shadow-2xl relative min-h-[380px] flex flex-col justify-between bg-slate-900 border-teal-500/50">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-mono font-bold text-teal-400">
                              Editing Slide #{currentSlide.slideNumber} of {generatedDeck.slides.length}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] text-slate-400 font-bold">Timing:</label>
                              <input
                                type="text"
                                value={editedTiming}
                                onChange={e => setEditedTiming(e.target.value)}
                                className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-white outline-none focus:border-teal-500 w-24"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Slide Title</label>
                              <input
                                type="text"
                                value={editedTitle}
                                onChange={e => setEditedTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-sm text-white outline-none focus:border-teal-500 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Subtitle (Optional)</label>
                              <input
                                type="text"
                                value={editedSubtitle}
                                onChange={e => setEditedSubtitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-300 mb-1">Bullet Points (One per line)</label>
                              <textarea
                                value={editedBulletText}
                                onChange={e => setEditedBulletText(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white outline-none focus:border-teal-500 font-mono leading-relaxed resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-amber-400 mb-1">Teacher Notes / Speaker Guidance</label>
                              <textarea
                                value={editedTeacherNote}
                                onChange={e => setEditedTeacherNote(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-950 border border-amber-500/30 p-2.5 rounded-xl text-xs text-amber-300 outline-none focus:border-amber-500 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                          <button
                            onClick={() => setIsEditingSlide(false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                          >
                            {t.cancelBtn}
                          </button>
                          <button
                            onClick={saveSlideChanges}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            {t.saveChangesBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    
                    {/* MAIN SLIDE STYLED CONTAINER */}
                    <div className={`p-6 sm:p-10 rounded-3xl border-2 shadow-2xl relative min-h-[380px] flex flex-col justify-between transition-all ${themeCfg.cardClass}`}>
                      
                      {/* SLIDE TOP ROW */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${themeCfg.tagClass}`}>
                            {t.slideOf.replace('{current}', String(currentSlide.slideNumber)).replace('{total}', String(generatedDeck.slides.length))}
                          </span>
                          {currentSlide.timing && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300 bg-slate-900/60 border border-slate-700 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-teal-400" />
                              <span>{currentSlide.timing}</span>
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-white/60">
                          {generatedDeck.subject} • {generatedDeck.grade}
                        </span>
                      </div>

                      {/* SLIDE CONTENT BODY */}
                      <div className="space-y-4 my-auto">
                        <h2 className={`text-xl sm:text-3xl ${themeCfg.textTitleClass}`}>
                          {currentSlide.title}
                        </h2>

                        {currentSlide.subtitle && (
                          <h4 className={`text-sm sm:text-base ${themeCfg.textSubtitleClass}`}>
                            {currentSlide.subtitle}
                          </h4>
                        )}

                        <div className="pt-3">
                          <ul className="space-y-3">
                            {currentSlide.bulletPoints.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 shrink-0 shadow-sm" />
                                <span className={`text-sm sm:text-base leading-relaxed ${themeCfg.bodyTextClass}`}>
                                  {pt}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* TEACHER SPEAKER NOTE BOX */}
                      {currentSlide.teacherNote && (
                        <div className="mt-6 pt-4 border-t border-white/10 bg-slate-950/70 p-4 rounded-2xl border border-amber-500/30 text-amber-300 text-xs">
                          <div className="flex items-center gap-2 font-bold mb-1 text-amber-400">
                            <Sparkles className="w-4 h-4" />
                            <span>{t.teacherGuidanceTitle}</span>
                          </div>
                          <p className="text-slate-200 italic leading-relaxed">{currentSlide.teacherNote}</p>
                        </div>
                      )}

                    </div>

                    {/* SLIDE MANAGEMENT ACTIONS BAR */}
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-md">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={startEditingSlide}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 hover:border-teal-500 hover:bg-slate-800 text-teal-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Modify current slide"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{t.editSlideBtn}</span>
                        </button>

                        <button
                          onClick={handleAddSlide}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 hover:border-emerald-500 hover:bg-slate-800 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Insert a new slide after this one"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addSlideBtn}</span>
                        </button>
                      </div>

                      <button
                        onClick={handleDeleteSlide}
                        disabled={generatedDeck.slides.length <= 1}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 hover:border-rose-500 hover:bg-slate-800 disabled:opacity-30 disabled:hover:border-slate-750 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Remove current slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.deleteSlideBtn}</span>
                      </button>
                    </div>

                    {/* SLIDE NAVIGATION CONTROLS */}
                    <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeSlideIndex === 0}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{t.prevSlide}</span>
                      </button>

                      {/* THUMBNAIL DOTS */}
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[50%] py-1">
                        {generatedDeck.slides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                              idx === activeSlideIndex ? 'bg-teal-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
                            }`}
                            title={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.min(generatedDeck.slides.length - 1, prev + 1))}
                        disabled={activeSlideIndex === generatedDeck.slides.length - 1}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{t.nextSlide}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* ALL SLIDES GRID SUMMARY */}
                    <div className="space-y-3 pt-4">
                      <h4 className="font-extrabold text-white text-sm">{t.allSlidesOverview} ({generatedDeck.slides.length})</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {generatedDeck.slides.map((sl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              idx === activeSlideIndex 
                                ? 'bg-slate-900 border-teal-400 ring-2 ring-teal-400/20' 
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-teal-400 text-xs">Slide #{sl.slideNumber}</span>
                              <span className="text-[10px] text-slate-400">{sl.timing || ''}</span>
                            </div>
                            <h5 className="font-bold text-white text-xs truncate">{sl.title}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {sl.bulletPoints[0] || ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Nkorera Education Portal 2026 • AI Presentation Slides</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* FULLSCREEN PRESENTATION PROJECTOR MODE MODAL */}
      {isPresentationMode && generatedDeck && generatedDeck.slides[activeSlideIndex] && (() => {
        const currentSlide = generatedDeck.slides[activeSlideIndex];
        const themeCfg = THEME_CONFIGS[generatedDeck.theme as ThemeType] || THEME_CONFIGS['Classic Chalk'];

        return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 sm:p-12 overflow-hidden animate-fade-in">
            
            {/* PRESENTATION TOP CONTROL BAR */}
            <div className="flex items-center justify-between text-white/70 text-xs z-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-black text-teal-400 text-sm uppercase tracking-wider">{generatedDeck.title}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[11px]">
                  {generatedDeck.subject} ({generatedDeck.grade})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    showPresenterNotes ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Speaker Notes: {showPresenterNotes ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setIsPresentationMode(false)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Presentation (ESC)</span>
                </button>
              </div>
            </div>

            {/* PRESENTATION SLIDE BODY */}
            <div className={`my-auto p-8 sm:p-14 rounded-3xl border-2 shadow-2xl relative transition-all ${themeCfg.cardClass}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className={`px-3 py-1 rounded-lg text-sm font-mono font-bold ${themeCfg.tagClass}`}>
                  Slide {currentSlide.slideNumber} / {generatedDeck.slides.length}
                </span>

                {currentSlide.timing && (
                  <span className="text-sm font-mono text-emerald-400 bg-black/40 px-3 py-1 rounded-lg border border-emerald-500/30">
                    ⏱️ {currentSlide.timing}
                  </span>
                )}
              </div>

              <h1 className={`text-2xl sm:text-5xl ${themeCfg.textTitleClass} mb-2`}>
                {currentSlide.title}
              </h1>

              {currentSlide.subtitle && (
                <h3 className={`text-base sm:text-2xl ${themeCfg.textSubtitleClass} mb-8`}>
                  {currentSlide.subtitle}
                </h3>
              )}

              <ul className="space-y-4 my-6">
                {currentSlide.bulletPoints.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-teal-400 mt-2.5 shrink-0 shadow-md" />
                    <span className={`text-base sm:text-2xl leading-relaxed ${themeCfg.bodyTextClass}`}>
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PRESENTER NOTES DRAWER */}
            {showPresenterNotes && currentSlide.teacherNote && (
              <div className="bg-amber-950/90 border border-amber-500/50 p-4 rounded-2xl text-amber-200 text-xs sm:text-sm z-10 animate-fade-in max-h-[140px] overflow-y-auto">
                <span className="font-bold text-amber-400 block mb-0.5">💡 TEACHER PRESENTER NOTES:</span>
                <p className="italic">{currentSlide.teacherNote}</p>
              </div>
            )}

            {/* PRESENTATION BOTTOM NAV BAR */}
            <div className="flex items-center justify-between text-white/70 text-xs z-10 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous (Left Arrow)</span>
              </button>

              <span className="font-mono text-sm text-white/90">
                {activeSlideIndex + 1} of {generatedDeck.slides.length}
              </span>

              <button
                onClick={() => setActiveSlideIndex(prev => Math.min(generatedDeck.slides.length - 1, prev + 1))}
                disabled={activeSlideIndex === generatedDeck.slides.length - 1}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-30 text-slate-950 font-black flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Next (Right Arrow / Space)</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        );
      })()}

      {/* SAVED PRESENTATIONS MODAL */}
      {showSavedDecksModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <FolderHeart className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-white text-base">My Saved Presentations ({savedDecks.length})</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadSavedDecks}
                  disabled={isSyncingDecks}
                  className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDecks ? 'animate-spin' : ''}`} />
                  <span>Sync Cloud</span>
                </button>

                <button onClick={() => setShowSavedDecksModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-slate-950">
              {savedDecks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <FolderHeart className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-bold">No saved presentation decks found.</p>
                  <p className="text-xs">Create presentation slides to automatically save them to your Cloud Profile.</p>
                </div>
              ) : (
                savedDecks.map(deck => (
                  <div
                    key={deck.id}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl flex items-center justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm">{deck.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                          {deck.theme}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        📚 {deck.subject} ({deck.grade}) • {deck.slides.length} Slides • {deck.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setGeneratedDeck(deck);
                          setActiveSlideIndex(0);
                          setShowSavedDecksModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button>

                      <button
                        onClick={async () => {
                          await deleteSlideDeckFromFirestore(deck.id);
                          await loadSavedDecks();
                        }}
                        className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-500/40"
                        title="Delete presentation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 text-right">
              <button
                onClick={() => setShowSavedDecksModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
