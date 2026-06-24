import { emit } from '../../engine/eventBus'

function logAnimIds(primitivo, dados) {
  const animIds = {}
  const campos = ['moveAnimId', 'attackAnimId', 'defenseAnimId', 'skillAnimId', 'effectAnimId']
  campos.forEach(campo => {
    if (dados?.[campo] !== undefined) animIds[campo] = dados[campo]
  })
  if (Object.keys(animIds).length > 0) {
    console.log(`[ANIM][${primitivo}]`, animIds)
  }
}

let _refs = {}
export function init(refs) { _refs = refs }

export function clearHighlight() {
  if (_refs.highlightRef) {
    _refs.highlightRef.current = { move: [], attack: [], range: [] }
  }
}

function getHexLine(r1, c1, r2, c2) {
  const steps = []
  const dr = r2 - r1
  const dc = c2 - c1
  const n = Math.max(Math.abs(dr), Math.abs(dc))
  if (n === 0) return [{ row: r1, col: c1 }]
  for (let i = 0; i <= n; i++) {
    const t = i / n
    steps.push({ row: Math.round(r1 + dr * t), col: Math.round(c1 + dc * t) })
  }
  return steps
}

const primitivos = {
  ProjetilEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ProjetilEffect', { params, dados, alvo })
    logAnimIds('ProjetilEffect', dados)
    const { atacanteId, alvoId, onFinalizar } = dados
    if (!atacanteId || !alvoId || !_refs.charsRef) {
      if (onFinalizar) setTimeout(onFinalizar, 100)
      return
    }
    const chars = _refs.charsRef.current
    const atacante = chars.find(c => c.id === atacanteId)
    const personagemAlvo = chars.find(c => c.id === alvoId)
    if (!atacante || !personagemAlvo) { if (onFinalizar) setTimeout(onFinalizar, 100); return }

    const origem = atacante.posicao
    const destino = personagemAlvo.posicao
    const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
    const setTimer = _refs.setAnimTimerRef?.current || ((fn, d) => setTimeout(fn, d))
    const setProjPos = _refs.setProjectilePosRef?.current
    const setProjPath = _refs.setProjectilePathRef?.current

    if (setProjPath) setProjPath(steps)
    let stepIdx = 0
    function avancar() {
      if (stepIdx >= steps.length) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
        emit('effect:end', { canal: 'canvas' })
        if (onFinalizar) onFinalizar()
        return
      }
      const passo = steps[stepIdx]
      if (!passo || passo.row === undefined || passo.col === undefined) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
        emit('effect:end', { canal: 'canvas' })
        if (onFinalizar) onFinalizar()
        return
      }
      if (setProjPos) setProjPos({ row: passo.row, col: passo.col })
      if (setProjPath) setProjPath(prev => prev.filter((_, i) => i > 0))
      stepIdx++
      setTimer(avancar, 320)
    }
    avancar()
  },

  ImpactoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ImpactoEffect', { params, dados, alvo })
    logAnimIds('ImpactoEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    const critico = dados.critico || false
    const el = document.createElement('div')
    el.className = critico
      ? 'atb-overlay-impacto atb-overlay-impacto--critico'
      : 'atb-overlay-impacto'
    el.textContent = String(dados.valor ?? '')
    if (dados.alvoPos) {
      el.style.setProperty('--overlay-x', `${dados.alvoPos.x}px`)
      el.style.setProperty('--overlay-y', `${dados.alvoPos.y}px`)
    }
    container.appendChild(el)
    requestAnimationFrame(() => {
      el.classList.add('atb-overlay-impacto--active')
    })
    const duracao = critico ? 1300 : 1200
    setTimeout(() => {
      el.remove()
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },

  AuraEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] AuraEffect', { params, dados, alvo })
    logAnimIds('AuraEffect', dados)
    const { atacanteId, alvoId, onFinalizar } = dados
    if (!atacanteId || !_refs.charsRef || !_refs.syncCharsRef) {
      if (onFinalizar) setTimeout(onFinalizar, 50)
      return
    }
    const chars = _refs.charsRef.current
    const atacante = chars.find(c => c.id === atacanteId)
    const personagemAlvo = chars.find(c => c.id === alvoId)
    if (!atacante || !personagemAlvo) { if (onFinalizar) setTimeout(onFinalizar, 50); return }

    const origem = { ...atacante.posicao }
    const destino = personagemAlvo.posicao
    const dirRow = destino.row - origem.row
    const dirCol = destino.col - origem.col
    const meioRow = Math.round(origem.row + dirRow * 0.7)
    const meioCol = Math.round(origem.col + dirCol * 0.7)

    if (_refs.syncCharsRef) {
      _refs.syncCharsRef.current(prev =>
        prev.map(c => c.id === atacanteId ? { ...c, posicao: { row: meioRow, col: meioCol } } : c)
      )
    }
    const setTimer = _refs.setAnimTimerRef?.current || ((fn, d) => setTimeout(fn, d))
    setTimer(() => {
      if (_refs.syncCharsRef) {
        _refs.syncCharsRef.current(prev =>
          prev.map(c => c.id === atacanteId ? { ...c, posicao: origem } : c)
        )
      }
      setTimer(() => {
        emit('effect:end', { canal: 'canvas' })
        if (onFinalizar) onFinalizar()
      }, 200)
    }, 300)
  },

  TrailEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] TrailEffect', { params, dados, alvo })
    logAnimIds('TrailEffect', dados)
    if (!_refs.trailRef) return
    const { row, col } = dados
    _refs.trailRef.current = [
      ..._refs.trailRef.current,
      { row, col, alpha: 1.0 }
    ]
  },

  HighlightEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] HighlightEffect', { params, dados, alvo })
    logAnimIds('HighlightEffect', dados)
    if (!_refs.highlightRef) return
    const { tipo, cor } = params
    const cells = dados?.cells
    if (tipo === 'limpar') {
      _refs.highlightRef.current = { move: [], attack: [], range: [] }
      return
    }
    const key = tipo === 'movimento' ? 'move' : tipo === 'ataque' ? 'attack' : 'range'
    _refs.highlightRef.current = {
      ..._refs.highlightRef.current,
      [key]: cells || [],
    }
  },

  StatusEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] StatusEffect', { params, dados, alvo })
    logAnimIds('StatusEffect', dados)
  },
  TextoEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] TextoEffect', { params, dados, alvo })
    logAnimIds('TextoEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    const el = document.createElement('div')
    el.className = 'atb-overlay-texto'
    const conteudo = dados.valor !== undefined ? String(dados.valor)
      : dados.nome ? dados.nome
      : dados.texto ? dados.texto
      : ''
    el.textContent = conteudo
    if (dados.alvoPos) {
      el.style.setProperty('--overlay-x', `${dados.alvoPos.x}px`)
      el.style.setProperty('--overlay-y', `${dados.alvoPos.y}px`)
      el.classList.add('atb-overlay-texto--positioned')
    } else {
      el.classList.add('atb-overlay-texto--centered')
    }
    container.appendChild(el)
    requestAnimationFrame(() => {
      el.classList.add('atb-overlay-texto--active')
    })
    const duracao = params.duracao || 800
    setTimeout(() => {
      el.remove()
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
  FlashEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] FlashEffect', { params, dados, alvo })
    logAnimIds('FlashEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    const el = document.createElement('div')
    el.className = 'atb-overlay-flash'
    el.style.setProperty('--flash-color', params.cor || '#ff0000')
    container.appendChild(el)
    requestAnimationFrame(() => {
      el.classList.add('atb-overlay-flash--active')
    })
    const duracao = params.duracao || 400
    setTimeout(() => {
      el.remove()
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
  ShakeEffect: ({ params, dados, alvo }) => {
    console.log('[PRIMITIVO] ShakeEffect', { params, dados, alvo })
    logAnimIds('ShakeEffect', dados)
    const container = _refs.overlayContainerRef?.current
    if (!container) {
      emit('effect:end', { canal: 'overlay' })
      return
    }
    container.classList.add('atb-overlay-shake')
    const duracao = params.duracao || 500
    setTimeout(() => {
      container.classList.remove('atb-overlay-shake')
      emit('effect:end', { canal: 'overlay' })
    }, duracao)
  },
}

export function executar(primitivo, { params, dados, alvo }) {
  const fn = primitivos[primitivo]
  if (!fn) {
    console.warn('[EFFECT_RENDERER] primitivo desconhecido:', primitivo)
    return
  }
  fn({ params, dados, alvo })
}
