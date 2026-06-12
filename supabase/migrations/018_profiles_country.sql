-- 018_profiles_country.sql
-- Adiciona campo country_code à tabela profiles
-- Usado no cadastro obrigatório e editável no perfil
-- Os rankings (toptrumps_ranking, arena_ranking, tamagoshi_ranking) leem este campo

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code CHAR(2);
