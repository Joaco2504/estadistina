const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando pruebas completas de todas las animaciones...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Cargar la página y capturar estado de carga inicial si es visible
  console.log('1. Cargando http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'scratch/capture_page_load.png' });

  await page.waitForTimeout(1200);

  // 2. Capturar Navbar con Botón de Modo Oscuro y Botón de Fórmulas Cátedra
  console.log('2. Capturando Navbar (Modo Oscuro & Fórmulas Cátedra)...');
  await page.locator('.stat-formula-btn').hover();
  await page.waitForTimeout(300);
  await page.screenshot({ 
    path: 'scratch/capture_navbar_buttons.png', 
    clip: { x: 0, y: 0, width: 1280, height: 90 } 
  });

  // 3. Probar clic en Botón Fórmulas Cátedra
  console.log('3. Abriendo Modal de Fórmulas...');
  await page.locator('.stat-formula-btn').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/capture_modal_formulas.png' });
  await page.locator('button:has-text("Cerrar Formulario")').click();
  await page.waitForTimeout(400);

  // 4. Capturar Botones de Tipo de Gráficos en Frecuencias Simples
  console.log('4. Capturando Botones de Tipo de Gráficos (Barras, Circular, Líneas)...');
  await page.locator('.stat-chart-btn:has-text("Circular")').hover();
  await page.waitForTimeout(300);
  await page.screenshot({ 
    path: 'scratch/capture_chart_buttons_simple.png', 
    clip: { x: 0, y: 350, width: 1280, height: 350 } 
  });

  // 5. Clic en Circular y luego Líneas
  await page.locator('.stat-chart-btn:has-text("Circular")').click();
  await page.waitForTimeout(600);
  await page.locator('.stat-chart-btn:has-text("Líneas")').click();
  await page.waitForTimeout(600);

  // 6. Cambiar a Frecuencias Agrupadas con el botón Switcher
  console.log('6. Cambiando a Frecuencias Agrupadas con Switcher...');
  await page.locator('.stat-cta-btn:has-text("2. Frecuencias Agrupadas")').click();
  await page.waitForTimeout(800);

  // 7. Capturar Botones de Tipo de Gráficos en Agrupadas (Histograma, Polígono, Circular, Ojiva)
  console.log('7. Capturando Botones de Gráficos en Agrupadas...');
  await page.locator('.stat-chart-btn:has-text("Polígono")').hover();
  await page.waitForTimeout(300);
  await page.screenshot({ 
    path: 'scratch/capture_chart_buttons_grouped.png', 
    clip: { x: 0, y: 350, width: 1280, height: 350 } 
  });

  // 8. Clic en Polígono y luego Ojiva
  await page.locator('.stat-chart-btn:has-text("Polígono")').click();
  await page.waitForTimeout(600);
  await page.locator('.stat-chart-btn:has-text("Ojiva (Fa)")').click();
  await page.waitForTimeout(600);

  // 9. Probar Modo Oscuro y capturar animación de halo y sol
  console.log('9. Alternando a Modo Oscuro...');
  await page.locator('.theme-toggle-btn').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/capture_dark_mode_full.png' });

  await browser.close();
  console.log('✅ Todas las pruebas de animaciones completadas exitosamente.');
})();
