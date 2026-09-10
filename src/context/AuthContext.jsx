import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { filterTopTrumpsInitialAccountPool } from '../lib/topTrumpsCardAccess'
import { ensureUserProfile } from '../lib/profileProvisioning'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dvxfrzixtetdzmdrzkpx.supabase.co'

const AuthContext = createContext(null)

// sessionStorage lança em Safari privado / storage cheio. Ler os dados
// pendentes do cadastro nunca pode derrubar o login.
function lerCadastroPendente() {
  try { return JSON.parse(sessionStorage.getItem('ldi-cadastro-pendente') || 'null') || {} }
  catch { return {} }
}
function limparCadastroPendente() {
  try { sessionStorage.removeItem('ldi-cadastro-pendente') } catch { /* ignora */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [session, setSession] = useState(null)
  const [horasDesdeUltimaSessao, setHorasDesdeUltimaSessao] = useState(0)
  // ids já provisionados nesta carga de página — evita repetir o trabalho
  // pesado a cada SIGNED_IN (que dispara também em foco de aba / refresh).
  const provisionadosRef = useRef(new Set())

  // ── Registrar sessão (lazy evaluation) ──
  async function registrarSessao(userId) {
    try {
      const { data: perfilData } = await supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', userId)
        .maybeSingle()

      const agora = new Date()
      const ultimaSessao = perfilData?.last_seen_at
        ? new Date(perfilData.last_seen_at)
        : agora

      const horasPassadas = Math.max(0, (agora - ultimaSessao) / 3600000)

      await supabase
        .from('profiles')
        .update({ last_seen_at: agora.toISOString() })
        .eq('id', userId)

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
    let vivo = true

    // ── Trabalho PESADO pós-login (provisionamento, perfil, conquistas, deck,
    // registro de sessão). RODA FORA do callback de onAuthStateChange.
    //
    // Por quê: o supabase-js faz `await` de TODOS os callbacks de
    // onAuthStateChange antes de resolver a promise do signInWithPassword /
    // signUp (GoTrueClient._notifyAllSubscribers). Se o callback for `async` e
    // fizer 7+ idas ao banco (como fazia aqui), o login/cadastro "estoura o
    // tempo" no cliente e mostra erro — MESMO tendo dado certo (a sessão já
    // foi gravada). Era esse o bug do "recarrego e já estou logado".
    //
    // Solução (recomendação oficial do Supabase): o callback é SÍNCRONO e
    // rápido; tudo que fala com o banco vai pra um setTimeout(…, 0).
    async function provisionar(session, { primeiroLogin }) {
      if (!vivo || !session?.user) return
      const uid = session.user.id
      const jaFeito = provisionadosRef.current.has(uid)
      provisionadosRef.current.add(uid)

      const pendentes = lerCadastroPendente()
      try {
        const r = await ensureUserProfile(session.user, pendentes)
        if (r.error) console.error('[Auth] provisionamento de perfil:', r.error)
      } catch (e) {
        console.error('[Auth] provisionamento lançou:', e)
      }
      limparCadastroPendente()
      if (!vivo) return

      try { await carregarPerfil(uid) } catch (e) { console.error('[Auth] carregarPerfil:', e) }

      if (primeiroLogin && !jaFeito) {
        try {
          await supabase.from('user_achievements').upsert(
            { user_id: uid, achievement_id: 'recrutado' },
            { onConflict: 'user_id,achievement_id' },
          )
        } catch (e) { console.error('[Auth] achievement recrutado:', e) }
        try { await garantirDeckInicial(uid) } catch (e) { console.error('[Auth] deck inicial:', e) }
        if (!vivo) return
      }

      try {
        const horas = await registrarSessao(uid)
        if (vivo) setHorasDesdeUltimaSessao(horas)
      } catch (e) { console.error('[Auth] registrarSessao:', e) }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!vivo) return
      setSession(session)
      setUser(session?.user ?? null)
      setCarregando(false)
      if (session?.user) setTimeout(() => provisionar(session, { primeiroLogin: false }), 0)
    }).catch(e => { console.error('[Auth] getSession rejeitou:', e); if (vivo) setCarregando(false) })

    // ⚠️ NÃO tornar este callback `async` e NÃO chamar supabase.* direto aqui.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setCarregando(false)
      if (!session?.user) {
        setPerfil(null)
        provisionadosRef.current.clear()
        return
      }
      // getSession() acima já cobre a sessão de carga de página; aqui só o
      // que é AO VIVO (login agora, dados do usuário mudaram).
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setTimeout(() => provisionar(session, { primeiroLogin: event === 'SIGNED_IN' }), 0)
      }
    })
    return () => { vivo = false; subscription.unsubscribe() }
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, tier, subscription_status, current_period_end, stripe_subscription_id')
      .eq('id', userId)
      .maybeSingle()
    setPerfil(data)
    return data
  }

  async function garantirDeckInicial(userId) {
    const { data } = await supabase.from('toptrumps_decks').select('carta_id').eq('user_id', userId).limit(1)
    if (data && data.length > 0) { return }
    let locale = 'pt'
    try { locale = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2) } catch { /* pt */ }
    const supertrunfoModules = import.meta.glob('../data/supertrunfo-*.json')
    const path = `../data/supertrunfo-${locale}.json`
    const loader = supertrunfoModules[path] || supertrunfoModules['../data/supertrunfo-pt.json']
    if (!loader) return
    const mod = await loader()
    const todasCartas = mod.default
    const cartasFree = filterTopTrumpsInitialAccountPool(todasCartas.cartas)
    const qtdInicial = 5
    const embaralhadas = cartasFree.sort(() => Math.random() - 0.5).slice(0, qtdInicial)
    const rows = embaralhadas.map(c => ({ user_id: userId, carta_id: c.id }))
    const { error } = await supabase.from('toptrumps_decks').insert(rows)
    if (error) console.error('[Auth] erro ao criar deck inicial:', error)
    else console.log('[Auth] deck inicial criado com', rows.length, 'cartas')
  }

  // ── Sessão longa: timer de 10 minutos ──
  useEffect(() => {
    if (!user) return
    const timer = setTimeout(async () => {
      try {
        const { data: existente } = await supabase.from('perfil_eventos')
          .select('id').eq('user_id', user.id).eq('tipo', 'sessao_longa').limit(1)
        if (!existente || existente.length === 0) {
          await supabase.from('perfil_eventos').insert({
            user_id: user.id, tipo: 'sessao_longa', descricao: 'Ficou 10+ minutos no site', valor: 10,
          })
          console.log('[Eventos] registrado: sessao_longa — 10+ minutos no site')
        }
      } catch (e) { console.error('[Eventos] erro sessao_longa:', e) }
    }, 600000) // 10 minutos
    return () => clearTimeout(timer)
  }, [user])

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
