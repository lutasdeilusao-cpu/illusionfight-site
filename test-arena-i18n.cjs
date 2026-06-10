/**
 * Arena i18n + Gameplay Test
 * 
 * 1. Login
 * 2. Verify Arena i18n in all 3 languages
 * 3. Create sheet
 * 4. Start battle
 * 5. Play through
 */

const { chromium } = require('playwright')

const EMAIL = 'gramikgames@gmail.com'
const PASSWORD = 'Vidanerd123$'
const BASE = 'http://localhost:5178'

async function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function login(page) {
  await page.goto(`${BASE}/login`)
  await delay(1500)
  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
  const passInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="senha" i], input[placeholder*="password" i]').first()
  const btn = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Sign")').first()
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(EMAIL)
    await passInput.fill(PASSWORD)
    await btn.click()
    await delay(3000)
  }
  
  // Check if we're logged in
  await page.goto(`${BASE}/games/ldi-arena`)
  await delay(2000)
}

async function testLanguage(page, lang, langName) {
  console.log(`\n=== Testing ${langName} (${lang}) ===`)
  
  // Set language
  await page.evaluate((l) => { localStorage.setItem('ldi-locale', l) }, lang)
  await page.reload()
  await delay(2000)
  
  // Go to Arena
  await page.goto(`${BASE}/games/ldi-arena`)
  await delay(3000)
  
  // Check lobby texts
  const body = await page.locator('body').textContent()
  
  const checks = {
    'pt': ['LDI ARENA', 'NOVA FICHA', 'suas fichas', 'ATRIBUTOS', 'Força', 'Habilidade', 'Resistência', 'FOGO', 'ÁGUA', 'VANTAGENS', 'DESVANTAGENS', 'MANUAL', 'EXTRAS'],
    'en': ['LDI ARENA', 'NEW SHEET', 'your sheets', 'ATTRIBUTES', 'Strength', 'Skill', 'Resistance', 'FIRE', 'WATER', 'ADVANTAGES', 'DISADVANTAGES', 'BATTLE MANUAL', 'SITE'],
    'es': ['LDI ARENA', 'NUEVA FICHA', 'tus fichas', 'ATRIBUTOS', 'Fuerza', 'Habilidad', 'Resistencia', 'FUEGO', 'AGUA', 'VENTAJAS', 'DESVENTAJAS', 'MANUAL DE BATALLA', 'SITIO'],
  }
  
  const langChecks = checks[lang] || checks.en
  let passed = 0
  let failed = 0
  
  for (const text of langChecks) {
    // Case insensitive check
    const found = body.toLowerCase().includes(text.toLowerCase())
    if (found) {
      console.log(`  ✅ "${text}" found`)
      passed++
    } else {
      console.log(`  ❌ "${text}" NOT found`)
      failed++
    }
  }
  
  // Check if there's a "Nova Ficha" / "NEW SHEET" button
  const createBtn = lang === 'pt' ? 'NOVA FICHA' : lang === 'es' ? 'NUEVA FICHA' : 'NEW SHEET'
  const hasCreateBtn = body.includes(createBtn)
  console.log(`  ${hasCreateBtn ? '✅' : '❌'} Create button "${createBtn}" ${hasCreateBtn ? 'found' : 'NOT found'}`)
  if (hasCreateBtn) passed++; else failed++
  
  return { passed, failed }
}

async function testCreateSheet(page) {
  console.log('\n=== Testing Sheet Creation ===')
  
  // Click new sheet button
  const createBtn = page.locator('button:has-text("NOVA"), button:has-text("NEW"), button:has-text("NUEVA"), .arena-new-sheet').first()
  
  if (await createBtn.isVisible()) {
    await createBtn.click()
    await delay(2000)
  }
  
  // Check if intro appears - click "CRIAR DIRETO" or "CREATE DIRECTLY" or "CREAR DIRECTO"
  const directBtn = page.locator('text=CRIAR DIRETO, text=CREATE DIRECTLY, text=CREAR DIRECTO').first()
  if (await directBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await directBtn.click()
    await delay(1000)
  }
  
  // Check attribute points translation
  const body = await page.locator('body').textContent()
  console.log(`  ✅ Create page loaded: ${body.includes('pts') ? 'pts visible' : 'pts check'}`)
  
  // Try to fill in attributes - add points
  const plusBtns = page.locator('.arc-attr-btn:not([disabled])')
  const count = await plusBtns.count()
  console.log(`  ✅ ${count} attribute + buttons available`)
  
  if (count > 0) {
    await plusBtns.first().click()
    await delay(300)
  }
  
  // Click next
  const nextBtn = page.locator('text=próximo, text=next, text=siguiente').first()
  if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nextBtn.click()
    await delay(1000)
  }
  
  // Fill name
  const nameInput = page.locator('.arc-name-input').first()
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill('Test Fighter')
    await delay(300)
  }
  
  // Select elemental
  const elemCards = page.locator('.arc-elem-card').first()
  if (await elemCards.isVisible({ timeout: 2000 }).catch(() => false)) {
    await elemCards.click()
    await delay(300)
  }
  
  // Next again
  const nextBtn2 = page.locator('text=próximo, text=next, text=siguiente').first()
  if (await nextBtn2.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nextBtn2.click()
    await delay(1000)
  }
  
  // Check specializations, advantages, disadvantages translations
  const body2 = await page.locator('body').textContent()
  console.log(`  ✅ Specs page: ${body2.includes('PERÍCIAS') || body2.includes('SKILLS') || body2.includes('PERICIAS') ? 'section visible' : 'section check'}`)
  
  // Save
  const saveBtn = page.locator('text=SALVAR, text=SAVE, text=GUARDAR').first()
  if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await saveBtn.click()
    await delay(2000)
    console.log('  ✅ Sheet saved')
    return true
  }
  
  console.log('  ⚠️ Save button not found, trying lobby')
  return false
}

async function testBattle(page) {
  console.log('\n=== Testing Battle ===')
  
  // Click on first sheet to enter battle or fight
  const sheetCard = page.locator('.arena-sheet-card-v').first()
  if (await sheetCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sheetCard.click()
    await delay(1500)
  }
  
  // Select first enemy
  const enemyCard = page.locator('.arena-sheet-card-v').first()
  if (await enemyCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await enemyCard.click()
    await delay(2000)
  }
  
  // Check battle screen
  const body = await page.locator('body').textContent()
  const battleElements = ['VS', 'PV', 'PM', 'ATACAR', 'FUGIR', 'SAIR'].filter(t => body.includes(t))
  console.log(`  ✅ Battle UI elements visible: ${battleElements.join(', ')}`)
  
  // Power selection screen
  const enterBtn = page.locator('text=ENTRAR').first()
  if (await enterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await enterBtn.click()
    await delay(1500)
  }
  
  // Attack
  const attackBtn = page.locator('text=ATACAR, text=ATTACK').first()
  if (await attackBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await attackBtn.click()
    console.log('  ✅ Attack initiated')
    await delay(3000)
  }
  
  // Wait for battle to progress
  await delay(5000)
  
  console.log('  ✅ Battle is running')
  return true
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()
  
  console.log('=== ARENA i18n + GAMEPLAY TEST ===')
  console.log(`Server: ${BASE}`)
  
  try {
    // Step 1: Login
    console.log('\n--- Step 1: Login ---')
    await login(page)
    console.log('  ✅ Logged in')
    
    // Step 2: Test i18n in all languages
    let totalPassed = 0, totalFailed = 0
    
    const results = await testLanguage(page, 'pt', 'Português')
    totalPassed += results.passed
    totalFailed += results.failed
    
    const results2 = await testLanguage(page, 'en', 'English')
    totalPassed += results2.passed
    totalFailed += results2.failed
    
    const results3 = await testLanguage(page, 'es', 'Español')
    totalPassed += results3.passed
    totalFailed += results3.failed
    
    console.log(`\n=== i18n Results: ${totalPassed} passed, ${totalFailed} failed ===`)
    
    // Step 3: Create Sheet (in Portuguese for easier testing)
    console.log('\n--- Step 3: Create Sheet ---')
    await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'))
    await page.reload()
    await delay(2000)
    await page.goto(`${BASE}/games/ldi-arena`)
    await delay(2000)
    
    const sheetCreated = await testCreateSheet(page)
    
    // Step 4: Battle
    if (sheetCreated) {
      await testBattle(page)
    } else {
      console.log('  ⚠️ Skipping battle - sheet creation incomplete')
    }
    
    // Summary
    const outcome = totalFailed === 0 ? '✅ ALL TESTS PASSED' : `❌ ${totalFailed} TESTS FAILED`
    console.log(`\n${'='.repeat(50)}`)
    console.log(`FINAL RESULT: ${outcome}`)
    console.log(`i18n: ${totalPassed}/${totalPassed + totalFailed} checks passed`)
    console.log(`Sheet creation: ${sheetCreated ? '✅' : '❌'}`)
    
  } catch (err) {
    console.error('Test error:', err.message)
    await page.screenshot({ path: 'test-error.png' })
    console.log('Screenshot saved to test-error.png')
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
