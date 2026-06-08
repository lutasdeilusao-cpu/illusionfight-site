import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const FICHAS_POR_TIER = { free: 3, elite: 10, primordial: 30 }

const FichasContext = createContext({})

export function FichasProvider({ children }) {
  const { user } = useAuth()
  const [saldo, setSaldo] = useState(0)
  const [fichasHoje, setFichasHoje] = useState(0)
  const [ultimaColeta, setUltimaColeta] = useState(null)
  const [podeColetarHoje, setPodeColetarHoje] = useState(false)
  const [loading, setLoading] = useState(true)
  const [historico, setHistorico] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [fichasDiariasState, setFichasDiariasState] = useState(3)
  const fichasDiarias = fichasDiariasState
  const hoje = () => new Date().toISOString().split('T')[0]

  const carregar = useCallback(async () => {
    if (!user) { setLoading(false); return }
    // Check admin + role via profiles
    const { data: profileData } = await supabase.from('profiles').select('is_admin, role').eq('id', user.id).maybeSingle()
    const adminFlag = profileData?.is_admin || false
    setIsAdmin(adminFlag)
    const fichasPorRole = { free: 100, elite: 10, primordial: 30, moderator: 10, admin: 999 }
    const rolePerfil = profileData?.role || 'free'
    setFichasDiariasState(fichasPorRole[rolePerfil] || 3)
    console.log('[FICHAS] role:', rolePerfil, '| is_admin:', profileData?.is_admin, '| fichas/dia:', fichasPorRole[rolePerfil] || 3)
    if (adminFlag) { setLoading(false); return }
    const { data } = await supabase.from('fichas').select('*').eq('user_id', user.id).maybeSingle()
    if (data) {
      setSaldo(data.saldo)
      setFichasHoje(data.fichas_diarias_coletadas)
      setUltimaColeta(data.ultima_coleta)
      setPodeColetarHoje(data.ultima_coleta !== hoje())
    } else {
      await supabase.from('fichas').insert({ user_id: user.id, saldo: 0, fichas_diarias_coletadas: 0, ultima_coleta: null })
      setPodeColetarHoje(true)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { carregar() }, [carregar])

  const coletarDiarias = async () => {
    if (!user || isAdmin || !podeColetarHoje) return false
    const novoSaldo = saldo + fichasDiarias
    const { error } = await supabase.from('fichas').update({
      saldo: novoSaldo, fichas_diarias_coletadas: fichasDiarias,
      ultima_coleta: hoje(), updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)
    if (!error) {
      setSaldo(novoSaldo); setFichasHoje(fichasDiarias); setUltimaColeta(hoje()); setPodeColetarHoje(false)
      await supabase.from('fichas_historico').insert({ user_id: user.id, tipo: 'ganho', motivo: 'diaria', quantidade: fichasDiarias })
      console.log('[FICHAS] coletadas:', fichasDiarias, '| novo saldo:', novoSaldo)
      return true
    }
    return false
  }

  const ganharFichas = async (quantidade, motivo) => {
    if (!user || isAdmin) return
    const novoSaldo = saldo + quantidade
    await supabase.from('fichas').update({ saldo: novoSaldo, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    await supabase.from('fichas_historico').insert({ user_id: user.id, tipo: 'ganho', motivo, quantidade })
    setSaldo(novoSaldo)
    console.log('[FICHAS] ganhou:', quantidade, 'motivo:', motivo, '| novo saldo:', novoSaldo)
  }

  const gastarFicha = async (motivo) => {
    if (isAdmin) return true
    if (saldo <= 0) return false
    const novoSaldo = saldo - 1
    const { error } = await supabase.from('fichas').update({ saldo: novoSaldo, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    if (!error) {
      await supabase.from('fichas_historico').insert({ user_id: user.id, tipo: 'gasto', motivo, quantidade: 1 })
      setSaldo(novoSaldo)
      console.log('[FICHAS] gasta | motivo:', motivo, '| novo saldo:', novoSaldo)
      return true
    }
    return false
  }

  const carregarHistorico = async () => {
    if (!user) return
    const { data } = await supabase.from('fichas_historico').select('*').eq('user_id', user.id).order('criado_em', { ascending: false }).limit(20)
    if (data) setHistorico(data)
  }

  return (
    <FichasContext.Provider value={{ saldo, fichasHoje, fichasDiarias, podeColetarHoje, isAdmin, loading, historico,
      coletarDiarias, ganharFichas, gastarFicha, carregarHistorico, recarregar: carregar }}>
      {children}
    </FichasContext.Provider>
  )
}

export const useFichas = () => useContext(FichasContext)
