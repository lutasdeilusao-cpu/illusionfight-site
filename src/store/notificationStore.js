import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  queue: [],
  push: (mensagem, cta, url) => {
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
