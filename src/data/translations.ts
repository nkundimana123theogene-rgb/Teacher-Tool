export interface LessonPlanLabels {
  schoolNameLabel: string;
  teacherNameLabel: string;
  term: string;
  date: string;
  subject: string;
  classGrade: string;
  unitNo: string;
  lessonNo: string;
  duration: string;
  classSize: string;
  specialNeeds: string;
  unitTitle: string;
  keyUnitCompetence: string;
  lessonTitle: string;
  instructionalObjective: string;
  planForClass: string;
  planLocationNote: string;
  learningMaterials: string;
  learningMaterialsNote: string;
  references: string;
  timingHeading: string;
  descriptionHeading: string;
  teacherActivitiesHeading: string;
  learnerActivitiesHeading: string;
  competencesHeading: string;
  selfEvaluation: string;
  // Menu Navigation
  navDashboard: string;
  navLessonPlans: string;
  navSavedPlans: string;
  navSubscription: string;
  navAdmin: string;
  navFounder: string;
}

export const LABELS_BY_LANGUAGE: Record<string, LessonPlanLabels> = {
  English: {
    schoolNameLabel: "School name:",
    teacherNameLabel: "Teacher's name:",
    term: "Term",
    date: "Date",
    subject: "Subject",
    classGrade: "Class",
    unitNo: "Unit N°",
    lessonNo: "Lesson N°",
    duration: "Duration",
    classSize: "Class size",
    specialNeeds: "Type of Special Educational Needs to be catered for in this lesson and number of learners in each category",
    unitTitle: "Unit title",
    keyUnitCompetence: "Key Unit Competence",
    lessonTitle: "Title of the lesson",
    instructionalObjective: "Instructional Objective",
    planForClass: "Plan for this Class",
    planLocationNote: "(location: in / outside)",
    learningMaterials: "Learning Materials",
    learningMaterialsNote: "(for all learners)",
    references: "References",
    timingHeading: "Timing for each step",
    descriptionHeading: "Description of teaching/learning activities",
    teacherActivitiesHeading: "Teacher's activities",
    learnerActivitiesHeading: "Learner's activities",
    competencesHeading: "Generic competences and Cross cutting issues to be addressed + a short explanation",
    selfEvaluation: "Teacher self-evaluation",
    navDashboard: "Dashboard",
    navLessonPlans: "Create Lesson Plan",
    navSavedPlans: "My Lesson Plans",
    navSubscription: "Subscription Status",
    navAdmin: "Admin",
    navFounder: "Nkundimana Theogene",
  },
  Kinyarwanda: {
    schoolNameLabel: "Izina ry'ishuri:",
    teacherNameLabel: "Izina ry'umwarimu:",
    term: "Igihembwe",
    date: "Itariki",
    subject: "Isomo",
    classGrade: "Umwaka",
    unitNo: "Umutwe N°",
    lessonNo: "Isomo N°",
    duration: "Igihe",
    classSize: "Abanyeshuri",
    specialNeeds: "Ubwoko bw'abafite ibyo bakeneye by'umwihariko n'umubare w'abanyeshuri mu buri kiciro",
    unitTitle: "Umutwe w'isomo",
    keyUnitCompetence: "Ubushobozi bw'umutwe",
    lessonTitle: "Isomo nyirizina",
    instructionalObjective: "Intego y'isomo",
    planForClass: "Ahazabera isomo",
    planLocationNote: "(ahantu: mu ishuri / hanze)",
    learningMaterials: "Ibikoresho by'isomo",
    learningMaterialsNote: "(by'abanyeshuri bose)",
    references: "Ibitabo byakoreshejwe",
    timingHeading: "Igihe cya buri kiciro",
    descriptionHeading: "Ibisobanuro by'ibikorwa byo kwiga no kwigisha",
    teacherActivitiesHeading: "Ibikorwa by'umwarimu",
    learnerActivitiesHeading: "Ibikorwa bw'umunyeshuri",
    competencesHeading: "Ubushobozi rusange n'insanganyamatsiko zirebana n'isomo + ibisobanuro ngufi",
    selfEvaluation: "Isuzuma ry'umwarimu",
    navDashboard: "Dashboard",
    navLessonPlans: "Create Lesson Plan",
    navSavedPlans: "My Lesson Plans",
    navSubscription: "Subscription Status",
    navAdmin: "Admin Panel",
    navFounder: "Nkundimana Theogene",
  },
  French: {
    schoolNameLabel: "Nom de l'école:",
    teacherNameLabel: "Nom de l'enseignant:",
    term: "Trimestre",
    date: "Date",
    subject: "Matière",
    classGrade: "Classe",
    unitNo: "Unité N°",
    lessonNo: "Leçon N°",
    duration: "Durée",
    classSize: "Effectif",
    specialNeeds: "Type de besoins éducatifs particuliers à prendre en compte et nombre d'apprenants dans chaque catégorie",
    unitTitle: "Titre de l'unité",
    keyUnitCompetence: "Compétence clé de l'unité",
    lessonTitle: "Titre de la leçon",
    instructionalObjective: "Objectif pédagogique",
    planForClass: "Lieu de la classe",
    planLocationNote: "(lieu: en classe / dehors)",
    learningMaterials: "Matériel didactique",
    learningMaterialsNote: "(pour tous les apprenants)",
    references: "Références",
    timingHeading: "Durée de chaque étape",
    descriptionHeading: "Description des activités d'enseignement / apprentissage",
    teacherActivitiesHeading: "Activités de l'enseignant",
    learnerActivitiesHeading: "Activités de l'apprenant",
    competencesHeading: "Compétences génériques et thèmes transversaux à aborder + une courte explication",
    selfEvaluation: "Auto-évaluation de l'enseignant",
    navDashboard: "Tableau de Bord",
    navLessonPlans: "Créer une Leçon",
    navSavedPlans: "Leçons Enregistrées",
    navSubscription: "Abonnement",
    navAdmin: "Admin",
    navFounder: "Nkundimana Theogene",
  },
  Swahili: {
    schoolNameLabel: "Jina la shule:",
    teacherNameLabel: "Jina la mwalimu:",
    term: "Muhula",
    date: "Tarehe",
    subject: "Somo",
    classGrade: "Darasa",
    unitNo: "Mada N°",
    lessonNo: "Somo N°",
    duration: "Muda",
    classSize: "Idadi ya wanafunzi",
    specialNeeds: "Aina ya Mahitaji Maalum ya Elimu yatakayoshughulikiwa na idadi ya wanafunzi katika kila kipengele",
    unitTitle: "Kichwa cha mada",
    keyUnitCompetence: "Uwezo Mkuu wa Mada",
    lessonTitle: "Kichwa cha somo",
    instructionalObjective: "Lengo la somo",
    planForClass: "Eneo la somo",
    planLocationNote: "(eneo: darasani / nje)",
    learningMaterials: "Zana za kufundishia",
    learningMaterialsNote: "(kwa wanafunzi wote)",
    references: "Marejeleo",
    timingHeading: "Muda wa kila hatua",
    descriptionHeading: "Maelezo ya shughuli za kufundisha / kujifunza",
    teacherActivitiesHeading: "Shughuli za mwalimu",
    learnerActivitiesHeading: "Shughuli za mwanafunzi",
    competencesHeading: "Uwezo wa jumla na masuala mtambuka yatakayoshughulikiwa + maelezo mafupi",
    selfEvaluation: "Tathmini binafsi ya mwalimu",
    navDashboard: "Deski la Mwalimu",
    navLessonPlans: "Tengeneza Somo",
    navSavedPlans: "Masomo Yaliyohifadhiwa",
    navSubscription: "Kifurushi",
    navAdmin: "Utawala",
    navFounder: "Nkundimana Theogene",
  },
};

export function getLessonPlanLabels(lang?: string): LessonPlanLabels {
  if (!lang) return LABELS_BY_LANGUAGE.English;
  const normalized = lang.trim().toLowerCase();
  if (normalized.includes('kinya') || normalized.includes('rwanda')) return LABELS_BY_LANGUAGE.Kinyarwanda;
  if (normalized.includes('french') || normalized.includes('francais') || normalized.includes('français')) return LABELS_BY_LANGUAGE.French;
  if (normalized.includes('swahili') || normalized.includes('kiswahili')) return LABELS_BY_LANGUAGE.Swahili;
  return LABELS_BY_LANGUAGE.English;
}
