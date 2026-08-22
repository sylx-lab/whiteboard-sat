import React, { useState } from 'react';
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
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { CourseEditorModal } from './components/CourseEditorModal';
import { ResourceEditorModal } from './components/ResourceEditorModal';
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
  onUpdateQuestion,
  onDeleteQuestion,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddLessonToCourse,
  onUpdateLessonInCourse,
  onDeleteLessonFromCourse,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onAddMockTest,
  onUpdateMockTest,
  onDeleteMockTest,
}) => {
  // Page Navigation State
  const [activeSubPage, setActiveSubPage] = useState<AdminSubPage>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Inspector & Modal States
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [inspectingPayment, setInspectingPayment] = useState<PaymentSubmission | null>(null);

  // Editor Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);

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
          label: 'Add Question',
          handler: () => {
            setEditingQuestion(null);
            setIsQuestionModalOpen(true);
          },
        };
      case 'courses':
        return {
          label: 'Add Course',
          handler: () => {
            setEditingCourse(null);
            setIsCourseModalOpen(true);
          },
        };
      case 'resources':
        return {
          label: 'Add Resource',
          handler: () => {
            setEditingResource(null);
            setIsResourceModalOpen(true);
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
                onOpenAddCourse={() => {
                  setEditingCourse(null);
                  setIsCourseModalOpen(true);
                }}
                onOpenEditCourse={(c) => {
                  setEditingCourse(c);
                  setIsCourseModalOpen(true);
                }}
                onDeleteCourse={onDeleteCourse}
              />
            )}

            {activeSubPage === 'resources' && (
              <ResourcesView
                resources={resources}
                onOpenAddResource={() => {
                  setEditingResource(null);
                  setIsResourceModalOpen(true);
                }}
                onOpenEditResource={(r) => {
                  setEditingResource(r);
                  setIsResourceModalOpen(true);
                }}
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
                onOpenAddQuestion={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                onOpenEditQuestion={(q) => {
                  setEditingQuestion(q);
                  setIsQuestionModalOpen(true);
                }}
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

      <QuestionEditorModal
        question={editingQuestion}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSave={(data) => {
          if (editingQuestion) {
            onUpdateQuestion(editingQuestion.id, data);
          } else {
            onAddQuestion(data);
          }
          setIsQuestionModalOpen(false);
        }}
      />

      <CourseEditorModal
        course={editingCourse}
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSaveCourse={(data) => {
          if (editingCourse) {
            onUpdateCourse(editingCourse.id, data);
          } else {
            onAddCourse(data);
          }
        }}
        onAddLesson={onAddLessonToCourse}
        onUpdateLesson={onUpdateLessonInCourse}
        onDeleteLesson={onDeleteLessonFromCourse}
      />

      <ResourceEditorModal
        resource={editingResource}
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSave={(data) => {
          if (editingResource) {
            onUpdateResource(editingResource.id, data);
          } else {
            onAddResource(data);
          }
        }}
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
