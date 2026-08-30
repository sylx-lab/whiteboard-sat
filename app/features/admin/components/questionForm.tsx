'use client';

import React, { useState } from 'react';
import { Question, Subject, Domain, Difficulty, QuestionStatus, AnswerChoice, QuestionType } from '../../../types';
import { isSprQuestion } from '../../../lib/spr';
import { VisualMathEditor } from '../../../components/VisualMathEditor';
import { MathRenderer } from '../../../components/MathRenderer';
import { domainsForSubject, formatDomainName, formatSubjectName } from '../../../lib/utils';
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
import { UploadButton, ACCEPT } from './ui';

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
  imageUrl: string;
  questionText: string;
  questionType: QuestionType;
  choices: Record<ChoiceId, string>;
  choiceImages: Record<ChoiceId, string>;
  correctAnswer: ChoiceId | string;
  sprAnswer: string;
  explanation: string;
  explanationYoutubeUrl: string;
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
  imageUrl: '',
  questionText: '',
  questionType: 'mcq',
  choices: { A: '', B: '', C: '', D: '' },
  choiceImages: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  sprAnswer: '',
  explanation: '',
  explanationYoutubeUrl: '',
});

export const questionFormFromQuestion = (q: Question): QuestionFormState => {
  const isSpr = isSprQuestion(q);
  const existing = q.choices || q.answer_choices || [];
  const byId = (id: ChoiceId) => existing.find((c) => c.id === id)?.text || '';
  const byImage = (id: ChoiceId) => existing.find((c) => c.id === id)?.imageUrl || '';
  const correct = String(q.correct_answer ?? '');
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
    imageUrl: q.imageUrl || '',
    questionText: q.question_text,
    questionType: isSpr ? 'spr' : (q.questionType ?? 'mcq'),
    choices: { A: byId('A'), B: byId('B'), C: byId('C'), D: byId('D') },
    choiceImages: { A: byImage('A'), B: byImage('B'), C: byImage('C'), D: byImage('D') },
    correctAnswer: isSpr ? correct : (correct as ChoiceId) || 'A',
    sprAnswer: isSpr ? correct : '',
    explanation: q.explanation || '',
    explanationYoutubeUrl: q.explanation_resource_link || '',
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
  initialQuestion?: Question | null;
  /** Suffix that keeps datalist ids unique when two forms are mounted at once. */
  idScope: string;
}

export function useQuestionForm(opts: {
  initialQuestion?: Question | null;
  allQuestions: Question[];
  lockedSubject?: Subject;
  /** Pre-fills a new question, e.g. the category the author is adding into. */
  seed?: Partial<QuestionFormState>;
  idScope?: string;
}): QuestionFormController {
  const { initialQuestion, allQuestions, lockedSubject, seed, idScope = 'q' } = opts;

  const [form, setForm] = useState<QuestionFormState>(() =>
    initialQuestion
      ? questionFormFromQuestion(initialQuestion)
      : { ...blankQuestionForm(seed?.subject ?? lockedSubject ?? 'math'), ...seed }
  );
  const [isDirty, setIsDirty] = useState(false);
  // Reading & Writing questions almost always carry a passage; Math rarely does,
  // so the section is opt-in there rather than empty clutter.
  const [showPassage, setShowPassage] = useState(
    Boolean(initialQuestion?.stimulus) ||
      (initialQuestion?.subject ?? seed?.subject ?? lockedSubject ?? 'math') === 'reading_writing'
  );

  const update = (patch: Partial<QuestionFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const suggestedCode = suggestQuestionCode(form.domain, allQuestions);
  const codeConflict = findCodeConflict(initialQuestion?.code || suggestedCode, allQuestions, initialQuestion?.id);

  // Topics are free text, so offer what already exists in this domain first —
  // that is what keeps the bank's categories from drifting into near-duplicates.
  const domainQuestions = allQuestions.filter((q) => q.domain === form.domain);
  const optionPool = domainQuestions.length ? domainQuestions : allQuestions;

  const buildPayload = () => {
    const isSpr = form.questionType === 'spr';
    const choicesPayload: AnswerChoice[] = isSpr
      ? []
      : CHOICE_IDS.map((id) => ({
          id,
          text: form.choices[id].trim(),
          imageUrl: form.choiceImages[id]?.trim() || undefined,
        }));
    const stimulus = form.stimulus.trim();
    const youtubeUrl = form.explanationYoutubeUrl.trim();

    return {
      id: initialQuestion?.id,
      // Fully auto-generated code for new questions, preserved code for edited questions.
      code: initialQuestion?.code || suggestedCode,
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
      imageUrl: form.imageUrl.trim() || undefined,
      question_text: form.questionText.trim(),
      questionType: isSpr ? 'spr' : 'mcq',
      choices: choicesPayload,
      answer_choices: choicesPayload,
      correct_answer: isSpr ? form.sprAnswer.trim() : (form.correctAnswer as string),
      explanation: form.explanation.trim(),
      explanation_resource_link: youtubeUrl || undefined,
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
        : { ...blankQuestionForm(seed?.subject ?? lockedSubject ?? prev.subject), ...seed }
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
    initialQuestion,
    idScope,
  };
}

/** Native datalists — typing still allows a brand-new value (freeform / creatable). */
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
      {ctl.sourceOptions.map((s) => (
        <option key={s} value={s} />
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
          {isFull &&
            (ctl.lockedSubject ? (
              <Field label="Subject" hint="Set by the module you are adding to">
                <div
                  className={`${inputClass} flex items-center bg-[#F8FBFB] text-[#58708A] cursor-not-allowed`}
                >
                  {formatSubjectName(form.subject)}
                </div>
              </Field>
            ) : (
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
            ))}

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
          )}

          <Field
            label="Source"
            hint={
              ctl.sourceOptions.length
                ? 'Pick College Panda etc. or type a new source — it will be created on save'
                : 'e.g. College Panda — new sources are created automatically'
            }
            className="sm:col-span-2"
          >
            <input
              type="text"
              list={`source-options-${idScope}`}
              value={form.source}
              onChange={(e) => update({ source: e.target.value })}
              placeholder="College Panda, White Board Official Bank, Previous year..."
              className={inputClass}
            />
            {form.source.trim() && !ctl.sourceOptions.includes(form.source.trim()) && (
              <p className="text-[11px] text-[#087C76] font-medium">New source “{form.source.trim()}” will be created</p>
            )}
          </Field>

          <div className="sm:col-span-2 flex items-center justify-between p-3 bg-[#F8FBFB] border border-[#E2E8F0] rounded-xl text-[12px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#071126]">Question Code</span>
              <span className="text-[11px] text-[#58708A]">(Auto-generated)</span>
            </div>
            <span className="font-mono font-bold text-[#087C76] bg-white px-2.5 py-1 rounded-lg border border-[#D5E5E3]">
              {ctl.initialQuestion?.code || suggestedCode}
            </span>
          </div>
        </div>
      </EditorSection>

      {showPassage ? (
        <EditorSection icon={FileText} title="Passage / stimulus" hint="Shown above the question">
          <VisualMathEditor
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
        <VisualMathEditor
          ariaLabel="Question text"
          required
          value={form.questionText}
          onChange={(v) => update({ questionText: v })}
          placeholder="If $3x - 7 = 14$, what is the value of $x$?"
          rows={isFull ? 4 : 3}
        />

        {form.imageUrl ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FBFB] p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- an R2 URL, not a build-time asset */}
            <img
              src={form.imageUrl}
              alt="Question figure"
              className="h-16 w-auto rounded-lg border border-[#E2E8F0] bg-white object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#071126]">Figure attached</p>
              <p className="text-[11px] text-[#58708A] font-mono truncate">{form.imageUrl}</p>
            </div>
            <button
              type="button"
              onClick={() => update({ imageUrl: '' })}
              className="text-[12px] font-semibold text-[#58708A] hover:text-red-600 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <UploadButton
            folder="questions"
            accept={ACCEPT.image}
            label="Add a figure"
            onUploaded={(url) => update({ imageUrl: url })}
          />
        )}
      </EditorSection>

      <EditorSection icon={ListChecks} title="Answer" hint={form.questionType === 'spr' ? 'Grid-in — student types a number (integer, decimal, or fraction)' : 'Multiple choice — select the correct one'}>
        {/* Type toggle — SPR is Math grid-in; kept visible for both subjects but defaults to mcq */}
        <div className="flex items-center gap-2 p-1 bg-[#F8FBFB] border border-[#E2E8F0] rounded-xl w-fit">
          <button
            type="button"
            onClick={() => update({ questionType: 'mcq' })}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${form.questionType === 'mcq' ? 'bg-[#0D918A] text-white shadow-xs' : 'text-[#58708A] hover:text-[#071126]'}`}
          >
            Multiple choice (A–D)
          </button>
          <button
            type="button"
            onClick={() => update({ questionType: 'spr' })}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${form.questionType === 'spr' ? 'bg-[#0D918A] text-white shadow-xs' : 'text-[#58708A] hover:text-[#071126]'}`}
          >
            Grid-in (input box)
          </button>
        </div>

        {form.questionType === 'spr' ? (
          <Field label="Correct answer" hint="Numeric — integer, decimal, or fraction. Use | for multiple acceptable (e.g. 0.5|1/2). Equivalents like .5 and 0.50 count automatically.">
            <input
              type="text"
              required
              value={form.sprAnswer}
              onChange={(e) => update({ sprAnswer: e.target.value, correctAnswer: e.target.value })}
              placeholder="e.g. 7 or 2.5 or 3/4 or 0.5|1/2"
              className={`${inputClass} font-mono`}
            />
          </Field>
        ) : (
          <div className="space-y-3">
            {CHOICE_IDS.map((id) => {
              const isCorrect = form.correctAnswer === id;
              const hasImage = Boolean(form.choiceImages[id]);
              return (
                <div
                  key={id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                    isCorrect ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#F8FBFB] border-[#E2E8F0]'
                  }`}
                >
                  {/* Native radio: keyboard-navigable and announced as a group. */}
                  <label
                    className="shrink-0 cursor-pointer mt-1"
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
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-[#58708A] border border-[#E2E8F0]'
                      }`}
                    >
                      {id}
                    </span>
                  </label>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={1}
                        value={form.choices[id]}
                        onChange={(e) => update({ choices: { ...form.choices, [id]: e.target.value } })}
                        placeholder={`Choice ${id} text or equation… (e.g. $y = 2x + 1$)`}
                        aria-label={`Choice ${id} text`}
                        className="flex-1 min-w-0 min-h-9 px-3 py-2 field-sizing-content bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] font-mono text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors resize-y"
                      />

                      {!hasImage && (
                        <UploadButton
                          folder="questions"
                          accept={ACCEPT.image}
                          label="Add graph"
                          onUploaded={(url) =>
                            update({ choiceImages: { ...form.choiceImages, [id]: url } })
                          }
                        />
                      )}

                      {isCorrect && (
                        <span className="text-[11px] font-semibold text-emerald-700 shrink-0 hidden sm:inline mt-2">
                          Correct Answer
                        </span>
                      )}
                    </div>

                    {hasImage && (
                      <div className="flex items-center gap-3 p-2 bg-white border border-[#E2E8F0] rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.choiceImages[id]}
                          alt={`Figure for choice ${id}`}
                          className="h-14 w-auto max-w-35 rounded-lg border border-[#E2E8F0] bg-white object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-[#071126]">Option {id} Graph Attached</p>
                          <p className="text-[10px] text-[#58708A] font-mono truncate">{form.choiceImages[id]}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => update({ choiceImages: { ...form.choiceImages, [id]: '' } })}
                          className="text-[11.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer px-2 py-1 hover:bg-rose-50 rounded-lg"
                        >
                          Remove figure
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </EditorSection>

      <EditorSection icon={Lightbulb} title="Explanation" hint="Optional — shown after a student answers">
        <VisualMathEditor
          ariaLabel="Explanation"
          value={form.explanation}
          onChange={(v) => update({ explanation: v })}
          placeholder="Optional: Add 7 to both sides: $3x = 21$. Divide by 3: $x = 7$. Leave blank if you only want a video."
          rows={isFull ? 4 : 3}
        />
        <Field label="Instructor video (YouTube link)" hint="Optional — shows in the Instructor Video Breakdown after submission. Paste a YouTube watch or embed URL.">
          <input
            type="url"
            value={form.explanationYoutubeUrl}
            onChange={(e) => update({ explanationYoutubeUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
            className={`${inputClass} font-mono`}
          />
        </Field>
        {form.explanationYoutubeUrl.trim() && (() => {
          const raw = form.explanationYoutubeUrl.trim();
          const toEmbed = (() => {
            try {
              const u = new URL(raw);
              if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
              if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
              return raw;
            } catch { return raw; }
          })();
          const isEmbed = toEmbed.includes('/embed/');
          return (
            <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-black aspect-video">
              {isEmbed ? (
                <iframe src={toEmbed} title="YouTube preview" className="w-full h-full" allowFullScreen />
              ) : (
                <div className="w-full h-full grid place-items-center text-white text-[12px] p-4 text-center">
                  <a href={raw} target="_blank" rel="noreferrer" className="underline">Watch on YouTube — {raw}</a>
                </div>
              )}
            </div>
          );
        })()}
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
  const { form, suggestedCode, initialQuestion } = ctl;

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="font-mono font-semibold text-[#087C76]">
          {initialQuestion?.code || suggestedCode}
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

      {form.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- an R2 URL, not a build-time asset
        <img
          src={form.imageUrl}
          alt="Question figure"
          className="max-h-48 w-auto rounded-xl border border-[#E2E8F0] bg-white object-contain"
        />
      )}

      <div className="text-[14px] text-[#071126] leading-relaxed">
        {form.questionText ? (
          <MathRenderer content={form.questionText} />
        ) : (
          <span className="text-[#58708A]">The question text will appear here.</span>
        )}
      </div>

      {form.questionType === 'spr' ? (
        <div className="rounded-xl border-2 border-dashed border-[#0D918A]/30 bg-[#F1F8F7] p-3 flex items-center gap-3">
          <span className="px-2 py-1 rounded bg-white border border-[#E2E8F0] text-[11px] font-bold font-mono text-[#087C76]">GRID-IN</span>
          <input
            readOnly
            value={form.sprAnswer || ''}
            placeholder="Student types numeric answer"
            className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-[13px] font-mono text-[#071126] placeholder:text-[#58708A]/60"
          />
          {form.sprAnswer && <span className="text-[11px] font-semibold text-emerald-700">Correct: {form.sprAnswer}</span>}
        </div>
      ) : (
        <div className="space-y-2">
          {CHOICE_IDS.map((id) => {
            const isCorrect = id === form.correctAnswer;
            const choiceImg = form.choiceImages[id];
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
                <div className="min-w-0 flex-1 space-y-1.5">
                  {choiceImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={choiceImg}
                      alt={`Choice ${id} figure`}
                      className="max-h-32 w-auto rounded-lg border border-[#E2E8F0] bg-white object-contain p-1"
                    />
                  )}
                  {form.choices[id] ? (
                    <MathRenderer inline content={form.choices[id]} />
                  ) : (
                    !choiceImg && <span className="text-[#58708A]">Choice {id}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
      {form.explanationYoutubeUrl.trim() && (
        <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-black aspect-video">
          {(() => {
            const raw = form.explanationYoutubeUrl.trim();
            try {
              const u = new URL(raw);
              let embed: string | null = null;
              if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) embed = `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
              else if (u.hostname === 'youtu.be') embed = `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
              else if (u.pathname.includes('/embed/')) embed = raw;
              if (embed) return <iframe src={embed} title="YouTube preview" className="w-full h-full" allowFullScreen />;
            } catch {}
            return (
              <a href={raw} target="_blank" rel="noreferrer" className="w-full h-full grid place-items-center text-white text-[12px] underline p-4 text-center">
                Watch on YouTube — {raw}
              </a>
            );
          })()}
        </div>
      )}
    </div>
  );
};
