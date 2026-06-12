# 📊 RELATÓRIO COMPLETO — ILLUSION FIGHT PORTAL

> **Data:** 2026-06-12  
> **Versão do Relatório:** 3.23  
> **Versão do Site:** 10.46.1  
> **Domínio:** https://illusionfight.com/  
> **Repositório:** https://github.com/lutasdeilusao-cpu/illusionfight-site  
> **Lançamento Oficial:** 🗓️ **14 de Setembro de 2026**

---

## SUMÁRIO

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Site Institucional](#3-site-institucional)
4. [Sistema de Contas e Pagamentos](#4-sistema-de-contas-e-pagamentos)
5. [Jogos — Análise Detalhada](#5-jogos--análise-detalhada)
   - 5.1 [Lendas do LDI (RPG Narrativo)](#51-lendas-do-ldi-rpg-narrativo)
   - 5.2 [Jack Dream Beer](#52-jack-dream-beer)
   - 5.3 [Pesadelo Particular](#53-pesadelo-particular)
   - 5.4 [Top Trumps LDI (Super Trunfo PT)](#54-top-trumps-ldi-ldi-super-trunfo-em-pt)
   - 5.5 [Arena LDI](#55-arena-ldi)
   - 5.6 [Arena LDI Tatics](#56-arena-ldi-tatics)
   - 5.7 [Duelo LDI](#57-duelo-ldi)
   - 5.8 [Tamagoshi LDI](#58-tamagoshi-ldi)
   - 5.9 [MiniGames](#59-minigames)
6. [Conteúdo do Livro](#6-conteúdo-do-livro)
7. [Webtoon](#7-webtoon)
8. [Infraestrutura](#8-infraestrutura)
9. [Assets e Mídia](#9-assets-e-mídia)
10. [Internacionalização (i18n)](#10-internacionalização-i18n)
11. [Tabela Resumo de Completude](#11-tabela-resumo-de-completude)
12. [Análise de Gargalos](#12-análise-de-gargalos)
13. [Plano de Ação Recomendado](#13-plano-de-ação-recomendado)
14. [Estimativa de Esforço](#14-estimativa-de-esforço)

---

## 1. VISÃO GERAL DO PROJETO

O **Illusion Fight Portal** (Lutas de Ilusão) é uma plataforma web completa que funciona como:

- **Site institucional** da marca Lutas de Ilusão
- **Hub de jogos** com 9 experiências interativas distintas
- **Plataforma de leitura** (livro e webtoon)
- **Loja virtual** (produtos físicos e digitais)
- **Sistema de assinaturas** com Stripe
- **Rede social gamificada** (achievements, ranking, fichas)

### Métricas Gerais

| Métrica | Valor |
|---|---|
| **Versão Atual** | 10.41.1 ✅ |
| **Lançamento Oficial** | 🗓️ **14 de Setembro de 2026** |
| **Total de Rotas** | 35 rotas ativas |
| **Total de Jogos** | 9 jogos |
| **Total de Arquivos de Código** | ~250+ arquivos |
| **Idiomas** | 3 (PT, EN, ES) |
| **Supabase Migrations** | 14 arquivos |
| **Stripe Edge Functions** | 3 funções |
| **Total de Capítulos do Livro** | 16 escritos (3 publicados — lançamento quinzenal Set/2026) |
| **Total de Palavras no Livro** | ~27.500 palavras |
| **Total de Cartas Duelo** | 68 cartas (5 novas 6★) |
| **Total de Cartas Top Trumps** | 105 cartas |
| **Total de Casos (Pesadelo Particular)** | 20 casos |
| **Total de Criaturas Tamagoshi** | 32 criaturas |
| **Total de Personagens (Tatics Roster)** | 20 personagens |
| **Total de Minigames** | 8 jogos |
| **Total de Puzzles** | 6 tipos |
| **Total de Episódios Webtoon** | 2 episódios (58 páginas) |

---

## 2. STACK TECNOLÓGICA

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework Frontend** | React | 19.1.0 |
| **Bundler** | Vite | 8.0.16 |
| **Roteamento** | React Router | 7.6.1 |
| **Estado Global** | Zustand | 5.0.14 |
| **Animações** | Framer Motion | 12.40.0 |
| **Backend/Banco** | Supabase | @supabase/supabase-js 2.107.0 |
| **Pagamentos** | Stripe | SDK frontend + Edge Functions |
| **Markdown** | react-markdown | 10.1.0 |
| **SEO/Head** | react-helmet-async | 3.0.0 |
| **Build** | Vite + @vitejs/plugin-react-oxc | — |
| **Deploy** | gh-pages | 6.3.0 |
| **CSS** | CSS puro (zero CSS-in-JS) | — |
| **Tipagem** | Nenhuma (JSX puro, sem TypeScript) | — |
| **Testes/Lint** | Nenhum | — |

---

## 3. SITE INSTITUCIONAL

### 3.1 Páginas Estáticas/Conteúdo

| Rota | Página | Status | Tradução | Observações |
|---|---|---|---|---|
| `/` | Home (Landing Page) | ✅ **Completo** | ✅ PT/EN/ES | HeroSlideshow (4 banners), LatestEpisodes, CharactersRow, BookChaptersRow, MusicSection, NowLive, StoryProgress, newsletter-cta, ShopSection, home-support CTA |
| `/personagens` | Grid de Personagens | ✅ **Completo** | ✅ PT/EN/ES | 10 personagens categorizados |
| `/personagens/:id` | Detalhe do Personagem | ✅ **Completo** | ✅ PT/EN/ES | Nome, idade, status, ranking, arma, estilo, elemental, descrição, frase, relações |
| `/livro` | Lista de Capítulos | ✅ **Completo** | ✅ PT/EN/ES | 16 capítulos indexados com controle de publicação |
| `/livro/:id` | Leitor de Capítulo | ✅ **Completo** | ✅ PT/EN/ES | react-markdown, lazy loading, readerMode |
| `/webtoon` | Grid de Episódios | ✅ **Completo** | ✅ PT/EN/ES | Grid com thumbnails |
| `/webtoon/:id` | Leitor Webtoon | ✅ **Completo** | ✅ PT/EN/ES | Leitor vertical lazy load, readerMode |
| `/musicas` | Página de Músicas | ✅ **Completo** | ✅ PT/EN/ES | 36 faixas com capas randomizadas + plataformas |
| `/mundo` | Lore do Universo | ✅ **Completo** | ✅ PT/EN/ES | Bravara, LDI, Xakaxi, Timeline, Glossário |
| `/autor` | Sobre o Autor | ✅ **Completo** | ✅ PT/EN/ES | História do autor Isaias Leal |
| `/assinar` | Planos de Assinatura | ✅ **Completo** | ✅ PT/EN/ES | 3 tiers, Stripe Checkout integrado, preços dinâmicos por locale |
| `/games` | Hub de Jogos | ✅ **Completo** | ✅ PT/EN/ES | Jogos reordenados: Trumps → Arena → Lendas → Tama → Jack → Pesadelo → MiniGames → Tactics/Duelo; novas taglines pt/en/es |
| `/leaderboard` | Ranking Global | ✅ **Completo** | ✅ PT/EN/ES | Ranking do sistema |
| `/quiz` | Quiz SDR | ✅ **Completo** | ✅ PT/EN/ES | 3 modos de jogo, banco de perguntas |
| `/loja` | Loja Virtual | ✅ **Completo** | ✅ PT/EN/ES | Produtos físicos + digitais + Stripe |
| `/login` | Login | ✅ **Completo** | ✅ PT/EN/ES | Supabase Auth |
| `/cadastro` | Cadastro | ✅ **Completo** | ✅ PT/EN/ES | Criação de conta |
| `/perfil` | Perfil do Usuário | ✅ **Completo** | ✅ PT/EN/ES | Dashboard vertical colapsável (Conquistas, Arena, Coleção, Conta, Tamagoshi, Recompensas) + Fichas + DIX no header + barra de progresso 20 metas + assinatura Stripe |
| `/custos` | Custos | ✅ **Completo** | ✅ PT/EN/ES | Transparência financeira do projeto |
| `/admin` | Painel Admin | ✅ **Completo** | ✅ PT/EN/ES | Restrito a isaiasgamedev@gmail.com |
| `/prototype` | Protótipos (RPG System Morto) | ✅ **Ativo (v1.0.1)** | — | Admin-only (isaiasgamedev + gramikgames) |

### 3.2 Componentes Globais

| Componente | Status | Função |
|---|---|---|
| `Navbar` | ✅ Completo | Menu hamburger, search, navegação responsiva |
| `Footer` | ✅ Completo | Links, redes sociais, copyright |
| `SearchModal` | ✅ Completo | Busca global com índice |
| `CookieBanner` | ✅ Completo | Banner LGPD/cookies |
| `NotificationBalloon` | ✅ Completo | Balão de notificação |
| `ScrollToTop` | ✅ Completo | Botão voltar ao topo |
| `ScrollToTopOnNav` | ✅ Completo | Scroll automático ao navegar |
| `TrialBanner` | ✅ Completo (desligado) | `TRIAL_ACTIVE = false` |
| `AchievementToast` | ✅ Completo | Toast com partículas |
| `FichaGateRoute` | ✅ Completo | Gate de fichas para jogos (login + fichas + FREE info) |
| `LoginGate` | ✅ Completo | Gate de login reutilizável |
| `ModalSemFichas` | ✅ Completo | Modal arcade "SEM FICHAS" |
| `ModalConfirmacaoFicha` | ✅ Completo | Confirmação antes de gastar ficha |
| `ResultCard` | ✅ Completo | Canvas share card com paletas por jogo |
| `HeroEffect` | ✅ Completo | Efeitos visuais do hero |
| `HeroSlideshow` | ✅ Completo | Slideshow automático |
| `TypewriterPhrase` | ✅ Completo | Efeito typewriter |
| `PlatformIcons` | ✅ Completo | Ícones de plataformas de música |
| `SocialBar` | ✅ Completo | Redes sociais |
| `ProdutoDigitalCard` | ✅ Completo | Card de produto digital |

### 3.3 Contextos Globais

| Contexto | Status | Função |
|---|---|---|
| `AuthContext` | ✅ Completo | user, perfil, session, login, logout |
| `AchievementsContext` | ✅ Completo | Desbloquear, toast, persistência Supabase |
| `FichasContext` | ✅ Completo | Saldo, coleta diária, gastar, role-based |
| `LanguageContext` | ✅ Completo | i18n: locale, t(), changeLocale() |
| `ReaderContext` | ✅ Completo | readerMode — esconde Navbar/TrialBanner |

### 3.4 Hooks

| Hook | Status | Função |
|---|---|---|
| `useFichaGate` | ✅ Completo | Gate de fichas para jogos |
| `useHeroEffect` | ✅ Completo | Efeitos do hero |
| `usePersonagens` | ✅ Completo | Carrega personagens por locale |
| `useScrollPosition` | ✅ Completo | Posição do scroll |
| `useScrollReveal` | ✅ Completo | IntersectionObserver reveal |
| `useSlideshow` | ✅ Completo | Slideshow automático |
| `useSwipe` | ✅ Completo | Detecção de swipe touch |
| `useTopTrumpsDB` | ✅ Completo | Supabase queries Top Trumps + Ranking mensal (registrarPontuacaoRanking, carregarRanking, carregarPosicaoUsuario) |
| `useTopTrumpsMP` | ✅ Completo | Multiplayer Top Trumps |
| `useTypewriter` | ✅ Completo | Efeito typewriter |
| `useViewportScroll` | ✅ Completo | Scroll do viewport |
| `useZoom` | ✅ Completo | Zoom em imagens |

---

## 4. SISTEMA DE CONTAS E PAGAMENTOS

### 4.1 Autenticação (Supabase Auth)

| Funcionalidade | Status |
|---|---|
| Login com email/senha | ✅ Completo |
| Cadastro de conta | ✅ Completo |
| Sessão persistente | ✅ Completo |
| Perfil do usuário (profiles) | ✅ Completo |
| Role/tier system (free, elite, primordial) | ✅ Completo |
| Admin role (is_admin) | ✅ Completo |

### 4.2 Sistema de Fichas (Moeda Virtual)

| Funcionalidade | Status |
|---|---|
| Wallet (saldo de fichas) | ✅ Completo |
| Coleta diária | ✅ Completo |
| Gasto por jogo | ✅ Completo |
| Histórico de transações | ✅ Completo |
| Compras na loja digital | ✅ Completo |
| Role-based limits (free/elite/primordial) | ✅ Completo |

### 4.3 Stripe / Assinaturas

| Funcionalidade | Status |
|---|---|
| 3 tiers: RANQUEADO (grátis), ELITE (R$10/mês), PRIMORDIAL (R$30/mês) | ✅ Completo |
| Stripe Checkout (create-checkout-session) | ✅ Completo |
| Stripe Webhook (stripe-webhook) | ✅ Completo |
| Cancelamento de assinatura (cancel-subscription) | ✅ Completo |
| Preços dinâmicos por locale | ✅ Completo |
| Loja digital (fichas, packs) | ✅ Completo |
| Produtos físicos (livro, camiseta, etc.) | ✅ Completo (todos marcados como "EM BREVE") |

### 4.4 Achievements

| Funcionalidade | Status |
|---|---|
| Sistema de achievements | ✅ Completo |
| Persistência Supabase | ✅ Completo |
| Toast notifications | ✅ Completo |
| Catálogo de achievements | ✅ Completo |
| **Bloqueado para visitantes sem conta** | ✅ **v10.20.0** — PerfilArena corrigido: mostra fichas LDI Arena (não mais Top Trumps) |
| **Perfil — Aba Arena** | ✅ **v10.20.0** — Agora exibe fichas LDI Arena (character_sheets) com atributos, XP e inimigos desbloqueados. Link corrigido para /games/ldi-arena. i18n pt/en/es |

---

## 5. JOGOS — ANÁLISE DETALHADA

---

### 5.1 Lendas do LDI (RPG Narrativo)

**Versão:** 2.0.0  
**Fichas:** Gratuito (FREE)  
**Rota base:** `/games/ldi/*`

> 🌐 **i18n completo:** scenes, manual, powers, char data, creation flow pt/en/es

#### Screens

| Tela | Arquivo | Status | Detalhes |
|---|---|---|---|
| Lobby | `Lobby.jsx` | ✅ Completo | Lista de personagens, criar/continuar |
| Create | `Create.jsx` | ✅ Completo | NeoGuide + Ficha Completa (3D&T) |
| Game | `Game.jsx` | ✅ Completo | Cena narrativa com typewriter + choices |
| Combat | `Combat.jsx` | ✅ Completo | Combate 3D&T completo |
| Sheet | `Sheet.jsx` | ✅ Completo | Ficha do personagem |
| Clues | `Clues.jsx` | ✅ Completo | Caderno de pistas |
| End | `End.jsx` | ✅ Completo | Tela de fim |
| PuzzlePage | `PuzzlePage.jsx` | ✅ Completo | Roteador de puzzles |

#### Engine

| Módulo | Arquivo | Status | Detalhes |
|---|---|---|---|
| Dados | `dice.js` | ✅ Completo | Sistema de rolagem |
| Combate | `combat.js` | ✅ Completo | Sistema 3D&T |
| Personagem | `character.js` | ✅ Completo | Lógica de ficha |
| Flags | `flags.js` | ✅ Completo | Sistema de flags de progresso |
| Cenas | `scenes.js` | ✅ Completo | Gerenciamento de cenas |

#### Data/Conteúdo

| Item | Status | Detalhes |
|---|---|---|
| **Act 1** (22KB) | ✅ Completo | Cenas introdutórias com choices e sistema de flags |
| **Act 2** (9.5KB) | ✅ Completo | Continuação da narrativa |
| **Act 3** (18KB) | ✅ Completo | Desenvolvimento do arco |
| **Act 4** (9.5KB) | ✅ Completo | Cenas finais |
| **Character Data** | ✅ Completo | Dados de personagens jogáveis |
| **Manual Data** | ✅ Completo | Regras e manual |
| **Powers Data** | ✅ Completo | Poderes e elementais |
| **Enemies** | ✅ Completo | Inimigos em JSON |
| **Puzzles** | ✅ Completo | 6 tipos de puzzles integrados |

#### Store (Zustand)

| Store | Status | Detalhes |
|---|---|---|
| `useGameStore` | ✅ Completo | Jogo principal (flags, progresso, ficha) |
| `useCombatStore` | ✅ Completo | Estado de combate |

#### Componentes

| Componente | Status |
|---|---|
| `CharacterSheetView` | ✅ Completo |
| `ChoiceList` | ✅ Completo |
| `ClueBook` | ✅ Completo |
| `CombatView` | ✅ Completo |
| `DiceRoll` | ✅ Completo |
| `ManualDrawer` | ✅ Completo |
| `SceneView` | ✅ Completo |
| `Typewriter` | ✅ Completo |

**Status Geral:** ✅ **90%**  
**O que falta:** Mais conteúdo de cenas (expansão dos acts), polimento narrativo.

---

### 5.2 Jack Dream Beer

**Versão:** 5.2.0  
**Fichas:** Sim (🔒)  
**Rota base:** `/games/jackcandy`

#### Screens

| Tela | Arquivo | Status |
|---|---|---|
| MainMenu | `MainMenu.jsx` | ✅ Completo |
| Intro | `Intro.jsx` | ✅ Completo (com IntroNoir) |
| Vila | `Vila.jsx` | ✅ Completo |
| Interior | `Interior.jsx` | ✅ Completo |
| Dungeon | `Dungeon.jsx` | ✅ Completo |
| DungeonSelect | `DungeonSelect.jsx` | ✅ Completo |
| Inventario | `Inventario.jsx` | ✅ Completo |
| CasoSelect | `CasoSelect.jsx` | ✅ Completo |
| CasoAbertura | `CasoAbertura.jsx` | ✅ Completo |
| Investigacao | `Investigacao.jsx` | ✅ Completo |
| Interrogatorio | `Interrogatorio.jsx` | ✅ Completo |
| Dossier | `Dossier.jsx` | ✅ Completo |
| Descanso | `Descanso.jsx` | ✅ Completo |

#### Data

| Arquivo | Tamanho | Status | Conteúdo |
|---|---|---|---|
| `casos.js` | 9.9KB | ✅ Completo | Casos investigativos |
| `cidades.js` | 4.3KB | ✅ Completo | Cidades visitáveis |
| `dungeons.js` | 3.9KB | ✅ Completo | Dungeons |
| `flags.js` | 2.4KB | ✅ Completo | Flags de progresso |
| `itens.js` | 4.6KB | ✅ Completo | Itens do jogo |
| `monologues.js` | 5.6KB | ✅ Completo | Monólogos do Jack |
| `npcs.js` | 3.8KB | ✅ Completo | NPCs |
| `pistas.js` | 5.0KB | ✅ Completo | Pistas investigativas |

#### Componentes

| Componente | Status |
|---|---|
| `CombatLog` | ✅ Completo |
| `DialogoCaso` | ✅ Completo |
| `DicaToast` | ✅ Completo |
| `IntroNoir` | ✅ Completo |
| `Monologue` | ✅ Completo |
| `PistaCard` | ✅ Completo |
| `StatusBar` | ✅ Completo |

**Status Geral:** ✅ **90%**  
**O que falta:** Polimento visual, revisão de conteúdo, mais variedade de casos.

---

### 5.3 Pesadelo Particular

**Versão:** 2.2.0  
**Fichas:** Sim (🔒)  
**Rota base:** `/games/pesadelo`

> 🌐 **i18n completo:** casos, locais, pistas, suspeitos, narrativas, inimigos pt/en/es

#### Screens

| Tela | Arquivo | Status |
|---|---|---|
| CasoAbertura | `CasoAbertura.jsx` | ✅ Completo |
| Investigacao | `Investigacao.jsx` | ✅ Completo |
| MapaCidade | `MapaCidade.jsx` | ✅ Completo |
| Dossier | `Dossier.jsx` | ✅ Completo |
| CadernoSuspeitas | `CadernoSuspeitas.jsx` | ✅ Completo |
| Confronto | `Confronto.jsx` | ✅ Completo |
| Resolucao | `Resolucao.jsx` | ✅ Completo |
| FinalScreen | `FinalScreen.jsx` | ✅ Completo |
| Dormindo | `Dormindo.jsx` | ✅ Completo |

#### Data

| Arquivo | Tamanho | Status | Conteúdo |
|---|---|---|---|
| `casos.js` | **108KB** | ✅ **20 CASOS COMPLETOS** | Conteúdo massivo — o maior arquivo de dados do projeto |
| `inimigos.js` | 1.1KB | ✅ Completo | Inimigos por nível |
| `pistas.js` | 0.5KB | ✅ Completo | Pistas |
| `pp-i18n.js` | 22.9KB | ✅ Completo | Traduções internas PT/EN/ES |
| `resolver.js` | 1.5KB | ✅ Completo | Lógica de resolução |
| `telefonema.js` | 0.6KB | ✅ Completo | Roteiro de telefonemas |

#### Componentes

| Componente | Status |
|---|---|
| `PuzzleWrapper` | ✅ Completo |

#### Store

| Store | Status |
|---|---|
| `usePPStore` | ✅ Completo |

**Status Geral:** ✅ **95% — MAIS COMPLETO DE TODOS**  
**O que falta:** Revisão de bugs, polimento UI/UX.

---

### 5.4 Top Trumps LDI (LDI Super Trunfo em PT)

**Versão Single:** 5.14.0  
**Versão MP:** 5.8.1  
**Fichas:** Multiplayer 🔒  
**Rotas base:** `/games/toptrumps`, `/games/toptrumps/lobby`, `/games/toptrumps/multiplayer`

#### Funcionalidades

| Funcionalidade | Status |
|---|---|
| Single player (1ª temporada) | ✅ **Finalizado** |
| Lobby multiplayer | ✅ Funcional (🔒) |
| Partida multiplayer real-time | ✅ v2.65 (🔒) |
| **105 cartas** | ✅ Completo (PT/EN/ES) |
| Artes oficiais 1ª temporada | ✅ **Completo** — todas as cartas com arte no jogo |
| Balanceamento | ✅ **Finalizado** |
| Sistema de deck | ✅ Completo |
| Recompensa diária | ✅ Completo |
| Matchmaking | ✅ Implementado |

#### Cartas por Idioma

| Idioma | Tamanho | Status |
|---|---|---|
| `supertrunfo-pt.json` | 108KB | ✅ Completo |
| `supertrunfo-en.json` | 108KB | ✅ Completo |
| `supertrunfo-es.json` | 108KB | ✅ Completo |

**Status Geral:** ✅ **100% (Single)** / 🟡 **75% (MP)**  
**O que falta:** Testes finais de matchmaking multiplayer.

#### Changelog v5.14.0 / v5.8.1
- 🐛 **Fix deck c/ 5 cartas únicas** — Cada jogador recebe 5 cartas únicas da coleção (sem repetição dentro do próprio deck); Player e IA podem ter cartas em comum
- 🐛 **Fix tentativas por partida** — `consumirTentativa` chamado após CADA partida (vitória ou derrota); `marcarCartaGanha` separado (só quando ganha carta)
- 🐛 **Fix `tentativasRestantes` check** — Restaurado `> 0` (com 1 tentativa o jogador pode tentar ganhar carta)

#### Fix v10.46.1 — salvarCartasDeck (erro 42P10)
- 🐛 **Fix upsert sem constraint** — `salvarCartasDeck` substituído por check manual (SELECT existentes → filter → INSERT), eliminando erro `42P10`
- 📦 **Migration 020** — `supabase/migrations/020_toptrumps_decks_unique_constraint.sql` adiciona UNIQUE constraint `(user_id, carta_id)` para suporte futuro a ON CONFLICT

#### Changelog v5.13.1 / v5.8.0
- 🐛 **Fix turnos SP** — Restaurado sistema de turnos com modulo cycling (deck de cartas únicas cicla corretamente)
- 🐛 **Fix `totalTurnos`** — Removido `setTotalTurnos(roundsEfetivos)` que sobrescrevia a escolha do jogador
- ✨ **Sem cartas repetidas no deck** — DeckBuilder bloqueia cartas duplicadas; dedup no carregamento do deck (SP e MP); embaralhamento antes do slice

---

### 5.5 Arena LDI

**Versão:** 1.25.1  
**Status:** ✅ **LANÇADO** — Combate TURNO A TURNO clássico montando ficha e jogando dados. Single Player e Multiplayer Online.  
**Fichas:** Sim (🔒) — **limitado por tier**  
**Rota base:** `/games/ldi-arena`

#### Screens

| Tela | Status |
|---|---|
| ArenaLobby | ✅ Completo |
| ArenaCreate | ✅ Completo |
| ArenaCombat | ✅ Completo |
| ArenaVictory | ✅ Completo |

#### Data

| Arquivo | Status | Conteúdo |
|---|---|---|
| `arena-enemies.json` | ✅ Completo | 8 inimigos (tier 1-4) com trash_talk |
| `trash_talk.json` | ✅ Completo | Falas dos inimigos |

#### Store

| Store | Status |
|---|---|
| `useArenaStore` | ✅ Completo |

**Status Geral:** ✅ **97%**  
**Melhorias v1.25.1:**
- 🐛 **Fix crash pós-vitória** — `TypeError: i.getState is not a function` corrigido: `store.getState()` → `useArenaStore.getState()`
**Melhorias v1.25.0:**
- 🏆 **Leaderboard da Arena** — nova aba "LDI ARENA" no Leaderboard com ranking real do Supabase (tabela `arena_ranking`)
- ♻️ **RankingSection componentizado** — componente `RankingSection` reutilizável para Top Trumps e Arena
- 🔗 **Pontuação automática** — `ArenaVictory.jsx` chama `registrarPontuacaoArenaRanking(user.id)` ao vencer, registrando 15pts por vitória
**Melhorias v1.24.1:**
- 🐛 **Fix rota upgrade** — botão "Fazer Upgrade" navega para `/assinar` (página real de assinaturas) em vez de `/planos` (inexistente)
**Melhorias v1.24.0:**
- 🔓 **Modal de upgrade** — ao clicar em "Nova Ficha" bloqueado, abre modal explicativo com opções Elite/Primordial + botão "Fazer Upgrade"
- 🔓 **Modal multiplayer** — ao clicar em "Multiplayer" bloqueado, abre modal explicativo + botão "Fazer Upgrade"
- 🏷️ **Tag de destaque** — badge "FAZER UPGRADE" (dourado) no lugar de "EM BREVE" nos botões bloqueados
- 🌍 **i18n** — novas chaves: `limite.modal_*`, `multiplayer.modal_*` em pt/en/es
**Melhorias v1.23.0:**
- 🔒 **Limite de fichas por tier** — Ranqueado/FREE: 1 ficha, Elite: 3 fichas, Primordial: 5 fichas
- 📊 **Contador visível** — lobby mostra "X/Y fichas" ao lado do label "suas fichas"
- 🌐 **Multiplayer gate** — botão de multiplayer bloqueado para não assinantes com tooltip
- 🌍 **i18n** — novas chaves: `limite.*` e `multiplayer.*` em pt/en/es
**Melhorias v1.22.0:**
- 🐛 **Fix PerfilArena** — mostra fichas LDI Arena (não mais Top Trumps)
**Melhorias v1.21.0:**
- 🔊 **SFX na vitória/derrota** — `sfx.win()` + `sfx.explosion()` ao entrar na tela de vitória; `sfx.lose()` + `sfx.explosion()` na derrota
- 💥 **Partículas de comemoração** — 30 partículas coloridas explodindo (dourado, laranja, rosa, azul, verde) na vitória
- 💀 **Partículas de derrota** — 20 partículas vermelhas/sangue explodindo na derrota (tons vermelho escuro, laranja)
- 🎯 **Explosão no KO** — som de explosão extra quando o HP do inimigo chega a zero na animação

**Melhorias v1.20.1:**
- 🐛 **Fix: power name agora reflete o poder clicado** — antes usava `selectedPowers[0]`, então se o usuário selecionava Impacto + Barreira e clicava em Barreira, mostrava Impacto. Agora passa o `powerId` do botão clicado
- 🐛 **Fix: TTS voice persiste na batalha** — antes escolhia uma voz aleatória a cada `speakPowerName()`. Agora `sfx.resetTtsVoice()` é chamado ao montar o componente, e a mesma voz é reutilizada em todos os poderes da batalha

**Melhorias v1.20.0:**
- ✨ **Power name reveal** — ao usar um poder, o nome do golpe aparece em tela cheia com fonte Impact antes do DramaticDice rolar
- 🔊 **Power SFX** — novo som dramático de "hadouken" (ascendente + explosão) ao ativar poder
- 🗣️ **TTS Voice** — voz sintetizada fala o nome do poder em inglês (aleatório entre vozes EN disponíveis)
- ✨ **DramaticDice** — exibe o nome do poder durante a rolagem do dado dramático

**Melhorias v1.19.1:**
- 🐛 **Hotfix: criação de fichas quebrada** — `attribute_points_gained` não existia como coluna no Supabase; `saveToCloud()` e `loadSheets()` falhavam silenciosamente. Agora o valor é **derivado do `xp_total`** via `derivePointsFromXp()` ao carregar do banco
**Melhorias v1.19.0:**
- 🐛 **Fix XP não acumulando** — `gainXp()` nunca era chamado após vitória; agora o XP é concedido corretamente e persiste no Supabase
- ✨ **Barra de progresso XP** — novo componente visual na lobby e na tela de vitória com level destacado, barra gradiente animada, contagem XP atual/necessário e quanto falta para o próximo nível
- 🌐 **i18n** — novas chaves `xp_faltam` e `xp_level_up_ready` adicionadas em pt/en/es

**Melhorias v1.17.1:**
- 📱 **Scroll power select** — tela de Preparar Poderes agora rola em telas pequenas com scrollbar invisível

**Melhorias v1.17.0:**
- 🔘 **Botão voltar corrigido** — tela de vitória/derrota agora usa `escolher_oponente` e navega para o lobby (seleção de oponente) em vez de `/games`
- 🏠 **BackToGamesBtn no power select** — tela de preparar poderes agora tem botão voltar
- ⏱️ **Delay aumentado para 1200ms** — matchResult espera a animação da HP bar completar
- 🌐 **i18n** — nova chave `escolher_oponente` adicionada em pt/en/es
- 🤖 **Auto enemy select** — lobby detecta ficha carregada pós-partida e vai direto pra seleção de oponente

**Melhorias v1.16.0:**
- 🐛 **Fix HTML tags** — `vitoria_sub` agora usa `dangerouslySetInnerHTML` para renderizar o `<strong>` corretamente
- ⏱️ **Delay matchResult** — vitória/derrota só aparece 800ms depois, tempo para a animação da HP bar terminar

**Melhorias v1.15.2:**
- 🎵 **SFX notificação na IA** — mensagens de trash talk e sistema agora tocam `sfx.notification()`
- 🔒 **Limite desvantagens** — máximo de 3 pontos acumulados em desvantagens

**Melhorias v1.15.0:**
- 🎵 **SFX criação de ficha** — sons em atributos (+/-), elemental, especializações, vantagens, desvantagens, perks, botão Nova Ficha
- 🔘 **Botão voltar duplicado removido** — header sem BackToGamesBtn, navegação apenas no `arc-nav` inferior
- 📱 **Scroll mobile** — página de criação agora rola corretamente em mobile com scrollbar invisível

**Melhorias v1.10.0:**
- 🎵 **SFX System** — sons sintetizados em batalha (ataque, hit, vitória, derrota, clicks) com toggle 🔇
- 📜 **Auto-scroll** — chat da batalha sempre rola automaticamente para a mensagem mais recente
- 🐛 **BackToGamesBtn fix** — import ausente causava `ReferenceError` na criação de ficha e tela de vitória
- 🚪 **Exit button** — botão SAIR na batalha para voltar aos oponentes
- 🗑️ **Delete button** — mais visível (destaque vermelho, escala hover)
- 🗄️ **Delete fix** — Supabase delete com tratamento de erro
- 🌐 **i18n** — novas chaves `btn_sair` e `erro_excluir` pt/en/es
- **v1.10.1** — hardcoded strings `'Dê um nome...'`, `PV`/`PM`, `FA`/`FD`, `SFX` title traduzidos pt/en/es

**Melhorias v1.14.0:**
- 🏆 **MatchResult overlay** — fim de partida agora acontece na própria tela de batalha, sem navegação abrupta
- ⏱️ **Delay de 2s** — o jogador vê o resultado (vitória/derrota) por 2 segundos antes do botão aparecer
- 🔘 **Botão "Próximo"** — traduzido em PT/EN/ES, leva para a tela de vitória (com XP/recompensas) ou derrota
- 🎨 **Overlay cinematográfico** — fundo escuro com blur, troféu ou caveira animados, título em destaque

**Melhorias v1.13.2:**
- 🐛 **Hotfix** — loop infinito corrigido: `display` estava no array de dependências do `useEffect`, causando reinício infinito da rolagem. Substituído por `useRef`.

**Melhorias v1.13.1:**
- ⏱️ **Duração ajustada** — 1.5s~2s (normal) / 2s fixo (crítico)
- 🔉 **Som de tick** — `sfx.diceTick()` a cada batida do dado + `sfx.diceLand()` ao parar
- 📉 **Desaceleração cúbica** — curva `Math.pow(progress, 1.8)` para um slowdown mais suave e natural

**Melhorias v1.13.0:**
- 🎲 **DramaticDice** — novo componente cinematográfico de rolagem de dado
- 🎬 **Fullscreen modal** — tela cheia que sobrepõe todo o jogo durante a rolagem, pausando a ação completamente
- ⏱️ **Duração variável** — 2.5s~3.5s com desaceleração gradual (começa rápido, termina devagar)
- 💥 **Revelação dramática** — o número final é revelado com animação de escala, partículas e glow
- 🔥 **Crítico (6)** — efeito visual especial: borda dourada, shake, partículas douradas, pulsação
- 🎯 **Usado na FA e FD** — tanto o ataque do player quanto o ataque do inimigo passam pelo DramaticDice
- 🎨 **CSS cinematográfico** — radial gradient bg, blur backdrop, glow pulsante, partículas expansivas, barra de progresso
- 📱 **Responsivo** — adaptado para mobile

---

### 5.6 Arena LDI Tatics

**Versão:** 7.3.0  
**Fichas:** Sim  
**Rota base:** `/games/ldi-tatics`  
**Acesso:** 🔒 **Pós-lançamento** — apenas admins (multiplayer pendente)

> 🎯 **O jogo mais complexo e ambicioso do portal**

#### Screens (14 arquivos)

| Tela | Status | Descrição |
|---|---|---|
| `Intro.jsx` | ✅ Completo | Tela de introdução |
| `TeamSelect.jsx` | ✅ Completo | Seleção de time |
| `TeamBuilder.jsx` | ✅ Completo | Montagem de time |
| `ClasseSelect.jsx` | ✅ Completo | Seleção de classe |
| `Customizacao.jsx` | ✅ Completo | Customização de personagem |
| `PreBatalha.jsx` | ✅ Completo | Pré-batalha (preparação) |
| `Batalha.jsx` | ✅ Completo | Tela de batalha principal |
| `BatalhaSimulacao.jsx` | ✅ Completo | Simulação de batalha |
| `SimulacaoAuto.jsx` | ✅ Completo | Simulação automática |
| `CityOverworld.jsx` | ✅ Completo | Mapa da cidade (isométrico) |
| `BuildingInterior.jsx` | ✅ Completo | Interiores de prédios |
| `EvolutionScreen.jsx` | ✅ Completo | Tela de evolução de classe (Nv40/Nv70) |
| `Vitoria.jsx` | ✅ Completo | Tela de vitória |
| `Derrota.jsx` | ✅ Completo | Tela de derrota |

#### Components (16 arquivos)

| Componente | Status | Descrição |
|---|---|---|
| `Grid.jsx` | ✅ Completo | Grid de batalha |
| `GridCanvas.jsx` | ✅ Completo | Canvas isométrico 2D |
| `TiledMap.jsx` | ✅ Completo | Mapa tile-based |
| `ActionMenu.jsx` | ✅ Completo | Menu de ações em batalha |
| `SkillModal.jsx` | ✅ Completo | Modal de habilidades |
| `SkillPreviewModal.jsx` | ✅ Completo | Preview de habilidade |
| `DanoPopup.jsx` | ✅ Completo | Popup de dano |
| `TurnoIndicator.jsx` | ✅ Completo | Indicador de turno |
| `StatusBar.jsx` | ✅ Completo | Barra de status |
| `CityHUD.jsx` | ✅ Completo | HUD da cidade |
| `CombatResultModal.jsx` | ✅ Completo | Modal resultado combate |
| `ConfirmEndTurn.jsx` | ✅ Completo | Confirmação fim de turno |
| `EnemyTurnBanner.jsx` | ✅ Completo | Banner turno inimigo |
| `EventoBanner.jsx` | ✅ Completo | Banner de evento |
| `GameControls.jsx` | ✅ Completo | Controles do jogo |
| `JuiceComponents.jsx` | ✅ Completo | Componentes de juice (efeitos visuais) |

#### Data Files

| Arquivo | Status | Conteúdo |
|---|---|---|
| `roster.js` (15KB) | ✅ **20 personagens** | 6 classes: Karuak, Moraki, Tivara, e mais 3 |
| `classTree.js` | ✅ Completo | Árvore de evolução (v7.0) — Nv40 e Nv70 |
| `cardPool.js` | ✅ Completo | Sistema de sorteio de cartas (pool de 10) |
| `aiPersonalities.js` | ✅ **16 personalidades** | Comportamentos de IA |
| `classes.js` | ✅ Completo | Classes dos personagens |
| `combat.js` | ✅ Completo | Sistema de combate |
| `cosmeticos.js` | ✅ Completo | Cosméticos/aparência |
| `districts.js` | ✅ **8 distritos** | Distritos de Marélia |
| `elementais.js` | ✅ Completo | Elementais (sistema legado) |
| `elementals.js` | ✅ Completo | Elementais (sistema atual) |
| `enemies.js` | ✅ Completo | Inimigos do overworld |
| `equipment.js` | ✅ Completo | Equipamentos |
| `eventos.js` | ✅ Completo | Eventos aleatórios |
| `juice.js` | ✅ Completo | Efeitos visuais |
| `levelProgression.js` | ✅ Completo | Progressão de nível (v7.0) |
| `tilemaps/` | ✅ Completo | Mapas tile JSON |

#### Stores (Zustand)

| Store | Status |
|---|---|
| `useArenaTaticsStore` | ✅ Completo (v2.1.0) |
| `useCityStore` | ✅ Completo |

**STATUS:** 🟠 **Pós-lançamento**  
**MULTIPLAYER:** 🗓️ planejado — requisito antes da abertura ao público  
**PREVISÃO:** Q4 2026 ou posterior  
**MOTIVO:** o jogo merece experiência completa no primeiro contato do usuário  
**O que falta:** Balanceamento de classes e combate, testes de jogo completos, polimento visual, multiplayer online.

---

### 5.7 Duelo LDI — Campo de Batalha

**Versão:** 2.7.1  
**Fichas:** Sim (🔒)  
**Rota base:** `/games/duelo`  
**Acesso:** 🔒 **Pós-lançamento** — apenas admins (multiplayer pendente)

> 🔄 **Duelo v2.7 — Ataque direto Yu-Gi-Oh style!**  
> - **Ataque Direto:** Quando o jogador seleciona um monstro na fase ATAQUE e não há monstros inimigos no campo, aparece o botão pulsante ⚡ ATACAR DIRETO
> - **Dano direto ao LP:** O ataque direto causa dano igual ao ATK do monstro diretamente aos Life Points do oponente
> - **Vitória por LP:** Se os LP do oponente chegarem a 0 após ataque direto, o jogador vence
> - **IA também ataca direto:** IA também realiza ataques diretos quando não há monstros do jogador no campo
> - **Animação:** Botão de ataque direto com pulsação vermelha para chamar atenção
> - **Log:** "⚡ ATAQUE DIRETO! [monstro] causou [X] de dano diretamente!"
>
> 🔧 **Duelo v2.7.1 — Fix TELEPORT!**  
> - **Bug:** Carta TELEPORT pedia para selecionar um monstro aliado, mas após a seleção nunca pedia para escolher o destino — a magia não fazia nada
> - **Fix:** Novo fluxo completo: confirmar magia → clicar no monstro aliado → carta vai para o cemitério → modo "escolher destino" ativado → todas as casas vazias brilham roxo → clicar na casa vazia teleporta o monstro
> - **Visual:** Casas de destino válido destacadas em roxo pulsante + hint "Clique em uma casa VAZIA..."
> - **Log:** "🌀 [monstro] teleportado de [X,Y] para [X,Y]!"

#### Screens

| Tela | Status |
|---|---|
| `DueloMenu` | ✅ Completo |
| `DueloVitoria` | ✅ Completo |
| `DueloDerrota` | ✅ Completo |

#### Components (10 arquivos — TributeSelector removido)

| Componente | Status |
|---|---|
| `Board` (Grid 10×10) | ✅ Completo |
| `Hand` | ✅ Completo |
| `Card` (MOV/RNG) | ✅ Completo |
| `CardSlot` | ✅ Completo |
| `CardPreviewModal` (MOV/RNG) | ✅ Completo |
| `StatusBar` (MOV/RNG) | ✅ Completo |
| `BattleLog` | ✅ Completo |
| `TrapActivator` (grid) | ✅ Completo |
| `LPDisplay` (max 1000) | ✅ Completo |
| `PlayerZone` | ❌ Substituído pelo grid |
| `TributeSelector` | ✅ Exists (não usado ativamente — mantido para referência futura) |

#### Engine

| Módulo | Status |
|---|---|
| `ai.js` (IA posicionamento grid) | ✅ Completo |
| `deck.js` | ✅ Completo |
| `effects.js` (grid buffs) | ✅ Completo |
| `gameState.js` (grid 10×10, MOV, RNG) | ✅ Completo |
| `phases.js` (COMPRA→INVOCAR→AÇÃO→MAGIA→FIM) | ✅ Completo |

#### Cartas (conforme GDD v1.0)

| Tipo | Quantidade | Atributos |
|---|---|---|
| Monstros | 30 cartas | ATK, DEF, **MOV**, **RNG** |
| Magias | 15 cartas | Efeito, duração |
| Armadilhas | 15 cartas | Área, gatilho, efeito |
| **Total** | **68 cartas** | 35 monstros (5 novos 6★), 15 magias, 15 armadilhas, 3 extras |

#### Store

| Store | Status |
|---|---|
| `useDueloStore` (grid actions) | ✅ Completo |

**STATUS:** 🟠 **Pós-lançamento**  
**MULTIPLAYER:** 🗓️ planejado — requisito antes da abertura ao público  
**PREVISÃO:** Q4 2026 ou posterior  
**O que falta:** Animações de efeitos, UI mais polida, multiplayer online, expandir baralho.

---

### 5.8 Tamagoshi LDI

**Versão:** 2.0.4  
**Fichas:** Gratuito (FREE)  
**Rota base:** `/games/tamagoshi`

> 🌐 **i18n completo:** badges, passeios, loja, personalidades, saude, partida, termo, notificacoes pt/en/es  
> 🎮 **v2.0.4 — CSS fix:** botões Alimentar com className duplicado (tama-btn sobrescrito por tama-alimentar-item-btn), text visibility restaurada  
> 🎮 **v2.0.3 — Fichas fix:** erro 42P10 (upsert sem unique constraint) trocado para insert  
> 🎮 **v2.0.2 — Arquitetura front-end:** nome/personalidade resolvidos via CRIATURAS[criatura_id], não do Supabase; FichasContext upsert p/ persistir saldo; Criatura.jsx/PerfilTamagoshi limpos  
> 🎮 **v2.0.1 — Fix lookups:** CRIATURA_ID_TO_SLUG para FALAS_CRIATURA/COMIDA_TEMATICA; tick/aplicarDecaimento → recalcular()  
> 🎮 **v2.0.0 — Store stateless** — recalcular() baseado em timestamp, decaimento por dia da semana, cálculo retroativo de crítico  
> 🎮 **T1 — Gacha:** 10 criaturas sorteadas (1º giro grátis ✅ fix: não barrava por falta de DIX)  
> 🗂️ **Múltiplos slots + hibernação:** sistema de slots preparado para T2 (max 1 slot por ora)  
> 🎰 **T2 — Gacha de Temporada:** sistema de gacha para obter criaturas da T2 pagando DIX  
> 📜 **Termo de Responsabilidade:** tela de aceitação obrigatória antes do primeiro acesso, com flag persistida no Supabase

#### Screens (12 telas)

| Tela | Status | Descrição |
|---|---|---|
| `Ovo.jsx` | ✅ Completo | Ovo pulsante |
| `Selecao.jsx` | ✅ **v1.32.0** | Seleção aleatória entre as 10 criaturas T1 (não sempre Kroniki) |
| `Criatura.jsx` | ✅ **v1.23.1** | BackToGamesBtn reposicionado abaixo dos botões de ação |
| `Alimentar.jsx` | ✅ **v1.23.0** | SFX: clique nos botões + sucesso ao completar. Mostra TODOS os itens de comida |
| `Banhar.jsx` | ✅ **v1.23.0** | SFX: swipe throttled (200ms) + conclusão. Mostra qual item está sendo usado |
| `Brincadeira.jsx` | ✅ **v1.23.0** | SFX: conclusão ao vencer + erro ao falhar. Brinquedo Yohu removido da loja |
| `Passeio.jsx` | ✅ Completo | Seleção de local |
| `Passear.jsx` | ✅ **v1.23.0** | SFX: passos nos movimentos + conclusão. Guia de Marelia passivo (+1 coração) |
| `RestaurarSaude.jsx` | ✅ **v1.23.0** | SFX: drag, drop correto, drop errado, conclusão |
| `Loja.jsx` | ✅ **v1.23.0** | SFX: compra. Brinquedo Yohu removido da loja |
| `Termo.jsx` | ✅ **v1.29.0** | Termo de Responsabilidade (2 etapas) + persistência via flags no Supabase |
| `Luto.jsx` | ✅ Completo | Morte + cooldown (corrigido para 180 dias) |
| `Partida.jsx` | ✅ Completo | Despedida + fama (agora com dias_vividos + motivo) |

#### Data

| Arquivo | Status | Conteúdo |
|---|---|---|
| `criaturas.js` | ✅ **v1.37.0** | **32 criaturas** — kroniki (#1), ninka (#2), kroum (#3) são os 3 primeiros IDs |
| `evolucoes.js` | ✅ Completo | **4 estágios** (Ovo→Filhote→Jovem→Adulto→Veterano→Ancião→Partida) |
| `falas-criatura.js` | ✅ Completo | Falas por criatura |
| `itens_loja.js` | ✅ **v1.23.0** | Brinquedo Yohu removido |
| `moedas.js` | ✅ Completo | DIX constants |
| `passeios.js` | ✅ Completo | **6 locais** |
| `personalidades.js` | ✅ Completo | **6 personalidades** |
| `sfx.js` | ✅ **v1.23.0** | Sons sintéticos via Web Audio API (novo) |

#### Sistema de Decaimento (Tempo Real)

| Métrica | Decaimento/h | Crítico em |
|---|---|---|
| Fome | -6 | ~16h |
| Higiene | -3 | ~33h |
| Energia | -4 | ~25h |
| Humor | -2 | ~50h |
| Saúde | -2 | ~50h |

#### Ciclo de Vida

| Estágio | Duração |
|---|---|
| Ovo | 0-3 dias |
| Filhote | 4-60 dias |
| Jovem | 61-120 dias |
| Adulto | 121-180 dias |
| Veterano | 181-270 dias |
| Ancião | 271-365 dias |
| Partida | >365 dias |

#### Componentes

| Componente | Status |
|---|---|
| `CriaturaSprite` | ✅ Completo |
| `MetricBar` | ✅ Completo |
| `BalloonFala` | ✅ Completo |
| `CooldownTimer` | ✅ Completo |

#### Store

| Store | Status |
|---|---|
| `useTamagoshiStore` | ✅ Completo (métricas, DIX, lifecycle, Supabase, lazy evaluation) |

**Status Geral:** ✅ **Finalizado** — Pendente: sprites individuais para cada criatura. Atualmente 3 criaturas possuem sprite próprio: **Kroniki** (10 estados), **Ninka** (10 estados), **Kroum** (10 estados). Faltam artes personalizadas para as 29 criaturas restantes.  
**v1.32.0** — Fix: seleção aleatória entre as 10 criaturas T1 (não mais sempre Kroniki). Free users recebem 1 criatura aleatória das 10 disponíveis.  
**v1.33.0** — Fix: Gacha shadow bug (variável `t` do `.map()` colidia com função `t()` de tradução). Renomeado "Gacha" → "Sorteio" (pt) / "Raffle" (en) / "Sorteo" (es). Botão "🎮 Jogar Tamagoshi" adicionado no Perfil.  
**v1.34.0** — Fix: texto vazio no Perfil (`"você ainda não tem um tamagoshi."`) trocado por botão "🥚 Ir pegar seu Tamagoshi" (3 línguas) para contas novas.  
**v1.35.0** — Ninka: sprite próprio (10 estados) + criatura adicionada ao Gacha.  
**v1.36.0** — Kroum: sprite próprio (10 estados, 3ª criatura com arte individual) + criatura adicionada ao Gacha.  
**v1.36.1** — Fix Gacha: T2 bloqueado (EM BREVE), 1º giro grátis, apenas 10 criaturas T1 no sorteio.  
**v1.37.0** — CRIATURAS_BASE reordenado: kroniki (#1), ninka (#2), kroum (#3) são os 3 primeiros IDs (participam do Gacha).  
**v1.37.1** — Fix: 1º giro grátis não verificava saldo DIX (barrava mesmo sendo grátis).  
**v1.39.0** — Fix completo persistência: termo não reaparece no reload (setMostrarTermo sempre), saveToCloud skip quando sem criatura_id, localStorage fallback, isFree na rota, nome/personalidade reconstruídos do CRIATURAS.
**v1.38.1** — Fix: pet persistence — termo não reaparece após reload + dados não são deletados pela segurança corrompida (auto-corrige flags em vez de resetar).
**v1.38.0** — Ranking de Cuidadores mensal real no Leaderboard (tabela `tamagoshi_ranking`, cap 20pts/dia em ações, login sem cap).

---

### 5.9 MiniGames ✅ **FINALIZADO — 100%**

**Versão:** 2.0.0  
**Fichas:** Gratuito (FREE)  
**Rota base:** `/games/minigames`

> 🌐 **i18n completo:** todos os puzzles traduzidos pt/en/es

#### Jogos Incluídos

| Jogo | ID | Status | Descrição |
|---|---|---|---|
| Stealth Grid | `stealth` | ✅ Completo | Infiltração furtiva (3 dificuldades) |
| Decoder | `decoder` | ✅ Completo | Decodificador de mensagens |
| Sliding Tiles | `sliding` | ✅ Completo | Puzzle de tiles deslizantes |
| Labirinto | `labirinto` | ✅ Completo | Navegação em labirinto |
| Anagrama | `anagrama` | ✅ Completo | Formação de palavras |
| Forca | `forca` | ✅ Completo | Jogo da forca |
| Simon Says | `simon` | ✅ **v1.8.0** | Simon Says clássico + fix stale closure nos cliques |
| Enduro Kroniki | `enduro` | ✅ Completo | Corrida estilo endless runner |

#### Puzzles (Componente Reutilizável)

| Puzzle | Status |
|---|---|
| `PuzzleDecoder` | ✅ Completo |
| `PuzzleStealthGrid` | ✅ Completo |
| `PuzzleSlidingTiles` | ✅ Completo |
| `PuzzleLabirinto` | ✅ Completo |
| `PuzzleAnagrama` | ✅ Completo |
| `PuzzleForça` | ✅ Completo |
| `PuzzleSimonSays` | ✅ Completo |

**Status Geral:** ✅ **100% — FINALIZADO**  
**O que falta:** Nada — todos os 8 puzzles completos e funcionais.

---

## 6. CONTEÚDO DO LIVRO

### 6.1 Capítulos em Português

| # | Capítulo | Tamanho | Publicado | Status |
|---|---|---|---|---|
| 1 | O Roteiro | 8.5KB | ✅ Sim | ✅ Completo |
| 2 | A Máquina e a Rosa | 5.1KB | ✅ Sim | ✅ Completo |
| 3 | A Primeira Regra | 14.5KB | ✅ Sim | ✅ Completo |
| 4 | Briguento 142536 | 9.2KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 5 | A Lista | 11.7KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 6 | O Primordial | 11.0KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 7 | O Mundo Viu | 6.9KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 8 | O Mundo Viu, Parte II | 5.0KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 9 | Três Litros e Uma Tarde | 11.9KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 10 | O Que Uma Garota de Doze Anos Faz | 12.7KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 11 | A Manhã Errada | 6.8KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 12 | No Ônibus | 6.5KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 13 | Walter | 13.5KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 14 | Sala Privada | 12.7KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 15 | Ryan e a Caixa | 6.6KB | ❌ Não | ✅ Escrito, aguardando publicação |
| 16 | Verificação de Nível | 12.1KB | ❌ Não | ✅ Escrito, aguardando publicação |

> **Total:** 16 capítulos, ~26.000 palavras  
> **Publicados:** 3 capítulos (19%)  
> **Não publicados:** 13 capítulos (81%) — todo o conteúdo já está escrito!

### 6.2 Capítulos Traduzidos (EN/ES)

| Idioma | Capítulos .md | Status |
|---|---|---|
| **Inglês (EN)** | Cap. 1-3 (8.4KB, 5.2KB, 14.3KB) | ⚠️ **19%** — conteúdo completo traduzido |
| **Espanhol (ES)** | Cap. 1-3 (9.5KB, 5.2KB, 14.8KB) | ⚠️ **19%** — conteúdo completo traduzido |
| **Demais capítulos** | 4-16 | 🔴 **Conteúdo .md não traduzido** |
| **Índice (títulos/taglines)** | 1-16 | ✅ **100%** — Todos os 16 capítulos têm título e tagline traduzidos no `livro-index.json` |

### 6.3 Livro-Index (Controle de Publicação)

```json
capitulo-01: publicado ✅
capitulo-02: publicado ✅
capitulo-03: publicado ✅
capitulo-04 ao 16: publicado: false ❌
```

---

## 7. WEBTOON

### 7.1 Episódios Existentes

| Episódio | Título | Páginas | Publicado | Idioma |
|---|---|---|---|---|
| 00 | Apresentação | **21 páginas** | ✅ Sim | Apenas PT |
| 01 | O Sonho | **37 páginas** | ✅ Sim | Apenas PT |

### 7.2 Status

| Métrica | Valor |
|---|---|
| Episódios publicados | **2** (Ep. 00, Ep. 01) |
| Total de páginas | **58 PNGs** (`public/webtoon/00/pt/` + `public/webtoon/01/pt/`) |
| Próximos episódios | 🔴 **Nenhum** |
| Traduções (EN/ES) | 🔴 **Nenhuma** |

**Status Geral:** 🔴 **10%** — Precisa de MUITOS episódios adicionais.

---

## 8. INFRAESTRUTURA

### 8.1 Supabase

**Projeto:** `dvxfrzixtetdzmdrzkpx.supabase.co`

#### Migrations (16 arquivos)

| Migration | Descrição | Status |
|---|---|---|
| `004_jack_v3.sql` | Jack Candy v3 | ✅ Aplicada |
| `005_pesadelo_particular.sql` | Pesadelo Particular | ✅ Aplicada |
| `006_arena_enemies_unlocked.sql` | Arena inimigos | ✅ Aplicada |
| `006_tamagoshi.sql` | Tamagoshi v1 | ✅ Aplicada |
| `007_jack_v4_xp_nivel.sql` | Jack v4 XP | ✅ Aplicada |
| `008_tamagoshi_trocas.sql` | Trocas | ✅ Aplicada |
| `009_tamagoshi_v2.sql` | Tamagoshi v2 | ✅ Aplicada |
| `010_profiles_admin_role.sql` | Admin role | ✅ Aplicada |
| `010_tamagoshi_fix_columns.sql` | Fix colunas | ✅ Aplicada |
| `010_stripe_billing.sql` | Stripe subscription | ✅ Aplicada |
| `011_arena_tatics_roster.sql` | Roster Tatics | ✅ Aplicada |
| `012_tatics_card_pool.sql` | Cartas + evolução (v7.0) | ✅ Aplicada |
| `013_fichas_tables.sql` | Tabelas fichas | ✅ Aplicada |
| `013_pesadelo_saves.sql` | Pesadelo saves | ✅ Aplicada |
| `014_toptrumps_decks_builder.sql` | Top Trumps deck builder | ✅ Aplicada |
| `015_profiles_last_seen_at.sql` | Profiles last_seen_at | ✅ Aplicada |
| `017_drop_tamagoshi_tables.sql` | Drop Tamagoshi tables obsoletas | ✅ Aplicada |

> ⚠️ **Observação:** Migrations 001-003 não estão no repositório (existem apenas no banco remoto)

#### Edge Functions (3 funções)

| Função | JWT | Descrição |
|---|---|---|
| `create-checkout-session` | ✅ Requer JWT | Cria sessão Stripe Checkout |
| `stripe-webhook` | ❌ No-verify-jwt | Eventos Stripe |
| `cancel-subscription` | ✅ Requer JWT | `cancel_at_period_end` |

#### Tabelas Principais

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis de usuário (role, tier, is_admin) |
| `toptrumps_decks` | Decks do Top Trumps |
| `share_submissions` | Submissões de share |
| `tamagoshi_saves` | Saves do Tamagoshi |
| `tamagoshi_trocas` | Trocas do Tamagoshi |
| `tamagoshi_badges` | Badges do Tamagoshi |
| `tamagoshi_fama` | Fama do Tamagoshi |
| `dix_wallet` | Carteira de DIX |
| `dix_historico` | Histórico de transações DIX |

### 8.2 Stripe

| Componente | Status |
|---|---|
| Checkout Session | ✅ Completo |
| Webhook | ✅ Completo |
| Cancel Subscription | ✅ Completo |
| Preços dinâmicos por locale | ✅ Completo |
| Tiers: RANQUEADO (grátis), ELITE (R$10), PRIMORDIAL (R$30) | ✅ Completo |

### 8.3 Deploy

| Pipeline | Status |
|---|---|
| `npm run build` (Vite + prerender) | ✅ Funcional — `vite build` + `node scripts/prerender-routes.js` |
| `npm run deploy` (gh-pages) | ✅ Funcional |
| `python deploy.py` (automação) | ✅ Funcional |
| GitHub Pages + CNAME | ✅ Configurado |
| SPA 404 redirect | ✅ Funcional (fallback) |
| **Pré-renderização estática (SEO 200)** | ✅ **NOVO v10.41.0** — `dist/<rota>/index.html` gerado p/ 23 rotas públicas |
| Service Worker (placeholder) | ⚠️ Placeholder `sw.js` |
| Sitemap XML | ✅ Configurado |

### 8.4 SEO

| Item | Status |
|---|---|
| Open Graph tags | ✅ Configurado (`og-image.jpg`) |
| Sitemap XML | ✅ Configurado |
| Favicon | ✅ `favicon.svg` |
| CNAME | ✅ `illusionfight.com` |
| Meta tags por página (react-helmet-async) | ✅ Configurado |
| **Status HTTP 200 nativo (GitHub Pages)** | ✅ **v10.41.0** — todas as 23 rotas do sitemap agora servem `index.html` físico, retornando 200 em vez de 404 |

---

## 9. ASSETS E MÍDIA

### 9.1 Imagens

| Categoria | Quantidade | Tamanhos | Status |
|---|---|---|---|
| **Banners** (Home) | 4 PNGs | ~2.3MB cada | ✅ Completo |
| **Personagens** | **10 PNGs oficiais** (Kim, Jack, Nina, Helena, Yawanari, Kronos, Shuntaro, Lisa, VoidHunter, Alan) | ~115KB-2.3MB cada | ✅ **Completo** — artes oficiais de todos os 10 personagens |
| **Episódios Webtoon** | 2 thumbnails (`thumb-ep00.png`, `thumb-ep01.png`) | ~270KB cada | ✅ Completo (Ep.00 e Ep.01) |
| **Livro** | 3 capas oficiais (`capitulo-01.png`~`capitulo-03.png`) | ~115KB cada | ✅ Capas dos 3 capítulos publicados |
| **Logos** | 2 PNGs (PT/EN) | ~159KB cada | ✅ Completo |
| **Música** | 16 capas randomizadas (`01.png`~`16.png`) | ~150-240KB cada | ✅ Randomizado por visita |
| **Tamagoshi** | **7 sprites** (Kroniki) | ~137KB cada | 🔴 **1 de 30 criaturas** |
| **Cards** (Top Trumps) | Artes oficiais 1ª temporada (no jogo) | ✅ Completo |
| **Cards** (Duelo) | Nenhum | — | 🔴 **0** |

### 9.2 Fontes

| Fonte | Arquivo | Status |
|---|---|---|
| BringRace | `BringRace.otf` | ✅ Completo |

### 9.3 Músicas

| Info | Valor |
|---|---|
| Total de faixas | **36 faixas** (32 únicas) no catálogo |
| Faixas publicadas | **36/36** — todas com links reais para plataformas |
| Capas | **16 imagens** randomizadas a cada visita (`01.png`~`16.png`) |
| Plataformas | Spotify, YouTube, Apple Music, Amazon, Deezer, Tidal, TikTok, iTunes |

---

## 10. INTERNACIONALIZAÇÃO (i18n)

### 10.1 Arquivos de Tradução

| Arquivo | Tamanho | Status |
|---|---|---|
| `pt.json` (Site PT) | ~117KB | ✅ Completo |
| `en.json` (Site EN) | ~111KB | ✅ Completo |
| `es.json` (Site ES) | ~117KB | ✅ Completo |
| `pp_pt.json` (PP PT) | ~6.6KB | ✅ Completo |
| `pp_en.json` (PP EN) | ~6.3KB | ✅ Completo |
| `pp_es.json` (PP ES) | ~6.6KB | ✅ Completo |
| `arena-trash-en.json` | ~20.5KB | ✅ Falas trash talk EN |
| `arena-trash-es.json` | ~20.7KB | ✅ Falas trash talk ES |
| `cardLabels.js` | ~1.3KB | ✅ Rótulos de cartas i18n |

### 10.2 Status de Tradução por Área

| Área | PT | EN | ES |
|---|---|---|---|
| Site institucional | ✅ Completo | ✅ ~95% | ✅ ~95% |
| Pesadelo Particular | ✅ Completo | ✅ Completo | ✅ Completo |
| Livro (capítulos 1-3) | ✅ Completo | ✅ Completo | ✅ Completo |
| Livro (capítulos 4-16) | ✅ Completo | 🔴 **Não trad.** | 🔴 **Não trad.** |
| Personagens | ✅ Completo | ✅ Completo | ✅ Completo |
| Mundo/Lore | ✅ Completo | ✅ Completo | ✅ Completo |
| Supertrunfo (105 cartas) | ✅ Completo | ✅ Completo | ✅ Completo |
| Quiz | ✅ Completo | ✅ Parcial | ✅ Parcial |

### 10.3 Auditoria de Chaves i18n (2026-06-09)

```
═══════════════════════════════════
AUDITORIA I18N — RELATÓRIO
═══════════════════════════════════

CHAVES SOLTAS ENCONTRADAS:
- /games/pesadelo: pp.menu.selecione_slot — corrigida ✅
- /games/pesadelo: pp.menu.slot_label — corrigida ✅
- /games/pesadelo: pp.menu.slot_vazio — corrigida ✅

CHAVES FALTANDO EM ALGUM IDIOMA:
- pp.menu.selecione_slot: faltava em PT/EN/ES — adicionada ✅
- pp.menu.slot_label: faltava em PT/EN/ES — adicionada ✅
- pp.menu.slot_vazio: faltava em PT/EN/ES — adicionada ✅

CORREÇÃO ADICIONAL:
- locales.js não importava pp_*.json — merge implementado ✅
- Todas as chaves pp.* agora são resolvidas via LanguageContext ✅

ROTAS VERIFICADAS (sem problemas):
- /, /games, /personagens, /livro, /webtoon, /musicas
- /mundo, /assinar, /loja, /perfil, /leaderboard, /autor
- /games/pesadelo, /games/ldi, /games/jackcandy
- /games/ldi-arena, /games/ldi-tatics, /games/duelo
- /games/tamagoshi, /games/minigames, /games/toptrumps

TOTAL DE CORREÇÕES: 6 (3 keys novas × 3 idiomas + 1 merge em locales.js)
STATUS: ✅ limpo
═══════════════════════════════════
```

---

## 11. TABELA RESUMO DE COMPLETUDE

### 11.1 Por Área Funcional

| Área | % | Status | Observação |
|---|---|---|---|
| **Infraestrutura** (build, deploy, domínio, SEO) | 98% | 🟢 | sw.js é placeholder; pré-renderização estática cobre 26 rotas (v10.41.1) |
| **Site Institucional** (Home, páginas, componentes) | 95% | 🟢 | Quase finalizado |
| **Sistema de Contas** (Login, Cadastro, Perfil, Admin) | 95% | 🟢 | Completo |
| **Pagamentos** (Stripe, Assinaturas, Loja Digital) | 90% | 🟢 | Stripe funcional |
| **Pesadelo Particular** | 95% | 🟢 | Mais completo de todos |
| **Lendas do LDI** (RPG narrativo) | 90% | 🟢 | 4 acts de cenas |
| **Jack Dream Beer** (idle noir) | 90% | 🟢 | Jogo completo |
| **MiniGames** (8 jogos) | 90% | 🟢 | Todos funcionais |
| **Top Trumps** (Single) | 100% | 🟢 | Finalizado, balanceado, artes oficiais |
| **Top Trumps** (Multiplayer) | 75% | 🟡 | Finalizado, testes de matchmaking |
| **Arena LDI** (combate CPU) | 87% | 🟡 | 8 inimigos, SFX, auto-scroll, exit btn |
| **Arena LDI Tatics** (tático) | 80% | 🟡 | Motor completo, balanceamento WIP |
| **Duelo LDI — Campo de Batalha** (grid 10×10) | 99% | 🟢 | v2.7.1 — fix TELEPORT: fluxo completo (selecionar monstro → escolher destino → teleportar) |
| **Tamagoshi LDI** | 95% | 🟢 | Código finalizado ✅. Pendente: sprites para 28 criaturas (Kroniki + Ninka prontos) |
| **Livro** (conteúdo PT) | 100% | 🟢 | 16/16 capítulos escritos |
| **Livro** (publicação) | 19% | 🔴 | Só 3/16 publicados |
| **Livro** (traduções EN/ES) | 19% | 🔴 | Só cap.1-3 traduzidos |
| **Webtoon** (conteúdo) | 10% | 🔴 | Só Ep.00 existe |
| **Arte Personagens** | 100% | 🟢 | 10/10 com artes oficiais |
| **Sprites Tamagoshi** | 3% | 🔴 | 1/30 criaturas com sprite |
| **Arte Cartas** (Top Trumps) | 100% | 🟢 | 105 cartas da 1ª temporada com artes oficiais |
| **Arte Cartas** (Duelo) | 0% | 🔴 | 60 cartas sem arte (WIP) |
| **Músicas** (catálogo) | 100% | 🟢 | 36 faixas, todas publicadas com links + 16 capas randomizadas |

### 11.2 Por Tipo de Trabalho

| Tipo de Trabalho | % | Descrição |
|---|---|---|
| **Engenharia/Código** (telas, lógica, stores, API) | **92%** | Quase todo o código está escrito |
| **Conteúdo Textual** (diálogos, lore, livro PT) | **85%** | Muito conteúdo já produzido |
| **Conteúdo Traduzido** (EN/ES) | **55%** | **Site+Jogos 100%** (1318 chaves confirmadas) | Livro caps 4-16 sem tradução |
| **Arte/Assets** (sprites, imagens, cartas) | **50%** | Top Trumps com artes oficiais (105/105), demais WIP |
| **Publicação** (capítulos do livro) | **19%** | Conteúdo existe, não publicado |
| **Balanceamento/Testes** (jogos) | **68%** | Top Trumps finalizado+balanceado, demais WIP |

### 11.3 Estimativa Geral

```
████████████████████████████████████████████████░░  ~82% COMPLETO
```

---

## 12. ANÁLISE DE GARGALOS

### 🔴 Gargalo #1: ARTES E SPRITES (0-50%)
**Impacto:** Crítico — afeta Tamagoshi e Cartas Duelo

| Item | Status | Impacto |
|---|---|---|
| Sprites Tamagoshi (29/30 faltando) | 🔴 3% | Jogo funcional sem arte visual |
| Artes de personagens | 🟢 100% | 10/10 personagens com artes oficiais |
| Artes de cartas Top Trumps (105) | 🟢 100% | Artes oficiais da 1ª temporada |
| Artes de cartas Duelo (60 sem arte) | 🔴 0% | Cartas sem identidade visual |
| Capas de música | ✅ 16 capas | Randomizadas por visita, todas as faixas têm capa |

### 🔴 Gargalo #2: CONTEÚDO DO LIVRO NÃO PUBLICADO
**Impacto:** Médio — conteúdo já existe, só não está visível

| Item | Status |
|---|---|
| 13 capítulos PT escritos mas não publicados | ✅ Conteúdo pronto |
| Basta mudar `publicado: false` → `true` | ⏱️ 5 minutos de trabalho |
| Mas precisa ter sentido de cronograma de lançamento | 📋 Decisão editorial |

### 🔴 Gargalo #3: TRADUÇÕES DO LIVRO (EN/ES)
**Impacto:** Médio — necessário para audiência internacional

| Item | Esforço Estimado |
|---|---|
| Traduzir 13 capítulos (PT→EN) | ~26.000 palavras = ~40-60h |
| Traduzir 13 capítulos (PT→ES) | ~26.000 palavras = ~35-50h |
| **Total** | **~75-110h de tradução** |

### 🔴 Gargalo #4: WEBTOON
**Impacto:** Alto — formato principal de consumo visual

| Item | Esforço Estimado |
|---|---|
| Apenas Ep.00 (21 páginas) existe | Precisa de vários episódios |
| Cada episódio = arte + roteirização | ~40-80h por episódio |

### 🟡 Gargalo #5: BALANCEAMENTO DE JOGOS
**Impacto:** Médio — jogos funcionais mas não refinados

| Jogo | O Que Falta |
|---|---|
| Arena Tatics | Balanceamento de 20 personagens, 6 classes, habilidades |
| Duelo LDI | Expandir baralho além de 60 cartas |
| Top Trumps MP | Finalizar testes de matchmaking |
| Arena LDI | Mais inimigos, melhor balanceamento |

### 🟡 Gargalo #6: POLIMENTO UI/UX
**Impacto:** Baixo-Médio — cosmético

| Área | O Que Falta |
|---|---|
| Animações de transição | Melhorar em telas de jogo |
| Responsividade mobile | Testar em mais dispositivos |
| Acessibilidade | Melhorar contraste, aria-labels |

---

## 13. PLANO DE AÇÃO RECOMENDADO

### Fase 1 — ⚡ Quick Wins (1-2 dias)

| Tarefa | Esforço | Impacto |
|---|---|---|
| **Publicar capítulos 4-16 do livro** (PT) | 5 min | 🟢 Alto — libera 81% do livro |
| **Adicionar mais faixas ao catálogo** | 10 min | 🟢 Médio |
| **Revisar e corrigir bugs menores** | 2-4h | 🟢 Médio |
| **Atualizar SITE_MAP.md com versões corretas** | 15 min | 🟢 Médio |

### Fase 2 — 🎨 Artes (1-2 semanas)

| Tarefa | Esforço | Impacto |
|---|---|---|
| **Criar sprites para as 30 criaturas Tamagoshi** | 20-40h | 🔴 Crítico — desbloqueia jogo |
| **Criar artes dos 9 personagens principais** | ✅ **CONCLUÍDO** — 10 personagens com artes oficiais |
| **Criar template visual para cartas** | 5-10h | 🟡 Alto — reutilizável |

### Fase 3 — 🌐 Traduções (2-4 semanas)

| Tarefa | Esforço | Impacto |
|---|---|---|
| **Traduzir capítulos 4-16 do livro para EN** | 40-60h | 🟡 Alto — audiência global |
| **Traduzir capítulos 4-16 do livro para ES** | 35-50h | 🟡 Alto — audiência global |

### Fase 4 — 🎮 Balanceamento (1-2 semanas)

| Tarefa | Esforço | Impacto |
|---|---|---|
| **Balancear classes e combate do Tatics** | 15-20h | 🟡 Alto |
| **Expandir baralho do Duelo (+40 cartas)** | 8-15h | 🟡 Alto |
| **Testar e finalizar multiplayer Top Trumps** | 10-15h | 🟡 Médio |

### Fase 5 — 📖 Conteúdo Novo (2-4 semanas)

| Tarefa | Esforço | Impacto |
|---|---|---|
| **Produzir mais episódios do Webtoon** | 40-80h/ep | 🔴 Alto |
| **Criar mais cenas para o LDI RPG** | 15-25h | 🟡 Médio |

---

## 14. ESTIMATIVA DE ESFORÇO PARA FINALIZAÇÃO

| Fase | Descrição | Horas Estimadas | Prioridade |
|---|---|---|---|
| 1 | Quick Wins (publicar livro, bugs, links) | **~3h** | ⚡ Imediata |
| 2 | Artes (sprites, personagens, cartas) | **40-75h** | 🔴 Crítica |
| 3 | Traduções EN/ES do livro | **75-110h** | 🟡 Alta |
| 4 | Balanceamento de jogos | **33-50h** | 🟡 Alta |
| 5 | Webtoon + conteúdo novo | **100h+** | 🔴 Alta |
| **Total Estimado** | | **~250-340 horas** | |

### Se Forçarmos Prioridades (Roadmap Enxuto)

| Entrega | Conteúdo | Tempo |
|---|---|---|
| **MVP Finalizado** | Publicar livro PT, sprites Tamagoshi, polimento | ~60h |
| **v10.0** | MVP + Traduções EN + 2 personagens com arte | ~120h |
| **v11.0** | 10.0 + Balanceamento completo + Webtoon Ep.01 | ~200h |
| **v12.0 (Final)** | Tudo completo + Webtoon em dia | ~340h |

---

## RESUMO FINAL

```
🏗️ ENGENHARIA/CÓDIGO:    92% ████████████████████████████████████████░░░░
📝 CONTEÚDO TEXTUAL PT:  85% ███████████████████████████████████████░░░░░
🌐 TRADUÇÕES EN/ES:      55% ██████████████████████████░░░░░░░░░░░░░░░░░  — Site+Jogos 100% ✅ | Livro caps 4-16: 0% 🔴
🎨 ARTES/SPRITES:        50% ██████████████████████████░░░░░░░░░░░░░░░░░
📖 PUBLICAÇÃO LIVRO:     19% ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
🎮 BALANCEAMENTO JOGOS:  68% ██████████████████████████████████░░░░░░░░░
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 GERAL:                ~82% ████████████████████████████████████████░░░░
```

**A engenharia e o esqueleto do site estão 92% prontos.**  
**Top Trumps está 100% completo — Single finalizado, balanceado, com artes oficiais da 1ª temporada.**  
**O que falta agora é majoritariamente CONTEÚDO VISUAL (personagens, sprites Tamagoshi, cartas Duelo) e PUBLICAÇÃO (livro, traduções, webtoon).**

O código fonte está sólido. Faltam assets e decisões de cronograma de lançamento.

> 🗓️ **Lançamento oficial da plataforma marcado para 14 de Setembro de 2026**

---

*Relatório gerado em 2026-06-11 — v2.56 — por GitHub Copilot (DeepSeek V4 Flash)*
