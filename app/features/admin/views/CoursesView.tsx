import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '../../../types';
import { Search, Plus, Edit3, Trash2, Video } from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  onOpenAddCourse?: () => void;
  onOpenEditCourse?: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  onDeleteCourse,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = courses.filter(
    (c) => !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            Course Catalog & Video Lesson CMS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Create new master courses, edit curriculum details, and manage video lessons with free preview controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course title..."
              className="pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
            />
          </div>

          <button
            onClick={() => router.push('/admin/courses/new')}
            className="px-4 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course (Visual Page)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-bold text-[10px] rounded-full uppercase">
                  {course.subject}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                    className="p-1.5 text-slate-500 hover:text-[#0D918A] rounded-lg hover:bg-white cursor-pointer"
                    title="Edit course in Visual Editor page"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete course "${course.title}"?`)) {
                        onDeleteCourse(course.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">
                {course.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {course.subtitle || course.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                <span>{course.lessonsCount} Video Lessons</span>
                <span>•</span>
                <span>{course.totalHours} Total Hours</span>
              </div>

              <div className="pt-2 flex items-baseline gap-2 font-mono">
                <span className="text-xl font-black text-slate-900">৳{course.price}</span>
                <span className="text-xs text-slate-400 line-through">৳{course.originalPrice}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => router.push(`/admin/courses/${course.id}`)}
                className="px-3.5 py-2 bg-[#0D918A] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#087C76] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Visual Editor ({course.lessons.length} Lessons)</span>
              </button>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${course.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
