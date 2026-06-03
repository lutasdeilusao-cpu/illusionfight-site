import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) await carregarPerfil(session.user.id)
      setCarregando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await carregarPerfil(session.user.id)
        if (event === 'SIGNED_IN') await garantirDeckInicial(session.user.id)
      } else {
        setPerfil(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setPerfil(data)
    return data
  }

  async function garantirDeckInicial(userId) {
    const { data } = await supabase.from('toptrumps_decks').select('carta_id').eq('user_id', userId).limit(1)
    if (data && data.length > 0) { console.log('[Auth] deck já existe, pulando criação'); return }
    const todasCartas = (await import('../data/supertrunfo-pt.json')).default
    const cartasFree = todasCartas.cartas.filter(c => c.tier === 'free')
    const embaralhadas = cartasFree.sort(() => Math.random() - 0.5).slice(0, 10)
    const rows = embaralhadas.map(c => ({ user_id: userId, carta_id: c.id }))
    const { error } = await supabase.from('toptrumps_decks').insert(rows)
    if (error) console.error('[Auth] erro ao criar deck inicial:', error)
    else console.log('[Auth] deck inicial criado com', rows.length, 'cartas')
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, carregando, logout, carregarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
