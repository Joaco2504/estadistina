const fs = require('fs');

async function fetchComponent(url) {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const text = await res.text();
  console.log(`Status: ${res.status}, Length: ${text.length}`);

  const match = text.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (match) {
    const data = JSON.parse(match[1]);
    return data;
  }
  return { html: text.slice(0, 1000) };
}

async function main() {
  const items = {
    toggle: 'https://uiverse.io/alexmaracinaru/brown-bobcat-65',
    loader: 'https://uiverse.io/Esca-Byte/hard-penguin-57',
    radio: 'https://uiverse.io/hoshikawamaki/terrible-eagle-23'
  };

  const results = {};
  for (const [key, url] of Object.entries(items)) {
    try {
      results[key] = await fetchComponent(url);
    } catch (e) {
      results[key] = { error: e.message };
    }
  }

  fs.writeFileSync('scratch/uiverse_data.json', JSON.stringify(results, null, 2));
  console.log('Saved to scratch/uiverse_data.json');
}

main();
