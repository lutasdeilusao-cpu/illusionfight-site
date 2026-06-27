import { test, expect } from '@playwright/test'

test('Reward test route — renderiza sem crash', async ({ page }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await page.goto('http://localhost:5173/games/toptrumps/v2/reward-test')
  await page.waitForTimeout(3000)
  expect(errors.filter(e => e.includes('Error') || e.includes('undefined') || e.includes('ReferenceError'))).toHaveLength(0)
  const body = await page.textContent('body')
  expect(body.length).toBeGreaterThan(10)
  console.log('Reward test OK, errors:', errors)
})

test('Reward test — 3 cartas + selecionar + confirmar', async ({ page }) => {
  await page.goto('http://localhost:5173/games/toptrumps/v2/reward-test')
  await page.waitForTimeout(3000)

  // Check 3 cards exist
  const cartas = await page.locator('.tt-recompensa-card').count()
  console.log('Cartas encontradas:', cartas)
  expect(cartas).toBe(3)

  // Click first card
  await page.locator('.tt-recompensa-card').first().click()
  await page.waitForTimeout(500)

  // Confirm button should be enabled
  const btnConfirmar = page.locator('.tt-btn-confirmar')
  await expect(btnConfirmar).not.toBeDisabled()

  // Click confirm
  await btnConfirmar.click()
  await page.waitForTimeout(1000)

  // Should show confirmation text
  const body = await page.textContent('body')
  expect(body).toContain('confirmada')
  console.log('Reward confirm OK')
})

test('V2 menu — renderiza sem crash', async ({ page }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await page.goto('http://localhost:5173/games/toptrumps/')
  await page.waitForTimeout(5000)
  expect(errors.filter(e => e.includes('ReferenceError'))).toHaveLength(0)
  const body = await page.textContent('body')
  expect(body).toContain('TOP TRUMPS')
  console.log('V2 menu OK, errors:', errors)
})

test('Legacy — renderiza sem crash', async ({ page }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await page.goto('http://localhost:5173/games/toptrumps/legacy')
  await page.waitForTimeout(5000)
  expect(errors.filter(e => e.includes('ReferenceError'))).toHaveLength(0)
  const body = await page.textContent('body')
  expect(body.length).toBeGreaterThan(10)
  console.log('Legacy OK, errors:', errors)
})
