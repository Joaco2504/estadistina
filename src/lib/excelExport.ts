// src/lib/excelExport.ts
import {
  GroupedFrequencyTableResult,
  SimpleFrequencyTableResult,
  ContingencyTableResult,
  ContingencyViewMode,
  SafetyIndicatorsResult
} from '@/types/statistics';

/** Tipo de celda aceptado por SheetJS en hojas construidas con aoa_to_sheet */
type CellValue = string | number | { t: 'n'; v: number; z: string };

/**
 * Carga xlsx de forma diferida (el bundle principal no incluye la librería
 * hasta que el alumno exporta por primera vez).
 */
async function loadXlsx() {
  return import('xlsx');
}

/** Encabezado institucional común a todos los informes exportados */
function institutionalHeader(): string[][] {
  return [
    ['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL'],
    ['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD'],
    [`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`],
  ];
}

/** Sanitiza un texto para usarlo como nombre de archivo */
function sanitizeFileName(value: string): string {
  const clean = value.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
  return clean || 'archivo';
}

/**
 * Exporta la tabla de frecuencias agrupadas a formato Excel (.xlsx).
 * Exporta los valores numéricos limpios (sin fórmulas predeterminadas),
 * permitiendo que el alumno aplique y practique la automatización con fórmulas en Excel.
 * Lanza un Error con mensaje amigable si la exportación falla.
 */
export async function exportGroupedTableToExcel(data: GroupedFrequencyTableResult): Promise<void> {
  const XLSX = await loadXlsx();
  const wsData: CellValue[][] = [
    ...institutionalHeader(),
    [`VARIABLE: ${data.variableName} (${data.unit}) | MUESTRA TOTAL (n): ${data.sampleSize}`],
    [`PARÁMETROS: R = ${data.parameters.rango} | k = ${data.parameters.k} | A = ${data.parameters.amplitud} ${data.unit}`],
    [], // Fila vacía separadora

    // Encabezados de columnas
    [
      'N°',
      'Intervalo de Clase [Li - Ls)',
      'Marca de Clase (Mc)',
      'Frecuencia Absoluta (fa)',
      'Frecuencia Relativa (fr)',
      'Porcentaje (p %)',
      'Frec. Absoluta Acumulada (Fa)',
      'Frec. Relativa Acumulada (Fr)',
      'Porcentaje Acumulado (P %)',
    ],
  ];

  // Filas de datos a secas con valores numéricos limpios (sin fórmulas)
  for (const row of data.rows) {
    wsData.push([
      row.index,
      row.intervalLabel,
      row.marcaDeClase,
      row.frecuenciaAbsoluta,
      Number(row.frecuenciaRelativa.toFixed(2)),
      Number(row.porcentaje.toFixed(2)),
      row.frecuenciaAbsolutaAcumulada,
      Number(row.frecuenciaRelativaAcumulada.toFixed(2)),
      Number(row.porcentajeAcumulado.toFixed(2)),
    ]);
  }

  // Fila de Totales con valores directos (sin fórmulas)
  wsData.push([
    '',
    'Suma total',
    '',
    data.totals.totalFa,
    Number(data.totals.totalFr.toFixed(2)),
    Number(data.totals.totalP.toFixed(2)),
    '—',
    '—',
    '—',
  ]);

  wsData.push([], ['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajuste de anchos de columna
  ws['!cols'] = [
    { wch: 6 }, { wch: 26 }, { wch: 20 }, { wch: 24 }, { wch: 24 },
    { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Agrupadas');
  XLSX.writeFile(wb, `Tabla_Frecuencias_Agrupadas_${sanitizeFileName(data.variableName)}.xlsx`);
}

/**
 * Exporta la tabla de frecuencias simples a formato Excel (.xlsx).
 */
export async function exportSimpleTableToExcel(data: SimpleFrequencyTableResult): Promise<void> {
  const XLSX = await loadXlsx();
  const wsData: CellValue[][] = [
    ...institutionalHeader(),
    [`VARIABLE: ${data.variableName} ${data.unit ? `(${data.unit})` : ''} | MUESTRA TOTAL (n): ${data.sampleSize}`],
    [], // Fila vacía separadora

    // Encabezados de columnas
    [
      'N°',
      data.variableType === 'qualitative'
        ? 'Categoría / Modalidad (xi)'
        : `Valor de Variable ${data.unit ? `(${data.unit})` : '(xi)'}`,
      'Frecuencia Absoluta (fa)',
      'Frecuencia Relativa (fr)',
      'Porcentaje (p %)',
      'Frec. Absoluta Acumulada (Fa)',
      'Frec. Relativa Acumulada (Fr)',
      'Porcentaje Acumulado (P %)',
    ],
  ];

  // Filas de datos directos (sin fórmulas)
  for (const row of data.rows) {
    wsData.push([
      row.index,
      row.variableValue,
      row.frecuenciaAbsoluta,
      Number(row.frecuenciaRelativa.toFixed(2)),
      Number(row.porcentaje.toFixed(2)),
      row.frecuenciaAbsolutaAcumulada,
      Number(row.frecuenciaRelativaAcumulada.toFixed(2)),
      Number(row.porcentajeAcumulado.toFixed(2)),
    ]);
  }

  // Fila de Totales con valores numéricos directos (sin fórmulas)
  wsData.push([
    '',
    'Suma total',
    data.totals.totalFa,
    Number(data.totals.totalFr.toFixed(2)),
    Number(data.totals.totalP.toFixed(2)),
    '—',
    '—',
    '—',
  ]);

  wsData.push([], ['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 }, { wch: 30 }, { wch: 24 }, { wch: 24 },
    { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Simples');
  XLSX.writeFile(wb, `Tabla_Frecuencias_Simples_${sanitizeFileName(data.variableName)}.xlsx`);
}

/**
 * Exporta la tabla de contingencia bivariada a formato Excel (.xlsx)
 * según la vista activa (normal o porcentajes).
 */
export async function exportContingencyTableToExcel(
  data: ContingencyTableResult,
  viewMode: ContingencyViewMode = 'normal'
): Promise<void> {
  const XLSX = await loadXlsx();
  const wsData: CellValue[][] = [];

  const viewModeLabels: Record<ContingencyViewMode, string> = {
    normal: 'Frecuencias Absolutas Normales (fa)',
    percent_total: '% del Total General',
    percent_row: '% del Total de la Fila (Distribución Condicional)',
    percent_col: '% del Total de la Columna (Distribución Condicional)',
  };
  const rowTotalHeaders: Record<ContingencyViewMode, string> = {
    normal: 'Total por fila',
    percent_total: '% Total por fila',
    percent_row: 'Total fila (100%)',
    percent_col: '% Marginal fila',
  };
  const colTotalLabels: Record<ContingencyViewMode, string> = {
    normal: 'Total por columna',
    percent_total: '% Total por columna',
    percent_col: 'Total columna (100%)',
    percent_row: '% Marginal columna',
  };

  wsData.push(
    ...institutionalHeader(),
    [`TABLA BIVARIADA: ${data.variableX} × ${data.variableY} | VISTA: ${viewModeLabels[viewMode]} | GRAN TOTAL (n): ${data.grandTotal}`],
    [],
  );

  // Fila de encabezados de columnas
  wsData.push([`${data.variableX} \\ ${data.variableY}`, ...data.colCategories, rowTotalHeaders[viewMode]]);

  const formatCell = (val: number, rowTot: number, colTot: number): string | number => {
    switch (viewMode) {
      case 'percent_total':
        return data.grandTotal > 0 ? `${((val / data.grandTotal) * 100).toFixed(2)}%` : '0%';
      case 'percent_row':
        return rowTot > 0 ? `${((val / rowTot) * 100).toFixed(2)}%` : '0%';
      case 'percent_col':
        return colTot > 0 ? `${((val / colTot) * 100).toFixed(2)}%` : '0%';
      default:
        return val;
    }
  };

  // Filas con valores cruzados según la vista activa
  data.rowCategories.forEach((rowCat, rIdx) => {
    const rowValues = data.matrix[rIdx];
    const rowTot = data.rowMarginalTotals[rIdx];

    const formattedCells = rowValues.map((val, cIdx) =>
      formatCell(val, rowTot, data.colMarginalTotals[cIdx])
    );

    let formattedRowTotal: string | number = rowTot;
    if (viewMode === 'percent_total') {
      formattedRowTotal = data.grandTotal > 0 ? `${((rowTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    } else if (viewMode === 'percent_row') {
      formattedRowTotal = '100%';
    } else if (viewMode === 'percent_col') {
      formattedRowTotal = data.grandTotal > 0 ? `${((rowTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    }

    wsData.push([rowCat, ...formattedCells, formattedRowTotal]);
  });

  const formattedColTotals = data.colCategories.map((_, cIdx) => {
    const colTot = data.colMarginalTotals[cIdx];
    if (viewMode === 'normal') return colTot;
    if (viewMode === 'percent_col') return '100%';
    if (viewMode === 'percent_total' || viewMode === 'percent_row') {
      return data.grandTotal > 0 ? `${((colTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    }
    return colTot;
  });

  const formattedGrandTotal = viewMode === 'normal' ? data.grandTotal : '100%';
  wsData.push([colTotalLabels[viewMode], ...formattedColTotals, formattedGrandTotal]);

  wsData.push([], ['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 28 },
    ...data.colCategories.map(() => ({ wch: 20 })),
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabla_Contingencia');
  XLSX.writeFile(
    wb,
    `Tabla_Contingencia_${sanitizeFileName(data.variableX)}_vs_${sanitizeFileName(data.variableY)}_${viewMode}.xlsx`
  );
}

/**
 * Exporta el informe de Indicadores Oficiales de Siniestralidad (SRT / IRAM 3800) a Excel
 */
export async function exportSafetyIndicatorsToExcel(data: SafetyIndicatorsResult): Promise<void> {
  const XLSX = await loadXlsx();
  const wsData: CellValue[][] = [
    ...institutionalHeader(),
    ['INFORME TÉCNICO OFICIAL DE SINIESTRALIDAD LABORAL (NORMATIVA SRT / IRAM 3800 / OIT)'],
    [`ESTABLECIMIENTO: ${data.establecimiento} | PERÍODO EVALUADO: ${data.periodo}`],
    [],

    // Insumos de origen
    ['1. DATOS PRIMARIOS DE EXPOSICIÓN Y ACCIDENTABILIDAD'],
    ['Concepto / Insumo', 'Valor Numérico', 'Unidad de Medida'],
    ['Cantidad de Trabajadores Expuestos (Trab)', data.cantidadTrabajadores, 'Trabajadores en nómina'],
    ['Días Laborales del Período', data.diasLaborales, 'Días hábiles'],
    ['Horas por Jornada de Trabajo', data.horasJornada, 'Horas por jornada'],
    ['Horas Teóricas (Trab × Días × Horas)', data.horasTeoricas, 'Horas teóricas'],
    ['Horas Extras Trabajadas', data.horasExtras, 'Horas extras'],
    ['Horas No Trabajadas (Ausentismo / Licencias)', data.horasNoTrabajadas, 'Horas no trabajadas'],
    ['Horas Persona de Trabajo Efectivas (HPT)', data.horasPersonaTrabajo, 'Horas persona de exposición'],
    ['Factor k Seleccionado', data.factorK, data.baseTextHHT],
    ['Accidentes con Baja Laboral (N)', data.accidentesConBaja, 'Casos incapacitantes'],
    ['Accidentes sin Baja Laboral', data.accidentesSinBaja, 'Casos leves'],
    ['Total de Accidentes Registrados', data.totalAccidentes, 'Eventos totales'],
    ['Jornadas No Trabajadas / Días Perdidos (J)', data.diasPerdidos, 'Días de baja médica'],
    [],

    // Indicadores Oficiales Calculados
    ['2. INDICADORES OFICIALES DE SINIESTRALIDAD (SRT / IRAM 3800 / OIT)'],
    ['Indicador', 'Fórmula Oficial', 'Valor Obtenido', 'Unidad de Medida / Interpretación'],
    [
      'Índice de Frecuencia (IF)',
      `(N × ${data.kLabel}) / HPT`,
      { t: 'n', v: data.indiceFrecuencia, z: '0.00' },
      `Accidentes con baja ${data.baseTextHHT}`,
    ],
    [
      'Índice de Gravedad (IG)',
      `(J × ${data.kLabel}) / HPT`,
      { t: 'n', v: data.indiceGravedad, z: '0.00' },
      `Jornadas perdidas ${data.baseTextHHT}`,
    ],
    [
      'Índice de Incidencia (II)',
      '(N × 1.000) / Trab',
      { t: 'n', v: data.indiceIncidencia, z: '0.00' },
      'Accidentes con baja por cada 1.000 trabajadores',
    ],
    [
      'Duración Media de las Bajas (DM)',
      'J / N',
      { t: 'n', v: data.duracionMedia, z: '0.00' },
      'Días promedio de baja por cada accidente laboral',
    ],
    [
      'Relación de Coherencia Matemática',
      'IG = IF × DM',
      {
        t: 'n',
        v: Number(data.coherencia.producto.toFixed(4)),
        z: '0.0000',
      },
      data.coherencia.verifica
        ? `✓ Verifica: IF × DM = ${data.coherencia.producto.toFixed(4)} ≈ IG = ${data.indiceGravedad.toFixed(2)}`
        : `Sin accidentes con baja (N = 0): DM no definida (IG = ${data.indiceGravedad.toFixed(2)})`,
    ],
    [],

    // Diagnóstico e Informe
    ['3. CONCLUSIÓN Y DIAGNÓSTICO PREVENTIVO'],
    ['Severidad e Impacto:', data.diagnostico.severidad],
    ['Evaluación del Tiempo Perdido:', data.diagnostico.tiempoPerdido],
    ['Recomendación Prioritaria:', data.diagnostico.recomendacion],
    [],
    ['Fuente: Cátedra de Estadística y Costos de la Seguridad - I.E.S. Belén'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 35 },
    { wch: 32 },
    { wch: 18 },
    { wch: 60 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Indicadores_SRT');
  XLSX.writeFile(
    wb,
    `Indicadores_Siniestralidad_${sanitizeFileName(data.establecimiento)}_${sanitizeFileName(data.periodo)}.xlsx`
  );
}
