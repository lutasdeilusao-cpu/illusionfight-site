# ILLUSIONFIGHT.COM — SITE MAP

*Última atualização: 2026-06-03*  
*Versão: 1.39*

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
| `/extras/ldi` | LDILobby | `src/pages/LDI/Lobby.jsx` | ✅ | Lendas do LDI — lobby (hub do RPG narrativo) |
| `/extras/ldi/create` | LDICreate | `src/pages/LDI/Create.jsx` | ✅ | NeoGuide — criação de ficha disfarçada de onboarding |
| `/extras/ldi/game` | LDIGame | `src/pages/LDI/Game.jsx` | ✅ | Tela principal de jogo (cena narrativa + typewriter) |
| `/extras/ldi/combat` | LDICombat | `src/pages/LDI/Combat.jsx` | ✅ | Tela de combate 3D&T com 3 modos |
| `/extras/ldi/sheet` | LDISheet | `src/pages/LDI/Sheet.jsx` | ✅ | Ficha do personagem (consulta) |
| `/extras/ldi/clues` | LDIClues | `src/pages/LDI/Clues.jsx` | ✅ | Caderno de pistas |
| `/extras/ldi/end` | LDIEnd | `src/pages/LDI/End.jsx` | ✅ | Tela de fim de jogo |

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
- ✅ **Fix: deckOponente recarrega quando jogador2 entra** — O `useEffect` de carregamento do `deckOponente` tinha dependências `[salaId, user]` — para o J1, `sala.jogador2_id` é `null` no mount, então `opId` ficava `null` e o effect saía sem carregar nada. Adicionada dependência `sala?.jogador2_id` para que o effect re-dispare quando J2 entrar na sala e o Realtime atualizar o estado.
- ✅ **Fix: remove todos console.log de debug do MP** — 19 `console.log` removidos de `TopTrumpsMP.jsx` e 14 de `useTopTrumpsMP.js`. Mantidos apenas `console.error` para erros reais. A limpeza inclui logs de diagnóstico de fluxo (`registrarMovimento`, `resolverRodada`, `deckOponente`, `jogarAtributo`, `subscribeToSala`, `subscribeToMovimentos`, `escolherPPT`, `finalizarPPT`, `entrarFilaPublica`, render turno) e remoção dos callbacks de status dos subscriptions Realtime. Bundle hash: `index-zp3AcZfn.js`. Commit: `bd64629`.
- ✅ **Fix: travamento na terceira rodada** — `setEhMinhaVez` movido para antes de `setFase('jogando')` em `seguirParaProximaRodada`. Bundle hash: `index-M5tbNxZr.js`. Commit: `8f129e6`.
- ✅ **Fix: logs de diagnóstico restaurados** — 5 logs específicos reinseridos: deckOponente carregado, jogarAtributo, resolverRodada chamada, resolverRodada movimentos, movimento recebido. MP_VERSION 1.0.0 adicionado no topo. Bundle hash: `index-BxqKa6yZ.js`. Commit: `40d15f6`.
- ✅ **Fix: logs revelação e próxima rodada** — console.log em iniciarRevelacao e seguirParaProximaRodada. MP_VERSION 1.0.1. Bundle hash: `index-DUzx_M5b.js`. Commit: `39277d6`.
- ✅ **Fix: proteção faseRef no subscribeToSala** — condição alterada para evitar sobrescrita de fase 'revelacao' pelo Realtime. MP_VERSION 1.0.2. Bundle hash: `index-B6AHJyvm.js`. Commit: `257972d`.
- ✅ **Fix: proximoJogador alterna sempre** — lógica de vencedor da rodada decide atributo, mas não quem joga. Alternância pura entre J1 e J2. MP_VERSION 1.0.3. Bundle hash: `index-C9U7imv8.js`. Commit: `2b997bc`.
- ✅ **Fix: carta apostada transferida** — `encerrarSala` agora recebe `cartaVencedor` e `cartaPerdedor` reais da sala. MP_VERSION 1.0.4. Bundle hash: `index-DO9EDMmw.js`. Commit: `8ad4eb8`.
- ✅ **Fix: modal aviso modo apostado** — overlay com aviso de desconexão antes de confirmar aposta. MP_VERSION 1.0.5. Bundle hash: `index-czPj4aNH.js`. Commit: `00ad568`.
- ✅ **Fix: try/catch em resolverRodada** — função inteira encapsulada em try/catch. MP_VERSION 1.0.6. Bundle hash: `index-C0O79tou.js`. Commit: `c5ad50d`.
- ✅ **Fix: heartbeat + watchdog + beforeunload** — ping a cada 15s, watchdog 20s verifica oponente, beforeunload chama RPC encerrar_por_desconexao. MP_VERSION 1.0.7. Bundle hash: `index-D3DgyKUL.js`. Commit: `902b984`.
- ✅ **Fix: ranked só para assinantes** — `atualizarMPStats` só executa se `perfil.tier === 'elite' || 'primordial'`. Modo apostado desabilitado no Lobby com badge ELITE+ para free users. MP_VERSION 1.0.8. Bundle hash: `index-ww4CikKT.js`. Commit: `9022570`.

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

---

## 10. LENDAS DO LDI — RPG Narrativo

**Tipo:** Jogo interativo (livro-jogo digital)  
**Status:** ✅ Arco 1 implementado  
**Acesso:** FREE  
**Stack:** React 19 · Zustand · Framer Motion · Supabase  
**Versão atual:** `1.0.60` (console: `[LDI] versão carregada: 1.0.60`)  
**Rota:** `/extras/ldi/*`

---

## 11. JACK DREAM BEER — Idle Noir (v2.1.0)

**Tipo:** Idle game narrativo com dungeons automáticas  
**Status:** ✅ v2.1.0 — 3 cidades, 11 dungeons, 28 itens, 10 NPCs, 3 sistemas  
**Acesso:** FREE (requer login)  
**Stack:** React 19 · Zustand · Framer Motion · Supabase  
**Versão atual:** `2.1.0` (console: `[JACK] versão carregada: 2.1.0`)  
**Rota:** `/extras/jackcandy`
**GDD completo:** `docs/JACK_BEER_GDD.md`

### Mecânicas Implementadas
- ✅ Main Menu com 3 save slots (F5 volta ao menu)
- ✅ Cervejas acumulam automaticamente (+1/s + passivos de itens)
- ✅ 3 moedas: 🍺 cervejas, 💵 notas, 💎 fragmentos
- ✅ Pajé aparece com 100 cervejas → vende Bengala Steampunk
- ✅ Fase Intro → Mundo (após comprar bengala)
- ✅ HP com regen automática (1 a cada 10s, pausa em dungeon)
- ✅ 3 cidades: Marelia, Auranis, Karnazar (desbloqueio progressivo)
- ✅ 11 dungeons com 3 mecânicas: combate, stealth, fuga
- ✅ 10 NPCs com lojas, missões e aliados
- ✅ 28 itens em 5 categorias (arma, armadura, acessório, consumível, upgrade)
- ✅ Inventário com equip slots, swap, desequipar, abas
- ✅ Lojas com balão de saudação, ícones, abas de categoria
- ✅ Sistema Dia/Noite com cooldown 30s (afeta dungeons e diálogos)
- ✅ Sistema Primordial: medidor 0-10, dobra dano ao encher
- ✅ Sistema de Aliados: Kim/Nina/Shuntaro para dungeons
- ✅ Professor Máquina: dicas contextuais após idle + cards glow
- ✅ StatusBar com HP bar CSS, recursos, navegação MND/INV/DUN, 🌙/☀️, 🔥, SAVE, RST
- ✅ Monólogos narrativos (55 frases) em balão fixo no rodapé
- ✅ Chuva de caracteres no fundo (efeito noir)
- ✅ Título typewriter "jack dream beer."
- ✅ Avatar do Jack em círculo carmesim pulsante
- ✅ Auto-save localStorage por slot a cada 30s
- ✅ Save cloud no Supabase (tabela `jack_saves`)
- ✅ Migração automática de saves v1 (jack_candy_save) para v2
- ✅ LoginGate — requer conta no site
- ✅ Modo imersivo (sem navbar/footer)

### Estrutura de Arquivos (v2.1.0)
```
src/pages/JackCandy/
├── JackCandy.jsx                   # Container: MainMenu gate, fase routing, intervals, auto-unlock flags
├── JackCandy.css                   # 1140 linhas estilos noir
├── store/
│   └── useJackStore.js             # Zustand: 3 recursos, equipamento, dungeons, Primordial, dia/noite, aliado, cloud/local save
├── data/
│   ├── flags.js                    # 30 flags narrativas
│   ├── cidades.js                  # 3 cidades + 22 locais + sistema de navegação
│   ├── npcs.js                     # 10 NPCs (Pajé, Kim, Nina, Osvaldo, Lara, Karim, Operativo, Viran, Tira, Shuntaro)
│   ├── itens.js                    # 28 itens em 3 moedas
│   ├── dungeons.js                 # 11 dungeons com 3 mecânicas
│   └── monologues.js               # 55 monólogos narrativos
├── screens/
│   ├── MainMenu.jsx                # 3 save slots: novo jogo, continuar, deletar
│   ├── Intro.jsx                   # Typewriter + Pajé + compra da bengala
│   ├── Vila.jsx                    # Hub multi-cidade: cards, navegação, glow no próximo objetivo
│   ├── Interior.jsx                # Loja: balão NPC, abas, ícones, missões
│   ├── Inventario.jsx              # Equip slots com swap, dropdown, abas
│   ├── Dungeon.jsx                 # Combate auto + stealth + fuga + Primordial + aliados
│   └── DungeonSelect.jsx           # Grid de dungeons com filtro progressivo
└── components/
    ├── StatusBar.jsx               # HP bar CSS, recursos, MND/INV/DUN, 🌙/☀️, 🔥, SAVE, RST
    ├── DicaToast.jsx               # Professor Máquina: dicas pós-idle com 👓
    ├── Monologue.jsx               # Balão de monólogo fixo no rodapé
    └── CombatLog.jsx               # (legado)
```

### Fluxo de Progressão
1. **Main Menu** → escolhe slot → Intro
2. **Intro** → 100🍺 → comprar Bengala → Marelia
3. **Marelia** → Anexo (tutorial) → Ônibus → Rua → desbloqueia Kim/Nina/Osvaldo/Lara
4. **Marelia** → Risca a Faca + Ônibus Noturno + Terminal 3x
5. **Desbloqueio Auranis** → Nv 8 + Terminal + dungeons
6. **Auranis** → Porto Velho → Karim → Mercado Negro → Doca → Torre Kronos
7. **Desbloqueio Karnazar** → Nv 15 + Kronos + Doca
8. **Karnazar** → Viran → Rua Branca → Porto Seco → O Escuro → Tira → Ilha Privada (Kronos final)
### Rotas internas do jogo
| Rota | Descrição |
|------|-----------|
| `/extras/ldi` | Lobby — título animado, cards redesenhados, modal Nova Ficha, manual drawer |
| `/extras/ldi/create` | NeoGuide (guiado) ou Ficha Completa (vantagens, desvantagens, perícias, especializações) |
| `/extras/ldi/game` | Tela principal — cenas narrativas com typewriter |
| `/extras/ldi/combat` | Sistema de combate 3D&T com 3 modos |
| `/extras/ldi/sheet` | Ficha do personagem — consulta |
| `/extras/ldi/clues` | Caderno de pistas com conexões automáticas |
| `/extras/ldi/end` | Tela de fim de jogo com retrospecto |

### Estrutura de arquivos
```
src/pages/LDI/
├── Lobby.jsx / LDI.css          # Lobby (título animado, cards badges, modal, manual) + estilos globais
├── Create.jsx                    # NeoGuide guiado + Ficha Completa (vantagens, desvantagens, perks, spec)
├── Game.jsx                      # Tela principal de cena
├── Combat.jsx                    # Tela de combate
├── Sheet.jsx                     # Ficha do personagem
├── Clues.jsx                     # Caderno de pistas
├── End.jsx                       # Tela de fim de jogo
├── hooks/                        # Integração Supabase
│   └── useLDIStorage.js          # CRUD: saveSheet, saveGameSave, loadSheets, loadFullSheet, loadActiveSave
├── engine/                       # Lógica pura (sem React)
│   ├── dice.js                   # Rolagem de dados (d6, testAttribute)
│   ├── combat.js                 # Cálculos 3D&T (FA, FD, dano, status)
│   ├── flags.js                  # Sistema de flags narrativas
│   ├── scenes.js                 # Carregamento e filtragem de cenas
│   └── character.js              # PV, PM, XP, Perto da Morte
├── store/                        # Estado global (Zustand)
│   ├── useGameStore.js           # Save, sheet, cena, ações, saveToCloud, loadFromCloud
│   └── useCombatStore.js         # Estado de combate
├── data/
│   ├── scenes/act1.json          # Cenas do Ato I (1.1 → 2.1)
│   ├── enemies/enemies.json      # Inimigos (6 fichas)
│   ├── characterData.js          # Vantagens, Desvantagens, Perícias, Especializações, Tooltips
│   ├── manualData.js             # Seções do Manual do Jogo
│   └── powersData.js             # 42 poderes em 7 elementais
└── components/                   # Componentes React
    ├── Typewriter.jsx            # Efeito de digitação com skip
    ├── SceneView.jsx             # Container de cena + transição
    ├── ChoiceList.jsx            # Escolhas com stagger + bloqueio
    ├── CombatView.jsx            # Grid de combate 3 colunas
    ├── DiceRoll.jsx              # Dado animado + onomatopeias
    ├── CharacterSheetView.jsx    # Ficha visual com barras
    ├── ClueBook.jsx              # Caderno de pistas
    ├── PuzzleSlidingTiles.jsx    # Puzzle 3×3 / 4×4
    ├── PuzzleStealthGrid.jsx     # Puzzle stealth com câmeras
    ├── PuzzleDecoder.jsx         # Puzzle de frequência
    └── ManualDrawer.jsx          # Drawer lateral do Manual do Jogo
```

### Supabase — Tabelas criadas
| Tabela | Descrição |
|--------|-----------|
| `character_sheets` | Fichas dos personagens — persistem entre runs |
| `game_saves` | Estado de cada run — vinculado à ficha |

**Migration:** `supabase/migrations/003_lendas_ldi.sql`  
**RLS:** `auth.uid() = user_id` (mesmo padrão dos outros jogos)  

### Cloud Save — Fluxo
- **Usuário logado:** save automático no Supabase após criação de ficha, cada escolha, fim de combate e fim de jogo
- **Visitante:** joga sem persistência (sessão apenas)
- **Lobby:** lista fichas salvas do usuário logado com botão CONTINUAR
- **Funções:** `saveToCloud(userId)`, `loadFromCloud(userId, sheetId)` no useGameStore
- **Hook:** `useLDIStorage.js` — CRUD puro nas tabelas `character_sheets` e `game_saves` 

### Sistemas implementados
- Engine de combate 3D&T (dice.js · combat.js · character.js)
- Sistema de flags e cenas em JSON
- 3 puzzles: Sliding Tiles · Stealth Grid · Decoder
- Efeitos visuais: typewriter · onomatopeias · flash de dano · dado animado
- Auto-save no Supabase por transição de cena (usuário logado)
- Transições de cena com split VHS / tela preta
- Manual do Jogo (drawer lateral) com 9 seções explicativas
- Sistema de criação completa: Vantagens (custo), Desvantagens (ganho), Perícias, Especializações
- Tooltips de atributos explicando função e modo de combate
- Seleção de até 4 poderes elementais antes do combate (42 poderes em 7 elementais)
- Título animado typewriter + glitch no Lobby
- Cards de ficha redesenhados com badges de atributos, arma, elemental, arco
- Sistema de personagem por prefixo `[NOME]` no texto → cor, fonte e bg sutil por personagem
- F5 no jogo redireciona pro Lobby em vez de recriar ficha

### Bugfixes aplicados
- ✅ **NeoGuide repetindo (CRÍTICO)** — Create.jsx setava `current_scene_id: '1.1'` (cena NeoGuide no jogo). Corrigido para `'1.2'`, pulando as cenas 1.1→1.1d já respondidas no formulário. Adicionado `useEffect` guard que redireciona ao jogo se ficha já existe. `LDI_VERSION 1.0.1`. Commit: `2e5e77a`.
- ✅ **Texto no topo (ALTO)** — `.ldi-scene` sem `justify-content: center`. Corrigido com `justify-content: center` + padding vertical + choices fixas no bottom com `position: fixed`. `LDI_VERSION 1.0.1`. Commit: `2e5e77a`.
- ✅ **Jogo trava após perguntas (CRÍTICO)** — `loadScene` retornava `null` silenciosamente se sceneId inexistente. Corrigido com fallback automático pra cena `1.2`, cache persistente e logs detalhados no console. `LDI_VERSION 1.0.1`. Commit: `2e5e77a`.
- ✅ **1.3-mafama com next_scene:null** — choices A e B apontavam para `null`, causando retorno forçado para cena 1.2 via fallback. Corrigido para `"next_scene": "1.4"`, avançando para o Dia 2. `LDI_VERSION 1.0.5`. Commit: `TBD`.
- ✅ **Progressão do Dia 1** — cena 1.3 não oferecia saída para o Dia 2. Adicionada choice G com label "Já explorei o suficiente — descansar e esperar o Dia 2" que leva a `1.4`. `LDI_VERSION 1.0.5`. Commit: `TBD`.

### Changelog — v1.0.24 (LOBBY UI + TASK C)
- ✅ **Título animado** — "LENDAS DO LDI" typewriter + glitch + rewrite em loop
- ✅ **Cards de ficha redesenhados** — badges de atributos (F:4 H:2), ícone de arma, cor elemental, arco. Botão CONTINUAR em teal
- ✅ **Modal Nova Ficha** — opção A (guiada/NeoGuide) vs opção B (construir do zero)
- ✅ **Manual do Jogo** — drawer lateral com 9 seções de regras. Acessível via Lobby, Game (HUD) e Combat
- ✅ **Create.jsx — Ficha Completa** — nova aba com vantagens (custo), desvantagens (ganho), perícias, especializações, tooltips de atributo
- ✅ **Sistema de pontos** — 10 base + ganhos de desvantagens − custos de vantagens/perícias
- ✅ **Seleção de Poderes** — tela pré-combate com até 4 poderes baseados no elemental da ficha (42 poderes em 7 elementais)
- ✅ **Arquivos de dados** — `characterData.js`, `manualData.js`, `powersData.js`
- `LDI_VERSION 1.0.24`. Commit: `d95eb44`

### Changelog — v1.0.25 to v1.0.26 (Críticos + Visual/UX)
- ✅ **readerMode debug** — console.log em Game.jsx e Combat.jsx confirmam setReaderMode(true/false)
- ✅ **Validação de criação** — botão ENTRAR NO LDI desabilitado até pontos restantes === 0. Mensagem contextual: "Distribua todos os pontos" / "Você ultrapassou o limite"
- ✅ **Título Lobby com Share Tech Mono** + glitch mantido
- ✅ **Texto introdução** — font-size 1.1rem, max-width 500px, cor #E0E0E0, line-height 1.8
- ✅ **Log WhatsApp** — bolhas: player à direita (teal escuro), inimigo à esquerda (vermelho escuro), provocação (âmbar itálico), sistema (centro azul)
- ✅ **Pausa dramática** — overlay "=== VEZ DO INIMIGO ===" por 1.5s com blink antes do ataque inimigo
- ✅ **Perto da Morte** — tela inteira pulse-red 0.5s + badge piscando no card do jogador (playerPv ≤ R)
- ✅ **Modo Poder** — exibe lista de poderes preparados como botões (nome, custo PM). Substitui botão ATACAR no modo power
- `LDI_VERSION 1.0.26`. Commit: `b06ca15`

### Changelog — v1.0.27 (Diálogos + XP + Level Up + Destaque)
- ✅ **Diálogos com identidade** — `PERSONAGEM_STYLE` map em Typewriter.jsx: NeoGuide (teal/Share Tech Mono), Kaeda (red/Rajdhani), Voz (purple/JetBrains), StormByte_91 (orange/Share Tech Mono), sistema (green/JetBrains). Detecta `"Nome:"` ou `"Nome disse"` no início do parágrafo
- ✅ **XP recalibrado** — 10 XP por vitória (antes 50). Threshold único: 100 XP para level up
- ✅ **Level Up corrigido** — contador de 1 ponto, + chama updateSheet e zera contador, CONFIRMAR só habilita quando 0 pontos, mostra valor antigo → novo (3 → 4), saveToCloud no confirmar
- ✅ **Destaque em cenas** — `.ldi-scene--destaque` com borda teal pulsante, título maior em teal, fundo sutil. Aplicado em `1.3d-pos` e `2.1d` no act1.json
- `LDI_VERSION 1.0.27`. Commit: `2174e05`

### Changelog — v1.0.28 (Cor título teal/ciano)
- ✅ **Título "LENDAS DO LDI"** — cor alterada para teal #00B4D8 (antes vermelho). Glitch agora usa teal + âmbar (#F5A623) em vez de vermelho
- `LDI_VERSION 1.0.28`. Commit: `856f77f`

### Changelog — v1.0.30 (Fix detecção personagem por sceneId)
- ✅ **detectPersonagem removido** — textos do act1.json não têm prefixo `NomePersonagem:`, então a detecção por regex nunca funcionava. Substituído por mapeamento `CENA_PERSONAGEM[sceneId]`
- ✅ **Cenas mapeadas**: `1.1`–`1.1d`: NeoGuide, `2.1`–`2.1d`: Kaeda
- ✅ **Estilo aplicado apenas em falas** — `isFala(para)` determina se recebe cor/fonte do personagem. Narrativa sem estilo especial
- ✅ **sceneId propagado** — SceneView.jsx passa `sceneId={scene.id}` para Typewriter
- `LDI_VERSION 1.0.30`. Commit: `5b9ce9c`

### Changelog — v1.0.31 to v1.0.33 (sceneId passado + CSS sobrescrita + CSS custom properties)
- ✅ **v1.0.31** — `sceneId={scene.id}` já estava presente em SceneView.jsx. Bump de versão
- ✅ **v1.0.32** — Removido `color: #00B4D8` de `.ldi-text-fala` que sobrescrevia o inline style do React
- ✅ **v1.0.33** — Trocado inline style (`color`/`fontFamily`) para CSS custom properties (`--personagem-cor`, `--personagem-fonte`). CSS usa `var(--personagem-cor, #00B4D8)` e `var(--personagem-fonte, 'Share Tech Mono', monospace)` com fallback. JS só injeta os valores das variáveis
- `LDI_VERSION 1.0.33`. Commit: `e4d3970`

### Changelog — v1.0.34 (Log debug sceneId)
- ✅ **Log temporário** — `console.log('[TW] sceneId recebido:', ...)` no Typewriter.jsx para diagnosticar por que o personagemId vinha nulo
- `LDI_VERSION 1.0.34`. Commit: `1ecc890`

### Changelog — v1.0.35 (Sistema de personagem por prefixo `[NOME]`)
- ✅ **CENA_PERSONAGEM removido** — substituído por `detectarPrefixo()` que procura `[NOME]` no início do texto
- ✅ **Typewriter.jsx** — exibe `textoLimpo` (sem prefixo), injeta `--personagem-cor` e `--personagem-fonte` apenas se prefixo encontrado
- ✅ **PERSONAGEM_STYLE** — chaves em uppercase: NEOGULDE, KAEDA, VOZ, STORMBYTE, SISTEMA. Font-family completas
- ✅ **act1.json** — adicionados prefixos: `[NEOGULDE]` nas falas da NeoGuide, `[KAEDA]` nas falas da Kaeda, `[SISTEMA]` em mensagens de terminal, `[STORMBYTE]` nas falas do StormByte
- ✅ **skip function** — ao pular digitação, exibe todos os textos sem prefixo
- ✅ **Log [TW] removido** — debug temporário removido
- `LDI_VERSION 1.0.35`. Commit: `fc7170b`

### Changelog — v1.0.36 a v1.0.42 (Fontes por personagem — o debug)
- ✅ **v1.0.36** — Tentativa de fontFamily inline direto no style (não funcionou, conflito com CSS)
- ✅ **v1.0.37** — Fonte via classes CSS específicas (`.ldi-text-fala--kaeda`) com maior especificidade
- ✅ **v1.0.38** — Log `[TW] prefixo detectado` debug (só no primeiro parágrafo — bug)
- ✅ **v1.0.39** — Log corrigido: `if (personagem)` em vez de `if (i === 0)` 
- ✅ **v1.0.40** — `font-family` removido de `.ldi-text-fala` base para evitar conflito com classes específicas
- ✅ **v1.0.41** — Volta ao inline fontFamily direto (removidas classes CSS), mas **sem quotes** nos nomes compostos — `JetBrains Mono` sem aspas = browser não encontrava a fonte
- ✅ **v1.0.42** — **BUG REAL ENCONTRADO**: nomes de fonte com espaço (JetBrains Mono, Share Tech Mono) precisam de quotes! `fonte: "'JetBrains Mono', monospace"` → `font-family: 'JetBrains Mono', monospace` válido
- `LDI_VERSION 1.0.42`. Commit: `73f20f3`

### Changelog — v1.0.43 (Fontes definitivas por personagem)
- ✅ **NEOGULDE** → Arial, Helvetica, sans-serif (clean, tech)
- ✅ **KAEDA** → Georgia, Times New Roman, serif (clássico, sério)
- ✅ **VOZ** → Trebuchet MS, Lucida Grande, sans-serif (largo, distinto)
- ✅ **STORMBYTE** → Courier New, Courier, monospace (digital/máquina)
- ✅ **SISTEMA** → Impact, Haettenschweiler, Arial Black (pesado, dramático)
- Todas são fontes nativas do sistema (sem dependência de Google Fonts)
- `LDI_VERSION 1.0.43`. Commit: `ee63a56`

### Changelog — v1.0.44 a v1.0.46 (BG sutil + F5 redirect)
- ✅ **v1.0.44** — `--personagem-bg` com rgba 6% opacidade + `border-radius: 0 4px 4px 0` nas falas
- ✅ **v1.0.45** — F5 no Game.jsx redireciona pro Lobby (`/extras/ldi`) em vez da Create
- ✅ **v1.0.46** — BG de personagem aumentado pra 12% opacidade (mais visível no fundo escuro)
- `LDI_VERSION 1.0.46`. Commit: `c39b537`

### Changelog — v1.0.47 a v1.0.50 (SITE_MAP + Fontes + Expansão)
- ✅ **v1.0.47** — SITE_MAP atualizado com histórico completo
- ✅ **v1.0.48** — Fonte Orbitron + glitch vinho + sombra vinho no título do Lobby
- ✅ **v1.0.49** — Fonte Bring Race (custom) no título, via @font-face
- ✅ **v1.0.50** — act2.json (Ato II completo), scenes.js multi-act, 3 novos inimigos, economia expandida, special routing fork/act2, docs PROPOSTA_EXPANSÃO + FLUXOGRAMA
- `LDI_VERSION 1.0.50`. Commit: `TBD`

### Efeitos Visuais (Adendo UI/UX)
- [x] Typewriter com skip por Enter/Espaço/clique
- [x] Choices com stagger de entrada (80ms cada)
- [x] Flash vermelho em dano recebido
- [x] Vinheta Perto da Morte pulsando
- [x] Onomatopeias de combate (POW!, SLASH!, BOOM!, CRITICAL!!)
- [x] Dado com efeito slot machine (400ms)
- [x] Barras de PV/PM animadas com gradiente dinâmico
- [x] Log de combate com scroll automático
- [x] Tela de Game Over dramática (K.O.!! + retrospecto)

### Inimigos — Arco 1
| ID | Nome | Dificuldade | Notas |
|----|------|-------------|-------|
| stormbyte_91 | StormByte_91 | easy | Tutorial de combate |
| kaeda | Kaeda | medium | Primeiro contato |
| ghostpulse | GhostPulse | medium | Ataque elemental |
| ironveil | IronVeil | hard | Tanque |
| null_entity_encounter1 | NULL_ENTITY (1) | medium | Primeiro encontro |
| null_entity_encounter2 | NULL_ENTITY (2) | hard | Segundo encontro |
| null_entity_final | NULL_ENTITY (Final) | very_hard | Chefe final |

### Cenas — Ato I
| ID | Título |
|----|--------|
| 1.1 → 1.1d | NeoGuide (criação disfarçada) |
| 1.2 | Desconexão |
| 1.3 | Primeiro Dia — Praça Central (7 opções) |
| 1.3a–f | Sub-cenas da Praça |
| 1.3-mafama | Assombro dos Dados |
| 1.4 | Dia 2 — Rotina |
| 1.4a–c | Sub-cenas do Dia 2 |
| 1.5 | Dia 3 — O Prazo |
| 1.5a | Missão Oficial |
| 2.1 → 2.1d | O Contato (Kaeda) |
| end_act1 | Fim do Ato I |

### Dependências adicionadas
| Pacote | Versão | Motivo |
|--------|--------|--------|
| framer-motion | ^12.x | Animações e transições |
| zustand | ^5.x | Estado global |

### Observações
- Lógica 100% client-side — Supabase só persiste estado
- Paleta alinhada ao illusionfight-site (+ vars LDI específicas)
- RLS aplicado seguindo padrão dos outros jogos
- Fonte Share Tech Mono para narrativa · Bangers para onomatopeias
- Visitante joga sem save na nuvem; login necessário para persistência

---

## 11. NOTAS TÉCNICAS

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
