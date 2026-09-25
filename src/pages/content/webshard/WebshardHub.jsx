import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useWebshardAcesso } from '../../../hooks/useWebshardAcesso'
import {
  capitulosDe, capituloTemConteudo, listarTitulos, localizado, numeroCapitulo, rotaCapitulo, rotaTitulo, tituloPorSlug,
} from '../../../lib/webshard/catalogo'
import { lerProgresso, ultimoProgresso } from '../../../lib/webshard/progresso'
import { trackEvent } from '../../../lib/analytics'
import TituloHero from './components/TituloHero'
import TituloCard from './components/TituloCard'
import CapituloLinha from './components/CapituloLinha'
import ContinuarLendo from './components/ContinuarLendo'
import ManifestoFaixa from './components/ManifestoFaixa'
import './WebshardHub.css'

/* /webtoon — a vitrine WEB SHARD. A rota e a palavra "webtoon" ficam (é o
   que o público busca), mas a casa é do formato próprio: vários títulos no
   mesmo universo, um em destaque, a estante e os capítulos mais recentes. */
export default function WebshardHub() {
  const { t, locale } = useLanguage()
  const { isAdmin, liberado, previa, dataPara } = useWebshardAcesso()
  const [progresso] = useState(() => ultimoProgresso())

  const titulos = listarTitulos({ isAdmin })
  const destaque = titulos.find(tt => tt.status !== 'em_breve') || titulos[0]
  const progressoDestaque = destaque ? lerProgresso(destaque.slug) : null
  const tituloProgresso = progresso ? tituloPorSlug(progresso.slug, { isAdmin }) : null

  const recentes = useMemo(() => titulos
    .flatMap(titulo => capitulosDe(titulo).filter(capituloTemConteudo).map(cap => ({ titulo, cap })))
    .sort((a, b) => b.cap.numero - a.cap.numero)
    .slice(0, 6), [titulos])

  const capInicial = destaque && capitulosDe(destaque).find(liberado)
  const capContinuar = progressoDestaque && capitulosDe(destaque).find(c => c.id === progressoDestaque.cap && liberado(c))
  const capHero = capContinuar || capInicial

  return (
    <>
      <Helmet>
        <title>{t('pages.webtoon.meta_title')}</title>
        <meta name="description" content={t('pages.webtoon.meta_desc')} />
        <meta property="og:title" content={t('pages.webtoon.meta_title')} />
        <meta property="og:description" content={t('pages.webtoon.meta_desc')} />
        <meta property="og:url" content="https://illusionfight.com/webtoon" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="ws-hub">
        <div className="container">
          <header className="ws-hub__cabeca">
            <span className="if-eyebrow">{t('webShard.hub.eyebrow')}</span>
            <h1 className="ws-hub__h1">{t('webShard.hub.titulo')}</h1>
            <p className="ws-hub__sub">{t('webShard.hub.subtitulo')}</p>
          </header>

          {destaque && (
            <TituloHero titulo={destaque} eyebrow={t('webShard.hub.destaque')} texto={localizado(destaque, 'tagline', locale)}>
              {capHero && (
                <Link
                  to={rotaCapitulo(destaque, capHero)}
                  className="if-btn if-btn--primary"
                  onClick={() => trackEvent('webtoon_card_click', { episode_id: capHero.id, origem: 'hub_destaque' })}
                >
                  {capContinuar
                    ? t('webShard.titulo.continuar', { n: numeroCapitulo(capHero) })
                    : t('webShard.hub.ler_agora')}
                </Link>
              )}
              <Link to={rotaTitulo(destaque)} className="if-btn if-btn--ghost">{t('webShard.hub.ver_titulo')}</Link>
            </TituloHero>
          )}

          {tituloProgresso && tituloProgresso.slug !== destaque?.slug && (
            <div className="ws-hub__continuar">
              <ContinuarLendo titulo={tituloProgresso} progresso={progresso} liberado={liberado} />
            </div>
          )}

          {titulos.length > 1 && (
          <section className="ws-hub__secao">
            <div className="ws-hub__secao-cabeca">
              <span className="if-eyebrow">{t('webShard.hub.titulos_eyebrow')}</span>
              <h2 className="ws-hub__h2">{t('webShard.hub.titulos')}</h2>
              <p className="ws-hub__hint">{t('webShard.hub.titulos_hint')}</p>
            </div>
            <div className="ws-hub__estante if-stagger">
              {titulos.map((titulo, i) => (
                <TituloCard key={titulo.id} titulo={titulo} indice={i + 1} oculto={titulo.visivel !== 'publico'} />
              ))}
            </div>
          </section>
          )}

          {recentes.length > 0 && (
            <section className="ws-hub__secao">
              <div className="ws-hub__secao-cabeca">
                <span className="if-eyebrow">{t('webShard.hub.recentes_eyebrow')}</span>
                <h2 className="ws-hub__h2">{t('webShard.hub.recentes')}</h2>
              </div>
              <div className="ws-hub__lista">
                {recentes.map(({ titulo, cap }) => (
                  <CapituloLinha
                    key={`${titulo.slug}-${cap.id}`}
                    titulo={titulo}
                    cap={cap}
                    liberado={liberado(cap)}
                    data={dataPara(cap)}
                    progresso={lerProgresso(titulo.slug)}
                    mostrarTitulo={titulos.length > 1}
                    previa={previa(cap)}
                  />
                ))}
              </div>
            </section>
          )}

          <ManifestoFaixa />

          <p className="ws-hub__seo">{t('pages.webtoon.seo_intro')}</p>
        </div>
      </div>
    </>
  )
}
