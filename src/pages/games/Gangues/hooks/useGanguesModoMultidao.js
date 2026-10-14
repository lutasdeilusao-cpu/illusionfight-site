// Briga em Multidão: estado da briga e a rodada inteira de uma vez. O switch
// da barra do topo liga e desliga a qualquer momento; ligar/desligar passa o
// PV/PM/status atual de um motor pro outro (alternarMultidao). Cada "avançar
// rodada" calcula a rodada inteira (engine/ganguesBrigaMultidao.js) e mostra
// TODOS os dados dela caindo juntos (GanguesDadosRodada); quando o painel
// fecha, o resultado da rodada cai na vida e no registro. O que cada um usa
// (talento, poção de PV, poção de PM) é a MESMA configuração do automático da
// briga comum (useGanguesAutoConfig). Com o automático ligado, a próxima
// rodada sai sozinha.
import { useEffect, useRef, useState } from 'react'
import { sfx } from '../../../../lib/sfx'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { iniciarBrigaMultidao, iniciarBrigaMultidaoDeCombatentes, avancarRodadaMultidao } from '../engine/ganguesBrigaMultidao.js'
import { transformarEvento, fighterName } from '../engine/ganguesCombatPresentation.js'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'

const MULTIDAO_BLINK_ID = 'multidao_blink'
/** Pausa entre uma rodada e a próxima no automático, em 1x (ms). */
const PAUSA_AUTO_MS = 700

export default function useGanguesModoMultidao({ store, machine, t, setLog, eventosBrutosRef, finish, result, multidaoDisponivel, modoMultidaoOn, setModoMultidaoOn, velocidade = 1, fx, autoOn, autoConfig }) {
  const { jaViu: jaViuTutorial, marcarVisto: marcarTutorialVisto } = useTutorialProgress()
  const multidaoBlinkVisto = jaViuTutorial(MULTIDAO_BLINK_ID)
  const modoMultidaoAtivo = multidaoDisponivel && modoMultidaoOn

  const [foco, setFoco] = useState(null)        // key do inimigo marcado
  const [estadoMultidao, setEstadoMultidao] = useState(null)
  const [revelandoRodada, setRevelandoRodada] = useState(false)
  const [golpeAtual, setGolpeAtual] = useState(null) // { actorKey, targetKey } destacado
  const [rodadaNaTela, setRodadaNaTela] = useState(null) // { eventos, final } com os dados caindo
  // O que cada um usa = a configuração do automático da briga comum: o talento
  // escolhido de cada um e, se ligadas, as poções de PV e de PM (a de PV primeiro).
  const config = autoConfig || { talentos: {}, pocao: false, pocaoPm: false }
  const poderes = config.talentos || {}
  const pocoes = [
    ...(config.pocao ? GANGUES_ITENS_LISTA.filter(i => i.tipo === 'cura_pv') : []),
    ...(config.pocaoPm ? GANGUES_ITENS_LISTA.filter(i => i.tipo === 'cura_pm') : []),
  ].filter(i => (store.inventario[i.id] || 0) > 0).map(i => i.id)
  const itens = Object.fromEntries(store.match.playerTeam.map(m => [m.id, pocoes]))

  // Foco em quem já caiu não vale mais.
  const focoVivo = foco && estadoMultidao?.combatants.some(c => c.key === foco && c.pv > 0) ? foco : null

  const marcarFoco = key => { sfx.select?.(); setFoco(atual => (atual === key ? null : key)) }

  // No modo multidão o motor golpe a golpe fica parado; fora dele, entra na luta.
  useEffect(() => { if (!modoMultidaoAtivo && machine.phase === 'select') machine.enterCombat() }, [modoMultidaoAtivo, machine.phase, machine.enterCombat])

  // Liga: monta a briga (do zero, ou a partir do estado vivo do motor normal).
  useEffect(() => {
    if (!modoMultidaoAtivo || estadoMultidao) return
    const jaAgiu = machine.combatants.some(c => c.actedThisRound) || machine.round > 1
    const inicial = jaAgiu
      ? iniciarBrigaMultidaoDeCombatentes(machine.combatants, machine.round, machine.tempo)
      : iniciarBrigaMultidao({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam })
    setEstadoMultidao(inicial)
    // Sem repetir linha se o efeito rodar duas vezes (modo estrito do React).
    const linhas = inicial.eventosIniciais.flatMap(event => transformarEvento(t, event, inicial.combatants))
    setLog(prev => [...prev, ...linhas.filter(l => !prev.some(p => p.id === l.id))])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoMultidaoAtivo])

  // Ligar no meio da luta só na SUA vez, sem golpe pendente — senão quem
  // ainda ia agir sumia sem atacar. Desligar vale a qualquer momento.
  const podeLigar = machine.phase === 'player' && !machine.pending
  const alternarMultidao = () => {
    if (revelandoRodada || result) return
    if (!modoMultidaoOn) {
      if (!podeLigar) return
      setModoMultidaoOn(true)
    } else {
      if (estadoMultidao) machine.syncFrom(estadoMultidao)
      setEstadoMultidao(null)
      setModoMultidaoOn(false)
    }
    if (!multidaoBlinkVisto) marcarTutorialVisto(MULTIDAO_BLINK_ID)
  }

  // Mostra um golpe: PV/PM/status depois dele, o número de dano, o destaque e a linha no registro.
  const revelarEvento = (evento, combatentesFinais) => {
    const depois = new Map((evento.depois || []).map(d => [d.key, d]))
    setEstadoMultidao(prev => prev && ({ ...prev, combatants: prev.combatants.map(c => (depois.has(c.key) ? { ...c, ...depois.get(c.key) } : c)) }))
    setGolpeAtual(evento.actorKey ? { actorKey: evento.actorKey, targetKey: evento.targetKey || null } : null)
    const nome = key => fighterName(t, combatentesFinais.find(c => c.key === key)) || '?'
    if (evento.type === 'attack') {
      const dano = evento.result?.damage || 0
      const escudo = evento.result?.shieldConsumed || 0
      if (dano > 0 || escudo > 0) {
        fx.soltarDmgPop({ id: evento.id, targetKey: evento.targetKey, actorName: nome(evento.actorKey), amount: dano, critical: Boolean(evento.result?.critical), shield: escudo, fatal: (depois.get(evento.targetKey)?.pv ?? 1) <= 0 })
        if (evento.result?.critical) fx.dispararCriticoFx()
        else if (dano > 0) { sfx.attackPunch?.(); if (evento.side === 'enemy') fx.dispararNudge() }
      }
    } else if ((evento.type === 'item' || evento.type === 'cura') && (evento.curado || 0) > 0) {
      fx.soltarDmgPop({ id: evento.id, targetKey: evento.targetKey, actorName: nome(evento.actorKey), amount: 0, heal: evento.curado, critical: false, shield: 0, fatal: false })
    }
    if (evento.type === 'item' || evento.itemId) store.usarItem(evento.itemId)
    eventosBrutosRef.current = [...eventosBrutosRef.current, evento]
    setLog(prev => [...prev, ...transformarEvento(t, evento, combatentesFinais, { compacto: true })])
  }

  // O painel dos dados fechou: a rodada inteira cai de uma vez (vida, números, registro).
  const fecharRodada = () => {
    const rodada = rodadaNaTela
    setRodadaNaTela(null)
    if (!rodada) return
    for (const evento of rodada.eventos) revelarEvento(evento, rodada.final.combatants)
    setEstadoMultidao(rodada.final)
    setGolpeAtual(null)
    setRevelandoRodada(false)
    if (rodada.final.terminado) finish(rodada.final.outcome)
  }

  // Avança UMA rodada: calcula inteira e joga todos os dados de uma vez.
  const avancarRodada = () => {
    if (revelandoRodada || result || !estadoMultidao) return
    sfx.vs?.()
    const especiais = {}
    for (const m of store.match.playerTeam) especiais[m.id] = getEquippedActiveGanguesSpecials(m)
    const proximo = avancarRodadaMultidao(estadoMultidao, { foco: focoVivo, poderes, especiais, itens, estoque: store.inventario })
    setRevelandoRodada(true)
    setRodadaNaTela({ eventos: proximo.eventosRodada, final: proximo })
  }

  // Automático: a próxima rodada sai sozinha. Para enquanto o cartão de KO
  // está na tela, pra o momento não passar batido.
  const avancarRef = useRef(avancarRodada)
  avancarRef.current = avancarRodada
  useEffect(() => {
    if (!modoMultidaoAtivo || !autoOn || !estadoMultidao || estadoMultidao.terminado || revelandoRodada || result || fx.koCena) return
    const timer = setTimeout(() => avancarRef.current(), PAUSA_AUTO_MS / velocidade)
    return () => clearTimeout(timer)
  }, [velocidade, modoMultidaoAtivo, autoOn, estadoMultidao, revelandoRodada, result, fx.koCena])

  return {
    modoMultidaoOn, modoMultidaoAtivo, alternarMultidao, podeLigar, multidaoBlinkVisto,
    estadoMultidao, revelandoRodada, golpeAtual, rodadaNaTela, fecharRodada, avancarRodada,
    foco: focoVivo, marcarFoco,
  }
}
