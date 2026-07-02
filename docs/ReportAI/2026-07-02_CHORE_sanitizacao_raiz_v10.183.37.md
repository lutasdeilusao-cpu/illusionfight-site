# Relatório de Sanitização — Raiz do Repositório

**Data:** 2026-07-02
**Versão:** 10.183.36 → **10.183.37**
**Commit:** `f2d4413c`
**Deploy:** ✅ Published

---

## Inventário completo e ações tomadas

### 🗑️ DELETADOS — Artefatos de Teste (18)

| Arquivo | Ação |
|---|---|
| `.build-log.txt` | Deletado |
| `.dev-pid.txt` | Deletado |
| `.dev-server.log` | Deletado |
| `.dev-srv.err` | Deletado |
| `.dev-srv.log` | Deletado |
| `.dev-srv.pid` | Deletado |
| `.dev-stderr-test.log` | Deletado |
| `.dev-stderr.log` | Deletado |
| `.dev-stdout-test.log` | Deletado |
| `.dev-stdout.log` | Deletado |
| `.log1-err.txt` | Deletado |
| `.log1-out.txt` | Deletado |
| `.srv.err` | Deletado |
| `.srv.out` | Deletado |
| `.srv.pid` | Deletado |
| `.test-results.log` | Deletado |
| `kp-test-err.log` | Deletado |
| `kp-test-out.log` | Deletado |

### 🗑️ DELETADOS — Scripts Órfãos (5)

| Arquivo | Ação |
|---|---|
| `run-test.ps1` | Deletado — não referenciado em package.json, AGENTS.md, ou workflows |
| `start-dev.ps1` | Deletado — não referenciado oficialmente |
| `find_insertion.py` | Deletado — task Kernel Panic já concluída |
| `inject_kp_i18n.py` | Deletado — task Kernel Panic já concluída |
| `inject_kp_json.py` | Deletado — task Kernel Panic já concluída |

### 🗑️ DELETADOS — Não relacionados ao site (2)

| Arquivo | Ação |
|---|---|
| `existing_all_emails.txt` | Deletado — lista de emails de PR outreach, não pertence ao repositório |
| `youtube_email_extractor.cjs` | Deletado — script de extração de emails, não pertence ao repositório |

### 🗑️ DELETADOS — Duplicata/Referência solta (1)

| Arquivo | Ação |
|---|---|
| `kernel-panic.html` | Deletado — referência original HTML já totalmente migrada para React (v1.2.0) |

### ✅ MANTIDOS (10)

| Arquivo | Justificativa |
|---|---|
| `package.json` | Core do projeto |
| `package-lock.json` | Lock de dependências |
| `vite.config.js` | Config Vite |
| `playwright.config.js` | Config Playwright |
| `.env` | Variáveis dev |
| `.env.production` | Variáveis prod |
| `.gitignore` | Atualizado com padrões anti-poluíção |
| `index.html` | Entry point HTML |
| `AGENTS.md` | Regras do agente |
| `SITE_MAP.md` | Mapa do site (versão atualizada) |
| `kernel-panic-manual.html` | Mantido na raiz a pedido |

### 📦 MOVIDOS (1)

| Arquivo | Destino |
|---|---|
| `2026-07-02_FIX_mecanismo_teste_4_etapas.md` | `docs/ReportAI/2026-07-02_FIX_mecanismo_teste_4_etapas.md` |

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/config/version.js` | SITE_VERSION bump: `10.183.36` → **10.183.37** |
| `SITE_MAP.md` | Versão atualizada na tabela de rotas |
| `.gitignore` | Padrões `.dev-*.log`, `.dev-*.err`, `.dev-*.pid`, `.dev-*.out`, `.srv.*`, `.log1-*.txt`, `kp-test-*.log`, `.test-results.log`, `.build-log.txt` adicionados |

---

## Estatísticas

| Métrica | Valor |
|---|---|
| Arquivos deletados | 26 |
| Arquivos movidos | 1 |
| Arquivos mantidos (após revisão) | 11 |
| Arquivos modificados | 3 |
| SITE_VERSION antes | 10.183.36 |
| SITE_VERSION depois | **10.183.37** |
| Commit | `f2d4413c` |
| Deploy | ✅ Published |
