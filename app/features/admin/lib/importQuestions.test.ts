/**
 * Run with: node --test app/features/admin/lib/importQuestions.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { planQuestionImport, describeImport } from './importQuestions.ts';

// Only `code` is read by the planner, so a stub row is enough here.
const existing = [{ code: 'M-ALG-101' }] as Parameters<typeof planQuestionImport>[1];
const good = { code: 'M-ALG-200', question_text: 'If $x=5$?', correct_answer: 'A' };

test('accepts a complete new question', () => {
  const plan = planQuestionImport(JSON.stringify([good]), existing);
  assert.equal(plan.accept.length, 1);
  assert.equal(plan.duplicate, 0);
  assert.equal(plan.incomplete, 0);
});

test('skips codes already in the bank, case-insensitively', () => {
  const plan = planQuestionImport(JSON.stringify([{ ...good, code: 'm-alg-101' }]), existing);
  assert.equal(plan.accept.length, 0);
  assert.equal(plan.duplicate, 1);
});

test('skips duplicates repeated within one payload', () => {
  const plan = planQuestionImport(JSON.stringify([good, good]), existing);
  assert.equal(plan.accept.length, 1);
  assert.equal(plan.duplicate, 1);
});

test('skips items missing a required field', () => {
  const plan = planQuestionImport(
    JSON.stringify([{ code: 'M-ALG-300' }, { ...good, question_text: '  ' }]),
    existing
  );
  assert.equal(plan.accept.length, 0);
  assert.equal(plan.incomplete, 2);
});

test('rejects a payload that is not an array', () => {
  assert.throws(() => planQuestionImport(JSON.stringify(good), existing), SyntaxError);
});

test('summarises mixed results', () => {
  const plan = planQuestionImport(JSON.stringify([good, good, { code: 'x' }]), existing);
  const { ok, message } = describeImport(plan);
  assert.equal(ok, true);
  assert.equal(message, 'Imported 1 question, skipped 1 duplicate code and 1 missing code, text, or answer.');
});

test('reports an all-skipped import as a failure', () => {
  const plan = planQuestionImport(JSON.stringify([{ code: 'x' }]), existing);
  assert.equal(describeImport(plan).ok, false);
});
