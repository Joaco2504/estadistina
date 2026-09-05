// src/components/layout/HeaderLogo.tsx
'use client';

import React from 'react';
import { InstitutionalShieldLogo } from '@/components/ui/InstitutionalShieldLogo';

interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Componente de Identidad Visual Institucional para el Header y Footer
 * Layout: [Escudo con Curva de Campana] [Nombre: I.E.S. de Belén + SySO]
 */
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  // Configuraciones de dimensiones y tipografía
  const config = {
    sm: {
      shieldSize: 30,
      titleClass: 'text-xs font-black',
      subClass: 'text-[9.5px]',
      badgeClass: 'text-[8.5px] px-1.5 py-0.2',
    },
    md: {
      shieldSize: 36,
      titleClass: 'text-sm sm:text-base font-black',
      subClass: 'text-[10.5px] sm:text-[11.5px]',
      badgeClass: 'text-[9px] sm:text-[10px] px-2 py-0.5',
    },
    lg: {
      shieldSize: 48,
      titleClass: 'text-base sm:text-lg font-black',
      subClass: 'text-xs',
      badgeClass: 'text-xs px-2.5 py-0.5',
    },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Escudo Oficial Vectorial con Curva de Campana Gaussiana */}
      <InstitutionalShieldLogo size={config.shieldSize} showGlow={true} />

      {/* Nombre Institucional de Alto Contraste */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`${config.titleClass} text-white tracking-wide font-sans drop-shadow-sm`}>
            I.E.S. de Belén
          </span>
          <span className={`bg-[#1B8A5A] text-white font-black rounded-full uppercase tracking-wider shadow-xs ${config.badgeClass}`}>
            SySO
          </span>
        </div>

        {showSubtitle && (
          <span className={`${config.subClass} text-emerald-300/90 dark:text-emerald-400/90 font-medium line-clamp-1 mt-0.5 tracking-normal hidden sm:block`}>
            Cátedra de Estadística Aplicada
          </span>
        )}
      </div>
    </div>
  );
};
