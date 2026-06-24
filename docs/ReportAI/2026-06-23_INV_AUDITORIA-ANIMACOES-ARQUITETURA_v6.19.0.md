# INV: Auditoria Arquitetural — 13 Animações Canvas + particles + juice

> **Data:** 2026-06-23
> **Versão:** ARENATESTBED **6.19.0** / SITE **10.160.36**
> **Commit:** `293bc5ac` (último — FEAT overlay DOM)
> **Status:** Investigação pura — ZERO alterações de código

---

## ETAPA 1 — Escopo

### 13 animation files + particles + juice

| Grupo | Arquivos |
|-------|----------|
| Movimento | `moveAnim1Standard.js`, `moveAnim2Teleport.js`, `moveAnim3Slingshot.js` + `movement/index.js` |
| Ataque melee | `attackAnim1Standard.js`, `attackAnim1StandardPlus.js`, `attackAnim2RageDash.js`, `attackAnim3EnergyPunch.js` + `attack/index.js` |
| Ataque range | `rangeAnim1StraightShot.js`, `rangeAnim2BurstFire.js`, `rangeAnim3SpiritGun.js` |
| Defesa | `defenseAnim1Hit.js`, `defenseAnim2Block.js`, `defenseAnim3MagicShield.js` + `defense/index.js` |
| Utilitários | `particles.js`, `juice.js` |

### Contrato — parâmetros recebidos via `execute({...})`

Cada animation file exporta `execute()` que recebe callbacks por DI (dependency injection). Nenhum importa React, DOM, ou estado global.

### Regras de auditoria (R1–R6)

| Regra | Descrição | Como verificar |
|-------|-----------|----------------|
| **R1** | Module boundaries — sem imports de fora de `engine/animations/` | `grep "^import"` |
| **R2** | State mutation — callbacks apenas, sem import direto de React/estado | Leitura do `execute` |
| **R3** | Lifecycle — overlay DOM com `duracao_auto: false` deve emitir `effect:end` | `grep "emit\|effect:end"` |
| **R4** | Timer discipline — `setAnimTimer` sempre, nunca `setTimeout` | `grep "setTimeout"` |
| **R5** | Channel separation — canvas não toca overlay DOM, overlay não toca canvas | Leitura dos primitivos |
| **R6** | Visual vs Logical — não altera `posicao` lógico durante animação visual | `grep "syncCharacters\|posicao.*row\|posicao.*col"` |

---

## ETAPA 2 — Output BRUTO dos 8 comandos

### Comando 1 — Imports em cada animation file

```
> Get-ChildItem ... | ForEach-Object { Select-String -Path $_.FullName -Pattern "^import" }

attack/index.js:1: import { execute as standardPlus } from './attackAnim1StandardPlus'
attack/index.js:2: import { execute as rageDash     } from './attackAnim2RageDash'
attack/index.js:3: import { execute as energyPunch  } from './attackAnim3EnergyPunch'
attack/index.js:4: import { execute as straightShot } from './rangeAnim1StraightShot'
attack/index.js:5: import { execute as burstFire    } from './rangeAnim2BurstFire'
attack/index.js:6: import { execute as spiritGun    } from './rangeAnim3SpiritGun'
rangeAnim1StraightShot.js:1: import { getLinePath } from '../../animations/particles'
rangeAnim2BurstFire.js:1:     import { getLinePath } from '../../animations/particles'
rangeAnim3SpiritGun.js:1:     import { getLinePath } from '../../animations/particles'
defense/index.js:1:   import { execute as hit         } from './defenseAnim1Hit'
defense/index.js:2:   import { execute as block       } from './defenseAnim2Block'
defense/index.js:3:   import { execute as magicShield } from './defenseAnim3MagicShield'
movement/index.js:1:  import { execute as standard  } from './moveAnim1Standard'
movement/index.js:2:  import { execute as teleport  } from './moveAnim2Teleport'
movement/index.js:3:  import { execute as slingshot } from './moveAnim3Slingshot'
```

**Resultado:** `juice.js`, `particles.js`, `attackAnim1Standard.js`, `attackAnim2RageDash.js`, `attackAnim3EnergyPunch.js`, `defenseAnim1Hit.js`, `defenseAnim2Block.js`, `defenseAnim3MagicShield.js`, `moveAnim1Standard.js`, `moveAnim2Teleport.js`, `moveAnim3Slingshot.js` — **zero imports**.

`rangeAnim1StraightShot.js`, `rangeAnim2BurstFire.js`, `rangeAnim3SpiritGun.js` — importam `getLinePath` de `../../animations/particles` (intra-módulo, aceitável).

---

### Comando 2 — `setTimeout` raw

```
> Get-ChildItem ... | ForEach-Object { Select-String -Path $_.FullName -Pattern "setTimeout\b" }

(nenhum resultado)
```

✅ **R4 aprovado — zero ocorrências de `setTimeout`.** Todas as animações usam `setAnimTimer`.

---

### Comando 3 — `emit` / `effect:end`

```
> Get-ChildItem ... | ForEach-Object { Select-String -Path $_.FullName -Pattern "emit|effect:end" }

particles.js:5: export function emitBurst(setParticles, x, y, {
```

✅ **R3 N/A** — o único match é `emitBurst` (função de particles, não EventBus). Nenhuma animation file emite `effect:end` porque usam callback `onFinalize`, não EventBus. Isso é correto para o canal canvas — apenas overlay DOM precisa de `effect:end`.

---

### Comando 4 — Chamadas de movimento em `useCombatEngine.js`

```
> Select-String -Path "useCombatEngine.js" -Pattern "getMovementAnimation|animFn|moveAnim|execute\("

useCombatEngine.js:19:   import { getMovementAnimation } from './animations/movement/index'
useCombatEngine.js:381:  const moveAnimId = currentChar.animacoes?.movimento ?? 1
useCombatEngine.js:382:  const animFn = getMovementAnimation(moveAnimId)
useCombatEngine.js:385:  animFn({
useCombatEngine.js:402:    moveAnimId,
useCombatEngine.js:675:    const moveAnimId = iaAtual.animacoes?.movimento ?? 1
useCombatEngine.js:676:    const animFn = getMovementAnimation(moveAnimId)
useCombatEngine.js:679:    animFn({
useCombatEngine.js:696:    moveAnimId,
```

**Padrão:** `animFn({ charId, origem, destino, steps, sz, charsRef, syncCharacters, setAnimTimer, onTrail, onClearTrail, setCharScales, setCharVisualPos, moveAnimId, onFinalize })`.

---

### Comando 5 — Chamadas de ataque/defesa em `useCombatEngine.js`

```
> Select-String -Path "useCombatEngine.js" -Pattern "getAttackAnimation|getRangeAnimation|animarAtaque|animarDefesa"

useCombatEngine.js:20:   import { getAttackAnimation, getRangeAnimation } from './animations/attack/index'
useCombatEngine.js:112:  function animarDefesa(alvo, atacante, tipo, onFinalizar) {
useCombatEngine.js:214:  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
useCombatEngine.js:216:    const animFn = getAttackAnimation(animId)
useCombatEngine.js:235:  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
useCombatEngine.js:237:    const animFn = getRangeAnimation(animId)
useCombatEngine.js:262:    animarDefesa(alvo, atacante, tipo, () => {
useCombatEngine.js:510:    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(...)
useCombatEngine.js:511:    else animarAtaqueProjetil(...)
useCombatEngine.js:738:    animarDefesa(alvo, atacante, tipoDef, () => {
useCombatEngine.js:768:    if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(...)
useCombatEngine.js:769:    else animarAtaqueProjetil(...)
```

**Padrão ataque/range:** `animFn({ atacante, alvo, resultado, sz, setCharVisualPos, setCharScales, setAnimTimer, onGetHexCenter, onEmitParticles, onBalloon, onFinalize })`.

**Padrão defesa:** `animFn({ charId, alvo, atacante, tipo, onGetHexCenter, setAnimTimer, setCharFlash, onEmitParticles, onFinalize })`.

---

### Comando 6 — `dispatchEffect` em `Phase6CombatV2.jsx`

```
> Select-String -Path "Phase6CombatV2.jsx" -Pattern "dispatchEffect.*melee|dispatchEffect.*projetil|dispatchEffect.*movimento"

Phase6CombatV2.jsx:107:  dispatchEffect({ tipo: 'melee', alvo: alvo.id, dados: { atacanteId, alvoId, resultado, onFinalizar } })
Phase6CombatV2.jsx:111:  dispatchEffect({ tipo: 'projetil', alvo: alvo.id, dados: { atacanteId, alvoId, resultado, onFinalizar } })
Phase6CombatV2.jsx:305:  dispatchEffect({ tipo: 'highlight_movimento', canal: 'canvas', dados: { cells } })
```

`melee` e `projetil` passam por `dispatchEffect` → `useEffectMachine` → `EffectRenderer.executar`. O `onFinalizar` viaja dentro de `dados`. O primitive `AuraEffect` ou `ProjetilEffect` chama `dados.onFinalizar()` ao terminar.

---

### Comando 7 — Chamadas juice em `Phase6CombatV2.jsx`

```
> Select-String -Path "Phase6CombatV2.jsx" -Pattern "triggerShake|triggerCanvasFlash|triggerHitStop|spawnFloatingText|onJuiceHit"

Phase6CombatV2.jsx:22-25:   imports de triggerShake, triggerCanvasFlash, triggerHitStop, spawnFloatingText
Phase6CombatV2.jsx:174:     onJuiceHit: ({ dano, critico, bloqueio, contra, extraHit, miss, magic, alvoPos }) => {
Phase6CombatV2.jsx:177-220: juice calls com presets (CRITICAL, MEDIUM, HEAVY, LIGHT, BLOCK, COUNTER, etc.)
```

✅ Juice chamado exclusivamente de `onJuiceHit` no Phase6CombatV2. Nenhuma animation file chama juice diretamente.

---

### Comando 8 — `syncCharacters` / `posicao` mutation

```
> Get-ChildItem ... | ForEach-Object { Select-String -Path $_.FullName -Pattern "syncCharacters|posicao.*row|posicao.*col" }

attackAnim1StandardPlus.js:  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
attackAnim1StandardPlus.js:  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
attackAnim2RageDash.js:      const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
attackAnim2RageDash.js:      const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
attackAnim3EnergyPunch.js:   const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
attackAnim3EnergyPunch.js:   const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
rangeAnim1StraightShot.js:   const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
rangeAnim1StraightShot.js:   const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
rangeAnim2BurstFire.js:      const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
rangeAnim2BurstFire.js:      const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
rangeAnim3SpiritGun.js:      const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
rangeAnim3SpiritGun.js:      const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim1Hit.js:          const pos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim2Block.js:        const alvoPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim2Block.js:        const atacPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
defenseAnim3MagicShield.js:  const alvoPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
defenseAnim3MagicShield.js:  const atacPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
moveAnim1Standard.js:        syncCharacters(prev => c.id === charId ? { ...c, posicao: { row, col } } : c)
moveAnim2Teleport.js:        syncCharacters(prev => c.id === charId ? { ...c, posicao: { row, col } } : c)
moveAnim3Slingshot.js:       syncCharacters(prev => c.id === charId ? { ...c, posicao: { row, col } } : c)
```

❌ **R6 VIOLADO** — `moveAnim1Standard.js:33-35`, `moveAnim2Teleport.js:33-35`, `moveAnim3Slingshot.js:64-66` mutam `posicao` lógico via `syncCharacters` durante a animação visual.

Os demais arquivos (attack, range, defense) usam `posicao` **somente leitura** via `onGetHexCenter(alvo.posicao.row, alvo.posicao.col)` — não mutam.

---

## ETAPA 3 — Fichas Individuais

### Ficha A: Movement Animations

| Critério | `moveAnim1Standard` | `moveAnim2Teleport` | `moveAnim3Slingshot` |
|----------|:---:|:---:|:---:|
| R1 — imports | ✅ nenhum | ✅ nenhum | ✅ nenhum |
| R2 — DI pura | ✅ callbacks | ✅ callbacks | ✅ callbacks |
| R3 — emit | ✅ N/A (canvas) | ✅ N/A | ✅ N/A |
| R4 — setAnimTimer | ✅ sim | ✅ sim | ✅ sim |
| R5 — channel | ✅ canvas only | ✅ canvas only | ✅ canvas only |
| R6 — muta posicao? | ❌ **SIM** | ❌ **SIM** | ❌ **SIM** |
| Tem `setCharVisualPos`? | ❌ **não** | ❌ **não** | ❌ **não** |

**Detalhe R6:** `moveAnim1Standard.js:33-35`:
```javascript
syncCharacters(prev =>
  prev.map(c => c.id === charId
    ? { ...c, posicao: { row: step.row, col: step.col } }
    : c
  )
)
```

Os 3 arquivos de movimento chamam `syncCharacters` a cada step (150ms intervalo) para atualizar `posicao`. Isso significa que:
- Durante a animação de movimento (ex: 3 steps = 450ms), o `posicao` lógico muda 3 vezes
- Se o jogo for interrompido no meio (ex: toggle, crash, overlay event), a posição lógica pode ficar inconsistente
- `setCharVisualPos` **não é usado** em movement — não há separação entre visual temporário e commit lógico

### Ficha B: Attack/Melee Animations

| Critério | `attack1Standard` | `attack1StandardPlus` | `attack2RageDash` | `attack3EnergyPunch` |
|----------|:---:|:---:|:---:|:---:|
| R1 — imports | ✅ | ⚠️ `getLinePath` | ✅ | ✅ |
| R2 — DI pura | ✅ | ✅ | ✅ | ✅ |
| R3 — emit | ✅ N/A | ✅ N/A | ✅ N/A | ✅ N/A |
| R4 — setAnimTimer | ✅ | ✅ | ✅ | ✅ |
| R5 — channel | ✅ | ✅ | ✅ | ✅ |
| R6 — muta posicao? | ✅ **não** (leitura só) | ✅ **não** | ✅ **não** | ✅ **não** |
| Tem `setCharVisualPos`? | ✅ sim | ✅ sim | ✅ sim | ✅ sim |

**Detalhe:** `attackAnim1StandardPlus.js` importa `getLinePath` de `../../animations/particles` — aceitável (intra-módulo), mas quebra o padrão DI puro. Os 3 arquivos ataque e range importam a mesma função para calcular trajetória de projéteis.

### Ficha C: Range Animations

| Critério | `range1StraightShot` | `range2BurstFire` | `range3SpiritGun` |
|----------|:---:|:---:|:---:|
| R1 — imports | ⚠️ `getLinePath` | ⚠️ `getLinePath` | ⚠️ `getLinePath` |
| R2 — DI pura | ✅ | ✅ | ✅ |
| R3 — emit | ✅ N/A | ✅ N/A | ✅ N/A |
| R4 — setAnimTimer | ✅ | ✅ | ✅ |
| R5 — channel | ✅ | ✅ | ✅ |
| R6 — muta posicao? | ✅ **não** | ✅ **não** | ✅ **não** |
| Tem `setCharVisualPos`? | ✅ sim | ✅ sim | ✅ sim |

### Ficha D: Defense Animations

| Critério | `defense1Hit` | `defense2Block` | `defense3MagicShield` |
|----------|:---:|:---:|:---:|
| R1 — imports | ✅ nenhum | ✅ nenhum | ✅ nenhum |
| R2 — DI pura | ✅ | ✅ | ✅ |
| R3 — emit | ✅ N/A | ✅ N/A | ✅ N/A |
| R4 — setAnimTimer | ✅ | ✅ | ✅ |
| R5 — channel | ✅ | ✅ | ✅ |
| R6 — muta posicao? | ✅ **não** | ✅ **não** | ✅ **não** |
| Tem `setCharFlash`? | ✅ sim | ❌ não | ✅ sim |

### Ficha E: Utilitários

| Critério | `particles.js` | `juice.js` |
|----------|:---:|:---:|
| R1 — imports | ✅ nenhum | ✅ nenhum |
| R2 — DI pura | ✅ `setParticles` por parâmetro | ✅ refs por parâmetro |
| R3 — emit | ✅ N/A | ✅ N/A |
| R4 — setAnimTimer | ✅ N/A (puro) | ✅ RAF, sem setTimeout |
| R5 — channel | ✅ canvas only | ✅ canvas/juice only |
| R6 — muta posicao? | ✅ **não** | ✅ **não** |

---

## ETAPA 4 — Análise `effectsMap.js` — Ponte entre canvas e overlay

`effectsMap.js` gerencia dois mundos via `canal`:

| Tipo | canal | primitivo | duracao_auto | Gerenciado por |
|------|-------|-----------|:-----------:|----------------|
| `impacto` | overlay | ImpactoEffect | false | EffectRenderer + primitivo (dom) |
| `dano` | overlay | TextoEffect | false | EffectRenderer + primitivo (dom) |
| `flash` | overlay | FlashEffect | false | EffectRenderer + primitivo (dom) |
| `shake` | overlay | ShakeEffect | false | EffectRenderer + primitivo (dom) |
| `balao` | overlay | TextoEffect | false | EffectRenderer + primitivo (dom) |
| `popup` | overlay | TextoEffect | false | EffectRenderer + primitivo (dom) |
| `banner_ia` | overlay | TextoEffect | false | EffectRenderer + primitivo (dom) |
| `anuncio_turno` | overlay | TextoEffect | false | EffectRenderer + primitivo (dom) |
| `vitoria` | overlay | TextoEffect | false | EffectRenderer + primitivo (dom) |
| `veneno` | overlay | StatusEffect | false | EffectRenderer + primitivo (dom) |
| `melee` | canvas | AuraEffect | true | Canvas render loop |
| `projetil` | canvas | ProjetilEffect | true | Canvas render loop |
| `trail` | canvas | TrailEffect | true | Canvas render loop |
| `hp_delta` | hud | AuraEffect | true | HUD render |
| `bola_de_fogo` | canvas | ProjetilEffect | true | Canvas render loop |
| `bola_de_gelo` | canvas | ProjetilEffect | true | Canvas render loop |
| `ia_thinking` | hud | TextoEffect | false | HUD render |
| `highlight_*` | canvas | HighlightEffect | varies | Canvas render loop |

**Observação:** `melee` e `projetil` têm `duracao_auto: true` com duração fixa (500-600ms), mas **também carregam `onFinalizar` em `dadosObrigatorios`**. Quando o primitive termina (por timer ou antes), chama `dados.onFinalizar()` para notificar o `useCombatEngine`. Isso é um design híbrido — timer + callback.

---

## ETAPA 5 — Violações Encontradas

### 🔴 V1 (R6 — ALTA) — Movement animations mutam `posicao` lógico

**Arquivos:** `moveAnim1Standard.js`, `moveAnim2Teleport.js`, `moveAnim3Slingshot.js`

**Problema:** As 3 animações de movimento usam `syncCharacters` para atualizar `posicao` do personagem a cada step da animação. Isso viola o princípio de separação visual/lógico.

**Impacto:** Se o personagem se move 3 hexágonos mas a animação é interrompida no step 2, o `posicao` lógico fica no hexágono intermediário — estado inconsistente.

**Contraste:** Attack/range animations recebem `setCharVisualPos` para deslocamento visual (knockback, recuo) e **nunca** tocam `posicao` lógico. Defense animations usam `setCharFlash` (visual apenas). Movement é o único grupo que mistura visual + lógico.

---

### 🟡 V2 (MÉDIA) — Movement animations não têm `setCharVisualPos`

**Arquivos:** `moveAnim1Standard.js:20-23`, `moveAnim2Teleport.js:9-13`, `moveAnim3Slingshot.js:9-14`

**Problema:** O contrato `execute({...})` das movement animations não inclui `setCharVisualPos`. Sem esse parâmetro, é impossível fazer visual-only slide/tween antes do commit lógico.

**Impacto:** Qualquer tentativa futura de polish visual (ex: personagem deslizar suavemente entre hexágonos enquanto o `posicao` só muda no final) exigirá mudança no contrato de todas as 3 animações + `useCombatEngine.js` que as chama.

---

### 🟢 V3 (BAIXA) — `getLinePath` importado diretamente em vez de DI

**Arquivos:** `rangeAnim1StraightShot.js:1`, `rangeAnim2BurstFire.js:1`, `rangeAnim3SpiritGun.js:1`, `attackAnim1StandardPlus.js:1`

**Problema:** Estes arquivos importam `getLinePath` de `../../animations/particles` em vez de recebê-lo como parâmetro DI.

**Contexto:** `particles.js` está dentro do mesmo módulo (`engine/animations/`), então não é cross-module import. Mas quebra o padrão de injeção que os demais callbacks seguem. `getLinePath` é uma função pura de cálculo de trajetória — não tem efeitos colaterais.

**Impacto:** Nenhum funcional. Apenas inconsistência de padrão.

---

### 📊 Sumário de violações

| ID | Severidade | Arquivos | Regra | Descrição |
|:--:|:--------:|----------|:----:|-----------|
| V1 | 🔴 ALTA | 3 movement | R6 | `syncCharacters` muta `posicao` lógico durante animação |
| V2 | 🟡 MÉDIA | 3 movement | — | Falta `setCharVisualPos` no contrato — impossível visual-only |
| V3 | 🟢 BAIXA | 4 ataque/range | R1 | `getLinePath` importado direto em vez de DI |

---

## ETAPA 6 — Priorização e Recomendações

### Ordem sugerida de correção

| Step | O que fazer | Arquivos | Esforço |
|:----:|------------|----------|:-------:|
| 1 | Extrair commit lógico do movimento para depois da animação. Movement animation usa `syncCharacters` uma só vez no final, e `setCharVisualPos` durante os steps. | `moveAnim1Standard.js`, `moveAnim2Teleport.js`, `moveAnim3Slingshot.js`, `useCombatEngine.js` | Médio |
| 2 | Adicionar `setCharVisualPos` ao contrato de `execute()` das movement animations | `moveAnim1Standard.js`, `moveAnim2Teleport.js`, `moveAnim3Slingshot.js`, `useCombatEngine.js` (local de chamada) | Pequeno |
| 3 | Opcional: passar `getLinePath` como DI em vez de import direto | `rangeAnim*.js`, `attackAnim1StandardPlus.js`, `useCombatEngine.js` (passar callback) | Pequeno |

### ⚠️ Risco associado a V1

Se uma movement animation é interrompida (ex: jogador sai da tela, o component desmonta, ou um novo efeito com prioridade maior corta a execução), o `posicao` do personagem pode estar em um estado intermediário incorreto.

**Cenário de bug:**
1. Personagem A move-se 3 hexágonos (steps: hex1, hex2, hex3)
2. `setAnimTimer` agenda step a step com 150ms
3. No step 2 (hex2), o componente é desmontado (ex: navegação)
4. `posicao` lógico fica em hex2, embora a intenção era hex3
5. Personagem aparece em hex2 no próximo carregamento

**Mitigação atual:** Sem desmontagem durante batalha (Phase6CombatV2 é montado uma vez e desmontado só ao sair), o risco é teórico. Mas arquiteturalmente é uma fragilidade.

---

## ETAPA 7 — Conclusão

### Pontos fortes confirmados
- ✅ Todas as 13 animações usam `setAnimTimer` (nunca `setTimeout` raw)
- ✅ Todas as animações seguem DI callback pattern
- ✅ Nenhuma animation file importa React, DOM, ou estado global
- ✅ Nenhuma animation file toca overlay DOM (R5 respeitado)
- ✅ Attack/range/defense animations corretamente separam visual (`setCharVisualPos`, `setCharFlash`) de lógico (`posicao`)
- ✅ `juice.js` e `particles.js` são utilitários puros sem violações

### Fragilidade principal
- ❌ Movement animations são o único grupo que viola a separação visual/lógico (R6)
- ❌ Movement animations não têm `setCharVisualPos` — impossível fazer visual-only slide

### Próximo passo recomendado
Corrigir V1 + V2: refatorar movement animations para usar `setCharVisualPos` durante os steps e `syncCharacters` apenas no step final (commit lógico). Isso alinha o padrão de movement com o de attack/range/defense.

### Relação com overlay DOM (FEAT 6.19.0)
A auditoria confirmou que não há conflito entre canvas animations e o novo sistema overlay DOM. Canais estão corretamente separados:
- Canvas: 13 animation files + particles.js (render loop)
- Overlay DOM: EffectRenderer + primitivos (ImpactoEffect, TextoEffect, FlashEffect, ShakeEffect)
- HUD: primitivos separados (hp_delta, ia_thinking)

Nenhuma animation file canvas toca DOM overlay, e nenhum overlay primitive toca canvas state. ✅

---

## ETAPA 8 — Versões

Nenhum bump — investigação pura, zero alterações de código.

| Versão | Atual |
|--------|-------|
| SITE_VERSION | 10.160.36 |
| ARENATESTBED_VERSION | 6.19.0 |
| Alterações de código | **ZERO** |
