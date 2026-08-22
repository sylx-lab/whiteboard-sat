import React, { useState } from 'react';
import { MockTest } from '../../../types';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';

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
    (m) => !search || m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            Digital SAT Mock Test CMS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure timed adaptive module diagnostic mock tests for student practice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mock tests..."
              className="pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
            />
          </div>

          <button
            onClick={onOpenAddMock}
            className="px-4 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mock Test</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((mock) => (
          <div
            key={mock.id}
            className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full uppercase">
                  {mock.difficulty} Difficulty
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditMock(mock)}
                    className="p-1.5 text-slate-500 hover:text-[#0D918A] rounded-lg hover:bg-white cursor-pointer"
                    title="Edit mock test"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete mock test "${mock.title}"?`)) {
                        onDeleteMock(mock.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                    title="Delete mock test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">
                {mock.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {mock.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span>{mock.totalQuestions} Questions</span>
                <span>•</span>
                <span>{mock.totalTimeMinutes} Mins Limit</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${mock.is_free ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                {mock.is_free ? 'Free Diagnostic' : 'Premium Mock'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {mock.modules.length} Modules Configured
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
