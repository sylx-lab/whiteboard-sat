import type { Question } from '../types';

/**
 * A grid-in / SPR is the Digital SAT's non-multiple-choice math variant:
 * no A-D options, the student types a numeric answer (integer, decimal or fraction).
 */

export function isSprQuestion(q: Question | null | undefined): boolean {
  if (!q) return false;
  if (q.questionType === 'spr') return true;
  if (q.questionType === 'mcq') return false;
  // Back-compat: questions imported or seeded without questionType and with
  // empty choices are treated as SPR — that is exactly the bug being reported.
  const choices = (q.choices ?? q.answer_choices ?? []) as unknown[];
  if (choices.length === 0) return true;
  return false;
}

/** Numeric equivalence for SPR answers. Accepts "1/2" == ".5" == "0.5" == "0.50". */
export function parseSprValue(raw: string): number | null {
  const s = raw.trim().replace(/\s+/g, '');
  if (!s) return null;
  // fraction a/b
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2) return null;
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    return num / den;
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Build the set of acceptable numeric values from the stored correct_answer. */
export function sprCorrectValues(q: Question): number[] {
  const raw = String(q.correct_answer ?? '').trim();
  if (!raw) return [];
  // Allow multiple pipe/comma/semicolon separated acceptable answers: "0.5|1/2"
  const parts = raw.split(/[|,;]+/).map((p) => p.trim()).filter(Boolean);
  const nums: number[] = [];
  const strings: string[] = [];
  for (const p of parts) {
    const n = parseSprValue(p);
    if (n !== null && Number.isFinite(n)) nums.push(n);
    else strings.push(p.toLowerCase());
  }
  // If any part failed to parse as number, keep as string fallback count as non-numeric? Caller handles exact.
  // Return numeric ones; string equality is checked separately.
  return nums;
}

export function isSprAnswerCorrect(question: Question, entered: string | null | undefined): boolean {
  if (entered == null) return false;
  const trimmed = String(entered).trim();
  if (!trimmed) return false;
  const raw = String(question.correct_answer ?? '').trim();
  if (!raw) return false;

  // Exact string list match (case-insensitive, trimmed) — catches non-numeric edge.
  const acceptableStrings = raw.split(/[|,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (acceptableStrings.includes(trimmed.toLowerCase())) return true;

  const enteredNum = parseSprValue(trimmed);
  if (enteredNum === null || !Number.isFinite(enteredNum)) return false;

  // Numeric tolerance 1e-9 covers float representation of fractions.
  const EPS = 1e-9;
  for (const target of sprCorrectValues(question)) {
    if (Math.abs(enteredNum - target) < EPS) return true;
    // also tolerate 1e-4 for repeating decimals like 0.333 vs 1/3? Keep tight but allow 4dp.
    if (Math.abs(enteredNum - target) < 1e-4 && Math.abs(enteredNum - target) / Math.max(1, Math.abs(target)) < 1e-4) {
      // already covered by EPS for 1/3 case 0.333 vs 0.333333
      // For safety check with small epsilon still
    }
  }
  // Accept within 0.001 absolute for common rounding: 0.333 accepted for 1/3 (0.333333...)
  // Only if target is a repeating fraction we allow nearby. Simplify: accept if within 0.01? Too lax.
  // Do a looser 1e-3 check for fraction targets that are repeating.
  const enteredClose = sprCorrectValues(question).some((t) => Math.abs(enteredNum - t) < 1e-3);
  // Only allow looser tolerance if exact split didn't match and target had fraction form
  if (enteredClose && raw.includes('/')) return true;

  return false;
}
