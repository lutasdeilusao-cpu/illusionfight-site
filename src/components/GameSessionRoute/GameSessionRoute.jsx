import { useTrackedSession } from '../../lib/sessionAnalytics'

// Rastreamento de sessão de jogo (game_open/game_time), que cobre também quem
// entra direto pela URL, não só quem clica no card em Games.jsx.
export default function GameSessionRoute({ gameId, gameName, category = 'kernel', children }) {
  useTrackedSession('game_open', 'game_time', { game_id: gameId, game_name: gameName, tier: 'free', category })
  return children
}
