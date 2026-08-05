export type LanguageOption = 'English' | 'Kinyarwanda' | 'French' | 'Swahili';

export type PlanFormatOption = 'reb_grid' | 'open_format' | 'remedial_grid' | 'nursery_grid';

export interface SubscriptionPlan {
  id: string;
  plansCount: number;
  priceFrw: number;
  label: string;
  isFree?: boolean;
  popular?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  currentPlan: string;
  remainingPlans: number;
  totalGenerated: number;
  isAdmin?: boolean;
  authProvider?: 'google' | 'email' | 'custom';
  createdAt?: string;
  lastLoginAt?: string;
  status?: 'active' | 'blocked';
  loginCount?: number;
  sessionToken?: string;
  canDownloadCertificate?: boolean;
  monthlySlidesCount?: number;
  monthlyExercisesCount?: number;
  monthlyWorksheetsCount?: number;
  monthlySchemesCount?: number;
  monthlyDiaryCount?: number;
  lastResetMonth?: string;
  hasPremiumToolsSub?: boolean;
  premiumToolsExpiryDate?: string;
}

export interface LessonPlanRequest {
  schoolName: string;
  teacherName: string;
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
  location: string; // 'In classroom' | 'Outside'
  learningMaterials: string;
  references: string;
  language: LanguageOption;
  format: PlanFormatOption;
  additionalNotes?: string;
  // Remedial Learning Program (RLP) fields
  remedialCount?: string;
  consolidationCount?: string;
  extensionCount?: string;
  remedialGroup1Category?: string;
  remedialGroup2Category?: string;
  remedialGroup3Category?: string;
  remedialGroup4Category?: string;
  district?: string;
  mainProblemCategory?: string;
  specificChallenges?: string;
  teachingLearningAids?: string;
}

export interface LessonPlanStep {
  stepName: 'Introduction' | 'Development' | 'Conclusion' | string;
  timing: string;
  teacherActivities: string;
  learnerActivities: string;
  competencesAndCrossCutting: string;
}

export type LessonStep = LessonPlanStep;

export interface LessonPlanData {
  id: string;
  createdAt: string;
  language: LanguageOption;
  format: PlanFormatOption;
  header: {
    schoolName: string;
    teacherName: string;
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
    location: string;
    learningMaterials: string;
    references: string;
    remedialCount?: string;
    consolidationCount?: string;
    extensionCount?: string;
    remedialGroup1Category?: string;
    remedialGroup2Category?: string;
    remedialGroup3Category?: string;
    remedialGroup4Category?: string;
    district?: string;
    mainProblemCategory?: string;
    specificChallenges?: string;
    teachingLearningAids?: string;
    // Section B Objectives
    group1Objective?: string;
    group2Objective?: string;
    group3Objective?: string;
    // Section C
    identifiedProblems?: string;
    remedialActivitiesGroup1?: string;
    remedialActivitiesGroup2?: string;
    remedialActivitiesGroup3?: string;
    usedStepsAssessment?: string;
    remedialAids?: string;
    // Section D
    consolidationCategory?: string;
    consolidationActivities?: string;
    consolidationMethodology?: string;
    consolidationAids?: string;
    extensionCategory?: string;
    extensionActivities?: string;
    extensionMethodology?: string;
    extensionAids?: string;
  };
  steps: LessonPlanStep[];
  selfEvaluation: string;
  openFormatContent?: string;
  tags?: string[];
}

export interface PaymentSubmission {
  id: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  planId: string;
  planLabel: string;
  amountFrw: number;
  plansCount: number;
  momoTxRef: string;
  momoNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface LessonPlanLog {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  classGrade: string;
  unitTitle: string;
  lessonTitle: string;
  language: string;
  format: string;
  timestamp: string;
  schoolName?: string;
  instructionalObjective?: string;
}

// Exercises / Homework / Classwork / Quiz types
export type ExerciseType = 'homework' | 'classwork' | 'quiz';

export type QuestionCategory = 
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'short_answer'
  | 'long_answer'
  | 'matching'
  | 'calculation'
  | 'essay';

export interface ExerciseSectionConfig {
  id: string;
  title: string;
  category: QuestionCategory;
  questionCount: number;
  marksPerQuestion: number;
}

export interface ExerciseFormRequest {
  creationType: ExerciseType;
  curriculumType: 'REB' | 'RTB';
  subject: string;
  grade: string;
  topic: string;
  unit?: string;
  country: string;
  curriculumStandard: string;
  language: LanguageOption;
  timeAllowed: string;
  useSections: boolean;
  sections: ExerciseSectionConfig[];
  sourceContent?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  includeAnswerKey: boolean;
  includeMarkingScheme: boolean;
  includeHints: boolean;
  searchCurriculum: boolean;
}

export interface ExerciseQuestion {
  number: number;
  sectionTitle?: string;
  type: QuestionCategory;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  markingGuide?: string;
  hint?: string;
  marks: number;
}

export interface ExerciseOutputData {
  id: string;
  createdAt: string;
  creationType: ExerciseType;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  unit?: string;
  timeAllowed: string;
  totalQuestions: number;
  totalMarks: number;
  language: LanguageOption;
  instructions: string[];
  sections: {
    title: string;
    instructions?: string;
    questions: ExerciseQuestion[];
  }[];
  answerKey?: {
    questionNumber: number;
    answer: string;
    explanation?: string;
  }[];
  markingScheme?: {
    questionNumber: number;
    criteria: string;
    maxMarks: number;
  }[];
}

// Worksheet Generation types
export interface WorksheetRequest {
  subject: string;
  gradeLevel: string;
  topic: string;
  worksheetType: string;
  difficulty: string;
  questionCount: number;
  marksPerQuestion: number;
  language: string;
  curriculum?: string;
  country?: string;
  customInstructions?: string;
  additionalDetails?: string;
  webSearch: boolean;
  includeAnswerKey: boolean;
}

export interface WorksheetQuestion {
  number: number;
  questionText: string;
  options?: string[];
  marks: number;
}

export interface WorksheetData {
  id: string;
  createdAt: string;
  subject: string;
  gradeLevel: string;
  topic: string;
  worksheetType: string;
  difficulty: string;
  questionCount: number;
  marksPerQuestion: number;
  totalMarks: number;
  language: string;
  curriculum?: string;
  country?: string;
  customInstructions?: string;
  additionalDetails?: string;
  title: string;
  instructions: string[];
  questions: WorksheetQuestion[];
  answerKey?: {
    questionNumber: number;
    answer: string;
    explanation?: string;
  }[];
}

// Class Diary (Cahier de Textes) types
export interface ClassDiaryRequest {
  subject: string;
  classGrade: string;
  date: string;
  period: string;
  lessonTitle: string;
  language: LanguageOption;
  additionalInfo?: string;
}

export interface ClassDiaryData {
  id: string;
  createdAt: string;
  userEmail: string;
  subject: string;
  classGrade: string;
  date: string;
  period: string;
  lessonTitle: string;
  workCoveredSummary: string; // Ibyakozwe / Résumé du cours
  skillsCompetencesTargeted: string; // Ubushobozi bwifuzwa / Compétences visées
  homeworkAssigned: string; // Umukoro watanzwe / Devoirs donnés
  attendanceNotes: string; // Abasibye / Présence
  remarksObservations: string; // Ibyagaragaye / Remarques
  language: LanguageOption;
}

// AI Certificate Generator types
export interface CertificateRequest {
  recipientName: string;
  recipientRole: string;
  schoolName: string;
  certificateTitle: string;
  category: 'student_academic' | 'student_discipline' | 'remedial_progress' | 'teacher_cpd' | 'stem_award' | 'special_coach' | 'custom';
  citationText: string;
  issueDate: string;
  issuer1Name: string;
  issuer1Title: string;
  issuer2Name?: string;
  issuer2Title?: string;
  issuer3Name?: string;
  issuer3Title?: string;
  borderStyle: 'lime_gold_luxury' | 'reb_academic' | 'modern_emerald_lime';
  language: LanguageOption;
  gender?: 'male' | 'female' | 'academic_emblem' | 'special_coach_logo' | 'auto';
  ageGroup?: 'child' | 'adult' | 'auto';
  recipientPhoto?: string;
  courseName?: string;
  schoolLogo?: string;
  issuer1Signature?: string;
  issuer2Signature?: string;
  issuer3Signature?: string;
  useCursiveSignatures?: boolean;
}

export interface CertificateData extends CertificateRequest {
  id: string;
  createdAt: string;
  certificateNumber: string;
  userEmail?: string;
}

// Help Center & Tutorial System Types
export interface TutorialFaq {
  question: string;
  answer: string;
}

export interface TutorialItem {
  id: string;
  title: string;
  module: 'lesson_plans' | 'remedial' | 'nursery' | 'slides' | 'exercises' | 'worksheets' | 'library' | 'class_diary' | 'certificates' | 'subscription' | 'admin' | string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  version: string;
  videoScript?: string;
  faqList?: TutorialFaq[];
  guideContent?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface HelpChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'nav_tab' | 'open_video' | 'open_guide';
    target: string;
    label: string;
  };
  tutorialRef?: {
    id: string;
    title: string;
    module: string;
  };
}

export interface UserFeedback {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  category: 'suggestion' | 'bug' | 'praise' | 'help' | 'general';
  rating: number;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved' | string;
  adminReply?: string;
  timestamp: string;
}





