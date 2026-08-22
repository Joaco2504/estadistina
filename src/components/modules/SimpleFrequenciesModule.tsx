// src/components/modules/SimpleFrequenciesModule.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SimpleFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { exportSimpleTableToExcel } from '@/lib/excelExport';
import { formatPercentage } from '@/lib/statistics';
import { 
  BarChart2, 
  Info,
  FileSpreadsheet,
  Sparkles,
  Tag,
  Hash,
  Maximize2
} from 'lucide-react';
import { StatisticalLoader } from '@/components/ui/StatisticalLoader';
import { FloatingRowDetailSheet } from '@/components/ui/FloatingRowDetailSheet';
import { FloatingTableModal } from '@/components/ui/FloatingTableModal';

const SimpleBarVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.SimpleBarVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full flex items-center justify-center bg-slate-50 dark:bg-[#0A1322] rounded-2xl border border-slate-200/80 dark:border-slate-800 mt-6 shadow-2xs">
        <StatisticalLoader size="sm" title="Generando visualización gráfica..." subtitle="Diagrama de Barras y Frecuencias" />
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<'fa' | 'fr' | 'p' | 'acum' | null>(null);
  const [pinnedStep, setPinnedStep] = useState<'fa' | 'fr' | 'p' | 'acum' | null>(null);
  const [isFloatingTableOpen, setIsFloatingTableOpen] = useState(false);
  const [isRowDetailOpen, setIsRowDetailOpen] = useState(false);

  // Escucha clics fuera del módulo para deseleccionar y mostrar el gráfico completo
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedRowIndex(null);
        setPinnedStep(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const activeStep = hoveredStep || pinnedStep;

  const handleStepClick = (step: 'fa' | 'fr' | 'p' | 'acum') => {
    setPinnedStep((prev) => (prev === step ? null : step));
  };

  const handleRowClick = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    // En móviles (< 768px), abrir directamente la ventana flotante de detalle
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsRowDetailOpen(true);
    }
  };

  const handleNavigateRow = (direction: 'prev' | 'next') => {
    if (selectedRowIndex === null) return;
    const currentIndex = selectedRowIndex;
    const newIndex = direction === 'prev' ? Math.max(1, currentIndex - 1) : Math.min(data.rows.length, currentIndex + 1);
    setSelectedRowIndex(newIndex);
  };

  const isQualitative = data.variableType === 'qualitative';

  const chartData = data.rows.map((row) => ({
    variableValue: row.variableValue,
    fa: row.frecuenciaAbsoluta,
    p: row.porcentaje,
  }));

  const selectedRow = selectedRowIndex !== null ? (data.rows.find((r) => r.index === selectedRowIndex) || null) : null;

  // Renderizador unificado de la tabla para vista normal y ventana flotante
  const renderTableContent = () => (
    <table className="stat-table">
      <thead>
        <tr>
          <th>N°</th>
          <th>{isQualitative ? 'Categoría / Modalidad (xi)' : 'Valor de Variable (xi)'}</th>
          <th className={activeStep === 'fr' || activeStep === 'acum' ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 font-bold' : ''}>
            Frec. Absoluta (fa)
          </th>
          <th className={activeStep === 'fr' || activeStep === 'p' ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-100 font-black ring-2 ring-emerald-400' : ''}>
            Frec. Relativa (fr)
          </th>
          <th className={activeStep === 'p' ? 'bg-blue-200 dark:bg-blue-900/80 text-blue-950 dark:text-blue-100 font-black ring-2 ring-blue-400' : ''}>
            Porcentaje (p %)
          </th>
          <th className={activeStep === 'acum' ? 'bg-purple-200 dark:bg-purple-900/80 text-purple-950 dark:text-purple-100 font-black ring-2 ring-purple-400' : ''}>
            Frec. Abs. Acum. (Fa)
          </th>
          <th className={activeStep === 'acum' ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-200 font-bold' : ''}>
            Frec. Rel. Acum. (Fr)
          </th>
          <th className={activeStep === 'acum' ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-200 font-bold' : ''}>
            Porc. Acum. (P %)
          </th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, idx) => {
          const isSelected = selectedRowIndex === row.index;
          const isHovered = hoveredRowIndex === row.index;
          const isPriorForCumulative = activeStep === 'acum' && row.index <= (selectedRowIndex || 1);
          const prevFa = idx > 0 ? data.rows[idx - 1].frecuenciaAbsolutaAcumulada : null;

          const tooltipFa = `Cantidad de ${data.variableName} por ${row.variableValue}: ${row.frecuenciaAbsoluta} casos`;
          const tooltipFr = `${row.frecuenciaAbsoluta}/${data.sampleSize} = ${row.frecuenciaRelativa.toFixed(2)}`;
          const tooltipP = `${row.frecuenciaRelativa.toFixed(2)} x 100 % = ${formatPercentage(row.porcentaje)}`;
          const tooltipFaAcum = prevFa !== null ? `${prevFa} + ${row.frecuenciaAbsoluta} = ${row.frecuenciaAbsolutaAcumulada}` : `Cantidad acumulada: ${row.frecuenciaAbsoluta} casos`;
          const tooltipFrAcum = `${row.frecuenciaAbsolutaAcumulada}/${data.sampleSize} = ${row.frecuenciaRelativaAcumulada.toFixed(2)}`;
          const tooltipPAcum = `${row.frecuenciaRelativaAcumulada.toFixed(2)} x 100 % = ${formatPercentage(row.porcentajeAcumulado)}`;

          return (
            <tr
              key={`simple-row-${row.index}`}
              onClick={() => handleRowClick(row.index)}
              onMouseEnter={() => setHoveredRowIndex(row.index)}
              onMouseLeave={() => setHoveredRowIndex(null)}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? 'selected'
                  : isPriorForCumulative
                  ? 'bg-purple-50/60 dark:bg-purple-950/40'
                  : isHovered
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                  : ''
              }`}
            >
              <td className="font-bold text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                {row.index}
              </td>

              <td className="font-semibold text-[#0F2942] dark:text-slate-200">
                <span>{row.variableValue}</span>
              </td>

              {/* fa */}
              <td 
                title={tooltipFa}
                className={`font-mono font-bold transition-colors relative group/cell ${
                  isSelected && (activeStep === 'fr' || activeStep === 'acum')
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 font-black' 
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{row.frecuenciaAbsoluta}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                    {tooltipFa}
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </td>

              {/* fr (2 decimales) */}
              <td 
                title={tooltipFr}
                className={`font-mono transition-colors relative group/cell ${
                  isSelected && (activeStep === 'fr' || activeStep === 'p')
                    ? 'bg-emerald-200 dark:bg-emerald-900/90 text-emerald-950 dark:text-emerald-100 font-black ring-2 ring-emerald-500' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{row.frecuenciaRelativa.toFixed(2)}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                    {tooltipFr}
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </td>

              {/* p */}
              <td 
                title={tooltipP}
                className={`font-mono transition-colors relative group/cell ${
                  isSelected && activeStep === 'p' 
                    ? 'bg-blue-200 dark:bg-blue-900/90 text-blue-950 dark:text-blue-100 font-black ring-2 ring-blue-500' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{formatPercentage(row.porcentaje)}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                    {tooltipP}
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </td>

              {/* Fa */}
              <td 
                title={tooltipFaAcum}
                className={`font-mono transition-colors relative group/cell ${
                  isSelected && activeStep === 'acum' 
                    ? 'bg-purple-200 dark:bg-purple-900/90 text-purple-950 dark:text-purple-100 font-black ring-2 ring-purple-500' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{row.frecuenciaAbsolutaAcumulada}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                    {tooltipFaAcum}
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </td>

              {/* Fr (2 decimales) */}
              <td 
                title={tooltipFrAcum}
                className={`font-mono transition-colors relative group/cell ${
                  isSelected && activeStep === 'acum' 
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 font-bold ring-1 ring-purple-400' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{row.frecuenciaRelativaAcumulada.toFixed(2)}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                    {tooltipFrAcum}
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </td>

              {/* P */}
              <td 
                title={tooltipPAcum}
                className={`font-mono transition-colors relative group/cell ${
                  isSelected && activeStep === 'acum' 
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 font-bold ring-1 ring-purple-400' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{formatPercentage(row.porcentajeAcumulado)}</span>
                <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/cell:flex flex-col items-end z-50 pointer-events-none whitespace-nowrap">
                  <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                    {tooltipPAcum}
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1 mr-4" />
                </div>
              </td>

              <td>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRowIndex(row.index);
                    setIsRowDetailOpen(true);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Abrir Ficha Flotante con fórmulas explicadas"
                >
                  <span>Ficha</span>
                </button>
              </td>
            </tr>
          );
        })}

        {/* Fila de Totales Estricta (sin símbolo sigma) */}
        <tr className="total-row">
          <td colSpan={2} className="text-right uppercase font-extrabold pr-4 text-[#0F2942] dark:text-slate-100">
            {data.totals.label}
          </td>
          <td className="font-mono font-black text-[#10B981] dark:text-emerald-400 relative group/cell" title={`Total fa = ${data.totals.totalFa}`}>
            <span>{data.totals.totalFa}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
              <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                Total fa = n = {data.totals.totalFa}
              </div>
              <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
            </div>
          </td>
          <td className="font-mono font-black text-[#10B981] dark:text-emerald-400 relative group/cell" title={`Total fr = ${data.totals.totalFr.toFixed(2)}`}>
            <span>{data.totals.totalFr.toFixed(2)}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
              <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                Total fr = {data.totals.totalFr.toFixed(2)}
              </div>
              <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
            </div>
          </td>
          <td className="font-mono font-black text-[#10B981] dark:text-emerald-400 relative group/cell" title={`Total p = ${formatPercentage(data.totals.totalP)}`}>
            <span>{formatPercentage(data.totals.totalP)}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
              <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                Total p = {formatPercentage(data.totals.totalP)}
              </div>
              <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
            </div>
          </td>
          <td colSpan={4} className="text-slate-400 dark:text-slate-600 text-center text-xs font-mono">
            —
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Encabezado y Tabla */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Distribución de Frecuencias Simples
            </h3>
            <span className="text-xs font-mono text-slate-300 dark:text-slate-400">
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
              <span>{isQualitative ? 'Variable Cualitativa' : 'Variable Cuantitativa Discreta'}</span>
            </span>

            {/* BOTÓN VENTANA FLOTANTE (MAXIMIZAR) */}
            <button
              type="button"
              onClick={() => setIsFloatingTableOpen(true)}
              className="flex items-center gap-1.5 bg-[#15385B] dark:bg-[#1E293B] hover:bg-[#1E4D7B] dark:hover:bg-slate-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer border border-[#1C4874] dark:border-slate-700"
              title="Abrir tabla en Ventana Flotante / Pantalla Completa"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden xs:inline">Flotante</span>
            </button>

            {/* BOTÓN EXPORTAR A EXCEL */}
            <button
              type="button"
              onClick={() => exportSimpleTableToExcel(data)}
              className="group flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
              title="Descargar tabla en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="hidden xs:inline">Excel</span>
            </button>
          </div>
        </div>

        {/* Indicador de Iluminación en Tiempo Real (Sin titileo) */}
        {activeStep && (
          <div className="bg-slate-900 dark:bg-[#0B132B] text-white px-4 py-2.5 border-b border-slate-700 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E67E22] dark:text-amber-400 flex-shrink-0" />
              <span>
                {activeStep === 'fr' && `Frecuencia Relativa fr = fa (${selectedRow?.frecuenciaAbsoluta}) / n (${data.sampleSize}) = ${selectedRow?.frecuenciaRelativa.toFixed(2)}`}
                {activeStep === 'p' && `Porcentaje p = fr (${selectedRow?.frecuenciaRelativa.toFixed(2)}) × 100 = ${formatPercentage(selectedRow?.porcentaje || 0)}`}
                {activeStep === 'acum' && `Frecuencia Acumulada Fa = Suma de frecuencias fa hasta fila ${selectedRow?.index} = ${selectedRow?.frecuenciaAbsolutaAcumulada}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                pinnedStep 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {pinnedStep ? '📌 Fijado en tabla' : '💡 Vista previa (Clic para fijar)'}
              </span>
              {pinnedStep && (
                <button
                  type="button"
                  onClick={() => setPinnedStep(null)}
                  className="text-[10px] text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Soltar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabla Didáctica con Tooltips de Operación */}
        <div className="overflow-x-auto p-3 sm:p-4 pt-6 sm:pt-7">
          {renderTableContent()}
        </div>

        {/* Desglose Pedagógico Paso a Paso con Tarjetas Ampliadas o Banner Informativo */}
        {selectedRow ? (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#131C2E] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0F2942] dark:text-slate-100 font-bold">
                <Info className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
                <span>
                  {isQualitative ? 'Cálculo de la Categoría' : 'Cálculo del Valor'}:{' '}
                  <span className="font-extrabold text-[#1B8A5A] dark:text-emerald-400">{selectedRow.variableValue}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ✨ Pasa el mouse o <strong className="text-slate-700 dark:text-slate-200">haz clic para fijar la iluminación</strong>:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRowIndex(null);
                    setPinnedStep(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline font-medium cursor-pointer"
                >
                  Deseleccionar ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Tarjeta 1: Frecuencia Relativa */}
              <div 
                onMouseEnter={() => setHoveredStep('fr')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => handleStepClick('fr')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                  pinnedStep === 'fr'
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                    : hoveredStep === 'fr'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 shadow-xs'
                    : 'bg-white dark:bg-[#0A1322] border-slate-200 dark:border-slate-700 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-2">
                    <span>1. Frec. Relativa (fr = fa / n)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'fr' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                    }`}>
                      {pinnedStep === 'fr' ? '📌 Fijado' : 'Paso 1'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.fr} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Proporción de observaciones sobre el total n
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-medium block text-center mt-1">
                    {pinnedStep === 'fr' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>

              {/* Tarjeta 2: Porcentaje */}
              <div 
                onMouseEnter={() => setHoveredStep('p')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => handleStepClick('p')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                  pinnedStep === 'p'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-400'
                    : hoveredStep === 'p'
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 shadow-xs'
                    : 'bg-white dark:bg-[#0A1322] border-slate-200 dark:border-slate-700 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-blue-800 dark:text-blue-300 mb-2">
                    <span>2. Porcentaje (p = fr × 100)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'p' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200'
                    }`}>
                      {pinnedStep === 'p' ? '📌 Fijado' : 'Paso 2'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.p} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Expresión porcentual derivada de fr
                  </span>
                  <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80 font-medium block text-center mt-1">
                    {pinnedStep === 'p' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>

              {/* Tarjeta 3: Acumulados */}
              <div 
                onMouseEnter={() => setHoveredStep('acum')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => handleStepClick('acum')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                  pinnedStep === 'acum'
                    ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-500 shadow-md ring-2 ring-purple-400'
                    : hoveredStep === 'acum'
                    ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-300 shadow-xs'
                    : 'bg-white dark:bg-[#0A1322] border-slate-200 dark:border-slate-700 hover:border-purple-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-purple-800 dark:text-purple-300 mb-2">
                    <span>3. Acumulados (Fa, Fr, P)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'acum' ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200'
                    }`}>
                      {pinnedStep === 'acum' ? '📌 Fijado' : 'Paso 3'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.faAcum} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Suma progresiva de frecuencias absolutas fa
                  </span>
                  <span className="text-[10px] text-purple-700/80 dark:text-purple-300/80 font-medium block text-center mt-1">
                    {pinnedStep === 'acum' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0C1424] p-3.5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Haz clic en cualquier fila de la tabla o barra del gráfico para ver la explicación paso a paso de sus fórmulas. Haz clic afuera para deseleccionar.</span>
            </p>
          </div>
        )}
      </div>

      {/* Ventana Flotante / Modal a Pantalla Completa para la Tabla */}
      <FloatingTableModal
        isOpen={isFloatingTableOpen}
        onClose={() => setIsFloatingTableOpen(false)}
        title={`Frecuencias Simples: ${data.variableName}`}
        subtitle={`Muestra n = ${data.sampleSize} • ${isQualitative ? 'Variable Cualitativa' : 'Variable Cuantitativa Discreta'}`}
        badge={isQualitative ? 'Cualitativa' : 'Discreta'}
        onExportExcel={() => exportSimpleTableToExcel(data)}
      >
        {renderTableContent()}
      </FloatingTableModal>

      {/* Ficha Flotante / Bottom Sheet por Fila para Móviles y Clics Rápidos */}
      <FloatingRowDetailSheet
        isOpen={isRowDetailOpen}
        onClose={() => setIsRowDetailOpen(false)}
        row={selectedRow}
        totalRows={data.rows.length}
        sampleSize={data.sampleSize}
        variableName={data.variableName}
        unit={data.unit}
        isGrouped={false}
        isQualitative={isQualitative}
        onNavigateRow={handleNavigateRow}
      />

      {/* Gráfico Estadístico Multi-Tipo con Iluminación Bidireccional */}
      <SimpleBarVisualizer
        title={`Gráfico Estadístico: ${data.variableName}`}
        variableName={data.variableName}
        unit={data.unit}
        variableType={data.variableType}
        selectedIndex={selectedRowIndex}
        onSelectIndex={setSelectedRowIndex}
        hoveredIndex={hoveredRowIndex}
        onHoverIndex={setHoveredRowIndex}
        data={chartData}
      />
    </div>
  );
};

