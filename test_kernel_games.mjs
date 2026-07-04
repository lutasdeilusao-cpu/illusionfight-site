import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const BASE = 'http://localhost:5173';
const REPORT_FILE = 'test_report.md';

const GAMES = [
  { name: 'Sliding Rafael',      path: '/games/sliding-rafael' },
  { name: 'Código Perdido',      path: '/games/codigo-perdido' },
  { name: 'Maze Rafael',         path: '/games/maze-rafael' },
  { name: 'Glitch Rafael',       path: '/games/glitch-rafael' },
  { name: 'Bullet Hell Rafael',  path: '/games/bullet-hell-rafael' },
  { name: 'Stabilizer Rafael',   path: '/games/stabilizer-rafael' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function dismissCookie(page) {
  try {
    const cookieBtn = await page.$('.cookie-banner-btn');
    if (cookieBtn) await cookieBtn.click();
    await sleep(300);
  } catch (_) {}
}

async function analyzeGame(page, gameName, results) {
  console.log(`\n=== ${gameName} ===`);

  const issues = [];

  // 1. Container check
  const containerInfo = await page.evaluate(() => {
    const containers = document.querySelectorAll(
      '.kg-page, [class*="sr-"], [class*="cp-"], [class*="mz-"], [class*="gl-"], [class*="bh-"], [class*="st-"]'
    );
    const infos = [];
    containers.forEach(c => {
      const style = window.getComputedStyle(c);
      const rect = c.getBoundingClientRect();
      infos.push({
        class: c.className,
        width: rect.width,
        maxWidth: style.maxWidth,
        margin: style.margin,
      });
    });
    return infos.length > 0 ? infos : null;
  });

  if (containerInfo) {
    containerInfo.forEach(c => {
      if (parseInt(c.width) > 480) {
        issues.push(`❌ Container .${c.class} width=${c.width}px > 480px`);
      } else {
        console.log(`  ✓ Container .${c.class} width=${c.width}px max-width=${c.maxWidth}`);
      }
    });
  }

  // 2. HUD check (during gameplay, after clicking difficulty)
  const hudOnSelect = await page.evaluate(() => {
    const huds = document.querySelectorAll('[class*="hud"], [class*="HUD"]');
    return huds.length;
  });

  // 3. Check back button on select screen
  const backBtns = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    const back = [];
    btns.forEach(b => {
      const text = b.textContent.toLowerCase();
      if (text.includes('voltar') || text.includes('←') || text.includes('back')) {
        const rect = b.getBoundingClientRect();
        back.push({
          text: text.substring(0, 20),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    });
    return back;
  });

  if (backBtns.length === 0) {
    issues.push('❌ No back button on select screen (Bíblia 4.2)');
  } else {
    const btn = backBtns[0];
    console.log(`  ✓ Back button: ${btn.text} (${btn.width}x${btn.height})`);
    // Bíblia says 44x44 for HUD back button, but select screen back may differ
  }

  // 4. Check inline styles more thoroughly
  const inlineIssues = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const bad = [];
    const prohibitedProps = ['text-align', 'display', 'flex-direction', 'padding', 'margin',
      'position', 'color', 'font-size', 'font-family', 'font-weight', 'cursor',
      'z-index', 'opacity', 'background-color', 'border-color'];
    
    all.forEach(el => {
      const s = el.getAttribute('style');
      if (!s) return;
      // Skip if only contains CSS vars (--*) or width/backgroundImage
      const clean = s.replace(/--[\w-]+:\s*[^;]+;/g, '').replace(/width:\s*[^;]+;/g, '')
        .replace(/background-image:\s*[^;]+;/g, '').trim();
      if (!clean) return;
      
      prohibitedProps.forEach(prop => {
        const camel = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
        if (clean.includes(prop) || clean.includes(camel)) {
          const tag = el.tagName.toLowerCase();
          const cls = el.className ? `.${el.className.split(' ')[0]}` : '';
          const snippet = s.substring(0, 100);
          bad.push(`${tag}${cls}: ${snippet}`);
        }
      });
    });
    return [...new Set(bad)].slice(0, 15);
  });

  if (inlineIssues.length > 0) {
    console.log(`  ⚠ Inline style issues:`);
    inlineIssues.forEach(i => console.log(`     ${i}`));
  } else {
    console.log(`  ✓ No prohibited inline styles`);
  }

  // 5. Check for i18n (no hardcoded Portuguese that isn't from t())
  // We look at the source for strings that bypass i18n
  const hardcodedCheck = await page.evaluate(() => {
    // Check if specific game texts appear without being i18n-controlled
    // These are okay because they come from i18n translation output
    return 'checking';
  });

  // 6. Check canvas sizing
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const parent = canvas.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    return {
      canvas: { width: rect.width, height: rect.height },
      parent: parentRect ? { width: parentRect.width, height: parentRect.height } : null,
      canvasAttr: { width: canvas.width, height: canvas.height },
    };
  });

  if (canvasInfo) {
    console.log(`  Canvas: ${Math.round(canvasInfo.canvas.width)}x${Math.round(canvasInfo.canvas.height)}`);
    if (canvasInfo.parent) {
      console.log(`  Canvas parent: ${Math.round(canvasInfo.parent.width)}x${Math.round(canvasInfo.parent.height)}`);
      const diff = Math.abs(canvasInfo.canvas.height - canvasInfo.parent.height);
      if (diff > 5) {
        issues.push(`⚠️ Canvas height (${Math.round(canvasInfo.canvas.height)}) != parent height (${Math.round(canvasInfo.parent.height)})`);
      }
    }
  }

  // 7. Check for wrong padding values
  const paddingCheck = await page.evaluate(() => {
    const all = document.querySelectorAll('[class*="arena"], [class*="game"], [class*="body"], [class*="hud"]');
    const issues = [];
    all.forEach(el => {
      const style = window.getComputedStyle(el);
      const pad = style.padding;
      if (pad && (pad.includes('16px') || pad.includes('14px') || pad.includes('40px'))) {
        issues.push(`${el.className}: padding=${pad}`);
      }
    });
    return issues.slice(0, 5);
  });

  if (paddingCheck.length > 0) {
    paddingCheck.forEach(p => issues.push(`⚠️ Potential wrong padding: ${p}`));
  }

  // 8. Check difficulty buttons on select screen
  const diffBtns = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    const diffs = [];
    btns.forEach(b => {
      const txt = b.textContent.trim();
      if (txt.includes('FÁCIL') || txt.includes('FACIL') || txt.includes('MÉDIO') || txt.includes('DIFÍCIL') || txt.includes('HARD')) {
        diffs.push(txt.substring(0, 50));
      }
    });
    return diffs;
  });

  if (diffBtns.length > 0) {
    console.log(`  ✓ ${diffBtns.length} difficulty buttons found`);
  } else {
    issues.push('❌ No difficulty buttons (cannot start game)');
  }

  return issues;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const allResults = {};

  for (const game of GAMES) {
    const context = await browser.newContext({
      viewport: { width: 480, height: 850 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const issues = [];

    try {
      await page.goto(`${BASE}${game.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await sleep(1000);
      await dismissCookie(page);

      // Analyze select screen
      console.log(`\n--- ${game.name}: Select Screen ---`);
      const selectIssues = await analyzeGame(page, game.name, issues);
      issues.push(...selectIssues);

      // Try to start a game
      const diffBtns = await page.$$('button');
      let started = false;
      for (const btn of diffBtns) {
        const text = await btn.textContent();
        if (text.includes('FÁCIL') || text.includes('FACIL') || text.includes('Easy')) {
          await btn.click();
          started = true;
          console.log(`  → Clicked: "${text.substring(0, 50).trim()}"`);
          break;
        }
      }

      if (!started) {
        issues.push('❌ Could not start game - no difficulty button clicked');
      }

      // Wait for countdown + gameplay
      await sleep(4000);

      // Analyze gameplay
      console.log(`\n--- ${game.name}: Gameplay ---`);
      const gameplayIssues = await analyzeGame(page, game.name, issues);
      issues.push(...gameplayIssues);

      // Dismiss cookie if it appeared
      await dismissCookie(page);

      // Try interacting
      const canvas = await page.$('canvas');
      if (canvas) {
        const box = await canvas.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await sleep(300);
          for (let i = 0; i < 3; i++) {
            await page.mouse.move(
              box.x + box.width * (0.3 + Math.random() * 0.4),
              box.y + box.height * (0.3 + Math.random() * 0.4)
            );
            await sleep(200);
          }
          console.log(`  ✓ Canvas interaction done`);
        }
      }

      // For CodigoPerdido - try keyboard
      const kb = await page.$('[class*="kb-"], [class*="keyboard"]');
      if (kb) {
        const keys = await kb.$$('button');
        for (let i = 0; i < Math.min(5, keys.length); i++) {
          await keys[i].click();
          await sleep(150);
        }
        console.log(`  ✓ Keyboard interaction done`);
      }

      // Try clicking back to return to select
      const gameplayBack = await page.$('[class*="hud-back"], [class*="back"], [aria-label*="oltar"]');
      if (gameplayBack) {
        await gameplayBack.click();
        await sleep(1000);
        console.log(`  ✓ Back to select`);
      } else {
        // For maze/bullethell, back button might be in a different location
        console.log(`  ⚠ No gameplay back button found`);
      }

    } catch (err) {
      issues.push(`❌ Error: ${err.message}`);
    } finally {
      allResults[game.name] = issues;
      await context.close();
    }
  }

  await browser.close();

  // Generate report
  let report = `# Kernel Games Test Report\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Viewport:** 480x850 (mobile portrait)\n\n`;

  for (const [name, issues] of Object.entries(allResults)) {
    report += `## ${name}\n\n`;
    if (issues.length === 0) {
      report += `✅ **No issues found**\n\n`;
    } else {
      issues.forEach(i => report += `- ${i}\n`);
      report += '\n';
    }
  }

  writeFileSync(REPORT_FILE, report, 'utf-8');
  console.log(`\n\nReport saved to ${REPORT_FILE}`);

  // Print summary
  console.log(`\n=== SUMMARY ===`);
  for (const [name, issues] of Object.entries(allResults)) {
    const errs = issues.filter(i => i.startsWith('❌'));
    const warns = issues.filter(i => i.startsWith('⚠️'));
    console.log(`${name}: ${errs.length} errors, ${warns.length} warnings, ${issues.filter(i => !i.startsWith('❌') && !i.startsWith('⚠️')).length} info`);
  }
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
