import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import { listarDecksCompletos } from '../hooks/useTopTrumpsDeck'
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
import './DeckStartModal.css'

const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}
function bgCarta(carta) { return CARD_IMAGES[carta?.id] || cardFallback }

export default function DeckStartModal({ userId, deck, totalTurnos, deckIds, onConfirm, onCancel }) {
  const { t, tt } = useLanguage()
  const [decksCompletos, setDecksCompletos] = useState({})
  const [escolha, setEscolha] = useState(null)

  const deckKey = `deck_${totalTurnos}`

  useEffect(() => {
    if (!userId) return
    listarDecksCompletos(userId).then(setDecksCompletos)
  }, [userId])

  const deckDisponivel = decksCompletos[deckKey]
  const getCarta = (id) => {
    const n = Number(id)
    return deck.cartas.find(c => c.id === n)
  }

  const handleConfirmar = () => {
    if (!escolha) return
    sfx.click()
    if (escolha === 'deck' && deckDisponivel) {
      // Dedup no deck salvo (deck antigo pode ter duplicatas)
      const unicas = [...new Set(deckDisponivel.cartas)]
      onConfirm(unicas)
    } else {
      // Random cards from collection â€” sem repetir
      const disponiveis = deckIds.filter(id => {
        const n = Number(id)
        return deck.cartas.some(c => c.id === n)
      })
      const unicas = [...new Set(disponiveis)]
      const embaralhadas = [...unicas].sort(() => Math.random() - 0.5)
      onConfirm(embaralhadas.slice(0, totalTurnos))
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="tt-startdeck-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="tt-startdeck-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="tt-startdeck-close" onClick={onCancel}>✕</button>
          <h2 className="tt-startdeck-title">{tt('deckStart.title')}</h2>

          <div className="tt-startdeck-opcoes">
            {/* Option A: use deck */}
            <div
              className={`tt-startdeck-opcao${escolha === 'deck' ? ' tt-startdeck-opcao--selected' : ''}${!deckDisponivel ? ' tt-startdeck-opcao--disabled' : ''}`}
              onClick={() => deckDisponivel && setEscolha('deck')}
            >
              <h3 className="tt-startdeck-opcao-titulo">
                {tt('deckStart.useDeck')}
              </h3>
              {deckDisponivel ? (
                <>
                  <p className="tt-startdeck-opcao-nome">{deckDisponivel.nome || `${tt('deckBuilder.title')} ${totalTurnos}`}</p>
                  <div className="tt-startdeck-preview">
                    {deckDisponivel.cartas.slice(0, 5).map((id, i) => {
                      const carta = getCarta(id)
                      return carta ? (
                        <img key={i} src={bgCarta(carta)} alt="" className="tt-startdeck-preview-img" />
                      ) : null
                    })}
                    {deckDisponivel.cartas.length > 5 && (
                      <span className="tt-startdeck-preview-mais">+{deckDisponivel.cartas.length - 5}</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="tt-startdeck-opcao-sem-deck">
                  {userId
                    ? tt('deckStart.semDeck')
                    : tt('deckStart.semDeckGuest')}
                </p>
              )}
            </div>

            {/* Option B: random cards */}
            <div
              className={`tt-startdeck-opcao${escolha === 'random' ? ' tt-startdeck-opcao--selected' : ''}`}
              onClick={() => setEscolha('random')}
            >
              <h3 className="tt-startdeck-opcao-titulo">{tt('deckStart.random')}</h3>
              <p className="tt-startdeck-opcao-desc">
                {tt('deckStart.cartasAleatorias', { n: totalTurnos })}
              </p>
            </div>
          </div>

          <div className="tt-startdeck-actions">
            <button className="tt-startdeck-btn tt-startdeck-btn--cancel" onClick={onCancel}>
              {tt('deckStart.cancel')}
            </button>
            <button
              className={`tt-startdeck-btn tt-startdeck-btn--confirm${!escolha ? ' tt-startdeck-btn--disabled' : ''}`}
              disabled={!escolha}
              onClick={handleConfirmar}
            >
              {tt('jogar')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
