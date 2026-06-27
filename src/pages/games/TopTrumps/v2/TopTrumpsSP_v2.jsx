import { useEffect, useRef } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAchievements } from '../../../../context/AchievementsContext'
import { useEventos } from '../../../../context/EventosContext'
import { useReader } from '../../../../context/ReaderContext'
import { usePresence } from '../../../../hooks/usePresence'
import { getDeck } from '../../../../lib/getDeck'
import { registrarPartida, registrarPontuacaoRanking } from '../../../../hooks/useLeaderboardDB'
import { useTopTrumpsDeck } from './hooks/useTopTrumpsDeck'
import { useTopTrumpsRewards } from './hooks/useTopTrumpsRewards'
import { useTopTrumpsSP } from './hooks/useTopTrumpsSP'
import { useGameEffects } from './hooks/useGameEffects'
import MenuScreen from './components/MenuScreen/MenuScreen'
import GameScreen from './components/GameScreen/GameScreen'
import ResultScreen from './components/ResultScreen/ResultScreen'
import RewardScreen from './components/RewardScreen/RewardScreen'
import GameOverScreen from './components/GameOverScreen/GameOverScreen'
import Jokempo from '../../../../components/Jokempo/Jokempo'
import { attrNomeKey } from '../utils/attrNomeKey'
import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
import img01 from '../../../../assets/images/cards/characters/card-01.png'
import img02 from '../../../../assets/images/cards/characters/card-02.png'

const CARD_IMAGES = {
  1: img01, 2: img02,
}

function cardImage(carta) {
  return CARD_IMAGES[carta?.id] || cardFallback
}

export default function TopTrumpsSP_v2() {
  const { user, perfil } = useAuth()
  const { tt, locale } = useLanguage()
  const { desbloquear } = useAchievements()
  const { registrarEvento } = useEventos()
  const { setReaderMode } = useReader()
  const deck = getDeck(locale)
  const atributos = Object.entries(deck.meta.atributos_explicacao).map(([id, descricao]) => ({ id, nomeKey: attrNomeKey(id), descricao }))
  const maxAtrib = deck.cartas.reduce((acc, c) => { Object.entries(c.atributos).forEach(([k, v]) => { if (!acc[k] || v > acc[k]) acc[k] = v }); return acc }, {})

  usePresence({ userId: user?.id, modo: 'single', tier: perfil?.tier || 'free' })
  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const deckHook = useTopTrumpsDeck({ user, perfil, todasCartas: deck.cartas })
  const histRef = useRef([])
  const rewards = useTopTrumpsRewards({ user, deckUsuario: deckHook.deckUsuario, setDeckUsuario: deckHook.setDeckUsuario, todasCartas: deck.cartas, historicoRodadas: histRef.current, desbloquear, onRecompensaConfirmada: () => game.setFase('fim_jogo') })
  const effects = useGameEffects({ fase: game?.fase, confirmandoAtributo: game?.confirmandoAtributo })
  const game = useTopTrumpsSP({ user, deckUsuario: deckHook.deckUsuario, todasCartas: deck.cartas, atributos, jaGanhouHoje: rewards.jaGanhouHoje, tentativasMax: rewards.tentativasMax, consumir: rewards.consumir, registrarPartida, registrarEvento, registrarPontuacaoRanking, desbloquear, onEfeitosRevelacao: effects.iniciarEfeitosRevelacao, onFinalizarComRecompensa: (opcoes) => { game.setRecompensaOpcoes(opcoes); game.setFase('recompensa') } })
  histRef.current = game.historicoRodadas

  if (game.fase === 'menu') return <MenuScreen deckUsuario={deckHook.deckUsuario} todasCartas={deck.cartas} jaGanhouHoje={rewards.jaGanhouHoje} tentativasMax={rewards.tentativasMax} tentativasRestantes={rewards.tentativasRestantes} totalTurnos={game.totalTurnos} onSetTotalTurnos={(n) => game.setTotalTurnos(n)} onJogar={() => game.iniciarJogoComCartas()} user={user} locale={locale} tt={tt} />
  if (game.fase === 'ppt') return <section className="tt-page"><div className="tt-ppt-container"><Jokempo player1Name={tt('ppt_voce')} player2Name={tt('ppt_ia')} animated={true} onResult={(wn) => game.resolverPPT(wn)} i18nLabels={{ title: tt('ppt_titulo'), subtitle: tt('ppt_subtitulo'), rock: tt('ppt_pedra'), paper: tt('ppt_papel'), scissors: tt('ppt_tesoura'), you: tt('ppt_voce'), opponent: tt('ppt_ia'), win: tt('ppt_voce_vence'), lose: tt('ppt_ia_vence'), draw: tt('ppt_empate') }} /></div></section>
  if (game.fase === 'jogando') return <GameScreen cartaJogador={game.cartaJogador} cartaIA={game.cartaIA} cartaJogadorImg={cardImage(game.cartaJogador)} cartaIAImg={cardImage(game.cartaIA)} placar={game.placar} rodada={game.rodada} totalTurnos={game.totalTurnos} vezAtual={game.vezAtual} iaEscolhendo={game.iaEscolhendo} girando={game.girando} confirmandoAtributo={game.confirmandoAtributo} atributos={atributos} maxAtrib={maxAtrib} templateIdxJogador={game.templateIdxJogador} templateIdxIA={game.templateIdxIA} cortinaAtiva={effects.cortinaAtiva} onomaTexto={effects.onomaTexto} onClickAtributo={game.onClickAtributo} onCancelar={game.cancelarJogada} onConfirmar={game.confirmarJogada} onDesistir={game.handleDesistir} locale={locale} tt={tt} />
  if (game.fase === 'resultado_rodada') return <ResultScreen cartaJogador={game.cartaJogador} cartaIA={game.cartaIA} cartaJogadorImg={cardImage(game.cartaJogador)} cartaIAImg={cardImage(game.cartaIA)} atributoEscolhido={game.atributoEscolhido} resultado={game.resultado} placar={game.placar} rodada={game.rodada} totalTurnos={game.totalTurnos} swipeRevealed={game.swipeRevealed} onSwipeToggle={() => game.setSwipeRevealed(r => !r)} onProximaRodada={game.proximaRodada} particulas={effects.particulas} templateIdxJogador={game.templateIdxJogador} templateIdxIA={game.templateIdxIA} atributos={atributos} locale={locale} tt={tt} />
  if (game.fase === 'recompensa') return <RewardScreen opcoes={game.recompensaOpcoes} selecionada={game.cartaRecompensaSelecionada} onSelecionar={(c) => game.setCartaRecompensaSelecionada(c)} onConfirmar={() => rewards.escolherRecompensa(game.cartaRecompensaSelecionada)} locale={locale} tt={tt} cardImage={cardImage} />
  if (game.fase === 'fim_jogo') return <GameOverScreen placar={game.placar} historicoRodadas={game.historicoRodadas} jaGanhouHoje={rewards.jaGanhouHoje} user={user} atributos={atributos} onJogarNovamente={() => game.setFase('menu')} tt={tt} />
  return null
}
