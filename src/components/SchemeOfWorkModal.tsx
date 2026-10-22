import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Save, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  FolderOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Search,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { SchemeOfWorkData, SchemeOfWorkRow } from '../types';
import { 
  saveSchemeOfWorkToFirestore, 
  loadSchemesOfWorkFromFirestore, 
  deleteSchemeOfWorkFromFirestore 
} from '../utils/firebase';
import { exportSchemeOfWorkToPdf } from '../utils/jspdfExporter';
import { 
  RWANDA_EDUCATION_CURRICULUM, 
  ALL_RWANDA_SUBJECT_NAMES, 
  RWANDA_COMBINATIONS_AND_STREAMS,
  type RwandaSubjectItem 
} from '../data/rwandaCurriculumSubjects';
import { 
  getSchemeSubscriptionStatus, 
  checkCanCreateSchemeOfWork, 
  consumeSchemeOfWork, 
  SubscriptionData
} from '../utils/subscription';
import { SubscriptionStatusModal } from './SubscriptionStatusModal';

export type SchemeLanguage = 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili';

// 1. OFFICIAL ENGLISH SAMPLE
export const DEFAULT_ENGLISH_SCHEME: SchemeOfWorkData = {
  id: 'sow_en_official_sample',
  academicYear: '2025-2026',
  term: 'Term 1',
  schoolName: 'GS Nkorera / Groupe Scolaire',
  subject: 'Geography',
  teacherName: 'NKUNDIMANA Theogene',
  className: 'Senior 2 (S2)',
  combination: 'General / Core',
  periodsPerWeek: '4 periods per week',
  language: 'English',
  rows: [
    {
      id: 'row_en_1',
      weekNumber: 1,
      dates: 'Week 1 (08/09 - 12/09)',
      unitNumber: 'Unit 1',
      unitTitle: 'Soil Erosion in Rwanda',
      lessonNumber: 'Lesson 1',
      lessonTitle: 'Meaning, concepts and factors of soil erosion',
      evaluation: 'Oral diagnostic questioning on soil concepts and slate definitions',
      learningObjectives: 'Knowledge: Define soil erosion and state its main factors. Skills: Identify eroded areas in local surroundings. Attitudes: Appreciate environmental conservation.',
      keyUnitCompetence: 'To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.',
      teachingMethods: 'Interactive guided inquiry, Think-Pair-Share, and brainstorm of local examples',
      evaluationProcedures: 'Formative diagnostic questioning, pair presentations, slate verification',
      resourcesAndReferences: "REB Approved Geography Senior 2 Student Book (Pages 12-18), Teacher's Guide Unit 1, local soil samples, charts",
      observations: 'All learners actively engaged; formative assessment met by 92% of students.'
    },
    {
      id: 'row_en_2',
      weekNumber: 1,
      dates: 'Week 1 (08/09 - 12/09)',
      unitNumber: 'Unit 1',
      unitTitle: 'Soil Erosion in Rwanda',
      lessonNumber: 'Lesson 2',
      lessonTitle: 'Types of soil erosion (Sheet, Rill, Gully, and Splash erosion)',
      evaluation: 'Group classification exercise and whiteboard diagram matching',
      learningObjectives: 'Knowledge: Differentiate sheet, rill, gully and splash erosion. Skills: Sketch distinct erosion patterns accurately. Attitudes: Show responsibility in land preservation.',
      keyUnitCompetence: 'To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.',
      teachingMethods: 'Visual image analysis, cooperative group work, and chalkboard illustration',
      evaluationProcedures: 'Peer review of group diagrams, oral quiz, individual exit ticket',
      resourcesAndReferences: 'Geography S2 Student Book (Pages 19-24), visual photo flashcards of Rwandan hillsides, diagrams',
      observations: 'Good grasp of gully vs rill erosion; visual aids supported inclusion.'
    },
    {
      id: 'row_en_3',
      weekNumber: 2,
      dates: 'Week 2 (15/09 - 19/09)',
      unitNumber: 'Unit 1',
      unitTitle: 'Soil Erosion in Rwanda',
      lessonNumber: 'Lesson 3',
      lessonTitle: 'Human and physical causes of accelerated soil erosion',
      evaluation: 'Case study analysis and local environmental debate',
      learningObjectives: 'Knowledge: Outline deforestation, overcultivation, steep slopes, and rainfall effects. Skills: Analyze cause-and-effect relationships. Attitudes: Advocate for sustainable land management.',
      keyUnitCompetence: 'To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.',
      teachingMethods: 'Case study investigation, small group debate, problem-solving scenario',
      evaluationProcedures: 'Group summary reports, diagnostic quiz on causes, teacher rubrics',
      resourcesAndReferences: 'REB Geography S2 Textbook (Pages 25-30), Rwanda Environment Management Authority (REMA) case studies',
      observations: 'Debate stimulated critical thinking and environmental consciousness.'
    },
    {
      id: 'row_en_4',
      weekNumber: 2,
      dates: 'Week 2 (15/09 - 19/09)',
      unitNumber: 'Unit 1',
      unitTitle: 'Soil Erosion in Rwanda',
      lessonNumber: 'Lesson 4',
      lessonTitle: 'Soil conservation techniques in Rwanda (Terracing, Agroforestry, Mulching)',
      evaluation: 'Action plan design and model demonstration',
      learningObjectives: 'Knowledge: Explain radical and progressive terracing, mulching and afforestation. Skills: Propose appropriate conservation strategies for hilly terrains. Attitudes: Promote community Umuganda conservation.',
      keyUnitCompetence: 'To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.',
      teachingMethods: 'Demonstration with concrete soil trays, cooperative learning, diagram inquiry',
      evaluationProcedures: 'Worksheet calculation of slope suitability, peer assessment of group proposals',
      resourcesAndReferences: 'Geography S2 Student Book (Pages 31-38), model terracing box, local organic mulch materials',
      observations: 'High student enthusiasm; connection made with national green policies.'
    },
    {
      id: 'row_en_5',
      weekNumber: 3,
      dates: 'Week 3 (22/09 - 26/09)',
      unitNumber: 'Unit 1',
      unitTitle: 'Soil Erosion in Rwanda',
      lessonNumber: 'Lesson 5 + Evaluation',
      lessonTitle: 'End of Unit Assessment & Remedial Consolidation on Soil Conservation',
      evaluation: 'Summative Unit test (written assessment + practical problem solving)',
      learningObjectives: 'Knowledge: Synthesize unit concepts comprehensively. Skills: Evaluate and solve real-world land degradation problems. Attitudes: Commit to community environmental stewardship.',
      keyUnitCompetence: 'To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.',
      teachingMethods: 'Individual written assessment followed by differentiated peer remedial stations',
      evaluationProcedures: 'Standardized REB end-of-unit test (marked /20), remedial diagnostic rubrics',
      resourcesAndReferences: 'End of Unit Assessment sheet from REB S2 Syllabus, remedial worksheets, marking guide',
      observations: '95% passed key competence; 3 struggling learners assigned remedial practice.'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 2. OFFICIAL KINYARWANDA SAMPLE
export const DEFAULT_KINYARWANDA_SCHEME: SchemeOfWorkData = {
  id: 'sow_rw_official_sample',
  academicYear: '2025-2026',
  term: 'Igihembwe cya 1',
  schoolName: 'GS Nkorera / Groupe Scolaire',
  subject: 'Ikinyarwanda',
  teacherName: 'NKUNDIMANA Theogene',
  className: 'Umwaka wa 2 (S2)',
  combination: 'Icyiciro rusange',
  periodsPerWeek: 'Amasaha 4 mu cyumweru',
  language: 'Kinyarwanda',
  rows: [
    {
      id: 'row_rw_1',
      weekNumber: 1,
      dates: 'Icyumweru cya 1 (08/09 - 12/09)',
      unitNumber: 'Umutwe wa 1',
      unitTitle: 'Ikibonezamvugo: Inshoza n\'imiterere y\'izina n\'uturango twaryo',
      lessonNumber: 'Isomo rya 1',
      lessonTitle: 'Inshoza y\'izina n\'ingero z\'amazina atandukanye mu Kinyarwanda',
      evaluation: 'Ibibazo byo mu kanwa, gusobanura izina no kuryandika ku kibaho cyangwa urupapuro',
      learningObjectives: 'Ubumenyi: Gusobanura inshoza y\'izina mu Kinyarwanda. Ubushobozi: Gutahura amazina mu nteruro zitandukanye. Imyifatire: Gukunda no kubungabunga ururimi rw\'Ikinyarwanda.',
      keyUnitCompetence: 'Gusesengura imiterere n\'ubwoko bw\'amazina mu Kinyarwanda no kuyakoresha neza mu nteruro ziboneye.',
      teachingMethods: 'Uburyo bwo kungurana ibitekerezo, itsinda rito, gusesengura interuro zanditse ku kibaho',
      evaluationProcedures: 'Ibibazo n\'ibisubizo byo mu kanwa, kwandika ingero ku mbaho z\'abanyeshuri (slates)',
      resourcesAndReferences: "Igitabo cy'umunyeshuri cy'Ikinyarwanda S2 (REB), Igitabo cy'umwarimu, ikibaho, amakarita y'amagambo",
      observations: 'Abanyeshuri bose bitabiriye neza; 94% basobanukiwe inshoza y\'izina.'
    },
    {
      id: 'row_rw_2',
      weekNumber: 1,
      dates: 'Icyumweru cya 1 (08/09 - 12/09)',
      unitNumber: 'Umutwe wa 1',
      unitTitle: 'Ikibonezamvugo: Inshoza n\'imiterere y\'izina n\'uturango twaryo',
      lessonNumber: 'Isomo rya 2',
      lessonTitle: 'Ubwoko bw\'amazina: Amazina bwite n\'amazina rusange',
      evaluation: 'Gutoranya no gutandukanya amazina bwite n\'amazina rusange mu mwandiko muto',
      learningObjectives: 'Ubumenyi: Gutandukanya izina bwite n\'izina rusange. Ubushobozi: Gukora imbonerahamwe igaragaza ubwoko bw\'amazina. Imyifatire: Kwitwararika mu kwandika inyuguti nkuru ku mazina bwite.',
      keyUnitCompetence: 'Gusesengura imiterere n\'ubwoko bw\'amazina mu Kinyarwanda no kuyakoresha neza mu nteruro ziboneye.',
      teachingMethods: 'Gukorera mu matsinda y\'ubufatanye, kwigira ku ngero zifatika z\'ahantu n\'abantu',
      evaluationProcedures: 'Isuzuma ry\'imbonerahamwe zakozwe mu matsinda, ikizamini kigufi cyo ku kibaho',
      resourcesAndReferences: "Igitabo cy'umunyeshuri cy'Ikinyarwanda S2 (Ipaji 15-20), inyandiko z'inkuru ngufi",
      observations: 'Batandukanyije neza amazina bwite n\'amazina rusange hakoreshejwe amakarita.'
    },
    {
      id: 'row_rw_3',
      weekNumber: 2,
      dates: 'Icyumweru cya 2 (15/09 - 19/09)',
      unitNumber: 'Umutwe wa 1',
      unitTitle: 'Ikibonezamvugo: Inshoza n\'imiterere y\'izina n\'uturango twaryo',
      lessonNumber: 'Isomo rya 3',
      lessonTitle: 'Uturango tw\'izina: Indanganteko, Indangazingiro n\'Uruyenzi',
      evaluation: 'Gusesengura uturango tw\'amazina atandukanye no gutandukanya indanganteko n\'uruyenzi',
      learningObjectives: 'Ubumenyi: Kurondora uturango tw\'izina. Ubushobozi: Gusesengura amagambo ashingiye ku ngingo z\'ikibonezamvugo. Imyifatire: Gushishoza mu gusesengura imyandikire y\'amagambo.',
      keyUnitCompetence: 'Gusesengura imiterere n\'ubwoko bw\'amazina mu Kinyarwanda no kuyakoresha neza mu nteruro ziboneye.',
      teachingMethods: 'Gusesengura amagambo mu matsinda, kwerekana ingero zafatishijwe ifishi y\'ikibonezamvugo',
      evaluationProcedures: 'Umwitozo wo gusesengura ku rupapuro rw\'umunyeshuri, gusuzumana hagati yabo',
      resourcesAndReferences: "Igitabo cy'Ikinyarwanda S2 (REB), ifishi y'isesengura ry'ikibonezamvugo",
      observations: 'Amasomo agenewe gusubiramo yateguwe ku banyeshuri bagorwa no gutandukanya uruyenzi.'
    },
    {
      id: 'row_rw_4',
      weekNumber: 2,
      dates: 'Icyumweru cya 2 (15/09 - 19/09)',
      unitNumber: 'Umutwe wa 1',
      unitTitle: 'Ikibonezamvugo: Inshoza n\'imiterere y\'izina n\'uturango twaryo',
      lessonNumber: 'Isomo rya 4',
      lessonTitle: 'Inteko z\'amazina mu Kinyarwanda (Kuva ku nteko ya 1 kugeza ku nteko ya 16)',
      evaluation: 'Gushyira amazina mu nteko zayo no kugaragaza indanganteko zikwiranye nazo',
      learningObjectives: 'Ubumenyi: Kumenya inteko z\'amazina zose z\'Ikinyarwanda. Ubushobozi: Guhuza izina n\'inteko yaryo nyayo. Imyifatire: Kwishimira ubukungu n\'ubuhanga bw\'Ikinyarwanda.',
      keyUnitCompetence: 'Gusesengura imiterere n\'ubwoko bw\'amazina mu Kinyarwanda no kuyakoresha neza mu nteruro ziboneye.',
      teachingMethods: 'Gukoresha imbonerahamwe y\'inteko z\'amazina, umukino wo guhuza amakarita y\'inteko',
      evaluationProcedures: 'Imyitozo yo gukosora interuro, isuzuma ryanditse ry\'iminota 10',
      resourcesAndReferences: "Imbonerahamwe nini y'inteko z'amazina, Igitabo cy'umunyeshuri S2 (REB)",
      observations: 'Imbonerahamwe y\'inteko yafashije cyane mu kumva inteko zigoye nka 15 na 16.'
    },
    {
      id: 'row_rw_5',
      weekNumber: 3,
      dates: 'Icyumweru cya 3 (22/09 - 26/09)',
      unitNumber: 'Umutwe wa 1',
      unitTitle: 'Ikibonezamvugo: Inshoza n\'imiterere y\'izina n\'uturango twaryo',
      lessonNumber: 'Isomo rya 5 + Isuzuma',
      lessonTitle: 'Isuzuma risoza Umutwe wa 1 n\'imyitozo yo gukosora no kunoza imyandikire',
      evaluation: 'Isuzuma risoza umutwe wa 1 ryanditse kuri amanota 20',
      learningObjectives: 'Ubumenyi: Kugaragaza ubumenyi bwose bwakiriwe mu mutwe wa 1. Ubushobozi: Kwandika interuro n\'inyandiko zikurikije amategeko y\'imyandikire y\'Ikinyarwanda. Imyifatire: Kwigirira icyizere mu bizamini.',
      keyUnitCompetence: 'Gusesengura imiterere n\'ubwoko bw\'amazina mu Kinyarwanda no kuyakoresha neza mu nteruro ziboneye.',
      teachingMethods: 'Isuzuma ryanditse ry\'umuntu ku giti cye, gukosorana nyuma y\'isuzuma no gufasha abatsinzwe',
      evaluationProcedures: 'Ikizamini gisoza umutwe cyatanzwe na REB kuri 20, gahunda yo gufasha abafite intege nke',
      resourcesAndReferences: "Urupapuro rw'isuzuma risoza umutwe wa 1, amabwiriza y'imyandikire y'Ikinyarwanda (RALC/REB)",
      observations: '91% bageze ku ntego y\'ubushobozi bw\'ingenzi; abasigaye bazahabwa umwitozo ngororangingo.'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 3. OFFICIAL FRANÇAIS SAMPLE
export const DEFAULT_FRENCH_SCHEME: SchemeOfWorkData = {
  id: 'sow_fr_official_sample',
  academicYear: '2025-2026',
  term: 'Trimestre 1',
  schoolName: 'GS Nkorera / Groupe Scolaire',
  subject: 'Français',
  teacherName: 'NKUNDIMANA Theogene',
  className: 'Senior 2 (S2)',
  combination: 'Tronc Commun',
  periodsPerWeek: '4 périodes par semaine',
  language: 'Français',
  rows: [
    {
      id: 'row_fr_1',
      weekNumber: 1,
      dates: 'Semaine 1 (08/09 - 12/09)',
      unitNumber: 'Unité 1',
      unitTitle: 'La communication orale et la description des lieux et paysages',
      lessonNumber: 'Leçon 1',
      lessonTitle: 'Vocabulaire de la description physique et géographique d\'une région',
      evaluation: 'Questions orales de compréhension et identification du lexique descriptif',
      learningObjectives: 'Savoirs: Définir et identifier le vocabulaire thématique du paysage. Savoir-faire: Décrire oralement un relief ou un village rwandais. Attitudes: Apprécier la beauté naturelle et environnementale.',
      keyUnitCompetence: 'S\'exprimer avec clarté et précision pour décrire des lieux, des personnes et des événements en français standard.',
      teachingMethods: 'Démarche communicative active, travail en binômes, remue-méninges à partir d\'images',
      evaluationProcedures: 'Évaluation formative diagnostique, restitution orale guidée, fiches d\'auto-évaluation',
      resourcesAndReferences: "Manuel de Français Senior 2 approuvé par REB (Pages 10-16), Guide de l'enseignant Unité 1, affiches",
      observations: 'Participation très active des apprenants; bonne maîtrise du lexique de base.'
    },
    {
      id: 'row_fr_2',
      weekNumber: 1,
      dates: 'Semaine 1 (08/09 - 12/09)',
      unitNumber: 'Unité 1',
      unitTitle: 'La communication orale et la description des lieux et paysages',
      lessonNumber: 'Leçon 2',
      lessonTitle: 'Les adjectifs qualificatifs et leurs accords dans la description',
      evaluation: 'Exercices d\'accord d\'adjectifs au tableau et fiches d\'exercices individuelles',
      learningObjectives: 'Savoirs: Identifier le genre et le nombre des adjectifs. Savoir-faire: Accorder correctement les adjectifs qualificatifs dans une phrase. Attitudes: Faire preuve de rigueur grammaticale.',
      keyUnitCompetence: 'S\'exprimer avec clarté et précision pour décrire des lieux, des personnes et des événements en français standard.',
      teachingMethods: 'Observation de corpus, formulation collective de règles, exercices d\'application en sous-groupes',
      evaluationProcedures: 'Correction croisée entre pairs, mini-test au tableau noir, vérification sur ardoises',
      resourcesAndReferences: 'Manuel de Français S2 (Pages 17-22), tableau de grammaire, étiquettes de mots',
      observations: 'Les accords irréguliers (ex: beau/belle, vieux/vieille) ont été bien assimilés.'
    },
    {
      id: 'row_fr_3',
      weekNumber: 2,
      dates: 'Semaine 2 (15/09 - 19/09)',
      unitNumber: 'Unité 1',
      unitTitle: 'La communication orale et la description des lieux et paysages',
      lessonNumber: 'Leçon 3',
      lessonTitle: 'Les connecteurs spatiaux (à gauche, au sommet, au premier plan, en arrière-plan)',
      evaluation: 'Production d\'un paragraphe descriptif intégrant au moins 4 connecteurs spatiaux',
      learningObjectives: 'Savoirs: Reconnaître les indicateurs spatiaux. Savoir-faire: Structurer une description spatiale cohérente. Attitudes: Développer le sens de l\'orientation et de l\'observation.',
      keyUnitCompetence: 'S\'exprimer avec clarté et précision pour décrire des lieux, des personnes et des événements en français standard.',
      teachingMethods: 'Jeu de rôle descriptif ("Guide touristique"), travail collaboratif, schéma au tableau',
      evaluationProcedures: 'Grille critériée d\'expression écrite, rétroaction immédiate de l\'enseignant',
      resourcesAndReferences: 'Photographies de parcs nationaux rwandais (Volcans, Akagera, Nyungwe), fiches de vocabulaire',
      observations: 'La mise en situation de guide touristique a stimulé la créativité et l\'aisance.'
    },
    {
      id: 'row_fr_4',
      weekNumber: 2,
      dates: 'Semaine 2 (15/09 - 19/09)',
      unitNumber: 'Unité 1',
      unitTitle: 'La communication orale et la description des lieux et paysages',
      lessonNumber: 'Leçon 4',
      lessonTitle: 'L\'imparfait de l\'indicatif à valeur descriptive',
      evaluation: 'Transformation de phrases au présent vers l\'imparfait descriptif',
      learningObjectives: 'Savoirs: Connaître les terminaisons régulières de l\'imparfait (-ais, -ais, -ait, -ions, -iez, -aient). Savoir-faire: Conjuguer et employer l\'imparfait dans un récit descriptif. Attitudes: Valoriser l\'expression écrite soignée.',
      keyUnitCompetence: 'S\'exprimer avec clarté et précision pour décrire des lieux, des personnes et des événements en français standard.',
      teachingMethods: 'Analyse comparative de textes, travail dirigé sur la morphologie des verbes, dictée flash',
      evaluationProcedures: 'Dictée ciblée de 3 phrases, correction collégiale au tableau, exercices de synthèse',
      resourcesAndReferences: 'Manuel de Français S2 (Pages 23-30), tableau des conjugaisons usuelles',
      observations: 'Bonne différenciation entre action ponctuelle et description continue à l\'imparfait.'
    },
    {
      id: 'row_fr_5',
      weekNumber: 3,
      dates: 'Semaine 3 (22/09 - 26/09)',
      unitNumber: 'Unité 1',
      unitTitle: 'La communication orale et la description des lieux et paysages',
      lessonNumber: 'Leçon 5 + Évaluation',
      lessonTitle: 'Évaluation sommative de l\'Unité 1 et remédiation pédagogique différenciée',
      evaluation: 'Test sommatif écrit de fin d\'unité noté sur 20 points (Compréhension + Production écrite)',
      learningObjectives: 'Savoirs: Mobiliser l\'ensemble des acquis linguistiques de l\'unité. Savoir-faire: Rédiger un texte descriptif autonome de 80 mots. Attitudes: Faire preuve d\'autonomie et d\'honnêteté intellectuelle.',
      keyUnitCompetence: 'S\'exprimer avec clarté et précision pour décrire des lieux, des personnes et des événements en français standard.',
      teachingMethods: 'Épreuve individuelle sous surveillance, suivie d\'ateliers de remédiation en petits groupes',
      evaluationProcedures: 'Barème officiel REB sur 20 points (Pertinence, cohérence, correction de la langue)',
      resourcesAndReferences: 'Épreuve d\'évaluation sommative de l\'Unité 1, fiches de remédiation et de consolidation',
      observations: '92% de réussite; séances de soutien prévues pour les apprenants en difficulté d\'accord.'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 4. OFFICIAL KISWAHILI SAMPLE
export const DEFAULT_KISWAHILI_SCHEME: SchemeOfWorkData = {
  id: 'sow_sw_official_sample',
  academicYear: '2025-2026',
  term: 'Muhula wa 1',
  schoolName: 'GS Nkorera / Groupe Scolaire',
  subject: 'Kiswahili',
  teacherName: 'NKUNDIMANA Theogene',
  className: 'Senior 2 (S2)',
  combination: 'Mkondo Mkuu',
  periodsPerWeek: 'Vipindi 4 kwa wiki',
  language: 'Kiswahili',
  rows: [
    {
      id: 'row_sw_1',
      weekNumber: 1,
      dates: 'Wiki ya 1 (08/09 - 12/09)',
      unitNumber: 'Sura ya 1',
      unitTitle: 'Sarufi na Matumizi ya Lugha: Ngeli za Nomino na Upatanisho wa Kisarufi',
      lessonNumber: 'Somo la 1',
      lessonTitle: 'Dhana ya Ngeli za Nomino na Uainishaji wake katika Kiswahili sanifu',
      evaluation: 'Maswali ya mdomo ya uchunguzi na kuorodhesha mifano ya ngeli ubaoni',
      learningObjectives: 'Maarifa: Kufafanua dhana ya ngeli za nomino. Stadi: Kutenga nomino mbalimbali kulingana na ngeli zake. Mitazamo: Kuthamini umuhimu wa kusanifisha lugha ya Kiswahili.',
      keyUnitCompetence: 'Kutambua, kuainisha na kutumia ngeli za nomino kwa usahihi katika mawasiliano ya kila siku.',
      teachingMethods: 'Njia shirikishi ya maswali na majibu, majadiliano katika vikundi vidogo, kadi za maneno',
      evaluationProcedures: 'Tathmini endelevu ya mdomo, uwasilishaji wa vikundi, zoezi la ubaoni',
      resourcesAndReferences: "Kitabu cha Mwanafunzi cha Kiswahili S2 (REB Kurasa 10-17), Mwongozo wa Mwalimu, Chati ya Ngeli",
      observations: 'Wanafunzi wote wameshiriki kikamilifu; 93% wameelewa maana ya ngeli za nomino.'
    },
    {
      id: 'row_sw_2',
      weekNumber: 1,
      dates: 'Wiki ya 1 (08/09 - 12/09)',
      unitNumber: 'Sura ya 1',
      unitTitle: 'Sarufi na Matumizi ya Lugha: Ngeli za Nomino na Upatanisho wa Kisarufi',
      lessonNumber: 'Somo la 2',
      lessonTitle: 'Ngeli ya A-WA (Watu na Wanyama): Umoja na Wingi',
      evaluation: 'Kugeuza sentensi kutoka umoja kwenda wingi katika ngeli ya A-WA',
      learningObjectives: 'Maarifa: Kutambua viambishi vya ngeli ya A-WA (yu-/a- na wa-). Stadi: Kutunga sentensi sahihi zenye upatanisho wa kisarufi. Mitazamo: Kuonyesha umakini wakati wa kutunga sentensi.',
      keyUnitCompetence: 'Kutambua, kuainisha na kutumia ngeli za nomino kwa usahihi katika mawasiliano ya kila siku.',
      teachingMethods: 'Uchambuzi wa mifano halisi, kazi ya jozi (Think-Pair-Share), ujenzi wa sentensi',
      evaluationProcedures: 'Kusahihishana wenyewe kwa wenyewe (Peer assessment), zoezi fupi la mwandiko',
      resourcesAndReferences: 'Kitabu cha Kiswahili S2 (Kurasa 18-24), orodha ya nomino za viumbe hai',
      observations: 'Upatanisho wa kisarufi wa ngeli ya A-WA umeeleweka vizuri sana.'
    },
    {
      id: 'row_sw_3',
      weekNumber: 2,
      dates: 'Wiki ya 2 (15/09 - 19/09)',
      unitNumber: 'Sura ya 1',
      unitTitle: 'Sarufi na Matumizi ya Lugha: Ngeli za Nomino na Upatanisho wa Kisarufi',
      lessonNumber: 'Somo la 3',
      lessonTitle: 'Ngeli ya KI-VI na Ngeli ya M-MI: Sifa na Matumizi Yake',
      evaluation: 'Kujaza jedwali la ngeli kwa kuweka nomino, vivumishi na vitenzi vinavyoambatana nazo',
      learningObjectives: 'Maarifa: Kueleza miundo ya ngeli za KI-VI na M-MI. Stadi: Kutofautisha viambishi vya KI-VI na M-MI. Mitazamo: Kukuza shauku ya kuandika Kiswahili sanifu bila makosa.',
      keyUnitCompetence: 'Kutambua, kuainisha na kutumia ngeli za nomino kwa usahihi katika mawasiliano ya kila siku.',
      teachingMethods: 'Mchezo wa kulinganisha kadi za ngeli (Card matching), kazi ya vikundi mezani',
      evaluationProcedures: 'Tathmini ya jedwali la kikundi, maswali ya chemsha bongo ya haraka',
      resourcesAndReferences: 'Chati yenye rangi inayoonyesha ngeli za KI-VI na M-MI, Kitabu cha Mwanafunzi S2 (REB)',
      observations: 'Wanafunzi wamefurahia mchezo wa kadi na wameweza kutenga ngeli hizi mbili.'
    },
    {
      id: 'row_sw_4',
      weekNumber: 2,
      dates: 'Wiki ya 2 (15/09 - 19/09)',
      unitNumber: 'Sura ya 1',
      unitTitle: 'Sarufi na Matumizi ya Lugha: Ngeli za Nomino na Upatanisho wa Kisarufi',
      lessonNumber: 'Somo la 4',
      lessonTitle: 'Upatanisho wa Kisarufi wa Vivumishi na Vitenzi katika Sentensi Mchanganyiko',
      evaluation: 'Kusahihisha sentensi zenye makosa ya upatanisho wa kisarufi',
      learningObjectives: 'Maarifa: Kutambua kanuni za upatanisho wa kisarufi. Stadi: Kurekebisha sentensi zisizo sahihi. Mitazamo: Kujenga mtazamo chanya wa kuongea na kuandika lugha fasaha.',
      keyUnitCompetence: 'Kutambua, kuainisha na kutumia ngeli za nomino kwa usahihi katika mawasiliano ya kila siku.',
      teachingMethods: 'Uchambuzi wa sentensi zenye makosa, mjadala wa wazi darasani, uandishi wa mwongozo',
      evaluationProcedures: 'Kazi binafsi ya uandishi katika madaftari, ukaguzi na maoni ya mwalimu',
      resourcesAndReferences: 'Kijitabu cha mazoezi ya sarufi ya Kiswahili S2 (REB Kurasa 25-32), mbao binafsi',
      observations: 'Kazi ya kurekebisha makosa imesaidia kuondoa mkanganyiko wa kawaida miongoni mwa wanafunzi.'
    },
    {
      id: 'row_sw_5',
      weekNumber: 3,
      dates: 'Wiki ya 3 (22/09 - 26/09)',
      unitNumber: 'Sura ya 1',
      unitTitle: 'Sarufi na Matumizi ya Lugha: Ngeli za Nomino na Upatanisho wa Kisarufi',
      lessonNumber: 'Somo la 5 + Tathmini',
      lessonTitle: 'Tathmini ya Mwisho wa Sura ya 1 na Mazoezi ya Urekebishaji (Remediation)',
      evaluation: 'Mtihani wa mwisho wa sura wa alama 20 (Maswali ya kuchagua na kutunga sentensi)',
      learningObjectives: 'Maarifa: Kujumuisha kanuni zote za ngeli na upatanisho zilizofundishwa. Stadi: Kujibu maswali ya mtihani kwa ufasaha. Mitazamo: Kujiamini na kudumisha uadilifu kitaaluma.',
      keyUnitCompetence: 'Kutambua, kuainisha na kutumia ngeli za nomino kwa usahihi katika mawasiliano ya kila siku.',
      teachingMethods: 'Mtihani wa kibinafsi ulioratibiwa, ukifuatiwa na vituo vya kurekebisha changamoto kwa wanafunzi wenye uhitaji',
      evaluationProcedures: 'Karatasi rasmi ya mtihani wa REB (Alama 20), rubriki za utambuzi wa viwango',
      resourcesAndReferences: 'Karatasi ya Mtihani wa Sura ya 1, mwongozo wa kusahihisha, mazoezi ya kuongeza maarifa',
      observations: 'Asilimia 94 ya wanafunzi wamefaulu umahiri mkuu; 3 wamepewa mazoezi ya ziada ya nyumbani.'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// UI TRANSLATION DICTIONARY (NO "Context" WORD)
export const SCHEME_UI_STRINGS = {
  English: {
    mainTitle: 'SCHEME OF WORK',
    subTitle: 'REB CBC OFFICIAL MATRIX',
    academicYear: 'Academic year:',
    term: 'Term:',
    school: 'School:',
    subject: 'Subject:',
    teacher: "Teacher's name:",
    classCombination: 'Class + Combination:',
    periodsPerWeek: 'Number of periods per week:',
    colDates: 'Dates/weeks',
    colLesson: 'Lesson title/periods',
    colObjectives: 'Learning objectives',
    colContentSummary: 'Content summary',
    colTeachingActivities: 'Teaching and learning activities and approaches',
    colLearningAids: 'Teaching and learning aids',
    colAssessment: 'Assessment and observation',
    colReferences: 'References',
    colRemarks: 'Weekly Remarks',
    colUnit: 'Unit title',
    colKeyCompetence: 'Key unit competence',
    action: 'Action',
    addLessonRow: 'Add Lesson Row (+)',
    saveScheme: 'Save Scheme',
    resetSample: 'Load English Syllabus Sample',
    downloadPdf: 'Download PDF (jsPDF)',
    print: 'Print',
    wordDoc: 'Word (.doc)',
    copyTable: 'Copy Table',
    copied: 'Copied!',
    aiGenerator: 'AI Generator',
    aiTitle: 'AI Scheme of Work Generator (REB Standard CBC)',
    aiDescription: 'Fill in the subject details and AI will generate the entire Scheme of Work matrix in English',
    generateBtn: 'Generate Scheme of Work Now',
    generatingBtn: 'AI is creating Scheme of Work...',
    scopeLabel: 'Generation Scope:',
    weeksLabel: 'Weeks to Generate:',
    singleUnit: 'Single Unit Scope',
    fullTerm: 'Full Term Scope',
    savedSchemesTab: 'Saved Schemes',
    studioTab: 'Studio & Sheet',
    noRows: 'No lesson rows yet. Click "Add Lesson Row" or generate with AI.',
    deleteConfirm: 'Are you sure you want to delete this Scheme of Work?',
    switchLanguagePrompt: 'Switched to English! The headers and template are now in English.',
    curriculumLevels: 'Curriculum Level:',
    browseSubjects: 'Browse Subject Catalog',
    quickPickSubject: 'Official Rwanda Subject Catalog',
    searchSubjectPlaceholder: 'Search any subject, combination or trade...',
    allLevels: 'All Levels',
    selectSubjectPrompt: 'Choose from official Rwanda Curriculum (REB / RTB / NESA):'
  },
  Kinyarwanda: {
    mainTitle: 'SCHEME OF WORK',
    subTitle: 'REB CBC OFFICIAL MATRIX',
    academicYear: 'Academic year:',
    term: 'Term:',
    school: 'School:',
    subject: 'Subject:',
    teacher: "Teacher's name:",
    classCombination: 'Class + Combination:',
    periodsPerWeek: 'Number of periods per week:',
    colDates: 'Dates/weeks',
    colLesson: 'Lesson title/periods',
    colObjectives: 'Learning objectives',
    colContentSummary: 'Content summary',
    colTeachingActivities: 'Teaching and learning activities and approaches',
    colLearningAids: 'Teaching and learning aids',
    colAssessment: 'Assessment and observation',
    colReferences: 'References',
    colRemarks: 'Weekly Remarks',
    colUnit: 'Unit title',
    colKeyCompetence: 'Key unit competence',
    action: 'Action',
    addLessonRow: 'Add Lesson Row (+)',
    saveScheme: 'Save Scheme',
    resetSample: 'Load English Syllabus Sample',
    downloadPdf: 'Download PDF (jsPDF)',
    print: 'Print',
    wordDoc: 'Word (.doc)',
    copyTable: 'Copy Table',
    copied: 'Copied!',
    aiGenerator: 'AI Generator',
    aiTitle: 'AI Scheme of Work Generator (REB Standard CBC)',
    aiDescription: 'Fill in the subject details and AI will generate the entire Scheme of Work matrix in English',
    generateBtn: 'Generate Scheme of Work Now',
    generatingBtn: 'AI is creating Scheme of Work...',
    scopeLabel: 'Generation Scope:',
    weeksLabel: 'Weeks to Generate:',
    singleUnit: 'Single Unit Scope',
    fullTerm: 'Full Term Scope',
    savedSchemesTab: 'Saved Schemes',
    studioTab: 'Studio & Sheet',
    noRows: 'No lesson rows yet. Click "Add Lesson Row" or generate with AI.',
    deleteConfirm: 'Are you sure you want to delete this Scheme of Work?',
    switchLanguagePrompt: 'Switched to English! The headers and template are now in English.',
    curriculumLevels: 'Curriculum Level:',
    browseSubjects: 'Browse Subject Catalog',
    quickPickSubject: 'Official Rwanda Subject Catalog',
    searchSubjectPlaceholder: 'Search any subject, combination or trade...',
    allLevels: 'All Levels',
    selectSubjectPrompt: 'Choose from official Rwanda Curriculum (REB / RTB / NESA):'
  },
  Français: {
    mainTitle: 'PLAN DE TRAVAIL PÉDAGOGIQUE',
    subTitle: 'REB CBC OFFICIAL MATRIX (FRANÇAIS)',
    academicYear: 'Année scolaire:',
    term: 'Trimestre:',
    school: 'École:',
    subject: 'Matière:',
    teacher: 'Enseignant:',
    classCombination: 'Classe & Section:',
    periodsPerWeek: 'Périodes par semaine:',
    colDates: 'Dates/Semaines',
    colLesson: 'Titre de leçon/Périodes',
    colObjectives: "Objectifs d'apprentissage",
    colContentSummary: 'Résumé du contenu',
    colTeachingActivities: "Activités et approches d'enseignement-apprentissage",
    colLearningAids: 'Supports didactiques',
    colAssessment: 'Évaluation et observation',
    colReferences: 'Références',
    colRemarks: 'Remarques hebdomadaires',
    colUnit: "Titre de l'unité",
    colKeyCompetence: "Compétence clé de l'unité",
    action: 'Action',
    addLessonRow: 'Ajouter une leçon (+)',
    saveScheme: 'Enregistrer le plan',
    resetSample: "Charger l'exemple de Français",
    downloadPdf: 'Télécharger PDF (jsPDF)',
    print: 'Imprimer',
    wordDoc: 'Word (.doc)',
    copyTable: 'Copier le tableau',
    copied: 'Copié !',
    aiGenerator: 'Générateur IA',
    aiTitle: 'Générateur de Plan de Travail par IA (Normes REB CBC)',
    aiDescription: "Renseignez les détails de la matière et l'IA générera l'intégralité de la matrice en français",
    generateBtn: 'Générer le plan de travail maintenant',
    generatingBtn: "L'IA génère le plan de travail...",
    scopeLabel: 'Portée de génération:',
    weeksLabel: 'Semaines à générer:',
    singleUnit: 'Une seule unité',
    fullTerm: 'Trimestre complet',
    savedSchemesTab: 'Plans enregistrés',
    studioTab: 'Studio & Tableau',
    noRows: "Aucune leçon pour l'instant. Cliquez sur \"Ajouter une leçon\" ou générez avec l'IA.",
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce plan de travail ?',
    switchLanguagePrompt: 'Passage au français effectué ! Les en-têtes et le modèle sont en français.',
    curriculumLevels: "Niveau d'enseignement:",
    browseSubjects: 'Parcourir les matières',
    quickPickSubject: 'Catalogue officiel des matières (REB / RTB)',
    searchSubjectPlaceholder: 'Rechercher une matière, une filière...',
    allLevels: 'Tous les niveaux',
    selectSubjectPrompt: 'Sélectionnez dans le programme officiel REB / RTB:'
  },
  Kiswahili: {
    mainTitle: 'MPANGO WA KAZI WA SOMO',
    subTitle: 'REB CBC OFFICIAL MATRIX (KISWAHILI)',
    academicYear: 'Mwaka wa masomo:',
    term: 'Muhula:',
    school: 'Shule:',
    subject: 'Somo:',
    teacher: 'Mwalimu:',
    classCombination: 'Darasa na Mchepuo:',
    periodsPerWeek: 'Vipindi kwa wiki:',
    colDates: 'Tarehe/Wiki',
    colLesson: 'Kichwa cha somo/Vipindi',
    colObjectives: 'Malengo ya kujifunza',
    colContentSummary: 'Muhtasari wa maudhui',
    colTeachingActivities: 'Shughuli na mbinu za kufundishia na kujifunzia',
    colLearningAids: 'Zana za kujifunzia',
    colAssessment: 'Tathmini na uchunguzi',
    colReferences: 'Marejeleo',
    colRemarks: 'Maoni ya wiki',
    colUnit: 'Jina la sura',
    colKeyCompetence: 'Umahiri mkuu wa sura',
    action: 'Kitendo',
    addLessonRow: 'Ongeza Somo (+)',
    saveScheme: 'Hifadhi Mpango (Save)',
    resetSample: 'Pakia Mfano wa Kiswahili',
    downloadPdf: 'Pakua PDF (jsPDF)',
    print: 'Chapa (Print)',
    wordDoc: 'Word (.doc)',
    copyTable: 'Nakili Jedwali',
    copied: 'Imenakiliwa!',
    aiGenerator: 'Jenereta ya AI',
    aiTitle: 'Jenereta ya Mpango wa Kazi ya AI (REB CBC)',
    aiDescription: 'Weka maelezo ya somo na AI itazalisha jedwali zima la mpango wa kazi kwa Kiswahili fasaha',
    generateBtn: 'Zalisha Mpango wa Kazi Sasa',
    generatingBtn: 'AI inatayarisha Mpango wa Kazi...',
    scopeLabel: 'Upeo wa Kizazi:',
    weeksLabel: 'Wiki za Kuzalisha:',
    singleUnit: 'Sura Moja (Single Unit)',
    fullTerm: 'Muhula Mzima (Full Term)',
    savedSchemesTab: 'Mipango Iliyohifadhiwa',
    studioTab: 'Studio na Jedwali',
    noRows: 'Bado hakuna somo lililowekwa. Bofya "Ongeza Somo" au zalisha kwa AI.',
    deleteConfirm: 'Je, una uhakika unataka kufuta Mpango huu wa Kazi?',
    switchLanguagePrompt: 'Umebadili kwenda Kiswahili! Vichwa na jedwali sasa viko katika Kiswahili.',
    curriculumLevels: 'Ngazi ya masomo:',
    browseSubjects: 'Tazama Masomo Yote',
    quickPickSubject: 'Orodha Rasmi ya Masomo (REB / RTB)',
    searchSubjectPlaceholder: 'Tafuta somo, mchepuo au fani...',
    allLevels: 'Ngazi Zote',
    selectSubjectPrompt: 'Chagua kutoka mtaala rasmi wa REB / RTB:'
  }
};

interface SchemeOfWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SchemeOfWorkData | null;
}

export const SchemeOfWorkModal: React.FC<SchemeOfWorkModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  // Current active language (English, Kinyarwanda, Français, Kiswahili)
  const [selectedLanguage, setSelectedLanguage] = useState<SchemeLanguage>('English');
  
  const [scheme, setScheme] = useState<SchemeOfWorkData>(initialData || DEFAULT_ENGLISH_SCHEME);
  const [savedSchemes, setSavedSchemes] = useState<SchemeOfWorkData[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
  
  // AI Generator Form States
  const [isAiFormOpen, setIsAiFormOpen] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiSchoolName, setAiSchoolName] = useState<string>(scheme.schoolName || 'GS Nkorera / Groupe Scolaire');
  const [aiAcademicYear, setAiAcademicYear] = useState<string>(scheme.academicYear || '2025-2026');
  const [aiTerm, setAiTerm] = useState<string>(scheme.term || 'Term 1');
  const [aiSubject, setAiSubject] = useState<string>(scheme.subject || 'Geography');
  const [aiTeacherName, setAiTeacherName] = useState<string>(scheme.teacherName || 'NKUNDIMANA Theogene');
  const [aiClassName, setAiClassName] = useState<string>(scheme.className || 'Senior 2 (S2)');
  const [aiCombination, setAiCombination] = useState<string>(scheme.combination || 'General / Core');
  const [aiPeriodsPerWeek, setAiPeriodsPerWeek] = useState<string>(scheme.periodsPerWeek || '4 periods per week');
  const [aiUnitNumber, setAiUnitNumber] = useState<string>('Unit 1');
  const [aiUnitTitle, setAiUnitTitle] = useState<string>('Soil Erosion in Rwanda');
  const [aiKeyUnitCompetence, setAiKeyUnitCompetence] = useState<string>('To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda.');
  const [aiNumberOfWeeks, setAiNumberOfWeeks] = useState<number>(4);
  const [aiScope, setAiScope] = useState<'single_unit' | 'full_term'>('single_unit');
  const [aiTopicDetails, setAiTopicDetails] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Subscription State
  const [schemeSubData, setSchemeSubData] = useState<SubscriptionData>(getSchemeSubscriptionStatus());
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);

  // Curriculum Level / Category Filter & Catalog Browser States
  const [selectedCurriculumCatId, setSelectedCurriculumCatId] = useState<string>('all');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const catalogTarget = 'ai';

  // Active translation strings
  const t = SCHEME_UI_STRINGS[selectedLanguage] || SCHEME_UI_STRINGS.English;

  // Localized subject name helper
  const getLocalizedSubjectName = (item: RwandaSubjectItem): string => {
    if (selectedLanguage === 'Kinyarwanda' && item.nameRw) return item.nameRw;
    if (selectedLanguage === 'Français' && item.nameFr) return item.nameFr;
    if (selectedLanguage === 'Kiswahili' && item.nameSw) return item.nameSw;
    return item.nameEn;
  };

  // Handle subject selection from dropdown or catalog modal
  const handleSelectSubject = (item: RwandaSubjectItem, target: 'ai' | 'sheet' = 'ai') => {
    const localizedName = getLocalizedSubjectName(item);
    const defaultClass = item.suggestedClasses?.[0] || 'Senior 2 (S2)';
    const defaultComb = item.suggestedCombinations?.[0] || 'General / Core';
    const defaultPeriods = item.defaultPeriods || '4 periods per week';

    if (target === 'ai') {
      setAiSubject(localizedName);
      setAiClassName(defaultClass);
      setAiCombination(defaultComb);
      setAiPeriodsPerWeek(defaultPeriods);
      if (item.sampleUnits && item.sampleUnits.length > 0) {
        const sample = item.sampleUnits[0];
        setAiUnitNumber(sample.unitNumber);
        setAiUnitTitle(selectedLanguage === 'Kinyarwanda' ? sample.unitTitleRw : sample.unitTitleEn);
        setAiKeyUnitCompetence(selectedLanguage === 'Kinyarwanda' ? sample.competenceRw : sample.competenceEn);
      }
    } else {
      setScheme(prev => ({
        ...prev,
        subject: localizedName,
        className: defaultClass,
        combination: defaultComb,
        periodsPerWeek: defaultPeriods
      }));
    }
    setIsCatalogModalOpen(false);
  };

  // Initialize or load schemes on open
  useEffect(() => {
    if (isOpen) {
      setSchemeSubData(getSchemeSubscriptionStatus());
      loadSavedSchemes();
      if (initialData) {
        setScheme(initialData);
        if (initialData.language && ['English', 'Kinyarwanda', 'Français', 'Kiswahili'].includes(initialData.language)) {
          setSelectedLanguage(initialData.language as SchemeLanguage);
        }
        setAiSchoolName(initialData.schoolName);
        setAiAcademicYear(initialData.academicYear);
        setAiTerm(initialData.term);
        setAiSubject(initialData.subject);
        setAiTeacherName(initialData.teacherName);
        setAiClassName(initialData.className);
        setAiCombination(initialData.combination);
        setAiPeriodsPerWeek(initialData.periodsPerWeek);
      }
    }
  }, [isOpen, initialData]);

  const loadSavedSchemes = async () => {
    try {
      const data = await loadSchemesOfWorkFromFirestore();
      setSavedSchemes(data);
    } catch (err) {
      console.warn("Failed to load saved schemes:", err);
    }
  };

  // Switch Language: Updates active language, UI strings, and populates the rich REB template in that language!
  const handleSelectLanguage = (lang: SchemeLanguage) => {
    setSelectedLanguage(lang);

    // Pick the sample for the selected language
    let sampleForLang = DEFAULT_ENGLISH_SCHEME;
    if (lang === 'Kinyarwanda') sampleForLang = DEFAULT_KINYARWANDA_SCHEME;
    else if (lang === 'Français') sampleForLang = DEFAULT_FRENCH_SCHEME;
    else if (lang === 'Kiswahili') sampleForLang = DEFAULT_KISWAHILI_SCHEME;

    // Retain the teacher's custom schoolName and teacherName while updating subject, class, periods and all lesson rows
    setScheme({
      ...sampleForLang,
      id: `sow_${lang.toLowerCase()}_${Date.now()}`,
      schoolName: scheme.schoolName || sampleForLang.schoolName,
      teacherName: scheme.teacherName || sampleForLang.teacherName,
      academicYear: scheme.academicYear || sampleForLang.academicYear,
      language: lang,
      updatedAt: new Date().toISOString()
    });

    // Also update AI generator form defaults to that language
    setAiSubject(sampleForLang.subject);
    setAiClassName(sampleForLang.className);
    setAiCombination(sampleForLang.combination);
    setAiPeriodsPerWeek(sampleForLang.periodsPerWeek);
    setAiTerm(sampleForLang.term);
    setAiUnitNumber(sampleForLang.rows[0]?.unitNumber || 'Unit 1');
    setAiUnitTitle(sampleForLang.rows[0]?.unitTitle || '');
    setAiKeyUnitCompetence(sampleForLang.rows[0]?.keyUnitCompetence || '');

    const message = lang === 'Kinyarwanda' 
      ? "🇷🇼 Wahisemo Ikinyarwanda! Imbonerahamwe n'ingero byose bihindutse mu Kinyarwanda."
      : lang === 'Français'
      ? "🇫🇷 Vous avez sélectionné le Français ! La matrice et les leçons sont en Français."
      : lang === 'Kiswahili'
      ? "🇹🇿 Umebadili kwenda Kiswahili! Mpango wote wa kazi uko kwa Kiswahili."
      : "🇬🇧 Switched to English! The Scheme of Work and lesson matrix are now in English.";

    setSaveStatus(message);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleFieldChange = (field: keyof SchemeOfWorkData, value: string) => {
    setScheme(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleRowChange = (id: string, field: keyof SchemeOfWorkRow, value: any) => {
    setScheme(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === id ? { ...row, [field]: value } : row),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleAddRow = () => {
    const lastRow = scheme.rows[scheme.rows.length - 1];
    const nextWeek = lastRow ? Number(lastRow.weekNumber) + 1 : 1;
    
    let nextDates = `Week ${nextWeek}`;
    let nextUnitNum = 'Unit 1';
    let nextLessonNum = `Lesson ${scheme.rows.length + 1}`;
    let nextLessonTitle = 'New Lesson Title';
    let nextEvaluation = 'Oral questions, written quiz and classroom exit ticket';
    let nextObjectives = 'Knowledge: ... Skills: ... Attitudes: ...';
    let nextMethods = 'Interactive guided inquiry, cooperative group work and practical problem-solving';
    let nextProcedures = 'Formative continuous assessment, peer review and rubric scoring';
    let nextResources = "REB Approved Student's Book, Teacher's Guide, Concrete Local Teaching Aids";

    if (selectedLanguage === 'Kinyarwanda') {
      nextDates = `Icyumweru cya ${nextWeek}`;
      nextUnitNum = 'Umutwe wa 1';
      nextLessonNum = `Isomo rya ${scheme.rows.length + 1}`;
      nextLessonTitle = "Umutwe w'isomo rishya";
      nextEvaluation = 'Ibibazo byo mu kanwa, imyitozo yo ku mbaho no gukosorana';
      nextObjectives = 'Ubumenyi: ... Ubushobozi: ... Imyifatire: ...';
      nextMethods = 'Kungurana ibitekerezo mu matsinda, kwigira ku ngero zifatika';
      nextProcedures = 'Gusuzuma ibikorwa byo mu matsinda, ikizamini kigufi cyanditse';
      nextResources = "Igitabo cy'umunyeshuri (REB), Igitabo cy'umwarimu, ibikoresho byo mu bumenyi";
    } else if (selectedLanguage === 'Français') {
      nextDates = `Semaine ${nextWeek}`;
      nextUnitNum = 'Unité 1';
      nextLessonNum = `Leçon ${scheme.rows.length + 1}`;
      nextLessonTitle = 'Nouveau titre de la leçon';
      nextEvaluation = 'Questions orales, exercices individuels et vérification sur ardoises';
      nextObjectives = 'Savoirs: ... Savoir-faire: ... Attitudes: ...';
      nextMethods = 'Approche communicative, travail en binômes et résolution de problèmes';
      nextProcedures = 'Évaluation formative continue, auto-évaluation et grille critériée';
      nextResources = "Manuel de l'élève approuvé par REB, Guide pédagogique de l'enseignant";
    } else if (selectedLanguage === 'Kiswahili') {
      nextDates = `Wiki ya ${nextWeek}`;
      nextUnitNum = 'Sura ya 1';
      nextLessonNum = `Somo la ${scheme.rows.length + 1}`;
      nextLessonTitle = 'Kichwa kipya cha somo';
      nextEvaluation = 'Maswali ya mdomo, mazoezi ya kuandika na tathmini ya jozi';
      nextObjectives = 'Maarifa: ... Stadi: ... Mitazamo: ...';
      nextMethods = 'Mbinu shirikishi za ufundishaji, majadiliano ya vikundi na mifano halisi';
      nextProcedures = 'Tathmini endelevu ya uelewa, ukaguzi wa madaftari na rubriki';
      nextResources = 'Kitabu cha Mwanafunzi (REB), Mwongozo wa Mwalimu, Nyenzo halisi za ujifunzaji';
    }

    const newRow: SchemeOfWorkRow = {
      id: `row_${Date.now()}`,
      weekNumber: nextWeek,
      dates: lastRow ? lastRow.dates : nextDates,
      unitNumber: lastRow ? lastRow.unitNumber : nextUnitNum,
      unitTitle: lastRow ? lastRow.unitTitle : 'Unit Title',
      lessonNumber: nextLessonNum,
      lessonTitle: nextLessonTitle,
      evaluation: nextEvaluation,
      learningObjectives: nextObjectives,
      keyUnitCompetence: lastRow ? lastRow.keyUnitCompetence : 'Key unit competence...',
      teachingMethods: nextMethods,
      evaluationProcedures: nextProcedures,
      resourcesAndReferences: nextResources,
      observations: ''
    };

    setScheme(prev => ({
      ...prev,
      rows: [...prev.rows, newRow],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDeleteRow = (id: string) => {
    if (scheme.rows.length <= 1) {
      alert("Scheme of Work must contain at least one lesson row.");
      return;
    }
    setScheme(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDuplicateRow = (row: SchemeOfWorkRow) => {
    const newRow: SchemeOfWorkRow = {
      ...row,
      id: `row_${Date.now()}`,
      lessonNumber: `${row.lessonNumber} (Copy)`
    };
    const index = scheme.rows.findIndex(r => r.id === row.id);
    const newRows = [...scheme.rows];
    newRows.splice(index + 1, 0, newRow);

    setScheme(prev => ({
      ...prev,
      rows: newRows,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleResetSample = () => {
    handleSelectLanguage(selectedLanguage);
  };

  const handleSaveScheme = async () => {
    try {
      await saveSchemeOfWorkToFirestore({ ...scheme, language: selectedLanguage });
      setSaveStatus('✅ Scheme of Work saved successfully to your cloud library!');
      loadSavedSchemes();
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setSaveStatus('⚠️ Failed to save Scheme of Work.');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleDeleteScheme = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteSchemeOfWorkFromFirestore(id);
      loadSavedSchemes();
      if (scheme.id === id) {
        setScheme(DEFAULT_ENGLISH_SCHEME);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateWithAi = async () => {
    const subCheck = checkCanCreateSchemeOfWork();
    if (!subCheck.canCreate) {
      setIsSubModalOpen(true);
      alert(subCheck.message || "Scheme of Work subscription has expired. Please purchase a new package.");
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        schoolName: aiSchoolName,
        academicYear: aiAcademicYear,
        term: aiTerm,
        subject: aiSubject,
        teacherName: aiTeacherName,
        className: aiClassName,
        combination: aiCombination,
        periodsPerWeek: aiPeriodsPerWeek,
        unitNumber: aiUnitNumber,
        unitTitle: aiUnitTitle,
        keyUnitCompetence: aiKeyUnitCompetence,
        language: selectedLanguage,
        generationScope: aiScope,
        numberOfWeeks: aiNumberOfWeeks,
        customTopicDetails: aiTopicDetails
      };

      const res = await fetch('/api/generate-scheme-of-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data && data.scheme) {
        // Consume 1 Scheme of Work subscription quota
        const updatedSchemeSub = consumeSchemeOfWork();
        setSchemeSubData(updatedSchemeSub);
        const rem = Math.max(0, updatedSchemeSub.totalPlansAllowed - updatedSchemeSub.usedPlansCount);
        const remNotice = ` (Hasigaye: ${rem} schemes)`;

        setScheme({ ...data.scheme, language: selectedLanguage });
        saveSchemeOfWorkToFirestore({ ...data.scheme, language: selectedLanguage }).catch(console.warn);
        loadSavedSchemes();
        setSaveStatus(`✨ Scheme of Work (${selectedLanguage}) generated successfully by AI!${remNotice}`);
        setIsAiFormOpen(false);
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        throw new Error("Failed to generate Scheme of Work");
      }
    } catch (err: any) {
      console.error("AI Generation error:", err);
      alert("An error occurred while generating Scheme of Work. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTable = () => {
    let text = `${t.mainTitle} (${t.subTitle})\n`;
    text += `${t.academicYear} ${scheme.academicYear} | ${t.term} ${scheme.term} | ${t.school} ${scheme.schoolName}\n`;
    text += `${t.subject} ${scheme.subject} | ${t.teacher} ${scheme.teacherName} | ${t.classCombination} ${scheme.className} (${scheme.combination}) | ${t.periodsPerWeek} ${scheme.periodsPerWeek}\n\n`;
    text += `========================================================================================================================================================\n`;
    text += `${t.colDates.replace('\n', ' ')} | ${t.colLesson.replace(/\n/g, ' ')} | ${t.colObjectives.replace(/\n/g, ' ')} | ${t.colContentSummary.replace(/\n/g, ' ')} | ${t.colTeachingActivities.replace(/\n/g, ' ')} | ${t.colLearningAids.replace('\n', ' ')} | ${t.colAssessment.replace('\n', ' ')} | ${t.colReferences.replace('\n', ' ')} | ${t.colRemarks.replace('\n', ' ')}\n`;
    text += `========================================================================================================================================================\n`;

    scheme.rows.forEach(r => {
      text += `[${r.dates}] | [${r.lessonNumber}: ${r.lessonTitle}] | [${r.learningObjectives}] | [${r.contentSummary || r.evaluation || ''}] | [${r.teachingActivities || r.teachingMethods || ''}] | [${r.learningAids || r.resourcesAndReferences || ''}] | [${r.assessment || r.evaluation || ''}] | [${r.references || r.resourcesAndReferences || ''}] | [${r.weeklyRemarks || ''}]\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

   const handleDownloadPdf = async (targetScheme?: SchemeOfWorkData) => {
    setIsDownloadingPdf(true);
    try {
      const active = targetScheme || scheme;
      await exportSchemeOfWorkToPdf(active, selectedLanguage);
      setSaveStatus(`📥 Scheme of Work PDF (${selectedLanguage}) exported successfully!`);
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      console.error('Error exporting scheme to PDF with jsPDF:', err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleExportDoc = () => {

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${t.mainTitle} - ${scheme.subject}</title>
        <style>
          @page { size: landscape; margin: 1cm; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; }
          h1 { text-align: center; font-size: 16pt; font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
          h2 { text-align: center; font-size: 11pt; font-weight: bold; margin-top: 0; margin-bottom: 15px; }
          .header-table { width: 100%; margin-bottom: 15px; font-weight: bold; font-size: 10pt; }
          .header-table td { padding: 4px; }
          table.main-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table.main-table th, table.main-table td { border: 1px solid black; padding: 6px; font-size: 9pt; vertical-align: top; }
          table.main-table th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${t.mainTitle}</h1>
        <h2>${t.subTitle}</h2>
        <table class="header-table">
          <tr>
            <td>${t.academicYear} <u>${scheme.academicYear}</u></td>
            <td>${t.term} <u>${scheme.term}</u></td>
            <td>${t.school} <u>${scheme.schoolName}</u></td>
          </tr>
          <tr>
            <td>${t.subject} <u>${scheme.subject}</u></td>
            <td>${t.teacher} <u>${scheme.teacherName}</u></td>
            <td>${t.classCombination} <u>${scheme.className} ${scheme.combination ? `(${scheme.combination})` : ''}</u></td>
            <td>${t.periodsPerWeek} <u>${scheme.periodsPerWeek}</u></td>
          </tr>
        </table>

        <table class="main-table">
          <thead>
            <tr>
              <th style="width: 9%;">${t.colDates.replace('\n', '<br>')}</th>
              <th style="width: 14%;">${t.colLesson.replace(/\n/g, '<br>')}</th>
              <th style="width: 13%;">${t.colObjectives.replace(/\n/g, '<br>')}</th>
              <th style="width: 12%;">${t.colContentSummary.replace(/\n/g, '<br>')}</th>
              <th style="width: 16%;">${t.colTeachingActivities.replace(/\n/g, '<br>')}</th>
              <th style="width: 10%;">${t.colLearningAids.replace('\n', '<br>')}</th>
              <th style="width: 10%;">${t.colAssessment.replace('\n', '<br>')}</th>
              <th style="width: 10%;">${t.colReferences.replace('\n', '<br>')}</th>
              <th style="width: 6%;">${t.colRemarks.replace('\n', '<br>')}</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let lastUnitKey = '';
              return scheme.rows.map(r => {
                const currentUnitKey = `${r.unitNumber || ''} - ${r.unitTitle || ''}`.trim();
                const showUnitHeaders = currentUnitKey !== lastUnitKey;
                if (showUnitHeaders) {
                  lastUnitKey = currentUnitKey;
                }
                return `
                  ${showUnitHeaders ? `
                    <tr style="background-color: #e2e8f0; font-weight: bold;">
                      <td style="text-align: center; text-transform: uppercase;"><strong>${selectedLanguage === 'Kinyarwanda' ? "Umutwe" : selectedLanguage === 'Français' ? "Unité" : selectedLanguage === 'Kiswahili' ? "Sura" : "Unit"}</strong></td>
                      <td colspan="8" style="text-align: center; text-transform: uppercase;"><strong>${r.unitNumber ? r.unitNumber + ': ' : ''}${r.unitTitle}</strong></td>
                    </tr>
                    <tr style="background-color: #fafaf9; font-style: italic;">
                      <td style="text-align: center; font-weight: bold;"><strong>${selectedLanguage === 'Kinyarwanda' ? "Ubushobozi" : selectedLanguage === 'Français' ? "Compétence" : selectedLanguage === 'Kiswahili' ? "Umahiri" : "Competence"}</strong></td>
                      <td colspan="8"><strong>Key Competence:</strong> ${r.keyUnitCompetence}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td><strong>${r.dates}</strong></td>
                    <td><strong>${r.lessonNumber || ''}:</strong> ${r.lessonTitle || ''}</td>
                    <td>${r.learningObjectives || ''}</td>
                    <td>${r.contentSummary || r.evaluation || ''}</td>
                    <td>${r.teachingActivities || r.teachingMethods || ''}</td>
                    <td>${r.learningAids || r.resourcesAndReferences || ''}</td>
                    <td>${r.assessment || r.evaluation || ''}</td>
                    <td>${r.references || r.resourcesAndReferences || ''}</td>
                    <td>${r.weeklyRemarks || ''}</td>
                  </tr>
                `;
              }).join('');
            })()}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scheme_of_Work_${scheme.subject}_${scheme.className.replace(/\s+/g, '_')}_${selectedLanguage}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1 sm:p-3 md:p-6 overflow-hidden animate-fade-in text-slate-100">
      <div className="bg-slate-900 w-full max-w-[98vw] xl:max-w-7xl h-[96vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
        
        {/* TOP MODAL HEADER WITH 4 DIRECT LANGUAGE BUTTONS (WITHOUT "CONTEXT") */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full">
                  REB CBC MATRIX
                </span>
                <span className="text-amber-400 text-xs font-bold hidden sm:inline">
                  {selectedLanguage === 'Kinyarwanda' ? 'Gahunda y\'Ibikorwa by\'Isomo' : selectedLanguage === 'Français' ? 'Plan de Travail Pédagogique' : selectedLanguage === 'Kiswahili' ? 'Mpango wa Kazi wa Somo' : 'Scheme of Work Studio'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-white">
                Scheme of Work Generator & Studio (REB Rwanda)
              </h2>
            </div>
          </div>

          {/* 4 DIRECT LANGUAGE SWITCHER BUTTONS (NO "CONTEXT" WORD) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleSelectLanguage('English')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'English'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Switch to English"
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectLanguage('Kinyarwanda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'Kinyarwanda'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Switch to Kinyarwanda"
            >
              <span>🇷🇼</span>
              <span>Kinyarwanda</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectLanguage('Français')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'Français'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Passer en Français"
            >
              <span>🇫🇷</span>
              <span>Français</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectLanguage('Kiswahili')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'Kiswahili'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Badilisha kuwa Kiswahili"
            >
              <span>🇹🇿</span>
              <span>Kiswahili</span>
            </button>
          </div>

          {/* TOP TABS & CLOSE BUTTON */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-400'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.studioTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-amber-600 text-white shadow-md border border-amber-400'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{t.savedSchemesTab} ({savedSchemes.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION STATUS TOAST */}
        {saveStatus && (
          <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-y border-amber-500/40 px-4 py-2 text-center text-xs font-bold text-amber-200 flex items-center justify-center gap-2 animate-fade-in shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* TAB 1: STUDIO & PRINTABLE SHEET VIEW */}
        {activeTab === 'editor' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* ACTION TOOLBAR */}
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              
              {/* LEFT ACTIONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAiFormOpen(!isAiFormOpen)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAiFormOpen
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:brightness-110'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.aiGenerator}</span>
                  {isAiFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleAddRow}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addLessonRow}</span>
                </button>

                <button
                  onClick={handleSaveScheme}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-500/40 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.saveScheme}</span>
                </button>

                <button
                  onClick={handleResetSample}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title={t.resetSample}
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>{t.resetSample}</span>
                </button>

                {/* SCHEME OF WORK SUBSCRIPTION BADGE & UPGRADE BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border ${
                    schemeSubData.status === 'ACTIVE'
                      ? 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border-amber-500/50'
                      : 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border-rose-500/60 animate-pulse'
                  }`}
                  title="Click here to view or purchase Scheme of Work subscription"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  <span>
                    Scheme Quota: {schemeSubData.usedPlansCount}/{schemeSubData.totalPlansAllowed > 1000 ? '∞' : schemeSubData.totalPlansAllowed}
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-black uppercase ml-1">
                    Buy / Upgrade
                  </span>
                </button>
              </div>

              {/* RIGHT EXPORT & PRINT CONTROLS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf()}
                  disabled={isDownloadingPdf}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
                  title="Export official Scheme of Work PDF (A4 Landscape)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{isDownloadingPdf ? 'Creating PDF...' : t.downloadPdf}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Print Scheme of Work"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.print}</span>
                </button>

                <button
                  onClick={handleExportDoc}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Export to Word Document"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.wordDoc}</span>
                </button>

                <button
                  onClick={handleCopyTable}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  title="Copy Table Text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{copied ? t.copied : t.copyTable}</span>
                </button>
              </div>
            </div>

            {/* AI CONFIGURATION FORM DRAWER */}
            {isAiFormOpen && (
              <div className="bg-slate-900/95 border-b-2 border-amber-500/40 p-4 sm:p-5 overflow-y-auto max-h-[45vh] transition-all space-y-4 shrink-0 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      {t.aiTitle}
                    </h3>
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {t.aiDescription}
                  </span>
                </div>

                {/* CURRICULUM LEVEL QUICK FILTER PILLS */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-amber-400 mr-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {t.curriculumLevels}
                  </span>
                  {[
                    { id: 'all', label: `🌟 ${t.allLevels}` },
                    { id: 'nursery_pre_primary', label: 'I. 🍼 Nursery (ECD)' },
                    { id: 'primary_school', label: 'II. 🎒 Primary (P1-P6)' },
                    { id: 'secondary_o_level', label: 'III. 🏫 O-Level (S1-S3)' },
                    { id: 'secondary_a_level', label: 'IV. 🎓 A-Level (S4-S6)' },
                    { id: 'ttc_colleges', label: 'V. 🧑‍🏫 TTCs (Nderabarezi)' },
                    { id: 'tvet_trades', label: 'VI. 🛠️ TVET (Imyuga)' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCurriculumCatId(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        selectedCurriculumCatId === cat.id
                          ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300 font-extrabold'
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {t.school}
                    </label>
                    <input
                      type="text"
                      value={aiSchoolName}
                      onChange={(e) => setAiSchoolName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. GS Nkorera"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {t.teacher}
                    </label>
                    <input
                      type="text"
                      value={aiTeacherName}
                      onChange={(e) => setAiTeacherName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. NKUNDIMANA Theogene"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {t.academicYear}
                    </label>
                    <input
                      type="text"
                      value={aiAcademicYear}
                      onChange={(e) => setAiAcademicYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="2025-2026"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {t.term}
                    </label>
                    <select
                      value={aiTerm}
                      onChange={(e) => setAiTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                    >
                      <option value={selectedLanguage === 'Kinyarwanda' ? 'Igihembwe cya 1' : selectedLanguage === 'Français' ? 'Trimestre 1' : selectedLanguage === 'Kiswahili' ? 'Muhula wa 1' : 'Term 1'}>
                        {selectedLanguage === 'Kinyarwanda' ? 'Igihembwe cya 1' : selectedLanguage === 'Français' ? 'Trimestre 1' : selectedLanguage === 'Kiswahili' ? 'Muhula wa 1' : 'Term 1'}
                      </option>
                      <option value={selectedLanguage === 'Kinyarwanda' ? 'Igihembwe cya 2' : selectedLanguage === 'Français' ? 'Trimestre 2' : selectedLanguage === 'Kiswahili' ? 'Muhula wa 2' : 'Term 2'}>
                        {selectedLanguage === 'Kinyarwanda' ? 'Igihembwe cya 2' : selectedLanguage === 'Français' ? 'Trimestre 2' : selectedLanguage === 'Kiswahili' ? 'Muhula wa 2' : 'Term 2'}
                      </option>
                      <option value={selectedLanguage === 'Kinyarwanda' ? 'Igihembwe cya 3' : selectedLanguage === 'Français' ? 'Trimestre 3' : selectedLanguage === 'Kiswahili' ? 'Muhula wa 3' : 'Term 3'}>
                        {selectedLanguage === 'Kinyarwanda' ? 'Igihembwe cya 3' : selectedLanguage === 'Français' ? 'Trimestre 3' : selectedLanguage === 'Kiswahili' ? 'Muhula wa 3' : 'Term 3'}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-400 font-bold">
                      {t.subject}
                    </label>

                    {/* Quick dropdown with all subjects grouped by level */}
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        for (const cat of RWANDA_EDUCATION_CURRICULUM) {
                          const found = cat.subjects.find(s => s.id === val);
                          if (found) {
                            handleSelectSubject(found, 'ai');
                            return;
                          }
                        }
                      }}
                      value=""
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs text-amber-200 font-semibold focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- {t.selectSubjectPrompt} --</option>
                      {RWANDA_EDUCATION_CURRICULUM
                        .filter(cat => selectedCurriculumCatId === 'all' || cat.id === selectedCurriculumCatId)
                        .map(cat => (
                          <optgroup key={cat.id} label={`${cat.badge} - ${selectedLanguage === 'Kinyarwanda' ? cat.titleRw : selectedLanguage === 'Français' ? cat.titleFr : selectedLanguage === 'Kiswahili' ? cat.titleSw : cat.titleEn}`}>
                            {cat.subjects.map(subj => {
                              const locName = getLocalizedSubjectName(subj);
                              return (
                                <option key={subj.id} value={subj.id}>
                                  {locName}
                                </option>
                              );
                            })}
                          </optgroup>
                        ))}
                    </select>

                    <input
                      type="text"
                      list="curriculum-subjects-datalist"
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. Geography, Ikinyarwanda, Français, Kiswahili..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Class Level:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setAiClassName(e.target.value);
                      }}
                      value={aiClassName}
                      className="w-full mb-1 bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs text-amber-200 font-semibold focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Select Class / Grade --</option>
                      <optgroup label="Primary School">
                        <option value="Primary 5 (P5)">Primary 5 (P5)</option>
                        <option value="Primary 6 (P6)">Primary 6 (P6)</option>
                        <option value="Primary 4 (P4)">Primary 4 (P4)</option>
                        <option value="Primary 3 (P3)">Primary 3 (P3)</option>
                        <option value="Primary 2 (P2)">Primary 2 (P2)</option>
                        <option value="Primary 1 (P1)">Primary 1 (P1)</option>
                      </optgroup>
                      <optgroup label="Secondary O-Level (S1-S3)">
                        <option value="Senior 1 (S1)">Senior 1 (S1)</option>
                        <option value="Senior 2 (S2)">Senior 2 (S2)</option>
                        <option value="Senior 3 (S3)">Senior 3 (S3)</option>
                      </optgroup>
                      <optgroup label="Secondary A-Level (S4-S6)">
                        <option value="Senior 4 (S4)">Senior 4 (S4)</option>
                        <option value="Senior 5 (S5)">Senior 5 (S5)</option>
                        <option value="Senior 6 (S6)">Senior 6 (S6)</option>
                      </optgroup>
                      <optgroup label="Pre-Primary (Nursery)">
                        <option value="Baby Class (N1)">Baby Class (N1)</option>
                        <option value="Middle Class (N2)">Middle Class (N2)</option>
                        <option value="Top Class (N3)">Top Class (N3)</option>
                      </optgroup>
                      <optgroup label="Teacher Training Colleges (TTC)">
                        <option value="Year 1 (Y1)">Year 1 (Y1)</option>
                        <option value="Year 2 (Y2)">Year 2 (Y2)</option>
                        <option value="Year 3 (Y3)">Year 3 (Y3)</option>
                      </optgroup>
                      <optgroup label="TVET Trades (L1-L5)">
                        <option value="Level 3 (L3)">Level 3 (L3)</option>
                        <option value="Level 4 (L4)">Level 4 (L4)</option>
                        <option value="Level 5 (L5)">Level 5 (L5)</option>
                      </optgroup>
                    </select>
                    <input
                      type="text"
                      value={aiClassName}
                      onChange={(e) => setAiClassName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. Primary 5 (P5), Primary 6 (P6)..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Combination / Stream:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setAiCombination(e.target.value);
                      }}
                      value={aiCombination}
                      className="w-full mb-1 bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs text-amber-200 font-semibold focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Select Combination / Stream --</option>
                      {RWANDA_COMBINATIONS_AND_STREAMS.map((group, groupIdx) => (
                        <optgroup key={`${group.category}-${groupIdx}`} label={`${group.badge} - ${group.category}`}>
                          {group.options.map((opt, optIdx) => (
                            <option key={`${group.category}-${groupIdx}-${opt.value}-${optIdx}`} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <input
                      type="text"
                      list="curriculum-combinations-datalist"
                      value={aiCombination}
                      onChange={(e) => setAiCombination(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. MCB, PCB, MPC, MEG, HEG, Stream A, SOD..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      {t.periodsPerWeek}
                    </label>
                    <input
                      type="text"
                      value={aiPeriodsPerWeek}
                      onChange={(e) => setAiPeriodsPerWeek(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. 4 periods per week"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Unit Number:
                    </label>
                    <input
                      type="text"
                      value={aiUnitNumber}
                      onChange={(e) => setAiUnitNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. Unit 1"
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-slate-400 font-bold mb-1">
                      {t.colUnit}:
                    </label>
                    <input
                      type="text"
                      value={aiUnitTitle}
                      onChange={(e) => setAiUnitTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. Soil Erosion in Rwanda"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Key Unit Competence:
                    </label>
                    <textarea
                      rows={2}
                      value={aiKeyUnitCompetence}
                      onChange={(e) => setAiKeyUnitCompetence(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none resize-none"
                      placeholder="e.g. To be able to explain the causes, effects and conservation measures of soil erosion in Rwanda."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Specific Syllabus Focus / Teacher Instructions:</label>
                    <textarea
                      rows={2}
                      value={aiTopicDetails}
                      onChange={(e) => setAiTopicDetails(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:border-amber-400 focus:outline-none resize-none"
                      placeholder="e.g. Include practical field study, model construction, and end of unit test..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                      <span>{t.scopeLabel}</span>
                      <select
                        value={aiScope}
                        onChange={(e) => setAiScope(e.target.value as 'single_unit' | 'full_term')}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold"
                      >
                        <option value="single_unit">{t.singleUnit}</option>
                        <option value="full_term">{t.fullTerm}</option>
                      </select>
                    </label>

                    <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                      <span>{t.weeksLabel}</span>
                      <select
                        value={aiNumberOfWeeks}
                        onChange={(e) => setAiNumberOfWeeks(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold"
                      >
                        <option value={2}>2 Weeks</option>
                        <option value={3}>3 Weeks</option>
                        <option value={4}>4 Weeks</option>
                        <option value={6}>6 Weeks</option>
                        <option value={8}>8 Weeks</option>
                        <option value={10}>10 Weeks</option>
                        <option value={12}>12 Weeks (Full Term)</option>
                      </select>
                    </label>
                  </div>

                  <button
                    onClick={handleGenerateWithAi}
                    disabled={isGenerating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer hover:scale-105 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{t.generatingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>{t.generateBtn} &rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PRINTABLE / EDITABLE SCHEME OF WORK SHEET (REB OFFICIAL 7-COLUMN MATRIX) */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 bg-slate-900/60 flex justify-center">
              
              <div 
                ref={printableRef}
                id="printable-scheme-sheet"
                className="bg-white text-black p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-[1400px] border border-slate-300 min-h-[700px] text-xs"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* DOCUMENT MAIN TITLE & REB BANNER */}
                <div className="text-center pb-2 mb-4">
                  <h1 className="text-lg sm:text-2xl font-extrabold uppercase tracking-wider text-black underline decoration-2 underline-offset-4 m-0 p-0">
                    {t.mainTitle}
                  </h1>
                  <p className="text-[11px] text-slate-700 uppercase font-bold tracking-widest mt-1">
                    {t.subTitle}
                  </p>
                </div>

                {/* SUB-HEADER METADATA BLOCK */}
                <div className="space-y-2 mb-4 font-semibold text-black text-xs sm:text-sm">
                  {/* ROW 1: Academic year | Term | School */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-baseline">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.academicYear}</span>
                      <input
                        type="text"
                        value={scheme.academicYear}
                        onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="2025-2026"
                      />
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.term}</span>
                      <input
                        type="text"
                        value={scheme.term}
                        onChange={(e) => handleFieldChange('term', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="Term 1"
                      />
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.school}</span>
                      <input
                        type="text"
                        value={scheme.schoolName}
                        onChange={(e) => handleFieldChange('schoolName', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="School name..."
                      />
                    </div>
                  </div>

                  {/* ROW 2: Subject | Teacher's name | Class + Combination | Number of period per week */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.subject}</span>
                      <input
                        type="text"
                        list="curriculum-subjects-datalist"
                        value={scheme.subject}
                        onChange={(e) => handleFieldChange('subject', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="Subject..."
                      />
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.teacher}</span>
                      <input
                        type="text"
                        value={scheme.teacherName}
                        onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="Teacher's name..."
                      />
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.classCombination}</span>
                      <input
                        type="text"
                        value={`${scheme.className} ${scheme.combination ? `(${scheme.combination})` : ''}`}
                        onChange={(e) => handleFieldChange('className', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="Class & Option..."
                      />
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-bold whitespace-nowrap">{t.periodsPerWeek}</span>
                      <input
                        type="text"
                        value={scheme.periodsPerWeek}
                        onChange={(e) => handleFieldChange('periodsPerWeek', e.target.value)}
                        className="border-b border-dotted border-black px-1 py-0.5 text-xs sm:text-sm font-bold text-black w-full focus:outline-none focus:bg-amber-50"
                        placeholder="e.g. 4 periods per week"
                      />
                    </div>
                  </div>
                </div>

                {/* THE 9-COLUMN REB SCHEME OF WORK TABLE */}
                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full border-collapse text-black text-[11px] leading-tight min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-black text-center font-bold">
                        <th className="border-r border-black p-2 w-[9%] align-middle whitespace-pre-line">
                          {t.colDates}
                        </th>
                        <th className="border-r border-black p-2 w-[14%] align-middle whitespace-pre-line">
                          {t.colLesson}
                        </th>
                        <th className="border-r border-black p-2 w-[13%] align-middle whitespace-pre-line">
                          {t.colObjectives}
                        </th>
                        <th className="border-r border-black p-2 w-[12%] align-middle whitespace-pre-line">
                          {t.colContentSummary}
                        </th>
                        <th className="border-r border-black p-2 w-[16%] align-middle whitespace-pre-line">
                          {t.colTeachingActivities}
                        </th>
                        <th className="border-r border-black p-2 w-[10%] align-middle whitespace-pre-line">
                          {t.colLearningAids}
                        </th>
                        <th className="border-r border-black p-2 w-[10%] align-middle whitespace-pre-line">
                          {t.colAssessment}
                        </th>
                        <th className="border-r border-black p-2 w-[10%] align-middle whitespace-pre-line">
                          {t.colReferences}
                        </th>
                        <th className="border-r border-black p-2 w-[6%] align-middle whitespace-pre-line">
                          {t.colRemarks}
                        </th>
                        <th className="p-1 w-[4%] print:hidden align-middle">
                          {t.action}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let lastUnitKey = '';
                        return scheme.rows.map((row) => {
                          const currentUnitKey = `${row.unitNumber || ''} - ${row.unitTitle || ''}`.trim();
                          const showUnitHeaders = currentUnitKey !== lastUnitKey;
                          if (showUnitHeaders) {
                            lastUnitKey = currentUnitKey;
                          }

                          return (
                            <React.Fragment key={row.id}>
                              {showUnitHeaders && (
                                <>
                                  {/* Unit Title Row */}
                                  <tr className="bg-slate-200 border-b border-black text-xs font-bold">
                                    <td className="border-r border-black p-2 bg-slate-200 text-center font-black uppercase text-amber-950 align-middle">
                                      {selectedLanguage === 'Kinyarwanda' ? "Umutwe" : selectedLanguage === 'Français' ? "Unité" : selectedLanguage === 'Kiswahili' ? "Sura" : "Unit Title"}
                                    </td>
                                    <td colSpan={8} className="border-r border-black p-2 bg-slate-200 text-center font-black text-[12px] text-slate-950 uppercase align-middle">
                                      <div className="flex gap-2 items-center justify-center">
                                        <input
                                          type="text"
                                          value={row.unitNumber || 'Unit 1'}
                                          onChange={(e) => handleRowChange(row.id, 'unitNumber', e.target.value)}
                                          className="font-bold text-center text-[12px] text-slate-950 bg-transparent border-b border-dotted border-slate-500 w-16 uppercase focus:outline-none focus:bg-amber-50"
                                          placeholder="Unit 1"
                                        />
                                        <span>-</span>
                                        <input
                                          type="text"
                                          value={row.unitTitle || ''}
                                          onChange={(e) => handleRowChange(row.id, 'unitTitle', e.target.value)}
                                          className="font-bold text-center text-[12px] text-slate-950 bg-transparent border-b border-dotted border-slate-500 w-96 uppercase focus:outline-none focus:bg-amber-50"
                                          placeholder="Unit Title..."
                                        />
                                      </div>
                                    </td>
                                    <td className="print:hidden p-1 bg-slate-200"></td>
                                  </tr>

                                  {/* Key Unit Competence Row */}
                                  <tr className="bg-amber-50/20 italic border-b border-black text-xs">
                                    <td className="border-r border-black p-2 bg-slate-100 text-center font-black text-amber-900 align-middle">
                                      {selectedLanguage === 'Kinyarwanda' ? "Ubushobozi" : selectedLanguage === 'Français' ? "Compétence" : selectedLanguage === 'Kiswahili' ? "Umahiri" : "Competence"}
                                    </td>
                                    <td colSpan={8} className="p-2 bg-slate-50 text-slate-900 font-medium text-[11px] leading-relaxed">
                                      <div className="flex gap-2 items-center">
                                        <span className="font-bold text-slate-800 text-[10px] uppercase shrink-0">Key Competence:</span>
                                        <textarea
                                          rows={2}
                                          value={row.keyUnitCompetence || ''}
                                          onChange={(e) => handleRowChange(row.id, 'keyUnitCompetence', e.target.value)}
                                          className="w-full text-[11px] font-medium italic text-slate-900 bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                          placeholder="Key unit competence..."
                                        />
                                      </div>
                                    </td>
                                    <td className="print:hidden p-1 bg-slate-50"></td>
                                  </tr>
                                </>
                              )}

                              {/* Standard Row */}
                              <tr className="border-b border-black hover:bg-amber-50/30 transition-colors">
                                {/* COLUMN 1: DATES/WEEKS */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={3}
                                    value={row.dates}
                                    onChange={(e) => handleRowChange(row.id, 'dates', e.target.value)}
                                    className="w-full text-[11px] font-bold text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="e.g. Week 1"
                                  />
                                </td>

                                {/* COLUMN 2: LESSON TITLE / PERIODS */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={row.lessonNumber}
                                      onChange={(e) => handleRowChange(row.id, 'lessonNumber', e.target.value)}
                                      className="w-full font-bold text-[10px] text-amber-900 border-b border-dotted border-slate-400 bg-transparent focus:outline-none"
                                      placeholder="Lesson 1"
                                    />
                                    <textarea
                                      rows={2}
                                      value={row.lessonTitle}
                                      onChange={(e) => handleRowChange(row.id, 'lessonTitle', e.target.value)}
                                      className="w-full text-[11px] font-semibold text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                      placeholder="Lesson title..."
                                    />
                                  </div>
                                </td>

                                {/* COLUMN 3: LEARNING OBJECTIVES */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.learningObjectives}
                                    onChange={(e) => handleRowChange(row.id, 'learningObjectives', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="Objectives..."
                                  />
                                </td>

                                {/* COLUMN 4: CONTENT SUMMARY */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.contentSummary !== undefined ? row.contentSummary : row.evaluation || ''}
                                    onChange={(e) => handleRowChange(row.id, 'contentSummary', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="Summary of content..."
                                  />
                                </td>

                                {/* COLUMN 5: TEACHING ACTIVITIES & APPROACHES */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.teachingActivities !== undefined ? row.teachingActivities : row.teachingMethods || ''}
                                    onChange={(e) => handleRowChange(row.id, 'teachingActivities', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="Activities & approaches..."
                                  />
                                </td>

                                {/* COLUMN 6: LEARNING AIDS */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.learningAids !== undefined ? row.learningAids : row.resourcesAndReferences || ''}
                                    onChange={(e) => handleRowChange(row.id, 'learningAids', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="Teaching & learning aids..."
                                  />
                                </td>

                                {/* COLUMN 7: ASSESSMENT & OBSERVATION */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.assessment !== undefined ? row.assessment : row.evaluation || ''}
                                    onChange={(e) => handleRowChange(row.id, 'assessment', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="Assessment tasks..."
                                  />
                                </td>

                                {/* COLUMN 8: REFERENCES */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.references !== undefined ? row.references : row.resourcesAndReferences || ''}
                                    onChange={(e) => handleRowChange(row.id, 'references', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="References..."
                                  />
                                </td>

                                {/* COLUMN 9: WEEKLY REMARKS */}
                                <td className="border-r border-black p-1.5 align-top">
                                  <textarea
                                    rows={4}
                                    value={row.weeklyRemarks || ''}
                                    onChange={(e) => handleRowChange(row.id, 'weeklyRemarks', e.target.value)}
                                    className="w-full text-[10.5px] text-black bg-transparent border-none resize-none focus:outline-none focus:bg-amber-50/70 p-0.5"
                                    placeholder="Weekly Remarks..."
                                  />
                                </td>

                                {/* ACTIONS */}
                                <td className="p-1 text-center align-middle print:hidden">
                                  <div className="flex flex-col items-center gap-1">
                                    <button
                                      onClick={() => handleDuplicateRow(row)}
                                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
                                      title="Duplicate Row"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRow(row.id)}
                                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM SIGNATURE BLOCK (REB STANDARD) */}
                <div className="mt-8 pt-4 border-t border-black grid grid-cols-2 text-xs font-bold text-black">
                  <div>
                    <p className="mb-8">Teacher's Signature & Date:</p>
                    <p className="border-b border-black w-48"></p>
                    <p className="text-[10px] text-slate-600 font-normal mt-1">{scheme.teacherName || 'NKUNDIMANA Theogene'}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-8">Dean of Studies (DOS) / Headteacher Visa:</p>
                    <p className="border-b border-black w-48 ml-auto"></p>
                    <p className="text-[10px] text-slate-600 font-normal mt-1">Approved & Stamped</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* TAB 2: SAVED SCHEMES LIBRARY */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                  <span>Your Saved Schemes of Work ({savedSchemes.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Access, edit, duplicate or export any Scheme of Work saved across all classes and subjects
                </p>
              </div>

              <button
                onClick={() => {
                  setScheme(DEFAULT_ENGLISH_SCHEME);
                  setActiveTab('editor');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Scheme</span>
              </button>
            </div>

            {savedSchemes.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No Saved Schemes Yet</h4>
                <p className="text-xs text-slate-500">
                  When you create or generate Schemes of Work, save them to easily access and print them anytime.
                </p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-all border border-slate-700 cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Editing Current Scheme</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSchemes.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all hover:shadow-xl flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-500/20 text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-md border border-amber-500/30">
                          {s.subject || 'Subject'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {s.language || 'English'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {s.rows[0]?.unitTitle || `${s.subject} Scheme`}
                      </h4>

                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <p><strong className="text-slate-300">Class:</strong> {s.className || 'Senior 2'} {s.combination ? `(${s.combination})` : ''}</p>
                        <p><strong className="text-slate-300">Term:</strong> {s.term || 'Term 1'} • {s.academicYear || '2025-2026'}</p>
                        <p><strong className="text-slate-300">Lessons:</strong> {s.rows?.length || 0} planned lesson entries</p>
                        <p><strong className="text-slate-300">School:</strong> {s.schoolName || 'GS Nkorera'}</p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                      <button
                        onClick={() => {
                          setScheme(s);
                          if (s.language && ['English', 'Kinyarwanda', 'Français', 'Kiswahili'].includes(s.language)) {
                            setSelectedLanguage(s.language as SchemeLanguage);
                          }
                          setActiveTab('editor');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-200 text-xs font-bold transition-all border border-amber-500/30 cursor-pointer flex-1 text-center"
                      >
                        Open in Studio
                      </button>

                      <button
                        onClick={() => handleDownloadPdf(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-700/50 text-slate-300 hover:text-emerald-300 transition-all border border-slate-700 cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteScheme(s.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-700/50 text-slate-300 hover:text-red-300 transition-all border border-slate-700 cursor-pointer"
                        title="Delete Scheme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HIDDEN DATALIST FOR AUTOCOMPLETE */}
        <datalist id="curriculum-subjects-datalist">
          {ALL_RWANDA_SUBJECT_NAMES.map((item, idx) => (
            <option 
              key={idx} 
              value={selectedLanguage === 'Kinyarwanda' ? item.nameRw : selectedLanguage === 'Français' ? item.nameFr : selectedLanguage === 'Kiswahili' ? item.nameSw : item.nameEn} 
            />
          ))}
        </datalist>

        {/* COMPREHENSIVE RWANDA CURRICULUM SUBJECT CATALOG MODAL */}
        {isCatalogModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* MODAL HEADER */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>{t.quickPickSubject}</span>
                      <span className="text-xs bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        REB • RTB • NESA
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {catalogTarget === 'ai' 
                        ? 'Select any subject to auto-configure the AI Scheme of Work generator' 
                        : 'Select any subject to populate the Scheme of Work sheet headers directly'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SEARCH & LEVEL FILTER BAR */}
              <div className="p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800 space-y-3">
                {/* SEARCH INPUT */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    placeholder={t.searchSubjectPlaceholder}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white font-medium focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                    autoFocus
                  />
                  {catalogSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* LEVEL TABS */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: 'all', label: `🌟 ${t.allLevels}`, count: RWANDA_EDUCATION_CURRICULUM.reduce((acc, c) => acc + c.subjects.length, 0) },
                    { id: 'nursery_pre_primary', label: 'I. 🍼 Nursery (ECD / Inshuke)', count: RWANDA_EDUCATION_CURRICULUM.find(c => c.id === 'nursery_pre_primary')?.subjects.length || 0 },
                    { id: 'primary_school', label: 'II. 🎒 Primary (P1 - P6)', count: RWANDA_EDUCATION_CURRICULUM.find(c => c.id === 'primary_school')?.subjects.length || 0 },
                    { id: 'secondary_o_level', label: 'III. 🏫 O-Level (S1 - S3)', count: RWANDA_EDUCATION_CURRICULUM.find(c => c.id === 'secondary_o_level')?.subjects.length || 0 },
                    { id: 'secondary_a_level', label: 'IV. 🎓 A-Level (S4 - S6 Combinations)', count: RWANDA_EDUCATION_CURRICULUM.find(c => c.id === 'secondary_a_level')?.subjects.length || 0 },
                    { id: 'ttc_colleges', label: 'V. 🧑‍🏫 TTCs (Nderabarezi)', count: RWANDA_EDUCATION_CURRICULUM.find(c => c.id === 'ttc_colleges')?.subjects.length || 0 },
                    { id: 'tvet_trades', label: 'VI. 🛠️ TVET (Imyuga)', count: RWANDA_EDUCATION_CURRICULUM.find(c => c.id === 'tvet_trades')?.subjects.length || 0 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCurriculumCatId(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        selectedCurriculumCatId === tab.id
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        selectedCurriculumCatId === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SUBJECTS GRID CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {RWANDA_EDUCATION_CURRICULUM
                  .filter(cat => selectedCurriculumCatId === 'all' || cat.id === selectedCurriculumCatId)
                  .map((category) => {
                    const filteredSubjects = category.subjects.filter((subj) => {
                      if (!catalogSearchQuery.trim()) return true;
                      const q = catalogSearchQuery.toLowerCase();
                      return (
                        subj.nameEn.toLowerCase().includes(q) ||
                        (subj.nameRw && subj.nameRw.toLowerCase().includes(q)) ||
                        (subj.nameFr && subj.nameFr.toLowerCase().includes(q)) ||
                        (subj.nameSw && subj.nameSw.toLowerCase().includes(q)) ||
                        (subj.suggestedCombinations && subj.suggestedCombinations.some(c => c.toLowerCase().includes(q))) ||
                        (subj.suggestedClasses && subj.suggestedClasses.some(c => c.toLowerCase().includes(q)))
                      );
                    });

                    if (filteredSubjects.length === 0) return null;

                    return (
                      <div key={category.id} className="space-y-3">
                        {/* CATEGORY HEADER */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md">
                              {category.badge}
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-white tracking-wide">
                                {selectedLanguage === 'Kinyarwanda' ? category.titleRw : selectedLanguage === 'Français' ? category.titleFr : selectedLanguage === 'Kiswahili' ? category.titleSw : category.titleEn}
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Classes: {category.levels.join(', ')} {category.combinations ? `• Options: ${category.combinations.join(', ')}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-slate-800 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                            {filteredSubjects.length} subjects
                          </span>
                        </div>

                        {/* SUBJECT CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredSubjects.map((subj) => {
                            const localizedName = getLocalizedSubjectName(subj);
                            return (
                              <div
                                key={subj.id}
                                className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 rounded-xl p-3.5 transition-all hover:shadow-lg hover:shadow-amber-500/5 group flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                      {localizedName}
                                    </h5>
                                    {subj.defaultPeriods && (
                                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        {subj.defaultPeriods}
                                      </span>
                                    )}
                                  </div>

                                  {/* Multi-language subtitle if different */}
                                  {selectedLanguage !== 'English' && subj.nameEn !== localizedName && (
                                    <p className="text-[10px] text-slate-400 italic mb-2">
                                      EN: {subj.nameEn}
                                    </p>
                                  )}
                                  {selectedLanguage === 'English' && subj.nameRw && (
                                    <p className="text-[10px] text-slate-400 italic mb-2">
                                      RW: {subj.nameRw}
                                    </p>
                                  )}

                                  {/* Suggested Classes & Combinations */}
                                  <div className="space-y-1 text-[11px] mb-3">
                                    {subj.suggestedClasses && subj.suggestedClasses.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-slate-400 text-[10px] font-semibold">Classes:</span>
                                        {subj.suggestedClasses.map((cls, cIdx) => (
                                          <span key={cIdx} className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px] font-medium">
                                            {cls}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {subj.suggestedCombinations && subj.suggestedCombinations.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                        <span className="text-slate-400 text-[10px] font-semibold">Stream/Option:</span>
                                        {subj.suggestedCombinations.slice(0, 3).map((cmb, cIdx) => (
                                          <span key={cIdx} className="bg-amber-950/40 text-amber-300 border border-amber-500/20 px-1.5 py-0.2 rounded text-[10px] font-medium">
                                            {cmb}
                                          </span>
                                        ))}
                                        {subj.suggestedCombinations.length > 3 && (
                                          <span className="text-[10px] text-slate-400">+{subj.suggestedCombinations.length - 3}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSelectSubject(subj, catalogTarget)}
                                  className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer mt-2"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{catalogTarget === 'ai' ? 'Select for AI Plan' : 'Apply to Sheet'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* MODAL FOOTER */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Rwanda CBC Curriculum Database: <strong>Nursery • Primary • O-Level • A-Level • TTC • TVET</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DATALIST FOR COMBINATIONS / STREAMS */}
        <datalist id="curriculum-combinations-datalist">
          {RWANDA_COMBINATIONS_AND_STREAMS.flatMap((grp, grpIdx) => 
            grp.options.map((opt, optIdx) => (
              <option key={`${grp.category}-${grpIdx}-${opt.value}-${optIdx}`} value={opt.value}>{opt.label}</option>
            ))
          )}
        </datalist>

        {/* SCHEME OF WORK SUBSCRIPTION MODAL */}
        <SubscriptionStatusModal
          isOpen={isSubModalOpen}
          onClose={() => {
            setIsSubModalOpen(false);
            setSchemeSubData(getSchemeSubscriptionStatus());
          }}
          initialTab="SCHEME"
        />

      </div>
    </div>
  );
};
