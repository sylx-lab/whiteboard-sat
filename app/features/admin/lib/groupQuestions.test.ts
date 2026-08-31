/**
 * Run with: node --test app/features/admin/lib/groupQuestions.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { groupQuestions, missingDomains } from './groupQuestions.ts';

type Row = Parameters<typeof groupQuestions>[0][number];

const q = (domain: string, topic: string, extra: Record<string, unknown> = {}) =>
  ({ id: `${domain}-${topic}`, domain, topic, subject: 'math', ...extra }) as unknown as Row;

test('splits into subject sections, math first', () => {
  const sections = groupQuestions([q('craft_structure', 'Words'), q('algebra', 'Slopes')], 'domain');
  assert.deepEqual(
    sections.map((s) => s.subject),
    ['math', 'reading_writing']
  );
});

test('omits a subject with no questions', () => {
  const sections = groupQuestions([q('algebra', 'Slopes')], 'domain');
  assert.equal(sections.length, 1);
  assert.equal(sections[0].subject, 'math');
});

test('orders domains by College Board order, not alphabetically', () => {
  const sections = groupQuestions(
    [q('geometry_trigonometry', 'Circles'), q('algebra', 'Slopes'), q('advanced_math', 'Quadratics')],
    'domain'
  );
  assert.deepEqual(
    sections[0].groups.map((g) => g.key),
    ['algebra', 'advanced_math', 'geometry_trigonometry']
  );
});

test('derives the subject from the domain, ignoring a contradictory stored subject', () => {
  // An imported row claiming subject:'math' on a verbal domain must still file under verbal.
  const sections = groupQuestions([q('craft_structure', 'Words', { subject: 'math' })], 'domain');
  assert.equal(sections[0].subject, 'reading_writing');
});

test('groups by topic alphabetically and labels with the raw topic', () => {
  const sections = groupQuestions(
    [q('algebra', 'Slopes'), q('advanced_math', 'Quadratics'), q('algebra', 'Slopes')],
    'topic'
  );
  assert.deepEqual(
    sections[0].groups.map((g) => [g.label, g.questions.length]),
    [
      ['Quadratics', 1],
      ['Slopes', 2],
    ]
  );
});

test('files blank topics under Uncategorised', () => {
  const sections = groupQuestions([q('algebra', '   ')], 'topic');
  assert.equal(sections[0].groups[0].label, 'Uncategorised');
});

test('counts drafts per group', () => {
  const sections = groupQuestions(
    [q('algebra', 'A', { status: 'draft' }), q('algebra', 'B', { status: 'published' })],
    'domain'
  );
  assert.equal(sections[0].groups[0].draftCount, 1);
  assert.equal(sections[0].groups[0].questions.length, 2);
});

test('reports uncovered domains', () => {
  assert.equal(missingDomains([]).length, 8);
  assert.ok(!missingDomains([q('algebra', 'A')]).includes('algebra'));
  assert.equal(missingDomains([q('algebra', 'A')]).length, 7);
});

test('counts the difficulty mix per group', () => {
  const sections = groupQuestions(
    [
      q('algebra', 'A', { difficulty: 'easy' }),
      q('algebra', 'B', { difficulty: 'hard' }),
      q('algebra', 'C', { difficulty: 'hard' }),
    ],
    'domain'
  );
  assert.deepEqual(sections[0].groups[0].difficultyMix, { easy: 1, medium: 0, hard: 2 });
});

test('lists a domain group\'s distinct topics, sorted', () => {
  const sections = groupQuestions(
    [q('algebra', 'Slopes'), q('algebra', 'Circles'), q('algebra', 'Slopes')],
    'domain'
  );
  assert.deepEqual(sections[0].groups[0].topics, ['Circles', 'Slopes']);
});

test('includeEmptyDomains produces a card for every domain and both subjects', () => {
  const sections = groupQuestions([], 'domain', { includeEmptyDomains: true });
  assert.deepEqual(
    sections.map((s) => s.subject),
    ['math', 'reading_writing']
  );
  assert.equal(sections.flatMap((s) => s.groups).length, 8);
  assert.ok(sections.every((s) => s.total === 0));
});

test('includeEmptyDomains keeps College Board order and real counts', () => {
  const sections = groupQuestions([q('geometry_trigonometry', 'Circles')], 'domain', {
    includeEmptyDomains: true,
  });
  assert.deepEqual(
    sections[0].groups.map((g) => [g.key, g.questions.length]),
    [
      ['algebra', 0],
      ['advanced_math', 0],
      ['problem_solving_data_analysis', 0],
      ['geometry_trigonometry', 1],
    ]
  );
});

test('includeEmptyDomains is ignored when grouping by topic', () => {
  const sections = groupQuestions([q('algebra', 'Slopes')], 'topic', { includeEmptyDomains: true });
  assert.equal(sections.flatMap((s) => s.groups).length, 1);
});

test('sorts questions within a group by code natural order', () => {
  const sections = groupQuestions(
    [
      q('algebra', 'Slopes', { code: 'M-ALG-103' }),
      q('algebra', 'Slopes', { code: 'M-ALG-101' }),
      q('algebra', 'Slopes', { code: 'M-ALG-102' }),
    ],
    'domain'
  );
  assert.deepEqual(
    sections[0].groups[0].questions.map((item) => item.code),
    ['M-ALG-101', 'M-ALG-102', 'M-ALG-103']
  );
});

