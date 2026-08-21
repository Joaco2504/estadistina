const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  const page = await context.newPage();

  // Create a minimal HTML page that loads the CSS and renders StatisticalLoader
  const cssContent = fs.readFileSync('src/app/globals.css', 'utf8');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          ${cssContent}
        </style>
      </head>
      <body class="bg-[#080D1A] flex flex-col items-center justify-center min-h-screen text-white">
        <div class="flex flex-col items-center justify-center p-6 text-center select-none">
          <div class="stat-loader-container relative scale-100 transition-transform">
            <div class="stat-loader">
              <!-- Anillo Exterior: Σ, x̄, σ -->
              <div class="stat-ring stat-outer">
                <div class="stat-item stat-item-1">
                  <span class="stat-symbol font-serif text-cyan-300">Σ</span>
                </div>
                <div class="stat-item stat-item-2">
                  <span class="stat-symbol font-serif text-cyan-300">x̄</span>
                </div>
                <div class="stat-item stat-item-3">
                  <span class="stat-symbol font-serif text-cyan-300">σ</span>
                </div>
              </div>

              <!-- Anillo Intermedio: fi, Me -->
              <div class="stat-ring stat-middle">
                <div class="stat-item stat-item-1">
                  <span class="stat-symbol font-mono text-emerald-300">fᵢ</span>
                </div>
                <div class="stat-item stat-item-2">
                  <span class="stat-symbol font-mono text-emerald-300">Me</span>
                </div>
              </div>

              <!-- Anillo Interior: Hi, % -->
              <div class="stat-ring stat-inner">
                <div class="stat-item stat-item-1">
                  <span class="stat-symbol font-mono text-amber-300 text-xs">Hᵢ</span>
                </div>
                <div class="stat-item stat-item-2">
                  <span class="stat-symbol font-mono text-amber-300 text-xs">%</span>
                </div>
              </div>

              <!-- Núcleo Central -->
              <div class="stat-core"></div>
            </div>
          </div>
          <div class="mt-5 space-y-1">
            <h4 class="text-sm font-bold text-slate-100 tracking-wide">Procesando Datos Estadísticos...</h4>
            <p class="text-[11px] text-slate-400 font-medium">Cátedra de Estadística · IES Belén</p>
          </div>
        </div>
      </body>
    </html>
  `);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/screenshot_loader.png' });

  await browser.close();
  console.log('📸 Loader screenshot saved to scratch/screenshot_loader.png');
})();
