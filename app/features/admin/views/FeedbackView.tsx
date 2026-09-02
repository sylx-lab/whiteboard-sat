'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionFeedback } from '../../../types';
import { CheckCircle2, MessageSquareWarning, RotateCcw, SearchX, SquarePen } from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  FilterSelect,
  ResultCount,
  EmptyState,
  Pill,
  Button,
} from '../components/ui';

interface FeedbackViewProps {
  feedback: QuestionFeedback[];
  onResolveFeedback: (feedbackId: string, resolved?: boolean) => void;
}

type StatusFilter = 'all' | 'open' | 'resolved';

export const FeedbackView: React.FC<FeedbackViewProps> = ({ feedback, onResolveFeedback }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');

  const filtered = feedback.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.questionCode.toLowerCase().includes(q) || f.message.toLowerCase().includes(q) || f.userName.toLowerCase().includes(q);
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <AdminCard>
      <Toolbar>
        <SearchInput
          label="Search feedback"
          value={search}
          onChange={setSearch}
          placeholder="Question code, student, or message…"
        />
        <FilterSelect<StatusFilter>
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'all', label: 'All' },
          ]}
        />
        <div className="lg:ml-auto">
          <ResultCount shown={filtered.length} total={feedback.length} noun="reports" />
        </div>
      </Toolbar>

      {feedback.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No feedback yet"
          description="When a student reports something wrong with a question during practice, it shows up here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching reports"
          description="Nothing matches the current search and status filter."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <article
              key={f.id}
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono font-bold text-[12px] text-[#071126] bg-[#F8FBFB] px-2 py-0.5 rounded-lg border border-[#E2E8F0]">
                    {f.questionCode}
                  </span>
                  <Pill tone={f.status === 'open' ? 'brand' : 'neutral'}>
                    {f.status === 'open' ? 'Open' : 'Resolved'}
                  </Pill>
                  <span className="text-[11px] text-[#58708A]">
                    {f.userName} · {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[13px] text-[#071126] leading-relaxed whitespace-pre-wrap">{f.message}</p>
              </div>

              <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                <Button
                  icon={SquarePen}
                  onClick={() => router.push(`/admin/questions/${f.questionId}`)}
                >
                  Edit question
                </Button>
                <Button
                  icon={f.status === 'open' ? CheckCircle2 : RotateCcw}
                  onClick={() => onResolveFeedback(f.id, f.status === 'open')}
                >
                  {f.status === 'open' ? 'Mark resolved' : 'Reopen'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminCard>
  );
};
