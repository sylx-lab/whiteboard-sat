'use client';

import React, { useMemo, useState } from 'react';
import { Question } from '../../../types';
import {
  listTopics,
  renameTopic,
  mergeTopics,
  findDuplicateTopics,
  TopicEntry,
  TopicUpdate,
} from '../lib/topics';
import { Tags, SearchX, Merge, Pencil, Check, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  ResultCount,
  EmptyState,
  Pill,
  Button,
} from '../components/ui';

interface TopicsViewProps {
  questions: Question[];
  onApplyTopicUpdates: (updates: TopicUpdate[]) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({ questions, onApplyTopicUpdates }) => {
  const [search, setSearch] = useState('');
  /** `${domain}::${topic}` currently being renamed. */
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const entries = useMemo(() => listTopics(questions), [questions]);
  const duplicates = useMemo(() => findDuplicateTopics(questions), [questions]);

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.topic.toLowerCase().includes(search.toLowerCase()) ||
          e.domainLabel.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  // Group for display; topics are scoped per domain so the domain is the heading.
  const byDomain = useMemo(() => {
    const map = new Map<string, { label: string; items: TopicEntry[] }>();
    for (const entry of filtered) {
      const bucket = map.get(entry.domain);
      if (bucket) bucket.items.push(entry);
      else map.set(entry.domain, { label: entry.domainLabel, items: [entry] });
    }
    return [...map.entries()];
  }, [filtered]);

  const keyOf = (entry: TopicEntry) => `${entry.domain}::${entry.topic}`;

  const startRename = (entry: TopicEntry) => {
    setEditingKey(keyOf(entry));
    setDraftName(entry.topic);
  };

  const commitRename = (entry: TopicEntry) => {
    const updates = renameTopic(questions, entry.domain, entry.topic, draftName);
    setEditingKey(null);
    if (updates.length === 0) return;

    const target = draftName.trim();
    const merging = entries.some((e) => e.domain === entry.domain && e.topic === target);
    onApplyTopicUpdates(updates);
    setNotice(
      merging
        ? `Merged “${entry.topic}” into “${target}” across ${updates.length} question${
            updates.length === 1 ? '' : 's'
          }.`
        : `Renamed “${entry.topic}” to “${target}” across ${updates.length} question${
            updates.length === 1 ? '' : 's'
          }.`
    );
  };

  const mergeVariants = (domain: TopicEntry['domain'], variants: string[], target: string) => {
    const updates = mergeTopics(questions, domain, variants, target);
    if (updates.length === 0) return;
    if (
      !confirm(
        `Merge ${variants.filter((v) => v !== target).length} variant(s) into “${target}”? ${
          updates.length
        } question(s) will be updated.`
      )
    ) {
      return;
    }
    onApplyTopicUpdates(updates);
    setNotice(`Merged into “${target}” across ${updates.length} question${updates.length === 1 ? '' : 's'}.`);
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-[13px]"
        >
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{notice}</span>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
            className="p-0.5 rounded hover:bg-black/5 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drift is the whole reason this page exists, so it leads. */}
      {duplicates.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" />
            <div>
              <h3 className="text-[13px] font-bold text-amber-900">
                {duplicates.length} possible duplicate{duplicates.length === 1 ? '' : 's'}
              </h3>
              <p className="text-[12px] text-amber-800/90 leading-relaxed">
                These topics differ only by case, punctuation, or spacing. Merging keeps the
                most-used spelling.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {duplicates.map((group) => {
              const target = group.variants[0].topic;
              return (
                <div
                  key={`${group.domain}-${target}`}
                  className="bg-white rounded-xl border border-amber-200 p-3 flex flex-wrap items-center gap-2"
                >
                  <span className="text-[11px] text-[#58708A] shrink-0">{group.domainLabel}</span>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    {group.variants.map((v, i) => (
                      <span key={v.topic} className="inline-flex items-center gap-1.5">
                        {i > 0 && <span className="text-[#58708A] text-[11px]">+</span>}
                        <span
                          className={`text-[12px] px-2 py-0.5 rounded ${
                            i === 0
                              ? 'bg-emerald-50 text-emerald-900 font-semibold'
                              : 'bg-[#F8FBFB] text-[#58708A]'
                          }`}
                        >
                          {v.topic} <span className="tabular-nums">({v.count})</span>
                        </span>
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Merge}
                    onClick={() =>
                      mergeVariants(
                        group.domain,
                        group.variants.map((v) => v.topic),
                        target
                      )
                    }
                    className="shrink-0"
                  >
                    Merge into “{target}”
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AdminCard>
        <Toolbar>
          <SearchInput
            label="Search topics"
            value={search}
            onChange={setSearch}
            placeholder="Topic or domain…"
          />
          <div className="ml-auto">
            <ResultCount shown={filtered.length} total={entries.length} noun="topics" />
          </div>
        </Toolbar>

        {entries.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No topics yet"
            description="Topics come from the questions you author. Add a question and its topic appears here."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matching topics"
            description={`Nothing matches “${search}”.`}
            action={{ label: 'Clear search', onClick: () => setSearch('') }}
          />
        ) : (
          <div className="space-y-4">
            {byDomain.map(([domain, { label, items }]) => (
              <section key={domain} className="space-y-1">
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-[12px] font-semibold text-[#58708A]">{label}</h3>
                  <span className="text-[11px] text-[#58708A] tabular-nums">{items.length}</span>
                </div>

                <ul className="rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] overflow-hidden">
                  {items.map((entry) => {
                    const isEditing = editingKey === keyOf(entry);
                    return (
                      <li
                        key={keyOf(entry)}
                        className="px-3 py-2 flex items-center gap-2 bg-white hover:bg-[#F8FBFB] transition-colors"
                      >
                        {isEditing ? (
                          <>
                            <label className="sr-only" htmlFor={`rename-${keyOf(entry)}`}>
                              New name for {entry.topic}
                            </label>
                            <input
                              id={`rename-${keyOf(entry)}`}
                              type="text"
                              autoFocus
                              value={draftName}
                              onChange={(e) => setDraftName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename(entry);
                                if (e.key === 'Escape') setEditingKey(null);
                              }}
                              className="flex-1 min-w-0 h-9 px-2.5 bg-white border border-[#0D918A] rounded-lg text-[13px] text-[#071126] focus:outline-none"
                            />
                            <span className="text-[11px] text-[#58708A] shrink-0 hidden sm:inline">
                              Renaming onto an existing topic merges them
                            </span>
                            <Button size="sm" variant="primary" icon={Check} onClick={() => commitRename(entry)}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-[13px] font-medium text-[#071126] flex-1 min-w-0 truncate">
                              {entry.topic}
                            </span>
                            {entry.draftCount > 0 && <Pill tone="warning">{entry.draftCount} draft</Pill>}
                            <span className="text-[12px] text-[#58708A] tabular-nums shrink-0 w-20 text-right">
                              {entry.count} question{entry.count === 1 ? '' : 's'}
                            </span>
                            <Button size="sm" icon={Pencil} onClick={() => startRename(entry)}>
                              Rename
                            </Button>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
};
