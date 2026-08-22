'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../../services/store';
import { CourseVisualEditor } from '../../../features/admin/components/CourseVisualEditor';

export default function NewCoursePage() {
  const store = useAppStore();
  const router = useRouter();

  const handleSave = (courseData: any) => {
    store.addCourse(courseData);
    router.push('/admin');
  };

  return <CourseVisualEditor initialCourse={null} onSave={handleSave} />;
}
