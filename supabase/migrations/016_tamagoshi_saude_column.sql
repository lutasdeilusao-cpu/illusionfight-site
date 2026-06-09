-- Migration 016: Adicionar coluna 'saude' na tamagoshi_saves
-- A coluna foi usada no código desde sempre mas nunca adicionada na tabela
-- Migration 006 criou a tabela sem 'saude' e migration 010 só add estagio/version

ALTER TABLE public.tamagoshi_saves
  ADD COLUMN IF NOT EXISTS saude INT DEFAULT 100;
