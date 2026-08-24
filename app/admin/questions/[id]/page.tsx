'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '../../../types';
import { useAppStore } from '../../../services/store';
import { QuestionVisualEditor } from '../../../features/admin/components/QuestionVisualEditor';
import { EditorNotFound } from '../../../features/admin/components/EditorShell';

export default function EditQuestionPage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const questionId = params?.id as string;

  const question = store.questions.find((q) => q.id === questionId);

  if (!question) return <EditorNotFound label="Question" backTab="questions" />;

  return (
    <QuestionVisualEditor
      initialQuestion={question}
      allQuestions={store.questions}
      onSave={(data) => {
        store.updateQuestion(question.id, data as unknown as Partial<Question>);
        router.push('/admin?tab=questions');
      }}
    />
  );
}
