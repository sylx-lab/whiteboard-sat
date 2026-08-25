'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { PracticeHub } from '../features/practice/PracticeHub';

export default function PracticePage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <PracticeHub
      questions={store.questions}
      currentUser={store.currentUser}
      hasAccessToQuestion={store.hasAccessToQuestion}
      onLogAttempt={store.logPracticeAttempt}
      onOpenPricing={() => router.push('/pricing')}
    />
  );
}
