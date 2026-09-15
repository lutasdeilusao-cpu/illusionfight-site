-- Migration 039: tutoriais do LDI Gangues vistos, por CONTA (não por save,
-- não por aparelho). Antes disso todo "já viu esse tutorial" vivia em
-- localStorage — em aparelho/aba novos, o registro não existia ali e o
-- tutorial reaparecia, mesmo pra quem já tinha visto em outro aparelho.
-- Isaias pediu (2026-09-14): "grava isso no Supabase... uma lista simples
-- que marque quais tutoriais o cara já viu, ids dos tutoriais".
--
-- Mesmo desenho de user_achievements (uma linha por item visto, upsert por
-- user_id+tutorial_id) — guest (sem conta) continua em localStorage, já que
-- nada de guest persiste em lugar nenhum nesse jogo.

CREATE TABLE IF NOT EXISTS gangues_tutoriais_vistos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  visto_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tutorial_id)
);

ALTER TABLE gangues_tutoriais_vistos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gangues tutoriais vistos" ON gangues_tutoriais_vistos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gangues tutoriais vistos" ON gangues_tutoriais_vistos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own gangues tutoriais vistos" ON gangues_tutoriais_vistos
  FOR DELETE USING (auth.uid() = user_id);
