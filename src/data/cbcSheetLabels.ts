export type CbcLanguage = 'Kinyarwanda' | 'English' | 'Français' | 'Kiswahili';

export interface CbcSheetLabelSet {
  docHeaderTitle: string;
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  subject: string;
  classLevel: string;
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
  locationSub: string;
  learningMaterials: string;
  materialsSub: string;
  references: string;
  timing: string;
  descActivities: string;
  teacherActivities: string;
  learnerActivities: string;
  competencesAndCrossCutting: string;
  intro: string;
  dev: string;
  concl: string;
  teacherSelfEval: string;
  teacherSelfEvalSub: string;
  teacherSelfEvalPlaceholder: string;
  genericCompetencesTitle: string;
  crossCuttingIssuesTitle: string;
}

export const CBC_SHEET_LABELS: Record<CbcLanguage, CbcSheetLabelSet> = {
  Kinyarwanda: {
    docHeaderTitle: "INTEGANYANYIGISHO Y'ISOMO",
    schoolName: "Izina ry'ishuri:",
    teacherName: "Izina ry'umwarimu:",
    term: "Igihembwe",
    date: "Itariki",
    subject: "Isomo",
    classLevel: "Umwaka",
    unitNo: "Umutwe N°",
    lessonNo: "Isomo N°",
    duration: "Igihe",
    classSize: "Umubare",
    specialNeeds: "Ubwoko bw'ubumuga no kubana n'ibibazo byihariye mu kwiga n'umubare w'abanyeshuri mu buri kiciro",
    unitTitle: "Umutwe w'icyigwa",
    keyUnitCompetence: "Ubumenyi n'ubushobozi bw'umutwe",
    lessonTitle: "Umutwe w'isomo",
    instructionalObjective: "Intego y'isomo",
    planForClass: "Aho kwigishiriza",
    locationSub: "mu cyumba cyangwa hanze",
    learningMaterials: "Imfashanyigisho",
    materialsSub: "z'abanyeshuri bose",
    references: "Ibitabo n'integanyanyigisho",
    timing: "Igihe cy'buri gice",
    descActivities: "Ibisobanuro by'ibikorwa byo kwigisha no kwiga",
    teacherActivities: "Ibikorwa by'Umwarimu",
    learnerActivities: "Ibikorwa bw'Umunyeshuri",
    competencesAndCrossCutting: "Ubushobozi rusange n'Ibibazo byambukiranya amasomo + ibisobanuro",
    intro: "Intangiriro",
    dev: "Inyigisho nyirizina",
    concl: "Umusozo / Umwanzuro",
    teacherSelfEval: "Isuzuma ry'Umwarimu",
    teacherSelfEvalSub: "",
    teacherSelfEvalPlaceholder: "Siga ubusa mbere yo kwigisha cyangwa wandikemo uko isomo ryagenze...",
    genericCompetencesTitle: "Ubushobozi rusange bwubakwa muri iri somo",
    crossCuttingIssuesTitle: "Ibibazo byambukiranya amasomo n'indangagaciro"
  },
  English: {
    docHeaderTitle: "LESSON PLAN",
    schoolName: "School Name:",
    teacherName: "Teacher's name:",
    term: "Term",
    date: "Date",
    subject: "Subject",
    classLevel: "Class",
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
    locationSub: "in / outside classroom",
    learningMaterials: "Learning Materials",
    materialsSub: "for all learners",
    references: "References",
    timing: "Timing for each step",
    descActivities: "Description of teaching and learning activity",
    teacherActivities: "Teacher activities",
    learnerActivities: "Learner activities",
    competencesAndCrossCutting: "Generic competence and Cross cutting issues to be addressed + a short explanation",
    intro: "Introduction",
    dev: "Development of the lesson",
    concl: "Conclusion",
    teacherSelfEval: "Teacher self-evaluation",
    teacherSelfEvalSub: "",
    teacherSelfEvalPlaceholder: "Leave blank before teaching or enter your evaluation remarks...",
    genericCompetencesTitle: "Generic Competences developed in this lesson",
    crossCuttingIssuesTitle: "Cross-cutting Issues integrated in this lesson"
  },
  Français: {
    docHeaderTitle: "FICHE DE LEÇON",
    schoolName: "Nom de l'école:",
    teacherName: "Nom de l'enseignant:",
    term: "Trimestre",
    date: "Date",
    subject: "Matière",
    classLevel: "Classe",
    unitNo: "Unité N°",
    lessonNo: "Leçon N°",
    duration: "Durée",
    classSize: "Effectif",
    specialNeeds: "Type de Besoins Éducatifs Particuliers et nombre d'élèves dans chaque catégorie",
    unitTitle: "Titre de l'unité",
    keyUnitCompetence: "Compétence Clé de l'Unité",
    lessonTitle: "Titre de la leçon",
    instructionalObjective: "Objectif Pédagogique",
    planForClass: "Planification pour la classe",
    locationSub: "en classe ou dehors",
    learningMaterials: "Matériels Didactiques",
    materialsSub: "pour tous les élèves",
    references: "Références Bibliographiques",
    timing: "Durée de chaque étape",
    descActivities: "Description des activités d'enseignement et d'apprentissage",
    teacherActivities: "Activités de l'enseignant",
    learnerActivities: "Activités de l'apprenant",
    competencesAndCrossCutting: "Compétences Génériques et Thèmes Transversaux + courte explication",
    intro: "Introduction",
    dev: "Développement de la leçon",
    concl: "Conclusion",
    teacherSelfEval: "Auto-évaluation de l'enseignant",
    teacherSelfEvalSub: "",
    teacherSelfEvalPlaceholder: "Laissez vide avant le cours ou saisissez votre auto-évaluation...",
    genericCompetencesTitle: "Compétences Génériques développées dans cette leçon",
    crossCuttingIssuesTitle: "Questions Transversales intégrées dans cette leçon"
  },
  Kiswahili: {
    docHeaderTitle: "MPANGO WA SOMO",
    schoolName: "Jina la Shule:",
    teacherName: "Jina la Mwalimu:",
    term: "Muhula",
    date: "Tarehe",
    subject: "Somo",
    classLevel: "Darasa",
    unitNo: "Sura N°",
    lessonNo: "Somo N°",
    duration: "Muda",
    classSize: "Idadi",
    specialNeeds: "Aina ya Mahitaji Maalumu ya Kujifunzia na idadi ya wanafunzi katika kila kategoria",
    unitTitle: "Kichwa cha Sura",
    keyUnitCompetence: "Umahiri Mkuu wa Sura",
    lessonTitle: "Kichwa cha Somo",
    instructionalObjective: "Lengo la Somo",
    planForClass: "Mpango wa Darasa",
    locationSub: "darasani au nje",
    learningMaterials: "Vifaa vya Kufundishia",
    materialsSub: "kwa wanafunzi wote",
    references: "Marejeleo ya Vitabu",
    timing: "Muda wa kila hatua",
    descActivities: "Maelezo ya shughuli za kufundisha na kujifunza",
    teacherActivities: "Shughuli za mwalimu",
    learnerActivities: "Shughuli za mwanafunzi",
    competencesAndCrossCutting: "Umahiri wa Jumla na Masuala Mtambuka + maelezo mafupi",
    intro: "Utangulizi",
    dev: "Ukuaji wa somo",
    concl: "Hitimisho",
    teacherSelfEval: "Tathmini ya mwalimu",
    teacherSelfEvalSub: "",
    teacherSelfEvalPlaceholder: "Acha wazi kabla ya kufundisha au andika tathmini yako...",
    genericCompetencesTitle: "Umahiri wa Jumla uliotengenezwa katika somo hili",
    crossCuttingIssuesTitle: "Masuala Mtambuka yaliyounganishwa katika somo hili"
  }
};
