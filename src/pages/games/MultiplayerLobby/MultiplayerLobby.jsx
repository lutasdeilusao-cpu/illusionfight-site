import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useReader } from '../../../context/ReaderContext'
import useSharedLobbyMachine from './useSharedLobbyMachine'
import './MultiplayerLobby.css'

export default function MultiplayerLobby() {
  const { t } = useLanguage()
  const { user, perfil } = useAuth()
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('game') || 'multiplayer-test'
  const modeId = searchParams.get('mode') || 'parity'
  const rulesVersion = searchParams.get('version') || '1.0.0'
  const { state, queueKey, clientId, chooseNumber, resetRound } = useSharedLobbyMachine({
    gameId,
    modeId,
    rulesVersion,
    user,
    displayName: perfil?.nome || user?.email?.split('@')[0]
  })

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const myIndex = state.players.findIndex(player => player.clientId === clientId)
  const me = myIndex >= 0 ? state.players[myIndex] : null
  const opponent = myIndex >= 0 ? state.players[myIndex === 0 ? 1 : 0] : null
  const myChoice = state.choices[clientId] || null
  const opponentChoice = opponent ? state.choices[opponent.clientId] || null : null
  const myParity = myIndex === 0 ? 'even' : 'odd'
  const iWon = state.result?.winnerId === clientId

  return (
    <section className="shared-lobby-page">
      <header className="shared-lobby-header">
        <span className="shared-lobby-kicker">{t('multiplayer_lobby.live_kicker')}</span>
        <h1>{t('multiplayer_lobby.live_title')}</h1>
        <p>{t('multiplayer_lobby.live_description')}</p>
      </header>

      <div className="shared-lobby-game-badge">
        <span>{t('multiplayer_lobby.origin')}</span>
        <strong>{gameId}</strong>
        <small>{modeId} · v{rulesVersion}</small>
      </div>

      <div className="shared-lobby-arena">
        {state.connectionStatus !== 'subscribed' && (
          <div className="shared-lobby-status">
            <div className="shared-lobby-spinner" aria-hidden="true" />
            <strong>{t('multiplayer_lobby.connecting')}</strong>
          </div>
        )}

        {state.connectionStatus === 'subscribed' && state.phase === 'searching' && (
          <div className="shared-lobby-status">
            <div className="shared-lobby-radar" aria-hidden="true"><span /></div>
            <strong>{t('multiplayer_lobby.waiting_player')}</strong>
            <p>{t('multiplayer_lobby.open_second_client')}</p>
          </div>
        )}

        {(state.phase === 'matched' || state.phase === 'result') && (
          <>
            <div className="shared-lobby-versus">
              <div className="shared-lobby-player shared-lobby-player--me">
                <span>{t('multiplayer_lobby.you')}</span>
                <strong>{me?.displayName}</strong>
                <small>{t(`multiplayer_lobby.${myParity}`)}</small>
              </div>
              <b>{t('multiplayer_lobby.versus')}</b>
              <div className="shared-lobby-player">
                <span>{t('multiplayer_lobby.opponent')}</span>
                <strong>{opponent?.displayName}</strong>
                <small>{t(`multiplayer_lobby.${myParity === 'even' ? 'odd' : 'even'}`)}</small>
              </div>
            </div>

            <div className="shared-lobby-proof">
              <h2>{t('multiplayer_lobby.choose_number')}</h2>
              <div className="shared-lobby-numbers">
                {[1, 2, 3, 4, 5].map(number => (
                  <button key={number} className={myChoice === number ? 'is-selected' : ''} disabled={Boolean(myChoice)} onClick={() => chooseNumber(number)}>{number}</button>
                ))}
              </div>
              {myChoice && !opponentChoice && <p>{t('multiplayer_lobby.waiting_choice')}</p>}
            </div>

            {state.phase === 'result' && (
              <div className={`shared-lobby-result shared-lobby-result--${iWon ? 'win' : 'lose'}`}>
                <span>{iWon ? t('multiplayer_lobby.you_won') : t('multiplayer_lobby.you_lost')}</span>
                <strong>{myChoice} + {opponentChoice} = {state.result.sum}</strong>
                <p>{t(`multiplayer_lobby.result_${state.result.parity}`)}</p>
                <button className="shared-lobby-primary" onClick={resetRound}>{t('multiplayer_lobby.play_again')}</button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="shared-lobby-footer">
        <span>{t('multiplayer_lobby.realtime_connected')}</span>
        <code>{queueKey}</code>
        <button className="shared-lobby-back" onClick={() => navigate('/games')}>{t('multiplayer_lobby.back')}</button>
      </footer>
    </section>
  )
}
