-- Migration 017: Remover tabelas do Tamagoshi que não são mais usadas
-- O sistema agora é timestamp-only: status calculado localmente via localStorage + decaimento
-- Tabelas mantidas: dix_wallet, dix_historico (usadas pelo sistema DIX em outros jogos)

DROP TABLE IF EXISTS public.tamagoshi_trocas CASCADE;
DROP TABLE IF EXISTS public.tamagoshi_badges CASCADE;
DROP TABLE IF EXISTS public.tamagoshi_fama CASCADE;
DROP TABLE IF EXISTS public.tamagoshi_saves CASCADE;
