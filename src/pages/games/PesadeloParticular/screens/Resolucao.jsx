import { usePPStore } from '../store/usePPStore'
import { getCaso } from '../data/resolver'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useEventos } from '../../../../context/EventosContext'

export default function Resolucao() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { registrarEvento } = useEventos()
  const store = usePPStore()
  const caso = getCaso(store.casoAtivo)

  if (!caso) { store.setFase('mapa'); return null }

  const handleVoltar = () => {
    registrarEvento('caso_resolvido', 'Resolveu um caso no Pesadelo Particular', 1)
    registrarEvento('jogo_jogado', 'Jogou Pesadelo Particular', 1)
    store.setFase('mapa')
    store.saveToCloud(user?.id)
  }

  return (
    <div className="pp-container">
      <div className="pp-resol-card">
        <div className="pp-resol-badge">{t('pp.resolucao.caso_encerrado')}</div>
        <div className="pp-resol-nome">{caso.nome}</div>
        <p className="pp-resolucao-dialogo">
          {caso.dialogoResolucao.map((l, i) => (
            <span key={i} className="pp-abertura-msg" style={{ color: l.personagem === 'jack' ? '#00FF88' : l.personagem === 'kim' ? '#F5A623' : '#888', fontStyle: l.personagem === 'narraÃ§Ã£o' ? 'italic' : 'normal' }}>
              {l.texto}
            </span>
          ))}
        </p>

        {caso.pistaKronos && (
          <div className="pp-resolucao-fio-card">
            <div className="pp-resolucao-fio-label">{t('pp.resolucao.novo_fio')}</div>
            <div className="pp-resolucao-fio-text">{caso.pistaKronos}</div>
          </div>
        )}

        <div className="pp-resolucao-btns">
          <button className="pp-btn pp-btn--primary" onClick={handleVoltar}>{t('pp.resolucao.voltar_mapa')}</button>
          {store.casosResolvidos.length >= 5 && !store.cadernoSuspeitas.length && (
            <button className="pp-btn" onClick={() => store.setFase('caderno')}>{t('pp.resolucao.ver_caderno')}</button>
          )}
        </div>
      </div>
    </div>
  )
}
