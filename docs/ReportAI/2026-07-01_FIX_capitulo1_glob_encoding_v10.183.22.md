# Fix: Capítulo 1 — Glob path quebrado + encoding mojibake

## Problema

1. **Livro cap 1 mostra "não publicado"** mesmo com `capitulo-01` na exceção
2. **Títulos webtoon com mojibake** (`â€”` em vez de `—`, `â€™` em vez de `'`)

## Diagnóstico

| Sintoma | Causa raiz | Arquivo |
|---------|-----------|---------|
| Cap 1 "não publicado" | Glob path `'../data/livro/**/*.md'` quebrado após refactor de `src/pages/` para `src/pages/content/` | `LivroCapitulo.jsx:6-7` |
| Mojibake nos títulos | HTML entities `&mdash;` vs `—`, `&#39;` vs `'` no JSX + server-render | `webtoon.jsx:32` |

## Correções aplicadas

1. **Glob path** `'../../data/livro/**/*.md'` (de `../data` para `../../data`)
2. **Lookup path** `../../data/livro-index.json` (mesma correção)
3. **Encoding** → HTML entities no JSX renderizam corretamente

## Testes (Playwright)

```
✓ cap1 loads content (title "Prólogo: ..." visible)
✓ cap2 blocked (not published — shows "não publicado")
✓ webtoon ep00 title clean (no mojibake)
```
3 passed — todos os cenários OK.

## Build

Geração de chunks `capitulo-01-*.js` confirmada (9.11 kB, 9.14 kB, 9.47 kB) — antes não existiam.

| Versão | Antes | Depois |
|--------|-------|--------|
| SITE_VERSION | 10.183.22 | — |
| Commit | `f969a3ca` → `56ee00e0` | ✅ |
| Deploy | Published | ✅ |

## Decisão registrada em AGENTS.md

- Glob com `import.meta.glob` dentro de componente movido de diretório → paths relativos quebram silenciosamente. Sempre verificar `import.meta.glob` paths após mover componentes.
