// src/components/layout/Navbar.tsx
'use client';

import React, { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { 
  BookOpen, 
  BarChart3, 
  Table2, 
  Layers, 
  HelpCircle, 
  GraduationCap, 
  UserCheck, 
  Menu, 
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'grouped', label: 'Frecuencias Agrupadas', icon: Table2, badge: 'k = √n' },
    { id: 'simple', label: 'Frecuencias Simples', icon: BarChart3 },
    { id: 'contingency', label: 'Tabla de Contingencia', icon: Layers, badge: 'Bivariada' },
    { id: 'notes', label: 'Apuntes de la Cátedra', icon: BookOpen, badge: 'Unidades 1, 2 y 3' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F2942] border-b border-[#1C4874] shadow-lg">
      {/* Barra superior de información académica */}
      <div className="bg-[#0A1D30] text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-[#15385B]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 text-[#1B8A5A]" />
              <span className="font-semibold text-white">Carrera:</span>
              <span className="hidden sm:inline">Tecnicatura Superior en Higiene, Seguridad y Control Ambiental - Industrial</span>
              <span className="sm:hidden">Tec. Higiene y Seguridad</span>
              <span className="bg-[#15385B] text-slate-200 px-1.5 py-0.2 rounded text-[11px] font-mono ml-1">
                2° año (Plan Nuevo) / 3° año (Plan Viejo)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#0F2942] px-2 py-0.5 rounded border border-[#1C4874] text-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-[#E67E22]" />
              <span className="font-semibold text-white">Docente:</span>
              <span className="text-[#F8FAFC]">Prof. Pacheco E. Joaquín</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de navegación principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo institucional */}
          <button 
            onClick={() => onSelectTab('grouped')}
            className="flex items-center text-left hover:opacity-95 transition-opacity"
          >
            <HeaderLogo size="md" />
          </button>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1B8A5A] text-white shadow-md'
                      : 'text-slate-200 hover:bg-[#15385B] hover:text-white'
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

            {/* Botón Glosario de Fórmulas */}
            <button
              onClick={onOpenGlossary}
              className="flex items-center gap-1.5 ml-2 px-3 py-2 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              title="Consultar fórmulas didácticas de la cátedra"
            >
              <FileText className="w-4 h-4" />
              <span>Formulario</span>
            </button>
          </nav>

          {/* Botón menú móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenGlossary}
              className="p-2 rounded-lg bg-[#E67E22] text-white text-xs font-medium"
              title="Fórmulas"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-[#15385B] text-white hover:bg-[#1C4874]"
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
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1B8A5A] text-white'
                    : 'text-slate-200 hover:bg-[#15385B]'
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
