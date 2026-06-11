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

  function fecharToast() {
    setToastPendente(null)
  }

  return (
    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, toastPendente, fecharToast, migrarLocalParaSupabase, registrarGangue }}>
      {children}
    </AchievementsContext.Provider>
  )
}

export const useAchievements = () => useContext(AchievementsContext)
