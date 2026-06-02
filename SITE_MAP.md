# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-01*
*Versão: 1.2*

> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.**

---

## 1. ESTRUTURA DE PASTAS

```
/
├── index.html                          # Entry point HTML + SEO/OG tags + GA + SPA redirect script
├── package.json                        # Dependências e scripts (inclui predeploy/deploy)
├── vite.config.js                      # Configuração Vite (base: /illusionfight-site/)
├── SITE_MAP.md                         # Este arquivo
├── .gitignore                          # Node, dist, .env, Retcon.md
├── public/
│   ├── favicon.svg                     # Favicon LDI
│   ├── og-image.jpg                    # Open Graph preview (1200×630)
│   ├── 404.html                        # Redirect SPA para GitHub Pages
│   └── webtoon/
│       └── 00/pt/01~21.png             # 21 páginas do webtoon Ep. 00
└── src/
    ├── App.jsx                         # Layout global (TrialBanner, Navbar, Routes, Footer, ScrollToTop, NotificationBalloon, CookieBanner)
    ├── main.jsx                        # Entry point React (ReaderProvider, HelmetProvider, BrowserRouter, LanguageProvider)
    ├── index.css                       # CSS Global (reset, vars, .btn, .glitch, reveal animations, newsletter-cta, home-support)
    │
    ├── assets/images/
    │   ├── banners/                    # banner-01.png ~ banner-04.png (~2.3MB cada)
    │   ├── characters/                 # jack-balloon.png
    │   ├── episodes/                   # thumb-ep00.png
    │   ├── logos/                      # logo-pt.png, logo-en.png
    │   └── music/                      # lutas-de-ilusao.png
    │
    ├── components/                     # 19 componentes
    ├── config/
    │   └── site.js                     # SITE_CONFIG (TRIAL_MODE, SITE_NAME, etc.)
    ├── context/
    │   ├── LanguageContext.jsx          # Provider de i18n: locale, t(), changeLocale()
    │   └── ReaderContext.jsx           # Estado global readerMode — esconde Navbar e TrialBanner nos leitores
    ├── data/                           # 11 arquivos JSON
    ├── hooks/                          # 6 hooks customizados
    ├── i18n/
    │   ├── pt.json                     # Traduções PT
    │   ├── en.json                     # Traduções EN
    │   ├── es.json                     # Traduções ES
    │   └── locales.js                  # Import aggregator + LOCALE_LABELS
    └── pages/                          # 9 páginas
```

---

## 2. PÁGINAS E ROTAS

| Rota | Componente | Arquivo | Status | Descrição |
|---|---|---|---|---|
| `/` | Home | `src/pages/Home.jsx` | ✅ | Landing page: HeroSlideshow, LatestEpisodes, CharactersRow, BookChaptersRow, MusicSection, NowLive, home-support CTA, StoryProgress, newsletter-cta, ShopSection |
| `/personagens` | Personagens | `src/pages/Personagens.jsx` | ✅ | Grid com todos os 9 personagens agrupados por categoria |
| `/personagens/:id` | PersonagemDetalhe | `src/pages/PersonagemDetalhe.jsx` | ✅ | Detalhe do personagem (2 colunas, nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações) |
| `/livro` | Livro | `src/pages/Livro.jsx` | ✅ | Índice de capítulos com controle de publicação |
| `/livro/:id` | LivroCapitulo | `src/pages/LivroCapitulo.jsx` | ✅ | Leitor com react-markdown, lazy loading, modo imersivo (esconde Navbar/TrialBanner) |
| `/assinar` | Assinar | `src/pages/Assinar.jsx` | ✅ | 3 tiers: RANQUEADO (free), ELITE (R$10), PRIMORDIAL (R$30) — nomenclatura do universo LDI. Newsletter + PIX abaixo |
| `/autor` | Autor | `src/pages/Autor.jsx` | ✅ | História de Isaias Leal em 4 blocos, CTA para assinar |
| `/webtoon` | Webtoon | `src/pages/Webtoon.jsx` | ✅ | Grid de episódios publicados com thumbnails e badges de idioma |
| `/webtoon/:id` | WebtoonEpisodio | `src/pages/WebtoonEpisodio.jsx` | ✅ | Leitor vertical lazy load, fundo preto, max 800px, header fixo próprio, modo imersivo |
| `/musicas` | Musicas | `src/pages/Musicas.jsx` | ✅ | Faixas com capa + plataformas + placeholder videoclipes |

---

## 3. COMPONENTES

| Componente | Arquivo JSX | Arquivo CSS | Usado em | Descrição |
|---|---|---|---|---|
| TrialBanner | `TrialBanner.jsx` | `TrialBanner.css` | App (global) | Faixa âmbar fixa abaixo da navbar (TRIAL_MODE), fundo sólido ao scroll |
| Navbar | `Navbar.jsx` | `Navbar.css` | App (global) | Logo LDI, 8 links (Webtoon, Livro, Músicas, Mundo, Curiosidades, Personagens, AUTOR, APOIAR âmbar), lang switcher, drawer mobile, botão ENTRAR |
| HeroSlideshow | `HeroSlideshow.jsx` | `HeroSlideshow.css` | Home | 4 imagens com crossfade 1.2s, Ken Burns (1.0→1.08), overlays, scanlines, HeroEffect canvas |
| HeroEffect | `HeroEffect.jsx` | `HeroEffect.css` | HeroSlideshow | Canvas com 40-60 linhas teal/âmbar caindo |
| TypewriterPhrase | `TypewriterPhrase.jsx` | `TypewriterPhrase.css` | HeroSlideshow | Frase com efeito de digitação em loop (~28s) |
| LatestEpisodes | `LatestEpisodes.jsx` | `LatestEpisodes.css` | Home | Grid 3 episódios — Ep. 00 com thumbnail real + overlay hover com frase do protagonista + badge FREE, Ep. 01/02 placeholder PREMIUM |
| CharactersRow | `CharactersRow.jsx` | `CharactersRow.css` | Home | Scroll horizontal (Kim, Jack, Nina) com fade gradient nas bordas |
| CharacterCard | `CharacterCard.jsx` | `CharacterCard.css` | CharactersRow, Personagens | Card 200×300, hover scale(1.12), overlay com bio e CTA, ranking |
| BookChaptersRow | `BookChaptersRow.jsx` | `BookChaptersRow.css` | Home | Scroll horizontal com cards de capítulos publicados, hover overlay |
| MusicSection | `MusicSection.jsx` | `MusicSection.css` | Home | 5 círculos (140px), hover abre dropdown com 6 plataformas (Spotify, YouTube, Apple Music, Amazon, Deezer, Tidal), capa real na 1ª música |
| StoryProgress | `StoryProgress.jsx` | `StoryProgress.css` | Home | Timeline horizontal "ONDE ESTAMOS" com tracks (Webtoon, Livro, Música) e bullets done/pending animados |
| NowLive | `NowLive.jsx` | `NowLive.css` | Home | 4 cards estáticos Netflix-style (YouTube, TikTok, X, Instagram) com gradiente da plataforma, overlay "ABRIR →" no hover |
| ShopSection | `ShopSection.jsx` | `ShopSection.css` | Home | Carrossel infinito drag/swipe com 10 produtos placeholder, cards 200px, badge EM BREVE |
| SocialBar | `SocialBar.jsx` | `SocialBar.css` | Navbar, Footer | Ícones X, Instagram, TikTok, YouTube (size small/medium) |
| Footer | `Footer.jsx` | `Footer.css` | App (global) | 3 colunas (Navegação, Universo, Sobre) com links internos (Link) e externos (Substack), SocialBar, copyright |
| ScrollToTop | `ScrollToTop.jsx` | `ScrollToTop.css` | App (global) | Botão fixo canto inferior direito, aparece após 400px de scroll |
| ScrollToTopOnNav | `ScrollToTopOnNav.jsx` | — | App (global) | Escuta mudanças de rota e faz scrollTo(0,0) |
| NotificationBalloon | `NotificationBalloon.jsx` | `NotificationBalloon.css` | App (global) | Balão com foto do Jack, 10 mensagens aleatórias Fisher-Yates, 3min primeira, 10min entre cada, auto-fecha 8s |
| CookieBanner | `CookieBanner.jsx` | `CookieBanner.css` | App (global) | Banner LGPD/GDPR, persiste aceitação em localStorage('ldi-cookies-accepted'), slideUp |
| PlatformIcons | `PlatformIcons.jsx` | — | MusicSection, NowLive | SVGs inline: Spotify, YouTube, Apple Music, Amazon Music, Deezer, Tidal, TikTok, X, Instagram |

---

## 4. HOOKS

| Hook | Arquivo | Usado em | O que faz |
|---|---|---|---|
| `useSlideshow` | `useSlideshow.js` | HeroSlideshow | Auto-advance 6s + crossfade 1.2s |
| `useHeroEffect` | `useHeroEffect.js` | HeroEffect | Canvas com 40-60 linhas verticais caindo |
| `useTypewriter` | `useTypewriter.js` | TypewriterPhrase | Digita/apaga em loop (~28s ciclo) |
| `useScrollPosition` | `useScrollPosition.js` | Navbar | Detecta scroll > 20px para background |
| `usePersonagens` | `usePersonagens.js` | CharactersRow, Personagens, PersonagemDetalhe | Carrega JSON + agrupa por categoria |
| `useScrollReveal` | `useScrollReveal.js` | CharactersRow, BookChaptersRow, LatestEpisodes, MusicSection, NowLive, StoryProgress, ShopSection, newsletter-cta | IntersectionObserver, adiciona classe `revealed` ao entrar na viewport |

---

## 5. DADOS (JSON)

| Arquivo | Localização | Idiomas | Conteúdo | Usado em |
|---|---|---|---|---|
| `site.js` | `src/config/` | — | SITE_CONFIG (TRIAL_MODE, DOMAIN, SITE_NAME) | TrialBanner, Navbar |
| `pt.json` | `src/i18n/` | PT | Nav, hero, episodes, music, progress, trial, footer, assinar, newsletter, nowlive, homeSupport | Todos os componentes |
| `en.json` | `src/i18n/` | EN | Mesma estrutura | Todos os componentes |
| `es.json` | `src/i18n/` | ES | Mesma estrutura | Todos os componentes |
| `personagens-pt.json` | `src/data/` | PT | 9 personagens com dados completos | usePersonagens hook |
| `personagens-en.json` | `src/data/` | EN | 9 personagens | usePersonagens hook |
| `personagens-es.json` | `src/data/` | ES | 9 personagens | usePersonagens hook |
| `livro-index.json` | `src/data/` | PT/EN/ES | 16 capítulos + controle de publicação + resumo_pt/en/es | Livro, LivroCapitulo, BookChaptersRow |
| `capitulo-01.md` ~ `16.md` | `src/data/livro/pt/` | PT | Conteúdo integral dos capítulos | LivroCapitulo (lazy load) |
| `musicas.json` | `src/data/` | — | 5 faixas (1 real com 6 plataformas, 4 placeholders) | MusicSection |
| `planos.json` | `src/data/` | PT/EN/ES | 3 tiers: Ranqueado (free), Elite (R$10), Primordial (R$30) | Assinar |
| `episodios.json` | `src/data/` | PT/EN/ES | Ep. 00 "Apresentação" com frase do protagonista, 21 páginas, thumbnail | Webtoon, WebtoonEpisodio, LatestEpisodes |
| `nowlive.json` | `src/data/` | — | 4 cards (YouTube, TikTok, X, Instagram) com ativo, url, corPlataforma, título | NowLive |
| `produtos.json` | `src/data/` | PT/EN/ES | 10 produtos placeholder (livro, eBook, camisetas, boné, caneca, pôster, quadrinho, chaveiro) | ShopSection |
| `notificacoes.json` | `src/data/` | PT | 10 mensagens na voz do Jack com CTA e URL | NotificationBalloon |

---

## 6. ASSETS

| Tipo | Pasta | Arquivos | Status |
|---|---|---|---|
| Banners | `src/assets/images/banners/` | `banner-01.png` ~ `banner-04.png` | ✅ Final (~2.3MB cada) |
| Logos | `src/assets/images/logos/` | `logo-pt.png`, `logo-en.png` | ✅ Final |
| Characters | `src/assets/images/characters/` | `jack-balloon.png` | ✅ Final |
| Episodes | `src/assets/images/episodes/` | `thumb-ep00.png` | ✅ Final |
| Music | `src/assets/images/music/` | `lutas-de-ilusao.png` | ✅ Final |
| Webtoon | `public/webtoon/` | `00/pt/01~21.png` | ✅ Episódio 00 PT |
| OG Image | `public/` | `og-image.jpg` | ✅ Final |
| Favicon | `public/` | `favicon.svg` | ✅ Final |
| Fonts | — | Google Fonts (Rajdhani, IBM Plex Sans, JetBrains Mono) | ✅ Via Google Fonts |

---

## 7. CONFIGURAÇÃO

| Arquivo | Localização | O que configura |
|---|---|---|
| `vite.config.js` | Raiz | `base: '/illusionfight-site/'`, plugin React |
| `package.json` | Raiz | Dependências, scripts dev/build/preview/predeploy/deploy |
| `site.js` | `src/config/` | TRIAL_MODE, SITE_NAME, SITE_NAME_PT, DOMAIN |
| `LanguageContext.jsx` | `src/context/` | Provider de i18n: locale, t(), changeLocale() |
| `ReaderContext.jsx` | `src/context/` | readerMode — esconde Navbar e TrialBanner em WebtoonEpisodio e LivroCapitulo |
| `locales.js` | `src/i18n/` | Importa JSONs + LOCALE_LABELS |
| `main.jsx` | Raiz | ReaderProvider > HelmetProvider > BrowserRouter (basename) > LanguageProvider > App |
| `App.jsx` | Raiz | Layout global: Navbar (z1000), TrialBanner (z998), Routes, Footer, ScrollToTop, NotificationBalloon, CookieBanner |
| `index.html` | Raiz | SEO meta tags, OG tags, Twitter Card, Google Analytics, SPA redirect script |
| `public/404.html` | `public/` | Redirect SPA — captura 404 do GitHub Pages e redireciona com query param |

---

## 8. FEATURES IMPLEMENTADAS

### Navegação & Layout
- ✅ **Navbar global** — Logo LDI, 8 links (AUTOR + APOIAR em âmbar destaque), lang switcher (PT/ES/EN), drawer mobile, SocialBar, botão ENTRAR, background ao scroll
- ✅ **Navbar acima do TrialBanner** — Navbar z-index 1000 (topo), TrialBanner z-index 998 (abaixo, top: 56px)
- ✅ **Footer** — 3 colunas com links dinâmicos, Newsletter (Substack), SocialBar, copyright
- ✅ **Trial Banner** — Faixa âmbar fixa controlada por TRIAL_MODE, fundo sólido ao scrollar
- ✅ **ScrollToTop** — Botão fixo canto inferior direito, aparece após 400px, scroll suave
- ✅ **Cookie Banner** — LGPD/GDPR, barra fixa no rodapé, persiste aceitação em localStorage
- ✅ **ScrollToTop on Nav** — Volta ao topo ao trocar de rota via ScrollToTopOnNav
- ✅ **Save point Livro** — localStorage ldi-livro-ultimo, restaura scroll ao voltar, botão Continuar lendo no índice
- ✅ **Save point Webtoon** — localStorage ldi-webtoon-ultimo, restaura scroll, botão Continuar na página de episódios
- ✅ **Navegação flutuante** — Botões fixos ← anterior / próximo → no canto inferior esquerdo do leitor de capítulos
- ✅ **Página /musicas** — Hero + faixas com capa e plataformas + placeholder videoclipes
- ✅ **Modo imersivo** — Navbar e TrialBanner ocultos em WebtoonEpisodio e LivroCapitulo via ReaderContext

### Home
- ✅ **Hero Slideshow** — 4 imagens com crossfade 1.2s, Ken Burns, scanlines, HeroEffect (chuva digital), Typewriter
- ✅ **Latest Episodes** — Grid 3 cards, Ep. 00 com thumbnail real + overlay hover com frase do protagonista (zoom 1.15)
- ✅ **Últimos capítulos (home)** — BookChaptersRow scroll horizontal com cards 200×300
- ✅ **Personagens (home)** — CharactersRow scroll horizontal com Kim, Jack, Nina
- ✅ **Música** — 5 círculos com dropdown de 6 plataformas, capa real, hover/click responsivo
- ✅ **No Ar Agora** — 4 cards estáticos Netflix-style (YouTube, TikTok, X, Instagram), gradiente da plataforma
- ✅ **Progresso da Obra** — Timeline horizontal com 3 tracks animadas via IntersectionObserver
- ✅ **Itens do Universo** — ShopSection carrossel infinito drag/swipe com 10 produtos placeholder
- ✅ **Newsletter CTA** — Bloco "RECEBA AS NOVIDADES" com link para Substack
- ✅ **Scroll Reveal** — Animações fade+translateY em todas as seções via IntersectionObserver

### Personagens
- ✅ **Página Personagens** — Grid completo com 9 personagens agrupados por categoria
- ✅ **Personagem Detalhe** — 2 colunas, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações
- ✅ **i18n** — Dados de personagens em PT/EN/ES

### Livro
- ✅ **Sistema de Livro** — Índice com controle de publicação, leitor react-markdown, lazy loading por capítulo, navegação anterior/próximo
- ✅ **16 capítulos escritos** — Publicados 3 (cap. 01-03), resto em controle de acesso

### Webtoon
- ✅ **Página de episódios** — Grid com thumbnails, badges de idioma, link para leitor
- ✅ **Leitor de Webtoon** — Scroll vertical, lazy load, max 800px, fundo preto, header fixo próprio
- ✅ **Ep. 00 "Apresentação"** — 21 páginas em PT, thumbnail real na home e no grid

### Assinatura
- ✅ **3 Tiers LDI** — Ranqueado (free), Elite (R$10/mês), Primordial (R$30/mês) com benefícios em PT/EN/ES
- ✅ **Seção PIX** — Placeholder para chave PIX
- ✅ **Newsletter Substack** — Bloco de inscrição na página /assinar

### Autor
- ✅ **Página do Autor** — História de Isaias Leal em 4 blocos, CTA para /assinar

### Notificações
- ✅ **NotificationBalloon** — Balão com foto do Jack, 10 mensagens com CTAs, Fisher-Yates shuffle, 3min primeira, 10min entre, 8s auto-close, Link para rotas internas

### SEO & Analytics
- ✅ **SEO** — Meta tags, Open Graph, Twitter Card, react-helmet-async títulos dinâmicos por página
- ✅ **og-image.jpg** — Preview 1200×630 para compartilhamento
- ✅ **Google Analytics** — G-QVDGMZ1F58, script no index.html
- ✅ **SPA 404 fallback** — 404.html + script de restauração para rotas no GitHub Pages

### Deploy
- ✅ **GitHub Pages + Vite** — base: '/illusionfight-site/', gh-pages package, npm run deploy
- ✅ **BrowserRouter basename** — basename="/illusionfight-site" em main.jsx

### Estilo
- ✅ **Scrollbar customizada** — Teal sutil, 6px
- ✅ **Scroll horizontal sem scrollbar** — CharactersRow, ShopSection

---

## 9. FEATURES PENDENTES

- ❌ **Autenticação** — Login, cadastro, sessão
- ❌ **Rankings** — Página de ranking SDR
- ❌ **Mundo** — Página do universo (mapa, lore)
- ❌ **Curiosidades** — Página de curiosidades/trivia
- ❌ **Webtoon episódios futuros** — Episódios 01+ em produção
- ❌ **Músicas** — Página com playlist/player dedicada
- ❌ **Personagens: imagens reais** — Substituir placeholders dos cards por artwork final
- ❌ **Páginas EN/ES completas** — Apenas PT tem capítulos do livro traduzidos
- ❌ **Logo ES** — Apenas PT e EN têm logo em imagem
- ❌ **Modo light** — Dark mode fixo, sem toggle
- ❌ **Busca** — Pesquisa interna no site
- ❌ **sitemap.xml** — Arquivo XML para crawlers
- ❌ **Domínio customizado** — www.illusionfight.com apontando para o GitHub Pages
- ❌ **Integração Stripe** — Links reais de pagamento nos tiers de assinatura

---

## 10. NOTAS TÉCNICAS

### Stack
- **Vite 8** — Build tool. Zero config para JSX, CSS, assets.
- **React 19** — Última versão estável. Sem TypeScript (JSX puro).
- **React Router 7** — Rotas client-side, `<Link>` para navegação sem reload.
- **react-markdown** — Renderização dos capítulos do livro.
- **react-helmet-async** — Títulos dinâmicos por página.
- **Zero CSS-in-JS** — Todo estilo em arquivos `.css` separados por componente.
- **Zero inline styles** — Nenhum `style={{}}` no JSX.

### i18n
- `LanguageContext` com estado `locale` persistido em `localStorage('ldi-locale')`.
- Função `t("chave.rota")` busca no JSON do locale atual. Se não achar, devolve a própria chave.
- Personagens: hook `usePersonagens` carrega o JSON correto baseado no `locale`.
- Livro: `livro-index.json` tem `titulo`, `titulo_en`, `titulo_es` por capítulo.

### Assets
- **Regra:** todo asset em `src/assets/`. Nada na raiz ou `public/` além de `favicon.svg`, `og-image.jpg`, `404.html` e `webtoon/`.
- **Imports:** usar `import img from './caminho.png'` (Vite processa e hasheia). Nunca string literal.
- **Characters:** imagens referenciadas via `/assets/images/characters/` nos JSONs.
- **Webtoon pages:** em `public/webtoon/` para URLs diretas no leitor.

### Livro
- Capítulos em markdown em `src/data/livro/{lang}/`.
- `import.meta.glob('../data/livro/pt/*.md', { query: '?raw' })` para lazy loading.
- Cada capítulo vira chunk separado no build.
- Controle de acesso via `publicado: true/false` em `livro-index.json`.

### Modo Imersivo (ReaderContext)
- `ReaderContext` provider em `main.jsx` (engloba toda a app).
- `readerMode` ativado em `WebtoonEpisodio` e `LivroCapitulo` via `useEffect` com cleanup.
- `App.jsx` passa `hidden={readerMode}` para `<TrialBanner>` e `<Navbar>`, que retornam `null` quando hidden.

### Camadas de z-index
```
z-index 200 — CookieBanner
z-index 150 — NotificationBalloon
z-index 100 — ScrollToTop
z-index 1000 — Navbar
z-index 998  — TrialBanner
z-index 50   — MusicSection dropdown
z-index 10   — BookCard, CharacterCard hover (scale)
```

### Scroll Reveal
- Hook `useScrollReveal` com IntersectionObserver (threshold 0.15).
- Classes CSS: `.reveal` (fade + translateY), `.reveal-left` (translateX), `.reveal-delay-1/2/3`.
- Aplicado em todas as seções da Home exceto HeroSlideshow.

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
O GitHub Pages não tem servidor backend, então rotas como `/personagens` retornam 404. A solução usa dois scripts:

1. **`public/404.html`** — Extrai o path original, remove o prefixo do repositório (`/illusionfight-site`) e redireciona para `/?/{path}`.

2. **`index.html`** (script no `<head>`) — Detecta query string começando com `/` e restaura a URL limpa via `history.replaceState`.

**Fluxo:** `/personagens` → 404 → `404.html` redireciona para `/?/personagens` → `index.html` restaura para `/personagens` → React Router renderiza.
