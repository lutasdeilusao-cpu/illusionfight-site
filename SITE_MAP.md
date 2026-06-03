# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-03*
*Versão: 1.32*

> **⚠️ Este documento deve ser mantido atualizado a cada nova task concluída.**

---

## 1. ESTRUTURA DE PASTAS

```
/
├── index.html                          # Entry point HTML + SEO/OG tags + GA + SPA redirect script
├── package.json                        # Dependências e scripts (inclui predeploy/deploy)
├── vite.config.js                      # Configuração Vite (base: /illusionfight-site/)
├── SITE_MAP.md                         # Este arquivo
├── PREMIUM_AUDIT.md                    # Auditoria de conteúdo premium
├── .gitignore                          # Node, dist, .env, Retcon.md
├── public/
│   ├── favicon.svg                     # Favicon LDI
│   ├── og-image.jpg                    # Open Graph preview (1200×630)
│   ├── 404.html                        # Redirect SPA para GitHub Pages
│   ├── sitemap.xml                     # Sitemap 8 URLs para crawlers
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
    ├── components/
    │   ├── SearchModal/                # Modal de busca global
    │   └── ...                         # 19 componentes + SearchModal
    ├── config/
    │   ├── site.js                     # SITE_NAME, SITE_NAME_PT, DOMAIN
    │   └── trial.js                    # TRIAL_ACTIVE — true libera conteúdo premium
    ├── context/
    │   ├── LanguageContext.jsx          # Provider de i18n: locale, t(), changeLocale()
    │   └── ReaderContext.jsx           # Estado global readerMode — esconde Navbar e TrialBanner nos leitores
    ├── data/                           # 11 arquivos JSON
    ├── hooks/                          # 8 hooks customizados
    ├── i18n/
    │   ├── pt.json                     # Traduções PT
    │   ├── en.json                     # Traduções EN
    │   ├── es.json                     # Traduções ES
    │   └── locales.js                  # Import aggregator + LOCALE_LABELS
    ├── pages/
    │   ├── Perfil/                      # Hub com abas (Conquistas, Arena, Coleção, Conta)
    │   │   └── abas/                    # Componentes de cada aba
    │   └── ...
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
| `/mundo` | Mundo | `src/pages/Mundo.jsx` | ✅ | Lore completo: Bravara, LDI, Xakaxi, Timeline, Glossário, Personagens |
| `/extras` | Extras | `src/pages/Extras.jsx` | ✅ | Hub com cards para Quiz SDR, Super Trunfo e Curiosidades |
| `/extras/toptrumps` | TopTrumps | `src/pages/TopTrumps.jsx` | ✅ | Top Trumps — jogo de cartas colecionáveis com deck personalizado, recompensa diária e menu redesign (2 colunas, seleção de modo, barra de coleção) |
| `/extras/toptrumps/lobby` | TopTrumpsLobby | `src/pages/TopTrumpsLobby.jsx` | ✅ | Lobby multiplayer com seleção de modo (free/apostado), turnos, matchmaking (sala privada/código/fila pública) e aposta de cartas |
| `/extras/toptrumps/multiplayer` | TopTrumpsMP | `src/pages/TopTrumpsMP.jsx` | ✅ | Partida multiplayer em tempo real via Supabase Realtime — timer 30s, atributos, placar, transferência de cartas no modo apostado |
| `/leaderboard` | Leaderboard | `src/pages/Leaderboard.jsx` | ✅ | Ranking global com pódio, tabela e posição do usuário |
| `/quiz` | Quiz | `src/pages/Quiz.jsx` | ✅ | Quiz SDR interativo com 3 modos, timer, ajudas e rank |
| `/login` | Login | `src/pages/Login.jsx` | ✅ | Login com email/senha via Supabase |
| `/cadastro` | Cadastro | `src/pages/Cadastro.jsx` | ✅ | Cadastro com nome, email, telefone, senha |
| `/perfil` | Perfil | `src/pages/Perfil/Perfil.jsx` | ✅ | Hub com 4 abas navegáveis via query param: Conquistas, Arena (stats Top Trumps + posição leaderboard), Coleção (álbum de cartas com filtro), Conta (compartilhamento + configurações) |
| `/admin` | Admin | `src/pages/Admin.jsx` | ✅ | Painel de auditoria de compartilhamentos — acesso restrito ao admin |
| `/curiosidades` | Curiosidades | `src/pages/Curiosidades.jsx` | 🚧 | Dentro de /extras — lore, easter eggs e bastidores |

---

## 3. COMPONENTES

| Componente | Arquivo JSX | Arquivo CSS | Usado em | Descrição |
|---|---|---|---|---|
| TrialBanner | `TrialBanner.jsx` | `TrialBanner.css` | App (global) | Faixa âmbar fixa abaixo da navbar (TRIAL_MODE), fundo sólido ao scroll |
| Navbar | `Navbar.jsx` | `Navbar.css` | App (global) | Logo LDI, 7 links (Webtoon, Livro, Músicas, Extras, Mundo, AUTOR, APOIAR âmbar), lang switcher, drawer mobile, usuário logado (avatar + nome + sair) ou botão ENTRAR → /login |
| HeroSlideshow | `HeroSlideshow.jsx` | `HeroSlideshow.css` | Home | 4 imagens com crossfade 1.2s, Ken Burns (1.0→1.08), overlays, scanlines, HeroEffect canvas |
| HeroEffect | `HeroEffect.jsx` | `HeroEffect.css` | HeroSlideshow | Canvas com 40-60 linhas teal/âmbar caindo |
| TypewriterPhrase | `TypewriterPhrase.jsx` | `TypewriterPhrase.css` | HeroSlideshow | Frase com efeito de digitação em loop (~28s) |
| LatestEpisodes | `LatestEpisodes.jsx` | `LatestEpisodes.css` | Home | Grid 3 episódios — Ep. 00 com thumbnail real + overlay hover com frase do protagonista + badge FREE, Ep. 01/02 placeholder PREMIUM |
| CharactersRow | `CharactersRow.jsx` | `CharactersRow.css` | Home | Scroll horizontal (Kim, Jack, Nina) com fade gradient nas bordas |
| CharacterCard | `CharacterCard.jsx` | `CharacterCard.css` | CharactersRow, Personagens | Card 200×300, hover scale(1.12), overlay com bio e CTA, ranking |
| BookChaptersRow | `BookChaptersRow.jsx` | `BookChaptersRow.css` | Home | Scroll horizontal com cards de capítulos publicados, hover overlay |
| AchievementToast | `AchievementToast/AchievementToast.jsx` | `AchievementToast/AchievementToast.css` | App (global) | Toast centralizado com partículas, overlay escuro e foto do Jack |
| LoginGate | `LoginGate/LoginGate.jsx` | `LoginGate/LoginGate.css` | TopTrumps, Quiz, Leaderboard | Bloco de aviso reutilizável para conteúdo que exige login — recebe prop feature (nome da seção) e children (conteúdo logado) |
| Quiz | `Quiz.jsx` | `Quiz.css` | /quiz | Quiz SDR com 3 modos, timer 30s, ajudas universitários, rank final |
| Extras | `Extras.jsx` | `Extras.css` | /extras | Hub com 4 cards: Quiz SDR (FREE), Top Trumps LDI (FREE), Leaderboard (FREE), Curiosidades (PREMIUM) |
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
| SearchModal | `SearchModal/SearchModal.jsx` | `SearchModal/SearchModal.css` | App (global) | Modal de busca global, overlay z-index 2000, resultados agrupados por tipo, badge PREMIUM, respeita TRIAL_ACTIVE |
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
| `useTopTrumpsDB.js` | `useTopTrumpsDB.js` | TopTrumps | Funções Supabase: carregarDeck, salvarCartasDeck, registrarPartida, atualizarStats, carregarStats, migrarLocalStorageParaSupabase |
| `useTopTrumpsMP.js` | `useTopTrumpsMP.js` | TopTrumpsLobby, TopTrumpsMP | Funções de multiplayer: criarSala, entrarSalaPorCodigo, entrarFilaPublica, definirAposta, confirmarLeitura, fazerJogada, encerrarPartida, carregarTentativas, incrementarTentativa, resetarTentativas, gerarCanalSala, gerarCanalMovimentos |

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
| `mundo-pt.json` | `src/data/` | PT | Localizações, Timeline 1450→20XX, Tecnologias Xakaxi, Glossário, Ranking SDR | Mundo |
| `quiz-pt.json` | `src/data/` | PT | 85 perguntas com categorias, dificuldades, dicas (kim/jack/nina) e narrador | Quiz |
| `supertrunfo-pt.json` | `src/data/` | PT | 76 cartas com 8 atributos (rank_sdr, poder_mental, velocidade, resistencia, nivel_xama, fator_caos, energia_base, poder_explosivo) em 5 tiers (29 free, 32 elite, 4 primordial, 6 lendario, 5 sombra) | TopTrumps |
| `achievements-pt.json` | `src/data/` | PT | 14 achievements (inclui 5 novos do Top Trumps: primeira_vitoria_trumps, primeira_derrota_trumps, veterano_trumps_10, centuriao_trumps, lenda_trumps) | AchievementsContext, Perfil |
| `001_toptrumps.sql` | `supabase/migrations/` | — | Schema SQL: toptrumps_decks, toptrumps_partidas, toptrumps_stats com RLS policies | (rodar no Supabase SQL Editor) |
| `002_toptrumps_mp.sql` | `supabase/migrations/` | — | Schema SQL: toptrumps_salas, toptrumps_movimentos, toptrumps_mp_stats com RLS policies | (rodar no Supabase SQL Editor) |
| `achievements-pt.json` | `src/data/` | PT | 8 achievements com triggers, ícones e tiers | AchievementsContext |
| `search-index.js` | `src/data/` | PT | Índice flat de personagens, capítulos, webtoon, músicas, lore e extras para busca global | SearchModal |

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
| `site.js` | `src/config/` | SITE_NAME, SITE_NAME_PT, DOMAIN |
| `trial.js` | `src/config/` | TRIAL_ACTIVE — true libera todo conteúdo, false ativa paywall |
| `supabase.js` | `src/lib/` | Cliente Supabase com URL e anon key |
| `AuthContext.jsx` | `src/context/` | Provider global de autenticação (user, perfil, login, logout) |
| `AchievementsContext.jsx` | `src/context/` | Provider global de achievements (desbloquear, toast, persistência localStorage/Supabase) |
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
- ✅ **Navbar global** — Logo LDI, 6 links (Webtoon, Livro, Músicas, Mundo, AUTOR, APOIAR âmbar), lang switcher (PT/ES/EN), drawer mobile, SocialBar, botão ENTRAR, background ao scroll
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
- ✅ **Página /mundo** — Hero, Bravara + localizações, Timeline 1450→20XX, LDI + SDR, Xakaxi + tecnologias, Glossário FREE/PREMIUM, seção Personagens
- ✅ **Busca global** — Lupa na navbar (desktop + drawer mobile), modal overlay (z-index 2000), Ctrl+K / Cmd+K, indexa personagens/livro/webtoon/músicas/lore, badge PREMIUM informativo, acesso respeita TRIAL_ACTIVE
- ✅ **Trial system** — src/config/trial.js, TRIAL_ACTIVE = true/false controla acesso global a conteúdo premium. Badge sempre visível. Conteúdo liberado em trial
- ✅ **Auditoria premium** — PREMIUM_AUDIT.md na raiz, 26 itens catalogados, 4 bugs corrigidos (LivroCapitulo, BookChaptersRow, Mundo glossário, Mundo Xakaxi badge)
- ✅ **sitemap.xml** — public/sitemap.xml com 8 rotas públicas + link rel no index.html

### Home
- ✅ **Hero Slideshow** — 4 imagens com crossfade 1.2s, Ken Burns, scanlines, HeroEffect (chuva digital), Typewriter
- ✅ **Latest Episodes** — Grid 3 cards, Ep. 00 com thumbnail real + overlay hover com frase do protagonista (zoom 1.15)
- ✅ **Últimos capítulos (home)** — BookChaptersRow scroll horizontal com cards 200×300, hover overlay com tagline, setas navegação desktop
- ✅ **Personagens (home)** — CharactersRow scroll horizontal com Kim, Jack, Nina
- ✅ **Música** — 5 círculos com dropdown de 6 plataformas, capa real, hover/click responsivo
- ✅ **No Ar Agora** — 4 cards estáticos Netflix-style (YouTube, TikTok, X, Instagram), gradiente da plataforma
- ✅ **Progresso da Obra** — Timeline horizontal com 3 tracks animadas via IntersectionObserver
- ✅ **Itens do Universo** — ShopSection carrossel infinito drag/swipe com 10 produtos placeholder
- ✅ **Newsletter CTA** — Bloco "RECEBA AS NOVIDADES" com link para Substack
- ✅ **Scroll Reveal** — Animações fade+translateY em todas as seções via IntersectionObserver

### Quiz SDR
- ✅ **3 modos de jogo** — RANQUEADO (free, 10 perguntas 5+5), ELITE (premium R$10, 20 perguntas 7+7+6), PRIMORDIAL (premium R$30, 30 perguntas 10+10+10)
- ✅ **Timer** — 30s por pergunta com barra visual, fica vermelha <10s, timeout = erro automático
- ✅ **Ajudas** — Pular (2/sessão) e Gangue (1/sessão, 90% dica certa, 10% errada)
- ✅ **Rank final** — Score + bônus de velocidade → ELITE/RANQUEADO/ASPIRANTE/NOVATO/RECRUTA
- ✅ **Clique único** — Clique na alternativa confirma imediatamente, sem etapa intermediária
- ✅ **85 perguntas PT** — 4 categorias (mundo, personagem, mecanica, lore), dicas kim/jack/nina
- ✅ **Redesign entrada** — Scanlines, cards com glow por tier, badge separado no canto superior direito
- ✅ **Animações** — Flash verde no acerto, shake vermelho no erro, fade entre perguntas, contagem regressiva do rank
- ✅ **Tier reveal** — Rank conta de 2.8B até o valor real em 1.8s, tier aparece com delay de 0.6s

### Extras
- ✅ **Página hub /extras** — Cards para Quiz SDR (FREE) e Curiosidades (PREMIUM)
- ✅ **Navbar consolidada** — Link único "Extras" substitui Quiz e Curiosidades no menu

### Top Trumps LDI
- ✅ **Jogo de cartas vs IA** — 76 cartas do universo LDI, 8 atributos cada, 5 tiers (29 free, 32 elite, 4 primordial, 6 lendario, 5 sombra)
- ✅ **Seleção de turnos** — Escolha 5, 10, 15 ou 20 turnos por partida
- ✅ **Deck personalizado** — localStorage salva cartas do jogador, inicia com 5-10 conforme login
- ✅ **Recompensa diária** — Até 3 tentativas/dia, ganhe 1 carta nova por vitória (escolha entre 3 opções viradas com flip animation)
- ✅ **Álbum no perfil** — Grid completo com todas as 76 cartas, obtidas visíveis, faltantes como silhueta, badges de tier
- ✅ **Controle de acesso** — TRIAL_ACTIVE libera tudo, free tem teto de 30 cartas
- ✅ **Menu redesign** — Layout 2 colunas, cartas decorativas CSS, barra de coleção, seleção de modo (single/multiplayer) e configuração de turnos separados
- ✅ **Bugfix tentativas** — Reset automático ao mudar o dia restaura fase 'menu'
- ✅ **Migração Supabase** — Deck, partidas e stats persistidos no banco; localStorage migrado automaticamente
- ✅ **5 novos achievements** — Primeira Vitória, Aprendiz, Veterano (10), Centurião (100), Lenda (1000)
- ✅ **Histórico no perfil** — Stats (partidas/vitórias/derrotas/streak) + últimas 10 partidas com resultados
- ✅ **Multiplayer via Supabase Realtime** — Lobby com 3 etapas, matchmaking, timer 30s, IA fallback, transferência de cartas no modo apostado, stats e leaderboard separados
- ✅ **Bugfix matchmaking free mode** — Status `em_jogo` setado corretamente na entrada de J2, impedindo jogadores presos
- ✅ **Fila pública assíncrona** — UI com typewriter, glitch, dots animados, sem timeout de saída
- ✅ **Bugfix console.log** — Referência `turnos` corrigida para `turnosDesejados` em `entrarFilaPublica`
- ✅ **Bugfix salas fantasma** — Filtro `.gte('criada_em', 5min)` na query de busca de sala pública impede reaproveitamento de salas órfãs
- ✅ **Bugfix .single() → .maybeSingle()** — 3 queries em `toptrumps_mp_stats` trocadas para evitar erro 406 quando usuário ainda não tem stats
- ✅ **RPC entrar_fila_publica** — Lógica de busca/inserção de sala pública movida para uma única chamada `supabase.rpc()`, eliminando race conditions entre SELECT e INSERT
- ✅ **Timeout 2min na partida** — Se o Realtime não receber o segundo jogador em 2min, a sala é deletada e o J1 redirecionado ao lobby com mensagem âmbar
- ✅ **Mensagem âmbar no lobby** — `location.state.mensagem` exibida por 5s em destaque com borda dourada
- ✅ **PPT antes da partida** — Pedra-papel-tesoura para definir quem começa; empate repete; armazenado nos campos `carta_aposta_j1/j2` com sentinela -1
- ✅ **Logs em registrarMovimento e resolverRodada** — Console logs para depuração do fluxo multiplayer
- ✅ **Diagnóstico Realtime movimentos** — Log de status e callback no `subscribeToMovimentos` para verificar se canal recebe eventos
- ✅ **Bugfix: toptrumps_movimentos na supabase_realtime** — Diagnóstico concluiu que `subscribeToMovimentos` e transição PPT→jogando estão corretos no código; o problema é que a tabela `toptrumps_movimentos` não foi adicionada à `supabase_realtime` publication no banco
- ✅ **Bugfix: J1 preso em carregando ao J2 entrar** — No handler do `subscribeToSala`, adicionada detecção de transição `aguardando→em_jogo` com `jogador2_id` setado, forçando `setFase('ppt')` no J1 que estava esperando. Antes o J1 ficava preso em `carregando` porque o código só tratava a mudança de fase no cliente que fez a ação (J2), não no que estava ouvindo via Realtime.
- ✅ **Bugfix: resultado duplicado ("Todo mundo vence")** — `meuPapelRef.current` podia ser `null` quando `resolverRodada` era chamada via Realtime, fazendo `ganhei` sempre `false` e exibindo 'perdeu' para ambos (ou o inverso). Substituído por derivação direta `const papel = s.jogador1_id === user.id ? 'j1' : 'j2'` nos dois blocos de resolução (`movs.length >= 2` e `movs.length === 1`). Também corrigido `setCartaOponente` no bloco single-move para usar `papel` em vez de comparar apenas com `s.jogador1_id`.
- ✅ **Bugfix: alternância de turno — só um jogador escolhia a partida inteira** — `salaRef.current` mantinha `jogador_da_vez` desatualizado após `resolverRodada` porque só o banco era atualizado, não o estado local. Ao clicar "PRÓXIMA RODADA", `seguirParaProximaRodada` usava o valor velho. Adicionado `setSala(prev => ({...prev, ...}))` imediatamente após `atualizarSala` nos dois blocos (else branch), forçando o estado local com os novos `pontos_j1`, `pontos_j2`, `turno_atual` e `jogador_da_vez`.
- ✅ **Fix: carta_id_oponente no INSERT + deck determinístico** — Adicionado parâmetro `cartaIdOponente` em `registrarMovimento` e inserido no banco como `carta_id_oponente`. Decks agora são carregados em ordem de `carta_id` ASC (sem `embaralhar`), garantindo índice determinístico consistente entre os dois clientes. `resolverRodada` no branch single-move lê `mov.carta_id_oponente` diretamente, eliminando a busca no banco do deck do oponente. Adicionados `deckOponente` state + ref, usados em `jogarAtributo` e no timeout auto-move.
- ✅ **Fix: deckOponente carregado antes da primeira jogada** — O carregamento do deck do oponente estava dentro do `useEffect` de `[user, sala?.total_turnos]`, que podia atrasar se `sala?.total_turnos` demorasse a ficar disponível. Separado em um `useEffect` próprio com dependências `[salaId, user]` que busca a sala diretamente no banco e carrega `deckOponente` independentemente. Adicionado log de diagnóstico em `jogarAtributo`.

### Leaderboard
- ✅ **Página /leaderboard** — Ranking global com pódio visual (top 3), tabela (posições 4-20), abas de filtro
- ✅ **Seção "Sua posição"** — Card destacado para usuários logados, CTA para cadastro se anônimo
- ✅ **Acessível via /extras** — Card no hub de Extras, rota /leaderboard independente

### Achievement Mensal de Compartilhamento
- ✅ **Tabela share_submissions** — Supabase, 1 envio/mês/usuário, status pendente/aprovado/rejeitado
- ✅ **Seção no perfil** — Input de link, validação de URL, feedback de status
- ✅ **Painel /admin** — Lista submissões pendentes, aprova/rejeita com clique, insere achievement automaticamente
- ✅ **Achievement divulgador** — 🔥 "Divulgador da Arena", concedido pelo admin após auditoria manual
- ✅ **Policy de admin** — UPDATE em share_submissions e INSERT em user_achievements liberados

### Autenticação + Achievements
- ✅ **AuthContext** — Provider global, sessão Supabase, carregamento de perfil, listener onAuthStateChange
- ✅ **AchievementsContext** — Provider global, 8 achievements persistidos em localStorage (anônimo) ou Supabase (logado)
- ✅ **Migração automática** — Achievements do localStorage migram para Supabase ao cadastrar/logar
- ✅ **Toast de achievement** — Centralizado com overlay, partículas, foto do Jack, auto-fecha 5s
- ✅ **Páginas /login, /cadastro, /perfil** — Auth completo com validações
- ✅ **Navbar adaptativa** — Botão ENTRAR quando anônimo, avatar + nome + sair quando logado
- ✅ **Triggers** — 1min no site, cadastro, livro cap01, webtoon ep00, quiz completo, 80% score ranqueado, gangue completa
- ✅ **Deck inicial gerado no login** — `garantirDeckInicial(userId)` no AuthContext, chamado no SIGNED_IN. TopTrumps.jsx só lê o banco, nunca cria deck.
- ✅ **Fix stale closure desbloquear** — `useRef` em TopTrumps.jsx e em todos os arquivos com `.then()` assíncrono
- ✅ **Cartas do Top Trumps receberam campo id_num inteiro** — Sequencial (1-76) para persistência no Supabase como int4
- ✅ **Contador de tentativas diárias migrado do localStorage para Supabase** — Colunas `tentativas_data` + `tentativas_usadas` em `toptrumps_stats`, funções `carregarTentativas` e `incrementarTentativa` no hook

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

- ❌ **Extras / Curiosidades** — Conteúdo JSON completo para a página /curiosidades (lore, easter eggs, bastidores)
- ❌ **Músicas — player dedicado** — Player embutido, letras e contexto narrativo por faixa
- ❌ **Personagens: imagens reais** — Substituir placeholders por artwork final
- ❌ **Páginas EN/ES completas** — Capítulos do livro traduzidos
- ❌ **Logo ES** — Apenas PT e EN têm logo em imagem
- ❌ **Modo light** — Dark mode fixo, sem toggle
- ❌ **Domínio customizado** — www.illusionfight.com
- ❌ **Integração Stripe** — Links reais de pagamento
- ❌ **Quiz EN/ES** — Banco de perguntas traduzido para inglês e espanhol
- ❌ **Quiz — silhuetas dos personagens** — Substituir cards de texto da gangue por avatares visuais
- ❌ **Quiz — leaderboard** — Ranking global de pontuações
- ❌ **Top Trumps multiplayer via Supabase Realtime** — Jogar contra outros usuários em tempo real
- ❌ **Top Trumps EN/ES** — Tradução das cartas e atributos para inglês e espanhol
- ❌ **Top Trumps — imagens reais dos personagens** — Substituir placeholders (iniciais) por artwork final
- ❌ **Achievement divulgador — automação futura** — Verificação automática via API do X/YouTube em vez de auditoria manual
- ❌ **Achievements EN/ES** — Tradução dos achievements para inglês e espanhol
- ❌ **Leaderboard de achievements** — Comparação entre usuários
- ❌ **Página de perfil com avatar customizável** — Upload de foto, capa, bio

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
z-index 2000 — SearchModal overlay
z-index 1000 — Navbar
z-index 998  — TrialBanner
z-index 200  — CookieBanner
z-index 150  — NotificationBalloon
z-index 100  — ScrollToTop
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
