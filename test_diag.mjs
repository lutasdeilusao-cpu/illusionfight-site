import { chromium } from 'playwright';

const URL = 'https://lutasdeilusao-cpu.github.io/illusionfight-site/games/glitch-rafael';

async function run() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 480, height: 900 } });
  const logs = [];
  p.on('console', msg => {
    if (msg.text().includes('[GLITCH]')) logs.push(msg.text());
  });

  await p.goto(URL + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 5000));

  const bundle = await p.evaluate(() => {
    const s = document.querySelector('script[src*=index]');
    return s ? s.src.split('/').pop() : '?';
  });
  console.log('Bundle:', bundle);

  // Click easy button
  await p.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.toLowerCase().includes('facil')) { b.click(); break; }
    }
  });
  await p.waitForSelector('.gr-game', { timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // Try clicking glitch span
  const clickResult = await p.evaluate(() => {
    const glitchSpans = document.querySelectorAll('span[data-g="1"]');
    console.log('[TEST] glitch spans found: ' + glitchSpans.length);
    if (glitchSpans.length > 0) {
      glitchSpans[0].click();
      console.log('[TEST] clicked glitch');
      return 'clicked ' + glitchSpans[0].textContent;
    }
    return 'no spans';
  });
  console.log('Click:', clickResult);

  await new Promise(r => setTimeout(r, 2000));

  console.log('=== GLITCH LOGS ===');
  logs.forEach(l => console.log(l));
  console.log('=== END ===');

  const hud = await p.evaluate(() => {
    const el = document.querySelector('.gr-hud-found');
    const spans = document.querySelectorAll('.gr-hit');
    return {
      counter: el ? el.textContent : '?',
      hitCount: spans.length,
      phase: document.querySelector('.gr-game') ? 'game' : document.querySelector('.gr-result') ? 'result' : 'other',
    };
  });
  console.log('State:', JSON.stringify(hud));

  await b.close();
}

run().catch(console.error);
