import assert from 'node:assert/strict';
import test from 'node:test';
import type { Question } from '../types.ts';
import { compareQuestionCodes, sortQuestions } from './questionSort.ts';

const createQ = (partial: Partial<Question>): Question =>
  ({
    id: partial.id || `q-${Math.random()}`,
    code: partial.code || 'M-ALG-101',
    subject: partial.subject || 'math',
    domain: partial.domain || 'algebra',
    topic: partial.topic || 'Linear Equations',
    difficulty: partial.difficulty || 'medium',
    question_text: 'Sample text',
    answer_choices: [],
    correct_answer: 'A',
    is_free: true,
    created_at: partial.created_at || '2026-01-01',
    ...partial,
  }) as Question;

test('compareQuestionCodes sorts alphanumeric codes naturally', () => {
  assert.ok(compareQuestionCodes('M-ALG-9', 'M-ALG-10') < 0);
  assert.ok(compareQuestionCodes('M-ALG-101', 'M-ALG-102') < 0);
  assert.ok(compareQuestionCodes('M-ALG-102', 'M-ALG-101') > 0);
  assert.equal(compareQuestionCodes('M-ALG-101', 'M-ALG-101'), 0);
});

test('recommended sort orders by domain, topic, difficulty (easy -> medium -> hard), then code', () => {
  const easy = createQ({ code: 'M-ALG-102', difficulty: 'easy', topic: 'Linear Equations' });
  const medium = createQ({ code: 'M-ALG-101', difficulty: 'medium', topic: 'Linear Equations' });
  const hard = createQ({ code: 'M-ALG-103', difficulty: 'hard', topic: 'Linear Equations' });

  // Regardless of input order (e.g. medium created newly and placed at front)
  const sorted = sortQuestions([medium, hard, easy], 'recommended');

  assert.equal(sorted[0].difficulty, 'easy');
  assert.equal(sorted[1].difficulty, 'medium');
  assert.equal(sorted[2].difficulty, 'hard');
  assert.equal(sorted[0].code, 'M-ALG-102');
  assert.equal(sorted[1].code, 'M-ALG-101');
  assert.equal(sorted[2].code, 'M-ALG-103');
});

test('recommended sort places easy algebra before easy geometry', () => {
  const geomEasy = createQ({ domain: 'geometry_trigonometry', difficulty: 'easy', code: 'M-GEO-101' });
  const algEasy = createQ({ domain: 'algebra', difficulty: 'easy', code: 'M-ALG-101' });

  const sorted = sortQuestions([geomEasy, algEasy], 'recommended');
  assert.equal(sorted[0].domain, 'algebra');
  assert.equal(sorted[1].domain, 'geometry_trigonometry');
});

test('difficulty sort puts all easy first across domains, then medium, then hard', () => {
  const qHard = createQ({ domain: 'algebra', difficulty: 'hard', code: 'M-ALG-101' });
  const qMed = createQ({ domain: 'algebra', difficulty: 'medium', code: 'M-ALG-102' });
  const qEasy = createQ({ domain: 'geometry_trigonometry', difficulty: 'easy', code: 'M-GEO-101' });

  const sorted = sortQuestions([qHard, qMed, qEasy], 'difficulty');
  assert.deepEqual(
    sorted.map((q) => q.difficulty),
    ['easy', 'medium', 'hard']
  );
});

test('newest sort orders by created_at date descending, then code descending', () => {
  const qOld = createQ({ code: 'M-ALG-101', created_at: '2026-01-01' });
  const qNew = createQ({ code: 'M-ALG-105', created_at: '2026-08-30' });

  const sorted = sortQuestions([qOld, qNew], 'newest');
  assert.equal(sorted[0].code, 'M-ALG-105');
  assert.equal(sorted[1].code, 'M-ALG-101');
});
