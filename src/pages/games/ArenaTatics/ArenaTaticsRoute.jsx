import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useReader } from '../../../context/ReaderContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useArenaTaticsStore } from './store/useArenaTaticsStore'
import { supabase } from '../../../lib/supabase'
import { ROSTER } from './data/roster'
import { TODAS_IAS } from './data/aiPersonalities'
import { TATICS_VERSION } from '../../../config/version'

import Intro from './screens/Intro'
import TeamSelect from './screens/TeamSelect'
import Batalha from './screens/Batalha'
import Vitoria from './screens/Vitoria'
import Derrota from './screens/Derrota'
import SimulacaoAuto from './screens/SimulacaoAuto'
import BatalhaSimulacao from './screens/BatalhaSimulacao'
import CityOverworld from './screens/CityOverworld'
import BuildingInterior from './screens/BuildingInterior'
import { useCityStore } from './store/useCityStore'

import './ArenaTatics.css'

console.log(`[TATICS] versÃ£o carregada: ${TATICS_VERSION}`)

function randomPick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n).map(item => item.id)
}

export default function ArenaTaticsRoute() {
  const { user, perfil, carregando: authCarregando } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaTaticsStore()
  const [fase, setFase] = useState('intro')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const [simConfig, setSimConfig] = useState(null)
  const [interiorInfo, setInteriorInfo] = useState({ mapId: null, name: '', spawnX: null, spawnY: null })
  const [citySpawn, setCitySpawn] = useState(null)
  const [currentDistrict, setCurrentDistrict] = useState('central')
  const [visitedDistricts, setVisitedDistricts] = useState(['central'])
  const cityStore = useCityStore()

  // Door positions for each building (used for spawn on exit)
  const BUILDING_DOORS = {
    yohualticit: { x: (18 + Math.floor(8/2) - 1 + 1) * 32, y: (4 + 7) * 32 },
    jao:         { x: (8  + Math.floor(6/2) - 1 + 1) * 32, y: (14 + 4) * 32 },
    recovery:    { x: (38 + Math.floor(5/2) - 1 + 1) * 32, y: (14 + 4) * 32 },
    bar:         { x: (30 + Math.floor(5/2) - 1 + 1) * 32, y: (20 + 4) * 32 },
    training:    { x: (40 + Math.floor(5/2) - 1 + 1) * 32, y: (22 + 4) * 32 },
    fashion:     { x: (10 + Math.floor(5/2) - 1 + 1) * 32, y: (22 + 4) * 32 },
    save:        { x: (26 + Math.floor(4/2) - 1 + 1) * 32, y: (12 + 3) * 32 },
    casa:        { x: (4  + Math.floor(4/2) - 1 + 1) * 32, y: (24 + 3) * 32 },
    info:        { x: (14 + Math.floor(4/2) - 1 + 1) * 32, y: (4 + 3) * 32 },
    equipment_shop: { x: (42 + Math.floor(5/2) - 1 + 1) * 32, y: (4 + 4) * 32 },
    biblioteca:  { x: (4 + Math.floor(5/2) - 1 + 1) * 32, y: (16 + 4) * 32 },
    arena_sub:   { x: (34 + Math.floor(7/2) - 1 + 1) * 32, y: (20 + 5) * 32 },
    concessionaria: { x: (2 + Math.floor(6/2) - 1 + 1) * 32, y: (10 + 4) * 32 },
  }

  const isAdmin = perfil?.is_admin === true || perfil?.role === 'admin'

  // â”€â”€ Route protection: only admins can access â”€â”€
  useEffect(() => {
    if (!authCarregando && (!user || perfil?.is_admin !== true)) {
      navigate('/games')
    }
  }, [user, perfil, authCarregando, navigate])

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
      // Se ainda nÃ£o tem user, falha
      if (!user) {
        console.log('[TATICS] UsuÃ¡rio nÃ£o autenticado apÃ³s espera')
        setLoading(false)
        setErro('FaÃ§a login para acessar o sistema')
        return
      }
    }

    if (!user) {
      console.log('[TATICS] handleIntroEnter: user Ã© null â€” abortando')
      setErro('FaÃ§a login para acessar o sistema')
      return
    }

    console.log('[TATICS] handleIntroEnter: user logado, perfil=', perfil, 'isAdmin=', isAdmin)
    setLoading(true)

    try {
      let ids = store.personagensIds
      console.log('[TATICS] personagensIds do save:', ids)

      // Todos vÃ£o para a cidade â€” inclusive admins
      if (!ids || ids.length === 0) {
        console.log('[TATICS] Sem personagens salvos â€” randomizando 2')
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
          setErro(t('tatics.erro_save') + ' ' + upsertError.message)
          return
        }
      }

      console.log('[TATICS] Iniciando exploraÃ§Ã£o da cidade de MarÃ©lia')
      setCurrentDistrict('central')
      setCitySpawn(null)
      setFase('city')
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

  const handleEnterBuilding = (mapId, name) => {
    console.log(`[TATICS] Entrando em: ${name} (${mapId})`)
    const door = BUILDING_DOORS[mapId]
    setInteriorInfo({ mapId, name, spawnX: door?.x || null, spawnY: door?.y || null })
    setFase('interior')
  }

  const handleExitBuilding = (exitMapId) => {
    const door = BUILDING_DOORS[exitMapId]
    console.log(`[TATICS] Saindo de ${exitMapId}, spawn na porta:`, door)
    setCitySpawn(door ? { x: door.x, y: door.y } : null)
    setInteriorInfo({ mapId: null, name: '', spawnX: null, spawnY: null })
    setFase('city')
  }

  const handleDistrictTransition = (toDistrict, spawn) => {
    console.log(`[TATICS] TransiÃ§Ã£o de distrito: ${currentDistrict} â†’ ${toDistrict}`)
    setCurrentDistrict(toDistrict)
    setCitySpawn(spawn)
    setVisitedDistricts(prev => prev.includes(toDistrict) ? prev : [...prev, toDistrict])
    cityStore.enterDistrict(toDistrict)
    cityStore.advanceTime(30) // avanÃ§ar 30 min ao trocar de distrito
  }

  const handleBackToMenu = () => {
    setFase('intro')
  }

  // â”€â”€ Shift+D hotkey: bypass city, go straight to battle (test/admin only) â”€â”€
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        console.log('[TATICS] Shift+D detectado â€” bypassando cidade, indo direto para batalha')
        e.preventDefault()

        const st = useArenaTaticsStore.getState()
        let ids = st.personagensIds
        if (!ids || ids.length === 0) {
          ids = randomPick(ROSTER, 2)
          st.setPersonagensIds(ids)
        }

        st.iniciarBatalha(ids)
        setFase('combate')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // TESTE: simulaÃ§Ã£o direta sem login
  const handleTesteSim = () => {
    console.log('[TATICS] INICIANDO TESTE SIMULAÃ‡ÃƒO DIRETA')
    const shuffled = [...TODAS_IAS].sort(() => Math.random() - 0.5)
    setSimConfig({ numChars: 3, numIAs: 2, ias: shuffled.slice(0, 2), speed: 1500 })
    setFase('batalhaSim')
  }

  return (
    <div className="tatics-container">
      {fase === 'intro' && <Intro onEnter={handleIntroEnter} onSimulacao={handleSimulacao} onTesteSim={handleTesteSim} />}
      {fase === 'city' && <CityOverworld districtId={currentDistrict} onEnterBuilding={handleEnterBuilding} onDistrictTransition={handleDistrictTransition} onBackToMenu={handleBackToMenu} spawnPoint={citySpawn} />}
      {fase === 'interior' && <BuildingInterior mapId={interiorInfo.mapId} buildingName={interiorInfo.name} onExit={handleExitBuilding} />}
      {fase === 'teamSelect' && <TeamSelect isAdmin={isAdmin} onConfirm={handleTeamConfirm} maxSlots={store.maxSlots} />}
      {fase === 'combate' && <Batalha onVitoria={handleVitoria} onDerrota={handleDerrota} />}
      {fase === 'simulacao' && <SimulacaoAuto onIniciar={handleIniciarSimulacao} />}
      {fase === 'batalhaSim' && <BatalhaSimulacao config={simConfig} onFim={handleFimSimulacao} />}
      {fase === 'vitoria' && <Vitoria sdrGanho={10} vitorias={store.vitorias} streak={store.streak} onContinuar={handleRevanche} />}
      {fase === 'derrota' && <Derrota onRevanche={handleRevanche} onSair={handleSair} />}
      {loading && (
        <div className="tatics-loading-overlay">
          {t('tatics.loading')}
        </div>
      )}
      {erro && fase === 'intro' && (
        <div className="tatics-error-overlay">
          <div className="tatics-error-box">
            âš ï¸ {erro}
          </div>
          <button onClick={() => setErro(null)} className="tatics-intro-btn tatics-error-btn">
            {t('tatics.voltar')}
          </button>
        </div>
      )}
    </div>
  )
}
