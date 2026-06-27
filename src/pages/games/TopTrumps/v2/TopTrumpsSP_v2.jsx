import { useTopTrumpsDeck } from './hooks/useTopTrumpsDeck'
import { useTopTrumpsRewards } from './hooks/useTopTrumpsRewards'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { getDeck } from '../../../../lib/getDeck'

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

  console.log('[v2] deckUsuario carregado:', deckUsuario.length, 'cartas')

  return (
    <div style={{ color: '#fff', padding: '2rem', fontFamily: 'sans-serif' }}>
      TopTrumps v2 — fase 1 ok — {deckUsuario.length} cartas
      <br />
      Tentativas: {rewards.tentativasRestantes}/{rewards.tentativasMax}
    </div>
  )
}
