-- 022_fix_null_country_codes.sql
-- Preenche country_code = 'BR' para perfis que ficaram com NULL
-- (contas criadas antes da migration 018 ou via admin sem país)
--
-- Uso: aplicar no SQL Editor do Supabase
-- Motivo: queries que dependem de country_code (leaderboards, perfil)
-- quebram quando o valor é NULL

UPDATE profiles
SET country_code = 'BR'
WHERE country_code IS NULL;
