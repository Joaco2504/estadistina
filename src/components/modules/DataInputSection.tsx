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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SAFETY_PRESETS, parseAnyDataString } from '@/lib/statistics';

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
  onCalculateWithValues: (customRaw?: string, customVar?: string, customUnit?: string, customType?: 'quantitative' | 'qualitative') => void;
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
  onCalculateWithValues,
}) => {
  const [showManualParams, setShowManualParams] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Control interactivo del tamaño de la muestra deseado (n)
  const parsedTokens = parseAnyDataString(rawInput);
  const [customSampleSize, setCustomSampleSize] = useState<number>(parsedTokens.length > 0 ? parsedTokens.length : 25);

  const n = parsedTokens.length;

  // Cargar preset predefinido de Higiene y Seguridad respetando o seteando tamaño
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const presetType = preset.variableType || 'quantitative';
    setSelectedPresetId(presetId);
    setVariableName(preset.variableName);
    setUnit(preset.unit);
    if (setVariableType) {
      setVariableType(presetType);
    }
    
    // Generar muestra según el tamaño configurado por el usuario
    const generated = generateValuesForContext(preset.variableName, customSampleSize, presetType);
    const dataStr = generated.join('; ');
    setRawInput(dataStr);

    // Limpiar parámetros manuales
    setRango('');
    setKValue('');
    setAmplitud('');

    onCalculateWithValues(dataStr, preset.variableName, preset.unit, presetType);
  };

  // Generador contextual con tamaño exacto n ingresado por el usuario (numérico o cualitativo)
  const generateValuesForContext = (varName: string, targetN: number, type: 'quantitative' | 'qualitative'): (number | string)[] => {
    const count = Math.max(3, Math.min(500, targetN || 25));

    if (type === 'qualitative') {
      const lower = varName.toLowerCase();
      let categories = ['Corte en manos', 'Contusión', 'Quemadura térmica', 'Esguince', 'Fractura'];
      
      if (lower.includes('epp') || lower.includes('protec') || lower.includes('condic')) {
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

    // Cuantitativo
    let min = 70;
    let max = 100;
    let decimals = 1;

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
      min = 75;
      max = 96;
      decimals = 1;
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

    const generated = generateValuesForContext(variableName, targetN, variableType);
    const dataStr = generated.join('; ');
    setRawInput(dataStr);
    
    // Limpiar parámetros manuales
    setRango('');
    setKValue('');
    setAmplitud('');

    onCalculateWithValues(dataStr, variableName, unit, variableType);
  };

  // Cambiar tipo de variable (cuantitativa / cualitativa)
  const handleTypeChange = (newType: 'quantitative' | 'qualitative') => {
    if (setVariableType) {
      setVariableType(newType);
    }
    if (newType === 'qualitative') {
      setVariableName('Naturaleza de la Lesión');
      setUnit('Casos');
      const generated = generateValuesForContext('Naturaleza de la Lesión', customSampleSize, 'qualitative');
      const dataStr = generated.join('; ');
      setRawInput(dataStr);
      onCalculateWithValues(dataStr, 'Naturaleza de la Lesión', 'Casos', 'qualitative');
    } else {
      setVariableName('Jornadas de Trabajo Perdidas');
      setUnit('Días corridos');
      const generated = generateValuesForContext('Jornadas de Trabajo Perdidas', customSampleSize, 'quantitative');
      const dataStr = generated.join('; ');
      setRawInput(dataStr);
      onCalculateWithValues(dataStr, 'Jornadas de Trabajo Perdidas', 'Días corridos', 'quantitative');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mb-6 transition-all">
      {/* Encabezado Minimalista y Compacto */}
      <div className="bg-[#0F2942] px-4 sm:px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1B8A5A] text-white flex-shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-wide">
              {mode === 'grouped' 
                ? 'Frecuencias Agrupadas (k = √n)' 
                : variableType === 'qualitative'
                ? 'Frecuencias Simples: Variable Cualitativa'
                : 'Frecuencias Simples: Variable Cuantitativa Discreta'}
            </h2>
            <span className="text-[11px] text-slate-300 hidden sm:inline">
              Personaliza el tipo de variable, el tamaño de muestra o ingresa tus propios datos
            </span>
          </div>
        </div>

        {/* Acciones de Muestra Rápida */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-[#15385B] px-2.5 py-1 rounded-lg border border-[#1C4874]">
            <label className="text-xs text-slate-300 font-medium">Muestra (n):</label>
            <input
              type="number"
              min={3}
              max={500}
              value={customSampleSize}
              onChange={(e) => setCustomSampleSize(Number(e.target.value))}
              className="w-12 sm:w-14 bg-[#0A1D30] text-white font-mono text-xs font-bold text-center px-1 py-0.5 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1B8A5A]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleGenerateCustomN()}
            className="flex items-center gap-1 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
            title="Generar nueva muestra aleatoria del tamaño seleccionado"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Generar Muestra</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Selector de Naturaleza de Variable en Frecuencias Simples */}
        {mode === 'simple' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#0F2942] uppercase tracking-wide">
              Tipo de Variable en Estudio:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTypeChange('quantitative')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  variableType === 'quantitative'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-[#1B8A5A]" />
                <span>Cuantitativa Discreta (Números)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('qualitative')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  variableType === 'qualitative'
                    ? 'bg-[#1B8A5A] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span>Cualitativa (Categorías / Texto)</span>
              </button>
            </div>
          </div>
        )}

        {/* Casos Prácticos Rápidos de SySO & Chips de Tamaño Muestral */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Casos Prácticos */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Casos:</span>
            {SAFETY_PRESETS.filter(p => {
              if (mode === 'grouped') return p.recommendedType === 'grouped';
              if (variableType === 'qualitative') return p.variableType === 'qualitative';
              return p.recommendedType === 'simple' && p.variableType !== 'qualitative';
            }).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.id.includes('ruido') && <Volume2 className="w-3 h-3 text-[#E67E22]" />}
                {preset.id.includes('edad') && <Activity className="w-3 h-3 text-[#1B8A5A]" />}
                {preset.id.includes('dias') && <Calendar className="w-3 h-3 text-blue-500" />}
                {preset.id.includes('lux') && <Sun className="w-3 h-3 text-amber-500" />}
                {preset.id.includes('cualitativa') && <ShieldCheck className="w-3 h-3 text-[#1B8A5A]" />}
                <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}</span>
              </button>
            ))}
          </div>

          {/* Chips de Tamaño Rápido de Muestra */}
          <div className="flex items-center gap-1 text-xs self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Fijar n:</span>
            {[10, 20, 30, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleGenerateCustomN(size)}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-all cursor-pointer ${
                  customSampleSize === size
                    ? 'bg-[#1B8A5A] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Datos de la Variable y Medida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Variable en Estudio
            </label>
            <input
              type="text"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              placeholder="Ej: Tipo de Lesión, Días Perdidos, Ruido en dBA"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Unidad o Categoría
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ej: Casos, dBA, Días, Años"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none"
            />
          </div>
        </div>

        {/* Datos en Bruto */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">
              {variableType === 'qualitative' 
                ? 'Valores Cualitativos (separados por ; o saltos de línea)'
                : 'Datos en Bruto (separados por ;)'}
            </label>
            <span className="text-[11px] font-mono text-[#1B8A5A] font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
              n actual = {n} {variableType === 'qualitative' ? 'casos' : 'datos'}
            </span>
          </div>
          <textarea
            rows={2}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={variableType === 'qualitative' 
              ? 'Ingrese categorías separadas por punto y coma (ej: Corte; Quemadura; Contusión; Corte; Fractura; ...)'
              : 'Ingrese números separados por punto y coma (ej: 0; 2; 5; 0; 14; 3; ...)'}
            className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-[#0F2942] outline-none leading-relaxed resize-y"
          />
        </div>

        {/* Parámetros Manuales Plegables (Solo en agrupadas) */}
        {mode === 'grouped' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowManualParams(!showManualParams)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              {showManualParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>Personalizar Parámetros Manuales (R, k, A) - Opcional</span>
            </button>

            {showManualParams && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Rango Manual (R)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={rango}
                    onChange={(e) => setRango(e.target.value)}
                    placeholder="Automático (Xmax - Xmin)"
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Intervalos (k)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={kValue}
                    onChange={(e) => setKValue(e.target.value)}
                    placeholder="Automático (k = √n)"
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Amplitud (A)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={amplitud}
                    onChange={(e) => setAmplitud(e.target.value)}
                    placeholder="Automático (A = R / k)"
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono"
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F2942] hover:bg-[#15385B] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#E67E22]" />
            <span>Actualizar Tabla y Gráfico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
