import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useCreator } from './useCreator'
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

  useEffect(() => {
    console.log('[Creators] área aberta', { creator: cr.ativo, termos: cr.aceitouTermos })
  }, [cr.ativo, cr.aceitouTermos])

  const nome = (cr.perfil?.nome || cr.user?.email?.split('@')[0] || '').split(' ')[0]
  const precisaBoasVindas = cr.ativo && (!cr.aceitouTermos || cr.interesses.length === 0)

  let conteudo
  if (cr.carregando || (cr.user && !cr.perfil)) conteudo = <div className="cr-carregando" aria-hidden="true" />
  else if (!cr.user) conteudo = <CreatorsPorta />
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
