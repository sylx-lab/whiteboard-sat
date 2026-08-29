import React from 'react';
import Link from 'next/link';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl p-6 sm:p-8 shadow-xl text-center flex flex-col items-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--brand-cta)]/10 border border-[var(--brand-cta)]/20 text-[var(--brand-text)] flex items-center justify-center shrink-0">
          <HelpCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            404 Error
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto leading-relaxed">
            The page you are looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--brand-cta)] hover:opacity-90 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/practice"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--border)] text-[var(--foreground)] font-medium text-sm border border-[var(--border)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Practice Questions
          </Link>
        </div>
      </div>
    </div>
  );
}
