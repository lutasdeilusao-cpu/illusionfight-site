/**
 * Câmera do tabuleiro — LDI Arena.
 * O tabuleiro inteiro é desenhado a partir de dois números: onde a grade começa na tela
 * (padRef) e o tamanho do hexágono (sizeRef). A câmera só escreve neles, a cada quadro;
 * desenho, animação, balões e toque passam a seguir a câmera sem saber que ela existe.
 *
 * - Segue quem está agindo (modo 'seguir').
 * - Na vez do jogador, arrastar o dedo no tabuleiro olha em volta (modo 'livre');
 *   o botão de centralizar ou a troca de turno voltam a seguir.
 * - Zoom em botões (− / +), nunca em pinça: o jogo é usado com uma mão.
 * Coordenadas do mundo em "tamanho de hexágono = 1": x = col × 1,5, y = row × √3 (+ √3/2 nas colunas ímpares).
 */

import { useRef, useCallback } from 'react'

const SQRT3 = Math.sqrt(3)
const SZ_LEGIVEL = 30   // tamanho em que a ficha e o hexágono são lidos com folga no celular
const SZ_PERTO = 44
const SUAVE = 0.18      // quanto a câmera anda até o alvo a cada quadro
const ARRASTO_MIN = 8   // px de dedo antes de virar arrasto (abaixo disso é toque)

export function centroMundo(row, col) {
  return { x: col * 1.5, y: row * SQRT3 + (col % 2 ? SQRT3 / 2 : 0) }
}

export default function useCamera({ canvasRef, cols, rows, padRef, sizeRef }) {
  const cam = useRef({ modo: 'seguir', sz: null, alvo: null, atual: null, foco: null })
  const arrasto = useRef(null)

  const limites = useCallback(() => ({
    x0: -1, x1: (cols - 1) * 1.5 + 1,
    y0: -SQRT3 / 2, y1: rows * SQRT3 + (cols > 1 ? SQRT3 / 2 : 0) - SQRT3 / 2,
  }), [cols, rows])

  // Tamanho em que o tabuleiro inteiro cabe na tela.
  const szCabe = useCallback(() => {
    const c = canvasRef.current
    if (!c || !c.width) return SZ_LEGIVEL
    return Math.min(c.width / (cols * 1.5 + 0.5), c.height / (rows * SQRT3 + SQRT3 / 2))
  }, [canvasRef, cols, rows])

  // Abre no tabuleiro inteiro quando ele cabe legível; senão abre no tamanho legível e segue quem age.
  const szInicial = useCallback(() => {
    const cabe = szCabe()
    return cabe >= SZ_LEGIVEL - 4 ? cabe : SZ_LEGIVEL
  }, [szCabe])

  const niveis = useCallback(() => {
    const cabe = szCabe()
    return [cabe, SZ_LEGIVEL, SZ_PERTO].filter((v, i, a) => i === 0 || v > a[0] + 2)
  }, [szCabe])

  // Prende o alvo dentro do tabuleiro; no eixo em que o tabuleiro cabe na tela, fica no meio dele.
  const prender = useCallback((p, sz) => {
    const c = canvasRef.current
    const l = limites()
    const eixo = (v, a, b, tela) => {
      const meio = tela / 2 / sz
      if (b - a <= meio * 2) return (a + b) / 2
      return Math.min(b - meio, Math.max(a + meio, v))
    }
    return { x: eixo(p.x, l.x0, l.x1, c.width), y: eixo(p.y, l.y0, l.y1, c.height) }
  }, [canvasRef, limites])

  /** Chamado a cada quadro, antes de desenhar. foco = { row, col } de quem está agindo. */
  const tick = useCallback((foco) => {
    const c = canvasRef.current
    if (!c || !c.width) return
    const k = cam.current
    if (k.sz == null) k.sz = szInicial()
    if (k.modo === 'seguir' && foco) k.alvo = centroMundo(foco.row, foco.col)
    if (!k.alvo) { const l = limites(); k.alvo = { x: (l.x0 + l.x1) / 2, y: (l.y0 + l.y1) / 2 } }
    k.alvo = prender(k.alvo, k.sz)
    if (!k.atual) k.atual = { ...k.alvo }
    k.atual.x += (k.alvo.x - k.atual.x) * SUAVE
    k.atual.y += (k.alvo.y - k.atual.y) * SUAVE
    sizeRef.current = k.sz
    padRef.current = { x: c.width / 2 - k.atual.x * k.sz, y: c.height / 2 - k.atual.y * k.sz }
  }, [canvasRef, szInicial, limites, prender, padRef, sizeRef])

  const seguir = useCallback(() => { cam.current.modo = 'seguir' }, [])

  const zoom = useCallback((dir) => {
    const k = cam.current
    const n = niveis()
    const i = n.findIndex(v => Math.abs(v - k.sz) < 1)
    const atual = i === -1 ? n.findIndex(v => v > k.sz) - (dir > 0 ? 1 : 0) : i
    k.sz = n[Math.max(0, Math.min(n.length - 1, atual + dir))]
  }, [niveis])

  const podeZoom = useCallback((dir) => {
    const n = niveis()
    const sz = cam.current.sz ?? szInicial()
    return dir > 0 ? sz < n[n.length - 1] - 1 : sz > n[0] + 1
  }, [niveis, szInicial])

  // Arrasto: pointerdown/move/up do canvas. Devolve true no up quando foi arrasto (não é toque).
  const inicioArrasto = useCallback((e, livre) => {
    arrasto.current = { x: e.clientX, y: e.clientY, livre, mexeu: false, base: null }
  }, [])

  const moverArrasto = useCallback((e) => {
    const a = arrasto.current
    const c = canvasRef.current
    if (!a || !a.livre || !c) return
    const dx = e.clientX - a.x, dy = e.clientY - a.y
    if (!a.mexeu && Math.hypot(dx, dy) < ARRASTO_MIN) return
    const k = cam.current
    if (!a.mexeu) { a.mexeu = true; a.base = { ...k.atual }; k.modo = 'livre' }
    const r = c.getBoundingClientRect()
    const escala = c.width / r.width / k.sz
    k.alvo = prender({ x: a.base.x - dx * escala, y: a.base.y - dy * escala }, k.sz)
    k.atual = { ...k.alvo }
  }, [canvasRef, prender])

  const fimArrasto = useCallback(() => {
    const foi = !!arrasto.current?.mexeu
    arrasto.current = null
    return foi
  }, [])

  return { tick, seguir, zoom, podeZoom, inicioArrasto, moverArrasto, fimArrasto, modo: () => cam.current.modo }
}
