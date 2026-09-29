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
export const GANGUES_EQUIP_ATTR_KEYS = ['A', 'H', 'D', 'PM']
export const GANGUES_EQUIP_RES_KEYS = ['pv', 'pm']

const i18nNome = id => `games.gangues.equip.itens.${id}`

// Lista bruta — id numérico + slug só pra humano. O resto é dado de balanço.
// Catálogo POR CAMINHO (28/09/2026, Isaias — substitui por completo o 101–120,
// que sumiu dos saves). `caminho` = quem equipa: atacante (Porradeiro),
// defensor (Paredão), mistico (Mandingueiro) ou livre (qualquer um).
// Preço (29/09/2026): comum ×2, incomum ×2,5 do valor inicial — equipar a
// dupla no comum ≈ a Pista inteira + 1 vitória no Clube.
// Orçamento calibrado por simulação contra o Carvão (dupla): conjunto comum
// completo ≈ 2–3 níveis, incomum ≈ 4–5. Porrada/Couro só no incomum (+1 de
// Porrada num comum já valia ~4 níveis). O Mandingueiro rende mais com o
// mesmo orçamento (Malandragem `PM` = força do talento + gás). O Paredão
// nunca passa de +1 de Porrada.
const CATALOGO = [
  { id: 201, slug: 'cabo_vassoura', caminho: 'atacante', slot: 'arma', raridade: 'comum', bonus: { H: 1 }, cardSlots: 0, custo: 35, icone: '🧹' },
  { id: 202, slug: 'bone_aba_reta', caminho: 'atacante', slot: 'cabeca', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🧢' },
  { id: 203, slug: 'regata_rasgada', caminho: 'atacante', slot: 'corpo', raridade: 'comum', bonus: { pv: 3 }, cardSlots: 0, custo: 30, icone: '🎽' },
  { id: 204, slug: 'faixa_punho', caminho: 'atacante', slot: 'bracos', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🩹' },
  { id: 205, slug: 'tenis_furado', caminho: 'atacante', slot: 'pes', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '👟' },
  { id: 206, slug: 'corrente_lata', caminho: 'atacante', slot: 'amuleto', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 30, icone: '📿' },
  { id: 207, slug: 'soqueira_ferro', caminho: 'atacante', slot: 'arma', raridade: 'incomum', bonus: { A: 2 }, cardSlots: 1, custo: 150, icone: '🥊' },
  { id: 208, slug: 'bandana_bonde', caminho: 'atacante', slot: 'cabeca', raridade: 'incomum', bonus: { pv: 2 }, cardSlots: 1, custo: 75, icone: '🏴' },
  { id: 209, slug: 'jaqueta_couro', caminho: 'atacante', slot: 'corpo', raridade: 'incomum', bonus: { pv: 4 }, cardSlots: 1, custo: 95, icone: '🧥' },
  { id: 210, slug: 'munhequeira', caminho: 'atacante', slot: 'bracos', raridade: 'incomum', bonus: { H: 1 }, cardSlots: 1, custo: 100, icone: '🤛' },
  { id: 211, slug: 'coturno', caminho: 'atacante', slot: 'pes', raridade: 'incomum', bonus: { pv: 1 }, cardSlots: 1, custo: 70, icone: '🥾' },
  { id: 212, slug: 'dente_ouro', caminho: 'atacante', slot: 'amuleto', raridade: 'incomum', bonus: { pm: 2 }, cardSlots: 1, custo: 75, icone: '🦷' },
  { id: 213, slug: 'cano_curto', caminho: 'defensor', slot: 'arma', raridade: 'comum', bonus: { pv: 2 }, cardSlots: 0, custo: 30, icone: '🪈' },
  { id: 214, slug: 'gorro_moletom', caminho: 'defensor', slot: 'cabeca', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🧶' },
  { id: 215, slug: 'colete_reforcado', caminho: 'defensor', slot: 'corpo', raridade: 'comum', bonus: { pv: 4 }, cardSlots: 0, custo: 35, icone: '🦺' },
  { id: 216, slug: 'luva_couro', caminho: 'defensor', slot: 'bracos', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '🧤' },
  { id: 217, slug: 'chinelo_reforcado', caminho: 'defensor', slot: 'pes', raridade: 'comum', bonus: { pv: 2 }, cardSlots: 0, custo: 30, icone: '🩴' },
  { id: 218, slug: 'medalhinha', caminho: 'defensor', slot: 'amuleto', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 30, icone: '🏅' },
  { id: 219, slug: 'tampa_bueiro', caminho: 'defensor', slot: 'arma', raridade: 'incomum', bonus: { D: 1 }, cardSlots: 1, custo: 110, icone: '🛡️' },
  { id: 220, slug: 'capacete_obra', caminho: 'defensor', slot: 'cabeca', raridade: 'incomum', bonus: { D: 1 }, cardSlots: 1, custo: 110, icone: '⛑️' },
  { id: 221, slug: 'colete_placa', caminho: 'defensor', slot: 'corpo', raridade: 'incomum', bonus: { pv: 8 }, cardSlots: 1, custo: 125, icone: '🛡' },
  { id: 222, slug: 'bracadeira_pneu', caminho: 'defensor', slot: 'bracos', raridade: 'incomum', bonus: { pv: 2 }, cardSlots: 1, custo: 70, icone: '⛓️' },
  { id: 223, slug: 'bota_biqueira', caminho: 'defensor', slot: 'pes', raridade: 'incomum', bonus: { pv: 3 }, cardSlots: 1, custo: 80, icone: '🥾' },
  { id: 224, slug: 'terco_vo', caminho: 'defensor', slot: 'amuleto', raridade: 'incomum', bonus: { pm: 2 }, cardSlots: 1, custo: 75, icone: '📿' },
  { id: 225, slug: 'vela_preta', caminho: 'mistico', slot: 'arma', raridade: 'comum', bonus: { PM: 1 }, cardSlots: 0, custo: 45, icone: '🕯️' },
  { id: 226, slug: 'capuz_surrado', caminho: 'mistico', slot: 'cabeca', raridade: 'comum', bonus: { pm: 1 }, cardSlots: 0, custo: 25, icone: '🧙' },
  { id: 227, slug: 'manto_feira', caminho: 'mistico', slot: 'corpo', raridade: 'comum', bonus: { pm: 3 }, cardSlots: 0, custo: 35, icone: '🥻' },
  { id: 228, slug: 'pulseira_micanga', caminho: 'mistico', slot: 'bracos', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '📿' },
  { id: 229, slug: 'sandalia_couro', caminho: 'mistico', slot: 'pes', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 25, icone: '👡' },
  { id: 230, slug: 'guia_contas', caminho: 'mistico', slot: 'amuleto', raridade: 'comum', bonus: { pm: 2 }, cardSlots: 0, custo: 30, icone: '🔮' },
  { id: 231, slug: 'cajado_galho', caminho: 'mistico', slot: 'arma', raridade: 'incomum', bonus: { A: 1 }, cardSlots: 1, custo: 110, icone: '🪄' },
  { id: 232, slug: 'turbante', caminho: 'mistico', slot: 'cabeca', raridade: 'incomum', bonus: { PM: 1 }, cardSlots: 1, custo: 110, icone: '👳' },
  { id: 233, slug: 'manto_sintonia', caminho: 'mistico', slot: 'corpo', raridade: 'incomum', bonus: { pm: 4, pv: 1 }, cardSlots: 1, custo: 125, icone: '🥋' },
  { id: 234, slug: 'anel_coco', caminho: 'mistico', slot: 'bracos', raridade: 'incomum', bonus: { pv: 2 }, cardSlots: 1, custo: 70, icone: '💍' },
  { id: 235, slug: 'chinelo_benzido', caminho: 'mistico', slot: 'pes', raridade: 'incomum', bonus: { pm: 2 }, cardSlots: 1, custo: 75, icone: '🩴' },
  { id: 236, slug: 'olho_grego', caminho: 'mistico', slot: 'amuleto', raridade: 'incomum', bonus: { PM: 1 }, cardSlots: 1, custo: 110, icone: '🧿' },
  { id: 237, slug: 'soqueira_lata', caminho: 'livre', slot: 'arma', raridade: 'comum', bonus: { A: 1 }, cardSlots: 0, icone: '🥊' },
  { id: 238, slug: 'bone_vira_lata', caminho: 'livre', slot: 'cabeca', raridade: 'comum', bonus: { pv: 1 }, cardSlots: 0, custo: 20, icone: '🧢' },
]

export const GANGUES_EQUIP = Object.fromEntries(CATALOGO.map(item => [item.id, { ...item, nome: i18nNome(item.id) }]))
export const GANGUES_EQUIP_LISTA = Object.values(GANGUES_EQUIP)

/** Esse personagem pode usar essa peça? (peça `livre` = qualquer um). */
export function podeEquiparGangues(def, member) {
  if (!def) return false
  return def.caminho === 'livre' || def.caminho === member?.combat_path
}

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
  const total = { A: 0, H: 0, D: 0, PM: 0, pv: 0, pm: 0 }
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
  for (const attr of GANGUES_EQUIP_ATTR_KEYS) out[attr] = Math.max(0, (Number(attributes[attr]) || 0) + (bonuses[attr] || 0))
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
