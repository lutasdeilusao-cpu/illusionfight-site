/* ══════════════════════════════════════════════════════════════
   TABELA DE DROP — o que cada inimigo pode derrubar e a chance.

   Gerada por regra a partir do catálogo de inimigos (território do álbum +
   cargo), então todo inimigo novo já nasce com tabela. Cada linha:
     { tipo: 'item' | 'equip' | 'carta', id, chance }
   • item  — consumível/material (data/ganguesItens.js)
   • equip — peça do bairro, sempre na versão COM encaixe (só sai por drop)
   • carta — a carta do próprio inimigo (id = 10000 + id do inimigo)

   GARANTIA (sem frustração): cada linha tem um contador por inimigo. Quem
   tem chance p ganha o drop, no máximo, na ceil(1/p)-ésima vitória sobre
   aquele inimigo — antes disso o sorteio vale normal. Caiu, o contador zera.
   O sorteio e o contador moram em engine/ganguesDrop.js.
   ══════════════════════════════════════════════════════════════ */
import { GANGUES_INIMIGOS, GANGUES_INIMIGOS_LISTA, cargoSlugDeInimigo } from './ganguesInimigos.js'
import { GANGUES_EQUIP_LISTA, aprimTeto } from './ganguesEquip.js'
import { getGanguesItem } from './ganguesItens.js'

export const GANGUES_CARTA_BASE = 10000
export const cartaDoInimigo = enemyId => GANGUES_CARTA_BASE + Number(enemyId)

// Raridade de peça que cada território derruba (1 Pista … 7 Laje).
const RARIDADE_DO_TERRITORIO = { 1: 'comum', 2: 'incomum', 3: 'raro', 4: 'pesado', 5: 'grife', 6: 'nobre', 7: 'lendario' }
// Épico de cada chefe.
const EPICO_DO_CHEFE = { 1500: 139, 1501: 138, 1502: 140, 1503: 141, 1504: 134, 1505: 135, 1600: 133 }
// Peça de missão que não cai de inimigo.
const FORA_DO_DROP = new Set([237])

// Consumíveis de cada território: [comum, secundário].
const CONSUMIVEL_DO_TERRITORIO = {
  1: [[1, 2], [30, 31, 32, 33, 35, 36, 37, 38, 39]],
  2: [[1, 2, 10, 12], [3, 4, 6, 8, 11, 34]],
  3: [[1, 2, 10], [4, 34]],
  4: [[1, 2, 10], [34, 41]],
  5: [[1, 2, 10], [34, 41]],
  6: [[1, 10, 41], [34, 41]],
  7: [[10, 41], [34, 41]],
}

// Chance por cargo.
const CHANCE = {
  sucata: 0.10,
  consumivel: 0.15,
  secundario: 0.05,
  valvula: 0.05,
  chip: { gerente: 0.02, cobrador: 0.02, general: 0.03 },
  equip: { vigia: 0.01, vapor: 0.01, gerente: 0.015, cobrador: 0.015, general: 0.03, chefes: 0.05, aleatorio: 0.01 },
  carta: { vigia: 0.002, vapor: 0.002, gerente: 0.0025, cobrador: 0.0025, general: 0.005, chefes: 0.01, aleatorio: 0.005 },
  epico: 0.10,
  chefeConsumivel: 0.30,
}
const CHIPS = [20, 21, 22]

const territorioDe = inimigo => Number(inimigo?.album?.territorioId) || null
const cargoDe = id => cargoSlugDeInimigo(id) || 'aleatorio'
const escolher = (lista, semente) => lista[Math.abs(semente) % lista.length]

// Peças de cada território repartidas entre os inimigos dele (cada peça cai
// de pelo menos um inimigo; o chefe leva as duas mais fortes do caminho livre
// ou as duas primeiras).
const PECAS_POR_INIMIGO = (() => {
  const mapa = new Map()
  for (let t = 1; t <= 7; t++) {
    const pecas = GANGUES_EQUIP_LISTA.filter(d => d.raridade === RARIDADE_DO_TERRITORIO[t] && !FORA_DO_DROP.has(d.id)).map(d => d.id).sort((a, b) => a - b)
    const inimigos = GANGUES_INIMIGOS_LISTA.filter(e => territorioDe(e) === t && cargoDe(e.id) !== 'chefes').map(e => e.id).sort((a, b) => a - b)
    if (!inimigos.length) continue
    pecas.forEach((peca, i) => {
      const quem = inimigos[i % inimigos.length]
      mapa.set(quem, [...(mapa.get(quem) || []), peca])
    })
    const chefe = GANGUES_INIMIGOS_LISTA.find(e => territorioDe(e) === t && cargoDe(e.id) === 'chefes')
    if (chefe) mapa.set(chefe.id, pecas.slice(-2))
  }
  return mapa
})()

function montarTabela(id) {
  const inimigo = GANGUES_INIMIGOS.get(Number(id))
  if (!inimigo) return []
  const cargo = cargoDe(inimigo.id)
  const t = territorioDe(inimigo) || 1
  const linhas = []
  const [comuns, secundarios] = CONSUMIVEL_DO_TERRITORIO[t]

  if (cargo === 'chefes') {
    const epico = EPICO_DO_CHEFE[inimigo.id]
    if (epico) linhas.push({ tipo: 'equip', id: epico, chance: CHANCE.epico })
    linhas.push({ tipo: 'item', id: escolher(secundarios, inimigo.id), chance: CHANCE.chefeConsumivel })
  } else {
    linhas.push({ tipo: 'item', id: 13, chance: CHANCE.sucata })
    linhas.push({ tipo: 'item', id: escolher(comuns, inimigo.id), chance: CHANCE.consumivel })
    linhas.push({ tipo: 'item', id: escolher(secundarios, inimigo.id >> 1), chance: CHANCE.secundario })
    if (t === 2) linhas.push({ tipo: 'item', id: 15, chance: CHANCE.valvula })
    if (CHANCE.chip[cargo]) linhas.push({ tipo: 'item', id: escolher(CHIPS, inimigo.id), chance: CHANCE.chip[cargo] })
  }
  for (const peca of PECAS_POR_INIMIGO.get(inimigo.id) || []) linhas.push({ tipo: 'equip', id: peca, chance: CHANCE.equip[cargo] })
  // Encontro aleatório (sem território): uma peça do bairro 1 sorteada pela ficha.
  if (cargo === 'aleatorio') {
    const pecas = GANGUES_EQUIP_LISTA.filter(d => d.raridade === 'comum' && !FORA_DO_DROP.has(d.id))
    linhas.push({ tipo: 'equip', id: escolher(pecas, inimigo.id).id, chance: CHANCE.equip.aleatorio })
  }
  linhas.push({ tipo: 'carta', id: cartaDoInimigo(inimigo.id), chance: CHANCE.carta[cargo] })
  return linhas
}

const TABELAS = new Map(GANGUES_INIMIGOS_LISTA.map(e => [e.id, montarTabela(e.id)]))

/** Tabela de drop do inimigo (lista de { tipo, id, chance }). */
export function dropsDoInimigo(enemyId) {
  return TABELAS.get(Number(enemyId)) || []
}

// Variação da peça que caiu: 2 encaixes (raro) e/ou já aprimorada (+1/+2).
export const GANGUES_VARIANTE = { doisEncaixes: 0.10, aprim2: 0.05, aprim1: 0.20 }
export function rolarVariante(pecaId, rnd = Math.random) {
  const teto = aprimTeto(GANGUES_EQUIP_LISTA.find(d => d.id === pecaId))
  const encaixes = rnd() < GANGUES_VARIANTE.doisEncaixes ? 2 : 1
  const r = rnd()
  const aprim = Math.min(teto, r < GANGUES_VARIANTE.aprim2 ? 2 : r < GANGUES_VARIANTE.aprim2 + GANGUES_VARIANTE.aprim1 ? 1 : 0)
  return { encaixes, aprim }
}

/** Em quantas vitórias o drop é garantido. */
export const garantiaDe = chance => Math.ceil(1 / chance)

/** Chave do contador da garantia. */
export const chaveDrop = (enemyId, linha) => `${enemyId}:${linha.tipo}:${linha.id}`

/** Ícone, nome e etiqueta de uma linha de drop, nos 3 idiomas. */
export function infoDoDrop(t, linha) {
  if (linha.tipo === 'carta') {
    const enemyId = linha.id - GANGUES_CARTA_BASE
    return { icone: '🃏', nome: t('games.gangues.drop.carta_nome', { inimigo: t(`games.gangues.enemy_names.${enemyId}`) }), tag: t('games.gangues.drop.tag_carta') }
  }
  if (linha.tipo === 'equip') {
    const def = GANGUES_EQUIP_LISTA.find(d => d.id === linha.id)
    const v = linha.variante
    const extra = v ? ` [${v.encaixes}]${v.aprim ? ` +${v.aprim}` : ''}` : ''
    return { icone: def?.icone || '❔', nome: `${t(def?.nome || '')}${extra}`, tag: t(v && (v.encaixes > 1 || v.aprim) ? 'games.gangues.drop.tag_equip_especial' : 'games.gangues.drop.tag_equip') }
  }
  const item = getGanguesItem(linha.id)
  return { icone: item?.icone || '❔', nome: t(item?.nome || ''), tag: t('games.gangues.drop.tag_item') }
}
