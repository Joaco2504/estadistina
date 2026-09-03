import { 
  GroupedFrequencyRow, 
  GroupedFrequencyTableResult, 
  SimpleFrequencyRow, 
  SimpleFrequencyTableResult, 
  ContingencyTableResult,
  SafetyPreset,
  ThematicUnit,
  SafetyIndicatorsInput,
  SafetyIndicatorsResult,
  SafetyIndicatorPreset
} from '@/types/statistics';


/**
 * Redondeo matemático seguro a N decimales
 */
export function roundTo(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Formatea un valor porcentual eliminando .00 innecesarios
 * Ej: 30.00 -> '30%', 23.00 -> '23%', 14.29 -> '14.29%'
 */
export function formatPercentage(val: number): string {
  const rounded = roundTo(val, 2);
  const str = rounded.toFixed(2);
  if (str.endsWith('.00')) {
    return `${Math.round(rounded)}%`;
  }
  return `${str}%`;
}


/**
 * Parsea un string de datos numéricos para datos agrupados según su tipo (continua o discreta)
 * - Continua: solo acepta ';' y saltos de línea como separadores de datos. La coma ',' es separador decimal (ej: 78,4; 82,1).
 * - Discreta: acepta tanto comas ',' como punto y coma ';' y espacios como separadores (ej: 21, 24, 28 o 21; 24; 28).
 */
export function parseGroupedDataString(input: string, isContinuous: boolean = true): number[] {
  if (!input || !input.trim()) return [];

  if (isContinuous) {
    // Continua: solo punto y coma o saltos de línea son delimitadores
    const rawTokens = input
      .split(/;|\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const numbers: number[] = [];
    for (const token of rawTokens) {
      const normalized = token.replace(/,/g, '.');
      const num = parseFloat(normalized);
      if (!isNaN(num) && isFinite(num)) {
        numbers.push(num);
      }
    }
    return numbers;
  } else {
    // Discreta: comas, punto y coma, espacios o saltos de línea
    const tokens = input
      .replace(/;/g, ' ')
      .replace(/,/g, ' ')
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
}

/**
 * Parsea un string de datos numéricos en bruto (legacy / fallback compatible)
 */
export function parseRawDataString(input: string): number[] {
  return parseGroupedDataString(input, false);
}

/**
 * Parsea un string de datos tanto cualitativos (texto) como cuantitativos
 * Acepta números con coma decimal y delimitación por ';' o ','
 */
export function parseAnyDataString(input: string): (number | string)[] {
  if (!input || !input.trim()) return [];

  const hasSemicolon = input.includes(';');

  let rawTokens: string[] = [];
  if (hasSemicolon) {
    rawTokens = input
      .split(/;|\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  } else {
    if (input.includes('\n')) {
      rawTokens = input
        .split('\n')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } else if (input.includes(',')) {
      rawTokens = input
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } else {
      rawTokens = [input.trim()];
    }
  }

  return rawTokens.map((token) => {
    // Normalizar coma decimal a punto para comprobar si es un número válido
    const normalizedNumStr = token.replace(/,/g, '.');
    const num = parseFloat(normalizedNumStr);
    if (!isNaN(num) && isFinite(num) && /^-?\d+(\.\d+)?$/.test(normalizedNumStr)) {
      return num;
    }
    return token;
  });
}

/**
 * Calcula los parámetros didácticos previos para datos agrupados:
 * - R = Xmax - Xmin
 * - k = Si sqrt(n) es entero exacto -> k = sqrt(n). Si no es exacto -> k = ceil(sqrt(n)) (redondeo a uno más).
 * - A = R / k
 */
export function calculateIntervalParameters(
  sortedValues: number[],
  customParams?: { rango?: number; k?: number; amplitud?: number }
): {
  userProvided: boolean;
  xmin: number;
  xmax: number;
  rango: number;
  k: number;
  amplitud: number;
  precision: number;
  kCalculatedRaw: number;
  isExactRoot: boolean;
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
      isExactRoot: true,
    };
  }

  const xmin = sortedValues[0];
  const xmax = sortedValues[sortedValues.length - 1];
  const naturalRango = roundTo(xmax - xmin, 2);
  const sqrtN = Math.sqrt(n);
  const isExactRoot = Number.isInteger(sqrtN);

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
      isExactRoot,
    };
  }

  // Regla pedagógica: Si la raíz cuadrada es exacta, k = sqrt(n).
  // Si no es exacta, redondear siempre al entero superior (ceil), aumentando a uno más.
  const kCalculado = isExactRoot
    ? Math.max(1, Math.round(sqrtN))
    : Math.max(1, Math.ceil(sqrtN));
  
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
    isExactRoot,
  };
}

/**
 * MÓDULO 1: Generación de Tabla de Frecuencias Agrupadas
 * Frecuencia relativa fr = fa / n (redondeada a 2 decimales).
 * Porcentaje p = fr * 100 (estrictamente obtenido de fr).
 * Frecuencia relativa acumulada Fr = Fa / n (2 decimales).
 * Porcentaje acumulado P = Fr * 100.
 */
export function generateGroupedFrequencyTable(
  variableName: string,
  unit: string,
  rawValues: number[],
  customParams?: { rango?: number; k?: number; amplitud?: number },
  groupedVariableType: 'continuous' | 'discrete' = 'continuous'
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

    const mc = roundTo((lower + upper) / 2, params.precision + 1);

    let fa = 0;
    for (const val of sortedValues) {
      if (isLast) {
        if (val >= lower && val <= upper + 0.00001) fa++;
      } else {
        if (val >= lower && val < upper) fa++;
      }
    }

    // fr redondeada a 2 decimales y p calculada directamente como fr * 100
    const fr = roundTo(fa / n, 2);
    const p = roundTo(fr * 100, 2);

    accumulatedFa += fa;
    accumulatedFr = roundTo(accumulatedFa / n, 2);
    accumulatedP = roundTo(accumulatedFr * 100, 2);

    const intervalLabel = isLast
      ? `[${lower} - ${upper}]`
      : `[${lower} - ${upper})`;

    const stepExplanations = {
      mc: `Mc_${i} = \\frac{${lower} + ${upper}}{2} = ${mc}`,
      fa: `fa_${i} = ${fa}`,
      fr: `fr_${i} = \\frac{fa_${i}}{n} = \\frac{${fa}}{${n}} \\approx ${fr.toFixed(2)}`,
      p: `p_${i} = fr_${i} \\cdot 100 = ${fr.toFixed(2)} \\cdot 100 = ${p.toFixed(2)}\\%`,
      faAcum: i === 1 
        ? `Fa_1 = fa_1 = ${fa}`
        : `Fa_${i} = Fa_${i-1} + fa_${i} = ${accumulatedFa - fa} + ${fa} = ${accumulatedFa}`,
      frAcum: i === 1
        ? `Fr_1 = fr_1 = ${fr.toFixed(2)}`
        : `Fr_${i} = Fr_${i-1} + fr_${i} = ${(accumulatedFr - fr).toFixed(2)} + ${fr.toFixed(2)} = ${accumulatedFr.toFixed(2)}`,
      pAcum: i === 1
        ? `P_1 = p_1 = ${p.toFixed(2)}\\%`
        : `P_${i} = Fr_${i} \\cdot 100 = ${accumulatedFr.toFixed(2)} \\cdot 100 = ${accumulatedP.toFixed(2)}\\%`,
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

  let totalFa = 0;
  let totalFr = 0;
  let totalP = 0;

  for (const r of rows) {
    totalFa += r.frecuenciaAbsoluta;
    totalFr += r.frecuenciaRelativa;
    totalP += r.porcentaje;
  }

  const sqrtVal = Math.sqrt(n);

  const stepByStepDerivation = !params.userProvided
    ? {
        rangoFormula: `R = X_{max} - X_{min}`,
        rangoValue: `R = ${params.xmax} - ${params.xmin} = ${params.rango}`,
        kFormula: `k = \\sqrt{n}`,
        kValue: params.isExactRoot
          ? `k = \\sqrt{${n}} = ${params.k} (Raíz exacta)`
          : `k = \\sqrt{${n}} \\approx ${sqrtVal.toFixed(2)} \\rightarrow k = ${params.k} (Redondeo superior a uno más)`,
        amplitudFormula: `A = \\frac{R}{k}`,
        amplitudValue: `A = \\frac{${params.rango}}{${params.k}} = ${(params.rango / params.k).toFixed(2)} \\approx ${params.amplitud}`,
      }
    : undefined;

  return {
    variableName,
    unit,
    sampleSize: n,
    sortedValues,
    groupedVariableType,
    parameters: params,
    rows,
    totals: {
      totalFa: totalFa,
      totalFr: roundTo(totalFr, 2),
      totalP: roundTo(totalP, 2),
      label: 'Suma total',
    },
    stepByStepDerivation,
  };
}

/**
 * MÓDULO 2: Generación de Tabla de Frecuencias Simples (Cuantitativas y Cualitativas)
 * Las frecuencias relativas (fr) y acumuladas (Fr) se redondean a 2 decimales.
 */
export function generateSimpleFrequencyTable(
  variableName: string,
  unit: string,
  rawValues: (number | string)[],
  variableType: 'quantitative' | 'qualitative' = 'quantitative'
): SimpleFrequencyTableResult {
  const n = rawValues.length;

  if (n === 0) {
    throw new Error('El conjunto de datos no puede estar vacío.');
  }

  // Conteo de frecuencias
  const frequencyMap = new Map<string | number, number>();
  const orderArray: (string | number)[] = [];

  for (const val of rawValues) {
    const key = typeof val === 'number' ? val : String(val).trim();
    if (!frequencyMap.has(key)) {
      frequencyMap.set(key, 0);
      orderArray.push(key);
    }
    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  }

  // Ordenar: si es cuantitativo, numéricamente. Si es cualitativo, preservar orden de aparición o alfabético.
  let sortedKeys = [...orderArray];
  if (variableType === 'quantitative' && sortedKeys.every(k => typeof k === 'number')) {
    sortedKeys = (sortedKeys as number[]).sort((a, b) => a - b);
  }

  const rows: SimpleFrequencyRow[] = [];

  let accumulatedFa = 0;
  let accumulatedFr = 0;
  let accumulatedP = 0;
  let index = 1;

  for (const val of sortedKeys) {
    const fa = frequencyMap.get(val) || 0;
    // Redondeo exacto a 2 decimales para fr y p obtenido de fr * 100
    const fr = roundTo(fa / n, 2);
    const p = roundTo(fr * 100, 2);

    accumulatedFa += fa;
    accumulatedFr = roundTo(accumulatedFa / n, 2);
    accumulatedP = roundTo(accumulatedFr * 100, 2);

    const stepExplanations = {
      fa: `fa_${index} = ${fa}`,
      fr: `fr_${index} = \\frac{fa_${index}}{n} = \\frac{${fa}}{${n}} \\approx ${fr.toFixed(2)}`,
      p: `p_${index} = fr_${index} \\cdot 100 = ${fr.toFixed(2)} \\cdot 100 = ${p.toFixed(2)}\\%`,
      faAcum: index === 1
        ? `Fa_1 = fa_1 = ${fa}`
        : `Fa_${index} = Fa_${index-1} + fa_${index} = ${accumulatedFa - fa} + ${fa} = ${accumulatedFa}`,
      frAcum: index === 1
        ? `Fr_1 = fr_1 = ${fr.toFixed(2)}`
        : `Fr_${index} = Fr_${index-1} + fr_${index} = ${(accumulatedFr - fr).toFixed(2)} + ${fr.toFixed(2)} = ${accumulatedFr.toFixed(2)}`,
      pAcum: index === 1
        ? `P_1 = p_1 = ${p.toFixed(2)}\\%`
        : `P_${index} = Fr_${index} \\cdot 100 = ${accumulatedFr.toFixed(2)} \\cdot 100 = ${accumulatedP.toFixed(2)}\\%`,
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
    unit: unit || (variableType === 'qualitative' ? '' : 'u'),
    sampleSize: n,
    variableType,
    rows,
    totals: {
      totalFa: totalFa,
      totalFr: roundTo(totalFr, 2),
      totalP: roundTo(totalP, 2),
      label: 'Suma total',
    },
  };
}

/**
 * MÓDULO 3: Generación de Tabla de Contingencia (Bivariada) y Parser de Pares
 */
export interface ContingencyDataEntry {
  x: string;
  y: string;
  count?: number;
}

/**
 * Parsea un string de datos bivariados para Tabla de Contingencia
 * Admite:
 * 1. Observaciones individuales separadas por saltos de línea o ';':
 *    "Mecanizado, Cumple Siempre"
 *    "Soldadura - Uso Parcial"
 * 2. Pares con frecuencias o multiplicadores:
 *    "Mecanizado, Cumple Siempre: 12" o "12x Soldadura, Uso Parcial"
 * 3. Copiado y pegado directo desde Excel (delimitado por tabulaciones '\t')
 */
export function parseContingencyDataString(input: string): ContingencyDataEntry[] {
  if (!input || !input.trim()) return [];

  let rawLines: string[] = [];
  if (input.includes('\n')) {
    rawLines = input.split('\n');
  } else if (input.includes(';')) {
    rawLines = input.split(';');
  } else {
    rawLines = [input];
  }

  const entries: ContingencyDataEntry[] = [];

  for (const rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line) continue;

    let count = 1;

    // Multiplicador inicial: ej. "12x Mecanizado, Cumple" o "12 * Mecanizado, Cumple"
    const leadingMultiplierMatch = line.match(/^(\d+)\s*[xX*]\s*(.+)$/);
    if (leadingMultiplierMatch) {
      count = parseInt(leadingMultiplierMatch[1], 10) || 1;
      line = leadingMultiplierMatch[2].trim();
    } else {
      // Conteo final con delimitador explícito: ej. ": 12", "= 12", "(12)"
      const trailingCountMatch = line.match(/^(.+?)(?:[:=]|\s*\()\s*(\d+)\s*\)?$/);
      if (trailingCountMatch) {
        count = parseInt(trailingCountMatch[2], 10) || 1;
        line = trailingCountMatch[1].trim();
      }
    }

    let x = '';
    let y = '';

    if (line.includes('\t')) {
      // Pegado directo desde columnas de Excel
      const parts = line.split('\t').map((p) => p.trim()).filter((p) => p.length > 0);
      if (parts.length >= 2) {
        x = parts[0];
        y = parts[1];
        if (parts.length >= 3 && !isNaN(Number(parts[2]))) {
          count = parseInt(parts[2], 10) || count;
        }
      }
    } else if (line.includes(' | ') || line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim()).filter((p) => p.length > 0);
      if (parts.length >= 2) {
        x = parts[0];
        y = parts[1];
        if (parts.length >= 3 && !isNaN(Number(parts[2]))) {
          count = parseInt(parts[2], 10) || count;
        }
      }
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ').map((p) => p.trim());
      x = parts[0];
      y = parts.slice(1).join(' - ');
    } else if (line.includes(' / ')) {
      const parts = line.split(' / ').map((p) => p.trim());
      x = parts[0];
      y = parts.slice(1).join(' / ');
    } else if (line.includes(',')) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length === 2) {
        x = parts[0];
        y = parts[1];
      } else if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        if (!isNaN(Number(lastPart)) && count === 1) {
          count = parseInt(lastPart, 10) || 1;
          x = parts[0];
          y = parts.slice(1, -1).join(', ');
        } else {
          x = parts[0];
          y = parts.slice(1).join(', ');
        }
      }
    } else if (line.includes(';')) {
      const parts = line.split(';').map((p) => p.trim());
      if (parts.length >= 2) {
        x = parts[0];
        y = parts[1];
      }
    }

    if (x && y) {
      entries.push({
        x: x.trim(),
        y: y.trim(),
        count: Math.max(1, count),
      });
    }
  }

  return entries;
}

/**
 * Convierte un conjunto de pares bivariados a string formateado por líneas
 */
export function formatContingencyPairsToString(pairs: { x: string; y: string; count?: number }[]): string {
  if (!pairs || pairs.length === 0) return '';
  return pairs
    .map((p) => (p.count && p.count > 1 ? `${p.x}, ${p.y}: ${p.count}` : `${p.x}, ${p.y}`))
    .join('\n');
}

/**
 * Genera pares aleatorios basados en categorías dadas y tamaño de muestra n
 */
export function generateRandomContingencyPairs(
  rowCategories: string[],
  colCategories: string[],
  targetN: number
): { x: string; y: string }[] {
  if (rowCategories.length === 0 || colCategories.length === 0) return [];
  const safeN = Math.max(3, Math.min(500, targetN || 25));
  const pairs: { x: string; y: string }[] = [];

  for (let i = 0; i < safeN; i++) {
    const randomRow = rowCategories[Math.floor(Math.random() * rowCategories.length)];
    const randomCol = colCategories[Math.floor(Math.random() * colCategories.length)];
    pairs.push({ x: randomRow, y: randomCol });
  }

  return pairs;
}

export function generateContingencyTable(
  variableX: string,
  variableY: string,
  dataPairs: ContingencyDataEntry[]
): ContingencyTableResult {
  const n = dataPairs.length;
  if (n === 0) {
    throw new Error('El conjunto de datos bivariados no puede estar vacío.');
  }

  const rowCategoriesSet = new Set<string>();
  const colCategoriesSet = new Set<string>();

  for (const pair of dataPairs) {
    if (pair.x && pair.x.trim()) rowCategoriesSet.add(pair.x.trim());
    if (pair.y && pair.y.trim()) colCategoriesSet.add(pair.y.trim());
  }

  const rowCategories = Array.from(rowCategoriesSet);
  const colCategories = Array.from(colCategoriesSet);

  if (rowCategories.length === 0 || colCategories.length === 0) {
    throw new Error('Debe haber al menos una categoría en las filas y una en las columnas.');
  }

  const matrix: number[][] = rowCategories.map(() => 
    colCategories.map(() => 0)
  );

  const varXCountsMap = new Map<string, number>();
  const varYCountsMap = new Map<string, number>();

  for (const r of rowCategories) varXCountsMap.set(r, 0);
  for (const c of colCategories) varYCountsMap.set(c, 0);

  for (const pair of dataPairs) {
    const weight = Math.max(1, pair.count ?? 1);
    const rIdx = rowCategories.indexOf(pair.x.trim());
    const cIdx = colCategories.indexOf(pair.y.trim());
    if (rIdx >= 0 && cIdx >= 0) {
      matrix[rIdx][cIdx] += weight;
      varXCountsMap.set(pair.x.trim(), (varXCountsMap.get(pair.x.trim()) || 0) + weight);
      varYCountsMap.set(pair.y.trim(), (varYCountsMap.get(pair.y.trim()) || 0) + weight);
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
      varXCounts: rowCategories.map((cat) => ({ category: cat, count: varXCountsMap.get(cat) || 0 })),
      varYCounts: colCategories.map((cat) => ({ category: cat, count: varYCountsMap.get(cat) || 0 })),
    },
    step2JointFrequencies: 'Cada celda central fa_{ij} representa la cantidad simultánea de elementos que cumplen la condición de la fila i y de la columna j al mismo tiempo.',
    step3RowMarginals: rowCategories.map((cat, rIdx) => ({
      category: cat,
      calculation: matrix[rIdx].join(' + '),
      total: rowMarginalTotals[rIdx],
    })),
    step4ColMarginals: colCategories.map((cat, cIdx) => ({
      category: cat,
      calculation: matrix.map((r) => r[cIdx]).join(' + '),
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
 * CASOS PRÁCTICOS DE HIGIENE, SEGURIDAD Y MEDIO AMBIENTE
 */
export const SAFETY_PRESETS: SafetyPreset[] = [
  // --- FRECUENCIAS SIMPLES: CUALITATIVAS ---
  {
    id: 'cualitativa-ocupaciones',
    title: 'Ocupaciones Declaradas en Planta',
    chipLabel: 'Ocupaciones',
    category: 'Siniestralidad y Recursos Humanos',
    variableName: 'Ocupaciones declaradas',
    unit: 'Trabajadores',
    variableType: 'qualitative',
    description: 'Distribución de ocupaciones laborales y puestos de trabajo registrados en la empresa.',
    sampleSize: 25,
    recommendedType: 'simple',
    dataGenerator: () => [
      'Empleado/a', 'Empleado/a', 'Empleado/a', 'Empleado/a', 'Estudiante',
      'Empleado/a', 'Emprendedora', 'Empleado/a', 'Empleado/a', 'Empleado/a',
      'Estudiante', 'Empleado/a', 'Empleado/a', 'Emprendedora', 'Empleado/a',
      'Empleado/a', 'Empleado/a', 'Estudiante', 'Empleado/a', 'Empleado/a',
      'Empleado/a', 'Emprendedora', 'Empleado/a', 'Empleado/a', 'Empleado/a'
    ],
  },
  {
    id: 'cualitativa-lesiones',
    title: 'Tipo de Lesión más Frecuente en Planta',
    chipLabel: 'Tipos de Lesión',
    category: 'Siniestralidad y Medicina',
    variableName: 'Naturaleza de la Lesión',
    unit: 'Casos registrados',
    variableType: 'qualitative',
    description: 'Distribución de frecuencias cualitativas nominales de traumatismos y lesiones en operarios metalúrgicos.',
    sampleSize: 24,
    recommendedType: 'simple',
    dataGenerator: () => [
      'Corte en manos', 'Contusión', 'Quemadura térmica', 'Corte en manos', 'Esguince', 
      'Corte en manos', 'Contusión', 'Fractura', 'Quemadura térmica', 'Corte en manos',
      'Esguince', 'Contusión', 'Corte en manos', 'Quemadura térmica', 'Contusión',
      'Corte en manos', 'Esguince', 'Corte en manos', 'Contusión', 'Corte en manos',
      'Quemadura térmica', 'Esguince', 'Contusión', 'Corte en manos'
    ],
  },
  {
    id: 'cualitativa-epp-estado',
    title: 'Estado del Equipo de Protección (EPP)',
    chipLabel: 'Estado de EPP',
    category: 'Seguridad Operativa',
    variableName: 'Condición Operativa del EPP',
    unit: 'Elementos inspeccionados',
    variableType: 'qualitative',
    description: 'Auditoría cualitativa ordinal de elementos de protección personal (cascos, guantes, calzado).',
    sampleSize: 20,
    recommendedType: 'simple',
    dataGenerator: () => [
      'Excelente', 'Bueno', 'Bueno', 'Regular', 'Excelente',
      'Bueno', 'Deteriorado', 'Bueno', 'Regular', 'Excelente',
      'Bueno', 'Bueno', 'Deteriorado', 'Regular', 'Excelente',
      'Bueno', 'Bueno', 'Regular', 'Excelente', 'Bueno'
    ],
  },
  {
    id: 'cualitativa-riesgo-ergo',
    title: 'Nivel de Riesgo Ergonómico en Puestos',
    chipLabel: 'Riesgo Ergonómico',
    category: 'Ergonomía Laboral',
    variableName: 'Nivel de Riesgo (Método RULA)',
    unit: 'Puestos evaluados',
    variableType: 'qualitative',
    description: 'Clasificación cualitativa ordinal de posturas forzadas en líneas de producción.',
    sampleSize: 22,
    recommendedType: 'simple',
    dataGenerator: () => [
      'Riesgo Bajo', 'Riesgo Moderado', 'Riesgo Alto', 'Riesgo Moderado', 'Riesgo Bajo',
      'Riesgo Crítico', 'Riesgo Alto', 'Riesgo Moderado', 'Riesgo Bajo', 'Riesgo Alto',
      'Riesgo Moderado', 'Riesgo Crítico', 'Riesgo Moderado', 'Riesgo Alto', 'Riesgo Bajo',
      'Riesgo Moderado', 'Riesgo Alto', 'Riesgo Bajo', 'Riesgo Moderado', 'Riesgo Alto',
      'Riesgo Moderado', 'Riesgo Bajo'
    ],
  },

  // --- FRECUENCIAS SIMPLES: CUANTITATIVAS ---
  {
    id: 'dias-baja',
    title: 'Días de Licencia por Accidente',
    chipLabel: 'Días de Licencia',
    category: 'Costos y Siniestralidad',
    variableName: 'Jornadas de Trabajo Perdidas',
    unit: 'Días corridos',
    variableType: 'quantitative',
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
    chipLabel: 'Incidentes / Mes',
    category: 'Siniestralidad',
    variableName: 'Conteo de Cuasi-Accidentes Mensuales',
    unit: 'Incidentes',
    variableType: 'quantitative',
    description: 'Registro de desvíos y eventos sin lesión reportados en planta.',
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
    chipLabel: 'Auditorías 5S',
    category: 'Prevención Operativa',
    variableName: 'Calificación de Orden y Limpieza',
    unit: 'Puntos',
    variableType: 'quantitative',
    description: 'Calificaciones mensuales de orden y limpieza en células de trabajo.',
    sampleSize: 24,
    recommendedType: 'simple',
    dataGenerator: () => [
      7, 8, 6, 9, 8, 7, 10, 6, 8, 9, 
      7, 8, 5, 9, 8, 10, 7, 6, 8, 9, 
      8, 7, 9, 10
    ],
  },

  // --- FRECUENCIAS AGRUPADAS: CUANTITATIVAS ---
  {
    id: 'ruido-db',
    title: 'Niveles de Ruido en Taller Metalúrgico',
    chipLabel: 'Ruido Sonoro (dBA)',
    category: 'Higiene Industrial',
    variableName: 'Nivel Sonoro Continuo Equivalente',
    unit: 'dBA',
    description: 'Mediciones de exposición sonora ocupacional con sonómetro integrador (Límite legal: 85 dBA).',
    sampleSize: 25,
    recommendedType: 'grouped',
    groupedVariableType: 'continuous',
    dataGenerator: () => [
      78.4, 82.1, 85.6, 88.0, 91.2, 84.3, 79.8, 87.5, 92.4, 86.1,
      83.7, 89.9, 94.2, 81.0, 88.6, 90.5, 85.0, 77.9, 83.2, 87.1,
      93.5, 86.8, 80.5, 89.1, 95.0
    ],
  },
  {
    id: 'edades-operarios',
    title: 'Edades de Trabajadores en Obras',
    chipLabel: 'Edades (Años)',
    category: 'Ergonomía y Salud',
    variableName: 'Edad del Personal Operativo',
    unit: 'Años',
    description: 'Registro etario de operarios de estiba y montaje para evaluación ergonómica (Criterio ISO 11228).',
    sampleSize: 30,
    recommendedType: 'grouped',
    groupedVariableType: 'discrete',
    dataGenerator: () => [
      21, 24, 28, 35, 42, 47, 53, 22, 31, 38, 
      45, 50, 58, 26, 34, 41, 49, 23, 29, 36, 
      44, 52, 25, 33, 40, 48, 55, 27, 37, 46
    ],
  },
  {
    id: 'iluminacion-lux',
    title: 'Nivel de Iluminación en Ensamble',
    chipLabel: 'Iluminación (Lux)',
    category: 'Higiene Industrial',
    variableName: 'Iluminancia en Plano de Trabajo',
    unit: 'Lux',
    description: 'Mediciones de iluminancia con luxómetro calibrado en puestos de control de calidad.',
    sampleSize: 24,
    recommendedType: 'grouped',
    groupedVariableType: 'discrete',
    dataGenerator: () => [
      240, 310, 450, 180, 520, 490, 380, 600, 
      290, 340, 410, 480, 530, 220, 360, 420, 
      510, 580, 300, 370, 440, 500, 270, 460
    ],
  },
  {
    id: 'co-mineria',
    title: 'Monóxido de Carbono en Minería',
    chipLabel: 'Monóxido CO (ppm)',
    category: 'Toxicología y Ventilación',
    variableName: 'Concentración de CO en Galerías',
    unit: 'ppm',
    description: 'Monitoreo ambiental de gas tóxico en interior de mina (Límite CMP: 25 ppm).',
    sampleSize: 28,
    recommendedType: 'grouped',
    groupedVariableType: 'continuous',
    dataGenerator: () => [
      8.5, 12.0, 15.4, 22.1, 27.5, 18.3, 14.2, 9.8, 24.0, 31.2,
      19.5, 16.8, 11.2, 25.4, 28.9, 13.6, 17.1, 21.8, 10.4, 15.9,
      29.0, 33.4, 18.0, 22.7, 14.5, 26.1, 12.8, 20.3
    ],
  },
  {
    id: 'tgbh-termico',
    title: 'Estrés Térmico TGBH en Fundición',
    chipLabel: 'Estrés Térmico (°C)',
    category: 'Higiene Industrial',
    variableName: 'Índice TGBH Interior',
    unit: '°C',
    description: 'Evaluación de carga térmica por calor radiante y metabólico en fundición metalúrgica.',
    sampleSize: 20,
    recommendedType: 'grouped',
    groupedVariableType: 'continuous',
    dataGenerator: () => [
      26.5, 28.2, 30.1, 31.8, 33.5, 29.4, 27.8, 32.0, 34.2, 30.8,
      28.9, 31.1, 32.6, 29.8, 33.9, 35.0, 27.2, 30.4, 32.1, 34.6
    ],
  },
  {
    id: 'polvo-cantera',
    title: 'Polvo Respirable en Molienda',
    chipLabel: 'Polvo Respirable',
    category: 'Control Ambiental',
    variableName: 'Fracción Respirable de Polvo',
    unit: 'mg/m³',
    description: 'Muestreo gravimétrico con ciclón para determinar exposición a sílice libre cristalina.',
    sampleSize: 22,
    recommendedType: 'grouped',
    groupedVariableType: 'continuous',
    dataGenerator: () => [
      0.8, 1.4, 2.1, 3.5, 4.2, 1.8, 2.9, 3.1, 5.0, 2.4,
      1.1, 2.7, 3.8, 4.6, 1.9, 3.0, 2.2, 4.0, 1.5, 3.3, 4.8, 2.6
    ],
  },

  // --- CONTINGENCIA (BIVARIADAS) ---
  {
    id: 'contingencia-epp',
    title: 'Sector vs. Cumplimiento de EPP',
    chipLabel: 'Sector vs. EPP',
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
    chipLabel: 'Turno vs. Gravedad',
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
    chipLabel: 'Riesgo vs. Permiso ATS',
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
  {
    id: 'contingencia-lesion-cuerpo',
    title: 'Naturaleza de Lesión vs. Zona Corporal Afectada',
    chipLabel: 'Lesión vs. Zona Cuerpo',
    category: 'Medicina Laboral y Traumatología',
    variableName: 'Tipo de Lesión vs. Zona del Cuerpo',
    unit: 'Casos clínicos',
    description: 'Registro de accidentes cruzando el tipo de lesión con la parte anatómica afectada.',
    sampleSize: 48,
    recommendedType: 'contingency',
    defaultXName: 'Tipo de Lesión Ocurrida',
    defaultYName: 'Zona Corporal Afectada',
    dataGenerator: () => [],
    bivariateDataGenerator: () => {
      const data: { x: string; y: string }[] = [];
      const lesiones = ['Corte / Laceración', 'Contusión / Golpe', 'Quemadura', 'Esguince'];
      const zonas = ['Manos y Dedos', 'Ojos y Rostro', 'Espalda / Columna', 'Miembros Inferiores'];
      const counts: Record<string, Record<string, number>> = {
        'Corte / Laceración': { 'Manos y Dedos': 14, 'Ojos y Rostro': 2, 'Espalda / Columna': 0, 'Miembros Inferiores': 3 },
        'Contusión / Golpe': { 'Manos y Dedos': 6, 'Ojos y Rostro': 1, 'Espalda / Columna': 4, 'Miembros Inferiores': 5 },
        'Quemadura': { 'Manos y Dedos': 4, 'Ojos y Rostro': 3, 'Espalda / Columna': 0, 'Miembros Inferiores': 1 },
        'Esguince': { 'Manos y Dedos': 1, 'Ojos y Rostro': 0, 'Espalda / Columna': 3, 'Miembros Inferiores': 1 },
      };
      for (const l of lesiones) {
        for (const z of zonas) {
          const count = counts[l][z];
          for (let i = 0; i < count; i++) data.push({ x: l, y: z });
        }
      }
      return data;
    },
  },
  {
    id: 'contingencia-antiguedad-desvios',
    title: 'Antigüedad Laboral vs. Tipo de Acto Inseguro',
    chipLabel: 'Antigüedad vs. Desvío',
    category: 'Psicología y Comportamiento Seguro',
    variableName: 'Experiencia vs. Acto Inseguro',
    unit: 'Observaciones preventivas',
    description: 'Estudio de conducta laboral contrastando la experiencia del operario con el desvío cometido.',
    sampleSize: 42,
    recommendedType: 'contingency',
    defaultXName: 'Antigüedad del Trabajador',
    defaultYName: 'Tipo de Acto Inseguro Detectado',
    dataGenerator: () => [],
    bivariateDataGenerator: () => {
      const data: { x: string; y: string }[] = [];
      const antiguedades = ['< 1 Año (Ingresante)', '1 a 5 Años (Intermedio)', '> 5 Años (Experimentado)'];
      const actos = ['Omisión de EPP', 'Uso Indebido de Herramienta', 'Exceso de Confianza', 'Operación a Velocidad Insegura'];
      const counts: Record<string, Record<string, number>> = {
        '< 1 Año (Ingresante)': { 'Omisión de EPP': 8, 'Uso Indebido de Herramienta': 6, 'Exceso de Confianza': 1, 'Operación a Velocidad Insegura': 2 },
        '1 a 5 Años (Intermedio)': { 'Omisión de EPP': 4, 'Uso Indebido de Herramienta': 3, 'Exceso de Confianza': 4, 'Operación a Velocidad Insegura': 3 },
        '> 5 Años (Experimentado)': { 'Omisión de EPP': 2, 'Uso Indebido de Herramienta': 1, 'Exceso de Confianza': 6, 'Operación a Velocidad Insegura': 2 },
      };
      for (const a of antiguedades) {
        for (const act of actos) {
          const count = counts[a][act];
          for (let i = 0; i < count; i++) data.push({ x: a, y: act });
        }
      }
      return data;
    },
  },
  {
    id: 'contingencia-ruido-proteccion',
    title: 'Nivel Sonoro del Área vs. Uso de Protección Auditiva',
    chipLabel: 'Ruido vs. Protección',
    category: 'Higiene y Salud Auditiva',
    variableName: 'Nivel Sonoro vs. Adhesión a Protector',
    unit: 'Operarios auditados',
    description: 'Evaluación higiénica del cumplimiento de uso de protectores auditivos según el nivel de decibeles del área.',
    sampleSize: 40,
    recommendedType: 'contingency',
    defaultXName: 'Nivel de Ruido en el Sector',
    defaultYName: 'Uso de Protección Auditiva',
    dataGenerator: () => [],
    bivariateDataGenerator: () => {
      const data: { x: string; y: string }[] = [];
      const niveles = ['Alto Riesgo (>85 dBA)', 'Riesgo Moderado (80-85 dBA)', 'Área Confort (<80 dBA)'];
      const usos = ['Uso Continuo y Correcto', 'Uso Intermitente', 'No Utiliza'];
      const counts: Record<string, Record<string, number>> = {
        'Alto Riesgo (>85 dBA)': { 'Uso Continuo y Correcto': 12, 'Uso Intermitente': 3, 'No Utiliza': 1 },
        'Riesgo Moderado (80-85 dBA)': { 'Uso Continuo y Correcto': 6, 'Uso Intermitente': 7, 'No Utiliza': 2 },
        'Área Confort (<80 dBA)': { 'Uso Continuo y Correcto': 1, 'Uso Intermitente': 2, 'No Utiliza': 6 },
      };
      for (const n of niveles) {
        for (const u of usos) {
          const count = counts[n][u];
          for (let i = 0; i < count; i++) data.push({ x: n, y: u });
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
    title: 'UNIDAD I: Recolección, Organización de Datos e Indicadores de Siniestralidad',
    subtitle: 'Estadística Descriptiva, Tablas de Frecuencias e Indicadores Oficiales de Siniestralidad (SRT)',
    badge: 'Unidad 1',
    description: 'Herramientas metodológicas para diagnosticar ambientes laborales, medir variabilidad, construir tablas de frecuencias simples y agrupadas, y calcular los indicadores oficiales de accidentabilidad laboral según normativa SRT / IRAM 3800 / OIT.',
    topics: [
      {
        title: 'Tema 1: Introducción y Fuentes de Información en SySO',
        summary: 'Por qué estudiamos Estadística en Higiene y Seguridad, variabilidad en ambientes de trabajo, delimitación de Población, Muestra e Individuo (Unidad de análisis), Variables Cualitativas (Nominales y Ordinales) y Cuantitativas (Discretas y Continuas), Fuentes Primarias vs. Secundarias, Métodos de recolección (observación, encuestas, mediciones instrumentales, registros) y control de sesgos.',
      },
      {
        title: 'Tema 2: Organización de Datos en Tablas de Frecuencias Simples',
        summary: 'Estructura profesional de la tabla simple: valor/categoría xi, frecuencia absoluta fa (n = Total fa), frecuencia relativa fr = fa / n (Total = 1,00), porcentaje p = fr × 100 (Total = 100%), frecuencias acumuladas Fa, Fr y P. Criterio pedagógico oficial: Prohibición del símbolo abstracto Σ y uso explícito de "Total", "Suma total" y "Gran Total".',
        keyFormulas: [
          { name: 'Frecuencia Relativa (fr)', formula: 'fr = \\frac{fa}{n}', note: 'Proporción de observaciones redondeada a 2 decimales (Total = 1,00).' },
          { name: 'Porcentaje (p %)', formula: 'p = fr \\cdot 100', note: 'Expresión porcentual redondeada a 2 decimales (Total = 100,00%).' },
          { name: 'Frecuencia Absoluta Acumulada (Fa)', formula: 'Fa_i = Fa_{i-1} + fa_i', note: 'Suma progresiva de observaciones acumuladas.' },
          { name: 'Frecuencia Relativa Acumulada (Fr)', formula: 'Fr_i = \\frac{Fa_i}{n}', note: 'Proporción acumulada de observaciones.' },
          { name: 'Porcentaje Acumulado (P %)', formula: 'P = Fr \\cdot 100', note: 'Porcentaje acumulado (última fila = 100,00%).' },
        ]
      },
      {
        title: 'Tema 3: Tablas de Distribución de Frecuencias Agrupadas por Intervalos',
        summary: 'Agrupamiento en clases cuando la variable es continua o tiene gran dispersión. Determinación del Rango R = Xmax - Xmin, Regla de la Raíz Cuadrada k = √n, Amplitud A = R / k, Límites de clase [Li, Ls) y Marca de Clase Mc = (Li + Ls) / 2.',
        keyFormulas: [
          { name: 'Rango muestral (R)', formula: 'R = X_{\\text{max}} - X_{\\text{min}}', note: 'Diferencia entre el valor extremo superior e inferior.' },
          { name: 'Regla de la Raíz Cuadrada (k)', formula: 'k = \\sqrt{n}', note: 'Cantidad de intervalos; redondeo al entero superior o más próximo.' },
          { name: 'Amplitud de intervalo (A)', formula: 'A = \\frac{R}{k}', note: 'Ancho uniforme de cada intervalo de clase.' },
          { name: 'Marca de Clase (Mc)', formula: 'Mc = \\frac{L_i + L_s}{2}', note: 'Punto medio representativo del intervalo.' },
        ]
      },
      {
        title: 'Tema 4: Indicadores Oficiales de Siniestralidad Laboral (SRT / IRAM / OIT)',
        summary: 'Medidas relativas fundamentales (Proporción Parte-Todo, Razón Parte-Parte y Tasa con constante K). Los 4 índices oficiales exigidos por la Superintendencia de Riesgos del Trabajo: Índice de Frecuencia (IF), Índice de Gravedad (IG), Índice de Incidencia (II) y Duración Media de las Bajas (DM), con su relación matemática IG = IF × DM y redacción del diagnóstico preventivo.',
        keyFormulas: [
          { name: 'Proporción (Parte - Todo)', formula: '\\text{Proporción} = \\frac{A}{N} \\quad (0 \\le \\text{Prop.} \\le 1)', note: 'El numerador está incluido en el denominador.' },
          { name: 'Razón (Parte - Parte)', formula: '\\text{Razón} = \\frac{A}{B}', note: 'Compara dos grupos independientes (ej. operarios por técnico).' },
          { name: 'Tasa General', formula: '\\text{Tasa} = \\left( \\frac{\\text{Eventos}}{\\text{Exposición}} \\right) \\cdot K', note: 'K es una constante estandarizada (1.000 o 1.000.000).' },
          { name: 'Índice de Frecuencia (IF)', formula: 'IF = \\frac{\\text{N° Accidentes con Baja} \\cdot 1.000.000}{\\text{Horas-Hombre Trabajadas (HHT)}}', note: 'Accidentes con baja médica por cada millón de horas trabajadas.' },
          { name: 'Índice de Gravedad (IG)', formula: 'IG = \\frac{\\text{Total Días Perdidos} \\cdot 1.000.000}{\\text{Horas-Hombre Trabajadas (HHT)}}', note: 'Jornadas perdidas por cada millón de horas trabajadas.' },
          { name: 'Índice de Incidencia (II)', formula: 'II = \\frac{\\text{N° Accidentes con Baja} \\cdot 1.000}{\\text{N° Promedio Trabajadores Expuestos}}', note: 'Accidentes por cada mil trabajadores expuestos.' },
          { name: 'Duración Media de las Bajas (DM)', formula: 'DM = \\frac{\\text{Total Días Perdidos}}{\\text{N° Accidentes con Baja}}', note: 'Promedio de días de baja médica por cada accidente.' },
          { name: 'Relación entre Indicadores', formula: 'IG = IF \\cdot DM', note: 'Coherencia matemática entre gravedad, frecuencia y duración media.' },
        ]
      }
    ],
    theoreticalNote: {
      title: 'Apunte Teórico Oficial - Unidad 1: Recolección, Organización de Datos e Indicadores de Siniestralidad',
      fileName: 'Apunte_Unidad_1_Estadistica_Descriptiva_IES_Belen.pdf',
      fileSize: '1.8 MB',
      pages: 14,
      summary: 'Desarrollo conceptual completo de variabilidad en ambientes laborales, población, muestra e individuo, clasificación de variables, construcción de tablas de frecuencias simples y agrupadas (Regla de la Raíz k=√n), medidas relativas (proporción, razón, tasa) y los 4 indicadores oficiales de siniestralidad de la SRT.',
      contentOutline: [
        '1. Introducción y Fuentes de Información: Variabilidad, Población, Muestra e Individuo, Variables Estadísticas, Fuentes y Métodos de Recolección.',
        '2. Organización de Datos en Tablas de Frecuencias Simples: fa, fr, p, Fa, Fr, P y Criterio Pedagógico sin Σ.',
        '3. Tablas de Distribución de Frecuencias Agrupadas por Intervalos: Rango, Regla de la Raíz k, Amplitud, Marca de Clase y Gráficos.',
        '4. Medidas Relativas: Proporción (Parte-Todo), Razón (Parte-Parte) y Tasa (Evento vs. Exposición al Riesgo con constante K).',
        '5. Indicadores Oficiales de Siniestralidad (SRT / IRAM 3800 / OIT): IF, IG, II, DM, Coherencia Matemática y Redacción de Informes Técnicos.',
      ]
    },
    practicalGuide: {
      title: 'Guía de Trabajos Prácticos N° 1: Organización de Datos e Indicadores de Siniestralidad',
      tpNumber: 'T.P. N° 1',
      fileName: 'TP1_Estadistica_Descriptiva_Guia_Alumnos.pdf',
      fileSize: '950 KB',
      exercisesCount: 4,
      summary: 'Guía obligatoria de resolución de problemas con casos reales de accidentabilidad, mediciones sonométricas en talleres y cálculo de indicadores oficiales de siniestralidad laboral (SRT).',
      sampleExercises: [
        {
          number: 1,
          statement: 'En un taller metalmecánico se registraron 20 accidentes durante el último año clasificados por su causa principal. Construya la tabla de distribución de frecuencias simples (fa, fr, p, Fa, Fr, P) e interprete qué porcentaje de los eventos correspondió a problemas de Orden y Limpieza.',
          dataSample: 'Desorden; Falla de máquina; Desorden; Falta de EPP; Desorden; Desorden; Falla de máquina; Desorden; Falta de EPP; Desorden; Falla de máquina; Desorden; Falta de EPP; Desorden; Falla de máquina; Falta de EPP; Desorden; Desorden; Falla de máquina; Desorden'
        },
        {
          number: 2,
          statement: 'En una planta industrial se registraron los niveles sonoros continuos equivalentes (en dBA) durante una jornada de 8 horas en 25 puestos de trabajo. Determine el Rango (R), la cantidad de intervalos (k) mediante la regla de la raíz cuadrada, la Amplitud (A), construya la tabla de frecuencias agrupadas con marcas de clase (Mc) y evalúe la exposición al ruido.',
          dataSample: '78.4; 82.1; 85.6; 88.0; 91.2; 84.3; 79.8; 87.5; 92.4; 86.1; 83.7; 89.9; 94.2; 81.0; 88.6; 90.5; 85.0; 77.9; 83.2; 87.1; 93.5; 86.8; 80.5; 89.1; 95.0'
        },
        {
          number: 3,
          statement: 'Una empresa metalúrgica cuenta con 100 operarios expuestos en su nómina, quienes trabajaron un total de 52.000 horas-hombre en el trimestre. En dicho período se registraron 15 accidentes con baja laboral que acumularon 180 jornadas de trabajo perdidas. Calcule los 4 Indicadores Oficiales de Siniestralidad (IF, IG, II, DM) y verifique la relación matemática IG = IF × DM.',
          dataSample: 'Trabajadores = 100; HHT = 52.000 hs; Accidentes con Baja = 15; Días Perdidos = 180'
        },
        {
          number: 4,
          statement: 'A partir de los indicadores calculados en el Ejercicio 3, elabore el informe técnico preventivo con diagnóstico de severidad, evaluación del tiempo perdido y recomendaciones prioritarias para la gerencia de planta.',
          dataSample: 'IF = 288,46 acc/10^6 HHT; IG = 3.461,54 días/10^6 HHT; II = 150 acc/10^3 trab; DM = 12 días/acc'
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

/**
 * CÁLCULO OFICIAL DE INDICADORES DE SINIESTRALIDAD (TEMA 4 - UNIDAD 1)
 * Normativa SRT / IRAM 3800 / OIT
 */
export function calculateSafetyIndicators(input: SafetyIndicatorsInput): SafetyIndicatorsResult {
  const {
    establecimiento = 'Planta Industrial General',
    periodo = 'Trimestre Anual',
    accidentesConBaja,
    diasPerdidos,
    horasHombreTrabajadas,
    trabajadoresExpuestos
  } = input;

  const N = Math.max(0, Number(accidentesConBaja) || 0);
  const J = Math.max(0, Number(diasPerdidos) || 0);
  const HHT = Math.max(1, Number(horasHombreTrabajadas) || 1);
  const Trab = Math.max(1, Number(trabajadoresExpuestos) || 1);

  // 1. Índice de Frecuencia (IF) = (N * 1.000.000) / HHT
  const indiceFrecuencia = roundTo((N * 1000000) / HHT, 2);

  // 2. Índice de Gravedad (IG) = (J * 1.000.000) / HHT
  const indiceGravedad = roundTo((J * 1000000) / HHT, 2);

  // 3. Índice de Incidencia (II) = (N * 1.000) / Trab
  const indiceIncidencia = roundTo((N * 1000) / Trab, 2);

  // 4. Duración Media de las Bajas (DM) = J / N
  const duracionMedia = N > 0 ? roundTo(J / N, 2) : 0;

  // Medidas relativas previas
  const proporcionAccidentados = roundTo(N / Trab, 4);
  const porcentajeAccidentados = roundTo(proporcionAccidentados * 100, 2);
  const tasaCrudaHoras = roundTo(N / HHT, 8);
  const razonDiasPorAccidente = duracionMedia;

  // Diagnóstico técnico institucional
  const diagnostico = {
    severidad: `Durante el período evaluado (${periodo}), en el establecimiento "${establecimiento}", se registró un Índice de Frecuencia de ${indiceFrecuencia.toFixed(2)} accidentes con baja laboral por cada millón de horas persona efectivamente trabajadas, junto a un Índice de Incidencia de ${indiceIncidencia.toFixed(2)} accidentes por cada 1.000 trabajadores. Esto indica que el ${porcentajeAccidentados.toFixed(2)}% de la nómina laboral sufrió algún evento incapacitante durante el período.`,
    tiempoPerdido: `La Duración Media de las Bajas (DM) se ubicó en ${duracionMedia.toFixed(2)} días perdidos por accidente, generando un Índice de Gravedad (IG) acumulado de ${indiceGravedad.toFixed(2)} jornadas perdidas por cada millón de horas persona trabajadas. La relación matemática IG = IF × DM (${indiceFrecuencia.toFixed(2)} × ${duracionMedia.toFixed(2)} = ${(indiceFrecuencia * duracionMedia).toFixed(2)}) confirma la coherencia global de las métricas de severidad.`,
    recomendacion: `El impacto de ${J} días de inactividad médica representa una pérdida sustancial de capacidad operativa y costos de la seguridad asociados. Se recomienda cruzar estos indicadores con las tablas de frecuencias por sector y causa para concentrar las inspecciones preventivas y auditorías de EPP en las áreas de mayor siniestralidad.`
  };

  return {
    establecimiento,
    periodo,
    accidentesConBaja: N,
    diasPerdidos: J,
    horasHombreTrabajadas: HHT,
    trabajadoresExpuestos: Trab,
    indiceFrecuencia,
    indiceGravedad,
    indiceIncidencia,
    duracionMedia,
    proporcionAccidentados,
    porcentajeAccidentados,
    tasaCrudaHoras,
    razonDiasPorAccidente,
    diagnostico
  };
}

/**
 * Presets de Indicadores de Siniestralidad (Casos Prácticos de Cátedra)
 */
export const SAFETY_INDICATOR_PRESETS: SafetyIndicatorPreset[] = [
  {
    id: 'indicador-metalurgica-u1',
    title: 'Taller Metalmecánico (Caso Cátedra Unidad 1)',
    chipLabel: 'Metalmecánica (100 trab.)',
    establecimiento: 'Metalúrgica Belén S.A.',
    periodo: '1° Trimestre Anual',
    sector: 'Mecanizado y Soldadura',
    accidentesConBaja: 15,
    diasPerdidos: 180,
    horasHombreTrabajadas: 52000,
    trabajadoresExpuestos: 100,
    description: 'Caso oficial de la cátedra con 100 operarios expuestos en 13 semanas (40 hs/sem), con 15 bajas y 180 jornadas perdidas.'
  },
  {
    id: 'indicador-construccion-obra',
    title: 'Obra de Construcción Civil',
    chipLabel: 'Construcción (150 trab.)',
    establecimiento: 'Constructora del Valle S.R.L.',
    periodo: 'Semestre Operativo',
    sector: 'Estructuras y Encofrado',
    accidentesConBaja: 8,
    diasPerdidos: 120,
    horasHombreTrabajadas: 300000,
    trabajadoresExpuestos: 150,
    description: 'Auditoría semestral en obra de construcción con 150 trabajadores y 300.000 horas hombre.'
  },
  {
    id: 'indicador-mineria-planta',
    title: 'Yacimiento Minero Subterráneo',
    chipLabel: 'Minería (450 trab.)',
    establecimiento: 'Complejo Minero San Carlos',
    periodo: 'Ejercicio Anual',
    sector: 'Extracción y Planta de Beneficio',
    accidentesConBaja: 3,
    diasPerdidos: 45,
    horasHombreTrabajadas: 850000,
    trabajadoresExpuestos: 450,
    description: 'Yacimiento minero de alta dotación con estrictos estándares preventivos y bajo índice de frecuencia.'
  },
  {
    id: 'indicador-frigorifico-alimenticia',
    title: 'Frigorífico / Industria de Alimentos',
    chipLabel: 'Frigorífico (220 trab.)',
    establecimiento: 'Frigorífico Andino',
    periodo: '2° Trimestre',
    sector: 'Despostado y Faena',
    accidentesConBaja: 12,
    diasPerdidos: 96,
    horasHombreTrabajadas: 114400,
    trabajadoresExpuestos: 220,
    description: 'Planta procesadora con cortes y trastornos musculoesqueléticos frecuentes en líneas de faena.'
  }
];

