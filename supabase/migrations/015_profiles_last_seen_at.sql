-- 015_profiles_last_seen_at.sql
-- Adiciona coluna last_seen_at para controle de sessão lazy evaluation

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
