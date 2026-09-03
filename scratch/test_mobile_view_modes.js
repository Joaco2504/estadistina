const { chromium } = require('playwright');
const path = require('path');
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
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\b7678551-bd95-4440-b290-4f8a5b10d9b7';

  console.log('Navigating to http://localhost:3000 on mobile...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // In mobile view (accordion), expand "Tabla de Contingencia"
  console.log('Expanding mobile accordion for Tabla de Contingencia...');
  const contingencyAccordion = page.locator('.md\\:hidden button:has-text("Tabla de Contingencia")');
  await contingencyAccordion.click();
  await page.waitForTimeout(600);

  // Scroll to Tabla Bivariada in mobile
  const tableTitle = page.locator('.md\\:hidden h3:has-text("Tabla Bivariada")');
  await tableTitle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click % del Total General on mobile
  console.log('Clicking % del Total General on mobile...');
  const btnPctTotal = page.locator('.md\\:hidden button:has-text("% del Total General")');
  await btnPctTotal.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, 'contingency_view_mobile.png'),
    fullPage: false
  });

  console.log('Mobile view screenshot captured!');
  await browser.close();
})();
