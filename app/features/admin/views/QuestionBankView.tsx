'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question, Subject, Difficulty, QuestionStatus } from '../../../types';
import { planQuestionImport, describeImport } from '../lib/importQuestions';
import { groupQuestions, GroupBy, QuestionGroup, UNCATEGORISED } from '../lib/groupQuestions';
import { formatDomainName } from '../../../lib/utils';
import { MathRenderer } from '../../../components/MathRenderer';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Upload,
  Database,
  SearchX,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
} from 'lucide-react';
import {
  EmptyState,
  Pill,
  Button,
  Modal,
  Toolbar,
  SearchInput,
  FilterSelect,
  DifficultyDot,
} from '../components/ui';

interface QuestionBankViewProps {
  questions: Question[];
  onDeleteQuestion: (qId: string) => void;
  onAddQuestion: (q: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
}

type SubjectFilter = 'all' | Subject;
type DifficultyFilter = 'all' | Difficulty;
type StatusFilter = 'all' | QuestionStatus;

/** Where "add a question here" should land, with the category pre-filled. */
const newQuestionHref = (group: QuestionGroup, browseBy: GroupBy) => {
  if (browseBy === 'domain') return `/admin/questions/new?domain=${encodeURIComponent(group.key)}`;
  // "Uncategorised" is a bucket, not a topic worth pre-filling.
  if (group.key === UNCATEGORISED) return '/admin/questions/new';
  return `/admin/questions/new?topic=${encodeURIComponent(group.key)}`;
};

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The open category lives in the URL, so browser back steps up a level and the
  // editor can send the author straight back to where they were adding.
  const category = searchParams.get('category');

  const [search, setSearch] = useState('');
  const [browseBy, setBrowseBy] = useState<GroupBy>('domain');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [importResult, setImportResult] = useState<
    { tone: 'success' | 'error'; message: string } | null
  >(null);

  const openCategory = (key: string | null) =>
    router.push(key ? `/admin?tab=questions&category=${encodeURIComponent(key)}` : '/admin?tab=questions', {
      scroll: false,
    });

  const isSearching = search.trim() !== '';
  const hasFilters =
    isSearching || subjectFilter !== 'all' || difficultyFilter !== 'all' || statusFilter !== 'all';

  const matching = useMemo(
    () =>
      questions.filter((q) => {
        if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
        if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
        if (statusFilter !== 'all' && (q.status || 'published') !== statusFilter) return false;
        if (!search.trim()) return true;
        const match = search.toLowerCase();
        return (
          q.code.toLowerCase().includes(match) ||
          q.topic.toLowerCase().includes(match) ||
          (q.subtopic || '').toLowerCase().includes(match) ||
          q.question_text.toLowerCase().includes(match)
        );
      }),
    [questions, subjectFilter, difficultyFilter, statusFilter, search]
  );

  // The overview counts every category — including empty domains, so the first
  // question in a gap can be added straight from its card.
  const overviewSections = useMemo(
    () => groupQuestions(matching, browseBy, { includeEmptyDomains: !hasFilters }),
    [matching, browseBy, hasFilters]
  );

  const activeGroup = useMemo(
    () =>
      category
        ? groupQuestions(matching, browseBy).flatMap((s) => s.groups).find((g) => g.key === category)
        : undefined,
    [matching, browseBy, category]
  );

  const clearFilters = () => {
    setSearch('');
    setSubjectFilter('all');
    setDifficultyFilter('all');
    setStatusFilter('all');
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `sat-question-bank-${questions.length}-items.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    let plan;
    try {
      plan = planQuestionImport(bulkJsonText, questions);
    } catch (err) {
      setImportResult({
        tone: 'error',
        message:
          err instanceof SyntaxError && err.message === 'not-an-array'
            ? 'The payload must be a JSON array of question objects.'
            : 'That is not valid JSON. Check for a trailing comma or an unclosed bracket.',
      });
      return;
    }

    plan.accept.forEach(onAddQuestion);
    const { ok, message } = describeImport(plan);
    setImportResult({ tone: ok ? 'success' : 'error', message });
    if (ok) {
      setBulkJsonText('');
      setIsImportOpen(false);
    }
  };

  /** Proportional easy/medium/hard bar, so coverage skew is visible on the card. */
  const difficultyBar = (mix: QuestionGroup['difficultyMix'], total: number) => {
    if (total === 0) {
      return <div className="h-1 rounded-full bg-[#E2E8F0]" />;
    }
    const segments = [
      { key: 'easy', count: mix.easy, color: 'bg-emerald-500' },
      { key: 'medium', count: mix.medium, color: 'bg-amber-500' },
      { key: 'hard', count: mix.hard, color: 'bg-rose-500' },
    ].filter((s) => s.count > 0);

    return (
      <div className="h-1 rounded-full bg-[#E2E8F0] overflow-hidden flex">
        {segments.map((s) => (
          <div
            key={s.key}
            className={s.color}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.count} ${s.key}`}
          />
        ))}
      </div>
    );
  };

  const categoryCard = (group: QuestionGroup) => {
    const total = group.questions.length;
    const isEmpty = total === 0;

    return (
      <div
        key={group.key}
        className={`relative rounded-xl border p-4 transition-colors ${
          isEmpty
            ? 'border-dashed border-[#E2E8F0] bg-[#F8FBFB] hover:border-[#0D918A]'
            : 'border-[#E2E8F0] bg-white hover:border-[#0D918A]'
        }`}
      >
        {/* Stretched hit area: the whole card opens the category. */}
        {!isEmpty && (
          <button
            onClick={() => openCategory(group.key)}
            aria-label={`Open ${group.label}`}
            className="absolute inset-0 rounded-xl cursor-pointer"
          />
        )}

        <div className="relative pointer-events-none space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[13px] font-semibold text-[#071126] leading-snug">{group.label}</h4>
            {group.draftCount > 0 && <Pill tone="warning">{group.draftCount} draft</Pill>}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#071126] tabular-nums leading-none">
              {total}
            </span>
            <span className="text-[12px] text-[#58708A]">
              question{total === 1 ? '' : 's'}
            </span>
          </div>

          {difficultyBar(group.difficultyMix, total)}

          <p className="text-[11px] text-[#58708A] leading-relaxed line-clamp-2 min-h-8">
            {isEmpty
              ? 'Nothing here yet.'
              : group.topics.length
              ? group.topics.join(' · ')
              : `${total} question${total === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="relative flex items-center gap-2 pt-3 mt-1 border-t border-[#E2E8F0]">
          {!isEmpty && (
            <span className="text-[12px] font-semibold text-[#087C76] inline-flex items-center gap-1 pointer-events-none">
              Open
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
          <button
            onClick={() => router.push(newQuestionHref(group, browseBy))}
            className="ml-auto text-[12px] font-semibold text-[#58708A] hover:text-[#087C76] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {isEmpty ? 'Add the first' : 'Add'}
          </button>
        </div>
      </div>
    );
  };

  const renderRow = (q: Question) => {
    const isExpanded = expandedId === q.id;
    const choices = q.choices || q.answer_choices || [];
    const status = q.status || 'published';

    return (
      <li key={q.id} className="border-b border-[#E2E8F0] last:border-b-0">
        <div className="group flex items-start gap-2 pl-2 pr-3">
          <button
            onClick={() => setExpandedId(isExpanded ? null : q.id)}
            aria-expanded={isExpanded}
            className="flex-1 min-w-0 py-2.5 flex items-start gap-2 text-left cursor-pointer"
          >
            <ChevronRight
              className={`w-3.5 h-3.5 mt-1 shrink-0 text-[#58708A] transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[11px] font-semibold text-[#58708A] shrink-0">
                  {q.code}
                </span>
                <span className="text-[13px] font-medium text-[#071126] truncate">{q.topic}</span>
              </div>
              <div className="text-[12px] text-[#58708A] truncate">
                <MathRenderer inline content={q.question_text} />
              </div>
            </div>
          </button>

          {/* Only exceptions get a marker: free/published are the defaults. */}
          <div className="flex items-center gap-2 shrink-0 py-2.5">
            {q.stimulus && (
              <span title="Has a passage" className="text-[#58708A]">
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="sr-only">Has a passage</span>
              </span>
            )}
            {!q.is_free && (
              <span title="Premium only" className="text-[#087C76]">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="sr-only">Premium only</span>
              </span>
            )}
            {status !== 'published' && <Pill tone="warning">{status}</Pill>}
            <DifficultyDot difficulty={q.difficulty} className="hidden sm:inline-flex w-16" />
          </div>

          {/* Visible on touch, revealed on hover where hover exists. */}
          <div className="flex items-center shrink-0 py-1.5 gap-0.5 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={() => router.push(`/admin/questions/${q.id}`)}
              aria-label={`Edit question ${q.code}`}
              title="Edit"
              className="p-1.5 rounded-lg text-[#58708A] hover:text-[#0D918A] hover:bg-[#F1F8F7] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete question ${q.code}? This cannot be undone.`)) {
                  onDeleteQuestion(q.id);
                }
              }}
              aria-label={`Delete question ${q.code}`}
              title="Delete"
              className="p-1.5 rounded-lg text-[#58708A] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="pl-7 pr-3 pb-4 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#58708A]">
              <span className="text-[#087C76] font-medium">{formatDomainName(q.domain)}</span>
              {q.subtopic && <span>· {q.subtopic}</span>}
              {q.source && <span>· {q.source}</span>}
            </div>

            {q.stimulus && (
              <div className="text-[13px] text-[#071126] bg-[#F8FBFB] p-3 rounded-lg border border-[#E2E8F0] leading-relaxed max-h-52 overflow-y-auto">
                <MathRenderer content={q.stimulus} />
              </div>
            )}

            <div className="text-[13px] text-[#071126] leading-relaxed">
              <MathRenderer content={q.question_text} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px]">
              {choices.map((c) => {
                const isCorrect = c.id === q.correct_answer;
                return (
                  <div
                    key={c.id}
                    className={`px-2.5 py-2 rounded-lg flex items-start gap-2 min-w-0 ${
                      isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-[#F8FBFB] text-[#071126]'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-mono font-bold shrink-0 ${
                        isCorrect ? 'text-emerald-700' : 'text-[#58708A]'
                      }`}
                    >
                      {c.id}
                    </span>
                    <div className="min-w-0">
                      <MathRenderer inline content={c.text} />
                    </div>
                  </div>
                );
              })}
            </div>

            {q.explanation && (
              <div className="text-[12px] text-[#58708A] leading-relaxed border-l-2 border-[#E2E8F0] pl-3">
                <MathRenderer content={q.explanation} />
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  const questionList = (items: Question[]) => <ul>{items.map(renderRow)}</ul>;

  return (
    <div className="space-y-4">
      {importResult && (
        <div
          role="status"
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-[13px] ${
            importResult.tone === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {importResult.tone === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span className="flex-1">{importResult.message}</span>
          <button
            onClick={() => setImportResult(null)}
            aria-label="Dismiss message"
            className="p-0.5 rounded hover:bg-black/5 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-3 border-b border-[#E2E8F0]">
          <Toolbar>
            <SearchInput
              label="Search questions"
              value={search}
              onChange={setSearch}
              placeholder="Search code, topic, or question text…"
            />
            <FilterSelect<SubjectFilter>
              label="Subject"
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={[
                { value: 'all', label: 'All subjects' },
                { value: 'math', label: 'Math' },
                { value: 'reading_writing', label: 'Reading & Writing' },
              ]}
            />
            <FilterSelect<DifficultyFilter>
              label="Difficulty"
              value={difficultyFilter}
              onChange={setDifficultyFilter}
              options={[
                { value: 'all', label: 'Any difficulty' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />
            <FilterSelect<StatusFilter>
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Any status' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />

            {hasFilters && (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <Button
                size="sm"
                variant="ghost"
                icon={Download}
                onClick={handleExportJSON}
                title="Export the whole bank as JSON"
              >
                <span className="hidden lg:inline">Export</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={Upload}
                onClick={() => setIsImportOpen(true)}
                title="Import a JSON question pack"
              >
                <span className="hidden lg:inline">Import</span>
              </Button>
            </div>
          </Toolbar>
        </div>

        {questions.length === 0 ? (
          <EmptyState
            icon={Database}
            title="The question bank is empty"
            description="Author a question with the live KaTeX editor, or import a JSON pack."
            action={{ label: 'New question', onClick: () => router.push('/admin/questions/new') }}
          />
        ) : isSearching ? (
          /* A search should answer directly, not make you guess which category to open. */
          <>
            <div className="px-3 py-2.5 border-b border-[#E2E8F0] flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-[#071126]">
                {matching.length} result{matching.length === 1 ? '' : 's'}
              </h3>
              <span className="text-[12px] text-[#58708A] truncate">for “{search}”</span>
              <button
                onClick={clearFilters}
                className="ml-auto text-[12px] font-medium text-[#58708A] hover:text-[#071126] transition-colors cursor-pointer shrink-0"
              >
                Back to categories
              </button>
            </div>
            {matching.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No matching questions"
                description="Nothing matches the current search and filters."
                action={{ label: 'Clear filters', onClick: clearFilters }}
              />
            ) : (
              questionList(matching)
            )}
          </>
        ) : activeGroup ? (
          /* Level 2 — one category's questions. */
          <>
            <div className="px-3 py-2.5 border-b border-[#E2E8F0] flex items-center gap-2 flex-wrap">
              <button
                onClick={() => openCategory(null)}
                className="text-[12px] font-medium text-[#58708A] hover:text-[#071126] transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                All categories
              </button>
              <span className="text-[#E2E8F0]" aria-hidden="true">
                /
              </span>
              <h3 className="text-[13px] font-semibold text-[#071126]">{activeGroup.label}</h3>
              <span className="text-[12px] text-[#58708A] tabular-nums">
                {activeGroup.questions.length}
              </span>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => router.push(newQuestionHref(activeGroup, browseBy))}
                className="ml-auto"
              >
                New question
              </Button>
            </div>
            {activeGroup.questions.length === 0 ? (
              <EmptyState
                icon={Database}
                title={`No questions in ${activeGroup.label}`}
                description="Add the first one, and it will be pre-filled with this category."
                action={{
                  label: 'New question',
                  onClick: () => router.push(newQuestionHref(activeGroup, browseBy)),
                }}
              />
            ) : (
              questionList(activeGroup.questions)
            )}
          </>
        ) : (
          /* Level 1 — the category overview. */
          <div className="p-3 space-y-5">
            <div className="flex items-center gap-2">
              <FilterSelect<GroupBy>
                label="Browse by"
                value={browseBy}
                onChange={setBrowseBy}
                options={[
                  { value: 'domain', label: 'Browse by domain' },
                  { value: 'topic', label: 'Browse by topic' },
                ]}
              />
              <span className="text-[12px] text-[#58708A]">
                {matching.length} question{matching.length === 1 ? '' : 's'} in{' '}
                {overviewSections.reduce((n, s) => n + s.groups.length, 0)} categories
              </span>
            </div>

            {overviewSections.map((section) => (
              <section key={section.subject} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-[#071126]">{section.label}</h3>
                  <span className="text-[12px] text-[#58708A] tabular-nums">{section.total}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {section.groups.map(categoryCard)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {isImportOpen && (
        <Modal
          title="Import questions"
          subtitle="Paste a JSON array"
          icon={Upload}
          onClose={() => setIsImportOpen(false)}
          footer={
            <>
              <Button type="button" onClick={() => setIsImportOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="import-form" variant="primary" icon={Plus}>
                Import questions
              </Button>
            </>
          }
        >
          <form id="import-form" onSubmit={handleImport} className="space-y-3">
            <p className="text-[13px] text-[#58708A] leading-relaxed">
              Items missing <code className="font-mono text-[#071126]">code</code>,{' '}
              <code className="font-mono text-[#071126]">question_text</code>, or{' '}
              <code className="font-mono text-[#071126]">correct_answer</code> are skipped, as are codes
              already in the bank.
            </p>

            <label className="sr-only" htmlFor="bulk-json">
              Question JSON
            </label>
            <textarea
              id="bulk-json"
              rows={9}
              required
              autoFocus
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
              placeholder={
                '[{"code":"M-ALG-999","subject":"math","domain":"algebra","topic":"Linear Equations","question_text":"If $x=5$, what is $2x$?","answer_choices":[{"id":"A","text":"10"}],"correct_answer":"A","explanation":"$2\\\\times5=10$"}]'
              }
              className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-lg font-mono text-[11px] text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors resize-y"
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
