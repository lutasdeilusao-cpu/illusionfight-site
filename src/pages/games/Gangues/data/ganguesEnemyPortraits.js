// Retratos de INIMIGO — mesma ideia de ganguesPortraits.js/ganguesNpcPortraits.js
// (só a CABEÇA, pixel art), mas pro elenco de combate (vapor, gerente de
// boca, cobrador, general, chefe) em vez do elenco recrutável ou dos NPCs
// de papo. Catálogo separado porque inimigo é identificado por `id`
// numérico (gangues-enemies.json), não por slug — o mapa ENEMY_ID_SLUG
// abaixo faz a ponte.
//
// Arte mora em src/pages/games/Gangues/assets/enemies/<slug>/<expressao>.png
// — mesma convenção de pasta-por-entidade das outras duas. Hoje só a Pista
// tem arte (pedido do Isaias, 14/09/2026: cabeças oficiais pra Ratazana,
// Brasa, Chinelada, Cão Louco, Riscado, Bala Solta, Troco Certo, Sinaleiro
// Chefe, Rasteira Velha e Carvão — os outros bairros ainda usam o
// fallback (inicial do nome)).
const ARQUIVOS_NEUTRO = import.meta.glob('../assets/enemies/*/neutro.png', { eager: true, import: 'default' })

const ENEMY_PORTRAITS = { neutro: {} }
for (const [caminho, url] of Object.entries(ARQUIVOS_NEUTRO)) {
  const slug = caminho.match(/enemies\/([^/]+)\/neutro\.png$/)?.[1]
  if (slug) ENEMY_PORTRAITS.neutro[slug] = url
}

// id numérico (gangues-enemies.json) -> slug da pasta de arte.
const ENEMY_ID_SLUG = {
  1201: 'ratazana',
  1202: 'brasa',
  1203: 'chinelada',
  1301: 'cao_louco',
  1302: 'riscado',
  1401: 'bala_solta',
  1402: 'troco_certo',
  1451: 'sinaleiro_chefe',
  1452: 'rasteira_velha',
  1500: 'carvao',
}

/** Retrato (cabeça) do inimigo pelo slug direto. */
export function getGanguesEnemyPortrait(slug, expressao = 'neutro') {
  if (!slug) return null
  return ENEMY_PORTRAITS[expressao]?.[slug] || null
}

/** Atalho pelo `id` numérico do inimigo (gangues-enemies.json/poi.enemy) —
 *  é assim que TretaVS e o combate já têm o dado em mãos. */
export function getGanguesEnemyPortraitById(enemyId, expressao = 'neutro') {
  return getGanguesEnemyPortrait(ENEMY_ID_SLUG[enemyId], expressao)
}
