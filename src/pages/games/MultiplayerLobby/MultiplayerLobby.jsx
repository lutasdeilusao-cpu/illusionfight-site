import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useReader } from '../../../context/ReaderContext'
import useSharedLobbyMachine from './useSharedLobbyMachine'
import './MultiplayerLobby.css'

export default function MultiplayerLobby() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('game') || 'toptrumps'
  const modeId = searchParams.get('mode') || 'free'

  const openMatch = useCallback((roomId) => {
    navigate(`/games/toptrumps/multiplayer?sala=${roomId}`, { replace: true })
  }, [navigate])

  const { state, retry, cancel } = useSharedLobbyMachine({
    gameId,
    modeId,
    userId: user?.id,
    onMatch: openMatch
  })

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const leaveLobby = async () => {
    await cancel()
    navigate('/games/toptrumps')
  }

  return (
    <section className="shared-lobby-page">
      <header className="shared-lobby-header">
        <span className="shared-lobby-kicker">{t('multiplayer_lobby.live_kicker')}</span>
        <h1>{t('multiplayer_lobby.live_title')}</h1>
        <p>{t('multiplayer_lobby.live_description')}</p>
      </header>

      <div className="shared-lobby-game-badge">
        <span>{t('multiplayer_lobby.origin')}</span>
        <strong>Top Trumps</strong>
        <small>{t('multiplayer_lobby.real_match')}</small>
      </div>

      <div className="shared-lobby-arena">
        {(state.phase === 'connecting' || state.phase === 'searching') && (
          <div className="shared-lobby-status">
            <div className="shared-lobby-radar" aria-hidden="true"><span /></div>
            <strong>{state.phase === 'connecting' ? t('multiplayer_lobby.connecting') : t('multiplayer_lobby.waiting_player')}</strong>
            <p>{t('multiplayer_lobby.waiting_real_room')}</p>
            {state.roomId && <small>{t('multiplayer_lobby.room_confirmed')} {state.roomId}</small>}
          </div>
        )}

        {state.phase === 'matched' && (
          <div className="shared-lobby-status shared-lobby-status--matched">
            <strong>{t('multiplayer_lobby.match_ready')}</strong>
            <p>{t('multiplayer_lobby.opening_toptrumps')}</p>
          </div>
        )}

        {state.phase === 'error' && (
          <div className="shared-lobby-status shared-lobby-status--error">
            <strong>{t('multiplayer_lobby.connection_error')}</strong>
            <p>{t('multiplayer_lobby.connection_error_detail')}</p>
            <button className="shared-lobby-primary" onClick={retry}>{t('multiplayer_lobby.try_again')}</button>
          </div>
        )}
      </div>

      <footer className="shared-lobby-footer">
        <span>{t('multiplayer_lobby.database_queue')}</span>
        <code>{gameId}:{modeId}</code>
        <button className="shared-lobby-back" onClick={leaveLobby}>{t('multiplayer_lobby.cancel')}</button>
      </footer>
    </section>
  )
}
