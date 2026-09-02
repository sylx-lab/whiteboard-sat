'use client';

import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { AdminSubPage } from './AdminSidebar';

/** Single source of truth for every admin page's title and purpose. */
export const SUB_PAGE_META: Record<AdminSubPage, { title: string; description: string }> = {
  overview: {
    title: 'Overview',
    description: 'Platform activity, the payment queue, and content counts at a glance.',
  },
  payments: {
    title: 'Payments',
    description: 'Verify bKash, Nagad, and bank transfer references to release student access.',
  },
  candidates: {
    title: 'Students',
    description: 'Review accounts, grant or revoke passes, and suspend access.',
  },
  staff: {
    title: 'Team',
    description: 'Add staff members and choose exactly what each of them can manage.',
  },
  topics: {
    title: 'Topics',
    description: 'Rename topics across the bank, merge duplicates, and tidy category drift.',
  },
  questions: {
    title: 'Question bank',
    description: 'Author and edit SAT questions with a live KaTeX preview.',
  },
  courses: {
    title: 'Courses',
    description: 'Manage the course catalog and the video lessons inside each course.',
  },
  'mock-tests': {
    title: 'Mock tests',
    description: 'Configure timed, module-based Digital SAT mock exams.',
  },
  resources: {
    title: 'Resources',
    description: 'Publish formula sheets, grammar guides, and strategy PDFs.',
  },
  feedback: {
    title: 'Feedback',
    description: 'Question issues students reported — review and fix, then mark resolved.',
  },
};

interface AdminHeaderProps {
  activeSubPage: AdminSubPage;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  onOpenMobileNav: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeSubPage,
  onQuickAction,
  quickActionLabel,
  onOpenMobileNav,
}) => {
  const meta = SUB_PAGE_META[activeSubPage];

  return (
    <header className="bg-[#0D918A] text-white px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto w-full flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
            className="p-2 -ml-1 rounded-[10px] bg-white/10 hover:bg-white/20 transition-colors cursor-pointer lg:hidden shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">{meta.title}</h1>
            <p className="text-[13px] text-teal-50/90 mt-0.5 leading-relaxed">{meta.description}</p>
          </div>
        </div>

        {onQuickAction && quickActionLabel && (
          <button
            onClick={onQuickAction}
            className="h-10 px-4 bg-white text-[#0D918A] hover:bg-teal-50 text-[12px] font-bold rounded-[10px] transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{quickActionLabel}</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>
    </header>
  );
};
