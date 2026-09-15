-- Migration 040: tutoriais do LDI Gangues vistos, agora POR GANGUE (save),
-- não mais só por conta. Isaias reportou (2026-09-15): "fico deletando a
-- gangue... os tutoriais não aparecem pra mim de novo" — "sempre que eu
-- deletar a gangue eles devem reaparecer, logicamente, uma vez por gangue".
--
-- A migration 039 tinha deixado isso por CONTA de propósito, pra resolver
-- uma queixa diferente (tutorial reaparecendo em todo aparelho/aba novo).
-- Mas "por conta" também significa que, ao apagar a gangue e fundar outra,
-- os tutoriais continuavam marcados como vistos pra sempre — quebra a
-- fantasia de "gangue nova, jogador novo" que o onboarding deveria dar.
--
-- Fix: adiciona `save_id`, com ON DELETE CASCADE — apagar o save
-- (gangues_saves) já limpa sozinho os tutoriais vistos daquela gangue,
-- sem precisar de nenhum código extra de "limpeza" no app. Uma conta com
-- 2 gangues em paralelo (GANGUES_SAVE_SLOT_LIMITS) mantém os tutoriais de
-- cada uma independentes — não é reset global por conta, é por gangue
-- mesmo, como pedido.
--
-- Registros de antes dessa migration não tinham save_id (só existia
-- user_id) — o site está em beta, então a forma mais simples e honesta de
-- resolver é limpar a tabela: todo mundo vê os tutoriais de novo 1x,
-- depois disso passam a ficar por gangue igual deveria ser desde o início.

DELETE FROM gangues_tutoriais_vistos;

ALTER TABLE gangues_tutoriais_vistos
  ADD COLUMN save_id UUID NOT NULL REFERENCES gangues_saves(id) ON DELETE CASCADE;

-- Troca a unicidade de (user_id, tutorial_id) pra (user_id, save_id,
-- tutorial_id) — sem isso, o mesmo tutorial_id não poderia ser marcado
-- como visto em DUAS gangues diferentes da mesma conta (era exatamente
-- essa restrição, por conta, que causava o bug reportado).
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'gangues_tutoriais_vistos'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 2;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE gangues_tutoriais_vistos DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE gangues_tutoriais_vistos
  ADD CONSTRAINT gangues_tutoriais_vistos_user_save_tutorial_key
  UNIQUE (user_id, save_id, tutorial_id);

CREATE INDEX IF NOT EXISTS gangues_tutoriais_vistos_save_id_idx
  ON gangues_tutoriais_vistos (save_id);
