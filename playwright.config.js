/**
 * Playwright Config — Suíte de Testes de Rotas
 *
 * Uso: npx playwright test        # roda todos os testes
 *      npm run test:routes        # alias do comando acima
 *
 * Levanta o servidor Vite dev automaticamente.
 * Escuta console.error em cada rota — falha se houver.
 */
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  retries: 0,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    cwd: '.',
  },
})
