import { useEffect, useState } from 'react'
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
import Descanso from './screens/Descanso'
import DungeonSelect from './screens/DungeonSelect'
import { MONOLOGUES } from './data/monologues'
import './JackCandy.css'

export default function JackCandy() {
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const store = useJackStore()
  const [loaded, setLoaded] = useState(false)
  const [currentSlot, setCurrentSlot] = useState(null)

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Sempre mostra MainMenu no mount (F5 = volta pro menu)
  // O slot é definido quando o usuário escolhe no menu

  useEffect(() => {
    if (!user || !currentSlot) return
    store.loadFromCloud(user.id).then(() => {
      useJackStore.setState({ _userId: user.id })
      setLoaded(true)
    })
  }, [user, currentSlot])

  useEffect(() => {
    if (store.flags.TEM_BENGALA && store.fase === 'intro') {
      store.setFase('vila')
    }
  }, [store.flags.TEM_BENGALA, store.fase])

  useEffect(() => {
    if (store.fase === 'vila' && store.flags.TEM_BENGALA && !store.flags.JA_VIU_VILA) {
      store.setMonologo(MONOLOGUES.entra_vila)
      store.setFlag('JA_VIU_VILA')
    }
  }, [store.fase, store.flags.TEM_BENGALA, store.flags.JA_VIU_VILA])

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
    if (dc.includes('porto_velho') && dc.includes('doca_abandonada') && dc.includes('torre_kronos')) {
      if (store.nivel >= 8 && store.flags.TERMINAL_OUVIU && !store.flags.AURANIS_LIBERADO) {
        store.setFlag('AURANIS_LIBERADO')
        store.setMonologo(MONOLOGUES.chega_auranis)
      }
    }
    if (store.flags.KRONOS_VIU && store.flags.DOCA_COMPLETA && store.nivel >= 15 && !store.flags.KARNAZAR_LIBERADO) {
      store.setFlag('KARNAZAR_LIBERADO')
      store.setMonologo(MONOLOGUES.chega_karnazar)
    }
    if (store.flags.TIRA_CONFIA && store.flags.ESCURO_VISITADO && !store.flags.ILHA_PRIVADA_LIBERADA) {
      store.setFlag('ILHA_PRIVADA_LIBERADA')
    }
  }, [store.dungeonsCompletas, store.flags, store.nivel])

  useEffect(() => {
    if (store.fragmentos > 0 && !store.flags.JA_VIU_FRAGMENTOS) store.setFlag('JA_VIU_FRAGMENTOS')
  }, [store.fragmentos])

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
          <MainMenu onStart={(slot) => {
            setCurrentSlot(slot)
            setLoaded(true)
          }} />
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
        {isDungeon && <Dungeon dungeonId={dungeonId} />}
      </div>

      <DicaToast />
      <Monologue text={store.monologoAtual} onClose={store.limparMonologo} />
    </div>
  )
}
