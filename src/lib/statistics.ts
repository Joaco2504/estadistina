// src/lib/statistics.ts
import {
  GroupedFrequencyRow,
  GroupedFrequencyTableResult,
  IntervalParameters,
  SimpleFrequencyRow,
  SimpleFrequencyTableResult,
  ContingencyTableResult,
  SafetyDataPreset,
  ThematicUnit
} from '@/types/statistics';

/**
 * Parsea una cadena de texto con datos separados por ';' (o comas/espacios/saltos de línea)
 * y devuelve un array ordenado de números válidos.
 */
export function parseRawDataString(input: string): number[] {
  if (!input || input.trim() === '') return [];
  
  // Normalizar separadores: admite ';' principalmente, también comas o saltos de línea
  const normalized = input.replace(/[\n\r,]/g, ';');
  const tokens = normalized.split(';');
  
  const numbers: number[] = [];
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed !== '') {
      const num = Number(trimmed);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }
  
  return numbers.sort((a, b) => a - b);
}

/**
 * Formatea un número decimal a una cantidad fija de decimales
 */
export function formatNum(num: number, decimals: number = 2): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return Number(num.toFixed(decimals)).toString();
}

/**
 * Redondea con precisión a n decimales
 */
export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Calcula los parámetros de intervalo aplicando la regla de la raíz cuadrada
 * Regla: k = round(sqrt(n))
 */
export function calculateIntervalParameters(
  values: number[],
  customParams?: { rango?: number; k?: number; amplitud?: number }
): IntervalParameters {
  const n = values.length;
  if (n === 0) {
    return {
      userProvided: false,
      xmin: 0,
      xmax: 0,
      rango: 0,
      k: 1,
      amplitud: 1,
      precision: 2,
    };
  }

  const xmin = values[0];
  const xmax = values[values.length - 1];
  const naturalRango = roundTo(xmax - xmin, 4);

  // Si el usuario proveyó R, k, A válidos
  if (
    customParams &&
    customParams.rango !== undefined &&
    customParams.rango > 0 &&
    customParams.k !== undefined &&
    customParams.k > 0 &&
    customParams.amplitud !== undefined &&
    customParams.amplitud > 0
  ) {
    return {
      userProvided: true,
      xmin,
      xmax,
      rango: customParams.rango,
      k: Math.round(customParams.k),
      amplitud: customParams.amplitud,
      precision: 2,
    };
  }

  // REGLA ESTRICTA DE LA RAÍZ CUADRADA: k = round(sqrt(n))
  const kCalculado = Math.max(1, Math.round(Math.sqrt(n)));
  
  // Amplitud: A = R / k (con ajuste mínimo para cubrir xmax)
  let rawAmplitud = naturalRango / kCalculado;
  if (rawAmplitud === 0) rawAmplitud = 1;
  
  // Redondeo amigable de la amplitud (a 1 o 2 decimales según los datos)
  const amplitudCalculada = roundTo(rawAmplitud, 2) || 1;

  return {
    userProvided: false,
    xmin,
    xmax,
    rango: naturalRango,
    k: kCalculado,
    amplitud: amplitudCalculada,
    precision: 2,
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
  customParams?: { rango?: number; k?: number; amplitud?: number }
): GroupedFrequencyTableResult {
  const sortedValues = [...rawValues].sort((a, b) => a - b);
  const n = sortedValues.length;

  if (n === 0) {
    throw new Error('El conjunto de datos no puede estar vacío.');
  }

  const params = calculateIntervalParameters(sortedValues, customParams);
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

    // Conteo de frecuencia absoluta en el intervalo
    // Para el último intervalo se incluye el límite superior [Li, Ls]
    // Para los anteriores se toma semiabierto [Li, Ls)
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

    const stepExplanations = {
      mc: `Mc = \\frac{${lower} + ${upper}}{2} = \\frac{${roundTo(lower + upper, 2)}}{2} = ${mc}`,
      fa: `fa = \\text{Cantidad de observaciones en } ${intervalLabel} = ${fa}`,
      fr: `fr = \\frac{fa}{n} = \\frac{${fa}}{${n}} = ${fr.toFixed(4)}`,
      p: `p = fr \\cdot 100 = ${fr.toFixed(4)} \\cdot 100 = ${p.toFixed(2)}\\%`,
      faAcum: i === 1 
        ? `Fa_1 = fa_1 = ${fa}` 
        : `Fa_${i} = Fa_${i - 1} + fa_${i} = ${accumulatedFa - fa} + ${fa} = ${accumulatedFa}`,
      frAcum: `Fr_${i} = \\frac{Fa_${i}}{n} = \\frac{${accumulatedFa}}{${n}} = ${accumulatedFr.toFixed(4)}`,
      pAcum: `P_${i} = Fr_${i} \\cdot 100 = ${accumulatedFr.toFixed(4)} \\cdot 100 = ${accumulatedP.toFixed(2)}\\%`,
    };

    rows.push({
      index: i,
      intervalLabel,
      lowerBound: lower,
      upperBound: upper,
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

  const stepByStepDerivation = !params.userProvided
    ? {
        rangoFormula: `R = X_{max} - X_{min}`,
        rangoValue: `R = ${params.xmax} - ${params.xmin} = ${params.rango}`,
        kFormula: `k = \\sqrt{n}`,
        kValue: `k = \\sqrt{${n}} \\approx ${(Math.sqrt(n)).toFixed(3)} \\rightarrow k = ${params.k} \\text{ (redondeo al entero más cercano)}`,
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
 * Columnas: xi, fa, fr, p, Fa, Fr, P
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

  // Obtener frecuencias absolutas por valor único
  const frequencyMap = new Map<number, number>();
  for (const val of sortedValues) {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  }

  const uniqueValues = Array.from(frequencyMap.keys()).sort((a, b) => a - b);
  const rows: SimpleFrequencyRow[] = [];

  let accumulatedFa = 0;
  let index = 1;

  for (const xi of uniqueValues) {
    const fa = frequencyMap.get(xi) || 0;
    const fr = roundTo(fa / n, 4);
    const p = roundTo(fr * 100, 2);

    accumulatedFa += fa;
    const accumulatedFr = roundTo(accumulatedFa / n, 4);
    const accumulatedP = roundTo(accumulatedFr * 100, 2);

    const stepExplanations = {
      fa: `fa = \\text{Cantidad de veces que aparece el valor } ${xi} = ${fa}`,
      fr: `fr = \\frac{fa}{n} = \\frac{${fa}}{${n}} = ${fr.toFixed(4)}`,
      p: `p = fr \\cdot 100 = ${fr.toFixed(4)} \\cdot 100 = ${p.toFixed(2)}\\%`,
      faAcum: index === 1
        ? `Fa_1 = fa_1 = ${fa}`
        : `Fa_${index} = Fa_${index - 1} + fa_${index} = ${accumulatedFa - fa} + ${fa} = ${accumulatedFa}`,
      frAcum: `Fr_${index} = \\frac{Fa_${index}}{n} = \\frac{${accumulatedFa}}{${n}} = ${accumulatedFr.toFixed(4)}`,
      pAcum: `P_${index} = Fr_${index} \\cdot 100 = ${accumulatedFr.toFixed(4)} \\cdot 100 = ${accumulatedP.toFixed(2)}\\%`,
    };

    rows.push({
      index,
      variableValue: xi,
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
 * Desglose: Frecuencias simples, Frecuencias conjuntas, Totales marginales por fila, Totales marginales por columna, Gran Total
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

  // Descubrir categorías únicas
  const rowCategoriesSet = new Set<string>();
  const colCategoriesSet = new Set<string>();

  for (const pair of dataPairs) {
    rowCategoriesSet.add(pair.x.trim());
    colCategoriesSet.add(pair.y.trim());
  }

  const rowCategories = Array.from(rowCategoriesSet);
  const colCategories = Array.from(colCategoriesSet);

  // Inicializar matriz de frecuencias conjuntas fa_ij
  const matrix: number[][] = rowCategories.map(() => 
    colCategories.map(() => 0)
  );

  // Frecuencias simples de X e Y
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

  // Totales marginales por fila ("Total por fila")
  const rowMarginalTotals: number[] = matrix.map((row) => 
    row.reduce((acc, curr) => acc + curr, 0)
  );

  // Totales marginales por columna ("Total por columna")
  const colMarginalTotals: number[] = colCategories.map((_, cIdx) => 
    matrix.reduce((acc, row) => acc + row[cIdx], 0)
  );

  // Gran Total
  const grandTotal = rowMarginalTotals.reduce((acc, val) => acc + val, 0);

  // Explicaciones didácticas paso a paso
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
    sampleSize: n,
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
 * PRESETS TÍPICOS DE HIGIENE, SEGURIDAD Y CONTROL AMBIENTAL
 */
export const SAFETY_PRESETS: SafetyDataPreset[] = [
  {
    id: 'ruido-db',
    title: 'Niveles de Ruido en Taller Metalúrgico',
    category: 'Higiene Industrial',
    variableName: 'Nivel Sonoro Continuo Equivalente',
    unit: 'dBA',
    description: 'Mediciones de ruido ambiental registradas con decibelímetro integrador clase 1 en diferentes puestos de mecanizado (Límite legal res. SRT 295/03: 85 dBA para 8 hs).',
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
    title: 'Edades de Trabajadores Expuestos a Cargas',
    category: 'Seguridad Operativa',
    variableName: 'Edad del Personal de Planta',
    unit: 'Años',
    description: 'Registro etario de operarios del sector de logística y estiba manual para la evaluación de riesgos ergonómicos (Criterio ISO 11228).',
    sampleSize: 30,
    recommendedType: 'grouped',
    dataGenerator: () => [
      21, 24, 28, 35, 42, 47, 53, 22, 31, 38, 
      45, 50, 58, 26, 34, 41, 49, 23, 29, 36, 
      44, 52, 25, 33, 40, 48, 55, 27, 37, 46
    ],
  },
  {
    id: 'dias-baja',
    title: 'Jornadas Perdidas por Accidentes de Trabajo',
    category: 'Costos y Siniestralidad',
    variableName: 'Días de Licencia Médica por Siniestro',
    unit: 'Días corridos',
    description: 'Días de inactividad laboral ocasionados por accidentes con tiempo perdido ocurridos durante el último período anual (cálculo de Índice de Gravedad).',
    sampleSize: 20,
    recommendedType: 'simple',
    dataGenerator: () => [
      0, 2, 5, 0, 14, 3, 0, 21, 7, 0, 
      1, 4, 10, 0, 8, 15, 2, 0, 6, 12
    ],
  },
  {
    id: 'iluminacion-lux',
    title: 'Nivel de Iluminación en Puestos de Ensamblaje',
    category: 'Higiene Industrial',
    variableName: 'Iluminancia en Plano de Trabajo',
    unit: 'Lux',
    description: 'Evaluación fotométrica con luxómetro para contrastar con los requisitos mínimos de confort y precisión visual (Dec. 351/79 Cap. 12).',
    sampleSize: 24,
    recommendedType: 'grouped',
    dataGenerator: () => [
      240, 310, 450, 180, 520, 490, 380, 600, 
      290, 340, 410, 480, 530, 220, 360, 420, 
      510, 580, 300, 370, 440, 500, 270, 460
    ],
  },
  {
    id: 'contingencia-epp',
    title: 'Sector Productivo vs. Cumplimiento de Uso de EPP',
    category: 'Seguridad Operativa',
    variableName: 'Sector vs. Uso de EPP',
    unit: 'Observaciones',
    description: 'Auditoría de comportamiento seguro cruzando el sector de planta con el grado de adhesión al uso reglamentario de Elementos de Protección Personal.',
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
          for (let i = 0; i < count; i++) {
            data.push({ x: s, y: c });
          }
        }
      }
      return data;
    },
  },
  {
    id: 'contingencia-turnos',
    title: 'Turno de Trabajo vs. Gravedad del Incidente',
    category: 'Costos y Siniestralidad',
    variableName: 'Turno vs. Gravedad',
    unit: 'Incidentes',
    description: 'Estudio de accidentología laboral para evaluar si la fatiga y el trabajo nocturno inciden en la severidad de los eventos no deseados.',
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
          for (let i = 0; i < count; i++) {
            data.push({ x: t, y: s });
          }
        }
      }
      return data;
    },
  }
];

/**
 * CONTENIDOS DIDÁCTICOS PARA LA SECCIÓN "APUNTES DE LA CÁTEDRA"
 */
export const THEMATIC_UNITS: ThematicUnit[] = [
  {
    id: 'unidad-1',
    number: 1,
    title: 'Estadística Descriptiva Aplicada a la Seguridad e Higiene',
    subtitle: 'Variables, Organización de Datos, Tablas de Frecuencias y Representaciones Gráficas',
    badge: 'Unidad 1',
    description: 'Fundamentos de recolección y sistematización de datos de siniestralidad, mediciones higiénicas (ruido, iluminación, contaminantes) y ergonomía.',
    topics: [
      {
        title: '1.1 Clasificación de Variables en SySO',
        summary: 'Variables Cualitativas (Nominales y Ordinales: uso de EPP, sector) y Cuantitativas (Discretas: cantidad de accidentes, y Continuas: decibeles, ppm de gases, temperatura).',
      },
      {
        title: '1.2 Construcción Didáctica de Intervalos',
        summary: 'Determinación del Rango R = Xmax - Xmin, selección de la cantidad de clases k mediante la Regla de la Raíz Cuadrada k = √n, y cálculo de la Amplitud A = R / k.',
        keyFormulas: [
          { name: 'Rango muestral', formula: 'R = X_{max} - X_{min}', note: 'Diferencia entre el valor máximo y mínimo observado.' },
          { name: 'Regla de la Raíz Cuadrada', formula: 'k = \\sqrt{n}', note: 'Redondeado al entero más cercano para evitar sesgo.' },
          { name: 'Amplitud de intervalo', formula: 'A = \\frac{R}{k}', note: 'Ancho uniforme de cada intervalo de clase.' },
        ]
      },
      {
        title: '1.3 Tablas de Frecuencias y Marcas de Clase',
        summary: 'Cálculo de Frecuencia Absoluta (fa), Relativa (fr = fa / n), Porcentaje (p = fr · 100), y frecuencias acumuladas (Fa, Fr, P).',
        keyFormulas: [
          { name: 'Marca de Clase', formula: 'Mc = \\frac{L_i + L_s}{2}', note: 'Punto medio representativo del intervalo.' },
          { name: 'Frecuencia Relativa', formula: 'fr = \\frac{fa}{n}', note: 'Proporción respecto al total de la muestra.' },
        ]
      },
      {
        title: '1.4 Tablas de Contingencia Bivariadas',
        summary: 'Análisis conjunto de dos factores de riesgo, determinación de frecuencias conjuntas fa_ij y cálculo de totales marginales por fila, columna y gran total.',
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico N° 1: Estadística Descriptiva en Higiene y Seguridad',
      fileName: 'Apunte_Teorico_U1_Estadistica_IES_Belen.pdf',
      fileSize: '2.4 MB',
      pages: 18,
      summary: 'Desarrollo conceptual completo con ejemplos reales de mediciones de contaminantes físicos y químicos en puestos de trabajo industriales.',
      contentOutline: [
        'Introducción al método estadístico en prevención de riesgos.',
        'Población, muestra y muestreo de agentes de riesgo.',
        'Construcción de tablas simples y con intervalos (Regla k = √n).',
        'Histogramas, polígonos de frecuencias y diagramas de Pareto en seguridad.',
        'Tablas de contingencia y análisis bivariado de causas de accidentes.'
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 1',
      tpNumber: 'TP N° 1',
      fileName: 'Guia_TP1_Estadistica_Descriptiva.pdf',
      fileSize: '1.1 MB',
      exercisesCount: 8,
      summary: 'Ejercicios de aplicación profesional: análisis de niveles de ruido en decibeles, distribución de edades y tablas bivariadas de incidentes.',
      sampleExercises: [
        {
          number: 1,
          statement: 'En una fábrica textil se midieron los niveles sonoros continuos equivalentes (dBA) en 25 puestos de costura. Construya la tabla de frecuencias agrupadas aplicando k = √n y grafique el histograma correspondiente.',
          dataSample: '78.4; 82.1; 85.6; 88.0; 91.2; 84.3; 79.8; 87.5; 92.4; 86.1; 83.7; 89.9; 94.2; 81.0; 88.6; 90.5; 85.0; 77.9; 83.2; 87.1; 93.5; 86.8; 80.5; 89.1; 95.0'
        },
        {
          number: 2,
          statement: 'Se auditó el uso de protección auditiva en 40 operarios según el turno de trabajo. Elabore la tabla de contingencia, determine los totales marginales y concluya.',
          dataSample: 'Cruce bivariado Turno (Mañana, Tarde, Noche) vs. Uso de EPP (Adecuado, Deficiente).'
        }
      ]
    }
  },
  {
    id: 'unidad-2',
    number: 2,
    title: 'Cálculo de la Probabilidad y Modelos Estocásticos',
    subtitle: 'Conceptos de Probabilidad, Eventos en Seguridad y Distribuciones de Frecuencia',
    badge: 'Unidad 2',
    description: 'Modelado cuantitativo de la incertidumbre en la ocurrencia de accidentes de trabajo y fallas en sistemas de protección.',
    topics: [
      {
        title: '2.1 Enfoques de Probabilidad en Seguridad',
        summary: 'Enfoque clásico (Laplace), frecuencial (historial de siniestralidad de planta) y subjetivo (evaluación de expertos). Espacio muestral de incidentes.',
        keyFormulas: [
          { name: 'Probabilidad Frecuencial', formula: 'P(A) = \\frac{\\text{Casos favorables}}{\\text{Total de casos observados}}', note: 'Estimación basada en registros históricos.' }
        ]
      },
      {
        title: '2.2 Reglas de Probabilidad Condicionada',
        summary: 'Probabilidad de sufrir un accidente dado que no se utilizó el EPP adecuado. Independencia de eventos en líneas de producción.',
        keyFormulas: [
          { name: 'Probabilidad Condicionada', formula: 'P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}', note: 'Probabilidad del evento A habiendo ocurrido B.' }
        ]
      },
      {
        title: '2.3 Distribuciones Discretas: Binomial y Poisson',
        summary: 'Modelo Binomial para muestreo de piezas defectuosas o no conformidades. Modelo de Poisson para ocurrencia de accidentes por unidad de tiempo u horas-hombre trabajadas.',
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico N° 2: Probabilidad Aplicada a la Gestión del Riesgo',
      fileName: 'Apunte_Teorico_U2_Probabilidad_IES_Belen.pdf',
      fileSize: '3.1 MB',
      pages: 22,
      summary: 'Tratamiento riguroso de árboles de decisión de fallas, confiabilidad de componentes de seguridad y distribuciones de Poisson en plantas continuas.',
      contentOutline: [
        'Teoría de conjuntos y eventos en seguridad industrial.',
        'Axiomas de probabilidad y reglas aditivas/multiplicativas.',
        'Teorema de Bayes aplicado a diagnósticos de condiciones inseguras.',
        'Variables aleatorias discretas: Binomial y Poisson en siniestralidad.',
        'Confiabilidad y tasa de falla de dispositivos de seguridad.'
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 2',
      tpNumber: 'TP N° 2',
      fileName: 'Guia_TP2_Probabilidad_y_Modelos.pdf',
      fileSize: '1.3 MB',
      exercisesCount: 10,
      summary: 'Problemas de cálculo de probabilidad condicionada en plantas industriales y estimación de fallas mediante distribución de Poisson.',
      sampleExercises: [
        {
          number: 1,
          statement: 'En una planta química la tasa promedio de microfugas de gas es de λ = 2.4 eventos por mes. Calcule la probabilidad de que en el próximo mes no se registre ninguna fuga y la probabilidad de que ocurran al menos 3 fugas.',
          dataSample: 'Distribución de Poisson: λ = 2.4 fugas/mes.'
        }
      ]
    }
  },
  {
    id: 'unidad-3',
    number: 3,
    title: 'Costos de la Seguridad, Índices de Siniestralidad y Evaluación Económica',
    subtitle: 'Indicadores IRAM 3800 / OIT, Costos Directos e Indirectos (Teoría de Heinrich y Simonds)',
    badge: 'Unidad 3',
    description: 'Cuantificación estadística del impacto económico de los accidentes de trabajo e indicadores normativos de desempeño en seguridad.',
    topics: [
      {
        title: '3.1 Índices Estadísticos de Siniestralidad (Norma IRAM / OIT)',
        summary: 'Índice de Frecuencia (IF), Índice de Gravedad (IG) e Índice de Incidencia (II). Factor base 1.000.000 y 1.000 Horas-Hombre trabajadas.',
        keyFormulas: [
          { name: 'Índice de Frecuencia (IF)', formula: 'IF = \\frac{\\text{N° de Accidentes con Baja} \\cdot 1.000.000}{\\text{Total de Horas-Hombre Trabajadas}}', note: 'Accidentes ocurridos por cada millón de horas de exposición.' },
          { name: 'Índice de Gravedad (IG)', formula: 'IG = \\frac{\\text{Jornadas de Trabajo Perdidas} \\cdot 1.000}{\\text{Total de Horas-Hombre Trabajadas}}', note: 'Días perdidos por cada mil horas de exposición.' },
          { name: 'Índice de Incidencia (II)', formula: 'II = \\frac{\\text{N° de Accidentes con Baja} \\cdot 1.000}{\\text{Número Medio de Trabajadores Expuestos}}', note: 'Frecuencia de accidentes por cada 1.000 trabajadores.' },
        ]
      },
      {
        title: '3.2 Estructura de Costos de Accidentes: Directos vs. Indirectos',
        summary: 'Costos asegurados (médicos, indemnizaciones de ART) vs. Costos no asegurados u ocultos (pérdida de tiempo de compañeros, daño a maquinaria, reprogramación, costos legales). Razón 1:4 de Heinrich y método de Simonds.',
      },
      {
        title: '3.3 Justificación Económica de Inversiones en Prevención',
        summary: 'Análisis Costo-Beneficio (ACB) para adquisición de sistemas de extracción localizada, guardas de seguridad y capacitaciones.',
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico N° 3: Costos y Métricas de Siniestralidad',
      fileName: 'Apunte_Teorico_U3_Costos_Seguridad_IES_Belen.pdf',
      fileSize: '2.8 MB',
      pages: 20,
      summary: 'Fórmulas oficiales, tablas de baremos para incapacidades permanentes y metodología de cálculo del costo real de accidentes según la SRT.',
      contentOutline: [
        'Marco normativo de registro de accidentes y enfermedades profesionales.',
        'Cálculo riguroso de Horas-Hombre trabajadas (HHT) reales vs. teóricas.',
        'Determinación de IF, IG, II y tasa de riesgo según Res. SRT.',
        'El iceberg de costos de Heinrich y el modelo de costos de Simonds.',
        'Elaboración de informes estadísticos para gerencia y comités mixtos.'
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 3',
      tpNumber: 'TP N° 3',
      fileName: 'Guia_TP3_Costos_y_Siniestralidad.pdf',
      fileSize: '1.5 MB',
      exercisesCount: 6,
      summary: 'Casos reales de cálculo de IF, IG, pérdidas por jornadas no trabajadas y estimación de costos indirectos para empresas metalmecánicas y mineras.',
      sampleExercises: [
        {
          number: 1,
          statement: 'Una empresa con 180 operarios registró en el año 6 accidentes con baja médica, totalizando 84 jornadas perdidas. Si cada operario trabajó en promedio 1.920 horas anuales, determine el Índice de Frecuencia (IF) y el Índice de Gravedad (IG).',
          dataSample: 'Operarios: 180 | Accidentes: 6 | Días perdidos: 84 | HHT: 345.600 horas.'
        }
      ]
    }
  }
];
