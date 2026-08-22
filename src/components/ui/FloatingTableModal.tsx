// src/components/ui/FloatingTableModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, Maximize2, Minimize2, FileSpreadsheet } from 'lucide-react';

interface FloatingTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  onExportExcel?: () => void;
}

/**
 * Ventana Flotante / Modal a Pantalla Completa para Tablas Estadísticas
 * Permite a los alumnos en móviles o tablets visualizar la tabla con scroll horizontal/vertical
 * fluido, encabezados fijos y controles rápidos.
 */
export const FloatingTableModal: React.FC<FloatingTableModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  onExportExcel,
}) => {
  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Ventana Flotante */}
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] bg-white dark:bg-[#091322] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera de la Ventana Flotante */}
        <div className="bg-[#0F2942] dark:bg-[#071322] px-3.5 sm:px-6 py-3 text-white flex items-center justify-between gap-2 border-b border-[#1C4874] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center flex-shrink-0">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {title}
                </h2>
                {badge && (
                  <span className="bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-300 dark:text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                title="Descargar tabla en Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Excel</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Cerrar Ventana Flotante (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido de la Tabla con Scroll Dedicado */}
        <div className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-50/50 dark:bg-[#070F1B]">
          <div className="min-w-[650px] bg-white dark:bg-[#0F172A] rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
            {children}
          </div>
        </div>

        {/* Pie de la Ventana Flotante */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-[#07101C] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="text-[11px]">
            💡 <strong>Modo Ventana Flotante:</strong> Puedes desplazarte libremente o rotar el teléfono a horizontal para mayor comodidad.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#10B981] dark:hover:text-emerald-400 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minimizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
