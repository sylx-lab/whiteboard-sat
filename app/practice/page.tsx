'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { PracticeHub } from '../features/practice/PracticeHub';
import { AuthModal } from '../components/AuthModal';

export default function PracticePage() {
  const store = useAppStore();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (store.isLoading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-8 w-48 bg-[var(--surface-soft)] rounded mb-6" />
        <div className="h-32 bg-[var(--surface-soft)] rounded-xl" />
      </div>
    );
  }
  return (
    <>
      <PracticeHub
        questions={store.questions}
        currentUser={store.currentUser}
        hasAccessToQuestion={store.hasAccessToQuestion}
        onLogAttempt={store.logPracticeAttempt}
        onToggleBookmark={store.toggleBookmark}
        onOpenPricing={() => router.push('/pricing')}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={store.loginWithPhoneOrEmail}
        onRegister={store.registerUser}
        onForgotPassword={store.requestPasswordReset}
      />
    </>
  );
}
