'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { MockTestsHub } from '../features/mocktests/MockTestsHub';

export default function MockTestsPage() {
  const store = useAppStore();
  const router = useRouter();

  if (store.isLoading) {
    return <div className="max-w-[1240px] mx-auto px-4 py-10 animate-pulse"><div className="h-32 bg-[var(--surface-soft)] rounded-xl" /></div>;
  }
  return (
    <MockTestsHub
      mockTests={store.mockTests}
      mockAttempts={store.mockTestAttempts}
      currentUser={store.currentUser}
      hasAccessToMockTest={store.hasAccessToMockTest}
      onSaveAttempt={store.saveMockTestAttempt}
      onFinalizeTest={store.finalizeMockTestAttempt}
      onOpenPricing={() => router.push('/pricing')}
    />
  );
}
