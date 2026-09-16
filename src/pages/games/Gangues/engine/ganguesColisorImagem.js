// TESTE: colisão por imagem (pedido do Isaias, 16/09/2026 — ele recortou à
// mão, no Photoshop, um "molde" da Pista apagando tudo que deveria ser
// caminho andável, deixando só os prédios/obstáculos; a ideia é usar essa
// imagem como o colisor de verdade em vez de acertar retângulo por
// retângulo). A máscara (`colisor-mask.png`, preto&branco puro, gerada a
// partir do PNG que ele recortou — branco = andável, preto = sólido) é
// desenhada UMA VEZ num canvas invisível; a partir daí, `solidoEm(x, y)`
// lê os pixels reais em vez de comparar contra uma lista de retângulos.
//
// Escopo: só cobre a faixa que o Isaias já recortou (da entrada até um
// pouco depois do muro — o resto da Pista, e todo o pós-muro pra cima,
// ainda não tem máscara). Por isso `Y1` marca onde a máscara começa a
// valer; abaixo disso, o sistema antigo de retângulos (`QUARTEIROES_PISTA`)
// continua sendo a única fonte de colisão, sem mudança nenhuma.
import { useEffect, useRef, useState } from 'react'

export const GANGUES_PISTA_COLISOR_IMAGEM_Y1 = 970

/** Carrega a máscara num canvas fora da tela e devolve uma função
 *  `solidoEm(x, y)` estável (não recria a cada render) — null enquanto a
 *  imagem não carregou (o motor trata null como "sem info, não bloqueia"). */
export function useGanguesColisorImagem(src) {
  const [pronto, setPronto] = useState(false)
  const ctxRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const solidoEmRef = useRef(() => false)

  useEffect(() => {
    if (!src) return
    let cancelado = false
    const img = new Image()
    img.onload = () => {
      if (cancelado) return
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      ctxRef.current = ctx
      sizeRef.current = { w: canvas.width, h: canvas.height }
      setPronto(true)
    }
    img.src = src
    return () => { cancelado = true }
  }, [src])

  // Raio de amostragem ~ PLAYER_RADIUS (18px, ganguesCenaMotor.js) — testa
  // um quadrado ao redor do ponto e considera sólido se QUALQUER pixel de
  // dentro do círculo desse raio não for branco puro (mesmo limiar usado
  // pra gerar a máscara: >240 nos 3 canais = andável).
  solidoEmRef.current = (x, y, raio = 16) => {
    const ctx = ctxRef.current
    try {
      if (!ctx) return false
      const { w, h } = sizeRef.current
      const x0 = Math.max(0, Math.floor(x - raio)), y0 = Math.max(0, Math.floor(y - raio))
      const x1 = Math.min(w, Math.ceil(x + raio)), y1 = Math.min(h, Math.ceil(y + raio))
      if (x1 <= x0 || y1 <= y0) return false
      const { data } = ctx.getImageData(x0, y0, x1 - x0, y1 - y0)
      const raio2 = raio * raio
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const dx = px + 0.5 - x, dy = py + 0.5 - y
          if (dx * dx + dy * dy > raio2) continue
          const i = ((py - y0) * (x1 - x0) + (px - x0)) * 4
          if (data[i] <= 240) return true // não é branco puro → sólido
        }
      }
      return false
    } catch {
      // canvas tainted/erro de leitura (não deveria acontecer, mesma origem)
      // — nunca trava o jogador por causa disso, só não bloqueia.
      return false
    }
  }

  return { pronto, solidoEm: (x, y, raio) => solidoEmRef.current(x, y, raio) }
}
