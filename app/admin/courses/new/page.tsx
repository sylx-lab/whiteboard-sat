'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../../types';
import { useAppStore } from '../../../services/store';
import { CourseVisualEditor } from '../../../features/admin/components/CourseVisualEditor';

export default function NewCoursePage() {
  const store = useAppStore();
  const router = useRouter();

  return (
    <CourseVisualEditor
      onSave={(data) => {
        store.addCourse(data as unknown as Partial<Course> & { title: string });
        router.push('/admin?tab=courses');
      }}
    />
  );
}
