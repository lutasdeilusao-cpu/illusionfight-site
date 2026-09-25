import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { contoLiberado, estaDisponivel } from '../config/site'
import { releaseDateFor, resolveAccessLevel } from '../lib/releaseAccess'

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

/** Quem pode ler o quê em Histórias — espelho do useWebshardAcesso.
 *  Admin lê tudo; o Cap. 01 da linha principal é sempre aberto; contos
 *  seguem a Beta (BETA_CONTOS_PUBLICO); o resto é a cascata por data. */
export function useHistoriasAcesso() {
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const nivel = resolveAccessLevel(user, perfil)

  const liberadoSemAdmin = useCallback((historia, cap) => {
    if (historia.sempreLivre?.(cap) || TRIAL_ACTIVE) return true
    if (historia.tipo === 'conto') return contoLiberado(cap, false, { user, perfil })
    return estaDisponivel(cap, false, { user, perfil })
  }, [user, perfil])

  const liberado = useCallback((historia, cap) => (
    isAdmin || liberadoSemAdmin(historia, cap)
  ), [isAdmin, liberadoSemAdmin])

  /** Admin lendo algo que o resto ainda não vê — selo PRÉVIA. */
  const previa = useCallback((historia, cap) => isAdmin && !liberadoSemAdmin(historia, cap), [isAdmin, liberadoSemAdmin])

  const dataPara = useCallback(cap => releaseDateFor(cap, nivel), [nivel])

  return { isAdmin, nivel, liberado, previa, dataPara }
}
