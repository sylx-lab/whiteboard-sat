'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { AdminPanel } from '../features/admin/AdminPanel';

export default function AdminPage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    // AdminPanel reads the active tab from ?tab=, so it needs a Suspense boundary.
    <Suspense fallback={null}>
      <AdminPanel
        currentUser={store.currentUser}
        payments={store.payments}
        users={store.allUsers}
        questions={store.questions}
        courses={store.courses}
        resources={store.resources}
        mockTests={store.mockTests}
        questionFeedback={store.questionFeedback}
        paymentSettings={store.paymentSettings}
        plans={store.plans}
        onVerifyPayment={store.verifyPayment}
        onRejectPayment={store.rejectPayment}
        onResolveFeedback={store.resolveQuestionFeedback}
        onUpdatePaymentSettings={store.updatePaymentSettings}
        onUpdatePlan={store.updatePlan}
        onAddPlan={store.addPlan}
        onDeletePlan={store.deletePlan}
        onUpdateUserAccess={store.updateUserAccess}
        onToggleUserStatus={store.toggleUserStatus}
        onDeleteUser={store.deleteUser}
        onAddQuestion={store.addQuestions}
        onDeleteQuestion={store.deleteQuestion}
        onDeleteCourse={store.deleteCourse}
        onDeleteResource={store.deleteResource}
        onDeleteMockTest={store.deleteMockTest}
        onApplyTopicUpdates={store.applyTopicUpdates}
        onLogout={async () => {
          await store.logout();
          router.push('/');
        }}
      />
    </Suspense>
  );
}
