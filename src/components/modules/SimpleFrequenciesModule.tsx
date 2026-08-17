// src/components/modules/SimpleFrequenciesModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SimpleFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { 
  BarChart2, 
  Info
} from 'lucide-react';

const SimpleBarVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.SimpleBarVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 mt-6">
        <span className="text-xs text-slate-400 font-medium">Cargando gráfico estadístico...</span>
      </div>
    ),
  }
);

interface SimpleFrequenciesModuleProps {
  data: SimpleFrequencyTableResult;
}

export const SimpleFrequenciesModule: React.FC<SimpleFrequenciesModuleProps> = ({
  data,
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(1);

  const chartData = data.rows.map((row) => ({
    variableValue: row.variableValue,
    fa: row.frecuenciaAbsoluta,
    p: row.porcentaje,
  }));

  const selectedRow = data.rows.find((r) => r.index === selectedRowIndex) || data.rows[0];

  return (
    <div className="space-y-6">
      {/* Encabezado y Tabla */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#1B8A5A]" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Distribución de Frecuencias Simples
            </h3>
            <span className="text-xs font-mono text-slate-300">
              ({data.variableName} • n = {data.sampleSize})
            </span>
          </div>

          <span className="text-xs font-mono bg-[#15385B] px-2.5 py-0.5 rounded text-slate-200 border border-[#1C4874]">
            {data.rows.length} valores distintos
          </span>
        </div>

        {/* Tabla Didáctica */}
        <div className="overflow-x-auto p-4">
          <table className="stat-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Variable (xi)</th>
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
                    <td className="font-mono font-bold text-slate-800 text-sm">{row.variableValue}</td>
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

              {/* Fila de Totales Estricta (sin símbolo sigma) */}
              <tr className="total-row">
                <td colSpan={2} className="text-right uppercase font-extrabold pr-4 text-[#0F2942]">
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

        {/* Desglose Pedagógico Paso a Paso */}
        {selectedRow && (
          <div className="border-t border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[#0F2942] font-bold">
              <Info className="w-4 h-4 text-[#E67E22]" />
              <span>Cálculo del Valor: <span className="font-mono text-[#1B8A5A]">x_{selectedRow.index} = {selectedRow.variableValue}</span></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">1. Frec. Relativa (fr = fa / n)</span>
                <MathFormula formula={selectedRow.stepExplanations.fr} />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">2. Porcentaje (p = fr · 100)</span>
                <MathFormula formula={selectedRow.stepExplanations.p} />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">3. Acumulados (Fa, Fr, P)</span>
                <MathFormula formula={selectedRow.stepExplanations.faAcum} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico Estadístico Multi-Tipo */}
      <SimpleBarVisualizer
        title={`Gráfico Estadístico: ${data.variableName}`}
        xLabel={`Valores (${data.unit})`}
        yLabel="Frecuencia Absoluta (fa)"
        data={chartData}
      />
    </div>
  );
};
