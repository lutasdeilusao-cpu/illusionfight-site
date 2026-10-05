import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { trackEvent } from '../../../lib/analytics'
import BotaoCopiar from './BotaoCopiar'
import './CreatorsCardapio.css'

function Prato({ assunto, prato }) {
  const { t } = useLanguage()
  const base = `creators.${assunto}.pratos.${prato.id}`
  const conteudo = (
    <>
      <span className="cr-prato__capa">
        {prato.arte ? <img src={prato.arte} alt="" loading="lazy" /> : <span className="cr-prato__icone" aria-hidden="true">{prato.icone}</span>}
      </span>
      <span className="cr-prato__txt">
        <span className={`cr-prato__selo cr-prato__selo--${prato.selo}`}>{t(`creators.selos.${prato.selo}`)}</span>
        <strong>{t(`${base}.nome`)}</strong>
        <small>{t(`${base}.desc`)}</small>
        <span className="cr-prato__servir">{t(prato.href ? 'creators.cardapio.abrir_steam' : 'creators.cardapio.servir')} →</span>
      </span>
    </>
  )
  const aoAbrir = () => trackEvent('ui_click', { component: 'creators_prato', element_id: prato.id })
  return prato.href
    ? <a className="cr-prato" href={prato.href} target="_blank" rel="noopener noreferrer" onClick={aoAbrir}>{conteudo}</a>
    : <Link className="cr-prato" to={prato.rota} onClick={aoAbrir}>{conteudo}</Link>
}

/** Pratos (o que abrir) e pautas (ideias de conteúdo) de um assunto. */
export default function CreatorsCardapio({ assunto }) {
  const { t } = useLanguage()
  const pautas = Array.from({ length: assunto.pautas }, (_, i) => i + 1)

  return (
    <div className="cr-cardapio">
      <span className="if-eyebrow cr-cardapio__eyebrow">{t('creators.cardapio.servido')}</span>
      <div className="cr-cardapio__pratos if-stagger">
        {assunto.pratos.map(p => <Prato key={p.id} assunto={assunto.id} prato={p} />)}
      </div>

      <span className="if-eyebrow cr-cardapio__eyebrow">{t('creators.cardapio.pautas')}</span>
      <p className="cr-cardapio__nota">{t('creators.cardapio.pautas_nota')}</p>
      <ol className="cr-cardapio__pautas">
        {pautas.map(n => {
          const titulo = t(`creators.${assunto.id}.pautas.${n}.titulo`)
          const texto = t(`creators.${assunto.id}.pautas.${n}.texto`)
          return (
            <li key={n} className="cr-pauta if-panel">
              <span className="cr-pauta__num">{String(n).padStart(2, '0')}</span>
              <div className="cr-pauta__corpo">
                <strong>{titulo}</strong>
                <p>{texto}</p>
              </div>
              <BotaoCopiar texto={`${titulo}\n${texto}`} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
