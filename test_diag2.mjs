import { chromium } from 'playwright';

const URL = 'https://lutasdeilusao-cpu.github.io/illusionfight-site/games/glitch-rafael';

async function run() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 480, height: 900 } });

  p.on('console', msg => {
    if (msg.text().includes('[GLITCH]') || msg.type() === 'error') {
      console.log('[' + msg.type() + ']', msg.text().slice(0, 200));
    }
  });

  await p.goto(URL + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  console.log('Page loaded');
  await new Promise(r => setTimeout(r, 3000));

  const screen1 = await p.evaluate(() => {
    const sel = document.querySelector('.gr-screen');
    return sel ? sel.className : 'no-gr-screen';
  });
  console.log('Initial screen:', screen1);

  // Click first button
  await p.evaluate(() => {
    const btn = document.querySelector('button');
    if (btn) { btn.click(); return 'clicked'; }
    return 'no button';
  }).then(r => console.log('Button click:', r));

  await new Promise(r => setTimeout(r, 7000));

  const screen2 = await p.evaluate(() => {
    const screens = document.querySelectorAll('.gr-screen');
    return Array.from(screens).map(s => s.className).join(' | ');
  });
  console.log('Screens after 7s:', screen2);

  const hud = await p.evaluate(() => {
    const el = document.querySelector('.gr-hud-found');
    return el ? el.textContent : 'no-hud';
  });
  console.log('HUD:', hud);

  // Try clicking glitch
  const glitchInfo = await p.evaluate(() => {
    const glitchSpans = document.querySelectorAll('span[data-g="1"]');
    console.log('Found ' + glitchSpans.length + ' glitch spans');
    if (glitchSpans.length > 0) {
      const first = glitchSpans[0];
      first.click();
      setTimeout(() => {
        console.log('After click: found=' + document.querySelector('.gr-hud-found')?.textContent + ' hit=' + document.querySelectorAll('.gr-hit').length);
      }, 500);
      return { clicked: first.textContent, className: first.className };
    }
    // Maybe it's the old version - check all spans for glitch class
    const glClassSpans = document.querySelectorAll('.gr-gl');
    return { no_data_g: true, glClassCount: glClassSpans.length, sample: glClassSpans[0]?.outerHTML?.slice(0, 100) };
  });
  console.log('Glitch info:', JSON.stringify(glitchInfo));

  await new Promise(r => setTimeout(r, 2000));

  const afterClick = await p.evaluate(() => {
    return {
      counter: document.querySelector('.gr-hud-found')?.textContent || '?',
      hitSpans: document.querySelectorAll('.gr-hit').length,
      resultScreen: document.querySelector('.kg-result') ? 'yes' : 'no',
    };
  });
  console.log('After click:', JSON.stringify(afterClick));

  await b.close();
}

run().catch(console.error);
