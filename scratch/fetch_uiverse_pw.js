const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1920,1080'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const urls = [
    { name: 'toggle', url: 'https://uiverse.io/alexmaracinaru/brown-bobcat-65' },
    { name: 'loader', url: 'https://uiverse.io/Esca-Byte/hard-penguin-57' },
    { name: 'radio', url: 'https://uiverse.io/hoshikawamaki/terrible-eagle-23' }
  ];

  const results = {};

  for (const item of urls) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 35000 });
      await page.waitForTimeout(4000);

      // Check title and extract code
      const title = await page.title();
      console.log(`Title for ${item.name}: ${title}`);

      // Extract details
      const data = await page.evaluate(() => {
        const nextDataEl = document.getElementById('__NEXT_DATA__');
        let nextData = null;
        if (nextDataEl) {
          try {
            nextData = JSON.parse(nextDataEl.innerText);
          } catch (e) {}
        }
        
        // Find html & css text
        const codeElements = Array.from(document.querySelectorAll('pre, code, textarea')).map(c => c.textContent);
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText);

        return {
          title: document.title,
          nextDataPost: nextData?.props?.pageProps?.post || nextData?.props?.pageProps?.item || nextData?.props?.pageProps,
          codeElements,
          buttons,
          bodySnippet: document.body.innerText.slice(0, 1000)
        };
      });

      results[item.name] = data;
    } catch (e) {
      console.error(`Error for ${item.name}:`, e.message);
      results[item.name] = { error: e.message };
    }
  }

  await browser.close();
  fs.writeFileSync('scratch/uiverse_extracted.json', JSON.stringify(results, null, 2));
  console.log('Saved to scratch/uiverse_extracted.json');
})();
