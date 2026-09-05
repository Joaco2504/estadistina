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
  Printer,
  RotateCw,
  Timer,
  Calculator
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
import { MathFormula } from '@/components/ui/math-formula';

interface FlipCardProps {
  cardKey: 'if' | 'ig' | 'ii' | 'dm';
  numberLabel: string;
  title: string;
  badgeText: string;
  value: string;
  unit: string;
  description: string;
  formulaLatex: string;
  substitutionLatex: string;
  formulaExplanation: string;
  themeColor: 'emerald' | 'amber' | 'blue' | 'purple';
  isFlipped: boolean;
  onFlip: () => void;
}

const FlipIndicatorCard: React.FC<FlipCardProps> = ({
  cardKey,
  numberLabel,
  title,
  badgeText,
  value,
  unit,
  description,
  formulaLatex,
  substitutionLatex,
  formulaExplanation,
  themeColor,
  isFlipped,
  onFlip,
}) => {
  const colorStyles = {
    emerald: {
      border: 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-700',
      backBorder: 'border-emerald-500/50',
      badge: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      value: 'text-[#1B8A5A] dark:text-emerald-400',
      accentText: 'text-emerald-600 dark:text-emerald-400',
      backHeader: 'text-emerald-400',
      boxBg: 'bg-[#0D243B] border-emerald-800/40',
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700',
      backBorder: 'border-amber-500/50',
      badge: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      value: 'text-[#E67E22] dark:text-amber-400',
      accentText: 'text-amber-600 dark:text-amber-400',
      backHeader: 'text-amber-400',
      boxBg: 'bg-[#291B0C] border-amber-800/40',
    },
    blue: {
      border: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700',
      backBorder: 'border-blue-500/50',
      badge: 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      value: 'text-blue-600 dark:text-blue-400',
      accentText: 'text-blue-600 dark:text-blue-400',
      backHeader: 'text-blue-400',
      boxBg: 'bg-[#0C1E38] border-blue-800/40',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700',
      backBorder: 'border-purple-500/50',
      badge: 'text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      value: 'text-purple-600 dark:text-purple-400',
      accentText: 'text-purple-600 dark:text-purple-400',
      backHeader: 'text-purple-400',
      boxBg: 'bg-[#231038] border-purple-800/40',
    },
  }[themeColor];

  return (
    <div 
      className="flip-card-container cursor-pointer group select-none min-h-[290px] w-full"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label={`Tarjeta ${title}. ${isFlipped ? 'Dorso con desarrollo. Toca para ver resultado.' : 'Frente con resultado. Toca para ver fórmula y desarrollo 3D.'}`}
    >
      <div className={`flip-card-inner min-h-[290px] rounded-2xl ${isFlipped ? 'is-flipped' : ''}`}>
        
        {/* FRENTE DE LA TARJETA */}
        <div className={`flip-card-front bg-white dark:bg-[#0F172A] p-5 rounded-2xl border ${colorStyles.border} shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                {numberLabel}. {title}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shadow-2xs ${colorStyles.badge}`}>
                {badgeText}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${colorStyles.value}`}>
                {value}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {unit}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug pt-1">
              {description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            <span className={`flex items-center gap-1.5 ${colorStyles.accentText}`}>
              <RotateCw className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
              Toca para ver fórmula y desarrollo
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              3D Dorso
            </span>
          </div>
        </div>

        {/* DORSO DE LA TARJETA */}
        <div className={`flip-card-back bg-[#08121E] dark:bg-[#050D17] text-white p-5 rounded-2xl border ${colorStyles.backBorder} shadow-xl flex flex-col justify-between overflow-y-auto`}>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className={`text-xs font-bold uppercase tracking-wide ${colorStyles.backHeader}`}>
                {title} · Desarrollo Paso a Paso
              </span>
              <span className="text-[9.5px] font-mono text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-full">
                Cátedra SySO
              </span>
            </div>

            {/* Fórmula KaTeX */}
            <div className={`p-2 rounded-xl border ${colorStyles.boxBg}`}>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">
                Fórmula Teórica Oficial:
              </span>
              <MathFormula formula={formulaLatex} />
            </div>

            {/* Reemplazo Numérico Paso a Paso */}
            <div className={`p-2 rounded-xl border ${colorStyles.boxBg}`}>
              <span className={`text-[9.5px] uppercase font-bold block mb-1 ${colorStyles.backHeader}`}>
                Reemplazo Numérico con Datos Reales:
              </span>
              <MathFormula formula={substitutionLatex} />
            </div>

            <p className="text-[10.5px] text-slate-300 leading-snug">
              {formulaExplanation}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className={`flex items-center gap-1.5 ${colorStyles.backHeader}`}>
              <RotateCw className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-180" />
              Toca para volver al resultado
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Frente ↺
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export const SafetyIndicatorsModule: React.FC = () => {
  const defaultPreset = SAFETY_INDICATOR_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [establecimiento, setEstablecimiento] = useState<string>(defaultPreset.establecimiento);
  const [periodo, setPeriodo] = useState<string>(defaultPreset.periodo);
  
  // 9 Parámetros Solicitados
  const [cantidadTrabajadores, setCantidadTrabajadores] = useState<number>(defaultPreset.cantidadTrabajadores);
  const [diasLaborales, setDiasLaborales] = useState<number>(defaultPreset.diasLaborales);
  const [horasJornada, setHorasJornada] = useState<number>(defaultPreset.horasJornada);
  const [horasExtras, setHorasExtras] = useState<number>(defaultPreset.horasExtras);
  const [horasNoTrabajadas, setHorasNoTrabajadas] = useState<number>(defaultPreset.horasNoTrabajadas);
  const [accidentesConBaja, setAccidentesConBaja] = useState<number>(defaultPreset.accidentesConBaja);
  const [accidentesSinBaja, setAccidentesSinBaja] = useState<number>(defaultPreset.accidentesSinBaja);
  const [diasPerdidos, setDiasPerdidos] = useState<number>(defaultPreset.diasPerdidos);
  const [factorK, setFactorK] = useState<1000 | 1000000>(defaultPreset.factorK);

  // Estado de tarjetas giratorias 3D
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({
    if: false,
    ig: false,
    ii: false,
    dm: false,
  });

  const [showDidacticSteps, setShowDidacticSteps] = useState<boolean>(true);

  // Cálculo en tiempo real
  const result = useMemo(() => {
    const input: SafetyIndicatorsInput = {
      establecimiento,
      periodo,
      cantidadTrabajadores,
      diasLaborales,
      horasJornada,
      horasExtras,
      horasNoTrabajadas,
      accidentesConBaja,
      accidentesSinBaja,
      diasPerdidos,
      factorK,
    };
    return calculateSafetyIndicators(input);
  }, [
    establecimiento, 
    periodo, 
    cantidadTrabajadores, 
    diasLaborales, 
    horasJornada, 
    horasExtras, 
    horasNoTrabajadas, 
    accidentesConBaja, 
    accidentesSinBaja, 
    diasPerdidos, 
    factorK
  ]);

  // Manejo de carga de preset
  const handleLoadPreset = (preset: SafetyIndicatorPreset) => {
    setSelectedPresetId(preset.id);
    setEstablecimiento(preset.establecimiento);
    setPeriodo(preset.periodo);
    setCantidadTrabajadores(preset.cantidadTrabajadores);
    setDiasLaborales(preset.diasLaborales);
    setHorasJornada(preset.horasJornada);
    setHorasExtras(preset.horasExtras);
    setHorasNoTrabajadas(preset.horasNoTrabajadas);
    setAccidentesConBaja(preset.accidentesConBaja);
    setAccidentesSinBaja(preset.accidentesSinBaja);
    setDiasPerdidos(preset.diasPerdidos);
    setFactorK(preset.factorK);
  };

  const toggleFlip = (cardKey: 'if' | 'ig' | 'ii' | 'dm') => {
    setFlippedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
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
              className="group flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
              title="Descargar informe oficial en Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">Exportar a Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="group flex items-center gap-1.5 text-xs bg-[#15385B] dark:bg-[#1E293B] hover:bg-[#1C4874] dark:hover:bg-[#334155] text-slate-200 px-3.5 py-1.5 rounded-xl border border-[#1C4874] dark:border-slate-700 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
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
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-white dark:bg-[#0A1322] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {preset.chipLabel}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Factor base activo: <strong>{result.baseTextHHT}</strong></span>
          </div>
        </div>

        {/* Formulario de Entrada de Insumos */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0F172A] space-y-5">
          
          {/* Fila 1: Organización, Período y Selector de Factor k */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  placeholder="Ej: 1° Trimestre Anual"
                />
                <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Factor k de Estandarización
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#0A1322] rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFactorK(1000000)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    factorK === 1000000
                      ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  k = 1.000.000
                </button>
                <button
                  type="button"
                  onClick={() => setFactorK(1000)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    factorK === 1000
                      ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  k = 1.000
                </button>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                {factorK === 1000000 ? 'Norma General / OIT (por cada millón HHT)' : 'Criterio PyME / Talleres (por cada mil HHT)'}
              </span>
            </div>
          </div>

          {/* Bloque: Insumos de Jornada y Cálculo Automático de Horas Persona Trabajo */}
          <div className="p-4 bg-slate-50/80 dark:bg-[#131C2E] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Determinación de Exposición y Horas Persona Trabajo (HPT)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#1B8A5A] dark:text-emerald-400 font-bold">
                HPT = Horas Teóricas + Hs Extras - Hs No Trabajadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  1. Cantidad de Trabajadores
                </label>
                <input
                  type="number"
                  min={1}
                  value={cantidadTrabajadores}
                  onChange={(e) => setCantidadTrabajadores(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Nómina expuesta</span>
              </div>

              <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  2. Días Laborales
                </label>
                <input
                  type="number"
                  min={1}
                  value={diasLaborales}
                  onChange={(e) => setDiasLaborales(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Días hábiles del período</span>
              </div>

              <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  3. Horas por Jornada
                </label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={horasJornada}
                  onChange={(e) => setHorasJornada(Math.max(0.5, Number(e.target.value)))}
                  className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Hs normales por día</span>
              </div>

              <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  4. Horas Extras (+)
                </label>
                <input
                  type="number"
                  min={0}
                  value={horasExtras}
                  onChange={(e) => setHorasExtras(Math.max(0, Number(e.target.value)))}
                  className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Suman horas efectivas</span>
              </div>

              <div className="bg-white dark:bg-[#0A1322] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  5. Horas No Trabajadas (-)
                </label>
                <input
                  type="number"
                  min={0}
                  value={horasNoTrabajadas}
                  onChange={(e) => setHorasNoTrabajadas(Math.max(0, Number(e.target.value)))}
                  className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Ausentismo / Licencias</span>
              </div>
            </div>

            {/* Cuadros de Resultados de Horas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-[#0A1322] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                    Horas Teóricas (Trabajadores × Días × Horas/Jornada)
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {result.cantidadTrabajadores} trab. × {result.diasLaborales} días × {result.horasJornada} hs
                  </span>
                </div>
                <span className="text-base sm:text-lg font-mono font-extrabold text-[#0F2942] dark:text-slate-100">
                  {result.horasTeoricas.toLocaleString('es-AR')} hs
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                    Horas Persona Trabajo Efectivas (HPT)
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                    {result.horasTeoricas.toLocaleString('es-AR')} + {result.horasExtras.toLocaleString('es-AR')} - {result.horasNoTrabajadas.toLocaleString('es-AR')} hs
                  </span>
                </div>
                <span className="text-base sm:text-lg font-mono font-black text-[#1B8A5A] dark:text-emerald-400">
                  {result.horasPersonaTrabajo.toLocaleString('es-AR')} hs
                </span>
              </div>
            </div>
          </div>

          {/* Bloque: Registro de Accidentabilidad y Días Perdidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                6. Cantidad de Accidentes con Baja
              </label>
              <input
                type="number"
                min={0}
                value={accidentesConBaja}
                onChange={(e) => setAccidentesConBaja(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Casos con baja médica (N)</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                7. Cantidad de Accidentes sin Baja
              </label>
              <input
                type="number"
                min={0}
                value={accidentesSinBaja}
                onChange={(e) => setAccidentesSinBaja(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Primeros auxilios / Total eventos: {result.totalAccidentes}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                8. Días Perdidos / Baja (J)
              </label>
              <input
                type="number"
                min={0}
                value={diasPerdidos}
                onChange={(e) => setDiasPerdidos(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Jornadas laborales no trabajadas</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4 TARJETAS GIRATORIAS 3D (FLIP CARDS) DE LOS INDICADORES OFICIALES */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-[#1B8A5A] dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Indicadores de Siniestralidad (Tarjetas Giratorias 3D)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic hidden sm:inline">
            Haz clic o toca cualquier tarjeta para ver su fórmula y desarrollo paso a paso
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjeta 1: IF */}
          <FlipIndicatorCard
            cardKey="if"
            numberLabel="1"
            title="Índice de Frecuencia (IF)"
            badgeText={result.baseTextHHT}
            value={result.indiceFrecuencia.toFixed(2)}
            unit={`acc / ${result.kUnit}`}
            description={`Accidentes con baja médica ${result.baseTextHHT}.`}
            formulaLatex={result.cardsFormulas.if.formulaLatex}
            substitutionLatex={result.cardsFormulas.if.substitutionLatex}
            formulaExplanation={result.cardsFormulas.if.description}
            themeColor="emerald"
            isFlipped={!!flippedCards['if']}
            onFlip={() => toggleFlip('if')}
          />

          {/* Tarjeta 2: IG */}
          <FlipIndicatorCard
            cardKey="ig"
            numberLabel="2"
            title="Índice de Gravedad (IG)"
            badgeText={result.baseTextHHT}
            value={result.indiceGravedad.toFixed(2)}
            unit={`días / ${result.kUnit}`}
            description={`Jornadas de trabajo no trabajadas ${result.baseTextHHT}.`}
            formulaLatex={result.cardsFormulas.ig.formulaLatex}
            substitutionLatex={result.cardsFormulas.ig.substitutionLatex}
            formulaExplanation={result.cardsFormulas.ig.description}
            themeColor="amber"
            isFlipped={!!flippedCards['ig']}
            onFlip={() => toggleFlip('ig')}
          />

          {/* Tarjeta 3: II */}
          <FlipIndicatorCard
            cardKey="ii"
            numberLabel="3"
            title="Índice de Incidencia (II)"
            badgeText="por cada mil trab."
            value={result.indiceIncidencia.toFixed(2)}
            unit="acc / 10³ trab."
            description="Accidentes con baja por cada 1.000 trabajadores en nómina."
            formulaLatex={result.cardsFormulas.ii.formulaLatex}
            substitutionLatex={result.cardsFormulas.ii.substitutionLatex}
            formulaExplanation={result.cardsFormulas.ii.description}
            themeColor="blue"
            isFlipped={!!flippedCards['ii']}
            onFlip={() => toggleFlip('ii')}
          />

          {/* Tarjeta 4: DM */}
          <FlipIndicatorCard
            cardKey="dm"
            numberLabel="4"
            title="Duración Media (DM)"
            badgeText="Severidad media"
            value={result.duracionMedia.toFixed(2)}
            unit="días / acc."
            description="Promedio de jornadas perdidas por cada accidente con baja ocurrido."
            formulaLatex={result.cardsFormulas.dm.formulaLatex}
            substitutionLatex={result.cardsFormulas.dm.substitutionLatex}
            formulaExplanation={result.cardsFormulas.dm.description}
            themeColor="purple"
            isFlipped={!!flippedCards['dm']}
            onFlip={() => toggleFlip('dm')}
          />
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
