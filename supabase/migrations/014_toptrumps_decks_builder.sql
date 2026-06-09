-- Migration 014: Add deck builder columns to toptrumps_decks
-- Each user can have named decks for each size: 5, 10, 15, 20

-- Alter existing toptrumps_decks: add deck_type and deck_name columns
ALTER TABLE toptrumps_decks ADD COLUMN IF NOT EXISTS deck_type TEXT DEFAULT 'geral' CHECK (deck_type IN ('geral', 'deck_5', 'deck_10', 'deck_15', 'deck_20'));
ALTER TABLE toptrumps_decks ADD COLUMN IF NOT EXISTS deck_name TEXT DEFAULT '';

-- Drop old unique constraint if exists, create new one scoped to deck_type
ALTER TABLE toptrumps_decks DROP CONSTRAINT IF EXISTS toptrumps_decks_user_id_carta_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_toptrumps_decks_user_carta_tipo ON toptrumps_decks(user_id, carta_id, deck_type);

-- Deck names table (one row per user per deck type)
CREATE TABLE IF NOT EXISTS toptrumps_deck_nomes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_type TEXT NOT NULL CHECK (deck_type IN ('deck_5', 'deck_10', 'deck_15', 'deck_20')),
  nome TEXT NOT NULL DEFAULT '',
  UNIQUE(user_id, deck_type)
);

ALTER TABLE toptrumps_deck_nomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deck nomes" ON toptrumps_deck_nomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deck nomes" ON toptrumps_deck_nomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deck nomes" ON toptrumps_deck_nomes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own deck nomes" ON toptrumps_deck_nomes
  FOR DELETE USING (auth.uid() = user_id);
