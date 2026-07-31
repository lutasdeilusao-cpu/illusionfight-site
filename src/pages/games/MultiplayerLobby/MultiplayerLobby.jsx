import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useReader } from '../../../context/ReaderContext'
import useSharedLobbyMachine from './useSharedLobbyMachine'
import './MultiplayerLobby.css'

const GAME_OPTIONS = ['toptrumps', 'duelo']
const MODE_OPTIONS = ['standard', 'ranked']

export default function MultiplayerLobby() {
  const { t } = useLanguage()
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const gameId = searchParams.get('game') || 'toptrumps'
  const modeId = searchParams.get('mode') || 'standard'
  const rulesVersion = searchParams.get('version') || '1.0.0'
  const { state, dispatch, queueKey } = useSharedLobbyMachine({ gameId, modeId, rulesVersion })

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  useEffect(() => {
    if (state.phase !== 'searching') return
    const timer = setTimeout(() => {
      dispatch({
        type: 'MATCH_FOUND',
        queueKey,
        roomId: `demo-${Date.now()}`,
        opponentId: 'demo-opponent'
      })
    }, 3000)
    return () => clearTimeout(timer)
  }, [dispatch, queueKey, state.phase])

  function updateConfig(key, value) {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    setSearchParams(next)
  }

  return (
    <section className="shared-lobby-page">
      <header className="shared-lobby-header">
        <span className="shared-lobby-kicker">{t('multiplayer_lobby.kicker')}</span>
        <h1>{t('multiplayer_lobby.title')}</h1>
        <p>{t('multiplayer_lobby.description')}</p>
      </header>

      <div className="shared-lobby-panel">
        <div className="shared-lobby-field">
          <label htmlFor="shared-lobby-game">{t('multiplayer_lobby.game')}</label>
          <select id="shared-lobby-game" value={gameId} onChange={(event) => updateConfig('game', event.target.value)} disabled={state.phase !== 'idle'}>
            {GAME_OPTIONS.map(option => <option key={option} value={option}>{t(`multiplayer_lobby.games.${option}`)}</option>)}
          </select>
        </div>

        <div className="shared-lobby-field">
          <label htmlFor="shared-lobby-mode">{t('multiplayer_lobby.mode')}</label>
          <select id="shared-lobby-mode" value={modeId} onChange={(event) => updateConfig('mode', event.target.value)} disabled={state.phase !== 'idle'}>
            {MODE_OPTIONS.map(option => <option key={option} value={option}>{t(`multiplayer_lobby.modes.${option}`)}</option>)}
          </select>
        </div>

        <div className="shared-lobby-field">
          <label htmlFor="shared-lobby-version">{t('multiplayer_lobby.rules_version')}</label>
          <input id="shared-lobby-version" value={rulesVersion} onChange={(event) => updateConfig('version', event.target.value)} disabled={state.phase !== 'idle'} />
        </div>

        <div className="shared-lobby-queue">
          <span>{t('multiplayer_lobby.queue_identity')}</span>
          <code>{queueKey}</code>
          <p>{t('multiplayer_lobby.queue_explanation')}</p>
        </div>

        {state.phase === 'idle' && (
          <button className="shared-lobby-primary" onClick={() => dispatch({ type: 'SEARCH' })}>{t('multiplayer_lobby.search')}</button>
        )}

        {state.phase === 'searching' && (
          <div className="shared-lobby-status">
            <div className="shared-lobby-spinner" aria-hidden="true" />
            <strong>{t('multiplayer_lobby.searching')}</strong>
            <p>{t('multiplayer_lobby.searching_key', { key: queueKey })}</p>
            <button className="shared-lobby-secondary" onClick={() => dispatch({ type: 'CANCEL' })}>{t('multiplayer_lobby.cancel')}</button>
          </div>
        )}

        {state.phase === 'match_ready' && (
          <div className="shared-lobby-status shared-lobby-status--ready">
            <strong>{t('multiplayer_lobby.match_ready')}</strong>
            <p>{t('multiplayer_lobby.room_created', { room: state.roomId })}</p>
            <p>{t('multiplayer_lobby.integration_pending')}</p>
            <button className="shared-lobby-primary" onClick={() => dispatch({ type: 'RESET' })}>{t('multiplayer_lobby.test_again')}</button>
          </div>
        )}
      </div>

      <button className="shared-lobby-back" onClick={() => navigate('/games')}>{t('multiplayer_lobby.back')}</button>
    </section>
  )
}
