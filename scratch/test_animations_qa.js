const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando prueba de animaciones...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Console Error]: ${msg.text()}`);
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.error(`[Page Error]: ${err.toString()}`);
    consoleErrors.push(err.toString());
  });

  console.log('Navegando a http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 1. Verificar Frequency Table Switcher (brown-bobcat-65)
  console.log('Verificando Frequency Table Switcher...');
  const ctaButtons = await page.locator('.stat-cta-btn').count();
  console.log(`Botones CTA encontrados: ${ctaButtons}`);
  await page.screenshot({ path: 'scratch/screenshot_initial.png', fullPage: false });

  // 2. Probar cambio a Frecuencias Agrupadas
  console.log('Haciendo clic en 2. Frecuencias Agrupadas...');
  await page.locator('.stat-cta-btn:has-text("2. Frecuencias Agrupadas")').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/screenshot_grouped.png', fullPage: false });

  // 3. Probar Radio buttons de variables en Agrupadas (terrible-eagle-23)
  console.log('Probando Radio button: Cuantitativa Discreta (Números Enteros)...');
  await page.locator('label:has-text("Cuantitativa Discreta (Números Enteros)")').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/screenshot_grouped_discrete.png', fullPage: false });

  // 4. Probar volver a Frecuencias Simples
  console.log('Volviendo a 1. Frecuencias Simples...');
  await page.locator('.stat-cta-btn:has-text("1. Frecuencias Simples")').click();
  await page.waitForTimeout(1000);

  // 5. Probar Radio buttons en Simples: Cualitativa
  console.log('Probando Radio button: Cualitativa (Categorías / Texto)...');
  await page.locator('label:has-text("Cualitativa (Categorías / Texto)")').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/screenshot_qualitative.png', fullPage: false });

  // 6. Probar Radio button: Cuantitativa Discreta
  console.log('Probando Radio button: Cuantitativa Discreta (Números)...');
  await page.locator('label:has-text("Cuantitativa Discreta (Números)")').click();
  await page.waitForTimeout(1000);

  // 7. Probar Presets y Generar Muestra
  console.log('Probando botón Generar Muestra...');
  await page.locator('button:has-text("Generar Muestra")').click();
  await page.waitForTimeout(1000);

  // 8. Probar Modo Oscuro
  console.log('Probando Modo Oscuro...');
  await page.locator('button[aria-label="Alternar tema oscuro o claro"]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/screenshot_dark_mode.png', fullPage: false });

  console.log(`Errores capturados: ${consoleErrors.length}`);
  await browser.close();
  console.log('✅ Prueba finalizada con éxito.');
})();
