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
 * Renderiza el imagotipo oficial logo-catedra.png en un contenedor protegido de alto contraste.
 */
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const heightClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-10 md:h-11 lg:h-[48px]',
    lg: 'h-10 sm:h-12 md:h-14 lg:h-16',
  }[size];

  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Contenedor tipo cápsula institucional con fondo blanco para contraste y legibilidad óptima */}
      <div className="bg-white hover:bg-slate-50 p-1 sm:p-1.5 rounded-xl shadow-xs border border-white/20 transition-all flex items-center">
        <img
          src="/logo-catedra.png"
          alt="Cátedra de Estadística, Cálculo de Probabilidad y Costos de la Seguridad - I.E.S. de Belén"
          width={1536}
          height={471}
          className={`${heightClasses} w-auto object-contain`}
        />
      </div>
    </div>
  );
};
