import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'
import ArenaLobby from './ArenaLobby'
import ArenaCreate from './ArenaCreate'
import ArenaCombat from './ArenaCombat'
import ArenaVictory from './ArenaVictory'
import './Arena.css'

const ARENA_VERSION = '1.1.1'
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)

export default function ArenaRoute() {
  const { user } = useAuth()
  const store = useArenaStore()
  const [fase, setFase] = useState('lobby')

  useEffect(() => {
    if (user) store.setUserId(user.id)
  }, [user])

  return (
    <div className="arena-page">
      {fase === 'lobby' && <ArenaLobby onNavigate={setFase} />}
      {fase === 'create' && <ArenaCreate onNavigate={setFase} />}
      {fase === 'combat' && <ArenaCombat onNavigate={setFase} />}
      {fase === 'victory' && <ArenaVictory onNavigate={setFase} />}
    </div>
  )
}
