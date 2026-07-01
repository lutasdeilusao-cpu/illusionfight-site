/**
 * Teste: Capítulo 1 — glob path + encoding
 *
 * Verifica:
 *   1. /livro/capitulo-01 carrega conteúdo markdown (não mostra "não encontrado")
 *   2. /livro/capitulo-02 mostra "não publicado" (bloqueado)
 *   3. /webtoon/00 não tem mojibake no título
 *
 * Uso: npx playwright test sandbox/test-capitulo1.mjs --reporter=list
 */

import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:4173'

test('cap1 loads content', async ({ page }) => {
  await page.goto(`${BASE}/livro/capitulo-01`)
  await page.waitForSelector('.livro-capitulo__content', { timeout: 15000 })
  const text = await page.textContent('.livro-capitulo__content')
  expect(text.length).toBeGreaterThan(100)
  expect(text).not.toContain('não encontrado')
})

test('cap2 blocked (not published)', async ({ page }) => {
  await page.goto(`${BASE}/livro/capitulo-02`)
  await page.waitForSelector('.livro-capitulo__erro', { timeout: 10000 })
  const text = await page.textContent('body')
  expect(text).toContain('não')
})

test('webtoon ep00 title clean (no mojibake)', async ({ page }) => {
  await page.goto(`${BASE}/webtoon/00`)
  await page.waitForSelector('.webtoon-ep-header__title', { timeout: 10000 })
  const title = await page.textContent('.webtoon-ep-header__title')
  // Deve conter o travessão — limpo, não â€”
  expect(title).not.toContain('â')
})
