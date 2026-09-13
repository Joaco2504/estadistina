// src/lib/useDialog.ts
'use client';

import { useEffect, useRef } from 'react';

/**
 * Comportamiento accesible estándar para diálogos / modales:
 * - Cierre con la tecla Escape.
 * - Bloqueo del scroll del body mientras está abierto (restaurando el valor previo).
 * - Trampa de foco básica (Tab / Shift+Tab ciclan dentro del diálogo).
 * - Foco inicial en el contenedor y restauración del foco al cerrar.
 *
 * Uso:
 *   const dialogRef = useDialog(isOpen, onClose);
 *   if (!isOpen) return null;
 *   return <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1} ...>
 */
export function useDialog(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Mantiene la última versión de onClose sin re-suscribir el listener (patrón latest-ref).
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;
      const focusables = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Foco inicial en el diálogo (permite que Escape/Tab funcionen de inmediato)
    const focusTimer = window.setTimeout(() => {
      containerRef.current?.focus();
    }, 10);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  return containerRef;
}
