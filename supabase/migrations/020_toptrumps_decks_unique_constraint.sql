-- Migration 020: Add UNIQUE constraint to toptrumps_decks for ON CONFLICT support
-- Remove duplicatas existentes antes de criar a constraint
DELETE FROM toptrumps_decks a
USING toptrumps_decks b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.carta_id = b.carta_id;

-- Drop old unique index (não suporta ON CONFLICT)
DROP INDEX IF EXISTS idx_toptrumps_decks_user_carta_tipo;

-- Add proper UNIQUE constraint (suporta ON CONFLICT no upsert)
ALTER TABLE toptrumps_decks ADD CONSTRAINT toptrumps_decks_user_id_carta_id_key UNIQUE (user_id, carta_id);
