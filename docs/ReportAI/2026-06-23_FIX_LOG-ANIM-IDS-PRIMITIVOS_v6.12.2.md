# FIX: logAnimIds em todos os primitivos EffectRenderer

## 1. Output bruto do grep (Etapa 1)

```
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:25:const primitivos = {
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:27:    console.log('[PRIMITIVO] ProjetilEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:71:  ImpactoEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] ImpactoEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:74:    console.log('[PRIMITIVO] AuraEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:112:    console.log('[PRIMITIVO] TrailEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:122:    console.log('[PRIMITIVO] HighlightEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:137:  StatusEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] StatusEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:138:  TextoEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] TextoEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:139:  FlashEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] FlashEffect',
src\pages\Prototype\ArenaTestbed\components\effects\EffectRenderer.js:140:  ShakeEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] ShakeEffect',
```

## 2. Função `logAnimIds` completa (linhas 3-12)

```js
function logAnimIds(primitivo, dados) {
  const animIds = {}
  const campos = ['moveAnimId', 'attackAnimId', 'defenseAnimId', 'skillAnimId', 'effectAnimId']
  campos.forEach(campo => {
    if (dados?.[campo] !== undefined) animIds[campo] = dados[campo]
  })
  if (Object.keys(animIds).length > 0) {
    console.log(`[ANIM][${primitivo}]`, animIds)
  }
}
```

## 3. ANTES e DEPOIS de cada primitivo

### ProjetilEffect (linhas 37-81)
**ANTES (linha 27):**
```js
    console.log('[PRIMITIVO] ProjetilEffect', { params, dados, alvo })
    const { atacanteId, alvoId, onFinalizar } = dados
```
**DEPOIS (linhas 38-40):**
```js
    console.log('[PRIMITIVO] ProjetilEffect', { params, dados, alvo })
    logAnimIds('ProjetilEffect', dados)
    const { atacanteId, alvoId, onFinalizar } = dados
```

### ImpactoEffect (linhas 83-86)
**ANTES (linha 71):**
```js
  ImpactoEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] ImpactoEffect', { params, dados, alvo }),
```
**DEPOIS (linhas 83-86):**
```js
  ImpactoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ImpactoEffect', { params, dados, alvo })
    logAnimIds('ImpactoEffect', dados)
  },
```

### AuraEffect (linhas 88-125)
**ANTES (linha 74):**
```js
    console.log('[PRIMITIVO] AuraEffect', { params, dados, alvo })
    const { atacanteId, alvoId, onFinalizar } = dados
```
**DEPOIS (linhas 89-91):**
```js
    console.log('[PRIMITIVO] AuraEffect', { params, dados, alvo })
    logAnimIds('AuraEffect', dados)
    const { atacanteId, alvoId, onFinalizar } = dados
```

### TrailEffect (linhas 127-136)
**ANTES (linha 112):**
```js
    console.log('[PRIMITIVO] TrailEffect', { params, dados, alvo })
    if (!_refs.trailRef) return
```
**DEPOIS (linhas 128-130):**
```js
    console.log('[PRIMITIVO] TrailEffect', { params, dados, alvo })
    logAnimIds('TrailEffect', dados)
    if (!_refs.trailRef) return
```

### HighlightEffect (linhas 138-153)
**ANTES (linha 122):**
```js
    console.log('[PRIMITIVO] HighlightEffect', { params, dados, alvo })
    if (!_refs.highlightRef) return
```
**DEPOIS (linhas 139-141):**
```js
    console.log('[PRIMITIVO] HighlightEffect', { params, dados, alvo })
    logAnimIds('HighlightEffect', dados)
    if (!_refs.highlightRef) return
```

### StatusEffect (linhas 155-158)
**ANTES (linha 137):**
```js
  StatusEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] StatusEffect', { params, dados, alvo }),
```
**DEPOIS (linhas 155-158):**
```js
  StatusEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] StatusEffect', { params, dados, alvo })
    logAnimIds('StatusEffect', dados)
  },
```

### TextoEffect (linhas 159-162)
**ANTES (linha 138):**
```js
  TextoEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] TextoEffect', { params, dados, alvo }),
```
**DEPOIS (linhas 159-162):**
```js
  TextoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] TextoEffect', { params, dados, alvo })
    logAnimIds('TextoEffect', dados)
  },
```

### FlashEffect (linhas 163-166)
**ANTES (linha 139):**
```js
  FlashEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] FlashEffect', { params, dados, alvo }),
```
**DEPOIS (linhas 163-166):**
```js
  FlashEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] FlashEffect', { params, dados, alvo })
    logAnimIds('FlashEffect', dados)
  },
```

### ShakeEffect (linhas 167-170)
**ANTES (linha 140):**
```js
  ShakeEffect: ({ params, dados, alvo }) => console.log('[PRIMITIVO] ShakeEffect', { params, dados, alvo }),
```
**DEPOIS (linhas 167-170):**
```js
  ShakeEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ShakeEffect', { params, dados, alvo })
    logAnimIds('ShakeEffect', dados)
  },
```

## 4. Teste lógico (4 cenários)

**Cenário 1 — Trail com moveAnimId:**
- `onTrail` passa `moveAnimId: 3`
- Console mostra `[ANIM][TrailEffect] { moveAnimId: 3 }`
✅

**Cenário 2 — AuraEffect sem attackAnimId ainda:**
- `melee` não passa `attackAnimId` nos dados ainda
- `logAnimIds` não encontra nenhum campo → nada logado
- Console não polui com linha vazia
✅

**Cenário 3 — Futuro attackAnimId:**
- Quando `attackAnimId` for adicionado aos dados do melee,
  `logAnimIds` já o detecta e loga automaticamente
- Zero mudanças necessárias no EffectRenderer
✅

**Cenário 4 — TextoEffect sem AnimId:**
- `dano`, `popup`, `anuncio_turno` não passam AnimIds
- `logAnimIds` não loga nada
- Console limpo nesses efeitos
✅

## 5. Output completo do npm run build

```
vite v8.0.16 building client environment for production...
✓ 1253 modules transformed.
✓ built in 1.86s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Nenhum erro. Build limpo.

## 6. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.12.1 → **6.12.2** |
| `src/config/version.js` | SITE_VERSION bump | 10.160.21 → **10.160.22** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| `EffectRenderer.js` | logAnimIds adicionado em 9 primitivos | ✅ |
| **Commit** | `2886efdd` — `fix: logAnimIds em todos os primitivos EffectRenderer + v6.12.2` | ✅ |
| **Deploy** | Publicado | ✅ |
