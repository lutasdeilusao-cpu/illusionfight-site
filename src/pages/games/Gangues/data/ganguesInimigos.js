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
     Chefes            1500–1699  (7 territoriais + 1 final, fora da contagem)

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

/** Ids válidos, únicos, numéricos — usado ao registrar o bando batido no álbum. */
export function idsValidosUnicos(lista = []) {
  const vistos = new Set()
  for (const item of lista) {
    const id = Number(item)
    if (GANGUES_INIMIGOS.has(id)) vistos.add(id)
  }
  return [...vistos]
}

// ── Abas do Álbum, na ordem da hierarquia (de baixo pra cima). ──
export const GANGUES_ALBUM_CARGOS = Object.freeze([
  { slug: 'vigia', min: 1101, max: 1121 },
  { slug: 'vapor', min: 1201, max: 1221 },
  { slug: 'gerente', min: 1301, max: 1321 },
  { slug: 'cobrador', min: 1401, max: 1414 },
  { slug: 'general', min: 1451, max: 1464 },
  { slug: 'chefes', min: 1500, max: 1699 },
])

export function cargoSlugDeInimigo(id) {
  const n = Number(id)
  return GANGUES_ALBUM_CARGOS.find(c => n >= c.min && n <= c.max)?.slug || null
}

/** Total de entradas colecionáveis do álbum (a hierarquia da Banca, sem chefes). */
export const GANGUES_ALBUM_TOTAL = GANGUES_INIMIGOS_LISTA
  .filter(i => cargoSlugDeInimigo(i.id) && cargoSlugDeInimigo(i.id) !== 'chefes')
  .length

/** Ids do álbum agrupados por aba (na ordem de `GANGUES_ALBUM_CARGOS`). */
export function inimigosDoAlbumPorCargo(slug) {
  return GANGUES_INIMIGOS_LISTA
    .filter(i => cargoSlugDeInimigo(i.id) === slug)
    .sort((a, b) => a.id - b.id)
}
