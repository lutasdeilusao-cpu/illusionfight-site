# REFACTOR: animacoes.ataque → ataqueMelee + ataqueRange + attack registry

## 1. Output bruto dos 3 greps da Etapa 1

### Grep 1 — animacoes no useCombatEngine
```
40:      animacoes: {
41:        movimento:   bc.charData?.animacoes?.movimento   ?? 1,
42:        ataque:      bc.charData?.animacoes?.ataque      ?? 1,
43:        defesa:      bc.charData?.animacoes?.defesa      ?? 1,
44:        habilidade:  bc.charData?.animacoes?.habilidade  ?? 1,
45:        efeito:      bc.charData?.animacoes?.efeito      ?? 1,
288:    const moveAnimId = currentChar.animacoes?.movimento ?? 1
582:          const moveAnimId = iaAtual.animacoes?.movimento ?? 1
```

### Grep 2 — animacoes no Phase5bAnimDebug
```
9:  const TIPOS_ANIMACAO = ['movimento', 'ataque', 'defesa', 'habilidade', 'efeito']
18:        movimento: 1,
19:        ataque: 1,
20:        defesa: 1,
21:        habilidade: 1,
22:        efeito: 1,
```

### Grep 3 — tipoAtaque no useCombatEngine
```
380:    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
417:    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(...)
628:    ...atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf
656:              if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(...)
```

---

## 2. ANTES e DEPOIS de cada mudança

### ETAPA 2 — useCombatEngine.js (linhas 40-46)

**ANTES:**
```js
animacoes: {
  movimento:   bc.charData?.animacoes?.movimento   ?? 1,
  ataque:      bc.charData?.animacoes?.ataque      ?? 1,
  defesa:      bc.charData?.animacoes?.defesa      ?? 1,
  habilidade:  bc.charData?.animacoes?.habilidade  ?? 1,
  efeito:      bc.charData?.animacoes?.efeito      ?? 1,
},
```

**DEPOIS:**
```js
animacoes: {
  movimento:    bc.charData?.animacoes?.movimento    ?? 1,
  ataqueMelee:  bc.charData?.animacoes?.ataqueMelee  ?? 1,
  ataqueRange:  bc.charData?.animacoes?.ataqueRange  ?? 1,
  defesa:       bc.charData?.animacoes?.defesa       ?? 1,
  habilidade:   bc.charData?.animacoes?.habilidade   ?? 1,
  efeito:       bc.charData?.animacoes?.efeito       ?? 1,
},
```

---

### ETAPA 3 — Phase5bAnimDebug.jsx

**Lines 9-10 — TIPOS_ANIMACAO:**
```js
// ANTES:
const TIPOS_ANIMACAO = ['movimento', 'ataque', 'defesa', 'habilidade', 'efeito']

// DEPOIS:
const TIPOS_ANIMACAO = ['movimento', 'ataqueMelee', 'ataqueRange', 'defesa', 'habilidade', 'efeito']
```

**Lines 18-19 — Estado inicial do personagem:**
```js
// ANTES:
movimento: 1,
ataque: 1,

// DEPOIS:
movimento: 1,
ataqueMelee: 1,
ataqueRange: 1,
```

**Import adicionado (line 7):**
```js
// ANTES:
import { MovementAnimId } from '../engine/animations/movement/index'

// DEPOIS:
import { MovementAnimId } from '../engine/animations/movement/index'
import { AttackAnimId } from '../engine/animations/attack/index'
```

**Função getAnimIdEnum (nova, linhas 35-38):**
```js
function getAnimIdEnum(tipo) {
  if (tipo === 'movimento') return MovementAnimId
  if (tipo === 'ataqueMelee' || tipo === 'ataqueRange') return AttackAnimId
  return null
}
```

**Renderização dos botões (linhas 64-91):**
```js
// ANTES: switch 'movimento' → MovementAnimId, else → OPCOES [1,2,3]
// DEPOIS: genérico — se enumObj existe, usa Object.entries, senão OPCOES
```

**Label display — ataqueMelee → "Attack Melee", ataqueRange → "Attack Range":**
```js
{tipo === 'ataqueMelee' ? 'Attack Melee' :
 tipo === 'ataqueRange' ? 'Attack Range' :
 tipo.charAt(0).toUpperCase() + tipo.slice(1)}
```

---

### ETAPA 4 — Phase6CombatV2.jsx (linhas ~44-46)

**ANTES:**
```js
animacoes: animacoesPorChar[bc.charData?.id] || {
  movimento: 1, ataque: 1, defesa: 1, habilidade: 1, efeito: 1,
},
```

**DEPOIS:**
```js
animacoes: animacoesPorChar[bc.charData?.id] || {
  movimento: 1, ataqueMelee: 1, ataqueRange: 1,
  defesa: 1, habilidade: 1, efeito: 1,
},
```

---

### ETAPA 5 — Attack registry (arquivos novos)

**engine/animations/attack/attackAnim1Standard.js** (criado, 10 linhas):
```js
export function execute({
  charId, atacante, alvo, resultado,
  setAnimTimer, onFinalize,
}) {
  console.log('[ATTACK_ANIM] Standard execute', { charId })
  if (onFinalize) setAnimTimer(onFinalize, 300)
}
```

**engine/animations/attack/index.js** (criado, 25 linhas):
```js
import { execute as standard } from './attackAnim1Standard'

export const AttackAnimId = {
  STANDARD: 1,
  POWER:    2,
  CHARGE:   3,
}

const REGISTRY = {
  [AttackAnimId.STANDARD]: standard,
  [AttackAnimId.POWER]:    standard,
  [AttackAnimId.CHARGE]:   standard,
}

export function getAttackAnimation(id) {
  return REGISTRY[id] || REGISTRY[AttackAnimId.STANDARD]
}
```

---

## 3. attackAnim1Standard.js completo

```js
export function execute({
  charId, atacante, alvo, resultado,
  setAnimTimer, onFinalize,
}) {
  console.log('[ATTACK_ANIM] Standard execute', { charId })
  if (onFinalize) setAnimTimer(onFinalize, 300)
}
```

## 4. attack/index.js completo

```js
import { execute as standard } from './attackAnim1Standard'

export const AttackAnimId = {
  STANDARD: 1,
  POWER:    2,
  CHARGE:   3,
}

const REGISTRY = {
  [AttackAnimId.STANDARD]: standard,
  [AttackAnimId.POWER]:    standard,
  [AttackAnimId.CHARGE]:   standard,
}

export function getAttackAnimation(id) {
  return REGISTRY[id] || REGISTRY[AttackAnimId.STANDARD]
}
```

---

## 5. Teste lógico (5 cenórios)

**Cenário 1 — Inicialização do personagem:**
- `bc.charData.animacoes` ausente → default `{ movimento: 1, ataqueMelee: 1, ataqueRange: 1, defesa: 1, habilidade: 1, efeito: 1 }`
- Campo `ataque` não existe mais no objeto
✅

**Cenário 2 — Tela de debug:**
- Linha "Attack Melee" com botões 1/2/3 (via AttackAnimId) aparece
- Linha "Attack Range" com botões 1/2/3 (via AttackAnimId) aparece
- Linha "Ataque" (singular) não existe mais
✅

**Cenário 3 — onConfirmar passa estrutura correta:**
- `animacoesPorChar[charId]` contém `{ movimento, ataqueMelee, ataqueRange, defesa, habilidade, efeito }`
- Campo `ataque` ausente
✅

**Cenário 4 — Registry de ataque com fallback:**
- `getAttackAnimation(AttackAnimId.POWER)` retorna `standard` (placeholder)
- `getAttackAnimation(99)` retorna `standard` (fallback)
✅

**Cenário 5 — Movimento não afetado:**
- `animacoes.movimento` continua funcionando normalmente (linhas 288, 582)
- Três animações de movimento intactas
✅

---

## 6. Output completo do npm run build

```
vite v8.0.16 building client environment for production...
✓ 1260 modules transformed.
✓ built in 1.82s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

1260 módulos (antes 1258 → +2 attack files). 0 erros. Sourcemaps preservados.

---

## 7. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump (patch) | 6.14.0 → **6.14.1** |
| `src/config/version.js` | SITE_VERSION bump (patch) | 10.160.25 → **10.160.26** |
| `SITE_MAP.md` | Versões atualizadas + attack registry listing | ✅ |
| `engine/animations/attack/attackAnim1Standard.js` | **CRIADO** — placeholder de ataque Standard | ✅ |
| `engine/animations/attack/index.js` | **CRIADO** — AttackAnimId enum + getAttackAnimation() fallback | ✅ |
| `engine/useCombatEngine.js` | `ataque` → `ataqueMelee` + `ataqueRange` na init do character | ✅ |
| `phases/Phase5bAnimDebug.jsx` | TIPOS_ANIMACAO + estado + AttackAnimId import + labels | ✅ |
| `phases/Phase6CombatV2.jsx` | fallback de animacoes atualizado (removido ataque) | ✅ |
| **Commit** | `d0502255` — `refactor: animacoes.ataque → ataqueMelee + ataqueRange + attack registry + v6.14.1` | ✅ |
| **Deploy** | Published | ✅ |
