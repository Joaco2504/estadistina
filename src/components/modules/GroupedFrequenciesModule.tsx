// src/components/modules/GroupedFrequenciesModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GroupedFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { 
  Calculator, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const HistogramVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.HistogramVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 mt-6">
        <span className="text-xs text-slate-400 font-medium">Cargando gráfico estadístico...</span>
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
  const [showDerivation, setShowDerivation] = useState<boolean>(true);

  // Transformar datos para los gráficos multi-tipo
  const chartData = data.rows.map((row) => ({
    intervalLabel: row.intervalLabel,
    marcaDeClase: row.marcaDeClase,
    fa: row.frecuenciaAbsoluta,
    p: row.porcentaje,
    Fa: row.frecuenciaAbsolutaAcumulada,
  }));

  const selectedRow = data.rows.find((r) => r.index === selectedRowIndex) || data.rows[0];

  return (
    <div className="space-y-6">
      {/* 1. SECCIÓN EXPLICATIVA PASO A PASO (R, k, A) MINIMALISTA Y PLEGABLE */}
      {data.stepByStepDerivation && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div 
            onClick={() => setShowDerivation(!showDerivation)}
            className="px-5 py-3 bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-100"
          >
            <div className="flex items-center gap-2 text-[#0F2942]">
              <Calculator className="w-4 h-4 text-[#1B8A5A]" />
              <span className="text-xs font-bold uppercase tracking-wide">
                Paso Previo: Determinación de Parámetros (R, k, A)
              </span>
              <span className="text-[10px] font-mono font-semibold text-[#1B8A5A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                k = √{data.sampleSize} = {data.parameters.k}
              </span>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-700">
              {showDerivation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showDerivation && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gradient-to-br from-slate-50/50 to-emerald-50/20">
              {/* Rango */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  1. Rango Muestral (R)
                </span>
                <div className="text-xs font-mono text-slate-700 mb-1">
                  {data.parameters.xmax} - {data.parameters.xmin} = <strong>{data.parameters.rango}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  <MathFormula formula="R = X_{\text{max}} - X_{\text{min}}" />
                </div>
              </div>

              {/* Cantidad de Clases (Regla de la Raíz) */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  2. Intervalos de Clase (k)
                </span>
                <div className="text-xs font-mono text-slate-700 mb-1">
                  √{data.sampleSize} ≈ {(Math.sqrt(data.sampleSize)).toFixed(2)} → <strong>k = {data.parameters.k}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  <MathFormula formula="k = \sqrt{n}" />
                </div>
              </div>

              {/* Amplitud */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  3. Amplitud de Clase (A)
                </span>
                <div className="text-xs font-mono text-slate-700 mb-1">
                  {data.parameters.rango} / {data.parameters.k} = <strong>{data.parameters.amplitud} {data.unit}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  <MathFormula formula="A = \frac{R}{k}" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TABLA DE FRECUENCIAS AGRUPADAS */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1B8A5A]" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Distribución de Frecuencias Agrupadas
            </h3>
            <span className="text-xs font-mono text-slate-300">
              ({data.variableName} • n = {data.sampleSize})
            </span>
          </div>

          <span className="text-xs font-mono bg-[#15385B] px-2.5 py-0.5 rounded text-slate-200 border border-[#1C4874]">
            k = {data.parameters.k} | A = {data.parameters.amplitud}
          </span>
        </div>

        {/* Tabla Didáctica Minimalista */}
        <div className="overflow-x-auto p-4">
          <table className="stat-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Intervalo (I)</th>
                <th>Marca de Clase (Mc)</th>
                <th>Frec. Absoluta (fa)</th>
                <th>Frec. Relativa (fr)</th>
                <th>Porcentaje (p %)</th>
                <th>Frec. Abs. Acum. (Fa)</th>
                <th>Frec. Rel. Acum. (Fr)</th>
                <th>Porc. Acum. (P %)</th>
                <th>Detalle</th>
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
                      isSelected ? 'bg-emerald-50/90 font-medium' : ''
                    }`}
                  >
                    <td className="font-bold text-[#0F2942]">{row.index}</td>
                    <td className="font-mono font-semibold text-slate-800">{row.intervalLabel}</td>
                    <td className="font-mono text-[#0F2942]">{row.marcaDeClase}</td>
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
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B8A5A] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Viendo' : 'Explicar'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Fila de Totales Estricta: Prohibición de Σ */}
              <tr className="total-row">
                <td colSpan={3} className="text-right uppercase font-extrabold pr-4 text-[#0F2942]">
                  {data.totals.label}
                </td>
                <td className="font-mono font-black text-[#1B8A5A]">
                  {data.totals.totalFa}
                </td>
                <td className="font-mono font-bold text-slate-800">
                  {data.totals.totalFr.toFixed(4)}
                </td>
                <td className="font-mono font-bold text-slate-800">
                  {data.totals.totalP.toFixed(2)}%
                </td>
                <td colSpan={4} className="text-[11px] text-slate-400 italic text-center font-normal">
                  — No se totaliza —
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. DESGLOSE DIDÁCTICO PASO A PASO POR COLUMNA DE LA FILA SELECCIONADA */}
        {selectedRow && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[#0F2942] font-bold">
              <Info className="w-4 h-4 text-[#E67E22]" />
              <span>Cálculo paso a paso del Intervalo N° {selectedRow.index}: <span className="font-mono text-[#1B8A5A]">{selectedRow.intervalLabel}</span></span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">1. Marca de Clase</span>
                <MathFormula formula={selectedRow.stepExplanations.mc} />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">2. Frec. Relativa</span>
                <MathFormula formula={selectedRow.stepExplanations.fr} />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">3. Porcentaje</span>
                <MathFormula formula={selectedRow.stepExplanations.p} />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">4. Acumulados</span>
                <MathFormula formula={selectedRow.stepExplanations.faAcum} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MÓDULO GRÁFICO AUTOMÁTICO MULTI-TIPO */}
      <HistogramVisualizer
        title={`Gráfico Estadístico: ${data.variableName}`}
        xLabel={`Intervalos [${data.unit}]`}
        yLabel="Frecuencia Absoluta (fa)"
        data={chartData}
      />
    </div>
  );
};
