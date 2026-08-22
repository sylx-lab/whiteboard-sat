'use client';

import React from 'react';
import { useAppStore } from '../services/store';
import { AdminPanel } from '../features/admin/AdminPanel';

export default function AdminPage() {
  const store = useAppStore();

  return (
    <AdminPanel
      currentUser={store.currentUser}
      payments={store.payments}
      users={store.allUsers}
      questions={store.questions}
      courses={store.courses}
      resources={store.resources}
      mockTests={store.mockTests}
      plans={store.plans}
      onVerifyPayment={store.verifyPayment}
      onRejectPayment={store.rejectPayment}
      onUpdateUserAccess={store.updateUserAccess}
      onToggleUserStatus={store.toggleUserStatus}
      onAddQuestion={store.addQuestion}
      onUpdateQuestion={store.updateQuestion}
      onDeleteQuestion={store.deleteQuestion}
      onAddCourse={store.addCourse}
      onUpdateCourse={store.updateCourse}
      onDeleteCourse={store.deleteCourse}
      onAddLessonToCourse={store.addLessonToCourse}
      onUpdateLessonInCourse={store.updateLessonInCourse}
      onDeleteLessonFromCourse={store.deleteLessonFromCourse}
      onAddResource={store.addResource}
      onUpdateResource={store.updateResource}
      onDeleteResource={store.deleteResource}
      onAddMockTest={store.addMockTest}
      onUpdateMockTest={store.updateMockTest}
      onDeleteMockTest={store.deleteMockTest}
    />
  );
}
