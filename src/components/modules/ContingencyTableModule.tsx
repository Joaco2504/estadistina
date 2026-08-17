// src/components/modules/ContingencyTableModule.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ContingencyTableResult } from '@/types/statistics';
import { generateContingencyTable, SAFETY_PRESETS } from '@/lib/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { exportContingencyTableToExcel } from '@/lib/excelExport';
import { 
  Table, 
  Dices, 
  Info,
  Split,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';

const ContingencyBarVisualizer = dynamic(
  () => import('./ChartVisualizer').then((mod) => mod.ContingencyBarVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 mt-6">
        <span className="text-xs text-slate-400 font-medium">Cargando gráfico bivariado...</span>
      </div>
    ),
  }
);

export const ContingencyTableModule: React.FC = () => {
  const defaultPreset = SAFETY_PRESETS.find(p => p.id === 'contingencia-epp')!;
  
  const [variableX, setVariableX] = useState<string>(defaultPreset.defaultXName || 'Sector de Planta');
  const [variableY, setVariableY] = useState<string>(defaultPreset.defaultYName || 'Grado de Uso de EPP');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('contingencia-epp');
  const [customN, setCustomN] = useState<number>(45);
  const [showDidacticSteps, setShowDidacticSteps] = useState<boolean>(false);
  
  const [dataPairs, setDataPairs] = useState<{ x: string; y: string }[]>(
    defaultPreset.bivariateDataGenerator ? defaultPreset.bivariateDataGenerator() : []
  );

  // Calcular resultado
  const result: ContingencyTableResult = React.useMemo(() => {
    return generateContingencyTable(variableX, variableY, dataPairs);
  }, [variableX, variableY, dataPairs]);

  // Generador de pares con tamaño exacto n
  const generatePairsForPreset = (presetId: string, targetN: number): { x: string; y: string }[] => {
    const preset = SAFETY_PRESETS.find(p => p.id === presetId) || defaultPreset;
    let catsX = ['Mecanizado', 'Soldadura', 'Pintura', 'Depósito'];
    let catsY = ['Cumple Siempre', 'Uso Parcial', 'No Cumple'];

    if (preset.id === 'contingencia-turnos') {
      catsX = ['Turno Mañana', 'Turno Tarde', 'Turno Noche'];
      catsY = ['Leve (Sin Baja)', 'Moderado (1 a 10 días)', 'Grave (>10 días)'];
    } else if (preset.id === 'contingencia-permisos') {
      catsX = ['Trabajo en Altura', 'Espacios Confinados', 'Corte y Soldadura', 'Alta Tensión'];
      catsY = ['ATS Aprobado y Firmado', 'ATS En Revisión', 'Sin ATS (No Conforme)'];
    }

    const pairs: { x: string; y: string }[] = [];
    const count = Math.max(5, Math.min(300, targetN || 40));
    for (let i = 0; i < count; i++) {
      const x = catsX[Math.floor(Math.random() * catsX.length)];
      const y = catsY[Math.floor(Math.random() * catsY.length)];
      pairs.push({ x, y });
    }
    return pairs;
  };

  // Cargar preset bivariado
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setVariableX(preset.defaultXName || 'Variable X');
    setVariableY(preset.defaultYName || 'Variable Y');
    setDataPairs(generatePairsForPreset(presetId, customN));
  };

  // Generar datos bivariados aleatorios con n configurable
  const handleRandomize = (overrideN?: number) => {
    const targetN = overrideN !== undefined ? overrideN : customN;
    if (overrideN !== undefined) {
      setCustomN(overrideN);
    }
    setDataPairs(generatePairsForPreset(selectedPresetId, targetN));
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
    <div className="space-y-6">
      {/* Panel de Control y Presets Bivariados Minimalista */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-[#E67E22]" />
            <h2 className="text-sm sm:text-base font-bold tracking-wide">
              Módulo 3: Tabla de Contingencia Bivariada
            </h2>
            <span className="text-xs font-mono text-slate-300">
              (n = {result.grandTotal} casos)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#15385B] px-2.5 py-1 rounded-lg border border-[#1C4874]">
              <label className="text-xs text-slate-300 font-medium">Muestra (n):</label>
              <input
                type="number"
                min={5}
                max={300}
                value={customN}
                onChange={(e) => setCustomN(Number(e.target.value))}
                className="w-14 bg-[#0A1D30] text-white font-mono text-xs font-bold text-center px-1 py-0.5 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1B8A5A]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRandomize()}
              className="flex items-center gap-1 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Simulación</span>
            </button>
          </div>
        </div>

        {/* Casos Rápidos de SySO & Chips de Tamaño Muestral */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Casos Bivariados:</span>
            {SAFETY_PRESETS.filter(p => p.recommendedType === 'contingency').map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>[{preset.category}] {preset.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Fijar n:</span>
            {[20, 35, 50, 80, 150].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleRandomize(size)}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-all cursor-pointer ${
                  customN === size
                    ? 'bg-[#1B8A5A] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Definición de Variables */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Variable 1 (Filas - Factor X)
            </label>
            <input
              type="text"
              value={variableX}
              onChange={(e) => setVariableX(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Variable 2 (Columnas - Factor Y)
            </label>
            <input
              type="text"
              value={variableY}
              onChange={(e) => setVariableY(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none"
            />
          </div>
        </div>
      </div>

      {/* 1. DESGLOSE DIDÁCTICO PASO A PASO PLEGABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div 
          onClick={() => setShowDidacticSteps(!showDidacticSteps)}
          className="px-5 py-3 bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-100"
        >
          <div className="flex items-center gap-2 text-[#0F2942]">
            <Info className="w-4 h-4 text-[#E67E22]" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Desglose Didáctico de Frecuencias Simples, Conjuntas y Marginales
            </span>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {showDidacticSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showDidacticSteps && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50">
            {/* Paso 1: Frecuencias Simples */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                1. Frecuencias Simples
              </span>
              <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                <p><strong>{variableX}:</strong> {result.didacticSteps.step1SimpleFrequencies.varXCounts.map(i => `${i.category}(${i.count})`).join(', ')}</p>
                <p><strong>{variableY}:</strong> {result.didacticSteps.step1SimpleFrequencies.varYCounts.map(i => `${i.category}(${i.count})`).join(', ')}</p>
              </div>
            </div>

            {/* Paso 2: Frecuencias Dobles */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                2. Frecuencias Dobles (fa_ij)
              </span>
              <p className="text-[11px] text-slate-600 mb-1">Conteo conjunto en cada celda interior:</p>
              <MathFormula formula="fa_{ij} = \text{Conteo de } (X_i \cap Y_j)" />
            </div>

            {/* Paso 3: Totales Marginales */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                3. Totales Marginales
              </span>
              <p className="text-[11px] text-slate-600">
                Suma por filas y columnas = <strong>Gran Total ({result.grandTotal})</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. TABLA DE CONTINGENCIA FORMAL */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-[#0F2942] px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#1B8A5A]" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Tabla Bivariada: {variableX} × {variableY}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* BOTÓN EXPORTAR A EXCEL */}
            <button
              type="button"
              onClick={() => exportContingencyTableToExcel(result)}
              className="flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Descargar tabla en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>

            <span className="text-xs font-mono bg-[#15385B] px-2.5 py-1 rounded text-white border border-[#1C4874] hidden sm:inline">
              Gran Total: {result.grandTotal}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
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
                    <td key={colCat} className="font-mono font-bold text-slate-800">
                      {result.matrix[rIdx][cIdx]}
                    </td>
                  ))}
                  <td className="font-mono font-extrabold text-[#1B8A5A] bg-emerald-50/50">
                    {result.rowMarginalTotals[rIdx]}
                  </td>
                </tr>
              ))}

              {/* Totales Marginales por Columna y Gran Total */}
              <tr className="total-row">
                <td className="text-left uppercase font-extrabold text-[#0F2942]">
                  Total por columna
                </td>
                {result.colCategories.map((colCat, cIdx) => (
                  <td key={colCat} className="font-mono font-extrabold text-[#0F2942]">
                    {result.colMarginalTotals[cIdx]}
                  </td>
                ))}
                <td className="font-mono font-black text-white bg-[#0F2942]">
                  {result.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. GRÁFICO AUTOMÁTICO BIVARIADO (Barras Agrupadas / Apiladas) */}
      <ContingencyBarVisualizer
        title={`Distribución Bivariada: ${variableX} según ${variableY}`}
        xLabel={variableX}
        yLabel="Frecuencia Conjunta (fa)"
        categoriesX={result.rowCategories}
        categoriesY={result.colCategories}
        chartData={chartData}
      />
    </div>
  );
};
