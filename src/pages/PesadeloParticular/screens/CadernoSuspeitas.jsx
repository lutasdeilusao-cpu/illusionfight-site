import { usePPStore } from '../store/usePPStore'
import { PISTAS } from '../data/pistas'
import { CASOS } from '../data/casos'
import { useLanguage } from '../../../context/LanguageContext'

export default function CadernoSuspeitas() {
  const { t } = useLanguage()
  const store = usePPStore()
  const { cadernoSuspeitas } = store

  const fios = PISTAS.filter(p => cadernoSuspeitas.includes(p.id))
  const casosComFios = [...new Set(fios.map(p => p.casoId))]
  const totalCasos = CASOS.length
  const progresso = Math.floor((casosComFios.length / totalCasos) * 100)

  return (
    <div className="pp-container">
      <div className="pp-dossier-header">
        <button className="pp-back" onClick={() => store.setFase('mapa')}>{t('pp.local.mapa_voltar')}</button>
        <h2 className="pp-dossier-caso-nome">{t('pp.caderno.titulo')}</h2>
      </div>

      <p className="pp-caderno-desc">
        {t('pp.caderno.desc')}
      </p>

      <div className="pp-dossier-pistas-mb">
        <div className="pp-caderno-progress-label">
          {t('pp.caderno.progresso', { pct: progresso })}
        </div>
        <div className="pp-caderno-progress-bar">
          <div className="pp-caderno-progress-fill" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      {fios.length === 0 ? (
        <div className="pp-fio-card-vazia">
          {t('pp.caderno.vazio')}
        </div>
      ) : (
        <div className="pp-caderno-grid">
          {fios.map(f => {
            const caso = CASOS.find(c => c.id === f.casoId)
            return (
              <div key={f.id} className="pp-fio-card">
                <div className="pp-fio-card-label">
                  {caso?.nome || f.casoId}
                </div>
                <div className="pp-fio-card-text">
                  {f.texto}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {fios.length >= 5 && (
        <div className="pp-conspiracao-box">
          <p className="pp-conspiracao-text">
            {fios.length >= 15
              ? t('pp.caderno.conspiracao_15')
              : fios.length >= 10
              ? t('pp.caderno.conspiracao_10')
              : t('pp.caderno.conspiracao_5')}
          </p>
        </div>
      )}
    </div>
  )
}
