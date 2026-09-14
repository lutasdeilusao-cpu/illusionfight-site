import { useTrackedSession } from '../../lib/sessionAnalytics'

// Rastreamento de sessão pros jogos Kernel Games — não passam por
// FichaGateRoute (não têm gate de ficha), então precisam do próprio ponto
// de instrumentação pra cobrir quem entra direto pela URL (deep link),
// não só quem clica no card em Games.jsx. Ver FichaGateRoute.jsx pro
// equivalente dos jogos com ficha.
export default function GameSessionRoute({ gameId, gameName, children }) {
  useTrackedSession('game_open', 'game_time', { game_id: gameId, game_name: gameName, tier: 'free', category: 'kernel' })
  return children
}
