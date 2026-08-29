import katex from 'katex';

/**
 * Formats a raw string containing math notation (LaTeX delimiters, raw LaTeX macros, or caret exponents)
 * into styled KaTeX HTML.
 */
export function formatMathString(rawText: string): string {
  if (!rawText) return '';

  // Store tokens for already rendered KaTeX blocks to prevent re-processing
  const tokens: string[] = [];
  const saveToken = (html: string) => {
    const placeholder = `___KATEX_TOKEN_${tokens.length}___`;
    tokens.push(html);
    return placeholder;
  };

  const renderKatexSafe = (math: string, displayMode: boolean) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
      });
    } catch (err) {
      console.error('KaTeX error:', err);
      return `<span class="text-rose-500">[Math: ${math}]</span>`;
    }
  };

  let processed = rawText;

  // 1. Replace display math $$...$$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, math, offset, fullString) => {
    const lineBefore = fullString.substring(0, offset).split('\n').pop() || '';
    const lineAfter = fullString.substring(offset + match.length).split('\n')[0] || '';
    const isEmbeddedInText = lineBefore.trim().length > 0 || lineAfter.trim().length > 0;
    const html = renderKatexSafe(math, !isEmbeddedInText);
    return saveToken(html);
  });

  // 2. Replace single-dollar inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const html = renderKatexSafe(math, false);
    return saveToken(html);
  });

  // 3. Process raw LaTeX commands outside $ (e.g. \frac{1}{2}, \sqrt{5}, \pi, \pm)
  processed = processed.replace(/\\(frac|sqrt|pm|times|div|cdot|approx|neq|le|ge|leq|geq|pi|theta|alpha|beta|gamma|sigma|mu|degree|circ)\b[^\s$]*/g, (match) => {
    const html = renderKatexSafe(match, false);
    return saveToken(html);
  });

  // 4. Process caret notation exponents outside $ (e.g. -x^10, x^7, (x+1)^2, 2^(n-1), 10^-4, x^{10})
  const caretRegex = /(?:([+-]?(?:\([^\(\)]+\)|[a-zA-Z0-9]+))\^(\{([^{}]+)\}|\(([^()]+)\)|[+-]?[a-zA-Z0-9]+))/g;
  processed = processed.replace(caretRegex, (match, base, exponentGroup, expBraces, expParens) => {
    let cleanExp = expBraces || expParens;
    if (!cleanExp) {
      const caretIdx = match.lastIndexOf('^');
      cleanExp = match.substring(caretIdx + 1);
    }
    const cleanBase = base || match.substring(0, match.indexOf('^'));
    const latexExpr = `${cleanBase}^{${cleanExp}}`;
    const html = renderKatexSafe(latexExpr, false);
    return saveToken(html);
  });

  // 5. Restore KaTeX tokens
  tokens.forEach((html, i) => {
    processed = processed.replace(`___KATEX_TOKEN_${i}___`, html);
  });

  // 6. Convert newlines to breaks cleanly
  processed = processed.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

  return processed;
}
