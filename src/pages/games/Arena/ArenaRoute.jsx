import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useArenaStore } from './store/useArenaStore'
import ArenaLobby from './ArenaLobby'
import ArenaCreate from './ArenaCreate'
import ArenaCombat from './ArenaCombat'
import ArenaVictory from './ArenaVictory'
import GuestNotice from '../../../components/GuestNotice/GuestNotice'
import './Arena.css'

import { ARENA_VERSION } from '../../../config/version'
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)

export default function ArenaRoute() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaStore()
  const [fase, setFase] = useState('lobby')
  const [createVisited, setCreateVisited] = useState(false)
  const [creationParty, setCreationParty] = useState([])

  useEffect(() => {
    if (user) store.setUserId(user.id)
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  return (
    <div className="arena-page">
      <GuestNotice />
      {fase === 'lobby' && <ArenaLobby onNavigate={setFase} />}
      {fase === 'create' && (
        <ArenaCreate
          onNavigate={setFase}
          skipIntro={createVisited}
          onFirstVisit={() => setCreateVisited(true)}
          creationNumber={creationParty.length + (store.roster.length === 1 ? 2 : 1)}
          blockedPaths={(creationParty.length ? creationParty : store.roster.length === 1 ? store.roster : []).map(member => member.combat_path)}
          onCreated={(member) => {
            const base = creationParty.length ? creationParty : store.roster.length === 1 ? store.roster : []
            const next = [...base, member]
            if (store.roster.length === 0 && next.length < 2) {
              setCreationParty(next)
              store.newSheet()
            } else {
              if (next.length === 2) store.setActiveParty(next)
              setCreationParty([])
              setFase('lobby')
            }
          }}
        />
      )}
      {fase === 'combat' && <ArenaCombat onNavigate={setFase} />}
      {fase === 'victory' && <ArenaVictory onNavigate={setFase} />}
    </div>
  )
}
