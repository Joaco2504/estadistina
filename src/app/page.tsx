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
  ShieldCheck, 
  UserCheck
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
      {/* Navbar Superior con Identidad Institucional */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* PORTADA / HERO INSTITUCIONAL */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2942] text-white text-xs font-bold font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B8A5A]" />
                  I.E.S. de Belén
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1B8A5A]/15 text-[#1B8A5A] text-xs font-bold">
                  Higiene, Seguridad y Control Ambiental - Industrial
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  2° año (Plan Nuevo) / 3° año (Plan Viejo)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2942] tracking-tight leading-tight">
                Estadística, Cálculo de la Probabilidad y Costos de la Seguridad
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Plataforma didáctica para el análisis cuantitativo y la toma de decisiones en prevención de riesgos laborales. Desarrolle tablas de frecuencias con la regla <span className="font-mono font-bold text-[#1B8A5A]">k = √n</span>, cruces bivariados de contingencia y visualizaciones gráficas bajo el marco pedagógico oficial.
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-700 pt-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#E67E22]" />
                  <span><strong>Docente Titular:</strong> Prof. Pacheco E. Joaquín</span>
                </div>
              </div>
            </div>

            {/* Emblema Institucional de Portada */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-[#0F2942] to-[#15385B] border border-[#1C4874] shadow-md self-stretch lg:self-auto min-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-xl bg-white/10 p-1 border border-white/20">
                  <img
                    src="/logo-catedra.svg"
                    alt="Logo Cátedra IES Belén"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-base font-extrabold text-white block tracking-wide">
                    I.E.S. de Belén
                  </span>
                  <span className="text-[10px] bg-[#1B8A5A] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                    Cátedra Oficial
                  </span>
                </div>
              </div>

              <div className="text-center mt-3 pt-3 border-t border-white/10 w-full">
                <span className="text-[11px] font-medium text-slate-300 block">
                  Seguridad e Higiene Industrial
                </span>
                <span className="text-xs font-mono font-bold text-[#E67E22]">
                  Prof. Pacheco E. Joaquín
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleTabChange('grouped')}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'grouped'
                  ? 'bg-[#0F2942] text-white shadow-md ring-2 ring-[#1B8A5A]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Table2 className="w-4 h-4 text-[#1B8A5A]" />
              <span>Frecuencias Agrupadas</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('simple')}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'simple'
                  ? 'bg-[#0F2942] text-white shadow-md ring-2 ring-[#E67E22]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#E67E22]" />
              <span>Frecuencias Simples</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('contingency')}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'contingency'
                  ? 'bg-[#0F2942] text-white shadow-md ring-2 ring-[#3B82F6]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-[#3B82F6]" />
              <span>Tabla de Contingencia</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('notes')}
              className={`flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-[#0F2942] text-white shadow-md ring-2 ring-[#10B981]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#10B981]" />
              <span>Apuntes de la Cátedra</span>
            </button>
          </div>
        </section>

        {/* Mensaje de Error si aplica */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* CONTENEDOR ANCLADO DEL MÓDULO ACTIVO */}
        <div id="active-module-container" className="scroll-mt-24 transition-all">
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
