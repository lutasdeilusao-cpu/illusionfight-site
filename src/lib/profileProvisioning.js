import { supabase } from './supabase'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Garante que o perfil do usuário existe. Rede de segurança: o normal é
 * a trigger `handle_new_auth_user` já ter criado a linha. Esta função
 * NUNCA lança — qualquer falha volta como `{ error }` e o chamador segue.
 *
 * @returns {Promise<{ profile: object|null, created: boolean, error: any }>}
 */
export async function ensureUserProfile(user, fallback = {}, attempt = 0) {
  if (!user?.id) return { profile: null, created: false, error: null }

  try {
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (selectError) return { profile: null, created: false, error: selectError }
    if (existing) return { profile: existing, created: false, error: null }

    const metadata = user.user_metadata || {}
    const profile = {
      id: user.id,
      nome: fallback.nome || metadata.nome || user.email?.split('@')[0] || 'Jogador',
      telefone: '',
    }
    const countryCode = fallback.pais || metadata.pais
    if (countryCode) profile.country_code = countryCode

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id', ignoreDuplicates: true })
      .select()
      .maybeSingle()

    // 23503 = FK ainda não visível (trigger em corrida); 42501/PGRST = RLS
    // ou a linha já existe e o SELECT pós-upsert não retorna. Nos dois casos
    // vale reconsultar: a trigger provavelmente já resolveu.
    if (error && attempt < 4) {
      await wait(300 * (2 ** attempt))
      return ensureUserProfile(user, fallback, attempt + 1)
    }

    if (error) {
      // Última tentativa: a linha pode existir mesmo com o upsert reclamando.
      const { data: recheck } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (recheck) return { profile: recheck, created: false, error: null }
      return { profile: profile, created: false, error }
    }

    return { profile: data || profile, created: Boolean(data), error: null }
  } catch (err) {
    return { profile: null, created: false, error: err }
  }
}
