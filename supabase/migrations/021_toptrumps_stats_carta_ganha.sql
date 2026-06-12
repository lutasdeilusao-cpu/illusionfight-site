-- Migration 021: Add carta_ganha_hoje column to toptrumps_stats
-- This column tracks whether the user has already won a card today
-- Without it, upserts fail silently and tentativas never persist

ALTER TABLE toptrumps_stats ADD COLUMN IF NOT EXISTS carta_ganha_hoje BOOLEAN DEFAULT false;

-- Ensure user_id has a unique constraint for upsert with onConflict
-- (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'toptrumps_stats_user_id_key' 
    AND conrelid = 'toptrumps_stats'::regclass
  ) THEN
    -- Check if there's already a primary key on user_id
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'toptrumps_stats'
      AND c.contype = 'p'
      AND c.conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'toptrumps_stats'::regclass AND attname = 'user_id')
    ) THEN
      ALTER TABLE toptrumps_stats ADD CONSTRAINT toptrumps_stats_user_id_key UNIQUE (user_id);
    END IF;
  END IF;
END;
$$;
