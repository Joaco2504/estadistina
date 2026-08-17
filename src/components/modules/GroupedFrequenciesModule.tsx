// src/components/modules/GroupedFrequenciesModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GroupedFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { 
  Calculator, 
  Layers, 
  Info
} from 'lucide-react';

// Carga dinámica exclusiva para cliente de Recharts (sin SSR para evitar bloqueos)
const HistogramVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.HistogramVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 sm:h-96 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 mt-8">
        <span className="text-xs text-slate-400 font-medium">Cargando histograma de frecuencias...</span>
      </div>
    ),
  }
);

interface GroupedFrequenciesModuleProps {
  data: GroupedFrequencyTableResult;
}

export const GroupedFrequenciesModule: React.FC<GroupedFrequenciesModuleProps> = ({
  data,
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(1);

  // Transformar datos para el gráfico de Recharts
  const chartData = data.rows.map((row) => ({
    intervalLabel: row.intervalLabel,
    marcaDeClase: row.marcaDeClase,
    fa: row.frecuenciaAbsoluta,
    p: row.porcentaje,
  }));

  const selectedRow = data.rows.find((r) => r.index === selectedRowIndex) || data.rows[0];

  return (
    <div className="space-y-8">
      {/* 1. SECCIÓN EXPLICATIVA CONDICIONAL PREVIA (R, k, A) */}
      {data.stepByStepDerivation && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl p-6 border-2 border-[#1B8A5A]/30 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 text-[#0F2942]">
            <div className="p-2 rounded-xl bg-[#1B8A5A] text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wide">
                Paso Previo: Determinación Metódica de Parámetros (R, k, A)
              </h3>
              <p className="text-xs text-slate-600">
                Al no ingresarse parámetros manuales, la cátedra calcula el Rango, la Regla de la Raíz Cuadrada y la Amplitud:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* a) Rango */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase mb-2">
                  <span>a) Rango Muestral (R)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    Paso 1
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg text-center mb-2">
                  <MathFormula formula="R = X_{\text{max}} - X_{\text{min}}" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold">Valor Máximo:</span>{' '}
                    <span className="font-mono text-slate-800">{data.parameters.xmax}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Valor Mínimo:</span>{' '}
                    <span className="font-mono text-slate-800">{data.parameters.xmin}</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                <span className="text-xs font-mono font-bold text-[#0F2942] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {data.stepByStepDerivation.rangoValue}
                </span>
              </div>
            </div>

            {/* b) Regla de la Raíz Cuadrada */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase mb-2">
                  <span>b) Cantidad de Clases (k)</span>
                  <span className="text-[10px] bg-[#1B8A5A]/10 text-[#1B8A5A] px-2 py-0.5 rounded font-mono font-bold">
                    Regla de la Raíz
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg text-center mb-2">
                  <MathFormula formula="k = \sqrt{n}" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para <span className="font-mono font-bold">n = {data.sampleSize}</span> datos, se aplica la raíz cuadrada con redondeo al entero más próximo:
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                <span className="text-xs font-mono font-bold text-[#1B8A5A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  k = {data.parameters.k} intervalos
                </span>
              </div>
            </div>

            {/* c) Amplitud */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase mb-2">
                  <span>c) Amplitud de Clase (A)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    Paso 3
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg text-center mb-2">
                  <MathFormula formula="A = \frac{R}{k}" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cociente entre el rango y la cantidad de clases calculada:
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                <span className="text-xs font-mono font-bold text-[#E67E22] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  A = {data.parameters.amplitud} {data.unit}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TABLA DE FRECUENCIAS AGRUPADAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#1B8A5A]" />
              <h3 className="text-base sm:text-lg font-bold tracking-wide">
                Tabla de Distribución de Frecuencias Agrupadas en Intervalos
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Variable: <strong className="text-white">{data.variableName}</strong> ({data.unit}) • Muestra: <span className="font-mono text-[#E67E22]">n = {data.sampleSize}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#15385B] text-slate-200 px-2.5 py-1 rounded-lg border border-[#1C4874] font-mono">
              k = {data.parameters.k} | A = {data.parameters.amplitud}
            </span>
          </div>
        </div>

        {/* Tabla Didáctica */}
        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="stat-table">
            <thead>
              <tr>
                <th title="Número de Intervalo">N°</th>
                <th title="Intervalo de Clase [Li - Ls)">Intervalo (I)</th>
                <th title="Marca de Clase: Punto medio del intervalo">Marca de Clase (Mc)</th>
                <th title="Frecuencia Absoluta: Conteo de observaciones">Frec. Absoluta (fa)</th>
                <th title="Frecuencia Relativa: fa / n">Frec. Relativa (fr)</th>
                <th title="Porcentaje: fr * 100">Porcentaje (p %)</th>
                <th title="Frecuencia Absoluta Acumulada">Frec. Abs. Acum. (Fa)</th>
                <th title="Frecuencia Relativa Acumulada">Frec. Rel. Acum. (Fr)</th>
                <th title="Porcentaje Acumulado">Porc. Acum. (P %)</th>
                <th title="Ver cálculo paso a paso">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const isSelected = selectedRowIndex === row.index;
                return (
                  <tr
                    key={row.index}
                    onClick={() => setSelectedRowIndex(row.index)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/80 font-medium' : ''
                    }`}
                  >
                    <td className="font-bold text-[#0F2942]">{row.index}</td>
                    <td className="font-mono font-semibold text-slate-800">{row.intervalLabel}</td>
                    <td className="font-mono text-[#0F2942] font-medium">{row.marcaDeClase}</td>
                    <td className="font-mono font-bold text-[#1B8A5A]">{row.frecuenciaAbsoluta}</td>
                    <td className="font-mono text-slate-700">{row.frecuenciaRelativa.toFixed(4)}</td>
                    <td className="font-mono text-slate-700">{row.porcentaje.toFixed(2)}%</td>
                    <td className="font-mono text-slate-700">{row.frecuenciaAbsolutaAcumulada}</td>
                    <td className="font-mono text-slate-700">{row.frecuenciaRelativaAcumulada.toFixed(4)}</td>
                    <td className="font-mono text-slate-700">{row.porcentajeAcumulado.toFixed(2)}%</td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRowIndex(row.index);
                        }}
                        className={`text-xs px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B8A5A] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Viendo' : 'Explicar'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Fila Estricta de Totales: Prohibición de Σ, uso de "Suma total" o "Total" */}
              <tr className="total-row">
                <td colSpan={3} className="text-right uppercase tracking-wider font-extrabold pr-4 text-[#0F2942]">
                  {data.totals.label}
                </td>
                <td className="font-mono font-black text-[#1B8A5A] text-base">
                  {data.totals.totalFa}
                </td>
                <td className="font-mono font-bold text-slate-800">
                  {data.totals.totalFr.toFixed(4)}
                </td>
                <td className="font-mono font-bold text-slate-800">
                  {data.totals.totalP.toFixed(2)}%
                </td>
                <td colSpan={4} className="text-xs text-slate-400 italic text-center font-normal">
                  — Las frecuencias acumuladas no se totalizan —
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. DESGLOSE DIDÁCTICO PASO A PASO POR COLUMNA DE LA FILA SELECCIONADA */}
        {selectedRow && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#E67E22]" />
                <h4 className="text-sm sm:text-base font-bold text-[#0F2942]">
                  Desglose Pedagógico de Cálculos para el Intervalo N° {selectedRow.index}:{' '}
                  <span className="font-mono text-[#1B8A5A]">{selectedRow.intervalLabel}</span>
                </h4>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Haga clic en cualquier fila de la tabla para inspeccionar su cálculo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Marca de Clase */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-slate-600 mb-1">
                  1. Marca de Clase (Mc)
                </div>
                <div className="text-xs text-slate-700 mb-2">
                  Punto medio entre el límite inferior y superior:
                </div>
                <div className="bg-slate-50 p-2 rounded text-center text-xs">
                  <MathFormula formula={selectedRow.stepExplanations.mc} />
                </div>
              </div>

              {/* Frecuencia Absoluta y Relativa */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-slate-600 mb-1">
                  2. Frecuencia Relativa (fr)
                </div>
                <div className="text-xs text-slate-700 mb-2">
                  Proporción de fa respecto a la muestra n:
                </div>
                <div className="bg-slate-50 p-2 rounded text-center text-xs">
                  <MathFormula formula={selectedRow.stepExplanations.fr} />
                </div>
              </div>

              {/* Porcentaje */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-slate-600 mb-1">
                  3. Porcentaje (p)
                </div>
                <div className="text-xs text-slate-700 mb-2">
                  Expresión porcentual del intervalo:
                </div>
                <div className="bg-slate-50 p-2 rounded text-center text-xs">
                  <MathFormula formula={selectedRow.stepExplanations.p} />
                </div>
              </div>

              {/* Frecuencias Acumuladas */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-slate-600 mb-1">
                  4. Acumulados (Fa, Fr, P)
                </div>
                <div className="text-xs text-slate-700 mb-2">
                  Suma sucesiva de frecuencias hasta este intervalo:
                </div>
                <div className="bg-slate-50 p-2 rounded text-center text-xs space-y-1">
                  <MathFormula formula={selectedRow.stepExplanations.faAcum} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MÓDULO GRÁFICO AUTOMÁTICO (HISTOGRAMA) */}
      <HistogramVisualizer
        title={`Histograma de Frecuencias: ${data.variableName}`}
        xLabel={`Intervalos de Clase [${data.unit}]`}
        yLabel="Frecuencia Absoluta (fa)"
        data={chartData}
      />
    </div>
  );
};
