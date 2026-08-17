// src/components/layout/Navbar.tsx
'use client';

import React from 'react';
import { HeaderLogo } from './HeaderLogo';
import { 
  BookOpen, 
  BarChart3, 
  Table2, 
  Layers, 
  FileText
} from 'lucide-react';

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
  // Orden estricto solicitado: 1. Simples, 2. Agrupadas, 3. Contingencia, 4. Apuntes
  const navItems = [
    { id: 'simple', label: 'Frecuencias Simples', icon: BarChart3 },
    { id: 'grouped', label: 'Frecuencias Agrupadas', icon: Table2, badge: 'k = √n' },
    { id: 'contingency', label: 'Tabla de Contingencia', icon: Layers, badge: 'Bivariada' },
    { id: 'notes', label: 'Apuntes de Cátedra', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F2942] border-b border-[#1C4874] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo e Identidad Institucional */}
          <button 
            type="button"
            onClick={() => onSelectTab('simple')}
            className="flex items-center text-left hover:opacity-95 transition-opacity cursor-pointer flex-shrink-0"
          >
            <HeaderLogo size="sm" showSubtitle={true} className="sm:hidden" />
            <HeaderLogo size="md" showSubtitle={true} className="hidden sm:flex" />
          </button>

          {/* Navegación Desktop: Segmented Control Centrado */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0A1D30] p-1.5 rounded-2xl border border-[#1C4874]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B8A5A] text-white shadow-sm ring-1 ring-emerald-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-[#0F2942] text-white'
                          : 'bg-[#15385B] text-slate-300 border border-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Botón Glosario / Formulario */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenGlossary}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Consultar fórmulas oficiales de la cátedra"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Formulario</span>
            </button>
          </div>
        </div>

        {/* Barra de Pestañas Móvil Siempre Visible (Scroll Horizontal Suave) */}
        <div className="lg:hidden pb-2.5 pt-0.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-t border-[#1C4874]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1B8A5A] text-white shadow-xs'
                    : 'bg-[#0A1D30] text-slate-300 border border-[#1C4874] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[8px] px-1 rounded font-mono ${
                    isActive ? 'bg-[#0F2942] text-white' : 'bg-[#15385B] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
