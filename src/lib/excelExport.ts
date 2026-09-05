// src/lib/excelExport.ts
import * as XLSX from 'xlsx';
import { 
  GroupedFrequencyTableResult, 
  SimpleFrequencyTableResult, 
  ContingencyTableResult,
  ContingencyViewMode,
  SafetyIndicatorsResult 
} from '@/types/statistics';



/**
 * Exporta la tabla de frecuencias agrupadas a formato Excel (.xlsx)
 * Exporta la tabla con los datos directos y valores numéricos limpios (sin fórmulas predeterminadas),
 * permitiendo que el alumno aplique y practique la automatización con fórmulas en Excel.
 */
export function exportGroupedTableToExcel(data: GroupedFrequencyTableResult) {
  const wsData: any[][] = [];

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`VARIABLE: ${data.variableName} (${data.unit}) | MUESTRA TOTAL (n): ${data.sampleSize}`]);
  wsData.push([`PARÁMETROS: R = ${data.parameters.rango} | k = ${data.parameters.k} | A = ${data.parameters.amplitud} ${data.unit}`]);
  wsData.push([]); // Fila vacía separadora

  // Encabezados de columnas
  wsData.push([
    'N°',
    'Intervalo de Clase [Li - Ls)',
    'Marca de Clase (Mc)',
    'Frecuencia Absoluta (fa)',
    'Frecuencia Relativa (fr)',
    'Porcentaje (p %)',
    'Frec. Absoluta Acumulada (Fa)',
    'Frec. Relativa Acumulada (Fr)',
    'Porcentaje Acumulado (P %)',
  ]);

  // Filas de datos a secas con valores numéricos limpios (sin fórmulas)
  data.rows.forEach((row) => {
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
  });

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

  wsData.push([]);
  wsData.push(['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajuste de anchos de columna
  ws['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 20 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Agrupadas');
  XLSX.writeFile(wb, `Tabla_Frecuencias_Agrupadas_${data.variableName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

/**
 * Exporta la tabla de frecuencias simples a formato Excel (.xlsx)
 * Exporta los datos numéricos y categóricos limpios (sin fórmulas predeterminadas),
 * para que el estudiante pueda realizar la automatización formulada en Excel.
 */
export function exportSimpleTableToExcel(data: SimpleFrequencyTableResult) {
  const wsData: any[][] = [];

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`VARIABLE: ${data.variableName} ${data.unit ? `(${data.unit})` : ''} | MUESTRA TOTAL (n): ${data.sampleSize}`]);
  wsData.push([]); // Fila vacía separadora

  // Encabezados de columnas
  wsData.push([
    'N°',
    data.variableType === 'qualitative' ? 'Categoría / Modalidad (xi)' : `Valor de Variable ${data.unit ? `(${data.unit})` : '(xi)'}`,
    'Frecuencia Absoluta (fa)',
    'Frecuencia Relativa (fr)',
    'Porcentaje (p %)',
    'Frec. Absoluta Acumulada (Fa)',
    'Frec. Relativa Acumulada (Fr)',
    'Porcentaje Acumulado (P %)',
  ]);

  // Filas de datos directos (sin fórmulas)
  data.rows.forEach((row) => {
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
  });

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

  wsData.push([]);
  wsData.push(['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajuste de anchos de columna
  ws['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Simples');
  XLSX.writeFile(wb, `Tabla_Frecuencias_Simples_${data.variableName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

/**
 * Exporta la tabla de contingencia bivariada a formato Excel (.xlsx)
 * Exporta los conteos cruzados y totales marginales según la vista activa (normal o porcentajes).
 */
export function exportContingencyTableToExcel(
  data: ContingencyTableResult,
  viewMode: ContingencyViewMode = 'normal'
) {
  const wsData: any[][] = [];

  let viewModeLabel = 'Frecuencias Absolutas Normales (fa)';
  if (viewMode === 'percent_total') viewModeLabel = '% del Total General';
  if (viewMode === 'percent_row') viewModeLabel = '% del Total de la Fila (Distribución Condicional)';
  if (viewMode === 'percent_col') viewModeLabel = '% del Total de la Columna (Distribución Condicional)';

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`TABLA BIVARIADA: ${data.variableX} × ${data.variableY} | VISTA: ${viewModeLabel} | GRAN TOTAL (n): ${data.grandTotal}`]);
  wsData.push([]); // Fila vacía

  let rowTotalHeader = 'Total por fila';
  if (viewMode === 'percent_total') rowTotalHeader = '% Total por fila';
  if (viewMode === 'percent_row') rowTotalHeader = 'Total fila (100%)';
  if (viewMode === 'percent_col') rowTotalHeader = '% Marginal fila';

  // Fila de encabezados de columnas
  const headerRow = [`${data.variableX} \\ ${data.variableY}`, ...data.colCategories, rowTotalHeader];
  wsData.push(headerRow);

  // Filas con valores cruzados según la vista activa
  data.rowCategories.forEach((rowCat, rIdx) => {
    const rowValues = data.matrix[rIdx];
    const rowTot = data.rowMarginalTotals[rIdx];

    const formattedCells = rowValues.map((val, cIdx) => {
      if (viewMode === 'normal') return val;
      if (viewMode === 'percent_total') {
        return data.grandTotal > 0 ? `${((val / data.grandTotal) * 100).toFixed(2)}%` : '0%';
      }
      if (viewMode === 'percent_row') {
        return rowTot > 0 ? `${((val / rowTot) * 100).toFixed(2)}%` : '0%';
      }
      if (viewMode === 'percent_col') {
        const colTot = data.colMarginalTotals[cIdx];
        return colTot > 0 ? `${((val / colTot) * 100).toFixed(2)}%` : '0%';
      }
      return val;
    });

    let formattedRowTotal: any = rowTot;
    if (viewMode === 'percent_total') {
      formattedRowTotal = data.grandTotal > 0 ? `${((rowTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    } else if (viewMode === 'percent_row') {
      formattedRowTotal = '100%';
    } else if (viewMode === 'percent_col') {
      formattedRowTotal = data.grandTotal > 0 ? `${((rowTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    }

    const rowArray: any[] = [rowCat, ...formattedCells, formattedRowTotal];
    wsData.push(rowArray);
  });

  let colTotalLabel = 'Total por columna';
  if (viewMode === 'percent_total') colTotalLabel = '% Total por columna';
  if (viewMode === 'percent_col') colTotalLabel = 'Total columna (100%)';
  if (viewMode === 'percent_row') colTotalLabel = '% Marginal columna';

  const formattedColTotals = data.colCategories.map((_, cIdx) => {
    const colTot = data.colMarginalTotals[cIdx];
    if (viewMode === 'normal') return colTot;
    if (viewMode === 'percent_total') {
      return data.grandTotal > 0 ? `${((colTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    }
    if (viewMode === 'percent_col') {
      return '100%';
    }
    if (viewMode === 'percent_row') {
      return data.grandTotal > 0 ? `${((colTot / data.grandTotal) * 100).toFixed(2)}%` : '0%';
    }
    return colTot;
  });

  const formattedGrandTotal = viewMode === 'normal' ? data.grandTotal : '100%';
  const colTotalsRow: any[] = [colTotalLabel, ...formattedColTotals, formattedGrandTotal];
  wsData.push(colTotalsRow);

  wsData.push([]);
  wsData.push(['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajuste de anchos de columna
  ws['!cols'] = [
    { wch: 28 },
    ...data.colCategories.map(() => ({ wch: 20 })),
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabla_Contingencia');
  XLSX.writeFile(wb, `Tabla_Contingencia_${data.variableX.replace(/[^a-zA-Z0-9]/g, '_')}_vs_${data.variableY.replace(/[^a-zA-Z0-9]/g, '_')}_${viewMode}.xlsx`);
}

/**
 * Exporta el informe de Indicadores Oficiales de Siniestralidad (SRT / IRAM 3800) a Excel
 */
export function exportSafetyIndicatorsToExcel(data: SafetyIndicatorsResult) {
  const wsData: any[][] = [];

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`INFORME TÉCNICO OFICIAL DE SINIESTRALIDAD LABORAL (NORMATIVA SRT / IRAM 3800 / OIT)`]);
  wsData.push([`ESTABLECIMIENTO: ${data.establecimiento} | PERÍODO EVALUADO: ${data.periodo}`]);
  wsData.push([]);

  // Insumos de origen
  wsData.push(['1. DATOS PRIMARIOS DE EXPOSICIÓN Y ACCIDENTABILIDAD']);
  wsData.push(['Concepto / Insumo', 'Valor Numérico', 'Unidad de Medida']);
  wsData.push(['Cantidad de Trabajadores Expuestos (Trab)', data.cantidadTrabajadores, 'Trabajadores en nómina']);
  wsData.push(['Días Laborales del Período', data.diasLaborales, 'Días hábiles']);
  wsData.push(['Horas por Jornada de Trabajo', data.horasJornada, 'Horas por jornada']);
  wsData.push(['Horas Teóricas (Trab × Días × Horas)', data.horasTeoricas, 'Horas teóricas']);
  wsData.push(['Horas Extras Trabajadas', data.horasExtras, 'Horas extras']);
  wsData.push(['Horas No Trabajadas (Ausentismo / Licencias)', data.horasNoTrabajadas, 'Horas no trabajadas']);
  wsData.push(['Horas Persona de Trabajo Efectivas (HPT)', data.horasPersonaTrabajo, 'Horas persona de exposición']);
  wsData.push(['Factor k Seleccionado', data.factorK, data.baseTextHHT]);
  wsData.push(['Accidentes con Baja Laboral (N)', data.accidentesConBaja, 'Casos incapacitantes']);
  wsData.push(['Accidentes sin Baja Laboral', data.accidentesSinBaja, 'Casos leves']);
  wsData.push(['Total de Accidentes Registrados', data.totalAccidentes, 'Eventos totales']);
  wsData.push(['Jornadas No Trabajadas / Días Perdidos (J)', data.diasPerdidos, 'Días de baja médica']);
  wsData.push([]);

  // Indicadores Oficiales Calculados
  wsData.push(['2. INDICADORES OFICIALES DE SINIESTRALIDAD (SRT / IRAM 3800 / OIT)']);
  wsData.push(['Indicador', 'Fórmula Oficial', 'Valor Obtenido', 'Unidad de Medida / Interpretación']);
  wsData.push([
    'Índice de Frecuencia (IF)',
    `(N × ${data.kLabel}) / HPT`,
    { t: 'n', v: data.indiceFrecuencia, z: '0.00' },
    `Accidentes con baja ${data.baseTextHHT}`
  ]);
  wsData.push([
    'Índice de Gravedad (IG)',
    `(J × ${data.kLabel}) / HPT`,
    { t: 'n', v: data.indiceGravedad, z: '0.00' },
    `Jornadas perdidas ${data.baseTextHHT}`
  ]);
  wsData.push([
    'Índice de Incidencia (II)',
    '(N × 1.000) / Trab',
    { t: 'n', v: data.indiceIncidencia, z: '0.00' },
    'Accidentes con baja por cada 1.000 trabajadores'
  ]);
  wsData.push([
    'Duración Media de las Bajas (DM)',
    'J / N',
    { t: 'n', v: data.duracionMedia, z: '0.00' },
    'Días promedio de baja por cada accidente laboral'
  ]);
  wsData.push([
    'Relación de Coherencia Matemática',
    'IG = IF * DM',
    { t: 'n', v: Number((data.indiceFrecuencia * data.duracionMedia).toFixed(2)), z: '0.00' },
    'Verificación de coherencia entre severidad y frecuencia'
  ]);
  wsData.push([]);

  // Diagnóstico e Informe
  wsData.push(['3. CONCLUSIÓN Y DIAGNÓSTICO PREVENTIVO']);
  wsData.push(['Severidad e Impacto:', data.diagnostico.severidad]);
  wsData.push(['Evaluación del Tiempo Perdido:', data.diagnostico.tiempoPerdido]);
  wsData.push(['Recomendación Prioritaria:', data.diagnostico.recomendacion]);
  wsData.push([]);
  wsData.push(['Fuente: Cátedra de Estadística y Costos de la Seguridad - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 35 },
    { wch: 32 },
    { wch: 18 },
    { wch: 45 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Indicadores_SRT');
  XLSX.writeFile(wb, `Indicadores_Siniestralidad_${data.establecimiento.replace(/[^a-zA-Z0-9]/g, '_')}_${data.periodo.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

