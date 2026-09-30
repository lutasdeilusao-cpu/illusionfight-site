import { useLanguage } from '../../context/LanguageContext'
import './LeitorBarra.css'

/** Barra do topo do leitor: voltar, onde estou e o botão de ajustes. Some
 *  quando o leitor desce e volta quando sobe; o fio de progresso embaixo
 *  fica sempre na tela. */
export default function LeitorBarra({ visivel, onVoltar, rotulo, nome, pct, onAjustes }) {
  const { t } = useLanguage()
  return (
    <>
      <header className={`leitor-barra${visivel ? '' : ' is-oculta'}`} aria-hidden={!visivel}>
        <button type="button" className="leitor-barra__btn" onClick={onVoltar} aria-label={t('pages.leitor.voltar')} tabIndex={visivel ? 0 : -1}>‹</button>
        <div className="leitor-barra__onde">
          <span className="leitor-barra__rotulo">{rotulo}</span>
          <span className="leitor-barra__nome">{nome}</span>
        </div>
        <button type="button" className="leitor-barra__btn leitor-barra__btn--aa" onClick={onAjustes} aria-label={t('pages.leitor.ajustes')} tabIndex={visivel ? 0 : -1}>Aa</button>
      </header>
      <div className="leitor-barra__fio" style={{ '--pct': `${pct}%` }} aria-hidden="true" />
    </>
  )
}
