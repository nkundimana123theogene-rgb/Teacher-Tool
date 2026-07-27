export type LanguageOption = 'English' | 'Kinyarwanda' | 'French' | 'Swahili';

export type PlanFormatOption = 'reb_grid' | 'open_format';

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
  };
  steps: LessonPlanStep[];
  selfEvaluation: string;
  openFormatContent?: string;
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

