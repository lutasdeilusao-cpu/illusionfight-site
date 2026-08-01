-- Arena 2.0: loadout estruturado e aditivo. Colunas legadas permanecem intactas.
ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS combat_style text,
  ADD COLUMN IF NOT EXISTS technique_ids text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weakness_id text,
  ADD COLUMN IF NOT EXISTS loadout_version smallint DEFAULT 1;

ALTER TABLE character_sheets
  DROP CONSTRAINT IF EXISTS character_sheets_combat_style_check,
  ADD CONSTRAINT character_sheets_combat_style_check
    CHECK (combat_style IS NULL OR combat_style IN ('brutamontes', 'duelista', 'canalizador')),
  DROP CONSTRAINT IF EXISTS character_sheets_weakness_id_check,
  ADD CONSTRAINT character_sheets_weakness_id_check
    CHECK (weakness_id IS NULL OR weakness_id IN ('lento', 'franzino', 'sedento', 'sensivel')),
  DROP CONSTRAINT IF EXISTS character_sheets_technique_ids_limit_check,
  ADD CONSTRAINT character_sheets_technique_ids_limit_check
    CHECK (cardinality(technique_ids) <= 2);
