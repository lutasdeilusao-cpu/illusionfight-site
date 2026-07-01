import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PALETTES, getFrase } from './palettes'
import { useLanguage } from '../../context/LanguageContext'
import './ResultCard.css'

export default function ResultCard({ open, onClose, game, title, subtitle, stats, context }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const [shareImg, setShareImg] = useState(null)
  const [copied, setCopied] = useState(false)

  const palette = PALETTES[game] || PALETTES.jack
  const frase = getFrase(game, context)
  const playerName = stats?.find(s => s.label === 'Jogador')?.value || ''

  // Draw card on canvas for sharing
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 600
    const H = 400
    canvas.width = W
    canvas.height = H

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, palette.bg)
    bgGrad.addColorStop(1, palette.bgGrad)
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Border accent line
    ctx.fillStyle = palette.border
    ctx.fillRect(0, 0, W, 4)

    // Logo
    ctx.font = `bold 22px ${palette.font}`
    ctx.fillStyle = palette.logoColor
    ctx.textAlign = 'center'
    ctx.fillText(palette.logo, W / 2, 55)

    // Tagline
    ctx.font = `12px ${palette.font}`
    ctx.fillStyle = palette.textDim
    ctx.fillText(palette.tagline, W / 2, 78)

    // Separator
    ctx.strokeStyle = palette.border
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    ctx.moveTo(40, 95)
    ctx.lineTo(W - 40, 95)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Title
    ctx.font = `bold 26px ${palette.font}`
    ctx.fillStyle = palette.accent
    ctx.fillText(title, W / 2, 130)

    // Subtitle
    if (subtitle) {
      ctx.font = `15px ${palette.font}`
      ctx.fillStyle = palette.text
      ctx.fillText(subtitle, W / 2, 160)
    }

    // Player
    if (playerName) {
      ctx.font = `13px ${palette.font}`
      ctx.fillStyle = palette.textDim
      ctx.fillText(playerName, W / 2, 188)
    }

    // Stats (table-style)
    const filtStats = (stats || []).filter(s => s.label !== 'Jogador')
    let statY = 220
    if (filtStats.length > 0) {
      const cols = Math.min(filtStats.length, 4)
      const colW = (W - 80) / cols
      const startX = 40
      filtStats.forEach((s, i) => {
        const cx = startX + (i % cols) * colW + colW / 2
        const row = Math.floor(i / cols)
        const y = statY + row * 70
        ctx.font = `bold 20px ${palette.font}`
        ctx.fillStyle = palette.accent
        ctx.fillText(s.value, cx, y)
        ctx.font = `10px ${palette.font}`
        ctx.fillStyle = palette.textDim
        ctx.fillText(s.label, cx, y + 22)
      })
      statY += Math.ceil(filtStats.length / cols) * 70
    }

    // Frase
    ctx.font = `italic 13px ${palette.font}`
    ctx.fillStyle = palette.accentDim
    ctx.fillText(`"${frase}"`, W / 2, H - 40)

    // URL
    ctx.font = `11px ${palette.font}`
    ctx.fillStyle = palette.textDim
    ctx.globalAlpha = 0.6
    ctx.fillText(palette.logoSub, W / 2, H - 16)
    ctx.globalAlpha = 1

    // Generate shareable image
    const img = canvas.toDataURL('image/png')
    setShareImg(img)
  }, [open, game, title, subtitle, stats, context])

  const handleShare = useCallback((platform) => {
    if (!shareImg) return
    const text = `${title} — ${palette.logo}\n${palette.logoSub}`
    const url = encodeURIComponent(window.location.origin + '/')

    if (platform === 'x') {
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${url}`, '_blank')
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.origin + '/')}`, '_blank')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } else if (platform === 'download') {
      const link = document.createElement('a')
      link.download = `resultado-${game}-${Date.now()}.png`
      link.href = shareImg
      link.click()
    }
  }, [shareImg, title, palette])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="resultcard-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="resultcard-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Canvas (hidden, used for image generation) */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Visual preview */}
            <div
              className="resultcard-preview"
              style={{
                fontFamily: palette.font,
                background: `linear-gradient(180deg, ${palette.bg} 0%, ${palette.bgGrad} 100%)`,
                border: `2px solid ${palette.border}22`,
                borderTop: `4px solid ${palette.border}`,
              }}
            >
              {/* Logo */}
              <div className="resultcard-logo" style={{ color: palette.logoColor }}>{palette.logo}</div>
              <div className="resultcard-tagline" style={{ color: palette.textDim }}>{palette.tagline}</div>
              <div className="resultcard-sep" style={{ borderColor: palette.border + '22' }} />

              {/* Title */}
              <div className="resultcard-title" style={{ color: palette.accent }}>{title}</div>
              {subtitle && <div className="resultcard-subtitle" style={{ color: palette.text }}>{subtitle}</div>}

              {/* Player */}
              {playerName && (
                <div className="resultcard-player" style={{ color: palette.textDim }}>{playerName}</div>
              )}

              {/* Stats */}
              {(stats || []).filter(s => s.label !== 'Jogador').length > 0 && (
                <div className="resultcard-stats">
                  {(stats || []).filter(s => s.label !== 'Jogador').map((s, i) => (
                    <div key={i} className="resultcard-stat">
                      <div className="resultcard-stat-value" style={{ color: palette.accent }}>{s.value}</div>
                      <div className="resultcard-stat-label" style={{ color: palette.textDim }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Frase */}
              <div className="resultcard-frase" style={{ color: palette.accentDim }}>"{frase}"</div>

              {/* URL */}
              <div className="resultcard-url" style={{ color: palette.textDim }}>{palette.logoSub}</div>
            </div>

            {/* Share buttons */}
            <div className="resultcard-actions">
              <button className="resultcard-btn resultcard-btn--x" onClick={() => handleShare('x')}>
                {t('resultcard.btn_x')}
              </button>
              <button className="resultcard-btn resultcard-btn--whatsapp" onClick={() => handleShare('whatsapp')}>
                {t('resultcard.btn_whatsapp')}
              </button>
              <button className="resultcard-btn resultcard-btn--download" onClick={() => handleShare('download')}>
                {t('resultcard.btn_download')}
              </button>
              <button className="resultcard-btn resultcard-btn--copy" onClick={() => handleShare('copy')}>
                {copied ? t('resultcard.copied') : t('resultcard.btn_copy')}
              </button>
            </div>

            <button className="resultcard-close" onClick={onClose} style={{ color: palette.textDim }}>
              {t('resultcard.fechar')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
