import { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { creatorAtivo, diasDeCreator } from '../../lib/creator'
import { ADMIN_EMAILS } from '../../config/launch'

/** Estado do creator logado: tag, prazo, termos, interesses.
 *  Admin entra na área como creator (pra conferir a experiência). */
export function useCreator() {
  const { user, perfil, carregando, carregarPerfil } = useAuth()
  const [salvando, setSalvando] = useState(false)
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const ativo = creatorAtivo(perfil) || isAdmin
  const expirado = perfil?.is_creator === true && !creatorAtivo(perfil) && !isAdmin

  const gravar = useCallback(async campos => {
    if (!user) return false
    setSalvando(true)
    const { error } = await supabase.from('profiles').update(campos).eq('id', user.id)
    setSalvando(false)
    if (error) {
      console.error('[Creators] erro ao salvar perfil:', error.message)
      return false
    }
    await carregarPerfil?.(user.id)
    return true
  }, [user, carregarPerfil])

  const aceitarTermos = useCallback(() => gravar({ creator_termos_em: new Date().toISOString() }), [gravar])
  const salvarInteresses = useCallback(lista => gravar({ creator_interesses: lista }), [gravar])

  return {
    user,
    perfil,
    carregando,
    isAdmin,
    ativo,
    expirado,
    dias: isAdmin && !perfil?.is_creator ? null : diasDeCreator(perfil),
    aceitouTermos: Boolean(perfil?.creator_termos_em),
    interesses: perfil?.creator_interesses || [],
    salvando,
    aceitarTermos,
    salvarInteresses,
    carregarPerfil,
  }
}
