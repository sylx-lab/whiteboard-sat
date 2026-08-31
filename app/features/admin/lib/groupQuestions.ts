import type { Question, Subject, Domain } from '../../../types';
import {
  ALL_DOMAINS,
  formatDomainName,
  formatSubjectName,
  getDomainSubject,
} from '../../../lib/utils.ts';
import { compareQuestionCodes } from '../../../lib/questionSort.ts';

export type GroupBy = 'domain' | 'topic';

export interface QuestionGroup {
  /** Stable identity for selection state. */
  key: string;
  label: string;
  questions: Question[];
  /** Questions still in draft — surfaced on the group header so gaps are visible. */
  draftCount: number;
  /** Distribution shown on the category card, so coverage is visible at a glance. */
  difficultyMix: { easy: number; medium: number; hard: number };
  /** Distinct topics inside this group, for the card's preview line. */
  topics: string[];
}

export interface SubjectSection {
  subject: Subject;
  label: string;
  total: number;
  groups: QuestionGroup[];
}

const DOMAIN_ORDER = new Map<Domain, number>(ALL_DOMAINS.map((d, i) => [d, i]));

/** Bucket for questions saved without a topic. Not a real category to seed from. */
export const UNCATEGORISED = 'Uncategorised';

/**
 * Split questions into Subject → category sections for the admin bank.
 *
 * Domains sort into College Board order rather than alphabetically, because that
 * is the order authors and score reports use. Topics are free text, so those sort
 * alphabetically. Empty categories are omitted — a bank view should show what
 * exists, and `missingDomains` reports the gaps separately.
 */
export function groupQuestions(
  questions: Question[],
  groupBy: GroupBy,
  /**
   * Include every SAT domain, even ones with no questions. The category overview
   * needs those so an author can add the first question straight into a gap.
   */
  options: { includeEmptyDomains?: boolean } = {}
): SubjectSection[] {
  const bySubject = new Map<Subject, Question[]>();
  for (const q of questions) {
    // Trust the domain over the stored subject: imported rows can disagree, and the
    // domain is what the student-facing score breakdown is keyed on.
    const subject = getDomainSubject(q.domain);
    const bucket = bySubject.get(subject);
    if (bucket) bucket.push(q);
    else bySubject.set(subject, [q]);
  }

  const sections: SubjectSection[] = [];

  const withEmpty = Boolean(options.includeEmptyDomains) && groupBy === 'domain';

  for (const subject of ['math', 'reading_writing'] as Subject[]) {
    const subjectQuestions = bySubject.get(subject) ?? [];
    if (!subjectQuestions.length && !withEmpty) continue;

    const byGroup = new Map<string, Question[]>();
    if (withEmpty) {
      // Seed every domain so empty ones still produce a card.
      for (const domain of ALL_DOMAINS) {
        if (getDomainSubject(domain) === subject) byGroup.set(domain, []);
      }
    }
    for (const q of subjectQuestions) {
      const key = groupBy === 'domain' ? q.domain : q.topic.trim() || UNCATEGORISED;
      const bucket = byGroup.get(key);
      if (bucket) bucket.push(q);
      else byGroup.set(key, [q]);
    }

    const groups: QuestionGroup[] = [...byGroup.entries()]
      .map(([key, groupQuestionList]) => ({
        key,
        label: groupBy === 'domain' ? formatDomainName(key as Domain) : key,
        questions: [...groupQuestionList].sort((a, b) => compareQuestionCodes(a.code, b.code)),
        draftCount: groupQuestionList.filter((q) => q.status === 'draft').length,
        difficultyMix: {
          easy: groupQuestionList.filter((q) => q.difficulty === 'easy').length,
          medium: groupQuestionList.filter((q) => q.difficulty === 'medium').length,
          hard: groupQuestionList.filter((q) => q.difficulty === 'hard').length,
        },
        topics:
          groupBy === 'domain'
            ? [...new Set(groupQuestionList.map((q) => q.topic.trim()).filter(Boolean))].sort((a, b) =>
                a.localeCompare(b)
              )
            : [],
      }))
      .sort((a, b) =>
        groupBy === 'domain'
          ? (DOMAIN_ORDER.get(a.key as Domain) ?? 99) - (DOMAIN_ORDER.get(b.key as Domain) ?? 99)
          : a.label.localeCompare(b.label)
      );

    sections.push({
      subject,
      label: formatSubjectName(subject),
      total: subjectQuestions.length,
      groups,
    });
  }

  return sections;
}

/** Domains with no questions at all — a coverage gap worth showing the author. */
export function missingDomains(questions: Question[]): Domain[] {
  const covered = new Set(questions.map((q) => q.domain));
  return ALL_DOMAINS.filter((d) => !covered.has(d));
}
