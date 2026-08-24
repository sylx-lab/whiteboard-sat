/**
 * Run with: node --test app/features/admin/lib/topics.test.ts
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { listTopics, renameTopic, mergeTopics, findDuplicateTopics, topicStats } from './topics.ts';

type Row = Parameters<typeof listTopics>[0][number];
let n = 0;
const q = (domain: string, topic: string, extra: Record<string, unknown> = {}) =>
  ({ id: `q${++n}`, domain, topic, ...extra }) as unknown as Row;

test('lists distinct topics per domain with counts', () => {
  const entries = listTopics([q('algebra', 'Slopes'), q('algebra', 'Slopes'), q('algebra', 'Circles')]);
  assert.deepEqual(
    entries.map((e) => [e.topic, e.count]),
    [
      ['Circles', 1],
      ['Slopes', 2],
    ]
  );
});

test('scopes topics per domain, so the same name in two domains stays separate', () => {
  const entries = listTopics([q('algebra', 'Functions'), q('advanced_math', 'Functions')]);
  assert.equal(entries.length, 2);
  assert.deepEqual(entries.map((e) => e.domain), ['algebra', 'advanced_math']);
});

test('orders by College Board domain order, then topic A-Z', () => {
  const entries = listTopics([
    q('geometry_trigonometry', 'Circles'),
    q('algebra', 'Slopes'),
    q('algebra', 'Angles'),
  ]);
  assert.deepEqual(
    entries.map((e) => e.topic),
    ['Angles', 'Slopes', 'Circles']
  );
});

test('ignores blank topics and trims', () => {
  const entries = listTopics([q('algebra', '   '), q('algebra', '  Slopes  ')]);
  assert.deepEqual(entries.map((e) => [e.topic, e.count]), [['Slopes', 1]]);
});

test('counts drafts per topic', () => {
  const entries = listTopics([
    q('algebra', 'Slopes', { status: 'draft' }),
    q('algebra', 'Slopes', { status: 'published' }),
  ]);
  assert.equal(entries[0].draftCount, 1);
});

test('rename returns an update per affected question, in that domain only', () => {
  const bank = [q('algebra', 'Slopes'), q('algebra', 'Slopes'), q('advanced_math', 'Slopes')];
  const updates = renameTopic(bank, 'algebra', 'Slopes', 'Linear Slopes');
  assert.equal(updates.length, 2);
  assert.ok(updates.every((u) => u.topic === 'Linear Slopes'));
});

test('renaming onto an existing name is the merge', () => {
  const bank = [q('algebra', 'slopes'), q('algebra', 'Slopes')];
  const updates = renameTopic(bank, 'algebra', 'slopes', 'Slopes');
  assert.deepEqual(updates.map((u) => u.topic), ['Slopes']);
});

test('rename is a no-op for a blank or unchanged target', () => {
  const bank = [q('algebra', 'Slopes')];
  assert.deepEqual(renameTopic(bank, 'algebra', 'Slopes', '   '), []);
  assert.deepEqual(renameTopic(bank, 'algebra', 'Slopes', 'Slopes'), []);
});

test('merge moves several topics onto one and skips the target itself', () => {
  const bank = [q('algebra', 'A'), q('algebra', 'B'), q('algebra', 'Keep')];
  const updates = mergeTopics(bank, 'algebra', ['A', 'B', 'Keep'], 'Keep');
  assert.equal(updates.length, 2);
  assert.ok(updates.every((u) => u.topic === 'Keep'));
});

test('merge is a no-op with no real sources', () => {
  const bank = [q('algebra', 'Keep')];
  assert.deepEqual(mergeTopics(bank, 'algebra', ['Keep'], 'Keep'), []);
  assert.deepEqual(mergeTopics(bank, 'algebra', ['A'], '  '), []);
});

test('flags case and punctuation drift as duplicates, most-used first', () => {
  const groups = findDuplicateTopics([
    q('algebra', 'Linear Equations'),
    q('algebra', 'Linear Equations'),
    q('algebra', 'linear equations'),
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(
    groups[0].variants.map((v) => [v.topic, v.count]),
    [
      ['Linear Equations', 2],
      ['linear equations', 1],
    ]
  );
});

test('treats & and "and" as the same word', () => {
  const groups = findDuplicateTopics([q('algebra', 'Rates & Ratios'), q('algebra', 'Rates and Ratios')]);
  assert.equal(groups.length, 1);
});

test('does not flag genuinely different topics', () => {
  assert.deepEqual(findDuplicateTopics([q('algebra', 'Slopes'), q('algebra', 'Circles')]), []);
});

test('does not flag the same drift across different domains', () => {
  // Topics are per-domain, so these are not duplicates of each other.
  assert.deepEqual(findDuplicateTopics([q('algebra', 'Functions'), q('advanced_math', 'functions')]), []);
});

test('summarises topic counts per subject', () => {
  const stats = topicStats([q('algebra', 'A'), q('advanced_math', 'B'), q('craft_structure', 'C')]);
  assert.deepEqual(stats, { total: 3, math: 2, readingWriting: 1 });
});

test('on a count tie, suggests the better-capitalised variant as the target', () => {
  const groups = findDuplicateTopics([q('algebra', 'linear equations'), q('algebra', 'Linear Equations')]);
  assert.equal(groups[0].variants[0].topic, 'Linear Equations');
});

test('count still beats capitalisation', () => {
  const groups = findDuplicateTopics([
    q('algebra', 'linear equations'),
    q('algebra', 'linear equations'),
    q('algebra', 'Linear Equations'),
  ]);
  assert.equal(groups[0].variants[0].topic, 'linear equations');
});
