'use client';

import React, { useState } from 'react';
import { Course, Subject, Lesson } from '../../../types';
import {
  BookOpen,
  Video,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Play,
  Layers,
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
} from 'lucide-react';
import {
  EditorShell,
  EditorPanes,
  EditorSection,
  Field,
  inputClass,
  textareaClass,
} from './EditorShell';
import { Pill, IconAction, Button } from './ui';

interface CourseVisualEditorProps {
  initialCourse?: Course | null;
  onSave: (courseData: Record<string, unknown>) => void;
}

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  subject: Subject | 'both';
  level: Course['level'];
  price: number;
  originalPrice: number;
  badge: string;
  features: string;
  isPublished: boolean;
}

/** New courses start empty, with no placeholder lessons to clean up. */
const blankForm = (): FormState => ({
  title: '',
  subtitle: '',
  description: '',
  subject: 'math',
  level: 'All Levels',
  price: 0,
  originalPrice: 0,
  badge: '',
  features: '',
  isPublished: false,
});

export const CourseVisualEditor: React.FC<CourseVisualEditorProps> = ({ initialCourse, onSave }) => {
  const [form, setForm] = useState<FormState>(() =>
    initialCourse
      ? {
          title: initialCourse.title,
          subtitle: initialCourse.subtitle,
          description: initialCourse.description,
          subject: initialCourse.subject,
          level: initialCourse.level,
          price: initialCourse.price,
          originalPrice: initialCourse.originalPrice,
          badge: initialCourse.badge || '',
          features: initialCourse.features.join('\n'),
          isPublished: initialCourse.is_published,
        }
      : blankForm()
  );
  const [lessons, setLessons] = useState<Lesson[]>(initialCourse?.lessons || []);
  const [isDirty, setIsDirty] = useState(false);
  // Lessons are edited in place, so there is no mirror state to fall out of sync.
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(
    initialCourse?.lessons?.[0]?.id ?? null
  );

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const updateLesson = (id: string, patch: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setIsDirty(true);
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      courseId: initialCourse?.id || 'new',
      title: '',
      description: '',
      durationMinutes: 15,
      videoUrl: '',
      isFreePreview: lessons.length === 0, // first lesson defaults to a free preview
      order: lessons.length + 1,
    };
    setLessons((prev) => [...prev, newLesson]);
    setOpenLessonId(newLesson.id);
    setPreviewLessonId(newLesson.id);
    setIsDirty(true);
  };

  const deleteLesson = (id: string) => {
    const lesson = lessons.find((l) => l.id === id);
    if (!confirm(`Remove lesson “${lesson?.title || 'Untitled'}” from this course?`)) return;
    setLessons((prev) => prev.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i + 1 })));
    if (previewLessonId === id) setPreviewLessonId(null);
    setIsDirty(true);
  };

  /** Move a lesson one slot up or down and renumber, so curriculum order is editable. */
  const moveLesson = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const next = [...lessons];
    [next[index], next[target]] = [next[target], next[index]];
    setLessons(next.map((l, i) => ({ ...l, order: i + 1 })));
    setIsDirty(true);
  };

  const totalMinutes = lessons.reduce((sum, l) => sum + (Number(l.durationMinutes) || 0), 0);
  const featureList = form.features
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    onSave({
      id: initialCourse?.id,
      title: form.title.trim(),
      slug: form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      subject: form.subject,
      level: form.level,
      difficulty: form.level,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      badge: form.badge.trim(),
      features: featureList,
      is_published: form.isPublished,
      lessonsCount: lessons.length,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      lessons: lessons.map((l, i) => ({ ...l, order: i + 1 })),
    });
  };

  const previewLesson = lessons.find((l) => l.id === previewLessonId) || lessons[0];

  return (
    <EditorShell
      eyebrow="Courses"
      title={initialCourse ? `Edit ${initialCourse.title}` : 'New course'}
      backTab="courses"
      formId="course-form"
      saveLabel={initialCourse ? 'Save changes' : 'Save course'}
      isDirty={isDirty}
    >
      <EditorPanes
        form={
          <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
            <EditorSection icon={BookOpen} title="Course details">
              <Field label="Title">
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="SAT Math 800 Masterclass"
                  className={inputClass}
                />
              </Field>

              <Field label="Subtitle">
                <input
                  type="text"
                  required
                  value={form.subtitle}
                  onChange={(e) => update({ subtitle: e.target.value })}
                  placeholder="Complete Digital SAT Math strategy"
                  className={inputClass}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="What the course covers and who it is for."
                  className={textareaClass}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Subject">
                  <select
                    value={form.subject}
                    onChange={(e) => update({ subject: e.target.value as Subject | 'both' })}
                    className={inputClass}
                  >
                    <option value="math">Math</option>
                    <option value="reading_writing">Reading &amp; Writing</option>
                    <option value="both">Both subjects</option>
                  </select>
                </Field>

                <Field label="Level">
                  <select
                    value={form.level}
                    onChange={(e) => update({ level: e.target.value as Course['level'] })}
                    className={inputClass}
                  >
                    <option value="All Levels">All levels</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced 1500+">Advanced 1500+</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Price (৳)">
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.price}
                    onChange={(e) => update({ price: Number(e.target.value) })}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
                <Field label="Original price (৳)">
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.originalPrice}
                    onChange={(e) => update({ originalPrice: Number(e.target.value) })}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
                <Field label="Badge" hint="Optional">
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => update({ badge: e.target.value })}
                    placeholder="Best seller"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="What's included" hint="One item per line">
                <textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) => update({ features: e.target.value })}
                  placeholder={'Full HD video breakdowns\nDiagnostic quizzes\nFormula cheat sheets'}
                  className={`${textareaClass} font-mono`}
                />
              </Field>

              <Field label="Visibility">
                <select
                  value={form.isPublished ? 'published' : 'draft'}
                  onChange={(e) => update({ isPublished: e.target.value === 'published' })}
                  className={inputClass}
                >
                  <option value="draft">Draft — hidden from students</option>
                  <option value="published">Published — visible in the catalog</option>
                </select>
              </Field>
            </EditorSection>

            <EditorSection
              icon={Layers}
              title={`Curriculum (${lessons.length})`}
              hint={totalMinutes > 0 ? `${Math.round((totalMinutes / 60) * 10) / 10} hrs total` : undefined}
            >
              {lessons.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-[13px] text-[#58708A]">
                    No lessons yet. A course needs at least one lesson before students can start it.
                  </p>
                  <Button type="button" variant="primary" icon={Plus} onClick={addLesson}>
                    Add first lesson
                  </Button>
                </div>
              ) : (
                <>
                  <ol className="space-y-2">
                    {lessons.map((les, index) => {
                      const isOpen = openLessonId === les.id;
                      const isPreviewing = previewLessonId === les.id;

                      return (
                        <li
                          key={les.id}
                          className={`rounded-xl border transition-colors ${
                            isPreviewing ? 'bg-[#F1F8F7] border-[#0D918A]' : 'bg-[#F8FBFB] border-[#E2E8F0]'
                          }`}
                        >
                          <div className="p-3 flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] text-[#58708A] grid place-items-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                              {index + 1}
                            </span>

                            <button
                              type="button"
                              onClick={() => setPreviewLessonId(les.id)}
                              className="flex-1 min-w-0 text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[13px] font-semibold text-[#071126]">
                                  {les.title || <span className="text-[#58708A]">Untitled lesson</span>}
                                </span>
                                {les.isFreePreview && <Pill tone="success">Free preview</Pill>}
                              </div>
                              <div className="text-[11px] text-[#58708A] mt-0.5">
                                {les.durationMinutes} min
                                {les.videoUrl ? '' : ' • no video URL'}
                              </div>
                            </button>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveLesson(index, -1)}
                                disabled={index === 0}
                                aria-label={`Move lesson ${index + 1} up`}
                                title="Move up"
                                className="p-1.5 rounded-lg text-[#58708A] hover:text-[#071126] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveLesson(index, 1)}
                                disabled={index === lessons.length - 1}
                                aria-label={`Move lesson ${index + 1} down`}
                                title="Move down"
                                className="p-1.5 rounded-lg text-[#58708A] hover:text-[#071126] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <IconAction
                                icon={isOpen ? Check : Pencil}
                                label={isOpen ? `Done editing lesson ${index + 1}` : `Edit lesson ${index + 1}`}
                                onClick={() => setOpenLessonId(isOpen ? null : les.id)}
                              />
                              <IconAction
                                icon={Trash2}
                                tone="danger"
                                label={`Remove lesson ${index + 1}`}
                                onClick={() => deleteLesson(les.id)}
                              />
                            </div>
                          </div>

                          {isOpen && (
                            <div className="px-3 pb-3 pl-11 space-y-3 animate-in fade-in duration-150">
                              <Field label="Lesson title">
                                <input
                                  type="text"
                                  required
                                  value={les.title}
                                  onChange={(e) => updateLesson(les.id, { title: e.target.value })}
                                  placeholder="Digital SAT Math blueprint & timing"
                                  className={inputClass}
                                />
                              </Field>

                              <Field label="Description">
                                <textarea
                                  rows={2}
                                  value={les.description}
                                  onChange={(e) => updateLesson(les.id, { description: e.target.value })}
                                  placeholder="What this lesson covers."
                                  className={textareaClass}
                                />
                              </Field>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Duration (minutes)">
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    value={les.durationMinutes}
                                    onChange={(e) =>
                                      updateLesson(les.id, { durationMinutes: Number(e.target.value) })
                                    }
                                    className={`${inputClass} font-mono`}
                                  />
                                </Field>

                                <Field label="Access">
                                  <select
                                    value={les.isFreePreview ? 'preview' : 'enrolled'}
                                    onChange={(e) =>
                                      updateLesson(les.id, { isFreePreview: e.target.value === 'preview' })
                                    }
                                    className={inputClass}
                                  >
                                    <option value="enrolled">Enrolled students only</option>
                                    <option value="preview">Free preview</option>
                                  </select>
                                </Field>
                              </div>

                              <Field label="Video embed URL" hint="Must start with http:// or https://">
                                <input
                                  type="url"
                                  value={les.videoUrl || ''}
                                  onChange={(e) => updateLesson(les.id, { videoUrl: e.target.value })}
                                  placeholder="https://www.youtube.com/embed/…"
                                  className={`${inputClass} font-mono`}
                                />
                              </Field>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>

                  <Button type="button" icon={Plus} onClick={addLesson} className="w-full">
                    Add lesson
                  </Button>
                </>
              )}
            </EditorSection>
          </form>
        }
        preview={
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#58708A]">
              <Eye className="w-4 h-4" />
              <span>Student preview</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {form.badge && <Pill tone="brand">{form.badge}</Pill>}
                  <Pill tone={form.isPublished ? 'success' : 'warning'}>
                    {form.isPublished ? 'Published' : 'Draft'}
                  </Pill>
                </div>
                <span className="text-[12px] text-[#58708A]">{form.level}</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#071126] leading-snug">
                  {form.title || <span className="text-[#58708A]">Course title</span>}
                </h2>
                <p className="text-[13px] text-[#58708A]">{form.subtitle}</p>
              </div>

              <p className="text-[13px] text-[#071126] leading-relaxed">
                {form.description || (
                  <span className="text-[#58708A]">The description will appear here.</span>
                )}
              </p>

              <div className="flex items-center gap-3 text-[12px] text-[#58708A] pt-1">
                <span>{lessons.length} lessons</span>
                <span aria-hidden="true">•</span>
                <span>{Math.round((totalMinutes / 60) * 10) / 10} hrs</span>
              </div>

              {featureList.length > 0 && (
                <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                  <div className="text-[12px] font-semibold text-[#071126]">What&apos;s included</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px]">
                    {featureList.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[#071126]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-xl font-bold text-[#071126] tabular-nums">৳{form.price}</span>
                  {form.originalPrice > form.price && (
                    <span className="text-[12px] text-[#58708A] line-through tabular-nums">
                      ৳{form.originalPrice}
                    </span>
                  )}
                </div>
                <span className="h-10 px-4 bg-[#0D918A] text-white text-[12px] font-semibold rounded-[10px] grid place-items-center">
                  Enroll now
                </span>
              </div>
            </div>

            {previewLesson && (
              <div className="p-5 rounded-2xl bg-[#080D21] text-white space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-teal-300">
                    <Video className="w-4 h-4" />
                    <span>Lesson {previewLesson.order} player</span>
                  </div>
                  <span className="font-mono text-[12px] text-slate-400">
                    {previewLesson.durationMinutes} min
                  </span>
                </div>

                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 grid place-items-center">
                  {previewLesson.videoUrl ? (
                    <iframe
                      src={previewLesson.videoUrl}
                      title={previewLesson.title || 'Lesson video'}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center space-y-2 p-6">
                      <Play className="w-8 h-8 text-teal-400 mx-auto opacity-70" />
                      <div className="text-[12px] text-slate-400">No video URL for this lesson yet</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-[14px] font-bold">{previewLesson.title || 'Untitled lesson'}</h3>
                  <p className="text-[12px] text-slate-400">{previewLesson.description}</p>
                </div>
              </div>
            )}
          </div>
        }
      />
    </EditorShell>
  );
};
