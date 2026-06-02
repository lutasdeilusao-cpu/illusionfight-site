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
      carregarDoSupabase()
      migrarLocalParaSupabase(user.id)
    } else {
      carregarDoLocal()
    }
  }, [user])

  function carregarDoLocal() {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setDesbloqueados(salvos)
  }

  async function carregarDoSupabase() {
    const { data } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    if (data) setDesbloqueados(data.map(d => d.achievement_id))
  }

  async function migrarLocalParaSupabase(userId) {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (salvos.length === 0) return
    const inserts = salvos.map(id => ({ user_id: userId, achievement_id: id }))
    await supabase.from('user_achievements').upsert(inserts, { onConflict: 'user_id,achievement_id' })
    localStorage.removeItem(STORAGE_KEY)
  }

  const desbloquear = useCallback(async (achievementId) => {
    if (desbloqueados.includes(achievementId)) return
    const achievement = todosAchievements.find(a => a.id === achievementId)
    if (!achievement) return
    if (user) {
      await supabase.from('user_achievements').insert({ user_id: user.id, achievement_id: achievementId })
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
