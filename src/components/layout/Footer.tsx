// src/components/layout/Footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  UserCheck, 
  ArrowUp, 
  Sun, 
  Moon, 
  FileText, 
  Sigma, 
  Layers, 
  Activity, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { HeaderLogo } from './HeaderLogo';
import { getInitialTheme, applyTheme, ThemeMode } from '@/lib/utils';

interface FooterProps {
  onOpenGlossary?: () => void;
  onSelectTab?: (tabId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenGlossary,
  onSelectTab,
}) => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    setMounted(true);

    const handleThemeChange = (e: any) => {
      if (e.detail) setTheme(e.detail);
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-gradient-border bg-[#0A1D30] dark:bg-[#071322] text-slate-400 mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          
          {/* COLUMNA 1: IDENTIDAD INSTITUCIONAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <HeaderLogo size="md" showSubtitle={false} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-white font-bold text-sm tracking-wide">
                Tecnicatura Superior en Higiene y Seguridad en el Trabajo
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                Cátedra: Estadística, Probabilidades y Costos de la Seguridad
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma pedagógica e interactiva para el análisis de distribuciones de frecuencias, 
              cálculo de parámetros muestrales, tablas bivariadas y control oficial de accidentabilidad laboral.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-emerald-300 bg-[#0F2942] dark:bg-[#0C1B2E] px-2.5 py-1 rounded-md border border-[#1C4874] dark:border-slate-800">
                Plan Nuevo 2° Año / Plan Viejo 3° Año
              </span>
              <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1 bg-[#132A42] px-2.5 py-1 rounded-md border border-slate-700">
                <UserCheck className="w-3 h-3 text-amber-400" />
                Prof. Pacheco E. Joaquín
              </span>
            </div>
          </div>

          {/* COLUMNA 2: RECURSOS RÁPIDOS Y FÓRMULAS CLAVE */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-2">
              <Sigma className="w-4 h-4 text-emerald-400" />
              <span>Fórmulas y Módulos Clave</span>
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('grouped')}
                  className="footer-link text-slate-300 hover:text-emerald-400 cursor-pointer text-left"
                >
                  <span className="text-emerald-400">▸</span>
                  <span>Regla de Sturges y Regla de la Raíz (<code className="font-mono text-[11px] text-emerald-300">k = √n</code>)</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('indicators')}
                  className="footer-link text-slate-300 hover:text-emerald-400 cursor-pointer text-left"
                >
                  <span className="text-emerald-400">▸</span>
                  <span>Índice de Frecuencia SRT (<code className="font-mono text-[11px] text-cyan-300">IF = N·10⁶ / HHT</code>)</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('indicators')}
                  className="footer-link text-slate-300 hover:text-emerald-400 cursor-pointer text-left"
                >
                  <span className="text-emerald-400">▸</span>
                  <span>Índice de Gravedad e Incidencia (<code className="font-mono text-[11px] text-cyan-300">IG · II · DM</code>)</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('contingency')}
                  className="footer-link text-slate-300 hover:text-emerald-400 cursor-pointer text-left"
                >
                  <span className="text-emerald-400">▸</span>
                  <span>Tabla de Contingencia Bivariada (<code className="font-mono text-[11px] text-amber-300">X × Y</code>)</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={onOpenGlossary}
                  className="footer-link text-amber-300 hover:text-amber-200 cursor-pointer text-left font-semibold pt-1"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Consultar Glosario y Formulario Oficial</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: UTILIDADES, VERSIÓN Y CONTROLES */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-700/60 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Utilidades y Configuración</span>
            </h4>

            {/* Versión del Sistema */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2942]/80 dark:bg-[#0B1726] border border-[#1C4874] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-white">Sistema Didáctico</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v2.0 Oficial
              </span>
            </div>

            {/* Selector de Modo Claro / Noche */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2942]/80 dark:bg-[#0B1726] border border-[#1C4874] dark:border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Tema Visual:</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0A1D30] dark:bg-[#132338] hover:bg-[#15385B] dark:hover:bg-[#1B304C] text-xs font-semibold text-white border border-[#1C4874] dark:border-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                {mounted && theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300 animate-in spin-in-180 duration-300" />
                    <span>Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cyan-300 animate-in spin-in-180 duration-300" />
                    <span>Modo Noche</span>
                  </>
                )}
              </button>
            </div>

            {/* Botón Volver Arriba */}
            <button
              type="button"
              onClick={scrollToTop}
              className="group flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F2942] to-[#15385B] dark:from-[#0B1726] dark:to-[#132338] hover:from-[#15385B] hover:to-[#1B4B7A] dark:hover:from-[#132338] dark:hover:to-[#1A3452] border border-[#1C4874] dark:border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-95"
              title="Subir al inicio de la página"
            >
              <ArrowUp className="w-4 h-4 text-emerald-400 transition-transform duration-200 group-hover:-translate-y-0.5" />
              <span>Volver arriba</span>
            </button>
          </div>
        </div>

        {/* BARRA INFERIOR DE COPYRIGHT */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} Cátedra de Estadística - I.E.S. de Belén · Catamarca, Argentina.
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Material Didáctico Académico</span>
            <span>•</span>
            <span>Seguridad e Higiene Industrial</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
