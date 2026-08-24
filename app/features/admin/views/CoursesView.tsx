'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../../types';
import { Edit3, Trash2, BookOpen, SearchX, Video } from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  ResultCount,
  EmptyState,
  Pill,
  Button,
  IconAction,
} from '../components/ui';

interface CoursesViewProps {
  courses: Course[];
  onDeleteCourse: (courseId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ courses, onDeleteCourse }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = courses.filter(
    (c) => !search.trim() || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminCard>
      <Toolbar>
        <SearchInput
          label="Search courses"
          value={search}
          onChange={setSearch}
          placeholder="Course title…"
        />
        <div className="lg:ml-auto">
          <ResultCount shown={filtered.length} total={courses.length} noun="courses" />
        </div>
      </Toolbar>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course, then add video lessons to it in the course editor."
          action={{ label: 'New course', onClick: () => router.push('/admin/courses/new') }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching courses"
          description={`No course title contains “${search}”.`}
          action={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <article
              key={course.id}
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D918A]/50 transition-colors flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="brand">{course.subject.replace('_', ' ')}</Pill>
                  <Pill tone={course.is_published ? 'success' : 'warning'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Pill>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconAction
                    icon={Edit3}
                    label={`Edit ${course.title}`}
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                  />
                  <IconAction
                    icon={Trash2}
                    tone="danger"
                    label={`Delete ${course.title}`}
                    onClick={() => {
                      if (confirm(`Delete “${course.title}” and its ${course.lessons.length} lessons?`)) {
                        onDeleteCourse(course.id);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-[#071126] leading-snug">{course.title}</h3>
                <p className="text-[13px] text-[#58708A] line-clamp-2 leading-relaxed">
                  {course.subtitle || course.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-[#58708A]">
                <span>{course.lessonsCount} lessons</span>
                <span aria-hidden="true">•</span>
                <span>{course.totalHours} hrs</span>
                <span aria-hidden="true">•</span>
                <span className="font-mono font-semibold text-[#071126] tabular-nums">৳{course.price}</span>
              </div>

              <Button
                icon={Video}
                onClick={() => router.push(`/admin/courses/${course.id}`)}
                className="w-full"
              >
                Edit course &amp; lessons
              </Button>
            </article>
          ))}
        </div>
      )}
    </AdminCard>
  );
};
