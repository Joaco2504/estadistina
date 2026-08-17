// src/components/layout/HeaderLogo.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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

  // Configuraciones rígidas por tamaño
  const config = {
    sm: {
      boxSize: 'w-9 h-9 min-w-[36px] max-w-[36px] min-h-[36px] max-h-[36px]',
      px: 36,
      titleClass: 'text-xs font-bold',
      subClass: 'text-[10px]',
      badgeClass: 'text-[9px] px-1.5 py-0.2',
    },
    md: {
      boxSize: 'w-11 h-11 min-w-[44px] max-w-[44px] min-h-[44px] max-h-[44px]',
      px: 44,
      titleClass: 'text-sm font-bold',
      subClass: 'text-[11px]',
      badgeClass: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      boxSize: 'w-16 h-16 min-w-[64px] max-w-[64px] min-h-[64px] max-h-[64px]',
      px: 64,
      titleClass: 'text-lg font-extrabold',
      subClass: 'text-xs',
      badgeClass: 'text-xs px-2.5 py-0.5',
    },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Contenedor Cuadrado Rígido y Protegido */}
      <div
        className={`${config.boxSize} relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2942] to-[#15385B] p-1 border border-white/20 shadow-sm overflow-hidden aspect-square`}
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1B8A5A]/20 rounded-lg p-0.5 text-center">
            <span className="text-[10px] font-black tracking-tighter text-[#E67E22] leading-none">IES</span>
            <span className="text-[8px] font-bold text-white leading-none mt-0.5">BELÉN</span>
          </div>
        )}
      </div>

      {/* Identidad Institucional */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`${config.titleClass} text-white tracking-wide font-sans`}>
            I.E.S. de Belén
          </span>
          <span className={`bg-[#1B8A5A] text-white font-semibold rounded-full uppercase tracking-wider ${config.badgeClass}`}>
            Tecnicatura SySO
          </span>
        </div>

        {showSubtitle && (
          <span className={`${config.subClass} text-slate-300 font-medium line-clamp-1 mt-0.5`}>
            Estadística, Probabilidad y Costos de la Seguridad
          </span>
        )}
      </div>
    </div>
  );
};
