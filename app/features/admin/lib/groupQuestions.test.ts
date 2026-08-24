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
