// src/components/modules/ContingencyTableModule.tsx
'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ContingencyTableResult, ContingencyViewMode } from '@/types/statistics';
import {
  ContingencyDataEntry,
  generateContingencyTable,
  parseContingencyDataString,
  formatContingencyPairsToString,
  generateRandomContingencyPairs,
  formatPercentage,
  SAFETY_PRESETS
} from '@/lib/statistics';
import { ContingencyDataInputSection } from './ContingencyDataInputSection';
import { MathFormula } from '@/components/ui/math-formula';
import { exportContingencyTableToExcel } from '@/lib/excelExport';
import { ExcelExportButton } from '@/components/ui/ExcelExportButton';
import {
  Table,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Maximize2,
  Percent,
  Hash,
  ArrowRight,
  ArrowDown
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

/** Fila del gráfico bivariado: categoría X más una clave numérica por categoría Y. */
interface ContingencyChartDatum {
  categoryX: string;
  [colCategory: string]: string | number;
}

/** Convierte la matriz canónica en pares (solo celdas con conteo > 0). */
function buildPairsFromMatrix(
  rowCategories: string[],
  colCategories: string[],
  matrix: number[][]
): ContingencyDataEntry[] {
  const pairs: ContingencyDataEntry[] = [];
  for (let r = 0; r < rowCategories.length; r++) {
    for (let c = 0; c < colCategories.length; c++) {
      const count = matrix[r]?.[c] ?? 0;
      if (count > 0) {
        pairs.push({ x: rowCategories[r], y: colCategories[c], count });
      }
    }
  }
  return pairs;
}

/**
 * Calcula el resultado de la tabla de contingencia desde la matriz canónica.
 * Usa generateContingencyTable; ante la ausencia de pares o categorías vacías
 * (filas/columnas con todas las celdas en cero) devuelve un resultado alineado
 * a la matriz visible para que Excel y el desglose didáctico coincidan.
 */
function computeContingencyResult(
  variableX: string,
  variableY: string,
  rowCategories: string[],
  colCategories: string[],
  matrix: number[][]
): ContingencyTableResult {
  const rowMarginalTotals = matrix.map((row) => row.reduce((acc, curr) => acc + curr, 0));
  const colMarginalTotals = colCategories.map((_, cIdx) => matrix.reduce((acc, row) => acc + (row[cIdx] || 0), 0));
  const grandTotal = rowMarginalTotals.reduce((acc, val) => acc + val, 0);

  const pairs = buildPairsFromMatrix(rowCategories, colCategories, matrix);
  const generated = pairs.length > 0 ? generateContingencyTable(variableX, variableY, pairs) : null;

  if (
    generated &&
    generated.rowCategories.length === rowCategories.length &&
    generated.colCategories.length === colCategories.length
  ) {
    return generated;
  }

  return {
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
        calculation: matrix.map((r) => r[cIdx]).join(' + '),
        total: colMarginalTotals[cIdx],
      })),
      step5GrandTotal: {
        calculation: `${rowMarginalTotals.join(' + ')} = ${colMarginalTotals.join(' + ')}`,
        total: grandTotal,
      },
    },
  };
}

export const ContingencyTableModule: React.FC = () => {
  const defaultPreset = SAFETY_PRESETS.find(p => p.id === 'contingencia-epp')!;

  const [variableX, setVariableX] = useState<string>(defaultPreset.defaultXName || 'Sector de Planta');
  const [variableY, setVariableY] = useState<string>(defaultPreset.defaultYName || 'Grado de Uso de EPP');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('contingencia-epp');
  const [isFloatingTableOpen, setIsFloatingTableOpen] = useState(false);
  const [customN, setCustomN] = useState<number>(45);
  const [showDidacticSteps, setShowDidacticSteps] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ContingencyViewMode>('normal');

  // Categorías y matriz: fuente única de verdad (canónica).
  const [rowCategories, setRowCategories] = useState<string[]>(['Mecanizado', 'Soldadura', 'Pintura', 'Depósito']);
  const [colCategories, setColCategories] = useState<string[]>(['Cumple Siempre', 'Uso Parcial', 'No Cumple']);
  const [matrix, setMatrix] = useState<number[][]>([
    [12, 3, 1],
    [9, 4, 2],
    [7, 2, 0],
    [3, 1, 1]
  ]);

  // Textarea: vista derivada de la matriz (se regenera en cada edición).
  const [rawInput, setRawInput] = useState<string>(() =>
    formatContingencyPairsToString(defaultPreset.bivariateDataGenerator?.() ?? [])
  );

  // Borradores por celda para permitir vaciar el input numérico sin que salte a 0.
  const [cellDrafts, setCellDrafts] = useState<Record<string, string>>({});

  // Totales derivados de la matriz canónica.
  const rowMarginalTotals = useMemo(
    () => matrix.map((row) => row.reduce((acc, curr) => acc + curr, 0)),
    [matrix]
  );
  const colMarginalTotals = useMemo(
    () => colCategories.map((_, cIdx) => matrix.reduce((acc, row) => acc + (row[cIdx] || 0), 0)),
    [matrix, colCategories]
  );
  const grandTotal = useMemo(
    () => rowMarginalTotals.reduce((acc, val) => acc + val, 0),
    [rowMarginalTotals]
  );

  const result = useMemo<ContingencyTableResult>(
    () => computeContingencyResult(variableX, variableY, rowCategories, colCategories, matrix),
    [variableX, variableY, rowCategories, colCategories, matrix]
  );

  const chartData = useMemo<ContingencyChartDatum[]>(() => {
    return rowCategories.map((rowCat, rIdx) => {
      const entry: ContingencyChartDatum = { categoryX: rowCat };
      colCategories.forEach((colCat, cIdx) => {
        entry[colCat] = Number(matrix[rIdx]?.[cIdx] ?? 0);
      });
      return entry;
    });
  }, [rowCategories, colCategories, matrix]);

  // Regenera el textarea a partir de un estado de matriz dado (formato "X, Y: n").
  const syncRawInputFromMatrix = (rows: string[], cols: string[], m: number[][]) => {
    setRawInput(formatContingencyPairsToString(buildPairsFromMatrix(rows, cols, m)));
  };

  // Cargar preset predefinido de Higiene y Seguridad
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    const varX = preset.defaultXName || 'Variable X';
    const varY = preset.defaultYName || 'Variable Y';
    setVariableX(varX);
    setVariableY(varY);

    if (preset.bivariateDataGenerator) {
      const pairs = preset.bivariateDataGenerator();
      try {
        const tableResult = generateContingencyTable(varX, varY, pairs);
        setRowCategories(tableResult.rowCategories);
        setColCategories(tableResult.colCategories);
        setMatrix(tableResult.matrix);
        syncRawInputFromMatrix(tableResult.rowCategories, tableResult.colCategories, tableResult.matrix);
        setCustomN(tableResult.grandTotal);
        setErrorMessage(null);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error al cargar el caso bivariado.');
      }
    }
  };

  // Generar muestra aleatoria de pares con tamaño exacto N
  const handleRandomize = (overrideN?: number) => {
    const targetN = overrideN !== undefined ? overrideN : customN;
    if (overrideN !== undefined) {
      setCustomN(overrideN);
    }

    const currentRows = rowCategories.length > 0 ? rowCategories : ['Mecanizado', 'Soldadura', 'Pintura', 'Depósito'];
    const currentCols = colCategories.length > 0 ? colCategories : ['Cumple Siempre', 'Uso Parcial', 'No Cumple'];

    const randomPairs = generateRandomContingencyPairs(currentRows, currentCols, targetN);
    try {
      const tableResult = generateContingencyTable(variableX, variableY, randomPairs);
      setRowCategories(tableResult.rowCategories);
      setColCategories(tableResult.colCategories);
      setMatrix(tableResult.matrix);
      syncRawInputFromMatrix(tableResult.rowCategories, tableResult.colCategories, tableResult.matrix);
      setCustomN(tableResult.grandTotal);
      setErrorMessage(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al generar la muestra aleatoria.');
    }
  };

  // Actualizar la matriz canónica a partir del borrador del textarea.
  const handleUpdateFromRaw = () => {
    const entries = parseContingencyDataString(rawInput);
    if (entries.length === 0) {
      setErrorMessage('Por favor ingrese al menos un par de observaciones bivariadas válidas (ej: Mecanizado, Cumple Siempre).');
      return;
    }

    try {
      const tableResult = generateContingencyTable(variableX, variableY, entries);
      setRowCategories(tableResult.rowCategories);
      setColCategories(tableResult.colCategories);
      setMatrix(tableResult.matrix);
      syncRawInputFromMatrix(tableResult.rowCategories, tableResult.colCategories, tableResult.matrix);
      setCustomN(tableResult.grandTotal);
      setErrorMessage(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar los datos bivariados en bruto.');
    }
  };

  // Manejo de edición de celdas (permite vaciar el campo sin saltar a 0 instantáneamente)
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const key = `${rIdx}-${cIdx}`;
    if (val === '') {
      setCellDrafts((prev) => ({ ...prev, [key]: '' }));
      return;
    }
    const num = Number(val);
    if (!Number.isFinite(num)) {
      setCellDrafts((prev) => ({ ...prev, [key]: val }));
      return;
    }
    const clamped = Math.max(0, Math.floor(num));
    setCellDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    const nextMatrix = matrix.map((row, r) =>
      row.map((cell, c) => (r === rIdx && c === cIdx ? clamped : cell))
    );
    setMatrix(nextMatrix);
    syncRawInputFromMatrix(rowCategories, colCategories, nextMatrix);
  };

  const handleCellBlur = (rIdx: number, cIdx: number) => {
    const key = `${rIdx}-${cIdx}`;
    const draft = cellDrafts[key];
    setCellDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    // Vacío o inválido -> se aplica 0 al perder el foco (mismo criterio de clamp anterior).
    if (draft === '' || (draft !== undefined && !Number.isFinite(Number(draft)))) {
      const nextMatrix = matrix.map((row, r) =>
        row.map((cell, c) => (r === rIdx && c === cIdx ? 0 : cell))
      );
      setMatrix(nextMatrix);
      syncRawInputFromMatrix(rowCategories, colCategories, nextMatrix);
    }
  };

  // Manejo de edición de nombres de fila
  const handleRowCategoryChange = (rIdx: number, newName: string) => {
    const updated = [...rowCategories];
    updated[rIdx] = newName;
    setRowCategories(updated);
    syncRawInputFromMatrix(updated, colCategories, matrix);
  };

  // Manejo de edición de nombres de columna
  const handleColCategoryChange = (cIdx: number, newName: string) => {
    const updated = [...colCategories];
    updated[cIdx] = newName;
    setColCategories(updated);
    syncRawInputFromMatrix(rowCategories, updated, matrix);
  };

  // Agregar Fila
  const handleAddRow = () => {
    const newRows = [...rowCategories, `Categoría Fila ${rowCategories.length + 1}`];
    const newMatrix = [...matrix, new Array(colCategories.length).fill(1)];
    setRowCategories(newRows);
    setMatrix(newMatrix);
    syncRawInputFromMatrix(newRows, colCategories, newMatrix);
  };

  // Eliminar Fila
  const handleDeleteRow = (rIdx: number) => {
    if (rowCategories.length <= 2) return;
    const newRows = rowCategories.filter((_, i) => i !== rIdx);
    const newMatrix = matrix.filter((_, i) => i !== rIdx);
    setRowCategories(newRows);
    setMatrix(newMatrix);
    syncRawInputFromMatrix(newRows, colCategories, newMatrix);
  };

  // Agregar Columna
  const handleAddCol = () => {
    const newCols = [...colCategories, `Categoría Col ${colCategories.length + 1}`];
    const newMatrix = matrix.map((row) => [...row, 1]);
    setColCategories(newCols);
    setMatrix(newMatrix);
    syncRawInputFromMatrix(rowCategories, newCols, newMatrix);
  };

  // Eliminar Columna
  const handleDeleteCol = (cIdx: number) => {
    if (colCategories.length <= 2) return;
    const newCols = colCategories.filter((_, i) => i !== cIdx);
    const newMatrix = matrix.map((row) => row.filter((_, i) => i !== cIdx));
    setColCategories(newCols);
    setMatrix(newMatrix);
    syncRawInputFromMatrix(rowCategories, newCols, newMatrix);
  };

  const renderViewModeButtons = () => (
    <div className="flex flex-nowrap sm:flex-wrap items-center gap-1 p-1 bg-slate-200/80 dark:bg-[#131C2E] rounded-xl border border-slate-300/70 dark:border-slate-700/70 select-none overflow-x-auto no-scrollbar">
      <button
        type="button"
        onClick={() => setViewMode('normal')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
          viewMode === 'normal'
            ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
        }`}
        title="Visualización normal (Frecuencias absolutas fa como están cargadas)"
      >
        <Hash className="w-3.5 h-3.5" />
        <span>Normal</span>
      </button>

      <button
        type="button"
        onClick={() => setViewMode('percent_total')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
          viewMode === 'percent_total'
            ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
        }`}
        title="Visualizar en % del Total General (respecto al tamaño de muestra n)"
      >
        <Percent className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">% del Total General</span>
        <span className="sm:hidden">% Total</span>
      </button>

      <button
        type="button"
        onClick={() => setViewMode('percent_row')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
          viewMode === 'percent_row'
            ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
        }`}
        title="Visualizar en % del Total de la Fila (Distribución condicional por filas, cada fila totaliza 100%)"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">% del Total de la Fila</span>
        <span className="sm:hidden">% Fila</span>
      </button>

      <button
        type="button"
        onClick={() => setViewMode('percent_col')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
          viewMode === 'percent_col'
            ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
        }`}
        title="Visualizar en % del Total de la Columna (Distribución condicional por columnas, cada columna totaliza 100%)"
      >
        <ArrowDown className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">% del Total de la Columna</span>
        <span className="sm:hidden">% Columna</span>
      </button>
    </div>
  );

  // Renderizador unificado para tabla bivariada con soporte para frecuencias normales y porcentajes
  const renderTableContent = () => (
    <table className="stat-table w-full min-w-[580px]">
      <thead>
        <tr>
          <th className="bg-[#0A1D30] dark:bg-[#080D1A] text-left text-xs font-bold text-white min-w-[150px] sm:min-w-[180px] p-2.5 sm:p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider truncate" title={variableX}>
                {variableX}
              </span>
              <span className="text-slate-400 text-[11px] font-medium truncate" title={variableY}>
                ▼ por {variableY}
              </span>
            </div>
          </th>
          {colCategories.map((colCat, cIdx) => (
            <th key={`col-header-${cIdx}`} className="bg-[#0F2942] dark:bg-[#0B132B] min-w-[120px] sm:min-w-[140px] px-2 py-2 sm:px-3 sm:py-2.5">
              <div className="flex items-center justify-between gap-1.5 w-full">
                {viewMode === 'normal' ? (
                  <>
                    <input
                      type="text"
                      value={colCat}
                      onChange={(e) => handleColCategoryChange(cIdx, e.target.value)}
                      className="bg-transparent text-white font-bold text-xs text-center focus:outline-none focus:bg-white/10 hover:bg-white/5 px-1 py-1 rounded w-full min-w-0 border border-transparent focus:border-emerald-400/50 transition-colors"
                      title={`Editar columna: ${colCat}`}
                      aria-label={`Nombre de la columna: ${colCat}`}
                      placeholder={`Col ${cIdx + 1}`}
                    />
                    {colCategories.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCol(cIdx)}
                        className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                        title="Eliminar columna"
                        aria-label={`Eliminar columna ${colCat}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-white font-bold text-xs text-center px-1 py-1 w-full block truncate" title={colCat}>
                    {colCat}
                  </span>
                )}
              </div>
            </th>
          ))}
          <th className="bg-[#183C5F] dark:bg-[#1E293B] text-amber-300 font-bold text-xs text-center min-w-[105px] sm:min-w-[120px] px-2 py-2 sm:px-3 sm:py-2.5">
            {viewMode === 'normal' && 'Total por fila'}
            {viewMode === 'percent_total' && '% Total General'}
            {viewMode === 'percent_row' && 'Total Fila (100%)'}
            {viewMode === 'percent_col' && '% Marginal Fila'}
          </th>
        </tr>
      </thead>
      <tbody>
        {rowCategories.map((rowCat, rIdx) => {
          const rowTot = rowMarginalTotals[rIdx];

          return (
            <tr key={`row-body-${rIdx}`}>
              <td className="text-left font-bold text-[#0F2942] dark:text-slate-100 bg-slate-50 dark:bg-[#0A1322] min-w-[150px] sm:min-w-[180px] px-2.5 py-1.5 sm:px-3 sm:py-2">
                <div className="flex items-center justify-between gap-1.5 w-full">
                  {viewMode === 'normal' ? (
                    <>
                      <input
                        type="text"
                        value={rowCat}
                        onChange={(e) => handleRowCategoryChange(rIdx, e.target.value)}
                        className="bg-transparent font-bold text-xs text-[#0F2942] dark:text-slate-100 focus:outline-none focus:bg-white/60 dark:focus:bg-[#131C2E] hover:bg-black/5 dark:hover:bg-white/5 px-1 py-1 rounded w-full min-w-0 border-b border-transparent focus:border-emerald-500/50 transition-colors"
                        title={`Editar fila: ${rowCat}`}
                        aria-label={`Nombre de la fila: ${rowCat}`}
                        placeholder={`Fila ${rIdx + 1}`}
                      />
                      {rowCategories.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rIdx)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                          title="Eliminar fila"
                          aria-label={`Eliminar fila ${rowCat}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="font-bold text-xs text-[#0F2942] dark:text-slate-100 px-1 py-1 block truncate" title={rowCat}>
                      {rowCat}
                    </span>
                  )}
                </div>
              </td>

              {/* Celdas centrales según el modo de visualización */}
              {colCategories.map((colCat, cIdx) => {
                const cellVal = Number(matrix[rIdx]?.[cIdx] ?? 0);
                const colTot = colMarginalTotals[cIdx];

                if (viewMode === 'normal') {
                  return (
                    <td key={`cell-${rIdx}-${cIdx}`} className="p-1 min-w-[70px]">
                      <input
                        type="number"
                        min={0}
                        value={cellDrafts[`${rIdx}-${cIdx}`] ?? String(matrix[rIdx][cIdx])}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        onBlur={() => handleCellBlur(rIdx, cIdx)}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Celda ${rowCat} × ${colCat}`}
                        className="w-full text-center font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#0A1322] hover:bg-white dark:hover:bg-[#131C2E] focus:bg-white dark:focus:bg-[#131C2E] focus:ring-2 focus:ring-[#10B981] rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 text-xs transition-all"
                      />
                    </td>
                  );
                }

                if (viewMode === 'percent_total') {
                  const pct = grandTotal > 0 ? (cellVal / grandTotal) * 100 : 0;
                  return (
                    <td key={`cell-${rIdx}-${cIdx}`} className="p-1.5 text-center bg-slate-50/60 dark:bg-[#0A1322]/60 min-w-[80px]">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300">
                          {formatPercentage(pct)}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          fa = {cellVal}
                        </span>
                      </div>
                    </td>
                  );
                }

                if (viewMode === 'percent_row') {
                  const pct = rowTot > 0 ? (cellVal / rowTot) * 100 : 0;
                  return (
                    <td key={`cell-${rIdx}-${cIdx}`} className="p-1.5 text-center bg-blue-50/40 dark:bg-blue-950/30 min-w-[80px]">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-300">
                          {formatPercentage(pct)}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          {cellVal} / {rowTot}
                        </span>
                      </div>
                    </td>
                  );
                }

                // percent_col
                const pct = colTot > 0 ? (cellVal / colTot) * 100 : 0;
                return (
                  <td key={`cell-${rIdx}-${cIdx}`} className="p-1.5 text-center bg-amber-50/40 dark:bg-amber-950/30 min-w-[80px]">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-300">
                        {formatPercentage(pct)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {cellVal} / {colTot}
                      </span>
                    </div>
                  </td>
                );
              })}

              {/* Total por fila */}
              <td className="font-mono font-extrabold text-[#10B981] dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs py-1.5 text-center min-w-[95px] sm:min-w-[110px]">
                {viewMode === 'normal' && rowTot}
                {viewMode === 'percent_total' && (
                  <div className="flex flex-col items-center justify-center">
                    <span>{formatPercentage(grandTotal > 0 ? (rowTot / grandTotal) * 100 : 0)}</span>
                    <span className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70">fa = {rowTot}</span>
                  </div>
                )}
                {viewMode === 'percent_row' && (
                  <div className="flex flex-col items-center justify-center">
                    <span>100%</span>
                    <span className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70">fa = {rowTot}</span>
                  </div>
                )}
                {viewMode === 'percent_col' && (
                  <div className="flex flex-col items-center justify-center">
                    <span>{formatPercentage(grandTotal > 0 ? (rowTot / grandTotal) * 100 : 0)}</span>
                    <span className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70">fa = {rowTot}</span>
                  </div>
                )}
              </td>
            </tr>
          );
        })}

        {/* Totales Marginales por Columna y Gran Total */}
        <tr className="total-row">
          <td className="text-left uppercase font-extrabold text-[#0F2942] dark:text-slate-100 text-xs min-w-[150px] sm:min-w-[180px] px-2.5 py-2">
            {viewMode === 'normal' && 'Total por columna'}
            {viewMode === 'percent_total' && '% Total General'}
            {viewMode === 'percent_col' && 'Total Columna (100%)'}
            {viewMode === 'percent_row' && '% Marginal Columna'}
          </td>
          {colCategories.map((_, cIdx) => {
            const colTot = colMarginalTotals[cIdx];
            return (
              <td key={`col-total-${cIdx}`} className="font-mono font-extrabold text-[#0F2942] dark:text-slate-100 text-xs py-2 text-center min-w-[70px]">
                {viewMode === 'normal' && colTot}
                {viewMode === 'percent_total' && (
                  <div className="flex flex-col items-center justify-center">
                    <span>{formatPercentage(grandTotal > 0 ? (colTot / grandTotal) * 100 : 0)}</span>
                    <span className="text-[11px] text-slate-400">fa = {colTot}</span>
                  </div>
                )}
                {viewMode === 'percent_col' && (
                  <div className="flex flex-col items-center justify-center">
                    <span>100%</span>
                    <span className="text-[11px] text-slate-400">fa = {colTot}</span>
                  </div>
                )}
                {viewMode === 'percent_row' && (
                  <div className="flex flex-col items-center justify-center">
                    <span>{formatPercentage(grandTotal > 0 ? (colTot / grandTotal) * 100 : 0)}</span>
                    <span className="text-[11px] text-slate-400">fa = {colTot}</span>
                  </div>
                )}
              </td>
            );
          })}
          <td className="font-mono font-black text-white bg-[#0F2942] dark:bg-emerald-700 text-xs py-2 text-center min-w-[95px] sm:min-w-[110px]">
            {viewMode === 'normal' ? (
              grandTotal
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span>100%</span>
                <span className="text-[11px] text-emerald-200">n = {grandTotal}</span>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      {/* Sección de Entrada de Datos Bivariados en Bruto */}
      <ContingencyDataInputSection
        variableX={variableX}
        setVariableX={setVariableX}
        variableY={variableY}
        setVariableY={setVariableY}
        rawInput={rawInput}
        setRawInput={setRawInput}
        sampleSize={customN}
        setSampleSize={setCustomN}
        selectedPresetId={selectedPresetId}
        onLoadPreset={handleLoadPreset}
        onGenerateRandomSample={handleRandomize}
        onUpdateTable={handleUpdateFromRaw}
        rowCategories={rowCategories}
        colCategories={colCategories}
        grandTotal={grandTotal}
        errorMessage={errorMessage}
      />

      {/* 1. DESGLOSE DIDÁCTICO PASO A PASO */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDidacticSteps(!showDidacticSteps)}
          aria-expanded={showDidacticSteps}
          aria-controls="didactic-breakdown-panel"
          className="w-full px-4 sm:px-5 py-3 bg-slate-50 dark:bg-[#0A1322] flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800 text-left"
        >
          <div className="flex items-center gap-2 text-[#0F2942] dark:text-slate-200">
            <Info className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Desglose Didáctico de Frecuencias Simples, Conjuntas y Marginales
            </span>
          </div>
          {showDidacticSteps ? (
            <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {showDidacticSteps && (
          <div id="didactic-breakdown-panel" className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-[#131C2E]">
            <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                1. Frecuencias Simples
              </span>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <p><strong>{variableX}:</strong> {result.didacticSteps.step1SimpleFrequencies.varXCounts.map(i => `${i.category}(${i.count})`).join(', ')}</p>
                <p><strong>{variableY}:</strong> {result.didacticSteps.step1SimpleFrequencies.varYCounts.map(i => `${i.category}(${i.count})`).join(', ')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                2. Frecuencias Dobles (fa_ij)
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-1">Conteo conjunto en cada celda interior:</p>
              <MathFormula formula="fa_{ij} = \text{Conteo de } (X_i \cap Y_j)" />
            </div>

            <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
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
              aria-label="Abrir tabla en Ventana Flotante / Pantalla Completa"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Flotante</span>
            </button>

            {/* BOTÓN EXPORTAR A EXCEL */}
            <ExcelExportButton
              onExport={() => exportContingencyTableToExcel(result, viewMode)}
              label="Excel"
            />

            <span className="text-xs font-mono bg-[#15385B] dark:bg-[#1E293B] px-2.5 py-1 rounded text-white border border-[#1C4874] dark:border-slate-700">
              <span className="sm:hidden">n = {grandTotal}</span>
              <span className="hidden sm:inline">Gran Total: {grandTotal}</span>
            </span>
          </div>
        </div>

        {/* Barra de Modos de Visualización de la Tabla */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0A1322] border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
                <span>Vista de la Tabla:</span>
              </span>
              {renderViewModeButtons()}
            </div>

            <div className="flex items-center gap-2">
              {viewMode === 'normal' ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 hidden xl:inline mr-1 text-xs">
                    Haz clic en celdas para editar:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-[#131C2E] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer text-xs"
                  >
                    <Plus className="w-3 h-3 text-[#1B8A5A] dark:text-emerald-400" />
                    <span>+ Fila</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCol}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-[#131C2E] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer text-xs"
                  >
                    <Plus className="w-3 h-3 text-[#1B8A5A] dark:text-emerald-400" />
                    <span>+ Columna</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                  {viewMode === 'percent_total' && 'Porcentajes relativos respecto al Gran Total (n).'}
                  {viewMode === 'percent_row' && 'Distribución condicional por filas: cada fila totaliza 100%.'}
                  {viewMode === 'percent_col' && 'Distribución condicional por columnas: cada columna totaliza 100%.'}
                </span>
              )}
            </div>
          </div>

          {/* Pista de desplazamiento horizontal en el selector de modos de vista (móvil) */}
          <div className="sm:hidden flex items-center justify-between mt-2 px-0.5 text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              Desliza horizontalmente para ver todos los modos de vista
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 text-xs">↔</span>
          </div>
        </div>

        {/* Indicador de Desplazamiento Horizontal en Móviles */}
        <div className="sm:hidden flex items-center justify-between px-3.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            Desliza horizontalmente la tabla para ver todas las columnas
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 text-xs">↔</span>
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
        onExportExcel={() => exportContingencyTableToExcel(result, viewMode)}
      >
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#0A1322] border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cambiar vista:</span>
            {renderViewModeButtons()}
          </div>
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
        categoriesY={colCategories}
        chartData={chartData}
      />
    </div>
  );
};
