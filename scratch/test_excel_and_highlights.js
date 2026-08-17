// scratch/test_excel_and_highlights.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🧪 Iniciando prueba de Exportar a Excel, Iluminación de Celdas y Nuevos Casos...');

  let launchOptions = { headless: true };
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  if (fs.existsSync(edgePath)) {
    launchOptions.executablePath = edgePath;
  } else if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('\n--- 1. VERIFICANDO BOTÓN "EXPORTAR A EXCEL" ---');
  const excelBtn = await page.locator('button:has-text("Exportar a Excel")').first().isVisible();
  console.log(`¿Botón "Exportar a Excel" visible?: ${excelBtn}`);

  console.log('\n--- 2. PROBANDO ILUMINACIÓN DE CELDAS EN TIEMPO REAL AL PASAR EL MOUSE POR LOS PASOS ---');
  // Hover en Paso 1 (Marca de Clase)
  console.log('Hover en Tarjeta 1 (Marca de Clase Mc)...');
  await page.locator('text=1. Marca de Clase (Mc)').first().hover();
  await page.waitForTimeout(400);
  const isMcBannerVisible = await page.locator('text=Iluminando: Marca de Clase').isVisible();
  console.log(`¿Banner de iluminación de Mc activo?: ${isMcBannerVisible}`);

  // Hover en Paso 4 (Acumulados)
  console.log('Hover en Tarjeta 4 (Acumulados Fa, Fr, P)...');
  await page.locator('text=4. Acumulados (Fa, Fr, P)').first().hover();
  await page.waitForTimeout(400);
  const isAcumBannerVisible = await page.locator('text=Iluminando: Frecuencia Acumulada Fa').isVisible();
  console.log(`¿Banner de iluminación de Acumulados activo?: ${isAcumBannerVisible}`);

  console.log('\n--- 3. VERIFICANDO CANTIDAD DE CASOS DE SYSO DISPONIBLES ---');
  const groupedCaseButtons = await page.locator('button:has-text("Nivel"), button:has-text("Monóxido"), button:has-text("Estrés"), button:has-text("Polvo"), button:has-text("Peso"), button:has-text("Edades")').count();
  console.log(`Cantidad de casos de prevención detectados en panel: ${groupedCaseButtons}`);

  // Captura de pantalla de la interactividad con celdas iluminadas
  const screenshotPath = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_highlight_excel.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Captura de pantalla guardada en: ${screenshotPath}`);

  console.log(`\nTotal errores de consola: ${consoleErrors.length}`);
  await browser.close();
  console.log('✅ Prueba completada con éxito.');
})();
