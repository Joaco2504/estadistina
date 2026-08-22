const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando pruebas de Desktop & Mobile Accordions...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({ headless: true, executablePath });

  // 1. PROBAR EN DESKTOP (1280x900)
  console.log('1. Probando en Desktop (1280x900)...');
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // Capturar vista general Desktop (sin sub-header duplicado)
  await desktopPage.screenshot({ path: 'scratch/desktop_view_clean.png' });

  // Capturar Footer Rediseñado a 3 Columnas
  await desktopPage.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: 'scratch/desktop_footer_3cols.png' });

  // 2. PROBAR EN MOBILE (< 768px -> 390x844)
  console.log('2. Probando en Mobile (390x844)...');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Captura de los acordeones móviles
  await mobilePage.screenshot({ path: 'scratch/mobile_accordions_overview.png' });

  // Expandir Acordeón "Frecuencias Agrupadas"
  console.log('3. Expandiendo acordeón Frecuencias Agrupadas en Mobile...');
  await mobilePage.locator('.md\\:hidden button:has-text("Frecuencias Agrupadas")').click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: 'scratch/mobile_accordion_grouped_expanded.png' });

  // Expandir Acordeón "Indicadores SRT"
  console.log('4. Expandiendo acordeón Indicadores SRT en Mobile...');
  await mobilePage.locator('.md\\:hidden button:has-text("Indicadores SRT")').click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: 'scratch/mobile_accordion_srt_expanded.png' });

  // Scroll al footer mobile
  await mobilePage.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'scratch/mobile_footer.png' });

  await browser.close();
  console.log('✅ Pruebas Desktop y Mobile completadas con éxito.');
})();
