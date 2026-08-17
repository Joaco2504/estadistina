// scratch/test_excel_formula.js
const XLSX = require('xlsx');

const wsData = [
  ['Header A', 'Header B', 'Header C', 'Formula fr', 'Formula Fa'],
  [1, 'Cat A', 10, { t: 'n', v: 0.25, f: 'C2/$C$5', z: '0.00' }, { t: 'n', v: 10, f: 'C2', z: '0' }],
  [2, 'Cat B', 20, { t: 'n', v: 0.50, f: 'C3/$C$5', z: '0.00' }, { t: 'n', v: 30, f: 'E2+C3', z: '0' }],
  [3, 'Cat C', 10, { t: 'n', v: 0.25, f: 'C4/$C$5', z: '0.00' }, { t: 'n', v: 40, f: 'E3+C4', z: '0' }],
  ['', 'Suma total', { t: 'n', v: 40, f: 'SUM(C2:C4)', z: '0' }, { t: 'n', v: 1.00, f: 'SUM(D2:D4)', z: '0.00' }, '—']
];

const ws = XLSX.utils.aoa_to_sheet(wsData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'TestSheet');

const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
console.log('Excel generated successfully, buffer size:', buf.length);
console.log('Cell D2:', ws['D2']);
console.log('Cell C5:', ws['C5']);
