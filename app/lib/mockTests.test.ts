/**
 * Run with: node --test app/lib/mockTests.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  standardSatModules,
  deriveTotals,
  mockTestIssues,
  isPlayable,
  eligibleQuestions,
  moduleTitle,
} from './mockTests.ts';

type Mod = ReturnType<typeof standardSatModules>[number];

const mod = (over: Record<string, unknown> = {}): Mod =>
  ({
    id: 'm1',
    testId: 't',
    title: 'Math — Module 1',
    section: 'math',
    moduleNumber: 1,
    timeLimitMinutes: 35,
    questions: [],
    ...over,
  }) as unknown as Mod;

const q = (subject = 'math', extra: Record<string, unknown> = {}) =>
  ({ id: `q-${subject}-${Math.abs(subject.length)}`, subject, ...extra }) as never;

test('scaffolds the real SAT structure: verbal first, then math, 134 minutes', () => {
  const mods = standardSatModules('t1');
  assert.deepEqual(
    mods.map((m) => [m.section, m.moduleNumber, m.timeLimitMinutes]),
    [
      ['reading_writing', 1, 32],
      ['reading_writing', 2, 32],
      ['math', 1, 35],
      ['math', 2, 35],
    ]
  );
  assert.equal(deriveTotals(mods).totalTimeMinutes, 134);
});

test('scaffolded modules start with no questions and unique ids', () => {
  const mods = standardSatModules('t1');
  assert.ok(mods.every((m) => m.questions.length === 0));
  assert.equal(new Set(mods.map((m) => m.id)).size, 4);
});

test('names modules the way the student sees them', () => {
  assert.equal(moduleTitle('reading_writing', 2), 'Reading & Writing — Module 2');
  assert.equal(moduleTitle('math', 1), 'Math — Module 1');
});

test('derives totals from the modules, not from typed numbers', () => {
  const mods = [
    mod({ timeLimitMinutes: 30, questions: [q(), q()] }),
    mod({ id: 'm2', timeLimitMinutes: 10, questions: [q()] }),
  ];
  assert.deepEqual(deriveTotals(mods), { totalQuestions: 3, totalTimeMinutes: 40 });
});

test('treats a non-numeric time limit as zero rather than NaN', () => {
  assert.equal(deriveTotals([mod({ timeLimitMinutes: undefined })]).totalTimeMinutes, 0);
});

test('a test with no modules is blocking and not playable', () => {
  const issues = mockTestIssues([]);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].severity, 'blocking');
  assert.equal(isPlayable({ modules: [] }), false);
});

test('an empty FIRST module blocks, since starting an attempt reads it', () => {
  const mods = [mod({ questions: [] }), mod({ id: 'm2', questions: [q()] })];
  assert.equal(mockTestIssues(mods)[0].severity, 'blocking');
  assert.equal(isPlayable({ modules: mods }), false);
});

test('an empty LATER module only warns', () => {
  const mods = [mod({ questions: [q()] }), mod({ id: 'm2', questions: [] })];
  const issues = mockTestIssues(mods);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].severity, 'warning');
  assert.equal(isPlayable({ modules: mods }), true);
});

test('a module with no time limit blocks', () => {
  const mods = [mod({ questions: [q()], timeLimitMinutes: 0 })];
  assert.ok(mockTestIssues(mods).some((i) => i.severity === 'blocking'));
});

test('warns when a module holds questions from the other section', () => {
  const mods = [mod({ section: 'math', questions: [q('reading_writing')] })];
  const issues = mockTestIssues(mods);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].severity, 'warning');
});

test('a fully configured test reports no issues', () => {
  assert.deepEqual(mockTestIssues([mod({ questions: [q('math')] })]), []);
});

test('eligible questions match the section and exclude drafts', () => {
  const bank = [
    q('math', { id: 'a', status: 'published' }),
    q('math', { id: 'b', status: 'draft' }),
    q('reading_writing', { id: 'c', status: 'published' }),
    q('math', { id: 'd' }),
  ];
  assert.deepEqual(
    eligibleQuestions(bank, 'math').map((x: { id: string }) => x.id),
    ['a', 'd']
  );
});
