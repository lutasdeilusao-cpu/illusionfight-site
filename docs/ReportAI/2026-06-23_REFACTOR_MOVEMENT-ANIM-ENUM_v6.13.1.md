# REFACTOR: MovementAnimId enum no registry de animações de movimento

## 1. Output bruto dos greps da Etapa 1

### Cat do registry
```
import { execute as standard  } from './moveAnim1Standard'
import { execute as teleport  } from './moveAnim2Teleport'
import { execute as slingshot } from './moveAnim3Slingshot'

export const MOVEMENT_ANIMATIONS = {
  1: standard,
  2: teleport,
  3: slingshot,
}

export function getMovementAnimation(id) {
  return MOVEMENT_ANIMATIONS[id] || MOVEMENT_ANIMATIONS[1]
}
```

### Grep: moveAnimId / MOVEMENT_ANIMATIONS
```
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:5:  const campos = ['moveAnimId', 'attackAnimId', ...
src\pages\Prototype\ArenaTestbed\components\effects\effectsMap.js:127:    dadosObrigatorios: ['row', 'col', 'moveAnimId'],
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:286:    const moveAnimId = currentChar.animacoes?.movimento ?? 1
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:287:    const animFn = getMovementAnimation(moveAnimId)
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:305:      moveAnimId,
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:577:          const moveAnimId = iaAtual.animacoes?.movimento ?? 1
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:578:          const animFn = getMovementAnimation(moveAnimId)
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:596:            moveAnimId,
src\pages\Prototype\ArenaTestbed\engine\animations\movement\index.js:5:export const MOVEMENT_ANIMATIONS = {
src\pages\Prototype\ArenaTestbed\engine\animations\movement\index.js:12:  return MOVEMENT_ANIMATIONS[id] || MOVEMENT_ANIMATIONS[1]
...
```

## 2. index.js — ANTES e DEPOIS

### ANTES (13 linhas)
```js
import { execute as standard  } from './moveAnim1Standard'
import { execute as teleport  } from './moveAnim2Teleport'
import { execute as slingshot } from './moveAnim3Slingshot'

export const MOVEMENT_ANIMATIONS = {
  1: standard,
  2: teleport,
  3: slingshot,
}

export function getMovementAnimation(id) {
  return MOVEMENT_ANIMATIONS[id] || MOVEMENT_ANIMATIONS[1]
}
```

### DEPOIS (23 linhas)
```js
import { execute as standard  } from './moveAnim1Standard'
import { execute as teleport  } from './moveAnim2Teleport'
import { execute as slingshot } from './moveAnim3Slingshot'

/**
 * MovementAnimId — enum de IDs de animação de movimento.
 * Ao adicionar nova animação:
 *   1. Criar moveAnimN[Name].js com export function execute(...)
 *   2. Importar aqui
 *   3. Adicionar entrada no enum
 *   4. Registrar no REGISTRY
 */
export const MovementAnimId = {
  STANDARD:  1,
  TELEPORT:  2,
  SLINGSHOT: 3,
}

const REGISTRY = {
  [MovementAnimId.STANDARD]:  standard,
  [MovementAnimId.TELEPORT]:  teleport,
  [MovementAnimId.SLINGSHOT]: slingshot,
}

export function getMovementAnimation(id) {
  return REGISTRY[id] || REGISTRY[MovementAnimId.STANDARD]
}
```

## 3. Phase5bAnimDebug.jsx — botões de Movimento

### ANTES (linhas 62-78)
```jsx
{TIPOS_ANIMACAO.map(tipo => (
  <div key={tipo} className="tab-anim-debug-row">
    <span className="tab-anim-debug-label">{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
    <div className="tab-anim-debug-btns">
      {OPCOES.map(val => (
        <button
          key={val}
          className={`tab-anim-debug-btn ${chAnim?.[tipo] === val ? 'active' : ''}`}
          onClick={() => setAnim(id, tipo, val)}
        >
          {val}
        </button>
      ))}
    </div>
  </div>
))}
```

### DEPOIS (linhas 64-88)
```jsx
{TIPOS_ANIMACAO.map(tipo => (
  <div key={tipo} className="tab-anim-debug-row">
    <span className="tab-anim-debug-label">{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
    <div className="tab-anim-debug-btns">
      {tipo === 'movimento' ? (
        Object.entries(MovementAnimId).map(([name, animId]) => (
          <button
            key={animId}
            className={`tab-anim-debug-btn ${chAnim?.[tipo] === animId ? 'active' : ''}`}
            onClick={() => setAnim(id, tipo, animId)}
          >
            {animId}
          </button>
        ))
      ) : (
        OPCOES.map(val => (
          <button
            key={val}
            className={`tab-anim-debug-btn ${chAnim?.[tipo] === val ? 'active' : ''}`}
            onClick={() => setAnim(id, tipo, val)}
          >
            {val}
          </button>
        ))
      )}
    </div>
  </div>
))}
```

Também adicionado import: `import { MovementAnimId } from '../engine/animations/movement/index'`

## 4. Grep de confirmação — useCombatEngine

```
src\...\engine\useCombatEngine.js:286:    const moveAnimId = currentChar.animacoes?.movimento ?? 1
src\...\engine\useCombatEngine.js:577:          const moveAnimId = iaAtual.animacoes?.movimento ?? 1
```

Nenhum ID numérico hardcoded além do fallback `?? 1` — confirmado.

## 5. Teste lógico

**Cenário 1 — Registry com enum:** `getMovementAnimation(MovementAnimId.TELEPORT)` → teleport. `getMovementAnimation(2)` → teleport (retrocompatível). `getMovementAnimation(99)` → standard (fallback). ✅

**Cenário 2 — Phase5bAnimDebug botões:** Botões de Movimento renderizados de `Object.entries(MovementAnimId)`. Se `DASH: 4` for adicionado ao enum, o botão 4 aparece sem outras mudanças. ✅

**Cenário 3 — Sem quebra:** `animacoes?.movimento ?? 1` continua como default. Standard executado para personagens sem animação alterada. ✅

## 6. Output do build

```
vite v8.0.16 building client environment for production...
✓ 1257 modules transformed.
✓ built in 1.76s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Nenhum erro.

## 7. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump (patch) | 6.13.0 → **6.13.1** |
| `src/config/version.js` | SITE_VERSION bump (patch) | 10.160.23 → **10.160.24** |
| `SITE_MAP.md` | Versões atualizadas | ✅ |
| `engine/animations/movement/index.js` | MovementAnimId enum + REGISTRY nomeado | ✅ |
| `Phase5bAnimDebug.jsx` | Botões de Movimento via enum | ✅ |
| **Commit** | `82999532` — `refactor: MovementAnimId enum...` | ✅ |
| **Deploy** | Published | ✅ |
