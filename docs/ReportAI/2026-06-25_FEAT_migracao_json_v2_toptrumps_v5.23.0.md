# FEAT — Migração Top Trumps JSON v2 (30 cartas, id numérico)

**Versão:** 5.23.0 (TS) / 5.12.0 (TM) / 10.162.44 (SITE)

## O que mudou

### JSONs (`src/data/supertrunfo-*.json`)
| Arquivo | Antes | Depois |
|---------|-------|--------|
| `supertrunfo-pt.json` | v2 (já migrado, 30 cartas, id numérico) | inalterado |
| `supertrunfo-en.json` | v1 — 105 cartas, id slug string (`"kim_briguento"`) | v2 — 30 cartas, id numérico (1-30), SEM nome/descricao/habilidades |
| `supertrunfo-es.json` | v1 — 105 cartas, id slug string | v2 — 30 cartas, id numérico, SEM metadados |

### Código removido (`TopTrumps.jsx` e `PerfilColecao.jsx`)
- **`SEASON_1_IDS`** — filtro de 30 slugs removido. Sempre mostra só as 30 cartas do JSON.
- **`TIER_OVERRIDE` + `tierReal()`** — Nexus Phantasm já é `primordial` no JSON. Dead code.
- **`getCartasIniciais()`** — simplificado para `embaralhar(todasCartas).slice(0, 5)`. Distribuição tier-based removida (dados já estão no JSON).
- **Backward compat slug** — lookup duplo `c.id_num === id || c.id === id` removido. Só `c.id === id`.

### `id_num` → `id` (13 arquivos)
| Arquivo | Mudança |
|---------|---------|
| `TopTrumps.jsx` | `carta?.id_num` → `carta?.id`, `c.id_num ?? c.id` → `c.id`, backward compat removido |
| `PerfilColecao.jsx` | `SEASON_1_IDS` removido, `temCarta` simplificado |
| `AuthContext.jsx` | `c.id_num` → `c.id` (deck inicial no cadastro) |
| `CardViewerModal.jsx` | `carta?.id_num` → `carta?.id`, `tem`/`copias` simplificados |
| `DeckBuilder.jsx` | 7 ocorrências `id_num` → `id` |
| `DeckStartModal.jsx` | 3 ocorrências `id_num` → `id` |
| `TopTrumpsLobby.jsx` | `c.id_num` → `c.id`, `cartaAposta.id_num` → `cartaAposta.id` |
| `TopTrumpsMP.jsx` | 8 ocorrências `c.id_num` → `c.id` |

### Impacto em dados antigos
- Registros no Supabase `toptrumps_decks` com `carta_id` = slug string (`"kim_briguento"`) não serão resolvidos. O código trata isso como "deck corrompido" e regenera com 5 cartas aleatórias.
- Admins recebem auto-fill de todas as 30 cartas numéricas.
- Novos usuários recebem 5 cartas free via `c.id`.

| Versão | Antes | Depois |
|--------|-------|--------|
| `TS_VERSION` | 5.22.4 | → **5.23.0** |
| `TM_VERSION` | 5.11.0 | → **5.12.0** |
| `SITE_VERSION` | 10.162.43 | → **10.162.44** |
| **Commit** | `6934cdd6` | ✅ |
| **Deploy** | Published | ✅ |
