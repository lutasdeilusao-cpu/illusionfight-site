import { applyGanguesAttackerEffect, applyGanguesDefenderEffect, buildGanguesEffectsList } from './ganguesSpecialEffects.js'
import { aplicarStatus, acordarAoApanhar, modAtaqueStatus, modDefesaStatus } from './ganguesStatus.js'

/**
 * Bônus de caminho — regra combinada com Isaias em 2026-08-04:
 * - Atacante: +1 no ataque, por sorte (50%, mostrado no log se caiu ou não).
 * - Defensor: +1 na defesa, por sorte (50%), mesma lógica do lado defensivo.
 * - Místico: todo ataque dele é mágico neste sistema (não há escolha de modo físico/mágico
 *   separada), então o +1 de ataque é garantido sempre que ele ataca. Na defesa, só ganha
 *   +1 quando o atacante também é místico (mágica contra mágica); contra ataque físico não
 *   recebe bônus de defesa nenhum.
 */
function resolveAttackerBonus(attackerPath, bonusRoll) {
  return { path: null, applied: false, amount: 0 }
}

function resolveDefenderBonus(defenderPath, attackerPath, bonusRoll) {
  return { path: null, applied: false, amount: 0 }
}

// O dado de ataque é um d3 (1-3). Tirar o valor máximo (3) é crítico: soma +2 na rolagem
// do ataque (então um 3 crítico vale 5 no cálculo de FA). Só o ataque critica, não a defesa.
export const ATTACK_DIE_SIDES = 3
export const CRITICAL_BONUS = 2

// Sem piso de dano — defesa bem investida pode anular o golpe (dano 0). Isaias
// removeu o mínimo garantido de 1 depois de jogar bastante: com bandos grandes,
// aquele "sempre acerta pelo menos 1" deixava todo hit relevante, sem chance de
// defesa de verdade zerar o golpe. FA/FD continuam calculados igual; só o clamp
// final mudou de Math.max(1, ...) pra Math.max(0, ...).
//
// `activeSpecialId`: id do poder ativo equipado que o atacante escolheu usar nesta ação (ou
// null pra ataque normal). Efeitos passivos equipados de ambos os lados aplicam sempre. Ver
// engine/ganguesSpecialEffects.js pros valores e docs/Games/Gangues/LDI_GANGUES_GDD.md §17.3
// pro design original (com as simplificações feitas pra caber no modelo de 1 ação por turno).
export function resolveGanguesAction({ attacker, defender, action, rolls, activeSpecialId = null, forcedSpecial = null }) {
  // Status (ganguesStatus.js): Fraco tira Porrada de quem bate, Rachado tira Couro de quem apanha.
  const attack = Math.max(0, (Number(attacker.attributes?.A) || 0) + modAtaqueStatus(attacker.statuses))
  const defense = Math.max(0, (Number(defender.attributes?.D) || 0) + modDefesaStatus(defender.statuses))

  const attackerBonus = resolveAttackerBonus(attacker.combat_path, rolls.attackerBonus)
  const defenderBonus = resolveDefenderBonus(defender.combat_path, attacker.combat_path, rolls.defenderBonus)

  const critical = rolls.fa === ATTACK_DIE_SIDES
  const attackRollValue = rolls.fa + (critical ? CRITICAL_BONUS : 0)

  const attackerEffects = buildGanguesEffectsList(attacker, activeSpecialId, forcedSpecial)
  const defenderEffects = buildGanguesEffectsList(defender, null)
  const ctx = { attacker, target: defender, faMod: 0, fdMod: 0, ignoreDefPct: 0, targetDefenseReduction: 0, pmCost: 0, pvCostPct: 0, selfShieldSet: 0, chargeGain: 0, chargeSpent: 0, statusAplicar: null }
  // Achado do Isaias (19/09/2026): quando um PODER ATIVO é usado, o dado
  // mostra "⚡ Nome do poder ⚡" (ver `powerName` em DramaticDice.jsx) — mas
  // um poder PASSIVO nunca tinha nenhum destaque, mesmo quando o efeito dele
  // fez diferença de verdade na jogada (ex.: "Segunda Respiração" só entra
  // com PV crítico, "Passo Elétrico" só se o alvo ainda não agiu no round —
  // sem aviso nenhum, o jogador nunca sabia QUANDO um passivo condicional
  // realmente disparou). `passivosGatilho` registra o id de cada passivo
  // (nunca ativo — esse já tem o próprio destaque) cujo efeito mudou de
  // verdade o resultado desta ação — compara um retrato ANTES/DEPOIS de
  // cada item aplicado, só nos campos numéricos que os efeitos mexem (não
  // `attacker`/`target`, que não mudam durante o loop).
  const camposComparados = ['faMod', 'fdMod', 'ignoreDefPct', 'targetDefenseReduction', 'pmCost', 'pvCostPct', 'selfShieldSet', 'chargeGain', 'chargeSpent']
  const retrato = () => camposComparados.map(campo => ctx[campo])
  const mudou = (antes, depois) => camposComparados.some((_, i) => antes[i] !== depois[i])
  const passivosGatilho = { attacker: [], defender: [] }
  for (const item of attackerEffects) {
    const antes = retrato()
    applyGanguesAttackerEffect(item, ctx)
    if (item.kind === 'passive' && mudou(antes, retrato())) passivosGatilho.attacker.push(item.id)
  }
  for (const item of defenderEffects) {
    const antes = retrato()
    applyGanguesDefenderEffect(item, ctx)
    if (item.kind === 'passive' && mudou(antes, retrato())) passivosGatilho.defender.push(item.id)
  }

  const effectiveDefense = Math.max(0, Math.round(defense * (1 - ctx.ignoreDefPct / 100)) - ctx.targetDefenseReduction)

  // Sistema do Pique (26/09/2026): o Pique (H) saiu do ataque — agora é só
  // velocidade na linha do tempo (ganguesLinhaDoTempo.js). Quem pesa no golpe
  // de TALENTO é a Malandragem (PM): + metade dela, só quando um talento ativo
  // entra na jogada. Ataque normal = Porrada + dado.
  const talentoAtivo = attackerEffects.some(item => item.kind === 'active')
  const malandragem = talentoAtivo ? Math.floor((Number(attacker.attributes?.PM) || 0) / 2) : 0
  const fa = attack + malandragem + attackRollValue + (attackerBonus.applied ? attackerBonus.amount : 0) + ctx.faMod
  const fd = effectiveDefense + rolls.fd + (defenderBonus.applied ? defenderBonus.amount : 0) + ctx.fdMod
  let damage = Math.max(0, fa - fd)

  const incomingShield = defender.specialState?.shield || 0
  let shieldConsumed = 0
  if (incomingShield > 0) { shieldConsumed = Math.min(incomingShield, damage); damage = Math.max(0, damage - incomingShield) }

  const pvCost = ctx.pvCostPct ? Math.max(1, Math.ceil((attacker.pv || 0) * ctx.pvCostPct / 100)) : 0

  const attackerSpecialState = {
    ...(attacker.specialState || {}),
    charge: ctx.chargeSpent ? 0 : (attacker.specialState?.charge || 0),
    shield: ctx.selfShieldSet || (attacker.specialState?.shield || 0),
  }
  const defenderSpecialState = {
    ...(defender.specialState || {}),
    charge: (defender.specialState?.charge || 0) + ctx.chargeGain,
    shield: incomingShield > 0 ? 0 : (defender.specialState?.shield || 0),
    totalPvLost: (defender.specialState?.totalPvLost || 0) + damage,
  }

  return {
    action, mode: 'attack', fa, fd, malandragem, damage, pmCost: ctx.pmCost, pvCost,
    rolls: { ...rolls }, attackerBonus, defenderBonus, critical, criticalBonus: critical ? CRITICAL_BONUS : 0,
    attackerStatuses: [...(attacker.statuses || [])],
    // Talento de status do Mandingueiro: pega no alvo mesmo sem dano.
    // Apanhou de verdade, acorda (Apagado); depois entra o status do talento.
    defenderStatuses: ctx.statusAplicar ? aplicarStatus(acordarAoApanhar(defender.statuses || [], damage), ctx.statusAplicar.id, ctx.statusAplicar.turnos) : acordarAoApanhar(defender.statuses || [], damage),
    statusAplicado: ctx.statusAplicar?.id || null,
    activeSpecialId: attackerEffects.find(item => item.kind === 'active')?.id || null,
    passivosGatilho,
    ignoreDefPct: ctx.ignoreDefPct, shieldConsumed,
    attackerSpecialState, defenderSpecialState,
  }
}

/** Talento de CURA do Mandingueiro de cura (efeito `heal`): mira um aliado
 *  vivo, cura `valor + metade da Malandragem` de Osso (até o máximo). Sem
 *  dado — cura não erra. Devolve null se o talento não é de cura ou não dá
 *  pra pagar. */
export function resolveGanguesCura({ ator, alvo, special }) {
  const effect = special?.effect
  if (!effect || effect.type !== 'heal' || !alvo || alvo.pv <= 0) return null
  const level = special.level || 1
  const custo = effect.cost ? effect.cost.values[level - 1] : 0
  if (effect.cost?.kind === 'pm' && (ator.pm || 0) < custo) return null
  const bruto = effect.values[level - 1] + Math.floor((Number(ator.attributes?.PM) || 0) / 2)
  const cura = Math.max(0, Math.min(alvo.pvMax, alvo.pv + bruto) - alvo.pv)
  return { cura, pmCost: effect.cost?.kind === 'pm' ? custo : 0, specialId: special.id }
}
