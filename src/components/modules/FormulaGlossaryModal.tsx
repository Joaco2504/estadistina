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
  Percent,
  TrendingUp
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
      <div className="bg-white dark:bg-[#0F172A] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0F2942] dark:bg-[#080D1A] p-4 sm:p-5 text-white flex items-center justify-between gap-4 flex-shrink-0 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E67E22] dark:bg-amber-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Formulario Oficial Didáctico — Unidad N° 1
              </h3>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                I.E.S. de Belén • Tecnicatura Superior en Higiene y Seguridad • Prof. Pacheco E. Joaquín
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
                Criterio Pedagógico de Evaluación Oficial:
              </strong>
              En esta cátedra no se utiliza el símbolo abstracto $\Sigma$. En todas las resoluciones se debe indicar explícitamente en la fila de cierre:
              <strong className="text-amber-900 dark:text-amber-300 ml-1">"Total", "Suma total", "Total por fila", "Total por columna" y "Gran Total"</strong>.
            </div>
          </div>

          {/* 1. Determinación de Intervalos (Tema 3) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
              1. Determinación Didáctica de Intervalos (Frecuencias Agrupadas)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Rango Muestral (R)</span>
                <MathFormula formula="R = X_{\text{max}} - X_{\text{min}}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Diferencia entre valor extremo superior e inferior.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-[#1B8A5A] dark:text-emerald-400 block mb-1">Regla de la Raíz (k)</span>
                <MathFormula formula="k = \sqrt{n}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Redondeo al entero más próximo o superior.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-[#E67E22] dark:text-amber-400 block mb-1">Amplitud (A)</span>
                <MathFormula formula="A = \frac{R}{k}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ancho uniforme de cada intervalo.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">Marca de Clase (Mc)</span>
                <MathFormula formula="Mc = \frac{L_i + L_s}{2}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Punto medio representativo de la clase.</p>
              </div>
            </div>
          </div>

          {/* 2. Columnas de Frecuencia (Temas 2 y 3) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0F2942] dark:text-emerald-400" />
              2. Columnas de la Tabla de Distribución de Frecuencias
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Frecuencia Relativa (fr)</span>
                <MathFormula formula="fr = \frac{fa}{n}" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Proporción de fa respecto a n (Suma total = 1,00).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Porcentaje (p %)</span>
                <MathFormula formula="p = fr \cdot 100" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Expresión porcentual (Suma total = 100,00%).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Frec. Absoluta Acumulada (Fa)</span>
                <MathFormula formula="Fa_i = Fa_{i-1} + fa_i" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Suma progresiva de observaciones acumuladas.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Frec. Relativa Acumulada (Fr)</span>
                <MathFormula formula="Fr_i = \frac{Fa_i}{n} = Fr_{i-1} + fr_i" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Proporción acumulada de observaciones.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">Porcentaje Acumulado (P %)</span>
                <MathFormula formula="P = Fr \cdot 100" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Porcentaje acumulado (Última fila = 100,00%).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-[#1B8A5A] dark:text-emerald-400 block mb-1">Muestra Total (n)</span>
                <MathFormula formula="n = \text{Total } fa" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cantidad total de observaciones relevadas.</p>
              </div>
            </div>
          </div>

          {/* 3. Medidas Relativas Básicas en SySO (Tema 4) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
              3. Medidas Relativas Básicas (Proporción, Razón y Tasa)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-[#131C2E] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">A) Proporción (Parte - Todo)</span>
                <MathFormula formula="\text{Proporción} = \frac{\text{Subgrupo }(A)}{\text{Total }(N)}" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5">El numerador <strong>está incluido</strong> en el denominador. Rango: de \(0\) a \(1\) (ó \(0\%\) a \(100\%\)).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">B) Razón (Parte - Parte)</span>
                <MathFormula formula="\text{Razón} = \frac{\text{Grupo }(A)}{\text{Grupo }(B)}" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5">Compara dos grupos independientes. El numerador <strong>NO</strong> está en el denominador (ej. 50 operarios por técnico).</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#131C2E] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">C) Tasa (Evento vs. Exposición)</span>
                <MathFormula formula="\text{Tasa} = \left(\frac{\text{Eventos}}{\text{Exposición}}\right) \cdot K" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5">Velocidad de ocurrencia en el tiempo escalada con la constante \(K\) (\(1.000\) o \(1.000.000\)).</p>
              </div>
            </div>
          </div>

          {/* 4. Indicadores Oficiales de Siniestralidad (Tema 4 - SRT / IRAM 3800 / OIT) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
              4. Indicadores Oficiales de Siniestralidad Laboral (SRT / IRAM 3800 / OIT)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-100">1. Índice de Frecuencia (IF)</span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#0A1322] px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">Base 1.000.000 hs</span>
                </div>
                <div className="font-mono text-xs text-[#1B8A5A] dark:text-emerald-300 bg-white dark:bg-[#0A1322] p-2 rounded border border-emerald-200 dark:border-emerald-800">
                  <MathFormula formula="IF = \frac{\text{N° Accidentes con Baja} \cdot 1.000.000}{\text{Horas-Hombre Trabajadas (HHT)}}" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Accidentes con baja médica ocurridos por cada millón de horas persona trabajadas.</p>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-100">2. Índice de Gravedad (IG)</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-white dark:bg-[#0A1322] px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">Base 1.000.000 hs</span>
                </div>
                <div className="font-mono text-xs text-[#E67E22] dark:text-amber-400 bg-white dark:bg-[#0A1322] p-2 rounded border border-amber-200 dark:border-amber-800">
                  <MathFormula formula="IG = \frac{\text{Total Días Perdidos} \cdot 1.000.000}{\text{Horas-Hombre Trabajadas (HHT)}}" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Jornadas de trabajo no trabajadas por cada millón de horas persona trabajadas.</p>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-100">3. Índice de Incidencia (II)</span>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-[#0A1322] px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">Base 1.000 trab.</span>
                </div>
                <div className="font-mono text-xs text-blue-700 dark:text-blue-300 bg-white dark:bg-[#0A1322] p-2 rounded border border-blue-200 dark:border-blue-800">
                  <MathFormula formula="II = \frac{\text{N° Accidentes con Baja} \cdot 1.000}{\text{N° Promedio Trabajadores Expuestos}}" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Accidentes con baja ocurridos por cada mil trabajadores en la nómina.</p>
              </div>

              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-100">4. Duración Media (DM)</span>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-white dark:bg-[#0A1322] px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">Días por accidente</span>
                </div>
                <div className="font-mono text-xs text-purple-700 dark:text-purple-300 bg-white dark:bg-[#0A1322] p-2 rounded border border-purple-200 dark:border-purple-800">
                  <MathFormula formula="DM = \frac{\text{Total Días Perdidos}}{\text{N° Accidentes con Baja}}" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Promedio de días de reposo o baja médica por cada accidente ocurrido.</p>
              </div>
            </div>

            {/* Relación de coherencia */}
            <div className="p-3 bg-slate-100 dark:bg-[#0A1322] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-[#0F2942] dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
                Relación Matemática de Coherencia:
              </span>
              <div className="font-mono text-xs font-bold text-[#1B8A5A] dark:text-emerald-400 bg-white dark:bg-[#131C2E] px-3 py-1 rounded border border-slate-200 dark:border-slate-700">
                <MathFormula formula="IG = IF \cdot DM" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#080D1A] p-4 border-t border-slate-200 dark:border-slate-800 text-right flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0F2942] dark:bg-emerald-600 hover:bg-[#15385B] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            Cerrar Formulario
          </button>
        </div>
      </div>
    </div>
  );
};


