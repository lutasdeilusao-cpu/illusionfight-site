import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import './LerAntesCta.css'

/** "Quer ler antes?" — pra quem não é assinante. Sem conta: oferece conta
 *  grátis (15 dias antes) e assinatura (30 dias antes). Com conta: só a
 *  assinatura. Assinante não vê nada. */
export default function LerAntesCta({ nivel }) {
  const { t } = useLanguage()
  if (nivel === 'elite' || nivel === 'primordial') return null
  const semConta = nivel === 'publico'

  return (
    <aside className="ws-ler-antes">
      <span className="ws-ler-antes__eyebrow">{t('webShard.cascata.eyebrow')}</span>
      <p className="ws-ler-antes__texto">
        {semConta ? t('webShard.cascata.texto_publico') : t('webShard.cascata.texto_conta')}
      </p>
      <div className="ws-ler-antes__acoes">
        <Link to="/assinar" className="if-btn if-btn--amber">{t('webShard.cascata.assinar')}</Link>
        {semConta && <Link to="/cadastro" className="if-btn if-btn--ghost">{t('webShard.cascata.criar_conta')}</Link>}
      </div>
    </aside>
  )
}
