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
      <div className="bg-gradient-to-r from-[#0F2942] via-[#15385B] to-[#0A1D30] rounded-2xl p-6 sm:p-8 text-white shadow-md border border-[#1C4874] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B8A5A] text-white text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            Material de Estudio Oficial
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Apuntes y Guías Prácticas de la Cátedra
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            Contenidos curriculares organizados por Unidad Temática para la carrera de{' '}
            <strong className="text-white">
              Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial
            </strong>. Acceda a los apuntes teóricos completos y las guías de trabajos prácticos de resolución obligatoria.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1 bg-[#0A1D30] px-2.5 py-1 rounded-lg border border-[#1C4874]">
              Docente: <strong className="text-white ml-1">Prof. Pacheco E. Joaquín</strong>
            </span>
            <span className="flex items-center gap-1 bg-[#0A1D30] px-2.5 py-1 rounded-lg border border-[#1C4874]">
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
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all hover:border-slate-300"
          >
            {/* Encabezado de la Tarjeta */}
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-[#0F2942] text-white text-xs font-bold px-3 py-1 rounded-lg font-mono">
                  {unit.badge}
                </span>
                <span className="text-xs font-semibold text-[#1B8A5A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {unit.practicalGuide.tpNumber}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F2942] mb-1 leading-snug">
                {unit.title}
              </h3>
              <p className="text-xs text-[#E67E22] font-semibold mb-3">
                {unit.subtitle}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {unit.description}
              </p>

              {/* Temas Clave */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Ejes Temáticos Clave:
                </span>
                <ul className="text-xs space-y-1 text-slate-700">
                  {unit.topics.slice(0, 3).map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#1B8A5A] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{topic.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Botones de Acción: Apunte Teórico y Guía de TPs */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
              {/* Botón Apunte Teórico */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'theory' })}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F2942] hover:bg-[#15385B] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#1B8A5A]" />
                  <span>Apunte Teórico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'theory' })}
                  className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
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
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>Guía de TPs ({unit.practicalGuide.tpNumber})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal({ unit, type: 'tp' })}
                  className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="bg-[#0F2942] p-5 text-white flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#1B8A5A]">
                  {activeModal.type === 'theory' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#E67E22] bg-[#15385B] px-2 py-0.5 rounded">
                      {activeModal.unit.badge}
                    </span>
                    <span className="text-xs text-slate-300">
                      {activeModal.type === 'theory' ? 'Apunte Teórico' : activeModal.unit.practicalGuide.tpNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-bold">
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
                  className="flex items-center gap-1 text-xs bg-[#15385B] hover:bg-[#1C4874] text-slate-200 px-3 py-1.5 rounded-lg border border-[#1C4874]"
                  title="Imprimir o Guardar en PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Documento Académico */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm leading-relaxed">
              {/* Membrete Institucional para Impresión */}
              <div className="border-b-2 border-[#0F2942] pb-4 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <p className="font-bold text-[#0F2942] text-sm uppercase">I.E.S. de Belén</p>
                  <p>Tec. Sup. en Higiene, Seguridad y Control Ambiental - Industrial</p>
                  <p>Cátedra: Estadística, Cálculo de la Probabilidad y Costos de la Seguridad</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">Prof. Pacheco E. Joaquín</p>
                  <p className="font-mono text-[11px] text-[#1B8A5A]">Ciclo Lectivo Oficial</p>
                </div>
              </div>

              {/* Contenido Teórico */}
              {activeModal.type === 'theory' ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-[#0F2942] text-sm uppercase mb-2">
                      Resumen Ejecutivo de la Unidad
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeModal.unit.theoreticalNote.summary}
                    </p>
                  </div>

                  {/* Temas y Fórmulas */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#0F2942] text-base border-b border-slate-200 pb-2">
                      Desarrollo de Contenidos y Formulación Didáctica
                    </h4>

                    {activeModal.unit.topics.map((topic, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <h5 className="font-bold text-[#0F2942] text-sm">
                          {topic.title}
                        </h5>
                        <p className="text-xs text-slate-700">
                          {topic.summary}
                        </p>

                        {topic.keyFormulas && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                            {topic.keyFormulas.map((kf, kIdx) => (
                              <div key={kIdx} className="bg-slate-50 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div>
                                  <span className="text-xs font-bold text-[#0F2942] block">
                                    {kf.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {kf.note}
                                  </span>
                                </div>
                                <div className="text-sm font-mono text-[#1B8A5A] bg-white px-3 py-1 rounded border border-slate-200 shadow-2xs">
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
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                    <h5 className="font-bold text-[#0F2942] text-xs uppercase mb-2">
                      Índice del Documento Completo:
                    </h5>
                    <ul className="text-xs space-y-1 text-slate-700">
                      {activeModal.unit.theoreticalNote.contentOutline.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="font-bold text-[#1B8A5A]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                /* Contenido Guía de Trabajos Prácticos (TPs) */
                <div className="space-y-6">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-[#1B8A5A] text-sm uppercase mb-1">
                      Objetivos del Trabajo Práctico ({activeModal.unit.practicalGuide.tpNumber})
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeModal.unit.practicalGuide.summary}
                    </p>
                  </div>

                  {/* Ejercicios de Aplicación */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#0F2942] text-base border-b border-slate-200 pb-2">
                      Problemas Prácticos de Higiene, Seguridad y Siniestralidad
                    </h4>

                    {activeModal.unit.practicalGuide.sampleExercises.map((ex) => (
                      <div key={ex.number} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0F2942] text-sm bg-slate-100 px-2.5 py-1 rounded">
                            Ejercicio N° {ex.number}
                          </span>
                          <span className="text-xs text-[#E67E22] font-semibold">
                            Aplicación Obligatoria
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed">
                          {ex.statement}
                        </p>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                          <span className="font-bold text-slate-900 block mb-1">Datos registrados:</span>
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
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 flex-shrink-0">
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
                  className="flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
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
