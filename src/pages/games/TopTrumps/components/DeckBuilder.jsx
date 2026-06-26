import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import { salvarDeckTipo, salvarNomeDeck, carregarDeckTipo, carregarNomeDeck } from '../hooks/useTopTrumpsDeck'
import TopTrumpsCard from '../../../../components/TopTrumpsCard/TopTrumpsCard'
// Reuse card images
import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
import img01 from '../../../../assets/images/cards/characters/card-01.png'
import img02 from '../../../../assets/images/cards/characters/card-02.png'
import img03 from '../../../../assets/images/cards/characters/card-03.png'
import img04 from '../../../../assets/images/cards/characters/card-04.png'
import img05 from '../../../../assets/images/cards/characters/card-05.png'
import img06 from '../../../../assets/images/cards/characters/card-06.png'
import img07 from '../../../../assets/images/cards/characters/card-07.png'
import img08 from '../../../../assets/images/cards/characters/card-08.png'
import img09 from '../../../../assets/images/cards/characters/card-09.png'
import img10 from '../../../../assets/images/cards/characters/card-10.png'
import img11 from '../../../../assets/images/cards/characters/card-11.png'
import img12 from '../../../../assets/images/cards/characters/card-12.png'
import img13 from '../../../../assets/images/cards/characters/card-13.png'
import img14 from '../../../../assets/images/cards/characters/card-14.png'
import img15 from '../../../../assets/images/cards/characters/card-15.png'
import img21 from '../../../../assets/images/cards/characters/card-21.png'
import img23 from '../../../../assets/images/cards/characters/card-23.png'
import './DeckBuilder.css'

const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}
function bgCarta(carta) { return CARD_IMAGES[carta?.id] || cardFallback }

const DECK_LABELS = { deck_5: '5', deck_10: '10', deck_15: '15', deck_20: '20' }
const DECK_CONFIG = [
  { key: 'deck_5',  labelKey: '5',  size: 5 },
  { key: 'deck_10', labelKey: '10', size: 10 },
  { key: 'deck_15', labelKey: '15', size: 15 },
  { key: 'deck_20', labelKey: '20', size: 20 },
]

export default function DeckBuilder({ userId, deck, deckIds, onClose, onSaved }) {
  const { t, tt, locale } = useLanguage()
  const [deckType, setDeckType] = useState('deck_5')
  const [selecionadas, setSelecionadas] = useState([])
  const [deckNome, setDeckNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [viewingCard, setViewingCard] = useState(null)

  const config = DECK_CONFIG.find(c => c.key === deckType)
  const cartasDisponiveis = deck.cartas.filter(c =>
    deckIds.some(id => c.id === id)
  )

  useEffect(() => {
    if (!userId) return
    carregarDeckTipo(userId, deckType).then(ids => {
      setSelecionadas(ids)
    })
    carregarNomeDeck(userId, deckType).then(n => setDeckNome(n))
  }, [userId, deckType])

  const podeSalvar = selecionadas.length === (config?.size || 5)
  const temMinimo = cartasDisponiveis.length >= 6

  const adicionar = (carta) => {
    if (selecionadas.length >= (config?.size || 5)) return
                      const id = carta.id
    // NÃ£o permite adicionar a mesma carta duas vezes no mesmo deck
    if (selecionadas.includes(id)) return
    sfx.select()
    setSelecionadas(p => [...p, id])
    setSalvo(false)
  }

  const remover = (idx) => {
    sfx.cancel()
    setSelecionadas(p => p.filter((_, i) => i !== idx))
    setSalvo(false)
  }

  const handleSalvar = async () => {
    if (!podeSalvar || !userId) return
    sfx.click()
    setSalvando(true)
    await salvarNomeDeck(userId, deckType, deckNome)
    await salvarDeckTipo(userId, deckType, selecionadas)
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
    if (onSaved) onSaved()
  }

  const handleLimpar = () => {
    sfx.click()
    setSelecionadas([])
    setDeckNome('')
    setSalvo(false)
  }

  // Get card details by id
  const getCarta = (id) => {
    const n = Number(id)
    return deck.cartas.find(c => c.id === n)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="tt-deckbuilder-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="tt-deckbuilder-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="tt-deckbuilder-close" onClick={onClose}>✕</button>
          <h2 className="tt-deckbuilder-title">{tt('deckBuilder.title')}</h2>

          {!temMinimo ? (
            <p className="tt-deckbuilder-min-msg">{tt('deckBuilder.minCards')}</p>
          ) : (
            <>
              {/* Deck type tabs */}
              <div className="tt-deckbuilder-tabs">
                {DECK_CONFIG.map(c => (
                  <button
                    key={c.key}
                    className={`tt-deckbuilder-tab${deckType === c.key ? ' tt-deckbuilder-tab--ativa' : ''}`}
                    onClick={() => { sfx.click(); setDeckType(c.key) }}
                  >
                    {c.labelKey}
                  </button>
                ))}
              </div>

              {/* Deck name */}
              <input
                className="tt-deckbuilder-name-input"
                placeholder={tt('deckBuilder.deckNamePlaceholder')}
                value={deckNome}
                onChange={e => setDeckNome(e.target.value)}
                maxLength={30}
              />

              {/* Split layout */}
              <div className="tt-deckbuilder-split">
                {/* Collection side */}
                <div className="tt-deckbuilder-collection">
                  <h4 className="tt-deckbuilder-side-title">
                    {tt('deckBuilder.yourCards')}
                  </h4>
                  <div className="tt-deckbuilder-grid">
                    {cartasDisponiveis.map(carta => {
    const id = carta.id
                      const jaTem = selecionadas.filter(s => s === id).length
                      const maxAtingido = selecionadas.length >= (config?.size || 5)
                      return (
                        <div
                          key={carta.id}
                          className={`tt-deckbuilder-card${maxAtingido && !jaTem ? ' tt-deckbuilder-card--disabled' : ''}`}
                          onClick={() => { sfx.click(); setViewingCard(carta) }}
                        >
                          <img src={bgCarta(carta)} alt={carta.nome} className="tt-deckbuilder-card-img" />
                          <span className="tt-deckbuilder-card-nome">{carta.nome}</span>
                          {jaTem > 0 && <span className="tt-deckbuilder-card-qtd">x{jaTem}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Deck slots side */}
                <div className="tt-deckbuilder-slots">
                  <h4 className="tt-deckbuilder-side-title">
                    {config?.labelKey || 'â€”'} â€” {selecionadas.length}/{config?.size || 5}
                  </h4>
                  <div className="tt-deckbuilder-slots-grid">
                    {Array.from({ length: config?.size || 5 }).map((_, i) => {
                      const cartaId = selecionadas[i]
                      const carta = cartaId ? getCarta(cartaId) : null
                      return (
                        <div
                          key={i}
                          className={`tt-deckbuilder-slot${carta ? ' tt-deckbuilder-slot--preenchido' : ''}`}
                          onClick={() => carta && remover(i)}
                        >
                          {carta ? (
                            <>
                              <img src={bgCarta(carta)} alt={carta.nome} className="tt-deckbuilder-slot-img" />
                              <span className="tt-deckbuilder-slot-nome">{carta.nome}</span>
                            </>
                          ) : (
                            <span className="tt-deckbuilder-slot-vazio">{i + 1}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="tt-deckbuilder-actions">
                <button className="tt-deckbuilder-btn tt-deckbuilder-btn--limpar" onClick={handleLimpar}>
                  {tt('deckBuilder.clear')}
                </button>
                <button
                  className={`tt-deckbuilder-btn tt-deckbuilder-btn--salvar${podeSalvar ? '' : ' tt-deckbuilder-btn--disabled'}`}
                  disabled={!podeSalvar || salvando}
                  onClick={handleSalvar}
                >
                  {salvando ? '...' : salvo ? '✓' : tt('deckBuilder.save')}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
      {/* Card Viewer Modal */}
      {viewingCard && (
        <AnimatePresence>
          <motion.div
            className="tt-deckbuilder-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingCard(null)}
          >
            <motion.div
              className="tt-deckbuilder-viewer-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="tt-deckbuilder-close" onClick={() => setViewingCard(null)}>✕</button>

              <div className="tt-deckbuilder-viewer-layout">
                {/* Card render (exactly like in-game but not clickable) */}
                <div className="tt-deckbuilder-viewer-card">
                  <TopTrumpsCard
                    characterImage={bgCarta(viewingCard)}
                    name={viewingCard.nome}
                    description={viewingCard.descricao}
                    locale={locale}
                    attributes={viewingCard.atributos}
                    templateIndex={0}
                  />
                </div>

                {/* Info + actions */}
                <div className="tt-deckbuilder-viewer-info">
                  <h3 className="tt-deckbuilder-viewer-nome">{viewingCard.nome}</h3>
                  {viewingCard.tier && (
                    <span className={`tt-deckbuilder-viewer-tier tt-viewer-tier--${viewingCard.tier}`}>
                      {(viewingCard.tier || 'free').toUpperCase()}
                    </span>
                  )}
                  {viewingCard.elemental && (
                    <p className="tt-deckbuilder-viewer-elemental">{viewingCard.elemental}</p>
                  )}
                  {viewingCard.descricao && (
                    <p className="tt-deckbuilder-viewer-desc">{viewingCard.descricao}</p>
                  )}
                  {viewingCard.frase_iconica && (
                    <p className="tt-deckbuilder-viewer-frase">"{viewingCard.frase_iconica}"</p>
                  )}

                  {/* Atributos em lista compacta */}
                  <div className="tt-deckbuilder-viewer-stats">
                    {Object.entries(viewingCard.atributos || {}).map(([k, v]) => {
                      const isRankSdr = k === 'rank_sdr'
                      return (
                        <div key={k} className="tt-deckbuilder-viewer-stat">
                          <span className="tt-deckbuilder-viewer-stat-label">
                            {{
                              rank_sdr: tt('atributo_rank_sdr'),
                              poder_mental: tt('atributo_poder_mental'),
                              velocidade: tt('atributo_velocidade'),
                              resistencia: tt('atributo_resistencia'),
                              nivel_xama: tt('atributo_nivel_xama'),
                              fator_caos: tt('atributo_fator_caos'),
                              energia_base: tt('atributo_energia_base'),
                              poder_explosivo: tt('atributo_poder_explosivo'),
                            }[k] || k}
                          </span>
                          <span className="tt-deckbuilder-viewer-stat-val">{isRankSdr ? `#${v}` : v}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  <div className="tt-deckbuilder-viewer-actions">
                    {(() => {
                      const cardId = viewingCard.id
                      const jaEsta = selecionadas.filter(s => s === cardId).length
                      const podeAdd = selecionadas.length < (config?.size || 5) && jaEsta === 0
                      return (
                        <>
                          {podeAdd && (
                            <button
                              className="tt-deckbuilder-viewer-btn tt-deckbuilder-viewer-btn--add"
                              onClick={() => { adicionar(viewingCard); setViewingCard(null) }}
                            >
                              + {tt('deckBuilder.add')}
                            </button>
                          )}
                          {jaEsta > 0 && (
                            <button
                              className="tt-deckbuilder-viewer-btn tt-deckbuilder-viewer-btn--remove"
                              onClick={() => {
                                const cardId2 = viewingCard.id
                                const idx = selecionadas.findLastIndex(s => s === cardId2)
                                if (idx >= 0) remover(idx)
                                setViewingCard(null)
                              }}
                            >
                              - {tt('deckBuilder.remove')}
                            </button>
                          )}
                        </>
                      )
                    })()}
                    <button
                      className="tt-deckbuilder-viewer-btn tt-deckbuilder-viewer-btn--back"
                      onClick={() => setViewingCard(null)}
                    >
                      {tt('deckBuilder.back')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}    </AnimatePresence>
  )
}
