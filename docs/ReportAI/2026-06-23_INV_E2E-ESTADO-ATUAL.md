# INV: Estado atual dos testes e2e + estrutura de rotas do site

**Data:** 2026-06-23
**Versão atual:** SITE_VERSION 10.160.1

---

## 1. Rotas do site — SITE_MAP.md vs React Router

### Alinhamento: ✅ 1:1

| Fonte | Qtd |
|-------|-----|
| Rotas em `SITE_MAP.md` (seção 2) | 39 (+ catch-all `*`) |
| Rotas definidas em `src/App.jsx` | 39 (+ catch-all `*`) |

Todas as 39 rotas correspondem exatamente entre os dois arquivos. Nenhuma divergência.

### Lista completa (40 rotas)

**Públicas (18):**
`/`, `/personagens`, `/personagens/:id`, `/livro`, `/livro/:id`, `/assinar`, `/autor`, `/webtoon`, `/webtoon/:id`, `/musicas`, `/mundo`, `/games`, `/loja`, `/leaderboard`, `/quiz`, `/login`, `/cadastro`, `/custos`

**Autenticadas (21):**
`/perfil`, `/admin`, `/prototype`, `/games/toptrumps`, `/games/toptrumps/lobby`, `/games/toptrumps/multiplayer`, `/games/ldi`, `/games/ldi/create`, `/games/ldi/game`, `/games/ldi/combat`, `/games/ldi/sheet`, `/games/ldi/clues`, `/games/ldi/end`, `/games/ldi/puzzle`, `/games/jackcandy`, `/games/minigames`, `/games/ldi-arena`, `/games/ldi-tatics`, `/games/pesadelo`, `/games/duelo`, `/games/tamagoshi`

**404:**
`*` (catch-all → `<NotFound />`)

---

## 2. Playwright — instalado e configurado

| Item | Status |
|------|--------|
| `@playwright/test` ^1.60.0 | ✅ package.json |
| `playwright` ^1.60.0 | ✅ package.json |
| `playwright.config.js` | ✅ webServer auto-start `npm run dev` na porta 5173 |
| Test script `npm run test:routes` | ✅ → `npx playwright test e2e/routes.spec.js` |
| Test file `e2e/routes.spec.js` | ✅ 41 testes (18 públicas + 1 rota 404 + 1 teste fichas + 21 autenticadas) |

---

## 3. Causa raiz — por que routes.spec.js está quebrado

### Resultado da execução (300s timeout):

```
  ✓  19/19  Rotas Públicas + 404  (todos passam, ~4s cada)
  ✘  22/22  Rotas Autenticadas    (todos falham, ~16s cada)
```

### Diagnóstico:

O login no `beforeEach` trava. O fluxo `login()`:
1. Navega para `/login`
2. Aguarda `.auth-input` (selector CSS) — **encontra**
3. Preenche `conta6@teste.com` / `000000`
4. Clica `.auth-btn`
5. **Espera `waitForURL('**/perfil')` com 15s timeout → LANÇA TIMEOUT**
6. No catch, tenta ler `.auth-erro` → **provável que o erro de login não esteja visível ou mudou de classe**

Cada rota autenticada então refaz login (no `visitRoute`, o parâmetro `alreadyLoggedIn: true` é passado, mas o login falhou no `beforeEach`, então o contexto já está sem sessão).

### Hipóteses:
1. **Credenciais expiradas/inválidas** — `conta6@teste.com` pode ter sido deletada, ou a senha `000000` não é mais válida
2. **Selector de login mudou** — `.auth-input`, `.auth-btn` não correspondem mais ao markup atual (verificar se Login.jsx foi refatorado)
3. **Supabase anon key desatualizada** — se a chave anônima no `.env` não corresponde mais ao projeto Supabase, o login falha silenciosamente
4. **Rate limiting** — múltiplas execuções consecutivas podem ter bloqueado temporariamente a conta

### Não é:
- ❌ Rota inexistente — `/login` existe e carrega
- ❌ Servidor Vite — webServer sobe corretamente (porta 5173)
- ❌ Playwright não instalado — v1.60.0 instalado

---

## 4. Resumo

| Item | Resultado |
|------|-----------|
| Rotas públicas | ✅ 18/18 funcionam sem console.error |
| Rota 404 | ✅ Funciona |
| Rotas autenticadas | ❌ 0/22 — login quebrado (credenciais ou selector) |
| Alinhamento SITE_MAP.md ↔ React Router | ✅ 1:1 total |
| Playwright instalado | ✅ v1.60.0 |
| `npm run test:routes` | ❌ Quebrado — trava no login do `beforeEach` |

### Próximo passo sugerido:
Corrigir o login de teste: verificar se `conta6@teste.com` existe no Supabase, se a senha `000000` é válida, e se os seletores `.auth-input` / `.auth-btn` / `.auth-erro` ainda correspondem à página de login atual.
