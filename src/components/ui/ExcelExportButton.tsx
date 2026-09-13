// src/components/ui/ExcelExportButton.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Check, AlertTriangle } from 'lucide-react';

interface ExcelExportButtonProps {
  /** Función de exportación (debe lanzar Error si falla) */
  onExport: () => Promise<void> | void;
  label?: string;
  showLabelOnMobile?: boolean;
}

/**
 * Botón de exportación a Excel con estados visuales:
 * idle → Generando… → Listo ✓ / Reintentar (si falla), volviendo a idle solo.
 */
export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  onExport,
  label = 'Excel',
  showLabelOnMobile = false,
}) => {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (status === 'working') return;
    try {
      setStatus('working');
      await onExport();
      setStatus('done');
    } catch (err) {
      console.error('Error al exportar a Excel:', err);
      setStatus('error');
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setStatus('idle'), 3000);
  }, [onExport, status]);

  const Icon = status === 'done' ? Check : status === 'error' ? AlertTriangle : FileSpreadsheet;
  const text =
    status === 'working'
      ? 'Generando…'
      : status === 'done'
      ? 'Listo ✓'
      : status === 'error'
      ? 'Reintentar'
      : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'working'}
      title={
        status === 'error'
          ? 'La exportación falló. Verifica tu conexión e inténtalo de nuevo.'
          : 'Descargar tabla en formato Excel (.xlsx)'
      }
      className={`group flex items-center gap-1.5 bg-[#1B8A5A] hover:bg-[#15734A] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
        status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''
      } ${status === 'done' ? 'bg-emerald-600' : ''}`}
    >
      <Icon
        className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
          status === 'idle' ? 'group-hover:scale-110 group-hover:-translate-y-0.5' : ''
        }`}
      />
      <span className={showLabelOnMobile ? '' : 'hidden sm:inline'}>{text}</span>
    </button>
  );
};
