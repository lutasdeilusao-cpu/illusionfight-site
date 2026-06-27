# FIX — TopTrumps v2: perfil not defined in useTopTrumpsRewards — v10.183.2

> Data: 2026-06-27
> Versão: SITE 10.183.2 | TS 5.44.2
> Status: CORRIGIDO

---

## 1. Problema

Erro de runtime ao acessar qualquer rota v2 com usuário logado:
```
useTopTrumpsRewards.js:28 Uncaught ReferenceError: perfil is not defined
```

Causa: `useTopTrumpsRewards` chama `getTierInicial(user, perfil)` na linha 28, mas `perfil` nunca foi recebido como parâmetro do hook — nem passado pelo orquestrador.

## 2. Greps da Etapa 1

### Comando 1 — Onde `perfil` é referenciado no hook
```
useTopTrumpsRewards.js:8  function getTierInicial(user, perfil)
useTopTrumpsRewards.js:10   return perfil?.role || 'free'
useTopTrumpsRewards.js:28   carregarTentativas(user.id, getTierInicial(user, perfil))
```

### Comando 2 — Assinatura do hook (ANTES)
```
useTopTrumpsRewards.js:18  export function useTopTrumpsRewards({
useTopTrumpsRewards.js:19    user, deckUsuario, setDeckUsuario, todasCartas,
useTopTrumpsRewards.js:20    historicoRodadas, desbloquear, onRecompensaConfirmada
```

### Comando 3 — Onde o hook é chamado no orquestrador (ANTES)
```
TopTrumpsSP_v2.jsx:49  const rewards = useTopTrumpsRewards({ user, deckUsuario: ...
```

## 3. Correção

### 3.1 — `useTopTrumpsRewards.js:19` — adicionar `perfil` aos parâmetros

**ANTES:**
```js
export function useTopTrumpsRewards({
  user, deckUsuario, setDeckUsuario, todasCartas,
  historicoRodadas, desbloquear, onRecompensaConfirmada
}) {
```

**DEPOIS:**
```js
export function useTopTrumpsRewards({
  user, perfil, deckUsuario, setDeckUsuario, todasCartas,
  historicoRodadas, desbloquear, onRecompensaConfirmada
}) {
```

### 3.2 — `TopTrumpsSP_v2.jsx:49` — passar `perfil` na chamada

**ANTES:**
```js
const rewards = useTopTrumpsRewards({ user, deckUsuario: ...
```

**DEPOIS:**
```js
const rewards = useTopTrumpsRewards({ user, perfil, deckUsuario: ...
```

## 4. Grep de confirmação pós-edição

```
useTopTrumpsRewards.js:19    user, perfil, deckUsuario, setDeckUsuario, todasCartas,
TopTrumpsSP_v2.jsx:49  const rewards = useTopTrumpsRewards({ user, perfil, deckUsuario: ...
```

## 5. Teste lógico

### Fluxo 1 — Usuário guest (não logado)
- `user` é null → `useEffect` retorna em `if (!user) return` → não chega a `getTierInicial`
- ✅ Sem erro

### Fluxo 2 — Usuário logado
- `user` é truthy → chama `carregarTentativas(user.id, getTierInicial(user, perfil))`
- `perfil` agora está definido (recebido como parâmetro) → `getTierInicial` retorna `perfil?.role || 'free'`
- ✅ Sem ReferenceError

### Fluxo 3 — Playwright não pegou o erro (por que?)
- O teste roda sem autenticação (`page.goto(...)` sem cookies de login)
- `user` é null → o `useEffect` do `carregarTentativas` retorna antes de acessar `perfil`
- ❌ O teste precisaria simular autenticação para pegar esse erro

## 6. Build output

```
✓ built in 1.85s
[prerender] 26 rotas pré-renderizadas
```

## 7. Versões

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.183.1 | **10.183.2** |
| `TS_VERSION` | 5.44.1 | **5.44.2** |

## 8. Commit
- Hash: pendente
- Deploy: pendente

## 9. Teste manual
- Acessar `/games/toptrumps/v2` logado → não deve mostrar `ReferenceError: perfil is not defined`
- Acessar `/games/toptrumps/v2` como guest → não deve mostrar erro
