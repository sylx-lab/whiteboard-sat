'use client';

import React, { useMemo, useRef, useState } from 'react';
import katex from 'katex';
import { Bold, Italic, Sigma, ChevronDown, Eye } from 'lucide-react';
import { buildInsertion, isInsideMath } from '../lib/mathInsert';
import { MathRenderer } from './MathRenderer';
import { SYMBOL_GROUPS } from '../lib/mathSymbols';

interface VisualMathEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  /** Used when the visible label lives outside this component. */
  ariaLabel?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  /** Hide the symbol palette for short fields that rarely need it. */
  compact?: boolean;
}

/** Renders one LaTeX fragment as a button face. Raw LaTeX, so no `$` delimiters. */
const SymbolFace: React.FC<{ latex: string }> = ({ latex }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return '';
    }
  }, [latex]);

  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
};

/**
 * Textarea plus a visual symbol palette: every button shows the symbol it inserts,
 * rendered with KaTeX, and insertion is caret-aware (see lib/mathInsert.ts). The
 * stored value stays plain `$…$` source, which is what MathRenderer reads.
 */
export const VisualMathEditor: React.FC<VisualMathEditorProps> = ({
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showRender, setShowRender] = useState(true);
  // Tracked in state, not read off the ref during render, so the palette hint
  // actually updates as the caret moves.
  const [caretPos, setCaretPos] = useState(0);

  const applyInsertion = (latex: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;

    const result = buildInsertion({ text: value, selectionStart: start, selectionEnd: end, latex });
    onChange(result.text);

    // Restore focus and drop the caret in the slot once React has re-rendered.
    setCaretPos(result.caret);
    setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(result.caret, result.caret + result.selectionLength);
    }, 0);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + prefix + suffix);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    onChange(value.slice(0, start) + prefix + selected + suffix + value.slice(end));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const caretInMath = isInsideMath(value, caretPos);
  const hasMath = value.includes('$');

  const toolButton =
    'h-7 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1';

  return (
    <div className="space-y-1">
      {label && <label className="block text-[12px] font-semibold text-[#071126]">{label}</label>}

      <div className="bg-white rounded-[10px] border border-[#E2E8F0] overflow-hidden focus-within:border-[#0D918A] transition-colors">
        <div className="px-2 py-1.5 border-b border-[#E2E8F0] bg-[#F8FBFB] flex items-center flex-wrap gap-1 select-none">
          <button
            type="button"
            onClick={() => wrapSelection('**', '**')}
            aria-label="Wrap selection in bold"
            title="Bold"
            className={`${toolButton} text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*')}
            aria-label="Wrap selection in italic"
            title="Italic"
            className={`${toolButton} text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-[#E2E8F0] mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={() => wrapSelection('$', '$')}
            title="Wrap the selection in inline math — $x$"
            className={`${toolButton} bg-[#F1F8F7] text-[#087C76] hover:bg-teal-100`}
          >
            <Sigma className="w-3.5 h-3.5" />
            Inline
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('$$', '$$')}
            title="Wrap the selection in a centred block equation — $$x$$"
            className={`${toolButton} text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]`}
          >
            Block
          </button>

          {!compact && (
            <>
              <span className="w-px h-4 bg-[#E2E8F0] mx-1" aria-hidden="true" />
              {SYMBOL_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  aria-expanded={openGroup === group.id}
                  onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
                  title={`${group.label} symbols`}
                  className={`${toolButton} ${
                    openGroup === group.id
                      ? 'bg-white text-[#087C76] border border-[#0D918A]'
                      : 'text-[#58708A] hover:bg-[#F1F8F7] hover:text-[#071126]'
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      openGroup === group.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ))}
            </>
          )}

          <button
            type="button"
            onClick={() => setShowRender(!showRender)}
            aria-pressed={showRender}
            title={showRender ? 'Hide the rendered result' : 'Show the rendered result'}
            className={`${toolButton} ml-auto ${
              showRender ? 'text-[#087C76]' : 'text-[#58708A] hover:text-[#071126]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Symbol palette — every face is the actual rendered symbol. */}
        {openGroup && (
          <div className="px-2 py-2 border-b border-[#E2E8F0] bg-white animate-in fade-in duration-100">
            <div className="flex flex-wrap gap-1">
              {SYMBOL_GROUPS.find((g) => g.id === openGroup)?.symbols.map((sym) => (
                <button
                  key={sym.insert + sym.title}
                  type="button"
                  onClick={() => applyInsertion(sym.insert)}
                  title={sym.title}
                  aria-label={sym.title}
                  className="min-w-9 h-9 px-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F8F7] hover:border-[#0D918A] text-[#071126] transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  {sym.text ? (
                    <span className="text-[11px] font-mono">{sym.text}</span>
                  ) : (
                    <SymbolFace latex={sym.display ?? sym.insert.replace(/\{\}/g, '{\\square}')} />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#58708A] mt-2">
              {caretInMath
                ? 'Caret is inside math — symbols insert directly.'
                : 'Symbols are wrapped in $…$ automatically. Select text first to put it inside the symbol.'}
            </p>
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => {
            setCaretPos(e.target.selectionStart);
            onChange(e.target.value);
          }}
          onSelect={(e) => setCaretPos((e.target as HTMLTextAreaElement).selectionStart)}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          className="w-full px-3 py-2.5 bg-transparent text-[#071126] text-[12px] font-mono focus:outline-none resize-y block"
        />

        {/* Live render of this field, right where it is being typed. */}
        {showRender && hasMath && (
          <div className="px-3 py-2.5 border-t border-[#E2E8F0] bg-[#F8FBFB] text-[13px] text-[#071126] leading-relaxed">
            <MathRenderer content={value} />
          </div>
        )}
      </div>
    </div>
  );
};
