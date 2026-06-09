import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dvxfrzixtetdzmdrzkpx.supabase.co'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [session, setSession] = useState(null)
  const [horasDesdeUltimaSessao, setHorasDesdeUltimaSessao] = useState(0)

  // ── Registrar sessão (lazy evaluation) ──
  async function registrarSessao(userId) {
    try {
      const { data: perfilData } = await supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', userId)
        .single()

      const agora = new Date()
      const ultimaSessao = perfilData?.last_seen_at
        ? new Date(perfilData.last_seen_at)
        : agora

      const horasPassadas = Math.max(0, (agora - ultimaSessao) / 3600000)

      await supabase
        .from('profiles')
        .update({ last_seen_at: agora.toISOString() })
        .eq('id', userId)

      console.log(`[Sessão] ${horasPassadas.toFixed(1)}h desde última sessão`)
      return horasPassadas
    } catch (e) {
      console.error('[Sessão] erro ao registrar:', e)
      return 0
    }
  }

  // ── beforeunload: salva saída com sendBeacon ──
  useEffect(() => {
    const handleSaida = () => {
      if (!user) return
      const payload = JSON.stringify({
        last_seen_at: new Date().toISOString(),
      })
      const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`
      try {
        navigator.sendBeacon(url, payload)
      } catch { /* fallback silencioso */ }
    }
    window.addEventListener('beforeunload', handleSaida)
    return () => window.removeEventListener('beforeunload', handleSaida)
  }, [user])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      setSession(session)
      if (session?.user) {
        await carregarPerfil(session.user.id)
        const horas = await registrarSessao(session.user.id)
        setHorasDesdeUltimaSessao(horas)
      }
      setCarregando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setSession(session)
      if (session?.user) {
        await carregarPerfil(session.user.id)
        if (event === 'SIGNED_IN') {
          await garantirDeckInicial(session.user.id)
          const horas = await registrarSessao(session.user.id)
          setHorasDesdeUltimaSessao(horas)
        }
      } else {
        setPerfil(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, tier, subscription_status, current_period_end, stripe_subscription_id')
      .eq('id', userId)
      .single()
    setPerfil(data)
    return data
  }

  async function garantirDeckInicial(userId) {
    const { data } = await supabase.from('toptrumps_decks').select('carta_id').eq('user_id', userId).limit(1)
    if (data && data.length > 0) { console.log('[Auth] deck já existe, pulando criação'); return }
    const locale = localStorage.getItem('ldi-locale') || 'pt'
    const mod = await import(/* @vite-ignore */ 
      locale === 'en' ? '../data/supertrunfo-en.json' :
      locale === 'es' ? '../data/supertrunfo-es.json' :
      '../data/supertrunfo-pt.json')
    const todasCartas = mod.default
    const cartasFree = todasCartas.cartas.filter(c => c.tier === 'free')
    const qtdInicial = 5
    const embaralhadas = cartasFree.sort(() => Math.random() - 0.5).slice(0, qtdInicial)
    const rows = embaralhadas.map(c => ({ user_id: userId, carta_id: c.id_num }))
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
    <AuthContext.Provider value={{ user, perfil, carregando, session, logout, carregarPerfil, horasDesdeUltimaSessao }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
