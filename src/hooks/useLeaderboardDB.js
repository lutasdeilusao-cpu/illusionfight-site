import { supabase } from '../lib/supabase'

const TENTATIVAS_POR_TIER = { free: 3, elite: 5, primordial: 7 }
const PONTOS_POR_VITORIA_TT = 20
const PONTOS_POR_VITORIA_ARENA = 15
const MAX_RANKED_PLAYS_DIA = 5

// ── DECK ─────────────────────────────────────────────────────────

export async function carregarDeck(userId) {
  const { data, error } = await supabase
    .from('toptrumps_decks')
    .select('carta_id')
    .eq('user_id', userId)
  console.log('[TT] carregarDeck resultado — data:', data?.length || 0, 'itens, error:', error)
  if (data && data.length > 0) {
    return data.map(d => {
      const n = Number(d.carta_id)
      return isNaN(n) ? d.carta_id : n
    })
  }
  return null
}

export async function salvarCartasDeck(userId, cartaIds) {
  if (!cartaIds || cartaIds.length === 0) return
  const inserts = cartaIds.map(id => ({ user_id: userId, carta_id: id }))
  const { error } = await supabase
    .from('toptrumps_decks')
    .upsert(inserts, { onConflict: 'user_id,carta_id', ignoreDuplicates: true })
  if (error) console.error('Erro ao salvar cartas no deck:', error)
}

export async function limparDeck(userId) {
  const { error } = await supabase
    .from('toptrumps_decks')
    .delete()
    .eq('user_id', userId)
  if (error) console.error('[TT] Erro ao limpar deck:', error)
}

export async function substituirDeck(userId, cartaIds) {
  await limparDeck(userId)
  if (cartaIds.length > 0) {
    const inserts = cartaIds.map(id => ({ user_id: userId, carta_id: id }))
    const { error } = await supabase
      .from('toptrumps_decks')
      .insert(inserts)
    if (error) console.error('[TT] Erro ao substituir deck:', error)
  }
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

// ── PARTIDAS / STATS ──────────────────────────────────────────────

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

// ── HELPERS COMPARTILHADOS ────────────────────────────────────────

function getPeriod() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getCountryCode() {
  try {
    const lang = navigator.language || 'pt-BR'
    const parts = lang.split('-')
    return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase()
  } catch {
    return 'BR'
  }
}

async function _registrarPontuacao(tabela, userId, pontosPorVitoria) {
  const period = getPeriod()
  const hoje = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from(tabela)
    .select('score, ranked_wins, ranked_plays_today, ranked_plays_date, country_code')
    .eq('user_id', userId)
    .eq('period', period)
    .single()

  const playsHoje = data?.ranked_plays_date === hoje ? (data.ranked_plays_today || 0) : 0

  if (playsHoje >= MAX_RANKED_PLAYS_DIA) {
    return { pontuou: false, playsHoje, limiteDiario: MAX_RANKED_PLAYS_DIA }
  }

  const novoScore = (data?.score || 0) + pontosPorVitoria
  const novoWins = (data?.ranked_wins || 0) + 1

  const { error } = await supabase
    .from(tabela)
    .upsert({
      user_id: userId,
      period,
      score: novoScore,
      ranked_wins: novoWins,
      ranked_plays_today: playsHoje + 1,
      ranked_plays_date: hoje,
      country_code: data?.country_code || getCountryCode(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,period' })

  if (error) console.error(`[LB] Erro ao registrar pontuação em ${tabela}:`, error)
  return { pontuou: true, playsHoje: playsHoje + 1, limiteDiario: MAX_RANKED_PLAYS_DIA, score: novoScore }
}

async function _carregarRanking(tabela, scope = 'global', limit = 50) {
  const period = getPeriod()
  const colunas = tabela === 'tamagoshi_ranking'
    ? 'user_id, score, country_code'
    : 'user_id, score, ranked_wins, country_code'

  let query = supabase
    .from(tabela)
    .select(colunas)
    .eq('period', period)
    .order('score', { ascending: false })
    .limit(limit)

  if (scope !== 'global') {
    query = query.eq('country_code', scope.toUpperCase())
  }

  const { data: ranking } = await query
  if (!ranking || ranking.length === 0) return []

  const userIds = ranking.map(r => r.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', userIds)

  const profileMap = {}
  ;(profiles || []).forEach(p => { profileMap[p.id] = p.nome })

  return ranking.map((r, i) => ({
    pos: i + 1,
    userId: r.user_id,
    nome: profileMap[r.user_id] || r.user_id.slice(0, 8),
    iniciais: (profileMap[r.user_id] || '?')[0].toUpperCase(),
    pontos: r.score,
    vitorias: r.ranked_wins ?? 0,
    country_code: r.country_code
  }))
}

async function _carregarPosicao(tabela, userId, scope = 'global') {
  const period = getPeriod()

  const colunas = tabela === 'tamagoshi_ranking'
    ? 'score, country_code'
    : 'score, ranked_wins, country_code'

  const { data: meu } = await supabase
    .from(tabela)
    .select(colunas)
    .eq('user_id', userId)
    .eq('period', period)
    .single()

  if (!meu) return null

  let query = supabase
    .from(tabela)
    .select('user_id', { count: 'exact', head: true })
    .eq('period', period)
    .gt('score', meu.score)

  if (scope !== 'global') {
    query = query.eq('country_code', scope.toUpperCase())
  }

  const { count } = await query
  return { pos: (count || 0) + 1, pontos: meu.score, vitorias: meu.ranked_wins ?? 0 }
}

// ── RANKING TOP TRUMPS ────────────────────────────────────────────

export async function registrarPontuacaoRanking(userId) {
  return _registrarPontuacao('toptrumps_ranking', userId, PONTOS_POR_VITORIA_TT)
}

export async function carregarRanking(scope = 'global', limit = 50) {
  return _carregarRanking('toptrumps_ranking', scope, limit)
}

export async function carregarPosicaoUsuario(userId, scope = 'global') {
  return _carregarPosicao('toptrumps_ranking', userId, scope)
}

// ── RANKING ARENA ─────────────────────────────────────────────────

export async function registrarPontuacaoArenaRanking(userId) {
  return _registrarPontuacao('arena_ranking', userId, PONTOS_POR_VITORIA_ARENA)
}

export async function carregarRankingArena(scope = 'global', limit = 50) {
  return _carregarRanking('arena_ranking', scope, limit)
}

export async function carregarPosicaoUsuarioArena(userId, scope = 'global') {
  return _carregarPosicao('arena_ranking', userId, scope)
}

// ── RANKING TAMAGOSHI ─────────────────────────────────────────────

const MAX_PONTOS_ACOES_DIA = 20 // login não entra nesse cap

export async function registrarPontuacaoTamaRanking(userId, pontos, ehLogin = false) {
  const period = getPeriod()
  const hoje = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('tamagoshi_ranking')
    .select('score, acoes_hoje, acoes_date, country_code')
    .eq('user_id', userId)
    .eq('period', period)
    .single()

  const acoesHoje = data?.acoes_date === hoje ? (data.acoes_hoje || 0) : 0

  // Login não tem cap — ações têm cap de 20pts/dia
  if (!ehLogin && acoesHoje >= MAX_PONTOS_ACOES_DIA) {
    return { pontuou: false, acoesHoje, cap: MAX_PONTOS_ACOES_DIA }
  }

  // Se ação ultrapassaria o cap, pontua só o que falta
  const pontosReais = ehLogin ? pontos : Math.min(pontos, MAX_PONTOS_ACOES_DIA - acoesHoje)
  if (pontosReais <= 0) return { pontuou: false, acoesHoje, cap: MAX_PONTOS_ACOES_DIA }

  const novoScore = (data?.score || 0) + pontosReais
  const novasAcoes = ehLogin ? acoesHoje : acoesHoje + pontosReais

  const { error } = await supabase
    .from('tamagoshi_ranking')
    .upsert({
      user_id: userId,
      period,
      score: novoScore,
      acoes_hoje: novasAcoes,
      acoes_date: hoje,
      country_code: data?.country_code || getCountryCode(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,period' })

  if (error) console.error('[TAMA] Erro ao registrar pontuação ranking:', error)
  return { pontuou: true, acoesHoje: novasAcoes, cap: MAX_PONTOS_ACOES_DIA, score: novoScore }
}

export async function carregarRankingTama(scope = 'global', limit = 50) {
  return _carregarRanking('tamagoshi_ranking', scope, limit)
}

export async function carregarPosicaoUsuarioTama(userId, scope = 'global') {
  return _carregarPosicao('tamagoshi_ranking', userId, scope)
}
