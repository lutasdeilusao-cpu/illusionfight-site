import { chromium } from 'playwright';

const URL = 'https://illusionfight.com/games/glitch-rafael';

async function run() {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));

  const checks = await p.evaluate(() => {
    const issues = [];

    // 1. Container check
    const kg = document.querySelector('.kg-page');
    if (!kg) { issues.push('MISSING .kg-page'); }
    else {
      const s = window.getComputedStyle(kg);
      const data = {
        maxWidth: s.maxWidth,
        margin: s.margin,
        position: s.position,
        display: s.display,
      };
      if (data.maxWidth !== '480px') issues.push('kg-page maxWidth=' + data.maxWidth);
      if (data.position !== 'relative') issues.push('kg-page position=' + data.position);
    }

    // 2. Screen padding (select)
    const screen = document.querySelector('.gr-screen');
    if (screen) {
      const s = window.getComputedStyle(screen);
      const hasScreenPad = s.padding.includes('16px');
      if (!hasScreenPad) issues.push('gr-screen missing side padding=' + s.padding);
    }

    // 3. HUD padding
    const hud = document.querySelector('.gr-hud');
    if (hud) {
      const s = window.getComputedStyle(hud);
      if (s.padding !== '6px 12px' && !s.padding.includes('6px') && !s.padding.includes('12px')) {
        issues.push('gr-hud padding=' + s.padding);
      }
    }

    // 4. Subtitle margin
    const sub = document.querySelector('.gr-sel-sub');
    if (sub) {
      const mb = window.getComputedStyle(sub).marginBottom;
      if (mb !== '24px') issues.push('gr-sel-sub marginBottom=' + mb);
    }

    // 5. Button gap
    const btns = document.querySelector('.gr-btns');
    if (btns) {
      const gap = window.getComputedStyle(btns).gap;
      if (gap !== '6px') issues.push('gr-btns gap=' + gap);
    }

    // 6. Back button height
    document.querySelectorAll('.gr-hud-back, .gr-back-btn').forEach(el => {
      const mh = window.getComputedStyle(el).minHeight;
      if (parseInt(mh) < 44) issues.push('back btn ' + el.className + ' minHeight=' + mh);
    });

    // 7. Scanlines check
    const sl = document.querySelector('.kg-scanlines');
    if (!sl) issues.push('MISSING .kg-scanlines');
    else {
      const sp = window.getComputedStyle(sl).position;
      if (sp !== 'fixed') issues.push('scanlines position=' + sp);
    }

    // 8. Check for hardcoded inline styles
    const allEls = document.querySelectorAll('*');
    allEls.forEach(el => {
      const style = el.getAttribute('style');
      if (style && !style.trim().startsWith('--') && !style.trim().startsWith('--cd-col') && !style.trim().startsWith('--diff-col') && !style.trim().startsWith('--gr-fs') && !style.trim().startsWith('--gr-lh')) {
        if (style.includes('color') || style.includes('padding') || style.includes('margin') || style.includes('font') || style.includes('text-align') || style.includes('display') || style.includes('flex')) {
          issues.push('INLINE STYLE on ' + (el.className || el.tagName) + ': ' + style.slice(0, 60));
        }
      }
    });

    return issues;
  });

  console.log('=== Violações da Bíblia ===');
  if (checks.length === 0) {
    console.log('✅ Nenhuma violação encontrada');
  } else {
    checks.forEach(c => console.log('  ❌ ' + c));
  }

  // Also check page layout info
  const layout = await p.evaluate(() => {
    const kg = document.querySelector('.kg-page');
    const gr = document.querySelector('.gr-screen');
    return {
      kg: kg ? { width: kg.offsetWidth, height: kg.offsetHeight, left: kg.getBoundingClientRect().x } : null,
      gr: gr ? { width: gr.offsetWidth, height: gr.offsetHeight } : null,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  });
  console.log('\n=== Layout ===');
  console.log(JSON.stringify(layout, null, 2));

  await b.close();
}

run().catch(console.error);
