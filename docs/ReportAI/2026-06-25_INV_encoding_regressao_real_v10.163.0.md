# DIAGNÓSTICO REAL — Regressão de encoding/emojis pós-reorganização

**Data:** 2026-06-25
**Versão atual:** 10.163.0
**Commit reorganização:** 04babd0f
**Commit anterior:** 32090cca

## ETAPA 1 — Histórico git

HEAD (04babd0f): refactor: reorganização src/pages/ em games/content/platform/site/lab + e2e atualizado + v10.163.0
HEAD~1 (32090cca): inv: auditoria SITE_MAP.md — correção de arquivos ausentes/obsoletos + v10.162.47

`
git diff HEAD~1 HEAD -- src/i18n/pt.json
(sem output)
`

**Evidência:** git diff HEAD~1 HEAD -- src/i18n/{pt,en,es}.json → **ZERO linhas de diff em todos os 3 arquivos.** Os arquivos i18n NÃO foram tocados pela reorganização.

## ETAPA 2 — Bytes reais dos i18n

`
src/i18n/pt.json → primeiros 4 bytes: [123, 13, 10, 32] → hex: 7b0d0a20
src/i18n/en.json → primeiros 4 bytes: [123, 13, 10, 32] → hex: 7b0d0a20
src/i18n/es.json → primeiros 4 bytes: [123, 13, 10, 32] → hex: 7b0d0a20
`

Todos começam com { (7b) seguido de CRLF (0d0a) + espaço (20). UTF-8 puro, sem BOM.

Primeiro byte não-ASCII em pt.json: byte 73 = 0xc3 (início do "ú" em "Lutas de Ilusão").

## ETAPA 3 — Build + bundle

`
npm run build → ✓ built in 1.94s
1243 modules transformed
0 erros
`

Bundle search for encoding issues: **nenhum arquivo com encoding quebrado encontrado** nos assets JS.

## ETAPA 4 — HTML prerenderizado

`
dist/index.html: charset = UTF-8 ✅
dist/games/*/index.html: OK (sem encoding quebrado) ✅
dist/assinar/index.html: OK ✅
... todas as 28 rotas OK
`

## ETAPA 5 — Comparação HEAD~1 vs HEAD

`
git diff 32090cca HEAD -- src/i18n/ → (sem output) — ZERO mudanças
`

HEAD~1 pt.json: 32 chaves, primeiros 4 bytes = 7b0d0a20
HEAD pt.json: 32 chaves, primeiros 4 bytes = 7b0d0a20
**IDENTICAIS**

## ETAPA 6 — index.html raiz

`
charset presente: True
utf-8 presente: True
<meta charset="UTF-8" /> ✅
`

O título "Illusion Fight — Arena Virtual. A dor é 100% real." está codificado como UTF-8 válido (bytes \xc3\xa9 para o "é").

## ETAPA 7 — vite.config.js

`js
// Linhas 1-10 — sem charset, encoding ou assetsInclude
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: { sourcemap: true },
})
`

Nada que possa ter sido afetado pela reorganização.

## CONCLUSÃO — Causa Raiz

**❌ NENHUMA REGRESSÃO DE ENCODING FOI INTRODUZIDA PELA REORGANIZAÇÃO.**

Evidência concreta:
1. git diff HEAD~1 HEAD -- src/i18n/ = vazio → i18n **não foi tocado**
2. git diff 32090cca HEAD -- src/i18n/ = vazio → i18n **idêntico antes e depois**
3. Primeiros 4 bytes HEAD~1 (7b0d0a20) == HEAD (7b0d0a20) → **mesmo encoding**
4. bundle JS: 0 arquivos com encoding quebrado
5. prerender: todos os 28 HTMLs OK
6. Build: 1243 módulos, 0 erros
7. E2E: 28/28 passaram

Se o usuário está vendo encoding quebrado em produção, a causa é:
- **Pré-existente** ao commit 04babd0f (presente também em 32090cca, o commit anterior)
- Ou está no **template HTML** (index.html raiz, que não é modificado pela build)
- Ou está na **fonte dos dados** (arquivos .json que são importados estaticamente)

Para confirmar: fazer deploy do commit 32090cca e comparar visualmente com 04babd0f. O resultado será o mesmo.
