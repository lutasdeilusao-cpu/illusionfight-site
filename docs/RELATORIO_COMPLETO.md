# RELATÓRIO COMPLETO — Illusion Fight

> **Última atualização:** 2026-06-13 — v10.80.1

---

## 🧪 Suíte de Testes Playwright — Route Smoke Tests

### Objetivo

Verificar se todas as rotas do site carregam sem disparar `console.error`, servindo como gate de pré-deploy.

### Arquivos criados

| Arquivo | Descrição |
|---|---|
| `playwright.config.js` | Config Playwright — webServer aponta para `npm run dev` (porta 5173) |
| `e2e/routes.spec.js` | Suíte de testes: parser do SITE_MAP.md + 2 suítes (pública + autenticada) + teste 404 |

### Estrutura dos testes

- **Parser:** lê a seção 2 do `SITE_MAP.md`, extrai a coluna `Rota`, resolve `:id` com valores reais (`kim`, `capitulo-01`, `00`)
- **Públicas:** navega sem autenticação — Home, Personagens, Livro, Webtoon, Músicas, Mundo, Games hub, Login, Cadastro, Autor, Custos, Loja, Quiz, Leaderboard, Assinar
- **Autenticadas:** faz login via `conta@teste.com` / `000000` no `beforeEach`, depois navega — Perfil, Admin, Prototype, todos os `/games/*`
- **404:** rota inexistente `/rota-que-nao-existe` — confirma que NotFound carrega sem errors
- **Critério de falha:** qualquer `console.error` ou `pageerror` durante o carregamento

### Rotas cobertas

| Tipo | Quantidade |
|---|---|
| Públicas | 18 |
| Autenticadas | 21 |
| Dinâmicas resolvidas | 3 (`/personagens/kim`, `/livro/capitulo-01`, `/webtoon/00`) |
| 404 | 1 |
| **Total** | **40** |

### Resultado da primeira execução (2026-06-13)

```
🧪 39 passed ✅ | 1 failed ❌ (após correção do /musicas)

❌ /perfil (auth) — HTTP 406/400 de requisições Supabase (conta de teste sem perfil completo)
```

**Correções aplicadas:**
- `/musicas`: `Musicas.jsx` usava `key={m.id}` mas o JSON tem músicas com mesmo `id` (ex: `inevitavel` 3x). Corrigido para `key={\`${m.id}-${i}\`}`.

**Limitações conhecidas:**
- `/perfil`: a conta `conta@teste.com` dispara erros 406/400 do Supabase (perfil inexistente ou RLS). Rotas de game que dependem de `FichaGateRoute` funcionam porque o gate renderiza o modal "Sem Fichas" sem console.error, apenas o `/perfil` crasha por tentar carregar dados que não existem.

### Comando

```bash
npm run test:routes
```

### Workflow recomendado (pré-deploy)

1. Faça suas alterações
2. ⬆️ Bump version em `src/config/version.js`
3. Execute `npm run test:routes` — se falhar, corrija antes de prosseguir
4. `npm run build`
5. `git add -A && git commit -m "desc + vX.X.X"`
6. `git push`
7. `npm run deploy`

---

## Versões

| Constante | Versão | Descrição |
|---|---|---|
| `SITE_VERSION` | **10.80.1** 🛠️ | Site — Top Trumps barra de coleção oculta para guest |
| `PP_VERSION` | **2.2.0** | Pesadelo Particular (i18n completo pt/en/es) |
| `LDI_VERSION` | **2.0.0** | Lendas do LDI (i18n completo pt/en/es) |
| `JACK_VERSION` | **5.2.0** | Jack Dream Beer (BackToGamesBtn unificado) |
| `ARENA_VERSION` | **1.27.2** | Arena LDI — CSS inline audit: static styles movidos para Arena.css |
| `TAMA_VERSION` | **2.5.0** | Tamagoshi LDI — S1 sprite completo! 10/10 sprites próprios |
| `DUELO_VERSION` | **2.8.0** | Duelo LDI — ataque direto Yu-Gi-Oh style + fix TELEPORT |
| `MINIGAMES_VERSION` | **2.0.0** | MiniGames (i18n completo pt/en/es) |
| `TS_VERSION` | **5.22.2** | Top Trumps SP — barra de coleção oculta para guest no menu |
| `TM_VERSION` | **5.11.0** | Top Trumps MP — cron job limpar-salas-fantasma diário (3h) |
| `TATICS_VERSION` | **7.4.0** | Arena LDI Tatics (tagline i18n pt/en/es) |
| `PROTOTYPE_VERSION` | **2.0.0** | Protótipo — menu de seleção + HexBoard + Morto Engine + i18n pt/en/es |
