const { chromium } = require('playwright');
async function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  // Login
  await page.goto('http://localhost:5178/login');
  await delay(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('gramikgames@gmail.com');
  await inputs.nth(1).fill('Vidanerd123$');
  await page.locator('button:has-text("ENTRAR")').first().click();
  await delay(3000);
  
  let allOk = true;
  
  async function testLang(lang, label, checks) {
    console.log(`\n=== ${label} ===`);
    await page.evaluate((l) => localStorage.setItem('ldi-locale', l), lang);
    await page.goto('http://localhost:5178/games/ldi-arena');
    await delay(3000);
    
    // Dismiss cookie
    const cookieBtn = page.locator('button:has-text("ENTENDI"), button:has-text("OK"), button:has-text("ACEIT")');
    if (await cookieBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cookieBtn.click(); await delay(500);
    }
    
    // Wait for intro animation to finish, then click MOSTRAR
    await delay(3000);
    const mostrar = page.locator('button:has-text("MOSTRAR"), button:has-text("SHOW")');
    if (await mostrar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mostrar.click(); await delay(1500);
    }
    
    // Use textContent for raw DOM (no CSS transform)
    const text = await page.locator('body').textContent();
    const inner = await page.locator('body').innerText();
    
    for (const check of checks) {
      // Check in textContent (raw) and innerText (rendered)
      const found = text.toLowerCase().includes(check.toLowerCase()) || 
                    inner.toLowerCase().includes(check.toLowerCase());
      console.log(`  ${found ? 'OK' : 'MISS'} "${check}"`);
      if (!found) allOk = false;
    }
    
    // Check create button and sheet creation
    const hasNewSheet = text.toLowerCase().includes('nova ficha') || text.toLowerCase().includes('new sheet') || text.toLowerCase().includes('nueva ficha');
    console.log(`  ${hasNewSheet ? 'OK' : 'MISS'} Create button`);
    if (!hasNewSheet) allOk = false;
    
    // Try creating a sheet
    const createBtn = page.locator('.arena-new-sheet').first();
    if (await createBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await createBtn.click(); await delay(2000);
      
      // Click CRIAR DIRETO / CREATE DIRECTLY / CREAR DIRECTO
      const dirBtn = page.locator('button, div').filter({ hasText: /CRIAR DIRETO|CREATE DIRECTLY|CREAR DIRECTO/i }).first();
      if (await dirBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dirBtn.click(); await delay(1000);
        
        const createText = await page.locator('body').textContent();
        const hasAttrs = /ATRIBUTOS|ATTRIBUTES|ATRIBUTOS/i.test(createText);
        console.log(`  ${hasAttrs ? 'OK' : 'MISS'} Attributes page`);
        if (!hasAttrs) allOk = false;
      }
    }
  }
  
  // Test all 3 languages
  await testLang('pt', 'Portugues', [
    'LDI ARENA', 'suas fichas', 'NOVA FICHA', 'crie sua ficha',
    'SEM FICHAS', 'modo standalone', 'carregando'
  ]);
  
  await testLang('en', 'English', [
    'LDI ARENA', 'your sheets', 'NEW SHEET', 'create your sheet',
    'NO TOKENS', 'standalone mode', 'loading'
  ]);
  
  await testLang('es', 'Espanol', [
    'LDI ARENA', 'tus fichas', 'NUEVA FICHA', 'crea tu ficha',
    'SIN FICHAS', 'modo independiente', 'cargando'
  ]);
  
  console.log(`\n${allOk ? '\n✅ TODAS AS TRADUCOES OK!' : '\n❌ ALGUMAS TRADUCOES FALTANDO'}`);
  
  await browser.close();
}
main();
