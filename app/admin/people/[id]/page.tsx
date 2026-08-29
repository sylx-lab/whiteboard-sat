'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { PersonAccessEditor } from '../../../features/admin/components/PersonAccessEditor';
import { EditorNotFound } from '../../../features/admin/components/EditorShell';

function PersonEditor() {
  const store = useAppStore();
  const params = useParams();
  const search = useSearchParams();
  const personId = params?.id as string;

  const person = store.allUsers.find((u) => u.id === personId);
  if (!person) return <EditorNotFound label="Account" backTab="candidates" />;

  // Reached from either the Students list or the Team list; go back where we came from.
  const backTab = search.get('from') === 'staff' ? 'staff' : 'candidates';

  return (
    <PersonAccessEditor
      person={person}
      courses={store.courses}
      mockTests={store.mockTests}
      payments={store.payments}
      actingUser={store.currentUser}
      onUpdateAccess={store.updateUserAccess}
      onToggleCourse={store.toggleCourseEnrollment}
      onToggleMockTest={store.toggleMockTestAccess}
      onSetRole={store.setUserRole}
      onSetPermissions={store.setUserPermissions}
      onToggleStatus={store.toggleUserStatus}
      backTab={backTab}
    />
  );
}

export default function PersonPage() {
  return (
    <Suspense fallback={null}>
      <PersonEditor />
    </Suspense>
  );
}
