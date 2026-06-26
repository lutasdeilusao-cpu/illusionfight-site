/**
 * Script para extrair e-mails da página "Sobre" de canais do YouTube
 * e atualizar o CSV pr_outreach_illusion_fight.csv
 *
 * Uso: node scripts/extract-emails.mjs
 *
 * IMPORTANTE: O navegador abre em modo visível (headed).
 * Quando o YouTube pedir reCAPTCHA para mostrar o e-mail,
 * resolva o captcha manualmente e o script prossegue automaticamente.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, '..', 'docs', 'Marketing', 'pr_outreach_illusion_fight.csv');
const RESULTS_PATH = path.resolve(__dirname, '..', 'temp', 'extracted-emails.json');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return { headers, rows };
}

function csvEncode(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCSV(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row => headers.map(h => csvEncode(row[h] || '')).join(','));
  return [headerLine, ...dataLines].join('\n') + '\n';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractEmailFromPage(page, handle, nome) {
  const url = `https://www.youtube.com/@${handle}/about`;
  console.log(`\n━━━ [PROCESSANDO] ${nome} (@${handle}) ━━━`);
  console.log(`URL: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await sleep(3000);

    // Scroll to reveal "more" buttons
    await page.evaluate(() => window.scrollTo(0, 300));
    await sleep(1000);

    // Click all "...mais" / "…more" buttons to expand description
    const maisButtons = page.locator('button:has-text("…mais"), button:has-text("…more"), button:has-text("Mostrar mais"), button:has-text("Show more")');
    const maisCount = await maisButtons.count();
    for (let i = 0; i < maisCount; i++) {
      try {
        await maisButtons.nth(0).click();
        await sleep(500);
      } catch (e) {}
    }
    await sleep(1000);

    // Look for "Ver endereço de e-mail" button
    const emailBtn = page.locator('button:has-text("Ver endereço de e-mail"), button:has-text("View email address"), button:has-text("Ver e-mail")').first();
    const hasEmailBtn = await emailBtn.isVisible().catch(() => false);

    if (!hasEmailBtn) {
      // Also check by scanning all buttons
      const allBtns = await page.locator('button').all();
      for (const btn of allBtns) {
        const text = await btn.textContent().catch(() => '');
        if (/e-?mail|endereço.*e|e.*mail/i.test(text) && !/compartilhar|share|inscrever|subscribe/i.test(text)) {
          console.log(`  Botão encontrado: "${text.trim()}"`);
          await btn.click();
          await sleep(2000);
          return await captureEmailFromDialog(page, nome);
        }
      }
      console.log('  Nenhum botão de e-mail encontrado.');
      return 'não encontrado';
    }

    console.log('  Botão "Ver endereço de e-mail" encontrado!');

    // Try clicking with Playwright first
    try {
      await emailBtn.click({ timeout: 5000 });
      await sleep(2000);
    } catch (e) {
      // Use evaluate as fallback
      await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent.includes('Ver endereço') || btn.textContent.includes('View email')) {
            btn.click();
            break;
          }
        }
      });
      await sleep(2000);
    }

    return await captureEmailFromDialog(page, nome);

  } catch (err) {
    console.error(`  ERRO: ${err.message}`);
    return 'não encontrado';
  }
}

async function captureEmailFromDialog(page, nome) {
  await sleep(1500);

  // Check for reCAPTCHA
  const hasRecaptcha = await page.locator('iframe[src*="recaptcha"], iframe[title*="recaptcha"]').count();

  if (hasRecaptcha > 0) {
    console.log(`  ⚠️  reCAPTCHA detectado! Resolva o captcha manualmente no navegador.`);
    console.log(`  Após resolver, o script capturará o e-mail automaticamente.`);

    // Wait a bit and check if email appeared
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(2000);

      // Check if dialog still open and if email appeared
      const dialogText = await page.evaluate(() => {
        const dialogs = document.querySelectorAll('dialog[open], [role="dialog"]');
        for (const d of dialogs) return d.textContent;
        // Also check the whole page
        return document.body.innerText;
      });

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = dialogText.match(emailRegex);
      if (emails) {
        const valid = emails.filter(e =>
          !e.includes('google.com') && !e.includes('youtube.com') &&
          !e.includes('recaptcha') && !e.includes('noreply') &&
          !e.includes('accounts.youtube.com')
        );
        if (valid.length > 0) {
          // Close dialog if any
          await page.evaluate(() => {
            document.querySelectorAll('button[aria-label="Fechar"], button[aria-label="Close"]').forEach(b => b.click());
          });
          console.log(`  ✅ E-mail capturado: ${valid[0]}`);
          return valid[0];
        }
      }

      // Check recaptcha state
      const recaptchaStill = await page.locator('iframe[src*="recaptcha"]').count();
      if (recaptchaStill === 0) {
        // Captcha might have been solved and dialog changed
        continue;
      }
    }

    console.log(`  ⏰ Tempo esgotado esperando captcha.`);
    return 'não encontrado';
  }

  // No captcha - check if email appeared directly
  await sleep(2000);

  const pageText = await page.evaluate(() => document.body.innerText);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = pageText.match(emailRegex);

  if (emails) {
    const valid = emails.filter(e =>
      !e.includes('google.com') && !e.includes('youtube.com') &&
      !e.includes('recaptcha') && !e.includes('noreply')
    );
    if (valid.length > 0) {
      console.log(`  ✅ E-mail encontrado: ${valid[0]}`);
      return valid[0];
    }
  }

  console.log(`  Nenhum e-mail encontrado no diálogo.`);
  return 'não encontrado';
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   EXTRATOR DE E-MAILS DO YOUTUBE ABOUT PAGE            ║');
  console.log('║   95 canais para processar                             ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Read CSV
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const { headers, rows } = parseCSV(csvText);
  console.log(`CSV lido: ${rows.length} registros`);

  // Find targets
  const targetIndices = [];
  rows.forEach((r, idx) => {
    if (r.Contato && r.Contato.trim() === 'YouTube About page') {
      targetIndices.push(idx);
    }
  });
  console.log(`Alvos no CSV: ${targetIndices.length}\n`);

  // Launch headed browser
  console.log('▶  Abrindo navegador...');
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ],
  });
  const context = await browser.newContext({
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });
  const page = await context.newPage();

  // Go to YouTube first and check login
  console.log('\n▶  Navegando para YouTube...');
  await page.goto('https://www.youtube.com', { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);

  const isLoggedIn = await page.evaluate(() => {
    const avatar = document.querySelector('#avatar-btn, button[aria-label*="Conta"], button[aria-label*="Account"], img[alt*="avatar"]');
    return !!avatar;
  });

  if (!isLoggedIn) {
    console.log('\n⚠️  NÃO está logado no YouTube!');
    console.log('Faça login na janela do navegador que abriu.');
    console.log('Pressione ENTER após fazer login...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  } else {
    console.log('✅ Já está logado no YouTube!\n');
  }

  // Try to load any saved progress
  let results = [];
  let startIndex = 0;

  try {
    if (fs.existsSync(RESULTS_PATH)) {
      results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
      startIndex = results.length;
      console.log(`📂 Progresso carregado: ${startIndex} canais já processados.\n`);
    }
  } catch (e) {}

  // Process targets
  for (let i = startIndex; i < targetIndices.length; i++) {
    const rowIdx = targetIndices[i];
    const row = rows[rowIdx];
    const handle = row.Handle.replace(/^@+/, '').trim();

    if (!handle) {
      console.log(`\n[${i+1}/${targetIndices.length}] ${row.Nome} — Handle vazio, pulando.`);
      results.push({ nome: row.Nome, handle: '', email: 'não encontrado' });
      continue;
    }

    console.log(`\n[${i+1}/${targetIndices.length}]`);
    const email = await extractEmailFromPage(page, handle, row.Nome);

    results.push({ nome: row.Nome, handle, email });

    // Save progress after each channel
    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`  💾 Progresso salvo (${results.length}/${targetIndices.length})`);
  }

  await browser.close();

  // ---- UPDATE CSV ----
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   ATUALIZANDO CSV...                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Build a map of handle -> email from results
  const emailMap = {};
  for (const r of results) {
    if (r.handle) {
      emailMap[r.handle.replace(/^@+/, '').toLowerCase()] = r.email;
    }
  }

  const found = [];
  const notFound = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.Contato && row.Contato.trim() === 'YouTube About page') {
      const handle = row.Handle.replace(/^@+/, '').toLowerCase().trim();
      const email = emailMap[handle] || 'não encontrado';
      row.Contato = email;
      if (email !== 'não encontrado') {
        found.push({ nome: row.Nome, email });
      } else {
        notFound.push(row.Nome);
      }
    }
  }

  // Write updated CSV
  const updatedCSV = toCSV(headers, rows);
  fs.writeFileSync(CSV_PATH, updatedCSV, 'utf-8');
  console.log(`✅ CSV atualizado: ${CSV_PATH}`);

  // ---- FINAL REPORT ----
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   RELATÓRIO FINAL                                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`Total de canais processados: ${results.length}`);
  console.log(`E-mails encontrados: ${found.length}`);
  console.log(`Não encontrados: ${notFound.length}\n`);

  if (found.length > 0) {
    console.log('─── E-MAILS ENCONTRADOS ───');
    found.forEach(r => console.log(`  ✅ ${r.nome}: ${r.email}`));
    console.log();
  }

  if (notFound.length > 0) {
    console.log('─── NÃO ENCONTRADOS ───');
    notFound.forEach(n => console.log(`  ❌ ${n}`));
    console.log();
  }

  const finalLines = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n').length;
  console.log(`Linhas no CSV final: ${finalLines}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
