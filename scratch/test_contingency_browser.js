// scratch/test_contingency_browser.js
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
  const context = await browser.newContext({ viewport: { width: 1300, height: 1100 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click on "Tabla de Contingencia" in the navbar
  console.log('Clicking on Tabla de Contingencia tab...');
  const contingencyNavBtn = page.locator('nav button:has-text("Tabla de Contingencia")');
  await contingencyNavBtn.click();
  await page.waitForTimeout(800);

  // Capture screenshot of the initial Contingency section with the new input field
  const artifactDir = 'C:\\Users\\emili\\.gemini\\antigravity\\brain\\b7678551-bd95-4440-b290-4f8a5b10d9b7';
  await page.screenshot({ path: `${artifactDir}\\contingency_initial.png`, fullPage: false });
  console.log('📸 Captured contingency_initial.png');

  // Test clicking a preset, e.g. "Turno vs. Gravedad"
  console.log('Clicking on Turno vs. Gravedad preset...');
  const turnosPresetBtn = page.locator('.hidden.md\\:block button:has-text("Turno vs. Gravedad")');
  await turnosPresetBtn.click();
  await page.waitForTimeout(800);

  // Verify textarea value has Turno Mañana
  const textareaVal = await page.locator('.hidden.md\\:block textarea').inputValue();
  console.log('Textarea sample content after preset:', textareaVal.slice(0, 100));

  await page.screenshot({ path: `${artifactDir}\\contingency_preset_turnos.png`, fullPage: false });
  console.log('📸 Captured contingency_preset_turnos.png');

  // Test custom input
  console.log('Typing custom raw data...');
  const customData = `Montaje, Conforme
Montaje, Conforme
Montaje, En Revisión
Mantenimiento, Conforme: 4
Mantenimiento, No Conforme: 2
Logística, No Conforme: 3`;

  await page.locator('.hidden.md\\:block textarea').fill(customData);
  await page.waitForTimeout(400);

  // Click "Actualizar Tabla y Gráfico"
  console.log('Clicking Actualizar Tabla y Gráfico...');
  const updateBtn = page.locator('.hidden.md\\:block button:has-text("Actualizar Tabla y Gráfico")');
  await updateBtn.click();
  await page.waitForTimeout(800);

  // Capture screenshot of the custom data result
  await page.screenshot({ path: `${artifactDir}\\contingency_custom_updated.png`, fullPage: false });
  console.log('📸 Captured contingency_custom_updated.png');

  // Test random generation with chip 35
  console.log('Clicking Fijar n chip 35...');
  const chip35 = page.locator('.hidden.md\\:block button:has-text("35")');
  await chip35.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${artifactDir}\\contingency_random_n35.png`, fullPage: false });
  console.log('📸 Captured contingency_random_n35.png');

  console.log('ALL BROWSER TESTS COMPLETED SUCCESSFULLY!');
  await browser.close();
})();
