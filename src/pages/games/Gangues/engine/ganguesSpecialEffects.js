import { getGanguesProgression } from '../data/ganguesLoadout.js'
import { GANGUES_SPECIAL_PATHS, getGanguesSpecials } from '../data/ganguesSpecials.js'

// Valores numéricos padrão da skill tree — ponto de partida pra testar e balancear, não é
// balanceamento final. Design detalhado do Atacante em
// docs/Games/Gangues/GANGUES_PROGRESSAO_RASCUNHO.md; alguns mecanismos de duração/fila de turno
// descritos lá (Investida furar iniciativa, Marca/Fratura durarem N turnos, Fôlego Final dar
// ação extra) foram simplificados aqui pra caber no modelo atual de 1 ação por turno, sem fila
// de status — o efeito líquido (bônus/penalidade) foi mantido, o "como" foi simplificado.
// Defensor e Místico ainda não têm design por poder (só nomes) — usam template genérico por
// kind/caminho até ganharem uma passada de design como o Atacante teve.

const E = (type, values, cost = null) => ({ type, values, cost })

const GANGUES_SPECIAL_EFFECTS = {
  // Bruto
  soco_de_ferro: E('damage_flat', [3, 5, 7], { kind: 'pm', values: [2, 2, 2] }),
  investida: E('bonus_if_target_fresh', [2, 3, 4], { kind: 'pm', values: [1, 1, 1] }),
  peso_bruto: E('atk_flat_if_pm_above_half', [1, 2, 3]),
  marreta: E('damage_flat', [2, 4, 6], { kind: 'pm', values: [2, 2, 1] }),
  fim_de_linha: E('damage_flat', [6, 9, 12], { kind: 'pm', values: [4, 4, 3] }),

  // Duelista
  golpe_certeiro: E('ignore_def_pct', [20, 30, 40], { kind: 'pm', values: [2, 2, 2] }),
  fluidez: E('damage_flat', [3, 5, 7], { kind: 'pm', values: [3, 3, 2] }),
  leitura_de_combate: E('ignore_def_pct', [10, 15, 20]),
  marca: E('damage_flat', [2, 3, 5], { kind: 'pm', values: [1, 1, 1] }),
  execucao: E('execute_bonus', [50, 70, 90], { kind: 'pm', values: [3, 3, 2] }),

  // Fúria
  sangue_fervente: E('low_pv_scale', [3, 5, 8]),
  grito_de_guerra: E('self_sacrifice_damage', [3, 5, 7], { kind: 'pv', values: [10, 10, 8] }),
  folego_final: E('low_pv_gate_bonus', [4, 6, 8], { kind: 'pm', values: [2, 1, 1] }),
  ignorar_a_dor: E('shield_next_hit', [2, 3, 4], { kind: 'pm', values: [1, 1, 1] }),
  ultima_investida: E('lifetime_pv_lost_nuke', [30, 50, 70], { kind: 'pm', values: [4, 4, 3] }),

  // Especialista
  precisao_absoluta: E('habilidade_full_convert', [2, 1, 0]),
  ponto_de_pressao: E('damage_flat', [3, 4, 6], { kind: 'pm', values: [2, 2, 1] }),
  fratura_de_ilusao: E('damage_flat', [3, 4, 5], { kind: 'pm', values: [2, 1, 1] }),
  foco_cirurgico: E('damage_flat', [2, 4, 6], { kind: 'pm', values: [1, 1, 1] }),
  colapso_mental: E('damage_flat', [5, 8, 11], { kind: 'pm', values: [3, 3, 2] }),

  // Vingador
  casca_dura: E('def_flat', [1, 2, 3]),
  absorver_impacto: E('charge_on_hit_taken', [1, 2, 3]),
  contragolpe: E('spend_charge_damage', [1, 2, 3], { kind: 'pm', values: [1, 1, 1] }),
  postura_firme: E('shield_next_hit', [2, 3, 4], { kind: 'pm', values: [2, 1, 1] }),
  retribuicao_final: E('lifetime_pv_lost_nuke', [30, 50, 70], { kind: 'pm', values: [4, 4, 3] }),
}

const KIND_BY_ID = {}
const PATH_BY_ID = {}
for (const [combatPath, paths] of Object.entries(GANGUES_SPECIAL_PATHS)) {
  for (const item of paths) for (const special of item.specials) { KIND_BY_ID[special.id] = special.kind; PATH_BY_ID[special.id] = combatPath }
}

// Defensor e Místico: template genérico (sem design por poder ainda) — passivo dá um bônus fixo
// de atributo, ativo custa PM por um efeito ofensivo/defensivo fixo. Ver seção 14 do
// GANGUES_DESIGN.md.
function genericEffect(id) {
  const kind = KIND_BY_ID[id]
  const combatPath = PATH_BY_ID[id]
  if (combatPath === 'defensor') return kind === 'passive' ? E('def_flat', [1, 2, 3]) : E('damage_reduction_next_hit', [2, 3, 4], { kind: 'pm', values: [2, 2, 1] })
  if (combatPath === 'mistico') return kind === 'passive' ? E('atk_flat', [1, 2, 3]) : E('damage_flat', [3, 5, 7], { kind: 'pm', values: [2, 2, 2] })
  return E('damage_flat', [2, 3, 4], { kind: 'pm', values: [1, 1, 1] })
}

export function getGanguesSpecialEffect(id) {
  return GANGUES_SPECIAL_EFFECTS[id] || genericEffect(id)
}

// Monta a lista de efeitos que valem nesta resolução: todos os passivos equipados + a ativa
// escolhida pelo jogador (se equipada, com nível > 0 e custo pagável). `activeSpecialId` só
// importa pro lado atacante — quem defende nunca "escolhe" usar uma ativa.
export function buildGanguesEffectsList(member, activeSpecialId = null) {
  const progression = getGanguesProgression(member)
  const specials = getGanguesSpecials(member)
  const equippedIds = progression.selected_specials || []
  const list = []
  for (const id of equippedIds) {
    const level = progression.special_levels[id] || 0
    if (level <= 0) continue
    const spec = specials.find(item => item.id === id)
    if (!spec) continue
    const effect = getGanguesSpecialEffect(id)
    if (spec.kind === 'active') {
      if (id !== activeSpecialId) continue
      if (effect.cost) {
        const cost = effect.cost.values[level - 1]
        if (effect.cost.kind === 'pm' && (member.pm || 0) < cost) continue
        if (effect.cost.kind === 'pv' && (member.pv || 0) <= 1) continue
      }
      list.push({ id, kind: 'active', level, effect })
    } else {
      list.push({ id, kind: 'passive', level, effect })
    }
  }
  return list
}

// Lista os poderes ativos equipados (nível > 0) do personagem, pra montar os botões de ação em
// combate — inclui mesmo os que ele não tem recurso pra pagar agora (o chamador decide como
// desabilitar visualmente).
export function getEquippedActiveGanguesSpecials(member) {
  const progression = getGanguesProgression(member)
  const specials = getGanguesSpecials(member)
  const equippedIds = progression.selected_specials || []
  return equippedIds
    .map(id => {
      const level = progression.special_levels[id] || 0
      const spec = specials.find(item => item.id === id)
      if (!spec || spec.kind !== 'active' || level <= 0) return null
      return { id, level, effect: getGanguesSpecialEffect(id) }
    })
    .filter(Boolean)
}

export function applyGanguesAttackerEffect(item, ctx) {
  const { effect, level } = item
  const v = effect.values[level - 1]
  switch (effect.type) {
    case 'atk_flat':
    case 'damage_flat':
      ctx.faMod += v; break
    case 'atk_flat_if_pm_above_half':
      if ((ctx.attacker.pm || 0) > (ctx.attacker.pmMax || 0) / 2) ctx.faMod += v
      break
    case 'low_pv_scale': {
      const ratio = 1 - (ctx.attacker.pv || 0) / Math.max(1, ctx.attacker.pvMax || 1)
      ctx.faMod += Math.round(v * ratio)
      break
    }
    case 'habilidade_full_convert': {
      const habilidade = Number(ctx.attacker.attributes?.H) || 0
      ctx.faMod += Math.ceil(habilidade / 2) - v
      break
    }
    case 'ignore_def_pct':
      ctx.ignoreDefPct = Math.max(ctx.ignoreDefPct, v); break
    case 'bonus_if_target_fresh':
      if (!ctx.target.actedThisRound) ctx.faMod += v
      break
    case 'execute_bonus':
      if ((ctx.target.pv || 0) / Math.max(1, ctx.target.pvMax || 1) <= 0.3) { ctx.ignoreDefPct = Math.max(ctx.ignoreDefPct, v); ctx.faMod += 2 }
      break
    case 'self_sacrifice_damage':
      ctx.faMod += v; break
    case 'low_pv_gate_bonus':
      if ((ctx.attacker.pv || 0) / Math.max(1, ctx.attacker.pvMax || 1) <= 0.3) ctx.faMod += v
      break
    case 'shield_next_hit':
    case 'damage_reduction_next_hit':
      ctx.selfShieldSet = v; break
    case 'lifetime_pv_lost_nuke':
      ctx.faMod += Math.round((ctx.attacker.specialState?.totalPvLost || 0) * (v / 100))
      break
    case 'spend_charge_damage': {
      const charge = ctx.attacker.specialState?.charge || 0
      ctx.faMod += charge * v
      ctx.chargeSpent = charge
      break
    }
    default: break
  }
  if (item.kind === 'active' && effect.cost) {
    const cost = effect.cost.values[level - 1]
    if (effect.cost.kind === 'pm') ctx.pmCost = cost
    if (effect.cost.kind === 'pv') ctx.pvCostPct = cost
  }
}

export function applyGanguesDefenderEffect(item, ctx) {
  const { effect, level } = item
  const v = effect.values[level - 1]
  switch (effect.type) {
    case 'def_flat': ctx.fdMod += v; break
    case 'charge_on_hit_taken': ctx.chargeGain += v; break
    default: break
  }
}
