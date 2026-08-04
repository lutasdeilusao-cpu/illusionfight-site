import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import neoGuidePortrait from '../assets/neoguide-frontal.png'

const TYPE_SPEED = 22

export default function NeoGuideDialog({ lines = [], onFinish, onSkip }) {
  const { t } = useLanguage()
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [typing, setTyping] = useState(true)
  const line = lines[lineIndex] || ''
  const isLast = lineIndex + 1 >= lines.length

  useEffect(() => { setCharIndex(0); setTyping(true) }, [lineIndex])

  useEffect(() => {
    if (!typing || charIndex >= line.length) { if (charIndex >= line.length) setTyping(false); return }
    const timer = setTimeout(() => setCharIndex(i => i + 1), TYPE_SPEED)
    return () => clearTimeout(timer)
  }, [charIndex, typing, line])

  const advance = useCallback(() => {
    sfx.click()
    if (typing) { setCharIndex(line.length); setTyping(false); return }
    if (isLast) { onFinish?.(); return }
    setLineIndex(i => i + 1)
  }, [typing, line, isLast, onFinish])

  const skip = useCallback((event) => {
    event.stopPropagation()
    sfx.click()
    onSkip?.()
  }, [onSkip])

  if (!lines.length) return null

  return (
    <motion.div className="neoguide-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={advance}>
      <button className="neoguide-skip" onClick={skip}>{t('games.gangues.neoguide.pular')} ✕</button>

      <div className="neoguide-portrait-frame">
        <motion.img
          src={neoGuidePortrait} alt="NeoGuide" className="neoguide-portrait"
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.175, 0.885, 0.32, 1.275] }}
        />
      </div>

      <motion.div
        className="neoguide-box" onClick={event => event.stopPropagation()}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
      >
        <span className="neoguide-name">NEOGUIDE</span>
        <p className="neoguide-text" onClick={advance}>
          {line.slice(0, charIndex)}
          {typing && <motion.span className="neoguide-cursor" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}>▌</motion.span>}
        </p>
        <div className="neoguide-footer">
          <span className="neoguide-dots">{lines.map((_, index) => <i key={index} className={index === lineIndex ? 'neoguide-dot neoguide-dot--active' : 'neoguide-dot'} />)}</span>
          <button className="neoguide-next" onClick={advance}>
            {typing ? '▸▸' : isLast ? t('games.gangues.neoguide.comecar') : t('games.gangues.neoguide.proximo')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
