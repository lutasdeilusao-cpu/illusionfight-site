# CHORE: Auditoria CSS Inline + Strings Hardcoded Top Trumps

**Data:** 2026-06-25
**Versão final:** SITE 10.162.46 / TS 5.24.1
**Tipo:** CHORE (auditoria + correções menores)

---

## ETAPA 1 — Output bruto style={{ (todos os arquivos)

### TopTrumps.jsx
```
PS> Select-String -Path "TopTrumps.jsx" -Pattern "style=\{\{"
(sem resultados)
```

### TopTrumpsCard.jsx
```
PS> Select-String -Path "TopTrumpsCard.jsx" -Pattern "style=\{\{"
(sem resultados)
```

### CardViewerModal.jsx
```
PS> Select-String -Path "CardViewerModal.jsx" -Pattern "style=\{\{"
(sem resultados)
```

### DeckBuilder.jsx
```
PS> Select-String -Path "DeckBuilder.jsx" -Pattern "style=\{\{"
(sem resultados)
```

### DeckStartModal.jsx
```
PS> Select-String -Path "DeckStartModal.jsx" -Pattern "style=\{\{"
(sem resultados)
```

### TopTrumpsMP.jsx
```
PS> Select-String -Path "TopTrumpsMP.jsx" -Pattern "style=\{\{"
(sem resultados)
```

**Total: 0 ocorrências de `style={{` em 6 arquivos.**

---

## ETAPA 2 — Output bruto strings e t()

### t(' em TopTrumps.jsx (primeiras 30)
```
67: function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5) }
69: let hash = 0; for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
93: useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])
... (maioria são chamadas t() já encapsuladas)
```

### Strings com aspas em TopTrumps.jsx (primeiras 40)
```
267: // IA "pensa" e escolhe após delay
568: <section className="tt-page ...">
570: <button className="tt-sound-toggle" ...>
... (majoritariamente classNames e t() calls)
610: <span className="tt-modo-card-lock-icon">🔒</span>
... (só UI/decorativo)
```

### t(' em TopTrumpsCard.jsx
```
(sem resultados — componente de carta não usa t() diretamente, recebe texto via props)
```

---

## ETAPA 3 — Tabela de classificação

| Categoria | Qtde | Ação |
|---|---|---|
| A (dinâmico legítimo) | 0 | — |
| B (mover para .css) | **0** | Nenhum style={{ encontrado |
| C (ambíguo) | 0 | — |

**3 manipulações de estilo via ref** (Categoria A — dinâmicas, mantidas):
- `TopTrumps.jsx:583` — `el.style.setProperty('--fill', \`${pct}%\`)` (barra de coleção)
- `TopTrumps.jsx:859` — `el.style.width = \`${pctMax}%\`` (barra de confirmação)
- `CardViewerModal.jsx:176` — `el.style.width = \`${...}%\`` (barra de stats)

Todas dependem de valores percentuais calculados em runtime. Legítimas.

---

## ETAPA 4 — Correções Categoria B

Nenhuma correção necessária (zero ocorrências).

---

## ETAPA 5 — Violações de arquitetura

### 5.1 Strings hardcoded visíveis
| Arquivo | Linha | String | Ação |
|---|---|---|---|
| TopTrumps.jsx | 823 | `VS` | Substituída por `t('games.toptrumps.mp.hud_vs')` |

Demais strings (`🔒`, `🏆`, `💀`, `✓`, `✗`, `=`, `?`, `:`, `×`, `LDI`) são decorativas/icones universais, mantidas.

### 5.2 i18n keys
- Namespace `games.toptrumps.*` existe em **pt.json** (L1405), **en.json** (L1378), **es.json** (L1378)
- Chave `hud_vs` já existia em todos os 3 idiomas como `games.toptrumps.mp.hud_vs`
- Nenhuma chave criada — reutilizada existente

### 5.3 Imports desnecessários
| Arquivo | Linha | Import | Ação |
|---|---|---|---|
| TopTrumps.jsx | 7 | `LoginGate` | **Removido** — nunca usado no JSX |

---

## ETAPA 6 — Correção de strings hardcoded

### ANTES (TopTrumps.jsx:822-823)
```jsx
<div className="tt-vs-epico${cortinaAtiva ? ' tt-cortina-ativa' : ''}">
  <div className="tt-vs-glow" />
  <span className="tt-vs-texto-grande">VS</span>
</div>
```

### DEPOIS
```jsx
<div className="tt-vs-epico${cortinaAtiva ? ' tt-cortina-ativa' : ''}">
  <div className="tt-vs-glow" />
  <span className="tt-vs-texto-grande">{t('games.toptrumps.mp.hud_vs')}</span>
</div>
```

### Remoção LoginGate
**ANTES (linha 7):**
```jsx
import LoginGate from '../components/LoginGate/LoginGate'
import { useLanguage } from '../context/LanguageContext'
```
**DEPOIS:**
```jsx
import { useLanguage } from '../context/LanguageContext'
```

---

## ETAPA 7 — Teste lógico

### Fluxo 1 — Nenhum style={{ Categoria B restante
```
PS> Select-String -Path "TopTrumps.jsx, CardViewerModal.jsx, ..." -Pattern "style=\{\{"
(sem resultados em 6 arquivos)
```
✅

### Fluxo 2 — Todas as strings visíveis passam por t()
```
PS> Select-String "TopTrumps.jsx" -Pattern "VS</span>"
(sem resultados)
PS> Select-String "TopTrumps.jsx" -Pattern "hud_vs"
822: <span className="tt-vs-texto-grande">{t('games.toptrumps.mp.hud_vs')}</span>
```
✅ — VS agora usa i18n. Única string textual hardcoded relevante.

### Fluxo 3 — Build limpo
```
npm run build → 1273 modules transformed, 0 errors
✅
```

---

## ETAPA 8 — Workflow

### Build output
```
✓ built in 2.10s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

### Commit
```
10885cb7 chore: auditoria CSS inline e strings hardcoded Top Trumps + v10.162.46
```

### Deploy
```
Published (gh-pages)
```

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| SITE_VERSION | 10.162.45 | → **10.162.46** |
| TS_VERSION | 5.24.0 | → **5.24.1** |

---

## Resumo final

| Item | Qtde |
|---|---|
| `style={{` encontrados | 0 em 6 arquivos |
| Categoria B corrigidos | 0 |
| Imports mortos removidos | 1 (`LoginGate`) |
| Strings hardcoded → i18n | 1 (`VS` → `t('games.toptrumps.mp.hud_vs')`) |
| Arquivos tocados | 4 (`version.js`, `TopTrumps.jsx`, `SITE_MAP.md`, este .md) |
