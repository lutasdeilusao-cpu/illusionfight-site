-- LDI Gangues 2.0: templates numéricos e ciclos de campanha.
ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS character_type TEXT NOT NULL DEFAULT 'legacy'
    CHECK (character_type IN ('legacy', 'template')),
  ADD COLUMN IF NOT EXISTS character_template_id INTEGER
    CHECK (character_template_id BETWEEN 1 AND 30);

CREATE UNIQUE INDEX IF NOT EXISTS character_sheets_user_template_unique
  ON character_sheets (user_id, character_template_id)
  WHERE character_type = 'template' AND character_template_id IS NOT NULL;

ALTER TABLE gangues_story_progress
  ADD COLUMN IF NOT EXISTS campaign_clears INTEGER NOT NULL DEFAULT 0 CHECK (campaign_clears >= 0),
  ADD COLUMN IF NOT EXISTS event_character_ids INTEGER[] NOT NULL DEFAULT '{}';

ALTER TABLE gangues_story_progress
  DROP CONSTRAINT IF EXISTS gangues_story_progress_event_character_ids_check;
ALTER TABLE gangues_story_progress
  ADD CONSTRAINT gangues_story_progress_event_character_ids_check
  CHECK (event_character_ids <@ ARRAY[8,9,10,18,19,20,26,28,29,30]::INTEGER[]);
