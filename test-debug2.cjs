const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  // Login
  await page.goto('http://localhost:5178/login');
  await new Promise(r => setTimeout(r, 2000));
  const inputs = page.locator('input');
  await inputs.nth(0).fill('gramikgames@gmail.com');
  await inputs.nth(1).fill('Vidanerd123$');
  await page.locator('button:has-text("ENTRAR")').first().click();
  await new Promise(r => setTimeout(r, 3000));
  
  // Arena with PT
  await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'));
  await page.goto('http://localhost:5178/games/ldi-arena');
  await new Promise(r => setTimeout(r, 2000));
  
  // Dismiss intro
  const showBtn = page.locator('.arena-ng-btn');
  if (await showBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await showBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  
  // Get ALL text
  const text = await page.locator('body').innerText();
  console.log('=== FULL PAGE TEXT (Portuguese) ===');
  console.log(text);
  
  // Now click new sheet
  const btn = page.locator('.arena-new-sheet');
  console.log('\nNew sheet btn visible:', await btn.isVisible());
  if (await btn.isVisible()) {
    console.log('New sheet btn text:', await btn.textContent());
    await btn.click();
    await new Promise(r => setTimeout(r, 2000));
    
    // Click CRIAR DIRETO
    const cDir = page.locator('text=CRIAR DIRETO');
    if (await cDir.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cDir.click();
      await new Promise(r => setTimeout(r, 1000));
      
      const t2 = await page.locator('body').innerText();
      console.log('\n=== CREATE PAGE TEXT ===');
      console.log(t2);
      
      // Try to save
      const saveBtn = page.locator('button:has-text("SALVAR")');
      console.log('\nSave btn visible:', await saveBtn.isVisible().catch(() => false));
      if (await saveBtn.isVisible().catch(() => false)) {
        console.log('Save btn text:', await saveBtn.textContent());
      } else {
        // Look for all buttons
        const allBtns = page.locator('button');
        const count = await allBtns.count();
        console.log('\nAll buttons text:');
        for (let i = 0; i < count; i++) {
          const bt = (await allBtns.nth(i).textContent()).trim();
          if (bt) console.log(`  [${i}] "${bt}"`);
        }
      }
    }
  }
  
  await browser.close();
})();
