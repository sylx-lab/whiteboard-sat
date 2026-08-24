'use client';

import React, { useRef } from 'react';
import { Bold, Italic, Sigma } from 'lucide-react';

interface MathTextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  /** Used when the visible label lives outside this component. */
  ariaLabel?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  compact?: boolean;
}

/**
 * Plain textarea with a toolbar that wraps the selection in markdown/KaTeX
 * delimiters. The stored value is the raw `$…$` source that MathRenderer reads.
 */
export const MathTextEditor: React.FC<MathTextEditorProps> = ({
  value,
  onChange,
  label,
  ariaLabel,
  placeholder = 'Type text…',
  rows = 3,
  required = false,
  compact = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + prefix + suffix);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.substring(start, end);
    onChange(value.substring(0, start) + prefix + selectedText + suffix + value.substring(end));

    // Restore the selection inside the new delimiters once React has re-rendered.
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const toolButton =
    'h-7 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1';

  return (
    <div className="space-y-1">
      {label && <label className="block text-[12px] font-semibold text-[#071126]">{label}</label>}

      <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-hidden focus-within:border-[#0D918A] transition-colors">
        {!compact && (
          <div className="px-2 py-1.5 border-b border-[#E2E8F0] bg-[#F8FBFB] flex items-center gap-1 select-none">
            <button
              type="button"
              onClick={() => insertAtCursor('**', '**')}
              aria-label="Wrap selection in bold"
              title="Bold"
              className={`${toolButton} text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('*', '*')}
              aria-label="Wrap selection in italic"
              title="Italic"
              className={`${toolButton} text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-[#E2E8F0] mx-1" aria-hidden="true" />

            <button
              type="button"
              onClick={() => insertAtCursor('$', '$')}
              title="Inline math — $x$"
              className={`${toolButton} bg-[#F1F8F7] text-[#087C76] hover:bg-teal-100`}
            >
              <Sigma className="w-3.5 h-3.5" />
              Inline math
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('$$', '$$')}
              title="Block math — $$x$$"
              className={`${toolButton} text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]`}
            >
              Block math
            </button>

            <span className="ml-auto text-[11px] text-[#58708A] font-mono pr-1">KaTeX</span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          className="w-full px-3 py-2.5 bg-transparent text-[#071126] text-[12px] font-mono focus:outline-none resize-y block"
        />
      </div>
    </div>
  );
};
