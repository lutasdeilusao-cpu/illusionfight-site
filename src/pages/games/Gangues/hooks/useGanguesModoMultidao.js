// Briga em Multidão: um SWITCH na barra do topo (não uma tela separada),
// visível só quando o bando é grande o bastante (6+ combatentes somados).
// Continua por TURNO — cada aperto em "avançar rodada" resolve uma rodada
// inteira (todo mundo vivo age uma vez) e PARA; o jogador decide se
// continua. O switch trava assim que a primeira rodada/ataque acontece,
// pra não ter que sincronizar dois motores de combate no meio da luta.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useEffect, useState } from 'react'
import { sfx } from '../../../../lib/sfx'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { iniciarBrigaMultidao, avancarRodadaMultidao } from '../engine/ganguesBrigaMultidao.js'
import { transformarEvento, multidaoBlinkJaVisto, marcarMultidaoBlinkVisto } from '../engine/ganguesCombatPresentation.js'

export default function useGanguesModoMultidao({ store, machine, t, setLog, eventosBrutosRef, finish, result, switchTravado, setSwitchTravado }) {
  const totalCombatentes = (store.match.playerTeam?.length || 0) + (store.match.enemyTeam?.length || 0)
  const multidaoDisponivel = totalCombatentes >= 6
  const [modoMultidaoOn, setModoMultidaoOn] = useState(false)
  const [multidaoBlinkVisto, setMultidaoBlinkVisto] = useState(multidaoBlinkJaVisto)
  const modoMultidaoAtivo = multidaoDisponivel && modoMultidaoOn

  const [poderesMultidao, setPoderesMultidao] = useState({}) // sheetId -> specialId | null
  // Usar item na Briga em Multidão: marcar aqui abre mão do ataque daquele
  // personagem NA PRÓXIMA rodada (ver avancarRodadaMultidao). Sem sistema de
  // item de verdade ainda — reserva só o comportamento de "gastar a ação".
  const [itensMultidao, setItensMultidao] = useState({}) // sheetId -> true | undefined
  const [estadoMultidao, setEstadoMultidao] = useState(null)
  const [revelandoRodada, setRevelandoRodada] = useState(false)

  const marcarBlinkVisto = () => { marcarMultidaoBlinkVisto(); setMultidaoBlinkVisto(true) }

  const cicloPoderMultidao = (member) => {
    const especiais = getEquippedActiveGanguesSpecials(member)
    if (!especiais.length) return
    setPoderesMultidao(prev => {
      const atual = prev[member.id] || null
      const opcoes = [null, ...especiais.map(s => s.id)]
      const proximo = opcoes[(opcoes.indexOf(atual) + 1) % opcoes.length]
      return { ...prev, [member.id]: proximo }
    })
  }
  const toggleItemMultidao = (member) => {
    setItensMultidao(prev => ({ ...prev, [member.id]: !prev[member.id] }))
  }

  // No modo multidão o motor golpe-a-golpe fica ocioso de propósito — quem
  // resolve a luta é o estadoMultidao (avancarRodadaMultidao).
  useEffect(() => { if (!modoMultidaoAtivo && machine.phase === 'select') machine.enterCombat() }, [modoMultidaoAtivo, machine.phase, machine.enterCombat])

  // Prepara o estado da Briga em Multidão assim que o switch liga — igual o
  // enterCombat() do modo normal, só que pro outro motor. Sem isso o roster
  // mostraria as fichas cruas (sem pv/pvMax/key) até o primeiro clique.
  useEffect(() => {
    if (!modoMultidaoAtivo || estadoMultidao) return
    const inicial = iniciarBrigaMultidao({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam })
    setEstadoMultidao(inicial)
    setLog(prev => [...prev, ...inicial.eventosIniciais.flatMap(event => transformarEvento(t, event, inicial.combatants))])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoMultidaoAtivo, estadoMultidao])

  // ── Briga em Multidão: avança exatamente UMA rodada por clique — nunca a
  // luta inteira. Poderes são lidos na hora (o jogador pode trocar entre
  // rodadas, ciclando os chips). ──
  const avancarRodada = () => {
    if (revelandoRodada || result || !estadoMultidao) return
    sfx.vs?.()
    if (!switchTravado) setSwitchTravado(true)

    const especiaisPorPersonagem = {}
    for (const m of store.match.playerTeam) especiaisPorPersonagem[m.id] = getEquippedActiveGanguesSpecials(m)
    const proximoEstado = avancarRodadaMultidao(estadoMultidao, poderesMultidao, especiaisPorPersonagem, itensMultidao)
    // "Usar item" é por rodada (consumível, não um poder fixo) — some depois
    // de gastar, senão o personagem ficaria abrindo mão do ataque pra sempre.
    setItensMultidao({})

    setRevelandoRodada(true)
    setTimeout(() => {
      setEstadoMultidao(proximoEstado)
      eventosBrutosRef.current = [...eventosBrutosRef.current, ...proximoEstado.eventosRodada]
      const entradasRodada = proximoEstado.eventosRodada.flatMap(event => transformarEvento(t, event, proximoEstado.combatants))
      setLog(prev => [...prev, ...entradasRodada])
      setRevelandoRodada(false)
      if (proximoEstado.terminado) finish(proximoEstado.outcome)
    }, 900)
  }

  return {
    multidaoDisponivel, modoMultidaoOn, setModoMultidaoOn, multidaoBlinkVisto, marcarBlinkVisto,
    modoMultidaoAtivo, poderesMultidao, itensMultidao, estadoMultidao, revelandoRodada,
    cicloPoderMultidao, toggleItemMultidao, avancarRodada,
  }
}
