import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { carregarDeck as carregarDeckDB, substituirDeck, salvarCartasDeck } from '../../../../hooks/useLeaderboardDB'

const DECK_TYPES = ['deck_5', 'deck_10', 'deck_15', 'deck_20']
const DECK_SIZES = { deck_5: 5, deck_10: 10, deck_15: 15, deck_20: 20 }

export async function carregarDeckTipo(userId, deckType) {
  const { data } = await supabase
    .from('toptrumps_decks')
    .select('carta_id')
    .eq('user_id', userId)
    .eq('deck_type', deckType)
  if (!data) return []
  return data.map(d => { const n = Number(d.carta_id); return isNaN(n) ? d.carta_id : n })
}

export async function salvarDeckTipo(userId, deckType, cartaIds) {
  if (cartaIds.length === 0) return true
  const unicos = [...new Set(cartaIds)]
  for (const id of unicos) {
    await supabase.from('toptrumps_decks').delete().eq('user_id', userId).eq('carta_id', String(id))
  }
  const inserts = unicos.map(id => ({ user_id: userId, carta_id: String(id), deck_type: deckType, deck_name: '' }))
  const { error: insErr } = await supabase.from('toptrumps_decks').insert(inserts)
  if (insErr) { console.error('[DECK] Erro ao salvar deck:', insErr); return false }
  return true
}

export async function carregarNomeDeck(userId, deckType) {
  const { data } = await supabase.from('toptrumps_deck_nomes').select('nome').eq('user_id', userId).eq('deck_type', deckType).single()
  return data?.nome || ''
}

export async function salvarNomeDeck(userId, deckType, nome) {
  const { error } = await supabase.from('toptrumps_deck_nomes').upsert({ user_id: userId, deck_type: deckType, nome }, { onConflict: 'user_id,deck_type' })
  if (error) console.error('[DECK] Erro ao salvar nome:', error)
}

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

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useTopTrumpsDeck({ user, perfil, todasCartas }) {
  const [deckUsuario, setDeckUsuario] = useState([])

  useEffect(() => {
    if (!user) return
    carregarDeckDB(user.id).then(ids => {
      const idsUnicos = [...new Set(ids || [])]
      let cartas = idsUnicos.map(id => todasCartas.find(c => c.id === id)).filter(Boolean)
      if (idsUnicos.length > 0 && cartas.length < 5) {
        const novas = embaralhar([...todasCartas]).slice(0, 5)
        substituirDeck(user.id, novas.map(c => c.id)).then(() => { setDeckUsuario(novas) })
        return
      }
      setDeckUsuario(cartas)
      if (perfil?.role === 'admin' || perfil?.is_admin) {
        const idsTem = new Set(idsUnicos.map(id => Number(id)))
        const todosIds = todasCartas.map(c => c.id)
        const faltando = todosIds.filter(n => !idsTem.has(n))
        if (faltando.length > 0) salvarCartasDeck(user.id, faltando)
      }
    })
  }, [user])

  useEffect(() => {
    if (user) return
    if (deckUsuario.length === 0) setDeckUsuario(embaralhar([...todasCartas]).slice(0, 5))
  }, [user])

  return { deckUsuario, setDeckUsuario }
}
