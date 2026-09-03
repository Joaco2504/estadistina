// scratch/test_mobile_contingency.js
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
  const context = await browser.newContext({ 
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const page = await context.newPage();

  console.log('Navigating to mobile view...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Open the Contingency accordion in mobile
  console.log('Opening mobile Contingency accordion...');
  const contingencyAccordion = page.locator('.md\\:hidden button:has(h3:has-text("Tabla de Contingencia"))');
  await contingencyAccordion.click();
  await page.waitForTimeout(1000);

  const artifactDir = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\b7678551-bd95-4440-b290-4f8a5b10d9b7';
  await page.screenshot({ path: `${artifactDir}\\contingency_mobile_verified.png`, fullPage: false });
  console.log('📸 Captured contingency_mobile_verified.png');

  await browser.close();
})();
