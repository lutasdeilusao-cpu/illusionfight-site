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
  const { user, perfil, carregando: authCarregando } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaTaticsStore()
  const [fase, setFase] = useState('intro')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [simConfig, setSimConfig] = useState(null)

  const isAdmin = perfil?.is_admin === true || perfil?.role === 'admin'

  useEffect(() => {
    if (user) { store.setUserId(user.id); store.loadSave(user.id) }
  }, [user])

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const handleIntroEnter = async () => {
    setErro(null)

    // Se auth ainda estiver carregando, mostra loading e tenta de novo
    if (authCarregando) {
      console.log('[TATICS] Auth ainda carregando... user=', !!user, 'carregando=', authCarregando)
      setLoading(true)
      // Aguarda um pouco e tenta novamente
      await new Promise(r => setTimeout(r, 1500))
      // Se ainda não tem user, falha
      if (!user) {
        console.log('[TATICS] Usuário não autenticado após espera')
        setLoading(false)
        setErro('Faça login para acessar o sistema')
        return
      }
    }

    if (!user) {
      console.log('[TATICS] handleIntroEnter: user é null — abortando')
      setErro('Faça login para acessar o sistema')
      return
    }

    console.log('[TATICS] handleIntroEnter: user logado, perfil=', perfil, 'isAdmin=', isAdmin)
    setLoading(true)

    try {
      let ids = store.personagensIds
      console.log('[TATICS] personagensIds do save:', ids)

      if (!ids || ids.length === 0) {
        if (isAdmin) {
          console.log('[TATICS] Admin detectado — enviando para TeamSelect')
          setLoading(false)
          setFase('teamSelect')
          return
        }
        // Usuário normal: randomiza 2
        console.log('[TATICS] Usuário normal — randomizando personagens')
        ids = randomPick(ROSTER, 2)
        store.setPersonagensIds(ids)
        const { error: upsertError } = await supabase.from('arena_tatica_saves').upsert({
          user_id: user.id,
          personagens_ids: ids,
          sdr: 0, xp: 0, nivel: 1, vitorias: 0, derrotas: 0,
        }, { onConflict: 'user_id' })
        if (upsertError) {
          console.error('[TATICS] Erro ao upsert save:', upsertError)
          setLoading(false)
          setErro('Erro ao salvar progresso: ' + upsertError.message)
          return
        }
      }

      console.log('[TATICS] Iniciando batalha com', ids.length, 'personagens')
      store.iniciarBatalha(ids)
      setFase('combate')
      setLoading(false)
    } catch (err) {
      console.error('[TATICS] Erro em handleIntroEnter:', err)
      setLoading(false)
      setErro(err.message || 'Erro ao acessar o sistema')
    }
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
      {erro && fase === 'intro' && (
        <div className="tatics-container" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,8,12,0.92)', zIndex: 9999, flexDirection: 'column', gap: 16 }}>
          <div style={{ color: '#E24B4A', fontFamily: 'Rajdhani', fontSize: '0.7rem', letterSpacing: '0.15em', textAlign: 'center', padding: 24, border: '1px solid #E24B4A', background: 'rgba(226,75,74,0.08)', borderRadius: 8, maxWidth: 400 }}>
            ⚠️ {erro}
          </div>
          <button onClick={() => setErro(null)} className="tatics-intro-btn" style={{ fontSize: '0.5rem', padding: '8px 24px' }}>
            VOLTAR
          </button>
        </div>
      )}
    </div>
  )
}
