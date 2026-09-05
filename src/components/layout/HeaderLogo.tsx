// src/components/layout/HeaderLogo.tsx
'use client';

import React from 'react';

interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Componente de Identidad Visual Institucional Oficial de la Cátedra
 * Utiliza el escudo oficial con transparencia (favicon.png) y tipografía de alto contraste.
 * Se integra de forma limpia y profesional en fondos oscuros (header y footer) sin cajas blancas tipo pegatina.
 */
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSize = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
  }[size];

  const titleClass = {
    sm: 'text-xs font-black',
    md: 'text-sm sm:text-base font-black',
    lg: 'text-base sm:text-lg font-black',
  }[size];

  const subClass = {
    sm: 'text-[9px] sm:text-[10px]',
    md: 'text-[10px] sm:text-[11.5px]',
    lg: 'text-xs',
  }[size];

  const badgeClass = {
    sm: 'text-[8.5px] px-1.5 py-0.2',
    md: 'text-[9px] sm:text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-0.5',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Escudo Institucional Oficial con fondo transparente */}
      <img
        src="/favicon.png"
        alt="Escudo Institucional I.E.S. de Belén"
        className={`${iconSize} object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)] transition-transform duration-200 hover:scale-105`}
      />

      {/* Tipografía Institucional de Alto Contraste */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`${titleClass} text-white tracking-wide font-sans drop-shadow-xs`}>
            I.E.S. de Belén
          </span>
          <span className={`bg-[#1B8A5A] text-white font-black rounded-full uppercase tracking-wider shadow-xs ${badgeClass}`}>
            SySO
          </span>
        </div>

        {showSubtitle && (
          <span className={`${subClass} text-emerald-300/90 dark:text-emerald-400/90 font-medium line-clamp-1 mt-0.5 tracking-normal hidden xs:block sm:block`}>
            Cátedra de Estadística y Costos de la Seguridad
          </span>
        )}
      </div>
    </div>
  );
};

