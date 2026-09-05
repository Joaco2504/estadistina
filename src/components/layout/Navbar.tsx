// src/components/layout/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { 
  BookOpen, 
  BarChart3, 
  Table2, 
  Layers, 
  FileText,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { getInitialTheme, applyTheme, ThemeMode } from '@/lib/utils';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenGlossary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenGlossary,
}) => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
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

  // Orden temático de la Unidad 1:
  // Tema 2: Simples, Tema 3: Agrupadas, Tema 4: Indicadores SRT, Contingencia y Apuntes
  const navItems = [
    { id: 'simple', label: 'Frecuencias Simples', shortLabel: 'Simples', icon: BarChart3 },
    { id: 'grouped', label: 'Frecuencias Agrupadas', shortLabel: 'Agrupadas', icon: Table2 },
    { id: 'indicators', label: 'Indicadores SRT', shortLabel: 'Indicadores SRT', icon: ShieldCheck },
    { id: 'contingency', label: 'Tabla de Contingencia', shortLabel: 'Contingencia', icon: Layers },
    { id: 'notes', label: 'Apuntes de Cátedra', shortLabel: 'Apuntes', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F2942] dark:bg-[#080D1A] border-b border-[#1C4874] dark:border-[#1E293B] shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem] gap-2 sm:gap-4">
          {/* Logo e Identidad Institucional */}
          <button 
            type="button"
            onClick={() => onSelectTab('simple')}
            className="flex items-center text-left hover:opacity-95 transition-opacity cursor-pointer flex-shrink-0"
          >
            <HeaderLogo size="md" />
          </button>

          {/* Navegación Desktop: Segmented Control Centrado (Sincronizado a md: 768px) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0A1D30] dark:bg-[#0F172A] p-1 rounded-2xl border border-[#1C4874] dark:border-[#1E293B] flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`group flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3.5 py-1.5 rounded-xl text-[11px] lg:text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#10b981] text-white shadow-md ring-2 ring-emerald-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Acciones del Header: Toggle Modo Oscuro + Botón Formulario con Animaciones UIverse */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Botón Switch Modo Oscuro / Claro con Halo Animado */}
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn group"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Noche'}
              aria-label="Alternar tema oscuro o claro"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 theme-icon-sun drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-200 theme-icon-moon drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
              )}
            </button>

            {/* Botón Glosario / Formulario con Shimmer Luminoso */}
            <button
              type="button"
              onClick={onOpenGlossary}
              className="stat-formula-btn flex items-center gap-1.5"
              title="Consultar fórmulas oficiales de la cátedra"
            >
              <FileText className="w-4 h-4 formula-icon text-amber-200 flex-shrink-0" />
              <span className="hidden sm:inline lg:hidden xl:inline tracking-wide font-bold">Fórmulas Cátedra</span>
              <span className="hidden lg:inline xl:hidden tracking-wide font-bold">Fórmulas</span>
            </button>
          </div>
        </div>

        {/* Barra de Pestañas Móvil (Scroll Horizontal Táctil y Suave para < md) */}
        <div className="md:hidden pb-2.5 pt-1 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#10b981] text-white shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-[#0A1D30] dark:bg-[#0F172A] text-slate-300 dark:text-slate-300 border border-[#1C4874] dark:border-[#1E293B] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

