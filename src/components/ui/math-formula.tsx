// src/components/ui/math-formula.tsx
'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Censura estrictamente el símbolo de sumatoria (Σ o \sum) y lo reemplaza
 * por texto explícito, respetando el criterio pedagógico de la cátedra.
 * Solo elimina \sum si es un comando KaTeX válido (seguido de límite o espacio),
 * para no romper palabras que lo contengan.
 */
function censorSummation(formula: string): string {
  return formula
    .replace(/\\sum(?=[_{^\\\s]|$)/g, '\\text{Total }')
    .replace(/\\Sigma/g, '\\text{Total }')
    .replace(/Σ/g, 'Total');
}

/**
 * Renderizador de fórmulas matemáticas KaTeX a prueba de fallos de hidratación.
 * El HTML de KaTeX es seguro (KaTeX escapa la entrada); si el render falla,
 * se muestra el texto plano escapado por React (sin dangerouslySetInnerHTML).
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  displayMode = false,
  className = '',
}) => {
  const rendered = useMemo<{ html: string } | null>(() => {
    if (!formula) return null;
    try {
      const sanitized = censorSummation(formula);
      const html = katex.renderToString(sanitized, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
      return { html };
    } catch (err) {
      console.warn('KaTeX rendering warning:', err);
      return null;
    }
  }, [formula, displayMode]);

  // Sin resultado (SSR inicial o error de KaTeX): texto plano seguro.
  if (!rendered) {
    return (
      <span className={`font-mono text-xs text-slate-700 dark:text-slate-200 select-all ${className}`}>
        {formula}
      </span>
    );
  }

  if (displayMode) {
    return (
      <div
        suppressHydrationWarning
        className={`overflow-x-auto py-2 my-1 text-center select-all ${className}`}
        dangerouslySetInnerHTML={{ __html: rendered.html }}
      />
    );
  }

  return (
    <span
      suppressHydrationWarning
      className={`inline-block align-middle select-all ${className}`}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );
};
