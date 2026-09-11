// Desfecho da batalha: encerrar (finish), a fala de quem perdeu, o timer do
// botão de resultado, e a montagem do relatório de batalha pra GanguesVictory.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useCallback, useEffect, useState } from 'react'
import { sfx } from '../../../../lib/sfx'
import { fighterName, pickTrash, computarContribuicoes } from '../engine/ganguesCombatPresentation.js'

export default function useGanguesBattleOutcome({ store, t, registrarEvento, onNavigate }) {
  const [result, setResult] = useState(null)
  // O derrotado fala antes da tela de resultado subir. Sem essa pausa a
  // batalha acabava seca, sem reação de quem perdeu.
  const [falaFinal, setFalaFinal] = useState(null)
  const [showResultBtn, setShowResultBtn] = useState(false)

  const finish = useCallback(outcome => {
    store.endMatch(outcome)
    setResult(outcome)
    if (outcome === 'victory') registrarEvento('arena_vitoria', 'Venceu uma batalha de gangue', 1)
    outcome === 'victory' ? sfx.win() : sfx.lose()
  }, [store, registrarEvento])

  // Quem perdeu comenta: na vitória do jogador é o inimigo caindo
  // ('defeat'); na derrota, é ele debochando ('player_near_death').
  useEffect(() => {
    if (!result) return
    const inimigo = store.match.enemy
    if (!inimigo) return
    const linha = pickTrash(t, inimigo, result === 'victory' ? 'defeat' : 'player_near_death')
    if (!linha) return
    setFalaFinal({ nome: fighterName(t, { ...inimigo, side: 'enemy' }), texto: linha, outcome: result })
    const timer = setTimeout(() => setFalaFinal(null), 2600)
    return () => clearTimeout(timer)
  }, [result, store.match.enemy, t])

  useEffect(() => {
    if (!result || falaFinal) { setShowResultBtn(false); return }
    const timer = setTimeout(() => setShowResultBtn(true), 1400)
    return () => clearTimeout(timer)
  }, [result, falaFinal])

  // Recebe o que só existe depois que `machine`/`estadoMultidao` estão
  // prontos — em vez de fechar sobre eles na criação do hook (que rodaria
  // ANTES de useGanguesTurnMachine existir, já que ele usa `finish` daqui).
  const openBattleReport = ({ modoMultidaoAtivo, estadoMultidao, machine, log, eventosBrutosRef }) => {
    const initiative = modoMultidaoAtivo ? (estadoMultidao?.initiative || []) : machine.initiative
    const combatants = modoMultidaoAtivo ? (estadoMultidao?.combatants || []) : machine.combatants
    const rounds = modoMultidaoAtivo ? (estadoMultidao?.round || 1) : machine.round
    const contribuicoes = computarContribuicoes(eventosBrutosRef.current, combatants)
    store.setBattleReport({ outcome: result, entries: log, initiative, combatants, rounds, contribuicoes })
    onNavigate('victory')
  }

  return { result, falaFinal, showResultBtn, finish, openBattleReport }
}
