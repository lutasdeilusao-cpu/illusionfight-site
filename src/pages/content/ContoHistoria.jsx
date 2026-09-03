import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { contoLiberado } from '../../config/site'
import Farol from '../../components/Farol/Farol'
import CapCard from '../../components/CapCard/CapCard'
import index from '../../data/contos-index.json'
import './Livro.css'
import './Contos.css'

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

export default function ContoHistoria() {
  const { historia } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  const h = index.find(x => x.id === historia)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  if (!h) {
    return (
      <section className="livro-page">
        <div className="container">
          <p className="livro-capitulo__erro">{t('pages.livro.nao_encontrado')}</p>
          <button className="livro-capitulo__back" onClick={() => navigate('/historias/contos')}>
            {t('pages.livro.voltar_indice')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="livro-page">
      <Helmet>
        <title>{h[tituloKey]} — {t('pages.contos.linha_contos')}</title>
        <meta name="description" content={h[locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt']} />
      </Helmet>
      <div className="container">
        <nav className="livro-linhas">
          <Link to="/historias" className="livro-linha">{t('pages.historias.titulo')}</Link>
          <Link to="/historias/lutas-de-ilusao" className="livro-linha">{t('pages.contos.linha_principal')}</Link>
          <Link to="/historias/contos" className="livro-linha">{t('pages.contos.linha_contos')}</Link>
        </nav>

        <button className="livro-capitulo__back" onClick={() => navigate('/historias/contos')}>
          {t('pages.livro.voltar_indice')}
        </button>
        <div className="contos-hero">
          <div className="contos-hero__text">
            <h2 className="section-title">{h[tituloKey]}</h2>
            <p className="contos-hero__desc">
              {h[locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt']}
            </p>
            <Farol peso={h.peso} canon={h.canon} temas={h.temas || []} />
            <p className="contos-hero__aviso">{t(`pages.contos.peso_${h.peso}_desc`)}</p>
          </div>
        </div>

        <div className="cap-list">
          {h.capitulos.map(cap => {
            const liberado = contoLiberado(cap, isAdmin, { user, perfil })
            const resumoKey = locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt'
            return (
              <CapCard
                key={cap.id}
                to={`/historias/contos/${h.id}/${cap.id}`}
                liberado={liberado}
                releaseItem={cap}
                rotulo={`${t('pages.contos.cap')} ${String(cap.numero).padStart(2, '0')}`}
                titulo={cap[tituloKey]}
                resumo={cap[resumoKey] || cap.resumo_pt || ''}
                meta={liberado && cap.data_publicacao ? formatarData(cap.data_publicacao) : ''}
                badge={t('pages.livro.em_breve')}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
