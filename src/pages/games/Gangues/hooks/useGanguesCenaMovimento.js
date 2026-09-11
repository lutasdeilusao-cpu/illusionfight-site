// Movimento do jogador na cena: teclado (setas/WASD) + o loop de passo fixo
// (STEP_MS) que aplica colisão. Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
import { useEffect, useRef, useState } from 'react'
import { STEP_MS, stepPlayer } from '../engine/ganguesCenaMotor.js'

export default function useGanguesCenaMovimento({ intro, encontro, fade, gateRef, collidersRef, worldRef, initialPlayer, initialFacing = 'up' }) {
  const [player, setPlayer] = useState(initialPlayer)
  const [facing, setFacing] = useState(initialFacing)
  const [andou, setAndou] = useState(false)
  const inputRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef(new Set())
  const passosRef = useRef(0)

  useEffect(() => {
    const down = e => { if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) { e.preventDefault(); keysRef.current.add(e.key.toLowerCase()) } }
    const up = e => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    if (intro || encontro || fade) return
    let cancelado = false, timer
    const passo = () => {
      if (cancelado) return
      const k = keysRef.current
      const ix = inputRef.current.x + (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0)
      const iy = inputRef.current.y + (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0)
      if (Math.hypot(ix, iy) > .35) {
        const dx = Math.abs(ix) >= Math.abs(iy) ? (ix > 0 ? 1 : -1) : 0
        const dy = dx === 0 ? (iy > 0 ? 1 : -1) : 0
        setFacing(dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up')
        setAndou(true)
        setPlayer(p => { const np = stepPlayer(p, dx, dy, gateRef.current, collidersRef.current, worldRef.current); if (np !== p) passosRef.current++; return np })
      }
      timer = setTimeout(passo, STEP_MS)
    }
    timer = setTimeout(passo, 0)
    return () => { cancelado = true; clearTimeout(timer) }
  }, [intro, encontro, fade])

  return { player, setPlayer, facing, setFacing, andou, setAndou, inputRef, passosRef }
}
