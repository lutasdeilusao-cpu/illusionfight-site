import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useJackStore } from './store/useJackStore'
import LoginGate from '../../components/LoginGate/LoginGate'
import StatusBar from './components/StatusBar'
import Monologue from './components/Monologue'
import Intro from './screens/Intro'
import Vila from './screens/Vila'
import Interior from './screens/Interior'
import Inventario from './screens/Inventario'
import Dungeon from './screens/Dungeon'
import DungeonSelect from './screens/DungeonSelect'
import { MONOLOGUES } from './data/monologues'
import { DUNGEONS } from './data/dungeons'
import './JackCandy.css'

export default function JackCandy() {
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const store = useJackStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  useEffect(() => {
    if (!user) return
    store.loadFromCloud(user.id).then(() => {
      useJackStore.setState({ _userId: user.id })
      setLoaded(true)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    const t1 = setInterval(() => store.tick(), 1000)
    const t2 = setInterval(() => store.regenHp(), 10000)
    const t3 = setInterval(() => store.saveToCloud(user.id), 30000)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [user])

  // Safety: TEM_BENGALA sem fase vila → corrige
  useEffect(() => {
    if (store.flags.TEM_BENGALA && store.fase === 'intro') {
      store.setFase('vila')
    }
  }, [store.flags.TEM_BENGALA, store.fase])

  // Monologue ao entrar na vila
  useEffect(() => {
    if (store.fase === 'vila' && store.flags.TEM_BENGALA && !store.flags.JA_VIU_VILA) {
      store.setMonologo(MONOLOGUES.entra_vila)
      store.setFlag('JA_VIU_VILA')
    }
  }, [store.fase, store.flags.TEM_BENGALA, store.flags.JA_VIU_VILA])

  if (!user) {
    return (
      <div className="jack-body">
        <div className="jack-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <LoginGate feature="Jack Dream Candy" />
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
  console.log('[JACK] render fase:', fase, 'isDungeon:', isDungeon, 'dungeonId:', dungeonId)

  return (
    <div className="jack-body">
      <StatusBar />
      <div className="jack-content" style={{ paddingTop: isDungeon ? '4rem' : '6rem' }}>
        {fase === 'intro' && <Intro />}
        {fase === 'vila' && <Vila />}
        {fase === 'inventario' && <Inventario />}
        {fase === 'dungeon_select' && <DungeonSelect />}
        {isInterior && <Interior npcId={npcId} />}
        {isDungeon && <Dungeon dungeonId={dungeonId} />}
      </div>

      <Monologue
        text={store.monologoAtual}
        onClose={store.limparMonologo}
      />
    </div>
  )
}
