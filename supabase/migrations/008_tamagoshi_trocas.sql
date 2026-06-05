-- Migration 008: Tamagoshi Trocas
-- Tabela de pedidos de troca
CREATE TABLE IF NOT EXISTS public.tamagoshi_trocas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key             TEXT NOT NULL UNIQUE,
  user_id_a       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_a          INT NOT NULL DEFAULT 1,
  criatura_id_a   TEXT NOT NULL,
  user_id_b       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_b          INT,
  status          TEXT NOT NULL DEFAULT 'pendente',
  criado_em       TIMESTAMPTZ DEFAULT now(),
  expira_em       TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours',
  confirmado_em   TIMESTAMPTZ
);

ALTER TABLE public.tamagoshi_trocas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario le propria troca"
  ON public.tamagoshi_trocas FOR SELECT
  USING (auth.uid() = user_id_a OR auth.uid() = user_id_b);

CREATE POLICY "usuario insere propria troca"
  ON public.tamagoshi_trocas FOR INSERT
  WITH CHECK (auth.uid() = user_id_a);

CREATE POLICY "usuario atualiza troca como parte b"
  ON public.tamagoshi_trocas FOR UPDATE
  USING (auth.uid() = user_id_a OR auth.uid() = user_id_b);

-- Colunas de controle de troca na tamagoshi_saves
ALTER TABLE public.tamagoshi_saves
  ADD COLUMN IF NOT EXISTS ultima_troca TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trocas_no_mes INT NOT NULL DEFAULT 0;
