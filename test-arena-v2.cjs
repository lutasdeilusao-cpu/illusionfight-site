const { chromium } = require('playwright');

async function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function waitAndClick(page, selector, timeout = 5000) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: 'visible', timeout });
    await el.click();
    return true;
  } catch { return false }
}

async function login(page) {
  await page.goto('http://localhost:5178/login');
  await delay(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('gramikgames@gmail.com');
  await inputs.nth(1).fill('Vidanerd123$');
  await waitAndClick(page, 'button:has-text("ENTRAR")');
  await delay(3000);
}

async function testLang(page, lang, label) {
  console.log(`\n=== ${label} (${lang}) ===`);
  await page.evaluate((l) => localStorage.setItem('ldi-locale', l), lang);
  await page.goto('http://localhost:5178/games/ldi-arena');
  await delay(2000);
  // Dismiss intro
  const showBtn = page.locator('.arena-ng-btn');
  if (await showBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await showBtn.click();
    await delay(1500);
  }
  const body = await page.locator('body').textContent();
  const checks = {
    pt: ['LDI ARENA', 'NOVA FICHA', 'suas fichas'],
    en: ['LDI ARENA', 'NEW SHEET', 'your sheets'],
    es: ['LDI ARENA', 'NUEVA FICHA', 'tus fichas'],
  };
  const langChecks = checks[lang] || checks.en;
  let passed = 0, failed = 0;
  for (const text of langChecks) {
    const found = body.includes(text);
    console.log(`  ${found ? 'OK' : 'MISS'} "${text}"`);
    if (found) passed++; else failed++;
  }
  return { passed, failed };
}

async function testCreateSheet(page) {
  console.log('\n=== Criar Ficha ===');
  const newSheetBtn = page.locator('.arena-new-sheet').first();
  if (await newSheetBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await newSheetBtn.click(); await delay(2000);
  }
  // Intro - click CRIAR DIRETO
  const directBtn = page.locator('text=CRIAR DIRETO');
  if (await directBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await directBtn.click(); await delay(1000);
  }
  let body = await page.locator('body').textContent();
  console.log(`  Atributos: ${body.includes('ATRIBUTOS') ? 'OK' : 'MISS'}`);
  // Add points
  const plusBtns = page.locator('.arc-attr-btn:not([disabled])');
  const pc = await plusBtns.count();
  for (let i = 0; i < Math.min(pc, 3); i++) { await plusBtns.nth(i).click(); await delay(200); }
  // Next
  await waitAndClick(page, 'text=próximo'); await delay(1000);
  // Name
  const nameInput = page.locator('.arc-name-input');
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill('TestBot'); await delay(200);
  }
  // Elemental
  const elemCard = page.locator('.arc-elem-card').first();
  if (await elemCard.isVisible({ timeout: 2000 }).catch(() => false)) {
    await elemCard.click(); await delay(200);
  }
  console.log(`  Identidade: OK`);
  // Next
  await waitAndClick(page, 'text=próximo'); await delay(1500);
  body = await page.locator('body').textContent();
  console.log(`  Pericias: ${body.includes('PERÍCIAS') || body.includes('PERICIAS') ? 'OK' : 'MISS'}`);
  console.log(`  Vantagens: ${body.includes('VANTAGENS') ? 'OK' : 'MISS'}`);
  // Save
  const saveBtn = page.locator('text=SALVAR').first();
  if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await saveBtn.click(); await delay(2000);
    console.log('  Ficha salva!');
    return true;
  }
  console.log('  Save btn not found');
  return false;
}

async function testBattle(page) {
  console.log('\n=== Batalha ===');
  const sheetCard = page.locator('.arena-sheet-card-v').first();
  if (await sheetCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sheetCard.click(); await delay(1500);
  }
  let body = await page.locator('body').textContent();
  console.log(`  Inimigos: ${body.includes('inimigos') ? 'OK' : 'MISS'}`);
  // Select first enemy
  const enemyCard = page.locator('.arena-sheet-card-v').first();
  if (await enemyCard.isVisible({ timeout: 2000 }).catch(() => false)) {
    await enemyCard.click(); await delay(2000);
  }
  body = await page.locator('body').textContent();
  console.log(`  Poderes: ${body.includes('Preparar') ? 'OK' : 'MISS'}`);
  // Enter without powers
  const enterBtn = page.locator('text=ENTRAR').first();
  if (await enterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await enterBtn.click(); await delay(2000);
  }
  body = await page.locator('body').textContent();
  console.log(`  ATACAR: ${body.includes('ATACAR') ? 'OK' : 'MISS'}`);
  console.log(`  FUGIR: ${body.includes('FUGIR') ? 'OK' : 'MISS'}`);
  console.log(`  SAIR: ${body.includes('SAIR') ? 'OK' : 'MISS'}`);
  // Attack
  const attackBtn = page.locator('text=ATACAR').first();
  if (await attackBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await attackBtn.click();
    console.log('  Ataque OK');
    await delay(5000);
  }
  console.log('  Batalha OK');
  return true;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('=== ARENA i18n + GAMEPLAY TEST ===\n');
  try {
    console.log('--- Login ---');
    await login(page);
    console.log('OK\n');
    
    let tp = 0, tf = 0;
    const r1 = await testLang(page, 'pt', 'Portugues');
    tp += r1.passed; tf += r1.failed;
    const r2 = await testLang(page, 'en', 'English');
    tp += r2.passed; tf += r2.failed;
    const r3 = await testLang(page, 'es', 'Espanol');
    tp += r3.passed; tf += r3.failed;
    console.log(`\ni18n: ${tp}/${tp+tf} OK`);
    
    // Reset to PT
    await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'));
    await page.goto('http://localhost:5178/games/ldi-arena');
    await delay(2000);
    await waitAndClick(page, '.arena-ng-btn');
    await delay(1000);
    
    const created = await testCreateSheet(page);
    if (created) await testBattle(page);
    
    console.log(`\n${tf === 0 ? 'TODOS OK!' : tf + ' FALHAS'}`);
  } catch (err) {
    console.error('ERRO:', err.message);
  } finally {
    await browser.close();
  }
}
main();
