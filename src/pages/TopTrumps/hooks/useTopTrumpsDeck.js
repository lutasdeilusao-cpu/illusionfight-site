import { supabase } from '../../../lib/supabase'

const DECK_TYPES = ['deck_5', 'deck_10', 'deck_15', 'deck_20']
const DECK_SIZES = { deck_5: 5, deck_10: 10, deck_15: 15, deck_20: 20 }

/**
 * Carrega as cartas de um deck específico do usuário.
 */
export async function carregarDeckTipo(userId, deckType) {
  const { data } = await supabase
    .from('toptrumps_decks')
    .select('carta_id')
    .eq('user_id', userId)
    .eq('deck_type', deckType)
  if (!data) return []
  return data.map(d => {
    const n = Number(d.carta_id)
    return isNaN(n) ? d.carta_id : n
  })
}

/**
 * Salva um deck completo (substitui cartas existentes).
 * Remove duplicatas antes de salvar — cada carta só pode aparecer uma vez.
 */
export async function salvarDeckTipo(userId, deckType, cartaIds) {
  // Remove cartas antigas deste deck_type
  const { error: delErr } = await supabase
    .from('toptrumps_decks')
    .delete()
    .eq('user_id', userId)
    .eq('deck_type', deckType)
  if (delErr) { console.error('[DECK] Erro ao limpar deck:', delErr); return false }

  if (cartaIds.length === 0) return true

  // Garante IDs únicos antes de salvar
  const unicos = [...new Set(cartaIds)]

  const inserts = unicos.map(id => ({
    user_id: userId,
    carta_id: String(id),
    deck_type: deckType,
    deck_name: ''
  }))
  const { error: insErr } = await supabase
    .from('toptrumps_decks')
    .insert(inserts)
  if (insErr) { console.error('[DECK] Erro ao salvar deck:', insErr); return false }
  return true
}

/**
 * Carrega o nome personalizado de um deck.
 */
export async function carregarNomeDeck(userId, deckType) {
  const { data } = await supabase
    .from('toptrumps_deck_nomes')
    .select('nome')
    .eq('user_id', userId)
    .eq('deck_type', deckType)
    .single()
  return data?.nome || ''
}

/**
 * Salva o nome personalizado de um deck.
 */
export async function salvarNomeDeck(userId, deckType, nome) {
  const { error } = await supabase
    .from('toptrumps_deck_nomes')
    .upsert({ user_id: userId, deck_type: deckType, nome }, { onConflict: 'user_id,deck_type' })
  if (error) console.error('[DECK] Erro ao salvar nome:', error)
}

/**
 * Verifica se o usuário tem um deck completo para um determinado tamanho.
 */
export async function temDeckCompleto(userId, deckType) {
  const cartas = await carregarDeckTipo(userId, deckType)
  return cartas.length === DECK_SIZES[deckType]
}

/**
 * Retorna os decks que o usuário tem completos.
 */
export async function listarDecksCompletos(userId) {
  const resultados = {}
  for (const dt of DECK_TYPES) {
    const cartas = await carregarDeckTipo(userId, dt)
    if (cartas.length === DECK_SIZES[dt]) {
      const nome = await carregarNomeDeck(userId, dt)
      resultados[dt] = { size: DECK_SIZES[dt], cartas, nome }
    }
  }
  return resultados
}

export { DECK_TYPES, DECK_SIZES }
