'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '../../../types';
import { useAppStore } from '../../../services/store';
import { QuestionVisualEditor } from '../../../features/admin/components/QuestionVisualEditor';

type QuestionDraft = Omit<Question, 'id' | 'created_at' | 'updated_at'>;

export default function NewQuestionPage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <QuestionVisualEditor
      allQuestions={store.questions}
      onSave={(data) => {
        store.addQuestion(data as unknown as QuestionDraft);
        router.push('/admin?tab=questions');
      }}
      // Stay on the page so a run of questions can be entered without round-tripping.
      onSaveAndNew={(data) => store.addQuestion(data as unknown as QuestionDraft)}
    />
  );
}
