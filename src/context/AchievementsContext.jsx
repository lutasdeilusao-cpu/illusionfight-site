import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useEventos } from './EventosContext'
import { notificationManager } from '../lib/notificationManager'
import todosAchievements from '../data/achievements-pt.json'

const STORAGE_KEY = 'ldi-achievements'
const AchievementsContext = createContext(null)

export function AchievementsProvider({ children }) {
  const { user } = useAuth()
  const [desbloqueados, setDesbloqueados] = useState([])
  const [toastPendente, setToastPendente] = useState(null)

  useEffect(() => {
    if (user) {
      if (!user.id) {
        setDesbloqueados([])
        return
      }
      migrarLocalParaSupabase(user.id).then(() => carregarDoSupabase())
    } else {
      // Sem conta = sem achievements. Limpa fila p/ evitar que notificações
      // de achievements de sessão anterior apareçam para guest (issue #guest-popup)
      setDesbloqueados([])
      notificationManager.clearByType('achievement')
    }
  }, [user])

  function carregarDoLocal() {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setDesbloqueados(salvos)
  }

  async function carregarDoSupabase() {
    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    if (error) { console.error('Erro ao carregar achievements:', error); return }
    console.log('[ACH:EXISTING_CHECK]', {
      timestamp: new Date().toISOString(), source: 'supabase-load', mode: 'authenticated',
      existingCount: data?.length ?? 0, requestedPersistence: false, requestedToast: false,
      reason: 'existing-achievements-loaded-without-toast',
    })
    if (data && data.length > 0) setDesbloqueados(data.map(d => d.achievement_id))
  }

  async function migrarLocalParaSupabase(userId) {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (salvos.length === 0) return
    const inserts = salvos.map(id => ({ user_id: userId, achievement_id: id }))
    await supabase.from('user_achievements').upsert(inserts, { onConflict: 'user_id,achievement_id' })
    localStorage.removeItem(STORAGE_KEY)
  }

  const desbloquear = useCallback(async (achievementId) => {
    console.trace('[ACH:REQUEST]', {
      timestamp: new Date().toISOString(), achievementId,
      mode: user ? 'authenticated' : 'guest', alreadyExisting: desbloqueados.includes(achievementId),
    })
    // Sem conta logada = não desbloqueia achievement
    if (!user) {
      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: false, reason: 'no-authenticated-user' })
      return
    }
    if (desbloqueados.includes(achievementId)) {
      console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: false, requestedToast: false, reason: 'already-unlocked-in-state' })
      return
    }
    const achievement = todosAchievements.find(a => a.id === achievementId)
    if (!achievement) {
      console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: false, requestedToast: false, reason: 'achievement-definition-not-found' })
      return
    }
    console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: false, requestedPersistence: true, requestedToast: true, reason: 'new-unlock-request' })
    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'persisting-new-achievement' })
    const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
    if (error) {
      if (error.code === '23505') {
        console.log('[ACH:EXISTING_CHECK]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', alreadyExisting: true, requestedPersistence: true, requestedToast: false, reason: 'database-duplicate' })
        setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
        return
      }
      console.error('ERRO AO SALVAR ACHIEVEMENT:', error)
      return
    }
    setDesbloqueados(prev => prev.includes(achievementId) ? prev : [...prev, achievementId])
    notificationManager.push('achievement', {
      nome: achievement.nome,
      descricao: achievement.descricao,
      icone: achievement.icone,
    })
    // Registrar evento de conquista (usa supabase diretamente p/ evitar dependência cíclica)
    try {
      const { data: existente } = await supabase.from('perfil_eventos')
        .select('id').eq('user_id', user.id).eq('tipo', 'conquista').eq('descricao', `Desbloqueou: ${achievement.nome}`).limit(1)
      if (!existente || existente.length === 0) {
        await supabase.from('perfil_eventos').insert({
          user_id: user.id, tipo: 'conquista', descricao: `Desbloqueou: ${achievement.nome}`, valor: achievement.tier || 1,
        })
      }
    } catch (e) { console.error('[Eventos] erro ao registrar conquista:', e) }
  }, [desbloqueados, user])

  function registrarGangue() {
    desbloquear('conhece_a_gangue')
  }

  const desbloquearOuConvidar = useCallback((achievementId) => {
    console.trace('[ACH:REQUEST]', {
      timestamp: new Date().toISOString(), achievementId,
      mode: user ? 'authenticated' : 'guest', entrypoint: 'desbloquearOuConvidar',
    })
    if (!user) {
      console.log('[ACH:GUEST_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'guest', requestedPersistence: false, requestedToast: true, reason: 'guest-cta-enqueue' })
      notificationManager.push('cta_conta', { achievementId })
      return
    }
    console.log('[ACH:AUTH_PATH]', { timestamp: new Date().toISOString(), achievementId, mode: 'authenticated', requestedPersistence: true, requestedToast: true, reason: 'delegating-to-unlock' })
    desbloquear(achievementId)
  }, [desbloquear, user])

  function fecharToast() {
    setToastPendente(null)
  }

  const refresh = useCallback(async () => {
    if (!user) { setDesbloqueados([]); return }
    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    if (error) { console.error('Erro ao recarregar achievements:', error); return }
    setDesbloqueados(data ? data.map(d => d.achievement_id) : [])
  }, [user])

  return (
    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, desbloquearOuConvidar, toastPendente, fecharToast, refresh, migrarLocalParaSupabase, registrarGangue }}>
      {children}
    </AchievementsContext.Provider>
  )
}

export const useAchievements = () => useContext(AchievementsContext)
