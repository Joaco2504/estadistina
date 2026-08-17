// src/components/modules/DataInputSection.tsx
'use client';

import React, { useState } from 'react';
import { 
  Dices, 
  Sparkles,
  Sliders,
  AlertCircle,
  Activity,
  Calendar,
  Volume2,
  Sun,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { SAFETY_PRESETS, parseRawDataString } from '@/lib/statistics';

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
  onCalculateWithValues: (customRaw?: string, customVar?: string, customUnit?: string) => void;
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
  onCalculateWithValues,
}) => {
  const [showManualParams, setShowManualParams] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Control interactivo del tamaño de la muestra deseado (n)
  const parsedValues = parseRawDataString(rawInput);
  const [customSampleSize, setCustomSampleSize] = useState<number>(parsedValues.length > 0 ? parsedValues.length : 25);

  const n = parsedValues.length;

  // Cargar preset predefinido de Higiene y Seguridad respetando o seteando tamaño
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setVariableName(preset.variableName);
    setUnit(preset.unit);
    
    // Generar muestra según el tamaño configurado por el usuario
    const generated = generateRandomValuesForContext(preset.variableName, customSampleSize);
    const dataStr = generated.join('; ');
    setRawInput(dataStr);

    // Limpiar parámetros manuales
    setRango('');
    setKValue('');
    setAmplitud('');

    onCalculateWithValues(dataStr, preset.variableName, preset.unit);
  };

  // Generador contextual con tamaño exacto n ingresado por el usuario
  const generateRandomValuesForContext = (varName: string, targetN: number): number[] => {
    const count = Math.max(3, Math.min(500, targetN || 25));
    let min = 70;
    let max = 100;
    let decimals = 1;

    const lower = varName.toLowerCase();
    if (lower.includes('edad')) {
      min = 20;
      max = 60;
      decimals = 0;
    } else if (lower.includes('días') || lower.includes('licencia') || lower.includes('jornada') || lower.includes('accidente')) {
      min = 0;
      max = 25;
      decimals = 0;
    } else if (lower.includes('lux') || lower.includes('iluminac')) {
      min = 180;
      max = 600;
      decimals = 0;
    } else {
      // Default: Niveles de Ruido en dBA
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
    const newNumbers = generateRandomValuesForContext(variableName, targetN);
    const newRawString = newNumbers.join('; ');
    setRawInput(newRawString);
    onCalculateWithValues(newRawString, variableName, unit);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mb-6 transition-all">
      {/* Encabezado Minimalista y Compacto */}
      <div className="bg-[#0F2942] px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1B8A5A] text-white">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-wide">
              {mode === 'grouped' ? 'Frecuencias Agrupadas (k = √n)' : 'Frecuencias Simples'}
            </h2>
            <span className="text-[11px] text-slate-300">
              Personaliza el tamaño de la muestra o ingresa tus propios datos
            </span>
          </div>
        </div>

        {/* Acciones de Muestra Rápida */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#15385B] px-2.5 py-1 rounded-lg border border-[#1C4874]">
            <label className="text-xs text-slate-300 font-medium">Muestra (n):</label>
            <input
              type="number"
              min={3}
              max={300}
              value={customSampleSize}
              onChange={(e) => setCustomSampleSize(Number(e.target.value))}
              className="w-14 bg-[#0A1D30] text-white font-mono text-xs font-bold text-center px-1 py-0.5 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1B8A5A]"
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

      <div className="p-5 space-y-4">
        {/* Casos Prácticos Rápidos de SySO & Chips de Tamaño Muestral */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Casos Prácticos */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Casos:</span>
            {SAFETY_PRESETS.filter(p => mode === 'grouped' ? p.recommendedType === 'grouped' : true).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.id.includes('ruido') && <Volume2 className="w-3 h-3 text-[#E67E22]" />}
                {preset.id.includes('edad') && <Activity className="w-3 h-3 text-[#1B8A5A]" />}
                {preset.id.includes('dias') && <Calendar className="w-3 h-3 text-blue-500" />}
                {preset.id.includes('lux') && <Sun className="w-3 h-3 text-amber-500" />}
                <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}</span>
              </button>
            ))}
          </div>

          {/* Chips de Tamaño Rápido de Muestra */}
          <div className="flex items-center gap-1 text-xs">
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
              onChange={(e) => {
                setVariableName(e.target.value);
                onCalculateWithValues(rawInput, e.target.value, unit);
              }}
              placeholder="Ej: Nivel de Ruido en dBA"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Unidad
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                onCalculateWithValues(rawInput, variableName, e.target.value);
              }}
              placeholder="Ej: dBA, Años, Lux"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none"
            />
          </div>
        </div>

        {/* Textarea de Datos en Bruto */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">
              Datos en Bruto (separados por ;)
            </label>
            <span className="text-xs font-mono font-bold text-[#1B8A5A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              n actual = {n} datos
            </span>
          </div>

          <textarea
            rows={2}
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              onCalculateWithValues(e.target.value, variableName, unit);
            }}
            placeholder="Valores separados por punto y coma (ej: 82; 85; 90; 94)"
            className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none resize-y"
          />
        </div>

        {/* Configuración Avanzada Plegable (R, k, A) solo para Agrupadas */}
        {mode === 'grouped' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowManualParams(!showManualParams)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0F2942] font-semibold cursor-pointer"
            >
              {showManualParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showManualParams ? 'Ocultar Parámetros Manuales (R, k, A)' : 'Personalizar Parámetros Manuales (R, k, A) - Opcional'}</span>
            </button>

            {showManualParams && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="text-slate-500 text-[11px]">
                  Si dejas estos campos vacíos, el sistema calculará automáticamente <span className="font-mono font-bold">R = Max - Min</span>, <span className="font-mono font-bold">k = √n</span> y <span className="font-mono font-bold">A = R / k</span>.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rango (R)</label>
                    <input
                      type="number"
                      value={rango}
                      onChange={(e) => setRango(e.target.value)}
                      placeholder="Auto"
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Clases (k)</label>
                    <input
                      type="number"
                      value={kValue}
                      onChange={(e) => setKValue(e.target.value)}
                      placeholder="√n"
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Amplitud (A)</label>
                    <input
                      type="number"
                      value={amplitud}
                      onChange={(e) => setAmplitud(e.target.value)}
                      placeholder="R/k"
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de Acción Principal */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={() => onCalculateWithValues()}
            disabled={n === 0}
            className="flex items-center gap-1.5 bg-[#0F2942] hover:bg-[#15385B] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>Actualizar Tabla y Gráfico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
