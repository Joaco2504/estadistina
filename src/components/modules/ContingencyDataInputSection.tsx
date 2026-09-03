// src/components/modules/ContingencyDataInputSection.tsx
'use client';

import React from 'react';
import { 
  Split, 
  Dices, 
  Sparkles, 
  Layers, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SAFETY_PRESETS } from '@/lib/statistics';

interface ContingencyDataInputSectionProps {
  variableX: string;
  setVariableX: (name: string) => void;
  variableY: string;
  setVariableY: (name: string) => void;
  rawInput: string;
  setRawInput: (input: string) => void;
  sampleSize: number;
  setSampleSize: (n: number) => void;
  selectedPresetId: string;
  onLoadPreset: (presetId: string) => void;
  onGenerateRandomSample: (targetN?: number) => void;
  onUpdateTable: (customInput?: string, customX?: string, customY?: string) => void;
  detectedRows: string[];
  detectedCols: string[];
  totalParsedN: number;
  errorMessage?: string | null;
}

export const ContingencyDataInputSection: React.FC<ContingencyDataInputSectionProps> = ({
  variableX,
  setVariableX,
  variableY,
  setVariableY,
  rawInput,
  setRawInput,
  sampleSize,
  setSampleSize,
  selectedPresetId,
  onLoadPreset,
  onGenerateRandomSample,
  onUpdateTable,
  detectedRows,
  detectedCols,
  totalParsedN,
  errorMessage,
}) => {
  const contingencyPresets = SAFETY_PRESETS.filter(p => p.recommendedType === 'contingency');

  const handleRawChange = (value: string) => {
    setRawInput(value);
  };

  const handleVarXChange = (value: string) => {
    setVariableX(value);
  };

  const handleVarYChange = (value: string) => {
    setVariableY(value);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-all">
      {/* Encabezado Superior con Identidad Institucional */}
      <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1B8A5A] dark:bg-emerald-600 text-white flex-shrink-0">
            <Split className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-wide text-white flex items-center gap-2">
              <span>Tabla de Contingencia: Análisis Bivariado (X × Y)</span>
            </h2>
            <span className="text-[11px] text-slate-300 dark:text-slate-400 hidden sm:inline">
              Ingresa observaciones bivariadas, pares con conteo o datos pegados desde Excel
            </span>
          </div>
        </div>

        {/* Acciones de Muestra Rápida y Simulación Aleatoria */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-[#15385B] dark:bg-[#1E293B] px-2.5 py-1 rounded-lg border border-[#1C4874] dark:border-slate-700">
            <label className="text-xs text-slate-200 dark:text-slate-300 font-medium">Muestra (n):</label>
            <input
              type="number"
              min={3}
              max={500}
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-12 sm:w-14 bg-[#0A1D30] dark:bg-[#0F172A] text-white font-mono text-xs font-bold text-center px-1 py-0.5 rounded border border-slate-600 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B8A5A]"
            />
          </div>

          <button
            type="button"
            onClick={() => onGenerateRandomSample()}
            className="group flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            title="Generar nueva muestra aleatoria de pares con el tamaño seleccionado"
          >
            <Dices className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
            <span>Generar Muestra</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Casos Prácticos de SySO (Presets Bivariados) & Chips de n */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">
              Casos Prácticos:
            </span>
            {contingencyPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onLoadPreset(preset.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-2xs border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <Layers className="w-3 h-3 text-[#E67E22] dark:text-amber-400 transition-transform group-hover:scale-110" />
                <span>{preset.chipLabel || preset.title}</span>
              </button>
            ))}
          </div>

          {/* Chips de Selección Rápida de Tamaño de Muestra */}
          <div className="flex items-center gap-1 text-xs self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Fijar n:</span>
            {[20, 35, 45, 60, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onGenerateRandomSample(size)}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-all cursor-pointer ${
                  sampleSize === size
                    ? 'bg-[#1B8A5A] dark:bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Nombres de las Dos Variables en Estudio (Factores X e Y) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Variable 1 (Filas - Factor X)
            </label>
            <input
              type="text"
              value={variableX}
              onChange={(e) => handleVarXChange(e.target.value)}
              placeholder="Ej: Sector de Planta, Turno de Trabajo, Tarea Crítica"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-semibold text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Variable 2 (Columnas - Factor Y)
            </label>
            <input
              type="text"
              value={variableY}
              onChange={(e) => handleVarYChange(e.target.value)}
              placeholder="Ej: Grado de Uso de EPP, Severidad del Incidente, Estado de ATS"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-semibold text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Área de Entrada de Datos Bivariados en Bruto */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <span>Datos Bivariados en Bruto (Pares X, Y)</span>
              <span className="text-[10px] font-normal text-slate-400 lowercase hidden sm:inline">
                (un par por línea o separados por punto y coma)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#1B8A5A] dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                n actual = {totalParsedN} observaciones
              </span>
            </div>
          </div>

          <textarea
            rows={4}
            value={rawInput}
            onChange={(e) => handleRawChange(e.target.value)}
            placeholder={`Ingrese pares de observaciones. Ejemplos:\n• Observación por línea: Mecanizado, Cumple Siempre\n• Con conteo: Soldadura, Uso Parcial: 12\n• Separados por guion o barra: Pintura - No Cumple\n• Copiado y pegado directo desde 2 columnas de Excel`}
            className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none leading-relaxed resize-y shadow-2xs"
          />

          {/* Categorías detectadas en vivo */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 dark:text-slate-400">Filas (X):</span>
              {detectedRows.length > 0 ? (
                detectedRows.map((row, idx) => (
                  <span
                    key={`det-row-${idx}`}
                    className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-medium border border-blue-200/80 dark:border-blue-800/60"
                  >
                    {row}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">Sin categorías de fila detectadas</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 dark:text-slate-400">Columnas (Y):</span>
              {detectedCols.length > 0 ? (
                detectedCols.map((col, idx) => (
                  <span
                    key={`det-col-${idx}`}
                    className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium border border-emerald-200/80 dark:border-emerald-800/60"
                  >
                    {col}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">Sin categorías de columna detectadas</span>
              )}
            </div>
          </div>

          {/* Ayuda de Formato Didáctico */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Formatos admitidos para el ingreso bivariado:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10.5px]">
              <div className="bg-white dark:bg-[#0A1322] p-1.5 rounded border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-600 dark:text-emerald-400 block font-sans">1. Pares Individuales:</strong>
                <code>Sector, Cumplimiento</code><br />
                <span className="text-slate-400 font-sans">Uno por línea o con ';'</span>
              </div>
              <div className="bg-white dark:bg-[#0A1322] p-1.5 rounded border border-slate-200 dark:border-slate-700">
                <strong className="text-blue-600 dark:text-blue-400 block font-sans">2. Pares con Conteo:</strong>
                <code>Sector, Cumplimiento: 12</code><br />
                <span className="text-slate-400 font-sans">O '12x Sector, Cumplimiento'</span>
              </div>
              <div className="bg-white dark:bg-[#0A1322] p-1.5 rounded border border-slate-200 dark:border-slate-700">
                <strong className="text-amber-600 dark:text-amber-400 block font-sans">3. Pegado desde Excel:</strong>
                <code>Columna A [Tab] Columna B</code><br />
                <span className="text-slate-400 font-sans">Copiar 2 columnas directamente</span>
              </div>
            </div>
          </div>

          {/* Mensaje de Error si aplica */}
          {errorMessage && (
            <div className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Botón Principal de Actualización con Animación Shimmer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => onUpdateTable()}
            className="w-full sm:w-auto stat-update-btn group cursor-pointer"
            title="Recalcular frecuencias conjuntas, marginales y actualizar la tabla y gráfico"
          >
            <Sparkles className="w-4 h-4 text-amber-300 update-sparkle-icon" />
            <span className="tracking-wide">Actualizar Tabla y Gráfico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
