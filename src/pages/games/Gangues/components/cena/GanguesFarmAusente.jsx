import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { CENAS_POR_ID } from '../../data/cenas/cenaHelpers.js'
import { brigaAutoLigada, desligarAutomaticos } from '../../hooks/useGanguesBrigaAutomatica.js'
import { simularFarmAusente, lutaAoVivo, lutaRepetivel } from '../../engine/ganguesFarmAusente.js'
import enemiesData from '../../data/gangues-enemies.json'

// Farm ausente (ver engine/ganguesFarmAusente.js). Envolve a CENA, a LUTA e
// a tela de VITÓRIA (por onde o avanço automático passa entre luta e rua).
// App em segundo plano por MENOS de 3 minutos: nada muda — troca rápida de
// app não dispara nada (Isaias, 28/09/2026). Bateu 3 minutos no fundo:
// • cena: com a briga automática ligada, a cena é DESMONTADA (imagens,
//   animações e relógios somem da memória);
// • luta (`luta`): numa luta de rua da cena com o automático ligado, a tela
//   da luta é desmontada (som e relógios param) e o estado vivo dela
//   (lutaAoVivo) é guardado pra ser terminado por cálculo. Chefe, Clube e
//   Torre ficam de fora.
// Na volta: tela de carga, a conta do tempo TODO fora (os 3 minutos
// inclusos) e o resumo; o "voltar" leva pra rua (`aoVoltar` — na luta, a
// cena daquele bairro: o ponto da briga ou a birosca). Se o celular congelou
// a aba e a espera de 3 minutos nem disparou, a conta sai igual na volta.
// Fechar a aba perde tudo: o instante da saída mora só na memória da página.
const GANGUES_FARM_ESPERA_MS = 3 * 60 * 1000
// Instante em que o app foi pro fundo — um só pra cena e luta: nos 3 minutos
// de espera o jogo segue vivo e a tropa pode sair da rua pra uma luta (ou
// voltar dela); quem estiver montado quando a espera acabar é que desmonta.
const ausencia = { desde: null }

function lutaElegivel() {
  const viva = lutaAoVivo.ler?.()
  return viva && viva.auto && !viva.terminou && lutaRepetivel(useGanguesStore.getState().storyTarget) ? viva : null
}
const PAUSA_CALCULO_MS = 700

export default function GanguesFarmAusente({ children, luta = false, vitoria = false, aoVoltar }) {
  const { t } = useLanguage()
  const [fase, setFase] = useState('cena') // cena | fora | calculando | resultado
  const [resumo, setResumo] = useState(null)
  const lutaGuardada = useRef(null)
  const desmontada = useRef(false)

  useEffect(() => {
    let espera, timer
    // Desmonta a tela (se esta tela vale pro farm) — devolve se desmontou.
    const desmontar = () => {
      if (desmontada.current) return true
      const viva = luta ? lutaElegivel() : null
      // Tela de vitória (vitoria): a luta acabou no automático durante a
      // espera e o avanço automático ainda não voltou pra rua — vale igual
      // à rua, farmando essa luta (a derrota desliga a briga automática).
      if (luta ? !viva : !brigaAutoLigada() || (vitoria && !lutaRepetivel(useGanguesStore.getState().storyTarget))) return false
      lutaGuardada.current = viva
      desmontada.current = true
      setFase('fora')
      return true
    }
    const armarEspera = () => {
      clearTimeout(espera)
      espera = setTimeout(desmontar, Math.max(0, GANGUES_FARM_ESPERA_MS - (Date.now() - ausencia.desde)))
    }
    const aoMudar = () => {
      if (document.hidden) {
        if (!ausencia.desde) ausencia.desde = Date.now()
        armarEspera()
        return
      }
      clearTimeout(espera)
      if (!ausencia.desde) return
      const ms = Date.now() - ausencia.desde
      ausencia.desde = null
      if (ms < GANGUES_FARM_ESPERA_MS || !desmontar()) return // troca rápida (ou tela fora do farm): segue o jogo
      const emAndamento = lutaGuardada.current
      lutaGuardada.current = null
      desmontada.current = false
      const segundos = ms / 1000
      setFase('calculando')
      // Deixa a tela de carga pintar antes da conta (que roda de uma vez).
      timer = setTimeout(() => {
        const store = useGanguesStore.getState
        const territorioId = store().storyTarget?.territorioId
        const cena = CENAS_POR_ID[territorioId]
        const r = cena ? simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota: desligarAutomaticos, lutaEmAndamento: emAndamento, farmar: Boolean(emAndamento) || brigaAutoLigada() }) : null
        const poi = r?.poiId ? cena.pois.find(p => p.id === r.poiId) : null
        const lugar = poi?.i18n ? t(`${poi.i18n}.nome`) : r?.poiId === '__aleatorio' ? t('games.gangues.farm_ausente.na_rua') : ''
        setResumo({ ...(r || { lutas: 0, niveis: {} }), segundos, lugar })
        setFase('resultado')
      }, PAUSA_CALCULO_MS)
    }
    document.addEventListener('visibilitychange', aoMudar)
    // Montou já com o app no fundo (ex.: a luta começou durante a espera):
    // continua a mesma contagem de 3 minutos. Montou com o app na frente e
    // uma saída ainda marcada: a volta caiu numa tela fora do farm — essa
    // saída já passou, não pode virar farm na próxima ida pro fundo.
    if (document.hidden && ausencia.desde) armarEspera()
    else if (!document.hidden) ausencia.desde = null
    return () => { clearTimeout(espera); clearTimeout(timer); document.removeEventListener('visibilitychange', aoMudar) }
  }, [t, luta, vitoria])

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
              <div><dt>{t('games.gangues.farm_ausente.rep')}</dt><dd>{resumo.rep < 0 ? resumo.rep : `+${resumo.rep}`}</dd></div>
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
          {resumo.meioNaoConta && resumo.lutas > 0 && <p className="gang-farm-ausente__aviso">{t('games.gangues.farm_ausente.meio_nao_conta')}</p>}
          <button type="button" className="gang-farm-ausente__voltar" onClick={() => { setResumo(null); setFase('cena'); aoVoltar?.() }}>
            {t('games.gangues.farm_ausente.voltar')}
          </button>
        </div>
      </div>
    )
  }
  return children
}
