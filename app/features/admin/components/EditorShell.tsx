'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, LucideIcon } from 'lucide-react';

interface EditorShellProps {
  /** Small label above the title, e.g. "Question Bank". */
  eyebrow: string;
  title: string;
  /** Admin tab to return to on back/cancel, e.g. "questions". */
  backTab: string;
  /** id of the <form> this shell's Save button submits — enables native required-field validation. */
  formId: string;
  saveLabel: string;
  /** True once the author has changed something; guards accidental navigation away. */
  isDirty: boolean;
  /** Optional extra action next to Save (e.g. "Save & add another"). */
  secondaryAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  children: React.ReactNode;
}

/**
 * The sticky editor header. Shared by `EditorShell` (route-level editors) and by
 * in-editor sub-screens such as the mock test module question picker, so both wear
 * identical chrome.
 */
export const EditorTopBar: React.FC<{
  eyebrow: string;
  title: string;
  onBack: () => void;
  backLabel?: string;
  /** Right-hand note, e.g. "Unsaved changes" or a selection count. */
  status?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ eyebrow, title, onBack, backLabel = 'Back', status, children }) => (
  <header className="bg-[#0D918A] text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-[10px] transition-colors cursor-pointer shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="min-w-0">
        <div className="text-[11px] text-teal-100 font-semibold">{eyebrow}</div>
        <h1 className="text-[15px] font-bold tracking-tight truncate">{title}</h1>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {status && <span className="hidden sm:inline text-[11px] text-teal-100 font-medium">{status}</span>}
      {children}
    </div>
  </header>
);

/** Primary action styling for the top bar, so every editor's save button matches. */
export const editorPrimaryButtonClass =
  'h-10 px-4 bg-white text-[#0D918A] hover:bg-teal-50 text-[12px] font-bold rounded-[10px] transition-colors cursor-pointer inline-flex items-center gap-1.5';

/** Secondary action styling for the top bar. */
export const editorSecondaryButtonClass =
  'h-10 px-3.5 bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold rounded-[10px] transition-colors cursor-pointer inline-flex items-center gap-1.5';

export const EditorShell: React.FC<EditorShellProps> = ({
  eyebrow,
  title,
  backTab,
  formId,
  saveLabel,
  isDirty,
  secondaryAction,
  children,
}) => {
  const router = useRouter();

  // Native guard for tab close / reload. In-app navigation is guarded by handleBack.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  // Cmd/Ctrl+S submits through the form, so it runs the same validation as the button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [formId]);

  const handleBack = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    router.push(`/admin?tab=${backTab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#071126] flex flex-col">
      <EditorTopBar
        eyebrow={eyebrow}
        title={title}
        onBack={handleBack}
        backLabel="Back to admin console"
        status={isDirty ? 'Unsaved changes' : undefined}
      >
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className={`${editorSecondaryButtonClass} hidden sm:inline-flex`}
          >
            {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
            {secondaryAction.label}
          </button>
        )}
        <button
          type="submit"
          form={formId}
          title={`${saveLabel} (⌘S / Ctrl+S)`}
          className={editorPrimaryButtonClass}
        >
          <Save className="w-4 h-4" />
          {saveLabel}
        </button>
      </EditorTopBar>

      {children}
    </div>
  );
};

/** Left form pane / right live-preview pane, shared by all three editors. */
export const EditorPanes: React.FC<{ form: React.ReactNode; preview: React.ReactNode }> = ({
  form,
  preview,
}) => (
  <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
    <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
      {form}
    </div>
    <div className="w-full lg:w-1/2 p-4 sm:p-6 bg-[#F8FBFB] lg:overflow-y-auto">{preview}</div>
  </div>
);

/** Section wrapper inside an editor form pane. */
export const EditorSection: React.FC<{
  icon?: LucideIcon;
  title: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, hint, children }) => (
  <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] space-y-4">
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[13px] font-bold text-[#071126] flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#0D918A]" />}
        {title}
      </h2>
      {hint && <span className="text-[11px] text-[#58708A] shrink-0">{hint}</span>}
    </div>
    {children}
  </section>
);

/** Labelled field wrapper — keeps every input in the editors labelled and evenly spaced. */
export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, hint, children, className = '' }) => (
  <label className={`block space-y-1 ${className}`}>
    <span className="text-[12px] font-semibold text-[#071126]">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-[#58708A]">{hint}</span>}
  </label>
);

/** Shared input/select/textarea styling so all three editors match. */
export const inputClass =
  'w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors';
export const textareaClass =
  'w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-[10px] text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors resize-y';

/** Shown while an /admin/…/[id] record is being loaded from the server. */
export const EditorLoading: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
    <div className="max-w-sm w-full p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-4 shadow-2xs animate-in fade-in duration-150">
      <div className="w-9 h-9 border-3 border-[#0D918A]/20 border-t-[#0D918A] rounded-full animate-spin mx-auto" />
      <div className="space-y-1">
        <h1 className="text-[14.5px] font-bold text-[#071126]">{label}</h1>
        <p className="text-[12px] text-[#58708A]">Fetching data from server…</p>
      </div>
    </div>
  </div>
);

/** Shown when an /admin/…/[id] route points at a record that no longer exists. */
export const EditorNotFound: React.FC<{ label: string; backTab: string }> = ({ label, backTab }) => (
  <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
    <div className="max-w-sm w-full p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-3 shadow-2xs">
      <h1 className="text-base font-bold text-[#071126]">{label} not found</h1>
      <p className="text-[13px] text-[#58708A] leading-relaxed">
        It may have been deleted, or the link is out of date.
      </p>
      <Link
        href={`/admin?tab=${backTab}`}
        className="h-10 px-4 bg-[#0D918A] hover:bg-[#087C76] text-white text-[12px] font-semibold rounded-[10px] transition-colors inline-flex items-center justify-center cursor-pointer"
      >
        Back to list
      </Link>
    </div>
  </div>
);
