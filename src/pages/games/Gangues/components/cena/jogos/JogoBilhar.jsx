// BILHAR DE TRÊS BOLAS contra o Contador — jogo próprio dele. Mesa vista de
// cima; arrasta o dedo pra trás da bola branca (mira + força) e solta. O
// Contador encaçapou as 3 em 5 tacadas: tu tem até TACADAS_MAX pra fazer
// igual. Branca na caçapa volta pro lugar e conta a tacada. Canvas com cor em
// hex literal de propósito (canvas não lê var() — ver AGENTS.md).
import { useEffect, useRef, useState } from 'react'
import { sfx } from '../../../../../../lib/sfx'

const W = 300, H = 480, R = 9, BORDA = 18, CACAPA = 17
export const TACADAS_MAX = 6
const ATRITO = 0.985, PARADO = 0.05, FORCA_MAX = 16
const CACAPAS = [
  [BORDA, BORDA], [W - BORDA, BORDA], [BORDA, H / 2], [W - BORDA, H / 2], [BORDA, H - BORDA], [W - BORDA, H - BORDA],
]
const BRANCA_INICIO = { x: W / 2, y: H - 110 }
const iniciais = () => [
  { id: 0, ...BRANCA_INICIO, vx: 0, vy: 0, cor: '#f4f1ea' },
  { id: 1, x: W / 2, y: 150, vx: 0, vy: 0, cor: '#f5a623' },
  { id: 2, x: W / 2 - R - 1, y: 150 - 2 * R, vx: 0, vy: 0, cor: '#ff0055' },
  { id: 3, x: W / 2 + R + 1, y: 150 - 2 * R, vx: 0, vy: 0, cor: '#18dafb' },
]

function passo(bolas) {
  let caiu = []
  for (const b of bolas) {
    b.x += b.vx; b.y += b.vy; b.vx *= ATRITO; b.vy *= ATRITO
    if (Math.hypot(b.vx, b.vy) < PARADO) { b.vx = 0; b.vy = 0 }
    if (b.x < BORDA + R) { b.x = BORDA + R; b.vx = -b.vx * 0.85 }
    if (b.x > W - BORDA - R) { b.x = W - BORDA - R; b.vx = -b.vx * 0.85 }
    if (b.y < BORDA + R) { b.y = BORDA + R; b.vy = -b.vy * 0.85 }
    if (b.y > H - BORDA - R) { b.y = H - BORDA - R; b.vy = -b.vy * 0.85 }
  }
  // choque entre bolas (massas iguais, elástico)
  for (let i = 0; i < bolas.length; i++) for (let j = i + 1; j < bolas.length; j++) {
    const a = bolas[i], b = bolas[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy)
    if (d > 0 && d < 2 * R) {
      const nx = dx / d, ny = dy / d, sobra = (2 * R - d) / 2
      a.x -= nx * sobra; a.y -= ny * sobra; b.x += nx * sobra; b.y += ny * sobra
      const va = a.vx * nx + a.vy * ny, vb = b.vx * nx + b.vy * ny
      if (va - vb > 0) { const troca = va - vb; a.vx -= troca * nx; a.vy -= troca * ny; b.vx += troca * nx; b.vy += troca * ny }
    }
  }
  for (const b of bolas) if (CACAPAS.some(([cx, cy]) => Math.hypot(b.x - cx, b.y - cy) < CACAPA)) caiu.push(b.id)
  return caiu
}

function desenhar(ctx, bolas, mira) {
  ctx.fillStyle = '#3b2414'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#0f5a3a'; ctx.fillRect(BORDA - 6, BORDA - 6, W - 2 * BORDA + 12, H - 2 * BORDA + 12)
  ctx.fillStyle = '#05140d'
  for (const [cx, cy] of CACAPAS) { ctx.beginPath(); ctx.arc(cx, cy, CACAPA, 0, Math.PI * 2); ctx.fill() }
  if (mira) {
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(mira.x, mira.y); ctx.lineTo(mira.x + mira.dx * 9, mira.y + mira.dy * 9); ctx.stroke(); ctx.setLineDash([])
  }
  for (const b of bolas) {
    ctx.fillStyle = b.cor; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; ctx.stroke()
  }
}

export default function JogoBilhar({ t, onFim }) {
  const canvasRef = useRef(null)
  const bolasRef = useRef(iniciais())
  const arrasto = useRef(null)
  const [tacadas, setTacadas] = useState(0)
  const [rolando, setRolando] = useState(false)
  const [mira, setMira] = useState(null)
  const restantes = bolasRef.current.filter(b => b.id !== 0).length

  // laço de física enquanto alguma bola anda
  useEffect(() => {
    if (!rolando) return
    let raf
    const tick = () => {
      const bolas = bolasRef.current
      const caiu = passo(bolas)
      for (const id of caiu) {
        if (id === 0) { Object.assign(bolas[0], BRANCA_INICIO, { vx: 0, vy: 0 }); sfx.cancel?.() }
        else { bolasRef.current = bolas.filter(b => b.id !== id); sfx.reward?.() }
      }
      desenhar(canvasRef.current.getContext('2d'), bolasRef.current, null)
      if (bolasRef.current.every(b => !b.vx && !b.vy)) { setRolando(false); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [rolando])

  useEffect(() => { desenhar(canvasRef.current.getContext('2d'), bolasRef.current, mira) }, [mira])

  // fim: parou de rolar e acabou as bolas ou as tacadas
  useEffect(() => {
    if (rolando) return
    if (restantes === 0) onFim(true)
    else if (tacadas >= TACADAS_MAX) onFim(false)
  }, [rolando, restantes, tacadas, onFim])

  const ponto = e => {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }
  }
  const vetor = p => {
    const branca = bolasRef.current[0]
    let dx = (arrasto.current.x - p.x) / 6, dy = (arrasto.current.y - p.y) / 6
    const f = Math.hypot(dx, dy)
    if (f > FORCA_MAX) { dx = dx / f * FORCA_MAX; dy = dy / f * FORCA_MAX }
    return { x: branca.x, y: branca.y, dx, dy }
  }
  const down = e => { if (rolando || tacadas >= TACADAS_MAX) return; e.currentTarget.setPointerCapture?.(e.pointerId); arrasto.current = ponto(e) }
  const move = e => { if (arrasto.current) setMira(vetor(ponto(e))) }
  const up = e => {
    if (!arrasto.current) return
    const v = vetor(ponto(e)); arrasto.current = null; setMira(null)
    if (Math.hypot(v.dx, v.dy) < 0.6) return
    Object.assign(bolasRef.current[0], { vx: v.dx, vy: v.dy })
    sfx.select?.(); setTacadas(n => n + 1); setRolando(true)
  }

  return (
    <div className="gang-jogo-bilhar">
      <div className="gang-jogo-placar">
        <span>{t('games.gangues.jogo.bilhar_tacadas', { n: tacadas, max: TACADAS_MAX })}</span>
        <span>{t('games.gangues.jogo.bilhar_bolas', { n: restantes })}</span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="gang-jogo-mesa" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { arrasto.current = null; setMira(null) }} />
      <p className="gang-jogo-rotulo">{t('games.gangues.jogo.bilhar_como')}</p>
    </div>
  )
}
