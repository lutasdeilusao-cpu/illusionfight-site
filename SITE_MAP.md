# ILLUSIONFIGHT.COM — MAPA DO SITE E DO PROJETO

> Referência do estado atual do projeto para navegação humana e contexto de IA.
> Atualizado em 2026-08-27 — `SITE_VERSION` **10.198.23**.
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
- Versões: todas centralizadas em `src/config/version.js`.
- Build: `npm run build` executa Vite e depois `scripts/prerender-routes.js`; sourcemaps estão habilitados.

## 2. Entradas e composição global

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Entrada HTML, metadados, analytics e restauração da URL da SPA |
| `src/main.jsx` | Montagem React e composição dos providers |
| `src/App.jsx` | Layout global e fonte de verdade das rotas client-side |
| `src/index.css` | Reset, variáveis e estilos globais |
| `vite.config.js` | Vite com `base: '/'` e `build.sourcemap: true` |
| `public/404.html` | Captura URLs diretas no GitHub Pages e redireciona para a SPA |
| `public/sitemap.xml` | Sitemap público para buscadores; não confundir com este documento |
| `public/_redirects` | Normalização de URLs públicas |
| `public/CNAME` | Domínio oficial |

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

Componentes montados globalmente por `App.jsx`: `AnalyticsTracker`, `ScrollToTopOnNav`, `Navbar`, `SearchModal`, `TrialBanner`, `Footer`, `ScrollToTop`, `LDINotification`, `NinaMusicPlayer`, `UnifiedNotification` e `CookieBanner`. `AnalyticsTracker` registra cliques, submits e profundidade de scroll sem capturar valores digitados; o `readerMode` oculta Navbar, TrialBanner e Footer durante leitura.

## 3. Rotas atuais

`src/App.jsx` é a autoridade. Parâmetros dinâmicos aparecem com `:id`. O símbolo 🔒 indica rota envolvida por `FichaGateRoute`; o gate combina regras de autenticação, fichas e gratuidade conforme suas props.

### 3.1 Site e conteúdo

| Rota | Página | Arquivo principal |
|---|---|---|
| `/` | Home | `src/pages/site/Home.jsx` |
| `/personagens` | Catálogo de personagens | `src/pages/content/Personagens.jsx` |
| `/personagens/:id` | Detalhe de personagem | `src/pages/content/PersonagemDetalhe.jsx` |
| `/livro` | Índice do livro | `src/pages/content/Livro.jsx` |
| `/livro/:id` | Leitor de capítulo | `src/pages/content/LivroCapitulo.jsx` |
| `/webtoon` | Índice do webtoon | `src/pages/content/Webtoon.jsx` |
| `/webtoon/:id` | Leitor de episódio | `src/pages/content/WebtoonEpisodio.jsx` |
| `/musicas` | Músicas | `src/pages/content/Musicas.jsx` |
| `/mundo` | Lore e mundo | `src/pages/content/Mundo.jsx` |
| `/autor` | Autor | `src/pages/site/Autor.jsx` |
| `/loja` | Loja | `src/pages/site/Loja/Loja.jsx` |
| `/quiz` | Quiz | `src/pages/site/Quiz.jsx` |
| `/custos` | Custos da plataforma | `src/pages/site/Custos.jsx` |

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
    ├── content/            # livro, webtoon, mundo, músicas, personagens
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
- Home/conteúdo: `HeroSlideshow`, `HeroEffect`, `LatestEpisodes`, `BookChaptersRow`, `CharactersRow`, `MusicSection`, `NowLive`, `ShopSection`, `StoryProgress`.
- Jogos/resultado: `BackToGamesBtn`, `Jokempo`, `Puzzles`, `ResultCard`, `TopTrumpsCard`.
- Mídia: `NinaMusicPlayer`, `PlatformIcons`, `SocialBar`.

## 6. Conteúdo, dados e assets

### 6.1 Dados editoriais globais

| Área | Fonte |
|---|---|
| Personagens | `src/data/personagens-{pt,en,es}.json` |
| Mundo/lore | `src/data/mundo-{pt,en,es}.json` |
| Livro | `src/data/livro-index.json` e `src/data/livro/{pt,en,es}/*.md` |
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

- Site geral: `src/i18n/pt.json`, `en.json`, `es.json`.
- Pesadelo Particular: `src/i18n/pp_{pt,en,es}.json`.
- Top Trumps: `src/i18n/tt_{pt,en,es}.json`.
- LDI Gangues: `src/i18n/gangues-{pt,en,es}.json`, carregado sob demanda via `useGanguesI18n()` (só baixa quando o jogador entra no jogo, não faz parte do bundle geral).
- Kernel Games: `src/pages/games/KernelGames/_shared/i18n/` e i18n próprio do Kernel Panic.

## 7. Multiplayer e persistência dos jogos

- O lobby oficial compartilhado está em `/games/multiplayer/lobby` e usa `useSharedLobbyMachine` dentro de `src/pages/games/MultiplayerLobby/`.
- O Top Trumps fornece seu adaptador ao lobby e mantém a partida em `TopTrumpsMP.jsx`.
- A state machine de turno multiplayer está em `src/pages/games/TopTrumps/hooks/useMultiplayerTurnMachine.js`.
- Artes Top Trumps usam `src/assets/images/cards/characters/card-NN.png` e são resolvidas exclusivamente por `src/lib/topTrumpsCardImages.js`.
- Persistência específica permanece dentro de cada módulo de jogo; não há store global compartilhada entre jogos.

## 8. Supabase e Stripe

- Projeto Supabase: `dvxfrzixtetdzmdrzkpx`.
- Cliente: `src/lib/supabase.js`.
- Migrações locais: `supabase/migrations/004_*.sql` até `028_auth_profile_provisioning.sql`; os números podem se repetir porque algumas linhas de evolução foram criadas em paralelo.
- Principais domínios persistidos: perfis, fichas, DIX, conquistas, saves de jogos, Tamagoshi, Arena, decks/ranking/partidas Top Trumps e submissões compartilhadas.
- RLS usa o usuário autenticado como autoridade nos dados pessoais.

| Edge Function | Função | JWT |
|---|---|---|
| `create-checkout-session` | Cria sessão Stripe Checkout | Sim |
| `stripe-webhook` | Recebe eventos Stripe | Não |
| `cancel-subscription` | Agenda cancelamento da assinatura | Sim |

As Edge Functions ficam em `supabase/functions/`; o frontend de assinatura está em `src/lib/stripe.js` e `src/pages/platform/Assinar.jsx`.

## 9. GitHub Pages, SEO e deploy

- `public/404.html` e o script de restauração em `index.html` sustentam deep links da SPA no GitHub Pages.
- `scripts/prerender-routes.js` roda após o build e gera conteúdo estático das rotas configuradas para SEO.
- `/login/` e `/cadastro/` também recebem HTML estático para responder HTTP 200, com `noindex` e fora do sitemap.
- Existem entradas SEO estáticas sob `public/*/index.html` para páginas públicas selecionadas.
- `public/sitemap.xml` lista URLs indexáveis; rotas privadas, internas e de laboratório não devem ser tratadas como páginas SEO só por existirem na SPA.
- Deploy: `npm run build`, commit/push da fonte e `npm run deploy` para publicar `dist/` em `gh-pages`.

## 10. Camadas visuais globais

| Camada | z-index |
|---|---:|
| SearchModal | 2000 |
| AchievementToast | 1500 |
| Navbar | 1000 |
| TrialBanner | 998 |
| CookieBanner | 200 |
| LDINotification | 150 |
| ScrollToTop | 100 |
| MusicSection dropdown | 50 |

CSS de jogos é global após importação pelo Vite: seletores devem ser limitados ao wrapper do módulo para não vazar para o restante do site.

## 11. Versões atuais

Fonte única: `src/config/version.js`. Esta tabela registra somente a identificação atual, sem histórico de alterações.

| Constante | Módulo | Versão |
|---|---|---:|
| `SITE_VERSION` | Site global | **10.198.23** |
| `PP_VERSION` | Pesadelo Particular | 2.3.1 |
| `LDI_VERSION` | Lendas do LDI | 2.0.1 |
| `JACK_VERSION` | Jack Dream Beer | 5.3.2 |
| `GANGUES_VERSION` | LDI Gangues | 1.14.2 |
| `TAMA_VERSION` | Tamagoshi LDI | 3.4.1 |
| `DUELO_VERSION` | Duelo LDI | 2.8.1 |
| `MINIGAMES_VERSION` | MiniGames | 4.3.4 |
| `TS_VERSION` | Top Trumps single-player | 6.0.1 |
| `TM_VERSION` | Top Trumps multiplayer | 6.0.1 |
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

## 12. Onde procurar primeiro

| Necessidade | Fonte principal |
|---|---|
| Rotas e gates ativos | `src/App.jsx` |
| Ordem dos providers | `src/main.jsx` |
| Regras obrigatórias do projeto | `AGENTS.md` |
| Versões | `src/config/version.js` |
| Catálogo visível de jogos | `src/pages/games/Games.jsx` |
| Conteúdo e traduções | `src/data/` e `src/i18n/` |
| Estado de um jogo | `src/pages/games/<Jogo>/store/` ou hooks do próprio módulo |
| Esquema/evolução do backend | `supabase/migrations/` |
| Assinaturas | `src/lib/stripe.js` e `supabase/functions/` |
| SEO indexável | `public/sitemap.xml` e `scripts/prerender-routes.js` |
| Mapa detalhado do Arena Testbed | `src/pages/lab/Prototype/ArenaTestbed/ARENATESTBED_MAPA.md` |
| Regras e estado atual do LDI Gangues | `src/pages/games/Gangues/GANGUES_DESIGN.md` |
