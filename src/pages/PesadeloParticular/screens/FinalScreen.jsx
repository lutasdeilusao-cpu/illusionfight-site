import { usePPStore } from '../store/usePPStore'
import { PISTAS } from '../data/pistas'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'

export default function FinalScreen() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = usePPStore()

  const totalFios = PISTAS.filter(p => p.tipo === 'fio').length
  const coletados = store.cadernoSuspeitas.length
  const completo = coletados >= totalFios * 0.7

  const handleFim = () => {
    store.setFase('mapa')
    store.saveToCloud(user?.id)
  }

  return (
    <div className="pp-container">
      <div className="pp-final-center">
        <h1 className={`pp-title ${completo ? 'pp-final-completo' : 'pp-final-fragmentado'} pp-final-title`}>
          {t('pp.fimscreen.titulo')}
        </h1>

        <p className="pp-final-text">
          {completo
            ? t('pp.fimscreen.completo')
            : t('pp.fimscreen.fragmentado')}
        </p>

        <div className="pp-final-stat-box">
          <div className="pp-final-stat-value" style={{ color: '#FFD700' }}>★ {store.reputacao}</div>
          <div className="pp-final-stat-label">{t('pp.fimscreen.reputacao_label')}</div>
        </div>

        <div className="pp-final-stat-box">
          <div className="pp-final-stat-green">{store.casosResolvidos.length}/20</div>
          <div className="pp-final-stat-label">{t('pp.fimscreen.casos_label')}</div>
        </div>

        <div className="pp-dossier-section-title pp-dossier-section-title--mt">{t('pp.fimscreen.fios_label')}</div>
        <div className="pp-final-fio-bar">
          <div className="pp-final-fio-bar-fill" style={{ width: `${(coletados / totalFios) * 100}%` }} />
        </div>
        <div className="pp-final-fio-count">{coletados}/{totalFios}</div>

        <button className="pp-btn pp-btn--primary" onClick={handleFim} style={{ marginTop: '2rem' }}>
          {t('pp.fimscreen.voltar_mapa')}
        </button>
      </div>
    </div>
  )
}
