# FEAT: Contrato dadosObrigatorios no effectsMap + validação no dispatchEffect

**Data:** 2026-06-23
**Versão:** SITE 10.160.18 → **10.160.19** · ARENATESTBED 6.11.0 → **6.11.1**
**Commit:** `7d3158b0`
**Deploy:** ✅ Published

---

## 1. Output bruto dos 3 greps da Etapa 1

### Grep 1 — `dispatchEffect` em Phase6CombatV2.jsx

19 matches. Todos os 17 dispatchEffect calls + 1 destructuring + 1 dep array. Nenhum caller viola os novos contratos.

### Grep 2 — `canal:|duracao_auto:|primitivo:` em effectsMap.js

63 matches — 20 de cada campo (3 por efeito × 20 efeitos + 3 do EffectRenderer.js que aparecem no mesmo grep).

### Grep 3 — `dispatchEffect|dados` em useEffectMachine.js

11 matches:
- Line 47: `executarEfeitoInterno(canal, ..., dados)`
- Line 54: `function executarEfeitoInterno(canal, definicao, tipo, alvo, dados)`
- Line 59: `c.ativo = { tipo, alvo, dados }`
- Line 63: `dados,` (log)
- Line 69: `executarRenderer(definicao.primitivo, { params: definicao.params, dados, alvo })`
- Line 77: `const dispatchEffect = useCallback(({ tipo, alvo, dados, caller }) => {`
- Line 104: `executarEfeitoInterno(canal, definicao, tipo, alvo, dados)`
- Line 115: `c.fila.push({ definicao, tipo, alvo, dados, caller })`
- Line 122: `dispatchEffect,`

---

## 2. ANTES e DEPOIS de 3 entradas representativas do effectsMap

### dano (linhas 2-17):
```js
// ANTES:
  dano: {
    canal: 'overlay',
    duracao_auto: true,
    duracao: 800,
    prioridade: 1,
    primitivo: 'TextoEffect',
    params: { cor: '#ffffff', ... },

// DEPOIS:
  dano: {
    canal: 'overlay',
    duracao_auto: true,
    duracao: 800,
    prioridade: 1,
    primitivo: 'TextoEffect',
    dadosObrigatorios: ['valor'],
    params: { cor: '#ffffff', ... },
```

### melee (linhas 130-145):
```js
// ANTES:
  melee: {
    canal: 'canvas',
    duracao_auto: true,
    duracao: 500,
    prioridade: 1,
    primitivo: 'AuraEffect',
    params: { cor: '#ff8800', ... },

// DEPOIS:
  melee: {
    canal: 'canvas',
    duracao_auto: true,
    duracao: 500,
    prioridade: 1,
    primitivo: 'AuraEffect',
    dadosObrigatorios: ['atacanteId', 'alvoId', 'onFinalizar'],
    params: { cor: '#ff8800', ... },
```

### ia_thinking (linhas 162-177):
```js
// ANTES:
  ia_thinking: {
    canal: 'hud',
    duracao_auto: false,
    duracaoPorTurno: 3000,
    prioridade: 1,
    primitivo: 'TextoEffect',
    params: { cor: '#aaaaaa', ... },

// DEPOIS:
  ia_thinking: {
    canal: 'hud',
    duracao_auto: false,
    duracaoPorTurno: 3000,
    prioridade: 1,
    primitivo: 'TextoEffect',
    dadosObrigatorios: [],
    params: { cor: '#aaaaaa', ... },
```

## 3. Grep de confirmação

```
Select-String -Pattern "dadosObrigatorios" | Measure-Object
20
```

✅ 20 entradas, uma por efeito.

---

## 4. ANTES e DEPOIS da validação no dispatchEffect (useEffectMachine.js)

### Linhas 79-97:
```js
// ANTES:
    if (!definicao) {
      console.warn('[EFFECT] tipo desconhecido:', tipo, 'caller:', caller)
      return
    }

    const canal = definicao.canal || 'overlay'

// DEPOIS:
    if (!definicao) {
      console.warn('[EFFECT] tipo desconhecido:', tipo, 'caller:', caller)
      return
    }

    const ausentes = (definicao.dadosObrigatorios || [])
      .filter(campo => !dados || dados[campo] === undefined || dados[campo] === null)

    if (ausentes.length > 0) {
      console.error(
        '[EFFECT] CONTRATO QUEBRADO:',
        `"${tipo}" exige dados.${ausentes.join(', dados.')}`,
        '\nRecebido:', dados,
        '\nCaller:', caller
      )
      return
    }

    const canal = definicao.canal || 'overlay'
```

---

## 5. Teste lógico — 5 cenários

### Cenário 1 — Efeito com contrato completo (projetil)
`{ tipo: 'projetil', dados: { atacanteId: 'x', alvoId: 'y', onFinalizar: fn } }`
❓ `ausentes` = [] → passa validação → executa normalmente.
✅ **Funciona.**

### Cenário 2 — Efeito com contrato quebrado (projetil sem alvoId)
`{ tipo: 'projetil', dados: { atacanteId: 'x' } }`
❓ `ausentes` = ['alvoId', 'onFinalizar'] → console.error + return.
✅ **Funciona.** Canal não é afetado.

### Cenário 3 — Efeito sem dados obrigatórios (shake)
`{ tipo: 'shake', dados: {} }`
❓ `dadosObrigatorios` = [] → nenhuma validação → executa normalmente.
✅ **Funciona.**

### Cenário 4 — Efeito com dados null
`{ tipo: 'trail', dados: null }`
❓ `!dados` = true → todos os campos (row, col) considerados ausentes → console.error + return.
✅ **Funciona.**

### Cenário 5 — Todos os dispatchEffect atuais passam na validação
Revisão manual de todos os 17 dispatchEffect em Phase6CombatV2.jsx:
- `dano` → `{ valor: dano }` ✅
- `popup` → `{ valor: dano }` ✅
- `shake` → `{}` ✅
- `flash` → `{}` ✅
- `hp_delta` → `{ dano }` ✅
- `balao` → `{ texto, tipo, row, col }` ✅
- `melee` → `{ atacanteId, alvoId, resultado, onFinalizar }` ✅
- `projetil` → `{ atacanteId, alvoId, resultado, onFinalizar }` ✅
- `vitoria` → `{ vencedor }` ✅
- `anuncio_turno` (2x) → `{ nome, time }` ✅
- `ia_thinking` → `{}` ✅
- `trail` → `{ row, col }` ✅
- `banner_ia` → `{ nome }` ✅
- `highlight_movimento/ataque/range` → `{ cells }` ✅
✅ **Nenhum caller precisa de correção.**

---

## 6. Callers corrigidos

Nenhum — todos os 17 dispatchEffect atuais já passam os contratos declarados.

---

## 7. Output do npm run build

```
vite v8.0.16 building client environment for production...
✓ built in 4.28s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

Build sem erros. Warnings conhecidos.

---

## 8. Versões + hash + deploy

| Constante | Antes | Depois |
|-----------|-------|--------|
| `SITE_VERSION` | 10.160.18 | **10.160.19** |
| `ARENATESTBED_VERSION` | 6.11.0 | **6.11.1** |

| Item | Valor |
|------|-------|
| **Commit hash** | `7d3158b0` |
| **Mensagem** | `feat: contrato dadosObrigatorios no effectsMap + validação dispatchEffect + v6.11.1` |
| **Deploy** | ✅ Published |
| **Arquivos modificados** | 2 (effectsMap.js, useEffectMachine.js) |
| **Arquivos de config** | 2 (version.js, SITE_MAP.md) |
| **Total de contratos** | 20 efeitos com `dadosObrigatorios` declarados |
| **Callers corrigidos** | 0 (todos já conformes) |

---

## Sinais de alerta — verificação pós-build

- ✅ `grep -c "dadosObrigatorios"` = 20
- ✅ Validação adicionada ANTES da lógica de canal (posição correta)
- ✅ Cenário 2 (contrato quebrado) rejeita com console.error + return
- ✅ Cenário 5 (todos os callers atuais) passam na validação
- ✅ `console.error` com mensagem clara: tipo, campos ausentes, dados recebidos, caller
- ✅ Build passou (1251 módulos transformados)
