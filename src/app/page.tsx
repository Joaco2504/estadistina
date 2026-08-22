// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DataInputSection } from '@/components/modules/DataInputSection';
import { SimpleFrequenciesModule } from '@/components/modules/SimpleFrequenciesModule';
import { GroupedFrequenciesModule } from '@/components/modules/GroupedFrequenciesModule';
import { SafetyIndicatorsModule } from '@/components/modules/SafetyIndicatorsModule';
import { ContingencyTableModule } from '@/components/modules/ContingencyTableModule';
import { CourseNotesModule } from '@/components/modules/CourseNotesModule';
import { FormulaGlossaryModal } from '@/components/modules/FormulaGlossaryModal';

import { 
  parseGroupedDataString, 
  parseAnyDataString,
  generateGroupedFrequencyTable, 
  generateSimpleFrequencyTable, 
  SAFETY_PRESETS 
} from '@/lib/statistics';
import { 
  GroupedFrequencyTableResult, 
  SimpleFrequencyTableResult 
} from '@/types/statistics';
import { FrequencyTableSwitcher } from '@/components/ui/FrequencyTableSwitcher';
import { StatisticalLoader } from '@/components/ui/StatisticalLoader';

export default function HomePage() {
  // Estado de Carga Inicial con Loader Orbital
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Orden prioritario: 1. Simples, 2. Agrupadas, 3. Contingencia, 4. Apuntes
  const [activeTab, setActiveTab] = useState<string>('simple');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Tipo de variable en estudio para frecuencias simples
  const [variableType, setVariableType] = useState<'quantitative' | 'qualitative'>('quantitative');

  // Tipo de variable en estudio para frecuencias agrupadas (continua o discreta)
  const [groupedVariableType, setGroupedVariableType] = useState<'continuous' | 'discrete'>('continuous');

  // Preset inicial
  const defaultSimplePreset = SAFETY_PRESETS.find(p => p.id === 'dias-baja') || SAFETY_PRESETS[0];
  const [variableName, setVariableName] = useState<string>(defaultSimplePreset.variableName);
  const [unit, setUnit] = useState<string>(defaultSimplePreset.unit);
  const [rawInput, setRawInput] = useState<string>(defaultSimplePreset.dataGenerator().join('; '));
  
  // Parámetros manuales opcionales para agrupadas
  const [rango, setRango] = useState<string>('');
  const [kValue, setKValue] = useState<string>('');
  const [amplitud, setAmplitud] = useState<string>('');

  // Estados de Resultados Calculados
  const [simpleResult, setSimpleResult] = useState<SimpleFrequencyTableResult | null>(null);
  const [groupedResult, setGroupedResult] = useState<GroupedFrequencyTableResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manejo de cambio de pestaña
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función principal de cálculo
  const handleCalculate = useCallback((
    customRaw?: string, 
    customVar?: string, 
    customUnit?: string, 
    customType?: 'quantitative' | 'qualitative',
    customGroupedType?: 'continuous' | 'discrete'
  ) => {
    try {
      setErrorMessage(null);
      const inputStringToParse = customRaw !== undefined ? customRaw : rawInput;
      const activeType = customType !== undefined ? customType : variableType;
      const activeGroupedType = customGroupedType !== undefined ? customGroupedType : groupedVariableType;
      const activeVarName = customVar !== undefined ? customVar : variableName;
      const activeUnit = customUnit !== undefined ? customUnit : unit;

      // Calcular Frecuencias Simples (Soporta Cuantitativo y Cualitativo)
      const parsedAny = parseAnyDataString(inputStringToParse);
      if (parsedAny.length === 0) {
        setErrorMessage('Por favor ingrese al menos un dato o categoría válida.');
        return;
      }

      const simple = generateSimpleFrequencyTable(
        activeVarName || 'Variable Muestral',
        activeUnit || 'u',
        parsedAny,
        activeType
      );
      setSimpleResult(simple);

      // Calcular Frecuencias Agrupadas (Requiere datos numéricos según tipo continuo o discreto)
      const isContinuous = activeGroupedType === 'continuous';
      const parsedNumeric = parseGroupedDataString(inputStringToParse, isContinuous);
      if (parsedNumeric.length > 0) {
        const customParams = (rango && kValue && amplitud) ? {
          rango: Number(rango),
          k: Number(kValue),
          amplitud: Number(amplitud),
        } : undefined;

        const grouped = generateGroupedFrequencyTable(
          activeVarName || 'Variable Muestral',
          activeUnit || 'u',
          parsedNumeric,
          customParams,
          activeGroupedType
        );
        setGroupedResult(grouped);
      }
    } catch (err: any) {
      console.error('Calculation error:', err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar los datos estadísticos.');
    }
  }, [rawInput, variableName, unit, variableType, groupedVariableType, rango, kValue, amplitud]);

  // Ejecutar cálculo inicial
  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#080D1A] transition-colors duration-150">
      {/* Navbar Superior Unificada */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Loader Inicial de Página con Animación Orbital (Esca-Byte/hard-penguin-57) */}
      {isInitialLoading ? (
        <main className="flex-1 flex items-center justify-center min-h-[75vh]">
          <StatisticalLoader
            size="lg"
            title="Inicializando Entorno Estadístico Didáctico..."
            subtitle="Cátedra de Estadística · IES Belén"
          />
        </main>
      ) : (
        /* Contenedor Principal */
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-in fade-in duration-300">
          {/* Mensaje de Error si aplica */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* CONTENIDO DEL MÓDULO ACTIVO EN ORDEN ESTRICTO */}
          <div id="active-module-container" className="transition-all">
            {/* Switcher Rápido de Tablas de Frecuencias (Animación alexmaracinaru/brown-bobcat-65) */}
            {(activeTab === 'simple' || activeTab === 'grouped') && (
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-200 uppercase tracking-wide">
                    Seleccionar Tipo de Distribución:
                  </span>
                </div>
              <FrequencyTableSwitcher
                activeMode={activeTab as 'simple' | 'grouped'}
                onSwitch={(newMode) => handleTabChange(newMode)}
              />
            </div>
          )}

          {/* 1. MÓDULO DE FRECUENCIAS SIMPLES (PRIMERO) */}
          {activeTab === 'simple' && (
            <div className="space-y-6">
              <DataInputSection
                variableName={variableName}
                setVariableName={setVariableName}
                unit={unit}
                setUnit={setUnit}
                rawInput={rawInput}
                setRawInput={setRawInput}
                rango={rango}
                setRango={setRango}
                kValue={kValue}
                setKValue={setKValue}
                amplitud={amplitud}
                setAmplitud={setAmplitud}
                mode="simple"
                variableType={variableType}
                setVariableType={setVariableType}
                groupedVariableType={groupedVariableType}
                setGroupedVariableType={setGroupedVariableType}
                onCalculateWithValues={handleCalculate}
              />

              {simpleResult && <SimpleFrequenciesModule data={simpleResult} />}
            </div>
          )}

          {/* 2. MÓDULO DE FRECUENCIAS AGRUPADAS (SEGUNDO) */}
          {activeTab === 'grouped' && (
            <div className="space-y-6">
              <DataInputSection
                variableName={variableName}
                setVariableName={setVariableName}
                unit={unit}
                setUnit={setUnit}
                rawInput={rawInput}
                setRawInput={setRawInput}
                rango={rango}
                setRango={setRango}
                kValue={kValue}
                setKValue={setKValue}
                amplitud={amplitud}
                setAmplitud={setAmplitud}
                mode="grouped"
                groupedVariableType={groupedVariableType}
                setGroupedVariableType={setGroupedVariableType}
                onCalculateWithValues={handleCalculate}
              />

              {groupedResult && <GroupedFrequenciesModule data={groupedResult} />}
            </div>
          )}

          {/* 3. MÓDULO DE INDICADORES OFICIALES DE SINIESTRALIDAD (TEMA 4 - UNIDAD 1) */}
          {activeTab === 'indicators' && <SafetyIndicatorsModule />}

          {/* 4. MÓDULO DE TABLA DE CONTINGENCIA */}
          {activeTab === 'contingency' && <ContingencyTableModule />}

          {/* 5. MÓDULO DE APUNTES DE CÁTEDRA */}
          {activeTab === 'notes' && <CourseNotesModule />}
        </div>
      </main>
      )}


      {/* Modal de Glosario de Fórmulas Oficial */}
      <FormulaGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Footer Institucional */}
      <Footer />
    </div>
  );
}
