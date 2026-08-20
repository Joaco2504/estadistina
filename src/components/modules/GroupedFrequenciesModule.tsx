// src/components/modules/GroupedFrequenciesModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GroupedFrequencyTableResult } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { exportGroupedTableToExcel } from '@/lib/excelExport';
import { 
  Calculator, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Sparkles
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
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
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
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  2. Cantidad de Clases (k = √n)
                </span>
                <div className="text-xs font-mono text-slate-700 mb-1">
                  √{data.sampleSize} ≈ {(Math.sqrt(data.sampleSize)).toFixed(2)} → <strong>k = {data.parameters.k}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  <MathFormula formula="k = \sqrt{n}" />
                </div>
              </div>

              {/* Amplitud */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
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

          <div className="flex items-center gap-2">
            {/* BOTÓN EXPORTAR A EXCEL */}
            <button
              type="button"
              onClick={() => exportGroupedTableToExcel(data)}
              className="flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Descargar tabla en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>

            <span className="text-xs font-mono bg-[#15385B] px-2.5 py-1 rounded text-slate-200 border border-[#1C4874] hidden sm:inline">
              k = {data.parameters.k} | A = {data.parameters.amplitud}
            </span>
          </div>
        </div>

        {/* Indicador Dinámico de Iluminación en Tiempo Real (Sin titileo) */}
        {activeStep && (
          <div className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E67E22] flex-shrink-0" />
              <span>
                {activeStep === 'mc' && `Marca de Clase Mc = (${selectedRow.intervalLabel}) / 2 = ${selectedRow.marcaDeClase}`}
                {activeStep === 'fr' && `Frecuencia Relativa fr = fa (${selectedRow.frecuenciaAbsoluta}) / n (${data.sampleSize}) = ${selectedRow.frecuenciaRelativa.toFixed(2)}`}
                {activeStep === 'p' && `Porcentaje p = fr (${selectedRow.frecuenciaRelativa.toFixed(2)}) × 100 = ${selectedRow.porcentaje.toFixed(2)}%`}
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

        {/* Tabla Didáctica Minimalista con Iluminación en Tiempo Real */}
        <div className="overflow-x-auto p-4">
          <table className="stat-table">
            <thead>
              <tr>
                <th>N°</th>
                <th className={activeStep === 'mc' ? 'bg-amber-100 text-amber-950 font-bold' : ''}>
                  Intervalo (I)
                </th>
                <th className={activeStep === 'mc' ? 'bg-amber-200 text-amber-950 font-black ring-2 ring-amber-400' : ''}>
                  Marca de Clase (Mc)
                </th>
                <th className={activeStep === 'fr' || activeStep === 'acum' ? 'bg-emerald-100 text-emerald-950 font-bold' : ''}>
                  Frec. Absoluta (fa)
                </th>
                <th className={activeStep === 'fr' || activeStep === 'p' ? 'bg-emerald-200 text-emerald-950 font-black ring-2 ring-emerald-400' : ''}>
                  Frec. Relativa (fr)
                </th>
                <th className={activeStep === 'p' ? 'bg-blue-200 text-blue-950 font-black ring-2 ring-blue-400' : ''}>
                  Porcentaje (p %)
                </th>
                <th className={activeStep === 'acum' ? 'bg-purple-200 text-purple-950 font-black ring-2 ring-purple-400' : ''}>
                  Frec. Abs. Acum. (Fa)
                </th>
                <th className={activeStep === 'acum' ? 'bg-purple-100 text-purple-950 font-bold' : ''}>
                  Frec. Rel. Acum. (Fr)
                </th>
                <th className={activeStep === 'acum' ? 'bg-purple-100 text-purple-950 font-bold' : ''}>
                  Porc. Acum. (P %)
                </th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const isSelected = selectedRowIndex === row.index;
                const isPriorForCumulative = activeStep === 'acum' && row.index <= (selectedRowIndex || 1);

                return (
                  <tr
                    key={row.index}
                    onClick={() => setSelectedRowIndex(row.index)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'bg-emerald-50/90 font-medium' : ''
                    }`}
                  >
                    <td className="font-bold text-[#0F2942]">{row.index}</td>
                    
                    {/* Intervalo */}
                    <td className={`font-mono font-semibold transition-colors ${
                      isSelected && activeStep === 'mc' ? 'bg-amber-100 text-amber-900 font-black ring-2 ring-amber-400' : 'text-slate-800'
                    }`}>
                      {row.intervalLabel}
                    </td>

                    {/* Marca de clase */}
                    <td className={`font-mono transition-colors ${
                      isSelected && activeStep === 'mc' ? 'bg-amber-200 text-amber-950 font-black ring-2 ring-amber-500' : 'text-[#0F2942]'
                    }`}>
                      {row.marcaDeClase}
                    </td>

                    {/* fa */}
                    <td className={`font-mono font-bold transition-colors ${
                      isSelected && activeStep === 'fr' 
                        ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500' 
                        : isPriorForCumulative 
                        ? 'bg-purple-100 text-purple-950 ring-1 ring-purple-300 font-black' 
                        : 'text-[#1B8A5A]'
                    }`}>
                      {row.frecuenciaAbsoluta}
                    </td>

                    {/* fr (2 decimales) */}
                    <td className={`font-mono transition-colors ${
                      isSelected && (activeStep === 'fr' || activeStep === 'p') 
                        ? 'bg-emerald-200 text-emerald-950 font-black ring-2 ring-emerald-500' 
                        : 'text-slate-700'
                    }`}>
                      {row.frecuenciaRelativa.toFixed(2)}
                    </td>

                    {/* p */}
                    <td className={`font-mono transition-colors ${
                      isSelected && activeStep === 'p' 
                        ? 'bg-blue-200 text-blue-950 font-black ring-2 ring-blue-500' 
                        : 'text-slate-700'
                    }`}>
                      {row.porcentaje.toFixed(2)}%
                    </td>

                    {/* Fa */}
                    <td className={`font-mono transition-colors ${
                      isSelected && activeStep === 'acum' 
                        ? 'bg-purple-200 text-purple-950 font-black ring-2 ring-purple-500' 
                        : 'text-slate-700'
                    }`}>
                      {row.frecuenciaAbsolutaAcumulada}
                    </td>

                    {/* Fr (2 decimales) */}
                    <td className={`font-mono transition-colors ${
                      isSelected && activeStep === 'acum' 
                        ? 'bg-purple-100 text-purple-950 font-bold ring-1 ring-purple-400' 
                        : 'text-slate-700'
                    }`}>
                      {row.frecuenciaRelativaAcumulada.toFixed(2)}
                    </td>

                    {/* P */}
                    <td className={`font-mono transition-colors ${
                      isSelected && activeStep === 'acum' 
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

              {/* Fila de Totales Estricta: Prohibición de Σ */}
              <tr className="total-row">
                <td colSpan={3} className="text-right uppercase font-extrabold pr-4 text-[#0F2942]">
                  {data.totals.label}
                </td>
                <td className="font-mono font-black text-[#1B8A5A]">
                  {data.totals.totalFa}
                </td>
                <td className="font-mono font-bold text-slate-800">
                  {data.totals.totalFr.toFixed(2)}
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

        {/* 3. DESGLOSE INTERACTIVO: TARJETAS AMPLIADAS CON SELECCIÓN FIJABLE */}
        {selectedRow && (
          <div className="border-t border-slate-200 bg-slate-50/90 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0F2942] font-bold">
                <Info className="w-4 h-4 text-[#E67E22]" />
                <span>Cálculo paso a paso del Intervalo N° {selectedRow.index}: <span className="font-mono text-[#1B8A5A] font-extrabold">{selectedRow.intervalLabel}</span></span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                ✨ Pasa el mouse para previsualizar o <strong className="text-slate-700">haz clic para fijar la iluminación</strong> en la tabla:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Tarjeta 1: Marca de Clase */}
              <div 
                onMouseEnter={() => setHoveredStep('mc')}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => handleStepClick('mc')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                  pinnedStep === 'mc'
                    ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400'
                    : hoveredStep === 'mc'
                    ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-amber-800 mb-2">
                    <span>1. Marca de Clase (Mc)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'mc' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {pinnedStep === 'mc' ? '📌 Fijado' : 'Paso 1'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.mc} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block text-center">
                    Punto medio: (Li + Ls) / 2
                  </span>
                  <span className="text-[10px] text-amber-700/80 font-medium block text-center mt-1">
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
                    ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                    : hoveredStep === 'fr'
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-800 mb-2">
                    <span>2. Frec. Relativa (fr)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'fr' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {pinnedStep === 'fr' ? '📌 Fijado' : 'Paso 2'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.fr} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block text-center">
                    Proporción: fa / n (2 dec.)
                  </span>
                  <span className="text-[10px] text-emerald-700/80 font-medium block text-center mt-1">
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
                    ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400'
                    : hoveredStep === 'p'
                    ? 'bg-blue-50/50 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-blue-800 mb-2">
                    <span>3. Porcentaje (p %)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'p' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {pinnedStep === 'p' ? '📌 Fijado' : 'Paso 3'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.p} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block text-center">
                    Porcentaje: fr × 100
                  </span>
                  <span className="text-[10px] text-blue-700/80 font-medium block text-center mt-1">
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
                    ? 'bg-purple-50/90 border-purple-500 shadow-md ring-2 ring-purple-400'
                    : hoveredStep === 'acum'
                    ? 'bg-purple-50/50 border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-purple-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-purple-800 mb-2">
                    <span>4. Acumulados (Fa, Fr, P)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      pinnedStep === 'acum' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-900'
                    }`}>
                      {pinnedStep === 'acum' ? '📌 Fijado' : 'Paso 4'}
                    </span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl text-center text-sm sm:text-base border border-slate-100 mb-2">
                    <MathFormula formula={selectedRow.stepExplanations.faAcum} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block text-center">
                    Suma sucesiva de frecuencias fa
                  </span>
                  <span className="text-[10px] text-purple-700/80 font-medium block text-center mt-1">
                    {pinnedStep === 'acum' ? '✓ Fijado • Clic para soltar' : 'Haz clic para fijar en tabla'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MÓDULO GRÁFICO AUTOMÁTICO MULTI-TIPO */}
      <HistogramVisualizer
        title={`Gráfico Estadístico: ${data.variableName}`}
        variableName={data.variableName}
        unit={data.unit}
        data={chartData}
      />
    </div>
  );
};
