// src/components/modules/SafetyIndicatorsModule.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Calendar, 
  Printer
} from 'lucide-react';
import { 
  SafetyIndicatorsInput, 
  SafetyIndicatorPreset 
} from '@/types/statistics';
import { 
  calculateSafetyIndicators, 
  SAFETY_INDICATOR_PRESETS,
  formatPercentage
} from '@/lib/statistics';
import { exportSafetyIndicatorsToExcel } from '@/lib/excelExport';

export const SafetyIndicatorsModule: React.FC = () => {
  const defaultPreset = SAFETY_INDICATOR_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [establecimiento, setEstablecimiento] = useState<string>(defaultPreset.establecimiento);
  const [periodo, setPeriodo] = useState<string>(defaultPreset.periodo);
  const [accidentesConBaja, setAccidentesConBaja] = useState<number>(defaultPreset.accidentesConBaja);
  const [diasPerdidos, setDiasPerdidos] = useState<number>(defaultPreset.diasPerdidos);
  const [horasHombreTrabajadas, setHorasHombreTrabajadas] = useState<number>(defaultPreset.horasHombreTrabajadas);
  const [trabajadoresExpuestos, setTrabajadoresExpuestos] = useState<number>(defaultPreset.trabajadoresExpuestos);

  const [showDidacticSteps, setShowDidacticSteps] = useState<boolean>(true);

  // Cálculo en tiempo real
  const result = useMemo(() => {
    const input: SafetyIndicatorsInput = {
      establecimiento,
      periodo,
      accidentesConBaja,
      diasPerdidos,
      horasHombreTrabajadas,
      trabajadoresExpuestos
    };
    return calculateSafetyIndicators(input);
  }, [establecimiento, periodo, accidentesConBaja, diasPerdidos, horasHombreTrabajadas, trabajadoresExpuestos]);

  // Manejo de carga de preset
  const handleLoadPreset = (preset: SafetyIndicatorPreset) => {
    setSelectedPresetId(preset.id);
    setEstablecimiento(preset.establecimiento);
    setPeriodo(preset.periodo);
    setAccidentesConBaja(preset.accidentesConBaja);
    setDiasPerdidos(preset.diasPerdidos);
    setHorasHombreTrabajadas(preset.horasHombreTrabajadas);
    setTrabajadoresExpuestos(preset.trabajadoresExpuestos);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Panel Superior y Presets de Siniestralidad */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1B8A5A] dark:bg-emerald-600">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-[#15385B] dark:bg-[#1E293B] px-2 py-0.5 rounded">
                  Unidad I · Tema 4
                </span>
                <span className="text-xs text-slate-300">Normativa SRT / IRAM 3800 / OIT</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide text-white">
                Indicadores Oficiales de Siniestralidad Laboral
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportSafetyIndicatorsToExcel(result)}
              className="flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Descargar informe oficial en Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Exportar a Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs bg-[#15385B] dark:bg-[#1E293B] hover:bg-[#1C4874] dark:hover:bg-[#334155] text-slate-200 px-3 py-1.5 rounded-lg border border-[#1C4874] dark:border-slate-700 cursor-pointer"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Casos Prácticos de Cátedra */}
        <div className="p-4 bg-slate-50 dark:bg-[#131C2E] border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Casos de Estudio:</span>
            {SAFETY_INDICATOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#0A1322] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {preset.chipLabel}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Frecuencia base: <strong>1.000.000 HHT</strong></span>
          </div>
        </div>

        {/* Formulario de Entrada de Insumos */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0F172A] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Establecimiento / Razón Social
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={establecimiento}
                  onChange={(e) => setEstablecimiento(e.target.value)}
                  className="w-full text-xs px-3 py-2 pl-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-semibold text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                  placeholder="Nombre de la empresa"
                />
                <Building2 className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Período Evaluado
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full text-xs px-3 py-2 pl-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-semibold text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                  placeholder="Ej: 1° Trimestre 2026"
                />
                <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                1. Accidentes con Baja (N)
              </label>
              <input
                type="number"
                min={0}
                value={accidentesConBaja}
                onChange={(e) => setAccidentesConBaja(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Casos que causaron baja médica</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                2. Días Perdidos / Baja (J)
              </label>
              <input
                type="number"
                min={0}
                value={diasPerdidos}
                onChange={(e) => setDiasPerdidos(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Jornadas no trabajadas acumuladas</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                3. Horas Trabajadas (HHT)
              </label>
              <input
                type="number"
                min={1}
                value={horasHombreTrabajadas}
                onChange={(e) => setHorasHombreTrabajadas(Math.max(1, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Horas-persona efectivas de exposición</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                4. Trabajadores Expuestos
              </label>
              <input
                type="number"
                min={1}
                value={trabajadoresExpuestos}
                onChange={(e) => setTrabajadoresExpuestos(Math.max(1, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Nómina promedio en el período</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 TARJETAS DE RESULTADOS DE INDICADORES OFICIALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Índice de Frecuencia (IF) */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
              1. Índice de Frecuencia (IF)
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Base 10⁶ HHT
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#1B8A5A] dark:text-emerald-400">
              {result.indiceFrecuencia.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">acc / 10⁶ hs</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            Accidentes con baja médica por cada millón de horas hombre trabajadas.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            IF = ({result.accidentesConBaja} × 1.000.000) / {result.horasHombreTrabajadas}
          </div>
        </div>

        {/* 2. Índice de Gravedad (IG) */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
              2. Índice de Gravedad (IG)
            </span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Base 10⁶ HHT
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#E67E22] dark:text-amber-400">
              {result.indiceGravedad.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">días / 10⁶ hs</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            Jornadas de trabajo no trabajadas por cada millón de horas trabajadas.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            IG = ({result.diasPerdidos} × 1.000.000) / {result.horasHombreTrabajadas}
          </div>
        </div>

        {/* 3. Índice de Incidencia (II) */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
              3. Índice de Incidencia (II)
            </span>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Base 1.000 trab.
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {result.indiceIncidencia.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">acc / 10³ trab.</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            Accidentes con baja por cada mil trabajadores expuestos en nómina.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            II = ({result.accidentesConBaja} × 1.000) / {result.trabajadoresExpuestos}
          </div>
        </div>

        {/* 4. Duración Media (DM) */}
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
              4. Duración Media (DM)
            </span>
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Severidad
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
              {result.duracionMedia.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">días / accidente</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            Promedio de jornadas perdidas por cada accidente con baja ocurrido.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            DM = {result.diasPerdidos} / {result.accidentesConBaja}
          </div>
        </div>
      </div>

      {/* 2. DESGLOSE DIDÁCTICO PASO A PASO */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div 
          onClick={() => setShowDidacticSteps(!showDidacticSteps)}
          className="px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-[#0A1322] flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 text-[#0F2942] dark:text-slate-200">
            <Info className="w-4 h-4 text-[#E67E22] dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Desglose Didáctico: Proporción, Razón, Tasa y Relación de Coherencia
            </span>
          </div>
          <button type="button" className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
            {showDidacticSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showDidacticSteps && (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-[#131C2E]">
            {/* Paso 1: Proporción */}
            <div className="bg-white dark:bg-[#0A1322] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                A) Proporción (Parte - Todo)
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Compara trabajadores accidentados sobre el total de la nómina:
              </p>
              <div className="font-mono text-xs text-[#0F2942] dark:text-slate-100 bg-slate-50 dark:bg-[#131C2E] p-2 rounded border border-slate-200 dark:border-slate-800">
                Prop. = {result.accidentesConBaja} / {result.trabajadoresExpuestos} = {result.proporcionAccidentados} ({formatPercentage(result.porcentajeAccidentados)})
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                El {formatPercentage(result.porcentajeAccidentados)} de los trabajadores sufrió alguna baja médica.
              </p>
            </div>

            {/* Paso 2: Razón */}
            <div className="bg-white dark:bg-[#0A1322] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                B) Razón (Parte - Parte)
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Compara días perdidos por cada accidente ocurrido:
              </p>
              <div className="font-mono text-xs text-[#0F2942] dark:text-slate-100 bg-slate-50 dark:bg-[#131C2E] p-2 rounded border border-slate-200 dark:border-slate-800">
                Razón = {result.diasPerdidos} días / {result.accidentesConBaja} acc. = {result.duracionMedia.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Equivale a la Duración Media (DM = {result.duracionMedia.toFixed(2)} días por evento).
              </p>
            </div>

            {/* Paso 3: Coherencia Matemática */}
            <div className="bg-white dark:bg-[#0A1322] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                C) Verificación de Coherencia
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Relación matemática entre Gravedad, Frecuencia y Duración Media:
              </p>
              <div className="font-mono text-xs text-[#1B8A5A] dark:text-emerald-400 bg-slate-50 dark:bg-[#131C2E] p-2 rounded border border-slate-200 dark:border-slate-800">
                IG = IF × DM
                <br />
                {result.indiceFrecuencia.toFixed(2)} × {result.duracionMedia.toFixed(2)} = {(result.indiceFrecuencia * result.duracionMedia).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Verifica la exactitud matemática de las métricas de severidad.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. DIAGNÓSTICO E INFORME TÉCNICO PREVENTIVO */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3 text-white flex items-center justify-between border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              Diagnóstico Preventivo Oficial e Informe Técnico de Cátedra
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-300">
            {result.establecimiento}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {/* Diagnóstico 1: Severidad e Impacto */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-1">
            <div className="flex items-center gap-1.5 text-[#E67E22] dark:text-amber-400 font-bold uppercase text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>1. Diagnóstico de Severidad e Impacto en la Fuerza Laboral</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              {result.diagnostico.severidad}
            </p>
          </div>

          {/* Diagnóstico 2: Evaluación del Tiempo Perdido */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold uppercase text-xs">
              <Clock className="w-4 h-4" />
              <span>2. Evaluación del Tiempo Perdido y Severidad Física</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              {result.diagnostico.tiempoPerdido}
            </p>
          </div>

          {/* Diagnóstico 3: Recomendación Prioritaria */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-1">
            <div className="flex items-center gap-1.5 text-[#1B8A5A] dark:text-emerald-400 font-bold uppercase text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>3. Conclusión y Plan de Acción Preventivo</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              {result.diagnostico.recomendacion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
