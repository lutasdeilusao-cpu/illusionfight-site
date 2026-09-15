// Retratos de INIMIGO — mesma ideia de ganguesPortraits.js/ganguesNpcPortraits.js
// (só a CABEÇA, pixel art), mas pro elenco de combate (vapor, gerente de
// boca, cobrador, general, chefe) em vez do elenco recrutável ou dos NPCs
// de papo. Catálogo separado porque inimigo é identificado por `id`
// numérico (gangues-enemies.json), não por slug — o mapa ENEMY_ID_SLUG
// abaixo faz a ponte.
//
// Arte mora em src/pages/games/Gangues/assets/enemies/<slug>/<expressao>.png
// — mesma convenção de pasta-por-entidade das outras duas. Hoje só a Pista
// tem arte (pedido do Isaias, 14-15/09/2026, em 2 levas: 1ª leva —
// Ratazana, Brasa, Chinelada, Cão Louco, Riscado, Bala Solta, Troco Certo,
// Sinaleiro Chefe, Rasteira Velha e Carvão; 2ª leva — todo o resto dos
// "moldes"/vigias usados nos pools da Pista: Farejador, Zóio, Extensão,
// Boleto Vencido, Luz de Gato, Maré Baixa, Trilho, Boato, Portaria,
// Choque, Balconista, Fiado Vencido, Água Parada, Ferro Velho e Mão de
// Cola — falta só o Pingo (1103), sem arte enviada ainda). Os outros
// bairros (Feira, Baixada, Vila, Morro, Alto do Morro, Laje) ainda usam
// o fallback (inicial do nome).
const ARQUIVOS_NEUTRO = import.meta.glob('../assets/enemies/*/neutro.png', { eager: true, import: 'default' })

const ENEMY_PORTRAITS = { neutro: {} }
for (const [caminho, url] of Object.entries(ARQUIVOS_NEUTRO)) {
  const slug = caminho.match(/enemies\/([^/]+)\/neutro\.png$/)?.[1]
  if (slug) ENEMY_PORTRAITS.neutro[slug] = url
}

// id numérico (gangues-enemies.json) -> slug da pasta de arte.
const ENEMY_ID_SLUG = {
  1101: 'farejador',
  1102: 'zoio',
  // 1103 (Pingo) — sem arte ainda.
  1104: 'extensao',
  1105: 'boleto_vencido',
  1106: 'luz_de_gato',
  1107: 'mare_baixa',
  1108: 'trilho',
  1109: 'boato',
  1110: 'portaria',
  1201: 'ratazana',
  1202: 'brasa',
  1203: 'chinelada',
  1204: 'choque',
  1205: 'balconista',
  1206: 'fiado_vencido',
  1207: 'agua_parada',
  1208: 'ferro_velho',
  1301: 'cao_louco',
  1302: 'riscado',
  1303: 'mao_de_cola',
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
