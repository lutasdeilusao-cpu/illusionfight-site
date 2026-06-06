/**
 * SHAKE PROFILES — Perfis de screen shake por elemental
 */

import { ELEMENTALS } from './elementals'

export const SHAKE_PROFILES = {
  heavy: [
    { x: -6, y: 4 }, { x: 5, y: -5 }, { x: -4, y: 3 },
    { x: 3, y: -2 }, { x: -2, y: 1 }, { x: 0, y: 0 },
  ],
  medium: [
    { x: -3, y: 2 }, { x: 3, y: -3 }, { x: -2, y: 2 },
    { x: 1, y: -1 }, { x: 0, y: 0 },
  ],
  light: [
    { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 0, y: 0 },
  ],
  drift: [
    { x: -5, y: 0 }, { x: -3, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 0 },
  ],
  pulse: [
    { scale: 1.02 }, { scale: 0.99 }, { scale: 1.01 }, { scale: 1 },
  ],
  none: [],
}

export function screenShake(perfil, elementRef) {
  if (!elementRef?.current) return
  const frames = SHAKE_PROFILES[perfil]
  if (!frames?.length) return

  let i = 0
  const interval = 60

  const tick = setInterval(() => {
    if (i >= frames.length) {
      clearInterval(tick)
      elementRef.current.style.transform = ''
      return
    }
    const f = frames[i]
    if (f.scale) {
      elementRef.current.style.transform = `scale(${f.scale})`
    } else {
      elementRef.current.style.transform = `translate(${f.x}px, ${f.y}px)`
    }
    i++
  }, interval)
}

/**
 * Flash de impacto na célula do grid
 */
export function flashCelula(celulaSelector, elemental, tipo = 'recebe') {
  const el = document.querySelector(celulaSelector)
  if (!el) return

  const elem = ELEMENTALS[elemental?.toLowerCase()] || ELEMENTALS.terra

  const cores = {
    recebe:    elem.cor,
    cura:      '#34D399',
    armadilha: '#A855F7',
  }

  const cor = cores[tipo] || elem.cor

  el.style.transition = 'none'
  el.style.background = `${cor}50`
  el.style.boxShadow  = `inset 0 0 16px ${cor}60`

  requestAnimationFrame(() => {
    el.style.transition = 'background 0.5s ease, box-shadow 0.5s ease'
    setTimeout(() => {
      el.style.background = ''
      el.style.boxShadow  = ''
    }, 50)
  })
}
