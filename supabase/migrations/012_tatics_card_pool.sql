-- 012_tatics_card_pool.sql
-- Adicionar colunas na tabela de saves do Tatics para sistema de cartas e evolução

ALTER TABLE arena_tatics_saves
ADD COLUMN IF NOT EXISTS cartas_obtidas jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS cartas_ordem jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS evolucoes_map jsonb DEFAULT '{}';

-- cartas_obtidas: array de ids das cartas que o jogador tem
-- cartas_ordem: array com a ordem em que recebeu (para histórico)
-- evolucoes_map: { rosterId: { nivel40: 'muralha', nivel70: 'bastiao' } }

COMMENT ON COLUMN arena_tatics_saves.cartas_obtidas IS 'Array de ids das cartas que o jogador possui';
COMMENT ON COLUMN arena_tatics_saves.cartas_ordem IS 'Array com a ordem em que as cartas foram recebidas';
COMMENT ON COLUMN arena_tatics_saves.evolucoes_map IS 'JSON map com caminhos evolutivos por rosterId: { rosterId: { nivel40, nivel70 } }';
