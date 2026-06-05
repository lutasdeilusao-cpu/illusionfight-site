import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useJackStore } from './store/useJackStore'
import LoginGate from '../../components/LoginGate/LoginGate'
import StatusBar from './components/StatusBar'
import Monologue from './components/Monologue'
import DicaToast from './components/DicaToast'
import MainMenu from './screens/MainMenu'
import Intro from './screens/Intro'
import Vila from './screens/Vila'
import Interior from './screens/Interior'
import Inventario from './screens/Inventario'
import Dungeon from './screens/Dungeon'
import DungeonSelect from './screens/DungeonSelect'
import Descanso from './screens/Descanso'
import Dossier from './screens/Dossier'
import CasoSelect from './screens/CasoSelect'
import CasoAbertura from './screens/CasoAbertura'
import Investigacao from './screens/Investigacao'
import Interrogatorio from './screens/Interrogatorio'
import { ResultCard } from '../../components/ResultCard'
import { MONOLOGUES } from './data/monologues'
import '../../components/Puzzles/Puzzles.css'
import './JackCandy.css'

export default function JackCandy() {
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const store = useJackStore()
  const [loaded, setLoaded] = useState(false)
  const [currentSlot, setCurrentSlot] = useState(null)
  const [slotsData, setSlotsData] = useState([null, null, null])
  const [cardResultado, setCardResultado] = useState(null)

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Carrega slots do Supabase ao logar
  useEffect(() => {
    if (!user) return
    store.loadAllSlots(user.id).then(setSlotsData)
  }, [user])

  const handleStart = useCallback(async (slotNum, slotData) => {
    if (!user) return
    if (slotData) {
      // Continua save existente
      const state = {
        cervejas: slotData.cervejas ?? 0, cervejasPorSegundo: slotData.cervejas_por_segundo ?? 1,
        cervejasTotais: slotData.cervejas_totais ?? 0, fragmentos: slotData.fragmentos ?? 0,
        notas: slotData.notas ?? 0, fase: slotData.fase ?? 'intro', flags: slotData.flags ?? {},
        hpAtual: slotData.hp_atual ?? 20, hpMax: slotData.hp_max ?? 20,
        nivel: slotData.nivel ?? 1, xp: slotData.xp ?? 0,
        inventario: slotData.inventario ?? [], equipado: slotData.equipado ?? { arma: null, armadura: null, acessorio: null },
        dungeonsCompletas: slotData.dungeons_completas ?? [],
        tempoJogo: slotData.tempo_jogo ?? 0, titleDone: slotData.title_done ?? false,
        cidadeAtual: slotData.cidade_atual ?? 'marelia', periodo: slotData.periodo ?? 'DIA',
        medidorPrimordial: slotData.medidor_primordial ?? 0, aliadoAtual: null,
        casoAtivo: slotData.caso_ativo ?? null, pistasColetadas: slotData.pistas_coletadas ?? [],
        suspeitos: slotData.suspeitos ?? [], locaisVisitados: slotData.locais_visitados ?? [],
        acusacoesErradas: slotData.acusacoes_erradas ?? 0, casosResolvidos: slotData.casos_resolvidos ?? [],
        _userId: user.id, _slot: slotNum,
      }
      if (state.fase?.startsWith('dungeon_') || state.fase === 'dungeon_select' || state.fase?.startsWith('interior_')) {
        state.fase = 'vila'
      }
      useJackStore.setState(state)
    } else {
      // Novo jogo
      useJackStore.setState({
        cervejas: 0, cervejasPorSegundo: 1, cervejasTotais: 0, fragmentos: 0, notas: 0,
        hpAtual: 20, hpMax: 20, nivel: 1, xp: 0,
        fase: 'intro', flags: {}, dungeonsCompletas: [],
        inventario: [], equipado: { arma: null, armadura: null, acessorio: null },
        tempoJogo: 0, titleDone: false, monologoAtual: null,
        cidadeAtual: 'marelia', periodo: 'DIA', medidorPrimordial: 0, aliadoAtual: null,
        casoAtivo: null, pistasColetadas: [], suspeitos: [], locaisVisitados: [],
        acusacoesErradas: 0, casosResolvidos: [],
        _userId: user.id, _slot: slotNum,
      })
    }
    setCurrentSlot(slotNum)
    setLoaded(true)
  }, [user])

  const handleDeleteSlot = useCallback(async (slotNum) => {
    if (!user) return
    await store.deleteSlot(user.id, slotNum)
    const updated = await store.loadAllSlots(user.id)
    setSlotsData(updated)
  }, [user, store])

  // Intervals — rodam sempre com usuário logado e slot ativo
  useEffect(() => {
    if (!currentSlot || !user) return
    const t1 = setInterval(() => {
      const s = useJackStore.getState()
      if (s._slot) s.tick()
    }, 1000)
    const t2 = setInterval(() => {
      const s = useJackStore.getState()
      if (s._slot) s.regenHp()
    }, 10000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [currentSlot, user])

  // Auto-unlock flags
  useEffect(() => {
    if (!store.flags) return
    const dc = store.dungeonsCompletas || []
    if (dc.includes('onibus') && !store.flags.NOTAS_LIBERADO) store.setFlag('NOTAS_LIBERADO')
    if (dc.includes('rua') && !store.flags.NINA_LIBERADO) store.setFlag('NINA_LIBERADO')
    if (dc.includes('onibus') && dc.includes('rua')) {
      if (!store.flags.KIM_LIBERADO) store.setFlag('KIM_LIBERADO')
      if (!store.flags.OSVALDO_LIBERADO) store.setFlag('OSVALDO_LIBERADO')
      if (!store.flags.RISCA_FACA_LIBERADO) store.setFlag('RISCA_FACA_LIBERADO')
      if (!store.flags.CORTICO_LIBERADO) store.setFlag('CORTICO_LIBERADO')
    }
    if (dc.includes('onibus') && dc.includes('rua')) {
      if (store.nivel >= 8 && store.flags.TERMINAL_OUVIU && !store.flags.AURANIS_LIBERADO) {
        store.setFlag('AURANIS_LIBERADO')
      }
    }
    if (store.flags.KRONOS_VIU && store.flags.DOCA_COMPLETA && store.nivel >= 15 && !store.flags.KARNAZAR_LIBERADO) {
      store.setFlag('KARNAZAR_LIBERADO')
    }
    if (store.flags.TIRA_CONFIA && store.flags.ESCURO_VISITADO && !store.flags.ILHA_PRIVADA_LIBERADA) {
      store.setFlag('ILHA_PRIVADA_LIBERADA')
    }
  }, [store.dungeonsCompletas, store.flags, store.nivel])

  useEffect(() => {
    if (store.flags.TEM_BENGALA && store.fase === 'intro') store.setFase('vila')
    if (store.fase === 'vila' && store.flags.TEM_BENGALA && !store.flags.JA_VIU_VILA) {
      store.setMonologo(MONOLOGUES.entra_vila)
      store.setFlag('JA_VIU_VILA')
    }
    if (store.fragmentos > 0 && !store.flags.JA_VIU_FRAGMENTOS) store.setFlag('JA_VIU_FRAGMENTOS')
  }, [store.flags.TEM_BENGALA, store.fase, store.flags.JA_VIU_VILA, store.fragmentos])

  // LoginGate obrigatório
  if (!user) {
    return (
      <div className="jack-body">
        <div className="jack-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <LoginGate feature="Jack Dream Beer" />
        </div>
      </div>
    )
  }

  // Main Menu
  if (!currentSlot) {
    return (
      <div className="jack-body">
        <div className="jack-content">
          <MainMenu slotsData={slotsData} onStart={handleStart} onDeleteSlot={handleDeleteSlot} />
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="jack-body">
        <div className="jack-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p className="jack-text jack-text--dim">carregando...</p>
        </div>
      </div>
    )
  }

  const fase = store.fase || 'intro'
  const isDungeon = fase?.startsWith('dungeon_') && fase !== 'dungeon_select'
  const isInterior = fase?.startsWith('interior_')
  const npcId = isInterior ? fase.replace('interior_', '') : null
  const dungeonId = isDungeon ? fase.replace('dungeon_', '') : null

  return (
    <div className="jack-body">
      <StatusBar />
      <div className="jack-content" style={{ paddingTop: isDungeon ? '4rem' : '6rem' }}>
        {fase === 'intro' && <Intro />}
        {fase === 'vila' && <Vila />}
        {fase === 'descanso' && <Descanso />}
        {fase === 'inventario' && <Inventario />}
        {fase === 'dungeon_select' && <DungeonSelect />}
        {isInterior && <Interior npcId={npcId} />}
        {isDungeon && <Dungeon key={store._autoRun} dungeonId={dungeonId} />}
        {fase === 'dossier' && <Dossier />}
        {fase === 'caso_select' && <CasoSelect />}
        {fase === 'caso_abertura' && <CasoAbertura />}
        {fase?.startsWith('investigar_') && <Investigacao localId={fase.replace('investigar_', '')} />}
        {fase === 'interrogatorio' && <Interrogatorio />}
      </div>
      <DicaToast />
      <Monologue text={store.monologoAtual} onClose={store.limparMonologo} />
      <ResultCard
        open={!!store._resultCard}
        onClose={() => store.hideResultCard()}
        game="jack"
        title={store._resultCard?.title || ''}
        subtitle={store._resultCard?.subtitle || ''}
        context={store._resultCard?.context || 'default'}
        stats={store._resultCard?.stats || []}
      />
    </div>
  )
}
