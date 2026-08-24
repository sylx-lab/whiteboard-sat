'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Course } from '../../../types';
import { useAppStore } from '../../../services/store';
import { CourseVisualEditor } from '../../../features/admin/components/CourseVisualEditor';
import { EditorNotFound } from '../../../features/admin/components/EditorShell';

export default function EditCoursePage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const course = store.courses.find((c) => c.id === courseId);

  if (!course) return <EditorNotFound label="Course" backTab="courses" />;

  return (
    <CourseVisualEditor
      initialCourse={course}
      onSave={(data) => {
        store.updateCourse(course.id, data as unknown as Partial<Course>);
        router.push('/admin?tab=courses');
      }}
    />
  );
}
