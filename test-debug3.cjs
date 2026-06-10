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
  
  // Arena
  await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'));
  await page.goto('http://localhost:5178/games/ldi-arena');
  await new Promise(r => setTimeout(r, 5000)); // Wait for intro animation
  
  // Dismiss cookie banner
  const cookieBtn = page.locator('button:has-text("ENTENDI"), button:has-text("OK"), button:has-text("ACEIT")');
  if (await cookieBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await cookieBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Wait for the "MOSTRAR FICHAS" button to appear (it has delay)
  await new Promise(r => setTimeout(r, 3000));
  
  // Take screenshots
  await page.screenshot({ path: 'test-arena-full.png', fullPage: true });
  
  const text = await page.locator('body').innerText();
  console.log('=== FULL PAGE TEXT ===');
  console.log(text);
  
  // Find and click "MOSTRAR FICHAS"
  const mostrarBtn = page.locator('button:has-text("MOSTRAR")');
  console.log('\nMOSTRAR btn visible:', await mostrarBtn.isVisible().catch(() => false));
  if (await mostrarBtn.isVisible().catch(() => false)) {
    console.log('MOSTRAR text:', (await mostrarBtn.textContent()).trim());
    await mostrarBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    
    const t2 = await page.locator('body').innerText();
    console.log('\n=== AFTER MOSTRAR ===');
    console.log(t2);
    
    // Check for sheet list text
    console.log('\nHas NOVA FICHA:', t2.includes('NOVA FICHA'));
    console.log('Has suas fichas:', t2.includes('suas fichas'));
    console.log('Has SEM FICHAS:', t2.includes('SEM FICHAS'));
  }
  
  await browser.close();
})();
