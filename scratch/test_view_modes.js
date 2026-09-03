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
    viewport: { width: 1440, height: 1150 }
  });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\b7678551-bd95-4440-b290-4f8a5b10d9b7';

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Pestaña Tabla de Contingencia en barra de navegación
  console.log('Switching to Tabla de Contingencia tab...');
  const contingencyTabBtn = page.locator('nav button:has-text("Tabla de Contingencia")');
  await contingencyTabBtn.click();
  await page.waitForTimeout(1000);

  // Scroll to Tabla Bivariada
  const tableTitle = page.locator('.hidden.md\\:block h3:has-text("Tabla Bivariada")');
  await tableTitle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // 1. Modo Normal
  console.log('Capturing Normal mode...');
  await page.screenshot({
    path: path.join(artifactDir, 'contingency_view_normal.png'),
    fullPage: false
  });

  // 2. Modo % del Total General
  console.log('Switching to % del Total General...');
  const btnPctTotal = page.locator('.hidden.md\\:block button:has-text("% del Total General")');
  await btnPctTotal.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(artifactDir, 'contingency_view_pct_total.png'),
    fullPage: false
  });

  // 3. Modo % del Total de la Fila
  console.log('Switching to % del Total de la Fila...');
  const btnPctRow = page.locator('.hidden.md\\:block button:has-text("% del Total de la Fila")');
  await btnPctRow.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(artifactDir, 'contingency_view_pct_row.png'),
    fullPage: false
  });

  // 4. Modo % del Total de la Columna
  console.log('Switching to % del Total de la Columna...');
  const btnPctCol = page.locator('.hidden.md\\:block button:has-text("% del Total de la Columna")');
  await btnPctCol.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(artifactDir, 'contingency_view_pct_col.png'),
    fullPage: false
  });

  // 5. Ventana Flotante Modal
  console.log('Opening Floating Table Modal...');
  const btnFloating = page.locator('.hidden.md\\:block button[title*="Ventana Flotante"]').first();
  await btnFloating.click();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(artifactDir, 'contingency_view_modal.png'),
    fullPage: false
  });

  console.log('All view mode screenshots captured successfully!');
  await browser.close();
})();
