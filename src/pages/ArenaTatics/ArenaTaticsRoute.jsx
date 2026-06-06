import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useArenaTaticsStore } from './store/useArenaTaticsStore'
import { supabase } from '../../lib/supabase'
import { ROSTER } from './data/roster'
import { TODAS_IAS } from './data/aiPersonalities'
import { TATICS_VERSION } from '../../config/version'

import Intro from './screens/Intro'
import TeamSelect from './screens/TeamSelect'
import Batalha from './screens/Batalha'
import Vitoria from './screens/Vitoria'
import Derrota from './screens/Derrota'
import SimulacaoAuto from './screens/SimulacaoAuto'
import BatalhaSimulacao from './screens/BatalhaSimulacao'

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
  const [simConfig, setSimConfig] = useState(null)

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

  const handleTeamConfirm = async (selectedIds, equipMap = {}) => {
    setLoading(true)
    const ids = selectedIds.length > 0 ? selectedIds.slice(0, store.maxSlots) : randomPick(ROSTER, 2)
    store.setPersonagensIds(ids)
    store.setEquipamentoMap(equipMap)
    // Desbloqueia todos os personagens selecionados
    ids.forEach(id => store.desbloquearPersonagem(id))
    await supabase.from('arena_tatica_saves').upsert({
      user_id: user.id,
      personagens_ids: ids,
      sdr: 0, xp: 0, nivel: 1, vitorias: 0, derrotas: 0,
      equipamento_map: equipMap,
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

  const handleSimulacao = () => setFase('simulacao')

  const handleIniciarSimulacao = (config) => {
    setSimConfig(config)
    setFase('batalhaSim')
  }

  const handleFimSimulacao = () => {
    setSimConfig(null)
    setFase('intro')
  }

  // TESTE: simulação direta sem login
  const handleTesteSim = () => {
    console.log('[TATICS] INICIANDO TESTE SIMULAÇÃO DIRETA')
    const shuffled = [...TODAS_IAS].sort(() => Math.random() - 0.5)
    setSimConfig({ numChars: 3, numIAs: 2, ias: shuffled.slice(0, 2), speed: 1500 })
    setFase('batalhaSim')
  }

  return (
    <div className="tatics-container">
      {fase === 'intro' && <Intro onEnter={handleIntroEnter} onSimulacao={handleSimulacao} onTesteSim={handleTesteSim} />}
      {fase === 'teamSelect' && <TeamSelect isAdmin={isAdmin} onConfirm={handleTeamConfirm} maxSlots={store.maxSlots} />}
      {fase === 'combate' && <Batalha onVitoria={handleVitoria} onDerrota={handleDerrota} />}
      {fase === 'simulacao' && <SimulacaoAuto onIniciar={handleIniciarSimulacao} />}
      {fase === 'batalhaSim' && <BatalhaSimulacao config={simConfig} onFim={handleFimSimulacao} />}
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
