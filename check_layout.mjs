import { chromium } from 'playwright';

const URL = 'https://illusionfight.com/games/glitch-rafael';

async function test() {
  const browser = await chromium.launch({ headless: true });

  // Desktop view
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(URL, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));
  await desktop.screenshot({ path: 'glitch-desktop-select.png', fullPage: true });
  
  // Click easy
  const btns = await desktop.$$('button');
  for (const btn of btns) {
    const txt = await btn.textContent();
    if (/fácil|facil|easy/i.test(txt)) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 6000));
  await desktop.screenshot({ path: 'glitch-desktop-game.png', fullPage: true });
  
  const info = await desktop.evaluate(() => {
    const kg = document.querySelector('.kg-page');
    const gr = document.querySelector('.gr-screen');
    const wrap = document.querySelector('.gr-grid-wrap');
    const pre = document.querySelector('.gr-grid-pre');
    const hud = document.querySelector('.gr-hud');
    return {
      kg: kg ? { r: kg.getBoundingClientRect(), style: window.getComputedStyle(kg).cssText.slice(0, 200) } : null,
      gr: gr ? { r: gr.getBoundingClientRect(), pos: window.getComputedStyle(gr).position } : null,
      wrap: wrap ? { r: wrap.getBoundingClientRect(), overflow: window.getComputedStyle(wrap).overflow } : null,
      pre: pre ? { r: pre.getBoundingClientRect(), childCount: pre.children.length } : null,
      hud: hud ? { r: hud.getBoundingClientRect() } : null,
      vp: { w: window.innerWidth, h: window.innerHeight },
    };
  });
  console.log('=== DESKTOP ===');
  console.log(JSON.stringify(info, null, 2));

  // Mobile view
  const mobile = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await mobile.goto(URL, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));
  await mobile.screenshot({ path: 'glitch-mobile-select.png', fullPage: true });
  
  const mobInfo = await mobile.evaluate(() => {
    const kg = document.querySelector('.kg-page');
    return {
      kg: kg ? { r: kg.getBoundingClientRect() } : null,
      vp: { w: window.innerWidth, h: window.innerHeight },
    };
  });
  console.log('=== MOBILE ===');
  console.log(JSON.stringify(mobInfo, null, 2));

  await browser.close();
}

test().catch(console.error);
