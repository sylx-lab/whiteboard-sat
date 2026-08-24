'use client';

import React, { useState } from 'react';
import { ResourceItem } from '../../../types';
import { FileText, Download, Eye } from 'lucide-react';
import { EditorShell, EditorPanes, EditorSection, Field, inputClass, textareaClass } from './EditorShell';
import { Pill } from './ui';

interface ResourceVisualEditorProps {
  initialResource?: ResourceItem | null;
  onSave: (resourceData: Record<string, unknown>) => void;
}

interface FormState {
  title: string;
  description: string;
  category: ResourceItem['category'];
  subject: ResourceItem['subject'];
  isFree: boolean;
  downloadUrl: string;
  readTime: string;
}

/** New resources start empty — placeholders carry the guidance. */
const blankForm = (): FormState => ({
  title: '',
  description: '',
  category: 'formula_sheet',
  subject: 'math',
  isFree: true,
  downloadUrl: '',
  readTime: '',
});

export const ResourceVisualEditor: React.FC<ResourceVisualEditorProps> = ({
  initialResource,
  onSave,
}) => {
  const [form, setForm] = useState<FormState>(() =>
    initialResource
      ? {
          title: initialResource.title,
          description: initialResource.description,
          category: initialResource.category,
          subject: initialResource.subject,
          isFree: initialResource.is_free,
          downloadUrl: initialResource.downloadUrl || '',
          readTime: initialResource.readTime || '',
        }
      : blankForm()
  );
  const [isDirty, setIsDirty] = useState(false);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    onSave({
      id: initialResource?.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      subject: form.subject,
      is_free: form.isFree,
      downloadUrl: form.downloadUrl.trim() || undefined,
      readTime: form.readTime.trim() || '5 min read',
    });
  };

  return (
    <EditorShell
      eyebrow="Resources"
      title={initialResource ? `Edit ${initialResource.title}` : 'New resource'}
      backTab="resources"
      formId="resource-form"
      saveLabel={initialResource ? 'Save changes' : 'Save resource'}
      isDirty={isDirty}
    >
      <EditorPanes
        form={
          <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
            <EditorSection icon={FileText} title="Resource details">
              <Field label="Title">
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Digital SAT Math Formula Reference"
                  className={inputClass}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="What this resource covers and who it is for."
                  className={textareaClass}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => update({ category: e.target.value as ResourceItem['category'] })}
                    className={inputClass}
                  >
                    <option value="formula_sheet">Formula sheet</option>
                    <option value="grammar_guide">Grammar guide</option>
                    <option value="strategy_pdf">Strategy PDF</option>
                    <option value="desmos_tutorial">Desmos tutorial</option>
                    <option value="video_breakdown">Video breakdown</option>
                  </select>
                </Field>

                <Field label="Subject">
                  <select
                    value={form.subject}
                    onChange={(e) => update({ subject: e.target.value as ResourceItem['subject'] })}
                    className={inputClass}
                  >
                    <option value="math">Math</option>
                    <option value="reading_writing">Reading &amp; Writing</option>
                    <option value="general">General</option>
                  </select>
                </Field>

                <Field label="Read time" hint="Defaults to 5 min read">
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => update({ readTime: e.target.value })}
                    placeholder="8 min read"
                    className={inputClass}
                  />
                </Field>

                <Field label="Access tier">
                  <select
                    value={form.isFree ? 'free' : 'premium'}
                    onChange={(e) => update({ isFree: e.target.value === 'free' })}
                    className={inputClass}
                  >
                    <option value="free">Free — any student</option>
                    <option value="premium">Premium — paid pass only</option>
                  </select>
                </Field>
              </div>

              <Field label="Download URL" hint="Optional. Must start with http:// or https://">
                <input
                  type="url"
                  value={form.downloadUrl}
                  onChange={(e) => update({ downloadUrl: e.target.value })}
                  placeholder="https://…/formula-sheet.pdf"
                  className={`${inputClass} font-mono`}
                />
              </Field>
            </EditorSection>
          </form>
        }
        preview={
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#58708A]">
              <Eye className="w-4 h-4" />
              <span>Student preview</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="success">{form.category.replace(/_/g, ' ')}</Pill>
                  <Pill tone={form.isFree ? 'neutral' : 'brand'}>{form.isFree ? 'Free' : 'Premium'}</Pill>
                </div>
                <span className="text-[12px] text-[#58708A]">{form.readTime || '5 min read'}</span>
              </div>

              <h2 className="text-base font-bold text-[#071126] leading-snug">
                {form.title || <span className="text-[#58708A]">Resource title</span>}
              </h2>
              <p className="text-[13px] text-[#58708A] leading-relaxed">
                {form.description || 'The description will appear here.'}
              </p>

              <div className="pt-3 border-t border-[#E2E8F0]">
                {form.downloadUrl ? (
                  <a
                    href={form.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-4 bg-[#0D918A] hover:bg-[#087C76] text-white text-[12px] font-semibold rounded-[10px] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                ) : (
                  <span className="text-[12px] text-[#58708A]">
                    No download link — students will only see the description.
                  </span>
                )}
              </div>
            </div>
          </div>
        }
      />
    </EditorShell>
  );
};
