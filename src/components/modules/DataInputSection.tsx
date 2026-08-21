// src/components/modules/DataInputSection.tsx
'use client';

import React, { useState } from 'react';
import { 
  Dices, 
  Sparkles, 
  Sliders, 
  Activity, 
  Calendar, 
  Volume2, 
  Sun, 
  ShieldCheck, 
  Tag, 
  Hash,
  Binary
} from 'lucide-react';
import { SAFETY_PRESETS, parseAnyDataString, parseGroupedDataString } from '@/lib/statistics';

interface DataInputSectionProps {
  variableName: string;
  setVariableName: (name: string) => void;
  unit: string;
  setUnit: (unit: string) => void;
  rawInput: string;
  setRawInput: (data: string) => void;
  rango: string;
  setRango: (val: string) => void;
  kValue: string;
  setKValue: (val: string) => void;
  amplitud: string;
  setAmplitud: (val: string) => void;
  mode: 'grouped' | 'simple';
  variableType?: 'quantitative' | 'qualitative';
  setVariableType?: (type: 'quantitative' | 'qualitative') => void;
  groupedVariableType?: 'continuous' | 'discrete';
  setGroupedVariableType?: (type: 'continuous' | 'discrete') => void;
  onCalculateWithValues: (
    customRaw?: string, 
    customVar?: string, 
    customUnit?: string, 
    customType?: 'quantitative' | 'qualitative',
    customGroupedType?: 'continuous' | 'discrete'
  ) => void;
}

export const DataInputSection: React.FC<DataInputSectionProps> = ({
  variableName,
  setVariableName,
  unit,
  setUnit,
  rawInput,
  setRawInput,
  rango,
  setRango,
  kValue,
  setKValue,
  amplitud,
  setAmplitud,
  mode,
  variableType = 'quantitative',
  setVariableType,
  groupedVariableType = 'continuous',
  setGroupedVariableType,
  onCalculateWithValues,
}) => {
  const [showManualParams, setShowManualParams] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Conteo de elementos según el modo
  const countParsed = mode === 'grouped'
    ? parseGroupedDataString(rawInput, groupedVariableType === 'continuous').length
    : parseAnyDataString(rawInput).length;

  const [customSampleSize, setCustomSampleSize] = useState<number>(countParsed > 0 ? countParsed : 25);
  const n = countParsed;

  // Cargar preset predefinido de Higiene y Seguridad respetando o seteando tamaño
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const presetType = preset.variableType || 'quantitative';
    const presetGroupedType = preset.groupedVariableType || 'continuous';

    setSelectedPresetId(presetId);
    setVariableName(preset.variableName);
    setUnit(preset.unit);

    if (mode === 'simple' && setVariableType) {
      setVariableType(presetType);
    }
    if (mode === 'grouped' && setGroupedVariableType) {
      setGroupedVariableType(presetGroupedType);
    }
    
    // Generar muestra según el tamaño configurado por el usuario
    const generated = generateValuesForContext(
      preset.variableName, 
      customSampleSize, 
      presetType, 
      presetGroupedType
    );
    const dataStr = generated.join('; ');
    setRawInput(dataStr);

    // Limpiar parámetros manuales
    setRango('');
    setKValue('');
    setAmplitud('');

    onCalculateWithValues(dataStr, preset.variableName, preset.unit, presetType, presetGroupedType);
  };

  // Generador contextual con tamaño exacto n ingresado por el usuario
  const generateValuesForContext = (
    varName: string, 
    targetN: number, 
    type: 'quantitative' | 'qualitative',
    gType: 'continuous' | 'discrete' = 'continuous'
  ): (number | string)[] => {
    const count = Math.max(3, Math.min(500, targetN || 25));

    if (type === 'qualitative') {
      const lower = varName.toLowerCase();
      let categories = ['Corte en manos', 'Contusión', 'Quemadura térmica', 'Esguince', 'Fractura'];
      
      if (lower.includes('ocupac') || lower.includes('puesto') || lower.includes('empleo')) {
        categories = ['Empleado/a', 'Emprendedora', 'Estudiante', 'Operario de Planta', 'Técnico de Seguridad'];
      } else if (lower.includes('epp') || lower.includes('protec') || lower.includes('condic')) {
        categories = ['Excelente', 'Bueno', 'Regular', 'Deteriorado'];
      } else if (lower.includes('riesgo') || lower.includes('ergo') || lower.includes('rula')) {
        categories = ['Riesgo Bajo', 'Riesgo Moderado', 'Riesgo Alto', 'Riesgo Crítico'];
      } else if (lower.includes('sector') || lower.includes('planta')) {
        categories = ['Mecanizado', 'Soldadura', 'Pintura', 'Montaje', 'Depósito'];
      }

      const qualitativeItems: string[] = [];
      for (let i = 0; i < count; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        qualitativeItems.push(cat);
      }
      return qualitativeItems;
    }

    // Cuantitativo: evaluar si es discreto o continuo
    const isDiscrete = mode === 'simple' || gType === 'discrete';
    let min = 70;
    let max = 100;
    let decimals = isDiscrete ? 0 : 1;

    const lower = varName.toLowerCase();
    if (lower.includes('edad')) {
      min = 20;
      max = 60;
      decimals = 0;
    } else if (lower.includes('días') || lower.includes('licencia') || lower.includes('jornada') || lower.includes('accidente') || lower.includes('incidente') || lower.includes('simulacro')) {
      min = 0;
      max = 25;
      decimals = 0;
    } else if (lower.includes('auditor') || lower.includes('5s') || lower.includes('calificac')) {
      min = 4;
      max = 10;
      decimals = 0;
    } else if (lower.includes('lux') || lower.includes('iluminac')) {
      min = 180;
      max = 600;
      decimals = 0;
    } else if (lower.includes('co') || lower.includes('monóxido')) {
      min = 8;
      max = 35;
      decimals = 1;
    } else if (lower.includes('tgbh') || lower.includes('térmic') || lower.includes('calor')) {
      min = 26;
      max = 36;
      decimals = 1;
    } else if (lower.includes('polvo') || lower.includes('respirab')) {
      min = 0.5;
      max = 5.2;
      decimals = 1;
    } else if (lower.includes('carga') || lower.includes('peso') || lower.includes('levantam')) {
      min = 10;
      max = 26;
      decimals = 1;
    } else {
      min = isDiscrete ? 1 : 75;
      max = isDiscrete ? 50 : 96;
      decimals = isDiscrete ? 0 : 1;
    }

    const randomNumbers: number[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random() * (max - min) + min;
      const rounded = decimals === 0 ? Math.round(rand) : Number(rand.toFixed(decimals));
      randomNumbers.push(rounded);
    }
    return randomNumbers;
  };

  // Generar muestra aleatoria de tamaño exacto configurado por el alumno
  const handleGenerateCustomN = (overrideN?: number) => {
    const targetN = overrideN !== undefined ? overrideN : customSampleSize;
    if (overrideN !== undefined) {
      setCustomSampleSize(overrideN);
    }

    const generated = generateValuesForContext(
      variableName, 
      targetN, 
      variableType, 
      groupedVariableType
    );
    const dataStr = generated.join('; ');
    setRawInput(dataStr);
    
    // Limpiar parámetros manuales
    setRango('');
    setKValue('');
    setAmplitud('');

    onCalculateWithValues(dataStr, variableName, unit, variableType, groupedVariableType);
  };

  // Cambiar tipo de variable en Simples (cuantitativa / cualitativa)
  const handleSimpleTypeChange = (newType: 'quantitative' | 'qualitative') => {
    if (setVariableType) {
      setVariableType(newType);
    }
    if (newType === 'qualitative') {
      const newVar = 'Ocupaciones declaradas';
      const newUnit = 'Trabajadores';
      setVariableName(newVar);
      setUnit(newUnit);
      const generated = generateValuesForContext(newVar, customSampleSize, 'qualitative');
      const dataStr = generated.join('; ');
      setRawInput(dataStr);
      onCalculateWithValues(dataStr, newVar, newUnit, 'qualitative', groupedVariableType);
    } else {
      const newVar = 'Jornadas de Trabajo Perdidas';
      const newUnit = 'Días corridos';
      setVariableName(newVar);
      setUnit(newUnit);
      const generated = generateValuesForContext(newVar, customSampleSize, 'quantitative');
      const dataStr = generated.join('; ');
      setRawInput(dataStr);
      onCalculateWithValues(dataStr, newVar, newUnit, 'quantitative', groupedVariableType);
    }
  };

  // Cambiar tipo de variable en Agrupadas (continua / discreta)
  const handleGroupedTypeChange = (newGroupedType: 'continuous' | 'discrete') => {
    if (setGroupedVariableType) {
      setGroupedVariableType(newGroupedType);
    }
    if (newGroupedType === 'discrete') {
      const newVar = 'Edades de Trabajadores en Obras';
      const newUnit = 'Años';
      setVariableName(newVar);
      setUnit(newUnit);
      const generated = generateValuesForContext(newVar, customSampleSize, 'quantitative', 'discrete');
      const dataStr = generated.join('; ');
      setRawInput(dataStr);
      onCalculateWithValues(dataStr, newVar, newUnit, variableType, 'discrete');
    } else {
      const newVar = 'Niveles de Ruido en Taller Metalúrgico';
      const newUnit = 'dBA';
      setVariableName(newVar);
      setUnit(newUnit);
      const generated = generateValuesForContext(newVar, customSampleSize, 'quantitative', 'continuous');
      const dataStr = generated.join('; ');
      setRawInput(dataStr);
      onCalculateWithValues(dataStr, newVar, newUnit, variableType, 'continuous');
    }
  };

  // Manejo de cambio reactivo del nombre de variable
  const handleVariableNameChange = (val: string) => {
    setVariableName(val);
    onCalculateWithValues(undefined, val, unit, variableType, groupedVariableType);
  };

  // Manejo de cambio reactivo de la unidad/individuo
  const handleUnitChange = (val: string) => {
    setUnit(val);
    onCalculateWithValues(undefined, variableName, val, variableType, groupedVariableType);
  };

  // Manejo de cambio reactivo del input en bruto
  const handleRawInputChange = (val: string) => {
    setRawInput(val);
    onCalculateWithValues(val, variableName, unit, variableType, groupedVariableType);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-all">
      {/* Encabezado Minimalista y Compacto */}
      <div className="bg-[#0F2942] dark:bg-[#080D1A] px-4 sm:px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#1C4874] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1B8A5A] dark:bg-emerald-600 text-white flex-shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-wide text-white">
              {mode === 'grouped' 
                ? (groupedVariableType === 'discrete'
                    ? 'Frecuencias Agrupadas: Variable Cuantitativa Discreta'
                    : 'Frecuencias Agrupadas: Variable Cuantitativa Continua')
                : (variableType === 'qualitative'
                    ? 'Frecuencias Simples: Variable Cualitativa'
                    : 'Frecuencias Simples: Variable Cuantitativa Discreta')}
            </h2>
            <span className="text-[11px] text-slate-300 dark:text-slate-400 hidden sm:inline">
              Personaliza el tipo de variable, el individuo, la muestra o ingresa tus propios datos
            </span>
          </div>
        </div>

        {/* Acciones de Muestra Rápida */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-[#15385B] dark:bg-[#1E293B] px-2.5 py-1 rounded-lg border border-[#1C4874] dark:border-slate-700">
            <label className="text-xs text-slate-200 dark:text-slate-300 font-medium">Muestra (n):</label>
            <input
              type="number"
              min={3}
              max={500}
              value={customSampleSize}
              onChange={(e) => setCustomSampleSize(Number(e.target.value))}
              className="w-12 sm:w-14 bg-[#0A1D30] dark:bg-[#0F172A] text-white font-mono text-xs font-bold text-center px-1 py-0.5 rounded border border-slate-600 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B8A5A]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGenerateCustomN()}
            className="group flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
            title="Generar nueva muestra aleatoria del tamaño seleccionado"
          >
            <Dices className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
            <span>Generar Muestra</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Selector de Naturaleza de Variable en Frecuencias Simples (Animación Radio Buttons: hoshikawamaki/terrible-eagle-23) */}
        {mode === 'simple' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-xs font-bold text-[#0F2942] dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400" />
              Tipo de Variable en Estudio:
            </span>
            
            <div className="flex flex-wrap items-center gap-3 select-none">
              {/* Radio 1: Cuantitativa Discreta (Números) */}
              <label className="flex items-center justify-center cursor-pointer radio group px-2 py-1 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/60">
                <input
                  type="radio"
                  name="simpleVariableType"
                  value="quantitative"
                  checked={variableType === 'quantitative'}
                  onChange={() => handleSimpleTypeChange('quantitative')}
                  className="hidden peer"
                />
                <span className="relative flex items-center gap-1.5 text-xs font-bold transition-all duration-300 text-slate-500 dark:text-slate-400 peer-checked:text-[#0F2942] dark:peer-checked:text-emerald-300
                  after:opacity-0 peer-checked:after:opacity-100 peer-checked:after:transition-all peer-checked:after:duration-300
                  peer-checked:after:content-[''] peer-checked:after:block peer-checked:after:w-1/2 peer-checked:after:h-[2.5px]
                  peer-checked:after:bg-[#1B8A5A] dark:peer-checked:after:bg-emerald-400 peer-checked:after:rounded-full
                  peer-checked:after:absolute peer-checked:after:right-0 peer-checked:after:-bottom-1.5
                  peer-checked:before:content-[''] peer-checked:before:block peer-checked:before:w-full peer-checked:before:h-[2.5px]
                  peer-checked:before:bg-[#0F2942] dark:peer-checked:before:bg-emerald-500
                  before:opacity-0 peer-checked:before:opacity-100 peer-checked:before:transition-all peer-checked:before:duration-300
                  before:rounded-full before:absolute before:right-0 before:-bottom-0.5">
                  <Hash className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Cuantitativa Discreta (Números)</span>
                </span>
              </label>

              {/* Radio 2: Cualitativa (Categorías / Texto) */}
              <label className="flex items-center justify-center cursor-pointer radio group px-2 py-1 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/60">
                <input
                  type="radio"
                  name="simpleVariableType"
                  value="qualitative"
                  checked={variableType === 'qualitative'}
                  onChange={() => handleSimpleTypeChange('qualitative')}
                  className="hidden peer"
                />
                <span className="relative flex items-center gap-1.5 text-xs font-bold transition-all duration-300 text-slate-500 dark:text-slate-400 peer-checked:text-[#0F2942] dark:peer-checked:text-amber-300
                  after:opacity-0 peer-checked:after:opacity-100 peer-checked:after:transition-all peer-checked:after:duration-300
                  peer-checked:after:content-[''] peer-checked:after:block peer-checked:after:w-1/2 peer-checked:after:h-[2.5px]
                  peer-checked:after:bg-[#E67E22] dark:peer-checked:after:bg-amber-400 peer-checked:after:rounded-full
                  peer-checked:after:absolute peer-checked:after:right-0 peer-checked:after:-bottom-1.5
                  peer-checked:before:content-[''] peer-checked:before:block peer-checked:before:w-full peer-checked:before:h-[2.5px]
                  peer-checked:before:bg-[#0F2942] dark:peer-checked:before:bg-amber-500
                  before:opacity-0 peer-checked:before:opacity-100 peer-checked:before:transition-all peer-checked:before:duration-300
                  before:rounded-full before:absolute before:right-0 before:-bottom-0.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Cualitativa (Categorías / Texto)</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Selector de Tipo de Variable Cuantitativa en Frecuencias Agrupadas (Animación Radio Buttons: hoshikawamaki/terrible-eagle-23) */}
        {mode === 'grouped' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-xs font-bold text-[#0F2942] dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400" />
              Tipo de Variable a Agrupar en Intervalos:
            </span>
            
            <div className="flex flex-wrap items-center gap-3 select-none">
              {/* Radio 1: Cuantitativa Continua (Mediciones / Decimales) */}
              <label className="flex items-center justify-center cursor-pointer radio group px-2 py-1 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/60">
                <input
                  type="radio"
                  name="groupedVariableType"
                  value="continuous"
                  checked={groupedVariableType === 'continuous'}
                  onChange={() => handleGroupedTypeChange('continuous')}
                  className="hidden peer"
                />
                <span className="relative flex items-center gap-1.5 text-xs font-bold transition-all duration-300 text-slate-500 dark:text-slate-400 peer-checked:text-[#0F2942] dark:peer-checked:text-emerald-300
                  after:opacity-0 peer-checked:after:opacity-100 peer-checked:after:transition-all peer-checked:after:duration-300
                  peer-checked:after:content-[''] peer-checked:after:block peer-checked:after:w-1/2 peer-checked:after:h-[2.5px]
                  peer-checked:after:bg-[#1B8A5A] dark:peer-checked:after:bg-emerald-400 peer-checked:after:rounded-full
                  peer-checked:after:absolute peer-checked:after:right-0 peer-checked:after:-bottom-1.5
                  peer-checked:before:content-[''] peer-checked:before:block peer-checked:before:w-full peer-checked:before:h-[2.5px]
                  peer-checked:before:bg-[#0F2942] dark:peer-checked:before:bg-emerald-500
                  before:opacity-0 peer-checked:before:opacity-100 peer-checked:before:transition-all peer-checked:before:duration-300
                  before:rounded-full before:absolute before:right-0 before:-bottom-0.5">
                  <Activity className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Cuantitativa Continua (Mediciones / Decimales)</span>
                </span>
              </label>

              {/* Radio 2: Cuantitativa Discreta (Números Enteros) */}
              <label className="flex items-center justify-center cursor-pointer radio group px-2 py-1 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/60">
                <input
                  type="radio"
                  name="groupedVariableType"
                  value="discrete"
                  checked={groupedVariableType === 'discrete'}
                  onChange={() => handleGroupedTypeChange('discrete')}
                  className="hidden peer"
                />
                <span className="relative flex items-center gap-1.5 text-xs font-bold transition-all duration-300 text-slate-500 dark:text-slate-400 peer-checked:text-[#0F2942] dark:peer-checked:text-emerald-300
                  after:opacity-0 peer-checked:after:opacity-100 peer-checked:after:transition-all peer-checked:after:duration-300
                  peer-checked:after:content-[''] peer-checked:after:block peer-checked:after:w-1/2 peer-checked:after:h-[2.5px]
                  peer-checked:after:bg-[#1B8A5A] dark:peer-checked:after:bg-emerald-400 peer-checked:after:rounded-full
                  peer-checked:after:absolute peer-checked:after:right-0 peer-checked:after:-bottom-1.5
                  peer-checked:before:content-[''] peer-checked:before:block peer-checked:before:w-full peer-checked:before:h-[2.5px]
                  peer-checked:before:bg-[#0F2942] dark:peer-checked:before:bg-emerald-500
                  before:opacity-0 peer-checked:before:opacity-100 peer-checked:before:transition-all peer-checked:before:duration-300
                  before:rounded-full before:absolute before:right-0 before:-bottom-0.5">
                  <Binary className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Cuantitativa Discreta (Números Enteros)</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Casos Prácticos Rápidos de SySO & Chips de Tamaño Muestral */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Casos Prácticos con microinteracciones y efectos hover */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Casos:</span>
            {SAFETY_PRESETS.filter((p) => {
              if (mode === 'grouped') {
                return p.recommendedType === 'grouped' && (p.groupedVariableType === groupedVariableType || (!p.groupedVariableType && groupedVariableType === 'continuous'));
              }
              if (variableType === 'qualitative') return p.variableType === 'qualitative';
              return p.recommendedType === 'simple' && p.variableType !== 'qualitative';
            }).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-2xs border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {preset.id.includes('ruido') && <Volume2 className="w-3 h-3 text-[#E67E22] dark:text-amber-400 transition-transform group-hover:scale-110" />}
                {preset.id.includes('edad') && <Activity className="w-3 h-3 text-[#1B8A5A] dark:text-emerald-400 transition-transform group-hover:scale-110" />}
                {preset.id.includes('dias') && <Calendar className="w-3 h-3 text-blue-500 dark:text-blue-400 transition-transform group-hover:scale-110" />}
                {preset.id.includes('lux') && <Sun className="w-3 h-3 text-amber-500 dark:text-amber-400 transition-transform group-hover:scale-110" />}
                {preset.id.includes('cualitativa') && <ShieldCheck className="w-3 h-3 text-[#1B8A5A] dark:text-emerald-400 transition-transform group-hover:scale-110" />}
                <span>{preset.chipLabel || preset.title}</span>
              </button>
            ))}
          </div>

          {/* Chips de Tamaño Rápido de Muestra */}
          <div className="flex items-center gap-1 text-xs self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Fijar n:</span>
            {[10, 20, 27, 30, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleGenerateCustomN(size)}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-all cursor-pointer ${
                  customSampleSize === size
                    ? 'bg-[#1B8A5A] dark:bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Datos de la Variable y Medida / Individuo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Variable en Estudio
            </label>
            <input
              type="text"
              value={variableName}
              onChange={(e) => handleVariableNameChange(e.target.value)}
              placeholder="Ej: Ocupaciones declaradas, Nivel de Ruido, Edades, Días de Licencia"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-medium text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Individuo
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              placeholder="Ej: Trabajadores, Operarios, Casos, dBA, Años, Días"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] font-medium text-[#0F2942] dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Datos en Bruto con Indicaciones de Formato y Delimitadores Contextuales */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              {mode === 'grouped'
                ? (groupedVariableType === 'continuous'
                    ? 'Datos en Bruto (separados solo por punto y coma \';\')'
                    : 'Datos en Bruto (separados por coma \',\' o punto y coma \';\')')
                : (variableType === 'qualitative'
                    ? 'Valores Cualitativos (separados por \';\', \',\' o saltos de línea)'
                    : 'Datos en Bruto (acepta comas decimales y delimitación por \';\' o \',\')')}
            </label>
            <span className="text-[11px] font-mono text-[#1B8A5A] dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
              n actual = {n} {variableType === 'qualitative' ? 'casos' : 'datos'}
            </span>
          </div>

          <textarea
            rows={2}
            value={rawInput}
            onChange={(e) => handleRawInputChange(e.target.value)}
            placeholder={
              mode === 'grouped'
                ? (groupedVariableType === 'continuous'
                    ? 'Ingrese mediciones separadas por punto y coma (ej: 78,4; 82,1; 85,6; 88,0 o 78.4; 82.1)'
                    : 'Ingrese números separados por coma o punto y coma (ej: 21, 24, 28, 35, 42 o 21; 24; 28; 35)')
                : (variableType === 'qualitative'
                    ? 'Ingrese categorías separadas por coma o punto y coma (ej: Empleado/a; Emprendedora; Estudiante o Empleado/a, Emprendedora)'
                    : 'Ingrese números separados por punto y coma o coma (ej: 0; 2; 5; 0 o 1,5; 2,5 o 1, 2, 3, 4)')
            }
            className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-[#1B8A5A] dark:focus:ring-emerald-500 outline-none leading-relaxed resize-y"
          />

          {/* Ayuda de Formato según la selección */}
          <div className="mt-1.5 text-[11px]">
            {mode === 'grouped' && groupedVariableType === 'continuous' && (
              <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 inline-block">
                💡 <strong>Variable Continua:</strong> Utilice punto y coma (;) como separador para permitir decimales con coma (ej: 78,4; 82,1; 85,6).
              </span>
            )}
            {mode === 'grouped' && groupedVariableType === 'discrete' && (
              <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 inline-block">
                💡 <strong>Variable Discreta:</strong> Puede separar los datos usando comas (,) o punto y coma (;).
              </span>
            )}
          </div>
        </div>

        {/* Parámetros Manuales Plegables (Solo en agrupadas) */}
        {mode === 'grouped' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowManualParams(!showManualParams)}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer"
            >
              <span>Personalizar Parámetros Manuales (R, k, A) - Opcional</span>
            </button>

            {showManualParams && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Rango Manual (R)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={rango}
                    onChange={(e) => setRango(e.target.value)}
                    placeholder="Automático (Xmax - Xmin)"
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Intervalos (k)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={kValue}
                    onChange={(e) => setKValue(e.target.value)}
                    placeholder="Automático (k = √n)"
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Amplitud (A)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={amplitud}
                    onChange={(e) => setAmplitud(e.target.value)}
                    placeholder="Automático (A = R / k)"
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0A1322] text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón Principal de Actualización */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => onCalculateWithValues()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F2942] dark:bg-emerald-600 hover:bg-[#15385B] dark:hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#E67E22] dark:text-amber-300" />
            <span>Actualizar Tabla y Gráfico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
