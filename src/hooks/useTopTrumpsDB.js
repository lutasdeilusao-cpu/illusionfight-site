import { supabase } from '../lib/supabase'

const TENTATIVAS_POR_TIER = { free: 3, elite: 10, primordial: 30 }

export async function carregarDeck(userId) {
  const { data, error } = await supabase
    .from('toptrumps_decks')
    .select('carta_id')
    .eq('user_id', userId)
  console.log('[TT] carregarDeck resultado — data:', data?.length || 0, 'itens, error:', error)
  // Garante que carta_id seja número — o banco pode retornar string
  if (data && data.length > 0) return data.map(d => Number(d.carta_id))
  return null
}

export async function salvarCartasDeck(userId, cartaIds) {
  if (!cartaIds || cartaIds.length === 0) return
  console.log('[TT] salvarCartasDeck chamado — userId:', userId, 'cartas:', cartaIds.length)
  const inserts = cartaIds.map(id => ({ user_id: userId, carta_id: id }))
  const { data, error } = await supabase
    .from('toptrumps_decks')
    .upsert(inserts, { onConflict: 'user_id,carta_id', ignoreDuplicates: true })
  console.log('[TT] salvarCartasDeck resultado — data:', data, 'error:', error)
  if (error) console.error('Erro ao salvar cartas no deck:', error)
}

export async function registrarPartida(userId, dados) {
  const { error } = await supabase
    .from('toptrumps_partidas')
    .insert({
      user_id: userId,
      jogadas: dados.jogadas,
      vitorias: dados.vitorias,
      derrotas: dados.derrotas,
      empates: dados.empates,
      resultado: dados.resultado,
      carta_recompensa: dados.carta_recompensa || null
    })
  if (error) console.error('Erro ao registrar partida:', error)
  await atualizarStats(userId, dados)
  return dados
}

export async function atualizarStats(userId, dados) {
  const stats = await carregarStats(userId)
  const novoStreak = dados.resultado === 'vitoria' ? (stats.streak_atual || 0) + 1 : 0
  const melhorStreak = Math.max(stats.melhor_streak || 0, novoStreak)
  const { error } = await supabase
    .from('toptrumps_stats')
    .upsert({
      user_id: userId,
      total_partidas: (stats.total_partidas || 0) + 1,
      total_vitorias: (stats.total_vitorias || 0) + (dados.resultado === 'vitoria' ? 1 : 0),
      total_derrotas: (stats.total_derrotas || 0) + (dados.resultado === 'derrota' ? 1 : 0),
      total_empates: (stats.total_empates || 0) + (dados.resultado === 'empate' ? 1 : 0),
      streak_atual: novoStreak,
      melhor_streak: melhorStreak,
      atualizado_em: new Date().toISOString()
    }, { onConflict: 'user_id' })
  if (error) console.error('Erro ao atualizar stats:', error)
}

export async function carregarStats(userId) {
  const { data } = await supabase
    .from('toptrumps_stats')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data || { total_partidas: 0, total_vitorias: 0, total_derrotas: 0, total_empates: 0, streak_atual: 0, melhor_streak: 0 }
}

export async function carregarUltimasPartidas(userId, limite = 10) {
  const { data } = await supabase
    .from('toptrumps_partidas')
    .select('*')
    .eq('user_id', userId)
    .order('criada_em', { ascending: false })
    .limit(limite)
  return data || []
}

export async function carregarTentativas(userId, tier = 'free') {
  const { data, error } = await supabase
    .from('toptrumps_stats')
    .select('tentativas_data, tentativas_usadas, carta_ganha_hoje')
    .eq('user_id', userId)
    .single()
  if (error || !data) return { usadas: 0, data: null, jaGanhouHoje: false, limite: TENTATIVAS_POR_TIER[tier] || 3 }
  const hoje = new Date().toISOString().split('T')[0]
  if (data.tentativas_data !== hoje) return { usadas: 0, data: hoje, jaGanhouHoje: false, limite: TENTATIVAS_POR_TIER[tier] || 3 }
  return { usadas: data.tentativas_usadas, data: data.tentativas_data, jaGanhouHoje: data.carta_ganha_hoje || false, limite: TENTATIVAS_POR_TIER[tier] || 3 }
}

export async function incrementarTentativa(userId, tier = 'free') {
  const hoje = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('toptrumps_stats')
    .select('tentativas_data, tentativas_usadas')
    .eq('user_id', userId)
    .single()
  const usadas = (data?.tentativas_data === hoje) ? (data.tentativas_usadas + 1) : 1
  await supabase
    .from('toptrumps_stats')
    .upsert({
      user_id: userId,
      tentativas_data: hoje,
      tentativas_usadas: usadas,
      carta_ganha_hoje: true
    }, { onConflict: 'user_id' })
  return usadas
}

export async function migrarLocalStorageParaSupabase(userId) {
  const chave = `ldi-toptrumps-deck-${userId}`
  const salvo = localStorage.getItem(chave)
  if (!salvo) return
  const ids = JSON.parse(salvo)
  if (ids.length > 0) {
    const { error } = await supabase
      .from('toptrumps_decks')
      .upsert(ids.map(id => ({ user_id: userId, carta_id: id })), { onConflict: 'user_id,carta_id', ignoreDuplicates: true })
    if (!error) localStorage.removeItem(chave)
  } else {
    localStorage.removeItem(chave)
  }
}
