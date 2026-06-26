# FIX — Restaurar encoding UTF-8 correto dos emojis em JSX

**Data:** 2026-06-25
**Versão:** 10.163.0 → **10.163.1**
**Commit:** 98c5d8c3

## ETAPA 1 — Arquivos corrompidos

64 arquivos corrompidos pelo PowerShell `Get-Content` + `WriteAllText` (encoding Windows-1252 → UTF-8 duplo).
1 arquivo pré-corrompido (game-logic.js, desde b9df7589).

## Correção

Para cada arquivo corrompido:
1. Restaurado do git HEAD~1 (conteúdo original com emojis corretos)
2. Ajustado imports (depth_old - n < 0 → +1 `../`)
3. Corrigidos manualmente casos especiais:
   - Cross-game: `../../LDI/` → `../LDI/` (sibling games/)
   - Cross-category: `../../../TopTrumps/` → `../../../games/TopTrumps/`
   - Perfil.css: `../` → `./`
   - TopTrumps root files: +2 `../` (depth 0 → depth 2)
   - Imports com aspas duplas não detectados pelo regex

## Resultado

| Item | Status |
|------|--------|
| Arquivos corrompidos | 64 (corrigidos) + 1 (game-logic.js, pré-existente) |
| Build | ✅ 1243 módulos, 1.90s |
| Varredura final | OK — apenas game-logic.js (pré-existente) |
| SITE_VERSION | 10.163.0 → **10.163.1** |
| Commit | 98c5d8c3 |
| Deploy | ✅ Published |
