'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceItem } from '../../../types';
import { Edit3, Trash2, FileText, SearchX, ExternalLink } from 'lucide-react';
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
} from '../components/ui';

interface ResourcesViewProps {
  resources: ResourceItem[];
  onDeleteResource: (resourceId: string) => void;
}

type AccessFilter = 'all' | 'free' | 'premium';

export const ResourcesView: React.FC<ResourcesViewProps> = ({ resources, onDeleteResource }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');

  const filtered = resources.filter((r) => {
    if (accessFilter === 'free' && !r.is_free) return false;
    if (accessFilter === 'premium' && r.is_free) return false;
    return !search.trim() || r.title.toLowerCase().includes(search.toLowerCase());
  });

  const clearFilters = () => {
    setSearch('');
    setAccessFilter('all');
  };

  return (
    <AdminCard>
      <Toolbar>
        <SearchInput
          label="Search resources"
          value={search}
          onChange={setSearch}
          placeholder="Resource title…"
        />
        <FilterSelect<AccessFilter>
          label="Access tier"
          value={accessFilter}
          onChange={setAccessFilter}
          options={[
            { value: 'all', label: 'All tiers' },
            { value: 'free', label: 'Free only' },
            { value: 'premium', label: 'Premium only' },
          ]}
        />
        <div className="lg:ml-auto">
          <ResultCount shown={filtered.length} total={resources.length} noun="resources" />
        </div>
      </Toolbar>

      {resources.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources yet"
          description="Publish formula sheets, grammar guides, and strategy PDFs for students to download."
          action={{ label: 'New resource', onClick: () => router.push('/admin/resources/new') }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching resources"
          description="Nothing matches the current search and tier filter."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((res) => (
            <article
              key={res.id}
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0D918A]/50 transition-colors flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="success">{res.category.replace(/_/g, ' ')}</Pill>
                  <Pill tone={res.is_free ? 'neutral' : 'brand'}>{res.is_free ? 'Free' : 'Premium'}</Pill>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconAction
                    icon={Edit3}
                    label={`Edit ${res.title}`}
                    onClick={() => router.push(`/admin/resources/${res.id}`)}
                  />
                  <IconAction
                    icon={Trash2}
                    tone="danger"
                    label={`Delete ${res.title}`}
                    onClick={() => {
                      if (confirm(`Delete “${res.title}”?`)) onDeleteResource(res.id);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-[#071126] leading-snug">{res.title}</h3>
                <p className="text-[13px] text-[#58708A] line-clamp-2 leading-relaxed">{res.description}</p>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-[#58708A]">
                <span>{res.readTime}</span>
                <span aria-hidden="true">•</span>
                <span className="capitalize">{res.subject.replace('_', ' ')}</span>
              </div>

              <Button
                icon={ExternalLink}
                onClick={() => router.push(`/admin/resources/${res.id}`)}
                className="w-full"
              >
                Edit resource
              </Button>
            </article>
          ))}
        </div>
      )}
    </AdminCard>
  );
};
