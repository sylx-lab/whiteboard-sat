/**
 * Run with: node --test app/features/admin/lib/questionCodes.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { suggestQuestionCode, findCodeConflict, distinctValues } from './questionCodes.ts';

type Row = Parameters<typeof findCodeConflict>[1][number];

const q = (code: string, extra: Record<string, unknown> = {}) =>
  ({ id: code, code, ...extra }) as unknown as Row;

test('starts numbering at 101 for an empty bank', () => {
  assert.equal(suggestQuestionCode('algebra', []), 'M-ALG-101');
});

test('continues past the highest existing number for that prefix', () => {
  const bank = [q('M-ALG-101'), q('M-ALG-102')];
  assert.equal(suggestQuestionCode('algebra', bank), 'M-ALG-103');
});

test('does not reuse a gap left by a deleted question', () => {
  // 102 was deleted; reusing it would collide with old attempt history.
  assert.equal(suggestQuestionCode('algebra', [q('M-ALG-101'), q('M-ALG-103')]), 'M-ALG-104');
});

test('numbers each domain prefix independently', () => {
  const bank = [q('M-ALG-140'), q('RW-CRA-101')];
  assert.equal(suggestQuestionCode('craft_structure', bank), 'RW-CRA-102');
  assert.equal(suggestQuestionCode('geometry_trigonometry', bank), 'M-GEO-101');
});

test('ignores codes that do not match the prefix pattern', () => {
  const bank = [q('M-ALG-legacy'), q('M-ALGX-900'), q('  m-alg-105 ')];
  assert.equal(suggestQuestionCode('algebra', bank), 'M-ALG-106');
});

test('finds a conflicting code case- and whitespace-insensitively', () => {
  const bank = [q('M-ALG-101')];
  assert.equal(findCodeConflict(' m-alg-101 ', bank)?.code, 'M-ALG-101');
});

test('does not flag a question against its own code', () => {
  const bank = [q('M-ALG-101')];
  assert.equal(findCodeConflict('M-ALG-101', bank, 'M-ALG-101'), undefined);
});

test('treats a blank code as no conflict', () => {
  assert.equal(findCodeConflict('   ', [q('M-ALG-101')]), undefined);
});

test('collects distinct sorted field values, skipping blanks', () => {
  const bank = [
    q('a', { topic: 'Slopes' }),
    q('b', { topic: 'Circles' }),
    q('c', { topic: 'Slopes' }),
    q('d', { topic: '  ' }),
    q('e', {}),
  ];
  assert.deepEqual(distinctValues(bank, 'topic'), ['Circles', 'Slopes']);
});
