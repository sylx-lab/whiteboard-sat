import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentSubmission,
  UserProfile,
  Question,
  Course,
  Lesson,
  ResourceItem,
  MockTest,
  ProductPlan,
} from '../../types';
import { Shield } from 'lucide-react';
import { AdminSidebar, AdminSubPage } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { StudentDetailModal } from './components/StudentDetailModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { MockTestEditorModal } from './components/MockTestEditorModal';

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
  plans: ProductPlan[];
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
  onAddQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onAddCourse: (course: Partial<Course> & { title: string }) => Course;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onAddLessonToCourse: (courseId: string, lesson: Omit<Lesson, 'id' | 'courseId'>) => Lesson;
  onUpdateLessonInCourse: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onDeleteLessonFromCourse: (courseId: string, lessonId: string) => void;
  onAddResource: (resource: Partial<ResourceItem> & { title: string }) => ResourceItem;
  onUpdateResource: (id: string, updates: Partial<ResourceItem>) => void;
  onDeleteResource: (id: string) => void;
  onAddMockTest: (test: Partial<MockTest> & { title: string }) => MockTest;
  onUpdateMockTest: (id: string, updates: Partial<MockTest>) => void;
  onDeleteMockTest: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  payments,
  users,
  questions,
  courses,
  resources,
  mockTests,
  plans: _plans,
  onVerifyPayment,
  onRejectPayment,
  onUpdateUserAccess,
  onToggleUserStatus,
  onAddQuestion,
  onDeleteQuestion,
  onDeleteCourse,
  onDeleteResource,
  onAddMockTest,
  onUpdateMockTest,
  onDeleteMockTest,
}) => {
  const router = useRouter();

  // Page Navigation State
  const [activeSubPage, setActiveSubPage] = useState<AdminSubPage>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Inspector & Modal States
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [inspectingPayment, setInspectingPayment] = useState<PaymentSubmission | null>(null);

  // Mock Test Modal
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [editingMockTest, setEditingMockTest] = useState<MockTest | null>(null);

  // Security Gate
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Supervisor Access Only</h2>
        <p className="text-xs text-slate-500">
          You are signed in as a student profile. Switch to the Demo Admin account in the top-right menu to access the CMS Console.
        </p>
      </div>
    );
  }

  // Summary Computations
  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const totalVerifiedRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Quick Action Button Handler based on active subpage
  const getQuickActionProps = () => {
    switch (activeSubPage) {
      case 'questions':
        return {
          label: 'Add Question Page',
          handler: () => {
            router.push('/admin/questions/new');
          },
        };
      case 'courses':
        return {
          label: 'Add Course Page',
          handler: () => {
            router.push('/admin/courses/new');
          },
        };
      case 'resources':
        return {
          label: 'Add Resource Page',
          handler: () => {
            router.push('/admin/resources/new');
          },
        };
      case 'mock-tests':
        return {
          label: 'Add Mock Test',
          handler: () => {
            setEditingMockTest(null);
            setIsMockModalOpen(true);
          },
        };
      default:
        return { label: undefined, handler: undefined };
    }
  };

  const quickProps = getQuickActionProps();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Modular Sidebar */}
        <AdminSidebar
          activeSubPage={activeSubPage}
          onSelectSubPage={(page) => setActiveSubPage(page)}
          pendingPaymentsCount={pendingPaymentsCount}
          totalUsersCount={users.length}
          totalQuestionsCount={questions.length}
          totalCoursesCount={courses.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          {/* Header */}
          <AdminHeader
            activeSubPage={activeSubPage}
            totalRevenue={totalVerifiedRevenue}
            quickActionLabel={quickProps.label}
            onQuickAction={quickProps.handler}
          />

          {/* Dynamic Page Views */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
            {activeSubPage === 'overview' && (
              <OverviewView
                payments={payments}
                users={users}
                courses={courses}
                resources={resources}
                mockTests={mockTests}
                questions={questions}
                onNavigateSubPage={(page) => setActiveSubPage(page)}
              />
            )}

            {activeSubPage === 'payments' && (
              <PaymentsView
                payments={payments}
                onVerifyPayment={onVerifyPayment}
                onRejectPayment={onRejectPayment}
                onInspectPayment={(p) => setInspectingPayment(p)}
              />
            )}

            {activeSubPage === 'candidates' && (
              <CandidatesView
                users={users}
                onInspectUser={(u) => setInspectingUser(u)}
                onUpdateUserAccess={onUpdateUserAccess}
                onToggleUserStatus={onToggleUserStatus}
              />
            )}

            {activeSubPage === 'courses' && (
              <CoursesView
                courses={courses}
                onDeleteCourse={onDeleteCourse}
              />
            )}

            {activeSubPage === 'resources' && (
              <ResourcesView
                resources={resources}
                onDeleteResource={onDeleteResource}
              />
            )}

            {activeSubPage === 'mock-tests' && (
              <MockTestsView
                mockTests={mockTests}
                onOpenAddMock={() => {
                  setEditingMockTest(null);
                  setIsMockModalOpen(true);
                }}
                onOpenEditMock={(m) => {
                  setEditingMockTest(m);
                  setIsMockModalOpen(true);
                }}
                onDeleteMock={onDeleteMockTest}
              />
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
      </div>

      {/* --- MODAL INSPECTORS & EDITORS --- */}
      <StudentDetailModal
        user={inspectingUser}
        onClose={() => setInspectingUser(null)}
        onUpdateUserAccess={onUpdateUserAccess}
        onToggleUserStatus={onToggleUserStatus}
      />

      <PaymentReceiptModal
        payment={inspectingPayment}
        onClose={() => setInspectingPayment(null)}
        onVerify={onVerifyPayment}
        onReject={onRejectPayment}
      />

      <MockTestEditorModal
        mockTest={editingMockTest}
        isOpen={isMockModalOpen}
        onClose={() => setIsMockModalOpen(false)}
        onSave={(data) => {
          if (editingMockTest) {
            onUpdateMockTest(editingMockTest.id, data);
          } else {
            onAddMockTest(data);
          }
        }}
      />
    </div>
  );
};
