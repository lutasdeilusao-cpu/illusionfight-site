import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useHistoriasAcesso } from '../../hooks/useHistoriasAcesso'
import { historiasDoAutor } from '../../lib/historias/catalogo'
import { localizado } from '../../lib/webshard/catalogo'
import HistoriaCapLinha from '../content/historias/HistoriaCapLinha'
import './Autor.css'

/** /autor: a porta de entrada das Histórias do Autor. Os capítulos em
 *  primeira pessoa vêm primeiro; o resumo da trajetória fica embaixo. */
export default function Autor() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const { nivel, liberado, previa, dataPara } = useHistoriasAcesso()
  const historia = historiasDoAutor()
  const blocks = t('autor.blocks')
  const primeiroAberto = historia.capitulos.find(c => liberado(historia, c))

  return (
    <>
      <Helmet>
        <title>{t('pages.autor.meta_titulo')}</title>
        <meta name="description" content={t('pages.autor.meta_desc')} />
        <meta property="og:title" content={t('pages.autor.meta_titulo')} />
        <meta property="og:description" content={t('pages.autor.meta_desc')} />
        <meta property="og:url" content="https://illusionfight.com/autor" />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="autor">
        <div className="container">
          <h1 className="autor__byline">
            <span className="autor__byline-prefix">{t('pages.autor.by')}</span>
            <span className="autor__byline-name">{t('pages.autor.name')}</span>
          </h1>
          <p className="autor__intro">{t('pages.autor.intro')}</p>

          <div className="autor__capa" style={{ '--ws-cor': historia.cor }}>
            <img src={historia.capa} alt="" decoding="async" />
            <div className="autor__capa-texto">
              <span className="if-eyebrow">{t('pages.historias.autor_eyebrow')}</span>
              <h2>{localizado(historia, 'nome', locale)}</h2>
              <p>{localizado(historia, 'tagline', locale)}</p>
            </div>
          </div>

          <div className="autor__acoes">
            {primeiroAberto && (
              <Link to={historia.rotaCap(primeiroAberto)} className="if-btn if-btn--primary">{t('pages.autor.ler_primeiro')}</Link>
            )}
            <Link to={historia.rota} className="if-btn if-btn--ghost">{t('pages.autor.ver_todos')}</Link>
          </div>

          {historia.capitulos.length === 0 && <p className="autor__em-breve">{t('pages.autor.em_breve')}</p>}
          <div className="autor__capitulos">
            {historia.capitulos.map(cap => (
              <HistoriaCapLinha
                key={cap.id}
                historia={historia}
                cap={cap}
                liberado={liberado(historia, cap)}
                previa={previa(historia, cap)}
                data={dataPara(cap)}
                nivel={nivel}
              />
            ))}
          </div>

          <span className="if-eyebrow autor__curta-eyebrow">{t('pages.autor.versao_curta')}</span>
          <div className="autor__blocks">
            {Array.isArray(blocks) && blocks.map((text, i) => (
              <p key={i} className="autor__block">{text}</p>
            ))}
          </div>

          <button type="button" className="if-btn if-btn--amber autor__cta" onClick={() => navigate('/assinar')}>
            {t('autor.cta')}
          </button>
        </div>
      </section>
    </>
  )
}
