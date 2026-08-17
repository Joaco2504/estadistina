// src/components/modules/ContingencyTableModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ContingencyTableResult } from '@/types/statistics';
import { generateContingencyTable, SAFETY_PRESETS } from '@/lib/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { 
  Table, 
  Dices, 
  Info,
  Split
} from 'lucide-react';

// Carga dinámica exclusiva para cliente de Recharts
const ContingencyBarVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.ContingencyBarVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 sm:h-96 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 mt-8">
        <span className="text-xs text-slate-400 font-medium">Cargando gráfico bivariado...</span>
      </div>
    ),
  }
);

export const ContingencyTableModule: React.FC = () => {
  // Preset por defecto
  const defaultPreset = SAFETY_PRESETS.find(p => p.id === 'contingencia-epp')!;
  
  const [variableX, setVariableX] = useState<string>(defaultPreset.defaultXName || 'Sector de Planta');
  const [variableY, setVariableY] = useState<string>(defaultPreset.defaultYName || 'Grado de Uso de EPP');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('contingencia-epp');
  const [dataPairs, setDataPairs] = useState<{ x: string; y: string }[]>(
    defaultPreset.bivariateDataGenerator ? defaultPreset.bivariateDataGenerator() : []
  );

  // Calcular resultado
  const result: ContingencyTableResult = React.useMemo(() => {
    return generateContingencyTable(variableX, variableY, dataPairs);
  }, [variableX, variableY, dataPairs]);

  // Cargar preset bivariado
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find(p => p.id === presetId);
    if (!preset || !preset.bivariateDataGenerator) return;

    setSelectedPresetId(presetId);
    setVariableX(preset.defaultXName || 'Variable X');
    setVariableY(preset.defaultYName || 'Variable Y');
    setDataPairs(preset.bivariateDataGenerator());
  };

  // Generar datos bivariados aleatorios
  const handleRandomize = () => {
    const presets = SAFETY_PRESETS.filter(p => p.recommendedType === 'contingency');
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    if (randomPreset && randomPreset.bivariateDataGenerator) {
      setSelectedPresetId(randomPreset.id);
      setVariableX(randomPreset.defaultXName || 'Sector de Planta');
      setVariableY(randomPreset.defaultYName || 'Uso de EPP');
      setDataPairs(randomPreset.bivariateDataGenerator());
    }
  };

  // Transformar matriz para el gráfico de Recharts con claves nominales e indexadas
  const chartData = React.useMemo(() => {
    return result.rowCategories.map((rowCat, rIdx) => {
      const entry: any = { categoryX: rowCat };
      result.colCategories.forEach((colCat, cIdx) => {
        entry[colCat] = result.matrix[rIdx][cIdx];
        entry[`col_${cIdx}`] = result.matrix[rIdx][cIdx];
      });
      return entry;
    });
  }, [result]);

  return (
    <div className="space-y-8">
      {/* Panel de Control y Presets Bivariados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0F2942] to-[#15385B] p-5 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Split className="w-5 h-5 text-[#E67E22]" />
              <h2 className="text-base sm:text-lg font-bold tracking-wide">
                Módulo 3: Análisis Estadístico Bivariado (Tabla de Contingencia)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Estudio simultáneo de dos factores de Higiene y Seguridad para evaluar su distribución conjunta.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Dices className="w-4 h-4" />
              <span>Generar Caso Aleatorio</span>
            </button>
          </div>
        </div>

        {/* Pastillas de Casos Bivariados de SySO */}
        <div className="p-6 pb-2 bg-slate-50 border-b border-slate-200">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Cargar Estudios Bivariados de Prevención:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAFETY_PRESETS.filter(p => p.recommendedType === 'contingency').map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>[{preset.category}] {preset.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Definición de Variables */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Variable 1 (Filas - Factor X)
            </label>
            <input
              type="text"
              value={variableX}
              onChange={(e) => setVariableX(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-medium text-[#0F2942] focus:ring-2 focus:ring-[#0F2942]/20 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Categorías: <span className="font-mono text-[#0F2942] font-semibold">{result.rowCategories.join(', ')}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Variable 2 (Columnas - Factor Y)
            </label>
            <input
              type="text"
              value={variableY}
              onChange={(e) => setVariableY(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-medium text-[#0F2942] focus:ring-2 focus:ring-[#0F2942]/20 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Categorías: <span className="font-mono text-[#1B8A5A] font-semibold">{result.colCategories.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 1. DESGLOSE DIDÁCTICO PASO A PASO EXIGIDO POR LA CÁTEDRA */}
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[#0F2942]">
          <div className="p-2 rounded-xl bg-[#0F2942] text-white">
            <Info className="w-5 h-5 text-[#E67E22]" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wide">
              Desglose Didáctico Paso a Paso de la Tabla de Contingencia
            </h3>
            <p className="text-xs text-slate-600">
              Construcción rigurosa de frecuencias simples, frecuencias conjuntas y totales marginales:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Paso 1: Frecuencias Simples */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center justify-between">
              <span>1. Frecuencias Simples</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono">Paso 1</span>
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
              Conteo marginal independiente para cada variable por separado:
            </p>
            <div className="text-xs space-y-1 bg-slate-50 p-2 rounded font-mono text-slate-700">
              <p className="font-bold text-[#0F2942]">{variableX}:</p>
              {result.didacticSteps.step1SimpleFrequencies.varXCounts.map(item => (
                <p key={item.category}>• {item.category}: {item.count}</p>
              ))}
              <p className="font-bold text-[#1B8A5A] pt-1 mt-1 border-t border-slate-200">{variableY}:</p>
              {result.didacticSteps.step1SimpleFrequencies.varYCounts.map(item => (
                <p key={item.category}>• {item.category}: {item.count}</p>
              ))}
            </div>
          </div>

          {/* Paso 2: Frecuencias Dobles / Conjuntas */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center justify-between">
              <span>2. Frecuencias Dobles (fa_ij)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Paso 2</span>
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
              Conteo simultáneo de observaciones que cumplen ambas condiciones al mismo tiempo en cada celda interior.
            </p>
            <div className="bg-slate-50 p-2.5 rounded text-center text-xs">
              <MathFormula formula="fa_{ij} = \text{Conteo de } (X_i \cap Y_j)" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              Ejemplo: En {result.rowCategories[0]} con {result.colCategories[0]} hay {result.matrix[0]?.[0] || 0} casos.
            </p>
          </div>

          {/* Paso 3 & 4: Totales Marginales */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center justify-between">
              <span>3. Totales Marginales</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">Paso 3 y 4</span>
            </div>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
              Suma de frecuencias a lo largo de cada fila y de cada columna:
            </p>
            <div className="text-xs space-y-1 bg-slate-50 p-2 rounded text-slate-700 font-mono">
              <p className="font-bold text-slate-800">Total por fila:</p>
              {result.didacticSteps.step3RowMarginals.map(r => (
                <p key={r.category}>• {r.category}: {r.calculation} = {r.total}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Paso 5: Gran Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-[#0F2942] tracking-wide block">
              5. Gran Total de la Muestra (n)
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              La suma de todos los totales por fila coincide exactamente con la suma de todos los totales por columna:
            </p>
          </div>
          <div className="bg-[#0F2942] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold">
            Gran Total = {result.grandTotal} observaciones
          </div>
        </div>
      </div>

      {/* 2. TABLA DE CONTINGENCIA FORMAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-[#1B8A5A]" />
              <h3 className="text-base sm:text-lg font-bold tracking-wide">
                Tabla de Contingencia Bivariada: {variableX} × {variableY}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Cruce de frecuencias absolutas conjuntas y totales marginales.
            </p>
          </div>

          <div className="text-xs font-mono text-white bg-[#15385B] px-3 py-1.5 rounded-lg border border-[#1C4874]">
            Gran Total (n): {result.grandTotal}
          </div>
        </div>

        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="stat-table">
            <thead>
              <tr>
                <th className="bg-[#0A1D30] text-left">
                  {variableX} \ {variableY}
                </th>
                {result.colCategories.map((colCat) => (
                  <th key={colCat} className="bg-[#0F2942]">
                    {colCat}
                  </th>
                ))}
                <th className="bg-[#183C5F] text-amber-300 font-bold">
                  Total por fila
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rowCategories.map((rowCat, rIdx) => (
                <tr key={rowCat}>
                  <td className="text-left font-bold text-[#0F2942] bg-slate-50">
                    {rowCat}
                  </td>
                  {result.colCategories.map((colCat, cIdx) => (
                    <td key={colCat} className="font-mono font-bold text-slate-800 text-base">
                      {result.matrix[rIdx][cIdx]}
                    </td>
                  ))}
                  {/* Total por fila */}
                  <td className="font-mono font-extrabold text-[#1B8A5A] bg-emerald-50/50 text-base">
                    {result.rowMarginalTotals[rIdx]}
                  </td>
                </tr>
              ))}

              {/* Fila de Totales Marginales por Columna y Gran Total */}
              <tr className="total-row">
                <td className="text-left uppercase tracking-wider font-extrabold text-[#0F2942]">
                  Total por columna
                </td>
                {result.colCategories.map((colCat, cIdx) => (
                  <td key={colCat} className="font-mono font-extrabold text-[#0F2942] text-base">
                    {result.colMarginalTotals[cIdx]}
                  </td>
                ))}
                {/* Gran Total */}
                <td className="font-mono font-black text-white bg-[#0F2942] text-lg">
                  {result.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. GRÁFICO AUTOMÁTICO BIVARIADO (BARRAS AGRUPADAS) */}
      <ContingencyBarVisualizer
        title={`Distribución Bivariada: ${variableX} según ${variableY}`}
        xLabel={variableX}
        yLabel="Frecuencia Absoluta Conjunta (fa)"
        categoriesX={result.rowCategories}
        categoriesY={result.colCategories}
        chartData={chartData}
      />
    </div>
  );
};
