import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Renderiza expresiones en LaTeX usando KaTeX.
 * Si ocurre un error de sintaxis, muestra el texto sin romper la interfaz.
 */
export const Latex: React.FC<LatexProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math.replace(
        /[&<>"']/g,
        (character) =>
          ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
      );
    }
  }, [math, block]);

  return (
    <span
      className={`${block ? 'math-block' : 'math-inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
