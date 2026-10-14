// Moldes de inimigo que as tretas de rua/dungeon da Pista revezam ("estilo
// Pokémon" — ver docs/Games/Gangues/LDI_GANGUES_GDD.md §17.6). Extraído de
// data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).

// Antes eram só 5 ids repetidos à exaustão — o Isaias reclamou de encarar
// Ratazana toda hora. Agora ~14: vigia fraco de esquina (11xx) + vapor de
// rua (12xx). O escalarInimigo ajusta a força, então o molde é só a "cara".
export const PISTA_POOL_RUA = [1101, 1102, 1103, 1201, 1202, 1203]
// Só vigia (sem vapor) pro corredor do túnel — o degrau mais fácil.
export const PISTA_POOL_TUNEL = [1101, 1102, 1103, 1202, 1203]
// Guarda-costas do Carvão (pós-muro, antes do galpão) — o bonde de verdade:
// vapor casca-grossa + gerente. Um degrau acima da rua.
export const PISTA_POOL_GALPAO = [1301, 1302, 1303, 1401, 1402]
