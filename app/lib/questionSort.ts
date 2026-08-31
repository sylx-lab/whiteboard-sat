import type { Difficulty, Domain, Question } from '../types';
import { ALL_DOMAINS } from './utils.ts';

export type QuestionSortOption = 'recommended' | 'difficulty' | 'newest';

export const DOMAIN_RANK = new Map<Domain, number>(ALL_DOMAINS.map((d, i) => [d, i]));

export const DIFFICULTY_RANK: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/** Natural alphanumeric code comparison, e.g. M-ALG-9 before M-ALG-10, M-ALG-101 before M-ALG-102. */
export function compareQuestionCodes(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sorts questions based on the chosen mode:
 * - 'recommended': Domain order -> Topic -> Difficulty (easy -> medium -> hard) -> Code ascending
 * - 'difficulty': Difficulty (easy -> medium -> hard) -> Domain order -> Topic -> Code ascending
 * - 'newest': Created date descending -> Code descending
 */
export function sortQuestions(
  questions: Question[],
  sortBy: QuestionSortOption = 'recommended'
): Question[] {
  const list = [...questions];

  if (sortBy === 'difficulty') {
    return list.sort((a, b) => {
      const diffComp = (DIFFICULTY_RANK[a.difficulty] ?? 99) - (DIFFICULTY_RANK[b.difficulty] ?? 99);
      if (diffComp !== 0) return diffComp;

      const domA = DOMAIN_RANK.get(a.domain) ?? 99;
      const domB = DOMAIN_RANK.get(b.domain) ?? 99;
      if (domA !== domB) return domA - domB;

      const topicComp = (a.topic || '').localeCompare(b.topic || '');
      if (topicComp !== 0) return topicComp;

      return compareQuestionCodes(a.code, b.code);
    });
  }

  if (sortBy === 'newest') {
    return list.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;

      return compareQuestionCodes(b.code, a.code);
    });
  }

  // 'recommended' mode
  return list.sort((a, b) => {
    const domA = DOMAIN_RANK.get(a.domain) ?? 99;
    const domB = DOMAIN_RANK.get(b.domain) ?? 99;
    if (domA !== domB) return domA - domB;

    const topicComp = (a.topic || '').localeCompare(b.topic || '');
    if (topicComp !== 0) return topicComp;

    const diffComp = (DIFFICULTY_RANK[a.difficulty] ?? 99) - (DIFFICULTY_RANK[b.difficulty] ?? 99);
    if (diffComp !== 0) return diffComp;

    return compareQuestionCodes(a.code, b.code);
  });
}
