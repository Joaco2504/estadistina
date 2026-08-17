// src/lib/statistics.ts
import { 
  GroupedFrequencyRow, 
  GroupedFrequencyTableResult, 
  SimpleFrequencyRow, 
  SimpleFrequencyTableResult, 
  ContingencyTableResult,
  SafetyPreset,
  ThematicUnit
} from '@/types/statistics';

/**
 * Redondeo matemático seguro a N decimales
 */
export function roundTo(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Parsea un string de datos en bruto separados por punto y coma (;), comas o espacios.
 */
export function parseRawDataString(input: string): number[] {
  if (!input || !input.trim()) return [];

  // Soporta separadores: punto y coma, comas seguidas de espacios, saltos de línea o tabulaciones
  const tokens = input
    .replace(/;/g, ' ')
    .replace(/,/g, '.') // Convertir coma decimal a punto
    .split(/[\s\n\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const numbers: number[] = [];
  for (const token of tokens) {
    const num = parseFloat(token);
    if (!isNaN(num) && isFinite(num)) {
      numbers.push(num);
    }
  }

  return numbers;
}

/**
 * Calcula los parámetros didácticos previos para datos agrupados:
 * - R = Xmax - Xmin
 * - k = round(sqrt(n)) o ceil(sqrt(n))
 * - A = R / k
 */
export function calculateIntervalParameters(
  sortedValues: number[],
  customParams?: { rango?: number; k?: number; amplitud?: number },
  kRoundingMode: 'nearest' | 'ceil' = 'nearest'
): {
  userProvided: boolean;
  xmin: number;
  xmax: number;
  rango: number;
  k: number;
  amplitud: number;
  precision: number;
  kCalculatedRaw: number;
} {
  const n = sortedValues.length;
  if (n === 0) {
    return {
      userProvided: false,
      xmin: 0,
      xmax: 0,
      rango: 0,
      k: 1,
      amplitud: 1,
      precision: 2,
      kCalculatedRaw: 1,
    };
  }

  const xmin = sortedValues[0];
  const xmax = sortedValues[sortedValues.length - 1];
  const naturalRango = roundTo(xmax - xmin, 2);
  const sqrtN = Math.sqrt(n);

  if (
    customParams &&
    customParams.rango !== undefined &&
    customParams.k !== undefined &&
    customParams.amplitud !== undefined &&
    customParams.k > 0 &&
    customParams.amplitud > 0
  ) {
    return {
      userProvided: true,
      xmin,
      xmax,
      rango: customParams.rango,
      k: customParams.k,
      amplitud: customParams.amplitud,
      precision: 2,
      kCalculatedRaw: sqrtN,
    };
  }

  // REGLA DE LA RAÍZ CUADRADA: k = round(sqrt(n)) o ceil(sqrt(n))
  const kCalculado = kRoundingMode === 'ceil' 
    ? Math.max(1, Math.ceil(sqrtN))
    : Math.max(1, Math.round(sqrtN));
  
  // Amplitud: A = R / k
  let rawAmplitud = naturalRango / kCalculado;
  if (rawAmplitud === 0) rawAmplitud = 1;
  
  const amplitudCalculada = roundTo(rawAmplitud, 2) || 1;

  return {
    userProvided: false,
    xmin,
    xmax,
    rango: naturalRango,
    k: kCalculado,
    amplitud: amplitudCalculada,
    precision: 2,
    kCalculatedRaw: sqrtN,
  };
}

/**
 * MÓDULO 1: Generación de Tabla de Frecuencias Agrupadas
 * Columnas: I, Mc, fa, fr, p, Fa, Fr, P
 */
export function generateGroupedFrequencyTable(
  variableName: string,
  unit: string,
  rawValues: number[],
  customParams?: { rango?: number; k?: number; amplitud?: number },
  kRoundingMode: 'nearest' | 'ceil' = 'nearest'
): GroupedFrequencyTableResult {
  const sortedValues = [...rawValues].sort((a, b) => a - b);
  const n = sortedValues.length;

  if (n === 0) {
    throw new Error('El conjunto de datos no puede estar vacío.');
  }

  const params = calculateIntervalParameters(sortedValues, customParams, kRoundingMode);
  const rows: GroupedFrequencyRow[] = [];

  let accumulatedFa = 0;
  let accumulatedFr = 0;
  let accumulatedP = 0;

  let currentLower = params.xmin;

  for (let i = 1; i <= params.k; i++) {
    const isLast = i === params.k;
    const lower = roundTo(currentLower, params.precision);
    const upper = roundTo(lower + params.amplitud, params.precision);

    // Marca de clase: Mc = (Li + Ls) / 2
    const mc = roundTo((lower + upper) / 2, params.precision + 1);

    // Conteo de frecuencia absoluta
    let fa = 0;
    for (const val of sortedValues) {
      if (isLast) {
        if (val >= lower && val <= upper + 0.00001) fa++;
      } else {
        if (val >= lower && val < upper) fa++;
      }
    }

    // Frecuencia relativa: fr = fa / n
    const fr = roundTo(fa / n, 4);
    // Porcentaje: p = fr * 100
    const p = roundTo(fr * 100, 2);

    // Acumulados
    accumulatedFa += fa;
    accumulatedFr = roundTo(accumulatedFa / n, 4);
    accumulatedP = roundTo(accumulatedFr * 100, 2);

    const intervalLabel = isLast
      ? `[${lower} - ${upper}]`
      : `[${lower} - ${upper})`;

    // Fórmulas pedagógicas individuales para el paso a paso
    const stepExplanations = {
      mc: `Mc_${i} = \\frac{${lower} + ${upper}}{2} = ${mc}`,
      fr: `fr_${i} = \\frac{fa_${i}}{n} = \\frac{${fa}}{${n}} = ${fr.toFixed(4)}`,
      p: `p_${i} = fr_${i} \\cdot 100 = ${fr.toFixed(4)} \\cdot 100 = ${p.toFixed(2)}\\%`,
      faAcum: i === 1 
        ? `Fa_1 = fa_1 = ${fa}`
        : `Fa_${i} = Fa_${i-1} + fa_${i} = ${accumulatedFa - fa} + ${fa} = ${accumulatedFa}`,
      frAcum: i === 1
        ? `Fr_1 = fr_1 = ${fr.toFixed(4)}`
        : `Fr_${i} = Fr_${i-1} + fr_${i} = ${(accumulatedFr - fr).toFixed(4)} + ${fr.toFixed(4)} = ${accumulatedFr.toFixed(4)}`,
      pAcum: i === 1
        ? `P_1 = p_1 = ${p.toFixed(2)}\\%`
        : `P_${i} = P_${i-1} + p_${i} = ${(accumulatedP - p).toFixed(2)}\\% + ${p.toFixed(2)}\\% = ${accumulatedP.toFixed(2)}\\%`,
    };

    rows.push({
      index: i,
      limiteInferior: lower,
      limiteSuperior: upper,
      intervalLabel,
      isLastInterval: isLast,
      marcaDeClase: mc,
      frecuenciaAbsoluta: fa,
      frecuenciaRelativa: fr,
      porcentaje: p,
      frecuenciaAbsolutaAcumulada: accumulatedFa,
      frecuenciaRelativaAcumulada: accumulatedFr,
      porcentajeAcumulado: accumulatedP,
      stepExplanations,
    });

    currentLower = upper;
  }

  // Suma total sin usar el símbolo sigma
  let totalFa = 0;
  let totalFr = 0;
  let totalP = 0;

  for (const r of rows) {
    totalFa += r.frecuenciaAbsoluta;
    totalFr += r.frecuenciaRelativa;
    totalP += r.porcentaje;
  }

  const sqrtVal = Math.sqrt(n);
  const kNearest = Math.round(sqrtVal);
  const kCeil = Math.ceil(sqrtVal);

  const stepByStepDerivation = !params.userProvided
    ? {
        rangoFormula: `R = X_{max} - X_{min}`,
        rangoValue: `R = ${params.xmax} - ${params.xmin} = ${params.rango}`,
        kFormula: `k = \\sqrt{n}`,
        kValue: `k = \\sqrt{${n}} \\approx ${sqrtVal.toFixed(2)} \\rightarrow k = ${params.k} (Redondeo: ${kNearest === kCeil ? `${params.k}` : `más próximo = ${kNearest}, superior = ${kCeil}`})`,
        amplitudFormula: `A = \\frac{R}{k}`,
        amplitudValue: `A = \\frac{${params.rango}}{${params.k}} = ${(params.rango / params.k).toFixed(4)} \\approx ${params.amplitud}`,
      }
    : undefined;

  return {
    variableName,
    unit,
    sampleSize: n,
    sortedValues,
    parameters: params,
    rows,
    totals: {
      totalFa: totalFa,
      totalFr: roundTo(totalFr, 4),
      totalP: roundTo(totalP, 2),
      label: 'Suma total', // Estricto: sin símbolo sigma
    },
    stepByStepDerivation,
  };
}

/**
 * MÓDULO 2: Generación de Tabla de Frecuencias Simples
 */
export function generateSimpleFrequencyTable(
  variableName: string,
  unit: string,
  rawValues: number[]
): SimpleFrequencyTableResult {
  const sortedValues = [...rawValues].sort((a, b) => a - b);
  const n = sortedValues.length;

  if (n === 0) {
    throw new Error('El conjunto de datos no puede estar vacío.');
  }

  const frequencyMap = new Map<number, number>();
  for (const val of sortedValues) {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  }

  const uniqueValues = Array.from(frequencyMap.keys()).sort((a, b) => a - b);
  const rows: SimpleFrequencyRow[] = [];

  let accumulatedFa = 0;
  let accumulatedFr = 0;
  let accumulatedP = 0;
  let index = 1;

  for (const val of uniqueValues) {
    const fa = frequencyMap.get(val) || 0;
    const fr = roundTo(fa / n, 4);
    const p = roundTo(fr * 100, 2);

    accumulatedFa += fa;
    accumulatedFr = roundTo(accumulatedFa / n, 4);
    accumulatedP = roundTo(accumulatedFr * 100, 2);

    const stepExplanations = {
      fr: `fr_${index} = \\frac{fa_${index}}{n} = \\frac{${fa}}{${n}} = ${fr.toFixed(4)}`,
      p: `p_${index} = fr_${index} \\cdot 100 = ${fr.toFixed(4)} \\cdot 100 = ${p.toFixed(2)}\\%`,
      faAcum: index === 1
        ? `Fa_1 = fa_1 = ${fa}`
        : `Fa_${index} = Fa_${index-1} + fa_${index} = ${accumulatedFa - fa} + ${fa} = ${accumulatedFa}`,
      frAcum: index === 1
        ? `Fr_1 = fr_1 = ${fr.toFixed(4)}`
        : `Fr_${index} = Fr_${index-1} + fr_${index} = ${(accumulatedFr - fr).toFixed(4)} + ${fr.toFixed(4)} = ${accumulatedFr.toFixed(4)}`,
      pAcum: index === 1
        ? `P_1 = p_1 = ${p.toFixed(2)}\\%`
        : `P_${index} = P_${index-1} + p_${index} = ${(accumulatedP - p).toFixed(2)}\\% + ${p.toFixed(2)}\\% = ${accumulatedP.toFixed(2)}\\%`,
    };

    rows.push({
      index,
      variableValue: val,
      frecuenciaAbsoluta: fa,
      frecuenciaRelativa: fr,
      porcentaje: p,
      frecuenciaAbsolutaAcumulada: accumulatedFa,
      frecuenciaRelativaAcumulada: accumulatedFr,
      porcentajeAcumulado: accumulatedP,
      stepExplanations,
    });

    index++;
  }

  let totalFa = 0;
  let totalFr = 0;
  let totalP = 0;

  for (const r of rows) {
    totalFa += r.frecuenciaAbsoluta;
    totalFr += r.frecuenciaRelativa;
    totalP += r.porcentaje;
  }

  return {
    variableName,
    unit,
    sampleSize: n,
    rows,
    totals: {
      totalFa: totalFa,
      totalFr: roundTo(totalFr, 4),
      totalP: roundTo(totalP, 2),
      label: 'Suma total', // Estricto: sin símbolo sigma
    },
  };
}

/**
 * MÓDULO 3: Generación de Tabla de Contingencia (Bivariada)
 */
export function generateContingencyTable(
  variableX: string,
  variableY: string,
  dataPairs: { x: string; y: string }[]
): ContingencyTableResult {
  const n = dataPairs.length;
  if (n === 0) {
    throw new Error('El conjunto de datos bivariados no puede estar vacío.');
  }

  const rowCategoriesSet = new Set<string>();
  const colCategoriesSet = new Set<string>();

  for (const pair of dataPairs) {
    rowCategoriesSet.add(pair.x.trim());
    colCategoriesSet.add(pair.y.trim());
  }

  const rowCategories = Array.from(rowCategoriesSet);
  const colCategories = Array.from(colCategoriesSet);

  const matrix: number[][] = rowCategories.map(() => 
    colCategories.map(() => 0)
  );

  const varXCountsMap = new Map<string, number>();
  const varYCountsMap = new Map<string, number>();

  for (const r of rowCategories) varXCountsMap.set(r, 0);
  for (const c of colCategories) varYCountsMap.set(c, 0);

  for (const pair of dataPairs) {
    const rIdx = rowCategories.indexOf(pair.x.trim());
    const cIdx = colCategories.indexOf(pair.y.trim());
    if (rIdx >= 0 && cIdx >= 0) {
      matrix[rIdx][cIdx]++;
      varXCountsMap.set(pair.x.trim(), (varXCountsMap.get(pair.x.trim()) || 0) + 1);
      varYCountsMap.set(pair.y.trim(), (varYCountsMap.get(pair.y.trim()) || 0) + 1);
    }
  }

  const rowMarginalTotals: number[] = matrix.map((row) => 
    row.reduce((acc, curr) => acc + curr, 0)
  );

  const colMarginalTotals: number[] = colCategories.map((_, cIdx) => 
    matrix.reduce((acc, row) => acc + row[cIdx], 0)
  );

  const grandTotal = rowMarginalTotals.reduce((acc, val) => acc + val, 0);

  const didacticSteps = {
    step1SimpleFrequencies: {
      varXCounts: rowCategories.map(cat => ({ category: cat, count: varXCountsMap.get(cat) || 0 })),
      varYCounts: colCategories.map(cat => ({ category: cat, count: varYCountsMap.get(cat) || 0 })),
    },
    step2JointFrequencies: 'Cada celda central fa_{ij} representa la cantidad simultánea de elementos que cumplen la condición de la fila i y de la columna j al mismo tiempo.',
    step3RowMarginals: rowCategories.map((cat, rIdx) => ({
      category: cat,
      calculation: matrix[rIdx].join(' + '),
      total: rowMarginalTotals[rIdx],
    })),
    step4ColMarginals: colCategories.map((cat, cIdx) => ({
      category: cat,
      calculation: matrix.map(r => r[cIdx]).join(' + '),
      total: colMarginalTotals[cIdx],
    })),
    step5GrandTotal: {
      calculation: rowMarginalTotals.join(' + ') + ' = ' + colMarginalTotals.join(' + '),
      total: grandTotal,
    },
  };

  return {
    variableX,
    variableY,
    sampleSize: grandTotal,
    rowCategories,
    colCategories,
    matrix,
    rowMarginalTotals,
    colMarginalTotals,
    grandTotal,
    didacticSteps,
  };
}

/**
 * 16 CASOS PRÁCTICOS DE HIGIENE, SEGURIDAD Y MEDIO AMBIENTE
 */
export const SAFETY_PRESETS: SafetyPreset[] = [
  // --- FRECUENCIAS AGRUPADAS ---
  {
    id: 'ruido-db',
    title: 'Niveles de Ruido en Taller Metalúrgico',
    category: 'Higiene Industrial',
    variableName: 'Nivel Sonoro Continuo Equivalente',
    unit: 'dBA',
    description: 'Mediciones de exposición sonora ocupacional con sonómetro integrador para contrastar con el límite legal de 85 dBA (Res. 295/03 Anexo V).',
    sampleSize: 25,
    recommendedType: 'grouped',
    dataGenerator: () => [
      78.4, 82.1, 85.6, 88.0, 91.2, 84.3, 79.8, 87.5, 92.4, 86.1,
      83.7, 89.9, 94.2, 81.0, 88.6, 90.5, 85.0, 77.9, 83.2, 87.1,
      93.5, 86.8, 80.5, 89.1, 95.0
    ],
  },
  {
    id: 'edades-operarios',
    title: 'Edades de Trabajadores en Obras',
    category: 'Ergonomía y Salud',
    variableName: 'Edad del Personal Operativo',
    unit: 'Años',
    description: 'Registro etario de operarios de estiba y montaje para evaluación ergonómica (Criterio ISO 11228).',
    sampleSize: 30,
    recommendedType: 'grouped',
    dataGenerator: () => [
      21, 24, 28, 35, 42, 47, 53, 22, 31, 38, 
      45, 50, 58, 26, 34, 41, 49, 23, 29, 36, 
      44, 52, 25, 33, 40, 48, 55, 27, 37, 46
    ],
  },
  {
    id: 'iluminacion-lux',
    title: 'Nivel de Iluminación en Ensamble',
    category: 'Higiene Industrial',
    variableName: 'Iluminancia en Plano de Trabajo',
    unit: 'Lux',
    description: 'Mediciones de iluminancia con luxómetro calibrado en puestos de control de calidad.',
    sampleSize: 24,
    recommendedType: 'grouped',
    dataGenerator: () => [
      240, 310, 450, 180, 520, 490, 380, 600, 
      290, 340, 410, 480, 530, 220, 360, 420, 
      510, 580, 300, 370, 440, 500, 270, 460
    ],
  },
  {
    id: 'co-mineria',
    title: 'Monóxido de Carbono en Minería',
    category: 'Toxicología y Ventilación',
    variableName: 'Concentración de CO en Galerías',
    unit: 'ppm',
    description: 'Monitoreo ambiental de gas tóxico en interior de mina (Límite CMP: 25 ppm).',
    sampleSize: 28,
    recommendedType: 'grouped',
    dataGenerator: () => [
      8.5, 12.0, 15.4, 22.1, 27.5, 18.3, 14.2, 9.8, 24.0, 31.2,
      19.5, 16.8, 11.2, 25.4, 28.9, 13.6, 17.1, 21.8, 10.4, 15.9,
      29.0, 33.4, 18.0, 22.7, 14.5, 26.1, 12.8, 20.3
    ],
  },
  {
    id: 'tgbh-termico',
    title: 'Estrés Térmico TGBH en Fundición',
    category: 'Higiene Industrial',
    variableName: 'Índice TGBH Interior',
    unit: '°C',
    description: 'Evaluación de carga térmica por calor radiante y metabólico en fundición metalúrgica.',
    sampleSize: 20,
    recommendedType: 'grouped',
    dataGenerator: () => [
      26.5, 28.2, 30.1, 31.8, 33.5, 29.4, 27.8, 32.0, 34.2, 30.8,
      28.9, 31.1, 32.6, 29.8, 33.9, 35.0, 27.2, 30.4, 32.1, 34.6
    ],
  },
  {
    id: 'polvo-cantera',
    title: 'Polvo Respirable en Molienda',
    category: 'Control Ambiental',
    variableName: 'Fracción Respirable de Polvo',
    unit: 'mg/m³',
    description: 'Muestreo gravimétrico con ciclón para determinar exposición a sílice libre cristalina.',
    sampleSize: 22,
    recommendedType: 'grouped',
    dataGenerator: () => [
      0.8, 1.4, 2.1, 3.5, 4.2, 1.8, 2.9, 3.1, 5.0, 2.4,
      1.1, 2.7, 3.8, 4.6, 1.9, 3.0, 2.2, 4.0, 1.5, 3.3, 4.8, 2.6
    ],
  },
  {
    id: 'carga-manual',
    title: 'Peso en Levantamiento Manual',
    category: 'Ergonomía Laboral',
    variableName: 'Masa de Bultos Manipulados',
    unit: 'kg',
    description: 'Pesaje de cargas manipuladas manualmente por estibadores (Ecuación NIOSH / Res. 295/03).',
    sampleSize: 26,
    recommendedType: 'grouped',
    dataGenerator: () => [
      12.5, 15.0, 18.2, 22.0, 24.5, 14.0, 16.8, 19.5, 23.1, 25.0,
      13.2, 17.4, 20.0, 21.5, 24.8, 15.5, 18.0, 22.4, 25.0, 14.8,
      16.2, 19.1, 23.8, 13.9, 17.0, 20.5
    ],
  },

  // --- FRECUENCIAS SIMPLES ---
  {
    id: 'dias-baja',
    title: 'Días de Licencia por Accidente',
    category: 'Costos y Siniestralidad',
    variableName: 'Jornadas de Trabajo Perdidas',
    unit: 'Días corridos',
    description: 'Días de inactividad laboral ocasionados por accidentes para el cálculo de Índice de Gravedad.',
    sampleSize: 20,
    recommendedType: 'simple',
    dataGenerator: () => [
      0, 2, 5, 0, 14, 3, 0, 21, 7, 0, 
      1, 4, 10, 0, 8, 15, 2, 0, 6, 12
    ],
  },
  {
    id: 'incidentes-mes',
    title: 'Incidentes Mensuales por Sector',
    category: 'Siniestralidad',
    variableName: 'Conteo de Cuasi-Accidentes Mensuales',
    unit: 'Incidentes',
    description: 'Registro de desvíos y eventos sin lesión reportados por los delegados de seguridad.',
    sampleSize: 25,
    recommendedType: 'simple',
    dataGenerator: () => [
      1, 0, 3, 2, 0, 4, 1, 2, 0, 1, 
      3, 5, 2, 1, 0, 2, 4, 1, 3, 0, 
      2, 1, 0, 3, 2
    ],
  },
  {
    id: 'auditorias-5s',
    title: 'Puntaje de Auditoría 5S',
    category: 'Prevención Operativa',
    variableName: 'Calificación de Orden y Limpieza',
    unit: 'Puntos (1-10)',
    description: 'Calificaciones mensuales de orden y limpieza en células de trabajo.',
    sampleSize: 24,
    recommendedType: 'simple',
    dataGenerator: () => [
      7, 8, 6, 9, 8, 7, 10, 6, 8, 9, 
      7, 8, 5, 9, 8, 10, 7, 6, 8, 9, 
      8, 7, 9, 10
    ],
  },
  {
    id: 'simulacros-anuales',
    title: 'Simulacros de Evacuación Realizados',
    category: 'Planes de Emergencia',
    variableName: 'Ejercicios de Evacuación por Planta',
    unit: 'Simulacros/Año',
    description: 'Conteo anual de ejercicios prácticos de rol de emergencias y evacuación.',
    sampleSize: 20,
    recommendedType: 'simple',
    dataGenerator: () => [
      1, 2, 2, 3, 1, 4, 2, 3, 1, 2, 
      3, 2, 1, 4, 2, 3, 2, 1, 3, 2
    ],
  },

  // --- CONTINGENCIA (BIVARIADAS) ---
  {
    id: 'contingencia-epp',
    title: 'Sector vs. Cumplimiento de EPP',
    category: 'Seguridad Operativa',
    variableName: 'Sector vs. Uso de EPP',
    unit: 'Observaciones',
    description: 'Auditoría de comportamiento seguro cruzando el sector con la adhesión al uso de EPP.',
    sampleSize: 45,
    recommendedType: 'contingency',
    defaultXName: 'Sector de Planta',
    defaultYName: 'Grado de Uso de EPP',
    dataGenerator: () => [],
    bivariateDataGenerator: () => {
      const data: { x: string; y: string }[] = [];
      const sectors = ['Mecanizado', 'Soldadura', 'Pintura', 'Depósito'];
      const compliance = ['Cumple Siempre', 'Uso Parcial', 'No Cumple'];
      const counts: Record<string, Record<string, number>> = {
        'Mecanizado': { 'Cumple Siempre': 12, 'Uso Parcial': 3, 'No Cumple': 1 },
        'Soldadura': { 'Cumple Siempre': 9, 'Uso Parcial': 4, 'No Cumple': 2 },
        'Pintura': { 'Cumple Siempre': 7, 'Uso Parcial': 2, 'No Cumple': 0 },
        'Depósito': { 'Cumple Siempre': 3, 'Uso Parcial': 1, 'No Cumple': 1 },
      };
      for (const s of sectors) {
        for (const c of compliance) {
          const count = counts[s][c];
          for (let i = 0; i < count; i++) data.push({ x: s, y: c });
        }
      }
      return data;
    },
  },
  {
    id: 'contingencia-turnos',
    title: 'Turno vs. Gravedad del Incidente',
    category: 'Costos y Siniestralidad',
    variableName: 'Turno vs. Gravedad',
    unit: 'Incidentes',
    description: 'Estudio de accidentología laboral para evaluar si la fatiga nocturna incide en la severidad.',
    sampleSize: 40,
    recommendedType: 'contingency',
    defaultXName: 'Turno de Trabajo',
    defaultYName: 'Severidad del Incidente',
    dataGenerator: () => [],
    bivariateDataGenerator: () => {
      const data: { x: string; y: string }[] = [];
      const turnos = ['Turno Mañana', 'Turno Tarde', 'Turno Noche'];
      const severidades = ['Leve (Sin Baja)', 'Moderado (1 a 10 días)', 'Grave (>10 días)'];
      const counts: Record<string, Record<string, number>> = {
        'Turno Mañana': { 'Leve (Sin Baja)': 11, 'Moderado (1 a 10 días)': 4, 'Grave (>10 días)': 1 },
        'Turno Tarde': { 'Leve (Sin Baja)': 8, 'Moderado (1 a 10 días)': 5, 'Grave (>10 días)': 2 },
        'Turno Noche': { 'Leve (Sin Baja)': 3, 'Moderado (1 a 10 días)': 4, 'Grave (>10 días)': 2 },
      };
      for (const t of turnos) {
        for (const s of severidades) {
          const count = counts[t][s];
          for (let i = 0; i < count; i++) data.push({ x: t, y: s });
        }
      }
      return data;
    },
  },
  {
    id: 'contingencia-permisos',
    title: 'Tarea Crítica vs. Estado de Permiso ATS',
    category: 'Control de Riesgos',
    variableName: 'Tarea vs. Autorización ATS',
    unit: 'Trabajos',
    description: 'Cruce entre tipos de tareas de alto riesgo y cumplimiento de Análisis de Trabajo Seguro.',
    sampleSize: 35,
    recommendedType: 'contingency',
    defaultXName: 'Tipo de Tarea Crítica',
    defaultYName: 'Estado de Permiso ATS',
    dataGenerator: () => [],
    bivariateDataGenerator: () => {
      const data: { x: string; y: string }[] = [];
      const tareas = ['Trabajo en Altura', 'Espacios Confinados', 'Corte y Soldadura', 'Alta Tensión'];
      const estados = ['ATS Aprobado y Firmado', 'ATS En Revisión', 'Sin ATS (No Conforme)'];
      const counts: Record<string, Record<string, number>> = {
        'Trabajo en Altura': { 'ATS Aprobado y Firmado': 10, 'ATS En Revisión': 2, 'Sin ATS (No Conforme)': 0 },
        'Espacios Confinados': { 'ATS Aprobado y Firmado': 6, 'ATS En Revisión': 1, 'Sin ATS (No Conforme)': 1 },
        'Corte y Soldadura': { 'ATS Aprobado y Firmado': 8, 'ATS En Revisión': 3, 'Sin ATS (No Conforme)': 0 },
        'Alta Tensión': { 'ATS Aprobado y Firmado': 4, 'ATS En Revisión': 0, 'Sin ATS (No Conforme)': 0 },
      };
      for (const t of tareas) {
        for (const e of estados) {
          const count = counts[t][e];
          for (let i = 0; i < count; i++) data.push({ x: t, y: e });
        }
      }
      return data;
    },
  },
];

/**
 * CONTENIDOS DIDÁCTICOS PARA "APUNTES DE LA CÁTEDRA"
 */
export const THEMATIC_UNITS: ThematicUnit[] = [
  {
    id: 'unidad-1',
    number: 1,
    title: 'Estadística Descriptiva Aplicada a la Seguridad e Higiene',
    subtitle: 'Variables, Tablas de Frecuencias y Representaciones Gráficas',
    badge: 'Unidad 1',
    description: 'Fundamentos de recolección y sistematización de datos de siniestralidad, mediciones higiénicas (ruido, iluminación, contaminantes) y ergonomía.',
    topics: [
      {
        title: '1.1 Clasificación de Variables en SySO',
        summary: 'Variables Cualitativas (Nominales y Ordinales) y Cuantitativas (Discretas y Continuas).',
      },
      {
        title: '1.2 Construcción Didáctica de Intervalos',
        summary: 'Determinación del Rango R = Xmax - Xmin, selección de clases k mediante la Regla de la Raíz Cuadrada k = √n, y cálculo de la Amplitud A = R / k.',
        keyFormulas: [
          { name: 'Rango muestral', formula: 'R = X_{max} - X_{min}', note: 'Diferencia entre el valor máximo y mínimo.' },
          { name: 'Regla de la Raíz Cuadrada', formula: 'k = \\sqrt{n}', note: 'Redondeado al entero más cercano o superior.' },
          { name: 'Amplitud de intervalo', formula: 'A = \\frac{R}{k}', note: 'Ancho uniforme de cada intervalo.' },
        ]
      },
      {
        title: '1.3 Tablas de Frecuencias y Marcas de Clase',
        summary: 'Cálculo de Frecuencia Absoluta (fa), Relativa (fr = fa / n), Porcentaje (p = fr · 100), y frecuencias acumuladas (Fa, Fr, P).',
        keyFormulas: [
          { name: 'Marca de Clase', formula: 'Mc = \\frac{L_i + L_s}{2}', note: 'Punto medio del intervalo.' },
          { name: 'Frecuencia Relativa', formula: 'fr = \\frac{fa}{n}', note: 'Proporción de observaciones.' },
          { name: 'Porcentaje', formula: 'p = fr \\cdot 100', note: 'Expresión porcentual.' },
        ]
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico Oficial - Unidad 1: Estadística Descriptiva',
      fileName: 'Apunte_Unidad_1_Estadistica_Descriptiva_IES_Belen.pdf',
      fileSize: '1.8 MB',
      pages: 14,
      summary: 'Desarrollo conceptual completo de variables, población, muestra, reglas de partición de intervalos (Regla de la Raíz Cuadrada k=√n) y gráficos didácticos de distribución de frecuencias.',
      contentOutline: [
        '1. Introducción a la Estadística en Higiene y Seguridad Laboral',
        '2. Tipos de Variables: Cualitativas y Cuantitativas',
        '3. Tablas de Frecuencias para Datos No Agrupados y Agrupados en Intervalos',
        '4. Marcas de Clase y Frecuencias Acumuladas',
        '5. Histogramas, Polígonos de Frecuencias, Diagramas Circulares y Ojivas',
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 1: Organización y Tabulación de Datos',
      tpNumber: 'T.P. N° 1',
      fileName: 'TP1_Estadistica_Descriptiva_Guia_Alumnos.pdf',
      fileSize: '950 KB',
      exercisesCount: 6,
      summary: 'Guía obligatoria de resolución de problemas con casos reales de mediciones sonométricas en talleres, registros de iluminación en oficinas y accidentología laboral.',
      sampleExercises: [
        {
          number: 1,
          statement: 'En un taller metalmecánico se registraron los niveles sonoros continuos equivalentes (en dBA) durante una jornada de 8 horas. Construya la tabla de distribución de frecuencias agrupadas aplicando la regla de la raíz cuadrada y trace el histograma correspondiente.',
          dataSample: '78.4; 82.1; 85.6; 88.0; 91.2; 84.3; 79.8; 87.5; 92.4; 86.1; 83.7; 89.9; 94.2; 81.0; 88.6; 90.5; 85.0; 77.9; 83.2; 87.1; 93.5; 86.8; 80.5; 89.1; 95.0'
        },
        {
          number: 2,
          statement: 'Se auditó el personal de logística para relevar la edad de los trabajadores expuestos a tareas de estiba manual. Elabore la tabla de frecuencias simples y el polígono de frecuencias.',
          dataSample: '21; 24; 28; 35; 42; 47; 53; 22; 31; 38; 45; 50; 58; 26; 34; 41; 49; 23; 29; 36; 44; 52; 25; 33; 40; 48; 55; 27; 37; 46'
        }
      ]
    }
  },
  {
    id: 'unidad-2',
    number: 2,
    title: 'Cálculo de la Probabilidad y Distribuciones de Riesgo',
    subtitle: 'Espacios Muestrales, Eventos de Siniestralidad y Probabilidad Condicional',
    badge: 'Unidad 2',
    description: 'Teoría de probabilidades orientada a la estimación matemática de fallas de equipos, ocurrencia de accidentes y confiabilidad de sistemas de protección.',
    topics: [
      {
        title: '2.1 Conceptos Fundamentales de Probabilidad',
        summary: 'Espacio muestral, sucesos compatibles, incompatibles e independientes aplicados a la seguridad.',
      },
      {
        title: '2.2 Probabilidad Condicional y Teorema de Bayes',
        summary: 'Evaluación de probabilidades condicionales P(A|B) en inspecciones de seguridad y detección de fallas.',
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico Oficial - Unidad 2: Cálculo de Probabilidades',
      fileName: 'Apunte_Unidad_2_Probabilidades_IES_Belen.pdf',
      fileSize: '2.1 MB',
      pages: 18,
      summary: 'Fundamentos axiomáticos de la probabilidad, probabilidad condicional, tablas de contingencia bivariadas e independencia estadística en siniestralidad.',
      contentOutline: [
        '1. Experimentos Aleatorios en Ambientes Industriales',
        '2. Axiomas de Probabilidad y Reglas de Adición / Multiplicación',
        '3. Probabilidad Condicional y Tablas de Contingencia',
        '4. Distribuciones Discretas (Binomial y Poisson) en Conteo de Accidentes',
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 2: Modelado Probabilístico',
      tpNumber: 'T.P. N° 2',
      fileName: 'TP2_Probabilidades_y_Riesgo.pdf',
      fileSize: '1.1 MB',
      exercisesCount: 5,
      summary: 'Problemas de aplicación sobre probabilidad de falla en calderas, probabilidad de accidente en trabajo en altura y tablas de contingencia de turnos de trabajo.',
      sampleExercises: [
        {
          number: 1,
          statement: 'En una planta química se analiza la probabilidad de fuga en tres reactores independientes. Calcule la probabilidad de que al menos uno falle durante una jornada crítica.',
          dataSample: 'P(R1) = 0.02, P(R2) = 0.015, P(R3) = 0.01'
        }
      ]
    }
  },
  {
    id: 'unidad-3',
    number: 3,
    title: 'Costos de la Seguridad, Índices de Siniestralidad y Confiabilidad',
    subtitle: 'Costos Directos e Indirectos (Teoría del Iceberg de Heinrich) e Indicadores de Siniestralidad',
    badge: 'Unidad 3',
    description: 'Cuantificación económica de la no-seguridad, estimación de costos asegurados y no asegurados, e indicadores legales (Índice de Frecuencia IF, Índice de Gravedad IG e Índice de Incidencia II).',
    topics: [
      {
        title: '3.1 Índices Legales de Siniestralidad (Norma IRAM 3800)',
        summary: 'Cálculo y seguimiento del Índice de Frecuencia (IF), Índice de Gravedad (IG) e Índice de Incidencia (II).',
        keyFormulas: [
          { name: 'Índice de Frecuencia (IF)', formula: 'IF = \\frac{\\text{N° Accidentes con Baja} \\cdot 10^6}{\\text{Horas Hombre Trabajadas (HHT)}}', note: 'Accidentes por cada millón de horas hombre.' },
          { name: 'Índice de Gravedad (IG)', formula: 'IG = \\frac{\\text{Jornadas Perdidas} \\cdot 10^3}{\\text{Horas Hombre Trabajadas (HHT)}}', note: 'Días perdidos por cada mil horas hombre.' },
        ]
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico Oficial - Unidad 3: Costos de la Seguridad y Siniestralidad',
      fileName: 'Apunte_Unidad_3_Costos_Siniestralidad_IES_Belen.pdf',
      fileSize: '2.4 MB',
      pages: 16,
      summary: 'Estructura de costos de la seguridad, teoría de Heinrich / Bird de costos ocultos e indicadores estandarizados de siniestralidad laboral.',
      contentOutline: [
        '1. Análisis Económico de los Accidentes de Trabajo',
        '2. Costos Directos vs. Costos Indirectos (El Iceberg de Costos)',
        '3. Metodología de Cálculo de Índices de Siniestralidad (IF, IG, II)',
        '4. Plan de Inversión y Rentabilidad de las Mejoras Preventivas',
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 3: Auditoría Económica de Siniestros',
      tpNumber: 'T.P. N° 3',
      fileName: 'TP3_Costos_y_Siniestralidad_Guia.pdf',
      fileSize: '1.3 MB',
      exercisesCount: 4,
      summary: 'Ejercicios de cálculo de índices IF, IG, costos no asegurados y justificación de presupuesto de prevención.',
      sampleExercises: [
        {
          number: 1,
          statement: 'Una empresa constructora con 150 operarios registró 8 accidentes con baja laboral y 120 jornadas perdidas en 300.000 HHT. Calcule el Índice de Frecuencia (IF) y el Índice de Gravedad (IG).',
          dataSample: 'N° Accidentes = 8, Días Perdidos = 120, HHT = 300.000'
        }
      ]
    }
  }
];
