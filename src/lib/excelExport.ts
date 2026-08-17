// src/lib/excelExport.ts
import * as XLSX from 'xlsx';
import { GroupedFrequencyTableResult, SimpleFrequencyTableResult, ContingencyTableResult } from '@/types/statistics';

/**
 * Convierte un índice numérico de columna (0-indexado) en la letra correspondiente de Excel (0 -> 'A', 1 -> 'B', etc.)
 */
function getExcelColumnLetter(colIndex: number): string {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Exporta la tabla de frecuencias agrupadas a formato Excel (.xlsx)
 * Incluye fórmulas automáticas de Excel para totales, fr, p %, Fa, Fr y P %
 */
export function exportGroupedTableToExcel(data: GroupedFrequencyTableResult) {
  const wsData: any[][] = [];

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`VARIABLE: ${data.variableName} (${data.unit}) | MUESTRA TOTAL (n): ${data.sampleSize}`]);
  wsData.push([`PARÁMETROS: R = ${data.parameters.rango} | k = ${data.parameters.k} | A = ${data.parameters.amplitud} ${data.unit}`]);
  wsData.push([]); // Fila 6 vacía

  // Encabezados de columnas (Fila 7 de Excel)
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

  const firstRow = 8; // Primera fila de datos en Excel
  const k = data.rows.length;
  const lastRow = firstRow + k - 1;
  const totalRow = lastRow + 1; // Fila de totales en Excel

  // Filas de datos con fórmulas dinámicas
  data.rows.forEach((row, idx) => {
    const rNum = firstRow + idx; // Fila actual de Excel

    wsData.push([
      row.index,
      row.intervalLabel,
      row.marcaDeClase,
      row.frecuenciaAbsoluta,
      // fr = fa / n ($D$totalRow)
      { t: 'n', v: Number(row.frecuenciaRelativa.toFixed(2)), f: `D${rNum}/$D$${totalRow}`, z: '0.00' },
      // p % = fr * 100
      { t: 'n', v: Number(row.porcentaje.toFixed(2)), f: `E${rNum}*100`, z: '0.00' },
      // Fa = Acumulación de fa
      idx === 0
        ? { t: 'n', v: row.frecuenciaAbsolutaAcumulada, f: `D${rNum}`, z: '0' }
        : { t: 'n', v: row.frecuenciaAbsolutaAcumulada, f: `G${rNum - 1}+D${rNum}`, z: '0' },
      // Fr = Fa / n ($D$totalRow)
      { t: 'n', v: Number(row.frecuenciaRelativaAcumulada.toFixed(2)), f: `G${rNum}/$D$${totalRow}`, z: '0.00' },
      // P % = Fr * 100
      { t: 'n', v: Number(row.porcentajeAcumulado.toFixed(2)), f: `H${rNum}*100`, z: '0.00' },
    ]);
  });

  // Fila de Totales con fórmulas automáticas de Excel
  wsData.push([
    '',
    'Suma total',
    '',
    { t: 'n', v: data.totals.totalFa, f: `SUM(D${firstRow}:D${lastRow})`, z: '0' },
    { t: 'n', v: Number(data.totals.totalFr.toFixed(2)), f: `SUM(E${firstRow}:E${lastRow})`, z: '0.00' },
    { t: 'n', v: Number(data.totals.totalP.toFixed(2)), f: `SUM(F${firstRow}:F${lastRow})`, z: '0.00' },
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
 * Incluye fórmulas automáticas de Excel para totales, fr, p %, Fa, Fr y P %
 */
export function exportSimpleTableToExcel(data: SimpleFrequencyTableResult) {
  const wsData: any[][] = [];

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`VARIABLE: ${data.variableName} ${data.unit ? `(${data.unit})` : ''} | MUESTRA TOTAL (n): ${data.sampleSize}`]);
  wsData.push([]); // Fila 5 vacía

  // Encabezados de columnas (Fila 6 de Excel)
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

  const firstRow = 7; // Primera fila de datos en Excel
  const k = data.rows.length;
  const lastRow = firstRow + k - 1;
  const totalRow = lastRow + 1; // Fila de totales en Excel

  // Filas de datos con fórmulas dinámicas
  data.rows.forEach((row, idx) => {
    const rNum = firstRow + idx; // Fila actual de Excel

    wsData.push([
      row.index,
      row.variableValue,
      row.frecuenciaAbsoluta,
      // fr = fa / n ($C$totalRow)
      { t: 'n', v: Number(row.frecuenciaRelativa.toFixed(2)), f: `C${rNum}/$C$${totalRow}`, z: '0.00' },
      // p % = fr * 100
      { t: 'n', v: Number(row.porcentaje.toFixed(2)), f: `D${rNum}*100`, z: '0.00' },
      // Fa = Acumulación de fa
      idx === 0
        ? { t: 'n', v: row.frecuenciaAbsolutaAcumulada, f: `C${rNum}`, z: '0' }
        : { t: 'n', v: row.frecuenciaAbsolutaAcumulada, f: `F${rNum - 1}+C${rNum}`, z: '0' },
      // Fr = Fa / n ($C$totalRow)
      { t: 'n', v: Number(row.frecuenciaRelativaAcumulada.toFixed(2)), f: `F${rNum}/$C$${totalRow}`, z: '0.00' },
      // P % = Fr * 100
      { t: 'n', v: Number(row.porcentajeAcumulado.toFixed(2)), f: `G${rNum}*100`, z: '0.00' },
    ]);
  });

  // Fila de Totales con fórmulas automáticas de Excel
  wsData.push([
    '',
    'Suma total',
    { t: 'n', v: data.totals.totalFa, f: `SUM(C${firstRow}:C${lastRow})`, z: '0' },
    { t: 'n', v: Number(data.totals.totalFr.toFixed(2)), f: `SUM(D${firstRow}:D${lastRow})`, z: '0.00' },
    { t: 'n', v: Number(data.totals.totalP.toFixed(2)), f: `SUM(E${firstRow}:E${lastRow})`, z: '0.00' },
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
 * Incluye fórmulas automáticas de Excel para totales por fila, por columna y gran total
 */
export function exportContingencyTableToExcel(data: ContingencyTableResult) {
  const wsData: any[][] = [];

  // Encabezado institucional
  wsData.push(['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL']);
  wsData.push(['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD']);
  wsData.push([`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`]);
  wsData.push([`TABLA BIVARIADA: ${data.variableX} × ${data.variableY} | GRAN TOTAL (n): ${data.grandTotal}`]);
  wsData.push([]); // Fila 5 vacía

  // Fila de encabezados de columnas (Fila 6 de Excel)
  const headerRow = [`${data.variableX} \\ ${data.variableY}`, ...data.colCategories, 'Total por fila'];
  wsData.push(headerRow);

  const firstRow = 7; // Primera fila de datos en Excel
  const rCount = data.rowCategories.length;
  const cCount = data.colCategories.length;
  const lastRow = firstRow + rCount - 1;
  const totalRow = lastRow + 1; // Fila de totales marginales en Excel

  const firstDataColLetter = 'B';
  const lastDataColLetter = getExcelColumnLetter(cCount); // ej. 'C' si cCount es 2
  const totalColLetter = getExcelColumnLetter(cCount + 1); // ej. 'D'

  // Filas con valores y fórmulas de total por fila
  data.rowCategories.forEach((rowCat, rIdx) => {
    const rNum = firstRow + rIdx;
    const rowValues = data.matrix[rIdx];

    const rowArray: any[] = [rowCat, ...rowValues];
    // Fórmula para Total por fila: =SUM(B{rNum}:{lastDataColLetter}{rNum})
    rowArray.push({
      t: 'n',
      v: data.rowMarginalTotals[rIdx],
      f: `SUM(${firstDataColLetter}${rNum}:${lastDataColLetter}${rNum})`,
      z: '0',
    });

    wsData.push(rowArray);
  });

  // Fila de totales marginales por columna con fórmulas de suma vertical
  const colTotalsRow: any[] = ['Total por columna'];
  for (let cIdx = 0; cIdx < cCount; cIdx++) {
    const colLetter = getExcelColumnLetter(cIdx + 1);
    colTotalsRow.push({
      t: 'n',
      v: data.colMarginalTotals[cIdx],
      f: `SUM(${colLetter}${firstRow}:${colLetter}${lastRow})`,
      z: '0',
    });
  }

  // Celda de Gran Total (Fórmula de suma sobre los totales por fila)
  colTotalsRow.push({
    t: 'n',
    v: data.grandTotal,
    f: `SUM(${totalColLetter}${firstRow}:${totalColLetter}${lastRow})`,
    z: '0',
  });

  wsData.push(colTotalsRow);

  wsData.push([]);
  wsData.push(['Fuente: Cátedra de Estadística - I.E.S. Belén']);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajuste de anchos de columna
  ws['!cols'] = [
    { wch: 28 },
    ...data.colCategories.map(() => ({ wch: 20 })),
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabla_Contingencia');
  XLSX.writeFile(wb, `Tabla_Contingencia_${data.variableX.replace(/[^a-zA-Z0-9]/g, '_')}_vs_${data.variableY.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}
