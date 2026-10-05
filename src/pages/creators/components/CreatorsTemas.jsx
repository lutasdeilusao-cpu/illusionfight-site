import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { trackEvent } from '../../../lib/analytics'
import NeoGuideFala from './NeoGuideFala'
import { TEMAS } from '../data/creatorsCardapio'
import './CreatorsTemas.css'

/** "Sobre o que eu posso falar?": o creator escolhe um tema e a NeoGuide
 *  explica o ângulo e entrega os links do material. */
export default function CreatorsTemas() {
  const { t } = useLanguage()
  const [tema, setTema] = useState(null)
  const atual = TEMAS.find(x => x.id === tema)

  function escolher(id) {
    trackEvent('ui_click', { component: 'creators_tema', element_id: id })
    setTema(id)
  }

  return (
    <div className="cr-temas">
      <div className="cr-temas__chips">
        {TEMAS.map(x => (
          <button key={x.id} type="button" className={`cr-temas__chip${tema === x.id ? ' is-ativo' : ''}`} aria-pressed={tema === x.id} onClick={() => escolher(x.id)}>
            <span aria-hidden="true">{x.icone}</span>
            <span>{t(`creators.temas.itens.${x.id}.nome`)}</span>
          </button>
        ))}
      </div>

      {atual && (
        <div className="cr-temas__resposta">
          <NeoGuideFala key={atual.id} compacta nome={t('creators.neoguide.nome')} texto={t(`creators.temas.itens.${atual.id}.fala`)} />
          <span className="if-eyebrow">{t('creators.temas.acesse')}</span>
          <div className="cr-temas__links">
            {atual.links.map(l => (
              <Link key={l.id} className="cr-temas__link if-item" to={l.rota}>
                <span>{t(`creators.temas.links.${l.id}`)}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="cr-temas__ano">{t('creators.temas.ano_todo')}</p>
    </div>
  )
}
