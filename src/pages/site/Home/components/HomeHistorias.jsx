import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useScrollReveal } from '../../../../hooks/useScrollReveal'
import { estaDisponivel, contoLiberado } from '../../../../config/site'
import { ADMIN_EMAILS } from '../../../../config/launch'
import livroIndex from '../../../../data/historias/lutas-de-ilusao.json'
import contosIndex from '../../../../data/historias/contos.json'
import capaContos from '../../../../assets/images/contos/capa-illusion-tales.webp'
import HomeSectionHeading from './HomeSectionHeading'
import './HomeHistorias.css'

const capas = import.meta.glob('../../../../assets/images/livro/capitulo-*', { eager: true, import: 'default', query: '?url' })
const capaDe = id => Object.entries(capas).find(([caminho]) => caminho.includes(`/${id}.`))?.[1] || null

/** Histórias na Home: os Contos de Ilusão com a capa oficial e a lista dos
 *  contos que existem, e os capítulos da linha principal JÁ liberados (com
 *  capa). Nada de "Coming soon" repetido — só o que dá pra ler agora. */
export default function HomeHistorias() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const ref = useScrollReveal()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const auth = { user, perfil }
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  const contos = contosIndex.filter(c => (c.capitulos || []).some(cap => contoLiberado(cap, isAdmin, auth)))
  const capitulos = livroIndex
    .filter(c => (c.id === 'capitulo-01' || estaDisponivel(c, isAdmin, auth)) && capaDe(c.id))
    .sort((a, b) => a.numero - b.numero) // do 1 pro último: ainda não lançamos, quem chega começa do começo
    .slice(0, 8)

  return (
    <section ref={ref} className="home-historias reveal">
      <div className="container">
        <HomeSectionHeading eyebrow={t('home.nova.historias_eyebrow')} title={t('home.nova.historias_titulo')} />

        <Link to="/historias/contos" className="home-historias__contos">
          <img src={capaContos} alt={t('pages.contos.linha_contos')} width="960" height="1334" loading="lazy" decoding="async" />
          <div className="home-historias__contos-info">
            <span className="home-historias__selo">{t('home.nova.contos_selo', { n: contos.length })}</span>
            <p>{t('home.nova.contos_texto')}</p>
          </div>
        </Link>

        <ol className="home-historias__lista">
          {contos.map(c => (
            <li key={c.id}>
              <Link to={`/historias/contos/${c.id}`}>
                <span className="home-historias__num">{c.id}</span>
                <strong>{c[tituloKey] || c.titulo}</strong>
                <small>{t('home.nova.caps', { n: c.capitulos.length })}</small>
              </Link>
            </li>
          ))}
        </ol>

        {capitulos.length > 0 && (
          <>
            <h3 className="home-historias__sub">{t('home.nova.livro_titulo')}</h3>
            <div className="home-historias__trilho">
              {capitulos.map(c => (
                <Link key={c.id} to={`/historias/lutas-de-ilusao/${c.id}`} className="home-historias__cap">
                  <img src={capaDe(c.id)} alt="" loading="lazy" decoding="async" />
                  <span>{String(c.numero).padStart(2, '0')}</span>
                  <strong>{c[tituloKey]}</strong>
                </Link>
              ))}
            </div>
          </>
        )}

        <Link to="/historias" className="home-historias__todos">{t('home.nova.historias_todas')} →</Link>
      </div>
    </section>
  )
}
