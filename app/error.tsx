'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error('App Route Error caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-lg w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl p-6 sm:p-8 shadow-xl text-center flex flex-col items-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto leading-relaxed">
            We ran into an unexpected error while rendering this page. You can try reloading or returning home.
          </p>
          {error?.message && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--navy-section)]/40 border border-[var(--border)] text-[12px] font-mono text-[var(--foreground-secondary)] text-left overflow-x-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--brand-cta)] hover:opacity-90 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--border)] text-[var(--foreground)] font-medium text-sm border border-[var(--border)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--border)] text-[var(--foreground)] font-medium text-sm border border-[var(--border)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
