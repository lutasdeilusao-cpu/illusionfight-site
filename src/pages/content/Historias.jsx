import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import Farol from '../../components/Farol/Farol'
import livroIndex from '../../data/livro-index.json'
import contosIndex from '../../data/contos-index.json'
import obras from '../../data/obras-index.json'
import heroBanner from '../../assets/images/banners/banner-01.webp'
import './Livro.css'
import './Contos.css'
import './Historias.css'

const assets = import.meta.glob('../../assets/obras/*/*.{webp,jpg,png}', { eager: true, import: 'default' })
const asset = (slug, file) => (file ? assets[`../../assets/obras/${slug}/${file}`] || null : null)

function HubCard({ to, img, selo, titulo, tag, peso, temas, meta, locked }) {
  return (
    <Link to={to} className={`hub-card${locked ? ' hub-card--locked' : ''}`}>
      <div className="hub-card__media">
        {img
          ? <img className="hub-card__img" src={img} alt="" loading="lazy" decoding="async" />
          : <div className={`hub-card__img hub-card__img--texto hub-card__img--${selo || 'ldi'}`}><span>{titulo}</span></div>}
      </div>
      <div className="hub-card__body">
        <span className="hub-card__titulo">{titulo}</span>
        {tag && <p className="hub-card__tag">{tag}</p>}
        {peso && <Farol peso={peso} temas={temas || []} size="sm" showTemas={false} />}
        <span className="hub-card__meta">{meta}</span>
      </div>
    </Link>
  )
}

export default function Historias() {
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const [ultimoLivro, setUltimoLivro] = useState(null)

  useEffect(() => {
    setUltimoLivro(localStorage.getItem('ldi-livro-ultimo'))
  }, [])

  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''
  const suf = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'

  const capsContagem = (n) => (n === 1 ? t('pages.historias.cap_1') : t('pages.historias.caps').replace('{n}', n))

  const contosLiberados = contosIndex.reduce(
    (acc, h) => acc + h.capitulos.filter(c => estaDisponivel(c, isAdmin, { user, perfil })).length, 0)
  const livroLiberados = livroIndex.filter(
    c => c.id === 'capitulo-01' || estaDisponivel(c, isAdmin, { user, perfil })).length

  return (
    <section className="livro-page historias-page">
      <Helmet>
        <title>{t('pages.historias.og_title')}</title>
        <meta name="description" content={t('pages.historias.og_desc')} />
        <meta property="og:title" content={t('pages.historias.og_title')} />
        <meta property="og:description" content={t('pages.historias.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/historias" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container">
        <h2 className="section-title">{t('pages.historias.titulo')}</h2>
        <p className="historias-intro">{t('pages.historias.intro')}</p>

        {/* ── Destaque ── */}
        <Link to="/historias/lutas-de-ilusao" className="historias-destaque">
          <img className="historias-destaque__bg" src={heroBanner} alt="" width="1258" height="768" loading="eager" decoding="async" />
          <div className="historias-destaque__overlay" />
          <div className="historias-destaque__text">
            <span className="historias-destaque__tag">{t('pages.historias.destaque')}</span>
            <span className="historias-destaque__titulo">{t('pages.contos.linha_principal')}</span>
            <span className="historias-destaque__uni">{t('pages.historias.secao_ldi')}</span>
            {ultimoLivro && <span className="historias-destaque__cta">{t('pages.livro.continuar_lendo')}</span>}
          </div>
        </Link>

        {/* ── Lutas de Ilusão ── */}
        <h3 className="historias-secao">{t('pages.historias.secao_ldi')}</h3>
        <p className="historias-secao__desc">{t('pages.historias.secao_ldi_desc')}</p>
        <div className="hub-row">
          <HubCard
            to="/historias/lutas-de-ilusao"
            selo="ldi"
            titulo={t('pages.contos.linha_principal')}
            tag={t('hero.slide1.subtitulo')}
            peso="pesada"
            meta={capsContagem(livroLiberados)}
          />
          <HubCard
            to="/historias/contos"
            selo="contos"
            titulo={t('pages.contos.linha_contos')}
            tag={t('pages.contos.descricao')}
            meta={capsContagem(contosLiberados)}
          />
        </div>

        {/* ── Outros universos ── */}
        <h3 className="historias-secao">{t('pages.historias.outras')}</h3>
        <p className="historias-secao__desc">{t('pages.historias.outras_desc')}</p>
        <div className="hub-row">
          {obras.map(o => {
            const liberados = o.capitulos.filter(c => estaDisponivel(c, isAdmin, { user, perfil })).length
            return (
              <HubCard
                key={o.id}
                to={`/historias/${o.id}`}
                img={asset(o.id, o.capa)}
                selo={o.selo}
                titulo={o[`titulo${sufT}`] || o.titulo}
                tag={o[`tagline${suf}`] || o.tagline_pt}
                peso={o.peso}
                temas={o.temas}
                meta={liberados > 0 ? capsContagem(liberados) : t('pages.livro.em_breve')}
                locked={liberados === 0}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
