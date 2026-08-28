'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PaymentSubmission,
  UserProfile,
  Question,
  Course,
  ResourceItem,
  MockTest,
  AdminPermission,
} from '../../types';
import { Shield } from 'lucide-react';
import { AdminSidebar, AdminSubPage, ADMIN_SUB_PAGES } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { canOpenAdmin, permissionsFor } from './lib/permissions';
import { listTopics } from './lib/topics';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';

import { StaffView } from './views/StaffView';
import { TopicsView } from './views/TopicsView';
import { OverviewView } from './views/OverviewView';
import { PaymentsView } from './views/PaymentsView';
import { CandidatesView } from './views/CandidatesView';
import { CoursesView } from './views/CoursesView';
import { ResourcesView } from './views/ResourcesView';
import { MockTestsView } from './views/MockTestsView';
import { QuestionBankView } from './views/QuestionBankView';

export interface AdminPanelProps {
  currentUser: UserProfile | null;
  payments: PaymentSubmission[];
  users: UserProfile[];
  questions: Question[];
  courses: Course[];
  resources: ResourceItem[];
  mockTests: MockTest[];
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
  /** The bank's JSON import adds straight from the list view. */
  onAddQuestion: (questions: Omit<Question, 'id' | 'created_at' | 'updated_at'>[]) => Promise<Question[]>;
  onDeleteQuestion: (id: string) => void;
  onDeleteCourse: (id: string) => void;
  onDeleteResource: (id: string) => void;
  onDeleteMockTest: (id: string) => void;
  /** Bulk topic rename/merge from the Topics view. */
  onApplyTopicUpdates: (updates: { questionId: string; topic: string }[]) => void;
  onLogout?: () => void;
}

/** Primary "create" action per page — kept next to the page title in the header. */
const QUICK_ACTIONS: Partial<Record<AdminSubPage, { label: string; href: string }>> = {
  questions: { label: 'New question', href: '/admin/questions/new' },
  courses: { label: 'New course', href: '/admin/courses/new' },
  resources: { label: 'New resource', href: '/admin/resources/new' },
  'mock-tests': { label: 'New mock test', href: '/admin/mock-tests/new' },
  staff: { label: 'New staff member', href: '/admin/staff/new' },
};

/**
 * Which permission each page needs. Overview is the landing page for anyone who can
 * open the console at all, so it has no gate of its own.
 */
const PAGE_PERMISSION: Record<AdminSubPage, keyof AdminPermission | null> = {
  overview: null,
  payments: 'canManagePurchases',
  candidates: 'canManageStudents',
  staff: 'canManageSubAdmins',
  questions: 'canManagePractice',
  topics: 'canManagePractice',
  courses: 'canManageCourses',
  'mock-tests': 'canManageMockTests',
  resources: 'canManageResources',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  payments,
  users,
  questions,
  courses,
  resources,
  mockTests,
  onVerifyPayment,
  onRejectPayment,
  onUpdateUserAccess,
  onToggleUserStatus,
  onAddQuestion,
  onDeleteQuestion,
  onDeleteCourse,
  onDeleteResource,
  onDeleteMockTest,
  onApplyTopicUpdates,
  onLogout,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The store hydrates from localStorage, so the first client render must wait
  // for hydration to avoid a server/client mismatch.
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // The active page lives in the URL so browser back/forward and deep links work,
  // and so the visual editors can return the author to the list they came from.
  const permissions = permissionsFor(currentUser);
  const allowedPages = ADMIN_SUB_PAGES.filter((page) => {
    const needed = PAGE_PERMISSION[page];
    return needed === null || permissions[needed];
  });

  const tabParam = searchParams.get('tab');
  const requestedPage = ADMIN_SUB_PAGES.includes(tabParam as AdminSubPage)
    ? (tabParam as AdminSubPage)
    : 'overview';
  // Deep-linking a page you may not manage lands on Overview rather than an error.
  const activeSubPage: AdminSubPage = allowedPages.includes(requestedPage)
    ? requestedPage
    : 'overview';

  const goToSubPage = (page: AdminSubPage) => {
    router.push(page === 'overview' ? '/admin' : `/admin?tab=${page}`, { scroll: false });
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [inspectingPayment, setInspectingPayment] = useState<PaymentSubmission | null>(null);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-[13px] text-[#58708A] animate-pulse">Loading admin console…</div>
      </div>
    );
  }

  if (!canOpenAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold text-[#071126]">No admin access</h1>
            <p className="text-[13px] text-[#58708A] leading-relaxed">
              {currentUser?.role === 'sub_admin'
                ? 'Your staff account has no areas granted yet. Ask a full admin to grant you permissions.'
                : 'You are signed in as a student. Switch to the admin account from the account menu in the student app to open the console.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const staffCount = users.filter((u) => u.role === 'admin' || u.role === 'sub_admin').length;
  const topicCount = listTopics(questions).length;
  const quickAction = QUICK_ACTIONS[activeSubPage];

  return (
    <div className="min-h-screen bg-slate-50 text-[#071126] flex">
      <AdminSidebar
        activeSubPage={activeSubPage}
        onSelectSubPage={goToSubPage}
        currentUser={currentUser}
        pendingPaymentsCount={pendingPaymentsCount}
        totalUsersCount={users.length}
        totalQuestionsCount={questions.length}
        totalCoursesCount={courses.length}
        totalResourcesCount={resources.length}
        totalMockTestsCount={mockTests.length}
        totalStaffCount={staffCount}
        totalTopicsCount={topicCount}
        allowedPages={allowedPages}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          activeSubPage={activeSubPage}
          quickActionLabel={quickAction?.label}
          onQuickAction={quickAction ? () => router.push(quickAction.href) : undefined}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeSubPage === 'overview' && (
            <OverviewView
              payments={payments}
              users={users}
              courses={courses}
              resources={resources}
              mockTests={mockTests}
              questions={questions}
              onNavigateSubPage={goToSubPage}
            />
          )}

          {activeSubPage === 'payments' && (
            <PaymentsView
              payments={payments}
              onVerifyPayment={onVerifyPayment}
              onRejectPayment={onRejectPayment}
              onInspectPayment={setInspectingPayment}
            />
          )}

          {activeSubPage === 'candidates' && (
            <CandidatesView
              users={users}
              onUpdateUserAccess={onUpdateUserAccess}
              onToggleUserStatus={onToggleUserStatus}
            />
          )}

          {activeSubPage === 'staff' && <StaffView users={users} currentUser={currentUser} />}

          {activeSubPage === 'topics' && (
            <TopicsView questions={questions} onApplyTopicUpdates={onApplyTopicUpdates} />
          )}

          {activeSubPage === 'courses' && <CoursesView courses={courses} onDeleteCourse={onDeleteCourse} />}

          {activeSubPage === 'resources' && (
            <ResourcesView resources={resources} onDeleteResource={onDeleteResource} />
          )}

          {activeSubPage === 'mock-tests' && (
            <MockTestsView mockTests={mockTests} onDeleteMock={onDeleteMockTest} />
          )}

          {activeSubPage === 'questions' && (
            <QuestionBankView
              questions={questions}
              onDeleteQuestion={onDeleteQuestion}
              onAddQuestion={onAddQuestion}
            />
          )}
        </main>
      </div>

      <PaymentReceiptModal
        payment={inspectingPayment}
        onClose={() => setInspectingPayment(null)}
        onVerify={onVerifyPayment}
        onReject={onRejectPayment}
      />

    </div>
  );
};
