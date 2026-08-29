'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MockTest } from '../../../types';
import { useAppStore } from '../../../services/store';
import { MockTestVisualEditor } from '../../../features/admin/components/MockTestVisualEditor';

export default function NewMockTestPage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <MockTestVisualEditor
      allQuestions={store.questions}
      allCourses={store.courses}
      onCreateQuestion={store.addQuestion}
      onSave={(data) => {
        store.addMockTest(data as unknown as Partial<MockTest> & { title: string });
        router.push('/admin?tab=mock-tests');
      }}
    />
  );
}
