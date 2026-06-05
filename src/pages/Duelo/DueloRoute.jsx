import { useState } from 'react'
import { useDueloStore } from './store/useDueloStore'
import './Duelo.css'

const DUELO_VERSION = '1.0.0'

export default function DueloRoute() {
  const store = useDueloStore()
  const [fase, setFase] = useState('menu')

  // Teste de console — verificar que o engine carrega
  console.log(`[DUELO] store loaded | LP: ${store.playerLP} | deck: ${store.playerDeck?.length} cards | hand: ${store.playerHand?.length} cards`)

  return (
    <div className="duelo-page">
      <div className="duelo-placeholder">
        <h1>⚔️ LDI DUELO</h1>
        <p>Sprint 0 — Fundação</p>
        <p style={{ fontFamily: 'Courier New', fontSize: 12, color: '#555' }}>
          Deck: {store.playerDeck?.length || 0} cartas | Mão: {store.playerHand?.length || 0} cartas | LP: {store.playerLP}
        </p>
        <p style={{ fontFamily: 'Courier New', fontSize: 10, color: '#333', marginTop: 16 }}>
          Engine pronto. Campo, batalha, IA nas próximas sprints.
        </p>
      </div>
    </div>
  )
}
