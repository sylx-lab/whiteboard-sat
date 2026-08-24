'use client';

import React, { useState } from 'react';
import { Question, Subject, Domain, Difficulty, QuestionStatus, AnswerChoice } from '../../../types';
import { MathRenderer } from '../../../components/MathRenderer';
import { MathTextEditor } from '../../../components/MathTextEditor';
import { domainsForSubject, formatDomainName } from '../../../lib/utils';
import {
  suggestQuestionCode,
  findCodeConflict,
  distinctValues,
} from '../lib/questionCodes';
import {
  Database,
  Eye,
  CheckCircle2,
  ListChecks,
  Lightbulb,
  Plus,
  FileText,
  AlertTriangle,
  Settings2,
} from 'lucide-react';
import { EditorShell, EditorPanes, EditorSection, Field, inputClass } from './EditorShell';
import { Pill } from './ui';

interface QuestionVisualEditorProps {
  initialQuestion?: Question | null;
  /** The rest of the bank — powers code suggestions, duplicate warnings, and datalists. */
  allQuestions: Question[];
  onSave: (questionData: Record<string, unknown>) => void;
  /** Save and reset the form for the next question — used when authoring in bulk. */
  onSaveAndNew?: (questionData: Record<string, unknown>) => void;
}

const CHOICE_IDS = ['A', 'B', 'C', 'D'] as const;
type ChoiceId = (typeof CHOICE_IDS)[number];

interface FormState {
  code: string;
  subject: Subject;
  domain: Domain;
  topic: string;
  subtopic: string;
  source: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  isFree: boolean;
  stimulus: string;
  questionText: string;
  choices: Record<ChoiceId, string>;
  correctAnswer: ChoiceId;
  explanation: string;
}

/**
 * A new question starts empty. Placeholders carry the guidance instead of
 * pre-filled sample content, so nothing dummy can be saved by accident.
 */
const blankForm = (): FormState => ({
  code: '',
  subject: 'math',
  domain: 'algebra',
  topic: '',
  subtopic: '',
  source: '',
  difficulty: 'medium',
  status: 'published',
  isFree: true,
  stimulus: '',
  questionText: '',
  choices: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  explanation: '',
});

const formFromQuestion = (q: Question): FormState => {
  const existing = q.choices || q.answer_choices || [];
  const byId = (id: ChoiceId) => existing.find((c) => c.id === id)?.text || '';
  return {
    code: q.code,
    subject: q.subject,
    domain: q.domain,
    topic: q.topic,
    subtopic: q.subtopic || '',
    source: q.source || '',
    difficulty: q.difficulty,
    status: q.status || 'published',
    isFree: q.is_free,
    stimulus: q.stimulus || '',
    questionText: q.question_text,
    choices: { A: byId('A'), B: byId('B'), C: byId('C'), D: byId('D') },
    correctAnswer: q.correct_answer,
    explanation: q.explanation || '',
  };
};

export const QuestionVisualEditor: React.FC<QuestionVisualEditorProps> = ({
  initialQuestion,
  allQuestions,
  onSave,
  onSaveAndNew,
}) => {
  const [form, setForm] = useState<FormState>(() =>
    initialQuestion ? formFromQuestion(initialQuestion) : blankForm()
  );
  const [isDirty, setIsDirty] = useState(false);
  // Reading & Writing questions almost always carry a passage; Math rarely does,
  // so the section is opt-in there rather than empty clutter.
  const [showPassage, setShowPassage] = useState(
    Boolean(initialQuestion?.stimulus) || (initialQuestion?.subject ?? 'math') === 'reading_writing'
  );

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const setChoice = (id: ChoiceId, text: string) =>
    update({ choices: { ...form.choices, [id]: text } });

  const suggestedCode = suggestQuestionCode(form.domain, allQuestions);
  const codeConflict = findCodeConflict(form.code, allQuestions, initialQuestion?.id);

  // Topics are free text, so offer what already exists in this domain first —
  // that is what keeps the bank's categories from drifting into near-duplicates.
  const domainQuestions = allQuestions.filter((q) => q.domain === form.domain);
  const topicOptions = distinctValues(
    domainQuestions.length ? domainQuestions : allQuestions,
    'topic'
  );
  const subtopicOptions = distinctValues(
    domainQuestions.length ? domainQuestions : allQuestions,
    'subtopic'
  );
  const sourceOptions = distinctValues(allQuestions, 'source');

  const buildPayload = () => {
    const choicesPayload: AnswerChoice[] = CHOICE_IDS.map((id) => ({
      id,
      text: form.choices[id].trim(),
    }));
    const stimulus = form.stimulus.trim();

    return {
      id: initialQuestion?.id,
      // Fall back to the suggested code so a blank field never produces an unlabelled question.
      code: form.code.trim() || suggestedCode,
      subject: form.subject,
      section: form.subject === 'math' ? 'Math' : 'Reading & Writing',
      domain: form.domain,
      topic: form.topic.trim(),
      subtopic: form.subtopic.trim(),
      source: form.source.trim() || 'White Board Official Bank',
      difficulty: form.difficulty,
      status: form.status,
      is_free: form.isFree,
      stimulus: stimulus || undefined,
      question_text: form.questionText.trim(),
      choices: choicesPayload,
      answer_choices: choicesPayload,
      correct_answer: form.correctAnswer,
      explanation: form.explanation.trim(),
      hasMath: /\$/.test(form.questionText),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    onSave(buildPayload());
  };

  const handleSaveAndNew = () => {
    // The form owns validation; check it here too so this path cannot skip it.
    const formEl = document.getElementById('question-form') as HTMLFormElement | null;
    if (formEl && !formEl.reportValidity()) return;
    onSaveAndNew?.(buildPayload());
    // Keep the classification so a run of questions in one category stays fast to enter.
    setForm((prev) => ({
      ...blankForm(),
      subject: prev.subject,
      domain: prev.domain,
      topic: prev.topic,
      subtopic: prev.subtopic,
      source: prev.source,
      difficulty: prev.difficulty,
      status: prev.status,
      isFree: prev.isFree,
    }));
    setIsDirty(false);
  };

  return (
    <EditorShell
      eyebrow="Question bank"
      title={initialQuestion ? `Edit ${initialQuestion.code}` : 'New question'}
      backTab="questions"
      formId="question-form"
      saveLabel={initialQuestion ? 'Save changes' : 'Save question'}
      isDirty={isDirty}
      secondaryAction={
        !initialQuestion && onSaveAndNew
          ? { label: 'Save & add another', icon: Plus, onClick: handleSaveAndNew }
          : undefined
      }
    >
      {/* Native datalists — typing still allows a brand-new value. */}
      <datalist id="topic-options">
        {topicOptions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <datalist id="subtopic-options">
        {subtopicOptions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <datalist id="source-options">
        {sourceOptions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <EditorPanes
        form={
          <form id="question-form" onSubmit={handleSubmit} className="space-y-4">
            <EditorSection icon={Database} title="Category">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Subject">
                  <select
                    value={form.subject}
                    onChange={(e) => {
                      const subject = e.target.value as Subject;
                      update({ subject, domain: domainsForSubject(subject)[0] });
                      if (subject === 'reading_writing') setShowPassage(true);
                    }}
                    className={inputClass}
                  >
                    <option value="math">Math</option>
                    <option value="reading_writing">Reading &amp; Writing</option>
                  </select>
                </Field>

                <Field label="Domain">
                  <select
                    value={form.domain}
                    onChange={(e) => update({ domain: e.target.value as Domain })}
                    className={inputClass}
                  >
                    {domainsForSubject(form.subject).map((d) => (
                      <option key={d} value={d}>
                        {formatDomainName(d)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Topic"
                  hint={topicOptions.length ? 'Pick an existing topic to keep categories tidy' : undefined}
                >
                  <input
                    type="text"
                    required
                    list="topic-options"
                    value={form.topic}
                    onChange={(e) => update({ topic: e.target.value })}
                    placeholder="Linear Equations"
                    className={inputClass}
                  />
                </Field>

                <Field label="Subtopic" hint="Optional">
                  <input
                    type="text"
                    list="subtopic-options"
                    value={form.subtopic}
                    onChange={(e) => update({ subtopic: e.target.value })}
                    placeholder="Solving Systems"
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Question code"
                  hint={form.code.trim() ? undefined : `Left blank, this becomes ${suggestedCode}`}
                  className="sm:col-span-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list={undefined}
                      value={form.code}
                      onChange={(e) => update({ code: e.target.value })}
                      placeholder={suggestedCode}
                      aria-invalid={Boolean(codeConflict)}
                      className={`${inputClass} font-mono`}
                    />
                    {form.code.trim() !== suggestedCode && (
                      <button
                        type="button"
                        onClick={() => update({ code: suggestedCode })}
                        title={`Use the next free code, ${suggestedCode}`}
                        className="h-10 px-3 shrink-0 bg-white hover:bg-[#F1F8F7] border border-[#E2E8F0] rounded-[10px] text-[12px] font-semibold text-[#071126] transition-colors cursor-pointer"
                      >
                        Next free
                      </button>
                    )}
                  </div>
                </Field>
              </div>

              {codeConflict && (
                <p className="flex items-start gap-2 text-[12px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 mt-px shrink-0" />
                  <span>
                    <span className="font-mono font-semibold">{codeConflict.code}</span> is already used by
                    a {formatDomainName(codeConflict.domain)} question ({codeConflict.topic}). Two questions
                    sharing a code makes attempt history ambiguous.
                  </span>
                </p>
              )}
            </EditorSection>

            {showPassage ? (
              <EditorSection icon={FileText} title="Passage / stimulus" hint="Shown above the question">
                <MathTextEditor
                  ariaLabel="Passage or stimulus"
                  value={form.stimulus}
                  onChange={(v) => update({ stimulus: v })}
                  placeholder="Paste the reading passage, data description, or context the question refers to."
                  rows={6}
                />
                {!form.stimulus.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowPassage(false)}
                    className="text-[12px] font-medium text-[#58708A] hover:text-[#071126] transition-colors cursor-pointer"
                  >
                    Remove passage section
                  </button>
                )}
              </EditorSection>
            ) : (
              <button
                type="button"
                onClick={() => setShowPassage(true)}
                className="w-full h-10 rounded-2xl border border-dashed border-[#E2E8F0] bg-white hover:bg-[#F8FBFB] text-[12px] font-semibold text-[#58708A] hover:text-[#071126] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add a passage or stimulus
              </button>
            )}

            <EditorSection title="Question" hint="Wrap math in $…$">
              <MathTextEditor
                ariaLabel="Question text"
                required
                value={form.questionText}
                onChange={(v) => update({ questionText: v })}
                placeholder="If $3x - 7 = 14$, what is the value of $x$?"
                rows={4}
              />
            </EditorSection>

            <EditorSection icon={ListChecks} title="Answer choices" hint="Select the correct one">
              <div className="space-y-2">
                {CHOICE_IDS.map((id) => {
                  const isCorrect = form.correctAnswer === id;
                  return (
                    <div
                      key={id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                        isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-[#F8FBFB] border-[#E2E8F0]'
                      }`}
                    >
                      {/* Native radio: keyboard-navigable and announced as a group. */}
                      <label
                        className="shrink-0 cursor-pointer mt-0.5"
                        title={`Mark choice ${id} as the correct answer`}
                      >
                        <input
                          type="radio"
                          name="correct-answer"
                          value={id}
                          checked={isCorrect}
                          onChange={() => update({ correctAnswer: id })}
                          className="sr-only peer"
                        />
                        <span
                          className={`w-7 h-7 rounded-full grid place-items-center text-[12px] font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#0D918A] peer-focus-visible:ring-offset-1 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-[#58708A] border border-[#E2E8F0]'
                          }`}
                        >
                          {id}
                        </span>
                      </label>

                      {/* Textarea, not input: verbal choices run long. `field-sizing-content`
                          grows it to fit where supported, and it stays drag-resizable elsewhere. */}
                      <textarea
                        rows={1}
                        required
                        value={form.choices[id]}
                        onChange={(e) => setChoice(id, e.target.value)}
                        placeholder={`Choice ${id}`}
                        aria-label={`Choice ${id} text`}
                        className="flex-1 min-h-9 px-3 py-2 field-sizing-content bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] font-mono text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors resize-y"
                      />

                      {isCorrect && (
                        <span className="text-[11px] font-semibold text-emerald-700 shrink-0 hidden sm:inline mt-1.5">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </EditorSection>

            <EditorSection icon={Lightbulb} title="Explanation" hint="Shown after a student answers">
              <MathTextEditor
                ariaLabel="Explanation"
                required
                value={form.explanation}
                onChange={(v) => update({ explanation: v })}
                placeholder="Add 7 to both sides: $3x = 21$. Divide by 3: $x = 7$."
                rows={4}
              />
            </EditorSection>

            <EditorSection icon={Settings2} title="Publishing">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <option value="free">Free</option>
                    <option value="premium">Premium only</option>
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update({ status: e.target.value as QuestionStatus })}
                    className={inputClass}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>

                <Field label="Source" hint="Where this question came from" className="sm:col-span-3">
                  <input
                    type="text"
                    list="source-options"
                    value={form.source}
                    onChange={(e) => update({ source: e.target.value })}
                    placeholder="White Board Official Bank"
                    className={inputClass}
                  />
                </Field>
              </div>
            </EditorSection>
          </form>
        }
        preview={
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#58708A]">
                <Eye className="w-4 h-4" />
                <span>Student preview</span>
              </div>
              {form.status !== 'published' && <Pill tone="warning">{form.status}</Pill>}
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="font-mono font-semibold text-[#087C76]">
                  {form.code.trim() || suggestedCode}
                  {form.topic && <span className="text-[#58708A]"> · {form.topic}</span>}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F1F8F7] text-[#58708A] text-[11px] font-semibold">
                  {form.difficulty}
                </span>
              </div>

              {form.stimulus.trim() && (
                <div className="text-[13px] text-[#071126] leading-relaxed p-3.5 rounded-xl bg-[#F8FBFB] border border-[#E2E8F0] max-h-64 overflow-y-auto">
                  <MathRenderer content={form.stimulus} />
                </div>
              )}

              <div className="text-[14px] text-[#071126] leading-relaxed">
                {form.questionText ? (
                  <MathRenderer content={form.questionText} />
                ) : (
                  <span className="text-[#58708A]">The question text will appear here.</span>
                )}
              </div>

              <div className="space-y-2">
                {CHOICE_IDS.map((id) => {
                  const isCorrect = id === form.correctAnswer;
                  return (
                    <div
                      key={id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-[13px] ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-[#E2E8F0] text-[#071126]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-mono font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-[#F1F8F7] text-[#58708A]'
                        }`}
                      >
                        {id}
                      </span>
                      {form.choices[id] ? (
                        <MathRenderer inline content={form.choices[id]} />
                      ) : (
                        <span className="text-[#58708A]">Choice {id}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F1F8F7] border border-[#E2E8F0] text-[13px] space-y-1">
                <div className="font-semibold text-[#087C76] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Explanation
                </div>
                <div className="text-[#071126] leading-relaxed">
                  {form.explanation ? (
                    <MathRenderer content={form.explanation} />
                  ) : (
                    <span className="text-[#58708A]">The step-by-step solution will appear here.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />
    </EditorShell>
  );
};
