import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import todosAchievements from '../data/achievements-pt.json'

const STORAGE_KEY = 'ldi-achievements'
const AchievementsContext = createContext(null)

export function AchievementsProvider({ children }) {
  const { user } = useAuth()
  const [desbloqueados, setDesbloqueados] = useState([])
  const [toastPendente, setToastPendente] = useState(null)

  useEffect(() => {
    if (user) {
      migrarLocalParaSupabase(user.id).then(() => carregarDoSupabase())
    } else {
      carregarDoLocal()
    }
  }, [user])

  function carregarDoLocal() {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setDesbloqueados(salvos)
  }

  async function carregarDoSupabase() {
    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    if (error) { console.error('Erro ao carregar achievements:', error); return }
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
    console.log('desbloquear:', achievementId, 'user:', user?.id ?? 'NULO')
    if (desbloqueados.includes(achievementId)) return
    const achievement = todosAchievements.find(a => a.id === achievementId)
    if (!achievement) return
    if (user) {
      const { error } = await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
      if (error) {
        console.error('ERRO AO SALVAR ACHIEVEMENT:', error)
        const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...salvos, achievementId]))
      }
    } else {
      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...salvos, achievementId]))
    }
    setDesbloqueados(prev => [...prev, achievementId])
    setToastPendente(achievement)
  }, [desbloqueados, user])

  function fecharToast() {
    setToastPendente(null)
  }

  return (
    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, toastPendente, fecharToast, migrarLocalParaSupabase }}>
      {children}
    </AchievementsContext.Provider>
  )
}

export const useAchievements = () => useContext(AchievementsContext)
