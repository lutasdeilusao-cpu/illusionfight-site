import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useGanguesStore } from './store/useGanguesStore'
import GanguesLobby from './GanguesLobby'
import GanguesCreate from './GanguesCreate'
import GanguesCombat from './GanguesCombat'
import GanguesVictory from './GanguesVictory'
import GuestNotice from '../../../components/GuestNotice/GuestNotice'
import './Gangues.css'

import { GANGUES_VERSION } from '../../../config/version'
console.log(`[GANGUES] versão carregada: ${GANGUES_VERSION}`)

export default function GanguesRoute() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useGanguesStore()
  const [fase, setFase] = useState('lobby')
  const [creationParty, setCreationParty] = useState([])

  useEffect(() => {
    if (user) store.setUserId(user.id)
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  return (
    <div className="gang-page">
      <GuestNotice />
      {fase === 'lobby' && <GanguesLobby onNavigate={setFase} />}
      {fase === 'create' && (
        <GanguesCreate
          onNavigate={setFase}
          skipIntro
          creationNumber={creationParty.length ? creationParty.length + 1 : store.roster.length === 1 ? 2 : 1}
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
      {fase === 'combat' && <GanguesCombat onNavigate={setFase} />}
      {fase === 'victory' && <GanguesVictory onNavigate={setFase} />}
    </div>
  )
}
