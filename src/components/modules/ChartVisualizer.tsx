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

const CHART_COLORS = [
  '#1B8A5A', // Verde Seguridad
  '#0F2942', // Azul Marino
  '#E67E22', // Ámbar
  '#3B82F6', // Azul Eléctrico
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#14B8A6', // Turquesa
  '#F59E0B', // Amarillo
  '#6366F1', // Índigo
];

/* -------------------------------------------------------------------------- */
/* 1. VISUALIZADOR DE FRECUENCIAS AGRUPADAS MULTI-TIPO                        */
/* (Histograma, Polígono de Frecuencias, Circular/Torta, Ojiva Acumulada)    */
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
    Fa?: number;
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

  // Preparar datos para Ojiva (calculando acumulado si no viene)
  let runningFa = 0;
  const enrichedData = data.map((d) => {
    runningFa += d.fa;
    return {
      ...d,
      Fa: d.Fa !== undefined ? d.Fa : runningFa,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mt-6">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {chartType === 'histogram' && 'Histograma de Frecuencias por Intervalo de Clase'}
            {chartType === 'polygon' && 'Polígono de Frecuencias (Marcas de Clase)'}
            {chartType === 'pie' && 'Distribución Porcentual Relativa (Torta %)'}
            {chartType === 'ogive' && 'Ojiva de Frecuencias Absolutas Acumuladas (Fa)'}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setChartType('histogram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                margin={{ top: 15, right: 25, left: 15, bottom: 20 }}
                barCategoryGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="intervalLabel"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} observaciones`, 'Frecuencia Absoluta (fa)']}
                  labelFormatter={(lbl: any) => `Intervalo: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="fa" name="Frecuencia (fa)" fill="#1B8A5A" stroke="#0F2942" strokeWidth={1}>
                  {data.map((_, idx) => (
                    <Cell key={`hist-cell-${idx}`} fill={idx % 2 === 0 ? '#1B8A5A' : '#22A36B'} />
                  ))}
                </Bar>
              </BarChart>
            )}

            {/* 2. POLÍGONO DE FRECUENCIAS */}
            {chartType === 'polygon' && (
              <AreaChart
                data={data}
                margin={{ top: 15, right: 25, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="marcaDeClase"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: `Marca de Clase (Mc) [${xLabel}]`,
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} casos`, 'Frecuencia (fa)']}
                  labelFormatter={(lbl: any) => `Marca de Clase (Mc): ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="fa"
                  name="Frecuencia Absoluta (fa)"
                  stroke="#1B8A5A"
                  fill="#1B8A5A"
                  fillOpacity={0.25}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1B8A5A', stroke: '#FFF', strokeWidth: 2 }}
                />
              </AreaChart>
            )}

            {/* 3. GRÁFICO CIRCULAR (TORTA) */}
            {chartType === 'pie' && (
              <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${Number(val).toFixed(2)}% (${item.payload.fa} casos)`,
                    item.payload.intervalLabel,
                  ]}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  formatter={(val: any, entry: any) => (
                    <span className="text-xs text-slate-700 font-medium">
                      {entry.payload.intervalLabel} ({Number(entry.payload.p).toFixed(1)}%)
                    </span>
                  )}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Pie
                  data={data}
                  dataKey="p"
                  nameKey="intervalLabel"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={35}
                  paddingAngle={2}
                  label={(props: any) => `${Number(props.percent !== undefined ? props.percent * 100 : props.value || 0).toFixed(1)}%`}
                >
                  {data.map((_, idx) => (
                    <Cell key={`pie-cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}

            {/* 4. OJIVA (FRECUENCIAS ACUMULADAS) */}
            {chartType === 'ogive' && (
              <LineChart
                data={enrichedData}
                margin={{ top: 15, right: 25, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="intervalLabel"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: 'Frecuencia Acumulada (Fa)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} casos acumulados`, 'Frec. Acumulada (Fa)']}
                  labelFormatter={(lbl: any) => `Intervalo: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="Fa"
                  name="Frecuencia Acumulada (Fa)"
                  stroke="#E67E22"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#E67E22', stroke: '#FFF', strokeWidth: 2 }}
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

      {/* Pie Institucional Estricto */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Gráfico Interactivo</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. VISUALIZADOR DE FRECUENCIAS SIMPLES MULTI-TIPO                          */
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

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mt-6">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {chartType === 'bar' && 'Diagrama de Barras por Valor Individual'}
            {chartType === 'pie' && 'Distribución Porcentual (Torta %)'}
            {chartType === 'line' && 'Gráfico de Líneas de Frecuencias'}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            {/* 1. BARRAS */}
            {chartType === 'bar' && (
              <BarChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="variableValue"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} observaciones`, 'Frecuencia (fa)']}
                  labelFormatter={(lbl: any) => `Valor: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="fa" name="Frecuencia (fa)" fill="#0F2942" radius={[4, 4, 0, 0]}>
                  {data.map((_, idx) => (
                    <Cell key={`bar-cell-${idx}`} fill={idx % 2 === 0 ? '#0F2942' : '#1C4874'} />
                  ))}
                </Bar>
              </BarChart>
            )}

            {/* 2. CIRCULAR */}
            {chartType === 'pie' && (
              <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${Number(val).toFixed(2)}% (${item.payload.fa} casos)`,
                    `Valor ${item.payload.variableValue}`,
                  ]}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  formatter={(val: any, entry: any) => (
                    <span className="text-xs text-slate-700 font-medium">
                      {entry.payload.variableValue} ({Number(entry.payload.p).toFixed(1)}%)
                    </span>
                  )}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Pie
                  data={data}
                  dataKey="p"
                  nameKey="variableValue"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={35}
                  paddingAngle={2}
                  label={(props: any) => `${Number(props.percent !== undefined ? props.percent * 100 : props.value || 0).toFixed(1)}%`}
                >
                  {data.map((_, idx) => (
                    <Cell key={`simple-pie-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}

            {/* 3. LÍNEAS */}
            {chartType === 'line' && (
              <LineChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="variableValue"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: xLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    fill: '#0F2942',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} observaciones`, 'Frecuencia (fa)']}
                  labelFormatter={(lbl: any) => `Valor: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0F2942', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="fa"
                  name="Frecuencia (fa)"
                  stroke="#1B8A5A"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#1B8A5A', stroke: '#FFF', strokeWidth: 2 }}
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

      {/* Pie Institucional Estricto */}
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

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mt-6">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setChartMode('grouped')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            <BarChart data={chartData} margin={{ top: 15, right: 25, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="categoryX"
                tick={{ fontSize: 11, fill: '#475569' }}
                label={{
                  value: xLabel,
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#0F2942',
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                label={{
                  value: yLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: '#0F2942',
                  fontWeight: 600,
                  fontSize: 11,
                }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F2942',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
              {categoriesY.map((catY, idx) => (
                <Bar
                  key={catY}
                  dataKey={(row: any) => Number(row[catY] ?? row[`col_${idx}`] ?? 0)}
                  name={catY}
                  stackId={chartMode === 'stacked' ? 'a' : undefined}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
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

      {/* Pie Institucional Estricto */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Distribución de Frecuencias Bivariadas</span>
      </div>
    </div>
  );
};
