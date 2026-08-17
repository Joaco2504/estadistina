// src/components/ui/math-formula.tsx
'use client';

import React, { useState, useEffect } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renderizador de fórmulas matemáticas KaTeX a prueba de fallos de hidratación.
 * Censura estrictamente el símbolo de sumatoria (Σ o \sum) y lo reemplaza por texto explícito.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode = false,
  className = '',
}) => {
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  useEffect(() => {
    if (!formula) {
      setRenderedHtml('');
      return;
    }

    try {
      // Limpieza estricta: Reemplazar cualquier sumatoria por texto descriptivo
      const sanitized = formula
        .replace(/\\sum_\{[^}]*\}\^\{[^}]*\}/g, '\\text{Total }')
        .replace(/\\sum/g, '\\text{Total }')
        .replace(/\\Sigma/g, '\\text{Total }')
        .replace(/Σ/g, 'Total');

      const html = katex.renderToString(sanitized, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
      setRenderedHtml(html);
    } catch (err) {
      console.warn('KaTeX rendering warning:', err);
      setRenderedHtml(`<span class="font-mono text-xs">${formula}</span>`);
    }
  }, [formula, displayMode]);

  // Durante el renderizado SSR inicial o antes de montar, muestra texto plano seguro
  if (!renderedHtml) {
    return (
      <span className={`font-mono text-xs text-slate-700 select-all ${className}`}>
        {formula}
      </span>
    );
  }

  if (displayMode) {
    return (
      <div
        suppressHydrationWarning
        className={`overflow-x-auto py-2 my-1 text-center select-all ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span
      suppressHydrationWarning
      className={`inline-block align-middle select-all ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
