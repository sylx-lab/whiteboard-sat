import { estimateSATScore } from './utils.ts';
import { isSprAnswerCorrect, isSprQuestion } from './spr.ts';
import type { MockTest, MockTestAttempt, MockTestModule, Question, Subject } from '../types';

/**
 * The real Digital SAT shape: two Reading & Writing modules then two Math modules,
 * 32/32/35/35 minutes. Used to scaffold a new mock so authors are not hand-typing
 * the official structure every time.
 */
export const STANDARD_SAT_STRUCTURE: {
  section: Subject;
  moduleNumber: 1 | 2;
  timeLimitMinutes: number;
}[] = [
  { section: 'reading_writing', moduleNumber: 1, timeLimitMinutes: 32 },
  { section: 'reading_writing', moduleNumber: 2, timeLimitMinutes: 32 },
  { section: 'math', moduleNumber: 1, timeLimitMinutes: 35 },
  { section: 'math', moduleNumber: 2, timeLimitMinutes: 35 },
];

export function moduleTitle(section: Subject, moduleNumber: 1 | 2): string {
  const label = section === 'math' ? 'Math' : 'Reading & Writing';
  return `${label} — Module ${moduleNumber}`;
}

export function makeModule(
  testId: string,
  section: Subject,
  moduleNumber: 1 | 2,
  timeLimitMinutes: number,
  idSuffix: string
): MockTestModule {
  return {
    id: `${testId}-mod-${idSuffix}`,
    testId,
    title: moduleTitle(section, moduleNumber),
    section,
    moduleNumber,
    timeLimitMinutes,
    questions: [],
  };
}

/** The four standard modules, empty of questions — the author picks those. */
export function standardSatModules(testId: string): MockTestModule[] {
  return STANDARD_SAT_STRUCTURE.map((m, i) =>
    makeModule(testId, m.section, m.moduleNumber, m.timeLimitMinutes, `std-${i + 1}`)
  );
}

/**
 * Totals are derived from the modules rather than typed by hand, so the summary a
 * student sees can never contradict the test they actually sit.
 */
export function deriveTotals(modules?: MockTestModule[]): {
  totalQuestions: number;
  totalTimeMinutes: number;
} {
  const list = Array.isArray(modules) ? modules : [];
  return {
    totalQuestions: list.reduce((sum, m) => sum + (m?.questions?.length || 0), 0),
    totalTimeMinutes: list.reduce((sum, m) => sum + (Number(m?.timeLimitMinutes) || 0), 0),
  };
}

export interface MockTestIssue {
  severity: 'blocking' | 'warning';
  message: string;
}

/**
 * Problems worth showing the author before they publish.
 *
 * "blocking" means a student cannot sit the test: MockTestsHub reads
 * `modules[0].timeLimitMinutes` when starting an attempt, so a test with no
 * modules — or a first module with no questions — is broken for students.
 */
export function mockTestIssues(modules?: MockTestModule[]): MockTestIssue[] {
  const issues: MockTestIssue[] = [];
  const list = Array.isArray(modules) ? modules : [];

  if (list.length === 0) {
    issues.push({
      severity: 'blocking',
      message: 'This test has no modules, so students cannot start it.',
    });
    return issues;
  }

  const totalQuestions = list.reduce((sum, m) => sum + (m?.questions?.length || 0), 0);
  if (totalQuestions === 0) {
    issues.push({
      severity: 'blocking',
      message: 'This test has no questions added yet.',
    });
    return issues;
  }

  const empty = list.filter((m) => !m?.questions || m.questions.length === 0);
  if (empty.length) {
    issues.push({
      severity: 'warning',
      message: `${empty.length} module${empty.length === 1 ? '' : 's'} ${
        empty.length === 1 ? 'has' : 'have'
      } no questions: ${empty.map((m) => m?.title || 'Untitled Module').join(', ')}.`,
    });
  }

  const untimed = list.filter((m) => (m?.questions?.length || 0) > 0 && (!m?.timeLimitMinutes || m.timeLimitMinutes < 1));
  if (untimed.length) {
    issues.push({
      severity: 'blocking',
      message: `${untimed.length} module${untimed.length === 1 ? '' : 's'} with questions ${
        untimed.length === 1 ? 'has' : 'have'
      } no time limit.`,
    });
  }

  const mismatched = list.filter((m) => m?.questions?.some((q) => q.subject !== m.section));
  if (mismatched.length) {
    issues.push({
      severity: 'warning',
      message: `${mismatched
        .map((m) => m?.title || 'Module')
        .join(', ')} contain${mismatched.length === 1 ? 's' : ''} questions from the other section.`,
    });
  }

  return issues;
}

/** True when a student can actually sit this test. */
export function isPlayable(test?: Pick<MockTest, 'modules'> | null): boolean {
  if (!test || !Array.isArray(test.modules)) return false;
  return !mockTestIssues(test.modules).some((i) => i.severity === 'blocking');
}

/** Questions eligible for a module: published, and matching the module's section. */
export function eligibleQuestions(questions: Question[], section: Subject): Question[] {
  return (questions || []).filter((q) => q.subject === section && (q.status || 'published') === 'published');
}

/**
 * Score a finished attempt. Lifted out of the store so the server owns the
 * number: a client that can post its own scoreSummary can post a 1600.
 * Unanswered questions simply never match, so they count as wrong.
 */
export function scoreAttempt(
  test: Pick<MockTest, 'modules'>,
  interactions: MockTestAttempt['interactions'],
): NonNullable<MockTestAttempt['scoreSummary']> {
  let mathCorrect = 0;
  let mathTotal = 0;
  let rwCorrect = 0;
  let rwTotal = 0;
  let totalCorrect = 0;
  let totalQuestions = 0;
  let timeSpentSeconds = 0;
  const domainBreakdown: Record<string, { correct: number; total: number }> = {};
  const modules = Array.isArray(test?.modules) ? test.modules : [];

  for (const mod of modules) {
    for (const q of (mod?.questions || [])) {
      totalQuestions += 1;
      domainBreakdown[q.domain] ??= { correct: 0, total: 0 };
      domainBreakdown[q.domain].total += 1;
      if (mod.section === 'math') mathTotal += 1;
      if (mod.section === 'reading_writing') rwTotal += 1;

      const interaction = interactions?.[q.id];
      if (!interaction) continue;
      timeSpentSeconds += interaction.timeSpentSeconds || 0;
      const spr = isSprQuestion(q);
      const correct = spr
        ? isSprAnswerCorrect(q, interaction.enteredAnswer ?? (interaction.selectedAnswer as string | null | undefined))
        : interaction.selectedAnswer === (q.correct_answer as string);
      if (!correct) continue;

      totalCorrect += 1;
      domainBreakdown[q.domain].correct += 1;
      if (mod.section === 'math') mathCorrect += 1;
      if (mod.section === 'reading_writing') rwCorrect += 1;
    }
  }

  const { mathScore, rwScore, totalScore } = estimateSATScore(
    mathCorrect,
    mathTotal,
    rwCorrect,
    rwTotal,
  );

  return {
    totalCorrect,
    totalQuestions,
    accuracyPercent: Math.round((totalCorrect / Math.max(1, totalQuestions)) * 100),
    mathScoreEstimated: mathScore,
    rwScoreEstimated: rwScore,
    totalScoreEstimated: totalScore,
    mathCorrect,
    mathTotal,
    rwCorrect,
    rwTotal,
    timeSpentSeconds,
    domainBreakdown,
  };
}
