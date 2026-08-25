import { test } from 'node:test';
import assert from 'node:assert';
import { rankLeaders } from './leaderboard.ts';

const row = (name: string, solved: number, correct: number, attempted: number) => ({
  userId: `user-${name}`,
  name,
  solved,
  correct,
  attempted,
});

test('most distinct questions solved comes first', () => {
  const ranked = rankLeaders([row('Ayesha', 12, 12, 20), row('Bashir', 40, 40, 50), row('Chad', 3, 3, 3)]);
  assert.deepEqual(ranked.map((r) => r.name), ['Bashir', 'Ayesha', 'Chad']);
  assert.deepEqual(ranked.map((r) => r.rank), [1, 2, 3]);
});

test('a tie on solves breaks toward accuracy, then toward fewer attempts', () => {
  const ranked = rankLeaders([
    row('Grinder', 40, 40, 400), // same solves, kept guessing
    row('Sharp', 40, 40, 45), // same solves, barely missed
  ]);
  assert.equal(ranked[0].name, 'Sharp');
  assert.equal(ranked[0].accuracyPercent, 89);
  assert.equal(ranked[1].accuracyPercent, 10);
});

test('genuine ties share a rank and the next place is skipped', () => {
  const ranked = rankLeaders([
    row('Ada', 10, 10, 10),
    row('Bo', 10, 10, 10),
    row('Cy', 5, 5, 10),
  ]);
  assert.deepEqual(ranked.map((r) => r.rank), [1, 1, 3]);
  // stable within a tie, so the board does not reshuffle between page loads
  assert.deepEqual(ranked.slice(0, 2).map((r) => r.name), ['Ada', 'Bo']);
});

test('accuracy is over every attempt, so repeats cost you', () => {
  // 8 distinct questions solved, but 32 attempts to get there
  const [only] = rankLeaders([row('Repeater', 8, 8, 32)]);
  assert.equal(only.solved, 8);
  assert.equal(only.accuracyPercent, 25);
});

test('someone with no attempts does not divide by zero', () => {
  const [only] = rankLeaders([row('Newcomer', 0, 0, 0)]);
  assert.equal(only.accuracyPercent, 0);
  assert.equal(only.rank, 1);
});
