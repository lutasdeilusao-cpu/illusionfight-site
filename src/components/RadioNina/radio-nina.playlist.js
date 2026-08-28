import { supabase } from '../../lib/supabase'

/** Carrega a playlist salva do usuário. Retorna array de nomes de arquivo (.mp3). */
export async function carregarPlaylistSalva(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('radio_nina_playlists')
    .select('faixas')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return []
  return Array.isArray(data.faixas) ? data.faixas : []
}

/** Salva (upsert) a playlist do usuário. */
export async function salvarPlaylistSalva(userId, faixas) {
  if (!userId) return false
  const { error } = await supabase
    .from('radio_nina_playlists')
    .upsert({ user_id: userId, faixas, atualizada_em: new Date().toISOString() }, { onConflict: 'user_id' })
  return !error
}
