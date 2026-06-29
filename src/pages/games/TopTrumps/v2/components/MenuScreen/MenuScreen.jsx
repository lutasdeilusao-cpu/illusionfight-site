import { useState } from 'react'
import { Link } from 'react-router-dom'
import BackToGamesBtn from '../../../../../../components/BackToGamesBtn/BackToGamesBtn'
import CardViewerModal from '../../../components/CardViewerModal'
import DeckBuilder from '../../../components/DeckBuilder'
import DeckStartModal from '../../../components/DeckStartModal'

export default function MenuScreen({
  deckUsuario, todasCartas, jaGanhouHoje, tentativasMax, tentativasRestantes,
  totalTurnos, onSetTotalTurnos, onJogar, user, locale, tt
}) {
  const [menuStep, setMenuStep] = useState(null)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [showDeckStart, setShowDeckStart] = useState(false)
  const [modalMultiplayerLocked, setModalMultiplayerLocked] = useState(false)
  const [viewerIdx, setViewerIdx] = useState(null)

  const pct = deckUsuario.length / todasCartas.length * 100
  const maxTurnos = deckUsuario.length

  return (
    <section className="tt-page tt-page--menu"><div className="tt-menu-bg" /><div className="tt-menu-layout">
      <div className="tt-menu-cards"><div className="tt-card-stack">
        <div className="tt-card-sample tt-card-sample--1" /><div className="tt-card-sample tt-card-sample--2" />
        <div className="tt-card-sample tt-card-sample--3"><div className="tt-card-sample-pattern" /><div className="tt-card-sample-logo">LDI</div></div>
      </div></div>
      <div className="tt-menu-content">
        <div className="tt-title-group"><h1 className="tt-title-main">{tt('menu_titulo')}</h1></div>
        <p className="tt-title-desc">{tt('menu_desc')}</p>
        {user && (
          <div className="tt-colecao">
            <span className="tt-colecao-label">{tt('menu_cartas_coletadas', { n: deckUsuario.length, total: todasCartas.length })}</span>
            <div className="tt-colecao-bar"><div className="tt-colecao-bar-fill" ref={el => { if (el) el.style.setProperty('--fill', `${pct}%`) }} /></div>
          </div>
        )}
        <>
          {!user && menuStep !== 'config' && (
            <div className="tt-guest-aviso-previo">
              <p className="tt-guest-aviso-texto">{tt('guest_aviso_previo')}</p>
              <Link to="/cadastro" className="tt-guest-aviso-link">{tt('guest_aviso_criar_conta')}</Link>
            </div>
          )}
          {(!menuStep || menuStep === 'modo') && (
            <div className="tt-modos">
              <div className="tt-modo-card" onClick={() => setMenuStep('config')}>
                <h3 className="tt-modo-titulo">{tt('menu_single_player')}</h3><p className="tt-modo-desc">{tt('menu_single_desc')}</p>
              </div>
              {user ? (
                <Link to="/games/toptrumps/lobby" className="tt-modo-card">
                  <h3 className="tt-modo-titulo">{tt('menu_multiplayer')}</h3><p className="tt-modo-desc">{tt('menu_multi_desc')}</p>
                </Link>
              ) : (
                <div className="tt-modo-card tt-modo-card--locked" onClick={() => setModalMultiplayerLocked(true)}>
                  <h3 className="tt-modo-titulo">{tt('menu_multiplayer')}</h3>
                  <p className="tt-modo-desc">{tt('menu_multi_desc')}</p>
                  <span className="tt-modo-card-lock-icon">{'\uD83D\uDD12'}</span>
                </div>
              )}
            </div>
          )}
          {menuStep === 'config' && (
            <div className="tt-config tt-fade-in">
              <span className="tt-config-label">{tt('menu_num_turnos')}</span>
              <div className="tt-config-turnos">
                {[5, 10, 15, 20].map(n => (
                  <button key={n}
                    className={`tt-config-turno-btn${totalTurnos === n ? ' tt-config-turno-btn--ativo' : ''}`}
                    disabled={n > maxTurnos}
                    onClick={() => onSetTotalTurnos(n)}>{n}</button>
                ))}
              </div>
              {user && (
                jaGanhouHoje ? (
                  <div className="tt-ja-ganhou-hoje">
                    <span className="tt-ja-ganhou-icone">{'\uD83C\uDFC6'}</span>
                    <p className="tt-ja-ganhou-texto">{tt('menu_ja_ganhou')}</p>
                  </div>
                ) : deckUsuario.length >= todasCartas.length ? (
                  <div className="tt-ja-ganhou-hoje">
                    <span className="tt-ja-ganhou-icone">{'\uD83C\uDFC6'}</span>
                    <p className="tt-ja-ganhou-texto">{tt('menu_ja_ganhou_todas')}</p>
                  </div>
                ) : (
                  <div className="tt-config-tentativas">
                    {Array.from({length: tentativasMax}).map((_, i) => (<span key={i} className={`tt-tentativa-dot${i < (tentativasMax - tentativasRestantes) ? ' tt-tentativa-dot--gasta' : ''}`} />))}
                    <span className="tt-tentativa-texto">{tt('menu_tentativas', { restantes: tentativasRestantes, max: tentativasMax })}</span>
                  </div>
                )
              )}
              <button className={`tt-btn-jogar${totalTurnos !== null ? '' : ' tt-btn-jogar--disabled'}`}
                disabled={totalTurnos === null} onClick={() => setShowDeckStart(true)}>{tt('jogar')}</button>
              {user && (
                <>
                  <button className="tt-btn-deck-builder" onClick={() => setShowDeckBuilder(true)}>
                    {'\uD83C\uDCCF'} {tt('deckBuilderBtn')}
                  </button>
                  <Link to="/perfil?aba=colecao" className="tt-link-album">{tt('menu_album')}</Link>
                </>
              )}
            </div>
          )}
        </>
        <BackToGamesBtn label={tt('menu_voltar_games')} />
      </div>

      {viewerIdx !== null && deckUsuario[viewerIdx] && (
        <CardViewerModal
          carta={deckUsuario[viewerIdx]}
          onClose={() => setViewerIdx(null)}
          onPrev={viewerIdx > 0 ? () => setViewerIdx(viewerIdx - 1) : null}
          onNext={viewerIdx < deckUsuario.length - 1 ? () => setViewerIdx(viewerIdx + 1) : null}
        />
      )}
      {showDeckBuilder && (
        <DeckBuilder
          userId={user?.id}
          deck={{ cartas: todasCartas }}
          deckIds={deckUsuario.map(c => c.id)}
          onSaved={() => setShowDeckBuilder(false)}
          onClose={() => setShowDeckBuilder(false)}
        />
      )}
      {showDeckStart && (
        <DeckStartModal
          userId={user?.id}
          deck={{ cartas: todasCartas }}
          totalTurnos={totalTurnos}
          deckIds={deckUsuario.map(c => c.id)}
          onConfirm={(ids) => { setShowDeckStart(false); onJogar(ids) }}
          onCancel={() => setShowDeckStart(false)}
        />
      )}
      {modalMultiplayerLocked && (
        <div className="tt-locked-overlay" onClick={() => setModalMultiplayerLocked(false)}>
          <div className="tt-locked-modal" onClick={e => e.stopPropagation()}>
            <h3 className="tt-locked-titulo">{tt('multiplayer_locked_titulo')}</h3>
            <p className="tt-locked-desc">{tt('multiplayer_locked_desc')}</p>
            <div className="tt-locked-actions">
              <Link to="/cadastro" className="tt-locked-btn tt-locked-btn--primary">{tt('multiplayer_locked_criar_conta')}</Link>
              <button className="tt-locked-btn" onClick={() => setModalMultiplayerLocked(false)}>{tt('cancelar')}</button>
            </div>
          </div>
        </div>
      )}
    </div></section>
  )
}
