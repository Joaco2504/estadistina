// src/lib/excelExport.ts
import * as XLSX from 'xlsx';
import { GroupedFrequencyTableResult, SimpleFrequencyTableResult, ContingencyTableResult } from '@/types/statistics';

/**
 * Exporta la tabla de frecuencias agrupadas a formato Excel (.xlsx)
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

  // Filas de datos
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

  // Fila de Totales (Estricto: Suma total sin símbolo sigma)
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
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 26 },
    { wch: 26 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Agrupadas');
  XLSX.writeFile(wb, `Tabla_Frecuencias_Agrupadas_${data.variableName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

/**
 * Exporta la tabla de frecuencias simples a formato Excel (.xlsx)
 */
export function exportSimpleTableToExcel(data: SimpleFrequencyTableResult) {
  const wsData: any[][] = [];

  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`VARIABLE: ${data.variableName} ${data.unit ? `(${data.unit})` : ''} | MUESTRA TOTAL (n): ${data.sampleSize}`]);
  wsData.push([]);

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

  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 26 },
    { wch: 26 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Simples');
  XLSX.writeFile(wb, `Tabla_Frecuencias_Simples_${data.variableName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

/**
 * Exporta la tabla de contingencia bivariada a formato Excel (.xlsx)
 */
export function exportContingencyTableToExcel(data: ContingencyTableResult) {
  const wsData: any[][] = [];

  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`TABLA BIVARIADA: ${data.variableX} × ${data.variableY} | GRAN TOTAL (n): ${data.grandTotal}`]);
  wsData.push([]);

  // Fila de encabezados de columnas
  const headerRow = [`${data.variableX} \\ ${data.variableY}`, ...data.colCategories, 'Total por fila'];
  wsData.push(headerRow);

  // Filas con valores y totales marginales
  data.rowCategories.forEach((rowCat, rIdx) => {
    const rowValues = data.matrix[rIdx];
    const rowTotal = data.rowMarginalTotals[rIdx];
    wsData.push([rowCat, ...rowValues, rowTotal]);
  });

  // Fila de totales marginales por columna
  wsData.push([
    'Total por columna',
    ...data.colMarginalTotals,
    data.grandTotal,
  ]);

  wsData.push([]);
  wsData.push(['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 26 },
    ...data.colCategories.map(() => ({ wch: 20 })),
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabla_Contingencia');
  XLSX.writeFile(wb, `Tabla_Contingencia_${data.variableX.replace(/[^a-zA-Z0-9]/g, '_')}_vs_${data.variableY.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}
