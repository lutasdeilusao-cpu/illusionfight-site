import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

export default defineConfig({
  base: '/',
  plugins: [react(), {
    name: 'webshard-docs',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'docs/webshard/WEBSHARD_GUIA_DE_PRODUCAO.md',
        source: readFileSync(new URL('./docs/WEBSHARD/WEBSHARD_GUIA_DE_PRODUCAO.md', import.meta.url), 'utf8'),
      })
    },
  }],
  build: {
    sourcemap: true,
  },
})
