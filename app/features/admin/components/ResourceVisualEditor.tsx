import React, { useState } from 'react';
import Link from 'next/link';
import { ResourceItem } from '../../../types';
import {
  ArrowLeft,
  FileText,
  Save,
  Download,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface ResourceVisualEditorProps {
  initialResource?: ResourceItem | null;
  onSave: (resourceData: any) => void;
}

export const ResourceVisualEditor: React.FC<ResourceVisualEditorProps> = ({
  initialResource,
  onSave,
}) => {
  const [title, setTitle] = useState(initialResource?.title || 'Digital SAT Math Formula & Reference Guide');
  const [description, setDescription] = useState(
    initialResource?.description ||
      'Complete high-yield formula cheat sheet covering Quadratic Equations, Circle Theorems, Trigonometry, and Desmos calculator shortcuts.'
  );
  const [category, setCategory] = useState<ResourceItem['category']>(
    initialResource?.category || 'formula_sheet'
  );
  const [subject, setSubject] = useState<ResourceItem['subject']>(
    initialResource?.subject || 'math'
  );
  const [isFree, setIsFree] = useState(initialResource?.is_free ?? true);
  const [downloadUrl, setDownloadUrl] = useState(
    initialResource?.downloadUrl || 'https://example.com/sat-math-formula-sheet.pdf'
  );
  const [readTime, setReadTime] = useState(initialResource?.readTime || '8 min read');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialResource?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      subject,
      is_free: isFree,
      downloadUrl: downloadUrl.trim() || undefined,
      readTime: readTime.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-[#0D918A] text-white px-6 py-4 border-b border-teal-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] text-teal-100 font-bold uppercase tracking-wider">
              Visual Resource Editor
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              {initialResource ? `Editing Resource: ${title}` : 'Create New Study Resource'}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-white text-[#0D918A] hover:bg-teal-50 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Resource</span>
        </button>
      </div>

      {/* Split-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: Form Control */}
        <form onSubmit={handleSave} className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-4 border-r border-slate-200 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                >
                  <option value="formula_sheet">Formula Sheet</option>
                  <option value="grammar_guide">Grammar Guide</option>
                  <option value="strategy_pdf">Strategy PDF</option>
                  <option value="desmos_tutorial">Desmos Tutorial</option>
                  <option value="video_breakdown">Video Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                >
                  <option value="math">Math</option>
                  <option value="reading_writing">Reading & Writing</option>
                  <option value="general">General SAT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Download / External PDF URL</label>
                <input
                  type="text"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Read Time Indicator</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="resFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 text-[#0D918A]"
              />
              <label htmlFor="resFree" className="font-bold text-slate-700">
                Free Resource (Available to all candidates)
              </label>
            </div>
          </div>
        </form>

        {/* RIGHT PANE: Real-time Visual Card Render */}
        <div className="w-full lg:w-1/2 p-6 bg-slate-100 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Real-Time Resource Card Render</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
                {category.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 font-medium">{readTime}</span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                {isFree ? 'Free Access' : 'Premium Pass'}
              </span>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#0D918A] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
