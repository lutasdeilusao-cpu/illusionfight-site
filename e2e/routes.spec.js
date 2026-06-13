/**
 * routes.spec.js — Suíte de Testes de Rotas (Playwright)
 *
 * Lê as rotas do SITE_MAP.md (seção 2), classifica como públicas ou
 * autenticadas, navega em cada uma e falha se qualquer console.error
 * for disparado.
 *
 * Uso:
 *   npm run test:routes
 *   npx playwright test e2e/routes.spec.js
 */
import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE_MAP_PATH = path.resolve(__dirname, '..', 'SITE_MAP.md')

// ── Credenciais de teste ──────────────────────────────
// TODO: contas @teste.com precisam de recarga periódica de fichas.
//       Pode-se automatizar depois com uma rota admin que reseta fichas
//       para contas com is_test_account = true.
const TEST_EMAIL = 'conta6@teste.com'
const TEST_PASSWORD = '000000'

// ── IDs reais para rotas dinâmicas ────────────────────
const DYNAMIC_IDS = {
  '/personagens/:id': 'kim',
  '/livro/:id':       'capitulo-01',
  '/webtoon/:id':     '00',
}

// ── Rotas que exigem autenticação (LoginGate ou FichaGateRoute) ──
const AUTH_ROUTES = new Set([
  '/perfil',
  '/admin',
  '/prototype',
  '/games/toptrumps',
  '/games/toptrumps/lobby',
  '/games/toptrumps/multiplayer',
  '/games/ldi',
  '/games/ldi/create',
  '/games/ldi/game',
  '/games/ldi/combat',
  '/games/ldi/sheet',
  '/games/ldi/clues',
  '/games/ldi/end',
  '/games/ldi/puzzle',
  '/games/jackcandy',
  '/games/minigames',
  '/games/ldi-arena',
  '/games/ldi-tatics',
  '/games/pesadelo',
  '/games/duelo',
  '/games/tamagoshi',
])

// ── Rota 404 ──────────────────────────────────────────
const NOT_FOUND_ROUTE = '/rota-que-nao-existe'

// ═══════════════════════════════════════════════════════════════
//  PARSER do SITE_MAP.md
// ═══════════════════════════════════════════════════════════════

function parseRoutesFromSitemap() {
  const md = fs.readFileSync(SITE_MAP_PATH, 'utf-8')
  const lines = md.split('\n')

  let inSection2 = false
  let inTable = false
  const rawRoutes = []

  for (const line of lines) {
    // Marca início da seção 2
    if (/^##\s+2\./.test(line)) {
      inSection2 = true
      continue
    }
    // Sai ao encontrar seção 3
    if (inSection2 && /^##\s+3\./.test(line)) break
    if (!inSection2) continue

    // Detecta separador de tabela (|---|)
    if (/^\|[\s-]+\|[\s-]+\|/.test(line) && line.includes('---')) {
      inTable = true
      continue
    }

    if (inTable && line.startsWith('|')) {
      // Pula linhas de observação
      if (line.includes('📌') || line.includes('OBS')) continue

      const match = line.match(/^\|\s*`([^`]+)`/)
      if (match) {
        rawRoutes.push(match[1])
      }
    }
  }

  // Converte rotas com :id para valores reais e remove catch-all
  const resolved = []
  for (const route of rawRoutes) {
    if (route === '*' || route.startsWith('*')) continue // catch-all
    if (route.includes(':id')) {
      const resolvedRoute = route.replace(/:id/, DYNAMIC_IDS[route] || 'kim')
      resolved.push(resolvedRoute)
    } else {
      resolved.push(route)
    }
  }

  return resolved
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Navega para uma rota e captura console.errors.
 * Retorna array de mensagens de erro (vazio = sucesso).
 */
async function visitRoute(page, route, { alreadyLoggedIn = false } = {}) {
  const errors = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  // Listen also for uncaught exceptions
  const pageErrors = []
  page.on('pageerror', (err) => {
    pageErrors.push(err.message)
  })

  try {
    await page.goto(route, { waitUntil: 'load', timeout: 30_000 })
    // Aguarda processamento assíncrono (api calls, renders pendentes)
    await page.waitForTimeout(3000)
  } catch (err) {
    // Timeout ou erro de navegação — reporta
    errors.push(`NAVIGATION_ERROR: ${err.message}`)
  }

  // Se não logado e rota auth, o FichaGateRoute/LoginGate pode ter redirecionado — sem problemas
  return { errors, pageErrors }
}

/**
 * Faz login via formulário da página /login
 */
async function login(page) {
  await page.goto('/login', { waitUntil: 'load' })
  await page.waitForSelector('.auth-input', { timeout: 10_000 })
  const inputs = page.locator('.auth-input')
  await inputs.nth(0).fill(TEST_EMAIL)
  await inputs.nth(1).fill(TEST_PASSWORD)
  await page.locator('.auth-btn').click()

  // Aguarda redirecionamento para /perfil (indica login bem-sucedido)
  try {
    await page.waitForURL('**/perfil', { timeout: 15_000 })
  } catch {
    // Se falhou, tenta ver se há mensagem de erro na tela
    const erroEl = page.locator('.auth-erro')
    const erroText = await erroEl.textContent()
    throw new Error(`Login failed: ${erroText || 'unknown error'}`)
  }
}

// ═══════════════════════════════════════════════════════════════
//  TESTES
// ═══════════════════════════════════════════════════════════════

const allRoutes = parseRoutesFromSitemap()
const publicRoutes = allRoutes.filter((r) => !AUTH_ROUTES.has(r))
const authRoutes = allRoutes.filter((r) => AUTH_ROUTES.has(r))

// ── Resumo antes de rodar ──
console.log(`\n🧪 Rotas encontradas no SITE_MAP.md: ${allRoutes.length}`)
console.log(`   ├─ Públicas: ${publicRoutes.length}`)
console.log(`   ├─ Autenticadas: ${authRoutes.length}`)
console.log(`   └─ 404 catch-all: 1\n`)

// ──────────────────────────────────────
//  SUÍTE PÚBLICA
// ──────────────────────────────────────

test.describe('🗺️ Rotas Públicas', () => {
  for (const route of publicRoutes) {
    test(`✅ ${route}`, async ({ page }) => {
      const { errors, pageErrors } = await visitRoute(page, route)
      const all = [...errors, ...pageErrors]
      expect(all, `console.error em ${route}:\n${all.join('\n')}`).toEqual([])
    })
  }
})

// ──────────────────────────────────────
//  ROTA 404
// ──────────────────────────────────────

test.describe('🚫 Rota 404', () => {
  test(`✅ ${NOT_FOUND_ROUTE} (deve carregar NotFound sem errors)`, async ({ page }) => {
    const { errors, pageErrors } = await visitRoute(page, NOT_FOUND_ROUTE)
    const all = [...errors, ...pageErrors]
    expect(all, `console.error em 404:\n${all.join('\n')}`).toEqual([])
  })
})

// ──────────────────────────────────────
//  SUÍTE AUTENTICADA
// ──────────────────────────────────────

test.describe('🔒 Rotas Autenticadas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── Teste de gasto de ficha (conta6@teste.com tem is_test_account, saldo não deve mudar) ──
  test(`🎰 fichas: jogar Top Trumps não gasta ficha (conta de teste)`, async ({ page }) => {
    const errors = []
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
    const pageErrors = []
    page.on('pageerror', (err) => { pageErrors.push(err.message) })

    // 1. Lê saldo atual no /perfil (já estamos lá após login)
    await page.waitForSelector('.perfil-contador-valor', { timeout: 10_000 })
    const saldoBefore = await page.locator('.perfil-contador-valor').first().innerText()
    console.log(`[FICHAS] saldo antes: ${saldoBefore}`)

    // 2. Navega para /games/toptrumps
    await page.goto('/games/toptrumps', { waitUntil: 'load', timeout: 30_000 })
    await page.waitForTimeout(2000)

    // 3. Passa pelo FichaGateRoute — clica em "[ gastar 1 ficha ]"
    const fgrBtn = page.locator('.fgr-btn--primary')
    if (await fgrBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fgrBtn.click()
      await page.waitForTimeout(2000)
    }

    // 4. TopTrumps carregou — clica no modo Single Player
    await page.waitForSelector('.tt-modo-card', { timeout: 10_000 })
    await page.locator('.tt-modo-card').first().click()
    await page.waitForTimeout(1000)

    // 5. Seleciona número de turnos (primeiro botão disponível: 5)
    const turnoBtn = page.locator('.tt-config-turno-btn').first()
    await turnoBtn.waitFor({ state: 'visible', timeout: 5000 })
    await turnoBtn.click()
    await page.waitForTimeout(500)

    // 6. Clica "Jogar"
    const jogarBtn = page.locator('.tt-btn-jogar')
    await jogarBtn.waitFor({ state: 'visible', timeout: 5000 })
    await jogarBtn.click()
    await page.waitForTimeout(1000)

    // 7. DeckStartModal — seleciona "aleatório" e confirma
    const randomOption = page.locator('.tt-startdeck-opcao').last()
    await randomOption.waitFor({ state: 'visible', timeout: 5000 })
    await randomOption.click()
    await page.waitForTimeout(500)

    const confirmBtn = page.locator('.tt-startdeck-btn--confirm')
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    await confirmBtn.click()
    await page.waitForTimeout(2000)

    // 8. Verifica se o jogo carregou sem erros
    const all = [...errors, ...pageErrors]
    expect(all, `console.error durante fluxo Top Trumps:\n${all.join('\n')}`).toEqual([])

    // 9. Volta ao /perfil e lê saldo novamente
    await page.goto('/perfil', { waitUntil: 'load', timeout: 30_000 })
    await page.waitForSelector('.perfil-contador-valor', { timeout: 10_000 })
    const saldoAfter = await page.locator('.perfil-contador-valor').first().innerText()
    console.log(`[FICHAS] saldo depois: ${saldoAfter}`)

    // 10. Conta de teste (is_test_account = true) — saldo não deve ter mudado
    expect(saldoAfter, `Saldo de fichas mudou indevidamente: ${saldoBefore} → ${saldoAfter}`).toBe(saldoBefore)
  })

  for (const route of authRoutes) {
    test(`✅ ${route} (autenticado)`, async ({ page }) => {
      const { errors, pageErrors } = await visitRoute(page, route, {
        alreadyLoggedIn: true,
      })
      const all = [...errors, ...pageErrors]
      expect(all, `console.error em ${route}:\n${all.join('\n')}`).toEqual([])
    })
  }
})
