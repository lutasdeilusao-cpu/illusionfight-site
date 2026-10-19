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
        fileName: 'docs/webshard/especiais/HALLOWEEN_ROTEIRO_OFICIAL.md',
        source: readFileSync(new URL('./docs/WEBSHARD/Especiais/HALLOWEEN_ROTEIRO_OFICIAL.md', import.meta.url), 'utf8'),
      })
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
  // O servidor de desenvolvimento não vigia o que não é código-fonte: a pasta do
  // deploy (milhares de arquivos do site compilado), o build e o grafo do graphify.
  // Vigiar a pasta do deploy segurava arquivos que o git do deploy precisa apagar.
  server: {
    watch: { ignored: ['**/.gh-pages-worktree/**', '**/dist/**', '**/graphify-out/**'] },
  },
})
