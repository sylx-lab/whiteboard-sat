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
import { estimateSATScore, ALL_DOMAINS } from '../lib/utils';

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
    userPhone: DEMO_STUDENT.phone,
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
  const hasAccessToQuestion = (q: Question): boolean => {
    if (q.is_free) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.access.fullPremium) return true;
    if (q.subject === 'math' && currentUser.access.premiumMath) return true;
    if (q.subject === 'reading_writing' && currentUser.access.premiumReadingWriting) return true;
    return false;
  };

  const hasAccessToCourse = (courseId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.access.fullPremium) return true;
    return currentUser.access.enrolledCourseIds.includes(courseId);
  };

  const hasAccessToMockTest = (test: MockTest): boolean => {
    if (test.is_free) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.access.fullPremium) return true;
    return false;
  };

  // --- AUTHENTICATION & PROFILES ---
  const loginUser = (phoneOrEmail: string): boolean => {
    const trimmed = phoneOrEmail.trim().toLowerCase();
    const found = allUsers.find(
      (u) =>
        u.phone.toLowerCase() === trimmed ||
        (u.email && u.email.toLowerCase() === trimmed)
    );

    if (found) {
      if (found.isSuspended || found.status === 'suspended') {
        return false;
      }
      setCurrentUser(found);
      return true;
    }

    // Auto-create basic profile if phone number provided
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: 'SAT Student',
      phone: phoneOrEmail,
      role: 'student',
      targetScore: 1550,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      access: {
        premiumMath: false,
        premiumReadingWriting: false,
        redbookPractice: false,
        enrolledCourseIds: [],
        fullPremium: false,
      },
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const registerUser = (
    name: string,
    phone: string,
    email?: string,
    targetScore: number = 1550
  ): UserProfile => {
    const existing = allUsers.find((u) => u.phone === phone);
    if (existing) {
      setCurrentUser(existing);
      return existing;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      phone,
      email,
      role: 'student',
      targetScore,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      access: {
        premiumMath: false,
        premiumReadingWriting: false,
        redbookPractice: false,
        enrolledCourseIds: [],
        fullPremium: false,
      },
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logoutUser = () => {
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
      if (!target) return prev;

      const test = mockTests.find((t) => t.id === target.testId);
      if (!test) return prev;

      let mathCorrect = 0;
      let mathTotal = 0;
      let rwCorrect = 0;
      let rwTotal = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTime = 0;

      const domainMap: Record<string, { correct: number; total: number }> = {};

      test.modules.forEach((mod) => {
        mod.questions.forEach((q) => {
          totalQuestions += 1;
          if (!domainMap[q.domain]) {
            domainMap[q.domain] = { correct: 0, total: 0 };
          }
          domainMap[q.domain].total += 1;

          if (mod.section === 'math') mathTotal += 1;
          if (mod.section === 'reading_writing') rwTotal += 1;

          const interaction = target.interactions[q.id];
          if (interaction) {
            totalTime += interaction.timeSpentSeconds || 0;
            if (interaction.selectedAnswer === q.correct_answer) {
              totalCorrect += 1;
              domainMap[q.domain].correct += 1;
              if (mod.section === 'math') mathCorrect += 1;
              if (mod.section === 'reading_writing') rwCorrect += 1;
            }
          }
        });
      });

      const { mathScore, rwScore, totalScore } = estimateSATScore(
        mathCorrect,
        mathTotal,
        rwCorrect,
        rwTotal
      );

      const completedAttempt: MockTestAttempt = {
        ...target,
        status: 'completed',
        completedAt: new Date().toISOString(),
        scoreSummary: {
          totalCorrect,
          totalQuestions,
          accuracyPercent: Math.round((totalCorrect / Math.max(1, totalQuestions)) * 100),
          mathScoreEstimated: mathScore,
          rwScoreEstimated: rwScore,
          totalScoreEstimated: totalScore,
          mathCorrect,
          mathTotal,
          rwCorrect,
          rwTotal,
          timeSpentSeconds: totalTime,
          domainBreakdown: domainMap,
        },
      };

      const updated = prev.map((a) => (a.id === attemptId ? completedAttempt : a));
      return updated;
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
          const g = grantsOrPlan.grants;
          if (g.allCourses || g.fullPremium) {
            nextAccess = {
              premiumMath: true,
              premiumReadingWriting: true,
              redbookPractice: true,
              enrolledCourseIds: courses.map((c) => c.id),
              fullPremium: true,
            };
          } else {
            if (g.premiumMath) {
              nextAccess.premiumMath = true;
              nextAccess.redbookPractice = true;
              if (!nextAccess.enrolledCourseIds.includes('c-math-800')) {
                nextAccess.enrolledCourseIds.push('c-math-800');
              }
            }
            if (g.premiumReadingWriting) {
              nextAccess.premiumReadingWriting = true;
              if (!nextAccess.enrolledCourseIds.includes('c-rw-750')) {
                nextAccess.enrolledCourseIds.push('c-rw-750');
              }
            }
          }
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
