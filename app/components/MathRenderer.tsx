import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string;
  text?: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, text, className = '', inline = false }) => {
  const rawText = content ?? text ?? '';
  const renderedContent = useMemo(() => {
    if (!rawText) return '';

    // 1. Convert inline double-dollar math embedded inside sentences into single inline math if surrounded by prose
    const textToProcess = rawText;

    // Replace display math $$...$$
    let processed = textToProcess.replace(/\$\$([\s\S]*?)\$\$/g, (match, math, offset, fullString) => {
      // Check if surrounded by text on the same line (not standalone block)
      const lineBefore = fullString.substring(0, offset).split('\n').pop() || '';
      const lineAfter = fullString.substring(offset + match.length).split('\n')[0] || '';
      const isEmbeddedInText = lineBefore.trim().length > 0 || lineAfter.trim().length > 0;

      try {
        return katex.renderToString(math.trim(), {
          displayMode: !isEmbeddedInText, // Use inline mode if surrounded by text!
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX error:', err);
        return `<span class="text-rose-500">[Math: ${math}]</span>`;
      }
    });

    // 2. Replace single-dollar inline math $...$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX error:', err);
        return `<span class="text-rose-500">[Math: ${math}]</span>`;
      }
    });

    // 3. Convert newlines to breaks cleanly
    processed = processed.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

    return processed;
  }, [rawText]);

  if (inline) {
    return (
      <span
        className={`math-rendered-content ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }

  return (
    <div
      className={`math-rendered-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};
