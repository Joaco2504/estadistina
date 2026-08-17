// src/components/modules/ChartVisualizer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface HistogramChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  data: {
    intervalLabel: string;
    marcaDeClase: number;
    fa: number;
    p: number;
  }[];
}

export const HistogramVisualizer: React.FC<HistogramChartProps> = ({
  title,
  xLabel,
  yLabel,
  data,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
      {/* Título Formal del Gráfico */}
      <div className="text-center mb-6">
        <h3 className="text-base sm:text-lg font-bold text-[#0F2942] tracking-wide uppercase">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Distribución de Frecuencias Absolutas por Intervalo de Clase
        </p>
      </div>

      {/* Contenedor del Gráfico con guardia de hidratación */}
      <div className="h-72 sm:h-96 w-full min-h-[280px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
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
                  fontWeight: 600,
                  fontSize: 12,
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
                  fontSize: 12,
                }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: any) => [
                  `${value} observaciones`,
                  'Frecuencia Absoluta (fa)',
                ]}
                labelFormatter={(label: any) => `Intervalo: ${label}`}
                contentStyle={{
                  backgroundColor: '#0F2942',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Bar
                dataKey="fa"
                name="Frecuencia Absoluta (fa)"
                fill="#1B8A5A"
                stroke="#0F2942"
                strokeWidth={1}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#1B8A5A' : '#22A36B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs text-slate-400 font-medium">Cargando histograma...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional Estricto */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">
          Fuente: Cátedra de Estadística - I.E.S. Belén
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Visualización de Frecuencias Agrupadas
        </span>
      </div>
    </div>
  );
};

interface SimpleBarChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  data: {
    variableValue: number | string;
    fa: number;
    p: number;
  }[];
}

export const SimpleBarVisualizer: React.FC<SimpleBarChartProps> = ({
  title,
  xLabel,
  yLabel,
  data,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
      {/* Título Formal */}
      <div className="text-center mb-6">
        <h3 className="text-base sm:text-lg font-bold text-[#0F2942] tracking-wide uppercase">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Diagrama de Frecuencias para Variable No Agrupada
        </p>
      </div>

      {/* Gráfico */}
      <div className="h-72 sm:h-96 w-full min-h-[280px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
              barCategoryGap={20}
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
                  fontWeight: 600,
                  fontSize: 12,
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
                  fontSize: 12,
                }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: any) => [
                  `${value} observaciones`,
                  'Frecuencia Absoluta (fa)',
                ]}
                labelFormatter={(label: any) => `Valor: ${label}`}
                contentStyle={{
                  backgroundColor: '#0F2942',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Bar
                dataKey="fa"
                name="Frecuencia Absoluta (fa)"
                fill="#0F2942"
                radius={[4, 4, 0, 0]}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-bar-${index}`}
                    fill={index % 2 === 0 ? '#0F2942' : '#1C4874'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs text-slate-400 font-medium">Cargando gráfico de barras...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional Estricto */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">
          Fuente: Cátedra de Estadística - I.E.S. Belén
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Diagrama de Barras Simples
        </span>
      </div>
    </div>
  );
};

interface ContingencyBarChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  categoriesX: string[];
  categoriesY: string[];
  chartData: any[];
}

export const ContingencyBarVisualizer: React.FC<ContingencyBarChartProps> = ({
  title,
  xLabel,
  yLabel,
  categoriesX,
  categoriesY,
  chartData,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const colors = ['#1B8A5A', '#E67E22', '#0F2942', '#3B82F6', '#9333EA', '#10B981'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
      {/* Título Formal */}
      <div className="text-center mb-6">
        <h3 className="text-base sm:text-lg font-bold text-[#0F2942] tracking-wide uppercase">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Distribución Bivariada Conjunta (Barras Agrupadas por Categoría)
        </p>
      </div>

      {/* Gráfico */}
      <div className="h-72 sm:h-96 w-full min-h-[280px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="categoryX"
                tick={{ fontSize: 11, fill: '#475569' }}
                label={{
                  value: xLabel,
                  position: 'insideBottom',
                  offset: -15,
                  fill: '#0F2942',
                  fontWeight: 600,
                  fontSize: 12,
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
                  fontSize: 12,
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
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              {categoriesY.map((catY, idx) => (
                <Bar
                  key={catY}
                  dataKey={(row: any) => Number(row[catY] ?? row[`col_${idx}`] ?? 0)}
                  name={catY}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <span className="text-xs text-slate-400 font-medium">Cargando gráfico bivariado...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional Estricto */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="italic font-medium">
          Fuente: Cátedra de Estadística - I.E.S. Belén
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Distribución de Frecuencias Bivariadas
        </span>
      </div>
    </div>
  );
};
