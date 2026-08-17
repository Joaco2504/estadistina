// scratch/browser_qa.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Browser QA Debugger en http://localhost:3000...');
  
  // Buscar ejecutable de Chrome o Edge si Chromium no está descargado
  let launchOptions = { headless: true };
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  if (fs.existsSync(edgePath)) {
    launchOptions.executablePath = edgePath;
  } else if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      console.error(`❌ [Console Error]: ${text}`);
    } else if (msg.type() === 'warning') {
      console.warn(`⚠️ [Console Warn]: ${text}`);
    } else {
      console.log(`ℹ️ [Console ${msg.type()}]: ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
    console.error(`💥 [Unhandled Page Error]: ${err.toString()}`);
  });

  console.log('📡 Navegando a http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('\n--- 1. VERIFICANDO PORTADA E IDENTIDAD INSTITUCIONAL ---');
  const title = await page.title();
  console.log(`Título de página: "${title}"`);
  
  const hasIESBelen = await page.locator('text=I.E.S. de Belén').first().isVisible();
  console.log(`¿Identidad I.E.S. de Belén visible?: ${hasIESBelen}`);

  console.log('\n--- 2. PROBANDO CAMBIO A PESTAÑA "FRECUENCIAS SIMPLES" ---');
  const simpleTabBtn = page.locator('button:has-text("Frecuencias Simples")').first();
  await simpleTabBtn.click();
  await page.waitForTimeout(1000);
  const isSimpleVisible = await page.locator('text=Tabla de Distribución de Frecuencias Simples').isVisible();
  console.log(`¿Módulo de Frecuencias Simples cargado?: ${isSimpleVisible}`);

  console.log('\n--- 3. PROBANDO CAMBIO A PESTAÑA "TABLA DE CONTINGENCIA" ---');
  const contingencyTabBtn = page.locator('button:has-text("Tabla de Contingencia")').first();
  await contingencyTabBtn.click();
  await page.waitForTimeout(1000);
  const isContingencyVisible = await page.locator('text=Análisis Estadístico Bivariado').isVisible();
  console.log(`¿Módulo de Contingencia cargado?: ${isContingencyVisible}`);

  console.log('\n--- 4. PROBANDO INTERACCIÓN EN CONTINGENCIA (GENERAR CASO ALEATORIO) ---');
  const randomContingencyBtn = page.locator('button:has-text("Generar Caso Aleatorio")');
  await randomContingencyBtn.click();
  await page.waitForTimeout(500);
  console.log('Generar Caso Aleatorio clickeado con éxito.');

  console.log('\n--- 5. PROBANDO CAMBIO A PESTAÑA "APUNTES DE LA CÁTEDRA" ---');
  const notesTabBtn = page.locator('button:has-text("Apuntes de la Cátedra")').first();
  await notesTabBtn.click();
  await page.waitForTimeout(1000);
  const isNotesVisible = await page.locator('text=Apuntes y Guías Prácticas de la Cátedra').isVisible();
  console.log(`¿Módulo de Apuntes cargado?: ${isNotesVisible}`);

  // Probar abrir modal de Apunte Teórico
  console.log('Abriendo modal de Apunte Teórico Unidad 1...');
  const openTheoryBtn = page.locator('button:has-text("Apunte Teórico")').first();
  await openTheoryBtn.click();
  await page.waitForTimeout(500);
  const isTheoryModalOpen = await page.locator('text=Resumen Ejecutivo de la Unidad').isVisible();
  console.log(`¿Modal de Apunte Teórico abierto?: ${isTheoryModalOpen}`);
  
  // Cerrar modal
  const closeBtn = page.locator('button:has-text("Cerrar"), button:has(.lucide-x)').first();
  await closeBtn.click();
  await page.waitForTimeout(500);

  console.log('\n--- 6. VOLVIENDO A "FRECUENCIAS AGRUPADAS" Y PROBANDO ENTRADA DE DATOS ---');
  const groupedTabBtn = page.locator('button:has-text("Frecuencias Agrupadas")').first();
  await groupedTabBtn.click();
  await page.waitForTimeout(1000);

  // Probar botón "Generar Datos Aleatorios"
  console.log('Presionando botón "Generar Datos Aleatorios"...');
  const randomDataBtn = page.locator('button:has-text("Generar Datos Aleatorios")').first();
  await randomDataBtn.click();
  await page.waitForTimeout(1000);

  const rawValueAfterRandom = await page.locator('textarea').inputValue();
  console.log(`Datos en bruto generados (primeros 50 caracteres): "${rawValueAfterRandom.substring(0, 50)}..."`);

  // Probar ingresar datos manuales
  console.log('Ingresando datos manuales personalizados: "10; 20; 30; 40; 50; 60; 70; 80; 90; 100"...');
  const textarea = page.locator('textarea');
  await textarea.fill('10; 20; 30; 40; 50; 60; 70; 80; 90; 100');
  
  const calcBtn = page.locator('button:has-text("Generar Tabla y Gráfico Didáctico")');
  await calcBtn.click();
  await page.waitForTimeout(1000);

  const isN10 = await page.locator('text=Muestra: n = 10').isVisible() || await page.locator('text=n = 10').first().isVisible();
  console.log(`¿Tabla recalculada con n = 10?: ${isN10}`);

  // Verificar regla de la raíz: sqrt(10) ~ 3.16 -> k = 3
  const isK3 = await page.locator('text=k = 3 intervalos').isVisible() || await page.locator('text=k = 3').first().isVisible();
  console.log(`¿Cantidad de clases calculada con k = 3 (√10)?: ${isK3}`);

  // Verificar prohibición de sumatoria (Σ)
  const pageContent = await page.content();
  const hasSigmaSymbol = pageContent.includes('∑') || pageContent.includes('Σ');
  console.log(`¿Existe algún símbolo de sumatoria (Σ) en el DOM?: ${hasSigmaSymbol} (Debe ser false)`);
  
  const hasSumaTotalText = await page.locator('text=Suma total').first().isVisible();
  console.log(`¿Texto explícito "Suma total" visible?: ${hasSumaTotalText}`);

  console.log('\n--- 7. PROBANDO GLOSARIO DE FÓRMULAS ---');
  const glossaryBtn = page.locator('button:has-text("Formulario")').first();
  await glossaryBtn.click();
  await page.waitForTimeout(500);
  const isGlossaryOpen = await page.locator('text=Formulario Oficial Didáctico de la Cátedra').isVisible();
  console.log(`¿Modal de Formulario Oficial abierto?: ${isGlossaryOpen}`);

  const closeGlossaryBtn = page.locator('button:has-text("Cerrar Formulario")');
  await closeGlossaryBtn.click();
  await page.waitForTimeout(500);

  console.log('\n--- RESUMEN FINAL DE ERRORES ---');
  console.log(`Total errores de consola: ${consoleLogs.filter(l => l.type === 'error').length}`);
  console.log(`Total excepciones no controladas de página: ${pageErrors.length}`);

  await browser.close();
  console.log('\n✅ Prueba automatizada de QA finalizada con éxito.');
})();
