import { useLanguage } from '../../context/LanguageContext'
import './Farol.css'

const PESOS = ['leve', 'media', 'pesada']

export function pesoIndex(peso) {
  return PESOS.indexOf(peso)
}

export { PESOS }

/**
 * Farol de peso — mostra a intensidade de uma história (leve / média / pesada),
 * se é canônica e as tags de temática. Usado nos cards e nos cabeçalhos de conto.
 */
export default function Farol({
  peso,
  temas = [],
  canon,
  size = 'md',
  showTemas = true,
  temaAtivo = null,
  onTema = null,
}) {
  const { t } = useLanguage()
  if (!peso) return null
  const nivel = pesoIndex(peso) + 1

  return (
    <div className={`farol farol--${peso} farol--${size}`}>
      <span className="farol__peso" title={t(`pages.contos.peso_${peso}_desc`)}>
        <span className="farol__bars" aria-hidden="true">
          <i className={nivel >= 1 ? 'on' : ''} />
          <i className={nivel >= 2 ? 'on' : ''} />
          <i className={nivel >= 3 ? 'on' : ''} />
        </span>
        {t('pages.contos.peso_label')}: {t(`pages.contos.peso_${peso}`)}
      </span>

      {canon != null && (
        <span className="farol__canon">
          {canon ? t('pages.contos.canon_sim') : t('pages.contos.canon_nao')}
        </span>
      )}

      {showTemas && temas.map(tm => {
        const Tag = onTema ? 'button' : 'span'
        return (
          <Tag
            key={tm}
            type={onTema ? 'button' : undefined}
            className={`farol__tema${temaAtivo === tm ? ' farol__tema--ativo' : ''}${onTema ? ' farol__tema--btn' : ''}`}
            onClick={onTema ? (e) => { e.stopPropagation(); onTema(tm) } : undefined}
          >
            {t(`pages.contos.tema_${tm}`)}
          </Tag>
        )
      })}
    </div>
  )
}
