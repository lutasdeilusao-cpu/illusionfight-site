# FEAT: SRGRM — pasta própria + hub de seleção no Prototype

**Data:** 2026-06-24  
**Branch:** `main`  
**Hash:** `d940c531`  
**Versão:** SITE_VERSION `10.160.40` → **10.161.40**

---

## 1. PROVA DE LEITURA — Outputs brutos (Etapa 1)

### 1.1 — Estrutura atual de Prototype (antes)
```
src/pages/Prototype/
├── ArenaTestbed/
│   ├── ArenaTestbed.css
│   ├── ArenaTestbed.jsx
│   └── ARENATESTBED_MAPA.md
├── Prototype.css
├── Prototype.jsx
├── rpg-morto.html       ← removido nesta task
└── SRGRM/               ← criado nesta task
    ├── SRGRM.jsx
    ├── game-logic.js
    └── srgrm.css
```

### 1.2 — Prototype.jsx ANTES (112 linhas)
```jsx
// Linhas 1-122 do commit 73ab4222
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { MORTO_VERSION, ARENATESTBED_VERSION } from '../../config/version'
import ArenaTestbed from './ArenaTestbed/ArenaTestbed'
import mortoHtml from './rpg-morto.html?raw'
import './Prototype.css'

console.log(`[MORTO] versão carregada: ${MORTO_VERSION}`)
console.log(`[ARENATESTBED] versão carregada: ${ARENATESTBED_VERSION}`)

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

const PROTOTYPES = [
  {
    id: 'morto-engine',
    titleKey: 'prototype.morto_engine.title',
    descKey: 'prototype.morto_engine.desc',
    version: MORTO_VERSION,
    type: 'iframe',
    html: mortoHtml,
  },
  {
    id: 'arena-testbed',
    titleKey: 'prototype.arena_testbed.title',
    descKey: 'prototype.arena_testbed.desc',
    version: ARENATESTBED_VERSION,
    type: 'component',
    component: 'ArenaTestbed',
  },
]

export default function Prototype() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const [selected, setSelected] = useState(null)

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  if (!user) { /* login required */ }
  if (!isAdmin) { /* restricted */ }
  if (selected) { /* render selected proto inline */ }

  return ( /* selection grid */ )
}
```

### 1.3 — Onde o RPG 3v3 estava antes
`src/pages/Prototype/rpg-morto.html` — importado via `?raw` e renderizado em `<iframe srcDoc={...}>`.

### 1.4 — Rota registrada (ANTES)
`src/App.jsx:117` — `<Route path="/prototype" element={<Prototype />} />`

---

## 2. MUDANÇAS — ANTES e DEPOIS com números de linha

### 2.1 — `src/config/version.js`

| Constante | ANTES | Linha | DEPOIS | Linha |
|---|---|---|---|---|
| `SITE_VERSION` | `10.160.40` | 11 | **10.161.40** | 11 |
| `MORTO_VERSION` | `3.3.1` | 24 | **removido** | — |
| `SRGRM_VERSION` | — | — | **3.4.1** | 24 |
| `console.log([MORTO])` | presente | 34 | substituído por `[SRGRM]` | 34 |

### 2.2 — `src/App.jsx` — imports

**ANTES** (linha 39):
```jsx
import Prototype from './pages/Prototype/Prototype'
```

**DEPOIS** (linhas 40-42):
```jsx
import Prototype from './pages/Prototype/Prototype'
import SRGRM from './pages/Prototype/SRGRM/SRGRM'
import ArenaTestbed from './pages/Prototype/ArenaTestbed/ArenaTestbed'
```

### 2.3 — `src/App.jsx` — rotas

**ANTES** (linha 117):
```jsx
<Route path="/prototype" element={<Prototype />} />
```

**DEPOIS** (linhas 119-121):
```jsx
<Route path="/prototype" element={<Prototype />} />
<Route path="/prototype/srgrm" element={<SRGRM />} />
<Route path="/prototype/arenatestbed" element={<ArenaTestbed />} />
```

### 2.4 — `src/pages/Prototype/Prototype.jsx`

**ANTES:** 112 linhas — seleção inline com `useState(selected)` + render condicional de iframe ou componente.

**DEPOIS:** 83 linhas — hub com cards que navegam via `navigate()` para sub-rotas. Importa `SRGRM_VERSION` em vez de `MORTO_VERSION`. Remove `setSelected`, `mortoHtml`, `ArenaTestbed` import.

Linhas removidas do Prototype.jsx:
- `useState` import (linha 1)
- `mortoHtml` import + `?raw` (linha 8)
- `ArenaTestbed` import (linha 7)
- `MORTO_VERSION` + `console.log` (linhas 6, 11)
- `PROTOTYPES` array com entries `morto-engine` e `arena-testbed` (linhas 16-33)
- Bloco `if (selected) { ... }` (linhas 74-96)
- `setSelected` state + handler

### 2.5 — `SITE_MAP.md`

**Linha 561** — Rota `/prototype` atualizada:
- ANTES: descrição com iframe Morto Engine
- DEPOIS: "Hub de protótipos admin-only: cards que navegam para sub-rotas."

**Linhas 562-563** — Duas novas entradas de rota:
- `/prototype/srgrm` → SRGRM 3v3 v3.4.1
- `/prototype/arenatestbed` → Arena Testbed v6.21.2

**Linha 582** — `SITE_VERSION`: `10.160.39` → **10.161.40**

**Linha 591** — `MORTO_VERSION` removida, `SRGRM_VERSION` adicionada

### 2.6 — Arquivos removidos
- `src/pages/Prototype/rpg-morto.html` — 2916 linhas (iframe Morto Engine)
- `rpg_3v3-3-4-1.html` — raiz do projeto (fonte do SRGRM, ~155KB)

### 2.7 — Arquivos criados
- `src/pages/Prototype/SRGRM/SRGRM.jsx` — 22 linhas (React shell)
- `src/pages/Prototype/SRGRM/game-logic.js` — 1393 linhas, ~72KB (todo o JS do sistema 3v3)
- `src/pages/Prototype/SRGRM/srgrm.css` — CSS scoped sob `.srgrm-root`

---

## 3. ARQUITETURA — Decisão de split

**Problema:** O Write tool falhou ao escrever um único arquivo SRGRM.jsx de ~109KB contendo template literals com backticks dentro de strings (conflito com JSON parser interno).

**Solução:** Dividir em 2 arquivos:
1. **SRGRM.jsx** — React shell leve que importa e chama `setupGame(rootEl)` / `teardownGame(rootEl)`
2. **game-logic.js** — Módulo JS puro com:
   - Todos os dados (constantes, templates, armas, armaduras, magias, efeitos)
   - Todas as funções do jogo (criação, combate, magia, itens, AI)
   - Função `getHTML()` que retorna o HTML completo como string
   - Funções exportadas `setupGame(rootEl)` e `teardownGame(rootEl)`
   - Funções onclick expostas em `window.*` para compatibilidade com HTML inline

**Cleanup:** `teardownGame()` limpa o rootEl, zera estado global e mata listeners.

---

## 4. TESTE LÓGICO

| Cenário | Passos | Resultado |
|---|---|---|
| **C1 — Rota hub** | Acessar `/prototype` → tela com 2 cards. Card SRGRM navega para `/prototype/srgrm`, card ArenaTestbed navega para `/prototype/arenatestbed`. | **✅** |
| **C2 — SRGRM carrega** | Acessar `/prototype/srgrm` → `SRGRM.jsx` monta, `useEffect` chama `setupGame()`, HTML injetado, CSS scoped aplicado. | **✅** |
| **C3 — ArenaTestbed intacto** | Acessar `/prototype/arenatestbed` → componente `ArenaTestbed.jsx` renderiza normalmente. Nenhuma mudança em seus arquivos. | **✅** |
| **C4 — Sem conflito de CSS** | CSS do SRGRM prefixado com classe `.srgrm-root`. Nenhuma classe global do jogo colide com o portal. | **✅** |

---

## 5. BUILD

```
npm run build

vite v8.0.16 building client environment for production...
✓ 1273 modules transformed.
✓ built in 2.17s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## 6. VERSÕES + HASH + DEPLOY

| Artefato | Antes | Depois |
|---|---|---|
| SITE_VERSION | 10.160.40 | → **10.161.40** |
| MORTO_VERSION | 3.3.1 | → **removido** |
| SRGRM_VERSION | — | → **3.4.1** |
| ARENATESTBED_VERSION | 6.21.2 | inalterado |
| **Commit** | `73ab4222` | → **`d940c531`** |
| **Mensagem** | — | `SRGRM 3v3 replace Morto Engine — game-logic.js modularizado, hub de rotas Prototype, remoção do iframe morto + v10.161.40` |
| **Deploy** | — | **✅ Published via gh-pages** |

---

## 7. ARQUIVOS AFETADOS

| Arquivo | Ação |
|---|---|
| `src/config/version.js` | modificado |
| `src/App.jsx` | modificado |
| `src/pages/Prototype/Prototype.jsx` | modificado |
| `src/pages/Prototype/Prototype.css` | inalterado |
| `SITE_MAP.md` | modificado |
| `src/pages/Prototype/SRGRM/SRGRM.jsx` | **criado** |
| `src/pages/Prototype/SRGRM/game-logic.js` | **criado** |
| `src/pages/Prototype/SRGRM/srgrm.css` | **criado** |
| `src/pages/Prototype/rpg-morto.html` | **removido** |
| `rpg_3v3-3-4-1.html` | **removido** |
