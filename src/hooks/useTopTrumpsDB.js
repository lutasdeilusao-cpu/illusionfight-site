import { supabase } from '../lib/supabase'

export async function carregarDeck(userId) {
  const { data, error } = await supabase
    .from('toptrumps_decks')
    .select('carta_id')
    .eq('user_id', userId)
  console.log('[TT] carregarDeck resultado — data:', data?.length || 0, 'itens, error:', error)
  if (data && data.length > 0) return data.map(d => d.carta_id)
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
