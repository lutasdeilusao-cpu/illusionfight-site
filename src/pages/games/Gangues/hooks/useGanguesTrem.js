import { useEffect, useRef, useState } from 'react'
import { PLAYER_RADIUS } from '../engine/ganguesCenaMotor.js'

// A LINHA DO TREM da Baixada (`cena.trem`, ver data/cenas/baixada/mundo.js).
// Ciclo: livre → apito (aviso) → passando (a travessia fecha) → livre. Enquanto
// passa, a faixa dos trilhos vira um "muro" (o `gate` que o motor já entende,
// ver hitsSolid). Quem estiver nos trilhos quando o trem chega leva dano na
// tropa e é jogado pro lado mais perto. Só corre com o jogador na rua e nada
// aberto por cima (`rodando`); pausado, o ciclo recomeça do zero.
export default function useGanguesTrem({ trem, rodando, player, setPlayer, onAtropelo }) {
  const [fase, setFase] = useState('livre')
  const playerRef = useRef(player); playerRef.current = player
  const atropeloRef = useRef(onAtropelo); atropeloRef.current = onAtropelo

  useEffect(() => {
    if (!trem || !rodando) { setFase('livre'); return }
    const timers = []
    const ciclo = () => {
      timers.push(setTimeout(() => {
        setFase('apito')
        timers.push(setTimeout(() => {
          setFase('passando')
          timers.push(setTimeout(() => { setFase('livre'); ciclo() }, trem.passa))
        }, trem.aviso))
      }, Math.max(1000, trem.ciclo - trem.aviso - trem.passa)))
    }
    ciclo()
    return () => timers.forEach(clearTimeout)
  }, [trem, rodando])

  // O trem chegou: se o jogador tá nos trilhos, joga pro lado mais perto.
  useEffect(() => {
    if (fase !== 'passando' || !trem) return
    const p = playerRef.current
    if (p.y + PLAYER_RADIUS <= trem.y1 || p.y - PLAYER_RADIUS >= trem.y2) return
    const acima = p.y < (trem.y1 + trem.y2) / 2
    setPlayer({ ...p, y: acima ? trem.y1 - PLAYER_RADIUS - 4 : trem.y2 + PLAYER_RADIUS + 4 })
    atropeloRef.current?.()
  }, [fase, trem, setPlayer])

  return { fase, gate: trem && fase === 'passando' ? { y1: trem.y1, y2: trem.y2 } : null }
}
