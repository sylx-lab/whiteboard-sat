'use client';

import React, { useState } from 'react';
import { MockTest } from '../../../types';
import { Edit3, Trash2, Award, SearchX } from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  ResultCount,
  EmptyState,
  Pill,
  Button,
  IconAction,
} from '../components/ui';

interface MockTestsViewProps {
  mockTests: MockTest[];
  onOpenAddMock: () => void;
  onOpenEditMock: (test: MockTest) => void;
  onDeleteMock: (testId: string) => void;
}

export const MockTestsView: React.FC<MockTestsViewProps> = ({
  mockTests,
  onOpenAddMock,
  onOpenEditMock,
  onDeleteMock,
}) => {
  const [search, setSearch] = useState('');

  const filtered = mockTests.filter(
    (m) => !search.trim() || m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminCard>
      <Toolbar>
        <SearchInput
          label="Search mock tests"
          value={search}
          onChange={setSearch}
          placeholder="Mock test title…"
        />
        <div className="lg:ml-auto">
          <ResultCount shown={filtered.length} total={mockTests.length} noun="mock tests" />
        </div>
      </Toolbar>

      {mockTests.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No mock tests yet"
          description="Build a timed, module-based Digital SAT mock for students to sit."
          action={{ label: 'New mock test', onClick: onOpenAddMock }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching mock tests"
          description={`No mock test title contains “${search}”.`}
          action={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((mock) => (
            <article
              key={mock.id}
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D918A]/50 transition-colors flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="danger">{mock.difficulty}</Pill>
                  <Pill tone={mock.is_free ? 'neutral' : 'brand'}>
                    {mock.is_free ? 'Free diagnostic' : 'Premium'}
                  </Pill>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconAction
                    icon={Edit3}
                    label={`Edit ${mock.title}`}
                    onClick={() => onOpenEditMock(mock)}
                  />
                  <IconAction
                    icon={Trash2}
                    tone="danger"
                    label={`Delete ${mock.title}`}
                    onClick={() => {
                      if (confirm(`Delete “${mock.title}”?`)) onDeleteMock(mock.id);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-[#071126] leading-snug">{mock.title}</h3>
                <p className="text-[13px] text-[#58708A] line-clamp-2 leading-relaxed">{mock.description}</p>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-[#58708A]">
                <span>{mock.totalQuestions} questions</span>
                <span aria-hidden="true">•</span>
                <span>{mock.totalTimeMinutes} min</span>
                <span aria-hidden="true">•</span>
                <span>{mock.modules.length} modules</span>
              </div>

              <Button icon={Edit3} onClick={() => onOpenEditMock(mock)} className="w-full">
                Edit mock test
              </Button>
            </article>
          ))}
        </div>
      )}
    </AdminCard>
  );
};
