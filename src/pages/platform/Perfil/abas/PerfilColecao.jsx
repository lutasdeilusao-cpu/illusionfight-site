import { useState, useEffect } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getDeck } from '../../../../lib/getDeck'
import { carregarDeck } from '../../../../hooks/useLeaderboardDB'
import DeckBuilder from '../../../games/TopTrumps/components/DeckBuilder'
import CardViewerModal from '../../../games/TopTrumps/components/CardViewerModal'
import { getTopTrumpsCardImage as bgCarta } from '../../../../lib/topTrumpsCardImages'



export default function PerfilColecao({ userId }) {
  const { t, locale } = useLanguage()
  const deck = getDeck(locale)
  const [deckIds, setDeckIds] = useState([])
  const [temporada, setTemporada] = useState(1)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [viewerIdx, setViewerIdx] = useState(null)

  const todasCartas = deck.cartas

  function temCarta(deckId, carta) {
    return carta.id === deckId
  }

  useEffect(() => {
    if (!userId) return
    carregarDeck(userId).then(ids => {
      if (ids && ids.length > 0) {
        setDeckIds(ids)
      } else {
        const chave = `ldi-toptrumps-deck-${userId}`
        const salvos = JSON.parse(localStorage.getItem(chave) || '[]')
        setDeckIds(salvos.map(id => {
          const n = Number(id)
          return isNaN(n) ? id : n
        }))
      }
    })
  }, [userId])

  const obtidas = todasCartas.filter(c => deckIds.some(id => temCarta(id, c)))
  const progresso = todasCartas.length > 0 ? Math.round((obtidas.length / todasCartas.length) * 100) : 0

  // Textos multi-idioma
  const seasonLabel = t('site.perfil.colecao_season_1')
  const season2Label = t('site.perfil.colecao_season_2')
  const comingSoon = t('site.perfil.colecao_coming_soon')
  const obtained = t('site.perfil.colecao_obtidas')
  const missing = t('site.perfil.colecao_faltando')

  return (
    <div className="perfil-colecao">
      {/* Deck Builder Button — topo */}
      <div className="perfil-colecao-deckbuilder-top">
        <button
          className="perfil-colecao-deckbuilder-btn"
          onClick={() => setShowDeckBuilder(true)}
        >
          🃏 {t('games.toptrumps.deckBuilderBtn')}
        </button>
      </div>

      {/* Seletor de temporadas */}
      <div className="perfil-colecao-temporadas">
        <button
          className={`perfil-colecao-temp-btn${temporada === 1 ? ' perfil-colecao-temp-btn--ativa' : ''}`}
          onClick={() => setTemporada(1)}
        >
          <span className="perfil-colecao-temp-num">{seasonLabel}</span>
          <span className="perfil-colecao-temp-progresso">{obtidas.length}/{todasCartas.length} ({progresso}%)</span>
        </button>
        <button className="perfil-colecao-temp-btn perfil-colecao-temp-btn--breve">
          <span className="perfil-colecao-temp-num">{season2Label}</span>
          <span className="perfil-colecao-temp-breve-label">{comingSoon}</span>
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="perfil-colecao-bar-wrapper">
        <div className="perfil-colecao-bar">
          <div className="perfil-colecao-bar-fill" style={{ width: `${progresso}%` }} />
        </div>
        <span className="perfil-colecao-bar-texto">{obtidas.length} {obtained} · {todasCartas.length - obtidas.length} {missing}</span>
      </div>

      {/* Grid de cartas */}
      <div className="perfil-colecao-grid">
        {todasCartas.map((carta) => {
          const tem = deckIds.some(id => temCarta(id, carta))
          return (
            <div
              key={carta.id}
              className={`perfil-colecao-card${tem ? '' : ' perfil-colecao-card--falta'}`}
              onClick={() => {
                if (tem) {
                  const idx = todasCartas.findIndex(c => c.id === carta.id)
                  setViewerIdx(idx)
                }
              }}
            >
              <div
                className="perfil-colecao-card-img"
                style={{ backgroundImage: `url(${bgCarta(carta)})` }}
              >
                {!tem && <div className="perfil-colecao-card-bloqueio">?</div>}
              </div>
              <div className="perfil-colecao-card-info">
                <span className="perfil-colecao-card-nome">{tem ? carta.nome : '???'}</span>
                <span className="perfil-colecao-card-elemental">
                  {tem ? (carta.elemental || '—') : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <p className="perfil-colecao-obs">
        {t('site.perfil.colecao_obs')}
      </p>

      {/* Deck Builder Modal */}
      {/* Card Viewer Modal */}
      {viewerIdx !== null && (
        <CardViewerModal
          carta={todasCartas[viewerIdx]}
          cartas={todasCartas}
          deckIds={deckIds}
          idx={viewerIdx}
          onClose={() => setViewerIdx(null)}
          onPrev={viewerIdx > 0 ? () => setViewerIdx(viewerIdx - 1) : null}
          onNext={viewerIdx < todasCartas.length - 1 ? () => setViewerIdx(viewerIdx + 1) : null}
        />
      )}

      {showDeckBuilder && (
        <DeckBuilder
          userId={userId}
          deck={deck}
          deckIds={deckIds}
          onSaved={() => {
            setShowDeckBuilder(false)
            carregarDeck(userId).then(setDeckIds)
          }}
          onClose={() => setShowDeckBuilder(false)}
        />
      )}
    </div>
  )
}
