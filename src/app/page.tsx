// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DataInputSection } from '@/components/modules/DataInputSection';
import { SimpleFrequenciesModule } from '@/components/modules/SimpleFrequenciesModule';
import { GroupedFrequenciesModule } from '@/components/modules/GroupedFrequenciesModule';
import { ContingencyTableModule } from '@/components/modules/ContingencyTableModule';
import { CourseNotesModule } from '@/components/modules/CourseNotesModule';
import { FormulaGlossaryModal } from '@/components/modules/FormulaGlossaryModal';
import { 
  parseRawDataString, 
  generateGroupedFrequencyTable, 
  generateSimpleFrequencyTable, 
  SAFETY_PRESETS 
} from '@/lib/statistics';
import { 
  GroupedFrequencyTableResult, 
  SimpleFrequencyTableResult 
} from '@/types/statistics';

export default function HomePage() {
  // Orden prioritario: 1. Simples, 2. Agrupadas, 3. Contingencia, 4. Apuntes
  const [activeTab, setActiveTab] = useState<string>('simple');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // Preset inicial para Frecuencias Simples
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
  const handleCalculate = useCallback((customRaw?: string, customVar?: string, customUnit?: string) => {
    try {
      setErrorMessage(null);
      const inputStringToParse = customRaw !== undefined ? customRaw : rawInput;
      const parsedValues = parseRawDataString(inputStringToParse);

      if (parsedValues.length === 0) {
        setErrorMessage('Por favor ingrese al menos un número válido en los datos en bruto.');
        return;
      }

      const activeVarName = customVar !== undefined ? customVar : variableName;
      const activeUnit = customUnit !== undefined ? customUnit : unit;

      // Calcular Frecuencias Simples
      const simple = generateSimpleFrequencyTable(
        activeVarName || 'Variable Muestral',
        activeUnit || 'u',
        parsedValues
      );
      setSimpleResult(simple);

      // Calcular Frecuencias Agrupadas
      const customParams = (rango && kValue && amplitud) ? {
        rango: Number(rango),
        k: Number(kValue),
        amplitud: Number(amplitud),
      } : undefined;

      const grouped = generateGroupedFrequencyTable(
        activeVarName || 'Variable Muestral',
        activeUnit || 'u',
        parsedValues,
        customParams
      );
      setGroupedResult(grouped);
    } catch (err: any) {
      console.error('Calculation error:', err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar los datos estadísticos.');
    }
  }, [rawInput, variableName, unit, rango, kValue, amplitud]);

  // Ejecutar cálculo inicial
  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Navbar Superior Unificada */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Mensaje de Error si aplica */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* CONTENIDO DEL MÓDULO ACTIVO EN ORDEN ESTRICTO */}
        <div id="active-module-container" className="transition-all">
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
                onCalculateWithValues={handleCalculate}
              />

              {groupedResult && <GroupedFrequenciesModule data={groupedResult} />}
            </div>
          )}

          {/* 3. MÓDULO DE TABLA DE CONTINGENCIA (TERCERO) */}
          {activeTab === 'contingency' && <ContingencyTableModule />}

          {/* 4. MÓDULO DE APUNTES DE CÁTEDRA (CUARTO) */}
          {activeTab === 'notes' && <CourseNotesModule />}
        </div>
      </main>

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
