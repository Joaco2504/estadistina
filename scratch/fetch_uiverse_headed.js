const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let executablePath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  // Launch headed browser
  const browser = await chromium.launch({
    headless: false,
    executablePath,
    args: ['--start-minimized']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const urls = [
    { name: 'toggle', url: 'https://uiverse.io/alexmaracinaru/brown-bobcat-65' },
    { name: 'loader', url: 'https://uiverse.io/Esca-Byte/hard-penguin-57' },
    { name: 'radio', url: 'https://uiverse.io/hoshikawamaki/terrible-eagle-23' }
  ];

  const results = {};

  for (const item of urls) {
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(4000);

      const pageData = await page.evaluate(() => {
        // UIverse often has copy buttons or Monaco editor / Prism / textarea
        // Let's grab all text, styles, code blocks, or NextData
        const nextData = document.getElementById('__NEXT_DATA__')?.innerText;
        let parsedNext = null;
        if (nextData) {
          try { parsedNext = JSON.parse(nextData); } catch (e) {}
        }

        // Also let's inspect the preview iframe or rendered element inside #preview or similar
        const previewHtml = document.querySelector('#preview-element, .preview, [data-preview]')?.outerHTML;
        
        return {
          title: document.title,
          nextData: parsedNext,
          previewHtml,
          allCode: Array.from(document.querySelectorAll('pre, code, textarea')).map(el => el.textContent),
          bodyText: document.body.innerText
        };
      });

      results[item.name] = pageData;
      console.log(`Success for ${item.name}: title = ${pageData.title}`);
    } catch (e) {
      console.error(`Error for ${item.name}:`, e.message);
      results[item.name] = { error: e.message };
    }
  }

  await browser.close();
  fs.writeFileSync('scratch/uiverse_data_headed.json', JSON.stringify(results, null, 2));
  console.log('Saved to scratch/uiverse_data_headed.json');
})();
