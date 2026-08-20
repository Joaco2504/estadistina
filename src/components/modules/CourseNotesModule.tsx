// src/components/modules/CourseNotesModule.tsx
'use client';

import React, { useState } from 'react';
import { THEMATIC_UNITS } from '@/lib/statistics';
import { ThematicUnit } from '@/types/statistics';
import { MathFormula } from '@/components/ui/math-formula';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  GraduationCap, 
  Sparkles, 
  X,
  Printer,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const CourseNotesModule: React.FC = () => {
  const [activeModal, setActiveModal] = useState<{
    unit: ThematicUnit;
    type: 'theory' | 'tp';
  } | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Portada / Banner de la Sección */}
      <div className="bg-gradient-to-r from-[#0F2942] via-[#15385B] to-[#0A1D30] dark:from-[#080D1A] dark:via-[#0F172A] dark:to-[#0A1322] rounded-2xl p-6 sm:p-8 text-white shadow-md border border-[#1C4874] dark:border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B8A5A] dark:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            Material de Estudio Oficial
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white">
            Apuntes y Guías Prácticas de la Cátedra
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 leading-relaxed mb-4">
            Contenidos curriculares organizados por Unidad Temática para la carrera de{' '}
            <strong className="text-white">
              Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial
            </strong>. Acceda a los apuntes teóricos completos y las guías de trabajos prácticos de resolución obligatoria.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1 bg-[#0A1D30] dark:bg-[#080D1A] px-2.5 py-1 rounded-lg border border-[#1C4874] dark:border-slate-700">
              Docente: <strong className="text-white ml-1">Prof. Pacheco E. Joaquín</strong>
            </span>
            <span className="flex items-center gap-1 bg-[#0A1D30] dark:bg-[#080D1A] px-2.5 py-1 rounded-lg border border-[#1C4874] dark:border-slate-700">
              Institución: <strong className="text-white ml-1">I.E.S. de Belén</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Unidades Temáticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {THEMATIC_UNITS.map((unit) => (
          <div
            key={unit.id}
            className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            {/* Encabezado de la Tarjeta */}
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-[#0F2942] dark:bg-[#080D1A] text-white text-xs font-bold px-3 py-1 rounded-lg font-mono border border-transparent dark:border-slate-700">
                  {unit.badge}
                </span>
                <span className="text-xs font-semibold text-[#1B8A5A] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {unit.practicalGuide.tpNumber}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F2942] dark:text-slate-100 mb-1 leading-snug">
                {unit.title}
              </h3>
              <p className="text-xs text-[#E67E22] dark:text-amber-400 font-semibold mb-3">
                {unit.subtitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {unit.description}
              </p>

              {/* Temas Clave */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Ejes Temáticos Clave:
                </span>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  {unit.topics.slice(0, 3).map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{topic.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Botones de Acción: Apunte Teórico y Guía de TPs */}
            <div className="p-4 bg-slate-50 dark:bg-[#131C2E] border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              {/* Botón Apunte Teórico */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'theory' })}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F2942] dark:bg-[#1E293B] hover:bg-[#15385B] dark:hover:bg-[#334155] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-2xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#1B8A5A] dark:text-emerald-400" />
                  <span>Apunte Teórico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'theory' })}
                  className="p-2 rounded-lg bg-white dark:bg-[#0A1322] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Vista Previa de Apunte"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Botón Guía de TPs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'tp' })}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>Guía de TPs ({unit.practicalGuide.tpNumber})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'tp' })}
                  className="p-2 rounded-lg bg-white dark:bg-[#0A1322] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Vista Previa de Guía de TPs"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE LECTURA Y DESCARGA DIDÁCTICA */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="bg-[#0F2942] dark:bg-[#080D1A] p-4 sm:p-5 text-white flex items-center justify-between gap-4 flex-shrink-0 border-b border-[#1C4874] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#1B8A5A] dark:bg-emerald-600">
                  {activeModal.type === 'theory' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#E67E22] dark:text-amber-400 bg-[#15385B] dark:bg-[#1E293B] px-2 py-0.5 rounded">
                      {activeModal.unit.badge}
                    </span>
                    <span className="text-xs text-slate-300">
                      {activeModal.type === 'theory' ? 'Apunte Teórico' : activeModal.unit.practicalGuide.tpNumber}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold">
                    {activeModal.type === 'theory'
                      ? activeModal.unit.theoreticalNote.title
                      : activeModal.unit.practicalGuide.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1 text-xs bg-[#15385B] dark:bg-[#1E293B] hover:bg-[#1C4874] dark:hover:bg-[#334155] text-slate-200 px-3 py-1.5 rounded-lg border border-[#1C4874] dark:border-slate-700 cursor-pointer"
                  title="Imprimir o Guardar en PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Documento Académico */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              {/* Membrete Institucional para Impresión */}
              <div className="border-b-2 border-[#0F2942] dark:border-slate-700 pb-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <p className="font-bold text-[#0F2942] dark:text-slate-100 text-sm uppercase">I.E.S. de Belén</p>
                  <p>Tec. Sup. en Higiene, Seguridad y Control Ambiental - Industrial</p>
                  <p>Cátedra: Estadística, Cálculo de la Probabilidad y Costos de la Seguridad</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Prof. Pacheco E. Joaquín</p>
                  <p className="font-mono text-[11px] text-[#1B8A5A] dark:text-emerald-400">Ciclo Lectivo Oficial</p>
                </div>
              </div>

              {/* Contenido Teórico */}
              {activeModal.type === 'theory' ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-[#131C2E] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-[#0F2942] dark:text-slate-100 text-sm uppercase mb-2">
                      Resumen Ejecutivo de la Unidad
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeModal.unit.theoreticalNote.summary}
                    </p>
                  </div>

                  {/* Temas y Fórmulas */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#0F2942] dark:text-slate-100 text-base border-b border-slate-200 dark:border-slate-800 pb-2">
                      Desarrollo de Contenidos y Formulación Didáctica
                    </h4>

                    {activeModal.unit.topics.map((topic, i) => (
                      <div key={i} className="bg-white dark:bg-[#0A1322] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                        <h5 className="font-bold text-[#0F2942] dark:text-slate-100 text-sm">
                          {topic.title}
                        </h5>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {topic.summary}
                        </p>

                        {topic.keyFormulas && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {topic.keyFormulas.map((kf, kIdx) => (
                              <div key={kIdx} className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200 dark:border-slate-800">
                                <div>
                                  <span className="text-xs font-bold text-[#0F2942] dark:text-slate-200 block">
                                    {kf.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {kf.note}
                                  </span>
                                </div>
                                <div className="text-sm font-mono text-[#1B8A5A] dark:text-emerald-300 bg-white dark:bg-[#0A1322] px-3 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <MathFormula formula={kf.formula} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Estructura del Documento */}
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40">
                    <h5 className="font-bold text-[#0F2942] dark:text-slate-200 text-xs uppercase mb-2">
                      Índice del Documento Completo:
                    </h5>
                    <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      {activeModal.unit.theoreticalNote.contentOutline.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="font-bold text-[#1B8A5A] dark:text-emerald-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                /* Contenido Guía de Trabajos Prácticos (TPs) */
                <div className="space-y-6">
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    <h4 className="font-bold text-[#1B8A5A] dark:text-emerald-300 text-sm uppercase mb-1">
                      Objetivos del Trabajo Práctico ({activeModal.unit.practicalGuide.tpNumber})
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeModal.unit.practicalGuide.summary}
                    </p>
                  </div>

                  {/* Ejercicios de Aplicación */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#0F2942] dark:text-slate-100 text-base border-b border-slate-200 dark:border-slate-800 pb-2">
                      Problemas Prácticos de Higiene, Seguridad y Siniestralidad
                    </h4>

                    {activeModal.unit.practicalGuide.sampleExercises.map((ex) => (
                      <div key={ex.number} className="bg-white dark:bg-[#0A1322] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0F2942] dark:text-slate-100 text-sm bg-slate-100 dark:bg-[#131C2E] px-2.5 py-1 rounded">
                            Ejercicio N° {ex.number}
                          </span>
                          <span className="text-xs text-[#E67E22] dark:text-amber-400 font-semibold">
                            Aplicación Obligatoria
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          {ex.statement}
                        </p>

                        <div className="bg-slate-50 dark:bg-[#131C2E] p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Datos registrados:</span>
                          <div className="break-all select-all">
                            {ex.dataSample}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-slate-50 dark:bg-[#080D1A] p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-[11px]">
                  {activeModal.type === 'theory'
                    ? activeModal.unit.theoreticalNote.fileName
                    : activeModal.unit.practicalGuide.fileName}
                </span>
                <span>•</span>
                <span>
                  {activeModal.type === 'theory'
                    ? `${activeModal.unit.theoreticalNote.pages} páginas (${activeModal.unit.theoreticalNote.fileSize})`
                    : `${activeModal.unit.practicalGuide.exercisesCount} problemas (${activeModal.unit.practicalGuide.fileSize})`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-[#1B8A5A] dark:bg-emerald-600 hover:bg-[#15734A] dark:hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar / Imprimir Formato Cátedra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
