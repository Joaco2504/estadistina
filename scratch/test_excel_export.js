const XLSX = require('xlsx');

// Import dummy data to test
const dummySimple = {
  variableName: 'Dias_de_Licencia',
  variableType: 'quantitative',
  unit: 'días',
  sampleSize: 20,
  rows: [
    {
      index: 1,
      variableValue: '0',
      frecuenciaAbsoluta: 6,
      frecuenciaRelativa: 0.30,
      porcentaje: 30.0,
      frecuenciaAbsolutaAcumulada: 6,
      frecuenciaRelativaAcumulada: 0.30,
      porcentajeAcumulado: 30.0,
    },
    {
      index: 2,
      variableValue: '1',
      frecuenciaAbsoluta: 4,
      frecuenciaRelativa: 0.20,
      porcentaje: 20.0,
      frecuenciaAbsolutaAcumulada: 10,
      frecuenciaRelativaAcumulada: 0.50,
      porcentajeAcumulado: 50.0,
    }
  ],
  totals: {
    totalFa: 10,
    totalFr: 0.50,
    totalP: 50.0,
  }
};

const wsData = [
  ['I.E.S. DE BELÉN - TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD INDUSTRIAL'],
  ['CÁTEDRA: ESTADÍSTICA, CÁLCULO DE LA PROBABILIDAD Y COSTOS DE LA SEGURIDAD'],
  [`DOCENTE: Prof. Pacheco E. Joaquín | FECHA: ${new Date().toLocaleDateString('es-AR')}`],
  [`VARIABLE: ${dummySimple.variableName} | MUESTRA TOTAL (n): ${dummySimple.sampleSize}`],
  [],
  ['N°', 'Valor de Variable', 'Frecuencia Absoluta (fa)', 'Frecuencia Relativa (fr)', 'Porcentaje (p %)', 'Frec. Absoluta Acumulada (Fa)', 'Frec. Relativa Acumulada (Fr)', 'Porcentaje Acumulado (P %)'],
  [1, '0', 6, 0.30, 30.0, 6, 0.30, 30.0],
  [2, '1', 4, 0.20, 20.0, 10, 0.50, 50.0],
  ['', 'Suma total', 10, 0.50, 50.0, '—', '—', '—'],
  [],
  ['Fuente: Cátedra de Estadística - I.E.S. Belén']
];

const ws = XLSX.utils.aoa_to_sheet(wsData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias_Simples');
XLSX.writeFile(wb, 'scratch/test_export_result.xlsx');

// Verify read-back content
const readWb = XLSX.readFile('scratch/test_export_result.xlsx');
const sheet = readWb.Sheets['Frecuencias_Simples'];

let hasFormulas = false;
for (const cellKey of Object.keys(sheet)) {
  if (cellKey.startsWith('!')) continue;
  const cell = sheet[cellKey];
  if (cell.f) {
    hasFormulas = true;
    console.error(`❌ Found formula in cell ${cellKey}: ${cell.f}`);
  }
}

if (!hasFormulas) {
  console.log('✅ Verificación exitosa: Ninguna celda contiene fórmulas predeterminadas. Los datos están limpios a secas.');
}
