import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const DixContext = createContext({})

export function DixProvider({ children }) {
  const { user } = useAuth()
  const [saldo, setSaldo] = useState(0)
  const [loading, setLoading] = useState(true)
  const [historico, setHistorico] = useState([])

  const carregar = useCallback(async () => {
    if (!user) { setSaldo(0); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('dix_wallet').select('saldo').eq('user_id', user.id).maybeSingle()
    setSaldo(data?.saldo ?? 0)
    setLoading(false)
  }, [user])

  useEffect(() => { carregar() }, [carregar])

  const creditarDix = async (quantidade, motivo) => {
    if (!user) return
    const novo = saldo + quantidade
    const { error } = await supabase.from('dix_wallet').upsert(
      { user_id: user.id, saldo: novo, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { console.error('[DIX] creditar error:', error); return }
    await supabase.from('dix_historico').insert({ user_id: user.id, valor: quantidade, motivo })
    setSaldo(novo)
    console.log('[DIX] creditado:', quantidade, 'motivo:', motivo, '| novo saldo:', novo)
  }

  const gastarDix = async (quantidade, motivo) => {
    if (!user) return false
    if (saldo < quantidade) return false
    const novo = saldo - quantidade
    const { error } = await supabase.from('dix_wallet').upsert(
      { user_id: user.id, saldo: novo, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { console.error('[DIX] gastar error:', error); return false }
    await supabase.from('dix_historico').insert({ user_id: user.id, valor: -quantidade, motivo })
    setSaldo(novo)
    console.log('[DIX] gasto:', quantidade, 'motivo:', motivo, '| novo saldo:', novo)
    return true
  }

  const carregarHistorico = async () => {
    if (!user) return
    const { data } = await supabase.from('dix_historico').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    if (data) setHistorico(data)
  }

  return (
    <DixContext.Provider value={{ saldo, loading, historico, creditarDix, gastarDix, carregarHistorico, recarregar: carregar }}>
      {children}
    </DixContext.Provider>
  )
}

export const useDix = () => useContext(DixContext)
