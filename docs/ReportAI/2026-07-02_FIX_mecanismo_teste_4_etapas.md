# Relatório de Teste — Toggle Games LDI / Kernel Panic

**Data:** 2026-07-02
**Script:** `tests/kernel-panic-feat.mjs`
**Mecanismo:** 4 etapas sequenciais (build → dev → healthcheck → teste)

---

## ETAPA 1 — Build

**Comando:** `npm run build`
**Exit code:** 0
**Resultado:** ✅ 1293 módulos transformados, 26 rotas pré-renderizadas. Sem erro.

---

## ETAPA 2 — Dev Server

**Script:** `start-dev.ps1` (arquivo .ps1, nunca `-ArgumentList` com comando complexo)
**Correção aplicada:** aspas simples `'--port'` em vez de `--` (PowerShell não trata `--` como bash)
**Log comprovado:** `> vite --port 5199` (flag passou corretamente)
**PID:** 68600
**Processo vivo:** ✅ confirmado

---

## ETAPA 3 — Healthcheck

**Porta real extraída do log (com limpeza ANSI):** 5199
**Tentativas até 200:** 1/15
**Resultado:** ✅ `HTTP 200` na porta real

---

## ETAPA 4 — Playwright Test (15 observações)

### Estado inicial (aba LDI ativa)

| Observação | Resultado |
|---|---|
| title | `"Jogos — Illusion Fight"` |
| `.kp-toggle-btn` count | `2` |
| toggle btn[0] texto | `"Games LDI"` |
| toggle btn[1] texto | `"Kernel Panic"` |
| toggle btn[0] class | `"kp-toggle-btn kp-toggle-btn--ativa"` (ativo) |
| toggle btn[1] class | `"kp-toggle-btn "` |
| `.extras-jogos-grid` count | `1` |
| `.kp-secao` count | `0` |
| `.extras-conteudo-grid` count | `1` |
| `.extras-conteudo-card` count | `2` |
| `.extras-titulo` texto | `"GAMES"` |

### Após clicar "Kernel Panic"

| Observação | Resultado |
|---|---|
| `.extras-jogos-grid` count | `0` (some) |
| `.kp-secao` count | `1` (aparece) |
| `.kp-titulo` texto | `"KERNELPANIC"` (textContent funde <br>, visualmente quebrado em 2 linhas) |
| `.kp-tagline` texto | `"PROTOCOLO DE ELIMINAÇÃO"` |
| `.kp-empty` count | `1` |
| `.kp-empty-msg` texto | `"nenhum protocolo disponível ainda."` |
| `.kp-grid-bg` count | `1` |
| border-top-color (computed) | `rgba(168, 85, 247, 0.15)` — roxo neon |
| background-color (computed) | `rgba(0, 0, 0, 0.6)` |
| font-family (kp-titulo) | `"Share Tech Mono", monospace` — monoespaçada |
| color (kp-titulo) | `rgb(168, 85, 247)` — roxo neon |
| `.extras-conteudo-grid` count | `1` (CONTENT permanece) |

### Após voltar para "Games LDI"

| Observação | Resultado |
|---|---|
| `.extras-jogos-grid` count | `1` (volta) |
| `.kp-secao` count | `0` (some) |
| classes kp- residuais (exceto toggle) | `0` — **nenhum resíduo** |
| `.extras-conteudo-grid` count | `1` |
| `.extras-jogo-card` count | `9` (todos os cards) |

### Mobile 375px

| Observação | Resultado |
|---|---|
| `.kp-toggle-btn` count | `2` |
| `.kp-secao` visível após toggle | `true` |
| `.kp-titulo` visível | `true` |

---

## Conclusão

**Exit code final:** `0`
**Testes falharam:** 0
**Bug encontrado:** nenhum

A feature toggle Games LDI / Kernel Panic opera conforme especificado:
- Toggle com 2 botões, `"Games LDI"` ativo por padrão
- Ao trocar para Kernel Panic: grid LDI some, seção temática (título, tagline, grid Tron, placeholder vazio) aparece com estilo roxo neon, CONTENT permanece
- Ao voltar para LDI: estado inicial restaurado sem resíduo de classes kp-
- Funciona em mobile 375px

---

## Lições registradas para o mecanismo de teste

1. **Nunca `-ArgumentList` com comando complexo** — usar arquivo `.ps1` com `Start-Process -FilePath "powershell" -ArgumentList "-File script.ps1"`
2. **PowerShell `--` não funciona como bash** — usar `'--port'` (aspas simples) para passar flags
3. **Healthcheck contra porta REAL extraída do log** — não assumir porta fixa, limpar ANSI antes do regex
4. **Cleanup por PID específico (porta), nunca por nome de processo**
5. **Logs em arquivo, nunca `$null`** — sem evidência não há diagnóstico
6. **`try/finally`** para garantir limpeza mesmo em falha
