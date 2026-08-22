'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { QuestionVisualEditor } from '../../../features/admin/components/QuestionVisualEditor';

export default function EditQuestionPage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const qId = params?.id as string;

  const existingQuestion = store.questions.find((q) => q.id === qId) || null;

  const handleSave = (questionData: any) => {
    if (existingQuestion) {
      store.updateQuestion(existingQuestion.id, questionData);
    } else {
      store.addQuestion(questionData);
    }
    router.push('/admin');
  };

  return <QuestionVisualEditor initialQuestion={existingQuestion} onSave={handleSave} />;
}
