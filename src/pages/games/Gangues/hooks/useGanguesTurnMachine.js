import { ST_TODOS } from '../engine/ganguesStatus.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resolveGanguesAction, resolveGanguesCura, gastarAcaoStatus } from '../engine/ganguesCombatResolver.js'
import { atribuirPersonas, decidirAcaoInimigo } from '../engine/ganguesPersonas.js'
import { statusImpedeAcao, alvoComTontura, normalizarStatus } from '../engine/ganguesStatus.js'
import { iniciarLinhaDoTempo, proximaVez, consumirVez, marcarAgiu, ordemDeVelocidade } from '../engine/ganguesLinhaDoTempo.js'
import { getGanguesResources, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquipDados, rolarFaixa, normalizeGanguesEquipment } from '../data/ganguesEquip.js'
import { somaFixaDasCartas, efeitosDasCartas } from '../data/ganguesCartas.js'

const d3 = () => Math.floor(Math.random() * 3) + 1

export function prepare(combatant, side, index) {
  const enemy = side === 'enemy'
  const normalized = enemy ? { ...combatant, attributes: combatant.stats || combatant.attributes || {}, combat_path: combatant.preferred_mode === 'power' ? 'mistico' : combatant.preferred_mode === 'armed' ? 'defensor' : 'atacante' } : { ...combatant, ...normalizeGanguesLoadout(combatant) }
  // Equipamento (só jogador): soma os bônus de atributo (A/H/D) antes de tudo,
  // e depois os bônus PLANOS de PV/PM em cima do máximo já calculado (não passam
  // por R — ver ganguesEquip.js). `equipment` continua acessível em
  // `attributes.equipment` pros efeitos de carta que virão depois.
  const equipment = normalized.attributes?.equipment
  // Equipamento em FAIXA (27/09/2026, PLANO_ITENS_RANGE.md): a Porrada e o
  // Couro das peças NÃO entram no atributo — viram dados (`equipDados`) que o
  // resolver rola a cada golpe/defesa. O Pique rola UMA vez aqui, na entrada
  // da luta, e já entra no H (a linha do tempo lê o H direto). `atributosFicha`
  // é só pra ficha aberta no meio da luta mostrar a média, como fora dela.
  let equipDados = null
  let equipPique = null
  let atributosFicha = null
  if (!enemy) {
    const dados = getGanguesEquipDados(equipment)
    atributosFicha = getGanguesAttributesWithEquip(normalized.attributes)
    const baseH = Number(normalized.attributes?.H) || 0
    equipPique = dados.H.length ? dados.H.reduce((soma, f) => soma + rolarFaixa(f), 0) : null
    // Malandragem de peça (Mandingueiro) é fixa: entra direto no atributo.
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
  // Jogador entra com o PV/PM que sobrou da última luta (ver pv_atual/pm_atual
  // em normalizeGanguesLoadout) — só some pra 'full' quando nunca lutou ou
  // quando descansou/dominou o território. Inimigo sempre entra cheio.
  const pvInicial = enemy ? resources.pvMax : Math.min(resources.pvMax, Number(normalized.attributes?.pv_atual ?? resources.pvMax))
  const pmInicial = enemy ? resources.pmMax : Math.min(resources.pmMax, Number(normalized.attributes?.pm_atual ?? resources.pmMax))
  return { ...normalized, key: `${side}-${index}-${combatant.id}`, side,
    // Status do jogador persiste entre lutas (status_atual, gravado junto do
    // PV/PM) — só sai com item ou no descanso completo.
    statuses: enemy ? [] : normalizarStatus(normalized.attributes?.status_atual), cartaEfeitos: enemy ? [] : efeitosDasCartas(normalizeGanguesEquipment(equipment)), pv: pvInicial, pm: pmInicial, pvMax: resources.pvMax, pmMax: resources.pmMax, actedThisRound: false, specialState: { charge: 0, shield: 0, totalPvLost: 0 } }
}

/** Prepara os dois times e sorteia as personas dos inimigos — usado pelos
 *  dois motores (normal e Briga em Multidão). */
export function prepararTimes(playerTeam = [], enemyTeam = []) {
  return atribuirPersonas([...playerTeam.map((member, index) => prepare(member, 'player', index)), ...enemyTeam.map((member, index) => prepare(member, 'enemy', index))])
}

export default function useGanguesTurnMachine({ playerTeam = [], enemyTeam = [], onFinish, attackRoll = d3, defenseRoll = d3, targetRoll = Math.random, enemyDelay = 2200, pausado = false }) {
  const initial = useMemo(() => prepararTimes(playerTeam, enemyTeam), [])
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
  // Cada vez nova (mesmo que seja o mesmo lutador de novo) — gatilho da
  // checagem de status que faz perder a vez (Apagado/Travado).
  const [turnoSeq, setTurnoSeq] = useState(0)
  const [pulando, setPulando] = useState(false)
  const aiQueued = useRef(false)
  const acaoSeq = useRef(0)
  const lastEnemyTargetKey = useRef(null)
  const ultimoAgressorKey = useRef(null)
  const entered = useRef(false)
  const currentActor = combatants.find(item => item.key === vez)
  const phase = !started ? 'select' : pending || pulando ? 'rolling' : currentActor?.side || 'finished'
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
    setTurnoSeq(value => value + 1)
  }, [onFinish, tempo])

  const queueAction = useCallback((actor, target, activeSpecialId = null, forcedSpecial = null) => {
    if (!actor || !target || pending) return false
    // Grogue (tonto): às vezes o golpe vai num aliado — ou nele mesmo.
    const alvoFinal = alvoComTontura(actor, target, combatants, targetRoll)
    const confuso = alvoFinal.key !== target.key
    target = alvoFinal
    const result = resolveGanguesAction({
      attacker: actor, defender: target, action: { type: 'attack', mode: 'attack' },
      rolls: { fa: attackRoll(), fd: defenseRoll() },
      activeSpecialId, forcedSpecial,
    })
    // `id` único por ação: com a linha do tempo o MESMO lutador pode agir 2x
    // na mesma rodada — a key do DramaticDice não pode ser actorKey+round.
    acaoSeq.current += 1
    setPending({ id: acaoSeq.current, actorKey: actor.key, targetKey: target.key, side: actor.side, result, confuso })
    return true
  }, [attackRoll, defenseRoll, pending, combatants, targetRoll])

  const playerAction = useCallback((actorKey, targetKey, activeSpecialId = null, forcedSpecial = null) => {
    if (phase !== 'player' || currentActor?.key !== actorKey) return false
    const target = combatants.find(item => item.key === targetKey && item.side === 'enemy' && item.pv > 0)
    return queueAction(currentActor, target, activeSpecialId, forcedSpecial)
  }, [phase, currentActor, combatants, queueAction])

  const completePending = useCallback(() => {
    if (!pending) return
    // Grogue batendo em si mesmo: ator e alvo são o mesmo — aplica o dano no ator.
    const emSiMesmo = pending.actorKey === pending.targetKey
    const next = combatants.map(item => {
      if (item.key === pending.actorKey) return { ...item, statuses: emSiMesmo ? pending.result.defenderStatuses : pending.result.attackerStatuses, pm: Math.max(0, item.pm - pending.result.pmCost), pv: Math.min(item.pvMax, Math.max(0, item.pv - (pending.result.pvCost || 0) - (emSiMesmo ? pending.result.damage : 0)) + (pending.result.cartaCura || 0)), specialState: pending.result.attackerSpecialState }
      if (item.key === pending.targetKey) return { ...item, statuses: pending.result.defenderStatuses, pv: Math.max(0, item.pv - pending.result.damage), specialState: pending.result.defenderSpecialState }
      return item
    })
    if (pending.side === 'player') ultimoAgressorKey.current = pending.actorKey
    record({ type: 'attack', side: pending.side, actorKey: pending.actorKey, targetKey: pending.targetKey, result: pending.result, round, confuso: pending.confuso })
    setPending(null)
    advanceTurn(next, pending.actorKey, Boolean(pending.result.activeSpecialId))
  }, [pending, combatants, advanceTurn, record, round])

  // Status que faz perder a vez (Apagado; Travado às vezes): chegou a vez,
  // mostra um instante e passa pro próximo — o status ainda perde uma vez.
  useEffect(() => {
    if (!started || pausado || pending || !currentActor || currentActor.pv <= 0) return
    const motivo = statusImpedeAcao(currentActor, targetRoll)
    if (!motivo) return
    setPulando(true)
    const timer = setTimeout(() => {
      record({ type: 'perdeu_vez', side: currentActor.side, actorKey: currentActor.key, motivo, round })
      setPulando(false)
      advanceTurn(combatants, currentActor.key, false)
    }, Math.max(500, enemyDelay / 2))
    return () => { clearTimeout(timer); setPulando(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnoSeq, started, pausado])

  // Talento de cura (Mandingueiro de cura): sem dado, cura o aliado e gasta a vez.
  const curar = useCallback((ator, alvo, special) => {
    const res = resolveGanguesCura({ ator, alvo, special })
    if (!res) return false
    const next = combatants.map(item => {
      let novo = item
      if (item.key === ator.key) novo = { ...novo, pm: Math.max(0, novo.pm - res.pmCost) }
      if (item.key === alvo.key) novo = { ...novo, pv: Math.min(novo.pvMax, novo.pv + res.cura) }
      return novo
    })
    record({ type: 'cura', side: ator.side, actorKey: ator.key, targetKey: alvo.key, specialId: res.specialId, curado: res.cura, round })
    advanceTurn(next, ator.key, true)
    return true
  }, [combatants, advanceTurn, record, round])

  // Jogador usando talento de cura: mira o aliado mais machucado.
  const playerCura = useCallback((actorKey, special) => {
    if (phase !== 'player' || currentActor?.key !== actorKey) return false
    const aliados = combatants.filter(c => c.side === 'player' && c.pv > 0)
    const alvo = [...aliados].sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
    return curar(currentActor, alvo, special)
  }, [phase, currentActor, combatants, curar])

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
    if (pausado || pulando || phase !== 'enemy' || pending || aiQueued.current || !currentActor) return
    aiQueued.current = true
    const timer = setTimeout(() => {
      // Persona decide alvo e talento (ganguesPersonas.js).
      const acao = decidirAcaoInimigo(currentActor, combatants, { lastTargetKey: lastEnemyTargetKey.current, ultimoAgressorKey: ultimoAgressorKey.current }, targetRoll)
      aiQueued.current = false
      if (!acao) return
      lastEnemyTargetKey.current = acao.alvo?.key || null
      if (acao.tipo === 'cura') { if (curar(currentActor, acao.alvo, acao.special)) return }
      queueAction(currentActor, acao.alvo, acao.tipo === 'ataque' ? acao.specialId : null)
    }, enemyDelay)
    return () => { clearTimeout(timer); aiQueued.current = false }
  }, [pausado, phase, pending, currentActor, combatants, queueAction, enemyDelay, targetRoll, curar])

  const enterCombat = useCallback(() => {
    if (entered.current) return
    entered.current = true
    setStarted(true)
    record({ type: 'battle_start' })
  }, [record])

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
  // ATOR igual um ataque. `delta` é { pv?, pm?, status?, statusInimigos? }:
  // cura sempre positiva; `status` = efeitos temporários no aliado (Pinga,
  // Vela Benta, Cigarro); `statusInimigos` = em todo inimigo vivo (Bombinha).
  // O ator gasta 1 ação dos status que JÁ carregava ANTES de receber os novos
  // (senão uma Pinga tomada em si mesmo já nascia com uma ação a menos).
  const useItemAction = useCallback((actorKey, targetKey, itemId, delta) => {
    if (phase !== 'player' || currentActor?.key !== actorKey) return false
    const alvoKey = targetKey || actorKey
    // quanto de PV+PM entrou de verdade (o número verde que flutua na cura)
    const alvoAntes = combatants.find(item => item.key === alvoKey)
    const curado = alvoAntes
      ? Math.max(0, Math.min(alvoAntes.pvMax, alvoAntes.pv + (delta.pv || 0)) - alvoAntes.pv) + Math.max(0, Math.min(alvoAntes.pmMax, alvoAntes.pm + (delta.pm || 0)) - alvoAntes.pm)
      : 0
    const next = combatants.map(item => {
      let statuses = item.key === actorKey ? gastarAcaoStatus(item.statuses) : (item.statuses || [])
      if (item.key === alvoKey && delta.status?.length) statuses = [...statuses, ...delta.status]
      if (item.side === 'enemy' && item.pv > 0 && delta.statusInimigos?.length) statuses = [...statuses, ...delta.statusInimigos]
      // Remédio de status (ids 30–39): tira o status do Mandingueiro (entrada com `id`), nunca buff de item.
      if (item.key === alvoKey && delta.curaStatus != null) statuses = statuses.filter(st => st.id == null || (delta.curaStatus !== ST_TODOS && st.id !== delta.curaStatus))
      const cura = item.key === alvoKey
        ? { pv: Math.min(item.pvMax, item.pv + (delta.pv || 0)), pm: Math.min(item.pmMax, item.pm + (delta.pm || 0)) }
        : {}
      return { ...item, ...cura, statuses }
    })
    record({ type: 'item', side: 'player', actorKey, targetKey: alvoKey, itemId, delta, curado, round })
    advanceTurn(next, actorKey)
    return true
  }, [phase, currentActor, combatants, advanceTurn, record, round])

  return { combatants, phase, round, pending, events, initiative, tempo, currentActor, playerActors: phase === 'player' && currentActor ? [currentActor] : [], enterCombat, playerAction, completePending, useItemAction, syncFrom, playerCura }
}
