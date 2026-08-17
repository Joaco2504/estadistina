// scratch/capture_bottom.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
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
  await page.waitForTimeout(400);

  // Escribir variable e individuo
  const varInput = page.locator('input[placeholder*="Ej: Ocupaciones"]').first();
  await varInput.fill('Incidentes Graves');

  const unitInput = page.locator('input[placeholder*="Ej: Trabajadores"]').first();
  await unitInput.fill('Operarios');
  await page.waitForTimeout(400);

  // Scroll al gráfico
  await page.locator('.recharts-responsive-container').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const screenshotPath = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\aafa3464-74b6-4716-9d14-744a5366be85\\screenshot_live_chart_individuo.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Captura del gráfico guardada en: ${screenshotPath}`);

  await browser.close();
})();
