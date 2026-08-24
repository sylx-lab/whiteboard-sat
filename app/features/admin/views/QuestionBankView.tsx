'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Subject, Difficulty, QuestionStatus } from '../../../types';
import { planQuestionImport, describeImport } from '../lib/importQuestions';
import { groupQuestions, missingDomains, GroupBy } from '../lib/groupQuestions';
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
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  FilterSelect,
  ResultCount,
  EmptyState,
  Pill,
  Button,
  IconAction,
  Modal,
} from '../components/ui';

interface QuestionBankViewProps {
  questions: Question[];
  onDeleteQuestion: (qId: string) => void;
  onAddQuestion: (q: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
}

type SubjectFilter = 'all' | Subject;
type DifficultyFilter = 'all' | Difficulty;
type StatusFilter = 'all' | QuestionStatus;
type GroupMode = GroupBy | 'none';

const DIFFICULTY_TONE = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
} as const;

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('domain');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  // Inline import feedback instead of a native alert(), so the result stays readable.
  const [importResult, setImportResult] = useState<
    { tone: 'success' | 'error'; message: string } | null
  >(null);

  const isFiltering =
    search.trim() !== '' ||
    subjectFilter !== 'all' ||
    difficultyFilter !== 'all' ||
    statusFilter !== 'all';

  const filtered = useMemo(
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

  const sections = useMemo(
    () => (groupMode === 'none' ? [] : groupQuestions(filtered, groupMode)),
    [filtered, groupMode]
  );

  // Gaps are only meaningful against the whole bank, not a filtered slice.
  const gaps = useMemo(() => missingDomains(questions), [questions]);

  const clearFilters = () => {
    setSearch('');
    setSubjectFilter('all');
    setDifficultyFilter('all');
    setStatusFilter('all');
  };

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

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

  /** One question row, shared by the grouped and flat layouts. */
  const renderQuestion = (q: Question) => {
    const isExpanded = expandedId === q.id;
    const choices = q.choices || q.answer_choices || [];
    const status = q.status || 'published';

    return (
      <li key={q.id}>
        <div className="py-2.5 flex items-start gap-2">
          <button
            onClick={() => setExpandedId(isExpanded ? null : q.id)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${q.code}` : `Expand ${q.code}`}
            className="p-1 mt-0.5 rounded text-[#58708A] hover:text-[#071126] hover:bg-[#F1F8F7] transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="font-mono font-semibold text-[#071126] bg-[#F1F8F7] px-2 py-0.5 rounded border border-[#E2E8F0]">
                {q.code}
              </span>
              {/* Show whichever category axis is *not* the current grouping. */}
              <span className="text-[#58708A]">
                {groupMode === 'topic' ? formatDomainName(q.domain) : q.topic}
              </span>
              {q.stimulus && (
                <span
                  className="text-[#58708A] inline-flex items-center gap-1"
                  title="Has a passage or stimulus"
                >
                  <FileText className="w-3.5 h-3.5" />
                </span>
              )}
              <Pill tone={DIFFICULTY_TONE[q.difficulty]}>{q.difficulty}</Pill>
              <Pill tone={q.is_free ? 'neutral' : 'brand'}>{q.is_free ? 'Free' : 'Premium'}</Pill>
              {status !== 'published' && <Pill tone="warning">{status}</Pill>}
            </div>

            {!isExpanded && (
              <div className="text-[13px] text-[#58708A] truncate">
                <MathRenderer inline content={q.question_text} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <IconAction
              icon={Edit3}
              label={`Edit question ${q.code}`}
              onClick={() => router.push(`/admin/questions/${q.id}`)}
            />
            <IconAction
              icon={Trash2}
              tone="danger"
              label={`Delete question ${q.code}`}
              onClick={() => {
                if (confirm(`Delete question ${q.code}? This cannot be undone.`)) {
                  onDeleteQuestion(q.id);
                }
              }}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="pb-4 pl-8 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#58708A]">
              <span className="font-semibold text-[#087C76]">{formatDomainName(q.domain)}</span>
              <span aria-hidden="true">•</span>
              <span>{q.topic}</span>
              {q.subtopic && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{q.subtopic}</span>
                </>
              )}
              {q.source && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{q.source}</span>
                </>
              )}
            </div>

            {q.stimulus && (
              <div className="text-[13px] text-[#071126] bg-white p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
                <div className="text-[12px] font-semibold text-[#58708A] mb-1">Passage</div>
                <MathRenderer content={q.stimulus} />
              </div>
            )}

            <div className="text-[13px] text-[#071126] bg-[#F8FBFB] p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
              <MathRenderer content={q.question_text} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
              {choices.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    c.id === q.correct_answer
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-[#E2E8F0] text-[#071126]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-mono font-bold shrink-0 ${
                      c.id === q.correct_answer
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#F1F8F7] text-[#58708A]'
                    }`}
                  >
                    {c.id}
                  </span>
                  <MathRenderer inline content={c.text} />
                </div>
              ))}
            </div>

            {q.explanation && (
              <div className="text-[13px] text-[#071126] bg-[#F1F8F7] p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
                <div className="text-[12px] font-semibold text-[#087C76] mb-1">Explanation</div>
                <MathRenderer content={q.explanation} />
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      {importResult && (
        <div
          role="status"
          className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-[13px] ${
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

      <AdminCard>
        <div className="space-y-2.5">
          <Toolbar>
            <SearchInput
              label="Search questions"
              value={search}
              onChange={setSearch}
              placeholder="Code, topic, or question text…"
            />
            <FilterSelect<GroupMode>
              label="Group by"
              value={groupMode}
              onChange={setGroupMode}
              options={[
                { value: 'domain', label: 'Group by domain' },
                { value: 'topic', label: 'Group by topic' },
                { value: 'none', label: 'No grouping' },
              ]}
            />
            <div className="flex items-center gap-2 lg:ml-auto">
              <ResultCount shown={filtered.length} total={questions.length} noun="questions" />
              <Button icon={Download} onClick={handleExportJSON} title="Export the whole bank as JSON">
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button icon={Upload} onClick={() => setIsImportOpen(true)} title="Import a JSON question pack">
                <span className="hidden sm:inline">Import</span>
              </Button>
            </div>
          </Toolbar>

          <Toolbar>
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
                { value: 'all', label: 'All difficulties' },
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
                { value: 'all', label: 'All statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            {isFiltering && (
              <button
                onClick={clearFilters}
                className="h-10 px-3 text-[12px] font-medium text-[#58708A] hover:text-[#071126] rounded-[10px] hover:bg-[#F1F8F7] transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </Toolbar>
        </div>

        {questions.length === 0 ? (
          <EmptyState
            icon={Database}
            title="The question bank is empty"
            description="Author a question with the live KaTeX editor, or import a JSON pack."
            action={{ label: 'New question', onClick: () => router.push('/admin/questions/new') }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matching questions"
            description="Nothing matches the current search and filters."
            action={{ label: 'Clear filters', onClick: clearFilters }}
          />
        ) : groupMode === 'none' ? (
          <ul className="divide-y divide-[#E2E8F0]">{filtered.map(renderQuestion)}</ul>
        ) : (
          <div className="space-y-5">
            {sections.map((section) => (
              <section key={section.subject} className="space-y-2">
                <div className="flex items-center gap-2 pb-1">
                  <h3 className="text-[13px] font-bold text-[#071126]">{section.label}</h3>
                  <span className="text-[12px] text-[#58708A]">
                    {section.total} question{section.total === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {section.groups.map((group) => {
                    // While filtering, keep every matching category open — hunting through
                    // collapsed headers for your search hit is the whole pain being removed.
                    const isOpen = isFiltering || !collapsedGroups.has(group.key);

                    return (
                      <div
                        key={group.key}
                        className="rounded-xl border border-[#E2E8F0] overflow-hidden"
                      >
                        <button
                          onClick={() => toggleGroup(group.key)}
                          aria-expanded={isOpen}
                          className="w-full px-3 py-2.5 bg-[#F8FBFB] hover:bg-[#F1F8F7] transition-colors cursor-pointer flex items-center gap-2 text-left"
                        >
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-[#58708A] shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#58708A] shrink-0" />
                          )}
                          <span className="text-[13px] font-semibold text-[#071126] flex-1 min-w-0 truncate">
                            {group.label}
                          </span>
                          {group.draftCount > 0 && (
                            <Pill tone="warning">{group.draftCount} draft</Pill>
                          )}
                          <span className="text-[12px] text-[#58708A] tabular-nums shrink-0">
                            {group.questions.length}
                          </span>
                        </button>

                        {isOpen && (
                          <ul className="divide-y divide-[#E2E8F0] px-3">
                            {group.questions.map(renderQuestion)}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Coverage gaps: which SAT domains have nothing authored yet. */}
            {groupMode === 'domain' && !isFiltering && gaps.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#F8FBFB] border border-dashed border-[#E2E8F0] space-y-1.5">
                <div className="text-[12px] font-semibold text-[#071126]">
                  {gaps.length} domain{gaps.length === 1 ? '' : 's'} with no questions yet
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {gaps.map((d) => (
                    <Pill key={d}>{formatDomainName(d)}</Pill>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminCard>

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
              className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-[10px] font-mono text-[11px] text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors resize-y"
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
