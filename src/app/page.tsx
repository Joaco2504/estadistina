// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DataInputSection } from '@/components/modules/DataInputSection';
import { GroupedFrequenciesModule } from '@/components/modules/GroupedFrequenciesModule';
import { SimpleFrequenciesModule } from '@/components/modules/SimpleFrequenciesModule';
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
import { 
  Table2, 
  BarChart3, 
  Layers, 
  BookOpen, 
  ShieldCheck
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('grouped');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // Estados para Entrada de Datos
  const defaultNoisePreset = SAFETY_PRESETS.find(p => p.id === 'ruido-db')!;
  const [variableName, setVariableName] = useState<string>(defaultNoisePreset.variableName);
  const [unit, setUnit] = useState<string>(defaultNoisePreset.unit);
  const [rawInput, setRawInput] = useState<string>(defaultNoisePreset.dataGenerator().join('; '));
  
  // Parámetros manuales opcionales
  const [rango, setRango] = useState<string>('');
  const [kValue, setKValue] = useState<string>('');
  const [amplitud, setAmplitud] = useState<string>('');

  // Estados de Resultados Calculados
  const [groupedResult, setGroupedResult] = useState<GroupedFrequencyTableResult | null>(null);
  const [simpleResult, setSimpleResult] = useState<SimpleFrequencyTableResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manejo de cambio de pestaña con desplazamiento suave al módulo activo
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const el = document.getElementById('active-module-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Función principal de cálculo con soporte para valores inmediatos
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

      // Parámetros manuales si fueron ingresados
      const customParams = (rango && kValue && amplitud) ? {
        rango: Number(rango),
        k: Number(kValue),
        amplitud: Number(amplitud),
      } : undefined;

      // Calcular Frecuencias Agrupadas
      const grouped = generateGroupedFrequencyTable(
        activeVarName || 'Variable Muestral',
        activeUnit || 'u',
        parsedValues,
        customParams
      );
      setGroupedResult(grouped);

      // Calcular Frecuencias Simples
      const simple = generateSimpleFrequencyTable(
        activeVarName || 'Variable Muestral',
        activeUnit || 'u',
        parsedValues
      );
      setSimpleResult(simple);
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
      {/* Navbar Superior */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5">
        {/* ENCABEZADO INSTITUCIONAL MINIMALISTA Y COMPACTO */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0F2942] text-white text-[11px] font-bold font-mono uppercase">
                  <ShieldCheck className="w-3 h-3 text-[#1B8A5A]" />
                  I.E.S. de Belén
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Higiene, Seguridad y Control Ambiental
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  • Prof. Pacheco E. Joaquín
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0F2942] tracking-tight">
                Estadística, Probabilidad y Costos de la Seguridad
              </h1>
            </div>

            {/* Pestañas de Navegación Compactas */}
            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabChange('grouped')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'grouped'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Table2 className="w-3.5 h-3.5 text-[#1B8A5A]" />
                <span>Agrupadas</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('simple')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'simple'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#E67E22]" />
                <span>Simples</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('contingency')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'contingency'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Contingencia</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('notes')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Apuntes</span>
              </button>
            </div>
          </div>
        </section>

        {/* Mensaje de Error si aplica */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* CONTENEDOR ANCLADO DEL MÓDULO ACTIVO */}
        <div id="active-module-container" className="scroll-mt-16 transition-all">
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

          {activeTab === 'contingency' && <ContingencyTableModule />}

          {activeTab === 'notes' && <CourseNotesModule />}
        </div>
      </main>

      {/* Modal de Glosario de Fórmulas */}
      <FormulaGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Footer Institucional */}
      <Footer />
    </div>
  );
}
