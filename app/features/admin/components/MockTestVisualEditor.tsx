'use client';

import React, { useMemo, useState } from 'react';
import { MockTest, MockTestModule, Question, Difficulty, Subject, Course } from '../../../types';
import { MathRenderer } from '../../../components/MathRenderer';
import { formatDomainName, formatSubjectName } from '../../../lib/utils';
import { groupQuestions } from '../lib/groupQuestions';
import {
  standardSatModules,
  makeModule,
  moduleTitle,
  deriveTotals,
  mockTestIssues,
  eligibleQuestions,
} from '../../../lib/mockTests';
import {
  Award,
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  AlertTriangle,
  Clock,
  ListChecks,
  Wand2,
  Settings2,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  EditorShell,
  EditorTopBar,
  EditorPanes,
  EditorSection,
  Field,
  inputClass,
  textareaClass,
  editorPrimaryButtonClass,
} from './EditorShell';
import { Pill, Button, IconAction, EmptyState, DifficultyDot } from './ui';
import { useQuestionForm, QuestionFormFields, QuestionPreview } from './questionForm';

interface MockTestVisualEditorProps {
  initialTest?: MockTest | null;
  allQuestions: Question[];
  allCourses?: Course[];
  onSave: (testData: Record<string, unknown>) => void;
  /** Adds a question to the bank and returns it, so the picker can author one inline. */
  onCreateQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Promise<Question>;
}

interface FormState {
  title: string;
  description: string;
  difficulty: Difficulty;
  isFree: boolean;
  courseIds: string[];
}

const blankForm = (): FormState => ({
  title: '',
  description: '',
  difficulty: 'medium',
  isFree: false,
  courseIds: [],
});

export const MockTestVisualEditor: React.FC<MockTestVisualEditorProps> = ({
  initialTest,
  allQuestions,
  allCourses = [],
  onSave,
  onCreateQuestion,
}) => {
  const testId = initialTest?.id || 'new';

  const [form, setForm] = useState<FormState>(() =>
    initialTest
      ? {
          title: initialTest.title,
          description: initialTest.description,
          difficulty: initialTest.difficulty,
          isFree: initialTest.is_free,
          courseIds: (initialTest.courseIds as string[] | undefined) ?? (initialTest.courseId ? [initialTest.courseId as string] : []),
        }
      : blankForm()
  );
  const [modules, setModules] = useState<MockTestModule[]>(initialTest?.modules || []);
  const [isDirty, setIsDirty] = useState(false);
  const [pickingModuleId, setPickingModuleId] = useState<string | null>(null);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const updateModule = (id: string, patch: Partial<MockTestModule>) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setIsDirty(true);
  };

  const totals = deriveTotals(modules);
  const issues = mockTestIssues(modules);

  const addStandardStructure = () => {
    setModules(standardSatModules(testId));
    setIsDirty(true);
  };

  const addModule = () => {
    // Continue the section the test is already building out.
    const last = modules[modules.length - 1];
    const section: Subject = last?.section ?? 'reading_writing';
    const moduleNumber: 1 | 2 = last?.section === section && last?.moduleNumber === 1 ? 2 : 1;
    setModules((prev) => [
      ...prev,
      makeModule(testId, section, moduleNumber, section === 'math' ? 35 : 32, `${prev.length + 1}-${Date.now()}`),
    ]);
    setIsDirty(true);
  };

  const removeModule = (id: string) => {
    const target = modules.find((m) => m.id === id);
    if (!confirm(`Remove “${target?.title}” and its ${target?.questions.length ?? 0} questions?`)) return;
    setModules((prev) => prev.filter((m) => m.id !== id));
    setIsDirty(true);
  };

  const moveModule = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= modules.length) return;
    const next = [...modules];
    [next[index], next[target]] = [next[target], next[index]];
    setModules(next);
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    const effectiveCourseIds = form.isFree ? [] : form.courseIds;
    onSave({
      id: initialTest?.id,
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty,
      is_free: form.isFree,
      courseId: effectiveCourseIds[0] ?? null,
      courseIds: effectiveCourseIds,
      // Derived, never typed — the summary a student sees always matches the modules.
      totalQuestions: totals.totalQuestions,
      totalTimeMinutes: totals.totalTimeMinutes,
      modules,
    });
  };

  const pickingModule = modules.find((m) => m.id === pickingModuleId) || null;

  // A full screen rather than a modal: the create-new form needs the same split-pane
  // width and live preview as the standalone question editor. This component stays
  // mounted, so the unsaved mock test is never at risk.
  if (pickingModule) {
    return (
      <ModuleQuestionScreen
        module={pickingModule}
        allQuestions={allQuestions}
        onCreateQuestion={onCreateQuestion}
        onBack={() => setPickingModuleId(null)}
        onConfirm={(questions) => {
          updateModule(pickingModule.id, { questions });
          setPickingModuleId(null);
        }}
      />
    );
  }

  return (
    <EditorShell
      eyebrow="Mock tests"
      title={initialTest ? `Edit ${initialTest.title}` : 'New mock test'}
      backTab="mock-tests"
      formId="mock-test-form"
      saveLabel={initialTest ? 'Save changes' : 'Save mock test'}
      isDirty={isDirty}
    >
      <EditorPanes
        form={
          <form id="mock-test-form" onSubmit={handleSubmit} className="space-y-4">
            <EditorSection icon={Award} title="Test details">
              <Field label="Title">
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Digital SAT Practice Test 2"
                  className={inputClass}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Who this mock is for and what it covers."
                  className={textareaClass}
                />
              </Field>
            </EditorSection>

            <EditorSection
              icon={Layers}
              title={`Modules (${modules.length})`}
              hint={
                modules.length
                  ? `${totals.totalQuestions} questions · ${totals.totalTimeMinutes} min`
                  : undefined
              }
            >
              {issues.length > 0 && (
                <div className="space-y-1.5">
                  {issues.map((issue, i) => (
                    <p
                      key={i}
                      className={`flex items-start gap-2 text-[12px] rounded-xl p-2.5 leading-relaxed border ${
                        issue.severity === 'blocking'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mt-px shrink-0" />
                      <span>{issue.message}</span>
                    </p>
                  ))}
                </div>
              )}

              {modules.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-[13px] text-[#58708A] leading-relaxed max-w-sm mx-auto">
                    A mock test is made of timed modules. Start from the official Digital SAT shape, or
                    build your own.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button type="button" variant="primary" icon={Wand2} onClick={addStandardStructure}>
                      Use standard SAT structure
                    </Button>
                    <Button type="button" icon={Plus} onClick={addModule}>
                      Add one module
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#58708A]">
                    Standard = Reading &amp; Writing 1 &amp; 2 (32 min each), Math 1 &amp; 2 (35 min each).
                  </p>
                </div>
              ) : (
                <>
                  <ol className="space-y-2">
                    {modules.map((mod, index) => (
                      <li
                        key={mod.id}
                        className="rounded-xl border border-[#E2E8F0] bg-[#F8FBFB] overflow-hidden"
                      >
                        <div className="p-3 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] text-[#58708A] grid place-items-center text-[11px] font-mono font-bold shrink-0 mt-0.5">
                              {index + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-[#071126]">{mod.title}</div>
                              <div className="text-[11px] text-[#58708A] mt-0.5 flex items-center gap-2">
                                <span>{mod.questions.length} questions</span>
                                <span aria-hidden="true">•</span>
                                <span>{mod.timeLimitMinutes} min</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveModule(index, -1)}
                                disabled={index === 0}
                                aria-label={`Move module ${index + 1} earlier`}
                                title="Move earlier"
                                className="p-1.5 rounded-lg text-[#58708A] hover:text-[#071126] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveModule(index, 1)}
                                disabled={index === modules.length - 1}
                                aria-label={`Move module ${index + 1} later`}
                                title="Move later"
                                className="p-1.5 rounded-lg text-[#58708A] hover:text-[#071126] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <IconAction
                                icon={Trash2}
                                tone="danger"
                                label={`Remove module ${index + 1}`}
                                onClick={() => removeModule(mod.id)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-8">
                            <Field label="Section">
                              <select
                                value={mod.section}
                                onChange={(e) => {
                                  const section = e.target.value as Subject;
                                  // Questions belong to a section, so switching clears them
                                  // rather than leaving cross-section content behind.
                                  updateModule(mod.id, {
                                    section,
                                    title: moduleTitle(section, mod.moduleNumber),
                                    questions: [],
                                  });
                                }}
                                className={inputClass}
                              >
                                <option value="reading_writing">Reading &amp; Writing</option>
                                <option value="math">Math</option>
                              </select>
                            </Field>

                            <Field label="Module number">
                              <select
                                value={mod.moduleNumber}
                                onChange={(e) => {
                                  const moduleNumber = Number(e.target.value) as 1 | 2;
                                  updateModule(mod.id, {
                                    moduleNumber,
                                    title: moduleTitle(mod.section, moduleNumber),
                                  });
                                }}
                                className={inputClass}
                              >
                                <option value={1}>Module 1</option>
                                <option value={2}>Module 2</option>
                              </select>
                            </Field>

                            <Field label="Time limit (min)">
                              <input
                                type="number"
                                required
                                min={1}
                                value={mod.timeLimitMinutes}
                                onChange={(e) =>
                                  updateModule(mod.id, { timeLimitMinutes: Number(e.target.value) })
                                }
                                className={`${inputClass} font-mono`}
                              />
                            </Field>
                          </div>

                          <div className="pl-8 space-y-2">
                            {mod.questions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {mod.questions.map((q) => (
                                  <span
                                    key={q.id}
                                    title={`${formatDomainName(q.domain)} · ${q.topic}`}
                                    className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#58708A]"
                                  >
                                    {q.code}
                                  </span>
                                ))}
                              </div>
                            )}
                            <Button
                              type="button"
                              icon={ListChecks}
                              onClick={() => setPickingModuleId(mod.id)}
                              className="w-full"
                            >
                              {mod.questions.length
                                ? `Change questions (${mod.questions.length})`
                                : 'Choose questions'}
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <Button type="button" icon={Plus} onClick={addModule} className="w-full">
                    Add module
                  </Button>
                </>
              )}
            </EditorSection>

            <EditorSection icon={Settings2} title="Publishing">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Difficulty">
                  <select
                    value={form.difficulty}
                    onChange={(e) => update({ difficulty: e.target.value as Difficulty })}
                    className={inputClass}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </Field>

                {form.courseIds.length === 0 && (
                  <Field label="Access tier">
                    <select
                      value={form.isFree ? 'free' : 'premium'}
                      onChange={(e) => update({ isFree: e.target.value === 'free' })}
                      className={inputClass}
                    >
                      <option value="premium">Premium — paid pass only</option>
                      <option value="free">Free diagnostic — any student</option>
                    </select>
                  </Field>
                )}
              </div>

              <div className="space-y-2">
                <Field
                  label={`Course access${form.courseIds.length ? ` — ${form.courseIds.length} selected` : ' (optional)'}`}
                  hint={
                    form.courseIds.length
                      ? 'Enrolled students in any selected course can sit without a separate mock pass. Premium gating is replaced by course gating — no conflict with Access tier.'
                      : form.isFree
                        ? 'Free tests are open to everyone.'
                        : 'Leave empty to use Access tier above. Add courses to gate by enrolment instead.'
                  }
                >
                  {/* Chips */}
                  {form.courseIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 min-h-10 rounded-[10px] border border-[#E2E8F0] bg-[#F8FBFB]">
                      {form.courseIds.map((cid) => {
                        const c = allCourses.find((x) => x.id === cid);
                        return (
                          <span
                            key={cid}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-white border border-[#E2E8F0] text-[12px] font-medium text-[#071126] shadow-xs"
                          >
                            <span className="truncate max-w-40">{c?.title ?? cid}</span>
                            <button
                              type="button"
                              onClick={() => {
                                update({ courseIds: form.courseIds.filter((x) => x !== cid) });
                              }}
                              aria-label={`Remove ${c?.title ?? cid}`}
                              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-50 text-[#58708A] hover:text-rose-600 grid place-items-center transition-colors cursor-pointer shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <select
                      value=""
                      onChange={(e) => {
                        const cid = e.target.value;
                        if (!cid) return;
                        if (!form.courseIds.includes(cid)) {
                          update({ courseIds: [...form.courseIds, cid], isFree: false });
                        }
                        e.target.value = '';
                      }}
                      className={inputClass}
                    >
                      <option value="">{form.courseIds.length ? 'Add another course…' : 'Add a course to gate by enrolment…'}</option>
                      {allCourses
                        .filter((c) => !form.courseIds.includes(c.id))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} — {c.id}
                          </option>
                        ))}
                    </select>
                    {form.courseIds.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => update({ courseIds: [] })}
                        className="shrink-0"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </Field>
                {form.courseIds.length > 0 && !form.isFree && (
                  <p className="text-[11px] text-[#58708A] leading-relaxed">
                    Access tier is now <strong>course-gated</strong> and not shown — enrolled students in any chip course can sit; others need no separate mock pass.
                  </p>
                )}
              </div>

              <p className="text-[11px] text-[#58708A] leading-relaxed">
                Total questions and total time are calculated from the modules above, so they always
                match the test students actually sit.
              </p>
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
                  <Pill tone="danger">{form.difficulty}</Pill>
                  {form.courseIds.length ? (
                    form.courseIds.map((cid) => (
                      <Pill key={cid} tone="neutral">{allCourses.find((c) => c.id === cid)?.title ?? cid}</Pill>
                    ))
                  ) : (
                    <Pill tone={form.isFree ? 'neutral' : 'brand'}>
                      {form.isFree ? 'Free diagnostic' : 'Premium'}
                    </Pill>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#071126] leading-snug">
                  {form.title || <span className="text-[#58708A]">Mock test title</span>}
                </h2>
                <p className="text-[13px] text-[#58708A] leading-relaxed">
                  {form.description || 'The description will appear here.'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-[#58708A]">
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="w-3.5 h-3.5" />
                  {totals.totalQuestions} questions
                </span>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {totals.totalTimeMinutes} min
                </span>
                <span aria-hidden="true">•</span>
                <span>{modules.length} modules</span>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0]">
                <span
                  className={`h-10 px-4 text-[12px] font-semibold rounded-[10px] grid place-items-center w-fit ${
                    issues.some((i) => i.severity === 'blocking')
                      ? 'bg-slate-200 text-[#58708A]'
                      : 'bg-[#0D918A] text-white'
                  }`}
                >
                  {issues.some((i) => i.severity === 'blocking') ? 'Not startable yet' : 'Start test'}
                </span>
              </div>
            </div>

            {modules.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-3">
                <h3 className="text-[13px] font-bold text-[#071126]">Module order</h3>
                <ol className="space-y-2">
                  {modules.map((mod, i) => (
                    <li
                      key={mod.id}
                      className="p-3 rounded-xl bg-[#F8FBFB] border border-[#E2E8F0] flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-white border border-[#E2E8F0] text-[#58708A] grid place-items-center text-[11px] font-mono font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-[#071126] truncate">
                          {mod.title}
                        </div>
                        <div className="text-[11px] text-[#58708A]">
                          {mod.questions.length} questions · {mod.timeLimitMinutes} min
                        </div>
                      </div>
                      {mod.questions.length === 0 && <Pill tone="warning">Empty</Pill>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        }
      />
    </EditorShell>
  );
};

/**
 * Full-screen question chooser for one module. Two paths: pick from the bank, or
 * author a new question with the same split-pane form and live preview as the
 * standalone editor. Creating writes to the bank (so it stays reusable) and selects
 * it into this module in one step.
 */
const ModuleQuestionScreen: React.FC<{
  module: MockTestModule;
  allQuestions: Question[];
  onCreateQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Promise<Question>;
  onBack: () => void;
  onConfirm: (questions: Question[]) => void;
}> = ({ module: mod, allQuestions, onCreateQuestion, onBack, onConfirm }) => {
  const [tab, setTab] = useState<'existing' | 'create'>('existing');
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(mod.questions.map((q) => q.id))
  );
  const [createdCodes, setCreatedCodes] = useState<string[]>([]);
  const [visibleLimit, setVisibleLimit] = useState(40);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const createCtl = useQuestionForm({
    allQuestions,
    lockedSubject: mod.section,
    idScope: 'module-picker',
  });

  const pool = useMemo(() => eligibleQuestions(allQuestions, mod.section), [allQuestions, mod.section]);

  const domainOptions = useMemo(() => {
    const s = new Set(pool.map((q) => q.domain));
    return Array.from(s);
  }, [pool]);

  const filtered = useMemo(() => {
    let r = pool;
    if (domainFilter !== 'all') r = r.filter((q) => q.domain === domainFilter);
    if (difficultyFilter !== 'all') r = r.filter((q) => q.difficulty === difficultyFilter);
    if (search.trim()) {
      const m = search.toLowerCase();
      r = r.filter(
        (q) =>
          q.code.toLowerCase().includes(m) ||
          q.topic.toLowerCase().includes(m) ||
          q.question_text.toLowerCase().includes(m)
      );
    }
    return r;
  }, [pool, search, domainFilter, difficultyFilter]);

  // reset limit when filters change
  React.useEffect(() => setVisibleLimit(40), [search, domainFilter, difficultyFilter]);

  const sections = useMemo(() => groupQuestions(filtered, 'domain'), [filtered]);
  const flatFiltered = useMemo(() => sections.flatMap((s) => s.groups.flatMap((g) => g.questions)), [sections]);
  const visibleQuestions = flatFiltered.slice(0, visibleLimit);
  const visibleSections = useMemo(() => groupQuestions(visibleQuestions, 'domain'), [visibleQuestions]);

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (ids: string[], select: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (select ? next.add(id) : next.delete(id)));
      return next;
    });

  const selectedQuestions = useMemo(() => pool.filter((q) => selectedIds.has(q.id)), [pool, selectedIds]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await onCreateQuestion(
      createCtl.buildPayload() as unknown as Omit<Question, 'id' | 'created_at' | 'updated_at'>
    );
    setSelectedIds((prev) => new Set(prev).add(created.id));
    setCreatedCodes((prev) => [...prev, created.code]);
    createCtl.reset(true);
  };

  const applySelection = () => {
    onConfirm(pool.filter((q) => selectedIds.has(q.id)));
  };

  const handleBack = () => {
    if (createCtl.isDirty && !window.confirm('Discard the question you are writing?')) return;
    onBack();
  };

  const tabButton = (value: 'existing' | 'create', label: string, count?: number) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === value}
      onClick={() => setTab(value)}
      className={`h-9 px-4 rounded-[10px] text-[12px] font-semibold transition-colors cursor-pointer ${
        tab === value ? 'bg-white text-[#087C76] shadow-xs' : 'text-[#58708A] hover:text-[#071126]'
      }`}
    >
      {label}
      {count !== undefined && <span className="font-normal text-[#58708A]"> · {count}</span>}
    </button>
  );

  const listPane = (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-4">
      {/* Compact toolbar: search + domain + difficulty + bulk actions */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#58708A] absolute left-3 top-3 pointer-events-none" />
            <input
              id="picker-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, topic, or text…"
              className="w-full h-10 pl-9 pr-3 bg-[#F8FBFB] border border-[#E2E8F0] rounded-[10px] text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] focus:bg-white transition-colors"
            />
          </div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] sm:w-55 shrink-0"
          >
            <option value="all">All domains ({pool.length})</option>
            {domainOptions.map((d) => (
              <option key={d} value={d}>
                {formatDomainName(d as any)}
              </option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] shrink-0"
          >
            <option value="all">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="text-[#58708A]">
            Showing <strong className="text-[#071126]">{filtered.length}</strong> of {pool.length} ·{' '}
            <strong className="text-[#0D918A]">{selectedIds.size} selected</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleGroup(flatFiltered.map((q) => q.id), true)}
              disabled={filtered.length === 0}
              className="h-8 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#071126] hover:bg-[#F8FBFB] disabled:opacity-40 text-[11px] font-semibold cursor-pointer"
            >
              Select all visible
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              disabled={selectedIds.size === 0}
              className="h-8 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#58708A] hover:text-[#071126] disabled:opacity-40 text-[11px] font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Selected chips — quick remove, stays visible */}
        {selectedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#F1F8F7] border border-[#E2E8F0]">
            {selectedQuestions.map((q) => (
              <span
                key={q.id}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#071126] shadow-xs"
              >
                <span className="font-mono text-[#58708A]">{q.code}</span>
                <button
                  type="button"
                  onClick={() => toggle(q.id)}
                  aria-label={`Remove ${q.code}`}
                  className="w-4 h-4 rounded-full hover:bg-rose-50 text-[#58708A] hover:text-rose-600 grid place-items-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {pool.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0]">
          <EmptyState
            icon={ListChecks}
            title={`No published ${formatSubjectName(mod.section)} questions`}
            description="Author one here, or publish the drafts you already have in the question bank."
            action={{ label: 'Create new question', onClick: () => setTab('create') }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0]">
          <EmptyState
            icon={Search}
            title="No matching questions"
            description={`Nothing in this section matches “${search}”${domainFilter !== 'all' ? ` in ${formatDomainName(domainFilter as any)}` : ''}.`}
            action={{
              label: 'Clear filters',
              onClick: () => {
                setSearch('');
                setDomainFilter('all');
                setDifficultyFilter('all');
              },
            }}
          />
        </div>
      ) : (
        <>
          {visibleSections.map((section) =>
            section.groups.map((group) => {
              const allIds = group.questions.map((q) => q.id);
              const allSelected = allIds.every((id) => selectedIds.has(id));
              const someSelected = allIds.some((id) => selectedIds.has(id));
              return (
                <fieldset key={group.key} className="space-y-2 min-w-0 bg-white rounded-xl border border-[#E2E8F0] p-3">
                  <legend className="flex items-center justify-between w-full px-1">
                    <span className="text-[13px] font-bold text-[#071126]">
                      {group.label} <span className="text-[#58708A] font-normal">· {allIds.length}</span>
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0D918A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !allSelected && someSelected;
                        }}
                        onChange={() => toggleGroup(allIds, !allSelected)}
                        className="w-3.5 h-3.5 accent-[#0D918A]"
                      />
                      {allSelected ? 'Deselect all' : 'Select all'}
                    </label>
                  </legend>

                  <div className="space-y-1.5">
                    {group.questions.map((q) => {
                      const isSelected = selectedIds.has(q.id);
                      const isExpanded = expandedId === q.id;
                      const choices = (q.choices ?? q.answer_choices ?? []) as any[];
                      return (
                        <div
                          key={q.id}
                          className={`rounded-xl border overflow-hidden transition-colors ${
                            isSelected ? 'bg-[#F1F8F7] border-[#0D918A] shadow-xs' : 'bg-[#F8FBFB] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                          }`}
                        >
                          <label className="flex items-start gap-2.5 p-2.5 cursor-pointer min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggle(q.id)}
                              className="mt-1 w-4 h-4 shrink-0 accent-[#0D918A]"
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#58708A]">
                                  {q.code}
                                </span>
                                <DifficultyDot difficulty={q.difficulty} />
                                <span className="text-[#071126] font-medium truncate">{q.topic}</span>
                                {q.stimulus && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">passage</span>
                                )}
                                {isSelected && (
                                  <span className="ml-auto inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                  </span>
                                )}
                              </div>
                              <div className={`text-[12px] text-[#58708A] leading-snug ${isExpanded ? '' : 'line-clamp-1'}`}>
                                <MathRenderer inline content={isExpanded ? q.question_text : q.question_text.slice(0, 160)} />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setExpandedId(isExpanded ? null : q.id);
                              }}
                              className="shrink-0 h-7 px-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#0D918A] hover:bg-[#F1F8F7] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              {isExpanded ? 'Hide' : 'Expand'}
                            </button>
                          </label>
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-2 border-t border-[#E2E8F0] bg-white space-y-2.5">
                              {q.stimulus && (
                                <div className="p-2.5 rounded-lg bg-[#F8FBFB] border border-[#E2E8F0] text-[12px] text-[#071126] leading-relaxed">
                                  <MathRenderer content={q.stimulus} />
                                </div>
                              )}
                              <div className="text-[13px] text-[#071126] leading-relaxed">
                                <MathRenderer content={q.question_text} />
                              </div>
                              {choices.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {choices.map((c: any) => (
                                    <div
                                      key={c.id}
                                      className={`px-2.5 py-2 rounded-lg text-[12px] border flex gap-2 ${
                                        c.id === q.correct_answer
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                          : 'bg-[#F8FBFB] border-[#E2E8F0] text-[#58708A]'
                                      }`}
                                    >
                                      <span className="font-mono font-bold shrink-0">{c.id}.</span>
                                      <span className="min-w-0">
                                        <MathRenderer inline content={c.text} />
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {q.explanation && (
                                <div className="text-[11px] text-[#58708A] border-l-2 border-[#E2E8F0] pl-2.5 leading-relaxed">
                                  <MathRenderer content={q.explanation} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })
          )}
          {filtered.length > visibleLimit && (
            <button
              type="button"
              onClick={() => setVisibleLimit((n) => n + 40)}
              className="w-full h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#071126] hover:bg-[#F8FBFB] text-[12px] font-semibold"
            >
              Load more — {filtered.length - visibleLimit} remaining
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-[#071126] flex flex-col">
      <EditorTopBar
        eyebrow={`Mock test · ${formatSubjectName(mod.section)}`}
        title={`Questions for ${mod.title}`}
        onBack={handleBack}
        backLabel="Back to the mock test"
        status={`${selectedIds.size} selected`}
      >
        {tab === 'create' ? (
          <button type="submit" form="module-create-form" className={editorPrimaryButtonClass}>
            <Plus className="w-4 h-4" />
            Create &amp; add
          </button>
        ) : (
          <button type="button" onClick={applySelection} className={editorPrimaryButtonClass}>
            <CheckCircle2 className="w-4 h-4" />
            Use {selectedIds.size} question{selectedIds.size === 1 ? '' : 's'}
          </button>
        )}
      </EditorTopBar>

      <div className="px-4 sm:px-6 pt-4 max-w-5xl mx-auto w-full space-y-3">
        <div
          role="tablist"
          aria-label="How to add questions"
          className="inline-flex gap-1 p-1 rounded-xl bg-[#F1F8F7] border border-[#E2E8F0]"
        >
          {tabButton('existing', 'From existing', pool.length)}
          {tabButton('create', 'Create new')}
        </div>

        {createdCodes.length > 0 && (
          <p
            role="status"
            className="flex items-start gap-2 text-[12px] text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5"
          >
            <CheckCircle2 className="w-4 h-4 mt-px shrink-0" />
            <span>
              Added{' '}
              {createdCodes.map((code, i) => (
                <span key={code}>
                  {i > 0 && ', '}
                  <span className="font-mono font-semibold">{code}</span>
                </span>
              ))}{' '}
              to the question bank and selected {createdCodes.length === 1 ? 'it' : 'them'} for this
              module.
            </span>
          </p>
        )}
      </div>

      {tab === 'create' ? (
        <EditorPanes
          form={
            <form id="module-create-form" onSubmit={handleCreate} className="space-y-4">
              <p className="text-[13px] text-[#58708A] leading-relaxed">
                Saves to the bank and auto-selects for this module — keep writing to add more without leaving.
              </p>
              <QuestionFormFields ctl={createCtl} variant="full" />
            </form>
          }
          preview={
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#58708A]">
                <Eye className="w-4 h-4" />
                <span>Student preview</span>
              </div>
              <QuestionPreview ctl={createCtl} />
            </div>
          }
        />
      ) : (
        listPane
      )}
    </div>
  );
};
