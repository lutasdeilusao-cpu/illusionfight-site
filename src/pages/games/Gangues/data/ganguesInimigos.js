/* ══════════════════════════════════════════════════════════════
   Catálogo de INIMIGOS — o Álbum de Marélia.

   ⚠️ ID É NÚMERO, NUNCA NOME (regra do projeto — AGENTS.md / Bíblia §1).
   O nome exibido mora no i18n (`games.gangues.enemy_names.<id>`), a linha
   de lore em `games.gangues.enemy_album.<id>` — renomear é só no JSON de
   idioma, sem tocar em código nem em save.

   Roster organizado por CARGO da hierarquia da Banca (ver
   docs/Games/Gangues/LDI_GANGUES_GDD.md §5):

     Vigia/Fogueteiro  1101–1121  (21)
     Vapor             1201–1221  (21)
     Gerente de Boca   1301–1321  (21)
     Cobrador          1401–1414  (14)
     General           1451–1464  (14)   → 91 colecionáveis da hierarquia
     Chefes            1500–1699  (7 territoriais + 1 final)
     Ranking           2001–2008  (8)    → +8 colecionáveis = 99

   Faixas ajudam a classificar o cargo sem depender de campo — ver
   `cargoSlugDeInimigo`.
   ══════════════════════════════════════════════════════════════ */
import catalogo from './gangues-enemies.json'

export const GANGUES_INIMIGOS_LISTA = Object.freeze(catalogo)
export const GANGUES_INIMIGOS = new Map(catalogo.map(inimigo => [inimigo.id, inimigo]))

export function getGanguesInimigo(id) {
  const key = Number(id)
  return Number.isFinite(key) ? (GANGUES_INIMIGOS.get(key) || null) : null
}

// ── Crosswalk: id em string (versões antigas / saves pré-migração) → id novo.
//    Usado por `normalizarEnemyIds` pra não quebrar `enemies_unlocked` de
//    fichas salvas antes da migração numérica.
export const GANGUES_ENEMY_ALIAS = Object.freeze({
  treinamento: 2001, kaeda: 2002, thunderbolt: 2003, stormbyte: 2004,
  viran: 2005, campeao: 2006, kronos: 2007, primordial_jack: 2008,
  moleque_a: 1201, moleque_c: 1202, gato_eletrico: 1204,
  moleque_b: 1301, turco_batedor: 1304, sombra_rubra: 1308, sombra_fria: 1309,
  bonde_predio_1: 1310, bonde_predio_2: 1311, frente_escada_1: 1313,
  frente_escada_2: 1314, os_cinco_1: 1316, os_cinco_2: 1317, a_roda: 1318,
  bonde_costura_1: 1319, bonde_costura_2: 1320, turco_capanga: 1403,
  os_restos: 1405, andar_de_cima: 1407, fogueteiro: 1409, bonde_costura_3: 1463,
  fumaca: 1500, turco: 1501, espeto: 1502, sala: 1503, zefa: 1504,
  doutor: 1505, costura: 1600,
})

/** Um id (número, string numérica ou alias antigo) → id numérico canônico. */
export function normalizarEnemyId(x) {
  if (typeof x === 'number') return x
  if (x in GANGUES_ENEMY_ALIAS) return GANGUES_ENEMY_ALIAS[x]
  const n = Number(x)
  return Number.isFinite(n) ? n : x
}

/** Normaliza + dedupe + descarta o que não existe no catálogo. */
export function normalizarEnemyIds(lista = []) {
  const vistos = new Set()
  for (const item of lista) {
    const id = normalizarEnemyId(item)
    if (GANGUES_INIMIGOS.has(id)) vistos.add(id)
  }
  return [...vistos]
}

// ── Abas do Álbum, na ordem da hierarquia (de baixo pra cima) + Ranking. ──
export const GANGUES_ALBUM_CARGOS = Object.freeze([
  { slug: 'vigia', min: 1101, max: 1121 },
  { slug: 'vapor', min: 1201, max: 1221 },
  { slug: 'gerente', min: 1301, max: 1321 },
  { slug: 'cobrador', min: 1401, max: 1414 },
  { slug: 'general', min: 1451, max: 1464 },
  { slug: 'chefes', min: 1500, max: 1699 },
  { slug: 'ranking', min: 2001, max: 2099 },
])

export function cargoSlugDeInimigo(id) {
  const n = Number(id)
  return GANGUES_ALBUM_CARGOS.find(c => n >= c.min && n <= c.max)?.slug || null
}

/** Total de entradas colecionáveis do álbum (hierarquia + ranking, sem chefes). */
export const GANGUES_ALBUM_TOTAL = GANGUES_INIMIGOS_LISTA
  .filter(i => cargoSlugDeInimigo(i.id) && cargoSlugDeInimigo(i.id) !== 'chefes')
  .length

/** Ids do álbum agrupados por aba (na ordem de `GANGUES_ALBUM_CARGOS`). */
export function inimigosDoAlbumPorCargo(slug) {
  return GANGUES_INIMIGOS_LISTA
    .filter(i => cargoSlugDeInimigo(i.id) === slug)
    .sort((a, b) => a.id - b.id)
}
