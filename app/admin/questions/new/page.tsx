'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { QuestionVisualEditor } from '../../../features/admin/components/QuestionVisualEditor';

export default function NewQuestionPage() {
  const store = useAppStore();
  const router = useRouter();

  const handleSave = (questionData: any) => {
    store.addQuestion(questionData);
    router.push('/admin');
  };

  return <QuestionVisualEditor initialQuestion={null} onSave={handleSave} />;
}
