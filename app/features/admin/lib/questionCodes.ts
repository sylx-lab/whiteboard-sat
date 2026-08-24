import type { Question, Domain } from '../../../types';

/** Code prefix per SAT domain, e.g. algebra -> M-ALG. */
export const DOMAIN_CODE_PREFIX: Record<Domain, string> = {
  algebra: 'M-ALG',
  advanced_math: 'M-ADV',
  problem_solving_data_analysis: 'M-PSD',
  geometry_trigonometry: 'M-GEO',
  information_ideas: 'RW-INF',
  craft_structure: 'RW-CRA',
  expression_ideas: 'RW-EXP',
  standard_english_conventions: 'RW-SEC',
};

const FIRST_NUMBER = 101;

/**
 * Next free code for a domain, e.g. M-ALG-103 when 101 and 102 are taken.
 * Numbering is per prefix and always moves forward, so re-using a deleted number
 * never silently resurrects an old code in a student's attempt history.
 */
export function suggestQuestionCode(domain: Domain, existing: Question[]): string {
  const prefix = DOMAIN_CODE_PREFIX[domain];
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');

  let highest = FIRST_NUMBER - 1;
  for (const q of existing) {
    const match = q.code?.trim().match(pattern);
    if (match) {
      highest = Math.max(highest, Number(match[1]));
    }
  }

  return `${prefix}-${highest + 1}`;
}

/**
 * The question already using `code`, if any. `currentId` excludes the question
 * being edited so it never flags its own code.
 */
export function findCodeConflict(
  code: string,
  existing: Question[],
  currentId?: string
): Question | undefined {
  const normalised = code.trim().toLowerCase();
  if (!normalised) return undefined;
  return existing.find((q) => q.id !== currentId && q.code.trim().toLowerCase() === normalised);
}

/** Distinct non-empty values of a field, sorted, for a datalist. */
export function distinctValues(questions: Question[], field: 'topic' | 'subtopic' | 'source'): string[] {
  const seen = new Set<string>();
  for (const q of questions) {
    const value = (q[field] || '').trim();
    if (value) seen.add(value);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
