// src/types/statistics.ts

/**
 * Representa un conjunto de datos en bruto y metadatos asociados
 */
export interface RawDataSet {
  id: string;
  variableName: string;
  unit?: string;
  description?: string;
  sampleSize: number; // n
  rawDataString: string; // Datos separados por ";"
  values: (number | string)[]; // Array numérico o cualitativo
  category?: 'hygiene' | 'safety' | 'environment' | 'general';
  variableType?: 'quantitative' | 'qualitative';
}

/**
 * Parámetros de configuración de intervalos ingresados o calculados
 */
export interface IntervalParameters {
  userProvided: boolean; // true si el alumno ingresó R, k, A manualmente
  xmin: number;
  xmax: number;
  rango: number; // R = xmax - xmin
  k: number; // Cantidad de intervalos: k = round(sqrt(n))
  amplitud: number; // A = R / k
  precision: number; // Decimales a redondear
}

/**
 * Fila individual de la Tabla de Frecuencias Agrupadas
 * Columnas: I, Mc, fa, fr, p, Fa, Fr, P
 */
export interface GroupedFrequencyRow {
  index: number;
  intervalLabel: string;
  limiteInferior?: number;
  limiteSuperior?: number;
  lowerBound?: number;
  upperBound?: number;
  isLastInterval?: boolean;
  marcaDeClase: number;
  frecuenciaAbsoluta: number;
  frecuenciaRelativa: number;
  porcentaje: number;
  frecuenciaAbsolutaAcumulada: number;
  frecuenciaRelativaAcumulada: number;
  porcentajeAcumulado: number;
  
  stepExplanations: {
    mc: string;
    fa?: string;
    fr: string;
    p: string;
    faAcum: string;
    frAcum: string;
    pAcum: string;
  };
}

/**
 * Fila individual de la Tabla de Frecuencias Simples (Cuantitativas o Cualitativas)
 */
export interface SimpleFrequencyRow {
  index: number;
  variableValue: number | string; // xi o Categoría
  frecuenciaAbsoluta: number; // fa
  frecuenciaRelativa: number; // fr = fa / n
  porcentaje: number; // p = fr * 100
  frecuenciaAbsolutaAcumulada: number; // Fa
  frecuenciaRelativaAcumulada: number; // Fr
  porcentajeAcumulado: number; // P = Fr * 100
  
  stepExplanations: {
    fa?: string;
    fr: string;
    p: string;
    faAcum: string;
    frAcum: string;
    pAcum: string;
  };
}

/**
 * Resultado completo del análisis de Frecuencias Agrupadas
 */
export interface GroupedFrequencyTableResult {
  variableName: string;
  unit: string;
  sampleSize: number; // n
  sortedValues: number[];
  groupedVariableType?: 'continuous' | 'discrete';
  parameters: IntervalParameters;
  rows: GroupedFrequencyRow[];
  totals: {
    totalFa: number;
    totalFr: number;
    totalP: number;
    label: string; // "Suma total" o "Total" (NO usar símbolo sigma)
  };
  stepByStepDerivation?: {
    rangoFormula: string;
    rangoValue: string;
    kFormula: string;
    kValue: string;
    amplitudFormula: string;
    amplitudValue: string;
  };
}

/**
 * Resultado completo del análisis de Frecuencias Simples
 */
export interface SimpleFrequencyTableResult {
  variableName: string;
  unit: string;
  sampleSize: number; // n
  variableType: 'quantitative' | 'qualitative';
  rows: SimpleFrequencyRow[];
  totals: {
    totalFa: number;
    totalFr: number;
    totalP: number;
    label: string; // "Suma total" / "Total" (sin sigma)
  };
}

/**
 * Celda bivariada para Tabla de Contingencia
 */
export interface ContingencyCell {
  rowCategory: string;
  colCategory: string;
  frecuenciaConjunta: number; // fa_ij
  frecuenciaRelativaConjunta: number; // fr_ij = fa_ij / n
  porcentajeConjunto: number; // p_ij = fr_ij * 100
}

/**
 * Estructura completa de Tabla de Contingencia (Bivariada)
 */
export interface ContingencyTableResult {
  variableX: string; // Variable de filas
  variableY: string; // Variable de columnas
  sampleSize: number; // Gran Total (n)
  rowCategories: string[];
  colCategories: string[];
  matrix: number[][]; // [rowIndex][colIndex] = fa_ij
  rowMarginalTotals: number[]; // "Total por fila"
  colMarginalTotals: number[]; // "Total por columna"
  grandTotal: number; // "Gran Total" = n
  
  didacticSteps: {
    step1SimpleFrequencies: {
      varXCounts: { category: string; count: number }[];
      varYCounts: { category: string; count: number }[];
    };
    step2JointFrequencies: string;
    step3RowMarginals: { category: string; calculation: string; total: number }[];
    step4ColMarginals: { category: string; calculation: string; total: number }[];
    step5GrandTotal: { calculation: string; total: number };
  };
}

/**
 * Preset temático de Higiene y Seguridad
 */
export interface SafetyDataPreset {
  id: string;
  title: string;
  category: string;
  variableName: string;
  unit: string;
  description: string;
  sampleSize: number;
  recommendedType: 'grouped' | 'simple' | 'contingency';
  variableType?: 'quantitative' | 'qualitative';
  groupedVariableType?: 'continuous' | 'discrete';
  dataGenerator: () => (number | string)[];
  bivariateDataGenerator?: () => { x: string; y: string }[];
  defaultXName?: string;
  defaultYName?: string;
}

export type SafetyPreset = SafetyDataPreset;

/**
 * Módulo de Apuntes de la Cátedra
 */
export interface ThematicTopic {
  title: string;
  summary: string;
  keyFormulas?: { name: string; formula: string; note: string }[];
}

export interface TheoreticalNote {
  title: string;
  fileName: string;
  fileSize: string;
  pages: number;
  summary: string;
  contentOutline: string[];
}

export interface PracticalGuide {
  title: string;
  tpNumber: string;
  fileName: string;
  fileSize: string;
  exercisesCount: number;
  summary: string;
  sampleExercises: { number: number; statement: string; dataSample: string }[];
}

export interface ThematicUnit {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  topics: ThematicTopic[];
  theoreticalNote: TheoreticalNote;
  practicalGuide: PracticalGuide;
}
