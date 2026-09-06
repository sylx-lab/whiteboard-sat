import katex from 'katex';

/**
 * Formats a raw string containing math notation (LaTeX delimiters, raw LaTeX macros, or caret exponents)
 * into styled KaTeX HTML.
 */
export function formatMathString(rawText: string): string {
  if (!rawText) return '';

// Store tokens for already rendered KaTeX blocks to prevent re-processing and avoid collisions with markdown
  const tokens: string[] = [];
  const saveToken = (html: string) => {
    const placeholder = `@@@KATEX_TOKEN_${tokens.length}@@@`;
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

  // 1. Replace display math \[...\]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    return saveToken(renderKatexSafe(math, true));
  });

  // 2. Replace display math $$...$$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, math, offset, fullString) => {
    const lineBefore = fullString.substring(0, offset).split('\n').pop() || '';
    const lineAfter = fullString.substring(offset + match.length).split('\n')[0] || '';
    const isEmbeddedInText = lineBefore.trim().length > 0 || lineAfter.trim().length > 0;
    const html = renderKatexSafe(math, !isEmbeddedInText);
    return saveToken(html);
  });

  // 3. Replace inline math \(...\)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    return saveToken(renderKatexSafe(math, false));
  });

  // 4. Replace single-dollar inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const html = renderKatexSafe(math, false);
    return saveToken(html);
  });

  // 5. Process raw LaTeX commands outside $ (e.g. \frac{1}{2}, \sqrt{5}, \pi, \pm, \Phi, etc.)
  const latexMacroRegex = /\\(frac|sqrt|pm|mp|times|div|cdot|approx|neq|le|ge|leq|geq|pi|theta|alpha|beta|gamma|delta|Delta|lambda|mu|rho|sigma|Sigma|phi|Phi|omega|Omega|circ|degree|overline|left|right|sin|cos|tan|log|ln|sum|prod|int|infty|equiv|triangle|angle|perp|parallel|cong|sim)\b(?:\{[^{}]*\}|\[[^\[\]]*\]|\([^\(\)]*\)|[^\s$]*)*/g;
  processed = processed.replace(latexMacroRegex, (match) => {
    const html = renderKatexSafe(match, false);
    return saveToken(html);
  });

  // 6. Normalize common unicode math exponents like ² and ³
  processed = processed.replace(/²([^\w]|$)/g, '^2$1').replace(/³([^\w]|$)/g, '^3$1');

  // 7. Process caret notation exponents outside $ (e.g. -x^10, x^7, (x+1)^2, 2^(n-1), 10^-4, x^{10})
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

  // 8. Process standalone unicode math symbols outside $ (±, ≥, ≤, ≠, ×, ÷)
  const unicodeMathRegex = /([±≥≤≠×÷])/g;
  const unicodeToLatex: Record<string, string> = {
    '±': '\\pm',
    '≥': '\\geq',
    '≤': '\\leq',
    '≠': '\\neq',
    '×': '\\times',
    '÷': '\\div',
  };
  processed = processed.replace(unicodeMathRegex, (char) => {
    const macro = unicodeToLatex[char];
    if (macro) {
      return saveToken(renderKatexSafe(macro, false));
    }
    return char;
  });

  // 9. Process Markdown bold & italic formatting on prose
  // ***bold italic*** or ___bold italic___
  processed = processed.replace(/\*\*\*(?!\s)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>');
  processed = processed.replace(/___(?!\s)([\s\S]*?\S)___/g, '<strong><em>$1</em></strong>');

  // **bold** or __bold__
  processed = processed.replace(/\*\*(?!\s)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__(?!\s)([\s\S]*?\S)__/g, '<strong>$1</strong>');

  // *italic* or _italic_
  processed = processed.replace(/\*(?!\s)([^*\n]*?\S)\*/g, '<em>$1</em>');
  processed = processed.replace(/(?:^|(?<=[\s("'\[{]))_([^_ \n]|[^_\n]*?\S)_(?=[\s)"'\]},.;:!?]|$)/g, '<em>$1</em>');

  // 10. Restore KaTeX tokens
  tokens.forEach((html, i) => {
    processed = processed.replace(`@@@KATEX_TOKEN_${i}@@@`, () => html);
  });

  // 11. Convert newlines to breaks cleanly
  processed = processed.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

  return processed;
}
