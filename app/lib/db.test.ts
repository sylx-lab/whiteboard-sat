import { test } from 'node:test';
import assert from 'node:assert';
import { fromDoc, toDoc } from './db.ts';
import { INITIAL_QUESTIONS } from '../data/seedData.ts';

test('id <-> _id round-trips a real seed question without losing fields', () => {
  const q = INITIAL_QUESTIONS[0];
  const doc = toDoc(q);
  assert.equal(doc._id, q.id);
  assert.ok(!('id' in doc));
  assert.deepEqual(fromDoc(doc), q);
});
