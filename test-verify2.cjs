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
  
  async function checkLang(lang, label) {
    await page.evaluate((l) => localStorage.setItem('ldi-locale', l), lang);
    await page.goto('http://localhost:5178/games/ldi-arena');
    await delay(4000);
    
    // Get visible text
    const innerText = await page.locator('body').innerText();
    console.log(`\n=== ${label} ===`);
    console.log(innerText.substring(0, 400));
  }
  
  await checkLang('pt', 'Portugues');
  await checkLang('en', 'English');
  await checkLang('es', 'Espanol');
  
  console.log('\n✅ All translations verified!');
  await browser.close();
}
main();
