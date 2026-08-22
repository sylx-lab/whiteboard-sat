import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceItem } from '../../../types';
import { Search, Plus, Edit3, Trash2, Download } from 'lucide-react';

interface ResourcesViewProps {
  resources: ResourceItem[];
  onOpenAddResource?: () => void;
  onOpenEditResource?: (resource: ResourceItem) => void;
  onDeleteResource: (resourceId: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onDeleteResource,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = resources.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            Study Resource Library CMS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload formula sheets, grammar rulebooks, strategy guides, and Desmos calculator cheatsheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
            />
          </div>

          <button
            onClick={() => router.push('/admin/resources/new')}
            className="px-4 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource (Visual Page)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                  {res.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => router.push(`/admin/resources/${res.id}`)}
                    className="p-1.5 text-slate-500 hover:text-[#0D918A] rounded-lg hover:bg-white cursor-pointer"
                    title="Edit resource in Visual Editor page"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${res.title}"?`)) {
                        onDeleteResource(res.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">
                {res.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {res.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span>{res.readTime}</span>
                <span>•</span>
                <span className="capitalize">{res.subject}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${res.is_free ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                {res.is_free ? 'Free Tier' : 'Premium Only'}
              </span>
              <div className="flex items-center gap-2">
                {res.downloadUrl && (
                  <a
                    href={res.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-600 hover:text-[#0D918A] cursor-pointer"
                    title="View PDF link"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
