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
    <div className="bg-[#FFFFFF] min-h-[calc(100vh-70px)] py-16 px-4 sm:px-6 lg:px-8 space-y-14 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="max-w-[1240px] mx-auto space-y-4">
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D918A] font-mono">
            VIDEO MASTERCLASSES
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold tracking-[-0.03em] text-[#071126] leading-[1.12]">
            Digital SAT Courses
          </h1>
          <p className="text-[16px] sm:text-[17px] text-[#58708A] leading-[1.6] max-w-[700px]">
            Structured lessons, proven strategies, and focused instruction for every major Digital SAT skill.
          </p>
        </div>

        {/* Small metadata row */}
        <div className="flex items-center gap-4 text-[12.5px] font-medium text-[#58708A] pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D918A]" />
            <span>3 Programs</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D918A]" />
            <span>100+ Lessons</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D918A]" />
            <span>Math + Reading & Writing</span>
          </div>
        </div>
      </div>

      {/* Courses Catalog Grid */}
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {courses.map((course, index) => {
          const isEnrolled = hasAccessToCourse(course.id);
          const completedLessonIds = courseProgress[course.id] || [];
          const progressPercent =
            course.lessons.length > 0
              ? Math.round((completedLessonIds.length / course.lessons.length) * 100)
              : 0;
          const isFlagship = course.id === 'c-full-1550';
          const cardIndexStr = `0${index + 1}`;

          return (
            <div
              key={course.id}
              className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group overflow-hidden ${isFlagship
                  ? 'bg-[#F1F8F7] border border-[#0D918A]/50 shadow-xs'
                  : 'bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0D918A]/60'
                }`}
            >
              {/* Subtle Editorial Corner Number Index */}
              <div className="absolute -top-3 right-3 pointer-events-none select-none text-[84px] font-extrabold font-mono text-[#071126]/[0.03] group-hover:text-[#0D918A]/[0.06] transition-colors duration-200 leading-none">
                {cardIndexStr}
              </div>

              {isFlagship && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0D918A] rounded-t-2xl" />
              )}

              <div className="space-y-5 relative z-10">
                {/* Header row: Badge & Duration */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-md text-[11.5px] font-semibold tracking-wide uppercase ${isFlagship
                        ? 'bg-[#087C76] text-white'
                        : course.badge === 'Bestseller'
                          ? 'bg-[#F1F8F7] text-[#087C76] border border-teal-200'
                          : 'bg-slate-100 text-[#071126]'
                      }`}
                  >
                    {isFlagship ? 'BEST VALUE' : course.badge || course.level}
                  </span>

                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#58708A]">
                    <Clock className="w-3.5 h-3.5 text-[#0D918A] stroke-[1.75]" />
                    <span>{course.totalHours} Hours</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-bold text-[#071126] text-[20px] leading-[1.25]">
                    {course.title}
                  </h3>
                  <p className="text-[14.5px] text-[#58708A] leading-[1.55] line-clamp-3">
                    {course.description}
                  </p>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-[#F1F8F7] text-[#087C76] flex items-center justify-center font-bold text-[13.5px] border border-teal-200 shrink-0">
                    {course.instructorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#071126] text-[14px] leading-tight">
                      {course.instructorName}
                    </div>
                    <div className="text-[12.5px] text-[#58708A]">{course.instructorTitle}</div>
                  </div>
                </div>

                {/* Enrolled Progress State */}
                {isEnrolled && course.lessons.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#071126] uppercase tracking-wider">
                      <span>Continue Learning</span>
                      <span className="font-mono text-[#087C76]">
                        Lesson {completedLessonIds.length + 1} of {course.lessons.length} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#087C76] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Key Benefits (max 3) */}
                <div className="space-y-3 pt-1">
                  {course.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[14.5px] text-[#58708A] leading-[1.45]">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#0D918A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Single Divider before Pricing & CTA */}
              <div className="pt-5 mt-5 border-t border-[#E2E8F0] flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-extrabold text-[#071126] tracking-tight font-mono">
                      ৳{course.price.toLocaleString()}
                    </span>
                    <span className="text-[13px] text-[#58708A] line-through font-mono">
                      ৳{course.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#0D918A]">
                    ONE-TIME ACCESS
                  </span>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-5 py-3 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[13.5px] rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs group/btn"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Classroom</span>
                  </button>
                ) : isFlagship ? (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-5 py-3 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[13.5px] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs group/btn"
                  >
                    <span>Get Full Access</span>
                    <span className="transition-transform duration-200 group-hover/btn:translate-x-1.5">→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="px-5 py-3 bg-white hover:bg-[#F1F8F7] text-[#071126] font-semibold text-[13.5px] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer flex items-center gap-1.5 group/btn shadow-xs"
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
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[#087C76] text-white flex items-center justify-center font-bold text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-[#071126] leading-tight">{selectedCourse.title}</h3>
                  <p className="text-[11px] text-[#58708A]">{selectedCourse.instructorName} • {selectedCourse.lessonsCount} Modules</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Course Classroom Workspace */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Main Player / Content View */}
              <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6 border-r border-[#E2E8F0]">
                {activeLesson ? (
                  <div className="space-y-4">
                    {/* Simulated Video Player */}
                    <div className="w-full aspect-video bg-[#080D21] rounded-xl overflow-hidden relative flex items-center justify-center">
                      <div className="text-center space-y-2 p-6 text-white">
                        <div className="w-12 h-12 rounded-full bg-[#087C76] hover:bg-[#066F6A] text-white flex items-center justify-center mx-auto shadow-md hover:scale-105 transition-transform cursor-pointer">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                        <div className="font-bold text-[13px]">{activeLesson.title}</div>
                        <div className="text-[11px] text-[#58708A] font-mono">Duration: {activeLesson.durationMinutes} Minutes • HD 1080p</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="font-bold text-[#071126] text-base">{activeLesson.title}</h4>
                        <p className="text-[12px] text-[#58708A] mt-0.5">{activeLesson.description}</p>
                      </div>

                      {hasAccessToCourse(selectedCourse.id) && (
                        <button
                          onClick={() => onToggleLessonComplete(selectedCourse.id, activeLesson.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${(courseProgress[selectedCourse.id] || []).includes(activeLesson.id)
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-white text-[#071126] border-[#E2E8F0] hover:bg-slate-50'
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
                      <div className="p-4 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] space-y-2">
                        <div className="text-[11px] font-bold text-[#071126] uppercase tracking-wider">
                          Attached Module Cheatsheets & Guides
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeLesson.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="px-3 py-1 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-lg text-[11px] font-medium text-[#087C76] flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3 h-3 text-[#0D918A]" />
                              <span>{res.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-2 text-[#58708A]">
                    <Video className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-[12px]">Select a lesson from the syllabus to start watching.</p>
                  </div>
                )}
              </div>

              {/* Right Syllabus Lesson List */}
              <div className="lg:col-span-4 bg-[#F1F8F7] p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#071126] uppercase tracking-wider">
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
                            ? 'bg-white border-[#0D918A] shadow-xs'
                            : isUnlocked
                              ? 'bg-white border-[#E2E8F0] hover:border-slate-300 cursor-pointer'
                              : 'bg-slate-100/70 border-[#E2E8F0] text-slate-400 cursor-not-allowed opacity-75'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[#071126] leading-snug">{lesson.title}</div>
                            <div className="text-[11px] text-[#58708A] flex items-center gap-2 font-mono">
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
                              <Play className={`w-3 h-3 ${isCurrent ? 'fill-[#087C76] text-[#087C76]' : 'text-[#58708A]'}`} />
                            ) : (
                              <Lock className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!hasAccessToCourse(selectedCourse.id) && (
                  <div className="p-4 bg-white rounded-xl border border-teal-200 shadow-xs space-y-2 mt-4">
                    <div className="text-[12px] font-bold text-[#071126]">Unlock Complete Masterclass</div>
                    <p className="text-[11px] text-[#58708A] leading-relaxed">
                      Enroll now to access all {selectedCourse.lessonsCount} video lessons and cheatsheets.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        onOpenPricing();
                      }}
                      className="w-full py-2 bg-[#087C76] hover:bg-[#066F6A] text-white font-medium text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
