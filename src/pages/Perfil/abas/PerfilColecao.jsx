import { useState, useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { getDeck } from '../../../lib/getDeck'
import { carregarDeck } from '../../../hooks/useTopTrumpsDB'
import DeckBuilder from '../../TopTrumps/components/DeckBuilder'
import CardViewerModal from '../../TopTrumps/components/CardViewerModal'
import cardFallback from '../../../assets/images/cards/characters/card-fallback.png'
import img01 from '../../../assets/images/cards/characters/card-01.png'
import img02 from '../../../assets/images/cards/characters/card-02.png'
import img03 from '../../../assets/images/cards/characters/card-03.png'
import img04 from '../../../assets/images/cards/characters/card-04.png'
import img05 from '../../../assets/images/cards/characters/card-05.png'
import img06 from '../../../assets/images/cards/characters/card-06.png'
import img07 from '../../../assets/images/cards/characters/card-07.png'
import img08 from '../../../assets/images/cards/characters/card-08.png'
import img09 from '../../../assets/images/cards/characters/card-09.png'
import img10 from '../../../assets/images/cards/characters/card-10.png'
import img11 from '../../../assets/images/cards/characters/card-11.png'
import img12 from '../../../assets/images/cards/characters/card-12.png'
import img13 from '../../../assets/images/cards/characters/card-13.png'
import img14 from '../../../assets/images/cards/characters/card-14.png'
import img15 from '../../../assets/images/cards/characters/card-15.png'
import img21 from '../../../assets/images/cards/characters/card-21.png'
import img23 from '../../../assets/images/cards/characters/card-23.png'

const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}

const SEASON_1_IDS = [
  'kim_briguento',       'jack_vitoria',        'nina_angel',
  'shuntaro_rei_xama',   'thunderbolt_trovao',
  'lisa_top500',         'yawanari_imortal',    'voidhunter_void',
  'kei_sombra_dupla',    'ryu_relampago_oriental',
  'xakaxi_cacique',      'nara_guerreira',      'kawa_traidor',
  'tawira_herdeiro',     'iara_curandeira',
  'david_kronos_primordial', 'vale_das_cinzas', 'kim_primordial_forma',
  'alan_o_campiao',      'nexus_phantasm'
]

export default function PerfilColecao({ userId }) {
  const { t, locale } = useLanguage()
  const deck = getDeck(locale)
  const [deckIds, setDeckIds] = useState([])
  const [temporada, setTemporada] = useState(1)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [viewerIdx, setViewerIdx] = useState(null)

  const todasCartas = deck.cartas.filter(c => SEASON_1_IDS.includes(c.id))

  function bgCarta(carta) {
    return CARD_IMAGES[carta?.id_num] || cardFallback
  }

  function temCarta(deckId, carta) {
    if (typeof deckId === 'number') return carta.id_num === deckId
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
