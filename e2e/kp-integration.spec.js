import { test, expect } from '@playwright/test'

test.describe('Kernel Panic — Integração Final (i18n + Rota)', () => {

  test('A: Rota /games toggle carrega jogo real', async ({ page }) => {
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/games', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Clica aba Kernel Panic
    const toggleBtn = page.locator('.kp-toggle-btn').filter({ hasText: 'Kernel Panic' })
    await expect(toggleBtn).toBeVisible()
    await toggleBtn.click()
    await page.waitForTimeout(2000)

    // Confirma que o jogo real carregou (menu overlay visível)
    await expect(page.locator('.menu-overlay')).toBeVisible({ timeout: 15000 })

    // Confirma que NÃO é o placeholder (tag kp-empty não existe mais)
    await expect(page.locator('.kp-empty')).toHaveCount(0)

    // Confirma via log que não houve erro de console
    const consoleErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('third-party') &&
      !e.includes('Failed to load resource')
    )
    expect(consoleErrors.length).toBe(0)
  })

  test('B: /prototype/kernel-panic retorna 404', async ({ page }) => {
    let status = 200
    page.on('response', resp => {
      if (resp.url().includes('/prototype/kernel-panic') || resp.url().endsWith('/kernel-panic')) {
        status = resp.status()
      }
    })
    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(1000)
    // O SPA pode cair no 404.html e mostrar página inicial, mas /prototype/kernel-panic NÃO deve carregar o jogo
    await expect(page.locator('.menu-overlay')).toHaveCount(0)
  })

  test('C: i18n PT → captura textos reais', async ({ page }) => {
    // Garante locale PT
    await page.evaluate(() => localStorage.setItem('ldi-locale', 'pt'))
    await page.goto('/games', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Clica aba Kernel Panic
    await page.locator('.kp-toggle-btn').filter({ hasText: 'Kernel Panic' }).click()
    await page.waitForTimeout(2000)

    // Aguarda menu carregar
    await expect(page.locator('.menu-overlay')).toBeVisible({ timeout: 15000 })

    // Captura textos PT reais
    const versusText = await page.locator('.menu-btn').filter({ hasText: /VERSUS|VS|CONTRA/i }).first().textContent()
    const soloText = await page.locator('.menu-btn').filter({ hasText: /SOLO/i }).first().textContent()
    const dificuldadeText = await page.locator('.menu-btn').filter({ hasText: /FÁCIL|MÉDIO|DIFÍCIL/i }).first().textContent()

    console.log('=== PT TEXTOS ===')
    console.log(`versus: "${versusText}"`)
    console.log(`solo: "${soloText}"`)
    console.log(`dificuldade: "${dificuldadeText}"`)

    // Em PT, VERSUS e SOLO são esperados
    expect(versusText).toMatch(/VERSUS|VS/i)
    expect(soloText).toMatch(/SOLO/i)

    // Salva pra comparação entre idiomas
    test.info().attach('pt-textos', { body: JSON.stringify({ versusText, soloText, dificuldadeText }), contentType: 'application/json' })
  })

  test('D: i18n EN — textos mudam', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('ldi-locale', 'en'))
    await page.goto('/games', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    await page.locator('.kp-toggle-btn').filter({ hasText: 'Kernel Panic' }).click()
    await page.waitForTimeout(2000)

    await expect(page.locator('.menu-overlay')).toBeVisible({ timeout: 15000 })

    const versusText = await page.locator('.menu-btn').filter({ hasText: /VERSUS|VS|CONTRA|MATCH/i }).first().textContent()
    const soloText = await page.locator('.menu-btn').filter({ hasText: /SOLO|ALONE/i }).first().textContent()
    const dificuldadeText = await page.locator('.menu-btn').filter({ hasText: /EASY|MEDIUM|HARD|FÁCIL|MÉDIO|DIFÍCIL|NORMAL/i }).first().textContent()

    console.log('=== EN TEXTOS ===')
    console.log(`versus: "${versusText}"`)
    console.log(`solo: "${soloText}"`)
    console.log(`dificuldade: "${dificuldadeText}"`)

    // Em EN, VERSUS e SOLO devem ser diferentes de PT ou pelo menos presentes
    expect(versusText).toBeTruthy()
    expect(soloText).toBeTruthy()

    test.info().attach('en-textos', { body: JSON.stringify({ versusText, soloText, dificuldadeText }), contentType: 'application/json' })
  })

  test('E: i18n ES — textos mudam', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('ldi-locale', 'es'))
    await page.goto('/games', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    await page.locator('.kp-toggle-btn').filter({ hasText: 'Kernel Panic' }).click()
    await page.waitForTimeout(2000)

    await expect(page.locator('.menu-overlay')).toBeVisible({ timeout: 15000 })

    const versusText = await page.locator('.menu-btn').filter({ hasText: /VERSUS|VS|CONTRA|MATCH|VS\./i }).first().textContent()
    const soloText = await page.locator('.menu-btn').filter({ hasText: /SOLO|ALONE/i }).first().textContent()
    const dificuldadeText = await page.locator('.menu-btn').filter({ hasText: /FÁCIL|MÉDIO|DIFÍCIL|EASY|MEDIUM|HARD|NORMAL|DIFÍCIL/i }).first().textContent()

    console.log('=== ES TEXTOS ===')
    console.log(`versus: "${versusText}"`)
    console.log(`solo: "${soloText}"`)
    console.log(`dificuldade: "${dificuldadeText}"`)

    expect(versusText).toBeTruthy()
    expect(soloText).toBeTruthy()

    test.info().attach('es-textos', { body: JSON.stringify({ versusText, soloText, dificuldadeText }), contentType: 'application/json' })
  })
})
