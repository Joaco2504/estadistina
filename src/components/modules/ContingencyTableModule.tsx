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
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit3,
  Maximize2
} from 'lucide-react';
import { FloatingTableModal } from '@/components/ui/FloatingTableModal';

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
  const [isFloatingTableOpen, setIsFloatingTableOpen] = useState(false);
  const [customN, setCustomN] = useState<number>(45);
  const [showDidacticSteps, setShowDidacticSteps] = useState<boolean>(false);
  
  // Categorías y Matriz Directamente Editables
  const [rowCategories, setRowCategories] = useState<string[]>(['Mecanizado', 'Soldadura', 'Pintura', 'Depósito']);
  const [colCategories, setColCategories] = useState<string[]>(['Cumple Siempre', 'Uso Parcial', 'No Cumple']);
  const [matrix, setMatrix] = useState<number[][]>([
    [12, 3, 1],
    [9, 4, 2],
    [7, 2, 0],
    [3, 1, 1]
  ]);

  // Totales calculados en tiempo real
  const rowMarginalTotals = matrix.map(row => row.reduce((acc, curr) => acc + (Number(curr) || 0), 0));
  const colMarginalTotals = colCategories.map((_, cIdx) => 
    matrix.reduce((acc, row) => acc + (Number(row[cIdx]) || 0), 0)
  );
  const grandTotal = rowMarginalTotals.reduce((acc, val) => acc + val, 0);

  // Generador de pares a partir de un preset
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setVariableX(preset.defaultXName || 'Variable X');
    setVariableY(preset.defaultYName || 'Variable Y');

    if (preset.id === 'contingencia-turnos') {
      setRowCategories(['Turno Mañana', 'Turno Tarde', 'Turno Noche']);
      setColCategories(['Leve (Sin Baja)', 'Moderado (1 a 10 días)', 'Grave (>10 días)']);
      setMatrix([
        [11, 4, 1],
        [8, 5, 2],
        [3, 4, 2]
      ]);
    } else if (preset.id === 'contingencia-permisos') {
      setRowCategories(['Trabajo en Altura', 'Espacios Confinados', 'Corte y Soldadura', 'Alta Tensión']);
      setColCategories(['ATS Aprobado y Firmado', 'ATS En Revisión', 'Sin ATS (No Conforme)']);
      setMatrix([
        [10, 2, 0],
        [6, 1, 1],
        [8, 3, 0],
        [4, 0, 0]
      ]);
    } else if (preset.id === 'contingencia-lesion-cuerpo') {
      setRowCategories(['Corte / Laceración', 'Contusión / Golpe', 'Quemadura', 'Esguince']);
      setColCategories(['Manos y Dedos', 'Ojos y Rostro', 'Espalda / Columna', 'Miembros Inferiores']);
      setMatrix([
        [14, 2, 0, 3],
        [6, 1, 4, 5],
        [4, 3, 0, 1],
        [1, 0, 3, 1]
      ]);
    } else if (preset.id === 'contingencia-antiguedad-desvios') {
      setRowCategories(['< 1 Año (Ingresante)', '1 a 5 Años (Intermedio)', '> 5 Años (Experimentado)']);
      setColCategories(['Omisión de EPP', 'Uso Indebido de Herramienta', 'Exceso de Confianza', 'Operación a Velocidad Insegura']);
      setMatrix([
        [8, 6, 1, 2],
        [4, 3, 4, 3],
        [2, 1, 6, 2]
      ]);
    } else if (preset.id === 'contingencia-ruido-proteccion') {
      setRowCategories(['Alto Riesgo (>85 dBA)', 'Riesgo Moderado (80-85 dBA)', 'Área Confort (<80 dBA)']);
      setColCategories(['Uso Continuo y Correcto', 'Uso Intermitente', 'No Utiliza']);
      setMatrix([
        [12, 3, 1],
        [6, 7, 2],
        [1, 2, 6]
      ]);
    } else {
      setRowCategories(['Mecanizado', 'Soldadura', 'Pintura', 'Depósito']);
      setColCategories(['Cumple Siempre', 'Uso Parcial', 'No Cumple']);
      setMatrix([
        [12, 3, 1],
        [9, 4, 2],
        [7, 2, 0],
        [3, 1, 1]
      ]);
    }
  };

  // Simulación aleatoria respetando la estructura activa
  const handleRandomize = (overrideN?: number) => {
    const targetN = overrideN !== undefined ? overrideN : customN;
    if (overrideN !== undefined) {
      setCustomN(overrideN);
    }

    const totalCells = rowCategories.length * colCategories.length;
    const basePerCell = Math.floor(targetN / totalCells);
    let remainder = targetN % totalCells;

    const newMatrix = rowCategories.map(() => 
      colCategories.map(() => {
        let val = Math.max(0, basePerCell + Math.floor((Math.random() - 0.5) * 4));
        if (remainder > 0) {
          val++;
          remainder--;
        }
        return val;
      })
    );

    setMatrix(newMatrix);
  };

  // Manejo de edición de celdas
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const newMatrix = matrix.map((row, r) => 
      row.map((cell, c) => (r === rIdx && c === cIdx ? num : cell))
    );
    setMatrix(newMatrix);
  };

  // Manejo de edición de nombres de fila
  const handleRowCategoryChange = (rIdx: number, newName: string) => {
    const updated = [...rowCategories];
    updated[rIdx] = newName;
    setRowCategories(updated);
  };

  // Manejo de edición de nombres de columna
  const handleColCategoryChange = (cIdx: number, newName: string) => {
    const updated = [...colCategories];
    updated[cIdx] = newName;
    setColCategories(updated);
  };

  // Agregar Fila
  const handleAddRow = () => {
    const newRowName = `Categoría Fila ${rowCategories.length + 1}`;
    setRowCategories([...rowCategories, newRowName]);
    setMatrix([...matrix, new Array(colCategories.length).fill(1)]);
  };

  // Eliminar Fila
  const handleDeleteRow = (rIdx: number) => {
    if (rowCategories.length <= 2) return;
    setRowCategories(rowCategories.filter((_, i) => i !== rIdx));
    setMatrix(matrix.filter((_, i) => i !== rIdx));
  };

  // Agregar Columna
  const handleAddCol = () => {
    const newColName = `Categoría Col ${colCategories.length + 1}`;
    setColCategories([...colCategories, newColName]);
    setMatrix(matrix.map(row => [...row, 1]));
  };

  // Eliminar Columna
  const handleDeleteCol = (cIdx: number) => {
    if (colCategories.length <= 2) return;
    setColCategories(colCategories.filter((_, i) => i !== cIdx));
    setMatrix(matrix.map(row => row.filter((_, i) => i !== cIdx)));
  };

  // Objeto estructurado para el Excel y Gráfico
  const result: ContingencyTableResult = {
    variableX,
    variableY,
    sampleSize: grandTotal,
    rowCategories,
    colCategories,
    matrix,
    rowMarginalTotals,
    colMarginalTotals,
    grandTotal,
    didacticSteps: {
      step1SimpleFrequencies: {
        varXCounts: rowCategories.map((cat, rIdx) => ({ category: cat, count: rowMarginalTotals[rIdx] })),
        varYCounts: colCategories.map((cat, cIdx) => ({ category: cat, count: colMarginalTotals[cIdx] })),
      },
      step2JointFrequencies: 'Cada celda central fa_{ij} representa la cantidad simultánea de elementos que cumplen la condición de la fila i y de la columna j al mismo tiempo.',
      step3RowMarginals: rowCategories.map((cat, rIdx) => ({
        category: cat,
        calculation: matrix[rIdx].join(' + '),
        total: rowMarginalTotals[rIdx],
      })),
      step4ColMarginals: colCategories.map((cat, cIdx) => ({
        category: cat,
        calculation: matrix.map(r => r[cIdx]).join(' + '),
        total: colMarginalTotals[cIdx],
      })),
      step5GrandTotal: {
        calculation: rowMarginalTotals.join(' + ') + ' = ' + colMarginalTotals.join(' + '),
        total: grandTotal,
      },
    },
  };

  // Transformar matriz para Recharts
  const chartData = React.useMemo(() => {
    return rowCategories.map((rowCat, rIdx) => {
      const entry: any = { categoryX: rowCat };
      colCategories.forEach((colCat, cIdx) => {
        entry[colCat] = Number(matrix[rIdx]?.[cIdx] ?? 0);
        entry[`col_${cIdx}`] = Number(matrix[rIdx]?.[cIdx] ?? 0);
      });
      return entry;
    });
  }, [rowCategories, colCategories, matrix]);

  // Renderizador unificado para tabla bivariada
  const renderTableContent = () => (
    <table className="stat-table">
      <thead>
        <tr>
          <th className="bg-[#0A1D30] dark:bg-[#080D1A] text-left text-xs font-bold text-white">
            {variableX} \ {variableY}
          </th>
          {colCategories.map((colCat, cIdx) => (
            <th key={`col-header-${cIdx}`} className="bg-[#0F2942] dark:bg-[#0B132B]">
              <div className="flex items-center justify-between gap-1">
                <input
                  type="text"
                  value={colCat}
                  onChange={(e) => handleColCategoryChange(cIdx, e.target.value)}
                  className="bg-transparent text-white font-bold text-xs text-center focus:outline-none focus:bg-white/10 px-1 py-0.5 rounded w-full"
                />
                {colCategories.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCol(cIdx)}
                    className="text-slate-400 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                    title="Eliminar columna"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </th>
          ))}
          <th className="bg-[#183C5F] dark:bg-[#1E293B] text-amber-300 font-bold text-xs">
            Total por fila
          </th>
        </tr>
      </thead>
      <tbody>
        {rowCategories.map((rowCat, rIdx) => (
          <tr key={`row-body-${rIdx}`}>
            <td className="text-left font-bold text-[#0F2942] dark:text-slate-100 bg-slate-50 dark:bg-[#0A1322]">
              <div className="flex items-center justify-between gap-1">
                <input
                  type="text"
                  value={rowCat}
                  onChange={(e) => handleRowCategoryChange(rIdx, e.target.value)}
                  className="bg-transparent font-bold text-xs text-[#0F2942] dark:text-slate-100 focus:outline-none focus:bg-white/10 px-1 py-0.5 rounded w-full border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600"
                />
                {rowCategories.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(rIdx)}
                    className="text-slate-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </td>

            {/* Celdas centrales editables */}
            {colCategories.map((_, cIdx) => (
              <td key={`cell-${rIdx}-${cIdx}`} className="p-1">
                <input
                  type="number"
                  min={0}
                  value={matrix[rIdx]?.[cIdx] ?? 0}
                  onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                  className="w-full text-center font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#0A1322] hover:bg-white dark:hover:bg-[#131C2E] focus:bg-white dark:focus:bg-[#131C2E] focus:ring-1 focus:ring-[#10B981] rounded px-1 py-1 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </td>
            ))}

            {/* Total por fila */}
            <td className="font-mono font-extrabold text-[#10B981] dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs">
              {rowMarginalTotals[rIdx]}
            </td>
          </tr>
        ))}

        {/* Totales Marginales por Columna y Gran Total */}
        <tr className="total-row">
          <td className="text-left uppercase font-extrabold text-[#0F2942] dark:text-slate-100 text-xs">
            Total por columna
          </td>
          {colCategories.map((_, cIdx) => (
            <td key={`col-total-${cIdx}`} className="font-mono font-extrabold text-[#0F2942] dark:text-slate-100 text-xs">
              {colMarginalTotals[cIdx]}
            </td>
          ))}
          <td className="font-mono font-black text-white bg-[#0F2942] dark:bg-emerald-700 text-xs">
            {grandTotal}
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      {/* Panel de Control y Presets Bivariados */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold tracking-wide">
              Módulo 3: Tabla de Contingencia Bivariada
            </h2>
            <span className="text-xs font-mono text-slate-300 dark:text-slate-400">
              (n = {grandTotal} casos)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#15385B] dark:bg-[#1E293B] px-2.5 py-1 rounded-lg border border-[#1C4874] dark:border-slate-700">
              <label className="text-xs text-slate-200 dark:text-slate-300 font-medium">Muestra (n):</label>
              <input
                type="number"
                min={5}
                max={500}
                value={customN}
                onChange={(e) => setCustomN(Number(e.target.value))}
                className="w-12 sm:w-14 bg-[#0A1D30] dark:bg-[#0F172A] text-white font-mono text-xs font-bold text-center px-1 py-0.5 rounded border border-slate-600 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B8A5A]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRandomize()}
              className="flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Simulación</span>
            </button>
          </div>
        </div>

        {/* Casos Rápidos de SySO */}
        <div className="p-4 bg-slate-50 dark:bg-[#131C2E] border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Casos Bivariados:</span>
            {SAFETY_PRESETS.filter(p => p.recommendedType === 'contingency').map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#0A1322] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{preset.chipLabel || preset.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Fijar n:</span>
            {[20, 35, 50, 80, 150].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleRandomize(size)}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-all cursor-pointer ${
                  customN === size
                    ? 'bg-[#1B8A5A] dark:bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#0A1322] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Definición de Variables y Títulos */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#0F172A]">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Variable 1 (Filas - Factor X)
            </label>
            <div className="relative">
              <input
                type="text"
                value={variableX}
                onChange={(e) => setVariableX(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-bold text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none"
              />
              <Edit3 className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Variable 2 (Columnas - Factor Y)
            </label>
            <div className="relative">
              <input
                type="text"
                value={variableY}
                onChange={(e) => setVariableY(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-bold text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none"
              />
              <Edit3 className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 1. DESGLOSE DIDÁCTICO PASO A PASO */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div 
          onClick={() => setShowDidacticSteps(!showDidacticSteps)}
          className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-[#0A1322] flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 text-[#0F2942] dark:text-slate-200">
            <Info className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Desglose Didáctico de Frecuencias Simples, Conjuntas y Marginales
            </span>
          </div>
          <button type="button" className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            {showDidacticSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showDidacticSteps && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-[#131C2E]">
            <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                1. Frecuencias Simples
              </span>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <p><strong>{variableX}:</strong> {result.didacticSteps.step1SimpleFrequencies.varXCounts.map(i => `${i.category}(${i.count})`).join(', ')}</p>
                <p><strong>{variableY}:</strong> {result.didacticSteps.step1SimpleFrequencies.varYCounts.map(i => `${i.category}(${i.count})`).join(', ')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                2. Frecuencias Dobles (fa_ij)
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-1">Conteo conjunto en cada celda interior:</p>
              <MathFormula formula="fa_{ij} = \text{Conteo de } (X_i \cap Y_j)" />
            </div>

            <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                3. Totales Marginales
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Suma por filas y columnas = <strong>Gran Total ({result.grandTotal})</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. TABLA DE CONTINGENCIA INTERACTIVA Y EDITABLE */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">
              Tabla Bivariada: {variableX} × {variableY}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* BOTÓN VENTANA FLOTANTE */}
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
              onClick={() => exportContingencyTableToExcel(result)}
              className="flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Descargar tabla en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Excel</span>
            </button>

            <span className="text-xs font-mono bg-[#15385B] dark:bg-[#1E293B] px-2.5 py-1 rounded text-white border border-[#1C4874] dark:border-slate-700 hidden sm:inline">
              Gran Total: {grandTotal}
            </span>
          </div>
        </div>

        {/* Barra de Herramientas de Edición de Filas y Columnas */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#0A1322] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
            <Edit3 className="w-3.5 h-3.5 text-[#E67E22] dark:text-amber-400" />
            <span>Haz clic en cualquier celda o encabezado para editar su texto o valor numérico:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-[#131C2E] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              <Plus className="w-3 h-3 text-[#1B8A5A] dark:text-emerald-400" />
              <span>+ Fila</span>
            </button>
            <button
              type="button"
              onClick={handleAddCol}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-[#131C2E] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              <Plus className="w-3 h-3 text-[#1B8A5A] dark:text-emerald-400" />
              <span>+ Columna</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto p-3 sm:p-4">
          {renderTableContent()}
        </div>
      </div>

      {/* Ventana Flotante / Modal a Pantalla Completa para Tabla Bivariada */}
      <FloatingTableModal
        isOpen={isFloatingTableOpen}
        onClose={() => setIsFloatingTableOpen(false)}
        title={`Tabla de Contingencia: ${variableX} × ${variableY}`}
        subtitle={`Gran Total = ${grandTotal} observaciones registradas`}
        badge="Bivariada"
        onExportExcel={() => exportContingencyTableToExcel(result)}
      >
        <div className="p-3">
          {renderTableContent()}
        </div>
      </FloatingTableModal>

      {/* 3. GRÁFICO AUTOMÁTICO BIVARIADO */}
      <ContingencyBarVisualizer
        title={`Distribución Bivariada: ${variableX} según ${variableY}`}
        variableX={variableX}
        variableY={variableY}
        xLabel={variableX}
        yLabel="Cantidad de Casos Registrados"
        categoriesX={rowCategories}
        categoriesY={colCategories}
        chartData={chartData}
      />
    </div>
  );
};
