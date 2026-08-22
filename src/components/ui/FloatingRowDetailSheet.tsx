// src/components/ui/FloatingRowDetailSheet.tsx
'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Hash, 
  Percent, 
  TrendingUp, 
  Layers, 
  Info,
  Calculator
} from 'lucide-react';
import { SimpleFrequencyRow, GroupedFrequencyRow } from '@/types/statistics';
import { formatPercentage } from '@/lib/statistics';

interface FloatingRowDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  row: SimpleFrequencyRow | GroupedFrequencyRow | null;
  totalRows: number;
  sampleSize: number;
  variableName: string;
  unit: string;
  isGrouped?: boolean;
  isQualitative?: boolean;
  onNavigateRow: (direction: 'prev' | 'next') => void;
}

export const FloatingRowDetailSheet: React.FC<FloatingRowDetailSheetProps> = ({
  isOpen,
  onClose,
  row,
  totalRows,
  sampleSize,
  variableName,
  unit,
  isGrouped = false,
  isQualitative = false,
  onNavigateRow,
}) => {
  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !row) return null;

  const groupedRow = isGrouped ? (row as GroupedFrequencyRow) : null;
  const simpleRow = !isGrouped ? (row as SimpleFrequencyRow) : null;

  const faPercentOfTotal = ((row.frecuenciaAbsoluta / sampleSize) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop clickeable */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Ventana Flotante / Bottom Sheet */}
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#0B1726] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrastre / Handle táctil */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Encabezado del Modal Flotante */}
        <div className="bg-[#0F2942] dark:bg-[#071322] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#10B981] text-white flex items-center justify-center flex-shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate">
                Ficha Estadística: Fila {row.index} de {totalRows}
              </h3>
              <p className="text-[10px] text-slate-300 dark:text-slate-400 truncate">
                {variableName} {unit ? `(${unit})` : ''} • n = {sampleSize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Controles de Navegación entre Filas */}
            <div className="flex items-center bg-[#0A1D30] dark:bg-[#0C1B2E] rounded-lg border border-[#1C4874] dark:border-slate-700 p-0.5">
              <button
                type="button"
                disabled={row.index <= 1}
                onClick={() => onNavigateRow('prev')}
                className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Fila Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 text-emerald-300">
                {row.index}/{totalRows}
              </span>
              <button
                type="button"
                disabled={row.index >= totalRows}
                onClick={() => onNavigateRow('next')}
                className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Fila Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Cerrar Ficha"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo con Scroll para los Cálculos Desglosados */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* 1. VALOR DE VARIABLE O INTERVALO */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F1D30] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {isGrouped 
                ? 'Intervalo de Clase [Límites Li - Ls)' 
                : (isQualitative ? 'Categoría / Modalidad (xᵢ)' : 'Valor de Variable (xᵢ)')}
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base sm:text-lg font-black text-[#0F2942] dark:text-white font-mono">
                {isGrouped ? groupedRow?.intervalLabel : simpleRow?.variableValue} {unit && !isGrouped ? unit : ''}
              </span>
              {isGrouped && groupedRow && (
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                  Marca Mc = {groupedRow.marcaDeClase} {unit}
                </span>
              )}
            </div>
          </div>

          {/* 2. FRECUENCIA ABSOLUTA (fa) Y RELATIVA (fr) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* fa */}
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-1">
              <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                <Hash className="w-3.5 h-3.5" />
                <span>Frec. Absoluta (fᵢ)</span>
              </div>
              <p className="text-lg font-mono font-black text-emerald-950 dark:text-emerald-200">
                {row.frecuenciaAbsoluta} <span className="text-[10px] font-sans font-normal text-emerald-700 dark:text-emerald-400">casos</span>
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Representa el {faPercentOfTotal}% de la muestra
              </p>
            </div>

            {/* fr */}
            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-1">
              <div className="flex items-center gap-1 text-blue-800 dark:text-blue-300 font-bold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Frec. Relativa (fᵣ)</span>
              </div>
              <p className="text-lg font-mono font-black text-blue-950 dark:text-blue-200">
                {row.frecuenciaRelativa.toFixed(2)}
              </p>
              <p className="text-[10px] text-blue-700 dark:text-blue-400 font-mono">
                fᵣ = {row.frecuenciaAbsoluta} / {sampleSize}
              </p>
            </div>
          </div>

          {/* 3. PORCENTAJE (p %) */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                Porcentaje Muestral (p %)
              </span>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                p = fᵣ ({row.frecuenciaRelativa.toFixed(2)}) × 100
              </p>
            </div>
            <span className="text-lg font-mono font-black text-amber-900 dark:text-amber-200">
              {formatPercentage(row.porcentaje)}
            </span>
          </div>

          {/* 4. FRECUENCIAS ACUMULADAS (Fa, Fr, P %) */}
          <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-2.5">
            <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Valores Acumulados hasta Fila {row.index}</span>
            </span>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded-lg bg-white dark:bg-[#071322] border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-sans">Fa (Casos)</span>
                <span className="text-sm font-black text-purple-950 dark:text-purple-200">{row.frecuenciaAbsolutaAcumulada}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#071322] border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-sans">Fr (Relativa)</span>
                <span className="text-sm font-black text-purple-950 dark:text-purple-200">{row.frecuenciaRelativaAcumulada.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#071322] border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-sans">P % (Acum.)</span>
                <span className="text-sm font-black text-purple-950 dark:text-purple-200">{formatPercentage(row.porcentajeAcumulado)}</span>
              </div>
            </div>

            {row.stepExplanations?.faAcum && (
              <p className="text-[10.5px] text-purple-800 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/40 p-2 rounded-lg leading-relaxed">
                💡 <strong>Operación:</strong> {row.stepExplanations.faAcum}
              </p>
            )}
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="p-3 bg-slate-50 dark:bg-[#080D1A] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Toca afuera o pulsa ✕ para cerrar</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#0F2942] dark:bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-[#15385B] dark:hover:bg-emerald-700"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
