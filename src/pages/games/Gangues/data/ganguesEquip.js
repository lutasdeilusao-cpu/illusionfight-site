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
   em FAIXA (A/H/D, ver abaixo) OU recurso plano (pv/pm — somado em cima do PV/PM máximo,
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

// ── FAIXA (range) de bônus — pedido do Isaias, 27/09/2026 (plano completo em
// docs/Games/Gangues/PLANO_ITENS_RANGE.md): Porrada (A), Couro (D) e Pique
// (H) viraram FAIXA — `bonus: { A: [1, 3] }` rola de 1 a 3. Número solto
// continua valendo como fixo. Osso/Malandragem (pv/pm) ficam SEMPRE fixos:
// vida máxima mudando a cada luta não é "arma imprevisível", é só confuso.
//  • A rola a cada golpe, D a cada defesa, H uma vez no começo da luta.
//  • Toda faixa nasceu CENTRADA no valor fixo de antes (a Faca era +2 → 1–3,
//    média 2): simulado, +2 fixo × 1–3 empata em 50,3% num duelo espelhado —
//    o balanço já calibrado da Pista não muda, só a emoção de cada golpe.
//  • Preço = arredonda5(Σ média × peso × raridade). Pesos por ponto de média:
//    A 28 · D 22 · H 30 (Pique é velocidade desde o sistema do Pique, o
//    ponto mais valioso) · pv/pm 6. Raridade: comum 1 · incomum 1,1 ·
//    raro 1,3 · épico 1,6. Sem `custo` = não vende em loja (drop/recompensa).
// Lista bruta — id numérico + slug só pra humano. O resto é dado de balanço.
const CATALOGO = [
  // ── ARMA (🥊) — foco em A ──
  { id: 101, slug: 'soqueira_lata', slot: 'arma', raridade: 'comum', bonus: { A: [0, 2] }, cardSlots: 0, custo: 28, icone: '🥊' },
  { id: 102, slug: 'faca_serrilhada', slot: 'arma', raridade: 'incomum', bonus: { A: [1, 3] }, cardSlots: 1, custo: 60, icone: '🔪' },
  { id: 103, slug: 'cano_de_ferro', slot: 'arma', raridade: 'raro', bonus: { A: [1, 3], H: [0, 2] }, cardSlots: 2, custo: 110, icone: '🪈' },

  // ── CABEÇA (🪖) — foco em D ──
  { id: 104, slug: 'gorro_moletom', slot: 'cabeca', raridade: 'comum', bonus: { D: [0, 2] }, cardSlots: 0, custo: 22, icone: '🧢' },
  { id: 105, slug: 'capacete_obra', slot: 'cabeca', raridade: 'incomum', bonus: { D: [1, 3] }, cardSlots: 1, custo: 50, icone: '⛑️' },
  { id: 106, slug: 'coroa_lata', slot: 'cabeca', raridade: 'raro', bonus: { A: [0, 2], D: [0, 2] }, cardSlots: 2, custo: 65, icone: '👑' },

  // ── CORPO (🦺) — a escolha PV vs PM (bônus plano, fora do atributo) ──
  { id: 107, slug: 'colete_reforcado', slot: 'corpo', raridade: 'comum', bonus: { pv: 6 }, cardSlots: 0, custo: 36, icone: '🦺' }, // tanker
  { id: 108, slug: 'colete_leve', slot: 'corpo', raridade: 'comum', bonus: { pm: 6 }, cardSlots: 0, custo: 36, icone: '🧥' }, // magro / místico
  { id: 109, slug: 'colete_placa', slot: 'corpo', raridade: 'incomum', bonus: { pv: 12 }, cardSlots: 1, custo: 80, icone: '🛡️' },
  { id: 110, slug: 'manto_capuz', slot: 'corpo', raridade: 'incomum', bonus: { pm: 12 }, cardSlots: 1, custo: 80, icone: '🥋' },
  { id: 111, slug: 'armadura_rua', slot: 'corpo', raridade: 'raro', bonus: { pv: 18 }, cardSlots: 2, custo: 140, icone: '⚙️' },

  // ── BRAÇOS (🧤) — foco em D/A ──
  { id: 112, slug: 'luva_couro', slot: 'bracos', raridade: 'comum', bonus: { D: [0, 2] }, cardSlots: 0, custo: 22, icone: '🧤' },
  { id: 113, slug: 'manopla_porca', slot: 'bracos', raridade: 'incomum', bonus: { A: [1, 3] }, cardSlots: 1, custo: 60, icone: '🦾' },
  { id: 114, slug: 'bracadeira_cravo', slot: 'bracos', raridade: 'raro', bonus: { A: [0, 2], D: [0, 2] }, cardSlots: 2, custo: 65, icone: '⛓️' },

  // ── PÉS (🥾) — foco em H ──
  { id: 115, slug: 'tenis_furado', slot: 'pes', raridade: 'comum', bonus: { H: [0, 2] }, cardSlots: 0, custo: 30, icone: '👟' },
  { id: 116, slug: 'coturno', slot: 'pes', raridade: 'incomum', bonus: { H: [0, 2], D: [0, 2] }, cardSlots: 1, custo: 55, icone: '🥾' },
  { id: 117, slug: 'bota_biqueira', slot: 'pes', raridade: 'raro', bonus: { H: [1, 3] }, cardSlots: 2, custo: 80, icone: '🦿' },

  // ── AMULETO (📿) — misto leve ──
  { id: 118, slug: 'corrente_lata', slot: 'amuleto', raridade: 'comum', bonus: { H: [0, 2] }, cardSlots: 1, custo: 30, icone: '📿' },
  { id: 119, slug: 'dente_de_ouro', slot: 'amuleto', raridade: 'incomum', bonus: { A: [1, 2] }, cardSlots: 1, custo: 45, icone: '🦷' },
  { id: 120, slug: 'medalha_santa', slot: 'amuleto', raridade: 'raro', bonus: { D: [0, 2], H: [0, 2] }, cardSlots: 2, custo: 70, icone: '🎖️' },

  // ── Peças da FEIRA (121–131) — faixas mais largas ("2 a 4, 3 a 7 conforme
  // fica mais caro"). Entram nas lojas da Feira quando ela ganhar cena. ──
  { id: 121, slug: 'bone_vira_lata', slot: 'cabeca', raridade: 'comum', bonus: { H: [0, 2] }, cardSlots: 0, custo: 30, icone: '🧢' },
  { id: 122, slug: 'balaclava_pano', slot: 'cabeca', raridade: 'incomum', bonus: { D: [1, 3], H: [0, 1] }, cardSlots: 1, custo: 65, icone: '🥷' },
  { id: 123, slug: 'jaqueta_bonde', slot: 'corpo', raridade: 'comum', bonus: { pv: 8 }, cardSlots: 0, custo: 50, icone: '🧥' },
  { id: 124, slug: 'manto_sintonia', slot: 'corpo', raridade: 'raro', bonus: { pm: 18 }, cardSlots: 2, custo: 140, icone: '🥋' },
  { id: 125, slug: 'manopla_prego', slot: 'bracos', raridade: 'incomum', bonus: { A: [2, 4] }, cardSlots: 1, custo: 90, icone: '🦾' },
  { id: 126, slug: 'chinelo_reforcado', slot: 'pes', raridade: 'comum', bonus: { H: [0, 2], D: [0, 1] }, cardSlots: 0, custo: 40, icone: '🩴' },
  { id: 127, slug: 'corrente_ouro_falso', slot: 'amuleto', raridade: 'incomum', bonus: { A: [1, 3] }, cardSlots: 1, custo: 60, icone: '📿' },
  { id: 128, slug: 'terco_de_vo', slot: 'amuleto', raridade: 'raro', bonus: { D: [1, 3], H: [0, 2] }, cardSlots: 2, custo: 95, icone: '📿' },
  { id: 129, slug: 'facao_cabo_fita', slot: 'arma', raridade: 'incomum', bonus: { A: [2, 4] }, cardSlots: 1, custo: 90, icone: '🗡️' },
  { id: 130, slug: 'espeto_grade', slot: 'arma', raridade: 'raro', bonus: { A: [2, 5], D: [0, 2] }, cardSlots: 2, custo: 155, icone: '🔱' },
  { id: 131, slug: 'bastao_sinaleiro', slot: 'arma', raridade: 'incomum', bonus: { A: [1, 3], H: [0, 2] }, cardSlots: 1, custo: 95, icone: '🦯' },

  // ── ÉPICO de chefe — nunca à venda. Os outros épicos (132–137) entram
  // junto com o chefe de cada bairro. ──
  { id: 138, slug: 'porrete_do_cobrador', slot: 'arma', raridade: 'epico', bonus: { A: [3, 7], H: [1, 3], D: [0, 2] }, cardSlots: 2, icone: '🏏' },
  { id: 139, slug: 'facao_do_carvao', slot: 'arma', raridade: 'epico', bonus: { A: [2, 5], D: [0, 2] }, cardSlots: 2, icone: '🔪' },

  // ── PIQUE (140–144) — acessórios de velocidade. Faixa PEQUENA de
  // propósito: velocidade = Pique + base (10% da ficha média, 2–3 na
  // Pista), então +2 de Pique já deixa um personagem ~40% mais rápido. ──
  { id: 140, slug: 'chinelo_de_dedo', slot: 'pes', raridade: 'comum', bonus: { H: [0, 2] }, cardSlots: 0, custo: 30, icone: '🩴' },
  { id: 141, slug: 'relogio_parado', slot: 'amuleto', raridade: 'comum', bonus: { H: [1, 2] }, cardSlots: 0, custo: 45, icone: '⌚' },
  { id: 142, slug: 'tenis_corrida', slot: 'pes', raridade: 'incomum', bonus: { H: [1, 3] }, cardSlots: 1, custo: 65, icone: '👟' },
  { id: 143, slug: 'fita_bonfim', slot: 'amuleto', raridade: 'incomum', bonus: { H: [1, 3] }, cardSlots: 1, custo: 65, icone: '🎗️' },
  { id: 144, slug: 'pingente_asa', slot: 'amuleto', raridade: 'raro', bonus: { H: [2, 4] }, cardSlots: 2, icone: '🪽' },
]

export const GANGUES_EQUIP = Object.fromEntries(CATALOGO.map(item => [item.id, { ...item, nome: i18nNome(item.id) }]))
export const GANGUES_EQUIP_LISTA = Object.values(GANGUES_EQUIP)

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
 *  itemId numérico, `aprim` dentro do teto da peça). Item que não existe mais no
 *  catálogo é descartado do slot. Save antigo sem `aprim` = +0. */
export function normalizeGanguesEquipment(equipment = {}) {
  const safe = emptyGanguesEquipment()
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const equipped = equipment?.[slot]
    const def = equipped && getGanguesEquip(equipped.itemId)
    if (!def || def.slot !== slot) continue
    const cards = Array.from({ length: def.cardSlots }, (_, i) => equipped.cards?.[i] ?? null)
    safe[slot] = { itemId: def.id, cards, aprim: normalizarAprim(def, equipped.aprim) }
  }
  return safe
}

/** Instância de item pro inventário (uid próprio + sockets vazios + aprimoramento). */
export function createGanguesEquipInstance(itemId, aprim = 0) {
  const def = getGanguesEquip(itemId)
  if (!def) return null
  return { uid: `eq-${def.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: def.id, cards: Array.from({ length: def.cardSlots }, () => null), aprim: normalizarAprim(def, aprim) }
}

// ── Faixa, aprimoramento e rolagem ──────────────────────────────
// APRIMORAMENTO (plano em PLANO_ITENS_RANGE.md §3): só mexe no atributo
// PRINCIPAL da peça (o 1º com faixa). Nível ímpar = VANTAGEM (rola 2 vezes,
// fica com o maior); nível par = sobe o MÍNIMO em 1. Teto = mínimo encosta no
// máximo (faixa de 2 pontos → +4). "Com dois aprimoramentos, 1–3 dá 2–3."

/** O atributo que o aprimoramento mexe (1º A/H/D em faixa), ou null. */
export function atributoPrincipal(def) {
  if (!def?.bonus) return null
  return Object.keys(def.bonus).find(k => GANGUES_EQUIP_ATTR_KEYS.includes(k) && Array.isArray(def.bonus[k])) || null
}

/** Maior aprimoramento possível da peça (0 = não aprimora). */
export function aprimTeto(def) {
  const principal = atributoPrincipal(def)
  if (!principal) return 0
  const [min, max] = def.bonus[principal]
  return Math.max(0, 2 * (max - min))
}

function normalizarAprim(def, aprim) {
  const n = Math.floor(Number(aprim) || 0)
  return Math.max(0, Math.min(aprimTeto(def), n))
}

/** Faixa efetiva de `attr` numa peça, com o aprimoramento: { min, max, vant } ou null. */
export function faixaDaPeca(def, attr, aprim = 0) {
  const raw = def?.bonus?.[attr]
  if (raw == null) return null
  if (!Array.isArray(raw)) {
    const v = Number(raw) || 0
    return v ? { min: v, max: v, vant: false } : null
  }
  let [min, max] = raw
  let vant = false
  if (attr === atributoPrincipal(def)) {
    const n = normalizarAprim(def, aprim)
    min = Math.min(max, min + Math.floor(n / 2))
    vant = n % 2 === 1 && min < max
  }
  return { min, max, vant }
}

/** Valor médio de uma faixa (com vantagem = média do maior de 2 dados). */
export function mediaFaixa(f) {
  if (!f) return 0
  const n = f.max - f.min + 1
  if (!f.vant || n <= 1) return (f.min + f.max) / 2
  let soma = 0
  for (let v = f.min; v <= f.max; v++) soma += v * ((v - f.min + 1) ** 2 - (v - f.min) ** 2)
  return soma / (n * n)
}

/** Rola uma faixa (vantagem = rola 2, fica com o maior). */
export function rolarFaixa(f, rnd = Math.random) {
  if (!f) return 0
  const n = f.max - f.min + 1
  const um = () => f.min + Math.floor(rnd() * n)
  return f.vant ? Math.max(um(), um()) : um()
}

// Preço pela fórmula do plano (mesma dos preços do catálogo) — referência
// pra peça que não vende em loja (épico/prêmio) poder ser aprimorada também.
const PESO_PRECO = { A: 28, D: 22, H: 30, pv: 6, pm: 6 }
const FATOR_RARIDADE = { comum: 1, incomum: 1.1, raro: 1.3, epico: 1.6 }
export function precoReferencia(def) {
  if (!def) return 0
  if (Number.isFinite(def.custo)) return def.custo
  let soma = 0
  for (const [k, v] of Object.entries(def.bonus || {})) soma += (Array.isArray(v) ? (v[0] + v[1]) / 2 : Number(v) || 0) * (PESO_PRECO[k] || 0)
  return Math.round(soma * (FATOR_RARIDADE[def.raridade] || 1) / 5) * 5
}

// Custo de levar a peça pro nível `nivel` de aprimoramento: grana = 25% do
// preço × o nível (+1 = 25%, +4 = 100%, arredonda de 5 em 5, mínimo 5) e
// `nivel` pedaços de Sucata (item 13) — a Sucata vira recurso de verdade.
export const GANGUES_SUCATA_ID = 13
export const GANGUES_APRIM_CUSTO_FRAC = 0.25
export function custoAprimoramento(def, nivel) {
  const grana = Math.max(5, Math.round(precoReferencia(def) * GANGUES_APRIM_CUSTO_FRAC * nivel / 5) * 5)
  return { grana, sucata: nivel }
}

/** Todas as faixas de A/H/D do que está equipado, peça por peça (o combate
 *  rola cada uma separado): { A: [{min,max,vant}], H: [...], D: [...] }. */
export function getGanguesEquipDados(equipment = {}) {
  const dados = { A: [], H: [], D: [] }
  const safe = normalizeGanguesEquipment(equipment)
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const eq = safe[slot]
    const def = eq && getGanguesEquip(eq.itemId)
    if (!def) continue
    for (const attr of GANGUES_EQUIP_ATTR_KEYS) {
      const f = faixaDaPeca(def, attr, eq.aprim)
      if (f) dados[attr].push(f)
    }
  }
  return dados
}

/** Faixa TOTAL de cada atributo (soma dos mínimos e dos máximos) — pra ficha
 *  mostrar "Porrada 6–8". */
export function getGanguesEquipFaixas(equipment = {}) {
  const dados = getGanguesEquipDados(equipment)
  const out = {}
  for (const attr of GANGUES_EQUIP_ATTR_KEYS) {
    out[attr] = dados[attr].reduce((acc, f) => ({ min: acc.min + f.min, max: acc.max + f.max }), { min: 0, max: 0 })
  }
  return out
}

/** Soma dos bônus de todos os itens equipados: A/H/D pela MÉDIA da faixa
 *  (pode ser fracionária — quem exibe arredonda) + pv/pm (recurso plano).
 *  Média, nunca máximo: loja/ficha/aviso de nível não prometem mais do que a
 *  arma entrega. */
export function getGanguesEquipBonuses(equipment = {}) {
  const total = { A: 0, H: 0, D: 0, pv: 0, pm: 0 }
  const safe = normalizeGanguesEquipment(equipment)
  for (const slot of GANGUES_EQUIP_SLOT_IDS) {
    const eq = safe[slot]
    const def = eq && getGanguesEquip(eq.itemId)
    if (!def) continue
    for (const attr of GANGUES_EQUIP_ATTR_KEYS) total[attr] += mediaFaixa(faixaDaPeca(def, attr, eq.aprim))
    for (const key of GANGUES_EQUIP_RES_KEYS) total[key] += Number(def.bonus?.[key]) || 0
  }
  return total
}

/** "+1–3 Porrada ▲ · +6 PV" — resumo do bônus de uma peça nos 3 idiomas. */
export function textoBonusEquip(t, def, aprim = 0) {
  if (!def) return ''
  const parts = []
  for (const attr of GANGUES_EQUIP_ATTR_KEYS) {
    const f = faixaDaPeca(def, attr, aprim)
    if (!f) continue
    const valor = f.min === f.max ? `+${f.min}` : `+${f.min}–${f.max}`
    parts.push(`${valor}${f.vant ? '▲' : ''} ${t(`games.gangues.attr_labels.${attr}`)}`)
  }
  if (def.bonus?.pv) parts.push(`+${def.bonus.pv} PV`)
  if (def.bonus?.pm) parts.push(`+${def.bonus.pm} PM`)
  return parts.join(' · ')
}

/** Atributos A/H/D já com os bônus de equipamento somados (nunca abaixo de
 *  0) — PV/PM NÃO entram aqui: o bônus de equipamento pra eles é plano,
 *  somado direto no PV_max/PM_max (ver applyGanguesEquipResources), não no
 *  atributo em si (nunca foi, mesmo antes com R). */
export function getGanguesAttributesWithEquip(attributes = {}) {
  const bonuses = getGanguesEquipBonuses(attributes.equipment)
  const out = { ...attributes }
  for (const attr of ['A', 'H', 'D']) out[attr] = Math.max(0, Math.round((Number(attributes[attr]) || 0) + (bonuses[attr] || 0)))
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
  if (def) eq[def.slot] = { itemId: def.id, cards: Array.from({ length: def.cardSlots }, () => null), aprim: 0 }
  return eq
}

/** Atributos efetivos SE `itemId` fosse equipado — usado pela loja pra prever a ficha. */
export function previewGanguesAttributesWithEquip(attributes = {}, itemId) {
  return getGanguesAttributesWithEquip({ ...attributes, equipment: withGanguesEquip(attributes.equipment, itemId) })
}
