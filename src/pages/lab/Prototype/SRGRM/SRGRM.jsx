import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { setupGame, teardownGame } from './game-logic'
import { Helmet } from 'react-helmet-async'
import { useReader } from '../../../../context/ReaderContext'
import { SRGRM_VERSION } from '../../../../config/version'
import './srgrm.css'

export default function SRGRM() {
  const rootRef = useRef(null)
  const { setReaderMode } = useReader()
  const navigate = useNavigate()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    setupGame(el)
    console.log(`[SRGRM] versÃ£o carregada: ${SRGRM_VERSION}`)
    return () => teardownGame(el)
  }, [])

  return (
    <>
      <Helmet>
        <title>SRGRM 3v3 â€” Illusion Fight</title>
      </Helmet>
      <div className="prototype-header">
        <h2>SRGRM 3v3</h2>
        <button className="proto-btn proto-btn-secondary" onClick={() => navigate('/prototype')}>
          â† Voltar
        </button>
      </div>
      <div ref={rootRef} />
    </>
  )
}
