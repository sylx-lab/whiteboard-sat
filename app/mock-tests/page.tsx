'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { MockTestsHub } from '../features/mocktests/MockTestsHub';

export default function MockTestsPage() {
  const store = useAppStore();
  const router = useRouter();

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
