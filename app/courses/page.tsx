'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { CoursesHub } from '../features/courses/CoursesHub';

export default function CoursesPage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <CoursesHub
      courses={store.courses}
      currentUser={store.currentUser}
      hasAccessToCourse={store.hasAccessToCourse}
      courseProgress={store.courseProgress}
      onToggleLessonComplete={store.toggleLessonCompleted}
      onOpenPricing={() => router.push('/pricing')}
    />
  );
}
