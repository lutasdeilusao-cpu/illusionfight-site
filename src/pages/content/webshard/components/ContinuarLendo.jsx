import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  capituloPorId, localizado, miniaturaCapitulo, numeroCapitulo, rotaCapitulo,
} from '../../../../lib/webshard/catalogo'
import './ContinuarLendo.css'

/** "Continuar lendo" — some sozinho se o capítulo salvo não existe mais,
 *  não está liberado pra quem está vendo, ou já foi lido até o fim. */
export default function ContinuarLendo({ titulo, progresso, liberado }) {
  const { t, locale } = useLanguage()
  if (!titulo || !progresso) return null
  const cap = capituloPorId(titulo, progresso.cap)
  if (!cap || !liberado(cap)) return null
  const total = progresso.total || cap.paginas
  if (progresso.pagina >= total) return null
  const pct = Math.max(4, Math.round((progresso.pagina / total) * 100))

  return (
    <Link to={rotaCapitulo(titulo, cap)} className="ws-continuar" style={{ '--ws-cor': titulo.cor, '--pct': `${pct}%` }}>
      <img className="ws-continuar__thumb" src={miniaturaCapitulo(titulo, cap, locale)} alt="" decoding="async" />
      <span className="ws-continuar__corpo">
        <span className="if-eyebrow">{t('webShard.continuar.eyebrow')}</span>
        <span className="ws-continuar__nome">{localizado(cap, 'titulo', locale)}</span>
        <span className="ws-continuar__meta">
          {t('webShard.continuar.meta', { n: numeroCapitulo(cap), p: progresso.pagina, t: total })}
        </span>
      </span>
      <span className="ws-continuar__cta">{t('webShard.continuar.cta')}</span>
      <span className="ws-continuar__barra" aria-hidden="true" />
    </Link>
  )
}
