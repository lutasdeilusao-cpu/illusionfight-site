import { useLanguage } from '../../../../context/LanguageContext'
import { LOCALE_LABELS } from '../../../../i18n/locales'
import './LeitorBarra.css'

/** Barra do leitor: voltar, onde estou (título · cap), contador de página e
 *  troca de idioma do capítulo. O fio de progresso embaixo fica sempre
 *  visível, mesmo com a barra recolhida. */
export default function LeitorBarra({
  visivel, onVoltar, rotulo, nome, pagina, total, idiomas, idioma, onIdioma, previa,
}) {
  const { t } = useLanguage()
  const pct = total ? Math.min(100, (pagina / total) * 100) : 0

  return (
    <>
      <header className={`ws-barra${visivel ? '' : ' is-oculta'}`} aria-hidden={!visivel}>
        <button type="button" className="ws-barra__voltar" onClick={onVoltar} aria-label={t('webShard.leitor.voltar')} tabIndex={visivel ? 0 : -1}>
          ‹
        </button>
        <div className="ws-barra__onde">
          <span className="ws-barra__rotulo">
            {rotulo}
            {previa && <span className="ws-barra__previa">{t('webShard.leitor.admin_previa')}</span>}
          </span>
          <span className="ws-barra__nome">{nome}</span>
        </div>
        {idiomas.length > 1 && (
          <div className="ws-barra__idiomas" role="group" aria-label={t('webShard.leitor.idioma')}>
            {idiomas.map(l => (
              <button
                key={l}
                type="button"
                className={`ws-barra__idioma${l === idioma ? ' is-active' : ''}`}
                onClick={() => onIdioma(l)}
                aria-pressed={l === idioma}
                tabIndex={visivel ? 0 : -1}
              >
                {LOCALE_LABELS[l] || l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <span className="ws-barra__contador">
          {pagina}<span>/{total}</span>
        </span>
      </header>
      <div className="ws-barra__progresso" style={{ '--pct': `${pct}%` }} aria-hidden="true" />
    </>
  )
}
