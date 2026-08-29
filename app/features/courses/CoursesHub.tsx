import React, { useState } from 'react';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Check,
  Lock,
  Sparkles,
  Clock,
  FileText,
  Video,
  X,
} from 'lucide-react';
import { Course, Lesson, UserProfile } from '../../types';

interface CoursesHubProps {
  courses: Course[];
  currentUser: UserProfile | null;
  hasAccessToCourse: (courseId: string) => boolean;
  courseProgress: Record<string, string[]>;
  onToggleLessonComplete: (courseId: string, lessonId: string) => void;
  onOpenPricing: () => void;
}

export const CoursesHub: React.FC<CoursesHubProps> = ({
  courses,
  currentUser: _currentUser,
  hasAccessToCourse,
  courseProgress,
  onToggleLessonComplete,
  onOpenPricing,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course);
    if (course.lessons && course.lessons.length > 0) {
      setActiveLesson(course.lessons[0]);
    }
  };

  return (
    <div className="bg-(--surface) min-h-[calc(100vh-70px) py-16 px-4 sm:px-6 lg:px-8 space-y-14 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="max-w-310 mx-auto space-y-4">
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-(--brand-text) font-mono">
            VIDEO MASTERCLASSES
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold tracking-[-0.03em] text-(--foreground) leading-[1.12]">
            Digital SAT Courses
          </h1>
          <p className="text-[16px] sm:text-[17px] text-(--foreground-secondary) leading-[1.6] max-w-175">
            Structured lessons, proven strategies, and focused instruction for every major Digital SAT skill.
          </p>
        </div>

        {/* Small metadata row */}
        <div className="flex items-center gap-4 text-[12.5px] font-medium text-(--foreground-secondary) pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--brand)" />
            <span>{courses.length} Programs</span>
          </div>
          <span className="text-(--foreground-muted)">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--brand)" />
            <span>{courses.reduce((s, c) => s + (c.lessons?.length || c.lessonsCount || 0), 0)} Lessons</span>
          </div>
          <span className="text-(--foreground-muted)">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--brand)" />
            <span>Math + Reading & Writing</span>
          </div>
        </div>
      </div>

      {/* Courses Catalog Grid */}
      <div className="max-w-310 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {courses.map((course, index) => {
          const isEnrolled = hasAccessToCourse(course.id);
          const lessonsList = course.lessons || [];
          const completedLessonIds = courseProgress[course.id] || [];
          const progressPercent =
            lessonsList.length > 0
              ? Math.round((completedLessonIds.length / lessonsList.length) * 100)
              : 0;
          const isFlagship = course.id === 'c-full-1550';
          const cardIndexStr = `0${index + 1}`;
          const instructor = course.instructorName || 'White Board Faculty';
          const instructorTitle = course.instructorTitle || 'SAT Master Instructor';
          const featuresList = course.features || [];
          const price = course.price ?? 0;
          const originalPrice = course.originalPrice ?? 0;

          return (
            <div
              key={course.id}
              className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group overflow-hidden ${isFlagship
                ? 'bg-(--brand-soft) border border-(--brand)/50 shadow-xs'
                : 'bg-(--surface) border border-(--border) shadow-xs hover:border-(--brand)/60'
                }`}
            >
              {/* Subtle Editorial Corner Number Index */}
              <div className="absolute -top-3 right-3 pointer-events-none select-none text-[84px] font-extrabold font-mono text-(--foreground)/3 group-hover:text-(--brand-text)/6 transition-colors duration-200 leading-none">
                {cardIndexStr}
              </div>

              {isFlagship && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-(--brand) rounded-t-2xl" />
              )}

              <div className="space-y-5 relative z-10">
                {/* Header row: Badge & Duration */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-md text-[11.5px] font-semibold tracking-wide uppercase ${isFlagship
                      ? 'bg-(--brand-cta) text-white'
                      : course.badge === 'Bestseller'
                        ? 'bg-(--brand-soft) text-(--brand-text) border border-teal-200'
                        : 'bg-(--surface-soft) text-(--foreground)'
                      }`}
                  >
                    {isFlagship ? 'BEST VALUE' : course.badge || course.level || 'COMPREHENSIVE'}
                  </span>

                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-(--foreground-secondary)">
                    <Clock className="w-3.5 h-3.5 text-(--brand-text) stroke-[1.75]" />
                    <span>{course.totalHours || 20} Hours</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-bold text-(--foreground) text-[20px] leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-[14.5px] text-(--foreground-secondary) leading-[1.55] line-clamp-3">
                    {course.description}
                  </p>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-(--brand-soft) text-(--brand-text) flex items-center justify-center font-bold text-[13.5px] border border-teal-200 shrink-0">
                    {instructor.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-(--foreground) text-[14px] leading-tight">
                      {instructor}
                    </div>
                    <div className="text-[12.5px] text-(--foreground-secondary)">{instructorTitle}</div>
                  </div>
                </div>

                {/* Enrolled Progress State */}
                {isEnrolled && lessonsList.length > 0 && (
                  <div className="p-3.5 bg-(--surface) rounded-xl border border-(--border) space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-(--foreground) uppercase tracking-wider">
                      <span>Continue Learning</span>
                      <span className="font-mono text-(--brand-text)">
                        Lesson {completedLessonIds.length + 1} of {lessonsList.length} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-(--surface-soft) overflow-hidden">
                      <div
                        className="h-full bg-(--brand-cta) rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Key Benefits (max 3) */}
                <div className="space-y-3 pt-1">
                  {featuresList.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[14.5px] text-(--foreground-secondary) leading-[1.45]">
                      <div className="w-4.5 h-4.5 rounded-full bg-(--brand) text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Single Divider before Pricing & CTA */}
              <div className="pt-5 mt-5 border-t border-(--border) flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-extrabold text-(--foreground) tracking-tight font-mono">
                      ৳{price.toLocaleString()}
                    </span>
                    {originalPrice > 0 && (
                      <span className="text-[13px] text-(--foreground-secondary) line-through font-mono">
                        ৳{originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-(--brand-text)">
                    ONE-TIME ACCESS
                  </span>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-5 py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13.5px] rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs group/btn"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Classroom</span>
                  </button>
                ) : isFlagship ? (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-5 py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13.5px] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs group/btn"
                  >
                    <span>Get Full Access</span>
                    <span className="transition-transform duration-200 group-hover/btn:translate-x-1.5">→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-5 py-3 bg-(--surface) hover:bg-(--brand-soft) text-(--foreground) font-semibold text-[13.5px] rounded-xl border border-(--border) transition-colors cursor-pointer flex items-center gap-1.5 group/btn shadow-xs"
                  >
                    <span>View Syllabus</span>
                    <span className="transition-transform duration-200 group-hover/btn:translate-x-1.5">→</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- COURSE DETAIL & LESSON VIEWER MODAL --- */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-(--surface) rounded-2xl shadow-xl border border-(--border) w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-(--brand-cta) text-white flex items-center justify-center font-bold text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-(--foreground) leading-tight">{selectedCourse.title}</h3>
                  <p className="text-[11px] text-(--foreground-secondary)">
                    {selectedCourse.instructorName || 'White Board Faculty'} • {selectedCourse.lessonsCount || selectedCourse.lessons?.length || 0} Modules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Course Classroom Workspace */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
              {/* Left Main Player / Content View */}
              <div className="lg:col-span-8 p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 border-b lg:border-b-0 lg:border-r border-(--border)">
                {activeLesson ? (
                  <div className="space-y-4">
                    {/* Simulated Video Player */}
                    <div className="w-full aspect-video bg-(--navy-section) rounded-xl overflow-hidden relative flex items-center justify-center">
                      <div className="text-center space-y-2 p-6 text-white">
                        <div className="w-12 h-12 rounded-full bg-(--brand-cta) hover:bg-(--brand-hover) text-white flex items-center justify-center mx-auto shadow-md hover:scale-105 transition-transform cursor-pointer">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                        <div className="font-bold text-[13px]">{activeLesson.title}</div>
                        <div className="text-[11px] text-(--foreground-secondary) font-mono">Duration: {activeLesson.durationMinutes} Minutes • HD 1080p</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="font-bold text-(--foreground) text-base">{activeLesson.title}</h4>
                        <p className="text-[12px] text-(--foreground-secondary) mt-0.5">{activeLesson.description}</p>
                      </div>

                      {hasAccessToCourse(selectedCourse.id) && (
                        <button
                          onClick={() => onToggleLessonComplete(selectedCourse.id, activeLesson.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${(courseProgress[selectedCourse.id] || []).includes(activeLesson.id)
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-(--surface) text-(--foreground) border-(--border) hover:bg-(--surface-soft)'
                            }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {(courseProgress[selectedCourse.id] || []).includes(activeLesson.id)
                              ? 'Completed'
                              : 'Mark as Done'}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Lesson Downloadable Resources */}
                    {activeLesson.resources && activeLesson.resources.length > 0 && (
                      <div className="p-4 bg-(--brand-soft) rounded-xl border border-(--border) space-y-2">
                        <div className="text-[11px] font-bold text-(--foreground) uppercase tracking-wider">
                          Attached Module Cheatsheets & Guides
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeLesson.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="px-3 py-1 bg-(--surface) hover:bg-(--surface-soft) border border-(--border) rounded-lg text-[11px] font-medium text-(--brand-text) flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3 h-3 text-(--brand-text)" />
                              <span>{res.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-2 text-(--foreground-secondary)">
                    <Video className="w-8 h-8 mx-auto text-(--foreground-muted)" />
                    <p className="text-[12px]">Select a lesson from the syllabus to start watching.</p>
                  </div>
                )}
              </div>

              {/* Right Syllabus Lesson List */}
              <div className="lg:col-span-4 bg-(--brand-soft) p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-(--foreground) uppercase tracking-wider">
                    Syllabus ({selectedCourse.lessons.length} Lessons)
                  </span>
                  {!hasAccessToCourse(selectedCourse.id) && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Preview Mode
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedCourse.lessons.map((lesson) => {
                    const isUnlocked = hasAccessToCourse(selectedCourse.id) || lesson.isFreePreview;
                    const isCurrent = activeLesson?.id === lesson.id;
                    const isDone = (courseProgress[selectedCourse.id] || []).includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => isUnlocked && setActiveLesson(lesson)}
                        className={`p-3 rounded-xl border text-[12px] transition-all ${isCurrent
                          ? 'bg-(--surface) border-(--brand) shadow-xs'
                          : isUnlocked
                            ? 'bg-(--surface) border-(--border) hover:border-(--border-strong) cursor-pointer'
                            : 'bg-(--surface-soft)/70 border-(--border) text-(--foreground-muted) cursor-not-allowed opacity-75'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-(--foreground) leading-snug">{lesson.title}</div>
                            <div className="text-[11px] text-(--foreground-secondary) flex items-center gap-2 font-mono">
                              <span>{lesson.durationMinutes} mins</span>
                              {lesson.isFreePreview && !hasAccessToCourse(selectedCourse.id) && (
                                <span className="text-emerald-600 font-semibold font-sans">Free Preview</span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 mt-0.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isUnlocked ? (
                              <Play className={`w-3 h-3 ${isCurrent ? 'fill-(--brand-text) text-(--brand-text)' : 'text-(--foreground-secondary)'}`} />
                            ) : (
                              <Lock className="w-3 h-3 text-(--foreground-muted)" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!hasAccessToCourse(selectedCourse.id) && (
                  <div className="p-4 bg-(--surface) rounded-xl border border-teal-200 shadow-xs space-y-2 mt-4">
                    <div className="text-[12px] font-bold text-(--foreground)">Unlock Complete Masterclass</div>
                    <p className="text-[11px] text-(--foreground-secondary) leading-relaxed">
                      Enroll now to access all {selectedCourse.lessonsCount} video lessons and cheatsheets.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        onOpenPricing();
                      }}
                      className="w-full py-2 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-medium text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Enroll in Course (৳{selectedCourse.price.toLocaleString()})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
