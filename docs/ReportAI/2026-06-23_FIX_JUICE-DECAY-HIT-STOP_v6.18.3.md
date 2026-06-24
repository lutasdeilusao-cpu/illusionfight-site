# FIX: Juice — decay pausado durante hit stop

> **Data:** 2026-06-23
> **Versão:** ARENATESTBED **6.18.3** / SITE **10.160.34**
> **Commit:** `a240f1ef`
> **Status:** Deploy publicado ✅
> **Early return do draw removido:** ✅ Sim
> **Logs INV removidos:** ✅ Sim

---

## ETAPA 1 — Prova de leitura

### Grep 1 — onFrame + update* + isHitStop em Phase6CombatV2.jsx

```
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:22:  triggerShake, updateShake, applyShake, restoreShake, ShakePreset,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:23:  triggerCanvasFlash, updateCanvasFlash, drawCanvasFlash, FlashPreset,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:24:  triggerHitStop, isHitStopActive, HitStopPreset,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:25:  spawnFloatingText, updateFloatingTexts, drawFloatingTexts, TextPreset,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:338:    if (isHitStopActive(hitStopRef)) {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:378:    onFrame: () => {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:392:      updateShake(shakeRef)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:393:      updateCanvasFlash(canvasFlashRef)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:394:      updateFloatingTexts(floatingTextsRef)
```

### Grep 2 — isHitStopActive em juice.js

```
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:112: * @param {Object} hitStopRef - { active, duration, startTime }
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:113: * @param {number} [duration=90] - milliseconds
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:115:export function triggerHitStop(hitStopRef, duration = 90) {
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:117:  hitStopRef.current = { active: true, duration, startTime: Date.now() }
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:127:export function isHitStopActive(hitStopRef) {
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:128:  const h = hitStopRef.current
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:129:  if (!h?.active) return false
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:130:  if (Date.now() - h.startTime >= h.duration) {
src\pages\Prototype\ArenaTestbed\engine\animations\juice.js:131:    hitStopRef.current = null
```

---

## ETAPA 2 — Correção: onFrame com hit stop guard

### ANTES (Phase6CombatV2.jsx linhas 378-396)

```javascript
    onFrame: () => {
      angleRef.current = (angleRef.current || 0) + 0.018
      trailRef.current = trailRef.current
        .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
        .filter(t => t.alpha > 0)
      particlesRef.current = updateParticles(particlesRef.current)
      if (projectileRef.current?.active) {
        projectileRef.current = {
          ...projectileRef.current,
          trail: (projectileRef.current.trail || [])
            .map(t => ({ ...t, alpha: t.alpha - 0.08 }))
            .filter(t => t.alpha > 0),
        }
      }
      updateShake(shakeRef)
      updateCanvasFlash(canvasFlashRef)
      updateFloatingTexts(floatingTextsRef)
      frameCountRef.current++
    },
```

### DEPOIS (Phase6CombatV2.jsx linhas 378-399)

```javascript
    onFrame: () => {
      angleRef.current = (angleRef.current || 0) + 0.018

      const hitStopAtivo = isHitStopActive(hitStopRef)

      if (!hitStopAtivo) {
        trailRef.current = trailRef.current
          .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
          .filter(t => t.alpha > 0)
        particlesRef.current = updateParticles(particlesRef.current)
        if (projectileRef.current?.active) {
          projectileRef.current = {
            ...projectileRef.current,
            trail: (projectileRef.current.trail || [])
              .map(t => ({ ...t, alpha: t.alpha - 0.08 }))
              .filter(t => t.alpha > 0),
          }
        }
        updateShake(shakeRef)
        updateCanvasFlash(canvasFlashRef)
        updateFloatingTexts(floatingTextsRef)
      }

      frameCountRef.current++
    },
```

---

## ETAPA 3 — Remoção do early return no draw

### ANTES (Phase6CombatV2.jsx linhas 337-340)

```javascript
    // hit stop check — skip frame render entirely
    if (isHitStopActive(hitStopRef)) {
      return
    }
```

### DEPOIS

Removido completamente. O draw agora renderiza todos os frames, inclusive durante hit stop. O hit stop apenas pausa os decays no onFrame, mas não impede o render.

---

## ETAPA 4 — Remoção dos logs de diagnóstico (INV)

### Confirmação: zero `console.log('[JUICE]')` restantes

```
PS> Select-String -Path "useCombatEngine.js", "Phase6CombatV2.jsx", "juice.js" -Pattern "console.log.*JUICE"
(no output)
```

12 logs removidos de 3 arquivos:
| Arquivo | Logs removidos |
|---------|---------------|
| `juice.js` | triggerShake, updateShake, triggerCanvasFlash, drawCanvasFlash, triggerHitStop, spawnFloatingText, drawFloatingTexts count |
| `useCombatEngine.js` | dispararJuice called (multi-line), EARLY RETURN, dispararJuice pos |
| `Phase6CombatV2.jsx` | onJuiceHit received |

---

## ETAPA 5 — Teste lógico

### Cenário 1 — Hit stop ativo
1. Dano → `triggerHitStop` → `triggerShake` → `triggerCanvasFlash` → `spawnFloatingText`
2. Por N frames (80-200ms): `isHitStopActive` = true
3. `onFrame`: `hitStopAtivo` true → **pula** todos os decays (`updateShake`, `updateCanvasFlash`, `updateFloatingTexts`, trail, particles, projectile trail)
4. `draw`: executa normalmente (early return removido) → renderiza shake, flash e textos em **pico de intensidade**
5. Hit stop expira → `isHitStopActive` = false → `onFrame` retoma decays normalmente

✅ **Correto: efeitos congelados em pico durante hit stop.**

### Cenário 2 — Shake visível
- `shakeRef.current` populado no impacto
- `draw` não retorna cedo → `applyShake(ctx, shakeRef)` executa → `ctx.translate(s.offsetX, s.offsetY)` move o canvas
- O shake é renderizado em todos os frames do hit stop

✅ **Correto: shake renderizado durante hit stop.**

### Cenário 3 — Sem hit stop
- `isHitStopActive` = false sempre
- `onFrame`: `!hitStopAtivo` = true → decays executam normalmente
- Shake decai, flash fade, textos flutuam e somem

✅ **Correto: comportamento normal preservado.**

---

## ETAPA 6 — Build output

```
> illusion-fight@1.0.0 build
> vite build && node scripts/prerender-routes.js

vite v8.0.16 building client environment for production...
✓ 1270 modules transformed.
...
✓ built in 2.21s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Build sem warnings novos.

---

## ETAPA 7 — Versões, hash, deploy

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | 10.160.33 | → **10.160.34** |
| `ARENATESTBED_VERSION` | 6.18.2 | → **6.18.3** |

| Item | Detalhe |
|------|---------|
| **Commit** | `a240f1ef` — `fix: juice decay pausado durante hit stop + early return do draw removido + limpa logs INV + v6.18.3` |
| **Push** | ✅ `main → main` |
| **Deploy** | ✅ Published |
| **Early return no draw removido** | ✅ Sim |
| **Logs INV removidos** | ✅ Sim (zero restantes) |
| **Relatório** | `docs/ReportAI/2026-06-23_FIX_JUICE-DECAY-HIT-STOP_v6.18.3.md` |
