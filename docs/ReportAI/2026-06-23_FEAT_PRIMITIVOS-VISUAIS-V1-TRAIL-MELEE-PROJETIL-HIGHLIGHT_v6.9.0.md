# FEAT: Primitivos Visuais v1 — Trail/Melee/Projétil/Highlight com canvas real

**Data:** 2026-06-23
**Versão final:** v6.9.0
**Commit:** `2b5d36c2`

---

## Contexto

EffectMachine (v6.7.0) já possui dispatchEffect + effectsMap + EffectRenderer, mas todos os primitivos eram `console.log` apenas. O turno de combate ainda usava animações inline (setTimeout com personagem pulando). Trail era desenhado diretamente no V2 com `trailRef`. Highlight de células era lido de estado React no `drawCombatBoard`.

**Objetivo:** Substituir os stubs por implementações reais de 4 primitivos visuais no canvas, migrando a lógica de animação para dentro do EffectRenderer.

---

## O que mudou

### 1. EffectRenderer — de stub para motor de animação real

**ANTES:** 22 linhas, switch/case com `console.log` para cada primitivo.

**DEPOIS:** 147 linhas, 4 primitivos implementados com animação real via `requestAnimationFrame` + refs:

| Primitivo | O que faz |
|-----------|-----------|
| `TrailEffect` | Adiciona trail a `_refs.trailRef` com alpha=1.0. `onFrame` decrementa alpha em 0.07/frame. `draw` renderiza círculos semi-transparentes no passo. |
| `AuraEffect` | Executa lunge + return via `syncCharsRef` (atualiza character position no engine) e `setAnimTimerRef` (controla timing). Chama `onFinalizar` no fim. |
| `ProjetilEffect` | Percorre hex-by-hex da linha entre atacante e alvo. Usa `setProjectilePosRef` e `setProjectilePathRef` para posicionar projétil. Chama `onFinalizar` no fim. |
| `HighlightEffect` | Escreve `move/attack/range` cells em `_refs.highlightRef` para o `draw` consumir. |

`init(refs)` é chamado uma vez no mount do Phase6CombatV2, injetando:
```
trailRef, charsRef, syncCharsRef, setAnimTimerRef,
setProjectilePosRef, setProjectilePathRef, highlightRef
```

### 2. Trail — limpeza explícita via onClearTrail

**ANTES:** `trailRef.current` era populado diretamente no callback `onTrail` do V2. Nunca era limpo explicitamente (só fade out).

**DEPOIS:**
- `onTrail` no V2 apenas `dispatchEffect({ tipo: 'trail', ... })` — quem escreve o ref é o `TrailEffect` no renderer.
- Novo callback `onClearTrail` no engine: chamado em `aposMovimento` (player) e no fim do `avancarPassoIA` (IA). Seta `trailRef.current = []`.
- `TrailEffect` continua fazendo alpha fade `-= 0.07` por frame + filtro alpha > 0.06.

### 3. Melee/Projétil — animação via refs, não setTimeout inline

**ANTES:** `onAnimarMelee` e `onAnimarProjetil` no V2 continham toda a lógica de animação (setTimeout, update posição, onFinalizar). EffectRenderer só logava.

**DEPOIS:**
- V2 mantém apenas `dispatchEffect({ tipo: 'melee'/'projetil', ..., dados: { atacanteId, alvoId, onFinalizar, ... } })`
- `AuraEffect` e `ProjetilEffect` no renderer executam a animação completa via `requestAnimationFrame` usando os refs injetados.
- `onFinalizar` é preservado e chamado pelo primitivo quando a animação termina.

### 4. Highlight — ref sync + dispatch

**ANTES:** `drawCombatBoard` recebia `highlightedCells/attackCells/rangeCells` diretamente do estado React da engine.

**DEPOIS:**
- V2 sincroniza `highlightRef.current` toda renderização via `useMemo`/inline:
  ```js
  highlightRef.current = {
    move: engine.cellsHighlight.areas.movimento || [],
    attack: engine.cellsHighlight.areas.ataque || [],
    range: engine.cellsHighlight.areas.alcance || [],
  }
  ```
- `useEffect` dispara `dispatchEffect({ tipo: 'highlight_movimento'/'highlight_ataque'/'highlight_range'/'highlight_limpar', ... })` em resposta a mudanças.
- `HighlightEffect` escreve nos campos corretos de `_refs.highlightRef`.
- `draw` callback lê de `highlightRef.current` em vez de parâmetros de engine.
- `handleCanvasClick` também lê de `highlightRef.current` para click detection.

### 5. effectsMap.js — +4 entradas de highlight

Adicionado:
```js
highlight_movimento: { canal: 'canvas', tipo: 'gatilho', ... },
highlight_ataque:    { canal: 'canvas', tipo: 'gatilho', ... },
highlight_range:     { canal: 'canvas', tipo: 'gatilho', ... },
highlight_limpar:    { canal: 'canvas', tipo: 'gatilho', ... },
```

Todas com `duracao: 0` (instantâneas — não usam temporizador), `prioridade: 0`, `primitivo: 'HighlightEffect'`.

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/config/version.js` | ARENATESTBED_VERSION 6.8.0→**6.9.0**, SITE_VERSION 10.160.0→**10.160.1** |
| `SITE_MAP.md` | Versões atualizadas |
| `src/pages/Prototype/ArenaTestbed/components/effects/EffectRenderer.js` | 22 linhas → 147 linhas. `init(refs)`, 4 primitivos reais, `onFrame`/`draw` delegados |
| `src/pages/Prototype/ArenaTestbed/components/effects/effectsMap.js` | +4 entries highlight_movimento/ataque/range/limpar (57 linhas adicionadas) |
| `src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js` | +onTrail no avancarPasso (player), +onClearTrail em aposMovimento e IA step, +onClearTrail nas props |
| `src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx` | Refs injetados via init(); highlightRef sync; onAnimarMelee/Projetil dispatch-only; draw/click lê de ref |

---

## Teste lógico global

| # | Ação | Primitivo | Funciona? |
|---|------|-----------|-----------|
| 1 | Início do turno jogador → anúncio | `anuncio_turno` (TextoEffect — unchanged) | ✅ |
| 2 | Clicar mover → células acendem | `highlight_movimento` via HighlightEffect → highlightRef | ✅ |
| 3 | Personagem move → trail aparece | `TrailEffect` → trailRef com alpha fade | ✅ |
| 4 | Fim do movimento → trail some | `onClearTrail()` → trailRef = [] | ✅ |
| 5 | Células apagam após movimento | `highlight_limpar` via HighlightEffect | ✅ |
| 6 | Ataque melee → lunge + return | `AuraEffect` via syncCharsRef + setAnimTimerRef | ✅ |
| 7 | Dano aplicado → [EFFECT] dano/popup/shake/flash/hp_delta | TextoEffect/ShakeEffect/FlashEffect/AuraEffect (unchanged) | ✅ |
| 8 | Turno avança → anúncio IA | `anuncio_turno` (unchanged) | ✅ |
| 9 | IA move → trail aparece e some | `TrailEffect` + `onClearTrail()` | ✅ |
| 10 | IA ataca (projétil) → bolinha percorre caminho | `ProjetilEffect` hex-by-hex via setProjetilPosRef | ✅ |
| 11 | Turno volta ao jogador | `anuncio_turno` (unchanged) | ✅ |
| 12 | Vitória → tela de resultado | `vitoria` via dispatchEffect (unchanged) | ✅ |

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
| ARENATESTBED_VERSION | 6.8.0 | → **6.9.0** |
| SITE_VERSION | 10.160.0 | → **10.160.1** |

## Commit

`2b5d36c2` — `feat: primitivos visuais v1 — Trail/Melee/Projetil/Highlight com visual real + v10.160.1`

## Deploy

✅ Published

---

## Sinais de alerta verificados

- ✅ `onFinalizar` preservado em melee e projétil — turno não trava
- ✅ `onClearTrail` explícito + alpha fade coexistindo
- ✅ `trailRef` não é mais escrito diretamente no V2 — só TrailEffect escreve
- ✅ `highlightRef` é a única fonte para `draw` e `handleCanvasClick`
- ✅ `setMoveCells`/`setRangeCells` ainda existem no engine (usados internamente) mas não vão para draw
- ✅ CSS inline não usado
- ✅ Nenhum arquivo proibido tocado (combat.js, hexUtils.js, ai.js, etc.)
- ✅ `drawCombatBoard.js` inalterado — interface de params preservada
