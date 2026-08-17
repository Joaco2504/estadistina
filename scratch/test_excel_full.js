// scratch/test_excel_full.js
const XLSX = require('xlsx');

// 1. SIMPLE
const simpleData = {
  variableName: 'Ocupaciones declaradas',
  unit: 'Trabajadores',
  variableType: 'qualitative',
  sampleSize: 20,
  rows: [
    { index: 1, variableValue: 'Contusión', frecuenciaAbsoluta: 4, frecuenciaRelativa: 0.20, porcentaje: 20.00, frecuenciaAbsolutaAcumulada: 4, frecuenciaRelativaAcumulada: 0.20, porcentajeAcumulado: 20.00 },
    { index: 2, variableValue: 'Corte en manos', frecuenciaAbsoluta: 7, frecuenciaRelativa: 0.35, porcentaje: 35.00, frecuenciaAbsolutaAcumulada: 11, frecuenciaRelativaAcumulada: 0.55, porcentajeAcumulado: 55.00 },
    { index: 3, variableValue: 'Esguince', frecuenciaAbsoluta: 2, frecuenciaRelativa: 0.10, porcentaje: 10.00, frecuenciaAbsolutaAcumulada: 13, frecuenciaRelativaAcumulada: 0.65, porcentajeAcumulado: 65.00 },
    { index: 4, variableValue: 'Fractura', frecuenciaAbsoluta: 1, frecuenciaRelativa: 0.05, porcentaje: 5.00, frecuenciaAbsolutaAcumulada: 14, frecuenciaRelativaAcumulada: 0.70, porcentajeAcumulado: 70.00 },
    { index: 5, variableValue: 'Quemadura térmica', frecuenciaAbsoluta: 6, frecuenciaRelativa: 0.30, porcentaje: 30.00, frecuenciaAbsolutaAcumulada: 20, frecuenciaRelativaAcumulada: 1.00, porcentajeAcumulado: 100.00 },
  ],
  totals: {
    label: 'Suma total',
    totalFa: 20,
    totalFr: 1.00,
    totalP: 100.00
  }
};

// 2. AGRUPADAS
const groupedData = {
  variableName: 'Nivel Sonoro',
  unit: 'dBA',
  sampleSize: 20,
  parameters: { rango: 20, k: 4, amplitud: 5 },
  rows: [
    { index: 1, intervalLabel: '[70 - 75)', marcaDeClase: 72.5, frecuenciaAbsoluta: 6, frecuenciaRelativa: 0.30, porcentaje: 30.0, frecuenciaAbsolutaAcumulada: 6, frecuenciaRelativaAcumulada: 0.30, porcentajeAcumulado: 30.0 },
    { index: 2, intervalLabel: '[75 - 80)', marcaDeClase: 77.5, frecuenciaAbsoluta: 8, frecuenciaRelativa: 0.40, porcentaje: 40.0, frecuenciaAbsolutaAcumulada: 14, frecuenciaRelativaAcumulada: 0.70, porcentajeAcumulado: 70.0 },
    { index: 3, intervalLabel: '[80 - 85)', marcaDeClase: 82.5, frecuenciaAbsoluta: 4, frecuenciaRelativa: 0.20, porcentaje: 20.0, frecuenciaAbsolutaAcumulada: 18, frecuenciaRelativaAcumulada: 0.90, porcentajeAcumulado: 90.0 },
    { index: 4, intervalLabel: '[85 - 90]', marcaDeClase: 87.5, frecuenciaAbsoluta: 2, frecuenciaRelativa: 0.10, porcentaje: 10.0, frecuenciaAbsolutaAcumulada: 20, frecuenciaRelativaAcumulada: 1.00, porcentajeAcumulado: 100.0 },
  ],
  totals: {
    label: 'Suma total',
    totalFa: 20,
    totalFr: 1.00,
    totalP: 100.00
  }
};

// 3. CONTINGENCIA
const contingencyData = {
  variableX: 'Sector',
  variableY: 'Uso EPP',
  rowCategories: ['Mecanizado', 'Soldadura'],
  colCategories: ['Cumple', 'No Cumple'],
  matrix: [
    [12, 3],
    [8, 7]
  ],
  rowMarginalTotals: [15, 15],
  colMarginalTotals: [20, 10],
  grandTotal: 30
};

function getExcelColumnLetter(colIndex) {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

function exportGrouped(data) {
  const wsData = [];
  wsData.push(['I.E.S. DE BELÉN']);
  wsData.push(['CÁTEDRA']);
  wsData.push(['DOCENTE']);
  wsData.push([`VARIABLE: ${data.variableName}`]);
  wsData.push([`PARÁMETROS: R=${data.parameters.rango}`]);
  wsData.push([]);

  wsData.push([
    'N°', 'Intervalo', 'Mc', 'fa', 'fr', 'p %', 'Fa', 'Fr', 'P %'
  ]);

  const firstRow = 8;
  const k = data.rows.length;
  const lastRow = firstRow + k - 1;
  const totalRow = lastRow + 1;

  data.rows.forEach((row, idx) => {
    const rNum = firstRow + idx;
    wsData.push([
      row.index,
      row.intervalLabel,
      row.marcaDeClase,
      row.frecuenciaAbsoluta,
      { t: 'n', v: row.frecuenciaRelativa, f: `D${rNum}/$D$${totalRow}`, z: '0.00' },
      { t: 'n', v: row.porcentaje, f: `E${rNum}*100`, z: '0.00' },
      idx === 0
        ? { t: 'n', v: row.frecuenciaAbsolutaAcumulada, f: `D${rNum}`, z: '0' }
        : { t: 'n', v: row.frecuenciaAbsolutaAcumulada, f: `G${rNum - 1}+D${rNum}`, z: '0' },
      { t: 'n', v: row.frecuenciaRelativaAcumulada, f: `G${rNum}/$D$${totalRow}`, z: '0.00' },
      { t: 'n', v: row.porcentajeAcumulado, f: `H${rNum}*100`, z: '0.00' },
    ]);
  });

  wsData.push([
    '', 'Suma total', '',
    { t: 'n', v: data.totals.totalFa, f: `SUM(D${firstRow}:D${lastRow})`, z: '0' },
    { t: 'n', v: data.totals.totalFr, f: `SUM(E${firstRow}:E${lastRow})`, z: '0.00' },
    { t: 'n', v: data.totals.totalP, f: `SUM(F${firstRow}:F${lastRow})`, z: '0.00' },
    '—', '—', '—'
  ]);

  return XLSX.utils.aoa_to_sheet(wsData);
}

function exportContingency(data) {
  const wsData = [];
  wsData.push(['I.E.S. DE BELÉN']);
  wsData.push(['CÁTEDRA']);
  wsData.push(['DOCENTE']);
  wsData.push([`TABLA BIVARIADA: ${data.variableX} × ${data.variableY}`]);
  wsData.push([]);

  const headerRow = [`${data.variableX} \\ ${data.variableY}`, ...data.colCategories, 'Total por fila'];
  wsData.push(headerRow);

  const firstRow = 7;
  const rCount = data.rowCategories.length;
  const cCount = data.colCategories.length;
  const lastRow = firstRow + rCount - 1;
  const totalRow = lastRow + 1;

  const firstDataColLetter = 'B';
  const lastDataColLetter = getExcelColumnLetter(cCount);
  const totalColLetter = getExcelColumnLetter(cCount + 1);

  data.rowCategories.forEach((rowCat, rIdx) => {
    const rNum = firstRow + rIdx;
    const rowValues = data.matrix[rIdx];
    const rowArray = [rowCat, ...rowValues];
    rowArray.push({
      t: 'n',
      v: data.rowMarginalTotals[rIdx],
      f: `SUM(${firstDataColLetter}${rNum}:${lastDataColLetter}${rNum})`,
      z: '0',
    });
    wsData.push(rowArray);
  });

  const colTotalsRow = ['Total por columna'];
  for (let cIdx = 0; cIdx < cCount; cIdx++) {
    const colLetter = getExcelColumnLetter(cIdx + 1);
    colTotalsRow.push({
      t: 'n',
      v: data.colMarginalTotals[cIdx],
      f: `SUM(${colLetter}${firstRow}:${colLetter}${lastRow})`,
      z: '0',
    });
  }

  colTotalsRow.push({
    t: 'n',
    v: data.grandTotal,
    f: `SUM(${totalColLetter}${firstRow}:${totalColLetter}${lastRow})`,
    z: '0',
  });

  wsData.push(colTotalsRow);
  return XLSX.utils.aoa_to_sheet(wsData);
}

const wsG = exportGrouped(groupedData);
const wsC = exportContingency(contingencyData);

console.log('✅ Verificación de Frecuencias Agrupadas:');
console.log('  D8 (fa):', wsG['D8'].v);
console.log('  E8 (fr):', wsG['E8'].f, '->', wsG['E8'].v);
console.log('  G8 (Fa):', wsG['G8'].f, '->', wsG['G8'].v);
console.log('  G9 (Fa fila 2):', wsG['G9'].f, '->', wsG['G9'].v);
console.log('  H9 (Fr fila 2):', wsG['H9'].f, '->', wsG['H9'].v);
console.log('  D12 (Suma total fa):', wsG['D12'].f, '->', wsG['D12'].v);

console.log('\n✅ Verificación de Tabla de Contingencia:');
console.log('  D7 (Total por fila 1):', wsC['D7'].f, '->', wsC['D7'].v);
console.log('  B9 (Total columna 1):', wsC['B9'].f, '->', wsC['B9'].v);
console.log('  D9 (Gran Total):', wsC['D9'].f, '->', wsC['D9'].v);
