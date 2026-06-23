# FEAT: SITE_MAP.md — Auditoria e Sincronização com o Produto Real

> Versão: 10.159.2
> Hash: `58a8485c`
> Deploy: `Published` ✅

---

## Etapa 1 — Outputs brutos

### public/ structure
```
./public/_redirects, ./public/404.html, ./public/CNAME, ./public/favicon-ldi.png,
./public/og-image.jpg, ./public/sitemap.xml, ./public/sw.js,
./public/assets/arena/terrenos/tile_default.png,
./public/assets/images/characters/*.png (10 chars),
./public/assets/images/livro/01~04.png,
./public/fonts/animeace2_bld.ttf, BringRace.otf, Ethnocentric-Regular.otf, RacingGames.ttf,
./public/games/*/index.html (15 static HTML),
./public/leaderboard/index.html, livro/, loja/, mundo/, musicas/, personagens/, quiz/,
./public/webtoon/index.html + 00/pt/01~21.png + 01/pt/01~37.png
```

### Routes in App.jsx
```
36 routes — all game routes wrapped in FichaGateRoute.
```

### Pages JSX files
```
76 .jsx files in src/pages/
```

### Versions
```
SITE_VERSION=10.159.1, PP=2.3.1, LDI=2.0.1, JACK=5.3.1, ARENA=1.31.0,
TAMA=3.3.3, DUELO=2.8.0, MINIGAMES=4.0.2, TS=5.22.3, TM=5.11.0,
TATICS=7.5.0, MORTO=3.3.1, ARENATESTBED=6.4.1
```

### Static HTML
```
15 index.html files in public/*/ (games, jackcandy, ldi, ldi-arena, ldi-tatics,
minigames, pesadelo, leaderboard, livro, loja, mundo, musicas, personagens, quiz, webtoon)
```

### _redirects
```
10 trailing slash 301 rules
```

### Favicon
```
Only ./public/favicon-ldi.png (no favicon.svg, no favicon_512.png)
```

---

## Etapa 2 — Divergências encontradas

| # | Seção | Divergência | Ação |
|---|-------|-------------|------|
| 1 | 1 — public/ | `favicon.svg` listado mas não existe | ✅ Atualizado para `favicon-ldi.png` |
| 2 | 1 — public/ | `_redirects`, `CNAME` não listados | ✅ Adicionados |
| 3 | 1 — public/ | 15 static HTML não listados | ✅ Adicionados (games/*, leaderboard, etc) |
| 4 | 1 — public/fonts | Só `BringRace.otf` listado | ✅ Adicionados: animeace2_bld, Ethnocentric, RacingGames |
| 5 | 1 — public/assets | `arena/terrenos/`, `images/characters/`, `images/livro/` não listados | ✅ Adicionados |
| 6 | 1 — src/assets | Pipe quebrado (linhas 72-73 mescladas) | ✅ Formatado corretamente |
| 7 | 1 — src/components | `Puzzles/` dito "6 puzzles" → são 7 + css + sfx | ✅ Corrigido para "7 puzzles + index.js + css + sfx" |
| 8 | 1 — src/components | `BackToGamesBtn`, `GuestNotice`, `ModalLancamento`, `ProdutoDigitalCard`, `TopTrumpsCard`, `UnifiedNotification` não listados | ✅ Adicionados |
| 9 | 2 — rotas | `/autor` descrição: "História do autor Isaias Leal" | ✅ Atualizado para "Sobre o projeto e o universo" |
| 10 | 2 — rotas | Sem nota sobre SE0/indexação/tamagoshi/duelo | ✅ Adicionado bloco SE0 após tabela |
| 11 | 3 — versões | Todas OK | ✅ (sem correção) |
| 12 | 4 — globais | `AchievementToast` listado mas não renderizado em App.jsx | ✅ Removido da tabela, movido para nota |
| 13 | 4 — globais | `LoginGate` importado mas não listado | ✅ Adicionado |
| 14 | 5 — migrations | `010_stripe_billing.sql` listado mas não existe no disco | ✅ Removido |
| 15 | 5 — migrations | `021_profiles_is_test_account.sql` não listado | ✅ Adicionado |
| 16 | 5 — migrations | `022_fix_null_country_codes.sql` não listado | ✅ Adicionado |
| 17 | 8 — stack | Todas OK (Vite 8, React 19, RR 7, Zustand 5, FM 12) | ✅ (sem correção) |

**Total: 17 divergências — 15 corrigidas, 2 já OK.**

---

## Etapa 3 — Correções aplicadas

### public/ structure (refeita por completo)
ANTES: listava favicon.svg, apenas BringRace.otf, sem _redirects, sem HTML estático
DEPOIS: favicon-ldi.png, 4 fonts, _redirects, CNAME, 15 static HTMLs, assets completos

### /autor descrição
ANTES: `História do autor Isaias Leal`
DEPOIS: `Sobre o projeto e o universo`

### SE0 note (nova, após tabela de rotas)
Adicionado bloco documentando:
- Sitemap (18 URLs públicas, privadas excluídas)
- tamagoshi/duelo não indexados
- 15 HTML estáticos para crawlers
- _redirects com 10 regras de trailing slash
- JSON-LD no index.html
- Rotas 🔒 protegidas por FichaGateRoute

### Section 4
ANTES: AchievementToast como global (mas não está em App.jsx)
DEPOIS: LoginGate adicionado, AchievementToast movido para nota

### Migrations
ANTES: 010_stripe_billing.sql (não existe no disco)
DEPOIS: removido; 021_profiles_is_test_account.sql e 022_fix_null_country_codes.sql adicionados

---

## Teste lógico

### Fluxo 1 — Alguém que nunca viu o projeto consegue saber quais rotas são públicas, privadas, e não-indexadas?
✅ Sim. A tabela de rotas tem coluna "Status" com ✅ público, 🔒 protegido. O bloco SE0 após a tabela documenta explicitamente quais rotas estão no sitemap, quais não estão, e por quê. `/games/tamagoshi` e `/games/duelo` têm nota de que existem no React Router mas não no sitemap público.

### Fluxo 2 — Estrutura de pastas bate com find public/ e find src/pages/?
✅ Sim. Seção 1 completamente atualizada: public/ reflete todos os arquivos e diretórios encontrados. src/pages/ cobre todas as páginas. src/components/ cobre todos os componentes (incluindo os que faltavam: BackToGamesBtn, GuestNotice, ModalLancamento, ProdutoDigitalCard, TopTrumpsCard, UnifiedNotification).

### Fluxo 3 — Versões na Seção 3 batem com version.js?
✅ Sim. Todas as 13 constantes conferidas individualmente contra `src/config/version.js`.

---

## Build output

```
vite v8.0.16 building client environment for production...
✓ 1247 modules transformed.
✓ built in 949ms
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION patch +1 | 10.159.1 → **10.159.2** |
| `SITE_MAP.md` | Auditoria e sincronização completa | ✅ |
| **Commit** | `58a8485c` — `docs: SITE_MAP.md auditoria e sincronizacao v10.159.2` | ✅ |
| **Deploy** | `Published` | ✅ |

---

## Testes manuais pendentes

- [ ] Abrir `SITE_MAP.md` no repositório GitHub e confirmar visualmente que Seção 1 e Seção 2 representam o site ao vivo
- [ ] Verificar que `/autor` não menciona "Isaias Leal" como identidade pessoal, apenas "Sobre o projeto e o universo"
