import type { Question } from '../../../types';

export type QuestionDraft = Omit<Question, 'id' | 'created_at' | 'updated_at'>;

export interface ImportPlan {
  /** Drafts safe to add, in input order. */
  accept: QuestionDraft[];
  /** Skipped because a question with the same code already exists (or repeats within the payload). */
  duplicate: number;
  /** Skipped because code, question_text, or correct_answer was missing. */
  incomplete: number;
}

/**
 * Decide what to do with a pasted JSON payload before touching the store.
 * Throws on anything that is not a JSON array — callers turn that into a message.
 */
export function planQuestionImport(rawJson: string, existing: Question[]): ImportPlan {
  const parsed = JSON.parse(rawJson) as unknown;
  if (!Array.isArray(parsed)) {
    throw new SyntaxError('not-an-array');
  }

  const seenCodes = new Set(existing.map((q) => q.code.trim().toLowerCase()));
  const plan: ImportPlan = { accept: [], duplicate: 0, incomplete: 0 };

  for (const item of parsed) {
    const q = item as Partial<Question>;
    if (!q.code?.trim() || !q.question_text?.trim() || !q.correct_answer) {
      plan.incomplete++;
      continue;
    }
    const code = q.code.trim().toLowerCase();
    if (seenCodes.has(code)) {
      plan.duplicate++;
      continue;
    }
    seenCodes.add(code);
    plan.accept.push(q as QuestionDraft);
  }

  return plan;
}

/** Human summary of an import, e.g. "Imported 2 questions, skipped 1 duplicate code." */
export function describeImport(plan: ImportPlan): { ok: boolean; message: string } {
  const skipped: string[] = [];
  if (plan.duplicate) {
    skipped.push(`${plan.duplicate} duplicate code${plan.duplicate === 1 ? '' : 's'}`);
  }
  if (plan.incomplete) {
    skipped.push(`${plan.incomplete} missing code, text, or answer`);
  }
  const tail = skipped.length ? `, skipped ${skipped.join(' and ')}` : '';

  if (plan.accept.length === 0) {
    return {
      ok: false,
      message: `Nothing imported — ${skipped.join(' and ') || 'the array was empty'}.`,
    };
  }

  return {
    ok: true,
    message: `Imported ${plan.accept.length} question${plan.accept.length === 1 ? '' : 's'}${tail}.`,
  };
}
