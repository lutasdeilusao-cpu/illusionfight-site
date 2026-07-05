import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const REPORT_FILE = 'test_crash_report.md';

const GAMES = [
  { name: 'Sliding Rafael',      path: '/games/sliding-rafael',     canvas: false },
  { name: 'Código Perdido',      path: '/games/codigo-perdido',     canvas: false },
  { name: 'Maze Rafael',         path: '/games/maze-rafael',        canvas: true  },
  { name: 'Glitch Rafael',       path: '/games/glitch-rafael',      canvas: false },
  { name: 'Bullet Hell Rafael',  path: '/games/bullet-hell-rafael', canvas: true  },
  { name: 'Stabilizer Rafael',   path: '/games/stabilizer-rafael',  canvas: false },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let started = false;
    proc.stdout.on('data', d => {
      const txt = d.toString();
      if (!started && txt.includes('http://127.0.0.1')) {
        started = true;
        resolve(proc);
      }
    });
    proc.stderr.on('data', d => {
      const txt = d.toString();
      if (!started && txt.includes('http://127.0.0.1')) {
        started = true;
        resolve(proc);
      }
    });
    proc.on('error', reject);
    setTimeout(() => {
      if (!started) resolve(proc); // hope it started anyway
    }, 10000);
  });
}

async function dismissCookie(page) {
  try {
    const cookieBtn = await page.$('.cookie-banner-btn');
    if (cookieBtn) await cookieBtn.click();
    await sleep(300);
  } catch (_) {}
}

async function testGame(page, game) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(BASE + game.path, { waitUntil: 'networkidle', timeout: 15000 });
  await dismissCookie(page);
  await sleep(500);

  // Click first difficulty button
  const diffBtns = await page.$$('button');
  let clicked = false;
  for (const btn of diffBtns) {
    const txt = await btn.textContent();
    if (/fácil|easy|facil/i.test(txt) && !/voltar|back/i.test(txt)) {
      await btn.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    // try clicking any button that isn't "voltar"
    for (const btn of diffBtns) {
      const txt = await btn.textContent();
      if (!/voltar|back|←/i.test(txt)) {
        await btn.click();
        clicked = true;
        break;
      }
    }
  }

  // Wait for countdown (3 ticks + GO)
  await sleep(5500);

  // If canvas, click center
  if (game.canvas) {
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await sleep(800);
      }
    }
  }

  await sleep(1000);
  return errors;
}

async function run() {
  console.log('Starting preview server...');
  const server = await startServer();
  console.log('Server ready.');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const game of GAMES) {
    console.log(`\n=== ${game.name} ===`);
    const ctx = await browser.newContext({
      viewport: { width: 480, height: 800 },
      locale: 'pt-BR',
    });
    const page = await ctx.newPage();

    try {
      const errors = await testGame(page, game);
      const hasErrors = errors.length > 0;
      if (hasErrors) {
        console.log(`  ❌ ERROS:`);
        errors.forEach(e => console.log(`    ${e}`));
      } else {
        console.log(`  ✅ OK`);
      }
      results.push({
        game: game.name,
        status: hasErrors ? '❌ CRASH' : '✅ OK',
        detail: hasErrors ? errors.join(' | ') : 'Sem erros',
      });
    } catch (e) {
      console.log(`  ❌ EXCEÇÃO: ${e.message}`);
      results.push({ game: game.name, status: '❌ EXCEÇÃO', detail: e.message });
    }

    await ctx.close();
  }

  // Report
  let md = '# Teste de Crash — Kernel Games\n\n';
  md += `Data: ${new Date().toISOString()}\n\n`;
  md += `| Jogo | Status | Detalhe |\n|---|---|---|\n`;
  for (const r of results) {
    md += `| ${r.game} | ${r.status} | ${r.detail} |\n`;
  }
  writeFileSync(REPORT_FILE, md, 'utf-8');
  console.log(`\nRelatório: ${REPORT_FILE}`);

  await browser.close();
  server.kill();
}

run().catch(e => { console.error(e); process.exit(1); });
