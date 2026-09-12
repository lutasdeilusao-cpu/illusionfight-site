import catalog from './ldi_gangues_30_personagens_v1.json'
import { normalizeGanguesEquipment } from './ganguesEquip.js'

export const GANGUES_CHARACTER_CATALOG = Object.freeze(catalog.characters)
export const GANGUES_CHARACTER_BY_ID = new Map(GANGUES_CHARACTER_CATALOG.map(character => [character.id, character]))
export const GANGUES_INITIAL_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_1_initial])
export const GANGUES_FIRST_CAMPAIGN_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_1_initial, ...catalog.unlock_plan.wave_2_first_clear])
export const GANGUES_SECOND_CLEAR_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_3_second_clear])
export const GANGUES_EVENT_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.event_only])
// Teto de nível dos personagens jogáveis = 99. O catálogo
// (ldi_gangues_30_personagens_v1.json) traz os 99 níveis AUTORADOS por
// personagem: níveis 1-10 são os stats originais desenhados (balanceamento já
// simulado), 11-99 seguem o `growth_order` do personagem (+1 atributo/nível,
// fiel à identidade do caminho). Poderes de assinatura liberam devagar
// (níveis 4/12/24/40) e sobem de rank ao longo da 2ª metade. Nível 99 numa
// ficha da gangue libera o multiplayer (ver ganguesTemMultiplayer). O único
// nível 100 do jogo é o chefe final, O Retalho (fora deste sistema — é enemy).
export const GANGUES_LEVEL_CAP = 99
export const GANGUES_AP_PER_XP = catalog.meta.ap_per_xp

// Resistência (R) saiu de cena — virou DOIS atributos compráveis separados,
// PV e PM (cada um com sua própria taxa por caminho, igual R tinha antes —
// só que agora o jogador investe nos dois de forma independente, não os
// dois de uma vez). O ganho de atributo por nível é autorado por personagem
// (growth_order = identidade dela: um Bruto sobe A, um Muralha sobe D/PV,
// etc) — sempre +1 ponto cheio por nível, sem exceção (ver
// scripts/gangues-regen-catalog.cjs, que gera `levels[]` no catálogo).
export const GANGUES_ATTRS = ['A', 'H', 'D', 'PV', 'PM']

export function getGanguesCharacter(characterTemplateId) {
  return GANGUES_CHARACTER_BY_ID.get(Number(characterTemplateId)) || null
}

// 1 ponto de XP = 1 nível, sempre — é essa a regra (custo de AP por XP já
// cresce a cada nível: 10/15/20/25/30..., ver ganguesApCostForLevel em
// ganguesLoadout.js). A tabela `xp_total_required_by_level` do catálogo
// (0,1,3,5,8,11...) era CUMULATIVA e crescente — exigia várias conversões
// de AP→XP pra subir 1 único nível a partir do nível 2 em diante, mesmo já
// tendo enchido a barra de PA inteira. Resultado: o jogador enchia a barra,
// via ela zerar, e não subia de nível — "só passa o primeiro nível" era
// literal, porque só o nível 1→2 dessa tabela precisava de exatamente 1 XP.
export function getGanguesLevelFromXp(xpTotal = 0) {
  const xp = Math.max(0, Number(xpTotal) || 0)
  return Math.min(GANGUES_LEVEL_CAP, 1 + Math.floor(xp))
}

// Taxas PV/PM por ponto de R (iguais a GANGUES_RESOURCE_RATES em ganguesLoadout
// — duplicadas de propósito pra evitar ciclo de import). Níveis 11–99 no
// catálogo guardam só `stats` (o resto é derivável) — aqui recompomos.
const RES_RATE = { atacante: { pv: 3, pm: 3 }, defensor: { pv: 4, pm: 2 }, mistico: { pv: 2, pm: 4 } }

/** Eventos de um nível — normaliza a forma compacta dos níveis 11–99
 *  (`up` = atributo +1, `ev` = unlock_special / special_rank) na forma cheia
 *  dos níveis 1–10 (`events: [...]`). */
export function eventosDoNivel(lvl) {
  if (!lvl) return []
  if (lvl.events) return lvl.events
  const out = []
  if (lvl.up) out.push({ type: 'attribute', attribute: lvl.up, delta: 1 })
  if (lvl.ev) out.push(...lvl.ev)
  return out
}

function completarNivel(character, lvl) {
  if (!lvl || lvl.resources) return lvl
  const r = RES_RATE[character.combat_path] || { pv: 0, pm: 0 }
  // PV e PM agora são DOIS atributos comprados separadamente (ver
  // GANGUES_ATTRS acima) — cada um com sua taxa própria por caminho, igual
  // R tinha antes (era um atributo só alimentando os dois de uma vez).
  return {
    xp_total_required: lvl.level - 1,
    resources: { pv_max: (lvl.stats?.PV || 0) * r.pv, pm_max: (lvl.stats?.PM || 0) * r.pm },
    ...lvl,
    events: eventosDoNivel(lvl),
  }
}

export function getGanguesTemplateLevel(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return null
  const level = getGanguesLevelFromXp(xpTotal)
  return completarNivel(character, character.levels.find(item => item.level === level) || character.levels[0])
}

/** Especiais já ABERTOS no nível atual — conta os eventos `unlock_special` dos
 *  níveis autorados até aqui (não é mais um slice cego por nível). */
export function getGanguesUnlockedSpecials(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return []
  const level = getGanguesLevelFromXp(xpTotal)
  const abertos = new Set()
  for (const lvl of character.levels) {
    if (lvl.level > level) break
    for (const ev of eventosDoNivel(lvl)) if (ev.type === 'unlock_special') abertos.add(ev.special_id)
  }
  return character.signature_specials.filter(s => abertos.has(s.id))
}

/** Nível de cada especial de assinatura no nível atual (rank 1→2→3), a partir
 *  dos eventos `unlock_special` (rank 1) + `special_rank` dos níveis autorados. */
export function getGanguesSpecialRanks(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return {}
  const level = getGanguesLevelFromXp(xpTotal)
  const ranks = {}
  for (const lvl of character.levels) {
    if (lvl.level > level) break
    for (const ev of eventosDoNivel(lvl)) {
      if (ev.type === 'unlock_special') ranks[ev.special_id] = Math.max(ranks[ev.special_id] || 0, 1)
      else if (ev.type === 'special_rank') ranks[ev.special_id] = Math.max(ranks[ev.special_id] || 0, ev.rank)
    }
  }
  return ranks
}

/** Em que nível um especial de assinatura abre (pro selo "NV x" da grade). */
export function getGanguesSpecialUnlockLevel(character, specialId) {
  for (const lvl of character?.levels || []) {
    for (const ev of eventosDoNivel(lvl)) if (ev.type === 'unlock_special' && ev.special_id === specialId) return lvl.level
  }
  return null
}

export function hydrateGanguesTemplateSheet(sheet = {}) {
  const character = getGanguesCharacter(sheet.character_template_id)
  if (!character) return sheet
  const xpTotal = Math.max(0, Number(sheet.xp_total) || 0)
  const level = getGanguesLevelFromXp(xpTotal)
  const levelData = getGanguesTemplateLevel(character.id, xpTotal)
  const unlocked = getGanguesUnlockedSpecials(character.id, xpTotal)
  const ranks = getGanguesSpecialRanks(character.id, xpTotal)
  // BUG (o Isaias reportou: "ainda tô com os 2 poderes iniciais" mesmo no
  // L21) — esta função reidrata a ficha inteira toda vez que ela carrega
  // (login, troca de tela, cada save), e SEMPRE recalculava selected_specials
  // do zero como "os 2 últimos poderes abertos", jogando fora qualquer
  // escolha feita na tela de Progressão (GanguesProgression.jsx) — a escolha
  // do jogador nunca sobrevivia a um recarregamento. Agora: se já existe uma
  // seleção salva, ela é PRESERVADA (só tira poder que não existe mais). O
  // auto-default "últimos 2 abertos" só roda na hidratação BEM primeira
  // (recruta novo, `selected_specials` ainda nem existe na ficha).
  const unlockedActiveIds = new Set(unlocked.filter(special => special.kind === 'active').map(special => special.id))
  const salvos = sheet.attributes?.progression?.selected_specials
  const selectedSpecials = Array.isArray(salvos)
    ? salvos.filter(id => unlockedActiveIds.has(id))
    : unlocked.filter(special => special.kind === 'active').slice(-2).map(special => special.id)
  const progression = {
    ap: Math.max(0, Number(sheet.attributes?.progression?.ap) || 0),
    xp_unspent: 0,
    special_path: character.special_path,
    special_path_unlocked: true,
    special_levels: Object.fromEntries(unlocked.map(special => [special.id, ranks[special.id] || 1])),
    selected_specials: selectedSpecials,
  }
  return {
    ...sheet,
    sheet_name: character.name,
    character_type: 'template',
    character_template_id: character.id,
    combat_path: character.combat_path,
    level,
    // pv_atual/pm_atual: ver comentário em normalizeGanguesLoadout (ganguesLoadout.js) —
    // precisa ser copiado manualmente porque esta função também reconstrói
    // `attributes` do zero a cada hidratação.
    // equipment: ver comentário em normalizeGanguesLoadout — copiado manualmente
    // porque esta função também reconstrói `attributes` do zero a cada hidratação.
    attributes: { ...levelData.stats, progression, character_type: 'template', character_template_id: character.id, pv_atual: sheet.attributes?.pv_atual, pm_atual: sheet.attributes?.pm_atual, equipment: normalizeGanguesEquipment(sheet.attributes?.equipment) },
    elemental: 'neutro',
    loadout_version: 3,
  }
}

// Troca (equipa/desequipa) um poder ATIVO na seleção de batalha (máx. 2) de
// uma ficha de personagem (template). Existia FICHA NENHUMA que chamasse isso
// de verdade — GanguesProgression.jsx (a tela real que o jogador abre) usava
// só GanguesSkillGrid, que é SÓ LEITURA (mostra o que já abriu, sem botão de
// equipar); o toggle antigo (toggleGanguesSpecial, em ganguesLoadout.js) é de
// um sistema PARALELO e incompatível (o "caminho especial" genérico de
// ganguesSpecials.js, com ids tipo bruto/duelista) que não reconhece os ids
// dos signature_specials autorados por personagem (ex: soco_de_ferro) — não
// dava pra usar pra template nenhum. Esta função trabalha direto em cima de
// getGanguesUnlockedSpecials (a lista certa) e do array cru salvo na ficha.
export function toggleGanguesTemplateSpecial(sheet, specialId) {
  const unlocked = getGanguesUnlockedSpecials(sheet.character_template_id, sheet.xp_total)
  const podeEquipar = unlocked.some(special => special.id === specialId && special.kind === 'active')
  if (!podeEquipar) return null
  const atuais = Array.isArray(sheet.attributes?.progression?.selected_specials) ? sheet.attributes.progression.selected_specials : []
  const selected = atuais.includes(specialId)
    ? atuais.filter(id => id !== specialId)
    : atuais.length < 2 ? [...atuais, specialId] : atuais
  return { attributes: { ...sheet.attributes, progression: { ...sheet.attributes?.progression, selected_specials: selected } } }
}

// `xpTotal` deixa o recruta nascer já ADIANTADO (ver recrutamento escalonado
// em GanguesCreate.jsx — o 1º recruta pós-fundação vem L5, o 2º L10, e por
// aí vai, +5 em +5). Default 0 = nasce no nível 1, como a dupla fundadora.
export function createGanguesTemplateSheet(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return null
  return hydrateGanguesTemplateSheet({
    id: null,
    character_type: 'template',
    character_template_id: character.id,
    xp_total: Math.max(0, Number(xpTotal) || 0),
    attributes: { progression: { ap: 0 } },
  })
}

export function getGanguesAvailableCharacterIds({ campaignClears = 0, storyProgress = {}, rep = 0, eventCharacterIds = [] } = {}) {
  const available = new Set(GANGUES_INITIAL_CHARACTER_IDS)
  const dominated = Object.values(storyProgress || {}).filter(value => value?.chefe).length
  const firstCampaignPool = catalog.unlock_plan.wave_2_first_clear
  firstCampaignPool.slice(0, Math.min(firstCampaignPool.length, dominated + (rep >= 50 ? 1 : 0))).forEach(id => available.add(id))
  if (campaignClears >= 1) GANGUES_FIRST_CAMPAIGN_CHARACTER_IDS.forEach(id => available.add(id))
  if (campaignClears >= 2) GANGUES_SECOND_CLEAR_CHARACTER_IDS.forEach(id => available.add(id))
  eventCharacterIds.filter(id => GANGUES_EVENT_CHARACTER_IDS.includes(Number(id))).forEach(id => available.add(Number(id)))
  return [...available]
}
