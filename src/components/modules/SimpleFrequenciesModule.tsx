// src/components/modules/SimpleFrequenciesModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SimpleFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { exportSimpleTableToExcel } from '@/lib/excelExport';
import { 
  BarChart2, 
  Info,
  FileSpreadsheet,
  Sparkles,
  Tag,
  Hash
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
  const [hoveredStep, setHoveredStep] = useState<'fa' | 'fr' | 'p' | 'acum' | null>(null);

  const isQualitative = data.variableType === 'qualitative';

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
        <div className="bg-[#0F2942] px-4 sm:px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#1B8A5A]" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Distribución de Frecuencias Simples
            </h3>
            <span className="text-xs font-mono text-slate-300">
              ({data.variableName} • n = {data.sampleSize})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isQualitative 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
            }`}>
              {isQualitative ? <Tag className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
              <span>{isQualitative ? 'Variable Cualitativa' : 'Variable Cuantitativa'}</span>
            </span>

            {/* BOTÓN EXPORTAR A EXCEL */}
            <button
              type="button"
              onClick={() => exportSimpleTableToExcel(data)}
              className="flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Descargar tabla en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>

        {/* Indicador de Iluminación en Tiempo Real */}
        {hoveredStep && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700 animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E67E22]" />
              <span>
                {hoveredStep === 'fr' && `💡 Iluminando: Frecuencia Relativa fr = fa (${selectedRow?.frecuenciaAbsoluta}) / n (${data.sampleSize}) = ${selectedRow?.frecuenciaRelativa.toFixed(4)}`}
                {hoveredStep === 'p' && `💡 Iluminando: Porcentaje p = fr (${selectedRow?.frecuenciaRelativa.toFixed(4)}) × 100 = ${selectedRow?.porcentaje.toFixed(2)}%`}
                {hoveredStep === 'acum' && `💡 Iluminando: Frecuencia Acumulada Fa = Suma de frecuencias anteriores (fa) hasta la fila ${selectedRow?.index} = ${selectedRow?.frecuenciaAbsolutaAcumulada}`}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500">Paso activo</span>
          </div>
        )}

        {/* Tabla Didáctica */}
        <div className="overflow-x-auto p-4">
          <table className="stat-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>{isQualitative ? 'Categoría / Modalidad (xi)' : 'Valor de Variable (xi)'}</th>
                <th className={hoveredStep === 'fr' || hoveredStep === 'acum' ? 'bg-emerald-100 text-emerald-950 font-bold' : ''}>
                  Frec. Absoluta (fa)
                </th>
                <th className={hoveredStep === 'fr' || hoveredStep === 'p' ? 'bg-emerald-200 text-emerald-950 font-black ring-2 ring-emerald-400' : ''}>
                  Frec. Relativa (fr)
                </th>
                <th className={hoveredStep === 'p' ? 'bg-blue-200 text-blue-950 font-black ring-2 ring-blue-400' : ''}>
                  Porcentaje (p %)
                </th>
                <th className={hoveredStep === 'acum' ? 'bg-purple-200 text-purple-950 font-black ring-2 ring-purple-400' : ''}>
                  Frec. Abs. Acum. (Fa)
                </th>
                <th className={hoveredStep === 'acum' ? 'bg-purple-100 text-purple-950 font-bold' : ''}>
                  Frec. Rel. Acum. (Fr)
                </th>
                <th className={hoveredStep === 'acum' ? 'bg-purple-100 text-purple-950 font-bold' : ''}>
                  Porc. Acum. (P %)
                </th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const isSelected = selectedRowIndex === row.index;
                const isPriorForCumulative = hoveredStep === 'acum' && row.index <= (selectedRowIndex || 1);

                return (
                  <tr
                    key={row.index}
                    onClick={() => setSelectedRowIndex(row.index)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'bg-emerald-50/90 font-medium' : ''
                    }`}
                  >
                    <td className="font-bold text-[#0F2942]">{row.index}</td>
                    <td className="font-bold text-slate-800 text-xs sm:text-sm">
                      {row.variableValue}
                    </td>
                    
                    {/* fa */}
                    <td className={`font-mono font-bold transition-colors ${
                      isSelected && hoveredStep === 'fr' 
                        ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500' 
                        : isPriorForCumulative 
                        ? 'bg-purple-100 text-purple-950 ring-1 ring-purple-300 font-black' 
                        : 'text-[#1B8A5A]'
                    }`}>
                      {row.frecuenciaAbsoluta}
                    </td>

                    {/* fr */}
                    <td className={`font-mono transition-colors ${
                      isSelected && (hoveredStep === 'fr' || hoveredStep === 'p') 
                        ? 'bg-emerald-200 text-emerald-950 font-black ring-2 ring-emerald-500' 
                        : 'text-slate-700'
                    }`}>
                      {row.frecuenciaRelativa.toFixed(4)}
                    </td>

                    {/* p */}
                    <td className={`font-mono transition-colors ${
                      isSelected && hoveredStep === 'p' 
                        ? 'bg-blue-200 text-blue-950 font-black ring-2 ring-blue-500' 
                        : 'text-slate-700'
                    }`}>
                      {row.porcentaje.toFixed(2)}%
                    </td>

                    {/* Fa */}
                    <td className={`font-mono transition-colors ${
                      isSelected && hoveredStep === 'acum' 
                        ? 'bg-purple-200 text-purple-950 font-black ring-2 ring-purple-500' 
                        : 'text-slate-700'
                    }`}>
                      {row.frecuenciaAbsolutaAcumulada}
                    </td>

                    {/* Fr */}
                    <td className={`font-mono transition-colors ${
                      isSelected && hoveredStep === 'acum' 
                        ? 'bg-purple-100 text-purple-950 font-bold ring-1 ring-purple-400' 
                        : 'text-slate-700'
                    }`}>
                      {row.frecuenciaRelativaAcumulada.toFixed(4)}
                    </td>

                    {/* P */}
                    <td className={`font-mono transition-colors ${
                      isSelected && hoveredStep === 'acum' 
                        ? 'bg-purple-100 text-purple-950 font-bold ring-1 ring-purple-400' 
                        : 'text-slate-700'
                    }`}>
                      {row.porcentajeAcumulado.toFixed(2)}%
                    </td>

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
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#0F2942] font-bold">
                <Info className="w-4 h-4 text-[#E67E22]" />
                <span>
                  {isQualitative ? 'Cálculo de la Categoría' : 'Cálculo del Valor'}:{' '}
                  <span className="font-bold text-[#1B8A5A]">{selectedRow.variableValue}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                ✨ Pasa el mouse por cada tarjeta para iluminar sus celdas:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div 
                onMouseEnter={() => setHoveredStep('fr')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setHoveredStep(hoveredStep === 'fr' ? null : 'fr')}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  hoveredStep === 'fr' 
                    ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300' 
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">1. Frec. Relativa (fr = fa / n)</span>
                <MathFormula formula={selectedRow.stepExplanations.fr} />
              </div>

              <div 
                onMouseEnter={() => setHoveredStep('p')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setHoveredStep(hoveredStep === 'p' ? null : 'p')}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  hoveredStep === 'p' 
                    ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-300' 
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-blue-800 block mb-1">2. Porcentaje (p = fr · 100)</span>
                <MathFormula formula={selectedRow.stepExplanations.p} />
              </div>

              <div 
                onMouseEnter={() => setHoveredStep('acum')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setHoveredStep(hoveredStep === 'acum' ? null : 'acum')}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  hoveredStep === 'acum' 
                    ? 'bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-300' 
                    : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-purple-800 block mb-1">3. Acumulados (Fa, Fr, P)</span>
                <MathFormula formula={selectedRow.stepExplanations.faAcum} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico Estadístico Multi-Tipo */}
      <SimpleBarVisualizer
        title={`Gráfico Estadístico: ${data.variableName}`}
        xLabel={isQualitative ? 'Categorías Observadas' : `Valores de la Variable (${data.unit})`}
        yLabel="Cantidad de Casos Registrados"
        data={chartData}
      />
    </div>
  );
};
