-- Migration 010: Corrigir colunas faltantes na tamagoshi_saves
-- A migration 006 foi criada com CREATE TABLE IF NOT EXISTS, mas a tabela já existia
-- sem as colunas 'estagio' e 'version'. Este script adiciona as colunas faltantes.

ALTER TABLE public.tamagoshi_saves
  ADD COLUMN IF NOT EXISTS estagio INT DEFAULT 0;

ALTER TABLE public.tamagoshi_saves
  ADD COLUMN IF NOT EXISTS version TEXT;
