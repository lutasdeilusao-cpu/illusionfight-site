import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { localizado } from '../../../lib/webshard/catalogo'
import { capaContos } from '../../../lib/historias/catalogo'
import Farol from '../../../components/Farol/Farol'
import TituloCard from '../webshard/components/TituloCard'
import './Historias.css'

/** A estante do hub separada por universo — cada mundo é uma história à
 *  parte e não se mistura com os outros:
 *  1. Lutas de Ilusão: a linha principal + a coleção dos Contos (1 card,
 *     os 5 contos moram em /historias/contos);
 *  2+. cada obra externa (Mundo das Sombras, Mar de Cinzas) na sua seção,
 *     num card largo com capa, saga, chamada e o universo. */
export default function HistoriasUniversos({ historias }) {
  const { t, locale } = useLanguage()
  const principal = historias.find(h => h.tipo === 'livro')
  const contos = historias.filter(h => h.tipo === 'conto')
  const obras = historias.filter(h => h.tipo === 'obra')

  // A coleção dos contos vira um "título" só na estante do universo LDI.
  const nomeContos = t('pages.contos.linha_contos')
  const colecaoContos = {
    nome_pt: nomeContos,
    tagline_pt: t('pages.historias.contos_tagline', { n: contos.length }),
    cor: 'var(--if-amber)',
    status: contos.some(c => c.status === 'em_andamento') ? 'em_andamento' : 'em_breve',
  }

  return (
    <>
      <section className="ws-hub__secao">
        <div className="ws-hub__secao-cabeca">
          <span className="if-eyebrow">{t('pages.historias.universo_eyebrow')}</span>
          <h2 className="ws-hub__h2">{t('pages.historias.secao_ldi')}</h2>
          <p className="ws-hub__hint">{t('pages.historias.secao_ldi_desc')}</p>
        </div>
        <div className="ws-hub__estante if-stagger">
          {principal && (
            <TituloCard titulo={principal} indice={1} capa={principal.capa} to={principal.rota}>
              <span className="hist-card__tipo">{t('pages.historias.tipo.livro')}</span>
              <Farol peso={principal.peso} canon={principal.canon} temas={[]} size="sm" showTemas={false} />
            </TituloCard>
          )}
          {contos.length > 0 && (
            <TituloCard titulo={colecaoContos} indice={2} capa={capaContos()} to="/historias/contos">
              <span className="hist-card__tipo">{t('pages.historias.contos_qtd', { n: contos.length })}</span>
            </TituloCard>
          )}
        </div>
      </section>

      {obras.map(o => {
        const universo = localizado(o, 'universo', locale)
        return (
          <section key={o.slug} className="ws-hub__secao">
            <div className="ws-hub__secao-cabeca">
              <span className="if-eyebrow">{t('pages.historias.outro_universo_eyebrow')}</span>
              <h2 className="ws-hub__h2">{localizado(o, 'nome', locale)}</h2>
              {universo && <p className="ws-hub__hint">{universo}</p>}
            </div>
            <Link to={o.rota} className="hist-obra" style={{ '--ws-cor': o.cor }}>
              <span className="hist-obra__capa">
                <img src={o.capa} alt="" loading="lazy" decoding="async" />
                <span className="hist-obra__status">{t(`webShard.status.${o.status}`)}</span>
              </span>
              <span className="hist-obra__info">
                {localizado(o, 'saga', locale) && <span className="hist-obra__saga">{localizado(o, 'saga', locale)}</span>}
                <span className="hist-obra__tagline">{localizado(o, 'tagline', locale)}</span>
                <Farol peso={o.peso} canon={o.canon} temas={[]} size="sm" showTemas={false} />
                <span className="hist-obra__cta">{t('webShard.hub.ver_titulo')} ›</span>
              </span>
            </Link>
          </section>
        )
      })}
    </>
  )
}
