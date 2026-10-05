import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

export default defineConfig({
  base: '/',
  plugins: [react(), {
    name: 'webshard-docs',
    apply: 'build',
    generateBundle() {
      for (const name of ['WEBSHARD_GUIA_DE_PRODUCAO.md', 'WEBSHARD_REFERENCIAS_E_PROCESSO.md']) {
        this.emitFile({
          type: 'asset',
          fileName: `docs/webshard/${name}`,
          source: readFileSync(new URL(`./docs/LDI/${name}`, import.meta.url), 'utf8'),
        })
      }
    },
  }],
  build: {
    sourcemap: true,
  },
})
