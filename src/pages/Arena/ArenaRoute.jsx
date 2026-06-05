import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReader } from '../../context/ReaderContext'
import { useArenaStore } from './store/useArenaStore'
import { getInimigoPorSDR, gerarTimeInimigo } from './data/enemies'
import { TATICA_VERSION } from '../../config/version'

import Intro from './screens/Intro'
import ClasseSelect from './screens/ClasseSelect'
import Customizacao from './screens/Customizacao'
import TeamBuilder from './screens/TeamBuilder'
import PreBatalha from './screens/PreBatalha'
import Batalha from './screens/Batalha'
import Vitoria from './screens/Vitoria'
import Derrota from './screens/Derrota'

import './Arena.css'

console.log(`[TÁTICA] versão carregada: ${TATICA_VERSION}`)

export default function ArenaRoute() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const store = useArenaStore()
  const [fase, setFase] = useState('intro')

  useEffect(() => {
    if (user) {
      store.setUserId(user.id)
      store.loadSave(user.id)
    }
  }, [user])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const handleIntroEnter = () => setFase('select')

  const handleClasseSelect = (classeId) => {
    store.setClasse(classeId)
    setFase('custom')
  }

  const handleCustomConfirm = (data) => {
    store.setPersonagem(data)
    store.saveToCloud(user?.id)
    setFase('team')
  }

  const handleTeamConfirm = () => {
    const inimigos = gerarTimeInimigo(store.sdr)
    store.iniciarBatalha(inimigos)
    setFase('pre')
  }

  const handleIniciarLuta = () => {
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
    const inimigos = gerarTimeInimigo(store.sdr)
    store.iniciarBatalha(inimigos)
    setFase('pre')
  }

  const handleSair = () => navigate('/games')

  // Rotas existentes do antigo Arena (mantidas para não quebrar)
  // As telas antigas (ArenaLobby, ArenaCreate, ArenaCombat, ArenaVictory)
  // foram substituídas pelo novo fluxo tático

  return (
    <div className="tatica-container">
      {fase === 'intro' && <Intro onEnter={handleIntroEnter} />}
      {fase === 'select' && (
        <ClasseSelect tier={user?.tier || 'free'} rotacao={0} onSelect={handleClasseSelect} />
      )}
      {fase === 'custom' && (
        <Customizacao
          classe={store.classe}
          onConfirm={handleCustomConfirm}
          onBack={() => setFase('select')}
        />
      )}
      {fase === 'team' && (
        <TeamBuilder
          personagemPrincipal={{ id: 'player', nome: store.nome, classe: store.classe, elemental: store.elemental }}
          time={store.time}
          onAdd={() => {}}
          onRemove={store.removeFromTeam}
          onConfirm={handleTeamConfirm}
          onBack={() => setFase('custom')}
        />
      )}
      {fase === 'pre' && store.batalha && (
        <PreBatalha
          aliados={store.batalha.aliados}
          inimigos={store.batalha.inimigos}
          onIniciar={handleIniciarLuta}
        />
      )}
      {fase === 'combate' && (
        <Batalha onVitoria={handleVitoria} onDerrota={handleDerrota} />
      )}
      {fase === 'vitoria' && (
        <Vitoria
          sdrGanho={Math.round(store.sdr - (store.sdr - 10))}
          vitorias={store.vitorias}
          streak={store.streak}
          onContinuar={() => {
            const inimigos = gerarTimeInimigo(store.sdr)
            store.iniciarBatalha(inimigos)
            setFase('pre')
          }}
        />
      )}
      {fase === 'derrota' && (
        <Derrota onRevanche={handleRevanche} onSair={handleSair} />
      )}
    </div>
  )
}
