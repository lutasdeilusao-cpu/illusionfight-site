## 🗑️ Contador de Merda do Agente de Código — 1

> **#001 — 2026-07-04:** Agente criou estrutura de 2 arquivos (`SlidingRafael.jsx` + `PuzzleSlidingRafael.jsx`) para jogos Kernel Games, replicando para Maze, Glitch, BulletHell e Stabilizer. Padrão do projeto é 1 arquivo principal por jogo (ex: `DueloRoute.jsx`). O agente tentou "separar responsabilidades" quebrando consistência do repositório. **Lição:** seguir o padrão existente, não inventar arquitetura nova sem aprovação.
> 
> **#002 — 2026-07-04:** Agente fez a merge wrapper+puzzle nos 6 jogos e DEIXOU OS ARQUIVOS MODIFICADOS NO WORKING TREE — não commitou, não fez push, não fez deploy. O relatório disse "commit ✅, push ✅, deploy ✅" mas nenhum código fonte foi para o repositório. Isaias encontrou o erro. **Lição:** NUNCA confiar no report do agente anterior. Sempre verificar `git status` + `git log` antes de prosseguir. Commit, push e deploy são PASSOS OBRIGATÓRIOS e verificáveis.

---

# BÍBLIA DO ISAIAS — Filosofia, Arquitetura e Regras do Projeto

> **Documento único e definitivo.** Tudo que o agente precisa saber sobre como Isaias trabalha, como o portal funciona, arquitetura, regras de código, CSS, i18n, e cada detalhe de como as coisas devem ser feitas.

---

## Índice

1. [Filosofia do Isaias](#1-filosofia-do-isaias)
2. [Stack & Tecnologias](#2-stack--tecnologias)
3. [Workflow Obrigatório](#3-workflow-obrigatório)
4. [Layout & CSS — Regras Absolutas](#4-layout--css--regras-absolutas)
5. [i18n — Sistema de Tradução](#5-i18n--sistema-de-tradução)
6. [Arquitetura do Portal](#6-arquitetura-do-portal)
7. [Regras de Código](#7-regras-de-código)
8. [CSS Inline — O Que É Aceito vs Proibido](#8-css-inline--o-que-é-aceito-vs-proibido)
9. [Versionamento](#9-versionamento)
10. [Sistemas do Portal](#10-sistemas-do-portal)
11. [Decisões e Hurdles Documentados](#11-decisões-e-hurdles-documentados)
12. [Infraestrutura](#12-infraestrutura)
13. [Conduct Rules Finais](#13-conduct-rules-finais)

---

## 1. Filosofia do Isaias

### 1.1 Mobile-first DE VERDADE — "Não existe desktop"

> **"O site não tem versão desktop — a versão dele é toda para celular. Todos os jogos, não importa se o cara tá jogando no desktop, tem que se adequar a uma tela vertical. Acabou."**

- **Não existe** versão desktop do portal. Zero. Nenhuma.
- Todo jogo, página, componente — independente do dispositivo do usuário — deve parecer um app de celular.
- Em desktop: o conteúdo fica centralizado num container vertical (`max-width: 480px; margin: 0 auto`).
- Backgrounds (scanlines, grid pattern) usam `position: fixed; inset: 0;` para cobrir o viewport inteiro ATRÁS do container.
- **NUNCA** esticar horizontalmente. **NUNCA.**
- Mesmo o jogo no desktop fica igual ao do mobile. Idêntico.

### 1.2 Cada pixel é INTENCIONAL — "Você pensou antes de fazer isso?"

- Padding, margem, gap — nada é valor arbitrário ou "chutado".
- Espaço desperdiçado é ofensivo. Dentro do container portrait, cada pixel conta.
- Valores de padding:
  - Arena/área de jogo: **8px** (nunca 16px)
  - HUD: **6px 12px** (nunca 8px 16px)
  - Game body: **8px 6px 6px** (nunca 16px 14px 12px)
  - Margens de subtítulo em menu: **24px** (nunca 40px)
  - Gap entre botões: **6px** (nunca 8px)
- Se o agente não tem certeza do resultado visual de uma mudança de CSS, deve **LER** os CSS existentes, **ENTENDER** o fluxo de layout, e **SÓ ENTÃO** editar.
- **"Fazer por fazer" não é aceito.** Toda mudança de CSS/layout deve ser pensada e testada visualmente.
- Isaias **EXIGE revisão visual real**, não checklist burocrática. Valores arbitrários sem intenção de uso de espaço serão rejeitados.

### 1.3 Qualidade > Velocidade — "Trabalho de preguiçoso não passa"

- Isaias prefere que o agente peça ajuda ou confirmação a fazer trabalho errado.
- Correções de qualidade são esperadas na **PRIMEIRA** tentativa.
- Trabalho superficial, preguiçoso, ou "só para constar" será apontado e rejeitado.
- **"Você tem certeza que fez o que foi pedido? Você pensou no mobile first? Você repensou o CSS ou só fez por fazer?"**
- **Single-pass superficial é inaceitável.** Refazer duas, três vezes até acertar é normal.
- **Desktop sem regressão é obrigatório** — mesmo que não exista versão desktop, o que aparece no desktop não pode quebrar.

### 1.4 Sem frescura, sem firula

- Zero CSS-in-JS. Zero `style={{}}` para propriedades visuais estáticas.
- Zero bibliotecas novas sem ganho visual comprovado (lição Pixi.js — nunca repetir).
- Zero over-engineering: antes de criar **mais de 2 arquivos novos**, apresentar proposta e aguardar aprovação explícita.
- Arquivos com **mais de 300 linhas** devem ser avaliados para extração antes de adicionar mais código. Propor a extração, não executar sem aprovação.
- Nunca sobrescrever arrays inteiros — adicionar itens.
- Nunca remover `console.log` de diagnóstico a menos que o usuário peça.

---

## 2. Stack & Tecnologias

### 2.1 Dependências Principais

| Tecnologia | Versão | Uso |
|---|---|---|
| **Vite** | 8 | Build tool (`@vitejs/plugin-react`) |
| **React** | 19.1 | UI framework (JSX only, **NO TypeScript**) |
| **React Router** | 7.6 | Client-side routing |
| **Zustand** | 5 | State management (store independente por jogo) |
| **Framer Motion** | 12.40 | Animações |
| **Supabase** | 2.107 | Auth, realtime, save persistence |
| **Pixi.js** | 7.4 | Canvas rendering (apenas onde necessário) |
| **gh-pages** | 6.3 | Deploy para GitHub Pages |
| **react-helmet-async** | 3.0 | `<title>` e meta tags por página |
| **react-markdown** | 10.1 | Renderização de capítulos do livro |
| **Playwright** | 1.61 | Pré-renderização de rotas (build) |

### 2.2 Ambiente

- `.env` (dev): `VITE_DEBUG=true`
- `.env.production`: `VITE_DEBUG=false`
- Domínio oficial: `https://illusionfight.com/`
- Vite base: `/` (custom domain)
- Supabase project: `dvxfrzixtetdzmdrzkpx.supabase.co`
- Client Supabase: `src/lib/supabase.js` (anon key)
- Stripe: `src/lib/stripe.js` — ELITE (R$10/mês), PRIMORDIAL (R$30/mês)

### 2.3 Variáveis de Ambiente

```
VITE_DEBUG=true
VITE_SUPABASE_URL=https://dvxfrzixtetdzmdrzkpx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_STRIPE_PRICE_ELITE=price_1Tfie3JKS0q9hTz9mzbdSeW9
VITE_STRIPE_PRICE_PRIMORDIAL=price_1TfidyJKS0q9hTz9DyTMpBJd
```

### 2.4 Config do Vite

```js
// vite.config.js
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: { sourcemap: true },  // OBRIGATÓRIO até Setembro 2026
})
```

---

## 3. Workflow Obrigatório

> **⚠️ NENHUMA EXCEÇÃO.** Toda task que toca qualquer arquivo do projeto segue estes passos na ordem:

### 3.1 Passo a Passo

```
1. BUMP A VERSÃO → src/config/version.js
   Regra absoluta: toda task → SITE_VERSION patch bump.
   Se mexer em jogo específico → bump do jogo + site.

2. ATUALIZAR SITE_MAP.md
   Versão na tabela de rotas + tabela de versões.

3. npm run build
   SE FALHAR → corrigir ANTES de prosseguir.
   sourcemap: true é OBRIGATÓRIO. Nunca remover.

4. git add -A && git commit -m "<desc> + vX.X.X"

5. git push

6. npm run deploy

7. VERIFICAR que o deploy publicou sem erros
```

### 3.2 Relatório Obrigatório ao Final

Toda task deve entregar um relatório com:

```
| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | X.X.X → **Y.Y.Y** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| **Commit** | `abc1234` — desc + vY.Y.Y | ✅ |
| **Deploy** | Status | ✅/❌ |
```

### 3.3 Automação

```
python deploy.py -g <game> -m "descrição"
```
Faz bump + build + commit + push + deploy em um comando. Usar `--minor` ou `--major` para bumps não-patch. Aceita múltiplos `-g`.

---

## 4. Layout & CSS — Regras Absolutas

### 4.1 Container Vertical — REGRA GERAL DO PORTAL

```
.kg-page, .game-wrapper, [qualquer container de jogo] {
  position: relative;
  width: 100%;
  max-width: 480px;      ← NUNCA mude, NUNCA remova
  min-height: 100vh;
  margin: 0 auto;         ← centraliza no desktop
  overflow: hidden;
}
```

- Todo jogo **deve** estar dentro de um container com max-width portrait.
- Backgrounds (scanlines, grid patterns) usam `position: fixed; inset: 0;` para cobrir o viewport ATRÁS do container.
- **Qualquer jogo que esticar horizontalmente está ERRADO.**

### 4.2 Hierarquia de Botão Voltar

```
Nível 2: Menu de dificuldade → Catálogo Kernel Games (volta ao /games)
         onBack prop → navigate('/games')

Nível 1: Gameplay → Menu de dificuldade do próprio jogo
         Sliding Puzzle:  cleanup(); setPhase('select')
         Código Perdido:  setActive(false); setPhase('select')
```

- O phase 'countdown' é automático (~3s) e NÃO precisa de botão de voltar.
- O phase 'game' (gameplay) DEVE ter botão de voltar no HUD.
- O phase 'select' (menu de dificuldade) DEVE ter botão de voltar para o catálogo.

### 4.3 Padding Mínimo — Tabela de Valores Corretos

| Elemento | Padding correto | Padding errado |
|---|---|---|
| Arena / área de jogo | `8px` | `16px` |
| HUD | `6px 12px` | `8px 16px` |
| Game body (CodigoPerdido) | `8px 6px 6px` | `16px 14px 12px` |
| Margens de subtítulo em menu | `24px` | `40px` |
| Gap entre botões de menu | `6px` | `8px` |
| Screen padding (select) | `24px 16px` | `28px 20px` |

### 4.4 Tile Sizing (Sliding Puzzle)

- O cálculo em JS **DEVE** bater exatamente com o padding do CSS.
- Se CSS arena padding = 8px → JS: `clientWidth - 16` (8px cada lado).
- Se CSS arena padding = 16px → JS: `clientWidth - 32`.
- **Nunca mudar um sem mudar o outro.**

### 4.5 Teclado Virtual (Codigo Perdido / forca)

- Container do teclado: `width: 100%`, **SEM `max-width`**.
- Teclas individuais: `flex: 1` (distribui igualmente), **SEM `max-width`** individual.
- `min-height: 44px` para área de toque (WCAG).
- Gap entre linhas: 5px, entre teclas: 4px.
- Keyboard inteiro ocupa 100% do container, sem limite artificial.

### 4.6 HUD — Estrutura Padrão

```
[HUD]
  [← back 44×44] [timer/vidas] [centro] [dificuldade]
```

- Back button no HUD: 44×44px, borda 1px, cor cyan.
- Timer (Sliding) ou vidas/hearts (forca): à esquerda.
- Informação central: movimentos ou tamanho da palavra.
- Dificuldade: à direita, com cor correspondente ao nível.
- HUD usa `flex-shrink: 0; border-bottom: 1px solid var(--ghost)`.

### 4.7 Mobile-first NÃO é media query no fim

- **ERRADO:** Escrever CSS para desktop e "consertar" com `@media (max-width: ...)` no fim.
- **ERRADO:** Escrever CSS genérico e adicionar `@media (min-width: 600px)` com overrides.
- **CERTO:** O layout portrait com `max-width: 480px` já resolve a adaptação. Não precisa de breakpoints falsos.
- **CERTO:** Se precisar de ajustes específicos, pensar no layout desde o início em portrait.
- Adicionar media queries no fim do CSS para "consertar" layout é **TRABALHO SUPERFICIAL e NÃO será aceito.**

### 4.8 CSS Custom Properties — Convenção de Nomes

- Globais: `--bg-primary`, `--accent-teal`, `--text-muted`, `--font-display`, etc. (definidas em `src/index.css :root`)
- Por jogo: prefixo do jogo + nome. Ex: `--pp-jack`, `--tt-orange`, `--ldi-accent-red`, `--cp-cyan`, `--sr-ghost`
- Dinâmicas (via inline style): `--cor-neon`, `--cor`, `--elem-cor`, `--pct`, `--delay`

### 4.9 Definição de Altura de Canvas/Container em Flex

- Canvas **não se comporta como div** em flex layout.
- **Sempre medir o pai em pixels**, nunca o canvas diretamente.
- Para saber o espaço disponível, medir `clientWidth`/`clientHeight` do container pai.

---

## 5. i18n — Sistema de Tradução

### 5.1 Arquitetura

- Provider: `LanguageProvider` em `src/context/LanguageProvider.jsx`
- Context: `LanguageContext` em `src/context/LanguageContext.jsx`
- Agregador: `src/i18n/locales.js` — importa todos os JSONs e faz deepMerge
- Hook: `useLanguage()` retorna `{ locale, t, tt, changeLocale }`

### 5.2 Função `t(path, vars?)`

```jsx
const { t } = useLanguage()
t("games.minigames.voltar")          // → "VOLTAR" (locale atual)
t("bemvindo", { nome: "João" })     // → "Bem-vindo, João!"
```

- Path: notação de pontos (`games.arena.atacar`), suporta `[0]` para arrays
- Fallback: se path não encontrado, retorna o próprio path (útil para debug)
- Interpolação: `{varName}` no template é substituído por regex global
- Shorthand `tt(path, vars?)`: prefixa `games.toptrumps.` automaticamente

### 5.3 Namespace Hierarchy (pt.json/en.json/es.json)

```
root
├── nav             → Navbar, links
├── hero            → Slideshow da home
├── episodes        → Webtoon episodes
├── musicas/music   → Música
├── achievement     → Achievements
├── login_gate      → Login gate modal
├── modal_sem_fichas → Modal fichas
├── ficha_gate      → Ficha gate texts
├── search          → Search modal
├── agora/nowlive   → Now live
├── shop            → Store
├── progress        → Story progress
├── homeSupport     → CTA home
├── beta/trial      → Beta banner
├── footer          → Footer columns
├── assinar         → Subscription/Stripe
├── newsletter      → Newsletter
├── tatics          → LDI Tatics UI
├── quiz            → Quiz
├── autor           → Author page
├── site            → Site pages (login, cadastro, games, leaderboard, perfil, etc.)
└── games           → ALL games
    ├── duelo
    ├── minigames
    ├── tatics
    ├── arena        (inclui trash_talk_player, trash_talk_npc)
    ├── lobby
    ├── mp
    ├── tamagoshi    (~150+ chaves, notificações por personalidade)
    ├── pesadelo
    ├── jackcandy    (~200 chaves)
    └── ldi           (~170 chaves)
```

### 5.4 Arquivos de Tradução

| Arquivo | Localização | Conteúdo |
|---|---|---|
| `pt.json` | `src/i18n/` | Site inteiro em PT (~2200+ linhas) |
| `en.json` | `src/i18n/` | Site inteiro em EN (~2200+ linhas) |
| `es.json` | `src/i18n/` | Site inteiro em ES (~2200+ linhas) |
| `pp_pt.json` | `src/i18n/` | Pesadelo Particular PT |
| `pp_en.json` | `src/i18n/` | Pesadelo Particular EN |
| `pp_es.json` | `src/i18n/` | Pesadelo Particular ES |
| `tt_pt.json` | `src/i18n/` | Top Trumps PT |
| `tt_en.json` | `src/i18n/` | Top Trumps EN |
| `tt_es.json` | `src/i18n/` | Top Trumps ES |
| `arena-trash-en.json` | `src/i18n/` | Arena trash talk EN |
| `arena-trash-es.json` | `src/i18n/` | Arena trash talk ES |
| `cardLabels.js` | `src/i18n/` | Labels de atributos Top Trumps |
| `rafael_pt.json` | `src/components/Puzzles/i18n/` | Sliding + Codigo PT |
| `rafael_en.json` | `src/components/Puzzles/i18n/` | Sliding + Codigo EN |
| `rafael_es.json` | `src/components/Puzzles/i18n/` | Sliding + Codigo ES |

### 5.5 deepMerge — Como os JSONs são mesclados

```js
// locales.js
export const locales = {
  pt: deepMerge({ ...pt, ...pp_pt }, tt_pt),
  es: deepMerge({ ...es, ...pp_es }, trash_es, tt_es),
  en: deepMerge({ ...en, ...pp_en }, trash_en, tt_en),
}
```

- `deepMerge` recursivo: mescla objetos aninhados, **substitui arrays** (não concatena).
- Ordem importa: argumentos posteriores sobrescrevem anteriores em conflito.
- pt: base `pt.json` + spread de `pp_pt.json`, depois mesclado com `tt_pt.json`.

### 5.6 Import Dinâmico (Rafael Puzzles)

Os arquivos `rafael_*.json` NÃO passam pelo `locales.js`. São carregados via import dinâmico pelo hook `useRafaelI18n`:

```js
// src/components/Puzzles/useRafaelI18n.js
import(`./i18n/rafael_${locale}.json`)  // resolve para src/components/Puzzles/i18n/rafael_pt.json
```

Isso porque o caminho é **relativo ao arquivo do hook**. **ATENÇÃO:** Se mover o hook de pasta, o import quebra silenciosamente — o glob não encontra nada mas não dá erro.

### 5.7 Padrões e Convenções i18n

| Aspecto | Regra |
|---|---|
| Estrutura de chaves | **Totalmente aninhada (objetos)** — não plana |
| Notação de acesso | `t("games.arena.atacar")` — pontos |
| Interpolação | `{varName}` com chaves simples (o regex é `\{(\w+)\}`) |
| Fallback | Se path não encontrado → retorna o próprio path |
| Nomes de arquivo | `{prefixo}_{locale}.json` — locale (pt/en/es) é SEMPRE o sufixo |
| Locale storage | `localStorage.getItem('ldi-locale')` — default `'pt'` |
| PT/EN/ES | **OBRIGATÓRIO para TODA string visível ao usuário** |
| Chave faltando | Bloqueia commit. Verificar sempre as 3 línguas. |

### 5.8 Games SEM i18n próprio (strings em pt.json)

- Jack Dream Candy: `games.jackcandy.*`
- Lendas do LDI: `games.ldi.*`
- Tamagoshi: `games.tamagoshi.*`
- Duelo LDI: `games.duelo.*`
- MiniGames: `games.minigames.*`
- Quiz SDR: `quiz.*`

---

## 6. Arquitetura do Portal

### 6.1 Estrutura de Pastas Completa

```
/
├── index.html                 # Entry + SEO/OG + GA + SPA redirect
├── package.json               # Dependências + scripts
├── vite.config.js             # base: '/', sourcemap: true
├── AGENTS.md                  # Regras do agente
├── SITE_MAP.md                # Route table + versions
├── docs/                      # Bíblia do Isaias, ReportAI/
├── scripts/                   # Utilitários (prerender-routes.js, run-migration.js)
├── deploy.py                  # Automação de deploy
├── .env / .env.production
├── public/
│   ├── index.html             # Custom domain SPA
│   ├── 404.html               # SPA redirect
│   ├── CNAME                  # illusionfight.com
│   ├── _redirects             # 10+ trailing slash 301 rules
│   ├── sitemap.xml            # 18 URLs públicas
│   ├── sw.js                  # Service worker placeholder
│   ├── assets/                # Public assets (arena, characters, livro, fonts)
│   ├── games/                 # 15 HTML estáticos para crawlers SEO
│   └── webtoon/               # Páginas do webtoon (ep. 00, 01)
├── supabase/
│   ├── migrations/            # 004-022 SQL migrations
│   └── functions/             # 3 Stripe Edge Functions
└── src/
    ├── App.jsx                # Layout + Routes
    ├── main.jsx               # Entry: 8 Providers aninhados
    ├── index.css              # CSS Global + :root custom properties
    ├── config/                # version.js, site.js, fichas.js, launch.js, trial.js
    ├── context/               # 8 providers (Auth, Language, Reader, Fichas, etc.)
    ├── lib/                   # supabase.js, sfx.js, stripe.js, getDeck.js, notificationManager.js
    ├── hooks/                 # 13 hooks
    ├── i18n/                  # 13 arquivos de tradução
    ├── data/                  # 29 arquivos de dados
    ├── assets/images/         # Imagens processadas pelo Vite
    ├── components/            # 30+ componentes reutilizáveis
    │   └── Puzzles/           # SlidingRafael, CodigoPerdido + i18n/
    └── pages/
        ├── games/             # 13 jogos
        ├── content/           # 8 páginas de conteúdo
        ├── platform/          # 7 páginas de plataforma
        ├── site/              # 6 páginas do site
        └── lab/               # Protótipos
```

### 6.2 Provider Hierarchy (main.jsx)

```
ReaderProvider
→ HelmetProvider
  → BrowserRouter
    → AuthProvider
      → FichasProvider
        → DixProvider
          → AchievementsProvider
            → EventosProvider
              → LanguageProvider
                → App
```

### 6.3 Todas as Rotas (App.jsx)

| Rota | Componente | Proteção |
|---|---|---|
| `/` | Home | — |
| `/personagens` | Personagens | — |
| `/personagens/:id` | PersonagemDetalhe | — |
| `/livro` | Livro | — |
| `/livro/:id` | LivroCapitulo | — |
| `/webtoon` | Webtoon | — |
| `/webtoon/:id` | WebtoonEpisodio | — |
| `/musicas` | Musicas | — |
| `/mundo` | Mundo | — |
| `/games` | Games | — |
| `/games/ldi*` (8 rotas) | LDI | FichaGateRoute (isFree) |
| `/games/jackcandy` | JackCandy | FichaGateRoute |
| `/games/minigames` | MiniGames | FichaGateRoute (isFree) |
| `/games/ldi-arena` | ArenaRoute | FichaGateRoute |
| `/games/ldi-tatics` | ArenaTaticsRoute | FichaGateRoute |
| `/games/pesadelo` | PP | FichaGateRoute |
| `/games/duelo` | DueloRoute | FichaGateRoute |
| `/games/tamagoshi` | Tamagoshi | FichaGateRoute (isFree) |
| `/games/toptrumps` | TopTrumpsSP_v2 | — |
| `/games/toptrumps/legacy` | TopTrumps | FichaGateRoute |
| `/games/toptrumps/lobby` | TopTrumpsLobby | FichaGateRoute |
| `/games/toptrumps/multiplayer` | TopTrumpsMP | FichaGateRoute |
| `/games/kernel-panic` | KernelPanic | — |
| `/games/sliding-rafael` | SlidingRafael | — |
| `/games/codigo-perdido` | CodigoPerdido | — |
| `/assinar` | Assinar | — |
| `/login` | Login | — |
| `/cadastro` | Cadastro | — |
| `/perfil` | Perfil | — |
| `/admin` | Admin | — |
| `/leaderboard` | Leaderboard | — |
| `/autor` | Autor | — |
| `/quiz` | Quiz | — |
| `/loja` | Loja | — |
| `/custos` | Custos | — |
| `/prototype` | Prototype | — |
| `/prototype/srgrm` | SRGRM | — |
| `/prototype/arenatestbed` | ArenaTestbed | — |
| `*` | NotFound | — |

### 6.4 ReaderMode

- Context: `ReaderContext` (booleano simples)
- Quando `readerMode = true`: Navbar + TrialBanner ficam ocultos
- Usado por: LivroCapitulo, WebtoonEpisodio, SlidingRafael, CodigoPerdido
- Ativar: `useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])`

### 6.5 z-index Layers

| Componente | z-index |
|---|---|
| MusicSection dropdown | 50 |
| ScrollToTop | 100 |
| TrialBanner | 140 |
| LDINotification | 150 |
| CookieBanner | 200 |
| Navbar | 1000 |
| AchievementToast | 1500 |
| SearchModal | 2000 |

**Nunca colidir. Nunca usar valores soltos.**

---

## 7. Regras de Código

### 7.1 JavaScript / JSX

- **JSX only. SEM TypeScript.** (Apesar de `@types/react` em devDeps, o projeto é JS puro.)
- Toda string visível ao usuário **DEVE** usar `t()` do i18n.
- NUNCA hardcoded strings em PT (ou qualquer idioma) no JSX.
- NUNCA sobrescrever arrays inteiros — adicionar itens com spread ou push.
- NUNCA remover `console.log` de diagnóstico sem permissão.
- Usar `maybeSingle()` em vez de `single()` no Supabase (evita erro em resultado vazio).
- Insert em profiles: só após SIGNED_IN, nunca no signUp direto.
- `emailRedirectTo`: URL fixa `https://illusionfight.com/login`, nunca `window.location.origin`.

### 7.2 CSS

- **ZERO CSS-in-JS.** Cada componente tem UM arquivo `.css`.
- `style={{}}` só é aceitável para:
  - ✅ Valores **dinâmicos computados em runtime** (ex: cor baseada em estado do jogo, posição calculada, porcentagem de barra)
  - ✅ CSS custom properties injection: `{ '--var-name': valor }` + CSS usa `var(--var-name)`
  - ✅ Imagens dinâmicas: `{ backgroundImage: url(${src}) }`
  - ✅ Animações de partículas (Framer Motion com posições randômicas)
  - ❌ **PROIBIDO** para: `textAlign`, `fontFamily`, `fontSize`, `padding`, `margin`, `color`, `borderColor`, `background`, `flex*`, `display`, `position`, `cursor`, `opacity`, `zIndex` — tudo isso vai no CSS.
- Nomes de classes: kebab-case ou BEM-like (ex: `.sr-hud-back`, `.cp-kb-key`, `.perfil-avatar`).
- Prefixo por jogo: `sr-*` (SlidingRafael), `cp-*` (CodigoPerdido), `pp-*` (Pesadelo), `tt-*` (Top Trumps).
- CSS files importados com: `import './Componente.css'`.

### 7.3 Segurança — Bloqueia Commit

- String hardcoded visível ao usuário
- CSS inline `style={{}}` para propriedades visuais estáticas
- Chave i18n faltando em **PT/EN/ES**
- Insert direto em Supabase fora do listener correto
- Chaves/URLs expostas

### 7.4 Verificação

- **Não existe linter.** Não existe typecheck.
- **Única verificação:** `npm run build` — se falhar, não commit.
- Verificar visualmente que arquivos existentes não foram destruídos antes do deploy.

---

## 8. CSS Inline — O Que É Aceito vs Proibido

### 8.1 ✅ Aceitável (dinâmico / runtime)

```jsx
// CSS custom properties injection (padrão aprovado)
style={{ '--cor-neon': jogo.cor, '--pct': progresso }}

// Progress bar width
style={{ width: `${(timer / 30) * 100}%` }}

// Dynamic background image
style={{ backgroundImage: `url(${src})` }}

// Elemental colors (Arena)
style={{ '--elem-cor': elemento.cor, '--elem-glow': elemento.glow }}

// Reader preferences (runtime)
style={{ '--reader-font-size': prefs.tamanho, '--reader-font-family': prefs.fonte }}

// Framer Motion particles (random positions)
style={{ position: 'fixed', top: randY, left: randX, zIndex: 1000 }}

// Dynamic disabled state
style={{ opacity: 0.4, cursor: 'not-allowed' }}
```

### 8.2 ❌ PROIBIDO (deve ir no CSS)

```jsx
// ❌ Layout properties
style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}
style={{ padding: '2rem', marginTop: '1.5rem' }}
style={{ position: 'absolute', inset: 0 }}

// ❌ Static visual properties
style={{ color: '#fff', fontSize: '0.95rem', fontFamily: '...' }}
style={{ background: '#0a0a0a', borderColor: '#EF4444' }}
style={{ fontWeight: 600, cursor: 'pointer' }}

// ❌ Repeated patterns (should be CSS class)
style={{ textAlign: 'center', marginTop: '2rem' }}  // aparece 5+ vezes
```

### 8.3 Violações Críticas Existentes (a corrigir)

- ~~**`TrapActivator.jsx`** — ✅ RESOLVIDO v10.190.0 (CSS extraído para TrapActivator.css)~~
- ~~**`ArenaVictory.jsx`** — ✅ RESOLVIDO v10.190.0 (inline styles movidos para classes em Arena.css)~~
- ~~**`MiniGames.jsx`** — ✅ RESOLVIDO v10.190.0 (repetido textAlign/marginTop → .mg-centered/.mg-back-wrapper)~~
- **`DueloRoute.jsx`** — Cores estáticas de borda/botão inline
- **`LDI/Lobby.jsx`** / **`LDI/Game.jsx`** — `marginTop`, `marginRight`, `cursor` inline

---

## 9. Versionamento

### 9.1 Arquivo Central

`src/config/version.js` — todas as versões em UM arquivo.

### 9.2 Constantes de Versão

| Constante | Onde | Descrição |
|---|---|---|
| `SITE_VERSION` | `config/version.js` | Versão global do site |
| `SLIDING_VERSION` | `config/version.js` | PuzzleSlidingRafael |
| `CODIGO_VERSION` | `config/version.js` | PuzzleCodigoPerdido |
| `TATICS_VERSION` | `config/version.js` | Arena LDI Tatics |
| `PP_VERSION` | `config/version.js` | Pesadelo Particular |
| `LDI_VERSION` | `store/useGameStore.js:1` | Lendas do LDI |
| `JACK_VERSION` | `store/useJackStore.js:1` | Jack Dream Candy |
| `MINIGAMES_VERSION` | `MiniGames/version.js:1` | MiniGames |
| `ARENA_VERSION` | `ArenaRoute.jsx:10` | Arena Mode |
| `TAMA_VERSION` | `config/version.js` | Tamagoshi |
| `DUELO_VERSION` | `config/version.js` | Duelo LDI |
| `TS_VERSION` | `config/version.js` | Top Trumps |
| `TM_VERSION` | `config/version.js` | Top Trumps MP |
| `SRGRM_VERSION` | `config/version.js` | SRGRM 3v3 |
| `ARENATESTBED_VERSION` | `config/version.js` | Arena Testbed |
| `KP_VERSION` | `config/version.js` | Kernel Panic |

### 9.3 Regras

- Toda task → `SITE_VERSION` patch bump. SEM EXCEÇÃO.
- Task que mexe em jogo → bump do jogo **E** do site.
- Cada jogo loga no mount: `[NOME] versão carregada: X.X.X`.
- `SITE_MAP.md` deve ser atualizado junto.

---

## 10. Sistemas do Portal

### 10.1 SFX — Sistema de Som (src/lib/sfx.js)

- **Singleton** exportado como `sfx`.
- **Web Audio API** puro — nenhum arquivo de áudio externo. Todos os sons são sintetizados.
- Persiste `enabled` flag em localStorage (`ldi-sfx-enabled`).
- AudioContext criado lazy na primeira chamada; auto-resume se suspenso.

**32 funções de som disponíveis:**

| Categoria | Funções |
|---|---|
| UI | `click()`, `menuHover()`, `select()`, `cancel()` |
| Timer | `countdownTick()`, `timerUrgent()` |
| Game | `win()`, `lose()`, `draw()`, `reward()`, `nextRound()` |
| Battle | `attackSlash()`, `attackHeavy()`, `attackQuick()`, `attackEnergy()`, `attackCritical()`, `attackPunch()` |
| Card | `cardFlip()`, `vs()` |
| Dramatic | `explosion()`, `heartbeat()`, `startHeartbeatLoop()`, `stopHeartbeatLoop()` |
| Interaction | `typing()`, `diceTick()`, `diceLand()`, `message()`, `pptChoice()` |
| Power | `powerUsage()`, `speakPowerName(name)` (TTS) |
| Notification | `notification()` |

**Import:**
```jsx
import { sfx } from '../../lib/sfx'
sfx.click()
sfx.win()
```

### 10.2 Fichas — Sistema de Moeda Virtual (FichasContext)

- Context: `FichasContext` + `useFichas()` hook
- Provider em `main.jsx`: dentro de AuthProvider
- Supabase tables: `fichas` (saldo), `fichas_historico` (transações)
- Fichas por tier: free=100, elite=10, primordial=30, moderator=10, admin=999
- Coleta diária: `coletarDiarias()` (upsert no Supabase)
- **Flag global:** `FICHAS_GATE_ATIVO = false` em `src/config/fichas.js` — desliga o gate inteiro

### 10.3 FichaGateRoute — Proteção de Rota

- Componente: `src/components/FichaGateRoute/FichaGateRoute.jsx`
- Fluxo de 6 etapas: `carregando → login → gamefree → liberado → confirmacao → semfichas`
- Props: `gameId`, `feature`, `nomeExibicao`, `isFree`, `children`
- Se `FICHAS_GATE_ATIVO = false`: renderiza `children` sem nenhuma verificação
- Persistência localStorage: `ficha_gate_{gameId}` = data de hoje

### 10.4 Auth — Autenticação (AuthContext)

- Supabase Auth (email/password)
- Profile insert: SÓ após SIGNED_IN, nunca no signUp direto
- Session tracking: `last_seen_at` via `navigator.sendBeacon` no beforeunload
- Guest: não pode desbloquear achievements
- Login gate: `src/components/LoginGate/` — modal reutilizável

### 10.5 Notification System

- `notificationManager.js` — fila persistida em localStorage, cooldown de 15 min
- `UnifiedNotification` — renderizado em App.jsx
- **Problema conhecido:** fila persiste entre sessões. Limpar `clearByType('achievement')` na transição `user → null` em AchievementsContext.

### 10.6 DIX — Moeda Secundária (DixContext)

- Usada no Tamagoshi
- Inicial: 1000 DIX (criado no primeiro acesso)
- +10/ação, +25/login diário
- Gastos: 5-30 DIX por item

---

## 11. Decisões e Hurdles Documentados

### 11.1 Glob Path (import.meta.glob)

`import.meta.glob` usa caminho **RELATIVO** ao arquivo ATUAL. Se o componente é movido de pasta, o glob não encontra nada — mas **não dá erro, só retorna vazio**. Sempre verificar paths de `import.meta.glob` após refactors.

**Exemplo:** `./i18n/rafael_${locale}.json` em `useRafaelI18n.js` resolve para `src/components/Puzzles/i18n/`. Se mover o hook, quebra.

### 11.2 PUZZLE I18N — Localização Especial

Os arquivos `rafael_*.json` estão em `src/components/Puzzles/i18n/` (NÃO em `src/i18n/`). São carregados via import dinâmico pelo hook `useRafaelI18n`. O cache é module-level (`const cache = {}`) para evitar re-imports.

### 11.3 Supabase Pitfalls

- Insert em `profiles` só após SIGNED_IN (nunca no signUp direto)
- Sempre `maybeSingle()` em vez de `single()` (evita erro em resultado vazio)
- `emailRedirectTo` deve ser URL fixa `https://illusionfight.com/login`

### 11.4 Notification Queue Persistence

`notificationManager.queue` persiste em localStorage entre sessões. Achievements enfileirados por usuário logado permanecem após logout. Corrigir limpando `clearByType('achievement')` na transição `user → null`.

### 11.5 Canvas Height em Flex

Canvas **não se comporta como div** em flex layout. Sempre medir o pai, nunca o canvas.

### 11.6 Nunca Migrar Biblioteca sem Ganho Visual

(Nunca repetir a lição Pixi.js — migração sem ganho visual comprovado.)

---

## 12. Infraestrutura

### 12.1 Deploy

```bash
npm run build        # vite build + prerender 26 rotas
npm run deploy       # gh-pages push dist/ → gh-pages branch
git push             # push main branch source
```

### 12.2 GitHub Pages + SPA

- `public/404.html` — captura 404, extrai path, redireciona para `/?/<path>`
- Script em `index.html` head — restaura URL limpa via `history.replaceState`
- CNAME: `illusionfight.com`
- 15+ HTML estáticos em `public/*/index.html` para crawlers (SE0)
- `public/_redirects` — 10+ regras de trailing slash 301

### 12.3 Supabase

- Project: `dvxfrzixtetdzmdrzkpx.supabase.co`
- Migrations em `supabase/migrations/` (004-022)
- Todas as tabelas usam RLS com `auth.uid() = user_id`
- Tabelas principais: `profiles`, `toptrumps_decks`, `dix_wallet`, `tamagoshi_saves`, `fichas`, `fichas_historico`
- Edge Functions (Stripe): create-checkout-session (JWT), stripe-webhook (no JWT), cancel-subscription (JWT)

### 12.4 Sitemap

- 18 URLs públicas em `public/sitemap.xml`
- Rotas privadas NÃO estão no sitemap (login, cadastro, perfil, admin, assinar, custos, prototype, multiplayer)
- `hreflang` alternativas: pt, en, es, x-default

---

## 13. Conduct Rules Finais

1. **NUNCA** sobrescrever arrays inteiros — adicionar itens.
2. **NUNCA** remover `console.log` de diagnóstico sem permissão.
3. **NUNCA** usar `style={{}}` para propriedades visuais estáticas — manter no CSS.
4. **SEMPRE** verificar se arquivos existentes não foram destruídos antes do deploy.
5. **SEMPRE** verificar ALL cards presentes ao modificar `src/pages/games/Games.jsx` (KERNEL_JOGOS).
6. **SEMPRE** ler `SITE_MAP.md` antes de mudanças que afetam rotas ou versões.
7. **LER `SITE_MAP.md` PRIMEIRO** para route tables, component inventory, data locations, z-index map.
8. **NUNCA** commitar sem build bem-sucedido.
9. **NUNCA** pular bump de versão.
10. **SEMPRE** atualizar `SITE_MAP.md` junto com a versão.
11. **PENSAR** antes de codificar. Visualizar o resultado. Testar mentalmente.
12. **PERGUNTAR** se não tiver certeza. Melhor perguntar do que fazer errado.

---

> **"Você tem certeza que fez o que foi pedido?"**
>
> — Isaias
