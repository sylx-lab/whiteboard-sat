import React, { useState } from 'react';
import { Question, Subject } from '../../../types';
import { formatDomainName } from '../../../lib/utils';
import { MathRenderer } from '../../../components/MathRenderer';
import { Search, Plus, Edit3, Trash2, Download, Upload, FileCode } from 'lucide-react';

interface QuestionBankViewProps {
  questions: Question[];
  onOpenAddQuestion: () => void;
  onOpenEditQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onAddQuestion: (q: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onOpenAddQuestion,
  onOpenEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | Subject>('all');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');

  const filtered = questions.filter((q) => {
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
    if (!search.trim()) return true;
    const match = search.toLowerCase();
    return (
      q.code.toLowerCase().includes(match) ||
      q.topic.toLowerCase().includes(match) ||
      q.question_text.toLowerCase().includes(match)
    );
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sat_question_bank_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSONSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (Array.isArray(parsed)) {
        let count = 0;
        parsed.forEach((item) => {
          if (item.code && item.question_text && item.correct_answer) {
            onAddQuestion(item);
            count++;
          }
        });
        alert(`Successfully imported ${count} new questions into the question bank!`);
        setIsBulkImportOpen(false);
        setBulkJsonText('');
      } else {
        alert('JSON payload must be an array of question objects.');
      }
    } catch (err) {
      alert('Invalid JSON format. Please format as an array of question objects.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            SAT Question Bank Builder & KaTeX Editor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, inspect, edit, and bulk import/export KaTeX formatted SAT questions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 bg-white text-xs rounded-xl text-slate-900 font-medium"
          >
            <option value="all">All Subjects</option>
            <option value="math">Math Only</option>
            <option value="reading_writing">Reading & Writing</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code or text..."
              className="pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
            />
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export Question Bank to JSON file"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Import Question Pack from JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import JSON</span>
          </button>

          <button
            onClick={onOpenAddQuestion}
            className="px-4 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {filtered.map((q) => (
          <div key={q.id} className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                  {q.code}
                </span>
                <span className="font-semibold text-[#0D918A]">{formatDomainName(q.domain)}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">{q.topic}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded uppercase">
                  {q.difficulty}
                </span>
                {q.is_free ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded">
                    Free
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] rounded">
                    Premium
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenEditQuestion(q)}
                  className="p-1.5 text-slate-500 hover:text-[#0D918A] rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Edit question in split-pane preview editor"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete question code ${q.code}?`)) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-900 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <MathRenderer content={q.question_text} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              {(q.choices || q.answer_choices || []).map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border ${
                    c.id === q.correct_answer
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold mr-1">{c.id}.</span>
                  <MathRenderer content={c.text} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bulk JSON Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#0D918A]" />
                <h3 className="font-bold text-slate-900 text-sm">Bulk Import Questions (JSON Array)</h3>
              </div>
              <button onClick={() => setIsBulkImportOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleImportJSONSubmit} className="space-y-3">
              <p className="text-[11px] text-slate-500">
                Paste an array of question JSON objects containing `code`, `subject`, `domain`, `topic`, `question_text`, `answer_choices`, `correct_answer`, and `explanation`.
              </p>
              <textarea
                rows={8}
                required
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                placeholder='[{"code": "M-ALG-999", "subject": "math", "domain": "algebra", "topic": "Linear Equations", "question_text": "If $$x = 5$$, what is $$2x$$?", "answer_choices": [{"id":"A","text":"10"}], "correct_answer": "A", "explanation": "2*5=10"}]'
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono text-[11px]"
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Parse & Import Questions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
