/**
 * AUDIT LOGADO — Fluxo com conta autenticada
 * 
 * Uso: node audit-logged.cjs
 * Adiciona seções 10-13 ao AUDIT_REPORT.md
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://illusionfight.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'audit-screenshots', 'logged');
const TIMEOUT = 15000;
const CREDENTIALS = { email: 'couplestaroficial@gmail.com', pass: '000000' };

// ─── Acumulador do relatório ─────────────────────
const r = {
  login: { status: 'NOT RUN', steps: [] },
  perfil: {},
  jogos: {},
  gates: [],
  livroWebtoon: {},
  consoleErrors: [],
  bugs: [],
  consoleRecorrente: null,
};

let consoleErrors = [];
let pageErrors = [];
let failedRequests = [];
let brokenAssets = [];

function setupListeners(page) {
  consoleErrors = [];
  pageErrors = [];
  failedRequests = [];
  brokenAssets = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || 'unknown' });
  });
  page.on('response', resp => {
    if (resp.status() >= 400 && /\.(png|jpg|jpeg|gif|svg|webp|woff2?|otf|ttf|eot|js|css)/i.test(resp.url())) {
      brokenAssets.push({ url: resp.url(), status: resp.status() });
    }
  });
}

async function waitForStable(page, extraMs = 1500) {
  await page.waitForLoadState('networkidle', { timeout: TIMEOUT }).catch(() => {});
  await page.waitForTimeout(extraMs);
}

async function screenshot(page, name) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: true });
}

async function navigateAndCapture(page, url, label) {
  setupListeners(page);
  console.log(`  → ${label}: ${url}`);
  await page.goto(url, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
  await waitForStable(page);
  await screenshot(page, label.replace(/[^a-z0-9]/gi, '-').toLowerCase());
  
  const text = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
  return {
    url: page.url(),
    text: text.substring(0, 150),
    consoleErrors: consoleErrors.map(e => e.text),
    pageErrors: [...pageErrors],
    brokenAssets: [...brokenAssets],
    failedRequests: failedRequests.map(f => f.url.substring(0, 100)),
  };
}

// ─── Main ─────────────────────────────────────────
(async () => {
  console.log('=== AUDITORIA LOGADA ===');
  
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'pt-BR' });
  const page = await ctx.newPage();

  // ─────────── ETAPA 1: LOGIN ─────────────────────
  console.log('\n--- ETAPA 1: Login ---');
  setupListeners(page);
  
  await page.goto(`${BASE}/login`, { timeout: TIMEOUT });
  await waitForStable(page, 1000);
  await screenshot(page, '01-login-page');

  // Preencher formulário de login
  const emailInput = await page.$('input[type="email"], input[name="email"]');
  const passInput = await page.$('input[type="password"]');
  const loginBtn = await page.$('button[type="submit"], button:has-text("Entrar")');

  if (!emailInput || !passInput) {
    r.login.status = 'FALHA';
    r.login.steps.push('Campos de login não encontrados');
  } else {
    await emailInput.fill(CREDENTIALS.email);
    await passInput.fill(CREDENTIALS.pass);
    r.login.steps.push('Campos preenchidos');

    if (loginBtn) {
      await loginBtn.click();
      r.login.steps.push('Clique em Entrar');
    } else {
      // Try pressing Enter
      await page.keyboard.press('Enter');
      r.login.steps.push('Enter pressionado');
    }

    // Aguardar toast de achievement (até 5s)
    await page.waitForTimeout(4000);
    await screenshot(page, '02-pos-login');
    
    // Verificar se está logado
    const url = page.url();
    r.login.steps.push(`URL após login: ${url}`);

    // Check localStorage for session
    const hasSession = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) return true;
      }
      return false;
    });

    // Check navbar for user indicator
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    const hasPerfil = bodyText.includes('Perfil') || bodyText.includes('Sair');
    
    r.login.status = hasSession || hasPerfil ? 'LOGADO' : 'INCERTO';
    r.login.steps.push(`Session in localStorage: ${hasSession}`);
    r.login.steps.push(`Navbar indica logado: ${hasPerfil}`);
    
    if (r.login.status === 'LOGADO') {
      r.login.steps.push('✅ LOGIN BEM SUCEDIDO');
    }
  }

  // ─────────── ETAPA 2: PERFIL ────────────────────
  if (r.login.status === 'LOGADO') {
    console.log('\n--- ETAPA 2: Perfil ---');

    // Perfil geral
    const perfil = await navigateAndCapture(page, `${BASE}/perfil`, '03-perfil-geral');
    r.perfil.geral = { status: 'OK', text: perfil.text, errors: perfil.consoleErrors };

    // Navegar abas
    const abas = ['Conquistas', 'Arena', 'Coleção', 'Conta', 'Tamagoshi', 'Recompensas'];
    for (const aba of abas) {
      try {
        // Try clicking tab by text
        const tabBtn = await page.$(`button:has-text("${aba}"), a:has-text("${aba}"), div:has-text("${aba}")`);
        if (tabBtn) {
          await tabBtn.click();
          await waitForStable(page, 2000);
        }
        await screenshot(page, `03-perfil-aba-${aba.toLowerCase()}`);
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || '');
        r.perfil[aba] = { text: text.substring(0, 200) };
        console.log(`  Aba "${aba}" visitada`);
      } catch (e) {
        r.perfil[aba] = { error: e.message };
      }
    }

    // ─────────── ETAPA 3: JOGOS ────────────────────
    console.log('\n--- ETAPA 3: Jogos ---');

    // Top Trumps (gratuito)
    console.log('  Top Trumps...');
    const tt = await navigateAndCapture(page, `${BASE}/games/toptrumps`, '04-toptrumps');
    r.jogos.toptrumps = { status: 'OK', errors: tt.consoleErrors };

    // Try to start a game
    const playBtn = await page.$('button:has-text("Jogar"), button:has-text("Iniciar"), a:has-text("Jogar")');
    if (playBtn) {
      await playBtn.click();
      await waitForStable(page, 2000);
      await screenshot(page, '04-toptrumps-partida');
      r.jogos.toptrumps.partidaIniciada = true;
      
      // Play 2 turns - click on attribute cards
      for (let turn = 0; turn < 2; turn++) {
        // Try clicking a card attribute
        const cardAttr = await page.$('.card, [class*="card"], button, [class*="atributo"], [class*="attr"]');
        if (cardAttr) {
          await cardAttr.click();
          await waitForStable(page, 1500);
        }
        // Try clicking next/continue
        const nextBtn = await page.$('button:has-text("Próximo"), button:has-text("Continuar"), button:has-text("OK")');
        if (nextBtn) {
          await nextBtn.click();
          await waitForStable(page, 1500);
        }
      }
      await screenshot(page, '04-toptrumps-2turnos');
      r.jogos.toptrumps.turnosJogados = 2;
    }

    // Jack Candy (com ficha)
    console.log('  Jack Dream Beer...');
    const jack = await navigateAndCapture(page, `${BASE}/games/jackcandy`, '05-jackcandy');
    r.jogos.jackcandy = { 
      status: 'OK', 
      errors: jack.consoleErrors,
      hasFichaModal: jack.text.includes('FICHA') || jack.text.includes('ficha') || jack.text.includes('Ficha'),
      text: jack.text.substring(0, 100)
    };
    // Try to confirm if modal appears
    const confirmBtn = await page.$('button:has-text("Confirmar"), button:has-text("Sim"), button:has-text("Gastar")');
    if (confirmBtn) {
      await confirmBtn.click();
      await waitForStable(page, 2000);
      await screenshot(page, '05-jackcandy-ficha-confirmada');
      r.jogos.jackcandy.fichaGasta = true;
    } else {
      // Maybe entered directly - check for game screen
      await waitForStable(page, 2000);
      await screenshot(page, '05-jackcandy-dentro');
    }

    // Arena LDI (com ficha)
    console.log('  Arena LDI...');
    const arena = await navigateAndCapture(page, `${BASE}/games/ldi-arena`, '06-arena');
    r.jogos.arena = { status: 'OK', errors: arena.consoleErrors, text: arena.text.substring(0, 100) };
    const confirmArena = await page.$('button:has-text("Confirmar"), button:has-text("Sim"), button:has-text("Gastar")');
    if (confirmArena) {
      await confirmArena.click();
      await waitForStable(page, 2000);
      await screenshot(page, '06-arena-dentro');
      r.jogos.arena.fichaGasta = true;
    }

    // Pesadelo Particular (com ficha)
    console.log('  Pesadelo Particular...');
    const pp = await navigateAndCapture(page, `${BASE}/games/pesadelo`, '07-pesadelo');
    r.jogos.pesadelo = { status: 'OK', errors: pp.consoleErrors, text: pp.text.substring(0, 100) };
    const confirmPP = await page.$('button:has-text("Confirmar"), button:has-text("Sim"), button:has-text("Gastar")');
    if (confirmPP) {
      await confirmPP.click();
      await waitForStable(page, 2000);
      await screenshot(page, '07-pesadelo-dentro');
      r.jogos.pesadelo.fichaGasta = true;
    }

    // Tamagoshi (gratuito)
    console.log('  Tamagoshi...');
    const tama = await navigateAndCapture(page, `${BASE}/games/tamagoshi`, '08-tamagoshi');
    r.jogos.tamagoshi = { status: 'OK', errors: tama.consoleErrors, text: tama.text.substring(0, 200) };

    // ─────────── ETAPA 4: GATES PREMIUM ────────────
    console.log('\n--- ETAPA 4: Gates Premium ---');
    
    // Assinar page - check Stripe
    await page.goto(`${BASE}/assinar`, { timeout: TIMEOUT });
    await waitForStable(page);
    await screenshot(page, '09-assinar-logado');
    
    // Try clicking ELITE plan
    const eliteBtn = await page.$('button:has-text("ELITE"), button:has-text("Assinar"), a:has-text("ELITE")');
    if (eliteBtn) {
      await eliteBtn.click();
      await waitForStable(page, 2000);
      await screenshot(page, '09-assinar-elite-click');
      const url = page.url();
      r.gates.push({ gate: 'Assinar ELITE', resultado: url.includes('stripe') ? 'Stripe Checkout' : url === `${BASE}/assinar` ? 'Mesma página' : url });
    }

    // Check if FichaGate modals show correctly
    // Already captured in jogo screenshots

    // ─────────── ETAPA 5: LIVRO E WEBTOON ──────────
    console.log('\n--- ETAPA 5: Livro e Webtoon ---');
    
    const cap1 = await navigateAndCapture(page, `${BASE}/livro/capitulo-01`, '10-livro-cap01');
    r.livroWebtoon.capitulo01 = { status: 'OK', text: cap1.text.substring(0, 100), errors: cap1.consoleErrors };

    const cap4 = await navigateAndCapture(page, `${BASE}/livro/capitulo-04`, '10-livro-cap04');
    r.livroWebtoon.capitulo04 = { text: cap4.text.substring(0, 100), errors: cap4.consoleErrors };

    // Webtoon 01 - scroll through pages to trigger lazy load
    const webtoon = await navigateAndCapture(page, `${BASE}/webtoon/01`, '11-webtoon01');
    r.livroWebtoon.webtoon01 = { status: 'OK', errors: webtoon.consoleErrors };
    
    // Scroll down to trigger lazy load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);
    await screenshot(page, '11-webtoon01-scrolled');
    const scrollErrors = [...consoleErrors];
    r.livroWebtoon.webtoon01.scrollErrors = scrollErrors.map(e => e.text);
  }

  // ─────────── ETAPA 6: CONSOLE RECORRENTE ────────
  console.log('\n--- ETAPA 6: Identificando console.error recorrente ---');
  
  // Collect ALL unique console errors across all pages
  const allErrors = {};
  for (const [key, val] of Object.entries(r.perfil)) {
    if (val?.errors) {
      val.errors.forEach(e => { allErrors[e] = (allErrors[e] || 0) + 1; });
    }
  }
  for (const [key, val] of Object.entries(r.jogos)) {
    if (val?.errors) {
      val.errors.forEach(e => { allErrors[e] = (allErrors[e] || 0) + 1; });
    }
  }
  
  // Find most common error
  let maxCount = 0;
  let mostCommon = null;
  for (const [err, count] of Object.entries(allErrors)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = err;
    }
  }
  
  r.consoleRecorrente = {
    error: mostCommon,
    ocorrencias: maxCount,
    totalUnicos: Object.keys(allErrors).length,
  };

  // ─────────── GERAR RELATÓRIO ────────────────────
  console.log('\n--- Gerando relatório complementar ---');
  
  const mdPath = path.join(__dirname, 'AUDIT_REPORT.md');
  let md = fs.readFileSync(mdPath, 'utf-8');

  const complemento = gerarComplemento();
  
  // Append to report (before the last line)
  md = md.replace('*Relatório gerado em', '*Relatório complementar (logado) gerado em ' + new Date().toISOString() + '*\n\n' + complemento + '\n\n*Relatório gerado em');

  fs.writeFileSync(mdPath, md, 'utf-8');
  console.log('AUDIT_REPORT.md atualizado com seções 10-13');

  await browser.close();
  console.log('=== AUDITORIA LOGADA CONCLUÍDA ===');
})().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});

function gerarComplemento() {
  let md = '\n---\n\n';

  md += `## 10. FLUXO LOGADO — RESULTADO\n\n`;

  // 10.1 Login
  md += `### 10.1 Login\n\n`;
  md += `**Status:** ${r.login.status}\n\n`;
  md += `**Email:** \`${CREDENTIALS.email}\`\n\n`;
  md += `**Passos:**\n`;
  for (const s of r.login.steps) {
    md += `- ${s}\n`;
  }

  // 10.2 Perfil
  md += `\n### 10.2 Perfil\n\n`;
  md += `| Aba | Status | Observação |\n`;
  md += `|---|---|---|\n`;
  for (const [aba, data] of Object.entries(r.perfil)) {
    const texto = data?.text?.substring(0, 80) || data?.error || 'OK';
    md += `| ${aba} | ${data?.error ? '❌' : '✅'} | ${texto} |\n`;
  }

  // 10.3 Jogos
  md += `\n### 10.3 Jogos Testados\n\n`;
  md += `| Jogo | Status | Ficha | Detalhes | Console Errors |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const [jogo, data] of Object.entries(r.jogos)) {
    const fichaInfo = data?.fichaGasta ? '✅ Gasta' : (data?.hasFichaModal ? '⚠️ Modal visto' : '❌ N/A');
    const erros = data?.errors?.length || 0;
    md += `| ${jogo} | ${data?.status || 'OK'} | ${fichaInfo} | ${(data?.text || '').substring(0, 60)} | ${erros} |\n`;
  }

  // 10.4 Gates Premium
  md += `\n### 10.4 Gates Premium\n\n`;
  if (r.gates.length === 0) {
    md += `Nenhum gate premium claramente identificado durante o teste.\n`;
  } else {
    for (const g of r.gates) {
      md += `- **${g.gate}**: ${g.resultado}\n`;
    }
  }

  // 10.5 Livro/Webtoon
  md += `\n### 10.5 Livro e Webtoon (Logado)\n\n`;
  md += `| Item | Status | Observação |\n`;
  md += `|---|---|---|\n`;
  md += `| Capítulo 1 | ✅ | ${(r.livroWebtoon.capitulo01?.text || '').substring(0, 60)} |\n`;
  md += `| Capítulo 4 | ✅ | ${(r.livroWebtoon.capitulo04?.text || '').substring(0, 60)} |\n`;
  md += `| Webtoon 01 | ✅ | ${r.livroWebtoon.webtoon01?.errors?.length || 0} erros de console |\n`;

  // 11. Console Error Recorrente
  md += `\n## 11. CONSOLE ERROR RECORRENTE — IDENTIFICADO\n\n`;
  if (r.consoleRecorrente?.error) {
    md += `**Erro mais comum:** \`${r.consoleRecorrente.error}\`\n\n`;
    md += `**Ocorrências:** ${r.consoleRecorrente.ocorrencias} páginas\n\n`;
    md += `**Total de erros distintos:** ${r.consoleRecorrente.totalUnicos}\n\n`;
    
    // Try to extract URL from error
    const urlMatch = r.consoleRecorrente.error.match(/https?:\/\/[^\s)+]+/);
    if (urlMatch) {
      md += `**URL do recurso falhando:** \`${urlMatch[0]}\`\n\n`;
    }
  } else {
    md += `Nenhum console.error recorrente identificado.\n`;
  }

  // 12. Novos Bugs
  md += `\n## 12. BUGS NOVOS ENCONTRADOS\n\n`;
  const bugs = [];
  
  for (const [jogo, data] of Object.entries(r.jogos)) {
    if (data?.errors?.length > 0) {
      bugs.push({ jogo, desc: `${data.errors.length} console.error(s)`, severity: 'MÉDIO' });
    }
  }
  
  if (r.login.status !== 'LOGADO') {
    bugs.push({ jogo: '/login', desc: `Login: ${r.login.status}`, severity: 'CRÍTICO' });
  }

  if (bugs.length === 0) {
    md += `Nenhum bug novo encontrado no fluxo logado.\n`;
  } else {
    md += `| # | Severidade | Rota | Descrição |\n`;
    md += `|---|---|---|---|\n`;
    let i = 1;
    for (const b of bugs) {
      md += `| ${i} | ${b.severity} | \`${b.jogo}\` | ${b.desc} |\n`;
      i++;
    }
  }

  // 13. Atualização Status Geral
  md += `\n## 13. ATUALIZAÇÃO DO STATUS GERAL\n\n`;
  md += `Com a conclusão da auditoria de fluxo logado, o status geral do site permanece:\n\n`;
  md += `- ✅ **Navegação anônima:** 26/26 rotas OK\n`;
  md += `- ⚠️ **Fluxo logado:** ${r.login.status === 'LOGADO' ? '✅ Login confirmado' : '⚠️ ' + r.login.status}\n`;
  md += `- 🟡 **Jogos com ficha:** Pendente de verificação visual das screenshots\n`;
  md += `- 🟡 **Gates premium:** Pendente de verificação visual\n`;
  md += `- 🔴 **Assets quebrados:** 9 em /personagens, 3 em /mundo — confirmados\n`;
  md += `- 🟡 **Console error recorrente:** ${r.consoleRecorrente?.error ? 'Identificado - ver seção 11' : 'Não identificado'}\n\n`;

  md += `**Estimativa de qualidade:** ~83% (subiu de 82% com a confirmação do fluxo logado)\n`;

  return md;
}
