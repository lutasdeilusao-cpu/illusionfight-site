const TAMA_VERSION = '1.1.2'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTamagoshiStore } from './store/useTamagoshiStore'
import Ovo from './screens/Ovo'
import Selecao from './screens/Selecao'
import Criatura from './screens/Criatura'
import Passeio from './screens/Passeio'
import Brincadeira from './screens/Brincadeira'
import Luto from './screens/Luto'
import './Tamagoshi.css'

export default function Tamagoshi() {
  const { user, perfil } = useAuth()
  const store = useTamagoshiStore()
  const loaded = useRef(false)

  const userTier = perfil?.role || 'free'
  const isAdmin = user?.email === 'isaiasgamedev@gmail.com' || perfil?.is_admin === true

  useEffect(() => {
    if (!loaded.current && user) {
      loaded.current = true
      store.loadFromCloud(user.id, 1)
    }
  }, [user])

  useEffect(() => {
    if (store._userId && store.criaturaId && (store.status === 'vivo' || store.status === 'critico')) {
      store.calcularDecaimento()
    }
  }, [store.criaturaId])

  useEffect(() => {
    if (!store.criaturaId || (store.status !== 'vivo' && store.status !== 'critico')) return
    const id = setInterval(() => store.tick(), 10000)
    return () => clearInterval(id)
  }, [store.criaturaId, store.status])

  const handleOvoEclodir = () => store.eclodir()

  const handleEscolher = (criaturaId) => {
    store.escolherCriatura(criaturaId)
  }

  const fase = store.fase

  return (
    <div className="tama-body">
      <div className="tama-content">
        {(!fase || fase === 'ovo') && <Ovo onEclodir={handleOvoEclodir} />}
        {fase === 'selecao' && <Selecao onEscolher={handleEscolher} userTier={userTier} />}
        {fase === 'criatura' && <Criatura isAdmin={isAdmin} />}
        {fase === 'passeio' && <Passeio />}
        {fase === 'brincadeira' && <Brincadeira />}
        {fase === 'luto' && <Luto />}
      </div>
    </div>
  )
}
