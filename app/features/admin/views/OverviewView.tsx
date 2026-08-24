'use client';

import React from 'react';
import {
  CreditCard,
  Wallet,
  Users,
  Database,
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { PaymentSubmission, UserProfile, Course, ResourceItem, MockTest, Question } from '../../../types';
import { AdminSubPage } from '../components/AdminSidebar';
import { Pill } from '../components/ui';

interface OverviewViewProps {
  payments: PaymentSubmission[];
  users: UserProfile[];
  courses: Course[];
  resources: ResourceItem[];
  mockTests: MockTest[];
  questions: Question[];
  onNavigateSubPage: (page: AdminSubPage) => void;
}

const PREVIEW_LIMIT = 4;

const StatCard: React.FC<{
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  accent: string;
  onClick?: () => void;
}> = ({ label, value, caption, icon: Icon, accent, onClick }) => {
  const content = (
    <>
      <div className="space-y-1 min-w-0">
        <div className="text-[12px] text-[#58708A] font-medium">{label}</div>
        <div className="text-2xl font-bold text-[#071126] font-mono tabular-nums">{value}</div>
        <div className="text-[11px] text-[#58708A]">{caption}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
    </>
  );

  const base =
    'p-5 rounded-2xl bg-white border border-[#E2E8F0] flex items-start justify-between gap-3 text-left transition-colors';

  return onClick ? (
    <button onClick={onClick} className={`${base} hover:border-[#0D918A]/50 cursor-pointer w-full`}>
      {content}
    </button>
  ) : (
    <div className={base}>{content}</div>
  );
};

const ContentPanel: React.FC<{
  icon: LucideIcon;
  accent: string;
  title: string;
  subtitle: string;
  items: { id: string; primary: string; secondary: string; trailing: React.ReactNode }[];
  emptyLabel: string;
  onOpen: () => void;
  openLabel: string;
}> = ({ icon: Icon, accent, title, subtitle, items, emptyLabel, onOpen, openLabel }) => (
  <section className="p-5 rounded-2xl bg-white border border-[#E2E8F0] flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-[#071126] leading-tight">{title}</h2>
        <p className="text-[12px] text-[#58708A]">{subtitle}</p>
      </div>
    </div>

    <ul className="space-y-2 flex-1">
      {items.length === 0 ? (
        <li className="text-[13px] text-[#58708A] py-4 text-center">{emptyLabel}</li>
      ) : (
        items.slice(0, PREVIEW_LIMIT).map((item) => (
          <li key={item.id}>
            <button
              onClick={onOpen}
              className="w-full p-3 rounded-xl bg-[#F8FBFB] hover:bg-[#F1F8F7] border border-[#E2E8F0] transition-colors cursor-pointer flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#071126] truncate">{item.primary}</div>
                <div className="text-[11px] text-[#58708A] truncate">{item.secondary}</div>
              </div>
              <div className="shrink-0">{item.trailing}</div>
            </button>
          </li>
        ))
      )}
      {items.length > PREVIEW_LIMIT && (
        <li className="text-[12px] text-[#58708A] pl-3">
          +{items.length - PREVIEW_LIMIT} more
        </li>
      )}
    </ul>

    <button
      onClick={onOpen}
      className="h-10 w-full rounded-[10px] bg-white hover:bg-[#F1F8F7] border border-[#E2E8F0] text-[12px] font-semibold text-[#071126] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
    >
      {openLabel}
      <ArrowRight className="w-4 h-4" />
    </button>
  </section>
);

export const OverviewView: React.FC<OverviewViewProps> = ({
  payments,
  users,
  courses,
  resources,
  mockTests,
  questions,
  onNavigateSubPage,
}) => {
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalVerifiedRevenue = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Pending payments are the only thing in this console that is time-sensitive,
          so they get a banner rather than sitting inside the stat grid. */}
      {pendingPayments.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 grid place-items-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-amber-900">
                {pendingPayments.length} payment{pendingPayments.length === 1 ? '' : 's'} waiting for
                verification
              </div>
              <div className="text-[12px] text-amber-800/90">
                Students stay locked out of premium content until each transfer is verified.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateSubPage('payments')}
            className="h-10 px-4 bg-[#0D918A] hover:bg-[#087C76] text-white text-[12px] font-semibold rounded-[10px] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            Open queue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Verified revenue"
          value={`৳${totalVerifiedRevenue.toLocaleString()}`}
          caption="Approved transfers"
          icon={Wallet}
          accent="bg-emerald-50 text-emerald-600"
          onClick={() => onNavigateSubPage('payments')}
        />
        <StatCard
          label="Pending verification"
          value={String(pendingPayments.length)}
          caption="bKash / Nagad queue"
          icon={CreditCard}
          accent="bg-amber-50 text-amber-600"
          onClick={() => onNavigateSubPage('payments')}
        />
        <StatCard
          label="Students"
          value={String(users.length)}
          caption="Registered accounts"
          icon={Users}
          accent="bg-teal-50 text-[#0D918A]"
          onClick={() => onNavigateSubPage('candidates')}
        />
        <StatCard
          label="Questions"
          value={String(questions.length)}
          caption="In the question bank"
          icon={Database}
          accent="bg-indigo-50 text-indigo-600"
          onClick={() => onNavigateSubPage('questions')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ContentPanel
          icon={BookOpen}
          accent="bg-teal-50 text-[#0D918A]"
          title="Courses"
          subtitle={`${courses.length} in the catalog`}
          openLabel="Manage courses"
          emptyLabel="No courses yet."
          onOpen={() => onNavigateSubPage('courses')}
          items={courses.map((c) => ({
            id: c.id,
            primary: c.title,
            secondary: `${c.lessonsCount} lessons • ${c.totalHours} hrs`,
            trailing: (
              <span className="font-mono text-[13px] font-semibold text-[#087C76] tabular-nums">
                ৳{c.price}
              </span>
            ),
          }))}
        />

        <ContentPanel
          icon={Award}
          accent="bg-rose-50 text-rose-600"
          title="Mock tests"
          subtitle={`${mockTests.length} configured`}
          openLabel="Manage mock tests"
          emptyLabel="No mock tests yet."
          onOpen={() => onNavigateSubPage('mock-tests')}
          items={mockTests.map((m) => ({
            id: m.id,
            primary: m.title,
            secondary: `${m.totalQuestions} questions • ${m.totalTimeMinutes} min`,
            trailing: <Pill tone="danger">{m.difficulty}</Pill>,
          }))}
        />

        <ContentPanel
          icon={FileText}
          accent="bg-emerald-50 text-emerald-600"
          title="Resources"
          subtitle={`${resources.length} published`}
          openLabel="Manage resources"
          emptyLabel="No resources yet."
          onOpen={() => onNavigateSubPage('resources')}
          items={resources.map((r) => ({
            id: r.id,
            primary: r.title,
            secondary: `${r.readTime} • ${r.category.replace(/_/g, ' ')}`,
            trailing: <Pill tone={r.is_free ? 'neutral' : 'brand'}>{r.is_free ? 'Free' : 'Premium'}</Pill>,
          }))}
        />
      </div>
    </div>
  );
};
