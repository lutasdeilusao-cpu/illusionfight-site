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
  ProjetilEffect: (params) => {
    console.log('[PRIMITIVO] ProjetilEffect', params)
    const { atacanteId, alvoId, onFinalizar } = params
    if (!atacanteId || !alvoId || !_refs.charsRef) {
      if (onFinalizar) setTimeout(onFinalizar, 100)
      return
    }
    const chars = _refs.charsRef.current
    const atacante = chars.find(c => c.id === atacanteId)
    const alvo = chars.find(c => c.id === alvoId)
    if (!atacante || !alvo) { if (onFinalizar) setTimeout(onFinalizar, 100); return }

    const origem = atacante.posicao
    const destino = alvo.posicao
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
        if (onFinalizar) onFinalizar()
        return
      }
      const passo = steps[stepIdx]
      if (!passo || passo.row === undefined || passo.col === undefined) {
        if (setProjPos) setProjPos(null)
        if (setProjPath) setProjPath([])
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

  ImpactoEffect: (params) => console.log('[PRIMITIVO] ImpactoEffect', params),

  AuraEffect: (params) => {
    console.log('[PRIMITIVO] AuraEffect', params)
    const { atacanteId, alvoId, onFinalizar } = params
    if (!atacanteId || !_refs.charsRef || !_refs.syncCharsRef) {
      if (onFinalizar) setTimeout(onFinalizar, 50)
      return
    }
    const chars = _refs.charsRef.current
    const atacante = chars.find(c => c.id === atacanteId)
    const alvo = _refs.charsRef.current.find(c => c.id === alvoId)
    if (!atacante || !alvo) { if (onFinalizar) setTimeout(onFinalizar, 50); return }

    const origem = { ...atacante.posicao }
    const destino = alvo.posicao
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
        if (onFinalizar) onFinalizar()
      }, 200)
    }, 300)
  },

  TrailEffect: (params) => {
    console.log('[PRIMITIVO] TrailEffect', params)
    if (!_refs.trailRef) return
    const { row, col } = params
    _refs.trailRef.current = [
      ..._refs.trailRef.current,
      { row, col, alpha: 1.0 }
    ]
  },

  HighlightEffect: (params) => {
    console.log('[PRIMITIVO] HighlightEffect', params)
    if (!_refs.highlightRef) return
    const { tipo, cells, cor } = params
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

  StatusEffect: (params) => console.log('[PRIMITIVO] StatusEffect', params),
  TextoEffect: (params) => console.log('[PRIMITIVO] TextoEffect', params),
  FlashEffect: (params) => console.log('[PRIMITIVO] FlashEffect', params),
  ShakeEffect: (params) => console.log('[PRIMITIVO] ShakeEffect', params),
}

export function executar(primitivo, params) {
  const fn = primitivos[primitivo]
  if (!fn) {
    console.warn('[EFFECT_RENDERER] primitivo desconhecido:', primitivo)
    return
  }
  fn(params)
}
