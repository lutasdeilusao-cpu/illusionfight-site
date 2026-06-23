import { useState, useRef, useCallback } from 'react'
import { EFFECTS_MAP } from '../components/effects/effectsMap'
import { executar as executarRenderer } from '../components/effects/EffectRenderer'

const ESTADO_IDLE = 'IDLE'
const ESTADO_EXECUTANDO = 'EXECUTANDO'
const ESTADO_AGUARDANDO = 'AGUARDANDO'
const ESTADO_BLOQUEADO = 'BLOQUEADO'

const canaisPadrao = {
  canvas: { estado: ESTADO_IDLE, fila: [], ativo: null },
  overlay: { estado: ESTADO_IDLE, fila: [], ativo: null },
  hud: { estado: ESTADO_IDLE, fila: [], ativo: null },
}

export default function useEffectMachine() {
  const canaisRef = useRef({
    canvas: { ...canaisPadrao.canvas },
    overlay: { ...canaisPadrao.overlay },
    hud: { ...canaisPadrao.hud },
  })
  const [, forceUpdate] = useState(0)

  function finalizarEfeito(canal) {
    const c = canaisRef.current[canal]
    if (c.ativo) {
      console.log('[EFFECT][' + canal + '] encerrado:', c.ativo.tipo)
    }
    c.ativo = null

    if (c.fila.length > 0) {
      const proximo = c.fila.shift()
      executarEfeitoInterno(canal, proximo.definicao, proximo.tipo, proximo.alvo, proximo.dados)
    } else {
      c.estado = ESTADO_IDLE
    }
    forceUpdate(n => n + 1)
  }

  function executarEfeitoInterno(canal, definicao, tipo, alvo, dados) {
    const c = canaisRef.current[canal]
    c.estado = tipo === 'vitoria' ? ESTADO_BLOQUEADO : ESTADO_EXECUTANDO
    c.ativo = { tipo, alvo, dados }

    console.log('[EFFECT][' + canal + '] iniciando:', tipo, {
      alvo,
      dados,
      primitivo: definicao.primitivo,
      params: definicao.params,
      timestamp: Date.now(),
    })

    executarRenderer(definicao.primitivo, { ...definicao.params, ...dados, alvo })

    if (definicao.tipo === 'pontual') {
      setTimeout(() => finalizarEfeito(canal), definicao.duracao)
    }
    forceUpdate(n => n + 1)
  }

  const dispatchEffect = useCallback(({ tipo, alvo, dados, caller }) => {
    const definicao = EFFECTS_MAP[tipo]
    if (!definicao) {
      console.warn('[EFFECT] tipo desconhecido:', tipo, 'caller:', caller)
      return
    }

    const canal = definicao.canal || 'overlay'
    const c = canaisRef.current[canal]

    if (canal === 'hud') {
      executarEfeitoInterno(canal, definicao, tipo, alvo, dados)
      return
    }

    if (c.estado === ESTADO_BLOQUEADO) {
      console.warn('[EFFECT] canal bloqueado por vitoria. Rejeitado:', tipo, 'caller:', caller)
      return
    }

    if (c.estado === ESTADO_IDLE) {
      executarEfeitoInterno(canal, definicao, tipo, alvo, dados)
      return
    }

    if (canal === 'overlay' && definicao.prioridade !== undefined) {
      if (c.ativo && definicao.prioridade < c.ativo.prioridade) {
        console.log('[EFFECT] descartado por prioridade:', tipo, 'caller:', caller)
        return
      }
    }

    c.fila.push({ definicao, tipo, alvo, dados, caller })
    console.log('[EFFECT][' + canal + '] enfileirado:', tipo, 'caller:', caller)
    forceUpdate(n => n + 1)
  }, [])

  const getEstadoCanal = useCallback((canal) => {
    return canaisRef.current[canal]?.estado || ESTADO_IDLE
  }, [])

  const getEfeitoAtivo = useCallback((canal) => {
    return canaisRef.current[canal]?.ativo || null
  }, [])

  const getFilaCanal = useCallback((canal) => {
    return [...(canaisRef.current[canal]?.fila || [])]
  }, [])

  return {
    dispatchEffect,
    finalizarEfeito,
    getEstadoCanal,
    getEfeitoAtivo,
    getFilaCanal,
  }
}
