/**
 * Cursor-aware LaTeX insertion for the visual math editor.
 *
 * Question text is stored as a `$…$` / `$$…$$` document, so inserting a symbol has
 * to know whether the caret is already inside math: `\frac{}{}` typed in prose needs
 * wrapping in `$…$`, but the same snippet inside an existing expression must not be.
 */

/** Walks the text toggling math mode, treating `$$` as one delimiter and skipping `\$`. */
export function isInsideMath(text: string, pos: number): boolean {
  let inside = false;
  let i = 0;
  const limit = Math.max(0, Math.min(pos, text.length));

  while (i < limit) {
    const char = text[i];
    if (char === '\\') {
      // Escaped character — `\$` is a literal dollar, never a delimiter.
      i += 2;
      continue;
    }
    if (char === '$') {
      // `$$` is a single display-math delimiter, so it toggles once.
      i += text[i + 1] === '$' ? 2 : 1;
      inside = !inside;
      continue;
    }
    i += 1;
  }

  return inside;
}

export interface Insertion {
  text: string;
  /** Where the caret should land: inside the first empty `{}`, else after the snippet. */
  caret: number;
  /** Length of selection to leave highlighted at `caret` (for wrapped selections). */
  selectionLength: number;
}

/**
 * Splice `latex` in at the selection.
 *
 * - Outside math, the snippet is wrapped in `$…$` so it renders.
 * - A non-empty selection is moved into the snippet's first `{}` slot, so selecting
 *   `x+1` and clicking √ gives `$\sqrt{x+1}$`.
 * - Otherwise the caret lands in the first empty `{}` ready to type.
 */
export function buildInsertion(args: {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  latex: string;
}): Insertion {
  const { text, latex } = args;
  const start = Math.max(0, Math.min(args.selectionStart, text.length));
  const end = Math.max(start, Math.min(args.selectionEnd, text.length));

  const selected = text.slice(start, end);
  const inMath = isInsideMath(text, start);

  let snippet = latex;
  let keepSelection = 0;
  if (selected && snippet.includes('{}')) {
    snippet = snippet.replace('{}', `{${selected}}`);
    keepSelection = selected.length;
  }

  const body = inMath ? snippet : `$${snippet}$`;
  const nextText = text.slice(0, start) + body + text.slice(end);

  if (keepSelection) {
    // Highlight the text we just wrapped so it can be replaced or extended.
    const offset = body.indexOf(`{${selected}}`);
    return {
      text: nextText,
      caret: start + offset + 1,
      selectionLength: keepSelection,
    };
  }

  const slot = body.indexOf('{}');
  return {
    text: nextText,
    caret: slot >= 0 ? start + slot + 1 : start + body.length,
    selectionLength: 0,
  };
}
