import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useJackStore } from './store/useJackStore'
import LoginGate from '../../components/LoginGate/LoginGate'
import StatusBar from './components/StatusBar'
import Intro from './screens/Intro'
import Vila from './screens/Vila'
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

  // Load from cloud on mount
  useEffect(() => {
    if (!user) return
    store.loadFromCloud(user.id).then(() => setLoaded(true))
  }, [user])

  // Auto-tick capangas a cada 1s
  useEffect(() => {
    if (!user) return
    const t = setInterval(() => store.tick(), 1000)
    return () => clearInterval(t)
  }, [user])

  // Regen HP a cada 10s
  useEffect(() => {
    if (!user) return
    const t = setInterval(() => store.regenHp(), 10000)
    return () => clearInterval(t)
  }, [user])

  // Auto save to cloud a cada 30s
  useEffect(() => {
    if (!user) return
    const t = setInterval(() => store.saveToCloud(user.id), 30000)
    return () => clearInterval(t)
  }, [user])

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

  return (
    <div className="jack-body">
      <StatusBar />
      <div className="jack-content" style={{ paddingTop: '6rem' }}>
        {store.fase === 'intro' && <Intro />}
        {store.fase === 'vila' && <Vila />}
      </div>
    </div>
  )
}
