import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { ehConfrontoFinal } from './data/ganguesTerritorios.js'
import { getGanguesRosterLimitComHistoria } from './data/ganguesLoadout.js'
import useGanguesVictoryResolution from './hooks/useGanguesVictoryResolution.js'
import GanguesVictoryFinal from './GanguesVictoryFinal'
import GanguesVictoryReport from './GanguesVictoryReport'
import GanguesClubeResultado from './GanguesClubeResultado'
import './GanguesProgressionFlow.css'

// Orquestrador: decide qual das 3 telas finais mostrar (Clube da Luta,
// confronto final contra o Alan, ou o relatório normal) e resolve a
// vitória/derrota via useGanguesVictoryResolution. Extração completa em
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2.
export default function GanguesVictory({ onNavigate }) {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const store = useGanguesStore()
  const { match } = store
  const report = match.battleReport || { outcome: match.status, entries: [], initiative: [], combatants: [], rounds: 0 }
  const victory = report.outcome === 'victory'

  const storyAlvo = store.storyTarget
  // Torre (Modo Batalha) — luta avulsa de grind, sem cena/nó/POI. Só AP.
  const torre = Boolean(storyAlvo?.torre)
  const torreAndar = Number(storyAlvo?.torreAndar) || 1
  const clube = Boolean(storyAlvo?.clube)
  const emCena = Boolean(storyAlvo?.cenaId) && !torre
  const noModoHistoria = (Boolean(storyAlvo?.noId) || emCena) && !torre
  const cenaChefe = emCena && storyAlvo.isChefe
  const confrontoFinal = Boolean(storyAlvo?.noId) && ehConfrontoFinal(storyAlvo)
  // Território dominado nesta vitória? (chefe caiu, seja no fluxo de cena
  // da Pista ou na trilha dos outros bairros) — libera 1 vaga de recruta.
  const territorioDominado = victory && (cenaChefe || (noModoHistoria && !emCena && storyAlvo.isChefe))
  const podeRecrutar = territorioDominado
    && store.roster.length < getGanguesRosterLimitComHistoria(perfil?.tier, store.storyProgress, store.rep)
  const recrutar = () => { store.newSheet(); onNavigate('create') }

  const { levelUps, rewardSummary, clearLevelUps } = useGanguesVictoryResolution({
    store, user, report, victory, storyAlvo, match, torre, torreAndar,
    clube, emCena, noModoHistoria, cenaChefe, confrontoFinal, onNavigate,
  })

  // ── Clube da Luta — desfecho do gauntlet (ou derrota). Tela própria, épica. ──
  //  vitória LIMPA (sem dívida prévia e sem ajeites) = 200 de grana na mão;
  //  senão = quita a dívida. derrota = te remendam e te largam.
  if (clube) {
    // venceu ronda 1/2 → o hook já aplicou o dano persistente e mandou pra
    // 'clube-sala' (ver useGanguesVictoryResolution); não pisca a tela de
    // desfecho nesse frame.
    if (victory && (Number(storyAlvo?.clubeRonda) || 3) < 3) return null
    const entrouLimpo =
      Math.round(storyAlvo?.clubeDividaPrevia || 0) <= 0 &&
      Number(storyAlvo?.clubeHeals || 0) <= 0
    const voltar = () => {
      store.setStoryTarget(storyAlvo.voltar?.territorioId ? { territorioId: storyAlvo.voltar.territorioId } : null)
      onNavigate(storyAlvo.voltar?.territorioId ? 'territorio' : 'lobby')
    }
    return (
      <GanguesClubeResultado
        modo={victory ? 'vitoria' : 'derrota'}
        entrouLimpo={entrouLimpo}
        divida={Math.round(store.storyProgress?.__birosca?.divida || 0)}
        onVoltar={voltar}
      />
    )
  }

  // ── Confronto final contra o Alan — canon: Marelia não fica com você ──
  if (confrontoFinal && victory) {
    return <GanguesVictoryFinal t={t} gangName={store.gangName} podeRecrutar={podeRecrutar} recrutar={recrutar} onNavigate={onNavigate} />
  }

  return (
    <GanguesVictoryReport
      t={t} store={store} report={report} victory={victory} torre={torre}
      cenaChefe={cenaChefe} noModoHistoria={noModoHistoria} storyAlvo={storyAlvo}
      podeRecrutar={podeRecrutar} recrutar={recrutar} levelUps={levelUps}
      clearLevelUps={clearLevelUps} rewardSummary={rewardSummary} onNavigate={onNavigate}
    />
  )
}
