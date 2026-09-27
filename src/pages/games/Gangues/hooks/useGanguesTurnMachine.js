import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resolveGanguesAction } from '../engine/ganguesCombatResolver.js'
import { iniciarLinhaDoTempo, proximaVez, consumirVez, marcarAgiu, ordemDeVelocidade } from '../engine/ganguesLinhaDoTempo.js'
import { getGanguesResources, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources } from '../data/ganguesEquip.js'

const d3 = () => Math.floor(Math.random() * 3) + 1
const coin = () => Math.random() < 0.5

// IA de alvo: evita bater sempre no mesmo alvo quando há outro vivo — alterna entre focar
// quem está com menos PV (foco) e escolher alguém aleatório entre os outros vivos.
// Exportadas pra engine/ganguesBrigaMultidao.js reusar a MESMA lógica de
// alvo/preparo — o modo rápido não pode divergir das contas do combate normal.
export function pickEnemyTarget(combatants, lastTargetKey, roll = Math.random) {
  const targets = combatants.filter(item => item.side === 'player' && item.pv > 0)
  if (targets.length <= 1) return targets[0] || null
  const others = targets.filter(item => item.key !== lastTargetKey)
  const pool = others.length ? others : targets
  if (roll() < 0.55) return [...pool].sort((a, b) => a.pv - b.pv)[0]
  return pool[Math.floor(roll() * pool.length)]
}

export function prepare(combatant, side, index) {
  const enemy = side === 'enemy'
  const normalized = enemy ? { ...combatant, attributes: combatant.stats || combatant.attributes || {}, combat_path: combatant.preferred_mode === 'power' ? 'mistico' : combatant.preferred_mode === 'armed' ? 'defensor' : 'atacante' } : { ...combatant, ...normalizeGanguesLoadout(combatant) }
  // Equipamento (só jogador): soma os bônus de atributo (A/H/D) antes de tudo,
  // e depois os bônus PLANOS de PV/PM em cima do máximo já calculado (não passam
  // por R — ver ganguesEquip.js). `equipment` continua acessível em
  // `attributes.equipment` pros efeitos de carta que virão depois.
  const equipment = normalized.attributes?.equipment
  if (!enemy) normalized.attributes = getGanguesAttributesWithEquip(normalized.attributes)
  const resources = enemy
    ? { pvMax: Number(combatant.pv_max) || 10, pmMax: Number(combatant.pm_max) || 0 }
    : applyGanguesEquipResources(getGanguesResources(normalized.combat_path, normalized.attributes?.PV, normalized.attributes?.PM), equipment)
  // Jogador entra com o PV/PM que sobrou da última luta (ver pv_atual/pm_atual
  // em normalizeGanguesLoadout) — só some pra 'full' quando nunca lutou ou
  // quando descansou/dominou o território. Inimigo sempre entra cheio.
  const pvInicial = enemy ? resources.pvMax : Math.min(resources.pvMax, Number(normalized.attributes?.pv_atual ?? resources.pvMax))
  const pmInicial = enemy ? resources.pmMax : Math.min(resources.pmMax, Number(normalized.attributes?.pm_atual ?? resources.pmMax))
  return { ...normalized, key: `${side}-${index}-${combatant.id}`, side, statuses: [], pv: pvInicial, pm: pmInicial, pvMax: resources.pvMax, pmMax: resources.pmMax, actedThisRound: false, specialState: { charge: 0, shield: 0, totalPvLost: 0 } }
}

export default function useGanguesTurnMachine({ playerTeam = [], enemyTeam = [], onFinish, attackRoll = d3, defenseRoll = d3, bonusRoll = coin, targetRoll = Math.random, enemyDelay = 2200, pausado = false }) {
  const initial = useMemo(() => [...playerTeam.map((member, index) => prepare(member, 'player', index)), ...enemyTeam.map((member, index) => prepare(member, 'enemy', index))], [])
  // Linha do tempo (Pique, 26/09/2026 — ver engine/ganguesLinhaDoTempo.js):
  // quem age é quem chega primeiro no centro da pista, não mais uma ordem
  // fixa sorteada no começo. `tempo` = barras de cada um; `vez` = quem age agora.
  const [inicio] = useState(() => {
    const t0 = iniciarLinhaDoTempo(initial)
    const primeira = proximaVez(initial, t0)
    return { tempo: primeira.tempo, vez: primeira.key, ordem: ordemDeVelocidade(initial, t0) }
  })
  const [tempo, setTempo] = useState(inicio.tempo)
  const [vez, setVez] = useState(inicio.vez)
  // `initiative` agora é só a ORDEM DE VELOCIDADE pra exibir (log/relatório).
  const [initiative, setInitiative] = useState(inicio.ordem)
  const [combatants, setCombatants] = useState(initial)
  const [round, setRound] = useState(1)
  const [started, setStarted] = useState(false)
  const [pending, setPending] = useState(null)
  const [events, setEvents] = useState([])
  const aiQueued = useRef(false)
  const acaoSeq = useRef(0)
  const lastEnemyTargetKey = useRef(null)
  const entered = useRef(false)
  const currentActor = combatants.find(item => item.key === vez)
  const phase = !started ? 'select' : pending ? 'rolling' : currentActor?.side || 'finished'
  const record = useCallback(event => setEvents(list => [...list, { ...event, id: `${Date.now()}-${Math.random()}` }]), [])

  // Fim da ação de `actorKey`: volta ele pra largada, fecha a rodada se todo
  // mundo vivo já agiu, e avança o tempo até o próximo chegar no centro.
  const advanceTurn = useCallback((next, actorKey, usouTalento = false) => {
    const playersAlive = next.some(item => item.side === 'player' && item.pv > 0)
    const enemiesAlive = next.some(item => item.side === 'enemy' && item.pv > 0)
    if (!playersAlive || !enemiesAlive) { setCombatants(next); onFinish(enemiesAlive ? 'defeat' : 'victory'); return }
    const { combatants: marcados, fechouRodada } = marcarAgiu(next, actorKey)
    if (fechouRodada) setRound(value => value + 1)
    const proxima = proximaVez(marcados, consumirVez(tempo, actorKey, usouTalento))
    setCombatants(marcados)
    setTempo(proxima.tempo)
    setVez(proxima.key)
  }, [onFinish, tempo])

  const queueAction = useCallback((actor, target, activeSpecialId = null, forcedSpecial = null) => {
    if (!actor || !target || pending) return false
    const result = resolveGanguesAction({
      attacker: actor, defender: target, action: { type: 'attack', mode: 'attack' },
      rolls: { fa: attackRoll(), fd: defenseRoll(), attackerBonus: bonusRoll(), defenderBonus: bonusRoll() },
      activeSpecialId, forcedSpecial,
    })
    // `id` único por ação: com a linha do tempo o MESMO lutador pode agir 2x
    // na mesma rodada — a key do DramaticDice não pode ser actorKey+round.
    acaoSeq.current += 1
    setPending({ id: acaoSeq.current, actorKey: actor.key, targetKey: target.key, side: actor.side, result })
    return true
  }, [attackRoll, defenseRoll, bonusRoll, pending])

  const playerAction = useCallback((actorKey, targetKey, activeSpecialId = null, forcedSpecial = null) => {
    if (phase !== 'player' || currentActor?.key !== actorKey) return false
    const target = combatants.find(item => item.key === targetKey && item.side === 'enemy' && item.pv > 0)
    return queueAction(currentActor, target, activeSpecialId, forcedSpecial)
  }, [phase, currentActor, combatants, queueAction])

  const completePending = useCallback(() => {
    if (!pending) return
    const next = combatants.map(item => {
      if (item.key === pending.actorKey) return { ...item, statuses: pending.result.attackerStatuses, pm: Math.max(0, item.pm - pending.result.pmCost), pv: Math.max(0, item.pv - (pending.result.pvCost || 0)), specialState: pending.result.attackerSpecialState }
      if (item.key === pending.targetKey) return { ...item, statuses: pending.result.defenderStatuses, pv: Math.max(0, item.pv - pending.result.damage), specialState: pending.result.defenderSpecialState }
      return item
    })
    record({ type: 'attack', side: pending.side, actorKey: pending.actorKey, targetKey: pending.targetKey, result: pending.result, round })
    setPending(null)
    advanceTurn(next, pending.actorKey, Boolean(pending.result.activeSpecialId))
  }, [pending, combatants, advanceTurn, record, round])

  useEffect(() => {
    // `pausado` (Briga em Multidão ativa): o motor normal PARA de agir
    // sozinho enquanto a Multidão estiver no controle — sem isso, esse timer
    // continuava rodando ESCONDIDO atrás da UI da Multidão (nada aqui olhava
    // pro switch), e o inimigo cujo turno já estava agendado ANTES de ligar
    // a Multidão atacava em segredo (o dano aplicava no `combatants` do motor
    // normal, invisível, e a briga da Multidão nem sabia disso). Bug
    // reportado pelo Isaias (2026-09-14): "só de apertar o botãozinho já para
    // os inimigos de atacar" — na real o ataque acontecia sim, só que
    // escondido, dando a impressão de que os inimigos "pararam".
    if (pausado || phase !== 'enemy' || pending || aiQueued.current || !currentActor) return
    aiQueued.current = true
    const timer = setTimeout(() => {
      const target = pickEnemyTarget(combatants, lastEnemyTargetKey.current, targetRoll)
      lastEnemyTargetKey.current = target?.key || null
      queueAction(currentActor, target)
      aiQueued.current = false
    }, enemyDelay)
    return () => { clearTimeout(timer); aiQueued.current = false }
  }, [pausado, phase, pending, currentActor, combatants, queueAction, enemyDelay, targetRoll])

  const enterCombat = useCallback(() => {
    if (entered.current) return
    entered.current = true
    setStarted(true)
    record({ type: 'battle_start' })
    record({ type: 'initiative', order: initiative })
  }, [initiative, record])

  // Volta da Briga em Multidão pro motor normal (switch desligado no meio da
  // luta): recebe o estado da Multidão (mesmo `prepare()`, mesma linha do
  // tempo) e continua EXATAMENTE de onde ela parou — PV/PM/status, barras da
  // pista e quem é a próxima vez.
  const syncFrom = useCallback((estado) => {
    const nextCombatants = estado.combatants.map(c => ({ ...c }))
    const proxima = proximaVez(nextCombatants, estado.tempo)
    setCombatants(nextCombatants)
    setTempo(proxima.tempo)
    setVez(proxima.key)
    setInitiative(estado.initiative)
    setRound(estado.round)
    setPending(null)
    setStarted(true)
    entered.current = true
  }, [])

  // Usar item: aplica a cura num ALIADO (o próprio ator OU outro personagem da
  // gangue — dá pra o tanque ficar curando o atacante). Consome o turno do
  // ATOR igual um ataque. `delta` é { pv?, pm? }, sempre positivo (cura).
  const useItemAction = useCallback((actorKey, targetKey, itemId, delta) => {
    if (phase !== 'player' || currentActor?.key !== actorKey) return false
    const alvoKey = targetKey || actorKey
    const alvoAntes = combatants.find(item => item.key === alvoKey)
    const curado = alvoAntes
      ? Math.max(0, Math.min(alvoAntes.pvMax, alvoAntes.pv + (delta.pv || 0)) - alvoAntes.pv) + Math.max(0, Math.min(alvoAntes.pmMax, alvoAntes.pm + (delta.pm || 0)) - alvoAntes.pm)
      : 0
    const next = combatants.map(item => {
      const cura = item.key === alvoKey
        ? { pv: Math.min(item.pvMax, item.pv + (delta.pv || 0)), pm: Math.min(item.pmMax, item.pm + (delta.pm || 0)) }
        : {}
      return { ...item, ...cura }
    })
    record({ type: 'item', side: 'player', actorKey, targetKey: alvoKey, itemId, delta, curado, round })
    advanceTurn(next, actorKey)
    return true
  }, [phase, currentActor, combatants, advanceTurn, record, round])

  return { combatants, phase, round, pending, events, initiative, tempo, currentActor, playerActors: phase === 'player' && currentActor ? [currentActor] : [], enterCombat, playerAction, completePending, useItemAction, syncFrom }
}
