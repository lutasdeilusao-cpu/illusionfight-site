import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useArenaTaticsStore } from './store/useArenaTaticsStore'
import { gerarTimeInimigo } from './data/enemies'
import { TATICS_VERSION } from '../../config/version'

import Intro from './screens/Intro'
import Batalha from './screens/Batalha'
import Vitoria from './screens/Vitoria'
import Derrota from './screens/Derrota'

import './ArenaTatics.css'

console.log(`[TATICS] versão carregada: ${TATICS_VERSION}`)

const CLASSES = {
  karuak: { id: 'karuak', nome: 'KARUAK', tipo: 'Mãos Livres', papel: 'Tanque' },
  moraki: { id: 'moraki', nome: 'MORAKI', tipo: 'Mãos Livres', papel: 'DPS/Disruptor' },
  tivara: { id: 'tivara', nome: 'TIVARA', tipo: 'Armas', papel: 'DPS' },
}

export default function ArenaTaticsRoute() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaTaticsStore()
  const [fase, setFase] = useState('intro')

  useEffect(() => {
    if (user) { store.setUserId(user.id); store.loadSave(user.id) }
  }, [user])

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const handleIntroEnter = () => {
    // Configura personagem padrão (Briguento)
    store.setClasse('karuak')
    store.setNome('Briguento')
    store.setElemental('fogo')

    // Gera inimigos e inicia batalha
    store.iniciarBatalha(gerarTimeInimigo(10))
    store.iniciarCombate()
    setFase('combate')
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
    store.iniciarBatalha(gerarTimeInimigo(store.sdr))
    store.iniciarCombate()
    setFase('combate')
  }

  const handleSair = () => navigate('/games')

  return (
    <div className="tatics-container">
      {fase === 'intro' && <Intro onEnter={handleIntroEnter} />}
      {fase === 'combate' && <Batalha onVitoria={handleVitoria} onDerrota={handleDerrota} />}
      {fase === 'vitoria' && <Vitoria sdrGanho={10} vitorias={store.vitorias} streak={store.streak} onContinuar={handleRevanche} />}
      {fase === 'derrota' && <Derrota onRevanche={handleRevanche} onSair={handleSair} />}
    </div>
  )
}
