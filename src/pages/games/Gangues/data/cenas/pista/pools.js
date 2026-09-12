// Moldes de inimigo que as tretas de rua/dungeon da Pista revezam ("estilo
// Pokémon" — ver docs/Games/Gangues/LDI_GANGUES_GDD.md §17.6). Extraído de
// data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).

// Antes eram só 5 ids repetidos à exaustão — o Isaias reclamou de encarar
// Ratazana toda hora. Agora ~14: vigia fraco de esquina (11xx) + vapor de
// rua (12xx). O escalarInimigo ajusta a força, então o molde é só a "cara".
export const PISTA_POOL_RUA = [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1201, 1202, 1203, 1204, 1205]
// Só vigia (sem vapor) pro corredor do túnel — o degrau mais fácil.
export const PISTA_POOL_TUNEL = [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110]
// Guarda-costas do Carvão (pós-muro, antes do galpão) — o bonde de verdade:
// vapor casca-grossa + gerente. Um degrau acima da rua.
export const PISTA_POOL_GALPAO = [1206, 1207, 1208, 1301, 1302, 1303, 1401, 1402]
