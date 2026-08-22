// src/components/ui/InstitutionalShieldLogo.tsx
'use client';

import React from 'react';

interface InstitutionalShieldLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
}

/**
 * Escudo Vectorial Oficial de la Cátedra de Estadística (I.E.S. de Belén)
 * Extraído y vectorizado de la insignia institucional:
 * - Escudo bipartito: Azul Marino (#0F2942) y Verde Seguridad (#10B981).
 * - Curva de Campana de Distribución Normal (Gauss) con eje vertical medio punteado.
 * - Moneda de Costos de Seguridad ($) en el cuadrante inferior derecho.
 */
export const InstitutionalShieldLogo: React.FC<InstitutionalShieldLogoProps> = ({
  size = 38,
  className = '',
  showGlow = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 115"
      width={size}
      height={size * (115 / 100)}
      className={`flex-shrink-0 transition-transform duration-200 hover:scale-105 select-none ${
        showGlow ? 'drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]' : ''
      } ${className}`}
      aria-label="Escudo Cátedra Estadística IES Belén"
    >
      <defs>
        {/* Gradiente Azul Marino para la mitad izquierda */}
        <linearGradient id="shieldLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15385B" />
          <stop offset="100%" stopColor="#0F2942" />
        </linearGradient>

        {/* Gradiente Verde Seguridad para la mitad derecha */}
        <linearGradient id="shieldRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Gradiente Dorado para Costos de la Seguridad */}
        <linearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Máscara de recorte del Escudo */}
        <clipPath id="shieldClip">
          <path d="M50 4 C72 16 94 10 94 48 C94 82 66 100 50 108 C34 100 6 82 6 48 C6 10 28 16 50 4 Z" />
        </clipPath>
      </defs>

      {/* Sombra / Borde Exterior del Escudo */}
      <path
        d="M50 2 C74 15 97 9 97 49 C97 85 68 103 50 112 C32 103 3 85 3 49 C3 9 26 15 50 2 Z"
        fill="#071322"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Cuerpo del Escudo con Mitad Izquierda (Azul) y Derecha (Verde) */}
      <g clipPath="url(#shieldClip)">
        {/* Mitad Izquierda: Azul Marino */}
        <rect x="0" y="0" width="50" height="115" fill="url(#shieldLeftGrad)" />
        {/* Mitad Derecha: Verde Seguridad */}
        <rect x="50" y="0" width="50" height="115" fill="url(#shieldRightGrad)" />

        {/* Línea divisoria central sutil */}
        <line x1="50" y1="4" x2="50" y2="108" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

        {/* Eje Vertical Punteado de la Media (μ) */}
        <line
          x1="50"
          y1="18"
          x2="50"
          y2="78"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeDasharray="3.5,3"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Curva de Campana de Distribución Normal (Gaussiana) */}
        <path
          d="M14 74 C26 74 34 72 41 52 C46 36 47 24 50 24 C53 24 54 36 59 52 C66 72 74 74 86 74"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Resplandor suave sobre la campana */}
        <path
          d="M14 74 C26 74 34 72 41 52 C46 36 47 24 50 24 C53 24 54 36 59 52 C66 72 74 74 86 74"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Borde Interior del Escudo */}
      <path
        d="M50 4 C72 16 94 10 94 48 C94 82 66 100 50 108 C34 100 6 82 6 48 C6 10 28 16 50 4 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Moneda / Símbolo de Costos de la Seguridad ($) */}
      <g transform="translate(62, 70)">
        <circle cx="16" cy="16" r="15" fill="#071322" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="16" cy="16" r="13" fill="url(#goldCoinGrad)" />
        <text
          x="16"
          y="22.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="17"
          fontWeight="900"
          fill="#0F2942"
          textAnchor="middle"
        >
          $
        </text>
      </g>
    </svg>
  );
};
