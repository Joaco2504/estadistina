// src/components/layout/Footer.tsx
'use client';

import React from 'react';
import { ShieldCheck, School, BookOpen, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A1D30] text-slate-400 border-t border-[#15385B] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identidad de la Cátedra */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1B8A5A] text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-white font-bold text-base tracking-wide">
                I.E.S. de Belén
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial.
              Formación técnica universitaria de excelencia aplicada a la prevención de accidentes laborales y protección del medio ambiente.
            </p>
            <div className="text-xs font-mono text-[#E67E22] bg-[#0F2942] p-2 rounded border border-[#1C4874] inline-block">
              2° año (Plan Nuevo) / 3° año (Plan Viejo)
            </div>
          </div>

          {/* Cátedra y Docente */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#1B8A5A]" />
              Cátedra Académica
            </h4>
            <p className="text-xs text-slate-300 font-medium">
              Estadística, Cálculo de la Probabilidad y Costos de la Seguridad
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Docente a cargo:</strong> Prof. Pacheco E. Joaquín
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Enfoque:</strong> Métodos cuantitativos aplicados a la evaluación de riesgos, muestreo higiénico y análisis de costos siniestrales.
            </p>
          </div>

          {/* Criterios Pedagógicos de la Cátedra */}
          <div className="space-y-2.5 bg-[#0F2942] p-4 rounded-xl border border-[#1C4874]">
            <h4 className="text-white font-semibold text-sm flex items-center gap-1.5 text-[#E67E22]">
              <AlertTriangle className="w-4 h-4" />
              Reglas Pedagógicas de la Cátedra
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li>• Sin notación abstracta de sumatoria ($\Sigma$): se utiliza terminología explícita <em>Total</em> o <em>Suma total</em>.</li>
              <li>• Regla estricta de raíz cuadrada: <span className="font-mono text-emerald-400">k = √n</span> para intervalos.</li>
              <li>• Desglose paso a paso de cada cálculo tabular y gráfico.</li>
            </ul>
          </div>
        </div>

        {/* Barra inferior de Copyright y Licencia */}
        <div className="mt-8 pt-6 border-t border-[#15385B] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Cátedra de Estadística - Instituto de Educación Superior de Belén.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Material Didáctico Universitario</span>
            <span>•</span>
            <span>Higiene y Seguridad Industrial</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
