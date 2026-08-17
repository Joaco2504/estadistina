// scratch/test_mobile_and_order.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('📱 Iniciando pruebas de vista móvil y nuevo orden de tablas...');

  let launchOptions = { headless: true };
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  if (fs.existsSync(edgePath)) {
    launchOptions.executablePath = edgePath;
  } else if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await chromium.launch(launchOptions);
  
  // Test en viewport móvil (390 x 844 - iPhone 13/14)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  });
  const page = await mobileContext.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('\n--- 1. VERIFICANDO ORDEN DE PESTAÑAS EN MÓVIL ---');
  const mobileTabs = await page.locator('header button').allInnerTexts();
  console.log('Botones detectados en el header móvil:', mobileTabs.map(t => t.replace(/\n/g, ' ').trim()).filter(Boolean));

  // Verificar que la pestaña activa inicial sea "Frecuencias Simples"
  const isSimpleActive = await page.locator('h2:has-text("Frecuencias Simples"), h3:has-text("Distribución de Frecuencias Simples")').first().isVisible();
  console.log(`¿La pestaña inicial es Frecuencias Simples?: ${isSimpleActive}`);

  // Captura de pantalla móvil inicial
  const mobileScreenshot1 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_mobile_simple.png';
  await page.screenshot({ path: mobileScreenshot1, fullPage: false });
  console.log(`📸 Captura móvil (Simples) guardada en: ${mobileScreenshot1}`);

  // Cambiar a Frecuencias Agrupadas tocando la barra móvil
  console.log('\n--- 2. NAVEGANDO A FRECUENCIAS AGRUPADAS EN MÓVIL ---');
  await page.locator('button:has-text("Frecuencias Agrupadas")').last().click();
  await page.waitForTimeout(600);
  const isGroupedActive = await page.locator('h2:has-text("Frecuencias Agrupadas")').first().isVisible();
  console.log(`¿Frecuencias Agrupadas cargó correctamente en móvil?: ${isGroupedActive}`);

  // Captura de pantalla móvil agrupadas
  const mobileScreenshot2 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_mobile_grouped.png';
  await page.screenshot({ path: mobileScreenshot2, fullPage: false });
  console.log(`📸 Captura móvil (Agrupadas) guardada en: ${mobileScreenshot2}`);

  // Cambiar a Tabla de Contingencia tocando la barra móvil
  console.log('\n--- 3. NAVEGANDO A TABLA DE CONTINGENCIA EN MÓVIL ---');
  await page.locator('button:has-text("Tabla de Contingencia")').last().click();
  await page.waitForTimeout(600);
  const isContingencyActive = await page.locator('h2:has-text("Módulo 3: Tabla de Contingencia")').first().isVisible();
  console.log(`¿Tabla de Contingencia cargó correctamente en móvil?: ${isContingencyActive}`);

  // Captura de pantalla móvil contingencia
  const mobileScreenshot3 = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_mobile_contingency.png';
  await page.screenshot({ path: mobileScreenshot3, fullPage: false });
  console.log(`📸 Captura móvil (Contingencia) guardada en: ${mobileScreenshot3}`);

  console.log(`\nTotal errores de consola: ${consoleErrors.length}`);
  await browser.close();
  console.log('✅ Pruebas móviles completadas exitosamente.');
})();
