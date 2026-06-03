import { supabase } from '../lib/supabase'

const LIMITES = { free: 1, elite: 5, primordial: 10 }

function codigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'LDI-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function criarSala(userId, modo, tipoSala, turnosDesejados) {
  const codigo = codigoSala()
  const { data, error } = await supabase.from('toptrumps_salas').insert({
    codigo, modo, tipo_sala: tipoSala,
    jogador1_id: userId, turnos_j1: turnosDesejados,
    status: 'aguardando'
  }).select('id, codigo').single()
  if (error) { console.error('[TTMP] erro criar sala:', error); return null }
  return { salaId: data.id, codigo: data.codigo }
}

export async function entrarSalaPorCodigo(userId, codigo, turnosDesejados) {
  const { data: sala } = await supabase.from('toptrumps_salas').select('*').eq('codigo', codigo).eq('status', 'aguardando').single()
  if (!sala) return { erro: 'Sala não encontrada ou já iniciada.' }
  if (sala.jogador1_id === userId) return { erro: 'Você já está nesta sala.' }
  const total = Math.min(sala.turnos_j1, turnosDesejados)
  const { error } = await supabase.from('toptrumps_salas').update({
    jogador2_id: userId, turnos_j2: turnosDesejados, total_turnos: total,
    status: 'em_jogo', turno_atual: 1, jogador_da_vez: sala.jogador1_id
  }).eq('id', sala.id)
  console.log('[MP] UPDATE sala codigo resultado:', { error, salaId: sala.id })
  if (error) { console.error('[TTMP] erro entrar sala:', error); return { erro: 'Erro ao entrar na sala.' } }
  return { salaId: sala.id }
}

export async function entrarFilaPublica(userId, modo, turnosDesejados) {
  console.log('[MP] entrarFilaPublica chamado', { userId, modo, turnos: turnosDesejados })
  const { data: sala } = await supabase
    .from('toptrumps_salas').select('*').eq('status', 'aguardando').eq('tipo_sala', 'publica').eq('modo', modo)
    .neq('jogador1_id', userId)
    .gte('criada_em', new Date(Date.now() - 5 * 60 * 1000).toISOString()).single()
  console.log('[MP] sala encontrada:', sala)
  if (sala) {
    const total = Math.min(sala.turnos_j1, turnosDesejados)
    const { error: updateError } = await supabase.from('toptrumps_salas').update({
      jogador2_id: userId, turnos_j2: turnosDesejados, total_turnos: total,
      status: 'em_jogo', turno_atual: 1, jogador_da_vez: sala.jogador1_id
    }).eq('id', sala.id)
    console.log('[MP] UPDATE sala resultado:', { updateError, salaId: sala.id })
    if (updateError) { console.error('[MP] erro no UPDATE:', updateError); return null }
    const ret = { salaId: sala.id, novo: false }
    console.log('[MP] retornando (entrou em sala existente):', ret)
    return ret
  }
  const r = await criarSala(userId, modo, 'publica', turnosDesejados)
  const ret = { ...r, novo: true }
  console.log('[MP] sala criada:', ret)
  return ret
}

export async function definirAposta(salaId, userId, cartaId, ehJ1) {
  const campo = ehJ1 ? 'carta_aposta_j1' : 'carta_aposta_j2'
  await supabase.from('toptrumps_salas').update({ [campo]: cartaId }).eq('id', salaId)
}

export async function confirmarAposta(salaId, ehJ1) {
  const campo = ehJ1 ? 'aposta_confirmada_j1' : 'aposta_confirmada_j2'
  const { data: sala } = await supabase.from('toptrumps_salas').select('*').eq('id', salaId).single()
  await supabase.from('toptrumps_salas').update({ [campo]: true }).eq('id', salaId)
  const ambosConfirmaram = ehJ1 ? (sala.aposta_confirmada_j2 || false) : (sala.aposta_confirmada_j1 || false)
  if (ambosConfirmaram) {
    const total = Math.min(sala.turnos_j1 || 5, sala.turnos_j2 || 5)
    await supabase.from('toptrumps_salas').update({
      status: 'em_jogo', total_turnos: total, turno_atual: 1, jogador_da_vez: sala.jogador1_id
    }).eq('id', salaId)
  }
}

export async function registrarMovimento(salaId, userId, cartaId, atributo, foiIA = false) {
  const { data: sala } = await supabase.from('toptrumps_salas').select('turno_atual').eq('id', salaId).single()
  await supabase.from('toptrumps_movimentos').insert({
    sala_id: salaId, turno: sala.turno_atual, jogador_id: userId, carta_id: cartaId, atributo, foi_ia: foiIA
  })
}

export async function atualizarSala(salaId, updates) {
  await supabase.from('toptrumps_salas').update({ ...updates, atualizada_em: new Date().toISOString() }).eq('id', salaId)
}

export async function encerrarSala(salaId, vencedorId, perdedorId, modo, cartaApostaVencedor, cartaApostaPerdedor) {
  if (modo === 'apostado' && cartaApostaPerdedor) {
    console.log('[TTMP] transferindo carta', cartaApostaPerdedor, 'de', perdedorId, 'para', vencedorId)
    await supabase.from('toptrumps_decks').delete().eq('user_id', perdedorId).eq('carta_id', cartaApostaPerdedor)
    if (cartaApostaPerdedor) {
      await supabase.from('toptrumps_decks').insert({ user_id: vencedorId, carta_id: cartaApostaPerdedor })
    }
  }
  const resultado = vencedorId ? (vencedorId === perdedorId ? 'empate' : `${vencedorId === (await supabase.from('toptrumps_salas').select('jogador1_id').eq('id', salaId).single()).data?.jogador1_id ? 'j1_venceu' : 'j2_venceu'}`) : 'empate'
  await supabase.from('toptrumps_salas').update({ status: 'encerrada', resultado }).eq('id', salaId)
}

export async function verificarLimiteDiario(userId, tier) {
  const { data } = await supabase.from('toptrumps_mp_stats').select('partidas_hoje, partidas_hoje_data').eq('user_id', userId).maybeSingle()
  const hoje = new Date().toISOString().split('T')[0]
  const usadas = (data?.partidas_hoje_data === hoje) ? (data.partidas_hoje || 0) : 0
  const limite = LIMITES[tier] ?? 1
  return { pode: usadas < limite, usadas, limite }
}

export async function incrementarPartidaDiaria(userId) {
  const hoje = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('toptrumps_mp_stats').select('partidas_hoje, partidas_hoje_data').eq('user_id', userId).maybeSingle()
  const usadas = (data?.partidas_hoje_data === hoje) ? (data.partidas_hoje || 0) + 1 : 1
  await supabase.from('toptrumps_mp_stats').upsert({
    user_id: userId, partidas_hoje: usadas, partidas_hoje_data: hoje
  }, { onConflict: 'user_id' })
}

export async function carregarMPStats(userId) {
  const { data } = await supabase.from('toptrumps_mp_stats').select('*').eq('user_id', userId).maybeSingle()
  return data || { total_partidas: 0, total_vitorias: 0, total_derrotas: 0, total_empates: 0, streak_atual: 0, partidas_hoje: 0 }
}

export async function atualizarMPStats(userId, resultado) {
  const stats = await carregarMPStats(userId)
  const novoStreak = resultado === 'vitoria' ? (stats.streak_atual || 0) + 1 : 0
  await supabase.from('toptrumps_mp_stats').upsert({
    user_id: userId,
    total_partidas: (stats.total_partidas || 0) + 1,
    total_vitorias: (stats.total_vitorias || 0) + (resultado === 'vitoria' ? 1 : 0),
    total_derrotas: (stats.total_derrotas || 0) + (resultado === 'derrota' ? 1 : 0),
    total_empates: (stats.total_empates || 0) + (resultado === 'empate' ? 1 : 0),
    streak_atual: novoStreak,
    melhor_streak: Math.max(stats.melhor_streak || 0, novoStreak)
  }, { onConflict: 'user_id' })
}

export function subscribeToSala(salaId, callback) {
  console.log('[RT] subscribeToSala iniciado para sala:', salaId)
  return supabase.channel(`sala-${salaId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'toptrumps_salas', filter: `id=eq.${salaId}` }, (payload) => {
      console.log('[RT] evento recebido:', payload)
      callback(payload)
    })
    .subscribe((status) => {
      console.log('[RT] status do canal:', status)
    })
}

export function subscribeToMovimentos(salaId, callback) {
  return supabase.channel(`mov-${salaId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'toptrumps_movimentos', filter: `sala_id=eq.${salaId}` }, callback)
    .subscribe()
}
