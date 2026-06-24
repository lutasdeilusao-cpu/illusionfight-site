import { useEffect, useRef } from 'react'
import { setupGame, teardownGame } from './game-logic'
import { Helmet } from 'react-helmet-async'
import { SRGRM_VERSION } from '../../../config/version'
import './srgrm.css'

export default function SRGRM() {
  const rootRef = useRef(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    setupGame(el)
    console.log(`[SRGRM] versão carregada: ${SRGRM_VERSION}`)
    return () => teardownGame(el)
  }, [])

  return (
    <>
      <Helmet>
        <title>SRGRM 3v3 — Illusion Fight</title>
      </Helmet>
      <div ref={rootRef} />
    </>
  )
}
