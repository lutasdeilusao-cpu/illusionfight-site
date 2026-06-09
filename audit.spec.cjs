/**
 * AUDIT — Auditoria Completa illusionfight.com
 * 
 * Uso: npx playwright test audit.spec.js --headed
 * Relatório: gera AUDIT_REPORT.md automaticamente
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://illusionfight.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'audit-screenshots');
const TIMEOUT = 15000;
const TEST_EMAIL = 'audit.ldi.test@mailinator.com';
const TEST_PASS = 'AuditTest123$';

// ─── Report accumulator ──────────────────────────
const report = {
  siteVersion: '?',
  timestamp: new Date().toISOString(),
  anonymous: [],
  accountCreation: { status: 'NOT RUN', details: [] },
  loggedIn: {},
  premiumGates: [],
  errors: [],
  visual: {},
  bugs: [],
  recommendations: [],
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
    if (resp.status() >= 400) {
      const url = resp.url();
      // Check if it's an asset (image, font, etc.)
      if (/\.(png|jpg|jpeg|gif|svg|webp|woff2?|otf|ttf|eot|js|css)/i.test(url)) {
        brokenAssets.push({ url, status: resp.status() });
      }
    }
  });
}

async function waitForStable(page) {
  await page.waitForLoadState('networkidle', { timeout: TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function takeScreenshot(page, name) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: true });
}

function getConsoleErrorSummary() {
  const errors = [...new Set(consoleErrors.map(e => e.text))];
  return errors;
}

// ─── Helper: navigate and record ─────────────────
async function navigateAndRecord(page, route, label, requiresLogin = false) {
  const entry = { route, label, status: 'OK', details: [], consoleErrors: 0, pageErrors: 0, failedRequests: 0, brokenAssets: 0 };
  try {
    const consoleBefore = consoleErrors.length;
    const pageErrBefore = pageErrors.length;
    const reqBefore = failedRequests.length;
    const assetsBefore = brokenAssets.length;

    await page.goto(`${BASE}${route}`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
    await waitForStable(page);

    entry.consoleErrors = consoleErrors.length - consoleBefore;
    entry.pageErrors = pageErrors.length - pageErrBefore;
    entry.failedRequests = failedRequests.length - reqBefore;
    entry.brokenAssets = brokenAssets.length - assetsBefore;

    // Check if page has content
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || 'NO BODY');
    entry.details.push(`Conteúdo visível: "${bodyText.substring(0, 100)}..."`);

    // Check if redirected
    const currentUrl = page.url();
    if (currentUrl !== `${BASE}${route}` && !currentUrl.startsWith(`${BASE}${route}`)) {
      entry.details.push(`Redirect: ${currentUrl}`);
      entry.status = 'REDIRECT';
    }

    // Check for login gate
    const loginGate = await page.$('text=Entrar, text=Login, text=Fazer login');
    if (loginGate && requiresLogin) {
      entry.details.push('Gate de login presente');
    }

    await takeScreenshot(page, `anon-${route.replace(/\//g, '-') || 'home'}`);
  } catch (err) {
    entry.status = 'TIMEOUT/ERROR';
    entry.details.push(err.message.substring(0, 200));
  }

  report.anonymous.push(entry);
  return entry;
}

// ─── Main audit ──────────────────────────────────
(async () => {
  console.log('=== INICIANDO AUDITORIA ===');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'pt-BR',
  });
  const page = await context.newPage();
  setupListeners(page);

  // ────────────── ETAPA 1: NAVEGAÇÃO ANÔNIMA ──────────────
  console.log('\n--- ETAPA 1: Navegação Anônima ---');

  const institutionalRoutes = [
    { route: '/', label: 'Home' },
    { route: '/personagens', label: 'Personagens Grid' },
    { route: '/personagens/kim', label: 'Personagem Kim (detalhe)' },
    { route: '/livro', label: 'Livro (lista capítulos)' },
    { route: '/livro/capitulo-01', label: 'Capítulo 1 (publicado)' },
    { route: '/livro/capitulo-04', label: 'Capítulo 4 (não publicado)' },
    { route: '/webtoon', label: 'Webtoon Grid' },
    { route: '/webtoon/00', label: 'Webtoon Ep.00' },
    { route: '/webtoon/01', label: 'Webtoon Ep.01' },
    { route: '/musicas', label: 'Músicas' },
    { route: '/mundo', label: 'Mundo/Lore' },
    { route: '/autor', label: 'Sobre o Autor' },
    { route: '/assinar', label: 'Planos de Assinatura' },
    { route: '/games', label: 'Games Hub' },
    { route: '/leaderboard', label: 'Leaderboard' },
    { route: '/quiz', label: 'Quiz' },
    { route: '/custos', label: 'Custos/Transparência' },
  ];

  for (const r of institutionalRoutes) {
    console.log(`  Visitando: ${r.route}`);
    await navigateAndRecord(page, r.route, r.label, false);
  }

  const gameRoutes = [
    { route: '/games/toptrumps', label: 'Top Trumps' },
    { route: '/games/ldi', label: 'Lendas do LDI' },
    { route: '/games/jackcandy', label: 'Jack Dream Beer' },
    { route: '/games/minigames', label: 'MiniGames' },
    { route: '/games/ldi-arena', label: 'Arena LDI' },
    { route: '/games/ldi-tatics', label: 'Arena LDI Tatics' },
    { route: '/games/pesadelo', label: 'Pesadelo Particular' },
    { route: '/games/duelo', label: 'Duelo LDI' },
    { route: '/games/tamagoshi', label: 'Tamagoshi LDI' },
  ];

  for (const r of gameRoutes) {
    console.log(`  Visitando (jogo): ${r.route}`);
    await navigateAndRecord(page, r.route, r.label, false);
  }

  // Capture site version from console
  const versionMatch = consoleErrors.find(e => e.text.includes('[SITE] versão carregada'));
  if (versionMatch) {
    report.siteVersion = versionMatch.text.match(/[\d.]+/)?.[0] || '?';
  }
  // Also try to get it from page logs (not errors)
  const allLogs = [];
  page.removeAllListeners('console');
  page.on('console', msg => allLogs.push(msg.text()));
  // Re-navigate to home to capture startup logs
  await page.goto(`${BASE}/`, { timeout: TIMEOUT });
  await waitForStable(page);
  const siteVerLog = allLogs.find(l => l.includes('[SITE] versão carregada'));
  if (siteVerLog) {
    report.siteVersion = siteVerLog.match(/[\d.]+/)?.[0] || report.siteVersion;
  }

  console.log(`\nSite Version detected: ${report.siteVersion}`);

  // ────────────── ETAPA 2: CRIAR CONTA ──────────────
  console.log('\n--- ETAPA 2: Criar Conta ---');
  setupListeners(page);
  report.accountCreation.status = 'EXECUTANDO';

  try {
    await page.goto(`${BASE}/cadastro`, { timeout: TIMEOUT });
    await waitForStable(page);
    await takeScreenshot(page, 'cadastro-page');

    // Try to find and fill registration form
    // First, let's see what's on the page
    const pageContent = await page.content();
    
    // Look for input fields
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]');
    const passInput = await page.$('input[type="password"]');
    const submitBtn = await page.$('button[type="submit"], button:has-text("Criar"), button:has-text("Cadastrar"), button:has-text("Registrar")');

    if (emailInput && passInput) {
      await emailInput.fill(TEST_EMAIL);
      await passInput.fill(TEST_PASS);
      
      // Check if there's a confirm password field
      const passInputs = await page.$$('input[type="password"]');
      if (passInputs.length > 1) {
        await passInputs[1].fill(TEST_PASS);
      }

      if (submitBtn) {
        await submitBtn.click();
        await waitForStable(page);
        await takeScreenshot(page, 'cadastro-pos-submit');
        report.accountCreation.details.push('Formulário preenchido e enviado');
        
        // Check current URL - should be redirected
        const url = page.url();
        report.accountCreation.details.push(`URL após submit: ${url}`);

        // Check if logged in (navbar should show user)
        const userMenu = await page.$('text=Perfil, text=perfil, text=Minha Conta');
        if (userMenu || url.includes('/perfil') || url === `${BASE}/`) {
          report.accountCreation.status = 'SUCESSO';
          report.accountCreation.details.push('Sessão criada com sucesso');
        } else {
          report.accountCreation.status = 'PARCIAL';
          report.accountCreation.details.push('Formulário enviado mas não confirmou sessão');
        }
      }
    } else {
      // Let's check what form elements exist
      const inputs = await page.$$('input');
      const buttons = await page.$$('button');
      report.accountCreation.details.push(`Inputs encontrados: ${inputs.length}, Buttons: ${buttons.length}`);
      
      if (inputs.length === 0 && buttons.length === 0) {
        report.accountCreation.status = 'FALHA';
        report.accountCreation.details.push('Página parece não ter formulário - possível redirect ou erro');
      } else {
        // Try to fill any text inputs
        const textInputs = await page.$$('input:not([type="hidden"])');
        for (let i = 0; i < textInputs.length && i < 3; i++) {
          if (i === 0) await textInputs[i].fill(TEST_EMAIL);
          else if (i === 1) await textInputs[i].fill(TEST_PASS);
          else await textInputs[i].fill(TEST_PASS);
        }
        if (buttons.length > 0) {
          await buttons[0].click();
          await waitForStable(page);
          report.accountCreation.details.push('Tentativa alternativa de submit');
          report.accountCreation.status = 'TENTATIVA';
        }
      }
    }
  } catch (err) {
    report.accountCreation.status = 'ERRO';
    report.accountCreation.details.push(err.message.substring(0, 200));
  }

  // If account creation didn't work cleanly, try login directly
  if (report.accountCreation.status !== 'SUCESSO') {
    console.log('  Tentando login diretamente...');
    try {
      await page.goto(`${BASE}/login`, { timeout: TIMEOUT });
      await waitForStable(page);
      await takeScreenshot(page, 'login-page');

      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passInput = await page.$('input[type="password"]');
      const loginBtn = await page.$('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');

      if (emailInput && passInput) {
        await emailInput.fill(TEST_EMAIL);
        await passInput.fill(TEST_PASS);
        if (loginBtn) {
          await loginBtn.click();
          await waitForStable(page);
          await takeScreenshot(page, 'login-pos-submit');
          report.accountCreation.details.push('Login realizado');
          report.accountCreation.status = 'LOGIN_DIREto';
        }
      }
    } catch (err) {
      report.accountCreation.details.push(`Login direto falhou: ${err.message}`);
    }
  }

  // ────────────── ETAPA 3: FLUXO LOGADO ──────────────
  console.log('\n--- ETAPA 3: Fluxo Logado ---');

  // Re-navigate to verify logged in state
  await page.goto(`${BASE}/`, { timeout: TIMEOUT });
  await waitForStable(page);

  // Check if logged in by looking for user indicators in the DOM
  const isLoggedIn = await page.evaluate(() => {
    // Check various indicators
    const body = document.body.innerText || '';
    return {
      hasPerfil: body.includes('Perfil') || body.includes('perfil'),
      hasSair: body.includes('Sair') || body.includes('sair') || body.includes('Logout'),
      url: window.location.href,
    };
  });

  report.loggedIn.loginStatus = isLoggedIn;
  report.accountCreation.details.push(`Status login: ${JSON.stringify(isLoggedIn)}`);

  // Se estiver logado, testar fluxos
  if (isLoggedIn.hasPerfil || isLoggedIn.hasSair) {
    // Profile
    console.log('  Acessando perfil...');
    await page.goto(`${BASE}/perfil`, { timeout: TIMEOUT });
    await waitForStable(page);
    await takeScreenshot(page, 'perfil-page');
    report.loggedIn.perfil = { status: 'OK', url: page.url() };

    // Try navigating to games again
    for (const r of gameRoutes) {
      console.log(`  Visitando (logado): ${r.route}`);
      setupListeners(page);
      await page.goto(`${BASE}${r.route}`, { timeout: TIMEOUT });
      await waitForStable(page);
      await takeScreenshot(page, `logado-${r.route.replace(/\//g, '-')}`);

      // Check for FichaGate
      const hasFichaGate = await page.$('text=FICHAS, text=fichas, text=Sem Fichas');
      report.loggedIn[r.label] = {
        url: page.url(),
        hasFichaGate: !!hasFichaGate,
        consoleErrors: consoleErrors.length,
      };
    }

    // Try premium content
    console.log('  Testando gates premium...');
    // Assinar page
    await page.goto(`${BASE}/assinar`, { timeout: TIMEOUT });
    await waitForStable(page);
    await takeScreenshot(page, 'assinar-logado');

    // Test livro/capitulo-04 (não publicado)
    await page.goto(`${BASE}/livro/capitulo-04`, { timeout: TIMEOUT });
    await waitForStable(page);
    await takeScreenshot(page, 'capitulo-04-logado');
    const cap04Content = await page.evaluate(() => document.body.innerText.substring(0, 300));
    report.loggedIn.capitulo04 = cap04Content.substring(0, 100);
  }

  // ────────────── ETAPA 4: CONSOLE E ERROS ──────────────
  console.log('\n--- Coletando Erros ---');
  report.errors = {
    consoleErrors: getConsoleErrorSummary(),
    pageErrors: [...new Set(pageErrors)],
    failedRequests: failedRequests.slice(0, 20),
    brokenAssets,
  };

  // ────────────── ETAPA 5: CHECKLIST VISUAL ──────────────
  console.log('\n--- Checklist Visual ---');
  await page.goto(`${BASE}/`, { timeout: TIMEOUT });
  await waitForStable(page);

  report.visual = await page.evaluate(() => {
    const checkElement = (sel) => !!document.querySelector(sel);
    const style = getComputedStyle(document.documentElement);
    return {
      navbar: checkElement('nav, header, [class*="navbar"], [class*="Navbar"]'),
      footer: checkElement('footer'),
      responsivoMobile: window.innerWidth <= 375, // tested at 1280, but we note viewport
      fonteBringRace: [...document.fonts].some(f => f.family.includes('Bring')),
    };
  });

  // ────────────── GERAR RELATÓRIO ──────────────
  console.log('\n--- Gerando Relatório ---');
  const md = generateReport();
  fs.writeFileSync(path.join(__dirname, 'AUDIT_REPORT.md'), md, 'utf-8');
  console.log(`Relatório salvo em AUDIT_REPORT.md`);

  await browser.close();
  console.log('=== AUDITORIA CONCLUÍDA ===');
})().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});

function generateReport() {
  const totalRoutes = report.anonymous.length;
  const okRoutes = report.anonymous.filter(r => r.status === 'OK').length;
  const errRoutes = report.anonymous.filter(r => r.status !== 'OK').length;
  const totalConsoleErrors = report.errors.consoleErrors?.length || 0;
  const totalBrokenAssets = report.errors.brokenAssets?.length || 0;

  let md = `# AUDIT REPORT — illusionfight.com\n\n`;
  md += `**Data:** ${report.timestamp.split('T')[0]}\n`;
  md += `**Versão do site:** ${report.siteVersion}\n`;
  md += `**URL:** ${BASE}\n\n`;

  md += `## RESUMO EXECUTIVO\n\n`;
  md += `| Métrica | Valor |\n`;
  md += `|---|---|\n`;
  md += `| Total de rotas testadas | ${totalRoutes} |\n`;
  md += `| Rotas com erro | ${errRoutes} |\n`;
  md += `| Rotas OK | ${okRoutes} |\n`;
  md += `| Erros de console distintos | ${totalConsoleErrors} |\n`;
  md += `| Assets quebrados | ${totalBrokenAssets} |\n`;
  md += `| Page errors (JS) | ${report.errors.pageErrors?.length || 0} |\n`;
  md += `| Criação de conta | ${report.accountCreation.status} |\n\n`;

  md += `## 1. NAVEGAÇÃO ANÔNIMA\n\n`;
  md += `| Rota | Label | Status | Detalhes | Console Errors | Assets Quebrados |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const r of report.anonymous) {
    md += `| \`${r.route}\` | ${r.label} | ${r.status} | ${r.details.join('; ').substring(0, 150)} | ${r.consoleErrors} | ${r.brokenAssets} |\n`;
  }

  md += `\n## 2. CRIAÇÃO DE CONTA\n\n`;
  md += `**Status:** ${report.accountCreation.status}\n\n`;
  md += `**Email:** \`${TEST_EMAIL}\`\n\n`;
  md += `**Detalhes:**\n`;
  for (const d of report.accountCreation.details) {
    md += `- ${d}\n`;
  }

  md += `\n## 3. FLUXO LOGADO\n\n`;
  md += `**Status login:** ${JSON.stringify(report.loggedIn.loginStatus)}\n\n`;
  if (report.loggedIn.perfil) {
    md += `**Perfil:** ${report.loggedIn.perfil.url}\n\n`;
  }
  md += `### Rotas de Jogo (logado)\n\n`;
  md += `| Jogo | URL Final | FichaGate | Console Errors |\n`;
  md += `|---|---|---|---|\n`;
  for (const [key, val] of Object.entries(report.loggedIn)) {
    if (key !== 'loginStatus' && key !== 'perfil' && key !== 'capitulo04' && typeof val === 'object') {
      md += `| ${key} | ${val.url || '?'} | ${val.hasFichaGate ? '✅ Sim' : '❌ Não'} | ${val.consoleErrors || 0} |\n`;
    }
  }

  if (report.loggedIn.capitulo04) {
    md += `\n**Capítulo 4 (não publicado):** ${report.loggedIn.capitulo04}\n`;
  }

  md += `\n## 4. GATES PREMIUM\n\n`;
  md += `> Ver seção 3 para detecção de FichaGate em jogos.\n\n`;

  md += `## 5. ERROS E CONSOLE\n\n`;

  md += `### Console Errors\n`;
  if (report.errors.consoleErrors?.length) {
    for (const err of report.errors.consoleErrors) {
      md += `- \`${err}\`\n`;
    }
  } else {
    md += `Nenhum erro de console capturado.\n`;
  }

  md += `\n### Page Errors (JS Exceptions)\n`;
  if (report.errors.pageErrors?.length) {
    for (const err of report.errors.pageErrors) {
      md += `- ${err}\n`;
    }
  } else {
    md += `Nenhum page error capturado.\n`;
  }

  md += `\n### Failed Requests\n`;
  if (report.errors.failedRequests?.length) {
    for (const req of report.errors.failedRequests) {
      md += `- \`${req.url.substring(0, 100)}\` — ${req.failure}\n`;
    }
  } else {
    md += `Nenhum request falhou.\n`;
  }

  md += `\n### Broken Assets\n`;
  if (report.errors.brokenAssets?.length) {
    for (const asset of report.errors.brokenAssets) {
      md += `- \`${asset.url.substring(0, 100)}\` — status ${asset.status}\n`;
    }
  } else {
    md += `Nenhum asset quebrado encontrado.\n`;
  }

  md += `\n## 6. CHECKLIST VISUAL\n\n`;
  md += `| Item | Status |\n`;
  md += `|---|---|\n`;
  for (const [key, val] of Object.entries(report.visual)) {
    md += `| ${key} | ${val ? '✅ Sim' : '❌ Não'} |\n`;
  }

  md += `\n## 7. BUGS ENCONTRADOS\n\n`;
  const bugs = [];
  for (const r of report.anonymous) {
    if (r.status !== 'OK') {
      const severity = r.route.includes('game') ? 'ALTO' : 'MÉDIO';
      bugs.push({ route: r.route, desc: `${r.label}: ${r.status} — ${r.details.join('; ').substring(0, 100)}`, severity });
    }
  }
  if (report.accountCreation.status !== 'SUCESSO' && report.accountCreation.status !== 'LOGIN_DIREto') {
    bugs.push({ route: '/cadastro', desc: `Criação de conta: ${report.accountCreation.status}`, severity: 'CRÍTICO' });
  }
  if (bugs.length === 0) {
    md += `Nenhum bug encontrado.\n`;
  } else {
    let i = 1;
    for (const bug of bugs) {
      md += `${i}. **${bug.severity}** — \`${bug.route}\` — ${bug.desc}\n`;
      i++;
    }
  }

  md += `\n## 8. RECOMENDAÇÕES DE FOCO\n\n`;
  md += `1. **Verificar criação de conta** — Se o fluxo de cadastro falhou, é prioridade #1.\n`;
  md += `2. **Corrigir assets quebrados** — ${totalBrokenAssets} assets retornaram erro.\n`;
  md += `3. **Revisar erros de console** — ${totalConsoleErrors} erros distintos encontrados.\n`;
  md += `4. **Testar rotas com TIMEOUT** — Investigar por que algumas rotas não carregaram.\n`;
  md += `5. **Verificar gates de jogo** — Confirmar se FichaGate/PremiumGate está funcionando.\n\n`;

  md += `---\n`;
  md += `*Relatório gerado automaticamente em ${report.timestamp}*\n`;

  return md;
}
