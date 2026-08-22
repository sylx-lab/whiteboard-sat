'use client';

import React, { useRef } from 'react';
import { Bold, Italic, Sigma } from 'lucide-react';

interface TiptapRichMathEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  compact?: boolean;
}

export const TiptapRichMathEditor: React.FC<TiptapRichMathEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Type text...',
  rows = 3,
  compact = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) {
      onChange(value + prefix + suffix);
      return;
    }

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const textBefore = value.substring(0, start);
    const selectedText = value.substring(start, end);
    const textAfter = value.substring(end);

    const inserted = prefix + (selectedText || '') + suffix;
    const newValue = textBefore + inserted + textAfter;

    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      }
    }, 0);
  };

  return (
    <div className="space-y-1 text-xs">
      {label && <label className="block font-bold text-slate-700 text-xs mb-0.5">{label}</label>}

      {/* Sleek Input Container */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden focus-within:bg-white focus-within:border-[#0D918A] focus-within:ring-2 focus-within:ring-teal-100 transition-all">
        {/* Minimal Floating Header Bar */}
        {!compact && (
          <div className="bg-slate-100/60 px-3 py-1.5 border-b border-slate-200/60 flex items-center justify-between text-slate-600 select-none">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => insertAtCursor('**', '**')}
                className="p-1 hover:bg-slate-200/80 text-slate-700 rounded-md cursor-pointer transition-colors"
                title="Bold"
              >
                <Bold className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor('*', '*')}
                className="p-1 hover:bg-slate-200/80 text-slate-700 rounded-md cursor-pointer transition-colors"
                title="Italic"
              >
                <Italic className="w-3 h-3" />
              </button>

              <div className="h-3.5 w-[1px] bg-slate-300 mx-1" />

              <button
                type="button"
                onClick={() => insertAtCursor('$', '$')}
                className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-[#0D918A] font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer border border-teal-200/60"
                title="Insert Inline Math Equation ($x$)"
              >
                <Sigma className="w-3 h-3" />
                <span>Inline Math ($x$)</span>
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('$$', '$$')}
                className="px-2 py-0.5 bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                title="Insert Block Math Equation ($$x$$)"
              >
                <span>Block Math ($$)</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">KaTeX</span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 bg-transparent text-slate-900 text-xs font-mono focus:outline-none resize-y"
        />
      </div>
    </div>
  );
};
