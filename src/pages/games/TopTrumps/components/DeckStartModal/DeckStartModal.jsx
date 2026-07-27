import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { sfx } from '../../../../../lib/sfx'
import { listarDecksCompletos } from '../../hooks/deckPersistence'
import { getTopTrumpsCardImage as bgCarta } from '../../../../../lib/topTrumpsCardImages'
import './DeckStartModal.css'

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
      // Random cards from collection — sem repetir
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
