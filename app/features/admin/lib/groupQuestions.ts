import type { Question, Subject, Domain } from '../../../types';
import {
  ALL_DOMAINS,
  formatDomainName,
  formatSubjectName,
  getDomainSubject,
} from '../../../lib/utils.ts';

export type GroupBy = 'domain' | 'topic';

export interface QuestionGroup {
  /** Stable identity for expand/collapse state. */
  key: string;
  label: string;
  questions: Question[];
  /** Questions still in draft — surfaced on the group header so gaps are visible. */
  draftCount: number;
}

export interface SubjectSection {
  subject: Subject;
  label: string;
  total: number;
  groups: QuestionGroup[];
}

const DOMAIN_ORDER = new Map<Domain, number>(ALL_DOMAINS.map((d, i) => [d, i]));

/**
 * Split questions into Subject → category sections for the admin bank.
 *
 * Domains sort into College Board order rather than alphabetically, because that
 * is the order authors and score reports use. Topics are free text, so those sort
 * alphabetically. Empty categories are omitted — a bank view should show what
 * exists, and `missingDomains` reports the gaps separately.
 */
export function groupQuestions(questions: Question[], groupBy: GroupBy): SubjectSection[] {
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

  for (const subject of ['math', 'reading_writing'] as Subject[]) {
    const subjectQuestions = bySubject.get(subject);
    if (!subjectQuestions?.length) continue;

    const byGroup = new Map<string, Question[]>();
    for (const q of subjectQuestions) {
      const key = groupBy === 'domain' ? q.domain : q.topic.trim() || 'Uncategorised';
      const bucket = byGroup.get(key);
      if (bucket) bucket.push(q);
      else byGroup.set(key, [q]);
    }

    const groups: QuestionGroup[] = [...byGroup.entries()]
      .map(([key, groupQuestionList]) => ({
        key,
        label: groupBy === 'domain' ? formatDomainName(key as Domain) : key,
        questions: groupQuestionList,
        draftCount: groupQuestionList.filter((q) => q.status === 'draft').length,
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
