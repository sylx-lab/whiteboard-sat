'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, MailWarning } from 'lucide-react';
import { useAppStore } from '../services/store';
import { StudentDashboard } from '../features/dashboard/StudentDashboard';
import type { UserProfile } from '../types';

/**
 * Feedback for the email-verification flow: the outcome of clicking the link
 * (?verified=1 / expired), and otherwise a standing nudge while the address on
 * the account is unconfirmed.
 */
function EmailVerificationNotice({
  user,
  onResend,
}: {
  user: UserProfile;
  onResend: () => Promise<void>;
}) {
  const outcome = useSearchParams().get('verified');
  const [resent, setResent] = useState(false);

  if (outcome === '1') {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F1F8F7] border border-[#E2E8F0] text-[12px] text-[#071126]">
          <CheckCircle2 className="w-4 h-4 text-[#0D918A] shrink-0" />
          Your email address is confirmed.
        </div>
      </div>
    );
  }

  if (user.emailVerifiedAt || !user.email) return null;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
        <MailWarning className="w-4 h-4 shrink-0" />
        <span className="min-w-0">
          {outcome === 'expired'
            ? 'That confirmation link has expired.'
            : `Confirm ${user.email} so we can send score reports and recovery links.`}
        </span>
        <button
          onClick={async () => {
            await onResend();
            setResent(true);
          }}
          disabled={resent}
          className="ml-auto font-semibold underline disabled:no-underline disabled:opacity-70 cursor-pointer"
        >
          {resent ? 'Sent — check your inbox' : 'Resend the email'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const store = useAppStore();
  const router = useRouter();

  if (!store.currentUser) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Sign in to see your dashboard</h2>
        <p className="text-xs text-slate-500">
          Your practice history, mock test scores and course progress live on your account. Sign in
          from the top of any page to pick up where you left off.
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
    <>
      <Suspense>
        <EmailVerificationNotice
          user={store.currentUser}
          onResend={store.resendVerificationEmail}
        />
      </Suspense>
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
    </>
  );
}
