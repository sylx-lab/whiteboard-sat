import type { AccessGrants, Course, MockTest, ProductPlan, Question, ResourceItem, UserProfile } from '../types.ts';

/**
 * The entitlement engine, shared by the store (which decides what to *render*)
 * and the API routes (which decide what actually *leaves the server*). One copy,
 * because a client-only check is a lock on a door with no wall.
 *
 * Pure: no database, no cookies. `app/lib/api.ts` supplies the user.
 */

const unlimited = (user: UserProfile | null): boolean =>
  !!user && (user.role === 'admin' || user.access?.fullPremium === true);

export function canSeeQuestion(
  user: UserProfile | null,
  q: Pick<Question, 'is_free' | 'subject'>,
): boolean {
  if (q.is_free) return true;
  if (!user) return false;
  if (unlimited(user)) return true;
  if (q.subject === 'math') return user.access.premiumMath;
  if (q.subject === 'reading_writing') return user.access.premiumReadingWriting;
  return false;
}

export function canSeeCourse(user: UserProfile | null, courseId: string): boolean {
  if (!user) return false;
  if (unlimited(user)) return true;
  return user.access.enrolledCourseIds.includes(courseId);
}

export function canSeeMockTest(
  user: UserProfile | null,
  test: Pick<MockTest, 'id' | 'is_free'>,
): boolean {
  if (test.is_free) return true;
  if (!user) return false;
  if (unlimited(user)) return true;
  return user.access?.unlockedMockTestIds?.includes(test.id) ?? false;
}

export function canSeeResource(user: UserProfile | null, r: Pick<ResourceItem, 'is_free'>): boolean {
  return r.is_free || unlimited(user);
}

/**
 * What a locked question looks like on the wire: enough to render the card and
 * its padlock, nothing anyone would pay for. It stays a `Question`, so the
 * locked branch in PracticeHub renders unchanged.
 */
export function redactQuestion(q: Question): Question {
  return {
    ...q,
    question_text: '',
    stimulus: undefined,
    choices: [],
    answer_choices: [],
    // Not the real answer. Nothing can be submitted while locked, and shipping
    // the true one is exactly what this function exists to stop.
    correct_answer: 'A',
    explanation: '',
    explanation_resource_link: undefined,
  };
}

/** Keeps the module shape (so deriveTotals still counts) and empties the questions. */
export function redactMockTest(test: MockTest): MockTest {
  return {
    ...test,
    modules: test.modules.map((m) => ({ ...m, questions: m.questions.map(redactQuestion) })),
  };
}

/** Titles and lesson list stay visible — the video does not, unless it is a free preview. */
export function redactCourse(course: Course): Course {
  return {
    ...course,
    lessons: course.lessons.map((l) =>
      l.isFreePreview ? l : { ...l, videoUrl: undefined, resources: [] },
    ),
  };
}

export function redactResource(r: ResourceItem): ResourceItem {
  return { ...r, downloadUrl: undefined, externalUrl: undefined };
}

/**
 * Expand a purchased plan onto a user's access. Lifted out of the store so the
 * payment-verification route grants exactly what the admin UI promises.
 *
 * `grants.mockTestsAll` is deliberately not read: canSeeMockTest keys premium
 * tests off fullPremium, so there is nothing separate to flip.
 */
export function applyPlanGrants(
  access: AccessGrants,
  plan: ProductPlan,
  allCourseIds: string[],
): AccessGrants {
  const g = plan.grants;
  if (g.allCourses || g.fullPremium) {
    return {
      premiumMath: true,
      premiumReadingWriting: true,
      redbookPractice: true,
      enrolledCourseIds: allCourseIds,
      fullPremium: true,
    };
  }

  const next: AccessGrants = {
    ...access,
    enrolledCourseIds: [...access.enrolledCourseIds],
    unlockedMockTestIds: access.unlockedMockTestIds ? [...access.unlockedMockTestIds] : [],
  };
  if (g.premiumMath) {
    next.premiumMath = true;
    next.redbookPractice = true;
    if (!next.enrolledCourseIds.includes('c-math-800')) next.enrolledCourseIds.push('c-math-800');
  }
  if (g.premiumReadingWriting) {
    next.premiumReadingWriting = true;
    if (!next.enrolledCourseIds.includes('c-rw-750')) next.enrolledCourseIds.push('c-rw-750');
  }
  return next;
}
