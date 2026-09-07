/* ══════════════════════════════════════════════════════════════
   Catálogo de EQUIPAMENTO — primeira versão (pedido do Isaias).

   Cada personagem tem 6 slots (arma + 5 de vestimenta). Cada item dá
   bônus plano de atributo (A/H/R/D) e tem de 0 a 2 SLOTS DE CARTA
   (estilo Ragnarok Online) — teto de 2 pra não virar apelação. As
   cartas em si ainda NÃO existem (vêm com o sistema de drop depois);
   por enquanto o campo `cardSlots` só reserva os buracos e a UI mostra
   os quadradinhos vazios.

   Fonte de itens HOJE: a loja da Pista vende UM básico de cada slot
   (`GANGUES_LOJA_EQUIP_BASICO`). Os itens incomuns/raros já estão
   catalogados aqui pro sistema de drop preencher — não têm preço de
   loja de propósito.

   Regra de remoção de carta (decisão do Isaias): tirar uma carta
   encaixada DESTRÓI a carta. Desequipar o item inteiro NÃO — as cartas
   continuam nele. Ver removerCartaEquip em useGanguesStore.js (quando o
   sistema de carta existir).
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

const nome = id => `games.gangues.equip.itens.${id}`

export const GANGUES_EQUIP = {
  // ── ARMA (🥊) — foco em A ──
  soqueira_lata: { id: 'soqueira_lata', slot: 'arma', raridade: 'comum', bonus: { A: 1 }, cardSlots: 0, custo: 16, icone: '🥊' },
  faca_serrilhada: { id: 'faca_serrilhada', slot: 'arma', raridade: 'incomum', bonus: { A: 2 }, cardSlots: 1, icone: '🔪' },
  cano_de_ferro: { id: 'cano_de_ferro', slot: 'arma', raridade: 'raro', bonus: { A: 2, H: 1 }, cardSlots: 2, icone: '🪈' },

  // ── CABEÇA (🪖) — foco em D ──
  gorro_moletom: { id: 'gorro_moletom', slot: 'cabeca', raridade: 'comum', bonus: { D: 1 }, cardSlots: 0, custo: 12, icone: '🧢' },
  capacete_obra: { id: 'capacete_obra', slot: 'cabeca', raridade: 'incomum', bonus: { D: 2 }, cardSlots: 1, icone: '⛑️' },
  coroa_lata: { id: 'coroa_lata', slot: 'cabeca', raridade: 'raro', bonus: { A: 1, D: 1 }, cardSlots: 2, icone: '👑' },

  // ── CORPO (🦺) — foco em R ──
  colete_couro: { id: 'colete_couro', slot: 'corpo', raridade: 'comum', bonus: { R: 1 }, cardSlots: 1, custo: 20, icone: '🦺' },
  jaqueta_rebite: { id: 'jaqueta_rebite', slot: 'corpo', raridade: 'incomum', bonus: { R: 1, D: 1 }, cardSlots: 1, icone: '🧥' },
  colete_balistico: { id: 'colete_balistico', slot: 'corpo', raridade: 'raro', bonus: { R: 2, D: 1 }, cardSlots: 2, icone: '🛡️' },

  // ── BRAÇOS (🧤) — foco em D/A ──
  luva_couro: { id: 'luva_couro', slot: 'bracos', raridade: 'comum', bonus: { D: 1 }, cardSlots: 0, custo: 12, icone: '🧤' },
  manopla_porca: { id: 'manopla_porca', slot: 'bracos', raridade: 'incomum', bonus: { A: 2 }, cardSlots: 1, icone: '🦾' },
  bracadeira_cravo: { id: 'bracadeira_cravo', slot: 'bracos', raridade: 'raro', bonus: { A: 1, D: 1 }, cardSlots: 2, icone: '⛓️' },

  // ── PÉS (🥾) — foco em H ──
  tenis_furado: { id: 'tenis_furado', slot: 'pes', raridade: 'comum', bonus: { H: 1 }, cardSlots: 0, custo: 12, icone: '👟' },
  coturno: { id: 'coturno', slot: 'pes', raridade: 'incomum', bonus: { H: 1, D: 1 }, cardSlots: 1, icone: '🥾' },
  bota_biqueira: { id: 'bota_biqueira', slot: 'pes', raridade: 'raro', bonus: { H: 2 }, cardSlots: 2, icone: '🦿' },

  // ── AMULETO (📿) — misto ──
  corrente_lata: { id: 'corrente_lata', slot: 'amuleto', raridade: 'comum', bonus: { H: 1 }, cardSlots: 1, custo: 16, icone: '📿' },
  dente_de_ouro: { id: 'dente_de_ouro', slot: 'amuleto', raridade: 'incomum', bonus: { A: 1 }, cardSlots: 1, icone: '🦷' },
  medalha_santa: { id: 'medalha_santa', slot: 'amuleto', raridade: 'raro', bonus: { R: 1, D: 1 }, cardSlots: 2, icone: '🎖️' },
}

// O que a loja da Pista vende — um básico de cada slot (ver pista.js).
export const GANGUES_LOJA_EQUIP_BASICO = ['gorro_moletom', 'colete_couro', 'luva_couro', 'tenis_furado', 'corrente_lata', 'soqueira_lata']

export const GANGUES_EQUIP_LISTA = Object.values(GANGUES_EQUIP).map(item => ({ ...item, nome: nome(item.id) }))

export function getGanguesEquip(itemId) {
  const item = GANGUES_EQUIP[itemId]
  return item ? { ...item, nome: nome(item.id) } : null
}

/** Estrutura vazia dos 6 slots equipados de um personagem. */
export function emptyGanguesEquipment() {
  return GANGUES_EQUIP_SLOT_IDS.reduce((acc, slot) => { acc[slot] = null; return acc }, {})
}

/** Normaliza o que veio do banco pro shape esperado (6 chaves, cards do tamanho certo). */
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
  return { uid: `eq-${itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId, cards: Array.from({ length: def.cardSlots }, () => null) }
}

/** Soma dos bônus de atributo de todos os itens equipados. */
export function getGanguesEquipBonuses(equipment = {}) {
  const total = { A: 0, H: 0, R: 0, D: 0 }
  const safe = normalizeGanguesEquipment(equipment)
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const def = safe[slot] && getGanguesEquip(safe[slot].itemId)
    if (!def) continue
    for (const attr of Object.keys(total)) total[attr] += Number(def.bonus?.[attr]) || 0
  }
  return total
}

/** Atributos A/H/R/D já com os bônus de equipamento somados (nunca abaixo de 0). */
export function getGanguesAttributesWithEquip(attributes = {}) {
  const bonuses = getGanguesEquipBonuses(attributes.equipment)
  const out = { ...attributes }
  for (const attr of ['A', 'H', 'R', 'D']) out[attr] = Math.max(0, (Number(attributes[attr]) || 0) + bonuses[attr])
  return out
}

/** Atributos efetivos SE `itemId` fosse equipado (trocando o que estiver no slot dele) —
 *  usado pela loja pra prever como a ficha de cada personagem ficaria antes de comprar. */
export function previewGanguesAttributesWithEquip(attributes = {}, itemId) {
  const def = getGanguesEquip(itemId)
  if (!def) return getGanguesAttributesWithEquip(attributes)
  const equipment = normalizeGanguesEquipment(attributes.equipment)
  equipment[def.slot] = { itemId: def.id, cards: Array.from({ length: def.cardSlots }, () => null) }
  return getGanguesAttributesWithEquip({ ...attributes, equipment })
}
