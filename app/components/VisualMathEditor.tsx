'use client';

import React, { useMemo, useRef, useState } from 'react';
import katex from 'katex';
import { Bold, Italic, Sigma, ChevronDown, Eye, List, Maximize2, Minimize2, X } from 'lucide-react';
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
  const fullscreenTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showRender, setShowRender] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Tracked in state, not read off the ref during render, so the palette hint
  // actually updates as the caret moves.
  const [caretPos, setCaretPos] = useState(0);

  const activeRef = isFullscreen ? fullscreenTextareaRef : textareaRef;

  const applyInsertion = (latex: string) => {
    const el = activeRef.current;
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
    const el = activeRef.current;
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

  const insertBullet = (style: 'dot' | 'alpha' = 'dot') => {
    const el = activeRef.current;
    const isAlpha = style === 'alpha';
    const prefixFor = (i: number) => (isAlpha ? `${String.fromCharCode(65 + (i % 26))}. ` : '• ');

    if (!el) {
      onChange(value ? `${value}\n${prefixFor(0)}` : prefixFor(0));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selection = value.slice(start, end);
    const after = value.slice(end);

    if (selection) {
      const hasAlpha = /^[A-Z]\.\s/.test(selection.split('\n')[0] ?? '');
      const hasDot = selection.split('\n')[0]?.startsWith('• ') ?? false;
      // If selection already looks like same style, strip it (toggle off)
      if ((isAlpha && hasAlpha) || (!isAlpha && hasDot)) {
        const stripped = selection
          .split('\n')
          .map((line) => line.replace(/^([•]\s|[A-Z]\.\s)/, ''))
          .join('\n');
        onChange(before + stripped + after);
        return;
      }
      const bulleted = selection
        .split('\n')
        .map((line, i) => {
          if (!line.trim()) return line;
          // remove other style then apply
          const clean = line.replace(/^([•]\s|[A-Z]\.\s)/, '');
          return `${prefixFor(i)}${clean}`;
        })
        .join('\n');
      onChange(before + bulleted + after);
    } else {
      // No selection — continue letter sequence if previous line is A., B. etc
      let insertion = prefixFor(0);
      if (isAlpha) {
        const upto = value.slice(0, start);
        const lastLine = upto.split('\n').pop() ?? '';
        const m = lastLine.match(/^([A-Z])\.\s/);
        if (m) {
          const nextCode = m[1].charCodeAt(0) + 1;
          if (nextCode <= 90) insertion = `${String.fromCharCode(nextCode)}. `;
        }
      }
      onChange(before + insertion + after);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    }
  };

  const handleListEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) return; // don't hijack when range selected

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const line = value.slice(lineStart, start);

    const dotM = line.match(/^(\s*)•\s(.*)$/);
    const alphaM = line.match(/^(\s*)([A-Z])\.\s(.*)$/);

    if (!dotM && !alphaM) return;

    e.preventDefault();
    const isAlpha = !!alphaM;
    const indent = (dotM?.[1] ?? alphaM?.[1] ?? '');
    const content = (dotM?.[2] ?? alphaM?.[3] ?? '');

    let newText: string;
    let newCaret: number;

    if (!content.trim()) {
      // Empty list item -> exit list: strip the marker
      newText = value.slice(0, lineStart) + indent + value.slice(start);
      newCaret = lineStart + indent.length;
    } else if (isAlpha) {
      const cur = alphaM![2];
      const next = cur === 'Z' ? 'Z' : String.fromCharCode(cur.charCodeAt(0) + 1);
      // If at Z stay at Z to avoid wrapping to [; user can fix manually
      const prefix = `${next}. `;
      newText = value.slice(0, start) + '\n' + indent + prefix + value.slice(start);
      newCaret = start + 1 + indent.length + prefix.length;
    } else {
      const prefix = '• ';
      newText = value.slice(0, start) + '\n' + indent + prefix + value.slice(start);
      newCaret = start + 1 + indent.length + prefix.length;
    }

    onChange(newText);
    setCaretPos(newCaret);
    setTimeout(() => {
      el.setSelectionRange(newCaret, newCaret);
    }, 0);
  };

  const caretInMath = isInsideMath(value, caretPos);
  const hasMath = value.includes('$');

  const toolButton =
    'h-7 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1';

  const renderToolbar = (isFullModal = false) => (
    <div className="px-2 py-1.5 border-b border-(--border) bg-(--surface-soft) flex items-center flex-wrap gap-1 select-none">
      <button
        type="button"
        onClick={() => wrapSelection('**', '**')}
        aria-label="Wrap selection in bold"
        title="Bold"
        className={`${toolButton} text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)`}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => wrapSelection('*', '*')}
        aria-label="Wrap selection in italic"
        title="Italic"
        className={`${toolButton} text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)`}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-4 bg-(--border) mx-1" aria-hidden="true" />

      {/* Bullet Point Buttons — dot and A,B,C */}
      <div className="inline-flex items-center rounded-lg overflow-hidden border border-transparent">
        <button
          type="button"
          onClick={() => insertBullet('dot')}
          title="Insert bullet (•)"
          aria-label="Insert bullet point (dot)"
          className={`${toolButton} rounded-r-none text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)`}
        >
          <List className="w-3.5 h-3.5" />
          <span>•</span>
        </button>
        <button
          type="button"
          onClick={() => insertBullet('alpha')}
          title="Insert A, B, C list — selects multiple lines to convert to A. B. C."
          aria-label="Insert A,B,C list"
          className={`${toolButton} rounded-l-none border-l border-(--border) text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)`}
        >
          <span className="font-mono font-bold text-[11px]">A.</span>
        </button>
      </div>

      <span className="w-px h-4 bg-(--border) mx-1" aria-hidden="true" />

      <button
        type="button"
        onClick={() => wrapSelection('$', '$')}
        title="Wrap the selection in inline math — $x$"
        className={`${toolButton} bg-(--brand-soft) text-(--brand-text) hover:bg-teal-100`}
      >
        <Sigma className="w-3.5 h-3.5" />
        Inline
      </button>
      <button
        type="button"
        onClick={() => wrapSelection('$$', '$$')}
        title="Wrap the selection in a centred block equation — $$x$$"
        className={`${toolButton} text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)`}
      >
        Block
      </button>

      {!compact && (
        <>
          <span className="w-px h-4 bg-(--border) mx-1" aria-hidden="true" />
          {SYMBOL_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              aria-expanded={openGroup === group.id}
              onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
              title={`${group.label} symbols`}
              className={`${toolButton} ${openGroup === group.id
                  ? 'bg-(--surface) text-(--brand-text) border border-(--brand)'
                  : 'text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)'
                }`}
            >
              {group.label}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${openGroup === group.id ? 'rotate-180' : ''
                  }`}
              />
            </button>
          ))}
        </>
      )}

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShowRender(!showRender)}
          aria-pressed={showRender}
          title={showRender ? 'Hide the rendered result' : 'Show the rendered result'}
          className={`${toolButton} ${showRender ? 'text-(--brand-text)' : 'text-(--foreground-secondary) hover:text-(--foreground)'
            }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullModal ? 'Exit full screen (Esc)' : 'Expand to full screen'}
          aria-label={isFullModal ? 'Exit full screen' : 'Expand to full screen'}
          className={`${toolButton} ${isFullModal
              ? 'bg-(--surface) text-(--brand-text) border border-(--brand)'
              : 'text-(--foreground-secondary) hover:bg-(--brand-soft) hover:text-(--foreground)'
            }`}
        >
          {isFullModal ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isFullModal ? 'Exit Full Screen' : 'Full Screen'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-1">
      {label && <label className="block text-[12px] font-semibold text-(--foreground)">{label}</label>}

      <div className="bg-(--surface) rounded-[10px] border border-(--border) overflow-hidden focus-within:border-(--brand) transition-colors">
        {renderToolbar(false)}

        {/* Symbol palette — every face is the actual rendered symbol. */}
        {openGroup && (
          <div className="px-2 py-2 border-b border-(--border) bg-(--surface) animate-in fade-in duration-100">
            <div className="flex flex-wrap gap-1">
              {SYMBOL_GROUPS.find((g) => g.id === openGroup)?.symbols.map((sym) => (
                <button
                  key={sym.insert + sym.title}
                  type="button"
                  onClick={() => applyInsertion(sym.insert)}
                  title={sym.title}
                  aria-label={sym.title}
                  className="min-w-9 h-9 px-2 rounded-lg border border-(--border) bg-(--surface) hover:bg-(--brand-soft) hover:border-(--brand) text-(--foreground) transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  {sym.text ? (
                    <span className="text-[11px] font-mono">{sym.text}</span>
                  ) : (
                    <SymbolFace latex={sym.display ?? sym.insert.replace(/\{\}/g, '{\\square}')} />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-(--foreground-secondary) mt-2">
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
          onKeyDown={handleListEnter}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          className="w-full px-3 py-2.5 bg-transparent text-(--foreground) text-[12px] font-mono focus:outline-none resize-y block"
        />

        {/* Live render of this field, right where it is being typed. */}
        {showRender && (hasMath || value.includes('•') || value.includes('**')) && (
          <div className="px-3 py-2.5 border-t border-(--border) bg-(--surface-soft) text-[13px] text-(--foreground) leading-relaxed">
            <MathRenderer content={value} />
          </div>
        )}
      </div>

      {/* FULLSCREEN EXPANDED MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-(--surface) w-full max-w-5xl h-[88vh] rounded-2xl border border-(--border) shadow-2xl flex flex-col overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-(--border) flex items-center justify-between bg-(--surface)">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] text-(--foreground)">
                  {label || ariaLabel || 'Full Screen Editor'}
                </span>
                <span className="text-[11px] text-(--foreground-secondary) font-mono">
                  ({value.length} characters)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) rounded-lg transition-colors cursor-pointer"
                title="Close full screen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderToolbar(true)}

            {openGroup && (
              <div className="px-3 py-2 border-b border-(--border) bg-(--surface) max-h-36 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {SYMBOL_GROUPS.find((g) => g.id === openGroup)?.symbols.map((sym) => (
                    <button
                      key={sym.insert + sym.title}
                      type="button"
                      onClick={() => applyInsertion(sym.insert)}
                      title={sym.title}
                      aria-label={sym.title}
                      className="min-w-9 h-9 px-2 rounded-lg border border-(--border) bg-(--surface) hover:bg-(--brand-soft) hover:border-(--brand) text-(--foreground) transition-colors cursor-pointer inline-flex items-center justify-center"
                    >
                      {sym.text ? (
                        <span className="text-[11px] font-mono">{sym.text}</span>
                      ) : (
                        <SymbolFace latex={sym.display ?? sym.insert.replace(/\{\}/g, '{\\square}')} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-(--border) overflow-hidden">
              <div className="h-full flex flex-col p-3 sm:p-4 overflow-hidden bg-(--surface)">
                <label className="text-[11px] font-bold uppercase tracking-wider text-(--foreground-secondary) mb-2 block">
                  Source Editor
                </label>
                <textarea
                  ref={fullscreenTextareaRef}
                  value={value}
                  onChange={(e) => {
                    setCaretPos(e.target.selectionStart);
                    onChange(e.target.value);
                  }}
                  onSelect={(e) => setCaretPos((e.target as HTMLTextAreaElement).selectionStart)}
                  onKeyDown={handleListEnter}
                  placeholder={placeholder}
                  className="w-full flex-1 p-3 bg-(--surface-soft) border border-(--border) rounded-xl text-[13.5px] font-mono text-(--foreground) focus:outline-none focus:border-(--brand) resize-none leading-relaxed"
                />
              </div>

              <div className="h-full flex flex-col p-3 sm:p-4 overflow-hidden bg-(--brand-soft)/40">
                <label className="text-[11px] font-bold uppercase tracking-wider text-(--brand-text) mb-2 block">
                  Live Formatted Output
                </label>
                <div className="flex-1 p-4 bg-(--surface) border border-(--border) rounded-xl overflow-y-auto text-[14.5px] text-(--foreground) leading-[1.8] font-serif">
                  {value.trim() ? (
                    <MathRenderer content={value} />
                  ) : (
                    <span className="text-(--foreground-muted) italic font-sans text-[13px]">
                      Formatted preview will render here...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-(--border) bg-(--surface) flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-5 py-2 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
