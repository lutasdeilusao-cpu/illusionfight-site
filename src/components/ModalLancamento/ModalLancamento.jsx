import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import './ModalLancamento.css'

const STORAGE_KEY = 'ldi-modal-lancamento-visto'

export default function ModalLancamento({ mostrar, onFechar }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!mostrar) return null

  const handleFechar = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    onFechar()
  }

  return (
    <div className="modal-lancamento-overlay" onClick={handleFechar}>
      <div className="modal-lancamento" onClick={e => e.stopPropagation()}>
        <h2 className="modal-lancamento-titulo">{t('site.games.modal_lancamento.titulo')}</h2>
        <p className="modal-lancamento-corpo">{t('site.games.modal_lancamento.corpo')}</p>
        {!user ? (
          <>
            <p className="modal-lancamento-cta-texto">{t('site.games.modal_lancamento.cta_guest')}</p>
            <button className="modal-lancamento-btn" onClick={() => { handleFechar(); navigate('/cadastro') }}>
              {t('site.games.modal_lancamento.botao_conta')}
            </button>
          </>
        ) : (
          <p className="modal-lancamento-logado">{t('site.games.modal_lancamento.logado')}</p>
        )}
        <button className="modal-lancamento-fechar" onClick={handleFechar}>
          {t('site.games.modal_lancamento.fechar')}
        </button>
      </div>
    </div>
  )
}