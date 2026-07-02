import { test } from '@playwright/test'

const ADMIN_EMAIL = 'isaiasgamedev@gmail.com'
const ADMIN_PASSWORD = 'Vidanerd123$'

test('prova visual do pop-up pós-reset', async ({ page }) => {
  const logs = []
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }))
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }))

  // Login
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(6000)

  // Reset via REST API
  await page.evaluate(async () => {
    const raw = localStorage.getItem('sb-dvxfrzixtetdzmdrzkpx-auth-token')
    if (!raw) return
    const session = JSON.parse(raw)
    const token = session.access_token
    const userId = session.user?.id
    await fetch('https://dvxfrzixtetdzmdrzkpx.supabase.co/rest/v1/user_achievements?user_id=eq.' + userId, {
      method: 'DELETE',
      headers: {
        'apikey': 'sb_publishable_mchBnTZ8DNOJvsVdIPrgqw_DSFHXBa0',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
  })

  // Limpar notificação
  await page.evaluate(() => {
    localStorage.removeItem('ldi-notif-last-time')
    localStorage.removeItem('ldi-notif-queue')
  })

  // Navegar para capítulo
  await page.goto('/livro/capitulo-01', { waitUntil: 'networkidle' })

  // Capturar em vários momentos
  for (const delay of [1000, 2000, 3000, 4000, 5000]) {
    await page.waitForTimeout(1000)
    const count = await page.locator('.achievement-overlay').count()
    let visible = false
    if (count > 0) visible = await page.locator('.achievement-overlay').first().isVisible()
    if (count > 0 || visible) {
      await page.screenshot({ path: `test-results/popup-delay-${delay}ms.png`, fullPage: false })
    }
    console.log(`[TEST] t=${delay}ms overlay count=${count} visible=${visible}`)
  }

  // Logs relevantes
  const relevant = logs.filter(l =>
    l.text.includes('desbloquear') ||
    l.text.includes('ERRO') ||
    l.text.includes('23505') ||
    l.text.includes('[Reset]') ||
    l.text.includes('achievement') ||
    l.text.includes('queu') ||
    l.text.includes('notif')
  )
  console.log('=== LOGS ===')
  relevant.forEach(l => console.log(`[${l.type}] ${l.text}`))

  const local = await page.evaluate(() => ({
    queue: localStorage.getItem('ldi-notif-queue'),
    lastTime: localStorage.getItem('ldi-notif-last-time'),
  }))
  console.log('=== LOCALSTORAGE === ' + JSON.stringify(local))
})
