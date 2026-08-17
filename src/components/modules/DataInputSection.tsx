// src/components/modules/DataInputSection.tsx
'use client';

import React, { useState } from 'react';
import { 
  Dices, 
  Settings2, 
  Sparkles,
  Sliders,
  AlertCircle,
  Activity,
  Calendar,
  Volume2,
  Sun
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

  const parsedValues = parseRawDataString(rawInput);
  const n = parsedValues.length;

  // Cargar preset predefinido de Higiene y Seguridad y recalcular al instante
  const handleLoadPreset = (presetId: string) => {
    const preset = SAFETY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setVariableName(preset.variableName);
    setUnit(preset.unit);
    const data = preset.dataGenerator();
    const dataStr = data.join('; ');
    setRawInput(dataStr);

    // Limpiar parámetros manuales para permitir el paso a paso
    setRango('');
    setKValue('');
    setAmplitud('');

    // Recalcular inmediatamente con los nuevos valores
    onCalculateWithValues(dataStr, preset.variableName, preset.unit);
  };

  // Generador de datos aleatorios dinámicos según contexto y recálculo automático
  const handleGenerateRandom = () => {
    let count = 25;
    let min = 70;
    let max = 100;
    let decimals = 1;

    const lower = variableName.toLowerCase();
    if (lower.includes('edad')) {
      count = 30;
      min = 20;
      max = 60;
      decimals = 0;
    } else if (lower.includes('días') || lower.includes('licencia') || lower.includes('jornada') || lower.includes('accidente')) {
      count = 20;
      min = 0;
      max = 25;
      decimals = 0;
    } else if (lower.includes('lux') || lower.includes('iluminac')) {
      count = 24;
      min = 180;
      max = 600;
      decimals = 0;
    } else {
      // Default: Niveles de Ruido en dBA
      count = 25;
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

    const newRawString = randomNumbers.join('; ');
    setRawInput(newRawString);
    onCalculateWithValues(newRawString, variableName, unit);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 transition-all">
      {/* Encabezado de la Sección de Entrada con Identificador de Módulo */}
      <div className="bg-gradient-to-r from-[#0F2942] to-[#15385B] p-5 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#E67E22]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide">
              {mode === 'grouped'
                ? 'Módulo 1: Tabla de Frecuencias Agrupadas (k = √n)'
                : 'Módulo 2: Tabla de Frecuencias Simples (Datos Individuales)'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Ingrese los datos en bruto separados por punto y coma (;) o seleccione un caso práctico de Higiene y Seguridad.
          </p>
        </div>

        {/* Acciones Rápidas y Botón Generar Aleatorios */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleGenerateRandom}
            className="flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
            title="Generar nuevos valores aleatorios realistas"
          >
            <Dices className="w-4 h-4" />
            <span>Generar Datos Aleatorios</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pastillas de Casos Rápidos de Higiene y Seguridad */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Cargar Casos Prácticos de Higiene, Seguridad y Medio Ambiente:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAFETY_PRESETS.filter(p => mode === 'grouped' ? p.recommendedType === 'grouped' : true).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {preset.id.includes('ruido') && <Volume2 className="w-3.5 h-3.5 text-[#E67E22]" />}
                {preset.id.includes('edad') && <Activity className="w-3.5 h-3.5 text-[#1B8A5A]" />}
                {preset.id.includes('dias') && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                {preset.id.includes('lux') && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>{preset.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario Principal: Nombre de Variable y Unidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre de la Variable en Estudio
            </label>
            <input
              type="text"
              value={variableName}
              onChange={(e) => {
                setVariableName(e.target.value);
                onCalculateWithValues(rawInput, e.target.value, unit);
              }}
              placeholder="Ej: Nivel de Ruido en dBA, Edades de Operarios, etc."
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#0F2942] focus:ring-2 focus:ring-[#0F2942]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Unidad de Medida
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                onCalculateWithValues(rawInput, variableName, e.target.value);
              }}
              placeholder="Ej: dBA, Años, Lux, ppm"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#0F2942] focus:ring-2 focus:ring-[#0F2942]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Textarea de Datos en Bruto */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Datos en Bruto (Separados por punto y coma ;)</span>
              <span className="text-slate-400 font-normal lowercase">(o comas/espacios)</span>
            </label>
            
            {/* Indicador de Tamaño Muestral */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                n > 0 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                Muestra (n): {n}
              </span>
              {n > 0 && (
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Mín: {parsedValues[0]} | Máx: {parsedValues[parsedValues.length - 1]}
                </span>
              )}
            </div>
          </div>

          <textarea
            rows={3}
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              onCalculateWithValues(e.target.value, variableName, unit);
            }}
            placeholder="Ejemplo: 78.4; 82.1; 85.6; 88.0; 91.2; 84.3; 79.8; 87.5; 92.4; 86.1; 83.7; 89.9"
            className="w-full font-mono text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#0F2942] focus:ring-2 focus:ring-[#0F2942]/20 outline-none transition-all resize-y"
          />
        </div>

        {/* Configuración Condicional de Parámetros R, k, A (Solo para Frecuencias Agrupadas) */}
        {mode === 'grouped' && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowManualParams(!showManualParams)}>
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#0F2942]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Parámetros de Intervalo Manuales (R, k, A) - Opcional
                </span>
              </div>
              <button
                type="button"
                className="text-xs text-[#0F2942] font-semibold underline hover:text-[#1B8A5A] cursor-pointer"
              >
                {showManualParams ? 'Ocultar campos manuales' : 'Mostrar campos manuales'}
              </button>
            </div>

            {showManualParams ? (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 mb-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Lógica Didáctica de la Cátedra:</strong>
                    <p className="mt-0.5">
                      • Si <strong>ingresas</strong> R, k y A: el sistema construirá los intervalos con tus valores exactos sin paso a paso previo.
                    </p>
                    <p className="mt-0.5">
                      • Si los <strong>dejas vacíos</strong>: el sistema calculará automáticamente <span className="font-mono">R = Xmax - Xmin</span>, la regla de la raíz <span className="font-mono">k = √n</span> y la amplitud <span className="font-mono">A = R / k</span> mostrando todo el desarrollo paso a paso.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rango (R)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={rango}
                      onChange={(e) => {
                        setRango(e.target.value);
                      }}
                      placeholder="Dejar vacío para auto"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cantidad de Intervalos (k)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={kValue}
                      onChange={(e) => {
                        setKValue(e.target.value);
                      }}
                      placeholder="Dejar vacío para √n"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amplitud (A)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={amplitud}
                      onChange={(e) => {
                        setAmplitud(e.target.value);
                      }}
                      placeholder="Dejar vacío para R/k"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1">
                Por defecto, se aplicará automáticamente el cálculo explicativo de <span className="font-semibold text-slate-700">Rango (R)</span>, <span className="font-semibold text-slate-700">Regla de la Raíz Cuadrada (k = √n)</span> y <span className="font-semibold text-slate-700">Amplitud (A = R / k)</span>.
              </p>
            )}
          </div>
        )}

        {/* Botón de Procesamiento */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onCalculateWithValues()}
            disabled={n === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
              n > 0
                ? 'bg-[#0F2942] hover:bg-[#15385B] active:scale-95 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed opacity-70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E67E22]" />
            <span>Generar Tabla y Gráfico Didáctico</span>
          </button>
        </div>
      </div>
    </div>
  );
};
