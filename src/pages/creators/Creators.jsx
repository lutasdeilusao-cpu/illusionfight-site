import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useCreator } from './useCreator'
import { trackEvent } from '../../lib/analytics'
import { guardarConvite, conviteGuardado, resgatarConvite } from '../../lib/creatorConvite'
import CreatorsPorta from './components/CreatorsPorta'
import CreatorsBoasVindas from './components/CreatorsBoasVindas'
import CreatorsSalao from './components/CreatorsSalao'
import './Creators.css'

/** Área Creator (/creators): porta com login → termos e interesses na
 *  primeira visita → salão, onde a NeoGuide serve o universo. */
export default function Creators() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const cr = useCreator()
  const [params] = useSearchParams()
  const [convite, setConvite] = useState(() => conviteGuardado())
  const [resgatando, setResgatando] = useState(false)

  // Link de convite: guarda o código e conta a abertura no painel.
  useEffect(() => {
    const codigo = params.get('convite')
    if (!codigo) return
    guardarConvite(codigo)
    setConvite(codigo)
    trackEvent('creator_convite_aberto', { convite: codigo })
  }, [params])

  // Logado e ainda sem a tag, com convite guardado: resgata e recarrega o perfil.
  const { user, perfil, ativo, carregarPerfil } = cr
  useEffect(() => {
    if (!user || !perfil || ativo || !convite || resgatando) return
    setResgatando(true)
    resgatarConvite()
      .then(() => carregarPerfil?.(user.id))
      .finally(() => { setConvite(conviteGuardado()); setResgatando(false) })
  }, [user, perfil, ativo, convite, resgatando, carregarPerfil])

  useEffect(() => {
    console.log('[Creators] área aberta', { creator: cr.ativo, termos: cr.aceitouTermos })
  }, [cr.ativo, cr.aceitouTermos])

  const nome = (cr.perfil?.nome || cr.user?.email?.split('@')[0] || '').split(' ')[0]
  const precisaBoasVindas = cr.ativo && (!cr.aceitouTermos || cr.interesses.length === 0)

  let conteudo
  if (cr.carregando || (cr.user && !cr.perfil) || resgatando) conteudo = <div className="cr-carregando" aria-hidden="true" />
  else if (!cr.user) conteudo = <CreatorsPorta convite={Boolean(convite)} />
  else if (!cr.ativo) conteudo = <CreatorsPorta modo={cr.expirado ? 'expirado' : 'sem_convite'} email={cr.user.email} onSair={logout} />
  else if (precisaBoasVindas) {
    conteudo = (
      <CreatorsBoasVindas
        nome={nome}
        aceitouTermos={cr.aceitouTermos}
        interessesIniciais={cr.interesses}
        salvando={cr.salvando}
        onAceitar={cr.aceitarTermos}
        onInteresses={cr.salvarInteresses}
      />
    )
  } else conteudo = <CreatorsSalao nome={nome} dias={cr.dias} interesses={cr.interesses} />

  return (
    <div className="cr-page">
      <Helmet>
        <title>{t('creators.meta.titulo')}</title>
        <meta name="description" content={t('creators.meta.desc')} />
        <meta name="robots" content="noindex" />
      </Helmet>
      {conteudo}
    </div>
  )
}
