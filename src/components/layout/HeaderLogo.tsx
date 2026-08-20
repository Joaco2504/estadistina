// src/components/layout/HeaderLogo.tsx
'use client';

import React, { useState } from 'react';

interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Configuraciones por tamaño
  const config = {
    sm: {
      boxSize: 'w-8 h-8 min-w-[32px] max-w-[32px] min-h-[32px] max-h-[32px]',
      px: 32,
      titleClass: 'text-xs font-extrabold',
      subClass: 'text-[9.5px]',
      badgeClass: 'text-[8.5px] px-1.5 py-0.2',
    },
    md: {
      boxSize: 'w-10 h-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px]',
      px: 40,
      titleClass: 'text-xs sm:text-sm font-bold',
      subClass: 'text-[10px] sm:text-[11px]',
      badgeClass: 'text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5',
    },
    lg: {
      boxSize: 'w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px]',
      px: 56,
      titleClass: 'text-base sm:text-lg font-extrabold',
      subClass: 'text-xs',
      badgeClass: 'text-xs px-2.5 py-0.5',
    },
  }[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Contenedor Cuadrado Rígido y Protegido */}
      <div
        className={`${config.boxSize} relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2942] to-[#15385B] dark:from-[#0B132B] dark:to-[#1C2541] p-1 border border-white/20 dark:border-white/10 shadow-sm overflow-hidden aspect-square`}
      >
        {!imgError ? (
          <img
            src="/logo-catedra.png"
            alt="Logo Cátedra IES Belén"
            width={config.px}
            height={config.px}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Emblema Vectorial Integrado a Prueba de Fallos */
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1B8A5A]/20 dark:bg-emerald-500/20 rounded-lg p-0.5 text-center">
            <span className="text-[9px] font-black tracking-tighter text-[#E67E22] leading-none">IES</span>
            <span className="text-[7.5px] font-bold text-white leading-none mt-0.5">BELÉN</span>
          </div>
        )}
      </div>

      {/* Identidad Institucional */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`${config.titleClass} text-white tracking-wide font-sans`}>
            I.E.S. de Belén
          </span>
          <span className={`bg-[#1B8A5A] dark:bg-emerald-600 text-white font-semibold rounded-full uppercase tracking-wider ${config.badgeClass}`}>
            SySO
          </span>
        </div>

        {showSubtitle && (
          <span className={`${config.subClass} text-slate-300 dark:text-slate-400 font-medium line-clamp-1 mt-0.5`}>
            Estadística y Costos de Seguridad
          </span>
        )}
      </div>
    </div>
  );
};

