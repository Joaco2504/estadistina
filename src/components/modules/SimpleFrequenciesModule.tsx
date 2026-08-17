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

// Carga dinámica exclusiva para cliente de Recharts
const SimpleBarVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.SimpleBarVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 sm:h-96 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 mt-8">
        <span className="text-xs text-slate-400 font-medium">Cargando gráfico de barras simples...</span>
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

  // Transformar datos para el gráfico
  const chartData = data.rows.map((row) => ({
    variableValue: row.variableValue,
    fa: row.frecuenciaAbsoluta,
    p: row.porcentaje,
  }));

  const selectedRow = data.rows.find((r) => r.index === selectedRowIndex) || data.rows[0];

  return (
    <div className="space-y-8">
      {/* Encabezado y Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#1B8A5A]" />
              <h3 className="text-base sm:text-lg font-bold tracking-wide">
                Tabla de Distribución de Frecuencias Simples (Datos No Agrupados)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Variable: <strong className="text-white">{data.variableName}</strong> ({data.unit}) • Tamaño Muestral: <span className="font-mono text-[#E67E22]">n = {data.sampleSize}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#15385B] text-slate-200 px-2.5 py-1 rounded-lg border border-[#1C4874] font-mono">
              Valores distintos: {data.rows.length}
            </span>
          </div>
        </div>

        {/* Tabla Didáctica */}
        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="stat-table">
            <thead>
              <tr>
                <th title="Número de orden">N°</th>
                <th title="Valor individual de la variable">Variable (xi)</th>
                <th title="Frecuencia Absoluta: cantidad de repeticiones">Frec. Absoluta (fa)</th>
                <th title="Frecuencia Relativa: fa / n">Frec. Relativa (fr)</th>
                <th title="Porcentaje: fr * 100">Porcentaje (p %)</th>
                <th title="Frecuencia Absoluta Acumulada">Frec. Abs. Acum. (Fa)</th>
                <th title="Frecuencia Relativa Acumulada">Frec. Rel. Acum. (Fr)</th>
                <th title="Porcentaje Acumulado">Porc. Acum. (P %)</th>
                <th title="Desglose paso a paso">Detalle</th>
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
                    <td className="font-mono font-bold text-slate-800 text-base">{row.variableValue}</td>
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

              {/* Fila de Totales Estricta (sin símbolo sigma) */}
              <tr className="total-row">
                <td colSpan={2} className="text-right uppercase tracking-wider font-extrabold pr-4 text-[#0F2942]">
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

        {/* Desglose Pedagógico Paso a Paso */}
        {selectedRow && (
          <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#E67E22]" />
                <h4 className="text-sm sm:text-base font-bold text-[#0F2942]">
                  Desglose Pedagógico de Cálculos para el Valor <span className="font-mono text-[#1B8A5A]">x_{selectedRow.index} = {selectedRow.variableValue}</span>
                </h4>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Haga clic en cualquier fila para visualizar su fórmula
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Frecuencia Absoluta y Relativa */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>1. Frecuencia Relativa (fr)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    fr = fa / n
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded text-center text-xs mb-2">
                  <MathFormula formula={selectedRow.stepExplanations.fr} />
                </div>
                <p className="text-xs text-slate-600">
                  Indica la proporción del valor {selectedRow.variableValue} respecto al total de la muestra (n = {data.sampleSize}).
                </p>
              </div>

              {/* Porcentaje */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>2. Porcentaje (p %)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    p = fr · 100
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded text-center text-xs mb-2">
                  <MathFormula formula={selectedRow.stepExplanations.p} />
                </div>
                <p className="text-xs text-slate-600">
                  Representa el {selectedRow.porcentaje.toFixed(2)}% del total de las observaciones analizadas.
                </p>
              </div>

              {/* Frecuencias Acumuladas */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>3. Frecuencias Acumuladas</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    Fa, Fr, P
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded text-center text-xs mb-2 space-y-1">
                  <MathFormula formula={selectedRow.stepExplanations.faAcum} />
                </div>
                <p className="text-xs text-slate-600">
                  Total de casos observados menores o iguales a {selectedRow.variableValue}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Barras Automático */}
      <SimpleBarVisualizer
        title={`Diagrama de Barras: ${data.variableName}`}
        xLabel={`Valores de la Variable (${data.unit})`}
        yLabel="Frecuencia Absoluta (fa)"
        data={chartData}
      />
    </div>
  );
};
