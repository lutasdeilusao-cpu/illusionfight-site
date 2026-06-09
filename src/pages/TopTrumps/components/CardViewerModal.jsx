import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { sfx } from '../../../lib/sfx'
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
import './CardViewerModal.css'

const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}
function bgCarta(carta) { return CARD_IMAGES[carta?.id_num] || cardFallback }

const ATTR_KEYS = ['rank_sdr', 'poder_mental', 'velocidade', 'resistencia', 'nivel_xama', 'fator_caos', 'energia_base', 'poder_explosivo']

export default function CardViewerModal({ carta, deckIds, cartas, idx, onClose, onPrev, onNext }) {
  const { t, locale } = useLanguage()
  const tem = deckIds?.some(id => {
    if (typeof id === 'number') return carta?.id_num === id
    return carta?.id === id
  })

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && onPrev && idx > 0) { sfx.click(); onPrev() }
    if (e.key === 'ArrowRight' && onNext && idx < cartas.length - 1) { sfx.click(); onNext() }
  }, [onClose, onPrev, onNext, idx, cartas?.length])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Touch swipe
  let touchStartX = 0
  const handleTouchStart = (e) => { touchStartX = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0 && onNext && idx < cartas.length - 1) { sfx.click(); onNext() }
      if (diff < 0 && onPrev && idx > 0) { sfx.click(); onPrev() }
    }
  }

  if (!carta) return null

  const attrNome = (key) => {
    const map = {
      rank_sdr: t('games.toptrumps.atributo_rank_sdr'),
      poder_mental: t('games.toptrumps.atributo_poder_mental'),
      velocidade: t('games.toptrumps.atributo_velocidade'),
      resistencia: t('games.toptrumps.atributo_resistencia'),
      nivel_xama: t('games.toptrumps.atributo_nivel_xama'),
      fator_caos: t('games.toptrumps.atributo_fator_caos'),
      energia_base: t('games.toptrumps.atributo_energia_base'),
      poder_explosivo: t('games.toptrumps.atributo_poder_explosivo'),
    }
    return map[key] || key
  }

  const maxAtrib = ATTR_KEYS.reduce((acc, k) => {
    const v = carta.atributos?.[k]
    if (v !== undefined && (!acc[k] || v > acc[k])) acc[k] = v
    return acc
  }, {})

  const copias = deckIds?.filter(id => {
    if (typeof id === 'number') return carta.id_num === id
    return carta.id === id
  }).length || 0

  const tierNomes = { free: 'FREE', elite: 'ELITE', primordial: 'PRIMORDIAL', lendario: 'LENDÁRIO', sombra: 'SOMBRA' }

  return (
    <AnimatePresence>
      <motion.div
        className="tt-viewer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="tt-viewer-modal"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close + nav */}
          <button className="tt-viewer-close" onClick={onClose}>✕</button>
          {onPrev && idx > 0 && (
            <button className="tt-viewer-nav tt-viewer-nav--prev" onClick={() => { sfx.click(); onPrev() }}>‹</button>
          )}
          {onNext && idx < cartas.length - 1 && (
            <button className="tt-viewer-nav tt-viewer-nav--next" onClick={() => { sfx.click(); onNext() }}>›</button>
          )}

          <div className="tt-viewer-layout">
            {/* Card image */}
            <div className="tt-viewer-image-wrap">
              <img
                src={bgCarta(carta)}
                alt={carta.nome}
                className={`tt-viewer-image${!tem ? ' tt-viewer-image--locked' : ''}`}
              />
              {!tem && <div className="tt-viewer-locked-badge">🔒</div>}
            </div>

            {/* Info */}
            <div className="tt-viewer-info">
              <h2 className="tt-viewer-nome">{tem ? carta.nome : '???'}</h2>

              <div className="tt-viewer-meta">
                {tem && carta.tier && (
                  <span className={`tt-viewer-tier tt-viewer-tier--${carta.tier || 'free'}`}>
                    {tierNomes[carta.tier] || carta.tier}
                  </span>
                )}
                <span className="tt-viewer-copias">
                  {copias > 1 ? `${copias}x ` : ''}{t('games.toptrumps.cardViewer.copies', { n: copias })}
                </span>
              </div>

              {tem && carta.elemental && (
                <p className="tt-viewer-elemental">{carta.elemental}</p>
              )}

              {tem && carta.descricao && (
                <p className="tt-viewer-desc">{carta.descricao}</p>
              )}

              {tem && carta.frase_iconica && (
                <p className="tt-viewer-frase">"{carta.frase_iconica}"</p>
              )}

              {/* Stats */}
              {tem && (
                <div className="tt-viewer-stats">
                  <h4 className="tt-viewer-stats-title">{t('games.toptrumps.cardViewer.stats')}</h4>
                  {ATTR_KEYS.map(k => {
                    const val = carta.atributos?.[k]
                    if (val === undefined) return null
                    const maxV = maxAtrib[k] || val
                    const pct = Math.round((val / maxV) * 100)
                    const inverso = k === 'rank_sdr'
                    return (
                      <div key={k} className="tt-viewer-stat">
                        <span className="tt-viewer-stat-label">{attrNome(k)}</span>
                        <span className="tt-viewer-stat-val">{inverso ? `#${val}` : val}</span>
                        <div className="tt-viewer-stat-bar">
                          <div
                            className="tt-viewer-stat-bar-fill"
                            style={{ width: `${inverso ? Math.max(5, 100 - pct) : pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {!tem && (
                <p className="tt-viewer-locked-msg">{t('games.toptrumps.cardViewer.locked')}</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
