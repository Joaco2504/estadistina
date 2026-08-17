// src/components/layout/Footer.tsx
'use client';

import React from 'react';
import { ShieldCheck, BookOpen, GraduationCap, UserCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A1D30] text-slate-400 border-t border-[#15385B] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
          {/* Identidad Institucional */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1B8A5A] text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-sm sm:text-base tracking-wide">
                I.E.S. de Belén
              </span>
              <span className="bg-[#15385B] text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#1C4874]">
                Tecnicatura SySO
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial.
              Formación técnica aplicada a la prevención de riesgos, muestreo higiénico y análisis de costos.
            </p>
            <div className="text-[11px] font-mono text-[#E67E22] bg-[#0F2942] px-2.5 py-1 rounded border border-[#1C4874] inline-block">
              2° año (Plan Nuevo) / 3° año (Plan Viejo)
            </div>
          </div>

          {/* Cátedra y Docente */}
          <div className="space-y-2 md:text-right">
            <h4 className="text-white font-semibold text-xs sm:text-sm flex items-center md:justify-end gap-1.5">
              <BookOpen className="w-4 h-4 text-[#1B8A5A]" />
              <span>Estadística, Cálculo de la Probabilidad y Costos de la Seguridad</span>
            </h4>
            <p className="text-xs text-slate-300 flex items-center md:justify-end gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#E67E22]" />
              <span><strong>Docente a cargo:</strong> Prof. Pacheco E. Joaquín</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Instituto de Educación Superior de Belén • Catamarca, Argentina
            </p>
          </div>
        </div>

        {/* Barra inferior de Copyright */}
        <div className="mt-6 pt-5 border-t border-[#15385B] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} Cátedra de Estadística - I.E.S. de Belén.
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Material Didáctico Universitario</span>
            <span>•</span>
            <span>Higiene y Seguridad Industrial</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
