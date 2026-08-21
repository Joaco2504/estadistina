// src/components/ui/FrequencyTableSwitcher.tsx
'use client';

import React from 'react';
import { ArrowRight, BarChart2, Table2 } from 'lucide-react';

interface FrequencyTableSwitcherProps {
  activeMode: 'simple' | 'grouped';
  onSwitch: (mode: 'simple' | 'grouped') => void;
  className?: string;
}

export const FrequencyTableSwitcher: React.FC<FrequencyTableSwitcherProps> = ({
  activeMode,
  onSwitch,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-[#0A1322] rounded-full border border-slate-200/80 dark:border-slate-800 shadow-2xs ${className}`}>
      {/* Botón 1: Frecuencias Simples */}
      <button
        type="button"
        onClick={() => onSwitch('simple')}
        className={`stat-cta-btn text-xs ${activeMode === 'simple' ? 'is-active' : ''}`}
        title="Cambiar a Tabla de Frecuencias Simples (Datos Sueltos / Sin Agrupar)"
        aria-pressed={activeMode === 'simple'}
      >
        <BarChart2 className="w-3.5 h-3.5 relative z-10 cta-icon" />
        <span className="cta-text">1. Frecuencias Simples</span>
        <svg
          className="w-3.5 h-3.5 cta-icon"
          viewBox="0 0 13 10"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 5h10M8 1l4 4-4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Botón 2: Frecuencias Agrupadas */}
      <button
        type="button"
        onClick={() => onSwitch('grouped')}
        className={`stat-cta-btn text-xs ${activeMode === 'grouped' ? 'is-active' : ''}`}
        title="Cambiar a Tabla de Frecuencias Agrupadas en Intervalos de Clase"
        aria-pressed={activeMode === 'grouped'}
      >
        <Table2 className="w-3.5 h-3.5 relative z-10 cta-icon" />
        <span className="cta-text">2. Frecuencias Agrupadas</span>
        <svg
          className="w-3.5 h-3.5 cta-icon"
          viewBox="0 0 13 10"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 5h10M8 1l4 4-4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
