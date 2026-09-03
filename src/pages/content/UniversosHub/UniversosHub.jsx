import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import universos from '../../../data/universo-index.json'
import './UniversosHub.css'

// Duas pastas só — glob largo em assets/ arrastaria as centenas de cartas
// de personagem para dentro do bundle.
const artes = import.meta.glob(
  ['../../../assets/obras/*/*.{webp,jpg,png}', '../../../assets/images/banners/*.{webp,png}'],
  { eager: true, import: 'default' }
)
const arteDe = caminho => (caminho ? artes[`../../../assets/${caminho}`] || null : null)

/** Revela o portão quando ele entra na tela, em vez de animar tudo de uma vez
 *  no mount — o que faria a animação acontecer fora da vista do leitor. */
function useRevelar() {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setVisivel(true); return }
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) { setVisivel(true); obs.disconnect() }
      },
      { rootMargin: '0px 0px -12% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, visivel]
}

function Portao({ universo, indice, textos }) {
  const [ref, visivel] = useRevelar()
  const { titulo, subtitulo, secoes, capa, destaque } = universo

  return (
    <Link
      ref={ref}
      to={universo.rota || `/universos/${universo.id}`}
      className={`portao${destaque ? ' portao--origem' : ''}${visivel ? ' is-visivel' : ''}`}
      data-uni={universo.id}
      aria-label={`${titulo} — ${textos.entrar}`}
    >
      {/* Céu do universo: gradientes à deriva, puro CSS. */}
      <span className="portao__ceu" aria-hidden="true" />
      {capa && <img className="portao__capa" src={capa} alt="" loading="lazy" decoding="async" />}
      <span className="portao__veu" aria-hidden="true" />

      <span className="portao__corpo">
        <span className="portao__topo">
          <span className="portao__indice">{String(indice + 1).padStart(2, '0')}</span>
          {destaque && <span className="portao__selo">{textos.origem}</span>}
        </span>

        <span className="portao__titulo">{titulo}</span>
        <span className="portao__sub">{subtitulo}</span>

        {secoes?.length > 0 && (
          <span className="portao__secoes">
            {secoes.slice(0, destaque ? 5 : 3).map(s => (
              <span key={s.id} className="portao__chip">{s.titulo}</span>
            ))}
            {secoes.length > (destaque ? 5 : 3) && (
              <span className="portao__chip portao__chip--mais">
                +{secoes.length - (destaque ? 5 : 3)}
              </span>
            )}
          </span>
        )}

        <span className="portao__rodape">
          <span className="portao__idiomas">
            {(universo.idiomas || ['pt']).map(l => (
              <span key={l} className="portao__idioma">{l}</span>
            ))}
          </span>
          <span className="portao__entrar">{textos.entrar}</span>
        </span>
      </span>
    </Link>
  )
}

export default function UniversosHub() {
  const { locale, t } = useLanguage()
  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''
  const sufS = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'

  const textos = {
    entrar: t('pages.mundoHub.entrar'),
    origem: t('pages.mundoHub.origem'),
  }

  // Traduz uma vez aqui; o portão só recebe texto pronto.
  const lista = universos.map(u => ({
    ...u,
    titulo: u[`titulo${sufT}`] || u.titulo,
    subtitulo: u[`subtitulo${sufS}`] || u.subtitulo_pt,
    capa: arteDe(u.arte),
    secoes: (u.secoes || []).map(s => ({ ...s, titulo: s[`titulo${sufT}`] || s.titulo })),
  }))

  const origem = lista.filter(u => u.destaque)
  const demais = lista.filter(u => !u.destaque)

  return (
    <div className="universos-hub">
      <Helmet>
        <title>{t('pages.mundoHub.og_title')}</title>
        <meta name="description" content={t('pages.mundoHub.og_desc')} />
        <meta property="og:title" content={t('pages.mundoHub.og_title')} />
        <meta property="og:description" content={t('pages.mundoHub.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/universos" />
        <meta property="og:type" content="website" />
      </Helmet>

      <header className="universos-hub__head">
        <span className="if-eyebrow">IF // UNIVERSOS</span>
        <h1 className="universos-hub__titulo">{t('pages.mundoHub.titulo')}</h1>
        <p className="universos-hub__intro">{t('pages.mundoHub.intro')}</p>
      </header>

      <div className="universos-hub__lista">
        {origem.map((u, i) => (
          <Portao key={u.id} universo={u} indice={i} textos={textos} />
        ))}

        {demais.length > 0 && (
          <div className="universos-hub__divisor">
            <span>{t('pages.mundoHub.outros')}</span>
          </div>
        )}

        {demais.map((u, i) => (
          <Portao key={u.id} universo={u} indice={origem.length + i} textos={textos} />
        ))}
      </div>
    </div>
  )
}
