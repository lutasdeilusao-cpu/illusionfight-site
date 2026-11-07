import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { trackEvent } from '../../../../lib/analytics'
import banner01 from '../../../../assets/images/banners/banner-01.webp'
import banner02 from '../../../../assets/images/banners/banner-02.webp'
import banner03 from '../../../../assets/images/banners/banner-03.webp'
import banner04 from '../../../../assets/images/banners/banner-04.webp'
import './EscolhaCaminho.css'

/* Inicial do celular: quatro caminhos num carrossel de um dedo.
   A pessoa escolhe o que quer e entra direto na área. */
const CAMINHOS = [
  { key: 'quadrinhos', arte: banner02, rota: '/webtoon' },
  { key: 'jogos', arte: banner03, rota: '/games' },
  { key: 'historias', arte: banner01, rota: '/historias' },
  { key: 'musicas', arte: banner04, rota: '/musicas' },
]

export default function EscolhaCaminho() {
  const { t } = useLanguage()
  const trilhoRef = useRef(null)
  const [ativo, setAtivo] = useState(0)

  const aoRolar = () => {
    const el = trilhoRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== ativo) setAtivo(i)
  }

  const irPara = (i) => {
    const el = trilhoRef.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section className="caminho">
      <header className="caminho__topo">
        <span className="caminho__eyebrow">{t('home.caminho.eyebrow')}</span>
        <h1 className="caminho__titulo">{t('home.caminho.titulo')}</h1>
      </header>

      <div className="caminho__trilho" ref={trilhoRef} onScroll={aoRolar}>
        {CAMINHOS.map((c, i) => (
          <Link
            key={c.key}
            to={c.rota}
            className="caminho__card"
            onClick={() => trackEvent('home_caminho', { caminho: c.key })}
          >
            <img className="caminho__arte" src={c.arte} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
            <div className="caminho__info">
              <span className="caminho__num">0{i + 1}</span>
              <h2 className="caminho__nome">{t(`home.caminho.${c.key}.nome`)}</h2>
              <p className="caminho__desc">{t(`home.caminho.${c.key}.desc`)}</p>
              <span className="caminho__cta">{t('home.caminho.entrar')}</span>
            </div>
          </Link>
        ))}
      </div>

      <nav className="caminho__pontos" aria-label={t('home.caminho.titulo')}>
        {CAMINHOS.map((c, i) => (
          <button
            key={c.key}
            type="button"
            className={`caminho__ponto${i === ativo ? ' is-ativo' : ''}`}
            onClick={() => irPara(i)}
          >
            {t(`home.caminho.${c.key}.nome`)}
          </button>
        ))}
      </nav>
    </section>
  )
}
