// src/components/modules/FormulaGlossaryModal.tsx
'use client';

import React from 'react';
import { MathFormula } from '@/components/ui/math-formula';
import { 
  FileText, 
  X, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Calculator,
} from 'lucide-react';

interface FormulaGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGlossaryModal: React.FC<FormulaGlossaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0F172A] w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0F2942] dark:bg-[#080D1A] p-4 sm:p-5 text-white flex items-center justify-between gap-4 flex-shrink-0 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E67E22] dark:bg-amber-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Formulario Oficial Didáctico de la Cátedra
              </h3>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                I.E.S. de Belén • Prof. Pacheco E. Joaquín • Cátedra de Estadística y SySO
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Formulario */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm">
          {/* Advertencia Pedagógica sobre Σ */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 dark:text-amber-300 block font-bold mb-0.5">
                Criterio Pedagógico de Evaluación:
              </strong>
              En esta cátedra no se utiliza el símbolo abstracto $\Sigma$. En todas las resoluciones se debe indicar explícitamente:
              <strong className="text-amber-900 dark:text-amber-300 ml-1">"Total", "Suma total", "Total por fila", "Total por columna" y "Gran Total"</strong>.
            </div>
          </div>

          {/* 1. Intervalos de Clase */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
              1. Determinación de Intervalos (Frecuencias Agrupadas)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Rango Muestral (R)</span>
                <MathFormula formula="R = X_{\text{max}} - X_{\text{min}}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Diferencia entre valor extremo superior e inferior.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-[#1B8A5A] dark:text-emerald-400 block mb-1">Regla de la Raíz (k)</span>
                <MathFormula formula="k = \sqrt{n}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Redondeo al entero exacto o superior.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-[#E67E22] dark:text-amber-400 block mb-1">Amplitud (A)</span>
                <MathFormula formula="A = \frac{R}{k}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ancho uniforme de cada intervalo.</p>
              </div>
            </div>
          </div>

          {/* 2. Columnas de Frecuencia */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0F2942] dark:text-emerald-400" />
              2. Columnas de la Tabla de Distribución
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Marca de Clase (Mc)</span>
                <MathFormula formula="Mc = \frac{L_i + L_s}{2}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Punto medio representativo del intervalo.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Frecuencia Relativa (fr)</span>
                <MathFormula formula="fr = \frac{fa}{n}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Proporción de fa respecto a n (suma total = 1.00).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Porcentaje (p %)</span>
                <MathFormula formula="p = fr \cdot 100" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Expresión porcentual (suma total = 100.00%).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Frecuencia Absoluta Acumulada (Fa)</span>
                <MathFormula formula="Fa_i = Fa_{i-1} + fa_i" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Suma progresiva de observaciones acumuladas.</p>
              </div>
            </div>
          </div>

          {/* 3. Indicadores de Higiene, Seguridad y Siniestralidad */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
              3. Índices de Siniestralidad (Norma IRAM / OIT / SRT)
            </h4>

            <div className="space-y-2.5">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-200 block">Índice de Frecuencia (IF)</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Accidentes con baja por cada millón de horas trabajadas.</span>
                </div>
                <div className="font-mono text-xs text-[#1B8A5A] dark:text-emerald-300 bg-white dark:bg-[#0A1322] p-2 rounded border border-emerald-200 dark:border-emerald-800">
                  <MathFormula formula="IF = \frac{\text{N° Accidentes} \cdot 1.000.000}{\text{HHT}}" />
                </div>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-200 block">Índice de Gravedad (IG)</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Jornadas perdidas por cada mil horas trabajadas.</span>
                </div>
                <div className="font-mono text-xs text-[#E67E22] dark:text-amber-400 bg-white dark:bg-[#0A1322] p-2 rounded border border-amber-200 dark:border-amber-800">
                  <MathFormula formula="IG = \frac{\text{Jornadas Perdidas} \cdot 1.000}{\text{HHT}}" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#080D1A] p-4 border-t border-slate-200 dark:border-slate-800 text-right flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0F2942] dark:bg-emerald-600 hover:bg-[#15385B] dark:hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Cerrar Formulario
          </button>
        </div>
      </div>
    </div>
  );
};

