/* ══════════════════════════════════════════════════════════════
   Catálogo de EQUIPAMENTO — pedido do Isaias.

   ⚠️ ID É NÚMERO, NUNCA NOME. O código só referencia item por `id`
   numérico (mesma regra do catálogo dos 30 personagens). O `slug` é só
   pra leitura humana aqui no arquivo — nada no código depende dele. O
   NOME que aparece na tela mora no i18n (`games.gangues.equip.itens.<id>`
   nos 3 idiomas) — dá pra renomear "Colete de Couro" → "Colete de Pano"
   mexendo SÓ no JSON de idioma, sem tocar em nada aqui.

   Faixa de id: equipamento é 101+ (consumível em data/ganguesItens.js é
   1–99) — faixas separadas de propósito, os dois catálogos alimentam o
   mesmo `poi.itens` da loja e o mesmo resolvedor.

   Cada personagem tem 6 slots (arma + 5 de vestimenta). Bônus = atributo
   plano (A/H/D) OU recurso plano (pv/pm — somado em cima do PV/PM máximo,
   NÃO passa por R; +R mexia em PV e PM ao mesmo tempo e ficou forte
   demais). Slot `corpo` é a escolha PV vs PM. `cardSlots` 0–2 (teto 2,
   estilo Ragnarok) — as cartas em si vêm com o sistema de drop.

   Regra de remoção de carta (decisão do Isaias): tirar carta encaixada
   DESTRÓI a carta. Desequipar o item inteiro NÃO.
   ══════════════════════════════════════════════════════════════ */

// Ordem dos slots na UI (bonecão de cima pra baixo, arma por último).
export const GANGUES_EQUIP_SLOTS = [
  { id: 'cabeca', icone: '🪖' },
  { id: 'corpo', icone: '🦺' },
  { id: 'bracos', icone: '🧤' },
  { id: 'pes', icone: '🥾' },
  { id: 'amuleto', icone: '📿' },
  { id: 'arma', icone: '🥊' },
]

export const GANGUES_EQUIP_SLOT_IDS = GANGUES_EQUIP_SLOTS.map(slot => slot.id)

// Chaves de bônus: atributo (A/H/D) ou recurso plano (pv/pm).
export const GANGUES_EQUIP_ATTR_KEYS = ['A', 'H', 'D']
export const GANGUES_EQUIP_RES_KEYS = ['pv', 'pm']

const i18nNome = id => `games.gangues.equip.itens.${id}`

// Lista bruta — id numérico + slug só pra humano. O resto é dado de balanço.
//
// REPRECIFICAÇÃO (revisão jan/2027, junto da curva de custo escalonada de
// atributo): antes, 1 ponto de atributo custava sempre 1 XP fixo — um item
// com +1/+2 era um "empurrãozinho" barato perto do que a ficha ganhava só
// jogando. Agora um ponto de atributo custa de 1 a dezenas de XP dependendo
// de quão alto ele já está (custoAtributoGangues) — um item que dá +1/+2 de
// atributo de graça é MUITO mais valioso do que era. Preços subiram
// proporcionalmente (~2.2-2.6x nos itens de atributo A/H/D; ~1.6x nos de
// PV/PM, que continuam bônus plano fora do atributo, menos afetados).
const CATALOGO = [
  // ── ARMA (🥊) — foco em A ──
  { id: 101, slug: 'soqueira_lata', slot: 'arma', raridade: 'comum', bonus: { A: 1 }, cardSlots: 0, custo: 65, icone: '🥊' },
  { id: 102, slug: 'faca_serrilhada', slot: 'arma', raridade: 'incomum', bonus: { A: 2 }, cardSlots: 1, custo: 140, icone: '🔪' },
  { id: 103, slug: 'cano_de_ferro', slot: 'arma', raridade: 'raro', bonus: { A: 2, H: 1 }, cardSlots: 2, icone: '🪈' },

  // ── CABEÇA (🪖) — foco em D ──
  { id: 104, slug: 'gorro_moletom', slot: 'cabeca', raridade: 'comum', bonus: { D: 1 }, cardSlots: 0, custo: 50, icone: '🧢' },
  { id: 105, slug: 'capacete_obra', slot: 'cabeca', raridade: 'incomum', bonus: { D: 2 }, cardSlots: 1, custo: 105, icone: '⛑️' },
  { id: 106, slug: 'coroa_lata', slot: 'cabeca', raridade: 'raro', bonus: { A: 1, D: 1 }, cardSlots: 2, icone: '👑' },

  // ── CORPO (🦺) — a escolha PV vs PM (bônus plano, fora do atributo) ──
  { id: 107, slug: 'colete_reforcado', slot: 'corpo', raridade: 'comum', bonus: { pv: 6 }, cardSlots: 0, custo: 58, icone: '🦺' }, // tanker
  { id: 108, slug: 'colete_leve', slot: 'corpo', raridade: 'comum', bonus: { pm: 6 }, cardSlots: 0, custo: 58, icone: '🧥' }, // magro / místico
  { id: 109, slug: 'colete_placa', slot: 'corpo', raridade: 'incomum', bonus: { pv: 12 }, cardSlots: 1, custo: 128, icone: '🛡️' },
  { id: 110, slug: 'manto_capuz', slot: 'corpo', raridade: 'incomum', bonus: { pm: 12 }, cardSlots: 1, icone: '🥋' },
  { id: 111, slug: 'armadura_rua', slot: 'corpo', raridade: 'raro', bonus: { pv: 18 }, cardSlots: 2, icone: '⚙️' },

  // ── BRAÇOS (🧤) — foco em D/A ──
  { id: 112, slug: 'luva_couro', slot: 'bracos', raridade: 'comum', bonus: { D: 1 }, cardSlots: 0, custo: 50, icone: '🧤' },
  { id: 113, slug: 'manopla_porca', slot: 'bracos', raridade: 'incomum', bonus: { A: 2 }, cardSlots: 1, custo: 115, icone: '🦾' },
  { id: 114, slug: 'bracadeira_cravo', slot: 'bracos', raridade: 'raro', bonus: { A: 1, D: 1 }, cardSlots: 2, icone: '⛓️' },

  // ── PÉS (🥾) — foco em H ──
  { id: 115, slug: 'tenis_furado', slot: 'pes', raridade: 'comum', bonus: { H: 1 }, cardSlots: 0, custo: 50, icone: '👟' },
  { id: 116, slug: 'coturno', slot: 'pes', raridade: 'incomum', bonus: { H: 1, D: 1 }, cardSlots: 1, custo: 105, icone: '🥾' },
  { id: 117, slug: 'bota_biqueira', slot: 'pes', raridade: 'raro', bonus: { H: 2 }, cardSlots: 2, icone: '🦿' },

  // ── AMULETO (📿) — misto leve ──
  { id: 118, slug: 'corrente_lata', slot: 'amuleto', raridade: 'comum', bonus: { H: 1 }, cardSlots: 1, custo: 65, icone: '📿' },
  { id: 119, slug: 'dente_de_ouro', slot: 'amuleto', raridade: 'incomum', bonus: { A: 1 }, cardSlots: 1, icone: '🦷' },
  { id: 120, slug: 'medalha_santa', slot: 'amuleto', raridade: 'raro', bonus: { D: 1, H: 1 }, cardSlots: 2, icone: '🎖️' },
]

export const GANGUES_EQUIP = Object.fromEntries(CATALOGO.map(item => [item.id, { ...item, nome: i18nNome(item.id) }]))
export const GANGUES_EQUIP_LISTA = Object.values(GANGUES_EQUIP)

// O que a loja da Pista vende — os básicos (id numérico). No corpo são
// DOIS (o par PV/PM). Ver data/cenas/pista/.
export const GANGUES_LOJA_EQUIP_BASICO = [104, 107, 108, 112, 115, 118, 101]

export function getGanguesEquip(itemId) {
  const key = Number(itemId)
  if (!Number.isFinite(key)) return null
  return GANGUES_EQUIP[key] || null
}

/** Estrutura vazia dos 6 slots equipados de um personagem. */
export function emptyGanguesEquipment() {
  return GANGUES_EQUIP_SLOT_IDS.reduce((acc, slot) => { acc[slot] = null; return acc }, {})
}

/** Normaliza o que veio do banco pro shape esperado (6 chaves, cards do tamanho certo,
 *  itemId numérico). Item que não existe mais no catálogo é descartado do slot. */
export function normalizeGanguesEquipment(equipment = {}) {
  const safe = emptyGanguesEquipment()
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const equipped = equipment?.[slot]
    const def = equipped && getGanguesEquip(equipped.itemId)
    if (!def || def.slot !== slot) continue
    const cards = Array.from({ length: def.cardSlots }, (_, i) => equipped.cards?.[i] ?? null)
    safe[slot] = { itemId: def.id, cards }
  }
  return safe
}

/** Instância de item pro inventário (uid próprio + sockets vazios). */
export function createGanguesEquipInstance(itemId) {
  const def = getGanguesEquip(itemId)
  if (!def) return null
  return { uid: `eq-${def.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: def.id, cards: Array.from({ length: def.cardSlots }, () => null) }
}

/** Soma dos bônus de todos os itens equipados: A/H/D (atributo) + pv/pm (recurso plano). */
export function getGanguesEquipBonuses(equipment = {}) {
  const total = { A: 0, H: 0, D: 0, pv: 0, pm: 0 }
  const safe = normalizeGanguesEquipment(equipment)
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const def = safe[slot] && getGanguesEquip(safe[slot].itemId)
    if (!def) continue
    for (const key of [...GANGUES_EQUIP_ATTR_KEYS, ...GANGUES_EQUIP_RES_KEYS]) total[key] += Number(def.bonus?.[key]) || 0
  }
  return total
}

/** Atributos A/H/D já com os bônus de equipamento somados (nunca abaixo de
 *  0) — PV/PM NÃO entram aqui: o bônus de equipamento pra eles é plano,
 *  somado direto no PV_max/PM_max (ver applyGanguesEquipResources), não no
 *  atributo em si (nunca foi, mesmo antes com R). */
export function getGanguesAttributesWithEquip(attributes = {}) {
  const bonuses = getGanguesEquipBonuses(attributes.equipment)
  const out = { ...attributes }
  for (const attr of ['A', 'H', 'D']) out[attr] = Math.max(0, (Number(attributes[attr]) || 0) + (bonuses[attr] || 0))
  return out
}

/** PV/PM máximos com o bônus PLANO de equipamento somado (não passa por R). */
export function applyGanguesEquipResources(resources = {}, equipment = {}) {
  const b = getGanguesEquipBonuses(equipment)
  return { ...resources, pvMax: (Number(resources.pvMax) || 0) + b.pv, pmMax: (Number(resources.pmMax) || 0) + b.pm }
}

/** Um mapa de equipamento HIPOTÉTICO com `itemId` encaixado no slot dele (troca o que tiver). */
export function withGanguesEquip(equipment = {}, itemId) {
  const eq = normalizeGanguesEquipment(equipment)
  const def = getGanguesEquip(itemId)
  if (def) eq[def.slot] = { itemId: def.id, cards: Array.from({ length: def.cardSlots }, () => null) }
  return eq
}

/** Atributos efetivos SE `itemId` fosse equipado — usado pela loja pra prever a ficha. */
export function previewGanguesAttributesWithEquip(attributes = {}, itemId) {
  return getGanguesAttributesWithEquip({ ...attributes, equipment: withGanguesEquip(attributes.equipment, itemId) })
}
