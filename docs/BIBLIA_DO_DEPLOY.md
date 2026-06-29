# 📖 Bíblia do Deploy — Illusion Fight

> **Documento oficial de deploy.** Toda alteração no projeto segue este fluxo.  
> Versão: `10.183.18` | Atualizado: 2026-06-29

---

## ⚡ Fluxo Rápido (1 comando)

```bash
python deploy.py -g ldi -m "descrição do que mudou"
```

Para **múltiplos jogos**:
```bash
python deploy.py -g ldi jackcandy -m "descrição"
```

Flags:
- `--minor` → bump minor (X.**Y**.Z)
- `--major` → bump major (**X**.Y.Z)
- *sem flag* → bump patch (X.Y.**Z**)

---

## 📋 Fluxo Manual Passo a Passo

### 🔴 Passo 1 — BUMP DA VERSÃO

**Regra absoluta:** toda task que toca **qualquer arquivo** do projeto sobe `SITE_VERSION` patch obrigatoriamente. Se a task também mexe em um jogo específico, sobe a versão do jogo **e** a do site.

```bash
# Editar: src/config/version.js
# Exemplo: SITE_VERSION = '10.183.17' → '10.183.18'
```

| Game | Constante | Arquivo |
|---|---|---|
| Site global | `SITE_VERSION` | `src/config/version.js` |
| Lendas do LDI | `LDI_VERSION` | `src/pages/LDI/store/useGameStore.js:1` |
| Jack Dream Candy | `JACK_VERSION` | `src/pages/JackCandy/store/useJackStore.js:1` |
| Top Trumps | `MP_VERSION` | `src/pages/TopTrumpsMP.jsx:21` |
| MiniGames | `MINIGAMES_VERSION` | `src/pages/MiniGames/version.js:1` |
| Arena Mode | `ARENA_VERSION` | `src/pages/Arena/ArenaRoute.jsx:10` |
| Pesadelo Particular | `PP_VERSION` | `src/pages/PesadeloParticular/PP.jsx:7` |
| Arena LDI Tatics | `TATICS_VERSION` | `src/config/version.js` |

### 🔴 Passo 2 — ATUALIZAR SITE_MAP.md

Em `SITE_MAP.md`:
- Linha da `SITE_VERSION` na tabela de versões
- Data de última atualização no topo
- Qualquer rota nova ou alterada na tabela de rotas

### Passo 3 — BUILD

```bash
npm run build
```

**Regras:**
- `sourcemap: true` é obrigatório em todas as builds até o lançamento (Setembro 2026)
- Se falhar, corrigir antes de prosseguir
- Verificar warnings: chunks grandes, imports dinâmicos ineficazes

### Passo 4 — COMMIT

```bash
git add -A
git commit -m "<desc> + vX.X.X"
```

**Padrão de mensagem:**
- `fix:` para correções
- `feat:` para novas funcionalidades
- Número da versão no final após `+`

### Passo 5 — PUSH

```bash
git push
```

### Passo 6 — DEPLOY

```bash
npm run deploy
```

O `predeploy` roda `npm run build` automaticamente antes de publicar.

### Passo 7 — VERIFICAR

- Deploy publicado sem erros (output: `Published`)
- Acessar `https://illusionfight.com/` e confirmar
- Verificar se arquivos existentes não foram destruídos

---

## 🏗️ Infraestrutura

### Stack
| Tecnologia | Uso |
|---|---|
| **Vite 8** | Build system |
| **React 19** | UI (JSX only, sem TypeScript) |
| **React Router 7** | Rotas client-side |
| **Zustand 5** | State management (independente por jogo) |
| **Framer Motion 12** | Animações |
| **Supabase** | Auth, realtime, persistência |
| **gh-pages** | Deploy GitHub Pages |
| **react-helmet-async** | Título por página |
| **react-markdown** | Renderização de capítulos |

### Domínio
- **Oficial:** `https://illusionfight.com/`
- GitHub Pages + CNAME
- `public/CNAME` → `illusionfight.com`
- Vite `base: '/'`

### GitHub Pages — SPA
- `public/404.html` captura 404s e redireciona para `/?/<path>`
- Script em `index.html` restaura URL limpa via `history.replaceState`
- **Nunca remover ou quebrar** esses dois arquivos

---

## 🔐 Segurança (regras de commit)

Nenhum commit pode passar com:
- ❌ String hardcoded visível ao usuário
- ❌ CSS inline (`style={{}}` para propriedades visuais)
- ❌ Chave i18n faltando em **PT/EN/ES**
- ❌ Insert direto em tabela Supabase fora do listener correto
- ❌ Chave/segredo exposto

---

## 🧭 Arquitetura

### Pages
- **Game pages** (`/games/ldi`, `/games/jackcandy`, etc.) têm `data/`, `store/`, `components/` próprios
- **Stores Zustand independentes** — não compartilham estado
- Cada jogo loga versão no console ao montar

### i18n
- `LanguageContext` → persistido como `ldi-locale` no localStorage
- JSONs em `src/i18n/`
- Função `t("key.path")` resolve traduções
- **3 idiomas obrigatórios:** PT, EN, ES

### ReaderContext
- Wrapper global
- `readerMode = true` → esconde Navbar e TrialBanner
- Usado por WebtoonEpisodio e LivroCapitulo

### z-index Layers
| Componente | z-index |
|---|---|
| SearchModal | 2000 |
| AchievementToast | 1500 |
| Navbar | 1000 |
| TrialBanner | 998 |
| CookieBanner | 200 |
| LDINotification | 150 |
| ScrollToTop | 100 |
| MusicSection dropdown | 50 |

### Assets
- **Webtoon pages:** `public/webtoon/` (acesso direto por URL)
- **Outros assets:** `src/assets/` (Vite processa e hasheia)

### Supabase
- Projeto: `dvxfrzixtetdzmdrzkpx.supabase.co`
- Client: `src/lib/supabase.js` (anon key)
- Migrations: `supabase/migrations/` (arquivos 001-003 remotos, 004+ no repo)
- RLS: `auth.uid() = user_id` em todas as tabelas
- **Sempre `maybeSingle()`** em vez de `single()` (evita erro em resultado vazio)
- Insert em profiles: **só após SIGNED_IN**, nunca no signUp direto
- `emailRedirectTo`: URL fixa `https://illusionfight.com/login`, nunca `window.location.origin`

### Fichas System
- Moeda virtual gerenciada por `FichasContext`
- Games usam `useFichaGate` + `ModalSemFichas`

---

## 📡 SEO & Indexação

### Arquivos essenciais

| Arquivo | Função |
|---|---|
| `public/robots.txt` | `Allow: /` + `Sitemap: https://illusionfight.com/sitemap.xml` |
| `public/sitemap.xml` | 18 URLs, lastmod atualizado, hreflang pt/en/es/x-default |
| `public/_redirects` | 17 regras 301 (trailing slash + game subpages) |
| `public/404.html` | SPA redirect para crawlers sem JS |

### Static HTML SEO
Cada rota pública tem `public/<rota>/index.html`:
- `<meta http-equiv="refresh">` → redireciona para SPA
- `<link rel="canonical">` → URL canônica
- `<meta name="robots" content="index, follow">`
- `<title>` e `<meta description>` específicos

### Rotas no sitemap (18 URLs)
`/`, `/personagens/`, `/livro/`, `/webtoon/`, `/musicas/`, `/mundo/`, `/autor/`, `/games/`, `/loja/`, `/games/ldi/`, `/games/ldi-tatics/`, `/games/ldi-arena/`, `/games/jackcandy/`, `/games/pesadelo/`, `/games/toptrumps/`, `/games/minigames/`, `/leaderboard/`, `/quiz/`

**Não estão no sitemap** (privadas/multiplayer): `/login`, `/cadastro`, `/perfil`, `/admin`, `/assinar`, `/custos`, `/prototype`, `/games/toptrumps/lobby`, `/games/toptrumps/multiplayer`

### Prerender
O script `scripts/prerender-routes.js` roda após o build e cria `index.html` estático para 26 rotas no `dist/`, garantindo status 200 nativo do GitHub Pages.

---

## 🧪 Verificação Pós-Deploy

### Checklist
- [ ] `npm run build` passou sem erros
- [ ] `npm run deploy` publicou (`Published`)
- [ ] `https://illusionfight.com/` online
- [ ] `https://illusionfight.com/robots.txt` → 200
- [ ] `https://illusionfight.com/sitemap.xml` → 200
- [ ] Google Search Console → Inspeção de URL → páginas principais
- [ ] Nenhum arquivo existente foi destruído

---

## 📁 Estrutura do Projeto

```
/
├── index.html                     # Entry point Vite (SEO, OG, GA, SPA script)
├── package.json                   # Scripts: dev, build, deploy, preview
├── vite.config.js                 # Config: base '/', sourcemap true
├── AGENTS.md                      # Regras do agente (NÃO IGNORAR)
├── SITE_MAP.md                    # Mapa completo do site
│
├── docs/                          # Documentação e relatórios
│   ├── ReportAI/                  # Relatórios de correções
│   └── Marketing/                 # Listas de email
│
├── scripts/                       # Utilitários
│   ├── prerender-routes.js        # Gera index.html para rotas SPA
│   ├── run-migration.js           # Roda migrações Supabase
│   └── ...                        # Scripts de extração/transformação
│
├── public/                        # Static files (copiados para dist/)
│   ├── robots.txt                 # Crawlers
│   ├── sitemap.xml                # Sitemap
│   ├── _redirects                 # GitHub Pages redirects (301)
│   ├── 404.html                   # SPA fallback
│   ├── CNAME                      # Domínio customizado
│   ├── autor/index.html           # Static HTML SEO
│   ├── games/*/index.html         # Static HTML SEO (7 jogos)
│   └── ...                        # Demais rotas com index.html
│
├── supabase/
│   └── migrations/                # 22 migrações SQL
│
└── src/                           # Código fonte React
    ├── main.jsx                   # Entry point (Providers)
    ├── App.jsx                    # Rotas + layout global
    ├── config/                    # Configurações (versões, site, trial)
    ├── context/                   # Providers (Auth, Language, Fichas, etc.)
    ├── components/                # Componentes reutilizáveis
    ├── pages/                     # Páginas (games, content, platform, site)
    ├── i18n/                      # Traduções (pt, en, es)
    ├── data/                      # JSON data (personagens, livro, quiz, etc.)
    ├── hooks/                     # Custom hooks
    └── lib/                       # Bibliotecas (supabase, stripe, getDeck)
```

---

## 🚫 Arquivos Proibidos

**NUNCA TOCAR:**
- `engine/combat.js`
- `engine/hexUtils.js`
- `engine/ai.js`
- `Phase1SheetBuilder.jsx`
- `src/pages/Arena/`
- `e2e/routes.spec.js`

---

## 📊 Relatório Final

Após cada deploy, entregar:

```
| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | X.X.X → **Y.Y.Y** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| **Commit** | `abc1234` — `desc + vY.Y.Y` | ✅ |
| **Deploy** | Status | ✅/❌ |
```

---

## 🧠 Decisões de Arquitetura (Hurdles)

- **Canvas height ≠ div em flex** — sempre medir o pai, nunca o canvas
- **FK profiles_id_fkey** — insert em profiles só após SIGNED_IN
- **emailRedirectTo** = URL fixa, nunca `window.location.origin`
- **Nunca migrar para nova lib de rendering sem ganho visual comprovado** (lição Pixi.js)
- **Sempre `maybeSingle()`** em vez de `single()` no Supabase
- **Zero CSS-in-JS** — todo componente tem `.css` correspondente
- **No lint, no typecheck** — única verificação é `npm run build`
