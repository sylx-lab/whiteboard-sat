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

    // Replace display math $$...$$ first
    let processed = rawText.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX error:', err);
        return `<span class="text-rose-500">[Math: ${math}]</span>`;
      }
    });

    // Replace inline math $...$
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

    // Convert newlines to breaks for regular paragraphs if no HTML wrapper
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
