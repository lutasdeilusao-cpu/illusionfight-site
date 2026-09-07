-- Migration 035: LDI Gangues — inventário de itens (poções, por enquanto)
--
-- Primeira versão do sistema de item: loja vende Poção de HP/MP por grana,
-- item fica guardado por save (mesma gangue) e é usado em combate. Inventário
-- é por save inteiro (gangue), não por personagem — igual grana/rep, já que
-- é comprado com o dinheiro compartilhado do bando.
-- Formato: { [itemId]: quantidade } (ex: {"pocao_hp": 2, "pocao_mp": 1}).

ALTER TABLE gangues_story_progress
  ADD COLUMN IF NOT EXISTS inventario JSONB NOT NULL DEFAULT '{}'::jsonb;
