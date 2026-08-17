// scratch/test_tab_switch.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🔍 Probando cambio de Frecuencia Simple a Tabla de Contingencia...');
  
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

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error(`❌ Console Error: ${msg.text()}`);
    else console.log(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.error(`💥 Page Error: ${err}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Clic en Frecuencias Simples
  console.log('1. Clic en "Frecuencias Simples"...');
  await page.locator('button:has-text("Frecuencias Simples")').first().click();
  await page.waitForTimeout(1000);

  // 2. Clic en Tabla de Contingencia
  console.log('2. Clic en "Tabla de Contingencia"...');
  await page.locator('button:has-text("Tabla de Contingencia")').first().click();
  await page.waitForTimeout(1500);

  const isContingencyTableVisible = await page.locator('text=Tabla de Contingencia Bivariada').isVisible();
  console.log(`¿Tabla de Contingencia visible?: ${isContingencyTableVisible}`);

  const isBivariateBarChartVisible = await page.locator('text=Distribución Bivariada Conjunta').isVisible();
  console.log(`¿Gráfico Bivariado visible?: ${isBivariateBarChartVisible}`);

  // Captura de pantalla de la vista de contingencia
  const screenshotPath = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_contingency.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Captura guardada en: ${screenshotPath}`);

  await browser.close();
})();
