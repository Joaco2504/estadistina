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
import { StatisticalLoader } from '@/components/ui/StatisticalLoader';

import {
  ChevronDown,
  BarChart3,
  Table2,
  ShieldCheck,
  Layers,
  BookOpen
} from 'lucide-react';

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

/** Identificadores de los 5 módulos didácticos (orden pedagógico de la Unidad 1) */
export type ModuleId = 'simple' | 'grouped' | 'indicators' | 'contingency' | 'notes';

interface ModuleMeta {
  id: ModuleId;
  title: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
}

/** Definición ÚNICA de módulos: alimenta la vista desktop y el acordeón móvil */
const MODULES: ModuleMeta[] = [
  {
    id: 'simple',
    title: 'Frecuencias Simples',
    emoji: '📊',
    icon: BarChart3,
    badge: 'Discreta / Cualitativa',
    description: 'Tablas de frecuencias simples, porcentajes y gráficos de barras',
  },
  {
    id: 'grouped',
    title: 'Frecuencias Agrupadas',
    emoji: '📑',
    icon: Table2,
    badge: 'k = √n',
    description: 'Intervalos de clase, marcas de clase e histogramas de frecuencias',
  },
  {
    id: 'indicators',
    title: 'Indicadores SRT',
    emoji: '🛡️',
    icon: ShieldCheck,
    badge: 'IF · IG · II',
    description: 'Fórmulas oficiales de accidentabilidad laboral según normativa SRT / IRAM',
  },
  {
    id: 'contingency',
    title: 'Tabla de Contingencia',
    emoji: '⊞',
    icon: Layers,
    badge: 'Bivariada',
    description: 'Análisis de frecuencias conjuntas y tablas de doble entrada',
  },
  {
    id: 'notes',
    title: 'Apuntes de Cátedra',
    emoji: '📘',
    icon: BookOpen,
    badge: 'Teoría & Guía',
    description: 'Conceptos teóricos de la cátedra, definiciones y fórmulas didácticas',
  },
];

export default function HomePage() {
  // Estado de Carga Inicial con Loader Orbital (breve, solo al montar)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Orden prioritario: 1. Simples, 2. Agrupadas, 3. Indicadores SRT, 4. Contingencia, 5. Apuntes
  const [activeTab, setActiveTab] = useState<string>('simple');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Tipo de variable en estudio para frecuencias simples
  const [variableType, setVariableType] = useState<'quantitative' | 'qualitative'>('quantitative');

  // Tipo de variable en estudio para frecuencias agrupadas (continua o discreta)
  const [groupedVariableType, setGroupedVariableType] = useState<'continuous' | 'discrete'>('continuous');

  // Preset inicial
  const defaultSimplePreset = SAFETY_PRESETS.find(p => p.id === 'dias-baja') || SAFETY_PRESETS[0];
  const initialRawInput = defaultSimplePreset.dataGenerator().join('; ');
  const initialVariableName = defaultSimplePreset.variableName;
  const initialUnit = defaultSimplePreset.unit;

  const [variableName, setVariableName] = useState<string>(initialVariableName);
  const [unit, setUnit] = useState<string>(initialUnit);
  const [rawInput, setRawInput] = useState<string>(initialRawInput);

  // Parámetros manuales opcionales para agrupadas
  const [rango, setRango] = useState<string>('');
  const [kValue, setKValue] = useState<string>('');
  const [amplitud, setAmplitud] = useState<string>('');

  // Estado local de DataInputSection elevado aquí para mantener sincronizadas
  // las instancias móvil y escritorio de cada modo (las pestañas no se desmontan).
  const [simpleSampleSize, setSimpleSampleSize] = useState<number>(20);
  const [groupedSampleSize, setGroupedSampleSize] = useState<number>(25);
  const [simplePresetId, setSimplePresetId] = useState<string>('');
  const [groupedPresetId, setGroupedPresetId] = useState<string>('');
  const [groupedManualParamsOpen, setGroupedManualParamsOpen] = useState<boolean>(false);

  // Estados de Resultados Calculados (inicializados de forma lazy con el preset de arranque)
  const [simpleResult, setSimpleResult] = useState<SimpleFrequencyTableResult | null>(() => {
    try {
      const parsed = parseAnyDataString(initialRawInput);
      if (parsed.length === 0) return null;
      return generateSimpleFrequencyTable(initialVariableName, initialUnit, parsed, 'quantitative');
    } catch {
      return null;
    }
  });
  const [groupedResult, setGroupedResult] = useState<GroupedFrequencyTableResult | null>(() => {
    try {
      const parsed = parseGroupedDataString(initialRawInput, true);
      if (parsed.length === 0) return null;
      return generateGroupedFrequencyTable(initialVariableName, initialUnit, parsed, undefined, 'continuous');
    } catch {
      return null;
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manejo de cambio de pestaña / módulo (vista desktop)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Función para colapsar / expandir en vista móvil
  const handleMobileAccordionToggle = (tabId: string) => {
    setActiveTab(prev => (prev === tabId ? '' : tabId));
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al procesar los datos estadísticos.';
      console.error('Calculation error:', err);
      setErrorMessage(message);
    }
  }, [rawInput, variableName, unit, variableType, groupedVariableType, rango, kValue, amplitud]);

  /** Renderiza el contenido de un módulo a partir de su id (fuente única de verdad) */
  const renderModule = (id: ModuleId) => {
    switch (id) {
      case 'simple':
        return (
          <div className="space-y-6 pt-2">
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
              sampleSize={simpleSampleSize}
              onSampleSizeChange={setSimpleSampleSize}
              selectedPresetId={simplePresetId}
              onPresetSelect={setSimplePresetId}
              showManualParams={false}
              onToggleManualParams={() => {}}
              onCalculateWithValues={handleCalculate}
            />
            {simpleResult && <SimpleFrequenciesModule data={simpleResult} />}
          </div>
        );
      case 'grouped':
        return (
          <div className="space-y-6 pt-2">
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
              sampleSize={groupedSampleSize}
              onSampleSizeChange={setGroupedSampleSize}
              selectedPresetId={groupedPresetId}
              onPresetSelect={setGroupedPresetId}
              showManualParams={groupedManualParamsOpen}
              onToggleManualParams={() => setGroupedManualParamsOpen(prev => !prev)}
              onCalculateWithValues={handleCalculate}
            />
            {groupedResult && <GroupedFrequenciesModule data={groupedResult} />}
          </div>
        );
      case 'indicators':
        return (
          <div className="pt-2">
            <SafetyIndicatorsModule />
          </div>
        );
      case 'contingency':
        return (
          <div className="pt-2">
            <ContingencyTableModule />
          </div>
        );
      case 'notes':
        return (
          <div className="pt-2">
            <CourseNotesModule />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-150">
      {/* 1. NAVBAR SUPERIOR ÚNICA (Único selector de módulos) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Loader Inicial de Página con Animación Orbital */}
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
          {/* Título principal para SEO y lectores de pantalla */}
          <h1 className="sr-only">
            Cátedra de Estadística y SySO — I.E.S. de Belén: tablas de frecuencias, indicadores SRT y apuntes
          </h1>

          {/* Mensaje de Error si aplica */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium"
            >
              {errorMessage}
            </div>
          )}

          {/* =========================================================================
              2. VISTA MOBILE (< 768px / md:hidden): SISTEMA DE ACORDEONES COLAPSABLES
              ========================================================================= */}
          <div className="md:hidden space-y-3">
            {MODULES.map((item) => {
              const isOpen = activeTab === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-white/95 dark:bg-[#0C1929]/95 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-white/80 dark:bg-[#0C1929]/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Encabezado del Acordeón Clickeable */}
                  <button
                    type="button"
                    onClick={() => handleMobileAccordionToggle(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icono / Emoji con Píldora */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-[#10b981] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-[#132338] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="text-lg leading-none">{item.emoji}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={`text-sm font-bold tracking-wide transition-colors ${
                            isOpen ? 'text-[#0F2942] dark:text-white' : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {item.title}
                          </h2>
                          {item.badge && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                              isOpen
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Flecha Chevron con Rotación 180° Suave */}
                    <div className={`p-1.5 rounded-full flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Cuerpo Expandible del Acordeón con Transición Suave */}
                  <div
                    className={`mobile-accordion-body ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-3.5 pt-0 sm:p-5 sm:pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                        {renderModule(item.id)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              3. VISTA DESKTOP (>= 768px / hidden md:block)
              Todos los módulos permanecen MONTADOS (ocultos con CSS) para que el
              trabajo del alumno no se pierda al cambiar de pestaña.
              ========================================================================= */}
          <div className="hidden md:block">
            {MODULES.map((item) => (
              <div
                key={item.id}
                className={activeTab === item.id ? 'animate-in fade-in duration-200' : 'hidden'}
              >
                {renderModule(item.id)}
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Modal de Glosario de Fórmulas Oficial */}
      <FormulaGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* 4. FOOTER ESTRUCTURADO A 3 COLUMNAS */}
      <Footer
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onSelectTab={handleTabChange}
      />
    </div>
  );
}
