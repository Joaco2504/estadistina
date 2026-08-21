// src/components/ui/StatisticalLoader.tsx
'use client';

import React from 'react';

interface StatisticalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  className?: string;
}

export const StatisticalLoader: React.FC<StatisticalLoaderProps> = ({
  size = 'md',
  title = 'Procesando Datos Estadísticos...',
  subtitle = 'Cátedra de Estadística · IES Belén',
  className = '',
}) => {
  const scaleClass = 
    size === 'sm' ? 'scale-75' :
    size === 'lg' ? 'scale-110' : 'scale-100';

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      {/* Contenedor Orbital del Loader */}
      <div className={`stat-loader-container relative ${scaleClass} transition-transform`}>
        <div className="stat-loader">
          {/* Anillo Exterior: Σ (Sumatoria), x̄ (Media), σ (Desviación estándar) */}
          <div className="stat-ring stat-outer">
            <div className="stat-item stat-item-1">
              <span className="stat-symbol font-serif text-cyan-300">Σ</span>
            </div>
            <div className="stat-item stat-item-2">
              <span className="stat-symbol font-serif text-cyan-300">x̄</span>
            </div>
            <div className="stat-item stat-item-3">
              <span className="stat-symbol font-serif text-cyan-300">σ</span>
            </div>
          </div>

          {/* Anillo Intermedio: fi (Frecuencia Absoluta), Me (Mediana) */}
          <div className="stat-ring stat-middle">
            <div className="stat-item stat-item-1">
              <span className="stat-symbol font-mono text-emerald-300">fᵢ</span>
            </div>
            <div className="stat-item stat-item-2">
              <span className="stat-symbol font-mono text-emerald-300">Me</span>
            </div>
          </div>

          {/* Anillo Interior: Hi (Frecuencia Acumulada), % (Porcentaje) */}
          <div className="stat-ring stat-inner">
            <div className="stat-item stat-item-1">
              <span className="stat-symbol font-mono text-amber-300 text-xs">Hᵢ</span>
            </div>
            <div className="stat-item stat-item-2">
              <span className="stat-symbol font-mono text-amber-300 text-xs">%</span>
            </div>
          </div>

          {/* Núcleo Central Palpitante */}
          <div className="stat-core" />
        </div>
      </div>

      {/* Textos Didácticos */}
      {(title || subtitle) && (
        <div className="mt-5 space-y-1">
          {title && (
            <h4 className="text-xs sm:text-sm font-bold text-[#0F2942] dark:text-slate-200 tracking-wide animate-pulse">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
