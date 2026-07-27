import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { sfx } from '../../../../../lib/sfx'
import { getTopTrumpsCardImage as bgCarta } from '../../../../../lib/topTrumpsCardImages'
import './CardViewerModal.css'

const ATTR_KEYS = ['rank_sdr', 'poder_mental', 'velocidade', 'resistencia', 'nivel_xama', 'fator_caos', 'energia_base', 'poder_explosivo']

export default function CardViewerModal({ carta, deckIds, cartas, idx, onClose, onPrev, onNext }) {
  const { t, tt, locale } = useLanguage()
  const tem = deckIds?.some(id => carta?.id === id)

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
      rank_sdr: tt('atributo_rank_sdr'),
      poder_mental: tt('atributo_poder_mental'),
      velocidade: tt('atributo_velocidade'),
      resistencia: tt('atributo_resistencia'),
      nivel_xama: tt('atributo_nivel_xama'),
      fator_caos: tt('atributo_fator_caos'),
      energia_base: tt('atributo_energia_base'),
      poder_explosivo: tt('atributo_poder_explosivo'),
    }
    return map[key] || key
  }

  const maxAtrib = ATTR_KEYS.reduce((acc, k) => {
    const v = carta.atributos?.[k]
    if (v !== undefined && (!acc[k] || v > acc[k])) acc[k] = v
    return acc
  }, {})

  const copias = deckIds?.filter(id => carta.id === id).length || 0

  const tierNomes = {
    free: tt('tier_free'),
    elite: tt('tier_elite'),
    primordial: tt('tier_primordial'),
    lendario: tt('tier_lendario'),
    sombra: tt('tier_sombra')
  }

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
                  {copias > 1 ? `${copias}x ` : ''}{tt('cardViewer.copies', { n: copias })}
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
                  <h4 className="tt-viewer-stats-title">{tt('cardViewer.stats')}</h4>
                  {ATTR_KEYS.map(k => {
                    const val = carta.atributos?.[k]
                    if (val === undefined) return null
                    const maxV = maxAtrib[k] || val
                    const pct = Math.round((val / maxV) * 100)
                    const isRankSdr = k === 'rank_sdr'
                    return (
                      <div key={k} className="tt-viewer-stat">
                        <span className="tt-viewer-stat-label">{attrNome(k)}</span>
                        <span className="tt-viewer-stat-val">{isRankSdr ? `#${val}` : val}</span>
                        <div className="tt-viewer-stat-bar">
                          <div
                            className="tt-viewer-stat-bar-fill"
                            ref={el => { if (el) el.style.width = `${isRankSdr ? Math.max(5, 100 - pct) : pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {!tem && (
                <p className="tt-viewer-locked-msg">{tt('cardViewer.locked')}</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
