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
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1 className={`pp-title ${completo ? 'pp-final-completo' : 'pp-final-fragmentado'}`}
          style={{ fontSize: 32, letterSpacing: 6 }}>
          {t('pp.fimscreen.titulo')}
        </h1>

        <p style={{ color: '#888', fontSize: 14, marginTop: 16, lineHeight: 1.8, maxWidth: 500, margin: '16px auto' }}>
          {completo
            ? t('pp.fimscreen.completo')
            : t('pp.fimscreen.fragmentado')}
        </p>

        <div style={{ marginTop: 24 }}>
          <div style={{ color: '#FFD700', fontSize: 28, fontWeight: 'bold' }}>★ {store.reputacao}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{t('pp.fimscreen.reputacao_label')}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#22C55E', fontSize: 18 }}>{store.casosResolvidos.length}/20</div>
          <div style={{ color: '#666', fontSize: 12 }}>{t('pp.fimscreen.casos_label')}</div>
        </div>

        <div className="pp-section-label" style={{ marginTop: 32 }}>{t('pp.fimscreen.fios_label')}</div>
        <div style={{ height: 6, background: '#1a1a1a', maxWidth: 400, margin: '8px auto' }}>
          <div style={{ height: '100%', background: '#FFD700', width: `${(coletados / totalFios) * 100}%` }} />
        </div>
        <div style={{ color: '#FFD700', fontSize: 12 }}>{coletados}/{totalFios}</div>

        <button className="pp-btn pp-btn--primary" onClick={handleFim} style={{ marginTop: 32 }}>
          {t('pp.fimscreen.voltar_mapa')}
        </button>
      </div>
    </div>
  )
}
