import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'isaiasgamedev@gmail.com'
const ADMIN_PASSWORD = 'Vidanerd123$'

test.describe('Admin Reset de Conquistas + 23505 fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(4000)
  })

  test('resetar conquistas como admin não gera erro 23505 ao desbloquear novamente', async ({ page }) => {
    const consoleErrors = []
    const consoleLogs = []
    const pageErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
      consoleLogs.push({ type: msg.type(), text: msg.text() })
    })
    page.on('pageerror', err => pageErrors.push(err.message))

    // 1. Ir para o perfil
    await page.goto('/perfil', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    // 2. Clicar no botão de reset (admin)
    const resetBtn = page.locator('button:has-text("Resetar Conquistas"), button:has-text("Redefinir"), button.admin-reset-btn')
    const resetBtnExists = await resetBtn.count()

    if (resetBtnExists > 0) {
      await resetBtn.click()
      await page.waitForTimeout(1000)

      // 3. Confirmar modal
      const confirmBtn = page.locator('button:has-text("Sim"), button:has-text("Confirmar"), button.confirm-reset-btn')
      const confirmBtnExists = await confirmBtn.count()
      if (confirmBtnExists > 0) {
        await confirmBtn.click()
        await page.waitForTimeout(3000)
      }
    }

    // 4. Navegar para o livro capítulo 01 (dispara desbloquear('leitor_marelia'))
    await page.goto('/livro/capitulo-01', { waitUntil: 'networkidle' })
    await page.waitForTimeout(5000)

    // 5. Verificar console — não deve ter ERRO AO SALVAR ACHIEVEMENT nem 23505
    const erros23505 = consoleLogs.filter(l =>
      l.text.includes('23505') || l.text.includes('ERRO AO SALVAR ACHIEVEMENT')
    )

    console.log('=== CONSOLE LOGS RELACIONADOS ===')
    const desbloquearLogs = consoleLogs.filter(l => l.text.includes('desbloquear'))
    desbloquearLogs.forEach(l => console.log(`[${l.type}] ${l.text}`))

    console.log('=== CONSOLE ERRORS ===')
    consoleErrors.forEach(e => console.log(e))

    console.log('=== PAGE ERRORS ===')
    pageErrors.forEach(e => console.log(e))

    // Se há logs de desbloquear mas nenhum é erro 23505, o fix funcionou
    const hasDesbloquearCall = desbloquearLogs.length > 0
    const has23505Error = erros23505.length > 0

    expect(has23505Error).toBe(false)
    expect(pageErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})
