# FIX: Spinner IA Thinking durante turno jogador + TypeError row undefined projétil IA

> Versão: 6.4.0 / 10.158.15
> Hash: `22a0cc6b`
> Deploy: `Published` ✅

---

## Etapa 1 — Prova de leitura (outputs brutos)

### grep 1 — UI states
```
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:145:  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:157:  const isPlayerTurn = currentChar?.time === 'jogador'
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:177:    console.log('[TC-16] iaThinking mudou', { iaThinking, isPlayerTurn: currentChar?.time === 'jogador', currentCharId: currentChar?.id })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:178:  }, [iaThinking])
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:223:    if (!canvas || inputLockedRef.current || !isPlayerTurn || winner) return
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:236:    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:262:  }, [isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:387:        {actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && !inputLocked && (
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:421:              {isPlayerTurn && subPhase && (
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:425:                if (iaThinking) {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:426:                  console.log('[VIS-01] texto iaThinking VISÍVEL NA TELA (top bar)', {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:427:                    iaThinking, isPlayerTurn, currentCharId,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:433:                return iaThinking ? ` 🤖 ${t('prototype.arena_testbed.ia_thinking_short')}` : null
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:483:        <div className="atb-bottom-nav">
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:485:            const mostraSpinner = !isPlayerTurn || iaThinking || inputLocked
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:486:            if (mostraSpinner) {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:487:              console.log('[VIS-02] texto iaThinking VISÍVEL NA TELA (bottom nav spinner)', {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:488:                isPlayerTurn, iaThinking, inputLocked,
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:495:          {isPlayerTurn && !iaThinking && !inputLocked ? (
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:528:              <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
```

### grep 2 — Projétil animation
```
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:88:    onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:91:      const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:92:      setProjectilePath(steps)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:93:      let stepIdx = 0
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:94:      function avancar() {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:95:        if (stepIdx >= steps.length) {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:96:          setProjectilePos(null); setProjectilePath([])
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:97:          if (onFinalizar) onFinalizar(); return
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:98:        }
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:99:        const passo = steps[stepIdx]
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:100:        if (!passo || passo.row === undefined || passo.col === undefined) {
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:101:          setProjectilePos(null); setProjectilePath([])
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:102:          if (onFinalizar) onFinalizar(); return
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:103:        }
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:104:        setProjectilePos({ row: passo.row, col: passo.col })
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:105:        setProjectilePath(prev => prev.filter((_, i) => i > 0))
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:106:        stepIdx++
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:107:        engine.utils.setAnimTimer(avancar, 320)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:108:      }
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:109:      avancar()
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:146:    onProjetilPos: (pos) => setProjectilePos(pos),
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:147:    onProjetilPath: (path) => setProjectilePath(path),
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:170:  const [projectilePos, setProjectilePos] = useState(null)
src\pages\Prototype\ArenaTestbed\phases\Phase6CombatV2.jsx:171:  const [projectilePath, setProjectilePath] = useState([])
```

---

## Bug 1 — Spinner "AI thinking" durante turno do jogador

### ANTES (linhas 495–526)
```jsx
{isPlayerTurn && !iaThinking && !inputLocked ? (
  <>
    {subPhase === 'free' && (
      <button className="atb-action-btn atb-action-btn--end-turn" onClick={actions.finalizarTurno}>
        ⏭ {t('prototype.arena_testbed.end_turn')}
      </button>
    )}
    {subPhase === 'movimento' && (
      <>
        {pendingMove ? (
          <>
            <button className="atb-action-btn atb-action-btn--confirm" onClick={actions.confirmarMovimento}>
              ✓ {t('prototype.arena_testbed.btn_confirm_move')}
            </button>
            <button className="atb-action-btn atb-action-btn--cancel" onClick={actions.cancelarAcao}>
              ✕ {t('prototype.arena_testbed.btn_cancel')}
            </button>
          </>
        ) : null}
      </>
    )}
    {subPhase === 'acao' && subPhaseStep === 'escolher_alvo' && (
      <button className="atb-action-btn atb-action-btn--cancel" onClick={actions.cancelarAcao}>
        × {t('prototype.arena_testbed.btn_cancel')}
      </button>
    )}
  </>
) : (
  <div className="atb-ia-thinking-row">
    <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
  </div>
)}
```

### DEPOIS (linhas 495–527)
```jsx
{isPlayerTurn && !iaThinking && !inputLocked ? (
  <>
    ... (mesmos botões) ...
  </>
) : iaThinking ? (
  <div className="atb-ia-thinking-row">
    <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
  </div>
) : null}
```

**O que mudou:** O `else` puro (`: ( ... )`) foi substituído por `: iaThinking ? ( ... ) : null`. Agora o spinner só renderiza quando `iaThinking` é `true`. Se `inputLocked` for `true` mas `iaThinking` for `false` (ex: animação do jogador), nada é renderizado.

---

## Bug 2 — TypeError 'row' undefined em onAnimarProjetil

### ANTES (linhas 94–108)
```jsx
function avancar() {
  if (stepIdx >= steps.length) {
    setProjectilePos(null); setProjectilePath([])
  }
  setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
  setProjectilePath(prev => prev.filter((_, i) => i > 0))
  stepIdx++
  engine.utils.setAnimTimer(avancar, 320)
}
```

**Problemas:**
1. Sem `return` após o early guard — execução continuava para `steps[stepIdx].row` mesmo com `stepIdx >= steps.length`
2. Sem `onFinalizar()` — callback nunca era chamado, travando a engine após projétil
3. Sem guarda `!passo` — se `steps[stepIdx]` fosse `undefined`, crashava

### DEPOIS (linhas 94–108)
```jsx
function avancar() {
  if (stepIdx >= steps.length) {
    setProjectilePos(null); setProjectilePath([])
    if (onFinalizar) onFinalizar(); return
  }
  const passo = steps[stepIdx]
  if (!passo || passo.row === undefined || passo.col === undefined) {
    setProjectilePos(null); setProjectilePath([])
    if (onFinalizar) onFinalizar(); return
  }
  setProjectilePos({ row: passo.row, col: passo.col })
  setProjectilePath(prev => prev.filter((_, i) => i > 0))
  stepIdx++
  engine.utils.setAnimTimer(avancar, 320)
}
```

---

## Teste lógico — fluxo por fluxo

### Fluxo 1 — Spinner durante turno do jogador (animação)
1. Jogador move — `inputLocked: true` durante animação
2. JSX avalia: `isPlayerTurn=true`, `iaThinking=false`, `inputLocked=true`
3. Condição principal `isPlayerTurn && !iaThinking && !inputLocked` → **false**
4. Vai para `iaThinking?` — `iaThinking=false` → **null** → nada renderiza ✅

### Fluxo 2 — Spinner durante turno da IA (comportamento esperado)
1. IA executando — `iaThinking: true`
2. JSX avalia: `isPlayerTurn=false`, `iaThinking=true`
3. Condição principal → **false** (isPlayerTurn é false)
4. Vai para `iaThinking?` — `iaThinking=true` → spinner renderiza ✅

### Fluxo 3 — Projétil da IA sem crash
1. IA ataca com projétil
2. `onAnimarProjetil` chamado com steps válidos
3. `avancar()` verifica `!passo` antes de acessar `.row`
4. Se passo `undefined` → `onFinalizar` chamado, sem crash ✅

### Fluxo 4 — Projétil do jogador não foi afetado
1. A correção está em `onAnimarProjetil` no V2
2. Tanto IA quanto jogador usam o **mesmo** callback
3. A guarda `if (!passo)` protege ambos sem quebrar nada ✅

---

## Build output (npm run build)

```
vite v8.0.16 building client environment for production...
✓ 1247 modules transformed.
✓ built in 971ms
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Apenas warnings de chunk size e dynamic import (pré-existentes, não relacionados).

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.3.9 → **6.4.0** |
| `src/config/version.js` | SITE_VERSION bump | 10.158.14 → **10.158.15** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| **Commit** | `22a0cc6b` — `fix(arenatestbed): spinner iaThinking durante turno jogador + TypeError row undefined projetil IA + v6.4.0` | ✅ |
| **Deploy** | Status | ✅ |

---

## Teste manual pendente

- [ ] Mover jogador durante animação — spinner não deve aparecer
- [ ] Atacar — spinner não deve aparecer durante animação do ataque
- [ ] Turno da IA — spinner deve aparecer normalmente
- [ ] IA com ataque à distância — projétil deve animar sem crash e turno deve passar para o jogador normalmente
