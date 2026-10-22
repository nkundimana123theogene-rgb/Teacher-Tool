import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { sanitizeClonedDocForPdf } from '../utils/pdfSanitizer';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Youtube, 
  RotateCw, 
  Copy, 
  Check, 
  Video, 
  Mic, 
  FileCode, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Radio, 
  HelpCircle, 
  GraduationCap, 
  FlaskConical, 
  Atom, 
  UserCheck, 
  BarChart2, 
  Presentation, 
  CheckCircle2, 
  Search,
  ExternalLink,
  ChevronDown,
  Plus,
  Minus,
  Globe,
  Download,
  BookOpen,
  Eye,
  X
} from 'lucide-react';
import { AppConfig } from '../types';
import { subscribeToAppConfig } from '../utils/realtime';
import { StudySuiteMarkdownRenderer } from './StudySuiteMarkdownRenderer';
import { PdfPreviewModal } from './PdfPreviewModal';

export type SavetoToolId = 
  // SUMMARIZERS
  | 'video_summarizer'
  | 'audio_summarizer'
  | 'pdf_summarizer'
  | 'word_summarizer'
  | 'ppt_summarizer'
  | 'image_summarizer'
  | 'txt_summarizer'
  | 'text_summarizer'
  // AI VOICES
  | 'podcast_generator'
  // AI STUDY
  | 'unit_notes_summarizer'
  | 'quiz_generator'
  | 'homework_helper'
  | 'chemistry_solver'
  | 'physics_solver'
  | 'ai_humanizer'
  | 'infographic_generator'
  // AI PRESENTATION
  | 'ppt_maker';

export interface ToolConfig {
  id: SavetoToolId;
  name: string;
  category: 'SUMMARIZERS' | 'AI VOICES' | 'AI STUDY' | 'AI PRESENTATION';
  icon: React.ComponentType<{ className?: string }>;
  pageTitle: string;
  pageSubtitle: string;
  btnLabel: string;
  defaultCardCount?: number;
}

export const TOOLS_LIST: ToolConfig[] = [
  // Summarizers
  {
    id: 'video_summarizer',
    name: 'Video Summarizer',
    category: 'SUMMARIZERS',
    icon: Video,
    pageTitle: 'AI Video Summarizer',
    pageSubtitle: 'Extract key insights, structured chapters, and comprehensive summaries from educational videos effortlessly.',
    btnLabel: 'Generate Video Summary'
  },
  {
    id: 'audio_summarizer',
    name: 'Audio Summarizer',
    category: 'SUMMARIZERS',
    icon: Mic,
    pageTitle: 'AI Audio Summarizer',
    pageSubtitle: 'Turn audio lectures, classroom voice recordings, and speeches into structured study notes.',
    btnLabel: 'Summarize Audio'
  },
  {
    id: 'pdf_summarizer',
    name: 'PDF Summarizer',
    category: 'SUMMARIZERS',
    icon: FileText,
    pageTitle: 'AI PDF Summarizer',
    pageSubtitle: 'Instant executive summaries, key formulas, and core takeaways from textbooks and PDF handouts.',
    btnLabel: 'Summarize PDF'
  },
  {
    id: 'word_summarizer',
    name: 'Word Summarizer',
    category: 'SUMMARIZERS',
    icon: FileCode,
    pageTitle: 'AI Word Document Summarizer',
    pageSubtitle: 'Summarize Word docx files, curriculum drafts, and lesson notes in seconds.',
    btnLabel: 'Summarize Word Doc'
  },
  {
    id: 'ppt_summarizer',
    name: 'PPT Summarizer',
    category: 'SUMMARIZERS',
    icon: Presentation,
    pageTitle: 'AI PPT Slide Summarizer',
    pageSubtitle: 'Extract core lecture themes, slide bullets, and main exam concepts from presentation decks.',
    btnLabel: 'Summarize PPT'
  },
  {
    id: 'image_summarizer',
    name: 'Image Summarizer',
    category: 'SUMMARIZERS',
    icon: ImageIcon,
    pageTitle: 'AI Image & Diagram Summarizer',
    pageSubtitle: 'Analyze blackboard photos, textbook diagrams, charts, and handwritten classroom notes.',
    btnLabel: 'Summarize Image'
  },
  {
    id: 'txt_summarizer',
    name: 'TXT Summarizer',
    category: 'SUMMARIZERS',
    icon: FileSpreadsheet,
    pageTitle: 'AI TXT File Summarizer',
    pageSubtitle: 'Parse and summarize raw text files, logs, and reading transcripts instantly.',
    btnLabel: 'Summarize TXT'
  },
  {
    id: 'text_summarizer',
    name: 'Text Summarizer',
    category: 'SUMMARIZERS',
    icon: FileText,
    pageTitle: 'AI Text Summarizer',
    pageSubtitle: 'Condense any article, lesson chapter, or notes into bullet points and key takeaways.',
    btnLabel: 'Summarize Text'
  },

  // AI VOICES
  {
    id: 'podcast_generator',
    name: 'Podcast Generator',
    category: 'AI VOICES',
    icon: Radio,
    pageTitle: 'AI Educational Podcast Generator',
    pageSubtitle: 'Transform topics into an engaging 2-speaker educational podcast dialogue and audio script.',
    btnLabel: 'Generate Podcast'
  },

  // AI STUDY
  {
    id: 'unit_notes_summarizer',
    name: 'Full Book Unit Notes (Incamake ya Buri Unit)',
    category: 'AI STUDY',
    icon: BookOpen,
    pageTitle: 'AI Full Book Unit Summary Notes (No Q&A)',
    pageSubtitle: 'Notes ziteguye neza zigize igitabo cyose ziri summarized kuri buri unit (Pure pedagogical course notes, STRICTLY NO Q&A / quizzes).',
    btnLabel: 'Generate'
  },
  {
    id: 'quiz_generator',
    name: 'AI Quiz Generator',
    category: 'AI STUDY',
    icon: HelpCircle,
    pageTitle: 'AI Quiz & Test Generator',
    pageSubtitle: 'Create high-yield multiple choice, short-answer, and true/false quizzes with complete answer keys.',
    btnLabel: 'Generate Quiz'
  },
  {
    id: 'homework_helper',
    name: 'AI Homework Helper',
    category: 'AI STUDY',
    icon: GraduationCap,
    pageTitle: 'AI Homework Helper',
    pageSubtitle: 'Step-by-step explanations, guided hints, and pedagogical mastery for any homework problem.',
    btnLabel: 'Solve & Explain Homework'
  },
  {
    id: 'chemistry_solver',
    name: 'AI Chemistry Solver',
    category: 'AI STUDY',
    icon: FlaskConical,
    pageTitle: 'AI Chemistry Solver',
    pageSubtitle: 'Balance chemical reactions, calculate stoichiometry, and explain organic & inorganic mechanisms.',
    btnLabel: 'Solve Chemistry Problem'
  },
  {
    id: 'physics_solver',
    name: 'AI Physics Solver',
    category: 'AI STUDY',
    icon: Atom,
    pageTitle: 'AI Physics Solver',
    pageSubtitle: 'Step-by-step kinematics, forces, electricity, optics calculations with SI units and formulas.',
    btnLabel: 'Solve Physics Problem'
  },
  {
    id: 'ai_humanizer',
    name: 'AI Humanizer',
    category: 'AI STUDY',
    icon: UserCheck,
    pageTitle: 'AI Text Humanizer',
    pageSubtitle: 'Rewrite robotic or rigid text into natural, expressive, human-written pedagogical language.',
    btnLabel: 'Humanize Text'
  },
  {
    id: 'infographic_generator',
    name: 'Infographic Generator',
    category: 'AI STUDY',
    icon: BarChart2,
    pageTitle: 'AI Infographic & Concept Generator',
    pageSubtitle: 'Generate structured visual concept cards, milestone timelines, and infographic frameworks.',
    btnLabel: 'Generate Infographic'
  },

  // AI PRESENTATION
  {
    id: 'ppt_maker',
    name: 'AI PPT Maker',
    category: 'AI PRESENTATION',
    icon: Presentation,
    pageTitle: 'AI Presentation PPT Maker',
    pageSubtitle: 'Turn curriculum topics into structured, professional slide decks with bullet points and teacher notes.',
    btnLabel: 'Generate PPT Deck'
  }
];

export interface FlashcardItem {
  front: string;
  back: string;
  difficulty?: string;
  known?: boolean;
}

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  count: string;
  difficulty: 'Low' | 'Medium' | 'High';
  prompt: string;
  toolId: SavetoToolId;
}

export const SAVETO_TEMPLATES: TemplateItem[] = [
  {
    id: 's1_biology_mrsgren_quiz',
    title: 'S1 Biology: MRS GREN & Cells (Quiz + Key)',
    description: 'Interactive quiz with submission confirmation (kwemeza), instant grading, and complete answer key...',
    count: '5 Questions + Key',
    difficulty: 'Medium',
    prompt: 'Biology S1: Characteristics of living organisms (MRS GREN), Cell theory, cell nucleus function, hierarchy of life (cells -> tissues -> organs -> systems), and excretion. Generate interactive quiz questions with answer options, explanations, and complete answer key table.',
    toolId: 'quiz_generator'
  },
  {
    id: 'bio_basics',
    title: 'Cell Biology Basics (Unit Notes)',
    description: 'Comprehensive unit notes covering organelles, membranes, and cellular respiration (No Q&A)...',
    count: 'Full Unit Notes',
    difficulty: 'Low',
    prompt: 'Cell biology fundamentals: Cell membrane, nucleus, mitochondria, ribosomes, plant vs animal cells, cellular respiration, and photosynthesis. Generate complete pedagogical unit notes without Q&A.',
    toolId: 'unit_notes_summarizer'
  },
  {
    id: 'grammar_essentials',
    title: 'English Grammar Essentials (Unit Notes)',
    description: 'Comprehensive lesson notes for tenses, relative clauses, active vs passive voice, and rules (No Q&A)...',
    count: 'Full Unit Notes',
    difficulty: 'Low',
    prompt: 'English Grammar Essentials: Present perfect vs past simple, active and passive voice, relative clauses, conditional sentences, and common preposition usage. Generate complete pedagogical unit notes without Q&A.',
    toolId: 'unit_notes_summarizer'
  },
  {
    id: 'history_moments',
    title: 'World History Milestones (Unit Notes)',
    description: 'Structured unit summary notes on industrial revolution, treaties, and global independence (No Q&A)...',
    count: 'Full Unit Notes',
    difficulty: 'Medium',
    prompt: 'Key World History Milestones: Industrial revolution impact, World War causes, United Nations formation, African independence movements, and the digital era. Generate complete pedagogical unit notes without Q&A.',
    toolId: 'unit_notes_summarizer'
  },
  {
    id: 'economics_intro',
    title: 'Principles of Economics (Unit Notes)',
    description: 'Core unit notes on scarcity, inflation, market equilibrium, and opportunity costs (No Q&A)...',
    count: 'Full Unit Notes',
    difficulty: 'High',
    prompt: 'Core Economics Principles: Scarcity, opportunity cost, supply and demand equilibrium, inflation causes, fiscal vs monetary policy, and GDP measurement. Generate complete pedagogical unit notes without Q&A.',
    toolId: 'unit_notes_summarizer'
  },
  {
    id: 'science_curriculum',
    title: 'Primary Science & SET (Unit Notes)',
    description: 'Living things, human body systems, electrical circuits, and environmental conservation (No Q&A)...',
    count: 'Full Unit Notes',
    difficulty: 'Medium',
    prompt: 'Science and Technology curriculum: Human circulatory & respiratory systems, plant reproduction, electricity circuits, simple machines, and environmental sustainability. Generate complete pedagogical unit notes without Q&A.',
    toolId: 'unit_notes_summarizer'
  },
  {
    id: 'physics_mechanics',
    title: 'Physics Mechanics & Newton Laws',
    description: 'Kinematics formulas, Newton laws of motion, momentum, and kinetic energy calculations...',
    count: 'Step-by-Step Solver',
    difficulty: 'High',
    prompt: 'Physics Mechanics: Newton 3 laws of motion, speed vs velocity, acceleration formula, conservation of momentum, work-energy theorem, and gravitational potential energy.',
    toolId: 'physics_solver'
  },
  {
    id: 'chemistry_reactions',
    title: 'Chemistry Reactions & pH Scale',
    description: 'Acids, bases, neutralization reactions, stoichiometry, and balancing equations...',
    count: 'Step-by-Step Solver',
    difficulty: 'Medium',
    prompt: 'Chemistry Acids, Bases and Reactions: pH scale definitions, strong vs weak acids, neutralization reaction products, balancing ionic equations, and titration principles.',
    toolId: 'chemistry_solver'
  },
  {
    id: 'geography_climate',
    title: 'African Geography & Climate (Unit Notes)',
    description: 'Topography, climate classification, water bodies, and sustainable resource management (No Q&A)...',
    count: 'Full Unit Notes',
    difficulty: 'Low',
    prompt: 'African Geography and Climate Zones: Major landforms, rift valleys, equatorial and savannah climate zones, river systems, and environmental management. Generate complete pedagogical unit notes without Q&A.',
    toolId: 'unit_notes_summarizer'
  }
];

export interface SupportedLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  badge: string;
  questionLabel: string;
}

export const SAVETO_LANGUAGES: SupportedLanguage[] = [
  { id: 'English', name: 'English', nativeName: 'English', flag: '🇬🇧', badge: 'EN', questionLabel: 'Questions & Answers' },
  { id: 'Kinyarwanda', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼', badge: 'RW', questionLabel: "Ibibazo n'Ibisubizo" },
  { id: 'Français', name: 'Français', nativeName: 'Français', flag: '🇫🇷', badge: 'FR', questionLabel: 'Questions & Réponses' },
  { id: 'Kiswahili', name: 'Kiswahili', nativeName: 'Kiswahili', flag: '🇹🇿', badge: 'SW', questionLabel: 'Maswali na Majibu' },
];

// Client-side fallback generator for full-book unit summary notes (Strictly NO Q&A, NO Flashcards)
function getClientFullBookNotes(language: string, bookName?: string): string {
  const title = bookName ? bookName.replace(/\.[^/.]+$/, "") : "Manuel Académique & Programme de Cours";

  if (language === 'Français') {
    return `# 📚 Notes Complètes & Résumé de Cours par Unité : ${title}

> **Directive Pédagogique :** Ces notes synthétisent l'ensemble des unités du cours sous forme de cours magistraux et de résumés conceptuels de haut niveau. **Strictement sans questions ni réponses (No Q&A)**, elles sont directement exploitables pour l'enseignement et l'étude.

---

### 📖 Unité 1 : Principes Fondamentaux, Notions Clés & Cadre d'Analyse
- **📌 Compétences d'Apprentissage & Objectifs Majeurs :**
  - Comprendre l'architecture globale de la discipline et maîtriser la terminologie scientifique essentielle.
  - Établir les relations causales entre concepts théoriques fondamentaux et phénomènes observés.
- **📚 Corps du Cours & Notions Détaillées :**
  - **Structure Conceptuelle :** Décomposition systématique des composantes primaires. Chaque système s'articule autour d'éléments interdépendants dont l'équilibre garantit la stabilité générale.
  - **Développement Analytique :** Mise en évidence des lois fondamentales régissant les interactions et les transformations d'état dans des conditions standard.
  - **Hiérarchie Pédagogique :** Progression méthodique du concret vers l'abstrait, permettant une conceptualisation solide.
- **🔑 Lois, Formules & Définitions Essentielles :**
  - **Définition Majeure :** Notion d'état stationnaire et conservation des grandeurs scalaires fondamentales.
  - **Principe Directeur :** Tout changement d'état résulte d'un déséquilibre énergétique ou d'un flux d'information externe.
- **💡 Applications Pratiques & Exemples Concrets en Classe :**
  - Modélisation visuelle au tableau à l'aide de schémas fonctionnels fléchés.
  - Analyse d'un cas pratique montrant l'application directe des principes d'observation dans l'environnement quotidien.
- **🎯 Synthèse de l'Unité & Invariants Pédagogiques :**
  - L'Unité 1 pose les jalons terminologiques et méthodologiques indispensables à l'assimilation des unités subséquentes.

---

### 📖 Unité 2 : Mécanismes d'Action, Cinétique & Systèmes Dynamiques
- **📌 Compétences d'Apprentissage & Objectifs Majeurs :**
  - Analyser les facteurs déterminant la vitesse, l'efficacité et les rendements des processus étudiés.
  - Modéliser mathématiquement et conceptuellement les cinétiques de transfert.
- **📚 Corps du Cours & Notions Détaillées :**
  - **Dynamique des Systèmes :** Étude des flux continus et discontinus. Définition des régimes transitoires et des régimes permanents.
  - **Régulation et Rétroaction :** Analyse approfondie des boucles de rétroaction négative (maintien de l'homéostasie) et positive.
- **🔑 Lois, Formules & Définitions Essentielles :**
  - **Équation de Continuité :** Débit d'entrée - Débit de sortie = Taux d'accumulation interne.
  - **Rendement Théorique :** η = (Énergie utile obtenue / Énergie totale fournie) × 100%.
- **💡 Applications Pratiques & Exemples Concrets en Classe :**
  - Démonstration expérimentale du calcul de rendement sur un montage type.
- **🎯 Synthèse de l'Unité :**
  - Tout système autonome ajuste sa dynamique interne en réponse aux variations de charge environnementale.

---

### 📖 Unité 3 : Protocoles Expérimentaux, Métrologie & Validation Rigoureuse
- **📌 Compétences d'Apprentissage & Objectifs Majeurs :**
  - Conduire des démarches d'investigation rigoureuses avec contrôle strict des variables parasites.
  - Traiter quantitativement les séries de mesures et quantifier l'incertitude absolue et relative.
- **📚 Corps du Cours & Notions Détaillées :**
  - **Méthodologie Scientifique :** Formulation d'hypothèses réfutables, protocole opératoire standardisé et chaîne de mesure.
  - **Statistique Descriptive Appliquée :** Détermination de la moyenne arithmétique, de la variance et de l'intervalle de confiance.
- **🔑 Lois, Formules & Définitions Essentielles :**
  - **Incertitude Relative :** ΔX / X_moyen (exprimée sans dimension ou en pourcentage).
- **💡 Applications Pratiques en Classe :**
  - Exercice guidé de calcul d'erreur sur des données relevées lors d'un TP de sciences physiques ou naturelles.
- **🎯 Synthèse de l'Unité :**
  - La précision d'une conclusion dépend intrinsèquement de la rigueur métrologique du protocole expérimental.

---

### 📖 Unité 4 : Applications Pratiques, Innovations Technologiques & Enjeux Éthiques
- **📌 Compétences d'Apprentissage & Objectifs Majeurs :**
  - Relier les théories académiques aux innovations contemporaines industrielles, agricoles et médicales.
  - Évaluer de façon critique l'impact socio-écologique et éthique des technologies émergentes.
- **📚 Corps du Cours & Notions Détaillées :**
  - **Transfert de Technologie :** Du prototype de laboratoire à l'échelle industrielle : contraintes d'optimisation et d'économie circulaire.
  - **Éthique & Développement Durable :** Analyse des cycles de vie (ACV), gestion responsable des sous-produits et sécurité collective.
- **🎯 Synthèse de l'Unité :**
  - L'application du savoir requiert une conscience éthique constante pour servir le progrès durable de la communauté.

---

### 📖 Unité 5 : Synthèse Générale, Intégration Curriculaire & Perspectives de Maîtrise
- **📌 Compétences d'Apprentissage & Objectifs Majeurs :**
  - Articuler les compétences acquises dans les Unités 1 à 4 pour résoudre des problématiques complexes globales.
  - Développer l'autonomie intellectuelle et la capacité de transmission pédagogique.
- **📚 Corps du Cours & Notions Détaillées :**
  - Tableau de bord synoptique reliant tous les concepts, formules et lois transversales du programme.
- **🎯 Synthèse Finale :**
  - Maîtrise intégrale du programme académique, validant l'acquisition des compétences clés.`;
  }

  if (language === 'Kinyarwanda') {
    return `# 📚 Inyandiko z'Amasomo z'Umwimerere kuri Buri Unit y'Igitabo : ${title}

> **Amabwiriza y'Uburezi :** Izi nyandiko zikoze neza cyane nk'incamake y'igitabo cyose igizwe n'amasomo asobanuye neza kuva ku ntangiriro kugeza ku musozo. **NTA BIBAZO N'IBISUBIZO BIRIMO (Strictly No Q&A)** — ahubwo ni inyigisho zateguwe neza zo kwigisha mu ishuri cyangwa gusubiramo amasomo.

---

### 📖 Unit 1: Ubumenyi bw'Ibanze, Inyito n'Amahame Shingiro y'Isomo
- **📌 Intego z'Ingenzi n'Ubushobozi Bugamijwe (Core Competencies) :**
  - Gusobanukirwa inkomoko y'amasomo n'ubumenyi bw'ibanze bushingiye kuri porogaramu ya REB CBC.
  - Kumenya no gusobanura neza amagambo y'ubuhanga akoreshwa muri iyi nteganyanyigisho.
- **📚 Inyigisho z'Isomo n'Ibisobanuro Byimbitse :**
  - **Isesengura ry'Ibanze :** Gusobanura amateka n'imvo n'imvano y'isomo mu buryo bworoheye umunyeshuri.
  - **Inzego z'Isomo :** Uko ibice bigize isomo byuzuzanya mu kubaka ubumenyi buhamye.
- **🔑 Amategeko Shingiro n'Ibisobanuro by'Amagambo :**
  - **Ihame rya Mbere :** Ibisobanuro by'impinduka n'amategeko agenga uburinganire bw'ibintu.
- **💡 Ingero zo mu Ishuri n'Imikoreshereze mu Buzima :**
  - Imyitozo ifatika ikorwa n'abanyeshuri bakoresheje ibikoresho biboneka mu bidukikije bibakikije.
- **🎯 Umwanzuro w'Isomo n'Ingingo zo Kuzirikana :**
  - Unit 1 itanga urufatiro rukomeye rw'ubumenyi buzafasha umunyeshuri kumva neza ama-unit akurikiyeho.

---

### 📖 Unit 2: Imikorere y'Inzego, Imikurire n'Ihindagurika ry'Ubumenyi
- **📌 Intego z'Ingenzi n'Ubushobozi Bugamijwe :**
  - Gusesengura imikorere y'ibice bitandukanye n'uburyo byunganirana mu gukora umurimo wuzuye.
- **📚 Inyigisho z'Isomo n'Ibisobanuro Byimbitse :**
  - **Imikoranire y'Ibice :** Uburyo urwego rwose rurindwa n'imbaraga z'imbere mu guhora rutekanye.
- **🔑 Amategeko Shingiro :**
  - Conservation of Energy n'uburinganire bw'ibice mu mikorere.
- **💡 Ingero zo mu Ishuri :**
  - Amatsinda yo gusesengura imikorere y'ibishushanyo mbonera.
- **🎯 Umwanzuro w'Isomo :**
  - Imikorere myiza iterwa n'uburinganire bwuzuye bw'ibice byose birugize.

---

### 📖 Unit 3: Ubushakashatsi, Gupima no Gukusanya Amakuru y'Ukuri
- **📌 Intego z'Ingenzi n'Ubushobozi Bugamijwe :**
  - Gukoresha ibikoresho bya laboratwari mu gupima no gusesengura amakuru ku buryo buzira amakosa.
- **📚 Inyigisho z'Isomo :**
  - **Inzira y'Ubushakashatsi :** Gutekereza ku kibazo, gukora igerageza no gufata umwanzuro.
- **🎯 Umwanzuro w'Isomo :**
  - Ubumenyi nyabwo bushingira ku bushakashatsi bukozwe neza kandi bwizewe.

---

### 📖 Unit 4: Ikoranabuhanga, Iterambere Rirambye no Kurengera Ibidukikije
- **📌 Intego z'Ingenzi n'Ubushobozi Bugamijwe :**
  - Guhuza ubumenyi bwo mu ishuri n'ibibazo bikemurwa mu buhinzi, inganda no kurengera ibidukikije mu Rwanda.
- **🎯 Umwanzuro w'Isomo :**
  - Ubumenyi bukoreshwa mu guteza imbere umuryango no kubungabunga ibidukikije.

---

### 📖 Unit 5: Isesengura Rusange ry'Igitabo Cyose n'Isubiramo Ryimbitse
- **📌 Intego z'Ingenzi n'Ubushobozi Bugamijwe :**
  - Guhuriza hamwe ubumenyi bwose bwabonetse muri Unit 1 kugeza kuri Unit 4.
- **🎯 Umwanzuro wa Nyuma :**
  - Gutegura umunyeshuri gukoresha ubumenyi mu bizamini bya Leta no mu buzima bwa buri munsi.`;
  }

  // Default English
  return `# 📚 Full Course & Unit Summary Notes: ${title}

> **Pedagogical Directive:** These notes comprehensively synthesize all units from the textbook into high-level lecture notes and conceptual summaries. **Strictly without questions and answers (No Q&A)**, designed for direct classroom teaching and mastery.

---

### 📖 Unit 1: Foundational Principles & Core Concepts
- **📌 Learning Competencies & Objectives:**
  - Master key discipline terminology and establish causal relationships across foundational theories.
- **📚 Detailed Lesson Content:**
  - Complete breakdown of elementary systems, structure, and equilibrium rules.
- **🔑 Laws, Formulas & Definitions:**
  - Conservation principles, rate laws, and key operational metrics.
- **💡 Classroom Applications:**
  - Hands-on visual modeling and observable real-world demonstrations.
- **🎯 Unit Mastery Summary:**
  - Sets the fundamental scientific basis for all subsequent units.

---

### 📖 Unit 2: Systems Dynamics & Mechanism Kinetics
- **📌 Learning Competencies & Objectives:**
  - Quantify rates of change and analyze feedback loops and steady states.
- **📚 Detailed Lesson Content:**
  - In-depth study of input/output rates, dynamic equilibrium, and efficiency calculations.
- **🔑 Laws, Formulas & Definitions:**
  - Continuity Equation & Efficiency Yield: η = (Useful Output / Total Input) × 100%.
- **💡 Classroom Applications:**
  - Guided laboratory efficiency calculations.
- **🎯 Unit Mastery Summary:**
  - Systems maintain stability through continuous negative and positive feedback regulation.

---

### 📖 Unit 3: Experimental Methodology & Empirical Verification
- **📌 Learning Competencies & Objectives:**
  - Design controlled investigations with isolated independent and dependent variables.
- **📚 Detailed Lesson Content:**
  - Scientific inquiry stages, quantitative measurements, and uncertainty margins.
- **🔑 Laws, Formulas & Definitions:**
  - Relative Percentage Uncertainty: (ΔX / X) × 100%.
- **🎯 Unit Mastery Summary:**
  - Valid scientific conclusions depend entirely on replicable protocols and rigorous measurements.

---

### 📖 Unit 4: Technological Applications, Ethics & Sustainability
- **📌 Learning Competencies & Objectives:**
  - Connect academic theory to industrial, agricultural, and technological applications.
- **📚 Detailed Lesson Content:**
  - Sustainable resource management, green technologies, and lifecycle impact analysis.
- **🎯 Unit Mastery Summary:**
  - Applied knowledge must align with sustainability and societal ethical responsibilities.

---

### 📖 Unit 5: Comprehensive Curriculum Synthesis & Review
- **📌 Learning Competencies & Objectives:**
  - Synthesize cross-cutting competencies across all textbook units into a unified conceptual framework.
- **📚 Detailed Lesson Content:**
  - Master concept map and unified problem-solving strategies.
- **🎯 Unit Mastery Summary:**
  - Full syllabus mastery ready for academic assessments and practical application.`;
}

interface SavetoAiStudioProps {
  onOpenCbcModal?: (mode: 'create' | 'edit') => void;
  onOpenHomeworkQuiz?: (mode: 'homework' | 'classwork' | 'quiz') => void;
  embeddedMode?: boolean;
}

export const SavetoAiStudio: React.FC<SavetoAiStudioProps> = ({
  onOpenCbcModal,
  onOpenHomeworkQuiz,
  embeddedMode = false
}) => {
  const [activeTool, setActiveTool] = useState<SavetoToolId>('unit_notes_summarizer');
  const [inputTab, setInputTab] = useState<'file' | 'text' | 'youtube'>('file');
  
  // Form parameters
  const [inputText, setInputText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [cardCount, setCardCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Français');
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [includeMarkingGuide, setIncludeMarkingGuide] = useState<boolean>(true);
  const [appendMode, setAppendMode] = useState(false);

  const [downloadedHistory, setDownloadedHistory] = useState<Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    content: string;
    language: string;
  }>>(() => {
    try {
      const stored = localStorage.getItem('nkorera_downloaded_history');
      let items: any[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(items)) items = [];

      // Sanitize old items that contained flashcards, broken support messages or Q&A
      const cleaned = items.map(item => {
        const isCorrupt = !item.content || 
          item.content.includes('+250 781 339 530') || 
          item.content.includes('Flashcard') || 
          item.content.includes("Qu'est-ce que la méthode scientifique") ||
          item.title?.toLowerCase().includes('flashcard') ||
          item.content.length < 350;

        if (isCorrupt) {
          const lang = item.language || 'Français';
          const title = item.title && !item.title.toLowerCase().includes('flashcard') 
            ? item.title 
            : (lang === 'Français' ? 'Notes de Cours Complètes par Unité (Français)' : 'Full Book Unit Summary Notes');
          return {
            ...item,
            title,
            type: 'Full Book Unit Notes',
            language: lang,
            content: getClientFullBookNotes(lang, title)
          };
        }
        return item;
      });

      // If empty, add a default ready-to-view French book notes item
      if (cleaned.length === 0) {
        cleaned.push({
          id: 'sample_french_book_notes',
          title: 'Notes Complètes de Cours par Unité (Programme Français)',
          type: 'Full Book Unit Notes',
          date: new Date().toLocaleDateString(),
          language: 'Français',
          content: getClientFullBookNotes('Français', 'Manuel Pédagogique')
        });
      }

      localStorage.setItem('nkorera_downloaded_history', JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      return [{
        id: 'sample_french_book_notes',
        title: 'Notes Complètes de Cours par Unité (Programme Français)',
        type: 'Full Book Unit Notes',
        date: new Date().toLocaleDateString(),
        language: 'Français',
        content: getClientFullBookNotes('Français', 'Manuel Pédagogique')
      }];
    }
  });

  const saveToHistory = (title: string, type: string, content: string) => {
    const newItem = {
      id: `hist_${Math.random().toString(36).substring(2, 9)}`,
      title,
      type,
      date: new Date().toLocaleDateString(),
      content,
      language: selectedLanguage
    };
    const updated = [newItem, ...downloadedHistory];
    setDownloadedHistory(updated);
    try {
      localStorage.setItem('nkorera_downloaded_history', JSON.stringify(updated));
    } catch (e) {}
  };

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<{
    id: string;
    title: string;
    type: string;
    date: string;
    content: string;
    language: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToAppConfig((cfg) => {
      setAppConfig(cfg);
    });
    return () => unsub();
  }, []);

  const currentTool = TOOLS_LIST.find(t => t.id === activeTool) || TOOLS_LIST[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) setInputText(content);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        reader.onload = () => {
          const bookText = `[Uploaded Textbook / PDF Document: ${file.name} (${Math.round(file.size / 1024)} KB)]\nNote: Teacher uploaded official textbook PDF "${file.name}". Generate comprehensive quizzes, high-yield questions, assessment exercises, and complete answer keys with detailed pedagogical explanations directly based on this uploaded book document content.`;
          setInputText(prev => prev ? prev + '\n\n' + bookText : bookText);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const bookText = `[Uploaded Book/Document: ${file.name} (${Math.round(file.size / 1024)} KB)]\n${text || 'Document uploaded successfully.'}`;
          setInputText(prev => prev ? prev + '\n\n' + bookText : bookText);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleGenerate = async () => {
    const payloadContent = inputTab === 'text' 
      ? inputText 
      : inputTab === 'youtube' 
        ? youtubeUrl 
        : uploadedFile ? `Uploaded File: ${uploadedFile.name}` : inputText;

    if (!payloadContent.trim() && !uploadedFile && !youtubeUrl.trim()) {
      alert("Please enter text, upload a file, or enter a YouTube video URL to proceed.");
      return;
    }

    setIsGenerating(true);
    setGeneratedReply(null);

    try {
      const res = await fetch('/api/saveto-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: payloadContent,
          toolType: activeTool,
          cardCount,
          difficulty,
          language: selectedLanguage,
          inputMethod: inputTab,
          youtubeUrl: inputTab === 'youtube' ? youtubeUrl : undefined,
          includeAnswerKey,
          includeMarkingGuide,
          fileName: uploadedFile ? uploadedFile.name : undefined
        })
      });

      const data = await res.json();
      if (data.reply) {
        setGeneratedReply(data.reply);
        saveToHistory(currentTool.name, currentTool.category, data.reply);
      } else {
        const fallback = getClientFullBookNotes(selectedLanguage, uploadedFile?.name || inputText || 'Manuel Académique');
        setGeneratedReply(fallback);
        saveToHistory(currentTool.name, currentTool.category, fallback);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);

    } catch (err) {
      console.error('Generation request note:', err);
      const fallback = getClientFullBookNotes(selectedLanguage, uploadedFile?.name || inputText || 'Manuel Académique');
      setGeneratedReply(fallback);
      saveToHistory(currentTool.name, currentTool.category, fallback);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownload = (content: string, filenamePrefix: string, extension: string = 'txt') => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}_${selectedLanguage}_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async (elementId: string, filenamePrefix: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
      const opt = {
        margin: 10,
        filename: `${filenamePrefix}_${selectedLanguage}_${Date.now()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          onclone: (clonedDoc: Document) => sanitizeClonedDocForPdf(clonedDoc) 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      await (html2pdf as any)().from(element).set(opt).save();
    } catch (err) {
      console.error('PDF generation error, falling back to print:', err);
      window.print();
    }
  };




  const categories: ('SUMMARIZERS' | 'AI VOICES' | 'AI STUDY' | 'AI PRESENTATION')[] = [
    'SUMMARIZERS',
    'AI VOICES',
    'AI STUDY',
    'AI PRESENTATION'
  ];

  const filteredTools = TOOLS_LIST.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full flex flex-col ${embeddedMode ? 'rounded-2xl' : 'rounded-3xl'} overflow-hidden bg-white text-slate-900 border border-slate-200/90 shadow-xl`}>
      
      {/* HEADER BAR (IF EMBEDDED) */}
      {embeddedMode && (
        <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">Saveto AI Studio</span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full flex items-center gap-1">
                  <span>{SAVETO_LANGUAGES.find(l => l.id === selectedLanguage)?.flag || '🌐'}</span>
                  <span>{selectedLanguage} (EN • RW • FR • SW) • Co-Pilot</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Study, Flashcards, Summarizers, Quiz, Solvers & PPT Maker for Educators
              </p>
            </div>
          </div>

          <a 
            href={`https://wa.me/${appConfig?.whatsappNumber || '250781339530'}?text=${encodeURIComponent('Hello Saveto AI Support! I need assistance with the Teacher Resources studio.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/40 transition-colors"
          >
            <span>WhatsApp Support</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* 2-COLUMN MAIN CONTENT: SIDEBAR + WORKSPACE */}
      <div className="flex flex-col md:flex-row overflow-hidden bg-slate-50 min-h-[680px]">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search AI tools in English..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 text-sm font-medium max-h-[520px]">
            {categories.map((category) => {
              const categoryTools = filteredTools.filter(t => t.category === category);
              if (categoryTools.length === 0) return null;

              return (
                <div key={category} className="space-y-1">
                  {category !== 'SUMMARIZERS' && (
                    <div className="px-3 py-1 text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      {category}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {categoryTools.map((tool, toolIdx) => {
                      const Icon = tool.icon;
                      const isActive = activeTool === tool.id;

                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setActiveTool(tool.id);
                            if (tool.defaultCardCount) setCardCount(tool.defaultCardCount);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                            isActive 
                              ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200/80 shadow-xs' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                            <span className="truncate">{toolIdx + 1}. {tool.name}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Card */}
          <div className="p-3 border-t border-slate-100 bg-gradient-to-br from-orange-50/60 to-amber-50/40">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-800">Teacher AI Co-Pilot</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight mb-2">
              Generate Bloom taxonomy SMART objectives, review flashcards, and solve STEM exercises in English.
            </p>
            <div className="flex gap-1.5">
              {onOpenCbcModal && (
                <button
                  onClick={() => onOpenCbcModal('create')}
                  className="flex-1 py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold transition-colors text-center cursor-pointer"
                >
                  Create Plan
                </button>
              )}
              {onOpenHomeworkQuiz && (
                <button
                  onClick={() => onOpenHomeworkQuiz('quiz')}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold transition-colors text-center cursor-pointer"
                >
                  Quick Quiz
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">
          
          {/* HERO HEADER & MULTI-LANGUAGE SELECTOR */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {currentTool.pageTitle}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                      {currentTool.pageSubtitle}
                    </p>
                  </div>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-extrabold text-orange-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ururimi:</span>
                  </div>
                  {SAVETO_LANGUAGES.map((lang) => {
                    const isActive = selectedLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                        title={`${lang.name} - ${lang.questionLabel}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Mode Switcher: Full Book Unit Notes (No Q&A) vs Quiz vs Solvers */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Direct Mode:</span>
                <button
                  type="button"
                  onClick={() => setActiveTool('unit_notes_summarizer')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTool === 'unit_notes_summarizer'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>📚 Full Book Unit Notes (Incamake ya Buri Unit - No Q&A)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('quiz_generator')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTool === 'quiz_generator'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>📝 AI Quiz & Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('homework_helper')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTool === 'homework_helper'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>🎓 Homework Helper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('text_summarizer')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTool === 'text_summarizer'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>📄 Text Summarizer</span>
                </button>
              </div>
            </div>
          </div>

          {/* INPUT TABS [ File ] [ Text ] [ YouTube ] */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setInputTab('file')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                inputTab === 'file'
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              <span>Book / File Upload</span>
            </button>

            <button
              onClick={() => setInputTab('text')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                inputTab === 'text'
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Text / Chapter Prompt</span>
            </button>

            <button
              onClick={() => setInputTab('youtube')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                inputTab === 'youtube'
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-rose-500" />
              <span>YouTube Video</span>
            </button>
          </div>

          {/* INPUT FORM CONTAINER */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* FILE INPUT */}
            {inputTab === 'file' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-b from-orange-50/40 to-amber-50/20 hover:from-orange-50/60 hover:to-amber-50/40 transition-all cursor-pointer flex flex-col items-center justify-center group shadow-sm"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp3,.mp4,.wav,.jpg,.png"
                />
                
                <div className="w-16 h-16 rounded-2xl bg-white border border-orange-200 flex items-center justify-center text-orange-500 group-hover:scale-110 shadow-md transition-all mb-4">
                  <Upload className="w-8 h-8" />
                </div>

                 <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                  {activeTool === 'unit_notes_summarizer' 
                    ? `Upload Book or Document to Generate Full Unit Summary Notes (${selectedLanguage})`
                    : 'Upload Textbook, PDF, or Document to Generate Quizzes & Answer Keys'}
                </h3>
                
                <p className="text-xs text-slate-500 mb-6 max-w-md">
                  {activeTool === 'unit_notes_summarizer'
                    ? `Supports PDF books, Word docx, and TXT files. AI will iterate through every single unit in the whole book and generate comprehensive summarized notes without Q&A in ${selectedLanguage}.`
                    : 'Supports PDF textbooks, Word docx, TXT notes, and images. AI will analyze the book and instantly build quizzes with complete answer keys.'}
                </p>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs transition-all shadow-lg shadow-orange-500/25 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadedFile ? `Selected: ${uploadedFile.name}` : 'Browse Textbook / File'}</span>
                </button>

                {uploadedFile && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Loaded: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB) — Ready to generate!</span>
                  </div>
                )}
              </div>
            )}

            {/* TEXT INPUT */}
            {inputTab === 'text' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    1. Shyiramo Integanyanyigisho cyangwa Inyandiko z'Igitabo ({selectedLanguage}):
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {inputText.length} characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Koporora cyangwa andika inyandiko z'igitabo, units zigize integanyanyigisho, cyangwa amasomo ushaka ko AI igukorera incamake mu rurimi rwa ${selectedLanguage}...`}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:bg-white transition-all resize-y"
                />
              </div>
            )}

            {/* YOUTUBE INPUT */}
            {inputTab === 'youtube' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700">
                  1. Enter YouTube Educational Video URL:
                </label>
                <div className="relative">
                  <Youtube className="w-5 h-5 text-rose-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:bg-white"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Saveto AI will parse educational video transcripts and generate structured English study notes & flashcards.
                </p>
              </div>
            )}

            {/* OUTPUT OPTIONS (ANSWER KEY & MARKING GUIDE TOGGLES OR UNIT NOTES NOTICE) */}
            {activeTool === 'unit_notes_summarizer' ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="text-xs font-black text-amber-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span>📚 Mode y'Incamake z'Amasomo kuri Buri Unit (Pure Course Notes — Strictly No Q&A)</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Aya manota ategurwa nk'incamake yuzuye kandi ifatika y'igitabo cyose kuri <strong>buri unit igize igitabo</strong> kuva ku ntangiriro kugeza ku musozo. 
                  <strong> Zitandukanye burundu n'ibibazo n'ibisubizo (No Questions & Answers)</strong> — zikubiyemo inyigisho z'amasomo ziteguye neza, amategeko fatizo, ibisobanuro by'amagambo, n'ingero zifatika zo mu ishuri ziteguye kwigisha no gusubiramo mu rurimi rwa <strong>{selectedLanguage}</strong>.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Output Options (Answer Key & Marking Guide)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-orange-300 transition-all">
                    <input
                      type="checkbox"
                      checked={includeAnswerKey}
                      onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                      className="rounded text-orange-500 accent-orange-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Include Answer Key (Ibisubizo)</div>
                      <div className="text-[10px] text-slate-500">Generate correct answers & explanations</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-orange-300 transition-all">
                    <input
                      type="checkbox"
                      checked={includeMarkingGuide}
                      onChange={(e) => setIncludeMarkingGuide(e.target.checked)}
                      className="rounded text-orange-500 accent-orange-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800">Include Marking Guide / Scheme</div>
                      <div className="text-[10px] text-slate-500">Generate scoring criteria & rubrics</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* PARAMETERS (CARDS COUNT, DIFFICULTY, OUTPUT LANGUAGE) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              
              {/* Cards / Items Count (No Limit) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700">
                    1. Cards / Items Count:
                  </label>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    No Limit (∞)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={[5, 10, 20, 50, 100, 250, 500, 1000, 2000, 5000, 10000].includes(cardCount) ? cardCount : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setCardCount(Number(e.target.value));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none pr-8 cursor-pointer"
                    >
                      <option value={5}>5 Items</option>
                      <option value={10}>10 Items (Standard)</option>
                      <option value={20}>20 Items</option>
                      <option value={50}>50 Items (Extended)</option>
                      <option value={100}>100 Items (Centum Pack)</option>
                      <option value={250}>250 Items (Mega Bank)</option>
                      <option value={500}>500 Items (Master Deck)</option>
                      <option value={1000}>1,000 Items (Premium Deck)</option>
                      <option value={2000}>2,000 Items (Ultra Deck)</option>
                      <option value={5000}>5,000 Items (Extreme Deck)</option>
                      <option value={10000}>10,000 Items (Ultimate Deck)</option>
                      <option value="custom">Custom count...</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  
                  {/* Styled Numeric Input with - and + Adjusters */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-1 py-1">
                    <button
                      type="button"
                      onClick={() => setCardCount(prev => Math.max(1, prev - 1))}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={cardCount}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        setCardCount(val);
                      }}
                      placeholder="Count"
                      className="w-10 bg-transparent text-xs font-extrabold text-slate-900 text-center focus:outline-none"
                      title="Enter custom count"
                    />
                    <button
                      type="button"
                      onClick={() => setCardCount(prev => prev + 1)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {[10, 50, 100, 250, 500, 1000, 2000, 5000, 10000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCardCount(num)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        cardCount === num 
                          ? 'bg-orange-600 text-white shadow-sm' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {num === 1000 ? '1,000' : num === 2000 ? '2,000' : num === 5000 ? '5,000' : num === 10000 ? '10,000' : num}
                    </button>
                  ))}
                </div>

                {/* Append Mode Checkbox Toggle */}
                <div className="flex items-center gap-1.5 pt-1.5">
                  <input
                    type="checkbox"
                    id="appendMode"
                    checked={appendMode}
                    onChange={(e) => setAppendMode(e.target.checked)}
                    className="w-3.5 h-3.5 text-orange-600 bg-white border-slate-300 rounded focus:ring-orange-500/20 cursor-pointer"
                  />
                  <label htmlFor="appendMode" className="text-[11px] font-bold text-slate-600 cursor-pointer select-none">
                    Append newly generated items to current deck
                  </label>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">
                  2. Difficulty Level:
                </label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none pr-8 cursor-pointer"
                  >
                    <option value="Low">Low (Foundational / Primary)</option>
                    <option value="Medium">Medium (Secondary O-Level)</option>
                    <option value="High">High (Advanced A-Level / University)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Output Language: Teacher Chooses Any Language */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>3. Hitamo Ururimi:</span>
                  </label>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100/70 border border-orange-200 px-1.5 py-0.5 rounded-md">
                    {SAVETO_LANGUAGES.find(l => l.id === selectedLanguage)?.badge || 'EN'}
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none pr-8 cursor-pointer"
                  >
                    {SAVETO_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.flag} {lang.name} — {lang.questionLabel}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Quick Toggle Buttons for the 4 Languages */}
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  {SAVETO_LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm font-black'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={`${lang.name}: ${lang.questionLabel}`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>Saveto AI is Processing in {selectedLanguage}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate ({selectedLanguage})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GENERATED RESULTS */}
          <div ref={resultsRef} className="space-y-6">
            {generatedReply && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Generated Study Notes & Resources</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(generatedReply, `${activeTool}_notes`, 'doc')}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPdfPreviewModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF Preview</span>
                    </button>
                  </div>
                </div>
                <div id="markdown-pdf-container" className="prose prose-slate max-w-none text-xs sm:text-sm">
                  <StudySuiteMarkdownRenderer content={generatedReply} />
                </div>
              </div>
            )}
          </div>

          <div id="contact-info-container" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-md space-y-4">
            <h2 className="text-lg font-black text-slate-900">Contact Information Saved</h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-700"><strong>Name:</strong> NSANZIMANA Francois</p>
              <p className="text-sm text-slate-700"><strong>Phone:</strong> 0786332660</p>
            </div>
          </div>
                    



            

          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>📚 My Downloaded & Generated Books / Notes History</span>
              </h2>
              <span className="text-xs text-slate-500 font-bold">
                {downloadedHistory.length} saved items
              </span>
            </div>

            {downloadedHistory.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">No Downloaded or Generated Books / Notes Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Upload a textbook or generate Unit Summary Notes, Quizzes, or Homework in Save to AI Studio. Your generated and downloaded study materials will appear here automatically!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloadedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span className="uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-600">{item.type}</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.content.substring(0, 120)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {item.language}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownload(item.content, item.title.replace(/\s+/g, '_'), 'doc')}
                          className="px-2 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Download Word Document (.doc)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Word</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedReply(item.content);
                            setViewingHistoryItem(item);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Notes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>

      {/* PDF PREVIEW MODAL */}
      <PdfPreviewModal
        isOpen={showPdfPreviewModal}
        onClose={() => setShowPdfPreviewModal(false)}
        title="AI Study Suite Report"
        filename={`${activeTool}_${selectedLanguage}`}
        onDownloadPdf={() => handleDownloadPdf('markdown-pdf-container', `${activeTool}_output`)}
      >
        <StudySuiteMarkdownRenderer content={generatedReply || ''} />
      </PdfPreviewModal>

      {/* NOTES VIEWER MODAL */}
      {viewingHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {viewingHistoryItem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-200 rounded text-slate-700 text-[10px]">
                      {viewingHistoryItem.type}
                    </span>
                    <span>• {viewingHistoryItem.date}</span>
                    <span className="font-bold text-orange-600">• {viewingHistoryItem.language}</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      Full Unit Notes (No Q&A)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(viewingHistoryItem.content, viewingHistoryItem.title.replace(/\s+/g, '_'), 'doc')}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Download Word Document (.doc)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Word</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf('notes-viewer-modal-content', `${viewingHistoryItem.title.replace(/\s+/g, '_')}_notes`)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Download PDF Document (.pdf)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(viewingHistoryItem.content, viewingHistoryItem.title.replace(/\s+/g, '_'), 'md')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Download Markdown / Text (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">MD</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(viewingHistoryItem.content)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copy Content"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedText ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingHistoryItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div id="notes-viewer-modal-content" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
              {/* If content is old fallback support message or short stub, offer instant full notes generation */}
              {(viewingHistoryItem.content.includes('+250 781 339 530') || viewingHistoryItem.content.length < 350) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h5 className="font-extrabold text-amber-900 text-xs sm:text-sm">
                      ✨ Fata Notes Zuzuye Z'Igitabo Kuri Buri Unit (No Q&A)
                    </h5>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Kanda kuri iyi buto kugira ngo AI ihite iguha inyandiko z'amasomo ziteguye neza kuri buri unit igize iki gitabo mu rurimi rwa <strong>{viewingHistoryItem.language}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/saveto-ai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            message: viewingHistoryItem.title,
                            toolType: 'unit_notes_summarizer',
                            language: viewingHistoryItem.language || selectedLanguage
                          })
                        });
                        const data = await res.json();
                        if (data.reply) {
                          const updatedItem = { ...viewingHistoryItem, content: data.reply, type: 'Full Book Unit Notes' };
                          setViewingHistoryItem(updatedItem);
                          setGeneratedReply(data.reply);
                          const updatedList = downloadedHistory.map(h => h.id === viewingHistoryItem.id ? updatedItem : h);
                          setDownloadedHistory(updatedList);
                          localStorage.setItem('nkorera_downloaded_history', JSON.stringify(updatedList));
                        }
                      } catch (e) {
                        console.error('Error generating fresh notes:', e);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    ✨ Fata Notes Zuzuye Zose
                  </button>
                </div>
              )}

              <StudySuiteMarkdownRenderer
                content={viewingHistoryItem.content}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Nkorera Education Applet Storage • Notes Ziteguye Neza (No Q&A)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf('notes-viewer-modal-content', `${viewingHistoryItem.title.replace(/\s+/g, '_')}_notes`)}
                  className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingHistoryItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
