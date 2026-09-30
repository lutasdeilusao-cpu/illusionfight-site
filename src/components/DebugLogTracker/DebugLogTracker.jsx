// Liga o log de depuração (lib/debugLog.js) só pra conta admin e registra
// cada troca de rota. Conta comum: não faz nada.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ativarDebugLog, desativarDebugLog, logDebug } from '../../lib/debugLog'

export default function DebugLogTracker() {
  const { perfil } = useAuth()
  const location = useLocation()
  const admin = perfil?.is_admin === true

  useEffect(() => {
    if (admin) ativarDebugLog(perfil)
    else desativarDebugLog()
  }, [admin])

  useEffect(() => {
    if (admin) logDebug('rota', { para: location.pathname + location.search })
  }, [admin, location.pathname, location.search])

  return null
}
