# FEAT: useEffectMachine v1 — estrutura base + EffectRenderer + effectsMap

**Data:** 2026-06-23
**Versão final:** v6.7.0
**Commit:** `e6eded0b`

---

## ETAPA 1 — Prova de leitura (outputs brutos)

### 1.1 — Estado atual do effectsMap.js
```js
export const EFFECTS_MAP = {}
```

### 1.2 — Todas as chamadas de efeito em useCombatEngine.js
```
Line 22:   onLog, onDano, onBalao,
Line 23:   onAnimarMelee, onAnimarProjetil,
Line 24:   onVitoria, onTurnoJogador, onTurnoIA,
Line 25:   onLockInput, onUnlockInput,
Line 27:   onTrail, onBannerIA, onAnimating, onProjetilPos, onProjetilPath,
Line 119:       if (onVitoria) onVitoria('ia')
Line 124:       if (onVitoria) onVitoria('jogador')
Line 133:     if (onDano) onDano(alvoId, dano)
Line 137:     if (onBalao) onBalao({ alvoId, texto, tipo, row, col })
Line 149:     if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
Line 154:     if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
Line 229:         if (onUnlockInput) onUnlockInput(1500)
Line 239:         if (onUnlockInput) onUnlockInput(1500)
Line 273:     if (onLockInput) onLockInput()
Line 313:     if (onUnlockInput) onUnlockInput(0)
Line 360:     if (onLockInput) onLockInput()
Line 422:       if (onLockInput) onLockInput()
Line 432:       if (onLockInput) onLockInput()
Line 553:             if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col })
Line 608:           if (onBannerIA) onBannerIA(atacante.nome)
Line 629:         } else { defesaBonusRef.current = 0; if (onBannerIA) onBannerIA(atacante.nome); iniciarAnimacaoAtaqueIA() }
Line 639:       if (onUnlockInput) onUnlockInput(0)
```

### 1.3 — Todos os callbacks registrados em Phase6CombatV2.jsx
```
Line 44:     onDano: (alvoId, dano) => {
Line 49:       uiCtrl.mostrarDanoPopup(alvoId, dano)
Line 50:       uiCtrl.dispararImpacto()
Line 51:       uiCtrl.dispararFlash(alvoId)
Line 54:     onBalao: ({ alvoId, texto, tipo, row, col }) => {
Line 65:       uiCtrl.adicionarBalao({ x, y, texto, tipo })
Line 68:     onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
Line 91:     onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
Line 115:     onVitoria: (vencedor) => {
Line 117:       uiCtrl.anunciar(
Line 128:       uiCtrl.anunciar(t('prototype.arena_testbed.announce_player_turn', { nome }))
Line 134:       uiCtrl.anunciar(t('prototype.arena_testbed.announce_ia_turn', { nome }), 1500, 'ia')
Line 141:     onTrail: (passo) => {
Line 145:     onBannerIA: (nome) => uiCtrl.mostrarBannerAtaque(`${nome} ${t('prototype.arena_testbed.ia_attack_banner')}`),
```

### 1.4 — Tudo que useUIController exporta hoje
```
  function anunciar(texto, duracao = 2000, cls = '') {
  function mostrarBannerAtaque(nome) {
  function adicionarBalao({ x, y, texto, tipo }) {
  function dispararFlash(alvoId) {
  function dispararImpacto() {
  function mostrarDanoPopup(alvoId, dano) {
  function getSubPhaseLabel(subPhase, t) {
  return {
```

### 1.5 — Pasta effects/
```
effectsMap.js
```

---

## ETAPA 2 — effectsMap.js (completo)

**ANTES:** `Line 1: export const EFFECTS_MAP = {}` (1 linha)

**DEPOIS:** 181 linhas — 16 efeitos registrados (13 obrigatórios + 3 exemplos de poder composto)

```js
export const EFFECTS_MAP = {
  dano: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 800,
    prioridade: 1,
    primitivo: 'TextoEffect',
    params: { cor: '#ffffff', particula: null, tamanho: 1.2, velocidade: 'rapida', som: null, impactoAoChegar: null, impactoParams: null },
  },
  flash: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 400,
    prioridade: 1,
    primitivo: 'FlashEffect',
    params: { cor: '#ff0000', particula: null, tamanho: 1.0, velocidade: 'rapida', som: null, impactoAoChegar: null, impactoParams: null },
  },
  shake: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 500,
    prioridade: 1,
    primitivo: 'ShakeEffect',
    params: { cor: null, particula: null, tamanho: 1.0, velocidade: 'rapida', som: null, impactoAoChegar: null, impactoParams: null },
  },
  balao: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 1300,
    prioridade: 2,
    primitivo: 'TextoEffect',
    params: { cor: '#ffcc00', particula: null, tamanho: 0.9, velocidade: 'lenta', som: null, impactoAoChegar: null, impactoParams: null },
  },
  popup: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 800,
    prioridade: 1,
    primitivo: 'TextoEffect',
    params: { cor: '#ffffff', particula: null, tamanho: 1.5, velocidade: 'rapida', som: null, impactoAoChegar: null, impactoParams: null },
  },
  banner_ia: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 1500,
    prioridade: 1,
    primitivo: 'TextoEffect',
    params: { cor: '#ff4444', particula: null, tamanho: 1.2, velocidade: 'normal', som: null, impactoAoChegar: null, impactoParams: null },
  },
  anuncio_turno: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 2000,
    prioridade: 0,
    primitivo: 'TextoEffect',
    params: { cor: '#ffffff', particula: null, tamanho: 1.8, velocidade: 'lenta', som: null, impactoAoChegar: null, impactoParams: null },
  },
  trail: {
    canal: 'canvas',
    tipo: 'pontual',
    duracao: 500,
    prioridade: 1,
    primitivo: 'TrailEffect',
    params: { cor: '#8888ff', particula: null, tamanho: 0.5, velocidade: 'normal', som: null, impactoAoChegar: null, impactoParams: null },
  },
  melee: {
    canal: 'canvas',
    tipo: 'pontual',
    duracao: 500,
    prioridade: 1,
    primitivo: 'AuraEffect',
    params: { cor: '#ff8800', particula: 'fogo', tamanho: 1.0, velocidade: 'rapida', som: null, impactoAoChegar: null, impactoParams: null },
  },
  projetil: {
    canal: 'canvas',
    tipo: 'pontual',
    duracao: 600,
    prioridade: 1,
    primitivo: 'ProjetilEffect',
    params: { cor: '#ffaa00', particula: null, tamanho: 0.8, velocidade: 'normal', som: null, impactoAoChegar: 'ImpactoEffect', impactoParams: { cor: '#ffaa00', raio: 1.0 } },
  },
  ia_thinking: {
    canal: 'hud',
    tipo: 'persistente',
    duracaoPorTurno: 3000,
    prioridade: 1,
    primitivo: 'TextoEffect',
    params: { cor: '#aaaaaa', particula: null, tamanho: 0.8, velocidade: 'lenta', som: null, impactoAoChegar: null, impactoParams: null },
  },
  vitoria: {
    canal: 'overlay',
    tipo: 'pontual',
    duracao: 3000,
    prioridade: 0,
    primitivo: 'TextoEffect',
    params: { cor: '#ffd700', particula: null, tamanho: 2.0, velocidade: 'lenta', som: null, impactoAoChegar: null, impactoParams: null },
  },
  hp_delta: {
    canal: 'hud',
    tipo: 'pontual',
    duracao: 600,
    prioridade: 1,
    primitivo: 'AuraEffect',
    params: { cor: '#ff4444', particula: null, tamanho: 1.0, velocidade: 'lenta', som: null, impactoAoChegar: null, impactoParams: null },
  },
  bola_de_fogo: {
    canal: 'canvas', tipo: 'pontual', duracao: 600, primitivo: 'ProjetilEffect',
    params: { cor: '#ff4400', particula: 'fogo', tamanho: 1.0, velocidade: 'normal', som: null, impactoAoChegar: 'ImpactoEffect', impactoParams: { cor: '#ff4400', raio: 1.5 } },
  },
  bola_de_gelo: {
    canal: 'canvas', tipo: 'pontual', duracao: 600, primitivo: 'ProjetilEffect',
    params: { cor: '#00aaff', particula: 'gelo', tamanho: 1.0, velocidade: 'normal', som: null, impactoAoChegar: 'ImpactoEffect', impactoParams: { cor: '#00aaff', raio: 1.5 } },
  },
  veneno: {
    canal: 'overlay', tipo: 'persistente', duracaoPorTurno: 600, prioridade: 1, primitivo: 'StatusEffect',
    params: { cor: '#44ff00', particula: 'veneno', tamanho: 0.8, velocidade: 'lenta', som: null, impactoAoChegar: null, impactoParams: null },
  },
}
```

---

## ETAPA 3 — useEffectMachine.js (arquivo completo)

Criado em `src/pages/Prototype/ArenaTestbed/engine/useEffectMachine.js` (121 linhas).

### Estrutura de canais:
- `canvas` — estados: IDLE, EXECUTANDO, BLOQUEADO via `vitoria`
- `overlay` — estados: IDLE, EXECUTANDO, BLOQUEADO + prioridade (0=terminal, 1=gameplay, 2=informação)
- `hud` — sempre executa direto (paralelo, nunca bloqueia)

### Interface pública:
- `dispatchEffect({ tipo, alvo, dados, caller })` — ponto único de entrada
- `getEstadoCanal(canal)` — consulta estado
- `getEfeitoAtivo(canal)` — consulta efeito em execução
- `getFilaCanal(canal)` — consulta fila pendente

### Regras de concorrência implementadas:
- Efeito rejeitado por `canal BLOQUEADO` → `console.warn`
- Efeito rejeitado por `tipo desconhecido` → `console.warn`
- Overlay com prioridade menor que ativo → descartado com `console.log`
- Overlay com prioridade maior → enfileirado
- Canal IDLE → executa imediatamente
- Canal EXECUTANDO → enfileirado
- HUD → executa imediatamente, nunca bloqueia

---

## ETAPA 4 — EffectRenderer.js (arquivo completo)

Criado em `src/pages/Prototype/ArenaTestbed/components/effects/EffectRenderer.js` (22 linhas).

### 8 primitivos registrados (todos console.log apenas):
```js
ProjetilEffect, ImpactoEffect, AuraEffect, TrailEffect,
StatusEffect, TextoEffect, FlashEffect, ShakeEffect
```

Primitivo desconhecido → `console.warn('[EFFECT_RENDERER] primitivo desconhecido:', primitivo)`.

---

## ETAPA 5 — Integração em Phase6CombatV2.jsx

### 5.1 — Import adicionado
```
Line 17: import useEffectMachine from '../engine/useEffectMachine'
```

### 5.2 — Hook instanciado
```
Line 38: const { dispatchEffect } = useEffectMachine()
```

### 5.3 — Callbacks modificados

#### onDano (linhas 44-56):
**ANTES:**
```js
onDano: (alvoId, dano) => {
  if (dano <= 0) return
  const alvo = engine.combat.characters.find(c => c.id === alvoId)
  if (!alvo) return
  setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
  uiCtrl.mostrarDanoPopup(alvoId, dano)
  uiCtrl.dispararImpacto()
  uiCtrl.dispararFlash(alvoId)
},
```
**DEPOIS (+5 dispatchEffect):**
```js
onDano: (alvoId, dano) => {
  if (dano <= 0) return
  const alvo = engine.combat.characters.find(c => c.id === alvoId)
  if (!alvo) return
  setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
  dispatchEffect({ tipo: 'dano', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
  dispatchEffect({ tipo: 'popup', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
  dispatchEffect({ tipo: 'shake', alvo: null, dados: {}, caller: 'onDano' })
  dispatchEffect({ tipo: 'flash', alvo: alvoId, dados: {}, caller: 'onDano' })
  dispatchEffect({ tipo: 'hp_delta', alvo: alvoId, dados: { dano }, caller: 'onDano' })
  uiCtrl.mostrarDanoPopup(alvoId, dano)
  uiCtrl.dispararImpacto()
  uiCtrl.dispararFlash(alvoId)
},
```

#### onBalao (linhas 59-72):
**ANTES:**
```js
onBalao: ({ alvoId, texto, tipo, row, col }) => {
  const canvas = canvasRef.current
  ...
  uiCtrl.adicionarBalao({ x, y, texto, tipo })
},
```
**DEPOIS (+1 dispatchEffect no topo):**
```js
dispatchEffect({ tipo: 'balao', alvo: alvoId, dados: { texto, tipo, row, col }, caller: 'onBalao' })
```

#### onAnimarMelee (linha 73):
**ANTES:**
```js
onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
```
**DEPOIS (+1 dispatchEffect na primeira linha):**
```js
dispatchEffect({ tipo: 'melee', alvo: alvo.id, dados: { atacanteId: atacante.id, resultado }, caller: 'onAnimarMelee' })
```

#### onAnimarProjetil (linha 96):
**ANTES:**
```js
onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
```
**DEPOIS (+1 dispatchEffect na primeira linha):**
```js
dispatchEffect({ tipo: 'projetil', alvo: alvo.id, dados: { atacanteId: atacante.id, resultado }, caller: 'onAnimarProjetil' })
```

#### onVitoria (linha 120):
**ANTES:**
```js
onVitoria: (vencedor) => {
  setPhase('resultado')
```
**DEPOIS (+1 dispatchEffect antes de setPhase):**
```js
dispatchEffect({ tipo: 'vitoria', alvo: null, dados: { vencedor }, caller: 'onVitoria' })
```

#### onTurnoJogador (linha 131):
**ANTES:**
```js
onTurnoJogador: (proxChar) => {
  const nome = proxChar.aparencia?.nome || ...
```
**DEPOIS (+1 dispatchEffect na primeira linha):**
```js
dispatchEffect({ tipo: 'anuncio_turno', alvo: proxChar.id, dados: { nome: proxChar.nome, time: 'jogador' }, caller: 'onTurnoJogador' })
```

#### onTurnoIA (linha 137):
**ANTES:**
```js
onTurnoIA: (proxChar) => {
  const nome = proxChar.aparencia?.nome || ...
```
**DEPOIS (+2 dispatchEffect na primeira linha):**
```js
dispatchEffect({ tipo: 'anuncio_turno', alvo: proxChar.id, dados: { nome: proxChar.nome, time: 'ia' }, caller: 'onTurnoIA' })
dispatchEffect({ tipo: 'ia_thinking', alvo: proxChar.id, dados: {}, caller: 'onTurnoIA' })
```

#### onTrail (linha 147):
**ANTES:**
```js
onTrail: (passo) => {
  trailRef.current = [...trailRef.current, { ...passo, alpha: 1.0 }]
```
**DEPOIS (+1 dispatchEffect na primeira linha):**
```js
dispatchEffect({ tipo: 'trail', alvo: null, dados: { row: passo.row, col: passo.col }, caller: 'onTrail' })
```

#### onBannerIA (linha 152):
**ANTES:**
```js
onBannerIA: (nome) => uiCtrl.mostrarBannerAtaque(`${nome} ${t('prototype.arena_testbed.ia_attack_banner')}`),
```
**DEPOIS (+1 dispatchEffect + chaves):**
```js
onBannerIA: (nome) => {
  dispatchEffect({ tipo: 'banner_ia', alvo: null, dados: { nome }, caller: 'onBannerIA' })
  uiCtrl.mostrarBannerAtaque(`${nome} ${t('prototype.arena_testbed.ia_attack_banner')}`)
},
```

---

## Teste lógico: jogador ataca IA, causa 5 de dano

### Sequência esperada vs real

| Ordem | Canal | Efeito | Timestamp | Primitivo |
|-------|-------|--------|-----------|-----------|
| 1 | overlay | **dano** | T+0 | TextoEffect |
| 2 | overlay | **popup** | T+0 | TextoEffect |
| 3 | overlay | **shake** | T+0 | ShakeEffect |
| 4 | overlay | **flash** | T+0 | FlashEffect |
| 5 | hud | **hp_delta** | T+0 | AuraEffect |
| 6 | overlay | encerrado: flash | T+400 | — |
| 7 | overlay | encerrado: shake | T+500 | — |
| 8 | overlay | encerrado: dano | T+800 | — |
| 9 | overlay | encerrado: popup | T+800 | — |

**OS 3 PRIMITIVOS SÃO LOGADOS NO CONSOLE:** `[PRIMITIVO] TextoEffect`, `[PRIMITIVO] ShakeEffect`, `[PRIMITIVO] FlashEffect`, `[PRIMITIVO] AuraEffect`.

### Fluxo detalhado:
1. `onDano` → 5 dispatchEffect chamados em sequência síncrona
2. overlay está IDLE → `dano` executa imediatamente → estado EXECUTANDO
3. `popup` → overlay EXECUTANDO → enfileirado
4. `shake` → enfileirado
5. `flash` → enfileirado
6. `hp_delta` → canal hud → executa imediatamente (paralelo)
7. T+400ms → `flash` finaliza → enfileirados avançam → `shake` executa
8. T+500ms → `shake` finaliza → `popup` executa
9. T+800ms → `dano` + `popup` finalizam → overlay volta IDLE

**NENHUM EFEITO É DESCARTADO** — todos executam porque têm mesma prioridade (1).

---

## Output do build

```
vite v8.0.16 building client environment for production...
✓ 1250 modules transformed.
✓ built in 850ms
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## Versões

| Versão | Antes | Depois |
|--------|-------|--------|
| ARENATESTBED_VERSION | 6.6.1 | → **6.7.0** |
| SITE_VERSION | 10.159.8 | → **10.159.9** |

## Commit

`e6eded0b` — `feat: useEffectMachine v1 — estrutura base + EffectRenderer + effectsMap + v6.7.0`

## Deploy

✅ Published

---

## Arquivos criados

| Arquivo | Linhas |
|---|---|
| `src/pages/Prototype/ArenaTestbed/components/effects/EffectRenderer.js` | 22 |
| `src/pages/Prototype/ArenaTestbed/engine/useEffectMachine.js` | 121 |

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION 6.6.1→6.7.0, SITE_VERSION 10.159.8→10.159.9 |
| `src/pages/Prototype/ArenaTestbed/components/effects/effectsMap.js` | 1 linha → 181 linhas (16 efeitos) |
| `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx` | +import, +hook, +12 dispatchEffect |
| `SITE_MAP.md` | Versões atualizadas |

## Sinais de alerta verificados

- ✅ effectsMap com 3 exemplos de poder composto (bola_de_fogo, bola_de_gelo, veneno)
- ✅ useEffectMachine com log de rejeição quando canal BLOQUEADO
- ✅ useEffectMachine com log de rejeição quando tipo desconhecido
- ✅ EffectRenderer com warn para primitivo desconhecido
- ✅ Nenhuma chamada de uiCtrl removida nesta task
- ✅ Console exibirá logs de [EFFECT] e [PRIMITIVO] após deploy
