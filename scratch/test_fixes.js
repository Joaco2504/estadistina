// scratch/test_fixes.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🧪 Iniciando prueba de Redondeo a 2 decimales, Visibilidad de Texto en Torta y Títulos de Ejes...');

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

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('\n--- 1. PROBANDO VARIABLE CUALITATIVA "OCUPACIONES DECLARADAS" Y GRÁFICO CIRCULAR ---');
  // Cambiar a modo cualitativo
  await page.locator('button:has-text("Cualitativa (Categorías / Texto)")').click();
  await page.waitForTimeout(400);

  // Seleccionar preset de Ocupaciones declaradas
  await page.locator('button:has-text("Ocupaciones")').first().click();
  await page.waitForTimeout(500);

  // Cambiar gráfico a Circular
  await page.locator('button:has-text("Circular")').first().click();
  await page.waitForTimeout(500);

  // Hacer hover sobre el gráfico circular
  const pieSlice = page.locator('.recharts-pie-sector').first();
  if (await pieSlice.isVisible()) {
    await pieSlice.hover();
    await page.waitForTimeout(400);
  }

  const screenshotPath1 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_pie_chart_tooltip.png';
  await page.screenshot({ path: screenshotPath1, fullPage: false });
  console.log(`📸 Captura del gráfico circular con tooltip guardada en: ${screenshotPath1}`);

  console.log('\n--- 2. VERIFICANDO REDONDEO A 2 DECIMALES EN TABLA ---');
  const frCells = await page.locator('td:nth-child(4)').allInnerTexts();
  console.log('Muestra de valores de fr en tabla:', frCells.slice(0, 4));

  const allTwoDecimals = frCells.slice(0, -1).every(val => /^\d+\.\d{2}$/.test(val.trim()));
  console.log(`¿Todos los valores de fr tienen exactamente 2 decimales?: ${allTwoDecimals}`);

  console.log('\n--- 3. PROBANDO TABLA AGRUPADA Y TÍTULOS DE EJES (X con unidad, Y contextual) ---');
  await page.locator('button:has-text("Frecuencias Agrupadas")').first().click();
  await page.waitForTimeout(600);

  const screenshotPath2 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_grouped_axis.png';
  await page.screenshot({ path: screenshotPath2, fullPage: false });
  console.log(`📸 Captura de frecuencias agrupadas guardada en: ${screenshotPath2}`);

  await browser.close();
  console.log('✅ Pruebas finalizadas con éxito.');
})();
