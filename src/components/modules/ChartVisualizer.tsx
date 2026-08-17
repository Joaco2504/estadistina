// src/components/modules/ChartVisualizer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { 
  BarChart2, 
  PieChart as PieIcon, 
  TrendingUp, 
  Layers as StackIcon,
  Activity
} from 'lucide-react';

// Paleta de colores vibrante, moderna y accesible para Higiene y Seguridad
const DYNAMIC_CHART_COLORS = [
  '#1B8A5A', // Verde Seguridad Primario
  '#0F2942', // Azul Marino Técnico
  '#E67E22', // Ámbar Alerta
  '#3B82F6', // Azul Eléctrico
  '#8B5CF6', // Púrpura Radiación
  '#EC4899', // Rosa
  '#14B8A6', // Turquesa
  '#F59E0B', // Amarillo Precaución
  '#6366F1', // Índigo
  '#10B981', // Verde Esmeralda
  '#06B6D4', // Cian
  '#F97316', // Naranja Industrial
];

/* -------------------------------------------------------------------------- */
/* 1. VISUALIZADOR DE DATOS AGRUPADOS MULTI-TIPO                              */
/* (Histograma, Polígono, Circular/Torta, Ojiva)                              */
/* -------------------------------------------------------------------------- */
interface GroupedChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  data: {
    intervalLabel: string;
    marcaDeClase: number;
    fa: number;
    p: number;
    Fa: number;
  }[];
}

export const HistogramVisualizer: React.FC<GroupedChartProps> = ({
  title,
  xLabel,
  yLabel,
  data,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<'histogram' | 'polygon' | 'pie' | 'ogive'>('histogram');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dynamicYLabel = yLabel && yLabel !== 'Frecuencia Absoluta (fa)'
    ? yLabel
    : chartType === 'ogive'
    ? 'Total Acumulado de Casos (Fa)'
    : 'Cantidad de Observaciones Registradas';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 mt-6">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {chartType === 'histogram' && 'Histograma de Frecuencias por Intervalo de Clase'}
            {chartType === 'polygon' && 'Polígono de Frecuencias (Marcas de Clase Mc)'}
            {chartType === 'pie' && 'Distribución Porcentual Relativa (Torta %)'}
            {chartType === 'ogive' && 'Ojiva de Frecuencias Acumuladas (Fa)'}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos con Scroll Horizontal */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setChartType('histogram')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'histogram'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
            title="Histograma de Barras Continuas"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Histograma</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('polygon')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'polygon'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
            title="Polígono de Frecuencias"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Polígono</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('pie')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'pie'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
            title="Gráfico Circular de Porcentajes"
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Circular</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('ogive')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'ogive'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
            title="Ojiva de Frecuencias Acumuladas"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ojiva (Fa)</span>
          </button>
        </div>
      </div>

      {/* Área del Gráfico Renderizado */}
      <div className="h-72 sm:h-88 w-full min-h-[260px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {/* 1. HISTOGRAMA */}
            {chartType === 'histogram' && (
              <BarChart
                data={data}
                margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
                barCategoryGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="intervalLabel"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} observaciones`, 'Conteo Registrado (fa)']}
                  labelFormatter={(lbl: any) => `Intervalo: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Bar dataKey="fa" name="Observaciones Registradas" stroke="#0F2942" strokeWidth={1}>
                  {data.map((_, idx) => (
                    <Cell 
                      key={`hist-cell-${idx}`} 
                      fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}

            {/* 2. POLÍGONO DE FRECUENCIAS */}
            {chartType === 'polygon' && (
              <AreaChart
                data={data}
                margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="polyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B8A5A" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#1B8A5A" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="marcaDeClase"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: `Marca de Clase (Mc) [${xLabel}]`,
                    position: 'insideBottom',
                    offset: -15,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} observaciones`, 'Conteo Registrado (fa)']}
                  labelFormatter={(lbl: any) => `Marca de Clase (Mc): ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="fa"
                  name="Conteo de Casos"
                  stroke="#1B8A5A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#polyGradient)"
                />
              </AreaChart>
            )}

            {/* 3. GRÁFICO CIRCULAR (TORTA %) */}
            {chartType === 'pie' && (
              <PieChart>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.fa} observaciones)`,
                    'Porcentaje Relativo'
                  ]}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value: string) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                />
                <Pie
                  data={data}
                  dataKey="p"
                  nameKey="intervalLabel"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={35}
                  paddingAngle={3}
                  label={(props: any) => `${Number(props.percent ? props.percent * 100 : props.value || 0).toFixed(1)}%`}
                  labelLine={false}
                >
                  {data.map((_, idx) => (
                    <Cell 
                      key={`pie-cell-${idx}`} 
                      fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
              </PieChart>
            )}

            {/* 4. OJIVA (FRECUENCIAS ACUMULADAS) */}
            {chartType === 'ogive' && (
              <LineChart
                data={data}
                margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="intervalLabel"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: 'Total Acumulado de Casos (Fa)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} casos acumulados`, 'Frec. Acumulada (Fa)']}
                  labelFormatter={(lbl: any) => `Intervalo: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="Fa"
                  name="Frecuencia Acumulada (Fa)"
                  stroke="#E67E22"
                  strokeWidth={3.5}
                  dot={{ r: 6, fill: '#E67E22', stroke: '#FFF', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400">Cargando gráfico estadístico...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Visualización Dinámica</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. VISUALIZADOR DE FRECUENCIAS SIMPLES (Cuantitativas y Cualitativas)      */
/* (Barras, Circular/Torta, Líneas)                                          */
/* -------------------------------------------------------------------------- */
interface SimpleChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  data: {
    variableValue: number | string;
    fa: number;
    p: number;
  }[];
}

export const SimpleBarVisualizer: React.FC<SimpleChartProps> = ({
  title,
  xLabel,
  yLabel,
  data,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dynamicYLabel = yLabel && yLabel !== 'Frecuencia Absoluta (fa)'
    ? yLabel
    : 'Cantidad de Casos Registrados';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 mt-6">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {chartType === 'bar' && 'Diagrama de Barras por Categoría / Valor'}
            {chartType === 'pie' && 'Distribución Porcentual (Torta %)'}
            {chartType === 'line' && 'Gráfico de Tendencia de Frecuencias'}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Barras</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('pie')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'pie'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Circular</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'line'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Líneas</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Gráfico */}
      <div className="h-72 sm:h-88 w-full min-h-[260px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {/* 1. BARRAS MULTICOLOR */}
            {chartType === 'bar' && (
              <BarChart 
                data={data} 
                margin={{ top: 15, right: 25, left: 15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="variableValue"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} casos`, 'Frecuencia Observada']}
                  labelFormatter={(lbl: any) => `Categoría: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="fa" 
                  name="Cantidad de Casos" 
                  radius={[6, 6, 0, 0]}
                >
                  {data.map((_, idx) => (
                    <Cell 
                      key={`bar-cell-${idx}`} 
                      fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}

            {/* 2. CIRCULAR (TORTA %) */}
            {chartType === 'pie' && (
              <PieChart>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.fa} casos)`,
                    'Porcentaje Relativo'
                  ]}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value: string) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                />
                <Pie
                  data={data}
                  dataKey="p"
                  nameKey="variableValue"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={35}
                  paddingAngle={3}
                  label={(props: any) => `${Number(props.percent ? props.percent * 100 : props.value || 0).toFixed(1)}%`}
                  labelLine={false}
                >
                  {data.map((_, idx) => (
                    <Cell 
                      key={`pie-simple-${idx}`} 
                      fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
              </PieChart>
            )}

            {/* 3. LÍNEAS */}
            {chartType === 'line' && (
              <LineChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="variableValue"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} casos`, 'Frecuencia Observada']}
                  labelFormatter={(lbl: any) => `Categoría: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="fa"
                  name="Frecuencia Observada"
                  stroke="#1B8A5A"
                  strokeWidth={3.5}
                  dot={{ r: 6, fill: '#1B8A5A', stroke: '#FFF', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400">Cargando gráfico...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Diagrama Estadístico</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. VISUALIZADOR DE CONTINGENCIA MULTI-TIPO                                 */
/* (Barras Agrupadas, Barras Apiladas)                                       */
/* -------------------------------------------------------------------------- */
interface ContingencyChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  categoriesX: string[];
  categoriesY: string[];
  chartData: any[];
}

export const ContingencyBarVisualizer: React.FC<ContingencyChartProps> = ({
  title,
  xLabel,
  yLabel,
  categoriesX,
  categoriesY,
  chartData,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dynamicYLabel = yLabel && yLabel !== 'Frecuencia Conjunta (fa)'
    ? yLabel
    : 'Cantidad de Casos Conjuntos';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 mt-6">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {chartMode === 'grouped'
              ? 'Distribución Conjunta: Barras Agrupadas por Categoría'
              : 'Distribución Acumulada: Barras Apiladas por Categoría'}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setChartMode('grouped')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartMode === 'grouped'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Barras Agrupadas</span>
          </button>

          <button
            type="button"
            onClick={() => setChartMode('stacked')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartMode === 'stacked'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2942] hover:bg-white/60'
            }`}
          >
            <StackIcon className="w-3.5 h-3.5" />
            <span>Barras Apiladas</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Gráfico */}
      <div className="h-72 sm:h-88 w-full min-h-[260px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="categoryX"
                tick={{ fontSize: 11, fill: '#475569' }}
                label={{
                  value: xLabel,
                  position: 'insideBottom',
                  offset: -15,
                  fill: '#0F2942',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                label={{
                  value: dynamicYLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: '#0F2942',
                  fontWeight: 700,
                  fontSize: 11,
                }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val: any, name: any) => [`${val} casos`, name]}
                contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '10px', fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value: string) => <span className="text-xs font-bold text-slate-700">{value}</span>}
              />

              {categoriesY.map((catY, idx) => (
                <Bar
                  key={catY}
                  dataKey={(row: any) => Number(row[catY] ?? row['col_' + idx] ?? 0)}
                  name={catY}
                  fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]}
                  stackId={chartMode === 'stacked' ? 'stack-a' : undefined}
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-400">Cargando gráfico bivariado...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Gráfico Bivariado</span>
      </div>
    </div>
  );
};
