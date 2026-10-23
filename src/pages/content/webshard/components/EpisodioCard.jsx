import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { capituloTemConteudo, formatarData, localizado, miniaturaCapitulo, numeroCapitulo, rotaCapitulo } from '../../../../lib/webshard/catalogo'
import './EpisodioCard.css'

/** Capa de um capítulo numa fileira do lobby. Liberado abre a leitura;
 *  travado fica em preto e branco com a data em que sai. */
export default function EpisodioCard({ titulo, cap, liberado, data, progresso }) {
  const { t, locale } = useLanguage()
  const doCapitulo = progresso?.cap === cap.id ? progresso : null
  const pct = doCapitulo?.total ? Math.min(100, Math.round((doCapitulo.pagina / doCapitulo.total) * 100)) : 0
  const nome = capituloTemConteudo(cap) || cap.especial ? localizado(cap, 'titulo', locale) : t('webShard.cap.em_breve')
  const estado = liberado
    ? t('webShard.cap.paginas', { n: cap.paginas })
    : data ? t('webShard.cap.em_breve_data', { data: formatarData(data) }) : t('webShard.cap.em_breve')

  const miolo = (
    <>
      <span className="ep-card__capa">
        <img src={miniaturaCapitulo(titulo, cap, locale)} alt="" loading="lazy" decoding="async" />
        <span className="ep-card__num">{numeroCapitulo(cap)}</span>
        {!liberado && <span className="ep-card__cadeado" aria-hidden="true">🔒</span>}
        {pct > 0 && <span className="ep-card__progresso" style={{ '--pct': `${pct}%` }} />}
      </span>
      <span className="ep-card__nome">{nome}</span>
      <span className="ep-card__estado">{estado}</span>
    </>
  )

  return liberado
    ? <Link to={rotaCapitulo(titulo, cap)} className="ep-card">{miolo}</Link>
    : <div className="ep-card is-travado">{miolo}</div>
}
