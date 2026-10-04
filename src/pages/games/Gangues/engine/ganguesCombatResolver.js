import { applyGanguesAttackerEffect, applyGanguesDefenderEffect, buildGanguesEffectsList } from './ganguesSpecialEffects.js'
import { aplicarStatus, acordarAoApanhar, modAtaqueStatus, modDefesaStatus } from './ganguesStatus.js'
import { rolarFaixa } from '../data/ganguesEquip.js'
import { sortearAutoTalento, sortearStatusAoBater, imuneAoStatus, defesaDasCartas, curaDasCartas } from './ganguesCartaEfeitos.js'

// Dado das peças em FAIXA (27/09/2026, PLANO_ITENS_RANGE.md): cada peça rola o
// próprio dado e soma. `null` = ninguém tem peça com faixa daquele atributo
// (o dado dramático só mostra o chip da arma/armadura quando existe).
function rolarDadosEquip(faixas) {
  if (!faixas?.length) return null
  return faixas.reduce((soma, f) => soma + rolarFaixa(f), 0)
}

// STATUS temporários (consumíveis — Pinga, Vela Benta, Bombinha...): cada um é
// { attr: 'A'|'D'|'H', valor, acoes } e dura `acoes` ações de QUEM carrega.
/** Soma de todos os status de um atributo no combatente. */
function somaStatus(combatente, attr) {
  return (combatente?.statuses || []).reduce((s, st) => s + (st.attr === attr ? Number(st.valor) || 0 : 0), 0)
}
/** Quem agiu gastou 1 ação de cada status que carrega (some quando zera). */
export function gastarAcaoStatus(statuses = []) {
  // Só buff de item (`acoes`); status do Mandingueiro (`id`/`turnos`) conta à
  // parte em ganguesStatus.js (tickStatusAoAgir).
  return statuses.map(st => (st.id != null ? st : { ...st, acoes: st.acoes - 1 })).filter(st => st.id != null || st.acoes > 0)
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
  // `rolls.arma`/`rolls.armadura` podem vir prontos (teste); senão rola aqui
  // a partir das faixas guardadas no combatente pelo `prepare`.
  const arma = rolls.arma !== undefined ? rolls.arma : rolarDadosEquip(attacker.equipDados?.A)
  const armadura = rolls.armadura !== undefined ? rolls.armadura : rolarDadosEquip(defender.equipDados?.D)
  rolls = { ...rolls, arma, armadura }
  // Buff de item (somaStatus) + status do Mandingueiro (Braço Mole / Guarda
  // Aberta / Queimado — ganguesStatus.js).
  const attack = Math.max(0, (Number(attacker.attributes?.A) || 0) + (arma || 0) + somaStatus(attacker, 'A') + modAtaqueStatus(attacker.statuses))
  const defense = Math.max(0, (Number(defender.attributes?.D) || 0) + (armadura || 0) + somaStatus(defender, 'D') + modDefesaStatus(defender.statuses))

  const critical = rolls.fa === ATTACK_DIE_SIDES
  const attackRollValue = rolls.fa + (critical ? CRITICAL_BONUS : 0)

  const attackerEffects = buildGanguesEffectsList(attacker, activeSpecialId, forcedSpecial)
  // Carta de talento automático: num ataque normal, chance de soltar um
  // talento de graça (não gasta energia nem conta como talento na linha do tempo).
  const talentoDaCarta = sortearAutoTalento(attacker, attackerEffects.some(item => item.kind === 'active'))
  if (talentoDaCarta) attackerEffects.push(talentoDaCarta)
  const defenderEffects = buildGanguesEffectsList(defender, null)
  const ctx = { attacker, target: defender, faMod: 0, fdMod: 0, ignoreDefPct: 0, targetDefenseReduction: 0, pmCost: 0, pvCostPct: 0, selfShieldSet: 0, chargeGain: 0, chargeSpent: 0, statusAplicar: null }
  // `passivosGatilho`: cada passiva (de quem ataca e de quem defende) cujo
  // efeito mudou o resultado desta ação — compara os campos numéricos do ctx
  // antes e depois de cada uma. O painel do golpe mostra essas passivas.
  const camposComparados = ['faMod', 'fdMod', 'ignoreDefPct', 'targetDefenseReduction', 'pmCost', 'pvCostPct', 'selfShieldSet', 'chargeGain', 'chargeSpent']
  const retrato = () => camposComparados.map(campo => ctx[campo])
  const mudou = (antes, depois) => camposComparados.some((_, i) => antes[i] !== depois[i])
  const passivosGatilho = { attacker: [], defender: [] }
  // nível de cada passiva que disparou (pra mostrar o efeito certo no dado)
  const passivosNivel = {}
  for (const item of attackerEffects) {
    const antes = retrato()
    applyGanguesAttackerEffect(item, ctx)
    if (item.kind === 'passive' && mudou(antes, retrato())) { passivosGatilho.attacker.push(item.id); passivosNivel[item.id] = item.level }
  }
  for (const item of defenderEffects) {
    const antes = retrato()
    applyGanguesDefenderEffect(item, ctx)
    if (item.kind === 'passive' && mudou(antes, retrato())) { passivosGatilho.defender.push(item.id); passivosNivel[item.id] = item.level }
  }

  const effectiveDefense = Math.max(0, Math.round(defense * (1 - ctx.ignoreDefPct / 100)) - ctx.targetDefenseReduction)

  // Sistema do Pique (26/09/2026): o Pique (H) saiu do ataque — agora é só
  // velocidade na linha do tempo (ganguesLinhaDoTempo.js). Quem pesa no golpe
  // de TALENTO é a Malandragem (PM): + metade dela, só quando um talento ativo
  // entra na jogada. Ataque normal = Porrada + dado.
  const talentoAtivo = attackerEffects.some(item => item.kind === 'active')
  const malandragem = talentoAtivo ? Math.floor((Number(attacker.attributes?.PM) || 0) / 2) : 0
  const fa = attack + malandragem + attackRollValue + ctx.faMod
  const fd = effectiveDefense + rolls.fd + ctx.fdMod
  let damage = Math.max(0, fa - fd)
  const danoBruto = damage
  // Cartas de quem apanha: bloqueio e redução de dano.
  const defesaCarta = defesaDasCartas(defender, damage)
  damage = defesaCarta.damage
  // Carta de status ao bater (se o talento não pôs nenhum); imunidade da carta do alvo.
  if (!ctx.statusAplicar) ctx.statusAplicar = sortearStatusAoBater(attacker)
  if (ctx.statusAplicar && imuneAoStatus(defender, ctx.statusAplicar.id)) ctx.statusAplicar = null

  const incomingShield = defender.specialState?.shield || 0
  let shieldConsumed = 0
  if (incomingShield > 0) { shieldConsumed = Math.min(incomingShield, damage); damage = Math.max(0, damage - incomingShield) }

  const cartaCura = curaDasCartas(attacker, defender, damage)
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
    // As parcelas da conta, pra tela do golpe mostrar de onde veio cada número.
    conta: {
      porrada: attack - (arma || 0), dado: rolls.fa, critico: critical ? CRITICAL_BONUS : 0, arma: arma || 0, malandragem, bonus: ctx.faMod,
      couro: defense - (armadura || 0), armadura: armadura || 0, ignorou: defense - effectiveDefense, dadoDef: rolls.fd, bonusDef: ctx.fdMod,
      bruto: danoBruto, cartaDefesa: danoBruto - defesaCarta.damage, escudo: shieldConsumed,
    },
    rolls: { ...rolls }, critical, criticalBonus: critical ? CRITICAL_BONUS : 0,
    attackerStatuses: gastarAcaoStatus(attacker.statuses),
    // Talento de status do Mandingueiro: pega no alvo mesmo sem dano.
    // Apanhou de verdade, acorda (Apagado); depois entra o status do talento.
    defenderStatuses: ctx.statusAplicar ? aplicarStatus(acordarAoApanhar(defender.statuses || [], damage), ctx.statusAplicar.id, ctx.statusAplicar.turnos) : acordarAoApanhar(defender.statuses || [], damage),
    statusAplicado: ctx.statusAplicar?.id || null,
    activeSpecialId: attackerEffects.find(item => item.kind === 'active' && !item.daCarta)?.id || null,
    cartaTalento: talentoDaCarta?.id || null, cartaBloqueio: defesaCarta.bloqueio, cartaCura,
    passivosGatilho,
    passivosNivel,
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
