'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setIsSubmitting(false);
    if (res.ok) {
      // The endpoint signs us in with a fresh cookie, so land on the dashboard.
      router.push('/dashboard');
    } else {
      setError(data.error ?? 'Unable to reset the password.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--brand-soft)]">
          <span className="text-[11px] font-bold text-[var(--brand-text)] uppercase tracking-wider">
            Account recovery
          </span>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Choose a new password</h1>
          <p className="text-[12px] text-[var(--foreground-secondary)] mt-1">
            Setting a new password signs you out on every other device.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!token && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-800 font-medium">
              This link is missing its token. Request a new reset email.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[12px] text-rose-700 font-medium">
              {error}
            </div>
          )}

          {[
            { label: 'New password', value: password, set: setPassword, autoComplete: 'new-password' },
            { label: 'Confirm new password', value: confirm, set: setConfirm, autoComplete: 'new-password' },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                {field.label}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={field.autoComplete}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-10 pl-9 pr-3 border border-[var(--border)] rounded-[10px] text-[12px] focus:outline-none focus:border-[var(--brand)]"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full h-10 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] disabled:opacity-60 text-white font-medium text-[12px] rounded-[10px] transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary, same as app/admin/page.tsx.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
