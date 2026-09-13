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
  type PieLabelRenderProps,
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
interface PieTooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: {
    variableValue?: string | number;
    intervalLabel?: string;
    fa?: number;
    frecuenciaAbsoluta?: number;
    value?: number;
    fill?: string;
  };
}

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: PieTooltipEntry[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const categoryName = data.name || data.payload?.variableValue || data.payload?.intervalLabel || 'Categoría';
    const percent = formatPercentage(Number(data.value));
    const count = data.payload?.fa ?? data.payload?.frecuenciaAbsoluta ?? data.payload?.value ?? 0;
    const color = data.payload?.fill || data.color || '#1B8A5A';

    return (
      <div className="bg-[#0A1D30]/95 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-[#1C4874] shadow-2xl text-xs space-y-1 max-w-[210px] pointer-events-none">
        <div className="flex items-center gap-2 border-b border-slate-700/80 pb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="font-bold text-white text-xs leading-snug truncate">{categoryName}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
          <span className="text-slate-300">Porcentaje:</span>
          <span className="text-emerald-300 font-extrabold text-xs">{percent}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
          <span className="text-slate-400">Recuento:</span>
          <span className="text-white font-bold">{count} casos</span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Tooltip personalizado de alto contraste para Histogramas, Barras y Líneas (Compacto y responsivo)
 */
interface CartesianTooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { fill?: string };
}

interface CartesianTooltipProps {
  active?: boolean;
  payload?: CartesianTooltipEntry[];
  label?: string | number;
  isCumulative?: boolean;
}

const CustomCartesianTooltip = ({ active, payload, label, isCumulative = false }: CartesianTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A1D30]/95 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-[#1C4874] shadow-2xl text-xs space-y-1 max-w-[230px] pointer-events-none">
        <p className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 text-xs truncate">
          {label}
        </p>
        <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
          {payload.map((item: CartesianTooltipEntry, idx: number) => {
            const itemColor = item.color || item.payload?.fill || '#1B8A5A';
            const val = item.value;
            return (
              <div key={idx} className="flex items-center justify-between gap-2.5 font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: itemColor }} />
                  <span className="truncate max-w-[110px]">{item.name || 'Frecuencia'}:</span>
                </span>
                <span className="text-emerald-300 font-extrabold text-xs flex-shrink-0">
                  {val} {isCumulative ? 'acum.' : 'casos'}
                </span>
              </div>
            );
          })}
        </div>
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

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/* -------------------------------------------------------------------------- */
/* Componentes compartidos por todos los visualizadores                        */
/* (Selector de tipo de gráfico y pie institucional: fuente única de verdad)  */
/* -------------------------------------------------------------------------- */
interface ChartTabOption<T extends string> {
  value: T;
  label: string;
  title: string;
  icon: React.ReactNode;
}

function ChartTypeTabs<T extends string>({
  options,
  active,
  onChange,
}: {
  options: ChartTabOption<T>[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#131C2E] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`stat-chart-btn group ${active === opt.value ? 'is-active' : ''}`}
          title={opt.title}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function ChartFooter({ tag }: { tag: string }) {
  return (
    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
      <span className="italic font-medium">Fuente: Cátedra de Estadística - I.E.S. Belén</span>
      <span className="font-mono text-[11px] text-slate-400">{tag}</span>
    </div>
  );
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
  const [chartType, setChartType] = useState<'histogram' | 'polygon' | 'ogive'>('histogram');
  const isDark = useIsDarkMode();
  const isMobile = useIsMobile();

  // Eje X: Nombre claro de la variable y unidad obligatoria entre paréntesis
  const formattedXLabel = xLabel || (unit ? `${variableName} (${unit})` : variableName);
  
  // Eje Y: Lenguaje cotidiano y descriptivo
  const dynamicYLabel = yLabel || getDescriptiveYLabel(
    variableName,
    unit,
    chartType === 'ogive' ? 'cumulative' : 'absolute'
  );

  const cartesianMargin = isMobile
    ? { top: 10, right: 10, left: -15, bottom: 25 }
    : { top: 15, right: 25, left: 50, bottom: 25 };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-3.5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 mt-6 transition-all">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F2942] dark:text-slate-100 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chartType === 'histogram' && `Histograma: Distribución de ${variableName}`}
            {chartType === 'polygon' && `Polígono de Frecuencias: Marcas de Clase Mc (${unit})`}
            {chartType === 'ogive' && `Ojiva de Frecuencias Acumuladas`}
          </p>
        </div>

        {/* Selector de Pestañas de Gráficos con Scroll Horizontal */}
        <ChartTypeTabs
          active={chartType}
          onChange={setChartType}
          options={[
            { value: 'histogram', label: 'Histograma', title: 'Histograma de Barras Continuas', icon: <BarChart2 className="w-3.5 h-3.5 chart-btn-icon" /> },
            { value: 'polygon', label: 'Polígono', title: 'Polígono de Frecuencias', icon: <TrendingUp className="w-3.5 h-3.5 chart-btn-icon" /> },
            { value: 'ogive', label: 'Ojiva (Fa)', title: 'Ojiva de Frecuencias Acumuladas', icon: <Activity className="w-3.5 h-3.5 chart-btn-icon" /> },
          ]}
        />
      </div>

      {/* Indicador de Eje Y en móviles para ganar ancho útil */}
      <div className="sm:hidden flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>{dynamicYLabel}</span>
      </div>

      {/* Área del Gráfico Renderizado */}
      <div className="h-80 sm:h-[22rem] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
            {/* 1. HISTOGRAMA */}
            {chartType === 'histogram' && (
              <BarChart
                data={data}
                margin={cartesianMargin}
                barCategoryGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="intervalLabel"
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: isMobile ? 10 : 11,
                  }}
                />
                <YAxis
                  width={isMobile ? 35 : 55}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={isMobile ? undefined : {
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
                <Tooltip content={<CustomCartesianTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
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
                        onMouseEnter={() => onHoverIndex?.(idx + 1)}
                        onMouseLeave={() => onHoverIndex?.(null)}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onSelectIndex?.(selectedIndex === (idx + 1) ? null : idx + 1);
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
                margin={cartesianMargin}
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
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: `Mc [${unit ? `${variableName} (${unit})` : variableName}]`,
                    position: 'insideBottom',
                    offset: -12,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: isMobile ? 10 : 11,
                  }}
                />
                <YAxis
                  width={isMobile ? 35 : 55}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={isMobile ? undefined : {
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
                <Tooltip content={<CustomCartesianTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
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

            {/* 4. OJIVA (FRECUENCIAS ACUMULADAS) */}
            {chartType === 'ogive' && (
              <LineChart
                data={data}
                margin={cartesianMargin}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="intervalLabel"
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: isMobile ? 10 : 11,
                  }}
                />
                <YAxis
                  width={isMobile ? 35 : 55}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={isMobile ? undefined : {
                    value: 'Total acumulado (Fa)',
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
                <Tooltip content={<CustomCartesianTooltip isCumulative={true} />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
                <Line
                  type="monotone"
                  dataKey="Fa"
                  name="Frecuencia Acumulada (Fa)"
                  stroke="#8B5CF6"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#8B5CF6', stroke: '#FFF', strokeWidth: 2 }}
                />
              </LineChart>
            )}
        </ResponsiveContainer>
      </div>

      {/* Pie Institucional */}
      <ChartFooter tag="Visualización Didáctica" />
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
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const isDark = useIsDarkMode();
  const isMobile = useIsMobile();

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

  const cartesianMargin = isMobile
    ? { top: 10, right: 10, left: -15, bottom: 25 }
    : { top: 15, right: 25, left: 50, bottom: 25 };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-3.5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 mt-6 transition-all">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
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
        <ChartTypeTabs
          active={chartType}
          onChange={setChartType}
          options={[
            { value: 'bar', label: 'Barras', title: 'Diagrama de Barras', icon: <BarChart2 className="w-3.5 h-3.5 chart-btn-icon" /> },
            { value: 'pie', label: 'Circular', title: 'Gráfico Circular de Porcentajes', icon: <PieIcon className="w-3.5 h-3.5 chart-btn-icon" /> },
            { value: 'line', label: 'Líneas', title: 'Gráfico de Líneas de Frecuencias', icon: <TrendingUp className="w-3.5 h-3.5 chart-btn-icon" /> },
          ]}
        />
      </div>

      {/* Indicador de Eje Y en móviles para ganar ancho útil */}
      {chartType !== 'pie' && (
        <div className="sm:hidden flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{dynamicYLabel}</span>
        </div>
      )}

      {/* Contenedor del Gráfico */}
      <div className="h-80 sm:h-[22rem] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
            {/* 1. BARRAS MULTICOLOR */}
            {chartType === 'bar' && (
              <BarChart 
                data={data} 
                margin={cartesianMargin}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="variableValue"
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: isMobile ? 10 : 11,
                  }}
                />
                <YAxis
                  width={isMobile ? 35 : 55}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={isMobile ? undefined : {
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
                <Tooltip content={<CustomCartesianTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
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
                        onMouseEnter={() => onHoverIndex?.(idx + 1)}
                        onMouseLeave={() => onHoverIndex?.(null)}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onSelectIndex?.(selectedIndex === (idx + 1) ? null : idx + 1);
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
                <Tooltip content={<CustomPieTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
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
                  outerRadius={isMobile ? 70 : 95}
                  innerRadius={isMobile ? 25 : 35}
                  paddingAngle={3}
                  label={(props: PieLabelRenderProps) => formatPercentage(Number(props.value || 0))}
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
                        onMouseEnter={() => onHoverIndex?.(idx + 1)}
                        onMouseLeave={() => onHoverIndex?.(null)}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onSelectIndex?.(selectedIndex === (idx + 1) ? null : idx + 1);
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            )}


            {/* 3. LÍNEAS */}
            {chartType === 'line' && (
              <LineChart data={data} margin={cartesianMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="variableValue"
                  interval={0}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={{
                    value: formattedXLabel,
                    position: 'insideBottom',
                    offset: -12,
                    fill: isDark ? '#F1F5F9' : '#0F2942',
                    fontWeight: 700,
                    fontSize: isMobile ? 10 : 11,
                  }}
                />
                <YAxis
                  width={isMobile ? 35 : 55}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                  label={isMobile ? undefined : {
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
                <Tooltip content={<CustomCartesianTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
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
      </div>

      {/* Pie Institucional */}
      <ChartFooter tag="Diagrama Estadístico" />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. VISUALIZADOR DE CONTINGENCIA MULTI-TIPO                                 */
/* (Barras Agrupadas, Barras Apiladas)                                       */
/* -------------------------------------------------------------------------- */
interface ContingencyChartDatum {
  categoryX: string;
  [key: string]: string | number;
}

interface ContingencyChartProps {
  title: string;
  variableX: string;
  variableY: string;
  xLabel?: string;
  yLabel?: string;
  categoriesY: string[];
  chartData: ContingencyChartDatum[];
}

export const ContingencyBarVisualizer: React.FC<ContingencyChartProps> = ({
  title,
  variableX,
  variableY,
  xLabel,
  yLabel,
  categoriesY,
  chartData,
}) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const isDark = useIsDarkMode();
  const isMobile = useIsMobile();

  const formattedXLabel = xLabel || variableX;
  const dynamicYLabel = yLabel || 'Número de casos observados';

  const cartesianMargin = isMobile
    ? { top: 10, right: 10, left: -15, bottom: 25 }
    : { top: 15, right: 25, left: 50, bottom: 25 };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-3.5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 mt-6 transition-all">
      {/* Barra de Control de Tipo de Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
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
        <ChartTypeTabs
          active={chartMode}
          onChange={setChartMode}
          options={[
            { value: 'grouped', label: 'Barras Agrupadas', title: 'Distribución Conjunta en Barras Agrupadas', icon: <BarChart2 className="w-3.5 h-3.5 chart-btn-icon" /> },
            { value: 'stacked', label: 'Barras Apiladas', title: 'Distribución en Barras Apiladas', icon: <StackIcon className="w-3.5 h-3.5 chart-btn-icon" /> },
          ]}
        />
      </div>

      {/* Leyenda HTML superior interactiva/responsiva que nunca colisiona con el gráfico SVG */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 mb-2.5 px-1 select-none">
        {categoriesY.map((catY, idx) => (
          <div key={catY} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span
              className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
              style={{ backgroundColor: DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length] }}
            />
            <span>{catY}</span>
          </div>
        ))}
      </div>

      {/* Indicador de Eje Y en móviles para ganar ancho útil */}
      <div className="sm:hidden flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>{dynamicYLabel}</span>
      </div>

      {/* Contenedor del Gráfico */}
      <div className="h-80 sm:h-[22rem] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={cartesianMargin}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
              <XAxis
                dataKey="categoryX"
                interval={0}
                tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                label={{
                  value: formattedXLabel,
                  position: 'insideBottom',
                  offset: -12,
                  fill: isDark ? '#F1F5F9' : '#0F2942',
                  fontWeight: 700,
                  fontSize: isMobile ? 10 : 11,
                }}
              />
              <YAxis
                width={isMobile ? 35 : 55}
                tick={{ fontSize: isMobile ? 10 : 11, fill: isDark ? '#94A3B8' : '#475569' }}
                label={isMobile ? undefined : {
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
              <Tooltip content={<CustomCartesianTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />

              {categoriesY.map((catY, idx) => (
                <Bar
                  key={catY}
                  dataKey={(row: ContingencyChartDatum) => Number(row[catY] ?? 0)}
                  name={catY}
                  fill={DYNAMIC_CHART_COLORS[idx % DYNAMIC_CHART_COLORS.length]}
                  stackId={chartMode === 'stacked' ? 'stack-a' : undefined}
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                />
              ))}
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Institucional */}
      <ChartFooter tag="Gráfico Bivariado" />
    </div>
  );
};
