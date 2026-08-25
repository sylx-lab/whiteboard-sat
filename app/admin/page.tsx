'use client';

import React, { Suspense } from 'react';
import { useAppStore } from '../services/store';
import { AdminPanel } from '../features/admin/AdminPanel';

export default function AdminPage() {
  const store = useAppStore();

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
        onVerifyPayment={store.verifyPayment}
        onRejectPayment={store.rejectPayment}
        onUpdateUserAccess={store.updateUserAccess}
        onToggleUserStatus={store.toggleUserStatus}
        onAddQuestion={store.addQuestions}
        onDeleteQuestion={store.deleteQuestion}
        onDeleteCourse={store.deleteCourse}
        onDeleteResource={store.deleteResource}
        onDeleteMockTest={store.deleteMockTest}
        onApplyTopicUpdates={store.applyTopicUpdates}
      />
    </Suspense>
  );
}
