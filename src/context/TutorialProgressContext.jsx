import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

/* ══════════════════════════════════════════════════════════════
   Tutoriais vistos (LDI Gangues) — POR CONTA, não por aparelho/aba.

   Antes disso cada tutorial vivia sozinho no localStorage do navegador
   (`ldi-gangues-*-tutorial-visto:${saveId}`). Isaias reportou (2026-09-14):
   "toda vez que abro num aparelho ou aba nova ele aparece de novo, tá
   enchendo o saco". A causa é estrutural: localStorage é por navegador,
   não por conta — não tinha jeito de "já visto" acompanhar o jogador.

   Logado: lê/escreve gangues_tutoriais_vistos (uma linha por tutorial_id
   visto, mesmo desenho de user_achievements — ver migration 039).
   Guest (sem conta): continua em localStorage (nada de guest persiste em
   lugar nenhum nesse jogo, não é diferente aqui).
   ══════════════════════════════════════════════════════════════ */

const GUEST_PREFIX = 'ldi-gangues-tutorial-visto:'
const TutorialProgressContext = createContext(null)

export function TutorialProgressProvider({ children }) {
  const { user } = useAuth()
  const [vistos, setVistos] = useState({})
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    if (!user?.id) { setVistos({}); setCarregado(true); return }
    let cancelado = false
    setCarregado(false)
    supabase.from('gangues_tutoriais_vistos').select('tutorial_id').eq('user_id', user.id).then(({ data, error }) => {
      if (cancelado) return
      if (error) { console.error('Erro ao carregar tutoriais vistos:', error); setCarregado(true); return }
      const dict = {}
      for (const row of data || []) dict[row.tutorial_id] = true
      setVistos(dict)
      setCarregado(true)
    })
    return () => { cancelado = true }
  }, [user?.id])

  const jaViu = useCallback((tutorialId) => {
    if (user?.id) return Boolean(vistos[tutorialId])
    try { return localStorage.getItem(GUEST_PREFIX + tutorialId) === '1' } catch { return false }
  }, [user?.id, vistos])

  const marcarVisto = useCallback((tutorialId) => {
    if (!user?.id) {
      try { localStorage.setItem(GUEST_PREFIX + tutorialId, '1') } catch {}
      return
    }
    setVistos(prev => (prev[tutorialId] ? prev : { ...prev, [tutorialId]: true }))
    supabase.from('gangues_tutoriais_vistos')
      .upsert({ user_id: user.id, tutorial_id: tutorialId }, { onConflict: 'user_id,tutorial_id' })
      .then(({ error }) => { if (error) console.error('Erro ao salvar tutorial visto:', error) })
  }, [user?.id])

  return (
    <TutorialProgressContext.Provider value={{ jaViu, marcarVisto, carregado }}>
      {children}
    </TutorialProgressContext.Provider>
  )
}

export function useTutorialProgress() {
  const ctx = useContext(TutorialProgressContext)
  if (!ctx) throw new Error('useTutorialProgress precisa estar dentro de TutorialProgressProvider')
  return ctx
}
