import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Domain, Subject, Difficulty } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The SAT domains in the order the College Board lists them. Category ordering in
 * the admin bank, the editor's dropdowns, and the dashboard's domain stats all read
 * from here, so they cannot drift apart.
 */
export const MATH_DOMAINS: Domain[] = [
  'algebra',
  'advanced_math',
  'problem_solving_data_analysis',
  'geometry_trigonometry',
];

export const READING_WRITING_DOMAINS: Domain[] = [
  'information_ideas',
  'craft_structure',
  'expression_ideas',
  'standard_english_conventions',
];

export const ALL_DOMAINS: Domain[] = [...MATH_DOMAINS, ...READING_WRITING_DOMAINS];

export function domainsForSubject(subject: Subject): Domain[] {
  return subject === 'math' ? MATH_DOMAINS : READING_WRITING_DOMAINS;
}

export function formatSubjectName(subject: Subject): string {
  return subject === 'math' ? 'Math' : 'Reading & Writing';
}

export function formatDomainName(domain: Domain): string {
  const domainMap: Record<Domain, string> = {
    algebra: 'Algebra',
    advanced_math: 'Advanced Math',
    problem_solving_data_analysis: 'Problem-Solving & Data Analysis',
    geometry_trigonometry: 'Geometry & Trigonometry',
    information_ideas: 'Information & Ideas',
    craft_structure: 'Craft & Structure',
    expression_ideas: 'Expression of Ideas',
    standard_english_conventions: 'Standard English Conventions',
  };
  return domainMap[domain] || domain;
}

export function getDomainSubject(domain: Domain): Subject {
  return MATH_DOMAINS.includes(domain) ? 'math' : 'reading_writing';
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getDifficultyColor(difficulty?: Difficulty | string | null): { bg: string; text: string; border: string } {
  const norm = (difficulty || '').toLowerCase();
  switch (norm) {
    case 'easy':
      return { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'hard':
      return { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' };
    case 'medium':
    default:
      return { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' };
  }
}

export function estimateSATScore(mathCorrect: number, mathTotal: number, rwCorrect: number, rwTotal: number): {
  mathScore: number;
  rwScore: number;
  totalScore: number;
} {
  // Approximate standard SAT scale (200-800 per section)
  const mathRatio = mathTotal > 0 ? mathCorrect / mathTotal : 0;
  const rwRatio = rwTotal > 0 ? rwCorrect / rwTotal : 0;

  // Non-linear scaled score simulation reflecting standard SAT raw-to-scaled curves
  // Rounded to the nearest 10, as the real scale is. The /10 and *10 belong
  // around the whole score: inside, every ratio rounded up to the 800 cap and
  // every attempt scored 1600.
  const mathScaled = Math.round((200 + 600 * Math.pow(mathRatio, 0.95)) / 10) * 10;
  const rwScaled = Math.round((200 + 600 * Math.pow(rwRatio, 0.95)) / 10) * 10;

  const boundedMath = Math.max(200, Math.min(800, mathScaled));
  const boundedRw = Math.max(200, Math.min(800, rwScaled));

  return {
    mathScore: boundedMath,
    rwScore: boundedRw,
    totalScore: boundedMath + boundedRw,
  };
}
