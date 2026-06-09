import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { sfx } from '../../../lib/sfx'
import { salvarDeckTipo, salvarNomeDeck, carregarDeckTipo, carregarNomeDeck } from '../hooks/useTopTrumpsDeck'
// Reuse card images
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
import './DeckBuilder.css'

const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}
function bgCarta(carta) { return CARD_IMAGES[carta?.id_num] || cardFallback }

const DECK_CONFIG = [
  { key: 'deck_5',  label: 'Deck 5',  size: 5 },
  { key: 'deck_10', label: 'Deck 10', size: 10 },
  { key: 'deck_15', label: 'Deck 15', size: 15 },
  { key: 'deck_20', label: 'Deck 20', size: 20 },
]

export default function DeckBuilder({ userId, deck, deckIds, onClose, onSaved }) {
  const { t, locale } = useLanguage()
  const [deckType, setDeckType] = useState('deck_5')
  const [selecionadas, setSelecionadas] = useState([])
  const [deckNome, setDeckNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const config = DECK_CONFIG.find(c => c.key === deckType)
  const cartasDisponiveis = deck.cartas.filter(c =>
    deckIds.some(id => {
      if (typeof id === 'number') return c.id_num === id
      return c.id === id
    })
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
    sfx.select()
    const id = carta.id_num || carta.id
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
    return deck.cartas.find(c => c.id_num === n) || deck.cartas.find(c => c.id === id)
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
          <h2 className="tt-deckbuilder-title">{t('games.toptrumps.deckBuilder.title')}</h2>

          {!temMinimo ? (
            <p className="tt-deckbuilder-min-msg">{t('games.toptrumps.deckBuilder.minCards')}</p>
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
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Deck name */}
              <input
                className="tt-deckbuilder-name-input"
                placeholder={locale === 'en' ? 'Deck name...' : locale === 'es' ? 'Nombre del deck...' : 'Nome do deck...'}
                value={deckNome}
                onChange={e => setDeckNome(e.target.value)}
                maxLength={30}
              />

              {/* Split layout */}
              <div className="tt-deckbuilder-split">
                {/* Collection side */}
                <div className="tt-deckbuilder-collection">
                  <h4 className="tt-deckbuilder-side-title">
                    {locale === 'en' ? 'Your Cards' : locale === 'es' ? 'Tus Cartas' : 'Suas Cartas'}
                  </h4>
                  <div className="tt-deckbuilder-grid">
                    {cartasDisponiveis.map(carta => {
                      const id = carta.id_num || carta.id
                      const jaTem = selecionadas.filter(s => s === id).length
                      const maxAtingido = selecionadas.length >= (config?.size || 5)
                      return (
                        <div
                          key={carta.id}
                          className={`tt-deckbuilder-card${maxAtingido && !jaTem ? ' tt-deckbuilder-card--disabled' : ''}`}
                          onClick={() => adicionar(carta)}
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
                    {config?.label || 'Deck'} — {selecionadas.length}/{config?.size || 5}
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
                  {t('games.toptrumps.deckBuilder.clear')}
                </button>
                <button
                  className={`tt-deckbuilder-btn tt-deckbuilder-btn--salvar${podeSalvar ? '' : ' tt-deckbuilder-btn--disabled'}`}
                  disabled={!podeSalvar || salvando}
                  onClick={handleSalvar}
                >
                  {salvando ? '...' : salvo ? '✓' : t('games.toptrumps.deckBuilder.save')}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
