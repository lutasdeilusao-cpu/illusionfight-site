import { supabase } from './supabase'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function ensureUserProfile(user, fallback = {}, attempt = 0) {
  if (!user?.id) return { profile: null, created: false, error: null }

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

  if (error?.code === '23503' && attempt < 4) {
    await wait(300 * (2 ** attempt))
    return ensureUserProfile(user, fallback, attempt + 1)
  }

  return { profile: data || profile, created: !error && Boolean(data), error }
}
