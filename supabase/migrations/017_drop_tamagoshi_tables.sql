-- Migration 017: Adicionar coluna 'saude' na tamagoshi_saves (timestamp-only)
-- O sistema agora é timestamp-only: status bars calculados localmente via localStorage + decaimento
-- Mas as tabelas são MANTIDAS para metadados, badges, trocas e fama

ALTER TABLE public.tamagoshi_saves
  ADD COLUMN IF NOT EXISTS saude INT DEFAULT 100;
