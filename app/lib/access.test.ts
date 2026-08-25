import { test } from 'node:test';
import assert from 'node:assert';
import {
  applyPlanGrants,
  canSeeQuestion,
  redactMockTest,
  redactQuestion,
} from './access.ts';
import { INITIAL_PLANS, INITIAL_QUESTIONS } from '../data/seedData.ts';
import type { AccessGrants, UserProfile } from '../types.ts';

const NOTHING: AccessGrants = {
  premiumMath: false,
  premiumReadingWriting: false,
  redbookPractice: false,
  enrolledCourseIds: [],
  fullPremium: false,
};

/** A test fixture, not a demo account: the app ships no users at all. */
const PERSON: UserProfile = {
  id: 'user-test',
  name: 'Test Person',
  phone: '+880 1700 000000',
  role: 'student',
  targetScore: 1550,
  createdAt: '2026-01-01',
  access: NOTHING,
};

const student = (access: Partial<AccessGrants>): UserProfile => ({
  ...PERSON,
  role: 'student',
  access: { ...NOTHING, ...access },
});

test('a premium math question needs the math pass, not just any pass', () => {
  const q = { is_free: false, subject: 'math' as const };
  assert.equal(canSeeQuestion(null, q), false);
  assert.equal(canSeeQuestion(student({}), q), false);
  assert.equal(canSeeQuestion(student({ premiumReadingWriting: true }), q), false);
  assert.equal(canSeeQuestion(student({ premiumMath: true }), q), true);
  assert.equal(canSeeQuestion(student({ fullPremium: true }), q), true);
});

test('free questions are visible signed out; admins see everything', () => {
  assert.equal(canSeeQuestion(null, { is_free: true, subject: 'math' }), true);
  const admin: UserProfile = { ...PERSON, role: 'admin', access: NOTHING };
  assert.equal(canSeeQuestion(admin, { is_free: false, subject: 'reading_writing' }), true);
});

test('redaction leaves nothing worth paying for', () => {
  const locked = redactQuestion({ ...INITIAL_QUESTIONS[0], correct_answer: 'C' });
  assert.equal(locked.question_text, '');
  assert.equal(locked.explanation, '');
  assert.deepEqual(locked.choices, []);
  assert.notEqual(locked.correct_answer, 'C');
  // metadata survives, so the locked card still renders
  assert.equal(locked.code, INITIAL_QUESTIONS[0].code);
  assert.equal(locked.difficulty, INITIAL_QUESTIONS[0].difficulty);
});

test('a redacted mock test keeps its question count', () => {
  const test1 = {
    id: 't1',
    title: 'T',
    description: '',
    is_free: false,
    difficulty: 'medium' as const,
    totalQuestions: 0,
    totalTimeMinutes: 0,
    modules: [
      {
        id: 'm1',
        testId: 't1',
        title: 'M',
        section: 'math' as const,
        moduleNumber: 1 as const,
        timeLimitMinutes: 35,
        questions: INITIAL_QUESTIONS.slice(0, 3),
      },
    ],
  };
  const redacted = redactMockTest(test1);
  assert.equal(redacted.modules[0].questions.length, 3);
  assert.equal(redacted.modules[0].questions[0].question_text, '');
});

test('the math plan grants the math course without dropping an existing English grant', () => {
  const plan = INITIAL_PLANS.find((p) => p.id === 'plan-math')!;
  const next = applyPlanGrants(
    { ...NOTHING, premiumReadingWriting: true, enrolledCourseIds: ['c-rw-750'] },
    plan,
    ['c-math-800', 'c-rw-750', 'c-extra'],
  );
  assert.equal(next.premiumMath, true);
  assert.equal(next.premiumReadingWriting, true, 'existing grant must survive');
  assert.equal(next.fullPremium, false);
  assert.deepEqual(next.enrolledCourseIds.slice().sort(), ['c-math-800', 'c-rw-750']);
});

test('a full-premium plan enrols every course that exists, not a hardcoded pair', () => {
  const plan = INITIAL_PLANS.find((p) => p.grants.fullPremium || p.grants.allCourses)!;
  const next = applyPlanGrants(NOTHING, plan, ['c-a', 'c-b', 'c-c']);
  assert.equal(next.fullPremium, true);
  assert.deepEqual(next.enrolledCourseIds, ['c-a', 'c-b', 'c-c']);
});

test('granting twice does not duplicate a course id', () => {
  const plan = INITIAL_PLANS.find((p) => p.id === 'plan-math')!;
  const once = applyPlanGrants(NOTHING, plan, []);
  const twice = applyPlanGrants(once, plan, []);
  assert.deepEqual(twice.enrolledCourseIds, ['c-math-800']);
});
