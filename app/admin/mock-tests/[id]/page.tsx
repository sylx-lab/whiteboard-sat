'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MockTest } from '../../../types';
import { useAppStore } from '../../../services/store';
import { MockTestVisualEditor } from '../../../features/admin/components/MockTestVisualEditor';
import { EditorNotFound, EditorLoading } from '../../../features/admin/components/EditorShell';

export default function EditMockTestPage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const testId = params?.id as string;

  const test = store.mockTests.find((t) => t.id === testId);

  // The list holds summaries; the editor needs the questions, so fetch the whole test first.
  const needsFull = !!test?.isSummary;
  const { loadMockTest } = store;
  useEffect(() => {
    if (needsFull) loadMockTest(testId).catch(() => {});
  }, [needsFull, testId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (needsFull) return <EditorLoading label="Loading Mock Test…" />;

  if (!test) {
    if (store.isLoading && store.mockTests.length === 0) {
      return <EditorLoading label="Loading Mock Test…" />;
    }
    return <EditorNotFound label="Mock test" backTab="mock-tests" />;
  }

  return (
    <MockTestVisualEditor
      initialTest={test}
      allQuestions={store.questions}
      allCourses={store.courses}
      onCreateQuestion={store.addQuestion}
      onSave={(data) => {
        store.updateMockTest(test.id, data as unknown as Partial<MockTest>);
        router.push('/admin?tab=mock-tests');
      }}
    />
  );
}
