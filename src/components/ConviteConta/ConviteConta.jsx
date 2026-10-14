import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import './ConviteConta.css'

/** Fim do capítulo, pra quem não tem conta: a leitura é livre; a conta grátis
 *  dá os capítulos novos antes do público e o aviso por e-mail quando saem. */
export default function ConviteConta() {
  const { t } = useLanguage()
  return (
    <aside className="convite-conta">
      <div className="convite-conta__card">
        <span className="convite-conta__eyebrow">{t('convite_conta.eyebrow')}</span>
        <p className="convite-conta__titulo">{t('convite_conta.titulo')}</p>
        <ul className="convite-conta__lista">
          {['item1', 'item2', 'item3'].map(k => <li key={k}>{t(`convite_conta.${k}`)}</li>)}
        </ul>
        <p className="convite-conta__texto">{t('convite_conta.texto')}</p>
        <div className="convite-conta__acoes">
          <Link to="/cadastro" className="if-btn if-btn--amber">{t('convite_conta.criar')}</Link>
          <Link to="/login" className="if-btn if-btn--ghost">{t('convite_conta.entrar')}</Link>
        </div>
      </div>
    </aside>
  )
}
