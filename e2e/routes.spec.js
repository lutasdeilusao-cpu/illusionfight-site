import { test, expect } from '@playwright/test'

const PUBLIC_ROUTES = [
  '/',
  '/personagens',
  '/personagens/kim',
  '/livro',
  '/webtoon',
  '/musicas',
  '/mundo',
  '/games',
  '/autor',
  '/quiz',
  '/leaderboard',
]

const AUTH_ROUTES = [
  '/login',
  '/cadastro',
  '/perfil',
  '/assinar',
  '/custos',
  '/games/toptrumps',
  '/games/ldi',
  '/games/jackcandy',
  '/games/minigames',
  '/games/ldi-arena',
  '/games/pesadelo',
  '/games/tamagoshi',
  '/games/toptrumps/lobby',
]

const ADMIN_ROUTES = [
  '/admin',
  '/prototype',
  '/prototype/srgrm',
  '/prototype/arenatestbed',
]

const TEST_EMAIL = 'conta@teste.com'
const TEST_PASSWORD = '000000'
const ADMIN_EMAIL = 'isaiasgamedev@gmail.com'
const ADMIN_PASSWORD = 'Vidanerd123$'

const ROUTE_PUBLIC = 'public'
const ROUTE_AUTH = 'auth'
const ROUTE_ADMIN = 'admin'

test.describe('Rotas Públicas', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} carrega sem erro`, async ({ page }) => {
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      page.on('pageerror', err => errors.push(err.message))

      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)

      expect(errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource')
      )).toEqual([])
      expect(page.url()).not.toContain('404')
    })
  }
})

test.describe('Rotas Autenticadas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
  })

  for (const route of AUTH_ROUTES) {
    test(`${route} carrega após login`, async ({ page }) => {
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      page.on('pageerror', err => errors.push(err.message))

      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)

      expect(errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource')
      )).toEqual([])
    })
  }
})

test.describe('Rotas Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
  })

  for (const route of ADMIN_ROUTES) {
    test(`${route} carrega como admin`, async ({ page }) => {
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      page.on('pageerror', err => errors.push(err.message))

      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)

      expect(errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource')
      )).toEqual([])
    })
  }
})
