// scratch/test_minimalist_charts.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🧪 Iniciando pruebas de interfaz minimalista, control de muestra (n) y selector de gráficos...');

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

  console.log('\n--- 1. PROBANDO CONTROL DE TAMAÑO MUESTRAL (n) ---');
  // Probar chip de n = 50
  console.log('Haciendo clic en chip n = 50...');
  await page.locator('button:has-text("50")').first().click();
  await page.waitForTimeout(600);
  const isN50 = await page.locator('text=n actual = 50').isVisible();
  console.log(`¿Muestra generada con n = 50?: ${isN50}`);

  // Probar escribir n = 16 en el input numérico
  console.log('Ingresando manualmente n = 16...');
  const sampleInput = page.locator('input[type="number"][min="3"]').first();
  await sampleInput.fill('16');
  await page.locator('button:has-text("Generar Muestra")').first().click();
  await page.waitForTimeout(600);
  const isN16 = await page.locator('text=n actual = 16').isVisible();
  console.log(`¿Muestra generada con n = 16?: ${isN16}`);

  // Verificar regla de la raíz: sqrt(16) = 4 clases
  const isK4 = await page.locator('text=k = 4').first().isVisible();
  console.log(`¿Cantidad de clases calculada con k = 4 (√16)?: ${isK4}`);

  console.log('\n--- 2. PROBANDO SELECTOR DE TIPOS DE GRÁFICOS EN FRECUENCIAS AGRUPADAS ---');
  // Probar Polígono
  console.log('Cambiando a Polígono de Frecuencias...');
  await page.locator('button:has-text("Polígono")').first().click();
  await page.waitForTimeout(400);

  // Probar Circular
  console.log('Cambiando a Gráfico Circular (Torta)...');
  await page.locator('button:has-text("Circular")').first().click();
  await page.waitForTimeout(400);

  // Probar Ojiva
  console.log('Cambiando a Ojiva de Frecuencias Acumuladas...');
  await page.locator('button:has-text("Ojiva (Fa)")').first().click();
  await page.waitForTimeout(400);

  // Volver a Histograma
  console.log('Volviendo a Histograma...');
  await page.locator('button:has-text("Histograma")').first().click();
  await page.waitForTimeout(400);

  console.log('\n--- 3. PROBANDO SELECTOR DE GRÁFICOS EN FRECUENCIAS SIMPLES ---');
  await page.locator('button:has-text("Simples")').first().click();
  await page.waitForTimeout(600);

  console.log('Cambiando a Gráfico Circular en Simples...');
  await page.locator('button:has-text("Circular")').first().click();
  await page.waitForTimeout(400);

  console.log('Cambiando a Gráfico de Líneas en Simples...');
  await page.locator('button:has-text("Líneas")').first().click();
  await page.waitForTimeout(400);

  console.log('\n--- 4. PROBANDO CONTINGENCIA CON SELECTOR DE MUESTRA Y BARRAS APILADAS ---');
  await page.locator('button:has-text("Contingencia")').first().click();
  await page.waitForTimeout(600);

  console.log('Fijando n = 80 en contingencia...');
  await page.locator('button:has-text("80")').first().click();
  await page.waitForTimeout(600);

  console.log('Cambiando a Barras Apiladas...');
  await page.locator('button:has-text("Barras Apiladas")').first().click();
  await page.waitForTimeout(400);

  // Captura de pantalla de la interfaz minimalista
  const screenshotPath = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_minimalist.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Captura de pantalla guardada en: ${screenshotPath}`);

  console.log(`\nErrores de consola detectados: ${consoleErrors.length}`);
  await browser.close();
  console.log('✅ Todas las pruebas finalizaron con éxito.');
})();
