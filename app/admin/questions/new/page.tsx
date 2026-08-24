'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question, Domain, Subject } from '../../../types';
import { useAppStore } from '../../../services/store';
import { getDomainSubject, ALL_DOMAINS } from '../../../lib/utils';
import { QuestionVisualEditor } from '../../../features/admin/components/QuestionVisualEditor';
import { QuestionFormState } from '../../../features/admin/components/questionForm';

type QuestionDraft = Omit<Question, 'id' | 'created_at' | 'updated_at'>;

function NewQuestionEditor() {
  const store = useAppStore();
  const router = useRouter();
  const params = useSearchParams();

  // ?domain= / ?topic= let the question bank's category cards open the editor with
  // the category already filled in.
  const domainParam = params.get('domain');
  const domain = ALL_DOMAINS.includes(domainParam as Domain) ? (domainParam as Domain) : undefined;
  const topic = params.get('topic') || undefined;

  const seed: Partial<QuestionFormState> | undefined = domain
    ? { domain, subject: getDomainSubject(domain) as Subject, ...(topic ? { topic } : {}) }
    : topic
    ? { topic }
    : undefined;

  // Returning to the category the author came from beats dumping them on the overview.
  const backTo = domain
    ? `/admin?tab=questions&category=${encodeURIComponent(domain)}`
    : '/admin?tab=questions';

  return (
    <QuestionVisualEditor
      allQuestions={store.questions}
      seed={seed}
      onSave={(data) => {
        store.addQuestion(data as unknown as QuestionDraft);
        router.push(backTo);
      }}
      // Stay on the page so a run of questions can be entered without round-tripping.
      onSaveAndNew={(data) => store.addQuestion(data as unknown as QuestionDraft)}
    />
  );
}

export default function NewQuestionPage() {
  return (
    <Suspense fallback={null}>
      <NewQuestionEditor />
    </Suspense>
  );
}
