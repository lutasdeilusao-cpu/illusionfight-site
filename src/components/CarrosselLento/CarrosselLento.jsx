import { useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import './CarrosselLento.css'

const PAUSA_TOQUE_MS = 8000

/* Fileira horizontal que anda sozinha, devagar, um item por vez, e volta ao
   começo quando chega no fim. Setas laterais passam pra um lado ou pro outro;
   qualquer toque, clique ou arraste pausa o avanço por alguns segundos.
   `trilhoClassName` é a classe de layout da fileira (largura e espaço dos itens). */
export default function CarrosselLento({ children, trilhoClassName = '', intervalo = 4000 }) {
  const { t } = useLanguage()
  const trilho = useRef(null)
  const pausaAte = useRef(0)
  const drag = useRef(null)
  const bloqueiaClick = useRef(false)

  const passo = () => {
    const el = trilho.current
    const item = el?.firstElementChild
    if (!item) return 0
    return item.getBoundingClientRect().width + (parseFloat(getComputedStyle(el).columnGap) || parseFloat(getComputedStyle(el).gap) || 0)
  }

  const ir = dir => {
    const el = trilho.current
    if (!el) return
    const noFim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    const noInicio = el.scrollLeft <= 4
    if (dir > 0 && noFim) el.scrollTo({ left: 0, behavior: 'smooth' })
    else if (dir < 0 && noInicio) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    else el.scrollBy({ left: dir * passo(), behavior: 'smooth' })
  }

  const pausar = () => { pausaAte.current = Date.now() + PAUSA_TOQUE_MS }
  const manual = dir => { pausar(); ir(dir) }

  const onPointerDown = e => {
    pausar()
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = trilho.current
    if (!el) return
    drag.current = { x: e.clientX, left: el.scrollLeft, moveu: false }
  }

  const onPointerMove = e => {
    const d = drag.current
    const el = trilho.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    if (!d.moveu && Math.abs(dx) > 6) {
      d.moveu = true
      bloqueiaClick.current = true
      el.classList.add('is-arrastando')
    }
    if (d.moveu) {
      e.preventDefault()
      pausar()
      el.scrollLeft = d.left - dx
    }
  }

  const fimDrag = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    trilho.current?.classList.remove('is-arrastando')
    if (d.moveu) setTimeout(() => { bloqueiaClick.current = false }, 0)
  }

  const onClickCapture = e => {
    if (!bloqueiaClick.current) return
    e.preventDefault()
    e.stopPropagation()
    bloqueiaClick.current = false
  }

  const onWheel = e => {
    pausar()
    const el = trilho.current
    if (!el || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 2) return
    if ((e.deltaY > 0 && el.scrollLeft < max - 2) || (e.deltaY < 0 && el.scrollLeft > 2)) {
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
  }

  useEffect(() => {
    if (!intervalo || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => {
      if (document.hidden || Date.now() < pausaAte.current) return
      ir(1)
    }, intervalo)
    return () => clearInterval(id)
  }, [intervalo])

  return (
    <div className="carrossel-lento">
      <button type="button" className="carrossel-lento__seta carrossel-lento__seta--esq" onClick={() => manual(-1)} aria-label={t('carrossel.anterior')}>‹</button>
      <div
        ref={trilho}
        className={`carrossel-lento__trilho ${trilhoClassName}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={fimDrag}
        onPointerCancel={fimDrag}
        onPointerLeave={fimDrag}
        onClickCapture={onClickCapture}
        onDragStart={e => e.preventDefault()}
        onWheel={onWheel}
      >
        {children}
      </div>
      <button type="button" className="carrossel-lento__seta carrossel-lento__seta--dir" onClick={() => manual(1)} aria-label={t('carrossel.proximo')}>›</button>
    </div>
  )
}
