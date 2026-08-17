// src/components/layout/Navbar.tsx
'use client';

import React, { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { 
  BookOpen, 
  BarChart3, 
  Table2, 
  Layers, 
  Menu, 
  X,
  FileText,
  GraduationCap
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'grouped', label: 'Frecuencias Agrupadas', icon: Table2, badge: 'k = √n' },
    { id: 'simple', label: 'Frecuencias Simples', icon: BarChart3 },
    { id: 'contingency', label: 'Tabla de Contingencia', icon: Layers, badge: 'Bivariada' },
    { id: 'notes', label: 'Apuntes de Cátedra', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F2942] border-b border-[#1C4874] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Identidad Institucional */}
          <button 
            type="button"
            onClick={() => onSelectTab('grouped')}
            className="flex items-center text-left hover:opacity-95 transition-opacity cursor-pointer flex-shrink-0"
          >
            <HeaderLogo size="md" showSubtitle={true} />
          </button>

          {/* Navegación Desktop: Segmented Control Minimalista Único */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#0A1D30] p-1.5 rounded-2xl border border-[#1C4874]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1B8A5A] text-white shadow-sm ring-1 ring-emerald-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
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

          {/* Botón Glosario / Formulario & Menú Móvil */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGlossary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Consultar fórmulas oficiales de la cátedra"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Formulario</span>
            </button>

            {/* Toggle Menú Móvil */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-[#15385B] text-white hover:bg-[#1C4874] lg:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1D30] border-t border-[#1C4874] px-4 py-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1B8A5A] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-[#15385B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0F2942] text-slate-200 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
