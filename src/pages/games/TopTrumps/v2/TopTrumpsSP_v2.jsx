import { useTopTrumpsDeck } from './hooks/useTopTrumpsDeck'
import { useTopTrumpsRewards } from './hooks/useTopTrumpsRewards'
import { useGameEffects } from './hooks/useGameEffects'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { getDeck } from '../../../../lib/getDeck'
import FireParticles from './components/FireParticles/FireParticles'
import SoundToggle from './components/SoundToggle/SoundToggle'
import GameHUD from './components/GameHUD/GameHUD'

export default function TopTrumpsSP_v2() {
  const { user, perfil } = useAuth()
  const { locale } = useLanguage()
  const deck = getDeck(locale)

  const { deckUsuario } = useTopTrumpsDeck({
    user, perfil, todasCartas: deck.cartas
  })

  const rewards = useTopTrumpsRewards({
    user,
    deckUsuario,
    setDeckUsuario: () => {},
    todasCartas: deck.cartas,
    historicoRodadas: [],
    desbloquear: () => {},
    onRecompensaConfirmada: () => {}
  })

  const { somAtivo, toggleSom } = useGameEffects({ fase: 'menu', confirmandoAtributo: null })

  console.log('[v2] deckUsuario carregado:', deckUsuario.length, 'cartas')

  return (
    <>
      <FireParticles />
      <SoundToggle ativo={somAtivo} onToggle={toggleSom} labelAtivo={'\uD83D\uDD0A'} labelInativo={'\uD83D\uDD07'} />
      <GameHUD rodada={1} totalTurnos={5} placarJogador={0} placarIA={0} labelVoce="VOC\u00CA" labelIA="IA" />
      <div style={{ color: '#fff', padding: '2rem', fontFamily: 'sans-serif' }}>
        TopTrumps v2 — fase 2 ok — {deckUsuario.length} cartas
      </div>
    </>
  )
}
