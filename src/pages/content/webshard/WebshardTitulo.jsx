import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useWebshardAcesso } from '../../../hooks/useWebshardAcesso'
import { capitulosEspeciais, capitulosPrincipais, capituloTemConteudo, localizado, numeroCapitulo, rotaCapitulo } from '../../../lib/webshard/catalogo'
import { lerProgresso } from '../../../lib/webshard/progresso'
import TituloHero from './components/TituloHero'
import CapituloLinha from './components/CapituloLinha'
import ContinuarLendo from './components/ContinuarLendo'
import LerAntesCta from './components/LerAntesCta'
import './WebshardTitulo.css'

/* /webtoon/:slug — página de um título: capa, sinopse, e a lista de
   capítulos. O botão principal é "continuar" se tiver progresso, senão
   "começar do primeiro liberado". */
export default function WebshardTitulo({ titulo }) {
  const { t, locale } = useLanguage()
  const { nivel, liberado, previa, dataPara } = useWebshardAcesso()
  const [progresso] = useState(() => lerProgresso(titulo.slug))

  // Lista inteira: os "Em breve" mostram a data do calendário oficial.
  const capitulos = capitulosPrincipais(titulo)
  const especiais = capitulosEspeciais(titulo)
  const primeiro = capitulos.find(liberado)
  const nome = localizado(titulo, 'nome', locale)
  const url = `https://illusionfight.com/webtoon/${titulo.slug}`

  return (
    <>
      <Helmet>
        <title>{t('webShard.titulo.meta_title', { nome })}</title>
        <meta name="description" content={localizado(titulo, 'sinopse_curta', locale) || localizado(titulo, 'sinopse', locale)} />
        <meta property="og:title" content={t('webShard.titulo.meta_title', { nome })} />
        <meta property="og:description" content={localizado(titulo, 'tagline', locale)} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="ws-titulo" style={{ '--ws-cor': titulo.cor }}>
        <div className="container">
          <Link to="/webtoon" className="ws-titulo__voltar">{t('webShard.titulo.voltar')}</Link>

          <TituloHero titulo={titulo} as="h1" eyebrow={t('webShard.hub.eyebrow')} texto={localizado(titulo, 'sinopse', locale)}>
            {primeiro && (
              <Link to={rotaCapitulo(titulo, primeiro)} className="if-btn if-btn--primary">
                {t('webShard.titulo.comecar', { n: numeroCapitulo(primeiro) })}
              </Link>
            )}
          </TituloHero>

          <div className="ws-titulo__continuar">
            <ContinuarLendo titulo={titulo} progresso={progresso} liberado={liberado} />
          </div>

          <section className="ws-titulo__caps">
            <div className="ws-titulo__caps-cabeca">
              <h2 className="ws-titulo__h2">{t('webShard.titulo.capitulos')}</h2>
              <span className="ws-titulo__total">{t('webShard.titulo.total_caps', { n: capitulos.filter(capituloTemConteudo).length })}</span>
            </div>
            {capitulos.some(c => c.liberacao && !liberado(c)) && (
              <div className="ws-titulo__ler-antes"><LerAntesCta nivel={nivel} /></div>
            )}
            {capitulos.length ? (
              <div className="ws-titulo__lista if-stagger">
                {capitulos.map(cap => (
                  <CapituloLinha
                    key={cap.id}
                    titulo={titulo}
                    cap={cap}
                    liberado={liberado(cap)}
                    data={dataPara(cap)}
                    nivel={nivel}
                    progresso={progresso}
                    previa={previa(cap)}
                  />
                ))}
              </div>
            ) : (
              <p className="ws-titulo__vazio">{t('webShard.titulo.sem_capitulos')}</p>
            )}
          </section>

          {especiais.length > 0 && (
            <section className="ws-titulo__caps ws-titulo__especiais">
              <div className="ws-titulo__caps-cabeca">
                <h2 className="ws-titulo__h2">{t('webShard.titulo.especiais')}</h2>
                <span className="ws-titulo__total">{t('webShard.titulo.especiais_selo')}</span>
              </div>
              <p className="ws-titulo__especiais-hint">{t('webShard.titulo.especiais_hint')}</p>
              <div className="ws-titulo__lista if-stagger">
                {especiais.map(cap => (
                  <CapituloLinha
                    key={cap.id}
                    titulo={titulo}
                    cap={cap}
                    liberado={liberado(cap)}
                    data={dataPara(cap)}
                    nivel={nivel}
                    progresso={progresso}
                    previa={previa(cap)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
