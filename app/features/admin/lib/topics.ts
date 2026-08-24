import type { Question, Domain } from '../../../types';
import { formatDomainName, getDomainSubject } from '../../../lib/utils.ts';
import { ALL_DOMAINS } from '../../../lib/utils.ts';

/**
 * Topic maintenance. Topics are free text on a question, so the bank drifts into
 * near-duplicates ("Linear Equations" vs "linear equations"). These helpers back the
 * admin Topics view: rename everywhere, merge duplicates, and drop unused ones.
 *
 * Every function is pure and returns the edits to apply, so the caller decides how
 * to write them to the store.
 */

export interface TopicEntry {
  /** Domain the topic sits under. Topics are scoped per domain. */
  domain: Domain;
  domainLabel: string;
  topic: string;
  count: number;
  /** Questions carrying this exact topic string. */
  questionIds: string[];
  draftCount: number;
}

export interface TopicUpdate {
  questionId: string;
  topic: string;
}

/** Every distinct topic per domain, in College Board domain order then A–Z. */
export function listTopics(questions: Question[]): TopicEntry[] {
  const byKey = new Map<string, TopicEntry>();

  for (const q of questions) {
    const topic = q.topic.trim();
    if (!topic) continue;
    const key = `${q.domain}::${topic}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.questionIds.push(q.id);
      if (q.status === 'draft') existing.draftCount += 1;
    } else {
      byKey.set(key, {
        domain: q.domain,
        domainLabel: formatDomainName(q.domain),
        topic,
        count: 1,
        questionIds: [q.id],
        draftCount: q.status === 'draft' ? 1 : 0,
      });
    }
  }

  const order = new Map(ALL_DOMAINS.map((d, i) => [d, i]));
  return [...byKey.values()].sort(
    (a, b) =>
      (order.get(a.domain) ?? 99) - (order.get(b.domain) ?? 99) ||
      a.topic.localeCompare(b.topic)
  );
}

/**
 * Rename a topic within one domain. Renaming onto an existing topic name *is* the
 * merge operation — the questions simply join it.
 */
export function renameTopic(
  questions: Question[],
  domain: Domain,
  from: string,
  to: string
): TopicUpdate[] {
  const target = to.trim();
  const source = from.trim();
  if (!target || target === source) return [];

  return questions
    .filter((q) => q.domain === domain && q.topic.trim() === source)
    .map((q) => ({ questionId: q.id, topic: target }));
}

/** Move every question from several topics onto one, within a domain. */
export function mergeTopics(
  questions: Question[],
  domain: Domain,
  sources: string[],
  target: string
): TopicUpdate[] {
  const to = target.trim();
  if (!to) return [];
  const from = new Set(sources.map((s) => s.trim()).filter((s) => s && s !== to));
  if (from.size === 0) return [];

  return questions
    .filter((q) => q.domain === domain && from.has(q.topic.trim()))
    .map((q) => ({ questionId: q.id, topic: to }));
}

export interface DuplicateGroup {
  domain: Domain;
  domainLabel: string;
  /** The variants that collapse to the same normalised form, most-used first. */
  variants: { topic: string; count: number }[];
}

/**
 * Topics that differ only by case, punctuation, or whitespace — the drift worth
 * offering a one-click merge for. Suggests the most-used variant as the target.
 */
export function findDuplicateTopics(questions: Question[]): DuplicateGroup[] {
  const normalise = (t: string) =>
    t
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const buckets = new Map<string, Map<string, number>>();
  for (const entry of listTopics(questions)) {
    const key = `${entry.domain}::${normalise(entry.topic)}`;
    const bucket = buckets.get(key) ?? new Map<string, number>();
    bucket.set(entry.topic, (bucket.get(entry.topic) ?? 0) + entry.count);
    buckets.set(key, bucket);
  }

  // On a tie, prefer the better-capitalised spelling: "Linear Equations" should win
  // over "linear equations", not lose to it alphabetically.
  const capitals = (t: string) => (t.match(/[A-Z]/g) ?? []).length;

  const groups: DuplicateGroup[] = [];
  for (const [key, variants] of buckets) {
    if (variants.size < 2) continue;
    const domain = key.split('::')[0] as Domain;
    groups.push({
      domain,
      domainLabel: formatDomainName(domain),
      variants: [...variants.entries()]
        .map(([topic, count]) => ({ topic, count }))
        .sort(
          (a, b) =>
            b.count - a.count ||
            capitals(b.topic) - capitals(a.topic) ||
            a.topic.localeCompare(b.topic)
        ),
    });
  }

  return groups;
}

/** Domains that have questions but where a subject has none at all, for the view's summary. */
export function topicStats(questions: Question[]): {
  total: number;
  math: number;
  readingWriting: number;
} {
  const entries = listTopics(questions);
  return {
    total: entries.length,
    math: entries.filter((e) => getDomainSubject(e.domain) === 'math').length,
    readingWriting: entries.filter((e) => getDomainSubject(e.domain) === 'reading_writing').length,
  };
}
