import { TAMA_VERSION } from '../../config/version'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useNavigate } from 'react-router-dom'
import BackToGamesBtn from '../../components/BackToGamesBtn/BackToGamesBtn'
import { useTamagoshiStore } from './store/useTamagoshiStore'
import { supabase } from '../../lib/supabase'
import { calcularFase } from './data/moedas'
import Termo from './screens/Termo'
import Ovo from './screens/Ovo'
import Selecao from './screens/Selecao'
import Criatura from './screens/Criatura'
import Passeio from './screens/Passeio'
import Brincadeira from './screens/Brincadeira'
import Luto from './screens/Luto'
import Alimentar from './screens/Alimentar'
import Banhar from './screens/Banhar'
import Passear from './screens/Passear'
import RestaurarSaude from './screens/RestaurarSaude'
import Loja from './screens/Loja'
import Partida from './screens/Partida'
import Gacha from './screens/Gacha'
import './Tamagoshi.css'

export default function Tamagoshi() {
  const { user, perfil, horasDesdeUltimaSessao } = useAuth()
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const store = useTamagoshiStore()
  const lastUserId = useRef(undefined)
  const [subFase, setSubFase] = useState(null)
  const [mostrarTermo, setMostrarTermo] = useState(false)

  const userTier = perfil?.role || 'free'
  const isAdmin = perfil?.is_admin === true || user?.email === 'isaiasgamedev@gmail.com' || user?.email === 'gramikgames@gmail.com'

  useEffect(() => {
    const uid = user?.id || null
    if (lastUserId.current === uid) return
    lastUserId.current = uid
    store.setAdmin(isAdmin)
    store.loadFromCloud(uid, 1).then(() => {
      store.carregarSlots(uid)
      // Usar getState() em vez de store (closure captura estado inicial)
      const latest = useTamagoshiStore.getState()
      const flags = latest.flags || {}
      setMostrarTermo(!flags.termo_aceito)
      // Recalcular já é stateless — barras calculadas dos timestamps
      store.recalcular()
    })
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Decaimento durante sessão ativa: a cada 30s recalcula baseado no tempo real
  // (lazy evaluation na entrada + decay contínuo enquanto estiver no site)
  useEffect(() => {
    if (!store.criaturaId || (store.status !== 'vivo' && store.status !== 'critico')) return
    const id = setInterval(() => store.recalcular(), 30000)
    return () => clearInterval(id)
  }, [store.criaturaId, store.status])

  // Log DIX periódico (mantido — não afeta métricas)
  useEffect(() => {
    if (!store._userId) return
    const logDix = () => {
      store.getSaldoDix(store._userId).then(saldo => {
        const ts = new Date().toISOString().slice(11, 19)
        const exibicao = store._isAdmin ? '∞' : saldo
        console.log(`[TAMA:DIX] ${ts} saldo=${exibicao}`)
      })
    }
    logDix()
    const id = setInterval(logDix, 600000)
    return () => clearInterval(id)
  }, [store._userId])

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
    store.darDixBoasVindas(store._userId, userTier)
  }

  const handleAction = (action) => {
    if (action === 'alimentar') setSubFase('alimentar')
    else if (action === 'banhar') setSubFase('banhar')
    else if (action === 'passear') setSubFase('passear')
    else if (action === 'brincar') setSubFase('brincar')
    else if (action === 'saude') setSubFase('saude')
  }

  const handleVoltar = () => {
    setSubFase(null)
    store.getSaldoDix(store._userId)
  }

  const handleGachaAbrir = () => setSubFase('gacha')
  const handleGachaConcluir = () => setSubFase(null)

  const handleVoltarExtras = () => {
    navigate('/games')
  }

  const handleTermoAceitar = () => {
    setMostrarTermo(false)
  }

  const handleTermoRecusar = () => {
    setMostrarTermo(false)
    navigate('/games')
  }

  const handleNovaAdocao = async () => {
    store.reset()
    if (store._userId) {
      await supabase.from('tamagoshi_saves').update({
        status: 'morto', fase: 'luto',
        cooldown_ate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('user_id', store._userId).eq('slot', store._slot || 1)
    }
  }

  const fase = store.fase

  if (subFase === 'alimentar') return <div className="tama-body"><div className="tama-content"><Alimentar onConcluir={handleVoltar} /></div></div>
  if (subFase === 'banhar') return <div className="tama-body"><div className="tama-content"><Banhar onConcluir={handleVoltar} /></div></div>
  if (subFase === 'passear') return <div className="tama-body"><div className="tama-content"><Passear onConcluir={handleVoltar} /></div></div>
  if (subFase === 'brincar') return <div className="tama-body"><div className="tama-content"><Brincadeira onConcluir={handleVoltar} /></div></div>
  if (subFase === 'saude') return <div className="tama-body"><div className="tama-content"><RestaurarSaude onConcluir={handleVoltar} /></div></div>
  if (subFase === 'loja') return <div className="tama-body"><div className="tama-content"><Loja onVoltar={handleVoltar} /></div></div>
  if (subFase === 'gacha') return <div className="tama-body"><div className="tama-content"><Gacha onConcluir={handleGachaConcluir} onVoltar={handleVoltar} /></div></div>

  if (mostrarTermo) {
    return (
      <div className="tama-body">
        <div className="tama-content">
          <Termo onAceitar={handleTermoAceitar} onVoltar={handleTermoRecusar} />
        </div>
      </div>
    )
  }

  return (
    <div className="tama-body">
      <div className="tama-content">
        {fase === 'partida' && <Partida onSalaoFama={() => window.location.href = '/perfil?aba=tamagoshi'} onNovaAdocao={handleNovaAdocao} />}
        {(!fase || fase === 'ovo') && <Ovo onEclodir={handleOvoEclodir} />}
        {fase === 'selecao' && <Selecao onEscolher={handleEscolher} userTier={userTier} onGacha={handleGachaAbrir} />}
        {fase === 'criatura' && <Criatura isAdmin={isAdmin} onAction={handleAction} onLoja={() => setSubFase('loja')} onVoltar={handleVoltarExtras} subFase={subFase} />}
        {fase === 'passeio' && <Passeio />}
        {fase === 'brincadeira' && <Brincadeira />}
        {fase === 'luto' && <Luto />}
        {fase !== 'partida' && fase !== 'luto' && (
          <BackToGamesBtn onClick={() => navigate('/games')} />
        )}
      </div>
    </div>
  )
}
