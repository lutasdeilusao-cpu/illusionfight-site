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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) await carregarPerfil(session.user.id)
      else setPerfil(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setPerfil(data)
    return data
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
