'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { CourseVisualEditor } from '../../../features/admin/components/CourseVisualEditor';

export default function EditCoursePage() {
  const store = useAppStore();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const existingCourse = store.courses.find((c) => c.id === courseId) || null;

  const handleSave = (courseData: any) => {
    if (existingCourse) {
      store.updateCourse(existingCourse.id, courseData);
    } else {
      store.addCourse(courseData);
    }
    router.push('/admin');
  };

  return <CourseVisualEditor initialCourse={existingCourse} onSave={handleSave} />;
}
