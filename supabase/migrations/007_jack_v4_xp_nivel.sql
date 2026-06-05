-- Migration: Jack Dream Beer v4.0.19+ — XP, nivel, comprou columns
-- Adiciona suporte ao sistema de XP/nível e registro de compras

ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS nivel INT DEFAULT 1;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS comprou JSONB DEFAULT '[]';
