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
import { formatPercentage } from '@/lib/statistics';

// Paleta cromática luminosa, vibrante y de alto contraste
const DYNAMIC_CHART_COLORS = [
  '#1B8A5A', // Verde Seguridad Primario
  '#2563EB', // Azul Eléctrico
  '#E67E22', // Ámbar Alerta
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#06B6D4', // Cian
  '#F59E0B', // Amarillo Precaución
  '#10B981', // Verde Esmeralda
  '#6366F1', // Índigo
  '#F97316', // Naranja Industrial
  '#14B8A6', // Turquesa
  '#D946EF', // Magenta
];

/**
 * Tooltip personalizado de alto contraste para Gráfico Circular (Torta)
 */
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const categoryName = data.name || data.payload?.variableValue || data.payload?.intervalLabel || 'Categoría';
    const percent = formatPercentage(Number(data.value));
    const count = data.payload?.fa ?? data.payload?.frecuenciaAbsoluta ?? data.payload?.value ?? 0;
    const color = data.payload?.fill || data.color || '#1B8A5A';

    return (
      <div className="bg-[#0A1D30] text-white px-4 py-3 rounded-xl border border-[#1C4874] shadow-2xl text-xs space-y-1.5 min-w-[160px]">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-1.5">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="font-bold text-white text-xs leading-snug">{categoryName}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 font-mono">
          <span className="text-slate-300 text-[11px]">Porcentaje:</span>
          <span className="text-emerald-300 font-extrabold text-sm">{percent}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
          <span className="text-slate-400">Recuento exacto:</span>
          <span className="text-white font-bold">{count} casos</span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Tooltip personalizado de alto contraste para Histogramas, Barras y Líneas
 */
const CustomCartesianTooltip = ({ active, payload, label, isCumulative }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A1D30] text-white px-4 py-3 rounded-xl border border-[#1C4874] shadow-2xl text-xs space-y-1.5 min-w-[170px]">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 text-xs">
          {label}
        </p>
        {payload.map((item: any, idx: number) => {
          const itemColor = item.color || item.payload?.fill || '#1B8A5A';
          const val = typeof item.value === 'number' ? item.value : item.value;
          return (
            <div key={idx} className="flex items-center justify-between gap-3 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <span style={{ color: itemColor }}>●</span>
                {item.name || 'Frecuencia'}:
              </span>
              <span className="text-emerald-300 font-extrabold text-xs">
                {val} {isCumulative ? 'casos acumulados' : 'observaciones'}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

/**
 * Determina el título contextual del Eje Y según la variable, el individuo/unidad y el modo
 */
function getDescriptiveYLabel(variableName: string, unit: string, mode: 'absolute' | 'cumulative' | 'percentage'): string {
  if (mode === 'percentage') {
    return 'Porcentaje del total (%)';
  }
  if (mode === 'cumulative') {
    return 'Total acumulado de casos (Fa)';
  }

  const unitClean = (unit || '').trim();
  if (unitClean) {
    const lowerUnit = unitClean.toLowerCase();
    if (lowerUnit.startsWith('n°') || lowerUnit.startsWith('numero') || lowerUnit.startsWith('número') || lowerUnit.startsWith('cantidad')) {
      return unitClean;
    }
    if (lowerUnit.includes('trabajador') || lowerUnit.includes('operario') || lowerUnit.includes('persona') || lowerUnit.includes('padre') || lowerUnit.includes('alumno') || lowerUnit.includes('estudiante')) {
      return `Cantidad de ${unitClean}`;
    }
    if (lowerUnit.includes('caso') || lowerUnit.includes('accidente') || lowerUnit.includes('incidente') || lowerUnit.includes('lesion') || lowerUnit.includes('lesión')) {
      return `Número de ${unitClean}`;
    }
    if (lowerUnit.includes('medicion') || lowerUnit.includes('medición') || lowerUnit.includes('observac') || lowerUnit.includes('registro') || lowerUnit.includes('muestra')) {
      return `Número de ${unitClean}`;
    }
    if (lowerUnit.includes('dba') || lowerUnit.includes('lux') || lowerUnit.includes('ppm') || lowerUnit.includes('°c') || lowerUnit.includes('mg/m') || lowerUnit.includes('kg') || lowerUnit.includes('cm') || lowerUnit.includes('segundo') || lowerUnit.includes('días') || lowerUnit.includes('año')) {
      return `Número de mediciones (${unitClean})`;
    }
    return `Cantidad de ${unitClean}`;
  }

  const lower = (variableName || '').toLowerCase();
  if (lower.includes('trabajador') || lower.includes('operario') || lower.includes('ocupac') || lower.includes('personal')) {
    return 'Cantidad de trabajadores';
  }
  if (lower.includes('accidente') || lower.includes('incidente') || lower.includes('lesión') || lower.includes('lesion') || lower.includes('desvío')) {
    return 'Número de casos registrados';
  }
  if (lower.includes('ruido') || lower.includes('sonoro') || lower.includes('iluminac') || lower.includes('lux') || lower.includes('co') || lower.includes('tgbh') || lower.includes('polvo')) {
    return 'Número de mediciones observadas';
  }
  if (lower.includes('puesto') || lower.includes('área') || lower.includes('sector')) {
    return 'Cantidad de sectores / puestos';
  }
  if (lower.includes('epp') || lower.includes('equipo') || lower.includes('permiso')) {
    return 'Cantidad de elementos inspeccionados';
  }
  return 'Número de observaciones registradas';
}

function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    checkTheme();
    window.addEventListener('theme-change', checkTheme);
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('theme-change', checkTheme);
      observer.disconnect();
    };
  }, []);

  return isDark;
}

/* -------------------------------------------------------------------------- */
/* 1. VISUALIZADOR DE DATOS AGRUPADOS MULTI-TIPO                              */
/* (Histograma, Polígono, Circular/Torta, Ojiva)                              */
/* -------------------------------------------------------------------------- */
interface GroupedChartProps {
  title: string;
  variableName: string;
  unit: string;
  xLabel?: string;
  yLabel?: string;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number | null) => void;
  hoveredIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
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
  variableName,
  unit,
  xLabel,
  yLabel,
  selectedIndex,
  onSelectIndex,
  hoveredIndex,
  onHoverIndex,
  data,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<'histogram' | 'polygon' | 'pie' | 'ogive'>('histogram');
  const isDark = useIsDarkMode();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Eje X: Nombre claro de la variable y unidad obligatoria entre paréntesis
  const formattedXLabel = xLabel || (unit ? `${variableName} (${unit})` : variableName);
  
  // Eje Y: Lenguaje cotidiano y descriptivo
  const dynamicYLabel = yLabel || getDescriptiveYLabel(
    variableName,
    unit,
    chartType === 'ogive' ? 'cumulative' : chartType === 'pie' ? 'percentage' : 'absolute'
  );

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 mt-6 transition-all">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chartType === 'histogram' && `Histograma: Distribución de ${variableName}`}
            {chartType === 'polygon' && `Polígono de Frecuencias: Marcas de Clase Mc (${unit})`}
            {chartType === 'pie' && `Distribución Porcentual Relativa (%) de ${variableName}`}
            {chartType === 'ogive' && `Ojiva de Frecuencias Acumuladas`}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos con Scroll Horizontal */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131C2E] p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setChartType('histogram')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'histogram'
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                margin={{ top: 15, right: 25, left: 60, bottom: 25 }}
                barCategoryGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="intervalLabel"
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                    style: { textAnchor: 'middle' }
                  }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCartesianTooltip />} />
                <Bar dataKey="fa" name="Observaciones Registradas" stroke={isDark ? '#0F172A' : '#0F2942'} strokeWidth={1}>
                  {data.map((_, idx) => {
                    const isTarget = (selectedIndex != null && selectedIndex === (idx + 1)) || (hoveredIndex != null && hoveredIndex === (idx + 1));
                    const baseColor = DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length];
                    return (
                      <Cell 
                        key={`hist-cell-${idx}`} 
                        fill={isTarget ? '#F59E0B' : baseColor}
                        stroke={isTarget ? (isDark ? '#FDE68A' : '#78350F') : (isDark ? '#0F172A' : '#0F2942')}
                        strokeWidth={isTarget ? 3 : 1}
                        opacity={selectedIndex != null || hoveredIndex != null ? (isTarget ? 1 : 0.45) : 1}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => onHoverIndex && onHoverIndex(idx + 1)}
                        onMouseLeave={() => onHoverIndex && onHoverIndex(null)}
                        onClick={(e: any) => {
                          e?.stopPropagation?.();
                          onSelectIndex && onSelectIndex(selectedIndex === (idx + 1) ? null : idx + 1);
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}

            {/* 2. POLÍGONO DE FRECUENCIAS */}
            {chartType === 'polygon' && (
              <AreaChart
                data={data}
                margin={{ top: 15, right: 25, left: 60, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="polyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B8A5A" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#1B8A5A" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="marcaDeClase"
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: `Marca de Clase (Mc) [${unit ? `${variableName} (${unit})` : variableName}]`,
                    position: 'insideBottom',
                    offset: -15,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                    style: { textAnchor: 'middle' }
                  }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCartesianTooltip />} />
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

            {/* 3. GRÁFICO CIRCULAR (TORTA %) CON TOOLTIP CLARO Y TEXTO TOTALMENTE LEGIBLE */}
            {chartType === 'pie' && (
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value: string) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>}
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
                  label={(props: any) => formatPercentage(Number(props.value || 0))}
                  labelLine={true}
                >
                  {data.map((_, idx) => {
                    const isTarget = (selectedIndex != null && selectedIndex === (idx + 1)) || (hoveredIndex != null && hoveredIndex === (idx + 1));
                    return (
                      <Cell 
                        key={`pie-cell-${idx}`} 
                        fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]} 
                        stroke={isTarget ? '#F59E0B' : (isDark ? '#0F172A' : '#FFFFFF')}
                        strokeWidth={isTarget ? 3.5 : 2}
                        opacity={selectedIndex != null || hoveredIndex != null ? (isTarget ? 1 : 0.4) : 1}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => onHoverIndex && onHoverIndex(idx + 1)}
                        onMouseLeave={() => onHoverIndex && onHoverIndex(null)}
                        onClick={(e: any) => {
                          e?.stopPropagation?.();
                          onSelectIndex && onSelectIndex(selectedIndex === (idx + 1) ? null : idx + 1);
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            )}

            {/* 4. OJIVA (FRECUENCIAS ACUMULADAS) */}
            {chartType === 'ogive' && (
              <LineChart
                data={data}
                margin={{ top: 15, right: 25, left: 60, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="intervalLabel"
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: 'Total acumulado de casos (Fa)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                    style: { textAnchor: 'middle' }
                  }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCartesianTooltip isCumulative={true} />} />
                <Line
                  type="monotone"
                  dataKey="Fa"
                  name="Frecuencia Acumulada (Fa)"
                  stroke="#8B5CF6"
                  strokeWidth={3.5}
                  dot={{ r: 6, fill: '#8B5CF6', stroke: '#FFF', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-[#0A1322] rounded-xl">
            <span className="text-xs text-slate-400">Cargando gráfico estadístico...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Visualización Didáctica</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. VISUALIZADOR DE DATOS SIMPLES MULTI-TIPO                                */
/* (Barras Multicolor, Circular/Torta %, Líneas)                             */
/* -------------------------------------------------------------------------- */
interface SimpleChartProps {
  title: string;
  variableName: string;
  unit?: string;
  variableType?: 'quantitative' | 'qualitative';
  xLabel?: string;
  yLabel?: string;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number | null) => void;
  hoveredIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
  data: {
    variableValue: string | number;
    fa: number;
    p: number;
  }[];
}

export const SimpleBarVisualizer: React.FC<SimpleChartProps> = ({
  title,
  variableName,
  unit,
  variableType = 'quantitative',
  xLabel,
  yLabel,
  selectedIndex,
  onSelectIndex,
  hoveredIndex,
  onHoverIndex,
  data,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const isDark = useIsDarkMode();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isQualitative = variableType === 'qualitative';

  // Eje X: Si es cuantitativa, unidad obligatoria entre paréntesis. Si es cualitativa, solo el nombre.
  const formattedXLabel = xLabel || (
    isQualitative 
      ? variableName 
      : unit 
      ? `${variableName} (${unit})` 
      : variableName
  );

  // Eje Y: Título cotidiano y descriptivo
  const dynamicYLabel = yLabel || getDescriptiveYLabel(
    variableName,
    unit || '',
    chartType === 'pie' ? 'percentage' : 'absolute'
  );

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 mt-6 transition-all">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chartType === 'bar' && `Diagrama de Barras: ${formattedXLabel}`}
            {chartType === 'pie' && `Distribución Porcentual (%) de ${variableName}`}
            {chartType === 'line' && `Gráfico de Frecuencias de ${variableName}`}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131C2E] p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                margin={{ top: 15, right: 25, left: 60, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="variableValue"
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                    style: { textAnchor: 'middle' }
                  }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCartesianTooltip />} />
                <Bar 
                  dataKey="fa" 
                  name="Cantidad de Casos" 
                  radius={[6, 6, 0, 0]}
                >
                  {data.map((_, idx) => {
                    const isTarget = (selectedIndex != null && selectedIndex === (idx + 1)) || (hoveredIndex != null && hoveredIndex === (idx + 1));
                    const baseColor = DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length];
                    return (
                      <Cell 
                        key={`bar-cell-${idx}`} 
                        fill={isTarget ? '#F59E0B' : baseColor}
                        stroke={isTarget ? (isDark ? '#FDE68A' : '#78350F') : undefined}
                        strokeWidth={isTarget ? 3 : 0}
                        opacity={selectedIndex != null || hoveredIndex != null ? (isTarget ? 1 : 0.45) : 1}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => onHoverIndex && onHoverIndex(idx + 1)}
                        onMouseLeave={() => onHoverIndex && onHoverIndex(null)}
                        onClick={(e: any) => {
                          e?.stopPropagation?.();
                          onSelectIndex && onSelectIndex(selectedIndex === (idx + 1) ? null : idx + 1);
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}

            {/* 2. CIRCULAR (TORTA %) CON TOOLTIP CLARO Y TEXTO TOTALMENTE VISIBLE */}
            {chartType === 'pie' && (
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value: string) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>}
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
                  label={(props: any) => formatPercentage(Number(props.value || 0))}
                  labelLine={true}
                >
                  {data.map((_, idx) => {
                    const isTarget = (selectedIndex != null && selectedIndex === (idx + 1)) || (hoveredIndex != null && hoveredIndex === (idx + 1));
                    return (
                      <Cell 
                        key={`pie-simple-${idx}`} 
                        fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]} 
                        stroke={isTarget ? '#F59E0B' : (isDark ? '#0F172A' : '#FFFFFF')}
                        strokeWidth={isTarget ? 3.5 : 2}
                        opacity={selectedIndex != null || hoveredIndex != null ? (isTarget ? 1 : 0.4) : 1}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => onHoverIndex && onHoverIndex(idx + 1)}
                        onMouseLeave={() => onHoverIndex && onHoverIndex(null)}
                        onClick={(e: any) => {
                          e?.stopPropagation?.();
                          onSelectIndex && onSelectIndex(selectedIndex === (idx + 1) ? null : idx + 1);
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            )}


            {/* 3. LÍNEAS */}
            {chartType === 'line' && (
              <LineChart data={data} margin={{ top: 15, right: 25, left: 60, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="variableValue"
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -15,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: dynamicYLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: 11,
                    style: { textAnchor: 'middle' }
                  }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCartesianTooltip />} />
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
          <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-[#0A1322] rounded-xl">
            <span className="text-xs text-slate-400">Cargando gráfico...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
  variableX: string;
  variableY: string;
  xLabel?: string;
  yLabel?: string;
  categoriesX: string[];
  categoriesY: string[];
  chartData: any[];
}

export const ContingencyBarVisualizer: React.FC<ContingencyChartProps> = ({
  title,
  variableX,
  variableY,
  xLabel,
  yLabel,
  categoriesX,
  categoriesY,
  chartData,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const isDark = useIsDarkMode();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedXLabel = xLabel || variableX;
  const dynamicYLabel = yLabel || 'Número de casos observados';

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 mt-6 transition-all">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chartMode === 'grouped'
              ? `Distribución Conjunta: ${variableX} vs. ${variableY} (Barras Agrupadas)`
              : `Distribución Acumulada: ${variableX} vs. ${variableY} (Barras Apiladas)`}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131C2E] p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setChartMode('grouped')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              chartMode === 'grouped'
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
                ? 'bg-[#0F2942] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0F2942] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
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
            <BarChart data={chartData} margin={{ top: 15, right: 25, left: 60, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
              <XAxis
                dataKey="categoryX"
                tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                label={{
                  value: formattedXLabel,
                  position: 'insideBottom',
                  offset: -15,
                  fill: isDark ? '#F1F5F9' : '#0F2942',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#475569' }}
                label={{
                  value: dynamicYLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: isDark ? '#F1F5F9' : '#0F2942',
                  fontWeight: 700,
                  fontSize: 11,
                  style: { textAnchor: 'middle' }
                }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomCartesianTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value: string) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>}
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
          <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-[#0A1322] rounded-xl">
            <span className="text-xs text-slate-400">Cargando gráfico bivariado...</span>
          </div>
        )}
      </div>

      {/* Pie Institucional */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
        <span className="font-mono text-[11px] text-slate-400">Gráfico Bivariado</span>
      </div>
    </div>
  );
};
