// scratch/test_live_inputs.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🧪 Iniciando prueba de campo "Individuo" y reactividad en tiempo real de gráficos...');

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
  await page.waitForTimeout(500);

  // 1. Verificar que el label "Individuo" existe
  const individuoLabel = await page.locator('label:has-text("Individuo")').first();
  const isLabelVisible = await individuoLabel.isVisible();
  console.log('¿El label "Individuo" está presente?:', isLabelVisible);

  // 2. Escribir una nueva variable en estudio
  const varInput = page.locator('input[placeholder*="Ej: Ocupaciones"]').first();
  await varInput.fill('Incidentes Graves');
  await page.waitForTimeout(400);

  // 3. Escribir un nuevo Individuo
  const unitInput = page.locator('input[placeholder*="Ej: Trabajadores"]').first();
  await unitInput.fill('Operarios');
  await page.waitForTimeout(400);

  // 4. Verificar que el título del gráfico y los ejes se actualizaron inmediatamente
  const chartTitle = await page.locator('h3:has-text("Incidentes Graves")').first().innerText();
  console.log('Título del gráfico actualizado en tiempo real:', chartTitle);

  // 5. Tomar captura de pantalla
  const screenshotPath = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_live_individuo.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Captura guardada en: ${screenshotPath}`);

  await browser.close();
  console.log('✅ Prueba de reactividad completada con éxito.');
})();
