// Modo Automático DENTRO da Briga em Multidão: liga e cada rodada avança
// sozinha (respeitando os talentos/itens já marcados nos chips), até alguém
// desligar ou a luta acabar. Espelha useGanguesModoAuto.js (mesmo padrão de
// estado/toggle), mas o "tick" é outro: lá é 1 ataque por vez (handleAttack),
// aqui é 1 RODADA inteira por vez (avancarRodada) — granularidades diferentes
// do motor golpe-a-golpe vs. o motor de rodada da Multidão, por isso um hook
// à parte em vez de estender o mesmo.
// Pedido do Isaias (13/09/2026): "não dá pra habilitar o automático na Briga
// em Multidão, deveria dar, do mesmo jeito que no modo normal".
import { useEffect, useRef, useState } from 'react'

export default function useGanguesModoAutoMultidao({ modoMultidaoAtivo, estadoMultidao, revelandoRodada, result, koCena, avancarRodada }) {
  const [modoAutoMultidaoOn, setModoAutoMultidaoOn] = useState(false)
  const toggleModoAutoMultidao = () => setModoAutoMultidaoOn(v => !v)
  const autoQueuedRef = useRef(false)

  // Saiu da Multidão (ou a luta virou pro motor normal) — desarma o automático
  // daqui. Sem isso ele ficaria "escondido" ligado e voltaria a avançar
  // rodada sozinho se o jogador reentrar na Multidão sem querer.
  useEffect(() => { if (!modoMultidaoAtivo) setModoAutoMultidaoOn(false) }, [modoMultidaoAtivo])

  useEffect(() => {
    // koCena: mesmo motivo do modo automático normal — para enquanto o
    // cartão de KO está na tela, senão a próxima rodada já sai e o momento
    // passa batido.
    if (!modoMultidaoAtivo || !modoAutoMultidaoOn || !estadoMultidao || estadoMultidao.terminado || revelandoRodada || result || koCena) {
      autoQueuedRef.current = false
      return
    }
    if (autoQueuedRef.current) return
    autoQueuedRef.current = true
    const timer = setTimeout(() => { avancarRodada(); autoQueuedRef.current = false }, 900)
    return () => clearTimeout(timer)
  }, [modoMultidaoAtivo, modoAutoMultidaoOn, estadoMultidao, revelandoRodada, result, koCena])

  return { modoAutoMultidaoOn, setModoAutoMultidaoOn, toggleModoAutoMultidao }
}
