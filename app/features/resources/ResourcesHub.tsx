import React, { useState } from 'react';
import {
  FileText,
  BookOpenCheck,
  ScrollText,
  Video,
  Calculator,
  Lock,
  Download,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { ResourceItem, UserProfile } from '../../types';

interface ResourcesHubProps {
  resources: ResourceItem[];
  currentUser: UserProfile | null;
  onOpenPricing: () => void;
}

type CategoryFilter = ResourceItem['category'] | 'all';

const CATEGORY_META: Record<ResourceItem['category'], { label: string; icon: typeof FileText }> = {
  formula_sheet: { label: 'Formula sheet', icon: FileText },
  grammar_guide: { label: 'Grammar guide', icon: BookOpenCheck },
  strategy_pdf: { label: 'Strategy PDF', icon: ScrollText },
  video_breakdown: { label: 'Video breakdown', icon: Video },
  desmos_tutorial: { label: 'Desmos tutorial', icon: Calculator },
};

export const ResourcesHub: React.FC<ResourcesHubProps> = ({ resources, currentUser: _currentUser, onOpenPricing }) => {
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filtered = category === 'all' ? resources : resources.filter((r) => r.category === category);
  const usedCategories = Array.from(new Set(resources.map((r) => r.category)));

  return (
    <div className="bg-(--surface) min-h-[calc(100vh-70px)] py-16 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="max-w-310 mx-auto space-y-4">
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-(--brand-text) font-mono">
            CHEAT SHEETS & RESOURCES
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold tracking-[-0.03em] text-(--foreground) leading-[1.12]">
            Study Resources
          </h1>
          <p className="text-[16px] sm:text-[17px] text-(--foreground-secondary) leading-[1.6] max-w-175">
            Formula sheets, grammar guides, and strategy PDFs to keep next to you while you practice.
          </p>
        </div>

        <div className="flex items-center gap-4 text-[12.5px] font-medium text-(--foreground-secondary) pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--brand)" />
            <span>{resources.length} Resources</span>
          </div>
          <span className="text-(--foreground-muted)">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--brand)" />
            <span>{resources.filter((r) => r.is_free).length} Free</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {usedCategories.length > 1 && (
        <div className="max-w-310 mx-auto flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`h-9 px-4 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
              category === 'all'
                ? 'bg-(--brand-cta) text-white'
                : 'bg-(--surface) border border-(--border) text-(--foreground-secondary) hover:bg-(--brand-soft)'
            }`}
          >
            All
          </button>
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`h-9 px-4 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-(--brand-cta) text-white'
                  : 'bg-(--surface) border border-(--border) text-(--foreground-secondary) hover:bg-(--brand-soft)'
              }`}
            >
              {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
      )}

      {/* Resource Grid */}
      {resources.length === 0 ? (
        <div className="max-w-310 mx-auto text-center py-16 text-(--foreground-secondary) text-[13.5px]">
          Resources are on the way — check back soon.
        </div>
      ) : (
        <div className="max-w-310 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => {
            const meta = CATEGORY_META[res.category] ?? CATEGORY_META.formula_sheet;
            const Icon = meta.icon;
            const href = res.downloadUrl || res.externalUrl;
            const isLocked = !res.is_free && !href;

            return (
              <div
                key={res.id}
                className="rounded-2xl bg-(--surface) border border-(--border) shadow-xs hover:border-(--brand)/60 transition-colors p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-(--brand-soft) text-(--brand-text) flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-semibold">
                      <Lock className="w-3 h-3" /> Premium
                    </span>
                  ) : res.is_free ? (
                    <span className="px-2 py-1 rounded-full bg-teal-50 border border-teal-200 text-(--brand-text) text-[10.5px] font-semibold">
                      Free
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1.5 flex-1">
                  <h3 className="text-[15px] font-bold text-(--foreground) leading-snug">{res.title}</h3>
                  <p className="text-[13px] text-(--foreground-secondary) leading-relaxed line-clamp-3">{res.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[11.5px] text-(--foreground-muted)">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{res.readTime}</span>
                  {res.subject !== 'general' && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="capitalize">{res.subject.replace('_', ' ')}</span>
                    </>
                  )}
                </div>

                {isLocked ? (
                  <button
                    onClick={onOpenPricing}
                    className="w-full h-10 flex items-center justify-center gap-1.5 bg-(--surface-soft) hover:bg-(--brand-soft) text-(--foreground) font-semibold text-[12.5px] rounded-[10px] border border-(--border) transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock with Premium</span>
                  </button>
                ) : href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 flex items-center justify-center gap-1.5 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[12.5px] rounded-[10px] transition-colors cursor-pointer"
                  >
                    {res.downloadUrl ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    <span>{res.downloadUrl ? 'Download' : 'Open'}</span>
                  </a>
                ) : (
                  <div className="w-full h-10 flex items-center justify-center text-[12px] text-(--foreground-muted) bg-(--surface-soft) rounded-[10px] border border-(--border)">
                    Link coming soon
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
