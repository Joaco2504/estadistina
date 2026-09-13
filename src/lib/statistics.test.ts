// src/lib/statistics.test.ts
import { describe, it, expect } from 'vitest';
import {
  roundTo,
  formatPercentage,
  parseGroupedDataString,
  parseAnyDataString,
  parseContingencyDataString,
  generateSimpleFrequencyTable,
  generateGroupedFrequencyTable,
  generateContingencyTable,
  calculateSafetyIndicators,
  SAFETY_PRESETS,
  SAFETY_INDICATOR_PRESETS,
} from '@/lib/statistics';

describe('roundTo / formatPercentage', () => {
  it('redondea a 2 decimales de forma segura', () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(288.461538, 2)).toBe(288.46);
    expect(roundTo(1.005, 2)).toBe(1.01);
  });

  it('formatea porcentajes sin .00 innecesarios', () => {
    expect(formatPercentage(30)).toBe('30%');
    expect(formatPercentage(14.29)).toBe('14.29%');
  });
});

describe('parseGroupedDataString', () => {
  it('continua: coma decimal y separador ;', () => {
    expect(parseGroupedDataString('78,4; 82,1; 85,6', true)).toEqual([78.4, 82.1, 85.6]);
  });

  it('continua: acepta punto decimal y saltos de línea', () => {
    expect(parseGroupedDataString('78.4\n82.1', true)).toEqual([78.4, 82.1]);
  });

  it('discreta: acepta comas y espacios como separadores', () => {
    expect(parseGroupedDataString('21, 24, 28', false)).toEqual([21, 24, 28]);
    expect(parseGroupedDataString('21;24 28', false)).toEqual([21, 24, 28]);
  });

  it('ignora tokens no numéricos', () => {
    expect(parseGroupedDataString('12; abc; 14', false)).toEqual([12, 14]);
  });
});

describe('parseAnyDataString', () => {
  it('detecta números con coma decimal', () => {
    expect(parseAnyDataString('1,5; 2,5; 3')).toEqual([1.5, 2.5, 3]);
  });

  it('mantiene categorías cualitativas como texto', () => {
    expect(parseAnyDataString('Empleado/a; Estudiante')).toEqual(['Empleado/a', 'Estudiante']);
  });

  it('divide por coma cuando no hay punto y coma', () => {
    expect(parseAnyDataString('Bueno, Regular, Excelente')).toEqual(['Bueno', 'Regular', 'Excelente']);
  });
});

describe('generateSimpleFrequencyTable', () => {
  it('calcula fa, fr, p y acumulados correctamente', () => {
    const result = generateSimpleFrequencyTable('Variable', 'u', [1, 2, 2, 3, 3, 3], 'quantitative');
    expect(result.sampleSize).toBe(6);
    expect(result.rows.map(r => r.variableValue)).toEqual([1, 2, 3]);
    expect(result.rows.map(r => r.frecuenciaAbsoluta)).toEqual([1, 2, 3]);
    expect(result.rows.map(r => r.frecuenciaRelativa)).toEqual([0.17, 0.33, 0.5]);
    expect(result.rows.map(r => r.porcentaje)).toEqual([17, 33, 50]);
    expect(result.rows.map(r => r.frecuenciaAbsolutaAcumulada)).toEqual([1, 3, 6]);
    expect(result.rows[2].porcentajeAcumulado).toBe(100);
    expect(result.totals.totalFa).toBe(6);
  });

  it('soporta variables cualitativas y preserva el total fa = n', () => {
    const result = generateSimpleFrequencyTable('Lesión', 'casos', ['Corte', 'Corte', 'Fractura'], 'qualitative');
    expect(result.totals.totalFa).toBe(3);
    expect(result.rows.find(r => r.variableValue === 'Corte')?.frecuenciaAbsoluta).toBe(2);
  });
});

describe('generateGroupedFrequencyTable (Regla de la Raíz)', () => {
  it('con n=25 usa k = √25 = 5 exacto y cubre todos los datos', () => {
    const preset = SAFETY_PRESETS.find(p => p.id === 'ruido-db');
    expect(preset).toBeDefined();
    const values = preset!.dataGenerator() as number[];
    const result = generateGroupedFrequencyTable('Ruido', 'dBA', values, undefined, 'continuous');

    expect(result.sampleSize).toBe(25);
    expect(result.parameters.k).toBe(5);
    expect(result.parameters.isExactRoot).toBe(true);
    expect(result.rows).toHaveLength(5);
    expect(result.totals.totalFa).toBe(25);
    // El último intervalo incluye el máximo
    const max = Math.max(...values);
    const lastRow = result.rows[result.rows.length - 1];
    expect(max).toBeLessThanOrEqual(lastRow.limiteSuperior! + 0.001);
  });

  it('con n=30 redondea la raíz al entero superior (k = 6)', () => {
    const preset = SAFETY_PRESETS.find(p => p.id === 'edades-operarios');
    const values = preset!.dataGenerator() as number[];
    const result = generateGroupedFrequencyTable('Edad', 'años', values, undefined, 'discrete');

    expect(result.sampleSize).toBe(30);
    expect(result.parameters.k).toBe(6);
    expect(result.parameters.isExactRoot).toBe(false);
    expect(result.rows).toHaveLength(6);
    expect(result.totals.totalFa).toBe(30);
  });

  it('responde a parámetros manuales (R, k, A)', () => {
    const values = [10, 20, 30, 40];
    const result = generateGroupedFrequencyTable(
      'X', 'u', values,
      { rango: 30, k: 3, amplitud: 10 },
      'discrete'
    );
    expect(result.parameters.userProvided).toBe(true);
    expect(result.parameters.k).toBe(3);
    expect(result.rows).toHaveLength(3);
    expect(result.totals.totalFa).toBe(4);
  });
});

describe('parseContingencyDataString', () => {
  it('parsea pares con conteo final', () => {
    const entries = parseContingencyDataString('Mecanizado, Cumple Siempre: 12\nSoldadura - Uso Parcial');
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ x: 'Mecanizado', y: 'Cumple Siempre', count: 12 });
    expect(entries[1].x).toBe('Soldadura');
    expect(entries[1].y).toBe('Uso Parcial');
  });

  it('separa registros por ; en la misma línea', () => {
    const entries = parseContingencyDataString('A, B; C, D');
    expect(entries).toHaveLength(2);
    expect(entries[1]).toEqual({ x: 'C', y: 'D', count: 1 });
  });

  it('soporta mezcla de saltos de línea y ; (bug corregido)', () => {
    const entries = parseContingencyDataString('A, B\nC, D; E, F');
    expect(entries).toHaveLength(3);
    expect(entries.map(e => e.x)).toEqual(['A', 'C', 'E']);
  });

  it('prioriza la coma sobre " / " en categorías compuestas', () => {
    const entries = parseContingencyDataString('Corte / Laceración, Manos y Dedos: 14');
    expect(entries).toHaveLength(1);
    expect(entries[0].x).toBe('Corte / Laceración');
    expect(entries[0].y).toBe('Manos y Dedos');
    expect(entries[0].count).toBe(14);
  });

  it('acepta multiplicador inicial 12x', () => {
    const entries = parseContingencyDataString('12x Soldadura, Uso Parcial');
    expect(entries[0]).toEqual({ x: 'Soldadura', y: 'Uso Parcial', count: 12 });
  });

  it('acepta pegado desde Excel con tabulaciones y conteo', () => {
    const entries = parseContingencyDataString('Sector\tEstado\t3\nOtro\tEstado');
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ x: 'Sector', y: 'Estado', count: 3 });
  });

  it('acepta ";" como separador interno del par', () => {
    const entries = parseContingencyDataString('Sector; Estado');
    expect(entries[0]).toEqual({ x: 'Sector', y: 'Estado', count: 1 });
  });
});

describe('generateContingencyTable', () => {
  it('construye matriz, marginales y gran total', () => {
    const result = generateContingencyTable('X', 'Y', [
      { x: 'A', y: 'M', count: 2 },
      { x: 'A', y: 'N' },
      { x: 'B', y: 'M', count: 3 },
    ]);
    expect(result.rowCategories).toEqual(['A', 'B']);
    expect(result.colCategories).toEqual(['M', 'N']);
    expect(result.matrix).toEqual([[2, 1], [3, 0]]);
    expect(result.rowMarginalTotals).toEqual([3, 3]);
    expect(result.colMarginalTotals).toEqual([5, 1]);
    expect(result.grandTotal).toBe(6);
  });
});

describe('calculateSafetyIndicators (SRT)', () => {
  it('calcula IF, IG, II y DM del caso oficial de cátedra', () => {
    const result = calculateSafetyIndicators({
      cantidadTrabajadores: 100,
      diasLaborales: 65,
      horasJornada: 8,
      horasExtras: 2000,
      horasNoTrabajadas: 2000,
      accidentesConBaja: 15,
      accidentesSinBaja: 5,
      diasPerdidos: 180,
      factorK: 1000000,
    });

    expect(result.horasTeoricas).toBe(52000);
    expect(result.horasPersonaTrabajo).toBe(52000);
    expect(result.indiceFrecuencia).toBe(288.46);
    expect(result.indiceGravedad).toBe(3461.54);
    expect(result.indiceIncidencia).toBe(150);
    expect(result.duracionMedia).toBe(12);
  });

  it('verifica la coherencia IG = IF × DM con valores exactos', () => {
    const result = calculateSafetyIndicators({
      cantidadTrabajadores: 100,
      diasLaborales: 65,
      horasJornada: 8,
      horasExtras: 2000,
      horasNoTrabajadas: 2000,
      accidentesConBaja: 15,
      accidentesSinBaja: 0,
      diasPerdidos: 180,
      factorK: 1000000,
    });

    expect(result.coherencia.verifica).toBe(true);
    expect(result.coherencia.producto).toBeCloseTo(result.coherencia.igExacto, 6);
    expect(result.coherencia.producto).toBeCloseTo(3461.5384, 3);
  });

  it('con N=0 DM no está definida y la coherencia no verifica', () => {
    const result = calculateSafetyIndicators({
      cantidadTrabajadores: 50,
      diasLaborales: 60,
      horasJornada: 8,
      horasExtras: 0,
      horasNoTrabajadas: 0,
      accidentesConBaja: 0,
      accidentesSinBaja: 3,
      diasPerdidos: 45,
      factorK: 1000000,
    });

    expect(result.duracionMedia).toBe(0);
    expect(result.coherencia.verifica).toBe(false);
    expect(result.indiceFrecuencia).toBe(0);
  });

  it('soporta el factor k = 1.000 (PyME)', () => {
    const result = calculateSafetyIndicators({
      cantidadTrabajadores: 25,
      diasLaborales: 65,
      horasJornada: 8,
      horasExtras: 350,
      horasNoTrabajadas: 350,
      accidentesConBaja: 2,
      accidentesSinBaja: 5,
      diasPerdidos: 14,
      factorK: 1000,
    });

    expect(result.horasPersonaTrabajo).toBe(13000);
    expect(result.indiceFrecuencia).toBe(0.15); // 2 × 1.000 / 13.000
    expect(result.indiceGravedad).toBe(1.08); // 14 × 1.000 / 13.000
    expect(result.baseTextHHT).toBe('por cada mil HHT');
  });

  it('los presets de indicadores producen resultados coherentes', () => {
    for (const preset of SAFETY_INDICATOR_PRESETS) {
      const result = calculateSafetyIndicators({ ...preset });
      expect(result.indiceFrecuencia).toBeGreaterThanOrEqual(0);
      expect(result.horasPersonaTrabajo).toBeGreaterThan(0);
    }
  });
});
