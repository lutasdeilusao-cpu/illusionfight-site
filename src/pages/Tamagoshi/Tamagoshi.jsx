const TAMA_VERSION = '1.3.1'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useTamagoshiStore } from './store/useTamagoshiStore'
import { supabase } from '../../lib/supabase'
import { calcularFase } from './data/moedas'
import Ovo from './screens/Ovo'
import Selecao from './screens/Selecao'
import Criatura from './screens/Criatura'
import Passeio from './screens/Passeio'
import Brincadeira from './screens/Brincadeira'
import Luto from './screens/Luto'
import Alimentar from './screens/Alimentar'
import Banhar from './screens/Banhar'
import Passear from './screens/Passear'
import Loja from './screens/Loja'
import Partida from './screens/Partida'
import './Tamagoshi.css'

export default function Tamagoshi() {
  const { user, perfil } = useAuth()
  const { setReaderMode } = useReader()
  const store = useTamagoshiStore()
  const loaded = useRef(false)
  const [subFase, setSubFase] = useState(null)

  const userTier = perfil?.role || 'free'
  const isAdmin = user?.email === 'isaiasgamedev@gmail.com' || perfil?.is_admin === true

  useEffect(() => {
    if (!loaded.current && user) {
      loaded.current = true
      store.setAdmin(isAdmin)
      store.loadFromCloud(user.id, 1)
    }
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

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

  useEffect(() => {
    if (store._userId && store.nascidoEm) {
      const fase = calcularFase(store.nascidoEm)
      if (fase === 'partida' && store.status !== 'partida') {
        store.executarPartida(store._userId)
      }
    }
  }, [store.nascidoEm])

  const handleOvoEclodir = () => store.eclodir()

  const handleEscolher = async (criaturaId) => {
    await store.escolherCriatura(criaturaId)
    store.verificarBadge(store._userId, 'filhote')
  }

  const handleAction = (action) => {
    if (action === 'alimentar') setSubFase('alimentar')
    else if (action === 'banhar') setSubFase('banhar')
    else if (action === 'passear') setSubFase('passear')
    else if (action === 'brincar') {
      store.brincar()
      store.ganharDix(store._userId, 10, 'brincou com criatura')
    }
  }

  const handleVoltar = () => {
    setSubFase(null)
    store.getSaldoDix(store._userId)
  }

  const handleNovaAdocao = async () => {
    store.reset()
    if (store._userId) {
      await supabase.from('tamagoshi_saves').update({
        status: 'morto', fase: 'luto',
        cooldown_ate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }).eq('user_id', store._userId).eq('slot', store._slot || 1)
    }
  }

  const fase = store.fase

  if (subFase === 'alimentar') return <div className="tama-body"><div className="tama-content"><Alimentar onConcluir={handleVoltar} /></div></div>
  if (subFase === 'banhar') return <div className="tama-body"><div className="tama-content"><Banhar onConcluir={handleVoltar} /></div></div>
  if (subFase === 'passear') return <div className="tama-body"><div className="tama-content"><Passear onConcluir={handleVoltar} /></div></div>
  if (subFase === 'loja') return <div className="tama-body"><div className="tama-content"><Loja onVoltar={handleVoltar} /></div></div>

  return (
    <div className="tama-body">
      <div className="tama-content">
        {fase === 'partida' && <Partida onSalaoFama={() => window.location.href = '/perfil?aba=tamagoshi'} onNovaAdocao={handleNovaAdocao} />}
        {(!fase || fase === 'ovo') && <Ovo onEclodir={handleOvoEclodir} />}
        {fase === 'selecao' && <Selecao onEscolher={handleEscolher} userTier={userTier} />}
        {fase === 'criatura' && <Criatura isAdmin={isAdmin} onAction={handleAction} onLoja={() => setSubFase('loja')} />}
        {fase === 'passeio' && <Passeio />}
        {fase === 'brincadeira' && <Brincadeira />}
        {fase === 'luto' && <Luto />}
      </div>
    </div>
  )
}
