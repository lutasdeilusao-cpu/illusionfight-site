import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROSTER, construirPersonagem } from '../data/roster'

const EMOJI_CLASSE = { karuak: '🛡️', moraki: '🌪️', tivara: '🏹' }
const ELEM_CORES = {
  fogo: '#FF4500', agua: '#1E90FF', terra: '#8B4513', vento: '#87CEEB',
  eletrico: '#FFD700', trevas: '#9932CC',
}

export default function TeamSelect({ isAdmin, onConfirm }) {
  const [cards, setCards] = useState(() =>
    ROSTER.map(r => ({ ...r, selecionado: false }))
  )
  const [scrollX, setScrollX] = useState(0)
  const [detailChar, setDetailChar] = useState(null)
  const dragStartX = useRef(0)
  const dragOffset = useRef(0)
  const isDragging = useRef(false)

  const selecionados = cards.filter(c => c.selecionado)
  const podeConfirmar = selecionados.length >= 2

  const toggleSelect = (id) => {
    if (isAdmin) {
      setCards(prev => prev.map(c =>
        c.id === id ? { ...c, selecionado: !c.selecionado } : c
      ))
    }
  }

  const handleCardClick = (char) => {
    setDetailChar(char)
  }

  // Touch handlers for carrossel
  const handleTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX
    isDragging.current = false
  }
  const handleTouchMove = (e) => {
    const dx = e.touches[0].clientX - dragStartX.current
    if (Math.abs(dx) > 5) isDragging.current = true
    dragOffset.current = dx
  }
  const handleTouchEnd = () => {
    if (Math.abs(dragOffset.current) > 60) {
      setScrollX(s => s - Math.sign(dragOffset.current) * 280)
    }
    dragOffset.current = 0
  }

  // Scroll via seta
  const scroll = (dir) => setScrollX(s => s + dir * 280)

  return (
    <div className="tatics-select">
      {/* Background */}
      <div className="tatics-intro-bg" />
      <div className="tatics-intro-scanlines" />
      <div className="tatics-intro-vignette" />

      {/* Header */}
      <div className="tatics-select-header">
        <div className="tatics-select-title">
          <span className="tatics-select-title-ldi">LDI</span>
          <span className="tatics-select-title-tatics">TATICS</span>
        </div>
        <div className="tatics-select-subtitle">
          {isAdmin ? 'SELECIONE SEU TIME' : 'SEUS PERSONAGENS'}
        </div>
        {!isAdmin && (
          <div className="tatics-select-info">
            2 personagens foram atribuídos à sua conta
          </div>
        )}
      </div>

      {/* Carrossel */}
      <div className="tatics-select-carrossel-area">
        {isAdmin && (
          <button className="tatics-select-seta tatics-select-seta-esq" onClick={() => scroll(1)}>◀</button>
        )}
        <div className="tatics-select-carrossel-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="tatics-select-carrossel" style={{
            transform: `translateX(${scrollX}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}>
            {cards.map(char => {
              const corElem = ELEM_CORES[char.elemental] || '#00B4D8'
              const selected = char.selecionado
              return (
                <motion.div
                  key={char.id}
                  layout
                  className={`tatics-select-card ${selected ? 'card-selecionado' : ''}`}
                  style={{
                    '--cor-elem': corElem,
                    borderColor: selected ? corElem : 'rgba(255,255,255,0.06)',
                    boxShadow: selected ? `0 0 20px ${corElem}33` : 'none',
                  }}
                  onClick={() => {
                    if (!isDragging.current) handleCardClick(char)
                  }}
                >
                  <div className="tatics-select-card-emoji">{EMOJI_CLASSE[char.classe] || '⚔️'}</div>
                  <div className="tatics-select-card-nome">{char.nome}</div>
                  <div className="tatics-select-card-classe">{char.classe.toUpperCase()}</div>
                  <div className="tatics-select-card-elem" style={{ color: corElem }}>
                    {char.elemental.toUpperCase()}
                  </div>
                  {isAdmin && (
                    <div className={`tatics-select-card-check ${selected ? 'check-ativo' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleSelect(char.id) }}
                      style={{ borderColor: selected ? corElem : '#333' }}
                    >
                      {selected ? '✓' : '+'}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
        {isAdmin && (
          <button className="tatics-select-seta tatics-select-seta-dir" onClick={() => scroll(-1)}>▶</button>
        )}
      </div>

      {/* Selected bar */}
      {isAdmin && (
        <div className="tatics-select-selecionados">
          <div className="tatics-select-selecionados-label">
            SELECIONADOS ({selecionados.length}/6)
          </div>
          <div className="tatics-select-selecionados-list">
            {selecionados.map(c => (
              <div key={c.id} className="tatics-select-sel-chip" style={{ '--cor-elem': ELEM_CORES[c.elemental] || '#00B4D8' }}>
                {EMOJI_CLASSE[c.classe] || '⚔️'} {c.nome}
              </div>
            ))}
            {selecionados.length === 0 && (
              <div className="tatics-select-sel-empty">Clique nos cards para selecionar</div>
            )}
          </div>
        </div>
      )}

      {/* Confirm button */}
      <motion.button
        className="tatics-select-confirm"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const ids = isAdmin ? selecionados.map(c => c.id) : []
          onConfirm(ids)
        }}
        disabled={!podeConfirmar && isAdmin}
        style={{
          opacity: podeConfirmar || !isAdmin ? 1 : 0.4,
        }}
      >
        {isAdmin ? `BATALHAR COM ${selecionados.length} PERSONAGENS` : 'IR PARA BATALHA'}
      </motion.button>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tatics-detail-overlay"
            onClick={() => setDetailChar(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="tatics-detail-modal"
              onClick={e => e.stopPropagation()}
            >
              <button className="tatics-detail-close" onClick={() => setDetailChar(null)}>✕</button>

              <div className="tatics-detail-token" style={{
                background: `radial-gradient(circle at 35% 35%, ${ELEM_CORES[detailChar.elemental]}55, #111)`,
                borderColor: ELEM_CORES[detailChar.elemental] || '#00B4D8',
                boxShadow: `0 0 30px ${ELEM_CORES[detailChar.elemental] || '#00B4D8'}33`,
              }}>
                {EMOJI_CLASSE[detailChar.classe] || '⚔️'}
              </div>

              <div className="tatics-detail-nome">{detailChar.nome}</div>
              <div className="tatics-detail-classe" style={{ color: ELEM_CORES[detailChar.elemental] || '#00B4D8' }}>
                {detailChar.classe.toUpperCase()} · {detailChar.elemental.toUpperCase()}
              </div>

              {/* Stats */}
              <div className="tatics-detail-stats">
                {Object.entries(detailChar.atributos).map(([k, v]) => (
                  <div key={k} className="tatics-detail-stat">
                    <div className="tatics-detail-stat-label">{k.toUpperCase()}</div>
                    <div className="tatics-detail-stat-bar">
                      <div className="tatics-detail-stat-fill" style={{
                        width: `${(v / 20) * 100}%`,
                        background: `linear-gradient(90deg, ${ELEM_CORES[detailChar.elemental] || '#00B4D8'}, ${ELEM_CORES[detailChar.elemental] || '#00B4D8'}66)`,
                      }} />
                    </div>
                    <div className="tatics-detail-stat-val">{v}</div>
                  </div>
                ))}
              </div>

              {/* Derived stats */}
              <div className="tatics-detail-derived">
                <span>❤️ HP: {30 + detailChar.atributos.resistencia * 3}</span>
                <span>⚡ MP: {10 + detailChar.atributos.energia}</span>
              </div>

              {isAdmin && (
                <motion.button
                  className="tatics-detail-select-btn"
                  whileTap={{ scale: 0.95 }}
                  style={{ '--cor-elem': ELEM_CORES[detailChar.elemental] || '#00B4D8' }}
                  onClick={() => { toggleSelect(detailChar.id); setDetailChar(null) }}
                >
                  {cards.find(c => c.id === detailChar.id)?.selecionado ? 'REMOVER DO TIME' : 'ADICIONAR AO TIME'}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
