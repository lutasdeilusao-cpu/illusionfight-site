import { usePPStore } from '../store/usePPStore'
import { getCaso } from '../data/resolver'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'

export default function Resolucao() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)

  if (!caso) { store.setFase('mapa'); return null }

  const handleVoltar = () => {
    store.setFase('mapa')
    store.saveToCloud(user?.id)
  }

  return (
    <div className="pp-container">
      <div className="pp-resol-card">
        <div className="pp-resol-badge">{t('pp.resolucao.caso_encerrado')}</div>
        <div className="pp-resol-nome">{caso.nome}</div>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
          {caso.dialogoResolucao.map((l, i) => (
            <span key={i} style={{ display: 'block', marginBottom: 8, color: l.personagem === 'jack' ? '#00FF88' : l.personagem === 'kim' ? '#F5A623' : '#888', fontStyle: l.personagem === 'narração' ? 'italic' : 'normal' }}>
              {l.texto}
            </span>
          ))}
        </p>

        {caso.pistaKronos && (
          <div className="pp-fio-card" style={{ marginBottom: 20, textAlign: 'left' }}>
            <div style={{ color: '#FFD700', fontSize: 10, marginBottom: 4 }}>{t('pp.resolucao.novo_fio')}</div>
            <div style={{ color: '#C8C8C8', fontSize: 12, fontStyle: 'italic' }}>{caso.pistaKronos}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="pp-btn pp-btn--primary" onClick={handleVoltar}>{t('pp.resolucao.voltar_mapa')}</button>
          {store.casosResolvidos.length >= 5 && !store.cadernoSuspeitas.length && (
            <button className="pp-btn" onClick={() => store.setFase('caderno')}>{t('pp.resolucao.ver_caderno')}</button>
          )}
        </div>
      </div>
    </div>
  )
}
