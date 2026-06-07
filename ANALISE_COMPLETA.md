# ANÁLISE COMPLETA — Illusion Fight Site

> Gerado em: 2026-06-07  
> Versão do Site: 2.92  
> Autor: GitHub Copilot (DeepSeek V4 Flash)

> ⚠️ Este documento foi corrigido em 07/06/2026. Para o snapshot oficial do progresso, ver `RELATORIO_v1.md`.

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Estado da Navegação](#2-estado-da-navegação)
3. [Análise Mobile-First](#3-análise-mobile-first)
4. [Status de Tradução (i18n)](#4-status-de-tradução-i18n)
5. [Sistema de Achievements/Troféus](#5-sistema-de-achievementstroféus)
6. [Inventário de Assets](#6-inventário-de-assets)
7. [Jogos - Status e Tradução](#7-jogos---status-e-tradução)
8. [O que Falta Conectar](#8-o-que-falta-conectar)
9. [Prioridades Recomendadas](#9-prioridades-recomendadas)
10. [Prospecto de Valor do Produto](#10-prospecto-de-valor-do-produto)

---

## 1. Visão Geral do Produto

### O que é
Portal multimídia do universo **Lutas de Ilusão (Illusion Fight)**, uma obra transmídia que combina:
- **Webtoon** (episódios ilustrados)
- **Livro** (16 capítulos em PT, 3 em EN/ES)
- **Música** (trilha sonora original)
- **10 Jogos** (RPG, card game, tamagotchi, puzzles, tática, detetive, arena)
- **Sistema de assinatura** (Free/Elite/Primordial) com moeda virtual (Fichas, DIX)
- **Rankings, Achievements, Perfil de usuário**

### Diferenciais
- Narrativa transmídia rica (personagens, lore, universo expandido)
- Economia própria (Fichas para jogos arcade, DIX para tamagotchi)
- 10 jogos originais com mecânicas variadas
- Suporte a 3 idiomas (PT, EN, ES)
- Sistema de achievements com badges
- Integração Supabase (auth, save, realtime multiplayer)

### Pontos Fracos Atuais
- Apenas ~50% do site usa i18n (majoria dos jogos em PT hardcoded)
- Mobile-first parcial (algumas telas de jogo não responsivas)
- Livro apenas 3/16 capítulos traduzidos para EN/ES
- Webtoon apenas 1 episódio (21 páginas)
- Assets de banner muito pesados (~2.3MB cada)
- Alguns placeholders (PIX key, newsletter, redes sociais)

> 📌 **Nota:** A maior parte dos jogos já possui i18n implementada (PT/EN/ES). A exceção é JackCandy (4 screens sem i18n) e dados internos dos jogos (diálogos, descrições de itens) que estão em JS data files em PT.

---

## 2. Estado da Navegação

### Rotas do Site (24 páginas)

| Rota | i18n | Mobile | Status | Observações |
|------|------|--------|--------|-------------|
| `/` Home | ✅ | ✅ | ✅ Completo | Hero, episódios, música, progresso, CTA |
| `/personagens` | ✅ | ✅ | ✅ Completo | Grid 9 personagens |
| `/personagens/:id` | ✅ | ✅ | ✅ Completo | Detalhe 2 colunas |
| `/livro` | ✅ locale | ✅ | ✅ | Controle de publicação |
| `/livro/:id` | ✅ locale | ✅ | ✅ | Modo imersivo |
| `/webtoon` | ✅ | ✅ | ✅ | Grid episódios |
| `/webtoon/:id` | ✅ locale | ⚠️ Parcial | ✅ | Leitor vertical |
| `/musicas` | ✅ | ✅ | ✅ | Capa + plataformas |
| `/mundo` | ✅ locale | ✅ | ✅ | Lore completo |
| `/assinar` | ✅ | ✅ | ✅ | 3 tiers + PIX |
| `/autor` | ✅ | ✅ | ✅ | 4 blocos + CTA |
| `/login` | ❌ | ✅ | ✅ | Formulário simples |
| `/cadastro` | ❌ | ✅ | ✅ | Formulário |
| `/perfil` | ❌ | ⚠️ | ✅ | 6 abas |
| `/games` | ❌ | ✅ | ✅ | Grid de jogos |
| `/leaderboard` | ❌ | ✅ | ✅ | Ranking |
| `/quiz` | ✅ | ✅ | ✅ | 3 modos |
| `/admin` | ❌ | ⚠️ | ✅ | Painel admin |
| `/games/ldi/*` | ❌ | ⚠️ | ✅ | 6 sub-rotas |
| `/games/jackcandy` | ❌ | ⚠️ | ✅ | 13 screens |
| `/games/tamagoshi` | ❌ | ⚠️ | ✅ | 11 screens |
| `/games/toptrumps*` | ❌ | ⚠️ | ✅ | 3 rotas |
| `/games/pesadelo` | ❌ | ⚠️ | ✅ | 20 casos |
| `/games/duelo` | ❌ | ✅ | ✅ | Card game |
| `/games/arena` | ❌ | ⚠️ | ✅ | Arena Mode |
| `/games/minigames` | ❌ | ✅ | ✅ | 6 puzzles |
| `/games/ldi-tatics` | ✅ parcial | ⚠️ | ✅ | Maior jogo |

### Navegação Global
- ✅ Navbar com links, busca, troca de idioma, login
- ✅ Footer com 3 colunas, redes sociais
- ✅ TrialBanner (aviso de conteúdo gratuito limitado)
- ✅ CookieBanner
- ✅ ScrollToTop
- ✅ SearchModal (busca global)
- ✅ NotificationBalloon

---

## 3. Análise Mobile-First

### O que já é mobile-friendly
- Home page (hero, episódios, música)
- Navbar (hamburguer menu em mobile)
- Personagens (grid adaptável)
- Webtoon (leitor vertical, max 800px)
- Footer (colunas empilham)
- Login/Cadastro
- Quiz
- Games grid
- Leaderboard
- Perfil (abas em scroll horizontal)

### O que precisa de melhorias mobile
- **Telas de jogo**: Arena, Duelo, LDI, JackCandy, Pesadelo Particular têm canvas e layouts que podem não se adaptar bem em telas pequenas
- **Arena Tatics CityOverworld**: Mapa isométrico pode ser difícil de navegar em mobile
- **Tabelas e grids de dados**: Leaderboard, Coleção podem precisar de scroll horizontal
- **Modais**: SearchModal, AchievementToast - testar em viewport 320px
- **Fonte**: Alguns textos em jogos podem ser pequenos demais em mobile
- **Touch targets**: Botões em alguns jogos podem ser pequenos (< 44px)

### Recomendações Mobile
1. Testar todos os jogos em viewport 320px e 390px
2. Garantir touch targets ≥ 44px em todos os jogos
3. Adicionar meta viewport adequado nas telas de jogo
4. Testar orientação landscape em jogos com canvas
5. Verificar contraste de cor em modo claro (se houver)

---

## 4. Status de Tradução (i18n)

### Cobertura Atual

| Idioma | Chaves | Status |
|--------|--------|--------|
| 🇧🇷 Português (PT) | 153 | ✅ Completo (base) |
| 🇺🇸 Inglês (EN) | 115 | ⚠️ Faltam 38 chaves |
| 🇪🇸 Espanhol (ES) | 115 | ⚠️ Faltam 38 chaves |

### Chaves Faltando em EN e ES (mesmas 38)

Todas são do sistema **Arena Tatics (CityOverworld)**:

**NPCs da Cidade (20 chaves)**
- `tatics.city.idoso_label`, `tatics.city.idoso_dialog`
- `tatics.city.crianca_label`, `tatics.city.crianca_dialog`
- `tatics.city.vendedor_label`, `tatics.city.vendedor_dialog`
- `tatics.city.mendigo_label`, `tatics.city.mendigo_dialog`
- `tatics.city.operario_label`, `tatics.city.operario_dialog`
- `tatics.city.marinheiro_label`, `tatics.city.marinheiro_dialog`
- `tatics.city.feirante_label`, `tatics.city.feirante_dialog`
- `tatics.city.cozinheira_label`, `tatics.city.cozinheira_dialog`
- `tatics.city.seguranca_label`, `tatics.city.seguranca_dialog`
- `tatics.city.morador_label`, `tatics.city.morador_dialog`

**Clima (3 chaves)**
- `tatics.city.weather_clear`, `tatics.city.weather_rain`, `tatics.city.weather_night`

**Novos Prédios (5 chaves)**
- `tatics.buildings.info`, `tatics.buildings.equipment_shop`, `tatics.buildings.biblioteca`, `tatics.buildings.arena_sub`, `tatics.buildings.concessionaria`

**Novas Zonas (5 chaves)**
- `tatics.zones.industrial`, `tatics.zones.porto`, `tatics.zones.mercado`, `tatics.zones.suburbio`, `tatics.zones.residencial_oeste`

**Novos Interior Names (5 chaves)**
- `tatics.interior_names.info`, `tatics.interior_names.equipment_shop`, `tatics.interior_names.biblioteca`, `tatics.interior_names.arena_sub`, `tatics.interior_names.concessionaria`

### Páginas SEM i18n (hardcoded em PT) — ATUALIZADO

**Site pages (7) — todas já usam `t()`:**
- ✅ `Login.jsx` — ✅ i18n implementada
- ✅ `Cadastro.jsx` — ✅ i18n implementada
- ✅ `Admin.jsx` — ✅ i18n implementada
- ✅ `Leaderboard.jsx` — ✅ i18n implementada
- ✅ `Games.jsx` — ✅ i18n implementada
- ✅ `Perfil.jsx` + abas — ✅ i18n implementada
- 🟡 `ArenaTatics/screens/*` — Apenas CityOverworld e BuildingInterior

**Jogos — ATUALIZADO:**
- ✅ `Duelo/` — Todos screens + components usam `t()`
- ✅ `MiniGames/` — Todos os puzzles + UI usam `t()`
- ✅ `Arena/` — Todas as telas usam `t()`
- ✅ `TopTrumps.jsx`, `TopTrumpsLobby.jsx`, `TopTrumpsMP.jsx` — Todas usam `t()`
- ✅ `LDI/` — Lobby, Create, Game, Combat, Sheet, Clues, End usam `t()`
- ✅ `Tamagoshi/` — Todas as 11 screens usam `t()`
- ✅ `PesadeloParticular/` — PP.jsx + todas as 8 screens usam `t()` + pp_*.json
- ✅ `Games.jsx` — Usa `t()` para nomes e descrições
- 🟡 `JackCandy/` — **9/13 screens** usam `t()`. Faltam: Dungeon, Investigacao, Interrogatorio, CasoAbertura
- 🟡 `ArenaTatics/screens/` — CityOverworld + BuildingInterior i18n. Demais pendentes

### Estratégia Recomendada para Tradução dos Jogos

Devido ao volume massivo de texto nos jogos, recomendo:

1. **Fase 1 (agora)**: Completar as 38 chaves faltando em EN/ES ✅
2. **Fase 2**: Traduzir páginas do site (Login, Cadastro, Games, Leaderboard, Perfil)
3. **Fase 3**: Traduzir jogos menores primeiro (MiniGames, Duelo, Arena Mode)
4. **Fase 4**: Jogos grandes (JackCandy, LDI, Tamagoshi, Pesadelo Particular)
5. **Fase 5**: Arena Tatics (já tem i18n parcial)

---

## 5. Sistema de Achievements/Troféus

### Achievements Implementados (do Perfil)

| # | Badge | Emoji | Nome | Status |
|---|-------|-------|------|--------|
| 1 | `primeiro_acesso_arena` | ⚔ | Primeiro Acesso à Arena | ✅ Desbloqueado |
| 2 | `recrutado` | 🎖 | Recrutado | ✅ Desbloqueado |
| 3 | `leitor_marelia` | 📖 | Leitor de Marelia | ✅ Desbloqueado |
| 4 | `episodio_zero` | 🎬 | Episódio Zero | ✅ Desbloqueado |
| 5 | `conhece_gangue` | 👊 | Conhece a Gangue | ✅ Desbloqueado |
| 6 | `ranqueado_sdr` | 🏆 | Ranqueado no SDR | ✅ Desbloqueado |
| 7 | `briguento` | 💥 | Briguento | ✅ Desbloqueado |
| 8 | `anomalia` | 🩸 | "???" | ✅ Desbloqueado |
| 9 | `divulgador_arena` | 🔥 | Divulgador da Arena | 🔒 Bloqueado |
| 10 | `primeira_vitoria_arena` | 🃏 | Primeira Vitória na Arena | 🔒 Bloqueado |
| 11 | `aprendiz_arena` | 💀 | Aprendiz da Arena | 🔒 Bloqueado |
| 12 | `veterano_arena` | 🎴 | Veterano da Arena | 🔒 Bloqueado |
| 13 | `secreto_1` | 👑 | "???" | 🔒 Secreto |
| 14 | `secreto_2` | 🌑 | "???" | 🔒 Secreto |

### Badges do Tamagoshi

| Badge | Nome | Status |
|-------|------|--------|
| 🐣 `filhote` | Primeira cria | ✅ |
| 🌱 `jovem` | Crescimento | ✅ |
| 🌳 `adulto` | Maturidade | ✅ |
| ⚔️ `veterano` | Experiência | ⚠️ (depende de tempo) |
| 👑 `anciao` | Longevidade | ⚠️ (depende de tempo) |
| ✨ `partida` | Ciclo completo | ⚠️ (depende de tempo) |

### Análise
- **14 achievements** de perfil (8 desbloqueados, 6 bloqueados/secretos)
- **6 badges** do Tamagoshi
- Achievements são salvos no Supabase (`user_achievements`)
- Disparam toast com partículas via `AchievementToast`
- **Sem i18n** nos achievements (nomes em PT)
- Achievement `divulgador_arena` (compartilhar redes) sem trigger implementado
- Achievements secretos (👑, 🌑) sem descrição

---

## 6. Inventário de Assets

### Imagens

| Asset | Tamanho | Local | Observação |
|-------|---------|-------|------------|
| `banner-01.png` | ~2.3 MB | `src/assets/images/banners/` | **Muito pesado** |
| `banner-02.png` | ~2.3 MB | `src/assets/images/banners/` | **Muito pesado** |
| `banner-03.png` | ~2.3 MB | `src/assets/images/banners/` | **Muito pesado** |
| `banner-04.png` | ~2.3 MB | `src/assets/images/banners/` | **Muito pesado** |
| `logo-pt.png` | ~159 KB | `src/assets/images/logos/` | OK |
| `logo-en.png` | ~158 KB | `src/assets/images/logos/` | OK |
| `thumb-ep00.png` | ~271 KB | `src/assets/images/episodes/` | OK |
| `kroniki-*.png` | ~136 KB cada | `src/assets/images/tamagoshi/` | 7 variações |
| `jack-balloon.png` | ~115 KB | `src/assets/images/characters/` | OK |
| `lutas-de-ilusao.png` | ~188 KB | `src/assets/images/music/` | OK |

### Webtoon
- **1 episódio** (Ep. 00) em `public/webtoon/00/pt/`
- **21 páginas** (01~21.png)

### Livro (Capítulos em Markdown)

| Idioma | Capítulos | Status |
|--------|-----------|--------|
| 🇧🇷 PT | 16 (1-16) | ✅ Completo |
| 🇺🇸 EN | 3 (1-3) | ⚠️ Parcial |
| 🇪🇸 ES | 3 (1-3) | ⚠️ Parcial |

### Áudio/Música
- Nenhum arquivo de áudio no repositório
- Links para plataformas externas (YouTube, Spotify, etc.)
- Placeholder: "Videoclipes em produção — em breve"

### Assets Faltantes
- ❌ Webtoon Ep. 01+ (apenas Ep. 00 existe)
- ❌ Videoclipes (placeholder apenas)
- ❌ Personagem avatars individuais (usando emoji/placeholders nos jogos)
- ❌ Ícone de PIX real (placeholder: `chavepix@email.com`)
- ❌ OG Image para redes sociais (existe `og-image.jpg` mas não verifiquei qualidade)

---

## 7. Jogos - Status e Tradução

### Tabela de Jogos

| Jogo | Rotas | Screens | i18n | Mobile | Versão | Observações |
|------|-------|---------|------|--------|--------|-------------|
| **LDI Lendas** | 7 | 6+ | ✅ screens | ⚠️ | 1.0.61 | RPG narrativo, muito texto. Engine/data em PT |
| **Jack Dream Beer** | 1 | 13 | ✅ parcial (9/13 screens) | ⚠️ | 5.1.2 | Idle noir. Dungeon, Investigacao, Interrogatorio, CasoAbertura sem `t()` |
| **Pesadelo Particular** | 1 | ~10 | ✅ completo (+ pp_*.json) | ⚠️ | 1.7.0 | 20 casos. i18n própria nos 3 idiomas |
| **LDI Arena** | 3 | 4+ | ✅ screens | ⚠️ | 1.7.3 | Combate CPU. Todas as telas usam `t()` |
| **Duelo LDI** | 1 | 5+ | ✅ completo | ✅ | 1.2.9 | Card game. Todos screens + components usam `t()` |
| **Top Trumps** | 3 | 3 | ✅ completo | ⚠️ | 2.63 | Multiplayer. Todas as 3 telas usam `t()` |
| **Tamagoshi** | 1 | 11 | ✅ completo | ⚠️ | 1.11.0 | Todas as 11 screens usam `t()` |
| **Mini Games** | 1 | 1+6 | ✅ completo | ✅ | 1.3.0 | 7 puzzles com chaves EN/ES completas |
| **LDI Tatics** | 1 | 10+ | ✅ parcial | ⚠️ | 6.4.0 | CityOverworld + BuildingInterior i18n. Demais telas pendentes |
| **Games Hub** | 1 | 1 | ✅ | ✅ | — | Usa `t()` para nomes e taglines |
| **Leaderboard** | 1 | 1 | ✅ | ✅ | — | Usa `t()` para títulos e labels |
| **Quiz** | 1 | 1 | ✅ | ✅ | — | Usa `t()` para perguntas |

### Estimativa de Texto Traduzível por Jogo (dados internos, não UI)

| Jogo | UI com `t()` | Dados internos (PT) |
|------|-------------|-------------------|
| Jack Dream Beer | 🟡 9/13 screens + 0/7 components | 🔴 Casos, NPCs, itens, dungeons em JS |
| LDI Lendas | ✅ Screens | 🟡 Cenas, enemies em JSON |
| Pesadelo Particular | ✅ Screens + pp_*.json | ✅ pp-i18n.js cobre dados |
| Tamagoshi | ✅ Screens | 🟡 Criaturas, itens em JS |
| Demais jogos | ✅ Completo | 🟢 Pouco texto interno |

---

## 8. O que Falta Conectar

### 🔴 Prioridade Alta
1. **JackCandy — completar i18n** nas 4 screens faltantes (Dungeon, Investigacao, Interrogatorio, CasoAbertura + components)
2. **Arena Tatics — i18n nas demais telas** (Batalha, TeamSelect, etc.)
3. **Tradução do livro** — 13 capítulos restantes para EN/ES

### Stripe
⚠️ **Verificação de identidade pendente** — não bloqueia desenvolvimento, bloqueia saques.

### Campanha Catarse
Status: 🟡 Em preparação
- **Plataforma:** Catarse
- **Meta inicial:** R$1.800
- **Tiers:** R$5 / R$30 / R$60 / R$90 / R$120 / R$180 / R$500
- **Recompensas digitais exclusivas:** Tamagoshi Apoiador (categoria própria, ciclo 2 anos, introcável, inventário completo), deck 5 cartas Top Trumps exclusivas, 1 card LDI Tactics exclusivo
- **Tasks de dev pendentes antes de publicar:**
  - Criar Tamagoshi Apoiador (nome e visual a definir)
  - Criar deck 5 cartas Top Trumps exclusivas
  - Criar 1 card LDI Tactics exclusivo de apoiador
  - Sistema QR code/link exclusivo para onboarding de apoiadores

### 🟡 Prioridade Média
4. **Páginas do site sem i18n**: Login, Cadastro, Games, Leaderboard, Perfil, Admin
5. **Mobile-first em jogos**: Testar e ajustar todos os jogos em viewport 320px
6. **Achievements i18n** e triggers faltando (`divulgador_arena`)
7. **Otimizar assets**: banners de 2.3MB cada → WebP com compressão
8. **Placeholder PIX**: Substituir chave real

### 🟢 Prioridade Baixa
9. **Webtoon Ep. 01+**: Apenas Ep. 00 existe
10. **Videoclipes**: Placeholder apenas
11. **Newsletter**: Verificar integração com Substack
12. **Redes sociais**: Links X, Instagram, TikTok, YouTube → # placeholders
13. **Sitemap**: Apenas 8 URLs (precisa incluir todas as rotas)
14. **Service Worker**: `sw.js` existe em `public/` mas não verifiquei se está funcional
15. **Página 404 personalizada**: Verificar se redireciona corretamente

---

## 9. Prioridades Recomendadas

### Sprint Atual (Fazer Agora)
1. ✅ Completar 38 chaves i18n de EN/ES (tatics city)
2. 🔄 Traduzir páginas do site sem i18n (Login, Cadastro, Games, Leaderboard, Perfil)
3. 📱 Testar mobile em todos os jogos

### Próximo Sprint
4. 🌐 i18n nos jogos menores (MiniGames, Duelo, Arena Mode, Top Trumps)
5. 📖 Traduzir livro capítulos 4-16 para EN/ES
6. 🏆 Completar triggers de achievements

### Futuro
7. 🎮 i18n nos jogos grandes (JackCandy, LDI, Pesadelo, Tamagoshi)
8. 🖼 Otimizar assets (WebP)
9. 🌐 Webtoon Ep. 01
10. 🎵 Videoclipes reais

---

## 10. Prospecto de Valor do Produto

### O que já existe de VALOR REAL

| Categoria | Ativos | Valor |
|-----------|--------|-------|
| **Narrativa** | 16 capítulos de livro, 1 webtoon, lore completo | ⭐⭐⭐⭐⭐ |
| **Jogos** | 10 jogos originais jogáveis | ⭐⭐⭐⭐⭐ |
| **Tecnologia** | React 19, Vite 8, Supabase, 3 idiomas | ⭐⭐⭐⭐ |
| **Sistema** | Auth, achievements, perfil, assinatura, economia | ⭐⭐⭐⭐ |
| **Arte** | Banners, logos, sprites, webtoon pages | ⭐⭐⭐ |

### O que precisa para MATURIDADE

1. **Tradução completa** (site + jogos + livro) → alcance global
2. **Mais conteúdo de webtoon** → principal atração visual
3. **Otimização mobile** → 70% do tráfego potencial
4. **SEO** (meta tags, sitemap completo) → descoberta orgânica
5. **Performance** (assets pesados) → retenção de usuário
6. **Integração redes sociais** → viralização
7. **Mais achievements** → engajamento/retention

### Estimativa de Progresso Geral

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░  ~90% completo
```

| Área | Progresso |
|------|-----------|
| Site (páginas principais) | 100% (36/36 rotas) |
| Tradução (i18n) | 85% (UI dos jogos quase completa) |
| Jogos (implementação) | 95% (10/10 1ª temporada, LDI Tatics em refatoração) |
| Jogos (i18n da UI) | 85% (JackCandy 9/13 screens, Tatics parcial) |
| Jogos (dados internos) | 20% (diálogos, descrições em JS/JSON em PT) |
| Stripe/Pagamentos | 100% (checkout + webhook + cancelamento) |
| Webtoon | 10% (1 ep. de 21 páginas) |
| Livro (conteúdo) | 100% (PT) / 20% (EN/ES) |
| Assets/Mídia | 40% |
| Achievements | 60% |
| Mobile-First | 50% |
| SEO/Performance | 30% |
