import { usePPStore } from '../store/usePPStore'
import { PISTAS } from '../data/pistas'
import { CASOS } from '../data/casos'
import { t } from '../data/pp-i18n'

export default function CadernoSuspeitas() {
  const store = usePPStore()
  const { cadernoSuspeitas } = store

  const fios = PISTAS.filter(p => cadernoSuspeitas.includes(p.id))
  const casosComFios = [...new Set(fios.map(p => p.casoId))]
  const totalCasos = CASOS.length
  const progresso = Math.floor((casosComFios.length / totalCasos) * 100)

  return (
    <div className="pp-container">
      <div className="pp-dossier-header">
        <button className="pp-back" onClick={() => store.setFase('mapa')}>{t('pt', 'local.mapa_voltar')}</button>
        <h2 style={{ color: '#FFD700', margin: 0 }}>{t('pt', 'caderno.titulo')}</h2>
      </div>

      <p style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>
        {t('pt', 'caderno.desc')}
      </p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: '#555', fontSize: 10, marginBottom: 4 }}>
          {t('pt', 'caderno.progresso', { pct: progresso })}
        </div>
        <div style={{ height: 4, background: '#1a1a1a' }}>
          <div style={{ height: '100%', background: '#FFD700', transition: 'width 0.5s', width: `${progresso}%` }} />
        </div>
      </div>

      {fios.length === 0 ? (
        <div className="pp-fio-card-vazia">
          {t('pt', 'caderno.vazio')}
        </div>
      ) : (
        <div className="pp-caderno-grid">
          {fios.map(f => {
            const caso = CASOS.find(c => c.id === f.casoId)
            return (
              <div key={f.id} className="pp-fio-card">
                <div style={{ color: '#FFD700', fontSize: 10, marginBottom: 4 }}>
                  {caso?.nome || f.casoId}
                </div>
                <div style={{ color: '#C8C8C8', fontSize: 12, fontStyle: 'italic', lineHeight: 1.5 }}>
                  {f.texto}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {fios.length >= 5 && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #FFD70033', background: 'rgba(255,215,0,0.03)' }}>
          <p style={{ color: '#FFD700', fontSize: 13, fontStyle: 'italic' }}>
            {fios.length >= 15
              ? t('pt', 'caderno.conspiracao_15')
              : fios.length >= 10
              ? t('pt', 'caderno.conspiracao_10')
              : t('pt', 'caderno.conspiracao_5')}
          </p>
        </div>
      )}
    </div>
  )
}
