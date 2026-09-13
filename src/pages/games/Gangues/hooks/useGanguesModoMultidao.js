// Briga em Multidão: um SWITCH na barra do topo (não uma tela separada),
// visível só quando o bando é grande o bastante (6+ combatentes somados).
// Continua por TURNO — cada aperto em "avançar rodada" resolve uma rodada
// inteira (todo mundo vivo age uma vez) e PARA; o jogador decide se
// continua. O switch liga E desliga a qualquer momento (pedido do Isaias,
// 13/09/2026: "liguei pra testar e não consegui desligar mais, não pode ser
// assim") — ligar/desligar sincroniza o HP/PM/status atual entre os dois
// motores de combate (ver alternarMultidao) em vez de travar o botão depois
// da 1ª ação, como era antes.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useEffect, useState } from 'react'
import { sfx } from '../../../../lib/sfx'
import { getEquippedActiveGanguesSpecials } from '../engine/ganguesSpecialEffects.js'
import { iniciarBrigaMultidao, iniciarBrigaMultidaoDeCombatentes, avancarRodadaMultidao } from '../engine/ganguesBrigaMultidao.js'
import { transformarEvento, multidaoBlinkJaVisto, marcarMultidaoBlinkVisto } from '../engine/ganguesCombatPresentation.js'

export default function useGanguesModoMultidao({ store, machine, t, setLog, eventosBrutosRef, finish, result }) {
  const totalCombatentes = (store.match.playerTeam?.length || 0) + (store.match.enemyTeam?.length || 0)
  // Piso baixado de 6 pra 5 (pedido do Isaias, 13/09/2026): "é jogo de gangue,
  // não RPG clássico, precisa ter mais briga em multidão" — com o time da
  // Pista travado em 2-3 fichas o jogo inteiro, 6 quase nunca batia.
  const multidaoDisponivel = totalCombatentes >= 5
  const [modoMultidaoOn, setModoMultidaoOn] = useState(false)
  const [multidaoBlinkVisto, setMultidaoBlinkVisto] = useState(() => multidaoBlinkJaVisto(store._saveId))
  const modoMultidaoAtivo = multidaoDisponivel && modoMultidaoOn

  const [poderesMultidao, setPoderesMultidao] = useState({}) // sheetId -> specialId | null
  // Usar item na Briga em Multidão: marcar aqui abre mão do ataque daquele
  // personagem NA PRÓXIMA rodada (ver avancarRodadaMultidao). Sem sistema de
  // item de verdade ainda — reserva só o comportamento de "gastar a ação".
  const [itensMultidao, setItensMultidao] = useState({}) // sheetId -> true | undefined
  const [estadoMultidao, setEstadoMultidao] = useState(null)
  const [revelandoRodada, setRevelandoRodada] = useState(false)

  const marcarBlinkVisto = () => { marcarMultidaoBlinkVisto(store._saveId); setMultidaoBlinkVisto(true) }

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

  // Liga/desliga o modo Multidão a qualquer momento da luta, sincronizando o
  // HP/PM/status atual entre os dois motores — nunca reseta ninguém pra
  // cheio nem perde dano já levado, não importa quantas vezes o jogador
  // alternar. `revelandoRodada`/`result` bloqueiam só o instante de uma
  // rodada sendo revelada ou a luta já ter acabado (ver GanguesCombatTopBar).
  const alternarMultidao = () => {
    if (revelandoRodada || result) return
    if (!modoMultidaoOn) {
      // LIGANDO — parte do estado VIVO do motor normal quando ele já andou
      // (preserva PV/PM/rodada); se ninguém agiu ainda, tanto faz partir do
      // time cru (idêntico ao vivo nesse ponto, mas já pronto antes do 1º
      // render da Multidão).
      if (!estadoMultidao) {
        const jaAgiu = machine.combatants.some(c => c.actedThisRound) || machine.round > 1
        const inicial = jaAgiu
          ? iniciarBrigaMultidaoDeCombatentes(machine.combatants, machine.round)
          : iniciarBrigaMultidao({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam })
        setEstadoMultidao(inicial)
        setLog(prev => [...prev, ...inicial.eventosIniciais.flatMap(event => transformarEvento(t, event, inicial.combatants))])
      }
      setModoMultidaoOn(true)
    } else {
      // DESLIGANDO — devolve o estado atual da Multidão pro motor normal.
      if (estadoMultidao) machine.syncFrom(estadoMultidao)
      setModoMultidaoOn(false)
    }
    if (!multidaoBlinkVisto) marcarBlinkVisto()
  }

  // ── Briga em Multidão: avança exatamente UMA rodada por clique — nunca a
  // luta inteira. Poderes são lidos na hora (o jogador pode trocar entre
  // rodadas, ciclando os chips). ──
  const avancarRodada = () => {
    if (revelandoRodada || result || !estadoMultidao) return
    sfx.vs?.()

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
    multidaoDisponivel, modoMultidaoOn, alternarMultidao, multidaoBlinkVisto,
    modoMultidaoAtivo, poderesMultidao, itensMultidao, estadoMultidao, revelandoRodada,
    cicloPoderMultidao, toggleItemMultidao, avancarRodada,
  }
}
