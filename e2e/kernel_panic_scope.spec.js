import { test, expect } from '@playwright/test'

const SCREENSHOT_DIR = 'test-results/kp-scope'

test.describe('Kernel Panic — Teste de Escopo (Etapa D)', () => {

  test('A: Rota carrega sem erros', async ({ page }) => {
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    expect(errors.length).toBe(0)
    await expect(page.locator('.menu-overlay')).toBeVisible()
    await expect(page.locator('.menu-logo')).toContainText('KERNEL PANIC')
  })

  test('B: Menu → iniciar partida local', async ({ page }) => {
    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const btnVersus = page.locator('.menu-btn').filter({ hasText: 'VERSUS' })
    await btnVersus.click()
    await page.waitForTimeout(1000)

    await expect(page.locator('.perigo-row')).toBeVisible()
    await expect(page.locator('.main-grid')).toBeVisible()
  })

  test('C: Menu → iniciar solo fácil', async ({ page }) => {
    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const btnSolo = page.locator('.menu-btn').filter({ hasText: 'SOLO' })
    await btnSolo.click()
    await page.waitForTimeout(500)

    const btnFacil = page.locator('.menu-btn').filter({ hasText: 'FÁCIL' })
    await btnFacil.click()
    await page.waitForTimeout(1000)

    await expect(page.locator('#root')).toContainText('Ciclo')
  })

  test('D: Handoff entre jogadores (modo local)', async ({ page }) => {
    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const btnVersus = page.locator('.menu-btn').filter({ hasText: 'VERSUS' })
    await btnVersus.click()
    await page.waitForTimeout(2500)

    // Handoff aparece (primeiro jogador)
    await expect(page.locator('.handoff-overlay')).toBeVisible({ timeout: 8000 })

    // Salva qual jogador apareceu
    const firstPlayer = await page.locator('.handoff-player').textContent()

    // Clica PRONTO (force: true para evitar interceptação de overlays)
    await page.locator('.handoff-btn').click({ force: true })
    await page.waitForTimeout(1500)

    // Verifica que o handoff sumiu
    await expect(page.locator('.handoff-overlay')).not.toBeVisible({ timeout: 5000 })

    // Passa o turno do jogador atual
    const passBtn = page.locator('.btn-pass').first()
    await expect(passBtn).toBeVisible({ timeout: 5000 })
    await passBtn.click({ force: true })
    await page.waitForTimeout(2000)

    // Segundo handoff aparece (outro jogador)
    await expect(page.locator('.handoff-overlay')).toBeVisible({ timeout: 8000 })
    const secondPlayer = await page.locator('.handoff-player').textContent()

    // Verifica que os jogadores são diferentes
    expect(firstPlayer).not.toBe(secondPlayer)
    expect(firstPlayer).toMatch(/J[12]/)
    expect(secondPlayer).toMatch(/J[12]/)
  })

  test('E: IA animada (solo fácil) — verifica passos intermediários', async ({ page }) => {
    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const btnSolo = page.locator('.menu-btn').filter({ hasText: 'SOLO' })
    await btnSolo.click()
    await page.waitForTimeout(500)

    const btnFacil = page.locator('.menu-btn').filter({ hasText: 'FÁCIL' })
    await btnFacil.click()
    await page.waitForTimeout(1500)

    await page.screenshot({ path: `${SCREENSHOT_DIR}-inicio.png`, fullPage: true })

    // Passa o turno do jogador humano para dar vez à IA
    const passBtn = page.locator('.btn-pass').first()
    await expect(passBtn).toBeVisible({ timeout: 5000 })
    await passBtn.click()
    await page.waitForTimeout(400)

    // Captura múltiplos snapshots durante a animação da IA
    await page.screenshot({ path: `${SCREENSHOT_DIR}-ia-step1.png`, fullPage: true })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOT_DIR}-ia-step2.png`, fullPage: true })
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SCREENSHOT_DIR}-ia-step3.png`, fullPage: true })
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${SCREENSHOT_DIR}-ia-fim.png`, fullPage: true })

    // Verifica se a IA executou (volta pro jogador humano ou mostra resultado)
    await expect(page.locator('.btn-pass').first()).toBeVisible({ timeout: 15000 })
  })

  test('F: Mobile 375px — layout responsivo', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/prototype/kernel-panic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Menu deve estar visível em 375px
    await expect(page.locator('.menu-logo')).toBeVisible()
    await expect(page.locator('.menu-btn').first()).toBeVisible()

    // Inicia partida local
    const btnVersus = page.locator('.menu-btn').filter({ hasText: 'VERSUS' })
    await btnVersus.click()
    await page.waitForTimeout(3000)

    // Captura screenshot do jogo em 375px (com ou sem handoff)
    await page.screenshot({ path: `${SCREENSHOT_DIR}-mobile-375px.png`, fullPage: true })

    // Verifica elementos do tabuleiro visíveis em mobile
    await expect(page.locator('.perigo-row')).toBeVisible()
    await expect(page.locator('.main-grid')).toBeVisible()
    await expect(page.locator('.info-bar')).toBeVisible()
  })
})
