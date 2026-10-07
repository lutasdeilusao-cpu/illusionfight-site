import { ST_TODOS, normalizarStatus } from './ganguesStatus.js'
import { gastarAcaoStatus } from './ganguesCombatResolver.js'
import { atribuirPersonas } from './ganguesPersonas.js'
import { getGanguesResources, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquipDados, rolarFaixa, normalizeGanguesEquipment } from '../data/ganguesEquip.js'
import { somaFixaDasCartas, efeitosDasCartas } from '../data/ganguesCartas.js'

/* Regras de combate comuns aos dois motores (luta normal, golpe a golpe, e
   Briga em Multidão, rodada a rodada): preparar o lutador, aplicar golpe,
   cura e item na lista de combatentes, custo de talento e efeito de item.
   Regra nova de combate entra aqui, uma vez só. */

/** Lutador pronto pra briga: atributos com equipamento e cartas, PV/PM de
 *  entrada, status, chave única na luta. */
export function prepare(combatant, side, index) {
  const enemy = side === 'enemy'
  const normalized = enemy ? { ...combatant, attributes: combatant.stats || combatant.attributes || {}, combat_path: combatant.preferred_mode === 'power' ? 'mistico' : combatant.preferred_mode === 'armed' ? 'defensor' : 'atacante' } : { ...combatant, ...normalizeGanguesLoadout(combatant) }
  // Equipamento (só jogador). A Porrada e o Couro das peças são FAIXA: viram
  // dados (`equipDados`) que o resolver rola a cada golpe/defesa. O Pique rola
  // uma vez aqui e entra no H (a linha do tempo lê o H). `atributosFicha` é a
  // média, pra ficha aberta no meio da luta.
  const equipment = normalized.attributes?.equipment
  let equipDados = null
  let equipPique = null
  let atributosFicha = null
  if (!enemy) {
    const dados = getGanguesEquipDados(equipment)
    atributosFicha = getGanguesAttributesWithEquip(normalized.attributes)
    const baseH = Number(normalized.attributes?.H) || 0
    equipPique = dados.H.length ? dados.H.reduce((soma, f) => soma + rolarFaixa(f), 0) : null
    // Malandragem de peça é fixa: entra direto no atributo.
    const equipPM = dados.PM.reduce((soma, f) => soma + f.min, 0)
    // Cartas encaixadas: soma fixa no atributo; o resto vai em `cartaEfeitos`.
    const cartas = somaFixaDasCartas(equipment)
    normalized.attributes = { ...normalized.attributes, A: (Number(normalized.attributes?.A) || 0) + cartas.A, D: (Number(normalized.attributes?.D) || 0) + cartas.D, H: baseH + (equipPique || 0) + cartas.H, PM: (Number(normalized.attributes?.PM) || 0) + equipPM + cartas.PM }
    atributosFicha = { ...atributosFicha, H: normalized.attributes.H }
    equipDados = { A: dados.A, D: dados.D }
  }
  const resources = enemy
    ? { pvMax: Number(combatant.pv_max) || 10, pmMax: Number(combatant.pm_max) || 0 }
    : applyGanguesEquipResources(getGanguesResources(normalized.combat_path, normalized.attributes?.PV, normalized.attributes?.PM), equipment)
  // Jogador entra com o PV/PM que sobrou da última luta; inimigo entra cheio.
  const pvInicial = enemy ? resources.pvMax : Math.min(resources.pvMax, Number(normalized.attributes?.pv_atual ?? resources.pvMax))
  const pmInicial = enemy ? resources.pmMax : Math.min(resources.pmMax, Number(normalized.attributes?.pm_atual ?? resources.pmMax))
  return { ...normalized, key: `${side}-${index}-${combatant.id}`, side, equipDados, equipPique, atributosFicha,
    // Status do jogador persiste entre lutas (status_atual); só sai com item ou descanso.
    statuses: enemy ? [] : normalizarStatus(normalized.attributes?.status_atual), cartaEfeitos: enemy ? [] : efeitosDasCartas(normalizeGanguesEquipment(equipment)), pv: pvInicial, pm: pmInicial, pvMax: resources.pvMax, pmMax: resources.pmMax, actedThisRound: false, specialState: { charge: 0, shield: 0, totalPvLost: 0 } }
}

/** Prepara os dois times e sorteia as personas dos inimigos. */
export function prepararTimes(playerTeam = [], enemyTeam = []) {
  return atribuirPersonas([...playerTeam.map((member, index) => prepare(member, 'player', index)), ...enemyTeam.map((member, index) => prepare(member, 'enemy', index))])
}

/** Abaixo dessa fração do PV a poção entra (automático e Briga em Multidão). */
export const POCAO_LIMIAR_PV = 0.5

/** O lutador tem PM/PV pra pagar o talento? */
export function podePagarCusto(actor, special) {
  const cost = special?.effect?.cost
  if (!cost) return true
  const value = cost.values[special.level - 1]
  if (cost.kind === 'pm') return (actor?.pm || 0) >= value
  if (cost.kind === 'pv') return (actor?.pv || 0) > 1
  return true
}

/** Aplica o resultado de um golpe (resolveGanguesAction). Grogue batendo em si
 *  mesmo: ator e alvo são o mesmo, o dano cai no ator. */
export function aplicarAtaque(lista, actorKey, targetKey, result) {
  const emSiMesmo = actorKey === targetKey
  return lista.map(c => {
    if (c.key === actorKey) return { ...c, statuses: emSiMesmo ? result.defenderStatuses : result.attackerStatuses, pm: Math.max(0, c.pm - result.pmCost), pv: Math.min(c.pvMax, Math.max(0, c.pv - (result.pvCost || 0) - (emSiMesmo ? result.damage : 0)) + (result.cartaCura || 0)), specialState: result.attackerSpecialState }
    if (c.key === targetKey) return { ...c, statuses: result.defenderStatuses, pv: Math.max(0, c.pv - result.damage), specialState: result.defenderSpecialState }
    return c
  })
}

/** Aplica um talento de cura (resolveGanguesCura). */
export function aplicarCura(lista, atorKey, alvoKey, res) {
  return lista.map(c => {
    let novo = c
    if (c.key === atorKey) novo = { ...novo, pm: Math.max(0, novo.pm - res.pmCost) }
    if (c.key === alvoKey) novo = { ...novo, pv: Math.min(novo.pvMax, novo.pv + res.cura) }
    return novo
  })
}

/** O que o item faz na luta: { pv?, pm?, status?, statusInimigos?, curaStatus? }. */
export function deltaDoItem(item) {
  return {
    ...(item.tipo === 'cura_pv' ? { pv: item.valor } : item.tipo === 'cura_pm' ? { pm: item.valor } : {}),
    ...(item.tipo === 'debuff_inimigos' ? { statusInimigos: item.status } : item.tipo === 'cura_status' ? { curaStatus: item.status } : { status: item.status || [] }),
  }
}

/** Por que o item não serve nesse alvo agora (null = serve). */
export function motivoItemNaoServe(item, alvo) {
  if (!alvo) return null
  if (item.tipo === 'cura_pv' && alvo.pv >= alvo.pvMax) return 'cheio'
  if (item.tipo === 'cura_pm' && alvo.pm >= alvo.pmMax) return 'cheio'
  if (item.tipo === 'cura_status' && !(alvo.statuses || []).some(s => item.status === ST_TODOS || s.id === item.status)) return 'sem_status'
  return null
}

/** Quanto de PV+PM o item realmente cura no alvo (o número verde). */
export function curaRealDoItem(alvo, delta) {
  if (!alvo) return 0
  return Math.max(0, Math.min(alvo.pvMax, alvo.pv + (delta.pv || 0)) - alvo.pv) + Math.max(0, Math.min(alvo.pmMax, alvo.pm + (delta.pm || 0)) - alvo.pm)
}

/** Aplica um item: cura/status no ALIADO alvo, `statusInimigos` em todo
 *  inimigo vivo. O ator gasta 1 ação dos status que já carregava antes. */
export function aplicarItem(lista, actorKey, alvoKey, delta) {
  return lista.map(c => {
    let statuses = c.key === actorKey ? gastarAcaoStatus(c.statuses) : (c.statuses || [])
    if (c.key === alvoKey && delta.status?.length) statuses = [...statuses, ...delta.status]
    if (c.side === 'enemy' && c.pv > 0 && delta.statusInimigos?.length) statuses = [...statuses, ...delta.statusInimigos]
    // Remédio de status: tira o status (entrada com `id`), nunca buff de item.
    if (c.key === alvoKey && delta.curaStatus != null) statuses = statuses.filter(st => st.id == null || (delta.curaStatus !== ST_TODOS && st.id !== delta.curaStatus))
    const cura = c.key === alvoKey
      ? { pv: Math.min(c.pvMax, c.pv + (delta.pv || 0)), pm: Math.min(c.pmMax, c.pm + (delta.pm || 0)) }
      : {}
    return { ...c, ...cura, statuses }
  })
}
