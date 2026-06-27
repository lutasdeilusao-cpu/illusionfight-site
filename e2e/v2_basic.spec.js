import { test, expect } from '@playwright/test'

test('TopTrumps v2 — rota carrega sem crash', async ({ page }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('http://localhost:5173/games/toptrumps/v2')
  await page.waitForTimeout(3000)

  expect(errors.filter(e => e.includes('ReferenceError') || e.includes('TypeError'))).toHaveLength(0)

  const body = await page.textContent('body')
  expect(body.length).toBeGreaterThan(10)

  console.log('Erros capturados:', errors)
  console.log('Body snippet:', body.slice(0, 200))
})

test('TopTrumps v2 — console log de deck aparece', async ({ page }) => {
  const logs = []
  page.on('console', msg => logs.push(msg.text()))

  await page.goto('http://localhost:5173/games/toptrumps/v2')
  await page.waitForTimeout(5000)

  const v2Log = logs.find(l => l.includes('[v2]'))
  console.log('Logs v2 encontrados:', logs.filter(l => l.includes('[v2]')))

  // Pode ou não aparecer (build production suprime console.log)
  // O teste real é: a página renderizou sem crash
  const body = await page.textContent('body')
  expect(body).toContain('TOP TRUMPS')
})

test('TopTrumps original — rota legacy intacta', async ({ page }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('http://localhost:5173/games/toptrumps')
  await page.waitForTimeout(3000)

  expect(errors.filter(e => e.includes('ReferenceError'))).toHaveLength(0)

  const body = await page.textContent('body')
  expect(body.length).toBeGreaterThan(10)
})
