'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { ProgressAnalytics } from '../features/analytics/ProgressAnalytics';

export default function ProgressPage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <ProgressAnalytics
      currentUser={store.currentUser}
      practiceAttempts={store.practiceAttempts}
      mockAttempts={store.mockTestAttempts}
      domainStats={store.domainStats}
      overallAccuracy={store.overallAccuracy}
      totalTimeSpentMinutes={store.totalTimeSpentMinutes}
      onNavigate={(view) => {
        if (view === 'practice') router.push('/practice');
        else if (view === 'mock-tests') router.push('/mock-tests');
        else router.push('/dashboard');
      }}
    />
  );
}
