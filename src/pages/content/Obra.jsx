import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import Farol from '../../components/Farol/Farol'
import CapCard from '../../components/CapCard/CapCard'
import obras from '../../data/obras-index.json'
import './Livro.css'
import './Contos.css'
import './Obra.css'

const assets = import.meta.glob('../../assets/obras/*/*.{webp,jpg,png}', { eager: true, import: 'default' })
const asset = (slug, file) => (file ? assets[`../../assets/obras/${slug}/${file}`] || null : null)

export default function Obra() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  const obra = obras.find(o => o.id === slug)
  const suf = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'
  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''

  if (!obra) {
    return (
      <section className="livro-page">
        <div className="container">
          <p className="livro-capitulo__erro">{t('pages.obra.nao_encontrado')}</p>
          <button className="livro-capitulo__back" onClick={() => navigate('/historias')}>
            {t('pages.obra.voltar')}
          </button>
        </div>
      </section>
    )
  }

  const titulo = obra[`titulo${sufT}`] || obra.titulo
  const saga = obra[`saga${suf}`] || obra.saga_pt
  const tagline = obra[`tagline${suf}`] || obra.tagline_pt
  const resumo = obra[`resumo${suf}`] || obra.resumo_pt
  const universo = obra[`universo${suf}`] || obra.universo_pt
  const capaImg = asset(obra.id, obra.capa)

  const capsLiberados = obra.capitulos.filter(c => estaDisponivel(c, isAdmin, { user, perfil }))
  const temTravado = capsLiberados.length < obra.capitulos.length
  const soPt = (obra.idiomas || ['pt']).length === 1 && (obra.idiomas || ['pt'])[0] === 'pt'

  return (
    <section className="livro-page obra-page">
      <Helmet>
        <title>{titulo} — {t('pages.historias.titulo')}</title>
        <meta name="description" content={resumo} />
        <meta property="og:title" content={`${titulo} — Illusion Fight`} />
        <meta property="og:description" content={resumo} />
        <meta property="og:url" content={`https://illusionfight.com/historias/${obra.id}`} />
      </Helmet>

      <div className="container">
        <nav className="livro-linhas">
          <Link to="/historias" className="livro-linha">{t('pages.historias.titulo')}</Link>
          <span className="livro-linha livro-linha--ativa">{titulo}</span>
        </nav>

        <button className="livro-capitulo__back" onClick={() => navigate('/historias')}>
          {t('pages.obra.voltar')}
        </button>

        <header className="obra-hero">
          {capaImg
            ? <img className="obra-hero__capa" src={capaImg} alt={titulo} width="220" height="330" loading="eager" decoding="async" />
            : <div className={`obra-hero__capa obra-hero__capa--texto obra-hero__capa--${obra.selo || 'default'}`}><span>{titulo}</span></div>}

          <div className="obra-hero__info">
            <span className="obra-hero__saga">{saga}</span>
            <h1 className="obra-hero__titulo">{titulo}</h1>
            <p className="obra-hero__autor">{t('pages.obra.por')} {obra.autor}</p>
            <p className="obra-hero__tagline">{tagline}</p>
            <div className="obra-hero__badges">
              {obra.selo === 'dark-fantasy' && <span className="obra-selo">{t('pages.obra.selo_dark_fantasy')}</span>}
              <Farol peso={obra.peso} temas={obra.temas || []} size="sm" />
            </div>
          </div>
        </header>

        <p className="obra-resumo">{resumo}</p>

        {universo && (
          <div className="obra-universo">
            <p className="obra-universo__label">{t('pages.obra.sobre_universo')}</p>
            <p className="obra-universo__texto">{universo}</p>
          </div>
        )}

        <h2 className="section-title obra-caps-titulo">{t('pages.obra.capitulos')}</h2>

        {temTravado && (
          <p className="contos-hero__aviso obra-aviso">{t('pages.obra.em_breve_aviso')}</p>
        )}
        {soPt && locale !== 'pt' && (
          <p className="contos-hero__aviso obra-aviso">{t('pages.obra.idioma_unico')}</p>
        )}

        <div className="cap-list">
          {obra.capitulos.map((cap, i) => {
            const liberado = estaDisponivel(cap, isAdmin, { user, perfil })
            const capTitulo = cap[`titulo${sufT}`] || cap.titulo
            const capResumo = cap[`resumo${suf}`] || cap.resumo_pt || ''
            return (
              <CapCard
                key={cap.id}
                to={`/historias/${obra.id}/${cap.id}`}
                liberado={liberado}
                releaseItem={cap}
                img={asset(obra.id, (obra.galeria || [])[i])}
                rotulo={cap.numero > 0 ? `${t('pages.livro.cap')} ${String(cap.numero).padStart(2, '0')}` : ''}
                titulo={capTitulo}
                resumo={capResumo}
                meta=""
                badge={t('pages.livro.em_breve')}
              />
            )
          })}
        </div>

        {obra.amazon && (
          <a className="obra-amazon" href={obra.amazon} target="_blank" rel="noopener noreferrer">
            {t('pages.obra.amazon')}
          </a>
        )}
      </div>
    </section>
  )
}
