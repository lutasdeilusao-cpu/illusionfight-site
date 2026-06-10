const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  // 1. Login
  await page.goto('http://localhost:5178/login');
  await new Promise(r => setTimeout(r, 2000));
  
  const allInputs = page.locator('input');
  const count = await allInputs.count();
  console.log('Input count:', count);
  
  for (let i = 0; i < count; i++) {
    const placeholder = await allInputs.nth(i).getAttribute('placeholder');
    const type = await allInputs.nth(i).getAttribute('type');
    console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
  }
  
  // Try filling inputs
  if (count >= 2) {
    await allInputs.nth(0).click();
    await allInputs.nth(0).fill('gramikgames@gmail.com');
    await allInputs.nth(1).click();
    await allInputs.nth(1).fill('Vidanerd123$');
    console.log('Filled login form');
  }
  
  // Click login button
  const buttons = page.locator('button');
  const btnCount = await buttons.count();
  console.log('Button count:', btnCount);
  for (let i = 0; i < btnCount; i++) {
    const text = await buttons.nth(i).textContent();
    console.log(`Button ${i}: "${text.trim()}"`);
  }
  
  // Find and click ENTRAR
  const entrarBtn = page.locator('button').filter({ hasText: /ENTRAR|Sign in/i }).first();
  const visible = await entrarBtn.isVisible();
  console.log('Entrar btn visible:', visible);
  if (visible) {
    await entrarBtn.click();
    console.log('Clicked ENTRAR');
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log('After login URL:', page.url());
  
  // 2. Go to Arena
  await page.goto('http://localhost:5178/games/ldi-arena');
  await new Promise(r => setTimeout(r, 3000));
  
  const body = await page.locator('body').textContent();
  console.log('Arena page:', body.substring(0, 1000));
  
  // Check if we see Portuguese text
  const checks = ['LDI ARENA', 'NOVA FICHA', 'suas fichas', 'carregando', 'SEM FICHAS', 'crie sua ficha'];
  for (const check of checks) {
    console.log(`  ${body.includes(check) ? '✅' : '❌'} "${check}"`);
  }
  
  await page.screenshot({ path: 'test-arena.png', fullPage: true });
  console.log('Screenshot saved');
  
  await browser.close();
})();
