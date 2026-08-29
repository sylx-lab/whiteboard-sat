'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../../types';
import { Edit3, Trash2, BookOpen, SearchX, Video, Calculator, Languages, Image as ImageIcon } from 'lucide-react';
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
          {filtered.map((course) => {
            const thumb = course.thumbnailUrl || (course as { posterUrl?: string }).posterUrl;
            const mathCount = (course.lessons || []).filter((l) => (l.subject as string) !== 'reading_writing').length;
            const engCount = (course.lessons || []).filter((l) => (l.subject as string) === 'reading_writing').length;
            return (
            <article
              key={course.id}
              className="rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D918A]/50 transition-colors flex flex-col overflow-hidden"
            >
              {/* Thumbnail */}
              {thumb ? (
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#F8FBFB] shrink-0 border-b border-[#E2E8F0]">
                  <img src={thumb} alt={`${course.title} thumbnail`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-[16/9] bg-[#F8FBFB] border-b border-[#E2E8F0] grid place-items-center text-[#58708A]">
                  <div className="text-center space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto opacity-40" />
                    <span className="text-[11px]">No poster</span>
                  </div>
                </div>
              )}

              <div className="p-5 flex flex-col gap-4 flex-1">
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

                <div className="flex items-center gap-3 text-[12px] text-[#58708A] flex-wrap">
                  <span className="inline-flex items-center gap-1"><Calculator className="w-3 h-3" /> {mathCount} Math</span>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1"><Languages className="w-3 h-3" /> {engCount} English</span>
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
              </div>
            </article>
          );})}
        </div>
      )}
    </AdminCard>
  );
};
