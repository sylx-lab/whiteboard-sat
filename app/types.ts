export type Subject = 'math' | 'reading_writing';

export type MathDomain = 
  | 'algebra' 
  | 'advanced_math' 
  | 'problem_solving_data_analysis' 
  | 'geometry_trigonometry';

export type ReadingWritingDomain = 
  | 'information_ideas' 
  | 'craft_structure' 
  | 'expression_ideas' 
  | 'standard_english_conventions';

export type Domain = MathDomain | ReadingWritingDomain;

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'draft' | 'published' | 'archived';

export interface AnswerChoice {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  code: string; // e.g. "M-ALG-101"
  subject: Subject;
  section: string;
  domain: Domain;
  topic: string;
  subtopic: string;
  source: string; // e.g. "White Board Official", "Educator Bank 2026", "Redbook Practice"
  difficulty: Difficulty;
  question_text: string;
  stimulus?: string; // passage or context table
  /** A figure shown above the question text — a diagram, graph or table image. */
  imageUrl?: string;
  hasMath?: boolean;
  choices?: AnswerChoice[];
  answer_choices?: AnswerChoice[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanation_resource_link?: string;
  is_free: boolean;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
}

export interface QuestionInteractionState {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isSubmitted: boolean;
  isMarkedForReview: boolean;
  isBookmarked: boolean;
  crossedOutChoices: ('A' | 'B' | 'C' | 'D')[];
  timeSpentSeconds: number;
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  questionId: string;
  questionCode?: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  correctAnswer?: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeSpentSeconds: number;
  attemptedAt: string;
  timestamp: string;
  domain: Domain;
  subject: Subject;
  difficulty: Difficulty;
}

export interface PracticeSession {
  id: string;
  userId: string;
  subject?: Subject;
  domain?: Domain;
  topic?: string;
  questionIds: string[];
  currentIndex: number;
  interactions: Record<string, QuestionInteractionState>;
  startedAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface MockTestModule {
  id: string;
  testId: string;
  title: string;
  section: 'reading_writing' | 'math';
  moduleNumber: 1 | 2;
  timeLimitMinutes: number;
  questions: Question[];
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  is_free: boolean;
  difficulty: Difficulty;
  /** If set, only students enrolled in this course (or premium) can sit; empty = follow is_free/paid pass */
  courseId?: string | null;
  /** Multi-course variant — if either is set it gates. Kept nullable for backward compat. */
  courseIds?: string[];
  totalQuestions: number;
  totalTimeMinutes: number;
  modules: MockTestModule[];
}

export interface MockTestAttempt {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  status: 'in_progress' | 'completed';
  currentModuleIndex: number;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  interactions: Record<string, QuestionInteractionState>;
  startedAt: string;
  completedAt?: string;
  scoreSummary?: {
    totalCorrect: number;
    totalQuestions: number;
    accuracyPercent: number;
    mathScoreEstimated: number; // e.g. 200-800
    rwScoreEstimated: number;   // e.g. 200-800
    totalScoreEstimated: number;// e.g. 400-1600
    mathCorrect: number;
    mathTotal: number;
    rwCorrect: number;
    rwTotal: number;
    timeSpentSeconds: number;
    domainBreakdown: Record<string, { correct: number; total: number }>;
  };
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl?: string;
  isFreePreview: boolean;
  order: number;
  resources?: { name: string; url: string; type: 'pdf' | 'link' | 'formula' }[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  subject: Subject | 'both';
  difficulty: string;
  instructorName: string;
  instructorTitle: string;
  price: number;
  originalPrice: number;
  is_published: boolean;
  features: string[];
  lessonsCount: number;
  totalHours: number;
  lessons: Lesson[];
  level: 'All Levels' | 'Intermediate' | 'Advanced 1500+';
  badge?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: 'formula_sheet' | 'grammar_guide' | 'strategy_pdf' | 'video_breakdown' | 'desmos_tutorial';
  subject: Subject | 'general';
  is_free: boolean;
  downloadUrl?: string;
  externalUrl?: string;
  readTime: string;
  dateAdded: string;
}

export interface ProductPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  period: string;
  badge?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  grants: {
    premiumMath?: boolean;
    premiumReadingWriting?: boolean;
    redbookPractice?: boolean;
    allCourses?: boolean;
    mockTestsAll?: boolean;
    fullPremium?: boolean;
  };
  features: string[];
}

export interface AccessGrants {
  premiumMath: boolean;
  premiumReadingWriting: boolean;
  redbookPractice: boolean;
  enrolledCourseIds: string[];
  unlockedMockTestIds?: string[];
  fullPremium: boolean;
}

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface PaymentSubmission {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  productId: string;
  productName: string;
  productTitle?: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Credit Card' | 'Direct Gateway';
  referenceNumber: string;
  senderPhoneNumber: string;
  notes?: string;
  status: PaymentStatus;
  submittedAt: string;
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type AdminRole = 'super_admin' | 'content_manager' | 'support_admin';

export interface AdminPermission {
  canManageStudents: boolean;
  canManageCourses: boolean;
  canManagePractice: boolean;
  canManageMockTests: boolean;
  canManagePurchases: boolean;
  canManageResources: boolean;
  canManageSubAdmins: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'student' | 'admin' | 'sub_admin';
  targetScore: number;
  examDate?: string;
  createdAt: string;
  access: AccessGrants;
  permissions?: AdminPermission;
  /** ISO timestamp; absent means the address has not been confirmed yet. */
  emailVerifiedAt?: string;
  /** Bookmark button on QuestionCard; previously component-local, so it died on unmount. */
  bookmarkedQuestionIds?: string[];
  isSuspended?: boolean;
  status?: 'active' | 'suspended';
}

export type AuthResult =
  | { ok: true; user: UserProfile }
  | { ok: false; error: string };

export type AppTheme = 'white' | 'warm' | 'dark';

export interface PaymentMethodConfig {
  enabled: boolean;
  accountNumber: string;
  accountType: 'Personal' | 'Merchant' | 'Agent';
  instructions?: string;
}

export interface BankTransferConfig {
  enabled: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  routingNumber?: string;
  instructions?: string;
}

export interface PaymentSettings {
  id: string;
  bkash: PaymentMethodConfig;
  nagad: PaymentMethodConfig;
  rocket?: PaymentMethodConfig;
  bankTransfer?: BankTransferConfig;
  supportPhone?: string;
  supportEmail?: string;
  updatedAt?: string;
}

