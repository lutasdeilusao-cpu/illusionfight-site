import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { estaDisponivel } from '../config/site'
import { releaseDateFor, resolveAccessLevel } from '../lib/releaseAccess'
import { capituloTemConteudo, emBeta } from '../lib/webshard/catalogo'

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

/** Quem pode ler o quê no WEB SHARD. Mesma regra que o leitor antigo:
 *  admin lê tudo, capítulo `sempre_livre` é de todo mundo, capítulo em
 *  Beta (`beta_ate`) é de todo mundo até a data, o resto
 *  segue a cascata de liberação por data (config/site.js). */
export function useWebshardAcesso() {
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const nivel = resolveAccessLevel(user, perfil)

  // Liberado pela regra normal, ignorando o passe de admin.
  const liberadoSemAdmin = useCallback(cap => {
    if (!capituloTemConteudo(cap)) return false
    return Boolean(cap.sempre_livre) || emBeta(cap) || TRIAL_ACTIVE || estaDisponivel(cap, false, { user, perfil })
  }, [user, perfil])

  const liberado = useCallback(cap => (
    capituloTemConteudo(cap) && (isAdmin || liberadoSemAdmin(cap))
  ), [isAdmin, liberadoSemAdmin])

  /** Admin lendo algo que o resto ainda não vê — pinta o selo PRÉVIA. */
  const previa = useCallback(cap => isAdmin && capituloTemConteudo(cap) && !liberadoSemAdmin(cap), [isAdmin, liberadoSemAdmin])

  /** Quando o capítulo libera PRA ESTE visitante (cascata assinante/conta/
   *  público do calendário oficial). */
  const dataPara = useCallback(cap => releaseDateFor(cap, resolveAccessLevel(user, perfil)), [user, perfil])

  return { isAdmin, nivel, liberado, previa, dataPara }
}
