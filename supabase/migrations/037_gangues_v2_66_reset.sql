-- Migration 037: LDI Gangues 2.66 — IDs de inimigo numéricos + remoção do
-- Ranking Clandestino. Reset total (estamos em beta, sem compat com saves).
--
-- Contexto:
--  * Inimigo passou a ser ID numérico (era string: 'moleque_a', 'fumaca'...).
--    O roster agora é 98 fichas organizadas por cargo da hierarquia da Banca
--    (Vigia 1101+, Vapor 1201+, Gerente 1301+, Cobrador 1401+, General 1451+,
--    Chefes 1500–1600). Ver docs/Games/Gangues/LDI_GANGUES_GDD.md §5.
--  * O "Ranking Clandestino" (Kronos, primordial Jack, Kaeda, Viran...) foi
--    apagado do projeto — era eco de cânone antigo e alimentava só o Modo
--    Batalha avulso, que já estava bloqueado. Com ele saiu a coluna
--    character_sheets.enemies_unlocked (criada na migration 006 pra Arena) e
--    todo o sistema unlockNextEnemy.
--  * O Álbum de Marélia (inimigos colecionáveis) vive dentro de
--    gangues_story_progress.story_progress (chave __album do JSONB), igual ao
--    __flags do informante — sem coluna nova.
--
-- character_sheets é a mesma tabela histórica da Arena; desde a migration 026
-- nenhuma linha pode existir nela sem ter sido escrita pelo próprio Gangues
-- (combat_path é NOT NULL sem default, e o outro consumidor — "Lendas do LDI" —
-- nunca preenche). Reset total aqui é seguro, mesmo raciocínio das migrations
-- 025, 026 e 033.

BEGIN;

-- 1) enemies_unlocked não é mais usado por nenhum jogo.
ALTER TABLE character_sheets
  DROP COLUMN IF EXISTS enemies_unlocked;

-- 2) Reset total do Gangues — geração limpa pra todo mundo, sem exceção.
DELETE FROM game_saves
WHERE sheet_id IN (SELECT id FROM character_sheets);

DELETE FROM character_sheets;

DELETE FROM gangues_story_progress;

COMMIT;
