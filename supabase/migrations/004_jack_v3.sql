-- Migration: Jack Dream Beer v3.1.0 — Supabase source of truth
-- Adiciona slot_num, campos de investigação, e constraint unique

-- 1. Adicionar slot_num (permite 3 saves por usuário)
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS slot_num INT DEFAULT 1;

-- 2. Campos de investigação v3.0
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS caso_ativo TEXT;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS pistas_coletadas JSONB DEFAULT '[]';
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS suspeitos JSONB DEFAULT '[]';
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS locais_visitados JSONB DEFAULT '[]';
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS acusacoes_erradas INT DEFAULT 0;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS casos_resolvidos JSONB DEFAULT '[]';

-- 3. Campos novos v2.1+
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS cervejas_por_segundo INT DEFAULT 1;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS cervejas_totais INT DEFAULT 0;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS fragmentos INT DEFAULT 0;
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS cidade_atual TEXT DEFAULT 'marelia';
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS periodo TEXT DEFAULT 'DIA';
ALTER TABLE jack_saves ADD COLUMN IF NOT EXISTS medidor_primordial INT DEFAULT 0;

-- 4. Remover constraint antiga se existir (user_id único) e criar nova (user_id + slot_num)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jack_saves_user_id_key'
  ) THEN
    ALTER TABLE jack_saves DROP CONSTRAINT jack_saves_user_id_key;
  END IF;
END $$;

-- Cria constraint composta se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jack_saves_user_slot_key'
  ) THEN
    ALTER TABLE jack_saves ADD CONSTRAINT jack_saves_user_slot_key UNIQUE (user_id, slot_num);
  END IF;
END $$;

-- 5. Atualiza slots existentes para slot_num = 1
UPDATE jack_saves SET slot_num = 1 WHERE slot_num IS NULL;
