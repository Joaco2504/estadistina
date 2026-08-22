const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando pruebas de correcciones de logo, animaciones y módulos...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // 1. Capturar Header con el nuevo Escudo Vectorial y Texto I.E.S. de Belén
  console.log('1. Capturando nuevo Header con Escudo y Campana de Gauss...');
  await page.screenshot({ 
    path: 'scratch/capture_header_shield_logo.png',
    clip: { x: 0, y: 0, width: 600, height: 75 }
  });

  // 2. Capturar Selector de Variables en Frecuencias Simples
  console.log('2. Capturando Selector de Variables en Simples...');
  const cualiBtn = page.locator('.hidden.md\\:block .stat-var-card:has-text("Cualitativa")');
  await cualiBtn.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ 
    path: 'scratch/capture_variable_selector_simple.png',
    clip: { x: 0, y: 140, width: 1280, height: 260 }
  });

  // 3. Clic en Cualitativa y capturar estado activo
  await cualiBtn.click();
  await page.waitForTimeout(400);

  // 4. Capturar Botón Actualizar Tabla y Gráfico con animación Shimmer y Sparkles
  console.log('4. Capturando Botón Actualizar Tabla y Gráfico...');
  const updateBtn = page.locator('.hidden.md\\:block .stat-update-btn');
  await updateBtn.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ 
    path: 'scratch/capture_update_btn_hover.png',
    clip: { x: 800, y: 480, width: 480, height: 180 }
  });

  // 5. Ir a Tabla de Contingencia y verificar ausencia de botón Imprimir
  console.log('5. Verificando Tabla de Contingencia...');
  await page.locator('nav button:has-text("Tabla de Contingencia")').click();
  await page.waitForTimeout(600);

  const printBtnCount = await page.locator('button:has-text("Imprimir")').count();
  console.log(`Botones "Imprimir" en Tabla de Contingencia: ${printBtnCount} (Esperado: 0)`);
  await page.screenshot({ path: 'scratch/capture_contingency_clean.png' });

  // 6. Probar en Modo Oscuro el nuevo Header
  await page.locator('.theme-toggle-btn').click();
  await page.waitForTimeout(400);
  await page.screenshot({ 
    path: 'scratch/capture_header_shield_dark.png',
    clip: { x: 0, y: 0, width: 600, height: 75 }
  });

  await browser.close();
  console.log('✅ Todas las pruebas de correcciones completadas exitosamente.');
})();
