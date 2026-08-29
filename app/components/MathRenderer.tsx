import React, { useMemo } from 'react';
import { formatMathString } from '../lib/mathFormat';

interface MathRendererProps {
  content?: string;
  text?: string;
  className?: string;
  inline?: boolean;
}

export { formatMathString };

export const MathRenderer: React.FC<MathRendererProps> = ({ content, text, className = '', inline = false }) => {
  const rawText = content ?? text ?? '';
  const renderedContent = useMemo(() => formatMathString(rawText), [rawText]);

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
