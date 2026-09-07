-- Migration 036: LDI Gangues — inventário de equipamento (com slots de carta)
--
-- Segunda peça do sistema de item. Além das poções (migration 035), a gangue
-- agora tem um inventário de EQUIPAMENTO: cada personagem tem 6 slots (arma +
-- cabeça/corpo/braços/pés/amuleto) e cada peça tem de 0 a 2 slots de carta
-- (estilo Ragnarok Online). As cartas em si vêm depois, junto do sistema de drop.
--
-- Inventário de equipamento é por SAVE (gangue), igual grana/rep/inventário —
-- comprado com a grana compartilhada. Peça equipada some daqui e vai pra
-- character_sheets.attributes.equipment (JSONB que já existe, sem coluna nova).
--
-- Formato: [ { "uid": "eq-...", "itemId": "colete_couro", "cards": [null] } ]

ALTER TABLE gangues_story_progress
  ADD COLUMN IF NOT EXISTS equipamentos JSONB NOT NULL DEFAULT '[]'::jsonb;
