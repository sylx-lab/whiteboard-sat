import React, { useState, useEffect } from 'react';
import { ResourceItem } from '../../../types';
import { FileText } from 'lucide-react';

interface ResourceEditorModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceData: any) => void;
}

export const ResourceEditorModal: React.FC<ResourceEditorModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceItem['category']>('formula_sheet');
  const [subject, setSubject] = useState<ResourceItem['subject']>('general');
  const [isFree, setIsFree] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [readTime, setReadTime] = useState('10 min read');

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description);
      setCategory(resource.category);
      setSubject(resource.subject);
      setIsFree(resource.is_free);
      setDownloadUrl(resource.downloadUrl || '');
      setExternalUrl(resource.externalUrl || '');
      setReadTime(resource.readTime);
    } else {
      setTitle('Ultimate SAT Formula Sheet 2026');
      setDescription('All essential formulas for Digital SAT Math in one quick reference sheet.');
      setCategory('formula_sheet');
      setSubject('math');
      setIsFree(true);
      setDownloadUrl('https://example.com/sat-formula-sheet.pdf');
      setExternalUrl('');
      setReadTime('5 min read');
    }
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: resource?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      subject,
      is_free: isFree,
      downloadUrl: downloadUrl.trim() || undefined,
      externalUrl: externalUrl.trim() || undefined,
      readTime: readTime.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D918A] text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {resource ? 'Edit Study Resource' : 'Add New Study Resource'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
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
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
              >
                <option value="math">Math</option>
                <option value="reading_writing">Reading & Writing</option>
                <option value="general">General SAT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PDF Download URL</label>
              <input
                type="text"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://..."
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
              id="rFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D918A]"
            />
            <label htmlFor="rFree" className="font-bold text-slate-700">
              Free Resource (Available without premium pass)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {resource ? 'Update Resource' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
