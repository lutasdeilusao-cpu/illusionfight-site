import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usePPStore } from './store/usePPStore'
import MapaCidade from './screens/MapaCidade'
import CasoAbertura from './screens/CasoAbertura'
import Investigacao from './screens/Investigacao'
import Dossier from './screens/Dossier'
import CadernoSuspeitas from './screens/CadernoSuspeitas'
import Confronto from './screens/Confronto'
import Resolucao from './screens/Resolucao'
import FinalScreen from './screens/FinalScreen'
import Dormindo from './screens/Dormindo'
import './PP.css'

const PP_VERSION = '1.1.0'
console.log(`[PP] versão carregada: ${PP_VERSION}`)

export default function PP() {
  const { user } = useAuth()
  const store = usePPStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      store.setUserId(user.id)
      store.loadFromCloud(user.id).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) return <div className="pp-page"><p className="pp-loading">acordando do pesadelo...</p></div>

  const { fase } = store

  return (
    <div className="pp-page">
      {fase === 'dormindo' && <Dormindo />}
      {fase === 'mapa' && <MapaCidade />}
      {fase === 'abertura' && <CasoAbertura />}
      {fase === 'investigar' && <Investigacao />}
      {fase === 'dossier' && <Dossier />}
      {fase === 'caderno' && <CadernoSuspeitas />}
      {fase === 'confronto' && <Confronto />}
      {fase === 'resolucao' && <Resolucao />}
      {fase === 'final' && <FinalScreen />}
    </div>
  )
}
