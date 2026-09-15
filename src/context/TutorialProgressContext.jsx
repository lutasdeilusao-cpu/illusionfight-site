import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

/* ══════════════════════════════════════════════════════════════
   Tutoriais vistos (LDI Gangues) — POR GANGUE (save), dentro da conta.

   Antes disso cada tutorial vivia sozinho no localStorage do navegador
   (`ldi-gangues-*-tutorial-visto:${saveId}`). Isaias reportou (2026-09-14):
   "toda vez que abro num aparelho ou aba nova ele aparece de novo, tá
   enchendo o saco" → virou POR CONTA (migration 039). Só que aí veio a
   queixa oposta (2026-09-15): "fico deletando a gangue... os tutoriais
   não aparecem pra mim de novo... sempre que eu deletar a gangue eles
   devem reaparecer, logicamente, uma vez por gangue". Por conta pura
   marcava um tutorial como visto PRA SEMPRE, mesmo apagando a gangue e
   fundando outra — quebra a fantasia de "gangue nova" do onboarding.

   Fix (migration 040): `save_id` com ON DELETE CASCADE — apagar o save
   já limpa sozinho os tutoriais vistos daquela gangue, sem código extra
   de limpeza. Uma conta com 2 gangues em paralelo mantém tutoriais
   independentes por gangue (não é reset global da conta).

   IMPORTANTE — por que `saveId` chega por `definirSaveAtivo(id)` em vez
   de ler `useGanguesStore` direto aqui: este provider é montado no
   main.jsx, ENVOLVENDO O SITE INTEIRO (todo jogo, toda página) — um
   import estático do store do Gangues aqui puxaria o jogo inteiro pro
   bundle principal, furando o lazy-load da rota (bug real: o build saltou
   de ~312KB pra ~940KB só de fazer esse import, pego antes de subir).
   Em vez disso, GanguesRoute.jsx (que já está dentro do chunk lazy do
   jogo) chama `definirSaveAtivo(store._saveId)` num efeito — a ponte fica
   só numa função, sem puxar o store pro bundle principal.

   Logado: lê/escreve gangues_tutoriais_vistos (user_id + save_id +
   tutorial_id). Sem save ativo ainda (guest, ou entre telas antes de
   `definirSaveAtivo` disparar), `jaViu` sempre volta falso — mostra o
   tutorial, não trava escondido esperando um save que talvez nunca chegue.
   Guest (sem conta): continua em localStorage, por save.
   ══════════════════════════════════════════════════════════════ */

const GUEST_PREFIX = 'ldi-gangues-tutorial-visto:'
const TutorialProgressContext = createContext(null)

export function TutorialProgressProvider({ children }) {
  const { user } = useAuth()
  const [saveId, setSaveId] = useState(null)
  const [vistos, setVistos] = useState({})
  const [carregado, setCarregado] = useState(false)

  const definirSaveAtivo = useCallback((id) => { setSaveId(id || null) }, [])

  useEffect(() => {
    if (!user?.id || !saveId) { setVistos({}); setCarregado(true); return }
    let cancelado = false
    setCarregado(false)
    supabase.from('gangues_tutoriais_vistos').select('tutorial_id').eq('user_id', user.id).eq('save_id', saveId).then(({ data, error }) => {
      if (cancelado) return
      if (error) { console.error('Erro ao carregar tutoriais vistos:', error); setCarregado(true); return }
      const dict = {}
      for (const row of data || []) dict[row.tutorial_id] = true
      setVistos(dict)
      setCarregado(true)
    })
    return () => { cancelado = true }
  }, [user?.id, saveId])

  const jaViu = useCallback((tutorialId) => {
    if (user?.id) return saveId ? Boolean(vistos[tutorialId]) : false
    try { return localStorage.getItem(GUEST_PREFIX + tutorialId) === '1' } catch { return false }
  }, [user?.id, saveId, vistos])

  const marcarVisto = useCallback((tutorialId) => {
    if (!user?.id) {
      try { localStorage.setItem(GUEST_PREFIX + tutorialId, '1') } catch {}
      return
    }
    if (!saveId) return
    setVistos(prev => (prev[tutorialId] ? prev : { ...prev, [tutorialId]: true }))
    supabase.from('gangues_tutoriais_vistos')
      .upsert({ user_id: user.id, save_id: saveId, tutorial_id: tutorialId }, { onConflict: 'user_id,save_id,tutorial_id' })
      .then(({ error }) => { if (error) console.error('Erro ao salvar tutorial visto:', error) })
  }, [user?.id, saveId])

  return (
    <TutorialProgressContext.Provider value={{ jaViu, marcarVisto, carregado, definirSaveAtivo }}>
      {children}
    </TutorialProgressContext.Provider>
  )
}

export function useTutorialProgress() {
  const ctx = useContext(TutorialProgressContext)
  if (!ctx) throw new Error('useTutorialProgress precisa estar dentro de TutorialProgressProvider')
  return ctx
}
