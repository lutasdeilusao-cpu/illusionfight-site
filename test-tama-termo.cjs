const { chromium } = require('playwright');
async function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

const BASE = 'http://localhost:5173';
const HOJE = new Date().toISOString().split('T')[0];

async function login(page, email, senha) {
  console.log(`  Login com ${email}...`);
  await page.goto(`${BASE}/login`);
  await delay(3000);
  const inputs = page.locator('input');
  const count = await inputs.count();
  console.log(`  Inputs encontrados: ${count}`);
  if (count >= 2) {
    await inputs.nth(0).fill(email);
    await inputs.nth(1).fill(senha);
    const btn = page.locator('button[type="submit"], button:has-text("ENTRAR")').first();
    await btn.click();
    await delay(4000);
  }
}

async function bypassFichaGate(page) {
  await page.evaluate((hoje) => {
    localStorage.setItem('ficha_gate_tamagoshi', hoje);
  }, HOJE);
}

async function testNovoUsuarioTermo() {
  console.log('\n=== TESTE 1: Novo usuário (conta@teste.com) — fluxo do termo ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(BASE);
  await delay(1000);
  await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'));
  await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(k => { if (k.startsWith('tama_save_')) localStorage.removeItem(k); });
  });

  await login(page, 'conta@teste.com', '000000');
  await bypassFichaGate(page);

  console.log('  Navegando para /games/tamagoshi...');
  await page.goto(`${BASE}/games/tamagoshi`);
  await delay(5000);

  const bodyDebug = await page.locator('body').textContent();
  console.log(`  Body (início): "${bodyDebug.substring(0, 400)}"`);

  const termoTitulo = page.locator('.tama-termo-titulo');
  const termoVisivel = await termoTitulo.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`  ${termoVisivel ? 'OK' : 'FAIL'} Termo visível: ${termoVisivel}`);
  let allOk = termoVisivel;

  if (termoVisivel) {
    const tituloTexto = await termoTitulo.textContent();
    console.log(`  Termo título: "${tituloTexto}"`);

    const btnLi = page.locator('button:has-text("LI E ENTENDO")');
    const btnLiVisivel = await btnLi.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`  ${btnLiVisivel ? 'OK' : 'FAIL'} Botão LI E ENTENDO visível: ${btnLiVisivel}`);
    if (!btnLiVisivel) allOk = false;

    if (btnLiVisivel) {
      await btnLi.click();
      await delay(1500);

      const btnAceitar = page.locator('button:has-text("ACEITO")');
      const btnAceitarVisivel = await btnAceitar.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`  ${btnAceitarVisivel ? 'OK' : 'FAIL'} Botão ACEITO visível (2ª etapa): ${btnAceitarVisivel}`);
      if (!btnAceitarVisivel) allOk = false;

      if (btnAceitarVisivel) {
        console.log('  Clicando em ACEITAR...');
        await btnAceitar.click();
        await delay(2000);

        const termoAindaVisivel = await termoTitulo.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(`  ${!termoAindaVisivel ? 'OK' : 'FAIL'} Termo fechou após aceitar: ${!termoAindaVisivel}`);
        if (termoAindaVisivel) allOk = false;

        await delay(2000);
        const bodyText = await page.locator('body').textContent();
        const temOvo = bodyText.includes('misterioso') || bodyText.includes('tocar no ovo');
        const temSelecao = bodyText.includes('emerge') || bodyText.includes('quem você quer');
        const temAlgo = temOvo || temSelecao;
        console.log(`  ${temAlgo ? 'OK' : 'ATENÇÃO'} Tela inicial (ovo/seleção): ${temAlgo}`);
        if (!temAlgo) {
          console.log(`  Conteúdo pós-aceitar: "${bodyText.substring(0, 300)}"`);
        }
      }
    }
  }

  await browser.close();
  return allOk;
}

async function testRecarregarSemVazamento() {
  console.log('\n=== TESTE 2: Recarregar — não deve carregar tama de outro usuário ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(BASE);
  await delay(1000);
  await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'));
  await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(k => { if (k.startsWith('tama_save_')) localStorage.removeItem(k); });
  });

  await login(page, 'conta@teste.com', '000000');
  await bypassFichaGate(page);

  await page.goto(`${BASE}/games/tamagoshi`);
  await delay(4000);

  const termoAposAceitar = page.locator('.tama-termo-titulo');
  const termoVisivel2 = await termoAposAceitar.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  ${!termoVisivel2 ? 'OK' : 'FAIL'} Termo NÃO aparece (já aceito): ${!termoVisivel2}`);
  let allOk = !termoVisivel2;

  const bodyText2 = await page.locator('body').textContent();
  const temKroniki = bodyText2.includes('Kroniki');
  console.log(`  ${!temKroniki ? 'OK' : 'FAIL'} NÃO carregou Kroniki de outro user: ${!temKroniki}`);
  if (temKroniki) {
    console.log(`  PERIGO: "${bodyText2.substring(0, 300)}"`);
    allOk = false;
  }

  const temOvo2 = bodyText2.includes('misterioso') || bodyText2.includes('tocar no ovo');
  console.log(`  ${temOvo2 ? 'OK' : 'ATENÇÃO'} Tela inicial (ovo): ${temOvo2}`);

  await browser.close();
  return allOk;
}

async function testAdminCarregaProprioTama() {
  console.log('\n=== TESTE 3: Admin (gramikgames) — carregar próprio tamagoshi ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(BASE);
  await delay(1000);
  await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'));
  await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(k => { if (k.startsWith('tama_save_')) localStorage.removeItem(k); });
  });

  await login(page, 'gramikgames@gmail.com', 'Vidanerd123$');

  await page.goto(`${BASE}/games/tamagoshi`);
  await delay(5000);

  const bodyText3 = await page.locator('body').textContent();
  const adminTemKroniki = bodyText3.includes('Kroniki');
  console.log(`  ${adminTemKroniki ? 'OK' : 'ATENÇÃO'} Admin carregou tamagoshi: ${adminTemKroniki}`);
  if (!adminTemKroniki) {
    console.log(`  Conteúdo admin: "${bodyText3.substring(0, 300)}"`);
  }

  await browser.close();
  return adminTemKroniki;
}

async function main() {
  const r1 = await testNovoUsuarioTermo();
  const r2 = await testRecarregarSemVazamento();
  const r3 = await testAdminCarregaProprioTama();

  const allOk = r1 && r2 && r3;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTADO: ${allOk ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}`);
  console.log(`  Teste 1 (termo + aceitar): ${r1 ? '✅' : '❌'}`);
  console.log(`  Teste 2 (sem vazamento):   ${r2 ? '✅' : '❌'}`);
  console.log(`  Teste 3 (admin):           ${r3 ? '✅' : '❌'}`);
  console.log(`${'='.repeat(50)}`);

  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error('ERRO:', err);
  process.exit(1);
});
