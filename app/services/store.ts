'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
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
  PaymentSettings,
} from '../types';
// Plans and payment settings are dynamic and loaded from /api with seedData fallbacks.
import { INITIAL_PLANS, DEFAULT_PAYMENT_SETTINGS } from '../data/seedData';
import { ALL_DOMAINS } from '../lib/utils';
import { canSeeCourse, canSeeMockTest, canSeeQuestion, applyPlanGrants } from '../lib/access';
import { can } from '../features/admin/lib/permissions';
import { api } from './api';

/** No passes at all — the starting point for a new account, and the fallback
 * when a grant is applied to a user the roster has not loaded yet. */
const BLANK_ACCESS: UserProfile['access'] = {
  premiumMath: false,
  premiumReadingWriting: false,
  redbookPractice: false,
  enrolledCourseIds: [],
  unlockedMockTestIds: [],
  fullPremium: false,
};

/** How often a running mock test is checkpointed to the server. See saveMockTestAttempt. */
const ATTEMPT_CHECKPOINT_MS = 15_000;

/**
 * /api/auth/me and /api/me answer with the user document, which carries the
 * embedded lesson progress the app type does not declare.
 */
type MeUser = UserProfile & { courseProgress?: Record<string, string[]> };

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
  PAYMENT_SETTINGS: 'wbsat_payment_settings',
  PLANS: 'wbsat_plans',
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

function useAppStoreInternal() {
  // Theme
  const [theme, setThemeState] = useState<AppTheme>('white');

  // User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);

  // Resources
  const [resources, setResources] = useState<ResourceItem[]>([]);

  // Mock Tests
  const [mockTests, setMockTests] = useState<MockTest[]>([]);

  // Attempts
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttempt[]>([]);
  const [mockAttempts, setMockAttempts] = useState<MockTestAttempt[]>([]);

  // Payments
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);

  // Plans & Payment Settings (Dynamic)
  const [plans, setPlans] = useState<ProductPlan[]>(INITIAL_PLANS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

  // Course Progress
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>({});

  /**
   * True only once /api/auth/me has answered with a user. `currentUser` can be
   * restored from the cache before that answer arrives, so it is not the thing
   * that decides whether to ask the server for attempts, payments and the
   * roster — that would fire requests for a session that may not exist.
   */
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate local cached state on client mount without SSR mismatch
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    setThemeState(loadFromStorage(STORAGE_KEYS.THEME, 'white'));
    setCurrentUser(loadFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null));
    setAllUsers(loadFromStorage<UserProfile[]>(STORAGE_KEYS.ALL_USERS, []));
    setQuestions(loadFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS, []));
    setCourses(loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, []));
    setResources(loadFromStorage<ResourceItem[]>(STORAGE_KEYS.RESOURCES, []));
    setMockTests(loadFromStorage<MockTest[]>(STORAGE_KEYS.MOCK_TESTS, []));
    setPracticeAttempts(loadFromStorage<PracticeAttempt[]>(STORAGE_KEYS.PRACTICE_ATTEMPTS, []));
    setMockAttempts(loadFromStorage<MockTestAttempt[]>(STORAGE_KEYS.MOCK_ATTEMPTS, []));
    setPayments(loadFromStorage<PaymentSubmission[]>(STORAGE_KEYS.PAYMENTS, []));
    setPlans(loadFromStorage<ProductPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS));
    setPaymentSettings(loadFromStorage<PaymentSettings>(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_SETTINGS));
    setCourseProgress(loadFromStorage<Record<string, string[]>>(STORAGE_KEYS.COURSE_PROGRESS, {}));
    hasHydratedRef.current = true;
  }, []);

  // Persist changes only after client hydration
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.THEME, theme); }, [theme]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }, [currentUser]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.ALL_USERS, allUsers); }, [allUsers]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.QUESTIONS, questions); }, [questions]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.COURSES, courses); }, [courses]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.RESOURCES, resources); }, [resources]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.MOCK_TESTS, mockTests); }, [mockTests]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.PRACTICE_ATTEMPTS, practiceAttempts); }, [practiceAttempts]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.MOCK_ATTEMPTS, mockAttempts); }, [mockAttempts]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.PAYMENTS, payments); }, [payments]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.PLANS, plans); }, [plans]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.PAYMENT_SETTINGS, paymentSettings); }, [paymentSettings]);
  useEffect(() => { if (hasHydratedRef.current) saveToStorage(STORAGE_KEYS.COURSE_PROGRESS, courseProgress); }, [courseProgress]);

  // Who the cookie says we are. This is the only thing that establishes a
  // session; a cached `currentUser` without it is just a stale name on screen.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: MeUser | null }) => {
        if (cancelled || !data?.user) return;
        setIsSignedIn(true);
        setCurrentUser(data.user);
        // Lesson progress is embedded in the user document, not its own key.
        if (data.user.courseProgress) setCourseProgress(data.user.courseProgress);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /** The roster is staff-only, so this asks for it only when the viewer may have it. */
  const canSeeRoster = (user: UserProfile | null) =>
    can(user, 'canManageStudents') || can(user, 'canManageSubAdmins');

  const refreshUsers = async () => {
    if (!canSeeRoster(currentUser)) return;
    const { items } = await api.get<{ items: UserProfile[] }>('/users');
    setAllUsers(items);
  };

  /**
   * The localStorage copies above are only a cache, so the first paint is not
   * blank; this is what actually fills the app. It re-runs when the signed-in
   * user changes, because who is asking decides what comes back: a locked
   * question arrives with its text stripped, and drafts arrive for staff only.
   */
  const sessionUserId = currentUser?.id ?? null;
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [q, c, r, m, pSets, pPlans] = await Promise.all([
          api.get<{ items: Question[] }>('/questions').catch(() => ({ items: [] as Question[] })),
          api.get<{ items: Course[] }>('/courses').catch(() => ({ items: [] as Course[] })),
          api.get<{ items: ResourceItem[] }>('/resources').catch(() => ({ items: [] as ResourceItem[] })),
          api.get<{ items: MockTest[] }>('/mock-tests').catch(() => ({ items: [] as MockTest[] })),
          fetch('/api/settings/payment').then((res) => res.json()).catch(() => ({ settings: DEFAULT_PAYMENT_SETTINGS })),
          fetch('/api/plans').then((res) => res.json()).catch(() => ({ items: INITIAL_PLANS })),
        ]);
        if (cancelled) return;
        setQuestions(q?.items ?? []);
        setCourses(c?.items ?? []);
        setResources(r?.items ?? []);
        setMockTests(m?.items ?? []);
        if (pSets?.settings) setPaymentSettings(pSets.settings);
        if (pPlans?.items?.length) setPlans(pPlans.items);

        // The roster is part of the same load, inline rather than through
        // refreshUsers() so every setState in this effect sits behind an await.
        if (isSignedIn && canSeeRoster(currentUser)) {
          const roster = await api.get<{ items: UserProfile[] }>('/users').catch(() => ({ items: [] as UserProfile[] }));
          if (cancelled) return;
          setAllUsers(roster?.items ?? []);
        }

        if (!isSignedIn) return;
        const [history, pays] = await Promise.all([
          api.get<{ practice: PracticeAttempt[]; mock: MockTestAttempt[] }>('/attempts').catch(() => ({ practice: [], mock: [] })),
          api.get<{ items: PaymentSubmission[] }>('/payments').catch(() => ({ items: [] as PaymentSubmission[] })),
        ]);
        if (cancelled) return;
        setPracticeAttempts(history?.practice ?? []);
        setMockAttempts(history?.mock ?? []);
        setPayments(pays?.items ?? []);
      } catch (err) {
        console.error('Could not load from the API', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUserId, isSignedIn]);

  // Apply Theme CSS class to <body> and <html> whenever theme changes, including on
  // initial mount.
  useEffect(() => {
    document.body.classList.remove('mode-white', 'mode-warm', 'mode-dark');
    document.body.classList.add(`mode-${theme}`);
    document.documentElement.classList.remove('mode-white', 'mode-warm', 'mode-dark');
    document.documentElement.classList.add(`mode-${theme}`);
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
  /** POST to /api/auth/login, which sets the httpOnly JWT cookie every other call rides on. */
  const loginUser = async (phoneOrEmail: string, password: string): Promise<AuthResult> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneOrEmail, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? 'Unable to sign in.' };
    // Flips the load effect from "content only" to "content and this person's
    // attempts, payments and roster".
    setIsSignedIn(true);
    setCurrentUser(data.user);
    return { ok: true, user: data.user };
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    targetScore: number = 1550
  ): Promise<AuthResult> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, targetScore }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? 'Unable to create the account.' };
    setIsSignedIn(true);
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
    setIsSignedIn(false);
    setCurrentUser(null);
    // None of this is the next visitor's to see. Content goes too: an admin's
    // cache holds draft questions and unredacted premium text.
    setQuestions([]);
    setCourses([]);
    setResources([]);
    setMockTests([]);
    setPracticeAttempts([]);
    setMockAttempts([]);
    setPayments([]);
    setAllUsers([]);
    setCourseProgress({});
  };

  // --- WRITING THROUGH THE API ---
  /**
   * Every write goes to the server and the local copy is updated from the
   * response — never optimistically. A write that fails therefore leaves the UI
   * showing what the database actually holds, instead of a change that silently
   * did not happen. The three helpers are what keep each mutation below to one
   * line.
   */
  const createIn = async <T extends { id: string }>(
    path: string,
    setList: Dispatch<SetStateAction<T[]>>,
    body: unknown,
  ): Promise<T> => {
    const { item } = await api.post<{ item: T }>(path, body);
    setList((prev) => [item, ...prev]);
    return item;
  };

  const patchIn = async <T extends { id: string }>(
    path: string,
    id: string,
    setList: Dispatch<SetStateAction<T[]>>,
    body: unknown,
  ): Promise<T> => {
    const { item } = await api.patch<{ item: T }>(`${path}/${id}`, body);
    setList((prev) => prev.map((row) => (row.id === id ? item : row)));
    return item;
  };

  const deleteIn = async <T extends { id: string }>(
    path: string,
    id: string,
    setList: Dispatch<SetStateAction<T[]>>,
  ): Promise<void> => {
    await api.del(`${path}/${id}`);
    setList((prev) => prev.filter((row) => row.id !== id));
  };

  // --- PRACTICE ATTEMPT LOGGING ---
  /**
   * The answer goes up, the verdict comes back: the route looks the correct
   * answer up itself, so `isCorrect` is never something the browser decides.
   */
  const logPracticeAttempt = async (
    question: Question,
    selectedAnswer: 'A' | 'B' | 'C' | 'D',
    timeSpentSeconds: number,
  ) => {
    const { item } = await api.post<{ item: PracticeAttempt }>('/attempts/practice', {
      questionId: question.id,
      selectedAnswer,
      timeSpentSeconds,
    });
    setPracticeAttempts((prev) => [item, ...prev]);
  };

  // --- MOCK TEST ENGINE & ATTEMPTS ---
  /**
   * MockTestsHub calls saveMockTestAttempt once a second from the countdown, so
   * the local copy updates every time while the server gets a checkpoint at most
   * every 15 seconds. The first save for an attempt always goes through, so
   * there is something to resume from if the tab closes straight away.
   */
  const lastAttemptSave = useRef<{ id: string; at: number } | null>(null);

  const saveMockTestAttempt = (attempt: MockTestAttempt) => {
    setMockAttempts((prev) => {
      const idx = prev.findIndex((a) => a.id === attempt.id);
      if (idx < 0) return [attempt, ...prev];
      const updated = [...prev];
      updated[idx] = attempt;
      return updated;
    });

    const now = Date.now();
    const last = lastAttemptSave.current;
    if (last?.id === attempt.id && now - last.at < ATTEMPT_CHECKPOINT_MS) return;
    lastAttemptSave.current = { id: attempt.id, at: now };
    api
      .put(`/attempts/mock/${attempt.id}`, attempt)
      .catch((err) => console.error('Could not save the mock test attempt', err));
  };

  /** The server scores it. Returns the scored attempt so the results screen can show it. */
  const finalizeMockTest = async (attemptId: string): Promise<MockTestAttempt | undefined> => {
    const attempt = mockAttempts.find((a) => a.id === attemptId);
    if (!attempt) return undefined;
    const { item } = await api.put<{ item: MockTestAttempt }>(`/attempts/mock/${attemptId}`, {
      ...attempt,
      status: 'completed',
    });
    lastAttemptSave.current = null;
    setMockAttempts((prev) => prev.map((a) => (a.id === attemptId ? item : a)));
    return item;
  };

  // --- COURSE LESSON COMPLETION ---
  /** courseProgress is embedded in the user document, so this is a PATCH of /api/me. */
  const toggleLessonComplete = async (courseId: string, lessonId: string) => {
    const { user } = await api.patch<{ user: MeUser | null }>('/me', {
      lessonToggle: { courseId, lessonId },
    });
    if (user?.courseProgress) setCourseProgress(user.courseProgress);
  };

  const toggleBookmark = async (questionId: string) => {
    const { user } = await api.patch<{ user: MeUser | null }>('/me', {
      bookmarkToggle: questionId,
    });
    if (user) setCurrentUser(user as UserProfile);
  };

  // --- PAYMENTS & MANUAL VERIFICATION ---
  /**
   * `amount` is accepted for the existing call signature and then ignored: the
   * route charges the catalog price for productId, and the payer comes from the
   * session cookie. Neither is something a browser gets to choose.
   */
  const submitPayment = (
    productId: string,
    _amount: number,
    paymentMethod: PaymentSubmission['paymentMethod'],
    referenceNumber: string,
    senderPhoneNumber: string,
    notes?: string,
  ): Promise<PaymentSubmission> =>
    createIn<PaymentSubmission>('/payments', setPayments, {
      productId,
      paymentMethod,
      referenceNumber,
      senderPhoneNumber,
      notes,
    });

  const verifyPayment = async (paymentId: string, approve: boolean = true) => {
    await patchIn<PaymentSubmission>('/payments', paymentId, setPayments, {
      status: approve ? 'verified' : 'rejected',
    });
    // Verifying expands the plan onto the buyer server-side, so the roster the
    // console is showing is now a version behind.
    if (approve) await refreshUsers();
  };

  const rejectPayment = (paymentId: string) => verifyPayment(paymentId, false);

  // --- PEOPLE: ACCESS, ROLES & STAFF ---
  /** One PATCH covers role, permissions, access and suspension; the guards live server-side. */
  const patchUser = async (userId: string, body: object): Promise<UserProfile> => {
    const { item } = await api.patch<{ item: UserProfile }>(`/users/${userId}`, body);
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? item : u)));
    setCurrentUser((prev) => (prev && prev.id === userId ? item : prev));
    return item;
  };

  const accessOf = (userId: string): UserProfile['access'] =>
    allUsers.find((u) => u.id === userId)?.access ?? { ...BLANK_ACCESS };

  const grantStudentAccess = (
    userId: string,
    grantsOrPlan: Partial<UserProfile['access']> | ProductPlan,
  ) => {
    const current = accessOf(userId);
    const access =
      'grants' in grantsOrPlan
        ? applyPlanGrants(current, grantsOrPlan, courses)
        : { ...current, ...grantsOrPlan };
    return patchUser(userId, { access });
  };

  const toggleCourseEnrollment = (userId: string, courseId: string) => {
    const current = accessOf(userId);
    const enrolled = current.enrolledCourseIds.includes(courseId);
    return patchUser(userId, {
      access: {
        ...current,
        enrolledCourseIds: enrolled
          ? current.enrolledCourseIds.filter((id) => id !== courseId)
          : [...current.enrolledCourseIds, courseId],
      },
    });
  };

  const toggleMockTestAccess = (userId: string, mockTestId: string) => {
    const current = accessOf(userId);
    const unlocked = current.unlockedMockTestIds || [];
    const hasAccess = unlocked.includes(mockTestId);
    return patchUser(userId, {
      access: {
        ...current,
        unlockedMockTestIds: hasAccess
          ? unlocked.filter((id) => id !== mockTestId)
          : [...unlocked, mockTestId],
      },
    });
  };

  const setUserRole = (userId: string, role: UserProfile['role']) => patchUser(userId, { role });

  const setUserPermissions = (userId: string, updates: Partial<AdminPermission>) =>
    patchUser(userId, { permissions: updates });

  const toggleStudentSuspension = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    return patchUser(userId, { isSuspended: !target?.isSuspended });
  };

  /** No password is set: the new staff member signs in through the reset-password flow. */
  const createStaffUser = (
    name: string,
    email: string,
    phone?: string,
    permissions: Partial<AdminPermission> = {},
  ): Promise<UserProfile> =>
    createIn<UserProfile>('/users', setAllUsers, { name, email, phone, permissions });

  // --- QUESTION MANAGEMENT CRUD ---
  const addQuestion = (newQ: Omit<Question, 'id' | 'created_at' | 'updated_at'>) =>
    createIn<Question>('/questions', setQuestions, newQ);

  const updateQuestion = (id: string, updates: Partial<Question>) =>
    patchIn<Question>('/questions', id, setQuestions, updates);

  const deleteQuestion = (id: string) => deleteIn<Question>('/questions', id, setQuestions);

  /** A JSON import posts the whole array in one request — that is what POST accepts a list for. */
  const addQuestions = async (rows: Omit<Question, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (!rows.length) return [];
    const { items } = await api.post<{ items: Question[] }>('/questions', rows);
    setQuestions((prev) => [...items, ...prev]);
    return items;
  };

  /** One request for the whole merge, mirroring the single state update it used to be. */
  const applyTopicUpdates = async (updates: { questionId: string; topic: string }[]) => {
    if (!updates.length) return;
    await api.patch('/questions', updates.map((u) => ({ id: u.questionId, topic: u.topic })));
    const topics = new Map(updates.map((u) => [u.questionId, u.topic]));
    const today = new Date().toISOString().split('T')[0];
    setQuestions((prev) =>
      prev.map((q) =>
        topics.has(q.id) ? { ...q, topic: topics.get(q.id)!, updated_at: today } : q,
      ),
    );
  };

  // --- COURSE MANAGEMENT CRUD ---
  const addCourse = (newC: Partial<Course> & { title: string }) =>
    createIn<Course>('/courses', setCourses, newC);

  const updateCourse = (id: string, updates: Partial<Course>) =>
    patchIn<Course>('/courses', id, setCourses, updates);

  const deleteCourse = (id: string) => deleteIn<Course>('/courses', id, setCourses);

  /**
   * Lessons are embedded in the course document, so all three lesson operations
   * are one PATCH of its `lessons` array — there is no lesson endpoint to call.
   * The server assigns ids and recomputes lessonsCount and totalHours.
   */
  const patchLessons = async (courseId: string, next: (lessons: Lesson[]) => Lesson[]) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return undefined;
    return patchIn<Course>('/courses', courseId, setCourses, { lessons: next(course.lessons) });
  };

  const addLessonToCourse = async (courseId: string, lesson: Omit<Lesson, 'id' | 'courseId'>) => {
    const course = await patchLessons(courseId, (lessons) => [...lessons, lesson as Lesson]);
    return course?.lessons[course.lessons.length - 1];
  };

  const updateLessonInCourse = (courseId: string, lessonId: string, updates: Partial<Lesson>) =>
    patchLessons(courseId, (lessons) =>
      lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
    );

  const deleteLessonFromCourse = (courseId: string, lessonId: string) =>
    patchLessons(courseId, (lessons) => lessons.filter((l) => l.id !== lessonId));

  // --- RESOURCE MANAGEMENT CRUD ---
  const addResource = (newR: Partial<ResourceItem> & { title: string }) =>
    createIn<ResourceItem>('/resources', setResources, newR);

  const updateResource = (id: string, updates: Partial<ResourceItem>) =>
    patchIn<ResourceItem>('/resources', id, setResources, updates);

  const deleteResource = (id: string) => deleteIn<ResourceItem>('/resources', id, setResources);

  // --- MOCK TEST MANAGEMENT CRUD ---
  const addMockTest = (newT: Partial<MockTest> & { title: string }) =>
    createIn<MockTest>('/mock-tests', setMockTests, newT);

  const updateMockTest = (id: string, updates: Partial<MockTest>) =>
    patchIn<MockTest>('/mock-tests', id, setMockTests, updates);

  const deleteMockTest = (id: string) => deleteIn<MockTest>('/mock-tests', id, setMockTests);


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

  const updatePaymentSettings = async (newSettings: PaymentSettings): Promise<PaymentSettings> => {
    setPaymentSettings(newSettings);
    const res = await fetch('/api/settings/payment', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.settings) {
      setPaymentSettings(data.settings);
      return data.settings;
    }
    return newSettings;
  };

  const updatePlan = async (updatedPlan: ProductPlan): Promise<ProductPlan[]> => {
    const optimistic = plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    setPlans(optimistic);
    const res = await fetch('/api/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: updatedPlan }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.items) {
      setPlans(data.items);
      return data.items;
    }
    return optimistic;
  };

  const addPlan = async (newPlan: Partial<ProductPlan> & { name: string; price: number }): Promise<ProductPlan[]> => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: newPlan }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.items) {
      setPlans(data.items);
      return data.items;
    }
    // fallback: append locally with generated id
    const temp: ProductPlan = { id: `plan-${Date.now()}`, slug: newPlan.name.toLowerCase().replace(/\s+/g, '-'), description: newPlan.description ?? '', period: 'One-time access', grants: {}, features: newPlan.features ?? [], ...newPlan } as ProductPlan;
    const next = [...plans, temp];
    setPlans(next);
    return next;
  };

  const deletePlan = async (planId: string): Promise<ProductPlan[]> => {
    const optimistic = plans.filter((p) => p.id !== planId);
    setPlans(optimistic);
    const res = await fetch(`/api/plans?id=${encodeURIComponent(planId)}`, {
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (data.items) {
      setPlans(data.items);
      return data.items;
    }
    return optimistic;
  };

  return {
    isLoading,
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
    paymentSettings,
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
    // Operations
    logPracticeAttempt,
    saveMockTestAttempt,
    finalizeMockTest,
    finalizeMockTestAttempt: finalizeMockTest,
    toggleLessonComplete,
    toggleLessonCompleted: toggleLessonComplete,
    toggleBookmark,
    submitPayment,
    verifyPayment,
    rejectPayment,
    grantStudentAccess,
    updateUserAccess: grantStudentAccess,
    toggleStudentSuspension,
    toggleUserStatus: toggleStudentSuspension,
    addQuestion,
    addQuestions,
    updateQuestion,
    deleteQuestion,
    applyTopicUpdates,
    // Access, roles & staff
    toggleCourseEnrollment,
    toggleMockTestAccess,
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
    // Plan and Settings CRUD
    updatePaymentSettings,
    updatePlan,
    addPlan,
    deletePlan,
    // Computed analytics
    totalQuestionsAttempted,
    totalCorrect,
    overallAccuracy,
    totalTimeSpentMinutes,
    domainStats,
  };
}

type AppStoreValue = ReturnType<typeof useAppStoreInternal>;
const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const value = useAppStoreInternal();
  return React.createElement(AppStoreContext.Provider, { value }, children) as unknown as React.ReactElement;
}

// Shared hook — returns the Provider's value when inside <AppStoreProvider>, otherwise falls back to an isolated instance (for gradual migration / tests).
export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (ctx) return ctx;
  // Fallback for callers outside the Provider (e.g. isolated tests). This keeps backwards compat.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAppStoreInternal();
}
