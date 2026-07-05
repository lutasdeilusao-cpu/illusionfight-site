import { chromium } from 'playwright';

const URL = 'https://illusionfight.com/games/glitch-rafael';

async function run() {
  const b = await chromium.launch({ headless: true });

  // Test on desktop
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 4000));
  
  // Take screenshots at every state
  await p.screenshot({ path: 'glitch-01-select.png', fullPage: true });

  // Click easy
  for (const btn of await p.$$('button')) {
    const t = await btn.textContent();
    if (/fácil|easy/i.test(t)) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 5500));
  await p.screenshot({ path: 'glitch-02-game.png', fullPage: true });

  // Check what's actually visible in the grid pre
  const gridInfo = await p.evaluate(() => {
    const pre = document.querySelector('.gr-grid-pre');
    if (!pre) return { error: 'no pre' };
    const spans = pre.querySelectorAll('span');
    const total = spans.length;
    const visibleGlitches = [...spans].filter(s => s.className.includes('gl')).length;
    const firstChars = [...spans].slice(0, 20).map(s => s.textContent + ':' + s.className).join(', ');
    const preRect = pre.getBoundingClientRect();
    const wrapRect = pre.parentElement?.getBoundingClientRect();
    return {
      spanCount: total,
      glitchSpans: visibleGlitches,
      first20: firstChars,
      preW: preRect.width,
      preH: preRect.height,
      wrapW: wrapRect?.width,
      wrapH: wrapRect?.height,
    };
  });
  console.log('Grid info:', JSON.stringify(gridInfo, null, 2));

  // Check computed styles for key elements
  const styles = await p.evaluate(() => {
    const kg = document.querySelector('.kg-page');
    const gr = document.querySelector('.gr-game');
    const wrap = document.querySelector('.gr-grid-wrap');
    const pre = document.querySelector('.gr-grid-pre');
    const get = (el, props) => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const r = {};
      props.forEach(p => r[p] = s[p]);
      return r;
    };
    return {
      kg: get(kg, ['maxWidth', 'width', 'margin', 'position', 'overflow']),
      gr: get(gr, ['position', 'width', 'inset', 'overflow', 'padding']),
      wrap: get(wrap, ['flex', 'width', 'overflow', 'position']),
      pre: get(pre, ['position', 'width', 'inset', 'overflow', 'padding', 'fontSize', 'lineHeight']),
    };
  });
  console.log('Styles:', JSON.stringify(styles, null, 2));

  // Check if there's any element wider than viewport
  const overflowElements = await p.evaluate(() => {
    const all = document.querySelectorAll('*');
    const issues = [];
    const vw = window.innerWidth;
    all.forEach(el => {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      if (r.width > vw + 2) {
        issues.push({
          tag: el.tagName,
          cls: el.className.slice(0, 40),
          w: r.width,
          vw,
          overflow: s.overflow,
          overflowX: s.overflowX,
        });
      }
    });
    return issues.slice(0, 10);
  });
  console.log('Overflow elements:', JSON.stringify(overflowElements, null, 2));

  await b.close();
}

run().catch(console.error);
