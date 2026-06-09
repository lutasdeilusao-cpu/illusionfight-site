import { create } from 'zustand'
import { notificationManager } from '../lib/notificationManager'

/**
 * @deprecated Use notificationManager diretamente.
 * Mantida para compatibilidade com Tamagoshi.
 */
export const useNotificationStore = create((set, get) => ({
  queue: [],
  push: (mensagem, cta, url) => {
    // Redireciona para o notificationManager unificado
    notificationManager.push('ldi_tip', { mensagem, cta, url, personagem: 'tama' })
    // Mantém fila local para compatibilidade reversa
    const id = Date.now() + Math.random()
    set(s => ({ queue: [...s.queue, { id, mensagem, cta, url }] }))
  },
  pop: () => {
    const q = get().queue
    if (q.length === 0) return null
    set({ queue: q.slice(1) })
    return q[0]
  },
}))
