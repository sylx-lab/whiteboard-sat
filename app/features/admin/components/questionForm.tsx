'use client';

import React, { useState } from 'react';
import { Question, Subject, Domain, Difficulty, QuestionStatus, AnswerChoice } from '../../../types';
import { MathTextEditor } from '../../../components/MathTextEditor';
import { MathRenderer } from '../../../components/MathRenderer';
import { domainsForSubject, formatDomainName } from '../../../lib/utils';
import { suggestQuestionCode, findCodeConflict, distinctValues } from '../lib/questionCodes';
import {
  Database,
  ListChecks,
  Lightbulb,
  Plus,
  FileText,
  AlertTriangle,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import { EditorSection, Field, inputClass } from './EditorShell';

/**
 * One definition of "what a question form is", shared by the full-page editor and
 * the compact create-new form inside the mock test question picker. Keeping the
 * fields in one place is what stops the two from drifting apart.
 */

export const CHOICE_IDS = ['A', 'B', 'C', 'D'] as const;
export type ChoiceId = (typeof CHOICE_IDS)[number];

export interface QuestionFormState {
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

/** A new question starts empty; placeholders carry the guidance. */
export const blankQuestionForm = (subject: Subject = 'math'): QuestionFormState => ({
  code: '',
  subject,
  domain: domainsForSubject(subject)[0],
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

export const questionFormFromQuestion = (q: Question): QuestionFormState => {
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

export interface QuestionFormController {
  form: QuestionFormState;
  update: (patch: Partial<QuestionFormState>) => void;
  isDirty: boolean;
  markSaved: () => void;
  reset: (keepCategory?: boolean) => void;
  buildPayload: () => Record<string, unknown>;
  suggestedCode: string;
  codeConflict: Question | undefined;
  topicOptions: string[];
  subtopicOptions: string[];
  sourceOptions: string[];
  showPassage: boolean;
  setShowPassage: (show: boolean) => void;
  /** Set when the subject is fixed by context (a mock test module's section). */
  lockedSubject?: Subject;
  /** Suffix that keeps datalist ids unique when two forms are mounted at once. */
  idScope: string;
}

export function useQuestionForm(opts: {
  initialQuestion?: Question | null;
  allQuestions: Question[];
  lockedSubject?: Subject;
  idScope?: string;
}): QuestionFormController {
  const { initialQuestion, allQuestions, lockedSubject, idScope = 'q' } = opts;

  const [form, setForm] = useState<QuestionFormState>(() =>
    initialQuestion
      ? questionFormFromQuestion(initialQuestion)
      : blankQuestionForm(lockedSubject ?? 'math')
  );
  const [isDirty, setIsDirty] = useState(false);
  // Reading & Writing questions almost always carry a passage; Math rarely does,
  // so the section is opt-in there rather than empty clutter.
  const [showPassage, setShowPassage] = useState(
    Boolean(initialQuestion?.stimulus) ||
      (initialQuestion?.subject ?? lockedSubject ?? 'math') === 'reading_writing'
  );

  const update = (patch: Partial<QuestionFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const suggestedCode = suggestQuestionCode(form.domain, allQuestions);
  const codeConflict = findCodeConflict(form.code, allQuestions, initialQuestion?.id);

  // Topics are free text, so offer what already exists in this domain first —
  // that is what keeps the bank's categories from drifting into near-duplicates.
  const domainQuestions = allQuestions.filter((q) => q.domain === form.domain);
  const optionPool = domainQuestions.length ? domainQuestions : allQuestions;

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

  const reset = (keepCategory = false) => {
    setForm((prev) =>
      keepCategory
        ? {
            ...blankQuestionForm(prev.subject),
            // Keep the classification so a run of questions in one category stays fast.
            domain: prev.domain,
            topic: prev.topic,
            subtopic: prev.subtopic,
            source: prev.source,
            difficulty: prev.difficulty,
            status: prev.status,
            isFree: prev.isFree,
          }
        : blankQuestionForm(lockedSubject ?? prev.subject)
    );
    setIsDirty(false);
  };

  return {
    form,
    update,
    isDirty,
    markSaved: () => setIsDirty(false),
    reset,
    buildPayload,
    suggestedCode,
    codeConflict,
    topicOptions: distinctValues(optionPool, 'topic'),
    subtopicOptions: distinctValues(optionPool, 'subtopic'),
    sourceOptions: distinctValues(allQuestions, 'source'),
    showPassage,
    setShowPassage,
    lockedSubject,
    idScope,
  };
}

/** Native datalists — typing still allows a brand-new value. */
export const QuestionDatalists: React.FC<{ ctl: QuestionFormController }> = ({ ctl }) => (
  <>
    <datalist id={`topic-options-${ctl.idScope}`}>
      {ctl.topicOptions.map((t) => (
        <option key={t} value={t} />
      ))}
    </datalist>
    <datalist id={`subtopic-options-${ctl.idScope}`}>
      {ctl.subtopicOptions.map((t) => (
        <option key={t} value={t} />
      ))}
    </datalist>
    <datalist id={`source-options-${ctl.idScope}`}>
      {ctl.sourceOptions.map((t) => (
        <option key={t} value={t} />
      ))}
    </datalist>
  </>
);

/**
 * `full` is the standalone editor page. `compact` drops the fields that context
 * already answers (subject, code, subtopic, source) so the create-new form inside
 * the picker stays short.
 */
export const QuestionFormFields: React.FC<{
  ctl: QuestionFormController;
  variant?: 'full' | 'compact';
}> = ({ ctl, variant = 'full' }) => {
  const { form, update, suggestedCode, codeConflict, showPassage, setShowPassage, idScope } = ctl;
  const isFull = variant === 'full';

  return (
    <>
      <QuestionDatalists ctl={ctl} />

      <EditorSection icon={Database} title="Category">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isFull && (
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
          )}

          <Field label="Domain" className={isFull ? undefined : 'sm:col-span-2'}>
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
            hint={ctl.topicOptions.length ? 'Pick an existing topic to keep categories tidy' : undefined}
            className={isFull ? undefined : 'sm:col-span-2'}
          >
            <input
              type="text"
              required
              list={`topic-options-${idScope}`}
              value={form.topic}
              onChange={(e) => update({ topic: e.target.value })}
              placeholder="Linear Equations"
              className={inputClass}
            />
          </Field>

          {isFull && (
            <>
              <Field label="Subtopic" hint="Optional">
                <input
                  type="text"
                  list={`subtopic-options-${idScope}`}
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
            </>
          )}
        </div>

        {!isFull && (
          <p className="text-[11px] text-[#58708A]">
            Will be saved as <span className="font-mono text-[#071126]">{suggestedCode}</span>.
          </p>
        )}

        {isFull && codeConflict && (
          <p className="flex items-start gap-2 text-[12px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 mt-px shrink-0" />
            <span>
              <span className="font-mono font-semibold">{codeConflict.code}</span> is already used by a{' '}
              {formatDomainName(codeConflict.domain)} question ({codeConflict.topic}). Two questions
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
            rows={isFull ? 6 : 4}
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
          rows={isFull ? 4 : 3}
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
                    name={`correct-answer-${idScope}`}
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
                  onChange={(e) => update({ choices: { ...form.choices, [id]: e.target.value } })}
                  placeholder={`Choice ${id}`}
                  aria-label={`Choice ${id} text`}
                  className="flex-1 min-w-0 min-h-9 px-3 py-2 field-sizing-content bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] font-mono text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors resize-y"
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
          rows={isFull ? 4 : 3}
        />
      </EditorSection>

      <EditorSection icon={Settings2} title="Publishing">
        <div className={`grid grid-cols-1 gap-3 ${isFull ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
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

          {isFull && (
            <>
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
                  list={`source-options-${idScope}`}
                  value={form.source}
                  onChange={(e) => update({ source: e.target.value })}
                  placeholder="White Board Official Bank"
                  className={inputClass}
                />
              </Field>
            </>
          )}
        </div>
      </EditorSection>
    </>
  );
};

/** The student-facing render of the in-progress form. Shared by the editor pane and
 *  the picker's create-new tab, because seeing `$…$` resolve is the whole point. */
export const QuestionPreview: React.FC<{ ctl: QuestionFormController; compact?: boolean }> = ({
  ctl,
  compact = false,
}) => {
  const { form, suggestedCode } = ctl;

  return (
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
        <div
          className={`text-[13px] text-[#071126] leading-relaxed p-3.5 rounded-xl bg-[#F8FBFB] border border-[#E2E8F0] overflow-y-auto ${
            compact ? 'max-h-32' : 'max-h-64'
          }`}
        >
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
              <div className="min-w-0">
                {form.choices[id] ? (
                  <MathRenderer inline content={form.choices[id]} />
                ) : (
                  <span className="text-[#58708A]">Choice {id}</span>
                )}
              </div>
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
  );
};
