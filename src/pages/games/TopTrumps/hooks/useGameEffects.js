import { useState, useEffect, useRef, useCallback } from 'react'
import { sfx } from '../../../../lib/sfx'

const ONOMATOPEIAS = [
  'KABOOM!', 'POW!', 'CRASH!', 'BOOM!', 'WHAM!',
  'BLAM!', 'KRAK!', 'SMASH!', 'BANG!', 'ZAP!',
  'KABLAM!', 'THWACK!', 'CRUNCH!', 'SLAM!', 'KAPOW!',
  'WHACK!', 'BAM!', 'CLANG!', 'KRAKOOM!', 'SWISH!'
]

export function useGameEffects({ fase, confirmandoAtributo }) {
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
  const [particulas, setParticulas] = useState([])
  const [cortinaAtiva, setCortinaAtiva] = useState(false)
  const [onomaTexto, setOnomaTexto] = useState('KABOOM!')
  const faseRef = useRef(fase)
  const confirmRef = useRef(confirmandoAtributo)
  faseRef.current = fase
  confirmRef.current = confirmandoAtributo

  function toggleSom() {
    const novo = sfx.toggle()
    setSomAtivo(novo)
  }

  function sortearOnomatopeia() {
    const idx = Math.floor(Math.random() * ONOMATOPEIAS.length)
    setOnomaTexto(ONOMATOPEIAS[idx])
  }

  function gerarParticulas(tipo) {
    const qtd = tipo === 'empate' ? 20 : 35
    const variantes = ['a','b','c','d','e','f']
    const nova = []
    for (let i = 0; i < qtd; i++) {
      nova.push({
        id: Date.now() + i,
        variante: variantes[i % variantes.length],
        tipo
      })
    }
    setParticulas(nova)
    setTimeout(() => setParticulas([]), 1800)
  }

  const iniciarEfeitosRevelacao = useCallback((resultado, callbacks) => {
    sfx.cardFlip()
    setTimeout(() => {
      sortearOnomatopeia()
      sfx.vs()
      sfx.startHeartbeatLoop()
      setCortinaAtiva(true)
    }, 600)
    setTimeout(() => {
      sfx.stopHeartbeatLoop()
      setCortinaAtiva(false)
      if (resultado === 'ganhou') sfx.win()
      else if (resultado === 'perdeu') sfx.lose()
      else sfx.draw()
      gerarParticulas(resultado)
      callbacks?.onReveal?.()
    }, 1800)
  }, [])

  useEffect(() => {
    if (faseRef.current === 'jogando' && !confirmRef.current) {
      sfx.startHeartbeatLoop()
    } else {
      sfx.stopHeartbeatLoop()
    }
    return () => sfx.stopHeartbeatLoop()
  }, [])

  return { somAtivo, toggleSom, particulas, cortinaAtiva, onomaTexto, iniciarEfeitosRevelacao }
}
