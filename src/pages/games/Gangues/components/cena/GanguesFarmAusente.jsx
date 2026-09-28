import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { CENAS_POR_ID } from '../../data/cenas/cenaHelpers.js'
import { brigaAutoLigada, desligarAutomaticos } from '../../hooks/useGanguesBrigaAutomatica.js'
import { simularFarmAusente, lutaAoVivo, lutaRepetivel, ultimaLuta } from '../../engine/ganguesFarmAusente.js'
import enemiesData from '../../data/gangues-enemies.json'

// Farm ausente (ver engine/ganguesFarmAusente.js). Envolve a CENA, a LUTA e
// a tela de VITÓRIA (por onde o avanço automático passa entre luta e rua).
//
// O PONTO DE SAÍDA MORA NO SAVE (Isaias, 28/09/2026: "voltei, tava em tela
// preta, não me mostrou relatório... se o cara ficou upando, isso tem que
// estar guardado no save dele"). App foi pro fundo numa tela que vale pro
// farm → grava NA HORA a marca `storyProgress.__farmAusente` = { desde,
// territorioId, alvo, luta, ids, farmar } (store.marcarFarmAusente, sem
// debounce). Assim, se o celular descartar a aba, a volta — mesmo com a
// página recarregada, ao abrir o save — acha a marca e calcula o tempo fora.
// • menos de 3 minutos fora: nada muda (troca rápida de app), a marca some;
// • 3 minutos no fundo com a página viva: a tela é DESMONTADA (imagens,
//   animações, som e relógios somem da memória) e a marca ganha a foto mais
//   nova (a luta do jeito que estava);
// • volta: tela de carga, a conta do tempo TODO fora (os 3 minutos inclusos)
//   e o resumo; o "voltar" leva pra rua (`aoVoltar`).
// Quem vale: luta de bairro com o automático ligado (`luta`, chefe/Clube/Torre
// não), a cena com a briga automática ligada, e a vitória de uma luta de
// bairro com a briga automática ligada (`vitoria`). Tela que NÃO vale e monta
// com o app no fundo (ex.: a luta acabou e o automático da rua tava
// desligado) apaga a marca — a tropa parou de farmar ali.
const GANGUES_FARM_ESPERA_MS = 3 * 60 * 1000
const PAUSA_CALCULO_MS = 700

const marcaAtual = () => useGanguesStore.getState().storyProgress?.__farmAusente || null

// O que esta tela deixa na marca de saída — null se ela não vale pro farm.
function fotoDaTela({ luta, vitoria }) {
  const st = useGanguesStore.getState()
  if (luta) {
    const viva = lutaAoVivo.ler?.()
    const alvo = lutaRepetivel(st.storyTarget)
    // Luta já acabou (tela de resultado, a vitória vem em seguida): vale igual
    // à vitória — sem luta pra terminar, farma essa mesma luta depois.
    if (viva?.terminou) return brigaAutoLigada() && alvo ? { territorioId: alvo.territorioId, alvo, luta: null, ids: null, farmar: true } : null
    if (!viva || !viva.auto || !alvo || !viva.combatants?.length) return null
    return { territorioId: alvo.territorioId, alvo, luta: { combatants: viva.combatants, round: viva.round || 1 }, ids: (st.match.playerTeam || []).map(m => m.id), farmar: true }
  }
  if (!brigaAutoLigada()) return null
  const territorioId = st.storyTarget?.territorioId
  if (!CENAS_POR_ID[territorioId]) return null
  const alvo = lutaRepetivel(vitoria ? st.storyTarget : ultimaLuta.alvo)
  if (vitoria && !alvo) return null
  return { territorioId, alvo: alvo || null, luta: null, ids: null, farmar: true }
}

export default function GanguesFarmAusente({ children, luta = false, vitoria = false, aoVoltar }) {
  const { t } = useLanguage()
  const tRef = useRef(t); tRef.current = t
  const [fase, setFase] = useState('cena') // cena | fora | calculando | resultado

  const [resumo, setResumo] = useState(null)

  useEffect(() => {
    let espera, timer
    const store = useGanguesStore.getState
    // Grava/atualiza a marca com a foto desta tela (mantém o `desde` de quem
    // saiu primeiro). Tela que não vale apaga a marca. Devolve se vale.
    const anotar = () => {
      const foto = fotoDaTela({ luta, vitoria })
      if (!foto) { store().limparFarmAusente(); return false }
      store().marcarFarmAusente({ ...foto, desde: marcaAtual()?.desde || Date.now() })
      return true
    }
    const armar = () => {
      clearTimeout(espera)
      const m = marcaAtual()
      if (!m) return
      const acabou = () => {
        // A luta acabou agora: a tela de vitória (que aplica o prêmio dela)
        // tem que montar antes — ela mesma desmonta, que também é farm.
        if (luta && lutaAoVivo.ler?.()?.terminou) { espera = setTimeout(acabou, 3000); return }
        if (anotar()) setFase('fora')
      }
      espera = setTimeout(acabou, Math.max(0, GANGUES_FARM_ESPERA_MS - (Date.now() - m.desde)))
    }
    // App na frente com uma marca de saída: faz a conta (ou descarta se foi
    // troca rápida). Sem marca, nunca fica preso na tela desmontada.
    const processar = () => {
      clearTimeout(espera)
      const m = marcaAtual()
      const ms = m ? Date.now() - m.desde : 0
      if (!m || ms < GANGUES_FARM_ESPERA_MS) {
        if (m) store().limparFarmAusente()
        setFase(f => (f === 'fora' ? 'cena' : f))
        return
      }
      setFase('calculando')
      // Deixa a tela de carga pintar antes da conta (que roda de uma vez).
      timer = setTimeout(() => {
        const cena = CENAS_POR_ID[m.territorioId]
        const segundos = ms / 1000
        store().limparFarmAusente()
        const r = cena ? simularFarmAusente({ store, cena, territorioId: m.territorioId, segundos, enemiesData, onDerrota: desligarAutomaticos, lutaEmAndamento: m.luta, alvoMarcado: m.alvo, idsMarcados: m.ids, farmar: m.farmar !== false }) : null
        const poi = r?.poiId ? cena.pois.find(p => p.id === r.poiId) : null
        const lugar = poi?.i18n ? tRef.current(`${poi.i18n}.nome`) : r?.poiId === '__aleatorio' ? tRef.current('games.gangues.farm_ausente.na_rua') : ''
        setResumo({ ...(r || { lutas: 0, niveis: {} }), segundos, lugar })
        setFase('resultado')
      }, PAUSA_CALCULO_MS)
    }
    const aoMudar = () => {
      if (!document.hidden) { processar(); return }
      if (anotar()) armar()
    }
    document.addEventListener('visibilitychange', aoMudar)
    // Montou com o app no fundo (a luta começou/acabou durante a espera):
    // atualiza a marca e segue a mesma contagem de 3 minutos. Montou com o
    // app na frente e uma marca no save (página recarregada depois de a aba
    // ser descartada, ou a volta caiu numa tela fora do farm): faz a conta.
    if (document.hidden) { if (marcaAtual() && anotar()) armar() }
    else if (marcaAtual()) processar()
    return () => { clearTimeout(espera); clearTimeout(timer); document.removeEventListener('visibilitychange', aoMudar) }
  }, [luta, vitoria])

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
