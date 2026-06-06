import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useArenaTaticsStore } from './store/useArenaTaticsStore'
import { supabase } from '../../lib/supabase'
import { ROSTER } from './data/roster'
import { TATICS_VERSION } from '../../config/version'

import Intro from './screens/Intro'
import TeamSelect from './screens/TeamSelect'
import Batalha from './screens/Batalha'
import Vitoria from './screens/Vitoria'
import Derrota from './screens/Derrota'

import './ArenaTatics.css'

console.log(`[TATICS] versão carregada: ${TATICS_VERSION}`)

function randomPick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n).map(item => item.id)
}

export default function ArenaTaticsRoute() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaTaticsStore()
  const [fase, setFase] = useState('intro')
  const [loading, setLoading] = useState(false)

  const isAdmin = perfil?.is_admin === true || perfil?.role === 'admin'

  useEffect(() => {
    if (user) { store.setUserId(user.id); store.loadSave(user.id) }
  }, [user])

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const handleIntroEnter = async () => {
    if (!user) return
    setLoading(true)

    let ids = store.personagensIds

    if (!ids || ids.length === 0) {
      if (isAdmin) {
        // Admin vai para tela de seleção
        setLoading(false)
        setFase('teamSelect')
        return
      }
      // Usuário normal: randomiza 2
      ids = randomPick(ROSTER, 2)
      store.setPersonagensIds(ids)
      await supabase.from('arena_tatica_saves').upsert({
        user_id: user.id,
        personagens_ids: ids,
        sdr: 0, xp: 0, nivel: 1, vitorias: 0, derrotas: 0,
      }, { onConflict: 'user_id' })
    }

    store.iniciarBatalha(ids)
    setFase('combate')
    setLoading(false)
  }

  const handleTeamConfirm = async (selectedIds) => {
    setLoading(true)
    const ids = selectedIds.length > 0 ? selectedIds : randomPick(ROSTER, 2)
    store.setPersonagensIds(ids)
    await supabase.from('arena_tatica_saves').upsert({
      user_id: user.id,
      personagens_ids: ids,
      sdr: 0, xp: 0, nivel: 1, vitorias: 0, derrotas: 0,
    }, { onConflict: 'user_id' })
    store.iniciarBatalha(ids)
    setFase('combate')
    setLoading(false)
  }

  const handleVitoria = (sdrGanho) => {
    store.registrarVitoria(sdrGanho)
    store.saveToCloud(user?.id)
    setFase('vitoria')
  }

  const handleDerrota = () => {
    store.registrarDerrota()
    store.saveToCloud(user?.id)
    setFase('derrota')
  }

  const handleRevanche = () => {
    store.iniciarBatalha(store.personagensIds)
    setFase('combate')
  }

  const handleSair = () => navigate('/games')

  if (!user) {
    return (
      <div className="tatics-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#08080C', color: '#4F5359', fontFamily: 'Rajdhani', fontSize: '1rem', padding: '2rem', textAlign: 'center' }}>
        <div>
          <div style={{ color: '#00B4D8', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>LDI TATICS</div>
          <div>Faça login para jogar.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="tatics-container">
      {fase === 'intro' && <Intro onEnter={handleIntroEnter} />}
      {fase === 'teamSelect' && <TeamSelect isAdmin={isAdmin} onConfirm={handleTeamConfirm} />}
      {fase === 'combate' && <Batalha onVitoria={handleVitoria} onDerrota={handleDerrota} />}
      {fase === 'vitoria' && <Vitoria sdrGanho={10} vitorias={store.vitorias} streak={store.streak} onContinuar={handleRevanche} />}
      {fase === 'derrota' && <Derrota onRevanche={handleRevanche} onSair={handleSair} />}
      {loading && (
        <div className="tatics-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#08080C', color: '#00B4D8', fontFamily: 'Rajdhani', fontSize: '0.8rem', letterSpacing: '0.15em' }}>
          CARREGANDO SISTEMA...
        </div>
      )}
    </div>
  )
}
