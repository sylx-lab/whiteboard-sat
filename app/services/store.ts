import { useState, useEffect } from 'react';
import {
  UserProfile,
  Question,
  Course,
  Lesson,
  ResourceItem,
  ProductPlan,
  MockTest,
  MockTestAttempt,
  PracticeAttempt,
  PaymentSubmission,
  AppTheme,
  AdminPermission,
  AuthResult,
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_COURSES,
  INITIAL_RESOURCES,
  INITIAL_PLANS,
  INITIAL_MOCK_TESTS,
  DEMO_STUDENT,
  DEMO_ADMIN,
} from '../data/seedData';
import { ALL_DOMAINS } from '../lib/utils';
import { canSeeCourse, canSeeMockTest, canSeeQuestion, applyPlanGrants } from '../lib/access';
import { scoreAttempt } from '../lib/mockTests';

/** Every admin capability off — the starting point for a new staff member. */
const BLANK_PERMISSIONS: AdminPermission = {
  canManageStudents: false,
  canManagePurchases: false,
  canManagePractice: false,
  canManageCourses: false,
  canManageMockTests: false,
  canManageResources: false,
  canManageSubAdmins: false,
};

const STORAGE_KEYS = {
  CURRENT_USER: 'wbsat_user',
  ALL_USERS: 'wbsat_all_users',
  QUESTIONS: 'wbsat_questions',
  COURSES: 'wbsat_courses',
  RESOURCES: 'wbsat_resources',
  MOCK_TESTS: 'wbsat_mock_tests',
  MOCK_ATTEMPTS: 'wbsat_mock_attempts',
  PRACTICE_ATTEMPTS: 'wbsat_practice_attempts',
  PAYMENTS: 'wbsat_payments',
  COURSE_PROGRESS: 'wbsat_course_progress',
  THEME: 'wbsat_theme',
};

// Initial state loader helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Initial demo students
const INITIAL_STUDENTS_LIST: UserProfile[] = [
  DEMO_STUDENT,
  DEMO_ADMIN,
  {
    id: 'user-std-2',
    name: 'Nafis Chowdhury',
    phone: '+880 1911 223344',
    email: 'nafis.chowdhury@example.com',
    role: 'student',
    targetScore: 1520,
    examDate: '2026-11-01',
    createdAt: '2026-01-20',
    status: 'active',
    access: {
      premiumMath: false,
      premiumReadingWriting: false,
      redbookPractice: false,
      enrolledCourseIds: [],
      fullPremium: false,
    },
  },
  {
    id: 'user-std-3',
    name: 'Aysha Rahman',
    phone: '+880 1812 556677',
    email: 'aysha.r@example.com',
    role: 'student',
    targetScore: 1580,
    examDate: '2026-09-15',
    createdAt: '2026-02-01',
    status: 'active',
    access: {
      premiumMath: true,
      premiumReadingWriting: true,
      redbookPractice: true,
      enrolledCourseIds: ['c-full-1550'],
      fullPremium: true,
    },
  },
];

const INITIAL_PAYMENTS: PaymentSubmission[] = [
  {
    id: 'pay-001',
    userId: 'user-std-2',
    userName: 'Nafis Chowdhury',
    userPhone: '+880 1911 223344',
    productId: 'plan-bundle',
    productName: 'Full 1550+ Master Pass',
    productTitle: 'Full 1550+ Master Pass',
    amount: 3900,
    paymentMethod: 'bKash',
    referenceNumber: 'BK9X872631',
    senderPhoneNumber: '+880 1911 223344',
    notes: 'Sent via bKash Merchant payment. Need urgent access.',
    status: 'pending',
    submittedAt: '2026-02-18T10:30:00Z',
    createdAt: '2026-02-18T10:30:00Z',
  },
  {
    id: 'pay-002',
    userId: DEMO_STUDENT.id,
    userName: DEMO_STUDENT.name,
    userPhone: DEMO_STUDENT.phone ?? '',
    productId: 'plan-math',
    productName: 'Premium Math Pass',
    productTitle: 'Premium Math Pass',
    amount: 2200,
    paymentMethod: 'Nagad',
    referenceNumber: 'NG77123908',
    senderPhoneNumber: '+880 1712 345678',
    notes: 'Approved during enrollment.',
    status: 'verified',
    submittedAt: '2026-01-05T14:20:00Z',
    createdAt: '2026-01-05T14:20:00Z',
    reviewedAt: '2026-01-05T15:00:00Z',
    reviewedBy: 'Admin Supervisor',
  },
];

// Initial mock practice attempts
const INITIAL_PRACTICE_ATTEMPTS: PracticeAttempt[] = [
  {
    id: 'att-1',
    userId: DEMO_STUDENT.id,
    questionId: 'q-m-01',
    questionCode: 'M-ALG-101',
    selectedAnswer: 'B',
    correctAnswer: 'B',
    isCorrect: true,
    timeSpentSeconds: 45,
    attemptedAt: '2026-02-15T12:00:00Z',
    timestamp: '2026-02-15T12:00:00Z',
    domain: 'algebra',
    subject: 'math',
    difficulty: 'medium',
  },
  {
    id: 'att-2',
    userId: DEMO_STUDENT.id,
    questionId: 'q-m-02',
    questionCode: 'M-ADV-102',
    selectedAnswer: 'A',
    correctAnswer: 'A',
    isCorrect: true,
    timeSpentSeconds: 65,
    attemptedAt: '2026-02-15T12:05:00Z',
    timestamp: '2026-02-15T12:05:00Z',
    domain: 'advanced_math',
    subject: 'math',
    difficulty: 'hard',
  },
  {
    id: 'att-3',
    userId: DEMO_STUDENT.id,
    questionId: 'q-rw-01',
    questionCode: 'RW-CRA-101',
    selectedAnswer: 'C',
    correctAnswer: 'C',
    isCorrect: true,
    timeSpentSeconds: 38,
    attemptedAt: '2026-02-16T14:00:00Z',
    timestamp: '2026-02-16T14:00:00Z',
    domain: 'craft_structure',
    subject: 'reading_writing',
    difficulty: 'medium',
  },
  {
    id: 'att-4',
    userId: DEMO_STUDENT.id,
    questionId: 'q-rw-02',
    questionCode: 'RW-SEC-102',
    selectedAnswer: 'A',
    correctAnswer: 'B',
    isCorrect: false,
    timeSpentSeconds: 52,
    attemptedAt: '2026-02-16T14:08:00Z',
    timestamp: '2026-02-16T14:08:00Z',
    domain: 'standard_english_conventions',
    subject: 'reading_writing',
    difficulty: 'hard',
  },
];

// Initial mock test attempts
const INITIAL_MOCK_ATTEMPTS: MockTestAttempt[] = [
  {
    id: 'm-att-seed-1',
    userId: DEMO_STUDENT.id,
    testId: 'mock-01-diagnostic',
    testTitle: 'Digital SAT Official Diagnostic Mock #1',
    status: 'completed',
    currentModuleIndex: 3,
    currentQuestionIndex: 1,
    timeRemainingSeconds: 0,
    interactions: {
      'q-m-01': {
        questionId: 'q-m-01',
        selectedAnswer: 'B',
        isSubmitted: true,
        isMarkedForReview: false,
        isBookmarked: false,
        crossedOutChoices: [],
        timeSpentSeconds: 45,
      },
      'q-m-02': {
        questionId: 'q-m-02',
        selectedAnswer: 'A',
        isSubmitted: true,
        isMarkedForReview: false,
        isBookmarked: false,
        crossedOutChoices: [],
        timeSpentSeconds: 65,
      },
      'q-rw-01': {
        questionId: 'q-rw-01',
        selectedAnswer: 'C',
        isSubmitted: true,
        isMarkedForReview: false,
        isBookmarked: false,
        crossedOutChoices: [],
        timeSpentSeconds: 40,
      },
      'q-rw-02': {
        questionId: 'q-rw-02',
        selectedAnswer: 'B',
        isSubmitted: true,
        isMarkedForReview: false,
        isBookmarked: false,
        crossedOutChoices: [],
        timeSpentSeconds: 50,
      },
    },
    startedAt: '2026-02-10T09:00:00Z',
    completedAt: '2026-02-10T11:15:00Z',
    scoreSummary: {
      totalCorrect: 14,
      totalQuestions: 16,
      accuracyPercent: 88,
      mathScoreEstimated: 760,
      rwScoreEstimated: 720,
      totalScoreEstimated: 1480,
      mathCorrect: 7,
      mathTotal: 8,
      rwCorrect: 7,
      rwTotal: 8,
      timeSpentSeconds: 4200,
      domainBreakdown: {
        algebra: { correct: 2, total: 2 },
        advanced_math: { correct: 2, total: 2 },
        problem_solving_data_analysis: { correct: 2, total: 2 },
        geometry_trigonometry: { correct: 1, total: 2 },
        information_ideas: { correct: 2, total: 2 },
        craft_structure: { correct: 2, total: 2 },
        expression_ideas: { correct: 2, total: 2 },
        standard_english_conventions: { correct: 1, total: 2 },
      },
    },
  },
];

export function useAppStore() {
  // Theme
  const [theme, setThemeState] = useState<AppTheme>(() => loadFromStorage(STORAGE_KEYS.THEME, 'white'));

  // User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENT_USER, DEMO_STUDENT)
  );
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() =>
    loadFromStorage(STORAGE_KEYS.ALL_USERS, INITIAL_STUDENTS_LIST)
  );

  // Questions
  const [questions, setQuestions] = useState<Question[]>(() =>
    loadFromStorage(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS)
  );

  // Courses
  const [courses, setCourses] = useState<Course[]>(() =>
    loadFromStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES)
  );

  // Resources
  const [resources, setResources] = useState<ResourceItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES)
  );

  // Mock Tests
  const [mockTests, setMockTests] = useState<MockTest[]>(() =>
    loadFromStorage(STORAGE_KEYS.MOCK_TESTS, INITIAL_MOCK_TESTS)
  );

  // Attempts
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttempt[]>(() =>
    loadFromStorage(STORAGE_KEYS.PRACTICE_ATTEMPTS, INITIAL_PRACTICE_ATTEMPTS)
  );

  const [mockAttempts, setMockAttempts] = useState<MockTestAttempt[]>(() =>
    loadFromStorage(STORAGE_KEYS.MOCK_ATTEMPTS, INITIAL_MOCK_ATTEMPTS)
  );

  // Payments
  const [payments, setPayments] = useState<PaymentSubmission[]>(() =>
    loadFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  );

  // Course Progress
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>(() =>
    loadFromStorage(STORAGE_KEYS.COURSE_PROGRESS, {
      'c-math-800': ['les-m-01'],
      'c-rw-750': ['les-rw-01'],
    })
  );

  // Plans
  const plans = INITIAL_PLANS;

  // Persist changes
  useEffect(() => saveToStorage(STORAGE_KEYS.THEME, theme), [theme]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser), [currentUser]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ALL_USERS, allUsers), [allUsers]);
  useEffect(() => saveToStorage(STORAGE_KEYS.QUESTIONS, questions), [questions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.COURSES, courses), [courses]);
  useEffect(() => saveToStorage(STORAGE_KEYS.RESOURCES, resources), [resources]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MOCK_TESTS, mockTests), [mockTests]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PRACTICE_ATTEMPTS, practiceAttempts), [practiceAttempts]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MOCK_ATTEMPTS, mockAttempts), [mockAttempts]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PAYMENTS, payments), [payments]);
  useEffect(() => saveToStorage(STORAGE_KEYS.COURSE_PROGRESS, courseProgress), [courseProgress]);

  // Adopt the signed-in user from the JWT cookie. Returning null leaves the
  // localStorage demo profile in place, so the demo role switcher still works
  // without a database.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply Theme CSS class to <body> whenever theme changes, including on
  // initial mount (previously this only ran when the user manually toggled
  // the theme, so a saved warm/dark preference never applied after reload).
  useEffect(() => {
    document.body.classList.remove('mode-white', 'mode-warm', 'mode-dark');
    document.body.classList.add(`mode-${theme}`);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  // --- ACCESS CONTROL ENGINE ---
  // The predicates live in lib/access.ts, shared with the API routes: what the
  // UI locks and what the server refuses to send have to be the same rule.
  const hasAccessToQuestion = (q: Question): boolean => canSeeQuestion(currentUser, q);
  const hasAccessToCourse = (courseId: string): boolean => canSeeCourse(currentUser, courseId);
  const hasAccessToMockTest = (test: MockTest): boolean => canSeeMockTest(currentUser, test);

  // --- AUTHENTICATION & PROFILES ---
  /**
   * Real sign-in: POST to /api/auth/login, which sets an httpOnly JWT cookie.
   * The demo role switcher below still works offline against localStorage.
   */
  const loginUser = async (phoneOrEmail: string, password: string): Promise<AuthResult> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneOrEmail, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? 'Unable to sign in.' };
    setCurrentUser(data.user);
    return { ok: true, user: data.user };
  };

  const registerUser = async (
    name: string,
    phone: string,
    password: string,
    email?: string,
    targetScore: number = 1550
  ): Promise<AuthResult> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, password, targetScore }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? 'Unable to create the account.' };
    setCurrentUser(data.user);
    return { ok: true, user: data.user };
  };

  /** Always resolves: the endpoint deliberately does not say whether the account exists. */
  const requestPasswordReset = async (email: string): Promise<void> => {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  };

  const resendVerificationEmail = async (): Promise<void> => {
    await fetch('/api/auth/resend-verification', { method: 'POST' }).catch(() => {});
  };

  const logoutUser = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
  };

  const switchUser = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      setCurrentUser(DEMO_ADMIN);
    } else {
      setCurrentUser(DEMO_STUDENT);
    }
  };

  // --- PRACTICE ATTEMPT LOGGING ---
  const logPracticeAttempt = (
    question: Question,
    selectedAnswer: 'A' | 'B' | 'C' | 'D',
    timeSpentSeconds: number
  ) => {
    const isCorrect = selectedAnswer === question.correct_answer;
    const newAttempt: PracticeAttempt = {
      id: `att-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      questionId: question.id,
      questionCode: question.code,
      selectedAnswer,
      correctAnswer: question.correct_answer,
      isCorrect,
      timeSpentSeconds,
      attemptedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      domain: question.domain,
      subject: question.subject,
      difficulty: question.difficulty,
    };

    setPracticeAttempts((prev) => [newAttempt, ...prev]);
  };

  // --- MOCK TEST ENGINE & ATTEMPTS ---
  const saveMockTestAttempt = (attempt: MockTestAttempt) => {
    setMockAttempts((prev) => {
      const idx = prev.findIndex((a) => a.id === attempt.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = attempt;
        return updated;
      }
      return [attempt, ...prev];
    });
  };

  const finalizeMockTest = (attemptId: string) => {
    setMockAttempts((prev) => {
      const target = prev.find((a) => a.id === attemptId);
      const test = target && mockTests.find((t) => t.id === target.testId);
      if (!target || !test) return prev;

      // scoreAttempt is the same function the server runs on submit, so an
      // offline finalize and a server finalize cannot disagree.
      const completed: MockTestAttempt = {
        ...target,
        status: 'completed',
        completedAt: new Date().toISOString(),
        scoreSummary: scoreAttempt(test, target.interactions),
      };
      return prev.map((a) => (a.id === attemptId ? completed : a));
    });
  };

  // --- COURSE LESSON COMPLETION ---
  const toggleLessonComplete = (courseId: string, lessonId: string) => {
    setCourseProgress((prev) => {
      const current = prev[courseId] || [];
      const updated = current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId];
      return { ...prev, [courseId]: updated };
    });
  };

  // --- PAYMENTS & MANUAL VERIFICATION ---
  const submitPayment = (
    productId: string,
    amount: number,
    paymentMethod: PaymentSubmission['paymentMethod'],
    referenceNumber: string,
    senderPhoneNumber: string,
    notes?: string
  ): PaymentSubmission => {
    const plan = plans.find((p) => p.id === productId);
    const newSubmission: PaymentSubmission = {
      id: `pay-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Anonymous Student',
      userPhone: currentUser?.phone || senderPhoneNumber,
      userEmail: currentUser?.email,
      productId,
      productName: plan ? plan.name : 'SAT Course / Practice Access',
      productTitle: plan ? plan.name : 'SAT Course / Practice Access',
      amount,
      paymentMethod,
      referenceNumber,
      senderPhoneNumber,
      notes,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newSubmission, ...prev]);
    return newSubmission;
  };

  const verifyPayment = (paymentId: string, approve: boolean = true, reviewerName: string = 'Admin Supervisor') => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        return {
          ...p,
          status: approve ? 'verified' : 'rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewerName,
        };
      })
    );

    if (approve) {
      const targetPay = payments.find((p) => p.id === paymentId);
      if (targetPay) {
        const plan = plans.find((pl) => pl.id === targetPay.productId);
        if (plan) {
          grantStudentAccess(targetPay.userId, plan);
        }
      }
    }
  };

  const rejectPayment = (paymentId: string) => {
    verifyPayment(paymentId, false, 'Admin Supervisor');
  };

  // --- ADMIN MANUAL ACCESS GRANTS ---
  const grantStudentAccess = (
    userId: string,
    grantsOrPlan: Partial<UserProfile['access']> | ProductPlan
  ) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;

        let nextAccess = { ...u.access };

        if ('grants' in grantsOrPlan) {
          nextAccess = applyPlanGrants(nextAccess, grantsOrPlan, courses.map((c) => c.id));
        } else {
          nextAccess = { ...nextAccess, ...grantsOrPlan };
        }

        const updatedUser = { ...u, access: nextAccess };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updatedUser);
        }
        return updatedUser;
      })
    );
  };

  /** Patch one user in the roster, keeping currentUser in sync if it is them. */
  const patchUser = (userId: string, patch: (u: UserProfile) => UserProfile) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? patch(u) : u)));
    setCurrentUser((prev) => (prev && prev.id === userId ? patch(prev) : prev));
  };

  // --- COURSE ENROLLMENT ---
  const toggleCourseEnrollment = (userId: string, courseId: string) => {
    patchUser(userId, (u) => {
      const enrolled = u.access.enrolledCourseIds.includes(courseId);
      return {
        ...u,
        access: {
          ...u.access,
          enrolledCourseIds: enrolled
            ? u.access.enrolledCourseIds.filter((id) => id !== courseId)
            : [...u.access.enrolledCourseIds, courseId],
        },
      };
    });
  };

  // --- STAFF ROLES & PERMISSIONS ---
  const setUserRole = (userId: string, role: UserProfile['role']) => {
    patchUser(userId, (u) => ({
      ...u,
      role,
      // A new staff member starts with nothing granted; permissions are then chosen
      // explicitly rather than inherited from whatever the account had before.
      permissions: role === 'sub_admin' ? u.permissions ?? BLANK_PERMISSIONS : u.permissions,
    }));
  };

  const setUserPermissions = (userId: string, updates: Partial<AdminPermission>) => {
    patchUser(userId, (u) => ({
      ...u,
      permissions: { ...BLANK_PERMISSIONS, ...(u.permissions ?? {}), ...updates },
    }));
  };

  const createStaffUser = (
    name: string,
    phone: string,
    email?: string,
    permissions: Partial<AdminPermission> = {}
  ): UserProfile => {
    const staff: UserProfile = {
      id: `user-staff-${Date.now()}`,
      name,
      phone,
      email,
      role: 'sub_admin',
      targetScore: 1600,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      access: {
        premiumMath: true,
        premiumReadingWriting: true,
        redbookPractice: true,
        enrolledCourseIds: [],
        fullPremium: true,
      },
      permissions: { ...BLANK_PERMISSIONS, ...permissions },
    };
    setAllUsers((prev) => [...prev, staff]);
    return staff;
  };

  const toggleStudentSuspension = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const nextSuspended = !u.isSuspended;
        const updated: UserProfile = {
          ...u,
          isSuspended: nextSuspended,
          status: nextSuspended ? 'suspended' : 'active',
        };
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      })
    );
  };

  // --- QUESTION MANAGEMENT CRUD ---
  const addQuestion = (newQ: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => {
    const fullQuestion: Question = {
      ...newQ,
      id: `q-${Date.now()}`,
      choices: newQ.choices || newQ.answer_choices || [],
      answer_choices: newQ.answer_choices || newQ.choices || [],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    setQuestions((prev) => [fullQuestion, ...prev]);
    return fullQuestion;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString().split('T')[0] } : q))
    );
  };

  /**
   * Apply a batch of topic edits from the Topics view in one pass, so a rename or
   * merge across 40 questions is a single state update rather than 40.
   */
  const applyTopicUpdates = (updates: { questionId: string; topic: string }[]) => {
    if (updates.length === 0) return;
    const byId = new Map(updates.map((u) => [u.questionId, u.topic]));
    const today = new Date().toISOString().split('T')[0];
    setQuestions((prev) =>
      prev.map((q) => {
        const topic = byId.get(q.id);
        return topic === undefined ? q : { ...q, topic, updated_at: today };
      })
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // --- COURSE MANAGEMENT CRUD ---
  const addCourse = (newC: Partial<Course> & { title: string }) => {
    const fullCourse: Course = {
      id: newC.id || `c-${Date.now()}`,
      slug: newC.slug || newC.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newC.title,
      subtitle: newC.subtitle || '',
      description: newC.description || '',
      subject: newC.subject || 'math',
      difficulty: newC.difficulty || 'All Levels',
      instructorName: newC.instructorName || 'Whiteboard SAT Expert',
      instructorTitle: newC.instructorTitle || 'SAT Master Coach',
      price: newC.price ?? 2900,
      originalPrice: newC.originalPrice ?? 4500,
      is_published: newC.is_published ?? true,
      features: newC.features || ['Full Video Lessons', 'Practice Quizzes'],
      lessonsCount: newC.lessons ? newC.lessons.length : 0,
      totalHours: newC.totalHours ?? 10,
      lessons: newC.lessons || [],
      level: newC.level || 'All Levels',
      badge: newC.badge || 'New Course',
    };
    setCourses((prev) => [fullCourse, ...prev]);
    return fullCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedLessons = updates.lessons || c.lessons;
        return {
          ...c,
          ...updates,
          lessons: updatedLessons,
          lessonsCount: updatedLessons.length,
        };
      })
    );
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addLessonToCourse = (courseId: string, lesson: Omit<Lesson, 'id' | 'courseId'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: `les-${Date.now()}`,
      courseId,
    };
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const lessons = [...c.lessons, newLesson];
        const totalMins = lessons.reduce((acc, l) => acc + l.durationMinutes, 0);
        return {
          ...c,
          lessons,
          lessonsCount: lessons.length,
          totalHours: Math.round((totalMins / 60) * 10) / 10,
        };
      })
    );
    return newLesson;
  };

  const updateLessonInCourse = (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const lessons = c.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l));
        const totalMins = lessons.reduce((acc, l) => acc + l.durationMinutes, 0);
        return {
          ...c,
          lessons,
          lessonsCount: lessons.length,
          totalHours: Math.round((totalMins / 60) * 10) / 10,
        };
      })
    );
  };

  const deleteLessonFromCourse = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const lessons = c.lessons.filter((l) => l.id !== lessonId);
        const totalMins = lessons.reduce((acc, l) => acc + l.durationMinutes, 0);
        return {
          ...c,
          lessons,
          lessonsCount: lessons.length,
          totalHours: Math.round((totalMins / 60) * 10) / 10,
        };
      })
    );
  };

  // --- RESOURCE MANAGEMENT CRUD ---
  const addResource = (newR: Partial<ResourceItem> & { title: string }) => {
    const fullResource: ResourceItem = {
      id: newR.id || `res-${Date.now()}`,
      title: newR.title,
      description: newR.description || '',
      category: newR.category || 'formula_sheet',
      subject: newR.subject || 'general',
      is_free: newR.is_free ?? true,
      downloadUrl: newR.downloadUrl || '#',
      externalUrl: newR.externalUrl || '#',
      readTime: newR.readTime || '10 min read',
      dateAdded: newR.dateAdded || new Date().toISOString().split('T')[0],
    };
    setResources((prev) => [fullResource, ...prev]);
    return fullResource;
  };

  const updateResource = (id: string, updates: Partial<ResourceItem>) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  // --- MOCK TEST MANAGEMENT CRUD ---
  const addMockTest = (newT: Partial<MockTest> & { title: string }) => {
    const fullTest: MockTest = {
      id: newT.id || `mock-${Date.now()}`,
      title: newT.title,
      description: newT.description || '',
      is_free: newT.is_free ?? false,
      difficulty: newT.difficulty || 'medium',
      totalQuestions: newT.totalQuestions || 98,
      totalTimeMinutes: newT.totalTimeMinutes || 134,
      modules: newT.modules || [],
    };
    setMockTests((prev) => [fullTest, ...prev]);
    return fullTest;
  };

  const updateMockTest = (id: string, updates: Partial<MockTest>) => {
    setMockTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteMockTest = (id: string) => {
    setMockTests((prev) => prev.filter((t) => t.id !== id));
  };

  // --- STATS COMPUTATION FOR STUDENT DASHBOARD ---
  const userAttempts = practiceAttempts.filter((a) => a.userId === currentUser?.id);
  const totalQuestionsAttempted = userAttempts.length;
  const totalCorrect = userAttempts.filter((a) => a.isCorrect).length;
  const overallAccuracy = totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0;
  const totalTimeSpentMinutes = Math.round(userAttempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0) / 60);

  // Domain breakdown
  const domainStats = ALL_DOMAINS.map(
    (dom) => {
      const domAttempts = userAttempts.filter((a) => a.domain === dom);
      const correct = domAttempts.filter((a) => a.isCorrect).length;
      const total = domAttempts.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { domain: dom, correct, total, accuracy };
    }
  );

  return {
    theme,
    setTheme,
    currentUser,
    setCurrentUser,
    allUsers,
    questions,
    courses,
    resources,
    mockTests,
    plans,
    practiceAttempts,
    mockAttempts,
    mockTestAttempts: mockAttempts,
    payments,
    courseProgress,
    // Access control
    hasAccessToQuestion,
    hasAccessToCourse,
    hasAccessToMockTest,
    // Auth & Aliases
    loginUser,
    loginWithPhoneOrEmail: loginUser,
    registerUser,
    requestPasswordReset,
    resendVerificationEmail,
    logoutUser,
    logout: logoutUser,
    switchUser,
    switchDemoRole: switchUser,
    // Operations
    logPracticeAttempt,
    saveMockTestAttempt,
    finalizeMockTest,
    finalizeMockTestAttempt: finalizeMockTest,
    toggleLessonComplete,
    toggleLessonCompleted: toggleLessonComplete,
    submitPayment,
    verifyPayment,
    rejectPayment,
    grantStudentAccess,
    updateUserAccess: grantStudentAccess,
    toggleStudentSuspension,
    toggleUserStatus: toggleStudentSuspension,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    applyTopicUpdates,
    // Access, roles & staff
    toggleCourseEnrollment,
    setUserRole,
    setUserPermissions,
    createStaffUser,
    // Course & Lesson CRUD
    addCourse,
    updateCourse,
    deleteCourse,
    addLessonToCourse,
    updateLessonInCourse,
    deleteLessonFromCourse,
    // Resource CRUD
    addResource,
    updateResource,
    deleteResource,
    // Mock Test CRUD
    addMockTest,
    updateMockTest,
    deleteMockTest,
    // Computed analytics
    totalQuestionsAttempted,
    totalCorrect,
    overallAccuracy,
    totalTimeSpentMinutes,
    domainStats,
  };
}
