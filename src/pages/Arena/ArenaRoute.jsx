import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useArenaStore } from './store/useArenaStore'
import ArenaLobby from './ArenaLobby'
import ArenaCreate from './ArenaCreate'
import ArenaCombat from './ArenaCombat'
import ArenaVictory from './ArenaVictory'
import './Arena.css'

const ARENA_VERSION = '1.7.0'
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)

export default function ArenaRoute() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaStore()
  const [fase, setFase] = useState('lobby')
  const [createVisited, setCreateVisited] = useState(false)

  useEffect(() => {
    if (user) store.setUserId(user.id)
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  return (
    <div className="arena-page">
      {fase === 'lobby' && <ArenaLobby onNavigate={setFase} />}
      {fase === 'create' && (
        <ArenaCreate
          onNavigate={setFase}
          skipIntro={createVisited}
          onFirstVisit={() => setCreateVisited(true)}
        />
      )}
      {fase === 'combat' && <ArenaCombat onNavigate={setFase} />}
      {fase === 'victory' && <ArenaVictory onNavigate={setFase} />}
    </div>
  )
}
