-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 038 — LDI Gangues 2.67: a "igreja unificada".
--
-- Substitui de vez as migrations 031–037. O Gangues acumulou 7 migrations
-- (cada uma com DROP/CREATE/ALTER/reset parcial) e ainda por cima vinha
-- empurrando colunas e fichas pra dentro de `character_sheets` — tabela que é
-- da "Lendas do LDI" (src/pages/games/LDI/), não do Gangues.
--
-- Agora o Gangues tem TABELAS PRÓPRIAS e `character_sheets` volta a ser só da
-- LDI. Estamos em beta, sem usuário real além do dono do site → reset total,
-- sem migração de dados.
--
--   gangues_saves   → a "gangue" (uma linha por SAVE, N por conta). Era
--                     `gangues_story_progress` (nome enganoso: é o save inteiro,
--                     não só a história — carrega grana, rep, inventário, álbum).
--   gangues_fichas  → os lutadores recrutados. Eram as linhas
--                     `character_type = 'template'` de `character_sheets`.
--
-- O Álbum de Marélia (inimigos colecionáveis) e as flags de informante vivem
-- dentro de `gangues_saves.story_progress` (JSONB, chaves `__album` / `__flags`)
-- — sem coluna dedicada, de propósito.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Fora com a bagunça antiga ──────────────────────────────────────────
DROP TABLE IF EXISTS gangues_story_progress CASCADE;

-- Limpa o que o Gangues tinha empurrado pra dentro de `character_sheets`.
-- A "Lendas do LDI" nunca referencia nenhuma dessas colunas
-- (useLDIStorage.js usa advantages/perks/weapon/… e `select('*')`).
DELETE FROM game_saves
WHERE sheet_id IN (SELECT id FROM character_sheets WHERE character_type = 'template');
DELETE FROM character_sheets WHERE character_type = 'template';

DROP INDEX IF EXISTS character_sheets_save_id_idx;
DROP INDEX IF EXISTS character_sheets_save_template_unique;
DROP INDEX IF EXISTS character_sheets_user_template_unique;

ALTER TABLE character_sheets
  DROP COLUMN IF EXISTS save_id,
  DROP COLUMN IF EXISTS character_type,
  DROP COLUMN IF EXISTS character_template_id,
  DROP COLUMN IF EXISTS enemies_unlocked;

-- ── 2. gangues_saves — a gangue / o save ─────────────────────────────────
CREATE TABLE gangues_saves (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gang_name            TEXT NOT NULL DEFAULT '',
  story_progress       JSONB NOT NULL DEFAULT '{}'::jsonb,   -- inclui __album, __flags
  cena_progresso       JSONB NOT NULL DEFAULT '{}'::jsonb,
  grana                INTEGER NOT NULL DEFAULT 0 CHECK (grana >= 0),
  rep                  INTEGER NOT NULL DEFAULT 0 CHECK (rep >= 0),
  campaign_clears      INTEGER NOT NULL DEFAULT 0 CHECK (campaign_clears >= 0),
  event_character_ids  INTEGER[] NOT NULL DEFAULT '{}'
    CHECK (event_character_ids <@ ARRAY[8,9,10,18,19,20,26,28,29,30]::INTEGER[]),
  inventario           JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { [itemId]: qtd }
  equipamentos         JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [ { uid, itemId, cards } ]
  criada_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizada_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX gangues_saves_user_id_idx ON gangues_saves (user_id);

ALTER TABLE gangues_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gangues_saves_select" ON gangues_saves
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gangues_saves_insert" ON gangues_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gangues_saves_update" ON gangues_saves
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gangues_saves_delete" ON gangues_saves
  FOR DELETE USING (auth.uid() = user_id);

-- ── 3. gangues_fichas — os lutadores recrutados ─────────────────────────
CREATE TABLE gangues_fichas (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  save_id                UUID NOT NULL REFERENCES gangues_saves(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_name             TEXT NOT NULL DEFAULT '',
  combat_path            TEXT,                                 -- 'atacante' | 'defensor' | 'mistico' (frouxo — beta)
  character_template_id  INTEGER CHECK (character_template_id BETWEEN 1 AND 30),
  elemental              TEXT NOT NULL DEFAULT 'neutro',
  loadout_version        INTEGER NOT NULL DEFAULT 3,
  xp_total               INTEGER NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
  -- A/H/R/D + progression (ap, xp, special_path, special_levels, selected_specials)
  -- + equipment (6 slots) + pv_atual/pm_atual. Tudo num JSONB só.
  attributes             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- O mesmo personagem do catálogo (1–30) só entra uma vez por gangue.
CREATE UNIQUE INDEX gangues_fichas_save_template_unique
  ON gangues_fichas (save_id, character_template_id)
  WHERE character_template_id IS NOT NULL;
CREATE INDEX gangues_fichas_save_id_idx ON gangues_fichas (save_id);
CREATE INDEX gangues_fichas_user_id_idx ON gangues_fichas (user_id);

ALTER TABLE gangues_fichas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gangues_fichas_select" ON gangues_fichas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gangues_fichas_insert" ON gangues_fichas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gangues_fichas_update" ON gangues_fichas
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gangues_fichas_delete" ON gangues_fichas
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;
