import { logDebug } from '../../../../lib/debugLog'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resolveGanguesAction, resolveGanguesCura } from '../engine/ganguesCombatResolver.js'
import { decidirAcaoInimigo } from '../engine/ganguesPersonas.js'
import { statusImpedeAcao, alvoComTontura } from '../engine/ganguesStatus.js'
import { iniciarLinhaDoTempo, proximaVez, consumirVez, marcarAgiu, ordemDeVelocidade } from '../engine/ganguesLinhaDoTempo.js'
import { prepararTimes, aplicarAtaque, aplicarCura, aplicarItem, curaRealDoItem } from '../engine/ganguesRegrasCombate.js'

const d3 = () => Math.floor(Math.random() * 3) + 1

export default function useGanguesTurnMachine({ playerTeam = [], enemyTeam = [], onFinish, attackRoll = d3, defenseRoll = d3, targetRoll = Math.random, enemyDelay = 2200, pausado = false }) {
  const initial = useMemo(() => prepararTimes(playerTeam, enemyTeam), [])
  // Linha do tempo (Pique, ver engine/ganguesLinhaDoTempo.js): quem age é quem
  // chega primeiro no centro da pista. `tempo` = barras de cada um; `vez` =
  // quem age agora.
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
    // na mesma rodada — a key do painel do golpe não pode ser actorKey+round.
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
    const next = aplicarAtaque(combatants, pending.actorKey, pending.targetKey, pending.result)
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
    const next = aplicarCura(combatants, ator.key, alvo.key, res)
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
    // `pausado` (Briga em Multidão no controle, ou a pergunta de início
    // aberta): o motor normal não age sozinho — senão o inimigo da vez
    // atacava escondido atrás da tela da Multidão.
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
    const curado = curaRealDoItem(combatants.find(item => item.key === alvoKey), delta)
    const next = aplicarItem(combatants, actorKey, alvoKey, delta)
    record({ type: 'item', side: 'player', actorKey, targetKey: alvoKey, itemId, delta, curado, round })
    advanceTurn(next, actorKey)
    return true
  }, [phase, currentActor, combatants, advanceTurn, record, round])

  // Log de batalha (contas admin): cada troca de vez.
  useEffect(() => {
    if (!started) return
    logDebug('gangues.luta.vez', { round, turnoSeq, ator: currentActor?.key, lado: currentActor?.side, fase: phase, pending: Boolean(pending), vivos: combatants.filter(c => c.pv > 0).map(c => c.key) })
  }, [turnoSeq, started]) // eslint-disable-line react-hooks/exhaustive-deps

  // Vigia: painel de golpe aberto há mais de 12 s = preso (ex.: a tela do dado
  // quebrou). Grava no log e fecha o golpe pra luta seguir.
  const completeRef = useRef(completePending)
  completeRef.current = completePending
  useEffect(() => {
    if (!pending) return
    const id = setTimeout(() => {
      logDebug('gangues.luta.golpe_preso', { round, turnoSeq, pending: { id: pending.id, actorKey: pending.actorKey, targetKey: pending.targetKey, side: pending.side } })
      completeRef.current()
    }, 12000)
    return () => clearTimeout(id)
  }, [pending?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { combatants, phase, round, pending, events, initiative, tempo, turnoSeq, currentActor, playerActors: phase === 'player' && currentActor ? [currentActor] : [], enterCombat, playerAction, completePending, useItemAction, syncFrom, playerCura }
}
