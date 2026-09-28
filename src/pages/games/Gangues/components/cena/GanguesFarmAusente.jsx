import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { CENAS_POR_ID } from '../../data/cenas/cenaHelpers.js'
import { brigaAutoLigada, desligarAutomaticos } from '../../hooks/useGanguesBrigaAutomatica.js'
import { simularFarmAusente, lutaAoVivo, GANGUES_FARM_MIN_S } from '../../engine/ganguesFarmAusente.js'
import enemiesData from '../../data/gangues-enemies.json'

// Farm ausente (ver engine/ganguesFarmAusente.js). Envolve a CENA e a LUTA:
// • cena: app foi pra segundo plano com a briga automática ligada → a cena é
//   DESMONTADA (imagens, animações e relógios somem da memória);
// • luta (`luta`): app foi pro fundo no meio de uma luta de rua da cena com o
//   automático ligado → a tela da luta é desmontada (som e relógios param) e
//   o estado vivo dela (lutaAoVivo) é guardado pra ser terminado por cálculo.
//   Chefe, Clube e Torre ficam de fora (continuam como sempre).
// Voltou → tela de carga, conta e o resumo; o "voltar" leva pra rua
// (`aoVoltar` — na luta, a cena daquele bairro: o ponto da briga ou a
// birosca). Fechar a aba perde tudo: o instante da saída mora só aqui (ref).
function lutaElegivel() {
  const viva = lutaAoVivo.ler?.()
  const alvo = useGanguesStore.getState().storyTarget
  return viva && viva.auto && !viva.terminou && alvo?.cenaId && !alvo.isChefe ? viva : null
}
const PAUSA_CALCULO_MS = 700

export default function GanguesFarmAusente({ children, luta = false, aoVoltar }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('cena') // cena | fora | calculando | resultado
  const [resumo, setResumo] = useState(null)
  const saiuEm = useRef(null)
  const lutaGuardada = useRef(null)

  useEffect(() => {
    let timer
    const aoMudar = () => {
      if (document.hidden) {
        if (saiuEm.current) return
        const viva = luta ? lutaElegivel() : null
        if (luta ? !viva : !brigaAutoLigada()) return
        lutaGuardada.current = viva
        saiuEm.current = Date.now()
        setFase('fora')
        return
      }
      if (!saiuEm.current) return
      const segundos = (Date.now() - saiuEm.current) / 1000
      saiuEm.current = null
      const emAndamento = lutaGuardada.current
      lutaGuardada.current = null
      // Luta desmontada não tem como voltar pra tela: sempre termina por conta.
      if (!emAndamento && segundos < GANGUES_FARM_MIN_S) { setFase('cena'); return }
      setFase('calculando')
      // Deixa a tela de carga pintar antes da conta (que roda de uma vez).
      timer = setTimeout(() => {
        const store = useGanguesStore.getState
        const territorioId = store().storyTarget?.territorioId
        const cena = CENAS_POR_ID[territorioId]
        const r = cena ? simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota: desligarAutomaticos, lutaEmAndamento: emAndamento, farmar: brigaAutoLigada() }) : null
        const poi = r?.poiId ? cena.pois.find(p => p.id === r.poiId) : null
        setResumo({ ...(r || { lutas: 0, niveis: {} }), segundos, lugar: poi?.i18n ? t(`${poi.i18n}.nome`) : '' })
        setFase('resultado')
      }, PAUSA_CALCULO_MS)
    }
    document.addEventListener('visibilitychange', aoMudar)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', aoMudar) }
  }, [t, luta])

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
          <button type="button" className="gang-farm-ausente__voltar" onClick={() => { setResumo(null); setFase('cena'); aoVoltar?.() }}>
            {t('games.gangues.farm_ausente.voltar')}
          </button>
        </div>
      </div>
    )
  }
  return children
}
