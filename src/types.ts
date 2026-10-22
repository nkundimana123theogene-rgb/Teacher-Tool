export interface UserProfile {
  id: string;
  email: string;
  name: string;
  country: string;
  phone?: string;
  password?: string;
  currentPlan: string;
  remainingPlans: number;
  subscriptionPlan?: string;
  creditsRemaining?: number;
  totalCreditsAllowed?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  nextRenewalDate?: string;
  expiresAt?: string;
  subscriptionExpiresAt?: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  lastPaymentPlanName?: string;
  lastPaymentTxRef?: string;
  totalPlansPurchased?: number;
  purchasedPlans?: number;
  isAdmin?: boolean;
  hasPremiumToolsSub?: boolean;
  isPaid?: boolean;
  verifiedPayment?: boolean;
  verifiedAt?: string;
  lastPaymentAmount?: number;
  momoNumber?: string;
  verifiedServices?: string[];
  totalGenerated?: number;
  monthlySlidesCount?: number;
  monthlyExercisesCount?: number;
  monthlyWorksheetsCount?: number;
  monthlyDiaryCount?: number;
  createdAt: string;
  lastLoginAt?: string;
  lastMonthlyResetAt?: string;
  loginMethod?: string;
  status?: string;
  loginCount?: number;
  logoutCount?: number;
  sessionLogs?: { action: 'LOGIN' | 'LOGOUT', timestamp: string }[];
  stats?: {
    lessonPlansCount: number;
    nurseryPlansCount: number;
    examsCount: number;
    worksheetsCount: number;
    diaryEntriesCount: number;
    certificatesCount: number;
    totalItems: number;
  };
  aiUsageStats?: {
    homeworkQuizCount: number;
    presentationSlidesCount: number;
    worksheetsCount: number;
  };
}

export interface AiBillingRecord {
  id: string;
  transactionRef: string;
  date: string;
  planId: string;
  planName: string;
  amountRwf: number;
  credits: number;
  paymentMethod: 'MTN Mobile Money' | 'Airtel Money' | 'Free Tier' | 'Admin Approval' | string;
  phoneNumber: string;
  status: 'Active' | 'Paid' | 'Completed' | string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
  teacherName?: string;
  teacherEmail?: string;
  userId?: string;
  expiresAt?: string;
  expiryDate?: string;
  usedPlans?: number;
  remainingPlans?: number;
  plansGranted?: number;
  plansPurchased?: number;
  amount?: number;
  method?: string;
  phone?: string;
  transactionProof?: string;
  receiptScreenshot?: string;
  screenshotUrl?: string;
}

export interface CreditUsageLog {
  id: string;
  serviceType: 'homework_quiz' | 'presentation_slides' | 'printable_worksheet';
  serviceName: string;
  itemTitle: string;
  creditsDeducted: number;
  creditsRemainingAfter: number;
  timestamp: string;
}

export interface LessonStep {
  duration: string;
  teacherActivity: string;
  learnerActivity: string;
  competences: string;
}

export interface CbcLessonPlanData {
  id: string;
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  subject: string;
  className: string;
  unitNumber: string;
  lessonNumber: string;
  duration: string;
  classSize: string;
  specialNeeds: string;
  unitTitle: string;
  keyUnitCompetence: string;
  lessonTitle: string;
  instructionalObjective: string;
  classLocation: string; // e.g. "Inside classroom" or "Outside"
  learningMaterials: string;
  references: string;
  timingIntro: string;
  teacherActivityIntro: string;
  learnerActivityIntro: string;
  genericCompetencesIntro: string;
  timingDev: string;
  teacherActivityDev: string;
  learnerActivityDev: string;
  genericCompetencesDev: string;
  timingConcl: string;
  teacherActivityConcl: string;
  learnerActivityConcl: string;
  genericCompetencesConcl: string;
  descActivities?: string;
  genericCompetences?: string;
  crossCuttingIssues?: string;
  teacherSelfEvaluation: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonPlan {
  id: string;
  teacherName: string;
  schoolName: string;
  planType?: string; // 'Competence-Based Curriculum (CBC)' | 'Remedial Lesson Plan'
  language?: string; // 'English'
  className: string;
  subject: string;
  unitNumber: string;
  unitName: string;
  lessonNumber: string;
  lessonName: string;
  date: string;
  duration: string;
  classSize: string;
  keyCompetence: string;
  instructionalObjective?: string;
  crossCuttingIssues?: string;
  genericCompetences?: string;
  objectives: {
    knowledge: string;
    skills: string;
    attitudes: string;
  };
  materials: string;
  steps: {
    introduction: LessonStep;
    presentation: LessonStep;
    conclusion: LessonStep;
  };
  competencesAddressed: string;
  references?: string;
  createdAt: string;
}

export interface NurseryLessonPlanData {
  id: string;
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  subject: string;
  classLevel: string;
  lessonName: string;
  duration: string;
  classSize: string;
  language: string;
  competenceFocus: string;
  instructionalObjective: string;
  learningMaterials: string;
  steps: {
    greetingCircle: {
      duration: string;
      activities: string;
    };
    guidedLearning: {
      duration: string;
      activities: string;
    };
    creativePlay: {
      duration: string;
      activities: string;
    };
    recapAndGoodbye: {
      duration: string;
      activities: string;
    };
  };
  evaluationComments: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false' | 'matching';
  questionText: string;
  options?: string[]; // MCQs only
  correctAnswer?: string;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  className: string;
  duration: string;
  instructions: string;
  questions: ExamQuestion[];
  totalMarks: number;
  createdAt: string;
}

export interface WorksheetItem {
  id: string;
  instruction: string;
  content: string; // Drawing space, matching table, or fill in blank
}

export interface Worksheet {
  id: string;
  title: string;
  subject: string;
  className: string;
  topic: string;
  instructions: string;
  items: WorksheetItem[];
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  className: string;
  subject: string;
  lessonsCovered: string;
  homeworkAssigned: string;
  absentStudents: string;
  notes: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  recipientName: string;
  awardTitle: string; // e.g. Best Performing Student, Teacher Excellence
  schoolName: string;
  issueDate: string;
  signatureName: string;
  signatureRole: string; // e.g. Head Teacher
  theme: 'classic-gold' | 'emerald-academic' | 'royal-blue' | 'modern-teal';
  secureCode: string; // Secure ID or QR Content representation
  createdAt: string;
}

export interface RemedialGroupActivity {
  problem: string;
  activities: string;
  methodology: string;
  learningAids: string;
}

export interface RemedialConsolidationActivity {
  categoryAndExplanation: string;
  activities: string;
  methodology: string;
  learningAids: string;
}

export interface RemedialLessonPlanData {
  id: string;
  teacherName: string;
  className: string;
  subject: string;
  lessonName: string;
  period: string;
  date: string;
  language?: string;
  group1Count: string;
  group2Count: string;
  group3Count: string;
  introduction: string;
  strugglingLearners: {
    group1: {
      categoriesAndIssues: string;
      objectives: string;
    };
    group2: {
      categoriesAndIssues: string;
      objectives: string;
    };
    group3: {
      categoriesAndIssues: string;
      objectives: string;
    };
  };
  remedialActivities: {
    group1: RemedialGroupActivity;
    group2: RemedialGroupActivity;
  };
  consolidationActivities: {
    group3: RemedialConsolidationActivity;
    group4: RemedialConsolidationActivity;
  };
  selfEvaluation: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeOfWorkRow {
  id: string;
  weekNumber: number;
  dates: string;
  unitNumber: string;
  unitTitle: string;
  lessonNumber: string;
  lessonTitle: string;
  evaluation: string;
  learningObjectives: string;
  keyUnitCompetence: string;
  teachingMethods: string;
  evaluationProcedures: string;
  resourcesAndReferences: string;
  observations: string;
  // 9-column official REB standard fields
  contentSummary?: string;
  teachingActivities?: string;
  learningAids?: string;
  assessment?: string;
  references?: string;
  weeklyRemarks?: string;
}

export interface SchemeOfWorkData {
  id: string;
  academicYear: string;
  term: string;
  schoolName: string;
  subject: string;
  teacherName: string;
  className: string;
  combination: string;
  periodsPerWeek: string;
  language: string; // 'English' | 'Kinyarwanda' | 'Français' | 'Kiswahili'
  rows: SchemeOfWorkRow[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'news' | 'update' | 'info' | 'alert';
  isActive: boolean;
  authorName?: string;
  authorEmail?: string;
  isPinned?: boolean;
}

export interface AppConfig {
  id: string;
  whatsappNumber?: string;
  supportEmail?: string;
  chatbotGreeting?: string;
  isMaintenanceMode?: boolean;
  broadcastBanner?: string;
  broadcastBannerActive?: boolean;
  momoNumber?: string;
  momoName?: string;
  systemNotice?: string;
  lastUpdated?: string;
}

export interface SavedAssessmentTemplate {
  id: string;
  userId?: string;
  name: string;
  type: string;
  subject: string;
  grade: string;
  topic: string;
  unit?: string;
  language: string;
  createdAt: string;
  updatedAt?: string;
  sections: any[];
  instructions?: string[];
  fullAssessment?: any;
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  timing?: string;
  teacherNote?: string;
  imagePrompt?: string;
  imageSvg?: string;
}

export interface PresentationSlideDeck {
  id: string;
  userId?: string;
  title: string;
  subtitle?: string;
  subject: string;
  grade: string;
  topic: string;
  duration: string;
  language: string;
  country?: string;
  curriculum?: string;
  theme: string;
  totalSlides: number;
  slides: PresentationSlide[];
  createdAt: string;
  updatedAt?: string;
}

export type MainViewType = 
  | 'dashboard'
  | 'lessonPlanning'
  | 'teacherResources'
  | 'rebBooks'
  | 'myRecords'
  | 'subscription'
  | 'helpSupport';

export interface CertificateRecord {
  id: string;
  verificationNo: string;
  recipientName: string;
  title?: string;
  description?: string;
  schoolName?: string;
  issueDate?: string;
  leftSignatureName?: string;
  leftSignatureTitle?: string;
  rightSignatureName?: string;
  rightSignatureTitle?: string;
  issuerWebsite?: string;
  status: 'Unverified' | 'Authentic';
  isUnlocked?: boolean;
  paymentStatus?: 'Locked' | 'Unlocked' | 'Paid' | 'Pending';
  unlockedBy?: string;
  unlockedAt?: string;
  momoNumber?: string;
  momoTxId?: string;
  momoSenderName?: string;
  paymentRequestedAt?: string;
  userId?: string;
  scannedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificatePaymentRecord {
  id: string;
  userId: string;
  verificationNo?: string;
  recipientName?: string;
  amount: number;
  manualUnlock?: boolean;
  isUnlocked?: boolean;
  status?: string;
  paidAt: string;
  unlockedBy?: string;
}

export interface PaymentNotification {
  id: string;
  target: 'ADMIN' | 'USER' | 'BROADCAST';
  recipientEmail?: string;
  recipientPhone?: string;
  type: 'PAYMENT_RECEIVED' | 'PAYMENT_SENT_PLANS_UNLOCKED' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  smsPreview?: string;
  amount: number;
  currency?: string;
  phone?: string;
  senderName?: string;
  receiverName?: string;
  receiverPhone?: string;
  userEmail?: string;
  plansGranted: number;
  txRef: string;
  paymentMethod: string;
  read: boolean;
  createdAt: string;
  displayTime?: string;
}
