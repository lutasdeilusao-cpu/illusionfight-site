// Modo Automático: liga e os personagens atacam sozinhos com o ataque normal,
// sempre — quem quiser usar poder tem que desligar e voltar pro manual.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODO_AUTO_EXIGE_ASSINATURA, TIERS_COM_MODO_AUTO } from '../engine/ganguesCombatPresentation.js'

export default function useGanguesModoAuto({ perfil, modoMultidaoAtivo, machinePhase, result, koCena, selectedActor, selectedTarget, handleAttack }) {
  const navigate = useNavigate()
  // Beta: o botão APARECE pra todo mundo (é chamariz de assinatura — o cara vê
  // toda hora que podia automatizar). `podeUsarModoAuto` só decide se toca ou
  // se manda pro /assinar. Hoje o flag está desligado → todo mundo pode.
  const podeUsarModoAuto = !MODO_AUTO_EXIGE_ASSINATURA || TIERS_COM_MODO_AUTO.includes(perfil?.tier)
  const [modoAutoOn, setModoAutoOn] = useState(false)
  const autoQueuedRef = useRef(false)
  const toggleModoAuto = () => {
    if (!podeUsarModoAuto) { navigate('/assinar'); return }
    setModoAutoOn(v => !v)
  }

  // ── Modo Automático: quando é a vez do jogador, ataca sozinho com o
  // ataque normal (nunca poder) depois de uma pausa curta — dá pra ver o
  // alvo escolhido antes do golpe sair, em vez de resolver instantâneo.
  // autoQueuedRef evita disparar de novo enquanto o timer da rodada atual
  // ainda não resolveu (mesmo padrão do aiQueued em useGanguesTurnMachine).
  useEffect(() => {
    // koCena: o modo automático PARA enquanto o cartão de KO está na tela —
    // senão o próximo golpe já sai e o momento passa batido (era isso que o
    // Isaias via em auto). Quando o KO fecha, koCena volta a null e o efeito
    // re-dispara sozinho.
    if (modoMultidaoAtivo || !modoAutoOn || !podeUsarModoAuto || machinePhase !== 'player' || result || koCena || !selectedActor || !selectedTarget) {
      autoQueuedRef.current = false
      return
    }
    if (autoQueuedRef.current) return
    autoQueuedRef.current = true
    const timer = setTimeout(() => { handleAttack(null); autoQueuedRef.current = false }, 750)
    return () => clearTimeout(timer)
  }, [modoMultidaoAtivo, modoAutoOn, podeUsarModoAuto, machinePhase, result, koCena, selectedActor, selectedTarget])

  return { podeUsarModoAuto, modoAutoOn, setModoAutoOn, toggleModoAuto }
}
