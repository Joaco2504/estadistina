// scratch/test_qualitative_and_contingency.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🧪 Iniciando prueba de Variables Cualitativas, Gráficos Dinámicos y Editor de Contingencia...');

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

  console.log('\n--- 1. PROBANDO VARIABLE CUALITATIVA EN FRECUENCIAS SIMPLES ---');
  // Cambiar a modo cualitativo
  await page.locator('button:has-text("Cualitativa (Categorías / Texto)")').click();
  await page.waitForTimeout(500);

  const isQualitativeActive = await page.locator('text=Variable Cualitativa').first().isVisible();
  console.log(`¿Insignia de Variable Cualitativa visible?: ${isQualitativeActive}`);

  // Cargar preset de Naturaleza de Lesión
  await page.locator('button:has-text("Tipo")').first().click();
  await page.waitForTimeout(500);

  const hasQualitativeCategories = await page.locator('td:has-text("Corte en manos"), td:has-text("Contusión")').count();
  console.log(`¿Categorías cualitativas detectadas en la tabla?: ${hasQualitativeCategories > 0}`);

  const screenshotPath1 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_qualitative_simple.png';
  await page.screenshot({ path: screenshotPath1, fullPage: false });
  console.log(`📸 Captura guardada en: ${screenshotPath1}`);

  console.log('\n--- 2. PROBANDO TABLA DE CONTINGENCIA INTERACTIVA Y NUEVOS EJEMPLOS ---');
  await page.locator('button:has-text("Tabla de Contingencia")').first().click();
  await page.waitForTimeout(600);

  // Probar nuevo preset: Lesión vs. Zona Corporal
  await page.locator('button:has-text("Naturaleza de Lesión")').first().click();
  await page.waitForTimeout(500);

  const hasLesionZonas = await page.locator('th:has-text("Manos y Dedos"), td:has-text("Corte / Laceración")').count();
  console.log(`¿Nuevo preset bivariado cargado correctamente?: ${hasLesionZonas > 0}`);

  // Probar edición interactiva de celda
  console.log('Editando celda (0,0) de la matriz de contingencia...');
  const firstInput = page.locator('table input[type="number"]').first();
  await firstInput.fill('25');
  await page.waitForTimeout(300);

  const newGrandTotal = await page.locator('td.bg-\\[\\#0F2942\\]').innerText();
  console.log(`Gran total recalculado tras editar celda: ${newGrandTotal}`);

  const screenshotPath2 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_contingency_editor.png';
  await page.screenshot({ path: screenshotPath2, fullPage: false });
  console.log(`📸 Captura de editor de contingencia guardada en: ${screenshotPath2}`);

  console.log(`\nTotal errores de consola: ${consoleErrors.length}`);
  await browser.close();
  console.log('✅ Pruebas completadas exitosamente.');
})();
