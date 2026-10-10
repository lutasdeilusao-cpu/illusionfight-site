import { supabase } from './supabase'

/** Convite de creator: o link /creators?convite=CODIGO guarda o código no
 *  navegador; no próximo login (ou cadastro) a conta resgata o convite e
 *  vira creator (RPC creator_resgatar_convite, migration 053). */
const CHAVE = 'ldi-creator-convite'

export const LINK_CONVITE = codigo => `https://illusionfight.com/pt/creators?convite=${codigo}`

export function guardarConvite(codigo) {
  try { localStorage.setItem(CHAVE, codigo) } catch { /* sem storage */ }
}

export function conviteGuardado() {
  try { return localStorage.getItem(CHAVE) } catch { return null }
}

/** Resgata o convite guardado pra conta logada. Some do navegador quando o
 *  servidor responde (deu certo ou o código não serve mais). */
export async function resgatarConvite() {
  const codigo = conviteGuardado()
  if (!codigo) return false
  const { data, error } = await supabase.rpc('creator_resgatar_convite', { p_codigo: codigo })
  if (error) {
    console.error('[Creators] resgate do convite falhou:', error.message)
    return false
  }
  try { localStorage.removeItem(CHAVE) } catch { /* sem storage */ }
  console.log('[Creators] convite resgatado', data)
  return data?.ok === true
}

/** Pra onde o login leva: quem chegou por convite vai direto pra área. */
export const destinoPosLogin = () => (conviteGuardado() ? '/creators' : '/perfil')
