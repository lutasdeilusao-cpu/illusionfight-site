# CHORE: Remover logs de investigação do Phase6CombatV2 e useCombatEngine

> Versão: 6.4.1 / 10.158.16
> Hash: `01e2669e`
> Deploy: `Published` ✅

---

## Etapa 1 — Prova de leitura (outputs brutos)

### grep — useCombatEngine.js (ANTES)
```
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:229: console.log('[TC-10] onUnlockInput chamado', {  caller: 'finalizarAposAtaque-morto', delay: 1500 })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:240: console.log('[TC-10] onUnlockInput chamado', {  caller: 'finalizarAposAtaque-vivo', delay: 1500 })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:275: console.log('[TC-09] onLockInput chamado', {  caller: 'moverPersonagem' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:316: console.log('[TC-10] onUnlockInput chamado', {  caller: 'aposMovimento', delay: 0 })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:364: console.log('[TC-09] onLockInput chamado', {  caller: 'executarAtaque' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:420: console.log('[TC-01] configurarTurnoPara', {  charId, time: charsRef.current.find(c => c.id === charId)?.time })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:422: console.log('[TC-20] setCurrentCharId chamado', {  charId, time: charsRef.current.find(c => c.id === charId)?.time })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:429: console.log('[TC-09] onLockInput chamado', {  caller: 'configurarTurnoPara-ia' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:433: console.log('[TC-03] setIaThinking → FALSE', {  caller: 'configurarTurnoPara-jogador' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:441: console.log('[TC-09] onLockInput chamado', {  caller: 'configurarTurnoPara-jogador' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:448: console.log('[TC-11] avancarEAcionar chamado')
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:533: console.log('[TC-02] setIaThinking → TRUE', {  caller: 'executarIA' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:534: console.log('[TC-04] executarIA iniciado', {  iaCharId: iaChar.id })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:540: console.log('[TC-05] estagioPensar iniciado', {  iaCharId: iaChar.id })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:543: console.log('[TC-03] setIaThinking → FALSE', { caller: 'estagioPensar-morto' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:551: console.log('[TC-06] estagioMover iniciado', {  iaCharId: iaChar.id })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:580: console.log('[TC-07] estagioAgir iniciado', {  iaCharId: iaChar.id })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:583: console.log('[TC-03] setIaThinking → FALSE', { caller: 'estagioAgir-morto' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:653: console.log('[TC-03] setIaThinking → FALSE', {  caller: 'finalizarTurnoIA' })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:654: console.log('[TC-08] finalizarTurnoIA iniciado', {  iaCharId: iaChar.id, winnerRef: winnerRef.current })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:657: console.log('[TC-10] onUnlockInput chamado', {  caller: 'finalizarTurnoIA', delay: 0 })
```

### grep — Phase6CombatV2.jsx (ANTES)
```
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:124: console.log('[TC-12] onTurnoJogador', { proxCharId: proxChar.id, inputLockedAntes: inputLockedRef.current })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:131: console.log('[TC-13] onTurnoIA', { proxCharId: proxChar.id, inputLockedAntes: inputLockedRef.current })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:137: onLockInput: () => { console.log('[TC-14] onLockInput → lockInput()'); lockInput() }
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:138: onUnlockInput: (delay) => { console.log('[TC-15] onUnlockInput → unlockInput()', { delay }); unlockInput(delay) }
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:160: console.log('[TC-19] currentChar recalculado', { currentCharId, found: !!found, time: found?.time ?? 'undefined' })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:183: console.log('[TC-16] iaThinking mudou', { iaThinking, isPlayerTurn: currentChar?.time === 'jogador', currentCharId: currentChar?.id })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:426: console.log('[VIS-01] texto iaThinking VISÍVEL NA TELA (top bar)', { ... })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:487: console.log('[VIS-02] texto iaThinking VISÍVEL NA TELA (bottom nav spinner)', { ... })
```

---

## Remoções executadas

### useCombatEngine.js — 21 linhas removidas

| Prefixo | Onde | O que foi removido |
|---|---|---|
| TC-01 | configurarTurnoPara | `console.log('[TC-01] ...')` |
| TC-02 | executarIA | `console.log('[TC-02] ...')` |
| TC-03 | configurarTurnoPara-jogador | `console.log('[TC-03] ...')` |
| TC-03 | estagioPensar-morto | `console.log('[TC-03] ...')` inline no if |
| TC-03 | estagioAgir-morto | `console.log('[TC-03] ...')` inline no if |
| TC-03 | finalizarTurnoIA | `console.log('[TC-03] ...')` |
| TC-04 | executarIA | `console.log('[TC-04] ...')` |
| TC-05 | estagioPensar | `console.log('[TC-05] ...')` |
| TC-06 | estagioMover | `console.log('[TC-06] ...')` |
| TC-07 | estagioAgir | `console.log('[TC-07] ...')` |
| TC-08 | finalizarTurnoIA | `console.log('[TC-08] ...')` |
| TC-09 | moverPersonagem | `console.log('[TC-09] ...')` |
| TC-09 | configurarTurnoPara-ia | `console.log('[TC-09] ...')` |
| TC-09 | configurarTurnoPara-jogador | `console.log('[TC-09] ...')` |
| TC-09 | executarAtaque | `console.log('[TC-09] ...')` |
| TC-10 | finalizarAposAtaque-morto | `console.log('[TC-10] ...')` |
| TC-10 | finalizarAposAtaque-vivo | `console.log('[TC-10] ...')` |
| TC-10 | aposMovimento | `console.log('[TC-10] ...')` |
| TC-10 | finalizarTurnoIA | `console.log('[TC-10] ...')` |
| TC-11 | avancarEAcionar | `console.log('[TC-11] ...')` |
| TC-20 | configurarTurnoPara | `console.log('[TC-20] ...')` |

### Phase6CombatV2.jsx — 8 blocos removidos

| Prefixo | Onde | O que foi removido |
|---|---|---|
| TC-12 | onTurnoJogador | `console.log('[TC-12] ...')` |
| TC-13 | onTurnoIA | `console.log('[TC-13] ...')` |
| TC-14 | onLockInput | `console.log('[TC-14] ...')` |
| TC-15 | onUnlockInput | `console.log('[TC-15] ...')` |
| TC-16 | useEffect | Bloco inteiro de log removido |
| TC-19 | useMemo | `console.log('[TC-19] ...')` + simplificado para arrow |
| VIS-01 | IIFE top bar | IIFE removida, substituída por ternary direto |
| VIS-02 | IIFE bottom nav | IIFE inteira removida (mostraSpinner + log) |

---

## Grep de confirmação (DEPOIS)

```
PS> Select-String -Pattern "TC-|VIS-|INV-|ATK-EXTRA|INV-HP" engine/useCombatEngine.js phases/Phase6CombatV2.jsx
(no output)
```

Zero ocorrências — todos os logs de investigação foram removidos.

---

## Teste lógico

### Fluxo 1 — Build não quebra sem os logs
- Nenhuma variável definida exclusivamente para log foi usada fora do log
- `mostraSpinner` era usada apenas no IIFE do VIS-02 — IIFE removido por completo
- `useEffect` de TC-16 era puro log — removido por completo
- `useMemo` TC-19 simplificado para arrow function sem corpo ✅

### Fluxo 2 — Spinner continua correto
- A lógica `: iaThinking ? <div className="atb-ia-thinking-row">... : null` não foi tocada
- grep confirma: `atb-ia-thinking-row` e `atb-ia-dots` intactos na linha 523-525 ✅

---

## Build output

```
vite v8.0.16 building client environment for production...
✓ 1247 modules transformed.
✓ built in 915ms
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.4.0 → **6.4.1** |
| `src/config/version.js` | SITE_VERSION bump | 10.158.15 → **10.158.16** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| **Commit** | `01e2669e` — `chore(arenatestbed): remover logs de investigacao + v6.4.1` | ✅ |
| **Deploy** | Status | ✅ |
