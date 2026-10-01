// A Rádio Nina como tocador ÚNICO do site (Isaias, 30/09/2026: "a Rádio Nina
// deveria estar integrada na área músicas, pra pessoa dar um play ali e começar
// a ouvir"). O motor (useRadioNina: fila, propaganda, MediaSession, retomada em
// segundo plano) roda UMA vez aqui em cima, no main.jsx; a barra/bolinha
// (RadioNina.jsx), a página /musicas e a seção de músicas da Home leem e
// comandam o mesmo tocador por useRadio().
import { createContext, useContext } from 'react'
import { useRadioNina } from './useRadioNina'

const RadioNinaCtx = createContext(null)

export function RadioNinaProvider({ children }) {
  const radio = useRadioNina()
  return <RadioNinaCtx.Provider value={radio}>{children}</RadioNinaCtx.Provider>
}

export function useRadio() {
  const radio = useContext(RadioNinaCtx)
  if (!radio) throw new Error('useRadio() fora do RadioNinaProvider')
  return radio
}
