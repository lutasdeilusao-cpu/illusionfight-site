import { chromium } from 'playwright';

async function run() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 480, height: 900 } });
  
  await p.goto('https://illusionfight.com/games/glitch-rafael', { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));
  
  // Click easy via evaluate (avoid selectors with special chars)
  await p.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const txt = btn.textContent.toLowerCase();
      if (txt.includes('fácil') || txt.includes('facil') || txt.includes('easy')) {
        btn.click();
        break;
      }
    }
  });
  
  // Wait for game state
  await p.waitForSelector('.gr-game', { timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  
  const info = await p.evaluate(() => {
    const pre = document.querySelector('.gr-grid-pre');
    if (!pre) return 'NO PRE FOUND';
    const text = pre.textContent;
    const lines = text.split('\n');
    const spans = pre.querySelectorAll('span');
    const firstLine = lines[0] || '';
    return {
      totalLines: lines.length,
      firstLineLength: firstLine.length,
      firstLineSample: firstLine.slice(0, 30),
      totalSpans: spans.length,
      lastLineLength: (lines[lines.length - 1] || '').length,
      preWidth: pre.getBoundingClientRect().width,
      preScrollWidth: pre.scrollWidth,
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  await b.close();
}

run().catch(e => console.error(e.message));
