import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useHistoriasAcesso } from '../../../hooks/useHistoriasAcesso'
import { localizado } from '../../../lib/webshard/catalogo'
import { historiaPorSlug, numeroCapHistoria, progressoHistoria } from '../../../lib/historias/catalogo'
import Farol from '../../../components/Farol/Farol'
import TituloHero from '../webshard/components/TituloHero'
import LerAntesCta from '../webshard/components/LerAntesCta'
import HistoriaCapLinha from './HistoriaCapLinha'
import '../webshard/WebshardTitulo.css'
import './Historias.css'

/* Página de um título de Histórias — linha principal (/historias/lutas-de-ilusao),
   conto (/historias/contos/:historia) ou obra de outro universo
   (/historias/:slug). Mesmo desenho da página de título do WEB SHARD:
   capa, selos, sinopse, "começar/continuar" e a lista com a cascata. */
export default function HistoriaTitulo({ tipo }) {
  const { historia: contoSlug, slug } = useParams()
  const { t, locale } = useLanguage()
  const { nivel, liberado, previa, dataPara } = useHistoriasAcesso()

  const historia = tipo === 'livro'
    ? historiaPorSlug('lutas-de-ilusao', 'livro')
    : historiaPorSlug(tipo === 'conto' ? contoSlug : slug, tipo)
  const voltar = tipo === 'conto' ? '/historias/contos' : '/historias'

  if (!historia) {
    return (
      <div className="ws-titulo">
        <div className="container">
          <Link to={voltar} className="ws-titulo__voltar">{t('pages.historias.voltar')}</Link>
          <p className="ws-titulo__vazio">{t('pages.obra.nao_encontrado')}</p>
        </div>
      </div>
    )
  }

  const status = historia.capitulos.some(c => liberado(historia, c) && !previa(historia, c)) ? 'em_andamento' : 'em_breve'
  const nome = localizado(historia, 'nome', locale)
  const atual = progressoHistoria(historia)
  const capContinuar = atual && liberado(historia, atual) ? atual : null
  const primeiro = historia.capitulos.find(c => liberado(historia, c))
  const capBotao = capContinuar || primeiro
  const publicados = historia.capitulos.filter(c => liberado(historia, c) && !previa(historia, c)).length
  const soPt = historia.idiomas?.length === 1 && historia.idiomas[0] === 'pt' && locale !== 'pt'
  const saga = localizado(historia, 'saga', locale)
  const universo = localizado(historia, 'universo', locale)
  // Peso e canon ficam no farol logo abaixo — nos selos só o tipo.
  // Sem saga, o tipo já vai no eyebrow — não repete no selo.
  const selos = saga ? [t(`pages.historias.tipo.${historia.tipo}`)] : []
  const url = `https://illusionfight.com${historia.rota}`

  return (
    <>
      <Helmet>
        <title>{t('pages.historias.meta_title', { nome })}</title>
        <meta name="description" content={localizado(historia, 'sinopse_curta', locale) || localizado(historia, 'tagline', locale)} />
        <meta property="og:title" content={t('pages.historias.meta_title', { nome })} />
        <meta property="og:description" content={localizado(historia, 'tagline', locale)} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="book" />
      </Helmet>

      <div className="ws-titulo hist-titulo" style={{ '--ws-cor': historia.cor }}>
        <div className="container">
          <Link to={voltar} className="ws-titulo__voltar">
            {t(tipo === 'conto' ? 'pages.historias.voltar_contos' : 'pages.historias.voltar')}
          </Link>

          <TituloHero
            titulo={{ ...historia, status }}
            capa={historia.capa}
            as="h1"
            eyebrow={saga || t(`pages.historias.tipo.${historia.tipo}`)}
            texto={localizado(historia, 'sinopse', locale)}
            selos={selos}
          >
            {capBotao && (
              <Link to={historia.rotaCap(capBotao)} className="if-btn if-btn--primary">
                {capContinuar
                  ? t('webShard.titulo.continuar', { n: numeroCapHistoria(capBotao) })
                  : t('webShard.titulo.comecar', { n: numeroCapHistoria(capBotao) })}
              </Link>
            )}
            {historia.amazon && (
              <a href={historia.amazon} className="if-btn if-btn--ghost" target="_blank" rel="noopener noreferrer">
                {t('pages.obra.amazon')}
              </a>
            )}
          </TituloHero>

          <div className="hist-titulo__farol">
            <Farol peso={historia.peso} canon={historia.canon} temas={historia.temas} size="sm" />
            <p className="hist-titulo__aviso">{t(`pages.contos.peso_${historia.peso}_desc`)}</p>
            {historia.autor && <p className="hist-titulo__autor">{t('pages.obra.por')} {historia.autor}</p>}
            {soPt && <p className="hist-titulo__aviso">{t('pages.obra.idioma_unico')}</p>}
          </div>

          {universo && (
            <aside className="hist-titulo__universo">
              <span className="if-eyebrow">{t('pages.obra.sobre_universo')}</span>
              <p>{universo}</p>
            </aside>
          )}

          <section className="ws-titulo__caps">
            <div className="ws-titulo__caps-cabeca">
              <h2 className="ws-titulo__h2">{t('webShard.titulo.capitulos')}</h2>
              <span className="ws-titulo__total">{t('webShard.titulo.total_caps', { n: publicados })}</span>
            </div>
            {historia.capitulos.some(c => c.liberacao && !liberado(historia, c)) && (
              <div className="ws-titulo__ler-antes"><LerAntesCta nivel={nivel} /></div>
            )}
            <div className="ws-titulo__lista if-stagger">
              {historia.capitulos.map(cap => (
                <HistoriaCapLinha
                  key={cap.id}
                  historia={historia}
                  cap={cap}
                  liberado={liberado(historia, cap)}
                  data={dataPara(cap)}
                  nivel={nivel}
                  atual={atual?.id === cap.id}
                  previa={previa(historia, cap)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
