# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-01*
*Versão: 1.1*

> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.**

---

## 1. ESTRUTURA DE PASTAS

```
/
├── index.html                          # Entry point HTML
├── package.json                        # Dependências e scripts (inclui predeploy/deploy)
├── vite.config.js                      # Configuração Vite (base: /illusionfight-site/)
├── SITE_MAP.md                         # Este arquivo
├── .gitignore                          # Node, dist, .env, Retcon.md
├── public/
│   ├── favicon.svg                     # Favicon LDI
│   ├── og-image.jpg                    # Open Graph preview (1200×630)
│   └── 404.html                        # Redirect SPA para GitHub Pages
└── src/
    ├── App.jsx                         # React Router (rotas)
    ├── main.jsx                        # Entry point React
    ├── index.css                       # CSS Global (reset, vars, .btn, .glitch)
    │
    ├── assets/
    │   ├── fonts/                      # (vazio — fonts via Google Fonts)
    │   └── images/
    │       ├── banners/                # banner-01.png ~ banner-04.png
    │       ├── characters/             # (vazio — placeholders até imagens chegarem)
    │       ├── episodes/               # (vazio)
    │       └── logos/                  # logo-pt.png, logo-en.png
    │
    ├── components/                     # 14 componentes (JSX + CSS, todos em src/components/)
    ├── config/
    │   └── site.js                     # SITE_CONFIG (TRIAL_MODE, SITE_NAME, etc.)
    ├── context/
    │   └── LanguageContext.jsx          # Provider + useLanguage() hook
    ├── data/
    │   ├── livro-index.json            # Metadados dos 16 capítulos
    │   ├── personagens-pt.json         # 9 personagens (PT)
    │   ├── personagens-en.json         # 9 personagens (EN)
    │   ├── personagens-es.json         # 9 personagens (ES)
    │   └── livro/
    │       ├── pt/                     # 16 capítulos .md (PT)
    │       ├── en/                     # (vazio)
    │       └── es/                     # (vazio)
    ├── hooks/                          # 5 hooks customizados
    ├── i18n/
    │   ├── pt.json                     # Traduções PT
    │   ├── en.json                     # Traduções EN
    │   ├── es.json                     # Traduções ES
    │   └── locales.js                  # Import aggregator + LOCALE_LABELS
    └── pages/                          # 3 páginas internas + Home
```

---

## 2. PÁGINAS E ROTAS

| Rota | Componente | Arquivo | Status | Descrição |
|---|---|---|---|---|
| `/` | Home | `src/pages/Home.jsx` | ✅ | Landing page completa (hero + seções) |
| `/personagens` | Personagens | `src/pages/Personagens.jsx` | ✅ | Grid com todos os 9 personagens |
| `/personagens/:id` | PersonagemDetalhe | `src/pages/PersonagemDetalhe.jsx` | ✅ | Detalhe do personagem (2 colunas) |
| `/livro` | Livro | `src/pages/Livro.jsx` | ✅ | Índice de capítulos com controle de publicação |
| `/livro/:id` | LivroCapitulo | `src/pages/LivroCapitulo.jsx` | ✅ | Leitor com react-markdown + navegação |
| `/assinar` | Assinar | `src/pages/Assinar.jsx` | ✅ | Página de planos de assinatura — link na navbar (âmbar), footer e CTA na home |
| `/autor` | Autor | `src/pages/Autor.jsx` | ✅ | História do autor — link no footer |

---

## 3. COMPONENTES

| Componente | Arquivo JSX | Arquivo CSS | Usado em | Descrição |
|---|---|---|---|---|
| TrialBanner | `TrialBanner.jsx` | `TrialBanner.css` | Home | Faixa âmbar fixa no topo (TRIAL_MODE) |
| Navbar | `Navbar.jsx` | `Navbar.css` | Home | Navbar com logo, links, lang switcher, drawer |
| HeroSlideshow | `HeroSlideshow.jsx` | `HeroSlideshow.css` | Home | Slideshow automático com crossfade + Ken Burns |
| HeroEffect | `HeroEffect.jsx` | `HeroEffect.css` | HeroSlideshow | Canvas com linhas teal/âmbar caindo |
| TypewriterPhrase | `TypewriterPhrase.jsx` | `TypewriterPhrase.css` | HeroSlideshow | Frase com efeito de digitação |
| CharactersRow | `CharactersRow.jsx` | `CharactersRow.css` | Home | Scroll horizontal com Kim/Jack/Nina |
| CharacterCard | `CharacterCard.jsx` | `CharacterCard.css` | CharactersRow, Personagens | Card 200×300 com hover Netflix |
| BookChaptersRow | `BookChaptersRow.jsx` | `BookChaptersRow.css` | Home | Scroll horizontal com capítulos publicados |
| LatestEpisodes | `LatestEpisodes.jsx` | `LatestEpisodes.css` | Home | Grid 3 episódios + link Webtoon Canvas |
| MusicSection | `MusicSection.jsx` | `MusicSection.css` | Home | CTA Spotify com ícone SVG + botão verde |
| StoryProgress | `StoryProgress.jsx` | `StoryProgress.css` | Home | Timeline horizontal ONDE ESTAMOS |
| SocialBar | `SocialBar.jsx` | `SocialBar.css` | Footer | Ícones X/Instagram/TikTok/YouTube |
| Footer | `Footer.jsx` | `Footer.css` | Home | 3 colunas + SocialBar + copyright |

---

## 4. HOOKS

| Hook | Arquivo | Usado em | O que faz |
|---|---|---|---|
| `useSlideshow` | `useSlideshow.js` | HeroSlideshow | Auto-advance 6s + crossfade 1.2s |
| `useHeroEffect` | `useHeroEffect.js` | HeroEffect | Canvas com 40-60 linhas verticais caindo |
| `useTypewriter` | `useTypewriter.js` | TypewriterPhrase | Digita/apaga em loop (~28s ciclo) |
| `useScrollPosition` | `useScrollPosition.js` | Navbar | Detecta scroll > 20px para background |
| `usePersonagens` | `usePersonagens.js` | CharactersRow, Personagens, PersonagemDetalhe | Carrega JSON + agrupa por categoria |

---

## 5. DADOS (JSON)

| Arquivo | Localização | Idiomas | Conteúdo | Usado em |
|---|---|---|---|---|
| `site.js` | `src/config/` | — | `SITE_CONFIG` (TRIAL_MODE, DOMAIN) | TrialBanner, Navbar |
| `pt.json` | `src/i18n/` | PT | Nav, hero, about, stats, episodes, music, progress, trial, footer | Todos os componentes |
| `en.json` | `src/i18n/` | EN | Mesma estrutura | Todos os componentes |
| `es.json` | `src/i18n/` | ES | Mesma estrutura | Todos os componentes |
| `personagens-pt.json` | `src/data/` | PT | 9 personagens com dados completos | usePersonagens hook |
| `personagens-en.json` | `src/data/` | EN | 9 personagens | usePersonagens hook |
| `personagens-es.json` | `src/data/` | ES | 9 personagens | usePersonagens hook |
| `livro-index.json` | `src/data/` | PT/EN/ES | 16 capítulos + controle de publicação + resumo_pt/en/es | Livro, LivroCapitulo, BookChaptersRow |
| `capitulo-01.md` ~ `16.md` | `src/data/livro/pt/` | PT | Conteúdo integral dos capítulos | LivroCapitulo (lazy load) |

---

## 6. ASSETS

| Tipo | Pasta | Arquivos | Status |
|---|---|---|---|
| Banners | `src/assets/images/banners/` | `banner-01.png` ~ `banner-04.png` | ✅ Final (arte real do usuário, ~2.3MB cada) |
| Logos | `src/assets/images/logos/` | `logo-pt.png`, `logo-en.png` | ✅ Final (arte real) |
| Characters | `src/assets/images/characters/` | (vazio) | 🔲 Placeholder (cor sólida + nome) |
| Episodes | `src/assets/images/episodes/` | (vazio) | 🔲 Placeholder (thumbnails cinza) |
| Fonts | `src/assets/fonts/` | (vazio) | 🔲 Via Google Fonts (Rajdhani, IBM Plex Sans, JetBrains Mono) |
| Favicon | `public/` | `favicon.svg` | ✅ Final |

---

## 7. CONFIGURAÇÃO

| Arquivo | Localização | O que configura |
|---|---|---|
| `vite.config.js` | Raiz | `base: '/illusionfight-site/'`, plugin React |
| `package.json` | Raiz | Dependências, scripts dev/build/preview/predeploy/deploy |
| `site.js` | `src/config/` | `TRIAL_MODE`, `SITE_NAME`, `SITE_NAME_PT`, `DOMAIN` |
| `LanguageContext.jsx` | `src/context/` | Provider de i18n: `locale`, `t()`, `changeLocale()` |
| `locales.js` | `src/i18n/` | Importa JSONs + `LOCALE_LABELS` |
| `App.jsx` | `src/` | React Router (5 rotas, sem basename — resolvido no BrowserRouter) |
| `main.jsx` | `src/` | BrowserRouter com `basename="/illusionfight-site"` |
| `public/404.html` | `public/` | Redirect SPA — captura 404 do GitHub Pages e redireciona com query param |
| `index.html` | Raiz | Script de restauração de URL a partir do query param (`l.search[1] === '/'`) |

---

## 8. FEATURES IMPLEMENTADAS

- ✅ **Navbar** — Logo LDI, 8 links (AUTOR + APOIAR em âmbar), botão ENTRAR, background com scroll, drawer mobile, seletor de idioma (PT/ES/EN)
- ✅ **Hero Slideshow** — 4 imagens com crossfade 1.2s, Ken Burns (scale 1.0→1.08), overlays gradiente, scan lines, efeito chuva digital (HeroEffect canvas)
- ✅ **Typewriter** — Frase com efeito de digitação (loop ~28s), container terminal HUD
- ✅ **Personagens (home)** — Scroll horizontal com Kim, Jack, Nina
- ✅ **Últimos capítulos (home)** — BookChaptersRow, scroll horizontal, cards 200×300 com hover e overlay
- ✅ **Bug hover personagem resolvido** — overflow: visible no card, overflow: hidden restrito à imagem, overflow-y: clip na row
- ✅ **Personagens (página)** — Grid completo com 9 personagens agrupados por categoria
- ✅ **Personagem Detalhe** — 2 colunas, nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações
- ✅ **Episódios** — Grid 3 cards com badge FREE/PREMIUM + link Webtoon Canvas
- ✅ **Música** — CTA Spotify com botão verde #1DB954
- ✅ **Progresso da Obra** — Timeline horizontal com 3 marcos e animação staggered
- ✅ **SocialBar** — X, Instagram, TikTok, YouTube no footer
- ✅ **Footer** — 3 colunas + social + copyright
- ✅ **Trial Banner** — Faixa âmbar fixa (controlada por TRIAL_MODE)
- ✅ **Sistema de Livro** — Índice com controle de publicação, leitor com react-markdown, lazy loading por capítulo, navegação anterior/próximo
- ✅ **i18n** — PT, EN, ES com JSONs separados e LanguageContext
- ✅ **Scrollbar customizada** — Teal sutil, 6px
- ✅ **Scroll horizontal sem scrollbar** — CharactersRow
- ✅ **Git + Remote** — Repositório `lutasdeilusao-cpu/illusionfight-site`, remote configurado
- ✅ **GitHub Pages + Vite** — `base: '/illusionfight-site/'`, `gh-pages` package, deploy automático com `npm run deploy`
- ✅ **BrowserRouter basename** — `basename="/illusionfight-site"` em `main.jsx` para roteamento no subpath
- ✅ **SPA 404 fallback** — `public/404.html` redireciona qualquer 404 para `/?/{path}`, e o script no `index.html` restaura a URL limpa com `history.replaceState`
- ✅ **SEO** — meta tags, Open Graph, Twitter Card, react-helmet-async titles dinâmicos, og-image.jpg
- ✅ **Página de assinatura** — 2 planos (R$10/R$30), seção PIX, placeholders para links Stripe
- ✅ **Página do autor** — história de Isaias Leal, CTA para assinar
- ✅ **Navbar global** — TrialBanner, Navbar, Footer renderizados em App.jsx fora das rotas
- ✅ **ScrollToTop** — Botão fixo canto inferior direito, aparece após 400px de scroll
- ✅ **TrialBanner scroll** — Fundo fica sólido ao scrollar (>20px) para legibilidade

---

## 9. FEATURES PENDENTES

- ❌ **Autenticação** — Login, cadastro, sessão
- ❌ **Rankings** — Página de ranking SDR
- ❌ **Mundo** — Página do universo (mapa, lore)
- ❌ **Curiosidades** — Página de curiosidades/trivia
- ❌ **Webtoon** — Página/seção do webtoon
- ❌ **Músicas** — Página com playlist/player
- ❌ **Personagens: imagens reais** — Substituir placeholders por artwork final
- ❌ **Episódios: thumbnails reais** — Substituir placeholders cinza
- ❌ **Páginas EN/ES completas** — Apenas PT tem capítulos do livro
- ❌ **Logo ES** — Apenas PT e EN têm logo em imagem
- ❌ **Modo light** — Dark mode fixo, sem toggle
- ❌ **Busca** — Pesquisa interna no site
- ❌ **sitemap.xml** — Arquivo XML para crawlers
- ❌ **Domínio customizado** — www.illusionfight.com apontando para o GitHub Pages

---

## 10. NOTAS TÉCNICAS

### Stack
- **Vite 8** — Build tool principal. Zero configuração extra para JSX, CSS, assets.
- **React 19** — Última versão estável. Sem TypeScript (JSX puro).
- **React Router 7** — Rotas client-side, `<Link>` para navegação sem reload.
- **react-markdown** — Renderização dos capítulos do livro.
- **Zero CSS-in-JS** — Todo estilo em arquivos `.css` separados por componente.
- **Zero inline styles** — Nenhum `style={{}}` no JSX.

### i18n
- `LanguageContext` (Provider) com estado `locale` persistido em `localStorage('ldi-locale')`.
- Função `t("chave.rota")` busca no JSON do locale atual. Se não achar, devolve a própria chave.
- Personagens: hook `usePersonagens` carrega o JSON correto baseado no `locale`.
- Livro: `livro-index.json` tem `titulo`, `titulo_en`, `titulo_es` por capítulo.

### Assets
- **Regra:** todo asset vai em `src/assets/`. Nada na raiz ou `public/` além de `favicon.svg`.
- **Imports:** usar `import img from './caminho.png'` (Vite processa e hasheia). Nunca string literal no `src`.
- **Characters:** imagens referenciadas via `/assets/images/characters/` nos JSONs. Placeholder `--bg-elevated` + nome até arte chegar.

### Livro
- Capítulos em markdown em `src/data/livro/{lang}/`.
- `import.meta.glob('../data/livro/pt/*.md', { query: '?raw' })` para lazy loading.
- Cada capítulo vira chunk separado no build.
- Controle de acesso via `publicado: true/false` em `livro-index.json`.

### Camadas do Hero (z-index)
```
z-index 1 — slideshow layers
z-index 2 — overlays gradiente (bottom + left)
z-index 3 — HeroEffect (canvas rain)
z-index 4 — scan lines
z-index 5 — conteúdo (logo, frase, botões, scroll)
```

### Deploy (GitHub Pages)

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server local (Vite) |
| `npm run build` | Build de produção para `dist/` |
| `npm run preview` | Preview local do build |
| `npm run deploy` | Build + push do `dist/` para branch `gh-pages` |
| `git push` | Sincroniza código fonte na `main` |

- **Repositório:** https://github.com/lutasdeilusao-cpu/illusionfight-site
- **Site publicado:** https://lutasdeilusao-cpu.github.io/illusionfight-site/
- **Branch de deploy:** `gh-pages` (automática via `gh-pages` package)
- **Source no GitHub Pages:** Deploy from a branch → `gh-pages` / (root)

### SPA no GitHub Pages (404 redirect)

O GitHub Pages não tem um servidor backend, então rotas como `/personagens` retornam 404. A solução usa dois scripts:

1. **`public/404.html`** — Quando o GitHub Pages retorna 404, este HTML é servido. O script extrai o path original, remove o prefixo do repositório (`/illusionfight-site`) e redireciona para `/?/{path}` (ex: `/?/personagens`).

2. **`index.html`** (script no `<head>`) — Detecta se a URL tem query string começando com `/` (`l.search[1] === '/'`). Se sim, restaura a URL limpa via `history.replaceState(null, null, '/illusionfight-site' + decoded)`.

**Fluxo completo:** `/personagens` → 404 → `404.html` redireciona para `/?/personagens` → `index.html` restaura para `/personagens` → React Router renderiza a rota.
