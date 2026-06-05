-- 006_arena_enemies_unlocked.sql
-- Add enemies_unlocked column to character_sheets for Arena progression system

ALTER TABLE character_sheets
ADD COLUMN IF NOT EXISTS enemies_unlocked text[] DEFAULT ARRAY['treinamento'];
