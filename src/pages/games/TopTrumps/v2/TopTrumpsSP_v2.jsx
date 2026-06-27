import { useTopTrumpsDeck } from './hooks/useTopTrumpsDeck'
import { useTopTrumpsRewards } from './hooks/useTopTrumpsRewards'
import { useTopTrumpsSP } from './hooks/useTopTrumpsSP'
import { useGameEffects } from './hooks/useGameEffects'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAchievements } from '../../../../context/AchievementsContext'
import { useEventos } from '../../../../context/EventosContext'
import { useReader } from '../../../../context/ReaderContext'
import { getDeck } from '../../../../lib/getDeck'
import { registrarPartida, registrarPontuacaoRanking } from '../../../../hooks/useLeaderboardDB'

function attrNomeKey(id) {
  const map = {
    rank_sdr: 'atributo_rank_sdr', poder_mental: 'atributo_poder_mental',
    velocidade: 'atributo_velocidade', resistencia: 'atributo_resistencia',
    nivel_xama: 'atributo_nivel_xama', fator_caos: 'atributo_fator_caos',
    energia_base: 'atributo_energia_base',
  }
  return map[id] || 'atributo_poder_explosivo'
}

export default function TopTrumpsSP_v2() {
  const { user, perfil } = useAuth()
  const { tt, locale } = useLanguage()
  const { desbloquear } = useAchievements()
  const { registrarEvento } = useEventos()
  const { setReaderMode } = useReader()
  const deck = getDeck(locale)
  const atributos = Object.entries(deck.meta.atributos_explicacao)
    .map(([id, descricao]) => ({ id, nomeKey: attrNomeKey(id), descricao }))

  const deckHook = useTopTrumpsDeck({ user, perfil, todasCartas: deck.cartas })
  const effects = useGameEffects({ fase: 'menu', confirmandoAtributo: null })
  const rewards = useTopTrumpsRewards({
    user, deckUsuario: deckHook.deckUsuario, setDeckUsuario: deckHook.setDeckUsuario,
    todasCartas: deck.cartas, historicoRodadas: [],
    desbloquear, onRecompensaConfirmada: () => {}
  })

  const game = useTopTrumpsSP({
    user, deckUsuario: deckHook.deckUsuario, todasCartas: deck.cartas, atributos,
    jaGanhouHoje: rewards.jaGanhouHoje, tentativasMax: rewards.tentativasMax,
    consumir: rewards.consumir, registrarPartida, registrarEvento, registrarPontuacaoRanking,
    desbloquear,
    onEfeitosRevelacao: effects.iniciarEfeitosRevelacao,
    onFinalizarComRecompensa: () => {}
  })

  console.log('[v2] fase:', game.fase, '| deck:', deckHook.deckUsuario.length)
  return <div style={{ color: '#fff', padding: '2rem', fontFamily: 'sans-serif' }}>
    v2 fase 3 ok — fase: {game.fase}
  </div>
}
