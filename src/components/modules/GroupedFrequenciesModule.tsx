// src/components/modules/GroupedFrequenciesModule.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GroupedFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { exportGroupedTableToExcel } from '@/lib/excelExport';
import { formatPercentage } from '@/lib/statistics';
import { 
  Calculator, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { StatisticalLoader } from '@/components/ui/StatisticalLoader';

const HistogramVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.HistogramVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full flex items-center justify-center bg-slate-50 dark:bg-[#0A1322] rounded-2xl border border-slate-200/80 dark:border-slate-800 mt-6 shadow-2xs">
        <StatisticalLoader size="sm" title="Construyendo Histograma y Polígono..." subtitle="Distribución en Intervalos de Clase" />
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [showDerivation, setShowDerivation] = useState<boolean>(true);

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
  
  // Estado para la interactividad pedagógica en tiempo real (Hover transitorio y Fijación persistente con Clic)
  const [hoveredStep, setHoveredStep] = useState<'mc' | 'fr' | 'p' | 'acum' | null>(null);
  const [pinnedStep, setPinnedStep] = useState<'mc' | 'fr' | 'p' | 'acum' | null>(null);

  // El paso activo es el hover transitorio si existe, o el paso fijado por clic
  const activeStep = hoveredStep || pinnedStep;

  const handleStepClick = (step: 'mc' | 'fr' | 'p' | 'acum') => {
    setPinnedStep((prev) => (prev === step ? null : step));
  };

  // Transformar datos para los gráficos multi-tipo
  const chartData = data.rows.map((row) => ({
    intervalLabel: row.intervalLabel,
    marcaDeClase: row.marcaDeClase,
    fa: row.frecuenciaAbsoluta,
    p: row.porcentaje,
    Fa: row.frecuenciaAbsolutaAcumulada,
  }));

  const selectedRow = selectedRowIndex !== null ? (data.rows.find((r) => r.index === selectedRowIndex) || null) : null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 1. SECCIÓN EXPLICATIVA PASO A PASO (R, k, A) MINIMALISTA Y PLEGABLE */}
      {data.stepByStepDerivation && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div 
            onClick={() => setShowDerivation(!showDerivation)}
            className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-[#0A1322] flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-[#0F2942] dark:text-slate-200">
              <Calculator className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wide">
                Paso Previo: Determinación de Parámetros (R, k, A)
              </span>
              <span className="text-[10px] font-mono font-semibold text-[#1B8A5A] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                k = √{data.sampleSize} = {data.parameters.k}
              </span>
            </div>
            <button type="button" className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              {showDerivation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showDerivation && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gradient-to-br from-slate-50/50 to-emerald-50/20 dark:from-[#0F172A] dark:to-[#0B132B]">
              {/* Rango */}
              <div className="bg-white dark:bg-[#0A1322] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  1. Rango Muestral (R)
                </span>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                  {data.parameters.xmax} - {data.parameters.xmin} = <strong className="text-[#0F2942] dark:text-white">{data.parameters.rango}</strong>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <MathFormula formula="R = X_{\text{max}} - X_{\text{min}}" />
                </div>
              </div>

              {/* Número de Intervalos */}
              <div className="bg-white dark:bg-[#0A1322] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  2. Intervalos (Regla Raíz)
                </span>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                  k = √{data.sampleSize} = <strong className="text-[#0F2942] dark:text-white">{data.parameters.k}</strong>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <MathFormula formula="k = \sqrt{n}" />
                </div>
              </div>

              {/* Amplitud */}
              <div className="bg-white dark:bg-[#0A1322] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  3. Amplitud (A)
                </span>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mb-1">
                  {data.parameters.rango} / {data.parameters.k} = <strong className="text-[#0F2942] dark:text-white">{data.parameters.amplitud}</strong>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <MathFormula formula="A = \frac{R}{k}" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TABLA DE FRECUENCIAS */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Cabecera de la Tabla */}
        <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Distribución de Frecuencias Agrupadas
            </h3>
            <span className="text-xs font-mono text-slate-300 dark:text-slate-400">
              ({data.variableName} • n = {data.sampleSize})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* BOTÓN EXPORTAR A EXCEL */}
            <button
              type="button"
              onClick={() => exportGroupedTableToExcel(data)}
              className="group flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
              title="Descargar tabla en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="hidden xs:inline">Exportar a Excel</span>
            </button>

            <span className="text-xs font-mono bg-[#15385B] dark:bg-[#1E293B] px-2.5 py-1 rounded text-slate-200 border border-[#1C4874] dark:border-slate-700 hidden sm:inline">
              k = {data.parameters.k} | A = {data.parameters.amplitud}
            </span>
          </div>
        </div>

        {/* Indicador Dinámico de Iluminación en Tiempo Real (Sin titileo) */}
        {activeStep && selectedRow && (
          <div className="bg-slate-900 dark:bg-[#0B132B] text-white px-4 py-2.5 border-b border-slate-700 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E67E22] dark:text-amber-400 flex-shrink-0" />
              <span>
                {activeStep === 'mc' && `Marca de Clase Mc = (${selectedRow.intervalLabel}) / 2 = ${selectedRow.marcaDeClase}`}
                {activeStep === 'fr' && `Frecuencia Relativa fr = fa (${selectedRow.frecuenciaAbsoluta}) / n (${data.sampleSize}) = ${selectedRow.frecuenciaRelativa.toFixed(2)}`}
                {activeStep === 'p' && `Porcentaje p = fr (${selectedRow.frecuenciaRelativa.toFixed(2)}) × 100 = ${formatPercentage(selectedRow.porcentaje)}`}
                {activeStep === 'acum' && `Frecuencia Acumulada Fa = Suma de frecuencias fa hasta fila ${selectedRow.index} = ${selectedRow.frecuenciaAbsolutaAcumulada}`}
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

        {/* Tabla Didáctica Minimalista con Iluminación en Tiempo Real y Tooltips */}
        <div className="overflow-x-auto p-3 sm:p-4 pt-6 sm:pt-7">
          <table className="stat-table">
            <thead>
              <tr>
                <th>N°</th>
                <th className={activeStep === 'mc' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-bold' : ''}>
                  Intervalo (I)
                </th>
                <th className={activeStep === 'mc' ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 font-black ring-2 ring-amber-400' : ''}>
                  Marca de Clase (Mc)
                </th>
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

                const tooltipInterval = `Límite inferior: ${row.limiteInferior} | Límite superior: ${row.limiteSuperior}`;
                const tooltipMc = `(${row.limiteInferior} + ${row.limiteSuperior}) / 2 = ${row.marcaDeClase}`;
                const tooltipFa = `Cantidad de ${data.variableName} en [${row.limiteInferior}; ${row.limiteSuperior}): ${row.frecuenciaAbsoluta} casos`;
                const tooltipFr = `${row.frecuenciaAbsoluta}/${data.sampleSize} = ${row.frecuenciaRelativa.toFixed(2)}`;
                const tooltipP = `${row.frecuenciaRelativa.toFixed(2)} x 100 % = ${formatPercentage(row.porcentaje)}`;
                const tooltipFaAcum = prevFa !== null ? `${prevFa} + ${row.frecuenciaAbsoluta} = ${row.frecuenciaAbsolutaAcumulada}` : `Cantidad acumulada: ${row.frecuenciaAbsoluta} casos`;
                const tooltipFrAcum = `${row.frecuenciaAbsolutaAcumulada}/${data.sampleSize} = ${row.frecuenciaRelativaAcumulada.toFixed(2)}`;
                const tooltipPAcum = `${row.frecuenciaRelativaAcumulada.toFixed(2)} x 100 % = ${formatPercentage(row.porcentajeAcumulado)}`;

                return (
                  <tr
                    key={row.index}
                    onClick={() => setSelectedRowIndex((prev) => (prev === row.index ? null : row.index))}
                    onMouseEnter={() => setHoveredRowIndex(row.index)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                    className={`cursor-pointer transition-all ${
                      isSelected || isHovered ? 'selected-row font-medium' : ''
                    }`}
                  >
                    {/* N° */}
                    <td className="font-bold text-[#0F2942] dark:text-slate-300 relative group/cell" title={`Fila N° ${row.index}`}>
                      <span>{row.index}</span>
                      <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/cell:flex flex-col items-start z-50 pointer-events-none whitespace-nowrap">
                        <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                          Fila N° {row.index}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1 ml-3" />
                      </div>
                    </td>
                    
                    {/* Intervalo */}
                    <td 
                      title={tooltipInterval}
                      className={`font-mono font-semibold transition-colors relative group/cell ${
                        isSelected && activeStep === 'mc' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-black ring-2 ring-amber-400' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <span>{row.intervalLabel}</span>
                      <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/cell:flex flex-col items-start z-50 pointer-events-none whitespace-nowrap">
                        <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                          {tooltipInterval}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1 ml-6" />
                      </div>
                    </td>

                    {/* Marca de clase */}
                    <td 
                      title={tooltipMc}
                      className={`font-mono transition-colors relative group/cell ${
                        isSelected && activeStep === 'mc' ? 'bg-amber-200 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100 font-black ring-2 ring-amber-500' : 'text-[#0F2942] dark:text-slate-200'
                      }`}
                    >
                      <span>{row.marcaDeClase}</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                        <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                          {tooltipMc}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                      </div>
                    </td>

                    {/* fa */}
                    <td 
                      title={tooltipFa}
                      className={`font-mono font-bold transition-colors relative group/cell ${
                        isSelected && activeStep === 'fr' 
                          ? 'bg-emerald-200 dark:bg-emerald-900/90 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500' 
                          : isPriorForCumulative 
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 ring-1 ring-purple-300 font-black' 
                          : 'text-[#1B8A5A] dark:text-emerald-400'
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
                          setSelectedRowIndex((prev) => (prev === row.index ? null : row.index));
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B8A5A] dark:bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Viendo ✕' : 'Explicar'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Fila de Totales Estricta: Prohibición de Σ */}
              <tr className="total-row">
                <td colSpan={3} className="text-right uppercase font-extrabold pr-4 text-[#0F2942] dark:text-slate-100">
                  {data.totals.label}
                </td>
                <td className="font-mono font-black text-[#1B8A5A] dark:text-emerald-400 relative group/cell" title={`Total fa = ${data.totals.totalFa}`}>
                  <span>{data.totals.totalFa}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                    <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                      Total fa = n = {data.totals.totalFa}
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                  </div>
                </td>
                <td className="font-mono font-bold text-slate-800 dark:text-slate-200 relative group/cell" title={`Total fr = ${data.totals.totalFr.toFixed(2)}`}>
                  <span>{data.totals.totalFr.toFixed(2)}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/cell:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap">
                    <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                      Total fr = {data.totals.totalFr.toFixed(2)}
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1" />
                  </div>
                </td>
                <td className="font-mono font-bold text-slate-800 dark:text-slate-200 relative group/cell" title={`Total p = ${formatPercentage(data.totals.totalP)}`}>
                  <span>{formatPercentage(data.totals.totalP)}</span>
                  <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/cell:flex flex-col items-end z-50 pointer-events-none whitespace-nowrap">
                    <div className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl border border-slate-700">
                      Total p = {formatPercentage(data.totals.totalP)}
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#0F2942] dark:bg-[#080D1A] border-r border-b border-slate-700 rotate-45 -mt-1 mr-4" />
                  </div>
                </td>
                <td colSpan={4} className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center font-normal">
                  — No se totaliza —
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. DESGLOSE INTERACTIVO: TARJETAS AMPLIADAS CON SELECCIÓN FIJABLE O BANNER INFORMATIVO */}
        {selectedRow ? (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#131C2E] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0F2942] dark:text-slate-100 font-bold">
                <Info className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
                <span>Cálculo paso a paso del Intervalo N° {selectedRow.index}: <span className="font-mono text-[#1B8A5A] dark:text-emerald-400 font-extrabold">{selectedRow.intervalLabel}</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ✨ Pasa el mouse o <strong className="text-slate-700 dark:text-slate-200">haz clic para fijar la iluminación</strong> en la tabla:
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Tarjeta 1: Marca de Clase */}
              <div 
                onMouseEnter={() => setHoveredStep('mc')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => handleStepClick('mc')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                  pinnedStep === 'mc'
                    ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-500 shadow-md ring-2 ring-amber-400'
                    : hoveredStep === 'mc'
                    ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 shadow-xs'
                    : 'bg-white dark:bg-[#0A1322] border-slate-200 dark:border-slate-700 hover:border-amber-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-amber-800 dark:text-amber-300 mb-2">
                    <span>1. Marca de Clase (Mc)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'mc' ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                    }`}>
                      {pinnedStep === 'mc' ? '📌 Fijado' : 'Paso 1'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.mc} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Punto medio: (Li + Ls) / 2
                  </span>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium block text-center mt-1">
                    {pinnedStep === 'mc' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>

              {/* Tarjeta 2: Frecuencia Relativa */}
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
                    <span>2. Frec. Relativa (fr)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'fr' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                    }`}>
                      {pinnedStep === 'fr' ? '📌 Fijado' : 'Paso 2'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.fr} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Proporción: fa / n (2 dec.)
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-medium block text-center mt-1">
                    {pinnedStep === 'fr' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>

              {/* Tarjeta 3: Porcentaje */}
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
                    <span>3. Porcentaje (p %)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'p' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200'
                    }`}>
                      {pinnedStep === 'p' ? '📌 Fijado' : 'Paso 3'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.p} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Porcentaje: fr × 100
                  </span>
                  <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80 font-medium block text-center mt-1">
                    {pinnedStep === 'p' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>

              {/* Tarjeta 4: Acumulados */}
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
                    <span>4. Acumulados (Fa, Fr, P)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'acum' ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200'
                    }`}>
                      {pinnedStep === 'acum' ? '📌 Fijado' : 'Paso 4'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 dark:bg-[#0F172A] p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 dark:border-slate-800 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.faAcum} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center">
                    Suma sucesiva de frecuencias fa
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

      {/* 4. MÓDULO GRÁFICO AUTOMÁTICO MULTI-TIPO CON ILUMINACIÓN BIDIRECCIONAL */}
      <HistogramVisualizer
        title={`Gráfico Estadístico: ${data.variableName}`}
        variableName={data.variableName}
        unit={data.unit}
        selectedIndex={selectedRowIndex}
        onSelectIndex={setSelectedRowIndex}
        hoveredIndex={hoveredRowIndex}
        onHoverIndex={setHoveredRowIndex}
        data={chartData}
      />
    </div>
  );
};
