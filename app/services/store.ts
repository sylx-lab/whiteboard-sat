import { useState, useEffect, useRef } from 'react';
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
} from '../types';
// Plans are the real catalog and have no collection of their own — the payments
// route prices a purchase from this same list. Everything else now comes from /api.
import { INITIAL_PLANS } from '../data/seedData';
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

export function useAppStore() {
  // Theme
  const [theme, setThemeState] = useState<AppTheme>(() => loadFromStorage(STORAGE_KEYS.THEME, 'white'));

  // User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null)
  );
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() =>
    loadFromStorage<UserProfile[]>(STORAGE_KEYS.ALL_USERS, [])
  );

  // Questions
  const [questions, setQuestions] = useState<Question[]>(() =>
    loadFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS, [])
  );

  // Courses
  const [courses, setCourses] = useState<Course[]>(() =>
    loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, [])
  );

  // Resources
  const [resources, setResources] = useState<ResourceItem[]>(() =>
    loadFromStorage<ResourceItem[]>(STORAGE_KEYS.RESOURCES, [])
  );

  // Mock Tests
  const [mockTests, setMockTests] = useState<MockTest[]>(() =>
    loadFromStorage<MockTest[]>(STORAGE_KEYS.MOCK_TESTS, [])
  );

  // Attempts
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttempt[]>(() =>
    loadFromStorage<PracticeAttempt[]>(STORAGE_KEYS.PRACTICE_ATTEMPTS, [])
  );

  const [mockAttempts, setMockAttempts] = useState<MockTestAttempt[]>(() =>
    loadFromStorage<MockTestAttempt[]>(STORAGE_KEYS.MOCK_ATTEMPTS, [])
  );

  // Payments
  const [payments, setPayments] = useState<PaymentSubmission[]>(() =>
    loadFromStorage<PaymentSubmission[]>(STORAGE_KEYS.PAYMENTS, [])
  );

  // Course Progress
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>(() =>
    loadFromStorage<Record<string, string[]>>(STORAGE_KEYS.COURSE_PROGRESS, {})
  );

  // Plans
  const plans = INITIAL_PLANS;

  /**
   * True only once /api/auth/me has answered with a user. `currentUser` can be
   * restored from the cache before that answer arrives, so it is not the thing
   * that decides whether to ask the server for attempts, payments and the
   * roster — that would fire requests for a session that may not exist.
   */
  const [isSignedIn, setIsSignedIn] = useState(false);

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
      const [q, c, r, m] = await Promise.all([
        api.get<{ items: Question[] }>('/questions'),
        api.get<{ items: Course[] }>('/courses'),
        api.get<{ items: ResourceItem[] }>('/resources'),
        api.get<{ items: MockTest[] }>('/mock-tests'),
      ]);
      if (cancelled) return;
      setQuestions(q.items);
      setCourses(c.items);
      setResources(r.items);
      setMockTests(m.items);

      // The roster is part of the same load, inline rather than through
      // refreshUsers() so every setState in this effect sits behind an await.
      if (isSignedIn && canSeeRoster(currentUser)) {
        const roster = await api.get<{ items: UserProfile[] }>('/users');
        if (cancelled) return;
        setAllUsers(roster.items);
      }

      if (!isSignedIn) return;
      const [history, pays] = await Promise.all([
        api.get<{ practice: PracticeAttempt[]; mock: MockTestAttempt[] }>('/attempts'),
        api.get<{ items: PaymentSubmission[] }>('/payments'),
      ]);
      if (cancelled) return;
      setPracticeAttempts(history.practice);
      setMockAttempts(history.mock);
      setPayments(pays.items);
    };

    // ponytail: every route tree calls useAppStore(), so this refetches on each
    // navigation. Cheap at this size and always fresh; move the reads into
    // server components (or add SWR) when the payload starts to hurt.
    load().catch((err) => console.error('Could not load from the API', err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUserId, isSignedIn]);

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
    // Flips the load effect from "content only" to "content and this person's
    // attempts, payments and roster".
    setIsSignedIn(true);
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
        ? applyPlanGrants(current, grantsOrPlan, courses.map((c) => c.id))
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
    phone: string,
    email?: string,
    permissions: Partial<AdminPermission> = {},
  ): Promise<UserProfile> =>
    createIn<UserProfile>('/users', setAllUsers, { name, phone, email, permissions });

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
    addQuestions,
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
