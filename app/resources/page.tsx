'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { CoursesHub } from '../features/courses/CoursesHub';

export default function ResourcesPage() {
  const store = useAppStore();
  const router = useRouter();

  if (store.isLoading) {
    return <div className="max-w-[1240px] mx-auto px-4 py-10 animate-pulse"><div className="h-32 bg-[var(--surface-soft)] rounded-xl" /></div>;
  }
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
