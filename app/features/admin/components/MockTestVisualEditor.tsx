'use client';

import React, { useMemo, useState } from 'react';
import { MockTest, MockTestModule, Question, Difficulty, Subject } from '../../../types';
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
  onSave: (testData: Record<string, unknown>) => void;
  /** Adds a question to the bank and returns it, so the picker can author one inline. */
  onCreateQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
}

interface FormState {
  title: string;
  description: string;
  difficulty: Difficulty;
  isFree: boolean;
}

const blankForm = (): FormState => ({
  title: '',
  description: '',
  difficulty: 'medium',
  isFree: false,
});

export const MockTestVisualEditor: React.FC<MockTestVisualEditorProps> = ({
  initialTest,
  allQuestions,
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
    onSave({
      id: initialTest?.id,
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty,
      is_free: form.isFree,
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
                  <Pill tone={form.isFree ? 'neutral' : 'brand'}>
                    {form.isFree ? 'Free diagnostic' : 'Premium'}
                  </Pill>
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
  onCreateQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
  onBack: () => void;
  onConfirm: (questions: Question[]) => void;
}> = ({ module: mod, allQuestions, onCreateQuestion, onBack, onConfirm }) => {
  const [tab, setTab] = useState<'existing' | 'create'>('existing');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(mod.questions.map((q) => q.id))
  );
  const [createdCodes, setCreatedCodes] = useState<string[]>([]);

  // A new question must land in this module's section, so the subject is fixed.
  const createCtl = useQuestionForm({
    allQuestions,
    lockedSubject: mod.section,
    idScope: 'module-picker',
  });

  const pool = useMemo(() => eligibleQuestions(allQuestions, mod.section), [allQuestions, mod.section]);

  const filtered = useMemo(() => {
    if (!search.trim()) return pool;
    const match = search.toLowerCase();
    return pool.filter(
      (q) =>
        q.code.toLowerCase().includes(match) ||
        q.topic.toLowerCase().includes(match) ||
        q.question_text.toLowerCase().includes(match)
    );
  }, [pool, search]);

  const sections = useMemo(() => groupQuestions(filtered, 'domain'), [filtered]);

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = onCreateQuestion(
      createCtl.buildPayload() as unknown as Omit<Question, 'id' | 'created_at' | 'updated_at'>
    );
    // Select it and hand back a blank form in the same category, so several
    // questions can be authored in a row without leaving the screen.
    setSelectedIds((prev) => new Set(prev).add(created.id));
    setCreatedCodes((prev) => [...prev, created.code]);
    createCtl.reset(true);
  };

  const applySelection = () => {
    // Keep bank order so a module's question sequence is stable and predictable.
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
      <div className="relative max-w-md">
        <label className="sr-only" htmlFor="picker-search">
          Search questions
        </label>
        <Search className="w-4 h-4 text-[#58708A] absolute left-3 top-3 pointer-events-none" />
        <input
          id="picker-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Code, topic, or question text…"
          className="w-full h-10 pl-9 pr-3 bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors"
        />
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
            description={`Nothing in this section matches “${search}”.`}
            action={{ label: 'Clear search', onClick: () => setSearch('') }}
          />
        </div>
      ) : (
        sections.map((section) =>
          section.groups.map((group) => (
            // min-w-0: a fieldset defaults to min-inline-size:min-content, which
            // refuses to shrink and pushes long question text past its container.
            <fieldset key={group.key} className="space-y-2 min-w-0">
              <legend className="text-[13px] font-bold text-[#071126] pb-1">
                {group.label}
                <span className="text-[#58708A] font-normal"> · {group.questions.length}</span>
              </legend>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {group.questions.map((q) => {
                  const isSelected = selectedIds.has(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors min-w-0 ${
                        isSelected
                          ? 'bg-[#F1F8F7] border-[#0D918A]'
                          : 'bg-white border-[#E2E8F0] hover:bg-[#F8FBFB]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(q.id)}
                        className="mt-0.5 w-4 h-4 shrink-0 accent-[#0D918A]"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-mono font-semibold text-[#58708A]">{q.code}</span>
                          <span className="text-[13px] font-medium text-[#071126]">{q.topic}</span>
                          <DifficultyDot difficulty={q.difficulty} />
                          {q.stimulus && <span className="text-[#58708A]">passage</span>}
                        </div>
                        <div className="text-[12px] text-[#58708A] line-clamp-2">
                          <MathRenderer inline content={q.question_text} />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))
        )
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
                This saves a real {formatSubjectName(mod.section)} question to the bank, so it can be
                reused in other tests and in practice. Saving keeps the category and clears the
                content, ready for the next one.
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
