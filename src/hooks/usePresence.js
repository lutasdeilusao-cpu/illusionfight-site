import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CHANNEL_NAME = 'presence:toptrumps'

/**
 * Registra a presença do usuário atual no canal compartilhado e retorna
 * a lista de presenças ativas (todos os usuários no canal, incluindo o próprio).
 *
 * @param {object} params
 * @param {string} params.userId - ID do usuário (null = não registra presença, só observa)
 * @param {string} params.modo - 'single' | 'lobby' | 'jogo'
 * @param {string} params.tier - tier do usuário ('free' | 'elite' | 'primordial')
 */
export function usePresence({ userId, modo, tier }) {
  const [presencas, setPresencas] = useState([])

  useEffect(() => {
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: userId || `anon_${Math.random().toString(36).slice(2)}` } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const lista = Object.values(state).flatMap(arr => arr)
        setPresencas(lista)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userId) {
          await channel.track({ modo, tier, online_at: new Date().toISOString() })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [userId, modo, tier])

  return presencas
}
