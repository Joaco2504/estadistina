# Cátedra de Estadística y SySO — I.E.S. de Belén

Plataforma didáctica e interactiva para la **Tecnicatura Superior en Higiene, Seguridad y Control Ambiental – Industrial** del I.E.S. de Belén (Catamarca, Argentina). Docente: **Prof. Pacheco E. Joaquín**.

La aplicación cubre la **Unidad 1** de la cátedra (*Estadística, Cálculo de la Probabilidad y Costos de la Seguridad*) con herramientas de cálculo paso a paso orientadas a casos reales de Higiene y Seguridad Laboral.

## Módulos

| Módulo | Descripción |
|---|---|
| 📊 **Frecuencias Simples** | Tablas fa, fr, p, Fa, Fr, P para variables cuantitativas discretas y cualitativas, con gráficos y explicación paso a paso de cada celda. |
| 📑 **Frecuencias Agrupadas** | Intervalos de clase con Regla de la Raíz (k = √n), Rango, Amplitud, Marca de Clase e histograma; admite parámetros manuales (R, k, A). |
| 🛡️ **Indicadores SRT** | Cálculo oficial de IF, IG, II y DM (SRT / IRAM 3800 / OIT) con verificación de coherencia IG = IF × DM y diagnóstico preventivo automático. |
| ⊞ **Tabla de Contingencia** | Análisis bivariado con matriz editable, frecuencias conjuntas, marginales, modos de vista (%, fila, columna) y gráfico. |
| 📘 **Apuntes de Cátedra** | Contenido teórico de las unidades, guías de trabajos prácticos y glosario oficial de fórmulas, con impresión directa. |

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com) (modo claro/oscuro, responsive PC/tablet/móvil)
- [Recharts 3](https://recharts.org) para los gráficos y [KaTeX](https://katex.org) para las fórmulas
- Exportación a Excel con [SheetJS](https://sheetjs.com) (cargada bajo demanda)
- Tests con [Vitest 4](https://vitest.dev)

## Scripts

```bash
npm run dev        # Servidor de desarrollo (http://localhost:3000)
npm run build      # Build de producción
npm run start      # Servir el build de producción
npm run lint       # ESLint sobre src/
npm run typecheck  # Verificación de tipos TypeScript
npm run test       # Tests unitarios (Vitest)
```

## Estructura

```
src/
├── app/            # layout, página principal y estilos globales
├── components/
│   ├── layout/     # Navbar, Footer e identidad institucional
│   ├── modules/    # Los 5 módulos didácticos
│   └── ui/         # Componentes reutilizables (modales, botones, fórmulas)
├── lib/            # Lógica estadística pura (statistics.ts) y utilidades
└── types/          # Tipos compartidos
```

La lógica estadística vive en `src/lib/statistics.ts` como funciones puras (fácilmente testeables en `statistics.test.ts`); los componentes solo consumen sus resultados.

## Despliegue

El proyecto está preparado para [Vercel](https://vercel.com) (analytics incluidos). `npm run build && npm run start` también funciona en cualquier servidor Node 20+.

## Licencia

Material didáctico académico de uso interno de la cátedra.
