# FIX — Reverter TopTrumps ao estado do commit 655604fd — v5.44.7

**Data:** 2026-06-29  
**Versão:** SITE 10.183.20 → **10.183.21** | TS 5.45.4 → **5.44.7**  
**Hash do commit alvo:** `655604fdaa764313a712c88d68a404ff85c7e552`  
**Status:** CORRIGIDO

---

## Descrição

Reverter todos os arquivos do TopTrumps ao estado exato do commit `655604fd`, restaurando:
- v1 (`TopTrumps.jsx` + `TopTrumps.css`) — Super Trunfo legado
- v2 (`v2/TopTrumpsSP_v2.jsx` + componentes/hooks/styles sob `v2/`) — versão atual

Sem perder as atualizações de outros arquivos (marketing, SEO, etc.) feitas entre `655604fd` e `HEAD`.

---

## Etapa 1 — Prova de Leitura

### Comando 1: git log --oneline -20

```
86f3d28b Top Trumps CSS monolith refactoring: TopTrumps.css (2552 lines) replaced by per-component CSS imports + shared.css + GameScreen.css + v10.183.20
232a4cf4 fix(TopTrumps): GameScreen.css dead code deletado + flex: 1 → flex: 0 0 auto no VS heartbeat + v10.183.19
73d5f4ac docs: Bíblia do Deploy + v10.183.18
8a5faf35 fix: SEO indexação sitemap robots canonical + v10.183.17
42c7a394 INT 33 blocos + Estrelas 20 blocos + v10.183.16
2b23cacd BR CSV quebrado em 6 blocos + v10.183.15
52d22c8a YouTube creators outreach +142 INT +84 BR + v10.183.14
7ee2bdab YouTube creators outreach: +142 INT +84 BR
a2974aaf Estrelas + BR outreach: +382 contatos estratégicos + v10.183.13
f16349db fix(toptrumps): VS centralizado entre cartas [v5.45.2]
717fc864 fix(toptrumps): ajuste fino GameOverScreen + VS centralizado [v5.45.1]
710a9bc0 PR outreach +253 contatos INT (multi-language EU + English markets) + v10.183.10
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
655604fd fix(toptrumps-v2): touch deslocado RewardScreen + imagens completas [v5.44.6]
3a2bdcaa PR outreach +198 contatos INT (English US market) + v10.183.7
0eadefce PR outreach +338 contatos INT (Spanish, Asian, English markets) + v10.183.6
a9dab01b bump: v10.183.5 / v5.44.5 — reward test images + prerender
79adb83d fix: reward test card images + CARD_IMAGES mapping
32090dexa fix: prerender rotas v2 + reward-test
3200218b PR outreach: +128 INT contacts
```

### Comando 2: git diff --name-status 655604fd..HEAD -- src/pages/games/TopTrumps/

```
D	src/pages/games/TopTrumps/TopTrumps.css
D	src/pages/games/TopTrumps/TopTrumps.jsx
R074	src/pages/games/TopTrumps/v2/TopTrumpsSP_v2.jsx → src/pages/games/TopTrumps/TopTrumpsSP.jsx
R100	src/pages/games/TopTrumps/v2/components/BurstParticles/BurstParticles.css → src/pages/games/TopTrumps/components/BurstParticles/BurstParticles.css
R100	src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.css → src/pages/games/TopTrumps/components/CurtainReveal/CurtainReveal.css
R091	src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx → src/pages/games/TopTrumps/components/CurtainReveal/CurtainReveal.jsx
R100	src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.css → src/pages/games/TopTrumps/components/FireParticles/FireParticles.css
R090	src/pages/games/TopTrumps/v2/components/GameOverScreen/GameOverScreen.jsx → src/pages/games/TopTrumps/components/GameOverScreen/GameOverScreen.jsx
A	src/pages/games/TopTrumps/components/GameScreen/GameScreen.css
R097	src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx → src/pages/games/TopTrumps/components/GameScreen/GameScreen.jsx
R095	src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx → src/pages/games/TopTrumps/components/MenuScreen/MenuScreen.jsx
R094	src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx → src/pages/games/TopTrumps/components/ResultScreen/ResultScreen.jsx
R100	src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.css → src/pages/games/TopTrumps/components/RewardScreen/RewardScreen.css
R095	src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.jsx → src/pages/games/TopTrumps/components/RewardScreen/RewardScreen.jsx
R097	src/pages/games/TopTrumps/v2/hooks/useGameEffects.js → src/pages/games/TopTrumps/hooks/useGameEffects.js
M	src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js
R098	src/pages/games/TopTrumps/v2/hooks/useTopTrumpsRewards.js → src/pages/games/TopTrumps/hooks/useTopTrumpsRewards.js
R100	src/pages/games/TopTrumps/v2/hooks/useTopTrumpsSP.js → src/pages/games/TopTrumps/hooks/useTopTrumpsSP.js
A	src/pages/games/TopTrumps/styles/GameOverScreen.css
R060	src/pages/games/TopTrumps/v2/styles/MenuScreen.css → src/pages/games/TopTrumps/styles/MenuScreen.css
A	src/pages/games/TopTrumps/styles/ResultScreen.css
A	src/pages/games/TopTrumps/styles/shared.css
R100	src/pages/games/TopTrumps/v2/styles/tokens.css → src/pages/games/TopTrumps/styles/tokens.css
D	src/pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest.jsx
D	src/pages/games/TopTrumps/v2/components/BurstParticles/BurstParticles.jsx
D	src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.jsx
D	src/pages/games/TopTrumps/v2/components/GameHUD/GameHUD.css
D	src/pages/games/TopTrumps/v2/components/GameHUD/GameHUD.jsx
D	src/pages/games/TopTrumps/v2/components/SoundToggle/SoundToggle.css
D	src/pages/games/TopTrumps/v2/components/SoundToggle/SoundToggle.jsx
D	src/pages/games/TopTrumps/v2/hooks/useTopTrumpsDeck.js
D	src/pages/games/TopTrumps/v2/styles/GameScreen.css
D	src/pages/games/TopTrumps/v2/styles/ResultScreen.css
```

### Comando 3: Rotas em App.jsx no commit 655604fd

```
import TopTrumps from './pages/games/TopTrumps/TopTrumps'
import TopTrumpsSP_v2 from './pages/games/TopTrumps/v2/TopTrumpsSP_v2'
import TopTrumpsSP_v2_RewardTest from './pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest'
...
<Route path="/games/toptrumps/v2/reward-test" element={<TopTrumpsSP_v2_RewardTest />} />
<Route path="/games/toptrumps/v2" element={<TopTrumpsSP_v2 />} />
<Route path="/games/toptrumps/legacy" element={<FichaGateRoute gameId="top_trumps" feature="o Top Trumps LDI" nomeExibicao="Top Trumps LDI"><TopTrumps /></FichaGateRoute>} />
<Route path="/games/toptrumps" element={<TopTrumpsSP_v2 />} />
```

---

## Etapa 2 — Ações realizadas

### 1. Restaurar v1
```
git checkout 655604fd -- src/pages/games/TopTrumps/TopTrumps.jsx
git checkout 655604fd -- src/pages/games/TopTrumps/TopTrumps.css
```

### 2. Restaurar v2
```
git checkout 655604fd -- src/pages/games/TopTrumps/v2/
```

### 3. Remover arquivos consolidados (que foram criados pela refatoração)
- `src/pages/games/TopTrumps/TopTrumpsSP.jsx`
- `src/pages/games/TopTrumps/styles/` (diretório inteiro)
- `src/pages/games/TopTrumps/components/{GameScreen,GameOverScreen,MenuScreen,ResultScreen,RewardScreen,BurstParticles,CurtainReveal,FireParticles}/`
- `src/pages/games/TopTrumps/hooks/{useGameEffects,useTopTrumpsRewards,useTopTrumpsSP}.js`
- `src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js` (restaurado de 655604fd após deleção acidental)

### 4. Atualizar App.jsx
**Antes (linha 32):**
```
import TopTrumpsSP from './pages/games/TopTrumps/TopTrumpsSP'
```
**Depois (linhas 32-34):**
```
import TopTrumps from './pages/games/TopTrumps/TopTrumps'
import TopTrumpsSP_v2 from './pages/games/TopTrumps/v2/TopTrumpsSP_v2'
import TopTrumpsSP_v2_RewardTest from './pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest'
```

**Antes (linha 93):**
```
<Route path="/games/toptrumps" element={<TopTrumpsSP />} />
```
**Depois (linhas 95-99):**
```
<Route path="/games/toptrumps/v2/reward-test" element={<TopTrumpsSP_v2_RewardTest />} />
<Route path="/games/toptrumps/v2" element={<TopTrumpsSP_v2 />} />
<Route path="/games/toptrumps/legacy" element={<FichaGateRoute gameId="top_trumps" feature="o Top Trumps LDI" nomeExibicao="Top Trumps LDI"><TopTrumps /></FichaGateRoute>} />
<Route path="/games/toptrumps" element={<TopTrumpsSP_v2 />} />
```

### 5. Bump de versão
**version.js:**
- `SITE_VERSION`: `10.183.20` → `10.183.21`
- `TS_VERSION`: `5.45.4` → `5.44.7`

**SITE_MAP.md:**
- Rotas do TopTrumps atualizadas (v1 + v2 + v2/reward-test + legacy)
- Tabela de versões atualizada
- Descrição alterada para "Top Trumps — revertido ao estado de 655604fd (v1 + v2 restaurados)"

### 6. Output do build
```
✓ built in 2.01s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## Teste Lógico

### Fluxo 1: /games/toptrumps (v2)
1. App.jsx renderiza `<Route path="/games/toptrumps" element={<TopTrumpsSP_v2 />} />`
2. `TopTrumpsSP_v2.jsx` importa de `./hooks/useTopTrumpsSP`, `./hooks/useTopTrumpsDeck`, etc.
3. Hooks e componentes estão em `v2/hooks/` e `v2/components/`
4. Componentes importam CSS de `../../styles/xxx.css` (relativo a `v2/components/xxx/`)
5. ✅ Funciona

### Fluxo 2: /games/toptrumps/legacy (v1)
1. App.jsx renderiza `<Route path="/games/toptrumps/legacy" ...><TopTrumps /></FichaGateRoute>`
2. `TopTrumps.jsx` (v1) importa de `../../../config/version`, `../../../lib/getDeck`, etc.
3. Usa `TopTrumps.css` (monólito v1) para estilos
4. ✅ Funciona (protegido por FichaGateRoute)

### Fluxo 3: /games/toptrumps/v2/reward-test
1. App.jsx renderiza `<Route path="/games/toptrumps/v2/reward-test" ...>`
2. `TopTrumpsSP_v2_RewardTest.jsx` importa RewardScreen de `./components/RewardScreen/RewardScreen`
3. ✅ Funciona

### Fluxo 4: Arquivos não-TopTrumps
- Marketing lists (PR outreach, CSV blocks, SEO, sitemap) — NÃO foram tocados
- ✅ Preservados

### Fluxo 5: DeckBuilder
- `src/pages/games/TopTrumps/components/DeckBuilder.jsx` existia em 655604fd e não foi modificado
- ✅ Disponível em v2

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.183.20 | **10.183.21** |
| `TS_VERSION` | 5.45.4 | **5.44.7** |
| `TM_VERSION` | 5.12.0 | 5.12.0 |

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `src/config/version.js` | TS_VERSION 5.45.4 → 5.44.7, SITE_VERSION 10.183.20 → 10.183.21 |
| `SITE_MAP.md` | Rotas TopTrumps + tabela de versões atualizadas |
| `src/App.jsx` | Imports e rotas do TopTrumps restaurados (v1 + v2) |
| `src/pages/games/TopTrumps/TopTrumps.jsx` | Restaurado de 655604fd (v1) |
| `src/pages/games/TopTrumps/TopTrumps.css` | Restaurado de 655604fd (monólito v1) |
| `src/pages/games/TopTrumps/v2/` (todo) | Restaurado de 655604fd |
| `src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js` | Restaurado de 655604fd |

## Deploy

```
npm run build ✅
git add -A && git commit -m "fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7"
git push
npm run deploy
```

## Teste manual pendente
- [ ] Verificar /games/toptrumps carrega v2 corretamente
- [ ] Verificar DeckBuilder funcional no v2
- [ ] Verificar /games/toptrumps/legacy carrega v1
