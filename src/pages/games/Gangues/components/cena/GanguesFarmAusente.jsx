import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { CENAS_POR_ID } from '../../data/cenas/cenaHelpers.js'
import { brigaAutoLigada, desligarAutomaticos } from '../../hooks/useGanguesBrigaAutomatica.js'
import { simularFarmAusente, GANGUES_FARM_MIN_S } from '../../engine/ganguesFarmAusente.js'
import enemiesData from '../../data/gangues-enemies.json'

// Farm ausente (v3.72.0 — ver engine/ganguesFarmAusente.js). Envolve a cena:
// app foi pra segundo plano com a briga automática ligada → a cena é
// DESMONTADA (imagens, animações e relógios somem da memória); voltou → tela
// de carga, as lutas do tempo fora são calculadas e o resumo aparece antes
// da rua remontar. Fechar a aba perde o farm: o instante da saída mora só
// aqui (ref), de propósito.
const PAUSA_CALCULO_MS = 700

export default function GanguesFarmAusente({ children }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('cena') // cena | fora | calculando | resultado
  const [resumo, setResumo] = useState(null)
  const saiuEm = useRef(null)

  useEffect(() => {
    let timer
    const aoMudar = () => {
      if (document.hidden) {
        if (saiuEm.current || !brigaAutoLigada()) return
        saiuEm.current = Date.now()
        setFase('fora')
        return
      }
      if (!saiuEm.current) return
      const segundos = (Date.now() - saiuEm.current) / 1000
      saiuEm.current = null
      if (segundos < GANGUES_FARM_MIN_S) { setFase('cena'); return }
      setFase('calculando')
      // Deixa a tela de carga pintar antes da conta (que roda de uma vez).
      timer = setTimeout(() => {
        const store = useGanguesStore.getState
        const territorioId = store().storyTarget?.territorioId
        const cena = CENAS_POR_ID[territorioId]
        const r = cena ? simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota: desligarAutomaticos }) : null
        const poi = r?.poiId ? cena.pois.find(p => p.id === r.poiId) : null
        setResumo({ ...(r || { lutas: 0, niveis: {} }), segundos, lugar: poi?.i18n ? t(`${poi.i18n}.nome`) : '' })
        setFase('resultado')
      }, PAUSA_CALCULO_MS)
    }
    document.addEventListener('visibilitychange', aoMudar)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', aoMudar) }
  }, [t])

  if (fase === 'fora') return null
  if (fase === 'calculando') {
    return (
      <div className="gang-page--loading" role="status">
        <span className="gang-loading-mark">{t('games.gangues.farm_ausente.calculando')}</span>
        <i className="gang-loading-line" aria-hidden="true" />
      </div>
    )
  }
  if (fase === 'resultado' && resumo) {
    const niveis = Object.values(resumo.niveis || {})
    const aviso = !resumo.poiId ? 'sem_alvo' : resumo.derrota ? 'derrota' : resumo.teto ? 'teto' : !resumo.lutas ? 'pouco_tempo' : null
    return (
      <div className="gang-farm-ausente" role="dialog" aria-modal="true" aria-labelledby="gang-farm-ausente-titulo">
        <div className="gang-farm-ausente__card">
          <span className="gang-farm-ausente__eyebrow">{t('games.gangues.farm_ausente.eyebrow')}</span>
          <h2 id="gang-farm-ausente-titulo">{t('games.gangues.farm_ausente.titulo')}</h2>
          <p className="gang-farm-ausente__tempo">{t('games.gangues.farm_ausente.tempo', { min: Math.max(1, Math.round(resumo.segundos / 60)), lugar: resumo.lugar || '—' })}</p>
          {resumo.lutas > 0 && (
            <dl className="gang-farm-ausente__numeros">
              <div><dt>{t('games.gangues.farm_ausente.lutas')}</dt><dd>{resumo.vitorias}/{resumo.lutas}</dd></div>
              <div><dt>{t('games.gangues.farm_ausente.grana')}</dt><dd>+{resumo.grana}</dd></div>
              <div><dt>{t('games.gangues.farm_ausente.rep')}</dt><dd>+{resumo.rep}</dd></div>
              <div><dt>{t('games.gangues.farm_ausente.sucata')}</dt><dd>+{resumo.sucata}</dd></div>
              {resumo.pocoes > 0 && <div><dt>{t('games.gangues.farm_ausente.pocoes')}</dt><dd>−{resumo.pocoes}</dd></div>}
            </dl>
          )}
          {niveis.length > 0 && (
            <ul className="gang-farm-ausente__niveis" aria-label={t('games.gangues.farm_ausente.niveis')}>
              {niveis.map(n => <li key={n.nome}><strong>{n.nome}</strong><span>NV {n.de} → {n.para}</span></li>)}
            </ul>
          )}
          {aviso && <p className={`gang-farm-ausente__aviso is-${aviso}`}>{t(`games.gangues.farm_ausente.${aviso}`)}</p>}
          <button type="button" className="gang-farm-ausente__voltar" onClick={() => { setResumo(null); setFase('cena') }}>
            {t('games.gangues.farm_ausente.voltar')}
          </button>
        </div>
      </div>
    )
  }
  return children
}
