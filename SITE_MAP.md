# ILLUSIONFIGHT.COM — MAPA DO SITE E DO PROJETO

> Referência do estado atual do projeto para navegação humana e contexto de IA.
> Atualizado em 2026-09-03 — `SITE_VERSION` **10.209.6**.
> Histórico de tarefas, bugfixes e pendências não pertence a este documento.
> Regras de trabalho, arquivos proibidos e decisões arquiteturais: `AGENTS.md`.

## 1. Visão geral

- Site oficial: `https://illusionfight.com/`
- Repositório: `https://github.com/lutasdeilusao-cpu/illusionfight-site`
- Aplicação: SPA React hospedada no GitHub Pages, com domínio próprio e fallback de rotas.
- Stack: Vite 8, React 19, React Router 7, Zustand 5, Framer Motion 12, Supabase JS 2, React Helmet Async e React Markdown.
- Backend: Supabase para autenticação, persistência, realtime e Edge Functions; Stripe para assinaturas.
- Idiomas: português, inglês e espanhol, persistidos em `ldi-locale`.
- Estilos: CSS global e arquivos `.css` associados aos componentes; sem CSS-in-JS.
- Fontes (Google Fonts, carregadas em `index.html`): IBM Plex Sans, Rajdhani, JetBrains Mono, Share Tech Mono, Orbitron, Bebas Neue, Bangers (base); **Cinzel** + **Cormorant Garamond** + **EB Garamond** + **Fira Code** (temas dos universos em `Universo.css`). Tokens em `src/index.css` (`--font-display`, `--font-body`, `--font-mono`, `--font-title`).
- Versões: todas centralizadas em `src/config/version.js`.
- Build: `npm run build` executa Vite e depois `scripts/prerender-routes.js`; sourcemaps estão habilitados.

## 2. Entradas e composição global

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Entrada HTML, metadados, analytics, restauração da URL da SPA e a **abertura (vinheta)** — ver §2.1 |
| `src/main.jsx` | Montagem React e composição dos providers |
| `src/App.jsx` | Layout global e fonte de verdade das rotas client-side |
| `src/index.css` | Reset, variáveis e estilos globais |
| `vite.config.js` | Vite com `base: '/'` e `build.sourcemap: true` |
| `public/404.html` | Captura URLs diretas no GitHub Pages e redireciona para a SPA |
| `public/sitemap.xml` | Sitemap público para buscadores; não confundir com este documento |
| `public/_redirects` | Normalização de URLs públicas |
| `public/CNAME` | Domínio oficial |
| `public/manifest.webmanifest` | Instalação PWA e abertura fullscreen/standalone em dispositivos compatíveis |
| `public/sw.js` | Service worker: push notifications + cache de áudio da Rádio Nina (músicas/propagandas do R2, `nina-audio-v1`) |

### 2.1 Abertura (vinheta de carregamento)

Inline em `index.html`, **antes** do React — um componente montaria tarde demais. Objetivo: dar feedback visual enquanto o primeiro acesso forma o cache, sem prender o visitante.

- Exibida **só no primeiro acesso do dia** (`localStorage['ldi-intro-day'] = YYYY-MM-DD`); reload no mesmo dia nem injeta o overlay.
- Duração: **mínimo 2 s, teto absoluto 4 s**. `App.jsx` dispara `window.dispatchEvent(new Event('ldi:ready'))` ao montar; a vinheta encerra assim que recebe o evento, respeitando o mínimo. Com `prefers-reduced-motion` vira `--static` (sem keyframes, mínimo 600 ms).
- Visual: `#ldi-intro` fixo (z-index 2147483000, acima de tudo), símbolo IF (`/favicon-ldi.png`, já em cache pelo ícone da aba — zero download extra) com scale-in + glow pulsante, wordmark em `RacingGames` com varredura de luz, barra de progresso ciano→roxo de 4 s no rodapé. Texto: `LUTAS DE ILUSÃO` (pt/es) ou `ILLUSION FIGHT` (en) via `ldi-locale`.
- Som: `public/sounds/intro.mp3` (Mixkit #164, licença Mixkit, 1,9 s, mono 64 kbps, `loudnorm` + fade) tocado a `volume 0.22`. Autoplay pode ser bloqueado pelo navegador antes da 1ª interação — o `play()` rejeitado é engolido e **a entrada nunca depende do som**.
- Ao terminar, o overlay é removido do DOM (não só escondido) e `html.ldi-intro-on` (trava de scroll) é retirada.

Ordem dos providers em `src/main.jsx`:

```text
ReaderProvider
└── HelmetProvider
    └── BrowserRouter
        └── AuthProvider
            └── FichasProvider
                └── DixProvider
                    └── AchievementsProvider
                        └── EventosProvider
                            └── LanguageProvider
                                └── App
```

Componentes montados globalmente por `App.jsx`: `AnalyticsTracker`, `ScrollToTopOnNav`, `DesktopShellBar` (só runtime steam-demo), `Navbar`, `SearchModal`, `Footer`, `TrialBanner`, `ScrollToTop`, `LDINotification`, `RadioNina`, `UnifiedNotification` e `CookieBanner`. `AnalyticsTracker` registra cliques, submits e profundidade de scroll sem capturar valores digitados. A Navbar é uma faixa azul-escura de 48 px, fixa e com espaçador no fluxo, mantendo o hero abaixo dela — igual em qualquer plataforma, já que o portal é mobile only (§10.1). O hambúrguer é a única navegação; não existe barra de links de desktop. O `TrialBanner` fica no fluxo normal, depois do rodapé, e só aparece quando o visitante chega ao fim da página; o `readerMode` oculta Navbar, TrialBanner e Footer durante leitura.

## 3. Rotas atuais

`src/App.jsx` é a autoridade. Parâmetros dinâmicos aparecem com `:id`. O símbolo 🔒 indica rota envolvida por `FichaGateRoute`; o gate combina regras de autenticação, fichas e gratuidade conforme suas props.

### 3.1 Site e conteúdo

| Rota | Página | Arquivo principal |
|---|---|---|
| `/` | Home | `src/pages/site/Home/Home.jsx` |
| `/personagens` | Catálogo de personagens | `src/pages/content/Personagens.jsx` |
| `/personagens/:id` | Detalhe de personagem | `src/pages/content/PersonagemDetalhe.jsx` |
| `/historias` | Hub de histórias (todos os universos) | `src/pages/content/Historias.jsx` |
| `/historias/lutas-de-ilusao` | Índice da linha principal | `src/pages/content/Livro.jsx` |
| `/historias/lutas-de-ilusao/:id` | Leitor de capítulo | `src/pages/content/LivroCapitulo.jsx` |
| `/historias/contos` | Índice dos Contos de Ilusão | `src/pages/content/Contos.jsx` |
| `/historias/contos/:historia(/:cap)` | História e leitor de conto | `src/pages/content/ContoHistoria.jsx` / `ContoCapitulo.jsx` |
| `/historias/:slug` | Página de obra estilo Netflix (Mundo das Sombras, Mar de Cinzas) | `src/pages/content/Obra.jsx` |
| `/historias/:slug/:cap` | Leitor de capítulo de obra | `src/pages/content/ObraCapitulo.jsx` |
| `/livro` → `/historias`, `/livro/contos` → `/historias/contos`, `/livro/:id` → `/historias/lutas-de-ilusao/:id` | Redirects 301 legados | `src/App.jsx` (`LegacyLivroRedirect`) + `public/_redirects` + `public/livro/index.html` + prerender REDIRECTS |
| `/webtoon` | Índice do webtoon | `src/pages/content/Webtoon.jsx` |
| `/webtoon/:id` | Leitor de episódio | `src/pages/content/WebtoonEpisodio.jsx` |
| `/musicas` | Músicas | `src/pages/content/Musicas.jsx` |
| `/universos` | Portal dos universos (entrada) | `src/pages/content/UniversosHub/UniversosHub.jsx` |
| `/universos/lutas-de-ilusao` | Lore do universo LDI | `src/pages/content/Mundo.jsx` |
| `/universos/:universo` | Worldbuilding (Mundo das Sombras, Mar de Cinzas) | `src/pages/content/Universo.jsx` |
| `/mundo` → `/universos`, `/mundo/:universo` → `/universos/:universo` | Redirects 301 legados | `src/App.jsx` (`LegacyLivroRedirect`) + `public/_redirects` + `public/mundo/index.html` + prerender REDIRECTS |
| `/autor` | Autor | `src/pages/site/Autor.jsx` |
| `/loja` | Loja | `src/pages/site/Loja/Loja.jsx` |
| `/quiz` | Quiz | `src/pages/site/Quiz.jsx` |
| `/custos` | Custos da plataforma | `src/pages/site/Custos.jsx` |
| `/calendario` | Hub público de lançamentos (capítulos, webtoon, games, músicas e parceiros) | `src/pages/site/Calendario/Calendario.jsx` |

### 3.2 Plataforma e conta

| Rota | Página | Arquivo principal |
|---|---|---|
| `/assinar` | Planos e assinatura | `src/pages/platform/Assinar.jsx` |
| `/leaderboard` | Rankings | `src/pages/platform/Leaderboard.jsx` |
| `/login` | Login | `src/pages/platform/Login.jsx` |
| `/cadastro` | Cadastro | `src/pages/platform/Cadastro.jsx` |
| `/perfil` | Perfil, progresso, coleção e conta | `src/pages/platform/Perfil/Perfil.jsx` |
| `/admin` | Administração | `src/pages/platform/Admin.jsx` |

### 3.3 Catálogo e jogos

| Rota | Jogo/função | Arquivo principal | Acesso |
|---|---|---|---|
| `/games` | Catálogo de jogos | `src/pages/games/Games.jsx` | Público |
| `/games/toptrumps` | Top Trumps single-player | `src/pages/games/TopTrumps/TopTrumpsSP.jsx` | Público |
| `/games/toptrumps/v2` | Alias ativo do single-player | `src/pages/games/TopTrumps/TopTrumpsSP.jsx` | Público |
| `/games/toptrumps/lobby` | Redirect legado para o lobby compartilhado | `Navigate` em `src/App.jsx` | Redirect |
| `/games/multiplayer/lobby` | Lobby multiplayer compartilhado | `src/pages/games/MultiplayerLobby/MultiplayerLobby.jsx` | 🔒 |
| `/games/toptrumps/multiplayer` | Partida Top Trumps multiplayer | `src/pages/games/TopTrumps/TopTrumpsMP.jsx` | 🔒 |
| `/games/ldi` | Lobby Lendas do LDI | `src/pages/games/LDI/Lobby.jsx` | 🔒 gratuito |
| `/games/ldi/create` | Criação de personagem LDI | `src/pages/games/LDI/Create.jsx` | 🔒 gratuito |
| `/games/ldi/game` | História LDI | `src/pages/games/LDI/Game.jsx` | 🔒 gratuito |
| `/games/ldi/combat` | Combate LDI | `src/pages/games/LDI/Combat.jsx` | 🔒 gratuito |
| `/games/ldi/sheet` | Ficha LDI | `src/pages/games/LDI/Sheet.jsx` | 🔒 gratuito |
| `/games/ldi/clues` | Pistas LDI | `src/pages/games/LDI/Clues.jsx` | 🔒 gratuito |
| `/games/ldi/end` | Resultado LDI | `src/pages/games/LDI/End.jsx` | 🔒 gratuito |
| `/games/ldi/puzzle` | Puzzle LDI | `src/pages/games/LDI/PuzzlePage.jsx` | 🔒 gratuito |
| `/games/jackcandy` | Jack Dream Beer | `src/pages/games/JackCandy/JackCandy.jsx` | 🔒 |
| `/games/minigames` | Coleção MiniGames | `src/pages/games/MiniGames/MiniGames.jsx` | 🔒 gratuito |
| `/games/ldi-gangues` | LDI Gangues | `src/pages/games/Gangues/GanguesRoute.jsx` | 🔒 |
| `/games/ldi-gangues/treinamento` | Zona de Treinamento pública do LDI Gangues | `src/pages/games/Gangues/GanguesRoute.jsx` | Público |
| `/games/ldi-arena` | Redirect legado para LDI Gangues | `Navigate` em `src/App.jsx` | Redirect |
| `/games/ldi-tatics` | Arena LDI Tatics | `src/pages/games/ArenaTatics/ArenaTaticsRoute.jsx` | 🔒 |
| `/games/pesadelo` | Pesadelo Particular | `src/pages/games/PesadeloParticular/PP.jsx` | 🔒 |
| `/games/duelo` | Duelo LDI | `src/pages/games/Duelo/DueloRoute.jsx` | 🔒 |
| `/games/tamagoshi` | Tamagoshi LDI | `src/pages/games/Tamagoshi/Tamagoshi.jsx` | 🔒 gratuito |

### 3.4 Kernel Games

Os Kernel Games usam layout portrait compartilhado em `src/pages/games/KernelGames/KernelGame.css` e i18n comum em `KernelGames/_shared/`.

| Rota | Jogo | Diretório |
|---|---|---|
| `/games/kernel-panic` | Kernel Panic | `src/pages/games/KernelGames/KernelPanic/` |
| `/games/sliding-rafael` | Sliding Rafael | `src/pages/games/KernelGames/SlidingRafael/` |
| `/games/codigo-perdido` | Código Perdido | `src/pages/games/KernelGames/CodigoPerdido/` |
| `/games/maze-rafael` | Maze Rafael | `src/pages/games/KernelGames/MazeRafael/` |
| `/games/glitch-rafael` | Glitch Rafael | `src/pages/games/KernelGames/GlitchRafael/` |
| `/games/bullet-hell-rafael` | Bullet Hell Rafael | `src/pages/games/KernelGames/BulletHellRafael/` |
| `/games/stabilizer-rafael` | Stabilizer Rafael | `src/pages/games/KernelGames/StabilizerRafael/` |

### 3.5 Laboratório e fallback

| Rota | Função | Arquivo principal |
|---|---|---|
| `/prototype` | Índice de protótipos | `src/pages/lab/Prototype/Prototype.jsx` |
| `/prototype/srgrm` | Protótipo SRGRM 3v3 | `src/pages/lab/Prototype/SRGRM/SRGRM.jsx` |
| `/prototype/arenatestbed` | Arena Testbed V2 | `src/pages/lab/Prototype/ArenaTestbed/ArenaTestbed.jsx` |
| `*` | Página 404 interna | `src/pages/site/NotFound/NotFound.jsx` |

### 3.6 Arquitetura de Histórias e Universos

Reorganização de setembro/2026: `/livro` e `/mundo` (páginas únicas) viraram **dois hubs**.

- **`/historias`** (`Historias.jsx`) — hub de leitura estilo Netflix. Prateleiras: destaque da Linha Principal, seção **Lutas de Ilusão** (Linha Principal + Contos de Ilusão) e **Outros Universos** (cards das obras de `obras-index.json`). Cards em `Historias.css` (`.hub-card`).
- **Linha principal** → `/historias/lutas-de-ilusao(/:id)` — `Livro.jsx` / `LivroCapitulo.jsx` inalterados, só as rotas e os links internos mudaram.
- **Contos de Ilusão** → `/historias/contos/...` — `Contos.jsx` / `ContoHistoria.jsx` / `ContoCapitulo.jsx`.
- **Obras externas** (não-canon, universo próprio) → `/historias/:slug` (`Obra.jsx`, detalhe) e `/historias/:slug/:cap` (`ObraCapitulo.jsx`, leitor). Hoje: `mundo-das-sombras` (PT/EN/ES) e `mar-de-cinzas` (PT).
- **`/mundo`** (`MundoHub.jsx`) — seletor dos 3 universos (`universo-index.json`). `/mundo/lutas-de-ilusao` = `Mundo.jsx` (lore LDI, formato antigo). `/mundo/:universo` = `Universo.jsx`.
- **Listas internas de capítulo** (linha principal, conto, obra) usam `src/components/CapCard/` — mini-card vertical estilo "lista de episódios": miniatura + rótulo + título + resumo curto + status. Resumo por capítulo em `contos-index.json` / `obras-index.json` (`resumo_{pt,en,es}`); linha principal cai no `tagline_*`.
- **Gating de conteúdo não-lançado:** `data_publicacao` futura (`2099-01-01` nas obras) → badge "Em breve" pro público; `estaDisponivel(cap, isAdmin)` libera pra admin. Mesmo mecanismo dos contos, sem lógica de auth nova.
- **Cross-links entre histórias:** citações de eventos viram `[texto](/historias/lutas-de-ilusao/capitulo-0N)` ou `[texto](/historias/contos/NN/NN)`, renderizados client-side por `readerMdComponents` (`src/lib/mdComponents.jsx`).

## 4. Organização do código

```text
src/
├── App.jsx                 # rotas e shell global
├── main.jsx                # providers e montagem
├── assets/                 # imagens, cartas e assets processados pelo Vite
├── components/             # componentes reutilizáveis e globais
├── config/                 # site, versões, trial, fichas e lançamentos
├── context/                # estado global React Context
├── data/                   # conteúdo editorial e catálogos globais
├── hooks/                  # hooks reutilizáveis
├── i18n/                   # traduções gerais e específicas
├── lib/                    # Supabase, Stripe, áudio, cartas e notificações
└── pages/
    ├── content/            # historias (hub/obras), universo (worldbuilding), livro/contos, webtoon, mundo, músicas, personagens
    ├── games/              # catálogo e módulos independentes dos jogos
    ├── lab/                # protótipos e testbeds
    ├── platform/           # autenticação, perfil, assinatura, ranking, admin
    └── site/               # home, autor, loja, quiz, custos e 404
```

Cada jogo mantém componentes, dados, hooks/engine e store próprios dentro de seu diretório quando necessário. Stores Zustand atuais incluem Gangues, Arena Tatics, Duelo, JackCandy, LDI, Pesadelo Particular e Tamagoshi. Top Trumps concentra sua lógica em hooks e componentes próprios.

## 5. Módulos globais importantes

### 5.1 Contextos

| Arquivo | Responsabilidade |
|---|---|
| `AuthContext.jsx` | Sessão, usuário, perfil, login e logout |
| `FichasContext.jsx` | Saldo, coleta diária, consumo e regras por role |
| `DixContext.jsx` | Carteira e transações DIX |
| `AchievementsContext.jsx` | Conquistas, persistência e notificações |
| `EventosContext.jsx` | Eventos globais da plataforma |
| `LanguageContext.jsx` / `LanguageProvider.jsx` | Locale e função `t()` |
| `ReaderContext.jsx` | Modo de leitura imersivo |

### 5.2 Bibliotecas e hooks

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/supabase.js` | Cliente Supabase |
| `src/lib/stripe.js` | Checkout, cancelamento e preços |
| `src/lib/notificationManager.js` | Fila central de notificações |
| `src/lib/analytics.js` | Consent Mode, identidade pseudônima, propriedades de usuário, eventos e pageviews SPA enviados ao Google Analytics |
| `src/lib/profileProvisioning.js` | Provisionamento idempotente de `profiles` a partir do usuário autenticado e metadata |
| `src/lib/sfx.js` | Efeitos sonoros globais |
| `src/lib/topTrumpsCardImages.js` | Resolução central das artes Top Trumps |
| `src/lib/topTrumpsCardAccess.js` | Regras de acesso às cartas Top Trumps |
| `src/hooks/useFichaGate.js` | Gate reutilizável de fichas |
| `src/hooks/useLeaderboardDB.js` | Consultas do leaderboard |
| `src/hooks/usePresence.js` | Presença realtime |
| `src/hooks/useTopTrumpsMP.js` | Operações multiplayer Top Trumps |
| `src/hooks/useReadingCompletionGate.js` | Controle de conclusão de leitura |

### 5.3 Componentes reutilizáveis

- Navegação e shell: `Navbar`, `Footer`, `ScrollToTop`, `ScrollToTopOnNav`, `SearchModal`, `CookieBanner`, `TrialBanner`.
- Acesso e economia: `LoginGate`, `FichaGateRoute`, `GuestNotice`, `ModalConfirmacaoFicha`, `ModalSemFichas`.
- Notificações: `AchievementToast`, `LDINotification`, `UnifiedNotification`.
- Home/conteúdo: `src/pages/site/Home/` concentra a página, o CSS visual e os componentes exclusivos `HeroSlideshow`, `LatestEpisodes`, `BookChaptersRow`, `CharactersRow`, `MusicSection`, `NowLive` e `StoryProgress`. As vitrines consomem os catálogos oficiais para refletir novos conteúdos sem listas duplicadas.
- Histórias: `CapCard` (`src/components/CapCard/`) — mini-card vertical de capítulo (miniatura + rótulo + título + resumo + status), usado em `Livro.jsx`, `ContoHistoria.jsx` e `Obra.jsx`. Classe wrapper `.cap-list`.
- Farol (`src/components/Farol/`) — badge de peso (leve/média/pesada), canonicidade e tags de temática. Dados em `contos-index.json` / `obras-index.json` (`peso`, `canon`, `temas[]`, `selo`); labels em `pages.contos.peso_*` / `tema_*` (temas incluem `sobrenatural`, `opressao`, `horror_cosmico`, `resistencia`). Usado em `Contos.jsx` (filtro por peso/tema), `ContoHistoria.jsx`, `Livro.jsx`, `Obra.jsx` e `Historias.jsx`.
- Universo: `src/lib/mdComponents.jsx` (`readerMdComponents`) transforma links `/...` do markdown em `<Link>` do React Router — usado por todos os leitores (livro, conto, obra) para as citações cruzadas.
- Jogos/resultado: `BackToGamesBtn`, `Jokempo`, `Puzzles`, `ResultCard`, `TopTrumpsCard`.
- Mídia: `RadioNina` — barra fixa no rodapé, toca MP3 do R2 via Worker. Pasta dedicada `src/components/RadioNina/`: `RadioNina.jsx` (casca), `useRadioNina.js` (motor de áudio + fila + eventos GA), `RadioNinaPlaylist.jsx` (painel), `radio-nina.playlist.js` (Supabase CRUD), `radio-nina.config.json` (base/cores/aberturas/excluir/títulos), `radio-nina.i18n.json`. 1ª faixa = abertura oficial do locale. Progresso/seek estilo streaming, painel de playlist, e playlist salva por conta (`radio_nina_playlists`). A cada 2 músicas ouvidas toca 1 **propaganda** do idioma do site (pastas R2 `MaketingBR/EN/ES/`, servidas pelo Worker em `/ads/<lang>`; shuffle-bag sem repetir a última). Eventos GA4: `radio_ligar`, `radio_play`, `radio_completa`, `radio_pular`, `radio_ad`, `radio_playlist_salva`. A barra é um rodapé real: publica `--radio-nina-h` (54px/0) em `:root`, e `body`/nav flutuante do leitor reservam essa altura. Modo compacto = bolinha arrastável pros 4 cantos (`ldi-radio-nina-canto`). Volume no `ldi-radio-nina-vol`. Também: `PlatformIcons`, `SocialBar`.

## 6. Conteúdo, dados e assets

### 6.1 Dados editoriais globais

| Área | Fonte |
|---|---|
| Personagens | `src/data/personagens-{pt,en,es}.json` |
| Mundo/lore | `src/data/mundo-{pt,en,es}.json` |
| Livro (linha principal) | `src/data/livro-index.json` (com `resumo_*` / `tagline_*` e `liberacao.{primordial,elite,conta,publico}` por capítulo) e `src/data/livro/{pt,en,es}/capitulo-NN.md` |
| Calendário público | `src/data/season-one-schedule.js` reúne os 27 drops da Temporada 1; as datas de acesso que alimentam o gate ficam nos três índices editoriais |
| Contos de Ilusão | `src/data/contos-index.json` (com `resumo_{pt,en,es}` por capítulo) e `src/data/livro/contos/{pt,en,es}/NN/NN.md` |
| Obras (Mundo das Sombras, Mar de Cinzas) | `src/data/obras-index.json` (`peso`, `canon:false`, `selo`, `idiomas`, `capitulos[].data_publicacao`) e `src/data/livro/obras/<slug>/<lang>/NN.md`; arte webp em `src/assets/obras/<slug>/` (capa + `cap-NN`). Gating por `data_publicacao` futura + bypass de admin |
| Worldbuilding dos universos | `src/data/universo-index.json` (define abas; uma aba pode ter `partes: [...]`) e `src/data/universo/<slug>/<lang>/<secao>.json` — **array de blocos tipados** (`prose`, `card`, `box`, `callout`, `timeline`, `personagens`, `protagonista`, `tabela`, `quote`, `lista`, `sub`, `tags`) renderizado por `Universo.jsx`. Mar de Cinzas foi extraído do `mar-de-cinzas-v5.html` via `bs4`. `/mundo/lutas-de-ilusao` ainda usa o formato antigo (`mundo-{pt,en,es}.json` + `Mundo.jsx`) |
| Webtoon | `src/data/episodios.json` e páginas em `public/webtoon/` |
| Músicas | `src/data/musicas.json` |
| Loja | `src/data/produtos.json` e `src/data/loja-digital.json` |
| Quiz | `src/data/quiz-pt.json` |
| Busca | `src/data/search-index.js` |
| Planos | `src/data/planos.json` |
| Países | `src/data/paises.js` |
| Notificações/home | `src/data/notificacoes.json` e `src/data/nowlive.json` |
| Conquistas | `src/data/achievements-*.json` e `achievements-strings-*.json` |
| Cartas Top Trumps | `src/data/supertrunfo-{pt,en,es}.json` |

Arquivos do livro são carregados por `import.meta.glob`; ao mover leitores, os caminhos relativos precisam ser conferidos. A publicação é controlada por `livro-index.json`. Páginas do webtoon ficam em `public/` porque exigem URL direta. Demais assets devem ficar em `src/assets/` e ser importados pelo código.

### 6.2 i18n

Carregamento **por idioma e por área**: o visitante baixa só o núcleo do idioma que usa, e a área pesada chega quando ele entra nela. Antes os três idiomas inteiros entravam no bundle (~356K) para servir um.

| Pasta | Conteúdo | Quando carrega |
|---|---|---|
| `src/i18n/core/<lang>.json` | Navegação, home, histórias, conta, loja, quiz, calendário | Sempre, só o idioma ativo |
| `src/i18n/games/<lang>.json` | Strings de dentro dos jogos (inclui `pp` e `games.toptrumps`), `tatics`, `multiplayer_lobby` | Ao entrar em `/games/<jogo>` |
| `src/i18n/prototype/<lang>.json` | Laboratório | Ao entrar em `/lab` |
| `src/i18n/gangues-<lang>.json` | LDI Gangues (grande) | `useGanguesI18n()`, ao abrir o jogo |

`src/i18n/locales.js` expõe `carregarCore(locale)`, `carregarArea(area, locale)`, `areaDaRota(pathname)` e `LOCALE_LABELS`. O `LanguageProvider` segura a renderização até o núcleo chegar — é o que evita a página piscar com as chaves cruas; a vinheta de abertura cobre essa espera. Ao trocar de idioma o dicionário antigo continua valendo até o novo chegar, então não há tela em branco.

Chave nova vai no arquivo da área correspondente, nunca num monolito, e precisa existir nos três idiomas. O catálogo `/games` usa `site.games.*`, que fica no núcleo — só as telas de dentro puxam o pedaço pesado.

Kernel Games mantém i18n próprio em `src/pages/games/KernelGames/_shared/i18n/`.

Namespaces de conteúdo relevantes: `nav.links`, `pages.livro`, `pages.contos` (`peso_*`, `canon_*`, `tema_*`), `pages.historias`, `pages.obra`, `pages.mundoHub`, `pages.universo`.

## 7. Multiplayer e persistência dos jogos

- O lobby oficial compartilhado está em `/games/multiplayer/lobby` e usa `useSharedLobbyMachine` dentro de `src/pages/games/MultiplayerLobby/`.
- O Top Trumps fornece seu adaptador ao lobby e mantém a partida em `TopTrumpsMP.jsx`.
- A state machine de turno multiplayer está em `src/pages/games/TopTrumps/hooks/useMultiplayerTurnMachine.js`.
- Artes Top Trumps usam `src/assets/images/cards/characters/card-NN.png` e são resolvidas exclusivamente por `src/lib/topTrumpsCardImages.js`.
- Persistência específica permanece dentro de cada módulo de jogo; não há store global compartilhada entre jogos.

## 8. Supabase e Stripe

- Projeto Supabase: `dvxfrzixtetdzmdrzkpx`.
- Cliente: `src/lib/supabase.js`.
- Migrações locais: `supabase/migrations/004_*.sql` até `029_radio_nina_playlists.sql`; os números podem se repetir porque algumas linhas de evolução foram criadas em paralelo.
- Principais domínios persistidos: perfis, fichas, DIX, conquistas, saves de jogos, Tamagoshi, Arena, decks/ranking/partidas Top Trumps, submissões compartilhadas e playlist da Rádio Nina (`radio_nina_playlists`, 1 por usuário).
- RLS usa o usuário autenticado como autoridade nos dados pessoais.

| Edge Function | Função | JWT |
|---|---|---|
| `create-checkout-session` | Cria sessão Stripe Checkout | Sim |
| `stripe-webhook` | Recebe eventos Stripe | Não |
| `cancel-subscription` | Agenda cancelamento da assinatura | Sim |

As Edge Functions ficam em `supabase/functions/`; o frontend de assinatura está em `src/lib/stripe.js` e `src/pages/platform/Assinar.jsx`.

## 9. GitHub Pages, SEO e deploy

- `public/404.html` e o script de restauração em `index.html` sustentam deep links da SPA no GitHub Pages.
- `scripts/prerender-routes.js` roda após o build e gera ~50 páginas SEO + 4 redirects estáticos. `/login/` e `/cadastro/` saem com `noindex`.
- O prerender inclui páginas gerais, jogos públicos selecionados, os personagens do catálogo, os capítulos/episódios já publicados e as landings de `/historias*` e `/mundo*` (incluindo `/historias/mundo-das-sombras`, `/historias/mar-de-cinzas`, `/mundo/lutas-de-ilusao`, `/mundo/mundo-das-sombras`, `/mundo/mar-de-cinzas`). Conteúdo futuro ou bloqueado não entra automaticamente no sitemap.
- Redirects estáticos gerados: `/livro` → `/historias/lutas-de-ilusao`, `/livro/contos` → `/historias/contos`, `/games/ldi-arena`, `/games/toptrumps/lobby`. Links internos da Navbar/Footer usam barra final (`/loja/`) para evitar o 301 automático do GitHub Pages.
- Cada entrada recebe título, descrição, canonical, conteúdo HTML inicial, navegação interna, breadcrumbs e JSON-LD adequado (`WebSite`, `WebPage`, `ProfilePage`, `Book`, `Chapter`, `ComicSeries`, `ComicStory` ou `VideoGame`).
- A aplicação usa divisão de código por rota com `React.lazy`; na Home, seções abaixo da dobra são carregadas por proximidade da viewport e o primeiro banner WebP é pré-carregado exclusivamente na página inicial.
- `/login/` e `/cadastro/` também recebem HTML estático para responder HTTP 200, com `noindex` e fora do sitemap.
- Existem entradas SEO legadas sob `public/*/index.html`; a saída final autoritativa é regenerada em `dist/` pelo prerender.
- `public/sitemap.xml` lista URLs indexáveis; rotas privadas, internas e de laboratório não devem ser tratadas como páginas SEO só por existirem na SPA.
- Deploy: `npm run build`, commit/push da fonte e `npm run deploy` para publicar `dist/` em `gh-pages`.
- O portal pode ser instalado como PWA no Android. Quando aberto pelo ícone instalado, solicita `fullscreen`, com fallback para `standalone`; uma aba comum do navegador não pode esconder suas barras automaticamente.

## 10. Camadas visuais globais

### 10.1 Coluna única mobile

O portal é **mobile only**: uma visão só, a do celular, em qualquer plataforma. Não existe visão desktop nem breakpoint que revele layout de tela grande — num monitor o site é o mesmo app de celular numa coluna centralizada, com o resto da tela servindo de moldura.

A coluna vive em `src/index.css` e toda página herda (nenhuma repete `max-width`):

| Token | Valor | Papel |
|---|---|---|
| `--app-w` | `480px` | Largura máxima da coluna (`#root`). Nunca muda. |
| `--app-gutter` | `max(0px, (100vw - --app-w) / 2)` | Moldura de cada lado; `0` em telas estreitas. Confina os overlays `position: fixed`. |
| `--app-vw` | `min(100vw, --app-w)` | Largura real da coluna. Substitui as unidades `vw`. |

De 320px (iPhone SE) a 430px (Pro Max) a coluna ocupa 100% da tela; acima disso trava em 480px e centraliza.

Overlays `fixed` escapam do `#root`, então são presos à coluna por `left/right: var(--app-gutter)`: Navbar, Rádio Nina (barra e paleta), CookieBanner, TrialBanner, LDINotification, UnifiedNotification, drawer-overlay e SearchModal. O drawer da navbar é ancorado só pela direita e seu deslocamento de fechado soma `--app-gutter`, senão estacionaria visível ao lado da coluna em vez de sair da tela. O `ScrollToTop` recua 16px da borda direita da coluna.

Media queries de viewport e unidades `vw` medem a tela, não a coluna, e por isso quebram a visão única no desktop — as regras de conversão estão em `AGENTS.md` e na Bíblia §4.

### 10.2 Linguagem visual única

`src/styles/design-system.css` (importado por `index.css`) guarda a linguagem do portal, extraída da navbar/drawer. Toda área usa os mesmos tokens; página nenhuma escreve hex novo.

| Token | Papel |
|---|---|
| `--if-cyan` / `--if-teal` | Ciano de assinatura e a base mais sóbria. Substituíram `#00eeff`, `#00e5ff`, `#18dafb`, `#00b4d8`. |
| `--if-amber` / `--if-amber-soft` | Destaque, premium, apoiar. Substituíram `#f5a623`, `#e8853a`, `#f4a227`, `#ffae32`. |
| `--if-cta` / `--if-cta-edge` | Laranja de conversão (Conta Grátis, Entrar). |
| `--if-ok` / `--if-danger` | Estado: liberado, erro. |
| `--if-violet` / `--if-pink` / `--if-blood` | Identidade curada para distinguir jogos. |
| `--if-panel`, `--if-glass`, `--if-glow-corner`, `--if-edge`, `--if-hair` | Superfícies e fios. |
| `--if-cut` | Canto chanfrado (10px). O portal corta o canto, não arredonda. |

Primitivas: `.if-panel`, `.if-btn` (`--ghost`/`--primary`/`--amber`), `.if-field`, `.if-label`, `.if-eyebrow`, `.if-title`, `.if-item` (+`__index`), `.if-badge`, `.if-divider`, `.if-page-head`, `.if-stagger`.

Motores de jogo que desenham em canvas mantêm hex literal: `ctx.fillStyle` não resolve `var()`.

| Camada | z-index |
|---|---:|
| DesktopShellBar (só runtime steam-demo) | 2147483647 |
| SearchModal | 2000 |
| AchievementToast | 1500 |
| Navbar | 1000 |
| Rádio Nina (paleta) | 501 |
| Rádio Nina (barra/mini) | 500 |
| CookieBanner | 200 |
| LDINotification | 150 |
| ScrollToTop | 100 |
| MusicSection dropdown | 50 |

CSS de jogos é global após importação pelo Vite: seletores devem ser limitados ao wrapper do módulo para não vazar para o restante do site.

## 11. Desktop Windows e Steam Demo

- O shell Windows usa Tauri 2 em `src-tauri/` e carrega exclusivamente o portal oficial online com `client=steam-demo` e `shellVersion=0.1.1`.
- A demo Steam usa App ID `5188520`, Depot Windows `5188521`, identificador `com.illusionfight.steam.demo` e executável `IllusionFightDemo.exe`. A janela abre maximizada e com decorações do SO (`decorations: true`, `fullscreen: false`), garantindo o X nativo.
- `src/lib/runtimePlatform.js` centraliza a detecção do cliente e preserva o contexto na sessão. No cliente Steam Demo, checkouts externos ficam indisponíveis; a experiência web permanece inalterada.
- `DesktopShellBar` (`src/components/DesktopShellBar/`) renderiza só no runtime `steam-demo`: barra fixa no topo com "Voltar aos Games" e "Fechar" (fecha a janela via `window.__TAURI__.window`, capability `core:window:allow-close` em `src-tauri/capabilities/default.json`). É a saída de emergência do jogador — z-index máximo.
- `npm run desktop:dev` abre o shell, `npm run desktop:build` gera o instalador e `npm run desktop:steam` prepara `steam/content/` para SteamPipe.
- Instruções e VDFs de exemplo ficam em `steam/`; nenhuma credencial ou SDK da Steam faz parte do repositório.

## 12. Versões atuais

Fonte única: `src/config/version.js`. Esta tabela registra somente a identificação atual, sem histórico de alterações.

| Constante | Módulo | Versão |
|---|---|---:|
| `SITE_VERSION` | Site global | **10.209.6** |
| `PP_VERSION` | Pesadelo Particular | 2.3.1 |
| `LDI_VERSION` | Lendas do LDI | 2.0.1 |
| `JACK_VERSION` | Jack Dream Beer | 5.3.2 |
| `GANGUES_VERSION` | LDI Gangues | 1.23.0 |
| `TAMA_VERSION` | Tamagoshi LDI | 3.4.1 |
| `DUELO_VERSION` | Duelo LDI | 2.8.1 |
| `MINIGAMES_VERSION` | MiniGames | 4.3.4 |
| `TS_VERSION` | Top Trumps single-player | 6.0.3 |
| `TM_VERSION` | Top Trumps multiplayer | 6.0.2 |
| `TATICS_VERSION` | Arena LDI Tatics | 7.5.0 |
| `SRGRM_VERSION` | SRGRM 3v3 | 3.5.0 |
| `ARENATESTBED_VERSION` | Arena Testbed | 6.22.1 |
| `KP_VERSION` | Kernel Panic | 1.4.2 |
| `SLIDING_VERSION` | Sliding Rafael | 1.4.4 |
| `CODIGO_VERSION` | Código Perdido | 1.3.3 |
| `MAZE_VERSION` | Maze Rafael | 1.1.4 |
| `GLITCH_VERSION` | Glitch Rafael | 1.1.7 |
| `BULLETHELL_VERSION` | Bullet Hell Rafael | 1.1.3 |
| `STABILIZER_VERSION` | Stabilizer Rafael | 1.1.2 |

## 13. Onde procurar primeiro

| Necessidade | Fonte principal |
|---|---|
| Rotas e gates ativos | `src/App.jsx` |
| Ordem dos providers | `src/main.jsx` |
| Regras obrigatórias do projeto | `AGENTS.md` |
| Versões | `src/config/version.js` |
| Catálogo visível de jogos | `src/pages/games/Games.jsx` |
| Conteúdo e traduções | `src/data/` e `src/i18n/` |
| Histórias, obras e cross-links | `src/data/obras-index.json`, `src/data/livro/obras/`, `src/pages/content/Historias.jsx` · `Obra.jsx` |
| Worldbuilding dos universos | `src/data/universo-index.json`, `src/data/universo/`, `src/pages/content/Universo.jsx` (blocos tipados) |
| Estado de um jogo | `src/pages/games/<Jogo>/store/` ou hooks do próprio módulo |
| Esquema/evolução do backend | `supabase/migrations/` |
| Assinaturas | `src/lib/stripe.js` e `supabase/functions/` |
| Shell Windows / Steam Demo | `src-tauri/`, `src/lib/runtimePlatform.js` e `steam/README.md` |
| SEO indexável | `public/sitemap.xml` e `scripts/prerender-routes.js` |
| Mapa detalhado do Arena Testbed | `src/pages/lab/Prototype/ArenaTestbed/ARENATESTBED_MAPA.md` |
| Regras e estado atual do LDI Gangues | `src/pages/games/Gangues/GANGUES_DESIGN.md` |
