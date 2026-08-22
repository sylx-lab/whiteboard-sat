'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { StudentDashboard } from '../features/dashboard/StudentDashboard';

export default function DashboardPage() {
  const store = useAppStore();
  const router = useRouter();

  if (!store.currentUser) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Student Sign In Required</h2>
        <p className="text-xs text-slate-500">
          Please log in to your candidate account or select Demo Student in the navigation bar to access your personal dashboard.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-[#0D918A] text-white font-bold rounded-xl text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <StudentDashboard
      currentUser={store.currentUser}
      courses={store.courses}
      practiceAttempts={store.practiceAttempts}
      totalQuestionsAttempted={store.totalQuestionsAttempted}
      totalCorrect={store.totalCorrect}
      overallAccuracy={store.overallAccuracy}
      totalTimeSpentMinutes={store.totalTimeSpentMinutes}
      domainStats={store.domainStats}
      onNavigate={(view) => {
        if (view === 'practice') router.push('/practice');
        else if (view === 'mock-tests') router.push('/mock-tests');
        else if (view === 'courses') router.push('/courses');
        else if (view === 'progress') router.push('/progress');
        else router.push('/');
      }}
      onOpenPricing={() => router.push('/pricing')}
    />
  );
}
