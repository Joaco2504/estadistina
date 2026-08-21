const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Capturar Switcher y Radio buttons en Frecuencias Simples
  const switcher = page.locator('.stat-cta-btn').first();
  await switcher.hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/screenshot_cta_hover.png', clip: { x: 0, y: 50, width: 1280, height: 400 } });

  // 2. Capturar Radio buttons Simples
  await page.screenshot({ path: 'scratch/screenshot_radio_simple.png', clip: { x: 0, y: 150, width: 1280, height: 350 } });

  // 3. Capturar Radio buttons en Agrupadas
  await page.locator('.stat-cta-btn:has-text("2. Frecuencias Agrupadas")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch/screenshot_radio_grouped.png', clip: { x: 0, y: 150, width: 1280, height: 350 } });

  await browser.close();
  console.log('📸 Capturas detalladas guardadas.');
})();
